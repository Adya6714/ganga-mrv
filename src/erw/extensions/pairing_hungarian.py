
"""
Hungarian (optimal) 1:1 assignment - minimizes TOTAL distance across all
pairs simultaneously, vs. pairing.py's greedy (locally-optimal, one pair
at a time) approach. See DECISIONS.md for when these genuinely differ.
"""
from dataclasses import dataclass
import numpy as np
from scipy.optimize import linear_sum_assignment
from ..core.geo import haversine_m


@dataclass
class HungarianPairResult:
    monitoring_id: str
    baseline_id: str
    distance_m: float


def hungarian_pairing(monitoring_coords: dict, baseline_coords: dict) -> list[HungarianPairResult]:
    """monitoring_coords/baseline_coords: {sample_id: (lat, lon)}."""
    mon_ids, bl_ids = list(monitoring_coords), list(baseline_coords)
    cost = np.zeros((len(mon_ids), len(bl_ids)))
    for i, m in enumerate(mon_ids):
        for j, b in enumerate(bl_ids):
            cost[i, j] = haversine_m(*monitoring_coords[m], *baseline_coords[b])

    row_ind, col_ind = linear_sum_assignment(cost)
    return [HungarianPairResult(mon_ids[r], bl_ids[c], cost[r, c]) for r, c in zip(row_ind, col_ind)]
