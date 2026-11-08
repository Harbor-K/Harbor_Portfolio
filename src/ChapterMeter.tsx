import React, { useEffect, useRef, useState } from 'react'

// Chapter meter for the case-study headers (Trust Bank, GameCove, UTrada), from Harbor's references:
// tinywins.com's header word + tick wave, and ElevenLabs' tick-scale contents.
// - top line: chapter number in grey + chapter name; the name rolls up when the chapter changes
// - under it: a row of thin ticks that swell into a small wave around where you are in the page; the tick where each
//   chapter starts is a little taller, so the row doubles as a map of the case study
// - point at it (or click / Enter) to open the contents: each chapter with a small tick scale on its left, the current
//   one highlighted with a longer tick; click a chapter to jump there. Esc or a click outside closes it.
// Each page passes its chapter list and the selector of its root (".tb", ".gc", ".ut") where the [data-chapter] sections live.
// `dark` styles the contents panel for GameCove's dark page. The ticks use the header's text colour.
// Hidden on screens under 900px, like the old chapter text.

const N_TICKS = 56
const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function ChapterMeter({ chapters, chapter, intro = false, scope, dark = false }: {
  chapters: string[]; chapter: string; intro?: boolean; scope: string; dark?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ticks = useRef<HTMLSpanElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const timer = useRef(0)
  const idx = chapters.indexOf(chapter)
  const list = useRef(chapters); list.current = chapters
  const el = (c: string) => document.querySelector<HTMLElement>(`${scope} [data-chapter="${c}"]`)

  // the wave follows the reading position; chapter starts are slightly taller ticks
  useEffect(() => {
    let raf = 0
    const draw = () => {
      raf = 0
      const box = ticks.current; if (!box) return
      const vh = innerHeight, y = scrollY
      const tops = list.current.map(c => { const e = el(c); return e ? e.getBoundingClientRect().top + y : NaN }).filter(t => !isNaN(t))
      const r0 = (tops[0] ?? 0) - vh * 0.45
      const r1 = Math.max(r0 + 1, document.documentElement.scrollHeight - vh)
      const span = N_TICKS - 1
      const p = Math.min(1, Math.max(0, (y - r0) / (r1 - r0)))
      const starts = new Set(tops.map(t => Math.round(Math.min(1, Math.max(0, (t - vh * 0.45 - r0) / (r1 - r0))) * span)))
      const kids = box.children
      for (let i = 0; i < kids.length; i++) {
        const d = (i / span - p) * span
        const g = Math.exp(-(d * d) / 10)
        const s = starts.has(i)
        const k = kids[i] as HTMLElement
        k.style.height = ((s ? 8 : 4) + 12 * g).toFixed(1) + 'px'
        k.style.opacity = Math.min(1, (s ? 0.5 : 0.28) + 0.72 * g).toFixed(2)
      }
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(draw) }
    draw()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    const t = window.setTimeout(on, 800) // images / fonts can change the page height after the first paint
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on); window.clearTimeout(t) }
  }, [scope])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    addEventListener('keydown', onKey); addEventListener('pointerdown', onDown)
    return () => { removeEventListener('keydown', onKey); removeEventListener('pointerdown', onDown) }
  }, [open])
  useEffect(() => { if (intro) setOpen(false) }, [intro])

  const openNow = () => { window.clearTimeout(timer.current); setOpen(true) }
  const closeSoon = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(false), 200) }
  const go = (c: string) => {
    const e = el(c); if (!e) return
    setOpen(false)
    scrollTo({ top: e.getBoundingClientRect().top + scrollY - 88, behavior: reducedMotion() ? 'auto' : 'smooth' })
  }

  return (
    <div ref={wrap} className={'cm' + (open ? ' open' : '') + (dark ? ' dark' : '')} onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <style>{CM_CSS}</style>
      <button type="button" className="cm-btn" aria-expanded={open} aria-label={`Chapters. Now reading: ${chapter}`}
        tabIndex={intro ? -1 : undefined} onClick={() => (open ? setOpen(false) : openNow())}>
        <span className="cm-lab" aria-hidden="true">
          {idx >= 0 && <span className="n">{String(idx + 1).padStart(2, '0')}</span>}
          <span className="w"><span key={chapter}>{chapter}</span></span>
        </span>
        <span className="cm-ticks" ref={ticks} aria-hidden="true">
          {Array.from({ length: N_TICKS }, (_, i) => <i key={i} />)}
        </span>
      </button>

      <div className="cm-pop" aria-hidden={!open}>
        <ul className="cm-list" aria-label="Chapters">
          {chapters.map(c => (
            <li key={c}>
              <button type="button" className="cm-item" aria-current={c === chapter || undefined} tabIndex={open ? 0 : -1} onClick={() => go(c)}>
                <span className="sc" aria-hidden="true"><i /><i /><i /></span>
                <span>{c}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const CM_CSS = `
.hb .cm { position: relative; display: flex; justify-content: center; }
.hb .cm-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 6px 12px; margin: 0; background: none; border: 0; cursor: pointer; color: inherit; }
.hb .cm-btn:focus-visible { outline: 2px solid #2563EB; outline-offset: 2px; }
.hb .cm-lab { display: flex; align-items: baseline; gap: 8px; height: 20px; overflow: hidden; font-size: 16px; line-height: 20px; white-space: nowrap; }
.hb .cm-lab .n { opacity: .5; font-variant-numeric: tabular-nums; }
.hb .cm-lab .w { display: block; overflow: hidden; font-weight: 500; }
.hb .cm-lab .w span { display: block; animation: cm-roll .5s var(--ease) both; }
@keyframes cm-roll { from { transform: translateY(100%); opacity: 0; } to { transform: none; opacity: 1; } }
.hb .cm-ticks { display: flex; align-items: center; gap: 4px; height: 20px; }
.hb .cm-ticks i { display: block; flex: none; width: 1px; height: 4px; background: currentColor; opacity: .3; }

/* contents panel */
.hb .cm-pop { position: absolute; top: calc(100% + 8px); left: 50%; width: 300px; padding: 20px 24px 20px 20px; z-index: 2;
  background: rgba(250,250,248,.97); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); border: 1px solid var(--line); box-shadow: 0 18px 40px rgba(0,0,0,.08);
  opacity: 0; visibility: hidden; transform: translate(-50%, -6px); pointer-events: none;
  transition: opacity .2s ease, transform .3s var(--ease), visibility 0s .3s; }
.hb .cm.open .cm-pop { opacity: 1; visibility: visible; transform: translate(-50%, 0); pointer-events: auto; transition: opacity .2s ease, transform .3s var(--ease), visibility 0s; }
.hb .cm-pop::before { content: ""; position: absolute; left: 0; right: 0; top: -10px; height: 10px; }
.hb .cm-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.hb .cm-item { display: grid; grid-template-columns: 28px minmax(0, 1fr); align-items: center; gap: 12px; width: 100%; padding: 6px 0; margin: 0;
  background: none; border: 0; cursor: pointer; text-align: left; font-size: 16px; line-height: 1.35; color: #8C8C8A; transition: color .2s; }
.hb .cm-item:hover, .hb .cm-item[aria-current] { color: var(--ink); }
.hb .cm-item:focus-visible { outline: 2px solid #2563EB; outline-offset: 2px; }
.hb .cm-item .sc { display: flex; flex-direction: column; justify-content: center; gap: 4px; }
.hb .cm-item .sc i { display: block; width: 10px; height: 1px; background: currentColor; opacity: .45; transition: width .3s var(--ease), opacity .2s; }
.hb .cm-item:hover .sc i:nth-child(2) { width: 16px; opacity: .8; }
.hb .cm-item[aria-current] .sc i:nth-child(2) { width: 24px; opacity: 1; }

/* dark page (GameCove) */
.hb .cm.dark .cm-pop { background: rgba(23,23,27,.97); border-color: #2A2D31; box-shadow: 0 18px 40px rgba(0,0,0,.4); }
.hb .cm.dark .cm-item { color: #8C8F96; }
.hb .cm.dark .cm-item:hover, .hb .cm.dark .cm-item[aria-current] { color: #F2F0EC; }

@media (max-width: 900px) { .hb .cm { display: none; } }
@media (prefers-reduced-motion: reduce) { .hb .cm-lab .w span { animation: none; } }
`
