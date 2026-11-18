import { useEffect } from 'react'

// Browser tab (v89, Harbor, Nov 9):
// - Icon: since v120 set by favicon.ts (filled H, inverted in dark mode). It overrides the Publish → Edit Metadata →
//   Favicon setting once the page loads; keep the light H there too for link previews and the first moment of loading.
// - Title: the main page uses the Default Title from the same Publish settings (read from the page as it loads);
//   the other pages put their name first, e.g. "Trust Bank · Harbor(Jihyun) Kim".
// - While you are on another tab the title says "Still here?"; coming back puts the page's title back.
// Only visible when the published site is open in its own browser tab (not inside the editor preview).

const FALLBACK_TITLE = 'Harbor(Jihyun) Kim - Product Designer'
const NAME = 'Harbor(Jihyun) Kim'

// the Default Title Magic Patterns puts on the published page (the editor preview calls itself "Internal Preview")
const initial = typeof document !== 'undefined' ? document.title.trim() : ''
const MAIN_TITLE = initial && !/internal preview/i.test(initial) ? initial : FALLBACK_TITLE

export const TITLES: Record<string, string> = {
  main: MAIN_TITLE,
  ab: `About · ${NAME}`,
  tb: `Trust Bank · ${NAME}`,
  gc: `GameCove · ${NAME}`,
  ut: `UTrada · ${NAME}`,
  eto: `ETO Markets · ${NAME}`,
}
export const AWAY_TITLE = 'Still here?'

/** Sets the page's title, and swaps it to "Still here?" while the tab is in the background. */
export function useTabMeta(page: string) {
  useEffect(() => {
    const title = TITLES[page] ?? TITLES.main
    const apply = () => { document.title = document.hidden ? AWAY_TITLE : title }
    apply()
    document.addEventListener('visibilitychange', apply)
    return () => document.removeEventListener('visibilitychange', apply)
  }, [page])
}
