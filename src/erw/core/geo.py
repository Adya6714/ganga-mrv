"""
Geographic distance calculations.

Why Haversine and not simple Euclidean on (lat, lon)?
A degree of longitude is ~111km at the equator but shrinks toward the poles
(it's 111km * cos(latitude)). At West Bengal's latitude (~23.5N), 1 degree of
longitude ≈ 102km. Treating (lat, lon) as flat x/y coordinates would distort
every distance calculation. Haversine accounts for the sphere properly and
costs nothing extra to compute.
"""
import math

EARTH_RADIUS_M = 6_371_000.0


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two lat/lon points, in meters."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    return 2 * EARTH_RADIUS_M * math.asin(math.sqrt(a))


def is_zero_gps(lat: float, lon: float) -> bool:
    """(0,0) is 'Null Island' in the Gulf of Guinea - always a sentinel for
    missing GPS, never a real field sample in India."""
    return lat == 0.0 and lon == 0.0
