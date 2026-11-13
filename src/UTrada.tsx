import React, { useEffect } from 'react'
import { CSS, IMG3 } from './portfolio'
import { SideToc, useHeadroom } from './CaseNav'
import { SiteHeaderB } from './SiteHeaderB'

// Case-study skeletons for Harbor to fill in herself: UTrada (#/utrada) and, since v117, ETO Markets (#/eto-markets) —
// Harbor's Figma "05 UTrada — 1920" (706:2) and "06 ETO Markets — 1920" (778:2) share one layout, so both pages are
// the same component with their own data (UT, ETO below).
// Text starting with "TBD" is a placeholder and shows in grey italics; replace it. Each `shots` number is how many
// image placeholder boxes that section shows. Swap boxes for real images by giving the section
// `images: [{ src, alt }]` instead.
// Header: the site header every page uses (SiteHeaderB.tsx, 'light' mode) — it slides away on scroll down and back on
// scroll up (useHeadroom). The process contents on the left side (CaseNav.tsx), the "Next case study" card, then the
// site footer (index.tsx). Order of "Next case study" (Figma): UTrada → ETO Markets → Trust Bank.
// Type: Roboto (index.css), nothing under 16px.

type Section = { id: string; name: string; title: string; body: string[]; shots?: number; images?: { src: string; alt: string }[] }
type CaseData = {
  key: string
  title: string
  line: string
  meta: { k: string; v: string }[]
  mark: { src: string; fit?: 'cover' }
  cover: { src: string; alt: string; ratio?: string }
  sections: Section[]
  next: { name: string; href: string }
}

const UTRADA_SVG = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="4" fill="url(#ut)"/><path d="M20.8137 12L20.7642 12.2773L19.0159 22.2134C18.4395 25.4849 15.3129 28.1484 12.0457 28.1484C10.4635 28.1484 9.07577 27.5308 8.13822 26.4127C7.17956 25.2689 6.80943 23.747 7.09286 22.1315L8.87681 12H9.07354C9.73433 12 10.3156 12.2606 10.7074 12.7278C11.1081 13.2073 11.2626 13.841 11.1454 14.5153L9.79101 22.2134C9.63596 23.0871 9.83325 23.9046 10.344 24.5149C10.843 25.1118 11.5861 25.4382 12.4391 25.4382C14.2581 25.4382 15.9993 23.9564 16.3205 22.1315L17.6754 14.4329C17.9099 13.092 19.1943 12 20.5347 12H20.8137Z" fill="white"/><path d="M32.6067 12L32.131 14.7102H27.9095L25.5448 28.1484H22.8328L25.198 14.7102H20.9766L21.4551 12H32.6067Z" fill="white"/><defs><linearGradient id="ut" x1="40" y1="20" x2="0" y2="20" gradientUnits="userSpaceOnUse"><stop stop-color="#872ADF"/><stop offset="1" stop-color="#38029D"/></linearGradient></defs></svg>`
const UTRADA_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(UTRADA_SVG)}`
export const ETO_IMG = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/'

const UT: CaseData = {
  key: 'ut',
  title: 'UTrada',
  line: 'Product design for a trading platform.',
  meta: [
    { k: 'Role', v: 'TBD — your role' },
    { k: 'Timeline', v: '2024 – 2026' },
    { k: 'Team', v: 'TBD — who you worked with' },
    { k: 'Tools', v: 'TBD — e.g. Figma' },
  ],
  mark: { src: UTRADA_ICON },
  cover: { src: IMG3 + 'utrada-screens.webp', alt: 'UTrada website screens: home, features, forex table and join flow' },
  sections: [
    { id: 'overview', name: 'Overview', title: 'TBD — One sentence on what UTrada is and what you owned.', body: ['TBD — The product, who uses it, and where you came in.'] },
    { id: 'problem', name: 'Problem', title: 'TBD — The problem in one line.', body: ['TBD — What was wrong, who it hurt, and how you knew.'], shots: 1 },
    { id: 'process', name: 'Process', title: 'TBD — How you worked.', body: ['TBD — Research, decisions and trade-offs, step by step.'], shots: 2 },
    { id: 'system', name: 'Design system', title: 'TBD — The design system.', body: ['TBD — Tokens, components and how the team used them.'], shots: 2 },
    { id: 'screens', name: 'Key screens', title: 'TBD — The screens that matter most.', body: ['TBD — One line per screen: what it does and why it looks this way.'], shots: 4 },
    { id: 'results', name: 'Results', title: 'TBD — What changed.', body: ['TBD — Numbers or feedback, and where they came from.'] },
    { id: 'reflection', name: 'Reflection', title: 'TBD — What you learned.', body: ['TBD — What you would do differently next time.'] },
  ],
  // Figma 706:101 (v117): UTrada now leads to ETO Markets
  next: { name: 'ETO Markets', href: '#/eto-markets' },
}

// Figma "06 ETO Markets — 1920" (778:2), copy exactly as in the frame. The mark and the cover are the frame's ETO image
// (one 800×800 picture, filled into a 56×56 square and a 1318×736 cover, as in Figma).
const ETO: CaseData = {
  key: 'eto',
  title: 'ETO Markets',
  line: 'A CRM dashboard for a Sydney-based trading broker.',
  meta: [
    { k: 'Role', v: 'TBD — your role' },
    { k: 'Timeline', v: 'Nov 2022 – Sep 2023' },
    { k: 'Team', v: 'TBD — who you worked with' },
    { k: 'Tools', v: 'TBD — e.g. Figma' },
  ],
  mark: { src: ETO_IMG + 'eto-cover.jpg', fit: 'cover' },
  cover: { src: ETO_IMG + 'eto-cover.jpg', alt: 'The ETO Markets logo on red', ratio: '1318 / 736' },
  sections: [
    { id: 'overview', name: 'Overview', title: 'TBD — What the CRM is for, who uses it every day, and what you owned.', body: ['TBD — ETO Markets, the team using the CRM (e.g. sales, support, account managers), and where you came in.'] },
    { id: 'problem', name: 'Problem', title: 'TBD — The problem in one line.', body: ['TBD — What made the old CRM hard to use, and how you knew.'], shots: 1 },
    { id: 'process', name: 'Process', title: 'TBD — How you worked.', body: ['TBD — Which data the team needed, how you chose what to show first, and the trade-offs.'], shots: 2 },
    { id: 'system', name: 'Design system', title: 'TBD — The dashboard system.', body: ['TBD — Charts, tables, filters and empty states, and the rules behind them.'], shots: 2 },
    { id: 'screens', name: 'Key screens', title: 'TBD — The screens that matter most.', body: ['TBD — e.g. overview, client list, client profile. One line each: what it does and why.'], shots: 4 },
    { id: 'results', name: 'Results', title: 'TBD — What changed.', body: ['TBD — Numbers or feedback, and where they came from.'] },
    { id: 'reflection', name: 'Reflection', title: 'TBD — What you learned.', body: ['TBD — What you would do differently next time.'] },
  ],
  next: { name: 'Trust Bank', href: '#/trust-bank' },
}

const tbd = (t: string) => (t.startsWith('TBD') ? 'tbd' : undefined)

function CaseSkeleton({ d }: { d: CaseData }) {
  const away = useHeadroom()
  const chapters = d.sections.map(s => s.name)

  useEffect(() => { scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior }) }, [])

  // scroll reveals
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.ut [data-reveal]'))
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [])

  return (
    <div className={'hb ut ' + d.key}>
      <style>{CSS + UT_CSS}</style>

      <SiteHeaderB mode="light" away={away} />

      <SideToc chapters={chapters} scope=".ut" />

      <main id="top">
        <section className="ut-hero" aria-label={d.title}>
          <div className="wrap">
            <img className={'ut-mark' + (d.mark.fit ? ' fit' : '')} src={d.mark.src} alt="" width={56} height={56} />
            <h1>{d.title}</h1>
            <p className="ut-line">{d.line}</p>
            <dl className="ut-meta">
              {d.meta.map(m => (
                <div key={m.k}><dt>{m.k}</dt><dd className={tbd(m.v)}>{m.v}</dd></div>
              ))}
            </dl>
          </div>
        </section>

        <figure className={'ut-cover' + (d.cover.ratio ? ' fit' : '')} data-reveal
          style={d.cover.ratio ? { aspectRatio: d.cover.ratio } : undefined}>
          <img src={d.cover.src} alt={d.cover.alt} />
        </figure>

        {d.sections.map((s, i) => (
          <section key={s.id} className="ut-sec" id={s.id} data-chapter={s.name} aria-labelledby={`${d.key}-${s.id}`}>
            <div className="wrap ut-grid">
              <div className="ut-side">
                <div className="eyebrow">({String(i + 1).padStart(2, '0')}) {s.name}</div>
              </div>
              <div className="ut-main" data-reveal>
                <h2 id={`${d.key}-${s.id}`} className={tbd(s.title)}>{s.title}</h2>
                <div className="ut-body">{s.body.map((p, j) => <p key={j} className={tbd(p)}>{p}</p>)}</div>
                {s.images?.length ? (
                  <div className={'ut-shots n' + Math.min(s.images.length, 2)}>
                    {s.images.map((im, j) => <img key={j} src={im.src} alt={im.alt} loading="lazy" />)}
                  </div>
                ) : s.shots ? (
                  <div className={'ut-shots n' + Math.min(s.shots, 2)}>
                    {Array.from({ length: s.shots }, (_, j) => <div key={j} className="ut-ph">Image {j + 1}</div>)}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ))}

        <section className="next" id="next">
          <a className="wrap next-card" href={d.next.href}>
            <span className="eyebrow">Next case study</span>
            <span className="next-name">{d.next.name} <span className="go">→</span></span>
          </a>
        </section>
      </main>
    </div>
  )
}

export function UTrada() { return <CaseSkeleton d={UT} /> }
export function EtoMarkets() { return <CaseSkeleton d={ETO} /> }

const UT_CSS = `
.ut { background: #fff; }

/* placeholders: grey italics until Harbor fills them in */
.ut .tbd { color: #9A9A97; font-style: italic; }

/* hero */
.ut-hero { padding: 184px 0 80px; }
.ut-mark { display: block; width: 56px; height: 56px; }
.ut-mark.fit { object-fit: cover; }
.ut-hero h1 { margin: 28px 0 0; font-size: clamp(64px, 7vw, 120px); font-weight: 300; line-height: 1; letter-spacing: -0.04em; }
.ut-line { margin: 20px 0 0; font-size: 28px; font-weight: 300; color: #8C8C8A; }
.ut-meta { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; margin: 64px 0 0; padding-top: 24px; border-top: 1px solid var(--line); }
.ut-meta dt { font-size: 16px; color: var(--mute); }
.ut-meta dd { margin: 8px 0 0; font-size: 18px; line-height: 1.4; }

.ut-cover { width: var(--wrap); margin: 0 auto 40px; border: 1px solid var(--line); overflow: hidden; background: var(--off); }
.ut-cover img { display: block; width: 100%; height: auto; }
/* a cover with a set frame (ETO): the picture fills it, like Figma's Fill */
.ut-cover.fit img { height: 100%; object-fit: cover; }

/* sections */
.ut-sec { padding: 120px 0; border-top: 1px solid var(--line); }
.ut-grid { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 80px; }
.ut-side { position: sticky; top: 112px; align-self: start; }
.ut-main h2 { margin: 0; font-size: 44px; font-weight: 300; line-height: 1.15; letter-spacing: -0.02em; }
.ut-body { margin-top: 28px; max-width: 760px; }
.ut-body p { margin: 0 0 18px; font-size: 20px; line-height: 1.6; }
.ut-shots { display: grid; gap: 16px; margin-top: 40px; }
.ut-shots.n2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.ut-shots img { display: block; width: 100%; height: auto; border: 1px solid var(--line); }
.ut-ph { aspect-ratio: 16 / 10; display: grid; place-items: center; border: 1px dashed #C9C9C6; background: var(--off); color: #8C8C8A; font-size: 16px; }
.ut-shots.n1 .ut-ph { aspect-ratio: 16 / 9; }

/* next project */
.ut .next { background: var(--off); }
.ut .next-card { display: flex; flex-direction: column; gap: 16px; padding: 140px 0; }
.ut .next-name { font-size: clamp(56px, 6vw, 112px); font-weight: 300; letter-spacing: -0.04em; line-height: 1; transition: transform .3s ease-out; }
.ut .next-card:hover .next-name { transform: translateX(8px); }

@media (max-width: 900px) {
  .ut-hero { padding-top: 136px; }
  .ut-line { font-size: 22px; }
  .ut-meta { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ut-sec { padding: 80px 0; }
  .ut-grid { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .ut-side { position: static; }
  .ut-main h2 { font-size: 32px; }
  .ut-body p { font-size: 18px; }
  .ut-shots.n2 { grid-template-columns: minmax(0, 1fr); }
}
`
