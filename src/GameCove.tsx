import React, { useLayoutEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { GameCoveV4Body, GC4_CHAPTERS } from './GameCoveV4'
import { SideToc, useHeadroom } from './CaseNav'
import { SiteHeaderB } from './SiteHeaderB'

// GameCove case study page for this site. The body (hero → reflection) is GameCoveV4.tsx (the same file Portfolio_1 uses),
// built from Figma "GameCove_v.4 · GameCove colors" in GameCove's own dark palette.
// Full-screen intro (like the Trust Bank page): the page opens with the hero ad video filling the screen. After 5 seconds
// (HOLD_MS, Harbor's call for GameCove; Trust Bank holds 2.5s) it moves on its own — no scrolling needed — quickly back
// into its place under the headline over ANIM_MS, easing in and out. Scrolling, swiping or a key press during the hold
// starts the move straight away; the page can't scroll until the video has settled. The normal line cursor from
// index.tsx is used throughout.
// One clean appearance: during the intro the video box is dark (no white box) and the poster is left out, so the screen
// goes dark → video once instead of white → poster → video. The video fades in when it actually starts playing, and the
// 5-second hold counts from that moment (fallback 2.5s on a slow connection, then the poster comes back).
// Trust Bank also warms the browser cache with this video, so arriving from there it starts straight away.
// The page jumps to the top instantly before measuring the video (not the site's smooth scroll), stays there during the
// intro, and measures the video's place again right before it moves.
// While the intro runs the video's controls (progress, play/pause, time, sound) are hidden (.intro-on); afterwards they
// show on hover as before.
// Corners: everything in the GameCove body is square (0px), Harbor's call — the hero video, images, boards, cards, panels,
// pills, buttons, steps, the Final design flip cards, bars and the video slider (GC_CSS). The images themselves had rounded
// corners baked in; those files were squared in Harbor-K/landing_page (gamecove/assets).
// One exception: the "Spacing & radius" token samples in the Design system section keep their radius, because they show
// GameCove's radius tokens (2, 4, 8, 16px, full).
// Header (v78): the site header every page uses (SiteHeaderB.tsx) in its 'dark' mode for GameCove's dark page — hidden
// during the intro; after that it slides away while scrolling down and comes back on scrolling up (useHeadroom), as before.
// Project order: Trust Bank → GameCove → UTrada → Trust Bank (the "Next case study" card at the bottom).
// Process contents on the left side (CaseNav.tsx, Notion-style, dark variant).
// GameCoveV4.tsx is left untouched: the intro is applied here to its video (.g-video) by style only — the video is scaled
// up from its own centre to cover the screen and clipped to the screen edges, easing back to its normal size and place.
// Reduced motion: no intro.

const NEXT = { name: 'UTrada', href: '#/utrada' }
const LINKS = {
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
  linkedin: 'https://www.linkedin.com/in/harborkim/',
  instagram: 'https://instagram.com/harbor_0328',
  email: 'mailto:harborkim0328@gmail.com',
}
const RADIUS = 0 // square corners like the rest of the site
const HOLD_MS = 5000
const ANIM_MS = 1000
const WAIT_MS = 2500 // longest wait for the video to start before the hold begins anyway
const DARK = '#0B0B0D'

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
// quart in-out: quick through the middle, soft at both ends
const ease = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2)
const jumpTop = () => scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })

/** timed full-screen intro on GameCoveV4's hero video (see the note at the top); calls onDone when it has settled */
function useHeroIntro(on: boolean, onDone: () => void) {
  const done = useRef(onDone); done.current = onDone
  useLayoutEffect(() => {
    if (!on) { done.current(); return }
    const hero = document.querySelector<HTMLElement>('.gc .gc4 .g-hero')
    const vid = hero?.querySelector<HTMLElement>('.g-video') ?? null
    if (!hero || !vid) { done.current(); return }
    const media = vid.querySelector('video')
    const keepPoster = media?.getAttribute('poster') ?? null
    const keep = {
      hero: { position: hero.style.position, zIndex: hero.style.zIndex },
      vid: { position: vid.style.position, zIndex: vid.style.zIndex, transition: vid.style.transition, opacity: vid.style.opacity, transform: vid.style.transform, clipPath: vid.style.clipPath, transformOrigin: vid.style.transformOrigin, willChange: vid.style.willChange, background: vid.style.background },
    }
    hero.style.position = 'relative'
    hero.style.zIndex = '2'
    Object.assign(vid.style, { position: 'relative', zIndex: '3', transition: 'none', opacity: '1', transformOrigin: '50% 50%', willChange: 'transform, clip-path', background: DARK })
    // dark until the video really plays, then one soft fade in (no white box, no poster swap)
    if (media) {
      media.removeAttribute('poster')
      media.style.transition = 'opacity .5s ease'
      media.style.opacity = '0'
    }
    const showMedia = () => { if (media) media.style.opacity = '1' }
    const restoreMedia = () => {
      if (!media) return
      media.style.opacity = ''
      media.style.transition = ''
      if (keepPoster && !media.getAttribute('poster')) media.setAttribute('poster', keepPoster)
    }

    const root = document.documentElement
    const keepRoot = { overflow: root.style.overflow, gutter: root.style.getPropertyValue('scrollbar-gutter') }
    jumpTop() // straight to the top, not the site's smooth scroll
    root.style.overflow = 'hidden' // no scrolling until the video has settled
    root.style.setProperty('scrollbar-gutter', 'stable')

    // the video's own place in the page (its rect with no intro styles, plus the scroll offset)
    let r0 = { l: 0, t: 0, w: 1, h: 1 }
    const measure = () => {
      const vt = vid.style.transform, vc = vid.style.clipPath
      vid.style.transform = 'none'; vid.style.clipPath = 'none'
      const b = vid.getBoundingClientRect()
      r0 = { l: b.left, t: b.top + scrollY, w: Math.max(1, b.width), h: Math.max(1, b.height) }
      vid.style.transform = vt; vid.style.clipPath = vc
    }
    const apply = (e: number) => {
      const vh = innerHeight, vw = document.documentElement.clientWidth
      const { l, w, h } = r0
      const t = r0.t - scrollY
      const S = Math.max(vw / w, vh / h) // scale that covers the screen
      const s = S + (1 - S) * e
      const tx = (vw / 2 - (l + w / 2)) * (1 - e)
      const ty = (vh / 2 - (t + h / 2)) * (1 - e)
      const visW = vw + (w - vw) * e, visH = vh + (h - vh) * e
      const ix = Math.max(0, (w - visW / s) / 2), iy = Math.max(0, (h - visH / s) / 2)
      vid.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${s.toFixed(4)})`
      vid.style.clipPath = `inset(${iy.toFixed(2)}px ${ix.toFixed(2)}px round ${((RADIUS * e) / s).toFixed(2)}px)`
    }

    // the hold starts when the video is actually playing (so the 5s are all video), not when the page opens
    let animStart = Infinity
    let raf = 0, finished = false, remeasured = false
    const startHold = () => { showMedia(); if (animStart === Infinity) animStart = performance.now() + HOLD_MS }
    const skip = () => { showMedia(); const now = performance.now(); if (now < animStart) animStart = now }
    const onResize = () => measure()
    // slow connection: stop waiting, bring the poster back and start the hold anyway
    const tWait = window.setTimeout(() => {
      if (media && media.paused && keepPoster && !media.getAttribute('poster')) media.setAttribute('poster', keepPoster)
      startHold()
    }, WAIT_MS)
    media?.addEventListener('playing', startHold)
    if (media && !media.paused && media.readyState >= 3) startHold()
    // fonts / images can move the hero a little after the first paint
    const t1 = window.setTimeout(measure, 300), t2 = window.setTimeout(measure, 1200)
    const unlock = () => {
      root.style.overflow = keepRoot.overflow
      if (keepRoot.gutter) root.style.setProperty('scrollbar-gutter', keepRoot.gutter)
      else root.style.removeProperty('scrollbar-gutter')
      removeEventListener('wheel', skip); removeEventListener('touchmove', skip); removeEventListener('keydown', skip)
      removeEventListener('resize', onResize)
      media?.removeEventListener('playing', startHold)
      window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(tWait)
    }
    const finish = () => {
      finished = true
      vid.style.transform = ''
      vid.style.clipPath = ''
      unlock()
      restoreMedia()
      done.current()
    }
    const frame = (now: number) => {
      if (scrollY !== 0) jumpTop() // stay at the top while the intro runs
      if (!remeasured && now >= animStart) { remeasured = true; measure() } // exact place right before the move
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
      restoreMedia()
      Object.assign(hero.style, keep.hero)
      Object.assign(vid.style, keep.vid)
    }
  }, [on])
}

export function GameCove() {
  const [introOn] = useState(() => !reducedMotion())
  const [intro, setIntro] = useState(introOn)
  const away = useHeadroom()

  useHeroIntro(introOn, () => setIntro(false))

  return (
    <div className={'hb gc' + (intro ? ' intro-on' : '')}>
      <style>{CSS + GC_CSS}</style>

      <SiteHeaderB mode="dark" hidden={intro} away={away} />

      <SideToc chapters={GC4_CHAPTERS} scope=".gc" hidden={intro} dark />

      <main>
        <GameCoveV4Body />

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
    </div>
  )
}

const GC_CSS = `
.gc { background: #111114; }

/* no video controls (progress, time, sound) while the full-screen intro plays */
.gc.intro-on .gc4 .hv-controls { opacity: 0 !important; pointer-events: none !important; visibility: hidden; }

/* square corners on everything in the GameCove body (Harbor: 0px everywhere) — hero video (dark box, never white), images,
   boards, cards, panels, scenario, HMW, notes, feature list, flip cards, pills, steps, buttons, bars and the video slider.
   Only the "Spacing & radius" token samples (.g-radii i) keep their radius, since they show GameCove's radius tokens. */
.gc .gc4 .g-banner { background: ${DARK}; }
.gc .gc4 *:not(.g-radii i), .gc .gc4 *::before, .gc .gc4 *::after { border-radius: 0 !important; }
.gc .gc4 input[type=range]::-webkit-slider-thumb { border-radius: 0 !important; }
.gc .gc4 input[type=range]::-moz-range-thumb { border-radius: 0 !important; }

/* the pinned Final design showcase sits below the fixed header */
.gc .gc4 .g-show { padding-top: 96px; }

/* next project */
.gc .next { background: #17171B; color: #F2F0EC; border-top: 1px solid #2A2D31; }
.gc .next .eyebrow { color: #A7A9B0; }
.gc .next-card { display: flex; flex-direction: column; gap: 16px; padding: 140px 0; }
.gc .next-name { font-size: clamp(56px, 6vw, 112px); font-weight: 300; letter-spacing: -0.04em; line-height: 1; transition: transform .3s ease-out; }
.gc .next-card:hover .next-name { transform: translateX(8px); }
`
