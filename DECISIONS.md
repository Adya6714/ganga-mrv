# Decisions Index

One line per decision. Full reasoning for each lives in BOOK.md — this
file exists so you can find "why did we do X" fast without reading the
whole narrative.

| #   | Decision                                                                 | Book chapter |
| --- | ------------------------------------------------------------------------ | ------------ |
| D1  | Outer join, not inner, for samples<->lab_results                         | Ch. 1        |
| D2  | Ti as tracer; only its _stability_ matters, not magnitude                | Ch. 0        |
| D3  | missing_barcode and orphan_lab_result are different categories           | Ch. 2        |
| D4  | Pre-filter unusable samples BEFORE pairing (1 vs 2 valid pairs)          | Ch. 3        |
| D5  | t-distribution CI, not normal/z                                          | Ch. 5        |
| D6  | Control CDR (17.89) is non-trivially non-zero; net CI crosses zero       | Ch. 6-7      |
| D7  | 2600 t/ha soil mass is an assumption; confirmed depth-toggle ratio=0.667 | Ch. 14       |
| D8  | Welch's t-test, not Student's (variances differ 8x)                      | Ch. 8        |
| D9  | MDE needs POOLED std across both groups, not one alone (bug found+fixed) | Ch. 8        |
| D10 | Si stoichiometry as independent plausibility check (ratio ~2.45)         | Ch. 11       |
| D11 | Multiverse: threshold/tracer robust, ordering is the real lever          | Ch. 12       |
| D12 | Bootstrap/depth/charge-balance built for process, not headline results   | Ch. 14       |
| D13 | GP/kriging + Isolation Forest built for explicit ML role-fit             | Ch. 15       |
| D14 | Digital-twin coverage validation is the correctness proof                | Ch. 18       |
| D15 | Repo restructured into core/extensions/ml/infra                          | Ch. 20       |
