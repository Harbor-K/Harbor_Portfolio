import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { SideToc, useHeadroom } from './CaseNav'
import { SiteHeaderB } from './SiteHeaderB'

/**
 * UTrada case study (v134, Harbor Nov 16) — built from Harbor's Figma "UTrada_v.3 · Design (Trust Bank structure)"
 * (file 44기 김지현 4차 랜딩페이지, node 1698:443). Copy is the frame's, word for word. Square brackets in the copy
 * ("[Harbor to fill]", "[N]", "[please confirm]", "[ ]") are Harbor's open items: they show in grey italics until she
 * replaces them.
 * Colours (Figma variables): deep ink #000D10, cool ash #8E8E95, clay ember #BC7155, line/grey box #D5D3D4,
 * Process lilac #F5E9FC, Reflection night #0F0F1C. Type: the site's Roboto (index.css) on Figma's sizes — 64/64 title,
 * 40/48 section titles, 24/32 row titles, 18/28 body, 16/24 labels; nothing under 16px. Square corners everywhere.
 * Layout: the 1440 column of the frame (240px sides at 1920), sections 120px top and bottom, 96px between blocks.
 *
 * Opening (like Trust Bank and GameCove): the page opens on Harbor's intro film (UTrada_intro_v7, 21s, re-encoded to
 * 1600×900, 2.9 MB) filling the screen. The screen stays dark until the film actually plays; 5 seconds later it moves
 * on its own into its place under the headline (1440×810), easing in and out. Scrolling, swiping or a key press starts
 * the move straight away; the page can't scroll until the film has settled. The header and the process list stay hidden
 * until then. After that the film keeps looping muted; the sound, play and progress controls show on hover.
 * Reduced motion: no intro, the film simply sits in its place.
 * Assets: Harbor-K/harbor-pf assets/utrada/v3/ (logo, CRM sign-in capture and the 3 screen captures exported from the
 * Figma frame at 2x).
 */

const A = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/utrada/v3/'
const IMG = {
  logo: A + 'logo.png',
  video: A + 'intro.mp4',
  poster: A + 'intro-poster.jpg',
  crm: A + 'crm-signin.webp',
  regulations: A + 'screen-regulations.webp',
  cookie: A + 'screen-cookie.webp',
  accounts: A + 'screen-accounts.webp',
}
const NEXT = { name: 'ETO Markets', href: '#/eto-markets' }
export const U3_CHAPTERS = ['Overview', 'Process', 'Discover', 'Define', 'Develop', 'Deliver', 'Test', 'Reflection']

const HOLD_MS = 5000
const ANIM_MS = 1000
const WAIT_MS = 2500
const DARK = '#0B0B0D'

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2)
const fmt = (t: number) => (!isFinite(t) ? '0:00' : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`)

/** copy with Harbor's open items: every [ … ] shows in grey italics */
function T({ children }: { children: string }) {
  const parts = children.split(/(\[[^\]]*\])/g)
  return <>{parts.map((p, i) => (p.startsWith('[') && p.endsWith(']') ? <span key={i} className="tbd">{p}</span> : p))}</>
}

function Label({ children }: { children: string }) {
  return <div className="u3-label"><i aria-hidden="true" />{children}</div>
}

/* ---------- intro film with sound controls ---------- */

function Film({ quiet, introRef }: { quiet: boolean; introRef: React.RefObject<HTMLVideoElement> }) {
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
    <div className="u3-film" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setFocus(true)} onBlurCapture={() => setFocus(false)}>
      <video ref={introRef} src={IMG.video} poster={IMG.poster} muted loop playsInline preload="auto"
        aria-label="UTrada intro film: a trader at night wonders whether a new broker with no reviews is safe, checks the regulations page, the legal documents, the trading accounts and the help chat, then signs up. Ends on: UTrada, trust before the first deposit."
        onClick={togglePlay} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onTimeUpdate={e => setTime(e.currentTarget.currentTime)} onLoadedMetadata={e => setDuration(e.currentTarget.duration)} />
      <div className={'u3-ctl' + (show ? ' show' : '')} aria-hidden={quiet || undefined}>
        <input type="range" min={0} max={duration || 0} step={0.01} value={time} onChange={e => seek(Number(e.target.value))} tabIndex={tab}
          aria-label="Video progress" className="u3-range wide" style={{ '--fill': `${pct}%` } as React.CSSProperties} />
        <div className="u3-ctl-row">
          <button type="button" onClick={togglePlay} tabIndex={tab} aria-label={playing ? 'Pause' : 'Play'} className="u3-btn">
            {playing
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" /></svg>}
          </button>
          <span className="u3-time">{fmt(time)} / {fmt(duration)}</span>
          <div className="u3-vol">
            <button type="button" onClick={toggleMute} tabIndex={tab} aria-label={muted ? 'Turn sound on' : 'Mute'} className="u3-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" />
                {shownVolume === 0
                  ? <><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></>
                  : <><path d="M15.5 8.5a5 5 0 0 1 0 7" />{shownVolume > 0.5 && <path d="M19 5a10 10 0 0 1 0 14" />}</>}
              </svg>
            </button>
            <input type="range" min={0} max={1} step={0.01} value={shownVolume} onChange={e => changeVolume(Number(e.target.value))} tabIndex={tab}
              aria-label="Volume" className="u3-range vol" style={{ '--fill': `${shownVolume * 100}%` } as React.CSSProperties} />
          </div>
        </div>
      </div>
    </div>
  )
}

/** the full-screen opening: the film's box starts over the whole screen and eases into its own slot */
function useIntro(on: boolean, slot: React.RefObject<HTMLDivElement>, box: React.RefObject<HTMLDivElement>, media: React.RefObject<HTMLVideoElement>, onDone: () => void) {
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

/* ---------- content (Figma 1698:443, word for word) ---------- */

const OVERVIEW = [
  { t: 'Challenge', b: 'UTrada was a brand-new online trading company with no history and no reviews. New visitors had no easy way to check if their money would be safe.' },
  { t: 'Business objective', b: 'Turn first-time visitors into customers who confirm their ID and add money. To do that, people had to trust UTrada before signing up.' },
  { t: 'Solution', b: 'I found the 5 moments when people hesitate. Each one got a screen that answers its question right there.' },
]
const IMPACT = [
  { n: '5', c: 'hesitation moments, one screen each' },
  { n: '4', c: 'fixes I shipped after launch (Notion log)' },
  { n: '[ ]', c: '5-user test — add results after testing' },
]
const PROCESS = [
  { k: 'DISCOVER', box: '01 · Look closely', items: ['Live-site audit', 'Broker basics', 'Rules by market', 'Other brokers’ pages'] },
  { k: 'DEFINE', box: '02 · One problem + HMW', items: ['5 hesitation moments', 'Business vs trader goals'] },
  { k: 'DEVELOP', box: '03 · 5 screens', items: ['Regulations', 'Cookie consent', 'Broker check', 'Accounts', 'Help & Support'] },
  { k: 'DELIVER', box: '04 · Ship, fix, test', items: ['4 post-launch fixes', 'Concept: which company am I signing with?', '5-user test plan'] },
]
const MARKETS: [string, string, string, boolean?][] = [
  ['Europe (ESMA)', '30× your money', 'Must show % of accounts that lose money'],
  ['UK (FCA)', '30× your money', '—'],
  ['Australia (ASIC)', '30× your money', '—'],
  ['Mauritius (UTrada)', '500× your money', 'UTrada’s own offer', true],
]
const MOMENTS = [
  { k: 'LOOKING AROUND', q: '“Who runs this?”' },
  { k: 'PRIVACY', q: '“What happens to my data?”' },
  { k: 'CHECKING', q: '“Is it really licensed?”' },
  { k: 'SIGNING UP', q: '“Which account is right for me?”' },
  { k: 'GETTING HELP', q: '“Who helps if something goes wrong?”' },
]
const SCREENS: { t: string; img?: string; alt?: string; why: string; decided: string; wrong: string }[] = [
  { t: '① Regulations page', img: IMG.regulations, alt: 'UTrada Regulations page: Financial Services Commission, Mauritius, with the FSC logo, what the FSC regulates and UTrada Global Limited’s licence number GB24204031; below it the Labuan Financial Services Authority',
    why: '[Harbor to fill]', decided: '[Harbor to fill]', wrong: '[Harbor to fill]' },
  { t: '② Cookie consent', img: IMG.cookie, alt: 'UTrada cookie window “We respect your privacy” over the dimmed Regulations page, with Reject All and Accept All side by side',
    why: 'People worry about being tracked.', decided: '“Reject all” is as easy to click as “Accept all”, so nobody feels tricked.', wrong: '[please confirm]' },
  { t: '④ Account comparison', img: IMG.accounts, alt: 'UTrada trading accounts compared side by side: Ultra from 0.0 pips, Premium from 1.2 pips and Standard from 1.8 pips, each with commission, minimum deposit, lot size, leverage, execution type, fees, stop-out level and server location',
    why: '[Harbor to fill]', decided: '[Harbor to fill]', wrong: '[Harbor to fill]' },
  { t: '⑤ Help & Support', why: '[Harbor to fill]', decided: '[Harbor to fill]', wrong: '[Harbor to fill]' },
]
const LOG: [string, string][] = [
  ['Jul 2024', 'Login / Register'],
  ['Sep 2024', 'About us · Legal & partners · Regulations'],
  ['Oct 2024', 'Cookie widget · Sub-navigation · Help & Support'],
  ['Nov 2024', 'Broker check · Cookie fix · Help fix'],
  ['Mar 2025', 'Account page fix'],
  ['Oct 2025', 'Legal documents fix · Contact button'],
]
const STEPS = [
  'Pick your country',
  'See which company you’ll sign with, and how you’re protected',
  'Add up to €2,000 before your ID check is done',
  'Finish the ID check within 15 days — clear “waiting” and “rejected” screens',
]
const TASKS = [
  'Find who regulates UTrada and its licence number.',
  'Find the name of the company you’d actually sign a contract with.',
  'Find where to get help before adding money.',
]

/* ---------- page ---------- */

export function UTradaV3() {
  const [introOn] = useState(() => !reducedMotion())
  const [intro, setIntro] = useState(introOn)
  const away = useHeadroom()
  const slot = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const media = useRef<HTMLVideoElement>(null)
  useIntro(introOn, slot, box, media, () => setIntro(false))

  // soft reveal as blocks scroll in
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.u3 [data-reveal]'))
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [])

  return (
    <div className={'hb ut u3' + (intro ? ' intro-on' : '')}>
      <style>{CSS + U3_CSS}</style>
      <SiteHeaderB mode="light" hidden={intro} away={away} />
      <SideToc chapters={U3_CHAPTERS} scope=".u3" hidden={intro} />

      <main id="top">
        {/* Hero */}
        <section className="u3-hero" data-chapter="UTrada" aria-label="UTrada">
          <div className="u3-w">
            <img className="u3-logo" src={IMG.logo} alt="UTrada" width={160} height={38} />
            <p className="u3-kicker">UTrada and regulation</p>
            <h1 className="u3-h1">5 moments to check if your<br />broker is safe</h1>
            <p className="u3-sub">How UTrada, a brand-new broker with no reviews, earned trust before the first deposit<br /><span>UTrada Global · UX case study</span></p>
            <div className="u3-slot" ref={slot}>
              <div className="u3-box" ref={box}><Film quiet={intro} introRef={media} /></div>
            </div>
            <div className="u3-meta">
              <div><div className="k">TIMELINE</div><p>Jul 2024 – Oct 2025</p></div>
              <div><div className="k">TEAM &amp; ROLE</div><p>I led Product Designer<br /><T>Team: [PM · developers · compliance]</T></p></div>
              <div><div className="k">INDUSTRY</div><p>Fintech · Online trading · Web</p></div>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="u3-sec" data-chapter="Overview">
          <div className="u3-w u3-stack56">
            <Label>OVERVIEW</Label>
            {OVERVIEW.map(r => (
              <div className="u3-row" key={r.t} data-reveal><h2 className="u3-rt">{r.t}</h2><p className="u3-body">{r.b}</p></div>
            ))}
            <div className="u3-row" data-reveal>
              <h2 className="u3-rt">Impact</h2>
              <div className="u3-stats">
                {IMPACT.map(s => <div key={s.c}><div className="n"><T>{s.n}</T></div><p>{s.c}</p></div>)}
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="u3-sec u3-lilac" data-chapter="Process">
          <div className="u3-w">
            <Label>PROCESS</Label>
            <h2 className="u3-h2 mt48">From problem to solution</h2>
            <div className="u3-proc mt48" data-reveal>
              {PROCESS.map((p, i) => (
                <React.Fragment key={p.k}>
                  {i > 0 && <span className="u3-arrow" aria-hidden="true">→</span>}
                  <div className="u3-pcol">
                    <div className="k">{p.k}</div>
                    <div className="box">{p.box}</div>
                    <ul>{p.items.map(x => <li key={x}>· {x}</li>)}</ul>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* Discover */}
        <section className="u3-sec" data-chapter="Discover">
          <div className="u3-w">
            <Label>DISCOVER</Label>
            <div className="u3-blocks">
              <div className="u3-block" data-reveal>
                <div className="u3-text">
                  <h2 className="u3-h2">What a broker is<br />You trust it with your money</h2>
                  <p className="u3-body">A broker is a company that lets you trade online. You open an account, add money, and use its app to guess if prices — like gold or the US dollar — will go up or down.</p>
                  <p className="u3-body">At UTrada you don’t buy the gold itself. You make a deal with the company about its price: if the price moves your way, the company pays you the difference. So you have to trust the company — and regulation is how outsiders check it.</p>
                </div>
                <div className="u3-diagram" role="img" aria-label="Diagram: a regulator gives UTrada a licence and keeps watching it. The trader adds money and places trades with UTrada, which holds the money and runs the app; prices come from the market (banks). You trust the company with your money — regulation is how you check it.">
                  <div className="node em reg"><b>Regulator</b><span>gives a licence, keeps watching</span></div>
                  <div className="watch">↓ watches</div>
                  <div className="flow">
                    <div className="node"><b>Trader</b><span>adds money, places trades</span></div>
                    <span className="ar">→</span>
                    <div className="node em"><b>UTrada</b><span>holds the money, runs the app</span></div>
                    <span className="ar">→</span>
                    <div className="node"><b>Market</b><span>prices from banks</span></div>
                  </div>
                  <p className="cap">You trust the company with your money — regulation is how you check it.</p>
                </div>
              </div>

              <div className="u3-block" data-reveal>
                <div className="u3-text">
                  <h2 className="u3-h2">What the company faced<br />A new name nobody knew</h2>
                  <p className="u3-body">UTrada was brand new. No history, no customer reviews.</p>
                  <p className="u3-body">It was run by two companies in two countries (Mauritius and St Vincent), and each follows different rules. To sign up, people had to leave the main website and go to a second site.</p>
                </div>
                <figure className="u3-img crm"><img src={IMG.crm} alt="UTrada CRM sign-in page, a separate site: “Welcome to UTrada CRM” with Sign In and Start Trading tabs, email and password fields, beside the line “Your Trading Journey Starts with UTrada”" loading="lazy" /></figure>
              </div>

              <div className="u3-block" data-reveal>
                <div className="u3-text">
                  <h2 className="u3-h2">What the whole industry faces<br />It’s hard to tell who to trust</h2>
                  <p className="u3-body">Fake copycat firms copy real company names and licence numbers. In the UK, people reported losing over £78 million to them in 2020 (FCA).</p>
                  <p className="u3-body">So traders check safety and regulation first when they pick a company (FXStreet study, 2024). And regulators are making sign-up stricter: from July 2025, Cyprus caps deposits at €2,000 until your ID is checked.</p>
                </div>
                <div className="u3-table-wrap">
                  <table className="u3-table">
                    <thead><tr><th>Market</th><th>Max trading power</th><th>Note</th></tr></thead>
                    <tbody>
                      {MARKETS.map(([m, p, n, hi]) => <tr key={m}><td>{m}</td><td className={'b' + (hi ? ' hi' : '')}>{p}</td><td>{n}</td></tr>)}
                    </tbody>
                  </table>
                  <p className="u3-src">Sources: UK FCA (2021) · FXStreet via Finance Magnates (2024) · CySEC via Finance Magnates (2025) · ESMA (2018) · utrada.com</p>
                </div>
              </div>

              <div className="u3-insight" data-reveal>Insight — What builds trust has to change with where you live and which company you sign with.</div>
            </div>
          </div>
        </section>

        {/* Define */}
        <section className="u3-sec" data-chapter="Define">
          <div className="u3-w">
            <Label>DEFINE</Label>
            <div className="u3-blocks">
              <div data-reveal>
                <h2 className="u3-h2">One problem</h2>
                <p className="u3-hmw">How might we help a first-time visitor check that UTrada is safe, right at the moment they feel unsure — without making sign-up slower?</p>
              </div>
              <div className="u3-goals" data-reveal>
                <div><div className="k">FOR THE BUSINESS</div><p>More visitors become customers who confirm their ID and add money.</p></div>
                <div><div className="k">FOR THE TRADER</div><p>They can check the facts for themselves before handing over money.</p></div>
              </div>
              <div data-reveal>
                <h2 className="u3-h2">5 moments when people hesitate</h2>
                <ol className="u3-moments">
                  {MOMENTS.map((m, i) => <li key={m.k}><span className="n">0{i + 1}</span><span className="k">{m.k}</span><b>{m.q}</b></li>)}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Develop */}
        <section className="u3-sec" data-chapter="Develop">
          <div className="u3-w">
            <Label>DEVELOP</Label>
            <div className="u3-blocks">
              <div data-reveal>
                <h2 className="u3-h2">One screen per moment</h2>
                <p className="u3-body w760 mt24">Each screen answers one worry. For each, I show why, what I decided, and what happens when things go wrong.</p>
              </div>
              {SCREENS.map(s => (
                <div className="u3-screen" key={s.t} data-reveal>
                  <figure className="u3-img shot">{s.img ? <img src={s.img} alt={s.alt} loading="lazy" /> : <span className="tbd">[Screen to add]</span>}</figure>
                  <div className="u3-why">
                    <h3>{s.t}</h3>
                    <div><div className="k">WHY</div><p><T>{s.why}</T></p></div>
                    <div><div className="k">WHAT I DECIDED</div><p><T>{s.decided}</T></p></div>
                    <div><div className="k">WHEN THINGS GO WRONG</div><p><T>{s.wrong}</T></p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deliver */}
        <section className="u3-sec" data-chapter="Deliver">
          <div className="u3-w">
            <Label>DELIVER</Label>
            <div className="u3-blocks">
              <div className="u3-block" data-reveal>
                <div className="u3-text">
                  <h2 className="u3-h2">After launch<br />I kept fixing what didn’t match</h2>
                  <p className="u3-body">I kept improving the site after it went live, from July 2024 to October 2025 — for example the account page (March 2025) and the legal documents (October 2025).</p>
                  <p className="u3-body"><T>Checking the live site again, I found [N] places where the information doesn’t match, like the minimum deposit shown differently on two pages. [please confirm]</T></p>
                </div>
                <ol className="u3-log" aria-label="What I shipped after launch (Notion log)">
                  {LOG.map(([d, t]) => <li key={d}><span className="d">{d}</span><span>{t}</span></li>)}
                </ol>
              </div>
              <div className="u3-concept" data-reveal>
                <span className="u3-badge">CONCEPT · NOT BUILT</span>
                <h2 className="u3-h2">Which company am I signing with?</h2>
                <p className="u3-body">An idea for a sign-up flow that changes with the country you live in.</p>
                <ol className="u3-steps">
                  {STEPS.map((s, i) => (
                    <React.Fragment key={s}>
                      {i > 0 && <li className="ar" aria-hidden="true">→</li>}
                      <li className="step"><span className="n">{i + 1}</span><p>{s}</p></li>
                    </React.Fragment>
                  ))}
                </ol>
                <p className="u3-src">Why: Cyprus’s financial regulator (CySEC) added these limits in July 2025. UTrada doesn’t have a Cyprus licence, so this shows how the flow would work if it did.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Test */}
        <section className="u3-sec" data-chapter="Test">
          <div className="u3-w">
            <Label>TEST</Label>
            <div className="u3-blocks">
              <div data-reveal>
                <h2 className="u3-h2">How I’ll test it<br />5 people, 3 tasks</h2>
                <p className="u3-body w760 mt24">On the live website. I’ll note who finished each task, how sure they felt (1 to 5), and what they said out loud.</p>
              </div>
              <div className="u3-tasks" data-reveal>
                {TASKS.map((t, i) => (
                  <div key={t}><div className="n">TASK {i + 1}</div><p>{t}</p><p className="res"><T>Result: [ ] of 5 · quote: [ ]</T></p></div>
                ))}
              </div>
              <div className="u3-slotbox" data-reveal><span className="tbd">CHART SLOT · Clicks from home page to licence number — UTrada vs other brokers</span></div>
            </div>
          </div>
        </section>

        {/* Reflection */}
        <section className="u3-sec u3-night" data-chapter="Reflection">
          <div className="u3-w">
            <Label>REFLECTION</Label>
            <div className="u3-row mt64" data-reveal>
              <h2 className="u3-rt">Takeaways</h2>
              <ol className="u3-list">
                <li><span className="n">01</span><span>What I couldn’t measure: I didn’t have sign-up data, so I can’t say how many more people signed up.</span></li>
                <li><span className="n">02</span><span><T>Biggest lesson: [one sentence — Harbor to write]</T></span></li>
              </ol>
            </div>
            <div className="u3-row mt64" data-reveal>
              <h2 className="u3-rt">Next steps</h2>
              <ol className="u3-list">
                <li><span className="n">01</span><span>Run the 5-person test on the live site and add the results.</span></li>
                <li><span className="n">02</span><span>Track how many people go from sign-up → ID check → first deposit.</span></li>
              </ol>
            </div>
          </div>
        </section>

        <section className="u3-next" id="next">
          <a className="u3-w next-card" href={NEXT.href}>
            <span className="eyebrow">Next case study</span>
            <span className="next-name">{NEXT.name} <span className="go">→</span></span>
          </a>
        </section>
      </main>
    </div>
  )
}

const U3_CSS = `
.u3 { --ink: #000D10; --ash: #8E8E95; --clay: #BC7155; --grey: #D5D3D4; --lilac: #F5E9FC; --night: #0F0F1C; --ease3: cubic-bezier(.22,1,.36,1);
  background: #FFFFFF; color: var(--ink); }
.u3 .u3-w { width: min(1440px, calc(100vw - 64px)); margin: 0 auto; }
.u3 h1, .u3 h2, .u3 h3, .u3 p, .u3 figure, .u3 ol, .u3 ul { margin: 0; padding: 0; }
.u3 ol, .u3 ul { list-style: none; }
.u3 .tbd { color: var(--ash); font-style: italic; }
.u3 .mt24 { margin-top: 24px; } .u3 .mt48 { margin-top: 48px; } .u3 .mt64 { margin-top: 64px; } .u3 .w760 { max-width: 760px; }

/* type */
.u3 .u3-label { display: flex; align-items: center; gap: 8px; font-size: 16px; line-height: 24px; color: var(--ash); }
.u3 .u3-label i { width: 12px; height: 12px; background: var(--ash); }
.u3 .u3-h2 { font-size: 40px; font-weight: 700; line-height: 48px; color: var(--ink); }
.u3 .u3-rt { flex: none; width: 370px; font-size: 24px; font-weight: 700; line-height: 32px; color: var(--ink); }
.u3 .u3-body { font-size: 18px; line-height: 28px; color: var(--ink); }
.u3 .u3-src { font-size: 16px; line-height: 24px; color: var(--ash); }
.u3 .k { font-size: 16px; line-height: 24px; color: var(--ash); }

/* hero */
.u3 .u3-hero { padding: 120px 0 120px; }
.u3 .u3-logo { display: block; width: 160px; height: auto; }
.u3 .u3-kicker { margin-top: 40px; font-size: 24px; font-weight: 700; line-height: 32px; }
.u3 .u3-h1 { margin-top: 40px; max-width: 960px; font-size: 64px; font-weight: 700; line-height: 64px; letter-spacing: -0.01em; }
.u3 .u3-sub { margin-top: 40px; max-width: 760px; font-size: 18px; line-height: 28px; }
.u3 .u3-sub span { color: var(--ash); }
.u3 .u3-slot { position: relative; margin-top: 40px; aspect-ratio: 16 / 9; }
.u3 .u3-box { position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 40; overflow: hidden; background: ${DARK}; }
.u3 .u3-film { position: relative; width: 100%; height: 100%; }
.u3 .u3-film video { display: block; width: 100%; height: 100%; object-fit: cover; cursor: pointer; }
.u3 .u3-ctl { position: absolute; left: 0; right: 0; bottom: 0; padding: 48px 24px 16px; background: linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.45)); opacity: 0; pointer-events: none; transition: opacity .3s; }
.u3 .u3-ctl.show { opacity: 1; pointer-events: auto; }
.u3 .u3-ctl-row { display: flex; align-items: center; gap: 16px; margin-top: 8px; color: #FFFFFF; }
.u3 .u3-btn { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; padding: 0; background: none; border: 0; color: #FFFFFF; cursor: pointer; }
.u3 .u3-btn:hover { background: rgba(255,255,255,.15); }
.u3 .u3-btn:focus-visible { outline: 2px solid #FFFFFF; outline-offset: 2px; }
.u3 .u3-time { font-size: 16px; font-variant-numeric: tabular-nums; }
.u3 .u3-vol { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.u3 .u3-range { -webkit-appearance: none; appearance: none; display: block; height: 3px; margin: 0; cursor: pointer; background: linear-gradient(90deg, #fff var(--fill, 0%), rgba(255,255,255,.35) var(--fill, 0%)); }
.u3 .u3-range.wide { width: 100%; } .u3 .u3-range.vol { width: 96px; }
.u3 .u3-range::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; background: #fff; border: 0; }
.u3 .u3-range::-moz-range-thumb { width: 12px; height: 12px; background: #fff; border: 0; }
.u3.intro-on .u3-ctl { visibility: hidden; }
.u3 .u3-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 48px; margin-top: 40px; }
.u3 .u3-meta p { margin-top: 8px; font-size: 18px; line-height: 28px; }

/* sections */
.u3 .u3-sec { padding: 120px 0; }
.u3 .u3-stack56 { display: flex; flex-direction: column; gap: 56px; }
.u3 .u3-row { display: flex; align-items: flex-start; }
.u3 .u3-row > .u3-body, .u3 .u3-row > .u3-stats, .u3 .u3-row > .u3-list { flex: 1; min-width: 0; }
.u3 .u3-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 48px; }
.u3 .u3-stats .n { font-size: 56px; line-height: 64px; color: var(--clay); }
.u3 .u3-stats .n .tbd { font-style: normal; color: var(--clay); opacity: .6; }
.u3 .u3-stats p { margin-top: 8px; font-size: 16px; line-height: 24px; color: var(--ash); }
.u3 .u3-blocks { display: flex; flex-direction: column; gap: 96px; margin-top: 96px; }

/* process */
.u3 .u3-lilac { background: var(--lilac); }
.u3 .u3-proc { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr); gap: 24px; align-items: start; padding: 64px; background: var(--grey); }
.u3 .u3-arrow { font-size: 24px; line-height: 32px; color: var(--ash); }
.u3 .u3-pcol .k { font-weight: 700; }
.u3 .u3-pcol .box { margin-top: 16px; padding: 16px; background: #FFFFFF; font-size: 18px; font-weight: 700; line-height: 28px; }
.u3 .u3-pcol ul { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; font-size: 16px; line-height: 24px; }

/* discover / deliver: text left 640, visual right 736 */
.u3 .u3-block { display: grid; grid-template-columns: minmax(0, 640px) minmax(0, 736px); justify-content: space-between; gap: 64px; align-items: start; }
.u3 .u3-text { display: flex; flex-direction: column; gap: 24px; }
.u3 .u3-text .u3-body + .u3-body { margin-top: 0; }
.u3 .u3-diagram { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px 32px; background: var(--grey); text-align: center; }
.u3 .u3-diagram .node { display: flex; flex-direction: column; gap: 4px; padding: 16px; background: #FFFFFF; border: 1px solid var(--grey); }
.u3 .u3-diagram .node.em { border: 2px solid var(--clay); }
.u3 .u3-diagram .node.reg { width: 276px; }
.u3 .u3-diagram .node b { font-size: 18px; line-height: 28px; }
.u3 .u3-diagram .node span { font-size: 16px; line-height: 24px; color: var(--ash); }
.u3 .u3-diagram .watch { font-size: 16px; line-height: 24px; color: var(--clay); }
.u3 .u3-diagram .flow { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr); gap: 12px; align-items: center; width: 100%; }
.u3 .u3-diagram .ar { font-size: 24px; line-height: 32px; color: var(--ash); }
.u3 .u3-diagram .cap { font-size: 16px; line-height: 24px; color: var(--ash); }
.u3 .u3-img { overflow: hidden; background: var(--grey); }
.u3 .u3-img img { display: block; width: 100%; height: 100%; object-fit: cover; }
.u3 .u3-img.crm { aspect-ratio: 736 / 394; }
.u3 .u3-table { width: 100%; border-collapse: collapse; }
.u3 .u3-table th { padding: 16px 16px 16px 0; text-align: left; font-size: 16px; font-weight: 700; line-height: 28px; color: var(--ash); border-bottom: 1px solid var(--grey); }
.u3 .u3-table td { padding: 16px 16px 16px 0; font-size: 18px; line-height: 28px; vertical-align: top; border-bottom: 1px solid var(--grey); width: 33.33%; }
.u3 .u3-table td.b { font-weight: 700; } .u3 .u3-table td.hi { color: var(--clay); }
.u3 .u3-table-wrap .u3-src { margin-top: 8px; }
.u3 .u3-insight { padding: 32px 40px; background: var(--grey); border-left: 4px solid var(--clay); font-size: 24px; font-weight: 700; line-height: 32px; }

/* define */
.u3 .u3-hmw { margin-top: 24px; max-width: 1200px; font-size: 32px; line-height: 44px; }
.u3 .u3-goals { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.u3 .u3-goals > div, .u3 .u3-moments li, .u3 .u3-tasks > div { border: 1px solid var(--grey); }
.u3 .u3-goals > div { padding: 32px; }
.u3 .u3-goals p { margin-top: 8px; font-size: 18px; line-height: 28px; }
.u3 .u3-moments { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; margin-top: 32px; align-items: start; }
.u3 .u3-moments li { display: flex; flex-direction: column; gap: 16px; padding: 24px; }
.u3 .u3-moments .n { font-size: 16px; font-weight: 700; line-height: 24px; color: var(--clay); }
.u3 .u3-moments .k { font-size: 16px; line-height: 24px; color: var(--ash); }
.u3 .u3-moments b { font-size: 18px; line-height: 28px; }

/* develop */
.u3 .u3-screen { display: grid; grid-template-columns: minmax(0, 896px) minmax(0, 1fr); gap: 64px; align-items: start; }
.u3 .u3-img.shot { aspect-ratio: 896 / 480; display: flex; align-items: center; justify-content: center; }
.u3 .u3-img.shot .tbd { font-size: 16px; }
.u3 .u3-why { display: flex; flex-direction: column; gap: 24px; }
.u3 .u3-why h3 { font-size: 24px; font-weight: 700; line-height: 32px; }
.u3 .u3-why p { margin-top: 8px; font-size: 18px; line-height: 28px; }

/* deliver */
.u3 .u3-log li { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 24px; padding: 16px 0; border-bottom: 1px solid var(--grey); font-size: 18px; line-height: 28px; }
.u3 .u3-log .d { font-size: 16px; font-weight: 700; line-height: 28px; color: var(--clay); }
.u3 .u3-concept { display: flex; flex-direction: column; align-items: flex-start; gap: 32px; padding: 64px; background: var(--grey); }
.u3 .u3-badge { padding: 8px 16px; border: 1px solid var(--clay); font-size: 16px; font-weight: 700; line-height: 24px; color: var(--clay); }
.u3 .u3-concept .u3-badge + .u3-h2 { margin-top: 0; }
.u3 .u3-steps { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr); gap: 16px; align-items: center; width: 100%; }
.u3 .u3-steps .ar { font-size: 24px; line-height: 32px; color: var(--ash); }
.u3 .u3-steps .step { display: flex; flex-direction: column; gap: 8px; padding: 24px; background: #FFFFFF; }
.u3 .u3-steps .n { font-size: 16px; font-weight: 700; line-height: 24px; color: var(--clay); }
.u3 .u3-steps p { font-size: 18px; line-height: 28px; }

/* test */
.u3 .u3-tasks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; align-items: start; }
.u3 .u3-tasks > div { display: flex; flex-direction: column; gap: 8px; padding: 32px; }
.u3 .u3-tasks .n { font-size: 16px; font-weight: 700; line-height: 24px; color: var(--clay); }
.u3 .u3-tasks p { font-size: 18px; line-height: 28px; }
.u3 .u3-tasks p.res { font-size: 16px; line-height: 24px; color: var(--ash); }
.u3 .u3-slotbox { display: flex; align-items: center; justify-content: center; height: 240px; padding: 24px; background: var(--grey); text-align: center; font-size: 16px; line-height: 24px; }

/* reflection */
.u3 .u3-night { background: var(--night); color: #FFFFFF; }
.u3 .u3-night .u3-rt { color: #FFFFFF; }
.u3 .u3-list { display: flex; flex-direction: column; gap: 24px; }
.u3 .u3-list li { display: flex; gap: 24px; font-size: 18px; line-height: 28px; color: #FFFFFF; }
.u3 .u3-list .n { flex: none; font-weight: 500; color: var(--clay); }
.u3 .u3-night .tbd { color: #9C9CA6; }

/* next case study */
.u3 .u3-next { background: var(--off, #F5F5F2); }
.u3 .u3-next .next-card { display: flex; flex-direction: column; gap: 16px; padding: 140px 0; color: var(--ink); text-decoration: none; }
.u3 .u3-next .next-name { font-size: clamp(56px, 6vw, 112px); font-weight: 300; letter-spacing: -0.04em; line-height: 1; transition: transform .3s ease-out; }
.u3 .u3-next .next-card:hover .next-name { transform: translateX(8px); }

/* square corners everywhere */
.u3 *, .u3 *::before, .u3 *::after { border-radius: 0 !important; }

@media (max-width: 1280px) {
  .u3 .u3-rt { width: 280px; }
  .u3 .u3-proc { padding: 40px; gap: 16px; }
  .u3 .u3-screen { grid-template-columns: minmax(0, 1fr) minmax(0, 360px); gap: 40px; }
  .u3 .u3-moments { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 1023px) {
  .u3 .u3-block, .u3 .u3-screen { grid-template-columns: minmax(0, 1fr); gap: 40px; }
  .u3 .u3-proc, .u3 .u3-steps { grid-template-columns: minmax(0, 1fr); }
  .u3 .u3-arrow, .u3 .u3-steps .ar { transform: rotate(90deg); justify-self: start; }
  .u3 .u3-row { flex-direction: column; gap: 16px; }
  .u3 .u3-rt { width: auto; }
  .u3 .u3-goals, .u3 .u3-tasks { grid-template-columns: minmax(0, 1fr); }
  .u3 .u3-moments { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 700px) {
  .u3 .u3-w { width: calc(100vw - 40px); }
  .u3 .u3-hero { padding: 104px 0 88px; }
  .u3 .u3-h1 { font-size: 40px; line-height: 48px; }
  .u3 .u3-kicker { font-size: 20px; line-height: 28px; }
  .u3 .u3-sec { padding: 88px 0; }
  .u3 .u3-h2 { font-size: 32px; line-height: 40px; }
  .u3 .u3-hmw { font-size: 24px; line-height: 32px; }
  .u3 .u3-meta, .u3 .u3-stats { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .u3 .u3-blocks { gap: 64px; margin-top: 64px; }
  .u3 .u3-concept { padding: 32px 24px; }
  .u3 .u3-proc { padding: 24px; }
  .u3 .u3-diagram { padding: 24px 16px; }
  .u3 .u3-diagram .flow { grid-template-columns: minmax(0, 1fr); }
  .u3 .u3-diagram .flow .ar { transform: rotate(90deg); }
  .u3 .u3-diagram .node.reg { width: 100%; }
  .u3 .u3-moments { grid-template-columns: minmax(0, 1fr); }
  .u3 .u3-table-wrap { overflow-x: auto; }
  .u3 .u3-table { min-width: 560px; }
  .u3 .u3-insight { padding: 24px; font-size: 20px; line-height: 28px; }
  .u3 .u3-list li { gap: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .u3 [data-reveal] { opacity: 1 !important; transform: none !important; transition: none !important; }
}
`
