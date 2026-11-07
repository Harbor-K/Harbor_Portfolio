import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CSS, IMG, IMG3 } from './portfolio'
import { useScreenInit } from './useScreenInit.js'
import { KimButton, VoiceAssistant } from './KimLLM'

// Harbor — portfolio main page v4, from Figma "44기 김지현 4차 PF" (node 260:282) and Harbor's review notes:
// hero → three projects, one per block (title, line, media), laid out like rox.com's "Applied AI research" section
// on white → CTA → footer.
// Removed at Harbor's request: the designer-skills strip under the hero, the info rows + note box in each project block,
// and the separate Projects page (#/projects).
// Header: left = Projects · About me; right = LinkedIn · CV · [✦ Kim LLM]. Book a call was taken out of the header at
// Harbor's request (it stays in the hero, the closing CTA and the footer).
// "Projects" opens a mega menu in rox.com's style (Harbor's reference; the old dark rounded dropdown didn't match the site):
// square, light, full container width, three columns — a dark media panel with the project's video/image, its name and a
// "View project" button | the project list (pointing at one switches the menu to it) | an off-white "At a glance" column
// with the project's line and key facts — and a bottom row of links. The trigger gets a grey background and a dash
// instead of the chevron while open, like rox.
// Kim LLM (header button + panel) lives in KimLLM.tsx and is shared with the About and case-study pages.
// Project blocks: each whole block (title + image) is one link; pointing anywhere on it turns the cursor into a solid
// square "View project" button (cursor.tsx, data-cursor + data-cursor-variant="button").
// Hero background: Harbor's 8-second typing video, muted and looping. Reduced motion: poster only.

export { VoiceAssistant, useVoice } from './KimLLM'

export const LINKS = {
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
  linkedin: 'https://www.linkedin.com/in/harborkim/',
  instagram: 'https://instagram.com/harbor_0328',
  email: 'mailto:harborkim0328@gmail.com',
}

// Only one quote is written so far; add up to five here and the hero rotates through them.
const QUOTES = ['“I started in Fine Art, drawing what I saw.”']
const QUOTE_MS = 5000

const HERO_VIDEO = IMG3 + 'hero-typing.mp4'
const HERO_POSTER = IMG3 + 'hero-typing-poster.jpg'

export const TB = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/trust-bank/'
// GameCove 15s ad (same file as the GameCove case-study hero); plays muted on loop here.
const GC = 'https://raw.githubusercontent.com/Harbor-K/landing_page/main/gamecove/assets/v4/'

type Project = {
  title: string; sub: string; href?: string
  video?: string; poster?: string; img?: string; alt?: string; ratio?: string
}
const PROJECTS: Project[] = [
  {
    title: 'Trust Bank Singapore', sub: 'Turning hidden rewards into everyday loyalty.', href: '#/trust-bank',
    img: IMG3 + 'trust-bank-thumb.webp', alt: 'Trust Bank rewards screen in front of the trust wordmark', ratio: '2 / 1',
  },
  {
    title: 'GameCove', sub: 'An AI game-analytics dashboard.', href: '#/gamecove',
    video: GC + 'hero-ad.mp4', poster: GC + 'hero-ad-poster.jpg', alt: 'GameCove ad: Overview, AI mapping, Retention and the AI agent', ratio: '2 / 1',
  },
  {
    title: 'UTrada', sub: 'Product design for a trading platform.', href: '#/utrada',
    img: IMG3 + 'utrada-screens.webp', alt: 'UTrada website screens: home, features, forex table and join flow',
  },
]

export const BARS = 140
const SECTION_IDS: Record<string, string> = { work: 'projects', contact: 'contact' }

export const PAGE_CSS = `
.hb .foot { padding-bottom: 40px; }

/* hero background video (fills the hero like the photo did) */
.hb .hero-vid { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 40%; }

.projects-sec { background: #fff; }
.proj + .proj { margin-top: 160px; }
.hb a.proj { display: block; color: inherit; text-decoration: none; }
.hb a.proj:focus-visible { outline: 2px solid #2563EB; outline-offset: 8px; }
.proj-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 40px; margin-bottom: 40px; }
.proj-head h3 { margin: 0; font-size: 44px; font-weight: 400; line-height: 1.15; letter-spacing: -0.02em; }
.proj-head h3 .sub { display: block; color: #8C8C8A; font-weight: 300; }
.proj-frame { border: 1px solid var(--line); }
.proj-media { display: block; padding: 0; overflow: hidden; }
.proj-media .shot { position: relative; aspect-ratio: 16 / 9; overflow: hidden; background: #E9E9E6; }
.proj-media video, .proj-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 1.2s var(--ease); }
.proj:hover .proj-media video, .proj:hover .proj-media img { transform: scale(1.03); }

/* header: CV sits on the right with LinkedIn (no CV link yet, so it is plain text) */
.hb .nav-right .cv { opacity: .8; }

/* ---------- Projects mega menu (rox.com style) ---------- */
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
.hb .pj-box { display: grid; grid-template-columns: 260px 280px minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; min-height: 500px;
  background: #fff; border: 1px solid #DBDBD9; box-shadow: 0 24px 60px rgba(0,0,0,.10); }

/* left: dark media panel */
.hb .pj-media { grid-row: 1 / span 2; position: relative; display: flex; flex-direction: column; justify-content: space-between; padding: 32px; overflow: hidden;
  background: #0F0F0F; color: #fff; text-decoration: none; }
.hb .pj-media .layer { position: absolute; inset: 0; transition: opacity .45s ease, transform .7s cubic-bezier(.22,1,.36,1); }
.hb .pj-media .layer video, .hb .pj-media .layer img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hb .pj-media::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(0,0,0,.62) 0%, rgba(0,0,0,.18) 45%, rgba(0,0,0,.65) 100%); }
.hb .pj-media .ttl { position: relative; z-index: 1; font-size: 32px; font-weight: 300; line-height: 1.12; letter-spacing: -0.02em; }
.hb .pj-media .ttl small { display: block; margin-top: 10px; font-size: 16px; font-weight: 400; letter-spacing: 0; color: rgba(255,255,255,.75); }
.hb .pj-media .cta { position: relative; z-index: 1; align-self: flex-start; padding: 12px 20px; background: #fff; color: #0F0F0F; font-size: 16px; font-weight: 500; transition: background-color .2s; }
.hb .pj-media:hover .cta { background: #EDEDEB; }

/* middle: project list */
.hb .pj-cats { padding: 32px 0 24px; }
.hb .pj-k { font-size: 16px; color: #8C8C8A; }
.hb .pj-cats .pj-k { padding: 0 32px; margin-bottom: 16px; }
.hb .pj-cats ul { list-style: none; margin: 0; padding: 0; }
.hb .pj-cats a { display: block; padding: 12px 32px; font-size: 16px; color: #0F0F0F; text-decoration: none; transition: background-color .15s; }
.hb .pj-cats a.on { background: #F2F2EF; }
.hb .pj-cats a:focus-visible { outline: 2px solid #2563EB; outline-offset: -2px; }

/* right: at a glance (off-white) */
.hb .pj-feat { padding: 32px; background: #F5F5F2; }
.hb .pj-feat .about { margin: 16px 0 0; font-size: 20px; font-weight: 300; line-height: 1.35; letter-spacing: -0.01em; color: #0F0F0F; }
.hb .pj-feat ul { list-style: none; margin: 24px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 24px; }
.hb .pj-feat li { font-size: 16px; line-height: 1.4; color: #6B6B69; }
.hb .pj-feat li.lead { display: flex; gap: 8px; color: #0F0F0F; }
.hb .pj-feat li.lead::before { content: ""; flex: none; margin-top: 6px; border-left: 6px solid currentColor; border-top: 4px solid transparent; border-bottom: 4px solid transparent; height: 0; }

/* bottom row */
.hb .pj-foot { grid-column: 2 / span 2; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 24px; padding: 22px 32px; border-top: 1px solid #E6E6E3; }
.hb .pj-foot a { display: inline-flex; align-items: center; gap: 4px; font-size: 16px; color: #0F0F0F; text-decoration: none; }
.hb .pj-foot a:hover { text-decoration: underline; text-underline-offset: 4px; }
.hb .pj-foot svg { width: 12px; height: 12px; }

@media (max-width: 900px) {
  .hb .nav-right .cv { display: none; }
  .proj-head { flex-direction: column; align-items: flex-start; }
  .proj-head h3 { font-size: 32px; }
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

/* ---------- Projects mega menu ---------- */
// Facts come from the case-study pages already on the site (Trust Bank hero details, GameCove ad, UTrada skeleton).

const RAW = 'https://raw.githubusercontent.com/Harbor-K/'
const WORK_LIST = [
  {
    name: 'Trust Bank',
    sub: 'Rewards UX revamp',
    href: '#/trust-bank',
    video: `${RAW}harbor-pf/main/assets/trust-bank/hero-sfx-v2.mp4`,
    poster: `${RAW}harbor-pf/main/assets/trust-bank/hero-sfx-v2-poster.jpg`,
    img: '',
    about: 'Turning hidden rewards into everyday loyalty.',
    facts: [
      { t: 'Rewards UX revamp', lead: true },
      { t: 'Digital banking, mobile app', lead: true },
      { t: '8 weeks, June – August 2026' },
      { t: '2 designers' },
      { t: 'I led planning, UI design and usability tests' },
      { t: 'Singapore' },
    ],
  },
  {
    name: 'GameCove',
    sub: 'AI analytics dashboard',
    href: '#/gamecove',
    video: `${RAW}landing_page/main/gamecove/assets/v4/hero-ad.mp4`,
    poster: `${RAW}landing_page/main/gamecove/assets/v4/hero-ad-poster.jpg`,
    img: '',
    about: 'An AI game-analytics dashboard.',
    facts: [
      { t: 'AI analytics dashboard', lead: true },
      { t: 'Team project', lead: true },
      { t: 'Overview' },
      { t: 'AI mapping' },
      { t: 'Retention' },
      { t: 'AI agent' },
    ],
  },
  {
    name: 'UTrada',
    sub: 'Trading platform design system',
    href: '#/utrada',
    video: '',
    poster: '',
    img: IMG3 + 'utrada-screens.webp',
    about: 'Product design for a trading platform.',
    facts: [
      { t: 'Trading platform', lead: true },
      { t: 'Design system', lead: true },
      { t: '2024 – 2026' },
      { t: 'Website: home, features, forex table, join flow' },
    ],
  },
]

const ArrowUpRight = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 9l6-6M4 3h5v5" /></svg>
)

function ProjectsMenu() {
  const [open, setOpen] = useState(false)
  const [everOpen, setEverOpen] = useState(false) // the videos load on the first open and stay
  const [hot, setHot] = useState(0) // which project the menu shows
  const [box, setBox] = useState({ left: 0, width: 960 })
  const ref = useRef<HTMLDivElement>(null)
  const vids = useRef<(HTMLVideoElement | null)[]>([])
  const closeTimer = useRef(0)

  // the panel spans the header's container (from the logo to the right edge), like rox
  const place = () => {
    const m = ref.current, w = m?.closest('.nav') as HTMLElement | null
    if (!m || !w) return
    const mr = m.getBoundingClientRect(), wr = w.getBoundingClientRect()
    setBox({ left: Math.round(wr.left - mr.left), width: Math.round(Math.min(wr.width, 1180)) })
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
          {/* left: the project's video / image, name and button */}
          <a className="pj-media" href={p.href} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} aria-label={`View project: ${p.name}`}>
            {everOpen && WORK_LIST.map((w, i) => (
              <div key={w.name} className="layer" style={{ opacity: i === hot ? 1 : 0, transform: i === hot ? 'scale(1)' : 'scale(1.04)' }} aria-hidden="true">
                {w.video
                  ? <video ref={el => { vids.current[i] = el }} src={w.video} poster={w.poster} muted loop playsInline preload={i === 0 ? 'auto' : 'metadata'} />
                  : <img src={w.img} alt="" />}
              </div>
            ))}
            <span className="ttl">{p.name}<small>{p.sub}</small></span>
            <span className="cta">View project</span>
          </a>

          {/* middle: the list */}
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

          {/* right: at a glance */}
          <div className="pj-feat">
            <div className="pj-k">At a glance</div>
            <p className="about">{p.about}</p>
            <ul>
              {p.facts.map(f => <li key={f.t} className={f.lead ? 'lead' : undefined}>{f.t}</li>)}
            </ul>
          </div>

          {/* bottom row */}
          <div className="pj-foot">
            <span className="pj-k">More:</span>
            <a href="#/about" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>About me</a>
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>LinkedIn <ArrowUpRight /></a>
            <a href={LINKS.cal} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>Book a call <ArrowUpRight /></a>
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

export function ClosingCTA() {
  return (
    <section className="cta-sec" id="contact" aria-label="Contact">
      <div className="cta-frame">
        <div className="cta-inner" data-reveal>
          <h2 className="h2 h2-xl">Let’s connect the dots together.</h2>
          <p className="sub-dark">Open to product design roles. A 30-minute call is the quickest way to start.</p>
          <div className="ctas">
            <a className="btn btn-ghost" href="#projects">See my work</a>
            <a className="btn btn-light" href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a>
          </div>
        </div>
        <div className="bars" data-reveal aria-hidden="true">
          {Array.from({ length: BARS }, (_, i) => {
            const h = Math.pow((i + 1) / BARS, 2.6)
            return <i key={i} style={{ '--h': h.toFixed(3), '--i': i } as React.CSSProperties} />
          })}
        </div>
      </div>
    </section>
  )
}

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

// One project = one link. Pointing anywhere on it turns the cursor into a solid "View project" button
// (black over the white title area, white over the image).
function ProjectBlock({ p }: { p: Project }) {
  const href = p.href ?? '#projects'
  return (
    <a className="proj" href={href} data-reveal data-cursor="View project" data-cursor-variant="button" aria-label={`View project: ${p.title}, ${p.sub}`}>
      <div className="proj-head">
        <h3><span>{p.title}</span><span className="sub">{p.sub}</span></h3>
      </div>
      <div className="proj-frame proj-media" data-cursor-light>
        <div className="shot" style={p.ratio ? { aspectRatio: p.ratio } : undefined}>
          {p.video
            ? <video src={p.video} poster={p.poster} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
            : <img src={p.img} alt="" loading="lazy" />}
        </div>
      </div>
    </a>
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
  const [q, setQ] = useState(0)
  const heroBg = useRef<HTMLDivElement>(null)

  const line2 = useTyped('a product designer, end to end', 'hero', 45, 700)
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

  // Hero quote rotation.
  useEffect(() => {
    if (QUOTES.length < 2) return
    const a = window.setInterval(() => setQ(v => (v + 1) % QUOTES.length), QUOTE_MS)
    return () => clearInterval(a)
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
    <div className="hb" id="top">
      <style>{CSS + PAGE_CSS}</style>
      <SiteHeader />

      {/* ===== Hero ===== */}
      <section className="hero" aria-label="Intro">
        <div className="hero-bg" ref={heroBg}><HeroVideo /></div>
        <div className="hero-copy">
          <p className="quote" key={q}>{QUOTES[q]}</p>
          <h1 className="h1">
            <span className="l1">Who is Harbor?</span>
            <span className="sub" aria-label="a product designer, end to end">{line2}<i className="caret" aria-hidden="true" /></span>
          </h1>
          <div className="ctas hero-ctas">
            <a className="btn btn-ghost" href="#projects">See my work</a>
            <a className="btn btn-light" href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a>
          </div>
        </div>
      </section>

      <main>
        {/* ===== Selected work — one project per block ===== */}
        <section className="sec projects-sec" id="projects" aria-label="Selected work">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <div>
                <div className="eyebrow">(01) Selected work</div>
                <h2 className="h2">Projects, end to end</h2>
              </div>
            </div>
            {PROJECTS.map(p => <ProjectBlock p={p} key={p.title} />)}
          </div>
        </section>

        <ClosingCTA />
      </main>

      <SiteFooter />
      <VoiceAssistant />
    </div>
  )
}
