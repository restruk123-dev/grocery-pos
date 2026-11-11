import csv
import io
import math
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sqlmodel import Session, select, func, or_, delete
from sqlalchemy.exc import IntegrityError

from ..database import get_session
from ..models import (
    Product, Category, User, UserRole, Sale, SaleItem,
    SupplierInvoice, SupplierInvoiceItem, SystemSetting,
    Expense, Debtor, DebtTransaction, Supplier
)
from ..auth import get_current_user, require_role, verify_password
from ..seed import seed_database
from ..services.translit import get_search_variants

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
    is_quick: bool = Field(default=False)

class ProductUpdate(BaseModel):
    barcode: Optional[str] = Field(default=None, min_length=1, max_length=64)
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    category_id: Optional[int] = None
    unit: Optional[str] = Field(default=None, max_length=20)
    purchase_price: Optional[float] = Field(default=None, ge=0.0, le=1000000000.0)
    sale_price: Optional[float] = Field(default=None, ge=0.0, le=1000000000.0)
    stock_quantity: Optional[float] = Field(default=None, ge=0.0, le=1000000.0)
    min_stock_alert: Optional[float] = Field(default=None, ge=0.0, le=100000.0)
    is_quick: Optional[bool] = None
    is_active: Optional[bool] = None

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = Field(default=None, max_length=500)
    icon: Optional[str] = Field(default="tag", max_length=50)

class ClearStoreRequest(BaseModel):
    confirmation: str = Field(..., min_length=1, max_length=64)
    current_password: str = Field(..., min_length=1, max_length=1024)

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
    is_quick: bool = False
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
        safe_search = search.strip().replace("%", "\\%").replace("_", "\\_")
        variants = get_search_variants(safe_search)
        conds = []
        for v in variants:
            st = f"%{v}%"
            conds.append(Product.name.ilike(st))
            conds.append(Product.barcode.ilike(st))
        query = query.where(or_(*conds))

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
            "is_quick": bool(getattr(p, "is_quick", False)),
            "is_low_stock": p.stock_quantity <= p.min_stock_alert,
            "is_active": p.is_active
        })

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": result_items
    }

@router.get("/quick", response_model=List[dict])
def get_quick_products(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Returns quick products for POS screen directly from database."""
    items = session.exec(
        select(Product).where(Product.is_active == True, Product.is_quick == True).order_by(Product.name)
    ).all()

    # If no products explicitly marked as quick, fallback to first 8 active products
    if not items:
        items = session.exec(
            select(Product).where(Product.is_active == True).order_by(Product.name).limit(8)
        ).all()

    is_owner = (current_user.role == UserRole.OWNER)
    return [{
        "id": p.id,
        "barcode": p.barcode,
        "name": p.name,
        "unit": p.unit,
        "sale_price": p.sale_price,
        "purchase_price": p.purchase_price if is_owner else None,
        "stock_quantity": p.stock_quantity,
        "is_quick": bool(getattr(p, "is_quick", False))
    } for p in items]


CSV_COLUMNS = ["barcode", "name", "sale_price", "purchase_price", "stock_quantity", "unit", "category_name", "min_stock_alert", "is_quick"]
MAX_CATALOG_IMPORT_BYTES = 5 * 1024 * 1024
MAX_CATALOG_IMPORT_ROWS = 10_000


def _spreadsheet_safe_text(value: str) -> str:
    """Prevent spreadsheet formula execution when opening exported catalog text."""
    text = str(value or "")
    first = text.lstrip(" \t\r\n")[:1]
    if first in {"=", "+", "-", "@"} or text.startswith(("\t", "\r", "\n")):
        return "'" + text
    return text


@router.get("/import-template", response_model=None)
def download_catalog_template(current_user: User = Depends(require_role([UserRole.OWNER]))):
    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(CSV_COLUMNS)
    content = "\ufeff" + output.getvalue()
    return Response(
        content=content,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="grocery-catalog-template.csv"'},
    )


@router.get("/export-csv", response_model=None)
def export_catalog_csv(
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    products = session.exec(select(Product).where(Product.is_active == True).order_by(Product.name)).all()
    categories = {category.id: category.name for category in session.exec(select(Category)).all()}
    output = io.StringIO(newline="")
    writer = csv.DictWriter(output, fieldnames=CSV_COLUMNS)
    writer.writeheader()
    for product in products:
        writer.writerow({
            "barcode": _spreadsheet_safe_text(product.barcode),
            "name": _spreadsheet_safe_text(product.name),
            "sale_price": product.sale_price,
            "purchase_price": product.purchase_price,
            "stock_quantity": product.stock_quantity,
            "unit": _spreadsheet_safe_text(product.unit),
            "category_name": _spreadsheet_safe_text(categories.get(product.category_id, "")),
            "min_stock_alert": product.min_stock_alert,
            "is_quick": "true" if product.is_quick else "false",
        })
    return Response(
        content="\ufeff" + output.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="grocery-catalog.csv"'},
    )


@router.post("/import-csv", response_model=dict, status_code=status.HTTP_201_CREATED)
async def import_catalog_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    raw = await file.read(MAX_CATALOG_IMPORT_BYTES + 1)
    if len(raw) > MAX_CATALOG_IMPORT_BYTES:
        raise HTTPException(status_code=413, detail="CSV must be 5 MB or smaller")
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            text = raw.decode("cp1251")
        except UnicodeDecodeError as exc:
            raise HTTPException(status_code=400, detail="CSV must use UTF-8 or Windows-1251 encoding") from exc

    try:
        reader = csv.DictReader(io.StringIO(text, newline=""), strict=True)
        headers = [header.strip().lower() if header else "" for header in (reader.fieldnames or [])]
        if not {"barcode", "name", "sale_price"}.issubset(headers):
            raise HTTPException(status_code=422, detail="Required CSV columns: barcode, name, sale_price")

        row_errors = []
        prepared = []
        seen_barcodes = set()
        for line_number, raw_row in enumerate(reader, start=2):
            if line_number - 1 > MAX_CATALOG_IMPORT_ROWS:
                raise HTTPException(status_code=413, detail=f"CSV supports up to {MAX_CATALOG_IMPORT_ROWS} products")
            row = {str(key).strip().lower(): (value or "").strip() for key, value in raw_row.items() if key}
            barcode = row.get("barcode", "")
            name = row.get("name", "")
            if not barcode or len(barcode) > 64 or not name or len(name) > 255:
                row_errors.append({"line": line_number, "error": "barcode (1-64) and name (1-255) are required"})
                continue
            if barcode in seen_barcodes:
                row_errors.append({"line": line_number, "error": "duplicate barcode in this CSV"})
                continue
            seen_barcodes.add(barcode)

            values = {}
            bad_number = False
            for field_name, default in (("sale_price", None), ("purchase_price", "0"), ("stock_quantity", "0"), ("min_stock_alert", "5")):
                raw_value = row.get(field_name, "")
                if raw_value == "" and default is not None:
                    raw_value = default
                try:
                    value = float(raw_value)
                    if not math.isfinite(value) or value < 0:
                        raise ValueError
                    values[field_name] = value
                except (TypeError, ValueError):
                    row_errors.append({"line": line_number, "error": f"invalid non-negative number: {field_name}"})
                    bad_number = True
                    break
            if bad_number:
                continue

            quick_value = row.get("is_quick", "false").lower()
            if quick_value not in {"true", "false", "1", "0", "yes", "no"}:
                row_errors.append({"line": line_number, "error": "is_quick must be true or false"})
                continue
            prepared.append({
                "_line_number": line_number,
                "barcode": barcode,
                "name": name,
                **values,
                "unit": (row.get("unit") or "dona")[:20],
                "category_name": row.get("category_name", "")[:150],
                "is_quick": quick_value in {"true", "1", "yes"},
            })
    except csv.Error as exc:
        raise HTTPException(status_code=400, detail=f"Invalid CSV: {exc}") from exc

    if not prepared and not row_errors:
        raise HTTPException(status_code=422, detail="CSV contains no product rows")
    existing_barcodes = set(session.exec(select(Product.barcode)).all())
    for product in prepared:
        if product["barcode"] in existing_barcodes:
            row_errors.append({"line": product["_line_number"], "error": "barcode already exists; update it in the catalog instead"})
    if row_errors:
        raise HTTPException(status_code=422, detail={"message": "Nothing imported; fix the CSV errors and retry", "errors": row_errors[:50], "error_count": len(row_errors)})

    category_by_name = {category.name: category for category in session.exec(select(Category)).all()}
    try:
        for item in prepared:
            item.pop("_line_number")
            category_id = None
            category_name = item.pop("category_name")
            if category_name:
                category = category_by_name.get(category_name)
                if not category:
                    category = Category(name=category_name)
                    session.add(category)
                    session.flush()
                    category_by_name[category_name] = category
                category_id = category.id
            session.add(Product(**item, category_id=category_id))
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(status_code=409, detail="Catalog import failed; no rows were saved because of a duplicate category or product barcode.") from exc
    return {"created": len(prepared), "message": f"Imported {len(prepared)} products"}

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
        "is_quick": bool(getattr(product, "is_quick", False)),
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
        "is_quick": bool(getattr(product, "is_quick", False)),
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
        if not existing.is_active:
            # Reactivate previously archived product
            existing.is_active = True
            existing.name = data.name.strip()
            existing.category_id = data.category_id
            existing.unit = data.unit
            existing.purchase_price = data.purchase_price
            existing.sale_price = data.sale_price
            existing.stock_quantity = data.stock_quantity
            existing.min_stock_alert = data.min_stock_alert
            existing.is_quick = data.is_quick
            session.add(existing)
            session.commit()
            session.refresh(existing)
            return {"message": "Mahsulot qayta faollashtirildi", "id": existing.id, "barcode": existing.barcode}
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
            if existing and existing.id != product.id:
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
@router.post("/clear-all")
@router.post("/reset-demo-data")
def clear_catalog(
    data: ClearStoreRequest,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    """Destructive full-store reset; require explicit phrase and password re-entry."""
    if data.confirmation != "DELETE ALL STORE DATA":
        raise HTTPException(status_code=400, detail="Type DELETE ALL STORE DATA to confirm")
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    session.exec(delete(Expense))
    session.exec(delete(DebtTransaction))
    session.exec(delete(Debtor))
    session.exec(delete(SupplierInvoiceItem))
    session.exec(delete(SupplierInvoice))
    session.exec(delete(Supplier))
    session.exec(delete(SaleItem))
    session.exec(delete(Sale))
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
        "message": "Barcha test tovarlar, qarzlar, xarajatlar va cheklar tozalandi. Do'kon toza varaqdan boshlashga 100% tayyor! / Все тестовые товары, долги, расходы и чеки очищены. База готова к реальной торговле!"
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
def get_categories(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
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
        return existing
    cat = Category(name=clean_name, description=data.description, icon=data.icon)
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat
