import { useEffect, useRef, useState } from 'react'

// Harbor's animated GIFs: Trust Bank and GameCove, for the main page's Selected work rows (384×224) and the Projects
// menu card (320×360). Hosted with the site's other assets (Harbor-K/harbor-pf, assets/main-v4).
// v91 (Harbor, Nov 9): Trust Bank's two GIFs replaced with new versions (-v2 files; the first versions stay in the repo).
// v95 (Harbor, Nov 10): Selected work row GIFs replaced (trustbank-row-v3, gamecove-row-v2); menu GIFs unchanged.
const G4 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/main-v4/'
export const GIFS = {
  trustBankRow: G4 + 'trustbank-row-v3.gif',
  trustBankMenu: G4 + 'trustbank-menu-v2.gif',
  gameCoveRow: G4 + 'gamecove-row-v2.gif',
  gameCoveMenu: G4 + 'gamecove-menu.gif',
}
// every one of the four runs 76 frames, 5.32s, then loops (measured from the files)
export const GIF_MS = 5320

// A GIF keeps looping on its own clock, so pointing at a project could land in the middle of its story. To start it from
// its first frame each time it is shown, the file is downloaded once and handed to the <img> as a fresh blob: URL on
// every show (a new URL makes the browser restart the animation; nothing is downloaded again). If the download fails,
// the plain URL is used and the GIF simply loops.
const blobs = new Map<string, Promise<Blob | null>>()
const getBlob = (src: string) => {
  if (!blobs.has(src)) blobs.set(src, fetch(src).then(r => (r.ok ? r.blob() : null)).catch(() => null))
  return blobs.get(src)!
}

/** The URL to put on the <img>: restarts from the first frame whenever `playing` turns true. */
export function useGifSrc(src: string | undefined, playing: boolean) {
  const [url, setUrl] = useState(src)
  const last = useRef<string | null>(null)
  useEffect(() => { if (src) getBlob(src) }, [src])
  useEffect(() => {
    if (!src || !playing) return
    let live = true
    getBlob(src).then(b => {
      if (!live || !b) return
      const next = URL.createObjectURL(b)
      if (last.current) URL.revokeObjectURL(last.current)
      last.current = next
      setUrl(next)
    })
    return () => { live = false }
  }, [src, playing])
  useEffect(() => () => { if (last.current) URL.revokeObjectURL(last.current) }, [])
  return url
}
