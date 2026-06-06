"""Matcher strict pour enrichissement téléphones RoullePro.

Reproduit phone_matcher.py utilisé en POC.
"""
import math
import re
import unicodedata
from difflib import SequenceMatcher

# Catégories Google compatibles avec nos catégories RoullePro
COMPATIBLE_CATEGORIES = {
    "taxi_service",
    "ambulance_service",
    "transportation_escort_service",
    "medical_transportation_service",
    "non_emergency_medical_transportation_service",
}


def normalize(s: str) -> str:
    if not s:
        return ""
    s = s.lower()
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def name_similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    a_n = normalize(a)
    b_n = normalize(b)
    if a_n == b_n:
        return 1.0
    a_tok = set(a_n.split())
    b_tok = set(b_n.split())
    jacc = (
        len(a_tok & b_tok) / len(a_tok | b_tok) if a_tok and b_tok else 0.0
    )
    seq = SequenceMatcher(None, a_n, b_n).ratio()
    return max(jacc, seq)


def _to_float(v):
    if v is None or v == "" or v == "None":
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def haversine_km(lat1, lng1, lat2, lng2) -> float:
    lat1 = _to_float(lat1)
    lng1 = _to_float(lng1)
    lat2 = _to_float(lat2)
    lng2 = _to_float(lng2)
    if None in (lat1, lng1, lat2, lng2):
        return 999.0
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    return 2 * R * math.asin(math.sqrt(a))


PHONE_RE = re.compile(r"\+33\s?[1-9](?:[\s.-]?\d){8}")


def normalize_phone(raw):
    """Retourne format E.164 +33XXXXXXXXX ou None."""
    if not raw:
        return None
    s = str(raw)
    # Cas international +33
    m = PHONE_RE.search(s)
    if m:
        digits = re.sub(r"\D", "", m.group(0))
        # +33 + 9 chiffres = 11 digits, mais on attend +33[1-9]XXXXXXXX = 11 digits
        if digits.startswith("33") and len(digits) == 11:
            return "+" + digits
    # Cas national 0X XX XX XX XX
    digits = re.sub(r"\D", "", s)
    if len(digits) == 10 and digits.startswith("0") and digits[1] in "123456789":
        return "+33" + digits[1:]
    if len(digits) == 11 and digits.startswith("33") and digits[2] in "123456789":
        return "+" + digits
    return None


def evaluate(pro: dict, gmb: dict) -> dict:
    """Évalue le match entre une fiche RoullePro et un résultat Google.

    Retourne dict avec keys: status, phone, score, distance_km, zip_match,
    category_ok, google_title, google_zip, google_city, google_lat, google_lng,
    flags, reasons, addr_match.
    """
    if not gmb:
        return {
            "status": "no_result",
            "phone": None,
            "score": None,
            "distance_km": None,
            "zip_match": False,
            "category_ok": False,
            "google_title": None,
            "google_zip": None,
            "google_city": None,
            "google_lat": None,
            "google_lng": None,
            "flags": [],
            "reasons": ["no_gmb_data"],
            "addr_match": False,
        }

    # Extraction téléphone
    phone = normalize_phone(gmb.get("phone"))

    # Score nom
    pro_name = pro.get("nom_commercial") or pro.get("raison_sociale") or ""
    g_title = gmb.get("title") or ""
    score = name_similarity(pro_name, g_title)

    # Géo
    g_lat = _to_float(gmb.get("latitude"))
    g_lng = _to_float(gmb.get("longitude"))
    p_lat = _to_float(pro.get("latitude"))
    p_lng = _to_float(pro.get("longitude"))
    distance_km = (
        haversine_km(p_lat, p_lng, g_lat, g_lng)
        if all(v is not None for v in (p_lat, p_lng, g_lat, g_lng))
        else None
    )

    # CP
    addr_info = gmb.get("address_info") or {}
    g_zip = addr_info.get("zip") or ""
    p_zip = pro.get("code_postal") or ""
    zip_match = bool(g_zip) and (g_zip == p_zip)

    # Catégorie
    cat_ids = gmb.get("category_ids") or []
    if isinstance(cat_ids, str):
        cat_ids = [cat_ids]
    category_ok = any(c in COMPATIBLE_CATEGORIES for c in cat_ids)

    # Adresse match
    g_addr = normalize(gmb.get("address") or "")
    p_addr = normalize(pro.get("adresse") or "")
    addr_match = False
    if g_addr and p_addr:
        # Comparer les premiers 30 caractères significatifs
        addr_match = SequenceMatcher(None, g_addr[:50], p_addr[:50]).ratio() > 0.7

    flags = []
    reasons = []

    if not phone:
        flags.append("no_phone")
    if not category_ok:
        flags.append("category_incompatible")
    if not zip_match:
        flags.append("zip_mismatch")
    if distance_km is not None and distance_km > 5:
        flags.append("distance_too_far")
    if score < 0.5:
        flags.append("low_name_score")

    # Décision
    if not phone:
        status = "reject"
        reasons.append("no_valid_phone")
    elif not category_ok:
        status = "reject"
        reasons.append("category_not_compatible")
    elif not zip_match:
        status = "reject"
        reasons.append("zip_mismatch")
    elif score >= 0.65 or addr_match:
        status = "accept"
        reasons.append("high_confidence")
    elif score >= 0.4:
        status = "review"
        reasons.append("medium_confidence")
    else:
        status = "reject"
        reasons.append("low_name_score")

    return {
        "status": status,
        "phone": phone,
        "score": round(score, 3),
        "distance_km": round(distance_km, 3) if distance_km is not None else None,
        "zip_match": zip_match,
        "category_ok": category_ok,
        "google_title": g_title,
        "google_zip": g_zip,
        "google_city": addr_info.get("city"),
        "google_lat": g_lat,
        "google_lng": g_lng,
        "flags": flags,
        "reasons": reasons,
        "addr_match": addr_match,
    }
