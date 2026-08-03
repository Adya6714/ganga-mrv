"""
Specification-curve analysis (Simonsohn, Simmons & Nelson 2020): instead of
reporting one CDR number from one set of analytic choices, enumerate every
combination of defensible choices and report the DISTRIBUTION of resulting
answers. If the answer barely moves across specifications, that's evidence
of robustness. If it swings a lot, that's evidence the result is fragile
and overly sensitive to arbitrary choices.

NOTE on which threshold this tests: this varies the PAIR-SPECIFIC Ti
deviation gate (Part 2 validation - compares Ti between the two members of
ONE pair), not the population-mean-based check in quality.py Part 1 (which
compares a sample's Ti against its whole plot-type's mean, and is a
DIFFERENT, more fragile check - see DECISIONS.md / PART3_THINKING.md Q4
for that distinction).
"""
from dataclasses import dataclass
import pandas as pd
from ..core.io import load_samples, load_lab_results, join
from ..core.pairing import pair_plot_type
from ..core.chemistry import pair_cdr_t_per_ha
from ..core import config as cfg


@dataclass
class Specification:
    ordering: str       # "naive" or "prefiltered"
    threshold: float    # pair-specific Ti/Zr deviation gate
    tracer: str          # "Ti_ppm" or "Zr_ppm"
    n_valid: int
    mean_cdr: float | None


def run_specification(samples: pd.DataFrame, joined: pd.DataFrame,
                       ordering: str, tracer_col: str, threshold: float) -> Specification:
    joined_by_id = joined.set_index("sample_id")

    if ordering == "prefiltered":
        has_lab = joined[joined["_merge"] == "both"]["sample_id"]
        pool = samples[samples["sample_id"].isin(has_lab)]
    else:
        pool = samples

    pairs = pair_plot_type(pool, "treatment")
    application_date = pd.Timestamp(cfg.ROCK_APPLICATION_DATE)
    cdrs = []

    for p in pairs:
        if not p.paired:
            continue
        mon, bl = joined_by_id.loc[p.monitoring_id], joined_by_id.loc[p.baseline_id]
        t_bl, t_mon = bl.get(tracer_col), mon.get(tracer_col)
        if pd.isna(t_bl) or pd.isna(t_mon):
            continue
        if abs(t_mon - t_bl) / t_bl > threshold:
            continue
        if bl["date"] > application_date:
            continue
        if bl.get("status") == "flagged" or mon.get("status") == "flagged":
            continue
        total, _, _ = pair_cdr_t_per_ha(
            ca_bl=bl["Ca_ppm"], ca_mon=mon["Ca_ppm"],
            mg_bl=bl["Mg_ppm"], mg_mon=mon["Mg_ppm"],
            ti_bl=t_bl, ti_mon=t_mon,
        )
        cdrs.append(total)

    mean = sum(cdrs) / len(cdrs) if cdrs else None
    return Specification(ordering, threshold, tracer_col, len(cdrs), mean)


def run_all_specifications(samples: pd.DataFrame, joined: pd.DataFrame) -> list[Specification]:
    results = []
    for ordering in ["naive", "prefiltered"]:
        for threshold in [0.10, 0.20, 0.30]:
            for tracer in ["Ti_ppm", "Zr_ppm"]:
                results.append(run_specification(samples, joined, ordering, tracer, threshold))
    return results
