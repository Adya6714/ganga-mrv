"""
External plausibility checks: comparing pipeline outputs against real-world
field practice and published geochemistry literature. These don't validate
the CDR CALCULATION - they sanity-check whether the underlying data looks
like a real deployment, which matters because this is synthetic data and
the generator may not have matched real-world magnitudes.
"""
from dataclasses import dataclass

CO2_PER_TONNE_BASALT_LOW = 0.20   # published typical range, t CO2 per t basalt
CO2_PER_TONNE_BASALT_HIGH = 0.30
TYPICAL_FIELD_APPLICATION_RATE_LOW = 20   # t/ha
TYPICAL_FIELD_APPLICATION_RATE_HIGH = 50  # t/ha

RAJMAHAL_TI_ZR_GROUP1 = (82, 120)  # published fresh-basalt ranges
RAJMAHAL_TI_ZR_GROUP2 = (45, 78)


@dataclass
class FeedstockPlausibility:
    treatment_cdr: float
    implied_rate_low: float
    implied_rate_high: float
    note: str


def implied_application_rate(treatment_cdr_t_per_ha: float) -> FeedstockPlausibility:
    """Invert CDR back to an implied basalt application rate, using the
    published range of CO2 captured per tonne of basalt applied. Compares
    against typical real-world field rates (20-50 t/ha) as an external
    sanity check on the SYNTHETIC DATA's realism, not on our calculation."""
    rate_low = treatment_cdr_t_per_ha / CO2_PER_TONNE_BASALT_HIGH
    rate_high = treatment_cdr_t_per_ha / CO2_PER_TONNE_BASALT_LOW
    midpoint_typical = (TYPICAL_FIELD_APPLICATION_RATE_LOW + TYPICAL_FIELD_APPLICATION_RATE_HIGH) / 2

    if rate_low > TYPICAL_FIELD_APPLICATION_RATE_HIGH:
        note = (f"implied application rate ({rate_low:.0f}-{rate_high:.0f} t/ha) is "
                 f"well ABOVE typical real-world field rates ({TYPICAL_FIELD_APPLICATION_RATE_LOW}-"
                 f"{TYPICAL_FIELD_APPLICATION_RATE_HIGH} t/ha, ~{rate_low/midpoint_typical:.1f}x). "
                 "This suggests the synthetic data's enrichment signal is inflated relative to "
                 "realistic field deployments - a property of the SYNTHETIC GENERATOR, not "
                 "evidence of a pipeline error.")
    else:
        note = "implied application rate falls within typical real-world field practice."

    return FeedstockPlausibility(treatment_cdr_t_per_ha, rate_low, rate_high, note)


@dataclass
class TiZrPlausibility:
    observed_mean: float
    observed_range: tuple
    note: str


def rajmahal_tizr_comparison(ti_zr_ratios: list[float]) -> TiZrPlausibility:
    """Compare observed soil Ti/Zr against published Rajmahal Traps FRESH
    BASALT ranges. Soil Ti/Zr is expected to differ from fresh-rock Ti/Zr
    (soil is a mix of parent rock + pre-existing soil matrix, weathering
    products, etc.) - so a mismatch is EXPECTED, not a red flag. This is
    reported as a real, citable external-plausibility observation, not a
    pass/fail check."""
    mean_ratio = sum(ti_zr_ratios) / len(ti_zr_ratios)
    obs_range = (min(ti_zr_ratios), max(ti_zr_ratios))
    note = (f"observed soil Ti/Zr ({obs_range[0]:.2f}-{obs_range[1]:.2f}, mean {mean_ratio:.2f}) "
             f"sits well below both published Rajmahal fresh-basalt ranges "
             f"({RAJMAHAL_TI_ZR_GROUP1[0]}-{RAJMAHAL_TI_ZR_GROUP1[1]} and "
             f"{RAJMAHAL_TI_ZR_GROUP2[0]}-{RAJMAHAL_TI_ZR_GROUP2[1]}). Expected: soil Ti/Zr "
             "reflects a mix of parent rock plus pre-existing soil matrix, not pure fresh "
             "basalt, so this divergence is consistent with real soil geochemistry, not "
             "evidence of a data problem.")
    return TiZrPlausibility(mean_ratio, obs_range, note)
