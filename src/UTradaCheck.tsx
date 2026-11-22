import React, { useState } from 'react'

/**
 * UTrada · Test (Figma 2293:8684 "Section / Test · Option 7", Nov 22). Lives in its own file so new replies only touch this file.
 *
 * StakeholderCheck: one quote card (Mews-style, photo left). Each reply is a card: the stakeholder's own words (quote)
 * and what the reply confirmed (finding, Harbor's summary). Add a reply: push a card to CARDS. The arrows only work when
 * there is more than one card; with a single card they are shown disabled.
 * Photo: illustrative stock photo from the Figma frame, not the real colleague (only the role is shown).
 *
 * NextTest: the planned test with first-time traders, as Today vs Redesign for the same three tasks. StakeholderCheck
 * renders it too, and UC_CSS hides the page's older Fogg plan block (.u9-check in the Test section), so UTradaV9.tsx
 * did not need to change.
 * Type and spacing are Figma's (Inter in Figma → Roboto on the site), on the 8px grid; square corners.
 */

const A9 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/utrada/v9/'

type Card = { role: string; photo: string; quote: string; finding: string }
const CARDS: Card[] = [
  {
    role: 'Business Operations · UTrada',
    photo: A9 + 'person-1.webp', // 192px placeholder; swap for a 2x export of Figma 2293:8693 (stakeholder-1.webp)
    quote: 'Trust cannot be built through just one conversation or communication channel.',
    finding: 'It confirmed the first deposit as the biggest drop-off. The moments I picked held up, with one gap: how payments and withdrawals work.',
  },
]

const TASKS = [
  { k: 'Task 1 · Licence', today: 'Licence shown for only one of the two companies.', redo: 'Regulator and licence number in one plain sentence.' },
  { k: 'Task 2 · Company', today: 'Not clear which company your account is with.', redo: 'The company you sign with, named before sign-up.' },
  { k: 'Task 3 · Help', today: 'Hard to find help before adding money.', redo: 'Help from every page, even offline.' },
]

const Chevron = ({ dir }: { dir: 'l' | 'r' }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d={dir === 'l' ? 'M12 15L7 10L12 5' : 'M8 5L13 10L8 15'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const QuoteMark = () => (
  <svg className="qm" width="64" height="48" viewBox="0 0 64 48" fill="none" aria-hidden="true">
    <path d="M36 0H64V24C64 37.25 55.5 46 42 48V38C49 36.5 52 32 52 26H36V0Z" fill="currentColor" />
    <path d="M0 0H28V24C28 37.25 19.5 46 6 48V38C13 36.5 16 32 16 26H0V0Z" fill="currentColor" />
  </svg>
)

export function StakeholderCheck() {
  const [i, setI] = useState(0)
  const many = CARDS.length > 1
  const c = CARDS[i]
  const go = (step: number) => setI(v => (v + step + CARDS.length) % CARDS.length)
  return (
    <>
    <div className="uc mt96" data-r>
      <style>{UC_CSS}</style>
      <figure className="uc-card" aria-roledescription="carousel" aria-label="What stakeholders said">
        <div className="uc-ph">
          <img key={c.photo} src={c.photo} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="uc-panel" key={i}>
          <div className="top">
            <blockquote>“{c.quote}”</blockquote>
            <p className="finding">{c.finding}</p>
          </div>
          <div className="bot">
            <div className="who">
              <figcaption>{c.role}</figcaption>
              <div className="uc-nav">
                <button type="button" onClick={() => go(-1)} disabled={!many} aria-label="Previous stakeholder"><Chevron dir="l" /></button>
                <button type="button" onClick={() => go(1)} disabled={!many} aria-label="Next stakeholder"><Chevron dir="r" /></button>
              </div>
            </div>
            <QuoteMark />
          </div>
        </div>
      </figure>
    </div>
    <NextTest />
    </>
  )
}

export function NextTest() {
  return (
    <div className="uc-next mt96">
      <div className="sh" data-r><h4>Next: test with 5 first-time traders</h4><span className="pill grey">Planned</span></div>
      <p className="hyp" data-r>My hypothesis (Fogg Behavior Model): the worry at the first deposit stays the same, but if checking is easy, people act.</p>
      <div className="cmp" data-r>
        {(['today', 'redo'] as const).map(side => (
          <div key={side} className={'side ' + side}>
            <div className="hd">
              <p className="lab"><i aria-hidden="true" />{side === 'today' ? 'Today' : 'Redesign'}</p>
              <h5>{side === 'today' ? 'Hard to check' : 'Easy to check'}</h5>
            </div>
            <ul>
              {TASKS.map(t => (
                <li key={t.k}>
                  <span className="mk" aria-hidden="true">{side === 'today' ? '×' : '✓'}</span>
                  <span className="tx"><span className="k">{t.k}</span><span className="v">{side === 'today' ? t.today : t.redo}</span></span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="ms" data-r>I’ll measure: did they see it · could they do it, and how fast · trust score before and after (1 to 5)</p>
    </div>
  )
}

const UC_CSS = `
/* the older Fogg plan block in UTradaV9's Test section is replaced by NextTest */
.u9 section[data-chapter="Test"] .u9-check { display: none; }

/* quote card (2293:8692): photo 576 | panel, 600 tall */
.u9 .uc-card { display: flex; min-height: 600px; margin: 0; background: linear-gradient(90deg, #330099, #8A2BE3); color: #FFFFFF; }
.u9 .uc-ph { position: relative; flex: none; width: 40%; overflow: hidden; background: #13121A; }
.u9 .uc-ph img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; }
.u9 .uc-panel { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; gap: 48px; padding: 64px; animation: uc-in .6s ease; }
@keyframes uc-in { from { opacity: 0; } }
.u9 .uc-panel .top { display: flex; flex-direction: column; gap: 24px; }
.u9 .uc-panel blockquote { margin: 0; font-size: 48px; font-weight: 600; line-height: 56px; letter-spacing: -0.02em; color: #FFFFFF; }
.u9 .uc-panel .finding { font-size: 18px; line-height: 32px; color: rgba(255, 255, 255, .8); }
.u9 .uc-panel .bot { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }
.u9 .uc-panel .who { display: flex; flex-direction: column; gap: 32px; }
.u9 .uc-panel figcaption { font-size: 18px; font-weight: 600; line-height: 24px; }
.u9 .uc-panel .uc-nav { display: flex; gap: 16px; margin: 0; padding: 0; }
.u9 .uc-panel .uc-nav button { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; padding: 0; margin: 0;
  background: transparent; border: 1.5px solid #FFFFFF; color: #FFFFFF; cursor: pointer; }
.u9 .uc-panel .uc-nav button:disabled { opacity: .4; cursor: default; }
.u9 .uc-panel .uc-nav button:focus-visible { outline: 2px solid #FFFFFF; outline-offset: 2px; }
.u9 .uc-panel .qm { flex: none; color: #FFFFFF; }

/* next test (2293:8807): Today vs Redesign */
.u9 .uc-next { display: flex; flex-direction: column; gap: 32px; }
.u9 .uc-next .sh { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.u9 .uc-next h4 { font-size: 24px; font-weight: 700; line-height: 32px; color: var(--ink); }
.u9 .uc-next .hyp { font-size: 20px; line-height: 32px; color: var(--mute); }
.u9 .uc-next .cmp { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; }
.u9 .uc-next .side { display: flex; flex-direction: column; gap: 32px; padding: 40px; }
.u9 .uc-next .today { background: #EDEDF0; }
.u9 .uc-next .redo { background: #F0EBFC; }
.u9 .uc-next .hd { display: flex; flex-direction: column; gap: 8px; }
.u9 .uc-next .lab { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; line-height: 24px; color: var(--mute); }
.u9 .uc-next .lab i { flex: none; width: 10px; height: 10px; background: var(--mute); }
.u9 .uc-next .redo .lab { color: var(--pu); } .u9 .uc-next .redo .lab i { background: var(--pu); }
.u9 .uc-next h5 { margin: 0; font-size: 32px; font-weight: 700; line-height: 40px; color: var(--mute); }
.u9 .uc-next .redo h5 { color: var(--ink); }
.u9 .uc-next ul { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; list-style: none; }
.u9 .uc-next li { display: flex; gap: 16px; padding: 24px; background: #FFFFFF; }
.u9 .uc-next .mk { flex: none; width: 16px; font-size: 18px; font-weight: 700; line-height: 28px; color: #DE3345; }
.u9 .uc-next .redo .mk { color: var(--pu); }
.u9 .uc-next .tx { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.u9 .uc-next .k { font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: 0; color: var(--mute); }
.u9 .uc-next .v { font-size: 18px; line-height: 28px; color: var(--mute); }
.u9 .uc-next .redo .v { color: var(--ink); }
.u9 .uc-next .ms { font-size: 18px; font-weight: 500; line-height: 32px; color: var(--ink); }

@media (max-width: 1279px) {
  .u9 .uc-panel blockquote { font-size: 40px; line-height: 48px; }
}
@media (max-width: 1023px) {
  .u9 .uc-card { flex-direction: column; min-height: 0; }
  .u9 .uc-ph { width: 100%; aspect-ratio: 4 / 3; }
  .u9 .uc-panel { padding: 40px; }
  .u9 .uc-next .cmp { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 600px) {
  .u9 .uc-panel { padding: 24px; gap: 32px; }
  .u9 .uc-panel blockquote { font-size: 28px; line-height: 36px; }
  .u9 .uc-panel .qm { width: 48px; height: 36px; }
  .u9 .uc-next .side { padding: 24px; }
  .u9 .uc-next h5 { font-size: 24px; line-height: 32px; }
  .u9 .uc-next .hyp { font-size: 18px; line-height: 28px; }
}
@media (prefers-reduced-motion: reduce) { .u9 .uc-panel { animation: none; } }
`
