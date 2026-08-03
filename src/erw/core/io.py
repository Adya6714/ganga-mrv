"""
Loading and joining the two source CSVs.

We deliberately use an OUTER join with indicator=True (see joined['_merge'])
so that unmatched rows on EITHER side are visible, not silently dropped.
An inner join would hide exactly the rows Part 1 needs to catch.
"""
import pandas as pd


def load_samples(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, dtype={"barcode": "string", "collector": "string"})
    df["date"] = pd.to_datetime(df["date"])
    # empty-string barcodes/collectors read as NaN already via pandas' default
    # NA handling, but be explicit: strip whitespace so " " isn't mistaken for present
    df["barcode"] = df["barcode"].str.strip().replace("", pd.NA)
    df["collector"] = df["collector"].str.strip().replace("", pd.NA)
    return df


def load_lab_results(path: str) -> pd.DataFrame:
    return pd.read_csv(path, dtype={"barcode": "string"})


def join(samples: pd.DataFrame, lab: pd.DataFrame) -> pd.DataFrame:
    """Outer join on barcode. Rows with no barcode at all (NaN) never match
    anything in an outer join on that key - they surface as left_only with
    all lab columns NaN, which is exactly what we want to flag separately
    from a genuine orphan (a barcode present on one side, absent on the other)."""
    return samples.merge(lab, on="barcode", how="outer", indicator=True)
