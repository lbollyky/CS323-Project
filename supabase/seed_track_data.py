#!/usr/bin/env python3
"""
Seed two weeks of gently-improving daily logs for a single user and clear
today's entry. Runs against Supabase via PostgREST using the service-role
key (bypasses RLS). One-off helper for demo data.
"""
import json
import math
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta

EMAIL = "lbollyky@gmail.com"

# Load env from .env.local
ENV_PATH = os.path.join(os.path.dirname(__file__), "..", ".env.local")
env = {}
with open(ENV_PATH) as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()

BASE = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/") + "/rest/v1"
KEY = env["SUPABASE_SERVICE_ROLE_KEY"]
HEADERS = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
}


def req(method, path, body=None, extra_headers=None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body is not None else None
    headers = dict(HEADERS)
    if extra_headers:
        headers.update(extra_headers)
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            txt = resp.read().decode()
            return resp.status, (json.loads(txt) if txt else None)
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code} on {method} {path}: {e.read().decode()}")
        sys.exit(1)


# 1. Resolve the user id.
status, rows = req("GET", f"/profiles?email=eq.{EMAIL}&select=id")
if not rows:
    print(f"No profile found for {EMAIL}. Log in once, then re-run.")
    sys.exit(1)
user_id = rows[0]["id"]
print(f"User id: {user_id}")

# App's notion of "today" is UTC (todayISO uses toISOString).
today = datetime.now(timezone.utc).date()


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def rnd(v):
    return int(round(v))


# 2. Build 14 days (yesterday back to two weeks ago) with an upward trend.
rows_to_upsert = []
NOTES = {
    1: "Slept through the night, woke before the alarm — best in weeks.",
    3: "Focus held all afternoon without the usual 3pm dip.",
    6: "Long training day; legs heavy but mood stayed good.",
    9: "Travel threw off my schedule a little, but still recovering well.",
    12: "Starting to notice steadier energy across the whole day.",
}

for d in range(1, 15):  # 1..14 days ago
    log_date = (today - timedelta(days=d)).isoformat()
    trend = (14 - d) / 13.0  # yesterday=1.0 (best), two weeks ago=0.0
    sleep = clamp(rnd(4.5 + 4.0 * trend + 0.6 * math.sin(d * 0.9)), 1, 10)
    energy = clamp(rnd(4.0 + 4.2 * trend + 0.6 * math.sin(d * 0.7 + 1)), 1, 10)
    focus = clamp(rnd(3.8 + 4.5 * trend + 0.6 * math.sin(d * 1.1 + 2)), 1, 10)
    mood = clamp(rnd(4.8 + 3.8 * trend + 0.5 * math.sin(d * 0.5 + 0.5)), 1, 10)
    hrv = clamp(rnd(38 + 22 * trend + 3 * math.sin(d * 0.8)), 20, 200)
    rhr = clamp(rnd(64 - 8 * trend + 2 * math.sin(d * 0.6)), 40, 90)
    rem = clamp(rnd(72 + 35 * trend + 8 * math.sin(d)), 0, 240)
    deep = clamp(rnd(52 + 30 * trend + 7 * math.sin(d * 1.2)), 0, 240)
    protocols = ["epitalon"] if d % 6 == 2 else ["epitalon", "pinealon"]
    rows_to_upsert.append({
        "user_id": user_id,
        "log_date": log_date,
        "protocols_taken": protocols,
        "sleep_score": sleep,
        "energy_score": energy,
        "focus_score": focus,
        "mood_score": mood,
        "side_effects": None,
        "notes": NOTES.get(d),
        "hrv_ms": hrv,
        "resting_hr": rhr,
        "rem_minutes": rem,
        "deep_minutes": deep,
    })

# 3. Clear today's log so the check-in reads as not-yet-logged.
req("DELETE", f"/daily_logs?user_id=eq.{user_id}&log_date=eq.{today.isoformat()}")
print(f"Cleared today's log ({today.isoformat()}).")

# 4. Upsert the two weeks of data.
req(
    "POST",
    "/daily_logs?on_conflict=user_id,log_date",
    body=rows_to_upsert,
    extra_headers={"Prefer": "resolution=merge-duplicates,return=minimal"},
)
print(f"Seeded {len(rows_to_upsert)} days of improving logs.")

# Show a quick before/after summary of the trend.
oldest = rows_to_upsert[-1]
newest = rows_to_upsert[0]
print("\nTrend (two weeks ago -> yesterday):")
for k in ["sleep_score", "energy_score", "focus_score", "mood_score", "hrv_ms", "resting_hr"]:
    print(f"  {k:13s}: {oldest[k]} -> {newest[k]}")
