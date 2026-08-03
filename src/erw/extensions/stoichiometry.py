"""
Si stoichiometric closure: an independent chemical plausibility check the
assignment's formula does not perform, using Si_ppm which is present in
lab_results.csv but unused by the required calculation.

Silicate minerals release Ca/Mg and Si together, in ratios fixed by the
mineral's chemical formula (not a free parameter):
  - Anorthite (basaltic plagioclase, CaAl2Si2O8): 1 mol Ca per 2 mol Si
  - Forsterite (olivine, Mg2SiO4):                2 mol Mg per 1 mol Si
A plausible whole-rock basaltic dissolution should therefore show
(Ca_mol + Mg_mol) / Si_mol somewhere in a range consistent with these
mineral ratios - very roughly 0.5-1.5 for typical basaltic mineral
assemblages, though this varies with feedstock composition, which we do
NOT know for this project. This is reported as a DIAGNOSTIC against a
stated, uncertain reference range, not a pass/fail verdict.

If the observed ratio is much HIGHER than silicate minerals would produce,
that points toward a non-silicate Ca/Mg source - most plausibly carbonate
dissolution (e.g. agricultural lime, or pre-existing pedogenic carbonate
in the soil), which releases Ca with ZERO accompanying Si. This matters
for CDR because carbonate-sourced Ca is chemically and durability-wise
different from silicate-sourced Ca.
"""
from dataclasses import dataclass
from ..core.chemistry import enrichment_ratio, normalize_to_ppm
from ..core import config as cfg

MOLAR_MASS_SI = 28.09  # g/mol


@dataclass
class StoichiometryResult:
    pair_id: str
    delta_ca_mol: float
    delta_mg_mol: float
    delta_si_mol: float
    ratio_ca_mg_over_si: float | None
    note: str


def si_closure_for_pair(pair_id: str, ca_bl: float, ca_mon: float,
                         mg_bl: float, mg_mon: float,
                         si_bl: float, si_mon: float,
                         ti_bl: float, ti_mon: float) -> StoichiometryResult:
    """Same Ti-normalization logic as the required CDR formula, applied to
    Si as well, so Ca/Mg/Si are all on the same tracer-corrected footing."""
    delta_ca_ppm = normalize_to_ppm(enrichment_ratio(ca_bl, ca_mon, ti_bl, ti_mon), ti_mon)
    delta_mg_ppm = normalize_to_ppm(enrichment_ratio(mg_bl, mg_mon, ti_bl, ti_mon), ti_mon)
    delta_si_ppm = normalize_to_ppm(enrichment_ratio(si_bl, si_mon, ti_bl, ti_mon), ti_mon)

    delta_ca_mol = delta_ca_ppm / cfg.MOLAR_MASS_CA
    delta_mg_mol = delta_mg_ppm / cfg.MOLAR_MASS_MG
    delta_si_mol = delta_si_ppm / MOLAR_MASS_SI

    if delta_si_mol <= 0:
        return StoichiometryResult(
            pair_id, delta_ca_mol, delta_mg_mol, delta_si_mol, None,
            "Si enrichment is zero or negative - ratio undefined. This ITSELF "
            "is notable: silicate dissolution should release Si alongside "
            "Ca/Mg, so near-zero Si enrichment alongside positive Ca/Mg "
            "enrichment is inconsistent with a pure silicate-weathering source."
        )

    ratio = (delta_ca_mol + delta_mg_mol) / delta_si_mol
    if ratio > 1.5:
        note = (f"ratio={ratio:.2f} is ABOVE the rough plausible silicate range "
                 "(~0.5-1.5) - suggests some Ca/Mg may come from a non-silicate "
                 "source (e.g. carbonate dissolution), which releases no Si. "
                 "Reference range is approximate and feedstock-dependent - "
                 "treat as a flag for further investigation, not a verdict.")
    elif ratio < 0.5:
        note = (f"ratio={ratio:.2f} is BELOW the rough plausible silicate range - "
                 "could indicate Si-rich secondary mineral formation "
                 "(e.g. clay authigenesis) consuming Si independent of Ca/Mg release.")
    else:
        note = f"ratio={ratio:.2f} falls within the rough plausible silicate range (~0.5-1.5)."

    return StoichiometryResult(pair_id, delta_ca_mol, delta_mg_mol, delta_si_mol, ratio, note)
