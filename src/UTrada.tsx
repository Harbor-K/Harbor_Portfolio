import React from 'react'
import { UTradaV9 } from './UTradaV9'
import { EtoV5 } from './EtoV5'

// Case-study routes: UTrada (#/utrada) and ETO Markets (#/eto-markets), rendered by index.tsx.
// v134 (Nov 16): UTrada got its own page from Figma "UTrada_v.3 · Design" (UTradaV3.tsx).
// v148 (Nov 18): rebuilt from Figma "UTrada_v.6 · Final" (1890:1214) with GameCove's motion (UTradaV6.tsx).
// v21 (Nov 18, editor version): rebuilt again from Harbor's revised "UTrada_v.6 · Final (Trust Bank level)" frame —
// purple Process scene, broker diagram, trust chart, three screen panels (UTradaV7.tsx).
// Nov 21: rebuilt from Figma "UTrada_v.9 · Persuasive design + trading concept" (2133:16974) with interactions
// (UTradaV9.tsx). V3, V6 and V7 stay in the design, unused, so an older version can be brought back by changing the
// line below.
// v135: ETO Markets became the full case study built from Harbor's Figma (EtoV3.tsx).
// v28 (Nov 19): ETO Markets rebuilt from Figma "06 ETO Markets — 1920 · v3" (1813:20918), framed around IB partners
// (EtoV4.tsx).
// v29 (Nov 19): rebuilt again from the same frame in file 44기 김지현 4차 PF (982:162) — Define step, benchmark table,
// three-layer dashboard, working dashboard concept, menu before/after, sideways before/after slider (EtoV5.tsx).
// EtoV3 and EtoV4 stay in the design, unused.

export const ETO_IMG = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/'

export function UTrada() { return <UTradaV9 /> }
export function EtoMarkets() { return <EtoV5 /> }
