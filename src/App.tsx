import React, { useEffect } from 'react'
import { SiteHeaderB } from './SiteHeaderB'
import { ClosingCTAB } from './ClosingCTAB'

// Shared pieces for the About page (Pages.tsx imports them from here).
// Header: the site header every page uses (SiteHeaderB.tsx; 'light' mode on the white About page).
// Closing section (v79): Harbor's Figma Closing CTA with the working Kim LLM chat (ClosingCTAB.tsx) — the same one the
// main page uses.
// Footer: Harbor's Figma footer (Footer.tsx), rendered under every page by index.tsx. SiteFooter stays as an empty
// component so the About page's import still works.

export { VoiceAssistant, useVoice } from './KimLLM'

export const LINKS = {
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
  linkedin: 'https://www.linkedin.com/in/harborkim/',
  instagram: 'https://instagram.com/harbor_0328',
  email: 'mailto:harborkim0328@gmail.com',
  cv: `mailto:harborkim0328@gmail.com?subject=${encodeURIComponent('CV request')}`,
}

export const BARS = 140

// (the closing section brings its own styles now)
export const PAGE_CSS = ``

export type NavKey = 'about' | undefined

// The site header (SiteHeaderB) in its light mode, for the About page.
export function SiteHeader({ current }: { current?: NavKey; solid?: boolean }) {
  return <SiteHeaderB mode="light" current={current} />
}

// Harbor's Figma Closing CTA with the Kim LLM chat (ClosingCTAB.tsx).
export function ClosingCTA() {
  return <ClosingCTAB />
}

// The site footer is Footer.tsx, rendered once under every page by index.tsx.
export function SiteFooter() {
  return null
}

// Scroll reveals for anything marked data-reveal. Pass a key that changes when the content changes.
export function useReveal(dep?: unknown) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.in)'))
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [dep])
}
