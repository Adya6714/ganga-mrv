# Extensions Status

What's built (with the module) vs. deliberately described-only. Full
build story and findings for each live in BOOK.md.

## Built and verified

| Area                                                             | Module(s)                        | Book chapter |
| ---------------------------------------------------------------- | -------------------------------- | ------------ |
| Counterfactual subtraction                                       | extensions/counterfactual.py     | Ch. 7        |
| Significance testing + MDE                                       | extensions/significance.py       | Ch. 8        |
| Monte Carlo / gradient sensitivity, materiality                  | extensions/sensitivity.py        | Ch. 9        |
| Lab-batch forensics                                              | extensions/forensics.py          | Ch. 10       |
| Si stoichiometric closure                                        | extensions/stoichiometry.py      | Ch. 11       |
| Specification-curve / multiverse                                 | extensions/multiverse.py         | Ch. 12       |
| Feedstock rate + Rajmahal Ti/Zr                                  | extensions/plausibility.py       | Ch. 13       |
| Steinour check, coordinate/GPS/barcode checks                    | extensions/literature_checks.py  | Ch. 13       |
| Bootstrap, depth toggle, charge-balance                          | extensions/robustness_checks.py  | Ch. 14       |
| Robust median/MAD QC                                             | extensions/robust_qc.py          | Ch. 15       |
| Hungarian pairing                                                | extensions/pairing_hungarian.py  | Ch. 3        |
| Combined geo+geochemical distance                                | extensions/combined_distance.py  | Ch. 3        |
| Metadata-geochemistry consistency, ratio/magnitude decomposition | extensions/consistency_checks.py | Ch. 16       |
| GP/kriging baseline interpolation                                | ml/geospatial_ml.py              | Ch. 15       |
| Isolation Forest                                                 | ml/anomaly_detection.py          | Ch. 15       |
| Digital-twin coverage validation                                 | ml/digital_twin.py               | Ch. 18       |
| Provenance ledger                                                | infra/provenance.py              | Ch. 19       |
| Schema contracts                                                 | infra/schemas.py                 | Ch. 19       |
| Map visualization                                                | infra/mapping.py                 | Ch. 19       |
| Full test suite (15 tests, incl. property-based)                 | tests/                           | Ch. 17       |

## Described-only (cannot run on this synthetic dataset)

| Extension                             | Why it can't run here                             | Book/other reference            |
| ------------------------------------- | ------------------------------------------------- | ------------------------------- |
| Bayesian hierarchical model (PyMC)    | Needs N>2 pairs to fit between-pair variance      | PART3_THINKING.md Q5            |
| Sentinel-2 NDVI corroboration         | No real imagery exists for fabricated coordinates | —                               |
| Cation exchange / sorption correction | Needs measured CEC, not in this schema            | —                               |
| Secondary carbonate formation         | Needs isotopic/carbonate-content data             | Ch. 11 (connects to Si finding) |
| Riverine/marine loss fraction         | Needs catchment-scale hydrological modeling       | —                               |
