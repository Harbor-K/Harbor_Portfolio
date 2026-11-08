import React, { useEffect, useRef, useState } from 'react'
import { CSS, IMG, IMG3 } from './portfolio'
import { useScreenInit } from './useScreenInit.js'

// Harbor — portfolio main page v4, from Figma "44기 김지현 4차 PF" (node 260:282) and Harbor's review notes:
// hero → three projects, one per block (title, line, media), laid out like rox.com's "Applied AI research" section
// on white → CTA → footer, with an aurora voice assistant in the corner.
// Removed at Harbor's request: the designer-skills strip under the hero, the info rows + note box in each project block,
// and the separate Projects page (#/projects). The header's "Projects" is now Portfolio_1's dropdown (ProjectsMenu).

export const LINKS = {
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
  linkedin: 'https://www.linkedin.com/in/harborkim/',
  instagram: 'https://instagram.com/harbor_0328',
  email: 'mailto:harborkim0328@gmail.com',
}

// Only one quote is written so far; add up to five here and the hero rotates through them.
const QUOTES = ['“I started in Fine Art, drawing what I saw.”']
const QUOTE_MS = 5000

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
    title: 'UTrada', sub: 'Product design for a trading platform.',
    img: IMG3 + 'utrada-screens.webp', alt: 'UTrada website screens: home, features, forex table and join flow',
  },
]

export const BARS = 140
const SECTION_IDS: Record<string, string> = { work: 'projects', contact: 'contact' }

export const PAGE_CSS = `
.hb .foot { padding-bottom: 40px; }

.projects-sec { background: #fff; }
.proj + .proj { margin-top: 160px; }
.proj-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 40px; margin-bottom: 40px; }
.proj-head h3 { margin: 0; font-size: 44px; font-weight: 400; line-height: 1.15; letter-spacing: -0.02em; }
.proj-head h3 .sub { display: block; color: #8C8C8A; font-weight: 300; }
.proj-frame { border: 1px solid var(--line); }
.proj-media { display: block; padding: 0; overflow: hidden; }
.proj-media .shot { position: relative; aspect-ratio: 16 / 9; overflow: hidden; background: #E9E9E6; }
.proj-media video, .proj-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 1.2s var(--ease); }
.proj-media:hover video, .proj-media:hover img { transform: scale(1.03); }
.proj-media .view { position: absolute; left: 20px; bottom: 20px; padding: 10px 16px; background: #fff; color: var(--ink); font-size: 16px; font-weight: 500;
  opacity: 0; transform: translateY(8px); transition: opacity .3s, transform .3s var(--ease); }
.proj-media:hover .view { opacity: 1; transform: none; }

/* Projects dropdown in the header (from Portfolio_1's HomeDock) */
.hb .pj-menu { position: relative; display: flex; align-items: center; }
.hb .pj-trigger { display: flex; align-items: center; gap: 6px; padding: 0; background: none; border: 0; cursor: pointer; font-size: 16px; white-space: nowrap; opacity: .8; transition: opacity .2s; }
.hb .pj-trigger:hover, .hb .pj-trigger.on { opacity: 1; }
.hb .pj-panel { position: absolute; top: 100%; left: -12px; padding-top: 12px; width: min(560px, calc(100vw - 32px)); transform-origin: 0 0; }
.hb .pj-menu span { opacity: 1; }

/* Aurora voice assistant — ChatGPT-voice-style orb */
@property --rot { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.orb { position: relative; border-radius: 50%; overflow: hidden; isolation: isolate;
  background: radial-gradient(circle at 50% 120%, #1D4ED8 0%, #3B82F6 35%, #93C5FD 65%, #E0F2FE 100%); }
.orb::before, .orb::after { content: ""; position: absolute; inset: -25%; border-radius: 50%; filter: blur(14px); }
.orb::before { background: conic-gradient(from var(--rot), #E0F2FE, #60A5FA, #FFFFFF, #38BDF8, #BFDBFE, #2563EB, #E0F2FE); opacity: .85; animation: orb-spin 7s linear infinite; mix-blend-mode: soft-light; }
.orb::after { background: radial-gradient(circle at 35% 30%, rgba(255,255,255,.95), rgba(255,255,255,0) 45%), radial-gradient(circle at 70% 75%, rgba(147,197,253,.9), rgba(147,197,253,0) 50%);
  animation: orb-drift 5s ease-in-out infinite alternate; }
@keyframes orb-spin { to { --rot: 360deg; } }
@keyframes orb-drift { 0% { transform: translate(-6%, -4%) scale(1); } 100% { transform: translate(6%, 5%) scale(1.12); } }
.orb.live { animation: orb-pulse 1.1s ease-in-out infinite; }
.orb.talk { animation: orb-talk .5s ease-in-out infinite alternate; }
@keyframes orb-pulse { 50% { transform: scale(1.06); } }
@keyframes orb-talk { 0% { transform: scale(.97); } 100% { transform: scale(1.08); } }

.voice-fab { position: fixed; right: 24px; bottom: 24px; z-index: 60; width: 64px; height: 64px; padding: 0; border: 3px solid #fff; border-radius: 50%; cursor: pointer; background: none;
  box-shadow: 0 10px 30px rgba(37,99,235,.45), 0 0 0 1px rgba(0,0,0,.06); transform: scale(0); transition: transform .5s var(--ease); }
.voice-fab.show { transform: scale(1); }
.voice-fab:hover { transform: scale(1.08); }
.voice-fab .orb { display: block; width: 100%; height: 100%; }
.voice-pop { position: fixed; right: 24px; bottom: 104px; z-index: 60; width: 360px; padding: 28px 24px 24px; background: #fff; color: var(--ink); border: 1px solid var(--line);
  border-radius: 24px; box-shadow: 0 24px 60px rgba(0,0,0,.18); transform-origin: bottom right; text-align: center;
  transform: translateY(12px) scale(.96); opacity: 0; pointer-events: none; transition: transform .35s var(--ease), opacity .25s; }
.voice-pop.open { transform: none; opacity: 1; pointer-events: auto; }
.voice-pop .big { width: 150px; height: 150px; margin: 0 auto; }
.voice-status { margin-top: 18px; font-size: 16px; color: var(--mute); }
.voice-q { margin-top: 10px; font-size: 16px; font-weight: 500; min-height: 22px; }
.voice-a { margin-top: 8px; font-size: 16px; line-height: 1.5; color: #333; min-height: 48px; }
.voice-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 18px; }
.voice-chips button { padding: 8px 14px; border: 1px solid var(--line); border-radius: 999px; background: #fff; font-size: 16px; cursor: pointer; color: var(--ink); }
.voice-chips button:hover { background: var(--off); }
.voice-ctrl { display: flex; justify-content: center; gap: 12px; margin-top: 20px; }
.voice-ctrl button { width: 52px; height: 52px; border-radius: 50%; border: 0; cursor: pointer; display: grid; place-items: center; }
.voice-ctrl .mic { background: var(--ink); color: #fff; }
.voice-ctrl .mic.on { background: #2563EB; }
.voice-ctrl .end { background: var(--off); color: var(--ink); }
.voice-ctrl svg { width: 22px; height: 22px; display: block; }

@media (max-width: 900px) {
  .proj-head { flex-direction: column; align-items: flex-start; }
  .proj-head h3 { font-size: 32px; }
  .voice-pop { left: 16px; right: 16px; width: auto; }
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

// Voice assistant: scripted answers about Harbor (no AI backend). Uses the browser's speech
// recognition where available (Chrome/Edge/Safari) and speaks replies with speech synthesis.
const CHIPS = ['Who is Harbor?', 'Show me projects', 'Trust Bank', 'How to contact']
const ANSWERS: { k: RegExp; a: string }[] = [
  { k: /trust|bank|reward/i, a: 'Trust Bank Singapore was an eight-week project. Harbor led planning, UI design and usability tests, and the redesign scored 85 on ease of use.' },
  { k: /game|cove|dashboard/i, a: 'GameCove is an AI game-analytics dashboard Harbor designed as a team project.' },
  { k: /utrada|trading/i, a: 'At UTrada, Harbor worked on product design for a trading platform from 2024 to 2026.' },
  { k: /project|work|portfolio|case/i, a: 'Three featured projects: Trust Bank Singapore, GameCove and UTrada. Scroll to Selected work to see each one.' },
  { k: /contact|email|call|hire|book|reach/i, a: 'You can book a 30-minute call, or email harborkim0328@gmail.com.' },
  { k: /who|about|harbor|background|yourself/i, a: 'Harbor is a product designer with over three years in fintech and e-learning. She started in Fine Art, and now designs end to end, from research to UI.' },
]
const FALLBACK = 'I can tell you about Harbor, her projects, or how to get in touch.'
const answerFor = (q: string) => (ANSWERS.find(x => x.k.test(q))?.a ?? FALLBACK)

export function useVoice() {
  const [mode, setMode] = useState<'idle' | 'listening' | 'speaking'>('idle')
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const rec = useRef<any>(null)
  const SR = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null
  const canListen = !!SR

  const speak = (text: string) => {
    setA(text)
    const synth = window.speechSynthesis
    if (!synth) { setMode('idle'); return }
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'; u.rate = 1.02
    u.onstart = () => setMode('speaking')
    u.onend = () => setMode('idle')
    u.onerror = () => setMode('idle')
    synth.speak(u)
  }
  const ask = (text: string) => { rec.current?.abort?.(); setQ(text); speak(answerFor(text)) }
  const stop = () => { rec.current?.abort?.(); window.speechSynthesis?.cancel(); setMode('idle') }
  const listen = () => {
    if (!SR) return
    if (mode === 'listening') { rec.current?.stop(); return }
    window.speechSynthesis?.cancel()
    const r = new SR()
    r.lang = 'en-US'; r.interimResults = true; r.maxAlternatives = 1
    let finalText = ''
    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((x: any) => x[0].transcript).join('')
      setQ(t)
      if (e.results[e.results.length - 1].isFinal) finalText = t
    }
    r.onerror = (e: any) => { setMode('idle'); if (e.error === 'not-allowed') setA('Microphone access is blocked here. Pick a question below instead.') }
    r.onend = () => { if (finalText) speak(answerFor(finalText)); else setMode(m => (m === 'listening' ? 'idle' : m)) }
    rec.current = r
    setA('')
    setMode('listening')
    try { r.start() } catch { setMode('idle') }
  }
  useEffect(() => () => { rec.current?.abort?.(); window.speechSynthesis?.cancel() }, [])
  return { mode, q, a, canListen, ask, stop, listen }
}

/* ---------- Projects dropdown (copied from Portfolio_1's HomeDock) ---------- */
// Hovering "Projects" opens a dark panel. Left: the three case studies (name + one line). Right: the case's hero video,
// muted and looping; pointing at another case cross-fades to its video. Click a name or the video to open that case.
// UTrada has no video or case page here yet, so it shows its icon and links to the UTrada block on the main page.
// Closes on Esc, a click outside, scrolling, a route change, or moving the pointer away.

const RAW = 'https://raw.githubusercontent.com/Harbor-K/'
const UTRADA_SVG = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="4" fill="url(#ut)"/><path d="M20.8137 12L20.7642 12.2773L19.0159 22.2134C18.4395 25.4849 15.3129 28.1484 12.0457 28.1484C10.4635 28.1484 9.07577 27.5308 8.13822 26.4127C7.17956 25.2689 6.80943 23.747 7.09286 22.1315L8.87681 12H9.07354C9.73433 12 10.3156 12.2606 10.7074 12.7278C11.1081 13.2073 11.2626 13.841 11.1454 14.5153L9.79101 22.2134C9.63596 23.0871 9.83325 23.9046 10.344 24.5149C10.843 25.1118 11.5861 25.4382 12.4391 25.4382C14.2581 25.4382 15.9993 23.9564 16.3205 22.1315L17.6754 14.4329C17.9099 13.092 19.1943 12 20.5347 12H20.8137Z" fill="white"/><path d="M32.6067 12L32.131 14.7102H27.9095L25.5448 28.1484H22.8328L25.198 14.7102H20.9766L21.4551 12H32.6067Z" fill="white"/><defs><linearGradient id="ut" x1="40" y1="20" x2="0" y2="20" gradientUnits="userSpaceOnUse"><stop stop-color="#872ADF"/><stop offset="1" stop-color="#38029D"/></linearGradient></defs></svg>`
const UTRADA_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(UTRADA_SVG)}`
const WORK_LIST = [
  {
    name: 'Trust Bank',
    sub: 'Rewards UX revamp',
    href: '#/trust-bank',
    icon: '',
    video: `${RAW}harbor-pf/main/assets/trust-bank/hero-sfx-v2.mp4`,
    poster: `${RAW}harbor-pf/main/assets/trust-bank/hero-sfx-v2-poster.jpg`,
  },
  {
    name: 'GameCove',
    sub: 'AI analytics dashboard',
    href: '#/gamecove',
    icon: '',
    video: `${RAW}landing_page/main/gamecove/assets/v4/hero-ad.mp4`,
    poster: `${RAW}landing_page/main/gamecove/assets/v4/hero-ad-poster.jpg`,
  },
  { name: 'UTrada', sub: 'Trading platform design system', href: '#projects', icon: UTRADA_ICON, video: '', poster: '' },
]
const LIST_W = 200
const PREVIEW_W = 560 - LIST_W - 6 * 3 // 342
const EASE = 'cubic-bezier(.22,1,.36,1)'

/** the right-hand pane: each case's main video (muted, looping); only the shown one plays */
function ProjectPreview({ open, active }: { open: boolean; active: number }) {
  const vids = useRef<(HTMLVideoElement | null)[]>([])
  useEffect(() => {
    vids.current.forEach((v, i) => {
      if (!v) return
      if (open && i === active) { v.muted = true; v.play().catch(() => {}) } else v.pause()
    })
  }, [open, active])
  return (
    <a
      href={WORK_LIST[active].href}
      tabIndex={-1}
      aria-hidden
      className="relative block shrink-0 self-stretch overflow-hidden rounded-[10px]"
      style={{ width: PREVIEW_W, minHeight: 200, background: '#18181B' }}
    >
      {WORK_LIST.map((p, i) => {
        const on = i === active
        return (
          <div
            key={p.name}
            className="absolute inset-0"
            style={{
              opacity: on ? 1 : 0,
              transform: on ? 'scale(1)' : 'scale(1.04)',
              filter: on ? 'blur(0px)' : 'blur(6px)',
              transition: `opacity .45s ease, transform .6s ${EASE}, filter .45s ease`,
            }}
          >
            {p.video ? (
              <video
                ref={el => { vids.current[i] = el }}
                src={p.video}
                poster={p.poster}
                muted
                loop
                playsInline
                preload={i === 0 ? 'auto' : 'metadata'}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-[10px]">
                <img src={p.icon} alt="" className="h-12 w-12 rounded-[8px]" />
                <span className="text-[16px] font-bold text-white/70">{p.name}</span>
              </div>
            )}
          </div>
        )
      })}
    </a>
  )
}

function ProjectsMenu() {
  const [open, setOpen] = useState(false)
  const [everOpen, setEverOpen] = useState(false) // the videos load on the first open and stay
  const [hot, setHot] = useState(0) // which project the preview shows
  const ref = useRef<HTMLDivElement>(null)
  const closeTimer = useRef(0)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const close = () => setOpen(false)
    addEventListener('keydown', onKey)
    addEventListener('pointerdown', onDown)
    addEventListener('scroll', close, { passive: true })
    addEventListener('hashchange', close)
    return () => {
      removeEventListener('keydown', onKey)
      removeEventListener('pointerdown', onDown)
      removeEventListener('scroll', close)
      removeEventListener('hashchange', close)
    }
  }, [open])

  const openNow = () => { window.clearTimeout(closeTimer.current); setEverOpen(true); setOpen(true) }
  const closeSoon = () => { window.clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setOpen(false), 180) }

  return (
    <div ref={ref} className="pj-menu" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openNow())}
        onFocus={openNow}
        className={'pj-trigger' + (open ? ' on' : '')}
      >
        Projects
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: `transform .25s ${EASE}` }}>
          <path d="M3 5.25L7 9.25L11 5.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* the panel: its top padding bridges the hover gap under the trigger */}
      <div
        className="pj-panel"
        style={{
          transform: `translateY(${open ? 0 : -8}px) scale(${open ? 1 : 0.985})`,
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          pointerEvents: open ? 'auto' : 'none',
          transition: open
            ? `opacity .22s ease, transform .35s ${EASE}, visibility 0s`
            : `opacity .18s ease, transform .25s ${EASE}, visibility 0s .25s`,
        }}
      >
        <div
          className="flex gap-[6px] overflow-hidden rounded-[14px] p-[6px]"
          style={{ background: '#111113', boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 48px rgba(0,0,0,0.35)' }}
        >
          <ul role="menu" aria-label="Projects" className="flex shrink-0 flex-col gap-[2px]" style={{ width: LIST_W }}>
            {WORK_LIST.map((p, i) => {
              const on = hot === i
              return (
                <li key={p.name} role="none">
                  <a
                    role="menuitem"
                    href={p.href}
                    onMouseEnter={() => setHot(i)}
                    onFocus={() => setHot(i)}
                    onClick={() => setOpen(false)}
                    tabIndex={open ? 0 : -1}
                    className="block rounded-[8px] px-[12px] py-[10px] focus-visible:outline-none"
                    style={{
                      background: on ? 'rgba(255,255,255,0.07)' : 'transparent',
                      opacity: open ? 1 : 0,
                      transform: open ? 'none' : 'translateY(-4px)',
                      transition: `background-color .2s ease, opacity .3s ease ${open ? 0.05 + 0.04 * i : 0}s, transform .35s ${EASE} ${open ? 0.05 + 0.04 * i : 0}s`,
                    }}
                  >
                    <span className="block text-[16px] font-bold leading-[20px]" style={{ color: on ? '#FFFFFF' : 'rgba(255,255,255,0.86)', transition: 'color .2s ease' }}>
                      {p.name}
                    </span>
                    <span className="mt-[2px] block text-[16px] leading-[20px]" style={{ color: on ? '#A1A1AA' : '#71717A', transition: 'color .2s ease' }}>
                      {p.sub}
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
          {everOpen && <ProjectPreview open={open} active={hot} />}
        </div>
      </div>
    </div>
  )
}

export type NavKey = 'about' | undefined

// Shared site header. On the main page it starts transparent over the photo and turns light on scroll;
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
              <span>CV</span>
            </nav>
          </div>
          <div className="nav-right">
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a href={LINKS.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a className="btn-sm" href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a>
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

// Aurora voice assistant (fixed bottom-right), shared by every page.
export function VoiceAssistant() {
  const [fab, setFab] = useState(false)
  const [chat, setChat] = useState(false)
  const voice = useVoice()
  useEffect(() => { const c = window.setTimeout(() => setFab(true), 1200); return () => clearTimeout(c) }, [])
  useEffect(() => {
    if (!chat) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { setChat(false); voice.stop() } }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [chat])
  return (
    <>
      <div className={'voice-pop' + (chat ? ' open' : '')} role="dialog" aria-label="Ask about Harbor" aria-hidden={!chat}>
        <div className={'orb big' + (voice.mode === 'listening' ? ' live' : voice.mode === 'speaking' ? ' talk' : '')} aria-hidden="true" />
        <div className="voice-status" aria-live="polite">
          {voice.mode === 'listening' ? 'Listening…' : voice.mode === 'speaking' ? 'Speaking…' : voice.canListen ? 'Tap the mic and ask about Harbor' : 'Pick a question'}
        </div>
        <div className="voice-q">{voice.q}</div>
        <div className="voice-a">{voice.a}</div>
        <div className="voice-chips">
          {CHIPS.map(c => <button key={c} tabIndex={chat ? 0 : -1} onClick={() => voice.ask(c)}>{c}</button>)}
        </div>
        <div className="voice-ctrl">
          {voice.canListen && (
            <button className={'mic' + (voice.mode === 'listening' ? ' on' : '')} tabIndex={chat ? 0 : -1} aria-label={voice.mode === 'listening' ? 'Stop listening' : 'Start talking'} onClick={voice.listen}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" width="22" height="22"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
            </button>
          )}
          <button className="end" tabIndex={chat ? 0 : -1} aria-label="Close" onClick={() => { voice.stop(); setChat(false) }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2" strokeLinecap="round" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      </div>
      <button className={'voice-fab' + (fab ? ' show' : '')} aria-label={chat ? 'Close voice assistant' : 'Ask about Harbor'} aria-expanded={chat}
        onClick={() => { if (chat) voice.stop(); setChat(v => !v) }}>
        <span className={'orb' + (voice.mode !== 'idle' ? ' live' : '')} />
      </button>
    </>
  )
}

function ProjectBlock({ p }: { p: Project }) {
  const href = p.href ?? '#projects'
  return (
    <article className="proj" data-reveal>
      <div className="proj-head">
        <h3><span>{p.title}</span><span className="sub">{p.sub}</span></h3>
        <a className="link" href={href}>View project <span className="go">→</span></a>
      </div>
      <a className="proj-frame proj-media" href={href} aria-label={`View ${p.title}`}>
        <div className="shot" style={p.ratio ? { aspectRatio: p.ratio } : undefined}>
          {p.video
            ? <video src={p.video} poster={p.poster} autoPlay muted loop playsInline preload="metadata" aria-label={p.alt} />
            : <img src={p.img} alt={p.alt ?? ''} loading="lazy" />}
          <span className="view">View project →</span>
        </div>
      </a>
    </article>
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
        <div className="hero-bg" ref={heroBg}><div className="hero-img" style={{ backgroundImage: `url("${IMG3}hero.jpg")` }} /></div>
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
