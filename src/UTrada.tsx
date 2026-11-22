import React from 'react'
import { UTradaV9 } from './UTradaV9'
import { EtoV6 } from './EtoV6'

export const ETO_IMG = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/'

export function UTrada() { return <UTradaV9 /> }

// Nov 22: ETO Markets rebuilt from the new Figma (EtoV6). EtoV5 stays in the design, unused.
// Fix: the menu before → after canvas sets its class on every scroll step, which dropped the page's reveal class ("in")
// and left it invisible. It runs its own steps, so it skips the reveal.
const ETO_FIX = `.e6 .e6-ia[data-r] { opacity: 1; transform: none; }`
export function EtoMarkets() { return <><style>{ETO_FIX}</style><EtoV6 /></> }
