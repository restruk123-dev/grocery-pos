import os
import asyncio
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from ..database import get_session
from ..models import (
    User, UserRole, Product, Sale, SaleItem, Debtor, DebtTransaction,
    DebtTransactionType, PaymentMethod, Expense, ExpenseCategory
)
from ..auth import get_current_user, require_role
from ..services.telegram_bot import (
    send_message, test_send, generate_z_report, alert_low_stock, alert_large_debt,
    _get_bot_token, _get_owner_chat_id,
)

router = APIRouter(prefix="/telegram", tags=["Telegram Bot & Reports"])


# ── Models ──────────────────────────────────────────────────────────────

class BotSettings(BaseModel):
    bot_token: str = Field(..., min_length=10, max_length=64)
    owner_chat_id: int = Field(..., gt=0)
    test_mode: bool = False


class TestSendRequest(BaseModel):
    message: Optional[str] = Field(default=None, max_length=500)


class ZReportRequest(BaseModel):
    include_cash: bool = True
    include_non_cash: bool = True
    include_profit: bool = True
    include_debts: bool = True


# ── Endpoints ───────────────────────────────────────────────────────────

@router.get("/status", response_model=Dict[str, Any])
def get_bot_status(
    current_user: User = Depends(require_role([UserRole.OWNER])),
):
    """Return masked Telegram configuration status without exposing secrets."""
    token = _get_bot_token()
    chat_id = _get_owner_chat_id()
    return {
        "configured": bool(token and chat_id),
        "has_token": bool(token),
        "owner_chat_id": chat_id,
    }


@router.post("/settings", response_model=Dict[str, str])
def set_bot_settings(
    data: BotSettings,
    current_user: User = Depends(require_role([UserRole.OWNER])),
):
    """Set Telegram Bot Token and Owner Chat ID (Owner only)."""
    os.environ["TELEGRAM_BOT_TOKEN"] = data.bot_token.strip()
    os.environ["TELEGRAM_OWNER_CHAT_ID"] = str(data.owner_chat_id)

    import httpx
    try:
        resp = httpx.get(f"https://api.telegram.org/bot{data.bot_token.strip()}/getMe", timeout=10.0)
        if resp.status_code != 200 or not resp.json().get("ok"):
            raise ValueError("Invalid bot token")
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Bot token validatsiya xatosi: {str(e)} / Ошибка валидации токена бота"
        )

    return {
        "status": "saved",
        "message": "Telegram sozlamalari saqlandi / Настройки сохранены"
    }


@router.post("/test-send", response_model=Dict[str, str])
async def test_send_message(
    request: TestSendRequest = TestSendRequest(),
    current_user: User = Depends(require_role([UserRole.OWNER])),
):
    """Send a test message to the owner's Telegram chat (Owner only)."""
    try:
        message = request.message or "🧪 Test xabari: GroceryStore POS dan / From GroceryStore POS"
        await test_send(message)
        return {"status": "sent", "message": "Xabar yuborildi / Сообщение отправлено"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Xabar yuborishda xatolik: {str(e)} / Ошибка при отправке сообщения: {str(e)}"
        )


@router.post("/z-report", response_model=Dict[str, str])
async def trigger_z_report(
    request: ZReportRequest = ZReportRequest(),
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Generate and send evening Z-report to owner (Owner only)."""
    try:
        report_bytes = await generate_z_report(session, **request.model_dump())

        chat_id = _get_owner_chat_id()
        if not chat_id:
            raise ValueError("TELEGRAM_OWNER_CHAT_ID sozlanmagan / Chat ID не настроен")

        await send_document(
            chat_id=chat_id,
            document=report_bytes,
            filename=f"z_report_{datetime.now().strftime('%Y%m%d')}.txt",
            caption="📊 Kunlik Z-hisobot / Ежедневный Z-отчет"
        )

        return {"status": "sent", "message": "Z-hisobot Telegramga yuborildi / Z-отчет отправлен в Telegram"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Z-hisobot yaratishda xatolik: {str(e)} / Ошибка при создании Z-отчета: {str(e)}"
        )


@router.post("/alert-low-stock", response_model=Dict[str, str])
async def trigger_low_stock_alert(
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Trigger a low stock alert for items at or below minimum stock (Owner only)."""
    try:
        low_stock = session.exec(
            select(Product).where(
                Product.is_active == True,
                Product.stock_quantity <= Product.min_stock_alert
            )
        ).all()

        product_names = [p.name for p in low_stock]

        if product_names:
            await alert_low_stock(product_names)
            return {"status": "alerted", "message": f"{len(product_names)} ta kam qoldiq tovar bo'yicha ogohlantirish yuborildi"}
        return {"status": "no_alert", "message": "Kam qoldiq tovarlar yo'q / Все товары в норме"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ogohlantirish xatosi: {str(e)} / Ошибка уведомления: {str(e)}"
        )


@router.post("/alert-large-debt", response_model=Dict[str, str])
async def trigger_large_debt_alert(
    debtor_id: int,
    amount: float,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Trigger an alert for a large debt operation (Owner only)."""
    try:
        debtor = session.get(Debtor, debtor_id)
        if not debtor:
            raise HTTPException(status_code=404, detail="Qarzdor topilmadi / Должник не найден")

        await alert_large_debt(amount, debtor.full_name)
        return {"status": "alerted", "message": f"Qarz ogohlantirishi yuborildi: {amount:,.0f} so'm"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Alert xatoligi: {str(e)} / Ошибка алерта: {str(e)}"
        )