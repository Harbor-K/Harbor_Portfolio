// Browser-tab icon (v120, Harbor, Nov 18): the "A+" filled H — a square with a heavy H that nearly fills it.
// - Light mode: black square, white H. Dark mode: white square, black H (inverted so it never sinks into a dark tab bar).
// - Follows the visitor's light/dark setting (prefers-color-scheme) and switches live if they change it.
// - The icons are tiny PNGs embedded as data URIs, so no image hosting is needed and every browser (Safari too) shows them.
// - This replaces any icon set in Publish → Edit Metadata → Favicon once the page has loaded (v89 had stopped the site
//   from doing that; Harbor asked for the light/dark pair, which the single Publish favicon can't do). Keep the light
//   icon in the Publish setting too, so link previews and the first moment of loading show the same mark.
// Artwork (32×32): square 0,0–32,32; H = stems x5–12 and x20–27 from y4 to y28, crossbar y13–19. Figma: "Favicon / A+ H".

const LIGHT_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAABmJLR0QA/wD/AP+gvaeTAAAASklEQVRIiWNgGAUDDRjR+P///8eiiBFdGfGKmShzH2EwasGoBUPAAhZiFGHNUESCoR9EoxYQBESlIpKKazQw9INo1IJRC0bBcAAAJUwMMcl57Z0AAAAASUVORK5CYII='
const DARK_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAABmJLR0QA/wD/AP+gvaeTAAAAU0lEQVRIie2WQQoAIAgE2+j/X7a7GRkiYezcAmlgSxEi0jLpqbd/IRjqDGAt2r2Tp7h+RBRQEEc3monZUE7qR0TBEdcvuhrXivoRUUBBHHA3fS6YIYoPQmCt5ZsAAAAASUVORK5CYII='
const APPLE_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAIAAACyr5FlAAAABmJLR0QA/wD/AP+gvaeTAAACGUlEQVR4nO3d0Y3aUBBAUSfKP+4ASqEkSnAJlORS3nYAFewWsLlEitYmYc8pYIYRV/KfPU0AAAAAAAAAAAAAAPAnP7YYerlc5nneYvID67qu67rz0s/O5/P5fN556e12u16vOy/9S2OM990ty/Lsu6dpmpZl2f/2McYWt/zcYiivQRwkcZDEQRIHSRwkcZDEQRIHSRwkcZDEQRIHSRwkcZDEQRIHSRwkcZDEQRIHSRwkcZDEQRIHSRwkcZDEQRIHSRwkcZDEQRIHSRwkcZDEQRIHSRwkcZDEQRIHSRwkcZDEQRIHSRwkcZDEQRIHaZPPeI0xjsfjFpMfuN/vt9tt56WfzfN8OBx2Xvr29nY6nb587K8vn/gsh8Nh/3/ltXmskMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgfpdd7P8Z1f3vI/GWO8725ZlmffPU3TtCzL/rePMba4xWOFJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDtMlnvK7X6zzPW0x+YF3XnTf+1lN+xr/w/TIAAAAAAAAAAAAAAL6pD+22/2L3M+HPAAAAAElFTkSuQmCC'

function setFavicon() {
  if (typeof document === 'undefined' || (window as any).__hbFavicon) return
  ;(window as any).__hbFavicon = true
  // drop whatever icons the page came with, so the browser can't pick an old one
  document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]').forEach(l => l.remove())

  const icon = document.createElement('link')
  icon.rel = 'icon'
  icon.type = 'image/png'
  icon.sizes.add('32x32')
  document.head.appendChild(icon)

  const apple = document.createElement('link')
  apple.rel = 'apple-touch-icon'
  apple.href = APPLE_PNG
  document.head.appendChild(apple)

  const dark = window.matchMedia('(prefers-color-scheme: dark)')
  const apply = () => { icon.href = dark.matches ? DARK_PNG : LIGHT_PNG }
  apply()
  if (dark.addEventListener) dark.addEventListener('change', apply)
  else (dark as any).addListener?.(apply)
}

setFavicon()
