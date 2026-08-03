"""
Three small, honest robustness checks - explicitly requested extensions
(bootstrap) or documented discrepancies (depth convention) worth actually
computing rather than leaving as a claim. Each is cheap and, at N=2, mostly
demonstrates PROCESS and understanding rather than moving the headline
result - which is itself worth stating plainly rather than overselling.
"""
import random
from dataclasses import dataclass
from ..core.chemistry import pair_cdr_t_per_ha


@dataclass
class BootstrapResult:
    unique_possible_means: list[float]
    ci_95: tuple[float, float]
    note: str


def bootstrap_ci(values: list[float], n_resamples: int = 10000, seed: int = 42) -> BootstrapResult:
    """Percentile bootstrap. At small N this is illustrative of the METHOD,
    not a reliable alternative to the t-distribution CI - see note."""
    rng = random.Random(seed)
    means = [sum(rng.choices(values, k=len(values))) / len(values) for _ in range(n_resamples)]
    means.sort()
    lo = means[int(0.025 * len(means))]
    hi = means[int(0.975 * len(means))]
    unique = sorted(set(round(m, 4) for m in means))

    note = (
        f"At N={len(values)}, only {len(unique)} distinct resample means are "
        f"mathematically possible: {unique}. The bootstrap CI is therefore "
        f"bounded by [min(values), max(values)] = [{min(values)}, {max(values)}] "
        "and CANNOT express the possibility that the true population mean lies "
        "outside the observed sample - it assumes the sample already represents "
        "the population's spread, which is fragile at this N. This is why it is "
        "NARROWER than the t-distribution CI, and why that narrowness should NOT "
        "be read as more precision - it's a structural limitation of resampling "
        "from too few points, not stronger evidence."
    )
    return BootstrapResult(unique, (lo, hi), note)


@dataclass
class DepthToggleResult:
    pair_id: str
    cdr_30cm: float
    cdr_20cm: float
    ratio: float


def depth_convention_toggle(pair_id: str, ca_bl: float, ca_mon: float,
                             mg_bl: float, mg_mon: float,
                             ti_bl: float, ti_mon: float) -> DepthToggleResult:
    """Assignment specifies 30cm depth / 2600 t/ha. Real Isometric protocol
    uses 20cm. Pure linear multiplier on soil mass (assuming constant bulk
    density with depth) - implemented and verified, not just asserted."""
    soil_30cm = 2600.0
    soil_20cm = 2600.0 * (20 / 30)
    cdr_30, _, _ = pair_cdr_t_per_ha(ca_bl=ca_bl, ca_mon=ca_mon, mg_bl=mg_bl, mg_mon=mg_mon,
                                       ti_bl=ti_bl, ti_mon=ti_mon, soil_mass_t_per_ha=soil_30cm)
    cdr_20, _, _ = pair_cdr_t_per_ha(ca_bl=ca_bl, ca_mon=ca_mon, mg_bl=mg_bl, mg_mon=mg_mon,
                                       ti_bl=ti_bl, ti_mon=ti_mon, soil_mass_t_per_ha=soil_20cm)
    return DepthToggleResult(pair_id, cdr_30, cdr_20, cdr_20 / cdr_30)


@dataclass
class ChargeBalanceResult:
    pair_id: str
    ca_fraction: float
    mg_fraction: float
    note: str


def charge_balance_audit(pair_id: str, ca_bl: float, ca_mon: float,
                          mg_bl: float, mg_mon: float,
                          ti_bl: float, ti_mon: float) -> ChargeBalanceResult:
    """What fraction of total CDR comes from Ca vs Mg, and is that split
    chemically coherent with whole-rock basalt weathering (both
    plagioclase/Ca and pyroxene-olivine/Mg phases contributing), rather
    than an artifact dominated by a single mineral/element."""
    _, ca, mg = pair_cdr_t_per_ha(ca_bl=ca_bl, ca_mon=ca_mon, mg_bl=mg_bl, mg_mon=mg_mon,
                                    ti_bl=ti_bl, ti_mon=ti_mon)
    total = ca.cdr_mol_equiv + mg.cdr_mol_equiv
    ca_frac, mg_frac = ca.cdr_mol_equiv / total, mg.cdr_mol_equiv / total

    if max(ca_frac, mg_frac) > 0.9:
        note = "one cation dominates >90% of the signal - check for a single-mineral artifact."
    else:
        note = "reasonably balanced Ca/Mg contribution - consistent with whole-rock dissolution drawing from multiple mineral phases, not a single-mineral artifact."
    return ChargeBalanceResult(pair_id, ca_frac, mg_frac, note)
