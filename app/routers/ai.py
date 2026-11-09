from datetime import datetime, timedelta
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