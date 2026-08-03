"""
All tunable constants for the pipeline live here, and nowhere else.

Each constant is tagged with where it came from:
  [ASSIGNMENT]  - mandated by the brief, not ours to change
  [JUDGMENT]    - a threshold we chose; documented rationale below
  [PHYSICAL]    - a physical/chemical constant, not a policy choice
"""

# --- [ASSIGNMENT] geometry ---
PAIRING_MAX_DISTANCE_M = 500          # monitoring must be within this of its baseline
ROCK_APPLICATION_DATE = "2024-10-15"  # treatment plots only; controls never got rock

# --- [ASSIGNMENT] tracer stability gate ---
TI_DEVIATION_THRESHOLD = 0.20  # 20%. See docs/SCIENTIFIC_RATIONALE.md for why this
                                # number is fragile when the reference mean itself
                                # includes the outlier you're trying to catch.

# --- [PHYSICAL] chemistry constants ---
MOLAR_MASS_CA = 40.08     # g/mol
MOLAR_MASS_MG = 24.31     # g/mol
MOLAR_MASS_CO2 = 44.01    # g/mol
CO2_PER_CATION_MOL = 2    # each mole Ca2+/Mg2+ charge-balances 2 moles HCO3-

# --- [ASSIGNMENT] soil mass conversion ---
# NOTE: this is an ASSUMPTION, not measured per-sample. It scales every CDR
# number linearly. The real Isometric protocol uses 20cm depth; this assignment
# specifies 30cm/2600 t/ha. We implement the assignment's number as required,
# and separately expose the 20cm alternative for comparison (see extensions).
SOIL_MASS_T_PER_HA = 2600.0

# --- [JUDGMENT] robust statistics alternative to the mean-based 20% rule ---
# Used only in the extension that compares mean-based vs median/MAD-based QC.
ROBUST_Z_FLAG_THRESHOLD = 3.5   # standard robust-outlier convention (Iglewicz & Hoaglin)

# --- [JUDGMENT] ICP-OES measurement noise assumption, for Monte Carlo sensitivity ---
ICP_OES_RELATIVE_NOISE = 0.03   # ~3% relative noise, typical for ICP-OES major elements
