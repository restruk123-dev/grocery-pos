"""Uzbekistan tax compliance helpers: GS1 DataMatrix (Asl Belgisi), MXIK/IKPU, VAT/Turnover & OFD Bridge."""
import io
import json
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
import urllib.parse
import urllib.request
import qrcode
import qrcode.image.svg
from sqlmodel import Session

from ..models import SystemSetting, StoreOutlet, Sale, SaleItem, PaymentMethod


TZ_TASHKENT = timezone(timedelta(hours=5))

MARKING_GROUPS: Dict[str, str] = {
    "NONE": "Без маркировки",
    "TOBACCO": "Табак / 18+ (Asl Belgisi)",
    "BEVERAGES": "Вода и напитки (Asl Belgisi)",
    "BEER_ALCOHOL": "Пиво и алкоголь (Asl Belgisi)",
    "OTHER": "Прочая маркировка (Asl Belgisi)",
}

TAX_REGIMES: Dict[str, Dict[str, Any]] = {
    "TURNOVER_1": {
        "label_uz": "YaTT aylanmadan soliq (1%)",
        "label_ru": "ИП: налог с оборота (1%)",
        "default_rate": 1.0,
        "filing_deadline_day": 15,
        "is_vat_payer": False,
    },
    "TURNOVER_4": {
        "label_uz": "MChJ aylanmadan soliq (4%)",
        "label_ru": "ООО: налог с оборота (4%)",
        "default_rate": 4.0,
        "filing_deadline_day": 15,
        "is_vat_payer": False,
    },
    "TURNOVER_CUSTOM": {
        "label_uz": "Aylanmadan soliq (maxsus %)",
        "label_ru": "Налог с оборота (своя ставка %)",
        "default_rate": 2.0,
        "filing_deadline_day": 15,
        "is_vat_payer": False,
    },
    "VAT_12": {
        "label_uz": "QQS to'lovchi (12% + foyda solig'i)",
        "label_ru": "Плательщик НДС (12%)",
        "default_rate": 12.0,
        "filing_deadline_day": 20,
        "is_vat_payer": True,
    },
    "VAT_6": {
        "label_uz": "Soddalashtirilgan QQS (6%)",
        "label_ru": "Упрощённый НДС (6% с оборота)",
        "default_rate": 6.0,
        "filing_deadline_day": 20,
        "is_vat_payer": True,
    },
}

DEFAULT_TAX_PROFILE: Dict[str, Any] = {
    "legal_name": "",
    "inn_stir": "",
    "tax_regime": "TURNOVER_1",
    "tax_rate_percent": 1.0,
    "address": "",
    "kkm_serial": "",
    "ofd_gateway_name": "",
    "ofd_gateway_url": "",
    "ofd_api_token": "",
    "tobacco_license_note": "",
    "strict_tobacco_marking": False,
    "strict_beverage_marking": False,
}

# Baseline reference hints verified against public tasnif.soliq.uz classification structure
BUILTIN_MXIK_HINTS: List[Dict[str, str]] = [
    {"mxik": "02402001001000000", "package_code": "1209964", "name": "Сигареты с фильтром / Filtrli sigaretalar (уточните бренд)", "group": "Табак (024)", "marking_group": "TOBACCO", "tobacco": "1"},
    {"mxik": "02402002001000000", "package_code": "1209964", "name": "Стики табачные нагреваемые / Qizdiriladigan tamaki stiklari", "group": "Табак (024)", "marking_group": "TOBACCO", "tobacco": "1"},
    {"mxik": "02403001001000000", "package_code": "1209964", "name": "Табак курительный / кальянная смесь", "group": "Табак (024)", "marking_group": "TOBACCO", "tobacco": "1"},
    {"mxik": "02201001001000000", "package_code": "1501337", "name": "Вода питьевая и минеральная (Asl Belgisi)", "group": "Вода/Напитки (022)", "marking_group": "BEVERAGES", "tobacco": "0"},
    {"mxik": "02202001001000000", "package_code": "1501337", "name": "Напитки газированные / энергетические / соки (Asl Belgisi)", "group": "Вода/Напитки (022)", "marking_group": "BEVERAGES", "tobacco": "0"},
    {"mxik": "02203001001000000", "package_code": "1501337", "name": "Пиво и пивные напитки (Asl Belgisi)", "group": "Пиво/Алко (022)", "marking_group": "BEER_ALCOHOL", "tobacco": "0"},
    {"mxik": "02208001001000000", "package_code": "1501337", "name": "Алкогольная продукция крепкая (Asl Belgisi)", "group": "Пиво/Алко (022)", "marking_group": "BEER_ALCOHOL", "tobacco": "0"},
    {"mxik": "01905001001000000", "package_code": "1501337", "name": "Хлеб, лепёшки и хлебобулочные изделия / Non va pishiriqlar", "group": "Хлеб (019)", "marking_group": "NONE", "tobacco": "0"},
    {"mxik": "00401001001000000", "package_code": "1501337", "name": "Молоко и молочные продукты / Sut mahsulotlari", "group": "Молоко (004)", "marking_group": "NONE", "tobacco": "0"},
    {"mxik": "01701001001000000", "package_code": "1177610", "name": "Сахар-песок / Shakar (кг)", "group": "Бакалея (017)", "marking_group": "NONE", "tobacco": "0"},
    {"mxik": "01512001001000000", "package_code": "1501337", "name": "Масло подсолнечное / Kungaboqar yog'i", "group": "Бакалея (015)", "marking_group": "NONE", "tobacco": "0"},
    {"mxik": "00902001001000000", "package_code": "1501337", "name": "Чай чёрный и зелёный / Choy", "group": "Чай/Кофе (009)", "marking_group": "NONE", "tobacco": "0"},
    {"mxik": "01101001001000000", "package_code": "1177610", "name": "Мука пшеничная / Bug'doy uni", "group": "Бакалея (011)", "marking_group": "NONE", "tobacco": "0"},
]


def validate_ikpu(code: Optional[str]) -> bool:
    if not code:
        return False
    clean = code.strip()
    return bool(re.fullmatch(r"\d{17}", clean))


def parse_gs1_datamatrix(raw_code: Optional[str]) -> Optional[Dict[str, Any]]:
    """Parse GS1 DataMatrix code (Asl Belgisi tobacco / water / beverages / beer / alcohol)."""
    if not raw_code:
        return None
    raw = str(raw_code).strip()
    cleaned = raw.lstrip("\x1d")

    m = re.match(r"^(?:\(01\)|01)(\d{14})(?:\x1d|\(21\)|21)(.+)$", cleaned)
    if not m:
        m_short = re.match(r"^(\d{14})([A-Za-z0-9!\"%&'()*+,\-./:;<=>?_]{7,})$", cleaned)
        if not m_short or cleaned.isdigit():
            return None
        gtin14 = m_short.group(1)
        rest = m_short.group(2)
        serial = rest.split("\x1d")[0][:20]
    else:
        gtin14 = m.group(1)
        rest = m.group(2)
        serial = re.split(r"[\x1d(]", rest)[0][:32]

    candidates = []
    for cand in (
        gtin14,
        gtin14[1:] if gtin14.startswith("0") else None,
        gtin14[2:] if gtin14.startswith("00") else None,
        gtin14.lstrip("0") or None,
    ):
        if cand and cand not in candidates:
            candidates.append(cand)

    canonical = cleaned.replace("\x1d", "")
    masked = f"{canonical[:16]}...{canonical[-6:]}" if len(canonical) > 26 else canonical

    return {
        "marking_code": canonical[:240],
        "masked_code": masked,
        "gtin14": gtin14,
        "serial": serial,
        "barcode_candidates": candidates,
    }


def mask_marking_code(code: Optional[str]) -> Optional[str]:
    if not code:
        return None
    clean = str(code).strip()
    if len(clean) <= 22:
        return clean
    return f"{clean[:16]}...{clean[-6:]}"


def compute_line_vat(total_price: float, item_vat_rate: float, tax_regime: str) -> float:
    """Compute VAT portion included in retail price using NK RUz inclusive formula."""
    if tax_regime == "VAT_6":
        return 0.0
    if tax_regime != "VAT_12" and item_vat_rate <= 0:
        return 0.0
    rate = float(item_vat_rate or 0.0)
    if rate <= 0:
        return 0.0
    return round(total_price * rate / (100.0 + rate), 2)


def generate_qr_svg(content: Optional[str]) -> Optional[str]:
    """Generate clean SVG QR string for fiscal receipt URLs without needing PIL."""
    if not content or not str(content).strip():
        return None
    try:
        qr = qrcode.QRCode(box_size=6, border=1, image_factory=qrcode.image.svg.SvgImage)
        qr.add_data(str(content).strip())
        qr.make(fit=True)
        svg_img = qr.make_image()
        buf = io.BytesIO()
        svg_img.save(buf)
        return buf.getvalue().decode("utf-8")
    except Exception:
        return None


def _load_raw_tax_profile(session: Session) -> Dict[str, Any]:
    profile = dict(DEFAULT_TAX_PROFILE)
    setting = session.get(SystemSetting, "uz_tax_profile")
    if setting and setting.value:
        try:
            loaded = json.loads(setting.value)
            if isinstance(loaded, dict):
                profile.update(loaded)
        except Exception:
            pass
    regime = profile.get("tax_regime", "TURNOVER_1")
    if regime not in TAX_REGIMES:
        regime = "TURNOVER_1"
    profile["tax_regime"] = regime
    if profile.get("tax_rate_percent") is None:
        profile["tax_rate_percent"] = TAX_REGIMES[regime]["default_rate"]
    return profile


def get_tax_profile(session: Session, include_secret: bool = False) -> Dict[str, Any]:
    raw = _load_raw_tax_profile(session)
    regime = raw["tax_regime"]
    out = dict(raw)
    out["has_ofd_token"] = bool((raw.get("ofd_api_token") or "").strip())
    out["ofd_configured"] = bool((raw.get("ofd_gateway_url") or "").strip())
    if not include_secret:
        out.pop("ofd_api_token", None)
    out["filing_deadline_day"] = TAX_REGIMES[regime]["filing_deadline_day"]
    out["regime_meta"] = TAX_REGIMES[regime]
    return out


def save_tax_profile(session: Session, updates: Dict[str, Any], store_id: Optional[int] = None) -> Dict[str, Any]:
    current = _load_raw_tax_profile(session)
    for k in DEFAULT_TAX_PROFILE:
        if k in updates and updates[k] is not None:
            if k == "ofd_api_token" and not str(updates[k]).strip():
                continue  # Never erase existing API token when omitted/blank in UI form
            current[k] = updates[k]

    regime = current.get("tax_regime", "TURNOVER_1")
    if regime not in TAX_REGIMES:
        regime = "TURNOVER_1"
    current["tax_regime"] = regime

    if "tax_regime" in updates and "tax_rate_percent" not in updates and regime != "TURNOVER_CUSTOM":
        current["tax_rate_percent"] = TAX_REGIMES[regime]["default_rate"]

    to_store = {k: current[k] for k in DEFAULT_TAX_PROFILE}
    setting = session.get(SystemSetting, "uz_tax_profile")
    if not setting:
        setting = SystemSetting(key="uz_tax_profile", value=json.dumps(to_store, ensure_ascii=False))
    else:
        setting.value = json.dumps(to_store, ensure_ascii=False)
    session.add(setting)

    if store_id:
        outlet = session.get(StoreOutlet, store_id)
        if outlet:
            outlet.legal_name = current.get("legal_name") or outlet.legal_name
            outlet.inn_stir = current.get("inn_stir") or outlet.inn_stir
            outlet.tax_regime = regime
            outlet.tax_rate_percent = float(current.get("tax_rate_percent") or 1.0)
            outlet.kkm_serial = current.get("kkm_serial") or outlet.kkm_serial
            outlet.tobacco_license_note = current.get("tobacco_license_note") or outlet.tobacco_license_note
            session.add(outlet)

    session.commit()
    return get_tax_profile(session)


def search_mxik_catalog(query: str) -> Dict[str, Any]:
    """Query local curated MXIK hints plus live tasnif.soliq.uz public integration API if reachable."""
    q = (query or "").strip()
    ql = q.lower()
    local_matches = [
        item for item in BUILTIN_MXIK_HINTS
        if not ql or ql in item["name"].lower() or ql in item["mxik"] or ql in item["group"].lower()
    ]

    remote_items: List[Dict[str, str]] = []
    source = "local"
    if len(q) >= 2:
        try:
            url = (
                "https://tasnif.soliq.uz/api/cl-api/integration-api/v1/mxik/search?"
                + urllib.parse.urlencode({"query": q, "size": 10})
            )
            req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "GroceryStorePOS/1.0"})
            with urllib.request.urlopen(req, timeout=2.5) as resp:
                payload = json.loads(resp.read().decode("utf-8", errors="ignore"))
                rows = payload.get("data") or payload.get("content") or payload.get("items") or []
                if isinstance(payload, list):
                    rows = payload
                for r in rows[:10]:
                    if isinstance(r, dict):
                        code = str(r.get("mxikCode") or r.get("code") or r.get("mxik") or "").strip()
                        name = str(r.get("nameRu") or r.get("nameUz") or r.get("name") or r.get("mxikName") or "").strip()
                        pkg_code = ""
                        pkgs = r.get("packageNames") or r.get("packages") or []
                        if isinstance(pkgs, list) and pkgs and isinstance(pkgs[0], dict):
                            pkg_code = str(pkgs[0].get("code") or pkgs[0].get("packageCode") or "").strip()
                        elif r.get("packageCode"):
                            pkg_code = str(r.get("packageCode")).strip()
                        if code and name:
                            mg = "TOBACCO" if code.startswith("024") else ("BEVERAGES" if code.startswith(("02201", "02202")) else ("BEER_ALCOHOL" if code.startswith(("02203", "02204", "02205", "02206", "02207", "02208")) else "NONE"))
                            remote_items.append({
                                "mxik": code,
                                "package_code": pkg_code or "1501337",
                                "name": name,
                                "group": str(r.get("groupName") or r.get("className") or "tasnif.soliq.uz"),
                                "marking_group": mg,
                                "tobacco": "1" if mg == "TOBACCO" else "0",
                            })
                if remote_items:
                    source = "tasnif.soliq.uz"
        except Exception:
            pass

    combined = remote_items + [m for m in local_matches if m["mxik"] not in {x["mxik"] for x in remote_items}]
    return {"source": source, "items": combined[:15], "tasnif_url": "https://tasnif.soliq.uz"}


def build_ofd_receipt_payload(
    sale: Sale,
    sale_items: List[SaleItem],
    profile: Dict[str, Any],
    outlet: Optional[StoreOutlet] = None,
    is_refund: bool = False,
) -> Dict[str, Any]:
    """Build standardized Uzbekistan Virtual KKM / OFD JSON payload (amounts in tiyins)."""
    created_tash = (sale.created_at.replace(tzinfo=timezone.utc) if sale.created_at.tzinfo is None else sale.created_at).astimezone(TZ_TASHKENT)
    total_tiyin = int(round(sale.total_amount * 100))
    if sale.payment_method == PaymentMethod.CASH:
        cash_tiyin = total_tiyin
        card_tiyin = 0
        credit_tiyin = 0
    elif sale.payment_method == PaymentMethod.CARD:
        cash_tiyin = 0
        card_tiyin = total_tiyin
        credit_tiyin = 0
    elif sale.payment_method == PaymentMethod.DEBT:
        cash_tiyin = 0
        card_tiyin = 0
        credit_tiyin = total_tiyin
    else:
        card_tiyin = int(round((sale.card_amount or 0.0) * 100))
        credit_tiyin = int(round((sale.debt_amount or 0.0) * 100))
        cash_tiyin = max(0, total_tiyin - card_tiyin - credit_tiyin)

    items_payload = []
    discount_amt = float(getattr(sale, "discount_amount", 0.0) or 0.0)
    gross_amt = max(1.0, sale.total_amount + discount_amt)
    disc_ratio = (discount_amt / gross_amt) if discount_amt > 0 else 0.0

    for it in sale_items:
        item_disc = int(round(it.total_price * disc_ratio * 100))
        vat_pct = int(round(max(0.0, float(getattr(it, "vat_rate", 0.0) or 0.0))))
        row: Dict[str, Any] = {
            "Name": it.product_name,
            "SPIC": getattr(it, "ikpu_code", None) or "",
            "PackageCode": getattr(it, "package_code", None) or "1501337",
            "Price": int(round(it.unit_price * 100)),
            "Amount": it.quantity,
            "VAT": int(round(float(getattr(it, "vat_amount", 0.0) or 0.0) * 100)),
            "VATPercent": vat_pct,
            "Discount": item_disc,
            "Other": 0,
        }
        mc = getattr(it, "marking_code", None)
        if mc:
            row["MarkingCode"] = mc
        items_payload.append(row)

    return {
        "ReceiptNumber": sale.receipt_number,
        "SellerINN": (outlet.inn_stir if outlet and outlet.inn_stir else profile.get("inn_stir")) or "",
        "SellerName": (outlet.legal_name if outlet and outlet.legal_name else profile.get("legal_name")) or "",
        "KKMSerial": (outlet.kkm_serial if outlet and outlet.kkm_serial else profile.get("kkm_serial")) or "",
        "ReceivedCash": cash_tiyin,
        "ReceivedCard": card_tiyin,
        "CreditAmount": credit_tiyin,
        "TotalVAT": int(round(float(getattr(sale, "vat_amount", 0.0) or 0.0) * 100)),
        "IsRefund": 1 if is_refund else 0,
        "ReceiptType": 0,
        "Time": created_tash.strftime("%Y-%m-%d %H:%M:%S"),
        "Items": items_payload,
    }


def send_receipt_to_ofd_gateway(payload: Dict[str, Any], raw_profile: Dict[str, Any]) -> Dict[str, Any]:
    """Optional bridge to an external Virtual KKM / OFD gateway configured by the store owner."""
    gw_url = (raw_profile.get("ofd_gateway_url") or "").strip()
    if not gw_url or not gw_url.startswith(("http://", "https://")):
        return {"fiscalized": False, "error": "OFD gateway URL not configured"}

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "GroceryStorePOS/1.0",
    }
    token = (raw_profile.get("ofd_api_token") or "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        req = urllib.request.Request(
            gw_url,
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5.0) as resp:
            raw_body = resp.read().decode("utf-8", errors="ignore")
            data = json.loads(raw_body) if raw_body else {}
            fiscal_sign = (
                data.get("FiscalSign")
                or data.get("fiscal_sign")
                or (data.get("data") or {}).get("FiscalSign")
                or data.get("TerminalID")
            )
            qr_url = (
                data.get("QRCodeURL")
                or data.get("qrCodeUrl")
                or data.get("fiscal_receipt_url")
                or (data.get("data") or {}).get("QRCodeURL")
            )
            if resp.status in (200, 201) and (fiscal_sign or qr_url):
                return {
                    "fiscalized": True,
                    "fiscal_sign": str(fiscal_sign or ""),
                    "fiscal_receipt_url": str(qr_url or ""),
                }
            return {"fiscalized": False, "error": "Gateway response lacked FiscalSign/QRCodeURL"}
    except Exception as exc:
        return {"fiscalized": False, "error": str(exc)}
