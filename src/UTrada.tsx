import React from 'react'
import { UTradaV9 } from './UTradaV9'
import { EtoV5 } from './EtoV5'

export const ETO_IMG = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/'

export function UTrada() { return <UTradaV9 /> }
export function EtoMarkets() { return <EtoV5 /> }
