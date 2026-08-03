"""
Property-based tests using hypothesis: instead of fixed example numbers,
these state a general rule and let hypothesis generate hundreds of random
inputs trying to break it. Complements test_chemistry.py's fixed-example
regression tests with genuinely different coverage.
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from hypothesis import given, strategies as st, assume
from erw.core.chemistry import pair_cdr_t_per_ha

positive_ppm = st.floats(min_value=100, max_value=100000, allow_nan=False, allow_infinity=False)


@given(ca_bl=positive_ppm, ca_mon=positive_ppm, mg_bl=positive_ppm, mg_mon=positive_ppm,
       ti_bl=positive_ppm, ti_mon=positive_ppm, k=st.floats(min_value=0.1, max_value=10))
def test_uniform_scaling_scales_result(ca_bl, ca_mon, mg_bl, mg_mon, ti_bl, ti_mon, k):
    """If every input is scaled by the same factor k, the result should
    scale by exactly k too (the k cancels inside the Ti-normalization
    ratio, then reappears linearly in the final unit conversion)."""
    total1, _, _ = pair_cdr_t_per_ha(ca_bl=ca_bl, ca_mon=ca_mon, mg_bl=mg_bl,
                                       mg_mon=mg_mon, ti_bl=ti_bl, ti_mon=ti_mon)
    total2, _, _ = pair_cdr_t_per_ha(ca_bl=ca_bl*k, ca_mon=ca_mon*k, mg_bl=mg_bl*k,
                                       mg_mon=mg_mon*k, ti_bl=ti_bl*k, ti_mon=ti_mon*k)
    assert abs(total2 - total1 * k) < 1e-6 * max(abs(total1 * k), 1)


@given(ca_bl=positive_ppm, ca_mon=positive_ppm, mg_bl=positive_ppm, mg_mon=positive_ppm,
       ti_val=positive_ppm)
def test_zero_ti_drift_collapses_to_naive_difference_general(ca_bl, ca_mon, mg_bl, mg_mon, ti_val):
    """Generalizes the fixed-number identity test: for ANY Ca/Mg values,
    if Ti is unchanged (ti_bl == ti_mon), delta collapses to the naive
    difference. This is the core algebraic proof from Part C.5, now
    checked against hundreds of random inputs, not just one example."""
    _, ca, mg = pair_cdr_t_per_ha(ca_bl=ca_bl, ca_mon=ca_mon, mg_bl=mg_bl,
                                    mg_mon=mg_mon, ti_bl=ti_val, ti_mon=ti_val)
    assert abs(ca.delta_ppm - (ca_mon - ca_bl)) < 1e-6 * max(abs(ca_mon), 1)
    assert abs(mg.delta_ppm - (mg_mon - mg_bl)) < 1e-6 * max(abs(mg_mon), 1)


@given(ca_bl=positive_ppm, ca_mon_low=positive_ppm, delta=st.floats(min_value=1, max_value=10000),
       mg_bl=positive_ppm, mg_mon=positive_ppm, ti_bl=positive_ppm, ti_mon=positive_ppm)
def test_monotonic_in_ca_mon(ca_bl, ca_mon_low, delta, mg_bl, mg_mon, ti_bl, ti_mon):
    """Increasing Ca_mon (holding everything else fixed) should never
    DECREASE the total CDR - more measured enrichment should never
    produce a smaller reported removal."""
    ca_mon_high = ca_mon_low + delta
    total_low, _, _ = pair_cdr_t_per_ha(ca_bl=ca_bl, ca_mon=ca_mon_low, mg_bl=mg_bl,
                                          mg_mon=mg_mon, ti_bl=ti_bl, ti_mon=ti_mon)
    total_high, _, _ = pair_cdr_t_per_ha(ca_bl=ca_bl, ca_mon=ca_mon_high, mg_bl=mg_bl,
                                           mg_mon=mg_mon, ti_bl=ti_bl, ti_mon=ti_mon)
    assert total_high >= total_low - 1e-9
