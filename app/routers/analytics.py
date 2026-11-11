from datetime import datetime, timezone, timedelta, time
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlmodel import Session, select, func, or_

from ..database import get_session
from ..models import (
    Sale, SaleItem, Expense, Product, Debtor,
    PaymentMethod, ExpenseCategory, User, UserRole
)
from ..auth import require_role

router = APIRouter(prefix="/analytics", tags=["Accounting & Analytics (Buxgalteriya)"])

# Uzbekistan Tashkent timezone: UTC+5
TZ_TASHKENT = timezone(timedelta(hours=5))

class TopProductMetric(BaseModel):
    product_id: int
    name: str
    quantity_sold: float
    revenue: float

class DailyBreakdownItem(BaseModel):
    date: str
    day_label: str
    revenue: float
    sales_count: int
    cogs: float
    gross_margin: float
    total_expenses: float
    net_profit: float

class AnalyticsDashboardResponse(BaseModel):
    period: str
    start_date: datetime
    end_date: datetime
    selected_date: Optional[str] = None
    
    # Financial KPIs
    revenue: float               # Выручка
    cogs: float                  # Себестоимость
    gross_margin: float          # Валовая прибыль
    margin_percentage: float     # Маржинальность в %
    total_expenses: float        # Операционные расходы + списания
    net_profit: float            # Чистая прибыль (Валовая прибыль - Расходы)
    
    # Operational KPIs
    sales_count: int
    average_receipt: float
    
    # Payments Breakdown
    cash_total: float
    card_total: float
    debt_total: float
    
    # Debt status
    customer_debt_outstanding: float
    
    # Inventory status
    total_sku_count: int
    low_stock_count: int
    
    # Breakdowns
    expenses_by_category: Dict[str, float]
    top_selling_products: List[TopProductMetric]
    daily_breakdown: List[DailyBreakdownItem] = []

def get_period_dates(period: str, selected_date: Optional[str] = None):
    now_tashkent = datetime.now(TZ_TASHKENT)
    if selected_date:
        try:
            d_parts = [int(p) for p in selected_date.split("-")]
            target_date = datetime(d_parts[0], d_parts[1], d_parts[2], tzinfo=TZ_TASHKENT).date()
            start_tashkent = datetime.combine(target_date, time.min, tzinfo=TZ_TASHKENT)
            end_tashkent = datetime.combine(target_date, time.max, tzinfo=TZ_TASHKENT)
            return start_tashkent.astimezone(timezone.utc), end_tashkent.astimezone(timezone.utc)
        except Exception:
            pass

    if period == "today":
        start_tashkent = datetime.combine(now_tashkent.date(), time.min, tzinfo=TZ_TASHKENT)
        start_date = start_tashkent.astimezone(timezone.utc)
        end_date = datetime.now(timezone.utc)
    elif period == "week":
        # Last 7 full days
        start_tashkent = datetime.combine(now_tashkent.date() - timedelta(days=6), time.min, tzinfo=TZ_TASHKENT)
        start_date = start_tashkent.astimezone(timezone.utc)
        end_date = datetime.now(timezone.utc)
    elif period == "month":
        # Last 30 full days
        start_tashkent = datetime.combine(now_tashkent.date() - timedelta(days=29), time.min, tzinfo=TZ_TASHKENT)
        start_date = start_tashkent.astimezone(timezone.utc)
        end_date = datetime.now(timezone.utc)
    elif period == "all":
        start_date = datetime(2020, 1, 1, tzinfo=timezone.utc)
        end_date = datetime.now(timezone.utc)
    else:
        start_tashkent = datetime.combine(now_tashkent.date(), time.min, tzinfo=TZ_TASHKENT)
        start_date = start_tashkent.astimezone(timezone.utc)
        end_date = datetime.now(timezone.utc)
    
    return start_date, end_date

@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
def get_analytics_dashboard(
    period: str = Query("today", pattern="^(today|week|month|all|custom)$"),
    date: Optional[str] = Query(None, description="Alias for selected_date"),
    selected_date: Optional[str] = Query(None, description="YYYY-MM-DD to filter specific single day"),
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    target_date = selected_date or date
    start_date, end_date = get_period_dates(period, target_date)

    # 1. Fetch Sales in period
    sales = session.exec(
        select(Sale).where(
            Sale.created_at >= start_date,
            Sale.created_at <= end_date
        )
    ).all()

    sales_count = len(sales)
    revenue = round(sum(s.total_amount for s in sales), 2)

    # Payments breakdown
    cash_total = 0.0
    card_total = 0.0
    debt_total = 0.0

    for s in sales:
        if s.payment_method == PaymentMethod.CASH:
            cash_total += s.total_amount
        elif s.payment_method == PaymentMethod.CARD:
            card_total += s.total_amount
        elif s.payment_method == PaymentMethod.DEBT:
            debt_total += s.total_amount
        elif s.payment_method == PaymentMethod.MIXED:
            cash_portion = max(0.0, s.cash_received - s.change_given)
            cash_total += min(cash_portion, s.total_amount)
            card_total += s.card_amount
            debt_total += s.debt_amount

    cash_total = round(cash_total, 2)
    card_total = round(card_total, 2)
    debt_total = round(debt_total, 2)
    average_receipt = round(revenue / sales_count, 2) if sales_count > 0 else 0.0

    # 2. COGS & Top Selling Products
    sale_ids = [s.id for s in sales if s.id is not None]
    cogs = 0.0
    product_stats: Dict[int, Dict] = {}

    sale_item_map: Dict[int, float] = {}  # sale_id -> sale_cogs
    if sale_ids:
        items = session.exec(
            select(SaleItem).where(SaleItem.sale_id.in_(sale_ids))
        ).all()
        for it in items:
            item_cogs = (it.purchase_price * it.quantity)
            cogs += item_cogs
            sale_item_map[it.sale_id] = sale_item_map.get(it.sale_id, 0.0) + item_cogs

            if it.product_id not in product_stats:
                product_stats[it.product_id] = {
                    "product_id": it.product_id,
                    "name": it.product_name,
                    "quantity_sold": 0.0,
                    "revenue": 0.0
                }
            product_stats[it.product_id]["quantity_sold"] = round(product_stats[it.product_id]["quantity_sold"] + it.quantity, 2)
            product_stats[it.product_id]["revenue"] = round(product_stats[it.product_id]["revenue"] + it.total_price, 2)

    cogs = round(cogs, 2)
    gross_margin = round(revenue - cogs, 2)
    margin_percentage = round((gross_margin / revenue * 100), 2) if revenue > 0 else 0.0

    top_selling = sorted(product_stats.values(), key=lambda x: x["revenue"], reverse=True)[:5]
    top_products_formatted = [TopProductMetric(**p) for p in top_selling]

    # 3. Expenses
    expenses = session.exec(
        select(Expense).where(
            Expense.expense_date >= start_date,
            Expense.expense_date <= end_date
        )
    ).all()
    total_expenses = round(sum(e.amount for e in expenses), 2)

    expenses_by_category: Dict[str, float] = {}
    for cat in ExpenseCategory:
        expenses_by_category[cat.value] = 0.0
    for e in expenses:
        cat_key = e.category.value if hasattr(e.category, "value") else str(e.category)
        expenses_by_category[cat_key] = round(expenses_by_category.get(cat_key, 0.0) + e.amount, 2)

    net_profit = round(gross_margin - total_expenses, 2)

    debtors = session.exec(select(Debtor).where(Debtor.is_active == True)).all()
    customer_debt_outstanding = round(sum(d.balance for d in debtors if d.balance > 0), 2)

    all_products = session.exec(select(Product).where(Product.is_active == True)).all()
    total_sku_count = len(all_products)
    low_stock_count = sum(1 for p in all_products if p.stock_quantity <= p.min_stock_alert)

    # 4. Daily Breakdown calculation for week/month periods
    daily_items: List[DailyBreakdownItem] = []
    if period in ("week", "month", "all") or selected_date:
        # Group by day string in Tashkent timezone
        days_map: Dict[str, Dict[str, Any]] = {}
        
        # Determine day range
        cur = start_date.astimezone(TZ_TASHKENT).date()
        end_cur = end_date.astimezone(TZ_TASHKENT).date()
        while cur <= end_cur:
            d_str = cur.strftime("%Y-%m-%d")
            # Format Uzbek / Russian friendly day label, e.g. "12.11 (Pay/Чт)"
            w_idx = cur.weekday()
            w_names = ["Dush/Пн", "Sesh/Вт", "Chor/Ср", "Pay/Чт", "Juma/Пт", "Shan/Сб", "Yak/Вс"]
            days_map[d_str] = {
                "date": d_str,
                "day_label": f"{cur.strftime('%d.%m')} ({w_names[w_idx]})",
                "revenue": 0.0,
                "sales_count": 0,
                "cogs": 0.0,
                "total_expenses": 0.0
            }
            cur += timedelta(days=1)

        for s in sales:
            s_d = s.created_at.astimezone(TZ_TASHKENT).strftime("%Y-%m-%d")
            if s_d in days_map:
                days_map[s_d]["revenue"] += s.total_amount
                days_map[s_d]["sales_count"] += 1
                days_map[s_d]["cogs"] += sale_item_map.get(s.id, 0.0)

        for e in expenses:
            e_d = e.expense_date.astimezone(TZ_TASHKENT).strftime("%Y-%m-%d")
            if e_d in days_map:
                days_map[e_d]["total_expenses"] += e.amount

        # Build list sorted descending by date
        for d_str in sorted(days_map.keys(), reverse=True):
            d_info = days_map[d_str]
            rev = round(d_info["revenue"], 2)
            cg = round(d_info["cogs"], 2)
            gm = round(rev - cg, 2)
            exp = round(d_info["total_expenses"], 2)
            np = round(gm - exp, 2)
            daily_items.append(DailyBreakdownItem(
                date=d_str,
                day_label=d_info["day_label"],
                revenue=rev,
                sales_count=d_info["sales_count"],
                cogs=cg,
                gross_margin=gm,
                total_expenses=exp,
                net_profit=np
            ))

    return AnalyticsDashboardResponse(
        period=period,
        start_date=start_date,
        end_date=end_date,
        selected_date=selected_date,
        revenue=revenue,
        cogs=cogs,
        gross_margin=gross_margin,
        margin_percentage=margin_percentage,
        total_expenses=total_expenses,
        net_profit=net_profit,
        sales_count=sales_count,
        average_receipt=average_receipt,
        cash_total=cash_total,
        card_total=card_total,
        debt_total=debt_total,
        customer_debt_outstanding=customer_debt_outstanding,
        total_sku_count=total_sku_count,
        low_stock_count=low_stock_count,
        expenses_by_category=expenses_by_category,
        top_selling_products=top_products_formatted,
        daily_breakdown=daily_items
    )

@router.get("/day-details", response_model=dict)
def get_day_details(
    date_str: str = Query(..., description="YYYY-MM-DD"),
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    try:
        d_parts = [int(p) for p in date_str.split("-")]
        target_date = datetime(d_parts[0], d_parts[1], d_parts[2], tzinfo=TZ_TASHKENT).date()
    except Exception:
        raise HTTPException(status_code=400, detail="Noto'g'ri sana formati. Format: YYYY-MM-DD")

    start_tashkent = datetime.combine(target_date, time.min, tzinfo=TZ_TASHKENT)
    end_tashkent = datetime.combine(target_date, time.max, tzinfo=TZ_TASHKENT)
    start_utc = start_tashkent.astimezone(timezone.utc)
    end_utc = end_tashkent.astimezone(timezone.utc)

    sales = session.exec(
        select(Sale).where(
            Sale.created_at >= start_utc,
            Sale.created_at <= end_utc
        ).order_by(Sale.created_at.desc())
    ).all()

    sales_count = len(sales)
    revenue = round(sum(s.total_amount for s in sales), 2)
    average_receipt = round(revenue / sales_count, 2) if sales_count > 0 else 0.0

    sale_ids = [s.id for s in sales if s.id is not None]
    cogs = 0.0
    items_by_sale: Dict[int, List[Dict[str, Any]]] = {}

    if sale_ids:
        sale_items = session.exec(select(SaleItem).where(SaleItem.sale_id.in_(sale_ids))).all()
        for item in sale_items:
            cogs += (item.purchase_price * item.quantity)
            if item.sale_id not in items_by_sale:
                items_by_sale[item.sale_id] = []
            items_by_sale[item.sale_id].append({
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "total_price": item.total_price
            })

    cogs = round(cogs, 2)
    gross_margin = round(revenue - cogs, 2)

    expenses = session.exec(
        select(Expense).where(
            Expense.expense_date >= start_utc,
            Expense.expense_date <= end_utc
        )
    ).all()
    total_expenses = round(sum(e.amount for e in expenses), 2)
    net_profit = round(gross_margin - total_expenses, 2)

    # Cashier users
    users = {u.id: u.full_name for u in session.exec(select(User)).all()}

    # Debtors
    debtor_map = {d.id: d.full_name for d in session.exec(select(Debtor)).all()}

    detailed_sales = []
    for s in sales:
        time_local = s.created_at.astimezone(TZ_TASHKENT).strftime("%H:%M")
        detailed_sales.append({
            "id": s.id,
            "receipt_number": s.receipt_number,
            "time": time_local,
            "total_amount": s.total_amount,
            "payment_method": s.payment_method,
            "cashier_name": users.get(s.cashier_id, "Kassir"),
            "debtor_name": debtor_map.get(s.debtor_id) if s.debtor_id else None,
            "items_count": len(items_by_sale.get(s.id, [])),
            "items": items_by_sale.get(s.id, [])
        })

    return {
        "date": date_str,
        "date_label": target_date.strftime("%d.%m.%Y"),
        "revenue": revenue,
        "sales_count": sales_count,
        "average_receipt": average_receipt,
        "cogs": cogs,
        "gross_margin": gross_margin,
        "total_expenses": total_expenses,
        "net_profit": net_profit,
        "sales": detailed_sales
    }
