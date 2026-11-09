import os
import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

import httpx

TELEGRAM_API_BASE = "https://api.telegram.org/bot"

# ── Settings (read from env or project config) ──────────────────────────

def _get_bot_token() -> Optional[str]:
    """Read bot token from environment variable."""
    return os.getenv("TELEGRAM_BOT_TOKEN")

def _get_owner_chat_id() -> Optional[int]:
    """Read owner chat ID from environment variable."""
    val = os.getenv("TELEGRAM_OWNER_CHAT_ID")
    return int(val) if val else None

BOT_TOKEN = _get_bot_token()
OWNER_CHAT_ID = _get_owner_chat_id()

# ── HTTP client (shared across calls) ───────────────────────────────────

_http = httpx.AsyncClient(timeout=30.0)


# ── Low-level API helpers ───────────────────────────────────────────────

async def _call_telegram(method: str, **kwargs) -> dict:
    """Make a request to the Telegram Bot API."""
    url = f"{TELEGRAM_API_BASE}{BOT_TOKEN}/{method}"
    resp = await _http.get(url, params=kwargs) if method in ("getMe", "getUpdates") else _http.post(url, params=kwargs)
    resp.raise_for_status()
    data = resp.json()
    if not data.get("ok"):
        raise RuntimeError(f"Telegram API error: {data}")
    return data["result"]


# ── Public API ──────────────────────────────────────────────────────────

async def send_message(chat_id: int, text: str, parse_mode: str = "HTML") -> dict:
    """Send a text message to a chat."""
    await _call_telegram("sendMessage", chat_id=chat_id, text=text, parse_mode=parse_mode)
    return {"ok": True}


async def send_photo(chat_id: int, photo: bytes, caption: str = "", parse_mode: str = "HTML") -> dict:
    """Send a photo to a chat."""
    await _call_telegram("sendPhoto", chat_id=chat_id, photo=photo, caption=caption, parse_mode=parse_mode)
    return {"ok": True}


async def send_document(chat_id: int, document: bytes, filename: str, caption: str = "") -> dict:
    """Send a document (report file) to a chat."""
    await _call_telegram("sendDocument", chat_id=chat_id, document=(filename, document), caption=caption)
    return {"ok": True}


# ── Report generation ───────────────────────────────────────────────────

async def generate_z_report(
    session_local,
    include_cash: bool = True,
    include_non_cash: bool = True,
    include_profit: bool = True,
    include_debts: bool = True,
) -> bytes:
    """
    Generate the evening Z-report as a plain-text document.
    Returns the report bytes (for sending via Telegram document).
    """
    from sqlmodel import select, func
    from ..models import (
        Product, Sale, SaleItem, Debtor, DebtTransaction,
        PaymentMethod, Expense, ExpenseCategory
    )
    from ..database import get_session

    async with session_local() as session:
        # Sales today
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        sales = session.exec(
            select(Sale).where(Sale.created_at >= today_start)
        ).all()

        total_revenue = sum(s.total_amount for s in sales)

        # Payment breakdown
        cash_total = sum(s.total_amount for s in sales if s.payment_method.value == "CASH")
        non_cash_total = sum(s.total_amount for s in sales if s.payment_method.value == "CARD")
        debt_total = sum(s.total_amount for s in sales if s.payment_method.value == "DEBT")

        # Expenses today
        expenses = session.exec(
            select(Expense).where(Expense.expense_date >= today_start)
        ).all()
        total_expenses = sum(e.amount for e in expenses)

        # Categorized expenses
        expenses_by_category: Dict[str, float] = {}
        for e in expenses:
            cat = e.category.value if e.category else "other"
            expenses_by_category[cat] = expenses_by_category.get(cat, 0) + e.amount

        # Debt summary
        debtors = session.exec(select(Debtor).where(Debtor.is_active == True)).all()
        total_outstanding_debt = sum(d.balance for d in debtors if d.balance > 0)

        # Low stock alert
        low_stock_items = session.exec(
            select(Product).where(Product.is_active == True, Product.stock_quantity <= Product.min_stock_alert)
        ).all()
        low_stock_names = [p.name for p in low_stock_items]

        # Build report text
        lines: List[str] = []
        lines.append("=" * 40)
        lines.append("EVENING Z-REPORT")
        lines.append(f"Date: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}")
        lines.append("=" * 40)
        lines.append("")
        lines.append("--- SALES ---")
        lines.append(f"Total Revenue: {total_revenue} UZS")
        if include_cash:
            lines.append(f"  Cash:        {cash_total} UZS")
        if include_non_cash:
            lines.append(f"  Non-cash:    {non_cash_total} UZS")
        if include_debts:
            lines.append(f"  Debt:        {debt_total} UZS")
        lines.append("")
        lines.append("--- EXPENSES ---")
        lines.append(f"Total Expenses: {total_expenses} UZS")
        if expenses_by_category:
            for cat, amount in expenses_by_category.items():
                lines.append(f"  {cat}: {amount} UZS")
        lines.append("")
        lines.append("--- PROFIT ---")
        net_profit = round(total_revenue - total_expenses, 2)
        lines.append(f"Net Profit:    {net_profit} UZS")
        lines.append("")
        lines.append("--- DEBTS OUTSTANDING ---")
        lines.append(f"Outstanding client debt: {total_outstanding_debt} UZS")
        lines.append("")
        lines.append("--- LOW STOCK ALERT ---")
        if low_stock_names:
            lines.append("Items below minimum stock:")
            for name in low_stock_names:
                lines.append(f"  ⚠️ {name}")
        else:
            lines.append("  No low stock items.")
        lines.append("")
        lines.append("--- SUMMARY ---")
        lines.append(f"Total SKU count: (from catalog)")
        lines.append("=" * 40)

        report_text = "\n".join(lines)
        return report_text.encode("utf-8")


async def alert_low_stock(product_names: List[str]) -> None:
    """Send a low stock alert to the owner."""
    if not OWNER_CHAT_ID:
        return
    text = "🚨 <b>Low Stock Alert</b>\n"
    for name in product_names:
        text += f"⚠️ <b>{name}</b> — oshliq qolgan miqdor < 10 ta\n"
    await send_message(OWNER_CHAT_ID, text)


async def alert_large_debt(amount: float, debtor_name: str) -> None:
    """Send an alert about a large debt operation."""
    if not OWNER_CHAT_ID:
        return
    text = (
        f"🚨 <b>Large Debt Alert</b>\n"
        f"Mijoz: <b>{debtor_name}</b>\n"
        f"Qarz hajmi: <b>{amount} UZS</b>\n"
        f"Chek yoki operatsiya registro etilgan."
    )
    await send_message(OWNER_CHAT_ID, text)


# ── One-time test send ──────────────────────────────────────────────────

async def test_send(message: str = "🧪 Test xabari: GroceryStore POS bot ishga tushdi / Bot started successfully.") -> dict:
    """Send a one-time test message to the owner chat."""
    if not OWNER_CHAT_ID:
        raise RuntimeError("TELEGRAM_OWNER_CHAT_ID not set")
    await send_message(OWNER_CHAT_ID, message)
    return {"ok": True, "chat_id": OWNER_CHAT_ID, "message": message}


# ── Cleanup ─────────────────────────────────────────────────────────────

async def close() -> None:
    await _http.aclose()