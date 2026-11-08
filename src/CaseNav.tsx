import React, { useEffect, useRef, useState } from 'react'

// Case-study navigation shared by Trust Bank, GameCove and UTrada.
//
// useHeadroom(): the header slides away while you scroll down and comes back as soon as you scroll up
// (always shown near the top of the page). Returns true while it should be hidden.
//
// <SideToc>: the case study's process on the LEFT side of the screen. It behaves like Notion's floating table of contents
// (dashes at rest, a list on hover) but is styled in the same tone as the header's Projects menu (Harbor's note):
// square corners, a 1px grey border and soft shadow, a grey "Process" label, numbered rows (01, 02 … like the site's
// section eyebrows), and the current chapter shown with the menu's soft grey row and a small ▸ instead of blue text.
// - at rest: a column of square-ended dashes at the left edge, one per chapter; the current chapter is the dark, longer dash
// - point at it (or tab into it): the list slides in from the left; rows get a grey background on hover; click a chapter
//   to jump there; moving away closes it
// Hidden during the full-screen intro and on screens under 900px. `dark` = GameCove's dark palette.
// Class names all start with "stoc-" so the site's shared styles can't reach in (the shared .panel / .k styles in
// portfolio.ts once pushed the list out of view).
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
    <nav className={'stoc' + (hidden ? ' stoc-off' : '') + (open ? ' stoc-open' : '') + (dark ? ' stoc-dark' : '')} aria-label="Case study process" aria-hidden={hidden || undefined}
      onMouseEnter={openNow} onMouseLeave={closeSoon} onFocus={openNow} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) closeSoon() }}>
      <style>{STOC_CSS}</style>
      {/* at rest: one dash per chapter */}
      <div className="stoc-dashes" aria-hidden="true">
        {chapters.map(c => <i key={c} className={c === active ? 'stoc-on' : undefined} />)}
      </div>
      {/* on hover: the numbered process list */}
      <div className="stoc-pane">
        <div className="stoc-label">Process</div>
        <ol className="stoc-list">
          {chapters.map((c, i) => (
            <li key={c}>
              <button type="button" className="stoc-row" aria-current={c === active || undefined} tabIndex={hidden ? -1 : undefined} onClick={() => go(c)}>
                <span className="stoc-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="stoc-name">{c}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}

const STOC_CSS = `
.hb .stoc { position: fixed; left: 16px; top: 50%; z-index: 45; transform: translateY(-50%); transition: opacity .35s ease; }
.hb .stoc.stoc-off { opacity: 0; pointer-events: none; }

/* dashes at rest: square ends, site greys */
.hb .stoc-dashes { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; padding: 16px 32px 16px 8px; transition: opacity .2s ease; }
.hb .stoc-dashes i { display: block; width: 28px; height: 2px; border-radius: 0; background: #BDBDBA; transition: background-color .25s, width .25s; }
.hb .stoc-dashes i.stoc-on { width: 40px; background: #0F0F0F; }
.hb .stoc.stoc-open .stoc-dashes { opacity: 0; }

/* list on hover: same tone as the header's Projects menu (square, 1px border, soft shadow, grey label, soft grey current row) */
.hb .stoc-pane { position: absolute; left: 0; top: 50%; display: block; width: 280px; max-height: min(78vh, 640px); margin: 0; overflow-y: auto; padding: 24px 0 16px;
  background: #fff; border: 1px solid #DBDBD9; border-radius: 0; box-shadow: 0 24px 60px rgba(0,0,0,.10);
  opacity: 0; visibility: hidden; transform: translate(-6px, -50%); pointer-events: none;
  transition: opacity .18s ease, transform .25s cubic-bezier(.22,1,.36,1), visibility 0s .25s; }
.hb .stoc.stoc-open .stoc-pane { opacity: 1; visibility: visible; transform: translate(0, -50%); pointer-events: auto; transition: opacity .22s ease, transform .35s cubic-bezier(.22,1,.36,1), visibility 0s; }
.hb .stoc-label { padding: 0 24px; margin: 0 0 12px; font-size: 16px; color: #8C8C8A; }
.hb .stoc-list { display: block; list-style: none; margin: 0; padding: 0; }
.hb .stoc-list li { display: block; margin: 0; padding: 0; }
.hb .stoc-row { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 24px; margin: 0;
  border: 0; border-radius: 0; background: transparent; cursor: pointer; text-align: left; font-size: 16px; line-height: 1.35; color: #6B6B69;
  transition: background-color .15s, color .15s; }
.hb .stoc-num { flex: none; width: 22px; color: #B3B3B0; font-variant-numeric: tabular-nums; transition: color .15s; }
.hb .stoc-name { flex: 1 1 auto; min-width: 0; }
.hb .stoc-row:hover { background: #F2F2EF; color: #0F0F0F; }
.hb .stoc-row:hover .stoc-num { color: #6B6B69; }
.hb .stoc-row[aria-current] { background: #ECECE8; color: #0F0F0F; font-weight: 500; }
.hb .stoc-row[aria-current] .stoc-num { color: #0F0F0F; }
.hb .stoc-row[aria-current]::after { content: ""; flex: none; border-left: 6px solid currentColor; border-top: 4px solid transparent; border-bottom: 4px solid transparent; }
.hb .stoc-row:focus-visible { outline: 2px solid #2563EB; outline-offset: -2px; }

/* dark page (GameCove) */
.hb .stoc.stoc-dark .stoc-dashes i { background: #4E5056; }
.hb .stoc.stoc-dark .stoc-dashes i.stoc-on { background: #F2F0EC; }
.hb .stoc.stoc-dark .stoc-pane { background: #17171B; border-color: #2A2D31; box-shadow: 0 24px 60px rgba(0,0,0,.45); }
.hb .stoc.stoc-dark .stoc-label { color: #7C7F86; }
.hb .stoc.stoc-dark .stoc-row { color: #A7A9B0; }
.hb .stoc.stoc-dark .stoc-num { color: #5F6168; }
.hb .stoc.stoc-dark .stoc-row:hover { background: rgba(255,255,255,.06); color: #F2F0EC; }
.hb .stoc.stoc-dark .stoc-row:hover .stoc-num { color: #A7A9B0; }
.hb .stoc.stoc-dark .stoc-row[aria-current] { background: rgba(255,255,255,.1); color: #F2F0EC; }
.hb .stoc.stoc-dark .stoc-row[aria-current] .stoc-num { color: #F2F0EC; }

@media (max-width: 900px) { .hb .stoc { display: none; } }
`
