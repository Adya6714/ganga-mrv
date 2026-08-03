# Assignment Compliance Map

Literal requirement -> implementation, for fast reviewer verification.

## Part 1: Data Quality (20%)

| Requirement                                    | File                         | Function                                   |
| ---------------------------------------------- | ---------------------------- | ------------------------------------------ |
| Load + join both CSVs on barcode               | core/io.py                   | load_samples, load_lab_results, join       |
| Missing fields (barcode/collector/GPS)         | core/quality.py              | check_missing_fields                       |
| Orphan lab results (both directions)           | core/quality.py              | check_orphan_lab_results                   |
| Baseline timing                                | core/quality.py              | check_baseline_timing                      |
| Spatial outliers (Haversine, 500m)             | core/quality.py, core/geo.py | check_spatial_outliers, haversine_m        |
| Tracer stability (20% vs plot mean)            | core/quality.py              | check_tracer_stability                     |
| Lab status flagged                             | core/quality.py              | check_lab_status                           |
| Result: 8 issues, 5 root causes, 0 false flags | tests/test_quality.py        | test_all_eight_issues_found_no_false_flags |

## Part 2: CDR Pipeline (50%)

| Requirement                                                                       | File                                | Function                          |
| --------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------- |
| Step 1: Pair nearest baseline, 1:1, 500m                                          | core/pairing.py                     | pair_plot_type                    |
| Step 2: Validate (Ti/timing/status/plot-type)                                     | core/validation.py                  | validate_pair, validate_all_pairs |
| Step 3: Compute CDR (Ca, Mg, sum)                                                 | core/chemistry.py                   | pair_cdr_t_per_ha                 |
| Step 4: Project stats (mean/std/CI)                                               | core/stats.py                       | project_statistics                |
| Step 5: Control CDR, flag if non-zero                                             | core/stats.py (plot_type="control") | project_statistics                |
| Result: 2/3 valid treatment (57.39 t/ha), 2/2 valid control (17.89 t/ha, flagged) | scripts/run_pipeline.py             | -                                 |

## Part 3: Thinking (30%)

All 5 guide questions answered with real, tested numbers - see
PART3_THINKING.md. Every claim cross-references the specific module that
produced it.

## Beyond the assignment

See EXTENSIONS.md for the full catalogue (built + described-only) and
DECISIONS.md for the reasoning behind each judgment call. Headline:
counterfactual subtraction (extensions/counterfactual.py, net=39.49),
significance + MDE (extensions/significance.py, Welch p=0.0857),
digital-twin correctness proof (ml/digital_twin.py, 95.0% CI coverage
at N=2), GP/kriging + Isolation Forest (ml/), full test suite (tests/,
15 passing).
