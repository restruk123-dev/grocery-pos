import uuid
import io
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from pydantic import BaseModel, Field
from sqlmodel import Session, select

try:
    import zxingcpp
    from PIL import Image
    HAS_ZXING = True
except ImportError:
    HAS_ZXING = False

from ..database import get_session
from ..models import (
    Product, Sale, SaleItem, Debtor, DebtTransaction,
    DebtTransactionType, PaymentMethod, User, UserRole, utc_now
)
from ..auth import get_current_user

router = APIRouter(prefix="/pos", tags=["POS"])


class CartItemRequest(BaseModel):
    product_id: Optional[int] = Field(default=None, gt=0, description="Product ID / ID товара")
    barcode: Optional[str] = Field(default=None, max_length=64)
    name: Optional[str] = Field(default=None, max_length=255)
    quantity: float = Field(default=1.0, gt=0, le=10000, description="Quantity / Количество")

class CheckoutRequest(BaseModel):
    items: List[CartItemRequest] = Field(min_length=1, max_length=500)
    payment_method: str = Field(default="CASH", pattern="^(CASH|CARD|DEBT|MIXED)$")
    cash_received: float = Field(default=0.0, ge=0, le=1_000_000_000_000)
    card_amount: float = Field(default=0.0, ge=0, le=1_000_000_000_000)
    debt_amount: float = Field(default=0.0, ge=0, le=1_000_000_000_000)
    debtor_id: Optional[int] = Field(default=None, gt=0)
    due_date: Optional[str] = Field(default=None, max_length=32)


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
    data: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    items = [item.model_dump() for item in data.items]
    payment_method_str = data.payment_method.upper()
    cash_received = data.cash_received
    card_amount = data.card_amount
    debt_amount = data.debt_amount
    debtor_id = data.debtor_id
    due_date = data.due_date

    payment_method = PaymentMethod[payment_method_str]

    # Calculate total from items and decrement stock
    total = 0.0
    processed_items = []
    for item in items:
        product_id = item.get("product_id")
        quantity = float(item["quantity"])

        product = None
        if isinstance(product_id, int):
            product = session.get(Product, product_id)
        if not product and item.get("barcode"):
            product = session.exec(select(Product).where(
                Product.barcode == str(item["barcode"]), Product.is_active == True
            )).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {product_id} topilmadi")

        if quantity > product.stock_quantity:
            raise HTTPException(status_code=409, detail=f"Insufficient stock for {product.name}")

        item_total = round(product.sale_price * quantity, 2)
        total += item_total
        # Decrement inventory stock
        product.stock_quantity = round(product.stock_quantity - quantity, 3)
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
        if card_amount + debt_amount > total:
            raise HTTPException(status_code=400, detail="Card and debt portions cannot exceed the sale total")
        cash_due = round(total - card_amount - debt_amount, 2)
        if cash_received < cash_due:
            raise HTTPException(status_code=400, detail="Total payments do not cover total amount / To'lov summasi yetarli emas")
        change_given = round(cash_received - cash_due, 2)

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

    # Persist sale, items, stock and debt in one database transaction.
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
    session.flush()

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
    session.refresh(sale)

    return {
        "id": sale.id,
        "receipt_number": sale.receipt_number,
        "total_amount": sale.total_amount,
        "payment_method": sale.payment_method.value,
        "amount_paid": round(total - debt_amount, 2),
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
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Server-side held carts are not available. Use the current browser's local saved carts.",
    )


@router.post("/hold/{hold_id}/resume", response_model=dict)
def hold_resume(
    hold_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Server-side held carts are not available. This cart cannot be restored from the server.",
    )


@router.post("/scan-image", response_model=dict)
async def scan_barcode_from_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Decodes 1D / 2D barcode from an uploaded image or camera snapshot using zxing-cpp.
    Matches with product catalog if barcode exists.
    """
    max_image_bytes = 5 * 1024 * 1024
    contents = await file.read(max_image_bytes + 1)
    if len(contents) > max_image_bytes:
        raise HTTPException(status_code=413, detail="Image must be 5 MB or smaller")
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image file / Bo'sh rasm fayli")

    barcode_text = None
    barcode_format = None

    if HAS_ZXING:
        try:
            image = Image.open(io.BytesIO(contents))
            if image.width * image.height > 20_000_000:
                raise HTTPException(status_code=413, detail="Image dimensions are too large")
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")

            results = zxingcpp.read_barcodes(image)
            if not results:
                for angle in (90, 180, 270):
                    rotated = image.rotate(angle, expand=True)
                    results = zxingcpp.read_barcodes(rotated)
                    if results:
                        break

            if results and len(results) > 0:
                barcode_text = results[0].text
                barcode_format = str(results[0].format)
        except HTTPException:
            raise
        except Exception:
            pass

    if not barcode_text:
        return {
            "success": False,
            "barcode": None,
            "message": "Barcode not recognized / Shtrixkod aniqlanmadi",
        }

    product = session.exec(select(Product).where(Product.barcode == barcode_text)).first()
    product_dict = None
    if product:
        product_dict = {
            "id": product.id,
            "barcode": product.barcode,
            "name": product.name,
            "sale_price": product.sale_price,
            "purchase_price": product.purchase_price if current_user.role == UserRole.OWNER else None,
            "stock_quantity": product.stock_quantity,
            "unit": product.unit,
            "category_id": product.category_id,
        }

    return {
        "success": True,
        "barcode": barcode_text,
        "format": barcode_format,
        "product": product_dict,
        "message": f"Barcode recognized: {barcode_text}",
    }
