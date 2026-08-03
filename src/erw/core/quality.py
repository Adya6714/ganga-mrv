"""
Part 1: six required data-quality checks. Each function returns a list of
Issue tuples: (id, category, message). Keeping each rule as its own function
means each one is independently testable, and independently explainable to
a reviewer - "why did BL-006 get flagged?" has one function to point to.
"""
from dataclasses import dataclass
import pandas as pd
from .geo import haversine_m, is_zero_gps
from . import config as cfg


@dataclass
class Issue:
    id: str
    category: str
    message: str


def check_missing_fields(samples: pd.DataFrame) -> list[Issue]:
    issues = []
    for _, row in samples.iterrows():
        if pd.isna(row["barcode"]):
            issues.append(Issue(row["sample_id"], "missing_barcode", "No barcode recorded"))
        if pd.isna(row["collector"]):
            issues.append(Issue(row["sample_id"], "missing_collector", "No collector recorded"))
        if is_zero_gps(row["lat"], row["lon"]):
            issues.append(Issue(row["sample_id"], "missing_gps", "GPS is (0,0)"))
    return issues


def check_orphan_lab_results(joined: pd.DataFrame) -> list[Issue]:
    """Both directions: lab results with no sample, AND samples with a
    barcode that never matched a lab result (distinct from missing_barcode -
    here a barcode WAS recorded, it just doesn't exist in lab_results.csv)."""
    issues = []
    orphan_lab = joined[joined["_merge"] == "right_only"]
    for _, row in orphan_lab.iterrows():
        issues.append(Issue(row["barcode"], "orphan_lab_result",
                             "No matching sample in collection log"))
    orphan_sample = joined[(joined["_merge"] == "left_only") & (joined["barcode"].notna())]
    for _, row in orphan_sample.iterrows():
        issues.append(Issue(row["sample_id"], "orphan_sample",
                             f"Barcode {row['barcode']} has no matching lab result"))
    return issues


def check_baseline_timing(samples: pd.DataFrame) -> list[Issue]:
    """Only meaningful for treatment plots - controls never got rock, so
    'before/after application' has no meaning for them. A baseline dated
    BEFORE the application date is fine (that's the whole point of a
    baseline); only AFTER is a problem."""
    issues = []
    application_date = pd.Timestamp(cfg.ROCK_APPLICATION_DATE)
    baselines = samples[(samples["type"] == "baseline") & (samples["plot_type"] == "treatment")]
    for _, row in baselines.iterrows():
        if row["date"] > application_date:
            issues.append(Issue(
                row["sample_id"], "late_baseline",
                f"Baseline collected {row['date'].date()}, after rock application "
                f"({application_date.date()})"
            ))
    return issues


def check_spatial_outliers(samples: pd.DataFrame) -> list[Issue]:
    issues = []
    treat_baselines = samples[(samples["type"] == "baseline") & (samples["plot_type"] == "treatment")]
    valid_baselines = treat_baselines[~treat_baselines.apply(
        lambda r: is_zero_gps(r["lat"], r["lon"]), axis=1)]
    treat_monitoring = samples[(samples["type"] == "monitoring") & (samples["plot_type"] == "treatment")]

    for _, mon in treat_monitoring.iterrows():
        if valid_baselines.empty:
            continue
        dists = valid_baselines.apply(
            lambda b: haversine_m(mon["lat"], mon["lon"], b["lat"], b["lon"]), axis=1)
        nearest_dist = dists.min()
        if nearest_dist > cfg.PAIRING_MAX_DISTANCE_M:
            nearest_id = valid_baselines.loc[dists.idxmin(), "sample_id"]
            issues.append(Issue(
                mon["sample_id"], "spatial_outlier",
                f"{nearest_dist:.0f}m from nearest treatment baseline ({nearest_id}), "
                f"exceeds {cfg.PAIRING_MAX_DISTANCE_M}m limit"
            ))
    return issues


def check_tracer_stability(joined: pd.DataFrame) -> list[Issue]:
    """Flag Ti deviating >20% from the mean Ti of its plot type.
    NOTE: this uses the mean, as the assignment specifies - see
    docs/SCIENTIFIC_RATIONALE.md for why this is fragile (the mean includes
    whatever outlier you're trying to detect, so a big enough outlier drags
    the reference point toward itself)."""
    issues = []
    matched = joined[joined["_merge"] == "both"]
    for plot_type in matched["plot_type"].dropna().unique():
        subset = matched[matched["plot_type"] == plot_type]
        mean_ti = subset["Ti_ppm"].mean()
        for _, row in subset.iterrows():
            dev = abs(row["Ti_ppm"] - mean_ti) / mean_ti
            if dev > cfg.TI_DEVIATION_THRESHOLD:
                issues.append(Issue(
                    row["sample_id"], "tracer_instability",
                    f"Ti={row['Ti_ppm']:.0f}ppm deviates {dev:.0%} from {plot_type} "
                    f"mean ({mean_ti:.0f}ppm), exceeds {cfg.TI_DEVIATION_THRESHOLD:.0%} threshold"
                ))
    return issues


def check_lab_status(joined: pd.DataFrame) -> list[Issue]:
    issues = []
    matched = joined[joined["_merge"] == "both"]
    flagged = matched[matched["status"] == "flagged"]
    for _, row in flagged.iterrows():
        issues.append(Issue(row["sample_id"], "lab_flagged", "Lab status is 'flagged'"))
    return issues


def run_all_checks(samples: pd.DataFrame, joined: pd.DataFrame) -> list[Issue]:
    return (
        check_missing_fields(samples)
        + check_orphan_lab_results(joined)
        + check_baseline_timing(samples)
        + check_spatial_outliers(samples)
        + check_tracer_stability(joined)
        + check_lab_status(joined)
    )
