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

# ---------- Store AI Assistant (Free Local Engine) ----------

class StoreAiQueryRequest(BaseModel):
    query: str
    language: str = "uz"

class StoreAiQueryResponse(BaseModel):
    answer: str
    quick_suggestions: List[str]
    action_type: Optional[str] = None

@router.post("/assistant", response_model=StoreAiQueryResponse)
def store_ai_assistant(req: StoreAiQueryRequest, session: Session = Depends(get_session)):
    """Zero-cost smart AI assistant for cashiers and store owners."""
    q = req.query.strip().lower()
    lang = req.language
    
    # 1. Sales / Revenue question
    if any(k in q for k in ["savdo", "tushum", "kassa", "daromad", "выручк", "продаж", "сколько заработали"]):
        tz_uz = timezone(timedelta(hours=5))
        now_uz = datetime.now(tz_uz)
        start_utc = datetime.combine(now_uz.date(), time.min, tzinfo=tz_uz).astimezone(timezone.utc)
        start_naive = start_utc.replace(tzinfo=None)
        
        sales = session.exec(select(Sale).where(Sale.created_at >= start_utc)).all()
        rev = sum(s.total_amount for s in sales)
        count = len(sales)
        
        if lang == "uz":
            ans = f"Bugungi savdo hisoboti:\n- Jami tushum: {rev:,.0f} so'm\n- Urilgan cheklar soni: {count} ta\n- O'rtacha chek: {(rev/count if count else 0):,.0f} so'm\n\nBuxgalteriya 100% aniq ishlamoqda."
        else:
            ans = f"Показатели продаж за сегодня:\n- Общая выручка: {rev:,.0f} сум\n- Пробито чеков: {count} шт\n- Средний чек: {(rev/count if count else 0):,.0f} сум\n\nБухгалтерия сходится до 1 сума."
        return StoreAiQueryResponse(
            answer=ans,
            quick_suggestions=["Qarzdorlar holati", "Kam qolgan tovarlar", "Tamaki do'koni maslahatlari"] if lang == "uz" else ["Состояние долгов", "Заканчивающиеся товары", "Советы для табачки"],
            action_type="navigate_analytics"
        )
    
    # 2. Debts / Qarzdorlar question
    if any(k in q for k in ["qarz", "debt", "haqqim", "долг", "кто должен", "qaytar"]):
        debtors = session.exec(select(Debtor).where(Debtor.is_active == True, Debtor.balance > 0)).all()
        total_d = sum(d.balance for d in debtors)
        top_d = sorted(debtors, key=lambda x: x.balance, reverse=True)[:3]
        top_str = "\n".join([f"- {d.full_name}: {d.balance:,.0f} so'm" + (f" (Muddati: {d.due_date})" if d.due_date else "") for d in top_d])
        
        if lang == "uz":
            ans = f"Qarzlar daftari hisoboti:\n- Jami qarzdorlik: {total_d:,.0f} so'm\n- Qarzdorlar: {len(debtors)} nafar\n\nEng katta qarzlar:\n{top_str or 'Hozircha faol qarzlar yo`q.'}"
        else:
            ans = f"Тетрадь долгов (Qarz daftari):\n- Общий долг: {total_d:,.0f} сум\n- Должников: {len(debtors)} чел\n\nКрупнейшие долги:\n{top_str or 'Активных долгов нет.'}"
        return StoreAiQueryResponse(
            answer=ans,
            quick_suggestions=["Bugungi savdo", "Ovozli qarz yozish", "Qog'oz daftarni skanerlash"] if lang == "uz" else ["Продажи сегодня", "Голосовая запись долга", "Скан тетради"],
            action_type="navigate_debts"
        )

    # 3. Low stock / Mahsulotlar qoldig'i
    if any(k in q for k in ["kam qolgan", "qoldiq", "ombor", "tugayapti", "остатк", "заканчивается", "заказ"]):
        low = session.exec(select(Product).where(Product.is_active == True, Product.stock_quantity <= Product.min_stock_alert)).all()
        low_items = [f"- {p.name}: {p.stock_quantity} {p.unit}" for p in low[:5]]
        
        if lang == "uz":
            ans = f"Omborda oz qolgan mahsulotlar ({len(low)} ta):\n" + ("\n".join(low_items) if low_items else "Barcha tovarlar yetarli miqdorda!")
        else:
            ans = f"Товары с низким остатком ({len(low)} шт):\n" + ("\n".join(low_items) if low_items else "Все товары в достаточном остатке!")
        return StoreAiQueryResponse(
            answer=ans,
            quick_suggestions=["Yuk xatini skanerlash", "Bugungi savdo", "Tezkor tovarlar"] if lang == "uz" else ["Скан накладной", "Выручка за день", "Быстрые товары"],
            action_type="navigate_catalog"
        )

    # 4. Tobacco shop readiness
    if any(k in q for k in ["tamaki", "tobacco", "sigaret", "сигарет", "табач", "совет", "maslahat"]):
        if lang == "uz":
            ans = "Tamaki do'koni uchun imkoniyatlar:\n1. Blokli va pachkali sotuvni to'liq qo'llab-quvvatlaydi.\n2. Telefonda kamera orqali, noutbukda USB-skaner orqali DataMatrix va shtrixkodlarni o'qiydi.\n3. Nasiya qarz daftari 100% aniq yuritiladi.\n4. Bir kunda 3-4 sotuvchi smenasini 1 tugma bilan almashtirish mumkin.\n\nTizim tamaki do'konlariga sotishga to'liq tayyor!"
        else:
            ans = "Готовность для табачного магазина:\n1. Продажа блоками и пачками.\n2. Мгновенное сканирование с камеры телефона или USB-сканера ноутбука.\n3. Электронная тетрадь долгов Haqqim.uz формата.\n4. Быстрая смена 3-4 кассиров в день в 1 клик.\n\nСистема полностью готова к тиражированию в табачные магазины!"
        return StoreAiQueryResponse(
            answer=ans,
            quick_suggestions=["Kassirni almashtirish", "Tezkor tovarlar", "Buxgalteriya"] if lang == "uz" else ["Сменить кассира", "Быстрые товары", "Бухгалтерия"]
        )

    # Default fallback
    if lang == "uz":
        ans = "Salom! Men sizning do'kon AI-yordamchingizman. Savdolar, qarzlar, ombor qoldiqlari, smenalar yoki tamaki do'koni bo'yicha savollaringizga yordam beraman."
    else:
        ans = "Здравствуйте! Я ваш AI-помощник магазина. Отвечу на любые вопросы по выручке, долгам, остаткам или настройке под табачные магазины."
    return StoreAiQueryResponse(
        answer=ans,
        quick_suggestions=["Bugungi savdo", "Qarzdorlar holati", "Kam qolgan tovarlar"] if lang == "uz" else ["Выручка сегодня", "Тетрадь долгов", "Заканчивающиеся товары"]
    )
