"""
Monte Carlo and local-gradient sensitivity analysis on the CDR formula.
Empirically answers the Part C.5 "denominator problem" question: does
noise on Ti (the normalizing tracer) get amplified more than noise on
the mobile elements it's meant to stabilize?
"""
from dataclasses import dataclass
import numpy as np
from ..core.chemistry import pair_cdr_t_per_ha
from ..core import config as cfg


@dataclass
class MonteCarloResult:
    central_value: float
    mc_mean: float
    mc_std: float
    relative_uncertainty_pct: float
    ci_95: tuple[float, float]
    amplification_factor: float


def monte_carlo_sensitivity(base_inputs: dict, n_trials: int = 20000,
                             relative_noise: float = cfg.ICP_OES_RELATIVE_NOISE,
                             seed: int = 42) -> MonteCarloResult:
    """base_inputs: dict with keys ca_bl, ca_mon, mg_bl, mg_mon, ti_bl, ti_mon."""
    rng = np.random.default_rng(seed)
    central, _, _ = pair_cdr_t_per_ha(**base_inputs)

    results = []
    for _ in range(n_trials):
        perturbed = {k: v * (1 + rng.normal(0, relative_noise)) for k, v in base_inputs.items()}
        total, _, _ = pair_cdr_t_per_ha(**perturbed)
        results.append(total)
    arr = np.array(results)

    rel_uncertainty = arr.std() / arr.mean()
    return MonteCarloResult(
        central, float(arr.mean()), float(arr.std()), rel_uncertainty * 100,
        (float(np.percentile(arr, 2.5)), float(np.percentile(arr, 97.5))),
        rel_uncertainty / relative_noise,
    )


@dataclass
class GradientResult:
    input_name: str
    sensitivity_ratio: float  # % output change per 1% input change


def local_gradient_sensitivity(base_inputs: dict, perturbation_pct: float = 0.01) -> list[GradientResult]:
    """One-at-a-time finite-difference sensitivity - which single input
    moves the output most, cross-checked against the Monte Carlo result."""
    central, _, _ = pair_cdr_t_per_ha(**base_inputs)
    results = []
    for key in base_inputs:
        perturbed = dict(base_inputs)
        perturbed[key] = base_inputs[key] * (1 + perturbation_pct)
        total_pert, _, _ = pair_cdr_t_per_ha(**perturbed)
        pct_change = (total_pert - central) / central * 100
        ratio = pct_change / (perturbation_pct * 100)
        results.append(GradientResult(key, ratio))
    return results


def combined_uncertainty_with_soil_mass(chem_uncertainty_pct: float,
                                          soil_mass_uncertainty_pct: float = 12.5) -> float:
    """Combines chemistry-measurement uncertainty and soil-mass uncertainty
    in quadrature (assumes independence - reasonable, since ICP-OES noise
    and bulk-density variation are unrelated physical processes)."""
    return (chem_uncertainty_pct**2 + soil_mass_uncertainty_pct**2) ** 0.5


def materiality_check(combined_uncertainty_pct: float, threshold_pct: float = 5.0) -> bool:
    """Returns True if uncertainty EXCEEDS the protocol's materiality
    tolerance (per Isometric protocol research, session 1)."""
    return combined_uncertainty_pct > threshold_pct
