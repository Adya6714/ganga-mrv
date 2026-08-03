"""
Isolation Forest for tracer anomaly detection - the ML-based alternative
to the assignment's fixed 20% threshold. Isolation Forest isolates
anomalies by recursively partitioning the feature space; points that
require FEWER random splits to isolate are scored as more anomalous.

HONEST FINDING (see PROGRESS.md / DECISIONS.md): at n=7 with one obvious
outlier, this is a case study in a real ML engineering trade-off, not a
clear win for the ML method:
  - contamination='auto': UNSTABLE across random seeds (43/50 correctly
    flag only MON-003; 7/50 also falsely flag BL-002).
  - contamination=1/7 (told exactly how many outliers exist): STABLE
    across all 50 seeds - but this requires knowing the answer in advance,
    which defeats the purpose of unsupervised detection.
  - Simple median/MAD (see DECISIONS.md D-series) separates the same
    outlier with a robust z-score of ~96 - no seed instability, no need
    to pre-specify contamination, fully explainable to a non-ML auditor.
This module is included to demonstrate the ML technique correctly AND
to make an evidence-based case for when NOT to reach for it - both are
real ML engineering skills.
"""
from dataclasses import dataclass
from collections import Counter
import numpy as np
from sklearn.ensemble import IsolationForest


@dataclass
class SeedStabilityResult:
    contamination_setting: str
    flagged_sets: dict  # tuple of flagged ids -> count out of n_seeds
    n_seeds: int


def seed_stability_sweep(X: np.ndarray, ids: list[str], contamination,
                          n_seeds: int = 50) -> SeedStabilityResult:
    """Run Isolation Forest across many random seeds and report how often
    each DIFFERENT flagged-set outcome occurs - directly exposes whether
    the detector's output is stable or seed-dependent."""
    counts = Counter()
    for seed in range(n_seeds):
        clf = IsolationForest(random_state=seed, contamination=contamination, n_estimators=100).fit(X)
        pred = clf.predict(X)
        flagged = tuple(sorted(i for i, p in zip(ids, pred) if p == -1))
        counts[flagged] += 1
    label = "auto" if contamination == "auto" else f"{contamination:.3f}"
    return SeedStabilityResult(label, dict(counts), n_seeds)
