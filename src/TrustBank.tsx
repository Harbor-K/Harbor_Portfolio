import React, { useEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { TrustBankBody } from './p1/TrustBankBody'
import { KimButton, VoiceAssistant } from './KimLLM'
import { SideToc, useHeadroom } from './CaseNav'

// Trust Bank case study page for this site.
// Body (hero → reflection) = Portfolio_1's Trust Bank page (p1/TrustBankBody.tsx): its copy, colours, type and interactions.
// Corners: square like the rest of the site and Harbor's Figma image frame ("44기 김지현 4차 랜딩페이지", node 1367:39239) —
// the hero video, every photo, screenshot and video frame, the Deliver feature cards (and the blue progress line around them),
// the before/after blocks and the white frame around the affinity whiteboard are all 0px (TB_CSS below).
// Kept round on purpose: the whiteboard's own pill-shaped glass board inside that frame (Harbor's note), the phone mockups,
// round number badges and avatars, the toggle pills and the small UI shapes drawn inside the usability-test player.
// The hero opens on the full-screen video, which moves into its place on its own after 2.5 seconds (p1/TrustHero.tsx).
// This file keeps this site's chrome: the header (harbor → main page on the left; Next · GameCove and the ✦ Kim LLM button
// on the right), the process contents on the left side (CaseNav.tsx), the "Next case study" card, the footer and the
// Kim LLM panel (KimLLM.tsx). "Next · GameCove" and the big card at the bottom both open the GameCove page directly.
// A few seconds after this page opens, GameCove's opening video and poster are fetched in the background (prefetch), so
// the GameCove page's full-screen intro starts at once instead of flashing while the video loads.
// Header: hidden while the full-screen intro plays (until the hero sends 'caseintro' false); after that it slides away
// while scrolling down and comes back on scrolling up (useHeadroom).

const NEXT = { name: 'GameCove', href: '#/gamecove' }
// GameCove's hero video + poster (GameCoveV4.tsx), warmed in the browser cache for a smooth jump to the next page
const NEXT_PREFETCH = [
  'https://raw.githubusercontent.com/Harbor-K/landing_page/main/gamecove/assets/v4/hero-ad.mp4',
  'https://raw.githubusercontent.com/Harbor-K/landing_page/main/gamecove/assets/v4/hero-ad-poster.jpg',
]
const LINKS = {
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
  linkedin: 'https://www.linkedin.com/in/harborkim/',
  instagram: 'https://instagram.com/harbor_0328',
  email: 'mailto:harborkim0328@gmail.com',
}
const CHAPTERS = ['Overview', 'Process', 'Discover', 'Define', 'Develop', 'Deliver', 'Test', 'Reflection']

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** call `fn` on scroll/resize, once per frame */
function useOnScroll(fn: () => void) {
  const f = useRef(fn); f.current = fn
  useEffect(() => {
    let raf = 0
    const run = () => { raf = 0; f.current() }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])
}

/** "harbor" goes back to the top of the main page */
const goHome = (e: React.MouseEvent) => { e.preventDefault(); window.location.hash = '' }

export function TrustBank() {
  const [scrolled, setScrolled] = useState(false)
  const [intro, setIntro] = useState(() => !reducedMotion())
  const away = useHeadroom()

  useEffect(() => { scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior }) }, [])

  // the header appears when the hero's intro has finished (with a safety timeout)
  useEffect(() => {
    const on = (e: Event) => setIntro(!!(e as CustomEvent).detail)
    addEventListener('caseintro', on)
    const t = window.setTimeout(() => setIntro(false), 8000)
    return () => { removeEventListener('caseintro', on); window.clearTimeout(t) }
  }, [])

  // fetch the next page's opening video in the background once this page has settled
  useEffect(() => {
    const links: HTMLLinkElement[] = []
    const t = window.setTimeout(() => {
      NEXT_PREFETCH.forEach((href) => {
        if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return
        const l = document.createElement('link')
        l.rel = 'prefetch'
        l.href = href
        document.head.appendChild(l)
        links.push(l)
      })
    }, 4000)
    return () => { window.clearTimeout(t); links.forEach((l) => l.remove()) }
  }, [])

  // light glass after scrolling
  useOnScroll(() => setScrolled(scrollY > 40))

  return (
    <div className="hb tb">
      <style>{CSS + TB_CSS}</style>
      {/* handwriting on the Define whiteboard only */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500&family=Kalam:wght@400&display=swap" />

      <header className={'tb-head' + (scrolled ? ' scrolled' : '') + (intro ? ' intro' : '') + (away && !intro ? ' away' : '')} aria-hidden={intro || undefined}>
        <div className="wrap tb-nav">
          <div className="nav-left">
            <a className="logo" href="#" aria-label="harbor, main page" tabIndex={intro ? -1 : undefined} onClick={goHome}>harbor</a>
          </div>
          <div className="nav-right">
            <a className="next-link" href={NEXT.href} tabIndex={intro ? -1 : undefined}>Next · {NEXT.name} →</a>
            <KimButton tabIndex={intro ? -1 : undefined} />
          </div>
        </div>
      </header>

      <SideToc chapters={CHAPTERS} scope=".tb" hidden={intro} />

      <main id="top">
        <TrustBankBody />

        <section className="next" id="next">
          <a className="wrap next-card" href={NEXT.href}>
            <span className="eyebrow">Next case study</span>
            <span className="next-name">{NEXT.name} <span className="go">→</span></span>
          </a>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <div className="foot-top">
            <div className="brand"><div className="logo">harbor</div><a href={LINKS.email}>harborkim0328@gmail.com</a></div>
            <div className="foot-cols">
              <div className="foot-col"><div className="h">Explore</div><a href="#projects">Projects</a><a href="#/about">About me</a></div>
              <div className="foot-col"><div className="h">Contact</div><a href={LINKS.email}>Email</a><a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={LINKS.instagram} target="_blank" rel="noreferrer">Instagram</a><a href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a></div>
            </div>
          </div>
          <div className="foot-bottom"><span>© 2026 Harbor Kim. All rights reserved.</span><span>Designed in Figma by Harbor</span></div>
        </div>
        <div className="wordmark" aria-hidden="true">harbor</div>
      </footer>

      <VoiceAssistant />
    </div>
  )
}

// Site chrome (header, next case card) + the square-corner pass over the body. The body brings its own styles (p1/TrustBankBody.tsx).
const TB_CSS = `
/* header: hidden during the full-screen intro; slides away on scroll down, back on scroll up; light glass after scrolling */
.tb-head { position: fixed; inset: 0 0 auto 0; z-index: 50; color: var(--ink); border-bottom: 1px solid transparent;
  transition: background-color .35s, color .35s, border-color .35s, transform .45s cubic-bezier(.22,1,.36,1), opacity .3s; }
.tb-head.scrolled { background: rgba(245,245,242,.9); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); color: var(--ink); border-bottom-color: var(--line); }
.tb-head.away { transform: translateY(calc(-100% - 4px)); }
.tb-head.intro { transform: translateY(calc(-100% - 4px)); opacity: 0; pointer-events: none; }
.tb-nav { height: 72px; display: flex; justify-content: space-between; align-items: center; }
.tb-nav .nav-right { gap: 24px; }
.tb .next-link { font-size: 16px; opacity: .8; transition: opacity .2s; }
.tb .next-link:hover { opacity: 1; }

/* square corners (site style, Harbor's Figma frame): photos, screenshots, video frames, cards, before/after blocks,
   the affinity whiteboard's white frame, and the hero video (its intro animates the radius inline, so !important).
   Matched with attribute selectors (class*=) so no backslash escapes are needed — escaped selectors were lost in the build.
   Not touched: the whiteboard's pill-shaped board (inline radius), phone mockups (60px / 48px), rounded-full badges
   and toggles, and the small UI shapes inside the usability-test player (4–11px). */
.tb .p1tb [class*="rounded-[20px]"], .tb .p1tb [class*="rounded-[16px]"] { border-radius: 0 !important; }
.tb .p1tb [data-no-reveal] > div { border-radius: 0 !important; }
/* the blue progress line drawn around each Deliver card follows the card's square corner */
.tb .p1tb svg rect[rx="19"] { rx: 0; ry: 0; }

/* the pinned Deliver showcase sits below the fixed header */
@media (min-width: 1024px) { .tb .p1tb .lg\\:sticky { top: max(92px, calc(50vh - 400px)) !important; } }

/* next project */
.tb .next { background: var(--off); }
.tb .next-card { display: flex; flex-direction: column; gap: 16px; padding: 140px 0; }
.tb .next-name { font-size: clamp(56px, 6vw, 112px); font-weight: 300; letter-spacing: -0.04em; line-height: 1; transition: transform .3s ease-out; }
.tb .next-card:hover .next-name { transform: translateX(8px); }

@media (max-width: 900px) {
  .tb .next-link { display: none; }
}
`
