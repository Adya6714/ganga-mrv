# Part 3: Thinking

All numbers below come from the working pipeline (src/erw/) and are
reproducible via the scratch\_\*.py scripts described in README.md. Where a
finding was verified interactively (not yet a standing test), that is noted.

## 0. Understanding of the methodology (brief summary)

Ti acts as an immobile reference frame because it doesn't react with
dissolved CO2 - so if Ti moved between a baseline and monitoring sample,
that reflects sampling-mass differences (a bigger/denser scoop of soil),
not real chemistry. Normalizing Ca and Mg to Ti before comparing cancels
that noise out. Proven algebraically in tests/test*chemistry.py: when
Ti_bl == Ti_mon exactly, the formula collapses to the naive Ca_mon -
Ca_bl, confirming Ti's absolute magnitude plays no role in the estimate -
only its \_stability between the two samples* matters.

## 1. What would break at 10x scale (5,000 samples, 8 projects)?

**Pairing complexity.** Our greedy pairing (src/erw/core/pairing.py) builds
every candidate (monitoring, baseline) pair within a plot type and sorts
them - O(n^2 log n) per project. At ~600 samples/project (5,000/8) this is
still fine, but doing it across all 8 projects naively (not partitioning
by project first) would create a much larger candidate set with
physically meaningless cross-project "nearest neighbors." Fix: partition
by project_id before pairing - a field the current schema doesn't even
have (samples.csv has no project column, since this dataset is single-
project). That's a real schema gap, not just a performance one.

**Statistical power.** This is the more fundamental issue, and we have a
real number for it: given the observed noise level in this dataset
(pooled std=11.30 t/ha across treatment and control), detecting a
realistic 2 t CO2/ha effect at 80% power requires ~395 valid pairs PER
GROUP (src/erw/extensions/significance.py, confirmed via statsmodels power analysis).
5,000 samples split across 8 projects, treatment AND control, baseline
AND monitoring, minus whatever fraction fails QC (in THIS project, 1 of 3
attempted treatment pairs failed validation - a 33% loss rate) could
plausibly land well under that per-project threshold. Scale alone doesn't
solve the small-N problem if per-project yield stays proportionally the
same.

**Manual review does not scale.** Our validation gates are automated, but
the REASONING behind a rejection (e.g. "MON-003 rejected on THREE
independent grounds - spatial, tracer, and lab status") is currently read
by a human from console output. At 5,000 samples this needs to become a
structured, queryable audit trail (see EXTENSIONS_ROADMAP.md #50,
provenance ledger) rather than something a person scans line by line.

## 2. Pairing strategy - failure modes and improvements

**Concrete failure mode, found and fixed in this project (see DECISIONS.md
D4):** naive pairing (match on GPS before checking data quality) let
GNG-MON-004 - a sample with NO barcode and therefore NO lab data, which
can never produce a CDR value under any circumstances - win the closest
available baseline (GNG-BL-001, 0m) purely by GPS coincidence. This
pushed GNG-MON-002, a fully usable sample, onto GNG-BL-006, which failed
validation as a late baseline. Verified by running both orderings: naive
ordering produced 1 valid treatment pair; pre-filtering unusable samples
before pairing produced 2. That is a 100% difference in usable output
from a single ordering decision the assignment brief treats as
unambiguous ("Step 1: pair. Step 2: validate.").

**The general lesson:** pure-GPS pairing is blind to which samples are
even capable of producing a result. A smarter pairing strategy would
incorporate data-quality awareness as a pre-filter (what we did) and,
further, use geochemical similarity (Ti, Zr) as a secondary signal
alongside distance - e.g. a combined distance metric (GPS distance +
Mahalanobis distance over tracer values), so that two candidate baselines
at similar GPS distance are broken by which one is chemically MORE
plausible as the same patch of ground, not just marginally closer.

## 3. The control plot problem

Our control CDR is not the hypothetical ~0.3 t CO2/ha in the assignment's
prompt - it's **17.89 t CO2/ha**, 31% the size of the treatment signal
(57.39 t/ha). This is real, not hypothetical, in this dataset.

**What it means scientifically:** something is producing a large,
CDR-shaped signal on land that never received rock. Per the real
Isometric protocol, the control CDR is not a side sanity check - it IS
the formal CO2e_Counterfactual term, meant to be subtracted directly from
gross treatment CDR (src/erw/extensions/counterfactual.py). Doing that gives a net
CDR of 39.49 t/ha (31.2% downward correction).

**What's more important than the point estimate:** propagating
uncertainty correctly through that subtraction (independent variances
add, even though means subtract) gives a net 95% CI of [-104.06, 183.05]

- a range that includes zero. We confirmed this with an independent
  method too: Welch's t-test (treatment > control) gives p=0.0857, NOT
  significant at the conventional 0.05 threshold. And the minimum
  detectable effect at this noise level and sample size is 44.95 t/ha -
  LARGER than the observed net effect of 39.49. Three independent methods
  agree: this project's data, as collected, cannot statistically support a
  crediting decision. A positive point estimate is not sufficient evidence
  by itself.

**A second, independent chemical signal points the same direction.** Using
Si_ppm - present in the data but unused by the required formula - we
tested whether Ca/Mg release is consistent with silicate mineral
stoichiometry (src/erw/extensions/stoichiometry.py). Silicate minerals release Ca/Mg
and Si together in ratios fixed by their chemical formula; both valid
treatment pairs show a (Ca+Mg)/Si molar ratio of ~2.45, consistently
above the plausible range (~0.5-1.5) for basaltic silicate dissolution.
This suggests part of the measured Ca/Mg enrichment may come from a
non-silicate source - most plausibly agricultural lime or pre-existing
soil carbonate, both common in managed rice paddies - which releases Ca
with no accompanying Si. This is a chemically independent line of
evidence from the seasonal-hydrology hypothesis, and it points at the
same underlying concern: some fraction of what the pipeline reports as
"weathering signal" may not be weathering at all.

**What engineering should do:** we tested two candidate explanations for
the non-zero control CDR - lab-batch drift (ruled unlikely, see above)
and, via the Si stoichiometry check, a possible non-silicate Ca/Mg
contribution consistent with lime or soil carbonate. Neither is
conclusive on its own, but together they argue for two concrete next
steps: (1) collect baseline and monitoring samples at matched points in
the seasonal cycle rather than a fixed number of months apart, and (2)
request feedstock mineralogy and any lime/fertilizer application records
for the control plots, so the carbonate hypothesis can be tested directly
rather than inferred.

## 4. Validation trade-offs: the 20% Ti threshold

**Concrete, tested finding (not hypothetical):** the required check
compares each sample's Ti to the MEAN Ti of its plot type. But that mean
is itself computed by averaging in whatever outlier you're trying to
catch. In this dataset: treatment Ti mean WITH the MON-003 outlier
included is 3390 ppm; WITHOUT it, 3081.7 ppm - a 10% difference caused
entirely by one bad sample's presence in the reference statistic.

Concretely, at the required 20% threshold, only MON-003 is (correctly)
flagged. But tightening to 10% - which sounds like it should ONLY catch
MORE problems - instead falsely flags GNG-BL-002, a perfectly clean
2024-batch baseline, purely because the contaminated mean is dragged
upward by MON-003. Loosening to 30% still only catches MON-003 - no
change, since MON-003's deviation (55%) is far beyond any of these
thresholds anyway.

**The real lesson:** the threshold value matters less than the
ESTIMATOR. A mean-based check is fragile exactly when it matters most -
when a real outlier is present, since that's precisely when the
reference point itself becomes untrustworthy. A median or MAD
(median absolute deviation) based check is far more robust, since the
median barely moves in response to one or two outliers. This is a
stronger, more implementation-grounded answer than "different thresholds
have different sensitivity" - the failure mode is structural, not just a
matter of picking the right number.

**Who should own this decision:** the choice of estimator (mean vs.
median/MAD) is an engineering/statistics decision and belongs with
whoever owns the MRV pipeline's methodology - it's a correctness issue,
not a business trade-off. The specific threshold VALUE, once a robust
estimator is in place, is closer to a policy decision balancing false-
positive cost (losing valid data) against false-negative cost (crediting
bad data) - that's better owned jointly by the science/MRV lead and
whoever is accountable to the registry auditor, since it directly affects
what gets submitted for verification.

## 5. One more thing

Given another week: a **digital-twin pipeline validator** (see
EXTENSIONS.md ("Described-only" section, item 1, and ML/geospatial section)). Generate synthetic baseline/monitoring
data from a KNOWN true CDR, with realistic spatial correlation (not just
i.i.d. noise - real field heterogeneity is spatially structured, e.g. via
a Gaussian process with a fitted variogram), run the actual pipeline
against it, and check whether the reported 95% CI actually contains the
known truth at close to the expected 95% rate across many simulated
deployments. This is the strongest available evidence that the pipeline
is CORRECT, not just that it runs without error - and it's exactly the
validation approach used in the published MRV literature we referenced
(Lithos Carbon's "Monty" methodology). Everything we've built so far
proves the pipeline behaves sensibly on the data we were given; this
would prove it behaves correctly in general, including on data we don't
have yet.
**Multiverse confirmation (src/erw/extensions/multiverse.py):** running all 12
combinations of ordering x threshold x tracer, the mean CDR only ranges
57.39-59.06 (~3%) across specifications with a valid pair - threshold and
tracer choice are NOT the dominant source of variation. Pairing ordering
is. This refines the answer above: the fragility we identified in the
20% threshold is specifically in Part 1's POPULATION-MEAN-based check
(quality.py), which is contaminated by the very outlier it's meant to
catch. Part 2's PAIR-SPECIFIC validation gate, tested here across three
threshold values, is comfortably robust in this dataset - the valid
pairs' own Ti deviations are far from any of the tested boundaries. This
is a more precise conclusion than "the threshold matters" in general:
which CHECK you're tuning matters more than the exact number you tune it to.
UPDATE: this was subsequently built (see src/erw/ml/digital_twin.py, PROGRESS.md
Session 21), not left as description-only. Coverage validation across 300
trials at n_pairs=2 (matching the real project) gave 95.0% coverage
against the 95% nominal target - strong evidence the pipeline's CI
implementation is correctly calibrated.
