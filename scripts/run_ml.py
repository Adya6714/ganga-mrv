"""ML/geospatial role-fit extensions: GP kriging + Isolation Forest."""
import numpy as np
from erw.core.io import load_samples, load_lab_results, join
from erw.ml.geospatial_ml import fit_with_stated_length_scale
from erw.ml.anomaly_detection import seed_stability_sweep

samples = load_samples("data/raw/samples.csv")
lab = load_lab_results("data/raw/lab_results.csv")
joined = join(samples, lab)
joined_by_id = joined.set_index("sample_id")

print("=== GP BASELINE INTERPOLATION ===")
baseline_ids = ["GNG-BL-001", "GNG-BL-002"]
baseline_coords = [(joined_by_id.loc[i, "lat"], joined_by_id.loc[i, "lon"]) for i in baseline_ids]
baseline_ca = [joined_by_id.loc[i, "Ca_ppm"] for i in baseline_ids]
query_ids = ["GNG-MON-001", "GNG-MON-002"]
query_coords = [(joined_by_id.loc[i, "lat"], joined_by_id.loc[i, "lon"]) for i in query_ids]

for p in fit_with_stated_length_scale(baseline_coords, baseline_ca, query_coords, query_ids):
    print(f"{p.query_id}: {p.predicted_mean:.1f} +/- {p.predicted_std:.1f} ppm (stated length scale)")

print("\n=== ISOLATION FOREST ===")
treat_ids = ["GNG-BL-001", "GNG-BL-002", "GNG-BL-005", "GNG-MON-001", "GNG-MON-002", "GNG-MON-003", "GNG-BL-006"]
ti_vals = np.array([[joined_by_id.loc[i, "Ti_ppm"]] for i in treat_ids])
result = seed_stability_sweep(ti_vals, treat_ids, contamination=1/7)
for flagged, n in result.flagged_sets.items():
    print(f"contamination=1/7: {n}/{result.n_seeds} seeds -> {list(flagged) or 'none'}")
