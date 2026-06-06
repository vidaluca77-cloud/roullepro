"""Worker enrichissement téléphones DataForSEO → Supabase.

Lit phone_enrichment_queue (status=pending), interroge DataForSEO Google My
Business, applique matcher strict, met à jour pros_sanitaire ou crée un cas
de review. Logue tout dans phone_enrichment_log.

Variables d'environnement requises :
  - DATAFORSEO_LOGIN
  - DATAFORSEO_PASSWORD
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - BATCH_SIZE (optionnel, défaut 100)
  - MAX_MINUTES (optionnel, défaut 50)

Lancement local :
    python enrich.py

Lancement GitHub Actions : voir .github/workflows/phone-enrichment.yml
"""
import base64
import json
import os
import re
import sys
import time

import requests

# Permet l'import local de matcher.py
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matcher import evaluate  # noqa: E402


DATAFORSEO_LOGIN = os.environ["DATAFORSEO_LOGIN"]
DATAFORSEO_PASSWORD = os.environ["DATAFORSEO_PASSWORD"]
SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
BATCH_SIZE = int(os.environ.get("BATCH_SIZE", "100"))
MAX_MINUTES = int(os.environ.get("MAX_MINUTES", "50"))

EXCLUDED_ID = "4275105a-4d45-46fd-9012-6701f1c9ea81"  # Etienne PETIT
API_COST_PER_CALL = 0.0054

DFS_AUTH = "Basic " + base64.b64encode(
    f"{DATAFORSEO_LOGIN}:{DATAFORSEO_PASSWORD}".encode()
).decode()

SB_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


def sb_rpc(fn: str, payload: dict):
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/{fn}",
        headers=SB_HEADERS,
        json=payload,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def sb_sql(query: str):
    """Exécute du SQL brut via une fonction RPC dédiée (à créer côté DB)."""
    return sb_rpc("exec_sql", {"query": query})


def sb_select(table: str, params: dict):
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=SB_HEADERS,
        params=params,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def sb_insert(table: str, rows: list):
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=SB_HEADERS,
        json=rows,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def sb_update(table: str, params: dict, body: dict):
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=SB_HEADERS,
        params=params,
        json=body,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def claim_batch(n: int):
    """Lock atomique sur n fiches pending → processing.

    Utilise une fonction RPC SQL dédiée pour bénéficier de FOR UPDATE SKIP LOCKED.
    """
    return sb_rpc("claim_phone_enrichment_batch", {"batch_size": n})


def dataforseo_gmb(keyword: str, location_code: int = 2250, language_code: str = "fr"):
    """Appelle DataForSEO GMB live."""
    url = "https://api.dataforseo.com/v3/business_data/google/my_business_info/live"
    payload = [{
        "keyword": keyword,
        "location_code": location_code,
        "language_code": language_code,
    }]
    r = requests.post(
        url,
        headers={"Authorization": DFS_AUTH, "Content-Type": "application/json"},
        json=payload,
        timeout=120,
    )
    r.raise_for_status()
    data = r.json()
    if data.get("status_code") != 20000:
        return None, f"api_status_{data.get('status_code')}"
    tasks = data.get("tasks") or []
    if not tasks:
        return None, "no_tasks"
    task = tasks[0]
    if task.get("status_code") != 20000:
        msg = task.get("status_message", "")
        if "No Search Results" in msg:
            return None, "no_result"
        return None, f"task_status_{task.get('status_code')}_{msg[:80]}"
    results = task.get("result") or []
    if not results:
        return None, "no_result"
    items = (results[0] or {}).get("items") or []
    if not items:
        return None, "no_result"
    return items[0], None


def clean_name(name: str) -> str:
    """Nettoie les parenthèses doublées en fin de nom."""
    if not name:
        return ""
    return re.sub(r"\s*\([^)]*\)\s*$", "", name).strip()


def process_one(pro: dict):
    name = clean_name(pro.get("nom_commercial") or pro.get("raison_sociale") or "")
    ville = pro.get("ville") or ""
    keyword = f"{name} {ville}".strip()

    if not name or not ville:
        return {"status": "error", "phone": None, "google_title": None, "google_zip": None,
                "google_city": None, "google_lat": None, "google_lng": None,
                "distance_km": None, "score": None, "google_category": None,
                "reasons": ["missing_name_or_city"], "raw": None}

    gmb, err = dataforseo_gmb(keyword)

    if err == "no_result":
        return {"status": "no_result", "phone": None, "google_title": None, "google_zip": None,
                "google_city": None, "google_lat": None, "google_lng": None,
                "distance_km": None, "score": None, "google_category": None,
                "reasons": ["no_search_results"], "raw": None}
    if err:
        return {"status": "error", "phone": None, "google_title": None, "google_zip": None,
                "google_city": None, "google_lat": None, "google_lng": None,
                "distance_km": None, "score": None, "google_category": None,
                "reasons": [err], "raw": None}

    verdict = evaluate(pro, gmb)
    verdict["google_category"] = gmb.get("category")
    verdict["raw"] = gmb
    return verdict


def main():
    start = time.time()
    deadline = start + MAX_MINUTES * 60
    counters = {"accept": 0, "review": 0, "reject": 0, "no_result": 0, "error": 0}

    print(f"=== Worker enrichissement démarré, budget {MAX_MINUTES} min ===", flush=True)

    while time.time() < deadline:
        # Réclamer 1 fiche
        try:
            batch = claim_batch(1)
        except requests.HTTPError as e:
            print(f"[ERROR] claim_batch: {e}", flush=True)
            time.sleep(5)
            continue
        if not batch:
            print("Queue vide, fin", flush=True)
            break
        pro = batch[0]
        pro_id = pro["pro_id"]

        try:
            verdict = process_one(pro)
        except Exception as e:
            print(f"[EXC] {pro_id}: {e}", flush=True)
            verdict = {"status": "error", "phone": None, "google_title": None, "google_zip": None,
                       "google_city": None, "google_lat": None, "google_lng": None,
                       "distance_km": None, "score": None, "google_category": None,
                       "reasons": [str(e)[:200]], "raw": None}

        status = verdict["status"]
        counters[status] = counters.get(status, 0) + 1

        # Actions
        if status == "accept" and verdict.get("phone"):
            phone = verdict["phone"]
            if pro_id != EXCLUDED_ID:
                try:
                    sb_update(
                        "pros_sanitaire",
                        {"id": f"eq.{pro_id}", "claimed": "eq.false"},
                        {"telephone_public": phone, "phone_e164": phone},
                    )
                except requests.HTTPError as e:
                    print(f"[ERR update pros] {pro_id}: {e}", flush=True)
        elif status == "review":
            try:
                sb_insert("phone_enrichment_review", [{
                    "pro_id": pro_id,
                    "phone_candidate": verdict.get("phone"),
                    "google_title": verdict.get("google_title"),
                    "google_address": (verdict.get("raw") or {}).get("address"),
                    "google_zip": verdict.get("google_zip"),
                    "distance_km": verdict.get("distance_km"),
                    "name_score": verdict.get("score"),
                    "flags": verdict.get("flags", []),
                }])
            except requests.HTTPError as e:
                print(f"[ERR insert review] {pro_id}: {e}", flush=True)

        # Log toujours
        reasons = "; ".join(verdict.get("reasons", []))
        try:
            sb_insert("phone_enrichment_log", [{
                "pro_id": pro_id,
                "status": status,
                "phone_found": verdict.get("phone"),
                "google_title": verdict.get("google_title"),
                "google_address": (verdict.get("raw") or {}).get("address"),
                "google_zip": verdict.get("google_zip"),
                "google_city": verdict.get("google_city"),
                "google_lat": verdict.get("google_lat"),
                "google_lng": verdict.get("google_lng"),
                "google_category": verdict.get("google_category"),
                "distance_km": verdict.get("distance_km"),
                "name_score": verdict.get("score"),
                "match_reason": reasons if status in ("accept", "review") else None,
                "reject_reason": reasons if status in ("reject", "error", "no_result") else None,
                "api_cost": API_COST_PER_CALL if status != "error" else 0,
                "raw_response": verdict.get("raw"),
            }])
        except requests.HTTPError as e:
            print(f"[ERR insert log] {pro_id}: {e}", flush=True)

        # Mark done
        try:
            sb_update(
                "phone_enrichment_queue",
                {"pro_id": f"eq.{pro_id}"},
                {"status": "done", "processed_at": "now()"},
            )
        except requests.HTTPError as e:
            print(f"[ERR mark done] {pro_id}: {e}", flush=True)

        total = sum(counters.values())
        elapsed = int(time.time() - start)
        if total % 10 == 0 or total <= 5:
            print(f"[{elapsed}s] #{total} {pro.get('ville','')[:20]} {(pro.get('nom_commercial') or pro.get('raison_sociale') or '')[:30]} -> {status}", flush=True)

    # Résumé final
    elapsed = int(time.time() - start)
    total = sum(counters.values())
    cost = total * API_COST_PER_CALL
    print("\n=== TERMINÉ ===", flush=True)
    print(f"Total: {total} fiches en {elapsed}s ({elapsed//60}min)", flush=True)
    print(f"Counters: {counters}", flush=True)
    print(f"Coût: ${cost:.2f}", flush=True)


if __name__ == "__main__":
    main()
