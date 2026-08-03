"""
Formal counterfactual subtraction, per the real Isometric protocol's master
equation: CO2e_Removal = CO2e_Stored - CO2e_Counterfactual - CO2e_Emissions.

This assignment's simplified formula only computes CO2e_Stored (the treatment
CDR). CO2e_Counterfactual is exactly what the control-plot CDR measures - the
protocol treats it as a required subtraction term, not a side sanity check.
We have no data to estimate CO2e_Emissions (e.g. transport/crushing/spreading
emissions), so it's omitted and explicitly noted, not silently assumed zero.

Uncertainty propagation: when subtracting two INDEPENDENT estimates, their
variances add even though their means subtract:
    Var(net) = Var(treatment) + Var(control)
    SE(net)  = sqrt(SE(treatment)^2 + SE(control)^2)
This is standard error propagation for independent random variables - it is
NOT valid to just subtract the two standard errors or CIs directly.
"""
from dataclasses import dataclass
from scipy import stats as sp_stats
from ..core.stats import ProjectStats


@dataclass
class NetCDRResult:
    gross_treatment: float
    counterfactual_control: float
    net_cdr: float
    net_se: float | None
    net_ci_95: tuple[float, float] | None
    pct_correction: float
    note: str


def net_cdr(treatment: ProjectStats, control: ProjectStats) -> NetCDRResult:
    if treatment.mean is None or control.mean is None:
        raise ValueError("Both treatment and control must have a computed mean")

    gross = treatment.mean
    counterfactual = control.mean
    net = gross - counterfactual
    pct_correction = (counterfactual / gross) * 100 if gross else float("nan")

    net_se = None
    net_ci = None
    note = ""

    if treatment.std is not None and control.std is not None:
        se_treat = treatment.std / (treatment.n_valid ** 0.5)
        se_ctrl = control.std / (control.n_valid ** 0.5)
        net_se = (se_treat ** 2 + se_ctrl ** 2) ** 0.5

        # Conservative choice: use the SMALLER of the two df (i.e. the
        # larger, more cautious t-multiplier) rather than attempting a full
        # Welch-Satterthwaite df estimate, which is overkill at N=2 and N=2.
        df = min(treatment.n_valid - 1, control.n_valid - 1)
        if df >= 1:
            t_mult = sp_stats.t.ppf(0.975, df=df)
            margin = t_mult * net_se
            net_ci = (net - margin, net + margin)
            note = (f"CI uses conservative df={df} (min of the two groups' df). "
                    f"Inherits uncertainty from BOTH treatment and control - "
                    f"expect this to be even wider than either input CI alone.")
        else:
            note = "insufficient df in one or both groups for a net CI"
    else:
        note = "std dev unavailable for treatment or control - cannot propagate uncertainty"

    return NetCDRResult(gross, counterfactual, net, net_se, net_ci, pct_correction, note)
