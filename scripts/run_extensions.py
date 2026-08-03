"""Geochemistry, forensics, and multiverse extensions."""
from erw.core.io import load_samples, load_lab_results, join
from erw.core.pairing import pair_plot_type
from erw.core.validation import validate_all_pairs
from erw.extensions.stoichiometry import si_closure_for_pair
from erw.extensions.forensics import compare_bl006_to_2024_batch
from erw.extensions.multiverse import run_all_specifications
from erw.extensions.plausibility import implied_application_rate, rajmahal_tizr_comparison
from erw.extensions.literature_checks import steinour_equivalence

samples = load_samples("data/raw/samples.csv")
lab = load_lab_results("data/raw/lab_results.csv")
joined = join(samples, lab)
joined_by_id = joined.set_index("sample_id")
has_lab_data = joined[joined["_merge"] == "both"]["sample_id"]
usable_samples = samples[samples["sample_id"].isin(has_lab_data)]

print("=== Si STOICHIOMETRIC CLOSURE ===")
pairs = pair_plot_type(usable_samples, "treatment")
validations = validate_all_pairs(pairs, joined)
for v in validations:
    if not v.valid:
        continue
    mon, bl = joined_by_id.loc[v.monitoring_id], joined_by_id.loc[v.baseline_id]
    r = si_closure_for_pair(f"{v.monitoring_id}<->{v.baseline_id}",
                              ca_bl=bl["Ca_ppm"], ca_mon=mon["Ca_ppm"], mg_bl=bl["Mg_ppm"],
                              mg_mon=mon["Mg_ppm"], si_bl=bl["Si_ppm"], si_mon=mon["Si_ppm"],
                              ti_bl=bl["Ti_ppm"], ti_mon=mon["Ti_ppm"])
    print(f"{r.pair_id}: {r.note}")

print("\n=== LAB-BATCH FORENSICS ===")
for r in compare_bl006_to_2024_batch(joined):
    print(f"{r.element}: 2024-batch mean={r.batch_2024_mean:.1f}  BL-006={r.bl006_value:.1f}  dev={r.pct_deviation:+.2f}%")

print("\n=== MULTIVERSE ===")
specs = run_all_specifications(samples, joined)
means = [s.mean_cdr for s in specs if s.mean_cdr is not None]
print(f"{len(means)} valid specs, range [{min(means):.2f}, {max(means):.2f}]")

print("\n=== EXTERNAL PLAUSIBILITY ===")
feed = implied_application_rate(57.39)
print(feed.note)
clean = lab[lab["status"] == "complete"]
ratios = (clean["Ti_ppm"] / clean["Zr_ppm"]).tolist()
tizr = rajmahal_tizr_comparison(ratios)
print(tizr.note)

print("\n=== STEINOUR LITERATURE CHECK ===")
s = steinour_equivalence(5467.4, 2928.1)
print(s.note)
