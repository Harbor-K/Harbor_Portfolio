import React, { useEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { SideToc, useHeadroom } from './CaseNav'
import { SiteHeaderB } from './SiteHeaderB'
import { CaseFilm, useCaseIntro } from './CaseFilm'
import { E5_CSS, E6_CSS } from './EtoV6Css'
import { LOGO_PATHS, FLAG_SVG, type FlagKey } from './EtoV6Data'
import { DashTour } from './EtoTour'
import { ProtoFrame } from './EtoProto'

/**
 * ETO Markets case study (v30, Harbor Nov 22) — rebuilt from Harbor's Figma "06 ETO Markets — 1920 · v3" in file
 * 9eRSsfAhsJk0OmvJdrxZ6E (node 2036:1186). Copy is the frame's, word for word. EtoV5.tsx stays in the design, unused.
 *
 * New in this version (Figma): the ETO logo in the hero and new TIMELINE / MY ROLE / SCOPE copy; Context draws the CRM
 * between clients and IBs (3 × 3 objects, client / shared / IB side); the benchmark is the spreadsheet it was; the
 * research photos sit on a dark board; Define shows three rule cards with small wireframes flowing into one question;
 * the IB dashboard shows the 22 redesigned pages as a moving stack and the portal menu changing from 2022 to the redesign.
 * Kept from v5 (Harbor: keep the AS-IS → TO-BE section as it was): "Same data, new order" and its pinned slider, plus the
 * old-portal pins, results, takeaways and next.
 * Nov 23 (Harbor): no inner scrollbars (the sheet and the menu canvas scale to fit), the menu change pins and plays
 * over a longer scroll, the CRM core shows the ETO logo with "CRM · one portal", and Prototype is the Figma's
 * browser + phone with the live Figma prototypes (Figma 2341:527; posters in assets/eto/v8). "Where it started" uses the
 * Figma's 16 photos (2319:19499) and they can be dragged around. The IB dashboard's 22-page stack is replaced by the
 * Figma's dashboard tour (2358:2059, EtoTour.tsx), four screens that change as you scroll.
 * Nov 24 (Harbor): Prototype plays a 10 s walkthrough video in the browser and the phone (EtoProto.tsx) and links to the
 * Figma files, instead of loading Figma's embed player. Heading "See every screen" (Harbor's copy).
 *
 * Interactions: the CRM flows and Define's flows draw in when they scroll into view; the dashboard tour changes screen
 * as you scroll (the Figma loops it every 20 s); the menu changes one step at a time as you scroll (before → new menu → columns move →
 * items and tags → legend); the spreadsheet's totals and logos select a broker's column and show its formula; Define's
 * pins scroll back to the old portal and pulse the pin. No hover effects for show. Everything is static with
 * prefers-reduced-motion.
 * Type: Roboto only (the Figma's Roboto Mono and Carlito are set in Roboto). Assets: v3 / v5 / v6 as before, v7 for this
 * version (research photos — see RES_PHOTOS), v8 for the prototype posters, v9 for the dashboard tour (EtoTour.tsx).
 */

const A3 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/v3/'
const A5 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/v5/'
const IMG = {
  video: A3 + 'intro-v6.mp4',
  poster: A3 + 'intro-v6-poster.jpg',
  oldPortal: A5 + 'old-portal.webp',
  office: A5 + 'takeaways-office.jpg',
}
/* Nov 24 (Harbor): the buttons open the Figma design files with every screen */
const PROTO = {
  desktop: 'https://www.figma.com/design/wXNPL3ciw6XhyL58xAFyLI/CRM-Dashboard?node-id=0-1',
  mobile: 'https://www.figma.com/design/UBqiuXF7C6Xsfwtb10iVFj/ETO_Application?node-id=1129-23847',
}
const NEXT = { name: 'Trust Bank', href: '#/trust-bank' }
const FILM_LABEL = 'ETO Markets intro film: the partner CRM — every account, client, deposit and rebate in order; share a link, sign up, done; system errors down from 60% to 14%. Ends on: a CRM for partners.'
export const E6_CHAPTERS = ['Overview', 'Context', 'Discover', 'Define', 'IB dashboard', 'Before → After', 'Prototype', 'Results', 'Takeaways']

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- small parts ---------- */

function Label({ children, light = false, red = false }: { children: string; light?: boolean; red?: boolean }) {
  return <div className={'e5-label' + (light ? ' light' : '') + (red ? ' red' : '')}><i aria-hidden="true" />{children}</div>
}

function Pic({ src, alt, w, h, className = '', eager = false }: { src: string; alt: string; w: number; h: number; className?: string; eager?: boolean }) {
  return <img className={'e5-img ' + className} src={src} alt={alt} width={w} height={h} loading={eager ? 'eager' : 'lazy'} decoding="async" />
}

/** Figma's "canvas" frames: soft pink, dotted, a thin line and four corner handles */
function Canvas({ children, className = '', id, label, labelTone }: { children: React.ReactNode; className?: string; id?: string; label?: string; labelTone?: 'red' | 'purple' | 'ink' }) {
  return (
    <div className={'e5-canvas ' + className} id={id}>
      <span className="hd tl" aria-hidden="true" /><span className="hd tr" aria-hidden="true" />
      <span className="hd bl" aria-hidden="true" /><span className="hd br" aria-hidden="true" />
      {label && <div className={'e5-canvas-k ' + (labelTone || 'ink')}>{label}</div>}
      {children}
    </div>
  )
}

/** numbers stay as they are (Nov 19, Harbor: no count-up) */
function Count({ value, className }: { value: string; className?: string }) {
  return <span className={className} data-count={value}>{value}</span>
}

const IMPACT = [
  { n: '77%', c: 'fewer system errors' },
  { n: '2×', c: 'user tracking' },
  { n: '3×', c: 'countries served' },
]

/* Discover: pin centres on the 1440 × 620 canvas */
const PINS = [
  { n: 1, x: 460 / 1440, y: 152 / 620 },
  { n: 2, x: 340 / 1440, y: 322 / 620 },
  { n: 3, x: 988 / 1440, y: 230 / 620 },
]

const BROKERS = [
  { name: 'Pepperstone', logo: A5 + 'logo-pepperstone.webp' },
  { name: 'TMGM', logo: A5 + 'logo-tmgm.webp' },
  { name: 'PU Prime', logo: A5 + 'logo-puprime.webp' },
  { name: 'IC Markets Global', logo: A5 + 'logo-icmarkets.webp' },
]

const RULES_DEFINE: { t: string; d: string }[] = [
  { t: 'Lead with what the IB came for', d: 'Clients who need help and today’s rebate come first.' },
  { t: 'One screen, one job', d: 'Registration, deposit and withdrawal each get their own tab.' },
  { t: 'Same number, same format', d: 'Balance, equity, margin and rebates look the same everywhere.' },
]

/* the portal menu, before and after */
type Tag = 'New' | 'Split' | 'Moved' | 'Renamed'
type MenuCol = { h: string; tag?: Tag; items: { t: string; tag?: Tag }[] }
const MENU_BEFORE: MenuCol[] = [
  { h: 'Header', items: [{ t: 'Account email ▾' }, { t: 'Mail' }, { t: 'Logout' }, { t: 'Select language' }] },
  { h: 'Dashboard', items: [{ t: 'Trading accounts' }, { t: 'Agent registration link + QR' }, { t: 'Customer registration link + QR' }] },
  { h: 'Inbox', items: [{ t: 'Registration, deposit and withdrawal in one list' }] },
  { h: 'My Clients ▾', items: [{ t: 'Monitor your clients’ activities' }] },
  { h: 'My Account ▾', items: [{ t: 'Account management services' }] },
  { h: 'Download', items: [{ t: 'Platforms & documents' }] },
  { h: 'Client Support ▾', items: [{ t: 'Client help center' }] },
]
const MENU_AFTER: MenuCol[] = [
  { h: 'Header & bar', items: [{ t: 'Deposit Now', tag: 'New' }, { t: 'My Profile · Change Password · Log out' }, { t: 'Language · 9' }, { t: 'ETO Blog bar', tag: 'New' }] },
  { h: 'Dashboard', tag: 'Split', items: [{ t: 'Account' }, { t: 'Summary' }, { t: 'Registration Link' }] },
  { h: 'Inbox', tag: 'Split', items: [{ t: 'Registration' }, { t: 'Deposit' }, { t: 'Withdrawal' }] },
  { h: 'Download', tag: 'Moved', items: [] },
  { h: 'My Clients', items: ['Management', 'Deposits', 'Withdrawals', 'Transfers', 'Open Positions', 'Closed Trades', 'IB Rebate Brief', 'Pending List'].map(t => ({ t })) },
  { h: 'My Account', items: [{ t: 'Deposit' }] },
  { h: 'Contact Us', tag: 'Renamed', items: [] },
]
const TAG_LEGEND: { tag: Tag; d: string }[] = [
  { tag: 'New', d: 'New in the redesign' },
  { tag: 'Split', d: 'One page became tabs' },
  { tag: 'Moved', d: 'New place in the menu' },
  { tag: 'Renamed', d: 'Same role, new name' },
]

// Before → After slides (unchanged from v5 — Harbor Nov 22: keep this section as it was). Each slide is a dark panel with
// the 2022 screen and the redesign cropped from the same part of the screen at the same scale, the 2022 crop dimmed, and
// leader-line notes on what changed. Crops: assets/eto/v6 (2x).
const BA = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/v6/'
type BANote = { y: number; t: string }
type BASlide = { n: string; t: string; d: string; k: string; h: number; full: number; notes: BANote[]; altB: string; altA: string }
const SLIDES: BASlide[] = [
  { n: '01', t: 'Dashboard', d: 'Its pieces now sit in tabs, with a deposit button in the header and a rebate chart.', k: 'dash', h: 510, full: 510,
    notes: [{ y: 36.5, t: 'Account and links split into tabs' }, { y: 290.5, t: 'Role tags: SM · TR · AM · IB' }, { y: 412.5, t: 'Rebate summary replaces the long links' }],
    altB: 'Dashboard in 2022: the trading accounts table above a long agent registration link',
    altA: 'Redesigned dashboard: Account and Summary tabs, a trading account table with SM, TR, AM and IB role tags, and the Rebate Summary heading' },
  { n: '02', t: 'Inbox', d: 'Registration, deposit and withdrawal were on one page. Each now has its own tab.', k: 'inbox', h: 355, full: 355,
    notes: [{ y: 61.5, t: 'One tab per request type' }, { y: 191.5, t: 'One table row per client, no detail pane' }],
    altB: 'Inbox in 2022: registration and deposit messages mixed in one long list',
    altA: 'Redesigned inbox: Registration, Deposit and Withdrawal tabs over a table with one row per client' },
  { n: '03', t: 'Tablet', d: 'Payment options became buttons, and the account list became cards with the key figures on top.', k: 'tablet', h: 232, full: 232,
    notes: [{ y: 19.5, t: 'Payment options as buttons' }, { y: 59.5, t: 'Internal names cleaned up' }, { y: 140.5, t: 'Grouped by currency first' }],
    altB: 'Tablet deposit methods in 2022: large tiles for Union Pay, Union Pay Backup, SEA Internet Banking and VND Payment',
    altA: 'Redesigned tablet deposit methods: small buttons grouped by currency (USDT, CNY, VND, THB)' },
  { n: '04', t: 'Mobile', d: 'Account details and the QR code moved to their own pages. Tables became cards; a tap reveals the totals.', k: 'mobile', h: 480, full: 600,
    notes: [{ y: 36.5, t: 'QR and links on their own tab' }, { y: 223.5, t: 'Account table becomes a card' }, { y: 350.5, t: 'Rebate summary in one column' }],
    altB: 'Mobile dashboard in 2022: a cramped account table, the agent registration link and a QR code on one page',
    altA: 'Redesigned mobile dashboard: tabs at the top, the account as a card with balance, equity and margin level, and the rebate summary in one column' },
]

type RKey = 'warn' | 'user' | 'globe'
const RESULTS: { k: string; icon: RKey; big: string; d: string; before: number; after: number; rings: boolean }[] = [
  { k: 'SYSTEM ERRORS', icon: 'warn', big: '77% fewer', d: 'Error frequency dropped from 60% to 14%.', before: 60, after: 14, rings: true },
  { k: 'USER TRACKING', icon: 'user', big: '2×', d: 'Tracked users rose from 15% to 30%.', before: 15, after: 30, rings: true },
  { k: 'COUNTRIES SERVED', icon: 'globe', big: '3×', d: 'The CRM went from 3 countries to 9.', before: 3, after: 9, rings: false },
]
/* languages the portal served, shown as flags (Figma 2353:861): before = English, Simplified and Traditional Chinese */
const FLAGS_BEFORE: FlagKey[] = ['au', 'cn', 'cn']
const FLAGS_AFTER: FlagKey[] = ['au', 'cn', 'cn', 'vn', 'id', 'kr', 'th', 'my', 'ph']
const FLAG_NAME: Record<FlagKey, string> = { au: 'English', cn: 'Chinese', vn: 'Vietnamese', id: 'Indonesian', kr: 'Korean', th: 'Thai', my: 'Malay', ph: 'Filipino' }

/** a progress ring (Figma 2353:831, 136 px): grey for the old figure, red for the new one; it fills when the cards come in */
function Ring({ v, now = false }: { v: number; now?: boolean }) {
  const C = 2 * Math.PI * 61
  return (
    <span className={'ring' + (now ? ' now' : '')}>
      <svg viewBox="0 0 136 136" width="136" height="136" aria-hidden="true">
        <circle cx="68" cy="68" r="61" fill="none" stroke="#F3EAEB" strokeWidth="14" />
        <circle className="arc" cx="68" cy="68" r="61" fill="none" strokeWidth="14" transform="rotate(-90 68 68)"
          strokeDasharray={`${C}`} style={{ '--off': `${C * (1 - v / 100)}`, '--c': `${C}` } as React.CSSProperties} />
      </svg>
      <b>{v}%</b>
    </span>
  )
}

/** small line icons on the result labels (Figma 2352:1036 / 1172 / 1223) */
function RIcon({ k }: { k: RKey }) {
  const d = k === 'warn' ? 'M10 3.5 2.5 16.5h15L10 3.5ZM10 8.5v3.5M10 14.2v.1'
    : k === 'user' ? 'M10 10a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM3.75 16.5c.6-2.9 3.1-4.5 6.25-4.5s5.65 1.6 6.25 4.5'
    : 'M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM2.5 10h15M10 2.5c2 2.1 3 4.6 3 7.5s-1 5.4-3 7.5c-2-2.1-3-4.6-3-7.5s1-5.4 3-7.5Z'
  return <svg className="ic" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d={d} fill="none" stroke="#8E8E95" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

/** one Before → After panel (Figma 2087:1492): BEFORE · 2022 and AFTER crops side by side, notes with leader lines */
function BAPanel({ s, eager }: { s: BASlide; eager: boolean }) {
  const px = (v: number) => `calc(${v} * var(--u))`
  const crop = (w: 'before' | 'after') => (
    <div className={'bap-cw ' + w} style={{ height: px(s.h) }}>
      <img src={`${BA}ba-${s.k}-${w}.webp`} alt={w === 'before' ? s.altB : s.altA} width={600} height={s.full * 2}
        loading={eager ? 'eager' : 'lazy'} decoding="async" draggable={false} />
    </div>
  )
  return (
    <div className="bap">
      <div className="bap-row">
        <div className="bap-col">
          <span className="bap-tag">BEFORE · 2022</span>
          {crop('before')}
        </div>
        <div className="bap-col">
          <span className="bap-tag">AFTER</span>
          <div className="bap-after">
            {crop('after')}
            <ul className="bap-notes" aria-label="What changed">
              {s.notes.map(n => (
                <li key={n.t} style={{ top: px(n.y) }}><i className="dot" aria-hidden="true" /><i className="ld" aria-hidden="true" /><span>{n.t}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Before → After: pinned while scrolling; each scroll step moves to the next screen (Nov 19) */
const SLIDE_WIDE_Q = '(min-width: 1024px) and (min-height: 640px)'
function Slider() {
  const outer = useRef<HTMLDivElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const N = SLIDES.length
  const [idx, setIdx] = useState(0)
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && matchMedia(SLIDE_WIDE_Q).matches && !reducedMotion())
  useEffect(() => {
    const mq = matchMedia(SLIDE_WIDE_Q)
    const set = () => setWide(mq.matches && !reducedMotion())
    set(); mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [])
  useEffect(() => {
    if (!wide) return
    let raf = 0
    const run = () => {
      raf = 0
      const el = outer.current, p = pin.current; if (!el || !p) return
      const travel = el.offsetHeight - p.offsetHeight
      const f = clamp01(-el.getBoundingClientRect().top / Math.max(1, travel))
      const i = Math.min(N - 1, Math.floor(f * N))
      setIdx(v => (v === i ? v : i))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [wide, N])

  return (
    <div ref={outer} className={'e5-slider' + (wide ? ' pinned' : '')} style={wide ? { height: `calc(100vh + ${N * 70}vh)` } : undefined}>
      <div ref={pin} className="e5-sl-pin">
        <div className="e5-track" role="region" aria-roledescription="carousel" aria-label="Before and after screens, scroll to move through them">
          <div className="e5-rail" style={wide ? { transform: `translate3d(calc(${-idx} * (var(--sw) + var(--gap))), 0, 0)` } : undefined}>
            {SLIDES.map((s, i) => (
              <div key={s.n} className={'e5-slide' + (!wide || i === idx ? ' on' : '')} role="group" aria-roledescription="slide" aria-label={`${s.n} of 04, ${s.t}`}>
                <div className="e5-card"><BAPanel s={s} eager={i < 2} /></div>
                <div className="cap"><h3>{s.n}. {s.t}</h3><p>{s.d}</p></div>
              </div>
            ))}
          </div>
        </div>
        {wide && (
          <div className="e5-sl-foot" aria-hidden="true">
            <div className="count"><b>{SLIDES[idx].n}</b> / {String(N).padStart(2, '0')}</div>
            <div className="ticks">{SLIDES.map((s, i) => <i key={s.n} className={i <= idx ? 'on' : undefined} />)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/* ---------- v6 (Figma 9eRSsfAhsJk0OmvJdrxZ6E · 2036:1186, Nov 22) ---------- */

const A7 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/v7/'

/** ETO Markets logo (Figma 2231:19132), inline so it renders (GitHub raw serves SVG as text) */
function EtoLogo({ white = false, className = '' }: { white?: boolean; className?: string }) {
  return (
    <svg className={className} viewBox={white ? '18.8 10.7 150 51' : '0 0 188 76'} width={white ? 74 : 188} height={white ? 25 : 76} fill="none" role="img" aria-label="ETO Markets">
      {LOGO_PATHS.map(([d, red], i) => <path key={i} d={d} fill={white ? '#FFFFFF' : red ? '#DA2128' : '#231F20'} />)}
    </svg>
  )
}

/** content drawn at a fixed width (w), scaled down to fit its column; the box takes the scaled height, so nothing
 *  scrolls inside the page (Nov 23, Harbor: no inner scrollbars on the benchmark sheet or the menu canvas) */
function ScaleW({ w, className = '', children }: { w: number; className?: string; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [k, setK] = useState(1)
  const [h, setH] = useState<number | undefined>(undefined)
  useEffect(() => {
    const el = box.current, inn = inner.current
    if (!el || !inn) return
    const set = () => { const kk = Math.min(1, el.clientWidth / w); setK(kk); setH(inn.offsetHeight * kk) }
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el); ro.observe(inn)
    return () => ro.disconnect()
  }, [w])
  return (
    <div ref={box} className={'e6-scalew ' + className} style={{ height: h }}>
      <div ref={inner} style={{ width: w, transform: `scale(${k})`, transformOrigin: '0 0' }}>{children}</div>
    </div>
  )
}

/** a fixed-size Figma stage (w × h) scaled down to the width it is given */
function Fit({ w, h, className = '', children }: { w: number; h: number; className?: string; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [k, setK] = useState(1)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const set = () => setK(Math.min(1, el.clientWidth / w))
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => ro.disconnect()
  }, [w])
  return (
    <div ref={box} className={'e6-fit ' + className} style={{ aspectRatio: `${w} / ${h}` }}>
      <div className="e6-fit-in" style={{ width: w, height: h, transform: `scale(${k})` }}>{children}</div>
    </div>
  )
}

const META = [
  { k: 'TIMELINE', a: 'At ETO Markets: Nov 2022 to Sep 2023', b: 'This case study: the client CRM portal, from research to tablet, mobile and 9 languages' },
  { k: 'MY ROLE', a: 'UI/UX Designer', b: 'I redesigned the portal traders and IBs log into: IA, PC screens, tablet and mobile layouts, and 9 language versions.' },
  { k: 'SCOPE', a: 'The pages traders and IBs use after they log in.', b: 'This case study: Dashboard, Inbox, My Clients, My Account.' },
]

/* ---------- Context: what a CRM means for a broker (Figma 2231:15192) ---------- */

type Side = 'client' | 'shared' | 'ib'
const CRM_OBJECTS: { t: string; side: Side; rows: string[] }[] = [
  { t: 'DEPOSIT', side: 'client', rows: ['8 currencies', 'Payment method', 'Success · fail'] },
  { t: 'DASHBOARD', side: 'shared', rows: ['Live · Demo', 'Leverage', 'Rebate summary'] },
  { t: 'MY CLIENTS', side: 'ib', rows: ['Management', 'Money in · out', 'Pending list'] },
  { t: 'KYC', side: 'client', rows: ['ID document', 'Proof of address', 'Risk agreement'] },
  { t: 'CORE', side: 'shared', rows: [] },
  { t: 'INBOX', side: 'ib', rows: ['Registration', 'Deposit', 'Withdrawal'] },
  { t: 'WITHDRAWAL', side: 'client', rows: ['Card · crypto', 'Amount', 'Request list'] },
  { t: 'TRADES', side: 'shared', rows: ['Open positions', 'Closed trades', 'Profit'] },
  { t: 'IB REBATE', side: 'ib', rows: ['Per trade', 'Status', 'Today · total'] },
]
/* flows from the walls into the box, left half of the 1600 × 600 canvas (x 0–420); the IB half is the mirror image */
const CRM_FLOWS = [
  [119.41, 121.32, 420, 138], [274.78, 167.93, 420, 166], [182.11, 193.42, 420, 194], [310, 259.5, 420, 288], [310, 300, 420, 316],
  [232.86, 348.21, 420, 344], [232.86, 396.43, 420, 438], [119.41, 419.12, 420, 466], [182.11, 459.87, 420, 494],
]
const WALL = 'M79.9118 32.5032V508.974M142.605 57.5806V483.896M193.357 77.8814V463.596M235.283 94.6516V446.825M270.5 108.739V432.739M0.5 68.2385L300.5 158.239M0.5 135.739L300.5 195.739M0.5 203.239L300.5 233.239M0.5 270.739H300.5M0.5 338.239L300.5 308.239M0.5 405.739L300.5 345.739M0.5 473.239L300.5 383.239M0.5 0.738525V540.739L300.5 420.739V120.739L0.5 0.738525Z'

function CrmSide({ side }: { side: 'client' | 'ib' }) {
  const ib = side === 'ib'
  const col = ib ? '#7C3AED' : '#ED1C24'
  return (
    <div className={'e6-crm-side ' + side} aria-hidden="true">
      <svg viewBox="0 0 420 600" preserveAspectRatio="none" width="100%" height="600">
        <g transform={ib ? 'translate(420 0) scale(-1 1)' : undefined}>
          <path d={WALL} transform="translate(39.5 29.26)" fill="none" stroke={col} strokeOpacity=".3" vectorEffect="non-scaling-stroke" />
          {CRM_FLOWS.map(([x1, y1, x2, y2], i) => {
            const mx = (x1 + x2) / 2
            return <path key={i} className="fl" d={`M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`} fill="none" stroke={col} strokeOpacity=".55" strokeWidth="1.2"
              strokeLinecap="round" vectorEffect="non-scaling-stroke" pathLength={1} style={{ '--d': `${i * 60}ms` } as React.CSSProperties} />
          })}
        </g>
      </svg>
      {CRM_FLOWS.map(([x1, y1], i) => (
        <i key={i} className="dot" style={{ left: `${((ib ? 420 - x1 : x1) / 420) * 100}%`, top: y1, '--d': `${i * 60}ms` } as React.CSSProperties} />
      ))}
      <div className="lab" style={{ left: ib ? '57.74%' : '45.24%' }}>{ib ? <>INTRODUCING<br />BROKERS</> : 'CLIENTS'}</div>
      <div className="portal" style={{ left: ib ? '45.36%' : '52.86%' }}>{ib ? 'Partner portal' : 'Client portal'}</div>
    </div>
  )
}

function CrmMap() {
  return (
    <div className="e6-crm" data-r>
      <Canvas className="e6-crm-c">
        <div className="e6-crm-stage">
          <CrmSide side="client" />
          <div className="e6-crm-mid">
            <div className="e6-crm-keys" aria-hidden="true"><span className="client">CLIENT SIDE</span><span className="shared">SHARED</span><span className="ib">IB SIDE</span></div>
            <div className="e6-crm-heads">
              <div className="client">CLIENTS <span>· Client portal</span></div>
              <div className="ib">INTRODUCING BROKERS <span>· Partner portal</span></div>
            </div>
            <ul className="e6-crm-box" aria-label="What the ETO CRM holds: client side, shared, and IB side">
              {CRM_OBJECTS.map(o => o.t === 'CORE' ? (
                <li key={o.t} className="e6-core">
                  <EtoLogo white className="lg" />
                  <span>CRM · one portal</span>
                </li>
              ) : (
                <li key={o.t} className={'e6-obj ' + o.side}>
                  <div className="h">{o.t}</div>
                  <ul>{o.rows.map(r => <li key={r}><i aria-hidden="true" />{r}</li>)}</ul>
                  <span className="sr-only">{o.side === 'client' ? 'client side' : o.side === 'ib' ? 'IB side' : 'shared'}</span>
                </li>
              ))}
            </ul>
          </div>
          <CrmSide side="ib" />
        </div>
      </Canvas>
    </div>
  )
}

/* ---------- Discover: the benchmark as the spreadsheet it was (Figma 2269:22072) ---------- */

type Cell = 'Y' | '~' | 'N'
const SHEET_ROWS: { t: string; m: Cell[]; note: string }[] = [
  { t: 'Responsive web design', m: ['Y', 'Y', 'Y', 'Y'], note: 'All four' },
  { t: 'Cross-platform consistency', m: ['~', 'Y', '~', 'Y'], note: 'PS, PU partial' },
  { t: 'Advanced charting tools', m: ['Y', 'Y', 'N', 'Y'], note: 'PU missing' },
  { t: 'Easy navigation', m: ['Y', 'Y', 'Y', 'Y'], note: 'All four' },
  { t: 'Mobile app usability', m: ['~', 'Y', 'N', 'Y'], note: 'PU weakest' },
  { t: 'Customization options', m: ['~', 'Y', 'N', 'N'], note: 'Only TMGM full' },
  { t: 'Educational resources', m: ['Y', '~', 'Y', 'Y'], note: 'TMGM partial' },
]
const SHEET_LOGOS = [
  { ...BROKERS[0], lh: 22 }, { ...BROKERS[1], lh: 22 }, { ...BROKERS[2], lh: 22 }, { ...BROKERS[3], lh: 20 },
]
const COLS = ['B', 'C', 'D', 'E']
const CELL_NAME: Record<Cell, string> = { Y: 'featured', '~': 'somewhat', N: 'not featured' }

function Sheet() {
  // the selected total (row 12): B12 in the Figma; pick another broker's total to see its formula
  const [sel, setSel] = useState(0)
  const count = (i: number) => SHEET_ROWS.filter(r => r.m[i] === 'Y').length
  return (
    <ScaleW w={880} className="e6-sheet-wrap">
      <div className="e6-sheet">
        <div className="fx">
          <span className="nb">{COLS[sel]}12</span><i>fx</i><span className="sep" aria-hidden="true" />
          <span className="f">=COUNTIF({COLS[sel]}5:{COLS[sel]}11,"Y")</span>
        </div>
        <table>
          <caption className="sr-only">Broker benchmark: client portal and app, desk research. Y means featured, ~ somewhat, N not featured.</caption>
          <thead aria-hidden="true">
            <tr className="ch"><th className="rh" />{['A', 'B', 'C', 'D', 'E', 'F'].map((c, i) => <th key={c} className={i - 1 === sel ? 'on' : undefined}>{c}</th>)}</tr>
          </thead>
          <tbody>
            <tr><th className="rh">1</th><td className="title" colSpan={6}>Broker benchmark – client portal &amp; app (desk research)</td></tr>
            <tr><th className="rh">2</th><td className="legend" colSpan={6}>Y = featured&nbsp;&nbsp;&nbsp;&nbsp; ~ = somewhat&nbsp;&nbsp;&nbsp;&nbsp; N = not featured</td></tr>
            <tr><th className="rh">3</th><td /><td /><td /><td /><td /><td /></tr>
            <tr className="hdr">
              <th className="rh">4</th>
              <th scope="col" className="a">Criteria</th>
              {SHEET_LOGOS.map((b, i) => (
                <th key={b.name} scope="col" className="logo">
                  <button type="button" onClick={() => setSel(i)} aria-pressed={sel === i} title={`Select ${b.name}'s total`}>
                    <img src={b.logo} alt={b.name} height={b.lh} style={{ height: b.lh, width: 'auto' }} loading="lazy" decoding="async" />
                  </button>
                </th>
              ))}
              <th scope="col" className="a">Notes</th>
            </tr>
            {SHEET_ROWS.map((r, ri) => (
              <tr key={r.t}>
                <th className="rh">{ri + 5}</th>
                <th scope="row" className="a">{r.t}</th>
                {r.m.map((m, i) => <td key={i} className={'m c' + (m === 'Y' ? 'y' : m === '~' ? 's' : 'n')}><span aria-hidden="true">{m}</span><span className="sr-only">{CELL_NAME[m]}</span></td>)}
                <td className="note">{r.note}</td>
              </tr>
            ))}
            <tr className="tot">
              <th className="rh on">12</th>
              <th scope="row" className="a">Featured (count of Y)</th>
              {COLS.map((c, i) => (
                <td key={c} className={'n' + (sel === i ? ' sel' : '')}>
                  <button type="button" onClick={() => setSel(i)} aria-pressed={sel === i} aria-label={`${SHEET_LOGOS[i].name}: ${count(i)} out of 7`}>{count(i)}</button>
                </td>
              ))}
              <td className="note">out of 7</td>
            </tr>
            <tr><th className="rh">13</th><td /><td /><td /><td /><td /><td /></tr>
            <tr className="take"><th className="rh">14</th><th scope="row" className="a hl">Takeaway</th><td colSpan={5} className="tk">Strongest portals put the account summary first, money actions one tap away.</td></tr>
            {[15, 16, 17].map(n => <tr key={n} aria-hidden="true"><th className="rh">{n}</th><td /><td /><td /><td /><td /><td /></tr>)}
          </tbody>
        </table>
        <div className="tabs" aria-hidden="true"><span className="arr">‹&nbsp;&nbsp;&nbsp;›</span><span className="tab on">Benchmark</span><span className="tab">Sheet2</span><span className="plus">+</span></div>
      </div>
    </ScaleW>
  )
}

/* ---------- Discover: research photos (Figma 2319:19499, 1440 × 960) ---------- */
/* Photos exported from the Figma at 2x, cropped to each frame (assets/eto/v7/research; the shadow is CSS). Positions are
   the Figma's, on the 1440 × 850 photo area above the captions. Nov 23 (Harbor): the photos can be dragged around like
   paper on a desk; the one you pick up comes to the top. Arrow keys move a focused photo. (Nov 23: no hint line or Reset.) */
const RES_H = 850
const RES_PHOTOS: { f: string; x: number; y: number; w: number; h: number; alt: string; chip?: string; fb?: string }[] = [
  { f: 'r-call.jpg', x: 43, y: 33, w: 317, h: 262, alt: 'A video call during a weekly marketing catch-up, the ETO site open on the shared screen' },
  { f: 'r-platforms.jpg', x: 358, y: 24, w: 210, h: 280, alt: 'Notebook page: notes on the platforms' },
  { f: 'r-account-flow.jpg', x: 520, y: 72, w: 230, h: 300, chip: '02', alt: 'Paper sketch of the account flow: open an account, make a deposit, learn, start live trading', fb: A3 + 'sketch-account.webp' },
  { f: 'r-fonts.jpg', x: 730, y: 32, w: 220, h: 293, alt: 'Notebook page: notes on fonts and file formats' },
  { f: 'r-keywords.jpg', x: 1250, y: 40, w: 160, h: 213, alt: 'Notebook page: brand keywords' },
  { f: 'r-whiteboard.jpg', x: 900, y: 112, w: 400, h: 300, chip: '04', alt: 'Whiteboard plan for the landing sections: spreads, payment solutions, max leverage, fund security, micro lot trading', fb: A3 + 'sketch-whiteboard.webp' },
  { f: 'r-sticky.jpg', x: 60, y: 330, w: 600, h: 208, chip: '01', alt: 'Yellow sticky notes: products, platforms (MT4, MT5, PAMM, social trading) and education', fb: A3 + 'sticky-ia.webp' },
  { f: 'r-pamm.jpg', x: 610, y: 392, w: 340, h: 255, chip: '03', alt: 'Paper sketch of the PAMM structure: one trader account linked to investor accounts', fb: A3 + 'sketch-pamm.webp' },
  { f: 'r-footer.jpg', x: 980, y: 392, w: 300, h: 225, alt: 'The ETO site footer on a monitor' },
  { f: 'r-proto-pattern.jpg', x: 1230, y: 300, w: 180, h: 240, alt: 'Notebook page: prototype patterns' },
  { f: 'r-sub-accounts.jpg', x: 40, y: 540, w: 210, h: 280, alt: 'Paper sketch of sub accounts' },
  { f: 'r-monitor.jpg', x: 230, y: 570, w: 200, h: 267, alt: 'The portal on a monitor' },
  { f: 'r-sketch-flow.jpg', x: 420, y: 600, w: 180, h: 240, alt: 'Paper sketch of a flow' },
  { f: 'r-laptop.jpg', x: 590, y: 650, w: 320, h: 180, alt: 'A portal screen on a laptop' },
  { f: 'r-tablet.jpg', x: 890, y: 590, w: 180, h: 240, alt: 'A table on a tablet' },
  { f: 'r-office.jpg', x: 1050, y: 640, w: 340, h: 191, alt: 'The ETO Markets office floor' },
]
const RES_CAPS = [
  { k: '01  STICKY NOTES', c: 'Products, platforms and education.' },
  { k: '02  ACCOUNT FLOW', c: 'Open, deposit, learn, start live trading.' },
  { k: '03  PAMM', c: 'One trader account linked to many investor accounts.' },
  { k: '04  WHITEBOARD', c: 'Landing sections: spreads, payments, leverage, fund security.' },
]
/* touch drags only where the board is big enough; on phones a swipe still scrolls the page */
const RES_DRAG_Q = '(min-width: 1024px)'

type Pt = { x: number; y: number }
function ResPhoto({ p, at, z, lifted, onGrab, onKey }: { p: typeof RES_PHOTOS[number]; at: Pt; z: number; lifted: boolean;
  onGrab: (e: React.PointerEvent<HTMLElement>) => void; onKey: (e: React.KeyboardEvent<HTMLElement>) => void }) {
  const [src, setSrc] = useState(A7 + 'research/' + p.f)
  const [gone, setGone] = useState(false)
  if (gone) return null
  return (
    <figure className={'ph' + (lifted ? ' drag' : '')} tabIndex={0} onPointerDown={onGrab} onKeyDown={onKey}
      style={{ left: `${(at.x / 1440) * 100}%`, top: `${(at.y / RES_H) * 100}%`, width: `${(p.w / 1440) * 100}%`, height: `${(p.h / RES_H) * 100}%`, zIndex: z }}>
      <img src={src} alt={p.alt} loading="lazy" decoding="async" draggable={false} onError={() => { if (p.fb && src !== p.fb) setSrc(p.fb); else setGone(true) }} />
      {p.chip && <span className="chip" style={{ left: `${(12 / p.w) * 100}%`, top: `${(12 / p.h) * 100}%` }} aria-hidden="true">{p.chip}</span>}
    </figure>
  )
}

function Collage() {
  const board = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<Pt[]>(() => RES_PHOTOS.map(p => ({ x: p.x, y: p.y })))
  const [order, setOrder] = useState<number[]>(() => RES_PHOTOS.map((_, i) => i))
  const [held, setHeld] = useState(-1)
  const clampTo = (i: number, x: number, y: number) => {
    const p = RES_PHOTOS[i]
    return { x: Math.min(1440 - p.w, Math.max(0, x)), y: Math.min(RES_H - p.h, Math.max(0, y)) }
  }
  const raise = (i: number) => setOrder(o => (o[o.length - 1] === i ? o : [...o.filter(j => j !== i), i]))
  const grab = (i: number) => (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || (e.pointerType === 'touch' && !matchMedia(RES_DRAG_Q).matches)) return
    const el = board.current
    if (!el) return
    e.preventDefault()
    const k = 1440 / el.clientWidth // Figma px per screen px
    const p0 = pos[i], sx = e.clientX, sy = e.clientY
    const t = e.currentTarget
    t.setPointerCapture(e.pointerId)
    setHeld(i); raise(i)
    const move = (ev: PointerEvent) => {
      const q = clampTo(i, p0.x + (ev.clientX - sx) * k, p0.y + (ev.clientY - sy) * k)
      setPos(ps => ps.map((v, j) => (j === i ? q : v)))
    }
    const up = () => {
      setHeld(-1)
      t.removeEventListener('pointermove', move); t.removeEventListener('pointerup', up); t.removeEventListener('pointercancel', up)
    }
    t.addEventListener('pointermove', move); t.addEventListener('pointerup', up); t.addEventListener('pointercancel', up)
  }
  const key = (i: number) => (e: React.KeyboardEvent<HTMLElement>) => {
    const d = e.shiftKey ? 48 : 16
    const dx = e.key === 'ArrowLeft' ? -d : e.key === 'ArrowRight' ? d : 0
    const dy = e.key === 'ArrowUp' ? -d : e.key === 'ArrowDown' ? d : 0
    if (!dx && !dy) return
    e.preventDefault()
    raise(i)
    setPos(ps => ps.map((v, j) => (j === i ? clampTo(i, v.x + dx, v.y + dy) : v)))
  }
  return (
    <Canvas className="e6-res-c">
        <div className="e6-res" data-r>
          <div ref={board} className="e6-res-board">
            {RES_PHOTOS.map((p, i) => (
              <ResPhoto key={p.f} p={p} at={pos[i]} z={order.indexOf(i) + 1} lifted={held === i} onGrab={grab(i)} onKey={key(i)} />
            ))}
          </div>
          <ol className="e6-res-caps">
            {RES_CAPS.map(c => <li key={c.k}><b>{c.k}</b><span>{c.c}</span></li>)}
          </ol>
        </div>
    </Canvas>
  )
}

/* ---------- Define: three rules, one question (Figma 2273:24860) ---------- */

const DEFINE_PINS = [
  { p: 1, t: 'Account table opened the page' },
  { p: 2, t: 'Two referral links, half the screen' },
  { p: 3, t: 'Seven deposit methods, one weight' },
]

/** the small wireframes on the rule cards, drawn on Figma's 376 × 208 box */
function Wire({ n }: { n: 0 | 1 | 2 }) {
  const r = (x: number, y: number, w: number, h: number) => ({ left: `${(x / 376) * 100}%`, top: `${(y / 208) * 100}%`, width: `${(w / 376) * 100}%`, height: `${(h / 208) * 100}%` })
  const at = (x: number, y: number) => ({ left: `${(x / 376) * 100}%`, top: `${(y / 208) * 100}%` })
  return (
    <div className="e6-wire" aria-hidden="true">
      <i className="side" style={r(0, 0, 64, 208)} />
      {[20, 48, 76, 104].map(y => <i key={y} className="nav" style={r(16, y, 32, 8)} />)}
      {n === 0 && <>
        <i className="hot" style={r(80, 16, 136, 80)} /><i className="hot" style={r(224, 16, 128, 80)} />
        <span className="t red" style={at(92, 26)}>Clients</span><span className="t red" style={at(236, 26)}>Rebate</span>
        <i className="pink" style={r(92, 60, 80, 8)} /><i className="pink" style={r(236, 60, 64, 8)} />
        {[112, 140, 168].map(y => <i key={y} className="row" style={r(80, y, 272, 20)} />)}
      </>}
      {n === 1 && <>
        <span className="t mute" style={at(80, 16)}>Register</span><span className="t red" style={at(173, 16)}>Deposit</span><span className="t mute" style={at(257, 16)}>Withdraw</span>
        <i className="div" style={r(80, 47, 272, 1)} /><i className="act" style={r(173, 44, 68, 3)} />
        <i className="hot" style={r(80, 64, 272, 128)} />
        <i className="row" style={r(96, 84, 160, 12)} /><i className="row" style={r(96, 108, 200, 12)} /><i className="cta" style={r(96, 148, 96, 28)} />
      </>}
      {n === 2 && ['Balance', 'Equity', 'Rebate'].map((t, i) => (
        <React.Fragment key={t}>
          <i className="card" style={r(80, 16 + i * 64, 272, 52)} />
          <span className="t grey" style={at(96, 30 + i * 64)}>{t}</span>
          <i className="fmt" style={r(233, 28 + i * 64, 109, 28)} />
          <span className="t num" style={at(239, 30 + i * 64)}>$ 0,000.00</span>
        </React.Fragment>
      ))}
    </div>
  )
}

function DefineCanvas({ onPin }: { onPin: (n: number) => void }) {
  return (
    <div data-r>
      <Canvas className="e6-def">
        <div className="e6-def-k">DISCOVER&nbsp;&nbsp;→&nbsp;&nbsp;DEFINE</div>
        <div className="e6-def-grid">
          <div className="pins">
            <button type="button" className="e6-pill" onClick={() => onPin(1)} aria-label="Show pin 01 on the old portal" title="Show it on the old portal">01</button>
            <span>{DEFINE_PINS[0].t}</span>
          </div>
          <div className="pins two">
            <div><button type="button" className="e6-pill" onClick={() => onPin(2)} aria-label="Show pin 02 on the old portal" title="Show it on the old portal">02</button><span>{DEFINE_PINS[1].t}</span></div>
            <div><button type="button" className="e6-pill" onClick={() => onPin(3)} aria-label="Show pin 03 on the old portal" title="Show it on the old portal">03</button><span>{DEFINE_PINS[2].t}</span></div>
          </div>
          <div className="pins"><span className="e6-pill new">New</span><span>Added in the redesign</span></div>
          {RULES_DEFINE.map((r, i) => (
            <div key={r.t} className="e6-rule" style={{ '--d': `${i * 120}ms` } as React.CSSProperties}>
              <h3>{r.t}</h3>
              <div className="b"><Wire n={i as 0 | 1 | 2} /><p>{r.d}</p></div>
            </div>
          ))}
        </div>
        <div className="e6-def-flow" aria-hidden="true">
          <svg viewBox="40 0 1360 96" preserveAspectRatio="none">
            {[[256, 539.4], [720, 720], [1184, 900.6]].map(([a, b]) => (
              <path key={a} d={`M${a} 0C${a} 48 ${b} 48 ${b} 96`} stroke="#E31E24" strokeOpacity=".7" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" pathLength={1} />
            ))}
          </svg>
          {[539.4, 720, 900.6].map(x => <i key={x} className="n" style={{ left: `${((x - 40) / 1360) * 100}%` }} />)}
        </div>
        <div className="e6-def-core">
          <span className="k">EVERY SCREEN ASKS</span>
          <b>Does the IB need to act on this now?</b>
        </div>
      </Canvas>
    </div>
  )
}

/* ---------- IB dashboard: the dashboard tour (Figma 2358:2059) lives in EtoTour.tsx ---------- */

/* ---------- IB dashboard: the portal menu, before → after (Figma 2273:27847) ---------- */
/* Steps follow the Figma motion, run by scroll instead of a loop: 0 the 2022 menu · 1 the new menu rises over it ·
   2 the columns move to their new places · 3 items and tags come in · 4 the legend. */
const IA_SHIFT: Record<string, number> = { Download: 378, 'My Clients': -189, 'My Account': -189 }

/* Nov 23 (Harbor): the change was over before the menu was on screen. On wide screens the canvas now pins while you
   scroll through a taller block, and the five steps are spread over that distance: the 2022 menu shows first, then the
   new menu rises, the columns move, items and tags come in, then the legend. Narrow screens step as it scrolls past.
   Nov 23 (later): the new menu sits under the 2022 menu instead of over it, so both stay readable the whole time. */
const IA_PIN_Q = '(min-width: 1024px) and (min-height: 720px)'
function IaMotion() {
  const ref = useRef<HTMLDivElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(() => (reducedMotion() ? 4 : 0))
  const [pinned, setPinned] = useState(false)
  useEffect(() => {
    if (reducedMotion()) return
    const mq = matchMedia(IA_PIN_Q)
    const sync = () => setPinned(mq.matches)
    sync(); mq.addEventListener('change', sync)
    let raf = 0
    const run = () => {
      raf = 0
      const outer = pin.current, el = ref.current; if (!outer || !el) return
      let t: number
      if (mq.matches) {
        const r = outer.getBoundingClientRect()
        const travel = outer.offsetHeight - innerHeight
        t = travel > 0 ? -r.top / travel : 1 // 0 when the block pins, 1 when it lets go
      } else {
        const r = el.getBoundingClientRect()
        t = (innerHeight * 0.8 - r.top) / (innerHeight * 0.9)
      }
      const s = t < 0.08 ? 0 : t < 0.3 ? 1 : t < 0.52 ? 2 : t < 0.74 ? 3 : 4
      setStep(v => (v === s ? v : s))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on); mq.removeEventListener('change', sync) }
  }, [])
  const tag = (t: Tag, i: number) => <span className={'e5-tag t-' + t.toLowerCase()} style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>{t}</span>
  let ti = 0
  return (
    <div ref={pin} className={'e6-ia-pin' + (pinned ? ' on' : '')}>
    <div ref={ref} className={'e6-ia s' + step}>
      <ScaleW w={1440} className="e6-ia-scroll">
        <Canvas className="e6-ia-c">
          <div className="lab before">BEFORE · 2022 PORTAL</div>
          <div className="menu before" role="group" aria-label="Portal menu in 2022">
            {MENU_BEFORE.map(c => (
              <div key={c.h} className="col"><div className="mh">{c.h}</div><i className="dv" aria-hidden="true" /><ul>{c.items.map(it => <li key={it.t}>{it.t}</li>)}</ul></div>
            ))}
          </div>
          <div className="lab after">AFTER · REDESIGN</div>
          <div className="menu after" role="group" aria-label="Portal menu after the redesign">
            {MENU_AFTER.map(c => (
              <div key={c.h} className="col" style={{ '--x': `${IA_SHIFT[c.h] || 0}px` } as React.CSSProperties}>
                <div className="mh">{c.h}{c.h === 'Contact Us' && <span className="old" aria-hidden="true">Client Support</span>}</div>
                {c.tag && <div className="tg">{tag(c.tag, ti++)}</div>}
                <i className="dv" aria-hidden="true" />
                <ul>{c.items.map((it, i) => <li key={it.t} style={{ '--d': `${i * 60}ms` } as React.CSSProperties}>{it.t}{it.tag && <> {tag(it.tag, ti++)}</>}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className="legend">
            {TAG_LEGEND.map(l => <span key={l.tag}>{tag(l.tag, 0)}{l.d}</span>)}
          </div>
        </Canvas>
      </ScaleW>
    </div>
    </div>
  )
}

/* ---------- Prototype: short walkthrough videos + links to the Figma prototypes live in EtoProto.tsx (Nov 24) ---------- */

/* ---------- page ---------- */

export function EtoV6() {
  const [introOn] = useState(() => !reducedMotion())
  const [intro, setIntro] = useState(introOn)
  const away = useHeadroom()
  const slot = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const media = useRef<HTMLVideoElement>(null)
  useCaseIntro(introOn, slot, box, media, () => setIntro(false))

  // Discover pins: pulse one after another when the old portal comes into view; Define's pins point back here
  const [pinsOn, setPinsOn] = useState(false)
  const [hotPin, setHotPin] = useState(0)
  const pinTimer = useRef(0)
  const oldRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = oldRef.current
    if (!el || !('IntersectionObserver' in window)) { setPinsOn(true); return }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { setPinsOn(true); io.disconnect() } }), { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const showPin = (n: number) => {
    const el = oldRef.current
    if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - Math.max(80, (innerHeight - el.offsetHeight) / 2), behavior: reducedMotion() ? 'auto' : 'smooth' })
    window.clearTimeout(pinTimer.current)
    setHotPin(n)
    pinTimer.current = window.setTimeout(() => setHotPin(0), 3200)
  }
  useEffect(() => () => window.clearTimeout(pinTimer.current), [])

  // soft reveal as blocks scroll in
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.e5 [data-r]'))
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [])

  // takeaways: the office photo moves a little slower than the page
  const photo = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const img = photo.current
    if (!img || reducedMotion()) return
    let raf = 0
    const run = () => {
      raf = 0
      const sec = img.parentElement
      if (!sec) return
      const r = sec.getBoundingClientRect()
      if (r.bottom < 0 || r.top > innerHeight) return
      const p = (innerHeight - r.top) / (innerHeight + r.height)
      img.style.transform = `translate3d(0, ${((p - 0.5) * -8).toFixed(2)}%, 0) scale(1.12)`
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true })
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on) }
  }, [])

  return (
    <div className={'hb eto e5 e6' + (intro ? ' intro-on' : '')}>
      <style>{CSS + E5_CSS + E6_CSS}</style>
      <SiteHeaderB mode="light" hidden={intro} away={away} />
      <SideToc chapters={E6_CHAPTERS} scope=".e5" hidden={intro} />

      <main id="top">
        {/* Hero + meta */}
        <section className="e5-hero" data-chapter="ETO Markets" aria-label="ETO Markets">
          <div className="e5-w">
            <EtoLogo className="e6-logo" />
            <h1 className="e5-h1">A broker CRM rebuilt<br />for its IB partners</h1>
            <p className="e5-sub">Reinterpreting the client CRM dashboard I designed at ETO Markets (Sydney).</p>
            <div className="e5-slot" ref={slot}>
              <div className="e5-box" ref={box}><CaseFilm src={IMG.video} poster={IMG.poster} label={FILM_LABEL} quiet={intro} introRef={media} /></div>
            </div>
            <div className="e5-meta e6-meta">
              {META.map(m => <div key={m.k}><div className="mk">{m.k}</div><p>{m.a}<br />{m.b}</p></div>)}
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="e5-sec" data-chapter="Overview">
          <div className="e5-w e5-stack64">
            <Label>OVERVIEW</Label>
            <div className="e5-row" data-r>
              <h2 className="e5-rt">The problem</h2>
              <p className="e5-body">ETO Markets' CRM had not been redesigned in eight years. One portal served traders and introducing brokers (IBs), the partners who bring new clients to the broker. Every page showed everything at the same weight, so an IB had to dig for their clients, their links and what they had earned.</p>
            </div>
            <div className="e5-row" data-r>
              <h2 className="e5-rt">What I did</h2>
              <p className="e5-body">I rebuilt the CRM around one question: what does each user need to see first? I split crowded pages so each has a single job, gave every screen one clear call to action, and turned tables into cards on tablet and mobile. For this case study I went back to the dashboard and redesigned it for IBs, with charts built around the questions they ask every day.</p>
            </div>
            <div className="e5-row" data-r>
              <h2 className="e5-rt">Impact</h2>
              <div className="e5-impact">
                <div className="e5-stats">
                  {IMPACT.map(s => <div key={s.c}><Count className="n" value={s.n} /><p>{s.c}</p></div>)}
                </div>
                <p className="e5-note">Figures reported after the release of the original project.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Context */}
        <section className="e5-sec e5-soft" data-chapter="Context">
          <div className="e5-w">
            <Label>CONTEXT</Label>
            <h2 className="e5-h2 mt24">What a CRM means for a trading broker</h2>
            <p className="e5-body w960 mt24">At a broker the CRM is not only a sales tool. It is the system clients and partners log into, connected to the trading server, payments and the back office.</p>
          </div>
          <div className="mt64"><CrmMap /></div>
        </section>

        {/* Discover */}
        <section className="e5-sec" data-chapter="Discover">
          <div className="e5-w">
            <Label>DISCOVER</Label>
            <h2 className="e5-h2 mt24">The old portal made IBs dig for everything</h2>
            <p className="e5-body w960 mt24">Account tables, two referral links with QR codes and deposit options sat on one long page, all at the same weight. An IB who logged in to check new clients or today’s rebate had to scroll past all of it.</p>

            <figure className="mt64" data-r>
              <Canvas className="e5-oldc"><div ref={oldRef} className={'e5-old' + (pinsOn ? ' pins-on' : '')}>
                <Pic src={IMG.oldPortal} w={1440} h={620}
                  alt="The original CRM in 2022. Dashboard: (01) the page opens on an account table, not the IB's clients or earnings; (02) two registration links with QR codes take half the screen. Deposit: (03) seven deposit methods, all at the same weight." />
                {PINS.map((p, i) => (
                  <span key={p.n} className={'e5-ring' + (hotPin === p.n ? ' hot' : '')} style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, '--d': `${i * 0.5}s` } as React.CSSProperties} aria-hidden="true" />
                ))}
              </div></Canvas>
              <figcaption className="e5-cap">The original CRM: dashboard page (left) and deposit page (right).</figcaption>
            </figure>

            <div className="e6-bench mt120">
              <div data-r>
                <h2 className="e5-h2">Four brokers as a benchmark</h2>
                <p className="e5-body mt24">I compared four brokers on seven criteria. The strongest portals put the account summary first and keep money actions one tap away.</p>
              </div>
              <div data-r><Canvas className="e6-sheet-c"><Sheet /></Canvas></div>
            </div>

            <div className="mt120" data-r>
              <h2 className="e5-h2">Where it started</h2>
              <p className="e5-body w960 mt24">Before any screen, I mapped what ETO sells and how a client moves through it. These notes became the five steps above.</p>
            </div>
            <div className="mt64"><Collage /></div>
          </div>
        </section>

        {/* Define */}
        <section className="e5-sec e5-soft" data-chapter="Define">
          <div className="e5-w">
            <div className="e6-def-head" data-r>
              <Label>DEFINE</Label>
              <h2 className="e5-h2 mt24">The new portal puts what IBs need first</h2>
              <p className="e5-body mt24">The old page showed everything at once. I set three rules so IBs see what they came for before anything else.</p>
            </div>
            <div className="mt56"><DefineCanvas onPin={showPin} /></div>
          </div>
        </section>

        {/* IB dashboard redesign */}
        <section className="e5-sec" data-chapter="IB dashboard">
          <div className="e5-w">
            <Label>IB DASHBOARD REDESIGN</Label>
            <h2 className="e5-h2 mt24">Redesigning the dashboard for IBs</h2>
            <p className="e5-body w960 mt24">For this case study I went back to the dashboard. I listed every number and action an IB sees, then sorted them by one question: does the IB need to act on this now? That gave three tiers, and each tier got its own position, size and colour.</p>
            <div className="mt64"><DashTour /></div>
            <div className="mt64"><IaMotion /></div>
          </div>
        </section>

        {/* Before → After (unchanged from v5, Harbor Nov 22: keep this section as it was) */}
        <section className="e5-sec e5-ba" data-chapter="Before → After">
          <div className="e5-w">
            <Label>AS-IS → TO-BE</Label>
            <h2 className="e5-h2 mt24">Same data, new order</h2>
            <p className="e5-body w960 mt24">These screens shipped on web, tablet and mobile. The data stayed the same; what changed was how much of it appears at once, and in what order.</p>
          </div>
          <div className="mt64"><Slider /></div>
        </section>

        {/* Prototype */}
        <section className="e5-sec" data-chapter="Prototype">
          <div className="e5-w">
            <Label>PROTOTYPE</Label>
            <h2 className="e5-h2 mt24">See every screen</h2>
            <p className="e5-body w960 mt24">The redesign shipped on web, tablet, iOS and Android. Open the Figma files to see every page.</p>
            <div className="e7-proto mt64" data-r>
              <figure className="desk">
                <figcaption className="k">DESKTOP · WEB PORTAL</figcaption>
                <ProtoFrame kind="desktop" url={PROTO.desktop} />
              </figure>
              <figure className="mob">
                <figcaption className="k">MOBILE · iOS / ANDROID</figcaption>
                <ProtoFrame kind="mobile" url={PROTO.mobile} />
              </figure>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="e5-sec e5-soft" data-chapter="Results">
          <div className="e5-w">
            <Label>RESULTS</Label>
            <h2 className="e5-h2 mt24">What changed after the relaunch</h2>
            <p className="e5-body w960 mt24">Reported after the redesigned CRM went live.</p>
            <div className="e5-results mt64" data-r>
              {RESULTS.map(r => (
                <div key={r.k} className="e5-rcard">
                  <div className="k"><RIcon k={r.icon} />{r.k}</div>
                  <Count className="big" value={r.big} />
                  <p className="d">{r.d}</p>
                  {r.rings ? (
                    <div className="rings" role="img" aria-label={`${r.k.toLowerCase()}: ${r.before}% before, ${r.after}% after`}>
                      <div className="col"><span className="lab">AS-IS</span><Ring v={r.before} /></div>
                      <svg className="arr" viewBox="0 0 40 24" width="40" height="24" aria-hidden="true"><path d="M4 12h30M27 5l7 7-7 7" fill="none" stroke="#8E8E95" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <div className="col after"><span className="lab">TO-BE</span><Ring v={r.after} now /></div>
                    </div>
                  ) : (
                    <div className="flags" role="img" aria-label={`countries served: ${r.before} before, ${r.after} after`}>
                      <div className="row"><span className="lab">AS-IS<b>{r.before}</b></span><span className="fl dim">{FLAGS_BEFORE.map((f, i) => <img key={i} src={FLAG_SVG[f]} alt="" title={FLAG_NAME[f]} width={36} height={36} />)}</span></div>
                      <div className="row after"><span className="lab">TO-BE<b>{r.after}</b></span><span className="fl">{FLAGS_AFTER.map((f, i) => <img key={i} src={FLAG_SVG[f]} alt="" title={FLAG_NAME[f]} width={36} height={36} style={{ '--d': `${i * 60}ms` } as React.CSSProperties} />)}</span></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <blockquote className="e5-quote mt64" data-r>
              <span className="q o" aria-hidden="true">“</span>
              <div>
                <p>Harbor Kim is an exceptionally talented UI/UX designer who made a significant impact at ETO Markets through her outstanding web, CRM, and blog designs. Her work effectively captured the brand's essence, resonated with the target audience, and drove engagement and conversions.</p>
                <footer>Michelle Wang · Global Brand Revitalization, Social Media Strategies</footer>
              </div>
              <span className="q c" aria-hidden="true">”</span>
            </blockquote>
          </div>
        </section>

        {/* Takeaways */}
        <section className="e5-take" data-chapter="Takeaways">
          <img ref={photo} className="bg" src={IMG.office} alt="" width={1920} height={880} loading="lazy" decoding="async" />
          <div className="e5-w">
            <Label light>TAKEAWAYS</Label>
            <h2 className="t">A CRM dashboard is a priority list, not a data dump.</h2>
            <p className="d">Deciding what comes first is the design. Going back to the dashboard for this case study showed me what I skipped the first time: writing down why each number sits where it does. Next time I would test the tier order with real IBs before any visual design.</p>
          </div>
          <p className="sr-only">Photo: the ETO Markets office in Sydney, the logo on a frosted glass wall and two people sketching on a whiteboard behind it.</p>
        </section>

        <section className="e5-next" id="next">
          <a className="e5-w next-card" href={NEXT.href}>
            <span className="eyebrow">Next case study</span>
            <span className="next-name">{NEXT.name} <span className="go">→</span></span>
          </a>
        </section>
      </main>
    </div>
  )
}
