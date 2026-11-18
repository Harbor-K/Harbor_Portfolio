// Site meta (v22–v23, Harbor Nov 18), loaded once from index.tsx.
//
// 1) Two HTML comments at the very top of the page, as Framer sites show them in the browser's Inspect panel
//    (Elements tab, just above <html>). The publish time is in Harbor's time zone, Korea (KST, UTC+9).
//    It is written by hand: update PUBLISHED whenever a new version is published.
//
// 2) Microsoft Clarity (project zfm0kxnquy) — to see whether recruiters abroad open the portfolio, which country they
//    come from, and where they stop scrolling or leave.
//
// 3) Google Tag Manager (container GTM-599XN2L8, v23). Harbor's snippet loaded gtm.js and started gtag('js'); the
//    standard GTM start event ({ 'gtm.start', event: 'gtm.js' }) is pushed first as well, because GTM's "All Pages" /
//    "Page View" triggers fire on that event and would never fire without it.
//
// Clarity and GTM load only on the live site (harborkim.com), so visits to the Magic Patterns preview don't mix into
// the data. Every page change (the site changes pages with #/ links) is reported to both:
//   - Clarity: a "page" tag (main, trust-bank, gamecove, utrada, eto-markets, about) for its filters;
//   - GTM: a dataLayer event "hb_page_change" with { hb_page: … } — use it as a Custom Event trigger in GTM.
// Note: since Oct 31, 2025 Clarity needs a consent signal for visitors from the EEA, UK and Switzerland; without one
// it records those visits without cookies. There is no consent banner on the site.

const MADE = ' Made in South Korea • harborkim.com '
const PUBLISHED = ' Published Nov 18, 2026, 11:58 PM KST (UTC+9) '

const LIVE_HOSTS = ['harborkim.com', 'www.harborkim.com']
const CLARITY_ID = 'zfm0kxnquy'
const GTM_ID = 'GTM-599XN2L8'

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] }
declare global {
  interface Window { clarity?: ClarityFn; dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; __hbMeta?: boolean }
}

function addComments() {
  const html = document.documentElement
  document.insertBefore(document.createComment(MADE), html)
  document.insertBefore(document.createComment(PUBLISHED), html)
}

function addScript(src: string) {
  const t = document.createElement('script')
  t.async = true
  t.src = src
  const y = document.getElementsByTagName('script')[0]
  if (y && y.parentNode) y.parentNode.insertBefore(t, y)
  else document.head.appendChild(t)
}

/** Clarity's own snippet, as given in the Clarity dashboard */
function loadClarity() {
  const w = window as Window & Record<string, any>
  w.clarity = w.clarity || (function (...args: unknown[]) { (w.clarity!.q = w.clarity!.q || []).push(args) } as ClarityFn)
  addScript('https://www.clarity.ms/tag/' + CLARITY_ID)
}

/** Google Tag Manager: the standard start event, then Harbor's snippet (dataLayer + gtag('js')) */
function loadGTM() {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
  window.gtag = function () { window.dataLayer!.push(arguments) }
  window.gtag('js', new Date())
  addScript('https://www.googletagmanager.com/gtm.js?id=' + GTM_ID)
}

/** the page name from the #/ route: "main" for the main page and its sections */
const pageName = () => {
  const h = location.hash
  return h.startsWith('#/') ? h.slice(2).split(/[/?#]/)[0] || 'main' : 'main'
}

function tagPages() {
  let last = ''
  const send = () => {
    const p = pageName()
    if (p === last) return
    const first = last === ''
    last = p
    window.clarity?.('set', 'page', p)
    window.dataLayer?.push({ event: 'hb_page_change', hb_page: p, hb_first_page: first })
  }
  send()
  window.addEventListener('hashchange', send)
}

if (typeof window !== 'undefined' && !window.__hbMeta) {
  window.__hbMeta = true
  addComments()
  if (LIVE_HOSTS.includes(location.hostname)) {
    loadGTM()
    loadClarity()
    tagPages()
  }
}

export {}
