import React, { useEffect, useRef, useState } from 'react'
import { CSS, IMG3 } from './portfolioV74'
import { useScreenInit } from './useScreenInit.js'
import { SiteHeaderB } from './SiteHeaderB'
import { GAMECOVE_LOGO_SVG, UTRADA_LOGO_SVG, svgUri } from './logos'
import { GIFS, useGifSrc } from './gifPlay'

// Main page — Harbor's Figma "Main · Trust Bank hover (video)" (44기 김지현 4차 PF, node 530:5259), built to the
// frame's sizes and type.
//
// Header: the shared site header (SiteHeaderB.tsx, mode 'overlay').
//
// Hero → Selected work, one scroll scene (Nov 18, Harbor: "like mercury.com" — into HER LAPTOP, turning around her):
// - The hero is pinned for 3.2 screens of scrolling. Harbor's typing video stays as it was (same copy, quote ticker,
//   words, buttons, slow zoom-in on load).
// 1. Push: the copy and gradient leave and the camera moves in on her laptop (we see its back in the video).
// 2. Turn: the camera swings 180° around her — the shot turns away like a cube with motion blur — to the reverse
//    angle, looking over her shoulder at the laptop's screen.
// 3. Reverse angle (built in code, there is no second shot): the office behind, drawn live from the same video on a
//    small canvas (mirrored and soft, so it reads as out-of-focus background); her shoulder soft in the foreground;
//    a 3D laptop (lid leaning back, keyboard deck) whose screen shows the Selected work page.
// 4. Push into the screen: the lid straightens and the camera moves in until the screen fills the browser. At the end
//    the screen IS the top of Selected work, laid exactly over the real section, so the hand-over to the real,
//    clickable section can't be seen; from there the page scrolls on as normal.
// - "See all works" scrolls through the whole scene to Selected work.
// - Reduced motion: no pinning and no scene — the hero and Selected work sit one under the other.
//
// Hero (copy 80px from the bottom): quote ticker (20/32, 90%), 16px, headline (64/72, -2%; two 68px lines, words 16px
// apart, 8px between the lines, second line 60%), 32px, two 192×48 buttons 8px apart (16/24).
// Selected work (#FBFAF9, 160px top and bottom):
// - "Selected work" 48/56 -2%, 64px above the list.
// - Rows 320px (48px padding) in the 1440 column: 240px description (18/24; /0.n 16/24 #595959),
//   48px, 384×224 media, 48px, project name (96/96 -3%). 1px #DBDBD9 line between rows (hidden next to a
//   hovered row), all lines drawn inside so rows stay 320.
// - Logos at rest: 40px tall, black at 10%. Hover: the row turns #F0F0EE, the logo gives way to the project's GIF
//   (started from its first frame); the other rows step back (description 48%, name 24%).
// - The rows no longer rise in on scroll: they arrive through her laptop's screen.
// Footer: Footer.tsx, rendered by index.tsx under every page.

const LINKS = {
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
}

// the hero quote ticker (rox.com): Harbor's Figma quote first; the other two are lines already on the site
const QUOTES = [
  '“Clear design from objective insight”',
  '“I started in Fine Art, drawing what I saw.”',
  '“I test everything with real people.”',
]
const QUOTE_MS = 2500
const QUOTE_LH = 32
const HERO_L1 = 'Designing Clarity'
const HERO_L2 = 'from Data to Impact'
const HERO_VIDEO = IMG3 + 'hero-typing.mp4'
const HERO_POSTER = IMG3 + 'hero-typing-poster.jpg'

// ---- the scene (mercury.com) ----
// The video is 1920×1080 with a still camera. The back of her laptop's lid, measured on the frames:
// x 980–1730, y 594–1000 — the first push moves in on its centre.
const VW = 1920
const VH = 1080
const LAPTOP_BACK = { x: 1355, y: 797 }
// the part of the video drawn as the office behind the laptop on the reverse angle (left of Harbor)
const ROOM_SRC = { x: 0, y: 40, w: 470, h: 420 }
const PIN_SCREENS = 3.2 // how many screens of scrolling the scene takes
// timeline over the pinned scroll (0 → 1)
const T = {
  copyOut: 0.1,               // copy and gradient gone by here
  push1From: 0.02, push1To: 0.4, push1Zoom: 1.9, // move in on the back of the laptop
  turnFrom: 0.3, turnTo: 0.52,  // the 180° turn
  tiltTo: 0.7,                  // the lid has straightened by here
  push2From: 0.5, push2To: 0.88, // into the screen; the rest is a short hold on the full screen
}
// the 3D laptop on the reverse angle, in parts of the lid's width
const LID = { tilt: 12, bezel: 0.022, chin: 0.042, ratio: 0.66, deckDepth: 0.66, deckTilt: 76 }

const TB = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/trust-bank/'
const ETO = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/'

// Selected work rows
// wip (v132, Harbor Nov 15): the case study is still being written — a "Coming soon" tag sits next to the name (v138)
type Project = { title: string; sub: string; href: string; logo: string; gif?: string; img?: string; wip?: boolean; logoRaw?: boolean }
const PROJECTS: Project[] = [
  {
    title: 'Trust Bank', sub: 'Turning hidden rewards into everyday loyalty.', href: '#/trust-bank',
    logo: TB + 'logo.svg', gif: GIFS.trustBankRow,
  },
  {
    title: 'GameCove', sub: 'An AI game-analytics dashboard.', href: '#/gamecove',
    logo: svgUri(GAMECOVE_LOGO_SVG), gif: GIFS.gameCoveRow, // v146 (Harbor, Nov 17 21:13): no longer "Coming soon"
  },
  {
    title: 'UTrada', sub: 'Product design for a trading platform.', href: '#/utrada',
    logo: svgUri(UTRADA_LOGO_SVG), gif: GIFS.utradaRow, wip: true,
  },
  {
    title: 'ETO Markets', sub: 'A CRM dashboard for a Sydney-based trading broker.', href: '#/eto-markets',
    logo: ETO + 'v3/logo-home.svg', logoRaw: true, gif: GIFS.etoRow, wip: true,
  },
]
const WIP = 'Coming soon'

const SECTION_IDS: Record<string, string> = { work: 'projects' }
const SERIF = '"Newsreader", Georgia, "Times New Roman", serif'
const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif'

const PAGE_CSS = `
.hb .vh { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

/* ================= Hero → Selected work scene (mercury.com) ================= */
/* the stage is as tall as the pinned scroll; the pin holds the screen while it lasts */
.zs { position: relative; z-index: 2; pointer-events: none; }
.zs-pin { position: sticky; top: 0; height: 100vh; overflow: hidden; pointer-events: auto; background: #0F0F0F; }
.zs-pin .hero { height: 100%; min-height: 0; max-height: none; }
/* the turn: two faces of a cube — the front shot (her face) and the reverse angle (her laptop) */
.zs-cube { position: absolute; inset: 0; perspective: 1600px; }
.zs-spin { position: absolute; inset: 0; transform-style: preserve-3d; }
.zs-face { position: absolute; inset: 0; overflow: hidden; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.zs-face.back { visibility: hidden; background: #0F0F0F; }
.zs-cam { position: absolute; inset: 0; transform-origin: 0 0; }
.zs-copy, .zs-shade { will-change: opacity, transform; }
/* reverse angle: the office behind (canvas), her shoulder, the laptop */
.zs-room { position: absolute; left: -8%; top: -8%; width: 116%; height: 116%; display: block; filter: blur(6px) brightness(.58) saturate(.9);
  transform-origin: 54% 40%; }
.zs-room-shade { position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(70% 60% at 54% 42%, rgba(15,15,15,0) 0%, rgba(15,15,15,.55) 100%); }
/* her shoulder and hair, out of focus in the near foreground (her brown T-shirt, dark hair) */
.zs-shoulder { position: absolute; left: -10vw; bottom: -30vh; width: 38vw; height: 90vh; pointer-events: none; transform-origin: 0 100%; }
.zs-shoulder::before, .zs-shoulder::after { content: ""; position: absolute; border-radius: 50%; filter: blur(22px); }
.zs-shoulder::before { left: 0; right: 0; bottom: 0; height: 70%; background: radial-gradient(closest-side, #4A3328 0%, #3A281F 60%, rgba(40,28,22,0) 100%); }
.zs-shoulder::after { left: 22%; right: 8%; top: 0; height: 62%; background: radial-gradient(closest-side, #120E0C 0%, #0E0B0A 55%, rgba(14,11,10,0) 100%); }
.zs-rig { position: absolute; left: 0; top: 0; width: 100%; height: 100%; transform-origin: 0 0; }
.zs-3d { position: absolute; inset: 0; perspective: 1800px; }
.lt-lid { position: absolute; transform-origin: 50% 100%; background: #0B0B0C;
  box-shadow: 0 0 0 1.5px #B8B9BC, 0 40px 90px rgba(0,0,0,.5); }
.lt-cam { position: absolute; left: 50%; width: 6px; height: 6px; margin-left: -3px; border-radius: 50%; background: #1D1D1F; box-shadow: inset 0 0 0 1px #2C2C2E; }
.lt-scr { position: absolute; overflow: hidden; background: #FBFAF9; }
.lt-scr::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(115deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0) 38%); }
.lt-page { position: absolute; left: 0; top: 0; overflow: hidden; transform-origin: 0 0; }
.lt-deck { position: absolute; transform-origin: 50% 0; background: linear-gradient(180deg, #CFD0D3 0%, #BDBEC2 100%);
  box-shadow: inset 0 2px 0 rgba(255,255,255,.5); }
.lt-hinge { position: absolute; left: 6%; right: 6%; top: 0; height: 2.2%; background: #2A2A2D; }
.lt-keys { position: absolute; left: 7%; right: 7%; top: 8%; height: 46%; background-color: #2A2A2C;
  background-image:
    repeating-linear-gradient(90deg, transparent 0 calc(100% / 15 - 4px), #B9BABD calc(100% / 15 - 4px) calc(100% / 15)),
    repeating-linear-gradient(180deg, transparent 0 calc(100% / 6 - 4px), #B9BABD calc(100% / 6 - 4px) calc(100% / 6)); }
.lt-pad { position: absolute; left: 33%; right: 33%; top: 60%; height: 30%; background: rgba(0,0,0,.05); box-shadow: inset 0 0 0 1px rgba(0,0,0,.12); }
/* the real section starts under the end of the scene, so the hand-over can't be seen */
.zs-after { position: relative; z-index: 1; }
.zs.still { height: auto !important; pointer-events: auto; }
.zs.still .zs-pin { position: relative; }
.zs.still .zs-face.back { display: none; }

/* ================= Hero (Figma 530:5431) ================= */
.hb .hero.hx { background: #0F0F0F; }
.hb .hero.hx::after { display: none; }
.hb .hx-vid { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%; }
.hb .hx-shade { position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.2) 25%, rgba(0,0,0,.3) 55%, rgba(0,0,0,.72) 100%); }
.hb .hx-intro { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: #000000; opacity: 0; animation: hx-lift 1.2s ease-out both; }
@keyframes hx-lift { from { opacity: .45; } to { opacity: 0; } }
.hb .hx-copy { position: absolute; z-index: 2; left: 0; right: 0; bottom: 80px; display: flex; flex-direction: column; align-items: center; gap: 32px;
  padding: 0 16px; text-align: center; }
.hb .hx-head { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.hb .hx .serif, .hb .hx .serif * { font-family: ${SERIF}; font-weight: 400; }
/* two 68px lines, 8px apart (v93) */
.hb .hx-h1 { display: flex; flex-direction: column; align-items: stretch; gap: 8px; margin: 0; font-size: 64px; line-height: 72px; letter-spacing: -0.02em; color: #FAFAFA; }
.hb .hx-h1 .ln { display: flex; align-items: flex-end; justify-content: center; gap: 16px; height: 68px; white-space: nowrap; }
.hb .hx-h1 .mute { color: rgba(250,250,250,.6); }
.hb .hx .w { display: inline-block; line-height: 72px; opacity: 0; transform: translateY(10px); animation: hx-word .7s cubic-bezier(.22,1,.36,1) var(--wd, 0s) forwards; }
@keyframes hx-word { to { opacity: 1; transform: none; } }

/* quote ticker (rox.com): one-line window, the stack slides up one line at a time with a small spring settle */
.hb .hx-quote { margin: 0; font-size: 20px; line-height: ${QUOTE_LH}px; color: rgba(250,250,250,.9);
  opacity: 0; transform: translateY(2px); animation: hx-q .5s cubic-bezier(.22,1,.36,1) 1s forwards; }
@keyframes hx-q { to { opacity: 1; transform: none; } }
.hb .qt-clip { display: block; height: ${QUOTE_LH}px; overflow: hidden; }
.hb .qt-stack { display: block; transition: transform .55s cubic-bezier(.34,1.45,.64,1); will-change: transform; }
.hb .qt-line { display: block; height: ${QUOTE_LH}px; line-height: ${QUOTE_LH}px; white-space: nowrap; }

.hb .hx-ctas { display: flex; gap: 8px; }
.hb .hx-btn { display: inline-flex; align-items: center; justify-content: center; width: 192px; height: 48px; padding: 12px 16px;
  font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px; white-space: nowrap;
  opacity: 0; animation: hx-fade .4s ease-out var(--wd, 0s) forwards; transition: background-color .2s ease, border-color .2s ease, color .2s ease; }
@keyframes hx-fade { to { opacity: 1; } }
.hb .hx-btn.ghost { background: rgba(0,0,0,.18); border: 1px solid rgba(250,250,250,.15); color: #FAFAFA;
  -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); }
.hb .hx-btn.ghost:hover { background: rgba(250,250,250,.1); border-color: rgba(250,250,250,.3); }
.hb .hx-btn.solid { background: #FAFAFA; color: #0F0F0F; }
.hb .hx-btn.solid:hover { background: #E7E5E4; }
.hb .hx-btn:focus-visible { outline: 2px solid #FAFAFA; outline-offset: 3px; }

/* ================= Selected work (Figma 530:5290) ================= */
.pl-sec { --wrap: min(1440px, calc(100vw - 64px)); background: #FBFAF9; padding: 160px 0; }
.hb .pl-title { margin: 0 0 64px; font-family: ${SERIF}; font-size: 48px; font-weight: 400; line-height: 56px; letter-spacing: -0.02em; color: #0F0F0F; }
.pl-list { list-style: none; margin: 0; padding: 0; }
.hb a.pl-link { display: block; color: #0F0F0F; text-decoration: none; transition: background-color .35s ease; }
.hb a.pl-link:hover, .hb a.pl-link:focus-visible { background: #F0F0EE; }
.hb a.pl-link:focus-visible { outline: 2px solid #2563EB; outline-offset: -2px; }
.pl-row { display: grid; grid-template-columns: 240px 384px minmax(0, 1fr); gap: 48px; align-items: center; height: 320px; padding: 48px 0; }
.pl-item + .pl-item .pl-row { box-shadow: inset 0 1px 0 #DBDBD9; }
.pl-link:hover .pl-row, .pl-link:focus-visible .pl-row, .pl-item:hover + .pl-item .pl-row, .pl-item:focus-within + .pl-item .pl-row { box-shadow: none; }
.pl-desc { display: flex; flex-direction: column; justify-content: space-between; height: 224px; }
.hb .pl-desc p { margin: 0; font-family: ${SANS}; font-size: 18px; font-weight: 400; line-height: 24px; color: #0F0F0F; transition: opacity .35s ease; }
.hb .pl-n { font-family: ${SANS}; font-size: 16px; line-height: 24px; color: #595959; }
.pl-media { position: relative; width: 384px; height: 224px; }
/* every project logo 40px tall, black at 10% */
.pl-logo { position: absolute; left: 0; top: 50%; height: 40px; width: auto; max-width: 100%; transform: translateY(-50%);
  filter: grayscale(1) brightness(0); opacity: .1; transition: opacity .3s ease; }
.pl-shot { position: absolute; inset: 0; overflow: hidden; background: #0F0F0F; opacity: 0; transform: scale(.94);
  transition: opacity .35s ease, transform .55s var(--ease); }
.pl-shot img { display: block; width: 100%; height: 100%; object-fit: cover; }
.pl-link:hover .pl-shot, .pl-link:focus-visible .pl-shot { opacity: 1; transform: none; }
.pl-link:hover .pl-logo, .pl-link:focus-visible .pl-logo { opacity: 0; }
/* v135: ETO Markets uses Harbor's own logo.svg at its own size (181×62); its grey #E2E1E0 is already the 10% black look, so no filter */
.pl-logo.raw { width: 181px; height: 62px; max-width: none; filter: none; opacity: 1; }
.hb .pl-name { font-family: ${SERIF}; font-size: clamp(64px, 5vw, 96px); font-weight: 400; line-height: 1; letter-spacing: -0.03em; color: #0F0F0F;
  white-space: nowrap; transition: opacity .35s ease; }
/* v132: tag next to a case study that isn't finished yet (v138: "Coming soon") */
.hb .pl-wip { display: inline-flex; align-items: center; height: 32px; margin-left: 24px; padding: 0 8px; vertical-align: middle; position: relative; top: -8px;
  border: 1px solid #0F0F0F; font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px; letter-spacing: 0; color: #0F0F0F; white-space: nowrap; }
/* the Figma hover frame: while one row is pointed at, the others step back */
.pl-list:hover .pl-item:not(:hover) .pl-desc p, .pl-list:focus-within .pl-item:not(:focus-within) .pl-desc p { opacity: .48; }
.pl-list:hover .pl-item:not(:hover) .pl-name, .pl-list:focus-within .pl-item:not(:focus-within) .pl-name { opacity: .24; }
@media (hover: none) {
  .pl-shot { opacity: 1; transform: none; }
  .pl-logo { display: none; }
}

@media (max-width: 1280px) {
  .pl-row { grid-template-columns: 200px minmax(0, 320px) minmax(0, 1fr); gap: 32px; }
  .pl-media { width: 100%; height: auto; aspect-ratio: 384 / 224; }
}
@media (max-width: 900px) {
  .hb .hx-h1 { font-size: 40px; line-height: 48px; }
  .hb .hx-h1 .ln { height: auto; gap: 10px; white-space: normal; flex-wrap: wrap; }
  .hb .hx .w { line-height: 48px; }
  .hb .qt-line { white-space: normal; }
  .hb .hx-ctas { flex-direction: column; width: 100%; max-width: 360px; }
  .hb .hx-btn { width: 100%; }
  .pl-sec { padding: 96px 0; }
  .hb .pl-title { margin-bottom: 40px; font-size: 40px; line-height: 48px; }
  .pl-row { grid-template-columns: minmax(0, 1fr); gap: 20px; height: auto; padding: 40px 0; }
  .hb .pl-name { order: -1; font-size: 56px; white-space: normal; }
  .hb .pl-wip { margin-left: 16px; top: -4px; }
  .pl-desc { height: auto; gap: 16px; }
  .pl-shot { opacity: 1; transform: none; }
  .pl-logo { display: none; }
}
`

// Splits a line into words that come in one after another (rox.com); the line lays them out 16px apart (Figma).
function Words({ text, start, step = 0.07 }: { text: string; start: number; step?: number }) {
  const ws = text.split(' ')
  return (
    <>
      {ws.map((w, i) => (
        <span className="w" key={i} style={{ '--wd': `${(start + i * step).toFixed(2)}s` } as React.CSSProperties}>{w}</span>
      ))}
    </>
  )
}

/** rox.com quote ticker: one line visible; the stack slides up a line every 2.5s and loops back to the first */
function QuoteTicker() {
  const [i, setI] = useState(0)
  const [snap, setSnap] = useState(false)
  useEffect(() => {
    if (QUOTES.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => setI(v => v + 1), QUOTE_MS)
    return () => clearInterval(t)
  }, [])
  // after sliding onto the copy of the first line at the end, jump back to the real first line without animating
  const onEnd = (e: React.TransitionEvent) => { if (e.target === e.currentTarget && i >= QUOTES.length) { setSnap(true); setI(0) } }
  useEffect(() => {
    if (!snap) return
    let r2 = 0
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setSnap(false)) })
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2) }
  }, [snap])
  const list = [...QUOTES, QUOTES[0]]
  return (
    <p className="hx-quote serif">
      <span className="vh">{QUOTES[0]}</span>
      <span className="qt-clip" aria-hidden="true">
        <span className="qt-stack" onTransitionEnd={onEnd}
          style={{ transform: `translateY(${-i * QUOTE_LH}px)`, transition: snap ? 'none' : undefined }}>
          {list.map((q, k) => <span className="qt-line" key={k}>{q}</span>)}
        </span>
      </span>
    </p>
  )
}

/** the hero's background: Harbor's typing video; reduced motion keeps the poster still */
const HeroVideo = React.forwardRef<HTMLVideoElement>(function HeroVideo(_, ref) {
  const v = useRef<HTMLVideoElement | null>(null)
  useEffect(() => {
    const el = v.current; if (!el) return
    el.muted = true
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.pause(); return }
    el.play().catch(() => {})
  }, [])
  return (
    <video ref={el => { v.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el }}
      className="hero-img hx-vid" src={HERO_VIDEO} poster={HERO_POSTER}
      autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
  )
})

// Selected work row. Pointing at it (or focusing it) shows the media; a GIF starts from its first frame each time.
function ProjectRow({ p, i }: { p: Project; i: number }) {
  const [on, setOn] = useState(false)
  const gif = useGifSrc(p.gif, on)
  return (
    <li className="pl-item">
      <a className="pl-link" href={p.href} onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)}
        onFocus={() => setOn(true)} onBlur={() => setOn(false)} aria-label={`${p.title}${p.wip ? ' (coming soon)' : ''}: ${p.sub}`}>
        <div className="wrap pl-row">
          <div className="pl-desc">
            <p>{p.sub}</p>
            <span className="pl-n">/0.{i + 1}</span>
          </div>
          <div className="pl-media" aria-hidden="true">
            <img className={'pl-logo' + (p.logoRaw ? ' raw' : '')} src={p.logo} alt="" />
            <div className="pl-shot">
              {p.gif ? <img src={gif} alt="" width={384} height={224} /> : <img src={p.img} alt="" loading="lazy" />}
            </div>
          </div>
          <div className="pl-name">{p.title}{p.wip && <span className="pl-wip" aria-hidden="true">{WIP}</span>}</div>
        </div>
      </a>
    </li>
  )
}

/** Selected work. `mirror`: the copy shown on her laptop's screen during the scene (no ids; hidden from screen readers and keys). */
function SelectedWork({ mirror = false, secRef }: { mirror?: boolean; secRef?: React.Ref<HTMLElement> }) {
  return (
    <section ref={secRef} className={'pl-sec' + (mirror ? '' : ' zs-after')} id={mirror ? undefined : 'projects'}
      aria-labelledby={mirror ? undefined : 'pl-title'}>
      <div className="wrap">
        <h2 className="pl-title" id={mirror ? undefined : 'pl-title'}>Selected work</h2>
      </div>
      <ul className="pl-list">
        {PROJECTS.map((p, i) => <ProjectRow p={p} i={i} key={p.title} />)}
      </ul>
    </section>
  )
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const span = (v: number, a: number, b: number) => clamp01((v - a) / (b - a))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * The mercury.com scene: the pinned hero, the push in on her laptop, the 180° turn to the reverse angle and the push
 * into the laptop's screen, which turns into Selected work. Everything is driven straight from the scroll position
 * (no React re-renders while scrolling).
 */
type SceneRefs = {
  stage: React.RefObject<HTMLElement>; pin: React.RefObject<HTMLDivElement>; after: React.RefObject<HTMLElement>
  spin: React.RefObject<HTMLDivElement>; front: React.RefObject<HTMLDivElement>; back: React.RefObject<HTMLDivElement>
  cam: React.RefObject<HTMLDivElement>; vid: React.RefObject<HTMLVideoElement>
  copy: React.RefObject<HTMLDivElement>; shade: React.RefObject<HTMLDivElement>
  room: React.RefObject<HTMLCanvasElement>; shoulder: React.RefObject<HTMLDivElement>; rig: React.RefObject<HTMLDivElement>
  lid: React.RefObject<HTMLDivElement>; cam2: React.RefObject<HTMLDivElement>; scr: React.RefObject<HTMLDivElement>
  page: React.RefObject<HTMLDivElement>; deck: React.RefObject<HTMLDivElement>; d3: React.RefObject<HTMLDivElement>
}

function useLaptopTurn(still: boolean, r: SceneRefs) {
  useEffect(() => {
    const stage = r.stage.current, pin = r.pin.current, after = r.after.current
    if (!stage || !pin || !after) return
    if (still) {
      stage.style.height = ''; pin.style.height = ''; after.style.marginTop = ''
      return
    }
    let W = 0, H = 0, L = 0
    // the laptop's screen at rest (lid upright), and the push that makes it fill the browser
    let scx = 0, scy = 0, zEnd = 1, Ox = 0, Oy = 0
    const size = () => {
      W = document.documentElement.clientWidth
      H = window.innerHeight
      L = Math.round(H * PIN_SCREENS)
      stage.style.height = `${H + L}px`
      pin.style.height = `${H}px`
      after.style.marginTop = `${-H}px`

      // lay out the laptop (all in px, from the lid's width)
      const lw = Math.round(Math.min(W * 0.52, H * 0.86))
      const lh = Math.round(lw * LID.ratio)
      const bz = lw * LID.bezel, chin = lw * LID.chin
      const left = Math.round(W * 0.54 - lw / 2), top = Math.round(H * 0.13)
      const sw = lw - 2 * bz, sh = lh - bz - chin
      const lid = r.lid.current, scr = r.scr.current, page = r.page.current, deck = r.deck.current, cam2 = r.cam2.current
      if (lid) Object.assign(lid.style, { left: `${left}px`, top: `${top}px`, width: `${lw}px`, height: `${lh}px`,
        borderRadius: `${lw * 0.026}px ${lw * 0.026}px 0 0` })
      if (cam2) cam2.style.top = `${bz * 0.35}px`
      if (scr) Object.assign(scr.style, { left: `${bz}px`, top: `${bz}px`, width: `${sw}px`, height: `${sh}px` })
      // Selected work on the screen: laid out at full browser size and fitted into the screen; at the end of the push it
      // is 1:1 and sits exactly where the real section is
      if (page) {
        const k = Math.min(sw / W, sh / H)
        Object.assign(page.style, { width: `${W}px`, height: `${H}px`,
          transform: `translate3d(${(sw - W * k) / 2}px, ${(sh - H * k) / 2}px, 0) scale(${k})` })
      }
      if (deck) {
        const dw = lw * 1.04
        Object.assign(deck.style, { left: `${left + (lw - dw) / 2}px`, top: `${top + lh}px`, width: `${dw}px`, height: `${lw * LID.deckDepth}px`,
          borderRadius: `0 0 ${lw * 0.03}px ${lw * 0.03}px`, transform: `rotateX(${LID.deckTilt}deg)` })
      }
      if (r.d3.current) r.d3.current.style.perspectiveOrigin = `${left + lw / 2}px ${top + lh * 0.45}px`
      scx = left + bz + sw / 2; scy = top + bz + sh / 2
      zEnd = Math.max(W / sw, H / sh)
      Ox = (W / 2 - zEnd * scx) / (1 - zEnd); Oy = (H / 2 - zEnd * scy) / (1 - zEnd)
      if (r.room.current) { r.room.current.width = 240; r.room.current.height = 135 }
    }
    size()

    let raf = 0
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const y = window.scrollY - stage.offsetTop
      if (y > L + H) return // scene is off screen
      const p = clamp01(y / L)
      const v = r.vid.current

      // ---- 1. push in on the back of her laptop ----
      // the video's own slow zoom-in on load (portfolioV74 .hero-img, scale 1.1 → 1 about its centre)
      let s = 1
      if (v) { const t = getComputedStyle(v).transform; if (t && t !== 'none') s = new DOMMatrixReadOnly(t).a }
      const c = Math.max(W / VW, H / VH)
      const lx = W / 2 + s * ((W - VW * c) / 2 + LAPTOP_BACK.x * c - W / 2)
      const ly = H / 2 + s * ((H - VH * c) / 2 + LAPTOP_BACK.y * c - H / 2)
      const e1 = easeInOut(span(p, T.push1From, T.push1To))
      const z1 = 1 + (T.push1Zoom - 1) * e1
      if (r.cam.current) r.cam.current.style.transform = `translate3d(${lx * (1 - z1)}px, ${ly * (1 - z1)}px, 0) scale(${z1})`
      const out = span(p, 0, T.copyOut)
      if (r.copy.current) {
        r.copy.current.style.opacity = String(1 - out)
        r.copy.current.style.transform = `translate3d(0, ${-32 * out}px, 0)`
        r.copy.current.style.visibility = out >= 1 ? 'hidden' : ''
      }
      if (r.shade.current) r.shade.current.style.opacity = String(1 - span(e1, 0, 0.6))

      // ---- 2. the 180° turn: the front shot turns away, the reverse angle turns in (cube), with motion blur ----
      const a = easeInOut(span(p, T.turnFrom, T.turnTo))
      const mid = Math.sin(Math.PI * a) // 0 → 1 → 0
      if (r.spin.current) r.spin.current.style.transform = `translateZ(${-W * 0.5 * mid}px)`
      const blur = `blur(${(14 * mid).toFixed(2)}px) brightness(${(1 - 0.35 * mid).toFixed(3)})`
      const front = r.front.current, back = r.back.current
      if (front) {
        front.style.transformOrigin = `50% 50% ${-W / 2}px`
        front.style.transform = `rotateY(${-90 * a}deg)`
        front.style.filter = mid > 0.001 ? blur : ''
        front.style.visibility = a >= 1 ? 'hidden' : ''
      }
      if (back) {
        back.style.transformOrigin = `50% 50% ${-W / 2}px`
        back.style.transform = `rotateY(${90 * (1 - a)}deg)`
        back.style.filter = mid > 0.001 ? blur : ''
        back.style.visibility = a <= 0 ? 'hidden' : 'visible'
      }

      // ---- 3 + 4. reverse angle: lid straightens, push into the screen ----
      if (a > 0) {
        const tilt = LID.tilt * (1 - easeInOut(span(p, T.turnTo - 0.04, T.tiltTo)))
        if (r.lid.current) r.lid.current.style.transform = `rotateX(${tilt}deg)`
        const e2 = easeInOut(span(p, T.push2From, T.push2To))
        const z2 = Math.pow(zEnd, e2) // even zoom speed
        if (r.rig.current) r.rig.current.style.transform = `translate3d(${Ox * (1 - z2)}px, ${Oy * (1 - z2)}px, 0) scale(${z2})`
        // the room moves less than the laptop (it is further away); her shoulder slides out of the frame first
        if (r.room.current) r.room.current.style.transform = `scale(${Math.pow(z2, 0.18).toFixed(4)})`
        if (r.shoulder.current) {
          const sh = span(e2, 0, 0.45)
          r.shoulder.current.style.transform = `translate3d(${-30 * sh}vw, ${12 * sh}vh, 0) scale(${1 + 0.6 * sh})`
          r.shoulder.current.style.opacity = String(1 - sh)
        }
        // the office behind: the left of the same video (windows, lights, plants, a colleague — not Harbor), mirrored and drawn
        // small so it reads soft and out of focus
        const room = r.room.current
        if (room && v && v.readyState >= 2 && p < 1) {
          const ctx = room.getContext('2d')
          if (ctx) { ctx.setTransform(-1, 0, 0, 1, room.width, 0); ctx.drawImage(v, ROOM_SRC.x, ROOM_SRC.y, ROOM_SRC.w, ROOM_SRC.h, 0, 0, room.width, room.height) }
        }
      }

      // hand over to the real section once the scene has ended
      pin.style.visibility = y >= L ? 'hidden' : ''
    }
    raf = requestAnimationFrame(frame)
    // phones: the address bar showing/hiding changes the height a little on every scroll — only a real resize re-lays the scene
    let lastW = W, lastH = H
    const onResize = () => {
      const w = document.documentElement.clientWidth, h = window.innerHeight
      if (w === lastW && Math.abs(h - lastH) < 120) return
      lastW = w; lastH = h
      size()
    }
    addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', onResize) }
  }, [still])
}

export function Home() {
  const screenInit = useScreenInit() as { section?: string } | undefined
  const [still] = useState(() => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)

  const refs: SceneRefs = {
    stage: useRef<HTMLElement>(null), pin: useRef<HTMLDivElement>(null), after: useRef<HTMLElement>(null),
    spin: useRef<HTMLDivElement>(null), front: useRef<HTMLDivElement>(null), back: useRef<HTMLDivElement>(null),
    cam: useRef<HTMLDivElement>(null), vid: useRef<HTMLVideoElement>(null),
    copy: useRef<HTMLDivElement>(null), shade: useRef<HTMLDivElement>(null),
    room: useRef<HTMLCanvasElement>(null), shoulder: useRef<HTMLDivElement>(null), rig: useRef<HTMLDivElement>(null),
    lid: useRef<HTMLDivElement>(null), cam2: useRef<HTMLDivElement>(null), scr: useRef<HTMLDivElement>(null),
    page: useRef<HTMLDivElement>(null), deck: useRef<HTMLDivElement>(null), d3: useRef<HTMLDivElement>(null),
  }
  useLaptopTurn(still, refs)

  // the reverse angle (and the screen's copy of Selected work) can't be reached by keyboard or screen readers
  useEffect(() => { refs.back.current?.setAttribute('inert', '') }, [])

  // Screens preview: jump to the requested section on load.
  useEffect(() => {
    const key = screenInit?.section
    if (!key || !SECTION_IDS[key]) return
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(SECTION_IDS[key])
      if (el) scrollTo({ top: el.offsetTop, behavior: 'instant' as ScrollBehavior })
    })
    return () => cancelAnimationFrame(raf)
  }, [screenInit])

  // "See all works": scroll through the whole scene to Selected work
  const toWork = (e: React.MouseEvent) => {
    const el = refs.after.current
    if (!el) return
    e.preventDefault()
    scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: still ? 'auto' : 'smooth' })
  }

  // rox.com timing: headline words from 0.3s, one after another; the quote at 1s; buttons at 0.7s / 0.8s
  const l1Start = 0.3
  const l2Start = l1Start + HERO_L1.split(' ').length * 0.07

  return (
    <div className="hb" id="top">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400&display=swap" />
      <style>{CSS + PAGE_CSS}</style>
      <SiteHeaderB mode="overlay" />

      {/* ===== Hero → her laptop → Selected work (mercury.com) ===== */}
      <section className={'zs' + (still ? ' still' : '')} ref={refs.stage} aria-label="Intro">
        <div className="zs-pin" ref={refs.pin}>
          <div className="zs-cube">
            <div className="zs-spin" ref={refs.spin}>
              {/* front shot: Harbor at her desk */}
              <div className="zs-face" ref={refs.front}>
                <div className="hero hx">
                  <div className="hero-bg zs-cam" ref={refs.cam}><HeroVideo ref={refs.vid} /></div>
                  <div className="hx-shade zs-shade" ref={refs.shade} aria-hidden="true" />
                  <div className="hx-intro" aria-hidden="true" />
                  <div className="hx-copy zs-copy" ref={refs.copy}>
                    <div className="hx-head">
                      <QuoteTicker />
                      <h1 className="hx-h1 serif" aria-label={`${HERO_L1} ${HERO_L2}`}>
                        <span className="ln" aria-hidden="true"><Words text={HERO_L1} start={l1Start} /></span>
                        <span className="ln mute" aria-hidden="true"><Words text={HERO_L2} start={l2Start} /></span>
                      </h1>
                    </div>
                    <div className="hx-ctas">
                      <a className="hx-btn ghost" href="#projects" onClick={toWork} style={{ '--wd': '0.7s' } as React.CSSProperties}>See all works</a>
                      <a className="hx-btn solid" href={LINKS.cal} target="_blank" rel="noreferrer" style={{ '--wd': '0.8s' } as React.CSSProperties}>Say hello</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* reverse angle: over her shoulder, her laptop's screen */}
              <div className="zs-face back" ref={refs.back} aria-hidden="true">
                <canvas className="zs-room" ref={refs.room} />
                <div className="zs-room-shade" />
                <div className="zs-rig" ref={refs.rig}>
                  <div className="zs-3d" ref={refs.d3}>
                    <div className="lt-deck" ref={refs.deck}>
                      <div className="lt-hinge" /><div className="lt-keys" /><div className="lt-pad" />
                    </div>
                    <div className="lt-lid" ref={refs.lid}>
                      <div className="lt-cam" ref={refs.cam2} />
                      <div className="lt-scr" ref={refs.scr}>
                        <div className="lt-page" ref={refs.page}><SelectedWork mirror /></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="zs-shoulder" ref={refs.shoulder} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main>
        {/* ===== Selected work ===== */}
        <SelectedWork secRef={refs.after} />
      </main>
    </div>
  )
}
