import React, { useEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { GameCoveV4Body, GC4_CHAPTERS } from './GameCoveV4'

// GameCove case study page for this site. The body (hero → reflection) is GameCoveV4.tsx (the same file Portfolio_1 uses),
// built from Figma "GameCove_v.4 · GameCove colors" in GameCove's own dark palette.
// This file keeps the site chrome the Trust Bank page uses: header fixed at the top at all times with the chapter name
// and reading bar (dark here, to sit on the dark page), cursor dot trail, next case card and footer.

const NEXT_URL = '#/trust-bank'
const LINKS = {
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
  linkedin: 'https://www.linkedin.com/in/harborkim/',
  instagram: 'https://instagram.com/harbor_0328',
  email: 'mailto:harborkim0328@gmail.com',
}
const CHAPTERS = GC4_CHAPTERS

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

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

/* ---------- cursor dot trail (same as the Trust Bank page) ---------- */

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

export function GameCove() {
  const [chapter, setChapter] = useState('GameCove')
  const [scrolled, setScrolled] = useState(false)
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => { scrollTo(0, 0) }, [])

  // reading progress, and the dark glass background once the page has scrolled (the header itself never hides)
  useOnScroll(() => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight
    if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`
    setScrolled(y > 40)
  })

  // current chapter name in the header
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setChapter((e.target as HTMLElement).dataset.chapter || '') }), { rootMargin: '-45% 0px -54% 0px' })
    document.querySelectorAll('.gc [data-chapter]').forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  const toNext = (e: React.MouseEvent) => { e.preventDefault(); document.getElementById('next')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' }) }
  const idx = CHAPTERS.indexOf(chapter)

  return (
    <div className="hb gc">
      <style>{CSS + GC_CSS}</style>
      <CursorTrail />

      <header className={'gc-head' + (scrolled ? ' scrolled' : '')}>
        <div className="wrap gc-nav">
          <div className="nav-left">
            <a className="logo" href="#top" onClick={e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }) }}>harbor</a>
            <a className="back" href="#projects">← All projects</a>
          </div>
          <div className="chapter" aria-live="polite"><span key={chapter}>{idx >= 0 ? `${String(idx + 1).padStart(2, '0')} · ` : ''}{chapter}</span></div>
          <div className="nav-right">
            <a className="next-link" href="#next" onClick={toNext}>Next · Trust Bank →</a>
            <a className="btn-sm" href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a>
          </div>
        </div>
        <div className="read" aria-hidden="true"><i ref={bar} /></div>
      </header>

      <main>
        <GameCoveV4Body />

        <section className="next" id="next">
          <a className="wrap next-card" href={NEXT_URL}>
            <span className="eyebrow">Next case study</span>
            <span className="next-name">Trust Bank <span className="go">→</span></span>
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

const GC_CSS = `
.gc { background: #111114; }
.gc .cursor-trail { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; mix-blend-mode: difference; }

/* header: fixed at the top at all times; transparent over the hero, dark glass after scrolling */
.gc-head { position: fixed; inset: 0 0 auto 0; z-index: 50; color: #F2F0EC; border-bottom: 1px solid transparent;
  transition: background-color .35s, color .35s, border-color .35s; }
.gc-head.scrolled { background: rgba(17,17,20,.86); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); border-bottom-color: #2A2D31; }
.gc-nav { height: 72px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; }
.gc-nav .nav-left { gap: 32px; }
.gc-nav .nav-right { justify-content: flex-end; }
.gc .back, .gc .next-link { font-size: 16px; opacity: .8; transition: opacity .2s; }
.gc .back:hover, .gc .next-link:hover { opacity: 1; }
.gc .chapter { font-size: 16px; opacity: .7; min-width: 180px; text-align: center; overflow: hidden; }
.gc .chapter span { display: inline-block; animation: rise .45s var(--ease) both; }
.gc .gc-head .btn-sm { background: #F2F0EC; color: #111114; }
.gc .read { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; }
.gc .read i { display: block; height: 100%; background: #B3D1FF; transform: scaleX(0); transform-origin: 0 50%; }

/* the pinned Final design showcase sits below the fixed header */
.gc .gc4 .g-show { padding-top: 96px; }

/* next project */
.gc .next { background: #17171B; color: #F2F0EC; border-top: 1px solid #2A2D31; }
.gc .next .eyebrow { color: #A7A9B0; }
.gc .next-card { display: flex; flex-direction: column; gap: 16px; padding: 140px 0; }
.gc .next-name { font-size: clamp(56px, 6vw, 112px); font-weight: 300; letter-spacing: -0.04em; line-height: 1; transition: transform .3s ease-out; }
.gc .next-card:hover .next-name { transform: translateX(8px); }

@media (max-width: 900px) {
  .gc-nav { grid-template-columns: 1fr auto; } .gc .chapter, .gc .next-link, .gc .back { display: none; }
}
`
