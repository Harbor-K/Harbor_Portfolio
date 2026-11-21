// Harbor's CV. The header's Resume button and the footer's Resume link both read this, so a new CV only needs the PDF
// replaced (same path) or these lines changed.
// Nov 21, 2026 (Harbor: "레주메 버튼 클릭하면 바로 다운로드"): the PDF lives in the site's asset repo (GitHub, Harbor-K/harbor-pf)
// and a click downloads it as Harbor_Kim_Resume.pdf instead of opening Google Drive.
// The file comes from another site, so the browser ignores the link's `download` name; the click handler fetches it and
// saves it under that name. If that fails, it falls back to the file's own address, which also downloads (GitHub serves it
// as a file to save). Cmd/Ctrl/Shift-click keeps the browser's own behaviour.
export const RESUME_URL = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/resume/Harbor_Kim_Resume.pdf'
export const RESUME_FILE = 'Harbor_Kim_Resume.pdf'

type ClickLike = { preventDefault(): void; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean }

export function downloadResume(e: ClickLike) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  fetch(RESUME_URL)
    .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.blob() })
    .then(b => {
      const url = URL.createObjectURL(new Blob([b], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = RESUME_FILE
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 10000)
    })
    .catch(() => { window.location.href = RESUME_URL })
}
