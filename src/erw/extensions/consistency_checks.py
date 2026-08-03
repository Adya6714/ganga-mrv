"""
Two independent forensic checks: does a sample's chemistry match its
DECLARED class, and does a Ti anomaly show up in magnitude, ratio, or both
(which determines whether it's recoverable via renormalization or not).
"""
from dataclasses import dataclass
from collections import defaultdict
import numpy as np


@dataclass
class ClassConsistencyResult:
    sample_id: str
    declared_class: tuple
    closest_class: tuple
    consistent: bool
    distances: dict


def build_class_centroids(reference_samples: dict) -> dict:
    """reference_samples: {sample_id: (plot_type, type, ca_ppm)}.
    Should exclude samples already known to be under investigation, to
    avoid the reference statistic being contaminated by what it's testing."""
    classes = defaultdict(list)
    for sid, (plot, typ, ca) in reference_samples.items():
        classes[(plot, typ)].append(ca)
    return {k: float(np.median(v)) for k, v in classes.items()}


def check_class_consistency(sample_id: str, declared_plot: str, declared_type: str,
                             ca_value: float, centroids: dict) -> ClassConsistencyResult:
    declared_class = (declared_plot, declared_type)
    distances = {cls: abs(ca_value - centroid) for cls, centroid in centroids.items()}
    closest_class = min(distances, key=distances.get)
    return ClassConsistencyResult(sample_id, declared_class, closest_class,
                                    closest_class == declared_class, distances)


@dataclass
class RatioMagnitudeResult:
    sample_id: str
    magnitude_z: float
    ratio_z: float
    diagnosis: str


def ratio_vs_magnitude_decomposition(ti_zr_values: dict, threshold: float = 3.5) -> list[RatioMagnitudeResult]:
    """ti_zr_values: {sample_id: (Ti_ppm, Zr_ppm)}. Diagnoses whether an
    anomaly is a mass/dilution error (magnitude off, ratio intact -
    recoverable) or foreign material (both off - unrecoverable)."""
    ids = list(ti_zr_values)
    ti_vals = np.array([ti_zr_values[i][0] for i in ids])
    ratios = np.array([ti_zr_values[i][0] / ti_zr_values[i][1] for i in ids])

    med_ti, mad_ti = np.median(ti_vals), np.median(np.abs(ti_vals - np.median(ti_vals)))
    med_ratio, mad_ratio = np.median(ratios), np.median(np.abs(ratios - np.median(ratios)))
    scaled_mad_ti = 1.4826 * mad_ti if mad_ti > 0 else 1e-9
    scaled_mad_ratio = 1.4826 * mad_ratio if mad_ratio > 0 else 1e-9

    results = []
    for sid, ti, ratio in zip(ids, ti_vals, ratios):
        mag_z = (ti - med_ti) / scaled_mad_ti
        ratio_z = (ratio - med_ratio) / scaled_mad_ratio
        if abs(mag_z) > threshold and abs(ratio_z) > threshold:
            diag = "BOTH anomalous - foreign material (unrecoverable)"
        elif abs(mag_z) > threshold:
            diag = "magnitude only - mass/dilution error (recoverable)"
        elif abs(ratio_z) > threshold:
            diag = "ratio only - compositional anomaly despite normal magnitude"
        else:
            diag = "clean"
        results.append(RatioMagnitudeResult(sid, float(mag_z), float(ratio_z), diag))
    return results
