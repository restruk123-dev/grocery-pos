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

class StockMovementType(str, enum.Enum):
    SALE = "SALE"
    PURCHASE_INVOICE = "PURCHASE_INVOICE"
    RETURN = "RETURN"
    SPOILAGE = "SPOILAGE"
    REVISION_ADJUSTMENT = "REVISION_ADJUSTMENT"
    MANUAL_CORRECTION = "MANUAL_CORRECTION"
    INITIAL_SETUP = "INITIAL_SETUP"

class InventoryActStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    IN_PROGRESS = "IN_PROGRESS"
    APPLIED = "APPLIED"
    CANCELLED = "CANCELLED"

class ShiftStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

class CashActionType(str, enum.Enum):
    CASH_IN = "CASH_IN"     # Kirim (masalan: qaytim uchun pul qo'shish)
    CASH_OUT = "CASH_OUT"   # Chiqim (inkassatsiya, xo'jayin olib ketgan pul)


# ----------------- Database Models -----------------

class SystemSetting(SQLModel, table=True):
    key: str = Field(primary_key=True)
    value: str = Field(default="")
    updated_at: datetime = Field(default_factory=utc_now)

class StoreOutlet(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    store_type: str = Field(default="grocery")  # "grocery", "tobacco", "general"
    address: Optional[str] = None
    phone: Optional[str] = None
    legal_name: Optional[str] = None
    inn_stir: Optional[str] = None
    tax_regime: str = Field(default="TURNOVER_1")  # TURNOVER_1, TURNOVER_4, TURNOVER_CUSTOM, VAT_12, VAT_6
    tax_rate_percent: float = Field(default=1.0)
    kkm_serial: Optional[str] = None
    tobacco_license_note: Optional[str] = None
    receipt_footer: Optional[str] = "Xaridingiz uchun rahmat! / Спасибо за покупку!"
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=utc_now)

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
    expiry_date: Optional[str] = Field(default=None) # YYYY-MM-DD срок годности
    ikpu_code: Optional[str] = Field(default=None, index=True)  # 17-digit MXIK / ИКПУ from tasnif.soliq.uz
    package_code: Optional[str] = Field(default=None)           # Packaging code from tasnif.soliq.uz
    vat_rate: float = Field(default=0.0)                        # 0.0, 12.0, or -1.0 (Without VAT)
    requires_marking: bool = Field(default=False)               # Asl Belgisi DataMatrix required
    is_tobacco: bool = Field(default=False)                     # Tobacco / 18+ compliance flag
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
    discount_amount: float = Field(default=0.0)
    vat_amount: float = Field(default=0.0)
    fiscal_status: str = Field(default="INTERNAL")  # INTERNAL or FISCALIZED
    fiscal_sign: Optional[str] = None
    fiscal_receipt_url: Optional[str] = None
    payment_method: PaymentMethod
    cash_received: float = Field(default=0.0)
    change_given: float = Field(default=0.0)
    card_amount: float = Field(default=0.0)
    debt_amount: float = Field(default=0.0)
    debtor_id: Optional[int] = Field(default=None, foreign_key="debtor.id", nullable=True)
    cashier_id: Optional[int] = Field(default=None, foreign_key="user.id")
    shift_id: Optional[int] = Field(default=None, foreign_key="cashshift.id", nullable=True)
    store_id: Optional[int] = Field(default=None, foreign_key="storeoutlet.id", nullable=True)
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
    ikpu_code: Optional[str] = None
    package_code: Optional[str] = None
    vat_rate: float = Field(default=0.0)
    vat_amount: float = Field(default=0.0)
    marking_code: Optional[str] = Field(default=None, index=True)  # GS1 DataMatrix (Asl Belgisi)
    is_tobacco: bool = Field(default=False)

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

class StockMovement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id", index=True)
    movement_type: StockMovementType = Field(index=True)
    quantity_delta: float
    previous_stock: float
    new_stock: float
    cost_price: Optional[float] = None
    unit_price: Optional[float] = None
    reference_id: Optional[str] = Field(default=None, index=True)
    note: Optional[str] = None
    created_by_user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=utc_now, index=True)

class InventoryAct(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    act_number: str = Field(unique=True, index=True)
    name: str
    description: Optional[str] = None
    status: InventoryActStatus = Field(default=InventoryActStatus.IN_PROGRESS, index=True)
    total_products: int = Field(default=0)
    surpluses: int = Field(default=0)
    deficits: int = Field(default=0)
    created_by_user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    applied_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utc_now, index=True)

class InventoryActItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    act_id: int = Field(foreign_key="inventoryact.id", index=True)
    product_id: int = Field(foreign_key="product.id", index=True)
    product_name: str
    barcode: str
    unit: str = Field(default="dona")
    expected_quantity: float
    actual_quantity: float
    difference: float = Field(default=0.0)
    purchase_price: float = Field(default=0.0)
    note: Optional[str] = None
    scanned_at: datetime = Field(default_factory=utc_now)

class CashShift(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    shift_number: str = Field(unique=True, index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    store_id: Optional[int] = Field(default=None, foreign_key="storeoutlet.id", nullable=True)
    status: ShiftStatus = Field(default=ShiftStatus.OPEN, index=True)
    opened_at: datetime = Field(default_factory=utc_now)
    closed_at: Optional[datetime] = None
    initial_cash: float = Field(default=0.0)
    cash_sales: float = Field(default=0.0)
    card_sales: float = Field(default=0.0)
    debt_sales: float = Field(default=0.0)
    total_sales: float = Field(default=0.0)
    sales_count: int = Field(default=0)
    refunds_count: int = Field(default=0)
    refunds_amount: float = Field(default=0.0)
    cash_in: float = Field(default=0.0)
    cash_out: float = Field(default=0.0)
    expected_cash: float = Field(default=0.0)
    actual_cash: Optional[float] = None
    difference: Optional[float] = None
    note: Optional[str] = None

class CashShiftAction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    shift_id: int = Field(foreign_key="cashshift.id", index=True)
    action_type: CashActionType
    amount: float
    reason: str
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=utc_now)

class SaleRefund(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    refund_number: str = Field(unique=True, index=True)
    sale_id: int = Field(foreign_key="sale.id", index=True)
    receipt_number: str = Field(index=True)
    total_refund_amount: float
    cash_refunded: float = Field(default=0.0)
    card_refunded: float = Field(default=0.0)
    debt_reduced: float = Field(default=0.0)
    reason: str
    shift_id: Optional[int] = Field(default=None, foreign_key="cashshift.id", nullable=True)
    processed_by_user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=utc_now, index=True)

class SaleRefundItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    refund_id: int = Field(foreign_key="salerefund.id", index=True)
    product_id: int = Field(foreign_key="product.id", index=True)
    product_name: str
    quantity: float
    unit_price: float
    total_price: float


