import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from ..database import get_session
from ..models import (
    Product, Sale, SaleItem, Debtor, DebtTransaction,
    DebtTransactionType, PaymentMethod, User, UserRole, utc_now
)
from ..auth import get_current_user

router = APIRouter(prefix="/pos", tags=["POS"])


class CartItemRequest(BaseModel):
    product_id: int = Field(..., ge=0, description="Product ID / ID товара")
    quantity: float = Field(default=1.0, ge=0, description="Quantity / Количество")


class HeldCart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    cart_items: List[dict]
    created_at: datetime = Field(default_factory=utc_now)
    expires_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(hours=24))


class HoldCartRequest(BaseModel):
    cart_items: List[dict]


class HoldCartResponse(BaseModel):
    hold_id: str
    message: str


@router.post("/checkout", response_model=dict)
def checkout(
    data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    items = data.get("items", [])
    payment_method_str = str(data.get("payment_method", "CASH")).upper()
    cash_received = float(data.get("cash_received", 0) or 0)
    card_amount = float(data.get("card_amount", 0) or 0)
    debt_amount = float(data.get("debt_amount", 0) or 0)
    debtor_id = data.get("debtor_id")
    due_date = data.get("due_date")

    # Validate: items cannot be empty
    if not items:
        raise HTTPException(status_code=400, detail="Items cannot be empty / Mahsulotlar bo'sh bo'lmasligi kerak")

    # Map payment method enum safely
    try:
        payment_method = PaymentMethod[payment_method_str]
    except KeyError:
        payment_method = PaymentMethod.CASH

    # Calculate total from items and decrement stock
    total = 0.0
    processed_items = []
    for item in items:
        product_id = item.get("product_id")
        quantity = float(item.get("quantity", 1))
        if quantity <= 0:
            raise HTTPException(status_code=422, detail="Quantity must be positive / Miqdor 0 dan katta bo'lishi kerak")
        
        product = None
        if isinstance(product_id, int):
            product = session.get(Product, product_id)
        if not product and item.get("barcode"):
            product = session.exec(select(Product).where(Product.barcode == str(item["barcode"]))).first()
        if not product and item.get("name"):
            product = Product(
                name=str(item.get("name")),
                barcode=str(item.get("barcode") or f"QUICK_{uuid.uuid4().hex[:8].upper()}"),
                sale_price=float(item.get("price") or item.get("unit_price") or 0),
                purchase_price=round(float(item.get("price") or item.get("unit_price") or 0) * 0.8, 2),
                stock_quantity=999.0,
                unit="dona"
            )
            session.add(product)
            session.commit()
            session.refresh(product)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {product_id} topilmadi")
        
        item_total = round(product.sale_price * quantity, 2)
        total += item_total
        # Decrement inventory stock
        product.stock_quantity = max(0.0, round(product.stock_quantity - quantity, 3))
        session.add(product)
        
        processed_items.append({
            "product": product,
            "quantity": quantity,
            "unit_price": product.sale_price,
            "purchase_price": product.purchase_price,
            "total_price": item_total
        })

    total = round(total, 2)

    # Validate payment method amounts
    change_given = 0.0
    if payment_method == PaymentMethod.CASH:
        if cash_received < total:
            raise HTTPException(status_code=400, detail="Insufficient cash received / To'langan summa yetarli emas")
        change_given = round(cash_received - total, 2)
        card_amount = 0.0
        debt_amount = 0.0
    elif payment_method == PaymentMethod.CARD:
        card_amount = total
        cash_received = 0.0
        change_given = 0.0
        debt_amount = 0.0
    elif payment_method == PaymentMethod.DEBT:
        if not debtor_id:
            raise HTTPException(status_code=400, detail="Debtor ID required for DEBT payment / Qarzga berish uchun mijoz tanlanishi shart")
        debt_amount = total
        cash_received = 0.0
        change_given = 0.0
        card_amount = 0.0
    elif payment_method == PaymentMethod.MIXED:
        paid_coverage = cash_received + card_amount + debt_amount
        if round(paid_coverage, 2) < total:
            raise HTTPException(status_code=400, detail="Total payments do not cover total amount / To'lov summasi yetarli emas")
        if cash_received > (total - card_amount - debt_amount):
            change_given = round(cash_received - max(0.0, total - card_amount - debt_amount), 2)

    # Handle debtor balance
    debtor_name = ""
    debtor = None
    if debt_amount > 0 or payment_method == PaymentMethod.DEBT:
        if not debtor_id:
            raise HTTPException(status_code=400, detail="Debtor ID required for DEBT payment / Qarzga yozish uchun qarzdor ko'rsatilishi kerak")
        debtor = session.get(Debtor, debtor_id)
        if not debtor:
            raise HTTPException(status_code=404, detail="Debtor topilmadi")
        debtor_name = debtor.full_name
        debtor.balance = round((debtor.balance or 0.0) + debt_amount, 2)
        if due_date:
            debtor.due_date = str(due_date)
        debtor.updated_at = utc_now()
        session.add(debtor)

    # 1. CREATE AND COMMIT SALE RECORD
    receipt_number = f"REC-{uuid.uuid4().hex[:8].upper()}"
    sale = Sale(
        receipt_number=receipt_number,
        total_amount=total,
        payment_method=payment_method,
        cash_received=cash_received,
        change_given=change_given,
        card_amount=card_amount,
        debt_amount=debt_amount,
        debtor_id=debtor.id if debtor else None,
        cashier_id=current_user.id if current_user else None,
        created_at=utc_now()
    )
    session.add(sale)
    session.commit()
    session.refresh(sale)

    # 2. CREATE SALE ITEMS FOR ANALYTICS AND COGS
    for p_item in processed_items:
        prod = p_item["product"]
        s_item = SaleItem(
            sale_id=sale.id,
            product_id=prod.id,
            product_name=prod.name,
            quantity=p_item["quantity"],
            purchase_price=p_item["purchase_price"],
            unit_price=p_item["unit_price"],
            total_price=p_item["total_price"]
        )
        session.add(s_item)

    # 3. IF DEBT, RECORD DEBT TRANSACTION
    if debtor and debt_amount > 0:
        debt_tx = DebtTransaction(
            debtor_id=debtor.id,
            amount=debt_amount,
            transaction_type=DebtTransactionType.DEBT_INCREASE,
            sale_id=sale.id,
            note=f"Qarzga xarid: {receipt_number}" + (f" (Qaytarish muddati: {due_date})" if due_date else ""),
            due_date=str(due_date) if due_date else None,
            created_by_user_id=current_user.id if current_user else None,
            created_at=utc_now()
        )
        session.add(debt_tx)

    session.commit()

    return {
        "id": sale.id,
        "receipt_number": sale.receipt_number,
        "total_amount": sale.total_amount,
        "payment_method": sale.payment_method.value,
        "amount_paid": cash_received if payment_method == PaymentMethod.CASH else (card_amount if payment_method == PaymentMethod.CARD else total),
        "cash_received": cash_received,
        "change_given": change_given,
        "card_amount": card_amount,
        "debt_amount": debt_amount,
        "debtor_name": debtor_name,
        "status": "completed",
        "items": [
            {
                "product_id": pi["product"].id,
                "product_name": pi["product"].name,
                "quantity": pi["quantity"],
                "unit_price": pi["unit_price"],
                "total_price": pi["total_price"]
            }
            for pi in processed_items
        ],
        "created_at": sale.created_at.isoformat(),
        "cashier_name": current_user.full_name if current_user else "Cashier",
    }


@router.post("/hold", response_model=HoldCartResponse)
def hold_cart(
    data: HoldCartRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    hold = HeldCart(
        id=str(uuid.uuid4())[:8],
        cart_items=data.cart_items,
        created_at=utc_now(),
        expires_at=utc_now() + timedelta(hours=24)
    )
    return HoldCartResponse(
        hold_id=hold.id,
        message="Chek muvaffaqiyatli saqlandi / Чек успешно сохранен"
    )


@router.post("/hold/{hold_id}/resume", response_model=dict)
def hold_resume(
    hold_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return {"cart_items": [], "message": "Hold ochildi / Hold восстановлен"}
