import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DataVisuals } from './GameCoveDV'

/**
 * GameCove design system on the real design (v136, Harbor Nov 16, reference: v7labs.com "Build your own Interfaces").
 * Pinned while scrolling, the three live screens stack up one at a time — Tracking, then Retention on top of it, then
 * Overview on top — each with its name on a tab. Each time a screen lands, ONE label group appears beside it with a
 * single dashed line to the spot on that screen, and the previous group goes away: one screen, one group, nothing else
 * on screen at once (Harbor: "하나는 하나끼리만").
 * The heading sits on the left with the same eyebrow / title / body styles as "The final design: 3 features" above.
 *
 * v139 (Harbor Nov 17, Figma "Scroll states · 07 Final design · design system", file 44기 김지현 4차 랜딩페이지, node
 * 1781:13881): the section was all colour, so each screen now shows a different part of the system —
 *  - 01 · COLOUR on Tracking: bg-tracking-canvas, border-node-0 · 1 · 2, bg-node-inset (values read from the live
 *    prototype, game-cove.vercel.app, Nov 16: #111114, white at 28 / 14 / 8%, #111114)
 *  - 02 · TYPE on Retention: Lato 40 / 32 / 24 Bold, each with an "Aa" sample (Lato Bold 20 / 18 / 16 on #111114);
 *    the line points to the page title. The sample's font is set inline: the site's Roboto-everywhere rule (index.css)
 *    leaves alone only elements whose inline style names Lato.
 *  - 03 · COMPONENTS on Overview: KPI card, Filter and select, AI Agent button, each with a small blue-outlined shape
 *    (#17171B fill, 1.5px #3898F8 edge; 6 / 4 / 8 corners); the line points to the first KPI card
 * Body copy: "Colour, type and components from one set of tokens, on a 4px grid".
 * Small screens (≤ 1023px): each screen, then its labels, one after another.
 * v133: this replaces the token-map block that followed it in GameCoveV4.tsx (hidden by DS_CSS below).
 *
 * v142 (Harbor Nov 17 14:44):
 *  - each group sits next to the spot it points to: all three spots are on the left half of their screens (01 now
 *    points to the Lobby node), so every group is on the left, level with its spot, and the dashed line is short
 *  - no group can be skipped by a fast scroll: the shown step follows the scroll one step at a time and holds each
 *    group on screen for at least HOLD_MS; each screen also gets more scroll room (120vh instead of 90vh)
 *
 * v143 (Harbor Nov 17 15:06): 02 · TYPE goes back to the right for balance (left, right, left). Its line now points to
 * the "Day 7 retention" card title on the right half of the Retention screen, so the line stays short.
 *
 * v144 (Harbor Nov 17 15:49, reference v7labs.com "Bring your own Knowledge"): the section picks up where the tour above
 * ends. It is pulled up under the tour's last screen (margin -100vh) and stays invisible until it pins; at that moment
 * it shows the tour's last screen (the AI agent on Overview), flat and in the same place, then, as you scroll on, that
 * screen shrinks and tilts into the first plane of the stack (turning into Tracking on the way) while the heading
 * fades in. Labels start once it has landed. Wide screens only, and not with reduced motion.
 *
 * v145 (Harbor Nov 17 20:32):
 *  - the label group no longer drops out when you scroll back up: it stays until the first screen has visibly left
 *    its place in the stack (eased landing 85% or more) and fades out with it, re-measuring its spot as the screen
 *    moves, instead of vanishing the moment the landing starts to rewind
 *  - the component outlines keep their corners (6 / 4 / 8): the page's square-corner rule was flattening them
 *  - 02 · TYPE: the card-title example names the card its line points to (Day 7 retention)
 *
 * v30 (Harbor Nov 19): the "Data visuals" section (Figma 2044:3514, GameCoveDV.tsx) follows right under this one, with
 * charts that answer the pointer like the GameCove dashboard.
 */

const F = 'https://raw.githubusercontent.com/Harbor-K/landing_page/main/gamecove/assets/v4/final/'
const V5 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/gamecove/v5/'
const LATO = '"Lato", sans-serif'
const HOLD_MS = 1400
const VH_PER_LAYER = 120
const INTRO_VH = 100 // v144: scroll spent turning the tour's last screen into the stack
const TOUR_LAST = F + 'agent.webp' // the tour's last screen (GameCoveV4.tsx TOUR, step 3 · A)
const LABEL_E = 0.85 // v145: labels stay on until the eased landing drops below this, and fade out with it
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// sw: a colour swatch · aa: an "Aa" type sample at this size · shape: a component outline (height, corners)
type Tag = { k: string; v: string; sw?: string; aa?: number; shape?: { h: number; r: number } }
// kind: the part of the system the group shows · side: where the group sits · at: the spot its line points to (1440×900)
type Layer = { name: string; kind: string; src: string; alt: string; side: 'l' | 'r'; at: [number, number]; tags: Tag[] }
const LAYERS: Layer[] = [
  { name: 'Tracking', kind: 'Colour', src: F + 'map.webp', alt: 'Tracking: the AI map of Lobby and Stage 1–4', side: 'l', at: [384, 486], tags: [
    { k: 'bg-tracking-canvas', v: 'Map canvas', sw: '#111114' },
    { k: 'border-node-0 · 1 · 2', v: 'Node outlines, 3 strengths', sw: 'rgba(255,255,255,.28)' },
    { k: 'bg-node-inset', v: 'Inside each node', sw: '#111114' },
  ] },
  { name: 'Retention', kind: 'Type', src: V5 + 'retention.webp', alt: 'Retention: Day 1 retention line and the date-cohort table', side: 'r', at: [930, 195], tags: [
    { k: 'Lato 40 Bold', v: 'Page title · Retention', aa: 20 },
    { k: 'Lato 32 Bold', v: 'Key numbers · 6.0%', aa: 18 },
    { k: 'Lato 24 Bold', v: 'Card titles · Day 7 retention', aa: 16 },
  ] },
  { name: 'Overview', kind: 'Components', src: F + 'overview.webp', alt: 'Overview: key numbers, drops and daily charts', side: 'l', at: [296, 286], tags: [
    { k: 'KPI card', v: '16 corners · 24 padding', shape: { h: 28, r: 6 } },
    { k: 'Filter and select', v: '8 corners', shape: { h: 20, r: 4 } },
    { k: 'AI Agent button', v: 'Full round · 16 side padding', shape: { h: 16, r: 8 } },
  ] },
]
const HEAD = { eyebrow: 'DESIGN SYSTEM', title: 'Built on one design system', body: 'Colour, type and components from one set of tokens, on a 4px grid' }

const reduced = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

function Swatch({ t }: { t: Tag }) {
  if (t.aa) return <i className="sw aa" style={{ fontSize: `${t.aa}px`, fontFamily: LATO }}>Aa</i>
  if (t.shape) return <i className="sw cp"><b style={{ height: `${t.shape.h}px`, '--r': `${t.shape.r}px` } as React.CSSProperties} /></i>
  return <i className="sw" style={{ background: `linear-gradient(${t.sw}, ${t.sw}), #111114` }} />
}

function TagRow({ t }: { t: Tag }) {
  return (
    <li className="ds-tag">
      <Swatch t={t} />
      <span className="kv"><b className="mono">{t.k}</b><span>{t.v}</span></span>
    </li>
  )
}

const label = (i: number, l: Layer) => `${String(i + 1).padStart(2, '0')} · ${l.kind.toUpperCase()}`

export function DsLayers() {
  const outer = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const group = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLElement>(null)
  const [target, setTarget] = useState(0)
  const [step, setStep] = useState(0)
  const stepAt = useRef(0)
  const [inView, setInView] = useState(false)
  const [line, setLine] = useState<{ d: string; x: number; y: number } | null>(null)
  const [gTop, setGTop] = useState<number | null>(null)
  const [scale, setScale] = useState(1)
  const pinRef = useRef<HTMLDivElement>(null)
  const [intro, setIntro] = useState(1) // 0 = the flat tour screen, 1 = landed in the stack
  const [live, setLive] = useState(false) // pinned (shown over the tour's last screen)
  const [flat, setFlat] = useState<{ dx: number; dy: number; s: number } | null>(null)
  const landed = intro >= 1
  const e = ease(intro)
  // v145: the labels for 01 stay while the first screen is still (almost) in its place, so scrolling back up
  // doesn't make them blink out the moment the landing starts to rewind
  const labelsOn = landed || (e >= LABEL_E && step === 0)
  const measureRef = useRef<() => void>(() => {})

  // the scroll sets the target step; the first screen drops in when the section comes into view
  useEffect(() => {
    let raf = 0
    const run = () => {
      raf = 0
      const el = outer.current; if (!el) return
      setScale(clamp((innerHeight - 340) / 520, 0.6, 1))
      const r = el.getBoundingClientRect()
      const wide = matchMedia('(min-width: 1024px)').matches && !reduced()
      const introPx = wide ? innerHeight * INTRO_VH / 100 : 0
      setLive(!wide || r.top <= 0.5)
      if (wide) {
        const t = clamp(-r.top / introPx)
        setIntro(v => (Math.abs(v - t) < 0.002 ? v : t))
        if (r.top <= 0.5) setInView(true)
      } else {
        setIntro(1)
        if (r.top < innerHeight * 0.6) setInView(true)
      }
      const travel = el.offsetHeight - innerHeight - introPx
      if (travel <= 0) return
      const s = Math.min(LAYERS.length - 1, Math.floor(clamp((-r.top - introPx) / travel) * LAYERS.length))
      setTarget(v => (v === s ? v : s))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])

  // where the tour's screen sits while pinned: the flat start of the first plane copies it (measured on resize)
  useLayoutEffect(() => {
    const measure = () => {
      const st = stage.current
      const sb = document.querySelector<HTMLElement>('.gc4 .g-final .g-stage-box')
      const tour = sb?.closest<HTMLElement>('.g-tour')
      if (!st || !sb || !tour) { setFlat(null); return }
      const b = sb.getBoundingClientRect(), tr = tour.getBoundingClientRect(), sr = st.getBoundingClientRect()
      const pin = pinRef.current?.getBoundingClientRect()
      if (!pin) return
      // the tour pin and this pin both sit at the top of the window when pinned: compare them in pin coordinates
      const w = b.width, top = b.top - tr.top, left = b.left - tr.left
      const cx = left + w / 2, cy = top + (w * 0.625) / 2
      const ox = sr.left - pin.left + sr.width * 0.5, oy = sr.top - pin.top + sr.height * 0.58
      setFlat({ dx: (cx - ox) / scale, dy: (cy - oy) / scale, s: w / (720 * scale) })
    }
    measure()
    addEventListener('resize', measure)
    return () => removeEventListener('resize', measure)
  }, [scale])

  // the shown step walks to the target one step at a time, so a fast scroll never skips a group
  useEffect(() => {
    if (step === target) return
    const wait = reduced() ? 0 : Math.max(0, stepAt.current + HOLD_MS - performance.now())
    const t = setTimeout(() => {
      stepAt.current = performance.now()
      setStep(s => s + Math.sign(target - s))
    }, wait)
    return () => clearTimeout(t)
  }, [step, target])

  // the group sits level with its spot; one dashed line runs from the group's title to the spot
  useLayoutEffect(() => {
    let raf = 0, until = performance.now() + 1600
    const measure = () => {
      const st = stage.current, g = group.current, d = dot.current
      if (!st || !g || !d) return
      const sr = st.getBoundingClientRect(), b = d.getBoundingClientRect()
      const y1 = b.top - sr.top
      const top = clamp(y1 - 12, 0, Math.max(0, sr.height - g.offsetHeight))
      setGTop(v => (v !== null && Math.abs(v - top) < 0.5 ? v : top))
      const k = g.querySelector('.ds-k')!.getBoundingClientRect()
      const left = LAYERS[step].side === 'l'
      const x0 = (left ? k.right + 16 : k.left - 16) - sr.left, y0 = k.top + k.height / 2 - sr.top
      const x1 = b.left - sr.left
      const xm = left ? Math.min(x0 + 120, x1) : Math.max(x0 - 120, x1)
      setLine({ d: `M${x0.toFixed(1)} ${y0.toFixed(1)} H${xm.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}`, x: x1, y: y1 })
    }
    measureRef.current = measure
    const loop = () => { measure(); if (performance.now() < until) raf = requestAnimationFrame(loop) }
    loop()
    const on = () => { until = performance.now() + 200; cancelAnimationFrame(raf); loop() }
    addEventListener('resize', on)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', on) }
  }, [step, inView, scale, labelsOn])

  // v145: while the first screen is still settling, its spot moves with the scroll, so the group and line follow it
  useLayoutEffect(() => { if (labelsOn && !landed) measureRef.current() }, [intro, labelsOn, landed])

  const L = LAYERS[step]
  const shown = inView || reduced()
  // first plane while landing: from the flat tour screen to its place in the stack
  const introStyle = (i: number): React.CSSProperties | undefined => {
    if (i !== 0 || landed || !flat) return undefined
    const k = 1 - e
    return {
      transform: `translate(${(flat.dx * k).toFixed(1)}px, ${(flat.dy * k).toFixed(1)}px) scale(${(flat.s * k + e).toFixed(4)}) rotateX(${(55 * e).toFixed(2)}deg) rotateZ(${(-38 * e).toFixed(2)}deg)`,
      transition: 'none', boxShadow: `0 24px 48px rgba(17,17,20,${(0.16 * e).toFixed(3)})`,
    }
  }
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@700&display=swap" />
      <div ref={outer} className="ds-outer" style={{ height: `${INTRO_VH + LAYERS.length * VH_PER_LAYER + 60}vh` }}>
        <div className={'ds-pin' + (live ? ' live' : '')} ref={pinRef}>
          <div className="ds-headline" style={landed ? undefined : { opacity: clamp((e - 0.2) / 0.6), transform: `translateY(${(1 - clamp((e - 0.2) / 0.6)) * 24}px)` }}>
            <div className="g-eyebrow sq-blue"><i aria-hidden="true" />{HEAD.eyebrow}</div>
            <h2 className="g-h2 mt-40">{HEAD.title}</h2>
            <p className="g-body mt-24">{HEAD.body}</p>
          </div>
          <div className="ds-stage" ref={stage}>
            <div className="ds-stack" aria-hidden="true">
              <div className="ds-iso" style={{ transform: `scale(${scale})` }}>
                {LAYERS.map((p, i) => {
                  const on = shown && i <= step
                  return (
                    <div key={p.name} className={'ds-plane' + (on ? ' on' : '')}
                      style={{ zIndex: i, transform: `translateY(${-(i * 64 + (on ? 0 : 160))}px) rotateX(55deg) rotateZ(-38deg)`, ...introStyle(i) }}>
                      <img src={p.src} alt="" loading="lazy" />
                      {i === 0 && !landed && <img className="ds-from" src={TOUR_LAST} alt="" style={{ opacity: 1 - clamp((e - 0.35) / 0.4) }} />}
                      <span className="ds-tab" style={i === 0 && !landed ? { opacity: clamp((e - 0.6) / 0.4) } : undefined}>{p.name}</span>
                      {i === step && <i ref={dot} className="ds-dot" style={{ left: `${(p.at[0] / 1440) * 100}%`, top: `${(p.at[1] / 900) * 100}%` }} />}
                    </div>
                  )
                })}
              </div>
            </div>
            {shown && labelsOn && (
              <div className="ds-labels" style={landed ? undefined : { opacity: clamp((e - LABEL_E) / (1 - LABEL_E)) }}>
                <div key={step} ref={group} className={'ds-group ' + L.side} style={gTop === null ? undefined : { top: `${gTop}px` }}>
                  <div className="ds-k mono"><i />{label(step, L)}</div>
                  <ul>{L.tags.map(t => <TagRow key={t.k} t={t} />)}</ul>
                </div>
                {line && (
                  <svg className="ds-lines" aria-hidden="true">
                    <g key={step}>
                      <path d={line.d} />
                      <circle cx={line.x} cy={line.y} r="5" />
                    </g>
                  </svg>
                )}
              </div>
            )}
          </div>
          <p className="vh-only">
            {LAYERS.map(l => `${l.kind}, on ${l.name}: ${l.tags.map(t => `${t.k} for ${t.v}`).join(', ')}.`).join(' ')}
          </p>
        </div>
      </div>
      {/* small screens: each screen, then its labels */}
      <div className="ds-flat">
        <div className="g-eyebrow sq-blue"><i aria-hidden="true" />{HEAD.eyebrow}</div>
        <h2 className="g-h2">{HEAD.title}</h2>
        <p className="g-body">{HEAD.body}</p>
        {LAYERS.map((l, i) => (
          <div key={l.name} className="ds-flat-g">
            <img src={l.src} alt={l.alt} loading="lazy" />
            <div className="ds-k mono"><i />{label(i, l)}</div>
            <ul>{l.tags.map(t => <TagRow key={t.k} t={t} />)}</ul>
          </div>
        ))}
      </div>
      {/* v30: Data visuals (Figma 2044:3514) right under the design system */}
      <DataVisuals />
    </>
  )
}

export const DS_CSS = `
/* v133 (Harbor): the separate token-map block after this section is retired — the labels on the stack replace it */
.gc4 .g-final .g-ds, .gc4 .g-final .g-dsmap { display: none !important; }
/* v136: the tour screen runs to the bottom edge of the screen while pinned, so it is cut cleanly by the window
   (no strip of page showing under it) */
.gc4 .g-final .g-tour { padding-bottom: 0; }

/* v144: pulled up under the tour's last screen; invisible until it pins, then it covers the tour exactly */
.gc4 .ds-outer { position: relative; z-index: 3; margin-top: -100vh; }
.gc4 .ds-pin { position: sticky; top: 0; height: 100vh; padding: 96px 0 40px; display: flex; flex-direction: column; background: #FAFAF9;
  visibility: hidden; }
.gc4 .ds-pin.live { visibility: visible; box-shadow: 0 0 0 100vmax #FAFAF9; clip-path: inset(0 -100vmax); } /* covers the page margins too */
.gc4 .ds-plane img.ds-from { z-index: 1; }
.gc4 .ds-headline { max-width: 760px; }

.gc4 .ds-stage { position: relative; flex: 1; min-height: 0; }
.gc4 .ds-stack { position: absolute; inset: 0; }
.gc4 .ds-iso { position: absolute; left: 50%; top: 58%; width: 0; height: 0; transform-origin: 0 0; }
/* each screen is drawn flat at the same isometric angle and lifted on screen, so the stack order is the DOM order */
.gc4 .ds-plane { position: absolute; left: -360px; top: -225px; width: 720px; height: 450px; opacity: 0;
  transition: transform 1s var(--ease), opacity .6s ease; box-shadow: 0 24px 48px rgba(17,17,20,.16); }
.gc4 .ds-plane.on { opacity: 1; }
.gc4 .ds-plane img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 0 0; border: 1px solid #2A2D31; }
/* the screen's name on a tab under its front edge (V7: Knowledge, Workflows, Apps) */
.gc4 .ds-tab { position: absolute; left: 48px; top: 100%; height: 56px; padding: 12px 24px; background: #FFFFFF; border: 1px solid var(--line); border-top: 0;
  font-size: 24px; line-height: 32px; color: var(--sand); white-space: nowrap; }
.gc4 .ds-dot { position: absolute; width: 1px; height: 1px; }

/* one label group at a time, beside the stack and level with its spot (v142: top is set from the spot) */
.gc4 .ds-labels { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.gc4 .ds-group { position: absolute; z-index: 2; top: 50%; display: flex; flex-direction: column; gap: 16px;
  animation: ds-in .5s var(--ease) .1s both; }
.gc4 .ds-group.l { left: 0; }
.gc4 .ds-group.r { right: 0; align-items: flex-end; }
@keyframes ds-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.gc4 .ds-k { display: flex; align-items: center; gap: 8px; font-size: 16px; line-height: 24px; letter-spacing: .06em; color: var(--sand); }
.gc4 .ds-k i { width: 12px; height: 12px; background: var(--blue); }
.gc4 .ds-group.r .ds-k { flex-direction: row-reverse; }
.gc4 .ds-group ul, .gc4 .ds-flat ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.gc4 .ds-tag { display: flex; align-items: center; gap: 16px; width: 296px; padding: 12px 16px; background: #FFFFFF; border: 1px solid var(--line); }
.gc4 .ds-group.r .ds-tag { flex-direction: row-reverse; text-align: right; }
.gc4 .ds-tag .sw { flex: none; width: 32px; height: 32px; border: 1px solid rgba(17,17,20,.12); }
/* v139: type sample (Lato Bold on the dashboard's #111114) and component outline (the dashboard's blue edge) */
.gc4 .ds-tag .sw.aa { display: flex; align-items: center; justify-content: center; border: 0; background: #111114; color: #F2F0EC;
  font-style: normal; font-weight: 700; line-height: 1; }
.gc4 .ds-tag .sw.cp { display: flex; align-items: center; border: 0; background: none; }
.gc4 .ds-tag .sw.cp b { display: block; width: 32px; background: #17171B; border: 1.5px solid #3898F8; box-sizing: border-box; }
/* v145: the page squares every corner (index.css, 0px !important); these outlines show the component's own corners */
.gc .gc4 .ds-group .ds-tag .sw.cp b, .gc .gc4 .ds-flat .ds-tag .sw.cp b { border-radius: var(--r, 0px) !important; }
.gc4 .ds-tag .kv { display: flex; flex-direction: column; min-width: 0; }
.gc4 .ds-tag .kv b { font-size: 16px; line-height: 24px; font-weight: 400; color: var(--sand); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gc4 .ds-tag .kv span { font-size: 16px; line-height: 24px; color: var(--mute); }

.gc4 .ds-lines { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.gc4 .ds-lines path { fill: none; stroke: var(--blue); stroke-width: 1.5; stroke-dasharray: 6 4; }
.gc4 .ds-lines circle { fill: var(--blue); stroke: #FFFFFF; stroke-width: 2; }
.gc4 .ds-lines g { animation: ds-fade .4s ease .3s both; }
@keyframes ds-fade { from { opacity: 0; } to { opacity: 1; } }
.gc4 .vh-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.gc4 .ds-flat { display: none; }

@media (max-width: 1280px) {
  .gc4 .ds-tag { width: 256px; }
}
@media (max-width: 1023px) {
  .gc4 .ds-outer { display: none; margin-top: 0; }
  .gc4 .ds-flat { display: flex; flex-direction: column; gap: 24px; margin-top: 88px; }
  .gc4 .ds-flat img { width: 100%; height: auto; border: 1px solid #2A2D31; }
  .gc4 .ds-flat-g { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
  .gc4 .ds-flat .ds-tag { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .gc4 .ds-outer { margin-top: 160px; }
  .gc4 .ds-pin { visibility: visible; }
  .gc4 .ds-plane, .gc4 .ds-group, .gc4 .ds-lines g { transition: none !important; animation: none !important; }
}
`
