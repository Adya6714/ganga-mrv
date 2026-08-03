"""
Pure CDR math. No file I/O, no global state - every function takes plain
numbers in and returns plain numbers out. This is deliberate: it's what lets
Monte Carlo sensitivity, bootstrap, and the digital-twin validator all reuse
this exact code path with zero duplication.
"""
from dataclasses import dataclass
from . import config as cfg


@dataclass
class ElementCDR:
    element: str
    delta_ppm: float   # tracer-normalized change in concentration
    cdr_mol_equiv: float  # (delta_ppm / molar_mass) * 2, before final unit conversion


def enrichment_ratio(mobile_bl: float, mobile_mon: float, tracer_bl: float, tracer_mon: float) -> float:
    """Step 1: (mobile_mon/tracer_mon) - (mobile_bl/tracer_bl).
    Dimensionless. Positive means the mobile element grew relative to the
    stable tracer -> real enrichment, not just a bigger scoop of dirt."""
    return (mobile_mon / tracer_mon) - (mobile_bl / tracer_bl)


def normalize_to_ppm(ratio: float, tracer_mon: float) -> float:
    """Step 2: convert the dimensionless ratio back into a ppm quantity,
    anchored to the monitoring sample's own tracer value."""
    return ratio * tracer_mon


def element_cdr(element: str, mobile_bl: float, mobile_mon: float,
                 tracer_bl: float, tracer_mon: float, molar_mass: float) -> ElementCDR:
    ratio = enrichment_ratio(mobile_bl, mobile_mon, tracer_bl, tracer_mon)
    delta_ppm = normalize_to_ppm(ratio, tracer_mon)
    cdr_mol_equiv = (delta_ppm / molar_mass) * cfg.CO2_PER_CATION_MOL
    return ElementCDR(element, delta_ppm, cdr_mol_equiv)


def pair_cdr_t_per_ha(
    ca_bl: float, ca_mon: float,
    mg_bl: float, mg_mon: float,
    ti_bl: float, ti_mon: float,
    soil_mass_t_per_ha: float = cfg.SOIL_MASS_T_PER_HA,
) -> tuple[float, ElementCDR, ElementCDR]:
    """Full Steps 1-4 for one baseline/monitoring pair. Returns
    (total CDR in t CO2/ha, per-element breakdown for Ca, per-element breakdown for Mg)."""
    ca = element_cdr("Ca", ca_bl, ca_mon, ti_bl, ti_mon, cfg.MOLAR_MASS_CA)
    mg = element_cdr("Mg", mg_bl, mg_mon, ti_bl, ti_mon, cfg.MOLAR_MASS_MG)
    total_mol_equiv = ca.cdr_mol_equiv + mg.cdr_mol_equiv
    total_t_per_ha = total_mol_equiv * cfg.MOLAR_MASS_CO2 * soil_mass_t_per_ha / 1e6
    return total_t_per_ha, ca, mg
