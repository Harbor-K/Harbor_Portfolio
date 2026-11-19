import React, { useCallback, useEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { SideToc, useHeadroom } from './CaseNav'
import { SiteHeaderB } from './SiteHeaderB'
import { CaseFilm, useCaseIntro } from './CaseFilm'

/**
 * ETO Markets case study (v29, Harbor Nov 19) — rebuilt from Harbor's Figma "06 ETO Markets — 1920 · v3"
 * in file 44기 김지현 4차 PF (gPb1oZk8RggQc7ihG33FnU, node 982:162). Copy is the frame's, word for word.
 * EtoV4.tsx (the previous version) stays in the design, unused.
 *
 * New in this version (Figma): Discover shows the old portal with three numbered pins and a 4-broker benchmark table;
 * a Define step (three rules); the IB dashboard as three layers (isometric) and as a full working concept;
 * the portal menu before/after; a before/after slider; result cards; the office photo behind the takeaways.
 *
 * Interactions (Harbor asked Claude to choose them):
 * - Overview and Results: the numbers count up once they come into view.
 * - Discover: the three pins on the old portal pulse one after another. In Define, each rule's pin badge is a button
 *   that scrolls back up to that pin and makes it pulse.
 * - Benchmark: rows come in one by one; pointing at a broker's logo highlights its column.
 * - IB dashboard, three layers: as the canvas scrolls into view, the layers move apart from a stack to Figma's spacing.
 *   Pointing at a tier's label brings its layer forward and fades the other two.
 * - Dashboard concept: KPI numbers count up, the daily bars grow day by day, the funnel fills step by step;
 *   "Share registration link" answers "Link copied" for 2 seconds (sample, nothing is copied).
 * - Menu before/after: pointing at (or clicking) a tag in the legend — New, Split, Moved, Renamed — lights up only
 *   the menu items with that tag.
 * - Before → After: a sideways slider (Figma's carousel). Swipe or trackpad-scroll sideways, drag with the mouse,
 *   use the arrow buttons (they loop from the last slide to the first) or the keyboard arrows. The slides beside the
 *   current one stay dimmed.
 * - Prototype stills lift on hover. Takeaways: the office photo moves slower than the page (light parallax).
 * Everything is shown as-is (no motion) with prefers-reduced-motion.
 *
 * Type and layout follow the site's system, not the frame literally: Roboto (index.css), 1440 container, text ≥16px,
 * spacing on the 8 grid, square corners on page blocks (the small pins, tags and the dashboard concept's own UI keep
 * their rounding), body copy at regular weight (the frame sets most body text in bold; titles keep the weight so the
 * title > body order reads at a glance).
 * Assets: Harbor-K/harbor-pf assets/eto/v3 (film, mark, research photos, prototype stills), v4 (architecture diagram)
 * and v5 (old portal, broker logos, the three dashboard layers, slider cards, office photo — exported from 982:162 at 2x).
 */

const A3 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/v3/'
const A4 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/v4/'
const A5 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/v5/'
const IMG = {
  mark: A3 + 'mark.png',
  video: A3 + 'intro-v6.mp4',
  poster: A3 + 'intro-v6-poster.jpg',
  arch: A4 + 'crm-architecture.webp',
  oldPortal: A5 + 'old-portal.webp',
  sticky: A3 + 'sticky-ia.webp',
  sketchAccount: A3 + 'sketch-account.webp',
  sketchPamm: A3 + 'sketch-pamm.webp',
  sketchBoard: A3 + 'sketch-whiteboard.webp',
  tiers: [A5 + 'tier-1.webp', A5 + 'tier-2.webp', A5 + 'tier-3.webp'],
  protoDesktop: A3 + 'proto-desktop.webp',
  protoInbox: A3 + 'proto-inbox.webp',
  protoDeposit: A3 + 'proto-deposit.webp',
  office: A5 + 'takeaways-office.jpg',
}
const PROTO = {
  desktop: 'https://www.figma.com/proto/8FyoH1wVd7m9ZBvUAKwm9o/CRMPage_coding',
  mobile: 'https://www.figma.com/proto/Epkz6qqltBZ7Gs93TWV5nL/ETO_Application',
}
const NEXT = { name: 'Trust Bank', href: '#/trust-bank' }
const FILM_LABEL = 'ETO Markets intro film: the partner CRM — every account, client, deposit and rebate in order; share a link, sign up, done; system errors down from 60% to 14%. Ends on: a CRM for partners.'
export const E5_CHAPTERS = ['Overview', 'Context', 'Discover', 'Define', 'IB dashboard', 'Before → After', 'Prototype', 'Results', 'Takeaways']

const DARK = '#0B0B0D'
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

/** a number that counts up from 0 when it scrolls into view: "$3,054.60", "77%", "2×" … */
function Count({ value, className }: { value: string; className?: string }) {
  return <span className={className} data-count={value}>{value}</span>
}

/* ---------- content (Figma 982:162, word for word) ---------- */

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

type Mark = 'G' | 'B' | 'R'
const BROKERS = [
  { name: 'Pepperstone', logo: A5 + 'logo-pepperstone.webp', w: 106, h: 28, score: '4/7' },
  { name: 'TMGM', logo: A5 + 'logo-tmgm.webp', w: 87, h: 28, score: '6/7' },
  { name: 'PU Prime', logo: A5 + 'logo-puprime.webp', w: 72, h: 28, score: '3/7' },
  { name: 'IC Markets Global', logo: A5 + 'logo-icmarkets.webp', w: 106, h: 24, score: '6/7' },
]
const CRITERIA: { t: string; m: Mark[] }[] = [
  { t: 'Responsive web design', m: ['G', 'G', 'G', 'G'] },
  { t: 'Cross-platform consistency', m: ['B', 'G', 'B', 'G'] },
  { t: 'Advanced charting tools', m: ['G', 'G', 'R', 'G'] },
  { t: 'Easy navigation', m: ['G', 'G', 'G', 'G'] },
  { t: 'Mobile app usability', m: ['B', 'G', 'R', 'G'] },
  { t: 'Customization options', m: ['B', 'G', 'R', 'R'] },
  { t: 'Educational resources', m: ['G', 'B', 'G', 'G'] },
]
const MARK_NAME: Record<Mark, string> = { G: 'Featured', B: 'Somewhat', R: 'Not featured' }

function MarkIcon({ m, size = 24 }: { m: Mark; size?: number }) {
  return (
    <svg className={'e5-mark m' + m} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
      {m === 'G' && <path d="M8 12.5l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
      {m === 'B' && <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
      {m === 'R' && <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  )
}

const RESEARCH = [
  { k: '#01  STICKY NOTES', src: IMG.sticky, w: 1440, h: 500, alt: 'Three yellow sticky notes: products (forex, commodities, energies, indices), platforms (MT4, MT5, PAMM, social trading) and education (MT4 tutorial videos, webinars)', c: 'Products, platforms and education.' },
  { k: '#02  ACCOUNT FLOW', src: IMG.sketchAccount, w: 464, h: 348, alt: 'Paper sketch of the account flow: open an account, make a deposit, learn trading skills, start live trading', c: 'Open, deposit, learn, start live trading.' },
  { k: '#03  PAMM', src: IMG.sketchPamm, w: 464, h: 348, alt: 'Paper sketch of the PAMM structure: one trader account linked to three investor accounts', c: 'One trader account linked to many investor accounts.' },
  { k: '#04  WHITEBOARD', src: IMG.sketchBoard, w: 464, h: 348, alt: 'Whiteboard plan for the landing page sections: spreads, payment solutions, max leverage, fund security, micro lot trading', c: 'Landing sections: spreads, payments, leverage, fund security.' },
]

const RULES_DEFINE: { t: string; d: string; pins: number[]; isNew?: boolean }[] = [
  { t: 'Lead with what the IB came for', d: 'Clients who need help and today’s rebate come first.', pins: [1] },
  { t: 'One screen, one job', d: 'Registration, deposit and withdrawal each get their own tab.', pins: [2, 3] },
  { t: 'Same number, same format', d: 'Balance, equity, margin and rebates look the same everywhere.', pins: [], isNew: true },
]

/* IB dashboard: the three layers. Leader dots sit on the layer edges at Figma's spacing (canvas 1440 × 840). */
const TIERS = [
  { n: 1, t: 'Act now', d: 'Top of the page, largest type. The only place red appears.', side: 'right' as const, top: 113 },
  { n: 2, t: 'Monitor', d: 'Trends and totals in regular weight, in the same format everywhere.', side: 'left' as const, top: 428 },
  { n: 3, t: 'Reference', d: 'One click away, collapsed by default.', side: 'right' as const, top: 525 },
]
/* the three layer images share one box on the canvas (from the 2x export, in canvas px) */
const STACK_BOX = { x: 459, y: 82, w: 523, h: 712 }
const STACK_GAP = 140 // how far the outer layers start from their place (canvas px), closed up on the middle one

const READ_RULES = [
  { t: 'Right-aligned numbers', d: 'Same decimals and currency label in every column.' },
  { t: 'Red means act', d: 'Used for actions and risk only, never for decoration.' },
  { t: 'Status is written out', d: 'Pending, completed and failed are words, not just colours.' },
  { t: '16px minimum', d: 'No number on the dashboard is smaller than 16px.' },
]

/* daily rebate bars (Figma heights, 232px chart; 4px = market closed); day 17 is today */
const DAYS = [4, 136, 152, 128, 160, 144, 4, 4, 200, 168, 152, 184, 176, 4, 4, 192, 160]
const FUNNEL = [
  { t: 'Registered', v: '142', w: 472 },
  { t: 'Verified', v: '118  ·  24 dropped', w: 392 },
  { t: 'Funded', v: '97  ·  21 dropped', w: 322 },
  { t: 'Trading', v: '86  ·  11 dropped', w: 286 },
]
const CLIENTS = [
  { a: '6501428', s: 'Verification pending', act: true, dep: '—', lots: '0.0', reb: '$0.00' },
  { a: '6501391', s: 'Deposit failed', act: true, dep: '$500.00', lots: '0.0', reb: '$0.00' },
  { a: '6501207', s: 'Trading', act: false, dep: '$2,000.00', lots: '42.5', reb: '$108.00' },
  { a: '6500986', s: 'Trading', act: false, dep: '$5,000.00', lots: '118.0', reb: '$299.70' },
]

const DECISIONS = [
  { t: 'Bars, not a donut', d: 'The original dashboard showed rebate as a donut. Bars let an IB compare days at a glance.' },
  { t: 'A funnel for the client journey', d: 'Registered, verified, funded, trading. The drop between steps shows where clients get stuck.' },
  { t: 'Today stands out without red', d: "Today's bar is darker. Red stays for things an IB has to act on." },
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

const SLIDES = [
  { n: '01', t: 'Dashboard', d: 'Its pieces now sit in tabs, with a deposit button in the header and a rebate chart.', src: A5 + 'ba-dashboard.webp', alt: 'Dashboard, as-is 2022 and to-be: the to-be screen marks the Account and Summary tabs, the Deposit Now button in the header, the leverage column, the rebate summary chart and the ETO Blog bar' },
  { n: '02', t: 'Inbox', d: 'Registration, deposit and withdrawal were on one page. Each now has its own tab.', src: A5 + 'ba-inbox.webp', alt: 'Inbox, as-is 2022 and to-be: one mixed message list became a table with Registration, Deposit and Withdrawal tabs' },
  { n: '03', t: 'Tablet', d: 'Payment options became buttons, and the account list became cards with the key figures on top.', src: A5 + 'ba-tablet.webp', alt: 'Tablet, as-is and to-be: deposit methods as grouped buttons by currency, and the dashboard account table as a card with balance, equity and margin level' },
  { n: '04', t: 'Mobile', d: 'Account details and the QR code moved to their own pages. Tables became cards; a tap reveals the totals.', src: A5 + 'ba-mobile.webp', alt: 'Mobile, as-is and to-be: the dashboard as an account card, the QR code on its own page with a Copy Link button, and open positions as cards instead of a long form' },
]

const STILLS = [
  { k: 'DESKTOP · MY CLIENTS', src: IMG.protoDesktop, alt: 'Desktop prototype still: the change-leverage dialog over the dashboard' },
  { k: 'MOBILE · INBOX', src: IMG.protoInbox, alt: 'Mobile prototype still: the inbox with Registration, Deposit and Withdrawal tabs and a client card' },
  { k: 'MOBILE · DEPOSIT METHODS', src: IMG.protoDeposit, alt: 'Mobile prototype still: the opening screen of the deposit methods flow, a red circuit-board graphic' },
]

const RESULTS = [
  { k: 'SYSTEM ERRORS', big: '77% fewer', d: 'Error frequency dropped from 60% to 14%.', before: { v: '60%', w: 1 }, after: { v: '14%', w: 61 / 260 }, squares: false },
  { k: 'USER TRACKING', big: '2×', d: 'Tracked users rose from 15% to 30%.', before: { v: '15%', w: 130 / 260 }, after: { v: '30%', w: 1 }, squares: false },
  { k: 'COUNTRIES SERVED', big: '3×', d: 'The CRM went from 3 countries to 9.', before: { v: '3', w: 3 }, after: { v: '9', w: 9 }, squares: true },
]

/* ---------- interactive parts ---------- */

/** count-up for every [data-count] inside the page, once each, when it scrolls into view */
function useCountUp(scope: string) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(`${scope} [data-count]`))
    if (reducedMotion() || !('IntersectionObserver' in window)) return
    const parse = (s: string) => {
      const m = s.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/)
      if (!m) return null
      const num = parseFloat(m[2].replace(/,/g, ''))
      const dec = (m[2].split('.')[1] || '').length
      return { pre: m[1], num, dec, suf: m[3], comma: m[2].includes(',') }
    }
    const fmt = (p: NonNullable<ReturnType<typeof parse>>, v: number) => {
      let s = v.toFixed(p.dec)
      if (p.comma) { const [i, d] = s.split('.'); s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (d ? '.' + d : '') }
      return p.pre + s + p.suf
    }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return
      io.unobserve(e.target)
      const el = e.target as HTMLElement
      const p = parse(el.dataset.count || '')
      if (!p) return
      const t0 = performance.now(), dur = 1100
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - k, 3)
        el.textContent = fmt(p, p.num * ease)
        if (k < 1) requestAnimationFrame(tick)
        else el.textContent = el.dataset.count || ''
      }
      el.textContent = fmt(p, 0)
      requestAnimationFrame(tick)
    }), { threshold: 0.6 })
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [scope])
}

/** IB dashboard as three layers that move apart as the canvas scrolls in */
function TierStack() {
  const ref = useRef<HTMLDivElement>(null)
  const [hot, setHot] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion()) { el.style.setProperty('--o', '0px'); el.style.setProperty('--p', '1'); return }
    let raf = 0
    const run = () => {
      raf = 0
      const r = el.getBoundingClientRect(), vh = innerHeight
      const p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.65)))
      const e = 1 - Math.pow(1 - p, 3)
      el.style.setProperty('--o', `${((1 - e) * STACK_GAP * r.height / 840).toFixed(1)}px`)
      el.style.setProperty('--p', e.toFixed(3))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])
  const pct = (v: number, of: number) => `${(v / of) * 100}%`
  return (
    <>
      <Canvas className={'e5-stack' + (hot ? ' has-hot' : '')} label="ONE DASHBOARD, THREE LAYERS" labelTone="red">
        <div ref={ref} className="e5-stack-in">
          <div className="e5-layers" style={{ left: pct(STACK_BOX.x, 1440), top: pct(STACK_BOX.y, 840), width: pct(STACK_BOX.w, 1440), height: pct(STACK_BOX.h, 840) }}>
            {/* bottom layer first so tier 1 sits on top */}
            {[3, 2, 1].map(n => (
              <img key={n} className={'e5-layer l' + n + (hot === n ? ' on' : '')} src={IMG.tiers[n - 1]} alt="" width={1046} height={1424} loading="lazy" decoding="async" />
            ))}
          </div>
          {TIERS.map(t => (
            <div key={t.n} className={'e5-tierlab l' + t.n + ' ' + t.side + (hot === t.n ? ' on' : '')} style={{ top: pct(t.top, 840) }}
              tabIndex={0} onMouseEnter={() => setHot(t.n)} onMouseLeave={() => setHot(0)} onFocus={() => setHot(t.n)} onBlur={() => setHot(0)}>
              <span className="lead" aria-hidden="true"><i /></span>
              <div className="tx">
                <div className={'tn' + (t.n === 1 ? ' red' : '')}>TIER {t.n}</div>
                <h3>{t.t}</h3>
                <p>{t.d}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="sr-only">Isometric drawing of the IB dashboard split into three stacked layers: tier 1 Act now on top (alerts and today's rebate, outlined in red), tier 2 Monitor in the middle (monthly totals, the daily rebate bars and the client funnel), tier 3 Reference at the bottom (the clients table).</p>
      </Canvas>
      {/* small screens: the tier labels as a list under the drawing */}
      <ol className="e5-tierlist">
        {TIERS.map(t => (
          <li key={t.n}><div className={'tn' + (t.n === 1 ? ' red' : '')}>TIER {t.n}</div><h3>{t.t}</h3><p>{t.d}</p></li>
        ))}
      </ol>
    </>
  )
}

/** the full IB dashboard concept (sample data), built as UI so it can move */
function DashboardConcept() {
  const [copied, setCopied] = useState(false)
  useEffect(() => { if (!copied) return; const t = window.setTimeout(() => setCopied(false), 2000); return () => clearTimeout(t) }, [copied])
  const max = 232
  return (
    <figure className="e5-dash-fig" data-r>
      <div className="e5-dash" role="group" aria-label="IB dashboard concept with sample data">
        <div className="d-head">
          <div><div className="d-title">Partner portal · IB dashboard</div><div className="d-sub">Overview · this month</div></div>
          <div className="d-actions">
            <span className="d-tag">Sample data · Concept</span>
            <button type="button" className="d-btn" onClick={() => setCopied(true)} aria-live="polite">{copied ? 'Link copied ✓' : 'Share registration link'}</button>
          </div>
        </div>
        <div className="d-row r3">
          <div className="d-card alert"><div className="d-alert"><Count className="big" value="6" /><span>clients stuck at verification</span></div><p>Uploaded ID more than 48 hours ago</p></div>
          <div className="d-card alert"><div className="d-alert"><Count className="big" value="2" /><span>deposits failed today</span></div><p>Card declined · client notified</p></div>
          <div className="d-card"><div className="d-k">Today's rebate</div><Count className="d-v xl" value="$248.60" /><p>From 31 trades by 12 clients</p></div>
        </div>
        <div className="d-row r4">
          <div className="d-card"><div className="d-k">Rebate this month</div><Count className="d-v" value="$3,054.60" /><p>↑ 12% on last month</p></div>
          <div className="d-card"><div className="d-k">Active clients</div><Count className="d-v" value="86" /><p>Traded at least once this month</p></div>
          <div className="d-card"><div className="d-k">Lots traded</div><Count className="d-v" value="1,204.5" /><p>Average $2.54 rebate per lot</p></div>
          <div className="d-card"><div className="d-k">Sub-IB rebates</div><Count className="d-v" value="$412.80" /><p>From 3 sub-IBs</p></div>
        </div>
        <div className="d-row charts">
          <div className="d-card chart">
            <div className="d-ch"><span className="d-ct">Daily rebate, this month</span><span className="d-note">Weekends: markets closed</span></div>
            <div className="d-bars" role="img" aria-label="Daily rebate bars for days 1 to 17; weekends are empty; today, day 17, is the dark bar at $249">
              {DAYS.map((h, i) => {
                const today = i === DAYS.length - 1, closed = h <= 4
                return (
                  <div key={i} className={'d-day' + (today ? ' today' : '') + (closed ? ' closed' : '')} style={{ '--d': `${i * 45}ms` } as React.CSSProperties}>
                    <div className="d-col">
                      {today && <span className="d-val">$249</span>}
                      <i style={{ height: `${(h / max) * 100}%` }} />
                    </div>
                    <span className="d-x">{i + 1}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="d-card funnel">
            <div className="d-ct">Where clients are</div>
            {FUNNEL.map((f, i) => (
              <div key={f.t} className="d-step" style={{ '--d': `${200 + i * 160}ms` } as React.CSSProperties}>
                <div className="d-sl"><span>{f.t}</span><span className="v">{f.v}</span></div>
                <div className="d-track"><i style={{ width: `${(f.w / 472) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="d-card table">
          <div className="d-ct">Clients to act on</div>
          <div className="d-scroll">
            <table>
              <thead><tr><th>Account</th><th>Status</th><th className="num">Deposit</th><th className="num">Lots</th><th className="num">Rebate</th></tr></thead>
              <tbody>
                {CLIENTS.map(c => (
                  <tr key={c.a}><td>{c.a}</td><td className={c.act ? 'act' : undefined}>{c.s}</td><td className="num">{c.dep}</td><td className="num">{c.lots}</td><td className="num">{c.reb}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <figcaption className="e5-cap">Concept with sample data. Tier 1 sits on top in red, tier 2 below in regular weight, and the charts answer two questions: how did my rebate move this month, and where are my clients getting stuck?</figcaption>
    </figure>
  )
}

/** the portal menu before and after, with a legend that lights up one kind of change */
function MenuBeforeAfter() {
  const [pick, setPick] = useState<Tag | null>(null)
  const [hover, setHover] = useState<Tag | null>(null)
  const on = hover || pick
  const tagEl = (t: Tag) => <span className={'e5-tag t-' + t.toLowerCase()}>{t}</span>
  const col = (c: MenuCol, after: boolean) => {
    const lit = !on || !after ? true : c.tag === on || c.items.some(i => i.tag === on)
    return (
      <div key={c.h} className={'e5-mcol' + (lit ? '' : ' dim')}>
        <div className={'mh' + (after && on && c.tag === on ? ' lit' : '')}>{c.h}</div>
        {c.tag && <div className="mt">{tagEl(c.tag)}</div>}
        <ul>
          {c.items.map(i => (
            <li key={i.t} className={after && on && (i.tag === on || c.tag === on) ? 'lit' : undefined}>{i.t}{i.tag && <> {tagEl(i.tag)}</>}</li>
          ))}
        </ul>
      </div>
    )
  }
  return (
    <figure className="e5-menu-fig" data-r>
      <Canvas className={'e5-menu' + (on ? ' filtering' : '')}>
        <div className="e5-mk">BEFORE · 2022 PORTAL</div>
        <div className="e5-mbox before">{MENU_BEFORE.map(c => col(c, false))}</div>
        <div className="e5-marrow" aria-hidden="true">↓</div>
        <div className="e5-mk after">AFTER · REDESIGN</div>
        <div className="e5-mbox after">{MENU_AFTER.map(c => col(c, true))}</div>
        <div className="e5-legend" role="group" aria-label="Show one kind of change">
          {TAG_LEGEND.map(l => (
            <button key={l.tag} type="button" className={'e5-lg' + (on === l.tag ? ' on' : '')} aria-pressed={pick === l.tag}
              onMouseEnter={() => setHover(l.tag)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(l.tag)} onBlur={() => setHover(null)}
              onClick={() => setPick(p => (p === l.tag ? null : l.tag))}>
              {tagEl(l.tag)}<span>{l.d}</span>
            </button>
          ))}
        </div>
      </Canvas>
      <figcaption className="e5-cap">Menu of the 2022 portal (top) and the redesign (bottom). Sub-menus that were collapsed in the 2022 screenshots are not listed.</figcaption>
    </figure>
  )
}

/** Before → After: the sideways slider */
function Slider() {
  const ref = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)

  const step = useCallback(() => {
    const el = ref.current
    if (!el) return 1
    const s = el.querySelector<HTMLElement>('.e5-slide')
    const gap = parseFloat(getComputedStyle(el).columnGap || '40') || 40
    return (s ? s.offsetWidth : 1) + gap
  }, [])
  const go = useCallback((i: number) => {
    const el = ref.current
    if (!el) return
    const n = SLIDES.length, to = (i + n) % n
    el.scrollTo({ left: to * step(), behavior: reducedMotion() ? 'auto' : 'smooth' })
  }, [step])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const run = () => { raf = 0; setIdx(Math.max(0, Math.min(SLIDES.length - 1, Math.round(el.scrollLeft / step())))) }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    el.addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    return () => { if (raf) cancelAnimationFrame(raf); el.removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [step])

  // mouse drag (touch and trackpads scroll natively)
  const down = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !ref.current) return
    drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false }
    ref.current.setPointerCapture(e.pointerId)
    ref.current.classList.add('dragging')
  }
  const move = (e: React.PointerEvent) => {
    const d = drag.current, el = ref.current
    if (!d || !el) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 4) d.moved = true
    el.scrollLeft = d.left - dx
  }
  const up = () => {
    const d = drag.current, el = ref.current
    if (!d || !el) return
    drag.current = null
    el.classList.remove('dragging')
    const dx = el.scrollLeft - d.left, s = step()
    const from = Math.round(d.left / s)
    go(Math.abs(dx) > s * 0.15 ? from + Math.sign(dx) : from)
  }
  const key = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1) }
  }

  return (
    <div className="e5-slider" data-r>
      <div ref={ref} className="e5-track" tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Before and after screens, use the arrow keys to move"
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}
        onClickCapture={e => { if (drag.current?.moved) e.preventDefault() }}>
        {SLIDES.map((s, i) => (
          <div key={s.n} className={'e5-slide' + (i === idx ? ' on' : '')} role="group" aria-roledescription="slide" aria-label={`${s.n} of 04, ${s.t}`} aria-hidden={i !== idx || undefined}>
            <div className="card"><img src={s.src} alt={s.alt} width={2400} height={1280} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" draggable={false} /></div>
            <div className="cap"><h3>{s.n}. {s.t}</h3><p>{s.d}</p></div>
          </div>
        ))}
      </div>
      <div className="e5-sl-ctrl">
        <div className="count" aria-live="polite"><b>{SLIDES[idx].n}</b> / {String(SLIDES.length).padStart(2, '0')}</div>
        <div className="arrows">
          <button type="button" onClick={() => go(idx - 1)} aria-label="Previous screen"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          <button type="button" onClick={() => go(idx + 1)} aria-label="Next screen"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        </div>
      </div>
    </div>
  )
}

/* ---------- page ---------- */

export function EtoV5() {
  const [introOn] = useState(() => !reducedMotion())
  const [intro, setIntro] = useState(introOn)
  const away = useHeadroom()
  const slot = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const media = useRef<HTMLVideoElement>(null)
  useCaseIntro(introOn, slot, box, media, () => setIntro(false))
  useCountUp('.e5')

  // Discover pins: pulse one after another when the old portal comes into view; Define's pin badges point back here
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

  // benchmark: point at a broker to light up its column
  const [col, setCol] = useState(-1)

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
      const p = (innerHeight - r.top) / (innerHeight + r.height) // 0 → 1 while it crosses the screen
      img.style.transform = `translate3d(0, ${((p - 0.5) * -8).toFixed(2)}%, 0) scale(1.12)`
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true })
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on) }
  }, [])

  return (
    <div className={'hb eto e5' + (intro ? ' intro-on' : '')}>
      <style>{CSS + E5_CSS}</style>
      <SiteHeaderB mode="light" hidden={intro} away={away} />
      <SideToc chapters={E5_CHAPTERS} scope=".e5" hidden={intro} />

      <main id="top">
        {/* Hero + meta */}
        <section className="e5-hero" data-chapter="ETO Markets" aria-label="ETO Markets">
          <div className="e5-w">
            <div className="e5-brand"><img src={IMG.mark} alt="" width={48} height={48} /><span>ETO Markets</span></div>
            <h1 className="e5-h1">A broker CRM rebuilt<br />for its IB partners</h1>
            <p className="e5-sub">Reinterpreting the client CRM dashboard I designed at ETO Markets (Sydney).</p>
            <div className="e5-slot" ref={slot}>
              <div className="e5-box" ref={box}><CaseFilm src={IMG.video} poster={IMG.poster} label={FILM_LABEL} quiet={intro} introRef={media} /></div>
            </div>
            <div className="e5-meta">
              <div><div className="k">TIMELINE</div><p>9 months, in-house<br />Dashboard redesigned for this case study</p></div>
              <div><div className="k">ROLE</div><p>UI &amp; UX designer<br />Web, tablet, iOS and Android</p></div>
              <div><div className="k">INDUSTRY</div><p>Fintech, online trading, CRM</p></div>
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
          <div className="e5-arch mt64" data-r>
            <Canvas>
              <Pic src={IMG.arch} w={1600} h={600}
                alt="Diagram of the ETO CRM: users (trader, introducing broker) log into two portals (client portal, partner portal) and move through five steps — sign up, verify ID, fund, trade, withdraw and stay. These feed the CRM core (clients, KYC, transactions), which connects to MT4/MT5, payments and rebates, and to the back office (sales, account managers). On the right, an ETO CRM window shows a rebate summary of $11,295.27 and clients marked incomplete, unverified or completed." />
            </Canvas>
          </div>
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

            <div className="e5-bench mt120">
              <div className="e5-bench-tx" data-r>
                <h2 className="e5-h2">Four brokers as a benchmark</h2>
                <p className="e5-body mt24">I compared four brokers on seven criteria. The strongest portals put the account summary first and keep money actions one tap away.</p>
              </div>
              <div data-r>
                <Canvas className="e5-bm" label="BENCHMARK · 4 BROKERS" labelTone="purple">
                  <div className="e5-bm-scroll">
                    <table className="e5-bm-t" onMouseLeave={() => setCol(-1)}>
                      <thead>
                        <tr>
                          <th scope="col" className="crit">CRITERIA</th>
                          {BROKERS.map((b, i) => (
                            <th key={b.name} scope="col" className={col === i ? 'hot' : undefined} onMouseEnter={() => setCol(i)}>
                              <img src={b.logo} alt={b.name} width={b.w} height={b.h} loading="lazy" decoding="async" />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {CRITERIA.map((c, r) => (
                          <tr key={c.t} style={{ '--d': `${r * 70}ms` } as React.CSSProperties}>
                            <th scope="row">{c.t}</th>
                            {c.m.map((m, i) => (
                              <td key={i} className={col === i ? 'hot' : undefined} onMouseEnter={() => setCol(i)}>
                                <MarkIcon m={m} /><span className="sr-only">{BROKERS[i].name}: {MARK_NAME[m]}</span>
                              </td>
                            ))}
                          </tr>
                        ))}
                        <tr className="tot">
                          <th scope="row">FEATURED</th>
                          {BROKERS.map((b, i) => <td key={b.name} className={col === i ? 'hot' : undefined} onMouseEnter={() => setCol(i)}>{b.score}</td>)}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="e5-bm-legend">
                    {(['G', 'B', 'R'] as Mark[]).map(m => <span key={m}><MarkIcon m={m} size={20} />{MARK_NAME[m]}</span>)}
                  </div>
                </Canvas>
              </div>
            </div>

            <div className="mt120" data-r>
              <h2 className="e5-h2">Where it started</h2>
              <p className="e5-body w960 mt24">Before any screen, I mapped what ETO sells and how a client moves through it. These notes became the five steps above.</p>
              <Canvas className="e5-research mt64">
                {RESEARCH.map(r => (
                  <figure key={r.k}>
                    <div className="k">{r.k}</div>
                    <div className="ph"><Pic src={r.src} w={r.w} h={r.h} alt={r.alt} /></div>
                    <figcaption>{r.c}</figcaption>
                  </figure>
                ))}
              </Canvas>
            </div>
          </div>
        </section>

        {/* Define */}
        <section className="e5-sec e5-soft" data-chapter="Define">
          <div className="e5-w e5-define">
            <div data-r>
              <Label>DEFINE</Label>
              <h2 className="e5-h2 mt24">The new portal puts what IBs need first</h2>
              <p className="e5-body mt24">The old page showed everything at once. I set three rules so IBs see what they came for before anything else.</p>
            </div>
            <div data-r>
              <Canvas className="e5-rules" label="DISCOVER  →  DEFINE" labelTone="red">
                <ol className="e5-rlist">
                  {RULES_DEFINE.map((r, i) => (
                    <li key={r.t} style={{ '--d': `${i * 120}ms` } as React.CSSProperties}>
                      <span className="no">{String(i + 1).padStart(2, '0')}</span>
                      <div className="tx"><h3>{r.t}</h3><p>{r.d}</p></div>
                      <div className="src">
                        {r.pins.map(p => (
                          <button key={p} type="button" className="e5-pin" onClick={() => showPin(p)} aria-label={`Show pin ${String(p).padStart(2, '0')} on the old portal`} title="Show it on the old portal">{String(p).padStart(2, '0')}</button>
                        ))}
                        {r.isNew && <span className="e5-newtag">New</span>}
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="e5-nextq"><span className="k">NEXT</span><span>Every screen asks one question: does the IB need to act on this now?</span></div>
                <div className="e5-pinkey"><span className="e5-pin static" aria-hidden="true">01</span>Pin on the old portal in Discover</div>
              </Canvas>
            </div>
          </div>
        </section>

        {/* IB dashboard redesign */}
        <section className="e5-sec" data-chapter="IB dashboard">
          <div className="e5-w">
            <Label>IB DASHBOARD REDESIGN</Label>
            <h2 className="e5-h2 mt24">Redesigning the dashboard for IBs</h2>
            <p className="e5-body w960 mt24">For this case study I went back to the dashboard. I listed every number and action an IB sees, then sorted them by one question: does the IB need to act on this now? That gave three tiers, and each tier got its own position, size and colour.</p>
            <div className="mt64"><TierStack /></div>
            <div className="e5-cols4 mt64" data-r>
              {READ_RULES.map(r => <div key={r.t}><h3>{r.t}</h3><p>{r.d}</p></div>)}
            </div>
            <div className="mt64"><DashboardConcept /></div>
            <div className="e5-cols3 mt64" data-r>
              {DECISIONS.map(r => <div key={r.t}><h3>{r.t}</h3><p>{r.d}</p></div>)}
            </div>
            <h2 className="e5-h2 mt120">The menu, before and after</h2>
            <p className="e5-body w960 mt24">The dashboard sat inside a portal menu that changed too. Pages that held everything were split into tabs, and deposit got its own button in the header.</p>
            <div className="mt64"><MenuBeforeAfter /></div>
          </div>
        </section>

        {/* Before → After */}
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
            <h2 className="e5-h2 mt24">Try the prototype</h2>
            <p className="e5-body w960 mt24">The redesign shipped on web, tablet, iOS and Android. These are stills from the Figma prototypes.</p>
            <div className="e5-links mt64">
              <a href={PROTO.desktop} target="_blank" rel="noreferrer">Desktop prototype <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>
              <a href={PROTO.mobile} target="_blank" rel="noreferrer">Mobile prototype <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>
            </div>
            <div className="e5-stills mt64" data-r>
              {STILLS.map(s => (
                <figure key={s.k}>
                  <div className="k">{s.k}</div>
                  <Canvas className="fr"><div className="ph"><Pic src={s.src} w={464} h={580} alt={s.alt} /></div></Canvas>
                </figure>
              ))}
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
                  <div className="k">{r.k}</div>
                  <Count className="big" value={r.big} />
                  <p className="d">{r.d}</p>
                  <div className="ch" role="img" aria-label={`${r.k.toLowerCase()}: ${r.before.v} before, ${r.after.v} after`}>
                    {(['before', 'after'] as const).map(w => {
                      const v = r[w]
                      return (
                        <div key={w} className={'rr ' + w}>
                          <span className="lab">{w === 'before' ? 'AS-IS' : 'TO-BE'}</span>
                          <span className="bar">
                            {r.squares
                              ? <span className="sq">{Array.from({ length: v.w }, (_, i) => <i key={i} style={{ '--d': `${i * 70}ms` } as React.CSSProperties} />)}</span>
                              : <i style={{ width: `${v.w * 65}%` }} />}
                            <span className="val">{v.v}</span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
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

const E5_CSS = `
.e5 { --ink: #000D10; --red: #E31E24; --soft: #FDF2F2; --canvas: #FFF9F8; --cline: #EAD3D4; --rline: #EFE3E4; --grey: #616166; --ash: #8E8E95;
  --line: #E2E2E4; --chip: #F5F5F6; --green: #2BA36B; --blue: #3A7BE0; --purple: #8E5BD0; --night: #141213;
  background: #FFFFFF; color: var(--ink); }
.e5 .e5-w { display: block; width: min(1440px, calc(100vw - 64px)); margin: 0 auto; }
.e5 h1, .e5 h2, .e5 h3, .e5 p, .e5 figure, .e5 ol, .e5 ul, .e5 blockquote { margin: 0; padding: 0; }
.e5 ol, .e5 ul { list-style: none; }
.e5 .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.e5 .mt24 { margin-top: 24px; } .e5 .mt32 { margin-top: 32px; } .e5 .mt48 { margin-top: 48px; } .e5 .mt64 { margin-top: 64px; } .e5 .mt120 { margin-top: 120px; }
.e5 .w960 { max-width: 960px; }
.e5 .e5-img { display: block; width: 100%; height: auto; }
.e5 img, .e5 video, .e5 figure { border-radius: 0; }

/* reveal */
.e5 [data-r] { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .9s cubic-bezier(.22,1,.36,1); }
.e5 [data-r].in { opacity: 1; transform: none; }

/* type */
.e5 .e5-label { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; line-height: 24px; color: var(--ash); }
.e5 .e5-label i { width: 16px; height: 16px; background: var(--ash); }
.e5 .e5-label.light { color: rgba(255,255,255,.72); } .e5 .e5-label.light i { background: rgba(255,255,255,.72); }
.e5 .e5-h2 { font-size: 40px; font-weight: 700; line-height: 48px; color: var(--ink); }
.e5 .e5-rt { flex: none; width: 368px; font-size: 24px; font-weight: 700; line-height: 32px; color: var(--ink); }
.e5 .e5-body { font-size: 18px; line-height: 28px; color: var(--ink); }
.e5 .e5-cap { margin-top: 16px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .k { font-size: 16px; line-height: 24px; font-weight: 500; color: var(--ink); }

/* canvas (Figma's dotted frames with corner handles) */
.e5 .e5-canvas { position: relative; background-color: var(--canvas); box-shadow: inset 0 0 0 1px var(--cline);
  background-image: radial-gradient(circle, #E9D6D7 1.2px, transparent 1.4px); background-size: 40px 40px; background-position: 20px 20px; }
.e5 .e5-canvas > .hd { position: absolute; z-index: 2; width: 8px; height: 8px; background: #FFFFFF; box-shadow: inset 0 0 0 1px #C9B4B5; }
.e5 .e5-canvas > .hd.tl { left: -4px; top: -4px; } .e5 .e5-canvas > .hd.tr { right: -4px; top: -4px; }
.e5 .e5-canvas > .hd.bl { left: -4px; bottom: -4px; } .e5 .e5-canvas > .hd.br { right: -4px; bottom: -4px; }
.e5 .e5-canvas-k { font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .02em; }
.e5 .e5-canvas-k.red { color: var(--red); } .e5 .e5-canvas-k.purple { color: var(--purple); } .e5 .e5-canvas-k.ink { color: var(--ink); }

/* hero */
.e5 .e5-hero { padding: 120px 0; }
.e5 .e5-brand { display: flex; align-items: center; gap: 16px; font-size: 24px; font-weight: 700; line-height: 32px; }
.e5 .e5-brand img { display: block; width: 48px; height: 48px; }
.e5 .e5-h1 { margin-top: 32px; max-width: 960px; font-size: 64px; font-weight: 700; line-height: 72px; letter-spacing: -0.01em; }
.e5 .e5-sub { margin-top: 24px; max-width: 960px; font-size: 18px; line-height: 28px; }
.e5 .e5-slot { position: relative; margin-top: 32px; aspect-ratio: 16 / 9; }
.e5 .e5-box { position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 40; overflow: hidden; background: ${DARK}; border-radius: 0; }
.e5 .e5-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin-top: 64px; }
.e5 .e5-meta p { margin-top: 8px; font-size: 18px; line-height: 28px; }

/* sections */
.e5 .e5-sec { padding: 120px 0; }
.e5 .e5-soft { background: var(--soft); }
.e5 .e5-stack64 { display: flex; flex-direction: column; gap: 64px; }
.e5 .e5-row { display: flex; align-items: flex-start; }
.e5 .e5-row > .e5-body, .e5 .e5-row > .e5-impact { flex: 1; min-width: 0; max-width: 960px; }

/* overview impact */
.e5 .e5-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.e5 .e5-stats > div { padding: 8px 24px; border-left: 1px solid var(--line); }
.e5 .e5-stats .n { display: block; font-size: 48px; font-weight: 700; line-height: 56px; color: var(--red); white-space: nowrap; font-variant-numeric: tabular-nums; }
.e5 .e5-stats p { margin-top: 8px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-note { margin-top: 16px; font-size: 16px; line-height: 24px; color: var(--grey); }

/* context: Figma's 1600px canvas */
.e5 .e5-arch { width: min(1600px, calc(100vw - 32px)); margin-left: auto; margin-right: auto; }
.e5 .e5-arch .e5-canvas { background-image: none; }

/* discover: old portal + pins */
.e5 .e5-oldc { background-image: none; }
.e5 .e5-old { position: relative; }
.e5 .e5-ring { position: absolute; width: 1.95%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; pointer-events: none; }
.e5 .e5-ring::before, .e5 .e5-ring::after { content: ""; position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--red); opacity: 0; }
.e5 .e5-old.pins-on .e5-ring::before { animation: e5-ping 2.4s cubic-bezier(.22,1,.36,1) var(--d, 0s) 2; }
.e5 .e5-ring.hot::before, .e5 .e5-ring.hot::after { animation: e5-ping 1.2s cubic-bezier(.22,1,.36,1) 0s 3 !important; }
.e5 .e5-ring.hot::after { animation-delay: .4s !important; }
@keyframes e5-ping { 0% { opacity: .9; transform: scale(1); } 100% { opacity: 0; transform: scale(2.6); } }

/* benchmark */
.e5 .e5-bench { display: grid; grid-template-columns: minmax(0, 496px) minmax(0, 880px); justify-content: space-between; align-items: center; gap: 64px; }
.e5 .e5-bm { padding: 20px 40px 40px; }
.e5 .e5-bm-scroll { margin-top: 16px; overflow-x: auto; }
.e5 .e5-bm-t { width: 100%; min-width: 640px; border-collapse: collapse; background: #FFFFFF; box-shadow: 0 0 0 1px #E2D3D4; font-size: 16px; line-height: 24px; }
.e5 .e5-bm-t thead th { height: 48px; padding: 0 12px; background: #F7EFEF; text-align: center; vertical-align: middle; transition: background-color .2s; }
.e5 .e5-bm-t thead th.crit { text-align: left; padding-left: 24px; font-weight: 500; color: var(--ash); }
.e5 .e5-bm-t thead img { display: inline-block; height: 28px; width: auto; max-width: 106px; object-fit: contain; vertical-align: middle; mix-blend-mode: multiply; }
.e5 .e5-bm-t tbody th { width: 34%; padding: 0 12px 0 24px; text-align: left; font-weight: 500; color: var(--ink); }
.e5 .e5-bm-t tbody tr { height: 56px; border-top: 1px solid #F0E6E6; }
.e5 .e5-bm-t td { text-align: center; vertical-align: middle; transition: background-color .2s; }
.e5 .e5-bm-t td.hot, .e5 .e5-bm-t th.hot { background: #FBF2F2; }
.e5 .e5-bm-t thead th.hot { background: #F1E3E3; }
.e5 .e5-bm-t tr.tot th, .e5 .e5-bm-t tr.tot td { font-weight: 700; color: var(--ink); }
.e5 .e5-mark { display: inline-block; vertical-align: middle; }
.e5 .e5-mark.mG { color: var(--green); } .e5 .e5-mark.mB { color: var(--blue); } .e5 .e5-mark.mR { color: var(--red); }
.e5 .e5-bm-t tbody tr:not(.tot) .e5-mark { transform: scale(.4); opacity: 0; transition: transform .45s cubic-bezier(.34,1.56,.64,1) var(--d, 0s), opacity .3s ease var(--d, 0s); }
.e5 [data-r].in .e5-bm-t tbody tr .e5-mark { transform: none; opacity: 1; }
.e5 .e5-bm-legend { display: flex; flex-wrap: wrap; gap: 24px; margin-top: 24px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-bm-legend span { display: inline-flex; align-items: center; gap: 8px; }

/* research photos */
.e5 .e5-research { display: grid; grid-template-columns: 530fr 253fr 253fr 253fr; gap: 24px; padding: 40px; }
.e5 .e5-research .k { font-size: 16px; font-weight: 700; line-height: 24px; color: var(--red); white-space: nowrap; }
.e5 .e5-research .ph { margin-top: 16px; aspect-ratio: 253 / 192; overflow: hidden; background: #EEE; }
.e5 .e5-research figure:first-child .ph { aspect-ratio: 530 / 192; }
.e5 .e5-research .ph img { width: 100%; height: 100%; object-fit: cover; transition: transform .6s cubic-bezier(.22,1,.36,1); }
.e5 .e5-research figure:hover .ph img { transform: scale(1.05); }
.e5 .e5-research figcaption { margin-top: 16px; font-size: 16px; line-height: 24px; color: var(--grey); }

/* define */
.e5 .e5-define { display: grid; grid-template-columns: minmax(0, 496px) minmax(0, 880px); justify-content: space-between; gap: 64px; align-items: start; }
.e5 .e5-rules { padding: 40px; }
.e5 .e5-rlist { margin-top: 24px; background: #FFFFFF; box-shadow: 0 0 0 1px #E2D3D4; }
.e5 .e5-rlist li { display: flex; align-items: flex-start; gap: 16px; padding: 24px; border-top: 1px solid var(--rline);
  opacity: 0; transform: translateX(16px); transition: opacity .5s ease var(--d, 0s), transform .6s cubic-bezier(.22,1,.36,1) var(--d, 0s); }
.e5 .e5-rlist li:first-child { border-top: 0; }
.e5 [data-r].in .e5-rlist li { opacity: 1; transform: none; }
.e5 .e5-rlist .no { flex: none; width: 24px; font-size: 16px; font-weight: 700; line-height: 32px; color: var(--red); }
.e5 .e5-rlist .tx { flex: 1; min-width: 0; }
.e5 .e5-rlist h3 { font-size: 24px; font-weight: 700; line-height: 32px; }
.e5 .e5-rlist p { margin-top: 8px; font-size: 18px; line-height: 28px; color: var(--grey); }
.e5 .e5-rlist .src { flex: none; display: flex; gap: 4px; padding-top: 2px; }
.e5 .e5-pin { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0; border: 2px solid #FFFFFF; border-radius: 50%;
  background: var(--red); color: #FFFFFF; font-size: 16px; font-weight: 700; line-height: 1; letter-spacing: -0.02em; cursor: pointer; font-variant-numeric: tabular-nums;
  box-shadow: 0 0 0 1px rgba(227,30,36,.2); transition: transform .2s ease, box-shadow .2s ease; }
.e5 button.e5-pin:hover { transform: scale(1.12); box-shadow: 0 0 0 4px rgba(227,30,36,.18); }
.e5 button.e5-pin:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.e5 .e5-pin.static { cursor: default; }
.e5 .e5-newtag { display: inline-flex; align-items: center; height: 24px; padding: 0 8px; background: #F2F2F3; border-radius: 4px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-nextq { display: flex; align-items: baseline; gap: 16px; margin-top: 16px; padding: 24px; background: #231F20; color: #FFFFFF; font-size: 18px; font-weight: 500; line-height: 28px; }
.e5 .e5-nextq .k { flex: none; color: #F07F83; font-size: 16px; font-weight: 700; letter-spacing: .04em; }
.e5 .e5-pinkey { display: flex; align-items: center; gap: 8px; margin-top: 16px; font-size: 16px; line-height: 24px; color: var(--grey); }

/* IB dashboard: three layers */
.e5 .e5-stack { aspect-ratio: 1440 / 840; overflow: hidden; }
.e5 .e5-stack > .e5-canvas-k { position: absolute; left: 2.78%; top: 40px; z-index: 3; }
.e5 .e5-stack-in { position: absolute; inset: 0; --o: ${STACK_GAP}px; --p: 0; }
.e5 .e5-layers { position: absolute; }
.e5 .e5-layer { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; transition: opacity .3s ease, filter .3s ease; will-change: transform; }
.e5 .e5-layer.l1 { transform: translateY(var(--o)); }
.e5 .e5-layer.l3 { transform: translateY(calc(var(--o) * -1)); }
.e5 .e5-stack.has-hot .e5-layer:not(.on) { opacity: .28; filter: grayscale(.6); }
.e5 .e5-tierlab { position: absolute; display: flex; align-items: flex-start; gap: 0; width: 30%; cursor: default; outline: none; opacity: var(--p); }
.e5 .e5-tierlab.l1 { transform: translateY(var(--o)); }
.e5 .e5-tierlab.l3 { transform: translateY(calc(var(--o) * -1)); }
.e5 .e5-tierlab.right { left: 67.78%; }
.e5 .e5-tierlab.left { right: 67.78%; flex-direction: row-reverse; text-align: right; }
.e5 .e5-tierlab .lead { position: relative; flex: none; width: 72px; height: 2px; margin-top: 61px; background: var(--ink); }
.e5 .e5-tierlab .lead i { position: absolute; top: -3px; width: 8px; height: 8px; border-radius: 50%; background: var(--ink); }
.e5 .e5-tierlab.right .lead { margin-right: 16px; } .e5 .e5-tierlab.right .lead i { left: -4px; }
.e5 .e5-tierlab.left .lead { margin-left: 16px; } .e5 .e5-tierlab.left .lead i { right: -4px; }
.e5 .e5-tierlab.l1 .lead, .e5 .e5-tierlab.l1 .lead i { background: var(--red); }
.e5 .e5-tierlab .tx { flex: 1; min-width: 0; max-width: 320px; }
.e5 .tn { font-size: 16px; font-weight: 500; line-height: 24px; color: var(--ash); }
.e5 .tn.red { color: var(--red); }
.e5 .e5-tierlab h3, .e5 .e5-tierlist h3 { margin-top: 8px; font-size: 28px; font-weight: 700; line-height: 36px; }
.e5 .e5-tierlab p, .e5 .e5-tierlist p { margin-top: 8px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-tierlab.on h3 { color: var(--red); }
.e5 .e5-tierlab:focus-visible .tx { outline: 2px solid var(--ink); outline-offset: 6px; }
.e5 .e5-tierlist { display: none; }

.e5 .e5-cols4, .e5 .e5-cols3 { display: grid; gap: 24px; }
.e5 .e5-cols4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.e5 .e5-cols3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.e5 .e5-cols4 > div, .e5 .e5-cols3 > div { padding: 24px 24px 0; border-top: 2px solid var(--ink); }
.e5 .e5-cols4 h3, .e5 .e5-cols3 h3 { font-size: 20px; font-weight: 700; line-height: 28px; }
.e5 .e5-cols4 p, .e5 .e5-cols3 p { margin-top: 8px; font-size: 16px; line-height: 24px; color: var(--grey); }

/* IB dashboard concept (product UI: keeps its own rounded corners) */
.e5 .e5-dash { display: flex; flex-direction: column; gap: 24px; padding: 32px; background: #F9F9FA; border: 1px solid #E5E5E8; border-radius: 24px; }
.e5 .e5-dash .d-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.e5 .e5-dash .d-title { font-size: 24px; font-weight: 700; line-height: 32px; }
.e5 .e5-dash .d-sub { margin-top: 4px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-dash .d-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.e5 .e5-dash .d-tag { display: inline-flex; align-items: center; height: 42px; padding: 0 16px; background: #FFFFFF; border: 1px solid #E5E5E8; border-radius: 999px; font-size: 16px; font-weight: 500; color: var(--grey); }
.e5 .e5-dash .d-btn { min-width: 218px; height: 48px; padding: 0 24px; border: 0; border-radius: 8px; background: var(--red); color: #FFFFFF; font-size: 16px; font-weight: 500; cursor: pointer; transition: background-color .2s, transform .2s; }
.e5 .e5-dash .d-btn:hover { background: #C8161C; }
.e5 .e5-dash .d-btn:active { transform: scale(.98); }
.e5 .e5-dash .d-btn:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
.e5 .e5-dash .d-row { display: grid; gap: 24px; }
.e5 .e5-dash .d-row.r3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.e5 .e5-dash .d-row.r4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.e5 .e5-dash .d-row.charts { grid-template-columns: minmax(0, 830fr) minmax(0, 520fr); }
.e5 .e5-dash .d-card { display: flex; flex-direction: column; gap: 8px; padding: 24px; background: #FFFFFF; border: 1px solid #E5E5E8; border-radius: 16px; min-width: 0; }
.e5 .e5-dash .d-card.alert { border-color: var(--red); }
.e5 .e5-dash .d-card p { font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-dash .d-alert { display: flex; align-items: baseline; gap: 12px; font-size: 18px; font-weight: 500; line-height: 28px; }
.e5 .e5-dash .d-alert .big { font-size: 40px; font-weight: 700; line-height: 48px; color: var(--red); font-variant-numeric: tabular-nums; }
.e5 .e5-dash .d-k { font-size: 16px; font-weight: 500; line-height: 24px; color: var(--grey); }
.e5 .e5-dash .d-v { font-size: 32px; font-weight: 700; line-height: 40px; color: var(--ink); font-variant-numeric: tabular-nums; }
.e5 .e5-dash .d-v.xl { font-size: 40px; line-height: 48px; }
.e5 .e5-dash .d-ct { font-size: 20px; font-weight: 700; line-height: 28px; color: var(--ink); }
.e5 .e5-dash .d-ch { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.e5 .e5-dash .d-note { font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-dash .d-card.chart { gap: 24px; }
.e5 .e5-dash .d-bars { display: flex; align-items: stretch; gap: 8px; height: 264px; }
.e5 .e5-dash .d-day { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.e5 .e5-dash .d-col { position: relative; flex: 1; width: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; }
.e5 .e5-dash .d-col i { display: block; width: 100%; background: #D1D1D6; border-radius: 2px; transform-origin: bottom; transform: scaleY(0); transition: transform .8s cubic-bezier(.22,1,.36,1) var(--d, 0s), background-color .2s; }
.e5 .e5-dash .d-day.closed .d-col i { background: #E5E5E8; }
.e5 .e5-dash .d-day.today .d-col i { background: var(--ink); }
.e5 .e5-dash .d-day:not(.closed):not(.today):hover .d-col i { background: #A9A9B0; }
.e5 .e5-dash .d-val { margin-bottom: 4px; font-size: 16px; font-weight: 700; line-height: 24px; white-space: nowrap; opacity: 0; transition: opacity .4s ease calc(var(--d, 0s) + .6s); }
.e5 .e5-dash .d-x { font-size: 16px; line-height: 24px; color: var(--grey); font-variant-numeric: tabular-nums; }
.e5 .e5-dash .d-day.today .d-x { color: var(--ink); font-weight: 700; }
.e5 .e5-dash .d-card.funnel { gap: 16px; }
.e5 .e5-dash .d-step { display: flex; flex-direction: column; gap: 8px; }
.e5 .e5-dash .d-sl { display: flex; justify-content: space-between; gap: 16px; font-size: 16px; line-height: 24px; font-weight: 500; }
.e5 .e5-dash .d-sl .v { color: var(--grey); font-weight: 400; white-space: pre; font-variant-numeric: tabular-nums; }
.e5 .e5-dash .d-track { height: 16px; background: #F0F0F2; border-radius: 4px; overflow: hidden; }
.e5 .e5-dash .d-track i { display: block; height: 100%; background: var(--ink); border-radius: 4px; transform-origin: left; transform: scaleX(0); transition: transform .9s cubic-bezier(.22,1,.36,1) var(--d, 0s); }
.e5 .e5-dash-fig.in .d-col i, .e5 .e5-dash-fig.in .d-track i { transform: none; }
.e5 .e5-dash-fig.in .d-val { opacity: 1; }
.e5 .e5-dash .d-card.table { gap: 16px; }
.e5 .e5-dash .d-scroll { overflow-x: auto; }
.e5 .e5-dash table { width: 100%; min-width: 640px; border-collapse: collapse; font-size: 16px; line-height: 24px; }
.e5 .e5-dash th { padding: 12px 16px 12px 0; text-align: left; font-weight: 500; color: var(--grey); border-bottom: 1px solid #E5E5E8; }
.e5 .e5-dash td { padding: 12px 16px 12px 0; font-weight: 500; border-bottom: 1px solid #E5E5E8; font-variant-numeric: tabular-nums; transition: background-color .15s; }
.e5 .e5-dash tbody tr:last-child td { border-bottom: 0; }
.e5 .e5-dash tbody tr:hover td { background: #FAFAFB; }
.e5 .e5-dash .num { text-align: right; padding-right: 0; padding-left: 16px; }
.e5 .e5-dash td.act { color: var(--red); }

/* menu before / after */
.e5 .e5-menu { padding: 32px 24px 24px; }
.e5 .e5-mk { font-size: 16px; font-weight: 500; line-height: 24px; color: var(--ash); letter-spacing: .02em; }
.e5 .e5-mk.after { color: var(--ink); font-weight: 700; }
.e5 .e5-mbox { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 16px; margin-top: 16px; padding: 24px 16px; background: #FFFFFF; box-shadow: 0 0 0 1px #E2D3D4; }
.e5 .e5-mcol { min-width: 0; transition: opacity .25s ease; }
.e5 .e5-mcol.dim { opacity: .3; }
.e5 .e5-mcol .mh { padding-bottom: 12px; border-bottom: 1px solid var(--line); font-size: 18px; font-weight: 700; line-height: 28px; transition: color .2s; }
.e5 .e5-mcol .mt { margin-top: 8px; }
.e5 .e5-mcol ul { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.e5 .e5-mcol li { font-size: 16px; line-height: 24px; color: var(--grey); transition: color .2s, opacity .25s; }
.e5 .e5-mbox.before .e5-mcol .mh { color: var(--grey); font-weight: 500; }
.e5 .e5-menu.filtering .e5-mbox.after .e5-mcol:not(.dim) li:not(.lit) { opacity: .35; }
.e5 .e5-mcol li.lit, .e5 .e5-mcol .mh.lit { color: var(--ink); }
.e5 .e5-marrow { margin: 16px 0 0 8px; font-size: 24px; line-height: 32px; color: var(--ink); }
.e5 .e5-tag { display: inline-flex; align-items: center; height: 24px; padding: 0 8px; border-radius: 4px; font-size: 16px; font-weight: 500; line-height: 24px; white-space: nowrap; vertical-align: middle; }
.e5 .e5-tag.t-new { background: var(--red); color: #FFFFFF; }
.e5 .e5-tag.t-split, .e5 .e5-tag.t-moved, .e5 .e5-tag.t-renamed { background: #FFFFFF; color: var(--grey); box-shadow: inset 0 0 0 1px var(--ash); }
.e5 .e5-legend { display: flex; flex-wrap: wrap; gap: 8px 24px; margin-top: 24px; }
.e5 .e5-lg { display: inline-flex; align-items: center; gap: 8px; padding: 4px 8px 4px 4px; margin: 0; border: 0; border-radius: 4px; background: transparent; cursor: pointer;
  font-size: 16px; line-height: 24px; color: var(--grey); transition: background-color .2s, color .2s; }
.e5 .e5-lg:hover, .e5 .e5-lg.on { background: #FFFFFF; color: var(--ink); box-shadow: 0 0 0 1px #E2D3D4; }
.e5 .e5-lg[aria-pressed="true"] { box-shadow: 0 0 0 2px var(--ink); }
.e5 .e5-lg:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

/* before → after slider */
.e5 .e5-slider { position: relative; --sw: min(1200px, calc(100vw - 64px)); }
.e5 .e5-track { display: flex; gap: 40px; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory; scrollbar-width: none;
  padding: 0 calc((100% - var(--sw)) / 2); cursor: grab; outline: none; -webkit-user-select: none; user-select: none; }
.e5 .e5-track::-webkit-scrollbar { display: none; }
.e5 .e5-track.dragging { cursor: grabbing; scroll-snap-type: none; }
.e5 .e5-track:focus-visible .e5-slide.on .card { box-shadow: 0 0 0 1px var(--cline), 0 0 0 4px rgba(0,13,16,.25); }
.e5 .e5-slide { flex: none; width: var(--sw); scroll-snap-align: center; opacity: .4; transition: opacity .4s ease; }
.e5 .e5-slide.on { opacity: 1; }
.e5 .e5-slide .card { box-shadow: 0 0 0 1px var(--cline); background: var(--canvas); overflow: hidden; }
.e5 .e5-slide .card img { display: block; width: 100%; height: auto; pointer-events: none; transform: scale(.98); transition: transform .6s cubic-bezier(.22,1,.36,1); }
.e5 .e5-slide.on .card img { transform: none; }
.e5 .e5-slide .cap { margin-top: 24px; padding-right: 120px; }
.e5 .e5-slide .cap h3 { font-size: 20px; font-weight: 700; line-height: 28px; }
.e5 .e5-slide .cap p { margin-top: 4px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-sl-ctrl { position: absolute; right: calc((100% - var(--sw)) / 2); bottom: 0; display: flex; align-items: center; gap: 24px; pointer-events: none; }
.e5 .e5-sl-ctrl .count { font-size: 16px; line-height: 24px; color: var(--grey); font-variant-numeric: tabular-nums; }
.e5 .e5-sl-ctrl .count b { color: var(--ink); font-weight: 700; }
.e5 .e5-sl-ctrl .arrows { display: flex; gap: 8px; pointer-events: auto; }
.e5 .e5-sl-ctrl button { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; padding: 0; border: 0; border-radius: 0; background: #231F20; color: #FFFFFF; cursor: pointer; transition: background-color .2s; }
.e5 .e5-sl-ctrl button:hover { background: var(--red); }
.e5 .e5-sl-ctrl button:focus-visible { outline: 2px solid var(--red); outline-offset: 3px; }

/* prototype */
.e5 .e5-links { display: flex; flex-wrap: wrap; gap: 16px; }
.e5 .e5-links a { display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 24px; background: #231F20; color: #FFFFFF; font-size: 16px; font-weight: 500; text-decoration: none; border-radius: 0; transition: background-color .3s; }
.e5 .e5-links a:hover { background: var(--red); }
.e5 .e5-links a:focus-visible { outline: 2px solid var(--red); outline-offset: 3px; }
.e5 .e5-stills { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.e5 .e5-stills .k { font-size: 16px; font-weight: 500; line-height: 24px; color: var(--ash); letter-spacing: .02em; }
.e5 .e5-stills .fr { margin-top: 16px; padding: 24px; transition: transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s ease; }
.e5 .e5-stills figure:hover .fr { transform: translateY(-8px); box-shadow: inset 0 0 0 1px var(--cline), 0 24px 48px rgba(0,13,16,.10); }
.e5 .e5-stills .ph { aspect-ratio: 414 / 532; overflow: hidden; background: #0E0E0E; }
.e5 .e5-stills .ph img { width: 100%; height: 100%; object-fit: cover; }

/* results */
.e5 .e5-results { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.e5 .e5-rcard { padding: 32px; background: #FFFFFF; box-shadow: inset 0 0 0 1px var(--cline); }
.e5 .e5-rcard .k { font-size: 16px; font-weight: 500; color: var(--ash); letter-spacing: .02em; }
.e5 .e5-rcard .big { display: block; margin-top: 16px; font-size: 56px; font-weight: 700; line-height: 64px; color: var(--ink); white-space: nowrap; font-variant-numeric: tabular-nums; }
.e5 .e5-rcard .d { margin-top: 16px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-rcard .ch { margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--rline); display: flex; flex-direction: column; gap: 8px; }
.e5 .e5-rcard .rr { display: flex; align-items: center; gap: 16px; font-size: 16px; line-height: 24px; }
.e5 .e5-rcard .lab { flex: none; width: 56px; font-weight: 500; color: var(--ash); }
.e5 .e5-rcard .rr.after .lab { color: var(--ink); font-weight: 700; }
.e5 .e5-rcard .bar { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; }
.e5 .e5-rcard .bar > i { display: block; flex: none; height: 16px; background: #C8C8CC; transform-origin: left; transform: scaleX(0); transition: transform 1s cubic-bezier(.22,1,.36,1) .2s; }
.e5 .e5-rcard .rr.after .bar > i { background: var(--red); transition-delay: .5s; }
.e5 .e5-rcard .sq { display: flex; gap: 4px; }
.e5 .e5-rcard .sq i { display: block; width: 20px; height: 16px; background: #C8C8CC; transform: scale(0); transition: transform .4s cubic-bezier(.34,1.56,.64,1) var(--d, 0s); }
.e5 .e5-rcard .rr.after .sq i { background: var(--red); }
.e5 [data-r].in .e5-rcard .bar > i, .e5 [data-r].in .e5-rcard .sq i { transform: none; }
.e5 .e5-rcard .val { flex: none; font-weight: 500; color: var(--grey); font-variant-numeric: tabular-nums; }
.e5 .e5-rcard .rr.after .val { color: var(--ink); font-weight: 700; }
.e5 .e5-quote { display: grid; grid-template-columns: 48px minmax(0, 1fr) 48px; gap: 48px; }
.e5 .e5-quote .q { font-size: 64px; font-weight: 700; line-height: 64px; color: var(--red); }
.e5 .e5-quote .c { text-align: right; }
.e5 .e5-quote p { font-size: 24px; font-weight: 500; line-height: 36px; }
.e5 .e5-quote footer { margin-top: 24px; font-size: 16px; line-height: 24px; color: var(--grey); }

/* takeaways: the office photo behind */
.e5 .e5-take { position: relative; overflow: hidden; min-height: clamp(720px, 46vw, 880px); padding: 120px 0 288px; background: #1A1A1A; color: #FFFFFF; }
.e5 .e5-take .bg { position: absolute; z-index: 0; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 70%; transform: scale(1.12); will-change: transform; }
.e5 .e5-take .e5-w { position: relative; z-index: 2; }
.e5 .e5-take .t { margin-top: 24px; max-width: 1100px; font-size: 56px; font-weight: 700; line-height: 64px; color: #FFFFFF; }
.e5 .e5-take .d { margin-top: 48px; max-width: 960px; font-size: 20px; line-height: 32px; color: rgba(255,255,255,.82); }

/* next case study */
.e5 .e5-next { background: #F5F5F2; }
.e5 .e5-next .next-card { display: flex; flex-direction: column; gap: 16px; padding: 140px 0; color: var(--ink); text-decoration: none; }
.e5 .e5-next .eyebrow { font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-next .next-name { font-size: clamp(48px, 5vw, 96px); font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; transition: transform .3s ease-out; }
.e5 .e5-next .next-card:hover .next-name { transform: translateX(8px); }
.e5 .e5-next .go { display: inline-block; transition: transform .3s ease-out; }
.e5 .e5-next .next-card:hover .go { transform: translateX(8px); }

@media (max-width: 1280px) {
  .e5 .e5-rt { width: 280px; }
  .e5 .e5-cols4 { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 40px; }
  .e5 .e5-define, .e5 .e5-bench { grid-template-columns: minmax(0, 1fr); gap: 48px; }
  .e5 .e5-tierlab h3 { font-size: 24px; line-height: 32px; }
  .e5 .e5-tierlab .lead { margin-top: 53px; }
  .e5 .e5-mbox { grid-template-columns: repeat(4, minmax(0, 1fr)); row-gap: 32px; }
}
@media (max-width: 1100px) {
  .e5 .e5-tierlab { display: none; }
  .e5 .e5-tierlist { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin-top: 32px; }
  .e5 .e5-tierlist li { padding-top: 16px; border-top: 2px solid var(--ink); }
  .e5 .e5-tierlist li:first-child { border-top-color: var(--red); }
  .e5 .e5-layers { left: 15% !important; width: 70% !important; }
}
@media (max-width: 1023px) {
  .e5 .e5-row { flex-direction: column; gap: 16px; }
  .e5 .e5-rt { width: auto; }
  .e5 .e5-dash { padding: 24px; border-radius: 16px; }
  .e5 .e5-dash .d-row.r3, .e5 .e5-dash .d-row.charts { grid-template-columns: minmax(0, 1fr); }
  .e5 .e5-dash .d-row.r4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .e5 .e5-cols3 { grid-template-columns: minmax(0, 1fr); row-gap: 32px; }
  .e5 .e5-research { grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 24px; }
  .e5 .e5-research figure:first-child { grid-column: 1 / -1; }
  .e5 .e5-stills { grid-template-columns: minmax(0, 1fr); max-width: 464px; }
  .e5 .e5-results { grid-template-columns: minmax(0, 1fr); }
  .e5 .e5-arch { width: 100%; overflow-x: auto; }
  .e5 .e5-arch .e5-canvas { width: 1200px; }
  .e5 .e5-slide .cap { padding-right: 0; padding-bottom: 64px; }
  .e5 .e5-sl-ctrl { bottom: 0; }
  .e5 .e5-quote { grid-template-columns: 32px minmax(0, 1fr); gap: 24px; }
  .e5 .e5-quote .c { display: none; }
}
@media (max-width: 700px) {
  .e5 .e5-w { width: calc(100vw - 40px); }
  .e5 .e5-slider { --sw: calc(100vw - 40px); }
  .e5 .e5-track { gap: 16px; }
  .e5 .e5-hero { padding: 104px 0 88px; }
  .e5 .e5-h1 { font-size: 40px; line-height: 48px; }
  .e5 .e5-sec { padding: 88px 0; }
  .e5 .e5-h2 { font-size: 32px; line-height: 40px; }
  .e5 .mt120 { margin-top: 88px; }
  .e5 .e5-meta, .e5 .e5-stats, .e5 .e5-cols4, .e5 .e5-tierlist { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .e5 .e5-stats .n { font-size: 40px; line-height: 48px; }
  .e5 .e5-stack { aspect-ratio: 4 / 5; }
  .e5 .e5-stack > .e5-canvas-k { left: 20px; top: 20px; }
  .e5 .e5-layers { left: 3% !important; width: 94% !important; top: 12% !important; height: 84% !important; }
  .e5 .e5-dash .d-row.r4 { grid-template-columns: minmax(0, 1fr); }
  .e5 .e5-dash .d-bars { height: 200px; gap: 4px; }
  .e5 .e5-dash .d-x { font-size: 16px; }
  .e5 .e5-dash .d-day:nth-child(even) .d-x { visibility: hidden; }
  .e5 .e5-dash .d-day.today .d-x { visibility: visible; }
  .e5 .e5-mbox { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .e5 .e5-menu, .e5 .e5-rules, .e5 .e5-bm { padding: 24px 16px; }
  .e5 .e5-rlist li { flex-wrap: wrap; padding: 16px; }
  .e5 .e5-research { grid-template-columns: minmax(0, 1fr); }
  .e5 .e5-rcard .big { font-size: 48px; line-height: 56px; }
  .e5 .e5-take { padding: 88px 0 240px; }
  .e5 .e5-take::before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, rgba(10,8,9,.72) 0%, rgba(10,8,9,.55) 65%, rgba(10,8,9,0) 100%); }
  .e5 .e5-take .t { font-size: 36px; line-height: 44px; }
  .e5 .e5-take .d { margin-top: 32px; font-size: 18px; line-height: 28px; }
  .e5 .e5-quote p { font-size: 20px; line-height: 32px; }
}
@media (prefers-reduced-motion: reduce) {
  .e5 [data-r] { opacity: 1 !important; transform: none !important; transition: none !important; }
  .e5 .e5-bm-t .e5-mark, .e5 .e5-rlist li, .e5 .d-col i, .e5 .d-track i, .e5 .e5-rcard .bar i, .e5 .e5-rcard .sq i { transform: none !important; opacity: 1 !important; transition: none !important; }
  .e5 .d-val { opacity: 1 !important; }
  .e5 .e5-ring::before, .e5 .e5-ring::after { animation: none !important; }
  .e5 .e5-take .bg { transform: none !important; }
  .e5 .e5-track { scroll-behavior: auto; }
}
`
