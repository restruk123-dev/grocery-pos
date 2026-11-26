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
    DebtTransactionType, PaymentMethod, User, UserRole, utc_now,
    StockMovement, StockMovementType,
    CashShift, CashShiftAction, ShiftStatus, CashActionType,
    SaleRefund, SaleRefundItem, StoreOutlet
)
from ..auth import get_current_user, require_role
from ..services.uz_tax import parse_gs1_datamatrix, compute_line_vat, get_tax_profile, mask_marking_code

router = APIRouter(prefix="/pos", tags=["POS"])


class CartItemRequest(BaseModel):
    product_id: Optional[int] = Field(default=None, gt=0, description="Product ID / ID товара")
    barcode: Optional[str] = Field(default=None, max_length=255)
    name: Optional[str] = Field(default=None, max_length=255)
    marking_code: Optional[str] = Field(default=None, max_length=255, description="Asl Belgisi GS1 DataMatrix")
    quantity: float = Field(default=1.0, gt=0, le=10000, description="Quantity / Количество")

class CheckoutRequest(BaseModel):
    items: List[CartItemRequest] = Field(min_length=1, max_length=500)
    payment_method: str = Field(default="CASH", pattern="^(CASH|CARD|DEBT|MIXED)$")
    discount_amount: float = Field(default=0.0, ge=0.0, le=1_000_000_000)
    cash_received: float = Field(default=0.0, ge=0, le=1_000_000_000_000)
    card_amount: float = Field(default=0.0, ge=0, le=1_000_000_000_000)
    debt_amount: float = Field(default=0.0, ge=0, le=1_000_000_000_000)
    debtor_id: Optional[int] = Field(default=None, gt=0)
    due_date: Optional[str] = Field(default=None, max_length=32)
    store_id: Optional[int] = Field(default=None, gt=0)


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


class ShiftOpenRequest(BaseModel):
    initial_cash: float = Field(default=0.0, ge=0.0, le=100_000_000.0, description="Kassadagi boshlang'ich naqd pul / Начальный остаток в кассе")
    note: Optional[str] = Field(default=None, max_length=255)


class ShiftActionRequest(BaseModel):
    action_type: str = Field(..., pattern="^(CASH_IN|CASH_OUT)$")
    amount: float = Field(..., gt=0.0, le=100_000_000.0)
    reason: str = Field(..., min_length=1, max_length=255)


class ShiftCloseRequest(BaseModel):
    actual_cash: float = Field(..., ge=0.0, le=100_000_000.0, description="Kassada sanab chiqilgan haqiqiy naqd pul / Фактический остаток наличности")
    note: Optional[str] = Field(default=None, max_length=255)


class RefundItemRequest(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: float = Field(..., gt=0, le=10000)
    reason: Optional[str] = Field(default="Mijoz qaytardi / Возврат товара", max_length=255)


class RefundRequest(BaseModel):
    receipt_number: str = Field(..., min_length=3, max_length=64)
    items: List[RefundItemRequest] = Field(min_length=1, max_length=100)
    reason: Optional[str] = Field(default="Mijoz qaytardi / Возврат", max_length=255)



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
    tax_profile = get_tax_profile(session)
    strict_marking = bool(tax_profile.get("strict_tobacco_marking", False))
    outlet = session.get(StoreOutlet, data.store_id) if data.store_id else None

    # Calculate total from items and decrement stock
    total = 0.0
    processed_items = []
    seen_markings = set()
    for item in items:
        product_id = item.get("product_id")
        quantity = float(item["quantity"])
        raw_marking = (item.get("marking_code") or "").strip() or None
        raw_barcode = (item.get("barcode") or "").strip()
        if not raw_marking and raw_barcode:
            dm_in_bc = parse_gs1_datamatrix(raw_barcode)
            if dm_in_bc:
                raw_marking = dm_in_bc["marking_code"]

        product = None
        if isinstance(product_id, int):
            product = session.get(Product, product_id)
        if not product and raw_barcode:
            product = session.exec(select(Product).where(
                Product.barcode == raw_barcode, Product.is_active == True
            )).first()
            if not product:
                dm = parse_gs1_datamatrix(raw_barcode)
                if dm:
                    raw_marking = raw_marking or dm["marking_code"]
                    product = session.exec(select(Product).where(
                        Product.barcode.in_(dm["barcode_candidates"]),
                        Product.is_active == True,
                    )).first()
            # Support 13-digit scale weight barcodes with prefix 20 or 21 (e.g. 2100123015004 -> 1.500 kg)
            if not product and len(raw_barcode) == 13 and raw_barcode[:2] in ("20", "21"):
                plu_prefix = raw_barcode[:7]
                product = session.exec(select(Product).where(
                    Product.barcode == plu_prefix, Product.is_active == True
                )).first()
                if product:
                    try:
                        weight_grams = float(raw_barcode[7:12])
                        if weight_grams > 0 and (quantity == 1.0 or not item.get("quantity")):
                            quantity = round(weight_grams / 1000.0, 3)
                    except ValueError:
                        pass
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {product_id} topilmadi")

        is_marked_product = bool(getattr(product, "is_tobacco", False) or getattr(product, "requires_marking", False))
        if raw_marking:
            dm_clean = parse_gs1_datamatrix(raw_marking)
            clean_marking = dm_clean["marking_code"] if dm_clean else raw_marking[:240]
            if clean_marking in seen_markings:
                raise HTTPException(status_code=409, detail="Bu DataMatrix markirovka kodi chekda takrorlandi / Дубликат DataMatrix в одном чеке")
            seen_markings.add(clean_marking)
            # Verify DataMatrix has not already been sold and unreturned
            prior_sales = session.exec(select(SaleItem).where(SaleItem.marking_code == clean_marking)).all()
            for ps in prior_sales:
                refs = session.exec(select(SaleRefund).where(SaleRefund.sale_id == ps.sale_id)).all()
                ret_qty = 0.0
                if refs:
                    ref_its = session.exec(select(SaleRefundItem).where(
                        SaleRefundItem.refund_id.in_([r.id for r in refs]),
                        SaleRefundItem.product_id == ps.product_id,
                    )).all()
                    ret_qty = sum(ri.quantity for ri in ref_its)
                if ret_qty < ps.quantity:
                    raise HTTPException(
                        status_code=409,
                        detail=f"{product.name}: DataMatrix markirovka avval sotilgan! / Этот код маркировки уже продан!",
                    )
        else:
            clean_marking = None
            if is_marked_product and strict_marking:
                raise HTTPException(
                    status_code=400,
                    detail=f"{product.name}: Tamaki tovari uchun DataMatrix (Asl Belgisi) kodini skanerlang! / Отсканируйте DataMatrix пачки!",
                )

        if quantity > product.stock_quantity:
            raise HTTPException(status_code=409, detail=f"Insufficient stock for {product.name}")

        item_total = round(product.sale_price * quantity, 2)
        total += item_total
        # Decrement inventory stock
        previous_stock = product.stock_quantity
        product.stock_quantity = round(product.stock_quantity - quantity, 3)
        session.add(product)

        processed_items.append({
            "product": product,
            "quantity": quantity,
            "unit_price": product.sale_price,
            "purchase_price": product.purchase_price,
            "total_price": item_total,
            "previous_stock": previous_stock,
            "marking_code": clean_marking,
            "is_tobacco": is_marked_product,
            "ikpu_code": getattr(product, "ikpu_code", None),
            "package_code": getattr(product, "package_code", None),
            "vat_rate": float(getattr(product, "vat_rate", 0.0) or 0.0),
        })

    gross_total = round(total, 2)
    discount_amount = round(min(float(data.discount_amount or 0.0), gross_total), 2)
    total = round(max(0.0, gross_total - discount_amount), 2)
    net_factor = (total / gross_total) if gross_total > 0 else 1.0
    tax_regime = tax_profile.get("tax_regime", "TURNOVER_1")
    total_vat_amount = 0.0
    for pi in processed_items:
        net_line = round(pi["total_price"] * net_factor, 2)
        pi["vat_amount"] = compute_line_vat(net_line, pi["vat_rate"], tax_regime)
        total_vat_amount = round(total_vat_amount + pi["vat_amount"], 2)

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

    # Find currently active cash shift if open
    active_shift = session.exec(
        select(CashShift).where(CashShift.status == ShiftStatus.OPEN).order_by(CashShift.opened_at.desc())
    ).first()

    # Persist sale, items, stock and debt in one database transaction.
    receipt_number = f"REC-{uuid.uuid4().hex[:8].upper()}"
    sale = Sale(
        receipt_number=receipt_number,
        total_amount=total,
        discount_amount=discount_amount,
        vat_amount=total_vat_amount,
        fiscal_status="INTERNAL",
        payment_method=payment_method,
        cash_received=cash_received,
        change_given=change_given,
        card_amount=card_amount,
        debt_amount=debt_amount,
        debtor_id=debtor.id if debtor else None,
        cashier_id=current_user.id if current_user else None,
        shift_id=active_shift.id if active_shift else None,
        store_id=outlet.id if outlet else None,
        created_at=utc_now()
    )
    session.add(sale)
    session.flush()

    # Update active shift running balances
    if active_shift:
        cash_portion = round(total - card_amount - debt_amount, 2) if payment_method in (PaymentMethod.CASH, PaymentMethod.MIXED) else 0.0
        active_shift.total_sales = round(active_shift.total_sales + total, 2)
        active_shift.sales_count += 1
        active_shift.cash_sales = round(active_shift.cash_sales + cash_portion, 2)
        active_shift.card_sales = round(active_shift.card_sales + card_amount, 2)
        active_shift.debt_sales = round(active_shift.debt_sales + debt_amount, 2)
        active_shift.expected_cash = round(active_shift.expected_cash + cash_portion, 2)
        session.add(active_shift)

    # 2. CREATE SALE ITEMS AND STOCK MOVEMENTS FOR AUDIT AND COGS
    for p_item in processed_items:
        prod = p_item["product"]
        s_item = SaleItem(
            sale_id=sale.id,
            product_id=prod.id,
            product_name=prod.name,
            quantity=p_item["quantity"],
            purchase_price=p_item["purchase_price"],
            unit_price=p_item["unit_price"],
            total_price=p_item["total_price"],
            ikpu_code=p_item["ikpu_code"],
            package_code=p_item["package_code"],
            vat_rate=p_item["vat_rate"],
            vat_amount=p_item["vat_amount"],
            marking_code=p_item["marking_code"],
            is_tobacco=p_item["is_tobacco"],
        )
        session.add(s_item)

        stock_mv = StockMovement(
            product_id=prod.id,
            movement_type=StockMovementType.SALE,
            quantity_delta=-p_item["quantity"],
            previous_stock=p_item["previous_stock"],
            new_stock=prod.stock_quantity,
            cost_price=p_item["purchase_price"],
            unit_price=p_item["unit_price"],
            reference_id=sale.receipt_number,
            note=f"Kassa sotuvi: {sale.receipt_number}",
            created_by_user_id=current_user.id if current_user else None,
            created_at=utc_now()
        )
        session.add(stock_mv)

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
        "gross_total": gross_total,
        "discount_amount": discount_amount,
        "vat_amount": total_vat_amount,
        "fiscal_status": sale.fiscal_status,
        "total_amount": sale.total_amount,
        "payment_method": sale.payment_method.value,
        "amount_paid": round(total - debt_amount, 2),
        "cash_received": cash_received,
        "change_given": change_given,
        "card_amount": card_amount,
        "debt_amount": debt_amount,
        "debtor_name": debtor_name,
        "status": "completed",
        "tax_profile": {
            "legal_name": (outlet.legal_name if outlet and outlet.legal_name else tax_profile.get("legal_name")) or "",
            "inn_stir": (outlet.inn_stir if outlet and outlet.inn_stir else tax_profile.get("inn_stir")) or "",
            "kkm_serial": (outlet.kkm_serial if outlet and outlet.kkm_serial else tax_profile.get("kkm_serial")) or "",
            "tax_regime": tax_regime,
            "address": (outlet.address if outlet and outlet.address else tax_profile.get("address")) or "",
        },
        "items": [
            {
                "product_id": pi["product"].id,
                "product_name": pi["product"].name,
                "quantity": pi["quantity"],
                "unit_price": pi["unit_price"],
                "total_price": pi["total_price"],
                "ikpu_code": pi["ikpu_code"],
                "vat_rate": pi["vat_rate"],
                "vat_amount": pi["vat_amount"],
                "marking_code": pi["marking_code"],
                "masked_marking_code": mask_marking_code(pi["marking_code"]),
                "is_tobacco": pi["is_tobacco"],
            }
            for pi in processed_items
        ],
        "created_at": sale.created_at.isoformat(),
        "cashier_name": current_user.full_name if current_user else "Cashier",
    }


# ── Cash Shift Management ─────────────────────────────────────────────────

@router.get("/shift/current", response_model=dict)
def get_current_shift(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get active cash shift info with running drawer totals."""
    shift = session.exec(
        select(CashShift).where(CashShift.status == ShiftStatus.OPEN).order_by(CashShift.opened_at.desc())
    ).first()
    if not shift:
        return {"is_open": False, "shift": None}

    cashier = session.get(User, shift.user_id)
    return {
        "is_open": True,
        "shift": {
            "id": shift.id,
            "shift_number": shift.shift_number,
            "user_id": shift.user_id,
            "cashier_name": cashier.full_name if cashier else "Kassir",
            "opened_at": shift.opened_at.isoformat(),
            "initial_cash": shift.initial_cash,
            "cash_sales": shift.cash_sales,
            "card_sales": shift.card_sales,
            "debt_sales": shift.debt_sales,
            "total_sales": shift.total_sales,
            "sales_count": shift.sales_count,
            "refunds_count": shift.refunds_count,
            "refunds_amount": shift.refunds_amount,
            "cash_in": shift.cash_in,
            "cash_out": shift.cash_out,
            "expected_cash": shift.expected_cash,
            "note": shift.note,
        }
    }


@router.post("/shift/open", response_model=dict)
def open_shift(
    data: ShiftOpenRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Open a new cash drawer shift."""
    existing = session.exec(
        select(CashShift).where(CashShift.status == ShiftStatus.OPEN)
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Smena allaqachon ochiq (#{existing.shift_number}). Avval mavjud smenani yoping."
        )

    now_utc = utc_now()
    shift_number = f"SH-{now_utc.strftime('%Y%m%d%H%M')}-{uuid.uuid4().hex[:4].upper()}"
    shift = CashShift(
        shift_number=shift_number,
        user_id=current_user.id,
        status=ShiftStatus.OPEN,
        opened_at=now_utc,
        initial_cash=round(data.initial_cash, 2),
        expected_cash=round(data.initial_cash, 2),
        note=data.note,
    )
    session.add(shift)
    session.commit()
    session.refresh(shift)

    return {
        "success": True,
        "shift_id": shift.id,
        "shift_number": shift.shift_number,
        "initial_cash": shift.initial_cash,
        "opened_at": shift.opened_at.isoformat(),
        "cashier_name": current_user.full_name,
        "message": "Kassa smenasi muvaffaqiyatli ochildi",
    }


@router.post("/shift/cash-action", response_model=dict)
def shift_cash_action(
    data: ShiftActionRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Deposit or withdraw cash from register drawer (Cash In / Cash Out)."""
    shift = session.exec(
        select(CashShift).where(CashShift.status == ShiftStatus.OPEN).order_by(CashShift.opened_at.desc())
    ).first()
    if not shift:
        raise HTTPException(status_code=400, detail="Hozirda ochiq smena yo'q / Нет открытой смены")

    amount = round(data.amount, 2)
    action_type = CashActionType(data.action_type)

    if action_type == CashActionType.CASH_OUT and amount > shift.expected_cash:
        raise HTTPException(status_code=400, detail="Kassada yetarli naqd pul yo'q / В кассе недостаточно наличности")

    action = CashShiftAction(
        shift_id=shift.id,
        action_type=action_type,
        amount=amount,
        reason=data.reason.strip(),
        user_id=current_user.id,
        created_at=utc_now(),
    )
    session.add(action)

    if action_type == CashActionType.CASH_IN:
        shift.cash_in = round(shift.cash_in + amount, 2)
        shift.expected_cash = round(shift.expected_cash + amount, 2)
    else:
        shift.cash_out = round(shift.cash_out + amount, 2)
        shift.expected_cash = round(shift.expected_cash - amount, 2)

    session.add(shift)
    session.commit()

    return {
        "success": True,
        "action_type": action_type.value,
        "amount": amount,
        "expected_cash": shift.expected_cash,
        "message": f"Kassa operatsiyasi saqlandi: {action_type.value} {amount:,.0f} so'm",
    }


@router.post("/shift/close", response_model=dict)
def close_shift(
    data: ShiftCloseRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Close active cash shift and produce Z-Report."""
    shift = session.exec(
        select(CashShift).where(CashShift.status == ShiftStatus.OPEN).order_by(CashShift.opened_at.desc())
    ).first()
    if not shift:
        raise HTTPException(status_code=400, detail="Yopish uchun ochiq smena topilmadi / Нет открытой смены")

    now_utc = utc_now()
    actual_cash = round(data.actual_cash, 2)
    difference = round(actual_cash - shift.expected_cash, 2)

    shift.status = ShiftStatus.CLOSED
    shift.closed_at = now_utc
    shift.actual_cash = actual_cash
    shift.difference = difference
    if data.note:
        shift.note = data.note
    session.add(shift)
    session.commit()
    session.refresh(shift)

    cashier = session.get(User, shift.user_id)
    return {
        "success": True,
        "shift_number": shift.shift_number,
        "opened_at": shift.opened_at.isoformat(),
        "closed_at": shift.closed_at.isoformat(),
        "cashier_name": cashier.full_name if cashier else "Kassir",
        "initial_cash": shift.initial_cash,
        "cash_sales": shift.cash_sales,
        "card_sales": shift.card_sales,
        "debt_sales": shift.debt_sales,
        "total_sales": shift.total_sales,
        "sales_count": shift.sales_count,
        "refunds_count": shift.refunds_count,
        "refunds_amount": shift.refunds_amount,
        "cash_in": shift.cash_in,
        "cash_out": shift.cash_out,
        "expected_cash": shift.expected_cash,
        "actual_cash": actual_cash,
        "difference": difference,
        "status": "CLOSED",
        "message": "Smena muvaffaqiyatli yopildi (Z-Hisobot tuzildi)",
    }


@router.get("/shift/history", response_model=List[dict])
def list_shift_history(
    limit: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """List historical cashier shifts."""
    shifts = session.exec(select(CashShift).order_by(CashShift.opened_at.desc()).limit(limit)).all()
    user_ids = {s.user_id for s in shifts}
    users_map = {u.id: u.full_name for u in session.exec(select(User).where(User.id.in_(user_ids))).all()} if user_ids else {}

    return [{
        "id": s.id,
        "shift_number": s.shift_number,
        "cashier_name": users_map.get(s.user_id, "Kassir"),
        "status": s.status.value,
        "opened_at": s.opened_at.isoformat(),
        "closed_at": s.closed_at.isoformat() if s.closed_at else None,
        "initial_cash": s.initial_cash,
        "total_sales": s.total_sales,
        "cash_sales": s.cash_sales,
        "card_sales": s.card_sales,
        "debt_sales": s.debt_sales,
        "sales_count": s.sales_count,
        "expected_cash": s.expected_cash,
        "actual_cash": s.actual_cash,
        "difference": s.difference,
    } for s in shifts]


# ── Receipt & Refund Storno ───────────────────────────────────────────────

@router.get("/receipts", response_model=List[dict])
def list_recent_receipts(
    search: Optional[str] = Query(None, max_length=64),
    limit: int = Query(30, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """List recent sales receipts for fast reprint and refund lookup without memorizing IDs."""
    query = select(Sale)
    if search and search.strip():
        q = f"%{search.strip()}%"
        query = query.where(Sale.receipt_number.ilike(q))
    sales = session.exec(query.order_by(Sale.created_at.desc()).limit(limit)).all()
    if not sales:
        return []

    sale_ids = [s.id for s in sales if s.id is not None]
    items = session.exec(select(SaleItem).where(SaleItem.sale_id.in_(sale_ids))).all() if sale_ids else []
    refunds = session.exec(select(SaleRefund).where(SaleRefund.sale_id.in_(sale_ids))).all() if sale_ids else []
    users = {u.id: u.full_name for u in session.exec(select(User)).all()}
    debtors = {d.id: d.full_name for d in session.exec(select(Debtor)).all()}

    items_by_sale = {}
    for it in items:
        items_by_sale.setdefault(it.sale_id, []).append(it)
    refunded_sale_ids = {r.sale_id for r in refunds}

    tax_profile = get_tax_profile(session)
    tax_meta = {
        "legal_name": tax_profile.get("legal_name") or "",
        "inn_stir": tax_profile.get("inn_stir") or "",
        "kkm_serial": tax_profile.get("kkm_serial") or "",
        "tax_regime": tax_profile.get("tax_regime", "TURNOVER_1"),
        "address": tax_profile.get("address") or "",
    }
    out = []
    for s in sales:
        s_items = items_by_sale.get(s.id, [])
        out.append({
            "id": s.id,
            "receipt_number": s.receipt_number,
            "total_amount": s.total_amount,
            "discount_amount": getattr(s, "discount_amount", 0.0) or 0.0,
            "vat_amount": getattr(s, "vat_amount", 0.0) or 0.0,
            "fiscal_status": getattr(s, "fiscal_status", "INTERNAL"),
            "tax_profile": tax_meta,
            "payment_method": s.payment_method.value,
            "cash_received": s.cash_received,
            "change_given": s.change_given,
            "card_amount": s.card_amount,
            "debt_amount": s.debt_amount,
            "cashier_name": users.get(s.cashier_id, "Kassir"),
            "debtor_name": debtors.get(s.debtor_id) if s.debtor_id else None,
            "has_refund": s.id in refunded_sale_ids,
            "created_at": s.created_at.isoformat(),
            "items_count": len(s_items),
            "items": [
                {
                    "product_id": it.product_id,
                    "product_name": it.product_name,
                    "quantity": it.quantity,
                    "unit_price": it.unit_price,
                    "total_price": it.total_price,
                    "ikpu_code": getattr(it, "ikpu_code", None),
                    "vat_rate": getattr(it, "vat_rate", 0.0) or 0.0,
                    "vat_amount": getattr(it, "vat_amount", 0.0) or 0.0,
                    "marking_code": getattr(it, "marking_code", None),
                    "masked_marking_code": mask_marking_code(getattr(it, "marking_code", None)),
                    "is_tobacco": bool(getattr(it, "is_tobacco", False)),
                }
                for it in s_items
            ],
        })
    return out


@router.get("/receipt/{receipt_number}", response_model=dict)
def get_receipt_details(
    receipt_number: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Look up sale receipt details, lines, and existing refunds."""
    sale = session.exec(select(Sale).where(Sale.receipt_number == receipt_number)).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Chek topilmadi / Чек не найден")

    items = session.exec(select(SaleItem).where(SaleItem.sale_id == sale.id)).all()
    cashier = session.get(User, sale.cashier_id) if sale.cashier_id else None
    debtor = session.get(Debtor, sale.debtor_id) if sale.debtor_id else None

    # Find previous refunds on this sale
    refunds = session.exec(select(SaleRefund).where(SaleRefund.sale_id == sale.id)).all()
    refund_items = []
    if refunds:
        ref_ids = [r.id for r in refunds]
        refund_items = session.exec(select(SaleRefundItem).where(SaleRefundItem.refund_id.in_(ref_ids))).all()

    already_refunded_qty = {}
    for ri in refund_items:
        already_refunded_qty[ri.product_id] = already_refunded_qty.get(ri.product_id, 0.0) + ri.quantity

    discount_amt = float(getattr(sale, "discount_amount", 0.0) or 0.0)
    gross_amt = round(sale.total_amount + discount_amt, 2)
    tax_profile = get_tax_profile(session)

    return {
        "id": sale.id,
        "receipt_number": sale.receipt_number,
        "gross_total": gross_amt,
        "discount_amount": discount_amt,
        "vat_amount": float(getattr(sale, "vat_amount", 0.0) or 0.0),
        "fiscal_status": getattr(sale, "fiscal_status", "INTERNAL"),
        "tax_profile": {
            "legal_name": tax_profile.get("legal_name") or "",
            "inn_stir": tax_profile.get("inn_stir") or "",
            "kkm_serial": tax_profile.get("kkm_serial") or "",
            "tax_regime": tax_profile.get("tax_regime", "TURNOVER_1"),
            "address": tax_profile.get("address") or "",
        },
        "total_amount": sale.total_amount,
        "payment_method": sale.payment_method.value,
        "cash_received": sale.cash_received,
        "change_given": sale.change_given,
        "card_amount": sale.card_amount,
        "debt_amount": sale.debt_amount,
        "debtor_name": debtor.full_name if debtor else None,
        "cashier_name": cashier.full_name if cashier else "Kassir",
        "created_at": sale.created_at.isoformat(),
        "items": [
            {
                "product_id": it.product_id,
                "product_name": it.product_name,
                "quantity": it.quantity,
                "unit_price": it.unit_price,
                "total_price": it.total_price,
                "ikpu_code": getattr(it, "ikpu_code", None),
                "vat_rate": getattr(it, "vat_rate", 0.0) or 0.0,
                "vat_amount": getattr(it, "vat_amount", 0.0) or 0.0,
                "marking_code": getattr(it, "marking_code", None),
                "masked_marking_code": mask_marking_code(getattr(it, "marking_code", None)),
                "is_tobacco": bool(getattr(it, "is_tobacco", False)),
                "refundable_quantity": max(0.0, it.quantity - already_refunded_qty.get(it.product_id, 0.0)),
            }
            for it in items
        ],
        "is_fully_refunded": all(
            it.quantity <= already_refunded_qty.get(it.product_id, 0.0) for it in items
        ) if items else False
    }


@router.post("/refund", response_model=dict)
def process_sale_refund(
    data: RefundRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Process item or full return/storno on a past receipt."""
    sale = session.exec(select(Sale).where(Sale.receipt_number == data.receipt_number)).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Chek topilmadi / Чек не найден")

    sale_items = {it.product_id: it for it in session.exec(select(SaleItem).where(SaleItem.sale_id == sale.id)).all()}
    if not sale_items:
        raise HTTPException(status_code=400, detail="Chekda tovarlar topilmadi")

    # Check previous refunds
    past_refunds = session.exec(select(SaleRefund).where(SaleRefund.sale_id == sale.id)).all()
    already_refunded = {}
    if past_refunds:
        past_items = session.exec(select(SaleRefundItem).where(SaleRefundItem.refund_id.in_([r.id for r in past_refunds]))).all()
        for pi in past_items:
            already_refunded[pi.product_id] = already_refunded.get(pi.product_id, 0.0) + pi.quantity

    now_utc = utc_now()
    total_refund = 0.0
    processed_refund_items = []

    for req_item in data.items:
        s_item = sale_items.get(req_item.product_id)
        if not s_item:
            raise HTTPException(status_code=400, detail=f"ID {req_item.product_id} tovari ushbu chekda yo'q")

        refundable = round(s_item.quantity - already_refunded.get(req_item.product_id, 0.0), 3)
        if req_item.quantity > refundable:
            raise HTTPException(
                status_code=400,
                detail=f"{s_item.product_name} uchun qaytarish miqdori ({req_item.quantity}) mumkin bo'lganidan ({refundable}) ko'p"
            )

        line_refund = round(s_item.unit_price * req_item.quantity, 2)
        total_refund += line_refund
        processed_refund_items.append({
            "product_id": s_item.product_id,
            "product_name": s_item.product_name,
            "quantity": req_item.quantity,
            "unit_price": s_item.unit_price,
            "total_price": line_refund,
        })

        # Restore product stock
        prod = session.get(Product, s_item.product_id)
        if prod:
            prev_stock = prod.stock_quantity
            prod.stock_quantity = round(prod.stock_quantity + req_item.quantity, 3)
            prod.updated_at = now_utc
            session.add(prod)

            # Record stock movement audit
            session.add(StockMovement(
                product_id=prod.id,
                movement_type=StockMovementType.RETURN,
                quantity_delta=req_item.quantity,
                previous_stock=prev_stock,
                new_stock=prod.stock_quantity,
                cost_price=s_item.purchase_price,
                unit_price=s_item.unit_price,
                reference_id=sale.receipt_number,
                note=f"Qaytarilgan tovar: {sale.receipt_number} ({data.reason})",
                created_by_user_id=current_user.id,
                created_at=now_utc,
            ))

    total_refund = round(total_refund, 2)

    # Determine refund payment distribution based on original sale
    cash_refunded = 0.0
    card_refunded = 0.0
    debt_reduced = 0.0

    if sale.payment_method == PaymentMethod.CASH:
        cash_refunded = total_refund
    elif sale.payment_method == PaymentMethod.CARD:
        card_refunded = total_refund
    elif sale.payment_method == PaymentMethod.DEBT:
        debt_reduced = total_refund
    elif sale.payment_method == PaymentMethod.MIXED:
        # Proportionate refund
        ratio = total_refund / sale.total_amount if sale.total_amount > 0 else 1.0
        debt_reduced = round(sale.debt_amount * ratio, 2)
        card_refunded = round(sale.card_amount * ratio, 2)
        cash_refunded = round(total_refund - debt_reduced - card_refunded, 2)

    # If debt was reduced, adjust debtor balance and record payment transaction
    if debt_reduced > 0 and sale.debtor_id:
        debtor = session.get(Debtor, sale.debtor_id)
        if debtor:
            debtor.balance = round(max(0.0, debtor.balance - debt_reduced), 2)
            debtor.updated_at = now_utc
            session.add(debtor)
            session.add(DebtTransaction(
                debtor_id=debtor.id,
                amount=debt_reduced,
                transaction_type=DebtTransactionType.DEBT_PAYMENT,
                sale_id=sale.id,
                note=f"Tovar qaytarish hisobidan qarz kamaytirildi: {sale.receipt_number}",
                created_by_user_id=current_user.id,
                created_at=now_utc,
            ))

    # Current shift adjustment
    active_shift = session.exec(
        select(CashShift).where(CashShift.status == ShiftStatus.OPEN).order_by(CashShift.opened_at.desc())
    ).first()

    refund_number = f"REF-{uuid.uuid4().hex[:8].upper()}"
    sale_refund = SaleRefund(
        refund_number=refund_number,
        sale_id=sale.id,
        receipt_number=sale.receipt_number,
        total_refund_amount=total_refund,
        cash_refunded=cash_refunded,
        card_refunded=card_refunded,
        debt_reduced=debt_reduced,
        reason=data.reason or "Mijoz qaytardi",
        shift_id=active_shift.id if active_shift else None,
        processed_by_user_id=current_user.id,
        created_at=now_utc,
    )
    session.add(sale_refund)
    session.flush()

    for pri in processed_refund_items:
        session.add(SaleRefundItem(
            refund_id=sale_refund.id,
            product_id=pri["product_id"],
            product_name=pri["product_name"],
            quantity=pri["quantity"],
            unit_price=pri["unit_price"],
            total_price=pri["total_price"],
        ))

    if active_shift:
        active_shift.refunds_count += 1
        active_shift.refunds_amount = round(active_shift.refunds_amount + total_refund, 2)
        if cash_refunded > 0:
            active_shift.expected_cash = round(max(0.0, active_shift.expected_cash - cash_refunded), 2)
        session.add(active_shift)

    session.commit()

    return {
        "success": True,
        "refund_number": refund_number,
        "receipt_number": sale.receipt_number,
        "total_refund_amount": total_refund,
        "cash_refunded": cash_refunded,
        "card_refunded": card_refunded,
        "debt_reduced": debt_reduced,
        "items": processed_refund_items,
        "message": f"Qaytarish muvaffaqiyatli amalga oshirildi ({total_refund:,.0f} so'm)",
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
    detected_weight = None
    detected_marking_code = None
    if not product:
        dm = parse_gs1_datamatrix(barcode_text)
        if dm:
            detected_marking_code = dm["marking_code"]
            product = session.exec(
                select(Product).where(Product.barcode.in_(dm["barcode_candidates"]), Product.is_active == True)
            ).first()
    if not product and len(barcode_text) == 13 and barcode_text[:2] in ("20", "21"):
        plu_prefix = barcode_text[:7]
        product = session.exec(select(Product).where(Product.barcode == plu_prefix, Product.is_active == True)).first()
        if product:
            try:
                wg = float(barcode_text[7:12])
                if wg > 0:
                    detected_weight = round(wg / 1000.0, 3)
            except ValueError:
                pass
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
            "ikpu_code": getattr(product, "ikpu_code", None),
            "is_tobacco": bool(getattr(product, "is_tobacco", False)),
            "requires_marking": bool(getattr(product, "requires_marking", False)),
            "detected_weight": detected_weight,
            "detected_marking_code": detected_marking_code,
        }

    return {
        "success": True,
        "barcode": barcode_text,
        "format": barcode_format,
        "product": product_dict,
        "message": f"Barcode recognized: {barcode_text}",
    }


# ── Multi-Store / Outlet Management ──────────────────────────────────────

class StoreOutletCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    store_type: str = Field(default="grocery", pattern="^(grocery|tobacco|general)$")
    address: Optional[str] = Field(default=None, max_length=300)
    phone: Optional[str] = Field(default=None, max_length=64)
    receipt_footer: Optional[str] = Field(default="Xaridingiz uchun rahmat! / Спасибо за покупку!", max_length=255)


@router.get("/stores", response_model=List[dict])
def list_stores(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """List active retail outlets / stores (multi-branch readiness)."""
    stores = session.exec(select(StoreOutlet).where(StoreOutlet.is_active == True).order_by(StoreOutlet.id)).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "store_type": s.store_type,
            "address": s.address,
            "phone": s.phone,
            "receipt_footer": s.receipt_footer,
            "is_active": s.is_active,
        }
        for s in stores
    ]


@router.post("/stores", response_model=dict)
def create_store(
    data: StoreOutletCreate,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Create a retail store / outlet (Owner only, supports multi-branch e.g. 3 tobacco shops)."""
    store = StoreOutlet(
        name=data.name.strip(),
        store_type=data.store_type,
        address=data.address.strip() if data.address else None,
        phone=data.phone.strip() if data.phone else None,
        receipt_footer=data.receipt_footer,
        is_active=True,
        created_at=utc_now(),
    )
    session.add(store)
    session.commit()
    session.refresh(store)
    return {
        "id": store.id,
        "name": store.name,
        "store_type": store.store_type,
        "address": store.address,
        "phone": store.phone,
        "receipt_footer": store.receipt_footer,
        "is_active": store.is_active,
    }
