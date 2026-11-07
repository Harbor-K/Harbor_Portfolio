// Scroll motion for the portfolio main page:
// 1) parallax on the fixed workshop photo, 2) the pinned Raw data → Insight sequence that snaps per step,
// 3) the stacking Selected work cards. Returns a cleanup function for React's useEffect.
export function startMotion(): () => void {
  const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
  const root = document.documentElement
  const $ = (id: string) => document.getElementById(id) as any
  const pin = $('pin'), field = $('field'), lines = $('lines'), cols = $('cols'), veil = $('veil'), bgfix = $('bgfix')
  const process = $('process'), copy = $('copy'), stepK = $('stepK'), stepT = $('stepT'), stepD = $('stepD'), stepM = $('stepM'), pct = $('pct'), insight = $('insight')
  if (!pin || !field) return () => {}
  const IMG_W = 1264, IMG_H = 848, DH = IMG_H * 1920 / IMG_W, OY = (DH - 1280) / 2

  const STEPS = [
    ['Raw data', 'Interviews, reviews, logs and notes, scattered everywhere.', '32 PIECES'],
    ['Collection', 'Every piece goes into one place.', '32 PIECES · 1 PLACE'],
    ['Cleaning', 'Duplicates and noise come out.', '26 KEPT · 6 REMOVED'],
    ['Analysis', 'Similar pieces sit together, and patterns appear.', '3 PATTERNS'],
    ['Insight', 'The dots connect into one clear direction.', '1 DIRECTION'],
  ]
  const AT = [0.015, 0.17, 0.34, 0.51, 0.68] // scroll progress where each step snaps in
  const CLUSTERS = [['Behaviour', '--c-blue'], ['Pain point', '--c-pink'], ['Need', '--c-yellow']]

  // seeded random so the layout is the same on every visit
  let seed = 20261030
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  const R = (a: number, b: number) => a + (b - a) * rnd()

  // the data pieces
  const labels = ['Interview', 'App review', 'Survey', 'Usage log', 'Support ticket', 'Forum post', 'Field note', 'Session replay', 'Analytics', 'Competitor']
  const noiseLabels = ['Duplicate', 'Off-topic', 'Test entry', 'Duplicate']
  const stickyColors = ['--c-yellow', '--c-pink', '--c-blue', '--c-green']
  const defs: any[] = []
  for (let i = 0; i < 6; i++) defs.push({ type: 'photo', px: R(80, 1700), py: R(60, 1100) })
  for (let i = 0; i < 10; i++) defs.push({ type: 'sticky', c: stickyColors[i % 4] })
  for (const t of labels) defs.push({ type: 'label', text: t, c: stickyColors[defs.length % 4] })
  for (let i = 0; i < 2; i++) defs.push({ type: 'sticky', noise: true, c: '--ink-soft' })
  for (const t of noiseLabels) defs.push({ type: 'label', text: t, noise: true, c: '--ink-soft' })
  for (let i = defs.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [defs[i], defs[j]] = [defs[j], defs[i]] }

  const SIZE: any = { photo: [120, 80], sticky: [70, 70], label: [168, 44] }
  field.innerHTML = ''
  const tiles: any[] = defs.map((d, i) => {
    const el = document.createElement('span')
    el.className = `tile ${d.type}${d.noise ? ' noise' : ''}`
    el.style.setProperty('--c', `var(${d.c || '--c-blue'})`)
    el.style.setProperty('--d', `${(i % 11) * 22}ms`)
    if (d.type === 'label') el.innerHTML = `<i></i><b>${d.text}</b>`
    field.appendChild(el)
    return { ...d, noise: !!d.noise, el, w: SIZE[d.type][0], h: SIZE[d.type][1], raw: { x: 0, y: 0, r: R(-24, 24), s: R(.85, 1.15) }, jit: [R(-1, 1), R(-1, 1), R(-12, 12)] }
  })
  const kept = tiles.filter(t => !t.noise)
  kept.forEach((t, i) => { t.cluster = i < 11 ? 0 : i < 20 ? 1 : 2; t.ci = i < 11 ? i : i < 20 ? i - 11 : i - 20 })
  const clusterCount = [11, 9, 6]

  $('progress').innerHTML = STEPS.map((s, i) => `<div class="seg"><div class="bar"><div class="fill"></div></div><div class="lab">${String(i + 1).padStart(2, '0')} ${s[0].toUpperCase()}</div></div>`).join('')
  const segs: any[] = Array.from(document.querySelectorAll('.seg'))
  cols.innerHTML = CLUSTERS.map(([n, c], i) => `<div class="col-head" style="--t:var(${c})">${n}<em>${clusterCount[i]}</em></div>`).join('')
  const heads: any[] = Array.from(cols.children)
  lines.innerHTML = kept.map((_, i) => `<line pathLength="1" style="--d:${(i % 11) * 30}ms"/>`).join('')
  const lineEls: any[] = Array.from(lines.children)

  let u = 1, V = 1080, step = -2, alive = true

  const T = (t: any, x: number, y: number, r = 0, s: number | number[] = 1) =>
    `translate3d(${(x - t.w / 2) * u}px, ${(y - t.h / 2) * u}px, 0) rotate(${r}deg) scale(${Array.isArray(s) ? s.join(',') : s})`

  function layout() {
    if (!alive) return
    u = root.clientWidth / 1920; root.style.setProperty('--u', u + 'px')
    V = innerHeight / u
    const cx = 960, cy = V / 2 + 20
    // step 0: scattered everywhere, keeping the copy block and the progress bar clear
    for (const t of tiles) {
      let x = 0, y = 0, n = 0
      do { x = R(120, 1800); y = R(140, V - 190); n++ } while (n < 30 && ((x < 900 && y < 430) || (x > 1500 && y < 220)))
      t.raw.x = x; t.raw.y = y
    }
    // step 1: one pile in the middle
    tiles.forEach((t, i) => { const a = (i / tiles.length) * Math.PI * 2 + t.jit[0], r = 250 * Math.sqrt((i + 1) / tiles.length); t.pile = { x: cx + Math.cos(a) * r * 1.35, y: cy + Math.sin(a) * r * 0.7 } })
    // step 2: clean grid (noise falls away)
    const gc = 7, gw = 190, gh = 96, rows = Math.ceil(kept.length / gc)
    kept.forEach((t, i) => { const c = i % gc, r = Math.floor(i / gc); t.grid = { x: cx - (gc - 1) * gw / 2 + c * gw, y: cy - (rows - 1) * gh / 2 + r * gh } })
    // step 3: three columns that read like a bar chart
    const colX = [cx - 420, cx, cx + 420], base = Math.min(V - 230, cy + 300), gap = Math.min(46, (base - 260) / 11)
    kept.forEach(t => { t.col = { x: colX[t.cluster], y: base - t.ci * gap } })
    heads.forEach((h, i) => { h.style.left = colX[i] * u + 'px'; h.style.top = (base - (clusterCount[i] - 1) * gap - 80) * u + 'px' })
    // step 4: dots on a ring, lines run into the insight (ring sits a little low so it clears the step copy)
    const rx = 640, ry = Math.min(290, V / 2 - 210), cyI = V / 2 + 60
    kept.forEach((t, i) => { const a = (i / kept.length) * Math.PI * 2 - Math.PI / 2 + t.jit[1] * 0.08; t.ring = { x: cx + Math.cos(a) * rx * (0.86 + 0.14 * Math.abs(t.jit[0])), y: cyI + Math.sin(a) * ry * (0.86 + 0.14 * Math.abs(t.jit[1])) } })
    lines.setAttribute('viewBox', `0 0 ${root.clientWidth} ${innerHeight}`)
    lineEls.forEach((l, i) => { const t = kept[i]; l.setAttribute('x1', t.ring.x * u); l.setAttribute('y1', t.ring.y * u); l.setAttribute('x2', cx * u); l.setAttribute('y2', cyI * u) })
    insight.style.top = cyI * u + 'px'
    // photo crops for photo tiles and the headline chips
    const bs = `${1920 * u}px ${DH * u}px`
    for (const t of tiles) if (t.type === 'photo') { t.el.style.backgroundSize = bs; t.el.style.backgroundPosition = `${-t.px * u}px ${-(t.py + OY) * u}px` }
    document.querySelectorAll<HTMLElement>('.chip').forEach(c => { c.style.backgroundSize = bs; c.style.backgroundPosition = `${-Number(c.dataset.x) * u}px ${-(Number(c.dataset.y) + OY) * u}px` })
    pin.classList.add('no-anim'); place(Math.max(step, -1)); void pin.offsetWidth; pin.classList.remove('no-anim')
    tick()
  }

  let dropTimer = 0
  function place(k: number) {
    for (const t of tiles) {
      const el = t.el; let tr: string, op = 1
      el.classList.toggle('struck', k === 2 && t.noise)
      el.classList.toggle('tint', k === 3 && !t.noise)
      el.classList.toggle('dot', k === 4 && !t.noise)
      if (!t.noise) el.style.setProperty('--t', `var(${CLUSTERS[t.cluster][1]})`)
      if (k <= 0) { tr = T(t, t.raw.x, t.raw.y, t.raw.r, k < 0 ? 0.6 : t.raw.s); op = k < 0 ? 0 : 1 }
      else if (k === 1) tr = T(t, t.pile.x, t.pile.y, t.jit[2], 1)
      else if (t.noise) { tr = T(t, t.pile.x + t.jit[0] * 60, (k === 2 ? t.pile.y + 40 : V + 200), t.jit[2] * 3, k === 2 ? 1 : 0.8); op = k === 2 ? 0.9 : 0 }
      else if (k === 2) tr = T(t, t.grid.x, t.grid.y, 0, 1)
      else if (k === 3) tr = T(t, t.col.x, t.col.y, 0, 0.86)
      else tr = T(t, t.ring.x, t.ring.y, 0, [14 / t.w, 14 / t.h])
      el.style.transform = tr; el.style.opacity = String(op)
    }
    // noise: struck in place first, then dropped a beat later
    clearTimeout(dropTimer)
    if (k === 2) dropTimer = window.setTimeout(() => { if (step === 2) for (const t of tiles) if (t.noise) { t.el.style.transform = T(t, t.pile.x + t.jit[0] * 60, V + 200, t.jit[2] * 4, 0.8); t.el.style.opacity = '0' } }, 520)
  }

  function setStep(k: number) {
    if (k === step) return
    step = k; pin.dataset.step = String(k)
    place(k)
    const s = STEPS[Math.max(k, 0)]
    stepK.textContent = `STEP ${String(Math.max(k, 0) + 1).padStart(2, '0')} / 05`; stepT.textContent = s[0]; stepD.textContent = s[1]; stepM.textContent = s[2]
    copy.classList.remove('swap'); void copy.offsetWidth; copy.classList.add('swap')
    segs.forEach((g, i) => g.classList.toggle('on', i <= k))
  }

  const wraps: any[] = Array.from(document.querySelectorAll('.card-wrap'))
  const cardEls = wraps.map(w => w.querySelector('.card')), dims = wraps.map(w => w.querySelector('.dim'))
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  function cards() {
    const cover = wraps.map((w, j) => 1 - clamp((w.getBoundingClientRect().top - (122 + j * 28) * u) / (620 * u), 0, 1))
    cardEls.forEach((c, i) => { let k = 0; for (let j = i + 1; j < wraps.length; j++) k += cover[j]; c.style.transform = reduce ? 'none' : `scale(${1 - 0.035 * k})`; dims[i].style.opacity = (0.12 * Math.min(k, 2)).toFixed(3) })
  }

  let ticking = false
  function tick() {
    ticking = false
    if (!alive) return
    const total = process.offsetHeight - innerHeight
    const p = clamp(-process.getBoundingClientRect().top / total, 0, 1)
    veil.style.opacity = (0.88 * clamp(p / 0.03, 0, 1)).toFixed(3)
    let k = -1; for (let i = 0; i < AT.length; i++) if (p >= AT[i]) k = i
    setStep(k)
    // loading bar: the current segment fills while you scroll through the step
    const ends = [...AT.slice(1), 0.86]
    segs.forEach((g, i) => { const f = i < k ? 1 : i === k ? clamp((p - AT[i]) / (ends[i] - AT[i]), 0, 1) : 0; g.querySelector('.fill').style.transform = `scaleX(${f})` })
    const done = k < 0 ? 0 : clamp(((k + clamp((p - AT[k]) / (ends[k] - AT[k]), 0, 1)) / 5) * 100, 0, 100)
    pct.textContent = done >= 100 ? 'DONE 100%' : `PROCESSING ${Math.round(done)}%`
    // parallax: the fixed photo drifts in slowly while the intro scrolls
    const intro = clamp(scrollY / (process.offsetTop + total), 0, 1)
    bgfix.style.setProperty('--z', (1.08 - 0.08 * intro).toFixed(4))
    bgfix.style.visibility = scrollY > process.offsetTop + total + innerHeight ? 'hidden' : 'visible'
    cards()
  }

  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(tick) } }
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', layout)
  layout()
  if ((document as any).fonts?.ready) (document as any).fonts.ready.then(layout)

  return () => {
    alive = false
    clearTimeout(dropTimer)
    removeEventListener('scroll', onScroll)
    removeEventListener('resize', layout)
    field.innerHTML = ''; lines.innerHTML = ''; cols.innerHTML = ''; $('progress').innerHTML = ''
  }
}
