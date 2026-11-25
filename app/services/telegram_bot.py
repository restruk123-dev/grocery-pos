import os
import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

import httpx

TELEGRAM_API_BASE = "https://api.telegram.org/bot"

# ── Settings (read from env or project config) ──────────────────────────

def _get_bot_token() -> Optional[str]:
    """Read bot token dynamically from environment or persisted settings."""
    val = os.getenv("TELEGRAM_BOT_TOKEN")
    return val.strip() if val and val.strip() else None

def _get_owner_chat_id() -> Optional[int]:
    """Read owner chat ID dynamically from environment variable."""
    val = os.getenv("TELEGRAM_OWNER_CHAT_ID")
    try:
        return int(val) if val and str(val).strip() else None
    except ValueError:
        return None

# ── HTTP client (shared across calls) ───────────────────────────────────

_http = httpx.AsyncClient(timeout=30.0)


# ── Low-level API helpers ───────────────────────────────────────────────

async def _call_telegram(method: str, **kwargs) -> dict:
    """Make a request to the Telegram Bot API."""
    token = _get_bot_token()
    if not token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN not configured")
    url = f"{TELEGRAM_API_BASE}{token}/{method}"
    resp = await (_http.get(url, params=kwargs) if method in ("getMe", "getUpdates") else _http.post(url, params=kwargs))
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
    token = _get_bot_token()
    if not token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN not configured")
    url = f"{TELEGRAM_API_BASE}{token}/sendDocument"
    resp = await _http.post(
        url,
        data={"chat_id": str(chat_id), "caption": caption},
        files={"document": (filename, document, "text/plain")},
    )
    resp.raise_for_status()
    data = resp.json()
    if not data.get("ok"):
        raise RuntimeError(f"Telegram API error: {data}")
    return {"ok": True}


# ── Report generation ───────────────────────────────────────────────────

def build_z_report_bytes(
    session,
    include_cash: bool = True,
    include_non_cash: bool = True,
    include_profit: bool = True,
    include_debts: bool = True,
) -> bytes:
    """Generate the evening Z-report synchronously from an open SQLModel session."""
    from datetime import timedelta
    from sqlmodel import select
    from ..models import Product, Sale, Debtor, Expense

    tz_tashkent = timezone(timedelta(hours=5))
    today_local = datetime.now(tz_tashkent).date()
    today_start = datetime.combine(today_local, datetime.min.time(), tzinfo=tz_tashkent).astimezone(timezone.utc)

    sales = session.exec(select(Sale).where(Sale.created_at >= today_start)).all()
    total_revenue = sum(s.total_amount for s in sales)
    cash_total = sum(s.total_amount for s in sales if s.payment_method.value == "CASH")
    non_cash_total = sum(s.total_amount for s in sales if s.payment_method.value == "CARD")
    debt_total = sum(s.total_amount for s in sales if s.payment_method.value == "DEBT")

    expenses = session.exec(select(Expense).where(Expense.expense_date >= today_start)).all()
    total_expenses = sum(e.amount for e in expenses)

    expenses_by_category: Dict[str, float] = {}
    for e in expenses:
        cat = e.category.value if e.category else "other"
        expenses_by_category[cat] = expenses_by_category.get(cat, 0) + e.amount

    debtors = session.exec(select(Debtor).where(Debtor.is_active == True)).all()
    total_outstanding_debt = sum(d.balance for d in debtors if d.balance > 0)

    low_stock_items = session.exec(
        select(Product).where(Product.is_active == True, Product.stock_quantity <= Product.min_stock_alert)
    ).all()
    low_stock_names = [p.name for p in low_stock_items]

    lines: List[str] = [
        "=" * 40,
        "EVENING Z-REPORT / KUNLIK Z-HISOBOT",
        f"Date: {datetime.now(tz_tashkent).strftime('%Y-%m-%d %H:%M')}",
        "=" * 40,
        "",
        "--- SALES / SAVDO ---",
        f"Checks / Cheklar: {len(sales)}",
        f"Total Revenue: {total_revenue:,.0f} UZS",
    ]
    if include_cash:
        lines.append(f"  Cash (Naqd):      {cash_total:,.0f} UZS")
    if include_non_cash:
        lines.append(f"  Card (Karta):     {non_cash_total:,.0f} UZS")
    if include_debts:
        lines.append(f"  Debt (Qarz):      {debt_total:,.0f} UZS")
    lines.extend(["", "--- EXPENSES / XARAJATLAR ---", f"Total Expenses: {total_expenses:,.0f} UZS"])
    for cat, amount in expenses_by_category.items():
        lines.append(f"  {cat}: {amount:,.0f} UZS")
    if include_profit:
        lines.extend(["", "--- BALANCE ---", f"Cash/Net Balance: {round(total_revenue - total_expenses, 2):,.0f} UZS"])
    if include_debts:
        lines.extend(["", "--- DEBTS / QARZLAR ---", f"Total Customer Debt: {total_outstanding_debt:,.0f} UZS"])
    lines.extend(["", "--- LOW STOCK / KAM QOLDIQ ---"])
    if low_stock_names:
        for name in low_stock_names[:30]:
            lines.append(f"  ! {name}")
    else:
        lines.append("  All items in stock.")
    lines.append("=" * 40)
    return "\n".join(lines).encode("utf-8")


async def generate_z_report(
    session_or_factory,
    include_cash: bool = True,
    include_non_cash: bool = True,
    include_profit: bool = True,
    include_debts: bool = True,
) -> bytes:
    """Wrapper returning Z-report bytes from either a SQLModel Session or generator factory."""
    if hasattr(session_or_factory, "exec"):
        return build_z_report_bytes(
            session_or_factory,
            include_cash=include_cash,
            include_non_cash=include_non_cash,
            include_profit=include_profit,
            include_debts=include_debts,
        )
    gen = session_or_factory()
    sess = next(gen)
    try:
        return build_z_report_bytes(
            sess,
            include_cash=include_cash,
            include_non_cash=include_non_cash,
            include_profit=include_profit,
            include_debts=include_debts,
        )
    finally:
        try:
            gen.close()
        except Exception:
            pass


async def alert_low_stock(product_names: List[str]) -> None:
    """Send a low stock alert to the owner."""
    chat_id = _get_owner_chat_id()
    if not chat_id:
        return
    text = "🚨 <b>Kam qoldiq ogohlantirishi</b>\n"
    for name in product_names[:25]:
        text += f"⚠️ <b>{name}</b>\n"
    await send_message(chat_id, text)


async def alert_large_debt(amount: float, debtor_name: str) -> None:
    """Send an alert about a large debt operation."""
    chat_id = _get_owner_chat_id()
    if not chat_id:
        return
    text = (
        f"🚨 <b>Katta qarz operatsiyasi</b>\n"
        f"Mijoz: <b>{debtor_name}</b>\n"
        f"Summa: <b>{amount:,.0f} so'm</b>"
    )
    await send_message(chat_id, text)


# ── One-time test send ──────────────────────────────────────────────────

async def test_send(message: str = "🧪 Test xabari: GroceryStore POS bot ishga tushdi / Bot started successfully.") -> dict:
    """Send a one-time test message to the owner chat."""
    chat_id = _get_owner_chat_id()
    if not chat_id:
        raise RuntimeError("TELEGRAM_OWNER_CHAT_ID not set")
    await send_message(chat_id, message)
    return {"ok": True, "chat_id": chat_id, "message": message}


# ── Cleanup ─────────────────────────────────────────────────────────────

async def close() -> None:
    await _http.aclose()