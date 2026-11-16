import React, { useEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { SideToc, useHeadroom } from './CaseNav'
import { SiteHeaderB } from './SiteHeaderB'
import { CaseFilm, useCaseIntro } from './CaseFilm'

/**
 * ETO Markets case study (v135, Harbor Nov 16) — built from Harbor's Figma "06 ETO Markets — 1920 · v3"
 * (file 44기 김지현 4차 랜딩페이지, node 1705:453). Copy is the frame's, word for word.
 * Colours (Figma): ETO red #E31E24, soft red #FDF2F2 (alternate sections), red line #F8D6D7, ink #000D10,
 * grey text #616166, ash #8E8E95, line #E2E2E4, chip grey #F5F5F6, takeaways #141213.
 * Type: the site's Roboto (index.css) on Figma's sizes — 64/72 title, 40/48 section titles, 24/32 row titles,
 * 18/28 body, 16/24 labels and captions; nothing under 16px.
 * Corners: square on every image, video and card (site rule). Kept round on purpose, as on Trust Bank: the small red
 * number badges, the tier chips and the film's control bar.
 * Layout: the 1440 column (240px sides at 1920), sections 120px top and bottom.
 *
 * Opening (like Trust Bank, GameCove and UTrada): Harbor's film "eto-crm-partners-v5b" (31.5s, re-encoded to
 * 1600×900, 3.6 MB) fills the screen, stays dark until it really plays, and 5 seconds later moves into its place
 * under the headline (CaseFilm.tsx). Scrolling, swiping or a key press starts the move at once. The header and the
 * process list stay hidden until then. Afterwards the film loops muted; Trust Bank's round control bar shows on hover.
 * Assets: Harbor-K/harbor-pf assets/eto/v3/ (film, poster, ETO mark and the Figma images exported at 2x).
 * Prototype links: Figma shows "Desktop prototype ↗" and "Mobile prototype ↗" but has no addresses yet — the two
 * buttons appear as soon as PROTO below gets its links.
 */

const A = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/v3/'
const IMG = {
  mark: A + 'mark.png',
  video: A + 'intro.mp4',
  poster: A + 'intro-poster.jpg',
  oldUx: A + 'old-ux.webp',
  competitive: A + 'competitive.webp',
  sticky: A + 'sticky-ia.webp',
  sketchAccount: A + 'sketch-account.webp',
  sketchPamm: A + 'sketch-pamm.webp',
  sketchBoard: A + 'sketch-whiteboard.webp',
  dashboard: A + 'ba-dashboard.webp',
  inbox: A + 'ba-inbox.webp',
  tablet: A + 'ba-tablet.webp',
  mobile: A + 'ba-mobile.webp',
  protoDesktop: A + 'proto-desktop.webp',
  protoInbox: A + 'proto-inbox.webp',
  protoDeposit: A + 'proto-deposit.webp',
  office: A + 'office.webp',
}
const PROTO = { desktop: '', mobile: '' }
const NEXT = { name: 'Trust Bank', href: '#/trust-bank' }
const FILM_LABEL = 'ETO Markets intro film: the partner CRM — every account, client, deposit and rebate in order; share a link, sign up, done; system errors down from 60% to 14%. Ends on: a CRM for partners.'
export const E3_CHAPTERS = ['Overview', 'Context', 'Discover', 'Process', "Designer's notes", 'Data hierarchy', 'Before → After', 'Prototype', 'Results', 'Takeaways']

const DARK = '#0B0B0D'
const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

function Label({ children, light = false }: { children: string; light?: boolean }) {
  return <div className={'e3-label' + (light ? ' light' : '')}><i aria-hidden="true" />{children}</div>
}

function Pic({ src, alt, w, h, className = '' }: { src: string; alt: string; w: number; h: number; className?: string }) {
  return <img className={'e3-img ' + className} src={src} alt={alt} width={w} height={h} loading="lazy" decoding="async" />
}

/* ---------- content (Figma 1705:453, word for word) ---------- */

const IMPACT = [
  { n: '60% → 14%', c: 'system error frequency' },
  { n: '15% → 30%', c: 'user tracking' },
  { n: '3 → 9', c: 'countries served' },
]

const LIFECYCLE = [
  { t: 'Sign up', d: 'Creates a client profile' },
  { t: 'Verify', d: 'Uploads ID for KYC checks' },
  { t: 'Fund', d: 'Deposits with local or crypto payment methods' },
  { t: 'Trade', d: 'Opens MT4/MT5 accounts and trades' },
  { t: 'Withdraw & stay', d: 'Withdraws, earns rebates, stays active' },
]

const USERS = [
  { k: 'CLIENT PORTAL', t: 'The trader', d: 'Checks balance, equity and margin, then moves money in or out. Needs the numbers they act on, and one clear next step.' },
  { k: 'ADMIN SITE', t: 'The broker team', d: 'Follows each client from sign-up to first trade. Needs to spot stuck verifications, failed deposits and inactive accounts fast.' },
]

const SKETCHES = [
  { src: IMG.sketchAccount, alt: 'Paper sketch of the account flow: open an account, make a deposit, learn trading skills, start live trading', c: 'Account flow on paper: open, deposit, learn, start live trading.' },
  { src: IMG.sketchPamm, alt: 'Paper sketch of the PAMM structure: one trader account linked to three investor accounts', c: 'PAMM structure: one trader account linked to many investor accounts.' },
  { src: IMG.sketchBoard, alt: 'Whiteboard plan for the landing page sections: spreads, payment solutions, max leverage, fund security, micro lot trading', c: 'Landing sections on the whiteboard: spreads, payments, leverage, fund security.' },
]

const PHASES = [
  { h: '6h', t: 'Define', d: ['CRM definition', 'Two users, two jobs'] },
  { h: '8h', t: 'Data audit', d: ['List every metric', 'Group by question'] },
  { h: '8h', t: 'Hierarchy', d: ['Priority tiers', 'Wireframe zones'] },
  { h: '12h', t: 'UI design', d: ['Dashboard + client detail', 'Before / after'] },
  { h: '6h', t: 'Write-up', d: ['Designer notes', 'Case study page'] },
]

const NOTES = [
  { t: 'One screen, one job', d: 'The old inbox showed registration, deposit and withdrawal on one page, which made it inconsistent. I split them into three tabs, and gave every page a single call to action.' },
  { t: 'Numbers a trader trusts at a glance', d: 'Balance, equity and margin level sit together, in one format, at the top of each account. A trader should not do maths to know where they stand.' },
  { t: 'Tables on desktop, cards on mobile', d: 'On mobile I switched from tables to cards, and a tap reveals the totals. The data stays the same; only the amount shown at once changes.' },
]

const TIERS = [
  { n: 1, t: 'Act now', d: 'Top of the page, largest type. The only place red appears.', chips: ['Margin level', 'Pending deposit / withdrawal', 'Verification status', 'Deposit button'] },
  { n: 2, t: 'Monitor', d: 'Account summary in regular weight, same format for every account.', chips: ['Balance', 'Equity', 'Trading accounts (MT4/MT5)', 'Leverage'] },
  { n: 3, t: 'Reference', d: 'One click away, collapsed by default.', chips: ['Rebate summary', 'Transaction history', 'Inbox messages', 'Account settings'] },
]

const RULES = [
  { t: 'Right-aligned numbers', d: 'Same decimals and currency label in every column.' },
  { t: 'Red means act', d: 'Used for actions and risk only, never for decoration.' },
  { t: 'Status is written out', d: 'Pending, completed and failed are words, not just colours.' },
  { t: '16px minimum', d: 'No number on the dashboard is smaller than 16px.' },
]

const BEFORE_AFTER = [
  { t: 'Inbox', d: 'Registration, deposit and withdrawal were on one page. I split them into three tabs so each list reads on its own.', src: IMG.inbox, w: 1440, h: 562, alt: 'Inbox before and after: one long mixed list (A) and the redesign with Registration, Deposit and Withdrawal tabs (B)' },
  { t: 'Tablet', d: 'Payment options became buttons, and the account list became cards with the key figures on top.', src: IMG.tablet, w: 1440, h: 607, alt: 'Tablet before and after: deposit methods as buttons and the account list as cards with balance, equity and margin level on top' },
  { t: 'Mobile', d: 'Account details and the QR code moved to their own pages. Tables became cards; a tap reveals the totals.', src: IMG.mobile, w: 1440, h: 739, alt: 'Mobile before and after: account details and the QR code on separate pages, and open positions as cards instead of a table' },
]

const STILLS = [
  { src: IMG.protoDesktop, c: 'Desktop · My clients', alt: 'Desktop prototype still: the change-leverage dialog over the dashboard' },
  { src: IMG.protoInbox, c: 'Mobile · Inbox', alt: 'Mobile prototype still: the inbox with Registration, Deposit and Withdrawal tabs and a client card' },
  { src: IMG.protoDeposit, c: 'Mobile · Deposit methods', alt: 'Mobile prototype still: the deposit methods flow' },
]

/* bar lengths are the Figma frame's (880px = the longest bar) */
const RESULTS = [
  { t: 'System error frequency', s: '60% → 14%', a: { v: '60%', w: 880 }, b: { v: '14%', w: 208 } },
  { t: 'User tracking', s: '15% → 30%', a: { v: '15%', w: 440 }, b: { v: '30%', w: 880 } },
  { t: 'Countries served', s: '3 → 9', a: { v: '3', w: 296 }, b: { v: '9', w: 880 } },
]

const TAKEAWAYS = [
  'A CRM dashboard is a priority list, not a data dump. Deciding what comes first is the design.',
  'Going back to old work showed me what I skipped the first time: writing down why each number sits where it does.',
  'Next time I would test the tier order with real traders before any visual design.',
]

export function EtoV3() {
  const [introOn] = useState(() => !reducedMotion())
  const [intro, setIntro] = useState(introOn)
  const away = useHeadroom()
  const slot = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const media = useRef<HTMLVideoElement>(null)
  useCaseIntro(introOn, slot, box, media, () => setIntro(false))

  // soft reveal as blocks scroll in
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.e3 [data-reveal]'))
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [])

  const hasProto = !!(PROTO.desktop || PROTO.mobile)

  return (
    <div className={'hb eto e3' + (intro ? ' intro-on' : '')}>
      <style>{CSS + E3_CSS}</style>
      <SiteHeaderB mode="light" hidden={intro} away={away} />
      <SideToc chapters={E3_CHAPTERS} scope=".e3" hidden={intro} />

      <main id="top">
        {/* Hero */}
        <section className="e3-hero" data-chapter="ETO Markets" aria-label="ETO Markets">
          <div className="e3-w">
            <div className="e3-brand"><img src={IMG.mark} alt="" width={48} height={48} /><span>ETO Markets</span></div>
            <h1 className="e3-h1">Making a broker's CRM read in the right order</h1>
            <p className="e3-sub">Reinterpreting the client CRM dashboard I designed at ETO Markets (Sydney).</p>
            <div className="e3-slot" ref={slot}>
              <div className="e3-box" ref={box}><CaseFilm src={IMG.video} poster={IMG.poster} label={FILM_LABEL} quiet={intro} introRef={media} /></div>
            </div>
            <div className="e3-meta">
              <div><div className="k">TIMELINE</div><p>Nov 2022 – Mar 2023 (original, 4 months)<br />Reinterpreted in a 40-hour sprint, 2026</p></div>
              <div><div className="k">ROLE</div><p>UI &amp; UX designer, in-house<br />Web, tablet, iOS and Android</p></div>
              <div><div className="k">INDUSTRY</div><p>Fintech, online trading, CRM</p></div>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="e3-sec" data-chapter="Overview">
          <div className="e3-w e3-stack64">
            <Label>OVERVIEW</Label>
            <div className="e3-row" data-reveal>
              <h2 className="e3-rt">The problem</h2>
              <p className="e3-body">ETO Markets' client CRM had not been redesigned in eight years. Traders used it to open accounts, deposit, withdraw and check their balance, but every page showed everything at the same weight. Pages were crowded, inconsistent and error-prone, and the CRM was live in only three countries.</p>
            </div>
            <div className="e3-row" data-reveal>
              <h2 className="e3-rt">What I did</h2>
              <p className="e3-body">I rebuilt the CRM around one question: what does a trader need to see first? I split crowded pages so each one has a single job, gave every screen one clear call to action, and turned dense tables into cards on mobile. For this portfolio I reinterpreted the project in a 40-hour sprint to make that data hierarchy explicit.</p>
            </div>
            <div className="e3-row" data-reveal>
              <h2 className="e3-rt">Impact</h2>
              <div className="e3-impact">
                <div className="e3-stats">
                  {IMPACT.map(s => <div key={s.c}><div className="n">{s.n}</div><p>{s.c}</p></div>)}
                </div>
                <p className="e3-note">Figures reported after the 2023 relaunch of the original project.</p>
              </div>
            </div>
          </div>
        </section>

        {/* What is a CRM */}
        <section className="e3-sec e3-soft" data-chapter="Context">
          <div className="e3-w">
            <Label>CONTEXT</Label>
            <h2 className="e3-h2 mt24">What a CRM means for a trading broker</h2>
            <p className="e3-body w760 mt24">In most companies a CRM is a sales team's tool. At a broker like ETO Markets it is also the client's own portal: the place where a trader opens accounts, verifies identity, moves money and checks balances. So one product serves two users with very different questions.</p>
            <ol className="e3-life mt64" data-reveal>
              {LIFECYCLE.map((s, i) => (
                <li key={s.t}><span className="e3-badge">{String(i + 1).padStart(2, '0')}</span><h3>{s.t}</h3><p>{s.d}</p></li>
              ))}
            </ol>
            <div className="e3-users mt48" data-reveal>
              {USERS.map(u => <div key={u.k}><div className="kr">{u.k}</div><h3>{u.t}</h3><p>{u.d}</p></div>)}
            </div>
          </div>
        </section>

        {/* Discover */}
        <section className="e3-sec" data-chapter="Discover">
          <div className="e3-w">
            <Label>DISCOVER</Label>
            <h2 className="e3-h2 mt24">The old CRM showed everything at once</h2>
            <p className="e3-body w760 mt24">Dashboard, deposit and account details shared one long page. Payment methods, QR codes and account tables competed for attention, so traders had to hunt for the one number or button they came for.</p>
            <figure className="mt64" data-reveal>
              <Pic src={IMG.oldUx} w={1440} h={810} alt="The 2022 CRM: the dashboard page with a trading accounts table and two registration links with QR codes, and the deposit page with eight payment method tiles" />
              <figcaption className="e3-cap">The 2022 CRM: dashboard page (left) and deposit page (right).</figcaption>
            </figure>
            <div className="e3-bench mt120" data-reveal>
              <div>
                <h3 className="e3-rt">Four brokers as a benchmark</h3>
                <p className="e3-body mt24">I compared Pepperstone, TMGM, PU Prime and IC Markets on responsive design, cross-platform consistency, charting tools, navigation, mobile usability and education. The pattern was clear: the strongest portals put the account summary first and keep money actions one tap away.</p>
              </div>
              <Pic src={IMG.competitive} w={880} h={610} alt="Competitive analysis table: Pepperstone, TMGM, PU Prime and IC Markets Global rated as featured, somewhat featured or not featured on seven criteria" />
            </div>
            <div className="mt120" data-reveal>
              <h3 className="e3-rt">Where it started</h3>
              <p className="e3-body w760 mt24">Before any screen, I mapped what ETO sells and how a client moves through it, on sticky notes, paper and the office whiteboard.</p>
              <figure className="mt48">
                <Pic src={IMG.sticky} w={1440} h={500} alt="Three yellow sticky notes: products (forex, commodities, energies, indices), platforms (MT4, MT5, PAMM, social trading) and education (MT4 tutorial videos, webinars)" />
                <figcaption className="e3-cap">Product structure on sticky notes: products, platforms and education.</figcaption>
              </figure>
              <div className="e3-three mt24">
                {SKETCHES.map(s => (
                  <figure key={s.c}><Pic src={s.src} w={464} h={348} alt={s.alt} /><figcaption className="e3-cap">{s.c}</figcaption></figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="e3-sec e3-soft" data-chapter="Process">
          <div className="e3-w">
            <Label>PROCESS</Label>
            <h2 className="e3-h2 mt24">Reinterpreting it in 40 hours</h2>
            <p className="e3-body w760 mt24">The original project ran for four months in 2023. For this case study I went back to it with one goal: write down why each number sits where it does.</p>
            <ol className="e3-phases mt64" data-reveal>
              {PHASES.map(p => (
                <li key={p.t}><div className="h">{p.h}</div><h3>{p.t}</h3><p>{p.d[0]}<br />{p.d[1]}</p></li>
              ))}
            </ol>
          </div>
        </section>

        {/* Designer's notes */}
        <section className="e3-sec" data-chapter="Designer's notes">
          <div className="e3-w">
            <Label>DESIGNER'S NOTES</Label>
            <h2 className="e3-h2 mt24">What I focused on</h2>
            <ol className="e3-notes mt64" data-reveal>
              {NOTES.map((n, i) => (
                <li key={n.t}><div className="num">{String(i + 1).padStart(2, '0')}</div><h3>{n.t}</h3><p>{n.d}</p></li>
              ))}
            </ol>
          </div>
        </section>

        {/* Data hierarchy */}
        <section className="e3-sec e3-soft" data-chapter="Data hierarchy">
          <div className="e3-w">
            <Label>DATA HIERARCHY</Label>
            <h2 className="e3-h2 mt24">Deciding what the eye sees first</h2>
            <p className="e3-body w760 mt24">I listed every number and action on the dashboard, then sorted them by one question: does the trader need to act on this now? That gave three tiers, and each tier got its own position, size and colour.</p>
            <div className="e3-tiers mt64" data-reveal>
              {TIERS.map(t => (
                <div key={t.n} className={'e3-tier' + (t.n === 1 ? ' hot' : '')}>
                  <div className="lab"><div className="tn">TIER {t.n}</div><h3>{t.t}</h3><p>{t.d}</p></div>
                  <ul className="chips">{t.chips.map(c => <li key={c}>{c}</li>)}</ul>
                </div>
              ))}
            </div>
            <div className="e3-rules mt48" data-reveal>
              {RULES.map(r => <div key={r.t}><h3>{r.t}</h3><p>{r.d}</p></div>)}
            </div>
            <figure className="mt64" data-reveal>
              <Pic src={IMG.dashboard} w={1440} h={562} alt="Dashboard before (A) and after (B), with notes: page separation, a deposit call-to-action in the header, a leverage section, a comparison chart for rebates and a blog button" />
              <figcaption className="e3-cap">Dashboard, before (left) and after (right): page separation, a header call to action, a leverage section and a comparison chart.</figcaption>
            </figure>
          </div>
        </section>

        {/* Before → After */}
        <section className="e3-sec" data-chapter="Before → After">
          <div className="e3-w">
            <Label>BEFORE → AFTER</Label>
            <h2 className="e3-h2 mt24">Same data, new order</h2>
            <p className="e3-body w760 mt24">Across web, tablet and mobile the data stayed the same. What changed was how much of it appears at once, and in what order.</p>
            <div className="e3-ba mt64">
              {BEFORE_AFTER.map(b => (
                <div key={b.t} data-reveal>
                  <div className="e3-row"><h3 className="e3-rt">{b.t}</h3><p className="e3-body">{b.d}</p></div>
                  <Pic className="mt32" src={b.src} w={b.w} h={b.h} alt={b.alt} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prototype */}
        <section className="e3-sec e3-soft" data-chapter="Prototype">
          <div className="e3-w">
            <Label>PROTOTYPE</Label>
            <h2 className="e3-h2 mt24">Try the prototype</h2>
            <p className="e3-body w760 mt24">The redesign shipped on web, tablet, iOS and Android. These are stills from the Figma prototypes.</p>
            <div className="e3-three mt64" data-reveal>
              {STILLS.map(s => (
                <figure key={s.c}><Pic src={s.src} w={464} h={580} alt={s.alt} /><figcaption className="e3-cap">{s.c}</figcaption></figure>
              ))}
            </div>
            {hasProto && (
              <div className="e3-links mt48">
                {PROTO.desktop && <a href={PROTO.desktop} target="_blank" rel="noreferrer">Desktop prototype ↗</a>}
                {PROTO.mobile && <a href={PROTO.mobile} target="_blank" rel="noreferrer">Mobile prototype ↗</a>}
              </div>
            )}
          </div>
        </section>

        {/* Results */}
        <section className="e3-sec" data-chapter="Results">
          <div className="e3-w">
            <Label>RESULTS</Label>
            <h2 className="e3-h2 mt24">What changed after the relaunch</h2>
            <p className="e3-body w760 mt24">Reported after the redesigned CRM went live in 2023.</p>
            <div className="e3-legend mt48"><span><i className="b" />Before redesign</span><span><i className="a" />After redesign</span></div>
            <div className="e3-bars mt24" data-reveal>
              {RESULTS.map(r => (
                <div key={r.t} className="e3-bar-row">
                  <div className="lab"><h3>{r.t}</h3><p>{r.s}</p></div>
                  <div className="bars" role="img" aria-label={`${r.t}: ${r.a.v} before, ${r.b.v} after`}>
                    <div className="bar"><i className="b" style={{ width: `${(r.a.w / 880) * 100}%` }} /><span>{r.a.v}</span></div>
                    <div className="bar"><i className="a" style={{ width: `${(r.b.w / 880) * 100}%` }} /><span className="a">{r.b.v}</span></div>
                  </div>
                </div>
              ))}
            </div>
            <blockquote className="e3-quote mt64" data-reveal>
              <div className="q" aria-hidden="true">“</div>
              <p>Harbor Kim is an exceptionally talented UI/UX designer who made a significant impact at ETO Markets through her outstanding web, CRM, and blog designs. Her work effectively captured the brand's essence, resonated with the target audience, and drove engagement and conversions.</p>
              <footer>Michelle Wang · Global Brand Revitalization, Social Media Strategies</footer>
            </blockquote>
          </div>
        </section>

        {/* Takeaways */}
        <section className="e3-sec e3-night" data-chapter="Takeaways">
          <div className="e3-w">
            <Label light>TAKEAWAYS</Label>
            <h2 className="e3-h2 mt24">Takeaways</h2>
            <ol className="e3-take mt48" data-reveal>
              {TAKEAWAYS.map((t, i) => <li key={i}><span className="n">{String(i + 1).padStart(2, '0')}</span><p>{t}</p></li>)}
            </ol>
            <figure className="mt64" data-reveal>
              <Pic src={IMG.office} w={1440} h={472} alt="The ETO Markets office in Sydney: the ETO Markets logo on a frosted glass wall, two people sketching on a whiteboard in the meeting room behind it" />
              <figcaption className="e3-cap">ETO Markets office, Sydney.</figcaption>
            </figure>
          </div>
        </section>

        <section className="e3-next" id="next">
          <a className="e3-w next-card" href={NEXT.href}>
            <span className="eyebrow">Next case study</span>
            <span className="next-name">{NEXT.name} <span className="go">→</span></span>
          </a>
        </section>
      </main>
    </div>
  )
}

const E3_CSS = `
.e3 { --ink: #000D10; --red: #E31E24; --soft: #FDF2F2; --redline: #F8D6D7; --grey: #616166; --ash: #8E8E95; --line: #E2E2E4; --chip: #F5F5F6; --night: #141213;
  background: #FFFFFF; color: var(--ink); }
.e3 .e3-w { display: block; width: min(1440px, calc(100vw - 64px)); margin: 0 auto; }
.e3 h1, .e3 h2, .e3 h3, .e3 p, .e3 figure, .e3 ol, .e3 ul, .e3 blockquote { margin: 0; padding: 0; }
.e3 ol, .e3 ul { list-style: none; }
.e3 .mt24 { margin-top: 24px; } .e3 .mt32 { margin-top: 32px; } .e3 .mt48 { margin-top: 48px; } .e3 .mt64 { margin-top: 64px; } .e3 .mt120 { margin-top: 120px; }
.e3 .w760 { max-width: 760px; }
.e3 .e3-img { display: block; width: 100%; height: auto; background: #F1F1F2; }

/* type */
.e3 .e3-label { display: flex; align-items: center; gap: 8px; font-size: 16px; line-height: 24px; color: var(--ash); }
.e3 .e3-label i { width: 16px; height: 16px; background: var(--ash); }
.e3 .e3-label.light { color: #99999E; } .e3 .e3-label.light i { background: #99999E; }
.e3 .e3-h2 { font-size: 40px; font-weight: 700; line-height: 48px; color: var(--ink); }
.e3 .e3-rt { flex: none; width: 368px; font-size: 24px; font-weight: 700; line-height: 32px; color: var(--ink); }
.e3 .e3-body { font-size: 18px; line-height: 28px; color: var(--ink); }
.e3 .e3-cap { margin-top: 16px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e3 .k { font-size: 16px; line-height: 24px; font-weight: 500; color: var(--ink); }

/* hero */
.e3 .e3-hero { padding: 120px 0; }
.e3 .e3-brand { display: flex; align-items: center; gap: 16px; font-size: 24px; font-weight: 700; line-height: 32px; }
.e3 .e3-brand img { display: block; width: 48px; height: 48px; }
.e3 .e3-h1 { margin-top: 40px; max-width: 960px; font-size: 64px; font-weight: 700; line-height: 72px; letter-spacing: -0.01em; }
.e3 .e3-sub { margin-top: 40px; max-width: 760px; font-size: 18px; line-height: 28px; }
.e3 .e3-slot { position: relative; margin-top: 40px; aspect-ratio: 16 / 9; }
.e3 .e3-box { position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 40; overflow: hidden; background: ${DARK}; }
/* the film and its control bar: CaseFilm.tsx (Trust Bank's round bar) */
.e3 .e3-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 48px; margin-top: 64px; }
.e3 .e3-meta p { margin-top: 8px; font-size: 18px; line-height: 28px; }

/* sections */
.e3 .e3-sec { padding: 120px 0; }
.e3 .e3-soft { background: var(--soft); }
.e3 .e3-stack64 { display: flex; flex-direction: column; gap: 64px; }
.e3 .e3-row { display: flex; align-items: flex-start; }
.e3 .e3-row > .e3-body, .e3 .e3-row > .e3-impact { flex: 1; min-width: 0; max-width: 960px; }

/* overview impact */
.e3 .e3-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.e3 .e3-stats > div { padding: 8px 24px; border-left: 1px solid var(--line); }
.e3 .e3-stats .n { font-size: 48px; line-height: 56px; color: var(--red); white-space: nowrap; }
.e3 .e3-stats p { margin-top: 8px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e3 .e3-note { margin-top: 24px; font-size: 16px; line-height: 24px; color: var(--grey); }

/* context */
.e3 .e3-life { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; }
.e3 .e3-life li { background: #FFFFFF; padding: 24px; }
.e3 .e3-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 40px; height: 24px; padding: 0 8px; border-radius: 999px !important;
  background: var(--red); color: #FFFFFF; font-size: 16px; font-weight: 600; line-height: 24px; }
.e3 .e3-life h3 { margin-top: 24px; font-size: 20px; font-weight: 700; line-height: 28px; }
.e3 .e3-life p { margin-top: 16px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e3 .e3-users { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.e3 .e3-users > div { background: #FFFFFF; border: 1px solid var(--redline); padding: 32px; }
.e3 .e3-users .kr { font-size: 16px; font-weight: 500; line-height: 24px; color: var(--red); }
.e3 .e3-users h3 { margin-top: 8px; font-size: 24px; font-weight: 700; line-height: 32px; }
.e3 .e3-users p { margin-top: 8px; font-size: 18px; line-height: 28px; }

/* discover */
.e3 .e3-bench { display: grid; grid-template-columns: minmax(0, 496px) minmax(0, 880px); justify-content: space-between; align-items: center; gap: 64px; }
.e3 .e3-bench .e3-rt { width: auto; }
.e3 .e3-three { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }

/* process */
.e3 .e3-phases { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; }
.e3 .e3-phases li { background: #FFFFFF; padding: 24px; }
.e3 .e3-phases .h { font-size: 40px; font-weight: 700; line-height: 48px; color: var(--red); }
.e3 .e3-phases h3 { margin-top: 8px; font-size: 20px; font-weight: 700; line-height: 28px; }
.e3 .e3-phases p { margin-top: 16px; font-size: 16px; line-height: 24px; color: var(--grey); }

/* designer's notes */
.e3 .e3-notes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.e3 .e3-notes li { border-top: 2px solid var(--red); padding-top: 24px; }
.e3 .e3-notes .num { font-size: 16px; font-weight: 600; line-height: 24px; color: var(--red); }
.e3 .e3-notes h3 { margin-top: 16px; font-size: 24px; font-weight: 700; line-height: 32px; }
.e3 .e3-notes p { margin-top: 16px; font-size: 18px; line-height: 28px; }

/* data hierarchy */
.e3 .e3-tiers { display: flex; flex-direction: column; gap: 16px; }
.e3 .e3-tier { display: flex; align-items: center; gap: 48px; padding: 32px; background: #FFFFFF; border: 2px solid transparent; }
.e3 .e3-tier.hot { border-color: var(--red); }
.e3 .e3-tier .lab { flex: none; width: 400px; }
.e3 .e3-tier .tn { font-size: 16px; font-weight: 500; line-height: 24px; color: var(--ash); }
.e3 .e3-tier.hot .tn { color: var(--red); }
.e3 .e3-tier h3 { margin-top: 8px; font-size: 28px; font-weight: 700; line-height: 36px; }
.e3 .e3-tier p { margin-top: 8px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e3 .e3-tier .chips { display: flex; flex-wrap: wrap; gap: 8px; }
.e3 .e3-tier .chips li { padding: 8px 16px; border-radius: 999px !important; background: var(--chip); border: 1px solid var(--line); font-size: 16px; line-height: 24px; }
.e3 .e3-tier.hot .chips li { background: var(--soft); border-color: var(--redline); color: var(--red); font-weight: 500; }
.e3 .e3-rules { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.e3 .e3-rules > div { background: #FFFFFF; padding: 24px; }
.e3 .e3-rules h3 { font-size: 18px; font-weight: 700; line-height: 28px; }
.e3 .e3-rules p { margin-top: 8px; font-size: 16px; line-height: 24px; color: var(--grey); }

/* before / after */
.e3 .e3-ba { display: flex; flex-direction: column; gap: 96px; }

/* prototype */
.e3 .e3-links { display: flex; flex-wrap: wrap; gap: 16px; }
.e3 .e3-links a { display: inline-flex; align-items: center; height: 48px; padding: 0 24px; background: var(--ink); color: #FFFFFF; font-size: 16px; font-weight: 500; text-decoration: none; }
.e3 .e3-links a:hover { background: var(--red); }

/* results */
.e3 .e3-legend { display: flex; gap: 24px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e3 .e3-legend span { display: inline-flex; align-items: center; gap: 8px; }
.e3 .e3-legend i, .e3 .e3-bars i { display: block; background: #C8C8CC; }
.e3 .e3-legend i { width: 16px; height: 16px; }
.e3 .e3-legend i.a, .e3 .e3-bars i.a { background: var(--red); }
.e3 .e3-bars { display: flex; flex-direction: column; gap: 32px; }
.e3 .e3-bar-row { display: flex; align-items: flex-start; }
.e3 .e3-bar-row .lab { flex: none; width: 368px; }
.e3 .e3-bar-row h3 { font-size: 18px; font-weight: 700; line-height: 28px; }
.e3 .e3-bar-row .lab p { font-size: 16px; line-height: 24px; color: var(--grey); }
.e3 .e3-bar-row .bars { flex: 1; min-width: 0; max-width: 960px; display: flex; flex-direction: column; gap: 8px; }
.e3 .e3-bar-row .bar { display: flex; align-items: center; gap: 16px; padding-right: 64px; }
.e3 .e3-bar-row .bar i { height: 24px; transform-origin: left center; transition: transform 1s var(--ease3, cubic-bezier(.22,1,.36,1)); }
.e3 .e3-bars:not(.in) .bar i { transform: scaleX(0); }
.e3 .e3-bar-row .bar span { flex: none; margin-right: -64px; font-size: 16px; font-weight: 600; line-height: 24px; color: var(--grey); }
.e3 .e3-bar-row .bar span.a { color: var(--red); }
.e3 .e3-quote { background: var(--soft); padding: 48px; }
.e3 .e3-quote .q { font-size: 64px; font-weight: 700; line-height: 48px; color: var(--red); }
.e3 .e3-quote p { margin-top: 16px; font-size: 24px; line-height: 36px; }
.e3 .e3-quote footer { margin-top: 24px; font-size: 16px; line-height: 24px; color: var(--grey); }

/* takeaways */
.e3 .e3-night { background: var(--night); color: #FFFFFF; }
.e3 .e3-night .e3-h2 { color: #FFFFFF; }
.e3 .e3-night .e3-cap { color: #99999E; }
.e3 .e3-take li { display: flex; align-items: flex-start; padding: 32px 0; border-top: 1px solid rgba(255,255,255,.16); }
.e3 .e3-take .n { flex: none; width: 368px; font-size: 20px; font-weight: 600; line-height: 36px; color: var(--red); }
.e3 .e3-take p { flex: 1; min-width: 0; max-width: 960px; font-size: 24px; line-height: 36px; color: #FFFFFF; }

/* next case study */
.e3 .e3-next { background: var(--off, #F5F5F2); }
.e3 .e3-next .next-card { display: flex; flex-direction: column; gap: 16px; padding: 140px 0; color: var(--ink); text-decoration: none; }
.e3 .e3-next .next-name { font-size: clamp(56px, 6vw, 112px); font-weight: 300; letter-spacing: -0.04em; line-height: 1; transition: transform .3s ease-out; }
.e3 .e3-next .next-card:hover .next-name { transform: translateX(8px); }

/* square corners on images, video and cards (site rule); badges and chips above keep their pill shape */
.e3 img, .e3 video, .e3 figure, .e3 .e3-box, .e3 .e3-life li, .e3 .e3-users > div, .e3 .e3-phases li, .e3 .e3-tier, .e3 .e3-rules > div, .e3 .e3-quote, .e3 .e3-links a { border-radius: 0; }

@media (max-width: 1280px) {
  .e3 .e3-rt, .e3 .e3-bar-row .lab { width: 280px; }
  .e3 .e3-tier .lab { width: 320px; }
  .e3 .e3-take .n { width: 280px; }
  .e3 .e3-life, .e3 .e3-phases { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .e3 .e3-rules { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 1023px) {
  .e3 .e3-row, .e3 .e3-bar-row { flex-direction: column; gap: 16px; }
  .e3 .e3-rt, .e3 .e3-bar-row .lab { width: auto; }
  .e3 .e3-bar-row .bars { width: 100%; }
  .e3 .e3-bench { grid-template-columns: minmax(0, 1fr); gap: 40px; }
  .e3 .e3-tier { flex-direction: column; align-items: flex-start; gap: 24px; }
  .e3 .e3-tier .lab { width: auto; }
  .e3 .e3-take .n { width: 64px; }
  .e3 .e3-notes, .e3 .e3-three { grid-template-columns: minmax(0, 1fr); gap: 40px; }
  .e3 .e3-life, .e3 .e3-phases, .e3 .e3-users { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 700px) {
  .e3 .e3-w { width: calc(100vw - 40px); }
  .e3 .e3-hero { padding: 104px 0 88px; }
  .e3 .e3-h1 { font-size: 40px; line-height: 48px; }
  .e3 .e3-sec { padding: 88px 0; }
  .e3 .e3-h2 { font-size: 32px; line-height: 40px; }
  .e3 .mt120 { margin-top: 88px; }
  .e3 .e3-meta, .e3 .e3-stats, .e3 .e3-life, .e3 .e3-phases, .e3 .e3-users, .e3 .e3-rules { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .e3 .e3-meta { gap: 24px; }
  .e3 .e3-stats { gap: 24px; }
  .e3 .e3-stats .n { font-size: 40px; line-height: 48px; }
  .e3 .e3-tier { padding: 24px; }
  .e3 .e3-quote { padding: 32px 24px; }
  .e3 .e3-quote p, .e3 .e3-take p { font-size: 20px; line-height: 32px; }
  .e3 .e3-take li { gap: 16px; }
  .e3 .e3-ba { gap: 64px; }
}
@media (prefers-reduced-motion: reduce) {
  .e3 [data-reveal] { opacity: 1 !important; transform: none !important; transition: none !important; }
  .e3 .e3-bars .bar i { transform: none !important; transition: none !important; }
}
`
