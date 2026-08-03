# The Full Story: How This Pipeline Was Built, What We Found, and Why

This is a chronological narrative of the entire project — every decision,
every test, every result, every correction. Read it top to bottom to
reload the whole mental model, or jump to a chapter to refresh one piece.

---

## Chapter 0: The Problem, in Plain Language

Alt Carbon spreads crushed basalt rock on farmland (Enhanced Rock
Weathering). As the rock dissolves, it reacts with dissolved CO2 in soil
water and locks it away as stable bicarbonate — that's the carbon
removal. To prove it happened, you compare soil chemistry _before_ the
rock was applied (a "baseline" sample) to soil chemistry some months
_after_ ("monitoring"), and look for enrichment in calcium and
magnesium — the elements silicate rock releases when it weathers.

**The core problem the formula has to solve:** you can't just compare
raw Ca_monitoring to Ca_baseline. Two different scoops of soil, taken
months apart, will never be perfectly identical in mass or density —
and any difference there shows up as a fake signal that has nothing to
do with weathering.

**The fix: Titanium as a ruler.** Ti doesn't react with CO2 — it's
chemically inert in this context. If Ti moved between your baseline and
monitoring sample, that tells you your _scoop_ changed, not the
_chemistry_. So instead of comparing raw Ca, you compare Ca _relative to
Ti_ in both samples. The change in that ratio is your real signal,
because whatever noise moved Ti also moved Ca and Mg by the same
proportion — and dividing by Ti cancels it out.

**We proved this algebraically, then in code.** If Ti_baseline exactly
equals Ti_monitoring, the whole formula collapses to the plain
difference Ca_monitoring − Ca_baseline. That's `tests/test_chemistry.py`
and its generalized version in `tests/test_chemistry_properties.py`
(hundreds of random cases via the `hypothesis` library, not just one
hand-picked example). This proof is the single most important thing
to understand before anything else in this repo makes sense.

---

## Chapter 1: The Foundation

Built in this order, each piece hand-verified before the next was added:

**`geo.py`** — Haversine distance between two lat/lon points. Not flat
Euclidean math, because a degree of longitude shrinks as you move away
from the equator (`111.32km × cos(latitude)`). At this project's
latitude (~23.45°N), 1° of longitude is about 102km, not 111km — using
flat math would silently distort every distance calculation.

**`io.py`** — loads both CSVs and joins them on barcode using an
**outer join with `indicator=True`**. This was a deliberate choice: an
inner join silently drops any row that doesn't match on both sides. The
outer join keeps everything and tells you _how_ each row matched — which
is exactly what let us later find both `LB-25-5508` (a lab result with
no matching sample) and `GNG-MON-004` (a sample with no barcode at all,
so it can never join to anything).

**`chemistry.py`** — the actual CDR formula, as pure functions with zero
I/O. We hand-verified it against one real pair (BL-002↔MON-001) before
trusting it for anything: **58.78 t CO₂/ha**, matched to two decimal
places. This pure-function discipline is what made every later
extension (Monte Carlo, multiverse, digital twin) nearly free to build —
they're all just different callers of the same core formula.

---

## Chapter 2: Part 1 — Data Quality

Six required checks, each its own function in `quality.py`: missing
fields, bidirectional orphan detection, baseline timing, spatial
outliers (Haversine, 500m), tracer stability (20% vs. plot-type mean),
lab status.

**Result: 8 issues across 5 root-cause samples/records.**

- `GNG-BL-005`: zeroed GPS (0,0) — "Null Island," always a sentinel for
  missing data, never a real field location.
- `GNG-MON-004`: no barcode recorded at all.
- `GNG-BL-006`: missing collector **and** a late-baseline flag (collected
  2025-05-24, seven months after rock was applied — that's not a
  baseline anymore, it's contaminated).
- `LB-25-5508`: orphan lab result, no matching sample.
- `GNG-MON-003`: flagged on **three independent grounds simultaneously**
  — 5,920m from any treatment baseline (10x over the 500m limit), 55%
  Ti deviation, and lab status "flagged."

**The discipline that matters more than the count:** we explicitly
verified _zero false flags_. `GNG-BL-005`'s date (2024-10-14) is
_before_ the application date (2024-10-15) — and we proved, with a
direct comparison, that it correctly does NOT trigger the late-baseline
rule. This is now locked in permanently as `tests/test_quality.py`, a
single regression test asserting exactly 8 issues, exactly these
categories, and specifically that control-plot samples never get
flagged at all.

---

## Chapter 3: The Pairing Problem — A Real Bug We Found by Running Things

Part 2, Step 1 pairs each monitoring sample to its nearest same-plot-type
baseline. The algorithm (`pairing.py`): list every possible
(monitoring, baseline) pair, sort by distance ascending, walk the list
claiming pairs greedily. Whichever pair is genuinely closest locks in
first, so "closer pair wins" holds even with many competing samples.

**Here's where it got interesting.** We ran this on the raw data first,
with zero pre-filtering. `GNG-MON-004` — the sample with no barcode,
which can NEVER produce a CDR value no matter what — sat at exactly 0m
from `GNG-BL-001`. Because 0m is the globally smallest distance in the
whole candidate list, MON-004 claimed BL-001 first. That pushed
`GNG-MON-002` — a fully usable sample — onto its second choice,
`GNG-BL-006`, at 15m. And BL-006 is the sample we'd already flagged as a
**late baseline** in Part 1.

We tested this concretely, not hypothetically: naive ordering (pair
first on raw data) produced **1 valid treatment pair**. Pre-filtering
samples with no lab match _before_ pairing produced **2 valid treatment
pairs** — because MON-002 got its rightful clean baseline (BL-001)
instead of the broken one. That's a 100% difference in usable data from
a single ordering decision the assignment brief treats as unambiguous
("Step 1: pair. Step 2: validate."). We adopted pre-filtering as
standard policy (`DECISIONS.md D4`) and kept the naive-ordering result
on record — it became direct, quantified evidence for Part 3 Q2 ("what's
the failure mode of GPS-only pairing").

---

## Chapter 4: Validation, and a Real Bug We Caught in Our Own Code

Part 2, Step 2 (`validation.py`) is a _second, independent_ filter on
top of geographic pairing — a pair can be geographically perfect and
still be scientifically worthless. Four gates: pair-specific Ti
deviation (>20%), baseline-after-application timing, lab status flagged
on either sample, and plot-type routing (handled by the caller, not the
gate itself).

**The bug:** `validate_all_pairs` used
`joined.set_index("sample_id")` to look samples up quickly. But
`set_index` _moves_ that column into the row index — it's no longer a
regular column afterward. So the code tried `mon_row["sample_id"]` to
build the result, and got `KeyError: 'sample_id'`. The fix: pass the IDs
in explicitly from the caller (which already had them from
`pairing.py`'s output) instead of re-reading them off a row that no
longer had that column. Small bug, real lesson: `set_index` isn't free,
it changes what's still accessible as a column.

**Important distinction, discovered later and worth remembering
precisely:** this pair-specific Ti gate is DIFFERENT from Part 1's
population-level tracer check. Part 1 compares one sample's Ti to the
_mean Ti of its whole plot type_ (fragile — contaminated by whatever
outlier it's trying to catch). This gate compares Ti _between the two
members of one specific pair_ — a completely separate, and much more
robust, comparison. Conflating these two in conversation was a mistake
we made and later corrected (see Chapter 11).

---

## Chapter 5: Project Statistics, and Why a Huge Confidence Interval Isn't a Bug

`stats.py` computes per-pair CDR, then project-level mean, std, and a
95% CI using the **t-distribution**, not the normal distribution.

**Why t, not z:** with only 2 data points, the sample standard deviation
is itself a noisy guess at the true population variance. Treating it as
exact (a z-interval) understates how uncertain you really are. The
t-distribution has heavier tails specifically to correct for this — at
df=1 (our N=2 case) the multiplier is about **12.7**, versus ~1.96 for
the normal distribution at large N. That's not scipy malfunctioning —
it's the math correctly refusing to pretend two points can pin down a
population mean.

**First real run:** Treatment = 2/3 valid pairs, mean **57.39 t/ha**,
95% CI **[39.63, 75.15]**. Control = 2/2 valid pairs, mean **17.89
t/ha**, expected ~0.

---

## Chapter 6: The Headline Finding — The Control Plot

**17.89 t CO₂/ha on land that received no rock at all.** That's not a
minor footnote — it's **31% the size of the treatment signal**. The
assignment's own Part 3 prompt posits a hypothetical "~0.3 t/ha,
non-trivially positive" as something to discuss. The real number in thipine of the entire rest of the
investigation — everything from Chapter 7 onward is either quantifying
its consequences or hunting for its cause.

---

## Chapter 7: Counterfactual Subtraction

The real Isometric MRV protocol doesn't treat the control plot as just a
sanity check — its master equation is
`CO2e_Removal = CO2e_Stored − CO2e_Counterfactual − CO2e_Emissions`, and
the control CDR literally **is** the counterfactual term, meant to be
subtracted directly.

`counterfactual.py`: **net CDR = 57.39 − 17.89 = 39.49 t/ha**, a 31.2%
downward correction.

**But the harder, more important part is the uncertainty.** You're
subtracting two _uncertain_ numbers, not two fixed ones. When you
subtract two independent estimates, their variances **add** even though
their means subtract (`Var(net) = Var(treatment) + Var(control)`). We
propagated this correctly (using a conservative `df = min` of the two
groups' degrees of freedom) and got a net 95% CI of
**[-104.06, 183.05]** — a range that includes **zero**. That means: once
you honestly account for uncertainty in _both_ the treatment estimate
and the control estimate, you cannot statistically rule out that this
project removed **no carbon at all**.

---

## Chapter 8: Formal Significance Testing, and a Bug We Caught by Cross-Checking Results Against Each Other

Two separate but related questions: _is_ the observed effect
significant, and _could_ we have detected it at all given how noisy the
data is?

**Significance (`significance.py`):**

- One-sample t-test (treatment > 0): p=0.0078, significant — but this is
  the WRONG test. It completely ignores the control confound, so it
  answers "is there measurable enrichment at all," not "is there
  enrichment beyond what an untreated plot also shows."
- **Welch's t-test (treatment > control): p=0.0857, NOT significant.**
  Welch's, not Student's, because treatment std (1.98) and control std
  (15.85) are wildly different (8x) — Welch's doesn't assume equal
  variances, which matters a lot here.
- Mann-Whitnicant, but this test is **mathematically
  incapable** of reaching p<0.05 at N=2 vs. N=2 no matter what the data
  says — there simply aren't enough possible orderings of 2-vs-2 values.
  A non-significant result here is expected and uninformative, not a
  real finding.

**Minimum Detectable Effect (MDE) — the bug and the fix:** first pass
gave MDE = **7.87 t/ha**, using only the treatment group's standard
deviation. This didn't make sense: if the true detectable-effect floor
were only 7.87, how could a net effect of 39.49 come back
non-significant? We caught the inconsistency by cross-checking two
independently-computed results against each other rather than accepting
either alone. **Root cause:** for a treatment-_vs-control_ comparison,
the correct noise scale is the **pooled** standard deviation across
BOTH groups, not one alone — and control's std (15.85) is 8x larger,
dominating the real detection noise. Corrected MDE = **44.95 t/ha**,
which is now consistent with the picture: 44.95 exceeds the od
effect of 39.49, which is _exactly why_ Welch's test came back
non-significant. Three independent methods (CI crossing zero, Welch's
p=0.0857, MDE exceeding the observed effect) now agree.

**Materiality:** combined chemistry + soil-mass uncertainty (via Monte
Carlo, see Chapter 9) came to **19.2%**, versus the real protocol's 5%
materiality tolerance. Fails by a wide margin — a fourth independent
line of evidence pointing the same direction.

---

## Chapter 9: Monte Carlo Sensitivity — Quantifying the "Denominator Problem"

Session 1's literature research (Lithos Carbon) flagged that in a
Ti-normalized ratio estimator, noise on the _denominator_ (Ti itself)
can get amplified unpredictably, sometimes worse than noise on the
mobile elements it's meant to stabilize.

**We tested this directly (`sensitivity.py`).** Perturbing all six
inputs (Ti_bl, Ti_mon, Ca_bl, Ca_mon, Mg_bl, Mg_mon) by a realistic 3%
relative ICP-OES measurement noise, 20,000 Monte Carlo trials: **3%
input noise amplifies to 14.5% output noise — a 4.84x amplification
factor.** Local gradient sensitivity (one input perturbed at a time)
showed **Ti_bl and Ti_mon have sensitivity ratios of 2.55x and −2.57x —
larger than Ca_mon's 2.17x.** In plain terms: the tracer whose entire
job is to stabilize the measurement is itself the single largest source
of amplified uncertainty in the final answer. This is the "denominator
problem" derived from our own code, not cited secondhand.

---

## Chapter 10: Investigating _Why_ the Control Is Non-Zero

Having quantified the consequences of the control confound, we went
hunting for its cause.

**Lab-batch drift test (`forensics.py`):** every baseline sample carries
a `LB-24-*` barcode, every monitoring sample `LB-25-*` — meaning
treatment epoch is perfectly confounded with which year the lab
analyzed the sample. If the ICP-OES instrument drifted between the two
analysis runs, that alone could produce a false enrichment signal in
BOTH treatment and control. Testable because of one accident:
`GNG-hemically a baseline but was physically analyzed in the
2025 lab batch — an accidental cross-batch natural experiment. Compared
against genuine 2024-batch baselines: **Ti +0.63%, Ca +0.30%, Mg +0.75%,
Si +0.52% — all under 1% deviation.** This weakens (does not fully rule
out — it's an N=1 natural experiment) the batch-drift hypothesis.

**Leading remaining candidate: seasonal/hydrological effect.** Baselines
were collected October 2024 (post-monsoon), monitoring samples May 2025
(pre-monsoon, dry season) — a full flood/dry cycle in rice paddies,
where redox chemistry genuinely mobilizes Ca/Mg independent of any rock
weathering. If true, the fix isn't a code change — it's a sampling
_protocol_ change (collect baseline and monitoring at matched points in
the seasonal cycle), which matters directly for Part 3 Q3's "what
should engineering do about it."

---

## Chapter 11: An Independent Chemical Signal — Si Stoichiometry

Silicate minerals release Ca/Mg _and_ Si together, in ratios fixed by
mineral chemistry (e.g. anorthite: 1 mol Ca per 2 mol Si; forsterite:
2 mol Mg per 1 mol Si). Si is present in `lab_results.csv` but the
required formula never uses it.

**`stoichiometry.py`:** (Ca+Mg)/Si molar ratio on both valid treatment
pairs: **2.46 and 2.44** — consistent across pairs, both well above the
plausible range (~0.5-1.5) for basaltic silicate dissolution. This
points toward a **non-silicate Ca/Mg source** — most plausibly
agricultural lime or pre-existing soil carbonate, both common in managed
rice paddies, both of which release Ca with **zero** accompanying Si.
This is a _third_ independent signal (alongside the control CDR and the
significance testing) all converging on the same underlying concern:
some fraction of measured "enrichment" may not be attributable to rock
weathering at all.

We were careful to state this as a flag for investigation against an
assumed reference range, not a definitive verdict — feedstock
mineralogy is unknown.

---

## Chapter 12: Specification-Curve Analysis — Turning Part 3 Q4 Into Data

Instead of reporting one number from one set of choices, we ran **every
combination** of defensible analytic decisions: pairing ordering
(naive/pre-filtered) × Ti threshold (10%/20%/30%) × tracer (Ti/Zr) — 12
specifications total (`multiverse.py`).

**Result:** across all 12 specs with at least one valid pair, mean CDR
ranges only **57.39 to 59.06 — about 3%.** Threshold and tracer choice
barely move the answer at all. **Pairing ordering is the dominant
lever** — it changes N (1 valid pair vs. 2), not just the mean.

**This produced an important self-correction.** We had earlier claimed
tightening the threshold to 10% would falsely flag `BL-002`. That's
true — but only for Part 1's _population-mean-based_ check
(`quality.py`), which is contaminated by the very outlier it's supposed
to catch. This multiverse test is on Part 2's _pair-specific_ gate
(`validation.py`), and it's comfortably robust across all three tested
thresholds — the valid pairs' own Ti deviations (~2%) are nowhere near
any tested boundary. Two real findings, about two structurally different
checks — and being precise about which is which sharpened the whole
answer to Part 3 Q4: **which check you're tuning matters more than the
exact number you tune it to.**

---

## Chapter 13: External Plausibility Checks

**Implied feedstock application rate (`plausibility.py`):** inverting
57.39 t CO₂/ha through typical published CO₂-per-tonne-basalt figures
(0.2–0.3) gives an implied application rate of **191–287 t basalt/ha**
— about 5.5–8.2x typical real-world field rates (20–50 t/ha). This
suggests the synthetic data generator inflated the signal — a property
of the _data_, not evidence of a pipeline error. Worth stating precisely
which one it implicates.

**Rajmahal Traps Ti/Zr comparison:** this basalt plausibly comes from
the real, published Rajmahal Traps flood basalt formation directly
underlying this part of eastern India. Published fresh-basalt Ti/Zr
ratios sit in two known ranges (82–120 and 45–78). Observed soil Ti/Zr
here: **19.63–19.81, mean 19.74** — well below both. This divergence is
_expected_, not a red flag: soil Ti/Zr reflects a mix of parent rock plus
pre-existing soil matrix, not pure fresh rock. A real, citable external
check almost nobody else would think to run.

**Steinour-constant equivalence (`literature_checks.py`):** the
published Lithos Carbon shorthand formula (`CO2 = 2.2×Ca + 3.62×Mg`)
disagreed with our full-precision implementation by 0.085% — fully
explained by the published constants being rounded to 2-3 significant
figures (exact values: 2.19611 and 3.62073). A good example of writing
a _tolerance-based_ equivalence check correctly instead of naively
asserting exact equality.

---

## Chapter 14: Robustness Checks — Building Process, Not Just Results

Three items built explicitly to demonstrate real-world methodology, even
knowing N=2 limits their standalone informativeness (`robustness_checks.py`).

**Bootstrap CI:** **[55.99, 58.78]** — narrower than the t-distribution
CI [39.63, 75.15]. This is NOT better precision. At N=2, a bootstrap
resample can only ever produce one of 3 distinct means (both draws =
58.78, both = 55.99, or one of each = 57.385) — it structurally cannot
express the possibility that the true population mean lies outside what
was observed. The t-distribution CI correctly can. Bootstrap becomes
trustworthy once N is large enough for resampling to genuinely explore
plausible variation — dozens of samples at minimum.

**Depth-convention toggle:** the assignment specifies 30cm depth /
2600 t/ha; the real Isometric protocol uses 20cm. Pure linear
multiplier — confirmed numerically at exactly **0.667 (=2/3)** for both
pairs. 20cm-equivalent values: 37.32 and 39.19 t/ha. Real-world stakes:
using the wrong convention overstates every credited tonne by 50%.

**Charge-balance audit:** Ca contributes 53–55%, Mg 45–47% of total CDR
across both pairs — a chemically coherent split (both plagioclase/Ca and
pyroxene-olivine/Mg phases contributing), not a single-mineral artifact.
Cheap to run continuously at scale as an ongoing monitoring signal.

---

## Chapter 15: ML and Geospatial — Closing a Genuine Role-Fit Gap

Partway through, we recognized the build was strong on statistics and
geochemistry but had almost no actual ML content, despite the role
title. Two real techniques added (`src/erw/ml/`), both honestly scoped.

**GP/kriging baseline interpolation (`geospatial_ml.py`):** instead of
nearest-neighbor pairing, model the baseline field as spatially
correlated and interpolate an expected value with genuine uncertainty
at each monitoring location. With only 2 clean baselines, we demonstrated
BOTH sides of this deliberately: a stated (assumed) length scale gives
sensible, spatially-differentiated predictions (16605.4±174.5 and
16660.5±155.7). Letting the optimizer _estimate_ the length scale from
just 2 points collapses it toward zero — the model can't distinguish
short-range from long-range correlation with so little data, so it
degenerates to "ignore space entirely, report the mean." Reproduced
independently on two different machines (different sklearn/BLAS
builds) — same qualitative collapse, different exact numbers, itself
evidence of understanding numerical optimizer non-determinism rather
than a bug.

**Isolation Forest (`anomaly_detection.py`):** compared against
median/MAD directly. `contamination='auto'` is seed-unstable (43/50
seeds correctly flag only MON-003; 7/50 also falsely flag BL-002).
`contamination=1/7` is stable (50/50) but requires knowing the answer in
advance — which defeats the point of unsupervised detection. Reproduced
bit-for-bit identically on two machines. Median/MAD (robust z=96.45 for
MON-003, nothing else even close) remains the more defensible choice on
this small dataset — but IF is the right architecture at 5,000 samples
where outliers aren't visually obvious. Building the sophisticated tool
_and_ arguing against using it here is a stronger signal than either alone.

---

## Chapter 16: Metadata↔Geochemistry Consistency — A Second Self-Correction

`consistency_checks.py` builds a robust class centroid (median Ca) for
each of the four declared classes (treatment-baseline, treatment-
monitoring, control-baseline, control-monitoring), then checks whether
each sample's chemistry sits closest to its own declared class.

**The correction:** we had claimed this check would catch `BL-006`
"through a different channel than the date check." Running it proved
the opposite — BL-006's Ca (16,700) sits only 50 ppm from the
treatment-baseline centroid, the closest of all four classes, correctly
matching its declared label. **BL-006 is chemically indistinguishable
from a genuine treatment baseline.** This sharpened rather than
weakened the forensic picture: the anomaly is narrowly located in
_metadata_ (the date field, missing collector, duplicate coordinates),
not smeared into the chemistry — a more precise diagnosis than
originally claimed.

**Ratio-vs-magnitude decomposition:** a Ti anproportionally, so inter-element ratios stay intact (recoverable by
renormalization). Foreign material changes the ratios themselves
(unrecoverable). `GNG-MON-003` flags **both** magnitude (z=96.45) and
ratio (z=−108.22) — a clean "foreign material" diagnosis, consistent
with its 5.9km spatial displacement being a genuinely mis-located sample.

---

## Chapter 17: The Test Suite

15 tests total, two different kinds:

**Example-based** (`test_chemistry.py`, `test_pairing.py`,
`test_validation.py`, `test_quality.py`): specific known cases, good for
regression — locking in the exact 8-issue Part 1 result, the four
validation gates, the MON-004-style pairing conflict.

**Property-based** (`test_chemistry_properties.py`, using `hypothesis`):
general rules that must hold for ANY valid input, tested against
hundreds of randomly-generated cases, not hand-picked examples. Three
properties: uniform scaling (scale all six inputs by k → output scales
by k, verified algebraically first), the generalized zero-Ti-llapse, and monotonicity in Ca_mon.

All 15 pass, independently reproduced on two machines.

---

## Chapter 18: The Digital Twin — The Correctness Proof

Everything up to this point proves the pipeline behaves _sensibly_ on
the data we were given. This chapter proves it behaves _correctly_ in
general.

**The method (`digital_twin.py`):** pick a known true CDR ourselves.
Generate synthetic baseline concentrations using a Gaussian Process
prior (spatially correlated, not independent noise) across several
anchor locations. Invert the formula to compute exactly what Ca/Mg
enrichment would produce the chosen true CDR. Add realistic measurement
noise. Run the REAL pairing and chemistry code (not stubs) against the
noisy result. Check whether the reported 95% CI actually contains the
true value. Repeat 300 times with fresh random noise each time.

**Result: coverage of 95.0% at N=2 (exactly matching the real project's
sample size), 96.0% at N=5, 94.7% at N=8** — all within 1.3 percentage
points of the 95% nominal target. This is the single strongest
correctness evidence in the whole repo: it validates that the
t-distribution CI implementation is properly calibrated, specifically in
the exact small-N regime the real project sits in. Reproduced
bit-for-bit identically on two machines (deterministic seeded RNG) —
even the single-deployment sanity check matched to the decimal.

---

## Chapter 19: Infrastructure — Provenance, Schemas, and a Map Bug We Caught by Looking at It

**Provenance ledger (`provenance.py`):** machine-readable JSON record per
pair — rule, threshold, measured value, result, config hash, timestamp.
A registry auditor cannot verify a console printout; they need to
reproduce your decisions independently.

**Schema contracts (`schemas.py`):** pydantic validation at load time —
catches a malformed row immediately with a specific error, rather than
letting it silently produce NaN that propagates invisibly through
downstream logic.

**Map visualization — the bug:** the first version plotted every
sample, including `GNG-BL-005` at its invalid (0,0) GPS. Matplotlib
auto-scales axes to fit every point, so one point at Null Island forced
the whole plot to zoom out so far that all 11 real points collapsed into
an unreadable smear in one corner. The fix: exclude invalid-GPS samples
from the spatial plot entirely (list them in the title instead), and
offset overlapping labels for genuinely co-located points. The corrected
map properly shows the real ~40m × 40m footprint of the paddy, with
`MON-003` visibly isolated in the upper-right (confirming why it failed
the 500m spatial gate) and the coordinate-collision cluster
(BL-001/BL-006/MON-004) visibly stacked at bottom-left.

---

## Chapter 20: Restructuring

27 modules sitting flat in one folder read as clutter, even though each
one was individually justified. Restructured into four subpackages by
concern: `core/` (the 8 modules the base assignment needs), `extensions/`
(13 statistical/geochemical modules), `ml/` (3 geospatial-ML modules),
`infra/` (3 MRV-infrastructure modules). Verified zero regressions: all
15 tests pass, all 27 modules import cleanly, and every headline number
reproduces exactly after the move.

---

## Chapter 21: The Final Answer

Putting every chapter together:

**Part 1:** 8 issues, 5 root causes, zero false flags.

**Part 2:** Treatment = 57.39 t CO₂/ha (2/3 valid pairs). Control =
17.89 t CO₂/ha (flagged, non-trivially non-zero).

**The synthesis:** net CDR after formal counterfactual subtraction =
39.49 t/ha, but its 95% CI [-104.06, 183.05] crosses zero. Welch's
t-test agrees (p=0.0857, not significant). MDE (44.95) exceeds the
observed effect (39.49) — explaining, not contradicting, the
non-significant result. Combined uncertainty (19.2%) fails the 5%
materiality threshold. Monte Carlo sensitivity shows Ti's own noise
dominates the amplification (4.84x). Si stoichiometry (ratio ~2.45)
independently suggests a non-silicate Ca/Mg contribution. Lab-batch
drift was tested and weakened as a cause; seasonal/hydrological mismatch
is the leading remaining candidate.

**Four to five independent methods, from completely different angles —
a confidence interval, a hypothesis test, a power calculation, a
materiality check, and an independent chemistry test — all converge on
the same conclusion: this project, as measured, cannot currently support
a crediting decision.** Not because the pipeline is wrong — the digital
twin proves the math is correctly calibrated — but because N=2 is
genuinely insufficient against the observed noise, and the control
signal indicates a real, still-investigated confound.

---

## Appendix A: Decisions Index

Quick lookup — full reasoning for each lives in the chapter noted.

| #   | Decision                                                                 | Chapter |
| --- | ------------------------------------------------------------------------ | ------- |
| D1  | Outer join, not inner, for samples<->lab_results                         | Ch. 1   |
| D2  | Ti as tracer; only its _stability_ matters, not magnitude                | Ch. 0   |
| D3  | missing_barcode and orphan_lab_result are different categories           | Ch. 2   |
| D4  | Pre-filter unusable samples BEFORE pairing (1 vs 2 valid pairs)          | Ch. 3   |
| D5  | t-distribution CI, not normal/z                                          | Ch. 5   |
| D6  | Control CDR (17.89) is non-trivially non-zero; net CI crosses zero       | Ch. 6-7 |
| D7  | 2600 t/ha soil mass is an assumption; confirmed depth-toggle ratio=0.667 | Ch. 14  |
| D8  | Welch's t-test, not Student's (variances differ 8x)                      | Ch. 8   |
| D9  | MDE needs POOLED std across both groups, not one alone (bug found+fixed) | Ch. 8   |
| D10 | Si stoichiometry as independent plausibility check (ratio ~2.45)         | Ch. 11  |
| D11 | Multiverse: threshold/tracer robust, ordering is the real lever          | Ch. 12  |
| D12 | Bootstrap/depth/charge-balance built for process, not headline results   | Ch. 14  |
| D13 | GP/kriging + Isolation Forest built for explicit ML role-fit             | Ch. 15  |
| D14 | Digital-twin coverage validation is the correctness proof                | Ch. 18  |
| D15 | Repo restructured into core/extensions/ml/infra                          | Ch. 20  |

## Appendix B: Extensions Status

**Built and verified**

| Area                                                             | Module(s)                        | Chapter |
| ---------------------------------------------------------------- | -------------------------------- | ------- |
| Counterfactual subtraction                                       | extensions/counterfactual.py     | Ch. 7   |
| Significance testing + MDE                                       | extensions/significance.py       | Ch. 8   |
| Monte Carlo / gradient sensitivity, materiality                  | extensions/sensitivity.py        | Ch. 9   |
| Lab-batch forensics                                              | extensions/forensics.py          | Ch. 10  |
| Si stoichiometric closure                                        | extensions/stoichiometry.py      | Ch. 11  |
| Specification-curve / multiverse                                 | extensions/multiverse.py         | Ch. 12  |
| Feedstock rate + Rajmahal Ti/Zr                                  | extensions/plausibility.py       | Ch. 13  |
| Steinour check, coordinate/GPS/barcode checks                    | extensions/literature_checks.py  | Ch. 13  |
| Bootstrap, depth toggle, charge-balance                          | extensions/robustness_checks.py  | Ch. 14  |
| Robust median/MAD QC                                             | extensions/robust_qc.py          | Ch. 15  |
| Hungarian pairing                                                | extensions/pairing_hungarian.py  | Ch. 3   |
| Combined geo+geochemical distance                                | extensions/combined_distance.py  | Ch. 3   |
| Metadata-geochemistry consistency, ratio/magnitude decomposition | extensions/consistency_checks.py | Ch. 16  |
| GP/kriging baseline interpolation                                | ml/geospatial_ml.py              | Ch. 15  |
| Isolation Forest                                                 | ml/anomaly_detection.py          | Ch. 15  |
| Digital-twin coverage validation                                 | ml/digital_twin.py               | Ch. 18  |
| Provenance ledger                                                | infra/provenance.py              | Ch. 19  |
| Schema contracts                                                 | infra/schemas.py                 | Ch. 19  |
| Map visualization                                                | infra/mapping.py                 | Ch. 19  |
| Full test suite (15 tests, incl. property-based)                 | tests/                           | Ch. 17  |

**Described-only** (cannot run on this synthetic dataset)

| Extension                             | Why it can't run here                             | Reference                       |
| ------------------------------------- | ------------------------------------------------- | ------------------------------- |
| Bayesian hierarchical model (PyMC)    | Needs N>2 pairs to fit between-pair variance      | PART3_THINKING.md Q5            |
| Sentinel-2 NDVI corroboration         | No real imagery exists for fabricated coordinates | —                               |
| Cation exchange / sorption correction | Needs measured CEC, not in this schema            | —                               |
| Secondary carbonate formation         | Needs isotopic/carbonate-content data             | Ch. 11 (connects to Si finding) |
| Riverine/marine loss fraction         | Needs catchment-scale hydrological modeling       | —                               |

## Chapter 15.5: On Deep Learning, Specifically

Deliberately not used here, and worth stating why rather than leaving it
as an obvious gap. With N=12 total samples, any neural network — even a
tiny one — would have no way to generalize; it would either fail to
train meaningfully or memorize the 12 points outright. Reaching for deep
learning at this scale would signal not understanding when a technique
fits the data, which matters more than reaching for the most sophisticated
tool available.

**Where it genuinely would fit, at real project scale:** the described
Sentinel-2 NDVI corroboration extension (see Appendix B) is the natural
home for it. At a real deployment — thousands of samples, multi-year
satellite time series, multiple projects — a CNN or vision transformer
processing raw Sentinel-2 imagery (rather than a pre-computed NDVI index)
could detect vegetation-health patterns correlated with weathering
activity that a hand-engineered index might miss: subtle spectral
signatures in specific bands, spatial patterns in canopy structure, or
temporal dynamics across a full growing season. This is a concrete,
specific extension of the ML work here, not a vague gesture at "using
deep learning somewhere" — it requires real satellite data this synthetic
project doesn't have, which is exactly why it's catalogued as
described-only rather than attempted with 12 rows.
That is the whole story, tiniest detail to final conclusion.
