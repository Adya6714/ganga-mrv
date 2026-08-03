"""
Machine-readable audit ledger: every rule that fires, with its threshold,
measured value, and result. A registry auditor cannot verify a console
printout - they need to reproduce your decisions independently. This is
arguably the single most job-relevant module in the repo, given Alt
Carbon's actual work is MRV infrastructure that survives Isometric audit.
"""
import hashlib
import json
from dataclasses import dataclass, field, asdict
from datetime import datetime
from ..core import config as cfg


def config_hash() -> str:
    """Hash of the current config values - changes if any threshold changes,
    letting an auditor confirm which config version produced a given result."""
    snapshot = {
        "TI_DEVIATION_THRESHOLD": cfg.TI_DEVIATION_THRESHOLD,
        "PAIRING_MAX_DISTANCE_M": cfg.PAIRING_MAX_DISTANCE_M,
        "ROCK_APPLICATION_DATE": cfg.ROCK_APPLICATION_DATE,
        "SOIL_MASS_T_PER_HA": cfg.SOIL_MASS_T_PER_HA,
    }
    return hashlib.sha256(json.dumps(snapshot, sort_keys=True).encode()).hexdigest()[:12]


@dataclass
class LedgerEntry:
    subject_id: str
    rule: str
    threshold: float
    measured: float
    result: str  # "PASS" or "FAIL"
    config_hash: str = field(default_factory=config_hash)
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


class ProvenanceLedger:
    def __init__(self):
        self.entries: list[LedgerEntry] = []

    def record(self, subject_id: str, rule: str, threshold: float, measured: float, passed: bool):
        self.entries.append(LedgerEntry(
            subject_id, rule, threshold, measured, "PASS" if passed else "FAIL"
        ))

    def to_json(self) -> str:
        return json.dumps([asdict(e) for e in self.entries], indent=2)

    def save(self, path: str):
        with open(path, "w") as f:
            f.write(self.to_json())
