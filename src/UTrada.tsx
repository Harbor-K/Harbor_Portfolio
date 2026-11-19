import React from 'react'
import { UTradaV7 } from './UTradaV7'
import { EtoV5 } from './EtoV5'

// Case-study routes: UTrada (#/utrada) and ETO Markets (#/eto-markets), rendered by index.tsx.
// v134 (Nov 16): UTrada got its own page from Figma "UTrada_v.3 · Design" (UTradaV3.tsx).
// v148 (Nov 18): rebuilt from Figma "UTrada_v.6 · Final" (1890:1214) with GameCove's motion (UTradaV6.tsx).
// v21 (Nov 18, editor version): rebuilt again from Harbor's revised "UTrada_v.6 · Final (Trust Bank level)" frame —
// purple Process scene, broker diagram, trust chart, three screen panels (UTradaV7.tsx). V3 and V6 stay in the
// design, unused, so an older version can be brought back by changing the line below.
// v135: ETO Markets became the full case study built from Harbor's Figma (EtoV3.tsx).
// v28 (Nov 19): ETO Markets rebuilt from Figma "06 ETO Markets — 1920 · v3" (1813:20918), framed around IB partners
// (EtoV4.tsx).
// v29 (Nov 19): rebuilt again from the same frame in file 44기 김지현 4차 PF (982:162) — Define step, benchmark table,
// three-layer dashboard, working dashboard concept, menu before/after, sideways before/after slider (EtoV5.tsx).
// EtoV3 and EtoV4 stay in the design, unused.
// The old "fill in the TBD" skeleton that used to live here was unused since v134 and has been removed.

export const ETO_IMG = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/'

// Two layout fixes for UTradaV7 found when checking the page in the browser (move them into U7_CSS on its next edit):
// - the history card re-renders its class when its rail starts, which wiped the soft-reveal class, so it stayed
//   invisible: it is simply shown (its dots and lines still animate in);
// - the finding cards' first lines run 2 or 3 lines long, so "What it meant for UTrada" sat at different heights:
//   the line keeps Figma's 3-line height (96px) so the three cards line up.
const U7_FIX = `
.u7 .u7-hist[data-r] { opacity: 1; transform: none; }
.u7 .u7-find .lead { min-height: 96px; }
@media (max-width: 1023px) { .u7 .u7-find .lead { min-height: 0; } }
`

// Fixes for EtoV5 found when checking the page in the browser (move them into E5_CSS on its next edit):
// - the site's shared .card style (portfolio.ts: 680px tall, 32px padding, hover border) reached the slider cards,
//   and the shared .bar style (the old header bar's bottom line) reached the result bars: both are reset here;
// - the broker logos are exported on the table header's own colour, so they don't need the multiply blend
//   (it made them look like grey chips);
// - the takeaways title breaks after "list," like Figma (two lines on wide screens).
const E5_FIX = `
.e5 .e5-slide .card { height: auto; padding: 0; gap: 0; display: block; border: 0; border-radius: 0; background: var(--canvas); box-shadow: 0 0 0 1px var(--cline); }
.e5 .e5-slide .card:hover { border-color: transparent; box-shadow: 0 0 0 1px var(--cline); }
.e5 .e5-rcard .bar { border-bottom: 0; background: none; -webkit-backdrop-filter: none; backdrop-filter: none; transition: none; }
.e5 .e5-bm-t thead img { mix-blend-mode: normal; }
.e5 .e5-take .t { max-width: 1000px; }
`

export function UTrada() { return <><style>{U7_FIX}</style><UTradaV7 /></> }
export function EtoMarkets() { return <><style>{E5_FIX}</style><EtoV5 /></> }
