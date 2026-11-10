from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select, func, or_, delete

from ..database import get_session
from ..models import Product, Category, User, UserRole, Sale, SaleItem, SupplierInvoice, SupplierInvoiceItem, SystemSetting
from ..auth import get_current_user, require_role
from ..seed import seed_database

router = APIRouter(prefix="/products", tags=["Products & Catalog"])

class ProductCreate(BaseModel):
    barcode: str = Field(..., min_length=1, max_length=64)
    name: str = Field(..., min_length=1, max_length=255)
    category_id: Optional[int] = None
    unit: str = Field(default="dona", max_length=20)
    purchase_price: float = Field(..., ge=0.0, le=1000000000.0)
    sale_price: float = Field(..., ge=0.0, le=1000000000.0)
    stock_quantity: float = Field(default=0.0, ge=0.0, le=1000000.0)
    min_stock_alert: float = Field(default=5.0, ge=0.0, le=100000.0)

class ProductUpdate(BaseModel):
    barcode: Optional[str] = Field(default=None, min_length=1, max_length=64)
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    category_id: Optional[int] = None
    unit: Optional[str] = Field(default=None, max_length=20)
    purchase_price: Optional[float] = Field(default=None, ge=0.0, le=1000000000.0)
    sale_price: Optional[float] = Field(default=None, ge=0.0, le=1000000000.0)
    stock_quantity: Optional[float] = Field(default=None, ge=0.0, le=1000000.0)
    min_stock_alert: Optional[float] = Field(default=None, ge=0.0, le=100000.0)
    is_active: Optional[bool] = None

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = Field(default=None, max_length=500)
    icon: Optional[str] = Field(default="tag", max_length=50)

class ProductResponse(BaseModel):
    id: int
    barcode: str
    name: str
    category_id: Optional[int]
    category_name: Optional[str] = None
    unit: str
    purchase_price: Optional[float] = None
    sale_price: float
    stock_quantity: float
    min_stock_alert: float
    is_low_stock: bool
    is_active: bool

@router.get("", response_model=dict)
def list_products(
    search: Optional[str] = Query(None, description="Qidiruv / Поиск по названию или штрихкоду"),
    category_id: Optional[int] = Query(None, description="Kategoriya ID"),
    low_stock_only: bool = Query(False, description="Faqat oz qolgan tovarlar / Только товары с остатком ниже минимального"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=2000),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    query = select(Product).where(Product.is_active == True)

    if search:
        # Sanitize wildcard characters for LIKE query safety
        safe_search = search.strip().replace("%", "\\%").replace("_", "\\_")
        search_term = f"%{safe_search}%"
        query = query.where(
            or_(
                Product.name.ilike(search_term),
                Product.barcode.ilike(search_term)
            )
        )

    if category_id:
        query = query.where(Product.category_id == category_id)

    if low_stock_only:
        query = query.where(Product.stock_quantity <= Product.min_stock_alert)

    # Get total count efficiently
    total = len(session.exec(query).all())

    # Order and paginate
    items = session.exec(query.order_by(Product.name).offset(skip).limit(limit)).all()
    
    # Load categories for display
    categories = {c.id: c.name for c in session.exec(select(Category)).all()}

    is_owner = (current_user.role == UserRole.OWNER)

    result_items = []
    for p in items:
        result_items.append({
            "id": p.id,
            "barcode": p.barcode,
            "name": p.name,
            "category_id": p.category_id,
            "category_name": categories.get(p.category_id, "Kategoriyasiz / Без категории"),
            "unit": p.unit,
            # Hide purchase price from cashier per RBAC
            "purchase_price": p.purchase_price if is_owner else None,
            "sale_price": p.sale_price,
            "stock_quantity": p.stock_quantity,
            "min_stock_alert": p.min_stock_alert,
            "is_low_stock": p.stock_quantity <= p.min_stock_alert,
            "is_active": p.is_active
        })

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": result_items
    }

@router.get("/barcode/{barcode}", response_model=dict)
def get_product_by_barcode(
    barcode: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    clean_barcode = barcode.strip()
    product = session.exec(select(Product).where(Product.barcode == clean_barcode, Product.is_active == True)).first()
    detected_weight = None

    # CIS / Uzbekistan Weighing Scales Barcode Support (EAN-13 prefixes 20..29)
    # Structure: [2-digit prefix 20..29] + [5-digit PLU code] + [5-digit weight in grams] + [1 checksum]
    if not product and len(clean_barcode) == 13 and clean_barcode[:2] in ("20", "21", "22", "23", "24", "28", "29"):
        plu_raw = clean_barcode[2:7]
        try:
            plu_clean = str(int(plu_raw))
        except ValueError:
            plu_clean = plu_raw
            
        try:
            weight_grams = float(clean_barcode[7:12])
            detected_weight = round(weight_grams / 1000.0, 3) # e.g. 1.250 kg
        except ValueError:
            detected_weight = None

        product = session.exec(
            select(Product).where(
                or_(
                    Product.barcode == clean_barcode[:7],
                    Product.barcode.startswith(clean_barcode[:7]),
                    Product.barcode == plu_clean,
                    Product.barcode == plu_raw,
                    Product.barcode.like(f"%{plu_raw}%")
                ),
                Product.is_active == True
            )
        ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Shtrixkod bo'yicha mahsulot topilmadi / Товар со штрихкодом не найден")
    
    cat = session.exec(select(Category).where(Category.id == product.category_id)).first() if product.category_id else None
    is_owner = (current_user.role == UserRole.OWNER)

    return {
        "id": product.id,
        "barcode": product.barcode,
        "name": product.name,
        "category_id": product.category_id,
        "category_name": cat.name if cat else "Kategoriyasiz / Без категории",
        "unit": product.unit,
        "purchase_price": product.purchase_price if is_owner else None,
        "sale_price": product.sale_price,
        "stock_quantity": product.stock_quantity,
        "min_stock_alert": product.min_stock_alert,
        "is_low_stock": product.stock_quantity <= product.min_stock_alert,
        "is_active": product.is_active,
        "detected_weight": detected_weight
    }

@router.get("/{product_id}", response_model=dict)
def get_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    product = session.get(Product, product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi / Товар не найден")
    
    cat = session.exec(select(Category).where(Category.id == product.category_id)).first() if product.category_id else None
    is_owner = (current_user.role == UserRole.OWNER)

    return {
        "id": product.id,
        "barcode": product.barcode,
        "name": product.name,
        "category_id": product.category_id,
        "category_name": cat.name if cat else "Kategoriyasiz / Без категории",
        "unit": product.unit,
        "purchase_price": product.purchase_price if is_owner else None,
        "sale_price": product.sale_price,
        "stock_quantity": product.stock_quantity,
        "min_stock_alert": product.min_stock_alert,
        "is_low_stock": product.stock_quantity <= product.min_stock_alert,
        "is_active": product.is_active
    }

@router.post("", response_model=dict)
def create_product(
    data: ProductCreate,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    clean_barcode = data.barcode.strip()
    existing = session.exec(select(Product).where(Product.barcode == clean_barcode)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bunday shtrixkodli mahsulot allaqachon mavjud / Товар с таким штрихкодом уже существует")
    
    product_data = data.model_dump()
    product_data["barcode"] = clean_barcode
    product_data["name"] = data.name.strip()
    
    product = Product(**product_data)
    session.add(product)
    session.commit()
    session.refresh(product)
    return {"message": "Mahsulot muvaffaqiyatli yaratildi / Товар успешно создан", "id": product.id, "barcode": product.barcode}

@router.put("/{product_id}", response_model=dict)
def update_product(
    product_id: int,
    data: ProductUpdate,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi / Товар не найден")
    
    update_data = data.model_dump(exclude_unset=True)
    if "barcode" in update_data and update_data["barcode"]:
        clean_barcode = update_data["barcode"].strip()
        if clean_barcode != product.barcode:
            existing = session.exec(select(Product).where(Product.barcode == clean_barcode)).first()
            if existing:
                raise HTTPException(status_code=400, detail="Bunday shtrixkodli mahsulot allaqachon mavjud / Товар с таким штрихкодом уже существует")
        update_data["barcode"] = clean_barcode

    if "name" in update_data and update_data["name"]:
        update_data["name"] = update_data["name"].strip()

    for key, val in update_data.items():
        setattr(product, key, val)
    
    session.add(product)
    session.commit()
    session.refresh(product)
    return {"message": "Mahsulot yangilandi / Товар обновлен", "id": product.id}

@router.delete("/{product_id}", response_model=dict)
def delete_product(
    product_id: int,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi / Товар не найден")
    product.is_active = False
    session.add(product)
    session.commit()
    return {"message": "Mahsulot arxivlandi / Товар архивирован"}

@router.post("/clear-catalog")
def clear_catalog(
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    """Clears all test products, test sales, and invoices so the store starts clean."""
    session.exec(delete(SaleItem))
    session.exec(delete(Sale))
    session.exec(delete(SupplierInvoiceItem))
    session.exec(delete(SupplierInvoice))
    session.exec(delete(Product))

    cleared_setting = session.get(SystemSetting, "catalog_cleared")
    if not cleared_setting:
        cleared_setting = SystemSetting(key="catalog_cleared", value="true")
    else:
        cleared_setting.value = "true"
    session.add(cleared_setting)
    session.commit()

    return {
        "status": "ok",
        "message": "Barcha test tovarlar va cheklar tozalandi. Do'kon toza varaqdan boshlashga tayyor! / Все тестовые товары и чеки очищены. База готова к реальной работе!"
    }

@router.post("/reseed-catalog")
def reseed_catalog(
    target_count: int = Query(2000, ge=10, le=10000),
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    cleared_setting = session.get(SystemSetting, "catalog_cleared")
    if cleared_setting:
        cleared_setting.value = "false"
        session.add(cleared_setting)
        session.commit()
    stats = seed_database(session, target_sku_count=target_count)
    return {"message": f"Katalog yangilandi: {stats['products']} ta yangi SKU / Добавлено {stats['products']} SKU"}

# Categories
@router.get("/categories/all", response_model=List[Category])
def get_categories(session: Session = Depends(get_session)):
    return session.exec(select(Category)).all()

@router.post("/categories", response_model=Category)
def create_category(
    data: CategoryCreate,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    clean_name = data.name.strip()
    existing = session.exec(select(Category).where(Category.name == clean_name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bunday nomli kategoriya allaqachon mavjud / Категория с таким именем уже существует")
    cat = Category(name=clean_name, description=data.description, icon=data.icon)
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat
