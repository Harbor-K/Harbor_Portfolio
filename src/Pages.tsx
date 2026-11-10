import React, { useCallback, useEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'
import { SiteHeader, VoiceAssistant } from './App'

// About me page — copy and spacing from Harbor's Figma "About · Kinfolk style · default (11/10)"
// (44기 김지현 4차 PF, node 613:14748), on a 1440 grid inside a 1920 frame, page #FAFAF9:
// 1. Hero (613:14774) — 56px under the header: "Designer now, / once a painter" (Newsreader 64/72, -2%; the first line
//    #0F0F0F, the second #8C8C8C) with the pitch (18/24, #595959) 24px under it; 64px; the 432×504 photo (v102, Harbor:
//    her two self-portraits behind an easel); 104px; "My story ↓ | Resume ↗" (16/24, arrows in Geist Mono, divider
//    #8C8C8C, 16px apart); 32px. 1000 tall in Figma.
//    It starts at the very top of the page, under the see-through header, and ends 50px above the bottom of the window,
//    so the band always shows in that 50px strip (Kinfolk). The photo gives way on shorter windows (up to 504 tall,
//    never under 280) so everything else keeps its Figma sizes; on a 1114px-tall window it is exactly the Figma frame.
//    Intro (Harbor: "the same as the main page's first image"): the main hero's interactions, on the same clock —
//    the photo eases in from 110% to 100% over 9s with a dark layer lifting off it (45% → 0 in 1.2s), and drifts with
//    the scroll (parallax, kept inside its frame); the title rises in word by word from 0.3s (0.07s apart, 0.7s each);
//    the pitch comes in at 1s like the main quote; the two links fade in at 0.7s and 0.8s like the main buttons.
// 2. Band (613:14784) — 952 tall, the sticky-wall photo (retouched) full width under a shade (transparent from 40% →
//    72% #0A0808). Caption row 64px from the bottom: label (16/24, +4% tracking, 64% white) 16px above its content —
//    WHAT I DO + two Newsreader 32/40 lines on the left; GLOBAL MINDSET + three 16/24 lines (336 wide) on the right;
//    both blocks on one bottom line.
// 3. Off work (613:14797) — 128px padding; "Off work" (Newsreader 48/56) with ← → (48×48, 1px 16% line) over a 1px
//    #0F0F0F rule 24px below (81 tall in all); 40px; six 288×360 photo cards, 24px apart, running off the right edge.
//    The arrows move the row one card at a time.
// 4. Topics (613:14836 / hover 623:14946) — 224px top / 160px bottom: Human-centered, Observation, Clarity,
//    Accessibility, Evidence-based, Iteration (Newsreader 40/48, -2%, 16px apart, centred).
// Then the site footer (index.tsx).
//
// Interactions, copied from kinfolk.com:
// - Sections 1→2: the band sits pinned (position: sticky) behind the hero with its bottom on the bottom of the window,
//   and the hero scrolls up over it like a curtain; the band lets go exactly as the hero's bottom passes its top.
//   "My story ↓" scrolls to where the hero has just gone.
// - Topics (Kinfolk's CategoryList): pointing at one topic fades the others to #BDBDBA (Figma hover frame;
//   0.5s cubic-bezier(.25,1,.5,1) after 0.1s, the pointed one at once) and shows its 160×200 photo centred 24px above
//   it, at once. Human-centered has the Figma photo; the others are picks from her photos (swap freely).
// Photos: Harbor-K/harbor-pf assets/about/v3.
// Note: the site-wide ".hb *" Helvetica rule (index.css) reaches every element, so any span inside a serif or mono line
// has to name its font itself.

const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif'
const SERIF = '"Newsreader", Georgia, "Times New Roman", serif'
const MONO = '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
const V3 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/about/v3/'
const RESUME = `mailto:harborkim0328@gmail.com?subject=${encodeURIComponent('Resume request')}`
// the photo drifts inside its frame: the image layer is 10% taller than the frame (kept small so the framing barely
// changes) and moves down by 0.06× the scroll, never past the extra 10%
const PARALLAX = 0.06

const AB_CSS = `
.hb.abk { background: #FAFAF9; }
.hb .abk-wrap { width: min(1440px, calc(100% - 64px)); margin: 0 auto; }

/* ---- sections 1 + 2: the band pins behind the hero (Kinfolk) ---- */
.hb .abk-stack { position: relative; }
/* pinned with its bottom on the bottom of the window; on windows shorter than the band it is pulled up by the
   difference, and the hero by the same amount less, so the hero still starts at the top of the page */
.hb .abk-band { position: sticky; top: calc(100vh - 952px); margin-top: min(0px, calc(100vh - 952px)); z-index: 0; height: 952px; overflow: hidden;
  display: flex; flex-direction: column; justify-content: flex-end; padding: 64px 0; background: #1a1716; color: #FAFAFA; }
.hb .abk-band > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.hb .abk-band::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(10,8,8,0) 40%, rgba(10,8,8,.72) 100%); }
/* the window less the 50px strip of the band; 64px header + 56px = 120px above the title */
.hb .abk-hero { position: relative; z-index: 1; margin-top: calc(-952px - min(0px, calc(100vh - 952px))); height: calc(100vh - 50px); min-height: 840px;
  padding-top: 120px; background: #FAFAF9; display: flex; flex-direction: column; align-items: center; gap: 64px; }
.hb .abk-spacer { height: 952px; }

.hb .abk-head { display: flex; flex-direction: column; align-items: center; gap: 24px; text-align: center; }
.hb .abk-h1 { margin: 0; font-family: ${SERIF}; font-size: 64px; font-weight: 400; line-height: 72px; letter-spacing: -0.02em;
  color: #0F0F0F; text-align: center; }
.hb .abk-h1 .ln { display: block; font-family: inherit; }
.hb .abk-h1 .ln.mute { color: #8C8C8C; }
.hb .abk-h1 .w { display: inline-block; font-family: inherit; opacity: 0; transform: translateY(10px);
  animation: abk-word .7s cubic-bezier(.22,1,.36,1) var(--wd, 0s) forwards; }
@keyframes abk-word { to { opacity: 1; transform: none; } }
.hb .abk-pitch { margin: 0; font-family: ${SANS}; font-size: 18px; font-weight: 400; line-height: 24px; color: #595959; text-align: center;
  opacity: 0; transform: translateY(2px); animation: abk-q .5s cubic-bezier(.22,1,.36,1) 1s forwards; }
@keyframes abk-q { to { opacity: 1; transform: none; } }
.hb .abk-pitch span { display: block; font-family: inherit; }
.hb .abk-fig { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 104px; }
/* 504 tall in the Figma frame; shorter only when the window is (120+216+64 above, 104+24+32 below, +50) */
.hb .abk-ph { position: relative; display: block; height: clamp(280px, calc(100vh - 610px), 504px); width: auto; aspect-ratio: 432 / 504;
  overflow: hidden; background: #ECECEA; }
.hb .abk-ph-bg { position: absolute; left: 0; right: 0; top: -10%; height: 110%; will-change: transform; }
.hb .abk-ph-bg img { display: block; width: 100%; height: 100%; object-fit: cover; animation: abk-kb 9s cubic-bezier(.2,.7,.2,1) both; }
@keyframes abk-kb { from { transform: scale(1.1); } to { transform: scale(1); } }
.hb .abk-ph-intro { position: absolute; inset: 0; pointer-events: none; background: #000; opacity: 0; animation: abk-lift 1.2s ease-out both; }
@keyframes abk-lift { from { opacity: .45; } to { opacity: 0; } }
.hb .abk-links { display: flex; align-items: center; gap: 16px; }
.hb .abk-links > * { opacity: 0; animation: abk-fade .4s ease-out var(--wd, 0s) forwards; }
@keyframes abk-fade { to { opacity: 1; } }
.hb .abk-links a, .hb .abk-links .dv { font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px; white-space: nowrap; }
.hb .abk-links a { color: #0F0F0F; text-decoration: none; transition: color .2s ease; }
.hb .abk-links a:hover { color: #595959; }
.hb .abk-links a:focus-visible { outline: 2px solid #0F0F0F; outline-offset: 3px; }
.hb .abk-links .ar { font-family: ${MONO}; }
.hb .abk-links .dv { color: #8C8C8C; }

/* caption row: label (+4% tracking, 64% white) 16px above its content; content lines together */
.hb .abk-caprow { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-end; gap: 40px; }
.hb .abk-cap, .hb .abk-mind { display: flex; flex-direction: column; gap: 16px; }
.hb .abk-eye { margin: 0; font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px; letter-spacing: .04em; color: rgba(250,250,250,.64); }
.hb .abk-cap .lines { display: flex; flex-direction: column; }
.hb .abk-cap .ln { margin: 0; font-family: ${SERIF}; font-size: 32px; font-weight: 400; line-height: 40px; letter-spacing: -0.01em; color: #FAFAFA; }
.hb .abk-mind { flex: none; width: 336px; }
.hb .abk-mind ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; }
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
.hb .abk-tl.hov .abk-tp { color: #BDBDBA; }
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
  .hb .abk-band { position: relative; top: 0; margin-top: 0; height: 640px; padding: 32px 0; }
  .hb .abk-hero { margin-top: 0; height: auto; min-height: 0; padding: 104px 16px 64px; gap: 40px; }
  .hb .abk-stack { display: flex; flex-direction: column-reverse; }
  .hb .abk-spacer { display: none; }
  .hb .abk-h1 { font-size: 44px; line-height: 52px; }
  .hb .abk-fig { gap: 40px; }
  .hb .abk-ph { width: min(432px, calc(100vw - 32px)); height: auto; }
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

const TITLE_1 = 'Designer now,'
const TITLE_2 = 'once a painter'

const OFF_WORK = [
  { src: 'offwork-01-sydney.jpg', label: '01 · SYDNEY, AU', line: 'Lived and worked in Australia.', alt: 'Harbor by Sydney Harbour with the Opera House behind her' },
  { src: 'offwork-02-london.jpg', label: '02 · LONDON, UK', line: 'Night walks through London.', alt: 'Harbor in Trafalgar Square at night' },
  { src: 'offwork-03-bath.jpg', label: '03 · BATH, UK', line: 'Weekends exploring the UK.', alt: 'Harbor in front of a Jane Austen flower display in Bath' },
  { src: 'offwork-04-tea.jpg', label: '04 · TEA LOVER', line: 'Never says no to afternoon tea.', alt: 'Harbor at afternoon tea' },
  { src: 'offwork-05-hiking.jpg', label: '05 · HIKING', line: 'Staying active on the trail.', alt: 'Harbor on a clifftop walk by the sea' },
  { src: 'offwork-06-drawing.jpg', label: '06 · DRAWING', line: 'Still sketching what I see.', alt: 'A crayon sketch of a tree held up in front of the street it shows' },
]

// Figma 623:14946 topics; Human-centered uses the Figma hover photo, the rest are picks from her photos
const TOPICS = [
  { t: 'Human-centered', src: 'topic-ux-research.jpg' },
  { t: 'Observation', src: 'topic-observation.jpg' },
  { t: 'Clarity', src: 'topic-design-systems.jpg' },
  { t: 'Accessibility', src: 'topic-fintech.jpg' },
  { t: 'Evidence-based', src: 'topic-usability-testing.jpg' },
  { t: 'Iteration', src: 'topic-prototyping.jpg' },
]

// words that rise in one after another (the main hero's timing)
function Words({ text, start, step = 0.07 }: { text: string; start: number; step?: number }) {
  const ws = text.split(' ')
  return (
    <>
      {ws.map((w, i) => (
        <React.Fragment key={i}>
          {i > 0 && ' '}
          <span className="w" style={{ '--wd': `${(start + i * step).toFixed(2)}s` } as React.CSSProperties}>{w}</span>
        </React.Fragment>
      ))}
    </>
  )
}

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
    <section className="abk-topics" aria-label="How I work">
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
  const phBg = useRef<HTMLDivElement>(null)
  // warm the topic photos so they appear at once on the first hover
  useEffect(() => { TOPICS.forEach(p => { const i = new Image(); i.src = V3 + p.src }) }, [])
  // the photo drifts with the scroll inside its frame (the main hero's parallax, scaled to the frame)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = phBg.current
        if (!el || !el.parentElement) return
        const max = el.offsetHeight - el.parentElement.offsetHeight
        el.style.transform = `translate3d(0, ${Math.min(scrollY * PARALLAX, max)}px, 0)`
      })
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])
  // "My story": scroll until the hero has just gone, so the whole band shows
  const toStory = (e: React.MouseEvent) => {
    e.preventDefault()
    const h = hero.current
    if (!h) return
    const top = h.getBoundingClientRect().bottom + window.scrollY - 64
    window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  const t2Start = 0.3 + TITLE_1.split(' ').length * 0.07
  return (
    <div className="hb abk" id="top">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&display=swap" />
      <style>{CSS + AB_CSS}</style>
      <SiteHeader current="about" />
      <main className="abk-main">
        <div className="abk-stack">
          <section className="abk-band" id="my-story" aria-label="What I do">
            <img src={V3 + 'band-sticky-wall-v2.jpg'} alt="Harbor sorting sticky notes on a research wall" />
            <div className="abk-caprow abk-wrap">
              <div className="abk-cap">
                <p className="abk-eye">WHAT I DO</p>
                <div className="lines">
                  <p className="ln">3+ years designing fintech products, end to end.</p>
                  <p className="ln">From user research to design systems and shipped, tested UI.</p>
                </div>
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
              <h1 className="abk-h1" id="abk-title" aria-label={`${TITLE_1} ${TITLE_2}`}>
                <span className="ln" aria-hidden="true"><Words text={TITLE_1} start={0.3} /></span>
                <span className="ln mute" aria-hidden="true"><Words text={TITLE_2} start={t2Start} /></span>
              </h1>
              <p className="abk-pitch">
                <span>From Fine Art to AI-native product design</span>
                <span>I love art, but I wanted to make things everyone can use.</span>
              </p>
            </div>
            <figure className="abk-fig">
              <div className="abk-ph">
                <div className="abk-ph-bg" ref={phBg}>
                  <img src={V3 + 'hero-portraits.jpg'} alt="Two of Harbor's oil self-portraits behind a wooden easel in a studio" />
                </div>
                <div className="abk-ph-intro" aria-hidden="true" />
              </div>
              <figcaption className="abk-links">
                <a href="#my-story" onClick={toStory} style={{ '--wd': '0.7s' } as React.CSSProperties}>My story <span className="ar" aria-hidden="true">↓</span></a>
                <span className="dv" aria-hidden="true" style={{ '--wd': '0.75s' } as React.CSSProperties}>|</span>
                <a href={RESUME} style={{ '--wd': '0.8s' } as React.CSSProperties}>Resume <span className="ar" aria-hidden="true">↗</span></a>
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
