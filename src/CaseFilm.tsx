import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * The opening film shared by the UTrada and ETO Markets case studies (v135, Harbor Nov 16).
 *
 * <CaseFilm>: the film with its control bar. The bar is the same as Trust Bank's hero film (p1/TrustHero.tsx) —
 * Harbor asked for "the bar under the video like the other pages", not the square version UTrada had:
 * a soft dark gradient from the bottom (48px top / 20px sides / 16px bottom), a 4px round progress line with a round
 * 12px thumb, then a row 12px below it: round 36px play/pause button (soft white circle on hover), the time in 16px,
 * and on the right the round sound button with a 100px round volume line. Shown on hover or keyboard focus only,
 * never during the full-screen intro.
 * The pages force square corners on everything (.u3 * { border-radius: 0 !important }); the bar's own rules below are
 * more specific, so its round buttons and lines stay round.
 *
 * useCaseIntro(): the full-screen opening. The film's box starts over the whole screen and eases into its own slot
 * under the headline. The screen stays dark until the film really plays; HOLD_MS later it moves on its own (1s ease
 * in-out). Scrolling, swiping or a key press starts the move at once; the page can't scroll until the film has settled.
 */

const HOLD_MS = 5000
const ANIM_MS = 1000
const WAIT_MS = 2500

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2)
const fmt = (t: number) => (!isFinite(t) ? '0:00' : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`)

export function CaseFilm({ src, poster, label, quiet, introRef }: { src: string; poster: string; label: string; quiet: boolean; introRef: React.RefObject<HTMLVideoElement> }) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [volume, setVolume] = useState(0.5)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const show = !quiet && (hover || focus)
  useEffect(() => {
    const v = introRef.current; if (!v) return
    v.volume = 0.5; v.muted = true; v.play().catch(() => {})
  }, [introRef])
  const v = () => introRef.current
  const togglePlay = () => { const x = v(); if (!x) return; if (x.paused) x.play().catch(() => {}); else x.pause() }
  const toggleMute = () => { const x = v(); if (!x) return; x.muted = !x.muted; if (!x.muted && x.volume === 0) x.volume = 0.5; setMuted(x.muted); setVolume(x.volume) }
  const changeVolume = (val: number) => { const x = v(); if (!x) return; x.volume = val; x.muted = val === 0; setVolume(val); setMuted(x.muted) }
  const seek = (val: number) => { const x = v(); if (!x || !duration) return; x.currentTime = val; setTime(val) }
  const shownVolume = muted ? 0 : volume
  const pct = duration ? (time / duration) * 100 : 0
  const tab = quiet ? -1 : undefined
  return (
    <div className="cf-film" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setFocus(true)} onBlurCapture={() => setFocus(false)}>
      <style>{CASE_FILM_CSS}</style>
      <video ref={introRef} src={src} poster={poster} muted loop playsInline preload="auto" aria-label={label}
        onClick={togglePlay} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onTimeUpdate={e => setTime(e.currentTarget.currentTime)} onLoadedMetadata={e => setDuration(e.currentTarget.duration)} />
      <div className={'cf-ctl' + (show ? ' show' : '')} aria-hidden={quiet || undefined}>
        <input type="range" min={0} max={duration || 0} step={0.01} value={time} onChange={e => seek(Number(e.target.value))} tabIndex={tab}
          aria-label="Video progress" className="cf-range wide" style={{ '--fill': `${pct}%` } as React.CSSProperties} />
        <div className="cf-row">
          <button type="button" onClick={togglePlay} tabIndex={tab} aria-label={playing ? 'Pause' : 'Play'} className="cf-btn">
            {playing
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" /></svg>}
          </button>
          <span className="cf-time">{fmt(time)} / {fmt(duration)}</span>
          <div className="cf-vol">
            <button type="button" onClick={toggleMute} tabIndex={tab} aria-label={muted ? 'Turn sound on' : 'Mute'} className="cf-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" />
                {shownVolume === 0
                  ? <><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></>
                  : <><path d="M15.5 8.5a5 5 0 0 1 0 7" />{shownVolume > 0.5 && <path d="M19 5a10 10 0 0 1 0 14" />}</>}
              </svg>
            </button>
            <input type="range" min={0} max={1} step={0.01} value={shownVolume} onChange={e => changeVolume(Number(e.target.value))} tabIndex={tab}
              aria-label="Volume" className="cf-range vol" style={{ '--fill': `${shownVolume * 100}%` } as React.CSSProperties} />
          </div>
        </div>
      </div>
    </div>
  )
}

/** the full-screen opening: the film's box starts over the whole screen and eases into its own slot */
export function useCaseIntro(on: boolean, slot: React.RefObject<HTMLDivElement>, box: React.RefObject<HTMLDivElement>, media: React.RefObject<HTMLVideoElement>, onDone: () => void) {
  const done = useRef(onDone); done.current = onDone
  useLayoutEffect(() => {
    const s = slot.current, b = box.current, m = media.current
    if (!on || !s || !b) { done.current(); return }
    const root = document.documentElement
    const keep = { overflow: root.style.overflow, gutter: root.style.getPropertyValue('scrollbar-gutter') }
    scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    root.style.overflow = 'hidden'
    root.style.setProperty('scrollbar-gutter', 'stable')
    // dark until the film really plays, then one soft fade in (no white box, no poster flash)
    const poster = m?.getAttribute('poster') ?? null
    if (m) { m.removeAttribute('poster'); m.style.transition = 'opacity .5s ease'; m.style.opacity = '0' }
    const showMedia = () => { if (m) m.style.opacity = '1' }
    const restoreMedia = () => { if (!m) return; m.style.opacity = ''; m.style.transition = ''; if (poster && !m.getAttribute('poster')) m.setAttribute('poster', poster) }

    const apply = (e: number) => {
      const vh = innerHeight, vw = root.clientWidth
      const r = s.getBoundingClientRect()
      b.style.left = `${(-r.left * (1 - e)).toFixed(2)}px`
      b.style.top = `${(-r.top * (1 - e)).toFixed(2)}px`
      b.style.width = `${(vw + (r.width - vw) * e).toFixed(2)}px`
      b.style.height = `${(vh + (r.height - vh) * e).toFixed(2)}px`
    }
    let animStart = Infinity, raf = 0, finished = false
    const startHold = () => { showMedia(); if (animStart === Infinity) animStart = performance.now() + HOLD_MS }
    const skip = () => { showMedia(); const now = performance.now(); if (now < animStart) animStart = now }
    const tWait = window.setTimeout(() => {
      if (m && m.paused && poster && !m.getAttribute('poster')) m.setAttribute('poster', poster)
      startHold()
    }, WAIT_MS)
    m?.addEventListener('playing', startHold)
    if (m && !m.paused && m.readyState >= 3) startHold()
    const unlock = () => {
      root.style.overflow = keep.overflow
      if (keep.gutter) root.style.setProperty('scrollbar-gutter', keep.gutter)
      else root.style.removeProperty('scrollbar-gutter')
      removeEventListener('wheel', skip); removeEventListener('touchmove', skip); removeEventListener('keydown', skip)
      m?.removeEventListener('playing', startHold)
      window.clearTimeout(tWait)
    }
    const finish = () => {
      finished = true
      Object.assign(b.style, { left: '0px', top: '0px', width: '100%', height: '100%' })
      unlock(); restoreMedia(); done.current()
    }
    const frame = (now: number) => {
      if (scrollY !== 0) scrollTo(0, 0)
      const p = clamp((now - animStart) / ANIM_MS)
      apply(ease(p))
      if (p >= 1) finish()
      else raf = requestAnimationFrame(frame)
    }
    apply(0)
    raf = requestAnimationFrame(frame)
    addEventListener('wheel', skip, { passive: true })
    addEventListener('touchmove', skip, { passive: true })
    addEventListener('keydown', skip)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      if (!finished) { unlock(); restoreMedia(); Object.assign(b.style, { left: '0px', top: '0px', width: '100%', height: '100%' }) }
    }
  }, [on])
}

/* Trust Bank's control bar (p1/TrustHero.tsx + the tb-range styles in p1/TrustBankBody.tsx), as plain CSS.
   Selectors start with ".hb .cf-film" so they outrank the pages' square-corner rule. */
export const CASE_FILM_CSS = `
.hb .cf-film { position: relative; width: 100%; height: 100%; overflow: hidden; }
.hb .cf-film video { display: block; width: 100%; height: 100%; object-fit: cover; cursor: pointer; }
.hb .cf-film .cf-ctl { position: absolute; left: 0; right: 0; bottom: 0; padding: 48px 20px 16px;
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%); opacity: 0; pointer-events: none; transition: opacity .3s; }
.hb .cf-film .cf-ctl.show { opacity: 1; pointer-events: auto; }
.hb .cf-film .cf-row { display: flex; align-items: center; gap: 16px; margin-top: 12px; color: #FFFFFF; }
.hb .cf-film .cf-btn { display: flex; align-items: center; justify-content: center; flex: none; width: 36px; height: 36px; padding: 0; margin: 0;
  background: transparent; border: 0; border-radius: 9999px !important; color: #FFFFFF; cursor: pointer; transition: background-color .15s; }
.hb .cf-film .cf-btn:hover { background: rgba(255,255,255,0.15); }
.hb .cf-film .cf-btn:focus-visible { outline: 2px solid #FFFFFF; outline-offset: 2px; }
.hb .cf-film .cf-time { font-size: 16px; line-height: 24px; font-variant-numeric: tabular-nums; }
.hb .cf-film .cf-vol { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.hb .cf-film .cf-range { -webkit-appearance: none; appearance: none; display: block; height: 4px; margin: 0; border-radius: 9999px !important; cursor: pointer;
  background: linear-gradient(90deg, #ffffff var(--fill, 0%), rgba(255,255,255,0.35) var(--fill, 0%)); }
.hb .cf-film .cf-range.wide { width: 100%; }
.hb .cf-film .cf-range.vol { width: 100px; }
.hb .cf-film .cf-range::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 9999px; background: #ffffff; border: 0; }
.hb .cf-film .cf-range::-moz-range-thumb { width: 12px; height: 12px; border-radius: 9999px; background: #ffffff; border: 0; }
.hb .cf-film .cf-range::-moz-range-track { background: transparent; }
`
