"""
Pydantic schema contracts: validate data AT THE DOOR (load time), with
specific, immediate errors naming exactly which field/row broke - rather
than a malformed row silently producing NaN that propagates invisibly
through the rest of the pipeline. Essential once you're not personally
eyeballing every row (i.e. past a few dozen samples).
"""
from datetime import date
from pydantic import BaseModel, field_validator


class SampleSchema(BaseModel):
    sample_id: str
    type: str
    lat: float
    lon: float
    date: date
    collector: str | None = None
    barcode: str | None = None
    plot_type: str

    @field_validator("type")
    @classmethod
    def type_valid(cls, v):
        if v not in ("baseline", "monitoring"):
            raise ValueError(f"type must be 'baseline' or 'monitoring', got '{v}'")
        return v

    @field_validator("plot_type")
    @classmethod
    def plot_type_valid(cls, v):
        if v not in ("treatment", "control"):
            raise ValueError(f"plot_type must be 'treatment' or 'control', got '{v}'")
        return v


class LabResultSchema(BaseModel):
    barcode: str
    Ti_ppm: float
    Zr_ppm: float
    Ca_ppm: float
    Mg_ppm: float
    Si_ppm: float
    status: str

    @field_validator("status")
    @classmethod
    def status_valid(cls, v):
        if v not in ("complete", "flagged"):
            raise ValueError(f"status must be 'complete' or 'flagged', got '{v}'")
        return v

    @field_validator("Ti_ppm", "Zr_ppm", "Ca_ppm", "Mg_ppm", "Si_ppm")
    @classmethod
    def positive_concentration(cls, v):
        if v <= 0:
            raise ValueError(f"concentration must be positive, got {v}")
        return v


def validate_all_samples(df) -> list[str]:
    """Returns a list of error messages for any row that fails schema
    validation - empty list means everything is clean."""
    errors = []
    for _, row in df.iterrows():
        try:
            SampleSchema(**row.to_dict())
        except Exception as e:
            errors.append(f"{row.get('sample_id', '?')}: {e}")
    return errors
