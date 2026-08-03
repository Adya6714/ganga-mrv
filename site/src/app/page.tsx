import React from 'react'

const REPO = 'https://github.com/Adya6714/ganga-mrv'

/* ─────────────────────────── CI CHART SVG ─────────────────────────── */
function CIChart() {
  // Domain: treatment=57.39, control=17.89, net=39.49
  // Net CI: [-104.06, 183.05]
  // We render a horizontal number line from -120 to +200
  const svgW = 620
  const svgH = 130
  const padL = 30
  const padR = 30
  const axisY = 82
  const trackY = 56

  const domMin = -120
  const domMax = 200
  const scale = (v: number) => padL + ((v - domMin) / (domMax - domMin)) * (svgW - padL - padR)

  const zero = scale(0)
  const ciLo = scale(-104.06)
  const ciHi = scale(183.05)
  const point = scale(39.49)

  const ticks = [-100, -50, 0, 50, 100, 150]

  return (
    <div className="ci-chart-wrap">
      <div className="ci-chart-title">Net CDR — 95% confidence interval</div>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        aria-label="Net CDR 95% confidence interval chart showing CI from -104.06 to 183.05 t CO₂/ha, crossing zero"
        role="img"
      >
        {/* track */}
        <line x1={padL} y1={trackY} x2={svgW - padR} y2={trackY} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />

        {/* zero line */}
        <line x1={zero} y1={trackY - 20} x2={zero} y2={axisY + 4} stroke="#e3e33d" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={zero} y={axisY + 14} textAnchor="middle" fill="#e3e33d" fontSize={10} fontFamily="inherit">0</text>

        {/* CI range bar */}
        <rect x={ciLo} y={trackY - 8} width={ciHi - ciLo} height={16} rx={4} fill="rgba(124,76,255,0.25)" stroke="rgba(124,76,255,0.6)" strokeWidth={1} />

        {/* CI end caps */}
        <line x1={ciLo} y1={trackY - 14} x2={ciLo} y2={trackY + 14} stroke="#7c4cff" strokeWidth={2} />
        <line x1={ciHi} y1={trackY - 14} x2={ciHi} y2={trackY + 14} stroke="#7c4cff" strokeWidth={2} />

        {/* point estimate */}
        <circle cx={point} cy={trackY} r={6} fill="#0fd9c0" stroke="#061717" strokeWidth={2} />

        {/* labels */}
        <text x={ciLo} y={trackY - 18} textAnchor="middle" fill="rgba(242,247,238,0.55)" fontSize={9} fontFamily="inherit">−104.06</text>
        <text x={ciHi} y={trackY - 18} textAnchor="middle" fill="rgba(242,247,238,0.55)" fontSize={9} fontFamily="inherit">183.05</text>
        <text x={point} y={trackY - 18} textAnchor="middle" fill="#0fd9c0" fontSize={10} fontFamily="inherit" fontWeight="bold">39.49</text>

        {/* axis ticks */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={scale(t)} y1={axisY} x2={scale(t)} y2={axisY + 5} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            <text x={scale(t)} y={axisY + 16} textAnchor="middle" fill="rgba(242,247,238,0.35)" fontSize={9} fontFamily="inherit">{t}</text>
          </g>
        ))}

        {/* x-axis unit */}
        <text x={svgW - padR} y={axisY + 16} textAnchor="end" fill="rgba(242,247,238,0.3)" fontSize={8} fontFamily="inherit">t CO₂/ha</text>

        {/* legend */}
        <circle cx={padL + 8} cy={svgH - 14} r={5} fill="#0fd9c0" />
        <text x={padL + 18} y={svgH - 10} fill="rgba(242,247,238,0.55)" fontSize={9} fontFamily="inherit">Point estimate (39.49)</text>
        <rect x={padL + 130} y={svgH - 19} width={14} height={10} rx={2} fill="rgba(124,76,255,0.35)" stroke="rgba(124,76,255,0.6)" strokeWidth={1} />
        <text x={padL + 150} y={svgH - 10} fill="rgba(242,247,238,0.55)" fontSize={9} fontFamily="inherit">95% CI (crosses zero)</text>
        <line x1={padL + 278} y1={svgH - 14} x2={padL + 292} y2={svgH - 14} stroke="#e3e33d" strokeWidth={1.5} strokeDasharray="3 2" />
        <text x={padL + 296} y={svgH - 10} fill="#e3e33d" fontSize={9} fontFamily="inherit">Zero</text>
      </svg>
    </div>
  )
}

/* ─────────────────────────── NAV ─────────────────────────── */
function Nav() {
  return (
    <>
      <div className="announcement-bar">
        ERW MRV take-home assignment for{' '}
        <a href="https://altcarbon.com" target="_blank" rel="noopener noreferrer">Alt Carbon</a>
        {' '}· Full source on{' '}
        <a href={REPO} target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
      <nav className="nav">
        <div className="container">
          <span className="nav-brand">Project <span>Ganga</span></span>
          <ul className="nav-links">
            <li><a href="#part1">Part 1</a></li>
            <li><a href="#part2">Part 2</a></li>
            <li><a href="#finding">Finding</a></li>
            <li><a href="#extensions">Extensions</a></li>
            <li><a href="#twin">Digital Twin</a></li>
            <li><a href={REPO} target="_blank" rel="noopener noreferrer" className="nav-cta">GitHub ↗</a></li>
          </ul>
        </div>
      </nav>
    </>
  )
}

/* ─────────────────────────── HERO ─────────────────────────── */
function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <p className="hero-eyebrow">Enhanced Rock Weathering · MRV Pipeline · Project Ganga</p>
        <h1>
          Net CDR = 39.49 t CO₂/ha.<br />
          <em>But the 95% CI crosses zero.</em>
        </h1>
        <p className="hero-sub">
          A complete ERW measurement, reporting &amp; verification pipeline built for Alt Carbon.
          Four independent statistical methods converge on one honest answer.
        </p>
        <div className="hero-actions">
          <a href="#part1" className="btn-primary">Read the findings ↓</a>
          <a href={REPO} target="_blank" rel="noopener noreferrer" className="btn-outline">
            View source on GitHub ↗
          </a>
        </div>
        <CIChart />
      </div>
    </section>
  )
}

/* ─────────────────────────── ASK STRIP ─────────────────────────── */
function AskStrip() {
  return (
    <div className="ask-strip">
      <div className="container">
        <h2>The ask, before the answer</h2>
        <p>
          The original assignment brief defines the data format, formula, and all five guide questions.<br />
          Task.pdf is in the GitHub repo — read it first to understand what was built and why.
        </p>
        <a
          href={`${REPO}/blob/main/Task.pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ display: 'inline-flex', margin: '0 auto' }}
        >
          Read the original brief (Task.pdf) ↗
        </a>
      </div>
    </div>
  )
}

/* ─────────────────────────── PART 1 ─────────────────────────── */
function Part1() {
  const issues = [
    { id: 'GNG-BL-005', flags: ['Zeroed GPS (0,0)'], desc: '"Null Island" — always a sentinel for missing field data, never a real location.', badge: 'red' },
    { id: 'GNG-MON-004', flags: ['No barcode'], desc: 'No barcode recorded. Can never join to lab results; zero chance of producing a CDR value.', badge: 'red' },
    { id: 'GNG-BL-006', flags: ['Missing collector', 'Late baseline'], desc: 'Collected 2025-05-24, seven months after rock application on 2024-10-15. Contaminated — no longer a baseline.', badge: 'red' },
    { id: 'LB-25-5508', flags: ['Orphan lab result'], desc: 'Lab result with no matching sample record on either side of the join.', badge: 'yellow' },
    { id: 'GNG-MON-003', flags: ['5,920 m spatial outlier', '55% Ti deviation', 'Lab flagged'], desc: 'Failed three independent checks simultaneously. Likely a mis-located sample; confirmed by ratio/magnitude decomposition.', badge: 'red' },
  ]

  return (
    <section className="section section--white" id="part1">
      <div className="container">
        <div className="section-num">1</div>
        <p className="section-label">Part 1 · Data Quality</p>
        <h2>8 issues. 5 root causes. Zero false flags.</h2>
        <p style={{ marginTop: 16, color: 'var(--color-text-muted)' }}>
          Six automated checks in <code>quality.py</code>. Every issue is independently
          verified in <code>tests/test_quality.py</code> — a regression test that asserts
          exactly 8 issues, exactly these categories, and that control-plot samples
          are never flagged.
        </p>

        <div className="stat-row" style={{ marginTop: 32, marginBottom: 0 }}>
          {[
            { num: '8', label: 'Total issues found' },
            { num: '5', label: 'Root-cause samples' },
            { num: '0', label: 'False flags' },
            { num: '6', label: 'Automated checks' },
          ].map((s) => (
            <div className="stat-block stat-block--light" key={s.label}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <table className="issue-table" style={{ marginTop: 36 }}>
          <thead>
            <tr>
              <th>Sample / Record</th>
              <th>Flags</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((row) => (
              <tr key={row.id}>
                <td><code style={{ fontSize: '0.82rem' }}>{row.id}</code></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {row.flags.map((f) => (
                    <span key={f} className={`badge badge--${row.badge}`} style={{ marginRight: 4, marginBottom: 4, display: 'inline-block' }}>{f}</span>
                  ))}
                </td>
                <td style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          className="card"
          style={{ marginTop: 28, background: '#f0fdf4', borderColor: '#bbf7d0', borderLeft: '4px solid #16a34a' }}
        >
          <p style={{ fontSize: '0.875rem', color: '#15803d', maxWidth: 'none' }}>
            <strong>Zero false flags — explicitly verified.</strong> GNG-BL-005&rsquo;s date (2024-10-14)
            is <em>before</em> the application date (2024-10-15), so it correctly does NOT trigger
            the late-baseline rule. The test locks this boundary condition permanently.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── PART 2 ─────────────────────────── */
function Part2() {
  return (
    <section className="section" id="part2">
      <div className="container">
        <div className="section-num">2</div>
        <p className="section-label">Part 2 · CDR Pipeline</p>
        <h2>The two headline numbers — and why both matter.</h2>
        <p style={{ marginTop: 16, color: 'var(--color-text-muted)' }}>
          The required formula normalises Ca and Mg enrichment to titanium (an
          inert tracer) to cancel soil-mass variation between samples. Proven
          algebraically and via hundreds of randomised property-based tests
          (<code>hypothesis</code> library).
        </p>

        <div className="stat-row" style={{ marginTop: 36 }}>
          {[
            { num: '57.39', label: 'Treatment CDR (t CO₂/ha)', sub: '2 of 3 attempted pairs valid', accent: 'var(--color-primary)' },
            { num: '17.89', label: 'Control CDR (t CO₂/ha)', sub: '2 of 2 valid — expected ~0', accent: '#dc2626' },
            { num: '39.49', label: 'Net CDR after counterfactual (t CO₂/ha)', sub: 'CI [−104.06, 183.05]', accent: 'var(--color-slate)' },
          ].map((s) => (
            <div className="stat-block stat-block--light" key={s.label}>
              <div className="stat-num" style={{ color: s.accent }}>{s.num}</div>
              <div className="stat-label">{s.label}</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 6, maxWidth: 'none' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="card-grid card-grid--2" style={{ marginTop: 32 }}>
          <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
            <div className="card-icon">⚠️</div>
            <h3>The control confound</h3>
            <p>
              Control CDR is <strong>17.89 t CO₂/ha — 31% the size of the treatment signal</strong> on
              land that received no rock. The Isometric protocol treats control CDR as the formal
              CO₂e_Counterfactual term, subtracted directly. After subtraction, variances
              add (<code>Var(net) = Var(treatment) + Var(control)</code>), widening the CI
              so it includes zero.
            </p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <div className="card-icon">🔬</div>
            <h3>A real pairing bug — found and fixed</h3>
            <p>
              Naive pairing (GPS first, validate after) let <code>GNG-MON-004</code> — which has
              no barcode and can never produce a CDR value — claim <code>GNG-BL-001</code> at 0 m,
              pushing <code>GNG-MON-002</code> onto the late-baseline <code>GNG-BL-006</code>.
              Result: <strong>1 valid treatment pair</strong> instead of 2. Pre-filtering unusable
              samples before pairing recovered the second pair — a 100% difference from a single
              ordering decision.
            </p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
            <div className="card-icon">📐</div>
            <h3>Ti as tracer — the denominator problem</h3>
            <p>
              Monte Carlo sensitivity (20,000 trials, 3% ICP-OES noise):
              input noise amplifies <strong>4.84× to 14.5% output noise</strong>.
              Ti_bl and Ti_mon have sensitivity ratios of ±2.55× — larger than
              Ca_mon&rsquo;s 2.17×. The tracer meant to stabilise the measurement is
              itself the largest source of amplified uncertainty.
            </p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #0891b2' }}>
            <div className="card-icon">🧪</div>
            <h3>Si stoichiometry — an independent chemical signal</h3>
            <p>
              Si is present in the data but unused by the required formula.
              (Ca+Mg)/Si molar ratio across both valid treatment pairs:
              <strong> 2.46 and 2.44</strong> — above the ~0.5–1.5 range for
              basaltic silicate dissolution. Points toward a non-silicate Ca/Mg
              source (agricultural lime or pre-existing soil carbonate), which
              releases Ca with zero accompanying Si.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── CONVERGENT FINDING ─────────────────────────── */
function Finding() {
  return (
    <section className="section section--dark" id="finding">
      <div className="container">
        <div className="section-num">3</div>
        <p className="section-label">The Convergent Finding</p>
        <h2 style={{ color: '#fff' }}>
          Four independent methods.<br />One honest conclusion.
        </h2>
        <p style={{ marginTop: 16, color: 'rgba(242,247,238,0.7)', marginBottom: 0 }}>
          Not because the pipeline is wrong — the digital twin proves the math is correctly
          calibrated — but because N=2 is genuinely insufficient against the observed noise,
          and the control signal indicates a real, still-investigated confound.
        </p>

        <div className="convergence-grid">
          <div className="convergence-item">
            <div className="method-name">95% Confidence Interval</div>
            <div className="method-result">[−104.06, 183.05]</div>
            <p>
              Propagating independent variances through counterfactual subtraction
              (Var(net) = Var(treatment) + Var(control)) produces a CI that
              includes zero. Uses the t-distribution at df=1 — the mathematically
              correct choice at N=2. The 12.7× multiplier (vs. 1.96 for z)
              is not a bug; it correctly refuses to pretend two points can
              pin down a population mean.
            </p>
          </div>
          <div className="convergence-item">
            <div className="method-name">Welch&rsquo;s t-test</div>
            <div className="method-result">p = 0.0857</div>
            <p>
              Treatment vs. control, not significant at α=0.05. Welch&rsquo;s
              (not Student&rsquo;s) because treatment std (1.98) and control std
              (15.85) differ 8×. The one-sample t-test gives p=0.0078, but
              that is the <em>wrong</em> test — it ignores the control confound
              entirely and answers "is there any enrichment at all," not
              "is there enrichment beyond what an untreated plot also shows."
            </p>
          </div>
          <div className="convergence-item">
            <div className="method-name">Minimum Detectable Effect</div>
            <div className="method-result">44.95 t/ha</div>
            <p>
              Exceeds the observed net effect of 39.49 t/ha — explaining, not
              contradicting, the non-significant result. Calculated using
              pooled std across both groups (not treatment alone — a bug
              found and fixed by cross-checking two independently computed
              results against each other). Pooled std = 11.30 t/ha; control&rsquo;s
              15.85 dominates because it is 8× larger.
            </p>
          </div>
          <div className="convergence-item">
            <div className="method-name">Materiality</div>
            <div className="method-result">19.2% &gt; 5%</div>
            <p>
              Combined chemistry + soil-mass uncertainty via Monte Carlo.
              Fails the real Isometric protocol&rsquo;s 5% materiality threshold
              by a wide margin. A fourth independent line of evidence
              converging on the same conclusion from a completely different
              angle — this one from measurement uncertainty, not statistical power.
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: 36,
            padding: '24px 28px',
            background: 'rgba(227,227,61,0.08)',
            border: '1px solid rgba(227,227,61,0.25)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          <p style={{ color: 'rgba(242,247,238,0.85)', maxWidth: 'none', fontSize: '1rem' }}>
            <strong style={{ color: '#e3e33d' }}>The honest conclusion:</strong>{' '}
            This project, as measured, <strong>cannot currently support a crediting decision.</strong>{' '}
            The pipeline is correct (the digital twin confirms it). The problem is the data: N=2
            valid pairs against a noise level that requires ~395 pairs per group for 80% power at
            a realistic 2 t CO₂/ha effect, plus a real confound in the control plot whose leading
            cause (seasonal/hydrological mismatch between October post-monsoon baselines and May
            pre-monsoon monitoring) points to a protocol fix, not a code fix.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── EXTENSIONS ─────────────────────────── */
function Extensions() {
  const groups = [
    {
      label: 'Core (Parts 1–2)',
      items: [
        { icon: '📍', name: 'geo.py — Haversine distance', desc: 'Lat/lon with cos(latitude) correction; 1° lon ≈ 102 km at 23.45°N' },
        { icon: '🔗', name: 'io.py — Outer join', desc: 'Keeps all rows with indicator=True; catches both orphan directions' },
        { icon: '⚗️', name: 'chemistry.py — CDR formula', desc: 'Ti-normalised Ca+Mg enrichment; pure functions, zero I/O' },
        { icon: '🔍', name: 'quality.py — 6 automated checks', desc: 'Missing fields, orphans, baseline timing, spatial, tracer, lab status' },
        { icon: '🗺️', name: 'pairing.py — Greedy pairing', desc: 'Sorts all candidates by distance; closer pair always wins' },
        { icon: '✅', name: 'validation.py — 4 gates', desc: 'Pair-specific Ti deviation, baseline timing, lab status, plot type' },
        { icon: '📊', name: 'stats.py — t-distribution CI', desc: 'df=1 at N=2; ~12.7× multiplier vs 1.96 for z-interval' },
      ],
    },
    {
      label: 'Statistical & Geochemical Extensions',
      items: [
        { icon: '➖', name: 'counterfactual.py', desc: 'Formal Isometric counterfactual subtraction with variance propagation' },
        { icon: '📈', name: 'significance.py', desc: "Welch's t-test + MDE with pooled std (bug found and fixed)" },
        { icon: '🎲', name: 'sensitivity.py', desc: '20,000 Monte Carlo trials; 4.84× amplification; materiality 19.2%' },
        { icon: '🔬', name: 'forensics.py', desc: 'Lab-batch drift test; cross-batch natural experiment (N=1); <1% deviation' },
        { icon: '⚖️', name: 'stoichiometry.py', desc: '(Ca+Mg)/Si molar ratio ~2.45; non-silicate Ca/Mg source flag' },
        { icon: '🌐', name: 'multiverse.py', desc: '12 specs: ordering × threshold × tracer; CDR range only 57.39–59.06 (~3%)' },
        { icon: '📚', name: 'plausibility.py', desc: 'Implied feedstock rate 191–287 t/ha (5–8× field norms); Rajmahal Ti/Zr check' },
        { icon: '📖', name: 'literature_checks.py', desc: 'Steinour constant equivalence at 0.085% (explained by rounding)' },
        { icon: '🔄', name: 'robustness_checks.py', desc: 'Bootstrap CI, depth toggle (ratio=0.667), charge-balance audit' },
        { icon: '📐', name: 'robust_qc.py', desc: 'Median/MAD QC; robust z=96.45 for MON-003; stable vs IF' },
        { icon: '🇭', name: 'pairing_hungarian.py', desc: 'Hungarian-algorithm global optimum pairing as comparison' },
        { icon: '📏', name: 'combined_distance.py', desc: 'GPS + Mahalanobis(Ti,Zr) combined distance metric' },
        { icon: '🔎', name: 'consistency_checks.py', desc: 'Metadata-geochemistry class centroids; ratio vs magnitude decomposition' },
      ],
    },
    {
      label: 'ML & Geospatial',
      items: [
        { icon: '🗺️', name: 'geospatial_ml.py — GP/Kriging', desc: 'GP baseline interpolation; demonstrates optimizer collapse at N=2 (expected)' },
        { icon: '🌲', name: 'anomaly_detection.py — Isolation Forest', desc: "Seed-unstable at contamination='auto'; median/MAD more defensible at N<50" },
        { icon: '🤖', name: 'digital_twin.py', desc: '300-trial coverage validation; 95.0% CI calibration at N=2 (see §5)' },
      ],
    },
    {
      label: 'MRV Infrastructure',
      items: [
        { icon: '📋', name: 'provenance.py', desc: 'Machine-readable JSON per pair: rule, threshold, measured value, config hash' },
        { icon: '🛡️', name: 'schemas.py', desc: 'Pydantic validation at load time; catches malformed rows before NaN propagates' },
        { icon: '🗺️', name: 'mapping.py', desc: 'Spatial plot; excluded invalid GPS (fixed Null-Island zoom-out bug)' },
      ],
    },
    {
      label: 'Test Suite',
      items: [
        { icon: '✅', name: '15 tests, all passing', desc: '5 example-based regression tests + property-based (hypothesis library)' },
        { icon: '🎯', name: 'Property-based tests', desc: 'Uniform scaling, generalised Ti-collapse, monotonicity — hundreds of random cases' },
        { icon: '🔁', name: 'Reproduced on two machines', desc: 'All 15 pass; deterministic tests match bit-for-bit on different sklearn/BLAS builds' },
      ],
    },
  ]

  return (
    <section className="section section--darker" id="extensions">
      <div className="container">
        <div className="section-num">4</div>
        <p className="section-label">Extensions</p>
        <h2 style={{ color: '#fff' }}>27 modules. Every one justified.</h2>
        <p style={{ marginTop: 16, color: 'rgba(242,247,238,0.7)', marginBottom: 0 }}>
          Restructured into four subpackages by concern — <code>core/</code>, <code>extensions/</code>,{' '}
          <code>ml/</code>, <code>infra/</code> — after verifying zero regressions across all 15 tests.
          See{' '}
          <a href={`${REPO}/blob/main/BOOK.md#appendix-b-extensions-status`} target="_blank" rel="noopener noreferrer">BOOK.md Appendix B</a>{' '}
          for the full catalogue including described-only items (Bayesian hierarchical model,
          Sentinel-2 NDVI, CEC correction) with stated reasons they cannot run on this dataset.
        </p>

        {groups.map((g) => (
          <div className="ext-group" key={g.label}>
            <div className="ext-group-title">{g.label}</div>
            <div className="ext-list">
              {g.items.map((item) => (
                <div className="ext-item" key={item.name}>
                  <div className="ext-item-icon">{item.icon}</div>
                  <div className="ext-item-text">
                    <strong>{item.name}</strong>
                    <span>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────── DIGITAL TWIN ─────────────────────────── */
function DigitalTwin() {
  return (
    <section className="section section--dark" id="twin">
      <div className="container">
        <div className="section-num">5</div>
        <p className="section-label">Digital Twin · Correctness Proof</p>
        <h2 style={{ color: '#fff' }}>The pipeline is correct. The data is the problem.</h2>
        <p style={{ marginTop: 16, color: 'rgba(242,247,238,0.7)' }}>
          <code>ml/digital_twin.py</code>: pick a known true CDR, generate synthetic
          baseline concentrations via a Gaussian Process prior (spatially correlated,
          not independent noise), invert the formula to compute exactly what enrichment
          would produce that CDR, add realistic measurement noise, run the <em>real</em>{' '}
          pairing and chemistry code against the noisy result, check whether the reported
          95% CI actually contains the true value. Repeat 300 times with fresh random noise.
        </p>

        <div className="twin-result">
          {[
            { num: '95.0%', label: 'Coverage at N=2 (real project size)', note: '±0% from 95% target' },
            { num: '96.0%', label: 'Coverage at N=5', note: '+1.0pp from target' },
            { num: '94.7%', label: 'Coverage at N=8', note: '−0.3pp from target' },
            { num: '300', label: 'Monte Carlo trials per N', note: 'Seeded RNG — deterministic' },
          ].map((item) => (
            <div key={item.label} style={{ padding: '20px 0' }}>
              <div className="twin-num">{item.num}</div>
              <div className="twin-label">{item.label}</div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(242,247,238,0.45)', marginTop: 6, maxWidth: 'none' }}>{item.note}</p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 32,
            padding: '24px 28px',
            background: 'rgba(15,217,192,0.07)',
            border: '1px solid rgba(15,217,192,0.2)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          <p style={{ color: 'rgba(242,247,238,0.85)', maxWidth: 'none' }}>
            <strong style={{ color: '#0fd9c0' }}>Why this matters:</strong>{' '}
            All 15 unit tests prove the pipeline behaves sensibly on the data it was given.
            The digital twin proves it behaves <em>correctly in general</em> — specifically
            in the exact small-N regime the real project sits in. Coverage within 1.3 percentage
            points of the 95% target across all tested N. Reproduced bit-for-bit on two machines
            (deterministic seeded RNG). This is the strongest available correctness evidence in
            the repo.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── DECISIONS ─────────────────────────── */
function KeyDecisions() {
  const decisions = [
    { id: 'D1', text: 'Outer join (not inner) for samples↔lab_results — catches orphans on both sides' },
    { id: 'D4', text: 'Pre-filter unusable samples before pairing — recovered 1 additional valid pair (100% difference)' },
    { id: 'D5', text: 't-distribution CI, not z — at df=1 the multiplier is ~12.7 vs 1.96' },
    { id: 'D8', text: "Welch's t-test, not Student's — treatment/control std differ 8×" },
    { id: 'D9', text: 'MDE uses pooled std (bug found by cross-checking results against each other)' },
    { id: 'D10', text: 'Si stoichiometry as independent plausibility check — ratio ~2.45 flags non-silicate source' },
    { id: 'D11', text: 'Multiverse: threshold/tracer robust (~3%); pairing ordering is the real lever' },
    { id: 'D14', text: 'Digital-twin coverage validation is the correctness proof, not just "tests pass"' },
  ]

  return (
    <section className="section section--white">
      <div className="container">
        <p className="section-label" style={{ color: 'var(--color-primary)' }}>Key Decisions</p>
        <h2>Every judgment call is traceable.</h2>
        <p style={{ marginTop: 12, color: 'var(--color-text-muted)' }}>
          Full reasoning for each lives in{' '}
          <a href={`${REPO}/blob/main/BOOK.md#appendix-a-decisions-index`} target="_blank" rel="noopener noreferrer">BOOK.md Appendix A</a>{' '}
          (cross-referenced to the chapter where the decision was made and verified).
        </p>
        <div className="card-grid card-grid--2" style={{ marginTop: 32 }}>
          {decisions.map((d) => (
            <div className="card" key={d.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                  borderRadius: 6,
                  padding: '2px 9px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {d.id}
              </span>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: 'none' }}>{d.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── FOOTER ─────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">Project <span>Ganga</span></div>
            <p style={{ fontSize: '0.875rem', marginTop: 8, maxWidth: '36ch' }}>
              A complete ERW MRV pipeline built as a take-home assignment for Alt Carbon.
              All source code, data, tests, and documentation are on GitHub.
            </p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14, color: 'rgba(242,247,238,0.4)' }}>
              Source files
            </p>
            <ul className="footer-links">
              <li><a href={`${REPO}/blob/main/BOOK.md`} target="_blank" rel="noopener noreferrer">BOOK.md — full narrative</a></li>
              <li><a href={`${REPO}/blob/main/BOOK.md#appendix-a-decisions-index`} target="_blank" rel="noopener noreferrer">BOOK.md Appendix A — every judgment call</a></li>
              <li><a href={`${REPO}/blob/main/BOOK.md#appendix-b-extensions-status`} target="_blank" rel="noopener noreferrer">BOOK.md Appendix B — built vs described-only</a></li>
              <li><a href={`${REPO}/blob/main/PART3_THINKING.md`} target="_blank" rel="noopener noreferrer">PART3_THINKING.md — written answers</a></li>
              <li><a href={`${REPO}/blob/main/README.md#where-the-assignments-requirements-live`} target="_blank" rel="noopener noreferrer">README.md — requirement map</a></li>
              <li><a href={`${REPO}/tree/main/src/erw`} target="_blank" rel="noopener noreferrer">src/erw/ — all 27 modules</a></li>
              <li><a href={`${REPO}/tree/main/tests`} target="_blank" rel="noopener noreferrer">tests/ — 15 passing tests</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-copy">
          Built for Alt Carbon · Project Ganga · {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────── PAGE ─────────────────────────── */
export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <AskStrip />
        <Part1 />
        <Part2 />
        <Finding />
        <Extensions />
        <DigitalTwin />
        <KeyDecisions />
      </main>
      <Footer />
    </>
  )
}
