import React, { useEffect, useRef, useState } from 'react'
import { CSS, IMG3 } from './portfolioV74'
import { useScreenInit } from './useScreenInit.js'
import { SiteHeaderB } from './SiteHeaderB'
import { ClosingCTAB } from './ClosingCTAB'

// Main page (v79). Built on v74's main page (v24 restored), moved here in v75.
//
// Header: the shared site header (SiteHeaderB.tsx, mode 'overlay') — the same header every page uses.
// Hero — Harbor's Figma "Hero · Header B · Symmetry" (node 457:10725) with rox.com's interactions:
// - Background: Harbor's own 8-second typing video, shown exactly as the photo it replaced (same scene, framing and
//   brightness): full opacity, the same slow zoom-in, parallax and Figma gradient on top. Reduced motion: still poster.
// - Quote: rox.com's quote ticker — a one-line window; the stack slides up one line every 2.5s with a small spring
//   settle and loops. Fades in and rises 2px at 1s. Lines: Harbor's Figma quote, then two lines already on the site.
// - Headline: words rise in one by one (rox.com); buttons fade in at 0.7s / 0.8s; a dark layer lifts over 1.2s.
// Selected work — the v68 section as it was (palantir.com "Our Software"-style rows, faint logo → video on hover,
// warm white, 1440 container), with the heading and project names in Newsreader.
// Closing CTA (v79) — Harbor's Figma "Closing CTA" (node 474:217) with the working Kim LLM chat: ClosingCTAB.tsx.
// Footer (v79) — Harbor's Figma "Footer" (node 474:241): Footer.tsx, rendered by index.tsx under every page.
// Type: UI in Helvetica Neue; hero quote / headline and the Selected work titles in Newsreader. Nothing under 16px.

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
const QUOTE_LH = 24
const HERO_L1 = 'Designing Clarity'
const HERO_L2 = 'from Data to Impact'
const HERO_VIDEO = IMG3 + 'hero-typing.mp4'
const HERO_POSTER = IMG3 + 'hero-typing-poster.jpg'

const GC = 'https://raw.githubusercontent.com/Harbor-K/landing_page/main/gamecove/assets/v4/'
const TB = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/trust-bank/'

// UTrada mark (same as the UTrada case page)
const UTRADA_SVG = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="4" fill="#38029D"/><path d="M20.8137 12L20.7642 12.2773L19.0159 22.2134C18.4395 25.4849 15.3129 28.1484 12.0457 28.1484C10.4635 28.1484 9.07577 27.5308 8.13822 26.4127C7.17956 25.2689 6.80943 23.747 7.09286 22.1315L8.87681 12H9.07354C9.73433 12 10.3156 12.2606 10.7074 12.7278C11.1081 13.2073 11.2626 13.841 11.1454 14.5153L9.79101 22.2134C9.63596 23.0871 9.83325 23.9046 10.344 24.5149C10.843 25.1118 11.5861 25.4382 12.4391 25.4382C14.2581 25.4382 15.9993 23.9564 16.3205 22.1315L17.6754 14.4329C17.9099 13.092 19.1943 12 20.5347 12H20.8137Z" fill="white"/><path d="M32.6067 12L32.131 14.7102H27.9095L25.5448 28.1484H22.8328L25.198 14.7102H20.9766L21.4551 12H32.6067Z" fill="white"/></svg>`

// Selected work rows (v68)
type Project = {
  title: string; sub: string; href: string; logo: string; logoSquare?: boolean
  video?: string; poster?: string; img?: string
}
const PROJECTS: Project[] = [
  {
    title: 'Trust Bank', sub: 'Turning hidden rewards into everyday loyalty.', href: '#/trust-bank',
    logo: TB + 'logo.svg',
    video: TB + 'hero-sfx-v2.mp4', poster: TB + 'hero-sfx-v2-poster.jpg',
  },
  {
    title: 'GameCove', sub: 'An AI game-analytics dashboard.', href: '#/gamecove',
    logo: 'https://raw.githubusercontent.com/Harbor-K/landing_page/main/gamecove/assets/logo.png',
    video: GC + 'hero-ad.mp4', poster: GC + 'hero-ad-poster.jpg',
  },
  {
    title: 'UTrada', sub: 'Product design for a trading platform.', href: '#/utrada',
    logo: `data:image/svg+xml;utf8,${encodeURIComponent(UTRADA_SVG)}`, logoSquare: true,
    img: IMG3 + 'utrada-screens.webp',
  },
]

const SECTION_IDS: Record<string, string> = { work: 'projects', contact: 'contact' }
const SERIF = '"Newsreader", Georgia, "Times New Roman", serif'

const PAGE_CSS = `
.hb .vh { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

/* ================= Hero (Figma) + rox.com intro ================= */
.hb .hero.hx { background: #0C0A09; min-height: 720px; }
.hb .hero.hx::after { display: none; }
/* Harbor's typing video, shown exactly as the photo was: full opacity, same slow zoom (.hero-img), parallax and gradient */
.hb .hx-vid { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%; }
.hb .hx-shade { position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.2) 25%, rgba(0,0,0,.3) 55%, rgba(0,0,0,.72) 100%); }
.hb .hx-intro { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: #000000; opacity: 0; animation: hx-lift 1.2s ease-out both; }
@keyframes hx-lift { from { opacity: .45; } to { opacity: 0; } }
.hb .hx-copy { position: absolute; z-index: 2; left: 0; right: 0; bottom: 48px; display: flex; flex-direction: column; align-items: center; gap: 24px;
  padding: 0 16px; text-align: center; }
.hb .hx-head { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.hb .hx .serif, .hb .hx .serif * { font-family: ${SERIF}; font-weight: 400; }
.hb .hx-h1 { margin: 0; font-size: 56px; line-height: 68px; letter-spacing: -0.02em; color: #FAFAFA; }
.hb .hx-h1 .ln { display: block; }
.hb .hx-h1 .mute { color: rgba(250,250,250,.6); }
.hb .hx .w { display: inline-block; opacity: 0; transform: translateY(10px); animation: hx-word .7s cubic-bezier(.22,1,.36,1) var(--wd, 0s) forwards; }
@keyframes hx-word { to { opacity: 1; transform: none; } }

/* quote ticker (rox.com): one-line window, the stack slides up one line at a time with a small spring settle */
.hb .hx-quote { margin: 0; font-size: 18px; line-height: ${QUOTE_LH}px; color: rgba(250,250,250,.9);
  opacity: 0; transform: translateY(2px); animation: hx-q .5s cubic-bezier(.22,1,.36,1) 1s forwards; }
@keyframes hx-q { to { opacity: 1; transform: none; } }
.hb .qt-clip { display: block; height: ${QUOTE_LH}px; overflow: hidden; }
.hb .qt-stack { display: block; transition: transform .55s cubic-bezier(.34,1.45,.64,1); will-change: transform; }
.hb .qt-line { display: block; height: ${QUOTE_LH}px; line-height: ${QUOTE_LH}px; white-space: nowrap; }

.hb .hx-ctas { display: flex; gap: 8px; }
.hb .hx-btn { display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 12px 16px; font-size: 18px; line-height: 24px;
  white-space: nowrap; opacity: 0; animation: hx-fade .4s ease-out var(--wd, 0s) forwards; transition: background-color .2s ease, border-color .2s ease, color .2s ease; }
@keyframes hx-fade { to { opacity: 1; } }
.hb .hx-btn.ghost { width: 248px; background: rgba(0,0,0,.18); border: 1px solid rgba(250,250,250,.15); color: #FAFAFA;
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.hb .hx-btn.ghost:hover { background: rgba(250,250,250,.1); border-color: rgba(250,250,250,.3); }
.hb .hx-btn.solid { width: 264px; background: #FAFAFA; color: #0C0A09; }
.hb .hx-btn.solid:hover { background: #E7E5E4; }
.hb .hx-btn:focus-visible { outline: 2px solid #FAFAFA; outline-offset: 3px; }

/* ================= Selected work (v68: palantir.com "Our Software"-style list); titles in Newsreader ================= */
.pl-sec { --wrap: min(1440px, calc(100vw - 64px)); background: #FBFAF9; padding-bottom: 0; }
.hb .pl-title { margin: 0 0 40px; font-family: ${SERIF}; font-size: clamp(56px, 4.6vw, 88px); font-weight: 500; line-height: 1.1; letter-spacing: -0.03em; color: var(--ink); }
.pl-list { list-style: none; margin: 0; padding: 0; }
.hb a.pl-link { display: block; color: var(--ink); text-decoration: none; transition: background-color .35s ease; }
.hb a.pl-link:hover, .hb a.pl-link:focus-visible { background: #F0F0EE; }
.hb a.pl-link:focus-visible { outline: 2px solid #2563EB; outline-offset: -2px; }
.pl-row { display: grid; grid-template-columns: 220px minmax(0, 360px) minmax(0, 1fr); gap: 48px; align-items: center; min-height: 320px; padding: 48px 0; }
.pl-item + .pl-item .pl-row { border-top: 1px solid var(--line); }
.pl-link:hover .pl-row, .pl-link:focus-visible .pl-row, .pl-item:hover + .pl-item .pl-row { border-top-color: transparent; }
.pl-desc { align-self: stretch; display: flex; flex-direction: column; justify-content: space-between; gap: 24px; }
.pl-desc p { margin: 0; max-width: 200px; font-size: 18px; line-height: 1.35; }
.pl-n { font-size: 16px; color: var(--mute); }
.pl-media { position: relative; aspect-ratio: 16 / 9; }
.pl-logo { position: absolute; left: 0; top: 50%; height: 44px; width: auto; max-width: 100%; transform: translateY(-50%);
  filter: grayscale(1) brightness(0); opacity: .1; transition: opacity .3s ease; }
.pl-logo.sq { height: 96px; filter: grayscale(1); opacity: .1; }
.pl-shot { position: absolute; inset: 0; overflow: hidden; background: #0F0F0F; opacity: 0; transform: scale(.94);
  transition: opacity .35s ease, transform .55s var(--ease); }
.pl-shot video, .pl-shot img { display: block; width: 100%; height: 100%; object-fit: cover; }
.pl-link:hover .pl-shot, .pl-link:focus-visible .pl-shot { opacity: 1; transform: none; }
.pl-link:hover .pl-logo, .pl-link:focus-visible .pl-logo { opacity: 0; }
.hb .pl-name { font-family: ${SERIF}; font-size: clamp(64px, 6.3vw, 120px); font-weight: 500; line-height: 1; letter-spacing: -0.03em; white-space: nowrap; }
@media (hover: none) {
  .pl-shot { opacity: 1; transform: none; }
  .pl-logo { display: none; }
}

@media (max-width: 1100px) {
  .pl-row { grid-template-columns: 180px minmax(0, 280px) minmax(0, 1fr); gap: 32px; }
}
@media (max-width: 900px) {
  .hb .hx-h1 { font-size: 40px; line-height: 48px; }
  .hb .qt-line { white-space: normal; }
  .hb .hx-ctas { flex-direction: column; width: 100%; max-width: 360px; }
  .hb .hx-btn.ghost, .hb .hx-btn.solid { width: 100%; }
  .pl-row { grid-template-columns: minmax(0, 1fr); gap: 20px; min-height: 0; padding: 40px 0; }
  .hb .pl-name { order: -1; font-size: 56px; white-space: normal; }
  .pl-desc p { max-width: none; }
  .pl-shot { opacity: 1; transform: none; }
  .pl-logo { display: none; }
}
`

// Splits a line into words that come in one after another (rox.com). Spaces stay as text so the line reads normally.
function Words({ text, start, step = 0.07 }: { text: string; start: number; step?: number }) {
  const ws = text.split(' ')
  return (
    <>
      {ws.map((w, i) => (
        <React.Fragment key={i}>
          <span className="w" style={{ '--wd': `${(start + i * step).toFixed(2)}s` } as React.CSSProperties}>{w}</span>
          {i < ws.length - 1 ? ' ' : null}
        </React.Fragment>
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
function HeroVideo() {
  const v = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const el = v.current; if (!el) return
    el.muted = true
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.pause(); return }
    el.play().catch(() => {})
  }, [])
  return (
    <video ref={v} className="hero-img hx-vid" src={HERO_VIDEO} poster={HERO_POSTER}
      autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
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

// Selected work row (v68, palantir.com "Our Software" style). Pointing at it shows the media and plays the video.
function ProjectRow({ p, i }: { p: Project; i: number }) {
  const vid = useRef<HTMLVideoElement>(null)
  const play = () => { const v = vid.current; if (v) { v.muted = true; v.play().catch(() => {}) } }
  const stop = () => { const v = vid.current; if (v) v.pause() }
  return (
    <li className="pl-item" data-reveal>
      <a className="pl-link" href={p.href} onMouseEnter={play} onMouseLeave={stop} onFocus={play} onBlur={stop}
        aria-label={`${p.title}: ${p.sub}`}>
        <div className="wrap pl-row">
          <div className="pl-desc">
            <p>{p.sub}</p>
            <span className="pl-n">/0.{i + 1}</span>
          </div>
          <div className="pl-media" aria-hidden="true">
            <img className={'pl-logo' + (p.logoSquare ? ' sq' : '')} src={p.logo} alt="" />
            <div className="pl-shot">
              {p.video
                ? <video ref={vid} src={p.video} poster={p.poster} muted loop playsInline preload="metadata" />
                : <img src={p.img} alt="" loading="lazy" />}
            </div>
          </div>
          <div className="pl-name">{p.title}</div>
        </div>
      </a>
    </li>
  )
}

export function Home() {
  const screenInit = useScreenInit() as { section?: string } | undefined
  const heroBg = useRef<HTMLDivElement>(null)
  useReveal()

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

  return (
    <div className="hb" id="top">
      <style>{CSS + PAGE_CSS}</style>
      <SiteHeaderB mode="overlay" />

      {/* ===== Hero ===== */}
      <section className="hero hx" aria-label="Intro">
        <div className="hero-bg" ref={heroBg}><HeroVideo /></div>
        <div className="hx-shade" aria-hidden="true" />
        <div className="hx-intro" aria-hidden="true" />
        <div className="hx-copy">
          <div className="hx-head">
            <QuoteTicker />
            <h1 className="hx-h1 serif">
              <span className="ln"><Words text={HERO_L1} start={l1Start} /></span>
              <span className="ln mute"><Words text={HERO_L2} start={l2Start} /></span>
            </h1>
          </div>
          <div className="hx-ctas">
            <a className="hx-btn ghost" href="#projects" style={{ '--wd': '0.7s' } as React.CSSProperties}>See all works</a>
            <a className="hx-btn solid" href={LINKS.cal} target="_blank" rel="noreferrer" style={{ '--wd': '0.8s' } as React.CSSProperties}>Say hello</a>
          </div>
        </div>
      </section>

      <main>
        {/* ===== Selected work (v68) ===== */}
        <section className="sec pl-sec" id="projects" aria-labelledby="pl-title">
          <div className="wrap">
            <h2 className="pl-title" id="pl-title" data-reveal>Selected work</h2>
          </div>
          <ul className="pl-list">
            {PROJECTS.map((p, i) => <ProjectRow p={p} i={i} key={p.title} />)}
          </ul>
        </section>

        {/* ===== Closing CTA (Figma 474:217) with the Kim LLM chat ===== */}
        <ClosingCTAB />
      </main>
    </div>
  )
}
