import React, { useEffect, useRef, useState } from 'react'

/**
 * ETO Markets · IB dashboard tour (Figma 2358:2059 "Canvas · Dashboard overview (motion)", 1440 × 840).
 * Nov 23 (Harbor): the Figma plays a 20 s loop; on the site the same four steps follow the scroll. On wide screens the
 * canvas pins while you scroll through a taller block: Dashboard → Inbox → My clients → My account. Each step slides the
 * next screen up inside the browser window, then the red highlight and its tag appear, the line on the left changes and
 * the step label above lights up. Narrow screens show the four steps one under another. Static with reduced motion.
 * Nov 23 (later, Harbor): Inbox and My clients no longer show the ETO Blog bar and chat bubble at the bottom (images
 * tour-*-clean.jpg), and the screens fade one into the next instead of sliding, so only one screen is ever in the window.
 * Nov 24: My clients and My account are sharp 2x exports of the CRM Dashboard Figma frames (13 and 33, wXNPL3ciw6XhyL58xAFyLI),
 * without the blog bar (tour-*-hd.jpg); the highlight boxes were re-measured on those frames.
 */

const A9 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/v9/'
type Box = { x: number; y: number; w: number; h: number }
type Step = { nav: string; line: string; lineTop: number; tag: string; tagAt: { x: number; y: number }; hl: Box; shot: React.ReactNode; alt: string }
const STEPS: Step[] = [
  { nav: '01 DASHBOARD', line: 'Accounts, leverage and rebate on one screen.', lineTop: 344, tag: 'Account', tagAt: { x: 605, y: 54 },
    hl: { x: 138.04, y: 70.1, w: 734.41, h: 194.12 }, alt: 'Redesigned dashboard: the account table with role tags, leverage and the rebate summary',
    shot: <img src={A9 + 'tour-dashboard.jpg'} alt="" style={{ width: 880, height: 558.6 }} loading="lazy" decoding="async" /> },
  { nav: '02 INBOX', line: 'Sign-ups, deposits and withdrawals, one tab each.', lineTop: 344, tag: '3 tabs', tagAt: { x: 354, y: 58 },
    hl: { x: 143.43, y: 57.16, w: 202.75, h: 33.43 }, alt: 'Redesigned inbox: Registration, Deposit and Withdrawal tabs',
    shot: <img src={A9 + 'tour-inbox-clean.jpg'} alt="" style={{ width: 880, height: 558 }} loading="lazy" decoding="async" /> },
  { nav: '03 MY CLIENTS', line: 'Every client’s status, with one Action menu.', lineTop: 368, tag: '1 Action menu', tagAt: { x: 727, y: 63 },
    hl: { x: 800.3, y: 135.2, w: 63.3, h: 84.8 }, alt: 'Redesigned My Clients page: client list with a status and one Action menu per row',
    shot: <img src={A9 + 'tour-clients-hd.jpg'} alt="" style={{ width: 880, height: 558 }} loading="lazy" decoding="async" /> },
  { nav: '04 MY ACCOUNT', line: 'Currency first, then the payment method.', lineTop: 368, tag: '8 currencies', tagAt: { x: 143, y: 324 },
    hl: { x: 143.5, y: 72.4, w: 44.5, h: 243.8 }, alt: 'Redesigned deposit page: eight currencies listed first, payment methods after',
    shot: <img src={A9 + 'tour-account-hd.jpg'} alt="" style={{ width: 880, height: 558 }} loading="lazy" decoding="async" /> },
]
const NAV_W = [116, 77, 125, 125]

const reduced = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const PIN_Q = '(min-width: 1024px) and (min-height: 700px)'

function Screen({ s, state }: { s: Step; state: 'up' | 'on' | 'down' }) {
  const px = (b: Box) => ({ left: b.x, top: b.y, width: b.w, height: b.h })
  return (
    <div className={'scr ' + state} role="img" aria-label={s.alt} aria-hidden={state !== 'on'}>
      {s.shot}
      <i className="hl" style={px(s.hl)} />
      <span className="tag" style={{ left: s.tagAt.x, top: s.tagAt.y }}>{s.tag}</span>
    </div>
  )
}

function Window({ step, only }: { step: number; only?: number }) {
  return (
    <div className="win">
      <div className="bar" aria-hidden="true"><i /><i /><i /></div>
      <div className="screens">
        {STEPS.map((s, i) => (only !== undefined && i !== only) ? null
          : <Screen key={s.nav} s={s} state={only !== undefined ? 'on' : i < step ? 'up' : i === step ? 'on' : 'down'} />)}
      </div>
    </div>
  )
}

/** a fixed w × h stage scaled to the width it gets */
function Stage({ w = 1440, h = 840, children }: { w?: number; h?: number; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [k, setK] = useState(1)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const set = () => setK(Math.min(1, el.clientWidth / w))
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => ro.disconnect()
  }, [w])
  return (
    <div ref={box} className="stage" style={{ aspectRatio: `${w} / ${h}` }}>
      <div className="stage-in" style={{ width: w, height: h, transform: `scale(${k})` }}>{children}</div>
    </div>
  )
}

export function DashTour() {
  const outer = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [pinned, setPinned] = useState(false)
  useEffect(() => {
    const mq = matchMedia(PIN_Q)
    const sync = () => setPinned(mq.matches && !reduced())
    sync(); mq.addEventListener('change', sync)
    let raf = 0
    const run = () => {
      raf = 0
      const el = outer.current
      if (!el || !mq.matches || reduced()) return
      const r = el.getBoundingClientRect()
      const travel = el.offsetHeight - innerHeight
      const t = travel > 0 ? -r.top / travel : 0
      const s = t < 0.25 ? 0 : t < 0.5 ? 1 : t < 0.75 ? 2 : 3
      setStep(v => (v === s ? v : s))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on); mq.removeEventListener('change', sync) }
  }, [])

  return (
    <div className="e8-tour">
      <style>{TOUR_CSS}</style>
      {/* wide screens: one pinned canvas, the steps follow the scroll */}
      <div ref={outer} className={'pin' + (pinned ? ' on' : '')}>
        <div className="stk">
          <div className="canvas">
            <span className="hd tl" aria-hidden="true" /><span className="hd tr" aria-hidden="true" />
            <span className="hd bl" aria-hidden="true" /><span className="hd br" aria-hidden="true" />
            <Stage>
              <ol className="nav" aria-label="Dashboard tour">
                {STEPS.map((s, i) => (
                  <li key={s.nav} className={i === step ? 'on' : undefined} aria-current={i === step ? 'step' : undefined}>
                    <span>{s.nav}</span><i style={{ width: NAV_W[i] }} />
                  </li>
                ))}
              </ol>
              {STEPS.map((s, i) => (
                <p key={s.nav} className={'line ' + (i < step ? 'up' : i === step ? 'on' : 'down')} style={{ top: s.lineTop }} aria-hidden={i !== step}>{s.line}</p>
              ))}
              <Window step={step} />
            </Stage>
          </div>
        </div>
      </div>
      {/* narrow screens: the four steps one under another */}
      <ol className="list">
        {STEPS.map((s, i) => (
          <li key={s.nav}>
            <span className="k">{s.nav}</span>
            <p className="t">{s.line}</p>
            <div className="mini"><Stage w={880} h={598}><Window step={i} only={i} /></Stage></div>
          </li>
        ))}
      </ol>
    </div>
  )
}

const TOUR_CSS = `
.e8-tour { --red: #E31E24; --ink: #000D10; }
.e8-tour .canvas { position: relative; background: #EDECE9; box-shadow: inset 0 0 0 1px #E3DCDA; }
.e8-tour .canvas > .hd { position: absolute; z-index: 2; width: 8px; height: 8px; background: #FFFFFF; box-shadow: inset 0 0 0 1px #D9BFC1; }
.e8-tour .canvas > .hd.tl { left: -4px; top: -4px; } .e8-tour .canvas > .hd.tr { right: -4px; top: -4px; }
.e8-tour .canvas > .hd.bl { left: -4px; bottom: -4px; } .e8-tour .canvas > .hd.br { right: -4px; bottom: -4px; }
.e8-tour .stage { position: relative; width: 100%; overflow: hidden; }
.e8-tour .stage-in { position: absolute; left: 0; top: 0; transform-origin: 0 0; }

/* pinned on wide screens: the block is taller than the screen and the canvas sticks while the four steps play */
.e8-tour .pin.on { height: 340vh; }
.e8-tour .pin.on .stk { position: sticky; top: max(80px, calc(50vh - 360px)); width: min(100%, calc((100vh - 120px) * 1440 / 840)); margin: 0 auto; }

/* step labels (Figma 2358:2425) */
.e8-tour .nav { position: absolute; left: 496px; top: 65px; display: flex; gap: 32px; margin: 0; padding: 0; list-style: none; }
.e8-tour .nav li { display: flex; flex-direction: column; gap: 8px; }
.e8-tour .nav span { font-size: 16px; line-height: 24px; letter-spacing: .04em; color: var(--ink); opacity: .35; white-space: nowrap; transition: opacity .4s ease; }
.e8-tour .nav i { display: block; height: 2px; background: var(--red); opacity: 0; transform: scaleX(.3); transform-origin: 0 50%; transition: opacity .4s ease, transform .6s cubic-bezier(.22,1,.36,1); }
.e8-tour .nav li.on span { opacity: 1; }
.e8-tour .nav li.on i { opacity: 1; transform: none; }

/* the line on the left (Figma 2366:829 … 838) */
.e8-tour .line { position: absolute; left: 64px; width: 368px; margin: 0; font-size: 40px; font-weight: 700; line-height: 48px; color: var(--ink);
  opacity: 0; transform: translateY(24px); transition: opacity .2s ease, transform .6s cubic-bezier(.22,1,.36,1); }
.e8-tour .line.up { transform: translateY(-24px); }
/* the old line is gone (.2 s) before the new one starts (.25 s), so the two never overlap */
.e8-tour .line.on { opacity: 1; transform: none; transition: opacity .45s ease .25s, transform .6s cubic-bezier(.22,1,.36,1) .25s; }

/* the browser window (Figma 2358:2295) */
.e8-tour .win { position: absolute; left: 496px; top: 121px; width: 880px; height: 598px; overflow: hidden; background: #FFFFFF; border-radius: 12px; box-shadow: 0 16px 48px rgba(0,0,0,.12); }
.e8-tour .win .bar { display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 16px; background: #F1F0EC; }
.e8-tour .win .bar i { width: 12px; height: 12px; border-radius: 50%; background: #FF5F57; }
.e8-tour .win .bar i:nth-child(2) { background: #FEBC2E; } .e8-tour .win .bar i:nth-child(3) { background: #28C840; }
.e8-tour .screens { position: relative; height: 558px; overflow: hidden; background: #FFFFFF; }
/* one screen at a time: the old screen fades out (.25 s) before the next fades in (from .3 s), so two never show together */
.e8-tour .scr { position: absolute; left: 0; top: 0; width: 880px; height: 558px; overflow: hidden; background: #FFFFFF;
  opacity: 0; visibility: hidden; transition: opacity .25s ease, visibility 0s linear .25s; }
.e8-tour .scr.on { opacity: 1; visibility: visible; transition: opacity .45s ease .3s, visibility 0s; }
.e8-tour .scr img { display: block; object-fit: cover; object-position: top; }
.e8-tour .scr .hl { position: absolute; box-sizing: border-box; border: 2.157px solid var(--red); border-radius: 8.627px; background: rgba(227,30,36,.06);
  opacity: 0; transform: scale(1.04); transition: opacity .3s ease, transform .5s cubic-bezier(.22,1,.36,1); }
.e8-tour .scr .tag { position: absolute; padding: 4px 12px; border-radius: 4px; background: var(--red); color: #FFFFFF; font-size: 16px; font-weight: 700; line-height: 24px; white-space: nowrap;
  opacity: 0; transform: translateY(8px); transition: opacity .3s ease, transform .5s cubic-bezier(.22,1,.36,1); }
.e8-tour .scr.on .hl, .e8-tour .scr.on .tag { opacity: 1; transform: none; transition-delay: .8s; }

/* narrow screens and reduced motion: the four steps one under another */
.e8-tour .list { display: none; margin: 0; padding: 0; list-style: none; flex-direction: column; gap: 48px; }
.e8-tour .list .k { font-size: 16px; line-height: 24px; letter-spacing: .04em; color: var(--red); }
.e8-tour .list .t { margin: 8px 0 16px; font-size: 24px; font-weight: 700; line-height: 32px; color: var(--ink); }
.e8-tour .mini { max-width: 880px; overflow: hidden; border-radius: 12px; box-shadow: 0 16px 48px rgba(0,0,0,.12); }
.e8-tour .mini .win { left: 0; top: 0; box-shadow: none; }
.e8-tour .mini .scr .hl, .e8-tour .mini .scr .tag { transition: none; }
@media (max-width: 1023px), (max-height: 699px), (prefers-reduced-motion: reduce) {
  .e8-tour .pin { display: none; }
  .e8-tour .list { display: flex; }
}
@media (prefers-reduced-motion: reduce) {
  .e8-tour * { transition: none !important; }
}
`
