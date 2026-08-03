"""
Combined geo + geochemical distance metric - blends GPS distance with
tracer (Ti, Zr) similarity, instead of pairing on GPS alone.
"""
from dataclasses import dataclass
from ..core.geo import haversine_m


@dataclass
class CombinedDistanceScore:
    monitoring_id: str
    baseline_id: str
    geo_dist_m: float
    ti_deviation: float
    combined_score: float


def combined_score(mon_id: str, mon_coord: tuple, mon_ti: float, mon_zr: float,
                    bl_id: str, bl_coord: tuple, bl_ti: float, bl_zr: float,
                    geo_weight: float = 0.7, chem_weight: float = 0.3,
                    geo_norm_m: float = 500, chem_norm_pct: float = 0.20) -> CombinedDistanceScore:
    """Lower score = better match. geo_norm_m/chem_norm_pct normalize each
    component to a comparable ~0-1+ scale before weighting (geo by the
    500m pairing threshold, chem by the 20% Ti-deviation threshold)."""
    geo_dist = haversine_m(*mon_coord, *bl_coord)
    ti_dev = abs(mon_ti - bl_ti) / bl_ti
    zr_dev = abs(mon_zr - bl_zr) / bl_zr
    geo_component = geo_dist / geo_norm_m
    chem_component = ((ti_dev + zr_dev) / 2) / chem_norm_pct
    score = geo_weight * geo_component + chem_weight * chem_component
    return CombinedDistanceScore(mon_id, bl_id, geo_dist, ti_dev, score)
