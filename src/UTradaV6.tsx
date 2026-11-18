import React, { useEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { SideToc, useHeadroom } from './CaseNav'
import { SiteHeaderB } from './SiteHeaderB'
import { CaseFilm, useCaseIntro } from './CaseFilm'

/**
 * UTrada case study (v148, Harbor Nov 18) — built from Harbor's Figma "UTrada_v.6 · Final (Trust Bank level)"
 * (file 44기 김지현 4차 랜딩페이지, node 1890:1214). Copy is the frame's, word for word.
 * Colours (Figma): ink #000D10, grey text #66666E, lines #D5D3D4 / #D6D4D4, accent purple #8A2BE3, soft section
 * #F6F5FA, Reflection night #0D0A17. Type: the site's Roboto on the frame's sizes — 64/72 title, 40/48 section titles,
 * 28/36 sub-titles, 24/32 row titles, 18/28 body, 16/24 labels (6% tracking); nothing under 16px. Square corners.
 * Layout: the frame's 1440 column, sections 160px top and bottom.
 *
 * Motion, the same set as the GameCove page:
 * - opening: the intro film fills the screen, then settles under the headline (CaseFilm.tsx; skipped on phones ≤ 900px)
 * - soft reveal: blocks rise in as they scroll into view, one after another ([data-r], 1.2s)
 * - bounce: card rows (impact, process, findings, principles, goals, moments, gaps, steps, tasks) pop in one by one
 * - Discover's three blocks are one pinned panel (like GameCove's Empathize): scroll and 01 → 02 → 03 open one at a
 *   time on the left while the picture on the right changes; click a title to jump. The diagram builds node by node and
 *   the market table fills row by row when their step opens.
 * - Journey map: columns come in left to right, the feeling dots drop from the neutral line to where they sit (the two
 *   good moments pulse), the risk bars fill in.
 * - Develop: the four screen cards stack — each new card slides over the last one, which fades (GameCove's test cards).
 * - screenshots and the concept screens: hover magnifier (1.8×), as on Trust Bank and GameCove
 * - closing photo: eases from 108% to 100% as it scrolls in
 * Small screens (≤ 1023px, or windows under 760px tall): no pinning or stacking — every block is shown in order.
 * Reduced motion: everything is simply shown.
 * Assets: Harbor-K/harbor-pf assets/utrada/v6/ (exported from the Figma frame at 2x) and the v3 logo and film.
 */

const A3 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/utrada/v3/'
const A6 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/utrada/v6/'
const IMG = {
  logo: A3 + 'logo.png',
  video: A3 + 'intro.mp4',
  poster: A3 + 'intro-poster.jpg',
  session: A6 + 'photo-session.webp',
  research: A6 + 'photo-research.webp',
  crm: A6 + 'crm-signin.webp',
  fxstreet: A6 + 'article-fxstreet.webp',
  cysec: A6 + 'article-cysec.webp',
  regulations: A6 + 'screen-regulations.webp',
  cookie: A6 + 'screen-cookie.webp',
  accounts: A6 + 'screen-accounts.webp',
  help: A6 + 'screen-help.webp',
  conceptA: A6 + 'concept-a.webp',
  conceptB: A6 + 'concept-b.webp',
  closing: A6 + 'photo-closing.webp',
}
const SITE = 'https://utrada.com'
const FILM_LABEL = 'UTrada intro film: a trader at night wonders whether a new broker with no reviews is safe, checks the regulations page, the legal documents, the trading accounts and the help chat, then signs up. Ends on: UTrada, trust before the first deposit.'
const NEXT = { name: 'ETO Markets', href: '#/eto-markets' }
export const U6_CHAPTERS = ['Overview', 'Process', 'Discover', 'Define', 'Journey map', 'Develop', 'Deliver', 'Test', 'Reflection']

const DARK = '#0B0B0D'

/* ---------- helpers (same behaviour as the GameCove page) ---------- */

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const d = (n: number) => ({ '--d': n } as React.CSSProperties)

/** call `fn` on scroll/resize, once per frame */
function useOnScroll(fn: () => void) {
  const f = useRef(fn); f.current = fn
  useEffect(() => {
    let raf = 0
    const run = () => { raf = 0; f.current() }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])
}

/** true once the element has scrolled into view */
function useShownOnce<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (reducedMotion() || !('IntersectionObserver' in window)) { setShown(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } }, { threshold })
    io.observe(el); return () => io.disconnect()
  }, [threshold])
  return [ref, shown] as const
}

/** true on screens big enough for pinned / stacked scenes */
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

/** hover magnifier for images marked data-gzoom (same feel as the Trust Bank and GameCove pages) */
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

function Label({ children }: { children: string }) {
  return <div className="u6-label"><i aria-hidden="true" />{children}</div>
}

/* ---------- content (Figma 1890:1214, word for word) ---------- */

const OVERVIEW = [
  { t: 'Challenge', b: 'In 2024, UTrada rebranded and opened its first Australian office. To new visitors, it was a name they had never heard of — and they had no easy way to check if their money would be safe.' },
  { t: 'Business objective', b: 'Turn first-time visitors into customers who confirm their ID and add money. To do that, people had to trust UTrada before signing up.' },
  { t: 'Solution', b: 'I found the 5 moments when people hesitate. Each one got a screen that answers its question right there.' },
]
const IMPACT = [
  { n: '5', c: 'hesitation moments, one screen each' },
  { n: '4', c: 'fixes I shipped after launch (Notion log)' },
  { n: '16', c: 'months designing and fixing the live site' },
]
const PROCESS = [
  { k: 'DISCOVER', box: '01 · Look closely', items: ['Live-site audit', 'Broker basics', 'Rules by market', 'Other brokers’ pages'] },
  { k: 'DEFINE', box: '02 · One problem + HMW', items: ['5 hesitation moments', 'Business vs trader goals'] },
  { k: 'DEVELOP', box: '03 · 5 screens', items: ['Regulations', 'Cookie consent', 'Broker check', 'Accounts', 'Help & Support'] },
  { k: 'DELIVER', box: '04 · Ship, fix, test', items: ['4 post-launch fixes', 'Concept: which company am I signing with?', '5-user test plan'] },
]
const DISCOVER = [
  { t: 'What a broker is', h: 'You trust it with your money', p: [
    'A broker is a company that lets you trade online. You open an account, add money, and use its app to guess if prices — like gold or the US dollar — will go up or down.',
    'At UTrada you don’t buy the gold itself. You make a deal with the company about its price: if the price moves your way, the company pays you the difference. So you have to trust the company — and regulation is how outsiders check it.',
  ] },
  { t: 'What the company faced', h: 'A new name nobody knew', p: [
    'UTrada had just rebranded. Its new name had no track record people could look up.',
    'It was run by two companies in two countries (Mauritius and St Vincent), and each follows different rules. To sign up, people had to leave the main website and go to a second site.',
  ] },
  { t: 'What the whole industry faces', h: 'It’s hard to tell who to trust', p: [
    'Fake copycat firms copy real company names and licence numbers. In the UK, people reported losing over £78 million to them in 2020 (FCA).',
    'So traders check safety and regulation first when they pick a company (FXStreet study, 2024). And regulators are making sign-up stricter: from July 2025, Cyprus caps deposits at €2,000 until your ID is checked.',
  ] },
]
const MARKETS: [string, string, string, boolean?][] = [
  ['Europe (ESMA)', '30× your money', 'Must show % of accounts that lose money'],
  ['UK (FCA)', '30× your money', '—'],
  ['Australia (ASIC)', '30× your money', '—'],
  ['Mauritius (UTrada)', '500× your money', 'UTrada’s own offer', true],
]
const FINDINGS = [
  { src: 'UK REGULATOR · FCA · JAN 2021', big: '£78M',
    lead: 'lost in the UK in 2020 to fake “clone” firms that copy real company names, addresses and licence numbers.',
    detail: '75% of investors felt sure they could spot a scam, yet 77% didn’t know or weren’t sure what a clone firm was.',
    meant: 'A licence number alone isn’t proof. People need to be able to check it.',
    ref: 'fca.org.uk · press release, 27 Jan 2021' },
  { src: 'STUDY · FXSTREET via FINANCE MAGNATES · JUL 2024', big: 'Licence first',
    lead: 'Traders judge a broker’s reliability by its licensing, withdrawal times and customer support.',
    detail: 'Red flags: poor reviews and regulatory issues. Security is their biggest worry (summary bullets, paragraph 2).',
    meant: 'A new name has no reviews, so licensing and support have to do the work reviews would do.',
    ref: 'financemagnates.com · 2 Jul 2024' },
  { src: 'CYPRUS REGULATOR · CySEC via FINANCE MAGNATES · JUL 2025', big: '€2,000 · 15 days',
    lead: 'Firms can accept up to €2,000 before a client’s ID check is done, from a bank account in the client’s name.',
    detail: 'The check must be finished within 15 days, or the firm ends the relationship and returns the money (paragraph 2).',
    meant: 'Rules on money and ID differ by country, so the sign-up should say which company and which rules apply.',
    ref: 'financemagnates.com · 9 Jul 2025' },
]
const ARTICLES = [
  { img: IMG.fxstreet, cap: 'Finance Magnates · 2 Jul 2024 — traders look at licensing, withdrawals and support first',
    alt: 'Finance Magnates article “These Factors Drive Traders’ Decisions When Choosing Brokers, Study Reveals”, 2 July 2024: traders prioritise licensing, withdrawal times and customer support; red flags include poor reviews and regulatory issues' },
  { img: IMG.cysec, cap: 'Finance Magnates · 9 Jul 2025 — €2,000 before ID check, 15 days to verify',
    alt: 'Finance Magnates article “CySEC Lowers Deposit Limit Before ID Check: Will It Impact CFD Brokers’ Client Onboarding?”, 9 July 2025: firms must verify clients within 15 days or end the relationship' },
]
const COMPARE: [string, string, string][] = [
  ['Companies listed', '5 companies, each with its regulator named (UK, EU, Seychelles, South Africa), plus a Dubai office', '1 company named (UTrada Global Limited). A second company, UT Solutions LLC, appears only in Legal documents'],
  ['Licence numbers', 'Shown for each company (e.g. FCA 717270, CySEC 278/15)', 'Shown for FSC Mauritius (GB24204031). Not shown for Labuan FSA'],
  ['Link to regulator’s register', 'Yes for FCA, CySEC and FSA Seychelles', 'No links'],
  ['Protection by company', 'Says protection depends on which company holds your account (e.g. FSCS in the UK, ICF in the EU)', 'Not mentioned'],
]
const PRINCIPLES = [
  { t: 'Make the licence checkable', b: 'Show the regulator, the licensed company and the number together — and let people compare it with the regulator’s own register.' },
  { t: 'Say which company you sign with', b: 'If more than one company runs the brand, say which one your account is with and what protection comes with it.' },
  { t: 'Show help before money', b: 'Make support easy to find before the first deposit, when people are most nervous.' },
]
const MOMENTS = [
  { k: 'LOOKING AROUND', q: '“Who runs this?”' },
  { k: 'PRIVACY', q: '“What happens to my data?”' },
  { k: 'CHECKING', q: '“Is it really licensed?”' },
  { k: 'SIGNING UP', q: '“Which account is right for me?”' },
  { k: 'GETTING HELP', q: '“Who helps if something goes wrong?”' },
]

/* journey map */
const STAGES = ['First visit', 'Checking', 'Sign up', 'Verify ID', 'First deposit', 'Trade']
const DOING = [
  'Lands on utrada.com from an ad or search and scans the home page.',
  'Looks for who runs the company and whether it holds a licence.',
  'Compares accounts, then fills in a form on a second site (crm.utrada.com).',
  'Uploads an ID and proof of address.',
  'Adds money for the first time.',
  'Trades on MT4, MT5 or the UT App, and asks for help if stuck.',
]
const ASKING = [
  '“Never heard of them. Is this real?”',
  '“Who runs this — and is it really licensed?”',
  '“Which account is right for me? Why a different website?”',
  '“Why do they need all this? How long will it take?”',
  '“If I send money now, can I get it back?”',
  '“Someone will answer if something goes wrong.”',
]
// dot centre in the 224px feeling row (the neutral line sits at 104); good = filled dot, label above
const FEEL: { w: string; y: number; good?: boolean }[] = [
  { w: 'unsure', y: 138 }, { w: 'worried', y: 172 }, { w: 'hopeful', y: 104, good: true },
  { w: 'annoyed', y: 138 }, { w: 'anxious', y: 172 }, { w: 'relieved', y: 70, good: true },
]
const RISK: [string, number][] = [['High', 3], ['High', 3], ['Medium', 2], ['Medium', 2], ['Highest', 4], ['Low', 1]]
const SCREEN_CHIPS: { t: string; concept?: boolean }[][] = [
  [{ t: '02 Cookie consent' }],
  [{ t: '01 Regulations' }, { t: '03 Broker check' }],
  [{ t: '04 Account comparison' }, { t: 'Login / Register' }],
  [{ t: 'Concept: which company am I signing with? (not built)', concept: true }],
  [{ t: '05 Help & Support' }],
  [{ t: '05 Help & Support' }],
]
const EVIDENCE = [
  'FCA: copycat firms copy real names and licence numbers',
  'FXStreet: traders look at licensing first',
  '—',
  'CySEC (Cyprus): €2,000 cap before ID check, 15 days to verify',
  'FXStreet: withdrawal times and support build trust',
  '—',
]

/* develop */
const SCREENS: { t: string; img: string; alt: string; why: string; decided: string; k3: string; v3: string }[] = [
  { t: '① Regulations page', img: IMG.regulations,
    alt: 'UTrada Regulations page: Financial Services Commission, Mauritius, with the FSC logo, what the FSC regulates and UTrada Global Limited’s licence number GB24204031; below it the Labuan Financial Services Authority',
    why: 'A name people don’t know yet has little to look up, so its licence is the strongest proof a visitor can check. Copycat firms reuse real licence numbers, so the real one has to be easy to find and compare.',
    decided: 'One section per regulator: its name and logo, what it supervises, then one plain sentence naming the licensed company and its licence number.',
    k3: 'LIVE TODAY', v3: '“UTrada Global Limited is licensed and regulated by the Financial Services Commission of Mauritius under License No. GB24204031.”' },
  { t: '② Cookie consent', img: IMG.cookie,
    alt: 'UTrada cookie window “We respect your privacy” over the dimmed page, with Reject All and Accept All side by side',
    why: 'People worry about being tracked.',
    decided: '“Reject all” is as easy to click as “Accept all”, so nobody feels tricked.',
    k3: 'AFTER LAUNCH', v3: 'Fixed in November 2024, one month after launch.' },
  { t: '④ Account comparison', img: IMG.accounts,
    alt: 'UTrada trading accounts side by side: Ultra from 0.0 pips, Premium from 1.2 pips and Standard from 1.8 pips, each with the same rows — commission, minimum deposit, lot size, leverage, execution type, fees, stop-out level and server location',
    why: 'Spread, commission and minimum deposit are hard to compare in your head — and first-time traders don’t know which one matters.',
    decided: 'Three cards side by side, with the same rows in the same order. The price comes first (“From 0.0 pips”), and each card has its own Join Now.',
    k3: 'AFTER LAUNCH', v3: 'Reworked in March 2025.' },
  { t: '⑤ Help & Support', img: IMG.help,
    alt: 'UTrada help chat, rebuilt from the live site: “We’re away at the moment. Leave a message, and we’ll reply by email.” above a form — “Let’s chat! Fill in a few details to get started.” with Name and E-mail fields and a Start the chat button',
    why: 'Before the first deposit, people want to know a real person will answer if something goes wrong.',
    decided: 'Help is reachable from every page. When nobody is online, the chat asks for a name and email instead of leaving a dead end.',
    k3: 'AFTER LAUNCH', v3: 'Fixed in November 2024. A contact button was added in October 2025.' },
]
const GAPS = [
  { p: 'No link to the regulator’s own register.', s: '→ A “Check on the FSC register” button on each company card.' },
  { p: 'Two companies, but no way to tell which one holds your account.', s: '→ Pick your country → see your company, regulator and contract.' },
  { p: 'Nothing says what to check before adding money.', s: '→ Three steps to check it yourself, and a chat before you pay.' },
]
const CONCEPTS = [
  { img: IMG.conceptA, w: 708, h: 1001, cap: 'A · Regulations page — who you trade with',
    alt: 'Concept A, UTrada Regulations page “Who you trade with”: a country selector (showing Malaysia), the company your account would be with — UTrada Global Limited, Financial Services Commission Mauritius, licence GB24204031, your contract, and a Check on the FSC register button — beside UT Solutions LLC with its regulator and licence marked “To confirm with compliance”; below, Check it yourself in 3 steps and a dark strip “Not sure? Talk to us before you add money.” with Start a chat' },
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

/* ---------- Discover: the three blocks as one pinned scene ---------- */

/** Trader → UTrada → Market, with the regulator watching; builds node by node when `on` */
function Diagram({ on }: { on: boolean }) {
  return (
    <div className={'u6-dg' + (on ? ' on' : '')} role="img" aria-label="Diagram: a regulator gives UTrada a licence and keeps watching it. The trader adds money and places trades with UTrada, which holds the money and runs the app; prices come from the market (banks). You trust the company with your money — regulation is how you check it.">
      <div className="node em reg" style={d(0)}><b>Regulator</b><span>gives a licence, keeps watching</span></div>
      <div className="watch" style={d(1)}>↓ watches</div>
      <div className="flow">
        <div className="node" style={d(2)}><b>Trader</b><span>adds money,<br />places trades</span></div>
        <span className="ar" style={d(3)}>→</span>
        <div className="node em" style={d(4)}><b>UTrada</b><span>holds the money,<br />runs the app</span></div>
        <span className="ar" style={d(5)}>→</span>
        <div className="node" style={d(6)}><b>Market</b><span>prices from<br />banks</span></div>
      </div>
      <p className="cap" style={d(7)}>You trust the company with your money — regulation is how you check it.</p>
    </div>
  )
}

function MarketTable({ on }: { on: boolean }) {
  return (
    <div className={'u6-mt' + (on ? ' on' : '')}>
      <div className="u6-scroll">
        <table>
          <thead><tr><th>Market</th><th>Max trading power</th><th>Note</th></tr></thead>
          <tbody>
            {MARKETS.map(([m, p, n, hi], i) => <tr key={m} style={d(i + 1)} className={hi ? 'hi' : ''}><td>{m}</td><td className="b">{p}</td><td>{n}</td></tr>)}
          </tbody>
        </table>
      </div>
      <p className="u6-src">Sources: UK FCA (2021) · FXStreet via Finance Magnates (2024) · CySEC via Finance Magnates (2025) · ESMA (2018) · utrada.com</p>
    </div>
  )
}

function DiscoverVisual({ i, on }: { i: number; on: boolean }) {
  if (i === 0) return <Diagram on={on} />
  if (i === 1) return (
    <figure className="u6-img crm">
      <img src={IMG.crm} data-gzoom="true" loading="lazy" alt="UTrada CRM sign-in page, a separate site: “Welcome to UTrada CRM” with Sign In and Start Trading tabs, email and password fields, beside the line “Your Trading Journey Starts with UTrada”" />
    </figure>
  )
  return <MarketTable on={on} />
}

/** narrow screens: the block as in the frame — text, then its picture (which plays when it scrolls in) */
function DiscoverBlock({ i }: { i: number }) {
  const [ref, shown] = useShownOnce<HTMLDivElement>(0.35)
  const b = DISCOVER[i]
  return (
    <div className="u6-block" data-r>
      <div className="u6-text">
        <h2 className="u6-h2">{b.t}<br />{b.h}</h2>
        {b.p.map(p => <p key={p} className="u6-body">{p}</p>)}
      </div>
      <div ref={ref}><DiscoverVisual i={i} on={shown} /></div>
    </div>
  )
}

function DiscoverScroll() {
  const outer = useRef<HTMLDivElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [inView, setInView] = useState(false)
  const N = DISCOVER.length
  useOnScroll(() => {
    const el = outer.current, p = pin.current; if (!el || !p) return
    const top = parseFloat(getComputedStyle(p).top) || 0
    const travel = el.offsetHeight - p.offsetHeight
    if (travel <= 0) return
    const r = el.getBoundingClientRect()
    const near = r.top < innerHeight * 0.75 && r.bottom > innerHeight * 0.25
    setInView(v => (v === near ? v : near || v))
    const f = clamp((top - r.top) / travel)
    const s = Math.min(N - 1, Math.floor(f * N))
    setStep(v => (v === s ? v : s))
  })
  const jump = (i: number) => {
    const el = outer.current, p = pin.current; if (!el || !p) return
    const top = parseFloat(getComputedStyle(p).top) || 0
    const travel = el.offsetHeight - p.offsetHeight
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - top + travel * ((i + 0.5) / N), behavior: reducedMotion() ? 'auto' : 'smooth' })
  }
  return (
    <div ref={outer} className="u6-dsc-outer" style={{ height: `calc(640px + ${N * 70}vh)` }}>
      <div ref={pin} className="u6-dsc-pin">
        <div className="u6-dsc-list">
          {DISCOVER.map((b, i) => (
            <div key={b.t} className={'u6-dsc-item' + (i === step ? ' on' : '')}>
              <button type="button" className="u6-dsc-head" onClick={() => jump(i)} aria-expanded={i === step}>
                <span className="n">0{i + 1}</span><span className="t">{b.t}</span>
              </button>
              <div className="u6-dsc-body"><div>
                <h3 className="u6-dsc-h">{b.h}</h3>
                {b.p.map(p => <p key={p} className="u6-body">{p}</p>)}
              </div></div>
            </div>
          ))}
        </div>
        <div className="u6-dsc-panel">
          {DISCOVER.map((_, i) => (
            <div key={i} className={'u6-dsc-layer' + (i === step ? ' on' : '')} aria-hidden={i !== step}>
              <DiscoverVisual i={i} on={inView && i === step} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- Journey map ---------- */

function JourneyMap() {
  const [ref, shown] = useShownOnce<HTMLDivElement>(0.25)
  const col = (i: number) => ({ '--c': i } as React.CSSProperties)
  return (
    <div className="u6-scroll u6-jm-scroll">
      <div ref={ref} className={'u6-jm' + (shown ? ' on' : '')} role="table" aria-label="Journey map: where a first-time trader slows down">
        <div className="row" role="row">
          <div className="lab" role="rowheader">STAGE</div>
          {STAGES.map((s, i) => <div key={s} className="cell" role="cell" style={col(i)}><span className="num">{i + 1}</span><b className="stage">{s}</b></div>)}
        </div>
        <div className="row" role="row">
          <div className="lab" role="rowheader">WHAT THEY DO</div>
          {DOING.map((s, i) => <div key={s} className="cell" role="cell" style={col(i)}><p>{s}</p></div>)}
        </div>
        <div className="row" role="row">
          <div className="lab" role="rowheader">WHAT THEY ASK</div>
          {ASKING.map((s, i) => <div key={s} className="cell" role="cell" style={col(i)}><p className="ask">{s}</p></div>)}
        </div>
        <div className="row feel" role="row">
          <div className="lab" role="rowheader">HOW THEY FEEL<br />(assumed)</div>
          <div className="feel-cell" role="cell" aria-label={'Feelings, in order: ' + FEEL.map(f => f.w).join(', ')}>
            <i className="line" aria-hidden="true" />
            {FEEL.map((f, i) => (
              <div key={f.w} className={'pt' + (f.good ? ' good' : '')} aria-hidden="true"
                style={{ left: `${((i + 0.5) / 6) * 100}%`, '--y': `${f.y - 104}px`, '--c': i } as React.CSSProperties}>
                <span className="dot" />
                <span className="w">{f.w}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="row" role="row">
          <div className="lab" role="rowheader">RISK OF LEAVING</div>
          {RISK.map(([w, n], i) => (
            <div key={i} className="cell" role="cell" style={col(i)}>
              <b className="risk">{w}</b>
              <span className="bars" aria-hidden="true">{[0, 1, 2, 3].map(k => <i key={k} className={k < n ? 'f' : ''} style={{ '--k': k } as React.CSSProperties} />)}</span>
            </div>
          ))}
        </div>
        <div className="row" role="row">
          <div className="lab" role="rowheader">SCREEN THAT ANSWERS</div>
          {SCREEN_CHIPS.map((cs, i) => (
            <div key={i} className="cell chips" role="cell" style={col(i)}>
              {cs.map(c => <span key={c.t} className={'chip' + (c.concept ? ' concept' : '')}>{c.t}</span>)}
            </div>
          ))}
        </div>
        <div className="row" role="row">
          <div className="lab" role="rowheader">WHERE THIS COMES FROM</div>
          {EVIDENCE.map((s, i) => <div key={i} className="cell" role="cell" style={col(i)}><p className="ev">{s}</p></div>)}
        </div>
      </div>
    </div>
  )
}

/* ---------- Develop: screen cards that stack ---------- */

function useStack(on: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const cards = Array.from(el.querySelectorAll<HTMLElement>('.u6-sq'))
    if (!on) { cards.forEach(c => c.style.removeProperty('--k')); return }
    let raf = 0
    const run = () => {
      raf = 0
      cards.forEach((c, i) => {
        const nx = cards[i + 1]
        if (!nx) { c.style.setProperty('--k', '0'); return }
        const a = c.getBoundingClientRect(), b = nx.getBoundingClientRect()
        const k = clamp(1 - (b.top - a.top) / (a.height + 80)) // 0 = next card still below, 1 = next card on top
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

function ScreenCards({ wide }: { wide: boolean }) {
  const ref = useStack(wide)
  return (
    <div ref={ref} className={'u6-stack' + (wide ? ' on' : '')}>
      {SCREENS.map((s, i) => (
        <div key={s.t} className="u6-sq" data-r>
          <div className={'u6-sc' + (i % 2 ? ' flip' : '')}>
            <figure className="u6-img shot"><img src={s.img} alt={s.alt} data-gzoom="true" loading="lazy" /></figure>
            <div className="u6-why">
              <h3>{s.t}</h3>
              <div><div className="k">WHY</div><p>{s.why}</p></div>
              <div><div className="k">WHAT I DECIDED</div><p>{s.decided}</p></div>
              <div><div className="k">{s.k3}</div><p>{s.v3}</p></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- closing photo: eases from 108% to 100% as it scrolls in ---------- */

function ClosingPhoto() {
  const fig = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)
  useOnScroll(() => {
    const f = fig.current, m = img.current; if (!f || !m || reducedMotion()) return
    const r = f.getBoundingClientRect()
    const p = clamp((innerHeight - r.top) / (innerHeight + r.height * 0.5))
    m.style.transform = `scale(${(1.08 - 0.08 * p).toFixed(4)})`
  })
  return (
    <figure className="u6-closing" data-r>
      <div className="ph" ref={fig}><img ref={img} src={IMG.closing} loading="lazy" alt="Harbor in a design session, listening, a laptop with app screens open beside her" /></div>
      <figcaption className="u6-cap night">Designing clearly from what I observe.</figcaption>
    </figure>
  )
}

/* ---------- page ---------- */

export function UTradaV6() {
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

  // soft block reveal: blocks already on screen come in right away, the rest as they scroll in (GameCove)
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
    <div className={'hb ut u6' + (intro ? ' intro-on' : '')} ref={root}>
      <style>{CSS + U6_CSS}</style>
      <SiteHeaderB mode="light" hidden={intro} away={away} />
      <SideToc chapters={U6_CHAPTERS} scope=".u6" hidden={intro} />

      <main id="top">
        {/* Hero */}
        <section className="u6-hero" data-chapter="UTrada" aria-label="UTrada">
          <div className="u6-w">
            <img className="u6-logo" src={IMG.logo} alt="UTrada" width={160} height={38} />
            <p className="u6-kicker">UTrada and regulation</p>
            <h1 className="u6-h1">Trust, before the first deposit</h1>
            <p className="u6-sub">How I redesigned UTrada’s website so first-time visitors could check it was safe before adding money.</p>
            <a className="u6-btn" href={SITE} target="_blank" rel="noreferrer">View Website<span className="sr-only"> (opens in a new tab)</span></a>
            <div className="u6-slot" ref={slot}>
              <div className="u6-box" ref={box}><CaseFilm src={IMG.video} poster={IMG.poster} label={FILM_LABEL} quiet={intro} introRef={media} /></div>
            </div>
            <div className="u6-meta">
              <div data-r style={d(0)}><div className="k">TIMELINE</div><p>Jul 2024 – Oct 2025</p></div>
              <div data-r style={d(1)}><div className="k">ROLE</div><p>Product Designer<br />Structure, flows and page layout</p></div>
              <div data-r style={d(2)}><div className="k">INDUSTRY</div><p>Fintech · Online trading · Web</p></div>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="u6-sec soft" data-chapter="Overview">
          <div className="u6-w">
            <Label>OVERVIEW</Label>
            <div className="u6-rows mt64">
              {OVERVIEW.map((r, i) => (
                <div className="u6-row" key={r.t} data-r style={d(i)}><h2 className="u6-rt">{r.t}</h2><p className="u6-body">{r.b}</p></div>
              ))}
              <div className="u6-row" data-r>
                <h2 className="u6-rt">Impact</h2>
                <Bounce className="u6-stats">
                  {IMPACT.map(s => <div key={s.c}><div className="n">{s.n}</div><p>{s.c}</p></div>)}
                </Bounce>
              </div>
            </div>
            <figure className="u6-photos mt64" data-r>
              <div className="pics">
                <div className="u6-img p1"><img src={IMG.session} loading="lazy" alt="Harbor presenting in a design session, a screen with the work behind her" /></div>
                <div className="u6-img p2"><img src={IMG.research} loading="lazy" alt="Harbor at a research session, a laptop with app screens in front of her and an affinity board of sticky notes behind" /></div>
              </div>
              <figcaption className="u6-cap">How I work · design and research sessions</figcaption>
            </figure>
          </div>
        </section>

        {/* Process */}
        <section className="u6-sec" data-chapter="Process">
          <div className="u6-w">
            <Label>PROCESS</Label>
            <h2 className="u6-h2 mt48" data-r>From problem to solution</h2>
            <div className="u6-proc-card mt48">
              <Bounce className="u6-proc" step={0.15}>
                {PROCESS.flatMap((p, i) => [
                  ...(i > 0 ? [<span key={'a' + i} className="u6-arrow" aria-hidden="true">→</span>] : []),
                  <div key={p.k} className="u6-pcol">
                    <div className="k">{p.k}</div>
                    <div className="box">{p.box}</div>
                    <ul>{p.items.map(x => <li key={x}>· {x}</li>)}</ul>
                  </div>,
                ])}
              </Bounce>
            </div>
          </div>
        </section>

        {/* Discover */}
        <section className="u6-sec soft" data-chapter="Discover">
          <div className="u6-w">
            <Label>DISCOVER</Label>
            {wide
              ? <div className="mt96"><DiscoverScroll /></div>
              : <div className="u6-blocks mt96">{DISCOVER.map((_, i) => <DiscoverBlock key={i} i={i} />)}</div>}

            <div className="u6-head mt96" data-r>
              <h3 className="u6-h3">Market research · What the market told me</h3>
              <p className="u6-body mute">Before designing, I read what regulators warn about, what traders say they check, and how other brokers show who regulates them.</p>
            </div>

            <div className="mt96">
              <h3 className="u6-h3" data-r>3 findings from public research</h3>
              <Bounce className="u6-finds mt32">
                {FINDINGS.map(f => (
                  <article key={f.big} className="u6-find">
                    <div className="k">{f.src}</div>
                    <div className="big">{f.big}</div>
                    <p className="lead">{f.lead}</p>
                    <p className="det">{f.detail}</p>
                    <div className="meant"><div className="k em">WHAT IT MEANT FOR UTRADA</div><p>{f.meant}</p></div>
                    <p className="ref">{f.ref}</p>
                  </article>
                ))}
              </Bounce>
              <div className="u6-articles mt32">
                {ARTICLES.map((a, i) => (
                  <figure key={a.cap} data-r style={d(i)}>
                    <div className="u6-img art"><img src={a.img} alt={a.alt} data-gzoom="true" loading="lazy" /></div>
                    <figcaption className="u6-cap">{a.cap}</figcaption>
                  </figure>
                ))}
              </div>
            </div>

            <div className="mt96">
              <div className="u6-head" data-r>
                <h3 className="u6-h3">How another broker shows who regulates it</h3>
                <p className="u6-body mute">Tickmill’s “Licences and regulation” page compared with UTrada’s Regulations page (both checked Nov 2026).</p>
              </div>
              <div className="u6-scroll mt32">
                <div className="u6-cmp" role="table" aria-label="Tickmill compared with UTrada">
                  <div className="tr th" role="row" data-r><span role="columnheader" /><span role="columnheader">Tickmill</span><span role="columnheader">UTrada</span></div>
                  {COMPARE.map(([k, a, b], i) => (
                    <div className="tr" role="row" key={k} data-r style={d(i + 1)}><span className="lab" role="rowheader">{k}</span><span role="cell">{a}</span><span role="cell" className="ut">{b}</span></div>
                  ))}
                </div>
              </div>
              <p className="u6-src mt16" data-r>Sources: tickmill.com/about/licences-and-regulation · utrada.com/en/company/regulations · utrada.com/en/company/legal-documents</p>
            </div>

            <div className="u6-insight mt96" data-r>Insight — What builds trust has to change with where you live and which company you sign with.</div>

            <div className="mt96">
              <h3 className="u6-h3" data-r>What this means for the design</h3>
              <Bounce className="u6-princ mt32">
                {PRINCIPLES.map((p, i) => <div key={p.t} className="pc"><div className="n">0{i + 1}</div><b>{p.t}</b><p>{p.b}</p></div>)}
              </Bounce>
            </div>
          </div>
        </section>

        {/* Define */}
        <section className="u6-sec soft" data-chapter="Define">
          <div className="u6-w">
            <Label>DEFINE</Label>
            <div className="mt96" data-r>
              <h2 className="u6-h2">One problem</h2>
              <p className="u6-hmw">How might we help a first-time visitor check that UTrada is safe, right at the moment they feel unsure — without making sign-up slower?</p>
            </div>
            <Bounce className="u6-goals mt96">
              <div><div className="k">FOR THE BUSINESS</div><p>More visitors become customers who confirm their ID and add money.</p></div>
              <div><div className="k">FOR THE TRADER</div><p>They can check the facts for themselves before handing over money.</p></div>
            </Bounce>
            <div className="mt96">
              <h2 className="u6-h2" data-r>5 moments when people hesitate</h2>
              <Bounce className="u6-moments mt32" step={0.12}>
                {MOMENTS.map((m, i) => <div key={m.k} className="mo"><span className="n">0{i + 1}</span><span className="k">{m.k}</span><b>{m.q}</b></div>)}
              </Bounce>
            </div>
          </div>
        </section>

        {/* Journey map */}
        <section className="u6-sec" data-chapter="Journey map">
          <div className="u6-w">
            <Label>JOURNEY MAP</Label>
            <div className="u6-head mt64" data-r>
              <h2 className="u6-h2">Where a first-time trader slows down</h2>
              <p className="u6-body mute">From the first visit to the first trade. Built from the live site and public research — not from interviews. The 5-person test will check it.</p>
            </div>
            <div className="mt64"><JourneyMap /></div>
            <p className="u6-src mt64" data-r>Sources: UK FCA (2021) · FXStreet via Finance Magnates (2024) · CySEC via Finance Magnates (2025) · utrada.com (checked Nov 2026). Feelings are my assumptions, to be checked in the test.</p>
          </div>
        </section>

        {/* Develop */}
        <section className="u6-sec soft" data-chapter="Develop">
          <div className="u6-w">
            <Label>DEVELOP</Label>
            <div className="u6-head mt120" data-r>
              <h2 className="u6-h2">One screen per moment</h2>
              <p className="u6-body w760">Each screen answers one worry. For each, I show why, what I decided, and what changed after launch.</p>
            </div>
            <div className="mt120"><ScreenCards wide={wide} /></div>

            <div className="u6-concept mt120">
              <div className="u6-chead" data-r>
                <span className="u6-badge">CONCEPT · NOT BUILT</span>
                <h2 className="u6-h2">What I’d design next: show who you trade with</h2>
                <p className="u6-body mute w760">Comparing UTrada with Tickmill showed three gaps. This concept fills them, in UTrada’s own brand style.</p>
              </div>
              <Bounce className="u6-gaps mt48">
                {GAPS.map((g, i) => <div key={g.p} className="gp"><div className="k">GAP 0{i + 1}</div><p>{g.p}</p><p className="s">{g.s}</p></div>)}
              </Bounce>
              <div className="u6-cscreens mt48">
                {CONCEPTS.map((c, i) => (
                  <figure key={c.cap} data-r style={d(i)}>
                    <div className="u6-img cs" style={{ aspectRatio: `${c.w} / ${c.h}` }}><img src={c.img} alt={c.alt} data-gzoom="true" loading="lazy" /></div>
                    <figcaption className="u6-cap md">{c.cap}</figcaption>
                  </figure>
                ))}
              </div>
              <p className="u6-src mt48" data-r>Facts from utrada.com: UTrada Global Limited, FSC Mauritius, Licence No. GB24204031. UT Solutions LLC’s regulator and licence aren’t shown on the site, so they’re marked “to confirm”. The country shown is an example.</p>
            </div>
          </div>
        </section>

        {/* Deliver */}
        <section className="u6-sec" data-chapter="Deliver">
          <div className="u6-w">
            <Label>DELIVER</Label>
            <div className="u6-block mt96">
              <div className="u6-text" data-r>
                <h2 className="u6-h2">After launch<br />I kept fixing what didn’t match</h2>
                <p className="u6-body">I kept improving the site after it went live, from July 2024 to October 2025 — for example the account page (March 2025) and the legal documents (October 2025).</p>
              </div>
              <ol className="u6-log" aria-label="What I shipped after launch (Notion log)">
                {LOG.map(([dt, t], i) => <li key={dt} data-r style={d(i)}><span className="d">{dt}</span><span>{t}</span></li>)}
              </ol>
            </div>
            <div className="u6-dconcept mt96">
              <div className="u6-chead" data-r>
                <span className="u6-badge">CONCEPT · NOT BUILT</span>
                <h2 className="u6-h2">If UTrada got a Cyprus licence</h2>
                <p className="u6-body">How sign-up concept B would change under CySEC’s 2025 rules for EU clients.</p>
              </div>
              <Bounce className="u6-steps" step={0.15}>
                {STEPS.flatMap((s, i) => [
                  ...(i > 0 ? [<span key={'a' + i} className="ar" aria-hidden="true">→</span>] : []),
                  <div key={s} className="st"><span className="n">{i + 1}</span><p>{s}</p></div>,
                ])}
              </Bounce>
              <p className="u6-src" data-r>Why: Cyprus’s financial regulator (CySEC) added these limits in July 2025. UTrada doesn’t have a Cyprus licence, so this shows how the flow would work if it did.</p>
            </div>
          </div>
        </section>

        {/* Test */}
        <section className="u6-sec soft" data-chapter="Test">
          <div className="u6-w">
            <Label>TEST</Label>
            <div className="u6-head mt96" data-r>
              <h2 className="u6-h2">How I’ll test it<br />5 people, 3 tasks</h2>
              <p className="u6-body w760">On the live website first, then on concepts A and B. I’ll note who finished each task, how sure they felt (1 to 5), and what they said out loud.</p>
            </div>
            <Bounce className="u6-tasks mt96">
              {TASKS.map((t, i) => <div key={t} className="tk"><div className="n">TASK {i + 1}</div><p>{t}</p><p className="res">Not run yet — planned on the live site.</p></div>)}
            </Bounce>
          </div>
        </section>

        {/* Reflection */}
        <section className="u6-sec night" data-chapter="Reflection">
          <div className="u6-w">
            <Label>REFLECTION</Label>
            <div className="u6-row mt64" data-r>
              <h2 className="u6-rt">Takeaways</h2>
              <ol className="u6-list">
                <li><span className="n">01</span><span>What I couldn’t measure: I didn’t have sign-up data, so I can’t say how many more people signed up.</span></li>
                <li><span className="n">02</span><span>Biggest lesson: trust isn’t one badge in the footer — it’s a clear answer at each moment someone hesitates.</span></li>
              </ol>
            </div>
            <div className="u6-row mt64" data-r>
              <h2 className="u6-rt">Next steps</h2>
              <ol className="u6-list">
                <li><span className="n">01</span><span>Run the same 5-person test on the live site and on concepts A and B, and compare the results.</span></li>
                <li><span className="n">02</span><span>Track how many people go from sign-up → ID check → first deposit.</span></li>
              </ol>
            </div>
            <div className="mt64"><ClosingPhoto /></div>
          </div>
        </section>

        <section className="u6-next" id="next">
          <a className="u6-w next-card" href={NEXT.href}>
            <span className="eyebrow">Next case study</span>
            <span className="next-name">{NEXT.name} <span className="go">→</span></span>
          </a>
        </section>
      </main>
    </div>
  )
}

const U6_CSS = `
.u6 { --ink: #000D10; --mute: #66666E; --line: #D5D3D4; --line2: #D6D4D4; --pu: #8A2BE3; --pu-rgb: 138, 43, 227; --soft: #F6F5FA;
  --night: #0D0A17; --ease: cubic-bezier(.22,1,.36,1);
  background: #FFFFFF; color: var(--ink); }
.u6 .u6-w { width: min(1440px, calc(100vw - 64px)); margin: 0 auto; }
.u6 h1, .u6 h2, .u6 h3, .u6 p, .u6 figure, .u6 ol, .u6 ul, .u6 table { margin: 0; padding: 0; }
.u6 ol, .u6 ul { list-style: none; }
.u6 .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.u6 .mt16 { margin-top: 16px; } .u6 .mt32 { margin-top: 32px; } .u6 .mt48 { margin-top: 48px; } .u6 .mt64 { margin-top: 64px; }
.u6 .mt96 { margin-top: 96px; } .u6 .mt120 { margin-top: 120px; } .u6 .w760 { max-width: 760px; }

/* soft reveal (GameCove) */
.u6 [data-r] { opacity: 0; transform: translate3d(0, 28px, 0); transition: opacity 1.2s var(--ease), transform 1.2s var(--ease); transition-delay: calc(var(--d, 0) * 120ms); }
.u6 [data-r].r-in { opacity: 1; transform: none; }
.u6 .bounce { display: flex; }
.u6 .bounce > * { flex: 1; min-width: 0; }

/* type */
.u6 .u6-label { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; color: var(--mute); }
.u6 .u6-label i { flex: none; width: 12px; height: 12px; background: var(--pu); }
.u6 .u6-h2 { font-size: 40px; font-weight: 700; line-height: 48px; letter-spacing: -0.015em; color: var(--ink); }
.u6 .u6-h3 { font-size: 28px; font-weight: 700; line-height: 36px; letter-spacing: -0.01em; color: var(--ink); }
.u6 .u6-rt { flex: none; width: 370px; font-size: 24px; font-weight: 700; line-height: 32px; letter-spacing: -0.005em; color: var(--ink); }
.u6 .u6-body { font-size: 18px; line-height: 28px; color: var(--ink); }
.u6 .u6-body.mute { color: var(--mute); }
.u6 .u6-src, .u6 .u6-cap { font-size: 16px; line-height: 24px; color: var(--mute); }
.u6 .u6-cap.md { font-weight: 500; }
.u6 .k { font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; color: var(--mute); }
.u6 .u6-head { display: flex; flex-direction: column; gap: 24px; max-width: 900px; }

/* hero */
.u6 .u6-hero { padding: 120px 0 160px; }
.u6 .u6-logo { display: block; width: 160px; height: auto; }
.u6 .u6-kicker { margin-top: 40px; font-size: 24px; font-weight: 700; line-height: 32px; letter-spacing: -0.005em; }
.u6 .u6-h1 { margin-top: 40px; max-width: 960px; font-size: 64px; font-weight: 700; line-height: 72px; letter-spacing: -0.02em; }
.u6 .u6-sub { margin-top: 40px; max-width: 881px; font-size: 18px; line-height: 28px; }
.u6 .u6-btn { display: inline-flex; align-items: center; justify-content: center; min-width: 200px; height: 56px; margin-top: 40px; padding: 0 32px;
  background: #000D0F; color: #FFFFFF !important; font-size: 16px; font-weight: 500; line-height: 24px; text-decoration: none;
  transition: background-color .3s, transform .35s var(--ease); }
.u6 .u6-btn:hover { background: #2A2A33; transform: translateY(-2px); }
.u6 .u6-btn:focus-visible { outline: 2px solid var(--pu); outline-offset: 3px; }
.u6 .u6-slot { position: relative; margin-top: 40px; aspect-ratio: 16 / 9; }
.u6 .u6-box { position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 40; overflow: hidden; background: ${DARK}; }
.u6 .u6-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 48px; margin-top: 40px; }
.u6 .u6-meta p { margin-top: 8px; font-size: 18px; line-height: 28px; }

/* sections */
.u6 .u6-sec { padding: 160px 0; }
.u6 .u6-sec.soft { background: var(--soft); }
.u6 .u6-rows { display: flex; flex-direction: column; gap: 64px; }
.u6 .u6-row { display: flex; align-items: flex-start; }
.u6 .u6-row > .u6-body, .u6 .u6-row > .u6-stats, .u6 .u6-row > .u6-list { flex: 1; min-width: 0; }
.u6 .u6-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 48px; }
.u6 .u6-stats .n { font-size: 56px; font-weight: 700; line-height: 64px; letter-spacing: -0.02em; color: var(--pu); }
.u6 .u6-stats p { margin-top: 8px; font-size: 16px; line-height: 24px; color: var(--mute); }
.u6 .u6-img { position: relative; overflow: hidden; background: var(--line); }
.u6 .u6-img img { display: block; width: 100%; height: 100%; object-fit: cover; }
.u6 .u6-photos .pics { display: grid; grid-template-columns: minmax(0, 896fr) minmax(0, 520fr); gap: 24px; }
.u6 .u6-photos .p1 { aspect-ratio: 896 / 504; } .u6 .u6-photos .p2 { aspect-ratio: 520 / 504; }
.u6 .u6-photos figcaption { margin-top: 16px; }

/* process */
.u6 .u6-proc-card { padding: 64px; background: var(--soft); }
.u6 .u6-proc { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr); gap: 24px; align-items: start; }
.u6 .u6-arrow { font-size: 24px; line-height: 32px; color: var(--mute); }
.u6 .u6-pcol { display: flex; flex-direction: column; gap: 16px; }
.u6 .u6-pcol .box { padding: 16px; background: #FFFFFF; font-size: 18px; font-weight: 700; line-height: 28px; }
.u6 .u6-pcol ul { display: flex; flex-direction: column; gap: 16px; font-size: 16px; line-height: 24px; }

/* discover — pinned scene (desktop) */
.u6 .u6-dsc-outer { position: relative; }
.u6 .u6-dsc-pin { position: sticky; top: max(80px, calc(50vh - 320px)); display: grid; grid-template-columns: minmax(0, 640px) minmax(0, 736px); justify-content: space-between; gap: 64px; height: 640px; }
.u6 .u6-dsc-list { display: flex; flex-direction: column; justify-content: center; }
.u6 .u6-dsc-item { border-top: 1px solid var(--line); }
.u6 .u6-dsc-item:last-child { border-bottom: 1px solid var(--line); }
.u6 .u6-dsc-head { display: flex; align-items: baseline; gap: 16px; width: 100%; padding: 24px 0; background: none; border: 0; text-align: left; font: inherit; cursor: pointer; }
.u6 .u6-dsc-head .n, .u6 .u6-dsc-head .t { font-size: 24px; font-weight: 700; line-height: 32px; letter-spacing: -0.005em; color: #A3A3AB; transition: color .4s ease; }
.u6 .u6-dsc-item.on .u6-dsc-head .n { color: var(--pu); }
.u6 .u6-dsc-item.on .u6-dsc-head .t, .u6 .u6-dsc-head:hover .t { color: var(--ink); }
.u6 .u6-dsc-head:focus-visible { outline: 2px solid var(--pu); outline-offset: 2px; }
.u6 .u6-dsc-body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .6s var(--ease); }
.u6 .u6-dsc-body > div { overflow: hidden; display: flex; flex-direction: column; gap: 24px; }
.u6 .u6-dsc-item.on .u6-dsc-body { grid-template-rows: 1fr; }
.u6 .u6-dsc-item.on .u6-dsc-body > div { padding-bottom: 32px; }
.u6 .u6-dsc-h { font-size: 40px; font-weight: 700; line-height: 48px; letter-spacing: -0.015em; }
.u6 .u6-dsc-panel { position: relative; }
.u6 .u6-dsc-layer { position: absolute; inset: 0; display: flex; align-items: center; opacity: 0; transition: opacity .6s ease; pointer-events: none; }
.u6 .u6-dsc-layer.on { opacity: 1; pointer-events: auto; }
.u6 .u6-dsc-layer > * { width: 100%; }

/* discover — blocks (small screens) */
.u6 .u6-blocks { display: flex; flex-direction: column; gap: 96px; }
.u6 .u6-block { display: grid; grid-template-columns: minmax(0, 640px) minmax(0, 736px); justify-content: space-between; gap: 64px; align-items: start; }
.u6 .u6-text { display: flex; flex-direction: column; gap: 24px; }

/* diagram: builds node by node */
.u6 .u6-dg { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px 32px; background: #FFFFFF; text-align: center; }
.u6 .u6-dg .node { display: flex; flex-direction: column; gap: 8px; padding: 16px; background: #FFFFFF; border: 1px solid var(--line); }
.u6 .u6-dg .node.em { border: 2px solid var(--pu); }
.u6 .u6-dg .node.reg { width: 275px; }
.u6 .u6-dg .node b { font-size: 18px; font-weight: 700; line-height: 28px; }
.u6 .u6-dg .node span { font-size: 16px; line-height: 24px; color: var(--mute); }
.u6 .u6-dg .watch { font-size: 16px; line-height: 24px; color: var(--pu); }
.u6 .u6-dg .flow { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr); gap: 16px; align-items: center; width: 100%; }
.u6 .u6-dg .ar { font-size: 24px; line-height: 32px; color: var(--mute); }
.u6 .u6-dg .cap { font-size: 16px; line-height: 24px; color: var(--mute); }
.u6 .u6-dg .node, .u6 .u6-dg .watch, .u6 .u6-dg .ar, .u6 .u6-dg .cap { opacity: 0; transform: translateY(-16px); transition: opacity .5s ease, transform .7s cubic-bezier(0.34, 1.56, 0.64, 1); transition-delay: calc(var(--d, 0) * 140ms + 150ms); }
.u6 .u6-dg.on .node, .u6 .u6-dg.on .watch, .u6 .u6-dg.on .ar, .u6 .u6-dg.on .cap { opacity: 1; transform: none; }
.u6 .u6-dg.on .node.em:not(.reg) { animation: u6-ring 1.6s ease-out 1.4s 2; }
@keyframes u6-ring { 0% { box-shadow: 0 0 0 0 rgba(var(--pu-rgb), .45); } 100% { box-shadow: 0 0 0 16px rgba(var(--pu-rgb), 0); } }
.u6 .u6-img.crm { aspect-ratio: 736 / 394; }

/* market table: fills row by row */
.u6 .u6-mt table { width: 100%; border-collapse: collapse; }
.u6 .u6-mt th { padding: 16px 16px 16px 0; text-align: left; font-size: 16px; font-weight: 700; line-height: 24px; color: var(--mute); border-bottom: 1px solid var(--line); }
.u6 .u6-mt td { width: 33.33%; padding: 16px 16px 16px 0; font-size: 18px; line-height: 28px; vertical-align: top; border-bottom: 1px solid var(--line); }
.u6 .u6-mt td.b { font-weight: 700; }
.u6 .u6-mt tr.hi td.b { color: var(--pu); }
.u6 .u6-mt tbody tr { opacity: 0; transform: translateX(-16px); transition: opacity .5s ease, transform .6s var(--ease); transition-delay: calc(var(--d, 0) * 140ms); }
.u6 .u6-mt.on tbody tr { opacity: 1; transform: none; }
.u6 .u6-mt tr.hi td { background-image: linear-gradient(rgba(var(--pu-rgb), .08), rgba(var(--pu-rgb), .08)); background-repeat: no-repeat; background-size: 0% 100%; transition: background-size .8s var(--ease) 1s; }
.u6 .u6-mt.on tr.hi td { background-size: 100% 100%; }
.u6 .u6-mt .u6-src { margin-top: 0; }
.u6 .u6-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }

/* findings */
.u6 .u6-finds { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; align-items: stretch; }
.u6 .u6-find { display: flex; flex-direction: column; gap: 16px; height: 100%; padding: 32px; background: #FFFFFF; border: 1px solid var(--line2); }
.u6 .u6-find .big { font-size: 56px; font-weight: 700; line-height: 64px; letter-spacing: -0.02em; color: var(--pu); }
.u6 .u6-find .lead { font-size: 18px; line-height: 28px; }
.u6 .u6-find .det, .u6 .u6-find .ref { font-size: 16px; line-height: 24px; color: var(--mute); }
.u6 .u6-find .meant { display: flex; flex-direction: column; gap: 8px; padding-top: 16px; border-top: 1px solid var(--line2); }
.u6 .u6-find .k.em { color: var(--pu); }
.u6 .u6-find .meant p { font-size: 18px; font-weight: 600; line-height: 28px; }
.u6 .u6-articles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.u6 .u6-articles figcaption { margin-top: 16px; }
.u6 .u6-img.art { aspect-ratio: 708 / 400; background: #FFFFFF; box-shadow: inset 0 0 0 1px var(--line2); }
.u6 .u6-img.art img { object-fit: cover; object-position: top center; }

/* competitor table */
.u6 .u6-cmp { min-width: 760px; background: #FFFFFF; border: 1px solid var(--line2); }
.u6 .u6-cmp .tr { display: grid; grid-template-columns: minmax(0, 320fr) minmax(0, 560fr) minmax(0, 560fr); }
.u6 .u6-cmp .tr > span { padding: 24px; font-size: 18px; line-height: 28px; border-top: 1px solid var(--line2); }
.u6 .u6-cmp .tr > span + span { border-left: 1px solid var(--line2); }
.u6 .u6-cmp .th > span { border: 0 !important; background: #000D0F; color: #FFFFFF; font-weight: 600; }
.u6 .u6-cmp .lab { background: var(--soft); font-size: 16px !important; font-weight: 600; line-height: 24px !important; color: var(--mute); }
.u6 .u6-insight { padding: 32px 40px; background: #FFFFFF; border-left: 4px solid var(--pu); font-size: 24px; font-weight: 700; line-height: 32px; letter-spacing: -0.005em; }
.u6 .u6-princ { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; align-items: stretch; }
.u6 .u6-princ .pc { display: flex; flex-direction: column; gap: 16px; height: 100%; padding: 32px; background: #000D0F; }
.u6 .u6-princ .n { font-size: 16px; font-weight: 500; line-height: 24px; color: #C7A8FF; }
.u6 .u6-princ b { font-size: 24px; font-weight: 700; line-height: 32px; color: #FFFFFF; }
.u6 .u6-princ p { font-size: 18px; line-height: 28px; color: #D1D1D9; }

/* define */
.u6 .u6-hmw { margin-top: 24px; max-width: 1200px; font-size: 32px; line-height: 40px; }
.u6 .u6-goals { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; align-items: stretch; }
.u6 .u6-goals .bounce > div, .u6 .u6-moments .mo, .u6 .u6-tasks .tk { border: 1px solid var(--line); }
.u6 .u6-goals .bounce > div { display: flex; flex-direction: column; gap: 8px; padding: 32px; }
.u6 .u6-goals p { font-size: 18px; line-height: 28px; }
.u6 .u6-moments { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; align-items: start; }
.u6 .u6-moments .mo { display: flex; flex-direction: column; gap: 16px; padding: 24px; }
.u6 .u6-moments .n { font-size: 16px; font-weight: 700; line-height: 24px; color: var(--pu); }
.u6 .u6-moments b { font-size: 18px; font-weight: 700; line-height: 28px; }

/* journey map */
.u6 .u6-jm { display: flex; flex-direction: column; border: 1px solid var(--line2); background: #FFFFFF; }
.u6 .u6-jm .row { display: grid; grid-template-columns: 176px repeat(6, minmax(0, 1fr)); border-bottom: 1px solid var(--line2); }
.u6 .u6-jm .row:last-child { border-bottom: 0; }
.u6 .u6-jm .lab { padding: 24px 16px 24px 24px; background: var(--soft); font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; color: var(--mute); position: sticky; left: 0; z-index: 2; }
.u6 .u6-jm .cell { display: flex; flex-direction: column; gap: 8px; padding: 24px 16px; border-left: 1px solid var(--line2);
  opacity: 0; transform: translateY(12px); transition: opacity .6s ease, transform .8s var(--ease); transition-delay: calc(var(--c, 0) * 110ms); }
.u6 .u6-jm.on .cell { opacity: 1; transform: none; }
.u6 .u6-jm .num { font-size: 16px; font-weight: 500; line-height: 24px; color: var(--pu); }
.u6 .u6-jm .stage { font-size: 24px; font-weight: 700; line-height: 32px; letter-spacing: -0.005em; }
.u6 .u6-jm p { font-size: 16px; line-height: 24px; }
.u6 .u6-jm p.ask { font-weight: 500; }
.u6 .u6-jm p.ev { color: var(--mute); }
.u6 .u6-jm .feel .feel-cell { position: relative; grid-column: 2 / -1; height: 224px; border-left: 1px solid var(--line2); }
.u6 .u6-jm .feel .line { position: absolute; left: 0; right: 0; top: 104px; height: 1px; background: var(--line2); }
.u6 .u6-jm .pt { position: absolute; top: 104px; width: 0; height: 0; }
.u6 .u6-jm .pt .dot { position: absolute; left: -7px; top: -7px; width: 14px; height: 14px; box-sizing: border-box; border: 2px solid var(--pu); background: #FFFFFF; border-radius: 50% !important;
  opacity: 0; transform: translateY(0); transition: opacity .3s ease, transform 1s cubic-bezier(0.34, 1.56, 0.64, 1); transition-delay: calc(var(--c, 0) * 160ms + 500ms); }
.u6 .u6-jm .pt.good .dot { background: var(--pu); }
.u6 .u6-jm.on .pt .dot { opacity: 1; transform: translateY(var(--y)); }
.u6 .u6-jm.on .pt.good .dot { animation: u6-pulse 1.8s ease-out calc(var(--c, 0) * 160ms + 1.6s) infinite; }
@keyframes u6-pulse { 0% { box-shadow: 0 0 0 0 rgba(var(--pu-rgb), .5); } 100% { box-shadow: 0 0 0 14px rgba(var(--pu-rgb), 0); } }
.u6 .u6-jm .pt .w { position: absolute; left: 0; top: 12px; transform: translate(-50%, var(--y)); white-space: nowrap; font-size: 16px; line-height: 24px; color: var(--mute);
  opacity: 0; transition: opacity .5s ease; transition-delay: calc(var(--c, 0) * 160ms + 1.1s); }
.u6 .u6-jm .pt.good .w { top: -34px; color: var(--ink); }
.u6 .u6-jm.on .pt .w { opacity: 1; }
.u6 .u6-jm .risk { font-size: 16px; font-weight: 600; line-height: 24px; }
.u6 .u6-jm .bars { display: flex; gap: 8px; }
.u6 .u6-jm .bars i { position: relative; width: 24px; height: 8px; background: var(--line2); overflow: hidden; }
.u6 .u6-jm .bars i.f::after { content: ''; position: absolute; inset: 0; background: var(--pu); transform: scaleX(0); transform-origin: left; transition: transform .35s ease; transition-delay: calc(var(--c, 0) * 110ms + var(--k, 0) * 120ms + 900ms); }
.u6 .u6-jm.on .bars i.f::after { transform: scaleX(1); }
.u6 .u6-jm .chips { gap: 8px; }
.u6 .u6-jm .chip { display: block; padding: 8px; background: #000D0F; border: 1px solid #000D0F; color: #FFFFFF; font-size: 16px; font-weight: 500; line-height: 24px; }
.u6 .u6-jm .chip.concept { background: #FFFFFF; border-color: #737378; color: var(--mute); }

/* develop: screen cards that stack (GameCove test cards) */
.u6 .u6-sq + .u6-sq { margin-top: 120px; }
.u6 .u6-sc { display: grid; grid-template-columns: minmax(0, 896px) minmax(0, 480px); justify-content: space-between; gap: 64px; align-items: center; background: var(--soft); }
.u6 .u6-sc.flip { grid-template-columns: minmax(0, 480px) minmax(0, 896px); }
.u6 .u6-sc.flip .shot { order: 2; }
.u6 .u6-stack.on .u6-sq { position: sticky; top: max(32px, calc(50vh - 240px)); }
.u6 .u6-stack.on .u6-sc { opacity: calc(1 - var(--k, 0)); will-change: opacity; }
.u6 .u6-img.shot { aspect-ratio: 896 / 480; }
.u6 .u6-why { display: flex; flex-direction: column; gap: 24px; }
.u6 .u6-why h3 { font-size: 24px; font-weight: 700; line-height: 32px; letter-spacing: -0.005em; }
.u6 .u6-why p { margin-top: 8px; font-size: 18px; line-height: 28px; }

/* concept */
.u6 .u6-chead { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
.u6 .u6-badge { display: inline-block; padding: 8px 16px; border: 1px solid var(--pu); font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; color: var(--pu); }
.u6 .u6-gaps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; align-items: stretch; }
.u6 .u6-gaps .gp { display: flex; flex-direction: column; gap: 16px; height: 100%; padding: 32px; background: #FFFFFF; }
.u6 .u6-gaps p { font-size: 18px; line-height: 28px; }
.u6 .u6-gaps p.s { font-weight: 500; color: var(--pu); }
.u6 .u6-cscreens { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; align-items: start; }
.u6 .u6-cscreens figcaption { margin-top: 16px; }
.u6 .u6-img.cs { background: #FFFFFF; }

/* deliver */
.u6 .u6-log li { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 24px; padding: 16px 0; border-bottom: 1px solid var(--line); font-size: 18px; line-height: 28px; }
.u6 .u6-log .d { font-size: 16px; font-weight: 700; line-height: 28px; color: var(--pu); }
.u6 .u6-dconcept { display: flex; flex-direction: column; gap: 32px; padding: 64px; background: var(--soft); }
.u6 .u6-steps { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr); gap: 16px; align-items: center; }
.u6 .u6-steps .ar { font-size: 24px; line-height: 32px; color: var(--mute); }
.u6 .u6-steps .st { display: flex; flex-direction: column; gap: 8px; height: 164px; box-sizing: border-box; padding: 24px; background: #FFFFFF; }
.u6 .u6-steps .n { font-size: 16px; font-weight: 700; line-height: 24px; color: var(--pu); }
.u6 .u6-steps p { font-size: 18px; line-height: 28px; }

/* test */
.u6 .u6-tasks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; align-items: stretch; }
.u6 .u6-tasks .tk { display: flex; flex-direction: column; gap: 8px; height: 100%; padding: 32px; }
.u6 .u6-tasks .n { font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; color: var(--pu); }
.u6 .u6-tasks p { font-size: 18px; line-height: 28px; }
.u6 .u6-tasks p.res { font-size: 16px; line-height: 24px; color: var(--mute); }

/* reflection */
.u6 .u6-sec.night { background: var(--night); color: #FFFFFF; }
.u6 .night .u6-rt { color: #FFFFFF; }
.u6 .u6-list { display: flex; flex-direction: column; gap: 24px; }
.u6 .u6-list li { display: flex; gap: 24px; font-size: 18px; line-height: 28px; color: #FFFFFF; }
.u6 .u6-list .n { flex: none; font-weight: 500; color: var(--pu); }
.u6 .u6-closing .ph { overflow: hidden; aspect-ratio: 1440 / 640; background: #1A1726; }
.u6 .u6-closing img { display: block; width: 100%; height: 100%; object-fit: cover; transform: scale(1.08); will-change: transform; }
.u6 .u6-closing figcaption { margin-top: 16px; }
.u6 .u6-cap.night { color: #B8B8C2; }

/* next case study */
.u6 .u6-next { background: var(--off, #F5F5F2); }
.u6 .u6-next .next-card { display: flex; flex-direction: column; gap: 16px; padding: 140px 0; color: var(--ink); text-decoration: none; }
.u6 .u6-next .next-name { font-size: clamp(56px, 6vw, 112px); font-weight: 300; letter-spacing: -0.04em; line-height: 1; transition: transform .3s ease-out; }
.u6 .u6-next .next-card:hover .next-name { transform: translateX(8px); }

/* square corners everywhere (the film bar and the journey dots keep their own, more specific rules) */
.u6 *, .u6 *::before, .u6 *::after { border-radius: 0 !important; }

@media (max-width: 1280px) {
  .u6 .u6-rt { width: 280px; }
  .u6 .u6-proc-card { padding: 40px; }
  .u6 .u6-proc { gap: 16px; }
  .u6 .u6-sc, .u6 .u6-sc.flip { grid-template-columns: minmax(0, 1fr) minmax(0, 400px); gap: 40px; }
  .u6 .u6-sc.flip { grid-template-columns: minmax(0, 400px) minmax(0, 1fr); }
  .u6 .u6-moments { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .u6 .u6-jm { min-width: 1180px; }
}
@media (max-width: 1023px) {
  .u6 .u6-block, .u6 .u6-sc, .u6 .u6-sc.flip { grid-template-columns: minmax(0, 1fr); gap: 40px; }
  .u6 .u6-sc.flip .shot { order: 0; }
  .u6 .u6-proc, .u6 .u6-steps { grid-template-columns: minmax(0, 1fr); }
  .u6 .u6-arrow, .u6 .u6-steps .ar { transform: rotate(90deg); justify-self: start; }
  .u6 .u6-steps .st { height: auto; }
  .u6 .u6-row { flex-direction: column; gap: 16px; }
  .u6 .u6-rt { width: auto; }
  .u6 .u6-goals, .u6 .u6-tasks, .u6 .u6-finds, .u6 .u6-princ, .u6 .u6-gaps { grid-template-columns: minmax(0, 1fr); }
  .u6 .u6-moments { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .u6 .u6-articles, .u6 .u6-cscreens { grid-template-columns: minmax(0, 1fr); }
  .u6 .u6-jm-scroll { margin-right: calc((100vw - 100%) / -2); padding-right: 16px; }
}
@media (max-width: 700px) {
  .u6 .u6-w { width: calc(100vw - 40px); }
  .u6 .u6-hero { padding: 104px 0 88px; }
  .u6 .u6-h1 { font-size: 40px; line-height: 48px; }
  .u6 .u6-kicker { font-size: 20px; line-height: 28px; }
  .u6 .u6-btn { width: 100%; }
  .u6 .u6-sec { padding: 88px 0; }
  .u6 .mt96, .u6 .mt120 { margin-top: 64px; }
  .u6 .u6-blocks { gap: 64px; }
  .u6 .u6-sq + .u6-sq { margin-top: 64px; }
  .u6 .u6-h2 { font-size: 32px; line-height: 40px; }
  .u6 .u6-h3 { font-size: 24px; line-height: 32px; }
  .u6 .u6-hmw { font-size: 24px; line-height: 32px; }
  .u6 .u6-meta, .u6 .u6-stats { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .u6 .u6-photos .pics { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .u6 .u6-proc-card { padding: 24px; }
  .u6 .u6-dconcept { padding: 32px 24px; }
  .u6 .u6-dg { padding: 24px 16px; }
  .u6 .u6-dg .flow { grid-template-columns: minmax(0, 1fr); }
  .u6 .u6-dg .flow .ar { transform: rotate(90deg); }
  .u6 .u6-dg.on .flow .ar { transform: rotate(90deg); }
  .u6 .u6-dg .node.reg { width: 100%; box-sizing: border-box; }
  .u6 .u6-moments { grid-template-columns: minmax(0, 1fr); }
  .u6 .u6-mt table { min-width: 560px; }
  .u6 .u6-find, .u6 .u6-princ .pc, .u6 .u6-gaps .gp, .u6 .u6-tasks .tk, .u6 .u6-goals .bounce > div { padding: 24px; }
  .u6 .u6-find .big { font-size: 40px; line-height: 48px; }
  .u6 .u6-insight { padding: 24px; font-size: 20px; line-height: 28px; }
  .u6 .u6-jm .lab { width: 128px; box-sizing: border-box; padding: 16px; }
  .u6 .u6-jm .row { grid-template-columns: 128px repeat(6, minmax(0, 1fr)); }
  .u6 .u6-jm { min-width: 1100px; }
  .u6 .u6-list li { gap: 16px; }
  .u6 .u6-closing .ph { aspect-ratio: 4 / 3; }
}
@media (prefers-reduced-motion: reduce) {
  .u6 [data-r], .u6 .u6-dg *, .u6 .u6-mt tbody tr, .u6 .u6-jm .cell, .u6 .u6-jm .pt *, .u6 .u6-jm .bars i::after { opacity: 1 !important; transition: none !important; animation: none !important; }
  .u6 [data-r], .u6 .u6-jm .cell, .u6 .u6-mt tbody tr { transform: none !important; }
  .u6 .u6-jm .pt .dot { transform: translateY(var(--y)) !important; }
  .u6 .u6-jm .bars i.f::after { transform: none !important; }
  .u6 .u6-dsc-body, .u6 .u6-dsc-layer { transition: none !important; }
}
`
