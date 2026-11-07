// 3D hero: the headline sits in the middle of a 3D space full of research pieces
// (sticky notes, labels, workshop-photo crops, project screens). The whole scene turns
// with the mouse, drifts on its own, flies in on load and tilts away as you scroll.
import { IMG } from './portfolio'

const RAW = `
.hero3d { position: relative; height: 150vh; background: var(--paper); }
.h3-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; perspective: [1500]; perspective-origin: 50% 50%;
  background: radial-gradient(ellipse 70% 60% at 50% 50%, #FFFFFF 0%, #FFFFFF 55%, #EFEFEF 100%); }
.h3-world { position: absolute; left: 50%; top: 50%; width: 0; height: 0; transform-style: preserve-3d; will-change: transform; }
.h3-text { position: absolute; left: [-800]; top: [-184]; width: [1600]; height: [368]; transform-style: preserve-3d; pointer-events: none; }
.headline.h3-layer { top: 0; transform: translateZ(calc(var(--k) * -4 * var(--u))); color: var(--lc, var(--ink)); }
.h3-layer .slot3 { display: inline-block; width: [150]; height: [60]; flex: none; border-radius: [10]; background: var(--lc); }

.h3-obj { position: absolute; left: 0; top: 0; transform-style: preserve-3d; opacity: 0; animation: h3in .9s ease forwards; animation-delay: var(--in); }
@keyframes h3in { to { opacity: 1; } }
.h3-spin { transform-style: preserve-3d; animation: h3wob var(--dur) ease-in-out var(--del) infinite alternate; }
@keyframes h3wob { from { transform: rotate3d(var(--ax), var(--ay), var(--az), calc(var(--amp) * -1)); } to { transform: rotate3d(var(--ax), var(--ay), var(--az), var(--amp)); } }
.h3-face { box-shadow: 0 [14] [36] rgba(0,0,0,.16); }
.h3-face.sticky { position: relative; width: [104]; height: [104]; border-radius: [4]; background: var(--c); }
.h3-face.sticky::before, .h3-face.sticky::after { content: ""; position: absolute; left: [18]; right: [26]; height: [4]; border-radius: [2]; background: rgba(0,0,0,.22); }
.h3-face.sticky::before { top: [32]; } .h3-face.sticky::after { top: [50]; right: [44]; }
.h3-face.label { display: flex; align-items: center; gap: [12]; padding: [14] [22]; border-radius: [8]; background: #fff; border: 1px solid rgba(0,0,0,.08);
  font: 500 [22]/1 var(--mono); color: #111; white-space: nowrap; }
.h3-face.label i { width: [10]; height: [10]; border-radius: 50%; background: var(--c); flex: none; }
.h3-face.photo { width: [210]; height: [140]; border-radius: [10]; background-image: url("${IMG}photo.jpg"); background-repeat: no-repeat; }
.h3-face.shot { width: [280]; height: [241]; border-radius: [12]; overflow: hidden; background: #fff; border: 1px solid rgba(0,0,0,.08); }
.h3-face.shot img { width: 100%; height: 100%; object-fit: cover; }
.h3-hint { position: absolute; left: 50%; bottom: [56]; transform: translateX(-50%); font: 500 [15]/1 var(--mono); letter-spacing: .14em; color: var(--ink-soft); opacity: .7; }
@media (prefers-reduced-motion: reduce) { .h3-spin { animation: none; } .h3-obj { animation-duration: .01ms; animation-delay: 0ms; } }
`
export const HERO_CSS = RAW.replace(/\[(-?\d+(?:\.\d+)?)\]/g, 'calc($1 * var(--u))')

export function startHero3d(): () => void {
  const hero = document.getElementById('hero3d') as HTMLElement | null
  const world = document.getElementById('h3world') as HTMLElement | null
  if (!hero || !world) return () => {}
  const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

  let seed = 4231
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  const R = (a: number, b: number) => a + (b - a) * rnd()

  // the pieces that float around the headline
  const colors = ['--c-yellow', '--c-pink', '--c-blue', '--c-green']
  const labels = ['Interview', 'Survey', 'App review', 'Usage log', 'Field note', 'Persona', 'Journey map', 'Pain point', 'Wireframe', 'Prototype', 'Usability test', 'Insight', 'Affinity map', 'Heuristics']
  const shots = ['trust-bank.webp', 'gamecove.webp', 'utrada.webp', 'eto-markets.webp']
  const DH = 848 * 1920 / 1264, OY = (DH - 1280) / 2
  const items: string[] = []
  for (let i = 0; i < 26; i++) items.push(`<div class="h3-face sticky" style="--c:var(${colors[i % 4]})"></div>`)
  labels.forEach((t, i) => items.push(`<div class="h3-face label" style="--c:var(${colors[(i + 1) % 4]})"><i></i>${t}</div>`))
  for (let i = 0; i < 12; i++) {
    const px = Math.round(R(80, 1600)), py = Math.round(R(80, 1050))
    items.push(`<div class="h3-face photo" style="background-size:calc(1920 * var(--u)) calc(${DH.toFixed(1)} * var(--u));background-position:calc(${-px} * var(--u)) calc(${-(py + OY).toFixed(1)} * var(--u))"></div>`)
  }
  shots.forEach(s => items.push(`<div class="h3-face shot"><img src="${IMG}${s}" alt=""></div>`))
  shots.forEach(s => items.push(`<div class="h3-face shot"><img src="${IMG}${s}" alt=""></div>`))
  for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [items[i], items[j]] = [items[j], items[i]] }

  // positions in design px around the origin; keep a window in front of the headline clear
  world.querySelectorAll('.h3-obj').forEach(n => n.remove())
  items.forEach((html, i) => {
    let x = 0, y = 0, z = 0, n = 0
    do { x = R(-1850, 1850); y = R(-1050, 1050); z = R(-1800, 420); n++ }
    while (n < 60 && ((Math.abs(x) < 900 && Math.abs(y) < 300 && z > -700) || (Math.abs(x) < 300 && Math.abs(y) < 200)))
    const el = document.createElement('div')
    el.className = 'h3-obj'
    const ax = R(-1, 1).toFixed(2), ay = R(-1, 1).toFixed(2), az = R(-.4, .4).toFixed(2)
    el.style.cssText = `transform: translate3d(calc(${x.toFixed(0)} * var(--u)), calc(${y.toFixed(0)} * var(--u)), calc(${z.toFixed(0)} * var(--u))) translate(-50%, -50%) rotateZ(${R(-28, 28).toFixed(1)}deg) rotateY(${R(-35, 35).toFixed(1)}deg);`
      + `--in:${(250 + i * 16)}ms`
    el.innerHTML = `<div class="h3-spin" style="--ax:${ax};--ay:${ay};--az:${az};--amp:${R(10, 26).toFixed(0)}deg;--dur:${R(5, 11).toFixed(1)}s;--del:${R(-8, 0).toFixed(1)}s">${html}</div>`
    world.appendChild(el)
  })

  // camera: mouse + idle drift + intro fly-in + scroll tilt
  let tx = 0, ty = 0, cx = 0, cy = 0, alive = true, raf = 0
  const t0 = performance.now()
  const onMove = (e: PointerEvent) => {
    if (e.pointerType && e.pointerType !== 'mouse') return
    tx = clamp((e.clientX / innerWidth) * 2 - 1, -1, 1); ty = clamp((e.clientY / innerHeight) * 2 - 1, -1, 1)
  }
  const onLeave = () => { tx = 0; ty = 0 }
  const outCubic = (k: number) => 1 - Math.pow(1 - k, 3)
  const YAW = reduce ? 8 : 52, PITCH = reduce ? 5 : 30

  function frame(now: number) {
    if (!alive) return
    raf = requestAnimationFrame(frame)
    const r = hero!.getBoundingClientRect()
    if (r.bottom < 0) return                      // hero is off screen: skip the work
    const u = document.documentElement.clientWidth / 1920
    const t = (now - t0) / 1000
    const k = reduce ? 1 : outCubic(clamp((now - t0 - 150) / 1900, 0, 1))
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1)
    cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06
    const yaw = cx * YAW + (reduce ? 0 : Math.sin(t / 5) * 5) + (1 - k) * 38
    const pitch = -cy * PITCH + (reduce ? 0 : Math.sin(t / 7) * 3) + p * 20 - (1 - k) * 14
    const dz = -(1 - k) * 2600 + p * 340
    world!.style.transform = `translateZ(${(dz * u).toFixed(1)}px) rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg)`
  }
  addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerleave', onLeave)
  raf = requestAnimationFrame(frame)

  return () => {
    alive = false; cancelAnimationFrame(raf)
    removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerleave', onLeave)
    world.querySelectorAll('.h3-obj').forEach(n => n.remove())
  }
}
