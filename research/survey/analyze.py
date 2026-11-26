"""Turn the GIM student survey export into the numbers and charts the deck uses.

Usage (after exporting Google Form responses as CSV):
    python3 research/survey/analyze.py responses.csv --interviews 9 --evenings 3

Writes:
    research/survey/results.json   -> read by deck/build-deck.js to fill slide 1
    research/survey/chart-*.png    -> optional charts for the deck appendix / video

Columns are matched by keywords in the Google Form question text (see QUESTIONS below), so the
form questions must keep the wording from research/primary-research-kit.md. Only real responses
belong in this file; the script reports n so the deck shows the true sample size.
"""
import argparse
import csv
import json
import statistics
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent

# key -> words that must all appear (case-insensitive) in the question header
QUESTIONS = {
    "failed": ["not serviceable"],                 # Q4
    "minutes": ["minutes", "walking"],            # Q5
    "when": ["most likely to want outside food"],  # Q6
    "spend": ["spend per outside meal"],           # Q7
    "weekly": ["at least once a week"],            # Q9 (1-5)
    "slot": ["fixed slot"],                        # Q10
    "pool": ["roommates"],                         # Q11
    "ai": ["ai assistant"],                        # Q12
    "captain": ["campus captain"],                 # Q13
}


def find_col(headers, words):
    for h in headers:
        hl = h.lower()
        if all(w in hl for w in words):
            return h
    return None


def pct(rows, col, accept):
    vals = [r[col].strip() for r in rows if col and r.get(col, "").strip()]
    if not vals:
        return None, 0
    hit = sum(1 for v in vals if any(v.lower().startswith(a) for a in accept))
    return round(100 * hit / len(vals)), len(vals)


def first_number(s):
    num = ""
    for ch in s:
        if ch.isdigit() or (ch == "." and num):
            num += ch
        elif num:
            break
    return float(num) if num else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("csv")
    ap.add_argument("--interviews", type=int, default=None, help="number of student interviews you ran")
    ap.add_argument("--evenings", type=int, default=None, help="number of gate-observation evenings")
    ap.add_argument("--charts", action="store_true", help="also write PNG charts (needs matplotlib)")
    a = ap.parse_args()

    with open(a.csv, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        sys.exit("No responses in " + a.csv)
    headers = list(rows[0].keys())
    cols = {k: find_col(headers, w) for k, w in QUESTIONS.items()}
    missing = [k for k, c in cols.items() if c is None]
    if missing:
        print("Warning: no column matched for", missing, "- check the form question wording", file=sys.stderr)

    failed_pct, _ = pct(rows, cols["failed"], ["yes"])
    slot_pct, _ = pct(rows, cols["slot"], ["yes"])
    pool_pct, _ = pct(rows, cols["pool"], ["sometimes", "usually"])
    ai_pct, _ = pct(rows, cols["ai"], ["yes"])
    captain_pct, _ = pct(rows, cols["captain"], ["yes"])
    mins = [first_number(r[cols["minutes"]]) for r in rows if cols["minutes"] and r.get(cols["minutes"])]
    mins = [m for m in mins if m is not None and 0 <= m <= 180]
    weekly = [first_number(r[cols["weekly"]]) for r in rows if cols["weekly"] and r.get(cols["weekly"])]
    weekly = [w for w in weekly if w]
    top2 = round(100 * sum(1 for w in weekly if w >= 4) / len(weekly)) if weekly else None

    when_counts = {}
    if cols["when"]:
        for r in rows:
            for part in r[cols["when"]].split(";") if ";" in r[cols["when"]] else r[cols["when"]].split(","):
                p = part.strip()
                if p:
                    when_counts[p] = when_counts.get(p, 0) + 1

    results = {
        "n": len(rows),
        "interviews": a.interviews,
        "evenings": a.evenings,
        "pct_failed_or_gave_up": failed_pct,
        "median_walk_wait_min": round(statistics.median(mins)) if mins else None,
        "pct_would_use_fixed_slot": slot_pct,
        "pct_would_pool": pool_pct,
        "pct_want_ai_cart": ai_pct,
        "pct_would_be_captain": captain_pct,
        "pct_weekly_intent_top2": top2,
        "preferred_times": dict(sorted(when_counts.items(), key=lambda kv: -kv[1])),
    }
    out = HERE / "results.json"
    out.write_text(json.dumps(results, indent=2, ensure_ascii=False))
    print(json.dumps(results, indent=2, ensure_ascii=False))
    print("\nWrote", out, "- now rebuild the deck (see README).")

    if a.charts:
        try:
            import matplotlib
        except ImportError:
            sys.exit("Charts need matplotlib: pip install matplotlib (results.json was still written)")
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        labels = ["Gave up ordering\nto campus", "Would use a\nfixed slot", "Would pool\nwith wing", "Want AI\ngroup cart"]
        vals = [results[k] or 0 for k in ["pct_failed_or_gave_up", "pct_would_use_fixed_slot", "pct_would_pool", "pct_want_ai_cart"]]
        fig, ax = plt.subplots(figsize=(6, 3.2), dpi=200)
        bars = ax.barh(labels[::-1], vals[::-1], color="#FF5200")
        ax.bar_label(bars, labels=[f"{v}%" for v in vals[::-1]], padding=4, fontsize=9)
        ax.set_xlim(0, 100)
        ax.set_title(f"GIM student survey (n = {results['n']})", fontsize=11, loc="left")
        for s in ["top", "right", "bottom"]:
            ax.spines[s].set_visible(False)
        ax.set_xticks([])
        fig.tight_layout()
        fig.savefig(HERE / "chart-survey.png")
        print("Wrote", HERE / "chart-survey.png")


if __name__ == "__main__":
    main()
