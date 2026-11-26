"""Uzbekistan tax compliance helpers: GS1 DataMatrix (Asl Belgisi), MXIK/IKPU, VAT/Turnover."""
import json
import re
from typing import Any, Dict, List, Optional
import urllib.parse
import urllib.request
from sqlmodel import Session

from ..models import SystemSetting, StoreOutlet


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
    "tobacco_license_note": "",
    "strict_tobacco_marking": False,
}

# Baseline reference hints verified against public tasnif.soliq.uz classification structure
BUILTIN_MXIK_HINTS: List[Dict[str, str]] = [
    {"mxik": "02402001001000000", "name": "Сигареты с фильтром / Filtrli sigaretalar (уточните бренд на tasnif.soliq.uz)", "group": "Табак (024)", "tobacco": "1"},
    {"mxik": "02402002001000000", "name": "Стики табачные нагреваемые / Qizdiriladigan tamaki stiklari (уточните модель)", "group": "Табак (024)", "tobacco": "1"},
    {"mxik": "02403001001000000", "name": "Табак курительный / кальянная смесь (уточните код на tasnif.soliq.uz)", "group": "Табак (024)", "tobacco": "1"},
    {"mxik": "01905001001000000", "name": "Хлеб и хлебобулочные изделия / Non va pishiriqlar", "group": "Хлеб", "tobacco": "0"},
    {"mxik": "00401001001000000", "name": "Молоко и молочные продукты / Sut mahsulotlari", "group": "Молоко", "tobacco": "0"},
    {"mxik": "02201001001000000", "name": "Вода питьевая и минеральная (Asl Belgisi маркировка)", "group": "Напитки", "tobacco": "0"},
    {"mxik": "02202001001000000", "name": "Напитки газированные и безалкогольные / Salqin ichimliklar", "group": "Напитки", "tobacco": "0"},
]


def validate_ikpu(code: Optional[str]) -> bool:
    if not code:
        return False
    clean = code.strip()
    return bool(re.fullmatch(r"\d{17}", clean))


def parse_gs1_datamatrix(raw_code: Optional[str]) -> Optional[Dict[str, Any]]:
    """Parse GS1 DataMatrix code (Asl Belgisi tobacco / water / pharma).

    Returns dict with canonical marking_code, gtin14, serial, and barcode_candidates
    if raw_code matches GS1 DataMatrix structure; otherwise None.
    """
    if not raw_code:
        return None
    raw = str(raw_code).strip()
    # Replace ASCII Group Separator (\x1d) for readable display while preserving full identity
    cleaned = raw.lstrip("\x1d")

    # Standard GS1 format: 01 + 14-digit GTIN + 21 + serial (>=4 chars)
    m = re.match(r"^(?:\(01\)|01)(\d{14})(?:\x1d|\(21\)|21)(.+)$", cleaned)
    if not m:
        # Shortened CIS tobacco DataMatrix format: 14-digit GTIN + 7-char serial + crypto tail (>= 21 chars total, non-numeric serial)
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
        return 0.0  # Simplified VAT 6% is calculated from gross turnover, not per-item VAT credit
    if tax_regime != "VAT_12" and item_vat_rate <= 0:
        return 0.0
    rate = float(item_vat_rate or 0.0)
    if rate <= 0:
        return 0.0
    return round(total_price * rate / (100.0 + rate), 2)


def get_tax_profile(session: Session) -> Dict[str, Any]:
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
    profile["filing_deadline_day"] = TAX_REGIMES[regime]["filing_deadline_day"]
    profile["regime_meta"] = TAX_REGIMES[regime]
    return profile


def save_tax_profile(session: Session, updates: Dict[str, Any], store_id: Optional[int] = None) -> Dict[str, Any]:
    current = get_tax_profile(session)
    for k in DEFAULT_TAX_PROFILE:
        if k in updates and updates[k] is not None:
            current[k] = updates[k]

    regime = current.get("tax_regime", "TURNOVER_1")
    if regime not in TAX_REGIMES:
        regime = "TURNOVER_1"
    current["tax_regime"] = regime

    # If user switched regime without specifying custom rate, snap default rate for standard presets
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
                        if code and name:
                            remote_items.append({
                                "mxik": code,
                                "name": name,
                                "group": str(r.get("groupName") or r.get("className") or "tasnif.soliq.uz"),
                                "tobacco": "1" if code.startswith("024") else "0",
                            })
                if remote_items:
                    source = "tasnif.soliq.uz"
        except Exception:
            pass

    combined = remote_items + [m for m in local_matches if m["mxik"] not in {x["mxik"] for x in remote_items}]
    return {"source": source, "items": combined[:15], "tasnif_url": "https://tasnif.soliq.uz"}
