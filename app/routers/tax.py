import csv
import io
from datetime import datetime, timedelta, timezone, time
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from ..database import get_session
from ..models import (
    User, UserRole, Product, Sale, SaleItem,
    SaleRefund, SaleRefundItem, PaymentMethod, StoreOutlet
)
from ..auth import require_role
from ..services.uz_tax import (
    TAX_REGIMES, compute_line_vat, get_tax_profile, save_tax_profile,
    validate_ikpu, mask_marking_code, search_mxik_catalog
)
from ..services.telegram_bot import send_document, _get_owner_chat_id

router = APIRouter(prefix="/tax", tags=["Uzbekistan Soliq & Tobacco Compliance"])
TZ_TASHKENT = timezone(timedelta(hours=5))


def _to_tashkent(dt: datetime) -> datetime:
    return (dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt).astimezone(TZ_TASHKENT)


def _resolve_tax_period(
    period: str,
    selected_date: Optional[str] = None,
    start_date_str: Optional[str] = None,
    end_date_str: Optional[str] = None,
) -> tuple[datetime, datetime, str]:
    now_tash = datetime.now(TZ_TASHKENT)

    if selected_date:
        try:
            d = datetime.strptime(selected_date.strip()[:10], "%Y-%m-%d").date()
            return (
                datetime.combine(d, time.min, tzinfo=TZ_TASHKENT).astimezone(timezone.utc),
                datetime.combine(d, time.max, tzinfo=TZ_TASHKENT).astimezone(timezone.utc),
                d.isoformat(),
            )
        except ValueError:
            pass

    if period == "custom" and start_date_str and end_date_str:
        try:
            d1 = datetime.strptime(start_date_str.strip()[:10], "%Y-%m-%d").date()
            d2 = datetime.strptime(end_date_str.strip()[:10], "%Y-%m-%d").date()
            if d2 < d1:
                d1, d2 = d2, d1
            return (
                datetime.combine(d1, time.min, tzinfo=TZ_TASHKENT).astimezone(timezone.utc),
                datetime.combine(d2, time.max, tzinfo=TZ_TASHKENT).astimezone(timezone.utc),
                f"{d1.isoformat()} — {d2.isoformat()}",
            )
        except ValueError:
            pass

    if period == "today":
        start_t = datetime.combine(now_tash.date(), time.min, tzinfo=TZ_TASHKENT)
        label = now_tash.date().isoformat()
    elif period == "week":
        start_d = now_tash.date() - timedelta(days=6)
        start_t = datetime.combine(start_d, time.min, tzinfo=TZ_TASHKENT)
        label = f"{start_d.isoformat()} — {now_tash.date().isoformat()}"
    elif period == "quarter":
        q_start_month = ((now_tash.month - 1) // 3) * 3 + 1
        start_d = now_tash.date().replace(month=q_start_month, day=1)
        start_t = datetime.combine(start_d, time.min, tzinfo=TZ_TASHKENT)
        label = f"{start_d.isoformat()} — {now_tash.date().isoformat()}"
    elif period == "year":
        start_d = now_tash.date().replace(month=1, day=1)
        start_t = datetime.combine(start_d, time.min, tzinfo=TZ_TASHKENT)
        label = f"{start_d.isoformat()} — {now_tash.date().isoformat()}"
    else:
        # Default "month": current calendar month (tax period)
        start_d = now_tash.date().replace(day=1)
        start_t = datetime.combine(start_d, time.min, tzinfo=TZ_TASHKENT)
        label = f"{start_d.isoformat()} — {now_tash.date().isoformat()}"

    return start_t.astimezone(timezone.utc), datetime.now(timezone.utc), label


class TaxProfileUpdate(BaseModel):
    legal_name: Optional[str] = Field(default=None, max_length=255)
    inn_stir: Optional[str] = Field(default=None, max_length=32)
    tax_regime: Optional[str] = Field(default=None, pattern="^(TURNOVER_1|TURNOVER_4|TURNOVER_CUSTOM|VAT_12|VAT_6)$")
    tax_rate_percent: Optional[float] = Field(default=None, ge=0.0, le=30.0)
    address: Optional[str] = Field(default=None, max_length=300)
    kkm_serial: Optional[str] = Field(default=None, max_length=128)
    ofd_gateway_name: Optional[str] = Field(default=None, max_length=128)
    tobacco_license_note: Optional[str] = Field(default=None, max_length=255)
    strict_tobacco_marking: Optional[bool] = None
    store_id: Optional[int] = Field(default=None, gt=0)


def _safe_csv_cell(val: Any) -> str:
    txt = str(val if val is not None else "")
    if txt.lstrip(" \t\r\n")[:1] in {"=", "+", "-", "@"} or txt.startswith(("\t", "\r", "\n")):
        return "'" + txt
    return txt


def build_tax_report_data(
    session: Session,
    period: str = "month",
    selected_date: Optional[str] = None,
    start_date_str: Optional[str] = None,
    end_date_str: Optional[str] = None,
    store_id: Optional[int] = None,
) -> Dict[str, Any]:
    profile = get_tax_profile(session)
    start_utc, end_utc, period_label = _resolve_tax_period(period, selected_date, start_date_str, end_date_str)

    sales_q = select(Sale).where(Sale.created_at >= start_utc, Sale.created_at <= end_utc)
    if store_id:
        sales_q = sales_q.where(Sale.store_id == store_id)
    sales = session.exec(sales_q.order_by(Sale.created_at.desc())).all()

    sale_by_id = {s.id: s for s in sales if s.id is not None}
    sale_ids = list(sale_by_id.keys())

    items: List[SaleItem] = []
    if sale_ids:
        items = session.exec(select(SaleItem).where(SaleItem.sale_id.in_(sale_ids))).all()

    refunds_q = select(SaleRefund).where(SaleRefund.created_at >= start_utc, SaleRefund.created_at <= end_utc)
    refunds = session.exec(refunds_q).all()
    if store_id:
        # Filter refunds tied to sales of that store when store_id is filtered
        allowed_sale_ids = set(sale_ids)
        if not allowed_sale_ids:
            refunds = [r for r in refunds if r.sale_id in allowed_sale_ids]
        else:
            all_store_sale_ids = set(
                session.exec(select(Sale.id).where(Sale.store_id == store_id)).all()
            )
            refunds = [r for r in refunds if r.sale_id in all_store_sale_ids]

    refund_ids = [r.id for r in refunds if r.id is not None]
    refund_items: List[SaleRefundItem] = []
    if refund_ids:
        refund_items = session.exec(select(SaleRefundItem).where(SaleRefundItem.refund_id.in_(refund_ids))).all()

    all_products = session.exec(select(Product).where(Product.is_active == True)).all()
    prod_by_id = {p.id: p for p in all_products if p.id is not None}
    users = {u.id: u.full_name for u in session.exec(select(User)).all() if u.id is not None}

    # Gross sales, discounts, payment breakdown
    gross_sales_revenue = round(sum(s.total_amount for s in sales), 2)
    discounts_total = round(sum(float(getattr(s, "discount_amount", 0.0) or 0.0) for s in sales), 2)
    refunds_total = round(sum(r.total_refund_amount for r in refunds), 2)
    net_taxable_revenue = round(max(0.0, gross_sales_revenue - refunds_total), 2)

    cash_rev = 0.0
    card_rev = 0.0
    debt_rev = 0.0
    fiscalized_count = 0
    internal_only_count = 0
    for s in sales:
        if s.payment_method == PaymentMethod.CASH:
            cash_rev += s.total_amount
        elif s.payment_method == PaymentMethod.CARD:
            card_rev += s.total_amount
        elif s.payment_method == PaymentMethod.DEBT:
            debt_rev += s.total_amount
        elif s.payment_method == PaymentMethod.MIXED:
            cash_part = max(0.0, s.cash_received - s.change_given)
            cash_rev += min(cash_part, s.total_amount)
            card_rev += s.card_amount
            debt_rev += s.debt_amount

        if getattr(s, "fiscal_status", "INTERNAL") == "FISCALIZED":
            fiscalized_count += 1
        else:
            internal_only_count += 1

    # Subtract refunded amounts per method
    cash_rev = round(max(0.0, cash_rev - sum(r.cash_refunded for r in refunds)), 2)
    card_rev = round(max(0.0, card_rev - sum(r.card_refunded for r in refunds)), 2)
    debt_rev = round(max(0.0, debt_rev - sum(r.debt_reduced for r in refunds)), 2)

    regime = profile["tax_regime"]
    rate = float(profile.get("tax_rate_percent") or 1.0)

    # Catalog IKPU & Tobacco readiness check
    with_valid_ikpu = 0
    missing_ikpu_sample: List[Dict[str, Any]] = []
    tobacco_sku_count = 0
    marking_required_count = 0
    for p in all_products:
        ikpu = getattr(p, "ikpu_code", None)
        if validate_ikpu(ikpu):
            with_valid_ikpu += 1
        elif len(missing_ikpu_sample) < 15:
            missing_ikpu_sample.append({"id": p.id, "name": p.name, "barcode": p.barcode})
        if getattr(p, "is_tobacco", False):
            tobacco_sku_count += 1
        if getattr(p, "requires_marking", False) or getattr(p, "is_tobacco", False):
            marking_required_count += 1

    # Item-level IKPU breakdown & Tobacco / DataMatrix ledger
    refunded_qty_by_sale_prod: Dict[tuple[int, int], float] = {}
    refund_sale_by_id = {r.id: r.sale_id for r in refunds if r.id is not None}
    refunded_by_prod: Dict[int, Dict[str, float]] = {}
    for ri in refund_items:
        s_id = refund_sale_by_id.get(ri.refund_id)
        if s_id:
            refunded_qty_by_sale_prod[(s_id, ri.product_id)] = refunded_qty_by_sale_prod.get((s_id, ri.product_id), 0.0) + ri.quantity
        p_info = refunded_by_prod.setdefault(ri.product_id, {"qty": 0.0, "amount": 0.0})
        p_info["qty"] += ri.quantity
        p_info["amount"] += ri.total_price

    ikpu_groups: Dict[str, Dict[str, Any]] = {}
    output_vat_gross = 0.0
    tobacco_units_sold = 0.0
    tobacco_revenue = 0.0
    tobacco_sales_lines = 0
    marked_with_dm = 0
    missing_dm = 0
    seen_dm_counts: Dict[str, int] = {}
    marking_ledger: List[Dict[str, Any]] = []

    for it in items:
        prod = prod_by_id.get(it.product_id)
        sale = sale_by_id.get(it.sale_id)
        ikpu = getattr(it, "ikpu_code", None) or (getattr(prod, "ikpu_code", None) if prod else None)
        ikpu_key = ikpu.strip() if ikpu and ikpu.strip() else "NO_IKPU"
        vat_rate = float(getattr(it, "vat_rate", 0.0) or (getattr(prod, "vat_rate", 0.0) if prod else 0.0))
        item_vat = float(getattr(it, "vat_amount", 0.0) or 0.0)
        if item_vat == 0.0 and regime == "VAT_12" and vat_rate > 0:
            item_vat = compute_line_vat(it.total_price, vat_rate, regime)
        output_vat_gross += item_vat

        grp = ikpu_groups.setdefault(ikpu_key, {
            "ikpu_code": None if ikpu_key == "NO_IKPU" else ikpu_key,
            "ikpu_valid": validate_ikpu(ikpu_key) if ikpu_key != "NO_IKPU" else False,
            "sample_name": it.product_name,
            "vat_rate": vat_rate,
            "quantity_sold": 0.0,
            "gross_revenue": 0.0,
            "refund_amount": 0.0,
            "net_revenue": 0.0,
            "vat_amount": 0.0,
            "is_tobacco": False,
        })
        grp["quantity_sold"] = round(grp["quantity_sold"] + it.quantity, 3)
        grp["gross_revenue"] = round(grp["gross_revenue"] + it.total_price, 2)
        grp["vat_amount"] = round(grp["vat_amount"] + item_vat, 2)

        is_tob = bool(getattr(it, "is_tobacco", False) or (prod and (getattr(prod, "is_tobacco", False) or getattr(prod, "requires_marking", False))) or getattr(it, "marking_code", None))
        if is_tob:
            grp["is_tobacco"] = True
            tobacco_sales_lines += 1
            tobacco_units_sold = round(tobacco_units_sold + it.quantity, 3)
            tobacco_revenue = round(tobacco_revenue + it.total_price, 2)
            mc = getattr(it, "marking_code", None)
            if mc:
                marked_with_dm += 1
                seen_dm_counts[mc] = seen_dm_counts.get(mc, 0) + 1
            else:
                missing_dm += 1

            is_returned = refunded_qty_by_sale_prod.get((it.sale_id, it.product_id), 0.0) >= it.quantity
            marking_ledger.append({
                "sale_id": it.sale_id,
                "receipt_number": sale.receipt_number if sale else "",
                "sold_at": _to_tashkent(sale.created_at).strftime("%Y-%m-%d %H:%M") if sale else "",
                "product_name": it.product_name,
                "ikpu_code": None if ikpu_key == "NO_IKPU" else ikpu_key,
                "marking_code": mc,
                "masked_code": mask_marking_code(mc),
                "has_datamatrix": bool(mc),
                "quantity": it.quantity,
                "total_price": it.total_price,
                "cashier_name": users.get(sale.cashier_id, "Kassir") if sale else "Kassir",
                "fiscal_status": getattr(sale, "fiscal_status", "INTERNAL") if sale else "INTERNAL",
                "is_returned": is_returned,
            })

    # Adjust IKPU totals for refunds in this period
    refunded_vat_total = 0.0
    for pid, r_info in refunded_by_prod.items():
        prod = prod_by_id.get(pid)
        ikpu_key = (getattr(prod, "ikpu_code", None) or "").strip() if prod else ""
        ikpu_key = ikpu_key or "NO_IKPU"
        if ikpu_key in ikpu_groups:
            ikpu_groups[ikpu_key]["refund_amount"] = round(ikpu_groups[ikpu_key]["refund_amount"] + r_info["amount"], 2)
            vat_r = float(getattr(prod, "vat_rate", 0.0) if prod else 0.0)
            r_vat = compute_line_vat(r_info["amount"], vat_r, regime)
            refunded_vat_total += r_vat
            ikpu_groups[ikpu_key]["vat_amount"] = round(max(0.0, ikpu_groups[ikpu_key]["vat_amount"] - r_vat), 2)

    ikpu_list = []
    for grp in ikpu_groups.values():
        grp["net_revenue"] = round(max(0.0, grp["gross_revenue"] - grp["refund_amount"]), 2)
        ikpu_list.append(grp)
    ikpu_list.sort(key=lambda x: x["net_revenue"], reverse=True)

    output_vat_net = round(max(0.0, output_vat_gross - refunded_vat_total), 2)
    if regime == "VAT_12":
        estimated_tax_due = output_vat_net
    else:
        estimated_tax_due = round(net_taxable_revenue * rate / 100.0, 2)

    duplicate_markings = [code for code, cnt in seen_dm_counts.items() if cnt > 1]

    # Compliance Warnings (Uzbekistan law checks)
    warnings: List[Dict[str, str]] = []
    if not (profile.get("inn_stir") or "").strip():
        warnings.append({
            "level": "warn",
            "code": "MISSING_INN",
            "title_uz": "STIR (INN) kiritilmagan",
            "title_ru": "Не указан ИНН (СТИР) магазина",
            "detail_ru": "Укажите 9-значный ИНН/СТИР и название ИП/ООО в налоговом профиле для чеков и отчётов.",
            "detail_uz": "Chek va hisobotlar uchun soliq profilida 9 xonali STIR va YaTT/MChJ nomini kiriting.",
        })
    if internal_only_count > 0:
        warnings.append({
            "level": "warn",
            "code": "NO_OFD_FISCAL_MODULE",
            "title_uz": f"{internal_only_count} ta chek FM/OFD orqali o'tmagan",
            "title_ru": f"{internal_only_count} чеков не фискализированы в ОФД",
            "detail_ru": "По ПКМ №943 чеки населению обязаны проходить через сертифицированную онлайн-ККМ с фискальным модулем (ФМ) в ОФД. Данное приложение ведёт внутренний учёт и готовит данные для налоговой.",
            "detail_uz": "VMQ №943 bo'yicha cheklar fiskal modulli onlayn-KKM orqali OFDga yuborilishi shart. Ilova hozir ichki hisob va soliq hisobotini tayyorlaydi.",
        })
    if len(all_products) > 0 and with_valid_ikpu < len(all_products):
        missing_n = len(all_products) - with_valid_ikpu
        warnings.append({
            "level": "warn",
            "code": "MISSING_IKPU",
            "title_uz": f"{missing_n} ta tovarda 17 xonali MXIK (IKPU) yo'q",
            "title_ru": f"У {missing_n} товаров не заполнен 17-значный ИКПУ (MXIK)",
            "detail_ru": "По ст. 223 НК РУз за реализацию без ИКПУ с tasnif.soliq.uz предусмотрен штраф 1% от стоимости товара.",
            "detail_uz": "Soliq kodeksi 223-moddasi bo'yicha MXIK kodsiz sotish uchun tovar qiymatining 1% miqdorida jarima nazarda tutilgan.",
        })
    if missing_dm > 0:
        warnings.append({
            "level": "danger",
            "code": "TOBACCO_WITHOUT_DATAMATRIX",
            "title_uz": f"Tamaki/markirovka: {missing_dm} ta sotuv DataMatrix kodsiz!",
            "title_ru": f"Табачка/маркировка: {missing_dm} продаж без кода DataMatrix!",
            "detail_ru": "При продаже сигарет и стиков в розницу обязательно сканировать 2D-код DataMatrix («Asl Belgisi») с каждой пачки и выводить его через ОФД.",
            "detail_uz": "Sigaret va stiklarni chakana sotishda har bir qutidagi DataMatrix («Asl Belgisi») kodini skanerlash shart.",
        })
    if tobacco_sku_count > 0 and not (profile.get("tobacco_license_note") or "").strip():
        warnings.append({
            "level": "info",
            "code": "TOBACCO_TRADE_FEE",
            "title_uz": "Tamaki savdosi ruxsatnomasi / yig'imi qayd etilmagan",
            "title_ru": "Не отмечен сбор за розничную торговлю табаком",
            "detail_ru": "Для табачной точки проверьте наличие разрешения и уплату местного сбора за право розничной торговли табачной продукцией (18+).",
            "detail_uz": "Tamaki nuqtasi uchun chakana savdo ruxsatnomasi va mahalliy yig'im to'langanligini tekshiring (18+).",
        })

    return {
        "period": period,
        "period_label": period_label,
        "generated_at": datetime.now(TZ_TASHKENT).isoformat(),
        "profile": profile,
        "summary": {
            "receipts_count": len(sales),
            "refunds_count": len(refunds),
            "gross_sales_revenue": gross_sales_revenue,
            "discounts_total": discounts_total,
            "refunds_total": refunds_total,
            "net_taxable_revenue": net_taxable_revenue,
            "cash_revenue": cash_rev,
            "card_revenue": card_rev,
            "debt_revenue": debt_rev,
            "output_vat_amount": output_vat_net,
            "tax_regime": regime,
            "tax_rate_percent": rate,
            "estimated_tax_due": estimated_tax_due,
            "filing_deadline_day": profile.get("filing_deadline_day", 15),
        },
        "fiscal_summary": {
            "fiscalized_count": fiscalized_count,
            "internal_only_count": internal_only_count,
        },
        "catalog_compliance": {
            "total_active_sku": len(all_products),
            "with_valid_ikpu": with_valid_ikpu,
            "missing_ikpu_count": max(0, len(all_products) - with_valid_ikpu),
            "missing_ikpu_sample": missing_ikpu_sample,
            "tobacco_sku_count": tobacco_sku_count,
            "marking_required_count": marking_required_count,
        },
        "tobacco_and_marking": {
            "tobacco_sales_lines": tobacco_sales_lines,
            "tobacco_units_sold": tobacco_units_sold,
            "tobacco_revenue": tobacco_revenue,
            "marked_with_datamatrix_count": marked_with_dm,
            "missing_datamatrix_count": missing_dm,
            "datamatrix_coverage_pct": round((marked_with_dm / tobacco_sales_lines) * 100.0, 1) if tobacco_sales_lines > 0 else 100.0,
            "duplicate_marking_codes": duplicate_markings,
            "marking_ledger": marking_ledger[:200],
        },
        "ikpu_breakdown": ikpu_list[:100],
        "warnings": warnings,
    }


@router.get("/profile", response_model=dict)
def get_store_tax_profile(
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Get Uzbekistan tax profile and regime presets."""
    profile = get_tax_profile(session)
    return {
        "profile": profile,
        "regimes": [
            {"id": k, **v} for k, v in TAX_REGIMES.items()
        ],
    }


@router.put("/profile", response_model=dict)
def update_store_tax_profile(
    data: TaxProfileUpdate,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Save Uzbekistan taxpayer profile (INN/STIR, tax regime, KKM/tobacco settings)."""
    updates = data.model_dump(exclude_unset=True)
    store_id = updates.pop("store_id", None)
    profile = save_tax_profile(session, updates, store_id=store_id)
    return {"status": "ok", "profile": profile}


@router.get("/mxik-search", response_model=dict)
def mxik_search(
    q: str = Query("", max_length=120),
    current_user: User = Depends(require_role([UserRole.OWNER])),
):
    """Search 17-digit MXIK (IKPU) codes via tasnif.soliq.uz with offline curated fallback."""
    return search_mxik_catalog(q)


@router.get("/report", response_model=dict)
def get_tax_report(
    period: str = Query("month", pattern="^(today|week|month|quarter|year|custom)$"),
    selected_date: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None, gt=0),
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Build Uzbekistan tax compliance & tobacco DataMatrix marking report."""
    return build_tax_report_data(
        session=session,
        period=period,
        selected_date=selected_date,
        start_date_str=start_date,
        end_date_str=end_date,
        store_id=store_id,
    )


@router.get("/export-csv", response_model=None)
def export_tax_csv(
    period: str = Query("month", pattern="^(today|week|month|quarter|year|custom)$"),
    selected_date: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None, gt=0),
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Export Soliq tax summary, IKPU sales registry and tobacco DataMatrix ledger to CSV."""
    report = build_tax_report_data(session, period, selected_date, start_date, end_date, store_id)
    prof = report["profile"]
    summary = report["summary"]
    tob = report["tobacco_and_marking"]

    out = io.StringIO(newline="")
    w = csv.writer(out)
    w.writerow(["SOLIQ / НАЛОГОВЫЙ ОТЧЁТ (UZS)", report["period_label"]])
    w.writerow(["Юрлицо / ИП", _safe_csv_cell(prof.get("legal_name") or "-"), "ИНН / СТИР", _safe_csv_cell(prof.get("inn_stir") or "-")])
    w.writerow(["Налоговый режим", summary["tax_regime"], "Ставка (%)", summary["tax_rate_percent"]])
    w.writerow(["Валовая выручка", summary["gross_sales_revenue"], "Возвраты", summary["refunds_total"]])
    w.writerow(["Налогооблагаемая выручка", summary["net_taxable_revenue"], "Налог к уплате", summary["estimated_tax_due"]])
    w.writerow(["Наличные", summary["cash_revenue"], "Терминал/Карта", summary["card_revenue"], "Долг", summary["debt_revenue"]])
    w.writerow([])

    w.writerow(["РЕЕСТР ПРОДАЖ ПО ИКПУ (MXIK)"])
    w.writerow(["ИКПУ (17 цифр)", "Наименование (пример)", "Табак", "НДС %", "Кол-во", "Выручка", "Возврат", "Чистая выручка", "НДС сумма"])
    for row in report["ikpu_breakdown"]:
        w.writerow([
            _safe_csv_cell(row["ikpu_code"] or "БЕЗ_ИКПУ"),
            _safe_csv_cell(row["sample_name"]),
            "Да" if row["is_tobacco"] else "Нет",
            row["vat_rate"],
            row["quantity_sold"],
            row["gross_revenue"],
            row["refund_amount"],
            row["net_revenue"],
            row["vat_amount"],
        ])
    w.writerow([])

    w.writerow(["РЕЕСТР МАРКИРОВКИ И ТАБАЧКИ (ASL BELGISI / DATAMATRIX)"])
    w.writerow(["Всего позиций", tob["tobacco_sales_lines"], "Пачек/шт", tob["tobacco_units_sold"], "Выручка табак", tob["tobacco_revenue"], "С DataMatrix", tob["marked_with_datamatrix_count"], "Без DataMatrix", tob["missing_datamatrix_count"]])
    w.writerow(["Дата и время", "Чек №", "Товар", "ИКПУ", "Код маркировки DataMatrix", "Кол-во", "Сумма", "Кассир", "Статус ОФД", "Возврат"])
    for m in tob["marking_ledger"]:
        w.writerow([
            m["sold_at"],
            _safe_csv_cell(m["receipt_number"]),
            _safe_csv_cell(m["product_name"]),
            _safe_csv_cell(m["ikpu_code"] or "БЕЗ_ИКПУ"),
            _safe_csv_cell(m["marking_code"] or "НЕ_ОТСКАНИРОВАН"),
            m["quantity"],
            m["total_price"],
            _safe_csv_cell(m["cashier_name"]),
            m["fiscal_status"],
            "Да" if m["is_returned"] else "Нет",
        ])

    return Response(
        content="\ufeff" + out.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="soliq_tax_report_{period}.csv"'},
    )


@router.post("/send-telegram", response_model=dict)
async def send_tax_report_telegram(
    period: str = Query("month", pattern="^(today|week|month|quarter|year|custom)$"),
    store_id: Optional[int] = Query(None, gt=0),
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    """Send Uzbekistan tax & tobacco DataMatrix summary to owner's Telegram."""
    chat_id = _get_owner_chat_id()
    if not chat_id:
        raise HTTPException(status_code=400, detail="TELEGRAM_OWNER_CHAT_ID sozlanmagan / Chat ID не настроен")

    r = build_tax_report_data(session, period=period, store_id=store_id)
    p = r["profile"]
    s = r["summary"]
    t = r["tobacco_and_marking"]
    cat = r["catalog_compliance"]

    lines = [
        f"🏛️ SOLIQ / НАЛОГОВЫЙ ОТЧЁТ ({r['period_label']})",
        f"Субъект: {p.get('legal_name') or 'Не указано'} | СТИР: {p.get('inn_stir') or 'Не указан'}",
        f"Режим: {s['tax_regime']} ({s['tax_rate_percent']}%) | Срок сдачи: до {s['filing_deadline_day']}-го числа",
        "",
        f"Валовая выручка: {s['gross_sales_revenue']:,.0f} сум (чеков: {s['receipts_count']})",
        f"Возвраты: -{s['refunds_total']:,.0f} сум ({s['refunds_count']})",
        f"Налоговая база: {s['net_taxable_revenue']:,.0f} сум",
        f"💰 Расчётный налог: {s['estimated_tax_due']:,.0f} сум",
        f"Оплата: Нал {s['cash_revenue']:,.0f} | Карта {s['card_revenue']:,.0f} | Долг {s['debt_revenue']:,.0f}",
        "",
        "🚬 ТАБАЧКА И МАРКИРОВКА (Asl Belgisi DataMatrix):",
        f"Продано пачек/ед: {t['tobacco_units_sold']} | Выручка: {t['tobacco_revenue']:,.0f} сум",
        f"С DataMatrix: {t['marked_with_datamatrix_count']} | Без DataMatrix: {t['missing_datamatrix_count']} ({t['datamatrix_coverage_pct']}%)",
        "",
        f"📦 Каталог ИКПУ (MXIK): {cat['with_valid_ikpu']} / {cat['total_active_sku']} товаров заполнено.",
        "",
        f"⚠️ Чеков с ОФД/ФМ: {r['fiscal_summary']['fiscalized_count']} | Внутренних: {r['fiscal_summary']['internal_only_count']}",
    ]
    if t["marking_ledger"]:
        lines.append("")
        lines.append("Последние маркированные продажи:")
        for m in t["marking_ledger"][:25]:
            lines.append(f"- {m['sold_at']} | {m['receipt_number']} | {m['product_name']} | DM: {m['masked_code'] or 'НЕТ'} | {m['total_price']:,.0f}")

    doc_bytes = "\n".join(lines).encode("utf-8")
    await send_document(
        chat_id=chat_id,
        document=doc_bytes,
        filename=f"soliq_report_{period}.txt",
        caption=f"🏛️ Налоговый отчёт Soliq + Табачка ({r['period_label']})",
    )
    return {"status": "sent", "message": "Soliq hisoboti Telegramga yuborildi / Налоговый отчёт отправлен в Telegram"}
