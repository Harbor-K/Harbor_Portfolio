// Harbor's logo (v88) — Figma node 569:10674, 78×19: the Harbor mark + the "Harbor" wordmark, with the type outlined so it
// is the same artwork on every device. Mark and wordmark take the text colour (`currentColor`). The mark's mask in the
// export only clipped empty space, so it is left out (no duplicate ids when the header and footer logos are on the same page).
// v110 (Harbor, Nov 12): the wordmark is Roboto Medium 16px (was Newsreader Medium), to match the site's Roboto type.
//   Outlined from Google Fonts' Roboto (variable, wght 500 / wdth 100) with HarfBuzz shaping (kerning on), and moved so
//   the H's stem starts where Newsreader's H started (x 20.672) — the gap to the mark is unchanged. The word is 48.2
//   wide (it was 50.2), so it still fits the 78×19 box; the mark is untouched.
// v111 (Harbor: "Harbor sits high next to the icon"): the word is centred on the mark vertically. The mark runs
//   y 1.870 → 16.995 (centre 9.433); the word's capitals run 2.625 → 14 (centre 8.3125), so the word moves down 1.12
//   (WORD_DY) and its cap-height centre now sits on the mark's centre.
// v113 (Harbor: "make the icon come alive and spin on hover, something fun"): the mark is its own group (.hb-mark,
//   turning about its own centre), and pointing at the header or footer logo (.hd-logo / .ft-logo) spins it —
//   • pointer in (or keyboard focus): one full turn with a pop (it swells to 120% half-way, overshoots a little and
//     springs back), then, while the pointer stays, a quarter-turn "tick" with a small bounce about every second, like
//     a windmill catching the wind;
//   • pointer out: the turn in progress finishes, then it stops. The mark has four-fold symmetry and every move ends on a
//     quarter turn, so it always comes to rest looking exactly like the logo — no snap back.
//   One listener on the document handles both logos (and any later copy), so the header and footer need no changes.
//   Reduced motion: no spin.
// - HEADER_LOGO_SVG: 78×19 (site header).
// - FOOTER_LOGO_SVG: the same artwork at 40px tall, 164×40 (site footer).

const MARK = 'M7.89058 1.87012C5.84371 1.87012 4.15958 3.43784 3.94934 5.44957C1.95779 5.66156 0.406351 7.36411 0.40625 9.43265C0.406389 11.5011 1.95784 13.2031 3.94934 13.4151C4.15938 15.4271 5.84356 16.9952 7.89058 16.9952C9.93767 16.9951 11.6219 15.427 11.8318 13.4151C13.823 13.2028 15.3748 11.5009 15.3749 9.43265C15.3748 7.36437 13.8231 5.6619 11.8318 5.44957C11.6217 3.43789 9.93754 1.87021 7.89058 1.87012ZM7.89058 2.76466C9.45003 2.76475 10.7377 3.93663 10.9401 5.45608C9.68537 5.60628 8.61211 6.34957 7.99819 7.40011C8.32069 7.41344 8.62293 7.50477 8.88803 7.65531C9.3572 6.9759 10.0862 6.4935 10.9311 6.35973C10.7988 7.21371 10.3217 7.95064 9.64961 8.42485C9.79866 8.69285 9.88905 8.99852 9.90218 9.32458C10.9418 8.70418 11.6769 7.61884 11.8254 6.35062C13.3294 6.55519 14.4896 7.85691 14.4896 9.43265C14.4895 11.0086 13.3291 12.3098 11.8247 12.514C11.6759 11.245 10.9404 10.1588 9.8996 9.53879C9.87902 9.86105 9.78177 10.1616 9.6283 10.4248C10.3115 10.8984 10.7971 11.6418 10.9311 12.5042C10.0715 12.3682 9.33219 11.8714 8.86415 11.1735C8.59747 11.3202 8.29397 11.406 7.97114 11.4151C8.57992 12.4915 9.66584 13.2554 10.9401 13.4079C10.7381 14.9279 9.45036 16.1005 7.89058 16.1007C6.33077 16.1007 5.04318 14.9279 4.84107 13.4079C6.11574 13.2551 7.20276 12.4909 7.81134 11.4138C7.49234 11.3972 7.19438 11.303 6.93252 11.152C6.46511 11.8614 5.71847 12.3666 4.85009 12.5042C4.98642 11.627 5.4866 10.8735 6.18833 10.4014C6.03872 10.1366 5.94633 9.83479 5.92996 9.51212C4.86367 10.127 4.10764 11.2256 3.95643 12.514C2.45181 12.3101 1.29168 11.0088 1.29154 9.43265C1.29164 7.85664 2.45143 6.55487 3.95578 6.35062C4.10672 7.63871 4.86294 8.73671 5.92867 9.35192C5.93746 9.02532 6.02178 8.71805 6.16707 8.44831C5.47645 7.97524 4.98472 7.22844 4.85009 6.35973C5.70374 6.49509 6.43986 6.98604 6.9087 7.67678C7.16918 7.52177 7.46661 7.42344 7.78561 7.40271C7.17188 6.35048 6.09645 5.60646 4.84043 5.45608C5.04296 3.93663 6.33111 2.76466 7.89058 2.76466Z'

// "Harbor" — Roboto Medium 16px, outlined (v110), drawn on baseline 14 and moved down WORD_DY (v111)
const WORD = 'M28.188 7.378V8.929H22.149V7.378ZM22.633 2.625V14H20.672V2.625ZM29.695 2.625V14H27.742V2.625ZM36.605 12.305V8.272Q36.605 7.824 36.442 7.494Q36.279 7.165 35.946 6.983Q35.614 6.802 35.108 6.802Q34.653 6.802 34.316 6.957Q33.979 7.113 33.793 7.381Q33.607 7.648 33.607 7.985H31.726Q31.726 7.483 31.97 7.017Q32.215 6.55 32.673 6.182Q33.132 5.815 33.776 5.603Q34.42 5.391 35.214 5.391Q36.168 5.391 36.906 5.712Q37.645 6.033 38.069 6.676Q38.493 7.319 38.493 8.288V12.05Q38.493 12.621 38.574 13.079Q38.655 13.537 38.812 13.872V14H36.889Q36.75 13.698 36.678 13.226Q36.605 12.753 36.605 12.305ZM36.881 8.861 36.897 10.02H35.545Q35.02 10.02 34.62 10.119Q34.22 10.218 33.957 10.406Q33.693 10.594 33.56 10.86Q33.427 11.126 33.427 11.462Q33.427 11.8 33.582 12.075Q33.737 12.35 34.039 12.508Q34.341 12.667 34.766 12.667Q35.346 12.667 35.781 12.427Q36.216 12.187 36.466 11.842Q36.717 11.496 36.732 11.176L37.334 12.012Q37.242 12.334 37.016 12.704Q36.79 13.074 36.427 13.403Q36.065 13.731 35.562 13.944Q35.058 14.156 34.403 14.156Q33.572 14.156 32.924 13.826Q32.277 13.496 31.909 12.927Q31.54 12.357 31.54 11.637Q31.54 10.966 31.796 10.448Q32.051 9.93 32.546 9.578Q33.04 9.226 33.76 9.043Q34.481 8.861 35.402 8.861ZM42.354 7.156V14H40.473V5.547H42.266ZM44.943 5.494 44.921 7.243Q44.75 7.212 44.551 7.196Q44.352 7.18 44.158 7.18Q43.672 7.18 43.308 7.318Q42.944 7.455 42.697 7.709Q42.45 7.963 42.318 8.323Q42.185 8.682 42.158 9.126L41.726 9.159Q41.726 8.362 41.884 7.68Q42.043 6.998 42.36 6.482Q42.677 5.965 43.155 5.678Q43.632 5.391 44.271 5.391Q44.442 5.391 44.64 5.421Q44.839 5.452 44.943 5.494ZM46.124 2H48.011V12.199L47.831 14H46.124ZM53.529 9.695V9.859Q53.529 10.795 53.319 11.581Q53.109 12.368 52.693 12.945Q52.277 13.521 51.664 13.839Q51.052 14.156 50.243 14.156Q49.453 14.156 48.869 13.859Q48.285 13.561 47.888 13.014Q47.491 12.466 47.252 11.711Q47.013 10.956 46.905 10.04V9.514Q47.013 8.596 47.252 7.841Q47.491 7.086 47.888 6.536Q48.285 5.985 48.865 5.688Q49.445 5.391 50.227 5.391Q51.044 5.391 51.663 5.704Q52.282 6.016 52.695 6.59Q53.109 7.163 53.319 7.951Q53.529 8.74 53.529 9.695ZM51.643 9.859V9.695Q51.643 9.125 51.548 8.622Q51.454 8.12 51.239 7.735Q51.025 7.351 50.663 7.13Q50.301 6.908 49.759 6.908Q49.258 6.908 48.899 7.078Q48.539 7.248 48.3 7.545Q48.06 7.841 47.923 8.235Q47.786 8.629 47.735 9.075V10.493Q47.808 11.077 48.037 11.566Q48.266 12.054 48.691 12.345Q49.115 12.637 49.775 12.637Q50.3 12.637 50.661 12.426Q51.021 12.215 51.236 11.836Q51.45 11.457 51.546 10.951Q51.643 10.445 51.643 9.859ZM54.75 9.864V9.69Q54.75 8.771 55.015 7.985Q55.281 7.2 55.787 6.62Q56.293 6.039 57.021 5.715Q57.749 5.391 58.672 5.391Q59.603 5.391 60.335 5.715Q61.067 6.039 61.575 6.62Q62.083 7.2 62.349 7.985Q62.614 8.771 62.614 9.69V9.864Q62.614 10.781 62.349 11.564Q62.083 12.347 61.575 12.929Q61.067 13.511 60.341 13.833Q59.615 14.156 58.687 14.156Q57.76 14.156 57.029 13.833Q56.297 13.511 55.789 12.929Q55.281 12.347 55.015 11.564Q54.75 10.781 54.75 9.864ZM56.631 9.69V9.864Q56.631 10.44 56.751 10.945Q56.871 11.451 57.121 11.836Q57.372 12.221 57.762 12.44Q58.152 12.659 58.687 12.659Q59.215 12.659 59.601 12.44Q59.987 12.221 60.235 11.836Q60.484 11.451 60.606 10.945Q60.728 10.44 60.728 9.864V9.69Q60.728 9.126 60.606 8.622Q60.484 8.118 60.233 7.727Q59.982 7.336 59.595 7.112Q59.207 6.888 58.672 6.888Q58.144 6.888 57.758 7.112Q57.372 7.336 57.121 7.727Q56.871 8.118 56.751 8.622Q56.631 9.126 56.631 9.69ZM66.081 7.156V14H64.199V5.547H65.993ZM68.67 5.494 68.648 7.243Q68.477 7.212 68.278 7.196Q68.079 7.18 67.884 7.18Q67.399 7.18 67.034 7.318Q66.67 7.455 66.423 7.709Q66.176 7.963 66.044 8.323Q65.912 8.682 65.885 9.126L65.453 9.159Q65.453 8.362 65.611 7.68Q65.769 6.998 66.087 6.482Q66.404 5.965 66.881 5.678Q67.359 5.391 67.998 5.391Q68.168 5.391 68.367 5.421Q68.566 5.452 68.67 5.494Z'
// mark centre 9.433 − word cap-height centre 8.3125
const WORD_DY = 1.12

const logo = (w: number, h: number) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 78 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="overflow:visible"><g class="hb-mark" style="transform-box:fill-box;transform-origin:center"><path d="${MARK}" fill="currentColor"/></g><path d="${WORD}" transform="translate(0 ${WORD_DY})" fill="currentColor"/></svg>`

export const HEADER_LOGO_SVG = logo(78, 19)
export const FOOTER_LOGO_SVG = logo(164, 40)

/* ---------- hover spin (v113) ---------- */
// turning: a turn is playing; timer: waiting for the next tick
type Spin = { on: boolean; turning: boolean; timer: number; angle: number }
const spins = new WeakMap<Element, Spin>()
const SPRING = 'cubic-bezier(.34,1.56,.64,1)' // overshoots a little, then settles
const FIRST_MS = 900  // the first full turn
const TICK_MS = 560   // each quarter-turn tick while the pointer stays
const REST_MS = 420   // pause between ticks
const LOGOS = '.hd-logo, .ft-logo'

function turn(g: SVGGElement, s: Spin, first: boolean) {
  s.timer = 0
  if (!s.on) return
  s.turning = true
  const from = s.angle
  const by = first ? 360 : 90
  const pop = first ? 1.2 : 1.1
  const a = g.animate([
    { transform: `rotate(${from}deg) scale(1)` },
    { transform: `rotate(${from + by * 0.55}deg) scale(${pop})`, offset: 0.5 },
    { transform: `rotate(${from + by}deg) scale(1)` },
  ], { duration: first ? FIRST_MS : TICK_MS, easing: SPRING })
  a.onfinish = () => {
    s.turning = false
    s.angle = (from + by) % 360
    g.style.transform = s.angle ? `rotate(${s.angle}deg)` : ''
    if (s.on) s.timer = window.setTimeout(() => turn(g, s, false), REST_MS)
  }
}

function start(el: Element) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const g = el.querySelector<SVGGElement>('.hb-mark')
  if (!g || typeof g.animate !== 'function') return
  let s = spins.get(g)
  if (!s) { s = { on: false, turning: false, timer: 0, angle: 0 }; spins.set(g, s) }
  s.on = true
  // already turning or waiting for its next tick: just keep going
  if (!s.turning && !s.timer) turn(g, s, true)
}

function stop(el: Element) {
  const g = el.querySelector('.hb-mark')
  const s = g && spins.get(g)
  if (!s) return
  s.on = false
  // resting between ticks: stop now; mid-turn: the turn finishes (on a quarter turn), then it stops
  if (s.timer) { window.clearTimeout(s.timer); s.timer = 0 }
}

// one set of listeners on the document for every logo on the page
const logoOf = (t: EventTarget | null) => (t instanceof Element ? t.closest(LOGOS) : null)
if (typeof document !== 'undefined' && !(window as any).__hbLogoSpin) {
  ;(window as any).__hbLogoSpin = true
  document.addEventListener('mouseover', e => {
    const a = logoOf(e.target)
    if (a && !a.contains(e.relatedTarget as Node | null)) start(a)
  })
  document.addEventListener('mouseout', e => {
    const a = logoOf(e.target)
    if (a && !a.contains(e.relatedTarget as Node | null)) stop(a)
  })
  document.addEventListener('focusin', e => { const a = logoOf(e.target); if (a) start(a) })
  document.addEventListener('focusout', e => { const a = logoOf(e.target); if (a) stop(a) })
}
