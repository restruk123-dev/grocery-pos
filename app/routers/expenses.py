from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from ..database import get_session
from ..models import Expense, ExpenseCategory, Product, User, UserRole
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/expenses", tags=["Operational Expenses & Spoilage"])

class ExpenseCreate(BaseModel):
    category: ExpenseCategory
    amount: Optional[float] = Field(default=None, ge=0)
    description: str
    product_id: Optional[int] = None
    spoilage_quantity: Optional[float] = None
    expense_date: Optional[datetime] = None

class ExpenseResponse(BaseModel):
    id: int
    category: ExpenseCategory
    amount: float
    description: str
    product_id: Optional[int]
    product_name: Optional[str] = None
    spoilage_quantity: Optional[float]
    expense_date: datetime
    created_at: datetime
    created_by_name: Optional[str] = None

@router.get("", response_model=List[ExpenseResponse])
def list_expenses(
    category: Optional[ExpenseCategory] = Query(None),
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    now_utc = datetime.now(timezone.utc)
    since_date = now_utc - timedelta(days=days)
    query = select(Expense).where(Expense.expense_date >= since_date)
    if category:
        query = query.where(Expense.category == category)

    expenses = session.exec(query.order_by(Expense.expense_date.desc())).all()
    results = []
    for exp in expenses:
        prod = session.get(Product, exp.product_id) if exp.product_id else None
        creator = session.get(User, exp.created_by_user_id) if exp.created_by_user_id else None
        results.append(ExpenseResponse(
            id=exp.id,
            category=exp.category,
            amount=exp.amount,
            description=exp.description,
            product_id=exp.product_id,
            product_name=prod.name if prod else None,
            spoilage_quantity=exp.spoilage_quantity,
            expense_date=exp.expense_date,
            created_at=exp.created_at,
            created_by_name=creator.full_name if creator else "Система"
        ))
    return results

@router.post("", response_model=ExpenseResponse)
def create_expense(
    data: ExpenseCreate,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    amount = data.amount
    prod_name = None
    now_utc = datetime.now(timezone.utc)

    # Handle spoilage / списание порчи товара
    if data.category == ExpenseCategory.SPOILAGE:
        if not data.product_id or not data.spoilage_quantity or data.spoilage_quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Для списания товара необходимо указать product_id и положительное количество spoilage_quantity"
            )
        product = session.get(Product, data.product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Товар для списания не найден")

        # Deduct spoiled stock from inventory
        product.stock_quantity = round(product.stock_quantity - data.spoilage_quantity, 3)
        product.updated_at = now_utc
        session.add(product)
        prod_name = product.name

        # If amount not explicitly given, compute loss by purchase cost
        if amount is None or amount == 0:
            amount = round(product.purchase_price * data.spoilage_quantity, 2)

    if amount is None or amount <= 0:
        raise HTTPException(status_code=400, detail="Сумма расхода должна быть больше 0")

    expense = Expense(
        category=data.category,
        amount=round(amount, 2),
        description=data.description.strip(),
        product_id=data.product_id,
        spoilage_quantity=data.spoilage_quantity,
        expense_date=data.expense_date or now_utc,
        created_by_user_id=current_user.id,
        created_at=now_utc
    )
    session.add(expense)
    session.commit()
    session.refresh(expense)

    return ExpenseResponse(
        id=expense.id,
        category=expense.category,
        amount=expense.amount,
        description=expense.description,
        product_id=expense.product_id,
        product_name=prod_name,
        spoilage_quantity=expense.spoilage_quantity,
        expense_date=expense.expense_date,
        created_at=expense.created_at,
        created_by_name=current_user.full_name
    )


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    exp = session.get(Expense, expense_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Xarajat topilmadi / Расход не найден")
    session.delete(exp)
    session.commit()
    return {"status": "ok", "message": "Xarajat o'chirildi / Расход удален"}

@router.get("/categories", response_model=List[str])
def get_expense_categories():
    return [c.value for c in ExpenseCategory]


# ── Price Tag & Barcode Generator ────────────────────────────────────────

class PriceTagCreate(BaseModel):
    product_id: int = Field(..., ge=0, description="Product ID / ID товара")
    price: float = Field(..., ge=0, description="Price in sum / Цена в сумах")
    quantity: float = Field(default=1.0, ge=0, description="Quantity / Количество")


class PriceTagResponse(BaseModel):
    id: str
    product_id: int
    product_name: str
    barcode: str
    price: float
    quantity: float
    total: float
    template: str  # HTML template for printing


class PriceTagBatchCreate(BaseModel):
    products: List[PriceTagCreate]


@router.post("/price-tag", response_model=PriceTagResponse)
def generate_price_tag(
    data: PriceTagCreate,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Generate a price tag label for A4 printer (Owner only)."""
    product = session.get(Product, data.product_id)
    if not product or not product.is_active:
        raise HTTPException(
            status_code=404,
            detail="Mahsulot topilmadi / Товар не найден"
        )
    
    # Use EAN-13 barcode format (product barcode or generate from product ID)
    barcode = product.barcode if product.barcode else f"48{data.product_id:012d}"
    
    total = round(data.price * data.quantity, 2)
    
    # Generate HTML template for A4 price tag printing
    template = f"""
    <!DOCTYPE html>
    <html lang="uz">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Price Tag - {product.name}</title>
        <style>
            @page {
                size: A4;
                margin: 20mm 15mm;
            }
            body {
                font-family: system-ui, sans-serif;
                font-size: 11pt;
                line-height: 1.3;
                padding: 0;
                margin: 0;
            }
            .price-tag {
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 10px;
                margin-bottom: 15px;
                width: 190mm;
                min-height: 50mm;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                background: white;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            .barcode-section {
                width: 100%;
                height: 30mm;
                background: #f8f9fa;
                margin: 5px 0;
                position: relative;
            }
            .barcode {
                width: 100%;
                height: 25mm;
                font-size: 1;
                text-align: center;
                line-height: 1;
            }
            .product-name {
                font-weight: bold;
                font-size: 12pt;
                margin: 5px 0;
                text-align: center;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .product-code {
                font-size: 9pt;
                color: #6c757d;
                text-align: center;
                margin: 2px 0;
            }
            .price-section {
                border-top: 1px solid #dee2e6;
                padding-top: 8px;
                margin-top: 5px;
                display: flex;
                justify-content: space-between;
                align-items: baseline;
            }
            .price-amount {
                font-weight: bold;
                font-size: 14pt;
                color: #28a745;
            }
            .price-currency {
                font-size: 9pt;
                color: #6c757d;
            }
            .notes {
                font-size: 8pt;
                color: #868e9f;
                margin-top: 3px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="price-tag">
            <div class="barcode-section">
                <div class="barcode">{barcode}</div>
                <div class="product-code">{barcode}</div>
            </div>
            <div class="product-name">{product.name[:40]}</div>
            <div class="product-code">Код: {barcode}</div>
            <div class="price-section">
                <span class="price-amount">{data.price:,.0f}</span>
                <span class="price-currency">сум</span>
            </div>
            <div class="notes">
                {product.unit} • {data.quantity} dona
            </div>
        </div>
    </body>
    </html>
    """
    
    return PriceTagResponse(
        id=str(product.id),
        product_id=product.id,
        product_name=product.name,
        barcode=barcode,
        price=data.price,
        quantity=data.quantity,
        total=total,
        template=template
    )


@router.post("/price-tags/batch", response_model=dict)
def generate_batch_price_tags(
    data: PriceTagBatchCreate,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Generate price tags for multiple products (Owner only)."""
    from pydantic import BaseModel
    from typing import List
    
    class ProductPriceData(BaseModel):
        product_id: int
        price: float
        quantity: float = 1.0
    
    tags = []
    for item in data.products:
        product = session.get(Product, item.product_id)
        if product and product.is_active:
            barcode = product.barcode if product.barcode else f"48{item.product_id:012d}"
            total = round(item.price * item.quantity, 2)
            template = f"""
            <!DOCTYPE html>
            <html lang="uz">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Price Tag - {product.name}</title>
                <style>
                    @page { size: A4; margin: 20mm 15mm; }
                    body {{ font-family: system-ui, sans-serif; font-size: 11pt; line-height: 1.3; padding: 0; margin: 0; }}
                    .price-tag {{ border: 1px solid #dee2e6; border-radius: 4px; padding: 10px; margin-bottom: 15px; width: 190mm; min-height: 50mm; box-shadow: 0 2px 4px rgba(0,0,0,0.1); background: white; display: flex; flex-direction: column; justify-content: space-between; }}
                    .barcode-section {{ width: 100%; height: 30mm; background: #f8f9fa; margin: 5px 0; position: relative; }}
                    .barcode {{ width: 100%; height: 25mm; font-size: 1; text-align: center; line-height: 1; }}
                    .product-name {{ font-weight: bold; font-size: 12pt; margin: 5px 0; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }}
                    .product-code {{ font-size: 9pt; color: #6c757d; text-align: center; margin: 2px 0; }}
                    .price-section {{ border-top: 1px solid #dee2e6; padding-top: 8px; margin-top: 5px; display: flex; justify-content: space-between; align-items: baseline; }}
                    .price-amount {{ font-weight: bold; font-size: 14pt; color: #28a745; }}
                    .price-currency {{ font-size: 9pt; color: #6c757d; }}
                    .notes {{ font-size: 8pt; color: #868e9f; margin-top: 3px; text-align: center; }}
                </style>
            </head>
            <body>
                <div class="price-tag">
                    <div class="barcode-section">
                        <div class="barcode">{barcode}</div>
                        <div class="product-code">{barcode}</div>
                    </div>
                    <div class="product-name">{product.name[:40]}</div>
                    <div class="product-code">Код: {barcode}</div>
                    <div class="price-section">
                        <span class="price-amount">{item.price:,.0f}</span>
                        <span class="price-currency">сум</span>
                    </div>
                    <div class="notes">{product.unit} • {item.quantity} dona</div>
                </div>
            </body>
            </html>
            """
            tags.append({
                "product_id": product.id,
                "product_name": product.name,
                "barcode": barcode,
                "price": item.price,
                "quantity": item.quantity,
                "total": total,
                "template": template
            })
    
    return {
        "status": "generated",
        "tags_count": len(tags),
        "message": f"{len(tags)} ta fiyatnoma generatsiyalandi / {len(tags)} ценовых меток сгенерировано"
    }
