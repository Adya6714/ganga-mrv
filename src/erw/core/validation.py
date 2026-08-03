"""
Part 2, Step 2: validate each geographically-paired sample before computing
CDR. A pair fails validation if it fails ANY gate - we check and report ALL
failing gates for a pair, not just the first one, same principle as Part 1's
MON-003 failing on three independent grounds simultaneously.

Gate 1 - Tracer stability (pair-specific, not the plot-mean check from Part 1):
  |Ti_mon - Ti_bl| / Ti_bl > 20% -> reject. If Ti itself swings too much
  between this specific baseline and monitoring sample, the "stable ruler"
  isn't stable for THIS comparison, so nothing computed from it is trustworthy.

Gate 2 - Baseline timing: baseline collected after rock application date ->
  reject. A baseline collected after treatment already happened isn't a
  baseline - it's contaminated, and would UNDERSTATE true enrichment.

Gate 3 - Lab status: either sample flagged -> reject. The lab doesn't trust
  its own measurement; neither do we.

Gate 4 - Plot type: NOT implemented here. Control vs treatment routing is
  the caller's decision (both get validated identically; only treatment
  feeds the main project statistics).
"""
from dataclasses import dataclass, field
import pandas as pd
from . import config as cfg


@dataclass
class ValidationResult:
    monitoring_id: str
    baseline_id: str
    valid: bool
    reasons: list[str] = field(default_factory=list)


def validate_pair(mon_id: str, bl_id: str, mon_row: pd.Series, bl_row: pd.Series) -> ValidationResult:
    """mon_row and bl_row are rows from the OUTER-JOINED dataframe (must
    include Ti_ppm, status, date). Either can have NaN lab columns if that
    sample never matched a lab result (e.g. MON-004's missing barcode).
    mon_id/bl_id are passed explicitly rather than read off the row, since
    the row may come from a dataframe indexed BY sample_id (in which case
    sample_id is no longer a regular column - it's the index label)."""
    reasons = []

    ti_bl, ti_mon = bl_row["Ti_ppm"], mon_row["Ti_ppm"]
    if pd.isna(ti_bl) or pd.isna(ti_mon):
        reasons.append("missing Ti value for baseline or monitoring sample (no lab match)")
    else:
        ti_dev = abs(ti_mon - ti_bl) / ti_bl
        if ti_dev > cfg.TI_DEVIATION_THRESHOLD:
            reasons.append(
                f"Ti deviates {ti_dev:.0%} between pair (bl={ti_bl:.0f}, mon={ti_mon:.0f}), "
                f"exceeds {cfg.TI_DEVIATION_THRESHOLD:.0%}"
            )

    application_date = pd.Timestamp(cfg.ROCK_APPLICATION_DATE)
    if bl_row["date"] > application_date:
        reasons.append(
            f"baseline collected {bl_row['date'].date()}, after application date "
            f"({application_date.date()})"
        )

    if bl_row.get("status") == "flagged":
        reasons.append("baseline lab status is 'flagged'")
    if mon_row.get("status") == "flagged":
        reasons.append("monitoring lab status is 'flagged'")

    return ValidationResult(mon_id, bl_id, len(reasons) == 0, reasons)


def validate_all_pairs(pair_results, joined: pd.DataFrame) -> list[ValidationResult]:
    """Takes the list of PairResult from pairing.py (only the ones with
    paired=True matter here) plus the outer-joined samples+lab dataframe,
    and validates each one."""
    joined_by_id = joined.set_index("sample_id")
    out = []
    for p in pair_results:
        if not p.paired:
            continue
        mon_row = joined_by_id.loc[p.monitoring_id]
        bl_row = joined_by_id.loc[p.baseline_id]
        out.append(validate_pair(p.monitoring_id, p.baseline_id, mon_row, bl_row))
    return out
