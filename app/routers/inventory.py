import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select, func

from ..database import get_session
from ..models import (
    Product, Expense, ExpenseCategory, User, UserRole,
    InventoryAct, InventoryActItem, InventoryActStatus,
    StockMovement, StockMovementType, utc_now
)
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/inventory", tags=["Inventory & Stock Revision"])


# ── Schemas ──────────────────────────────────────────────────────────────

class InventoryActCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Act name / Название акта")
    description: Optional[str] = Field(default=None, max_length=500, description="Description / Описание")
    scanned_by_user_id: Optional[int] = Field(default=None, description="User who scanned / Сканировал")


class InventoryActItemResponse(BaseModel):
    id: int
    act_id: int
    product_id: int
    product_name: str
    barcode: str
    unit: str
    expected_quantity: float
    actual_quantity: float
    difference: float
    purchase_price: float
    note: Optional[str] = None
    scanned_at: datetime


class InventoryActResponse(BaseModel):
    id: int
    act_number: str
    name: str
    description: Optional[str] = None
    status: str
    scanned_by_user_id: Optional[int] = None
    scanned_at: Optional[datetime] = None
    items: List[Dict[str, Any]] = []
    total_products: int
    surpluses: int
    deficits: int
    created_at: datetime


class InventoryItemScan(BaseModel):
    product_id: int = Field(..., ge=0, description="Product ID / ID товара")
    actual_quantity: float = Field(..., ge=0, description="Actual quantity / Фактическое количество")
    note: Optional[str] = Field(default=None, max_length=500, description="Note / Примечание")


class StockCorrection(BaseModel):
    product_id: int = Field(..., ge=0, description="Product ID / ID товара")
    corrected_quantity: float = Field(..., ge=0, description="Corrected quantity / Исправленное количество")
    reason: str = Field(..., min_length=1, max_length=500, description="Reason / Причина")


class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    movement_type: str
    quantity_delta: float
    previous_stock: float
    new_stock: float
    cost_price: Optional[float] = None
    unit_price: Optional[float] = None
    reference_id: Optional[str] = None
    note: Optional[str] = None
    created_by_name: Optional[str] = None
    created_at: datetime


# ── Inventory Endpoints ───────────────────────────────────────────────────

@router.post("/act", response_model=InventoryActResponse)
def create_inventory_act(
    data: InventoryActCreate,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Create a new inventory revision act and snapshot current recorded stock."""
    now_utc = utc_now()
    act_number = f"ACT-{now_utc.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    products = session.exec(select(Product).where(Product.is_active == True).order_by(Product.name)).all()

    act = InventoryAct(
        act_number=act_number,
        name=data.name,
        description=data.description,
        status=InventoryActStatus.IN_PROGRESS,
        total_products=len(products),
        surpluses=0,
        deficits=0,
        created_by_user_id=data.scanned_by_user_id or current_user.id,
        created_at=now_utc,
    )
    session.add(act)
    session.flush()

    act_items = []
    for prod in products:
        item = InventoryActItem(
            act_id=act.id,
            product_id=prod.id,
            product_name=prod.name,
            barcode=prod.barcode,
            unit=prod.unit,
            expected_quantity=prod.stock_quantity,
            actual_quantity=prod.stock_quantity, # Defaults to expected until scanned
            difference=0.0,
            purchase_price=prod.purchase_price,
            scanned_at=now_utc,
        )
        session.add(item)
        act_items.append({
            "product_id": prod.id,
            "product_name": prod.name,
            "barcode": prod.barcode,
            "unit": prod.unit,
            "recorded_quantity": prod.stock_quantity,
            "actual_quantity": prod.stock_quantity,
            "difference": 0.0,
            "note": "",
        })

    session.commit()
    session.refresh(act)

    return InventoryActResponse(
        id=act.id,
        act_number=act.act_number,
        name=act.name,
        description=act.description,
        status=act.status.value,
        scanned_by_user_id=act.created_by_user_id,
        scanned_at=now_utc,
        items=act_items,
        total_products=act.total_products,
        surpluses=act.surpluses,
        deficits=act.deficits,
        created_at=act.created_at,
    )


@router.get("/acts", response_model=List[Dict[str, Any]])
def list_inventory_acts(
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """List all inventory revision acts."""
    acts = session.exec(select(InventoryAct).order_by(InventoryAct.created_at.desc())).all()
    return [{
        "id": a.id,
        "act_number": a.act_number,
        "name": a.name,
        "description": a.description,
        "status": a.status.value,
        "total_products": a.total_products,
        "surpluses": a.surpluses,
        "deficits": a.deficits,
        "created_at": a.created_at.isoformat(),
        "applied_at": a.applied_at.isoformat() if a.applied_at else None,
    } for a in acts]


@router.get("/act/{act_id}", response_model=InventoryActResponse)
def get_inventory_act(
    act_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get inventory revision act by ID with items."""
    act = session.get(InventoryAct, act_id)
    if not act:
        raise HTTPException(status_code=404, detail="Inventory act not found")

    items = session.exec(select(InventoryActItem).where(InventoryActItem.act_id == act_id)).all()
    items_data = [{
        "id": it.id,
        "product_id": it.product_id,
        "product_name": it.product_name,
        "barcode": it.barcode,
        "unit": it.unit,
        "recorded_quantity": it.expected_quantity,
        "actual_quantity": it.actual_quantity,
        "difference": it.difference,
        "note": it.note or "",
    } for it in items]

    return InventoryActResponse(
        id=act.id,
        act_number=act.act_number,
        name=act.name,
        description=act.description,
        status=act.status.value,
        scanned_by_user_id=act.created_by_user_id,
        scanned_at=act.created_at,
        items=items_data,
        total_products=act.total_products,
        surpluses=act.surpluses,
        deficits=act.deficits,
        created_at=act.created_at,
    )


@router.post("/act/{act_id}/scan", response_model=dict)
def scan_inventory_item(
    act_id: int,
    data: InventoryItemScan,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Scan and record actual count for an inventory item inside an act."""
    act = session.get(InventoryAct, act_id)
    if not act:
        raise HTTPException(status_code=404, detail="Inventory act not found")
    if act.status == InventoryActStatus.APPLIED:
        raise HTTPException(status_code=400, detail="Cannot edit an already applied inventory act")

    item = session.exec(
        select(InventoryActItem).where(
            InventoryActItem.act_id == act_id,
            InventoryActItem.product_id == data.product_id
        )
    ).first()

    if not item:
        product = session.get(Product, data.product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        item = InventoryActItem(
            act_id=act_id,
            product_id=product.id,
            product_name=product.name,
            barcode=product.barcode,
            unit=product.unit,
            expected_quantity=product.stock_quantity,
            actual_quantity=data.actual_quantity,
            difference=round(data.actual_quantity - product.stock_quantity, 3),
            purchase_price=product.purchase_price,
            note=data.note,
            scanned_at=utc_now(),
        )
        session.add(item)
    else:
        item.actual_quantity = round(data.actual_quantity, 3)
        item.difference = round(item.actual_quantity - item.expected_quantity, 3)
        if data.note:
            item.note = data.note
        item.scanned_at = utc_now()
        session.add(item)

    # Re-calculate act summary counts
    session.flush()
    all_items = session.exec(select(InventoryActItem).where(InventoryActItem.act_id == act_id)).all()
    surpluses = sum(1 for it in all_items if it.difference > 0)
    deficits = sum(1 for it in all_items if it.difference < 0)
    act.surpluses = surpluses
    act.deficits = deficits
    session.add(act)
    session.commit()

    diff = item.difference
    return {
        "act_id": act.id,
        "product_id": item.product_id,
        "product_name": item.product_name,
        "recorded_quantity": item.expected_quantity,
        "actual_quantity": item.actual_quantity,
        "diff": diff,
        "is_surplus": diff > 0,
        "is_deficit": diff < 0,
    }


@router.post("/act/{act_id}/apply", response_model=dict)
def apply_inventory_act(
    act_id: int,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Apply inventory revision results to live stock and create stock movements."""
    act = session.get(InventoryAct, act_id)
    if not act:
        raise HTTPException(status_code=404, detail="Inventory act not found")
    if act.status == InventoryActStatus.APPLIED:
        raise HTTPException(status_code=400, detail="Act already applied")

    items = session.exec(select(InventoryActItem).where(InventoryActItem.act_id == act_id)).all()
    now_utc = utc_now()
    adjusted_count = 0

    for item in items:
        if item.difference != 0:
            product = session.get(Product, item.product_id)
            if product:
                prev_stock = product.stock_quantity
                product.stock_quantity = item.actual_quantity
                product.updated_at = now_utc
                session.add(product)

                # Record stock movement audit
                movement = StockMovement(
                    product_id=product.id,
                    movement_type=StockMovementType.REVISION_ADJUSTMENT,
                    quantity_delta=item.difference,
                    previous_stock=prev_stock,
                    new_stock=item.actual_quantity,
                    cost_price=item.purchase_price,
                    reference_id=act.act_number,
                    note=f"Inventarizatsiya ({act.name}): {item.note or ''}".strip(),
                    created_by_user_id=current_user.id,
                    created_at=now_utc,
                )
                session.add(movement)
                adjusted_count += 1

    act.status = InventoryActStatus.APPLIED
    act.applied_at = now_utc
    session.add(act)
    session.commit()

    return {
        "success": True,
        "act_id": act.id,
        "act_number": act.act_number,
        "status": "APPLIED",
        "adjusted_products_count": adjusted_count,
        "message": f"Inventarizatsiya muvaffaqiyatli qo'llandi ({adjusted_count} ta tovar to'g'rilandi)",
    }


@router.post("/act/{act_id}/correct", response_model=dict)
def correct_stock(
    act_id: int,
    data: StockCorrection,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Apply manual stock correction directly for a product (Owner only)."""
    product = session.get(Product, data.product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi / Товар не найден")

    old_stock = product.stock_quantity
    new_stock = round(data.corrected_quantity, 3)
    diff = round(new_stock - old_stock, 3)
    now_utc = utc_now()

    product.stock_quantity = new_stock
    product.updated_at = now_utc
    session.add(product)

    # Record stock movement
    movement = StockMovement(
        product_id=product.id,
        movement_type=StockMovementType.MANUAL_CORRECTION,
        quantity_delta=diff,
        previous_stock=old_stock,
        new_stock=new_stock,
        cost_price=product.purchase_price,
        unit_price=product.sale_price,
        reference_id=f"CORR-{product.id}",
        note=data.reason,
        created_by_user_id=current_user.id,
        created_at=now_utc,
    )
    session.add(movement)
    session.commit()

    return {
        "product_id": product.id,
        "product_name": product.name,
        "old_stock": old_stock,
        "new_stock": new_stock,
        "diff": diff,
        "correction_applied": True,
    }


@router.get("/act/{act_id}/status", response_model=dict)
def get_inventory_act_status(
    act_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get inventory act summary status."""
    act = session.get(InventoryAct, act_id)
    if not act:
        raise HTTPException(status_code=404, detail="Inventory act not found")

    items = session.exec(select(InventoryActItem).where(InventoryActItem.act_id == act_id)).all()
    scanned_count = sum(1 for it in items if it.actual_quantity != it.expected_quantity or it.note)

    return {
        "act_id": act.id,
        "status": act.status.value,
        "scanned_items": scanned_count,
        "total_items": act.total_products,
        "surpluses": act.surpluses,
        "deficits": act.deficits,
    }


# ── Stock Movement Ledger ─────────────────────────────────────────────────

@router.get("/movements", response_model=Dict[str, Any])
def list_stock_movements(
    product_id: Optional[int] = Query(None, description="Filter by Product ID"),
    movement_type: Optional[StockMovementType] = Query(None, description="Filter by type (SALE, PURCHASE_INVOICE, etc.)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """List immutable stock movements audit trail (Owner only)."""
    query = select(StockMovement)
    if product_id:
        query = query.where(StockMovement.product_id == product_id)
    if movement_type:
        query = query.where(StockMovement.movement_type == movement_type)

    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()

    movements = session.exec(query.order_by(StockMovement.created_at.desc()).offset(skip).limit(limit)).all()

    # Pre-fetch products and users to prevent N+1
    p_ids = {m.product_id for m in movements}
    u_ids = {m.created_by_user_id for m in movements if m.created_by_user_id}
    prod_map = {p.id: p.name for p in session.exec(select(Product).where(Product.id.in_(p_ids))).all()} if p_ids else {}
    user_map = {u.id: u.full_name for u in session.exec(select(User).where(User.id.in_(u_ids))).all()} if u_ids else {}

    items = [
        StockMovementResponse(
            id=m.id,
            product_id=m.product_id,
            product_name=prod_map.get(m.product_id, "Noma'lum"),
            movement_type=m.movement_type.value,
            quantity_delta=m.quantity_delta,
            previous_stock=m.previous_stock,
            new_stock=m.new_stock,
            cost_price=m.cost_price,
            unit_price=m.unit_price,
            reference_id=m.reference_id,
            note=m.note,
            created_by_name=user_map.get(m.created_by_user_id, "Tizim"),
            created_at=m.created_at,
        ).model_dump()
        for m in movements
    ]

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": items,
    }
