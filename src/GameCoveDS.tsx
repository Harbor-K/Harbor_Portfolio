import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * GameCove design system, shown on the real design (v133, Harbor Nov 16, reference: v7labs.com "Integrate your own
 * Tools"). Three live screens lie stacked at an isometric angle — Tracking, Retention, Overview on top, each with its name
 * on a tab — and labels on both sides point with dashed lines at the spot on the Overview screen that uses each token.
 * Pinned: scrolling moves through Colour → Type → Spacing; the labels change, the stack stays.
 * Every label was checked on the live prototype's Overview (game-cove.vercel.app, Nov 16):
 *  - colour: text-primary #F2F0EC (key numbers), text-critical #E28B8B (drops), chart-series-primary #3898F8 (chart line),
 *    bg-surface #17171B (cards)
 *  - type: Lato — page title 40 Bold, card label 14 (label-default), chart title 24 Bold, today's value 32 Bold
 *  - spacing: cards radius 16, badges full radius, 16 between cards, 24 inside a card
 * Small screens (≤ 1023px): the Overview screen with the three label groups listed under it.
 * v133: this replaces the token-map block that followed it in GameCoveV4.tsx (hidden by DS_CSS below).
 */

const F = 'https://raw.githubusercontent.com/Harbor-K/landing_page/main/gamecove/assets/v4/final/'
const V5 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/gamecove/v5/'
const PLANES = [
  { name: 'Tracking', src: F + 'map.webp' },
  { name: 'Retention', src: V5 + 'retention.webp' },
  { name: 'Overview', src: F + 'overview.webp' },
]

// a label: swatch or sample, token name, what it is for, and the spot it points at on the 1440×900 Overview screen
type Tag = { k: string; v: string; sw?: string; ic?: 'radius' | 'gap' | 'pad'; at: [number, number]; box?: [number, number, number, number] }
type Step = { word: string; head: string; left: { title: string; tags: Tag[] }; right: { title: string; tags: Tag[] } }
const STEPS: Step[] = [
  { word: 'Colour', head: '108 colour tokens, each named by its job · dark and light themes',
    left: { title: 'TEXT', tags: [
      { k: 'text-primary', v: 'Key numbers', sw: '#F2F0EC', at: [338, 283] },
      { k: 'text-critical', v: 'Drops', sw: '#E28B8B', at: [350, 333] },
    ] },
    right: { title: 'CHART · SURFACE', tags: [
      { k: 'chart-series-primary', v: 'Chart line & area', sw: '#3898F8', at: [600, 812] },
      { k: 'bg-surface', v: 'Cards', sw: '#17171B', at: [1300, 300] },
    ] } },
  { word: 'Type', head: 'One typeface, Lato (Pretendard for Korean) · 16px for body text',
    left: { title: 'LATO', tags: [
      { k: 'Page title', v: '40 · Bold', at: [372, 116] },
      { k: 'Card label', v: '14 · label-default', at: [364, 237] },
    ] },
    right: { title: 'LATO', tags: [
      { k: 'Chart title', v: '24 · Bold', at: [980, 567] },
      { k: 'Today’s value', v: '32 · Bold', at: [952, 686] },
    ] } },
  { word: 'Spacing', head: 'A 4px base, so every size lines up',
    left: { title: 'RADIUS', tags: [
      { k: 'Cards', v: '16', ic: 'radius', at: [298, 212], box: [295, 207, 265, 158] },
      { k: 'Badges', v: 'full', ic: 'radius', at: [326, 333], box: [318, 322, 62, 22] },
    ] },
    right: { title: 'SPACE', tags: [
      { k: 'Between cards', v: '16', ic: 'gap', at: [1125, 330], box: [1118, 207, 14, 158] },
      { k: 'Inside a card', v: '24', ic: 'pad', at: [1142, 220], box: [1132, 207, 265, 158] },
    ] } },
]

const reduced = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

const ICONS = {
  radius: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 16V10a6 6 0 0 1 6-6h6" /></svg>,
  gap: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 3v14M17 3v14M6 10h8M6 10l2-2M6 10l2 2M14 10l-2-2M14 10l-2 2" /></svg>,
  pad: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2.5" y="2.5" width="15" height="15" /><rect x="7" y="7" width="6" height="6" strokeDasharray="2 2" /></svg>,
}

function TagRow({ t, id }: { t: Tag; id?: string }) {
  return (
    <li className="ds-tag" data-tag={id}>
      {t.sw ? <i className="sw" style={{ background: t.sw }} /> : t.ic ? <i className="aa ic">{ICONS[t.ic]}</i> : <i className="aa">Aa</i>}
      <span className="kv"><b className="mono">{t.k}</b><span>{t.v}</span></span>
    </li>
  )
}

type Line = { d: string; x: number; y: number }

export function DsLayers() {
  const outer = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const top = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [inView, setInView] = useState(false)
  const [lines, setLines] = useState<Line[]>([])
  const [scale, setScale] = useState(1)

  // the step follows the scroll; the stack drops in once, when the section first comes into view
  useEffect(() => {
    let raf = 0
    const run = () => {
      raf = 0
      const el = outer.current; if (!el) return
      setScale(clamp((innerHeight - 300) / 560, 0.62, 1))
      const r = el.getBoundingClientRect()
      if (r.top < innerHeight * 0.6) setInView(true)
      const travel = el.offsetHeight - innerHeight
      if (travel <= 0) return
      const s = Math.min(STEPS.length - 1, Math.floor(clamp(-r.top / travel) * STEPS.length))
      setStep(v => (v === s ? v : s))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])

  // dashed leader lines: from each label to its spot on the top screen (measured, so they follow the stack as it moves)
  useLayoutEffect(() => {
    let raf = 0, until = performance.now() + 1800
    const measure = () => {
      const st = stage.current, tp = top.current
      if (!st || !tp) return
      const sr = st.getBoundingClientRect()
      const out: Line[] = []
      st.querySelectorAll<HTMLElement>('.ds-side [data-tag]').forEach(li => {
        const dot = tp.querySelector<HTMLElement>(`[data-dot="${li.dataset.tag}"]`); if (!dot) return
        const a = li.getBoundingClientRect(), b = dot.getBoundingClientRect()
        const left = li.closest('.ds-side')!.classList.contains('l')
        const x0 = (left ? a.right + 8 : a.left - 8) - sr.left, y0 = a.top + a.height / 2 - sr.top
        const x1 = b.left + b.width / 2 - sr.left, y1 = b.top + b.height / 2 - sr.top
        const xm = left ? Math.min(x0 + 40, x1) : Math.max(x0 - 40, x1)
        out.push({ d: `M${x0.toFixed(1)} ${y0.toFixed(1)} H${xm.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}`, x: x1, y: y1 })
      })
      setLines(out)
    }
    const loop = () => { measure(); if (performance.now() < until) raf = requestAnimationFrame(loop) }
    loop()
    const on = () => { until = performance.now() + 200; cancelAnimationFrame(raf); loop() }
    addEventListener('resize', on)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', on) }
  }, [step, inView, scale])

  const s = STEPS[step]
  const tags = [...s.left.tags.map((t, i) => ({ t, id: `l${i}` })), ...s.right.tags.map((t, i) => ({ t, id: `r${i}` }))]
  const shown = inView || reduced()
  return (
    <>
      <div ref={outer} className="ds-outer" style={{ height: `${STEPS.length * 80 + 60}vh` }}>
        <div className="ds-pin">
          <div className="ds-headline">
            <h3 className="ds-h">Built on one design system <em key={s.word}>{s.word}</em></h3>
            <p key={s.head} className="ds-sub">{s.head}</p>
          </div>
          <div className="ds-stage" ref={stage}>
            <div className="ds-side l" key={'l' + step}>
              <div className="ds-k mono"><i />{s.left.title}</div>
              <ul>{s.left.tags.map((t, i) => <TagRow key={t.k} t={t} id={`l${i}`} />)}</ul>
            </div>
            <div className="ds-stack" aria-hidden="true">
              <div className="ds-iso" style={{ transform: `scale(${scale})` }}>
                {PLANES.map((p, i) => (
                  <div key={p.name} ref={i === PLANES.length - 1 ? top : undefined} className={'ds-plane' + (shown ? ' on' : '')}
                    style={{ zIndex: i, transitionDelay: `${i * 0.18}s`,
                      transform: `translateY(${-(i * 56 + (shown ? 0 : 140))}px) rotateX(55deg) rotateZ(-38deg)` }}>
                    <img src={p.src} alt="" loading="lazy" />
                    <span className="ds-tab">{p.name}</span>
                    {i === PLANES.length - 1 && tags.filter(({ t }) => t.box).map(({ t, id }) => (
                      <b key={'b' + id + step} className={'ds-box' + (t.ic === 'pad' ? ' dash' : '')} style={{ left: `${(t.box![0] / 1440) * 100}%`, top: `${(t.box![1] / 900) * 100}%`, width: `${(t.box![2] / 1440) * 100}%`, height: `${(t.box![3] / 900) * 100}%` }} />
                    ))}
                    {i === PLANES.length - 1 && tags.map(({ t, id }) => (
                      <i key={id} className="ds-dot" data-dot={id} style={{ left: `${(t.at[0] / 1440) * 100}%`, top: `${(t.at[1] / 900) * 100}%` }} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="ds-side r" key={'r' + step}>
              <div className="ds-k mono"><i />{s.right.title}</div>
              <ul>{s.right.tags.map((t, i) => <TagRow key={t.k} t={t} id={`r${i}`} />)}</ul>
            </div>
            <svg className="ds-lines" aria-hidden="true">
              {lines.map((l, i) => (
                <g key={step + '-' + i}>
                  <path d={l.d} />
                  <circle cx={l.x} cy={l.y} r="5" />
                </g>
              ))}
            </svg>
          </div>
          <p className="vh-only">
            {STEPS.map(st => `${st.word}: ${[...st.left.tags, ...st.right.tags].map(t => `${t.k} ${t.v}`).join(', ')}.`).join(' ')}
          </p>
        </div>
      </div>
      {/* small screens: the Overview screen, then the labels */}
      <div className="ds-flat">
        <h3 className="ds-h">Built on one design system</h3>
        <img src={PLANES[2].src} alt="GameCove Overview screen, built from the design system's tokens" loading="lazy" />
        {STEPS.map(st => (
          <div key={st.word} className="ds-flat-g">
            <div className="ds-k mono"><i />{st.word.toUpperCase()}</div>
            <p className="ds-sub">{st.head}</p>
            <ul>{[...st.left.tags, ...st.right.tags].map(t => <TagRow key={t.k} t={t} />)}</ul>
          </div>
        ))}
      </div>
    </>
  )
}

export const DS_CSS = `
/* v133 (Harbor): the separate token-map block after this section is retired — the labels on the stack replace it */
.gc4 .g-final .g-ds, .gc4 .g-final .g-dsmap { display: none !important; }
.gc4 .ds-outer { position: relative; margin-top: 120px; }
.gc4 .ds-pin { position: sticky; top: 0; height: 100vh; padding: 96px 0 40px; display: flex; flex-direction: column; }
.gc4 .ds-headline { text-align: center; }
.gc4 .ds-h { margin: 0; font-size: 40px; font-weight: 700; line-height: 48px; letter-spacing: -0.015em; color: var(--sand); }
.gc4 .ds-h em { display: inline-block; font-style: normal; font-weight: 400; color: var(--blue); animation: ds-in .6s var(--ease) both; }
.gc4 .ds-sub { margin-top: 8px; font-size: 18px; line-height: 28px; color: var(--text); animation: ds-in .6s var(--ease) both; }
@keyframes ds-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

.gc4 .ds-stage { position: relative; flex: 1; min-height: 0; display: grid; grid-template-columns: 280px minmax(0, 1fr) 280px; align-items: center; gap: 24px; }
.gc4 .ds-stack { position: relative; height: 100%; }
.gc4 .ds-iso { position: absolute; left: 50%; top: 56%; width: 0; height: 0; transform-origin: 0 0; }
/* each screen is drawn flat at the same isometric angle and lifted on screen, so the stack order is the DOM order */
.gc4 .ds-plane { position: absolute; left: -360px; top: -225px; width: 720px; height: 450px; opacity: 0;
  transition: transform 1s var(--ease), opacity .6s ease; box-shadow: 0 24px 48px rgba(17,17,20,.16); }
.gc4 .ds-plane.on { opacity: 1; }
.gc4 .ds-plane img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 0 0; border: 1px solid #2A2D31; }
/* the screen's name on a tab under its front edge (V7: Knowledge, Workflows) */
.gc4 .ds-tab { position: absolute; left: 48px; top: 100%; height: 56px; padding: 12px 24px; background: #FFFFFF; border: 1px solid var(--line); border-top: 0;
  font-size: 24px; line-height: 32px; color: var(--sand); white-space: nowrap; }
.gc4 .ds-dot { position: absolute; width: 1px; height: 1px; }
/* spacing and radius: the measured area lights up on the screen */
.gc4 .ds-box { position: absolute; border: 2px solid #3898F8; background: rgba(56,152,248,.22); animation: ds-fade .6s ease .2s both; }
.gc4 .ds-box.dash { border-style: dashed; background: rgba(56,152,248,.08); }
.gc4 .ds-tag .aa.ic svg { display: block; width: 20px; height: 20px; }

/* labels on both sides */
.gc4 .ds-side { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 12px; animation: ds-in .6s var(--ease) both; }
.gc4 .ds-side.r { align-items: flex-end; text-align: right; }
.gc4 .ds-k { display: flex; align-items: center; gap: 8px; font-size: 16px; line-height: 24px; letter-spacing: .06em; color: var(--sand); }
.gc4 .ds-k i { width: 12px; height: 12px; background: var(--blue); }
.gc4 .ds-side.r .ds-k { flex-direction: row-reverse; }
.gc4 .ds-side ul, .gc4 .ds-flat ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.gc4 .ds-tag { display: flex; align-items: center; gap: 12px; width: 280px; padding: 12px 16px; background: #FFFFFF; border: 1px solid var(--line); }
.gc4 .ds-side.r .ds-tag { flex-direction: row-reverse; }
.gc4 .ds-tag .sw { flex: none; width: 32px; height: 32px; border: 1px solid rgba(17,17,20,.12); }
.gc4 .ds-tag .aa { flex: none; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #17171B; color: #F2F0EC;
  font-style: normal; font-size: 16px; font-weight: 700; }
.gc4 .ds-tag .kv { display: flex; flex-direction: column; min-width: 0; }
.gc4 .ds-tag .kv b { font-size: 16px; line-height: 24px; font-weight: 400; color: var(--sand); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gc4 .ds-tag .kv span { font-size: 16px; line-height: 24px; color: var(--mute); }
.hb.gc .gc4 .g-wrap .ds-tag .aa { font-family: Lato, "Helvetica Neue", Arial, sans-serif !important; }

.gc4 .ds-lines { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.gc4 .ds-lines path { fill: none; stroke: var(--blue); stroke-width: 1.5; stroke-dasharray: 6 4; }
.gc4 .ds-lines circle { fill: var(--blue); stroke: #FFFFFF; stroke-width: 2; filter: drop-shadow(0 0 6px rgba(56,152,248,.6)); }
.gc4 .ds-lines g { animation: ds-fade .6s ease .2s both; }
@keyframes ds-fade { from { opacity: 0; } to { opacity: 1; } }
.gc4 .vh-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.gc4 .ds-flat { display: none; }

@media (max-width: 1280px) {
  .gc4 .ds-stage { grid-template-columns: 240px minmax(0, 1fr) 240px; }
  .gc4 .ds-tag { width: 240px; }
}
@media (max-width: 1023px) {
  .gc4 .ds-outer { display: none; }
  .gc4 .ds-flat { display: flex; flex-direction: column; gap: 24px; margin-top: 88px; }
  .gc4 .ds-flat .ds-h { font-size: 32px; line-height: 40px; }
  .gc4 .ds-flat img { width: 100%; height: auto; border: 1px solid #2A2D31; }
  .gc4 .ds-flat-g { display: flex; flex-direction: column; gap: 12px; }
  .gc4 .ds-flat .ds-tag { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .gc4 .ds-plane, .gc4 .ds-h em, .gc4 .ds-sub, .gc4 .ds-side, .gc4 .ds-lines g { transition: none !important; animation: none !important; }
}
`
