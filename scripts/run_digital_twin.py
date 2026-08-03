"""Digital-twin pipeline correctness validation."""
from erw.ml.digital_twin import coverage_validation

print("=== COVERAGE VALIDATION (300 trials per sample size) ===")
for n_pairs in [2, 5, 8]:
    result = coverage_validation(n_pairs, true_cdr=5.0, n_trials=300)
    print(f"n_pairs={result['n_pairs']}: {result['hits']}/{result['valid_trials']} "
          f"= {result['coverage_pct']:.1f}% coverage (target: 95%)")
