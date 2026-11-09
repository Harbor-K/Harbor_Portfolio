import { useEffect } from 'react'

// Browser tab (v83, Harbor, Nov 9 — like the MONOLOG site's tab):
// - Icon: the Harbor mark (the same mark as the Kim LLM avatar and the header logo), white on a #0F0F0F rounded square,
//   so it reads on light and dark browser tabs alike.
// - Title: one per page.
// - While you are on another tab the title says "Still here?"; coming back puts the page's title back.
// Only visible when the published site is open in its own browser tab (not inside the editor preview).

const MARK = 'M7.56142 0.438965C5.60043 0.438965 3.98697 1.92538 3.78554 3.83279C1.87755 4.03379 0.39121 5.64805 0.391113 7.60932C0.391247 9.57054 1.8776 11.1843 3.78554 11.3852C3.98677 13.2929 5.60029 14.7797 7.56142 14.7797C9.52261 14.7796 11.1362 13.2929 11.3374 11.3852C13.245 11.184 14.7317 9.57034 14.7318 7.60932C14.7317 5.6483 13.245 4.03411 11.3374 3.83279C11.1361 1.92544 9.5225 0.439047 7.56142 0.438965ZM7.56142 1.28711C9.05543 1.2872 10.2891 2.39831 10.483 3.83896C9.28091 3.98137 8.25267 4.68612 7.66451 5.68218C7.97348 5.69482 8.26304 5.78142 8.51701 5.92415C8.9665 5.27998 9.66496 4.82258 10.4744 4.69575C10.3477 5.50545 9.89062 6.20417 9.24665 6.65378C9.38944 6.90788 9.47603 7.1977 9.48861 7.50686C10.4847 6.91863 11.1889 5.88958 11.3312 4.68711C12.7721 4.88107 13.8836 6.11529 13.8836 7.60932C13.8835 9.10354 12.7718 10.3373 11.3305 10.5309C11.1879 9.32774 10.4833 8.29786 9.48614 7.70995C9.46642 8.01551 9.37326 8.30052 9.22623 8.55008C9.88082 8.99906 10.346 9.70391 10.4744 10.5217C9.65087 10.3926 8.94254 9.92166 8.49413 9.25992C8.23865 9.39898 7.94788 9.4804 7.63859 9.489C8.22182 10.5096 9.2622 11.2339 10.483 11.3784C10.2895 12.8197 9.05575 13.9315 7.56142 13.9316C6.06705 13.9316 4.83348 12.8196 4.63986 11.3784C5.86104 11.2336 6.90245 10.509 7.4855 9.48773C7.17988 9.47199 6.89443 9.38274 6.64355 9.23957C6.19575 9.91213 5.48044 10.3911 4.6485 10.5217C4.7791 9.68994 5.2583 8.97547 5.93059 8.52783C5.78725 8.27675 5.69874 7.9906 5.68306 7.68467C4.6615 8.26772 3.93719 9.30935 3.79233 10.5309C2.35085 10.3376 1.23939 9.10379 1.23925 7.60932C1.23935 6.11504 2.35047 4.88078 3.79171 4.68711C3.93632 5.9084 4.66081 6.94947 5.68182 7.53278C5.69025 7.22311 5.77103 6.93177 5.91022 6.67603C5.24858 6.2275 4.77748 5.51941 4.6485 4.69575C5.46633 4.82409 6.17156 5.28959 6.62073 5.9445C6.87028 5.79753 7.15523 5.70431 7.46085 5.68465C6.87287 4.68698 5.84257 3.98154 4.63924 3.83896C4.83328 2.39831 6.06738 1.28711 7.56142 1.28711Z'

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#0F0F0F"/><path transform="translate(4.66 4.66) scale(1.5)" d="${MARK}" fill="#FAFAFA"/></svg>`

export const TITLES: Record<string, string> = {
  main: 'Harbor Kim — Product Designer',
  ab: 'About · Harbor Kim',
  tb: 'Trust Bank · Harbor Kim',
  gc: 'GameCove · Harbor Kim',
  ut: 'UTrada · Harbor Kim',
}
export const AWAY_TITLE = 'Still here?'

function setFavicon() {
  if (typeof document === 'undefined') return
  document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]').forEach(l => { if (!(l as HTMLElement).dataset.hb) l.remove() })
  let link = document.querySelector<HTMLLinkElement>('link[data-hb="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/svg+xml'
    link.dataset.hb = 'icon'
    document.head.appendChild(link)
  }
  link.href = `data:image/svg+xml;utf8,${encodeURIComponent(FAVICON)}`
}

/** Sets the tab icon and the page's title, and swaps the title to "Still here?" while the tab is in the background. */
export function useTabMeta(page: string) {
  useEffect(() => { setFavicon() }, [])
  useEffect(() => {
    const title = TITLES[page] ?? TITLES.main
    const apply = () => { document.title = document.hidden ? AWAY_TITLE : title }
    apply()
    document.addEventListener('visibilitychange', apply)
    return () => document.removeEventListener('visibilitychange', apply)
  }, [page])
}
