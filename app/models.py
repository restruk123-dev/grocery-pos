import enum
from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class UserRole(str, enum.Enum):
    OWNER = "owner"
    CASHIER = "cashier"

class PaymentMethod(str, enum.Enum):
    CASH = "CASH"
    CARD = "CARD"
    DEBT = "DEBT"
    MIXED = "MIXED"

class DebtTransactionType(str, enum.Enum):
    DEBT_INCREASE = "DEBT_INCREASE"
    DEBT_PAYMENT = "DEBT_PAYMENT"

class ExpenseCategory(str, enum.Enum):
    RENT = "RENT"
    UTILITIES = "UTILITIES"
    SALARY = "SALARY"
    SPOILAGE = "SPOILAGE"      # Списания / порча товаров
    TAXES = "TAXES"
    TRANSPORT = "TRANSPORT"
    OTHER = "OTHER"

class InvoiceStatus(str, enum.Enum):
    PENDING = "PENDING"
    PARTIAL = "PARTIAL"
    PAID = "PAID"

# ----------------- Database Models -----------------

class SystemSetting(SQLModel, table=True):
    key: str = Field(primary_key=True)
    value: str = Field(default="")
    updated_at: datetime = Field(default_factory=utc_now)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: str
    role: UserRole = Field(default=UserRole.CASHIER)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=utc_now)

class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: Optional[str] = None
    icon: Optional[str] = "tag"

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    barcode: str = Field(unique=True, index=True)
    name: str = Field(index=True)
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    unit: str = Field(default="dona")  # dona, kg, l, quti, metr
    purchase_price: float = Field(default=0.0)  # себестоимость
    sale_price: float = Field(default=0.0)      # цена продажи
    stock_quantity: float = Field(default=0.0)  # текущий остаток
    min_stock_alert: float = Field(default=5.0) # мин. остаток
    is_quick: bool = Field(default=False)       # Быстрый товар для кассы (без штрихкода)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

class Debtor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str = Field(index=True)
    phone: Optional[str] = Field(default=None, index=True)
    note: Optional[str] = None
    due_date: Optional[str] = Field(default=None, nullable=True) # Muddat / Срок возврата
    balance: float = Field(default=0.0) # Положительный баланс = клиент должен магазину
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

class DebtTransaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    debtor_id: int = Field(foreign_key="debtor.id", index=True)
    amount: float
    transaction_type: DebtTransactionType
    sale_id: Optional[int] = Field(default=None, foreign_key="sale.id", nullable=True)
    note: Optional[str] = None
    due_date: Optional[str] = Field(default=None, nullable=True) # Muddat / Срок возврата
    created_by_user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=utc_now)

class Sale(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    receipt_number: str = Field(unique=True, index=True)
    total_amount: float
    payment_method: PaymentMethod
    cash_received: float = Field(default=0.0)
    change_given: float = Field(default=0.0)
    card_amount: float = Field(default=0.0)
    debt_amount: float = Field(default=0.0)
    debtor_id: Optional[int] = Field(default=None, foreign_key="debtor.id", nullable=True)
    cashier_id: Optional[int] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=utc_now, index=True)

class SaleItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sale_id: int = Field(foreign_key="sale.id", index=True)
    product_id: int = Field(foreign_key="product.id", index=True)
    product_name: str
    quantity: float
    purchase_price: float # Зафиксированная себестоимость на момент продажи для отчета COGS
    unit_price: float     # Цена продажи за единицу
    total_price: float    # quantity * unit_price

class Supplier(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)

class SupplierInvoice(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    invoice_number: str = Field(unique=True, index=True)
    supplier_id: int = Field(foreign_key="supplier.id", index=True)
    total_amount: float = Field(default=0.0)
    paid_amount: float = Field(default=0.0)
    status: InvoiceStatus = Field(default=InvoiceStatus.PENDING)
    invoice_date: datetime = Field(default_factory=utc_now)
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now, index=True)

class SupplierInvoiceItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    invoice_id: int = Field(foreign_key="supplierinvoice.id", index=True)
    product_id: int = Field(foreign_key="product.id", index=True)
    quantity: float
    purchase_price: float
    total_price: float

class Expense(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    category: ExpenseCategory = Field(default=ExpenseCategory.OTHER, index=True)
    amount: float
    description: str
    product_id: Optional[int] = Field(default=None, foreign_key="product.id", nullable=True) # для списания/порчи
    spoilage_quantity: Optional[float] = None
    expense_date: datetime = Field(default_factory=utc_now, index=True)
    created_by_user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=utc_now)
