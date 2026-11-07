import React, { useEffect, useRef, useState } from 'react'

// Case-study navigation shared by Trust Bank, GameCove and UTrada.
//
// useHeadroom(): the header slides away while you scroll down and comes back as soon as you scroll up
// (always shown near the top of the page). Returns true while it should be hidden.
//
// <SideToc>: the case study's process on the LEFT side of the screen, working like Notion's floating table of contents
// (Harbor's screen recording), made larger so it is easy to see:
// - at rest: a column of dashes at the left edge, one per chapter; the chapter you are reading is the dark, longer dash
// - point at it (or tab into it): a panel slides in from the left with the chapter names; the current chapter is blue,
//   the row under the pointer gets a soft grey highlight; click a name to jump there. Moving away closes it.
// Hidden during the full-screen intro and on screens under 900px. `dark` = GameCove's dark palette.
// Each page passes its chapter list and the selector of its root (".tb", ".gc", ".ut") where its [data-chapter] sections live.

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function useHeadroom(threshold = 120) {
  const [away, setAway] = useState(false)
  useEffect(() => {
    let last = scrollY, raf = 0
    const run = () => {
      raf = 0
      const y = scrollY
      if (y < threshold) setAway(false)
      else if (y > last + 4) setAway(true)
      else if (y < last - 4) setAway(false)
      if (Math.abs(y - last) > 4) last = y
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    addEventListener('scroll', on, { passive: true })
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on) }
  }, [threshold])
  return away
}

export function SideToc({ chapters, scope, hidden = false, dark = false }: { chapters: string[]; scope: string; hidden?: boolean; dark?: boolean }) {
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const timer = useRef(0)
  const list = useRef(chapters); list.current = chapters

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return
      const c = (e.target as HTMLElement).dataset.chapter || ''
      setActive(list.current.includes(c) ? c : '')
    }), { rootMargin: '-45% 0px -54% 0px' })
    // sections can mount a little after the page (images, lazy parts): look again shortly after
    const watch = () => document.querySelectorAll(`${scope} [data-chapter]`).forEach(s => io.observe(s))
    watch()
    const t = window.setTimeout(watch, 800)
    return () => { io.disconnect(); window.clearTimeout(t) }
  }, [scope])

  useEffect(() => { if (hidden) setOpen(false) }, [hidden])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [open])

  const openNow = () => { window.clearTimeout(timer.current); setOpen(true) }
  const closeSoon = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(false), 220) }
  const go = (c: string) => {
    const el = document.querySelector<HTMLElement>(`${scope} [data-chapter="${c}"]`)
    if (!el) return
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - 32, behavior: reducedMotion() ? 'auto' : 'smooth' })
  }

  return (
    <nav className={'stoc' + (hidden ? ' off' : '') + (open ? ' open' : '') + (dark ? ' dark' : '')} aria-label="Case study contents" aria-hidden={hidden || undefined}
      onMouseEnter={openNow} onMouseLeave={closeSoon} onFocus={openNow} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) closeSoon() }}>
      <style>{STOC_CSS}</style>
      {/* at rest: one dash per chapter */}
      <div className="dashes" aria-hidden="true">
        {chapters.map(c => <i key={c} className={c === active ? 'on' : undefined} />)}
      </div>
      {/* on hover: the chapter list */}
      <div className="panel">
        <ol>
          {chapters.map(c => (
            <li key={c}>
              <button type="button" aria-current={c === active || undefined} tabIndex={hidden ? -1 : undefined} onClick={() => go(c)}>{c}</button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}

const STOC_CSS = `
.hb .stoc { position: fixed; left: 16px; top: 50%; z-index: 45; transform: translateY(-50%); transition: opacity .35s ease; }
.hb .stoc.off { opacity: 0; pointer-events: none; }

/* dashes at rest (Notion), larger and darker so they read on any background */
.hb .stoc .dashes { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; padding: 16px 32px 16px 8px; transition: opacity .2s ease; }
.hb .stoc .dashes i { display: block; width: 28px; height: 3px; border-radius: 2px; background: #B8B8B5; transition: background-color .25s, width .25s; }
.hb .stoc .dashes i.on { width: 40px; background: #191919; }
.hb .stoc.open .dashes { opacity: 0; }

/* panel on hover, opening from the left */
.hb .stoc .panel { position: absolute; left: 0; top: 50%; width: 300px; max-height: min(76vh, 640px); overflow-y: auto; padding: 10px;
  background: #fff; border: 1px solid #E9E9E7; border-radius: 12px; box-shadow: 0 16px 40px rgba(15,15,15,.12), 0 2px 6px rgba(15,15,15,.05);
  opacity: 0; visibility: hidden; transform: translate(-8px, -50%); pointer-events: none;
  transition: opacity .2s ease, transform .3s cubic-bezier(.2,.7,.2,1), visibility 0s .3s; }
.hb .stoc.open .panel { opacity: 1; visibility: visible; transform: translate(0, -50%); pointer-events: auto; transition: opacity .2s ease, transform .3s cubic-bezier(.2,.7,.2,1), visibility 0s; }
.hb .stoc ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.hb .stoc button { display: block; width: 100%; padding: 10px 14px; margin: 0; border: 0; border-radius: 8px; background: none; cursor: pointer; text-align: left;
  font-size: 18px; line-height: 1.35; color: #5F5E5B; transition: background-color .15s, color .15s; }
.hb .stoc button:hover { background: rgba(55,53,47,.08); color: #191919; }
.hb .stoc button[aria-current] { color: #2383E2; font-weight: 500; }
.hb .stoc button:focus-visible { outline: 2px solid #2383E2; outline-offset: -2px; }

/* dark page (GameCove) */
.hb .stoc.dark .dashes i { background: #5A5C63; }
.hb .stoc.dark .dashes i.on { background: #F2F0EC; }
.hb .stoc.dark .panel { background: #1F1F22; border-color: #2F3034; box-shadow: 0 16px 40px rgba(0,0,0,.5); }
.hb .stoc.dark button { color: #A7A9B0; }
.hb .stoc.dark button:hover { background: rgba(255,255,255,.07); color: #F2F0EC; }
.hb .stoc.dark button[aria-current] { color: #529CCA; }

@media (max-width: 900px) { .hb .stoc { display: none; } }
`
