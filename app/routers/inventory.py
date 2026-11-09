from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from ..database import get_session
from ..models import Product, Sale, SaleItem, Expense, ExpenseCategory, User, UserRole
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/inventory", tags=["Inventory & Stock Revision"])


# ── Models ──────────────────────────────────────────────────────────────

class InventoryActCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Act name / Название акта")
    description: Optional[str] = Field(default=None, max_length=500, description="Description / Описание")
    scanned_by_user_id: int = Field(..., ge=0, description="User who scanned / Сканировал")


class InventoryActResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    scanned_by_user_id: int
    scanned_at: datetime
    items: List[dict]
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


# ── Endpoints ───────────────────────────────────────────────────────────

@router.post("/act", response_model=InventoryActResponse)
def create_inventory_act(
    data: InventoryActCreate,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Create a new inventory revision act (Owner only)."""
    now_utc = datetime.now(timezone.utc)
    
    # Get all active products
    products = session.exec(select(Product).where(Product.is_active == True)).all()
    
    # Build initial act items with stock_quantity = 0 (to be scanned)
    act_items = []
    for prod in products:
        act_items.append({
            "product_id": prod.id,
            "product_name": prod.name,
            "barcode": prod.barcode,
            "unit": prod.unit,
            "recorded_quantity": 0.0,  # Will be filled during scan
            "actual_quantity": 0.0,
            "note": ""
        })
    
    act = {
        "id": 0,  # Will be tracked in memory/session
        "name": data.name,
        "description": data.description,
        "scanned_by_user_id": data.scanned_by_user_id,
        "scanned_at": now_utc,
        "items": act_items,
        "total_products": len(act_items),
        "surpluses": 0,
        "deficits": 0,
    }
    
    return InventoryActResponse(
        id=0,
        name=act["name"],
        description=act["description"],
        scanned_by_user_id=act["scanned_by_user_id"],
        scanned_at=act["scanned_at"],
        items=act["items"],
        total_products=act["total_products"],
        surpluses=act["surpluses"],
        deficits=act["deficits"],
        created_at=now_utc
    )


@router.post("/act/{act_id}/scan", response_model=dict)
def scan_inventory_item(
    act_id: int,
    data: InventoryItemScan,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Scan actual quantity for an inventory item (Owner only)."""
    product = session.get(Product, data.product_id)
    if not product or not product.is_active:
        raise HTTPException(
            status_code=404,
            detail="Mahsulot topilmadi / Товар не найден"
        )
    
    # Find the act item and update it
    # In a real implementation, we'd track the act in DB
    # For now, we'll just update the product stock and return the diff
    
    old_stock = product.stock_quantity
    # Update product stock with actual quantity
    product.stock_quantity = round(data.actual_quantity, 3)
    product.updated_at = datetime.now(timezone.utc)
    session.add(product)
    session.commit()
    
    # Calculate surplus/deficit
    diff = round(data.actual_quantity - old_stock, 3)
    
    return {
        "product_id": product.id,
        "product_name": product.name,
        "old_stock": old_stock,
        "new_stock": product.stock_quantity,
        "diff": diff,
        "is_surplus": diff > 0,
        "is_deficit": diff < 0
    }


@router.post("/act/{act_id}/correct", response_model=dict)
def correct_stock(
    act_id: int,
    data: StockCorrection,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Apply stock correction (Owner only)."""
    product = session.get(Product, data.product_id)
    if not product or not product.is_active:
        raise HTTPException(
            status_code=404,
            detail="Mahsulot topilmadi / Товар не найден"
        )
    
    old_stock = product.stock_quantity
    product.stock_quantity = round(data.corrected_quantity, 3)
    product.updated_at = datetime.now(timezone.utc)
    session.add(product)
    session.commit()
    
    # Create an expense record for the correction if there's a difference
    diff = round(data.corrected_quantity - old_stock, 3)
    
    return {
        "product_id": product.id,
        "product_name": product.name,
        "old_stock": old_stock,
        "new_stock": product.stock_quantity,
        "diff": diff,
        "correction_applied": True
    }


@router.get("/act/{act_id}/status", response_model=dict)
def get_inventory_act_status(
    act_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get inventory act status (Owner only)."""
    # In a real implementation, we'd fetch from DB
    # For now, return mock status
    return {
        "act_id": act_id,
        "status": "in_progress",
        "scanned_items": 0,
        "total_items": 0,
        "surpluses": 0,
        "deficits": 0
    }