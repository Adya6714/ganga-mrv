"""
Gaussian Process (kriging) interpolation of the baseline concentration
field - the geospatial-ML generalization of nearest-neighbor pairing.

Instead of matching each monitoring sample to its single nearest baseline,
a GP models the baseline field as a spatially-correlated surface and
predicts an EXPECTED baseline value, WITH UNCERTAINTY, at any location -
using all nearby baselines weighted by spatial covariance, not just the
closest one.

HONEST LIMITATION, stated upfront: this project has only 2 clean treatment
baselines (BL-001, BL-002) and 2 clean control baselines (BL-003, BL-004).
A GP's length scale (how fast spatial correlation decays with distance)
is fundamentally UNDERDETERMINED with only 2 points - there's no way to
distinguish "short-range sharp correlation" from "long-range smooth
correlation" from two dots. This module demonstrates BOTH failure modes
deliberately:
  1. fit_with_stated_length_scale(): assumes a plausible length scale
     (not fit from data) and shows sensible, spatially-differentiated
     predictions.
  2. fit_with_estimated_length_scale(): lets sklearn's optimizer fit the
     length scale from the 2 available points, and shows it COLLAPSE to
     near-zero - at which point the GP predicts the SAME value everywhere,
     regardless of query location, degenerating to a plain average. This
     is a real, well-documented GP failure mode at small N, and is
     reported here as a deliberate finding, not a bug.
This is exactly why the original roadmap tagged kriging as [GEN] - needs
synthetic/generated data with more points for a meaningful production fit.
"""
from dataclasses import dataclass
import numpy as np
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, WhiteKernel


@dataclass
class GPPrediction:
    query_id: str
    predicted_mean: float
    predicted_std: float


def fit_with_stated_length_scale(baseline_coords, baseline_values,
                                  query_coords, query_ids,
                                  length_scale_deg: float = 0.0005) -> list[GPPrediction]:
    """length_scale_deg=0.0005 is roughly ~50m at this latitude - a stated,
    PLAUSIBLE assumption for within-field spatial correlation in a single
    rice paddy, NOT fit from data (2 points cannot support fitting)."""
    kernel = RBF(length_scale=length_scale_deg, length_scale_bounds="fixed") + WhiteKernel(noise_level=1.0)
    gp = GaussianProcessRegressor(kernel=kernel, normalize_y=True)
    gp.fit(np.array(baseline_coords), np.array(baseline_values))
    means, stds = gp.predict(np.array(query_coords), return_std=True)
    return [GPPrediction(qid, m, s) for qid, m, s in zip(query_ids, means, stds)]


def fit_with_estimated_length_scale(baseline_coords, baseline_values,
                                     query_coords, query_ids) -> tuple[list[GPPrediction], str]:
    """Lets the optimizer estimate the length scale from data. At N=2 this
    is expected to be unstable - returns the predictions AND a description
    of what the fitted kernel actually looks like, so the instability is
    visible, not hidden."""
    kernel = RBF(length_scale=0.001, length_scale_bounds=(1e-6, 1.0)) + \
             WhiteKernel(noise_level=1.0, noise_level_bounds=(1e-5, 1e5))
    gp = GaussianProcessRegressor(kernel=kernel, normalize_y=True, n_restarts_optimizer=5)
    gp.fit(np.array(baseline_coords), np.array(baseline_values))
    means, stds = gp.predict(np.array(query_coords), return_std=True)
    fitted_kernel_desc = str(gp.kernel_)
    return [GPPrediction(qid, m, s) for qid, m, s in zip(query_ids, means, stds)], fitted_kernel_desc
