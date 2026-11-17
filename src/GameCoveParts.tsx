import React, { useEffect, useRef, useState } from 'react'

/**
 * GameCove case study — the later sections, kept in their own file so they can change without resending the whole page:
 * Ideate (user flow → lo-fi wireframes), Test · Iterate (round 2 with P2) and Reflection.
 * Rendered inside GameCoveV4Body (root .gc4), so the page's reveal ([data-r]), magnifier and base styles apply here too.
 *
 * v126 (Harbor, Nov 14 night, Figma "04 GameCove — 1921" 869:3104):
 *  - Ideate: the user flow and the lo-fi wireframes show the same two flows, so they are one scroll piece now. Each flow is
 *    pinned; as you scroll, each wireframe appears over the flow step it was drawn from, then drops into its place below,
 *    leaving a line back to that step. Wide, tall screens only (≥1280 × 800); otherwise, and with reduced motion, the
 *    flow and the wireframes simply stack. The team photo stays until Harbor's drawing video.
 *  - Test · Iterate: Figma's Iteration section as built — Mapping guide before/after, round 2 head, session video next to
 *    "What it means", 4 findings, the card sort of all 18 metrics, and the note. The Test section before it is gone (Figma).
 *  - Reflection: light (#FAFAF9, like Final design) — takeaways on the left, team photo on the right, then next steps.
 * Labels that are mono in Figma (Roboto Mono) are mono here (.mono).
 *
 * v127 (Harbor, Nov 14 22:05): the four wireframes of a flow now move together, in one go, not one after another.
 * Drawings are Figma's English redraws (901:1629, sketch-en-1…8). The session video is out for now (Harbor adds it
 * herself; set SESSION_VIDEO to bring the player back), so "What it means" runs full width. The Final design tour's
 * "Live prototype" link (GameCoveV4.tsx) is styled here as a square box button on the right, after the tabs, no arrow.
 *
 * v129 (Harbor, Figma note): the "Live prototype" box button goes back to the left end of the tour's top row, across
 * from the tabs (same square box, no arrow).
 *
 * v140 (Harbor, Nov 17, Figma "08 Test + Iterate · v3" 1773:13708): Test · Iterate is rebuilt from that frame word for word —
 * the 3 questions (their screen cards stack as you scroll, wide and tall screens only), the SUS and hidden-problem cards,
 * the Mapping guide before/after, and the follow-up card sort (the session GIF goes in FOLLOW_GIF). Reflection's next
 * steps are one line now (Figma 1785:424).
 *
 * v141 (Harbor, Nov 17 14:08): the 01 / 02 / 03 numbers above each question are gone (they piled up at the top-left as
 * the cards stacked); no hover zoom on this section's images; the pins pulse in colour; the follow-up clip is on the
 * left of the card sort, as in Figma.
 *
 * v142 (Harbor, Nov 17 14:44):
 *  - Define's insight icons (InsightIcon, used by GameCoveV4.tsx) are drawn from Figma's own vectors (1621:7572,
 *    7585, 7595): the disc stays put and the icon sits a little lower, into the disc, and bobs up and down
 *  - Test · Iterate: the section's background is the old panel colour (#202026) so it stands apart from the light
 *    sections around it, and the screens drop their panels: each screenshot runs the full column, with a thin edge
 *
 * v143 (Harbor, Nov 17 15:06): the question cards no longer dim or shrink as they stack (no colour change while
 * scrolling): the card underneath simply fades out as the next one slides over it, so only one card shows at a time
 * and nothing peeks out. A little more room between the text and the screenshot (48 → 80). Before / After read
 * AS IS / TO BE.
 */

const V5 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/gamecove/v5/'
const P = {
  sketch: [1, 2, 3, 4, 5, 6, 7, 8].map(n => V5 + `sketch-en-${n}.webp`), // Figma 901:1629, English redraws
  photo: V5 + 'photo.webp',
  reflection: V5 + 'reflection-photo.webp',
}
// v140: Figma "08 Test + Iterate · v3" screens, the redrawn Mapping guide and the tester flags
const V6 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/gamecove/v6/'

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const d = (n: number) => ({ '--d': n } as React.CSSProperties)

function Eyebrow({ label, sq = 'blue' }: { label: string; sq?: 'grey' | 'blue' | 'sky' }) {
  return <div className={'g-eyebrow sq-' + sq}><i aria-hidden="true" />{label}</div>
}

/* ---------- define: insight icons (Figma 1621:7572 · 7585 · 7595, 80 × 72) ---------- */

const ICON_PROPS = { fill: 'none', stroke: '#F2F0EC', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const INSIGHT_ICONS = [
  // 01 · a dashboard with a falling line
  <svg key="1" width="28" height="24" viewBox="0 0 28 24" fill="none">
    <path {...ICON_PROPS} d="M24.75 0.75H2.35C1.46634 0.75 0.75 1.46634 0.75 2.35V16.75C0.75 17.6337 1.46634 18.35 2.35 18.35H24.75C25.6337 18.35 26.35 17.6337 26.35 16.75V2.35C26.35 1.46634 25.6337 0.75 24.75 0.75Z" />
    <path {...ICON_PROPS} d="M8.75 23.15H18.35M13.55 18.35V23.15" />
    <path {...ICON_PROPS} d="M5.5498 6.34998L10.3498 10.35L14.3498 8.74998L19.9498 14.35" />
    <path {...ICON_PROPS} d="M15.9502 14.35H19.9502V10.35" />
  </svg>,
  // 02 · a wrench
  <svg key="2" width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path {...ICON_PROPS} d="M16.43 0.956273C15.37 0.670919 14.2521 0.681821 13.1979 0.987791C12.1437 1.29376 11.1936 1.88307 10.4511 2.69157C9.7086 3.50007 9.20213 4.49677 8.98683 5.57315C8.77152 6.64954 8.85563 7.76437 9.23 8.79627L1.39 16.6363C0.97241 17.0747 0.74279 17.6591 0.750173 18.2646C0.757555 18.87 1.00135 19.4486 1.42951 19.8768C1.85767 20.3049 2.43625 20.5487 3.04171 20.5561C3.64717 20.5635 4.23153 20.3339 4.67 19.9163L12.51 12.0763C13.5419 12.4506 14.6567 12.5348 15.7331 12.3194C16.8095 12.1041 17.8062 11.5977 18.6147 10.8552C19.4232 10.1127 20.0125 9.16261 20.3185 8.1084C20.6245 7.05419 20.6354 5.93625 20.35 4.87627L16.75 8.47627L13.55 7.75627L12.83 4.55627L16.43 0.956273Z" />
  </svg>,
  // 03 · a person and a crossed-out speech bubble
  <svg key="3" width="29" height="23" viewBox="0 0 29 23" fill="none">
    <path {...ICON_PROPS} d="M8.7501 9.95002C11.1802 9.95002 13.1501 7.98008 13.1501 5.55002C13.1501 3.11997 11.1802 1.15002 8.7501 1.15002C6.32004 1.15002 4.3501 3.11997 4.3501 5.55002C4.3501 7.98008 6.32004 9.95002 8.7501 9.95002Z" />
    <path {...ICON_PROPS} d="M0.75 21.55C0.75 16.75 4.35 13.55 8.75 13.55C13.15 13.55 16.75 16.75 16.75 21.55" />
    <path {...ICON_PROPS} d="M19.1499 0.75H25.5499C26.0803 0.75 26.589 0.960714 26.9641 1.33579C27.3392 1.71086 27.5499 2.21957 27.5499 2.75V7.95C27.5499 8.48043 27.3392 8.98914 26.9641 9.36421C26.589 9.73929 26.0803 9.95 25.5499 9.95H23.1499L20.7499 12.35V9.95H19.1499C18.6195 9.95 18.1108 9.73929 17.7357 9.36421C17.3606 8.98914 17.1499 8.48043 17.1499 7.95V2.75C17.1499 2.21957 17.3606 1.71086 17.7357 1.33579C18.1108 0.960714 18.6195 0.75 19.1499 0.75Z" />
    <path {...ICON_PROPS} d="M20.75 3.54999L23.95 6.74999M23.95 3.54999L20.75 6.74999" />
  </svg>,
]

/** an insight's icon on its disc: the disc stays, the icon bobs up and down (still with reduced motion) */
export function InsightIcon({ i }: { i: number }) {
  return (
    <div className="in-node" aria-hidden="true">
      <svg className="in-disc" width="80" height="72" viewBox="0 0 80 72" fill="none">
        <g transform="translate(3.5 48)">
          <path d="M0.5 0V6C0.5 9.44781 4.29285 12.7544 11.0442 15.1924C17.7955 17.6304 26.9522 19 36.5 19C46.0478 19 55.2045 17.6304 61.9558 15.1924C68.7072 12.7544 72.5 9.44781 72.5 6V0" fill="#131417" />
          <path d="M0.5 0V6C0.5 9.44781 4.29285 12.7544 11.0442 15.1924C17.7955 17.6304 26.9522 19 36.5 19C46.0478 19 55.2045 17.6304 61.9558 15.1924C68.7072 12.7544 72.5 9.44781 72.5 6V0" stroke="white" strokeOpacity="0.28" />
        </g>
        <g transform="translate(3.5 34.5)">
          <path d="M36.5 26.5C56.3823 26.5 72.5 20.6797 72.5 13.5C72.5 6.3203 56.3823 0.5 36.5 0.5C16.6177 0.5 0.5 6.3203 0.5 13.5C0.5 20.6797 16.6177 26.5 36.5 26.5Z" fill="#202127" stroke="white" strokeOpacity="0.28" />
        </g>
      </svg>
      <span className="in-ic" style={d(i)}>{INSIGHT_ICONS[i]}</span>
    </div>
  )
}

/* ---------- ideate: user flow → lo-fi wireframes ---------- */

type Nd = { k: 'end' | 'ai' | 'user' | 'q'; t: string; sub?: string; yes?: boolean } | { k: 'paths'; items: string[] }
const FLOWS: { t: string; nodes: Nd[] }[] = [
  { t: 'Set up a project', nodes: [
    { k: 'end', t: 'New project' },
    { k: 'ai', t: 'Reads the game scripts and maps the stages' },
    { k: 'user', t: 'Checks the map and writes a goal' },
    { k: 'ai', t: 'Suggests what to track for that goal' },
    { k: 'q', t: 'Does it fit the goal?', sub: 'No: edit it in plain words' },
    { k: 'ai', t: 'Turns tracking on in the game', yes: true },
    { k: 'end', t: 'Dashboard overview' },
  ] },
  { t: 'From a problem to a decision', nodes: [
    { k: 'end', t: 'Dashboard overview' },
    { k: 'user', t: 'Notices more players quit on Day 4' },
    { k: 'q', t: 'How do I find the cause?' },
    { k: 'paths', items: ['1  Explore the charts myself', '2  Ask AI about a chart', '3  Open the AI agent'] },
    { k: 'ai', t: 'Builds a chart, explains it and suggests a next step' },
    { k: 'q', t: 'Do I know what to fix?', sub: 'No: keep asking' },
    { k: 'end', t: 'Explains the cause and the fix', yes: true },
  ] },
]
const SKETCHES = [
  ['Pick a game project', 'AI reads the game and maps the stages', 'Write what you want to check', 'AI suggests what to track'],
  ['Overview opens with an AI briefing', 'Explore a chart, with Ask AI on hand', 'Find the cause together with AI', 'Or ask the AI agent directly'],
]
// the flow step each wireframe was drawn from ("3.0" = the first of the three paths at step 3)
const FROM = [['0', '1', '2', '3'], ['0', '3.0', '4', '3.2']]

const Arrow = ({ yes }: { yes?: boolean }) => (
  <span className="fl-arr" aria-hidden="true">
    {yes && <span className="yes">Yes</span>}
    <svg width="28" height="16" viewBox="0 0 28 16" fill="none"><path d="M1 8h24M19 2l6 6-6 6" stroke="#8A8D96" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
)

function FlowNode({ n, k }: { n: Nd; k: number }) {
  if (n.k === 'paths') return <div className="fl-paths">{n.items.map((t, j) => <div key={t} className="nd user" data-k={`${k}.${j}`}>{t}</div>)}</div>
  return (
    <div className={'nd ' + n.k} data-k={String(k)}>
      {n.k === 'ai' && <b className="ai">AI</b>}
      <span>{n.t}</span>
      {n.sub && <span className="sub">{n.sub}</span>}
    </div>
  )
}

/** one flow, pinned: all four wireframes appear over their steps together, then drop into place below with a line back to each step */
function FlowSketch({ fi }: { fi: number }) {
  const outer = useRef<HTMLDivElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const cards = useRef<(HTMLImageElement | null)[]>([])
  const boxes = useRef<(HTMLDivElement | null)[]>([])
  const caps = useRef<(HTMLElement | null)[]>([])
  const [on, setOn] = useState(false)
  const onRef = useRef(false); onRef.current = on
  const f = FLOWS[fi], row = SKETCHES[fi], from = FROM[fi]

  const update = () => {
    const el = outer.current, p = pin.current, sv = svg.current
    if (!el || !p || !sv) return
    const paths = Array.from(sv.querySelectorAll('path'))
    if (!onRef.current) {
      cards.current.forEach(c => { if (c) { c.style.transform = ''; c.style.opacity = '' } })
      caps.current.forEach(c => { if (c) c.style.opacity = '' })
      p.querySelectorAll('.nd').forEach(n => n.classList.remove('lit', 'done'))
      paths.forEach(pa => { pa.style.opacity = '0' })
      return
    }
    const top = parseFloat(getComputedStyle(p).top) || 0
    const travel = el.offsetHeight - p.offsetHeight
    if (travel <= 0) return
    const prog = clamp((top - el.getBoundingClientRect().top) / travel)
    const s = clamp(prog / 0.8) // all cards move together; the last stretch holds the finished state
    const pr = p.getBoundingClientRect()
    row.forEach((_, k) => {
      const card = cards.current[k], box = boxes.current[k], cap = caps.current[k], pa = paths[k]
      const node = p.querySelector<HTMLElement>(`[data-k="${from[k]}"]`)
      if (!card || !box || !node) return
      const t = s
      const nr = node.getBoundingClientRect(), br = box.getBoundingClientRect()
      const sc0 = Math.min(1, nr.width / br.width)
      const x0 = nr.left - br.left, y0 = nr.top - br.top + (nr.height - br.height * sc0) / 2
      const a = clamp(t / 0.3), m = easeIO(clamp((t - 0.3) / 0.7))
      const sc = sc0 + (1 - sc0) * m, x = x0 * (1 - m), y = y0 * (1 - m)
      card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${sc.toFixed(4)})`
      card.style.opacity = a.toFixed(3)
      node.classList.toggle('lit', t > 0 && t < 1)
      node.classList.toggle('done', t >= 1)
      if (cap) cap.style.opacity = clamp((t - 0.8) / 0.2).toFixed(3)
      if (pa) {
        if (t < 0.45) pa.style.opacity = '0'
        else {
          const nx = nr.left - pr.left + nr.width / 2, ny = nr.bottom - pr.top
          const cx = br.left - pr.left + x + (br.width * sc) / 2, cy = br.top - pr.top + y
          const bend = Math.max(24, (cy - ny) / 2)
          pa.setAttribute('d', `M${nx.toFixed(1)} ${ny.toFixed(1)} C${nx.toFixed(1)} ${(ny + bend).toFixed(1)} ${cx.toFixed(1)} ${(cy - bend).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}`)
          pa.style.opacity = t >= 1 ? '.5' : '1'
        }
      }
    })
  }
  const upd = useRef(update); upd.current = update

  useEffect(() => {
    const mq = matchMedia('(min-width: 1280px) and (min-height: 800px)')
    const set = () => setOn(mq.matches && !reducedMotion())
    set()
    mq.addEventListener('change', set)
    let raf = 0
    const tick = () => { raf = 0; upd.current() }
    const req = () => { if (!raf) raf = requestAnimationFrame(tick) }
    addEventListener('scroll', req, { passive: true }); addEventListener('resize', req)
    return () => { mq.removeEventListener('change', set); removeEventListener('scroll', req); removeEventListener('resize', req); if (raf) cancelAnimationFrame(raf) }
  }, [])
  useEffect(() => { upd.current() }, [on])

  return (
    <div ref={outer} className={'fs' + (on ? ' on' : '')}>
      <div ref={pin} className="fs-pin">
        <div className="g-flowc fs-flow">
          <h4 className="fl-t"><span>0{fi + 1}</span>{f.t}</h4>
          <div className="fl-scroll">
            <div className="fl-row">
              {f.nodes.map((n, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <Arrow yes={'yes' in n && n.yes} />}
                  <FlowNode n={n} k={i} />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="g-sk fs-sk">
          {row.map((c, i) => {
            const n = fi * 4 + i
            return (
              <figure key={c}>
                <div className="fs-box" ref={el => { boxes.current[i] = el }}>
                  <img ref={el => { cards.current[i] = el }} src={P.sketch[n]} alt={`Lo-fi sketch ${n + 1}: ${c}`} loading="lazy"
                    {...(on ? {} : { 'data-gzoom': 'true' })} />
                </div>
                <figcaption ref={el => { caps.current[i] = el }}><span>0{n + 1}</span>{c}</figcaption>
              </figure>
            )
          })}
        </div>
        <svg ref={svg} className="fs-lines" aria-hidden="true">
          {row.map((_, i) => <path key={i} d="" />)}
        </svg>
      </div>
    </div>
  )
}

export function Ideate() {
  return (
    <section className="g-sec" data-chapter="Ideate">
      <div className="g-wrap">
        <div data-r className="w-760">
          <Eyebrow label="IDEATE" />
          <h2 className="g-h2 mt-40">6 rules from research:<br />AI goes first, the creator decides</h2>
          <p className="g-body mt-24">Research on sensemaking showed that beginners need a starting point, not more charts. So the AI should act as a guide, not a judge. Its suggestions must be easy to check and change.</p>
        </div>

        {/* v137 (Harbor): one title line, no descriptions */}
        <h3 className="g-h3l mt-80" data-r>User flow · Wireframe</h3>
        <div className="fl-legend mt-40" data-r>
          <span><i className="lg user" />Game creator does</span>
          <span><i className="lg ai" />AI does</span>
          <span><i className="lg q" />Decision</span>
          <span><i className="lg end" />Start / end</span>
        </div>
        <div className="mt-40"><FlowSketch fi={0} /></div>
        <div className="mt-80"><FlowSketch fi={1} /></div>

        {/* stand-in until Harbor's drawing video */}
        <img className="g-photo5 mt-80" data-r src={P.photo} alt="Harbor talking through the GameCove sketches with her teammate" loading="lazy" />
      </div>
    </section>
  )
}

/* ---------- test · iterate (Figma "08 Test + Iterate · v3", 1773:13708) ---------- */

type Mark = { c: 'red' | 'blue'; pin: [number, number]; box: [number, number]; t: string } // % of the screen
const QS: { n: string; q: string; ok: boolean; task: string; f: string; img: string; ar: string; alt: string; marks: Mark[] }[] = [
  {
    n: '01', q: 'Do they get what the setup is for?', ok: false, task: 'TASK 1 · MAP THE GAME',
    f: 'weren’t sure why they were mapping. One thought he was designing a new game.',
    img: V6 + 'task1.jpg', ar: '880 / 592',
    alt: 'Task 1, the Mapping screen as tested: the game map with a small tip on what to review. A red pin marks the tip: no reason given here.',
    marks: [{ c: 'red', pin: [56.23, 59.12], box: [33.84, 58.95], t: 'No reason given here' }],
  },
  {
    n: '02', q: 'Can AI set up tracking for them?', ok: true, task: 'TASK 2 · PICK A GOAL',
    f: 'liked AI turning a goal into a tracking plan. All 3 opened the default dashboard first.',
    img: V6 + 'task2.jpg', ar: '880 / 550',
    alt: 'Task 2, a new analysis board asking “What would you like to analyze?” with three suggested goals and a text box. A blue pin marks the goal box: goal in plain words, AI suggests what to track. A red pin on the sidebar: starting here needed a hint.',
    marks: [
      { c: 'blue', pin: [61.73, 51.36], box: [18.89, 51.18], t: 'Goal in plain words → AI suggests what to track' },
      { c: 'red', pin: [6.73, 38.36], box: [12.64, 38.18], t: 'Starting here needed a hint' },
    ],
  },
  {
    n: '03', q: 'Can they find a problem and decide what to fix?', ok: true, task: 'TASK 3 · EXPLORE THE DATA',
    f: 'found a problem in the data and suggested a fix. One never noticed the AI agent.',
    img: V6 + 'task3.jpg', ar: '880 / 550',
    alt: 'Task 3, the Overview dashboard with key numbers and the AI agent panel open. A blue pin on the key numbers: all 3 found a problem from these numbers. A red pin on the AI Agent button: 1 of 3 never saw this.',
    marks: [
      { c: 'blue', pin: [39.73, 32.36], box: [45.64, 32.18], t: 'All 3 found a problem from these numbers' },
      { c: 'red', pin: [84.23, -0.13], box: [62.30, 2.18], t: '1 of 3 never saw this' },
    ],
  },
]
const SUS: { p: string; flag: 'kr' | 'kg'; who: string; v: string; w: number; pilot?: boolean }[] = [
  { p: 'P1 · pilot', flag: 'kr', who: 'Teen game creator', v: '65', w: 286, pilot: true },
  { p: 'P2', flag: 'kr', who: 'Hobby game creator, 35–44', v: '90', w: 396 },
  { p: 'P3', flag: 'kr', who: 'Pro game developer, 28–35', v: '97.5', w: 429 },
  { p: 'P4', flag: 'kg', who: 'Teen game creator', v: '82.5', w: 363 },
  { p: 'P5', flag: 'kr', who: 'Teen game creator', v: '93.3', w: 410 },
]
const FLAG = { kr: { src: V6 + 'flag-kr.svg', alt: 'South Korea' }, kg: { src: V6 + 'flag-kg.svg', alt: 'Kyrgyzstan' } }
const HIDDEN: [string, boolean, string][] = [['A ✓', true, 'Stage 4 is too hard'], ['B ✓', true, 'New players leave early'], ['C ✗', false, 'Players quit after finishing']]
// follow-up session (P2), Harbor's clip with his face blurred (1117_1_.mov, 45s). Plays like a GIF: muted, looping, no
// controls; 2.2 MB as MP4 instead of a GIF many times that size. With reduced motion it stays on the poster frame.
const FOLLOW_VIDEO = V6 + 'followup.mp4'
const FOLLOW_POSTER = V6 + 'followup-poster.jpg'

/** the follow-up clip, GIF-like: React does not write the muted attribute, so the browser can refuse autoplay; it is
 * started here instead (muted), while it is on screen, and paused when it leaves */
function FollowClip() {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current; if (!v) return
    v.muted = true
    if (reducedMotion()) return
    if (!('IntersectionObserver' in window)) { v.play().catch(() => {}); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.2 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return (
    <video ref={ref} src={FOLLOW_VIDEO} poster={FOLLOW_POSTER} muted loop playsInline preload="metadata"
      aria-label="Follow-up session with P2, his face blurred: he moves the dashboard’s 18 metric cards into must-have, nice to have and not needed while we talk it through" />
  )
}

/** stacking cards: on wide, tall screens each question card sticks and the next one slides up over it while the one
 * underneath fades out (v143: no dimming or shrinking) */
function useStack() {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const mq = matchMedia('(min-width: 1024px) and (min-height: 760px)')
    const set = () => setOn(mq.matches && !reducedMotion())
    set(); mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [])
  useEffect(() => {
    const el = ref.current; if (!el) return
    const cards = Array.from(el.querySelectorAll<HTMLElement>('.ts-q'))
    if (!on) { cards.forEach(c => c.style.removeProperty('--k')); return }
    let raf = 0
    const run = () => {
      raf = 0
      cards.forEach((c, i) => {
        const nx = cards[i + 1]
        if (!nx) { c.style.setProperty('--k', '0'); return }
        const a = c.getBoundingClientRect(), b = nx.getBoundingClientRect()
        const k = clamp(1 - (b.top - a.top) / (a.height + 80)) // 0 = next card still below, 1 = next card on top
        c.style.setProperty('--k', clamp((k - 0.3) / 0.5).toFixed(3)) // fade out between 30% and 80% of the way
      })
    }
    const go = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', go, { passive: true }); addEventListener('resize', go)
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', go); removeEventListener('resize', go) }
  }, [on])
  return [ref, on] as const
}

export function Iterate() {
  const [stack, on] = useStack()
  return (
    <section className="g-sec it" data-chapter="Iterate">
      <div className="g-wrap">
        <div data-r className="ts-head">
          <Eyebrow label="TEST" />
          <h2 className="ts-h2">Can a beginner go from data to a decision?</h2>
          <p className="ts-lead">We gave 5 game creators a sample game with 3 hidden problems, then watched them work.</p>
        </div>

        <div className={'ts-stack' + (on ? ' on' : '')} ref={stack}>
          {QS.map(q => (
            <article className="ts-q" key={q.n}>
              <div className="ts-card">
                <div className="ts-text" data-r>
                  <h3 className="ts-qt">{q.q}</h3>
                  <div className="ts-meta">
                    <span className={'ts-chip ' + (q.ok ? 'yes' : 'no')}>{q.ok ? 'YES' : 'NOT YET'}</span>
                    <span className="ts-task">{q.task}</span>
                  </div>
                  <div className="ts-find">
                    <div className={'ts-big ' + (q.ok ? 'yes' : 'no')}>3 of 3</div>
                    <p>{q.f}</p>
                  </div>
                </div>
                <figure className="ts-panel" data-r style={d(1)}>
                  <div className="ts-screen" style={{ aspectRatio: q.ar }}>
                    <img src={q.img} alt={q.alt} loading="lazy" />
                    {q.marks.map(m => (
                      <React.Fragment key={m.t}>
                        <i className={'ts-pin ' + m.c} aria-hidden="true" style={{ left: m.pin[0] + '%', top: m.pin[1] + '%' }} />
                        <span className={'ts-call ' + m.c} aria-hidden="true" style={{ left: m.box[0] + '%', top: m.box[1] + '%' }}>{m.t}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </figure>
              </div>
            </article>
          ))}
        </div>

        <div className="ts-nums">
          <div className="ts-box ts-sus" data-r>
            <h3 className="ts-bt">How easy it felt · SUS score</h3>
            <p className="ts-sub">Goal: 90. After the pilot, testers scored 82.5 to 97.5.</p>
            <ul className="ts-bars">
              {SUS.map(s => (
                <li key={s.p}>
                  <div className="ts-who">
                    <div className="ts-pn"><img src={FLAG[s.flag].src} alt={FLAG[s.flag].alt} width={16} height={16} />{s.p}</div>
                    <div className="ts-pd">{s.who}</div>
                  </div>
                  <div className="ts-track" aria-hidden="true">
                    <i className={s.pilot ? 'pilot' : ''} style={{ width: (s.w / 440) * 100 + '%' }} />
                    <b />
                  </div>
                  <div className="ts-v">{s.v}</div>
                </li>
              ))}
            </ul>
            <p className="ts-foot">White line = goal of 90</p>
          </div>
          <div className="ts-box ts-hid" data-r style={d(1)}>
            <h3 className="ts-bt">Hidden problems found</h3>
            <div className="ts-big blue">2 of 3</div>
            <ul className="ts-probs">
              {HIDDEN.map(([c, ok, t]) => (
                <li key={c} className={ok ? '' : 'miss'}><span className={'ts-chip ' + (ok ? 'yes' : 'no')}>{c}</span>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ts-iter">
          <div data-r>
            <Eyebrow label="ITERATE" />
            <h2 className="ts-h2">So we fixed the start first</h2>
          </div>
          <div className="ts-ba">
            <figure data-r>
              <div className="ts-bap"><img src={V6 + 'task1.jpg'} alt="As is: the Mapping screen shows the game map with a small tip, “Review the details of each structure and edit anything that looks wrong”" loading="lazy" /></div>
              <figcaption><b>AS IS</b>A tip on what to do, but not why</figcaption>
            </figure>
            <figure data-r style={d(1)}>
              <div className="ts-bap after"><img src={V6 + 'after.jpg'} alt="To be: a purpose guide on the Mapping screen, “Step 1 · Check your game map. AI read your game and drew its stages. Check they’re right. We’ll track and analyse along this map.” with a Looks right button" loading="lazy" /></div>
              <figcaption><b className="on">TO BE</b>Says why: this map decides what we track (redrawn)</figcaption>
            </figure>
          </div>
        </div>

        <div className="ts-follow">
          <div data-r>
            <h3 className="ts-qt">Then we asked again: is this data really needed?</h3>
            <p className="ts-sub">Follow-up test with P2, a hobby game creator in his mid-30s. He sorted all 18 metrics from the dashboard.</p>
          </div>
          <div className="ts-frow">
            <div className="ts-gif" data-r>
              <FollowClip />
            </div>
            <div className="ts-sort" data-r style={d(1)}>
              <div className="ts-counts">
                <div><b className="blue">16</b><span>must-have</span></div>
                <div><b>2</b><span>nice to have</span></div>
                <div><b>0</b><span>not needed</span></div>
              </div>
              <div className="ts-take">
                <div className="ts-tk">WHAT IT MEANS FOR GAMECOVE</div>
                <p>Not a blank board to build. A finished screen he can switch on, off, or add to.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- reflection (light, Figma #FAFAF9) ---------- */

export function Reflection() {
  return (
    <section className="g-sec last rf" data-chapter="Reflection">
      <div className="g-wrap">
        <div className="rf-top">
          <div data-r>
            <Eyebrow label="REFLECTION" />
            <h2 className="g-h2 mt-24">Takeaways</h2>
            <div className="rf-take mt-32">
              {[
                'Users expect AI to give the answer. My next challenge is helping them reason for themselves, not just accept what AI says.',
                'Score “doing” and “understanding” separately. A user can press confirm without knowing why. That is how we found the mapping problem.',
                'Handoff goes both ways. As a receiver, I want to see the process as it happens. As a giver, I should explain every step.',
              ].map((t, i) => <p key={i}>{t}</p>)}
            </div>
          </div>
          <img className="rf-photo" data-r style={d(1)} src={P.reflection} alt="Harbor talking through GameCove with her teammate, the research sticky notes on the wall behind them" loading="lazy" />
        </div>
        <div className="rf-next mt-80" data-r>
          <h3 className="rf-nh">Next steps</h3>
          <p className="rf-np">I'll test with adult game creators from small studios and track setup, AI agent use and weekly returns after launch.</p>
        </div>
      </div>
    </section>
  )
}

export const PARTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap');
.gc4 .mono, .hb.gc .gc4 .g-wrap .mono { font-family: "Roboto Mono", ui-monospace, Menlo, monospace !important; }

/* ideate: one flow pinned, its wireframes drop out of the steps they came from */
.gc4 .fs-intro { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 40px; }
.gc4 .fs { position: relative; }
.gc4 .fs-pin { position: relative; }
.gc4 .fs-flow { position: relative; z-index: 1; }
.gc4 .fs-flow .fl-t { margin: 0; }
.gc4 .fs-k { margin-top: 40px; font-size: 16px; line-height: 24px; color: var(--mute); }
.gc4 .fs-sk { margin-top: 40px; } /* v137: the "Lo-fi wireframes · …" label above the sketches is gone */
.gc4 .fs-box { position: relative; z-index: 3; aspect-ratio: 344 / 264; }
.gc4 .fs-box img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform-origin: 0 0; will-change: transform, opacity; }
.gc4 .fs-lines { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.gc4 .fs-lines path { fill: none; stroke: #3898F8; stroke-width: 1.5; stroke-dasharray: 4 4; opacity: 0; transition: opacity .3s ease; }
.gc4 .fs .nd { transition: box-shadow .35s ease, background-color .35s ease; }
.gc4 .fs .nd.lit { box-shadow: 0 0 0 2px #B3D1FF, 0 0 24px rgba(56,152,248,.35); }
.gc4 .fs .nd.done { box-shadow: inset 0 -3px 0 #3898F8; }
/* pinned (wide, tall screens): the row fits the screen, no side scroll */
.gc4 .fs.on { height: calc(100vh + 120vh); }
.gc4 .fs.on .fs-pin { position: sticky; top: max(32px, calc(50vh - 400px)); }
.gc4 .fs.on .fs-flow { padding: 32px 40px; }
.gc4 .fs.on .fl-scroll { overflow: visible; margin-top: 16px; }
.gc4 .fs.on .fl-row { min-width: 0; }
.gc4 .fs.on .fl-row > .nd, .gc4 .fs.on .fl-row > .fl-paths { flex: 1 1 0; min-width: 0; width: auto; }
.gc4 .fs.on .fl-paths .nd { width: 100%; }
.gc4 .fs.on .fl-row .nd { padding: 12px 14px; }
.gc4 .fs.on .fs-sk { gap: 24px; }
.gc4 .fs.on .fs-box { box-shadow: inset 0 0 0 1px var(--line); }

/* define: insight icon on its disc (v142) — the icon sits a little into the disc and bobs */
.gc4 .in-node { position: relative; width: 80px; height: 72px; }
.gc4 .in-disc { position: absolute; inset: 0; }
.gc4 .in-ic { position: absolute; left: 0; right: 0; bottom: 30px; display: flex; justify-content: center;
  animation: in-bob 2.4s ease-in-out infinite; animation-delay: calc(var(--d, 0) * .4s); }
.gc4 .in-ic svg { display: block; }
@keyframes in-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

/* test · iterate (Figma 08 Test + Iterate v3) */
/* v142: the section has its own background (the old panel colour), so the dark screenshots stand out and the
   section reads apart from the light Prototype and Reflection around it */
.gc4 .it { --bg: #202026; padding-bottom: 120px; background: var(--bg); }
.gc4 .ts-head { display: flex; flex-direction: column; gap: 24px; }
.gc4 .ts-h2 { max-width: 960px; font-size: 48px; line-height: 56px; font-weight: 400; letter-spacing: -0.96px; color: var(--sand); }
.gc4 .ts-lead { max-width: 720px; font-size: 20px; line-height: 32px; color: #C9CAD0; }
.gc4 .ts-qt { font-size: 32px; line-height: 40px; font-weight: 400; letter-spacing: -0.32px; color: var(--sand); }
.gc4 .ts-sub { max-width: 720px; font-size: 18px; line-height: 28px; color: #C9CAD0; }
.gc4 .ts-big { font-size: 56px; line-height: 64px; font-weight: 400; letter-spacing: -1.12px; }
.gc4 .ts-big.no { color: #E28B8B; } .gc4 .ts-big.yes { color: #84D48E; } .gc4 .ts-big.blue { color: #3898F8; }
.gc4 .ts-chip { display: inline-flex; align-items: center; padding: 4px 12px; border: 1px solid; font-size: 16px; line-height: 24px; font-weight: 700; letter-spacing: .08em; white-space: nowrap; }
.gc4 .ts-chip.no { background: rgba(226,139,139,.12); border-color: #E28B8B; color: #E28B8B; }
.gc4 .ts-chip.yes { background: rgba(132,212,142,.12); border-color: #84D48E; color: #84D48E; }

/* the 3 questions: text left, screen panel right; stacking cards on wide, tall screens */
.gc4 .ts-stack { margin-top: 120px; }
.gc4 .ts-q + .ts-q { margin-top: 80px; }
.gc4 .ts-card { display: grid; grid-template-columns: 448px minmax(0, 1fr); gap: 80px; align-items: start; background: var(--bg); }
.gc4 .ts-text { display: flex; flex-direction: column; gap: 24px; }
.gc4 .ts-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.gc4 .ts-task { font-size: 16px; line-height: 24px; letter-spacing: .96px; color: var(--dim); }
.gc4 .ts-find { display: flex; flex-direction: column; gap: 8px; }
.gc4 .ts-find p { font-size: 18px; line-height: 28px; color: #C9CAD0; }
.gc4 .ts-panel { margin: 0; }
.gc4 .ts-screen { position: relative; width: 100%; border: 1px solid #3A3A44; box-shadow: 0 24px 48px rgba(0,0,0,.35); }
.gc4 .ts-screen img { width: 100%; height: 100%; object-fit: cover; }
.gc4 .ts-pin { position: absolute; width: 4.545%; aspect-ratio: 1; border: 3px solid rgb(var(--pc)); background: rgba(var(--pc), .18); animation: ts-pulse 1.6s ease-out infinite; }
.gc4 .ts-pin.red { --pc: 226, 139, 139; }
.gc4 .ts-pin.blue { --pc: 56, 152, 248; animation-delay: .8s; }
/* pins pulse to say "look here": the fill swells in colour and a ring spreads out and fades (no sparkle) */
@keyframes ts-pulse {
  0% { background-color: rgba(var(--pc), .18); box-shadow: 0 0 0 0 rgba(var(--pc), .6); }
  40% { background-color: rgba(var(--pc), .5); }
  100% { background-color: rgba(var(--pc), .18); box-shadow: 0 0 0 16px rgba(var(--pc), 0); }
}
.gc4 .ts-call { position: absolute; padding: 8px 16px; border: 1px solid; background: rgba(17,17,20,.94); font-size: 16px; line-height: 24px; color: var(--sand); white-space: nowrap; }
.gc4 .ts-call.red { border-color: #E28B8B; } .gc4 .ts-call.blue { border-color: #3898F8; }
/* v141: every card sticks at the same top, so no slice of the card underneath (its number or title) peeks out */
.gc4 .ts-stack.on .ts-q { position: sticky; top: max(32px, calc(50vh - 328px)); }
.gc4 .ts-stack.on .ts-card { opacity: calc(1 - var(--k, 0)); will-change: opacity; }

/* numbers */
.gc4 .ts-nums { display: grid; grid-template-columns: minmax(0, 880fr) minmax(0, 528fr); gap: 32px; align-items: start; margin-top: 120px; }
.gc4 .ts-box { display: flex; flex-direction: column; gap: 24px; padding: 40px; background: #17171B; border: 1px solid #26262C; }
.gc4 .ts-bt { font-size: 24px; line-height: 32px; font-weight: 400; letter-spacing: -0.24px; color: var(--sand); }
.gc4 .ts-bars { display: flex; flex-direction: column; gap: 16px; margin: 0; padding: 0; list-style: none; }
.gc4 .ts-bars li { display: grid; grid-template-columns: 232px minmax(0, 440px) auto; gap: 16px; align-items: center; }
.gc4 .ts-pn { display: flex; align-items: center; gap: 8px; font-size: 16px; line-height: 24px; color: var(--sand); }
.gc4 .ts-pn img { width: 16px; height: 16px; flex: none; }
.gc4 .ts-pd { font-size: 16px; line-height: 24px; color: var(--dim); }
.gc4 .ts-track { position: relative; height: 16px; background: #242A32; }
.gc4 .ts-track i { position: absolute; left: 0; top: 0; bottom: 0; background: #3898F8; }
.gc4 .ts-track i.pilot { background: #8A8D96; }
.gc4 .ts-track b { position: absolute; left: 89.77%; top: -6px; width: 2px; height: 28px; background: rgba(242,240,236,.8); }
.gc4 .ts-v { font-size: 16px; line-height: 24px; color: var(--sand); }
.gc4 .ts-foot { font-size: 16px; line-height: 24px; color: var(--dim); }
.gc4 .ts-probs { display: flex; flex-direction: column; gap: 16px; margin: 0; padding: 0; list-style: none; }
.gc4 .ts-probs li { display: flex; align-items: center; gap: 16px; font-size: 18px; line-height: 28px; color: var(--sand); }
.gc4 .ts-probs li.miss { color: var(--dim); }

/* iterate: before / after */
.gc4 .ts-iter { display: flex; flex-direction: column; gap: 48px; margin-top: 120px; }
.gc4 .ts-iter .ts-h2 { margin-top: 24px; }
.gc4 .ts-ba { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; }
.gc4 .ts-ba figure { display: flex; flex-direction: column; gap: 16px; }
.gc4 .ts-bap img { width: 100%; aspect-ratio: 656 / 441; object-fit: cover; border: 1px solid #3A3A44; box-shadow: 0 24px 48px rgba(0,0,0,.35); }
.gc4 .ts-bap.after img { border: 2px solid #3898F8; }
.gc4 .ts-ba figcaption { display: flex; flex-wrap: wrap; gap: 12px; font-size: 16px; line-height: 24px; color: #C9CAD0; }
.gc4 .ts-ba figcaption b { font-weight: 700; letter-spacing: .08em; color: var(--dim); }
.gc4 .ts-ba figcaption b.on { color: #3898F8; }

/* follow-up test: session GIF + card sort */
.gc4 .ts-follow { display: flex; flex-direction: column; gap: 48px; margin-top: 120px; }
.gc4 .ts-follow .ts-sub { margin-top: 16px; }
.gc4 .ts-frow { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; align-items: start; }
.gc4 .ts-gif { background: #111114; border: 1px solid #3A3A44; }
.gc4 .ts-gif video { display: block; width: 100%; aspect-ratio: 704 / 343; object-fit: cover; }
.gc4 .ts-sort { display: flex; flex-direction: column; gap: 24px; }
.gc4 .ts-counts { display: flex; flex-wrap: wrap; gap: 48px; }
.gc4 .ts-counts div { display: flex; flex-direction: column; }
.gc4 .ts-counts b { font-size: 56px; line-height: 64px; font-weight: 400; letter-spacing: -1.12px; color: var(--sand); }
.gc4 .ts-counts b.blue { color: #3898F8; }
.gc4 .ts-counts span { font-size: 16px; line-height: 24px; color: #C9CAD0; }
.gc4 .ts-take { display: flex; flex-direction: column; gap: 12px; padding: 32px; background: #1A3050; }
.gc4 .ts-tk { font-size: 16px; line-height: 24px; font-weight: 700; letter-spacing: .08em; color: #B3D1FF; }
.gc4 .ts-take p { max-width: 640px; font-size: 28px; line-height: 40px; color: var(--sand); }

/* final design tour (GameCoveV4.tsx): "Live prototype" as a square box button on the left, tabs on the right, no arrow */
.gc4 .g-final .g-tour-top { justify-content: space-between; align-items: center; }
.gc4 .g-final .g-live { display: inline-flex; align-items: center; justify-content: center; height: 56px; padding: 0 32px;
  border: 1px solid #111114; background: transparent; color: #111114; font-size: 16px; line-height: 24px; text-decoration: none; transition: background-color .3s, color .3s; }
.gc4 .g-final .g-live span { display: none; }
.gc4 .g-final .g-live:hover { background: #111114; color: #FAFAF9; }
.gc4 .g-final .g-live:focus-visible { outline: 2px solid #3898F8; outline-offset: 3px; }

/* reflection: light like Final design */
.gc4 .rf { background: #FAFAF9; color: #111114; padding-top: 120px; }
.gc4 .rf .g-eyebrow { color: #3D3E44; }
.gc4 .rf .g-h2 { color: #111114; }
.gc4 .rf-top { display: grid; grid-template-columns: minmax(0, 806fr) minmax(0, 514fr); gap: 120px; align-items: start; }
.gc4 .rf-take { display: flex; flex-direction: column; gap: 16px; }
.gc4 .rf-take p { font-size: 18px; line-height: 28px; color: #3D3E44; }
.gc4 .rf-photo { width: 100%; aspect-ratio: 514 / 343; object-fit: cover; }
.gc4 .rf-next { display: flex; flex-direction: column; gap: 16px; }
.gc4 .rf-nh { font-size: 48px; line-height: normal; font-weight: 400; color: #111114; }
.gc4 .rf-np { max-width: 808px; font-size: 18px; line-height: 28px; color: #3D3E44; }

/* round shapes that carry meaning stay round */
/* the page-wide 0px rule is (0,3,1), so this needs (0,4,1) to win */
.gc .gc4 .ts-screen i.ts-pin { border-radius: 50% !important; }

@media (max-width: 1280px) {
  .gc4 .ts-card { grid-template-columns: 360px minmax(0, 1fr); gap: 40px; }
  .gc4 .ts-nums { grid-template-columns: minmax(0, 1fr); }
  .gc4 .rf-top { gap: 64px; }
}
@media (max-width: 1023px) {
  .gc4 .fs-intro, .gc4 .ts-card, .gc4 .ts-ba, .gc4 .ts-frow, .gc4 .rf-top { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .gc4 .ts-stack, .gc4 .ts-nums, .gc4 .ts-iter, .gc4 .ts-follow { margin-top: 88px; }
  .gc4 .ts-h2 { font-size: 40px; line-height: 48px; }
}
@media (max-width: 700px) {
  .gc4 .ts-box, .gc4 .ts-take { padding: 24px; }
  .gc4 .ts-call { display: none; }
  .gc4 .ts-bars li { grid-template-columns: minmax(0, 1fr) auto; }
  .gc4 .ts-who { grid-column: 1 / -1; }
  .gc4 .ts-h2, .gc4 .rf-nh { font-size: 32px; line-height: 40px; }
  .gc4 .ts-big, .gc4 .ts-counts b { font-size: 48px; line-height: 56px; }
  .gc4 .ts-take p { font-size: 24px; line-height: 32px; }
}
@media (prefers-reduced-motion: reduce) {
  .gc4 .fs-lines path, .gc4 .fs .nd { transition: none !important; }
  .gc4 .ts-pin, .gc4 .in-ic { animation: none; }
}
`
