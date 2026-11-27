"""Summarise the GIM CampusRun survey (Google Forms CSV export) into results.json for the deck.

Usage:
    python3 research/survey/analyze.py research/survey/GIM_Swiggy_CampusRun_Survey_Responses.csv

Writes research/survey/results.json, which deck/build-deck.js reads to fill the primary-research
numbers. Columns are matched by keywords in the question text; multi-select answers are matched
against the known option list because some options contain commas.
"""
import csv
import json
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent

Q = {
    "program": "program are you enrolled",
    "stay": "where do you currently stay",
    "failed": "failed or abandoned your cart",
    "why": "look for food outside the campus mess",
    "spend": "per-person spend",
    "frustration": "single biggest frustration",
    "wait": "walking to the gate and waiting",
    "windows": "time windows",
    "slot": "fixed daily slot",
    "frequency": "how often would you use it",
    "features": "features would make you use",
    "healthy": "healthy / high-protein",
}
MULTI = {
    "why": ["Mess menu fatigue", "Late-night hunger", "Group hangouts", "Craving specific cuisines"],
    "windows": ["Lunch", "Evening Snacks", "Dinner", "Midnight"],
    "features": ["Hostel Wing Pooling", "Adding Instamart", "OTP-secured drop shelf", "AI order planner", "Weekend Dineout"],
}
SPEND_MID = {"Under ₹150": 100, "₹150 – ₹250": 200, "₹250 – ₹350": 300, "Above ₹350": 400}
WAIT_ORDER = ["Under 10 minutes", "10 – 15 minutes", "15 – 20 minutes", "More than 20 minutes"]
FREQ_PER_WEEK = {"3+ times a week": 3.0, "1 – 2 times a week": 1.5, "2 – 3 times a month": 0.6, "Rarely / Never": 0.0}


def main(path):
    rows = list(csv.DictReader(open(path, encoding="utf-8-sig", newline="")))
    n = len(rows)
    headers = list(rows[0].keys())
    col = {k: next((h for h in headers if kw in h.lower()), None) for k, kw in Q.items()}
    missing = [k for k, c in col.items() if c is None]
    if missing:
        sys.exit(f"Columns not found: {missing}")
    pct = lambda x: round(100 * x / n)

    def single(k):
        return Counter(r[col[k]].strip() for r in rows)

    def multi(k):
        c = Counter()
        for r in rows:
            for opt in MULTI[k]:
                if opt.lower() in r[col[k]].lower():
                    c[opt] += 1
        return {o: {"count": c[o], "pct": pct(c[o])} for o in MULTI[k]}

    failed = single("failed")
    unserviceable = sum(v for k, v in failed.items() if "unserviceable" in k)
    fee_abandon = sum(v for k, v in failed.items() if "abandoned cart" in k)
    gate_hassle = sum(v for k, v in failed.items() if "gate pickup" in k)

    wait = single("wait")
    cum, median_bucket = 0, None
    for b in WAIT_ORDER:
        cum += wait.get(b, 0)
        if median_bucket is None and cum >= (n + 1) / 2:
            median_bucket = b
    wait_15plus = wait.get("15 – 20 minutes", 0) + wait.get("More than 20 minutes", 0)

    spend = single("spend")
    mean_spend = sum(SPEND_MID[k] * v for k, v in spend.items() if k in SPEND_MID) / n

    slot = single("slot")
    slot_yes = sum(v for k, v in slot.items() if k.startswith(("Definitely", "Probably")))
    freq = single("frequency")
    weekly = sum(v for k, v in freq.items() if "a week" in k)
    orders_per_week = sum(FREQ_PER_WEEK.get(k, 0) * v for k, v in freq.items()) / n

    frustration = single("frustration")
    healthy = single("healthy")

    res = {
        "n": n,
        "collected": "26–27 Nov 2026",
        "programs": dict(single("program")),
        "on_campus_pct": pct(single("stay").get("On-campus Hostel", 0)),
        "pct_failed_or_abandoned": pct(unserviceable + fee_abandon),
        "pct_unserviceable": pct(unserviceable),
        "pct_abandoned_fees": pct(fee_abandon),
        "pct_ordered_with_gate_hassle": pct(gate_hassle),
        "median_walk_wait": median_bucket.replace(" minutes", " min") if median_bucket else None,
        "pct_wait_15plus": pct(wait_15plus),
        "mean_spend_per_person": round(mean_spend),
        "spend": {k: {"count": v, "pct": pct(v)} for k, v in spend.items()},
        "pct_would_use_fixed_slot": pct(slot_yes),
        "pct_definitely_slot": pct(slot.get("Definitely yes", 0)),
        "pct_weekly_users": pct(weekly),
        "stated_orders_per_student_week": round(orders_per_week, 2),
        "biggest_frustration": {k: {"count": v, "pct": pct(v)} for k, v in frustration.most_common()},
        "why_outside_food": multi("why"),
        "order_windows": multi("windows"),
        "feature_pull": multi("features"),
        "pct_healthy_regular": pct(sum(v for k, v in healthy.items() if k.startswith("Yes"))),
        "pct_healthy_any": pct(sum(v for k, v in healthy.items() if not k.startswith("No"))),
    }
    out = HERE / "results.json"
    out.write_text(json.dumps(res, indent=2, ensure_ascii=False))
    print(json.dumps(res, indent=2, ensure_ascii=False))
    print("\nWrote", out)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else HERE / "GIM_Swiggy_CampusRun_Survey_Responses.csv")
