"""
Part 2, Steps 3-4: compute CDR for each valid pair, then project-level
summary statistics (mean, std, N valid/attempted, 95% CI via t-distribution).

Why t-distribution and not normal (z)? With a small sample (here N=2), the
sample standard deviation is itself a noisy estimate of the true population
std dev - using it as if it were exact (as z-intervals do) understates
uncertainty. The t-distribution has heavier tails that widen the interval
to correctly account for that extra layer of uncertainty. As N grows, t
converges to z (by df~30 they're nearly identical).
"""
from dataclasses import dataclass
import pandas as pd
from scipy import stats as sp_stats
from .chemistry import pair_cdr_t_per_ha
from . import config as cfg


@dataclass
class PairCDR:
    monitoring_id: str
    baseline_id: str
    total_t_per_ha: float
    cdr_ca: float
    cdr_mg: float


@dataclass
class ProjectStats:
    n_valid: int
    n_attempted: int
    mean: float | None
    std: float | None
    ci_95: tuple[float, float] | None
    ci_note: str


def compute_pair_cdrs(valid_results, joined: pd.DataFrame) -> list[PairCDR]:
    """valid_results: list of ValidationResult where .valid is True.
    joined: outer-joined samples+lab dataframe, indexed for lookup."""
    joined_by_id = joined.set_index("sample_id")
    out = []
    for v in valid_results:
        if not v.valid:
            continue
        mon = joined_by_id.loc[v.monitoring_id]
        bl = joined_by_id.loc[v.baseline_id]
        total, ca, mg = pair_cdr_t_per_ha(
            ca_bl=bl["Ca_ppm"], ca_mon=mon["Ca_ppm"],
            mg_bl=bl["Mg_ppm"], mg_mon=mon["Mg_ppm"],
            ti_bl=bl["Ti_ppm"], ti_mon=mon["Ti_ppm"],
        )
        out.append(PairCDR(v.monitoring_id, v.baseline_id, total, ca.cdr_mol_equiv, mg.cdr_mol_equiv))
    return out


def project_statistics(pair_cdrs: list[PairCDR], n_attempted: int) -> ProjectStats:
    n_valid = len(pair_cdrs)
    if n_valid == 0:
        return ProjectStats(0, n_attempted, None, None, None, "no valid pairs")

    values = pd.Series([p.total_t_per_ha for p in pair_cdrs])
    mean = values.mean()

    if n_valid < 2:
        return ProjectStats(n_valid, n_attempted, mean, None, None,
                             "insufficient samples for std dev / CI (N<2)")

    std = values.std(ddof=1)  # ddof=1: sample std dev (Bessel's correction)

    if n_valid < 3:
        se = std / (n_valid ** 0.5)
        t_mult = sp_stats.t.ppf(0.975, df=n_valid - 1)
        margin = t_mult * se
        ci = (mean - margin, mean + margin)
        return ProjectStats(n_valid, n_attempted, mean, std, ci,
                             f"CI computed but extremely wide (df={n_valid-1}, "
                             f"t-multiplier={t_mult:.1f}) - not meaningfully informative at N={n_valid}")

    se = std / (n_valid ** 0.5)
    t_mult = sp_stats.t.ppf(0.975, df=n_valid - 1)
    margin = t_mult * se
    ci = (mean - margin, mean + margin)
    return ProjectStats(n_valid, n_attempted, mean, std, ci, "")
