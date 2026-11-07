import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { GameCoveV4Body, GC4_CHAPTERS } from './GameCoveV4'
import { ChapterMeter } from './ChapterMeter'

// GameCove case study page for this site. The body (hero → reflection) is GameCoveV4.tsx (the same file Portfolio_1 uses),
// built from Figma "GameCove_v.4 · GameCove colors" in GameCove's own dark palette.
// Full-screen intro (same as the Trust Bank page): the page opens with the hero ad video filling the screen; the scroll cue is
// the [SCROLL] cursor (cursor.tsx). Scrolling one screen shrinks the video back into its place under the headline while the
// hero stays put, then the page scrolls on as normal. The header is hidden during the intro, then fixed at the top.
// Header: harbor → main page · chapter meter · Next · Trust Bank · Book a call. Same header bar as Trust Bank: the chapter
// meter (ChapterMeter.tsx, dark contents panel here) and no reading-progress line. The line cursor comes from index.tsx.
// GameCoveV4.tsx is left untouched: the intro is applied here to its hero (.g-hero) and video (.g-video) by style only —
//  - the hero is held in place by moving it down as far as the page has scrolled (up to one screen), with one screen of
//    space added under it;
//  - the video is scaled up from its own centre to cover the screen and clipped to the screen edges, easing back to
//    its normal size, place and 16px corners.
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

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

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

/** full-screen hero intro on GameCoveV4's hero (see the note at the top) */
function useHeroIntro(on: boolean) {
  useLayoutEffect(() => {
    if (!on) return
    const hero = document.querySelector<HTMLElement>('.gc .gc4 .g-hero')
    const vid = hero?.querySelector<HTMLElement>('.g-video') ?? null
    if (!hero || !vid) return
    const keep = {
      hero: { position: hero.style.position, zIndex: hero.style.zIndex, transform: hero.style.transform, marginBottom: hero.style.marginBottom },
      vid: { position: vid.style.position, zIndex: vid.style.zIndex, transition: vid.style.transition, opacity: vid.style.opacity, transform: vid.style.transform, clipPath: vid.style.clipPath, transformOrigin: vid.style.transformOrigin, willChange: vid.style.willChange },
    }
    hero.style.position = 'relative'
    hero.style.zIndex = '2'
    Object.assign(vid.style, { position: 'relative', zIndex: '3', transition: 'none', opacity: '1', transformOrigin: '50% 50%', willChange: 'transform, clip-path' })

    // the video's own place on the page (its rect with no intro styles, in page coordinates)
    let r0 = { l: 0, t: 0, w: 1, h: 1 }
    const measure = () => {
      const ht = hero.style.transform, vt = vid.style.transform, vc = vid.style.clipPath
      hero.style.transform = 'none'; vid.style.transform = 'none'; vid.style.clipPath = 'none'
      const b = vid.getBoundingClientRect()
      r0 = { l: b.left, t: b.top + scrollY, w: Math.max(1, b.width), h: Math.max(1, b.height) }
      hero.style.transform = ht; vid.style.transform = vt; vid.style.clipPath = vc
    }

    let raf = 0
    const draw = () => {
      raf = 0
      const vh = innerHeight, vw = document.documentElement.clientWidth, y = scrollY
      hero.style.marginBottom = `${vh}px`
      hero.style.transform = `translate3d(0, ${Math.min(y, vh)}px, 0)` // holds the hero still for one screen of scroll
      const p = clamp(y / vh), e = ease(p)
      const { l, t, w, h } = r0
      if (e >= 1) {
        vid.style.transform = ''
        vid.style.clipPath = ''
      } else {
        const S = Math.max(vw / w, vh / h) // scale that covers the screen
        const s = S + (1 - S) * e
        const tx = (vw / 2 - (l + w / 2)) * (1 - e)
        const ty = (vh / 2 - (t + h / 2)) * (1 - e)
        const visW = vw + (w - vw) * e, visH = vh + (h - vh) * e
        const ix = Math.max(0, (w - visW / s) / 2), iy = Math.max(0, (h - visH / s) / 2)
        vid.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${s.toFixed(4)})`
        vid.style.clipPath = `inset(${iy.toFixed(2)}px ${ix.toFixed(2)}px round ${((RADIUS * e) / s).toFixed(2)}px)`
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw) }
    const onResize = () => { measure(); onScroll() }
    measure()
    draw()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onResize)
    // fonts / images can move the hero a little after the first paint
    const t1 = window.setTimeout(onResize, 300), t2 = window.setTimeout(onResize, 1200)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onResize)
      window.clearTimeout(t1); window.clearTimeout(t2)
      if (raf) cancelAnimationFrame(raf)
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
  useHeroIntro(introOn)

  // dark glass after scrolling, and no header at all while the full-screen intro plays
  useOnScroll(() => {
    const y = scrollY
    setScrolled(y > 40)
    setIntro(introOn && y < innerHeight - 2)
  })

  // current chapter name in the header
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setChapter((e.target as HTMLElement).dataset.chapter || '') }), { rootMargin: '-45% 0px -54% 0px' })
    document.querySelectorAll('.gc [data-chapter]').forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  const toNext = (e: React.MouseEvent) => { e.preventDefault(); document.getElementById('next')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' }) }

  return (
    <div className="hb gc">
      <style>{CSS + GC_CSS}</style>

      <header className={'gc-head' + (scrolled ? ' scrolled' : '') + (intro ? ' intro' : '')} aria-hidden={intro || undefined}>
        <div className="wrap gc-nav">
          <div className="nav-left">
            <a className="logo" href="#" aria-label="harbor, main page" tabIndex={intro ? -1 : undefined} onClick={goHome}>harbor</a>
          </div>
          <ChapterMeter chapters={CHAPTERS} chapter={chapter} intro={intro} scope=".gc" dark />
          <div className="nav-right">
            <a className="next-link" href="#next" tabIndex={intro ? -1 : undefined} onClick={toNext}>Next · Trust Bank →</a>
            <a className="btn-sm" href={LINKS.cal} target="_blank" rel="noreferrer" tabIndex={intro ? -1 : undefined}>Book a call</a>
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
.gc .gc-head .btn-sm { background: #F2F0EC; color: #111114; }

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
