import React, { useEffect, useMemo, useRef, useState } from 'react'

/**
 * GameCove "Data visualization" (Harbor Nov 20). Sits right under the design system (rendered at the end of DsLayers,
 * GameCoveDS.tsx). Replaces the three Framer-style light cards of v31.
 * What Harbor asked for (screen recording, Nov 20):
 *  - title "Data visualization"
 *  - every chart from the GameCove prototype (game-cove.vercel.app: Overview, Retention, Experience, Explore) as its own
 *    card, all the same size; long charts are cut to that size and fade out at the bottom
 *  - one-line title per card, no extra light card or description around it
 *  - a row that keeps moving sideways by itself (slowly); page scrolling nudges it along; dragging or a sideways
 *    swipe moves it fast; it stops under the pointer so the chart tooltips can be read
 * Numbers: computed from the prototype's own query layer (whdhrrk/gamecove lib/dashboard/queries.ts on
 * data/dashboard/bounce-bounce.json, default filters = Last 7 days, Sep 16–22) — nothing estimated. Labels are the
 * prototype's (lib/i18n/messages/en.ts). Day 7 retention is left out: every day in the period is N/A.
 * Site rules kept: Roboto, nothing under 16px. The dark chart cards keep the product's rounded corners (16 / 8).
 * Reduced motion: no self-moving; drag and sideways swipe still work.
 */

/* ---------- data (prototype query layer, Last 7 days) ---------- */

const DAYS = ['Sep 16', 'Sep 17', 'Sep 18', 'Sep 19', 'Sep 20', 'Sep 21', 'Sep 22']

type LineSpec = {
  id: string; title: string; cap: string; head: string; legend: string
  vals: (number | null)[]; max: number; ticks: number[]; tick: (v: number) => string; tip: (v: number) => string
}
const f1 = (v: number) => v.toFixed(1)
const LINES: Record<string, LineSpec> = {
  dau: { id: 'dau', title: 'Daily active users', cap: 'Today (Sep 22)', head: '134 users', legend: 'Daily active users',
    vals: [277, 276, 254, 236, 227, 203, 134], max: 500, ticks: [0, 100, 200, 300, 400, 500], tick: String, tip: v => `${v} users` },
  play: { id: 'play', title: 'Average Playtime', cap: 'Today (Sep 22)', head: '16.9 min', legend: 'Avg. playtime',
    vals: [15.63, 16.87, 13.75, 16.73, 16.70, 15.78, 16.94], max: 25, ticks: [0, 5, 10, 15, 20, 25], tick: String, tip: v => `${f1(v)} min` },
  sess: { id: 'sess', title: 'Sessions', cap: 'Today (Sep 22)', head: '1.3 sessions', legend: 'Sessions per user',
    vals: [1.26, 1.29, 1.23, 1.31, 1.32, 1.27, 1.31], max: 2.5, ticks: [0, 0.5, 1, 1.5, 2, 2.5], tick: String, tip: v => `${f1(v)} sessions` },
  stime: { id: 'stime', title: 'Average session time', cap: 'Today (Sep 22)', head: '13.0 min', legend: 'Avg. session time',
    vals: [12.44, 13.12, 11.19, 12.82, 12.68, 12.41, 12.97], max: 25, ticks: [0, 5, 10, 15, 20, 25], tick: String, tip: v => `${f1(v)} min` },
  d1: { id: 'd1', title: 'Day 1 retention', cap: 'Latest cohort (Sep 21)', head: '6.0%', legend: 'Day 1 retention',
    vals: [17.74, 21.62, 11.46, 9.09, 8.11, 5.95, null], max: 50, ticks: [0, 10, 20, 30, 40, 50], tick: v => `${v}%`, tip: v => `${f1(v)}%` },
}

const NEW_USERS = [124, 111, 96, 99, 74, 84, 53]
const RETURNING = [153, 165, 158, 137, 153, 119, 81]

type Src = 'home' | 'search' | 'youtube' | 'instagram' | 'other'
const TRAFFIC: { id: Src; t: string; share: number; players: number }[] = [
  { id: 'home', t: 'Home recommendations', share: 63, players: 404 },
  { id: 'search', t: 'Search', share: 11, players: 71 },
  { id: 'youtube', t: 'YouTube', share: 3, players: 21 },
  { id: 'instagram', t: 'Instagram', share: 3, players: 18 },
  { id: 'other', t: 'Unattributed', share: 20, players: 127 },
]

const EXIT = [
  { t: 'Lobby', rate: 38.8, exits: 797, visits: 2055 },
  { t: 'Stage 1', rate: 55.9, exits: 358, visits: 641 },
  { t: 'Stage 2', rate: 44.3, exits: 198, visits: 447 },
  { t: 'Stage 3', rate: 52.8, exits: 230, visits: 436 },
  { t: 'Stage 4', rate: 82.2, exits: 472, visits: 574 },
]
const FLOW = { from: 'Stage 4', visits: 574, rows: [{ t: 'Session ended', share: 82.2, n: 472 }, { t: 'Lobby', share: 17.8, n: 102 }] }
const TIME = [
  { t: 'Lobby', sec: 65, n: 2055 }, { t: 'Stage 1', sec: 431, n: 641 }, { t: 'Stage 2', sec: 446, n: 447 },
  { t: 'Stage 3', sec: 526, n: 436 }, { t: 'Stage 4', sec: 1203, n: 574 },
]
const mmss = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`

type Funnel = { id: string; title: string; kpis: [string, string][]; label: string; steps: [string, number][] }
const FUNNELS: Funnel[] = [
  { id: 'nup', title: 'New user progression', label: 'First session funnel',
    kpis: [['Avg. playtime', '6m 55s'], ['Stage 1 clear rate', '27.0%'], ['Stage 2 reach rate', '16.8%']],
    steps: [['Lobby entered', 641], ['Stage 1 entered', 365], ['Star 1 earned', 359], ['Stage 1 cleared', 173], ['Stage 2 entered', 108]] },
  { id: 'sp4', title: 'Stage progression · Stage 4', label: 'Progression funnel',
    kpis: [['Clear rate', '45.4%'], ['Avg. first-clear time', '16m 24s'], ['Avg. failures to first clear', '9.7']],
    steps: [['Stage entered', 273], ['Star 1 earned', 272], ['Star 2 earned', 272], ['Star 3 earned', 271], ['Star 4 earned', 271],
      ['Star 5 earned', 268], ['Star 6 earned', 178], ['Star 7 earned', 149], ['Star 8 earned', 124], ['Stage cleared', 124]] },
]

/* [percent, users] per day; null = N/A (not observable yet) */
type Cell = [number, number] | null
const COHORTS: { d: string; users: number; c: Cell[] }[] = [
  { d: 'Sep 22', users: 53, c: [null, null, null, null, null, null] },
  { d: 'Sep 21', users: 84, c: [[6.0, 5], null, null, null, null, null] },
  { d: 'Sep 20', users: 74, c: [[8.1, 6], [6.8, 5], null, null, null, null] },
  { d: 'Sep 19', users: 99, c: [[9.1, 9], [4.0, 4], [3.0, 3], null, null, null] },
  { d: 'Sep 18', users: 96, c: [[11.5, 11], [13.5, 13], [9.4, 9], [3.1, 3], null, null] },
  { d: 'Sep 17', users: 111, c: [[21.6, 24], [9.0, 10], [8.1, 9], [9.0, 10], [6.3, 7], null] },
  { d: 'Sep 16', users: 124, c: [[17.7, 22], [13.7, 17], [13.7, 17], [8.1, 10], [7.3, 9], [4.0, 5]] },
]

const HEAD = { eyebrow: 'CHARTS', title: 'Data visualization', body: 'Every chart in the GameCove prototype, built on the same tokens. Point at one to read its values, or drag the row to move faster.' }

/* ---------- helpers ---------- */

/** smooth line through the points without overshooting (monotone cubic) */
function monotonePath(xs: number[], ys: number[]) {
  const n = xs.length
  if (n < 2) return ''
  const d: number[] = [], m: number[] = []
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]))
  m.push(d[0])
  for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2)
  m.push(d[n - 2])
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i] }
  }
  let p = `M${xs[0].toFixed(2)} ${ys[0].toFixed(2)}`
  for (let i = 0; i < n - 1; i++) {
    const h = (xs[i + 1] - xs[i]) / 3
    p += ` C${(xs[i] + h).toFixed(2)} ${(ys[i] + m[i] * h).toFixed(2)} ${(xs[i + 1] - h).toFixed(2)} ${(ys[i + 1] - m[i + 1] * h).toFixed(2)} ${xs[i + 1].toFixed(2)} ${ys[i + 1].toFixed(2)}`
  }
  return p
}

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

function Info() {
  return (
    <svg className="dv-info" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 7.2v3.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="5.2" r=".8" fill="currentColor" />
    </svg>
  )
}

function SrcIcon({ id }: { id: Src }) {
  const p = { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none', 'aria-hidden': true } as const
  if (id === 'home') return <svg {...p}><path d="M5.2 2.6l12.2 3.2-3.2 12.2L2 14.8z" fill="currentColor" /><path d="M8.6 8.1l3.3.9-.9 3.3-3.3-.9z" fill="#17171B" /></svg>
  if (id === 'search') return <svg {...p}><circle cx="8.8" cy="8.8" r="5.6" stroke="currentColor" strokeWidth="1.6" /><path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  if (id === 'youtube') return <svg {...p}><rect x="2.5" y="4.5" width="15" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" /><path d="M8.5 7.6v4.8l4-2.4z" fill="currentColor" /></svg>
  if (id === 'instagram') return <svg {...p}><rect x="3" y="3" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.6" /><circle cx="10" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.6" /><circle cx="14" cy="6" r=".9" fill="currentColor" /></svg>
  return <svg {...p}><path d="M11 3h6v6M17 3l-7.5 7.5M14.5 12v3.5a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 15.5V7a1.5 1.5 0 011.5-1.5H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

/** the dark chart card: one-line title, then the chart; anything taller than the card fades out at the bottom */
function Card({ title, children, label }: { title: string; children: React.ReactNode; label?: string }) {
  return (
    <article className="dv-chart" aria-label={label || title}>
      <div className="dv-ct">{title} <Info /></div>
      <div className="dv-body">{children}</div>
    </article>
  )
}

/* ---------- line charts (one or two series) ---------- */

type Series = { vals: (number | null)[]; tone: 'new' | 'ret'; name: string }

function LinePlot({ series, max, ticks, tick, tip, legend }: {
  series: Series[]; max: number; ticks: number[]; tick: (v: number) => string; tip: (s: Series, v: number) => string; legend: string[]
}) {
  const W = 600, H = 200
  const plot = useRef<HTMLDivElement>(null)
  const [hi, setHi] = useState<number | null>(null)
  const xs = DAYS.map((_, i) => (i / (DAYS.length - 1)) * W)
  const y = (v: number) => H - (v / max) * H
  const paths = useMemo(() => series.map(s => {
    const idx = s.vals.map((v, i) => (v === null ? -1 : i)).filter(i => i >= 0)
    const line = monotonePath(idx.map(i => xs[i]), idx.map(i => y(s.vals[i] as number)))
    const last = xs[idx[idx.length - 1]]
    return { line, area: `${line} L${last} ${H} L0 ${H} Z`, tone: s.tone }
  }), []) // eslint-disable-line react-hooks/exhaustive-deps
  const move = (e: React.PointerEvent) => {
    const r = plot.current?.getBoundingClientRect(); if (!r) return
    const i = Math.round(((e.clientX - r.left) / r.width) * (DAYS.length - 1))
    setHi(Math.max(0, Math.min(DAYS.length - 1, i)))
  }
  const pct = (i: number) => `${(i / (DAYS.length - 1)) * 100}%`
  const top = (v: number) => `${(1 - v / max) * 100}%`
  const peak = hi === null ? 0 : Math.max(...series.map(s => s.vals[hi] ?? 0))
  const below = peak / max > 0.62
  return (
    <>
      <div className="dv-lb">
        <div className="dv-yax" aria-hidden="true">{[...ticks].reverse().map(v => <span key={v}>{tick(v)}</span>)}</div>
        <div ref={plot} className="dv-plot" onPointerMove={move} onPointerLeave={() => setHi(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
            {ticks.slice(1).map(v => <line key={v} x1="0" x2={W} y1={y(v)} y2={y(v)} className="dv-gl" />)}
            {paths.map((p, k) => <path key={'a' + k} d={p.area} className={'dv-area ' + p.tone} />)}
            {paths.map((p, k) => <path key={'l' + k} d={p.line} className={'dv-line ' + p.tone} />)}
            <line x1="0" x2={W} y1={H} y2={H} className="dv-base" />
          </svg>
          {hi !== null && (
            <>
              {series.map(s => s.vals[hi] !== null && <i key={s.name} className={'dv-dot ' + s.tone} style={{ left: pct(hi), top: top(s.vals[hi] as number) }} />)}
              <div className={'dv-tip light' + (below ? ' below' : '') + (hi >= DAYS.length - 2 ? ' to-left' : hi <= 1 ? ' to-right' : '')}
                style={{ left: pct(hi), top: top(peak) }}>
                <div className="d">{DAYS[hi]}</div>
                {series.map(s => {
                  const v = s.vals[hi]
                  return series.length > 1
                    ? <div className="r" key={s.name}><span>{s.name}</span><b>{v === null ? 'N/A' : tip(s, v)}</b></div>
                    : <div className="v" key={s.name}>{v === null ? 'N/A' : tip(s, v)}</div>
                })}
              </div>
            </>
          )}
        </div>
        <div className="dv-xax" aria-hidden="true">{DAYS.map(d => <span key={d}>{d}</span>)}</div>
      </div>
      <div className="dv-legend" aria-hidden="true">{legend.map((l, i) => <span key={l} className={i ? 'ret' : 'new'}><i />{l}</span>)}</div>
    </>
  )
}

function LineCard({ s }: { s: LineSpec }) {
  return (
    <Card title={s.title} label={`${s.title}, Sep 16 to Sep 22: ${s.vals.map(v => (v === null ? 'N/A' : s.tip(v))).join(', ')}`}>
      <div className="dv-sub">{s.cap}</div>
      <div className="dv-big">{s.head}</div>
      <LinePlot series={[{ vals: s.vals, tone: 'new', name: s.legend }]} max={s.max} ticks={s.ticks} tick={s.tick} tip={(_, v) => s.tip(v)} legend={[s.legend]} />
    </Card>
  )
}

function NewReturningCard() {
  return (
    <Card title="New and returning users" label={`New and returning users, Sep 16 to Sep 22. New: ${NEW_USERS.join(', ')}. Returning: ${RETURNING.join(', ')}.`}>
      <div className="dv-sub">Today (Sep 22)</div>
      <div className="dv-big">53 users</div>
      <LinePlot series={[{ vals: RETURNING, tone: 'ret', name: 'Returning' }, { vals: NEW_USERS, tone: 'new', name: 'New' }]}
        max={250} ticks={[0, 50, 100, 150, 200, 250]} tick={String} tip={(_, v) => `${v} users`} legend={['New users', 'Returning users']} />
    </Card>
  )
}

/* ---------- lists and bars ---------- */

function TrafficCard() {
  return (
    <Card title="Traffic sources" label={`Traffic sources of new users: ${TRAFFIC.map(s => `${s.t} ${s.share}%`).join(', ')}`}>
      <div className="dv-sub">New users · Last 7 days</div>
      <ul className="dv-tr">
        {TRAFFIC.map(s => (
          <li key={s.id} className="dv-row">
            <div className="l"><SrcIcon id={s.id} /><span>{s.t}</span><b><em>{s.players} players · </em>{s.share}%</b></div>
            <div className="dv-track"><i style={{ width: `${s.share}%` }} /></div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/** horizontal bars with a value on the right; the bar under the pointer turns blue and shows its tooltip */
function Bars({ rows, start }: { rows: { t: string; w: number; v: string; tip: [string, string] }[]; start: number }) {
  const [hot, setHot] = useState<number | null>(null)
  const sel = hot ?? start
  return (
    <div className="dv-bars" onPointerLeave={() => setHot(null)}>
      {rows.map((r, i) => (
        <div key={r.t} className={'dv-bar-row' + (i === sel ? ' on' : '')} onPointerEnter={() => setHot(i)}>
          <span className="t">{r.t}</span>
          <span className="dv-bar"><i style={{ width: `${r.w}%` }} />
            {i === sel && <span className={'dv-tip dark' + (i < 2 ? ' below' : '')} style={{ left: `${r.w}%` }}><b>{r.tip[0]}</b><span>{r.tip[1]}</span></span>}
          </span>
          <span className="v">{r.v}</span>
        </div>
      ))}
    </div>
  )
}

function ExitCard() {
  return (
    <Card title="Session exit rate" label={`Session exit rate: ${EXIT.map(r => `${r.t} ${r.rate}%`).join(', ')}`}>
      <div className="dv-sub">Last 7 days</div>
      <Bars start={EXIT.length - 1} rows={EXIT.map(r => ({ t: r.t, w: r.rate, v: `${r.rate}%`, tip: [`${r.rate}% exit rate`, `${r.exits} of ${r.visits} sessions`] }))} />
    </Card>
  )
}

function FlowCard() {
  return (
    <Card title={`Session flow · ${FLOW.from}`} label={`Session flow after Stage 4: ${FLOW.rows.map(r => `${r.t} ${r.share}%`).join(', ')}`}>
      <div className="dv-sub">Sessions visiting {FLOW.from} · {FLOW.visits}</div>
      <div className="dv-flow-from" aria-hidden="true"><b>{FLOW.from}</b><span>{FLOW.visits} sessions</span></div>
      <Bars start={0} rows={FLOW.rows.map(r => ({ t: r.t, w: r.share, v: `${r.share}%`, tip: [`${r.share}%`, `${r.n} of ${FLOW.visits} sessions`] }))} />
    </Card>
  )
}

function TimeCard() {
  const max = 25 * 60
  const [hot, setHot] = useState<number | null>(null)
  const sel = hot ?? TIME.length - 1
  return (
    <Card title="Average time spent" label={`Average time spent: ${TIME.map(r => `${r.t} ${mmss(r.sec)}`).join(', ')}`}>
      <div className="dv-sub">Last 7 days</div>
      <div className="dv-cols">
        <div className="dv-yax" aria-hidden="true">{['25m', '20m', '15m', '10m', '5m', '0'].map(v => <span key={v}>{v}</span>)}</div>
        <div className="dv-colplot" onPointerLeave={() => setHot(null)}>
          {[1, 2, 3, 4, 5].map(k => <i key={k} className="gl" style={{ bottom: `${k * 20}%` }} />)}
          {TIME.map((r, i) => (
            <div key={r.t} className={'dv-col' + (i === sel ? ' on' : '')} onPointerEnter={() => setHot(i)}>
              <i style={{ height: `${(r.sec / max) * 100}%` }}>
                {i === sel && <span className={'dv-tip dark up' + (i >= TIME.length - 1 ? ' to-left' : i === 0 ? ' to-right' : '')}><b>{mmss(r.sec)}</b><span>{r.n} sessions</span></span>}
              </i>
            </div>
          ))}
        </div>
        <div className="dv-xax cols" aria-hidden="true">{TIME.map(r => <span key={r.t}>{r.t}</span>)}</div>
      </div>
    </Card>
  )
}

/** funnel rows the way the prototype draws them: reached bar, hatched drop, users, drop-off (largest drop in red) */
function FunnelCard({ fu }: { fu: Funnel }) {
  const first = fu.steps[0][1]
  const rows = fu.steps.map(([t, u], i) => ({ t, u, reach: (u / first) * 100, prev: i ? (fu.steps[i - 1][1] / first) * 100 : 100, drop: i ? ((fu.steps[i - 1][1] - u) / first) * 100 : null }))
  const maxDrop = Math.max(...rows.map(r => r.drop ?? -1))
  const [hot, setHot] = useState<number | null>(null)
  return (
    <Card title={fu.title} label={`${fu.title}: ${rows.map(r => `${r.t} ${r.u} users`).join(', ')}`}>
      <div className="dv-kpis">{fu.kpis.map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}</div>
      <div className="dv-fu-h"><b>{fu.label}</b><span className="dv-key"><i className="re" />Reached</span><span className="dv-key"><i className="dr" />Dropped</span></div>
      <div className="dv-fu" onPointerLeave={() => setHot(null)}>
        <div className="dv-fu-row hd"><span>Step</span><span /><span className="n">Users</span><span className="n">Drop-off</span></div>
        {rows.map((r, i) => {
          const worst = r.drop !== null && r.drop === maxDrop && maxDrop > 0
          return (
            <div key={r.t} className={'dv-fu-row' + (worst ? ' worst' : '') + (hot === i ? ' on' : '')} onPointerEnter={() => setHot(i)}>
              <span className="t">{r.t}</span>
              <span className="dv-fbar">
                <i className={'re' + (r.reach < 20 ? ' out' : '')} style={{ width: `${r.reach}%` }}><em style={r.reach < 20 ? { left: `calc(${100 + ((r.prev - r.reach) / r.reach) * 100}% + 8px)` } : undefined}>{f1(r.reach)}%</em></i>
                {r.drop !== null && r.drop > 0 && <i className="dr" style={{ left: `${r.reach}%`, width: `${r.prev - r.reach}%` }} />}
                {hot === i && <span className={'dv-tip dark' + (i < 2 ? ' below' : '')}><b>{r.u} users · {f1(r.reach)}% reached</b><span>{r.drop === null ? 'Start of the funnel' : `Dropped ${f1(r.drop)}% here`}</span></span>}
              </span>
              <span className="n">{r.u}</span>
              <span className="n dp">{r.drop === null ? '–' : <>{worst && <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 2l5.5 9.5h-11z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M7 6v2.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>}{f1(r.drop)}%</>}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

/** Date cohort retention: a cell shows its share and head count in the dashboard's light tooltip */
function CohortCard() {
  const vals = COHORTS.flatMap(r => r.c.filter((c): c is [number, number] => !!c).map(c => c[0]))
  const lo = Math.min(...vals), hi = Math.max(...vals)
  const alpha = (v: number) => 0.24 + ((v - lo) / (hi - lo)) * (0.7 - 0.24)
  const [tip, setTip] = useState<{ r: number; c: number } | null>(null)
  return (
    <Card title="Date cohort retention">
      <table className="dv-co" onPointerLeave={() => setTip(null)}>
        <thead><tr><th className="dc">Date cohort</th><th className="u">Users</th>{[1, 2, 3, 4, 5, 6].map(n => <th key={n}>D{n}</th>)}</tr></thead>
        <tbody>
          {COHORTS.map((row, r) => (
            <tr key={row.d}>
              <td className="dc">{row.d}</td>
              <td className="u">{row.users}</td>
              {row.c.map((c, k) => (
                <td key={k}>
                  {c ? (
                    <span className={'dv-cell' + (tip && tip.r === r && tip.c === k ? ' on' : '')} style={{ '--a': alpha(c[0]).toFixed(3) } as React.CSSProperties}
                      onPointerEnter={() => setTip({ r, c: k })} aria-label={`${row.d}, day ${k + 1}: ${c[0].toFixed(1)}%, ${c[1]} of ${row.users} users`}>
                      {c[0].toFixed(1)}%
                      {tip && tip.r === r && tip.c === k && (
                        <span className={'dv-tip light cell' + (r < 3 ? ' below' : '') + (k >= 4 ? ' to-left' : '')}><b>{c[0].toFixed(1)}%</b><span>{c[1]} of {row.users} users</span></span>
                      )}
                    </span>
                  ) : <span className="na">N/A</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

/* ---------- the moving row ---------- */

/** order: Overview → Retention → Experience, the way the prototype's pages run */
function Cards() {
  return (
    <>
      <LineCard s={LINES.dau} />
      <LineCard s={LINES.play} />
      <LineCard s={LINES.sess} />
      <LineCard s={LINES.stime} />
      <NewReturningCard />
      <TrafficCard />
      <LineCard s={LINES.d1} />
      <CohortCard />
      <ExitCard />
      <FlowCard />
      <TimeCard />
      <FunnelCard fu={FUNNELS[1]} />
      <FunnelCard fu={FUNNELS[0]} />
    </>
  )
}

const SPEED = 36 // px per second, slow

/**
 * The row moves left by itself, stops while the pointer is on it (so tooltips can be read), moves with page scrolling,
 * and can be dragged or swiped sideways to move fast (with a little glide after letting go). It loops: the cards are
 * drawn twice and the offset wraps at one set's width.
 */
function Marquee() {
  const vp = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const set = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const v = vp.current, r = rail.current, s = set.current
    if (!v || !r || !s) return
    const still = reducedMotion()
    let x = 0, glide = 0, last = performance.now(), raf = 0, seen = false, over = false
    let drag: { id: number; x0: number; xl: number; tl: number; on: boolean } | null = null
    let lastY = scrollY
    const width = () => s.offsetWidth + parseFloat(getComputedStyle(r).columnGap || '0')
    const draw = () => {
      const w = width(); if (!w) return
      x = ((x % w) - w) % w // keep it in (-w, 0]
      r.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`
    }
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      if (!drag?.on) {
        if (!still && !over) x -= SPEED * dt
        if (Math.abs(glide) > 1) { x += glide * dt; glide *= Math.pow(0.04, dt) } else glide = 0
      }
      draw()
      raf = seen ? requestAnimationFrame(tick) : 0
    }
    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick) } }
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) { lastY = scrollY; start() } }, { threshold: 0 })
    io.observe(v)
    // page scroll nudges the row: down = left, up = right
    const onScroll = () => { const dy = scrollY - lastY; lastY = scrollY; if (seen && !still) { x -= dy * 0.4; if (!raf) draw() } }
    // sideways swipe on a trackpad moves it fast; vertical wheel is left to the page
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault(); x -= e.deltaX; glide = 0; if (!raf) draw()
    }
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return
      drag = { id: e.pointerId, x0: e.clientX, xl: e.clientX, tl: performance.now(), on: false }; glide = 0
    }
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      if (!drag.on && Math.abs(e.clientX - drag.x0) > 6) { drag.on = true; v.setPointerCapture(e.pointerId); v.classList.add('dragging') }
      if (!drag.on) return
      const now = performance.now(), dx = e.clientX - drag.xl, dtt = Math.max(1, now - drag.tl) / 1000
      x += dx; glide = glide * 0.5 + (dx / dtt) * 0.5; drag.xl = e.clientX; drag.tl = now
      if (!raf) draw()
    }
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      if (drag.on) { v.classList.remove('dragging'); try { v.releasePointerCapture(e.pointerId) } catch { /* not captured */ } }
      else glide = 0
      if (performance.now() - drag.tl > 120) glide = 0
      drag = null
    }
    const enter = (e: PointerEvent) => { if (e.pointerType === 'mouse') over = true }
    const leave = () => { over = false }
    addEventListener('scroll', onScroll, { passive: true })
    v.addEventListener('wheel', onWheel, { passive: false })
    v.addEventListener('pointerdown', down)
    v.addEventListener('pointermove', move)
    v.addEventListener('pointerup', up)
    v.addEventListener('pointercancel', up)
    v.addEventListener('pointerenter', enter)
    v.addEventListener('pointerleave', leave)
    draw()
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); removeEventListener('scroll', onScroll)
      v.removeEventListener('wheel', onWheel); v.removeEventListener('pointerdown', down); v.removeEventListener('pointermove', move)
      v.removeEventListener('pointerup', up); v.removeEventListener('pointercancel', up)
      v.removeEventListener('pointerenter', enter); v.removeEventListener('pointerleave', leave)
    }
  }, [])
  return (
    <div ref={vp} className="dv-vp" role="region" aria-label="GameCove charts, a moving row. Drag sideways to move it.">
      <div ref={rail} className="dv-rail">
        <div ref={set} className="dv-set"><Cards /></div>
        <div className="dv-set" aria-hidden="true"><Cards /></div>
      </div>
    </div>
  )
}

/* ---------- section ---------- */

export function DataVisuals() {
  return (
    <section className="dv" aria-labelledby="dv-title">
      <style>{DV_CSS}</style>
      <div className="dv-head" data-r>
        <div className="g-eyebrow sq-blue"><i aria-hidden="true" />{HEAD.eyebrow}</div>
        <h2 id="dv-title" className="g-h2 mt-40">{HEAD.title}</h2>
        <p className="dv-lead">{HEAD.body}</p>
      </div>
      <Marquee />
    </section>
  )
}

export const DV_CSS = `
.gc4 .dv { margin-top: 160px; }
.gc4 .dv-head { max-width: 760px; }
.gc4 .dv-lead { margin: 24px 0 0; font-size: 18px; line-height: 28px; color: #6E7078; }

/* Nov 20 (Harbor): the design-system section is white like the sections above and below it, with no dividing line
   (overrides GameCoveV4.tsx .g-dssec, which v31 gave a #F1F1EE background and a top border) */
.gc .gc4 .g-final.g-dssec { --dsbg: #FFFFFF; background: #FFFFFF; border-top: 0; }

/* the row starts at the text column (clear of the side contents) and runs to the window's right edge; the section clips
   it sideways (overflow-x: clip keeps sticky working) */
.gc .gc4 .g-final.g-dssec { overflow-x: clip; }
.gc4 .dv-vp { position: relative; width: calc(100% + (100vw - 100%) / 2); margin: 56px 0 0; overflow: hidden; padding: 8px 0 24px;
  cursor: grab; touch-action: pan-y; user-select: none; -webkit-user-select: none;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 48px); mask-image: linear-gradient(90deg, transparent, #000 48px); }
.gc4 .dv-vp.dragging { cursor: grabbing; }
.gc4 .dv-vp.dragging .dv-tip { display: none; }
.gc4 .dv-rail { display: flex; column-gap: 24px; width: max-content; will-change: transform; }
.gc4 .dv-set { display: flex; gap: 24px; }

/* the chart card: every card the same size (Harbor: "사이즈 다 통일") */
.gc4 .dv-chart { position: relative; flex: none; display: flex; flex-direction: column; width: 576px; height: 448px; box-sizing: border-box; padding: 24px;
  overflow: hidden; background: #17171B; color: #F2F0EC; box-shadow: inset 0 0 0 1px #2A2A30; }
.gc .gc4 .dv .dv-chart { border-radius: 16px !important; }
.gc4 .dv-ct { display: flex; align-items: center; gap: 8px; flex: none; font-size: 18px; font-weight: 700; line-height: 26px; color: #F2F0EC; white-space: nowrap; }
.gc4 .dv-info { flex: none; color: #A7A9B0; }
/* long charts are cut at the card's height and fade out over the last 64px */
.gc4 .dv-body { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column;
  -webkit-mask-image: linear-gradient(180deg, #000 calc(100% - 64px), transparent); mask-image: linear-gradient(180deg, #000 calc(100% - 64px), transparent); }
.gc4 .dv-sub { margin-top: 12px; font-size: 16px; line-height: 24px; color: #A7A9B0; }
.gc4 .dv-big { font-size: 28px; font-weight: 700; line-height: 36px; color: #F2F0EC; }

/* line charts */
.gc4 .dv-lb { display: grid; grid-template-columns: 40px minmax(0, 1fr); grid-template-rows: 184px auto; column-gap: 8px; margin-top: 16px; padding-right: 28px; }
.gc4 .dv-yax { display: flex; flex-direction: column; justify-content: space-between; margin: -12px 0; font-size: 16px; line-height: 24px; color: #666970; text-align: right; white-space: nowrap; }
.gc4 .dv-plot { position: relative; cursor: crosshair; }
.gc4 .dv-plot svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.gc4 .dv-gl { stroke: #24262B; stroke-width: 1; vector-effect: non-scaling-stroke; }
.gc4 .dv-base { stroke: #3A3D44; stroke-width: 1; vector-effect: non-scaling-stroke; }
.gc4 .dv-line { fill: none; stroke-width: 2; vector-effect: non-scaling-stroke; }
.gc4 .dv-line.new { stroke: #3898F8; }
.gc4 .dv-line.ret { stroke: #8A8D96; }
.gc4 .dv-area.new { fill: rgba(68,120,240,.28); }
.gc4 .dv-area.ret { fill: rgba(242,240,236,.1); }
.gc4 .dv-xax { grid-column: 2; display: flex; justify-content: space-between; margin: 8px -24px 0; font-size: 16px; line-height: 24px; color: #666970; }
.gc4 .dv-xax span { width: 48px; text-align: center; white-space: nowrap; display: flex; justify-content: center; }
.gc4 .dv-legend { display: flex; justify-content: center; gap: 24px; margin-top: 12px; font-size: 16px; line-height: 24px; color: #A7A9B0; }
.gc4 .dv-legend span { display: inline-flex; align-items: center; gap: 8px; }
.gc4 .dv-legend i { width: 16px; height: 2px; background: #3898F8; }
.gc4 .dv-legend .ret i { background: #8A8D96; }
.gc4 .dv-dot { position: absolute; z-index: 2; width: 10px; height: 10px; margin: -5px 0 0 -5px; pointer-events: none; }
.gc .gc4 .dv .dv-dot { border-radius: 50% !important; }
.gc4 .dv-dot.new { background: #3898F8; box-shadow: 0 0 0 4px rgba(56,152,248,.28); }
.gc4 .dv-dot.ret { background: #8A8D96; box-shadow: 0 0 0 4px rgba(138,141,150,.28); }

/* tooltips: light = the GameCove dashboard's; dark = Figma's exit-rate tooltip */
.gc4 .dv-tip { position: absolute; z-index: 3; pointer-events: none; white-space: nowrap; font-size: 16px; line-height: 24px; }
.gc4 .dv-tip.light { padding: 12px 16px; background: #F2F0EC; color: #111114; box-shadow: 0 4px 12px rgba(0,0,0,.1); }
.gc4 .dv-tip.dark { display: flex; flex-direction: column; padding: 8px 12px; background: #1C1C21; color: #F2F0EC; box-shadow: inset 0 0 0 1px #3898F8, 0 16px 32px rgba(0,0,0,.35); }
.gc4 .dv-tip.dark span { color: #8A8D96; }
.gc .gc4 .dv .dv-tip, .gc .gc4 .dv .dv-tip.light, .gc .gc4 .dv .dv-tip.dark { border-radius: 8px !important; }
.gc4 .dv-plot .dv-tip.light { transform: translate(-50%, calc(-100% - 16px)); }
.gc4 .dv-plot .dv-tip.light.to-left { transform: translate(calc(-100% + 24px), calc(-100% - 16px)); }
.gc4 .dv-plot .dv-tip.light.to-right { transform: translate(-24px, calc(-100% - 16px)); }
.gc4 .dv-plot .dv-tip.light.below { transform: translate(-50%, 16px); }
.gc4 .dv-plot .dv-tip.light.below.to-left { transform: translate(calc(-100% + 24px), 16px); }
.gc4 .dv-plot .dv-tip.light.below.to-right { transform: translate(-24px, 16px); }
.gc4 .dv-tip.light .d { color: #6B7280; }
.gc4 .dv-tip.light .v, .gc4 .dv-tip.light b { font-weight: 700; }
.gc4 .dv-tip.light .r { display: flex; justify-content: space-between; gap: 24px; }

/* traffic sources */
.gc4 .dv-tr { list-style: none; margin: 16px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.gc4 .dv-row { position: relative; padding: 8px 12px 12px; margin: 0 -12px; }
.gc4 .dv-row::before { content: ""; position: absolute; inset: 0; background: rgba(242,240,236,.08); opacity: 0; transition: opacity .2s ease; }
.gc .gc4 .dv .dv-row::before { border-radius: 8px !important; }
.gc4 .dv-row:hover::before { opacity: 1; }
.gc4 .dv-row .l { position: relative; display: flex; align-items: center; gap: 12px; font-size: 16px; line-height: 24px; color: #F2F0EC; }
.gc4 .dv-row .l span { flex: 1; min-width: 0; }
.gc4 .dv-row .l b { font-weight: 400; }
.gc4 .dv-row .l em { font-style: normal; color: #A7A9B0; opacity: 0; transition: opacity .2s ease; }
.gc4 .dv-row:hover .l em { opacity: 1; }
.gc4 .dv-track { position: relative; height: 4px; margin-top: 8px; background: #24262B; }
.gc4 .dv-track i { display: block; height: 100%; background: #3898F8; }
.gc .gc4 .dv .dv-track, .gc .gc4 .dv .dv-track i { border-radius: 2px !important; }

/* horizontal bars (exit rate, session flow) */
.gc4 .dv-bars { position: relative; margin-top: 16px; display: flex; flex-direction: column; }
.gc4 .dv-bar-row { display: grid; grid-template-columns: 112px minmax(0, 1fr) 64px; align-items: center; gap: 12px; height: 48px; cursor: default; }
.gc4 .dv-bar-row .t { font-size: 16px; line-height: 24px; color: #8A8D96; white-space: nowrap; transition: color .2s; }
.gc4 .dv-bar-row .v { font-size: 16px; line-height: 24px; color: #A7A9B0; text-align: right; }
.gc4 .dv-bar-row.on .t, .gc4 .dv-bar-row.on .v { color: #F2F0EC; }
.gc4 .dv-bar { position: relative; height: 24px; background: #1D1F22; }
.gc4 .dv-bar > i { position: absolute; left: 0; top: 0; bottom: 0; background: #3A3D46; transition: background-color .25s ease; }
.gc .gc4 .dv .dv-bar, .gc .gc4 .dv .dv-bar > i { border-radius: 4px !important; }
.gc4 .dv-bar-row.on .dv-bar > i { background: #3898F8; }
.gc4 .dv-bar .dv-tip { bottom: calc(100% + 8px); transform: translateX(-100%); }
.gc4 .dv-bar .dv-tip.below { bottom: auto; top: calc(100% + 8px); }
.gc4 .dv-flow-from { display: flex; align-items: baseline; gap: 12px; margin-top: 16px; padding: 12px 16px; background: #1D1F22; font-size: 16px; line-height: 24px; }
.gc .gc4 .dv .dv-flow-from { border-radius: 8px !important; }
.gc4 .dv-flow-from span { color: #8A8D96; }

/* columns (average time spent) */
.gc4 .dv-cols { display: grid; grid-template-columns: 40px minmax(0, 1fr); grid-template-rows: 248px auto; column-gap: 8px; margin-top: 24px; }
.gc4 .dv-colplot { position: relative; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; align-items: end; border-bottom: 1px solid #3A3D44; }
.gc4 .dv-colplot .gl { position: absolute; left: 0; right: 0; height: 1px; background: #24262B; }
.gc4 .dv-col { position: relative; height: 100%; display: flex; align-items: flex-end; justify-content: center; cursor: default; }
.gc4 .dv-col > i { position: relative; display: block; width: 48px; font-style: normal; background: #3A3D46; transition: background-color .25s ease; }
.gc .gc4 .dv .dv-col > i { border-radius: 4px 4px 0 0 !important; }
.gc4 .dv-col.on > i { background: #3898F8; }
.gc4 .dv-col .dv-tip.up { left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%); }
.gc4 .dv-col .dv-tip.up.to-left { left: auto; right: 0; transform: none; }
.gc4 .dv-col .dv-tip.up.to-right { left: 0; transform: none; }
.gc4 .dv-xax.cols { margin: 8px 0 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; }
.gc4 .dv-xax.cols span { width: auto; }

/* funnels (stage progression, new user progression) */
.gc4 .dv-kpis { display: flex; gap: 16px; margin-top: 16px; }
.gc4 .dv-kpis > div { display: flex; flex-direction: column; padding-right: 16px; border-right: 1px solid #2A2A30; }
.gc4 .dv-kpis > div:last-child { border-right: 0; }
.gc4 .dv-kpis span { font-size: 16px; line-height: 24px; color: #A7A9B0; white-space: nowrap; }
.gc4 .dv-kpis b { font-size: 28px; font-weight: 700; line-height: 36px; }
.gc4 .dv-fu-h { display: flex; align-items: center; gap: 16px; margin-top: 24px; font-size: 16px; line-height: 24px; color: #A7A9B0; }
.gc4 .dv-fu-h b { color: #F2F0EC; font-weight: 700; }
/* "dv-key", not "lg" or "fl": the GameCove page already styles those (a 16px swatch, a 56px top margin) */
.gc4 .dv-fu-h .dv-key { display: inline-flex; align-items: center; gap: 8px; margin: 0; }
.gc4 .dv-fu-h .dv-key i { display: block; width: 10px; height: 10px; background: #3A3D46; }
.gc4 .dv-fu-h .dv-key i.dr { background: repeating-linear-gradient(135deg, #8A93A6 0 2px, #3A3D46 2px 4px); }
.gc .gc4 .dv .dv-fu-h .dv-key i { border-radius: 2px !important; }
.gc4 .dv-fu { margin-top: 8px; }
.gc4 .dv-fu-row { position: relative; display: grid; grid-template-columns: 136px minmax(0, 1fr) 48px 72px; align-items: center; gap: 12px; height: 36px; font-size: 16px; line-height: 24px; cursor: default; }
.gc4 .dv-fu-row.hd { height: 32px; color: #8A8D96; border-bottom: 1px solid #2A2A30; }
.gc4 .dv-fu-row .t { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gc4 .dv-fu-row .n { text-align: right; color: #A7A9B0; }
.gc4 .dv-fu-row .dp { display: inline-flex; align-items: center; justify-content: flex-end; gap: 4px; }
.gc4 .dv-fu-row.worst .t, .gc4 .dv-fu-row.worst .n:not(.dp) { font-weight: 700; color: #F2F0EC; }
.gc4 .dv-fu-row.worst .dp { color: #E28B8B; }
.gc4 .dv-fu-row.on::before { content: ""; position: absolute; inset: 2px -12px; background: rgba(242,240,236,.08); }
.gc .gc4 .dv .dv-fu-row.on::before { border-radius: 8px !important; }
.gc4 .dv-fbar { position: relative; height: 24px; background: #1D1F22; }
.gc4 .dv-fbar > i { position: absolute; top: 0; bottom: 0; }
.gc4 .dv-fbar .re { left: 0; display: flex; align-items: center; justify-content: flex-end; background: #3A3D46; }
.gc4 .dv-fbar .re em { padding-right: 6px; font-style: normal; font-size: 16px; color: #C9CAD0; white-space: nowrap; }
/* short bars put their share just outside, after the dropped part (left set inline) */
.gc4 .dv-fbar .re.out { z-index: 1; }
.gc4 .dv-fbar .re.out em { position: absolute; padding: 0; }
.gc4 .dv-fbar .dr { background: repeating-linear-gradient(135deg, rgba(138,147,166,.75) 0 2px, rgba(58,61,70,.6) 2px 6px); }
.gc4 .dv-fu-row.worst .dv-fbar .dr { background: repeating-linear-gradient(135deg, rgba(226,139,139,.7) 0 2px, rgba(58,40,44,.6) 2px 6px); }
.gc .gc4 .dv .dv-fbar, .gc .gc4 .dv .dv-fbar .re { border-radius: 4px !important; }
.gc4 .dv-fbar .dv-tip { left: 0; bottom: calc(100% + 8px); }
.gc4 .dv-fbar .dv-tip.below { bottom: auto; top: calc(100% + 8px); }

/* date cohort retention */
.gc4 .dv-co { width: 100%; margin-top: 16px; border-collapse: separate; border-spacing: 0 4px; font-size: 16px; line-height: 24px; }
.gc4 .dv-co th { padding: 0 2px 2px; font-weight: 400; color: #8A8D96; text-align: center; white-space: nowrap; }
.gc4 .dv-co th.dc, .gc4 .dv-co td.dc { text-align: left; padding-left: 0; }
.gc4 .dv-co th.u, .gc4 .dv-co td.u { text-align: right; padding-right: 12px; }
.gc4 .dv-co td { padding: 0 2px; color: #C9CAD0; text-align: center; white-space: nowrap; }
.gc4 .dv-cell { position: relative; display: flex; align-items: center; justify-content: center; height: 36px; color: #F2F0EC; cursor: default;
  background: rgba(56,152,248,var(--a)); transition: box-shadow .15s ease, filter .15s ease; }
.gc .gc4 .dv .dv-cell { border-radius: 6px !important; }
.gc4 .dv-cell.on { box-shadow: inset 0 0 0 1px rgba(242,240,236,.7); filter: brightness(1.15); }
.gc4 .dv-co .na { color: #666970; }
.gc4 .dv-tip.light.cell { left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%); display: flex; flex-direction: column; text-align: left; }
.gc4 .dv-tip.light.cell.below { bottom: auto; top: calc(100% + 8px); }
.gc4 .dv-tip.light.cell.to-left { left: auto; right: 0; transform: none; }

@media (max-width: 1023px) {
  .gc4 .dv { margin-top: 120px; }
  .gc4 .dv-vp { margin-top: 40px; }
}
@media (max-width: 700px) {
  .gc4 .dv-chart { width: min(576px, calc(100vw - 48px)); height: 448px; }
  .gc4 .dv-kpis b { font-size: 24px; line-height: 32px; }
  .gc4 .dv-fu-row { grid-template-columns: 112px minmax(0, 1fr) 40px 64px; gap: 8px; }
  .gc4 .dv-xax span:nth-child(even) { visibility: hidden; }
}
`
