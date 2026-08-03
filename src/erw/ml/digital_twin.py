"""
Digital-twin pipeline validator: generate synthetic deployments from a
KNOWN true CDR, with GP-based spatial correlation (not i.i.d. noise), run
the REAL pipeline (pairing.py, chemistry.py) against the resulting noisy
data, and check whether the reported 95% CI actually contains the truth
at close to the nominal 95% rate across many independent trials. This is
the strongest available evidence the pipeline is CORRECT, not just
executable - it validates the uncertainty quantification itself, which
no amount of testing on the real 12-row dataset (with its unknown true
CDR) could ever directly confirm.
"""
import numpy as np
import pandas as pd
from scipy import stats as sp_stats
from ..core.chemistry import pair_cdr_t_per_ha
from ..core.pairing import pair_plot_type


def _gp_field(coords_m, mean, sill, length_scale, nugget, rng):
    """Draw a spatially-correlated field via GP prior (RBF covariance) -
    nearby anchor points get correlated true values, not independent noise."""
    dists = np.linalg.norm(coords_m[:, None, :] - coords_m[None, :, :], axis=-1)
    cov = sill * np.exp(-(dists**2) / (2 * length_scale**2)) + nugget * np.eye(len(coords_m))
    return rng.multivariate_normal(np.full(len(coords_m), mean), cov)


def _local_to_latlon(x_m, y_m, center_lat=23.4550, center_lon=87.3250):
    lat = center_lat + y_m / 111320
    lon = center_lon + x_m / (111320 * np.cos(np.radians(center_lat)))
    return lat, lon


def simulate_one_deployment(n_pairs: int, true_cdr: float, seed: int,
                             measurement_noise: float = 0.03):
    """Returns (reported_mean, ci_95) from running the REAL pipeline
    against synthetic data with a known true_cdr, or None if too few
    pairs survive to compute a CI."""
    rng = np.random.default_rng(seed)
    anchors_m = rng.uniform(-100, 100, size=(n_pairs, 2))

    true_ti = _gp_field(anchors_m, 3100, 2500, 80, 100, rng)
    true_ca_bl = _gp_field(anchors_m, 16650, 40000, 80, 2500, rng)
    true_mg_bl = _gp_field(anchors_m, 5800, 8000, 80, 800, rng)

    soil_mass = 2600.0
    total_mol_equiv = true_cdr * 1e6 / (44.01 * soil_mass)
    delta_ca_ppm = 0.53 * total_mol_equiv * 40.08 / 2  # 53/47 Ca/Mg split, matching observed charge balance
    delta_mg_ppm = 0.47 * total_mol_equiv * 24.31 / 2
    true_ca_mon = true_ca_bl + delta_ca_ppm
    true_mg_mon = true_mg_bl + delta_mg_ppm

    meas_ti_bl = true_ti * (1 + rng.normal(0, measurement_noise, n_pairs))
    meas_ti_mon = true_ti * (1 + rng.normal(0, measurement_noise, n_pairs))
    meas_ca_bl = true_ca_bl * (1 + rng.normal(0, measurement_noise, n_pairs))
    meas_ca_mon = true_ca_mon * (1 + rng.normal(0, measurement_noise, n_pairs))
    meas_mg_bl = true_mg_bl * (1 + rng.normal(0, measurement_noise, n_pairs))
    meas_mg_mon = true_mg_mon * (1 + rng.normal(0, measurement_noise, n_pairs))

    rows, lab = [], {}
    for i in range(n_pairs):
        bl_lat, bl_lon = _local_to_latlon(*anchors_m[i])
        mon_lat, mon_lon = _local_to_latlon(*(anchors_m[i] + rng.uniform(-15, 15, size=2)))
        bl_id, mon_id = f"SIM-BL-{i}", f"SIM-MON-{i}"
        rows.append({"sample_id": bl_id, "type": "baseline", "lat": bl_lat, "lon": bl_lon, "plot_type": "treatment"})
        rows.append({"sample_id": mon_id, "type": "monitoring", "lat": mon_lat, "lon": mon_lon, "plot_type": "treatment"})
        lab[bl_id] = (meas_ti_bl[i], meas_ca_bl[i], meas_mg_bl[i])
        lab[mon_id] = (meas_ti_mon[i], meas_ca_mon[i], meas_mg_mon[i])

    samples = pd.DataFrame(rows)
    pairs = pair_plot_type(samples, "treatment")  # REAL pairing code, not a stub

    cdrs = []
    for p in pairs:
        if not p.paired:
            continue
        ti_bl, ca_bl, mg_bl = lab[p.baseline_id]
        ti_mon, ca_mon, mg_mon = lab[p.monitoring_id]
        total, _, _ = pair_cdr_t_per_ha(ca_bl=ca_bl, ca_mon=ca_mon, mg_bl=mg_bl,
                                          mg_mon=mg_mon, ti_bl=ti_bl, ti_mon=ti_mon)
        cdrs.append(total)

    if len(cdrs) < 2:
        return None
    mean, std = float(np.mean(cdrs)), float(np.std(cdrs, ddof=1))
    se = std / len(cdrs)**0.5
    t_mult = sp_stats.t.ppf(0.975, df=len(cdrs)-1)
    return mean, (mean - t_mult*se, mean + t_mult*se)


def coverage_validation(n_pairs: int, true_cdr: float, n_trials: int = 300) -> dict:
    """The core validation: across n_trials independent synthetic
    deployments, what fraction of reported 95% CIs actually contain the
    known true_cdr? Should land close to 95% if the pipeline's
    uncertainty quantification is correctly calibrated."""
    hits, valid = 0, 0
    for seed in range(n_trials):
        result = simulate_one_deployment(n_pairs, true_cdr, seed)
        if result is None:
            continue
        valid += 1
        _, ci = result
        if ci[0] <= true_cdr <= ci[1]:
            hits += 1
    return {"n_pairs": n_pairs, "hits": hits, "valid_trials": valid,
            "coverage_pct": 100 * hits / valid if valid else None}
