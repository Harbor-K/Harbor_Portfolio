import React, { useEffect, useRef, useState } from 'react'

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
 *  - Process: looping orbit motion (design thinking stages, with the Test → Define iteration loops)
 *  - HMW callout pops on like the Trust Bank HMW notes; question / rule cards bounce in one after another
 *  - Prototype: the design flow lights up step by step
 *  - Final design: pinned tour of the live prototype — tabs 01–03 across the top, each scroll step dims the screen,
 *    lights one area and shows a short caption; then one live screen with its design tokens labelled
 *  - What we're fixing: each fix card flips Before → After in 3D as it reaches the middle of the screen
 *  - hover magnifier on dense boards (journey map, reviews, affinity map, components)
 * Text: Helvetica Neue everywhere, 16px minimum.
 * Hero media: the 15s ad video (HERO_VIDEO) — autoplays muted with Trust Bank-style controls (unmute, volume, progress).
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
  process: V + 'process-orbit.gif',
  accEmpathize: V + 'acc-empathize.webp', accDefine: V + 'acc-define.webp', accIdeate: V + 'acc-ideate.webp',
  journey: V + 'journey.webp', players: V + 'players.webp', affinity: V + 'affinity.webp',
  story: V + 'story.webp', sketch: V + 'sketch.webp', photo1: L + 'photo-1.webp', photo2: L + 'photo-2.webp',
  midfi: V + 'midfi.webp', hifi: V + 'hifi.webp',
  before: V + 'before-mapping.webp',
}

export const GC4_CHAPTERS = ['Overview', 'Process', 'Empathize', 'Define', 'Ideate', 'Prototype', 'Final design', 'Test', 'Reflection']

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
function Slot({ label, ratio }: { label: string; ratio: string }) {
  return <div className="g-slot" style={{ aspectRatio: ratio }} role="img" aria-label={`${label} (image coming soon)`}><span>{label}</span></div>
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
          <h1 className="g-h1">Helping first-time game creators<br />decide what to fix next</h1>
          <p className="g-lead">An AI analytics dashboard that reads your game first<br />GameCove · Product design case study</p>
          {VIBE_URL && <a className="g-btn" href={VIBE_URL} target="_blank" rel="noreferrer">View dashboard<span className="g-btn-arrow" aria-hidden="true">↗</span></a>}
        </div>
        {HERO_VIDEO
          ? <SoundMotion />
          : <div className="g-banner" data-r><img src={IMG.poster} alt="GameCove Overview dashboard: new players dropped 61.3% this week, daily active users falling to 134" /></div>}
        <div className="g-meta">
          <div data-r style={d(0)}><div className="g-k">TIMELINE</div><p>9 weeks<br />August – October 2026</p></div>
          <div data-r style={d(1)}><div className="g-k">TEAM &amp; ROLE</div><p>2 product designers<br />My part: UI design, data visualisation, design system, test plan and scoring<br />Together: AI agent design</p></div>
          <div data-r style={d(2)}><div className="g-k">PLATFORM</div><p>Desktop web · Game analytics (B2B)<br />AI agent</p></div>
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
          <p className="g-body">AI made it easy to build a game. Fixing it after launch is still hard. The Roblox dashboard shows how many players left, but not where or why. Creators can set up their own tracking, but beginners don’t know what to track. So they guess.</p>
        </div>
        <div className="g-ov" data-r>
          <h3 className="g-ov-k">Solution</h3>
          <p className="g-body">GameCove reads the game first and draws its structure as a map. The creator checks the map, picks a goal, and GameCove suggests what to track. Then the dashboard opens with the 2–3 changes worth a look, and an AI agent answers follow-up questions.</p>
        </div>
        <div className="g-ov" data-r>
          <h3 className="g-ov-k">Impact</h3>
          <div className="g-stats" ref={ref}>
            <div><div className="g-num">{count(85.5, p)}</div><div className="g-cap">ease-of-use score (SUS, A+)</div></div>
            <div><div className="g-num">{Math.round(2 * p)} of 3</div><div className="g-cap">hidden problems found by users</div></div>
            <div><div className="g-num">{Math.round(3 * p)} of 3</div><div className="g-cap">used the data to form a hypothesis</div></div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- process (accordion) ---------- */

function Process() {
  return (
    <section className="g-sec" data-chapter="Process">
      <div className="g-wrap">
        <div data-r><Eyebrow label="PROCESS" /><H2 className="mt-40">5 stages, 2 turning points</H2></div>
        <figure className="g-process mt-40" data-r>
          <img src={IMG.process} alt="Design thinking process: Empathize, Define, Ideate, Prototype and Test in order, then loops back from Test to Define, Define to Prototype and Prototype to Test" loading="lazy" />
        </figure>
        <div className="g-turns mt-40" data-r>
          <p><span aria-hidden="true">↺</span>We narrowed the idea from “explain player behaviour” to “give creators the information they need”</p>
          <p><span aria-hidden="true">↺</span>After teacher feedback, we moved from solo users (B2C) to teams sharing one game (B2B)</p>
        </div>
      </div>
    </section>
  )
}

/* ---------- empathize ---------- */

function Empathize() {
  return (
    <section className="g-sec" data-chapter="Empathize">
      <div className="g-wrap">
        <div data-r className="w-760">
          <Eyebrow label="EMPATHIZE" />
          <H2 className="mt-40">Making a game got easy.<br />Fixing it didn’t.</H2>
          <p className="g-body mt-16">Roblox Studio and AI tools let beginners launch a game in a few months. But the basic dashboard only shows results, like playtime and drop-off rate. It doesn’t show which stage or obstacle makes players quit.</p>
        </div>
        <div className="g-two mt-40">
          <figure className="g-fig" data-r style={d(0)}>
            <div className="g-board"><img src={IMG.journey} alt="Creator journey board from 27 Roblox forum posts (FigJam)" loading="lazy" data-gzoom="true" /></div>
            <h3 className="g-h3 mt-24">What creators wrote</h3>
            <div className="g-cap mt-8">27 posts from Roblox forums</div>
            <p className="g-body mt-16">Creators knew something was wrong, but not where. They asked the community, changed many things at once, and lost track of what worked.</p>
          </figure>
          <figure className="g-fig" data-r style={d(1)}>
            <div className="g-board"><img src={IMG.players} alt="Player review analysis: 47 reviews and 39 feedback posts (FigJam)" loading="lazy" data-gzoom="true" /></div>
            <h3 className="g-h3 mt-24">What players wrote</h3>
            <div className="g-cap mt-8">47 reviews + 39 requested feedback posts</div>
            <p className="g-body mt-16">Players decide in the first few minutes. If something feels off, they leave before seeing the rest. Reviews rarely show what happened in between, so we needed behaviour data.</p>
          </figure>
        </div>
        <hr className="g-hair" />
        <div data-r className="w-760">
          <H2>Creators want a fast fix,<br />not a perfect answer</H2>
          <p className="g-body mt-16">We interviewed 3 creators, then held a second interview with a professional game developer. Creators fixed things as soon as a cause looked likely, then checked the numbers. The expert linked four things from the start. Beginners had the goal, but couldn’t turn it into a question.</p>
        </div>
        <Chain />
        <p className="g-cap mt-24" data-r>Beginners stop after “Goal”. Experts connect all four.</p>
        <div className="g-table-wrap mt-40 w-900" data-r>
          <table className="g-table">
            <thead><tr><th>Who</th><th>Experience</th><th>Where</th></tr></thead>
            <tbody>
              <tr><td className="b">Student creator</td><td>Game high school, teen</td><td>Korea</td></tr>
              <tr><td className="b">Game developer</td><td>Works at a game company, 20s</td><td>Korea</td></tr>
              <tr><td className="b">Hobby creator</td><td>Makes games for fun, teen</td><td>Belgium</td></tr>
            </tbody>
          </table>
        </div>
        <p className="g-cap mt-24" data-r>Minors joined with guardian consent. Names and faces are not shown.</p>
        <div className="g-board wide mt-40" data-r><img src={IMG.affinity} alt="Interview affinity map (FigJam)" loading="lazy" data-gzoom="true" /></div>
        <div className="g-scenario mt-40" data-r>
          <div><div className="g-k">PROBLEM SCENARIO</div><div className="g-sc-name">Meet Lucas</div></div>
          <div>
            <p className="g-body">Lucas built a ball-rolling stage game in 3 months with help from AI. Two weeks after launch, he wants to add Stage 5. His dashboard shows playtime and drop-off rate, but not which obstacle is too hard or too easy.</p>
            <p className="g-body mt-16">The data keeps piling up. It just doesn’t help him decide.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Goal → Question → Behaviour → Data: the expert's chain lights up link by link */
function Chain() {
  const [ref, shown] = useShownOnce<HTMLDivElement>(0.6)
  const steps = ['Goal', 'Question', 'Behaviour to watch', 'Data to log']
  return (
    <div ref={ref} className="g-chain mt-40">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          {i > 0 && <span className={'arr' + (shown ? ' on' : '')} style={{ transitionDelay: `${i * 0.35 - 0.15}s` }} aria-hidden="true">→</span>}
          <span className={'pill' + (i === 0 ? ' first' : '') + (shown ? ' on' : '')} style={{ transitionDelay: `${i * 0.35}s` }}>{s}</span>
        </React.Fragment>
      ))}
    </div>
  )
}

/* ---------- define ---------- */

/** the HMW callout pops on like the Trust Bank HMW notes */
function Hmw() {
  const [ref, shown] = useShownOnce<HTMLDivElement>(0.4)
  return (
    <div ref={ref} className="g-hmw mt-40" style={{
      opacity: shown ? 1 : 0,
      transform: shown ? 'scale(1)' : 'scale(0.9) translateY(30px)',
      transition: 'opacity .5s ease, transform .9s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      <div className="g-k sky">HOW MIGHT WE</div>
      <p className="hmw-q">Help creators who are new to data find evidence fast,<br />and make better update decisions?</p>
    </div>
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

const QUESTIONS = [
  { k: 'A', t: 'How do we collect data?', p: 'Beginners shouldn’t have to write tracking code.', a: 'AI Mapping + goal-based tracking' },
  { k: 'B', t: 'How do we show it?', p: 'Once tracked, there’s too much to look at.', a: 'Goal-based analysis board' },
  { k: 'C', t: 'How do we help them read it?', p: '“Stage 4 clear rate 57%”. Is that a problem?', a: 'AI briefing + AI agent' },
]

function Define() {
  return (
    <section className="g-sec" data-chapter="Define">
      <div className="g-wrap">
        <div data-r className="w-760">
          <Eyebrow label="DEFINE" sq="blue" />
          <H2 className="mt-40">The problem wasn’t reading data.<br />It was knowing what to check.</H2>
          <p className="g-body mt-16">Roblox already lets creators track each stage with funnels and custom events. Beginners didn’t use them. Not because the tool was missing, but because they didn’t know what to track.</p>
        </div>
        <Hmw />
        <h3 className="g-h3 mt-40" data-r>We picked one problem to solve first</h3>
        <Bounce className="g-pick mt-40" step={0.25}>
          {[
            <div className="g-card now" key="now"><div className="g-k blue">SOLVE NOW</div><h4 className="g-h4">No behaviour data</h4><p>Creators want to fix fast and check the result. Behaviour data feeds that loop directly.</p></div>,
            <div className="g-card" key="later"><div className="g-k blue">LATER</div><h4 className="g-h4">No reasons from players</h4><p>Important, but it fills gaps that behaviour data can’t explain. We kept it as a next step.</p></div>,
          ]}
        </Bounce>
        <h3 className="g-h3 mt-40" data-r>3 questions to design for</h3>
        <Bounce className="g-qs mt-40">
          {QUESTIONS.map(q => (
            <div className="g-card q" key={q.k}>
              <div className="q-k">{q.k}</div>
              <h4 className="g-h4">{q.t}</h4>
              <p>{q.p}</p>
              <div className="q-a">→ <span>{q.a}</span></div>
            </div>
          ))}
        </Bounce>
      </div>
    </section>
  )
}

/* ---------- ideate ---------- */

const RULES = [
  ['Start from a question', 'Show pages built around what the creator wants to check, plus a page of basic metrics.'],
  ['Suggest, don’t lock in', 'AI builds a bundle of charts. The creator can pick, mix and edit it.'],
  ['Go step by step', 'Overview → problem signal → comparison → player evidence.'],
  ['Keep ideas next to evidence', 'Link each hypothesis to the data for and against it. AI offers other explanations too.'],
  ['Explain inside the chart', 'Short titles and notes on the chart, not long AI reports.'],
  ['The creator makes the call', 'AI starts and widens the analysis. The direction and final decision stay with the creator.'],
]

function Ideate() {
  return (
    <section className="g-sec" data-chapter="Ideate">
      <div className="g-wrap">
        <div data-r className="w-760">
          <Eyebrow label="IDEATE" sq="blue" />
          <H2 className="mt-40">6 rules from research:<br />AI goes first, the creator decides</H2>
          <p className="g-body mt-16">Research on sensemaking showed that beginners need a starting point, not more charts. So the AI should act as a guide, not a judge. Its suggestions must be easy to check and change.</p>
        </div>
        <Bounce className="g-rules mt-40" step={0.15}>
          {RULES.map(([t, p], i) => (
            <div className="g-rule" key={t}>
              <span className="n">0{i + 1}</span>
              <div><h4 className="g-h4">{t}</h4><p>{p}</p></div>
            </div>
          ))}
        </Bounce>
        <div className="g-two mt-40">
          <div className="g-board" data-r style={d(0)}><img src={IMG.story} alt="User story: sensemaking dashboard concept in 6 panels" loading="lazy" data-gzoom="true" /></div>
          <div className="g-board" data-r style={d(1)}><img src={IMG.sketch} alt="Low-fi sketch of metric groups" loading="lazy" /></div>
        </div>
        <div className="g-two mt-40">
          <img className="g-photo" data-r style={d(0)} src={IMG.photo1} alt="Harbor working on the GameCove ideas with her teammate" loading="lazy" />
          <img className="g-photo" data-r style={d(1)} src={IMG.photo2} alt="Harbor discussing the GameCove sketches" loading="lazy" />
        </div>
      </div>
    </section>
  )
}

/* ---------- prototype ---------- */

/** the design flow lights up step by step as it scrolls in */
function Flow() {
  const [ref, shown] = useShownOnce<HTMLDivElement>(0.6)
  const steps = ['Low-fi sketch', 'Wireflow (teacher review)', 'Mid-fi', 'Metrics locked', 'Page hierarchy', 'Hi-fi', 'Vibe-coded prototype']
  return (
    <div ref={ref} className="g-flow mt-40" data-r>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          {i > 0 && <span className="arr" aria-hidden="true">→</span>}
          <span className={'step' + (i >= 5 ? ' hi' : '') + (shown ? ' on' : '')} style={{ transitionDelay: `${i * 0.18}s` }}>{s}</span>
        </React.Fragment>
      ))}
    </div>
  )
}

function Prototype() {
  return (
    <section className="g-sec" data-chapter="Prototype">
      <div className="g-wrap">
        <div data-r className="w-760">
          <Eyebrow label="PROTOTYPE" sq="blue" />
          <H2 className="mt-40">From sketch to a coded prototype</H2>
          <p className="g-body mt-40">We locked the metrics and page order before hi-fi. Then we built a clickable prototype with a sample game, BounceBounce (Lobby and Stage 1–4), filled with 3 weeks of Roblox-style data and 1 week of GameCove tracking data for the test.</p>
        </div>
        <Flow />
        <div className="g-two mt-40">
          <div className="g-board" data-r style={d(0)}><img src={IMG.midfi} alt="Mid-fi revision board" loading="lazy" data-gzoom="true" /></div>
          <div className="g-board" data-r style={d(1)}><img src={IMG.hifi} alt="Hi-fi Retention screen" loading="lazy" data-gzoom="true" /></div>
        </div>
      </div>
    </section>
  )
}

/* ---------- final design: live prototype tour + one labelled design-system screen ---------- */

// Screens captured from the live prototype (VIBE_URL) at 1440×900.
type Shot = 'map' | 'ask' | 'goal' | 'board' | 'agent' | 'overview'
const F = V + 'final/'
const SHOTS: Record<Shot, string> = {
  map: F + 'map.webp', ask: F + 'ask.webp', goal: F + 'goal.webp', board: F + 'board.webp', agent: F + 'agent.webp', overview: F + 'overview.webp',
}

const PW = 1440, PH = 900
const TABS = ['AI Mapping', 'Goal-based setup', 'AI agent']
// r = highlighted area on the 1440×900 screen: [x, y, width, height]
const TOUR: { tab: number; shot: Shot; r: [number, number, number, number]; cap: string; alt: string }[] = [
  { tab: 0, shot: 'map', r: [283, 428, 1126, 125], cap: 'AI reads the game script and draws it as a map: Lobby → Stage 1–4. The creator checks it before anything is tracked.', alt: 'Tracking: the AI map of Lobby and Stage 1–4, with Stage 3 flagged for review' },
  { tab: 0, shot: 'ask', r: [1022, 477, 405, 284], cap: 'When the AI can’t tell how a stage ends, it asks instead of guessing. The creator picks the answer.', alt: 'Stage 3 detail panel asking which part is the end point' },
  { tab: 1, shot: 'goal', r: [636, 390, 566, 143], cap: 'A new board starts from a goal in plain words, not from a blank chart.', alt: 'New analysis board: What would you like to analyze? with three suggested goals' },
  { tab: 1, shot: 'board', r: [990, 62, 436, 826], cap: 'GameCove builds the board for that goal, says what each chart answers, and flags what isn’t tracked yet.', alt: 'Analysis board for stage difficulty and drop-off, with the AI explaining each chart' },
  { tab: 2, shot: 'agent', r: [990, 62, 436, 806], cap: 'Ask about any page in plain words. The agent explains each chart and suggests the next question.', alt: 'Overview with the AI agent explaining the daily charts' },
]
const TOUR_SHOTS = Array.from(new Set(TOUR.map(s => s.shot)))
const pc = (v: number, of: number) => `${(v / of) * 100}%`
const letterOf = (i: number) => String.fromCharCode(65 + TOUR.slice(0, i).filter(s => s.tab === TOUR[i].tab).length)

/** one screen with the dimmed spotlight + caption card (caption sits on the side away from the highlight) */
function TourStage({ step, lit, single = false }: { step: number; lit: boolean; single?: boolean }) {
  const s = TOUR[step]
  const capLeft = s.r[0] + s.r[2] / 2 > PW / 2
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
        <div key={step} className={'g-capcard ' + (capLeft ? 'at-l' : 'at-r') + (lit ? ' lit' : '')}>
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

// Labels read from the live Overview screen (computed styles), mapped to the GameCove tokens.
const AW = 1000, AH = 337.5, SX = 230, SW = 540 // annotation canvas; the screen fills 230–770
const DS_LABELS: { side: 'l' | 'r'; y: number; x: number; dy: number; t: string; v: string }[] = [
  { side: 'l', y: 8, x: 289, dy: 114, t: 'Display/Page', v: 'Lato Bold 40 / 110%' },
  { side: 'l', y: 28, x: 289, dy: 151, t: 'Body/Default', v: 'Regular 16 / 160% · sand/300 #A7A9B0' },
  { side: 'l', y: 48, x: 310, dy: 281, t: 'KPI number', v: 'Lato Bold 40 · sand/100 #F2F0EC' },
  { side: 'l', y: 68, x: 311, dy: 334, t: 'Drop badge', v: 'Red #E28B8B on a 14% red tint' },
  { side: 'l', y: 90, x: 470, dy: 770, t: 'Area chart', v: 'chart-area-primary gradient' },
  { side: 'r', y: 8, x: 1296, dy: 25, t: 'AI accent', v: 'blue/200 #B3D1FF, only on AI features' },
  { side: 'r', y: 32, x: 880, dy: 165, t: 'color/bg/canvas', v: 'neutral/900 #111114' },
  { side: 'r', y: 56, x: 559, dy: 209, t: 'Card', v: 'neutral/850 #17171B · radius lg 16' },
]

function LabelledScreen() {
  const [ref, shown] = useShownOnce<HTMLDivElement>(0.35)
  return (
    <div ref={ref} className={'g-anno mt-40' + (shown ? ' in' : '')}>
      <svg className="g-anno-lines" viewBox={`0 0 ${AW} ${AH}`} preserveAspectRatio="none" aria-hidden="true">
        {DS_LABELS.map((l, i) => {
          const X = SX + (SW * l.x) / PW, Y = (AH * l.dy) / PH, Ly = (AH * l.y) / 100
          const a = l.side === 'l' ? 214 : 786, b = l.side === 'l' ? 226 : 774
          return <polyline key={i} points={`${a},${Ly} ${b},${Ly} ${X},${Y}`} pathLength={1} style={{ transitionDelay: `${0.3 + i * 0.08}s` }} />
        })}
      </svg>
      <div className="g-anno-screen">
        <img src={SHOTS.overview} alt="GameCove Overview screen with its design tokens labelled" loading="lazy" />
        {DS_LABELS.map((l, i) => (
          <span key={i} className="dot" style={{ left: pc(l.x, PW), top: pc(l.dy, PH), transitionDelay: `${0.2 + i * 0.08}s` }} aria-hidden="true">{i + 1}</span>
        ))}
      </div>
      <ol className="g-anno-labs">
        {DS_LABELS.map((l, i) => (
          <li key={i} className={l.side} style={{ top: `${l.y}%`, transitionDelay: `${0.4 + i * 0.08}s` }}>
            <b><span>{i + 1}</span>{l.t}</b><em>{l.v}</em>
          </li>
        ))}
      </ol>
    </div>
  )
}

function FinalDesign() {
  const [ref, p] = useCountProgress<HTMLDivElement>()
  return (
    <section className="g-sec" data-chapter="Final design">
      <div className="g-wrap">
        <div data-r className="w-760">
          <Eyebrow label="PROTOTYPE · FINAL DESIGN" sq="blue" />
          <H2 className="mt-40">The final design: 3 features</H2>
          <p className="g-body mt-16">Feature 1 is what makes GameCove different from other dashboards. Features 2 and 3 build on the map it creates. Scroll through the live prototype.</p>
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
        <LabelledScreen />
      </div>
    </section>
  )
}

/* ---------- test ---------- */

function Sus() {
  const [ref, p] = useCountProgress<HTMLDivElement>()
  return (
    <div className="g-card sus" ref={ref} data-r>
      <div className="g-num big light">{count(85.5, p)}</div>
      <div className="g-cap">average SUS score (A+). Our goal was 90.</div>
      <div className="sus-bar mt-24" aria-hidden="true"><i style={{ width: `${85.5 * p}%` }} /><b style={{ left: '90%' }} /></div>
    </div>
  )
}

const FIXES = [
  ['Mapping', 'Starts with no reason given', 'Explains the purpose first: “check your game’s structure so the analysis fits”'],
  ['AI setup', 'Approval step is easy to miss', 'A clear approval step, plus a screen that shows what was applied'],
  ['AI agent', 'One button in the top bar', '“Ask AI” next to each chart'],
  ['Charts', 'Striped bars, hover to see numbers', 'Standard charts by default, key numbers always shown, benchmarks from similar games'],
]

/** one fix: the card flips Before → After in 3D when it reaches the middle of the screen (scroll back flips it back) */
function FixCard({ k, before, after }: { k: string; before: string; after: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [after_, setAfter] = useState(false)
  useOnScroll(() => { const el = ref.current; if (el) setAfter(el.getBoundingClientRect().top < innerHeight * 0.5) })
  return (
    <div className="g-fix" ref={ref}>
      <div className="fix-k">{k}</div>
      <div className="fix-flip">
        <div className="fix-inner" style={{ transform: `rotateY(${after_ ? 180 : 0}deg)` }}>
          <div className="face before"><span className="lab">Before</span><p>{before}</p></div>
          <div className="face after"><span className="lab">After</span><p>{after}</p></div>
        </div>
      </div>
    </div>
  )
}

function Test() {
  return (
    <section className="g-sec" data-chapter="Test">
      <div className="g-wrap">
        <div className="g-test-top">
          <div data-r>
            <Eyebrow label="TEST" sq="blue" />
            <H2 className="mt-40">Usability test: the flow worked,<br />the start didn’t</H2>
            <p className="g-body mt-16">5 remote sessions with think-aloud. 3 tasks: check the map, pick a goal, then explore the data and decide what to fix. We didn’t tell anyone to use the AI agent. We wanted to see if they would find it.</p>
          </div>
          <Sus />
        </div>

        <h3 className="g-h3 mt-80" data-r>We hid 3 problems in the sample data</h3>
        <div className="g-table-wrap mt-24" data-r>
          <table className="g-table">
            <thead><tr><th>Hidden problem</th><th>Found?</th><th>Who found it</th></tr></thead>
            <tbody>
              <tr><td className="b">A · Stage 4 is too hard</td><td className="ok">Found</td><td>1 participant (the expert), via the AI briefing</td></tr>
              <tr><td className="b">B · New players leave early</td><td className="ok">Found</td><td>2 participants, from the Lobby → Stage 1 drop</td></tr>
              <tr><td className="b">C · Players quit after finishing</td><td className="no">Not found</td><td>No one</td></tr>
            </tbody>
          </table>
        </div>
        <p className="g-body mt-40 w-760" data-r>Finding problems we planned is stronger proof than “users found a problem”. 3 of 3 core participants used data to form a hypothesis.</p>

        <h3 className="g-h3 mt-80" data-r>Who took part</h3>
        <div className="g-table-wrap mt-24" data-r>
          <table className="g-table">
            <thead><tr><th /><th>Who</th><th>Role in the analysis</th></tr></thead>
            <tbody>
              <tr><td className="b">P1</td><td>Teen, plans and builds games (Roblox, Unity, Unreal)</td><td>Pilot. The flow changed after it, so we analysed it separately</td></tr>
              <tr><td className="b">P2</td><td>35–44, solo Roblox creator, 1–3 years</td><td>Core</td></tr>
              <tr><td className="b">P3</td><td>28–35, professional game planner and developer</td><td>Core (our only expert)</td></tr>
              <tr><td className="b">P4</td><td>Teen, solo Roblox creator, 1–3 years</td><td>Left out of the core analysis: language made the tasks hard to follow</td></tr>
              <tr><td className="b">P5</td><td>Teen, solo Roblox and Unity creator</td><td>Core</td></tr>
            </tbody>
          </table>
        </div>
        <p className="g-cap mt-24" data-r>Teen participants joined with guardian consent. Names, faces and recordings are not shown.</p>

        <h3 className="g-h3 mt-80" data-r>What worked</h3>
        <div className="g-list mt-24">
          {[
            ['Goal-based tracking', 'All 3 core participants liked picking a goal and getting a list of what to track. It took away the part they found hardest.'],
            ['Data to decision', 'All 3 found a problem in the data and suggested a fix. P2 used the AI agent to double-check their own idea, P3 spotted Stage 4 from the AI briefing, and P5 found the Lobby drop without the AI.'],
            ['Mapping, once explained', 'After we explained what mapping was for, the expert said it was a step the product really needs.'],
          ].map(([t, p], i) => <div className="g-row" key={t} data-r style={d(i)}><span className="n">0{i + 1}</span><b>{t}</b><p>{p}</p></div>)}
        </div>

        <h3 className="g-h3 mt-80" data-r>What slowed users down</h3>
        <div className="g-list mt-24">
          {[
            ['Mapping', 'Users understood the map, but not why they were making it. Even the expert thought he was designing a new game.'],
            ['AI setup', 'Users couldn’t check what the AI had set up, so they felt unsure about it.'],
            ['AI agent', 'One user never noticed the AI agent.'],
            ['Charts', 'Striped charts tired some users’ eyes. Numbers only showed on hover.'],
          ].map(([t, p], i) => <div className="g-row" key={t} data-r style={d(i)}><span className="n">0{i + 1}</span><b>{t}</b><p>{p}</p></div>)}
        </div>

        <h3 className="g-h3 mt-80" data-r>What we’re fixing</h3>
        <div className="g-fixes mt-24">
          {FIXES.map(([k, b, a]) => <FixCard key={k} k={k} before={b} after={a} />)}
        </div>
        <div className="g-two mt-40">
          <figure className="g-fig" data-r style={d(0)}>
            <div className="g-board"><img src={IMG.before} alt="Before: the mapping screen starts without saying why" loading="lazy" /></div>
            <figcaption className="g-cap mt-8">Before · Mapping without purpose guide</figcaption>
          </figure>
          <figure className="g-fig" data-r style={d(1)}>
            <Slot label="Image · After · revised screen" ratio="700 / 470" />
            <figcaption className="g-cap mt-8">After · revised screen</figcaption>
          </figure>
        </div>
        <div className="g-note mt-40" data-r>
          <div className="g-k blue">LIMITS</div>
          <p>Only 3 people were in the core analysis, and most participants were teens. That doesn’t match our target of small studios. The sample game was simple, and logging settings didn’t flow into the dashboard. These results show a direction, not proof.</p>
        </div>
      </div>
    </section>
  )
}

/* ---------- reflection ---------- */

function Reflection() {
  return (
    <section className="g-sec last" data-chapter="Reflection">
      <div className="g-wrap">
        <div data-r><Eyebrow label="REFLECTION" sq="sky" /><H2 className="mt-40">Takeaways</H2></div>
        <div className="g-take mt-40">
          {[
            'Users expect AI to give the answer. My next challenge is helping them reason for themselves, not just accept what AI says.',
            'Score “doing” and “understanding” separately. A user can press confirm without knowing why. That is how we found the mapping problem.',
            'Handoff goes both ways. As a receiver, I want to see the process as it happens. As a giver, I should explain every step.',
          ].map((t, i) => <p key={i} data-r style={d(i)}><span>0{i + 1}</span>{t}</p>)}
        </div>
        <div className="g-cap mt-80" data-r>Next steps</div>
        <div className="g-next mt-24">
          {[
            'Test the fixes with one more user on a real desktop screen, and compare before and after.',
            'Test with adult creators from small studios.',
            'After launch, track setup completion, AI agent use and weekly return visits.',
          ].map((t, i) => <p key={i} data-r style={d(i)}><span>0{i + 1}</span>{t}</p>)}
        </div>
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
      <Hero />
      <Overview />
      <Process />
      <Empathize />
      <Define />
      <Ideate />
      <Prototype />
      <FinalDesign />
      <Test />
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
.gc4 .g-btn { position: relative; display: inline-flex; align-items: center; gap: 10px; margin-top: 36px; padding: 15px 28px; border-radius: 999px; color: #F2F0EC; font-size: 16px; font-weight: 500; text-decoration: none;
  background: linear-gradient(180deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,.02) 55%, rgba(0,0,0,.25) 100%), #141417;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.22), inset 0 -1px 0 rgba(0,0,0,.6), 0 10px 30px rgba(0,0,0,.45);
  transition: transform .35s var(--ease), box-shadow .35s var(--ease), background .35s; }
.gc4 .g-btn::before { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,.12) 45%, rgba(255,255,255,.28));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
.gc4 .g-btn:hover { transform: translateY(-2px); box-shadow: inset 0 1px 0 rgba(255,255,255,.3), inset 0 -1px 0 rgba(0,0,0,.6), 0 14px 36px rgba(0,0,0,.5), 0 0 28px rgba(56,152,248,.25); }
.gc4 .g-btn:focus-visible { outline: 2px solid var(--sky); outline-offset: 3px; }
.gc4 .g-btn-arrow { font-size: 16px; color: var(--sky); transition: transform .35s var(--ease); }
.gc4 .g-btn:hover .g-btn-arrow { transform: translate(2px, -2px); }
.gc4 .g-process { overflow: hidden; border-radius: 12px; border: 1px solid var(--line); background: #0B0B0D; }
.gc4 .g-process img { display: block; width: 100%; height: auto; }
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

/* process accordion */
.gc4 .acc { display: flex; gap: 16px; height: 560px; }
.gc4 .acc-card { position: relative; flex: 220 1 0; min-width: 0; overflow: hidden; display: flex; flex-direction: column; align-items: flex-start; padding: 32px 28px; text-align: left; cursor: pointer;
  background: var(--card); border: 1px solid var(--line); border-radius: 12px; color: var(--sand); font: inherit;
  transition: flex .45s var(--ease), background-color .35s, border-color .35s, box-shadow .35s; }
.gc4 .acc-card.on { flex-grow: 480; background: var(--raised); border-color: var(--strong); box-shadow: 0 24px 48px rgba(0,0,0,.35); }
.gc4 .acc-card:focus-visible { outline: 2px solid var(--sky); outline-offset: 2px; }
.gc4 .acc-stage { font-size: 24px; font-weight: 700; letter-spacing: .02em; }
.gc4 .acc-title { display: flex; gap: 12px; margin-top: 20px; width: 100%; max-width: 180px; font-size: 18px; font-weight: 700; line-height: 1.45; color: var(--sand); transition: max-width .45s var(--ease); }
.gc4 .acc-title b { color: var(--blue); font-weight: 700; }
.gc4 .acc-card.on .acc-title { max-width: 440px; }
.gc4 .acc-body { position: absolute; left: 28px; top: 150px; width: 440px; max-width: calc(100% - 56px); opacity: 0; transition: opacity .12s; pointer-events: none; }
.gc4 .acc-card.on .acc-body { opacity: 1; transition: opacity .3s ease .18s; pointer-events: auto; }
.gc4 .acc-body ul { margin: 0; padding: 0; list-style: none; }
.gc4 .acc-body li { padding: 6px 0; font-size: 16px; color: var(--text); }
.gc4 .acc-body img { width: 100%; margin-top: 20px; border-radius: 8px; object-fit: cover; object-position: top left; }
.gc4 .acc-narrow { display: none; }
.gc4 .g-turns p { display: flex; gap: 12px; padding: 6px 0; font-size: 18px; line-height: 1.5; color: #6FB2FA; }

/* boards / images */
.gc4 .g-two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 40px; }
.gc4 .g-board { overflow: hidden; border-radius: 12px; background: var(--raised); }
.gc4 .g-board img { width: 100%; height: auto; }
.gc4 .g-photo { width: 100%; aspect-ratio: 700 / 467; object-fit: cover; border-radius: 12px; }
.gc4 .g-slot { display: flex; align-items: center; justify-content: center; width: 100%; padding: 24px; text-align: center; border-radius: 12px; border: 1px dashed var(--strong); background: var(--card); color: var(--dim); font-size: 16px; }
.gc4 .g-hair { height: 1px; margin: 40px 0; border: 0; background: var(--line); }

/* empathize */
.gc4 .g-chain { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; }
.gc4 .g-chain .pill { padding: 14px 24px; border-radius: 999px; font-size: 18px; font-weight: 700; background: var(--card); color: var(--sand); opacity: .35; transform: scale(.94);
  transition: opacity .5s ease, transform .7s cubic-bezier(0.34, 1.56, 0.64, 1), background-color .5s, color .5s; }
.gc4 .g-chain .pill.on { opacity: 1; transform: scale(1); }
.gc4 .g-chain .pill.on:not(.first) { background: var(--sky); color: #111114; }
.gc4 .g-chain .arr { font-size: 20px; color: var(--mute); opacity: 0; transition: opacity .4s ease; }
.gc4 .g-chain .arr.on { opacity: 1; }
.gc4 .g-table-wrap { overflow-x: auto; }
.gc4 .g-table { width: 100%; border-collapse: collapse; }
.gc4 .g-table th { padding: 14px 24px 14px 0; text-align: left; font-size: 16px; font-weight: 400; color: var(--dim); border-bottom: 1px solid var(--line); }
.gc4 .g-table td { padding: 16px 24px 16px 0; font-size: 17px; line-height: 1.5; color: var(--text); border-bottom: 1px solid var(--line); vertical-align: top; }
.gc4 .g-table td.b { font-weight: 700; color: var(--sand); white-space: nowrap; }
.gc4 .g-table td.ok { color: var(--ok); font-weight: 700; } .gc4 .g-table td.no { color: var(--coral); font-weight: 700; }
.gc4 .g-scenario { display: grid; grid-template-columns: 370px minmax(0, 1fr); gap: 40px; padding: 56px 56px; border-radius: 12px; background: var(--card); }
.gc4 .g-sc-name { margin-top: 12px; font-size: 36px; font-weight: 700; letter-spacing: -0.01em; }

/* define */
.gc4 .g-hmw { padding: 88px 40px; border-radius: 12px; background: var(--skybg); text-align: center; }
.gc4 .g-hmw .hmw-q { margin-top: 24px; font-size: clamp(28px, 2.4vw, 38px); font-weight: 700; line-height: 1.25; color: var(--sand); }
.gc4 .g-pick { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.gc4 .g-qs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px; }
.gc4 .bounce { display: flex; }
.gc4 .bounce > * { flex: 1; }
.gc4 .g-card { display: flex; flex-direction: column; gap: 12px; padding: 32px; border-radius: 12px; background: var(--card); border: 1px solid transparent; transition: border-color .3s, box-shadow .4s, transform .4s var(--ease); }
.gc4 .g-card:hover { border-color: var(--strong); box-shadow: 0 18px 40px rgba(0,0,0,.3); }
.gc4 .g-card.now { background: var(--skybg); }
.gc4 .g-card p { font-size: 17px; line-height: 1.6; color: var(--text); }
.gc4 .g-card.q { min-height: 280px; }
.gc4 .q-k { font-size: 40px; font-weight: 700; line-height: 1; color: var(--blue); }
.gc4 .q-a { margin-top: auto; padding-top: 12px; font-size: 16px; font-weight: 700; color: #6FB2FA; }

/* ideate */
.gc4 .g-rules { display: grid; grid-template-columns: 1fr 1fr; column-gap: 40px; }
.gc4 .g-rule { display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 12px; padding: 28px 0; border-top: 1px solid var(--line); }
.gc4 .g-rule .n { font-size: 16px; color: var(--blue); padding-top: 3px; }
.gc4 .g-rule p { margin-top: 10px; font-size: 17px; line-height: 1.6; color: var(--text); }

/* prototype flow */
.gc4 .g-flow { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.gc4 .g-flow .step { padding: 12px 20px; border-radius: 999px; font-size: 17px; color: var(--sand); opacity: .3; transition: opacity .5s ease, background-color .5s, color .5s; }
.gc4 .g-flow .step.on { opacity: 1; }
.gc4 .g-flow .step.hi.on { background: var(--sky); color: #111114; font-weight: 700; }
.gc4 .g-flow .arr { color: var(--mute); }

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
.gc4 .g-spot.lit { border-color: var(--sky); box-shadow: 0 0 0 200vmax rgba(8,8,11,.66), 0 0 32px rgba(56,152,248,.25); }
.gc4 .g-spot b { position: absolute; left: -14px; top: -14px; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%;
  background: var(--sky); color: #111114; font-size: 16px; font-weight: 700; opacity: 0; transform: scale(.6); transition: opacity .4s ease .2s, transform .5s cubic-bezier(0.34, 1.56, 0.64, 1) .2s; }
.gc4 .g-spot.lit b { opacity: 1; transform: none; }
.gc4 .g-capcard { position: absolute; z-index: 3; top: 20px; display: flex; gap: 12px; align-items: flex-start; max-width: min(360px, 40%); padding: 16px 18px; border-radius: 10px;
  border: 1px solid var(--strong); background: rgba(17,17,20,.9); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); opacity: 0; transform: translateY(8px); transition: opacity .5s ease, transform .6s var(--ease); }
.gc4 .g-capcard.at-r { right: 20px; } .gc4 .g-capcard.at-l { left: 20px; }
.gc4 .g-capcard.lit { opacity: 1; transform: none; transition-delay: .15s; }
.gc4 .g-capcard b { flex: none; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--sky); color: var(--sky); font-size: 16px; }
.gc4 .g-capcard p { font-size: 16px; line-height: 1.55; color: var(--sand); }
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

/* test */
.gc4 .g-test-top { display: grid; grid-template-columns: minmax(0, 760px) minmax(0, 420px); justify-content: space-between; gap: 40px; align-items: end; }
.gc4 .g-card.sus { gap: 8px; }
.gc4 .sus-bar { position: relative; height: 6px; border-radius: 3px; background: var(--strong); }
.gc4 .sus-bar i { position: absolute; inset: 0 auto 0 0; border-radius: 3px; background: var(--blue); }
.gc4 .sus-bar b { position: absolute; top: -6px; width: 2px; height: 18px; background: var(--sky); }
.gc4 .g-row { display: grid; grid-template-columns: 48px 240px minmax(0, 1fr); gap: 16px; padding: 22px 0; border-top: 1px solid var(--line); font-size: 18px; }
.gc4 .g-list .g-row:last-child { border-bottom: 1px solid var(--line); }
.gc4 .g-row .n { color: var(--blue); font-size: 16px; padding-top: 2px; }
.gc4 .g-row p { line-height: 1.6; color: var(--text); }
.gc4 .g-fixes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.gc4 .g-fix { display: flex; flex-direction: column; gap: 12px; }
.gc4 .fix-k { font-size: 20px; font-weight: 700; }
.gc4 .fix-flip { perspective: 1200px; }
.gc4 .fix-inner { position: relative; min-height: 150px; transform-style: preserve-3d; transition: transform .9s cubic-bezier(.22,1,.36,1); }
.gc4 .face { position: absolute; inset: 0; display: flex; flex-direction: column; gap: 10px; padding: 24px 28px; border-radius: 12px; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.gc4 .face.before { background: var(--card); border: 1px solid var(--line); }
.gc4 .face.after { background: var(--skybg); transform: rotateY(180deg); }
.gc4 .face .lab { font-size: 16px; font-weight: 700; letter-spacing: .06em; color: var(--dim); }
.gc4 .face.after .lab { color: var(--sky); }
.gc4 .face p { font-size: 18px; line-height: 1.55; color: var(--sand); }

/* reflection */
.gc4 .g-take p { display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 8px; max-width: 900px; padding: 14px 0; font-size: 18px; line-height: 1.6; color: var(--text); }
.gc4 .g-take span, .gc4 .g-next span { color: var(--sky); }
.gc4 .g-next p { display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 8px; padding: 10px 0; font-size: 22px; line-height: 1.45; color: var(--sand); }

@media (max-width: 1280px) {
  .gc4 .g-ov, .gc4 .g-scenario, .gc4 .g-test-top { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .gc4 .g-anno { aspect-ratio: auto; }
  .gc4 .g-anno-lines { display: none; }
  .gc4 .g-anno-screen { position: relative; left: 0; width: 100%; }
  .gc4 .g-anno-labs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 32px; margin-top: 24px; }
  .gc4 .g-anno-labs li, .gc4 .g-anno-labs li.l, .gc4 .g-anno-labs li.r { position: static; width: auto; transform: none; text-align: left; align-items: flex-start; }
  .gc4 .g-anno-labs b span { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: var(--sky); color: #111114; font-size: 13px; }
  .gc4 .g-anno-labs em { padding-left: 30px; }
  .gc4 .g-anno-screen .dot { width: 22px; height: 22px; margin: -11px 0 0 -11px; font-size: 13px; }
}
@media (max-width: 1023px) {
  .gc4 .acc { display: none; }
  .gc4 .acc-narrow { display: flex; flex-direction: column; gap: 16px; }
  .gc4 .acc-narrow .acc-card { flex: none; cursor: default; }
  .gc4 .acc-narrow .acc-title { max-width: none; }
  .gc4 .acc-narrow .acc-body { position: static; width: auto; max-width: none; margin-top: 20px; opacity: 1; }
  .gc4 .g-tour-outer { display: none; }
  .gc4 .g-tour-narrow { display: flex; flex-direction: column; gap: 48px; }
  .gc4 .g-two, .gc4 .g-pick, .gc4 .g-qs, .gc4 .g-rules, .gc4 .g-fixes, .gc4 .g-meta, .gc4 .g-stats { grid-template-columns: minmax(0, 1fr); gap: 32px; }
  .gc4 .g-sys { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 24px; }
}
@media (max-width: 700px) {
  .gc4 .g-wrap { padding: 0 20px; }
  .gc4 .g-sec { padding-top: 88px; }
  .gc4 .g-hero { padding-top: 120px; }
  .gc4 .g-anno-labs { grid-template-columns: minmax(0, 1fr); }
  .gc4 .g-row { grid-template-columns: 40px minmax(0, 1fr); } .gc4 .g-row p { grid-column: 2; }
  .gc4 .g-scenario { padding: 28px; }
  .gc4 .g-hmw { padding: 56px 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .gc4 [data-r] { opacity: 1 !important; transform: none !important; transition: none !important; }
  .gc4 .acc-card, .gc4 .acc-title, .gc4 .fix-inner, .gc4 .g-stage img, .gc4 .g-spot, .gc4 .g-spot b, .gc4 .g-capcard, .gc4 .g-tab i, .gc4 .g-anno *, .gc4 .g-anno-lines polyline { transition: none !important; }
}
`
