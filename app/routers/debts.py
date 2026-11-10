from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select, func, or_

from ..database import get_session
from ..models import Debtor, DebtTransaction, DebtTransactionType, User
from ..auth import get_current_user
from ..services.translit import get_search_variants

router = APIRouter(prefix="/debts", tags=["Debts Notebook (Qarzlar daftari / Тетрадь долгов)"])

class DebtorCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=150)
    phone: Optional[str] = Field(default=None, max_length=50)
    note: Optional[str] = Field(default=None, max_length=500)
    due_date: Optional[str] = Field(default=None, max_length=100)
    initial_debt: float = Field(default=0.0, ge=0.0, le=1000000000.0)

class DebtorUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    phone: Optional[str] = Field(default=None, max_length=50)
    note: Optional[str] = Field(default=None, max_length=500)
    due_date: Optional[str] = Field(default=None, max_length=100)
    is_active: Optional[bool] = None

class DebtPaymentRequest(BaseModel):
    amount: float = Field(..., gt=0.0, le=1000000000.0)
    due_date: Optional[str] = Field(default=None, max_length=100)
    note: Optional[str] = Field(default="Qarz to'lovi / Погашение долга", max_length=255)

class DebtIncreaseRequest(BaseModel):
    amount: float = Field(..., gt=0.0, le=1000000000.0)
    due_date: Optional[str] = Field(default=None, max_length=100)
    note: Optional[str] = Field(default="Qarz qo'shish / Запись долга", max_length=255)

class DebtorResponse(BaseModel):
    id: int
    full_name: str
    phone: Optional[str]
    note: Optional[str]
    due_date: Optional[str] = None
    balance: float
    is_active: bool
    created_at: datetime
    updated_at: datetime

class DebtTransactionResponse(BaseModel):
    id: int
    debtor_id: int
    amount: float
    transaction_type: DebtTransactionType
    sale_id: Optional[int]
    note: Optional[str]
    due_date: Optional[str] = None
    created_by_name: Optional[str]
    created_at: datetime

@router.get("/debtors", response_model=dict)
def list_debtors(
    search: Optional[str] = Query(None, description="Qidiruv / Поиск по имени или телефону"),
    only_with_debt: bool = Query(False, description="Faqat qarzi borlar / Только должники с положительным долгом"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    query = select(Debtor).where(Debtor.is_active == True)

    if search:
        safe_search = search.strip().replace("%", "\\%").replace("_", "\\_")
        variants = get_search_variants(safe_search)
        conds = []
        for v in variants:
            st = f"%{v}%"
            conds.append(Debtor.full_name.ilike(st))
            conds.append(Debtor.phone.ilike(st))
        query = query.where(or_(*conds))

    if only_with_debt:
        query = query.where(Debtor.balance > 0)

    total = len(session.exec(query).all())
    debtors = session.exec(query.order_by(Debtor.balance.desc(), Debtor.full_name).offset(skip).limit(limit)).all()

    return {
        "total": total,
        "items": debtors
    }

@router.get("/summary", response_model=dict)
def get_debts_summary(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    debtors = session.exec(select(Debtor).where(Debtor.is_active == True)).all()
    total_outstanding_debt = sum(d.balance for d in debtors if d.balance > 0)
    active_debtors_count = sum(1 for d in debtors if d.balance > 0)

    return {
        "total_outstanding_debt": round(total_outstanding_debt, 2),
        "debtors_count": len(debtors),
        "active_debtors_with_debt": active_debtors_count
    }

@router.post("/debtors", response_model=DebtorResponse)
def create_debtor(
    data: DebtorCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    now_utc = datetime.now(timezone.utc)
    debtor = Debtor(
        full_name=data.full_name.strip(),
        phone=data.phone.strip() if data.phone else None,
        note=data.note.strip() if data.note else None,
        due_date=data.due_date,
        balance=round(data.initial_debt, 2),
        is_active=True,
        created_at=now_utc,
        updated_at=now_utc
    )
    session.add(debtor)
    session.commit()
    session.refresh(debtor)

    if data.initial_debt > 0:
        tx = DebtTransaction(
            debtor_id=debtor.id,
            amount=round(data.initial_debt, 2),
            transaction_type=DebtTransactionType.DEBT_INCREASE,
            note="Boshlang'ich qarz / Начальная фиксация долга при регистрации",
            due_date=data.due_date,
            created_by_user_id=current_user.id,
            created_at=now_utc
        )
        session.add(tx)
        session.commit()

    return debtor

@router.get("/debtors/{debtor_id}", response_model=DebtorResponse)
def get_debtor(
    debtor_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    debtor = session.get(Debtor, debtor_id)
    if not debtor or not debtor.is_active:
        raise HTTPException(status_code=404, detail="Qarzdor topilmadi / Должник не найден")
    return debtor

@router.put("/debtors/{debtor_id}", response_model=DebtorResponse)
def update_debtor(
    debtor_id: int,
    data: DebtorUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    debtor = session.get(Debtor, debtor_id)
    if not debtor:
        raise HTTPException(status_code=404, detail="Qarzdor topilmadi / Должник не найден")
    
    update_data = data.model_dump(exclude_unset=True)
    if "full_name" in update_data and update_data["full_name"]:
        update_data["full_name"] = update_data["full_name"].strip()
    if "phone" in update_data and update_data["phone"]:
        update_data["phone"] = update_data["phone"].strip()
        
    for key, val in update_data.items():
        setattr(debtor, key, val)
    
    debtor.updated_at = datetime.now(timezone.utc)
    session.add(debtor)
    session.commit()
    session.refresh(debtor)
    return debtor

@router.post("/debtors/{debtor_id}/pay", response_model=dict)
def pay_debt(
    debtor_id: int,
    data: DebtPaymentRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    debtor = session.get(Debtor, debtor_id)
    if not debtor or not debtor.is_active:
        raise HTTPException(status_code=404, detail="Qarzdor topilmadi / Должник не найден")

    now_utc = datetime.now(timezone.utc)
    amount = round(data.amount, 2)
    new_balance = round(debtor.balance - amount, 2)
    debtor.balance = new_balance
    if data.due_date:
        debtor.due_date = data.due_date
    debtor.updated_at = now_utc
    session.add(debtor)

    tx = DebtTransaction(
        debtor_id=debtor.id,
        amount=amount,
        transaction_type=DebtTransactionType.DEBT_PAYMENT,
        note=data.note or "Qarz to'lovi / Внесение оплаты долга",
        due_date=data.due_date,
        created_by_user_id=current_user.id,
        created_at=now_utc
    )
    session.add(tx)
    session.commit()
    session.refresh(tx)

    return {
        "message": f"To'lov qabul qilindi: {amount} so'm / Оплата {amount} успешно принята",
        "debtor_id": debtor.id,
        "new_balance": debtor.balance,
        "transaction_id": tx.id
    }

@router.post("/debtors/{debtor_id}/add-debt", response_model=dict)
def add_debt(
    debtor_id: int,
    data: DebtIncreaseRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    debtor = session.get(Debtor, debtor_id)
    if not debtor or not debtor.is_active:
        raise HTTPException(status_code=404, detail="Qarzdor topilmadi / Должник не найден")

    now_utc = datetime.now(timezone.utc)
    amount = round(data.amount, 2)
    new_balance = round(debtor.balance + amount, 2)
    debtor.balance = new_balance
    if data.due_date:
        debtor.due_date = data.due_date
    debtor.updated_at = now_utc
    session.add(debtor)

    tx = DebtTransaction(
        debtor_id=debtor.id,
        amount=amount,
        transaction_type=DebtTransactionType.DEBT_INCREASE,
        note=data.note or "Qo'shimcha qarz yozildi / Запись дополнительного долга",
        due_date=data.due_date,
        created_by_user_id=current_user.id,
        created_at=now_utc
    )
    session.add(tx)
    session.commit()
    session.refresh(tx)

    return {
        "message": f"Qarz yozildi: {amount} so'm / Долг {amount} успешно зафиксирован",
        "debtor_id": debtor.id,
        "new_balance": debtor.balance,
        "transaction_id": tx.id
    }

@router.get("/debtors/{debtor_id}/history", response_model=List[DebtTransactionResponse])
def get_debtor_history(
    debtor_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    debtor = session.get(Debtor, debtor_id)
    if not debtor:
        raise HTTPException(status_code=404, detail="Qarzdor topilmadi / Должник не найден")

    txs = session.exec(
        select(DebtTransaction)
        .where(DebtTransaction.debtor_id == debtor_id)
        .order_by(DebtTransaction.created_at.desc())
    ).all()

    results = []
    for t in txs:
        creator = session.get(User, t.created_by_user_id) if t.created_by_user_id else None
        results.append(DebtTransactionResponse(
            id=t.id,
            debtor_id=t.debtor_id,
            amount=t.amount,
            transaction_type=t.transaction_type,
            sale_id=t.sale_id,
            note=t.note,
            due_date=t.due_date,
            created_by_name=creator.full_name if creator else "Tizim / Система",
            created_at=t.created_at
        ))
    return results
