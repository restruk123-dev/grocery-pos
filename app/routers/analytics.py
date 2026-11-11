from datetime import datetime, timezone, timedelta, time
from typing import Optional, List, Dict
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

class AnalyticsDashboardResponse(BaseModel):
    period: str
    start_date: datetime
    end_date: datetime
    
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

def get_period_dates(period: str):
    now_tashkent = datetime.now(TZ_TASHKENT)
    if period == "today":
        start_tashkent = datetime.combine(now_tashkent.date(), time.min, tzinfo=TZ_TASHKENT)
        start_date = start_tashkent.astimezone(timezone.utc)
    elif period == "week":
        week_start = now_tashkent.date() - timedelta(days=now_tashkent.weekday())
        start_date = datetime.combine(week_start, time.min, tzinfo=TZ_TASHKENT).astimezone(timezone.utc)
    elif period == "month":
        month_start = now_tashkent.date().replace(day=1)
        start_date = datetime.combine(month_start, time.min, tzinfo=TZ_TASHKENT).astimezone(timezone.utc)
    elif period == "all":
        start_date = datetime(2020, 1, 1, tzinfo=timezone.utc)
    else:
        start_tashkent = datetime.combine(now_tashkent.date(), time.min, tzinfo=TZ_TASHKENT)
        start_date = start_tashkent.astimezone(timezone.utc)
    
    end_date = datetime.now(timezone.utc)
    return start_date, end_date

@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
def get_analytics_dashboard(
    period: str = Query("today", pattern="^(today|week|month|all)$"),
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session)
):
    start_date, end_date = get_period_dates(period)
    start_date_naive = start_date.replace(tzinfo=None)
    end_date_naive = end_date.replace(tzinfo=None)

    # 1. Fetch Sales in period (handling both tz-aware and naive timestamps in DB)
    sales = session.exec(
        select(Sale).where(
            Sale.created_at >= start_date,
            Sale.created_at <= end_date
        )
    ).all()

    sales_count = len(sales)
    revenue = round(sum(s.total_amount for s in sales), 2)

    # 100% exact payments breakdown down to 1 so'm
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
                    "revenue": 0.0
                }
            product_stats[it.product_id]["quantity_sold"] = round(product_stats[it.product_id]["quantity_sold"] + it.quantity, 2)
            product_stats[it.product_id]["revenue"] = round(product_stats[it.product_id]["revenue"] + it.total_price, 2)

    cogs = round(cogs, 2)
    gross_margin = round(revenue - cogs, 2)
    margin_percentage = round((gross_margin / revenue * 100), 2) if revenue > 0 else 0.0

    # Sort top products
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

    # 4. Net Profit
    net_profit = round(gross_margin - total_expenses, 2)

    # 5. Debtors status
    debtors = session.exec(select(Debtor).where(Debtor.is_active == True)).all()
    customer_debt_outstanding = round(sum(d.balance for d in debtors if d.balance > 0), 2)

    # 6. Inventory SKU status
    all_products = session.exec(select(Product).where(Product.is_active == True)).all()
    total_sku_count = len(all_products)
    low_stock_count = sum(1 for p in all_products if p.stock_quantity <= p.min_stock_alert)

    return AnalyticsDashboardResponse(
        period=period,
        start_date=start_date,
        end_date=end_date,
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
        top_selling_products=top_products_formatted
    )
