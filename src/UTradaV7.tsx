import React, { useEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { SideToc, useHeadroom } from './CaseNav'
import { SiteHeaderB } from './SiteHeaderB'
import { CaseFilm, useCaseIntro } from './CaseFilm'

/**
 * UTrada case study (v21, Harbor Nov 18) — rebuilt from Harbor's revised Figma "UTrada_v.6 · Final (Trust Bank level)"
 * (file 44기 김지현 4차 랜딩페이지, node 1890:1214). Copy is the frame's, word for word.
 * What changed from UTradaV6.tsx (kept, unused): Overview has no photos; Process is the purple "first look to launch"
 * scene (story card + flow, Figma's 10s motion loop); Discover is the broker diagram, the UTrada history card, three
 * photo finding cards and the 4-broker check table; Define holds the proto-persona, the trust chart (journey map)
 * and the principles; Develop has three screen panels (Regulations, Account comparison, Help & Support) and the two
 * concept screens. Deliver and Test are as before.
 * Nov 20 (Harbor): the page ends on Takeaways (Figma 2078:1266, file 9eRSsfAhsJk0OmvJdrxZ6E) instead of Reflection: dark
 * #0D0A17, one takeaway line and paragraph, and the photo of Harbor with a UTrada bag on the right, fading in from the
 * left (the frame's mask: transparent → solid at 32%). ClosingPhoto is kept below, unused.
 * Colours (Figma): ink #000D10, grey #66666E, lines #D5D3D4 / #E5E5EB, purple #8A2BE3, deep #330099, soft #F6F5FA.
 * Type: the site's Roboto on the frame's sizes; nothing under 16px. Square corners except Figma's round pills,
 * avatars and chart dots. Layout: 1440 column, sections 160px top and bottom, 8px spacing.
 * Motion:
 * - opening film fills the screen, then settles under the headline (CaseFilm.tsx; skipped on phones)
 * - soft reveal on blocks, bouncing card rows (as on GameCove / Trust Bank)
 * - Process (Nov 19: follows the scroll, one stage per step; was Figma's 10s loop, 1906:2811) — pills slide in one by one, connectors draw, chips fade in, the story card
 *   changes DISCOVER → DEFINE → DEVELOP → DELIVER; runs while the section is on screen
 * - Discover: the diagram builds node by node; the history rail fills 2018 → 2024; table marks pop row by row
 * - Define: the trust line draws, dots and risk bars come in; hover or click a stage to read its moment
 * - Develop: screen panels stack (each slides over the last); hover magnifier on screenshots and concept screens
 * Small screens (≤ 1023px): no stacking, diagram and process shown as simple lists; wide tables scroll sideways.
 * Assets: Harbor-K/harbor-pf assets/utrada/v7/ (exported from the Figma frame at 2x) + v3 logo/film, v6 closing photo.
 */

const A3 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/utrada/v3/'
const A6 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/utrada/v6/'
const A7 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/utrada/v7/'
const IMG = {
  logo: A3 + 'logo.png',
  video: A3 + 'intro.mp4',
  poster: A3 + 'intro-poster.jpg',
  closing: A6 + 'photo-closing.webp',
  takeaways: A7 + 'takeaways-photo.webp',
  fca: A7 + 'logo-fca.png',
  tileLicence: A7 + 'tile-licence.webp',
  tileCysec: A7 + 'tile-cysec.webp',
  tickmill: A7 + 'logo-tickmill.png',
  ig: A7 + 'logo-ig.png',
  pepperstone: A7 + 'logo-pepperstone.svg',
  utradaLogo: A7 + 'logo-utrada.svg',
  persona: A7 + 'persona-trader.webp',
  regulations: A7 + 'screen-regulations.webp',
  accounts: A7 + 'screen-accounts.webp',
  help: A7 + 'screen-help.webp',
  conceptA: A7 + 'concept-a.webp',
  conceptB: A7 + 'concept-b.webp',
}
const SITE = 'https://utrada.com'
const FILM_LABEL = 'UTrada intro film: a trader at night wonders whether a new broker with no reviews is safe, checks the regulations page, the legal documents, the trading accounts and the help chat, then signs up. Ends on: UTrada, trust before the first deposit.'
const NEXT = { name: 'ETO Markets', href: '#/eto-markets' }
export const U7_CHAPTERS = ['Overview', 'Process', 'Discover', 'Define', 'Develop', 'Deliver', 'Test', 'Takeaways']

const DARK = '#0B0B0D'

/* ---------- helpers (same behaviour as the GameCove page) ---------- */

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

/** true while the element is on screen (for loops that should only run when seen) */
function useOnScreen<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (!('IntersectionObserver' in window)) { setOn(true); return }
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.25 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return [ref, on] as const
}

/** true on screens big enough for stacked scenes */
const WIDE_Q = '(min-width: 1024px) and (min-height: 760px)'
function useWide() {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && matchMedia(WIDE_Q).matches && !reducedMotion())
  useEffect(() => {
    const mq = matchMedia(WIDE_Q)
    const set = () => setOn(mq.matches && !reducedMotion())
    set(); mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [])
  return on
}

/** hover magnifier for images marked data-gzoom (Trust Bank / GameCove feel) */
function useMagnifier(rootRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || !matchMedia('(pointer: fine)').matches || reducedMotion()) return
    type Z = { s: number; ts: number; ox: number; oy: number; tox: number; toy: number }
    const HOVER_SCALE = 1.8
    const zooms = new Map<HTMLImageElement, Z>()
    let active: HTMLImageElement | null = null, raf = 0
    const local = (img: HTMLImageElement, z: Z | undefined, cx: number, cy: number) => {
      const r = img.getBoundingClientRect(), s = z?.s ?? 1, ox = z?.ox ?? 0, oy = z?.oy ?? 0
      const bl = r.left - ox * (1 - s), bt = r.top - oy * (1 - s)
      return { x: clamp(cx - bl, 0, img.offsetWidth), y: clamp(cy - bt, 0, img.offsetHeight) }
    }
    const release = () => { if (active) { const z = zooms.get(active); if (z) z.ts = 1 } active = null }
    const onMove = (e: PointerEvent) => {
      const img = (e.target as HTMLElement)?.closest?.('img') as HTMLImageElement | null
      if (img && root.contains(img) && img.dataset.gzoom === 'true') {
        if (active !== img) { release(); active = img }
        let z = zooms.get(img)
        const p = local(img, z, e.clientX, e.clientY)
        if (!z) { z = { s: 1, ts: HOVER_SCALE, ox: p.x, oy: p.y, tox: p.x, toy: p.y }; zooms.set(img, z); img.style.transition = 'none'; img.style.willChange = 'transform, clip-path' }
        z.ts = HOVER_SCALE; z.tox = p.x; z.toy = p.y
      } else release()
    }
    const clear = (img: HTMLImageElement) => { img.style.transform = ''; img.style.transformOrigin = ''; img.style.clipPath = ''; img.style.transition = ''; img.style.willChange = '' }
    const tick = () => {
      zooms.forEach((z, img) => {
        z.s += (z.ts - z.s) * 0.14; z.ox += (z.tox - z.ox) * 0.2; z.oy += (z.toy - z.oy) * 0.2
        if (z.ts === 1 && z.s < 1.002) { clear(img); zooms.delete(img); return }
        const w = img.offsetWidth, h = img.offsetHeight, k = 1 - 1 / z.s
        img.style.transformOrigin = `${z.ox}px ${z.oy}px`
        img.style.transform = `scale(${z.s})`
        img.style.clipPath = `inset(${z.oy * k}px ${(w - z.ox) * k}px ${(h - z.oy) * k}px ${z.ox * k}px)`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    addEventListener('pointermove', onMove, { passive: true }); document.addEventListener('mouseleave', release)
    return () => { cancelAnimationFrame(raf); removeEventListener('pointermove', onMove); document.removeEventListener('mouseleave', release); zooms.forEach((_, img) => clear(img)); zooms.clear() }
  }, [rootRef])
}

/** cards that bounce in one after another (GameCove / Trust Bank) */
function Bounce({ children, className, step = 0.2 }: { children: React.ReactNode[]; className: string; step?: number }) {
  const [ref, shown] = useShownOnce<HTMLDivElement>(0.2)
  return (
    <div ref={ref} className={className}>
      {children.map((c, i) => (
        <div key={i} className="bounce" style={{
          opacity: shown ? 1 : 0,
          transform: shown ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.94)',
          transition: `opacity 0.8s ease ${i * step}s, transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * step}s`,
        }}>{c}</div>
      ))}
    </div>
  )
}

function Label({ children, light }: { children: string; light?: boolean }) {
  return <div className={'u7-label' + (light ? ' light' : '')}><i aria-hidden="true" />{children}</div>
}

/* ---------- content (Figma 1890:1214, word for word) ---------- */

const OVERVIEW = [
  // Nov 19 (Harbor): the business objective is part of the challenge now, so it has no row of its own
  { t: 'Challenge', b: 'In 2024, UTrada rebranded and opened its first Australian office. To new visitors, it was a name they had never heard of — and they had no easy way to check if their money would be safe. The business needed first-time visitors to confirm their ID and add money. To do that, people had to trust UTrada before signing up.' },
  { t: 'Solution', b: 'I found the 5 moments when people hesitate. Each one got a screen that answers its question right there.' },
]
const IMPACT = [
  { n: '5', c: 'hesitation moments, one screen each' },
  { n: '4', c: 'fixes I shipped after launch (Notion log)' },
  { n: '16', c: 'months designing and fixing the live site' },
]

/* process (1906:2811) */
const ICONS = {
  search: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.5 16.5C13.8137 16.5 16.5 13.8137 16.5 10.5C16.5 7.18629 13.8137 4.5 10.5 4.5C7.18629 4.5 4.5 7.18629 4.5 10.5C4.5 13.8137 7.18629 16.5 10.5 16.5Z" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 15L19.5 19.5" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  target: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19.5C16.1421 19.5 19.5 16.1421 19.5 12C19.5 7.85786 16.1421 4.5 12 4.5C7.85786 4.5 4.5 7.85786 4.5 12C4.5 16.1421 7.85786 19.5 12 19.5Z" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75Z" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 12.75C12.4142 12.75 12.75 12.4142 12.75 12C12.75 11.5858 12.4142 11.25 12 11.25C11.5858 11.25 11.25 11.5858 11.25 12C11.25 12.4142 11.5858 12.75 12 12.75Z" fill="#292929" /></svg>,
  layout: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.25 5.25H3.75V18.75H20.25V5.25Z" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M3.75 9H20.25M9 9V18.75" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  check: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 12L9.75 17.25L19.5 6.75" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
}
const STAGES_P = [
  { k: 'DISCOVER', t: '01 · Look closely', items: ['Live-site audit', 'Broker basics', 'Rules by market', 'Other brokers’ pages'], icon: ICONS.search, tile: '#C9B2FF' },
  { k: 'DEFINE', t: '02 · One problem + HMW', items: ['5 hesitation moments', 'Business vs trader goals'], icon: ICONS.target, tile: '#F5C7ED' },
  { k: 'DEVELOP', t: '03 · 5 screens', items: ['Regulations', 'Cookie consent', 'Broker check', 'Accounts', 'Help & Support'], icon: ICONS.layout, tile: '#B2CCFF' },
  { k: 'DELIVER', t: '04 · Ship, fix, test', items: ['4 post-launch fixes', 'Concept: which company am I signing with?', '5-user test plan'], icon: ICONS.check, tile: '#EDEBF7' },
]

/* discover (1934:505) */
const HISTORY = [
  { y: '2018', t: 'Founded in Malaysia' },
  { y: '2019', t: 'Office in Singapore' },
  { y: '2022', t: 'Clients in 120+ countries' },
  { y: '2024', t: 'Australia office + rebrand' },
]
const FINDINGS = [
  { big: ['£78M'], src: 'UK REGULATOR · FCA · JAN 2021', tile: '', logo: true,
    lead: 'lost in the UK in 2020 to fake “clone” firms that copy real company names, addresses and licence numbers.',
    meant: 'A licence number alone isn’t proof. People need to be able to check it.',
    ref: 'fca.org.uk · press release, 27 Jan 2021' },
  { big: ['Licence first'], src: 'STUDY · FXSTREET via FINANCE MAGNATES · JUL 2024', tile: IMG.tileLicence,
    lead: 'Traders judge a broker’s reliability by its licensing, withdrawal times and customer support.',
    meant: 'A new name has no reviews, so licensing and support have to do the work reviews would do.',
    ref: 'financemagnates.com · 2 Jul 2024' },
  { big: ['€2,000', '15 days'], src: 'CYPRUS REGULATOR · CySEC via FINANCE MAGNATES · JUL 2025', tile: IMG.tileCysec,
    lead: 'Firms can accept up to €2,000 before a client’s ID check is done, from a bank account in the client’s name.',
    meant: 'Rules on money and ID differ by country, so the sign-up should say which company and which rules apply.',
    ref: 'financemagnates.com · 9 Jul 2025' },
]
type Mark = 'y' | 'p' | 'n' | 'u'
const BROKERS = [
  { name: 'Tickmill', page: 'Licences and regulation page', logo: IMG.tickmill, w: 128, h: 48 },
  { name: 'IG', page: 'UK site footer', logo: IMG.ig, w: 48, h: 48 },
  { name: 'Pepperstone', page: 'EU legal documents page', logo: IMG.pepperstone, w: 202, h: 40 },
  { name: 'UTrada', page: 'Regulations page', logo: IMG.utradaLogo, w: 134, h: 32 },
]
const CHECKS: [string, Mark[]][] = [
  ['Names the company you sign with', ['y', 'y', 'y', 'p']],
  ['Shows the licence number', ['y', 'y', 'y', 'p']],
  ['Explains how your money is protected', ['y', 'y', 'y', 'n']],
  ['Links to the regulator’s register', ['y', 'u', 'u', 'n']],
]
const MARK_TXT: Record<Mark, string> = { y: '✓', p: '△', n: '✕', u: '—' }
const MARK_SR: Record<Mark, string> = { y: 'yes', p: 'only for one of its two companies', n: 'no', u: 'not seen on the page checked' }

/* define (1937:630) */
const STAGES = ['First visit', 'Checking', 'Sign up', 'Verify ID', 'First deposit', 'Trade']
const FEEL = ['unsure', 'worried', 'hopeful', 'annoyed', 'anxious', 'relieved']
const ASKS = [
  '“Never heard of them. Is this real?”',
  '“Who runs this — and is it really licensed?”',
  '“Which account is right for me?”',
  '“Why do they need all this?”',
  '“If I send money now, can I get it back?”',
  '“Someone will answer if something goes wrong.”',
]
const ANSWERS: { t: string; concept?: boolean }[][] = [
  [{ t: '→ Cookie consent' }],
  [{ t: '→ Regulations' }, { t: '→ Broker check' }],
  [{ t: '→ Account comparison' }],
  [{ t: '→ Concept: which company? (not built)', concept: true }],
  [{ t: '→ Help & Support' }],
  [{ t: '→ Help & Support' }],
]
// the trust line: y in the 272px plot (neutral = 112), x = column centres
const PT_Y = [112, 144, 56, 104, 160, 32]
type Risk = 'high' | 'highest' | 'medium' | 'low'
const RISK: { r: Risk; h: number }[] = [{ r: 'high', h: 48 }, { r: 'high', h: 48 }, { r: 'medium', h: 32 }, { r: 'medium', h: 32 }, { r: 'highest', h: 64 }, { r: 'low', h: 16 }]
const RISK_TAG: Record<Risk, string> = { highest: '▼ Highest risk of leaving', high: '▼ High risk of leaving', medium: 'Medium risk of leaving', low: '▲ Low risk of leaving' }
const PRINCIPLES = [
  { t: 'Make the licence checkable', b: 'Show the regulator, the licensed company and the number together — and let people compare it with the regulator’s own register.' },
  { t: 'Say which company you sign with', b: 'If more than one company runs the brand, say which one your account is with and what protection comes with it.' },
  { t: 'Show help before money', b: 'Make support easy to find before the first deposit, when people are most nervous.' },
]

/* develop (1931:1039) */
const PANELS = [
  { k: '01 · Regulations page', status: 'Live today', img: IMG.regulations,
    alt: 'UTrada Regulations page: Financial Services Commission, Mauritius, with the FSC logo, what the FSC regulates and UTrada Global Limited’s licence number GB24204031; below it the Labuan Financial Services Authority',
    decided: 'One section per regulator: its name and logo, what it supervises, then one plain sentence naming the licensed company and its licence number.',
    why: 'A name people don’t know yet has little to look up, so its licence is the strongest proof a visitor can check. Copycat firms reuse real licence numbers, so the real one has to be easy to find and compare.',
    k3: 'Live today', v3: '“UTrada Global Limited is licensed and regulated by the Financial Services Commission of Mauritius under License No. GB24204031.”' },
  { k: '02 · Account comparison', status: 'Reworked · Mar 2025', img: IMG.accounts,
    alt: 'UTrada trading accounts side by side: Ultra from 0.0 pips, Premium from 1.2 pips and Standard from 1.8 pips, each with the same rows — commission, minimum deposit, lot size, leverage, execution type, fees, stop-out level and server location',
    decided: 'Three cards side by side, with the same rows in the same order. The price comes first (“From 0.0 pips”), and each card has its own Join Now.',
    why: 'Spread, commission and minimum deposit are hard to compare in your head — and first-time traders don’t know which one matters.',
    k3: 'After launch', v3: 'Reworked in March 2025.' },
  { k: '03 · Help & Support', status: 'Fixed · Nov 2024', img: IMG.help,
    alt: 'UTrada help chat, rebuilt from the live site: “We’re away at the moment. Leave a message, and we’ll reply by email.” above a form — “Let’s chat! Fill in a few details to get started.” with Name and E-mail fields and a Start the chat button',
    decided: 'Help is reachable from every page. When nobody is online, the chat asks for a name and email instead of leaving a dead end.',
    why: 'Before the first deposit, people want to know a real person will answer if something goes wrong.',
    k3: 'After launch', v3: 'Fixed in November 2024. A contact button was added in October 2025.' },
]
const GAPS = [
  { p: 'No link to the regulator’s own register.', s: '→ A “Check on the FSC register” button on each company card.' },
  { p: 'Two companies, but no way to tell which one holds your account.', s: '→ Pick your country → see your company, regulator and contract.' },
  { p: 'Nothing says what to check before adding money.', s: '→ Three steps to check it yourself, and a chat before you pay.' },
]
const CONCEPTS = [
  { img: IMG.conceptA, w: 708, h: 1001, cap: 'A · Regulations page — who you trade with',
    alt: 'Concept A, UTrada Regulations page “Who you trade with”: showing for Malaysia, your account would be with UTrada Global Limited — Financial Services Commission, Mauritius, licence GB24204031, Client Agreement and Risk Disclosure, a Check on the FSC register button — beside UT Solutions LLC with its regulator and licence marked “To confirm with compliance”; below, Check it yourself in 3 steps and a dark strip “Not sure? Talk to us before you add money.” with Start a chat' },
  { img: IMG.conceptB, w: 708, h: 646, cap: 'B · Sign-up step — which company am I signing with?',
    alt: 'Concept B, UTrada sign-up step 1 of 4 (Register, Verify, Fund, Trade): “Where do you live?” with Malaysia chosen, then “You’ll open your account with UTrada Global Limited”, licensed by the Financial Services Commission, Mauritius, licence GB24204031, a Check on the FSC register button and the Client Agreement and Risk Disclosure; on the right “What happens next” and Chat with us' },
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

/* ---------- Process: story card + flow, one step per scroll (Nov 19) ---------- */

/**
 * Nov 19 (Harbor): the 10s loop felt too slow, so the scene now follows the scroll instead of a clock. It stays pinned
 * while you scroll through it and each scroll step brings in the next stage: its pill slides in, the connector draws,
 * the chip appears and the story card changes DISCOVER → DEFINE → DEVELOP → DELIVER. Scrolling back steps back.
 * Narrow or short screens and reduced motion: the finished picture (or the list on small screens), no pinning.
 */
function ProcessScene() {
  const wide = useWide()
  const outer = useRef<HTMLDivElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const N = STAGES_P.length
  const [step, setStep] = useState(wide ? -1 : N - 1)
  useEffect(() => {
    if (!wide) { setStep(N - 1); return }
    let raf = 0
    const run = () => {
      raf = 0
      const el = outer.current, p = pin.current; if (!el || !p) return
      const r = el.getBoundingClientRect()
      const top = parseFloat(getComputedStyle(p).top) || 0
      const travel = el.offsetHeight - p.offsetHeight
      let s = -1
      if (r.top < innerHeight * 0.55) s = Math.min(N - 1, Math.floor(clamp((top - r.top) / Math.max(1, travel)) * N))
      setStep(v => (v === s ? v : s))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [wide, N])
  const cls = (base: string, on: boolean) => base + (on ? ' on' : '')
  return (
    <div ref={outer} className={'u7-proc-outer' + (wide ? ' pinned' : '')} style={wide ? { height: `calc(656px + ${N * 55}vh)` } : undefined}>
      <div ref={pin} className="u7-proc-pin">
        <Label light>PROCESS</Label>
        <h2 className="u7-h2 light mt48">From first look to launch</h2>
    <div className="u7-proc">
      <div className="u7-proc-cards">
        {STAGES_P.map((s, i) => (
          <div key={s.k} className={'u7-story c' + i + (i === step ? ' on' : i < step ? ' past' : '')} aria-hidden={i !== Math.max(0, step)}>
            <div className="k">{s.k}</div>
            <h3>{s.t}</h3>
            <ul>{s.items.map(x => <li key={x}>· {x}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="u7-flow" aria-hidden="true">
        <svg className="u7-flow-lines" width="480" height="456" viewBox="0 0 480 456" fill="none">
          <path className={cls('cn cn1', step >= 1)} d="M108 72 V172 H160" pathLength={1} />
          <path className={cls('cn cn2', step >= 2)} d="M108 172 V300 H160" pathLength={1} />
          <path className={cls('cn cn3', step >= 3)} d="M108 300 V428 H160" pathLength={1} />
        </svg>
        {STAGES_P.map((s, i) => (
          <div key={s.k} className={cls('u7-pill p' + i, step >= i)}>
            <span className="tile" style={{ background: s.tile }}>{s.icon}</span>
            <span className="t">{s.t}</span>
          </div>
        ))}
        {STAGES_P.slice(1).map((s, i) => <span key={s.k} className={cls('u7-chip h' + (i + 1), step >= i + 1)}>{s.k}</span>)}
      </div>
      {/* small screens: the four steps as a list */}
      <ol className="u7-proc-list">
        {STAGES_P.map(s => (
          <li key={s.k} className="u7-story">
            <div className="k">{s.k}</div>
            <h3>{s.t}</h3>
            <ul>{s.items.map(x => <li key={x}>· {x}</li>)}</ul>
          </li>
        ))}
      </ol>
    </div>
      </div>
    </div>
  )
}

/* ---------- Discover: broker diagram (builds node by node) ---------- */

const AVATAR = (fill: string, stroke: string) => (
  <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
    <path d="M48 94C73.4051 94 94 73.4051 94 48C94 22.5949 73.4051 2 48 2C22.5949 2 2 22.5949 2 48C2 73.4051 22.5949 94 48 94Z" fill={fill} stroke={stroke} strokeWidth="3" />
    <path d="M48 51C55.1797 51 61 45.1797 61 38C61 30.8203 55.1797 25 48 25C40.8203 25 35 30.8203 35 38C35 45.1797 40.8203 51 48 51Z" fill="white" stroke={stroke} strokeWidth="3" />
    <path d="M24 74C26.5 61 36 55 48 55C60 55 69.5 61 72 74" fill="white" />
    <path d="M24 74C26.5 61 36 55 48 55C60 55 69.5 61 72 74" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
  </svg>
)
const TRADER = AVATAR('#FCE4F1', '#E15FA6')
const IB = AVATAR('#E3F5E4', '#3FA34D')
const px = (x: number) => `${(x / 1440) * 100}%`

function BrokerDiagram() {
  const [ref, on] = useShownOnce<HTMLDivElement>(0.35)
  const at = (x: number, y: number, n: number) => ({ left: px(x), top: y, '--d': n } as React.CSSProperties)
  return (
    <div ref={ref} className={'u7-dg' + (on ? ' on' : '')} role="img"
      aria-label="Diagram: the regulator, FSC Mauritius, licenses one of UTrada’s two companies and keeps watching it. A trader deposits and trades with UTrada. UTrada pays an introducing broker (IB) a commission, and the IB refers traders with a link. UTrada is run by UTrada Global Limited, licensed in Mauritius, and UTrada LLC, registered in St Vincent.">
      <svg className="lines" viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true">
        <path style={d(1)} d="M720 128 V232" pathLength={1} />
        <path style={d(4)} d="M200 272 H520" pathLength={1} />
        <path style={d(6)} d="M920 272 H1240" pathLength={1} />
        <path style={d(8)} d="M720 312 V344 H568 V376 M720 344 H872 V376" pathLength={1} />
        <path style={d(10)} d="M160 320 V528 H1280 V320" pathLength={1} />
      </svg>
      <div className="n reg" style={at(720, 48, 0)}><b>Regulator · FSC Mauritius</b><span>licenses one of the two companies</span></div>
      <div className="pill" style={at(720, 168, 2)}>licenses &amp; watches</div>
      <div className="n ut" style={at(720, 232, 3)}>UTrada</div>
      <div className="who" style={at(160, 184, 4)}><b>Trader</b>{TRADER}</div>
      <div className="pill" style={at(360, 256, 5)}>Deposit · trade</div>
      <div className="who" style={at(1280, 184, 6)}><b>IB · Introducing Broker</b>{IB}</div>
      <div className="pill" style={at(1080, 256, 7)}>Commission</div>
      <div className="n co" style={at(568, 376, 8)}><b>UTrada Global Limited</b><span>Licensed · Mauritius</span></div>
      <div className="n co" style={at(872, 376, 9)}><b>UTrada LLC</b><span>Registered · St Vincent</span></div>
      <div className="pill" style={at(720, 512, 11)}>Refers traders with a link</div>
    </div>
  )
}

/** small screens: the same relations as a list */
function BrokerList() {
  return (
    <div className="u7-dgl" data-r>
      <div className="n reg"><b>Regulator · FSC Mauritius</b><span>licenses one of the two companies</span></div>
      <span className="pill">↓ licenses &amp; watches</span>
      <div className="n ut">UTrada</div>
      <div className="cos">
        <div className="n co"><b>UTrada Global Limited</b><span>Licensed · Mauritius</span></div>
        <div className="n co"><b>UTrada LLC</b><span>Registered · St Vincent</span></div>
      </div>
      <ul className="rel">
        <li><span className="av">{TRADER}</span><span><b>Trader → UTrada</b><br />Deposit · trade</span></li>
        <li><span className="av">{IB}</span><span><b>UTrada → IB · Introducing Broker</b><br />Commission</span></li>
        <li><span className="av">{IB}</span><span><b>IB → Trader</b><br />Refers traders with a link</span></li>
      </ul>
    </div>
  )
}

function History() {
  const [ref, on] = useShownOnce<HTMLDivElement>(0.4)
  return (
    <div ref={ref} className={'u7-hist' + (on ? ' on' : '')} data-r>
      <div className="k">UTRADA HISTORY · FROM UTRADA.COM</div>
      <ol className="steps">
        {HISTORY.map((h, i) => (
          <li key={h.y} className={i === HISTORY.length - 1 ? 'now' : ''} style={d(i)}>
            <span className="rail" aria-hidden="true"><i className="dot" />{i < HISTORY.length - 1 && <i className="ln" />}</span>
            <b>{h.y}</b>
            <span className="t">{h.t}</span>
          </li>
        ))}
      </ol>
      <div className="new"><b>UTrada</b><span>A new name, with no track record under it yet</span></div>
    </div>
  )
}

function BrokerTable() {
  const [ref, on] = useShownOnce<HTMLDivElement>(0.25)
  return (
    <div className="u7-scroll">
      <div ref={ref} className={'u7-mx' + (on ? ' on' : '')} role="table" aria-label="What a trader can check on four brokers’ own pages">
        <div className="tr th" role="row">
          <div className="c q" role="columnheader"><span className="k">WHAT A TRADER CAN CHECK</span></div>
          {BROKERS.map(b => (
            <div key={b.name} className={'c b' + (b.name === 'UTrada' ? ' ut' : '')} role="columnheader">
              <span className="lg"><img src={b.logo} alt={b.name} width={b.w} height={b.h} loading="lazy" /></span>
              <span className="pg">{b.page}</span>
            </div>
          ))}
        </div>
        {CHECKS.map(([q, ms], r) => (
          <div key={q} className="tr" role="row">
            <div className="c q" role="rowheader"><b>{q}</b></div>
            {ms.map((m, i) => (
              <div key={i} className={'c' + (i === 3 ? ' ut' : '')} role="cell">
                <span className={'mk ' + m} style={{ '--d': r * 4 + i } as React.CSSProperties} aria-label={`${BROKERS[i].name}: ${MARK_SR[m]}`}>{MARK_TXT[m]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Define: trust chart (journey map) ---------- */

function TrustChart() {
  const [ref, on] = useShownOnce<HTMLDivElement>(0.3)
  const [sel, setSel] = useState(4)
  const xs = STAGES.map((_, i) => 104 + i * 208)
  const line = xs.map((x, i) => `${i ? 'L' : 'M'} ${x} ${PT_Y[i]}`).join(' ')
  const area = `${line} L ${xs[5]} 200 L ${xs[0]} 200 Z`
  const r = RISK[sel]
  return (
    <div className="u7-scroll">
      <div ref={ref} className={'u7-tc' + (on ? ' on' : '')}>
        <div className="hd" aria-live="polite">
          <div className="sym"><i aria-hidden="true" /><b>Trust in UTrada</b><span>First-time trader · assumed</span></div>
          <div className="hl"><span className="st">{STAGES[sel]}</span><span className={'tag ' + r.r}>{RISK_TAG[r.r]}</span></div>
          <p className="meta">Feeling: {FEEL[sel]}  ·  {ASKS[sel]}</p>
        </div>

        <div className="plot">
          <div className="cols">
            <svg className="ln" viewBox="0 0 1248 272" preserveAspectRatio="none" aria-hidden="true">
              <defs><linearGradient id="u7-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8A2BE3" stopOpacity=".16" /><stop offset="1" stopColor="#8A2BE3" stopOpacity="0" /></linearGradient></defs>
              <line className="neutral" x1="0" y1="112" x2="1248" y2="112" vectorEffect="non-scaling-stroke" />
              <path className="area" d={area} fill="url(#u7-area)" />
              <path className="trend" d={line} pathLength={1} vectorEffect="non-scaling-stroke" />
              <line className="base" x1="0" y1="272" x2="1248" y2="272" vectorEffect="non-scaling-stroke" />
            </svg>
            {STAGES.map((s, i) => (
              <button key={s} type="button" className={'col' + (i === sel ? ' sel' : '')} style={d(i)}
                onMouseEnter={() => setSel(i)} onFocus={() => setSel(i)} onClick={() => setSel(i)} aria-pressed={i === sel}
                aria-label={`${s}: feeling ${FEEL[i]}, ${RISK_TAG[RISK[i].r].replace(/[▼▲] /, '').toLowerCase()}`}>
                <i className="dot" style={{ top: PT_Y[i] }} aria-hidden="true" />
                <i className={'bar ' + RISK[i].r} style={{ height: RISK[i].h }} aria-hidden="true" />
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

        <div className="asks">
          {ASKS.map((a, i) => (
            <div key={a} className={'ac' + (i === sel ? ' sel' : '')} style={d(i)} onMouseEnter={() => setSel(i)}>
              <p>{a}</p>
              {ANSWERS[i].map(c => <span key={c.t} className={'chip' + (c.concept ? ' concept' : '')}>{c.t}</span>)}
            </div>
          ))}
          <div className="ac lab">they ask → screen that answers</div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Develop: screen panels that stack ---------- */

function useStack(on: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const cards = Array.from(el.querySelectorAll<HTMLElement>('.u7-sq'))
    if (!on) { cards.forEach(c => c.style.removeProperty('--k')); return }
    let raf = 0
    const run = () => {
      raf = 0
      cards.forEach((c, i) => {
        const nx = cards[i + 1]
        if (!nx) { c.style.setProperty('--k', '0'); return }
        const a = c.getBoundingClientRect(), b = nx.getBoundingClientRect()
        const k = clamp(1 - (b.top - a.top) / (a.height + 80))
        c.style.setProperty('--k', clamp((k - 0.3) / 0.5).toFixed(3))
      })
    }
    const go = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', go, { passive: true }); addEventListener('resize', go)
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', go); removeEventListener('resize', go) }
  }, [on])
  return ref
}

function ScreenPanels({ wide }: { wide: boolean }) {
  const ref = useStack(wide)
  return (
    <div ref={ref} className={'u7-stack' + (wide ? ' on' : '')}>
      {PANELS.map(p => (
        <div key={p.k} className="u7-sq" data-r>
          <article className="u7-panel">
            <div className="txt">
              <div className="lab">{p.k}</div>
              <span className="status">{p.status}</span>
              <h3>{p.decided}</h3>
              <div className="spec">
                <div><div className="k">Why</div><p>{p.why}</p></div>
                <div><div className="k">{p.k3}</div><p>{p.v3}</p></div>
              </div>
            </div>
            <div className="scr"><figure className="u7-img shot"><img src={p.img} alt={p.alt} data-gzoom="true" loading="lazy" /></figure></div>
          </article>
        </div>
      ))}
    </div>
  )
}

/* ---------- closing photo: eases from 108% to 100% as it scrolls in ---------- */

function ClosingPhoto() {
  const fig = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)
  useEffect(() => {
    let raf = 0
    const run = () => {
      raf = 0
      const f = fig.current, m = img.current; if (!f || !m || reducedMotion()) return
      const r = f.getBoundingClientRect()
      const p = clamp((innerHeight - r.top) / (innerHeight + r.height * 0.5))
      m.style.transform = `scale(${(1.08 - 0.08 * p).toFixed(4)})`
    }
    const go = () => { if (!raf) raf = requestAnimationFrame(run) }
    run(); addEventListener('scroll', go, { passive: true }); addEventListener('resize', go)
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', go); removeEventListener('resize', go) }
  }, [])
  return (
    <figure className="u7-closing" data-r>
      <div className="ph" ref={fig}><img ref={img} src={IMG.closing} loading="lazy" alt="Harbor in a design session, listening, a laptop with app screens open beside her" /></div>
      <figcaption className="u7-cap night">Designing clearly from what I observe.</figcaption>
    </figure>
  )
}

/* ---------- page ---------- */

export function UTradaV7() {
  const [introOn] = useState(() => !reducedMotion())
  const [intro, setIntro] = useState(introOn)
  const away = useHeadroom()
  const root = useRef<HTMLDivElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const media = useRef<HTMLVideoElement>(null)
  const wide = useWide()
  useCaseIntro(introOn, slot, box, media, () => setIntro(false))
  useMagnifier(root)

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
    <div className={'hb ut u7' + (intro ? ' intro-on' : '')} ref={root}>
      <style>{CSS + U7_CSS}</style>
      <SiteHeaderB mode="light" hidden={intro} away={away} />
      <SideToc chapters={U7_CHAPTERS} scope=".u7" hidden={intro} />

      <main id="top">
        {/* Hero */}
        <section className="u7-hero" data-chapter="UTrada" aria-label="UTrada">
          <div className="u7-w">
            <img className="u7-logo" src={IMG.logo} alt="UTrada" width={160} height={38} />
            <h1 className="u7-h1">Trust, before the first deposit</h1>
            <p className="u7-sub">How I redesigned UTrada’s website so first-time visitors could check it was safe before adding money.</p>
            <a className="u7-btn" href={SITE} target="_blank" rel="noreferrer">View Website<span className="sr-only"> (opens in a new tab)</span></a>
            <div className="u7-slot" ref={slot}>
              <div className="u7-box" ref={box}><CaseFilm src={IMG.video} poster={IMG.poster} label={FILM_LABEL} quiet={intro} introRef={media} /></div>
            </div>
            <div className="u7-meta">
              <div data-r style={d(0)}><div className="k">TIMELINE</div><p>Jul 2024 – Oct 2025</p></div>
              <div data-r style={d(1)}><div className="k">ROLE</div><p>Product Designer<br />Structure, flows and page layout</p></div>
              <div data-r style={d(2)}><div className="k">INDUSTRY</div><p>Fintech · Online trading · Web</p></div>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="u7-sec soft" data-chapter="Overview">
          <div className="u7-w">
            <Label>OVERVIEW</Label>
            <div className="u7-rows mt64">
              {OVERVIEW.map((r, i) => (
                <div className="u7-row" key={r.t} data-r style={d(i)}><h2 className="u7-rt">{r.t}</h2><p className="u7-body">{r.b}</p></div>
              ))}
              <div className="u7-row" data-r>
                <h2 className="u7-rt">Impact</h2>
                <Bounce className="u7-stats">
                  {IMPACT.map(s => <div key={s.c}><div className="n">{s.n}</div><p>{s.c}</p></div>)}
                </Bounce>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="u7-sec u7-pr" data-chapter="Process">
          <i className="glow" aria-hidden="true" />
          <div className="u7-w">
            <ProcessScene />
          </div>
        </section>

        {/* Discover */}
        <section className="u7-sec soft" data-chapter="Discover">
          <div className="u7-w">
            <Label>DISCOVER</Label>

            <div className="mt96">
              <div className="u7-head g16" data-r>
                <Label>WHAT A BROKER IS</Label>
                <h2 className="u7-h2">You trust it with your money</h2>
              </div>
              <div className="mt48 u7-dg-wrap">{wide ? <BrokerDiagram /> : <BrokerList />}</div>
            </div>

            <div className="u7-block mt96">
              <div className="u7-text" data-r>
                <h2 className="u7-h2">What the company faced<br />A new name nobody knew</h2>
                <p className="u7-body">UTrada had just rebranded, so its name had no track record. Two companies in two countries ran it, under different rules.</p>
              </div>
              <History />
            </div>

            <div className="mt96">
              <h3 className="u7-h3" data-r>What the research showed</h3>
              <Bounce className="u7-finds mt32">
                {FINDINGS.map(f => (
                  <article key={f.ref} className="u7-find">
                    <div className={'tile' + (f.tile ? '' : ' plain')}>
                      {f.tile && <img src={f.tile} alt="" loading="lazy" />}
                      <i className="shade" aria-hidden="true" />
                      {f.logo && <img className="fca" src={IMG.fca} alt="Financial Conduct Authority" width={142} height={45} loading="lazy" />}
                      <div className="cap">
                        <div className="big">{f.big.map((b, i) => <span key={b}>{i > 0 && <br />}{b}</span>)}</div>
                        <div className="src">{f.src}</div>
                      </div>
                    </div>
                    <p className="lead">{f.lead}</p>
                    <div className="meant"><div className="k em">WHAT IT MEANT FOR UTRADA</div><p>{f.meant}</p></div>
                    <p className="ref">{f.ref}</p>
                  </article>
                ))}
              </Bounce>
            </div>

            <div className="mt96">
              <div className="u7-head g8" data-r>
                <h3 className="u7-h3">How other global brokers show who you trade with</h3>
                <p className="u7-body mute">Four checks a trader can make before adding money — on each broker’s own pages (checked Nov 2026).</p>
              </div>
              <div className="mt32"><BrokerTable /></div>
              <ul className="u7-legend mt32" data-r>
                <li><b>✓</b>yes</li>
                <li><b>△</b>only for one of its two companies</li>
                <li><b>✕</b>no</li>
                <li><b>—</b>not seen on the page checked</li>
              </ul>
              <p className="u7-src mt32" data-r>Pages checked (Nov 2026): tickmill.com/about/licences-and-regulation · ig.com/uk (site footer) · pepperstone.com/en-eu/legal-documents · utrada.com/en/company/regulations</p>
            </div>
          </div>
        </section>

        {/* Define */}
        <section className="u7-sec soft" data-chapter="Define">
          <div className="u7-w">
            <Label>DEFINE</Label>

            <div className="mt96">
              <h2 className="u7-h2" data-r>Who I designed for</h2>
              <div className="u7-persona mt32" data-r>
                <img className="ph" src={IMG.persona} alt="The first-time trader, a man in a dark hoodie at his laptop at night (a still from the intro film)" width={240} height={240} loading="lazy" />
                <div className="info">
                  <div className="hd">
                    <div className="tag">Proto-persona · from desk research, not interviews</div>
                    <h3>The first-time trader</h3>
                    <p>Found UTrada through an ad or a search and has never heard the name before. Ready to try it — but only after checking it is safe.</p>
                  </div>
                  <div className="nw">
                    <div><div className="k">Needs</div><p className="b">Proof they can check themselves — not just a promise on the home page.</p></div>
                    <div><div className="k">Worries</div>
                      <p>“Is this company real — and really licensed?”</p>
                      <p>“If I send money, can I get it back?”</p>
                      <p>“Who answers if something goes wrong?”</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt96">
              <div className="u7-head g16" data-r>
                <h2 className="u7-h2">Where a first-time trader slows down</h2>
                <p className="u7-body mute">From the first visit to the first trade. Built from the live site and public research — not from interviews. The 5-person test will check it.</p>
              </div>
              <div className="mt32"><TrustChart /></div>
              <p className="u7-src mt32" data-r>Sources: UK FCA (2021) · FXStreet via Finance Magnates (2024) · CySEC via Finance Magnates (2025) · utrada.com (checked Nov 2026).</p>
            </div>

            <div className="mt96" data-r>
              <h2 className="u7-h2">One problem</h2>
              <p className="u7-hmw">How might we help a first-time visitor check that UTrada is safe, right at the moment they feel unsure — without making sign-up slower?</p>
            </div>
            <Bounce className="u7-goals mt40">
              <div><div className="k">FOR THE BUSINESS</div><p>More visitors become customers who confirm their ID and add money.</p></div>
              <div><div className="k">FOR THE TRADER</div><p>They can check the facts for themselves before handing over money.</p></div>
            </Bounce>

            <div className="u7-insight mt96" data-r>Insight — What builds trust has to change with where you live and which company you sign with.</div>

            <div className="mt48">
              <h3 className="u7-h3" data-r>What this means for the design</h3>
              <Bounce className="u7-princ mt32">
                {PRINCIPLES.map((p, i) => <div key={p.t} className="pc"><div className="n">0{i + 1}</div><b>{p.t}</b><p>{p.b}</p></div>)}
              </Bounce>
            </div>
          </div>
        </section>

        {/* Develop */}
        <section className="u7-sec soft" data-chapter="Develop">
          <div className="u7-w">
            <Label>DEVELOP</Label>
            <div className="u7-head g24 mt120" data-r>
              <h2 className="u7-h2">One screen per moment</h2>
              <p className="u7-body mute w760">Each screen answers one worry. For each, I show why, what I decided, and what changed after launch.</p>
            </div>
            <div className="mt64"><ScreenPanels wide={wide} /></div>

            <div className="mt120">
              <div className="u7-chead" data-r>
                <span className="u7-badge clay">CONCEPT · NOT BUILT</span>
                <h2 className="u7-h2">What I’d design next: show who you trade with</h2>
                <p className="u7-body mute w760">Comparing UTrada with Tickmill showed three gaps. This concept fills them, in UTrada’s own brand style.</p>
              </div>
              <Bounce className="u7-gaps mt48">
                {GAPS.map((g, i) => <div key={g.p} className="gp"><div className="k">GAP 0{i + 1}</div><p>{g.p}</p><p className="s">{g.s}</p></div>)}
              </Bounce>
              <div className="u7-cscreens mt48">
                {CONCEPTS.map((c, i) => (
                  <figure key={c.cap} data-r style={d(i)}>
                    <div className="u7-img cs" style={{ aspectRatio: `${c.w} / ${c.h}` }}><img src={c.img} alt={c.alt} data-gzoom="true" loading="lazy" /></div>
                    <figcaption className="u7-cap">{c.cap}</figcaption>
                  </figure>
                ))}
              </div>
              <p className="u7-src mt48" data-r>Facts from utrada.com: UTrada Global Limited, FSC Mauritius, Licence No. GB24204031. UT Solutions LLC’s regulator and licence aren’t shown on the site, so they’re marked “to confirm”. The country shown is an example.</p>
            </div>
          </div>
        </section>

        {/* Deliver */}
        <section className="u7-sec" data-chapter="Deliver">
          <div className="u7-w">
            <Label>DELIVER</Label>
            <div className="u7-block mt96">
              <div className="u7-text" data-r>
                <h2 className="u7-h2">After launch<br />I kept fixing what didn’t match</h2>
                <p className="u7-body">I kept improving the site after it went live, from July 2024 to October 2025 — for example the account page (March 2025) and the legal documents (October 2025).</p>
              </div>
              <ol className="u7-log" aria-label="What I shipped after launch (Notion log)">
                {LOG.map(([dt, t], i) => <li key={dt} data-r style={d(i)}><span className="d">{dt}</span><span>{t}</span></li>)}
              </ol>
            </div>
            <div className="u7-dconcept mt96">
              <div className="u7-chead" data-r>
                <span className="u7-badge">CONCEPT · NOT BUILT</span>
                <h2 className="u7-h2">If UTrada got a Cyprus licence</h2>
                <p className="u7-body">How sign-up concept B would change under CySEC’s 2025 rules for EU clients.</p>
              </div>
              <Bounce className="u7-steps" step={0.15}>
                {STEPS.flatMap((s, i) => [
                  ...(i > 0 ? [<span key={'a' + i} className="ar" aria-hidden="true">→</span>] : []),
                  <div key={s} className="st"><span className="n">{i + 1}</span><p>{s}</p></div>,
                ])}
              </Bounce>
              <p className="u7-src" data-r>Why: Cyprus’s financial regulator (CySEC) added these limits in July 2025. UTrada doesn’t have a Cyprus licence, so this shows how the flow would work if it did.</p>
            </div>
          </div>
        </section>

        {/* Test */}
        <section className="u7-sec soft" data-chapter="Test">
          <div className="u7-w">
            <Label>TEST</Label>
            <div className="u7-head g24 mt96" data-r>
              <h2 className="u7-h2">How I’ll test it<br />5 people, 3 tasks</h2>
              <p className="u7-body w760">On the live website first, then on concepts A and B. I’ll note who finished each task, how sure they felt (1 to 5), and what they said out loud.</p>
            </div>
            <Bounce className="u7-tasks mt96">
              {TASKS.map((t, i) => <div key={t} className="tk"><div className="n">TASK {i + 1}</div><p>{t}</p><p className="res">Not run yet — planned on the live site.</p></div>)}
            </Bounce>
          </div>
        </section>

        {/* Takeaways (Nov 20, Harbor's Figma Section / Takeaways 2078:1266): replaces Reflection */}
        <section className="u7-take" data-chapter="Takeaways">
          <img className="u7-take-ph" src={IMG.takeaways} width={1490} height={1986} loading="lazy" decoding="async"
            alt="Harbor in a black UTrada T-shirt at a café table, holding up a purple UTrada bag printed with www.utrada.com" />
          <div className="u7-w">
            <div className="u7-take-in" data-r>
              <div className="u7-take-k"><i aria-hidden="true" />TAKEAWAYS</div>
              <h2 className="t">For a new broker, trust is something you can check.</h2>
              <p className="d">Proof beats promises. A licence number only helps when people can find it. The live site still says who regulates UTrada, but not which company your account is with. Next time I would test sign-up with five first-time traders before designing.</p>
            </div>
          </div>
        </section>

        <section className="u7-next" id="next">
          <a className="u7-w next-card" href={NEXT.href}>
            <span className="eyebrow">Next case study</span>
            <span className="next-name">{NEXT.name} <span className="go">→</span></span>
          </a>
        </section>
      </main>
    </div>
  )
}

const U7_CSS = `
.u7 { --ink: #000D10; --mute: #66666E; --line: #D5D3D4; --line2: #D6D4D4; --line3: #E5E5EB; --pu: #8A2BE3; --pu-rgb: 138, 43, 227;
  --deep: #330099; --grad: linear-gradient(90deg, #330099, #8A2BE3); --soft: #F6F5FA; --night: #0D0A17; --ease: cubic-bezier(.22,1,.36,1);
  background: #FFFFFF; color: var(--ink); }
.u7 .u7-w { position: relative; width: min(1440px, calc(100vw - 64px)); margin: 0 auto; }
.u7 h1, .u7 h2, .u7 h3, .u7 p, .u7 figure, .u7 ol, .u7 ul { margin: 0; padding: 0; }
.u7 ol, .u7 ul { list-style: none; }
.u7 .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.u7 .mt16 { margin-top: 16px; } .u7 .mt32 { margin-top: 32px; } .u7 .mt40 { margin-top: 40px; } .u7 .mt48 { margin-top: 48px; }
.u7 .mt64 { margin-top: 64px; } .u7 .mt96 { margin-top: 96px; } .u7 .mt120 { margin-top: 120px; } .u7 .w760 { max-width: 760px; }

/* soft reveal */
.u7 [data-r] { opacity: 0; transform: translate3d(0, 28px, 0); transition: opacity 1.2s var(--ease), transform 1.2s var(--ease); transition-delay: calc(var(--d, 0) * 120ms); }
.u7 [data-r].r-in { opacity: 1; transform: none; }
.u7 .bounce { display: flex; }
.u7 .bounce > * { flex: 1; min-width: 0; }

/* type */
.u7 .u7-label { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; color: var(--mute); }
.u7 .u7-label.light { color: #FFFFFF; }
.u7 .u7-label i { flex: none; width: 12px; height: 12px; background: var(--pu); }
.u7 .u7-h2 { font-size: 40px; font-weight: 700; line-height: 48px; letter-spacing: -0.015em; color: var(--ink); }
.u7 .u7-h2.light { color: #FFFFFF; }
.u7 .u7-h3 { font-size: 28px; font-weight: 700; line-height: 40px; letter-spacing: -0.01em; color: var(--ink); }
.u7 .u7-rt { flex: none; width: 370px; font-size: 24px; font-weight: 700; line-height: 32px; letter-spacing: -0.005em; color: var(--ink); }
.u7 .u7-body { font-size: 18px; line-height: 28px; color: var(--ink); }
.u7 .u7-body.mute { color: var(--mute); line-height: 32px; }
.u7 .u7-src, .u7 .u7-cap { font-size: 16px; line-height: 24px; color: var(--mute); }
.u7 .k { font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; color: var(--mute); }
.u7 .u7-head { display: flex; flex-direction: column; max-width: 900px; }
.u7 .u7-head.g8 { gap: 8px; } .u7 .u7-head.g16 { gap: 16px; } .u7 .u7-head.g24 { gap: 24px; }
.u7 .u7-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.u7 .u7-img { position: relative; overflow: hidden; background: var(--line); }
.u7 .u7-img img { display: block; width: 100%; height: 100%; object-fit: cover; }

/* hero */
.u7 .u7-hero { padding: 120px 0 160px; }
.u7 .u7-logo { display: block; width: 160px; height: auto; }
.u7 .u7-h1 { margin-top: 40px; max-width: 960px; font-size: 64px; font-weight: 700; line-height: 72px; letter-spacing: -0.02em; }
.u7 .u7-sub { margin-top: 16px; max-width: 881px; font-size: 18px; line-height: 28px; }
.u7 .u7-btn { display: inline-flex; align-items: center; justify-content: center; min-width: 200px; height: 56px; margin-top: 40px; padding: 0 32px;
  background: #000D0F; color: #FFFFFF !important; font-size: 16px; font-weight: 500; line-height: 24px; text-decoration: none;
  transition: background-color .3s, transform .35s var(--ease); }
.u7 .u7-btn:hover { background: #2A2A33; transform: translateY(-2px); }
.u7 .u7-btn:focus-visible { outline: 2px solid var(--pu); outline-offset: 3px; }
.u7 .u7-slot { position: relative; margin-top: 40px; aspect-ratio: 16 / 9; }
.u7 .u7-box { position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 40; overflow: hidden; background: ${DARK}; }
.u7 .u7-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 48px; margin-top: 40px; }
.u7 .u7-meta p { margin-top: 8px; font-size: 18px; line-height: 28px; }

/* sections */
.u7 .u7-sec { position: relative; padding: 160px 0; }
.u7 .u7-sec.soft { background: var(--soft); }
.u7 .u7-rows { display: flex; flex-direction: column; gap: 64px; }
.u7 .u7-row { display: flex; align-items: flex-start; }
.u7 .u7-row > .u7-body, .u7 .u7-row > .u7-stats, .u7 .u7-row > .u7-list { flex: 1; min-width: 0; }
.u7 .u7-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 48px; }
.u7 .u7-stats .n { font-size: 56px; font-weight: 700; line-height: 64px; letter-spacing: -0.02em; color: var(--pu); }
.u7 .u7-stats p { margin-top: 8px; font-size: 16px; line-height: 24px; color: var(--mute); }

/* process: purple scene + Figma's 10s loop */
.u7 .u7-pr { padding: 104px 0 160px; overflow: hidden; background: linear-gradient(180deg, #26096B, #4A1A9E); color: #FFFFFF; }
.u7 .u7-pr .glow { position: absolute; left: 50%; top: 240px; width: 1120px; height: 720px; transform: translateX(-50%); border-radius: 50% !important;
  background: radial-gradient(closest-side, rgba(138, 43, 227, .32), rgba(138, 43, 227, 0)); pointer-events: none; }
.u7 .u7-proc { position: relative; height: 480px; margin-top: 56px; }
.u7 .u7-proc-cards { position: absolute; left: 0; top: 64px; width: min(602px, 46%); }
.u7 .u7-story { display: flex; flex-direction: column; gap: 16px; padding: 40px; background: rgba(31, 5, 82, .45); border: 1px solid rgba(255, 255, 255, .28);
  -webkit-backdrop-filter: blur(24px); backdrop-filter: blur(24px); color: #FFFFFF; }
.u7 .u7-proc-cards .u7-story { position: absolute; left: 0; top: 0; width: 100%; box-sizing: border-box; opacity: 0; }
.u7 .u7-story .k { color: rgba(255, 255, 255, .7); letter-spacing: 0; }
.u7 .u7-story h3 { font-size: 40px; font-weight: 700; line-height: 48px; letter-spacing: -0.03em; }
.u7 .u7-story ul { display: flex; flex-direction: column; gap: 8px; }
.u7 .u7-story ul li { font-size: 18px; line-height: 32px; color: rgba(255, 255, 255, .85); }
.u7 .u7-flow { position: absolute; left: 50%; top: 0; width: 480px; height: 456px; }
.u7 .u7-flow-lines { position: absolute; left: 0; top: 0; overflow: visible; }
.u7 .u7-flow-lines .cn { stroke: rgba(255, 255, 255, .7); stroke-width: 2; stroke-dasharray: 1 1; stroke-dashoffset: 1; }
.u7 .u7-pill { position: absolute; display: flex; align-items: center; gap: 16px; height: 56px; box-sizing: border-box; padding: 8px 24px 8px 8px; white-space: nowrap;
  background: rgba(255, 255, 255, .9); box-shadow: 0 8px 24px rgba(16, 0, 48, .24); color: #292929; font-size: 18px; font-weight: 500; line-height: 24px; opacity: 0; }
.u7 .u7-pill .tile { display: grid; place-items: center; width: 40px; height: 40px; }
.u7 .u7-pill.p0 { left: 80px; top: 16px; } .u7 .u7-pill.p1 { left: 160px; top: 144px; } .u7 .u7-pill.p2 { left: 160px; top: 272px; } .u7 .u7-pill.p3 { left: 160px; top: 400px; }
.u7 .u7-chip { position: absolute; right: 380px; padding: 0 8px; background: #330099; color: #FFFFFF; font-size: 16px; font-weight: 500; line-height: 24px; opacity: 0; }
.u7 .u7-chip.h1 { top: 160px; } .u7 .u7-chip.h2 { top: 288px; } .u7 .u7-chip.h3 { top: 416px; }
.u7 .u7-proc-list { display: none; }
.u7 .u7-proc.play .u7-pill, .u7 .u7-proc.play .u7-chip, .u7 .u7-proc.play .cn, .u7 .u7-proc.play .u7-proc-cards .u7-story { animation-duration: 10s; animation-iteration-count: infinite; animation-fill-mode: both; animation-timing-function: cubic-bezier(.5, 0, .5, 1); }
.u7 .u7-proc.play .p0 { animation-name: u7-p0; } .u7 .u7-proc.play .p1 { animation-name: u7-p1; }
.u7 .u7-proc.play .p2 { animation-name: u7-p2; } .u7 .u7-proc.play .p3 { animation-name: u7-p3; }
.u7 .u7-proc.play .cn1 { animation-name: u7-cn1; } .u7 .u7-proc.play .cn2 { animation-name: u7-cn2; } .u7 .u7-proc.play .cn3 { animation-name: u7-cn3; }
.u7 .u7-proc.play .h1 { animation-name: u7-h1; } .u7 .u7-proc.play .h2 { animation-name: u7-h2; } .u7 .u7-proc.play .h3 { animation-name: u7-h3; }
.u7 .u7-proc.play .c0 { animation-name: u7-c0; } .u7 .u7-proc.play .c1 { animation-name: u7-c1; }
.u7 .u7-proc.play .c2 { animation-name: u7-c2; } .u7 .u7-proc.play .c3 { animation-name: u7-c3; }
/* Nov 19 (Harbor): Process follows the scroll (one stage per scroll step) instead of the 10s loop */
/* sticky needs the section to clip instead of hide its overflow */
.u7 .u7-pr { overflow: clip; }
.u7 .u7-proc-outer.pinned { position: relative; }
.u7 .u7-proc-outer.pinned .u7-proc-pin { position: sticky; top: max(96px, calc(50vh - 328px)); }
.u7 .u7-proc .u7-pill { opacity: 0; transform: translateX(-24px); transition: opacity .5s ease, transform .7s cubic-bezier(.22,1,.36,1); }
.u7 .u7-proc .u7-pill.on { opacity: 1; transform: none; }
.u7 .u7-proc .cn { transition: stroke-dashoffset .6s ease; }
.u7 .u7-proc .cn.on { stroke-dashoffset: 0; }
.u7 .u7-proc .u7-chip { transition: opacity .4s ease .35s; }
.u7 .u7-proc .u7-chip.on { opacity: 1; }
.u7 .u7-proc-cards .u7-story { transform: translateY(24px); transition: opacity .5s ease, transform .7s cubic-bezier(.22,1,.36,1); }
.u7 .u7-proc-cards .u7-story.on { opacity: 1; transform: none; transition-delay: .1s; }
.u7 .u7-proc-cards .u7-story.past { opacity: 0; transform: translateY(-24px); }
@keyframes u7-p0 { 0%, 2% { opacity: 0; transform: translateX(-24px); } 6% { opacity: 1; transform: translateX(-3px); } 7%, 100% { opacity: 1; transform: none; } }
@keyframes u7-p1 { 0%, 30% { opacity: 0; transform: translateX(-24px); } 34% { opacity: 1; transform: translateX(-3px); } 35%, 100% { opacity: 1; transform: none; } }
@keyframes u7-p2 { 0%, 54% { opacity: 0; transform: translateX(-24px); } 58% { opacity: 1; transform: translateX(-3px); } 59%, 100% { opacity: 1; transform: none; } }
@keyframes u7-p3 { 0%, 78% { opacity: 0; transform: translateX(-24px); } 82% { opacity: 1; transform: translateX(-3px); } 83%, 100% { opacity: 1; transform: none; } }
@keyframes u7-cn1 { 0%, 24% { stroke-dashoffset: 1; } 30%, 100% { stroke-dashoffset: 0; } }
@keyframes u7-cn2 { 0%, 48% { stroke-dashoffset: 1; } 54%, 100% { stroke-dashoffset: 0; } }
@keyframes u7-cn3 { 0%, 72% { stroke-dashoffset: 1; } 78%, 100% { stroke-dashoffset: 0; } }
@keyframes u7-h1 { 0%, 28% { opacity: 0; } 32%, 100% { opacity: 1; } }
@keyframes u7-h2 { 0%, 52% { opacity: 0; } 56%, 100% { opacity: 1; } }
@keyframes u7-h3 { 0%, 76% { opacity: 0; } 80%, 100% { opacity: 1; } }
@keyframes u7-c0 { 0%, 1% { opacity: 0; transform: translateY(40px); } 7% { opacity: 1; transform: translateY(2px); } 8%, 26% { opacity: 1; transform: none; } 30%, 100% { opacity: 0; transform: translateY(-24px); } }
@keyframes u7-c1 { 0%, 29% { opacity: 0; transform: translateY(24px); } 35% { opacity: 1; transform: translateY(1px); } 36%, 50% { opacity: 1; transform: none; } 54%, 100% { opacity: 0; transform: translateY(-24px); } }
@keyframes u7-c2 { 0%, 53% { opacity: 0; transform: translateY(24px); } 59% { opacity: 1; transform: translateY(1px); } 60%, 74% { opacity: 1; transform: none; } 78%, 100% { opacity: 0; transform: translateY(-24px); } }
@keyframes u7-c3 { 0%, 77% { opacity: 0; transform: translateY(24px); } 83% { opacity: 1; transform: translateY(1px); } 84%, 100% { opacity: 1; transform: none; } }

/* discover: broker diagram (desktop) */
.u7 .u7-dg { position: relative; height: 600px; background: #F8F7FC; }
.u7 .u7-dg .lines { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.u7 .u7-dg .lines path { fill: none; stroke: #BAA6E8; stroke-width: 2; vector-effect: non-scaling-stroke; stroke-dasharray: 1 1; stroke-dashoffset: 1;
  transition: stroke-dashoffset .7s ease; transition-delay: calc(var(--d, 0) * 130ms + 200ms); }
.u7 .u7-dg.on .lines path { stroke-dashoffset: 0; }
.u7 .u7-dg .n, .u7 .u7-dg .pill, .u7 .u7-dg .who { position: absolute; transform: translate(-50%, 12px); opacity: 0; text-align: center;
  transition: opacity .5s ease, transform .7s cubic-bezier(0.34, 1.56, 0.64, 1); transition-delay: calc(var(--d, 0) * 130ms + 150ms); }
.u7 .u7-dg.on .n, .u7 .u7-dg.on .pill, .u7 .u7-dg.on .who { opacity: 1; transform: translate(-50%, 0); }
.u7 .u7-dg .n { display: flex; flex-direction: column; justify-content: center; box-sizing: border-box; height: 80px; }
.u7 .u7-dg .n b { font-size: 18px; font-weight: 700; line-height: 24px; }
.u7 .u7-dg .n span { font-size: 16px; line-height: 24px; color: var(--mute); }
.u7 .u7-dg .reg { width: 328px; padding: 16px 32px; background: #EEE9FC; border: 1px solid #BAA6E8; }
.u7 .u7-dg .ut { width: min(400px, 28%); background: var(--grad); color: #FFFFFF; font-size: 24px; font-weight: 700; line-height: 32px; }
.u7 .u7-dg.on .ut { animation: u7-ring 1.6s ease-out 1.6s 2; }
@keyframes u7-ring { 0% { box-shadow: 0 0 0 0 rgba(var(--pu-rgb), .45); } 100% { box-shadow: 0 0 0 16px rgba(var(--pu-rgb), 0); } }
.u7 .u7-dg .co { width: min(288px, 21%); padding: 16px; background: #FFFFFF; border: 1px solid #BAA6E8; }
.u7 .u7-dg .co b { font-size: 16px; }
.u7 .u7-dg .pill { padding: 4px 16px; background: #FFFFFF; border: 1px solid #BAA6E8; border-radius: 999px !important; white-space: nowrap;
  font-size: 16px; font-weight: 500; line-height: 24px; color: var(--ink); }
.u7 .u7-dg .who { display: flex; flex-direction: column; align-items: center; gap: 16px; white-space: nowrap; }
.u7 .u7-dg .who b { font-size: 18px; font-weight: 700; line-height: 24px; }
.u7 .u7-dg .who svg { display: block; }

/* discover: diagram as a list (small screens) */
.u7 .u7-dgl { display: flex; flex-direction: column; align-items: stretch; gap: 16px; padding: 24px; background: #F8F7FC; text-align: center; }
.u7 .u7-dgl .n { display: flex; flex-direction: column; padding: 16px; border: 1px solid #BAA6E8; background: #FFFFFF; }
.u7 .u7-dgl .n b { font-size: 18px; line-height: 24px; } .u7 .u7-dgl .n span { font-size: 16px; line-height: 24px; color: var(--mute); }
.u7 .u7-dgl .reg { background: #EEE9FC; }
.u7 .u7-dgl .ut { background: var(--grad); border: 0; color: #FFFFFF; font-size: 24px; font-weight: 700; line-height: 32px; }
.u7 .u7-dgl .pill { align-self: center; padding: 4px 16px; border: 1px solid #BAA6E8; border-radius: 999px !important; background: #FFFFFF; font-size: 16px; font-weight: 500; line-height: 24px; }
.u7 .u7-dgl .cos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.u7 .u7-dgl .rel { display: flex; flex-direction: column; gap: 16px; margin-top: 8px; text-align: left; }
.u7 .u7-dgl .rel li { display: flex; align-items: center; gap: 16px; font-size: 16px; line-height: 24px; }
.u7 .u7-dgl .rel .av svg { display: block; width: 48px; height: 48px; }

/* discover: the company + history card */
.u7 .u7-block { display: grid; grid-template-columns: minmax(0, 640px) minmax(0, 736px); justify-content: space-between; gap: 64px; align-items: start; }
.u7 .u7-text { display: flex; flex-direction: column; gap: 24px; }
.u7 .u7-hist { display: flex; flex-direction: column; gap: 32px; padding: 40px; background: var(--night); color: #FFFFFF; }
.u7 .u7-hist > .k { color: #BFB2D9; }
.u7 .u7-hist .steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.u7 .u7-hist .steps li { display: flex; flex-direction: column; gap: 16px; color: #BFB8D1; }
.u7 .u7-hist .rail { position: relative; display: block; height: 16px; }
.u7 .u7-hist .dot { position: absolute; left: 0; top: 0; width: 16px; height: 16px; border-radius: 50% !important; background: rgba(255, 255, 255, .5);
  transform: scale(0); transition: transform .5s cubic-bezier(0.34, 1.56, 0.64, 1); transition-delay: calc(var(--d, 0) * 320ms + 200ms); }
.u7 .u7-hist .ln { position: absolute; left: 16px; right: 0; top: 7px; height: 2px; background: rgba(255, 255, 255, .25); transform: scaleX(0); transform-origin: left;
  transition: transform .4s ease; transition-delay: calc(var(--d, 0) * 320ms + 420ms); }
.u7 .u7-hist.on .dot { transform: scale(1); } .u7 .u7-hist.on .ln { transform: scaleX(1); }
.u7 .u7-hist .now { color: #FFFFFF; }
.u7 .u7-hist .now .dot { background: var(--grad); }
.u7 .u7-hist.on .now .dot { animation: u7-ring 1.8s ease-out 1.6s infinite; }
.u7 .u7-hist .steps b { font-size: 40px; font-weight: 700; line-height: 48px; }
.u7 .u7-hist .steps .t { padding-right: 16px; font-size: 16px; line-height: 24px; }
.u7 .u7-hist .new { align-self: flex-start; display: flex; align-items: center; gap: 16px; padding: 16px 24px; background: var(--grad); }
.u7 .u7-hist .new b { font-size: 24px; font-weight: 700; line-height: 32px; }
.u7 .u7-hist .new span { font-size: 16px; font-weight: 500; line-height: 24px; }

/* discover: findings */
.u7 .u7-finds { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; align-items: stretch; }
.u7 .u7-find { display: flex; flex-direction: column; gap: 24px; height: 100%; }
.u7 .u7-find .tile { position: relative; aspect-ratio: 464 / 400; overflow: hidden; background: #1C122E; color: #FFFFFF; }
.u7 .u7-find .tile > img:first-child { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 1.2s var(--ease); }
.u7 .u7-find:hover .tile > img:first-child { transform: scale(1.04); }
.u7 .u7-find .shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, .72) 100%); }
.u7 .u7-find .fca { position: absolute; left: 32px; top: 32px; width: 142px; height: auto; }
.u7 .u7-find .cap { position: absolute; left: 32px; right: 32px; bottom: 32px; display: flex; flex-direction: column; gap: 8px; }
.u7 .u7-find .big { font-size: 56px; font-weight: 700; line-height: 64px; letter-spacing: -0.02em; }
.u7 .u7-find .src { min-height: 48px; font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; color: rgba(255, 255, 255, .85); }
.u7 .u7-find .lead { max-width: 400px; font-size: 18px; line-height: 32px; }
.u7 .u7-find .meant { display: flex; flex-direction: column; gap: 8px; padding-top: 16px; border-top: 1px solid var(--line2); }
.u7 .u7-find .k.em { color: var(--pu); }
.u7 .u7-find .meant p { max-width: 400px; font-size: 18px; font-weight: 600; line-height: 32px; }
.u7 .u7-find .ref { margin-top: auto; font-size: 16px; line-height: 24px; color: var(--mute); }

/* discover: 4-broker table */
.u7 .u7-mx { min-width: 1000px; background: #FFFFFF; border: 1px solid #DBD9E5; }
.u7 .u7-mx .tr { display: grid; grid-template-columns: minmax(0, 416fr) repeat(4, minmax(0, 256fr)); border-top: 1px solid #DBD9E5; }
.u7 .u7-mx .tr.th { border-top: 0; }
.u7 .u7-mx .c { display: flex; align-items: center; min-height: 80px; box-sizing: border-box; padding: 24px; }
.u7 .u7-mx .c.ut { background: #EFEAFD; }
.u7 .u7-mx .th .c { min-height: 128px; }
.u7 .u7-mx .c.b { flex-direction: column; align-items: flex-start; justify-content: flex-start; gap: 8px; }
.u7 .u7-mx .lg { display: flex; align-items: center; height: 48px; }
.u7 .u7-mx .lg img { display: block; width: auto; max-width: 100%; height: auto; max-height: 48px; }
.u7 .u7-mx .pg { font-size: 16px; line-height: 24px; color: var(--mute); }
.u7 .u7-mx .q b { font-size: 18px; font-weight: 700; line-height: 24px; }
.u7 .u7-mx .mk { display: grid; place-items: center; width: 32px; height: 32px; box-sizing: border-box; border-radius: 50% !important; font-size: 16px; font-weight: 500; line-height: 24px;
  transform: scale(0); transition: transform .5s cubic-bezier(0.34, 1.56, 0.64, 1); transition-delay: calc(var(--d, 0) * 70ms + 200ms); }
.u7 .u7-mx.on .mk { transform: scale(1); }
.u7 .u7-mx .mk.y { background: var(--pu); color: #FFFFFF; }
.u7 .u7-mx .mk.p { background: #FFFFFF; border: 2px solid var(--pu); color: var(--pu); }
.u7 .u7-mx .mk.n { background: #E5E5EB; color: var(--mute); }
.u7 .u7-mx .mk.u { color: #9999A1; }
.u7 .u7-legend { display: flex; flex-wrap: wrap; gap: 8px 24px; font-size: 16px; line-height: 24px; color: var(--mute); }
.u7 .u7-legend li { display: flex; gap: 8px; }
.u7 .u7-legend b { font-weight: 500; color: var(--pu); }

/* define: persona */
.u7 .u7-persona { display: flex; gap: 40px; padding: 40px; background: #FFFFFF; border: 1px solid var(--line); }
.u7 .u7-persona .ph { flex: none; display: block; width: 240px; height: 240px; object-fit: cover; }
.u7 .u7-persona .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 24px; }
.u7 .u7-persona .hd { display: flex; flex-direction: column; gap: 8px; }
.u7 .u7-persona .tag { font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; text-transform: uppercase; color: var(--pu); }
.u7 .u7-persona h3 { font-size: 32px; font-weight: 700; line-height: 40px; }
.u7 .u7-persona .hd p { font-size: 18px; line-height: 28px; }
.u7 .u7-persona .nw { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 40px; }
.u7 .u7-persona .nw > div { display: flex; flex-direction: column; gap: 8px; }
.u7 .u7-persona .nw .k { text-transform: uppercase; }
.u7 .u7-persona .nw p { font-size: 16px; line-height: 24px; }
.u7 .u7-persona .nw p.b { font-weight: 700; }

/* define: trust chart */
.u7 .u7-tc { min-width: 1180px; display: flex; flex-direction: column; gap: 32px; padding: 40px; background: #FFFFFF; border: 1px solid var(--line3); }
.u7 .u7-tc .hd { display: flex; flex-direction: column; gap: 8px; }
.u7 .u7-tc .sym { display: flex; align-items: center; gap: 8px; font-size: 16px; line-height: 24px; }
.u7 .u7-tc .sym i { width: 24px; height: 24px; border-radius: 50% !important; background: var(--grad); }
.u7 .u7-tc .sym b { font-weight: 600; color: #0A0D14; } .u7 .u7-tc .sym span { color: var(--mute); }
.u7 .u7-tc .hl { display: flex; align-items: center; gap: 16px; }
.u7 .u7-tc .st { font-size: 40px; font-weight: 700; line-height: 48px; color: #0A0D14; }
.u7 .u7-tc .tag { padding: 4px 12px; border-radius: 999px !important; font-size: 16px; font-weight: 500; line-height: 24px; }
.u7 .u7-tc .tag.highest, .u7 .u7-tc .tag.high { background: #FCEBED; color: #DE3345; }
.u7 .u7-tc .tag.medium { background: #F2F2F5; color: var(--mute); }
.u7 .u7-tc .tag.low { background: #E6F6EE; color: #0A9E61; }
.u7 .u7-tc .meta { font-size: 16px; line-height: 24px; color: var(--mute); white-space: pre-wrap; }
.u7 .u7-tc .plot { display: grid; grid-template-columns: minmax(0, 1fr) 112px; }
.u7 .u7-tc .cols { position: relative; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); height: 344px; }
.u7 .u7-tc .ln { position: absolute; left: 0; top: 0; width: 100%; height: 272px; overflow: visible; pointer-events: none; z-index: 1; }
.u7 .u7-tc .neutral { stroke: rgba(102, 102, 110, .5); stroke-width: 1; stroke-dasharray: 4 4; }
.u7 .u7-tc .base { stroke: var(--line3); stroke-width: 1; }
.u7 .u7-tc .trend { fill: none; stroke: var(--pu); stroke-width: 3; stroke-linejoin: round; stroke-dasharray: 1 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.6s var(--ease) .3s; }
.u7 .u7-tc .area { opacity: 0; transition: opacity 1s ease 1.4s; }
.u7 .u7-tc.on .trend { stroke-dashoffset: 0; } .u7 .u7-tc.on .area { opacity: 1; }
.u7 .u7-tc .col { position: relative; height: 344px; padding: 0; background: transparent; border: 0; font: inherit; color: inherit; cursor: pointer; transition: background-color .3s ease; }
.u7 .u7-tc .col.sel { background: #F5F0FF; }
.u7 .u7-tc .col:focus-visible { outline: 2px solid var(--pu); outline-offset: -2px; }
.u7 .u7-tc .col .dot { position: absolute; left: 50%; z-index: 2; width: 10px; height: 10px; box-sizing: border-box; margin: -5px 0 0 -5px; border: 2px solid var(--pu); background: #FFFFFF;
  border-radius: 50% !important; transform: scale(0); transition: transform .5s cubic-bezier(0.34, 1.56, 0.64, 1), width .25s, height .25s, margin .25s, background-color .25s;
  transition-delay: calc(var(--d, 0) * 160ms + 500ms), 0s, 0s, 0s, 0s; }
.u7 .u7-tc.on .col .dot { transform: scale(1); }
.u7 .u7-tc .col.sel .dot { width: 16px; height: 16px; margin: -8px 0 0 -8px; border-width: 4px; background: var(--pu); }
.u7 .u7-tc .bar { position: absolute; left: 50%; bottom: 72px; width: 48px; margin-left: -24px; transform: scaleY(0); transform-origin: bottom;
  transition: transform .7s var(--ease); transition-delay: calc(var(--d, 0) * 110ms + 900ms); }
.u7 .u7-tc.on .bar { transform: scaleY(1); }
.u7 .u7-tc .bar.high { background: rgba(222, 51, 69, .7); } .u7 .u7-tc .bar.highest { background: #DE3345; }
.u7 .u7-tc .bar.medium { background: rgba(199, 199, 204, .7); } .u7 .u7-tc .bar.low { background: rgba(10, 158, 97, .7); }
.u7 .u7-tc .xl { position: absolute; left: 0; right: 0; top: 288px; display: flex; flex-direction: column; align-items: center; font-size: 16px; line-height: 24px; }
.u7 .u7-tc .xl b { font-weight: 500; color: #0A0D14; } .u7 .u7-tc .xl span { color: var(--mute); }
.u7 .u7-tc .col.sel .xl b { font-weight: 600; color: var(--pu); }
.u7 .u7-tc .axis { position: relative; }
.u7 .u7-tc .axis span { position: absolute; left: 16px; font-size: 16px; line-height: 24px; color: var(--mute); white-space: nowrap; }
.u7 .u7-tc .axis .tagn { left: 12px; padding: 4px 12px; background: #0A0D14; color: #FFFFFF; font-weight: 500; border-radius: 999px !important; }
.u7 .u7-tc .asks { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)) 112px; border-top: 1px solid var(--line3); }
.u7 .u7-tc .ac { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 24px 16px; transition: background-color .3s ease; }
.u7 .u7-tc .ac.sel { background: #F5F0FF; }
.u7 .u7-tc .ac p { margin-bottom: 8px; font-size: 16px; font-weight: 500; line-height: 24px; color: #0A0D14; }
.u7 .u7-tc .chip { display: block; align-self: stretch; padding: 4px 12px; background: #F2F2F5; font-size: 16px; line-height: 24px; color: var(--mute); }
.u7 .u7-tc .chip.concept { background: transparent; border: 1px dashed rgba(102, 102, 110, .6); }
.u7 .u7-tc .ac.lab { padding-left: 16px; font-size: 16px; line-height: 24px; color: var(--mute); }

/* define: problem, goals, insight, principles */
.u7 .u7-hmw { margin-top: 24px; max-width: 1200px; font-size: 32px; line-height: 40px; }
.u7 .u7-goals { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; align-items: stretch; }
.u7 .u7-goals .bounce > div { display: flex; flex-direction: column; gap: 8px; padding: 32px; border: 1px solid var(--line); }
.u7 .u7-goals p { font-size: 18px; line-height: 32px; }
.u7 .u7-insight { padding: 32px 40px; background: #FFFFFF; border-left: 4px solid var(--pu); font-size: 24px; font-weight: 700; line-height: 32px; letter-spacing: -0.005em; }
.u7 .u7-princ { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; align-items: stretch; }
.u7 .u7-princ .pc { display: flex; flex-direction: column; gap: 16px; height: 100%; padding: 32px; background: #000D0F; }
.u7 .u7-princ .n { font-size: 16px; font-weight: 500; line-height: 24px; color: #C7A8FF; }
.u7 .u7-princ b { font-size: 24px; font-weight: 700; line-height: 32px; color: #FFFFFF; }
.u7 .u7-princ p { font-size: 18px; line-height: 32px; color: #D1D1D9; }

/* develop: screen panels that stack (GameCove test cards) */
.u7 .u7-sq + .u7-sq { margin-top: 24px; }
.u7 .u7-stack.on .u7-sq + .u7-sq { margin-top: 120px; }
.u7 .u7-panel { display: grid; grid-template-columns: minmax(0, 480fr) minmax(0, 960fr); background: #FFFFFF; border: 1px solid var(--line); }
.u7 .u7-stack.on .u7-sq { position: sticky; top: max(24px, calc(50vh - 344px)); }
.u7 .u7-stack.on .u7-panel { opacity: calc(1 - var(--k, 0)); will-change: opacity; }
.u7 .u7-panel .txt { display: flex; flex-direction: column; align-items: flex-start; gap: 32px; padding: 40px; }
.u7 .u7-panel .lab { font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; text-transform: uppercase; color: var(--pu); }
.u7 .u7-panel .status { padding: 4px 12px; background: #F0EBFC; border-radius: 999px !important; font-size: 16px; font-weight: 500; line-height: 24px;
  letter-spacing: .06em; text-transform: uppercase; color: var(--pu); }
.u7 .u7-panel h3 { font-size: 24px; font-weight: 600; line-height: 32px; color: #0A0D14; }
.u7 .u7-panel .spec { align-self: stretch; }
.u7 .u7-panel .spec > div { display: flex; flex-direction: column; gap: 8px; padding: 16px 0; border-top: 1px solid var(--line); }
.u7 .u7-panel .spec .k { text-transform: uppercase; }
.u7 .u7-panel .spec p { font-size: 16px; line-height: 24px; }
.u7 .u7-panel .scr { padding: 32px; }
.u7 .u7-img.shot { aspect-ratio: 896 / 480; }

/* develop: concept */
.u7 .u7-chead { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
.u7 .u7-badge { display: inline-block; padding: 8px 16px; border: 1px solid var(--pu); font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; color: var(--pu); }
.u7 .u7-badge.clay { border-color: #BC7155; color: #BC7155; }
.u7 .u7-gaps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; align-items: stretch; }
.u7 .u7-gaps .gp { display: flex; flex-direction: column; gap: 16px; height: 100%; padding: 32px; background: #FFFFFF; }
.u7 .u7-gaps p { font-size: 18px; line-height: 28px; }
.u7 .u7-gaps p.s { font-weight: 500; color: var(--pu); }
.u7 .u7-cscreens { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; align-items: start; }
.u7 .u7-cscreens figcaption { margin-top: 16px; }
.u7 .u7-img.cs { background: #FFFFFF; }

/* deliver */
.u7 .u7-log li { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 24px; padding: 16px 0; border-bottom: 1px solid var(--line); font-size: 18px; line-height: 28px; }
.u7 .u7-log .d { font-size: 16px; font-weight: 700; line-height: 28px; color: var(--pu); }
.u7 .u7-dconcept { display: flex; flex-direction: column; gap: 32px; padding: 64px; background: var(--soft); }
.u7 .u7-steps { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr); gap: 16px; align-items: center; }
.u7 .u7-steps .ar { font-size: 24px; line-height: 32px; color: var(--mute); }
.u7 .u7-steps .st { display: flex; flex-direction: column; gap: 8px; height: 164px; box-sizing: border-box; padding: 24px; background: #FFFFFF; }
.u7 .u7-steps .n { font-size: 16px; font-weight: 700; line-height: 24px; color: var(--pu); }
.u7 .u7-steps p { font-size: 18px; line-height: 28px; }

/* test */
.u7 .u7-tasks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; align-items: stretch; }
.u7 .u7-tasks .tk { display: flex; flex-direction: column; gap: 8px; height: 100%; padding: 32px; border: 1px solid var(--line); }
.u7 .u7-tasks .n { font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; color: var(--pu); }
.u7 .u7-tasks p { font-size: 18px; line-height: 28px; }
.u7 .u7-tasks p.res { font-size: 16px; line-height: 24px; color: var(--mute); }

/* reflection */
.u7 .u7-sec.night { background: var(--night); color: #FFFFFF; }
.u7 .night .u7-rt { color: #FFFFFF; }
.u7 .u7-list { display: flex; flex-direction: column; gap: 24px; }
.u7 .u7-list li { display: flex; gap: 24px; font-size: 18px; line-height: 28px; color: #FFFFFF; }
.u7 .u7-list .n { flex: none; font-weight: 500; color: var(--pu); }
.u7 .u7-closing .ph { overflow: hidden; aspect-ratio: 1440 / 640; background: #1A1726; }
.u7 .u7-closing img { display: block; width: 100%; height: 100%; object-fit: cover; transform: scale(1.08); will-change: transform; }
.u7 .u7-closing figcaption { margin-top: 16px; }
.u7 .u7-cap.night { color: #B8B8C2; }

/* takeaways (Nov 20, Figma 2078:1266): 1920 × 706 frame; heading at 120 from the top, the photo (745 × 993) runs off
   the top and the right edge, fading in from the left */
.u7 .u7-take { position: relative; overflow: hidden; min-height: 706px; box-sizing: border-box; padding: 120px 0; background: #0D0A17; color: #FFFFFF; }
.u7 .u7-take-ph { position: absolute; top: -144px; right: -6.04vw; display: block; width: 745px; height: 993px; object-fit: cover; pointer-events: none;
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 32%, #000 100%); mask-image: linear-gradient(90deg, transparent 0, #000 32%, #000 100%); }
.u7 .u7-take-in { position: relative; z-index: 1; max-width: 960px; }
.u7 .u7-take-k { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; line-height: 24px; letter-spacing: .04em; color: #99999E; }
.u7 .u7-take-k i { flex: none; width: 16px; height: 16px; background: #99999E; }
.u7 .u7-take .t { margin-top: 24px; font-size: 56px; font-weight: 700; line-height: 64px; letter-spacing: -0.02em; color: #FFFFFF; }
.u7 .u7-take .d { margin-top: 48px; font-size: 20px; font-weight: 500; line-height: 32px; color: rgba(255, 255, 255, .72); }

/* next case study */
.u7 .u7-next { background: var(--off, #F5F5F2); }
.u7 .u7-next .next-card { display: flex; flex-direction: column; gap: 16px; padding: 140px 0; color: var(--ink); text-decoration: none; }
.u7 .u7-next .next-name { font-size: clamp(56px, 6vw, 112px); font-weight: 300; letter-spacing: -0.04em; line-height: 1; transition: transform .3s ease-out; }
.u7 .u7-next .next-card:hover .next-name { transform: translateX(8px); }

/* square corners everywhere, except the round pills, avatars and dots that set their own */
.u7 *, .u7 *::before, .u7 *::after { border-radius: 0; }

@media (max-width: 1600px) {
  /* keep the text clear of the photo's solid part as the window narrows */
  .u7 .u7-take-in { max-width: min(960px, calc(106vw - 660px)); }
}
@media (max-width: 1280px) {
  .u7 .u7-rt { width: 280px; }
  .u7 .u7-panel { grid-template-columns: minmax(0, 400fr) minmax(0, 800fr); }
  .u7 .u7-panel .txt { padding: 32px; }
  .u7 .u7-panel .scr { padding: 24px; }
  .u7 .u7-hist .steps b { font-size: 32px; line-height: 40px; }
}
@media (max-width: 1023px) {
  .u7 .u7-take { display: flex; flex-direction: column; min-height: 0; padding: 88px 0 0; }
  .u7 .u7-take-in { max-width: none; }
  .u7 .u7-take-ph { position: relative; order: 2; top: auto; right: auto; width: 100%; max-width: 560px; height: auto; aspect-ratio: 745 / 993; margin: 48px 0 0 auto;
    -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 24%); mask-image: linear-gradient(180deg, transparent 0, #000 24%); }
  .u7 .u7-proc { height: auto; margin-top: 48px; }
  .u7 .u7-proc-cards, .u7 .u7-flow { display: none; }
  .u7 .u7-proc-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  .u7 .u7-proc-list .u7-story { padding: 32px; }
  .u7 .u7-proc-list .u7-story h3 { font-size: 28px; line-height: 36px; }
  .u7 .u7-block, .u7 .u7-panel { grid-template-columns: minmax(0, 1fr); gap: 40px; }
  .u7 .u7-panel { gap: 0; }
  .u7 .u7-panel .scr { padding: 0 32px 32px; }
  .u7 .u7-steps { grid-template-columns: minmax(0, 1fr); }
  .u7 .u7-steps .ar { transform: rotate(90deg); justify-self: start; }
  .u7 .u7-steps .st { height: auto; }
  .u7 .u7-row { flex-direction: column; gap: 16px; }
  .u7 .u7-rt { width: auto; }
  .u7 .u7-goals, .u7 .u7-tasks, .u7 .u7-finds, .u7 .u7-princ, .u7 .u7-gaps, .u7 .u7-cscreens { grid-template-columns: minmax(0, 1fr); }
  .u7 .u7-find .lead, .u7 .u7-find .meant p { max-width: none; }
  .u7 .u7-find .tile { aspect-ratio: 16 / 10; }
  .u7 .u7-persona { flex-direction: column; }
  .u7 .u7-scroll { margin-right: calc((100vw - 100%) / -2); padding-right: 16px; }
}
@media (max-width: 700px) {
  .u7 .u7-take .t { font-size: 36px; line-height: 44px; }
  .u7 .u7-take .d { margin-top: 32px; font-size: 18px; line-height: 28px; }
  .u7 .u7-w { width: calc(100vw - 40px); }
  .u7 .u7-hero { padding: 104px 0 88px; }
  .u7 .u7-h1 { font-size: 40px; line-height: 48px; }
  .u7 .u7-btn { width: 100%; }
  .u7 .u7-sec { padding: 88px 0; }
  .u7 .u7-pr { padding: 88px 0; }
  .u7 .mt96, .u7 .mt120 { margin-top: 64px; }
  .u7 .u7-h2 { font-size: 32px; line-height: 40px; }
  .u7 .u7-h3 { font-size: 24px; line-height: 32px; }
  .u7 .u7-hmw { font-size: 24px; line-height: 32px; }
  .u7 .u7-meta, .u7 .u7-stats { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .u7 .u7-proc-list { grid-template-columns: minmax(0, 1fr); }
  .u7 .u7-proc-list .u7-story { padding: 24px; }
  .u7 .u7-dgl .cos { grid-template-columns: minmax(0, 1fr); }
  .u7 .u7-hist { padding: 24px; }
  .u7 .u7-hist .steps { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 24px; }
  .u7 .u7-hist .ln { display: none; }
  .u7 .u7-hist .new { flex-direction: column; align-items: flex-start; gap: 8px; }
  .u7 .u7-find .big { font-size: 40px; line-height: 48px; }
  .u7 .u7-find .tile { aspect-ratio: 4 / 3; }
  .u7 .u7-persona { padding: 24px; gap: 24px; }
  .u7 .u7-persona .ph { width: 160px; height: 160px; }
  .u7 .u7-persona .nw { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .u7 .u7-tc { padding: 24px; }
  .u7 .u7-panel .txt { padding: 24px; }
  .u7 .u7-panel .scr { padding: 0 24px 24px; }
  .u7 .u7-dconcept { padding: 32px 24px; }
  .u7 .u7-gaps .gp, .u7 .u7-princ .pc, .u7 .u7-tasks .tk, .u7 .u7-goals .bounce > div { padding: 24px; }
  .u7 .u7-insight { padding: 24px; font-size: 20px; line-height: 28px; }
  .u7 .u7-list li { gap: 16px; }
  .u7 .u7-closing .ph { aspect-ratio: 4 / 3; }
}
@media (prefers-reduced-motion: reduce) {
  .u7 [data-r], .u7 .u7-dg *, .u7 .u7-hist *, .u7 .u7-mx .mk, .u7 .u7-tc * { transition: none !important; animation: none !important; }
  .u7 [data-r] { opacity: 1 !important; transform: none !important; }
  .u7 .u7-proc .u7-pill, .u7 .u7-proc .u7-chip, .u7 .u7-proc .c3 { animation: none !important; opacity: 1 !important; transform: none !important; }
  .u7 .u7-proc .cn { animation: none !important; stroke-dashoffset: 0 !important; }
}
`
