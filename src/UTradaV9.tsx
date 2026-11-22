import React, { useEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { SideToc, useHeadroom } from './CaseNav'
import { SiteHeaderB } from './SiteHeaderB'
import { CaseFilm, useCaseIntro } from './CaseFilm'

/**
 * UTrada case study v9 (Nov 21, Harbor: "이 디자인으로 수정해줘, 인터렉션도 좀 넣고").
 * Built from Harbor's Figma "UTrada_v.9 · Persuasive design + trading concept" (file 9eRSsfAhsJk0OmvJdrxZ6E,
 * node 2133:16974). Copy is the frame's, word for word. 1920 frame → the site's 1440 column; sections 160px top and
 * bottom; Roboto on the frame's sizes; square corners except the frame's round pills, marks and dots.
 * Colours (Figma): ink #000D10, grey #66666E, purple #8A2BE3, deep #330099, soft #F6F5FA, night #13121A / #0D0A17.
 *
 * Sections: Hero (film) · Overview · Process (4 rising steps) · Discover (broker network, 2024 card, three research
 * tiles, 4-broker check) · Define (one board: persona, HMW, trust chart, 3 principles) · Develop (3 screens, zigzag) ·
 * Documentation (3 handover docs) · Deliver (release volume) · Test (stakeholder check, Fogg plan) · Takeaways.
 *
 * Interactions:
 * - Hero: the opening film fills the screen, then settles under the headline (CaseFilm.tsx; skipped on phones).
 * - Overview: the three Impact numbers are static.
 * - Process: Figma's motion (2133:17058–17076) — the four steps rise one after another (0.5s apart), then their bars grow.
 * - Discover: the network builds node by node and its dotted lines flow. "2024" counts up from 2018. The check table's
 *   marks pop in row by row.
 * - Define: the HMW highlight sweeps in; the trust line draws; point at (or tap) a stage to read its moment.
 * - Develop: screens slide in from alternating sides. 01 and 02 show captures of the live UTrada pages in a browser frame
 *   (click in to scroll them; "Open ↗" opens the real page); 03 is a working copy of the help chat (nothing is sent).
 * - Documentation: static cards. Decorative hover lifts and zooms were removed site-wide on this page (Nov 22).
 * - Deliver: the bars grow and count, "13" counts up; pointing at a month dims the others.
 * - Test: the action line draws, then "Today" moves across the line to "Redesign".
 * Small screens: ≤ 1023px stacks the two-column blocks; the network and charts scale or scroll sideways; ≤ 600px uses the
 * site's phone type scale.
 * Assets: Harbor-K/harbor-pf assets/utrada/v3 (logo, film), v7 (exported from the earlier Figma frame at 2x) and v9 (the
 * Documentation pictures and stakeholder photos, Figma 2139:544 / 2133:17788). If a DOC_IMG / PEOPLE_IMG entry is empty,
 * the card shows its plain panel and the chip a person icon.
 */

const A3 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/utrada/v3/'
const A7 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/utrada/v7/'
const IMG = {
  logo: A3 + 'logo.png',
  video: A3 + 'intro.mp4',
  poster: A3 + 'intro-poster.jpg',
  fca: A7 + 'logo-fca.png',
  tileLicence: A7 + 'tile-licence.webp',
  tileCysec: A7 + 'tile-cysec.webp',
  tickmill: A7 + 'logo-tickmill.png',
  ig: A7 + 'logo-ig.png',
  pepperstone: A7 + 'logo-pepperstone.svg',
  utradaLogo: A7 + 'logo-utrada.svg',
  persona: 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/utrada/v9/persona-trader.webp', // still from the intro film (920 × 591)
  regulations: A7 + 'screen-regulations.webp',
  accounts: A7 + 'screen-accounts.webp',
  takeaways: A7 + 'takeaways-photo.webp',
}
const A9 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/utrada/v9/'
// new in v9 (Figma 2139:544): Brand guide, Developer spec, Language sheet
const DOC_IMG: string[] = [A9 + 'doc-brand.webp', A9 + 'doc-spec.webp', A9 + 'doc-language.webp']
// new in v9 (Figma 2133:17788): the four stakeholder photos — named "Photo (illustrative)" in the frame
const PEOPLE_IMG: string[] = [1, 2, 3, 4].map(n => A9 + `person-${n}.webp`)

const SITE = 'https://utrada.com'
const FILM_LABEL = 'UTrada intro film: a trader at night wonders whether a new broker with no reviews is safe, checks the regulations page, the legal documents, the trading accounts and the help chat, then signs up. Ends on: UTrada, trust before the first deposit.'
const NEXT = { name: 'ETO Markets', href: '#/eto-markets' }
export const U9_CHAPTERS = ['Overview', 'Process', 'Discover', 'Define', 'Develop', 'Documentation', 'Deliver', 'Test', 'Takeaways']
const DARK = '#0B0B0D'

/* ---------- helpers ---------- */

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const d = (n: number) => ({ '--d': n } as React.CSSProperties)

/** true once the element has scrolled into view */
function useShownOnce<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (reducedMotion() || !('IntersectionObserver' in window)) { setShown(true); return }
    const steps = Array.from({ length: 21 }, (_, i) => i / 20)
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && (e.intersectionRatio >= threshold || e.intersectionRect.height >= innerHeight / 3)) { setShown(true); io.disconnect() }
    }, { threshold: steps })
    io.observe(el); return () => io.disconnect()
  }, [threshold])
  return [ref, shown] as const
}

/** a number that counts up to `to` once `on` turns true */
function useCount(to: number, on: boolean, from = 0, ms = 1400) {
  const [v, setV] = useState(() => (reducedMotion() ? to : from))
  useEffect(() => {
    if (!on) return
    if (reducedMotion()) { setV(to); return }
    let raf = 0; const t0 = performance.now()
    const tick = (t: number) => {
      const p = clamp((t - t0) / ms), e = 1 - Math.pow(1 - p, 3)
      setV(Math.round(from + (to - from) * e))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [on, to, from, ms])
  return v
}

/** scale for a fixed-size drawing (base px wide) so it fits its column */
function useFit<T extends HTMLElement>(base: number) {
  const ref = useRef<T>(null)
  const [s, setS] = useState(1)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const fit = () => setS(Math.min(1, el.clientWidth / base))
    fit()
    const ro = new ResizeObserver(fit); ro.observe(el)
    return () => ro.disconnect()
  }, [base])
  return [ref, s] as const
}

function Label({ children, tone }: { children: string; tone?: 'light' | 'night' | 'dim' }) {
  return <div className={'u9-label' + (tone ? ' ' + tone : '')}><i aria-hidden="true" />{children}</div>
}

/* ---------- content (Figma 2133:16974, word for word) ---------- */

const META = [
  { k: 'TIMELINE', v: ['At UTrada: Jun 2024 to Jan 2026, remote', 'This case study: Jul 2024 to Oct 2025, from launch to the last fixes'] },
  { k: 'MY ROLE', v: ['Lead Product Designer', 'I led the website from scratch to launch: page structure, user flows, layouts, design system and brand look.'] },
  { k: 'SCOPE', v: ['The pages new traders check before they sign up. This case study: Regulations, Accounts, Help & Support.'] },
]
const OVERVIEW = [
  { t: 'The problem', b: 'In 2024 UTrada changed its name. New visitors had never heard of it, and there was no easy way to check if their money would be safe. The goal: help them feel safe enough to confirm their ID and add money.' },
  { t: 'Solution', b: 'I mapped where first-time traders stop and worry. The worst moment is the first deposit. Three screens now give answers people can check: who licenses UTrada, what each account costs, and how to get help.' },
]
const IMPACT = [
  { n: 3, l: 'screens that turn doubt into proof' },
  { n: 13, l: 'releases after launch' },
  { n: 16, l: 'months I kept improving the live site' },
]
const STEPS = [
  { tag: '01 · DISCOVER', t: 'Look closely', s: 'Live-site audit · Rules by market · Other brokers’ pages', h: 64, a: 0.18 },
  { tag: '02 · DEFINE', t: 'One problem', s: 'Trader journey · 3 principles', h: 112, a: 0.32 },
  { tag: '03 · DEVELOP', t: 'Screens', s: 'Regulations · Accounts · Help & Support', h: 160, a: 0.5 },
]
const BROKERS = [
  { name: 'Tickmill', img: IMG.tickmill, w: 128, h: 48, page: 'Licences and regulation page' },
  { name: 'IG', img: IMG.ig, w: 48, h: 48, page: 'UK site footer' },
  { name: 'Pepperstone', img: IMG.pepperstone, w: 202, h: 40, page: 'EU legal documents page' },
  { name: 'UTrada', img: IMG.utradaLogo, w: 134, h: 32, page: 'Regulations page' },
]
type Mark = 'y' | 'p' | 'n' | 'u'
const CHECKS: { q: string; m: Mark[] }[] = [
  { q: 'Names the company you sign with', m: ['y', 'y', 'y', 'p'] },
  { q: 'Shows the licence number', m: ['y', 'y', 'y', 'p'] },
  { q: 'Explains how your money is protected', m: ['y', 'y', 'y', 'n'] },
  { q: 'Links to the regulator’s register', m: ['y', 'u', 'u', 'n'] },
]
const MARK_TXT: Record<Mark, string> = { y: '✓', p: '△', n: '✕', u: '—' }
const MARK_SR: Record<Mark, string> = { y: 'yes', p: 'only for one of its two companies', n: 'no', u: 'not seen on the page checked' }

const STAGES = ['First visit', 'Checking', 'Sign up', 'Verify ID', 'First deposit', 'Trade']
const FEEL = ['unsure', 'worried', 'hopeful', 'annoyed', 'anxious', 'relieved']
// the frame shows the first-deposit question; the others are the questions from the trader journey (v7 page)
const ASKS = [
  '“Never heard of them. Is this real?”',
  '“Who runs this — and is it really licensed?”',
  '“Which account is right for me?”',
  '“Why do they need all this?”',
  '“If I send money now, can I get it back?”',
  '“Someone will answer if something goes wrong.”',
]
const PT_Y = [112, 144, 56, 104, 160, 32]
type Risk = 'high' | 'highest' | 'medium' | 'low'
const RISK: { r: Risk; h: number }[] = [{ r: 'high', h: 48 }, { r: 'high', h: 48 }, { r: 'medium', h: 32 }, { r: 'medium', h: 32 }, { r: 'highest', h: 64 }, { r: 'low', h: 16 }]
const RISK_TAG: Record<Risk, string> = { highest: '▼ Highest risk of leaving', high: '▼ High risk of leaving', medium: 'Medium risk of leaving', low: '▲ Low risk of leaving' }

const PANELS = [
  { label: '01 · Regulations page', status: 'Live today', t: 'Licence details in one plain sentence', why: 'A new name has no track record. The licence is the proof people can check.', live: 'https://www.utrada.com/en/company/regulations', shot: A9 + 'live-regulations.webp', shotH: 3010, img: IMG.regulations,
    alt: 'UTrada Regulations page: Financial Services Commission, Mauritius, with its logo and one plain sentence naming UTrada Global Limited and its licence number, then Labuan Financial Services Authority' },
  { label: '02 · Account comparison', status: 'Reworked · Mar 2025', t: 'Three accounts, same rows, price first', why: 'First-time traders can’t compare spreads and fees in their head.', live: 'https://www.utrada.com/en/accounts', shot: A9 + 'live-accounts.webp', shotH: 2731, img: IMG.accounts,
    alt: 'UTrada trading accounts page: Ultra, Premium and Standard cards side by side, each starting with its price in pips, then the same rows of commissions, minimum deposit, lot sizes and leverage' },
  { label: '03 · Help & Support', status: 'Fixed · Nov 2024', t: 'Help from every page, even offline', why: 'Before the first deposit, people want to know someone will answer.' },
]
const DOCS = [
  { k: '01 · Brand guide', t: 'One look for a name nobody knew', b: 'Logo, colours and type in one guide, so every page showed the same UTrada. A new name has to look the same everywhere before people trust it.', alt: 'Pages from the UTrada brand guide: the purple logo, logo versions, colours and the Work Sans type specimen' },
  { k: '02 · Developer spec', t: 'Exact styles for developers', b: 'Every text style and colour written as values developers could copy, so the built pages matched the design. Part of the design system I built from scratch in about 8 months.', alt: 'Foundation spec: typography values and the colour list written out for developers' },
  { k: '03 · Language sheet', t: 'Every page in every language', b: 'Page text was translated in Excel, one sheet per language, such as Arabic and Spanish. Arabic reads right to left, so its layout flips too.', alt: 'Excel translation sheets for the site, one sheet per language' },
]
const RELEASES = [
  { m: 'Jul 2024', n: 1, items: ['Login / Register'] },
  { m: 'Sep 2024', n: 3, items: ['About us', 'Legal & partners', 'Regulations'] },
  { m: 'Oct 2024', n: 3, items: ['Cookie widget', 'Sub-navigation', 'Help & Support'] },
  { m: 'Nov 2024', n: 3, items: ['Broker check', 'Cookie fix', 'Help fix'] },
  { m: 'Mar 2025', n: 1, items: ['Account page fix'] },
  { m: 'Oct 2025', n: 2, items: ['Legal documents fix', 'Contact button'] },
]
const PEOPLE = ['Business Operations · UTrada', 'Marketing · UTrada', 'Marketing · UTrada', 'Customer support · another broker']
const ASKED = ['1. What do new traders ask before their first deposit?', '2. Where do they stop?', '3. Do my 5 moments match what you see?']
const TASKS = [
  { k: 'Task 1 · Easy to verify', t: 'Find who regulates UTrada and its licence number.' },
  { k: 'Task 2 · A real company behind it', t: 'Find the company you’d actually sign with.' },
  { k: 'Task 3 · Easy to contact', t: 'Find where to get help before adding money.' },
]
const MEASURES = ['Prompt: did they see it?', 'Ability: could they do it, and how fast?', 'Motivation: trust score before and after (1 to 5)']

/* ---------- icons (Figma vectors) ---------- */

const PersonIcon = () => (
  <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
    <path d="M61 38C61 45.18 55.18 51 48 51C40.82 51 35 45.18 35 38C35 30.82 40.82 25 48 25C55.18 25 61 30.82 61 38Z" stroke="currentColor" strokeWidth="3" />
    <path d="M24 74C26.5 61 36 55 48 55C60 55 69.5 61 72 74" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
)
const BankIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M5 36.67H35M10 30V18.33M16.67 30V18.33M23.33 30V18.33M30 30V18.33M20 3.33L33.33 11.67H6.67L20 3.33Z" stroke="currentColor" strokeWidth="2.92" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const BuildingIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M10 36.67V20M10 36.67H30M10 36.67H6.67C5.78 36.67 4.93 36.32 4.31 35.69C3.68 35.06 3.33 34.22 3.33 33.33V23.33C3.33 22.45 3.68 21.6 4.31 20.98C4.93 20.35 5.78 20 6.67 20H10M10 20V6.67C10 5.78 10.35 4.93 10.98 4.31C11.6 3.68 12.45 3.33 13.33 3.33H26.67C27.55 3.33 28.4 3.68 29.02 4.31C29.65 4.93 30 5.78 30 6.67V15M30 15V36.67M30 15H33.33C34.22 15 35.06 15.35 35.69 15.98C36.31 16.6 36.67 17.45 36.67 18.33V33.33C36.67 34.22 36.31 35.06 35.69 35.69C35.06 36.32 34.22 36.67 33.33 36.67H30M16.67 10H23.33M16.67 16.67H23.33M16.67 23.33H23.33M16.67 30H23.33" stroke="currentColor" strokeWidth="2.92" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const HeadsetIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M6 28H12C13.06 28 14.08 28.42 14.83 29.17C15.58 29.92 16 30.94 16 32V38C16 39.06 15.58 40.08 14.83 40.83C14.08 41.58 13.06 42 12 42H10C8.94 42 7.92 41.58 7.17 40.83C6.42 40.08 6 39.06 6 38V24C6 19.23 7.9 14.65 11.27 11.27C14.65 7.9 19.23 6 24 6C28.77 6 33.35 7.9 36.73 11.27C40.1 14.65 42 19.23 42 24V38C42 39.06 41.58 40.08 40.83 40.83C40.08 41.58 39.06 42 38 42H36C34.94 42 33.92 41.58 33.17 40.83C32.42 40.08 32 39.06 32 38V32C32 30.94 32.42 29.92 33.17 29.17C33.92 28.42 34.94 28 36 28H42" stroke="#330099" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ---------- Overview ---------- */

function Impact() {
  return (
    <div className="u9-row">
      <h3 className="u9-rt">Impact</h3>
      <div className="u9-stats">{IMPACT.map(x => <div className="st" key={x.l}><p className="n">{x.n}</p><p className="l">{x.l}</p></div>)}</div>
    </div>
  )
}

/* ---------- Process: four steps rise, bars grow (Figma motion 2133:17058–17076) ---------- */

function Process() {
  const [ref, on] = useShownOnce<HTMLDivElement>(0.35)
  return (
    <div ref={ref} className={'u9-steps' + (on ? ' on' : '')}>
      {STEPS.map((s, i) => (
        <div className="stp" key={s.t} style={d(i)}>
          <span className="tag">{s.tag}</span>
          <h3>{s.t}</h3>
          <p>{s.s}</p>
          <i className="bar" style={{ height: s.h, background: `rgba(255, 255, 255, ${s.a})` }} aria-hidden="true" />
        </div>
      ))}
      <div className="stp last" style={d(3)}>
        <span className="tag">04 · DELIVER</span>
        <h3>Ship, fix, test</h3>
        <p>Developer handoff · Post-launch fixes · Stakeholder check</p>
        <div className="bar shipped"><span className="k">LIVE ON UTRADA.COM</span><b>Since Jul 2024</b></div>
      </div>
    </div>
  )
}

/* ---------- Discover ---------- */

/** the broker network (Figma 2178:560): 856 × 688, scaled to fit its panel */
function Network() {
  const [fit, s] = useFit<HTMLDivElement>(856)
  const [ref, on] = useShownOnce<HTMLDivElement>(0.3)
  return (
    <div ref={fit} className="u9-netfit" style={{ height: Math.round(688 * s) }}>
      <div ref={ref} className={'u9-net' + (on ? ' on' : '')} style={{ transform: `scale(${s})` }}>
        <svg className="lines" viewBox="0 0 402 322" aria-hidden="true">
          <path className="ln" style={d(2)} d="M1 161H121" />
          <path className="ln" style={d(2)} d="M281 161H401" />
          <path className="ln up" style={d(3)} d="M201 113V1" />
          <path className="ln dn" style={d(4)} d="M201 209V265H81V321M201 265H321V321" />
        </svg>
        <div className="nd ut" style={d(0)}>UTrada</div>
        <div className="nd av" style={{ ...d(1), left: 132, top: 256 }}><PersonIcon /></div>
        <div className="nd av" style={{ ...d(1), left: 628, top: 256 }}><PersonIcon /></div>
        <span className="lb" style={{ ...d(1), left: 180, top: 216 }}>Trader</span>
        <span className="lb" style={{ ...d(1), left: 676, top: 216 }}>Introducing Broker (IB)</span>
        <div className="nd box" style={{ ...d(3), left: 380, top: 48 }}><BankIcon /></div>
        <span className="lb left" style={{ ...d(3), left: 500, top: 72 }}>Regulator</span>
        <div className="nd box co ok" style={{ ...d(4), left: 260, top: 464 }}><BuildingIcon /></div>
        <div className="nd box co no" style={{ ...d(4), left: 500, top: 464 }}><BuildingIcon /></div>
        <span className="lb two ok" style={{ ...d(4), left: 308, top: 568 }}><b>UTrada Global Ltd</b><span>Licensed · Mauritius</span></span>
        <span className="lb two no" style={{ ...d(4), left: 548, top: 568 }}><b>UTrada LLC</b><span>Registered · St Vincent</span></span>
      </div>
    </div>
  )
}

function YearCard() {
  const [ref, on] = useShownOnce<HTMLDivElement>(0.5)
  const y = useCount(2024, on, 2018, 1600)
  return (
    <div className="pn faced" ref={ref}>
      <div className="txt">
        <p className="eb">WHAT THE COMPANY FACED</p>
        <h3 className="big">A new name<br />nobody knew</h3>
        <p className="lead">New name, no track record — and two companies in two countries.</p>
      </div>
      <div className="yr">
        <b aria-label="2024">{y}</b>
        <p>Australia office + rebrand</p>
      </div>
    </div>
  )
}

function CheckTable() {
  const [ref, on] = useShownOnce<HTMLDivElement>(0.25)
  return (
    <div className="u9-tscroll">
      <div ref={ref} className={'u9-mx' + (on ? ' on' : '')} role="table" aria-label="Four checks a trader can make, by broker">
        <div className="mr hd" role="row">
          <div className="c q" role="columnheader"><span className="k">WHAT A TRADER CAN CHECK</span></div>
          {BROKERS.map(b => (
            <div key={b.name} className={'c br' + (b.name === 'UTrada' ? ' us' : '')} role="columnheader">
              <span className="lg"><img src={b.img} alt={b.name} width={b.w} height={b.h} style={{ width: b.w, height: b.h }} loading="lazy" decoding="async" /></span>
              <span className="pg">{b.page}</span>
            </div>
          ))}
        </div>
        {CHECKS.map((r, ri) => (
          <div key={r.q} className="mr" role="row">
            <div className="c q" role="rowheader"><b>{r.q}</b></div>
            {r.m.map((m, ci) => (
              <div key={ci} className={'c' + (ci === 3 ? ' us' : '')} role="cell">
                <span className={'mk ' + m + (ci === 3 ? ' u' : '')} style={d(ri * 4 + ci)} aria-label={MARK_SR[m]}>{MARK_TXT[m]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Define: trust chart (hover or tap a stage) ---------- */

function TrustChart() {
  const [ref, on] = useShownOnce<HTMLDivElement>(0.3)
  const [sel, setSel] = useState(4)
  const xs = STAGES.map((_, i) => 104 + i * 208)
  const line = xs.map((x, i) => `${i ? 'L' : 'M'} ${x} ${PT_Y[i]}`).join(' ')
  const area = `${line} L ${xs[5]} 200 L ${xs[0]} 200 Z`
  const r = RISK[sel]
  return (
    <div className="u9-chartcard">
      <p className="eb dark">Where a first-time trader slows down</p>
      <div className="u9-tc u9-tchd">
        <div className="hd" aria-live="polite">
          <div className="sym"><i aria-hidden="true" /><b>Trust in UTrada</b><span>First-time trader · assumed</span></div>
          <div className="hl"><span className="st">{STAGES[sel]}</span><span className={'tag ' + r.r}>{RISK_TAG[r.r]}</span></div>
          <p className="meta">Feeling: {FEEL[sel]}  ·  {ASKS[sel]}</p>
        </div>
      </div>
      <div className="u9-tscroll">
        <div ref={ref} className={'u9-tc' + (on ? ' on' : '')}>
          <div className="plot">
            <div className="cols">
              <svg className="ln" viewBox="0 0 1248 272" preserveAspectRatio="none" aria-hidden="true">
                <defs><linearGradient id="u9-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8A2BE3" stopOpacity=".16" /><stop offset="1" stopColor="#8A2BE3" stopOpacity="0" /></linearGradient></defs>
                <line className="neutral" x1="0" y1="112" x2="1248" y2="112" vectorEffect="non-scaling-stroke" />
                <path className="area" d={area} fill="url(#u9-area)" />
                <path className="trend" d={line} pathLength={1} vectorEffect="non-scaling-stroke" />
                <line className="base" x1="0" y1="272" x2="1248" y2="272" vectorEffect="non-scaling-stroke" />
              </svg>
              {STAGES.map((s, i) => (
                <button key={s} type="button" className={'col' + (i === sel ? ' sel' : '')} style={d(i)}
                  onMouseEnter={() => setSel(i)} onFocus={() => setSel(i)} onClick={() => setSel(i)} aria-pressed={i === sel}
                  aria-label={`${s}: feeling ${FEEL[i]}, ${RISK_TAG[RISK[i].r].replace(/[▼▲] /, '').toLowerCase()}`}>
                  <i className="dot" style={{ top: PT_Y[i] }} aria-hidden="true" />
                  <i className={'bar ' + RISK[i].r + (i === sel ? ' on' : '')} style={{ height: RISK[i].h }} aria-hidden="true" />
                  <span className="xl"><b>{s}</b><span>{FEEL[i]}</span></span>
                </button>
              ))}
            </div>
            <div className="axis" aria-hidden="true">
              <span style={{ top: 20 }}>calm</span>
              <span className="tagn" style={{ top: 96 }}>neutral</span>
              <span style={{ top: 168 }}>uneasy</span>
              <span style={{ top: 244 }}>risk of leaving</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HmwLine() {
  const [ref, on] = useShownOnce<HTMLParagraphElement>(0.6)
  return (
    <p ref={ref} className={'hmw' + (on ? ' on' : '')}>
      How might we help a first-time visitor check that UTrada is safe, <mark>right at the moment they feel unsure</mark>, without making sign-up slower?
    </p>
  )
}

/* ---------- Develop ---------- */

/** a page of the live UTrada site in a browser frame: a top-to-bottom capture of its key part (Nov 22, 2026), scrolled
 *  inside the frame. A capture rather than the live page, because the live page opens with a cookie notice that can't be
 *  dismissed inside a frame. Wheel and touch stay with the case study until the visitor clicks in, so the frame never
 *  traps page scrolling; "Open ↗" opens the real page. */
function SiteShot({ url, src, h, alt }: { url: string; src: string; h: number; alt: string }) {
  const [active, setActive] = useState(false)
  const host = url.replace(/^https?:\/\/(www\.)?/, '')
  return (
    <div className="u9-live" onMouseLeave={() => setActive(false)}>
      <div className="bar">
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="url">{host}</span>
        <a href={url} target="_blank" rel="noopener noreferrer">Open ↗<span className="sr-only"> (opens the live page in a new tab)</span></a>
      </div>
      <div className={'view' + (active ? ' on' : '')}>
        <div className="sc" tabIndex={active ? 0 : -1} aria-label={'Capture of ' + host + ', scrollable'}>
          <img src={src} width={1568} height={h} alt={alt} loading="lazy" decoding="async" />
        </div>
        {!active && (
          <button type="button" className="cover" onClick={() => setActive(true)} aria-label={'Scroll the capture of ' + host}>
            <span>Click to scroll the page</span>
          </button>
        )}
      </div>
    </div>
  )
}

/** the help chat, rebuilt from the live site: it works like the real one, but nothing leaves the page */
function HelpChat() {
  const [ref, on] = useShownOnce<HTMLDivElement>(0.4)
  const [step, setStep] = useState<'form' | 'chat'>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [msgs, setMsgs] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const body = useRef<HTMLDivElement>(null)
  const nameIn = useRef<HTMLInputElement>(null)
  const draftIn = useRef<HTMLInputElement>(null)
  const emailIn = useRef<HTMLInputElement>(null)
  useEffect(() => { const b = body.current; if (b && step === 'chat') b.scrollTop = b.scrollHeight }, [msgs, step])
  const start = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setErr('Please enter your name.'); nameIn.current?.focus(); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setErr('Please enter a valid e-mail.'); emailIn.current?.focus(); return }
    setErr(''); setStep('chat'); setTimeout(() => draftIn.current?.focus({ preventScroll: true }), 50)
  }
  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const t = draft.trim(); if (!t) return
    setMsgs(m => [...m, t]); setDraft('')
  }
  const back = () => { setStep('form'); setMsgs([]); setDraft(''); setErr('') }
  return (
    <div ref={ref} className={'u9-help' + (on ? ' on' : '')} role="group" aria-label="Demo of UTrada’s help chat. Nothing you type is sent.">
      <div className="w">
        <div className="top">
          <button type="button" onClick={back} disabled={step === 'form'} aria-label="Back to the form">←</button>
          <span aria-hidden="true">•••</span>
        </div>
        <div className="body" ref={body} aria-live="polite">
          <div className="away"><span className="av" aria-hidden="true">UT</span><p>We’re away at the moment. Leave a message, and we’ll reply by email.</p></div>
          {step === 'form' ? (
            <form className="form" onSubmit={start} noValidate>
              <p>Let’s chat! Fill in a few details to get started.</p>
              <label>Name:<input ref={nameIn} value={name} onChange={e => setName(e.target.value)} autoComplete="off" /></label>
              <label>E-mail:<input ref={emailIn} type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="off" /></label>
              {err && <p className="err" role="alert">{err}</p>}
              <button type="submit" className="go">Start the chat</button>
            </form>
          ) : (
            <>
              <p className="msg them">Thanks, {name.trim()}! Leave your message here and we’ll reply to {email.trim()}.</p>
              {msgs.map((m, i) => <p className="msg me" key={i}>{m}</p>)}
              {msgs.length > 0 && <p className="msg them">Got it. We’ll reply by email soon.</p>}
            </>
          )}
        </div>
        {step === 'chat' && (
          <form className="compose" onSubmit={send}>
            <input ref={draftIn} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Write a message" aria-label="Message" autoComplete="off" />
            <button type="submit" aria-label="Send">↑</button>
          </form>
        )}
        <p className="pw">Powered by Text · demo, nothing is sent</p>
      </div>
    </div>
  )
}

/* ---------- Deliver: release volume ---------- */

function ReleaseBar({ n, on, i }: { n: number; on: boolean; i: number }) {
  const v = useCount(n, on, 0, 900 + i * 120)
  return (
    <div className="area">
      <div className={'bar' + (n === 3 ? ' hi' : '')} style={{ height: n * 72, ...d(i) }}><b aria-hidden="true">{v}</b></div>
    </div>
  )
}
function Releases() {
  const [ref, on] = useShownOnce<HTMLDivElement>(0.35)
  const total = useCount(13, on, 0, 1600)
  const [hot, setHot] = useState(-1)
  return (
    <div ref={ref} className={'u9-rel' + (on ? ' on' : '')}>
      <div className="hd">
        <div className="tx">
          <h3>After launch<br />I kept fixing what didn’t match</h3>
          <p>I kept improving the site after it went live, from July 2024 to October 2025. For example, the account page (March 2025) and the legal documents (October 2025).</p>
        </div>
        <div className="tot"><b aria-label="13">{total}</b><span>Releases after launch</span></div>
      </div>
      <div className="u9-tscroll">
        <ul className={'vol' + (hot >= 0 ? ' hov' : '')} onMouseLeave={() => setHot(-1)}>
          {RELEASES.map((r, i) => (
            <li key={r.m} className={(r.n === 3 ? 'hi' : '') + (hot === i ? ' hot' : '')} onMouseEnter={() => setHot(i)}
              aria-label={`${r.m}: ${r.n} release${r.n > 1 ? 's' : ''} — ${r.items.join(', ')}`}>
              <ReleaseBar n={r.n} on={on} i={i} />
              <div className="info">
                <span className="m">{r.m}</span>
                <div className="its">{r.items.map(t => <p key={t}>{t}</p>)}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------- Test: Fogg chart ---------- */

function FoggChart() {
  const [ref, on] = useShownOnce<HTMLDivElement>(0.4)
  return (
    <div className="u9-fogg">
      <div className="fh"><span className="k">Fogg Behavior Model · my hypothesis</span><span className="pill pu">To test</span></div>
      <div ref={ref} className={'fc' + (on ? ' on' : '')} role="img"
        aria-label="Fogg Behavior Model chart. Motivation up, ability across. The action line curves down from top left. Today the first deposit sits below the line, hard to check; the redesign moves it right, above the line, easy to check.">
        <div className="zone" aria-hidden="true" />
        <svg className="act" viewBox="0 0 583 290" preserveAspectRatio="none" aria-hidden="true">
          <path d="M1.5 0.3C49.5 216.3 209.5 272.3 582.5 288.3" pathLength={1} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="t mot" aria-hidden="true">Motivation ↑</span>
        <span className="t abl" aria-hidden="true">Ability →</span>
        <span className="t hard" aria-hidden="true">hard</span>
        <span className="t al" aria-hidden="true">Action line</span>
        <span className="t above" aria-hidden="true">Above the line: the prompt works</span>
        <i className="arrow" aria-hidden="true" />
        <i className="pt today" aria-hidden="true" />
        <i className="pt redo" aria-hidden="true" />
        <span className="t lt" aria-hidden="true">Today: below the line<br />hard to check</span>
        <span className="t lr" aria-hidden="true">Redesign: above the line<br />easy to check</span>
      </div>
      <p className="cap">Same worry at the first deposit, but checking is easy, so the “Join now” prompt can work.</p>
    </div>
  )
}

/* ---------- page ---------- */

export function UTradaV9() {
  const [introOn] = useState(() => !reducedMotion())
  const [intro, setIntro] = useState(introOn)
  const away = useHeadroom()
  const root = useRef<HTMLDivElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const media = useRef<HTMLVideoElement>(null)
  useCaseIntro(introOn, slot, box, media, () => setIntro(false))

  // soft block reveal: blocks already on screen come in right away, the rest as they scroll in
  useEffect(() => {
    const el = root.current; if (!el) return
    const els = Array.from(el.querySelectorAll<HTMLElement>('[data-r]'))
    if (reducedMotion() || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('r-in')); return }
    els.forEach(e => { if (e.getBoundingClientRect().top < innerHeight * 0.92) e.classList.add('r-in') })
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('r-in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.08 })
    els.filter(e => !e.classList.contains('r-in')).forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [])

  return (
    <div className={'hb ut u9' + (intro ? ' intro-on' : '')} ref={root}>
      <style>{CSS + U9_CSS}</style>
      <SiteHeaderB mode="light" hidden={intro} away={away} />
      <SideToc chapters={U9_CHAPTERS} scope=".u9" hidden={intro} />

      <main id="top">
        {/* Hero (2133:16975) */}
        <section className="u9-hero" data-chapter="UTrada" aria-label="UTrada">
          <div className="u9-w">
            <img className="u9-logo" src={IMG.logo} alt="UTrada" width={160} height={38} />
            <h1 className="u9-h1">Trust before the first deposit</h1>
            <p className="u9-sub">UTrada was a new online trading company that nobody knew yet. I led the design of its website, so first-time traders could check it was real and safe before putting money in.</p>
            <a className="u9-btn" href={SITE} target="_blank" rel="noreferrer">View Website<span className="sr-only"> (opens in a new tab)</span></a>
            <div className="u9-slot" ref={slot}>
              <div className="u9-box" ref={box}><CaseFilm src={IMG.video} poster={IMG.poster} label={FILM_LABEL} quiet={intro} introRef={media} /></div>
            </div>
            <div className="u9-meta">
              {META.map((m, i) => (
                <div key={m.k} data-r style={d(i)}><div className="k">{m.k}</div>{m.v.map(v => <p key={v}>{v}</p>)}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Overview (2133:17001) */}
        <section className="u9-sec soft" data-chapter="Overview">
          <div className="u9-w u9-rows">
            <Label>OVERVIEW</Label>
            {OVERVIEW.map((r, i) => (
              <div className="u9-row" key={r.t} data-r style={d(i)}><h2 className="u9-rt">{r.t}</h2><p className="u9-body">{r.b}</p></div>
            ))}
            <Impact />
          </div>
        </section>

        {/* Process (2133:17051) */}
        <section className="u9-sec u9-proc" data-chapter="Process">
          <div className="u9-w">
            <Label tone="light">PROCESS</Label>
            <h2 className="u9-h2 light mt32">From first look to launch</h2>
            <p className="u9-body light mt32">Four steps, each one building on the last. The last bar is what shipped.</p>
            <Process />
          </div>
        </section>

        {/* Discover (2178:547) */}
        <section className="u9-sec soft" data-chapter="Discover">
          <div className="u9-w">
            <Label>DISCOVER</Label>
            <div className="u9-dash mt40">
              <div className="rowA">
                <div className="pn broker" data-r>
                  <div className="txt">
                    <p className="eb">WHAT A BROKER IS</p>
                    <h3 className="big">You trust it with your money</h3>
                    <p className="lead w600">A broker holds your money and places your trades. A regulator checks the broker but only one of UTrada’s two companies is licensed.</p>
                  </div>
                  <Network />
                  <ul className="u9-netlist">
                    <li><b>Trader</b> → <b>UTrada</b> ← <b>Introducing Broker (IB)</b></li>
                    <li><b>Regulator</b> checks UTrada</li>
                    <li><b>UTrada Global Ltd</b> · Licensed · Mauritius</li>
                    <li><b>UTrada LLC</b> · Registered · St Vincent</li>
                  </ul>
                </div>
                <YearCard />
              </div>
              <div className="rowB">
                <figure className="tile fca" data-r style={d(0)}>
                  <div className="badge"><img src={IMG.fca} alt="Financial Conduct Authority" width={112} height={35} loading="lazy" decoding="async" /></div>
                  <figcaption><b>£78M</b><p>Lost in the UK in 2020 to fake “clone” brokers.</p><span>FCA · Jan 2021</span></figcaption>
                </figure>
                <figure className="tile ph" data-r style={d(1)}>
                  <img className="bg" src={IMG.tileLicence} alt="" loading="lazy" decoding="async" />
                  <figcaption><b>Licence<br />first</b><p>Traders judge a broker by its licence, withdrawals and support.</p><span>FXStreet via Finance Magnates · Jul 2024</span></figcaption>
                </figure>
                <figure className="tile ph" data-r style={d(2)}>
                  <img className="bg" src={IMG.tileCysec} alt="" loading="lazy" decoding="async" />
                  <figcaption><b>€2,000</b><p>The most a broker can take before your ID check is done.</p><span>CySEC via Finance Magnates · Jul 2025</span></figcaption>
                </figure>
              </div>
            </div>

            <div className="u9-head mt128" data-r>
              <h3 className="u9-h2">How other global brokers show who you trade with</h3>
              <p className="u9-body mute w900">Four checks a trader can make before adding money, on each broker’s own pages (checked Nov 2026).</p>
            </div>
            <div className="mt48" data-r><CheckTable /></div>
            <ul className="u9-legend mt24" data-r>
              <li><b>✓</b>yes</li>
              <li><b className="pu">△</b>only for one of its two companies</li>
              <li><b className="pu">✕</b>no</li>
              <li><b>—</b>not seen on the page checked</li>
            </ul>
            <p className="u9-src mt24" data-r>Pages checked (Nov 2026): tickmill.com/about/licences-and-regulation · ig.com/uk (site footer) · pepperstone.com/en-eu/legal-documents · utrada.com/en/company/regulations</p>
          </div>
        </section>

        {/* Define (2185:544) */}
        <section className="u9-sec soft" data-chapter="Define">
          <div className="u9-w">
            <Label>DEFINE</Label>
            <div className="u9-board mt64" data-r>
              <div className="who">
                <div className="persona">
                  <div className="ph"><img src={IMG.persona} alt="A first-time trader in a dark room, lit by a purple light, looking at his screen" loading="lazy" decoding="async" /></div>
                  <div className="tx">
                    <p className="eb">Who I designed for</p>
                    <h3>The first-time trader</h3>
                    <p className="q">“Is this company real, and really licensed?”</p>
                    <p className="q">“If I send money, can I get it back?”</p>
                    <p className="q">“Who answers if something goes wrong?”</p>
                    <p className="note">Proto-persona from desk research, not interviews</p>
                  </div>
                </div>
                <div className="prob">
                  <div className="ph2">
                    <p className="eb dark">One problem</p>
                    <HmwLine />
                  </div>
                  <div className="goals">
                    <div><p className="eb dark">For the business</p><p>More visitors become customers who confirm their ID and add money.</p></div>
                    <div><p className="eb dark">For the trader</p><p>They can check the facts for themselves before handing over money.</p></div>
                  </div>
                </div>
              </div>
              <TrustChart />
              <div className="princ">
                <div className="pc" style={d(0)}>
                  <div className="top"><b>01</b><span className="vis"><img src={IMG.regulations} alt="" loading="lazy" decoding="async" /></span></div>
                  <h4>Make the licence checkable</h4>
                </div>
                <div className="pc" style={d(1)}>
                  <div className="top"><b>02</b><span className="vis"><img src={IMG.accounts} alt="" loading="lazy" decoding="async" /></span></div>
                  <h4>Say which company you sign with</h4>
                </div>
                <div className="pc" style={d(2)}>
                  <div className="top"><b>03</b><span className="vis ic"><HeadsetIcon /></span></div>
                  <h4>Show help before money</h4>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Develop (2187:544) */}
        <section className="u9-sec night" data-chapter="Develop">
          <div className="u9-w">
            <Label tone="dim">DEVELOP</Label>
            <div className="u9-head g16 mt64" data-r>
              <h3 className="u9-h2 big light">One screen per moment</h3>
              <p className="u9-lead light w760">Each screen turns one doubt into proof people can check.</p>
            </div>
            <div className="u9-panels">
              {PANELS.map((p, i) => (
                <div key={p.label} className={'pnl' + (i % 2 ? ' rev' : '')} data-r>
                  <div className="tx">
                    <p className="lab">{p.label}</p>
                    <span className="status">{p.status}</span>
                    <h3>{p.t}</h3>
                    <div className="why"><p className="k">Why</p><p>{p.why}</p></div>
                  </div>
                  <div className={'scr' + (p.live ? ' live' : ' chat')}>
                    {p.live && p.shot ? <SiteShot url={p.live} src={p.shot} h={p.shotH} alt={p.alt} /> : <HelpChat />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Documentation (2139:544) */}
        <section className="u9-sec u9-docsec" data-chapter="Documentation">
          <div className="u9-w">
            <Label tone="night">DOCUMENTATION</Label>
            <div className="u9-head g24 pt64 mt32" data-r>
              <h3 className="u9-h2 light">What I handed over to developers</h3>
              <p className="u9-body light w880">A new name only feels safe if it looks and reads the same on every page, in every language. These documents kept the whole team building the same UTrada.</p>
            </div>
            <div className="u9-docs">
              {DOCS.map((c, i) => (
                <article key={c.k} className="doc" data-r style={d(i)}>
                  <div className="vis">{DOC_IMG[i] && <img src={DOC_IMG[i]} alt={c.alt} loading="lazy" decoding="async" />}</div>
                  <div className="tx"><p className="k">{c.k}</p><h3>{c.t}</h3><p>{c.b}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Deliver (2192:544) */}
        <section className="u9-sec soft" data-chapter="Deliver">
          <div className="u9-w">
            <Label tone="dim">DELIVER</Label>
            <div className="mt64"><Releases /></div>
          </div>
        </section>

        {/* Test (2133:17788) */}
        <section className="u9-sec soft" data-chapter="Test">
          <div className="u9-w">
            <Label>TEST</Label>
            <div className="u9-head g24 mt96" data-r>
              <h3 className="u9-h2">Checked with people who hear traders every day</h3>
              <p className="u9-body w760">I asked four stakeholders who work closely with new traders every day: three of my UTrada colleagues and a support agent at another broker.</p>
            </div>
            <div className="u9-check mt96">
              <div className="sh" data-r><h4>Stakeholder check · Nov 2026</h4><span className="pill pu">In progress</span></div>
              <ul className="who" data-r>
                {PEOPLE.map((p, i) => (
                  <li key={i} style={d(i)}>
                    <span className="ph">{PEOPLE_IMG[i] ? <img src={PEOPLE_IMG[i]} alt="" width={48} height={48} loading="lazy" decoding="async" /> : <PersonIcon />}</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div className="asked" data-r>
                <p className="k">What I asked</p>
                {ASKED.map(a => <p key={a}>{a}</p>)}
              </div>
            </div>
            <div className="u9-check mt96">
              <div className="sh" data-r><h4>Next: test with first-time traders</h4><span className="pill grey">Planned</span></div>
              <p className="u9-body mute" data-r>5 first-time traders · 3 tasks · trust score before and after (1 to 5)</p>
              <div className="u9-plan" data-r>
                <FoggChart />
                <div className="tasks">
                  {TASKS.map(t => <div key={t.k} className="tk"><p className="k">{t.k}</p><p>{t.t}</p></div>)}
                  <div className="ms"><p className="k">What I’ll measure</p>{MEASURES.map(m => <p key={m}>{m}</p>)}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Takeaways (2133:17879) */}
        <section className="u9-take" data-chapter="Takeaways">
          <img className="u9-take-ph" src={IMG.takeaways} width={1490} height={1986} loading="lazy" decoding="async"
            alt="Harbor in a black UTrada T-shirt at a café table, holding up a purple UTrada bag printed with www.utrada.com" />
          <div className="u9-w">
            <div className="u9-take-in" data-r>
              <div className="u9-take-k"><i aria-hidden="true" />TAKEAWAYS</div>
              <h2 className="t">People trust a new broker when they can check the facts.</h2>
              <p className="dd">To win trust, I didn’t push harder. I made the facts easy to find. One gap is still there: the site shows who regulates UTrada, but not which company your account is with.</p>
            </div>
          </div>
        </section>

        <section className="u9-next" id="next">
          <a className="u9-w next-card" href={NEXT.href}>
            <span className="eyebrow">Next case study</span>
            <span className="next-name">{NEXT.name} <span className="go">→</span></span>
          </a>
        </section>
      </main>
    </div>
  )
}

const U9_CSS = `
.u9 { --ink: #000D10; --ink2: #000D0F; --mute: #66666E; --line: #D5D3D4; --line3: #E5E5EB; --pu: #8A2BE3; --deep: #330099; --lav: #CCA8FF;
  --soft: #F6F5FA; --night: #13121A; --night2: #0D0A17; --ease: cubic-bezier(.22,1,.36,1); --pop: cubic-bezier(.34,1.56,.64,1);
  background: #FFFFFF; color: var(--ink); }
.u9 .u9-w { position: relative; width: min(1440px, calc(100vw - 64px)); margin: 0 auto; }
.u9 h1, .u9 h2, .u9 h3, .u9 h4, .u9 p, .u9 figure, .u9 ol, .u9 ul { margin: 0; padding: 0; }
.u9 ol, .u9 ul { list-style: none; }
.u9 mark { background: none; color: inherit; }
.u9 .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.u9 .mt24 { margin-top: 24px; } .u9 .mt32 { margin-top: 32px; } .u9 .mt40 { margin-top: 40px; } .u9 .mt48 { margin-top: 48px; }
.u9 .mt64 { margin-top: 64px; } .u9 .mt96 { margin-top: 96px; } .u9 .mt128 { margin-top: 128px; } .u9 .pt64 { padding-top: 64px; }
.u9 .w600 { max-width: 600px; } .u9 .w760 { max-width: 760px; } .u9 .w880 { max-width: 880px; } .u9 .w900 { max-width: 900px; }
/* square corners everywhere, except the round pills, marks and dots that set their own */
.u9 *, .u9 *::before, .u9 *::after { border-radius: 0; }

/* soft reveal */
.u9 [data-r] { opacity: 0; transform: translate3d(0, 28px, 0); transition: opacity 1.2s var(--ease), transform 1.2s var(--ease); transition-delay: calc(var(--d, 0) * 120ms); }
.u9 [data-r].r-in { opacity: 1; transform: none; }

/* type */
.u9 .u9-label { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; color: var(--mute); }
.u9 .u9-label i { flex: none; width: 12px; height: 12px; background: var(--pu); }
.u9 .u9-label.light { color: #FFFFFF; } .u9 .u9-label.light i { background: #FFFFFF; }
.u9 .u9-label.dim { color: rgba(0, 13, 15, .6); }
.u9 .night .u9-label.dim { color: rgba(255, 255, 255, .6); }
.u9 .u9-label.night { color: rgba(255, 255, 255, .72); }
.u9 .u9-h2 { font-size: 40px; font-weight: 700; line-height: 48px; letter-spacing: -0.015em; color: var(--ink2); }
.u9 .u9-h2.big { font-size: 48px; line-height: 56px; letter-spacing: -0.03em; }
.u9 .u9-h2.light { color: #FFFFFF; }
.u9 .u9-rt { flex: none; width: 370px; font-size: 24px; font-weight: 700; line-height: 32px; letter-spacing: -0.005em; color: var(--ink); }
.u9 .u9-body { font-size: 18px; line-height: 32px; color: var(--ink); }
.u9 .u9-body.mute { color: var(--mute); }
.u9 .u9-body.light { color: rgba(255, 255, 255, .72); }
.u9 .u9-lead { font-size: 20px; line-height: 32px; color: rgba(0, 13, 15, .6); }
.u9 .u9-lead.light { color: rgba(255, 255, 255, .6); }
.u9 .u9-src { font-size: 16px; line-height: 24px; color: var(--mute); }
.u9 .k { font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; color: var(--mute); }
.u9 .eb { font-size: 16px; font-weight: 600; line-height: 24px; letter-spacing: .1em; text-transform: uppercase; color: rgba(255, 255, 255, .6); }
.u9 .eb.dark { color: var(--mute); }
.u9 .u9-head { display: flex; flex-direction: column; gap: 16px; }
.u9 .u9-head.g24 { gap: 24px; }
.u9 .pill { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 999px !important; font-size: 16px; font-weight: 500; line-height: 24px; white-space: nowrap; }
.u9 .pill.pu { background: #F0EBFC; color: var(--pu); }
.u9 .pill.grey { background: #EDEDF0; color: var(--mute); }
.u9 .u9-tscroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }

/* ---- hero (2133:16975) ---- */
.u9 .u9-hero { padding: 120px 0 160px; }
.u9 .u9-logo { display: block; width: 160px; height: auto; }
.u9 .u9-h1 { margin-top: 40px; max-width: 960px; font-size: 64px; font-weight: 400; line-height: 72px; letter-spacing: -0.02em; }
.u9 .u9-sub { margin-top: 16px; max-width: 881px; font-size: 18px; line-height: 28px; }
.u9 .u9-btn { display: inline-flex; align-items: center; justify-content: center; min-width: 200px; height: 56px; margin-top: 40px; padding: 0 32px;
  background: #000D0F; color: #FFFFFF !important; font-size: 16px; font-weight: 500; line-height: 24px; text-decoration: none;
  transition: background-color .3s, transform .35s var(--ease); }
.u9 .u9-btn:hover { background: #2A2A33; transform: translateY(-2px); }
.u9 .u9-btn:focus-visible { outline: 2px solid var(--pu); outline-offset: 3px; }
.u9 .u9-slot { position: relative; margin-top: 40px; aspect-ratio: 16 / 9; }
.u9 .u9-box { position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 40; overflow: hidden; background: ${DARK}; }
.u9 .u9-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 48px; margin-top: 40px; }
.u9 .u9-meta .k { margin-bottom: 8px; }
.u9 .u9-meta p { font-size: 18px; line-height: 32px; }

/* ---- sections ---- */
.u9 .u9-sec { position: relative; padding: 160px 0; }
.u9 .u9-sec.soft { background: var(--soft); }
.u9 .u9-sec.night { background: var(--night); color: #FFFFFF; }

/* overview (2133:17001) */
.u9 .u9-rows { display: flex; flex-direction: column; gap: 64px; }
.u9 .u9-row { display: flex; align-items: flex-start; }
.u9 .u9-row > .u9-body, .u9 .u9-row > .u9-stats { flex: 1; min-width: 0; }
.u9 .u9-stats { display: flex; }
.u9 .u9-stats .st { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; padding: 0 32px; }
.u9 .u9-stats .st:first-child { padding-left: 0; }
.u9 .u9-stats .n { font-size: 56px; font-weight: 400; line-height: 64px; color: var(--pu); font-variant-numeric: tabular-nums; }
.u9 .u9-stats .l { font-size: 16px; line-height: 24px; color: var(--mute); }

/* process (2133:17051): Figma's motion — steps rise 0.5s apart, then their bars grow */
.u9 .u9-proc { background: linear-gradient(180deg, #26096B, #4A1A9E); color: #FFFFFF; overflow: hidden; }
.u9 .u9-steps { display: flex; align-items: flex-end; gap: 24px; margin-top: 32px; padding-top: 64px; box-shadow: inset 0 -2px 0 rgba(255, 255, 255, .32); }
.u9 .u9-steps .stp { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 16px;
  opacity: 0; transform: translateY(40px); transition: opacity .6s cubic-bezier(.5,0,.5,1), transform .6s var(--ease); transition-delay: calc(var(--d) * .5s + .2s); }
.u9 .u9-steps.on .stp { opacity: 1; transform: none; }
.u9 .u9-steps .tag { padding: 4px 12px; border-radius: 999px !important; background: rgba(255, 255, 255, .16); font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .04em; white-space: nowrap; }
.u9 .u9-steps .last .tag { background: #FFFFFF; color: var(--deep); }
.u9 .u9-steps h3 { font-size: 24px; font-weight: 700; line-height: 32px; }
.u9 .u9-steps p { font-size: 16px; line-height: 24px; color: rgba(255, 255, 255, .72); }
.u9 .u9-steps .bar { display: block; width: 100%; transform: scaleY(0); transform-origin: bottom;
  transition: transform .9s var(--ease), filter .3s ease; transition-delay: calc(var(--d) * .5s + .6s); }
.u9 .u9-steps.on .bar { transform: none; }
.u9 .u9-steps .shipped { display: flex; flex-direction: column; gap: 8px; height: 208px; box-sizing: border-box; padding: 24px 24px 0; background: #FFFFFF; white-space: nowrap; overflow: hidden; }
.u9 .u9-steps .shipped .k { color: var(--pu); }
.u9 .u9-steps .shipped b { font-size: 24px; font-weight: 700; line-height: 32px; color: #26096B; }

/* discover (2178:547) */
.u9 .u9-dash { display: flex; flex-direction: column; gap: 16px; }
.u9 .u9-dash .rowA, .u9 .u9-dash .rowB { display: flex; gap: 16px; align-items: stretch; }
.u9 .u9-dash .pn { box-shadow: 0 8px 24px rgba(51, 0, 153, .14); color: #FFFFFF; overflow: hidden; }
.u9 .u9-dash .broker { flex: 1; min-width: 0; padding: 40px 40px 32px; background: linear-gradient(90deg, #330099, #8A2BE3); display: flex; flex-direction: column; gap: 24px; }
.u9 .u9-dash .txt { display: flex; flex-direction: column; gap: 16px; }
.u9 .u9-dash .big { font-size: 40px; font-weight: 700; line-height: 48px; letter-spacing: -0.025em; }
.u9 .u9-dash .lead { font-size: 20px; line-height: 32px; color: rgba(255, 255, 255, .78); }
.u9 .u9-dash .faced { flex: none; width: 488px; box-sizing: border-box; padding: 40px; background: var(--night); display: flex; flex-direction: column; justify-content: space-between; gap: 32px; }
.u9 .u9-dash .yr b { display: block; font-size: 152px; font-weight: 700; line-height: 144px; letter-spacing: -0.04em; font-variant-numeric: tabular-nums;
  background: linear-gradient(90deg, #FFFFFF, #CCA8FF); -webkit-background-clip: text; background-clip: text; color: transparent; }
.u9 .u9-dash .yr p { margin-top: 8px; font-size: 20px; line-height: 32px; color: rgba(255, 255, 255, .85); }

/* the broker network: a fixed 856 × 688 drawing, scaled to its panel */
.u9 .u9-netfit { position: relative; width: 100%; }
.u9 .u9-net { position: absolute; left: 0; top: 0; width: 856px; height: 688px; transform-origin: 0 0; }
.u9 .u9-net .lines { position: absolute; left: 227px; top: 143px; width: 402px; height: 322px; overflow: visible; }
.u9 .u9-net .ln { fill: none; stroke: rgba(255, 255, 255, .55); stroke-width: 2; stroke-linecap: round; stroke-dasharray: 2 8; opacity: 0;
  transition: opacity .6s ease, stroke .3s ease; transition-delay: calc(var(--d) * .25s + .2s); animation: u9-flow 1.6s linear infinite; }
.u9 .u9-net.on .ln { opacity: 1; }
@keyframes u9-flow { to { stroke-dashoffset: -20; } }
.u9 .u9-net .nd, .u9 .u9-net .lb { position: absolute; opacity: 0; transform: scale(.85); transition: opacity .5s ease, transform .6s var(--pop), box-shadow .3s ease, border-color .3s ease, background-color .3s ease;
  transition-delay: calc(var(--d) * .25s); }
.u9 .u9-net.on .nd, .u9 .u9-net.on .lb { opacity: 1; transform: none; }
.u9 .u9-net .ut { left: 324px; top: 248px; width: 208px; height: 112px; display: flex; align-items: center; justify-content: center; background: #FFFFFF;
  box-shadow: 0 0 32px rgba(138, 43, 227, .7); font-size: 32px; font-weight: 700; line-height: 40px; letter-spacing: -0.03em; color: var(--deep); }
.u9 .u9-net .av { width: 96px; height: 96px; box-sizing: border-box; background: rgba(255, 255, 255, .1); border: 1px solid rgba(255, 255, 255, .35); color: rgba(255, 255, 255, .9); }
.u9 .u9-net .av svg { display: block; width: 100%; height: 100%; }
.u9 .u9-net .box { width: 96px; height: 96px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; padding: 0; margin: 0;
  background: rgba(255, 255, 255, .1); border: 1px solid rgba(255, 255, 255, .24); color: rgba(255, 255, 255, .85); font: inherit; }
.u9 .u9-net .box svg { width: 40px; height: 40px; }
.u9 .u9-net .lb { white-space: nowrap; font-size: 18px; font-weight: 600; line-height: 24px; color: #FFFFFF; transform: translateX(-50%) scale(.85); }
.u9 .u9-net.on .lb { transform: translateX(-50%); }
.u9 .u9-net .lb.left { transform: scale(.85); } .u9 .u9-net.on .lb.left { transform: none; }
.u9 .u9-net .lb.two { display: flex; flex-direction: column; align-items: center; text-align: center; }
.u9 .u9-net .lb.two b { font-weight: 600; }
.u9 .u9-net .lb.two span { font-size: 16px; font-weight: 400; color: rgba(255, 255, 255, .65); }
.u9 .u9-netlist { display: none; }

/* research tiles */
.u9 .u9-dash .rowB .tile { position: relative; flex: 1; min-width: 0; height: 520px; box-sizing: border-box; padding: 40px; display: flex; flex-direction: column; justify-content: flex-end;
  background: var(--night); color: #FFFFFF; overflow: hidden; box-shadow: 0 8px 24px rgba(51, 0, 153, .14); }
.u9 .u9-dash .tile .bg { position: absolute; left: 0; top: 0; width: 100%; height: 320px; object-fit: cover; opacity: .7;
  -webkit-mask-image: linear-gradient(180deg, #000 30%, transparent 100%); mask-image: linear-gradient(180deg, #000 30%, transparent 100%);
  transition: transform 1.6s var(--ease), opacity .6s ease; }
.u9 .u9-dash .tile figcaption { position: relative; display: flex; flex-direction: column; gap: 16px; }
.u9 .u9-dash .tile figcaption b { font-size: 96px; font-weight: 700; line-height: 96px; letter-spacing: -0.04em; white-space: nowrap; }
.u9 .u9-dash .tile figcaption p { font-size: 20px; line-height: 32px; color: rgba(255, 255, 255, .85); }
.u9 .u9-dash .tile figcaption span { margin-top: -8px; font-size: 16px; line-height: 24px; color: rgba(255, 255, 255, .5); }
.u9 .u9-dash .fca .badge { position: absolute; right: 40px; top: 40px; width: 160px; height: 160px; box-sizing: border-box; display: flex; align-items: center; justify-content: center;
  background: var(--night); border: 2px solid var(--pu); box-shadow: 0 0 40px rgba(138, 43, 227, .75); animation: u9-glow 3.2s ease-in-out infinite; }
.u9 .u9-dash .fca .badge img { width: 112px; height: 35px; object-fit: contain; }
@keyframes u9-glow { 50% { box-shadow: 0 0 56px rgba(138, 43, 227, .95); } }

/* 4-broker check (2178:674) */
.u9 .u9-mx { min-width: 900px; background: #FFFFFF; border: 1px solid #DBD9E5; }
.u9 .u9-mx .mr { display: grid; grid-template-columns: minmax(0, 416fr) repeat(4, minmax(0, 256fr)); border-bottom: 1px solid #DBD9E5; transition: background-color .25s ease; }
.u9 .u9-mx .mr:last-child { border-bottom: 0; }
.u9 .u9-mx .mr:not(.hd):hover { background: #FAF8FF; }
.u9 .u9-mx .c { display: flex; align-items: center; padding: 24px; }
.u9 .u9-mx .c.us { background: #EFEAFD; }
.u9 .u9-mx .hd .c.br { flex-direction: column; align-items: flex-start; justify-content: flex-start; gap: 8px; }
.u9 .u9-mx .lg { display: flex; align-items: center; min-height: 48px; }
.u9 .u9-mx .lg img { display: block; object-fit: contain; }
.u9 .u9-mx .pg { font-size: 16px; line-height: 24px; color: var(--mute); }
.u9 .u9-mx .q b { font-size: 18px; font-weight: 700; line-height: 24px; color: var(--ink2); }
.u9 .u9-mx .mk { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; box-sizing: border-box; border-radius: 16px !important;
  font-size: 16px; font-weight: 500; line-height: 24px; transform: scale(0); transition: transform .5s var(--pop); transition-delay: calc(var(--d) * 60ms + .2s); }
.u9 .u9-mx.on .mk { transform: none; }
.u9 .u9-mx .mk.y { background: #EBE8F2; color: var(--ink2); }
.u9 .u9-mx .mk.u { color: #9999A1; }
.u9 .u9-mx .mk.p.u { background: #FFFFFF; border: 2px solid var(--pu); color: var(--pu); }
.u9 .u9-mx .mk.n.u { background: #E5E5EB; color: var(--mute); }
.u9 .u9-legend { display: flex; flex-wrap: wrap; gap: 8px 24px; font-size: 16px; line-height: 24px; color: var(--mute); }
.u9 .u9-legend li { display: flex; gap: 8px; }
.u9 .u9-legend b { font-weight: 500; color: var(--ink2); } .u9 .u9-legend b.pu { color: var(--pu); }

/* define (2185:544): one board */
.u9 .u9-board { background: #FFFFFF; border: 1px solid rgba(0, 13, 15, .1); box-shadow: 0 16px 48px rgba(51, 0, 153, .06); overflow: hidden; }
.u9 .u9-board .who { display: flex; border-bottom: 1px solid rgba(0, 13, 15, .1); }
.u9 .u9-board .persona { flex: none; width: 560px; display: flex; flex-direction: column; gap: 16px; padding-bottom: 48px; background: var(--night); color: #FFFFFF; }
.u9 .u9-board .persona .ph { position: relative; height: 360px; overflow: hidden; }
.u9 .u9-board .persona .ph img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; }
.u9 .u9-board .persona .ph::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(19, 18, 26, 0) 60%, #13121A 100%); }
.u9 .u9-board .persona .tx { display: flex; flex-direction: column; gap: 12px; padding: 0 48px; }
.u9 .u9-board .persona h3 { font-size: 48px; font-weight: 700; line-height: 56px; letter-spacing: -0.03em; }
.u9 .u9-board .persona .q { font-size: 18px; font-weight: 500; line-height: 28px; color: rgba(255, 255, 255, .88); }
.u9 .u9-board .persona .note { font-size: 16px; line-height: 24px; color: rgba(255, 255, 255, .45); }
.u9 .u9-board .prob { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; gap: 48px; padding: 56px; }
.u9 .u9-board .ph2 { display: flex; flex-direction: column; gap: 16px; }
.u9 .u9-board .hmw { font-size: 40px; font-weight: 700; line-height: 52px; letter-spacing: -0.025em; color: var(--ink2); }
/* the highlight sweeps in once the line is on screen */
.u9 .u9-board .hmw mark { color: var(--ink2); background: linear-gradient(90deg, var(--pu), var(--pu)) no-repeat 0 0 / 0% 100%; -webkit-background-clip: text; background-clip: text;
  transition: background-size 1.4s var(--ease) .3s; }
.u9 .u9-board .hmw.on mark { background-size: 100% 100%; color: transparent; }
.u9 .u9-board .goals > div { display: flex; flex-direction: column; gap: 8px; padding: 24px 0; border-top: 1px solid rgba(0, 13, 15, .1); }
.u9 .u9-board .goals p:not(.eb) { font-size: 18px; line-height: 28px; color: rgba(0, 13, 15, .78); }

/* trust chart (2185:568): hover or tap a stage */
.u9 .u9-chartcard { display: flex; flex-direction: column; gap: 24px; padding: 56px; border-bottom: 1px solid rgba(0, 13, 15, .1); }
.u9 .u9-tc { min-width: 980px; display: flex; flex-direction: column; gap: 24px; }
.u9 .u9-tc.u9-tchd { min-width: 0; }
.u9 .u9-tc .hl { flex-wrap: wrap; row-gap: 8px; }
.u9 .u9-tc .hd { display: flex; flex-direction: column; gap: 8px; }
.u9 .u9-tc .sym { display: flex; align-items: center; gap: 8px; font-size: 16px; line-height: 24px; }
.u9 .u9-tc .sym i { width: 24px; height: 24px; border-radius: 50% !important; background: linear-gradient(90deg, #330099, #8A2BE3); }
.u9 .u9-tc .sym b { font-weight: 600; color: #0A0D14; } .u9 .u9-tc .sym span { color: var(--mute); }
.u9 .u9-tc .hl { display: flex; align-items: center; gap: 16px; }
.u9 .u9-tc .st { font-size: 48px; font-weight: 700; line-height: 56px; letter-spacing: -0.03em; color: #0A0D14; }
.u9 .u9-tc .tag { padding: 4px 12px; border-radius: 999px !important; font-size: 16px; font-weight: 500; line-height: 24px; white-space: nowrap; }
.u9 .u9-tc .tag.highest, .u9 .u9-tc .tag.high { background: #FCEBED; color: #DE3345; }
.u9 .u9-tc .tag.medium { background: #F2F2F5; color: var(--mute); }
.u9 .u9-tc .tag.low { background: #E6F6EE; color: #0A9E61; }
.u9 .u9-tc .meta { font-size: 16px; line-height: 24px; color: var(--mute); white-space: pre-wrap; }
.u9 .u9-tc .plot { display: grid; grid-template-columns: minmax(0, 1fr) 128px; }
.u9 .u9-tc .cols { position: relative; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); height: 344px; }
.u9 .u9-tc .ln { position: absolute; left: 0; top: 0; width: 100%; height: 272px; overflow: visible; pointer-events: none; z-index: 1; }
.u9 .u9-tc .neutral { stroke: rgba(102, 102, 110, 1); stroke-width: 1; stroke-dasharray: 4 4; }
.u9 .u9-tc .base { stroke: var(--line3); stroke-width: 1; }
.u9 .u9-tc .trend { fill: none; stroke: var(--pu); stroke-width: 3; stroke-linejoin: round; stroke-linecap: round; stroke-dasharray: 1 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.6s var(--ease) .3s; }
.u9 .u9-tc .area { opacity: 0; transition: opacity 1s ease 1.4s; }
.u9 .u9-tc.on .trend { stroke-dashoffset: 0; } .u9 .u9-tc.on .area { opacity: 1; }
.u9 .u9-tc .col { position: relative; height: 304px; align-self: start; padding: 0; background: transparent; border: 0; font: inherit; color: inherit; cursor: pointer; transition: background-color .3s ease; }
.u9 .u9-tc .col.sel { background: #F5F0FF; }
.u9 .u9-tc .col:focus-visible { outline: 2px solid var(--pu); outline-offset: -2px; }
.u9 .u9-tc .col .dot { position: absolute; left: 50%; z-index: 2; width: 10px; height: 10px; box-sizing: border-box; margin: -5px 0 0 -5px; border: 2px solid var(--pu); background: #FFFFFF;
  border-radius: 50% !important; transform: scale(0); transition: transform .5s var(--pop), width .25s ease, height .25s ease, margin .25s ease, border-width .25s ease, background-color .25s ease;
  transition-delay: calc(var(--d) * 160ms + .5s), 0s, 0s, 0s, 0s, 0s; }
.u9 .u9-tc.on .col .dot { transform: scale(1); }
.u9 .u9-tc .col.sel .dot { width: 16px; height: 16px; margin: -8px 0 0 -8px; border-width: 4px; background: var(--pu); }
.u9 .u9-tc .bar { position: absolute; left: 50%; top: 272px; width: 48px; margin-left: -24px; transform: translateY(-100%) scaleY(0); transform-origin: bottom;
  transition: transform .8s var(--ease), background-color .3s ease; transition-delay: calc(var(--d) * 120ms + .8s), 0s; }
.u9 .u9-tc.on .bar { transform: translateY(-100%) scaleY(1); }
.u9 .u9-tc .bar.high { background: rgba(222, 51, 69, .7); } .u9 .u9-tc .bar.highest { background: rgba(222, 51, 69, .7); }
.u9 .u9-tc .bar.highest.on, .u9 .u9-tc .bar.high.on { background: #DE3345; }
.u9 .u9-tc .bar.medium { background: rgba(199, 199, 204, .7); } .u9 .u9-tc .bar.medium.on { background: #A8A8AF; }
.u9 .u9-tc .bar.low { background: rgba(10, 158, 97, .7); } .u9 .u9-tc .bar.low.on { background: #0A9E61; }
.u9 .u9-tc .xl { position: absolute; left: 0; right: 0; top: 288px; display: flex; flex-direction: column; align-items: center; font-size: 16px; line-height: 24px; white-space: nowrap; }
.u9 .u9-tc .xl b { font-weight: 500; color: #0A0D14; } .u9 .u9-tc .xl span { color: var(--mute); }
.u9 .u9-tc .col.sel .xl b { font-weight: 600; color: var(--pu); }
.u9 .u9-tc .axis { position: relative; }
.u9 .u9-tc .axis span { position: absolute; left: 16px; font-size: 16px; line-height: 24px; color: var(--mute); white-space: nowrap; }
.u9 .u9-tc .axis .tagn { left: 12px; padding: 4px 12px; background: #0A0D14; color: #FFFFFF; font-weight: 500; border-radius: 999px !important; }

/* principles (2185:621) */
.u9 .u9-board .princ { display: flex; }
.u9 .u9-board .pc { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 32px; padding: 48px 40px 48px 56px; }
.u9 .u9-board .pc + .pc { border-left: 1px solid rgba(0, 13, 15, .1); }
.u9 .u9-board .pc .top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.u9 .u9-board .pc .top b { font-size: 48px; font-weight: 700; line-height: 48px; letter-spacing: -0.03em; color: var(--pu); }
.u9 .u9-board .pc .vis { flex: none; width: 200px; height: 120px; box-sizing: border-box; border: 1px solid rgba(0, 13, 15, .12); overflow: hidden; }
.u9 .u9-board .pc .vis img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; transition: transform 1s var(--ease); }
.u9 .u9-board .pc .vis.ic { display: flex; align-items: center; justify-content: center; background: rgba(138, 43, 227, .06); border-color: rgba(138, 43, 227, .3); }
.u9 .u9-board .pc .vis.ic svg { width: 48px; height: 48px; transition: transform .6s var(--pop); }
.u9 .u9-board .pc h4 { font-size: 24px; font-weight: 700; line-height: 32px; letter-spacing: -0.02em; color: var(--ink2); }

/* develop (2187:544): zigzag panels */
.u9 .u9-panels { display: flex; flex-direction: column; gap: 128px; margin-top: 128px; }
.u9 .u9-panels .pnl { display: flex; gap: 96px; align-items: flex-start; }
.u9 .u9-panels .pnl.rev { flex-direction: row-reverse; }
.u9 .u9-panels .pnl[data-r] { transform: translate3d(-48px, 0, 0); }
.u9 .u9-panels .pnl.rev[data-r] { transform: translate3d(48px, 0, 0); }
.u9 .u9-panels .pnl[data-r].r-in { transform: none; }
.u9 .u9-panels .tx { flex: none; width: 448px; display: flex; flex-direction: column; align-items: flex-start; gap: 24px; }
.u9 .u9-panels .lab { font-size: 16px; font-weight: 600; line-height: 24px; letter-spacing: .1em; text-transform: uppercase; color: var(--lav); }
.u9 .u9-panels .status { padding: 4px 12px; background: rgba(138, 43, 227, .16); border: 1px solid rgba(138, 43, 227, .5); font-size: 16px; font-weight: 600; line-height: 24px; letter-spacing: .05em; text-transform: uppercase; color: var(--lav); }
.u9 .u9-panels h3 { font-size: 28px; font-weight: 700; line-height: 36px; letter-spacing: -0.02em; color: #FFFFFF; }
.u9 .u9-panels .why { display: flex; flex-direction: column; gap: 8px; }
.u9 .u9-panels .why .k { font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: rgba(255, 255, 255, .5); }
.u9 .u9-panels .why p:not(.k) { font-size: 18px; line-height: 28px; color: rgba(255, 255, 255, .72); }
.u9 .u9-panels .scr { flex: 1; min-width: 0; border: 1px solid rgba(255, 255, 255, .12); overflow: hidden; position: relative; }
.u9 .u9-panels .scr.chat { aspect-ratio: 896 / 600; min-height: 592px; }
/* the live page in a frame */
.u9 .u9-live { display: flex; flex-direction: column; background: #FFFFFF; }
.u9 .u9-live .bar { display: flex; align-items: center; gap: 16px; height: 40px; padding: 0 16px; background: #1E1B26; border-bottom: 1px solid rgba(255, 255, 255, .12); font-size: 16px; line-height: 24px; }
.u9 .u9-live .dots { display: flex; gap: 6px; } .u9 .u9-live .dots i { width: 10px; height: 10px; border-radius: 50% !important; background: rgba(255, 255, 255, .24); }
.u9 .u9-live .url { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: rgba(255, 255, 255, .64); }
.u9 .u9-live .bar a { color: var(--lav); text-decoration: none; white-space: nowrap; }
.u9 .u9-live .bar a:hover, .u9 .u9-live .bar a:focus-visible { color: #FFFFFF; text-decoration: underline; }
.u9 .u9-live .view { position: relative; aspect-ratio: 896 / 600; min-height: 480px; overflow: hidden; background: #0B0B0D; }
.u9 .u9-live .sc { position: absolute; inset: 0; overflow: hidden; }
.u9 .u9-live .view.on .sc { overflow-y: auto; }
.u9 .u9-live .sc:focus-visible { outline: 2px solid var(--lav); outline-offset: -2px; }
.u9 .u9-live .sc img { display: block; width: 100%; height: auto; }
.u9 .u9-live .cover { position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: center; padding: 0 0 24px; margin: 0; border: 0; background: transparent; cursor: pointer; font: inherit; }
.u9 .u9-live .cover span { padding: 8px 16px; border-radius: 999px !important; background: rgba(11, 11, 13, .82); color: #FFFFFF; font-size: 16px; font-weight: 600; line-height: 24px; box-shadow: 0 8px 24px rgba(0, 0, 0, .3); transition: background-color .3s ease; }
.u9 .u9-live .cover:hover span, .u9 .u9-live .cover:focus-visible span { background: var(--pu); }
.u9 .u9-live .cover:focus-visible { outline: 2px solid var(--lav); outline-offset: -2px; }
/* the help chat, rebuilt from the live site (2187:593) — it works, nothing is sent */
.u9 .u9-help { position: absolute; inset: 0; background: linear-gradient(158deg, #140F1C 7%, #4D1F8C 79%); display: flex; justify-content: center; align-items: center; }
.u9 .u9-help .w { flex: none; width: 360px; max-width: calc(100% - 32px); height: 560px; max-height: calc(100% - 32px); box-sizing: border-box; display: flex; flex-direction: column; gap: 12px; padding: 16px; overflow: hidden;
  background: #F6F5FA; border-radius: 16px !important; box-shadow: 0 16px 40px rgba(0, 0, 0, .35); color: #1A1A1F; font-size: 16px; line-height: 24px;
  transform: translateY(40px) scale(.96); opacity: 0; transition: transform .9s var(--pop) .2s, opacity .5s ease .2s; }
.u9 .u9-help.on .w { transform: none; opacity: 1; }
.u9 .u9-help .top { flex: none; display: flex; gap: 8px; }
.u9 .u9-help .top > * { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; padding: 0; margin: 0; border: 0; background: #E0E0E0; border-radius: 50% !important; font: inherit; font-weight: 600; color: #1A1A1F; }
.u9 .u9-help .top button { cursor: pointer; transition: background-color .2s ease; }
.u9 .u9-help .top button:hover:not(:disabled) { background: #CFCFD6; }
.u9 .u9-help .top button:disabled { cursor: default; color: rgba(26, 26, 31, .35); }
.u9 .u9-help .body { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; overscroll-behavior: contain; }
.u9 .u9-help .away, .u9 .u9-help .form { background: #FFFFFF; border: 1px solid #E0E0E0; border-radius: 16px !important; padding: 16px; }
.u9 .u9-help .away { display: flex; align-items: center; gap: 16px; }
.u9 .u9-help .av { flex: none; padding: 8px; border: 1px solid #E0E0E0; border-radius: 24px !important; font-size: 18px; font-weight: 600; line-height: 32px; color: var(--pu); }
.u9 .u9-help .form { display: flex; flex-direction: column; gap: 8px; }
.u9 .u9-help label { display: flex; flex-direction: column; gap: 4px; }
.u9 .u9-help input { width: 100%; height: 36px; box-sizing: border-box; padding: 0 8px; background: #EDEDED; border: 1px solid #8C8C8C; border-radius: 6px !important; font: inherit; color: #1A1A1F; }
.u9 .u9-help input:focus { outline: 2px solid var(--pu); outline-offset: 0; background: #FFFFFF; }
.u9 .u9-help .err { color: #C62828; }
.u9 .u9-help .go { display: block; width: 100%; margin-top: 8px; padding: 8px 0; border: 0; background: var(--pu); border-radius: 12px !important; color: #FFFFFF; font: inherit; font-weight: 600; text-align: center; cursor: pointer; transition: background-color .3s ease; }
.u9 .u9-help .go:hover, .u9 .u9-help .go:focus-visible { background: #7520C7; }
.u9 .u9-help .msg { max-width: 85%; padding: 8px 12px; border-radius: 16px !important; overflow-wrap: anywhere; }
.u9 .u9-help .msg.them { align-self: flex-start; background: #FFFFFF; border: 1px solid #E0E0E0; }
.u9 .u9-help .msg.me { align-self: flex-end; background: var(--pu); color: #FFFFFF; }
.u9 .u9-help .compose { flex: none; display: flex; gap: 8px; }
.u9 .u9-help .compose input { height: 40px; background: #FFFFFF; border-color: #C9C9D1; border-radius: 20px !important; padding: 0 16px; }
.u9 .u9-help .compose button { flex: none; width: 40px; height: 40px; padding: 0; border: 0; border-radius: 50% !important; background: var(--pu); color: #FFFFFF; font: inherit; font-weight: 700; cursor: pointer; }
.u9 .u9-help .compose button:hover { background: #7520C7; }
.u9 .u9-help .pw { flex: none; color: var(--mute); }

/* documentation (2139:544) */
.u9 .u9-docsec { background: linear-gradient(0deg, #0D0A17 48%, #13121A 100%); color: #FFFFFF; }
.u9 .u9-docs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; padding-top: 32px; margin-top: 32px; }
.u9 .u9-docs .doc { display: flex; flex-direction: column; background: #161126; border: 1px solid rgba(255, 255, 255, .12);
  transition: opacity 1.2s var(--ease), transform .5s var(--ease), border-color .3s ease, box-shadow .5s ease; }
.u9 .u9-docs .vis { height: 288px; overflow: hidden; background: #1F1836; }
.u9 .u9-docs .vis img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 1.2s var(--ease); }
.u9 .u9-docs .tx { display: flex; flex-direction: column; gap: 16px; padding: 32px; }
.u9 .u9-docs .tx .k { color: #CCB8FA; letter-spacing: 0; }
.u9 .u9-docs h3 { font-size: 24px; font-weight: 700; line-height: 32px; }
.u9 .u9-docs .tx p:not(.k) { font-size: 18px; line-height: 32px; color: rgba(255, 255, 255, .72); }

/* deliver (2192:544): release volume */
.u9 .u9-rel { display: flex; flex-direction: column; gap: 80px; }
.u9 .u9-rel .hd { display: flex; align-items: flex-end; justify-content: space-between; gap: 48px; }
.u9 .u9-rel .tx { width: 760px; max-width: 100%; display: flex; flex-direction: column; gap: 16px; }
.u9 .u9-rel h3 { font-size: 48px; font-weight: 700; line-height: 56px; letter-spacing: -0.03em; color: var(--ink2); }
.u9 .u9-rel .tx p { font-size: 20px; line-height: 32px; color: rgba(0, 13, 15, .6); }
.u9 .u9-rel .tot { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; white-space: nowrap; }
.u9 .u9-rel .tot b { font-size: 96px; font-weight: 700; line-height: 96px; letter-spacing: -0.04em; color: var(--pu); font-variant-numeric: tabular-nums; }
.u9 .u9-rel .tot span { font-size: 16px; font-weight: 600; line-height: 24px; letter-spacing: .1em; text-transform: uppercase; color: rgba(0, 13, 15, .6); }
.u9 .u9-rel .vol { display: flex; min-width: 840px; }
.u9 .u9-rel .vol li { flex: 1; min-width: 0; display: flex; flex-direction: column; transition: opacity .3s ease; }
.u9 .u9-rel .vol.hov li:not(.hot) { opacity: .4; }
.u9 .u9-rel .area { height: 216px; display: flex; flex-direction: column; justify-content: flex-end; padding-right: 8px; }
.u9 .u9-rel .bar { box-sizing: border-box; padding: 16px 16px 0; background: rgba(0, 13, 15, .08); transform: scaleY(0); transform-origin: bottom;
  transition: transform .9s var(--ease), filter .3s ease; transition-delay: calc(var(--d) * 120ms + .2s), 0s; }
.u9 .u9-rel.on .bar { transform: none; }
.u9 .u9-rel .bar.hi { background: linear-gradient(180deg, #8A2BE3, #330099); }
.u9 .u9-rel .vol li.hot .bar { filter: brightness(1.12); }
.u9 .u9-rel .bar b { display: block; font-size: 32px; font-weight: 700; line-height: 40px; letter-spacing: -0.03em; color: rgba(0, 13, 15, .6); }
.u9 .u9-rel .bar.hi b { color: #FFFFFF; }
.u9 .u9-rel .info { display: flex; flex-direction: column; gap: 16px; padding: 24px 8px 0 0; box-shadow: inset 0 1px 0 rgba(0, 13, 15, .2); }
.u9 .u9-rel .info .m { font-size: 16px; font-weight: 600; line-height: 24px; letter-spacing: .05em; text-transform: uppercase; color: rgba(0, 13, 15, .5); }
.u9 .u9-rel li.hi .info .m { color: var(--pu); }
.u9 .u9-rel .its { display: flex; flex-direction: column; gap: 8px; }
.u9 .u9-rel .its p { font-size: 18px; line-height: 28px; color: rgba(0, 13, 15, .6); }
.u9 .u9-rel li.hi .its p { color: rgba(0, 13, 15, .85); }

/* test (2133:17788) */
.u9 .u9-check { display: flex; flex-direction: column; gap: 32px; }
.u9 .u9-check .sh { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.u9 .u9-check h4 { font-size: 24px; font-weight: 700; line-height: 32px; color: var(--ink); }
.u9 .u9-check .who { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.u9 .u9-check .who li { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #FFFFFF; border: 1px solid var(--line);
  font-size: 16px; font-weight: 500; line-height: 24px; color: var(--ink); transition: border-color .3s ease, transform .4s var(--ease); }
.u9 .u9-check .who .ph { flex: none; width: 48px; height: 48px; overflow: hidden; background: #EFEAFD; color: var(--pu); }
.u9 .u9-check .who .ph img { display: block; width: 100%; height: 100%; object-fit: cover; }
.u9 .u9-check .who .ph svg { display: block; width: 100%; height: 100%; }
.u9 .u9-check .asked { display: flex; flex-direction: column; gap: 16px; padding: 32px; background: #FFFFFF; border: 1px solid var(--line); }
.u9 .u9-check .asked .k, .u9 .u9-plan .k { color: var(--pu); letter-spacing: 0; }
.u9 .u9-check .asked p:not(.k) { font-size: 18px; line-height: 32px; color: var(--ink); }
.u9 .u9-plan { display: flex; gap: 24px; align-items: stretch; }
.u9 .u9-plan > * { flex: 1; min-width: 0; }
.u9 .u9-plan .tasks { display: flex; flex-direction: column; gap: 16px; }
.u9 .u9-plan .tk { display: flex; flex-direction: column; gap: 8px; padding: 24px 32px; border: 1px solid var(--line); transition: background-color .3s ease, border-color .3s ease; }
.u9 .u9-plan .tk .k { letter-spacing: .06em; }
.u9 .u9-plan .tk p:not(.k) { font-size: 18px; line-height: 32px; color: var(--ink); }
.u9 .u9-plan .ms { display: flex; flex-direction: column; gap: 8px; padding: 24px 32px; background: #F0EBFC; }
.u9 .u9-plan .ms p:not(.k) { font-size: 18px; font-weight: 600; line-height: 32px; color: var(--ink); }

/* Fogg chart (2133:17842) */
.u9 .u9-fogg { display: flex; flex-direction: column; gap: 16px; padding: 32px; background: #FFFFFF; border: 1px solid var(--line); overflow: hidden; }
.u9 .u9-fogg .fh { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.u9 .u9-fogg .fh .k { color: var(--pu); letter-spacing: 0; }
.u9 .u9-fogg .fc { position: relative; height: 400px; margin-right: -32px; }
.u9 .u9-fogg .zone { position: absolute; left: 48px; right: 0; top: 24px; height: 328px; background: rgba(240, 235, 252, .6);
  box-shadow: inset 2px 0 0 #CCC9D1, inset 0 -2px 0 #CCC9D1; }
.u9 .u9-fogg .act { position: absolute; left: 80px; right: 15px; top: 40px; height: 288px; overflow: visible; }
.u9 .u9-fogg .act path { fill: none; stroke: var(--pu); stroke-width: 3; stroke-dasharray: 1 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.6s var(--ease) .2s; }
.u9 .u9-fogg .fc.on .act path { stroke-dashoffset: 0; }
.u9 .u9-fogg .t { position: absolute; font-size: 16px; line-height: 24px; white-space: nowrap; }
.u9 .u9-fogg .mot { left: 56px; top: -8px; font-weight: 500; color: var(--mute); }
.u9 .u9-fogg .abl { right: 32px; top: 360px; font-weight: 500; color: var(--mute); }
.u9 .u9-fogg .hard { left: 48px; top: 360px; color: var(--mute); }
.u9 .u9-fogg .al { left: 32%; top: 136px; font-weight: 600; color: var(--pu); }
.u9 .u9-fogg .above { right: 48px; top: 48px; color: var(--pu); }
.u9 .u9-fogg .lt { left: 64px; top: 280px; font-weight: 600; color: #DE3345; }
.u9 .u9-fogg .lr { right: calc(19% - 8px); top: 192px; font-weight: 600; color: var(--pu); text-align: right; }
.u9 .u9-fogg .pt { position: absolute; top: 252px; width: 24px; height: 24px; box-sizing: border-box; border: 3px solid #FFFFFF; border-radius: 50% !important; }
.u9 .u9-fogg .pt.today { left: 172px; background: #DE3345; }
.u9 .u9-fogg .pt.redo { left: calc(81% - 12px); background: var(--pu); transform: scale(0); transition: transform .5s var(--pop) 2.6s; }
.u9 .u9-fogg .fc.on .pt.redo { transform: none; animation: u9-ping 2.4s ease-out 3.2s infinite; }
@keyframes u9-ping { 0% { box-shadow: 0 0 0 0 rgba(138, 43, 227, .45); } 70%, 100% { box-shadow: 0 0 0 14px rgba(138, 43, 227, 0); } }
.u9 .u9-fogg .arrow { position: absolute; left: 200px; right: calc(19% + 8px); top: 257px; height: 15px; transform: scaleX(0); transform-origin: left; transition: transform 1s var(--ease) 1.6s;
  background: linear-gradient(90deg, var(--pu) 50%, transparent 0) repeat-x 0 7px / 12px 1px; }
.u9 .u9-fogg .arrow::after { content: ""; position: absolute; right: 0; top: 2px; width: 8px; height: 8px; border-top: 2px solid var(--pu); border-right: 2px solid var(--pu); transform: rotate(45deg); }
.u9 .u9-fogg .fc.on .arrow { transform: none; }
.u9 .u9-fogg .lr { opacity: 0; transition: opacity .6s ease 2.8s; } .u9 .u9-fogg .fc.on .lr { opacity: 1; }
.u9 .u9-fogg .cap { font-size: 16px; line-height: 24px; color: var(--mute); }

/* takeaways (2133:17879): photo runs off the top and right, fading in from the left */
.u9 .u9-take { position: relative; overflow: hidden; min-height: 588px; box-sizing: border-box; padding: 120px 0; background: var(--night2); color: #FFFFFF; }
.u9 .u9-take-ph { position: absolute; top: -115px; right: -3.54vw; display: block; width: 614px; height: 819px; object-fit: cover; pointer-events: none;
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 32%, #000 100%); mask-image: linear-gradient(90deg, transparent 0, #000 32%, #000 100%); }
.u9 .u9-take-in { position: relative; z-index: 1; max-width: 960px; }
.u9 .u9-take-k { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; line-height: 24px; letter-spacing: .04em; color: #99999E; }
.u9 .u9-take-k i { flex: none; width: 16px; height: 16px; background: #99999E; }
.u9 .u9-take .t { margin-top: 24px; font-size: 56px; font-weight: 700; line-height: 64px; letter-spacing: -0.02em; color: #FFFFFF; }
.u9 .u9-take .dd { margin-top: 48px; font-size: 20px; font-weight: 500; line-height: 32px; color: rgba(255, 255, 255, .72); }

/* next case study */
.u9 .u9-next { background: var(--off, #F5F5F2); }
.u9 .u9-next .next-card { display: flex; flex-direction: column; gap: 16px; padding: 140px 0; color: var(--ink); text-decoration: none; }
.u9 .u9-next .next-name { font-size: clamp(56px, 6vw, 112px); font-weight: 300; letter-spacing: -0.04em; line-height: 1; transition: transform .3s ease-out; }
.u9 .u9-next .next-card:hover .next-name { transform: translateX(8px); }

/* ---- laptops ---- */
@media (max-width: 1600px) {
  .u9 .u9-take-in { max-width: min(960px, calc(100vw - 660px)); }
}
@media (max-width: 1439px) {
  .u9 .u9-dash .faced { width: 400px; }
  .u9 .u9-dash .yr b { font-size: 128px; line-height: 128px; }
  .u9 .u9-dash .rowB .tile figcaption b { font-size: 72px; line-height: 80px; }
  .u9 .u9-board .persona { width: 460px; }
  .u9 .u9-panels .pnl { gap: 64px; }
  .u9 .u9-panels .tx { width: 380px; }
}
@media (max-width: 1279px) {
  .u9 .u9-take-ph { width: 480px; height: 640px; top: -60px; right: -24px; }
  .u9 .u9-take-in { max-width: calc(100vw - 600px); }
  .u9 .u9-take .t { font-size: 48px; line-height: 56px; }
  .u9 .u9-rt { width: 280px; }
  .u9 .u9-dash .rowA { flex-direction: column; }
  .u9 .u9-dash .faced { width: auto; }
  .u9 .u9-dash .yr { margin-top: 48px; }
  .u9 .u9-dash .rowB .tile { height: 440px; padding: 32px; }
  .u9 .u9-dash .fca .badge { right: 32px; top: 32px; width: 128px; height: 128px; }
  .u9 .u9-dash .rowB .tile figcaption b { font-size: 56px; line-height: 64px; }
  .u9 .u9-dash .rowB .tile figcaption p { font-size: 18px; line-height: 28px; }
  .u9 .u9-board .who { flex-direction: column; }
  .u9 .u9-board .persona { width: auto; }
  .u9 .u9-board .persona .ph { height: 420px; }
  .u9 .u9-board .pc { padding: 40px 32px; gap: 24px; }
  .u9 .u9-board .pc .vis { width: 160px; height: 96px; }
  .u9 .u9-board .pc .top b { font-size: 40px; line-height: 40px; }
  .u9 .u9-docs .vis { height: 220px; }
  .u9 .u9-plan { flex-direction: column; }
  .u9 .u9-check .who { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 1023px) {
  .u9 .u9-row { flex-direction: column; gap: 16px; }
  .u9 .u9-rt { width: auto; }
  .u9 .u9-steps { flex-wrap: wrap; row-gap: 48px; box-shadow: none; }
  .u9 .u9-steps .stp { flex: 1 1 calc(50% - 12px); }
  .u9 .u9-dash .rowB { flex-direction: column; }
  .u9 .u9-panels { gap: 96px; margin-top: 96px; }
  .u9 .u9-panels .pnl, .u9 .u9-panels .pnl.rev { flex-direction: column; gap: 32px; }
  .u9 .u9-panels .tx { width: auto; }
  .u9 .u9-panels .scr { width: 100%; flex: none; }
  .u9 .u9-board .princ { flex-direction: column; }
  .u9 .u9-board .pc + .pc { border-left: 0; border-top: 1px solid rgba(0, 13, 15, .1); }
  .u9 .u9-docs { grid-template-columns: minmax(0, 1fr); }
  .u9 .u9-docs .vis { height: 288px; }
  .u9 .u9-rel .hd { flex-direction: column; align-items: flex-start; }
  .u9 .u9-rel .tot { align-items: flex-start; }
  .u9 .u9-tscroll { margin-right: calc((100vw - 100%) / -2); padding-right: 16px; }
  .u9 .u9-take { display: flex; flex-direction: column; min-height: 0; padding: 96px 0 0; }
  .u9 .u9-take-in { max-width: none; }
  .u9 .u9-take-ph { position: relative; order: 2; top: auto; right: auto; width: 100%; max-width: 560px; height: auto; aspect-ratio: 614 / 819; margin: 48px 0 0 auto;
    -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 24%); mask-image: linear-gradient(180deg, transparent 0, #000 24%); }
}
/* ---- phones (the site's phone type scale, index.css) ---- */
@media (max-width: 700px) {
  .u9 .u9-netfit { display: none; }
  .u9 .u9-netlist { display: flex; flex-direction: column; gap: 12px; padding: 24px; background: rgba(255, 255, 255, .08); border: 1px solid rgba(255, 255, 255, .2);
    font-size: 16px; line-height: 24px; color: rgba(255, 255, 255, .85); }
  .u9 .u9-netlist b { font-weight: 600; color: #FFFFFF; }
}
@media (max-width: 600px) {
  .u9 .u9-w { width: calc(100vw - 40px); }
  .u9 .u9-hero { padding: 96px 0 56px; }
  .u9 .u9-h1 { font-size: 32px; line-height: 40px; }
  .u9 .u9-btn { width: 100%; }
  .u9 .u9-slot { margin-left: -20px; margin-right: -20px; }
  .u9 .u9-meta { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .u9 .u9-meta p, .u9 .u9-body { font-size: 16px; line-height: 26px; }
  .u9 .u9-sec { padding: 64px 0; }
  .u9 .mt96, .u9 .mt128 { margin-top: 56px; } .u9 .mt64 { margin-top: 40px; } .u9 .pt64 { padding-top: 32px; }
  .u9 .u9-rows { gap: 40px; }
  .u9 .u9-h2, .u9 .u9-h2.big, .u9 .u9-rel h3 { font-size: 28px; line-height: 36px; }
  .u9 .u9-rt, .u9 .u9-steps h3, .u9 .u9-panels h3, .u9 .u9-docs h3, .u9 .u9-check h4, .u9 .u9-board .pc h4 { font-size: 20px; line-height: 28px; }
  .u9 .u9-lead, .u9 .u9-dash .lead, .u9 .u9-rel .tx p { font-size: 18px; line-height: 28px; }
  .u9 .u9-stats { flex-direction: column; gap: 24px; }
  .u9 .u9-stats .st { padding: 0; }
  .u9 .u9-stats .n { font-size: 40px; line-height: 48px; }
  .u9 .u9-steps .stp { flex-basis: 100%; }
  .u9 .u9-dash .broker, .u9 .u9-dash .faced { padding: 24px; }
  .u9 .u9-dash .big, .u9 .u9-board .persona h3, .u9 .u9-tc .st { font-size: 28px; line-height: 36px; }
  .u9 .u9-dash .yr b { font-size: 80px; line-height: 88px; }
  .u9 .u9-dash .rowB .tile { height: auto; padding: 200px 24px 24px; }
  .u9 .u9-dash .rowB .tile.fca { padding-top: 160px; }
  .u9 .u9-dash .tile .bg { height: 240px; }
  .u9 .u9-dash .rowB .tile figcaption b { font-size: 40px; line-height: 48px; }
  .u9 .u9-dash .fca .badge { right: 24px; top: 24px; width: 112px; height: 112px; }
  .u9 .u9-dash .fca .badge img { width: 88px; height: 28px; }
  .u9 .u9-board .persona .ph { height: 280px; }
  .u9 .u9-board .persona .tx { padding: 0 24px; }
  .u9 .u9-board .prob, .u9 .u9-chartcard { padding: 24px; }
  .u9 .u9-board .hmw { font-size: 24px; line-height: 32px; }
  .u9 .u9-board .pc { flex-direction: column; align-items: flex-start; padding: 24px; gap: 16px; }
  .u9 .u9-board .pc .top { flex-direction: row; width: 100%; }
  .u9 .u9-board .pc .vis { width: 160px; height: 96px; }
  .u9 .u9-panels .scr { align-self: stretch; margin-left: -20px; margin-right: -20px; width: auto; }
  .u9 .u9-panels .scr.chat { aspect-ratio: auto; height: 600px; min-height: 0; }
  .u9 .u9-live .view { aspect-ratio: auto; height: 560px; }
  .u9 .u9-help .w { width: 300px; transform-origin: center; }
  .u9 .u9-docs .vis { height: 220px; }
  .u9 .u9-docs .tx { padding: 24px; }
  .u9 .u9-docs .tx p:not(.k) { font-size: 16px; line-height: 26px; }
  .u9 .u9-rel { gap: 48px; }
  .u9 .u9-rel .tot b { font-size: 64px; line-height: 64px; }
  .u9 .u9-check .who { grid-template-columns: minmax(0, 1fr); }
  .u9 .u9-check .asked, .u9 .u9-fogg { padding: 24px; }
  .u9 .u9-fogg .fc { margin-right: -24px; min-width: 460px; }
  .u9 .u9-fogg { overflow-x: auto; }
  .u9 .u9-plan .tk, .u9 .u9-plan .ms { padding: 24px; }
  .u9 .u9-take { padding-top: 64px; }
  .u9 .u9-take .t { font-size: 28px; line-height: 36px; }
  .u9 .u9-take .dd { margin-top: 32px; font-size: 18px; line-height: 28px; }
  .u9 .u9-next .next-card { padding: 64px 0; }
}
@media (prefers-reduced-motion: reduce) {
  .u9 [data-r], .u9 .u9-steps *, .u9 .u9-net *, .u9 .u9-mx .mk, .u9 .u9-tc *, .u9 .u9-rel *, .u9 .u9-fogg *, .u9 .u9-help * { transition: none !important; animation: none !important; }
  .u9 [data-r] { opacity: 1 !important; transform: none !important; }
}
`
