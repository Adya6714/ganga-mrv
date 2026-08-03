"""
Median/MAD-based robust tracer QC - replaces the mean-based check, which is
self-contaminating (the outlier it's meant to catch inflates the very
reference statistic used to detect it - see quality.py docstring and
DECISIONS.md).
"""
from dataclasses import dataclass
import numpy as np
from ..core import config as cfg


@dataclass
class RobustQCResult:
    sample_id: str
    value: float
    robust_z: float
    flagged: bool


def median_mad_qc(values: dict, threshold: float = cfg.ROBUST_Z_FLAG_THRESHOLD) -> list[RobustQCResult]:
    """values: {sample_id: measurement}. Robust z = (x - median) / (1.4826*MAD).
    1.4826 is the standard scaling constant making MAD comparable to a
    normal-distribution standard deviation (Iglewicz & Hoaglin convention)."""
    ids = list(values)
    arr = np.array([values[i] for i in ids])
    median = np.median(arr)
    mad = np.median(np.abs(arr - median))
    scaled_mad = 1.4826 * mad

    results = []
    for sid, v in zip(ids, arr):
        z = (v - median) / scaled_mad if scaled_mad > 0 else 0.0
        results.append(RobustQCResult(sid, float(v), float(z), abs(z) > threshold))
    return results
