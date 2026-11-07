import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { GameCoveV4Body, GC4_CHAPTERS } from './GameCoveV4'
import { ChapterMeter } from './ChapterMeter'

// GameCove case study page for this site. The body (hero → reflection) is GameCoveV4.tsx (the same file Portfolio_1 uses),
// built from Figma "GameCove_v.4 · GameCove colors" in GameCove's own dark palette.
// Full-screen intro (like the Trust Bank page): the page opens with the hero ad video filling the screen. After 4 seconds
// (HOLD_MS, Harbor's call for GameCove; Trust Bank holds 2.5s) it moves on its own — no scrolling needed — quickly back
// into its place under the headline over ANIM_MS, easing in and out. Scrolling, swiping or a key press during the hold
// starts the move straight away; the page can't scroll until the video has settled. The normal line cursor from
// index.tsx is used throughout.
// While the intro runs the video's controls (progress, play/pause, time, sound) are hidden (.intro-on); afterwards they
// show on hover as before.
// Header: hidden during the intro, then fixed at the top: harbor → main page · chapter meter · Next · Trust Bank
// (Book a call taken out of the header at Harbor's request; it stays in the footer).
// GameCoveV4.tsx is left untouched: the intro is applied here to its video (.g-video) by style only — the video is scaled
// up from its own centre to cover the screen and clipped to the screen edges, easing back to its normal size, place and
// 16px corners.
// Reduced motion: no intro.

const NEXT_URL = '#/trust-bank'
const LINKS = {
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
  linkedin: 'https://www.linkedin.com/in/harborkim/',
  instagram: 'https://instagram.com/harbor_0328',
  email: 'mailto:harborkim0328@gmail.com',
}
const CHAPTERS = GC4_CHAPTERS
const RADIUS = 16
const HOLD_MS = 4000
const ANIM_MS = 1000

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
// quart in-out: quick through the middle, soft at both ends
const ease = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2)

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

/** timed full-screen intro on GameCoveV4's hero video (see the note at the top); calls onDone when it has settled */
function useHeroIntro(on: boolean, onDone: () => void) {
  const done = useRef(onDone); done.current = onDone
  useLayoutEffect(() => {
    if (!on) { done.current(); return }
    const hero = document.querySelector<HTMLElement>('.gc .gc4 .g-hero')
    const vid = hero?.querySelector<HTMLElement>('.g-video') ?? null
    if (!hero || !vid) { done.current(); return }
    const keep = {
      hero: { position: hero.style.position, zIndex: hero.style.zIndex },
      vid: { position: vid.style.position, zIndex: vid.style.zIndex, transition: vid.style.transition, opacity: vid.style.opacity, transform: vid.style.transform, clipPath: vid.style.clipPath, transformOrigin: vid.style.transformOrigin, willChange: vid.style.willChange },
    }
    hero.style.position = 'relative'
    hero.style.zIndex = '2'
    Object.assign(vid.style, { position: 'relative', zIndex: '3', transition: 'none', opacity: '1', transformOrigin: '50% 50%', willChange: 'transform, clip-path' })

    const root = document.documentElement
    const keepRoot = { overflow: root.style.overflow, gutter: root.style.getPropertyValue('scrollbar-gutter') }
    root.style.overflow = 'hidden' // no scrolling until the video has settled
    root.style.setProperty('scrollbar-gutter', 'stable')
    scrollTo(0, 0)

    // the video's own place (its rect with no intro styles)
    let r0 = { l: 0, t: 0, w: 1, h: 1 }
    const measure = () => {
      const vt = vid.style.transform, vc = vid.style.clipPath
      vid.style.transform = 'none'; vid.style.clipPath = 'none'
      const b = vid.getBoundingClientRect()
      r0 = { l: b.left, t: b.top, w: Math.max(1, b.width), h: Math.max(1, b.height) }
      vid.style.transform = vt; vid.style.clipPath = vc
    }
    const apply = (e: number) => {
      const vh = innerHeight, vw = document.documentElement.clientWidth
      const { l, t, w, h } = r0
      const S = Math.max(vw / w, vh / h) // scale that covers the screen
      const s = S + (1 - S) * e
      const tx = (vw / 2 - (l + w / 2)) * (1 - e)
      const ty = (vh / 2 - (t + h / 2)) * (1 - e)
      const visW = vw + (w - vw) * e, visH = vh + (h - vh) * e
      const ix = Math.max(0, (w - visW / s) / 2), iy = Math.max(0, (h - visH / s) / 2)
      vid.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${s.toFixed(4)})`
      vid.style.clipPath = `inset(${iy.toFixed(2)}px ${ix.toFixed(2)}px round ${((RADIUS * e) / s).toFixed(2)}px)`
    }

    let animStart = performance.now() + HOLD_MS
    let raf = 0, finished = false
    const skip = () => { const now = performance.now(); if (now < animStart) animStart = now }
    const onResize = () => measure()
    // fonts / images can move the hero a little after the first paint
    const t1 = window.setTimeout(measure, 300), t2 = window.setTimeout(measure, 1200)
    const unlock = () => {
      root.style.overflow = keepRoot.overflow
      if (keepRoot.gutter) root.style.setProperty('scrollbar-gutter', keepRoot.gutter)
      else root.style.removeProperty('scrollbar-gutter')
      removeEventListener('wheel', skip); removeEventListener('touchmove', skip); removeEventListener('keydown', skip)
      removeEventListener('resize', onResize)
      window.clearTimeout(t1); window.clearTimeout(t2)
    }
    const finish = () => {
      finished = true
      vid.style.transform = ''
      vid.style.clipPath = ''
      unlock()
      done.current()
    }
    const frame = (now: number) => {
      const p = clamp((now - animStart) / ANIM_MS)
      apply(ease(p))
      if (p >= 1) finish()
      else raf = requestAnimationFrame(frame)
    }
    measure()
    apply(0)
    raf = requestAnimationFrame(frame)
    addEventListener('wheel', skip, { passive: true })
    addEventListener('touchmove', skip, { passive: true })
    addEventListener('keydown', skip)
    addEventListener('resize', onResize)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      if (!finished) unlock()
      Object.assign(hero.style, keep.hero)
      Object.assign(vid.style, keep.vid)
    }
  }, [on])
}

/** "harbor" goes back to the top of the main page */
const goHome = (e: React.MouseEvent) => { e.preventDefault(); window.location.hash = '' }

export function GameCove() {
  const [chapter, setChapter] = useState('GameCove')
  const [scrolled, setScrolled] = useState(false)
  const [introOn] = useState(() => !reducedMotion())
  const [intro, setIntro] = useState(introOn)

  useEffect(() => { scrollTo(0, 0) }, [])
  useHeroIntro(introOn, () => setIntro(false))

  // dark glass after scrolling
  useOnScroll(() => setScrolled(scrollY > 40))

  // current chapter name in the header
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setChapter((e.target as HTMLElement).dataset.chapter || '') }), { rootMargin: '-45% 0px -54% 0px' })
    document.querySelectorAll('.gc [data-chapter]').forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  const toNext = (e: React.MouseEvent) => { e.preventDefault(); document.getElementById('next')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' }) }

  return (
    <div className={'hb gc' + (intro ? ' intro-on' : '')}>
      <style>{CSS + GC_CSS}</style>

      <header className={'gc-head' + (scrolled ? ' scrolled' : '') + (intro ? ' intro' : '')} aria-hidden={intro || undefined}>
        <div className="wrap gc-nav">
          <div className="nav-left">
            <a className="logo" href="#" aria-label="harbor, main page" tabIndex={intro ? -1 : undefined} onClick={goHome}>harbor</a>
          </div>
          <ChapterMeter chapters={CHAPTERS} chapter={chapter} intro={intro} scope=".gc" dark />
          <div className="nav-right">
            <a className="next-link" href="#next" tabIndex={intro ? -1 : undefined} onClick={toNext}>Next · Trust Bank →</a>
          </div>
        </div>
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

/* header: hidden during the full-screen intro, then fixed at the top; dark glass after scrolling */
.gc-head { position: fixed; inset: 0 0 auto 0; z-index: 50; color: #F2F0EC; border-bottom: 1px solid transparent;
  transition: background-color .35s, color .35s, border-color .35s, transform .45s cubic-bezier(.22,1,.36,1), opacity .3s; }
.gc-head.scrolled { background: rgba(17,17,20,.86); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); border-bottom-color: #2A2D31; }
.gc-head.intro { transform: translateY(calc(-100% - 4px)); opacity: 0; pointer-events: none; }
.gc-nav { height: 72px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; }
.gc-nav .nav-right { justify-content: flex-end; }
.gc .next-link { font-size: 16px; opacity: .8; transition: opacity .2s; }
.gc .next-link:hover { opacity: 1; }

/* no video controls (progress, time, sound) while the full-screen intro plays */
.gc.intro-on .gc4 .hv-controls { opacity: 0 !important; pointer-events: none !important; visibility: hidden; }

/* the pinned Final design showcase sits below the fixed header */
.gc .gc4 .g-show { padding-top: 96px; }

/* next project */
.gc .next { background: #17171B; color: #F2F0EC; border-top: 1px solid #2A2D31; }
.gc .next .eyebrow { color: #A7A9B0; }
.gc .next-card { display: flex; flex-direction: column; gap: 16px; padding: 140px 0; }
.gc .next-name { font-size: clamp(56px, 6vw, 112px); font-weight: 300; letter-spacing: -0.04em; line-height: 1; transition: transform .3s ease-out; }
.gc .next-card:hover .next-name { transform: translateX(8px); }

@media (max-width: 900px) {
  .gc-nav { grid-template-columns: 1fr auto; } .gc .next-link { display: none; }
}
`
