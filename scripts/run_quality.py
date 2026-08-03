"""Part 1: data quality report."""
from erw.core.io import load_samples, load_lab_results, join
from erw.core.quality import run_all_checks

samples = load_samples("data/raw/samples.csv")
lab = load_lab_results("data/raw/lab_results.csv")
joined = join(samples, lab)

issues = run_all_checks(samples, joined)
print(f"Total issues found: {len(issues)}\n")
for i in issues:
    print(f"ISSUE {i.id:14s} {i.category:20s} {i.message}")
