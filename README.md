# Ganga MRV

A complete, verified MRV (Measurement, Reporting, Verification) pipeline
for Enhanced Rock Weathering carbon removal — built for a take-home
assignment, on a synthetic 12-sample dataset ("Project Ganga").

**→ [Read the full story](BOOK.md)** — every decision, test, and finding, chapter by chapter
**→ [Part 3 written answers](PART3_THINKING.md)** — the assignment's required thinking section
**→ [Live site](https://site-eight-khaki-34.vercel.app)** — a walkthrough of the whole project

---

## The 30-second version

Given soil chemistry before and after rock was spread on a field, does
the data support a carbon-removal credit? Six required data-quality
checks, a full pairing → validation → CDR pipeline, and then a
deliberate push past the assignment: 27 modules covering statistical
rigor, geochemistry, geospatial ML, and infrastructure — because proving
a number is real takes more than one formula.

**Treatment CDR: 57.39 t CO₂/ha.** **Control CDR: 17.89 t CO₂/ha** (expected
~0). **Net after counterfactual subtraction: 39.49 t/ha — but the 95% CI
crosses zero.** Four independent methods (a confidence interval, Welch's
t-test, a minimum-detectable-effect analysis, and a materiality check)
all agree: **this project, as measured, cannot currently support a
crediting decision** — not because the pipeline is wrong (a digital-twin
correctness proof confirms 95.0% CI calibration at N=2), but because two
samples per group is genuinely insufficient against the observed noise.

Full reasoning: [BOOK.md](BOOK.md).

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Running everything

```bash
PYTHONPATH=src python3 -m pytest tests/ -v            # 15 tests, all passing

PYTHONPATH=src python3 scripts/run_quality.py          # Part 1
PYTHONPATH=src python3 scripts/run_pipeline.py          # Part 2 + counterfactual + significance
PYTHONPATH=src python3 scripts/run_extensions.py        # Si stoichiometry, forensics, multiverse
PYTHONPATH=src python3 scripts/run_ml.py                # GP kriging + Isolation Forest
PYTHONPATH=src python3 scripts/run_digital_twin.py      # coverage validation
```

## Where the assignment's requirements live

| Requirement                      | File(s)                                                       |
| -------------------------------- | ------------------------------------------------------------- |
| Part 1 — Data quality (20%)      | `src/erw/core/quality.py`, `tests/test_quality.py`            |
| Part 2 — CDR pipeline (50%)      | `src/erw/core/{pairing,validation,chemistry,stats}.py`        |
| Part 3 — Thinking (30%)          | [`PART3_THINKING.md`](PART3_THINKING.md)                      |
| Everything beyond the assignment | [`BOOK.md`](BOOK.md) — chapters 7 onward, plus the appendices |

## Layout

data/raw/ the two source CSVs, unmodified
src/erw/core/ foundation — everything Parts 1-2 require
src/erw/extensions/ statistical + geochemical extensions
src/erw/ml/ geospatial ML (GP/kriging, Isolation Forest, digital twin)
src/erw/infra/ provenance ledger, schema contracts, map
scripts/ named entry points, one per major result
tests/ 15 passing tests, pytest + hypothesis property tests
outputs/ generated artifacts (sample map, provenance ledger)
site/ the deployed project page (Next.js)

## Status: complete

Every item planned at the start is either built and verified, or
deliberately left as a precisely-described extension with a stated
reason — see the appendices in [BOOK.md](BOOK.md).

---

_This repository is private and shared with the reviewer only, per the
assignment's confidentiality instructions._
