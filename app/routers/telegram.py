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
    send_message, test_send, generate_z_report, alert_low_stock, alert_large_debt
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

@router.post("/settings", response_model=Dict[str, str])
def set_bot_settings(
    data: BotSettings,
    current_user: User = Depends(require_role([UserRole.OWNER])),
):
    """Set Telegram Bot Token and Owner Chat ID (Owner only)."""
    # Save to environment variables (for demo; in production use a DB or .env)
    os.environ["TELEGRAM_BOT_TOKEN"] = data.bot_token
    os.environ["TELEGRAM_OWNER_CHAT_ID"] = str(data.owner_chat_id)
    
    # Verify token is valid by calling getMe
    import httpx
    try:
        resp = httpx.get(f"https://api.telegram.org/bot{data.bot_token}/getMe")
        if resp.status_code != 200:
            raise ValueError("Invalid bot token")
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Bot token validatsiya xatosi: {str(e)} / Ошибка валидации токена бота"
        )
    
    return {
        "status": "saved",
        "message": "Telegram sozlamlari saqlandi / Настройки сохранены"
    }


@router.post("/test-send", response_model=Dict[str, str])
def test_send_message(
    request: TestSendRequest = TestSendRequest(),
    current_user: User = Depends(require_role([UserRole.OWNER])),
):
    """Send a test message to the owner's Telegram chat (Owner only)."""
    try:
        message = request.message or "🧪 Test xabari: GroceryStore POS dan / From GroceryStore POS"
        asyncio.run(test_send(message))
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
):
    """Generate and send evening Z-report to owner (Owner only)."""
    try:
        report_bytes = await generate_z_report(get_session, **request.model_dump())
        
        # Send as document
        chat_id = int(os.getenv("TELEGRAM_OWNER_CHAT_ID")) if os.getenv("TELEGRAM_OWNER_CHAT_ID") else None
        if not chat_id:
            raise ValueError("Owner chat ID not configured")
        
        await send_document(
            chat_id=chat_id,
            document=report_bytes,
            filename=f"z_report_{datetime.now().strftime('%Y%m%d')}.txt",
            caption="📊 Kutilgina yaklaşighi Z-gesi / Еженечечный Z-отчет"
        )
        
        return {"status": "sent", "message": "Z-gesi xabarlanish uchun yuborildi / Z-отчет отправлен"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Z-ges yaratishda xatolik: {str(e)} / Ошибка при создании Z-отчета: {str(e)}"
        )


@router.post("/alert-low-stock", response_model=Dict[str, str])
async def trigger_low_stock_alert(
    current_user: User = Depends(require_role([UserRole.OWNER])),
):
    """Trigger a low stock alert for items with stock < 10 (Owner only)."""
    from ..models import Product
    
    try:
        # Get low stock items
        low_stock = (await get_session()).exec(
            select(Product).where(
                Product.is_active == True, 
                Product.stock_quantity <= Product.min_stock_alert
            )
        ).all()
        
        product_names = [p.name for p in low_stock]
        
        if product_names:
            asyncio.run(alert_low_stock(product_names))
            return {"status": "alerted", "message": f"{len(product_names)} ta mahsulot past qolganlikga tarid / {len(product_names)} товаров направлено на низкий склад"}
        else:
            return {"status": "no_alert", "message": "Pastlikga tarid talab qilinmaydigan mahsulotlar yo'q / Загрязнение предметов, требующих внимания, отсутствует"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Pastlik xatoligi: {str(e)} / Ошибкаpastlik: {str(e)}"
        )


@router.post("/alert-large-debt", response_model=Dict[str, str])
async def trigger_large_debt_alert(
    debtor_id: int,
    amount: float,
    current_user: User = Depends(require_role([UserRole.OWNER])),
):
    """Trigger an alert for a large debt operation (Owner only)."""
    from ..models import Debtor
    
    try:
        debtor = (await get_session()).get(Debtor, debtor_id)
        if not debtor:
            raise HTTPException(status_code=404, detail="Qarzdor topilmadi / Должник не найден")
        
        asyncio.run(alert_large_debt(amount, debtor.full_name))
        return {"status": "alerted", "message": f"Kuchli qarz alerti yuborildi: {amount} so'm / Сильный долговой алерт отправлен"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Alert xatoligi: {str(e)} / Ошибка алерта: {str(e)}"
        )