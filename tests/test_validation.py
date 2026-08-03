"""
Regression tests for validation.py's four gates.
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

import pandas as pd
from erw.core.validation import validate_pair


def make_row(ti, ca=16000, mg=5000, status="complete", date="2024-10-12"):
    return pd.Series({"Ti_ppm": ti, "Ca_ppm": ca, "Mg_ppm": mg,
                       "status": status, "date": pd.Timestamp(date)})


def test_clean_pair_passes():
    bl = make_row(ti=3000)
    mon = make_row(ti=3050)  # 1.7% drift, well under 20%
    result = validate_pair("MON-X", "BL-X", mon, bl)
    assert result.valid


def test_late_baseline_rejected():
    bl = make_row(ti=3000, date="2025-05-24")  # after application date
    mon = make_row(ti=3050)
    result = validate_pair("MON-X", "BL-X", mon, bl)
    assert not result.valid
    assert any("after application date" in r for r in result.reasons)


def test_ti_deviation_over_threshold_rejected():
    bl = make_row(ti=3000)
    mon = make_row(ti=4000)  # 33% drift, over 20%
    result = validate_pair("MON-X", "BL-X", mon, bl)
    assert not result.valid
    assert any("Ti deviates" in r for r in result.reasons)


def test_flagged_lab_status_rejected():
    bl = make_row(ti=3000, status="flagged")
    mon = make_row(ti=3050)
    result = validate_pair("MON-X", "BL-X", mon, bl)
    assert not result.valid
    assert any("flagged" in r for r in result.reasons)


def test_multiple_failures_all_reported():
    """A pair failing on multiple grounds should report ALL of them, not
    just the first - same principle as MON-003 failing 3 independent
    checks in the real dataset."""
    bl = make_row(ti=3000, status="flagged", date="2025-05-24")
    mon = make_row(ti=4500, status="flagged")
    result = validate_pair("MON-X", "BL-X", mon, bl)
    assert not result.valid
    assert len(result.reasons) >= 3
