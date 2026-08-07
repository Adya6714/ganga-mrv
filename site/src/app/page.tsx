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
            <li><a href="#dashboard">Dashboard</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#part1">Part 1</a></li>
            <li><a href="#part2">Part 2</a></li>
            <li><a href="#finding">Finding</a></li>
            <li><a href="#confound">Confound</a></li>
            <li><a href="#research">Research</a></li>
            <li><a href="#extensions">Modules</a></li>
            <li><a href="#part3">Part 3</a></li>
            <li><a href="#decisions">Decisions</a></li>
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
          <a href="#how" className="btn-primary">Start with how it works ↓</a>
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

/* ─────────────────────────── DASHBOARD ─────────────────────────── */
function Dashboard() {
  const kpis = [
    { label: 'Treatment CDR', value: '57.39', unit: 't CO₂/ha', note: '2 of 3 attempted pairs valid', accent: 'var(--color-primary)' },
    { label: 'Control CDR', value: '17.89', unit: 't CO₂/ha', note: 'On land that received no rock — expected ~0', accent: '#dc2626' },
    { label: 'Net after counterfactual', value: '39.49', unit: 't CO₂/ha', note: '31.2% downward correction', accent: 'var(--color-teal-accent)' },
    { label: 'Welch p-value', value: '0.0857', unit: '', note: 'Not significant at α = 0.05', accent: '#d97706' },
    { label: 'Minimum detectable effect', value: '44.95', unit: 't CO₂/ha', note: 'Larger than the effect observed', accent: '#d97706' },
    { label: 'Combined uncertainty', value: '19.2', unit: '%', note: 'Against a 5% materiality threshold', accent: '#dc2626' },
    { label: 'CI coverage, digital twin', value: '95.0', unit: '%', note: 'At n=2 — the pipeline itself is calibrated', accent: 'var(--color-teal-accent)' },
    { label: 'Tests passing', value: '15', unit: '/ 15', note: 'Example-based plus property-based', accent: 'var(--color-teal-accent)' },
  ]

  const parts = [
    {
      weight: '20%',
      title: 'Part 1 — Data quality',
      body: 'All six required checks implemented in quality.py as independent functions. 8 issues across 5 root-cause records, zero false flags — including two negative assertions that lock the boundary cases permanently.',
      status: 'Complete',
    },
    {
      weight: '50%',
      title: 'Part 2 — CDR pipeline',
      body: 'All five steps, one module each: pairing, validation, chemistry, statistics, control comparison. All five traps planted in the data are caught, each with a reason string rather than a silent drop.',
      status: 'Complete',
    },
    {
      weight: '30%',
      title: 'Part 3 — Thinking',
      body: 'Every one of the five questions answered with code that was actually run: two alternative pairing algorithms, a 12-specification robustness curve, and a digital twin built rather than sketched.',
      status: 'Complete',
    },
  ]

  return (
    <section className="section section--dark" id="dashboard">
      <div className="container">
        <p className="section-label">Project dashboard</p>
        <h2 style={{ color: '#fff' }}>Every headline number, in one place.</h2>
        <p style={{ marginTop: 16, color: 'rgba(242,247,238,0.7)' }}>
          Each figure below is produced by running code in this repository — no number here
          was transcribed from notes. Appendix E of the book maps every one to the command
          that reproduces it.
        </p>

        <div className="kpi-grid">
          {kpis.map((k) => (
            <div className="kpi" key={k.label} style={{ borderTopColor: k.accent }}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">
                {k.value}
                {k.unit && <span className="kpi-unit">{k.unit}</span>}
              </div>
              <p className="kpi-note">{k.note}</p>
            </div>
          ))}
        </div>

        <div className="ext-group" style={{ marginTop: 56 }}>
          <div className="ext-group-title">The brief, and what was delivered against it</div>
          <div className="scorecard">
            {parts.map((p) => (
              <div className="scorecard-row" key={p.title}>
                <div className="scorecard-weight">
                  {p.weight}
                  <span>of grade</span>
                </div>
                <div>
                  <div className="scorecard-title">{p.title}</div>
                  <p>{p.body}</p>
                </div>
                <div className="scorecard-status">{p.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ext-group" style={{ marginTop: 48 }}>
          <div className="ext-group-title">How the repository is organized</div>
          <table className="issue-table issue-table--dark" style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th style={{ width: 190 }}>Package</th>
                <th style={{ width: 80 }}>Modules</th>
                <th>What lives there</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>src/erw/core/</code></td>
                <td>8</td>
                <td>Everything Parts 1 and 2 of the brief require. Runs standalone — nothing downstream is imported by it.</td>
              </tr>
              <tr>
                <td><code>src/erw/extensions/</code></td>
                <td>13</td>
                <td>The investigation. Each module answers one specific doubt about whether the required pipeline&rsquo;s number can be believed.</td>
              </tr>
              <tr>
                <td><code>src/erw/ml/</code></td>
                <td>3</td>
                <td>Gaussian-process kriging, Isolation Forest, and the digital-twin correctness proof.</td>
              </tr>
              <tr>
                <td><code>src/erw/infra/</code></td>
                <td>3</td>
                <td>Provenance ledger, Pydantic schema contracts, and the sample map — the parts an auditor would need.</td>
              </tr>
              <tr>
                <td><code>tests/</code></td>
                <td>15 tests</td>
                <td>Example-based regression tests plus property-based tests via <code>hypothesis</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── HOW IT WORKS ─────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      n: '01',
      name: 'Load & join',
      file: 'io.py',
      desc: 'Outer join on barcode with indicator=True, so unmatched rows on either side stay visible instead of being silently dropped.',
    },
    {
      n: '02',
      name: 'Quality checks',
      file: 'quality.py',
      desc: 'Six independent rules: missing fields, orphan records both directions, baseline timing, spatial outliers, tracer stability, lab status.',
    },
    {
      n: '03',
      name: 'Pair',
      file: 'pairing.py',
      desc: 'Every candidate pair sorted globally by Haversine distance, then claimed greedily — so the genuinely closest pair always locks in first.',
    },
    {
      n: '04',
      name: 'Validate',
      file: 'validation.py',
      desc: 'A second, independent filter: pair-specific Ti stability, baseline collected before application, neither sample lab-flagged.',
    },
    {
      n: '05',
      name: 'Compute CDR',
      file: 'chemistry.py',
      desc: 'Ti-normalised Ca and Mg enrichment → moles → CO₂ equivalents → tonnes per hectare. Pure functions, zero I/O.',
    },
    {
      n: '06',
      name: 'Summarise',
      file: 'stats.py',
      desc: 'Mean, sample std (ddof=1), and a 95% CI from the t-distribution — 12.71× at df=1, not 1.96.',
    },
  ]

  const glossary = [
    { term: 'CDR', def: 'Carbon Dioxide Removal — tonnes of CO₂ removed. Here it is inferred from soil chemistry, not measured as gas.' },
    { term: 'ha', def: 'Hectare: 10,000 m², a 100 m × 100 m square. Rock is spread per unit area, so credit is counted per unit area.' },
    { term: 'ppm', def: 'Parts per million — mg of element per kg of soil. 16,780 ppm Ca means calcium is 1.678% of the soil mass.' },
    { term: 'Tracer', def: 'An immobile element (Ti, and Zr as a cross-check). It does not dissolve or react, so any change in it measures sampling artifacts, not chemistry.' },
    { term: 'Counterfactual', def: 'What would have happened anyway. In the Isometric protocol the control plot\u2019s CDR is this term, subtracted directly from the treatment result.' },
    { term: 'MDE', def: 'Minimum Detectable Effect — the smallest true effect a study could reliably find, given its noise and sample size.' },
    { term: 'Materiality', def: 'A protocol\u2019s tolerance for uncertainty. Isometric uses 5%; this project comes to 19.2%.' },
  ]

  return (
    <section className="section" id="how">
      <div className="container">
        <div className="section-num">1</div>
        <p className="section-label">How it works</p>
        <h2>Titanium is a ruler. Everything else follows.</h2>
        <p style={{ marginTop: 16, color: 'var(--color-text-muted)' }}>
          Two scoops of soil taken seven months apart are never identical in mass or
          density — and that difference alone shows up as a fake enrichment signal.
          The whole method exists to remove it.
        </p>

        <div className="card-grid card-grid--2">
          <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
            <div className="card-icon">🥄</div>
            <h3>The problem: you cannot just subtract</h3>
            <p>
              If the monitoring scoop happens to be 5% denser in mineral matter, then
              <em> every</em> element reads ~5% higher — Ca, Mg, Ti, Si alike — with no
              chemistry involved. At Ca ≈ 16,500 ppm that is 825 ppm of pure fiction,
              a large fraction of a real weathering signal.
            </p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <div className="card-icon">📏</div>
            <h3>The fix: divide by something that cannot move</h3>
            <p>
              Titanium does not dissolve and does not react with CO₂. So any change in
              measured Ti is <em>by construction</em> a sampling artifact. Compare Ca
              <em> relative to Ti</em> instead, and a 5% denser scoop cancels exactly —
              both numbers rise together, the ratio does not move.
            </p>
          </div>
        </div>

        <div
          className="card"
          style={{ marginTop: 20, background: '#f0fdf4', borderColor: '#bbf7d0', borderLeft: '4px solid #16a34a' }}
        >
          <h3 style={{ color: '#15803d' }}>The proof that the correction is honest</h3>
          <p style={{ color: '#166534' }}>
            A correction is only trustworthy if it does <strong>nothing</strong> when there is
            nothing to correct. Set Ti_baseline = Ti_monitoring = T:
          </p>
          <pre
            style={{
              marginTop: 12,
              padding: '14px 16px',
              background: '#052e16',
              color: '#bbf7d0',
              borderRadius: 8,
              fontSize: '0.82rem',
              overflowX: 'auto',
            }}
          >
{`Δppm = ( Ca_mon / T  −  Ca_bl / T ) × T
     = Ca_mon − Ca_bl`}
          </pre>
          <p style={{ color: '#166534', marginTop: 12 }}>
            The T cancels completely and the formula collapses to plain subtraction. Three
            things follow: Ti&rsquo;s absolute value is irrelevant (only its stability between
            the two samples matters), the normalisation cannot manufacture signal, and the
            pair-specific Ti gate in validation follows directly. Proven algebraically, pinned
            by a fixed-example regression test, and generalised across hundreds of randomised
            inputs with the <code>hypothesis</code> library.
          </p>
        </div>

        <div className="ext-group" style={{ marginTop: 48 }}>
          <div className="ext-group-title" style={{ color: 'var(--color-primary)' }}>
            The pipeline, end to end
          </div>

          <div className="flowdiagram">
            <div className="flowtrack-label">Inputs, and the join that keeps everything</div>
            <div className="flowtrack">
              <div className="flowchip flowchip--input">samples.csv<span>12 GPS-tagged field samples</span></div>
              <div className="flowchip flowchip--input">lab_results.csv<span>12 ICP-OES rows</span></div>
              <div className="flowarrow">→</div>
              <div className="flowchip">io.py<span>outer join on barcode, indicator=True</span></div>
            </div>

            <div className="flowsplit">The joined table feeds two independent tracks</div>

            <div className="flowtrack-label">Track A · Part 1 — data quality</div>
            <div className="flowtrack">
              <div className="flowchip">quality.py<span>6 independent checks</span></div>
              <div className="flowarrow">→</div>
              <div className="flowchip flowchip--out">8 issues<span>5 root-cause records · 0 false flags</span></div>
            </div>

            <div className="flowtrack-label">Track B · Part 2 — the CDR pipeline</div>
            <div className="flowtrack">
              <div className="flowchip">pairing.py<span>greedy 1:1, within 500 m</span></div>
              <div className="flowarrow">→</div>
              <div className="flowchip">validation.py<span>4 gates, all failures reported</span></div>
              <div className="flowarrow">→</div>
              <div className="flowchip">chemistry.py<span>Ti-normalised CDR</span></div>
              <div className="flowarrow">→</div>
              <div className="flowchip">stats.py<span>mean, std, t-distribution CI</span></div>
              <div className="flowarrow">→</div>
              <div className="flowchip flowchip--out">57.39<span>treatment, t CO₂/ha</span></div>
              <div className="flowchip flowchip--warn">17.89<span>control — expected ~0</span></div>
            </div>

            <div className="flowtrack-label">Supporting modules, used by both tracks</div>
            <div className="flowtrack">
              <div className="flowchip flowchip--input">geo.py<span>Haversine distance, GPS validity</span></div>
              <div className="flowchip flowchip--input">config.py<span>every threshold, tagged by authority</span></div>
            </div>
          </div>

          <div className="card-grid card-grid--3" style={{ marginTop: 20 }}>
            {steps.map((s) => (
              <div className="card" key={s.n}>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: 'var(--color-primary)',
                    marginBottom: 8,
                  }}
                >
                  {s.n} · <code style={{ fontSize: '0.72rem' }}>{s.file}</code>
                </div>
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="ext-group" style={{ marginTop: 48 }}>
          <div className="ext-group-title" style={{ color: 'var(--color-primary)' }}>
            Vocabulary, if any of this is new
          </div>
          <table className="issue-table" style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th style={{ width: 170 }}>Term</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              {glossary.map((g) => (
                <tr key={g.term}>
                  <td><strong>{g.term}</strong></td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>{g.def}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 16, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            The full version — every chapter explaining the concept, the code, and the
            numbers it produces — is{' '}
            <a href={`${REPO}/blob/main/BOOK.md`} target="_blank" rel="noopener noreferrer">
              the Ganga MRV Book
            </a>
            . Chapter 8 starts from what a p-value is; Appendix C explains every Python idiom
            used in the repo.
          </p>
        </div>
      </div>
    </section>
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
        <div className="section-num">2</div>
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
        <div className="section-num">3</div>
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
        <div className="section-num">4</div>
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

/* ─────────────────────────── THE CONFOUND ─────────────────────────── */
function Confound() {
  const batch = [
    { el: 'Ti', mean: '3,075.7', bl006: '3,095.0', dev: '+0.63%' },
    { el: 'Ca', mean: '16,650.0', bl006: '16,700.0', dev: '+0.30%' },
    { el: 'Mg', mean: '5,806.7', bl006: '5,850.0', dev: '+0.75%' },
    { el: 'Si', mean: '8,356.7', bl006: '8,400.0', dev: '+0.52%' },
  ]

  const processes = [
    { p: 'Carbonate dissolving and re-precipitating across the flood cycle', ca: 'Moves Ca strongly, Mg moderately', ti: 'Ti sits in silicates — barely moves' },
    { p: 'Cation exchange as Fe²⁺ and Mn²⁺ displace adsorbed ions', ca: 'Ca/Mg move on and off clay surfaces', ti: 'Ti is not in the exchange pool at all' },
    { p: 'Reductive dissolution of iron oxides', ca: 'Releases co-sorbed ions; shifts pH', ti: 'Ti stays in the resistate fraction' },
    { p: 'Agricultural lime applied to the field', ca: 'Adds Ca with no accompanying Si', ti: 'Unchanged' },
    { p: 'A bigger or denser scoop of the same soil', ca: 'Ca/Mg rise proportionally', ti: 'Ti rises proportionally — this is the case the correction is built for' },
  ]

  return (
    <section className="section section--darker" id="confound">
      <div className="container">
        <div className="section-num">5</div>
        <p className="section-label">Hunting the confound</p>
        <h2 style={{ color: '#fff' }}>Why does untreated land show 17.89 t CO₂/ha?</h2>
        <p style={{ marginTop: 16, color: 'rgba(242,247,238,0.7)' }}>
          The brief calls the control plot a sanity check. It failed, and the rest of this
          project is the investigation into why. Two hypotheses were testable with the data
          available.
        </p>

        <div className="ext-group" style={{ marginTop: 44 }}>
          <div className="ext-group-title">Hypothesis 1 — lab-batch drift · <code>forensics.py</code></div>
          <p style={{ color: 'rgba(242,247,238,0.7)', fontSize: '0.9rem' }}>
            Every baseline carries an <code>LB-24-*</code> barcode and every monitoring sample an{' '}
            <code>LB-25-*</code> one, so treatment epoch is perfectly confounded with which
            year the lab ran the analysis. Instrument drift between the two runs would
            manufacture a false enrichment signal in <em>both</em> treatment and control.
            Ordinarily untestable — except one sample breaks the pattern.{' '}
            <code>GNG-BL-006</code> is chemically a baseline but was physically analysed in the
            2025 batch: an accidental cross-batch natural experiment.
          </p>
          <table className="issue-table issue-table--dark" style={{ marginTop: 20 }}>
            <thead>
              <tr>
                <th>Element</th>
                <th>2024-batch baseline mean (ppm)</th>
                <th>GNG-BL-006, 2025 batch (ppm)</th>
                <th>Deviation</th>
              </tr>
            </thead>
            <tbody>
              {batch.map((r) => (
                <tr key={r.el}>
                  <td><strong>{r.el}</strong></td>
                  <td>{r.mean}</td>
                  <td>{r.bl006}</td>
                  <td><span className="badge badge--green">{r.dev}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 16, color: 'rgba(242,247,238,0.6)', fontSize: '0.85rem' }}>
            All four elements agree within 1%. That <em>weakens</em> the drift hypothesis
            without ruling it out — it is a single sample, and one observation cannot
            characterise a batch.
          </p>
        </div>

        <div className="ext-group" style={{ marginTop: 52 }}>
          <div className="ext-group-title">Hypothesis 2 — the seasonal and hydrological cycle</div>
          <p style={{ color: 'rgba(242,247,238,0.7)', fontSize: '0.9rem' }}>
            This is the leading remaining candidate, and it is entirely a consequence of the
            sampling calendar. Baselines and monitoring samples were collected at{' '}
            <strong>opposite points of the annual flood/dry cycle</strong> in a rice-paddy
            landscape.
          </p>

          <div className="timeline">
            <div className="timeline-step">
              <div className="timeline-date">October 2024</div>
              <h4>Baselines collected</h4>
              <p>Post-monsoon. Fields recently flooded, soils saturated and reducing. Fe(III) oxides dissolving, Fe²⁺ and Mn²⁺ in solution displacing adsorbed Ca and Mg.</p>
            </div>
            <div className="timeline-step">
              <div className="timeline-date">15 October 2024</div>
              <h4>Rock applied</h4>
              <p>Crushed silicate spread on treatment plots only. The control plots receive nothing — which is what makes their 17.89 t CO₂/ha so informative.</p>
            </div>
            <div className="timeline-step">
              <div className="timeline-date">May 2025</div>
              <h4>Monitoring collected</h4>
              <p>Pre-monsoon, peak dry season. Soils oxidised, Fe²⁺ re-precipitated as oxides, pH fallen back, cations redistributed. A completely different chemical state.</p>
            </div>
          </div>

          <p style={{ marginTop: 28, color: 'rgba(242,247,238,0.7)', fontSize: '0.9rem' }}>
            The flooded-paddy redox sequence is textbook soil science — Ponnamperuma (1972) and
            Kirk (2004) are the standard references. The operationally measurable pool of Ca and
            Mg genuinely differs between a saturated post-monsoon soil and a dry pre-monsoon
            one, with zero basalt weathering required.
          </p>
        </div>

        <div className="ext-group" style={{ marginTop: 52 }}>
          <div className="ext-group-title">Why titanium normalisation cannot cancel this</div>
          <p style={{ color: 'rgba(242,247,238,0.7)', fontSize: '0.9rem' }}>
            Ti normalisation corrects for exactly one thing: the sample being a bigger, smaller
            or denser scoop of the same material. Formally it cancels a multiplicative factor
            applied to <em>all</em> elements at once. Seasonal redox is not that — it is a{' '}
            <strong>selective</strong> process that moves Ca and Mg while leaving Ti untouched,
            precisely because Ti is neither redox-active nor exchangeable. Which is why Ti was
            chosen as a tracer in the first place.
          </p>
          <table className="issue-table issue-table--dark" style={{ marginTop: 20 }}>
            <thead>
              <tr>
                <th style={{ width: '34%' }}>Process</th>
                <th>Effect on Ca / Mg</th>
                <th>Effect on Ti</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((r, i) => (
                <tr key={r.p}>
                  <td>{i === processes.length - 1 ? <strong>{r.p}</strong> : r.p}</td>
                  <td>{r.ca}</td>
                  <td>{r.ti}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            style={{
              marginTop: 24,
              padding: '22px 26px',
              background: 'rgba(227,227,61,0.08)',
              border: '1px solid rgba(227,227,61,0.25)',
              borderRadius: 'var(--radius-card)',
            }}
          >
            <p style={{ color: 'rgba(242,247,238,0.85)', maxWidth: 'none' }}>
              Only the last row is the case the correction was designed for. In the first four you
              get a genuine ΔCa with a perfectly stable Ti — which is exactly the signature the
              formula reads as enrichment.{' '}
              <strong style={{ color: '#e3e33d' }}>
                Titanium corrects for how much soil you scooped. It cannot correct for what the
                soil was doing.
              </strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── RESEARCH ─────────────────────────── */
function Research() {
  const literature = [
    { src: 'Ponnamperuma (1972), The Chemistry of Submerged Soils', what: 'The canonical flooded-soil redox cascade: electron-acceptor sequence, pH convergence toward neutral, and the mobilisation of exchangeable cations that follows.' },
    { src: 'Kirk (2004), The Biogeochemistry of Submerged Soils', what: 'Modern synthesis of the same system, including the drainage half of the cycle and the re-precipitation that resets the soil each season.' },
    { src: 'Ca–Mg carbonate cycling in irrigated rice (Geoderma)', what: 'Irrigation-driven Eh and pH swings precipitate Ca–Mg carbonate under waterlogging and re-dissolve it on drying — a seasonal solid↔solution transfer with no external input.' },
    { src: 'Flood-irrigation management studies (Agricultural Water Management)', what: 'On drainage, soil-solution Ca and Mg fall as ions resorb to exchange sites; the chemistry resets when flooding returns. Directly relevant to a May-vs-October comparison.' },
    { src: 'Paddy redox cycling and Fe minerals (Env. Sci.: Processes & Impacts, 2023)', what: 'Repeated flood–drain cycles release Fe, Si, P and dissolved organic carbon from iron minerals — evidence that the mobile pool is genuinely not static across redox states.' },
    { src: 'Reershemius et al. (2023), ERW mass balance', what: 'States the boundary explicitly: tracer normalisation is valid for mixing and dilution, not for biogeochemical seasonality. The formal version of what this project derived from the algebra.' },
    { src: 'Frontiers in Climate (2024), ERW measurement review', what: 'Tracer methods place samples on a soil–rock mixing line; high N and good baseline characterisation are the binding constraints — the same two this project ran into.' },
    { src: 'Isometric and Rainbow sampling protocols', what: 'Baseline before spreading, ongoing monitoring rather than one revisit, power analysis from pilot variance, and hydrology as an explicit stratification factor. Also the source of the 5% materiality threshold and the counterfactual master equation.' },
    { src: 'Brimhall & Dietrich (1987), constitutive mass balance', what: 'The origin of immobile-element normalisation in geochemistry. The titanium ruler used here is a special case of it.' },
  ]

  const toolkit = [
    { n: '01', t: 'Match the season', d: 'Collect baseline and monitoring in the same calendar window. This removes the confound rather than modelling it, and it costs nothing.', built: false },
    { n: '02', t: 'Sample multiple timepoints', d: 'Three or four visits across the cycle let you estimate the seasonal component and subtract it, turning a confound into a measured covariate.', built: false },
    { n: '03', t: 'Interleave the control plots', d: 'Counterfactual subtraction is only valid if treatment and control share a hydrological regime. At 1.5 km apart, these two blocks may not.', built: false },
    { n: '04', t: 'Record Eh, pH, moisture, water table', d: 'The literature shows Ca and Mg track these directly, so they are the covariates that make the effect modellable at all.', built: false },
    { n: '05', t: 'Measure porewater alongside solids', d: 'Bulk solid Ca/Mg cannot distinguish "the element left the field" from "the element moved between pools."', built: false },
    { n: '06', t: 'Cross-check with a second tracer', d: 'Zr is already in the data. It does not fix seasonality — both tracers are equally blind to it — but it rules out tracer-specific artifacts.', built: true },
    { n: '07', t: 'Test Si stoichiometry', d: 'The one check here that can distinguish silicate-sourced Ca from carbonate- or lime-sourced Ca. Both valid pairs come back outside the silicate band.', built: true },
    { n: '08', t: 'Size the study from pilot variance', d: 'If seasonal swing is part of your noise, the sample-size calculation has to include it. This is why the MDE comes out at 44.95 t/ha.', built: true },
  ]

  return (
    <section className="section section--white" id="research">
      <div className="container">
        <div className="section-num">6</div>
        <p className="section-label">Research</p>
        <h2>Reading outside the repository.</h2>
        <p style={{ marginTop: 16, color: 'var(--color-text-muted)' }}>
          Interpreting the control-plot result meant going to the literature — for paddy-soil
          biogeochemistry, for ERW MRV methodology, and for the geochemical mass-balance theory
          the titanium correction descends from. Consolidated in{' '}
          <a href={`${REPO}/blob/main/BOOK.md#appendix-f-research-notes-literature-and-side-investigations`} target="_blank" rel="noopener noreferrer">
            Appendix F of the book
          </a>
          .
        </p>

        <table className="issue-table" style={{ marginTop: 32 }}>
          <thead>
            <tr>
              <th style={{ width: '36%' }}>Source</th>
              <th>What it establishes</th>
            </tr>
          </thead>
          <tbody>
            {literature.map((l) => (
              <tr key={l.src}>
                <td style={{ fontSize: '0.84rem' }}><strong>{l.src}</strong></td>
                <td style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>{l.what}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ext-group" style={{ marginTop: 52 }}>
          <div className="ext-group-title" style={{ color: 'var(--color-primary)' }}>
            What a practitioner would actually do about a wet↔dry confound
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Ordered by how directly each attacks the problem. Note how few of them are code
            changes — the three marked <em>built</em> are in this repository; the rest are
            protocol changes for the next collection round.
          </p>
          <div className="card-grid card-grid--2" style={{ marginTop: 24 }}>
            {toolkit.map((t) => (
              <div
                className="card"
                key={t.n}
                style={{ borderLeft: `4px solid ${t.built ? '#16a34a' : 'var(--color-slate)'}` }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {t.n}
                  </span>
                  <span className={`badge badge--${t.built ? 'green' : 'blue'}`}>
                    {t.built ? 'Built here' : 'Protocol change'}
                  </span>
                </div>
                <h3>{t.t}</h3>
                <p>{t.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="card"
          style={{ marginTop: 40, background: '#fafaf6', borderLeft: '4px solid var(--color-slate)' }}
        >
          <h3>Data versus inference — stated explicitly</h3>
          <p style={{ marginTop: 8 }}>
            The seasonal hypothesis depends on three things that are <em>not</em> columns in the
            CSVs, so each is traced back to its evidence in Appendix F rather than asserted.{' '}
            <strong>The barcode years</strong> come from the <code>LB-YY-####</code> naming pattern,
            an explicit convention in <code>literature_checks.py</code>, and perfect agreement with
            the date column across all eleven barcoded samples.{' '}
            <strong>West Bengal</strong> comes from the coordinates (23.45°N, 87.32°E, in the
            Bardhaman belt of the Ganges plain), the project name, and the Rajmahal Traps geology
            check. <strong>Rice paddies</strong> is a land-use inference from the coordinates and the
            sampling calendar — and it matters, because the redox mechanism is much weaker in an
            upland rainfed system than a flooded one.
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
        { icon: '🤖', name: 'digital_twin.py', desc: '300-trial coverage validation; 95.0% CI calibration at N=2 (see §8)' },
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
        <div className="section-num">7</div>
        <p className="section-label">Module catalogue</p>
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
        <div className="section-num">8</div>
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

/* ─────────────────────────── PART 3 ─────────────────────────── */
function Part3() {
  const questions = [
    {
      q: 'Q1',
      title: 'What would break at 10× scale?',
      answer:
        'The greedy pairing loop builds a full O(n²) distance matrix — fine at 12 samples, 25 million entries at 5,000. The redesign is spatial indexing plus per-project partitioning, since pairs never cross project boundaries. The provenance ledger was designed for this case: one machine-readable record per decision, so an auditor at scale never has to re-run the pipeline to understand a rejection.',
      backed: 'pairing.py · infra/provenance.py',
    },
    {
      q: 'Q2',
      title: 'Pairing failure modes, and a better strategy',
      answer:
        'Nearest-GPS pairing has three failure modes visible in this dataset alone: it can claim a baseline that is geographically closest but scientifically unusable, it is sensitive to processing order, and it ignores whether the two soils are actually comparable. Two alternatives were implemented rather than described — Hungarian optimal assignment, and a combined metric that adds Mahalanobis distance on (Ti, Zr) to geographic distance.',
      backed: 'pairing_hungarian.py · combined_distance.py',
    },
    {
      q: 'Q3',
      title: 'The control plot problem',
      answer:
        'The brief asks what a control CDR of ~0.3 t CO₂/ha would mean. Here it is 17.89 — sixty times larger, and 31% of the treatment signal. That single number is what turned this from an implementation exercise into an investigation: counterfactual subtraction, significance testing, Monte Carlo sensitivity, lab-batch forensics, and Si stoichiometry all exist to answer it.',
      backed: 'counterfactual.py · significance.py · forensics.py · stoichiometry.py',
    },
    {
      q: 'Q4',
      title: 'Validation trade-offs at 10%, 20%, 30%',
      answer:
        'Answered as data rather than opinion: 12 specifications across pairing order × Ti threshold × tracer choice. Mean CDR spans only 57.39–59.06 t/ha, about 3%. Threshold and tracer barely matter; pairing order is the dominant lever because it changes N, not just the mean. This also produced a self-correction — the threshold sensitivity is in Part 1&rsquo;s population-mean check, which is contaminated by the very outlier it is meant to catch, not in Part 2&rsquo;s pair-specific gate.',
      backed: 'multiverse.py · quality.py vs validation.py',
    },
    {
      q: 'Q5',
      title: 'One more thing, given another week',
      answer:
        'A digital twin — and it was built rather than sketched. Generate synthetic deployments with a known true CDR, run the real pipeline against them, and check whether the reported 95% interval actually contains the truth. It does, 95.0% of the time at n=2, which is what licenses the claim that the disappointing result is a data problem and not a code problem.',
      backed: 'ml/digital_twin.py',
    },
  ]

  return (
    <section className="section" id="part3">
      <div className="container">
        <div className="section-num">9</div>
        <p className="section-label">Part 3 · Thinking</p>
        <h2>Five questions, answered with code that ran.</h2>
        <p style={{ marginTop: 16, color: 'var(--color-text-muted)' }}>
          The brief says strong answers reference the actual implementation. So each of the five
          guide questions is backed by a module that exists and produces output, not by an
          argument. Full write-up in{' '}
          <a href={`${REPO}/blob/main/PART3_THINKING.md`} target="_blank" rel="noopener noreferrer">
            PART3_THINKING.md
          </a>
          .
        </p>

        <div className="card-grid card-grid--2" style={{ marginTop: 36 }}>
          {questions.map((item) => (
            <div className="card" key={item.q} style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  color: 'var(--color-primary)',
                  marginBottom: 8,
                }}
              >
                {item.q}
              </div>
              <h3>{item.title}</h3>
              <p>{item.answer}</p>
              <p style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--color-slate)' }}>
                <code style={{ fontSize: '0.75rem' }}>{item.backed}</code>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── DECISION FLOW ─────────────────────────── */
function KeyDecisions() {
  const chain = [
    {
      id: 'D1',
      observed: 'Two CSVs have to be joined on barcode, and some rows may not match.',
      decided: 'Outer join with indicator=True, not an inner join — keep every row and record how it matched.',
      result: 'Found LB-25-5508 (a lab result with no sample) and GNG-MON-004 (a sample with no barcode). An inner join would have silently deleted both.',
    },
    {
      id: 'D4',
      observed: 'The brief says pair first, then validate. Run that way, GNG-MON-004 claims GNG-BL-001 at 0 m — despite having no barcode and no possible CDR.',
      decided: 'Pre-filter to samples that actually have lab data, then pair. Both orderings kept on record.',
      result: '2 valid treatment pairs instead of 1 — a 100% difference in usable output from a single ordering choice.',
    },
    {
      id: 'D5',
      observed: 'With N=2 valid pairs, a normal-distribution interval would report a comfortably narrow CI.',
      decided: 'Use the t-distribution. At df=1 the multiplier is 12.71, not 1.96.',
      result: 'An honest, very wide interval. The width is the finding — it correctly refuses to pretend two points pin down a population mean.',
    },
    {
      id: 'D7',
      observed: 'Control plots that received no rock return 17.89 t CO₂/ha — 31% of the treatment signal.',
      decided: 'Treat control CDR as the formal counterfactual term and subtract it, propagating variance as Var(net) = Var(treatment) + Var(control).',
      result: 'Net 39.49 t CO₂/ha, and a 95% CI of [−104.06, 183.05] that crosses zero.',
    },
    {
      id: 'D8',
      observed: 'Treatment std is 1.98; control std is 15.85 — different by a factor of eight.',
      decided: "Welch's t-test rather than Student's, because Student's assumes equal variances.",
      result: 'p = 0.0857. Not significant at α = 0.05, and defensible in a way the equal-variance test would not have been.',
    },
    {
      id: 'D9',
      observed: 'The first MDE calculation used treatment std alone, and disagreed with the independently computed required sample size.',
      decided: 'Trust neither until they reconcile; recompute MDE with pooled standard deviation across both groups.',
      result: 'MDE 44.95 t/ha — larger than the 39.49 observed. A real bug, caught only because two results were cross-checked against each other.',
    },
    {
      id: 'D10',
      observed: 'Si is measured in the data but never used by the required formula.',
      decided: 'Use it as an independent chemical check — silicate dissolution must release Si alongside Ca and Mg.',
      result: '(Ca+Mg)/Si = 2.44 and 2.46 across both valid pairs, above the ~0.5–1.5 silicate band. Points to a non-silicate Ca source such as lime or soil carbonate.',
    },
    {
      id: 'D11',
      observed: 'The 20% Ti threshold is stated in the brief but nothing physical fixes that number.',
      decided: 'Run all 12 combinations of pairing order × threshold (10/20/30%) × tracer (Ti/Zr) rather than defending one choice.',
      result: 'Mean CDR spans only 57.39–59.06 — about 3%. Threshold and tracer barely matter; pairing order is the dominant lever because it changes N.',
    },
    {
      id: 'D12',
      observed: "MON-003's Ti is 55% above the treatment mean — but that mean is itself contaminated by MON-003.",
      decided: 'Add a median/MAD robust check alongside the required mean-based one, rather than replacing it.',
      result: 'Robust z of 96.45 for MON-003 against −2.25 for the nearest clean sample — a separation of more than 40×, with no threshold to argue about.',
    },
    {
      id: 'D13',
      observed: 'Every baseline is LB-24 and every monitoring sample LB-25, so treatment epoch is perfectly confounded with lab batch.',
      decided: 'Look for a sample that breaks the pattern. GNG-BL-006 is chemically a baseline but was run in the 2025 batch.',
      result: 'Ti, Ca, Mg and Si all within 1% of the 2024-batch baselines. Lab drift weakened — though it is a single sample, so not eliminated.',
    },
    {
      id: 'D14',
      observed: 'All 15 tests pass, but passing tests only prove the code behaves sensibly on the data it was given.',
      decided: 'Build a digital twin: generate deployments with a known true CDR, run the real pipeline, check whether the reported interval contains the truth.',
      result: '95.0% coverage at n=2 across 300 trials. This is what licenses the claim that the constraint is the data and not the code.',
    },
  ]

  return (
    <section className="section section--white" id="decisions">
      <div className="container">
        <p className="section-label" style={{ color: 'var(--color-primary)' }}>Decision flow</p>
        <h2>What was observed, what was decided, what followed.</h2>
        <p style={{ marginTop: 12, color: 'var(--color-text-muted)' }}>
          Every judgment call in this project came from something the data did, and each one
          changed a number downstream. Read left to right. Full reasoning and the chapter where
          each was verified is in{' '}
          <a href={`${REPO}/blob/main/BOOK.md#appendix-a-decisions-index`} target="_blank" rel="noopener noreferrer">
            Appendix A of the book
          </a>
          .
        </p>

        <div className="dflow">
          {chain.map((d) => (
            <div className="dflow-row" key={d.id}>
              <div className="dflow-id">{d.id}</div>
              <div className="dflow-cell">
                <div className="dflow-cell-label">Observed</div>
                <p>{d.observed}</p>
              </div>
              <div className="dflow-arrow" aria-hidden="true">→</div>
              <div className="dflow-cell">
                <div className="dflow-cell-label">Decided</div>
                <p>{d.decided}</p>
              </div>
              <div className="dflow-arrow" aria-hidden="true">→</div>
              <div className="dflow-cell dflow-cell--result">
                <div className="dflow-cell-label">What followed</div>
                <p>{d.result}</p>
              </div>
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
              <li><a href={`${REPO}/blob/main/BOOK.md`} target="_blank" rel="noopener noreferrer">BOOK.md — the full teaching version, 21 chapters</a></li>
              <li><a href={`${REPO}/blob/main/BOOK.md#8-statistics-from-scratch-then-significancepy`} target="_blank" rel="noopener noreferrer">Ch. 8 — statistics from scratch (p-values, MDE, power)</a></li>
              <li><a href={`${REPO}/blob/main/BOOK.md#appendix-a-decisions-index`} target="_blank" rel="noopener noreferrer">Appendix A — every judgment call</a></li>
              <li><a href={`${REPO}/blob/main/BOOK.md#appendix-b-extensions-status`} target="_blank" rel="noopener noreferrer">Appendix B — built vs described-only</a></li>
              <li><a href={`${REPO}/blob/main/BOOK.md#appendix-c-reading-the-python`} target="_blank" rel="noopener noreferrer">Appendix C — reading the Python</a></li>
              <li><a href={`${REPO}/blob/main/BOOK.md#appendix-e-reproducing-every-number`} target="_blank" rel="noopener noreferrer">Appendix E — reproducing every number</a></li>
              <li><a href={`${REPO}/blob/main/BOOK.md#appendix-f-research-notes-literature-and-side-investigations`} target="_blank" rel="noopener noreferrer">Appendix F — research notes and literature</a></li>
              <li><a href={`${REPO}/blob/main/PART3_THINKING.md`} target="_blank" rel="noopener noreferrer">PART3_THINKING.md — written answers</a></li>
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
        <Dashboard />
        <HowItWorks />
        <Part1 />
        <Part2 />
        <Finding />
        <Confound />
        <Research />
        <Extensions />
        <DigitalTwin />
        <Part3 />
        <KeyDecisions />
      </main>
      <Footer />
    </>
  )
}
