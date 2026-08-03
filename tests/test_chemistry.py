"""
Basic tests for the CDR formula. Run with: pytest tests/
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from erw.core.chemistry import pair_cdr_t_per_ha


def test_matches_hand_calculation():
    """BL-002 <-> MON-001, hand-verified to 58.78 t CO2/ha."""
    total, ca, mg = pair_cdr_t_per_ha(
        ca_bl=16520, ca_mon=22340,
        mg_bl=5710, mg_mon=8760,
        ti_bl=3045, ti_mon=3110,
    )
    assert round(total, 2) == 58.78


def test_zero_ti_drift_collapses_to_naive_difference():
    """If Ti is perfectly stable (Ti_bl == Ti_mon), the tracer-normalized
    delta_ppm should algebraically equal the naive Ca_mon - Ca_bl difference.
    This is the identity from Part C.5 of the assignment brief."""
    total, ca, mg = pair_cdr_t_per_ha(
        ca_bl=16520, ca_mon=22340,
        mg_bl=5710, mg_mon=8760,
        ti_bl=3000, ti_mon=3000,
    )
    assert round(ca.delta_ppm, 6) == round(22340 - 16520, 6)
    assert round(mg.delta_ppm, 6) == round(8760 - 5710, 6)


def test_no_enrichment_gives_zero_cdr():
    """Identical baseline and monitoring values (including Ti) -> zero CDR."""
    total, ca, mg = pair_cdr_t_per_ha(
        ca_bl=16780, ca_mon=16780,
        mg_bl=5890, mg_mon=5890,
        ti_bl=3102, ti_mon=3102,
    )
    assert round(total, 6) == 0.0
