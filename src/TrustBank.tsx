import React, { useEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { TrustBankBody } from './p1/TrustBankBody'

// Trust Bank case study page for this site.
// Body (hero → reflection) = Portfolio_1's Trust Bank page (p1/TrustBankBody.tsx): its copy, colours, type, rounded corners and interactions.
// This file keeps this site's chrome: the header (logo · ← All projects · chapter · Next · GameCove · Book a call,
// reading bar), the cursor dot trail, the "Next case study" card and the footer.
// The header stays fixed at the top the whole time (no tuck-away on scroll). Ink text, so it reads over the white hero.

const NEXT_URL = 'https://project-harbor-kim-portfolio-114.magicpatterns.app/#/gamecove'
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

/* ---------- cursor dot trail ---------- */

function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const reduce = reducedMotion()
    const BASE = '#ffffff', ACCENT = '#1fb6d5', TRAIL_MS = 260, SPRING = 0.14, DAMPING = 0.7
    const isInteractive = (el: Element | null) => {
      if (!el || !(el instanceof Element)) return false
      if (el.closest('a, button, [role="button"], label, summary')) return true
      const c = getComputedStyle(el).cursor
      return c === 'pointer' || c === 'crosshair' || c === 'zoom-in'
    }
    const size = () => {
      const dpr = Math.min(2, devicePixelRatio || 1)
      canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr)
      canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size(); addEventListener('resize', size)
    const mouse = { x: -100, y: -100 }, dot = { x: -100, y: -100, vx: 0, vy: 0 }
    const tail: { x: number; y: number; t: number }[] = []
    let visible = 0, present = false, first = true, accent = false, grow = 0, raf = 0
    const onPoint = (e: MouseEvent) => {
      if ((e as PointerEvent).pointerType === 'touch') { present = false; return }
      if (!Number.isFinite(e.clientX) || (e.clientX === 0 && e.clientY === 0 && e.type === 'wheel')) { present = true; return }
      mouse.x = e.clientX; mouse.y = e.clientY; present = true
      if (first) { dot.x = mouse.x; dot.y = mouse.y; first = false }
      accent = isInteractive(e.target as Element)
    }
    const onScroll = () => { if (present && !first) accent = isInteractive(document.elementFromPoint(mouse.x, mouse.y)) }
    const onOut = (e: MouseEvent) => { if (!e.relatedTarget) present = false }
    const tick = (now: number) => {
      if (reduce) { dot.x = mouse.x; dot.y = mouse.y }
      else {
        dot.vx = (dot.vx + (mouse.x - dot.x) * SPRING) * DAMPING; dot.vy = (dot.vy + (mouse.y - dot.y) * SPRING) * DAMPING
        dot.x += dot.vx; dot.y += dot.vy
      }
      visible += ((present ? 1 : 0) - visible) * 0.15
      grow += ((accent ? 1 : 0) - grow) * 0.2
      tail.push({ x: dot.x, y: dot.y, t: now })
      while (tail.length && now - tail[0].t > TRAIL_MS) tail.shift()
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      if (visible > 0.01) {
        const color = accent ? ACCENT : BASE
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round'
        if (!reduce) for (let i = 1; i < tail.length; i++) {
          const a = tail[i - 1], b = tail[i]
          if (Math.hypot(b.x - a.x, b.y - a.y) < 0.2) continue
          const k = i / tail.length
          ctx.globalAlpha = visible * k * 0.9; ctx.lineWidth = 0.4 + k * 2.2
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
        }
        ctx.globalAlpha = visible
        ctx.beginPath(); ctx.arc(dot.x, dot.y, 3.5 + grow * 1.5, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const opts = { passive: true, capture: true } as AddEventListenerOptions
    const types = ['pointermove', 'mousemove', 'pointerover', 'pointerdown', 'mousedown', 'wheel']
    types.forEach(t => addEventListener(t, onPoint as EventListener, opts))
    addEventListener('scroll', onScroll, opts); document.addEventListener('mouseout', onOut, opts)
    return () => {
      cancelAnimationFrame(raf); removeEventListener('resize', size)
      types.forEach(t => removeEventListener(t, onPoint as EventListener, opts))
      removeEventListener('scroll', onScroll, opts); document.removeEventListener('mouseout', onOut, opts)
    }
  }, [])
  return <canvas ref={ref} className="cursor-trail" aria-hidden="true" />
}

/* ---------- page ---------- */

export function TrustBank() {
  const [chapter, setChapter] = useState('Trust Bank')
  const [scrolled, setScrolled] = useState(false)
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => { scrollTo(0, 0) }, [])

  // reading progress, and the light glass background once the page has scrolled (the header itself never hides)
  useOnScroll(() => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight
    if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`
    setScrolled(y > 40)
  })

  // current chapter name in the header
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setChapter((e.target as HTMLElement).dataset.chapter || '') }), { rootMargin: '-45% 0px -54% 0px' })
    document.querySelectorAll('.tb [data-chapter]').forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  const toNext = (e: React.MouseEvent) => { e.preventDefault(); document.getElementById('next')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' }) }
  const idx = CHAPTERS.indexOf(chapter)

  return (
    <div className="hb tb">
      <style>{CSS + TB_CSS}</style>
      {/* handwriting on the Define whiteboard only */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500&family=Kalam:wght@400&display=swap" />
      <CursorTrail />

      <header className={'tb-head' + (scrolled ? ' scrolled' : '')}>
        <div className="wrap tb-nav">
          <div className="nav-left">
            <a className="logo" href="#top" onClick={e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }) }}>harbor</a>
            <a className="back" href="#projects">← All projects</a>
          </div>
          <div className="chapter" aria-live="polite"><span key={chapter}>{idx >= 0 ? `0${idx + 1} · ` : ''}{chapter}</span></div>
          <div className="nav-right">
            <a className="next-link" href="#next" onClick={toNext}>Next · GameCove →</a>
            <a className="btn-sm" href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a>
          </div>
        </div>
        <div className="read" aria-hidden="true"><i ref={bar} /></div>
      </header>

      <main id="top">
        <TrustBankBody />

        <section className="next" id="next">
          <a className="wrap next-card" href={NEXT_URL}>
            <span className="eyebrow">Next case study</span>
            <span className="next-name">GameCove <span className="go">→</span></span>
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
    </div>
  )
}

// Site chrome only (header, cursor trail, next case card). The body brings its own styles (p1/TrustBankBody.tsx).
const TB_CSS = `
.tb .cursor-trail { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; mix-blend-mode: difference; }

/* header: fixed at the top at all times; transparent at the very top (ink text over the white hero), light glass after scrolling */
.tb-head { position: fixed; inset: 0 0 auto 0; z-index: 50; color: var(--ink); border-bottom: 1px solid transparent;
  transition: background-color .35s, color .35s, border-color .35s; }
.tb-head.scrolled { background: rgba(245,245,242,.9); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); color: var(--ink); border-bottom-color: var(--line); }
.tb-nav { height: 72px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; }
.tb-nav .nav-left { gap: 32px; }
.tb-nav .nav-right { justify-content: flex-end; }
.tb .back, .tb .next-link { font-size: 16px; opacity: .8; transition: opacity .2s; }
.tb .back:hover, .tb .next-link:hover { opacity: 1; }
.tb .chapter { font-size: 16px; opacity: .7; min-width: 180px; text-align: center; overflow: hidden; }
.tb .chapter span { display: inline-block; animation: rise .45s var(--ease) both; }
.tb .tb-head .btn-sm { background: var(--ink); color: #fff; }
.tb .read { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; }
.tb .read i { display: block; height: 100%; background: currentColor; transform: scaleX(0); transform-origin: 0 50%; }

/* the pinned Deliver showcase sits below the fixed header */
@media (min-width: 1024px) { .tb .p1tb .lg\\:sticky { top: max(92px, calc(50vh - 400px)) !important; } }

/* next project */
.tb .next { background: var(--off); }
.tb .next-card { display: flex; flex-direction: column; gap: 16px; padding: 140px 0; }
.tb .next-name { font-size: clamp(56px, 6vw, 112px); font-weight: 300; letter-spacing: -0.04em; line-height: 1; transition: transform .3s ease-out; }
.tb .next-card:hover .next-name { transform: translateX(8px); }

@media (max-width: 900px) {
  .tb-nav { grid-template-columns: 1fr auto; } .tb .chapter, .tb .next-link, .tb .back { display: none; }
}
`
