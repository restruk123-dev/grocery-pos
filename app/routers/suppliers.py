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
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    barcode: Optional[str] = None
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

@router.get("", response_model=List[dict])
def list_suppliers(
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    suppliers = session.exec(select(Supplier).order_by(Supplier.name)).all()
    results = []
    for s in suppliers:
        invoices = session.exec(select(SupplierInvoice).where(SupplierInvoice.supplier_id == s.id)).all()
        total_invoiced = sum(inv.total_amount for inv in invoices)
        total_paid = sum(inv.paid_amount for inv in invoices)
        debt = round(total_invoiced - total_paid, 2)
        last_inv = max((inv.invoice_date or inv.created_at for inv in invoices), default=None)
        results.append({
            "id": s.id,
            "name": s.name,
            "contact_person": s.contact_person,
            "phone": s.phone,
            "address": s.address,
            "note": s.note,
            "created_at": s.created_at,
            "total_invoiced": round(total_invoiced, 2),
            "total_paid": round(total_paid, 2),
            "current_debt": debt,
            "last_delivery_date": last_inv.isoformat() if last_inv else None,
            "invoices_count": len(invoices)
        })
    return results

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

@router.get("/{supplier_id}/reconciliation", response_model=dict)
def get_supplier_reconciliation(
    supplier_id: int,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    supplier = session.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Поставщик не найден")

    invoices = session.exec(
        select(SupplierInvoice)
        .where(SupplierInvoice.supplier_id == supplier.id)
        .order_by(SupplierInvoice.created_at.desc())
    ).all()

    detailed_invoices = []
    total_invoiced = 0.0
    total_paid = 0.0
    for inv in invoices:
        items = session.exec(select(SupplierInvoiceItem).where(SupplierInvoiceItem.invoice_id == inv.id)).all()
        item_details = []
        for it in items:
            p = session.get(Product, it.product_id)
            item_details.append({
                "product_id": it.product_id,
                "product_name": p.name if p else "Товар",
                "quantity": it.quantity,
                "purchase_price": it.purchase_price,
                "total_price": it.total_price
            })
        total_invoiced += inv.total_amount
        total_paid += inv.paid_amount
        detailed_invoices.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "invoice_date": (inv.invoice_date or inv.created_at).isoformat(),
            "total_amount": inv.total_amount,
            "paid_amount": inv.paid_amount,
            "remaining_debt": round(inv.total_amount - inv.paid_amount, 2),
            "status": inv.status,
            "note": inv.note,
            "items": item_details
        })

    tot_inv = round(total_invoiced, 2)
    tot_pd = round(total_paid, 2)
    cur_dbt = round(max(0.0, total_invoiced - total_paid), 2)
    return {
        "supplier": {
            "id": supplier.id,
            "name": supplier.name,
            "phone": supplier.phone,
            "contact_person": supplier.contact_person,
            "address": supplier.address,
            "note": supplier.note
        },
        "total_invoiced": tot_inv,
        "total_paid": tot_pd,
        "current_debt": cur_dbt,
        "summary": {
            "total_invoiced": tot_inv,
            "total_paid": tot_pd,
            "current_debt": cur_dbt
        },
        "invoices_count": len(detailed_invoices),
        "invoices": detailed_invoices
    }

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

    try:
        session.add(invoice)
        session.flush()

        for item in data.items:
            product = None
            if item.product_id:
                product = session.get(Product, item.product_id)
            if not product and item.barcode:
                product = session.exec(select(Product).where(Product.barcode == item.barcode.strip(), Product.is_active == True)).first()
            if not product and item.product_name:
                product = session.exec(select(Product).where(Product.name == item.product_name.strip(), Product.is_active == True)).first()

            if not product:
                # Auto-create new product from invoice item
                p_barcode = item.barcode.strip() if item.barcode else f"INT-{uuid.uuid4().hex[:6].upper()}"
                p_name = item.product_name.strip() if item.product_name else f"Tovar ({p_barcode})"
                s_price = round(item.purchase_price * 1.25, 2)
                product = Product(
                    barcode=p_barcode,
                    name=p_name,
                    purchase_price=item.purchase_price,
                    sale_price=s_price,
                    stock_quantity=0.0,
                    unit="dona",
                    is_active=True,
                    created_at=now_utc,
                    updated_at=now_utc
                )
                session.add(product)
                session.flush()

            product.stock_quantity = round(product.stock_quantity + item.quantity, 3)
            product.purchase_price = item.purchase_price
            product.updated_at = now_utc
            session.add(product)
            session.add(SupplierInvoiceItem(
                invoice_id=invoice.id,
                product_id=product.id,
                quantity=item.quantity,
                purchase_price=item.purchase_price,
                total_price=round(item.quantity * item.purchase_price, 2),
            ))
        session.commit()
        session.refresh(invoice)
    except Exception:
        session.rollback()
        raise

    debt = round(max(0.0, invoice.total_amount - invoice.paid_amount), 2)
    return {
        "message": f"Faktura {invoice.invoice_number} qabul qilindi",
        "invoice_id": invoice.id,
        "total_amount": invoice.total_amount,
        "paid_amount": invoice.paid_amount,
        "debt_to_supplier": debt,
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
