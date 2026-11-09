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
    payment_method = data.get("payment_method", "CASH")
    cash_received = data.get("cash_received", 0)
    debtor_id = data.get("debtor_id")

    # Validate: items cannot be empty
    if not items:
        raise HTTPException(status_code=400, detail="Items cannot be empty / Mahsulotlar bo'sh bo'lmasligi kerak")

    # Calculate total from items
    total = 0
    for item in items:
        product_id = item.get("product_id")
        quantity = item.get("quantity", 1)
        if quantity <= 0:
            raise HTTPException(status_code=422, detail="Quantity must be positive / Miqdor 0 dan katta bo'lishi kerak")
        product = session.get(Product, product_id)
        if product:
            total += product.sale_price * quantity
            # Decrement inventory
            product.stock_quantity = max(0, product.stock_quantity - quantity)
            session.add(product)
    session.commit()

    # Validate: CASH payment must have sufficient amount
    if payment_method == "CASH" and cash_received < total:
        raise HTTPException(status_code=400, detail="Insufficient cash received / To'lantiq summa yetarli emas")

    # Calculate change and debt
    change_given = round(cash_received - total, 2) if cash_received >= total else 0
    debt_amount = 0
    debtor_name = ""
    
    # Handle DEBT payment - calculate debt amount
    if payment_method == "DEBT":
        if not debtor_id:
            raise HTTPException(status_code=400, detail="Debtor ID required for DEBT payment / DEBT to'lovi uchun debtor_id kerak")
        from ..models import Debtor
        debtor = session.get(Debtor, debtor_id)
        if not debtor:
            raise HTTPException(status_code=400, detail="Debtor not found / Debtor topilmadi")
        debt_amount = total  # Full amount becomes debt
        debtor_name = debtor.full_name
        # Increase debtor's balance
        if debtor.balance is None:
            debtor.balance = 0
        debtor.balance = debtor.balance + debt_amount
        session.add(debtor)
        session.commit()
    elif payment_method == "DEBT":
        raise HTTPException(status_code=400, detail="Debtor ID required for DEBT payment / DEBT to'lovi uchun debtor_id kerak")

    receipt_prefix = "REC-"

    return {
        "id": str(uuid.uuid4())[:8],
        "total_amount": total,
        "amount_paid": cash_received,
        "change_given": change_given,
        "debt_amount": debt_amount,
        "debtor_name": debtor_name,
        "status": "completed",
        "items": items,
        "receipt_number": f"REC-{uuid.uuid4().hex[:8].upper()}",
        "transaction_id": f"tx_{uuid.uuid4().hex[:12].upper()}",
        "created_at": datetime.now(timezone.utc),
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
    session.add(hold)
    session.commit()
    session.refresh(hold)
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
    hold = session.get(HeldCart, hold_id)
    if not hold:
        raise HTTPException(status_code=404, detail="Hold topilmadi / Hold not found")
    cart_items = hold.cart_items
    session.delete(hold)
    session.commit()
    return {"cart_items": cart_items, "message": "Hold ochildi / Hold восстановлен"}


@router.post("/hold", response_model=HoldCartResponse)
def hold_cart_duplicate(
    data: HoldCartRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Duplicate: save current cart as held cart."""
    return hold_cart(data, current_user, session)