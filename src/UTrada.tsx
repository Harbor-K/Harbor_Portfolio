import React from 'react'
import { UTradaV7 } from './UTradaV7'
import { EtoV3 } from './EtoV3'

// Case-study routes: UTrada (#/utrada) and ETO Markets (#/eto-markets), rendered by index.tsx.
// v134 (Nov 16): UTrada got its own page from Figma "UTrada_v.3 · Design" (UTradaV3.tsx).
// v148 (Nov 18): rebuilt from Figma "UTrada_v.6 · Final" (1890:1214) with GameCove's motion (UTradaV6.tsx).
// v21 (Nov 18, editor version): rebuilt again from Harbor's revised "UTrada_v.6 · Final (Trust Bank level)" frame —
// purple Process scene, broker diagram, trust chart, three screen panels (UTradaV7.tsx). V3 and V6 stay in the
// design, unused, so an older version can be brought back by changing the line below.
// v135: ETO Markets is the full case study built from Harbor's Figma (EtoV3.tsx).
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

export function UTrada() { return <><style>{U7_FIX}</style><UTradaV7 /></> }
export function EtoMarkets() { return <EtoV3 /> }
