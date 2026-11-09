import React from 'react'
import { FOOTER_LOGO_SVG } from './harborLogo'

// Site footer — Harbor's Figma "footer.ft" in the main page frame (44기 김지현 4차 PF, node 538:6543), built to the
// frame exactly. index.tsx renders it under every page (main, About, Trust Bank, GameCove, UTrada); the pages' older
// footers (class "foot") are hidden.
// - #0A0809, a 1px rgba(255,255,255,.08) line drawn inside the top, 80px top / 40px bottom padding: 392px tall at 1920.
// - 1440 container, 64px between the top row and the bottom row.
// - Top row (160px): the Harbor logo (Figma's own SVG, 167×40) in a 432px column, then three link columns —
//   Explore 336px (Home, Projects, About me, Resume), Projects 432px (Trust Bank, GameCove, UTrada), Contact 240px
//   (LinkedIn, Instagram, Email, Book a call). Headings #FAFAFA, links #8C8C8C; 16px under a heading, 8px between links.
// - Bottom row (48px): a 1px rgba(250,250,250,.16) line inside its top, 24px padding, then "© 2026 Harbor (Jihyun) Kim.
//   All rights reserved." on the left and "Back to top ↑" on the right, both #8C8C8C.
// Type: every text in the footer is one style — Helvetica Neue Regular 16/24 (Figma shows it as Arimo, its stand-in),
// sentence case (v86, Harbor: "CV" is now "Resume", like the header button).
// Lines are drawn inside boxes (inset shadows), like Figma's inside strokes, so no line adds to a size.
// Interactions: links and the logo brighten on hover; the logo and "Home" go to the top of the main page;
// "Resume" opens an email asking for it (no file yet), like the header's Resume button;
// "Back to top ↑" scrolls this page to the top (its arrow nudges up on hover).

const MAIL = 'harborkim0328@gmail.com'
const F = {
  linkedin: 'https://www.linkedin.com/in/harborkim/',
  instagram: 'https://instagram.com/harbor_0328',
  email: `mailto:${MAIL}`,
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
  resume: `mailto:${MAIL}?subject=${encodeURIComponent('Resume request')}`,
}
const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif'

const FT_CSS = `
.foot:not(.ft) { display: none !important; }
footer.ft { position: relative; display: flex; justify-content: center; padding: 80px 0 40px; margin: 0; border: 0;
  background: #0A0809; color: #8C8C8C; box-shadow: inset 0 1px 0 rgba(255,255,255,.08); font-family: ${SANS}; }
.ft *, .ft *::before, .ft *::after { box-sizing: border-box; }
.ft .ft-in { display: flex; flex-direction: column; gap: 64px; width: min(1440px, calc(100vw - 64px)); }

/* one text style for the whole footer: Helvetica Neue Regular 16/24 */
.ft .ft-h, .ft .ft-links a, .ft .ft-copy, .ft .ft-top-btn { font-family: ${SANS}; font-size: 16px; font-weight: 400; line-height: 24px;
  letter-spacing: 0; text-transform: none; white-space: nowrap; }

/* top row: 432 | 336 | 432 | 240 */
.ft .ft-top { display: flex; align-items: flex-start; width: 100%; }
.ft .ft-brand { flex: none; width: 30%; }
.ft .ft-col { flex: none; display: flex; flex-direction: column; gap: 16px; }
.ft .ft-col.c1 { width: 23.3333%; }
.ft .ft-col.c2 { width: 30%; }
.ft .ft-col.c3 { width: 16.6667%; }
.ft .ft-logo { display: inline-flex; color: #FAFAFA; text-decoration: none; transition: opacity .2s ease; }
.ft .ft-logo svg { display: block; width: 167px; height: 40px; }
.ft .ft-logo:hover { opacity: .8; }
.ft .ft-h { margin: 0; color: #FAFAFA; }
.ft .ft-links { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin: 0; padding: 0; list-style: none; }
.ft .ft-links a { display: block; color: #8C8C8C; text-decoration: none; transition: color .2s ease; }
.ft .ft-links a:hover, .ft .ft-links a:focus-visible { color: #FAFAFA; }
.ft a:focus-visible, .ft button:focus-visible { outline: 2px solid #FAFAFA; outline-offset: 3px; }

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

export function Footer() {
  return (
    <footer className="ft" aria-label="Site footer">
      <style>{FT_CSS}</style>
      <div className="ft-in">
        <div className="ft-top">
          <div className="ft-brand">
            <a className="ft-logo" href="#" aria-label="Harbor, main page" onClick={goHome} dangerouslySetInnerHTML={{ __html: FOOTER_LOGO_SVG }} />
          </div>
          <nav className="ft-col c1" aria-label="Explore">
            <p className="ft-h">Explore</p>
            <ul className="ft-links">
              <li><a href="#" onClick={goHome}>Home</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#/about">About me</a></li>
              <li><a href={F.resume} aria-label="Resume, request it by email">Resume</a></li>
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
              <li><a href={F.cal} target="_blank" rel="noreferrer">Book a call</a></li>
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
