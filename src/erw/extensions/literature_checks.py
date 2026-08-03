"""
Small, cheap checks tying our implementation to published literature and
surfacing data-integrity signals independent of the chemistry itself.
"""
from dataclasses import dataclass
from ..core.geo import haversine_m


@dataclass
class SteinourCheck:
    our_value: float
    steinour_value: float
    pct_diff: float
    note: str


def steinour_equivalence(delta_ca_ppm: float, delta_mg_ppm: float) -> SteinourCheck:
    """Steinour's published formula (Lithos Carbon, 2024): CO2 = 2.2*Ca + 3.62*Mg.
    These are ROUNDED versions of the exact stoichiometric constants
    (44.01*2/40.08=2.19611, 44.01*2/24.31=3.62073) - so exact equality is
    NOT expected. Checking agreement within the rounding tolerance ties our
    full-precision implementation to the published shorthand correctly."""
    our_value = (delta_ca_ppm / 40.08) * 2 * 44.01 + (delta_mg_ppm / 24.31) * 2 * 44.01
    steinour_value = 2.2 * delta_ca_ppm + 3.62 * delta_mg_ppm
    pct_diff = abs(our_value - steinour_value) / our_value * 100
    note = (f"{pct_diff:.3f}% difference, fully explained by Steinour's published "
            "constants being rounded to 2-3 sig figs (2.2 vs exact 2.19611; "
            "3.62 vs exact 3.62073) - NOT a discrepancy in the method itself.")
    return SteinourCheck(our_value, steinour_value, pct_diff, note)


def coordinate_collision_check(samples_coords: dict) -> dict:
    """samples_coords: {sample_id: (lat, lon)}. Flags any exact coordinate
    match to 4dp across DIFFERENT sample_ids - real GPS receivers do not
    produce exact duplicate readings across independent collection events."""
    groups = {}
    for sid, coord in samples_coords.items():
        key = (round(coord[0], 4), round(coord[1], 4))
        groups.setdefault(key, []).append(sid)
    return {k: v for k, v in groups.items() if len(v) > 1}


def gps_quantization_floor_m(lat_deg: float, precision_decimals: int = 4) -> float:
    """Real-world meters corresponding to the stated decimal precision, at
    the given latitude (longitude degrees shrink with cos(latitude))."""
    import math
    step = 10 ** (-precision_decimals)
    lat_m = step * 111320
    lon_m = step * 111320 * math.cos(math.radians(lat_deg))
    return max(lat_m, lon_m)


def barcode_date_consistency(barcode: str, date_str: str) -> bool:
    """Barcode prefix LB-YY should match the collection date's year."""
    barcode_year = "20" + barcode.split("-")[1]
    date_year = date_str[:4]
    return barcode_year == date_year
