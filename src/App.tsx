import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CSS, IMG, IMG3 } from './portfolio'
import { useScreenInit } from './useScreenInit.js'
import { KimButton, VoiceAssistant, KimChat } from './KimLLM'

// Harbor — portfolio main page v4, from Figma "44기 김지현 4차 PF" (node 260:282) and Harbor's review notes:
// hero → Selected work → closing section → footer, on warm white (#FBFAF9). The main page's container is 1440px wide (.hb.home).
// Removed at Harbor's request: the designer-skills strip under the hero, the info rows + note box in each project block,
// and the separate Projects page (#/projects).
// Header: left = Projects · About me; right = LinkedIn · CV · [✦ Kim LLM]. Book a call was taken out of the header at
// Harbor's request (it stays in the hero, the chat note and the footer).
// "Projects" opens a compact rox.com-style menu (Harbor's notes on the first version: about two-thirds the size, no dark
// media column on the left, no bottom links row, the video on the right at its own 16:9 ratio). Square and light, three
// columns: the project list | "At a glance" (the project's line and key facts) | the project's video or image at 16:9
// with "View project →" under it. Pointing at a project in the list switches the menu to it. While open the trigger gets
// a grey background and a dash instead of the chevron, like rox.
// Kim LLM (header button + panel + the inline chat card) lives in KimLLM.tsx and is shared with the other pages.
// Selected work, laid out like palantir.com's "Our Software" list (Harbor's reference): a single "Selected work" heading in
// the hero's type (Tektur Medium, same size as "Who is Harbor?"), then one full-width row per project — the project's
// line and its number (/0.1) on the left, a faint logo in the middle (all logos shown as the same faint dark silhouette,
// so the white GameCove logo shows too), the project name very large in Tektur Medium on the right. Pointing at a row
// (or focusing it) turns the row light grey and brings up the project's video or image where the logo was; the video
// plays only while pointed at. The whole row is the link. The list ends straight into the dark closing section (no white
// gap under the last row). The old solid "View project" cursor button was removed at Harbor's request. Touch screens (no
// hover) show the media straight away.
// Closing section (ClosingCTA, also on the About page): AirOps-style dark warm band (Harbor's reference) with the headline
// and line centred, then the inline Kim LLM chat card (KimChat in KimLLM.tsx — conversation in the card, shortcut icons,
// send button, and the note "Kim LLM answers only from what is on this site. Book a call for anything else.").
// Hero background: Harbor's 8-second typing video, muted and looping, at 50% opacity in front of a black (#000000)
// base, with the hero's dark gradient on top (Harbor's Figma layers: black background → video 50% → overlay gradient).
// Reduced motion: poster only.
// Hero copy, from Harbor's Figma "Hero 3" frame (node 424:6740): no quote line; "Who is Harbor?" and the typed
// "a product designer" in Tektur Medium (Google Fonts; 88px at 1920 wide, 110% line height, -3% letter spacing), both
// white; the two buttons 40px under the headline. Everything else stays Helvetica Neue.
// Footer (SiteFooter, also used by the About page): AirOps-style, styled in portfolio.ts — link columns, a big faint
// "harbor" wordmark, then the copyright line.

export { VoiceAssistant, useVoice } from './KimLLM'

export const LINKS = {
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
  linkedin: 'https://www.linkedin.com/in/harborkim/',
  instagram: 'https://instagram.com/harbor_0328',
  email: 'mailto:harborkim0328@gmail.com',
}

const HERO_LINE2 = 'a product designer'
const HERO_VIDEO = IMG3 + 'hero-typing.mp4'
const HERO_POSTER = IMG3 + 'hero-typing-poster.jpg'

export const TB = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/trust-bank/'
// GameCove 15s ad (same file as the GameCove case-study hero); plays muted on loop here.
const GC = 'https://raw.githubusercontent.com/Harbor-K/landing_page/main/gamecove/assets/v4/'
// UTrada mark (same as the UTrada case page)
const UTRADA_SVG = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="4" fill="#38029D"/><path d="M20.8137 12L20.7642 12.2773L19.0159 22.2134C18.4395 25.4849 15.3129 28.1484 12.0457 28.1484C10.4635 28.1484 9.07577 27.5308 8.13822 26.4127C7.17956 25.2689 6.80943 23.747 7.09286 22.1315L8.87681 12H9.07354C9.73433 12 10.3156 12.2606 10.7074 12.7278C11.1081 13.2073 11.2626 13.841 11.1454 14.5153L9.79101 22.2134C9.63596 23.0871 9.83325 23.9046 10.344 24.5149C10.843 25.1118 11.5861 25.4382 12.4391 25.4382C14.2581 25.4382 15.9993 23.9564 16.3205 22.1315L17.6754 14.4329C17.9099 13.092 19.1943 12 20.5347 12H20.8137Z" fill="white"/><path d="M32.6067 12L32.131 14.7102H27.9095L25.5448 28.1484H22.8328L25.198 14.7102H20.9766L21.4551 12H32.6067Z" fill="white"/></svg>`

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

export const BARS = 140
const SECTION_IDS: Record<string, string> = { work: 'projects', contact: 'contact' }

// Tektur Medium: the hero headline, the Selected work heading and the project names
const TEKTUR = '"Tektur", "Helvetica Neue", Helvetica, Arial, sans-serif'

export const PAGE_CSS = `
/* main page container: 1440px wide (Harbor's request) */
.hb.home { --wrap: min(1440px, calc(100vw - 64px)); }

/* hero: black base, the typing video on top of it at 50% (Harbor's Figma layers), the dark gradient above both */
.hb .hero, .hb .hero .hero-bg { background: #000000; }
.hb .hero-vid { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 40%; opacity: .5; }

/* hero headline (Harbor's Figma "Hero 3", node 424:6740): Tektur Medium, 110% line height, -3% tracking, both lines white */
.hb .hero .h1 .l1, .hb .hero .h1 .sub {
  font-family: ${TEKTUR} !important;
  font-weight: 500; line-height: 1.1; letter-spacing: -0.03em; color: #FFFFFF; }
.hb .hero .h1 .caret { background: #FFFFFF; }
.hb .hero .hero-ctas { margin-top: 40px; }

/* ---------- Selected work: palantir.com "Our Software"-style list ---------- */
.pl-sec { background: var(--paper); padding-bottom: 0; }
.pl-title { margin: 0 0 40px; font-family: ${TEKTUR} !important; font-size: clamp(56px, 4.6vw, 88px); font-weight: 500; line-height: 1.1; letter-spacing: -0.03em; color: var(--ink); }
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
/* faint logo: every logo becomes the same light silhouette (the GameCove logo is white, so it is darkened first) */
.pl-logo { position: absolute; left: 0; top: 50%; height: 44px; width: auto; max-width: 100%; transform: translateY(-50%);
  filter: grayscale(1) brightness(0); opacity: .1; transition: opacity .3s ease; }
.pl-logo.sq { height: 96px; filter: grayscale(1); opacity: .1; }
.pl-shot { position: absolute; inset: 0; overflow: hidden; background: #0F0F0F; opacity: 0; transform: scale(.94);
  transition: opacity .35s ease, transform .55s var(--ease); }
.pl-shot video, .pl-shot img { display: block; width: 100%; height: 100%; object-fit: cover; }
.pl-link:hover .pl-shot, .pl-link:focus-visible .pl-shot { opacity: 1; transform: none; }
.pl-link:hover .pl-logo, .pl-link:focus-visible .pl-logo { opacity: 0; }
.pl-name { font-family: ${TEKTUR} !important; font-size: clamp(64px, 6.3vw, 120px); font-weight: 500; line-height: 1; letter-spacing: -0.03em; white-space: nowrap; }
@media (hover: none) {
  .pl-shot { opacity: 1; transform: none; }
  .pl-logo { display: none; }
}

/* ---------- closing section: AirOps-style band with the inline Kim LLM chat card (KimLLM.tsx) ---------- */
.hb .cta-sec { background: #22211E; color: #FFFFFF; }
.hb .cta-sec .cta-inner { padding: 160px 0; text-align: center; }
.hb .cta-sec .h2 { margin: 0; font-size: clamp(44px, 3.6vw, 64px); font-weight: 300; line-height: 1.15; letter-spacing: -0.02em; }
.hb .cta-sec .sub-dark { margin: 20px auto 0; max-width: 560px; font-size: 18px; line-height: 1.5; color: rgba(255,255,255,.7); }

/* header: CV sits on the right with LinkedIn (no CV link yet, so it is plain text) */
.hb .nav-right .cv { opacity: .8; }

/* ---------- Projects menu (compact, rox.com style) ---------- */
.hb .pj-menu { position: relative; display: flex; align-items: center; }
.hb .pj-trigger { display: inline-flex; align-items: center; gap: 10px; padding: 6px 10px; margin: -6px -10px; background: transparent; border: 0; border-radius: 0;
  cursor: pointer; font-size: 16px; white-space: nowrap; opacity: .8; transition: opacity .2s, background-color .2s; }
.hb .pj-trigger:hover, .hb .pj-trigger.on { opacity: 1; }
.hb .pj-trigger.on { background: rgba(255,255,255,.16); }
.hb .site.scrolled .pj-trigger.on { background: rgba(15,15,15,.07); }
.hb .pj-trigger svg { display: block; width: 14px; height: 14px; }
.hb .pj-menu span { opacity: 1; }
.hb .pj-panel a, .hb .pj-panel span { opacity: 1; } /* the header's dimmed-link style doesn't apply inside the menu */

.hb .pj-panel { position: absolute; top: 100%; padding-top: 16px; z-index: 55; color: #0F0F0F;
  opacity: 0; visibility: hidden; transform: translateY(-6px); pointer-events: none;
  transition: opacity .18s ease, transform .25s cubic-bezier(.22,1,.36,1), visibility 0s .25s; }
.hb .pj-panel.open { opacity: 1; visibility: visible; transform: none; pointer-events: auto; transition: opacity .22s ease, transform .35s cubic-bezier(.22,1,.36,1), visibility 0s; }
.hb .pj-box { display: grid; grid-template-columns: 200px minmax(0, 1fr) 320px; min-height: 300px;
  background: #fff; border: 1px solid #DBDBD9; box-shadow: 0 24px 60px rgba(0,0,0,.10); }
.hb .pj-k { font-size: 16px; color: #8C8C8A; }

/* project list */
.hb .pj-cats { padding: 24px 0; }
.hb .pj-cats .pj-k { padding: 0 24px; margin-bottom: 12px; }
.hb .pj-cats ul { list-style: none; margin: 0; padding: 0; }
.hb .pj-cats a { display: block; padding: 10px 24px; font-size: 16px; color: #0F0F0F; text-decoration: none; transition: background-color .15s; }
.hb .pj-cats a.on { background: #F2F2EF; }
.hb .pj-cats a:focus-visible { outline: 2px solid #2563EB; outline-offset: -2px; }

/* at a glance + video (off-white) */
.hb .pj-feat { padding: 24px; background: #F5F5F2; }
.hb .pj-feat .about { margin: 12px 0 0; font-size: 18px; font-weight: 300; line-height: 1.35; letter-spacing: -0.01em; color: #0F0F0F; }
.hb .pj-feat ul { list-style: none; margin: 18px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.hb .pj-feat li { font-size: 16px; line-height: 1.4; color: #6B6B69; }
.hb .pj-feat li.lead { display: flex; gap: 8px; color: #0F0F0F; }
.hb .pj-feat li.lead::before { content: ""; flex: none; margin-top: 6px; border-left: 6px solid currentColor; border-top: 4px solid transparent; border-bottom: 4px solid transparent; height: 0; }

.hb .pj-vid { padding: 24px 24px 24px 0; background: #F5F5F2; display: flex; flex-direction: column; gap: 14px; }
.hb .pj-shot { position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; overflow: hidden; background: #0F0F0F; }
.hb .pj-shot .layer { position: absolute; inset: 0; transition: opacity .45s ease, transform .7s cubic-bezier(.22,1,.36,1); }
.hb .pj-shot .layer video, .hb .pj-shot .layer img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hb .pj-go { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; font-size: 16px; font-weight: 500; color: #0F0F0F; text-decoration: none; }
.hb .pj-go .go { transition: transform .25s var(--ease); }
.hb .pj-go:hover .go { transform: translateX(4px); }

@media (max-width: 1100px) {
  .pl-row { grid-template-columns: 180px minmax(0, 280px) minmax(0, 1fr); gap: 32px; }
}
@media (max-width: 900px) {
  .hb .nav-right .cv { display: none; }
  .pl-row { grid-template-columns: minmax(0, 1fr); gap: 20px; min-height: 0; padding: 40px 0; }
  .pl-name { order: -1; font-size: 56px; white-space: normal; }
  .pl-desc p { max-width: none; }
  .pl-shot { opacity: 1; transform: none; }
  .pl-logo { display: none; }
  .hb .cta-sec .cta-inner { padding: 120px 0; }
}
`

function useTyped(text: string, key: string | number, speed = 32, delay = 0) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(text.length); return }
    let i = 0, t: number
    const start = window.setTimeout(() => {
      t = window.setInterval(() => { i++; setN(i); if (i >= text.length) clearInterval(t) }, speed)
    }, delay)
    return () => { clearTimeout(start); clearInterval(t) }
  }, [text, key])
  return text.slice(0, n)
}

/* ---------- Projects menu ---------- */
// Facts come from the case-study pages already on the site (Trust Bank hero details, GameCove ad, UTrada skeleton).

const RAW = 'https://raw.githubusercontent.com/Harbor-K/'
const WORK_LIST = [
  {
    name: 'Trust Bank',
    href: '#/trust-bank',
    video: `${RAW}harbor-pf/main/assets/trust-bank/hero-sfx-v2.mp4`,
    poster: `${RAW}harbor-pf/main/assets/trust-bank/hero-sfx-v2-poster.jpg`,
    img: '',
    about: 'Turning hidden rewards into everyday loyalty.',
    facts: [
      { t: 'Rewards UX revamp', lead: true },
      { t: 'Digital banking, mobile app', lead: true },
      { t: '8 weeks, June – August 2026' },
      { t: 'I led planning, UI design and usability tests' },
    ],
  },
  {
    name: 'GameCove',
    href: '#/gamecove',
    video: `${RAW}landing_page/main/gamecove/assets/v4/hero-ad.mp4`,
    poster: `${RAW}landing_page/main/gamecove/assets/v4/hero-ad-poster.jpg`,
    img: '',
    about: 'An AI game-analytics dashboard.',
    facts: [
      { t: 'AI analytics dashboard', lead: true },
      { t: 'Team project', lead: true },
      { t: 'Overview, AI mapping, Retention' },
      { t: 'AI agent' },
    ],
  },
  {
    name: 'UTrada',
    href: '#/utrada',
    video: '',
    poster: '',
    img: IMG3 + 'utrada-screens.webp',
    about: 'Product design for a trading platform.',
    facts: [
      { t: 'Trading platform', lead: true },
      { t: 'Design system', lead: true },
      { t: '2024 – 2026' },
    ],
  },
]

const MENU_W = 800

function ProjectsMenu() {
  const [open, setOpen] = useState(false)
  const [everOpen, setEverOpen] = useState(false) // the videos load on the first open and stay
  const [hot, setHot] = useState(0) // which project the menu shows
  const [box, setBox] = useState({ left: 0, width: MENU_W })
  const ref = useRef<HTMLDivElement>(null)
  const vids = useRef<(HTMLVideoElement | null)[]>([])
  const closeTimer = useRef(0)

  // the panel starts at the header's left edge (under the logo), like rox; 800px wide, or less on narrow screens
  const place = () => {
    const m = ref.current, w = m?.closest('.nav') as HTMLElement | null
    if (!m || !w) return
    const mr = m.getBoundingClientRect(), wr = w.getBoundingClientRect()
    setBox({ left: Math.round(wr.left - mr.left), width: Math.round(Math.min(wr.width, MENU_W)) })
  }
  useLayoutEffect(() => { if (open) place() }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const close = () => setOpen(false)
    addEventListener('keydown', onKey)
    addEventListener('pointerdown', onDown)
    addEventListener('scroll', close, { passive: true })
    addEventListener('hashchange', close)
    addEventListener('resize', place)
    return () => {
      removeEventListener('keydown', onKey)
      removeEventListener('pointerdown', onDown)
      removeEventListener('scroll', close)
      removeEventListener('hashchange', close)
      removeEventListener('resize', place)
    }
  }, [open])

  // only the shown project's video plays
  useEffect(() => {
    vids.current.forEach((v, i) => {
      if (!v) return
      if (open && i === hot) { v.muted = true; v.play().catch(() => {}) } else v.pause()
    })
  }, [open, hot, everOpen])

  const openNow = () => { window.clearTimeout(closeTimer.current); setEverOpen(true); setOpen(true) }
  const closeSoon = () => { window.clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setOpen(false), 180) }
  const p = WORK_LIST[hot]

  return (
    <div ref={ref} className="pj-menu" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button type="button" aria-haspopup="true" aria-expanded={open} onClick={() => (open ? setOpen(false) : openNow())} onFocus={openNow}
        className={'pj-trigger' + (open ? ' on' : '')}>
        Projects
        {open
          ? <svg viewBox="0 0 14 14" fill="none" aria-hidden><path d="M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          : <svg viewBox="0 0 14 14" fill="none" aria-hidden><path d="M3 5.25L7 9.25L11 5.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </button>

      <div className={'pj-panel' + (open ? ' open' : '')} style={{ left: box.left, width: box.width }} aria-hidden={!open}>
        <div className="pj-box">
          {/* the list */}
          <div className="pj-cats">
            <div className="pj-k">Projects</div>
            <ul>
              {WORK_LIST.map((w, i) => (
                <li key={w.name}>
                  <a href={w.href} className={i === hot ? 'on' : undefined} tabIndex={open ? 0 : -1}
                    onMouseEnter={() => setHot(i)} onFocus={() => setHot(i)} onClick={() => setOpen(false)}>{w.name}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* at a glance */}
          <div className="pj-feat">
            <div className="pj-k">At a glance</div>
            <p className="about">{p.about}</p>
            <ul>
              {p.facts.map(f => <li key={f.t} className={f.lead ? 'lead' : undefined}>{f.t}</li>)}
            </ul>
          </div>

          {/* the project's video / image at 16:9, and the link */}
          <div className="pj-vid">
            <a className="pj-shot" href={p.href} tabIndex={-1} aria-hidden="true" onClick={() => setOpen(false)}>
              {everOpen && WORK_LIST.map((w, i) => (
                <div key={w.name} className="layer" style={{ opacity: i === hot ? 1 : 0, transform: i === hot ? 'scale(1)' : 'scale(1.04)' }}>
                  {w.video
                    ? <video ref={el => { vids.current[i] = el }} src={w.video} poster={w.poster} muted loop playsInline preload={i === 0 ? 'auto' : 'metadata'} />
                    : <img src={w.img} alt="" />}
                </div>
              ))}
            </a>
            <a className="pj-go" href={p.href} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>View project <span className="go">→</span></a>
          </div>
        </div>
      </div>
    </div>
  )
}

export type NavKey = 'about' | undefined

// Shared site header. On the main page it starts transparent over the hero and turns light on scroll;
// on the About page it is always light (`solid`).
export function SiteHeader({ current, solid = false }: { current?: NavKey; solid?: boolean }) {
  const [scrolled, setScrolled] = useState(solid)
  useEffect(() => {
    if (solid) return
    const on = () => setScrolled(scrollY > 40)
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [solid])
  return (
    <header className={'site' + (scrolled || solid ? ' scrolled' : '')}>
      <div className="bar">
        <div className="nav wrap">
          <div className="nav-left">
            <a className="logo" href="#top">harbor</a>
            <nav className="nav-links" aria-label="Main">
              <ProjectsMenu />
              <a href="#/about" className={current === 'about' ? 'current' : undefined} aria-current={current === 'about' ? 'page' : undefined}>About me</a>
            </nav>
          </div>
          <div className="nav-right">
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <span className="cv">CV</span>
            <KimButton />
          </div>
        </div>
      </div>
    </header>
  )
}

// AirOps-style closing section: headline, line, and the inline Kim LLM chat card (KimChat).
export function ClosingCTA() {
  return (
    <section className="cta-sec" id="contact" aria-label="Contact">
      <div className="wrap cta-inner" data-reveal>
        <h2 className="h2">Let’s connect the dots together.</h2>
        <p className="sub-dark">Open to product design roles. A 30-minute call is the quickest way to start.</p>
        <KimChat />
      </div>
    </section>
  )
}

// AirOps-style footer (styles in portfolio.ts): columns → big faint wordmark → copyright.
export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <div className="brand">
            <div className="logo">harbor</div>
            <a href={LINKS.email}>harborkim0328@gmail.com</a>
          </div>
          <div className="foot-cols">
            <div className="foot-col"><div className="h">Explore</div><a href="#top">Home</a><a href="#projects">Projects</a><a href="#/about">About me</a><span>CV</span></div>
            <div className="foot-col"><div className="h">Contact</div><a href={LINKS.email}>Email</a><a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={LINKS.instagram} target="_blank" rel="noreferrer">Instagram</a><a href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a></div>
          </div>
        </div>
        <div className="foot-bottom"><span>© 2026 Harbor Kim. All rights reserved.</span><span>Designed in Figma by Harbor</span></div>
      </div>
      <div className="wordmark" aria-hidden="true">harbor</div>
    </footer>
  )
}

// Scroll reveals for anything marked data-reveal. Pass a key that changes when the content changes.
export function useReveal(dep?: unknown) {
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

// One project = one full-width row (palantir.com "Our Software" style). Pointing at it shows the media and plays the video.
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

/** the hero's background video: muted, looping, plays inline; reduced motion keeps the poster still */
function HeroVideo() {
  const v = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const el = v.current; if (!el) return
    el.muted = true
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.pause(); return }
    el.play().catch(() => {})
  }, [])
  return (
    <video ref={v} className="hero-img hero-vid" src={HERO_VIDEO} poster={HERO_POSTER}
      autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
  )
}

export function App() {
  const screenInit = useScreenInit() as { section?: string } | undefined
  const heroBg = useRef<HTMLDivElement>(null)

  const line2 = useTyped(HERO_LINE2, 'hero', 45, 700)
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

  return (
    <div className="hb home" id="top">
      <style>{CSS + PAGE_CSS}</style>
      {/* Tektur Medium: hero headline, Selected work heading and project names */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tektur:wght@500&display=swap" />
      <SiteHeader />

      {/* ===== Hero ===== */}
      <section className="hero" aria-label="Intro">
        <div className="hero-bg" ref={heroBg}><HeroVideo /></div>
        <div className="hero-copy">
          <h1 className="h1">
            <span className="l1">Who is Harbor?</span>
            <span className="sub" aria-label={HERO_LINE2}>{line2}<i className="caret" aria-hidden="true" /></span>
          </h1>
          <div className="ctas hero-ctas">
            <a className="btn btn-ghost" href="#projects">See my work</a>
            <a className="btn btn-light" href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a>
          </div>
        </div>
      </section>

      <main>
        {/* ===== Selected work — palantir.com "Our Software"-style list ===== */}
        <section className="sec pl-sec" id="projects" aria-labelledby="pl-title">
          <div className="wrap">
            <h2 className="pl-title" id="pl-title" data-reveal>Selected work</h2>
          </div>
          <ul className="pl-list">
            {PROJECTS.map((p, i) => <ProjectRow p={p} i={i} key={p.title} />)}
          </ul>
        </section>

        <ClosingCTA />
      </main>

      <SiteFooter />
      <VoiceAssistant />
    </div>
  )
}
