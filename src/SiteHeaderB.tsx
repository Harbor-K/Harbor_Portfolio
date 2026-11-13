import React, { useEffect, useRef, useState } from 'react'
import { HEADER_LOGO_SVG } from './harborLogo'
import { GIFS, GIF_MS, useGifSrc } from './gifPlay'

// The site header, shared by every page (main, About, Trust Bank, GameCove, UTrada, ETO Markets).
//
// Layout (Figma main frame 530:5259, header.hdrb): 1440 container, 64px tall, three columns — Harbor logo (78×19) |
// Projects ▾ (96×24, 8px side padding) · 40px · About me | LinkedIn ↗ (8px to the arrow) · 32px · Resume (40px, 16px
// side padding). 16/24. v108 (Harbor): Resume opens her CV in a new tab — v114: the PDF on Google Drive.
//
// Projects menu (Harbor's Figma "Main · Projects menu open" 538:9995; with ETO Markets 776:92): one compact panel,
// 652×360, centred under the Projects trigger, 8px below the header —
//   [ project card 320×360 | project list 330 ]
// - Card: the project's picture filling it; 32px padding; at the top the project name (32/38, -2%) with its
//   one-line description 8px under it (16/24, 75%); at the bottom "View project" (44px).
//   Background: Trust Bank and GameCove play Harbor's 320×360 GIFs, which carry their own dark edges for the text, so no
//   extra shade goes on them; each starts from its first frame when its project comes up. UTrada's screens keep the
//   dark gradient. ETO Markets (v117) shows its red logo picture with no shade, as in Figma 776:92.
// - List: 32px top / 16px sides; "Projects" label (16/24, 60%), 12px, then the four projects as 44px rows (12px
//   side padding). Label and project names share one left edge (28px in), and the label's top lines up with the card's
//   project name (32px down), so the panel reads as two groups: the shown project, and the choice of project.
// - Interactions: opens on hover / click / focus and moves through the projects by itself while open (pointing at the
//   list holds it). v94: a GIF project stays up for its whole GIF (5.3s) before the next one, so its story plays to the
//   end; a still stays 2.8s. Pointing at a project shows it in the card, Esc / click outside / page change closes it.
//   The card's pictures load on the first open.
//
// Phones and small tablets (≤ 900px, v119 — Harbor: "responsive, good enough on mobile"): Projects, About me and
// LinkedIn don't fit the bar, so they move into a menu. The bar keeps the logo, Resume and a 40×40 Menu button
// (two lines that turn into an ×). The menu covers the page under the bar in #0F0F0F (the bar turns the same black
// with light text while it is open): "Projects" label, the four projects (28/36, each with its one-line description
// 16/24 at 60%), a line, then About me and LinkedIn ↗ (28/36) — 32px side padding on the 8-grid, 16px under the
// label, 24px between projects. Rows rise in one after another (40ms apart). A link, Esc, or a page change closes it;
// the page under it doesn't scroll while it is open. Reduced motion: no rise.
//
// mode — how the header sits on the page under it:
// - 'overlay' (main page): transparent with light text over the dark hero; the light bar with ink text once scrolled.
// - 'light' (About, Trust Bank, UTrada, ETO Markets): ink text on the white page; the light bar once scrolled.
// - 'dark' (GameCove): light text on the dark page; a dark bar once scrolled.
// hidden: the case studies' full-screen intro (the header stays out of the way until it ends).
// away: the case studies' headroom — slides up while scrolling down, back when scrolling up (not while the menu is open).
// The bar's blur sits on a ::before layer so the Projects panel's own glass blur still reaches the page (a blurred
// parent would stop it).

export type HeaderMode = 'overlay' | 'light' | 'dark'

const LINKS = {
  linkedin: 'https://www.linkedin.com/in/harborkim/',
  resume: 'https://drive.google.com/file/d/1HVj_RZWRWKovvyIbYKPlQfGkQrecxC1B/view?usp=sharing',
}
const IMG3 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/main-v3/'
const ETO = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/'

function ArrowUpRight() {
  return (
    <svg className="ico-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 11L11 5M11 10V5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif'
const SERIF = '"Newsreader", Georgia, "Times New Roman", serif'

const HDR_CSS = `
.hdrb { --hd-fg: #FAFAFA; --hd-dim: rgba(250,250,250,.8); --hd-cta-bg: #FAFAFA; --hd-cta-fg: #0F0F0F; --hd-cta-hover: #E7E5E4;
  --hd-pill: rgba(250,250,250,.12); --hd-bar: rgba(245,245,242,.88); --hd-line: #DBDBD9;
  position: fixed; inset: 0 0 auto 0; z-index: 50; color: var(--hd-fg); font-family: ${SANS};
  transition: transform .45s cubic-bezier(.22,1,.36,1), opacity .3s ease, visibility 0s; }
/* ink text: light pages, and the main page once it scrolls onto light content */
.hdrb.m-light, .hdrb.m-overlay.is-scrolled { --hd-fg: #0C0A09; --hd-dim: rgba(12,10,9,.75); --hd-cta-bg: #0C0A09; --hd-cta-fg: #FAFAFA; --hd-cta-hover: #2A2725;
  --hd-pill: rgba(12,10,9,.06); }
/* dark page (GameCove): light text, dark bar */
.hdrb.m-dark { --hd-bar: rgba(17,17,20,.86); --hd-line: #2A2D31; }
/* mobile menu open: the bar joins the black sheet under it */
.hdrb.is-menu { --hd-fg: #FAFAFA; --hd-dim: rgba(250,250,250,.8); --hd-cta-bg: #FAFAFA; --hd-cta-fg: #0F0F0F; --hd-cta-hover: #E7E5E4;
  --hd-bar: #0F0F0F; --hd-line: rgba(250,250,250,.12); }
.hdrb.is-away { transform: translateY(calc(-100% - 4px)); }
.hdrb.is-hidden { transform: translateY(calc(-100% - 4px)); opacity: 0; visibility: hidden; pointer-events: none;
  transition: transform .45s cubic-bezier(.22,1,.36,1), opacity .3s ease, visibility 0s .45s; }

.hdrb .hdrb-bar { position: relative; }
.hdrb .hdrb-bar::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: 0; transition: opacity .35s ease, background-color .3s ease;
  background: var(--hd-bar); -webkit-backdrop-filter: blur(7px); backdrop-filter: blur(7px); border-bottom: 1px solid var(--hd-line); }
.hdrb.is-scrolled .hdrb-bar::before, .hdrb.is-menu .hdrb-bar::before { opacity: 1; }

.hdrb .hd { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 24px;
  width: min(1440px, calc(100vw - 64px)); height: 64px; margin: 0 auto; }
.hdrb .hd-logo { display: inline-flex; align-items: center; justify-self: start; color: var(--hd-fg); transition: color .35s ease; }
.hdrb .hd-logo svg { display: block; width: 78px; height: 19px; }
.hdrb .hd-logo:focus-visible { outline: 2px solid currentColor; outline-offset: 6px; }
.hdrb .hd-nav { display: flex; align-items: center; gap: 40px; }
.hdrb .hd-right { display: flex; align-items: center; justify-content: flex-end; gap: 32px; }
.hdrb .hd-link { display: inline-flex; align-items: center; gap: 8px; font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px;
  color: var(--hd-dim); text-decoration: none; white-space: nowrap; transition: color .2s ease; }
.hdrb .hd-link:hover, .hdrb .hd-link:focus-visible, .hdrb .hd-link[aria-current] { color: var(--hd-fg); }
.hdrb .hd-link .ico-arrow { display: block; }
.hdrb .hd-cta { display: inline-flex; align-items: center; height: 40px; padding: 8px 16px; background: var(--hd-cta-bg); color: var(--hd-cta-fg);
  font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px; text-decoration: none; white-space: nowrap;
  transition: background-color .2s ease, color .2s ease; }
.hdrb .hd-cta:hover { background: var(--hd-cta-hover); }
.hdrb .hd-cta:focus-visible { outline: 2px solid var(--hd-fg); outline-offset: 3px; }

/* Projects trigger (96×24): chevron turns into a dash on a light pill while open */
.hdrb .pj-menu { position: relative; display: flex; align-items: center; }
.hdrb .pj-trigger { display: inline-flex; align-items: center; gap: 8px; height: 24px; padding: 0 8px; margin: 0; background: transparent; border: 0;
  border-radius: 0; cursor: pointer; font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px; color: var(--hd-dim); white-space: nowrap;
  transition: background-color .2s ease, color .2s ease; }
.hdrb .pj-trigger:hover, .hdrb .pj-trigger.on { color: var(--hd-fg); }
.hdrb .pj-trigger.on { background: var(--hd-pill); }
.hdrb .pj-trigger:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.hdrb .pj-trigger svg { display: block; width: 14px; height: 14px; }

/* Projects panel (Figma 538:9995): 652×360, centred under the trigger, 8px below the header.
   The wrap starts right under the trigger (its 28px top padding = 20px to the header's bottom edge + 8px), so the
   pointer never crosses a gap on its way into the panel. */
.hdrb .mm-wrap { position: absolute; left: 50%; top: 100%; width: 652px; padding-top: 28px; z-index: 55;
  opacity: 0; visibility: hidden; transform: translate(-50%, -6px); pointer-events: none;
  transition: opacity .18s ease, transform .25s cubic-bezier(.22,1,.36,1), visibility 0s .25s; }
.hdrb .mm-wrap.open { opacity: 1; visibility: visible; transform: translate(-50%, 0); pointer-events: auto;
  transition: opacity .22s ease, transform .35s cubic-bezier(.22,1,.36,1), visibility 0s; }
.hdrb .mm { position: relative; display: grid; grid-template-columns: 320px minmax(0, 1fr); height: 360px; color: #FAFAFA; text-align: left;
  background: rgba(13,11,10,.55); -webkit-backdrop-filter: blur(40px); backdrop-filter: blur(40px); box-shadow: 0 24px 60px rgba(0,0,0,.25); }
/* the 1px edge is drawn on top, inside the 652×360 box, so it also frames the card */
.hdrb .mm::after { content: ""; position: absolute; inset: 0; z-index: 2; pointer-events: none; box-shadow: inset 0 0 0 1px rgba(250,250,250,.12); }
/* over light or dark page content the glass is a little denser, so its white text keeps its contrast */
.hdrb.m-light .mm, .hdrb.m-dark .mm, .hdrb.is-scrolled .mm { background: rgba(13,11,10,.72); }

/* card: the shown project */
.hdrb .mm-card { position: relative; display: flex; flex-direction: column; justify-content: space-between; height: 360px; padding: 32px;
  overflow: hidden; background: #0C0A09; color: #FAFAFA; text-decoration: none; }
.hdrb .mm-card .layer { position: absolute; inset: 0; transition: opacity .45s ease, transform .7s cubic-bezier(.22,1,.36,1); }
.hdrb .mm-card .layer img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 0; }
/* the dark gradient for the text, only on pictures that need it (not the GIFs, not ETO's plain red) */
.hdrb .mm-card .layer.shade::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(12,10,9,.72) 0%, rgba(12,10,9,.25) 42%, rgba(12,10,9,.2) 62%, rgba(12,10,9,.7) 100%); }
.hdrb .mm-card > .mm-t, .hdrb .mm-card > .mm-go { position: relative; z-index: 1; }
.hdrb .mm-t { display: flex; flex-direction: column; gap: 8px; animation: hdrb-in .45s cubic-bezier(.22,1,.36,1) both; }
.hdrb .mm .mm-name { display: block; font-family: ${SERIF}; font-size: 32px; font-weight: 400; line-height: 38px; letter-spacing: -0.02em; color: #FAFAFA; }
.hdrb .mm-sub { display: block; font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px; color: rgba(250,250,250,.75); }
.hdrb .mm-go { align-self: flex-start; display: inline-flex; align-items: center; height: 44px; padding: 10px 18px; background: #FAFAFA; color: #0C0A09;
  font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px; transition: background-color .2s ease; }
.hdrb .mm-card:hover .mm-go { background: #E7E5E4; }
@keyframes hdrb-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

/* list: the choice of project */
.hdrb .mm-list { padding: 32px 16px; }
.hdrb .mm-k { padding: 0 12px; margin: 0 0 12px; font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px; color: rgba(250,250,250,.6); }
.hdrb .mm-list ul { list-style: none; margin: 0; padding: 0; }
.hdrb .mm-list a { display: flex; align-items: center; height: 44px; padding: 10px 12px; font-family: ${SANS}; font-size: 16px; font-weight: 400;
  line-height: 24px; color: rgba(250,250,250,.9); text-decoration: none; transition: background-color .2s ease, color .2s ease; }
.hdrb .mm-list a.on { background: rgba(236,236,234,.16); color: #FAFAFA; }
.hdrb .mm-list a:focus-visible { outline: 2px solid #FAFAFA; outline-offset: -2px; }

/* ---- mobile menu (≤ 900px, v119) ---- */
.hdrb .hd-burger { display: none; position: relative; width: 40px; height: 40px; padding: 0; margin: 0; background: transparent; border: 0; border-radius: 0;
  color: var(--hd-fg); cursor: pointer; }
.hdrb .hd-burger i { position: absolute; left: 10px; width: 20px; height: 2px; background: currentColor;
  transition: transform .35s cubic-bezier(.22,1,.36,1), top .35s cubic-bezier(.22,1,.36,1); }
.hdrb .hd-burger i:nth-child(1) { top: 15px; }
.hdrb .hd-burger i:nth-child(2) { top: 23px; }
.hdrb.is-menu .hd-burger i:nth-child(1) { top: 19px; transform: rotate(45deg); }
.hdrb.is-menu .hd-burger i:nth-child(2) { top: 19px; transform: rotate(-45deg); }
.hdrb .hd-burger:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }

.hdrb .mnav { position: fixed; left: 0; right: 0; top: 64px; bottom: 0; z-index: 49; overflow-y: auto; overscroll-behavior: contain;
  background: #0F0F0F; color: #FAFAFA; padding: 32px 32px 48px; opacity: 0; visibility: hidden; pointer-events: none;
  transition: opacity .25s ease, visibility 0s .25s; }
.hdrb .mnav.open { opacity: 1; visibility: visible; pointer-events: auto; transition: opacity .25s ease, visibility 0s; }
.hdrb .mnav-k { margin: 0 0 16px; font-family: ${SANS}; font-size: 16px; line-height: 24px; color: rgba(250,250,250,.6); }
.hdrb .mnav ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 24px; }
.hdrb .mnav a { display: flex; flex-direction: column; gap: 4px; color: #FAFAFA; text-decoration: none; }
.hdrb .mnav .nm { display: inline-flex; align-items: center; gap: 8px; font-family: ${SANS}; font-size: 28px; font-weight: 400; line-height: 36px; letter-spacing: -0.01em; }
.hdrb .mnav .nm .ico-arrow { width: 20px; height: 20px; }
.hdrb .mnav .sb { font-family: ${SANS}; font-size: 16px; line-height: 24px; color: rgba(250,250,250,.6); }
.hdrb .mnav a:focus-visible { outline: 2px solid #FAFAFA; outline-offset: 4px; }
.hdrb .mnav a[aria-current] .nm { text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 1px; }
.hdrb .mnav-line { height: 1px; margin: 40px 0; background: rgba(250,250,250,.12); }
.hdrb .mnav li { opacity: 0; transform: translateY(8px); }
.hdrb .mnav.open li { animation: mnav-in .45s cubic-bezier(.22,1,.36,1) var(--d, 0s) forwards; }
@keyframes mnav-in { to { opacity: 1; transform: none; } }

@media (max-width: 900px) {
  .hdrb .hd { width: calc(100vw - 32px); grid-template-columns: auto minmax(0, 1fr); }
  .hdrb .hd-nav, .hdrb .hd-right .hd-link { display: none; }
  .hdrb .hd-right { gap: 8px; }
  .hdrb .hd-burger { display: block; }
}
@media (min-width: 901px) {
  .hdrb .mnav { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .hdrb .mm-t { animation: none; }
  .hdrb .mm-card .layer { transition: none; }
  .hdrb .mnav li, .hdrb .mnav.open li { opacity: 1; transform: none; animation: none; }
}
`

/* ---------- Projects menu ---------- */
// plain: a still that needs no dark gradient behind the white text (ETO's red)
type MenuItem = { name: string; sub: string; href: string; gif?: string; img?: string; plain?: boolean }
const MENU: MenuItem[] = [
  { name: 'Trust Bank', sub: 'Rewards UX revamp', href: '#/trust-bank', gif: GIFS.trustBankMenu },
  { name: 'GameCove', sub: 'AI analytics dashboard', href: '#/gamecove', gif: GIFS.gameCoveMenu },
  { name: 'UTrada', sub: 'Trading platform design system', href: '#/utrada', img: IMG3 + 'utrada-screens.webp' },
  { name: 'ETO Markets', sub: 'CRM dashboard', href: '#/eto-markets', img: ETO + 'eto-cover.jpg', plain: true },
]
// how long each project stays up while the menu moves through them: a GIF plays to its end (plus a beat), a still 2.8s
const STILL_MS = 2800
const dwell = (m: MenuItem) => (m.gif ? GIF_MS + 200 : STILL_MS)

/** one card background; a GIF starts from its first frame whenever its project comes up */
function MenuLayer({ m, active }: { m: MenuItem; active: boolean }) {
  const gif = useGifSrc(m.gif, active)
  return (
    <div className={'layer' + (m.gif || m.plain ? '' : ' shade')} style={{ opacity: active ? 1 : 0, transform: active ? 'scale(1)' : 'scale(1.04)' }}>
      <img src={m.gif ? gif : m.img} alt="" width={320} height={360} />
    </div>
  )
}

function ProjectsMenu() {
  const [open, setOpen] = useState(false)
  const [everOpen, setEverOpen] = useState(false) // the pictures load on the first open and stay
  const [hot, setHot] = useState(0)
  const [held, setHeld] = useState(false) // pointer on the project list: stop moving on
  const ref = useRef<HTMLDivElement>(null)
  const closeTimer = useRef(0)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const close = () => setOpen(false)
    addEventListener('keydown', onKey)
    addEventListener('pointerdown', onDown)
    addEventListener('hashchange', close)
    return () => {
      removeEventListener('keydown', onKey)
      removeEventListener('pointerdown', onDown)
      removeEventListener('hashchange', close)
    }
  }, [open])

  // while open, the menu moves on to the next project once the shown one has had its time (a GIF: its whole length)
  useEffect(() => {
    if (!open || held || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setTimeout(() => setHot(h => (h + 1) % MENU.length), dwell(MENU[hot]))
    return () => clearTimeout(t)
  }, [open, held, hot])

  const openNow = () => { window.clearTimeout(closeTimer.current); setEverOpen(true); setOpen(true) }
  const closeSoon = () => { window.clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => { setOpen(false); setHeld(false) }, 180) }
  const p = MENU[hot]
  const tab = open ? 0 : -1

  return (
    <div ref={ref} className="pj-menu" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button type="button" aria-haspopup="true" aria-expanded={open} onClick={() => (open ? setOpen(false) : openNow())} onFocus={openNow}
        className={'pj-trigger' + (open ? ' on' : '')}>
        Projects
        {open
          ? <svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          : <svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5.25L7 9.25L11 5.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </button>

      <div className={'mm-wrap' + (open ? ' open' : '')} aria-hidden={!open}>
        <div className="mm">
          <a className="mm-card" href={p.href} tabIndex={-1} aria-hidden="true" onClick={() => setOpen(false)}>
            {everOpen && MENU.map((m, i) => <MenuLayer key={m.name} m={m} active={open && i === hot} />)}
            <span className="mm-t" key={p.name}>
              <span className="mm-name">{p.name}</span>
              <span className="mm-sub">{p.sub}</span>
            </span>
            <span className="mm-go">View project</span>
          </a>

          <div className="mm-list" onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)}>
            <p className="mm-k">Projects</p>
            <ul>
              {MENU.map((m, i) => (
                <li key={m.name}>
                  <a href={m.href} className={i === hot ? 'on' : undefined} tabIndex={tab}
                    onMouseEnter={() => setHot(i)} onFocus={() => { setHot(i); setHeld(true) }} onBlur={() => setHeld(false)}
                    onClick={() => setOpen(false)}>{m.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

/** phones / small tablets: the full menu under the bar */
function MobileNav({ open, close, current }: { open: boolean; close: () => void; current?: 'about' }) {
  const here = typeof window !== 'undefined' ? window.location.hash : ''
  const tab = open ? 0 : -1
  let k = 0
  const d = () => ({ '--d': `${(k++ * 0.04).toFixed(2)}s` } as React.CSSProperties)
  return (
    <nav id="hd-mnav" className={'mnav' + (open ? ' open' : '')} aria-label="Menu" aria-hidden={!open}>
      <p className="mnav-k">Projects</p>
      <ul>
        {MENU.map(m => (
          <li key={m.name} style={d()}>
            <a href={m.href} tabIndex={tab} onClick={close} aria-current={here.startsWith(m.href) ? 'page' : undefined}>
              <span className="nm">{m.name}</span>
              <span className="sb">{m.sub}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="mnav-line" aria-hidden="true" />
      <ul>
        <li style={d()}><a href="#/about" tabIndex={tab} onClick={close} aria-current={current === 'about' ? 'page' : undefined}><span className="nm">About me</span></a></li>
        <li style={d()}><a href={LINKS.linkedin} tabIndex={tab} target="_blank" rel="noreferrer" onClick={close}><span className="nm">LinkedIn <ArrowUpRight /></span></a></li>
      </ul>
    </nav>
  )
}

/** the logo: on the main page it scrolls back to the top; on any other page it opens the main page */
const goHome = (e: React.MouseEvent) => {
  e.preventDefault()
  if (window.location.hash.startsWith('#/')) window.location.hash = ''
  else scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

export function SiteHeaderB({ mode = 'overlay', current, hidden = false, away = false }: {
  mode?: HeaderMode; current?: 'about'; hidden?: boolean; away?: boolean
}) {
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    let raf = 0
    const run = () => { raf = 0; setScrolled(scrollY > 40) }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true })
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on) }
  }, [])
  // the mobile menu: Esc / page change / widening past 900px closes it; the page under it stays still
  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(false)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    const onWide = () => { if (innerWidth > 900) close() }
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    addEventListener('keydown', onKey)
    addEventListener('hashchange', close)
    addEventListener('resize', onWide)
    return () => {
      root.style.overflow = prev
      removeEventListener('keydown', onKey)
      removeEventListener('hashchange', close)
      removeEventListener('resize', onWide)
    }
  }, [menu])
  const cls = 'hdrb m-' + mode + (scrolled ? ' is-scrolled' : '') + (menu ? ' is-menu' : '') +
    (hidden && !menu ? ' is-hidden' : away && !menu ? ' is-away' : '')
  return (
    <header className={cls} aria-hidden={(hidden && !menu) || undefined}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap" />
      <style>{HDR_CSS}</style>
      <div className="hdrb-bar">
        <div className="hd">
          <a className="hd-logo" href="#" aria-label="Harbor, main page" onClick={e => { setMenu(false); goHome(e) }} dangerouslySetInnerHTML={{ __html: HEADER_LOGO_SVG }} />
          <nav className="hd-nav" aria-label="Main">
            <ProjectsMenu />
            <a className="hd-link" href="#/about" aria-current={current === 'about' ? 'page' : undefined}>About me</a>
          </nav>
          <div className="hd-right">
            <a className="hd-link" href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight /></a>
            <a className="hd-cta" href={LINKS.resume} target="_blank" rel="noreferrer" aria-label="Resume (opens in a new tab)">Resume</a>
            <button type="button" className="hd-burger" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="hd-mnav"
              onClick={() => setMenu(v => !v)}>
              <i aria-hidden="true" /><i aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <MobileNav open={menu} close={() => setMenu(false)} current={current} />
    </header>
  )
}
