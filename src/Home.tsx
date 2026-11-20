import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CSS, IMG3 } from './portfolioV74'
import { useScreenInit } from './useScreenInit.js'
import { SiteHeaderB } from './SiteHeaderB'
import { GAMECOVE_LOGO_SVG, UTRADA_LOGO_SVG, svgUri } from './logos'
import { GIFS, useGifSrc } from './gifPlay'

// Main page — Harbor's Figma "Main · Trust Bank hover (video)" (44기 김지현 4차 PF, node 530:5259), built to the
// frame's sizes and type.
//
// Header: the shared site header (SiteHeaderB.tsx, mode 'overlay').
// Intro (Harbor, Nov 20 — Figma "Intro" frames on the Main page):
// - White page; her crash-zoom clip (office wide shot → close-up, 4.3s) plays in a portrait box centred in the hero,
//   sized like the Figma frame (499×887 in 1920×1080, so 82% of the height).
// - When the clip ends, the box snaps open (0.6s, quick start) to the full hero, and what's inside is already the hero
//   typing video (it keeps playing). The headline, quote and buttons then come in as before; the header fades in.
// - Plays once per page load (not again when coming back from a case study), never with reduced motion, and any
//   scroll, key, tap or click skips straight to the opening. Scrolling is held while the intro runs.
// Hero (1080 at 1920×1080):
// - Harbor's typing video, same slow zoom-in, parallax and gradient as before; #0F0F0F behind it.
// - Copy 80px from the bottom: quote ticker (20/32, 90%), 16px, headline (64/72, -2%; two 68px
//   lines, words 16px apart, 8px between the lines (v93, Harbor), second line 60%), 32px, two 192×48 buttons 8px apart
//   (16/24). The copy is pinned to the bottom, so the line gap pushes the first line and the quote up;
//   the second line and the buttons stay where they were.
// - Interactions: quote ticker every 2.5s, words rise in one by one, buttons fade in, dark layer lifts.
// Selected work (#FBFAF9, 160px top and bottom):
// - "Selected work" 48/56 -2%, 64px above the list.
// - Rows 320px (48px padding) in the 1440 column: 240px description (18/24; /0.n 16/24 #595959),
//   48px, 384×224 media, 48px, project name (96/96 -3%). 1px #DBDBD9 line between rows (hidden next to a
//   hovered row), all lines drawn inside so rows stay 320.
// - Logos at rest: 40px tall, black at 10%.
// - Hover: the row turns #F0F0EE, the logo gives way to the project's media; the other rows step back (description
//   48%, name 24%).
// - Media: every project shows Harbor's 384×224 GIF (gifPlay.ts; v138: UTrada and ETO Markets too), started from its
//   first frame each time the row is pointed at.
// v135: the ETO Markets logo at rest is Harbor's logo.svg (mark + ETO MARKETS, 181×62, #E2E1E0) at its own size.
// v28 (Harbor, Nov 19): UTrada's line now says what the case study is about (trust before the first deposit).
// Footer: Footer.tsx, rendered by index.tsx under every page.
// Type: Roboto everywhere (index.css).

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

// intro clip: Harbor's crash_zoom_closeup_v3.mp4 (1080×1920, 4.3s), saved for the web at 720×1280 without sound
const INTRO = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/main-intro/'
const INTRO_VIDEO = INTRO + 'intro-crash-zoom.mp4'
const INTRO_POSTER = INTRO + 'intro-crash-zoom-poster.jpg'
// Figma Intro frame: a 499×887 box in a 1920×1080 frame
const BOX_W = 499
const BOX_H = 887
const FRAME_H = 1080
const INTRO_WAIT_MS = 4000 // the clip hasn't started by then (slow network) → open straight to the hero
const INTRO_SAFETY_MS = 6500 // the clip started but never reported its end → open anyway
const GROW_MS = 600 // the box opening to the full hero (Harbor, Nov 20: fast, straight onto her face)
const COPY_AT_MS = 350 // the headline starts coming in while the box finishes opening

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
    title: 'UTrada', sub: 'Helping first-time traders trust a new broker.', href: '#/utrada',
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

/* ================= Hero (Figma 530:5431) ================= */
.hb .hero.hx { background: #0F0F0F; min-height: 720px; }
.hb .hero.hx::after { display: none; }
.hb .hx-stage { position: absolute; inset: 0; }
.hb .hx-vid { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%; }
.hb .hx-shade { position: absolute; inset: 0; z-index: 1; pointer-events: none; transition: opacity .9s ease;
  background: linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.2) 25%, rgba(0,0,0,.3) 55%, rgba(0,0,0,.72) 100%); }
.hb .hx-intro { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: #000000; opacity: 0; animation: hx-lift 1.2s ease-out both; }
@keyframes hx-lift { from { opacity: .45; } to { opacity: 0; } }

/* ---- intro (Figma "Intro" frames): white page, portrait box → the box opens to the full hero ---- */
.hb .hero.hx.intro { background: #FFFFFF; }
.hb .hx.intro .hx-stage { clip-path: inset(var(--it, 0px) var(--ix, 0px) var(--ib, 0px) var(--ix, 0px)); }
.hb .hx.intro.grow .hx-stage { clip-path: inset(0px 0px 0px 0px); transition: clip-path ${GROW_MS}ms cubic-bezier(.5,0,.15,1); }
.hb .hx-crash { position: absolute; z-index: 1; top: var(--it, 0px); left: var(--ix, 0px);
  width: calc(100% - 2 * var(--ix, 0px)); height: calc(100% - var(--it, 0px) - var(--ib, 0px));
  display: block; object-fit: cover; object-position: 50% 50%; background: #F0F0EE; pointer-events: none; }
/* a cut, not a cross-fade: the close-up and the wider hero framing would double up */
.hb .hx.grow .hx-crash { opacity: 0; transition: opacity .12s linear; }
/* the hero waits until the box has opened: no shade, no zoom, copy held at its first frame */
.hb .hx.hold .hx-shade { opacity: 0; }
.hb .hx.hold .hx-vid, .hb .hx.hold .w, .hb .hx.hold .hx-quote, .hb .hx.hold .hx-btn { animation-play-state: paused; }
.hb .hx.hold .hx-ctas { pointer-events: none; }
/* the header stays out of the white intro, then fades in */
html.hb-intro header { opacity: 0 !important; visibility: hidden !important; }
html.hb-intro-end header { animation: hb-hdr-in .6s ease-out both; }
@keyframes hb-hdr-in { from { opacity: 0; } to { opacity: 1; } }

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
function QuoteTicker({ run }: { run: boolean }) {
  const [i, setI] = useState(0)
  const [snap, setSnap] = useState(false)
  useEffect(() => {
    if (!run || QUOTES.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => setI(v => v + 1), QUOTE_MS)
    return () => clearInterval(t)
  }, [run])
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

/** the hero's background: Harbor's typing video; reduced motion keeps the poster still.
 *  With the intro on, it waits on its first frame until the box opens (Home starts it). */
function HeroVideo({ vref, hold }: { vref: React.RefObject<HTMLVideoElement>; hold: boolean }) {
  useEffect(() => {
    const el = vref.current; if (!el) return
    el.muted = true
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.pause(); return }
    if (!hold) el.play().catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <video ref={vref} className="hero-img hx-vid" src={HERO_VIDEO} poster={HERO_POSTER}
      autoPlay={!hold} muted loop playsInline preload="auto" aria-hidden="true" />
  )
}

function useReveal(dep?: unknown) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.in)'))
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [dep])
}

// Selected work row. Pointing at it (or focusing it) shows the media; a GIF starts from its first frame each time.
function ProjectRow({ p, i }: { p: Project; i: number }) {
  const [on, setOn] = useState(false)
  const gif = useGifSrc(p.gif, on)
  return (
    <li className="pl-item" data-reveal>
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

// ---------------- intro ----------------
// 'wait' = white page, the clip's first frame in the box, waiting for it to start; 'play' = the clip is running;
// 'grow' = the box opening onto the hero video; 'done' / 'off' = the normal hero.
type IntroPhase = 'off' | 'wait' | 'play' | 'grow' | 'done'
let INTRO_SEEN = false // once per page load: coming back from a case study goes straight to the hero

function firstIntroPhase(): IntroPhase {
  if (INTRO_SEEN || typeof window === 'undefined') return 'off'
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'off'
  // the Screens preview jumps to a section: no intro there
  if (/[?&]section=/.test(location.search) || /[?&]section=/.test(location.hash)) return 'off'
  return 'wait'
}

export function Home() {
  const screenInit = useScreenInit() as { section?: string } | undefined
  const heroBg = useRef<HTMLDivElement>(null)
  const heroSec = useRef<HTMLElement>(null)
  const heroVid = useRef<HTMLVideoElement>(null)
  const [intro, setIntro] = useState<IntroPhase>(firstIntroPhase)
  const [played] = useState(intro !== 'off')
  const [copyGo, setCopyGo] = useState(intro === 'off')
  const introOn = intro === 'wait' || intro === 'play' || intro === 'grow'
  const hold = played && !copyGo
  useReveal()

  // the Screens preview asked for a section after all: drop the intro
  useEffect(() => {
    if (screenInit?.section && introOn) { setIntro('off'); setCopyGo(true) }
  }, [screenInit]) // eslint-disable-line react-hooks/exhaustive-deps

  // the portrait box from the Figma Intro frame (499×887 of 1920×1080), centred in the visible part of the hero
  useLayoutEffect(() => {
    if (!introOn) return
    const fit = () => {
      const el = heroSec.current; if (!el) return
      const W = el.clientWidth
      const full = el.clientHeight
      const H = Math.min(full, innerHeight)
      let h = H * BOX_H / FRAME_H
      let w = h * BOX_W / BOX_H
      if (w > W - 32) { w = W - 32; h = w * BOX_H / BOX_W }
      const top = Math.round((H - h) / 2)
      el.style.setProperty('--ix', `${Math.round((W - w) / 2)}px`)
      el.style.setProperty('--it', `${top}px`)
      el.style.setProperty('--ib', `${Math.round(full - top - h)}px`)
    }
    fit()
    addEventListener('resize', fit)
    return () => removeEventListener('resize', fit)
  }, [introOn])

  // while the intro runs: page held at the top, header hidden; afterwards the header fades in
  useEffect(() => {
    if (!introOn) return
    INTRO_SEEN = true
    const de = document.documentElement
    const prevOverflow = de.style.overflow
    de.classList.add('hb-intro')
    de.style.overflow = 'hidden'
    scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    let t = 0
    return () => {
      de.classList.remove('hb-intro')
      de.style.overflow = prevOverflow
      de.classList.add('hb-intro-end')
      t = window.setTimeout(() => de.classList.remove('hb-intro-end'), 800)
      void t
    }
  }, [introOn])

  // waiting for the clip: if it never starts (slow network), open straight to the hero
  useEffect(() => {
    if (intro !== 'wait') return
    const t = window.setTimeout(() => setIntro('grow'), INTRO_WAIT_MS)
    return () => clearTimeout(t)
  }, [intro])

  // the clip is running: open when it ends (onEnded), or after a safety time
  useEffect(() => {
    if (intro !== 'play') return
    const t = window.setTimeout(() => setIntro('grow'), INTRO_SAFETY_MS)
    return () => clearTimeout(t)
  }, [intro])

  // any scroll, key, tap or click during the clip skips to the opening
  useEffect(() => {
    if (intro !== 'wait' && intro !== 'play') return
    const skip = () => setIntro('grow')
    const opts = { passive: true } as AddEventListenerOptions
    addEventListener('wheel', skip, opts)
    addEventListener('touchstart', skip, opts)
    addEventListener('keydown', skip)
    addEventListener('pointerdown', skip)
    return () => {
      removeEventListener('wheel', skip, opts)
      removeEventListener('touchstart', skip, opts)
      removeEventListener('keydown', skip)
      removeEventListener('pointerdown', skip)
    }
  }, [intro])

  // the box opens: the hero video starts from its first frame, the copy comes in near the end, then the normal hero
  useEffect(() => {
    if (intro !== 'grow') return
    const v = heroVid.current
    if (v) { try { v.currentTime = 0 } catch { /* not loaded yet */ } v.play().catch(() => {}) }
    const t1 = window.setTimeout(() => setCopyGo(true), COPY_AT_MS)
    const t2 = window.setTimeout(() => setIntro('done'), GROW_MS + 100)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [intro])

  // Hero parallax.
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = scrollY
        if (heroBg.current && y < innerHeight * 1.2) heroBg.current.style.transform = `translate3d(0, ${y * 0.25}px, 0)`
      })
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])

  // Screens preview: jump to the requested section on load.
  useEffect(() => {
    const key = screenInit?.section
    if (!key || !SECTION_IDS[key]) return
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(SECTION_IDS[key])
      if (el) scrollTo({ top: el.offsetTop - 64, behavior: 'instant' as ScrollBehavior })
    })
    return () => cancelAnimationFrame(raf)
  }, [screenInit])

  // rox.com timing: headline words from 0.3s, one after another; the quote at 1s; buttons at 0.7s / 0.8s
  const l1Start = 0.3
  const l2Start = l1Start + HERO_L1.split(' ').length * 0.07

  const heroCls = 'hero hx' + (introOn ? ' intro' : '') + (intro === 'grow' ? ' grow' : '') + (hold ? ' hold' : '')

  return (
    <div className="hb" id="top">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400&display=swap" />
      <style>{CSS + PAGE_CSS}</style>
      <SiteHeaderB mode="overlay" />

      {/* ===== Hero (with the intro on first load) ===== */}
      <section className={heroCls} aria-label="Intro" ref={heroSec}>
        <div className="hx-stage">
          <div className="hero-bg" ref={heroBg}><HeroVideo vref={heroVid} hold={played} /></div>
          <div className="hx-shade" aria-hidden="true" />
        </div>
        {introOn && (
          <video className="hx-crash" src={INTRO_VIDEO} poster={INTRO_POSTER} autoPlay muted playsInline preload="auto"
            aria-hidden="true"
            onPlaying={() => setIntro(p => (p === 'wait' ? 'play' : p))}
            onEnded={() => setIntro(p => (p === 'wait' || p === 'play' ? 'grow' : p))} />
        )}
        {!played && <div className="hx-intro" aria-hidden="true" />}
        <div className="hx-copy">
          <div className="hx-head">
            <QuoteTicker run={!hold} />
            <h1 className="hx-h1 serif" aria-label={`${HERO_L1} ${HERO_L2}`}>
              <span className="ln" aria-hidden="true"><Words text={HERO_L1} start={l1Start} /></span>
              <span className="ln mute" aria-hidden="true"><Words text={HERO_L2} start={l2Start} /></span>
            </h1>
          </div>
          <div className="hx-ctas">
            <a className="hx-btn ghost" href="#projects" tabIndex={hold ? -1 : undefined} style={{ '--wd': '0.7s' } as React.CSSProperties}>See all works</a>
            <a className="hx-btn solid" href={LINKS.cal} target="_blank" rel="noreferrer" tabIndex={hold ? -1 : undefined} style={{ '--wd': '0.8s' } as React.CSSProperties}>Say hello</a>
          </div>
        </div>
      </section>

      <main>
        {/* ===== Selected work ===== */}
        <section className="pl-sec" id="projects" aria-labelledby="pl-title">
          <div className="wrap">
            <h2 className="pl-title" id="pl-title" data-reveal>Selected work</h2>
          </div>
          <ul className="pl-list">
            {PROJECTS.map((p, i) => <ProjectRow p={p} i={i} key={p.title} />)}
          </ul>
        </section>
      </main>
    </div>
  )
}
