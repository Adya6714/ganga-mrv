"""
Investigating candidate explanations for the non-zero control CDR (17.89
t/ha, expected ~0). This module doesn't compute CDR - it tests whether
specific confounds are visible in the raw chemistry, independent of the
CDR formula itself.

Lab-batch confound: every baseline is barcode LB-24-*, every monitoring
sample is LB-25-*. Treatment epoch (before/after) is therefore perfectly
tangled with lab analysis batch - if the lab drifted between the two
analysis runs, that alone could produce a false enrichment signal in BOTH
treatment and control.

GNG-BL-006 is a natural test case: chemically a baseline (should show no
enrichment), but physically analyzed in the 2025 batch (barcode LB-25-*).
If it looks elevated relative to the OTHER (2024-batch) baselines, that's
evidence FOR batch drift. If it looks like a normal baseline, that's
evidence AGAINST batch drift as the (sole) explanation.
"""
from dataclasses import dataclass
import pandas as pd


@dataclass
class BatchComparison:
    element: str
    batch_2024_mean: float
    bl006_value: float
    pct_deviation: float


def compare_bl006_to_2024_batch(joined: pd.DataFrame) -> list[BatchComparison]:
    """Compare BL-006 (2025-batch baseline) against the mean of the
    genuine 2024-batch treatment baselines, for each mobile/tracer element."""
    treat_2024_baselines = joined[
        (joined["type"] == "baseline")
        & (joined["plot_type"] == "treatment")
        & (joined["barcode"].str.startswith("LB-24"))
        & (joined["_merge"] == "both")
    ]
    bl006 = joined[joined["sample_id"] == "GNG-BL-006"].iloc[0]

    results = []
    for element in ["Ti_ppm", "Ca_ppm", "Mg_ppm", "Si_ppm"]:
        batch_mean = treat_2024_baselines[element].mean()
        bl006_value = bl006[element]
        pct_dev = (bl006_value - batch_mean) / batch_mean * 100
        results.append(BatchComparison(element, batch_mean, bl006_value, pct_dev))
    return results
