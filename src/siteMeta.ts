// Site meta (v22–v25, Harbor Nov 18–19; v26–v27 Nov 20), loaded once from index.tsx.
//
// 1) HTML comments at the very top of the page, as Framer sites show them in the browser's Inspect panel
//    (Elements tab, just above <html>):
//    - (v26, Harbor Nov 20) a "HARBOR KIM" text-art banner first — the fun bit a curious recruiter finds in Inspect;
//    - "Made in South Korea • harborkim.com";
//    - the publish time in Harbor's time zone, Korea (KST, UTC+9). It is written by hand: update PUBLISHED whenever a
//      new version is published.
//    (v26) The host's own "Published <id> created by Magic Patterns" comment is taken out of the page when it loads, so
//    Inspect shows only Harbor's lines. (The browser's "View Page Source" still shows the file as the host sent it.)
//
// 2) Microsoft Clarity (project zfm0kxnquy) — to see whether recruiters abroad open the portfolio, which country they
//    come from, and where they stop scrolling or leave.
//    Fix (v25, Nov 19): Clarity's loader (clarity.ms/tag/<id>) inserts clarity.js next to the page's first <script>
//    element. The published site has no <script> elements left when the loader runs, so it crashed
//    ("Cannot read properties of undefined (reading 'parentNode')") and nothing was ever recorded. Now an inert
//    placeholder <script type="text/plain" data-hb-anchor> is kept in <head> (it never runs), and the loader is added
//    only after the page has finished loading. The clarity() queue is set up right away, so page tags set before that
//    are still sent.
//    Clarity's IP blocking excludes Harbor's home Wi-Fi — to test, open the site on mobile data, not home Wi-Fi.
//
// 3) Google Tag Manager (container GTM-599XN2L8, v23). Harbor's snippet loaded gtm.js and started gtag('js'); the
//    standard GTM start event ({ 'gtm.start', event: 'gtm.js' }) is pushed first as well, because GTM's "All Pages" /
//    "Page View" triggers fire on that event and would never fire without it.
//
// 4) Google Analytics 4 (v24, Nov 19): web stream "harbor porfolio", measurement ID G-153F3E0DL2, loaded directly with
//    gtag.js (Google's standard snippet). It shares the dataLayer and gtag() set up for GTM above.
//    Don't also add a GA4 / Google tag for G-153F3E0DL2 inside the GTM container — every visit would be counted twice.
//    Page views (v27, Nov 20): GA4 ignores the #/ part of the address, so on its own it saw every page as
//    harborkim.com/ and sent no page view when you opened a case study. Now the automatic first page view is off
//    (send_page_view: false) and the site sends one page view per page itself, with a clean path GA4 can tell apart:
//      main → /   trust-bank → /trust-bank   gamecove → /gamecove   utrada → /utrada   eto-markets → /eto-markets
//      about → /about
//    The address is also "set" for everything sent afterwards (scrolls, outbound clicks, engagement time), so those
//    count toward the page they happened on. Any ?utm_… query on the address is kept, so campaign links still work.
//
// Clarity, GTM and GA4 load only on the live site (harborkim.com), so visits to the Magic Patterns preview don't mix
// into the data. Every page change (the site changes pages with #/ links) is reported:
//   - Clarity: a "page" tag (main, trust-bank, gamecove, utrada, eto-markets, about) for its filters;
//   - GTM: a dataLayer event "hb_page_change" with { hb_page: … } — use it as a Custom Event trigger in GTM;
//   - GA4: a page_view with the clean path above (v27).
// Note: since Oct 31, 2025 Clarity needs a consent signal for visitors from the EEA, UK and Switzerland; without one
// it records those visits without cookies. There is no consent banner on the site.

// "Harbor Kim" in the ANSI Shadow figlet letters (no backslashes, backticks or "--", so it is safe in a comment)
const BANNER_ART = [
  '██╗  ██╗ █████╗ ██████╗ ██████╗  ██████╗ ██████╗     ██╗  ██╗██╗███╗   ███╗',
  '██║  ██║██╔══██╗██╔══██╗██╔══██╗██╔═══██╗██╔══██╗    ██║ ██╔╝██║████╗ ████║',
  '███████║███████║██████╔╝██████╔╝██║   ██║██████╔╝    █████╔╝ ██║██╔████╔██║',
  '██╔══██║██╔══██║██╔══██╗██╔══██╗██║   ██║██╔══██╗    ██╔═██╗ ██║██║╚██╔╝██║',
  '██║  ██║██║  ██║██║  ██║██████╔╝╚██████╔╝██║  ██║    ██║  ██╗██║██║ ╚═╝ ██║',
  '╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝',
]
const BANNER = '\n' + BANNER_ART.map(l => '  ' + l).join('\n') + '\n'
const MADE = ' Made in South Korea • harborkim.com '
const PUBLISHED = ' Published Nov 20, 2026, 11:05 PM KST (UTC+9) '

const LIVE_HOSTS = ['harborkim.com', 'www.harborkim.com']
const CLARITY_ID = 'zfm0kxnquy'
const GTM_ID = 'GTM-599XN2L8'
const GA4_ID = 'G-153F3E0DL2'

/** page titles sent to GA4 (fixed, so a background tab's "Still here?" title never ends up in the reports) */
const GA4_TITLES: Record<string, string> = {
  main: 'Home',
  'trust-bank': 'Trust Bank',
  gamecove: 'GameCove',
  utrada: 'UTrada',
  'eto-markets': 'ETO Markets',
  about: 'About',
}

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] }
declare global {
  interface Window { clarity?: ClarityFn; dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; __hbMeta?: boolean }
}

/** the host's "Published … created by Magic Patterns" comment(s) above <html> */
function removeHostComments() {
  Array.from(document.childNodes).forEach(n => {
    if (n.nodeType === Node.COMMENT_NODE && /magic\s*patterns/i.test(n.nodeValue || '')) n.parentNode?.removeChild(n)
  })
}

function addComments() {
  removeHostComments()
  const html = document.documentElement
  document.insertBefore(document.createComment(BANNER), html)
  document.insertBefore(document.createComment(MADE), html)
  document.insertBefore(document.createComment(PUBLISHED), html)
}

/** an inert <script> in <head> (type text/plain never runs), for loaders that look up the page's first <script> */
function ensureAnchor() {
  if (document.querySelector('script[data-hb-anchor]')) return
  const a = document.createElement('script')
  a.type = 'text/plain'
  a.setAttribute('data-hb-anchor', '')
  document.head.appendChild(a)
}

function addScript(src: string) {
  ensureAnchor()
  const t = document.createElement('script')
  t.async = true
  t.src = src
  document.head.appendChild(t)
}

/** run once the page has finished loading */
function afterLoad(fn: () => void) {
  if (document.readyState === 'complete') fn()
  else window.addEventListener('load', fn, { once: true })
}

/** Clarity's own snippet (queue first, then the loader), with the loader added after the page has loaded */
function loadClarity() {
  const w = window as Window & Record<string, any>
  w.clarity = w.clarity || (function (...args: unknown[]) { (w.clarity!.q = w.clarity!.q || []).push(args) } as ClarityFn)
  afterLoad(() => addScript('https://www.clarity.ms/tag/' + CLARITY_ID))
}

/** the shared dataLayer + gtag() (Google's standard definition), used by both GTM and GA4 */
function ensureGtag() {
  window.dataLayer = window.dataLayer || []
  if (!window.gtag) window.gtag = function () { window.dataLayer!.push(arguments) }
}

/** Google Tag Manager: the standard start event, then Harbor's snippet (dataLayer + gtag('js')) */
function loadGTM() {
  ensureGtag()
  window.dataLayer!.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
  window.gtag!('js', new Date())
  addScript('https://www.googletagmanager.com/gtm.js?id=' + GTM_ID)
}

/** Google Analytics 4: Google's gtag.js snippet for the measurement ID (gtag('js') was already called in loadGTM).
 *  The automatic page view is off — tagPages() sends one per page (v27). */
function loadGA4() {
  ensureGtag()
  addScript('https://www.googletagmanager.com/gtag/js?id=' + GA4_ID)
  window.gtag!('config', GA4_ID, { send_page_view: false })
}

/** the page name from the #/ route: "main" for the main page and its sections */
const pageName = () => {
  const h = location.hash
  return h.startsWith('#/') ? h.slice(2).split(/[/?#]/)[0] || 'main' : 'main'
}

/** GA4 page view for a page: a clean path (/ or /<page>) plus the address's ?query (utm_…), and a fixed title */
function ga4PageView(p: string) {
  if (!window.gtag) return
  const path = p === 'main' ? '/' : '/' + p
  const page_location = location.origin + path + location.search
  const page_title = GA4_TITLES[p] || p
  window.gtag('set', { page_location, page_title })
  window.gtag('event', 'page_view', { page_location, page_title })
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
    ga4PageView(p)
  }
  send()
  window.addEventListener('hashchange', send)
}

if (typeof window !== 'undefined' && !window.__hbMeta) {
  window.__hbMeta = true
  addComments()
  if (LIVE_HOSTS.includes(location.hostname)) {
    loadGTM()
    loadGA4()
    loadClarity()
    tagPages()
  }
}

export {}
