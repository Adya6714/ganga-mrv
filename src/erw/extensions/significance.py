"""
Formal statistical testing, per the real Isometric protocol's requirement:
a one-tailed significance test (t-test if normal, Mann-Whitney U otherwise)
before crediting is permitted. Also: power/MDE analysis, which answers a
different question - not "is THIS result significant" but "is our sample
size even capable of detecting a realistic effect at all."

IMPORTANT HONESTY NOTE ON SAMPLE SIZE: with N=2 per group, Mann-Whitney U
has a hard mathematical floor on how small its p-value can ever get,
regardless of the data - there simply aren't enough possible orderings of
2-vs-2 values to produce strong evidence. This is not a bug in our code;
it is a real limitation of the test at this sample size, and we report it
as such rather than treating a non-significant result as surprising.
"""
from dataclasses import dataclass
from scipy import stats as sp_stats
from statsmodels.stats.power import TTestIndPower


@dataclass
class SignificanceResult:
    test_name: str
    statistic: float
    p_value: float
    significant_at_05: bool
    note: str


def one_sample_t_vs_zero(values: list[float]) -> SignificanceResult:
    """Is treatment CDR significantly greater than zero? One-tailed."""
    stat, p = sp_stats.ttest_1samp(values, popmean=0, alternative="greater")
    return SignificanceResult(
        "one-sample t-test (treatment > 0)", stat, p, p < 0.05,
        f"df={len(values)-1}"
    )


def welch_t_treatment_vs_control(treatment: list[float], control: list[float]) -> SignificanceResult:
    """Is treatment CDR significantly greater than control? One-tailed,
    Welch's t-test (does NOT assume equal variances - appropriate here
    since treatment std=1.98 and control std=15.85 are very different)."""
    stat, p = sp_stats.ttest_ind(treatment, control, equal_var=False, alternative="greater")
    return SignificanceResult(
        "Welch's t-test (treatment > control)", stat, p, p < 0.05,
        "equal_var=False (Welch), appropriate given very different observed variances"
    )


def mann_whitney_treatment_vs_control(treatment: list[float], control: list[float]) -> SignificanceResult:
    """Non-parametric fallback per protocol. At N=2 vs N=2, this test has
    a hard floor on achievable p-value - it CANNOT reach p<0.05 no matter
    what the data says. We report this explicitly rather than let a
    non-significant result look like a real negative finding."""
    stat, p = sp_stats.mannwhitneyu(treatment, control, alternative="greater")
    return SignificanceResult(
        "Mann-Whitney U (treatment > control)", stat, p, p < 0.05,
        f"N=2 vs N=2: minimum achievable p-value is mathematically bounded "
        f"well above 0.05 - a non-significant result here is EXPECTED and "
        f"uninformative, not evidence of no effect."
    )


def minimum_detectable_effect(std: float, n_per_group: int, alpha: float = 0.05,
                               power: float = 0.8) -> float:
    """Given observed variability and current sample size, what's the
    smallest TRUE effect (in the same units as std) we could reliably
    detect at all? Uses Cohen's d convention: effect_size_d = raw_effect / std."""
    analysis = TTestIndPower()
    d = analysis.solve_power(effect_size=None, nobs1=n_per_group, alpha=alpha,
                              power=power, ratio=1.0, alternative="larger")
    return d * std


def required_n_for_effect(raw_effect: float, std: float, alpha: float = 0.05,
                           power: float = 0.8) -> float:
    """Given a realistic true effect size we care about detecting (e.g. 2
    t CO2/ha) and the observed noise level, how many samples PER GROUP
    would we need for 80% power to detect it?"""
    analysis = TTestIndPower()
    d = raw_effect / std
    n = analysis.solve_power(effect_size=d, nobs1=None, alpha=alpha,
                              power=power, ratio=1.0, alternative="larger")
    return n
def pooled_std(std1: float, n1: int, std2: float, n2: int) -> float:
    """Pooled std dev across two groups with possibly different variances
    and sizes - the correct noise scale for a two-group comparison, as
    opposed to using either group's std alone (which was our earlier
    mistake: using only treatment's std=1.98 badly understated the real
    noise floor for a treatment-vs-CONTROL comparison, where control's
    std=15.85 is eight times larger)."""
    return (((n1 - 1) * std1**2 + (n2 - 1) * std2**2) / (n1 + n2 - 2)) ** 0.5
