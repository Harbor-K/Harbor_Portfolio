import React, { useMemo, useRef, useState } from 'react'

/**
 * GameCove "Data visuals" section (Harbor Nov 19, Figma "Section · Data visuals · Framer style", file 44기 김지현 4차
 * 랜딩페이지, node 2044:3514). Sits right under the design system (rendered at the end of DsLayers, GameCoveDS.tsx).
 * Three light cards with a soft blue glow (Framer-style bento), each holding a dark chart card from the live dashboard.
 * In Figma the chart cards are screenshots; here they are built as UI so they answer the pointer the way the
 * GameCove dashboard does (game-cove.vercel.app, checked Nov 19):
 *  - New and returning users: the pointer snaps to the nearest day, both lines get a dot, and a light tooltip shows
 *    the date with New / Returning users (the dashboard's tooltip: #F2F0EC, 8px corners, 16px padding).
 *  - Traffic sources: the row under the pointer gets the dashboard's row highlight (data/select/row, 8px corners).
 *  - Session exit rate: the bar under the pointer turns blue and the tooltip (Figma's: dark, blue edge, marker and
 *    leader) moves to it; Stage 4 is shown when nothing is pointed at, as in Figma.
 *  - Date cohort retention: a cell shows "13.5% / 13 of 96 users" in the dashboard's light tooltip.
 * Numbers: the BounceBounce dummy data v8 (whdhrrk/gamecove data/source/v8-rework/v8-review-tables.md, Last 7 days
 * Sep 16–22) and the live dashboard's own tooltips — nothing estimated. Traffic shares are the dashboard's Overview card.
 * Site rules kept: Roboto (index.css), nothing under 16px, 1440 container. The dark chart cards keep the product's
 * rounded corners (16 / 8), like the design-system outlines above them.
 * v31 (Harbor Nov 19): titles no longer break (the class "lg" clashed with a 16px legend swatch on the page, now "big"),
 * the chart cards fade out at the bottom of their light card instead of a hard cut, every row fits above the fade,
 * date labels stay on one line, and the cohort tooltip opens above its cell. Light cards are white on the section's
 * #F1F1EE so they stand out.
 */

/* ---------- data ---------- */

const DAYS = ['Sep 16', 'Sep 17', 'Sep 18', 'Sep 19', 'Sep 20', 'Sep 21', 'Sep 22']
const NEW_USERS = [124, 111, 96, 99, 74, 84, 53]
const RETURNING = [153, 165, 158, 137, 153, 119, 81]
const Y_MAX = 250

type Src = 'home' | 'search' | 'youtube' | 'instagram' | 'other'
const TRAFFIC: { id: Src; t: string; v: number }[] = [
  { id: 'home', t: 'Home recommendations', v: 63 },
  { id: 'search', t: 'Search', v: 11 },
  { id: 'youtube', t: 'YouTube', v: 3 },
  { id: 'instagram', t: 'Instagram', v: 3 },
  { id: 'other', t: 'Unattributed', v: 20 },
]

const EXIT = [
  { t: 'Lobby', rate: 38.8, exits: 797, visits: 2055 },
  { t: 'Stage 1', rate: 55.9, exits: 358, visits: 641 },
  { t: 'Stage 2', rate: 44.3, exits: 198, visits: 447 },
  { t: 'Stage 3', rate: 52.8, exits: 230, visits: 436 },
  { t: 'Stage 4', rate: 82.2, exits: 472, visits: 574 },
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

const HEAD = { eyebrow: 'DATA VISUALS', title: 'See your game in three cards' }
const CARDS = {
  players: { t: 'Players and sources', d: 'How many players came, who came back, and where new players found the game.' },
  quit: { t: 'Where players quit', d: 'Session exit rate by stage. Stage 4 stands out at 82.2%.' },
  back: { t: 'Who comes back', d: 'Retention by start date, day by day.' },
}

/* ---------- helpers ---------- */

/** smooth line through the points without overshooting (monotone cubic), in a 0..W × 0..H box */
function monotonePath(xs: number[], ys: number[]) {
  const n = xs.length
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

/* ---------- chart cards ---------- */

/** New and returning users: the pointer snaps to a day; dots on both lines + the dashboard's light tooltip */
function NewReturning() {
  const W = 600, H = 200
  const plot = useRef<HTMLDivElement>(null)
  const [hi, setHi] = useState<number | null>(null)
  const xs = DAYS.map((_, i) => (i / (DAYS.length - 1)) * W)
  const y = (v: number) => H - (v / Y_MAX) * H
  const paths = useMemo(() => {
    const nl = monotonePath(xs, NEW_USERS.map(y)), rl = monotonePath(xs, RETURNING.map(y))
    return { nl, rl, na: `${nl} L${W} ${H} L0 ${H} Z`, ra: `${rl} L${W} ${H} L0 ${H} Z` }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const move = (e: React.PointerEvent) => {
    const r = plot.current?.getBoundingClientRect(); if (!r) return
    const i = Math.round(((e.clientX - r.left) / r.width) * (DAYS.length - 1))
    setHi(Math.max(0, Math.min(DAYS.length - 1, i)))
  }
  const pct = (i: number) => `${(i / (DAYS.length - 1)) * 100}%`
  const top = (v: number) => `${(1 - v / Y_MAX) * 100}%`
  return (
    <div className="dv-chart dv-nr">
      <div className="dv-ct">New and returning users <Info /></div>
      <div className="dv-sub">Today (Sep 22)</div>
      <div className="dv-big">53 users</div>
      <div className="dv-nr-body">
        <div className="dv-yax" aria-hidden="true">{[250, 200, 150, 100, 50, 0].map(v => <span key={v}>{v}</span>)}</div>
        <div ref={plot} className="dv-plot" onPointerMove={move} onPointerDown={move} onPointerLeave={() => setHi(null)}
          role="img" aria-label="New and returning users, Sep 16 to Sep 22. New: 124, 111, 96, 99, 74, 84, 53. Returning: 153, 165, 158, 137, 153, 119, 81.">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="dv-g-ret" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2F0EC" stopOpacity=".2" /><stop offset="1" stopColor="#F2F0EC" stopOpacity="0" /></linearGradient>
              <linearGradient id="dv-g-new" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4478F0" stopOpacity=".42" /><stop offset="1" stopColor="#4478F0" stopOpacity="0" /></linearGradient>
            </defs>
            {[50, 100, 150, 200, 250].map(v => <line key={v} x1="0" x2={W} y1={y(v)} y2={y(v)} className="dv-gl" />)}
            <path d={paths.ra} fill="url(#dv-g-ret)" />
            <path d={paths.na} fill="url(#dv-g-new)" />
            <path d={paths.rl} className="dv-line ret" />
            <path d={paths.nl} className="dv-line new" />
            <line x1="0" x2={W} y1={H} y2={H} className="dv-base" />
          </svg>
          {hi !== null && (
            <>
              <i className="dv-dot ret" style={{ left: pct(hi), top: top(RETURNING[hi]) }} />
              <i className="dv-dot new" style={{ left: pct(hi), top: top(NEW_USERS[hi]) }} />
              <div className={'dv-tip light' + (hi >= DAYS.length - 2 ? ' to-left' : hi === 0 ? ' to-right' : '')}
                style={{ left: pct(hi), top: top(Math.max(NEW_USERS[hi], RETURNING[hi])) }}>
                <div className="d">{DAYS[hi]}</div>
                <div className="r"><span>New</span><b>{NEW_USERS[hi]} users</b></div>
                <div className="r"><span>Returning</span><b>{RETURNING[hi]} users</b></div>
              </div>
            </>
          )}
        </div>
        <div className="dv-xax" aria-hidden="true">{DAYS.map(d => <span key={d}>{d}</span>)}</div>
      </div>
    </div>
  )
}

/** Traffic sources: the row under the pointer gets the dashboard's row highlight */
function Traffic() {
  return (
    <div className="dv-chart dv-tr">
      <div className="dv-ct big">Traffic sources <Info /></div>
      <ul>
        {TRAFFIC.map((s, i) => (
          <li key={s.id} className="dv-tr-row" style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
            <div className="l"><SrcIcon id={s.id} /><span>{s.t}</span><b>{s.v}%</b></div>
            <div className="dv-track"><i style={{ width: `${s.v}%` }} /></div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Session exit rate: the hovered bar turns blue and the tooltip moves to it (Stage 4 by default, as in Figma) */
function ExitRate() {
  const [hot, setHot] = useState<number | null>(null)
  const sel = hot ?? EXIT.length - 1
  const s = EXIT[sel]
  const below = sel < 2 // the top rows open their tooltip underneath, so it stays inside the card
  return (
    <div className="dv-chart dv-ex">
      <div className="dv-ex-head"><span className="dv-ct">Session exit rate <Info /></span><span className="dv-pill">Last 7 days <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span></div>
      <div className="dv-ex-rows" onPointerLeave={() => setHot(null)}>
        {EXIT.map((r, i) => (
          <div key={r.t} className={'dv-ex-row' + (i === sel ? ' on' : '')} onPointerEnter={() => setHot(i)} onFocus={() => setHot(i)} onBlur={() => setHot(null)} tabIndex={0}
            aria-label={`${r.t}: ${r.rate}% exit rate, ${r.exits} of ${r.visits} sessions`}>
            <span className="t">{r.t}</span>
            <span className="dv-ex-bar"><i style={{ width: `${r.rate}%` }} /></span>
          </div>
        ))}
        <div className={'dv-ex-pin' + (below ? ' below' : '')} style={{ '--row': sel, '--wf': s.rate / 100 } as React.CSSProperties} aria-hidden="true">
          <i className="mk" /><i className="ld" />
          <div className="dv-tip dark">
            <div className="h"><i />{s.t}</div>
            <div className="v">{s.rate}% exit rate</div>
            <div className="s">{s.exits} of {s.visits} sessions</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Date cohort retention: a cell shows its share and head count in the dashboard's light tooltip */
function Cohort() {
  const vals = COHORTS.flatMap(r => r.c.filter((c): c is [number, number] => !!c).map(c => c[0]))
  const lo = Math.min(...vals), hi = Math.max(...vals)
  const alpha = (v: number) => 0.24 + ((v - lo) / (hi - lo)) * (0.7 - 0.24)
  const [tip, setTip] = useState<{ r: number; c: number } | null>(null)
  return (
    <div className="dv-chart dv-co">
      <div className="dv-ct big">Date cohort retention <Info /></div>
      <table onPointerLeave={() => setTip(null)}>
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
                      tabIndex={0} onPointerEnter={() => setTip({ r, c: k })} onFocus={() => setTip({ r, c: k })} onBlur={() => setTip(null)}
                      aria-label={`${row.d}, day ${k + 1}: ${c[0].toFixed(1)}%, ${c[1]} of ${row.users} users`}>
                      {c[0].toFixed(1)}%
                      {tip && tip.r === r && tip.c === k && (
                        <span className={'dv-tip light cell' + (k >= 4 ? ' to-left' : '')}><b>{c[0].toFixed(1)}%</b><span>{c[1]} of {row.users} users</span></span>
                      )}
                    </span>
                  ) : <span className="na">N/A</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
      </div>
      <div className="dv-grid">
        <article className="dv-card tall g1" data-r>
          <div className="dv-tx"><h3>{CARDS.players.t}</h3><p>{CARDS.players.d}</p></div>
          <div className="dv-clip">
            <div className="dv-slot nr"><NewReturning /></div>
            <div className="dv-slot tr"><Traffic /></div>
          </div>
        </article>
        <article className="dv-card g2" data-r>
          <div className="dv-tx"><h3>{CARDS.quit.t}</h3><p>{CARDS.quit.d}</p></div>
          <div className="dv-clip"><div className="dv-slot ex"><ExitRate /></div></div>
        </article>
        <article className="dv-card g3" data-r>
          <div className="dv-tx"><h3>{CARDS.back.t}</h3><p>{CARDS.back.d}</p></div>
          <div className="dv-clip"><div className="dv-slot co"><Cohort /></div></div>
        </article>
      </div>
    </section>
  )
}

const GLOW = (x: string, y: string) => `radial-gradient(380px circle at ${x} ${y}, rgba(56,152,248,.28) 0, rgba(142,194,255,.12) 190px, rgba(255,255,255,0) 380px)`

export const DV_CSS = `
.gc4 .dv { margin-top: 160px; }
.gc4 .dv-head { max-width: 760px; }
.gc4 .dv-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: 492px 492px; gap: 16px; margin-top: 56px; }

/* the light cards: Figma 712 × 1000 / 712 × 492, 40px padding, a soft blue glow from one corner */
.gc4 .dv-card { position: relative; overflow: hidden; padding: 40px; background-color: #FFFFFF; transition: background-position .8s cubic-bezier(.22,1,.36,1); }
.gc4 .dv-card.tall { grid-row: span 2; }
.gc4 .dv-card.g1 { background-image: ${GLOW('95%', '102%')}; }
.gc4 .dv-card.g2 { background-image: ${GLOW('104%', '-8%')}; }
.gc4 .dv-card.g3 { background-image: ${GLOW('11%', '126%')}; }
.gc4 .dv-tx { position: relative; z-index: 1; max-width: 440px; }
.gc4 .dv-tx h3 { margin: 0; font-size: 20px; font-weight: 500; line-height: 28px; color: #111114; }
.gc4 .dv-tx p { margin: 8px 0 0; font-size: 16px; line-height: 24px; color: #6E7078; }

/* the dark chart cards sit in the light card and run off its edge, like Figma; v31 (Harbor Nov 19): instead of a hard
   cut at the card's edge they fade out over its last 88px */
.gc4 .dv-clip { position: absolute; inset: 0; overflow: hidden; pointer-events: none;
  -webkit-mask-image: linear-gradient(180deg, #000 calc(100% - 88px), transparent); mask-image: linear-gradient(180deg, #000 calc(100% - 88px), transparent); }
.gc4 .dv-clip .dv-slot { pointer-events: auto; }
.gc4 .dv-slot { position: absolute; z-index: 1; transition: transform .6s cubic-bezier(.22,1,.36,1); }
.gc4 .dv-slot.nr { left: 40px; right: 40px; top: 152px; }
.gc4 .dv-slot.tr { left: 40px; right: 56px; top: 544px; }
.gc4 .dv-slot.ex { left: 40px; right: 40px; top: 148px; }
.gc4 .dv-slot.co { left: 40px; right: 0; top: 128px; }
.gc4 .dv-card:hover .dv-slot { transform: translateY(-6px); }

.gc4 .dv-chart { position: relative; padding: 24px; background: #17171B; color: #F2F0EC; box-shadow: inset 0 0 0 1px #2A2A30; }
.gc .gc4 .dv .dv-chart { border-radius: 16px !important; }
.gc4 .dv-ct { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; line-height: 26px; color: #F2F0EC; }
.gc4 .dv-ct.big { font-size: 24px; line-height: 32px; }
.gc4 .dv-info { flex: none; color: #A7A9B0; }
.gc4 .dv-sub { margin-top: 12px; font-size: 16px; line-height: 24px; color: #A7A9B0; }
.gc4 .dv-big { font-size: 28px; font-weight: 700; line-height: 36px; color: #F2F0EC; }

/* new and returning users */
.gc4 .dv-nr-body { display: grid; grid-template-columns: 40px minmax(0, 1fr); grid-template-rows: 176px auto; column-gap: 8px; margin-top: 16px; }
.gc4 .dv-yax { display: flex; flex-direction: column; justify-content: space-between; margin: -12px 0; font-size: 16px; line-height: 24px; color: #666970; text-align: right; }
.gc4 .dv-plot { position: relative; cursor: crosshair; touch-action: pan-y; }
.gc4 .dv-plot svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.gc4 .dv-gl { stroke: #24262B; stroke-width: 1; vector-effect: non-scaling-stroke; }
.gc4 .dv-base { stroke: #3A3D44; stroke-width: 1; vector-effect: non-scaling-stroke; }
.gc4 .dv-line { fill: none; stroke-width: 2; vector-effect: non-scaling-stroke; }
.gc4 .dv-line.new { stroke: #3898F8; }
.gc4 .dv-line.ret { stroke: #8A8D96; }
.gc4 .dv-xax { grid-column: 2; display: flex; justify-content: space-between; margin: 8px -24px 0; font-size: 16px; line-height: 24px; color: #666970; }
.gc4 .dv-xax span { width: 48px; text-align: center; white-space: nowrap; display: flex; justify-content: center; }
.gc4 .dv-dot { position: absolute; z-index: 2; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; pointer-events: none; }
.gc4 .dv-dot.new { background: #3898F8; box-shadow: 0 0 0 4px rgba(56,152,248,.28); }
.gc4 .dv-dot.ret { background: #8A8D96; box-shadow: 0 0 0 4px rgba(138,141,150,.28); }

/* tooltips: light = the GameCove dashboard's; dark = Figma's exit-rate tooltip */
.gc4 .dv-tip { position: absolute; z-index: 3; pointer-events: none; white-space: nowrap; font-size: 16px; line-height: 24px; }
.gc4 .dv-tip.light { padding: 16px; background: #F2F0EC; color: #111114; box-shadow: 0 4px 12px rgba(0,0,0,.1); }
.gc .gc4 .dv .dv-tip.light, .gc .gc4 .dv .dv-tip.dark { border-radius: 8px !important; }
.gc4 .dv-plot .dv-tip.light { transform: translate(-50%, calc(-100% - 20px)); }
.gc4 .dv-plot .dv-tip.light.to-left { transform: translate(calc(-100% + 24px), calc(-100% - 20px)); }
.gc4 .dv-plot .dv-tip.light.to-right { transform: translate(-24px, calc(-100% - 20px)); }
.gc4 .dv-tip.light .d { color: #6B7280; }
.gc4 .dv-tip.light .r { display: flex; justify-content: space-between; gap: 24px; }
.gc4 .dv-tip.light b { font-weight: 700; }

/* traffic sources (Figma shows this card zoomed in, so its type runs larger) */
.gc4 .dv-tr { padding: 32px 32px 40px; }
.gc4 .dv-tr ul { list-style: none; margin: 24px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.gc4 .dv-tr-row { position: relative; padding: 10px 12px 12px; margin: 0 -12px; cursor: default; }
.gc4 .dv-tr-row::before { content: ""; position: absolute; inset: 0; background: rgba(242,240,236,.08); opacity: 0; transition: opacity .2s ease; }
.gc .gc4 .dv .dv-tr-row::before { border-radius: 8px !important; }
.gc4 .dv-tr-row:hover::before { opacity: 1; }
.gc4 .dv-tr-row .l { position: relative; display: flex; align-items: center; gap: 12px; font-size: 20px; line-height: 28px; color: #F2F0EC; }
.gc4 .dv-tr-row .l span { flex: 1; min-width: 0; }
.gc4 .dv-tr-row .l b { font-weight: 400; }
.gc4 .dv-track { position: relative; height: 4px; margin-top: 10px; background: #24262B; }
.gc4 .dv-track i { display: block; height: 100%; background: #3898F8; transform-origin: left; transform: scaleX(0); transition: transform 1s cubic-bezier(.22,1,.36,1) var(--d, 0s); }
.gc .gc4 .dv .dv-track, .gc .gc4 .dv .dv-track i { border-radius: 2px !important; }
.gc4 .r-in .dv-track i { transform: none; }

/* session exit rate */
.gc4 .dv-ex-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.gc4 .dv-pill { display: inline-flex; align-items: center; gap: 4px; font-size: 16px; line-height: 24px; color: #A7A9B0; }
.gc4 .dv-ex-rows { position: relative; margin-top: 16px; --rh: 36px; }
.gc4 .dv-ex-row { display: grid; grid-template-columns: 72px minmax(0, 1fr); align-items: center; height: var(--rh); cursor: default; outline: none; }
.gc4 .dv-ex-row .t { font-size: 16px; line-height: 24px; color: #8A8D96; transition: color .2s; }
.gc4 .dv-ex-row.on .t { color: #F2F0EC; }
.gc4 .dv-ex-bar { position: relative; height: 20px; background: #1D1F22; }
.gc4 .dv-ex-bar i { position: absolute; left: 0; top: 0; bottom: 0; background: #3A3D46; transition: background-color .25s ease, transform 1s cubic-bezier(.22,1,.36,1); transform-origin: left; transform: scaleX(0); }
.gc .gc4 .dv .dv-ex-bar, .gc .gc4 .dv .dv-ex-bar i { border-radius: 4px !important; }
.gc4 .r-in .dv-ex-bar i { transform: none; }
.gc4 .dv-ex-row.on .dv-ex-bar i { background: #3898F8; }
.gc4 .dv-ex-row:focus-visible .t { text-decoration: underline; text-underline-offset: 4px; }
/* marker at the bar's end, a short leader, and the tooltip above it (below for the top two rows) */
.gc4 .dv-ex-pin { position: absolute; left: calc(72px + (100% - 72px) * var(--wf)); top: calc(var(--rh) * var(--row) + var(--rh) / 2); width: 0; height: 0;
  pointer-events: none; transition: left .35s cubic-bezier(.22,1,.36,1), top .35s cubic-bezier(.22,1,.36,1); }
.gc4 .dv-ex-pin .mk { position: absolute; left: -6px; top: -6px; width: 12px; height: 12px; border-radius: 50%; background: #F2F0EC; box-shadow: 0 0 0 3px #3898F8; }
.gc4 .dv-ex-pin .ld { position: absolute; left: 0; bottom: 6px; width: 1px; height: 22px; background: #3898F8; }
.gc4 .dv-ex-pin.below .ld { bottom: auto; top: 6px; }
.gc .gc4 .dv .dv-ex-pin .mk, .gc .gc4 .dv .dv-dot, .gc .gc4 .dv .dv-tip.dark .h i { border-radius: 50% !important; }
.gc4 .dv-tip.dark { right: -24px; bottom: 28px; padding: 12px 16px; background: #1C1C21; box-shadow: inset 0 0 0 1px #3898F8, 0 24px 48px rgba(0,0,0,.35); }
.gc4 .dv-ex-pin.below .dv-tip.dark { bottom: auto; top: 28px; }
.gc4 .dv-tip.dark .h { display: flex; align-items: center; gap: 8px; color: #F2F0EC; }
.gc4 .dv-tip.dark .h i { width: 8px; height: 8px; border-radius: 50%; background: #3898F8; }
.gc4 .dv-tip.dark .v { margin-top: 4px; color: #F2F0EC; }
.gc4 .dv-tip.dark .s { color: #8A8D96; }

/* date cohort retention */
.gc4 .dv-co { padding: 24px 24px 24px 24px; }
.gc4 .dv-co table { width: 100%; margin-top: 12px; border-collapse: separate; border-spacing: 0 4px; font-size: 16px; line-height: 24px; }
.gc4 .dv-co th { padding: 0 4px 2px; font-weight: 400; color: #8A8D96; text-align: center; }
.gc4 .dv-co th.dc, .gc4 .dv-co td.dc { text-align: left; padding-left: 0; }
.gc4 .dv-co th.u, .gc4 .dv-co td.u { text-align: right; padding-right: 16px; }
.gc4 .dv-co td { padding: 0 3px; color: #C9CAD0; text-align: center; white-space: nowrap; }
.gc4 .dv-cell { position: relative; display: flex; align-items: center; justify-content: center; height: 28px; color: #F2F0EC; cursor: default; outline: none;
  background: rgba(56,152,248,var(--a)); transition: box-shadow .15s ease, filter .15s ease; }
.gc .gc4 .dv .dv-cell { border-radius: 6px !important; }
.gc4 .dv-cell.on, .gc4 .dv-cell:focus-visible { box-shadow: inset 0 0 0 1px rgba(242,240,236,.7); filter: brightness(1.15); }
.gc4 .dv-co .na { color: #666970; }
.gc4 .dv-tip.light.cell { left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%); display: flex; flex-direction: column; text-align: left; filter: none; }
.gc4 .dv-tip.light.cell.to-left { left: auto; right: 0; transform: none; }

@media (max-width: 1280px) {
  .gc4 .dv-ct.big { font-size: 20px; line-height: 28px; }
  .gc4 .dv-tr-row .l { font-size: 18px; }
}
@media (max-width: 1023px) {
  .gc4 .dv { margin-top: 120px; }
  .gc4 .dv-grid { grid-template-columns: minmax(0, 1fr); grid-template-rows: none; }
  .gc4 .dv-card, .gc4 .dv-card.tall { grid-row: auto; padding: 24px; }
  .gc4 .dv-clip { position: static; -webkit-mask-image: none; mask-image: none; pointer-events: auto; }
  .gc4 .dv-slot { position: relative; left: auto !important; right: auto !important; top: auto !important; margin-top: 24px; }
  .gc4 .dv-card:hover .dv-slot { transform: none; }
  .gc4 .dv-co { overflow-x: auto; }
  .gc4 .dv-co table { min-width: 560px; }
}
@media (max-width: 600px) {
  .gc4 .dv-xax span:nth-child(even) { visibility: hidden; }
  .gc4 .dv-tr { padding: 24px 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .gc4 .dv-track i, .gc4 .dv-ex-bar i { transform: none !important; transition: none !important; }
  .gc4 .dv-slot, .gc4 .dv-ex-pin { transition: none !important; }
}
`
