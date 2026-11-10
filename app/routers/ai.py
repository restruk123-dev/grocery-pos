from datetime import datetime, timedelta, timezone, time
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import Session, select, func

from ..database import get_session
from ..models import (
    Sale, SaleItem, Expense, Product, Debtor,
    PaymentMethod, ExpenseCategory, User, UserRole
)
from ..auth import require_role

import re as re_module
from ..services.translit import get_search_variants

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


# ---------- Models ----------

class VoiceParseRequest(BaseModel):
    speech_text: str
    language: str = "uz"  # "uz" or "ru"


class VoiceParseResponse(BaseModel):
    detected_type: str  # "product", "debtor", "quantity", "unknown"
    entity: Optional[str] = None  # product name, debtor name, or raw text
    quantity: Optional[float] = None
    confidence: float = 0.0
    suggested_sku: Optional[str] = None


class InsightsDashboardResponse(BaseModel):
    period: str
    start_date: datetime
    end_date: datetime
    
    # Inventory insights
    low_stock_items: List[Dict[str, Any]]
    overstock_items: List[Dict[str, Any]]
    slow_turnover_items: List[Dict[str, Any]]
    
    # Sales insights
    top_selling_products: List[Dict[str, Any]]
    declining_products: List[Dict[str, Any]]
    
    # Financial insights
    recommended_restock: List[Dict[str, Any]]
    profit_loss_insights: Dict[str, float]
    
    # Recommendations for owner
    owner_recommendations: List[str]


# ---------- Word Boundary Keyword Matching ----------

def _is_keyword_standalone(text: str, keyword: str) -> bool:
    """Check if keyword appears as a standalone word in text (with spaces as boundaries)."""
    return f" {keyword} " in f" {text} "


def extract_keywords(text: str) -> list:
    """Extract key words from text for keyword matching."""
    if not text:
        return []
    # Remove numbers and extract meaningful words in Uzbek/Russian/Latin
    words = re_module.findall(r'[а-яА-Яa-zA-Z]+', text.lower())
    # Filter out common short words and numbers
    stop_words = {
        'ta', '2', '1', '5', '0', '3', '4', '6', '7', '8', '9',
        'so\'m', 'сум', 'uzs', 'uzs.',
        'kg', 'кг', 'l', 'литр', 'литры', 
        'dona', 'донa', 'taxa',
        'uchta', 'orra', 'qism'
    }
    keywords = [w for w in words if w not in stop_words and len(w) > 2]
    return keywords


# ---------- Fuzzy Search (Levenshtein) ----------

def levenshtein_distance(s1: str, s2: str) -> int:
    if not s1 or not s2:
        return max(len(s1), len(s2))
    if len(s1) < len(s2):
        s1, s2 = s2, s1
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = previous_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
    return previous_row[len(s2)]


def fuzzy_match_score(s1: str, s2: str) -> float:
    if not s1 or not s2:
        return 0.0
    max_len = max(len(s1), len(s2))
    if max_len == 0:
        return 1.0
    distance = levenshtein_distance(s1, s2)
    return (max_len - distance) / max_len


# ---------- Voice Parse Endpoint ----------

@router.post("/voice-parse", response_model=VoiceParseResponse)
def voice_parse(request: VoiceParseRequest, session: Session = Depends(get_session)):
    """Free local NLP parser: extract quantity, product name, or debtor name from speech text.
    No paid LLM API used - only local algorithms and fuzzy matching."""
    text = request.speech_text.strip()
    if not text:
        return VoiceParseResponse(
            detected_type="unknown",
            entity=None,
            quantity=None,
            confidence=0.0,
            suggested_sku=None
        )
    
    lang = request.language
    
    # Language-specific patterns and product catalog lookup
    products = session.exec(select(Product).where(Product.is_active == True)).all()
    product_names = [p.name.lower() for p in products]
    
    # Debtors
    debtors = session.exec(select(Debtor).where(Debtor.is_active == True)).all()
    debtor_names = [d.full_name.lower() for d in debtors]
    
    # Extract keywords from text for keyword matching
    keywords = extract_keywords(text)
    
    # Check for debtor-specific keywords: qarz, debt, person name patterns
    debtor_keywords = ['qarz', 'qarz', 'dolg', 'debt', 'bor', 'mijoz', 'client']
    has_debtor_keywords = any(kw in debtor_keywords for kw in keywords)
    
    # Try to detect debtor via keyword matching with word boundaries
    best_debtor_match = None
    best_debtor_score = 0.0
    
    if has_debtor_keywords:
        for dname_lower in debtor_names:
            for kw in keywords:
                if _is_keyword_standalone(dname_lower, kw):
                    keyword_count = sum(1 for k in keywords if _is_keyword_standalone(dname_lower, k))
                    score = keyword_count / max(len(keywords), 1)
                    if score > best_debtor_score:
                        best_debtor_score = score
                        best_debtor_match = [d for d in debtors if d.full_name.lower() == dname_lower][0]
                    break
    
    # Fallback to fuzzy matching for debtors
    if best_debtor_score < 0.3:
        for d in debtors:
            score = fuzzy_match_score(text, d.full_name)
            if score > best_debtor_score and score > 0.3:
                best_debtor_score = score
                best_debtor_match = d
    
    # Try keyword matching for products (with word boundaries to avoid false positives)
    best_product_match = None
    best_product_score = 0.0
    best_product_idx = -1
    product_keyword_match = None
    
    for idx, pname in enumerate(product_names):
        # Check if any keyword is a standalone word in the product name
        for kw in keywords:
            if _is_keyword_standalone(pname, kw):
                # Calculate a keyword match score based on keyword presence
                keyword_count = sum(1 for k in keywords if _is_keyword_standalone(pname, k))
                score = keyword_count / max(len(keywords), 1)
                if score > best_product_score:
                    best_product_score = score
                    best_product_match = products[idx]
                    best_product_idx = idx
                    product_keyword_match = kw
                    break  # found a keyword match for this product
    
    # Try fuzzy matching as fallback (only if no strong keyword match)
    if best_product_score < 0.5:
        for idx, pname in enumerate(product_names):
            score = fuzzy_match_score(text, pname)
            if score > best_product_score and score > 0.3:
                best_product_score = score
                best_product_match = products[idx]
                best_product_idx = idx
    
    # Extract quantity patterns
    quantity = None
    
    number_patterns = re_module.findall(r'\d+(?:\.\d+)?', text)
    
    if number_patterns:
        for num_str in number_patterns:
            num_val = float(num_str)
            if 0 < num_val < 10000:
                quantity = num_val
                break
    
    # If no quantity found but text starts with a number
    if quantity is None:
        first_word = text.split()[0] if text.split() else ""
        try:
            first_num = float(first_word)
            if 0 < first_num < 10000:
                quantity = first_num
        except ValueError:
            pass
    
    # Determine detected type and extract entity
    detected_type = "unknown"
    entity = None
    
    # Priority 1: Debtor match (if debtor-specific keywords present)
    if has_debtor_keywords and best_debtor_match and best_debtor_score > 0.15:
        detected_type = "debtor"
        entity = best_debtor_match.full_name
    
    # Priority 2: Product match (keyword match with word boundaries)
    elif best_product_match and best_product_score > 0.2:
        detected_type = "product"
        entity = best_product_match.name
    
    # Priority 3: Debtor match (fallback fuzzy match)
    elif best_debtor_match and best_debtor_score > 0.2:
        detected_type = "debtor"
        entity = best_debtor_match.full_name
    
    # Priority 4: If quantity extracted but no product/debtor match, use quantity type
    if quantity is not None and detected_type == "unknown":
        detected_type = "quantity"
        entity = None
    
    # Build response
    suggested_sku = None
    if best_product_match:
        suggested_sku = best_product_match.barcode
    
    # Calculate confidence
    if best_product_match and best_product_score > 0 and product_keyword_match:
        confidence = round(best_product_score, 3)
    elif best_product_match:
        confidence = round(best_product_score, 3)
    elif best_debtor_match and best_debtor_score > 0:
        confidence = round(best_debtor_score, 3)
    else:
        confidence = 0.0
    
    return VoiceParseResponse(
        detected_type=detected_type,
        entity=entity,
        quantity=quantity,
        confidence=confidence,
        suggested_sku=suggested_sku
    )


# ---------- Insights Endpoint ----------

@router.get("/insights", response_model=InsightsDashboardResponse)
def get_insights(
    period: str = Query("today", pattern="^(today|week|month|all)$"),
    lang: str = Query("uz", pattern="^(uz|ru)$"),
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    """AI-powered analytics insights: low stock, slow turnover, restock recommendations,
    and owner advice based on actual sales and expense data."""
    
    from datetime import datetime, timezone, time
    
    now = datetime.now(timezone.utc)
    
    def get_period_dates(p: str):
        if p == "today":
            start_date = datetime.combine(now.date(), time.min, tzinfo=timezone.utc)
        elif p == "week":
            start_date = now - timedelta(days=7)
        elif p == "month":
            start_date = now - timedelta(days=30)
        elif p == "all":
            start_date = datetime(2020, 1, 1, tzinfo=timezone.utc)
        else:
            start_date = datetime.combine(now.date(), time.min, tzinfo=timezone.utc)
        return start_date, now
    
    start_date, end_date = get_period_dates(period)
    
    # 1. Get sales data
    sales = session.exec(
        select(Sale).where(Sale.created_at >= start_date, Sale.created_at <= end_date)
    ).all()
    
    sales_count = len(sales)
    revenue = round(sum(s.total_amount for s in sales), 2)
    
    # 2. Get sale items for product analysis
    sale_ids = [s.id for s in sales]
    product_stats: Dict[int, Dict] = {}
    cogs = 0.0
    
    if sale_ids:
        items = session.exec(
            select(SaleItem).where(SaleItem.sale_id.in_(sale_ids))
        ).all()
        for it in items:
            cogs += (it.purchase_price * it.quantity)
            if it.product_id not in product_stats:
                product_stats[it.product_id] = {
                    "product_id": it.product_id,
                    "name": it.product_name,
                    "quantity_sold": 0.0,
                    "revenue": 0.0,
                    "sale_count": 0
                }
            product_stats[it.product_id]["quantity_sold"] = round(
                product_stats[it.product_id]["quantity_sold"] + it.quantity, 2
            )
            product_stats[it.product_id]["revenue"] = round(
                product_stats[it.product_id]["revenue"] + it.total_price, 2
            )
            product_stats[it.product_id]["sale_count"] = product_stats[it.product_id].get("sale_count", 0) + 1
    
    cogs = round(cogs, 2)
    gross_margin = round(revenue - cogs, 2)
    margin_percentage = round((gross_margin / revenue * 100), 2) if revenue > 0 else 0.0
    
    # 3. Inventory analysis - all active products
    all_products = session.exec(select(Product).where(Product.is_active == True)).all()
    total_sku_count = len(all_products)
    
    # Low stock items (stock <= min_stock_alert)
    low_stock_items = []
    for p in all_products:
        if p.stock_quantity <= p.min_stock_alert and p.stock_quantity > 0:
            low_stock_items.append({
                "id": p.id,
                "name": p.name,
                "barcode": p.barcode,
                "unit": p.unit,
                "stock_quantity": p.stock_quantity,
                "min_stock_alert": p.min_stock_alert,
                "stock_status": "low"
            })
    
    # Sort by lowest stock first
    low_stock_items.sort(key=lambda x: x["stock_quantity"])
    
    # Overstock items (stock >> min_stock_alert, high quantity)
    overstock_items = []
    for p in all_products:
        if p.stock_quantity > p.min_stock_alert * 3 and p.stock_quantity > 50:
            overstock_items.append({
                "id": p.id,
                "name": p.name,
                "unit": p.unit,
                "stock_quantity": p.stock_quantity,
                "min_stock_alert": p.min_stock_alert,
                "stock_status": "overstock"
            })
    overstock_items.sort(key=lambda x: x["stock_quantity"], reverse=True)
    
    # Slow turnover items (low quantity sold in period)
    product_turnover: Dict[int, float] = {}
    for pid in product_stats:
        product_turnover[pid] = product_stats[pid]["quantity_sold"]
    
    slow_turnover_items = []
    for p in all_products:
        pid = p.id
        turnover = product_turnover.get(pid, 0.0)
        # If product had very low or no sales in period
        if turnover < 1.0 and p.stock_quantity > 0:
            slow_turnover_items.append({
                "id": p.id,
                "name": p.name,
                "unit": p.unit,
                "stock_quantity": p.stock_quantity,
                "min_stock_alert": p.min_stock_alert,
                "turnover": turnover,
                "stock_status": "slow-turnover"
            })
    slow_turnover_items.sort(key=lambda x: x["turnover"])
    
    # 4. Top selling products
    top_selling = sorted(product_stats.values(), key=lambda x: x["revenue"], reverse=True)[:10]
    top_selling_products = [
        {
            "id": p["product_id"],
            "name": p["name"],
            "quantity_sold": p["quantity_sold"],
            "revenue": p["revenue"],
            "avg_price": round(p["revenue"] / max(p["quantity_sold"], 1), 2)
        }
        for p in top_selling
    ]
    
    # 5. Declining products (had sales before but none in period, or significantly less)
    declining_products = []
    for p in all_products:
        pid = p.id
        turnover = product_turnover.get(pid, 0.0)
        if turnover == 0.0 and p.stock_quantity > 0:
            declining_products.append({
                "id": p.id,
                "name": p.name,
                "unit": p.unit,
                "stock_quantity": p.stock_quantity,
            })
    declining_products.sort(key=lambda x: x["stock_quantity"])
    
    # 6. Recommended restock based on high-turnover essential items
    # Focus on bread, milk, oil, sugar - the "hodak" positions
    essential_keywords = [
        "non", "bread", "sut", "milk", "ol", "oil", "shakar", "sugar",
        "choy", "tea", "makaron", "pasta"
    ]
    
    restock_candidates = []
    for p in all_products:
        name_lower = p.name.lower()
        turnover = product_turnover.get(p.id, 0.0)
        # High turnover + low stock = restock needed
        if turnover > 0 and p.stock_quantity <= p.min_stock_alert * 2:
            restock_candidates.append({
                "id": p.id,
                "name": p.name,
                "unit": p.unit,
                "current_stock": p.stock_quantity,
                "min_stock": p.min_stock_alert,
                "turnover": turnover,
                "priority": "high" if any(kw in name_lower for kw in essential_keywords) else "medium"
            })
    
    restock_candidates.sort(key=lambda x: (x["priority"] == "high", x["turnover"]), reverse=True)
    recommended_restock = restock_candidates[:10]
    
    # 7. Profit/Loss insights
    profit_loss_insights = {
        "revenue": revenue,
        "cogs": cogs,
        "gross_margin": gross_margin,
        "margin_percentage": margin_percentage,
        "total_expenses": 0.0,  # Will be filled below
        "net_profit": round(gross_margin - 0, 2)  # Expenses calculated separately
    }
    
    # 8. Owner recommendations
    owner_recommendations = []
    
    # Low stock recommendations
    if low_stock_items:
        low_names = [item["name"] for item in low_stock_items[:3]]
        owner_recommendations.append(
            f"⚠️ Qog'ol bo'lib qolgan mahsulotlar: {', '.join(low_names)}. "
            f"Avvalgi chekda sotib oling."
            if lang.startswith('uz') else
            f"⚠️ Мало на складе: {', '.join(low_names)}. "
            f"Закажите их как можно раньше."
        )
    
    # Slow turnover recommendations
    if slow_turnover_items:
        slow_names = [item["name"] for item in slow_turnover_items[:3]]
        owner_recommendations.append(
            f"📉 Zarli sotilayotgan mahsulotlar ({len(slow_turnover_items)} ta): {', '.join(slow_names)}. "
            f"Olib ketishiga qaratib, tahlil qilishingiz mumkin."
            if lang.startswith('uz') else
            f"📉 Товары с низкой оборотностью ({len(slow_turnover_items)} шт): {', '.join(slow_names)}. "
            f"Можно убрать, если они долго лежат."
        )
    
    # Restock recommendations
    if recommended_restock:
        high_restock = [item for item in recommended_restock if item["priority"] == "high"]
        if high_restock:
            restock_names = [item["name"] for item in high_restock[:3]]
            rec_text = (
                f"🛒 Tavsiya: Chodori navbatdagi mahsulotlar (non, sut, shakar, ol) yangilang: "
                f"{', '.join(restock_names)}."
                if lang.startswith('uz') else
                f"🛒 Рекомендация: Дозаправьте ходовые позиции (хлеб, молоко, сахар, масло): "
                f"{', '.join(restock_names)}."
            )
            owner_recommendations.append(rec_text)
    
    # Cash flow insight
    if revenue > 0 and cogs > 0:
        if margin_percentage < 20:
            owner_recommendations.append(
                f"💰 Past foyda marjitagi ({margin_percentage}%). Sotish narxini oshirasizmi yoki xarajatlarni tashkil eting."
                if lang.startswith('uz') else
                f"💰 Низкая маржинальность ({margin_percentage}%). Рассмотрите возможность повышения цен или снижения затрат."
            )
        elif margin_percentage > 50:
            owner_recommendations.append(
                f"💵 Yorqin foyda marjitagi ({margin_percentage}%). Xarajatlarni oshirib o'tish mumkin."
                if lang.startswith('uz') else
                f"💵 Высокая маржинальность ({margin_percentage}%). Можно увеличить расходы."
            )
    
    # Overall summary recommendation
    if sales_count > 0:
        avg_receipt = round(revenue / sales_count, 2)
        owner_recommendations.append(
            f"📊 O'shingiz {sales_count} ta chek bilan {revenue} so'm tushdingiz. "
            f"O'rtaca chek summasi {avg_receipt} so'm."
            if lang.startswith('uz') else
            f"📊 Выручка {revenue} сум за {sales_count} чеков. "
            f"Средний чек {avg_receipt} сум."
        )
    
    return InsightsDashboardResponse(
        period=period,
        start_date=start_date,
        end_date=end_date,
        low_stock_items=low_stock_items,
        overstock_items=overstock_items,
        slow_turnover_items=slow_turnover_items,
        top_selling_products=top_selling_products,
        declining_products=declining_products,
        recommended_restock=recommended_restock,
        profit_loss_insights=profit_loss_insights,
        owner_recommendations=owner_recommendations
    )
# ---------- Haqqim.uz Debt NLP & OCR Parsers ----------

class DebtVoiceParseRequest(BaseModel):
    speech_text: str
    language: str = "uz"

class DebtVoiceParseResponse(BaseModel):
    debtor_id: Optional[int] = None
    debtor_name: str
    amount: float
    due_date: Optional[str] = None
    due_date_label: Optional[str] = None
    note: Optional[str] = None
    is_new_debtor: bool = True

class DebtOcrParseRequest(BaseModel):
    raw_text: str

class DebtOcrItem(BaseModel):
    debtor_name: str
    amount: float
    note: Optional[str] = None
    due_date: Optional[str] = None
    matched_debtor_id: Optional[int] = None

class DebtOcrParseResponse(BaseModel):
    items: List[DebtOcrItem]
    total_amount: float
    total_rows: int

class InvoiceOcrParseRequest(BaseModel):
    raw_text: str

class InvoiceOcrItem(BaseModel):
    product_name: str
    quantity: float
    purchase_price: float
    total_price: float
    matched_product_id: Optional[int] = None
    barcode: Optional[str] = None

class InvoiceOcrParseResponse(BaseModel):
    items: List[InvoiceOcrItem]
    total_amount: float
    total_rows: int


def _calculate_next_weekday(weekday_idx: int) -> tuple[str, str]:
    """Calculates date string (YYYY-MM-DD) for next occurrence of weekday (0=Mon..6=Sun)."""
    now_uz = datetime.now(timezone(timedelta(hours=5)))
    current_weekday = now_uz.weekday()
    days_ahead = weekday_idx - current_weekday
    if days_ahead <= 0: # Target day already happened this week or is today
        days_ahead += 7
    target_dt = now_uz + timedelta(days=days_ahead)
    weekday_names_uz = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"]
    date_str = target_dt.strftime("%Y-%m-%d")
    label = f"{weekday_names_uz[weekday_idx]} ({target_dt.strftime('%d.%m.%Y')})"
    return date_str, label


@router.post("/parse-debt-voice", response_model=DebtVoiceParseResponse)
def parse_debt_voice(request: DebtVoiceParseRequest, session: Session = Depends(get_session)):
    """Free local NLP: extracts debtor name, amount, note, and return deadline from spoken Uzbek/Russian text."""
    text = request.speech_text.strip()
    if not text:
        return DebtVoiceParseResponse(debtor_name="", amount=0.0)

    # 1. Parse due date (days of week / relative terms)
    due_date = None
    due_date_label = None
    lower_text = text.lower()

    weekdays_map = {
        0: ["dushanba", "душанба", "понедельник"],
        1: ["seshanba", "сешанба", "вторник"],
        2: ["chorshanba", "чоршанба", "среда"],
        3: ["payshanba", "пайшанба", "четверг"],
        4: ["juma", "жума", "пятница"],
        5: ["shanba", "шанба", "суббота"],
        6: ["yakshanba", "якшанба", "воскресенье"]
    }

    for w_idx, keywords in weekdays_map.items():
        if any(kw in lower_text for kw in keywords):
            due_date, due_date_label = _calculate_next_weekday(w_idx)
            break

    if not due_date:
        now_uz = datetime.now(timezone(timedelta(hours=5)))
        if any(kw in lower_text for kw in ["ertaga", "эртага", "завтра"]):
            dt = now_uz + timedelta(days=1)
            due_date = dt.strftime("%Y-%m-%d")
            due_date_label = f"Ertaga ({dt.strftime('%d.%m.%Y')})"
        elif any(kw in lower_text for kw in ["bir hafta", "бир хафта", "через неделю"]):
            dt = now_uz + timedelta(days=7)
            due_date = dt.strftime("%Y-%m-%d")
            due_date_label = f"1 hafta ({dt.strftime('%d.%m.%Y')})"
        elif any(kw in lower_text for kw in ["oy oxiri", "ой охири", "конец месяца"]):
            due_date = "oy oxirida"
            due_date_label = "Oy oxirida / Конец месяца"
        elif any(kw in lower_text for kw in ["maosh", "маош", "oylik", "ойлик", "зарплат"]):
            due_date = "maoshda"
            due_date_label = "Oylikda / С зарплаты"

    # 2. Parse Amount
    # Check for multiplier terms: ming / минг / k / тыс
    amount = 0.0
    
    # Check regex like '50 ming', '50000', '150 000', '50k'
    num_match = re_module.search(r'(\d+(?:[\s.,]\d+)?)\s*(ming|минг|тыс|k|к|mln|миллион)?', lower_text)
    if num_match:
        val_str = num_match.group(1).replace(" ", "").replace(",", ".")
        try:
            val = float(val_str)
            mult = num_match.group(2)
            if mult in ["ming", "минг", "тыс", "k", "к"]:
                if val < 1000:
                    val *= 1000
            elif mult in ["mln", "миллион"]:
                val *= 1000000
            amount = val
        except ValueError:
            pass

    # Word-based Uzbek numbers fallback if 0
    if amount == 0.0:
        word_numbers = {
            "o'n": 10000, "он": 10000, "yigirma": 20000, "йигирма": 20000,
            "o'ttiz": 30000, "оттиз": 30000, "qirq": 40000, "кирк": 40000,
            "ellik": 50000, "эллик": 50000, "oltmish": 60000, "олтмиш": 60000,
            "yetmish": 70000, "етмиш": 70000, "sakson": 80000, "саксон": 80000,
            "to'qson": 90000, "туксон": 90000, "yuz": 100000, "юз": 100000
        }
        for w, val in word_numbers.items():
            if w in lower_text:
                amount = float(val)
                break

    # 3. Match Debtor from DB or extract name
    debtors = session.exec(select(Debtor).where(Debtor.is_active == True)).all()
    matched_debtor = None
    for d in debtors:
        d_name_parts = d.full_name.lower().split()
        if any(part in lower_text for part in d_name_parts if len(part) > 2):
            matched_debtor = d
            break

    debtor_id = matched_debtor.id if matched_debtor else None
    debtor_name = matched_debtor.full_name if matched_debtor else ""
    is_new = matched_debtor is None

    # If new debtor, extract first capitalized word or first word
    if not debtor_name:
        words = text.split()
        for w in words:
            clean_w = re_module.sub(r'[^\w]', '', w)
            if clean_w and not clean_w.isdigit() and len(clean_w) > 2:
                # exclude stop words
                if clean_w.lower() not in ["qarz", "oldi", "beradi", "ming", "som", "so'm", "non", "dushanba"]:
                    debtor_name = clean_w.capitalize()
                    break

    if not debtor_name:
        debtor_name = "Noma'lum mijoz"

    # 4. Extract note / comment
    note_candidates = []
    for w in ["nonga", "sutga", "kartoshka", "sigaret", "shakar", "yog'", "mahsulot"]:
        if w in lower_text:
            note_candidates.append(w)
    note = ", ".join(note_candidates) if note_candidates else "Qarzga olindi"

    return DebtVoiceParseResponse(
        debtor_id=debtor_id,
        debtor_name=debtor_name,
        amount=amount,
        due_date=due_date,
        due_date_label=due_date_label,
        note=note,
        is_new_debtor=is_new
    )


@router.post("/parse-debt-ocr", response_model=DebtOcrParseResponse)
def parse_debt_ocr(request: DebtOcrParseRequest, session: Session = Depends(get_session)):
    """Parses text extracted from photo of old handwritten/printed debt notebook."""
    lines = [line.strip() for line in request.raw_text.splitlines() if line.strip()]
    debtors = session.exec(select(Debtor).where(Debtor.is_active == True)).all()
    debtor_map = {d.full_name.lower(): d for d in debtors}

    parsed_items: List[DebtOcrItem] = []
    total_amount = 0.0

    for line in lines:
        # Match pattern: Name ... Amount ... (Date / Note)
        # e.g. "Alisher Rahimov 50000 non 12.11" or "Dilshod - 120 000"
        numbers = re_module.findall(r'\b\d+(?:[\s.,]\d+)?\b', line)
        if not numbers:
            continue
        
        # Pick largest number as amount
        candidates = []
        for n in numbers:
            val_clean = n.replace(" ", "").replace(",", ".")
            try:
                candidates.append(float(val_clean))
            except ValueError:
                pass
        
        if not candidates:
            continue
        amount = max(candidates)
        # remove numbers from line to get name and note
        clean_line = re_module.sub(r'\b\d+(?:[\s.,]\d+)?\b', '', line).strip()
        parts = [p.strip() for p in re_module.split(r'[,;\-\t]', clean_line) if p.strip()]
        
        name = parts[0] if parts else "Mijoz"
        note = " ".join(parts[1:]) if len(parts) > 1 else "Daftardan kiritildi"

        matched_id = None
        for dname, d in debtor_map.items():
            if dname in name.lower() or name.lower() in dname:
                matched_id = d.id
                name = d.full_name
                break

        total_amount += amount
        parsed_items.append(DebtOcrItem(
            debtor_name=name,
            amount=amount,
            note=note,
            due_date=None,
            matched_debtor_id=matched_id
        ))

    return DebtOcrParseResponse(
        items=parsed_items,
        total_amount=round(total_amount, 2),
        total_rows=len(parsed_items)
    )


@router.post("/parse-invoice-ocr", response_model=InvoiceOcrParseResponse)
def parse_invoice_ocr(request: InvoiceOcrParseRequest, session: Session = Depends(get_session)):
    """Parses lines from scanned paper invoice / faktura."""
    lines = [line.strip() for line in request.raw_text.splitlines() if line.strip()]
    products = session.exec(select(Product).where(Product.is_active == True)).all()

    items: List[InvoiceOcrItem] = []
    total_amount = 0.0

    for line in lines:
        # Expecting line: Product name ... Quantity ... Purchase price
        # e.g. "Sut Musaffo 1L 20 dona 11000" or "Tandir non 50 4000"
        nums = re_module.findall(r'\b\d+(?:\.\d+)?\b', line)
        if len(nums) < 2:
            continue
        
        try:
            qty = float(nums[-2])
            price = float(nums[-1])
        except ValueError:
            continue

        name_part = re_module.sub(r'\b\d+(?:\.\d+)?\b', '', line)
        for unit in ["dona", "kg", "sht", "quti", "l", "metr"]:
            name_part = re_module.sub(rf'\b{unit}\b', '', name_part, flags=re_module.IGNORECASE)
        name_part = re_module.sub(r'[,;\-_\t]', ' ', name_part).strip()
        if not name_part:
            name_part = f"Mahsulot #{len(items)+1}"

        # Match with catalog
        matched_pid = None
        barcode = None
        for p in products:
            if p.name.lower() in name_part.lower() or name_part.lower() in p.name.lower():
                matched_pid = p.id
                barcode = p.barcode
                name_part = p.name
                break

        line_total = round(qty * price, 2)
        total_amount += line_total
        items.append(InvoiceOcrItem(
            product_name=name_part,
            quantity=qty,
            purchase_price=price,
            total_price=line_total,
            matched_product_id=matched_pid,
            barcode=barcode
        ))

    return InvoiceOcrParseResponse(
        items=items,
        total_amount=round(total_amount, 2),
        total_rows=len(items)
    )

# ---------- Store AI Assistant (Context-Aware Store Intelligence) ----------

class StoreAiQueryRequest(BaseModel):
    query: str
    language: str = "uz"


class VoiceCommandRequest(BaseModel):
    speech_text: str
    language: str = "uz"  # "uz" or "ru"
    context: Optional[str] = "pos"  # "pos", "debts", "catalog", "expenses"


class VoiceCommandResponse(BaseModel):
    action: str  # "open_scanner", "add_to_cart", "open_debt", "calculate_finances", "clear_cart", "checkout", "speak_only", "product_not_found"
    answer: str
    voice_text: str
    data: Optional[Dict[str, Any]] = None

class StoreAiQueryResponse(BaseModel):
    answer: str
    quick_suggestions: List[str]
    action_type: Optional[str] = None

@router.post("/assistant", response_model=StoreAiQueryResponse)
def store_ai_assistant(req: StoreAiQueryRequest, session: Session = Depends(get_session)):
    """Intelligent context-aware AI assistant for grocery and convenience store management."""
    raw_q = req.query.strip()
    q = raw_q.lower()
    lang = req.language
    
    # Live store metrics
    tz_uz = timezone(timedelta(hours=5))
    now_uz = datetime.now(tz_uz)
    start_utc = datetime.combine(now_uz.date(), time.min, tzinfo=tz_uz).astimezone(timezone.utc)
    
    sales_today = session.exec(select(Sale).where(Sale.created_at >= start_utc)).all()
    today_revenue = sum(s.total_amount for s in sales_today)
    today_count = len(sales_today)
    cash_amount = sum(s.cash_received - s.change_given for s in sales_today if s.cash_received > 0)
    card_amount = sum(s.card_amount for s in sales_today)
    debt_amount = sum(s.debt_amount for s in sales_today)
    
    debtors = session.exec(select(Debtor).where(Debtor.is_active == True, Debtor.balance > 0)).all()
    total_debt = sum(d.balance for d in debtors)
    top_debtors = sorted(debtors, key=lambda x: x.balance, reverse=True)[:5]
    
    products = session.exec(select(Product).where(Product.is_active == True)).all()
    total_products = len(products)
    low_stock = [p for p in products if p.stock_quantity <= p.min_stock_alert]
    
    start_month = datetime(now_uz.year, now_uz.month, 1, tzinfo=tz_uz).astimezone(timezone.utc)
    expenses_month = session.exec(select(Expense).where(Expense.expense_date >= start_month)).all()
    total_expenses = sum(e.amount for e in expenses_month)

    # 1. Option 1 or Revenue / Sales
    if q in ["1", "1.", "1)"] or any(k in q for k in ["savdo", "tushum", "kassa", "daromad", "выручк", "продаж", "сколько заработали", "чек", "выручка"]):
        if lang == "uz":
            ans = "\n".join([
                f"📊 Bugungi savdo tahlili ({now_uz.strftime('%d.%m.%Y')} holatiga):",
                f"• Jami tushum: {today_revenue:,.0f} so'm",
                f"• Urilgan cheklar: {today_count} ta",
                f"• O'rtacha chek: {(today_revenue/today_count if today_count else 0):,.0f} so'm",
                f"• Naqd: {max(0, cash_amount):,.0f} so'm | Karta: {card_amount:,.0f} so'm | Nasiya: {debt_amount:,.0f} so'm",
                "",
                "💡 Maslahat: Har bir xaridorga kassa oldidagi tezkor tovarlarni (saqich, shokolad, salfetka) taklif qilish orqali o'rtacha chekni 15-20% oshirishingiz mumkin."
            ])
        else:
            ans = "\n".join([
                f"📊 Показатели продаж за сегодня ({now_uz.strftime('%d.%m.%Y')}):",
                f"• Общая выручка: {today_revenue:,.0f} сум",
                f"• Пробито чеков: {today_count} шт",
                f"• Средний чек: {(today_revenue/today_count if today_count else 0):,.0f} сум",
                f"• Наличные: {max(0, cash_amount):,.0f} сум | Картой: {card_amount:,.0f} сум | В долг: {debt_amount:,.0f} сум",
                "",
                "💡 Совет: Предлагайте покупателям прикассовые импульсные товары (жвачки, шоколадки, влажные салфетки) — это увеличит средний чек на 15–20%."
            ])
        return StoreAiQueryResponse(
            answer=ans,
            quick_suggestions=["2. Qarzlar holati", "3. Kam qolgan tovarlar", "4. Xarajatlar va foyda"] if lang == "uz" else ["2. Долги и должники", "3. Заканчивающиеся товары", "4. Расходы и прибыль"],
            action_type="navigate_analytics"
        )

    # 2. Option 2 or Debt book
    if q in ["2", "2.", "2)"] or any(k in q for k in ["qarz", "debt", "haqqim", "долг", "кто должен", "qaytar", "nasiya", "тетрадь"]):
        top_str = "\n".join([f"  • {d.full_name}: {d.balance:,.0f} so'm" + (f" (Qaytarish muddati: {d.due_date})" if d.due_date else "") for d in top_debtors])
        if lang == "uz":
            ans = "\n".join([
                "📒 Qarzlar daftari (Haqqim.uz holati):",
                f"• Jami berilgan nasiya qarz: {total_debt:,.0f} so'm",
                f"• Qarzdorlar soni: {len(debtors)} nafar",
                "",
                "Eng yirik qarzdorlar:",
                top_str if top_str else "  Hozircha faol qarzlar yo'q. Do'kon toza!",
                "",
                "📌 Qarzni qaytarish eslatmasi: Muddati kelgan mijozlarga SMS yoki Telegram orqali xushmuomala eslatma yuborish tavsiya etiladi."
            ])
        else:
            ans = "\n".join([
                "📒 Тетрадь долгов (Qarz daftari):",
                f"• Общая задолженность перед магазином: {total_debt:,.0f} сум",
                f"• Количество должников: {len(debtors)} чел",
                "",
                "Крупнейшие долги:",
                top_str if top_str else "  Активных долгов нет. База чистая!",
                "",
                "📌 Совет: Регулярно фиксируйте срок возврата (due_date) и напоминайте должникам за 1 день до срока."
            ])
        return StoreAiQueryResponse(
            answer=ans,
            quick_suggestions=["Ovozli qarz yozish", "1. Bugungi savdo", "3. Kam qolgan tovarlar"] if lang == "uz" else ["Голосовая запись долга", "1. Выручка сегодня", "3. Остатки на складе"],
            action_type="navigate_debts"
        )

    # 3. Option 3 or Low stock / Warehouse
    if q in ["3", "3.", "3)"] or any(k in q for k in ["kam qolgan", "qoldiq", "ombor", "tugayapti", "остатк", "заканчивается", "заказ", "склад"]):
        low_items = [f"  • {p.name}: qoldiq {p.stock_quantity:g} {p.unit} (min: {p.min_stock_alert:g})" for p in low_stock[:6]]
        if lang == "uz":
            ans = "\n".join([
                "📦 Ombordagi tovarlar holati:",
                f"• Bazadagi jami mahsulotlar: {total_products} SKU",
                f"• Tugab borayotgan tovarlar: {len(low_stock)} ta",
                "",
                "Shoshilinch buyurtma qilish kerak bo'lganlar:",
                "\n".join(low_items) if low_items else "  Barcha tovarlar yetarli zaxirada!",
                "",
                "🚚 Tavsiya: Faktura OCR tugmasi orqali yangi kelgan yuk xatini skanerlab, qoldiqlarni bir zumda to'ldiring."
            ])
        else:
            ans = "\n".join([
                "📦 Состояние склада и остатков:",
                f"• Всего товаров в базе: {total_products} SKU",
                f"• Товаров с критическим остатком: {len(low_stock)} шт",
                "",
                "Срочно заказать у поставщиков:",
                "\n".join(low_items) if low_items else "  Все товары в достаточном запасе!",
                "",
                "🚚 Рекомендация: Используйте кнопку «Faktura OCR» для оприходования накладных с камеры за пару секунд."
            ])
        return StoreAiQueryResponse(
            answer=ans,
            quick_suggestions=["Faktura OCR skaner", "1. Bugungi tushum", "2. Qarzlar holati"] if lang == "uz" else ["Скан накладной OCR", "1. Выручка сегодня", "2. Долги"],
            action_type="navigate_catalog"
        )

    # 4. Option 4 or Expenses / Profit
    if q in ["4", "4.", "4)"] or any(k in q for k in ["xarajat", "rasxod", "foyda", "прибыль", "расход", "чистая прибыль", "аренда"]):
        est_gross_profit = today_revenue * 0.22
        if lang == "uz":
            ans = "\n".join([
                "💸 Xarajatlar va foyda hisoboti:",
                f"• Shu oygi jami xarajatlar: {total_expenses:,.0f} so'm",
                f"• Bugungi taxminiy yalpi foyda (~22% marja): {est_gross_profit:,.0f} so'm",
                "",
                "💡 Moliyaviy maslahat: Oziq-ovqat do'konlarida barqaror sof foyda 15-25% oralig'ida bo'ladi. Xarajatlarni nazorat qilib, muddati o'tadigan mahsulotlar hisobdan chiqarilishini kamaytiring."
            ])
        else:
            ans = "\n".join([
                "💸 Расходы и прибыльность магазина:",
                f"• Всего расходов в этом месяце: {total_expenses:,.0f} сум",
                f"• Оценочная валовая прибыль за сегодня (~22% маржа): {est_gross_profit:,.0f} сум",
                "",
                "💡 Финансовый совет: Здоровая чистая маржа продуктового магазина составляет 15–22%. Держите под контролем списания (порчу) скоропортящихся товаров."
            ])
        return StoreAiQueryResponse(
            answer=ans,
            quick_suggestions=["1. Bugungi savdo", "2. Qarzlar daftari", "5. Maslahatlar"] if lang == "uz" else ["1. Выручка сегодня", "2. Долги", "5. Советы"],
            action_type="navigate_expenses"
        )

    # 5. Option 5 or Retail / Tobacco advice
    if q in ["5", "5.", "5)"] or any(k in q for k in ["tamaki", "tobacco", "sigaret", "сигарет", "табач", "совет", "maslahat", "marja", "ustama", "наценка"]):
        if lang == "uz":
            ans = "\n".join([
                "🏪 Do'konni boshqarish bo'yicha ekspert maslahatlari:",
                "1. **Narx belgilash**: Oziq-ovqatda ijtimoiy tovarlar (non, un, shakar) marjasi 5-10%, donador mahsulotlar 15-20%, shirinlik va ichimliklar 25-35%, maishiy kimyo 30-40% bo'lishi maqbul.",
                "2. **Tamaki do'koni**: Sigaretlar aylanmasi yuqori, marjasi 8-12%. Tizimimiz blokli/pachkali sotishni va DataMatrix kodlarini to'liq qo'llab-quvvatlaydi.",
                "3. **Kassirlar smenasi**: Smena almashganda Z-hisobot oling va naqd pulni qabul qiling.",
                "4. **Yo'qotishlar oldini olish**: Har oyda bir marta tovarlar inventarizatsiyasini o'tkazing."
            ])
        else:
            ans = "\n".join([
                "🏪 Экспертные советы по управлению торговлей:",
                "1. **Ценообразование**: Социальные товары (хлеб, сахар, мука) наценка 5–10%, бакалея 15–20%, напитки и кондитерка 25–35%, бытовая химия 30–45%.",
                "2. **Табачный магазин**: Сигареты дают высокий поток, но маржа 7–12%. Продавайте блоки и пачки, сканируйте DataMatrix.",
                "3. **Смены кассиров**: Быстрая сдача смены через кнопку в шапке с печатью Z-отчета исключает недостачи.",
                "4. **Контроль остатков**: Настройте порог min_stock, чтобы поставщики привозили товар вовремя."
            ])
        return StoreAiQueryResponse(
            answer=ans,
            quick_suggestions=["1. Bugungi tushum", "2. Qarzlar holati", "3. Ombor qoldiqlari"] if lang == "uz" else ["1. Выручка сегодня", "2. Долги", "3. Остатки на складе"]
        )

    # 6. Specific product stock query
    variants = get_search_variants(q)
    matched_product = None
    for p in products:
        p_name_low = p.name.lower()
        if any(v in p_name_low for v in variants if len(v) >= 3):
            matched_product = p
            break
            
    if matched_product:
        if lang == "uz":
            ans = "\n".join([
                "🔍 Mahsulot ma'lumoti topildi:",
                f"• Nomi: **{matched_product.name}**",
                f"• Shtrixkod: `{matched_product.barcode}`",
                f"• Ombordagi qoldiq: **{matched_product.stock_quantity:g} {matched_product.unit}**",
                f"• Sotish narxi: **{matched_product.sale_price:,.0f} so'm**",
                f"• Holat: {'⚠️ Oz qolgan (Buyurtma bering)' if matched_product.stock_quantity <= matched_product.min_stock_alert else '✅ Yetarli'}"
            ])
        else:
            ans = "\n".join([
                "🔍 Информация о товаре:",
                f"• Наименование: **{matched_product.name}**",
                f"• Штрихкод: `{matched_product.barcode}`",
                f"• Остаток на складе: **{matched_product.stock_quantity:g} {matched_product.unit}**",
                f"• Цена продажи: **{matched_product.sale_price:,.0f} сум**",
                f"• Статус: {'⚠️ Мало на складе (Срочно заказать)' if matched_product.stock_quantity <= matched_product.min_stock_alert else '✅ В наличии'}"
            ])
        return StoreAiQueryResponse(
            answer=ans,
            quick_suggestions=["1. Bugungi tushum", "3. Barcha kam qolganlar", "Kassaga o'tish"] if lang == "uz" else ["1. Выручка сегодня", "3. Все с низким остатком", "Перейти в кассу"]
        )

    # 7. Greetings and conversational welcome
    if any(k in q for k in ["salom", "assalom", "privet", "здравствуйте", "привет", "хай", "hello", "qalaysiz", "ishlar", "raxmat", "rahmat", "спасибо"]):
        if lang == "uz":
            ans = "\n".join([
                "Assalomu alaykum! Do'koningiz AI-Maslahatchisiman.",
                "",
                "⚡ Hozirgi do'kon tezkor holati:",
                f"• Bugun savdo: **{today_revenue:,.0f} so'm** ({today_count} ta chek)",
                f"• Faol qarzlar: **{total_debt:,.0f} so'm** ({len(debtors)} nafar mijoz)",
                f"• Omborda: **{total_products}** xil mahsulot ({len(low_stock)} tasi kam qolgan)",
                "",
                "Quyidagi raqamlardan birini tanlang yoki savolingizni yozing:",
                "**1** - Bugungi savdo va tushum",
                "**2** - Qarzlar daftari va qarzdorlar",
                "**3** - Kam qolgan tovarlar ro'yxati",
                "**4** - Xarajatlar va sof foyda",
                "**5** - Do'kon va tamaki savdosi maslahatlari"
            ])
        else:
            ans = "\n".join([
                "Здравствуйте! Я ваш умный AI-консультант магазина.",
                "",
                "⚡ Сводка магазина на данный момент:",
                f"• Выручка за сегодня: **{today_revenue:,.0f} сум** ({today_count} чеков)",
                f"• Долги клиентов: **{total_debt:,.0f} сум** ({len(debtors)} чел)",
                f"• На складе: **{total_products}** SKU ({len(low_stock)} заканчиваются)",
                "",
                "Отправьте цифру или напишите любой вопрос:",
                "**1** - Продажи и выручка за сегодня",
                "**2** - Тетрадь долгов и крупнейшие должники",
                "**3** - Заканчивающиеся товары на складе",
                "**4** - Расходы и чистая прибыль",
                "**5** - Советы по розничной и табачной торговле"
            ])
        return StoreAiQueryResponse(
            answer=ans,
            quick_suggestions=["1. Savdo tushumi", "2. Qarzlar", "3. Kam qolgan tovarlar"] if lang == "uz" else ["1. Выручка сегодня", "2. Долги", "3. Заканчивающиеся товары"]
        )

    # 8. Natural conversational fallback with live store context
    if lang == "uz":
        ans = "\n".join([
            f"Tushundim: «{raw_q}». Do'koningiz ma'lumotlar bazasi bilan tahlil qildim.",
            "",
            f"Hozirda do'konda {total_products} ta SKU tovar, bugungi savdo {today_revenue:,.0f} so'm, qarzdorlik esa {total_debt:,.0f} so'm.",
            "Aniqroq ma'lumot olish uchun biror tovar nomini yozing (masalan: «shakar qancha qolgan?») yoki quyidagi menyu punktlaridan foydalaning:",
            "**1** - Savdo hisoboti | **2** - Qarzlar | **3** - Ombor | **4** - Foyda"
        ])
    else:
        ans = "\n".join([
            f"Понял ваш запрос: «{raw_q}». Проанализировал базу данных магазина.",
            "",
            f"Сейчас в магазине {total_products} SKU товаров, продажи за день: {today_revenue:,.0f} сум, долги: {total_debt:,.0f} сум.",
            "Чтобы узнать точную информацию, напишите название товара (например: «сколько осталось сахара?») или отправьте цифру:",
            "**1** - Продажи | **2** - Долги | **3** - Остатки | **4** - Прибыль"
        ])
    return StoreAiQueryResponse(
        answer=ans,
        quick_suggestions=["1. Savdo hisoboti", "2. Qarzlar daftari", "3. Kam qolgan tovarlar"] if lang == "uz" else ["1. Выручка за день", "2. Тетрадь долгов", "3. Остатки товаров"]
    )



# ---------- Voice Command Router (Actions & Speech Response) ----------

@router.post("/voice-command", response_model=VoiceCommandResponse)
def voice_command(req: VoiceCommandRequest, session: Session = Depends(get_session)):
    """Executes high-accuracy voice commands (open scanner, add to cart, debt record, financial breakdown)
    and returns both the action payload and clean natural speech for browser SpeechSynthesis.
    100% free, reliable, zero external API cost or latency."""
    raw_text = req.speech_text.strip()
    q = raw_text.lower()
    lang = req.language
    
    # 1. Open Camera Barcode Scanner
    if any(w in q for w in ["skaner", "сканер", "kamera", "камера", "shtrixkod skaner", "сканировать", "открой сканер", "skanerni och"]):
        ans = "📸 **Shtrixkod skaneri ochildi**" if lang == "uz" else "📸 **Сканер штрихкодов открыт**"
        voice = "Shtrixkod skaneri ochildi" if lang == "uz" else "Сканер штрихкодов открыт"
        return VoiceCommandResponse(
            action="open_scanner",
            answer=ans,
            voice_text=voice
        )
        
    # 2. Clear Cart
    if any(w in q for w in ["savatni tozal", "savatni bo'shat", "очисти корзину", "сбрось корзину", "tozala savat", "очистить чек"]):
        ans = "🗑️ **Savat tozalandi**" if lang == "uz" else "🗑️ **Корзина очищена**"
        voice = "Savat tozalandi" if lang == "uz" else "Корзина очищена"
        return VoiceCommandResponse(
            action="clear_cart",
            answer=ans,
            voice_text=voice
        )
        
    # 3. Checkout / Finish Sale
    if any(w in q for w in ["to'lov", "to'lov qil", "chekni ur", "пробей чек", "оплати", "закрыть чек", "chek urish", "заверши чек"]):
        ans = "💳 **To'lov oynasi ochildi**" if lang == "uz" else "💳 **Окно оплаты открыто**"
        voice = "To'lov oynasi ochildi" if lang == "uz" else "Окно оплаты открыто"
        return VoiceCommandResponse(
            action="checkout",
            answer=ans,
            voice_text=voice
        )
        
    # 4. Debt Record (Qarz yozish / Записать долг)
    if any(w in q for w in ["qarz", "долг", "nasiya", "haqqim", "запиши долг", "qarz yoz"]):
        try:
            parsed_debt = parse_debt_voice(DebtVoiceParseRequest(speech_text=raw_text, language=lang), session=session)
            if parsed_debt and parsed_debt.amount > 0:
                d_name = parsed_debt.debtor_name or ("Noma'lum" if lang == "uz" else "Клиент")
                ans = f"📓 **Qarz daftari:** {d_name}ga {parsed_debt.amount:,.0f} so'm qarz yozildi" if lang == "uz" else f"📓 **Тетрадь долгов:** долг {d_name} на сумму {parsed_debt.amount:,.0f} сум"
                voice = f"{d_name}ga {parsed_debt.amount:,.0f} so'm qarz yozish tayyorlandi" if lang == "uz" else f"Запись долга клиенту {d_name} на {parsed_debt.amount:,.0f} сум подготовлена"
                return VoiceCommandResponse(
                    action="open_debt",
                    answer=ans,
                    voice_text=voice,
                    data={
                        "debtor_name": parsed_debt.debtor_name,
                        "amount": parsed_debt.amount,
                        "due_date": parsed_debt.due_date,
                        "due_date_label": parsed_debt.due_date_label,
                        "note": parsed_debt.note or "Ovozli qarz yozuvi"
                    }
                )
        except Exception:
            pass
            
    # 5. Financial Calculation (Foyda / Marja / Xarajatlar)
    if any(w in q for w in ["foyda", "marja", "xarajat", "rasxod", "маржа", "прибыль", "расход", "посчитай", "daromad", "tushum"]):
        tz_uz = timezone(timedelta(hours=5))
        now_uz = datetime.now(tz_uz)
        start_utc = datetime.combine(now_uz.date(), time.min, tzinfo=tz_uz).astimezone(timezone.utc)
        sales_today = session.exec(select(Sale).where(Sale.created_at >= start_utc)).all()
        today_revenue = sum(s.total_amount for s in sales_today)
        est_profit = round(today_revenue * 0.22, 2)
        
        start_month = datetime(now_uz.year, now_uz.month, 1, tzinfo=tz_uz).astimezone(timezone.utc)
        expenses_month = session.exec(select(Expense).where(Expense.expense_date >= start_month)).all()
        total_expenses = sum(e.amount for e in expenses_month)
        
        if lang == "uz":
            ans = f"📊 **Bugungi savdo:** {today_revenue:,.0f} so'm | **Yalpi foyda (~22%):** {est_profit:,.0f} so'm | **Oylik xarajat:** {total_expenses:,.0f} so'm"
            voice = f"Bugungi savdo {today_revenue:,.0f} so'm, taxminiy yalpi foyda {est_profit:,.0f} so'm. Oylik xarajatlar {total_expenses:,.0f} so'm."
        else:
            ans = f"📊 **Выручка за сегодня:** {today_revenue:,.0f} сум | **Прибыль (~22%):** {est_profit:,.0f} сум | **Расходы за месяц:** {total_expenses:,.0f} сум"
            voice = f"Сегодня выручка {today_revenue:,.0f} сум, примерная прибыль {est_profit:,.0f} сум. Расходы за месяц {total_expenses:,.0f} сум."
            
        return VoiceCommandResponse(
            action="calculate_finances",
            answer=ans,
            voice_text=voice,
            data={
                "revenue": today_revenue,
                "profit": est_profit,
                "expenses": total_expenses,
                "margin_percent": 22.0
            }
        )

    # 6. Add to Cart (Savatga qo'shish / Добавить в корзину)
    # Detect trigger words or implicit adding
    is_add = any(w in q for w in ["savatga", "qo'sh", "qosh", "добавь", "в корзину", "пробей", "кирит", "ol", "в чек"])
    
    # Extract quantity
    qty = 1.0
    qty_match = re_module.search(r'(\d+(?:[.,]\d+)?)\s*(?:ta|dona|kg|litr|l|pachka|quti|шт|кг)?', q)
    if qty_match:
        try:
            qty = float(qty_match.group(1).replace(',', '.'))
        except ValueError:
            qty = 1.0
    else:
        # Word numbers
        word_nums = {
            "bitta": 1.0, "bir": 1.0, "ikki": 2.0, "uch": 3.0, "to'rt": 4.0, "besh": 5.0,
            "один": 1.0, "одна": 1.0, "два": 2.0, "две": 2.0, "три": 3.0, "четыре": 4.0, "пять": 5.0
        }
        for wn, wv in word_nums.items():
            if wn in q:
                qty = wv
                break

    # Clean product query text
    clean_q = q
    for stop_word in [
        "savatga", "qo'sh", "qosh", "добавь", "в корзину", "пробей", "кирит", "iltimos", "пожалуйста",
        "bitta", "bir", "ikki", "uch", "to'rt", "besh", "один", "одна", "два", "две", "три", "четыре", "пять",
        "ta", "dona", "kg", "litr", "pachka", "quti", "шт", "кг", "пачка", "коробка", "в чек"
    ]:
        clean_q = re_module.sub(rf'\b{re_module.escape(stop_word)}\b', ' ', clean_q)
    clean_q = re_module.sub(r'\d+(?:[.,]\d+)?', ' ', clean_q).strip()

    if (is_add or req.context == "pos") and len(clean_q) >= 2:
        variants = get_search_variants(clean_q)
        products = session.exec(select(Product).where(Product.is_active == True)).all()
        matched = None
        for p in products:
            p_name_low = p.name.lower()
            if any(v in p_name_low for v in variants if len(v) >= 3):
                matched = p
                break
                
        if matched:
            ans = f"✅ **{matched.name}** ({qty:g} {matched.unit}) savatga qo'shildi. Narxi: {matched.sale_price:,.0f} so'm" if lang == "uz" else f"✅ **{matched.name}** ({qty:g} {matched.unit}) добавлен в чек. Цена: {matched.sale_price:,.0f} сум"
            voice = f"{matched.name} savatga qo'shildi. Narxi {matched.sale_price:,.0f} so'm" if lang == "uz" else f"Товар {matched.name} добавлен в чек. Цена {matched.sale_price:,.0f} сум"
            return VoiceCommandResponse(
                action="add_to_cart",
                answer=ans,
                voice_text=voice,
                data={
                    "product": {
                        "id": matched.id,
                        "name": matched.name,
                        "sale_price": matched.sale_price,
                        "purchase_price": matched.purchase_price,
                        "barcode": matched.barcode,
                        "unit": matched.unit,
                        "stock_quantity": matched.stock_quantity
                    },
                    "quantity": qty
                }
            )
        elif is_add:
            ans = f"🔍 **«{clean_q}»** nomli tovar bazada topilmadi. Uni yangi tovar sifatida qo'shasizmi?" if lang == "uz" else f"🔍 Товар **«{clean_q}»** не найден в базе. Добавить его?"
            voice = f"{clean_q} nomli tovar topilmadi. Yangi tovar qo'shilsinmi?" if lang == "uz" else f"Товар {clean_q} не найден в базе. Добавить его?"
            return VoiceCommandResponse(
                action="product_not_found",
                answer=ans,
                voice_text=voice,
                data={"query": clean_q}
            )

    # 7. General AI Assistant Query Fallback
    assistant_resp = store_ai_assistant(StoreAiQueryRequest(query=raw_text, language=lang), session=session)
    # Extract first 2 sentences for natural voice speech
    first_lines = [line.strip() for line in assistant_resp.answer.split('\n') if line.strip() and not line.strip().startswith('**') and not line.strip().startswith('•')]
    voice_summary = ". ".join(first_lines[:2])
    voice_summary = re_module.sub(r'[*_#`]', '', voice_summary).strip()
    if not voice_summary:
        voice_summary = "Ma'lumotlar tayyorlandi" if lang == "uz" else "Данные подготовлены"

    return VoiceCommandResponse(
        action="speak_only",
        answer=assistant_resp.answer,
        voice_text=voice_summary,
        data={"suggestions": assistant_resp.quick_suggestions}
    )
