// Styles for the main page as it was in v74 (v24 restored): white page, original dark footer.
// Copied unchanged from v74's portfolio.ts so the v74 main page (Home.tsx) looks exactly as it did there.
// The About page and the case studies keep using portfolio.ts (v73 styles).
// Minimum text size is 16px. Type is Helvetica Neue throughout.
export const IMG = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/main-v2/'
export const IMG3 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/main-v3/'

export const CSS = `
:root {
  --ink: #0F0F0F; --paper: #FFFFFF; --off: #F5F5F2; --mute: #595959; --line: #DBDBD9; --ph: #E6E6E3;
  --font: "Helvetica Neue", Helvetica, Arial, sans-serif;
  --ease: cubic-bezier(.2, .7, .2, 1);
  --wrap: min(1320px, calc(100vw - 64px));
  color-scheme: light;
}
html { background: var(--paper); scroll-behavior: smooth; }
body { margin: 0; background: var(--paper); color: var(--ink); font-family: var(--font); font-size: 16px; -webkit-font-smoothing: antialiased; }
.hb, .hb * { box-sizing: border-box; }
.hb { overflow-x: clip; }
.hb a { color: inherit; text-decoration: none; }
.hb button { font: inherit; color: inherit; }
.wrap { width: var(--wrap); margin: 0 auto; }
.go { display: inline-block; transition: transform .25s var(--ease); }
a:hover .go, .card:hover .go, .exp-card:hover .go { transform: translateX(4px); }

/* ---------- reveal on scroll ---------- */
[data-reveal] { opacity: 0; transform: translateY(28px); transition: opacity .9s var(--ease), transform .9s var(--ease); transition-delay: calc(var(--d, 0) * 90ms); }
[data-reveal].in { opacity: 1; transform: none; }

/* ---------- fixed header ---------- */
.site { position: fixed; inset: 0 0 auto 0; z-index: 50; color: #fff; }
.announce { height: 44px; display: flex; align-items: center; justify-content: center; gap: 8px; overflow: hidden;
  background: rgba(255,255,255,.12); font-size: 16px; color: rgba(255,255,255,.9); transition: height .4s var(--ease), opacity .3s; }
.announce:hover span { transform: translateX(3px); }
.announce span { display: inline-block; transition: transform .25s; }
.bar { transition: background-color .35s ease, border-color .35s ease, backdrop-filter .35s; border-bottom: 1px solid transparent; }
.nav { height: 64px; margin: 16px auto 0; display: flex; align-items: center; justify-content: space-between; transition: margin .4s var(--ease); }
.site.scrolled .announce { height: 0; opacity: 0; }
.site.scrolled .bar { background: rgba(245,245,242,.88); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); border-bottom-color: var(--line); color: var(--ink); }
.site.scrolled .nav { margin-top: 0; }
.nav-left { display: flex; align-items: center; gap: 40px; }
.logo { font-size: 24px; font-weight: 600; }
.nav-links, .nav-right { display: flex; align-items: center; gap: 32px; font-size: 16px; }
.nav-links a, .nav-links span, .nav-right a:not(.btn-sm) { opacity: .8; transition: opacity .2s; }
.nav-links a:hover, .nav-right a:not(.btn-sm):hover { opacity: 1; }
.nav-links .current { opacity: 1; text-decoration: underline; text-underline-offset: 4px; }
.btn-sm { background: #fff; color: var(--ink); padding: 10px 16px; font-weight: 500; transition: background .3s, color .3s; }
.site.scrolled .btn-sm { background: var(--ink); color: #fff; }

/* ---------- hero ---------- */
.hero { position: relative; height: 100vh; min-height: 760px; max-height: 1080px; background: var(--ink); color: #fff; overflow: hidden; }
.hero-bg { position: absolute; inset: 0; will-change: transform; }
.hero-img { position: absolute; inset: 0; background-position: center; background-size: cover; animation: kb 9s var(--ease) both; }
@keyframes kb { from { transform: scale(1.1); } to { transform: scale(1); } }
.hero::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.10) 35%, rgba(0,0,0,.35) 70%, rgba(0,0,0,.75) 100%); }
.hero-copy { position: absolute; z-index: 2; left: 0; right: 0; bottom: 72px; text-align: center; }
.quote { margin: 0; font-size: 24px; font-weight: 300; color: rgba(255,255,255,.85); animation: rise .8s var(--ease) both; }
.h1 { margin: 20px 0 0; font-size: clamp(56px, 4.6vw, 88px); font-weight: 300; line-height: 1.1; letter-spacing: -0.03em; }
.h1 .l1 { display: block; animation: rise 1s var(--ease) .15s both; }
.h1 .sub { display: block; min-height: 1.1em; color: rgba(237,219,219,.7); }
.caret { display: inline-block; width: 2px; height: .9em; margin-left: 4px; vertical-align: -0.08em; background: currentColor; animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
@keyframes rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
.ctas { display: inline-flex; margin-top: 40px; }
.hero-ctas { animation: rise 1s var(--ease) .5s both; }
.btn { width: 240px; height: 60px; display: inline-flex; align-items: center; justify-content: center; font-size: 18px; transition: background .25s, color .25s; }
.btn-ghost { background: rgba(0,0,0,.35); border: 1px solid #fff; color: #fff; -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.btn-ghost:hover { background: #fff; color: var(--ink); }
.btn-light { background: #EDEDEB; color: var(--ink); font-weight: 500; }
.btn-light:hover { background: #fff; }
.q-progress { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
.q-progress span { position: relative; width: 48px; height: 3px; background: rgba(255,255,255,.3); overflow: hidden; }
.q-progress span.off { background: rgba(255,255,255,.15); }
.q-progress span.on::after { content: ""; position: absolute; inset: 0; background: #fff; transform-origin: 0 50%; animation: fill var(--ms) linear both; }
@keyframes fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }

/* ---------- experience strip: grid with corner dots ---------- */
.strip { background: var(--off); border-bottom: 1px solid var(--line); }
.strip-row { display: grid; grid-template-columns: repeat(6, 1fr); }
.cell { height: 124px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 500; color: var(--mute);
  border-left: 1px solid var(--line); transition: color .25s, background-color .25s;
  background-image: radial-gradient(circle, rgba(0,0,0,.35) 1px, transparent 1.6px), radial-gradient(circle, rgba(0,0,0,.35) 1px, transparent 1.6px);
  background-size: 8px 8px; background-repeat: no-repeat; background-position: 2px 2px, calc(100% - 2px) calc(100% - 2px); }
.cell:last-child { border-right: 1px solid var(--line); }
.cell:hover { color: var(--ink); background-color: #EFEFEB; }

/* ---------- sections ---------- */
.sec { padding: 160px 0; }
.sec.off { background: var(--off); }
.sec.dark { background: var(--ink); color: #fff; }
.eyebrow { font-size: 16px; color: var(--mute); }
.dark .eyebrow { color: rgba(255,255,255,.6); }
.h2 { margin: 20px 0 0; font-size: 64px; font-weight: 300; line-height: 1.1; letter-spacing: -0.03em; }
.h2-sm { font-size: 56px; }
.h2-xl { font-size: clamp(56px, 4.6vw, 88px); }
.sec-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 40px; margin-bottom: 80px; }
.link { font-size: 18px; font-weight: 500; display: inline-block; }
.tag { display: inline-block; padding: 6px 12px; border: 1px solid rgba(15,15,15,.2); font-size: 16px; font-weight: 400; line-height: 1.2; }
.dark .tag { border-color: rgba(255,255,255,.3); color: rgba(255,255,255,.8); }
.sub-dark { margin: 20px 0 0; font-size: 20px; color: rgba(255,255,255,.6); }

/* 01 approach + notification stack */
.approach { display: grid; grid-template-columns: 600px 1fr; gap: 120px; align-items: start; }
.lead { margin: 20px 0 0; font-size: 20px; line-height: 1.5; color: var(--mute); }
.notes { position: relative; height: 140px; margin-top: 48px; }
.note { position: absolute; left: 0; right: 80px; top: 24px; display: flex; align-items: center; gap: 14px; padding: 18px 20px;
  background: #fff; border: 1px solid var(--line); box-shadow: 0 8px 24px rgba(0,0,0,.06);
  transition: transform .7s var(--ease), opacity .5s ease; opacity: 0; transform: translateY(40px) scale(.96); }
.note[data-pos="0"] { opacity: 1; transform: none; z-index: 3; }
.note[data-pos="1"] { opacity: .6; transform: translateY(-12px) scale(.96); z-index: 2; }
.note[data-pos="2"] { opacity: .3; transform: translateY(-24px) scale(.92); z-index: 1; }
.note[data-pos="3"] { opacity: 0; transform: translateY(-36px) scale(.88); }
.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--ink); flex: none; }
.note-t { font-size: 18px; font-weight: 500; }
.note-s { margin-top: 2px; font-size: 16px; color: var(--mute); }
.list-row { display: flex; justify-content: space-between; align-items: center; padding: 32px 16px; margin: 0 -16px; border-top: 1px solid var(--line); transition: background-color .25s; }
.list-row:hover { background: var(--off); }
.list-title { display: flex; align-items: center; gap: 12px; font-size: 28px; }
.list-meta { margin-top: 8px; font-size: 18px; color: var(--mute); }
.arrow { font-size: 28px; transition: transform .3s var(--ease); }
.list-row:hover .arrow { transform: translateX(8px); }
.list-all { display: block; padding-top: 32px; border-top: 1px solid var(--line); font-size: 18px; font-weight: 500; }

/* 02 bento */
.grid-top { display: grid; grid-template-columns: 780px 1fr; gap: 24px; }
.grid-bottom { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 24px; }
.card { height: 680px; display: flex; flex-direction: column; gap: 24px; padding: 32px; background: #fff; border: 1px solid var(--line); transition: border-color .3s, box-shadow .4s var(--ease), opacity .9s var(--ease), transform .9s var(--ease); }
.card:hover { border-color: #BDBDBA; box-shadow: 0 18px 40px rgba(0,0,0,.07); }
.grid-bottom .card { height: 520px; }
.thumb { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; background: var(--ph); color: var(--mute); overflow: hidden; }
.thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform .8s var(--ease); }
.card:hover .thumb img { transform: scale(1.04); }
.card h3 { margin: 12px 0; font-size: 32px; font-weight: 400; letter-spacing: -0.02em; }
.card p { margin: 0; font-size: 18px; line-height: 1.5; color: var(--mute); }
.card-cta { font-size: 16px; font-weight: 500; }

/* 03 tabs: auto-advance with filling top line */
.tabs { display: grid; grid-template-columns: repeat(6, 1fr); margin-top: 80px; }
.tab { position: relative; display: flex; flex-direction: column; gap: 8px; padding: 24px 0; background: none; border: 0; border-top: 1px solid rgba(255,255,255,.2); text-align: left; cursor: pointer; }
.tab::before { content: ""; position: absolute; left: 0; right: 0; top: -1px; height: 2px; background: #fff; transform: scaleX(0); transform-origin: 0 50%; }
.tab.done::before { transform: scaleX(1); opacity: .35; }
.tab.on::before { transform: scaleX(1); }
.tabs.playing .tab.on::before { animation: fill var(--ms) linear both; }
.tab .num { font-size: 16px; opacity: .3; transition: opacity .3s; }
.tab .lab { font-size: 24px; opacity: .45; transition: opacity .3s; }
.tab:hover .lab { opacity: .8; }
.tab.on .num { opacity: .6; }
.tab.on .lab { opacity: 1; }
.panel { display: grid; grid-template-columns: 520px 1fr; gap: 80px; align-items: center; margin-top: 80px; }
.panel > div:first-child > * { animation: rise .6s var(--ease) both; }
.panel > div:first-child > *:nth-child(2) { animation-delay: .06s; }
.panel > div:first-child > *:nth-child(3) { animation-delay: .12s; }
.panel > div:first-child > *:nth-child(4) { animation-delay: .18s; }
.panel h3 { margin: 0; font-size: 48px; font-weight: 300; letter-spacing: -0.03em; }
.panel p { margin: 24px 0 0; font-size: 20px; line-height: 1.5; color: rgba(255,255,255,.7); }
.methods { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
.panel .link { margin-top: 24px; }
.visual { height: 520px; display: flex; align-items: center; justify-content: center; padding: 40px;
  background: radial-gradient(120% 90% at 70% 10%, rgba(255,255,255,.10), rgba(255,255,255,.03) 60%); border: 1px solid rgba(255,255,255,.08); animation: rise .6s var(--ease) both; }
.prompt { width: min(460px, 100%); padding: 20px 22px; background: #fff; color: var(--ink); border: 1px solid #fff; box-shadow: 0 0 0 4px rgba(127,170,255,.25), 0 20px 50px rgba(0,0,0,.35); }
.prompt-k { font-size: 16px; color: var(--mute); }
.prompt-t { margin-top: 10px; min-height: 3em; font-size: 20px; line-height: 1.45; }

/* 04 experience */
.exp { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.exp-card { height: 380px; display: flex; flex-direction: column; justify-content: space-between; padding: 40px; background: var(--off); transition: background-color .3s, opacity .9s var(--ease), transform .9s var(--ease); }
.exp-card:hover { background: #ECECE8; }
.exp-card h3 { margin: 16px 0 0; font-size: 36px; font-weight: 300; letter-spacing: -0.02em; }
.exp-card p { margin: 16px 0 0; font-size: 18px; line-height: 1.5; color: var(--mute); }
.exp-bottom { display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 500; }
.exp-bottom .go { font-size: 24px; font-weight: 400; }

/* 05 kind words: horizontal carousel that bleeds off the right edge */
.arrows { display: flex; gap: 8px; }
.arrows button { width: 56px; height: 56px; background: none; border: 1px solid rgba(15,15,15,.2); font-size: 20px; cursor: pointer; transition: background .2s, color .2s; }
.arrows button:hover { background: var(--ink); color: #fff; }
.track { display: flex; gap: 24px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; cursor: grab;
  padding: 0 calc((100vw - var(--wrap)) / 2); scroll-padding-left: calc((100vw - var(--wrap)) / 2); }
.track::-webkit-scrollbar { display: none; }
.track.drag { cursor: grabbing; scroll-snap-type: none; user-select: none; }
.word { flex: 0 0 520px; height: 440px; scroll-snap-align: start; display: flex; flex-direction: column; justify-content: space-between; padding: 40px; background: #fff; border: 1px solid var(--line); transition: border-color .3s; }
.word:hover { border-color: #BDBDBA; }
.mark { font-size: 64px; font-weight: 300; line-height: 1; }
.word p { margin: 0; font-size: 24px; font-weight: 300; line-height: 1.4; }
.author { display: flex; justify-content: space-between; align-items: flex-end; }
.name { font-size: 18px; font-weight: 500; }
.role { margin-top: 4px; font-size: 16px; color: var(--mute); }
.read { font-size: 16px; font-weight: 500; }

/* CTA: framed grid + growing bar field */
.cta-sec { background: var(--ink); color: #fff; }
.cta-frame { position: relative; width: var(--wrap); margin: 0 auto; padding: 200px 0 0; text-align: center; border-left: 1px solid rgba(255,255,255,.1); border-right: 1px solid rgba(255,255,255,.1); }
.cta-inner { position: relative; z-index: 1; }
.cta-sec .h2 { margin-top: 0; }
.bars { height: 200px; margin-top: 120px; display: flex; align-items: flex-end; gap: 0; border-top: 1px solid rgba(255,255,255,.1); opacity: 1 !important; transform: none !important; }
.bars i { flex: 1; height: 100%; margin-right: 3px; background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,.08));
  transform: scaleY(0); transform-origin: 50% 100%; transition: transform 1.2s var(--ease); transition-delay: calc(var(--i) * 6ms); }
.bars.in i { transform: scaleY(var(--h)); }

/* footer */
.foot { position: relative; overflow: hidden; background: var(--ink); color: #fff; padding: 80px 0 0; border-top: 1px solid rgba(255,255,255,.12); }
.foot-top { display: flex; justify-content: space-between; gap: 40px; }
.brand { display: flex; flex-direction: column; gap: 16px; }
.brand a { font-size: 18px; color: rgba(255,255,255,.8); }
.foot-cols { display: flex; gap: 120px; }
.foot-col { display: flex; flex-direction: column; gap: 14px; font-size: 18px; color: rgba(255,255,255,.85); }
.foot-col .h { font-size: 16px; color: rgba(255,255,255,.5); }
.foot-col a { transition: color .2s; }
.foot-col a:hover { color: #fff; text-decoration: underline; text-underline-offset: 4px; }
.foot-bottom { display: flex; justify-content: space-between; margin-top: 64px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,.12); font-size: 16px; color: rgba(255,255,255,.5); }
.wordmark { margin-top: 40px; text-align: center; font-size: 26vw; font-weight: 600; line-height: .78; letter-spacing: -0.05em; color: rgba(255,255,255,.05); user-select: none; transform: translateY(12%); }

/* corner toast */
.toast { position: fixed; right: 24px; bottom: 24px; z-index: 60; display: flex; align-items: center; gap: 14px; width: 360px; padding: 10px 44px 10px 10px;
  background: #fff; color: var(--ink); border: 1px solid var(--line); box-shadow: 0 16px 40px rgba(0,0,0,.14);
  transform: translateY(24px); opacity: 0; pointer-events: none; transition: transform .6s var(--ease), opacity .4s; }
.toast.show { transform: none; opacity: 1; pointer-events: auto; }
.toast img { width: 64px; height: 64px; object-fit: cover; flex: none; }
.toast-t { font-size: 16px; font-weight: 500; }
.toast-s { margin-top: 4px; font-size: 16px; color: var(--mute); }
.toast button { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; background: none; border: 0; font-size: 20px; line-height: 1; cursor: pointer; color: var(--mute); }

/* narrower screens */
@media (max-width: 1280px) {
  .approach, .grid-top, .panel { grid-template-columns: 1fr; gap: 48px; }
  .exp { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .nav-links, .nav-right a:not(.btn-sm) { display: none; }
  .strip-row { grid-template-columns: repeat(3, 1fr); }
  .grid-bottom, .exp, .tabs { grid-template-columns: 1fr; }
  .word { flex-basis: 85vw; }
  .h2, .h2-sm { font-size: 44px; }
  .sec-head { flex-direction: column; align-items: flex-start; }
  .foot-top, .foot-bottom { flex-direction: column; gap: 32px; }
  .toast { left: 16px; right: 16px; width: auto; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-delay: 0ms !important; transition-duration: .01ms !important; transition-delay: 0ms !important; }
  html { scroll-behavior: auto; }
  [data-reveal] { opacity: 1; transform: none; }
}
`
