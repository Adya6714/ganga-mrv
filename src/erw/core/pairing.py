"""
Part 2, Step 1: pair each monitoring sample to its nearest same-plot-type
baseline, GPS-only, 1:1, "closer pair wins" on conflict.

Algorithm: list every (monitoring, baseline) candidate pair within the same
plot_type, sort ALL of them by distance ascending, then walk the sorted list
claiming a pair whenever neither sample has been used yet. Because we process
globally smallest distances first, the true closest pair always locks in
before anything else can claim either of its samples - this is what makes
"closer pair wins" hold even across many competing samples, not just
pairwise. This is a well-known greedy approximation to the optimal 1:1
assignment problem (see pairing_hungarian.py later for the exact-optimal
version via the Hungarian algorithm, for comparison).

NOTE: this stage is deliberately GPS-only, exactly as the assignment
specifies for Part 2 Step 1. It does NOT yet know about missing lab data,
Ti stability, dates, or lab status - that's Step 2 (validation), which
comes next. A sample can "win" a pairing here and still get rejected later.
"""
from dataclasses import dataclass
import pandas as pd
from .geo import haversine_m, is_zero_gps
from . import config as cfg


@dataclass
class PairResult:
    monitoring_id: str
    baseline_id: str | None
    distance_m: float | None
    paired: bool
    reason: str


def pair_plot_type(samples: pd.DataFrame, plot_type: str,
                    max_distance_m: float = cfg.PAIRING_MAX_DISTANCE_M) -> list[PairResult]:
    baselines = samples[(samples["type"] == "baseline") & (samples["plot_type"] == plot_type)]
    monitorings = samples[(samples["type"] == "monitoring") & (samples["plot_type"] == plot_type)]

    # Build every candidate (monitoring, baseline) pair with valid GPS on both ends.
    # A zero-GPS baseline (like BL-005) simply can never appear as a candidate -
    # it's not "far away", it's geometrically meaningless, so we exclude it
    # up front rather than let it compute a nonsense multi-thousand-km distance.
    candidates = []
    for m in monitorings.itertuples():
        if is_zero_gps(m.lat, m.lon):
            continue
        for b in baselines.itertuples():
            if is_zero_gps(b.lat, b.lon):
                continue
            d = haversine_m(m.lat, m.lon, b.lat, b.lon)
            candidates.append((d, m.sample_id, b.sample_id))

    candidates.sort(key=lambda x: x[0])  # global ascending distance

    used_monitoring, used_baseline = set(), set()
    results: dict[str, PairResult] = {}

    for d, mid, bid in candidates:
        if mid in used_monitoring or bid in used_baseline:
            continue  # one or both already claimed by a closer pair
        if d > max_distance_m:
            continue  # too far to be a valid claim, but keep looking for others
        used_monitoring.add(mid)
        used_baseline.add(bid)
        results[mid] = PairResult(mid, bid, d, True, "paired within distance limit")

    # Any monitoring sample never claimed: report why, using its single
    # nearest baseline (even if over the limit) so the report is informative.
    for m in monitorings.itertuples():
        if m.sample_id in results:
            continue
        if is_zero_gps(m.lat, m.lon):
            results[m.sample_id] = PairResult(m.sample_id, None, None, False,
                                                "monitoring sample has invalid GPS (0,0)")
            continue
        valid_baselines = baselines[~baselines.apply(
            lambda r: is_zero_gps(r["lat"], r["lon"]), axis=1)]
        if valid_baselines.empty:
            results[m.sample_id] = PairResult(m.sample_id, None, None, False,
                                                "no baseline with valid GPS exists for this plot type")
            continue
        dists = valid_baselines.apply(
            lambda b: haversine_m(m.lat, m.lon, b["lat"], b["lon"]), axis=1)
        nearest_id = valid_baselines.loc[dists.idxmin(), "sample_id"]
        nearest_d = dists.min()
        if nearest_d > max_distance_m:
            reason = f"nearest valid baseline ({nearest_id}) is {nearest_d:.0f}m away, exceeds {max_distance_m:.0f}m limit"
        else:
            reason = f"nearest baseline ({nearest_id}, {nearest_d:.0f}m) was already claimed by a closer monitoring sample"
        results[m.sample_id] = PairResult(m.sample_id, None, None, False, reason)

    return list(results.values())
