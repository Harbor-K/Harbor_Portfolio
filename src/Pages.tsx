import React, { useCallback, useEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { SiteHeader, VoiceAssistant } from './App'

// About me page — Harbor's Figma "About · Kinfolk style · default (11/10)" (44기 김지현 4차 PF, node 617:2),
// built to its sizes on a 1440 grid inside a 1920 frame, page #FAFAF9:
// 1. Hero — v98 (Harbor, Nov 10): node 613:14774. 56px under the header: "From canvas / to clarity" (Newsreader 64/72,
//    -2%) with the pitch (18/24, #595959) 16px under it; 64px; the 432×504 painting photo; 64px; "My story ↓ | Resume ↗"
//    (16/24, arrows in Geist Mono, divider #8C8C8C, 16px apart).
//    Kinfolk's first screen ends just above the bottom of the window so the next section shows under it: the hero is
//    as tall as the window less the 64px header and a 50px strip (Harbor: "50px"), so the top 50px of the window's
//    bottom always shows the band. The photo gives way on shorter windows (up to 504 tall, never under 280) so
//    everything else keeps its Figma sizes; on a 1077px-tall window it is exactly the Figma frame (963 tall).
// 2. Band — 952 tall, the sticky-wall photo full width under a shade (transparent from 40% → 72% #0A0808 at the
//    bottom). Caption row 64px from the bottom: WHAT I DO + two Newsreader 32/40 lines on the left, GLOBAL MINDSET +
//    three 16/24 lines (336 wide) on the right.
// 3. Off work — 128px padding; "Off work" (Newsreader 48/56) with ← → (48×48, 1px 16% line) over a 1px #0F0F0F rule
//    24px below (81 tall in all); 40px; six 288×360 photo cards, 24px apart, running off the right edge (label
//    #595959, line #0F0F0F). The arrows move the row one card at a time.
// 4. Topics — 224px top / 160px bottom: six topics in Newsreader 40/48, 16px apart, centred.
// Then the site footer (index.tsx).
//
// Interactions, copied from kinfolk.com (Harbor: "only the first and second sections and the CategoryList"):
// - Sections 1→2: Kinfolk pins its full-screen story under the issue cover and slides the cover away over it. Here the
//   band sits pinned (position: sticky) behind the hero, which scrolls up over it like a curtain, uncovering the photo
//   from the bottom; once the hero has gone the band lets go and scrolls on with the page. If the screen is taller than
//   the band, the band pins with its bottom on the bottom of the screen, so there is never a gap under it.
//   "My story ↓" scrolls to the point where the hero has just gone and the whole band is showing.
// - Topics (Kinfolk's CategoryList): pointing at one topic fades the others to #BDBDBD (Figma hover frame 618:149;
//   Kinfolk's timing: 0.5s cubic-bezier(.25,1,.5,1) after 0.1s, the pointed one at once) and shows its 160×200 photo
//   centred 24px above it, at once.
// Photos: from the Figma frame (2x), in Harbor-K/harbor-pf assets/about/v3. Topic photos other than UX research are
// picks from her case studies (swap freely).
// Note: the site-wide ".hb *" Helvetica rule (index.css) reaches every element, so any span inside a serif or mono line
// has to name its font itself.

const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif'
const SERIF = '"Newsreader", Georgia, "Times New Roman", serif'
const MONO = '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
const V3 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/about/v3/'
const RESUME = `mailto:harborkim0328@gmail.com?subject=${encodeURIComponent('Resume request')}`

const AB_CSS = `
.hb.abk { background: #FAFAF9; }
.hb .abk-main { padding-top: 64px; }
.hb .abk-wrap { width: min(1440px, calc(100% - 64px)); margin: 0 auto; }

/* ---- sections 1 + 2: the band pins behind the hero (Kinfolk) ---- */
.hb .abk-stack { position: relative; }
.hb .abk-band { position: sticky; top: max(0px, calc(100vh - 952px)); z-index: 0; height: 952px; overflow: hidden;
  display: flex; flex-direction: column; justify-content: flex-end; padding: 64px 0; background: #1a1716; color: #FAFAFA; }
.hb .abk-band > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.hb .abk-band::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(10,8,8,0) 40%, rgba(10,8,8,.72) 100%); }
/* window less the 64px header and the 50px strip of the band */
.hb .abk-hero { position: relative; z-index: 1; margin-top: -952px; height: calc(100vh - 114px); min-height: 743px;
  padding-top: 56px; background: #FAFAF9; display: flex; flex-direction: column; align-items: center; gap: 64px; }
.hb .abk-spacer { height: 952px; }

.hb .abk-head { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
.hb .abk-h1 { margin: 0; font-family: ${SERIF}; font-size: 64px; font-weight: 400; line-height: 72px; letter-spacing: -0.02em;
  color: #0F0F0F; text-align: center; }
.hb .abk-h1 span { display: block; font-family: inherit; }
.hb .abk-pitch { margin: 0; font-family: ${SANS}; font-size: 18px; font-weight: 400; line-height: 24px; color: #595959; text-align: center; }
.hb .abk-pitch span { display: block; font-family: inherit; }
.hb .abk-fig { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 64px; }
/* 504 tall in the Figma frame; shorter only when the window is (56+208+64 above, 64+24+43 below = 459 + the 114) */
.hb .abk-fig img { display: block; height: clamp(280px, calc(100vh - 573px), 504px); width: auto; aspect-ratio: 432 / 504; object-fit: cover; }
.hb .abk-links { display: flex; align-items: center; gap: 16px; }
.hb .abk-links a, .hb .abk-links .dv { font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px; white-space: nowrap; }
.hb .abk-links a { color: #0F0F0F; text-decoration: none; transition: opacity .2s ease; }
.hb .abk-links a:hover { opacity: .6; }
.hb .abk-links a:focus-visible { outline: 2px solid #0F0F0F; outline-offset: 3px; }
.hb .abk-links .ar { font-family: ${MONO}; }
.hb .abk-links .dv { color: #8C8C8C; }

.hb .abk-caprow { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-end; gap: 40px; }
.hb .abk-cap { display: flex; flex-direction: column; gap: 8px; }
.hb .abk-eye { margin: 0; font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px; color: #FAFAFA; }
.hb .abk-cap .ln { margin: 0; font-family: ${SERIF}; font-size: 32px; font-weight: 400; line-height: 40px; letter-spacing: -0.01em; color: #FAFAFA; }
.hb .abk-mind { flex: none; width: 336px; display: flex; flex-direction: column; gap: 8px; }
.hb .abk-mind ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
.hb .abk-mind li { margin: 0; font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px; color: #FAFAFA; }

/* ---- 3. Off work ---- */
.hb .abk-story { padding: 128px 0; overflow-x: clip; }
.hb .abk-shead { display: flex; justify-content: space-between; align-items: center; padding-bottom: 25px; box-shadow: inset 0 -1px 0 #0F0F0F; }
.hb .abk-h2 { margin: 0; font-family: ${SERIF}; font-size: 48px; font-weight: 400; line-height: 56px; letter-spacing: -0.02em; color: #0F0F0F; }
.hb .abk-arrows { display: flex; gap: 8px; }
.hb .abk-arrow { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; padding: 0; margin: 0;
  background: none; border: 0; border-radius: 0; box-shadow: inset 0 0 0 1px rgba(15,15,15,.16); cursor: pointer;
  font-family: ${SANS}; font-size: 16px; line-height: 24px; color: #0F0F0F; transition: box-shadow .2s ease, background .2s ease; }
.hb .abk-arrow:hover { box-shadow: inset 0 0 0 1px #0F0F0F; }
.hb .abk-arrow:focus-visible { outline: 2px solid #0F0F0F; outline-offset: 2px; }
.hb .abk-cards { display: flex; gap: 24px; margin-top: 40px; margin-right: calc(-1 * max(32px, (100vw - 1440px) / 2));
  overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; scrollbar-width: none; overscroll-behavior-x: contain; }
.hb .abk-cards::-webkit-scrollbar { display: none; }
.hb .abk-card { flex: none; width: 288px; margin: 0; display: flex; flex-direction: column; gap: 16px; scroll-snap-align: start; }
.hb .abk-card:last-child { margin-right: max(32px, (100vw - 1440px) / 2); }
.hb .abk-card img { display: block; width: 288px; height: 360px; object-fit: cover; background: #ECECEA; }
.hb .abk-card figcaption { display: flex; flex-direction: column; gap: 8px; }
.hb .abk-card .lb, .hb .abk-card .tx { margin: 0; font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px; }
.hb .abk-card .lb { color: #595959; }
.hb .abk-card .tx { color: #0F0F0F; }

/* ---- 4. Topics (Kinfolk CategoryList) ---- */
.hb .abk-topics { padding: 224px 0 160px; }
.hb .abk-tl { margin: 0 auto; padding: 0; list-style: none; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 16px; }
.hb .abk-tp { position: relative; margin: 0; font-family: ${SERIF}; font-size: 40px; font-weight: 400; line-height: 48px; letter-spacing: -0.02em;
  white-space: nowrap; color: #0F0F0F; cursor: default; outline: none;
  transition: color .5s cubic-bezier(.25,1,.5,1) .1s; }
.hb .abk-tl.hov .abk-tp { color: #BDBDBD; }
.hb .abk-tl.hov .abk-tp.on { color: #0F0F0F; transition-delay: 0s; }
.hb .abk-tp img { position: absolute; left: 50%; bottom: calc(100% + 24px); width: 160px; height: 200px; object-fit: cover;
  transform: translateX(-50%); opacity: 0; pointer-events: none; display: block; }
.hb .abk-tp.on img { opacity: 1; }

@media (max-width: 1100px) {
  .hb .abk-caprow { flex-direction: column; align-items: flex-start; }
  .hb .abk-cap .ln { font-size: 24px; line-height: 32px; }
}
@media (max-width: 760px) {
  .hb .abk-wrap { width: calc(100% - 32px); }
  .hb .abk-band { position: relative; top: 0; height: 640px; padding: 32px 0; }
  .hb .abk-hero { margin-top: 0; height: auto; min-height: 0; padding: 40px 16px 64px; gap: 40px; }
  .hb .abk-stack { display: flex; flex-direction: column-reverse; }
  .hb .abk-spacer { display: none; }
  .hb .abk-h1 { font-size: 44px; line-height: 52px; }
  .hb .abk-fig { gap: 40px; }
  .hb .abk-fig img { width: min(432px, 100%); height: auto; }
  .hb .abk-mind { width: 100%; }
  .hb .abk-story { padding: 80px 0; }
  .hb .abk-h2 { font-size: 36px; line-height: 44px; }
  .hb .abk-cards { margin-right: -16px; }
  .hb .abk-card { width: 240px; }
  .hb .abk-card img { width: 240px; height: 300px; }
  .hb .abk-topics { padding: 160px 16px 96px; }
  .hb .abk-tp { font-size: 28px; line-height: 36px; }
}
`

const OFF_WORK = [
  { src: 'offwork-01-sydney.jpg', label: '01 · SYDNEY, AU', line: 'Lived and worked in Australia.', alt: 'Harbor by Sydney Harbour with the Opera House behind her' },
  { src: 'offwork-02-london.jpg', label: '02 · LONDON, UK', line: 'Night walks through London.', alt: 'Harbor in Trafalgar Square at night' },
  { src: 'offwork-03-bath.jpg', label: '03 · BATH, UK', line: 'Weekends exploring the UK.', alt: 'Harbor in front of a Jane Austen flower display in Bath' },
  { src: 'offwork-04-tea.jpg', label: '04 · TEA LOVER', line: 'Never says no to afternoon tea.', alt: 'Harbor at afternoon tea' },
  { src: 'offwork-05-hiking.jpg', label: '05 · HIKING', line: 'Staying active on the trail.', alt: 'Harbor on a clifftop walk by the sea' },
  { src: 'offwork-06-drawing.jpg', label: '06 · DRAWING', line: 'Still sketching what I see.', alt: 'A crayon sketch of a tree held up in front of the street it shows' },
]

const TOPICS = [
  { t: 'UX research', src: 'topic-ux-research.jpg' },
  { t: 'Design systems', src: 'topic-design-systems.jpg' },
  { t: 'Prototyping', src: 'topic-prototyping.jpg' },
  { t: 'Usability testing', src: 'topic-usability-testing.jpg' },
  { t: 'Fintech', src: 'topic-fintech.jpg' },
  { t: 'AI design', src: 'topic-ai-design.jpg' },
]

function OffWork() {
  const row = useRef<HTMLDivElement>(null)
  const step = (dir: 1 | -1) => {
    const el = row.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.abk-card')
    const w = card ? card.offsetWidth + 24 : 312
    el.scrollBy({ left: dir * w, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  return (
    <section className="abk-story" aria-labelledby="abk-off">
      <div className="abk-wrap">
        <div className="abk-shead">
          <h2 className="abk-h2" id="abk-off">Off work</h2>
          <div className="abk-arrows">
            <button type="button" className="abk-arrow" aria-label="Previous photo" onClick={() => step(-1)}>←</button>
            <button type="button" className="abk-arrow" aria-label="Next photo" onClick={() => step(1)}>→</button>
          </div>
        </div>
        <div className="abk-cards" ref={row}>
          {OFF_WORK.map(c => (
            <figure className="abk-card" key={c.src}>
              <img src={V3 + c.src} alt={c.alt} loading="lazy" />
              <figcaption>
                <p className="lb">{c.label}</p>
                <p className="tx">{c.line}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function Topics() {
  const [on, setOn] = useState<number | null>(null)
  const leave = useCallback(() => setOn(null), [])
  return (
    <section className="abk-topics" aria-label="What I work on">
      <ul className={'abk-tl abk-wrap' + (on !== null ? ' hov' : '')} onMouseLeave={leave}>
        {TOPICS.map((p, i) => (
          <li key={p.t} className={'abk-tp' + (on === i ? ' on' : '')} tabIndex={0}
            onMouseEnter={() => setOn(i)} onFocus={() => setOn(i)} onBlur={leave}>
            <img src={V3 + p.src} alt="" aria-hidden="true" />
            {p.t}{i < TOPICS.length - 1 ? ',' : ''}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function AboutPage() {
  const hero = useRef<HTMLElement>(null)
  // warm the topic photos so they appear at once on the first hover
  useEffect(() => { TOPICS.forEach(p => { const i = new Image(); i.src = V3 + p.src }) }, [])
  // "My story": scroll until the hero has just gone, so the whole band shows
  const toStory = (e: React.MouseEvent) => {
    e.preventDefault()
    const h = hero.current
    if (!h) return
    const top = h.getBoundingClientRect().bottom + window.scrollY - 64
    window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  return (
    <div className="hb abk" id="top">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&display=swap" />
      <style>{CSS + AB_CSS}</style>
      <SiteHeader current="about" />
      <main className="abk-main">
        <div className="abk-stack">
          <section className="abk-band" id="my-story" aria-label="What I do">
            <img src={V3 + 'band-sticky-wall.jpg'} alt="Harbor sorting sticky notes on a research wall" />
            <div className="abk-caprow abk-wrap">
              <div className="abk-cap">
                <p className="abk-eye">WHAT I DO</p>
                <p className="ln">3+ years designing fintech products, end to end.</p>
                <p className="ln">From user research to design systems and shipped, tested UI.</p>
              </div>
              <div className="abk-mind">
                <p className="abk-eye">GLOBAL MINDSET</p>
                <ul>
                  <li>Lived and worked in Australia and the UK</li>
                  <li>Global fintech at ETO Markets, Sydney</li>
                  <li>Products in up to 11 languages</li>
                </ul>
              </div>
            </div>
          </section>
          <section className="abk-hero" ref={hero} aria-labelledby="abk-title">
            <div className="abk-head">
              <h1 className="abk-h1" id="abk-title"><span>From canvas</span><span>to clarity</span></h1>
              <p className="abk-pitch">
                <span>From Fine Art to AI-native product design</span>
                <span>I love art, but I wanted to make things everyone can use.</span>
              </p>
            </div>
            <figure className="abk-fig">
              <img src={V3 + 'hero-paintings.jpg'} alt="Harbor's paintings leaning against a studio wall" />
              <figcaption className="abk-links">
                <a href="#my-story" onClick={toStory}>My story <span className="ar" aria-hidden="true">↓</span></a>
                <span className="dv" aria-hidden="true">|</span>
                <a href={RESUME}>Resume <span className="ar" aria-hidden="true">↗</span></a>
              </figcaption>
            </figure>
          </section>
          <div className="abk-spacer" aria-hidden="true" />
        </div>
        <OffWork />
        <Topics />
      </main>
      <VoiceAssistant />
    </div>
  )
}
