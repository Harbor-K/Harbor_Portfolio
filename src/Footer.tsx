import React, { useEffect, useState } from 'react'
import { FOOTER_LOGO_SVG } from './harborLogo'
import { AI_ICONS } from './aiIcons'

// Site footer — Harbor's Figma "footer.ft" in the main page frame (44기 김지현 4차 PF, node 538:6543 / 671:1071), built to the
// frame exactly. index.tsx renders it under every page (main, About, Trust Bank, GameCove, UTrada); the pages' older
// footers (class "foot") are hidden.
// - #0A0809, a 1px rgba(255,255,255,.08) line drawn inside the top, 80px top / 40px bottom padding.
// - 1440 container, 64px between the top row and the bottom row.
// - Top row: the Harbor logo (mark + "Harbor", 164×40) in a 432px column, then three link columns — Explore 336px (Home,
//   Projects, About me, Resume), Projects 432px (Trust Bank, GameCove, UTrada), Contact 240px (LinkedIn, Instagram, Email,
//   Chat with me). Column headings 16/24 #FAFAFA; links 16/24 #8C8C8C; 16px under a heading, 8px between links.
//   v112 (Harbor): the last Contact link reads "Chat with me" (was "Book a call"); it still opens her 30-minute
//   cal.com page in a new tab.
// - v105 (Harbor, Nov 10, from her reference screenshot): under the logo, 32px down —
//   • "Ask AI about Harbor" 16/24 #8C8C8C (v107, Harbor: sentence case, no brackets — so no caps tracking either);
//   • 16px; five 40×40 square buttons, 8px apart (6% white fill with an 8% white line inside; the mark at 72% white,
//     full white with a 12% fill on hover): Claude, Gemini, ChatGPT, Grok, Perplexity. Each opens that AI in a new tab
//     with a ready question about Harbor and this portfolio's address. Gemini has no address for a ready question, so
//     its button copies the question and opens Gemini; the label says "Question copied — paste it in Gemini" for 3s.
//     Marks: @lobehub/icons-static-svg (MIT), aiIcons.ts.
//   • 32px; her local time, live, two lines 16/24 #8C8C8C: "Seoul 04:26:35 PM" (v107, Harbor: Seoul, not Geoje) and
//     "Tuesday, Nov 10, 2026 (GMT +09)" (Asia/Seoul, whatever the visitor's own time zone).
//   The top row grows to fit this column (the link columns stay at the top).
// - Bottom row (48px): a 1px rgba(250,250,250,.16) line inside its top, 24px padding, then "© 2026 Harbor (Jihyun) Kim.
//   All rights reserved." on the left and "Back to top ↑" on the right, 16/24 #8C8C8C.
// Lines are drawn inside boxes (inset shadows), like Figma's inside strokes, so no line adds to a size.
// Interactions: links and the logo brighten on hover; the logo and "Home" go to the top of the main page;
// "Resume" opens her CV in a new tab, like the header's Resume button (v108; v114: the PDF on Google Drive);
// "Back to top ↑" scrolls this page to the top (its arrow nudges up on hover).

const MAIL = 'harborkim0328@gmail.com'
const F = {
  linkedin: 'https://www.linkedin.com/in/harborkim/',
  instagram: 'https://instagram.com/harbor_0328',
  email: `mailto:${MAIL}`,
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
  resume: 'https://drive.google.com/file/d/1HVj_RZWRWKovvyIbYKPlQfGkQrecxC1B/view?usp=sharing',
}
const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif'
const SERIF = '"Newsreader", Georgia, "Times New Roman", serif'

// Ask AI: the question each assistant opens with (the portfolio's own address is added at click time)
const question = () => {
  const site = window.location.origin + window.location.pathname
  return `Tell me about Harbor (Jihyun) Kim, a UI/UX and product designer. What kind of designer is she, what has she worked on, and what are her strengths? Her portfolio: ${site}`
}
type AI = { id: string; name: string; url?: (q: string) => string; home?: string }
const AIS: AI[] = [
  { id: 'claude', name: 'Claude', url: q => `https://claude.ai/new?q=${encodeURIComponent(q)}` },
  { id: 'gemini', name: 'Gemini', home: 'https://gemini.google.com/app' },
  { id: 'openai', name: 'ChatGPT', url: q => `https://chatgpt.com/?q=${encodeURIComponent(q)}` },
  { id: 'grok', name: 'Grok', url: q => `https://grok.com/?q=${encodeURIComponent(q)}` },
  { id: 'perplexity', name: 'Perplexity', url: q => `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}` },
]

// Harbor's local time, shown as Seoul (Korea Standard Time)
const TZ = 'Asia/Seoul'
const CITY = 'Seoul'
const fmtTime = (d: Date) => d.toLocaleTimeString('en-US', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { timeZone: TZ, weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })

const FT_CSS = `
.foot:not(.ft) { display: none !important; }
footer.ft { position: relative; display: flex; justify-content: center; padding: 80px 0 40px; margin: 0; border: 0;
  background: #0A0809; color: #8C8C8C; box-shadow: inset 0 1px 0 rgba(255,255,255,.08); font-family: ${SANS}; }
.ft *, .ft *::before, .ft *::after { box-sizing: border-box; }
.ft .ft-in { display: flex; flex-direction: column; gap: 64px; width: min(1440px, calc(100vw - 64px)); }

/* text: links, copyright and "Back to top" 16/24; column headings 16/24 (typeface: Roboto, index.css) */
.ft .ft-links a, .ft .ft-copy, .ft .ft-top-btn { font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px;
  letter-spacing: 0; text-transform: none; white-space: nowrap; }
.ft .ft-h { margin: 0; font-family: ${SERIF}; font-size: 16px; font-weight: 400; line-height: 24px; letter-spacing: 0; color: #FAFAFA; white-space: nowrap; }

/* top row: 432 | 336 | 432 | 240 */
.ft .ft-top { display: flex; align-items: flex-start; width: 100%; }
.ft .ft-brand { flex: none; width: 30%; display: flex; flex-direction: column; align-items: flex-start; }
.ft .ft-col { flex: none; display: flex; flex-direction: column; gap: 16px; }
.ft .ft-col.c1 { width: 23.3333%; }
.ft .ft-col.c2 { width: 30%; }
.ft .ft-col.c3 { width: 16.6667%; }
.ft .ft-logo { display: inline-flex; color: #FAFAFA; text-decoration: none; transition: opacity .2s ease; }
.ft .ft-logo svg { display: block; width: 164px; height: 40px; }
.ft .ft-logo:hover { opacity: .8; }
.ft .ft-links { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin: 0; padding: 0; list-style: none; }
.ft .ft-links a { display: block; color: #8C8C8C; text-decoration: none; transition: color .2s ease; }
.ft .ft-links a:hover, .ft .ft-links a:focus-visible { color: #FAFAFA; }
.ft a:focus-visible, .ft button:focus-visible { outline: 2px solid #FAFAFA; outline-offset: 3px; }

/* Ask AI about Harbor + local time (v105, label v107) */
.ft .ft-ask { margin-top: 32px; display: flex; flex-direction: column; gap: 16px; }
.ft .ft-ask-k { margin: 0; font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px; letter-spacing: 0; color: #8C8C8C; white-space: nowrap; }
.ft .ft-ai { display: flex; gap: 8px; margin: 0; padding: 0; list-style: none; }
.ft .ft-ai a, .ft .ft-ai button { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; padding: 0; margin: 0;
  background: rgba(250,250,250,.06); border: 0; border-radius: 0; box-shadow: inset 0 0 0 1px rgba(250,250,250,.08);
  color: rgba(250,250,250,.72); cursor: pointer; text-decoration: none; transition: background-color .2s ease, color .2s ease; }
.ft .ft-ai a:hover, .ft .ft-ai button:hover, .ft .ft-ai a:focus-visible, .ft .ft-ai button:focus-visible { background: rgba(250,250,250,.12); color: #FAFAFA; }
.ft .ft-ai svg { display: block; width: 20px; height: 20px; }
.ft .ft-clock { margin: 32px 0 0; display: flex; flex-direction: column; font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px;
  color: #8C8C8C; font-variant-numeric: tabular-nums; white-space: nowrap; }

/* bottom row: 48px, line inside the top */
.ft .ft-bottom { display: flex; align-items: center; justify-content: space-between; gap: 24px; width: 100%; padding-top: 24px;
  box-shadow: inset 0 1px 0 rgba(250,250,250,.16); }
.ft .ft-copy { margin: 0; color: #8C8C8C; }
.ft .ft-top-btn { display: inline-flex; align-items: center; gap: 4px; padding: 0; margin: 0; background: none; border: 0; border-radius: 0; cursor: pointer;
  color: #8C8C8C; transition: color .2s ease; }
.ft .ft-top-btn .ar { display: inline-block; transition: transform .25s cubic-bezier(.22,1,.36,1); }
.ft .ft-top-btn:hover { color: #FAFAFA; }
.ft .ft-top-btn:hover .ar { transform: translateY(-3px); }

@media (max-width: 900px) {
  footer.ft { padding: 64px 0 32px; }
  .ft .ft-in { width: calc(100vw - 40px); gap: 48px; }
  .ft .ft-top { flex-wrap: wrap; row-gap: 40px; }
  .ft .ft-brand { width: 100%; }
  .ft .ft-col.c1, .ft .ft-col.c2, .ft .ft-col.c3 { width: 50%; }
  .ft .ft-bottom { flex-direction: column; align-items: flex-start; gap: 12px; }
  .ft .ft-copy { white-space: normal; }
}
@media (prefers-reduced-motion: reduce) {
  .ft .ft-top-btn .ar { transition: none; }
}
`

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** the logo and "Home": back to the top of the main page (from any page) */
const goHome = (e: React.MouseEvent) => {
  e.preventDefault()
  if (window.location.hash.startsWith('#/')) window.location.hash = ''
  else window.scrollTo({ top: 0, behavior: reduce() ? 'auto' : 'smooth' })
}
const toTop = () => window.scrollTo({ top: 0, behavior: reduce() ? 'auto' : 'smooth' })

function AskAI() {
  const [note, setNote] = useState('')
  useEffect(() => { if (!note) return; const t = window.setTimeout(() => setNote(''), 3000); return () => clearTimeout(t) }, [note])
  const openGemini = async (home: string) => {
    try { await navigator.clipboard.writeText(question()); setNote('Question copied — paste it in Gemini') } catch { setNote('Ask Gemini about Harbor') }
    window.open(home, '_blank', 'noopener')
  }
  return (
    <div className="ft-ask">
      <p className="ft-ask-k" aria-live="polite">{note || 'Ask AI about Harbor'}</p>
      <ul className="ft-ai">
        {AIS.map(ai => (
          <li key={ai.id}>
            {ai.url
              ? <a href={ai.url('Tell me about Harbor (Jihyun) Kim, a UI/UX and product designer.')} target="_blank" rel="noreferrer"
                  aria-label={`Ask ${ai.name} about Harbor`} title={`Ask ${ai.name}`}
                  onClick={e => { e.preventDefault(); window.open(ai.url!(question()), '_blank', 'noopener') }}
                  dangerouslySetInnerHTML={{ __html: AI_ICONS[ai.id] }} />
              : <button type="button" aria-label={`Ask ${ai.name} about Harbor (copies the question)`} title={`Ask ${ai.name}`}
                  onClick={() => openGemini(ai.home!)} dangerouslySetInnerHTML={{ __html: AI_ICONS[ai.id] }} />}
          </li>
        ))}
      </ul>
    </div>
  )
}

function LocalTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const t = window.setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  return (
    <p className="ft-clock" aria-label={`Harbor's local time in ${CITY}`}>
      <span>{CITY} {fmtTime(now)}</span>
      <span>{fmtDate(now)} (GMT +09)</span>
    </p>
  )
}

export function Footer() {
  return (
    <footer className="ft" aria-label="Site footer">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap" />
      <style>{FT_CSS}</style>
      <div className="ft-in">
        <div className="ft-top">
          <div className="ft-brand">
            <a className="ft-logo" href="#" aria-label="Harbor, main page" onClick={goHome} dangerouslySetInnerHTML={{ __html: FOOTER_LOGO_SVG }} />
            <AskAI />
            <LocalTime />
          </div>
          <nav className="ft-col c1" aria-label="Explore">
            <p className="ft-h">Explore</p>
            <ul className="ft-links">
              <li><a href="#" onClick={goHome}>Home</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#/about">About me</a></li>
              <li><a href={F.resume} target="_blank" rel="noreferrer" aria-label="Resume (opens in a new tab)">Resume</a></li>
            </ul>
          </nav>
          <nav className="ft-col c2" aria-label="Projects">
            <p className="ft-h">Projects</p>
            <ul className="ft-links">
              <li><a href="#/trust-bank">Trust Bank</a></li>
              <li><a href="#/gamecove">GameCove</a></li>
              <li><a href="#/utrada">UTrada</a></li>
            </ul>
          </nav>
          <nav className="ft-col c3" aria-label="Contact">
            <p className="ft-h">Contact</p>
            <ul className="ft-links">
              <li><a href={F.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
              <li><a href={F.instagram} target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href={F.email}>Email</a></li>
              <li><a href={F.cal} target="_blank" rel="noreferrer">Chat with me</a></li>
            </ul>
          </nav>
        </div>
        <div className="ft-bottom">
          <p className="ft-copy">© 2026 Harbor (Jihyun) Kim. All rights reserved.</p>
          <button type="button" className="ft-top-btn" onClick={toTop}>Back to top <span className="ar" aria-hidden="true">↑</span></button>
        </div>
      </div>
    </footer>
  )
}
