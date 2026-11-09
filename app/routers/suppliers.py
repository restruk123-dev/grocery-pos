import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from ..database import get_session
from ..models import (
    Supplier, SupplierInvoice, SupplierInvoiceItem,
    Product, InvoiceStatus, User, UserRole
)
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/suppliers", tags=["Suppliers & Invoices"])

class SupplierCreate(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    note: Optional[str] = None

class InvoiceItemCreate(BaseModel):
    product_id: int
    quantity: float = Field(..., gt=0)
    purchase_price: float = Field(..., ge=0)

class InvoiceCreate(BaseModel):
    supplier_id: int
    invoice_number: Optional[str] = None
    items: List[InvoiceItemCreate]
    paid_amount: float = Field(default=0.0, ge=0)
    note: Optional[str] = None

class SupplierPaymentRequest(BaseModel):
    amount: float = Field(..., gt=0)

@router.get("", response_model=List[Supplier])
def list_suppliers(
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    return session.exec(select(Supplier).order_by(Supplier.name)).all()

@router.post("", response_model=Supplier)
def create_supplier(
    data: SupplierCreate,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    existing = session.exec(select(Supplier).where(Supplier.name == data.name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="Поставщик с таким названием уже существует")
    
    supplier = Supplier(**data.model_dump(), created_at=datetime.now(timezone.utc))
    session.add(supplier)
    session.commit()
    session.refresh(supplier)
    return supplier

@router.get("/invoices", response_model=List[dict])
def list_invoices(
    supplier_id: Optional[int] = Query(None),
    status: Optional[InvoiceStatus] = Query(None),
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    query = select(SupplierInvoice)
    if supplier_id:
        query = query.where(SupplierInvoice.supplier_id == supplier_id)
    if status:
        query = query.where(SupplierInvoice.status == status)

    invoices = session.exec(query.order_by(SupplierInvoice.created_at.desc())).all()
    results = []
    for inv in invoices:
        supplier = session.get(Supplier, inv.supplier_id)
        results.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "supplier_id": inv.supplier_id,
            "supplier_name": supplier.name if supplier else "Неизвестно",
            "total_amount": inv.total_amount,
            "paid_amount": inv.paid_amount,
            "debt_to_supplier": round(inv.total_amount - inv.paid_amount, 2),
            "status": inv.status,
            "invoice_date": inv.invoice_date,
            "note": inv.note
        })
    return results

@router.post("/invoices", response_model=dict)
def create_invoice(
    data: InvoiceCreate,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    supplier = session.get(Supplier, data.supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Поставщик не найден")

    if not data.items:
        raise HTTPException(status_code=400, detail="Накладная должна содержать хотя бы один товар")

    now_utc = datetime.now(timezone.utc)
    # Generate invoice number if not provided
    inv_number = data.invoice_number
    if not inv_number:
        inv_number = f"INV-{now_utc.strftime('%Y%m%d')}-{uuid.uuid4().hex[:5].upper()}"

    total_amount = sum(round(item.quantity * item.purchase_price, 2) for item in data.items)
    paid = round(data.paid_amount, 2)
    
    if paid >= total_amount:
        inv_status = InvoiceStatus.PAID
    elif paid > 0:
        inv_status = InvoiceStatus.PARTIAL
    else:
        inv_status = InvoiceStatus.PENDING

    invoice = SupplierInvoice(
        invoice_number=inv_number,
        supplier_id=supplier.id,
        total_amount=total_amount,
        paid_amount=paid,
        status=inv_status,
        note=data.note,
        invoice_date=now_utc,
        created_at=now_utc
    )
    session.add(invoice)
    session.commit()
    session.refresh(invoice)

    # Add items, update inventory stock and purchase price
    for item in data.items:
        product = session.get(Product, item.product_id)
        if not product:
            continue
        
        # Increase product stock!
        product.stock_quantity = round(product.stock_quantity + item.quantity, 3)
        # Update purchase price to reflect current supplier cost
        product.purchase_price = item.purchase_price
        product.updated_at = now_utc
        session.add(product)

        inv_item = SupplierInvoiceItem(
            invoice_id=invoice.id,
            product_id=product.id,
            quantity=item.quantity,
            purchase_price=item.purchase_price,
            total_price=round(item.quantity * item.purchase_price, 2)
        )
        session.add(inv_item)

    session.commit()

    return {
        "message": f"Накладная {invoice.invoice_number} успешно принята",
        "invoice_id": invoice.id,
        "total_amount": invoice.total_amount,
        "items_count": len(data.items),
        "status": invoice.status
    }

@router.post("/invoices/{invoice_id}/pay", response_model=dict)
def pay_invoice(
    invoice_id: int,
    data: SupplierPaymentRequest,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    invoice = session.get(SupplierInvoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Накладная не найдена")

    invoice.paid_amount = round(invoice.paid_amount + data.amount, 2)
    if invoice.paid_amount >= invoice.total_amount:
        invoice.status = InvoiceStatus.PAID
    else:
        invoice.status = InvoiceStatus.PARTIAL

    session.add(invoice)
    session.commit()
    session.refresh(invoice)

    return {
        "message": f"Оплата поставщику на сумму {data.amount} сохранена",
        "invoice_id": invoice.id,
        "total_amount": invoice.total_amount,
        "paid_amount": invoice.paid_amount,
        "remaining_debt": round(invoice.total_amount - invoice.paid_amount, 2),
        "status": invoice.status
    }
