import React, { useEffect, useState } from 'react'

/**
 * ETO Markets · Prototype (Nov 24, Harbor): instead of loading Figma's embed player (it was slow and broke on click), each
 * frame plays a short looping walkthrough recorded from her Figma files. The video keeps playing; a dark pill button over it
 * ("▶ View all screens" / "▶ Tap to view", as in her screenshot) and the browser bar's "Open in Figma ↗" open the Figma
 * design file with every screen in a new tab.
 * Desktop: eto-crm-desktop.mp4 (10.8 s, CRM Dashboard Figma wXNPL3ciw6XhyL58xAFyLI, 1920 × 1080).
 * Mobile: eto-app-mobile.mp4 (10.5 s, ETO_Application Figma UBqiuXF7C6Xsfwtb10iVFj, iOS frames at 2x, 750 × 1624),
 * inside an iPhone-style frame drawn in CSS (bezel, Dynamic Island, side buttons).
 * With prefers-reduced-motion the videos don't autoplay; the poster shows with play controls.
 */

const A9 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/eto/v9/'
const VID = {
  desktop: { src: A9 + 'eto-crm-desktop.mp4', poster: A9 + 'eto-crm-desktop-poster.jpg' },
  mobile: { src: A9 + 'eto-app-mobile.mp4', poster: A9 + 'eto-app-mobile-poster.jpg' },
}

const useReduced = () => {
  const [r, setR] = useState(false)
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const set = () => setR(mq.matches)
    set(); mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [])
  return r
}

function Clip({ kind, label }: { kind: 'desktop' | 'mobile'; label: string }) {
  const reduced = useReduced()
  const v = VID[kind]
  return (
    <video key={reduced ? 'r' : 'a'} src={v.src} poster={v.poster} muted loop playsInline preload="metadata"
      autoPlay={!reduced} controls={reduced} aria-label={label} />
  )
}

export function ProtoFrame({ kind, url }: { kind: 'desktop' | 'mobile'; url: string }) {
  const desk = kind === 'desktop'
  const label = desk
    ? 'Walkthrough of the CRM web portal prototype: dashboard, inbox, my clients and the Action menu, then a USDT deposit'
    : 'Walkthrough of the ETO mobile app prototype: dashboard, inbox tabs, my clients, then my account deposit'
  const pill = (
    <a className="pill" href={url} target="_blank" rel="noreferrer">
      <span aria-hidden="true">▶</span>{desk ? 'View all screens' : 'Tap to view'}
      <span className="sr-only"> ({desk ? 'CRM web portal' : 'ETO mobile app'} in Figma, opens in a new tab)</span>
    </a>
  )
  return (
    <div className={'e9-proto ' + kind}>
      <style>{PROTO_CSS}</style>
      {desk ? (
        <div className="browser">
          <div className="bar">
            <span className="dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="url">figma.com/design/…/CRM-Dashboard</span>
            <a href={url} target="_blank" rel="noreferrer" tabIndex={-1} aria-hidden="true">Open in Figma ↗</a>
          </div>
          <div className="screen"><Clip kind="desktop" label={label} />{pill}</div>
        </div>
      ) : (
        <div className="phone">
          <i className="btn mute" aria-hidden="true" /><i className="btn vu" aria-hidden="true" /><i className="btn vd" aria-hidden="true" />
          <i className="btn pw" aria-hidden="true" />
          <div className="bezel">
            <div className="screen"><Clip kind="mobile" label={label} />{pill}</div>
            <i className="island" aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  )
}

const PROTO_CSS = `
.e9-proto { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.e9-proto video { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; background: #FFFFFF; }
.e9-proto .screen { position: relative; }
/* the pill over the video (Harbor's screenshot, Nov 24): dark, see-through, white bold label with a play mark */
.e9-proto .pill { position: absolute; z-index: 1; left: 50%; top: 50%; transform: translate(-50%, -50%); display: inline-flex; align-items: center; gap: 12px;
  padding: 16px 32px; border-radius: 999px; background: rgba(30, 30, 32, .88); color: #FFFFFF; font-size: 20px; font-weight: 700; line-height: 24px;
  white-space: nowrap; text-decoration: none; box-shadow: 0 8px 24px rgba(0, 0, 0, .16); }
.e9-proto .pill > span[aria-hidden] { font-size: 16px; }
.e9-proto .pill:focus-visible { outline: 2px solid #E31E24; outline-offset: 4px; }
.e9-proto.mobile .pill { top: auto; bottom: 16%; transform: translateX(-50%); padding: 16px 24px; }
.e9-proto .browser .bar a { font-size: 16px; font-weight: 700; line-height: 24px; color: #E31E24; text-decoration: none; white-space: nowrap; }

/* desktop: browser window */
.e9-proto .browser { overflow: hidden; background: #FFFFFF; border: 1px solid #E4D6D7; border-radius: 12px; box-shadow: 0 16px 48px rgba(0,0,0,.08); }
.e9-proto .browser .bar { position: relative; display: flex; align-items: center; justify-content: space-between; height: 40px; padding: 0 16px; background: #F4EFEF; }
.e9-proto .browser .dots { display: flex; gap: 8px; }
.e9-proto .browser .dots i { width: 12px; height: 12px; border-radius: 50%; background: #FF5F57; }
.e9-proto .browser .dots i:nth-child(2) { background: #FEBC2E; } .e9-proto .browser .dots i:nth-child(3) { background: #28C840; }
.e9-proto .browser .url { position: absolute; left: 50%; top: 6px; transform: translateX(-50%); max-width: 50%; overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap; padding: 2px 12px; background: #FFFFFF; border-radius: 6px; font-size: 16px; line-height: 24px; color: #6E6A6B; }
.e9-proto .browser .screen { aspect-ratio: 16 / 9; }

/* mobile: iPhone-style frame (titanium edge, black bezel, Dynamic Island, side buttons) */
.e9-proto.mobile { align-items: center; }
.e9-proto .phone { position: relative; box-sizing: border-box; width: 280px; aspect-ratio: 280 / 576; padding: 4px; border-radius: 52px;
  background: linear-gradient(145deg, #5C5C60 0%, #2A2A2D 30%, #1A1A1C 55%, #3A3A3E 100%);
  box-shadow: 0 0 0 1px #0C0C0D, 0 24px 56px rgba(0,0,0,.22), inset 0 0 1px rgba(255,255,255,.4); }
.e9-proto .bezel { position: relative; height: 100%; box-sizing: border-box; padding: 9px; border-radius: 48px; background: #050505; }
.e9-proto .phone .screen { height: 100%; overflow: hidden; border-radius: 39px; background: #FFFFFF; }
.e9-proto .island { position: absolute; left: 50%; top: 18px; width: 84px; height: 24px; margin-left: -42px; border-radius: 999px; background: #050505; }
.e9-proto .btn { position: absolute; width: 3px; border-radius: 2px; background: linear-gradient(90deg, #2A2A2D, #4A4A4E); }
.e9-proto .btn.mute { left: -3px; top: 104px; height: 24px; }
.e9-proto .btn.vu { left: -3px; top: 148px; height: 44px; }
.e9-proto .btn.vd { left: -3px; top: 200px; height: 44px; }
.e9-proto .btn.pw { right: -3px; top: 164px; height: 72px; }
`
