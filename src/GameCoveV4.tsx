import React, { useEffect, useRef, useState } from 'react'
import { Ideate, Iterate, Reflection, PARTS_CSS } from './GameCoveParts'

/**
 * GameCove case study — body built from Figma "GameCove_v.4 · GameCove colors" (node 1270:562,
 * file 44기 김지현 4차 랜딩페이지): GameCove's own dark palette (canvas #111114, card #17171B, line #2A2D31,
 * sand text #F2F0EC, data blue #3898F8, AI light-blue #B3D1FF, exit coral #EF7085).
 * Self-contained (own CSS under .gc4, no Tailwind) so the same file runs on both portfolio sites; each site wraps it
 * with its own header, next-case card and footer.
 *
 * Scroll interactions follow the Trust Bank page:
 *  - soft block reveal as each block enters (1.2s, staggered)
 *  - numbers count up as they scroll in (impact, design-system stats, SUS)
 *  - HMW questions bounce in one after another
 *  - Final design: pinned tour of the live prototype — tabs 01–03 across the top, each scroll step dims the screen,
 *    lights one area and shows a short caption; then one live screen with its design tokens labelled
 *  - What we're fixing: each fix card flips Before → After in 3D as it reaches the middle of the screen
 *  - hover magnifier on dense boards (journey map, reviews, affinity map, components)
 * Text: Helvetica Neue everywhere, 16px minimum.
 * Hero media: the 15s ad video (HERO_VIDEO) — autoplays muted with Trust Bank-style controls (unmute, volume, progress).
 *
 * v124 (Harbor, Nov 14): copy, buttons and images from Figma "04 GameCove — 1921" (869:3104, file 44기 김지현-4차 PF);
 * the page keeps its own spacing. Hero video unchanged. Process = title on the left + isometric stage map (each stage
 * rings in turn, then a dot runs the Iterate arc). Empathize = sticky scroll: 01 / 02 / 03 open one at a time with the
 * matching board on the right. Define = affinity strip → 3 insight rows → Lucas's story → HMW with 3 questions.
 * Ideate = user flow + lo-fi wireframes + team photo (photo is a stand-in until Harbor's drawing video). The separate
 * Prototype section is gone (Figma): "Prototype · Final design" is one light section; its tour keeps every caption in
 * the top-left corner on a solid card with more contrast (Palantir AIP "Beyond Chat"). Test and Reflection unchanged.
 * New images: Harbor-K/harbor-pf assets/gamecove/v5/.
 *
 * v125 (Harbor, Nov 14 evening, Figma 1921 red-box notes): Process rings run faster (4.2s loop). Research question box
 * now says where it started (Roblox). Interview step 03 gets the "both sides on purpose" line and the new panel. Define
 * insights are 3 cards (icon, label, title, one quote); Lucas caption updated; spacing in Empathize/Define follows
 * Figma. Final design: step 02·B shows the rebuilt Retention screen so the charts read; the design system is the
 * Primitive → Semantic → Component map. New Iterate section after Test (round 2 with P2) — no session video and no
 * card sort yet (Harbor will add the video later).
 *
 * v126 (Harbor, Nov 14 night, Figma 1921 rebuilt): Process is a still picture again (no ringing, no Turning point chips).
 * Ideate, Test · Iterate and Reflection now live in GameCoveParts.tsx: the user flow hands each step to its lo-fi
 * wireframe as you scroll; the Test section is folded into Iterate as in Figma (round 2 video, findings, card sort);
 * Reflection is light (#FAFAF9) with the team photo.
 *
 * v129 (Harbor, Nov 14 22:53): "Where Lucas gets stuck" uses the same heading size as "Interview affinity map" above it
 * (32/40). Lucas's 6-panel story is Harbor's motion version (Figma user-story · motion v2 · 960, her GIF), shown at
 * 960×640 so it reads at a glance; it plays as a looping muted MP4 (1.5 MB instead of the 9.8 MB GIF), the last frame
 * (all 6 panels) is the poster, and with reduced motion it stays on that frame.
 */

const L = 'https://raw.githubusercontent.com/Harbor-K/landing_page/main/gamecove/assets/'
const V = L + 'v4/'
// Hero motion: the 15s ad (Figma "Hero banner · gamecove" + synthesised music/SFX). Starts muted, like the Trust Bank hero.
export const HERO_VIDEO = V + 'hero-ad.mp4'
// "View dashboard": opens the vibe-coded GameCove prototype (sample game BounceBounce).
export const VIBE_URL = 'https://game-cove.vercel.app/projects/bouncebounce/overview'

const IMG = {
  logo: L + 'logo.png',
  poster: V + 'hero-ad-poster.jpg',
}

// v124 images (Figma 04 GameCove — 1921, exported at 2x)
const V5 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/gamecove/v5/'
const IMG5 = {
  process: V5 + 'process-2.webp',
  emp: [V5 + 'emp-1.webp', V5 + 'emp-2.webp', V5 + 'emp-3b.webp'],
  affinity: V5 + 'affinity-strip.webp',
  insight: [V5 + 'insight-1.png', V5 + 'insight-2.png', V5 + 'insight-3.png'],
  story: V5 + 'story.webp',
  storyVideo: V5 + 'story.mp4', storyPoster: V5 + 'story-poster.webp', // v129: Harbor's motion version, 960×640
  sketch: [1, 2, 3, 4, 5, 6, 7, 8].map(n => V5 + `sketch-${n}.webp`),
  photo: V5 + 'photo.webp',
  retention: V5 + 'retention.webp',
  dsMap: V5 + 'ds-map.webp',
  iterBefore: V5 + 'iter-before.webp', iterAfter: V5 + 'iter-after.webp',
}

export const GC4_CHAPTERS = ['Overview', 'Process', 'Empathize', 'Define', 'Ideate', 'Prototype', 'Iterate', 'Reflection']

/* ---------- helpers ---------- */

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

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

/** 0 → 1 as the element scrolls from the bottom of the screen up to its middle (eased) */
function useCountProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [p, setP] = useState(0)
  useOnScroll(() => {
    if (reducedMotion()) { setP(1); return }
    const el = ref.current; if (!el) return
    const t = clamp((innerHeight - el.getBoundingClientRect().top) / (innerHeight * 0.5))
    setP(1 - (1 - t) * (1 - t))
  })
  return [ref, p] as const
}

/** counts up with p, keeping the target's decimals (85.5) */
const count = (target: number, p: number) => (target * p).toFixed((String(target).split('.')[1] || '').length)

/** true once the element has scrolled into view */
function useShownOnce<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (reducedMotion() || !('IntersectionObserver' in window)) { setShown(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } }, { threshold })
    io.observe(el); return () => io.disconnect()
  }, [threshold])
  return [ref, shown] as const
}

/** hover magnifier for images marked data-gzoom (same feel as the Trust Bank page) */
function useMagnifier(rootRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || !matchMedia('(pointer: fine)').matches || reducedMotion()) return
    type Z = { s: number; ts: number; ox: number; oy: number; tox: number; toy: number }
    const HOVER_SCALE = 1.8
    const zooms = new Map<HTMLImageElement, Z>()
    let active: HTMLImageElement | null = null, raf = 0
    const local = (img: HTMLImageElement, z: Z | undefined, cx: number, cy: number) => {
      const r = img.getBoundingClientRect(), s = z?.s ?? 1, ox = z?.ox ?? 0, oy = z?.oy ?? 0
      const bl = r.left - ox * (1 - s), bt = r.top - oy * (1 - s)
      return { x: clamp(cx - bl, 0, img.offsetWidth), y: clamp(cy - bt, 0, img.offsetHeight) }
    }
    const release = () => { if (active) { const z = zooms.get(active); if (z) z.ts = 1 } active = null }
    const onMove = (e: PointerEvent) => {
      const img = (e.target as HTMLElement)?.closest?.('img') as HTMLImageElement | null
      if (img && root.contains(img) && img.dataset.gzoom === 'true') {
        if (active !== img) { release(); active = img }
        let z = zooms.get(img)
        const p = local(img, z, e.clientX, e.clientY)
        if (!z) { z = { s: 1, ts: HOVER_SCALE, ox: p.x, oy: p.y, tox: p.x, toy: p.y }; zooms.set(img, z); img.style.transition = 'none'; img.style.willChange = 'transform, clip-path' }
        z.ts = HOVER_SCALE; z.tox = p.x; z.toy = p.y
      } else release()
    }
    const clear = (img: HTMLImageElement) => { img.style.transform = ''; img.style.transformOrigin = ''; img.style.clipPath = ''; img.style.transition = ''; img.style.willChange = '' }
    const tick = () => {
      zooms.forEach((z, img) => {
        z.s += (z.ts - z.s) * 0.14; z.ox += (z.tox - z.ox) * 0.2; z.oy += (z.toy - z.oy) * 0.2
        if (z.ts === 1 && z.s < 1.002) { clear(img); zooms.delete(img); return }
        const w = img.offsetWidth, h = img.offsetHeight, k = 1 - 1 / z.s
        img.style.transformOrigin = `${z.ox}px ${z.oy}px`
        img.style.transform = `scale(${z.s})`
        img.style.clipPath = `inset(${z.oy * k}px ${(w - z.ox) * k}px ${(h - z.oy) * k}px ${z.ox * k}px)`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    addEventListener('pointermove', onMove, { passive: true }); document.addEventListener('mouseleave', release)
    return () => { cancelAnimationFrame(raf); removeEventListener('pointermove', onMove); document.removeEventListener('mouseleave', release); zooms.forEach((_, img) => clear(img)); zooms.clear() }
  }, [rootRef])
}

/* ---------- small pieces ---------- */

type Sq = 'grey' | 'blue' | 'sky'
function Eyebrow({ label, sq = 'grey' }: { label: string; sq?: Sq }) {
  return <div className={'g-eyebrow sq-' + sq}><i aria-hidden="true" />{label}</div>
}
function H2({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={'g-h2 ' + className}>{children}</h2>
}
const d = (n: number) => ({ '--d': n } as React.CSSProperties)

/* ---------- hero video with sound controls (same as the Trust Bank hero) ---------- */

const fmt = (t: number) => (!isFinite(t) ? '0:00' : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`)

/** autoplays muted on loop; play/pause, progress, time and volume; controls show for 3s, then on hover/focus */
function SoundMotion() {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [volume, setVolume] = useState(0.5)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [intro, setIntro] = useState(true)
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const show = intro || hover || focus
  useEffect(() => {
    const v = ref.current; if (!v) return
    v.volume = 0.5; v.muted = true; v.play().catch(() => {})
    const t = setTimeout(() => setIntro(false), 3000)
    return () => clearTimeout(t)
  }, [])
  const togglePlay = () => { const v = ref.current; if (!v) return; if (v.paused) v.play().catch(() => {}); else v.pause() }
  const toggleMute = () => { const v = ref.current; if (!v) return; v.muted = !v.muted; if (!v.muted && v.volume === 0) v.volume = 0.5; setMuted(v.muted); setVolume(v.volume) }
  const changeVolume = (val: number) => { const v = ref.current; if (!v) return; v.volume = val; v.muted = val === 0; setVolume(val); setMuted(v.muted) }
  const seek = (val: number) => { const v = ref.current; if (!v || !duration) return; v.currentTime = val; setTime(val) }
  const shownVolume = muted ? 0 : volume
  const pct = duration ? (time / duration) * 100 : 0
  return (
    <div className="g-banner g-video" data-r onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setFocus(true)} onBlurCapture={() => setFocus(false)}>
      <video ref={ref} src={HERO_VIDEO} poster={IMG.poster} muted loop playsInline preload="auto"
        aria-label="GameCove ad: Overview, AI mapping, Retention and the AI agent, ending on Decide what to fix next"
        onClick={togglePlay} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onTimeUpdate={e => setTime(e.currentTarget.currentTime)} onLoadedMetadata={e => setDuration(e.currentTarget.duration)} />
      <div className={'hv-controls' + (show ? ' show' : '')}>
        <input type="range" min={0} max={duration || 0} step={0.01} value={time} onChange={e => seek(Number(e.target.value))}
          aria-label="Video progress" className="g-range wide" style={{ '--fill': `${pct}%` } as React.CSSProperties} />
        <div className="hv-row">
          <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} className="hv-btn">
            {playing
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" /></svg>}
          </button>
          <span className="hv-time">{fmt(time)} / {fmt(duration)}</span>
          <div className="hv-vol">
            <button type="button" onClick={toggleMute} aria-label={muted ? 'Turn sound on' : 'Mute'} className="hv-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" />
                {shownVolume === 0
                  ? <><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></>
                  : <><path d="M15.5 8.5a5 5 0 0 1 0 7" />{shownVolume > 0.5 && <path d="M19 5a10 10 0 0 1 0 14" />}</>}
              </svg>
            </button>
            <input type="range" min={0} max={1} step={0.01} value={shownVolume} onChange={e => changeVolume(Number(e.target.value))}
              aria-label="Volume" className="g-range vol" style={{ '--fill': `${shownVolume * 100}%` } as React.CSSProperties} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- hero ---------- */

function Hero() {
  return (
    <section className="g-hero" id="top" data-chapter="GameCove">
      <div className="g-wrap">
        <div data-r>
          <img className="g-logo" src={IMG.logo} alt="GameCove" />
          <h1 className="g-h1">Helping beginner game creators<br />decide what to fix next</h1>
          <p className="g-lead">An AI analytics dashboard that maps the game, then shows where players quit<br />GameCove · Product design case study</p>
          {VIBE_URL && <a className="g-btn5" href={VIBE_URL} target="_blank" rel="noreferrer">View dashboard<span className="sr-only"> (opens in a new tab)</span></a>}
        </div>
        {HERO_VIDEO
          ? <SoundMotion />
          : <div className="g-banner" data-r><img src={IMG.poster} alt="GameCove Overview dashboard: new players dropped 61.3% this week, daily active users falling to 134" /></div>}
        <div className="g-meta">
          <div data-r style={d(0)}><div className="g-k">TIMELINE</div><p>9 weeks<br />August – October 2026</p></div>
          <div data-r style={d(1)}><div className="g-k">TEAM &amp; ROLE</div><p>2 product designers<br />I designed the UI and charts, built the design system, and planned and scored the usability test.<br />Together: AI agent design</p></div>
          <div data-r style={d(2)}><div className="g-k">PLATFORM</div><p>Desktop web · Game analytics<br />AI agent</p></div>
        </div>
      </div>
    </section>
  )
}

/* ---------- overview ---------- */

function Overview() {
  const [ref, p] = useCountProgress<HTMLDivElement>()
  return (
    <section className="g-sec" data-chapter="Overview">
      <div className="g-wrap">
        <div data-r><Eyebrow label="OVERVIEW" /></div>
        <div className="g-ov" data-r>
          <h3 className="g-ov-k">The problem</h3>
          <p className="g-body">Beginner game creators can now build a game with AI. But when players start leaving, they can’t tell why. Dashboards show how many left, not where. They could record any moment, but don’t know which ones matter. So they guess, fix the wrong part, and players keep leaving. All they want to know is what to fix.</p>
        </div>
        <div className="g-ov" data-r>
          <h3 className="g-ov-k">Solution</h3>
          <p className="g-body">GameCove’s AI reads the game and maps its levels. The game creator checks the map and picks a goal, and GameCove suggests what to record. The dashboard then shows the 2–3 changes that matter most, so the game creator knows what to fix first. An AI agent explains anything unclear in plain words.</p>
        </div>
        <div className="g-ov" data-r>
          <h3 className="g-ov-k">Impact</h3>
          <div className="g-stats" ref={ref}>
            <div><div className="g-num">{count(85.5, p)}</div><div className="g-cap">Ease of use · 5 testers (A+)</div></div>
            <div><div className="g-num">{Math.round(2 * p)} of 3</div><div className="g-cap">Hidden test problems found</div></div>
            <div><div className="g-num">{Math.round(3 * p)} of 3</div><div className="g-cap">Main testers suggested a fix</div></div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- process: title left, isometric stage map right ---------- */

function Process() {
  return (
    <section className="g-sec" data-chapter="Process">
      <div className="g-wrap">
        <div className="g-proc">
          <div data-r>
            <Eyebrow label="PROCESS" />
            <H2 className="mt-40">5 stages,<br />2 turning points</H2>
            <p className="g-body mt-24 mute">We changed direction twice and tested twice. Each step shows what we did and what changed.</p>
          </div>
          <figure className="g-proc-map" data-r style={d(1)}>
            <img src={IMG5.process} alt="Design thinking process: Empathize, Define, Ideate, Prototype and Test. An Iterate arrow loops from Test back to Prototype: fix, then test again." loading="lazy" />
          </figure>
        </div>
      </div>
    </section>
  )
}

/* ---------- empathize: sticky scroll, 01 / 02 / 03 open one at a time ---------- */

const EMP: { t: string; h: React.ReactNode; lead?: string; p: string; img: number; cap: string; alt: string }[] = [
  { t: 'What game creators wrote', h: <>They know something is wrong,<br />but not where</>, p: 'Game creators saw their numbers drop but couldn’t tell why. So they asked the community and changed many things at once.',
    img: 0, cap: 'Our analysis board of the 27 game creator posts.', alt: 'Analysis board of 27 game creator posts: what they want, how they read data today, what they still want to know and what they asked on the forum, with quotes and an insight note' },
  { t: 'What players wrote', h: <>Players leave before saying why</>, p: 'Players decide in the first few minutes. Their reviews rarely say where or why they quit.',
    img: 1, cap: 'Our analysis board of the player posts.', alt: 'A player’s forum review: the game feels dull and there is no reason to stay, but it doesn’t say where they quit' },
  { t: 'What interviews showed', h: <>They fix first, and check later</>,
    lead: 'We talked to both sides on purpose. The teens showed us what beginners don’t know. The game developer knows what data matters, so we asked what a beginner needs first.',
    p: 'They have a goal, but can’t turn it into a question. A game developer linked the goal, the question, the behaviour to watch, and the data to log from the start.',
    img: 2, cap: '', alt: 'Remote interview video calls: 2 teen game creators, who show what beginners miss, and 1 game developer, who knows what data to check. Participants’ faces are blurred' },
]

function EmpItem({ i, on, onPick, narrow = false }: { i: number; on: boolean; onPick?: () => void; narrow?: boolean }) {
  const e = EMP[i]
  return (
    <div className={'emp-item' + (on ? ' on' : '')}>
      <button type="button" className="emp-head" onClick={onPick} aria-expanded={on} tabIndex={narrow ? -1 : 0}>
        <span className="n">0{i + 1}</span><span className="t">{e.t}</span>
      </button>
      <div className="emp-body"><div>
        <h3 className="emp-h">{e.h}</h3>
        {e.lead && <p className="emp-lead">{e.lead}</p>}
        <p className="emp-p">{e.p}</p>
        {narrow && <div className="emp-panel mt-24"><EmpVisual i={i} /></div>}
      </div></div>
    </div>
  )
}

function EmpVisual({ i }: { i: number }) {
  const e = EMP[i]
  return (
    <figure className="emp-vis">
      <img src={IMG5.emp[e.img]} alt={e.alt} loading="lazy" />
      {e.cap && <figcaption className="g-cap">{e.cap}</figcaption>}
    </figure>
  )
}

function EmpScroll() {
  const outer = useRef<HTMLDivElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const N = EMP.length
  useOnScroll(() => {
    const el = outer.current, p = pin.current; if (!el || !p) return
    const top = parseFloat(getComputedStyle(p).top) || 0
    const travel = el.offsetHeight - p.offsetHeight
    if (travel <= 0) return
    const f = clamp((top - el.getBoundingClientRect().top) / travel)
    const s = Math.min(N - 1, Math.floor(f * N))
    setStep(v => (v === s ? v : s))
  })
  const jump = (i: number) => {
    const el = outer.current, p = pin.current; if (!el || !p) return
    const top = parseFloat(getComputedStyle(p).top) || 0
    const travel = el.offsetHeight - p.offsetHeight
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - top + travel * ((i + 0.5) / N), behavior: reducedMotion() ? 'auto' : 'smooth' })
  }
  return (
    <>
      <div ref={outer} className="emp-outer mt-56" style={{ height: `calc(560px + ${N * 70}vh)` }}>
        <div ref={pin} className="emp-pin">
          <div className="emp-list">
            {EMP.map((_, i) => <EmpItem key={i} i={i} on={i === step} onPick={() => jump(i)} />)}
          </div>
          <div className="emp-panel">
            {EMP.map((_, i) => <div key={i} className={'emp-layer' + (i === step ? ' on' : '')} aria-hidden={i !== step}><EmpVisual i={i} /></div>)}
          </div>
        </div>
      </div>
      {/* small screens: all three open, one after another */}
      <div className="emp-narrow mt-40">
        {EMP.map((_, i) => <div key={i} data-r><EmpItem i={i} on narrow /></div>)}
      </div>
    </>
  )
}

function Empathize() {
  return (
    <section className="g-sec" data-chapter="Empathize">
      <div className="g-wrap">
        <div data-r className="w-760">
          <Eyebrow label="EMPATHIZE" />
          <H2 className="mt-40">Making a game got easy.<br />Fixing it didn’t.</H2>
          <p className="g-body mt-24">AI tools made it easy for anyone to build a game. We wanted to know what gets hard after launch, when real players arrive.</p>
        </div>
        <div className="g-rq mt-56" data-r>
          <div className="g-k cyan">RESEARCH QUESTION</div>
          <p className="rq-q">What stops beginner game creators from improving their game after launch?</p>
          <p className="rq-origin">It started on <b>Roblox</b>, where anyone can make games. Its creator forum kept asking: <b>players leave, but why?</b></p>
        </div>
        <EmpScroll />
      </div>
    </section>
  )
}

/* ---------- define ---------- */

const INSIGHTS = [
  { t: 'Dashboards only tell them something is wrong', q: 'Saw an 80% drop-off and knew the game had a problem.', notes: ['Saw an 80% drop-off on the dashboard and knew the game had a problem.', 'Checked player count and when players left in the game’s analytics.', 'Used badges as a stand-in to see where players stopped.'] },
  { t: 'Once a cause looks likely, they fix it first', q: 'Two years later, still not sure why players leave early.', notes: ['Added a tutorial to cut early drop-off.', 'Felt the tutorial helped, and guessed why.', 'Two years later, still not sure why players leave early.'] },
  { t: 'They can’t ask the players who left', q: 'A thumbs-down with no reason is the hardest to act on.', notes: ['No chance to ask players why they left.', 'A thumbs-down with no reason is the hardest to act on.', 'AI reports explained the numbers, but missed the context.'] },
]

const QUESTIONS = [
  { k: 'A', t: 'How do we collect data?', p: 'Lucas didn’t know which moments in Ball Rush to track.', a: 'AI Mapping + goal-based tracking' },
  { k: 'B', t: 'How do we show it?', p: 'Deaths, resets, progress, clicks… Lucas would see it all at once.', a: 'Goal-based analysis board' },
  { k: 'C', t: 'How do we help them read it?', p: 'Lucas saw “61% left” but couldn’t tell what to fix first.', a: 'AI briefing + AI agent' },
]

function Define() {
  return (
    <section className="g-sec" data-chapter="Define">
      <div className="g-wrap">
        <div data-r className="w-760">
          <Eyebrow label="DEFINE" sq="blue" />
          <H2 className="mt-40">The problem wasn’t reading data.<br />It was knowing what to check.</H2>
          <p className="g-body mt-24">Roblox already lets creators track each stage with funnels and custom events. Beginners didn’t use them. Not because the tool was missing, but because they didn’t know what to track.</p>
        </div>

        <h3 className="g-h3l mt-40" data-r>Interview affinity map</h3>
        <div className="g-aff mt-40" data-r>
          <img src={IMG5.affinity} alt="Interview affinity map: sticky notes from our interviews, grouped into 3 insights" loading="lazy" />
        </div>
        <div className="g-insc mt-40">
          {INSIGHTS.map((s, i) => (
            <div className="insc" key={i} data-r style={d(i)}>
              <img src={IMG5.insight[i]} alt="" aria-hidden="true" />
              <div className="insc-k">INSIGHT 0{i + 1}</div>
              <h4 className="insc-t">{s.t}</h4>
              <p className="insc-q">“{s.q}”</p>
            </div>
          ))}
        </div>

        <div className="mt-40" data-r>
          <h3 className="g-h3l">Where Lucas gets stuck</h3>
          <p className="g-cap mt-8">Lucas is our persona, built from our interviews with 2 teen game creators. His game and numbers are examples.</p>
        </div>
        <div className="g-story mt-40" data-r>
          <video src={IMG5.storyVideo} poster={IMG5.storyPoster} autoPlay={!reducedMotion()} muted loop playsInline preload="metadata" aria-label="User story in 6 panels: 1 Launch day — my game is live. 2 Players leave — players left 62%. 3 Only totals — average playtime 4 min, drop-off 62%; it doesn’t say where. 4 Asking around — everyone says something different. 5 Fix everything — lower difficulty, new music, faster ball. 6 Nothing changed — players left 61%; what should I fix first?" />
        </div>

        <div className="g-hmw5 mt-40" data-r>
          <div className="g-k sky">HOW MIGHT WE</div>
          <p className="hmw5-q mt-16">Help game creators who are new to data find evidence fast,<br />and make better update decisions?</p>
          <p className="hmw5-p mt-16">We tackled one problem first: game creators can’t see what players actually do in their game. Asking players why comes later.</p>
          <hr />
          <Bounce className="hmw5-qs" step={0.2}>
            {QUESTIONS.map(q => (
              <div className="hmw5-c" key={q.k}>
                <h4 className="hq-t"><b>{q.k}</b>{q.t}</h4>
                <p>{q.p}</p>
                <div className="hq-a">→ {q.a}</div>
              </div>
            ))}
          </Bounce>
        </div>
      </div>
    </section>
  )
}

/** cards that bounce in one after another (like the Trust Bank idea cards) */
function Bounce({ children, className, step = 0.3 }: { children: React.ReactNode[]; className: string; step?: number }) {
  const [ref, shown] = useShownOnce<HTMLDivElement>(0.2)
  return (
    <div ref={ref} className={className}>
      {children.map((c, i) => (
        <div key={i} className="bounce" style={{
          opacity: shown ? 1 : 0,
          transform: shown ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.94)',
          transition: `opacity 0.8s ease ${i * step}s, transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * step}s`,
        }}>{c}</div>
      ))}
    </div>
  )
}

/* ---------- final design: live prototype tour + one labelled design-system screen ---------- */

// Screens captured from the live prototype (VIBE_URL) at 1440×900.
type Shot = 'map' | 'ask' | 'goal' | 'board' | 'retention' | 'agent' | 'overview'
const F = V + 'final/'
const SHOTS: Record<Shot, string> = {
  map: F + 'map.webp', ask: F + 'ask.webp', goal: F + 'goal.webp', board: F + 'board.webp', agent: F + 'agent.webp', overview: F + 'overview.webp',
  retention: IMG5.retention, // v125: rebuilt Retention screen, so the charts are visible (Figma 880:52)
}

const PW = 1440, PH = 900
const TABS = ['AI Mapping', 'Goal-based setup', 'AI agent']
// r = highlighted area on the 1440×900 screen: [x, y, width, height]
const TOUR: { tab: number; shot: Shot; r: [number, number, number, number]; cap: string; alt: string }[] = [
  { tab: 0, shot: 'map', r: [283, 428, 1126, 125], cap: 'AI reads the game script and draws it as a map: Lobby → Stage 1–4. The creator checks it before anything is tracked.', alt: 'Tracking: the AI map of Lobby and Stage 1–4, with Stage 3 flagged for review' },
  { tab: 0, shot: 'ask', r: [1022, 477, 405, 284], cap: 'When the AI can’t tell how a stage ends, it asks instead of guessing. The creator picks the answer.', alt: 'Stage 3 detail panel asking which part is the end point' },
  { tab: 1, shot: 'goal', r: [636, 390, 566, 143], cap: 'A new board starts from a goal in plain words, not from a blank chart.', alt: 'New analysis board: What would you like to analyze? with three suggested goals' },
  { tab: 1, shot: 'retention', r: [235, 160, 1182, 734], cap: 'GameCove builds the board for that goal, so you see which day’s players come back.', alt: 'Retention board: Day 1 retention falls from about 22% to 6% over a week, and a date-cohort table shows D1 to D7 return rates for each start day' },
  { tab: 2, shot: 'agent', r: [990, 62, 436, 806], cap: 'Ask about any page in plain words. The agent explains each chart and suggests the next question.', alt: 'Overview with the AI agent explaining the daily charts' },
]
const TOUR_SHOTS = Array.from(new Set(TOUR.map(s => s.shot)))
const pc = (v: number, of: number) => `${(v / of) * 100}%`
const letterOf = (i: number) => String.fromCharCode(65 + TOUR.slice(0, i).filter(s => s.tab === TOUR[i].tab).length)

/** one screen with the dimmed spotlight + caption card (v124: always the top-left corner, like Palantir AIP) */
function TourStage({ step, lit, single = false }: { step: number; lit: boolean; single?: boolean }) {
  const s = TOUR[step]
  const list = single ? [s.shot] : TOUR_SHOTS
  return (
    <div className="g-stage">
      {list.map(k => (
        <img key={k} src={SHOTS[k]} alt={k === s.shot ? s.alt : ''} aria-hidden={k !== s.shot} className={k === s.shot ? 'on' : ''} />
      ))}
      <div className={'g-spot' + (lit ? ' lit' : '')} style={{ left: pc(s.r[0], PW), top: pc(s.r[1], PH), width: pc(s.r[2], PW), height: pc(s.r[3], PH) }} aria-hidden="true">
        <b>{letterOf(step)}</b>
      </div>
      {!single && (
        <div key={step} className={'g-capcard' + (lit ? ' lit' : '')}>
          <b>{letterOf(step)}</b><p>{s.cap}</p>
        </div>
      )}
    </div>
  )
}

/**
 * Pinned like the reference: the screen stays put while scrolling; tabs 01–03 run across the top,
 * each step dims the screen and lights one area with a short caption.
 */
function Tour() {
  const outer = useRef<HTMLDivElement>(null)
  const [st, setSt] = useState({ step: 0, local: 0 })
  useOnScroll(() => {
    const el = outer.current; if (!el) return
    const travel = el.offsetHeight - innerHeight
    if (travel <= 0) return
    const f = clamp(-el.getBoundingClientRect().top / travel) * TOUR.length
    const step = Math.min(TOUR.length - 1, Math.floor(f))
    const local = clamp(f - step)
    setSt(p => (p.step === step && Math.abs(p.local - local) < 0.004 ? p : { step, local }))
  })
  const jump = (tab: number) => {
    const el = outer.current; if (!el) return
    const travel = el.offsetHeight - innerHeight
    const first = TOUR.findIndex(s => s.tab === tab)
    scrollTo({ top: el.getBoundingClientRect().top + scrollY + travel * ((first + 0.3) / TOUR.length), behavior: reducedMotion() ? 'auto' : 'smooth' })
  }
  const { step, local } = st
  const tab = TOUR[step].tab
  const first = TOUR.findIndex(s => s.tab === tab)
  const steps = TOUR.filter(s => s.tab === tab).length
  const tabProg = clamp((step - first + local) / steps)
  const lit = local > 0.12 || reducedMotion()
  return (
    <>
      <div ref={outer} className="g-tour-outer mt-40" style={{ height: `${TOUR.length * 90 + 60}vh` }}>
        <div className="g-tour">
          <div className="g-tour-top">
            <a className="g-live" href={VIBE_URL} target="_blank" rel="noreferrer">Live prototype<span aria-hidden="true">↗</span></a>
            <div className="g-tabs" role="tablist" aria-label="Final design features">
              {TABS.map((t, i) => (
                <button key={t} type="button" role="tab" aria-selected={i === tab} className={'g-tab' + (i === tab ? ' on' : '')} onClick={() => jump(i)}>
                  <span className="t">{t}</span><span className="n">0{i + 1}</span>
                  <i style={{ transform: `scaleX(${i === tab ? tabProg : i < tab ? 1 : 0})` }} />
                </button>
              ))}
            </div>
          </div>
          <div className="g-stage-box"><TourStage step={step} lit={lit} /></div>
        </div>
      </div>
      {/* small screens: one step after another */}
      <div className="g-tour-narrow mt-40">
        {TOUR.map((s, i) => (
          <div key={i} className="g-tour-item" data-r>
            <div className="g-k blue">0{s.tab + 1} · {TABS[s.tab]} · {letterOf(i)}</div>
            <TourStage step={i} lit single />
            <p className="g-body">{s.cap}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function FinalDesign() {
  const [ref, p] = useCountProgress<HTMLDivElement>()
  return (
    <section className="g-sec g-final" data-chapter="Prototype">
      <div className="g-wrap">
        <div data-r className="w-760">
          <Eyebrow label="PROTOTYPE · FINAL DESIGN" sq="blue" />
          <H2 className="mt-40">The final design: 3 features</H2>
          <p className="g-body mt-24">Feature 1 is what makes GameCove different from other dashboards. Features 2 and 3 build on the map it creates. Scroll through the live prototype.</p>
        </div>
        <Tour />
        <div className="g-ds" data-r>
          <h3 className="g-h3">Built on one design system</h3>
          <p className="g-body mt-16 w-760">Three layers: raw colours, tokens named by their job, and components. Here is one live screen with its tokens labelled.</p>
          <div className="g-sys mt-24" ref={ref}>
            {[[19, 'core colours'], [31, 'semantic tokens'], [24, 'spacing, radius & size tokens'], [6, 'text styles']].map(([n, l]) => (
              <div key={l as string}><div className="g-num light">{count(n as number, p)}</div><div className="g-cap">{l}</div></div>
            ))}
          </div>
        </div>
        <figure className="g-dsmap mt-40" data-r>
          <img src={IMG5.dsMap} alt="Design system map. 01 Primitive, raw colours: red/300 #E28B8B, sand/100 #F2F0EC, blue/500 #3898F8, neutral/850 #17171B. 02 Semantic, named by their job: color/status/drop (drops), color/text/strong (key numbers), color/chart/primary (chart line and area), color/bg/card (cards). 03 Component: lines lead from each token to where it is used on the live Overview screen of Tower Escape." loading="lazy" data-gzoom="true" />
        </figure>
      </div>
    </section>
  )
}

/* ---------- body ---------- */

/** the whole GameCove case-study body (hero → reflection). Wrap it with the site's header and footer. */
export function GameCoveV4Body() {
  const root = useRef<HTMLDivElement>(null)
  useMagnifier(root)
  // soft block reveal: blocks already on screen come in right away, the rest as they scroll in
  useEffect(() => {
    const el = root.current; if (!el) return
    const els = Array.from(el.querySelectorAll<HTMLElement>('[data-r]'))
    if (reducedMotion() || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('r-in')); return }
    els.forEach(e => { if (e.getBoundingClientRect().top < innerHeight * 0.92) e.classList.add('r-in') })
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('r-in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.08 })
    els.filter(e => !e.classList.contains('r-in')).forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [])
  return (
    <div className="gc4" ref={root} data-tone="dark">
      <style>{GC4_CSS}</style>
      <style>{PARTS_CSS}</style>
      <Hero />
      <Overview />
      <Process />
      <Empathize />
      <Define />
      <Ideate />
      <FinalDesign />
      <Iterate />
      <Reflection />
    </div>
  )
}

export const GC4_CSS = `
.gc4 { --bg: #111114; --card: #17171B; --raised: #1D1F22; --line: #2A2D31; --strong: #34343D; --sand: #F2F0EC; --text: #C9CAD0; --mute: #A7A9B0; --dim: #8A8D96;
  --sky: #B3D1FF; --blue: #3898F8; --skybg: #1A3050; --ok: #2FC844; --coral: #EF7085; --ease: cubic-bezier(.22,1,.36,1);
  background: var(--bg); color: var(--sand); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
.gc4 *, .gc4 *::before, .gc4 *::after { box-sizing: border-box; }
.gc4 img { display: block; max-width: 100%; }
.gc4 h1, .gc4 h2, .gc4 h3, .gc4 h4, .gc4 p, .gc4 figure { margin: 0; }
.gc4 .g-wrap { width: 100%; max-width: 1520px; margin: 0 auto; padding: 0 40px; }
.gc4 .mt-8 { margin-top: 8px; } .gc4 .mt-16 { margin-top: 16px; } .gc4 .mt-24 { margin-top: 24px; } .gc4 .mt-40 { margin-top: 40px; } .gc4 .mt-80 { margin-top: 80px; }
.gc4 .w-760 { max-width: 760px; } .gc4 .w-900 { max-width: 900px; }

/* soft block reveal (Trust Bank timing) */
.gc4 [data-r] { opacity: 0; transform: translate3d(0, 28px, 0); transition: opacity 1.2s var(--ease), transform 1.2s var(--ease); transition-delay: calc(var(--d, 0) * 120ms); }
.gc4 [data-r].r-in { opacity: 1; transform: none; }

/* type */
.gc4 .g-eyebrow { display: flex; align-items: center; gap: 10px; font-size: 16px; letter-spacing: .06em; color: var(--mute); }
.gc4 .g-eyebrow i { width: 14px; height: 14px; background: #6E7078; }
.gc4 .g-eyebrow.sq-blue i { background: var(--blue); } .gc4 .g-eyebrow.sq-sky i { background: var(--sky); } .gc4 .g-eyebrow.sq-sky, .gc4 .g-eyebrow.sq-blue { color: var(--mute); }
.gc4 .g-h1 { margin-top: 32px; font-size: clamp(44px, 4.4vw, 68px); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; color: var(--sand); }
.gc4 .g-lead { margin-top: 24px; font-size: 20px; line-height: 1.6; color: var(--text); }
.gc4 .g-h2 { font-size: clamp(32px, 2.6vw, 40px); font-weight: 700; line-height: 1.15; letter-spacing: -0.015em; color: var(--sand); }
.gc4 .g-h3 { font-size: 24px; font-weight: 700; line-height: 1.3; color: var(--sand); }
.gc4 .g-h4 { font-size: 20px; font-weight: 700; line-height: 1.35; color: var(--sand); }
.gc4 .g-body { font-size: 18px; line-height: 1.65; color: var(--text); }
.gc4 .g-cap { font-size: 16px; line-height: 1.5; color: var(--dim); }
.gc4 .g-k { font-size: 16px; font-weight: 700; letter-spacing: .06em; color: var(--mute); }
.gc4 .g-k.blue { color: var(--blue); } .gc4 .g-k.sky { color: var(--sky); }
.gc4 .g-num { font-size: 56px; font-weight: 400; line-height: 1.05; letter-spacing: -0.02em; color: var(--blue); font-variant-numeric: tabular-nums; }
.gc4 .g-num.light { color: var(--sand); font-weight: 300; }
.gc4 .g-num.big { font-size: 64px; }

/* sections */
.gc4 .g-sec { padding: 120px 0 0; }
.gc4 .g-sec.last { padding-bottom: 160px; }

/* hero */
.gc4 .g-hero { padding: 160px 0 0; }
.gc4 .g-logo { height: 40px; width: auto; }
.gc4 .g-banner { margin-top: 64px; overflow: hidden; border-radius: 16px; background: #fff; aspect-ratio: 2 / 1; }
.gc4 .g-banner img, .gc4 .g-banner video { display: block; width: 100%; height: 100%; object-fit: cover; }
.gc4 .g-video { position: relative; }
.gc4 .g-video video { cursor: pointer; }
.gc4 .hv-controls { position: absolute; left: 0; right: 0; bottom: 0; padding: 48px 20px 16px; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.45) 100%); opacity: 0; pointer-events: none; transition: opacity .3s; }
.gc4 .hv-controls.show { opacity: 1; pointer-events: auto; }
.gc4 .hv-row { display: flex; align-items: center; gap: 16px; margin-top: 12px; color: #fff; }
.gc4 .hv-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; padding: 0; background: none; border: 0; border-radius: 6px; color: #fff; cursor: pointer; transition: background .15s; }
.gc4 .hv-btn:hover { background: rgba(255,255,255,.15); }
.gc4 .hv-btn:focus-visible { outline: 2px solid var(--sky); outline-offset: 2px; }
.gc4 .hv-time { font-size: 16px; font-variant-numeric: tabular-nums; }
.gc4 .hv-vol { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.gc4 .g-range { -webkit-appearance: none; appearance: none; display: block; height: 3px; margin: 0; cursor: pointer; background: linear-gradient(90deg, #fff var(--fill, 0%), rgba(255,255,255,.35) var(--fill, 0%)); }
.gc4 .g-range.wide { width: 100%; } .gc4 .g-range.vol { width: 100px; }
.gc4 .g-range::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 0; }
.gc4 .g-range::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 0; }
.gc4 .g-range::-moz-range-track { background: transparent; }
.gc4 .g-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px; margin-top: 64px; }
.gc4 .g-meta p { margin-top: 12px; font-size: 18px; line-height: 1.6; color: var(--sand); }

/* overview */
.gc4 .g-ov { display: grid; grid-template-columns: 370px minmax(0, 1fr); gap: 40px; margin-top: 56px; }
.gc4 .g-ov-k { font-size: 24px; font-weight: 700; color: var(--sand); }
.gc4 .g-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px; }
.gc4 .g-stats .g-cap { margin-top: 12px; }


/* boards / images */
.gc4 .g-two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 40px; }
.gc4 .g-board { overflow: hidden; border-radius: 12px; background: var(--raised); }
.gc4 .g-board img { width: 100%; height: auto; }
.gc4 .g-slot { display: flex; align-items: center; justify-content: center; width: 100%; padding: 24px; text-align: center; border-radius: 12px; border: 1px dashed var(--strong); background: var(--card); color: var(--dim); font-size: 16px; }

.gc4 .g-table-wrap { overflow-x: auto; }
.gc4 .g-table { width: 100%; border-collapse: collapse; }
.gc4 .g-table th { padding: 14px 24px 14px 0; text-align: left; font-size: 16px; font-weight: 400; color: var(--dim); border-bottom: 1px solid var(--line); }
.gc4 .g-table td { padding: 16px 24px 16px 0; font-size: 17px; line-height: 1.5; color: var(--text); border-bottom: 1px solid var(--line); vertical-align: top; }
.gc4 .g-table td.b { font-weight: 700; color: var(--sand); white-space: nowrap; }
.gc4 .g-table td.ok { color: var(--ok); font-weight: 700; } .gc4 .g-table td.no { color: var(--coral); font-weight: 700; }

.gc4 .bounce { display: flex; }
.gc4 .bounce > * { flex: 1; }
.gc4 .g-card { display: flex; flex-direction: column; gap: 12px; padding: 32px; border-radius: 12px; background: var(--card); border: 1px solid transparent; transition: border-color .3s, box-shadow .4s, transform .4s var(--ease); }
.gc4 .g-card:hover { border-color: var(--strong); box-shadow: 0 18px 40px rgba(0,0,0,.3); }
.gc4 .g-card p { font-size: 17px; line-height: 1.6; color: var(--text); }



/* final design: pinned live-prototype tour */
.gc4 .g-tour-outer { position: relative; }
.gc4 .g-tour { position: sticky; top: 0; height: 100vh; padding: 96px 0 32px; display: flex; flex-direction: column; gap: 20px; }
.gc4 .g-tour-top { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; }
.gc4 .g-live { display: inline-flex; align-items: center; gap: 8px; padding-bottom: 12px; font-size: 16px; color: var(--sky); text-decoration: none; }
.gc4 .g-live span { transition: transform .35s var(--ease); }
.gc4 .g-live:hover span { transform: translate(2px, -2px); }
.gc4 .g-live:focus-visible { outline: 2px solid var(--sky); outline-offset: 4px; border-radius: 4px; }
.gc4 .g-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 200px)); gap: 8px; }
.gc4 .g-tab { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 10px 14px 14px; border: 1px solid transparent; border-radius: 8px 8px 0 0; background: none;
  color: var(--dim); font: inherit; text-align: left; cursor: pointer; transition: color .3s, border-color .3s, background-color .3s; }
.gc4 .g-tab::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: var(--line); }
.gc4 .g-tab .t { font-size: 16px; letter-spacing: .04em; text-transform: uppercase; }
.gc4 .g-tab .n { font-size: 16px; font-variant-numeric: tabular-nums; }
.gc4 .g-tab i { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: var(--sky); transform-origin: 0 50%; z-index: 1; transition: transform .2s linear; }
.gc4 .g-tab.on { color: var(--sand); border-color: var(--line); border-bottom-color: transparent; background: var(--card); }
.gc4 .g-tab:hover { color: var(--sand); }
.gc4 .g-tab:focus-visible { outline: 2px solid var(--sky); outline-offset: 2px; }
.gc4 .g-stage-box { flex: 1; min-height: 0; display: flex; justify-content: center; align-items: flex-start; container-type: size; }
.gc4 .g-stage-box .g-stage { width: min(100cqw, 160cqh); }
.gc4 .g-stage { position: relative; aspect-ratio: 1440 / 900; overflow: hidden; border-radius: 12px; border: 1px solid var(--line); background: #0c0c0e; }
.gc4 .g-stage img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity .6s ease; }
.gc4 .g-stage img.on { opacity: 1; }
.gc4 .g-spot { position: absolute; z-index: 2; border-radius: 12px; border: 1.5px solid rgba(179,209,255,0); box-shadow: 0 0 0 200vmax rgba(8,8,11,0); pointer-events: none;
  transition: left .7s var(--ease), top .7s var(--ease), width .7s var(--ease), height .7s var(--ease), box-shadow .6s ease, border-color .6s ease; }
.gc4 .g-spot.lit { border-color: var(--sky); box-shadow: 0 0 0 200vmax rgba(8,8,11,.74), 0 0 32px rgba(56,152,248,.25); }
.gc4 .g-spot b { position: absolute; left: -14px; top: -14px; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%;
  background: var(--sky); color: #111114; font-size: 16px; font-weight: 700; opacity: 0; transform: scale(.6); transition: opacity .4s ease .2s, transform .5s cubic-bezier(0.34, 1.56, 0.64, 1) .2s; }
.gc4 .g-spot.lit b { opacity: 1; transform: none; }
/* caption card: always top-left, solid and brighter than the dimmed screen so it reads at a glance (Palantir AIP) */
.gc4 .g-capcard { position: absolute; z-index: 3; top: 24px; left: 24px; display: flex; gap: 12px; align-items: flex-start; max-width: min(400px, 44%); padding: 16px 20px;
  border: 1px solid rgba(255,255,255,.22); background: #2B2C33; box-shadow: 0 16px 40px rgba(0,0,0,.45); opacity: 0; transform: translateY(8px); transition: opacity .5s ease, transform .6s var(--ease); }
.gc4 .g-capcard.lit { opacity: 1; transform: none; transition-delay: .15s; }
.gc4 .g-capcard b { flex: none; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #B3D1FF; color: #111114; font-size: 16px; font-weight: 700; }
.gc4 .g-capcard p { font-size: 16px; line-height: 1.5; color: #FFFFFF; }
.gc4 .g-tour-narrow { display: none; }
.gc4 .g-tour-item { display: flex; flex-direction: column; gap: 14px; }

/* notes */
.gc4 .g-note { padding: 32px; border-radius: 12px; background: var(--card); }
.gc4 .g-note p { margin-top: 12px; font-size: 18px; line-height: 1.65; color: var(--text); }

/* design system: one labelled live screen */
.gc4 .g-ds { margin-top: 64px; }
.gc4 .g-ds .g-num { font-size: 40px; }
.gc4 .g-sys { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.gc4 .g-sys > div { padding: 4px 24px; border-left: 1px solid var(--line); }
.gc4 .g-sys .g-cap { margin-top: 10px; }
.gc4 .g-anno { position: relative; aspect-ratio: 1000 / 337.5; margin-bottom: 8px; }
.gc4 .g-anno-lines { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.gc4 .g-anno-lines polyline { fill: none; stroke: var(--sky); stroke-width: .8; opacity: .55; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .9s var(--ease); }
.gc4 .g-anno.in .g-anno-lines polyline { stroke-dashoffset: 0; }
.gc4 .g-anno-screen { position: absolute; left: 23%; top: 0; width: 54%; aspect-ratio: 1440 / 900; overflow: visible; }
.gc4 .g-anno-screen img { position: relative; z-index: 0; width: 100%; height: 100%; border-radius: 10px; border: 1px solid var(--line); }
.gc4 .g-anno-screen .dot { position: absolute; z-index: 3; display: flex; align-items: center; justify-content: center; width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%;
  background: var(--sky); color: #111114; font-size: 0; font-weight: 700; box-shadow: 0 0 0 2px #111114, 0 0 0 6px rgba(179,209,255,.25); opacity: 0; transform: scale(.4); transition: opacity .4s ease, transform .5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.gc4 .g-anno.in .dot { opacity: 1; transform: none; }
.gc4 .g-anno-labs { margin: 0; padding: 0; list-style: none; }
.gc4 .g-anno-labs li { position: absolute; width: 21%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 2px; opacity: 0; transition: opacity .5s ease; }
.gc4 .g-anno.in .g-anno-labs li { opacity: 1; }
.gc4 .g-anno-labs li.l { left: 0; text-align: right; align-items: flex-end; }
.gc4 .g-anno-labs li.r { left: 79%; }
.gc4 .g-anno-labs b { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: var(--sand); }
.gc4 .g-anno-labs b span { display: none; }
.gc4 .g-anno-labs em { font-style: normal; font-size: 16px; line-height: 1.45; color: var(--mute); }

/* ================= v124 (Figma 04 GameCove — 1921) ================= */
.gc4 .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.gc4 .g-body.mute { color: var(--mute); }
.gc4 .g-k.cyan { color: #7DD3FC; }
.gc4 .g-h3l { font-size: 32px; font-weight: 400; line-height: 40px; letter-spacing: -0.01em; color: var(--sand); }

/* hero button: flat grey, square (Figma g-btn 200×56) */
.gc4 .g-btn5 { display: inline-flex; align-items: center; justify-content: center; min-width: 200px; height: 56px; margin-top: 40px; padding: 0 40px; background: #6A6A75; color: #F2F0EC; font-size: 16px; font-weight: 400; text-decoration: none; transition: background-color .3s, transform .35s var(--ease); }
.gc4 .g-btn5:hover { background: #7A7A86; transform: translateY(-2px); }
.gc4 .g-btn5:focus-visible { outline: 2px solid var(--sky); outline-offset: 3px; }

/* process */
.gc4 .g-proc { display: grid; grid-template-columns: minmax(0, 480px) minmax(0, 920px); justify-content: space-between; gap: 40px; align-items: start; }
.gc4 .g-proc-map { position: relative; aspect-ratio: 920 / 480; background: #0B0C0F; }
.gc4 .g-proc-map img { width: 100%; height: 100%; object-fit: cover; }

/* empathize: research question + sticky 01/02/03 */
.gc4 .g-rq { padding: 48px 40px; background: var(--skybg); text-align: center; }
.gc4 .g-rq .rq-q { margin-top: 24px; font-size: clamp(28px, 2.4vw, 38px); font-weight: 400; line-height: 1.26; color: var(--sand); }
.gc4 .emp-outer { position: relative; }
.gc4 .emp-pin { position: sticky; top: max(96px, calc(50vh - 280px)); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 80px; height: 560px; }
.gc4 .emp-list { display: flex; flex-direction: column; }
.gc4 .emp-item { border-top: 1px solid #2B2D30; }
.gc4 .emp-item:last-child { border-bottom: 1px solid #2B2D30; }
.gc4 .emp-head { display: flex; align-items: baseline; gap: 16px; width: 100%; padding: 24px 0; background: none; border: 0; text-align: left; font: inherit; cursor: pointer; }
.gc4 .emp-head .n, .gc4 .emp-head .t { font-size: 24px; line-height: 32px; letter-spacing: -0.01em; color: #8A8D96; transition: color .4s ease; }
.gc4 .emp-item.on .emp-head .n { color: #7DD3FC; }
.gc4 .emp-item.on .emp-head .t { color: var(--sand); }
.gc4 .emp-head:hover .t { color: var(--sand); }
.gc4 .emp-head:focus-visible { outline: 2px solid var(--sky); outline-offset: 2px; }
.gc4 .emp-body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .6s var(--ease); }
.gc4 .emp-body > div { overflow: hidden; padding-left: 48px; }
.gc4 .emp-item.on .emp-body { grid-template-rows: 1fr; }
.gc4 .emp-item.on .emp-body > div { padding-bottom: 40px; }
.gc4 .emp-h { font-size: 32px; font-weight: 400; line-height: 40px; letter-spacing: -0.01em; color: var(--sand); }
.gc4 .emp-p { margin-top: 16px; font-size: 18px; line-height: 1.6; color: var(--mute); }
.gc4 .emp-panel { position: relative; height: 560px; background: var(--card); }
.gc4 .emp-layer { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 40px 56px; opacity: 0; transition: opacity .6s ease; }
.gc4 .emp-layer.on { opacity: 1; }
.gc4 .emp-vis { width: 100%; max-width: 608px; }
.gc4 .emp-vis img { width: 100%; height: auto; }
.gc4 .emp-vis figcaption { margin-top: 24px; text-align: center; }
.gc4 .emp-narrow { display: none; }

/* define: affinity strip, insight rows, story, HMW */
.gc4 .g-aff img { width: 100%; height: auto; }
.gc4 .g-ins { display: flex; flex-direction: column; gap: 32px; padding: 48px; background: var(--card); }
.gc4 .ins-row { display: grid; grid-template-columns: 384px minmax(0, 1fr); gap: 24px; align-items: center; }
.gc4 .ins-k { display: flex; align-items: center; gap: 24px; }
.gc4 .ins-k img { flex: none; width: 80px; height: 72px; }
.gc4 .ins-t { margin-top: 8px; font-size: 24px; font-weight: 400; line-height: 32px; color: var(--sand); }
.gc4 .ins-notes { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.gc4 .ins-notes::before { content: ""; position: absolute; left: -24px; right: 0; top: 50%; height: 1px; background: rgba(255,255,255,.18); }
.gc4 .ins-note { position: relative; padding: 24px; background: var(--bg); border: 1px solid rgba(255,255,255,.1); font-size: 18px; line-height: 1.55; color: var(--mute); }
.gc4 .ins-note::before { content: ""; position: absolute; left: -16px; top: 50%; width: 8px; height: 8px; margin-top: -4px; border-radius: 50%; background: #7DD3FC; }
.gc4 .g-story img { width: 100%; height: auto; }
.gc4 .g-story video { display: block; width: 100%; max-width: 960px; height: auto; aspect-ratio: 960 / 640; background: #FFFFFF; }
.gc4 .g-hmw5 { padding: 56px; background: var(--skybg); }
.gc4 .hmw5-q { font-size: 36px; font-weight: 700; line-height: 48px; letter-spacing: -0.01em; color: var(--sand); }
.gc4 .hmw5-p { font-size: 20px; line-height: 1.6; color: var(--text); }
.gc4 .g-hmw5 hr { height: 1px; margin: 40px 0; border: 0; background: rgba(56,152,248,.3); }
.gc4 .hmw5-qs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px; }
.gc4 .hmw5-c { display: flex; flex-direction: column; gap: 12px; }
.gc4 .hq-t { display: flex; gap: 16px; font-size: 24px; font-weight: 400; line-height: 32px; color: var(--sand); }
.gc4 .hq-t b { font-weight: 400; color: var(--blue); }
.gc4 .hmw5-c p { font-size: 18px; line-height: 1.55; color: var(--text); }
.gc4 .hq-a { font-size: 16px; font-weight: 700; color: #6FB2FA; }

/* ideate: user flow canvas, sketches, photo */
.gc4 .g-flowc { padding: 48px; background: var(--raised); }
.gc4 .fl-legend { display: flex; flex-wrap: wrap; gap: 16px 32px; font-size: 16px; color: var(--mute); }
.gc4 .fl-legend span { display: inline-flex; align-items: center; gap: 8px; }
.gc4 .lg { display: inline-block; width: 16px; height: 16px; }
.gc4 .lg.user { background: #2F3237; border: 1.5px solid #454950; }
.gc4 .lg.ai { background: rgba(56,152,248,.16); border: 1.5px solid var(--blue); }
.gc4 .lg.q { border: 1.5px dashed var(--mute); }
.gc4 .lg.end { border: 1.5px solid var(--sand); }
.gc4 .fl { margin-top: 56px; }
.gc4 .fl-t { display: flex; align-items: baseline; gap: 12px; font-size: 24px; font-weight: 400; line-height: 36px; color: var(--sand); }
.gc4 .fl-t span { font-size: 16px; color: var(--blue); }
.gc4 .fl-scroll { margin-top: 24px; overflow-x: auto; }
.gc4 .fl-row { display: flex; align-items: center; gap: 4px; min-width: 1336px; }
.gc4 .nd { flex: none; display: flex; flex-direction: column; gap: 6px; width: 160px; padding: 16px 18px; font-size: 16px; line-height: 1.5; color: var(--text); }
.gc4 .nd.end { justify-content: center; min-height: 59px; text-align: center; color: var(--sand); border: 1.5px solid var(--sand); }
.gc4 .nd.ai { background: rgba(56,152,248,.12); border: 1.5px solid var(--blue); }
.gc4 .nd.ai .ai { font-weight: 700; color: var(--blue); }
.gc4 .nd.user { background: #2F3237; border: 1.5px solid #454950; }
.gc4 .nd.q { border: 1.5px dashed var(--mute); }
.gc4 .nd .sub { color: var(--dim); }
.gc4 .fl-paths { flex: none; display: flex; flex-direction: column; gap: 8px; }
.gc4 .fl-arr { position: relative; flex: none; display: flex; width: 28px; }
.gc4 .fl-arr .yes { position: absolute; left: 50%; bottom: 100%; transform: translateX(-50%); margin-bottom: 4px; font-size: 16px; color: var(--dim); }
.gc4 .g-sk { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
.gc4 .g-sk img { width: 100%; aspect-ratio: 362 / 276; object-fit: cover; }
.gc4 .g-sk figcaption { display: flex; gap: 12px; margin-top: 16px; font-size: 16px; line-height: 1.5; color: var(--text); }
.gc4 .g-sk figcaption span { color: var(--blue); }
.gc4 .g-photo5 { width: 100%; aspect-ratio: 1520 / 573; object-fit: cover; }

/* prototype · final design: a light section (Figma #FAFAF9) */
.gc4 .g-final { --sand: #111114; --text: #3D3E44; --mute: #6E7078; --dim: #6E7078; --line: #E3E4E8; --card: #F4F4F6; --strong: #E3E4E8;
  margin-top: 120px; padding-bottom: 120px; background: #FAFAF9; color: #111114; }
.gc4 .g-final .g-live { color: #1F6FD1; }
.gc4 .g-final .g-tab i { background: var(--blue); }
.gc4 .g-final .g-stage { border-color: #E3E4E8; box-shadow: 0 24px 60px rgba(17,17,20,.18); }
.gc4 .g-final .g-anno-lines polyline { stroke: var(--blue); opacity: .8; }
.gc4 .g-final .g-anno-screen img { box-shadow: 0 16px 40px rgba(17,17,20,.16); }
.gc4 .g-final .g-anno-screen .dot { background: var(--blue); box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 7px rgba(56,152,248,.18); }

/* round shapes that carry meaning stay round (the page squares every other corner) */
.gc .gc4 .ins-note::before, .gc .gc4 .g-spot b, .gc .gc4 .g-capcard b, .gc .gc4 .g-anno-screen .dot, .gc .gc4 .lg.end { border-radius: 50% !important; }
.gc .gc4 .g-flowc .nd.end { border-radius: 40px !important; }

@media (max-width: 1280px) {
  .gc4 .g-ov, .gc4 .g-test-top { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .gc4 .g-anno { aspect-ratio: auto; }
  .gc4 .g-anno-lines { display: none; }
  .gc4 .g-anno-screen { position: relative; left: 0; width: 100%; }
  .gc4 .g-anno-labs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 32px; margin-top: 24px; }
  .gc4 .g-anno-labs li, .gc4 .g-anno-labs li.l, .gc4 .g-anno-labs li.r { position: static; width: auto; transform: none; text-align: left; align-items: flex-start; }
  .gc4 .g-anno-labs b span { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: var(--sky); color: #111114; font-size: 13px; }
  .gc4 .g-anno-labs em { padding-left: 30px; }
  .gc4 .g-anno-screen .dot { width: 22px; height: 22px; margin: -11px 0 0 -11px; font-size: 13px; }
  .gc4 .g-proc { grid-template-columns: minmax(0, 1fr); }
  .gc4 .ins-row { grid-template-columns: minmax(0, 1fr); }
  .gc4 .ins-notes::before { left: 0; }
}
@media (max-width: 1023px) {
  .gc4 .g-tour-outer { display: none; }
  .gc4 .g-tour-narrow { display: flex; flex-direction: column; gap: 48px; }
  .gc4 .g-two, .gc4 .g-fixes, .gc4 .g-meta, .gc4 .g-stats { grid-template-columns: minmax(0, 1fr); gap: 32px; }
  .gc4 .g-sys { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 24px; }
  .gc4 .emp-outer { display: none; }
  .gc4 .emp-narrow { display: block; }
  .gc4 .emp-narrow .emp-head { cursor: default; }
  .gc4 .emp-narrow .emp-panel { height: auto; padding: 32px 24px; }
  .gc4 .ins-notes { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .gc4 .ins-notes::before, .gc4 .ins-note::before { display: none; }
  .gc4 .hmw5-qs { grid-template-columns: minmax(0, 1fr); gap: 32px; }
  .gc4 .g-sk { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 700px) {
  .gc4 .g-wrap { padding: 0 20px; }
  .gc4 .g-sec { padding-top: 88px; }
  .gc4 .g-hero { padding-top: 120px; }
  .gc4 .g-anno-labs { grid-template-columns: minmax(0, 1fr); }
  .gc4 .g-row { grid-template-columns: 40px minmax(0, 1fr); } .gc4 .g-row p { grid-column: 2; }
  .gc4 .g-rq { padding: 32px 20px; }
  .gc4 .g-ins, .gc4 .g-flowc { padding: 24px; }
  .gc4 .g-hmw5 { padding: 32px 24px; }
  .gc4 .hmw5-q { font-size: 28px; line-height: 36px; }
  .gc4 .emp-body > div { padding-left: 0; }
  .gc4 .emp-h, .gc4 .g-h3l { font-size: 28px; line-height: 36px; }
  .gc4 .g-sk { grid-template-columns: minmax(0, 1fr); }
  .gc4 .g-final { margin-top: 88px; padding-bottom: 88px; }
  .gc4 .g-capcard { top: 12px; left: 12px; max-width: 70%; padding: 12px 14px; }
}

/* ================= v125 ================= */
.gc4 .mt-32 { margin-top: 32px; } .gc4 .mt-56 { margin-top: 56px; } .gc4 .mt-64 { margin-top: 64px; }
.gc4 .g-rq .rq-origin { margin-top: 24px; font-size: 18px; line-height: 1.55; color: #B3C3DC; }
.gc4 .g-rq .rq-origin b { font-weight: 400; color: var(--sand); }
.gc4 .emp-lead { margin-top: 16px; font-size: 18px; line-height: 1.6; color: var(--sand); }
.gc4 .g-insc { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.gc4 .insc { display: flex; flex-direction: column; padding: 48px; background: var(--card); }
.gc4 .insc img { width: 80px; height: 72px; }
.gc4 .insc-k { margin-top: 16px; font-size: 16px; font-weight: 700; letter-spacing: .06em; color: #6FC3FF; }
.gc4 .insc-t { margin-top: 16px; font-size: 28px; font-weight: 400; line-height: 40px; color: var(--sand); }
.gc4 .insc-q { margin-top: auto; padding-top: 16px; border-top: 1px solid #2A2B31; font-size: 18px; line-height: 1.55; color: var(--mute); }
.gc4 .insc-t + .insc-q { margin-top: 16px; }
.gc4 .g-dsmap img { width: 100%; height: auto; }
@media (max-width: 1023px) {
  .gc4 .g-insc { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .gc4 .insc-q { margin-top: 16px; }
}
@media (max-width: 700px) {
  .gc4 .insc { padding: 32px 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .gc4 [data-r] { opacity: 1 !important; transform: none !important; transition: none !important; }
  .gc4 .fix-inner, .gc4 .g-stage img, .gc4 .g-spot, .gc4 .g-spot b, .gc4 .g-capcard, .gc4 .g-tab i, .gc4 .g-anno *, .gc4 .g-anno-lines polyline, .gc4 .emp-body, .gc4 .emp-layer { transition: none !important; }
}
`
