import React, { useEffect, useRef, useState } from 'react'
import { CSS, IMG } from './portfolio'
import { PAGE_CSS, LINKS, SiteHeader, SiteFooter, ClosingCTA, VoiceAssistant, useReveal } from './App'

// About me page.
// Top: a gallery laid out like accordion.net.au/work (Harbor's reference) — a filter list on the left (ALL / WORK / DRAWING /
// TRAVEL with counts), a LIST / GRID switch at the bottom left, the photos stacked down the middle with a small label and
// a large title over each, and a thumbnail index on the right that follows the scroll (the current one in colour,
// marked with + on both sides; click to jump). GRID shows the same photos three across; pointing at one turns the
// others grey and shows its title; clicking it opens it in the list.
// Type stays Helvetica Neue (Harbor's rule) and every text is 16px or larger, so the labels are bigger than the reference's.
// Copy comes from Portfolio_1's About page (statement, Fine Art → UX, what I do now, travel and sketching) and the
// captions this page already had. Photos: only the ones large enough to show big (600–900px); the small collage shots
// from Portfolio_1 (117–440px) would blur at this size.
// The red panda drawing (last item) was removed at Harbor's request (Nov 9), so the gallery has six photos.
// Below the gallery, from Experience down, nothing changed (Harbor's note).

const SUB_CSS = `
.sub-page { background: #fff; }
.sub-ctas { display: flex; gap: 12px; margin-top: 40px; flex-wrap: wrap; }
.btn-ink { background: var(--ink); color: #fff; font-weight: 500; }
.hb .btn-ink { color: #fff; }
.btn-ink:hover { background: #333; }
.btn-line { border: 1px solid var(--ink); color: var(--ink); }
.btn-line:hover { background: var(--ink); color: #fff; }

/* filter tabs */
.filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 40px; }
.filters button { padding: 10px 18px; border: 1px solid var(--line); background: #fff; font-size: 16px; color: var(--mute); cursor: pointer; transition: background .25s, color .25s, border-color .25s; }
.filters button:hover { color: var(--ink); border-color: var(--ink); }
.filters button[aria-pressed="true"] { background: var(--ink); color: #fff; border-color: var(--ink); }
.filters .count { margin-left: 6px; opacity: .6; }

/* work grid (rox team) */
.wgrid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
.wcard { border: 1px solid var(--line); background: #fff; display: flex; flex-direction: column; }
.wcard .logo-box { aspect-ratio: 1 / 1; overflow: hidden; background: var(--off); border-bottom: 1px solid var(--line); display: grid; place-items: center; }
.wcard .logo-box img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 1s var(--ease); }
.wcard:hover .logo-box img { transform: scale(1.04); }
.wcard .logo-box .tile { font-size: 32px; font-weight: 300; color: #8C8C8A; }
.wcard .body { padding: 20px 20px 24px; }
.wcard h3 { margin: 12px 0 0; font-size: 24px; font-weight: 500; }
.wcard p { margin: 6px 0 0; font-size: 16px; color: var(--mute); }
.wcard .period { margin-top: 16px; font-size: 16px; }
.wcard.hide { display: none; }

/* mid CTA band */
.band { background: var(--off); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.band-in { display: flex; justify-content: space-between; align-items: center; gap: 40px; padding: 96px 0; }
.band h2 { margin: 0; font-size: 44px; font-weight: 300; letter-spacing: -0.02em; line-height: 1.15; }
.band h2 .mute { color: #8C8C8A; display: block; }

/* background cards (rox advisors) */
.bgrid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
.bcard { padding: 32px 28px 40px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); min-height: 260px; display: flex; flex-direction: column; }
.bcard .n { font-size: 16px; color: #8C8C8A; }
.bcard .big { margin-top: auto; font-size: 44px; font-weight: 300; letter-spacing: -0.03em; }
.bcard .t { margin-top: 8px; font-size: 18px; font-weight: 500; }
.bcard .s { margin-top: 6px; font-size: 16px; line-height: 1.5; color: var(--mute); }

.tools { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 40px; }

@media (max-width: 1280px) {
  .wgrid, .bgrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .wgrid, .bgrid { grid-template-columns: minmax(0, 1fr); }
  .band-in { flex-direction: column; align-items: flex-start; }
  .band h2 { font-size: 32px; }
}
`

/* ------------------------------------------------------------------ gallery (accordion.net.au/work layout) */

const AB_CSS = `
.hb .ab { background: #fff; padding: 112px 0 40px; }
.hb .ab-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr) 120px; gap: 24px; width: min(1440px, calc(100vw - 48px)); margin: 0 auto; }
.hb .ab-side { position: relative; }
.hb .ab-side-in { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; justify-content: center; }
.hb .ab-filters, .hb .ab-view { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; list-style: none; }
.hb .ab-view { position: absolute; left: 0; bottom: 28px; flex-direction: row; gap: 20px; }
.hb .ab-opt { display: inline-flex; align-items: center; gap: 8px; padding: 0; margin: 0; background: none; border: 0; cursor: pointer;
  font-size: 16px; line-height: 1.3; letter-spacing: .05em; text-transform: uppercase; color: #B3B3B0; transition: color .2s; }
.hb .ab-opt:hover, .hb .ab-opt[aria-pressed="true"] { color: var(--ink); }
.hb .ab-opt .sq { width: 8px; height: 8px; background: currentColor; opacity: 0; transition: opacity .2s; }
.hb .ab-opt[aria-pressed="true"] .sq { opacity: 1; }
.hb .ab-opt .n { color: #B3B3B0; letter-spacing: 0; }

/* list: photos down the middle, label + title over each */
.hb .ab-list { display: flex; flex-direction: column; gap: 8px; width: min(720px, 100%); margin: 0 auto; }
.hb .ab-item { position: relative; overflow: hidden; background: #111; scroll-margin-top: 96px; }
.hb .ab-item img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 1.4s var(--ease); }
.hb .ab-item:hover img { transform: scale(1.02); }
.hb .ab-item::after { content: ""; position: absolute; inset: 0; background: rgba(0,0,0,.36); pointer-events: none; }
.hb .ab-cap { position: absolute; z-index: 1; left: 0; right: 0; top: 50%; transform: translateY(-50%); padding: 0 40px; text-align: center; color: #fff; }
.hb .ab-cap .k { font-size: 16px; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.9); }
.hb .ab-cap h2 { margin: 12px 0 0; font-size: clamp(40px, 4vw, 64px); font-weight: 300; line-height: 1.05; letter-spacing: -0.03em; }
.hb .ab-cap p { margin: 18px auto 0; max-width: 470px; font-size: 18px; line-height: 1.5; color: rgba(255,255,255,.88); }

/* thumbnail index on the right */
.hb .ab-thumbs { position: relative; }
.hb .ab-thumbs-in { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: flex-end; gap: 6px; padding-right: 22px; }
.hb .ab-thumb { position: relative; display: block; width: 40px; height: 48px; padding: 0; border: 0; background: #eee; cursor: pointer; transition: width .3s var(--ease), height .3s var(--ease); }
.hb .ab-thumb img { display: block; width: 100%; height: 100%; object-fit: cover; filter: grayscale(1); opacity: .75; transition: filter .3s, opacity .3s; }
.hb .ab-thumb:hover img { opacity: 1; }
.hb .ab-thumb.on { width: 54px; height: 64px; }
.hb .ab-thumb.on img { filter: none; opacity: 1; }
.hb .ab-thumb.on::before, .hb .ab-thumb.on::after { content: "+"; position: absolute; top: 50%; transform: translateY(-50%); font-size: 16px; line-height: 1; color: var(--ink); }
.hb .ab-thumb.on::before { left: -18px; }
.hb .ab-thumb.on::after { right: -18px; }

/* grid: three across; pointing at one greys the rest and shows its title */
.hb .ab-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.hb .ab-card { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; padding: 0; margin: 0; border: 0; overflow: hidden; background: #eee; cursor: pointer; text-align: left; }
.hb .ab-card img { display: block; width: 100%; height: 100%; object-fit: cover; transition: filter .4s, transform 1s var(--ease); }
.hb .ab-grid:hover .ab-card:not(:hover) img { filter: grayscale(1); }
.hb .ab-card:hover img { transform: scale(1.02); }
.hb .ab-card .cc { position: absolute; left: 0; right: 0; bottom: 0; padding: 12px 14px 14px; background: #fff; color: var(--ink); transform: translateY(101%); transition: transform .35s var(--ease); }
.hb .ab-card:hover .cc, .hb .ab-card:focus-visible .cc { transform: none; }
.hb .ab-card .cc .t { display: block; font-size: 20px; line-height: 1.2; letter-spacing: -0.01em; }
.hb .ab-card .cc .k { display: block; margin-top: 4px; font-size: 16px; letter-spacing: .05em; text-transform: uppercase; color: var(--mute); }

@media (max-width: 1100px) {
  .hb .ab-layout { grid-template-columns: 180px minmax(0, 1fr) 96px; }
}
@media (max-width: 900px) {
  .hb .ab { padding-top: 104px; }
  .hb .ab-layout { grid-template-columns: minmax(0, 1fr); width: calc(100vw - 32px); gap: 0; }
  .hb .ab-side-in { position: static; height: auto; flex-direction: row; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px 20px; margin-bottom: 20px; }
  .hb .ab-filters { flex-direction: row; flex-wrap: wrap; gap: 8px 16px; }
  .hb .ab-view { position: static; }
  .hb .ab-thumbs { display: none; }
  .hb .ab-cap { padding: 0 20px; }
  .hb .ab-cap p { font-size: 16px; }
  .hb .ab-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
`

const A = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/about/'
const V = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/6a56c6411f5a62474ed739e5fb9b361e0733428b/assets/about/v2/'

type Cat = 'Work' | 'Drawing' | 'Travel'
type Item = { id: string; cat: Cat; src: string; ratio: string; pos?: string; label: string; title: string; notes?: string[]; alt: string }

// Copy: Portfolio_1 About (statement, Fine Art → UX, what I do now, travel line) and this page's earlier captions.
const ITEMS: Item[] = [
  {
    id: 'about', cat: 'Work', src: A + 'film-fintech.jpg', ratio: '4 / 3', pos: '50% 40%',
    label: 'About me', title: 'Harbor Kim',
    notes: [
      'I’m an AI-native product designer who owns the work end to end, from finding the problem to shipping the fix.',
      'I’ve spent 3+ years on fintech and e-learning: trading platforms, digital banking, crypto wallets and data dashboards.',
    ],
    alt: 'Harbor at work with her laptop',
  },
  {
    id: 'fine-art', cat: 'Drawing', src: V + 'fineart-exhibition.jpg', ratio: '4 / 5', pos: '50% 35%',
    label: 'Where I started', title: 'Fine Art',
    notes: ['I started in Fine Art, painting what I saw. I loved it, but I wanted to make things everyone can use. That brought me to UX.'],
    alt: 'Harbor at her Fine Art exhibition, in front of her watercolour paintings',
  },
  {
    id: 'now', cat: 'Work', src: V + 'sticky-wall.jpg', ratio: '4 / 5', pos: '30% 45%',
    label: 'What I do now', title: 'Fintech, end to end',
    notes: ['Now I design fintech products, end to end. I test everything with real people.'],
    alt: 'Harbor sorting sticky notes on a research wall',
  },
  {
    id: 'abroad', cat: 'Travel', src: A + 'film-places.jpg', ratio: '4 / 3',
    label: 'Australia · UK', title: 'Lived and worked abroad',
    notes: ['Off the clock, I travel and sketch the places I visit.'],
    alt: 'Harbor at afternoon tea, by Sydney Harbour and on the cliffs by the sea',
  },
  {
    id: 'on-location', cat: 'Drawing', src: A + 'drawing-1.jpg', ratio: '4 / 5',
    label: 'Off the clock', title: 'Sketching on location',
    alt: 'A pencil sketch of a tree, held up in front of the place it was drawn',
  },
  {
    id: 'what-i-see', cat: 'Drawing', src: A + 'drawing-3.jpg', ratio: '1 / 1',
    label: 'Off the clock', title: 'Drawing what I see',
    alt: 'A watercolour sketch held up in front of the street it shows',
  },
]
const CATS: ('All' | Cat)[] = ['All', 'Work', 'Drawing', 'Travel']

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

function Gallery() {
  const [cat, setCat] = useState<'All' | Cat>('All')
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [active, setActive] = useState(ITEMS[0].id)
  const sec = useRef<HTMLElement>(null)
  const items = cat === 'All' ? ITEMS : ITEMS.filter(i => i.cat === cat)
  const count = (c: 'All' | Cat) => (c === 'All' ? ITEMS.length : ITEMS.filter(i => i.cat === c).length)
  useReveal(`${cat}-${view}`)

  // the photo in the middle of the screen is the current one in the thumbnail index
  useEffect(() => {
    if (view !== 'list' || !('IntersectionObserver' in window)) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('.ab-item'))
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.id || '') }), { rootMargin: '-45% 0px -54% 0px' })
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [cat, view])

  // a new filter or view starts from the top of the gallery
  const toTop = () => {
    const s = sec.current
    if (s && s.getBoundingClientRect().top < 0) scrollTo({ top: s.offsetTop, behavior: 'auto' })
  }
  const pickCat = (c: 'All' | Cat) => { setCat(c); setActive((c === 'All' ? ITEMS : ITEMS.filter(i => i.cat === c))[0]?.id ?? ''); toTop() }
  const pickView = (v: 'list' | 'grid') => { setView(v); toTop() }
  const goTo = (id: string) => {
    const el = document.querySelector<HTMLElement>(`.ab-item[data-id="${id}"]`)
    el?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }
  const openFromGrid = (id: string) => {
    setView('list')
    setActive(id)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`.ab-item[data-id="${id}"]`)
      el?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }))
  }

  return (
    <section className="ab" ref={sec} aria-label="About me">
      <h1 className="sr-only">About me</h1>
      <div className="ab-layout">
        <aside className="ab-side">
          <div className="ab-side-in">
            <ul className="ab-filters" aria-label="Filter photos">
              {CATS.map(c => (
                <li key={c}>
                  <button type="button" className="ab-opt" aria-pressed={cat === c} onClick={() => pickCat(c)}>
                    <span className="sq" aria-hidden="true" />{c === 'All' ? 'All' : c}{c !== 'All' && <span className="n">({count(c)})</span>}
                  </button>
                </li>
              ))}
            </ul>
            <div className="ab-view" role="group" aria-label="View">
              {(['list', 'grid'] as const).map(v => (
                <button key={v} type="button" className="ab-opt" aria-pressed={view === v} onClick={() => pickView(v)}>
                  <span className="sq" aria-hidden="true" />{v}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          {view === 'list' ? (
            <div className="ab-list">
              {items.map(it => (
                <article key={it.id} className="ab-item" data-id={it.id} data-reveal style={{ aspectRatio: it.ratio }}>
                  <img src={it.src} alt={it.alt} loading="lazy" style={it.pos ? { objectPosition: it.pos } : undefined} />
                  <div className="ab-cap">
                    <div className="k">{it.label}</div>
                    <h2>{it.title}</h2>
                    {it.notes?.map((n, i) => <p key={i}>{n}</p>)}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="ab-grid">
              {items.map((it, i) => (
                <button key={it.id} type="button" className="ab-card" data-reveal style={{ '--d': i % 3 } as React.CSSProperties} onClick={() => openFromGrid(it.id)} aria-label={`${it.title}, ${it.label}`}>
                  <img src={it.src} alt="" loading="lazy" style={it.pos ? { objectPosition: it.pos } : undefined} />
                  <span className="cc" aria-hidden="true"><span className="t">{it.title}</span><span className="k">{it.label}</span></span>
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="ab-thumbs" aria-label="Photo index">
          {view === 'list' && (
            <div className="ab-thumbs-in">
              {items.map(it => (
                <button key={it.id} type="button" className={'ab-thumb' + (active === it.id ? ' on' : '')} aria-label={it.title} aria-current={active === it.id || undefined} onClick={() => goTo(it.id)}>
                  <img src={it.src} alt="" loading="lazy" style={it.pos ? { objectPosition: it.pos } : undefined} />
                </button>
              ))}
            </div>
          )}
        </nav>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ Experience and below (unchanged) */

const WORK = [
  { co: 'UTrada', domain: 'Trading / fintech platform', period: '2024 – 2026', tag: 'Fintech', img: IMG + 'utrada-logo-square.jpg' },
  { co: 'ETO Markets', domain: 'Trading / fintech · Sydney', period: 'Nov 2022 – Sep 2023', tag: 'Fintech', img: IMG + 'eto-markets-logo-square.jpg' },
  { co: 'Pinetree', domain: 'E-learning · Korea', period: 'Aug 2021 – Jun 2022', tag: 'E-learning', img: IMG + 'pinetree.webp' },
  { co: 'Freelance', domain: 'Upwork & Fiverr clients', period: 'Ongoing', tag: 'Freelance', tile: 'Upwork · Fiverr' },
]
const WORK_FILTERS = ['All', 'Fintech', 'E-learning', 'Freelance']

const BACKGROUND = [
  { big: 'Fine Art', t: 'Where I started', s: 'I trained in Fine Art, drawing what I saw. Observation is still where every project starts.' },
  { big: '3+ yrs', t: 'Product design', s: 'Fintech, crypto / Web3 wallets, digital banking and e-learning.' },
  { big: '11', t: 'Languages', s: 'Multilingual and localised product design in up to 11 languages.' },
  { big: 'AU · UK', t: 'Lived and worked abroad', s: 'Experience living and working in Australia and the UK.' },
]
const TOOLS = ['Figma', 'Design systems', 'Prototyping', 'UX research', 'Usability testing', 'Localization', 'AI design tools']

export function AboutPage() {
  const [f, setF] = useState('All')
  useReveal()

  return (
    <div className="hb sub-page" id="top">
      <style>{CSS + PAGE_CSS + SUB_CSS + AB_CSS}</style>
      <SiteHeader current="about" solid />
      <main>
        <Gallery />

        <section className="sec" aria-label="Where I've worked">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <div>
                <div className="eyebrow">(01) Experience</div>
                <h2 className="h2">Where I’ve worked</h2>
              </div>
            </div>
            <div className="filters" role="group" aria-label="Filter experience" data-reveal>
              {WORK_FILTERS.map(k => <button key={k} aria-pressed={f === k} onClick={() => setF(k)}>{k}</button>)}
            </div>
            <div className="wgrid">
              {WORK.map((w, i) => (
                <article className={'wcard' + (f !== 'All' && w.tag !== f ? ' hide' : '')} key={w.co} data-reveal style={{ '--d': i } as React.CSSProperties}>
                  <div className="logo-box">{w.img ? <img src={w.img} alt={w.co} loading="lazy" /> : <span className="tile">{w.tile}</span>}</div>
                  <div className="body">
                    <span className="tag">{w.tag}</span>
                    <h3>{w.co}</h3>
                    <p>{w.domain}</p>
                    <div className="period">{w.period}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="band" aria-label="Work together">
          <div className="wrap band-in" data-reveal>
            <h2>Ready to work together?<span className="mute">I’m open to product design roles.</span></h2>
            <div className="sub-ctas" style={{ marginTop: 0 }}>
              <a className="btn btn-ink" href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a>
              <a className="btn btn-line" href="#projects">See projects</a>
            </div>
          </div>
        </section>

        <section className="sec" aria-label="Background">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <div>
                <div className="eyebrow">(02) Background</div>
                <h2 className="h2">What I bring</h2>
              </div>
            </div>
            <div className="bgrid">
              {BACKGROUND.map((b, i) => (
                <div className="bcard" key={b.t} data-reveal style={{ '--d': i } as React.CSSProperties}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <div className="big">{b.big}</div>
                  <div className="t">{b.t}</div>
                  <div className="s">{b.s}</div>
                </div>
              ))}
            </div>
            <div className="tools" data-reveal>{TOOLS.map(t => <span className="tag" key={t}>{t}</span>)}</div>
          </div>
        </section>

        <ClosingCTA />
      </main>
      <SiteFooter />
      <VoiceAssistant />
    </div>
  )
}
