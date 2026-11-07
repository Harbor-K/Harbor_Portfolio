import React, { useEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { TrustBankBody } from './p1/TrustBankBody'
import { KimButton, VoiceAssistant } from './KimLLM'
import { SideToc, useHeadroom } from './CaseNav'

// Trust Bank case study page for this site.
// Body (hero → reflection) = Portfolio_1's Trust Bank page (p1/TrustBankBody.tsx): its copy, colours, type, rounded corners and interactions.
// The hero opens on the full-screen video, which moves into its place on its own after 2.5 seconds (p1/TrustHero.tsx).
// This file keeps this site's chrome: the header (harbor → main page on the left; Next · GameCove and the ✦ Kim LLM button
// on the right), the process contents on the left side (CaseNav.tsx, Notion-style), the "Next case study" card,
// the footer and the Kim LLM panel (KimLLM.tsx).
// "Next · GameCove" in the header and the big card at the bottom both open the GameCove page directly (#/gamecove).
// Header: hidden while the full-screen intro plays (until the hero sends 'caseintro' false); after that it slides away
// while scrolling down and comes back on scrolling up (useHeadroom).
// The line cursor comes from index.tsx for every page.

const NEXT = { name: 'GameCove', href: '#/gamecove' }
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

// Site chrome only (header, next case card). The body brings its own styles (p1/TrustBankBody.tsx).
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
