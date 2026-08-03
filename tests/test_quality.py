"""
Regression test locking in the exact 8 issues found on the real dataset -
if this ever produces a different count or a different set of categories,
something changed (either a real bug, or the dataset itself changed).
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from erw.core.io import load_samples, load_lab_results, join
from erw.core.quality import run_all_checks

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")


def test_all_eight_issues_found_no_false_flags():
    samples = load_samples(os.path.join(DATA_DIR, "samples.csv"))
    lab = load_lab_results(os.path.join(DATA_DIR, "lab_results.csv"))
    joined = join(samples, lab)
    issues = run_all_checks(samples, joined)

    assert len(issues) == 8

    categories = {i.category for i in issues}
    assert categories == {
        "missing_gps", "missing_barcode", "missing_collector",
        "orphan_lab_result", "late_baseline", "spatial_outlier",
        "tracer_instability", "lab_flagged",
    }

    # explicit false-flag guards
    ids_with_late_baseline = {i.id for i in issues if i.category == "late_baseline"}
    assert "GNG-BL-005" not in ids_with_late_baseline  # date is BEFORE application

    control_ids = {"GNG-BL-003", "GNG-BL-004", "GNG-MON-005", "GNG-MON-006"}
    ids_flagged = {i.id for i in issues}
    assert not (control_ids & ids_flagged)  # control samples should never be flagged
