import React, { useEffect, useRef } from 'react'

/**
 * Site-wide cursor (every page): the dot with a short line trail that springs after the mouse.
 * It draws with mix-blend-mode: difference, so it reads white on dark areas and black on light ones,
 * and grows a little (and turns teal) over links and buttons.
 *
 * Bracketed label mode (after superevilgeniuscorp.com): the dot turns into a label like [ SCROLL ] and the normal
 * mouse pointer is hidden.
 * - `scrollLabel` (case-study pages): while the page is at the very top — the full-screen hero video — the label reads
 *   SCROLL. As soon as the page scrolls it fades out and the line cursor takes over; back at the top it returns.
 *   Before the mouse has moved, it waits in the middle of the screen.
 * - Any element with `data-cursor="…"` (the project blocks on the main page): while the pointer is anywhere over it,
 *   the label shows that text, e.g. [ VIEW TRUST BANK PROJECT ]. It is dark ink on the white page and turns white
 *   over anything marked `data-cursor-light` (the project image / video).
 * Touch screens: no custom cursor. Reduced motion: no trail, the dot and label sit exactly on the pointer.
 */

const LABEL_CSS = `
html.cur-scroll, html.cur-scroll * { cursor: none !important; }
.cur-label { position: fixed; left: 0; top: 0; z-index: 2147483001; pointer-events: none; display: flex; align-items: center; gap: 8px; white-space: nowrap;
  color: #fff; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 500; line-height: 1;
  letter-spacing: .18em; text-transform: uppercase; text-shadow: 0 1px 10px rgba(0,0,0,.35); opacity: 0; will-change: transform, opacity;
  transition: color .25s, text-shadow .25s; }
.cur-label i { display: block; width: 7px; height: 26px; border: 1.5px solid currentColor; filter: drop-shadow(0 1px 6px rgba(0,0,0,.3)); }
.cur-label i.l { border-right: 0; }
.cur-label i.r { border-left: 0; }
.cur-label span { padding-left: .18em; }
.cur-label.ink { color: #0F0F0F; text-shadow: none; }
.cur-label.ink i { filter: none; }
`

type Hover = { text: string; light: boolean } | null

export function CursorTrail({ scrollLabel = false }: { scrollLabel?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const labelOn = useRef(scrollLabel)
  labelOn.current = scrollLabel

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const fine = matchMedia('(pointer: fine)').matches
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const BASE = '#ffffff', ACCENT = '#1fb6d5', TRAIL_MS = 260, SPRING = 0.14, DAMPING = 0.7
    const root = document.documentElement
    const isInteractive = (el: Element | null) => {
      if (!el || !(el instanceof Element)) return false
      if (el.closest('a, button, [role="button"], label, summary')) return true
      const c = getComputedStyle(el).cursor
      return c === 'pointer' || c === 'crosshair' || c === 'zoom-in'
    }
    const hoverOf = (el: Element | null): Hover => {
      if (!el || !(el instanceof Element)) return null
      const z = el.closest('[data-cursor]')
      if (!z) return null
      return { text: z.getAttribute('data-cursor') || '', light: !!el.closest('[data-cursor-light]') }
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
    let lab = 0, hideNative = false, hover: Hover = null, shownText = 'Scroll', ink = false
    const onPoint = (e: MouseEvent) => {
      if ((e as PointerEvent).pointerType === 'touch') { present = false; return }
      if (!Number.isFinite(e.clientX) || (e.clientX === 0 && e.clientY === 0 && e.type === 'wheel')) { present = true; return }
      mouse.x = e.clientX; mouse.y = e.clientY; present = true
      if (first) { dot.x = mouse.x; dot.y = mouse.y; first = false }
      accent = isInteractive(e.target as Element)
      hover = hoverOf(e.target as Element)
    }
    const onScroll = () => {
      if (!present || first) return
      const el = document.elementFromPoint(mouse.x, mouse.y)
      accent = isInteractive(el)
      hover = hoverOf(el)
    }
    const onOut = (e: MouseEvent) => { if (!e.relatedTarget) { present = false; hover = null } }
    const tick = (now: number) => {
      if (reduce) { dot.x = mouse.x; dot.y = mouse.y }
      else {
        dot.vx = (dot.vx + (mouse.x - dot.x) * SPRING) * DAMPING; dot.vy = (dot.vy + (mouse.y - dot.y) * SPRING) * DAMPING
        dot.x += dot.vx; dot.y += dot.vy
      }
      visible += ((present ? 1 : 0) - visible) * 0.15
      grow += ((accent ? 1 : 0) - grow) * 0.2

      // label: a hovered [data-cursor] block first, then [SCROLL] at the top of a case page; the line cursor otherwise
      const hovering = !!hover && !first
      const text = hovering ? hover!.text : (labelOn.current && scrollY < 8 ? 'Scroll' : '')
      const want = fine && text ? 1 : 0
      lab += (want - lab) * (reduce ? 1 : 0.18)
      if (lab < 0.002) lab = 0
      const native = want === 1 && present
      if (native !== hideNative) { hideNative = native; root.classList.toggle('cur-scroll', native) }
      const el = labelRef.current
      if (el) {
        if (text && text !== shownText && textRef.current) { shownText = text; textRef.current.textContent = text } // keep the old text while fading out
        const wantInk = hovering && !hover!.light
        if (text && wantInk !== ink) { ink = wantInk; el.classList.toggle('ink', ink) }
        const waiting = first // mouse hasn't moved yet: wait in the middle of the screen
        const lx = waiting ? innerWidth / 2 : dot.x, ly = waiting ? innerHeight / 2 : dot.y
        const shown = lab * (waiting ? 1 : visible)
        el.style.opacity = shown.toFixed(3)
        el.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(0.86 + 0.14 * lab).toFixed(3)})`
      }

      tail.push({ x: dot.x, y: dot.y, t: now })
      while (tail.length && now - tail[0].t > TRAIL_MS) tail.shift()
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      const v = visible * (1 - lab)
      if (v > 0.01) {
        const color = accent ? ACCENT : BASE
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round'
        if (!reduce) for (let i = 1; i < tail.length; i++) {
          const a = tail[i - 1], b = tail[i]
          if (Math.hypot(b.x - a.x, b.y - a.y) < 0.2) continue
          const k = i / tail.length
          ctx.globalAlpha = v * k * 0.9; ctx.lineWidth = 0.4 + k * 2.2
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
        }
        ctx.globalAlpha = v
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
      root.classList.remove('cur-scroll')
    }
  }, [])

  return (
    <>
      <style>{LABEL_CSS}</style>
      <canvas
        ref={ref}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 2147483000, pointerEvents: 'none', mixBlendMode: 'difference' }}
      />
      <div ref={labelRef} className="cur-label" aria-hidden="true">
        <i className="l" />
        <span ref={textRef}>Scroll</span>
        <i className="r" />
      </div>
    </>
  )
}
