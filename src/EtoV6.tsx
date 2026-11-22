import React, { useEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { SideToc, useHeadroom } from './CaseNav'
import { SiteHeaderB } from './SiteHeaderB'
import { CaseFilm, useCaseIntro } from './CaseFilm'

/**
 * ETO Markets case study (v30, Harbor Nov 22) — rebuilt from Harbor's Figma "06 ETO Markets — 1920 · v3" in file
 * 9eRSsfAhsJk0OmvJdrxZ6E (node 2036:1186). Copy is the frame's, word for word. EtoV5.tsx stays in the design, unused.
 *
 * New in this version (Figma): the ETO logo in the hero and new TIMELINE / MY ROLE / SCOPE copy; Context draws the CRM
 * between clients and IBs (3 × 3 objects, client / shared / IB side); the benchmark is the spreadsheet it was; the
 * research photos sit on a dark board; Define shows three rule cards with small wireframes flowing into one question;
 * the IB dashboard shows the 22 redesigned pages as a moving stack and the portal menu changing from 2022 to the redesign.
 * Kept from v5 (Harbor: keep the AS-IS → TO-BE section as it was): "Same data, new order" and its pinned slider, plus the
 * old-portal pins, prototype, results, takeaways and next.
 *
 * Interactions: the CRM flows and Define's flows draw in when they scroll into view; the page stack pans with the scroll
 * (the Figma loops it every 16 s); the menu changes one step at a time as you scroll (before → new menu → columns move →
 * items and tags → legend); the spreadsheet's totals and logos select a broker's column and show its formula; Define's
 * pins scroll back to the old portal and pulse the pin. No hover effects for show. Everything is static with
 * prefers-reduced-motion.
 * Type: Roboto only (the Figma's Roboto Mono and Carlito are set in Roboto). Assets: v3 / v5 / v6 as before, v7 for this
 * version (research photos and the 22-screen sprite — see RES_PHOTOS and SPRITE).
 */

const A3 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/v3/'
const A5 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/v5/'
const IMG = {
  video: A3 + 'intro-v6.mp4',
  poster: A3 + 'intro-v6-poster.jpg',
  oldPortal: A5 + 'old-portal.webp',
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
export const E6_CHAPTERS = ['Overview', 'Context', 'Discover', 'Define', 'IB dashboard', 'Before → After', 'Prototype', 'Results', 'Takeaways']

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

const LOGO_PATHS: [string, boolean][] = [
  ['M43.1275 41.2467C46.1789 40.9153 49.0951 40.1297 51.8194 38.7012C53.6746 37.7283 55.3174 36.4893 56.5988 34.8116C58.4375 32.4039 59.093 29.6543 58.9243 26.6742C58.9145 26.5 58.8716 26.0442 58.8401 25.8467C60.1225 28.1406 60.6704 32.9168 57.5323 36.7409C61.2537 34.238 64.2986 27.2306 61.7079 22.0313C62.2652 22.4291 63.0525 23.5661 63.3957 24.8014C63.6957 25.8821 63.9143 27.0086 63.976 28.1255C64.0366 29.2184 63.8536 30.3246 63.7762 31.4441C64.6921 30.1053 65.3118 28.6409 65.6076 27.0411C66.2144 23.7602 65.3587 20.7617 63.788 17.9196C62.3253 15.2728 60.3533 13.079 57.8206 11.4053C57.7479 11.3574 57.6529 11.2807 57.5125 11.1754C57.7141 11.1754 57.8622 11.1754 57.9873 11.1762C60.5694 11.188 61.4024 11.117 62.6545 11.2749C66.1904 11.7214 69.2791 15.0507 69.3082 18.5939C69.3573 24.6144 69.3904 30.6362 69.3019 36.6557C69.2841 37.8499 68.7875 39.0734 68.3436 40.2182C66.1525 45.8652 62.4747 50.2536 56.7563 52.4467C49.8389 55.0998 43.2095 54.3706 37.3389 49.5854C34.1855 47.0148 32.4669 43.5084 31.6793 39.5675C30.7258 34.7975 31.283 30.2033 33.8385 26.0091C36.7042 21.3061 41.0202 19.473 46.4353 20.024C48.8435 20.2689 50.9548 21.1535 52.6927 22.8485C54.512 24.6227 55.149 26.8384 55.2142 29.3372C55.3112 33.0381 53.3587 35.5235 50.6099 37.5917C48.4963 39.1819 46.1503 40.3177 43.6213 41.082C43.4554 41.1324 43.2919 41.1915 43.1275 41.2467Z', true],
  ['M33.1102 11.17C26.1329 15.113 22.148 21.531 21.8124 29.3193C21.2331 26.6171 21.1907 23.6412 21.8172 20.9515C22.4418 18.2699 23.6613 15.864 25.2127 13.6004C23.8235 14.7663 22.6283 16.1034 21.6307 17.5948C20.6435 19.071 19.6311 20.678 18.8092 22.5518C18.8092 21.4363 18.7766 19.8568 18.84 18.705C19.0789 14.3575 22.506 11.1504 26.8681 11.1494C28.8514 11.1489 30.955 11.17 33.1102 11.17Z', true],
  ['M69.2961 49.6116C69.2142 51.8513 69.6581 54.1099 68.9216 56.2994C67.8385 59.5192 64.8478 61.6537 61.4493 61.6549C59.8966 61.6554 58.3066 61.6642 56.7031 61.6537C59.2765 60.2226 61.7375 58.571 63.8597 56.5453C65.9918 54.5099 67.6964 52.115 69.2961 49.6116Z', true],
  ['M29.1509 61.656C27.59 61.6284 26.2895 61.7535 24.8036 61.4154C21.2606 60.6092 18.8768 57.4756 18.8154 53.8059C18.8071 53.2998 18.8144 52.7934 18.8673 52.2665C20.2319 54.2032 21.7399 55.9882 23.4971 57.5561C25.3099 59.1739 27.2077 60.4837 29.3391 61.6533C29.281 61.652 29.2291 61.656 29.1509 61.656Z', true],
  ['M81.9075 60.879C81.9075 60.879 81.9062 52.7569 81.9062 49.7466C81.9062 49.3731 82.2111 49.1503 82.5058 49.1503C82.743 49.1503 82.944 49.2814 83.044 49.5002C84.5169 52.7263 86.2496 56.5311 87.6054 59.5111C87.6082 59.5173 87.6109 59.5234 87.6134 59.5291C87.6443 59.4675 87.6723 59.4086 87.6994 59.3496C88.8394 56.8355 91.0493 51.968 92.1793 49.4791C92.2733 49.2721 92.4704 49.1435 92.6942 49.1435C92.9762 49.1435 93.2685 49.3573 93.2695 49.7148C93.2775 52.3814 93.2918 57.5238 93.2935 60.2257L93.2948 60.8755L93.0953 60.8785C93.0226 60.8795 92.5147 60.8795 92.5147 60.8795L92.516 50.632C92.4656 50.738 92.4197 50.8362 92.3839 50.9147C91.1674 53.5986 88.6472 59.1581 87.9701 60.6496C87.9065 60.7905 87.7711 60.8785 87.6169 60.8785C87.4633 60.8785 87.3282 60.791 87.264 60.6506L82.7452 50.7112L82.7417 60.882L81.9075 60.879Z', false],
  ['M107.315 60.8769C107.315 60.8769 104.442 54.3353 103.252 51.6293C103.041 51.1493 102.827 50.6713 102.603 50.1687L102.458 49.8448L99.9202 55.6169C99.2156 57.218 98.3573 59.1654 97.6396 60.7606L97.5862 60.8794H96.75L101.327 50.4647C101.506 50.0564 101.848 49.2921 102.113 48.701C102.175 48.5607 102.309 48.4739 102.462 48.4739C102.614 48.4739 102.747 48.5607 102.809 48.7003C103.368 49.9606 105.027 53.7312 105.894 55.7047L108.173 60.8794L107.315 60.8769Z', false],
  ['M114.074 54.2725L117.595 54.2685C118.759 54.2116 119.889 53.2991 120.104 52.2355C120.238 51.5735 120.066 50.8734 119.632 50.3154C119.151 49.698 118.412 49.3215 117.602 49.2817C116.999 49.2524 116.351 49.2386 115.563 49.2386C115.031 49.2386 114.497 49.2451 113.959 49.2509C113.48 49.2564 112.998 49.2616 112.513 49.2631L112.512 54.2695C113.011 54.2715 113.539 54.2725 114.074 54.2725ZM120.287 60.877L120.25 60.7234C120.07 59.9872 119.494 58.415 119.149 57.6444C119.001 57.2842 118.758 56.7511 118.334 56.2121C118.033 55.8048 117.497 55.0819 116.821 55.0819L112.511 55.0814V60.877H111.699L111.699 60.3787C111.701 58.8775 111.709 52.126 111.7 49.0187C111.699 48.8713 111.756 48.7335 111.859 48.6305C111.962 48.5274 112.099 48.4705 112.245 48.4705L115.45 48.47C116.342 48.47 117.453 48.4971 117.923 48.5565C118.972 48.6889 119.89 49.2569 120.442 50.1152C120.936 50.883 121.069 51.8067 120.808 52.6489C120.481 53.7022 119.709 54.4482 118.513 54.8658C118.433 54.8934 118.334 54.9277 118.218 54.9605C119.461 56.1179 120.042 57.7991 120.654 59.5708C120.772 59.9125 120.892 60.2586 121.019 60.6071L121.116 60.877H120.287Z', false],
  ['M133.863 60.8794L133.805 60.8235C133.763 60.7837 128.578 55.8297 127.787 55.08L126.319 55.0807C126.319 55.0807 126.32 58.8804 126.318 60.2164C126.318 60.2432 126.319 60.636 126.32 60.6719L126.326 60.8784L125.539 60.8794V48.4699H126.308C126.308 48.4699 126.318 49.0379 126.318 49.0825C126.32 50.1481 126.32 51.2132 126.32 52.2783L126.319 54.2686L127.787 54.2676L133.862 48.4699H134.981L128.508 54.6769L134.993 60.8794H133.863Z', false],
  ['M146.783 60.8794C146.695 60.8779 144.697 60.8764 142.537 60.8764C141.16 60.8764 139.717 60.8769 138.661 60.8789C138.508 60.8789 138.364 60.8195 138.257 60.7115C138.149 60.6042 138.09 60.4608 138.09 60.3082C138.091 58.7011 138.094 52.4217 138.09 49.0334C138.09 48.8833 138.148 48.7419 138.254 48.6359C138.361 48.5288 138.503 48.4699 138.654 48.4699H146.987V49.2833H138.915L138.914 54.2686H144.866C144.866 54.2686 144.866 54.721 144.864 54.8835L144.86 55.0812L138.918 55.0818L138.92 60.0658H146.987V60.8819L146.783 60.8794Z', false],
  ['M153.594 60.8796V49.2835H149.156V48.4701L155.611 48.4681L158.797 48.4706V49.2835H154.385V60.8796H153.594Z', false],
  ['M164.313 60.881C162.911 60.881 161.625 60.404 160.786 59.5726C160.263 59.0537 159.883 58.1325 159.883 57.3825V57.1812H160.71V57.3825C160.71 59.1627 162.5 60.1233 164.184 60.1233H164.185C164.4 60.1233 164.619 60.1085 164.834 60.0799C165.883 59.9405 166.659 59.6147 167.274 59.0537C167.802 58.5726 168.065 58.0299 168.015 57.5249C167.967 57.0388 167.64 56.6001 167.068 56.257C166.501 55.9163 165.866 55.6534 165.252 55.3989C164.998 55.2939 164.745 55.1894 164.495 55.0791C164.198 54.9475 163.896 54.8247 163.594 54.7026C163 54.4615 162.386 54.2123 161.815 53.8957C160.888 53.3823 160.339 52.6366 160.269 51.7969C160.198 50.9346 160.635 50.08 161.501 49.392C162.256 48.7916 163.259 48.4612 164.323 48.4612C165.622 48.4612 166.818 48.9428 167.604 49.7825C168.136 50.3505 168.49 50.9371 168.49 51.9565V52.1576H167.662V51.9565C167.662 50.0402 165.779 49.4797 165.203 49.3536C164.858 49.2784 164.522 49.2403 164.204 49.2403C163.205 49.2403 162.341 49.6133 161.635 50.35C161.185 50.8188 160.974 51.3469 161.042 51.8372C161.107 52.3092 161.418 52.7226 161.942 53.0314C162.525 53.3758 163.175 53.6453 163.802 53.9065C164.107 54.0331 164.412 54.1597 164.712 54.2953C164.984 54.4178 165.26 54.5341 165.536 54.6505C166.184 54.9239 166.854 55.2067 167.467 55.5752C168.245 56.0424 168.702 56.6688 168.787 57.3865C168.874 58.1222 168.548 58.8965 167.866 59.566C167.017 60.4015 165.722 60.881 164.313 60.881Z', false],
  ['M105.844 38.7702V43.5555H81.9102V11.2846H105.633V15.9846H86.8608V24.8733H103.728V29.6485H86.8709V38.7702H105.844Z', false],
  ['M135.336 11.2896V15.9946H125.063V43.5279H120.098V16.0197H109.82V11.2896H135.336Z', false],
  ['M163.712 27.4477C163.524 32.6139 161.481 36.1283 157.458 38.1937C155.896 38.9959 154.234 39.402 152.522 39.402H152.52C147.323 39.402 142.847 35.7322 141.636 30.4757C140.696 26.4024 141.413 22.7853 143.769 19.7196C145.855 17.0024 149 15.4432 152.397 15.4432C156.799 15.4432 160.681 17.9499 162.529 21.9881C163.329 23.7353 163.727 25.5727 163.712 27.4477ZM168.783 27.2597C168.76 27.0115 168.743 26.7633 168.725 26.5127C168.683 25.9487 168.64 25.3671 168.552 24.773C167.324 16.4935 160.784 10.7106 152.645 10.7106C150.763 10.7106 148.873 11.0265 147.028 11.6481C140.638 13.8014 136.299 20.0354 136.231 27.1619C136.184 32.3206 137.906 36.5569 141.353 39.7479C144.506 42.6681 148.121 44.1496 152.094 44.1496C154.069 44.1496 156.139 43.7761 158.25 43.0391C164.502 40.8483 168.735 34.5465 168.788 27.3524V27.3048L168.783 27.2597Z', false],
]

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
                  <EtoLogo white />
                  <b>ETO CRM</b>
                  <span>one portal</span>
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
    <div className="e6-sheet-wrap">
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
    </div>
  )
}

/* ---------- Discover: research photos (Figma 2269:22250, 1440 × 960) ---------- */
/* The photo files exported from the Figma go in assets/eto/v7/research. Until they are uploaded, the four numbered
   photos fall back to the v3 photos and the rest stay hidden. */
const RES_PHOTOS: { f: string; x: number; y: number; w: number; h: number; alt: string; fb?: string }[] = [
  { f: 'r-call.jpg', x: 43, y: 33, w: 317, h: 262, alt: 'A video call during a weekly marketing catch-up, the ETO site open on the shared screen' },
  { f: 'r-platforms.jpg', x: 358, y: 24, w: 210, h: 280, alt: 'Notebook page: notes on the platforms' },
  { f: 'r-account-flow.jpg', x: 520, y: 72, w: 230, h: 300, alt: 'Paper sketch of the account flow: open an account, make a deposit, learn, start live trading', fb: A3 + 'sketch-account.webp' },
  { f: 'r-fonts.jpg', x: 730, y: 32, w: 220, h: 293, alt: 'Notebook page: notes on fonts and file formats' },
  { f: 'r-keywords.jpg', x: 1250, y: 40, w: 160, h: 213, alt: 'Notebook page: brand keywords' },
  { f: 'r-whiteboard.jpg', x: 900, y: 112, w: 400, h: 300, alt: 'Whiteboard plan for the landing sections: spreads, payment solutions, max leverage, fund security, micro lot trading', fb: A3 + 'sketch-whiteboard.webp' },
  { f: 'r-sticky.jpg', x: 60, y: 330, w: 600, h: 208, alt: 'Yellow sticky notes: products, platforms (MT4, MT5, PAMM, social trading) and education', fb: A3 + 'sticky-ia.webp' },
  { f: 'r-pamm.jpg', x: 610, y: 392, w: 340, h: 255, alt: 'Paper sketch of the PAMM structure: one trader account linked to investor accounts', fb: A3 + 'sketch-pamm.webp' },
  { f: 'r-footer.jpg', x: 980, y: 392, w: 300, h: 225, alt: 'The ETO site footer on a monitor' },
  { f: 'r-proto-pattern.jpg', x: 1230, y: 300, w: 180, h: 240, alt: 'Notebook page: prototype patterns' },
  { f: 'r-sub-accounts.jpg', x: 40, y: 540, w: 210, h: 280, alt: 'Paper sketch of sub accounts' },
  { f: 'r-monitor.jpg', x: 230, y: 570, w: 200, h: 267, alt: 'The portal on a monitor' },
  { f: 'r-sketch-flow.jpg', x: 420, y: 600, w: 180, h: 240, alt: 'Paper sketch of a flow' },
  { f: 'r-laptop.jpg', x: 590, y: 650, w: 320, h: 180, alt: 'A portal screen on a laptop' },
  { f: 'r-tablet.jpg', x: 890, y: 590, w: 180, h: 240, alt: 'A table on a tablet' },
  { f: 'r-office.jpg', x: 1050, y: 640, w: 340, h: 191, alt: 'The ETO Markets office floor' },
]
const RES_CHIPS = [{ n: '01', x: 72, y: 342 }, { n: '02', x: 532, y: 84 }, { n: '03', x: 622, y: 404 }, { n: '04', x: 912, y: 124 }]
const RES_CAPS = [
  { k: '01  STICKY NOTES', c: 'Products, platforms and education.' },
  { k: '02  ACCOUNT FLOW', c: 'Open, deposit, learn, start live trading.' },
  { k: '03  PAMM', c: 'One trader account linked to many investor accounts.' },
  { k: '04  WHITEBOARD', c: 'Landing sections: spreads, payments, leverage, fund security.' },
]

function ResPhoto({ p }: { p: typeof RES_PHOTOS[number] }) {
  const [src, setSrc] = useState(A7 + 'research/' + p.f)
  const [gone, setGone] = useState(false)
  if (gone) return null
  return (
    <figure className="ph" style={{ left: `${(p.x / 1440) * 100}%`, top: `${(p.y / 960) * 100}%`, width: `${(p.w / 1440) * 100}%`, height: `${(p.h / 960) * 100}%` }}>
      <img src={src} alt={p.alt} loading="lazy" decoding="async" onError={() => { if (p.fb && src !== p.fb) setSrc(p.fb); else setGone(true) }} />
    </figure>
  )
}

function Collage() {
  return (
    <div className="e6-res" data-r>
      <div className="e6-res-board">
        {RES_PHOTOS.map(p => <ResPhoto key={p.f} p={p} />)}
        {RES_CHIPS.map(c => <span key={c.n} className="chip" style={{ left: `${(c.x / 1440) * 100}%`, top: `${(c.y / 960) * 100}%` }} aria-hidden="true">{c.n}</span>)}
      </div>
      <ol className="e6-res-caps">
        {RES_CAPS.map(c => <li key={c.k}><b>{c.k}</b><span>{c.c}</span></li>)}
      </ol>
    </div>
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

/* ---------- IB dashboard: the 22 pages as a moving stack (Figma 2234:824) ---------- */

const PAGES: { t: string; s: string; d: string }[] = [
  { t: 'Account summary', s: 'DASHBOARD', d: 'Live and Demo accounts, role tags, leverage and the rebate summary on one screen.' },
  { t: 'Language menu', s: 'DASHBOARD', d: 'Nine languages, switched from the header.' },
  { t: 'Profile menu', s: 'DASHBOARD', d: 'Profile, password and log out grouped under one icon.' },
  { t: 'Registration', s: 'INBOX', d: 'New sign-ups in one table: name, account, type, time.' },
  { t: 'Deposit', s: 'INBOX', d: 'Client deposits get their own tab.' },
  { t: 'Withdrawal', s: 'INBOX', d: 'Client withdrawals get their own tab.' },
  { t: 'Management', s: 'MY CLIENTS', d: 'Every referred client, with status and one Action menu.' },
  { t: 'Deposits', s: 'MY CLIENTS', d: 'Client deposits with pending and completed totals.' },
  { t: 'Withdrawals', s: 'MY CLIENTS', d: 'Client withdrawals with totals by status.' },
  { t: 'Transfers', s: 'MY CLIENTS', d: 'Fund moves between client accounts.' },
  { t: 'Open positions', s: 'MY CLIENTS', d: 'Live trades: symbol, lots, S/L, T/P and profit.' },
  { t: 'Closed trades', s: 'MY CLIENTS', d: 'Finished trades, renamed from Record.' },
  { t: 'IB rebate brief', s: 'MY CLIENTS', d: 'Rebate per trade, 31 days at a time.' },
  { t: 'Pending list', s: 'MY CLIENTS', d: 'Clients who signed up but have not finished verification.' },
  { t: 'Deposit', s: 'MY ACCOUNT', d: 'Currency first, then the payment method.' },
  { t: 'Withdrawal', s: 'MY ACCOUNT', d: 'Bank card or crypto, with a request list.' },
  { t: 'Transfer', s: 'MY ACCOUNT', d: 'Move funds between your own accounts.' },
  { t: 'Personal info', s: 'MY ACCOUNT', d: 'KYC split into steps, with a banner until verified.' },
  { t: 'Sub account', s: 'MY ACCOUNT', d: 'Apply for a sub account and see the result.' },
  { t: 'Change password', s: 'MY ACCOUNT', d: 'Clear success and error states.' },
  { t: 'Platforms', s: 'DOWNLOAD', d: 'MT4 for every platform, plus disclosure documents.' },
  { t: 'Contact', s: 'CONTACT US', d: 'Phone, email, map and social links on one page.' },
]
/* screen thumbnails: one sprite, 4 columns × 6 rows (assets/eto/v7/screens.webp, from the Figma's 3072 × 2592 image) */
const SPRITE = A7 + 'screens.webp'
const thumb = (i: number) => ({ backgroundImage: `url(${SPRITE})`, backgroundSize: '400% 600%', backgroundPosition: `${((i % 4) / 3) * 100}% ${(Math.floor(i / 4) / 5) * 100}%` })
const STACK_PAN = { x: -3260, y: -929 }

function PageCard({ p, i }: { p: typeof PAGES[number]; i: number }) {
  return (
    <article className="e6-pc">
      <div className="obj"><div className="scr" style={thumb(i)} role="img" aria-label={`${p.t} screen`} /></div>
      <h3>{p.t}</h3>
      <div className="s">{p.s}</div>
      <p>{p.d}</p>
      <div className="pg">PAGE {String(i + 1).padStart(2, '0')} / 22</div>
    </article>
  )
}

/** the strip pans down-left as the canvas crosses the screen (Figma: a 16 s loop; here it follows the scroll) */
function ScreenStack() {
  const wrap = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = wrap.current, s = strip.current
    if (!el || !s) return
    if (reducedMotion()) { s.style.transform = `translate3d(${STACK_PAN.x * 0.35}px, ${STACK_PAN.y * 0.35}px, 0)`; return }
    let raf = 0
    const run = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      if (r.bottom < -200 || r.top > innerHeight + 200) return
      const t = clamp01((innerHeight - r.top) / (innerHeight + r.height)) // 0 → 1 while it crosses the screen
      const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 // ease in-out, as in the Figma
      s.style.transform = `translate3d(${(STACK_PAN.x * e).toFixed(1)}px, ${(STACK_PAN.y * e).toFixed(1)}px, 0)`
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])
  return (
    <div className="e6-stack-out">
      <div ref={wrap} className="e6-stack-wide">
        <Canvas className="e6-stack">
          <Fit w={1440} h={840}>
            <div className="e6-stack-3d">
              <div ref={strip} className="e6-strip">
                {PAGES.map((p, i) => (
                  <div key={i} className="e6-pcw" style={{ left: -60 + 200 * i, top: -70 + 57 * i, zIndex: i + 1 }}><PageCard p={p} i={i} /></div>
                ))}
              </div>
            </div>
          </Fit>
        </Canvas>
      </div>
      {/* small screens: the same 22 pages as a row you swipe through */}
      <div className="e6-stack-row" role="list" aria-label="The 22 redesigned pages">
        {PAGES.map((p, i) => <div key={i} role="listitem"><PageCard p={p} i={i} /></div>)}
      </div>
    </div>
  )
}

/* ---------- IB dashboard: the portal menu, before → after (Figma 2273:27847) ---------- */
/* Steps follow the Figma motion, run by scroll instead of a loop: 0 the 2022 menu · 1 the new menu rises over it ·
   2 the columns move to their new places · 3 items and tags come in · 4 the legend. */
const IA_SHIFT: Record<string, number> = { Download: 378, 'My Clients': -189, 'My Account': -189 }

function IaMotion() {
  const ref = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(() => (reducedMotion() ? 4 : 0))
  useEffect(() => {
    if (reducedMotion()) return
    let raf = 0
    const run = () => {
      raf = 0
      const el = ref.current; if (!el) return
      const r = el.getBoundingClientRect()
      const t = (innerHeight * 0.9 - r.top) / (innerHeight * 0.75) // 0 when its top is near the bottom of the screen
      const s = t < 0.12 ? 0 : t < 0.34 ? 1 : t < 0.52 ? 2 : t < 0.7 ? 3 : 4
      setStep(v => (v === s ? v : s))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])
  const tag = (t: Tag, i: number) => <span className={'e5-tag t-' + t.toLowerCase()} style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>{t}</span>
  let ti = 0
  return (
    <div ref={ref} className={'e6-ia s' + step} data-r>
      <div className="e6-ia-scroll">
        <Canvas className="e6-ia-c">
          <div className="lab before" aria-hidden={step >= 1}>BEFORE · 2022 PORTAL</div>
          <div className="lab after" aria-hidden={step < 1}>AFTER · REDESIGN</div>
          <div className="menu before" role="group" aria-label="Portal menu in 2022">
            {MENU_BEFORE.map(c => (
              <div key={c.h} className="col"><div className="mh">{c.h}</div><i className="dv" aria-hidden="true" /><ul>{c.items.map(it => <li key={it.t}>{it.t}</li>)}</ul></div>
            ))}
          </div>
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
      </div>
    </div>
  )
}

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
            <div className="mt64"><Canvas className="e6-res-c"><Collage /></Canvas></div>
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
            <div className="mt64"><ScreenStack /></div>
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
                          <span className="e5-bar">
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

const E6_CSS = `
.e6 .mt56 { margin-top: 56px; }
.e6 .e6-fit { position: relative; width: 100%; overflow: hidden; }
.e6 .e6-fit-in { position: absolute; left: 0; top: 0; transform-origin: 0 0; }

/* hero */
.e6 .e6-logo { display: block; width: 188px; height: auto; }
.e6 .e6-meta .mk { font-size: 16px; line-height: 24px; color: #777777; }
.e6 .e6-meta p { color: #333333; }

/* context: the CRM between clients and IBs */
.e6 .e6-crm { width: min(1600px, calc(100vw - 32px)); margin: 0 auto; }
.e6 .e6-crm-c { background: transparent; background-image: none; }
.e6 .e6-crm-stage { display: grid; grid-template-columns: minmax(0, 420fr) 760px minmax(0, 420fr); height: 600px; }
.e6 .e6-crm-side { position: relative; height: 600px; overflow: hidden; }
.e6 .e6-crm-side svg { position: absolute; inset: 0; width: 100%; height: 600px; overflow: visible; }
.e6 .e6-crm-side .fl { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1) var(--d, 0s); }
.e6 .e6-crm.in .e6-crm-side .fl { stroke-dashoffset: 0; }
.e6 .e6-crm-side .dot { position: absolute; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; background: #ED1C24; opacity: 0; transition: opacity .4s ease var(--d, 0s); }
.e6 .e6-crm-side.ib .dot { background: #7C3AED; }
.e6 .e6-crm.in .e6-crm-side .dot { opacity: 1; }
.e6 .e6-crm-side .lab { position: absolute; top: 270px; transform: translate(-50%, -50%); padding: 8px; background: var(--soft); font-size: 40px; font-weight: 500; line-height: 1.15; letter-spacing: .04em; color: #ED1C24; text-align: center; white-space: nowrap; }
.e6 .e6-crm-side.ib .lab { font-size: 32px; color: #7C3AED; }
.e6 .e6-crm-side .portal { position: absolute; top: 568px; transform: translateX(-50%); font-size: 16px; line-height: 21px; color: #ED1C24; white-space: nowrap; }
.e6 .e6-crm-side.ib .portal { color: #7C3AED; }
.e6 .e6-crm-mid { position: relative; padding-top: 67px; }
.e6 .e6-crm-keys { position: absolute; top: 36px; left: 0; right: 0; display: grid; grid-template-columns: repeat(3, 200px); justify-content: center; column-gap: 56px; font-size: 16px; line-height: 21px; letter-spacing: .04em; text-align: center; }
.e6 .e6-crm-keys .client { color: #ED1C24; } .e6 .e6-crm-keys .shared { color: #2A2A2E; } .e6 .e6-crm-keys .ib { color: #7C3AED; }
.e6 .e6-crm-heads { display: none; }
.e6 .e6-crm-box { display: grid; grid-template-columns: repeat(3, 200px); justify-content: center; gap: 32px 56px; padding: 23px; background: #FFFFFF; box-shadow: inset 0 0 0 1px #8E8590; }
.e6 .e6-obj { position: relative; background: #FFFFFF; box-shadow: inset 0 0 0 1px var(--oc); --oc: #2A2A2E; }
.e6 .e6-obj.client { --oc: #ED1C24; } .e6 .e6-obj.ib { --oc: #7C3AED; }
.e6 .e6-obj .h { display: flex; align-items: center; justify-content: center; height: 32px; border-bottom: 1px solid var(--oc); font-size: 16px; font-weight: 500; color: var(--oc); }
.e6 .e6-obj.client .h { background: rgba(237,28,36,.08); } .e6 .e6-obj.ib .h { background: rgba(124,58,237,.08); }
.e6 .e6-obj ul li { display: flex; align-items: center; gap: 8px; height: 28px; padding-left: 10px; border-bottom: 1px solid rgba(42,42,46,.25); font-size: 16px; color: #2A2A2E; white-space: nowrap; }
.e6 .e6-obj.shared ul li:last-child { border-bottom: 0; }
.e6 .e6-obj ul li i { flex: none; width: 8px; height: 8px; border-radius: 2px; background: rgba(42,42,46,.6); }
.e6 .e6-obj.client ul li i { background: rgba(237,28,36,.8); } .e6 .e6-obj.ib ul li i { background: rgba(124,58,237,.8); }
.e6 .e6-obj.client::after, .e6 .e6-obj.shared::after, .e6 .e6-core::after { content: ""; position: absolute; left: 100%; top: 59px; width: 56px; height: 1px; background: rgba(42,42,46,.45); }
.e6 .e6-core { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; height: 118px; background: #2A2A2E; color: #FFFFFF; }
.e6 .e6-core b { font-size: 18px; font-weight: 500; letter-spacing: .04em; }
.e6 .e6-core span { font-size: 16px; color: #BDBDBD; }
@media (max-width: 1279px) {
  .e6 .e6-crm { width: auto; margin: 0 auto; max-width: min(1440px, calc(100vw - 64px)); }
  .e6 .e6-crm-stage { display: block; height: auto; padding: 32px 24px; }
  .e6 .e6-crm-side { display: none; }
  .e6 .e6-crm-mid { padding: 0; max-width: 760px; margin: 0 auto; }
  .e6 .e6-crm-heads { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 24px; font-size: 24px; font-weight: 500; line-height: 32px; letter-spacing: .04em; }
  .e6 .e6-crm-heads span { display: block; font-size: 16px; font-weight: 400; line-height: 24px; letter-spacing: 0; }
  .e6 .e6-crm-heads .client { color: #ED1C24; } .e6 .e6-crm-heads .ib { color: #7C3AED; text-align: right; }
  .e6 .e6-crm-keys { position: static; margin-bottom: 8px; }
}
@media (max-width: 860px) {
  .e6 .e6-crm-keys { display: none; }
  .e6 .e6-crm-heads { flex-direction: column; font-size: 20px; line-height: 28px; }
  .e6 .e6-crm-heads .ib { text-align: left; }
  .e6 .e6-crm-box { grid-template-columns: minmax(0, 1fr); padding: 16px; gap: 16px; }
  .e6 .e6-obj::after, .e6 .e6-core::after { display: none; }
  .e6 .e6-crm-box > li:nth-child(1) { order: 1; } .e6 .e6-crm-box > li:nth-child(4) { order: 2; } .e6 .e6-crm-box > li:nth-child(7) { order: 3; }
  .e6 .e6-crm-box > li:nth-child(2) { order: 4; } .e6 .e6-crm-box > li:nth-child(5) { order: 5; } .e6 .e6-crm-box > li:nth-child(8) { order: 6; }
  .e6 .e6-crm-box > li:nth-child(3) { order: 7; } .e6 .e6-crm-box > li:nth-child(6) { order: 8; } .e6 .e6-crm-box > li:nth-child(9) { order: 9; }
}

/* discover: the benchmark spreadsheet (Figma 880 × 632) */
.e6 .e6-bench { display: grid; grid-template-columns: minmax(0, 496px) 880px; justify-content: space-between; align-items: center; gap: 48px; }
@media (max-width: 1351px) { .e6 .e6-bench { grid-template-columns: minmax(0, 1fr); } .e6 .e6-bench > div:last-child { max-width: 880px; } }
.e6 .e6-sheet-c { background: #FFFFFF; background-image: none; }
.e6 .e6-sheet-wrap { overflow-x: auto; }
.e6 .e6-sheet { width: 880px; background: #FFFFFF; color: #1F1F1F; font-size: 16px; line-height: 20px; --g: #E1E1E1; --xl: #217346; }
.e6 .e6-sheet .fx { display: flex; align-items: center; height: 32px; padding: 0 8px; border-bottom: 1px solid #D4D4D4; }
.e6 .e6-sheet .fx .nb { display: flex; align-items: center; width: 72px; height: 22px; padding: 0 7px; box-shadow: inset 0 0 0 1px #C8C8C8; }
.e6 .e6-sheet .fx i { margin-left: 16px; font-style: italic; color: #7A7A7A; }
.e6 .e6-sheet .fx .sep { width: 1px; height: 20px; margin: 0 11px 0 8px; background: #D4D4D4; }
.e6 .e6-sheet table { width: 880px; border-collapse: collapse; table-layout: fixed; }
.e6 .e6-sheet th, .e6 .e6-sheet td { height: 32px; padding: 0 8px; border: 1px solid var(--g); border-top: 0; border-left: 0; font-weight: 400; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.e6 .e6-sheet tr.ch th { height: 24px; background: #F3F3F3; color: #5F5F5F; text-align: center; border-bottom-color: #C8C8C8; }
.e6 .e6-sheet tr.ch th:nth-child(1) { width: 40px; } .e6 .e6-sheet tr.ch th:nth-child(2) { width: 248px; }
.e6 .e6-sheet tr.ch th:nth-child(3), .e6 .e6-sheet tr.ch th:nth-child(4), .e6 .e6-sheet tr.ch th:nth-child(5), .e6 .e6-sheet tr.ch th:nth-child(6) { width: 104px; }
.e6 .e6-sheet tr.ch th:nth-child(7) { width: 176px; border-right: 0; }
.e6 .e6-sheet tr.ch th.on { background: #D3E3D9; color: var(--xl); font-weight: 700; box-shadow: inset 0 -2px 0 var(--xl); }
.e6 .e6-sheet th.rh { width: 40px; padding: 0; background: #F3F3F3; color: #5F5F5F; text-align: center; }
.e6 .e6-sheet th.rh.on { background: #D3E3D9; color: var(--xl); font-weight: 700; box-shadow: inset -2px 0 0 var(--xl); }
.e6 .e6-sheet td.title { font-size: 18px; font-weight: 700; }
.e6 .e6-sheet td.legend { font-style: italic; color: #7A7A7A; }
.e6 .e6-sheet tr.hdr th, .e6 .e6-sheet tr.hdr td { background: #F2F2F2; border-bottom-color: #7F7F7F; }
.e6 .e6-sheet tr.hdr th.rh { background: #F3F3F3; border-bottom-color: var(--g); }
.e6 .e6-sheet th.a { font-weight: 400; }
.e6 .e6-sheet tr.hdr th.a, .e6 .e6-sheet tr.tot th.a, .e6 .e6-sheet th.hl { font-weight: 700; }
.e6 .e6-sheet th.logo { padding: 0; text-align: center; }
.e6 .e6-sheet th.logo button { display: flex; align-items: center; justify-content: center; width: 100%; height: 31px; border: 0; background: transparent; cursor: pointer; }
.e6 .e6-sheet th.logo img { display: block; mix-blend-mode: multiply; max-width: 88px; object-fit: contain; }
.e6 .e6-sheet td.m { text-align: center; font-weight: 700; }
.e6 .e6-sheet td.cy { background: #E2EFDA; color: #375623; } .e6 .e6-sheet td.cs { background: #FFF2CC; color: #7F6000; } .e6 .e6-sheet td.cn { background: #FCE4D6; color: #C00000; }
.e6 .e6-sheet td.note { color: #595959; }
.e6 .e6-sheet tr.tot th:not(.rh), .e6 .e6-sheet tr.tot td { border-top: 1px solid #1F1F1F; }
.e6 .e6-sheet tr.tot td.n { position: relative; padding: 0; text-align: center; }
.e6 .e6-sheet tr.tot td.n button { width: 100%; height: 31px; border: 0; background: transparent; font-weight: 700; cursor: pointer; color: #1F1F1F; }
.e6 .e6-sheet tr.tot td.n.sel { box-shadow: inset 0 0 0 2px var(--xl); }
.e6 .e6-sheet tr.tot td.n.sel::after { content: ""; position: absolute; right: -3px; bottom: -3px; width: 7px; height: 7px; background: var(--xl); box-shadow: 0 0 0 1px #FFFFFF; z-index: 1; }
.e6 .e6-sheet button:focus-visible { outline: 2px solid var(--xl); outline-offset: -2px; }
.e6 .e6-sheet th.hl { background: #FFFF00; }
.e6 .e6-sheet td.tk { overflow: visible; }
.e6 .e6-sheet .tabs { display: flex; align-items: center; height: 32px; background: #F3F3F3; border-top: 1px solid #D4D4D4; color: #5F5F5F; }
.e6 .e6-sheet .tabs .arr { width: 56px; padding-left: 12px; color: #808080; }
.e6 .e6-sheet .tabs .tab { width: 120px; height: 32px; display: flex; align-items: center; justify-content: center; }
.e6 .e6-sheet .tabs .tab.on { background: #FFFFFF; color: var(--xl); font-weight: 700; box-shadow: inset 0 -3px 0 var(--xl); }
.e6 .e6-sheet .tabs .tab:not(.on) { width: 96px; }
.e6 .e6-sheet .tabs .plus { margin-left: 8px; font-size: 18px; }

/* discover: research photos on the dark board (1440 × 960) */
.e6 .e6-res-c { background: #232326; background-image: none; box-shadow: none; }
.e6 .e6-res { position: relative; aspect-ratio: 1440 / 960; }
.e6 .e6-res-board { position: absolute; inset: 0; }
.e6 .e6-res .ph { position: absolute; margin: 0; overflow: hidden; background: #2E2E31; box-shadow: 0 8px 24px rgba(0,0,0,.35); opacity: 0; transform: translateY(16px); transition: opacity .6s ease, transform .8s cubic-bezier(.22,1,.36,1); }
.e6 .e6-res.in .ph { opacity: 1; transform: none; }
.e6 .e6-res .ph img { display: block; width: 100%; height: 100%; object-fit: cover; }
.e6 .e6-res .chip { position: absolute; z-index: 2; padding: 4px 8px; background: #ED1C24; color: #FFFFFF; font-size: 16px; font-weight: 500; line-height: 21px; }
.e6 .e6-res-caps { position: absolute; left: 2.78%; right: 2.78%; top: 90%; display: grid; grid-template-columns: repeat(4, minmax(0, 300px)); column-gap: 44px; }
.e6 .e6-res-caps li { display: flex; flex-direction: column; gap: 4px; font-size: 16px; line-height: 21px; }
.e6 .e6-res-caps b { font-weight: 500; color: #FF6B70; white-space: pre; }
.e6 .e6-res-caps span { color: rgba(255,255,255,.8); }
@media (max-width: 1180px) {
  .e6 .e6-res { aspect-ratio: auto; }
  .e6 .e6-res-board { position: relative; aspect-ratio: 1440 / 850; }
  .e6 .e6-res-caps { position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; padding: 24px; }
}
@media (max-width: 600px) { .e6 .e6-res-caps { grid-template-columns: minmax(0, 1fr); } .e6 .e6-res .chip { padding: 2px 6px; } }

/* define: three rules, one question */
.e6 .e6-def-head { max-width: 496px; }
.e6 .e6-def { padding: 40px; background-image: none; }
.e6 .e6-def-k { font-size: 16px; font-weight: 700; line-height: 19px; color: var(--red); white-space: pre; }
.e6 .e6-def-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: auto auto auto; column-gap: 32px; margin-top: 29px; }
.e6 .e6-def-grid .pins { display: flex; flex-direction: column; gap: 8px; align-self: start; min-height: 64px; margin-bottom: 30px; }
.e6 .e6-def-grid .pins, .e6 .e6-def-grid .pins > div { font-size: 18px; line-height: 27px; color: #6E6A6B; }
.e6 .e6-def-grid .pins:not(.two), .e6 .e6-def-grid .pins > div { display: flex; flex-direction: row; align-items: center; gap: 8px; }
.e6 .e6-def-grid .pins.two { gap: 8px; }
.e6 .e6-pill { flex: none; display: inline-flex; align-items: center; height: 27px; padding: 0 8px; border: 0; border-radius: 999px; background: var(--red); color: #FFFFFF; font-size: 18px; font-weight: 600; line-height: 1; cursor: pointer; transition: box-shadow .2s ease; }
.e6 button.e6-pill:hover { box-shadow: 0 0 0 4px rgba(227,30,36,.18); }
.e6 button.e6-pill:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.e6 .e6-pill.new { background: #E6E1E1; color: #7E7A7B; cursor: default; }
.e6 .e6-rule { display: grid; grid-row: 2 / span 2; grid-template-rows: subgrid; row-gap: 0; background: #FFFFFF; box-shadow: inset 0 0 0 1px var(--red);
  opacity: 0; transform: translateY(16px); transition: opacity .5s ease var(--d, 0s), transform .7s cubic-bezier(.22,1,.36,1) var(--d, 0s); }
[data-r].in .e6-rule { opacity: 1; transform: none; }
.e6 .e6-rule h3 { padding: 20px 28px; background: #FDE8E9; box-shadow: inset 0 -1px 0 var(--red); font-size: 26px; font-weight: 700; line-height: 1.2; }
.e6 .e6-rule .b { display: flex; flex-direction: column; gap: 24px; padding: 28px 28px 32px; }
.e6 .e6-rule p { font-size: 20px; font-weight: 500; line-height: 30px; color: #616166; }
.e6 .e6-wire { position: relative; aspect-ratio: 376 / 208; overflow: hidden; background: #FBF7F7; border-radius: 6px; }
.e6 .e6-wire > * { position: absolute; }
.e6 .e6-wire i { display: block; border-radius: 4px; }
.e6 .e6-wire .side { background: #EFE7E7; } .e6 .e6-wire .nav { background: #D9CFCF; }
.e6 .e6-wire .hot { background: #FFFFFF; box-shadow: inset 0 0 0 2px var(--red); }
.e6 .e6-wire .pink { background: #F3C4C6; } .e6 .e6-wire .row { background: #EDE6E6; }
.e6 .e6-wire .div { background: #E2D8D8; } .e6 .e6-wire .act { background: var(--red); } .e6 .e6-wire .cta { background: var(--red); }
.e6 .e6-wire .card { background: #FFFFFF; box-shadow: inset 0 0 0 1px #E2D8D8; }
.e6 .e6-wire .fmt { box-shadow: none; outline: 1.5px dashed var(--red); outline-offset: -1.5px; }
.e6 .e6-wire .t { font-size: 16px; line-height: 21px; font-weight: 500; white-space: nowrap; }
.e6 .e6-wire .t.red { color: var(--red); } .e6 .e6-wire .t.mute { color: #9A9094; } .e6 .e6-wire .t.grey { color: #616166; font-weight: 400; }
.e6 .e6-wire .t.num { color: var(--ink); font-variant-numeric: tabular-nums; }
.e6 .e6-def-flow { position: relative; height: 96px; }
.e6 .e6-def-flow svg { display: block; width: 100%; height: 96px; overflow: visible; }
.e6 .e6-def-flow .n { position: absolute; z-index: 1; bottom: -4px; width: 8px; height: 8px; margin-left: -4px; border-radius: 50%; background: var(--red); }
.e6 .e6-def-flow path { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1s cubic-bezier(.22,1,.36,1) .5s; }
[data-r].in .e6-def-flow path { stroke-dashoffset: 0; }
.e6 .e6-def-core { position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; width: fit-content; max-width: 100%; margin: 0 auto; padding: 24px 40px; background: #2A2A2E; text-align: center; }
.e6 .e6-def-core .k { font-size: 18px; font-weight: 500; letter-spacing: .06em; color: #FF8A8E; }
.e6 .e6-def-core b { font-size: 32px; font-weight: 700; line-height: 1.2; color: #FFFFFF; }
@media (max-width: 1023px) {
  .e6 .e6-def { padding: 24px 16px; }
  .e6 .e6-def-grid { grid-template-columns: minmax(0, 1fr); grid-template-rows: none; row-gap: 16px; }
  .e6 .e6-rule { grid-row: auto; grid-template-rows: auto auto; }
  .e6 .e6-def-grid .pins { min-height: 0; margin-bottom: 0; }
  .e6 .e6-def-grid .pins:nth-child(3) { margin-bottom: 16px; }
  .e6 .e6-def-flow { display: none; }
  .e6 .e6-def-core { width: auto; margin-top: 24px; padding: 24px; }
  .e6 .e6-def-core b { font-size: 24px; }
  .e6 .e6-rule h3 { font-size: 24px; }
}

/* IB dashboard: the stack of 22 pages */
.e6 .e6-stack { background: #EDECE9; background-image: none; overflow: hidden; }
.e6 .e6-stack-3d { position: absolute; inset: 0; perspective: 1800px; }
.e6 .e6-strip { position: absolute; left: 0; top: 0; transform-style: preserve-3d; will-change: transform; }
.e6 .e6-pcw { position: absolute; width: 320px; height: 470px; transform: rotateY(38deg) rotateZ(-8deg); transform-style: preserve-3d; }
.e6 .e6-pc { position: relative; width: 320px; height: 470px; padding: 28px 24px 24px; background: #FFFFFF; border-radius: 14px; box-shadow: -6px 10px 28px rgba(0,0,0,.10); color: #111111; }
.e6 .e6-pc .obj { position: relative; width: 272px; height: 168px; }
.e6 .e6-pc .scr { position: absolute; left: 20px; top: 19px; width: 232px; height: 131px; border-radius: 6px; background-color: #F1F1F3; background-repeat: no-repeat; box-shadow: 0 8px 16px rgba(0,0,0,.18); }
.e6 .e6-pc h3 { margin-top: 24px; font-size: 26px; font-weight: 400; line-height: 1.2; }
.e6 .e6-pc .s { margin-top: 20px; font-size: 16px; font-weight: 500; letter-spacing: .06em; color: #8A8A8A; }
.e6 .e6-pc p { margin-top: 8px; max-width: 228px; font-size: 16px; line-height: 24px; color: #555555; }
.e6 .e6-pc .pg { position: absolute; left: 24px; bottom: 24px; font-size: 16px; font-weight: 500; letter-spacing: .06em; color: #B0B0B0; }
.e6 .e6-stack-row { display: none; }
@media (max-width: 899px) {
  .e6 .e6-stack-wide { display: none; }
  .e6 .e6-stack-row { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 8px 2px 24px; margin: 0 -2px; }
  .e6 .e6-stack-row > div { flex: none; scroll-snap-align: start; }
  .e6 .e6-stack-row .e6-pc { width: 280px; height: 440px; box-shadow: 0 0 0 1px #E5E3DF; }
  .e6 .e6-stack-row .e6-pc .obj { width: 232px; height: 150px; }
  .e6 .e6-stack-row .e6-pc .scr { left: 0; top: 10px; }
}

/* IB dashboard: the portal menu, before → after (1440 × 593) */
.e6 .e6-ia-scroll { overflow-x: auto; }
.e6 .e6-ia-c { min-width: 1200px; height: 593px; overflow: hidden; }
.e6 .e6-ia .lab { position: absolute; left: 40px; top: 47px; font-size: 16px; font-weight: 700; line-height: 24px; letter-spacing: .04em; transition: opacity .5s ease; }
.e6 .e6-ia .lab.before { color: var(--ash); }
.e6 .e6-ia .lab.after { color: var(--ink); opacity: 0; }
.e6 .e6-ia:not(.s0) .lab.before { opacity: 0; }
.e6 .e6-ia:not(.s0) .lab.after { opacity: 1; }
.e6 .e6-ia .menu { position: absolute; left: 40px; right: 40px; display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 16px; padding: 24px; background: #FFFFFF; box-shadow: inset 0 0 0 1px #E2D3D4; border-radius: 8px; }
.e6 .e6-ia .menu.before { top: 95px; transform-origin: 50% 0; transition: opacity .7s ease, transform .9s cubic-bezier(.22,1,.36,1); }
.e6 .e6-ia:not(.s0) .menu.before { opacity: .4; transform: scale(.96); }
.e6 .e6-ia .menu.after { top: 159px; box-shadow: inset 0 0 0 1px #E2D3D4, 0 -8px 32px rgba(102,38,38,.10); opacity: 0; transform: translateY(160px); transition: opacity .6s ease, transform .9s cubic-bezier(.22,1,.36,1); }
.e6 .e6-ia:not(.s0) .menu.after { opacity: 1; transform: none; }
.e6 .e6-ia .col { position: relative; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.e6 .e6-ia .mh { position: relative; font-size: 18px; font-weight: 700; line-height: 28px; color: var(--ink); }
.e6 .e6-ia .before .mh { color: var(--grey); }
.e6 .e6-ia .dv { display: block; height: 1px; background: var(--rline); }
.e6 .e6-ia ul { display: flex; flex-direction: column; gap: 8px; }
.e6 .e6-ia li { font-size: 16px; font-weight: 500; line-height: 24px; color: var(--grey); }
.e6 .e6-ia .before li { color: var(--ash); }
.e6 .e6-ia .after .col { transform: translateX(var(--x)); transition: transform 1s cubic-bezier(.22,1,.36,1); }
.e6 .e6-ia.s2 .after .col, .e6 .e6-ia.s3 .after .col, .e6 .e6-ia.s4 .after .col { transform: none; }
.e6 .e6-ia .after li { opacity: 0; transition: opacity .5s ease var(--d, 0s); }
.e6 .e6-ia.s3 .after li, .e6 .e6-ia.s4 .after li { opacity: 1; }
.e6 .e6-ia .tg { display: flex; }
.e6 .e5-tag { display: inline-flex; align-items: center; height: 24px; padding: 0 8px; border-radius: 4px; font-size: 16px; font-weight: 700; line-height: 24px; white-space: nowrap; vertical-align: middle; }
.e6 .e5-tag.t-new { background: var(--red); color: #FFFFFF; }
.e6 .e5-tag.t-split, .e6 .e5-tag.t-moved, .e6 .e5-tag.t-renamed { background: #FFFFFF; color: var(--grey); box-shadow: inset 0 0 0 1px var(--ash); }
.e6 .e6-ia .after .e5-tag { transform: scale(.6); opacity: 0; transition: transform .5s cubic-bezier(.45,1.45,.8,1) var(--d, 0s), opacity .25s ease var(--d, 0s); }
.e6 .e6-ia.s3 .after .e5-tag, .e6 .e6-ia.s4 .after .e5-tag { transform: none; opacity: 1; }
.e6 .e6-ia .mh .old { position: absolute; left: 0; top: 0; background: #FFFFFF; color: var(--ink); white-space: nowrap; transition: opacity .5s ease; }
.e6 .e6-ia.s3 .mh .old, .e6 .e6-ia.s4 .mh .old { opacity: 0; }
.e6 .e6-ia .legend { position: absolute; left: 40px; top: 526px; display: flex; flex-wrap: wrap; gap: 8px 24px; opacity: 0; transition: opacity .6s ease; }
.e6 .e6-ia.s4 .legend { opacity: 1; }
.e6 .e6-ia .legend > span { display: inline-flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; line-height: 24px; color: var(--grey); }
@media (prefers-reduced-motion: reduce) {
  .e6 .e6-crm-side .fl, .e6 .e6-def-flow path { stroke-dashoffset: 0 !important; transition: none !important; }
  .e6 .e6-crm-side .dot, .e6 .e6-res .ph, .e6 .e6-rule { opacity: 1 !important; transform: none !important; transition: none !important; }
}
`

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
/* Nov 20 (Harbor): same title weight and spacing as Trust Bank (Roboto Regular 64/72, -0.02em) */
.e5 .e5-h1 { margin-top: 32px; max-width: 960px; font-size: 64px; font-weight: 400; line-height: 72px; letter-spacing: -0.02em; }
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
/* Nov 20 (Harbor): no grey divider lines; numbers line up with the note below */
.e5 .e5-stats > div { padding: 8px 24px 8px 0; }
.e5 .e5-stats .n { display: block; font-size: 48px; font-weight: 700; line-height: 56px; color: var(--red); white-space: nowrap; font-variant-numeric: tabular-nums; }
.e5 .e5-stats p { margin-top: 8px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-note { margin-top: 16px; font-size: 16px; line-height: 24px; color: var(--grey); }

/* discover: old portal + pins */
.e5 .e5-oldc { background-image: none; }
.e5 .e5-old { position: relative; }
.e5 .e5-ring { position: absolute; width: 1.95%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; pointer-events: none; }
.e5 .e5-ring::before, .e5 .e5-ring::after { content: ""; position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--red); opacity: 0; }
.e5 .e5-old.pins-on .e5-ring::before { animation: e5-ping 2.4s cubic-bezier(.22,1,.36,1) var(--d, 0s) 2; }
.e5 .e5-ring.hot::before, .e5 .e5-ring.hot::after { animation: e5-ping 1.2s cubic-bezier(.22,1,.36,1) 0s 3 !important; }
.e5 .e5-ring.hot::after { animation-delay: .4s !important; }
@keyframes e5-ping { 0% { opacity: .9; transform: scale(1); } 100% { opacity: 0; transform: scale(2.6); } }

/* before → after (Nov 19): pinned; the rail moves one screen per scroll step */
.e5 .e5-slider { position: relative; --gap: 40px; --sw: min(1200px, calc(100vw - 64px)); }
.e5 .e5-slider.pinned { --sw: min(1200px, calc(100vw - 64px), calc((100vh - 280px) * 1.875)); }
.e5 .e5-sl-pin { display: flex; flex-direction: column; justify-content: center; }
.e5 .e5-slider.pinned .e5-sl-pin { position: sticky; top: 0; height: 100vh; padding-top: 72px; box-sizing: border-box; }
.e5 .e5-track { overflow: hidden; }
.e5 .e5-rail { display: flex; gap: var(--gap); padding-left: calc((100% - var(--sw)) / 2); transition: transform .9s cubic-bezier(.22,1,.36,1); will-change: transform; }
.e5 .e5-slide { flex: none; width: var(--sw); opacity: .35; transition: opacity .5s ease; }
.e5 .e5-slide.on { opacity: 1; }
/* v6 (Nov 20, Figma 2087:1492): each card is a dark panel; sizes follow the 1200 px frame (--u = 1 Figma px), type stays
   at the site's 16px minimum. Small cards: the two crops side by side, the notes as a list under them. */
.e5 .e5-slide .e5-card { container: bap / inline-size; overflow: hidden; }
.e5 .bap { --u: calc(100cqw / 1200); position: relative; aspect-ratio: 1200 / 640; background: #111113; color: #D4D4D8;
  display: flex; align-items: center; transform: scale(.98); transition: transform .6s cubic-bezier(.22,1,.36,1); }
.e5 .e5-slide.on .bap { transform: none; }
.e5 .bap-row { display: flex; align-items: flex-start; gap: calc(32 * var(--u)); padding: 24px 0 24px calc(56 * var(--u)); }
.e5 .bap-col { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; width: calc(300 * var(--u)); }
.e5 .bap-tag { display: inline-flex; align-items: center; height: 32px; padding: 0 10px; border: 1px solid rgba(255,255,255,.12); border-radius: 6px;
  background: rgba(255,255,255,.06); color: #A1A1AA; font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; white-space: nowrap; }
.e5 .bap-after { position: relative; width: 100%; }
.e5 .bap-cw { position: relative; width: 100%; overflow: hidden; background: #FFFFFF; }
.e5 .bap-cw img { display: block; width: 100%; height: auto; pointer-events: none; }
.e5 .bap-cw.before::after { content: ""; position: absolute; inset: 0; background: rgba(17,17,19,.28); }
.e5 .bap-notes { list-style: none; margin: 0; padding: 0; }
.e5 .bap-notes li { position: absolute; left: calc(100% + 10 * var(--u)); display: flex; align-items: center; transform: translateY(-50%);
  width: calc(464 * var(--u)); }
.e5 .bap-notes .dot { flex: none; position: relative; z-index: 1; width: 9px; height: 9px; margin: 0 -4.5px; border-radius: 50%; background: var(--red); box-shadow: 0 0 0 2px rgba(227,30,36,.32); }
.e5 .bap-notes .ld { flex: none; width: calc(46 * var(--u)); height: 1px; background: rgba(138,138,147,.9); }
.e5 .bap-notes span { padding-left: calc(16 * var(--u)); font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; text-transform: uppercase; color: #D4D4D8; }
@container bap (max-width: 760px) {
  .e5 .bap { --u: 1px; aspect-ratio: auto; display: block; padding: 20px; }
  .e5 .bap-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 12px; row-gap: 12px; padding: 0; }
  .e5 .bap-col, .e5 .bap-after { display: contents; }
  .e5 .bap-col:first-child .bap-tag { grid-area: 1 / 1; justify-self: start; }
  .e5 .bap-col:first-child .bap-cw { grid-area: 2 / 1; }
  .e5 .bap-col:last-child .bap-tag { grid-area: 1 / 2; justify-self: start; }
  .e5 .bap-col:last-child .bap-cw { grid-area: 2 / 2; }
  .e5 .bap-cw { height: auto !important; max-height: 420px; }
  .e5 .bap-notes { grid-area: 3 / 1 / 4 / 3; margin-top: 8px; }
  .e5 .bap-notes li { position: static; transform: none; width: auto; align-items: flex-start; gap: 12px; margin-top: 12px; }
  .e5 .bap-notes .dot { margin: 7px 0 0; }
  .e5 .bap-notes .ld { display: none; }
  .e5 .bap-notes span { padding: 0; }
}

.e5 .e5-slide .cap { margin-top: 24px; padding-right: 200px; }
.e5 .e5-slide .cap h3 { font-size: 20px; font-weight: 700; line-height: 28px; }
.e5 .e5-slide .cap p { margin-top: 4px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-sl-foot { display: flex; align-items: center; justify-content: flex-end; gap: 24px; width: var(--sw); margin: -52px auto 0; }
.e5 .e5-sl-foot .count { font-size: 16px; line-height: 24px; color: var(--grey); font-variant-numeric: tabular-nums; }
.e5 .e5-sl-foot .count b { color: var(--ink); font-weight: 700; }
.e5 .e5-sl-foot .ticks { display: flex; gap: 8px; }
.e5 .e5-sl-foot .ticks i { display: block; width: 24px; height: 2px; background: var(--cline); transition: background-color .4s ease; }
.e5 .e5-sl-foot .ticks i.on { background: var(--ink); }
/* small or short screens: the four screens one under another */
.e5 .e5-slider:not(.pinned) .e5-rail { flex-direction: column; gap: 56px; width: var(--sw); margin: 0 auto; padding-left: 0; transition: none; }
.e5 .e5-slider:not(.pinned) .e5-slide { opacity: 1; }
.e5 .e5-slider:not(.pinned) .e5-slide .bap { transform: none; }
.e5 .e5-slider:not(.pinned) .e5-slide .cap { padding-right: 0; }

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
.e5 .e5-rcard .e5-bar { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; }
.e5 .e5-rcard .e5-bar > i { display: block; flex: none; height: 16px; background: #C8C8CC; transform-origin: left; transform: scaleX(0); transition: transform 1s cubic-bezier(.22,1,.36,1) .2s; }
.e5 .e5-rcard .rr.after .e5-bar > i { background: var(--red); transition-delay: .5s; }
.e5 .e5-rcard .sq { display: flex; gap: 4px; }
.e5 .e5-rcard .sq i { display: block; width: 20px; height: 16px; background: #C8C8CC; transform: scale(0); transition: transform .4s cubic-bezier(.34,1.56,.64,1) var(--d, 0s); }
.e5 .e5-rcard .rr.after .sq i { background: var(--red); }
.e5 [data-r].in .e5-rcard .e5-bar > i, .e5 [data-r].in .e5-rcard .sq i { transform: none; }
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
.e5 .e5-take .t { margin-top: 24px; max-width: 1000px; font-size: 56px; font-weight: 700; line-height: 64px; color: #FFFFFF; }
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
}
@media (max-width: 1023px) {
  .e5 .e5-row { flex-direction: column; gap: 16px; }
  .e5 .e5-rt { width: auto; }
  .e5 .e5-stills { grid-template-columns: minmax(0, 1fr); max-width: 464px; }
  .e5 .e5-results { grid-template-columns: minmax(0, 1fr); }
  .e5 .e5-quote { grid-template-columns: 32px minmax(0, 1fr); gap: 24px; }
  .e5 .e5-quote .c { display: none; }
}
@media (max-width: 700px) {
  .e5 .e5-w { width: calc(100vw - 40px); }
  .e5 .e5-slider { --sw: calc(100vw - 40px); }
  .e5 .e5-hero { padding: 104px 0 88px; }
  .e5 .e5-h1 { font-size: 40px; line-height: 48px; }
  .e5 .e5-sec { padding: 88px 0; }
  .e5 .e5-h2 { font-size: 32px; line-height: 40px; }
  .e5 .mt120 { margin-top: 88px; }
  .e5 .e5-meta, .e5 .e5-stats { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .e5 .e5-stats .n { font-size: 40px; line-height: 48px; }
  .e5 .e5-rcard .big { font-size: 48px; line-height: 56px; }
  .e5 .e5-take { padding: 88px 0 240px; }
  .e5 .e5-take::before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, rgba(10,8,9,.72) 0%, rgba(10,8,9,.55) 65%, rgba(10,8,9,0) 100%); }
  .e5 .e5-take .t { font-size: 36px; line-height: 44px; }
  .e5 .e5-take .d { margin-top: 32px; font-size: 18px; line-height: 28px; }
  .e5 .e5-quote p { font-size: 20px; line-height: 32px; }
}
@media (prefers-reduced-motion: reduce) {
  .e5 [data-r] { opacity: 1 !important; transform: none !important; transition: none !important; }
  .e5 .e5-rcard .e5-bar i, .e5 .e5-rcard .sq i { transform: none !important; opacity: 1 !important; transition: none !important; }
  .e5 .e5-ring::before, .e5 .e5-ring::after { animation: none !important; }
  .e5 .e5-take .bg { transform: none !important; }
  .e5 .e5-rail { transition: none; }
}
`
