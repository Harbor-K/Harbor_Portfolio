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
 */

const V5 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/gamecove/v5/'
const P = {
  sketch: [1, 2, 3, 4, 5, 6, 7, 8].map(n => V5 + `sketch-${n}.webp`),
  photo: V5 + 'photo.webp',
  iterBefore: V5 + 'iter-before.webp',
  iterAfter: V5 + 'iter-after.webp',
  reflection: V5 + 'reflection-photo.webp',
}
// round 2 session recording (face blurred), from the Figma frame
const SESSION_VIDEO = 'zpETQewcnTQ'

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const d = (n: number) => ({ '--d': n } as React.CSSProperties)

function Eyebrow({ label, sq = 'blue' }: { label: string; sq?: 'grey' | 'blue' | 'sky' }) {
  return <div className={'g-eyebrow sq-' + sq}><i aria-hidden="true" />{label}</div>
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

/** one flow, pinned: each wireframe appears over its step, then drops into its place below with a line back to the step */
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
    const s = clamp(prog / 0.88) * row.length // the last stretch holds the finished state
    const pr = p.getBoundingClientRect()
    row.forEach((_, k) => {
      const card = cards.current[k], box = boxes.current[k], cap = caps.current[k], pa = paths[k]
      const node = p.querySelector<HTMLElement>(`[data-k="${from[k]}"]`)
      if (!card || !box || !node) return
      const t = clamp(s - k)
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
        <div className="fs-k">Lo-fi wireframes · {f.t}</div>
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

        <div className="fs-intro mt-80" data-r>
          <div>
            <h3 className="g-h3l">User flow</h3>
            <p className="g-body mute mt-16">We mapped two flows before sketching: setting up a project, then going from a problem to a decision.</p>
          </div>
          <div>
            <h3 className="g-h3l">Lo-fi wireframes</h3>
            <p className="g-body mute mt-16">Hand sketches of the same two flows, drawn before the coded prototype.</p>
          </div>
        </div>
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

/* ---------- test · iterate: round 2 with P2 ---------- */

const FINDINGS = [
  { q: 'Give me the base info first.', t: '38:05 · “Adding and removing is fine.” 47:58', a: 'Ready-made default boards. Charts can be turned on, off or added. No blank start.' },
  { q: 'AI just has to tell me the facts, accurately.', t: '33:35 · the decision is his', a: 'Every AI line shows the number behind it and where it came from.' },
  { q: 'Give me the answer in one line.', t: '30:40 · question titles took time to read', a: 'Each question-style chart title gets a one-line summary.' },
  { q: 'There’s no info on what it does, or how far.', t: '16:01 · during tracking setup', a: 'Show which chart each tracked event feeds, so the reason to collect is visible.' },
]
const CS_TOP = [
  { r: '1ST', c: 'D01', t: 'Today’s numbers', q: 'I check analytics every hour or day. This is the summary of everything below it.' },
  { r: '2ND', c: 'D03', t: 'Daily players, last 7 days', q: 'Is my game alive? Is it growing every week, or every day?' },
  { r: '3RD', c: 'D04', t: 'Playtime and sessions per player', q: 'I had a playtime in mind when I made the game. Am I hitting it?' },
]
const CS_TIERS: [string, [string, string][]][] = [
  ['TIER 1', [['D01', 'Today’s numbers'], ['D02', 'This week’s top 3 problems'], ['D03', 'Daily players'], ['D04', 'Playtime and sessions']]],
  ['TIER 2', [['D06', 'First-session drop-off by step'], ['D09', 'Stars collected in failed runs'], ['D10', 'Sessions that ended at the problem'], ['D11', 'Next-day return by how far they got'], ['D13', 'What they did right after leaving'], ['D17', 'Data we can’t collect yet'], ['D18', 'Hypotheses to test']]],
  ['TIER 3', [['D05', 'Clear rate by stage'], ['D07', 'Who left the Lobby: time, device, return'], ['D08', 'Fails and time to first clear'], ['D12', 'Follow one drop-off step'], ['D14', 'Cleared vs not cleared']]],
]
const CS_NICE: [string, string][] = [['D15', 'Where in a stage they stopped'], ['D16', 'One session’s timeline']]
const CS_MISSING = [
  { t: 'Crash and error reports', p: 'Which errors happen and how often. e.g. “Warning: Stage 3, Star #3 not detected: 5 times.”' },
  { t: 'Where players come from', p: 'Country, age and gender. “My target was US teens. Why are people in their 20s in Saudi Arabia playing?”' },
]

const Chip = ({ c, t }: { c: string; t: string }) => <span className="cs-chip"><b className="mono">{c}</b>{t}</span>

/** YouTube, loaded only when played (no cookies until then). No YouTube thumbnail: its auto frame shows faces unblurred. */
function SessionVideo() {
  const [play, setPlay] = useState(false)
  return (
    <div className="it-vid">
      {play
        ? <iframe src={`https://www.youtube-nocookie.com/embed/${SESSION_VIDEO}?autoplay=1&rel=0`} title="Round 2 session with P2 (face blurred)"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        : <button type="button" onClick={() => setPlay(true)} aria-label="Play the round 2 session video (face blurred)">
            <span className="play" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg></span>
            <span className="lab">Session video · face blurred</span>
          </button>}
    </div>
  )
}

export function Iterate() {
  return (
    <section className="g-sec it" data-chapter="Iterate">
      <div className="g-wrap">
        <div data-r className="it-head">
          <Eyebrow label="TEST · ITERATE" />
          <h2 className="g-h2 mt-24">We fixed it, then asked again:<br />is this data really needed?</h2>
          <p className="g-body mute mt-24">After round 1, we added a Mapping guide, a check that logging really worked, and more metrics on the dashboard. Then we tested again with P2, a hobby game creator in his mid-30s, and talked mostly about the data.</p>
        </div>

        <h3 className="g-h3l it-gap" data-r>What we changed after round 1: the Mapping guide</h3>
        <div className="it-pair mt-24">
          <figure className="it-shot" data-r style={d(0)}>
            <img src={P.iterBefore} alt="Before: the Mapping screen shows the game map with a small tip, “Review the details of each structure and edit anything that looks wrong”" loading="lazy" data-gzoom="true" />
            <figcaption><b className="mono">BEFORE</b>A tip on what to do, but not why</figcaption>
          </figure>
          <figure className="it-shot" data-r style={d(1)}>
            <img src={P.iterAfter} alt="After: a purpose guide on the Mapping screen, “Step 1 · Check your game map. AI read your game and drew its stages. Check they’re right. We’ll track and analyse along this map.” with a Looks right button" loading="lazy" data-gzoom="true" />
            <figcaption><b className="mono on">AFTER</b>Says why: this map decides what we track (redrawn)</figcaption>
          </figure>
        </div>

        <div className="it-gap" data-r>
          <div className="it-round"><span className="mono it-k">ROUND 2</span><span className="mono it-tag">P2 · hobby game creator, mid-30s</span></div>
          <h3 className="g-h3l mt-8">What he told us about the data</h3>
          <p className="g-body mute mt-8">Task 3 (finding a problem in the data) and a card sort of every metric on the dashboard.</p>
        </div>
        <div className="it-pair mt-40">
          <div data-r style={d(0)}><SessionVideo /></div>
          <div className="it-take" data-r style={d(1)}>
            <div className="mono it-k sky">WHAT IT MEANS FOR GAMECOVE</div>
            <p className="it-take-h">Not a blank board to build. A finished screen he can switch on, off, or add to.</p>
            <p className="it-take-p">He was fine adding charts. He just didn’t want to start from nothing.</p>
          </div>
        </div>
        <div className="it-finds mt-40">
          {FINDINGS.map((f, i) => (
            <div className="it-find" key={f.q} data-r style={d(i)}>
              <p className="q">“{f.q}”</p>
              <p className="t mono">{f.t}</p>
              <hr />
              <div className="mono it-k">SO WE</div>
              <p className="a">{f.a}</p>
            </div>
          ))}
        </div>

        <div className="it-gap" data-r>
          <div className="mono it-k">CARD SORT</div>
          <h3 className="g-h3l mt-8">Is this data really needed? He sorted all 18 metrics from the session.</h3>
        </div>
        <div className="cs-stats mt-32" data-r>
          <div><b>16</b><span>must-have</span></div>
          <div><b>2</b><span>nice to have</span></div>
          <div><b>0</b><span>not needed</span></div>
        </div>
        <div className="cs-top mt-32">
          {CS_TOP.map((c, i) => (
            <div className="cs-card" key={c.c} data-r style={d(i)}>
              <i className="cs-bar" aria-hidden="true" />
              <div className="cs-rank"><b className="mono">{c.r}</b><span className="mono">{c.c}</span></div>
              <h4 className="cs-t">{c.t}</h4>
              <p className="cs-q">“{c.q}”</p>
            </div>
          ))}
        </div>
        <div className="cs-sorted mt-32">
          <div className="cs-card" data-r>
            <div className="cs-head"><b className="mono">MUST-HAVE</b><span>“Without it I can’t decide”</span></div>
            {CS_TIERS.map(([tier, chips]) => (
              <div className="cs-tier" key={tier}>
                <div className="mono cs-tl">{tier}</div>
                <div className="cs-chips">{chips.map(([c, t]) => <Chip key={c} c={c} t={t} />)}</div>
              </div>
            ))}
          </div>
          <div className="cs-side">
            <div className="cs-card" data-r style={d(1)}>
              <div className="cs-head"><b className="mono">NICE TO HAVE</b><span>“I’d check it sometimes”</span></div>
              <div className="cs-chips col">{CS_NICE.map(([c, t]) => <Chip key={c} c={c} t={t} />)}</div>
            </div>
            <div className="cs-empty" data-r style={d(2)}>
              <div className="mono it-k dim">NOT NEEDED · UNSURE</div>
              <p>Empty. He kept every card.</p>
            </div>
          </div>
        </div>
        <div className="mt-32" data-r>
          <div className="mono it-k dim">NOT ON THE SCREEN, BUT HE WANTED IT</div>
          <div className="cs-missing mt-16">
            {CS_MISSING.map(m => <div key={m.t}><b>{m.t}</b><p>{m.p}</p></div>)}
          </div>
        </div>

        <div className="it-note it-gap" data-r>
          <div className="mono it-k dim">NOTE</div>
          <p>One participant, so this is a direction, not proof. Quotes are translated from Korean; times are from the session recording. He had done round 1, so Tasks 1 and 2 felt familiar and he didn’t notice the changes.</p>
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
          <div className="rf-k">Next steps</div>
          {[
            'Test the fixes with one more user on a real desktop screen, and compare before and after.',
            'Test with adult creators from small studios.',
            'After launch, track setup completion, AI agent use and weekly return visits.',
          ].map((t, i) => <p key={i}><span>0{i + 1}</span>{t}</p>)}
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
.gc4 .fs-sk { margin-top: 16px; }
.gc4 .fs-box { position: relative; z-index: 3; aspect-ratio: 362 / 276; }
.gc4 .fs-box img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform-origin: 0 0; will-change: transform, opacity; }
.gc4 .fs-lines { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.gc4 .fs-lines path { fill: none; stroke: #3898F8; stroke-width: 1.5; stroke-dasharray: 4 4; opacity: 0; transition: opacity .3s ease; }
.gc4 .fs .nd { transition: box-shadow .35s ease, background-color .35s ease; }
.gc4 .fs .nd.lit { box-shadow: 0 0 0 2px #B3D1FF, 0 0 24px rgba(56,152,248,.35); }
.gc4 .fs .nd.done { box-shadow: inset 0 -3px 0 #3898F8; }
/* pinned (wide, tall screens): the row fits the screen, no side scroll */
.gc4 .fs.on { height: calc(100vh + 240vh); }
.gc4 .fs.on .fs-pin { position: sticky; top: max(32px, calc(50vh - 400px)); }
.gc4 .fs.on .fs-flow { padding: 32px 40px; }
.gc4 .fs.on .fl-scroll { overflow: visible; margin-top: 16px; }
.gc4 .fs.on .fl-row { min-width: 0; }
.gc4 .fs.on .fl-row > .nd, .gc4 .fs.on .fl-row > .fl-paths { flex: 1 1 0; min-width: 0; width: auto; }
.gc4 .fs.on .fl-paths .nd { width: 100%; }
.gc4 .fs.on .fl-row .nd { padding: 12px 14px; }
.gc4 .fs.on .fs-sk { gap: 24px; }
.gc4 .fs.on .fs-box { box-shadow: inset 0 0 0 1px var(--line); }

/* test · iterate */
.gc4 .it { padding-bottom: 120px; }
.gc4 .it-head { max-width: 820px; }
.gc4 .it-gap { margin-top: 120px; }
.gc4 .it-k { font-size: 16px; line-height: 24px; font-weight: 500; letter-spacing: .08em; color: #6FB2FA; }
.gc4 .it-k.sky { color: #B3D1FF; } .gc4 .it-k.dim { color: var(--dim); }
.gc4 .it-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; }
.gc4 .it-shot img { width: 100%; aspect-ratio: 744 / 504; object-fit: cover; border: 1px solid var(--line); background: #fff; }
.gc4 .it-shot figcaption { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 16px; font-size: 16px; line-height: 24px; color: var(--mute); }
.gc4 .it-shot figcaption b { font-weight: 500; letter-spacing: .08em; color: var(--dim); }
.gc4 .it-shot figcaption b.on { color: #6FB2FA; }
.gc4 .it-round { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.gc4 .it-round .it-k { letter-spacing: .12em; }
.gc4 .it-tag { padding: 8px 16px; border: 1px solid #3898F8; background: #1A3050; font-size: 16px; line-height: 24px; color: #B3D1FF; }
.gc4 .it-vid { position: relative; height: 100%; min-height: 416px; background: #0C0C0F; border: 1px solid var(--line); overflow: hidden; }
.gc4 .it-vid button { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; width: 100%; padding: 0; border: 0; background: none; cursor: pointer; }
.gc4 .it-vid .play { position: relative; display: flex; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 50%; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.4); color: #F2F0EC; transition: transform .3s ease, background-color .3s ease; }
.gc4 .it-vid button:hover .play { transform: scale(1.06); background: rgba(255,255,255,.2); }
.gc4 .it-vid button:focus-visible { outline: 2px solid #B3D1FF; outline-offset: -4px; }
.gc4 .it-vid .lab { position: relative; font-size: 16px; line-height: 24px; color: var(--mute); }
.gc4 .it-vid iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.gc4 .it-take { display: flex; flex-direction: column; justify-content: center; gap: 16px; padding: 40px; border: 1px solid #3898F8; background: #1A3050; }
.gc4 .it-take-h { font-size: 32px; line-height: 40px; font-weight: 500; letter-spacing: -0.01em; color: var(--sand); }
.gc4 .it-take-p { font-size: 18px; line-height: 28px; color: #C9D6EA; }
.gc4 .it-finds { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
.gc4 .it-find { display: flex; flex-direction: column; gap: 16px; padding: 32px; background: var(--card); border: 1px solid var(--line); }
.gc4 .it-find .q { font-size: 20px; line-height: 28px; font-weight: 500; color: var(--sand); }
.gc4 .it-find .t { font-size: 16px; line-height: 24px; color: var(--dim); }
.gc4 .it-find hr { width: 100%; height: 1px; margin: 0; border: 0; background: var(--line); }
.gc4 .it-find .a { font-size: 18px; line-height: 28px; color: var(--mute); }
.gc4 .cs-stats { display: flex; flex-wrap: wrap; gap: 40px; }
.gc4 .cs-stats div { display: flex; align-items: baseline; gap: 8px; }
.gc4 .cs-stats b { font-size: 40px; line-height: 48px; font-weight: 700; color: var(--sand); }
.gc4 .cs-stats span { font-size: 18px; line-height: 28px; color: var(--mute); }
.gc4 .cs-top { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.gc4 .cs-card { display: flex; flex-direction: column; gap: 16px; padding: 32px; background: var(--card); border: 1px solid var(--line); }
.gc4 .cs-bar { display: block; width: 32px; height: 4px; background: #FFE299; }
.gc4 .cs-rank { display: flex; gap: 16px; font-size: 16px; line-height: 24px; }
.gc4 .cs-rank b { font-weight: 500; letter-spacing: .08em; color: #FFE299; }
.gc4 .cs-rank span { color: var(--dim); }
.gc4 .cs-t { font-size: 20px; line-height: 28px; font-weight: 500; color: var(--sand); }
.gc4 .cs-q { font-size: 18px; line-height: 28px; color: var(--mute); }
.gc4 .cs-sorted { display: grid; grid-template-columns: minmax(0, 960fr) minmax(0, 536fr); gap: 24px; align-items: start; }
.gc4 .cs-side { display: flex; flex-direction: column; gap: 24px; }
.gc4 .cs-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 16px; font-size: 16px; line-height: 24px; }
.gc4 .cs-head b { font-weight: 500; letter-spacing: .08em; color: var(--sand); }
.gc4 .cs-head span { color: var(--dim); }
.gc4 .cs-tier { display: flex; flex-direction: column; gap: 8px; }
.gc4 .cs-tl { font-size: 16px; line-height: 24px; letter-spacing: .06em; color: var(--dim); }
.gc4 .cs-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.gc4 .cs-chips.col { flex-direction: column; align-items: flex-start; }
.gc4 .cs-chip { display: inline-flex; align-items: baseline; gap: 8px; padding: 8px 16px; background: #1F1F24; border: 1px solid var(--line); font-size: 16px; line-height: 24px; color: var(--sand); }
.gc4 .cs-chip b { font-weight: 500; letter-spacing: .08em; color: var(--dim); }
.gc4 .cs-empty { display: flex; flex-direction: column; gap: 8px; padding: 32px; border: 1px dashed var(--line); }
.gc4 .cs-empty p { font-size: 18px; line-height: 28px; color: var(--mute); }
.gc4 .cs-missing { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.gc4 .cs-missing div { display: flex; flex-direction: column; gap: 8px; padding: 24px; background: #FFE299; }
.gc4 .cs-missing b { font-size: 18px; line-height: 28px; font-weight: 700; color: #1B1B1F; }
.gc4 .cs-missing p { font-size: 16px; line-height: 24px; color: #3A3524; }
.gc4 .it-note { display: flex; flex-direction: column; gap: 8px; padding: 32px; background: var(--card); border: 1px solid var(--line); }
.gc4 .it-note p { font-size: 18px; line-height: 28px; color: var(--mute); }

/* reflection: light like Final design */
.gc4 .rf { background: #FAFAF9; color: #111114; padding-top: 120px; }
.gc4 .rf .g-eyebrow { color: #3D3E44; }
.gc4 .rf .g-h2 { color: #111114; }
.gc4 .rf-top { display: grid; grid-template-columns: minmax(0, 806fr) minmax(0, 514fr); gap: 120px; align-items: start; }
.gc4 .rf-take { display: flex; flex-direction: column; gap: 16px; }
.gc4 .rf-take p { font-size: 18px; line-height: 28px; color: #3D3E44; }
.gc4 .rf-photo { width: 100%; aspect-ratio: 514 / 343; object-fit: cover; }
.gc4 .rf-k { padding-bottom: 16px; font-size: 16px; line-height: 24px; font-weight: 500; color: #6B6D76; }
.gc4 .rf-next p { display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 24px; padding: 12px 0; font-size: 22px; line-height: 32px; font-weight: 500; color: #111114; }
.gc4 .rf-next span { color: #9A9CA3; }

/* round shapes that carry meaning stay round */
.gc .gc4 .it-vid .play { border-radius: 50% !important; }

@media (max-width: 1280px) {
  .gc4 .it-finds { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gc4 .cs-sorted { grid-template-columns: minmax(0, 1fr); }
  .gc4 .rf-top { gap: 64px; }
}
@media (max-width: 1023px) {
  .gc4 .fs-intro, .gc4 .it-pair, .gc4 .cs-top, .gc4 .cs-missing, .gc4 .rf-top { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .gc4 .it-vid { min-height: 0; aspect-ratio: 16 / 9; height: auto; }
  .gc4 .it-gap { margin-top: 88px; }
}
@media (max-width: 700px) {
  .gc4 .it-finds { grid-template-columns: minmax(0, 1fr); }
  .gc4 .it-take, .gc4 .it-find, .gc4 .cs-card, .gc4 .cs-empty, .gc4 .it-note { padding: 24px; }
  .gc4 .it-take-h { font-size: 24px; line-height: 32px; }
  .gc4 .rf-next p { grid-template-columns: 32px minmax(0, 1fr); gap: 16px; font-size: 18px; line-height: 28px; }
}
@media (prefers-reduced-motion: reduce) {
  .gc4 .fs-lines path, .gc4 .fs .nd { transition: none !important; }
}
`
