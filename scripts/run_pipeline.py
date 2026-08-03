"""Part 2: full CDR pipeline - pairing, validation, stats, counterfactual, significance."""
from erw.core.io import load_samples, load_lab_results, join
from erw.core.pairing import pair_plot_type
from erw.core.validation import validate_all_pairs
from erw.core.stats import compute_pair_cdrs, project_statistics
from erw.extensions.counterfactual import net_cdr
from erw.extensions.significance import (
    welch_t_treatment_vs_control, mann_whitney_treatment_vs_control,
    minimum_detectable_effect, pooled_std,
)

samples = load_samples("data/raw/samples.csv")
lab = load_lab_results("data/raw/lab_results.csv")
joined = join(samples, lab)
has_lab_data = joined[joined["_merge"] == "both"]["sample_id"]
usable_samples = samples[samples["sample_id"].isin(has_lab_data)]


def run_block(plot_type):
    print(f"\n=== {plot_type.upper()} ===")
    pairs = pair_plot_type(usable_samples, plot_type)
    validations = validate_all_pairs(pairs, joined)
    for v in validations:
        status = "VALID" if v.valid else "REJECTED"
        print(f"{v.monitoring_id:14s} <-> {v.baseline_id:14s}  {status}")
        for r in v.reasons:
            print(f"    - {r}")
    cdrs = compute_pair_cdrs(validations, joined)
    stats = project_statistics(cdrs, len(pairs))
    if stats.mean is not None:
        print(f"\n  Valid pairs: {stats.n_valid}/{stats.n_attempted}  Mean: {stats.mean:.2f} t/ha")
    else:
        print("  No valid pairs")
    if stats.ci_95:
        print(f"  95% CI: [{stats.ci_95[0]:.2f}, {stats.ci_95[1]:.2f}]  ({stats.ci_note})")
    return stats, [c.total_t_per_ha for c in cdrs]


treatment_stats, treatment_values = run_block("treatment")
control_stats, control_values = run_block("control")

print("\n=== COUNTERFACTUAL SUBTRACTION ===")
result = net_cdr(treatment_stats, control_stats)
print(f"Net CDR: {result.net_cdr:.2f} t/ha ({result.pct_correction:.1f}% correction)")
if result.net_ci_95:
    print(f"Net 95% CI: [{result.net_ci_95[0]:.2f}, {result.net_ci_95[1]:.2f}]")

print("\n=== SIGNIFICANCE + MDE ===")
welch = welch_t_treatment_vs_control(treatment_values, control_values)
print(f"Welch's t-test: p={welch.p_value:.4f}  significant={welch.significant_at_05}")
n = len(treatment_values)
mean_t = sum(treatment_values) / n
std_t = (sum((x - mean_t)**2 for x in treatment_values) / (n - 1)) ** 0.5
mean_c = sum(control_values) / len(control_values)
std_c = (sum((x - mean_c)**2 for x in control_values) / (len(control_values) - 1)) ** 0.5
combined_std = pooled_std(std_t, n, std_c, len(control_values))
mde = minimum_detectable_effect(combined_std, n)
print(f"Minimum detectable effect: {mde:.2f} t/ha")
