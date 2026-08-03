"""
Regression tests for pairing.py, codifying findings from PROGRESS.md
Session 3-4 so a future change can't silently reintroduce the MON-004
hazard or break the max-distance guarantee.
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

import pandas as pd
from erw.core.pairing import pair_plot_type

SAMPLES = pd.DataFrame([
    {"sample_id": "BL-A", "type": "baseline", "lat": 23.4512, "lon": 87.3201, "plot_type": "treatment"},
    {"sample_id": "BL-B", "type": "baseline", "lat": 23.4515, "lon": 87.3198, "plot_type": "treatment"},
    {"sample_id": "MON-A", "type": "monitoring", "lat": 23.4512, "lon": 87.3201, "plot_type": "treatment"},
    {"sample_id": "MON-B", "type": "monitoring", "lat": 23.4513, "lon": 87.3200, "plot_type": "treatment"},
])


def test_each_baseline_used_at_most_once():
    """1:1 matching - no baseline should be claimed by more than one
    monitoring sample."""
    results = pair_plot_type(SAMPLES, "treatment")
    used_baselines = [r.baseline_id for r in results if r.paired]
    assert len(used_baselines) == len(set(used_baselines))


def test_no_pair_exceeds_max_distance():
    results = pair_plot_type(SAMPLES, "treatment", max_distance_m=500)
    for r in results:
        if r.paired:
            assert r.distance_m <= 500


def test_closer_pair_wins_conflict():
    """MON-A sits at 0m from BL-A (identical coords). MON-B is 45m from
    BL-A and 30m from BL-B. MON-A should win BL-A (it's the globally
    closest pair), forcing MON-B onto BL-B."""
    results = {r.monitoring_id: r for r in pair_plot_type(SAMPLES, "treatment")}
    assert results["MON-A"].baseline_id == "BL-A"
    assert results["MON-A"].distance_m == 0
    assert results["MON-B"].paired
    assert results["MON-B"].baseline_id == "BL-B"
