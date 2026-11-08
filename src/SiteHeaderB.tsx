import React, { useEffect, useRef, useState } from 'react'

// The site header, shared by every page (main, About, Trust Bank, GameCove, UTrada) — Harbor's Figma
// "Header B · Symmetry" with rox.com's Projects mega menu (built for the main page in v76, moved here in v78).
//
// Layout: 1440 container, three columns — her outlined Harbor logo (Figma node 457:10778) | Projects ▾ · About me |
// LinkedIn ↗ · white Resume button. Resume has no file yet, so it opens an email asking for it.
// Projects: rox.com "Platform"-style mega menu — project card with video, the three projects (moves through them by
// itself every 2.8s while open; pointing at the list holds it), "What I did" skills lighting up with ▸, a links row.
//
// mode — how the header sits on the page under it:
// - 'overlay' (main page): transparent with light text over the dark hero; the light bar with ink text once scrolled.
// - 'light' (About, Trust Bank, UTrada): ink text on the white page; the light bar once scrolled.
// - 'dark' (GameCove): light text on the dark page; a dark bar once scrolled.
// hidden: the case studies' full-screen intro (the header stays out of the way until it ends).
// away: the case studies' headroom — slides up while scrolling down, back when scrolling up.
// The bar's blur sits on a ::before layer so the Projects menu's own glass blur still reaches the page (a blurred parent
// would stop it). Type: Helvetica Neue, 16px; the menu card's project name in Newsreader (index.css).

export type HeaderMode = 'overlay' | 'light' | 'dark'

const LINKS = {
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
  linkedin: 'https://www.linkedin.com/in/harborkim/',
  email: 'mailto:harborkim0328@gmail.com',
  resume: `mailto:harborkim0328@gmail.com?subject=${encodeURIComponent('Resume request')}`,
}
const IMG3 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/main-v3/'
const GC = 'https://raw.githubusercontent.com/Harbor-K/landing_page/main/gamecove/assets/v4/'
const TB = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/trust-bank/'

// Harbor's outlined logo, exported from Figma (node 457:10778, 78×19); wordmark and mark take the header's text colour.
const LOGO_SVG = `<svg width="78" height="19" viewBox="0 0 78 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M23.439 4.12652H26.0631V8.75407H30.8935V4.12652H33.5177V16.1852H30.8935V10.9834H26.0631V16.1852H23.439V4.12652ZM35.4768 10.139C35.5102 9.576 35.6495 9.10874 35.8947 8.73719C36.1398 8.36563 36.4518 8.06726 36.8307 7.84207C37.2095 7.61689 37.6329 7.45926 38.1009 7.36919C38.5801 7.26785 39.0592 7.21718 39.5384 7.21718C39.9729 7.21718 40.4131 7.25096 40.8588 7.31852C41.3045 7.37481 41.7112 7.49304 42.0789 7.67319C42.4467 7.85333 42.7475 8.10667 42.9815 8.43319C43.2155 8.74844 43.3325 9.17067 43.3325 9.69985V14.243C43.3325 14.637 43.3548 15.0142 43.3994 15.3745C43.4439 15.7348 43.5219 16.005 43.6334 16.1852H41.2265C41.1819 16.0501 41.1429 15.915 41.1095 15.7799C41.0872 15.6335 41.0705 15.4871 41.0594 15.3407C40.6805 15.7348 40.2348 16.0107 39.7222 16.1683C39.2097 16.3259 38.6859 16.4047 38.1511 16.4047C37.7388 16.4047 37.3544 16.3541 36.9978 16.2527C36.6412 16.1514 36.3292 15.9938 36.0618 15.7799C35.7944 15.5659 35.5827 15.2957 35.4267 14.9692C35.2818 14.6427 35.2094 14.2542 35.2094 13.8039C35.2094 13.3084 35.2929 12.9031 35.4601 12.5879C35.6384 12.2613 35.8612 12.0024 36.1287 11.811C36.4072 11.6196 36.7192 11.4788 37.0647 11.3887C37.4212 11.2874 37.7778 11.2086 38.1344 11.1523C38.4909 11.096 38.8419 11.051 39.1874 11.0172C39.5328 10.9834 39.8392 10.9327 40.1067 10.8652C40.3741 10.7976 40.5858 10.7019 40.7418 10.5781C40.8978 10.443 40.9702 10.2516 40.9591 10.0039C40.9591 9.74489 40.9145 9.54222 40.8254 9.39585C40.7474 9.23822 40.6359 9.12 40.4911 9.04118C40.3574 8.95111 40.1958 8.89481 40.0064 8.8723C39.8281 8.83852 39.6331 8.82163 39.4214 8.82163C38.9534 8.82163 38.5857 8.92296 38.3182 9.12563C38.0508 9.3283 37.8948 9.66607 37.8502 10.139H35.4768ZM40.9591 11.9123C40.8588 12.0024 40.7307 12.0756 40.5747 12.1319C40.4298 12.1769 40.2682 12.2163 40.0899 12.2501C39.9228 12.2839 39.7445 12.312 39.5551 12.3345C39.3657 12.357 39.1762 12.3852 38.9868 12.419C38.8085 12.4527 38.6302 12.4978 38.4519 12.5541C38.2848 12.6104 38.1344 12.6892 38.0007 12.7905C37.8781 12.8806 37.7778 12.9988 37.6998 13.1452C37.6218 13.2916 37.5828 13.4773 37.5828 13.7025C37.5828 13.9164 37.6218 14.0966 37.6998 14.243C37.7778 14.3893 37.8837 14.5076 38.0174 14.5976C38.1511 14.6764 38.3071 14.7327 38.4854 14.7665C38.6637 14.8003 38.8475 14.8172 39.0369 14.8172C39.5049 14.8172 39.8671 14.7384 40.1234 14.5807C40.3797 14.4231 40.5691 14.2373 40.6917 14.0234C40.8142 13.7982 40.8867 13.573 40.9089 13.3479C40.9424 13.1227 40.9591 12.9425 40.9591 12.8074V11.9123ZM45.1747 7.45363H47.4311V9.07496H47.4646C47.576 8.80474 47.7264 8.55704 47.9159 8.33185C48.1053 8.09541 48.3226 7.89837 48.5677 7.74074C48.8129 7.57185 49.0747 7.44237 49.3533 7.3523C49.6319 7.26222 49.9216 7.21718 50.2224 7.21718C50.3784 7.21718 50.5511 7.24533 50.7406 7.30163V9.53096C50.6291 9.50844 50.4954 9.49156 50.3394 9.4803C50.1834 9.45778 50.033 9.44652 49.8881 9.44652C49.4536 9.44652 49.0859 9.5197 48.785 9.66607C48.4841 9.81244 48.239 10.0151 48.0496 10.2741C47.8713 10.5218 47.7431 10.8145 47.6651 11.1523C47.5871 11.4901 47.5481 11.856 47.5481 12.2501V16.1852H45.1747V7.45363ZM58.0058 11.8279C58.0058 11.4563 57.9668 11.1016 57.8888 10.7639C57.8108 10.4261 57.6882 10.1277 57.5211 9.86874C57.3539 9.60978 57.1422 9.40711 56.8859 9.26074C56.6408 9.10311 56.3399 9.0243 55.9834 9.0243C55.6379 9.0243 55.3371 9.10311 55.0808 9.26074C54.8245 9.40711 54.6128 9.60978 54.4456 9.86874C54.2785 10.1277 54.1559 10.4261 54.0779 10.7639C53.9999 11.1016 53.9609 11.4563 53.9609 11.8279C53.9609 12.1881 53.9999 12.5372 54.0779 12.875C54.1559 13.2127 54.2785 13.5111 54.4456 13.7701C54.6128 14.029 54.8245 14.2373 55.0808 14.395C55.3371 14.5413 55.6379 14.6145 55.9834 14.6145C56.3399 14.6145 56.6408 14.5413 56.8859 14.395C57.1422 14.2373 57.3539 14.029 57.5211 13.7701C57.6882 13.5111 57.8108 13.2127 57.8888 12.875C57.9668 12.5372 58.0058 12.1881 58.0058 11.8279ZM51.6711 4.12652H54.0445V8.51763H54.0779C54.3676 8.06726 54.7576 7.74074 55.2479 7.53807C55.7494 7.32415 56.2675 7.21718 56.8024 7.21718C57.2369 7.21718 57.6659 7.30726 58.0894 7.48741C58.5128 7.66756 58.8916 7.94341 59.2259 8.31496C59.5714 8.68652 59.8499 9.16504 60.0616 9.75052C60.2734 10.3247 60.3792 11.0116 60.3792 11.811C60.3792 12.6104 60.2734 13.3028 60.0616 13.8883C59.8499 14.4625 59.5714 14.9354 59.2259 15.307C58.8916 15.6785 58.5128 15.9544 58.0894 16.1345C57.6659 16.3147 57.2369 16.4047 56.8024 16.4047C56.1672 16.4047 55.5989 16.3034 55.0975 16.1007C54.5961 15.8981 54.2172 15.5547 53.9609 15.0705H53.9275V16.1852H51.6711V4.12652ZM63.995 11.8279C63.995 12.1769 64.0284 12.5203 64.0953 12.8581C64.1621 13.1846 64.2736 13.483 64.4296 13.7532C64.5967 14.0121 64.814 14.2204 65.0814 14.3781C65.3489 14.5357 65.6831 14.6145 66.0843 14.6145C66.4854 14.6145 66.8197 14.5357 67.0871 14.3781C67.3657 14.2204 67.583 14.0121 67.739 13.7532C67.9061 13.483 68.0231 13.1846 68.09 12.8581C68.1569 12.5203 68.1903 12.1769 68.1903 11.8279C68.1903 11.4788 68.1569 11.1354 68.09 10.7976C68.0231 10.4599 67.9061 10.1615 67.739 9.90252C67.583 9.64356 67.3657 9.43526 67.0871 9.27763C66.8197 9.10874 66.4854 9.0243 66.0843 9.0243C65.6831 9.0243 65.3489 9.10874 65.0814 9.27763C64.814 9.43526 64.5967 9.64356 64.4296 9.90252C64.2736 10.1615 64.1621 10.4599 64.0953 10.7976C64.0284 11.1354 63.995 11.4788 63.995 11.8279ZM61.6216 11.8279C61.6216 11.1298 61.7274 10.4993 61.9391 9.9363C62.1509 9.36207 62.4517 8.87793 62.8417 8.48385C63.2317 8.07852 63.6997 7.76889 64.2457 7.55496C64.7917 7.32978 65.4046 7.21718 66.0843 7.21718C66.764 7.21718 67.3769 7.32978 67.9229 7.55496C68.48 7.76889 68.9536 8.07852 69.3436 8.48385C69.7334 8.87793 70.0342 9.36207 70.2459 9.9363C70.4576 10.4993 70.5635 11.1298 70.5635 11.8279C70.5635 12.5259 70.4576 13.1564 70.2459 13.7194C70.0342 14.2824 69.7334 14.7665 69.3436 15.1719C68.9536 15.5659 68.48 15.8699 67.9229 16.0839C67.3769 16.2978 66.764 16.4047 66.0843 16.4047C65.4046 16.4047 64.7917 16.2978 64.2457 16.0839C63.6997 15.8699 63.2317 15.5659 62.8417 15.1719C62.4517 14.7665 62.1509 14.2824 61.9391 13.7194C61.7274 13.1564 61.6216 12.5259 61.6216 11.8279ZM72.1068 7.45363H74.3632V9.07496H74.3966C74.5081 8.80474 74.6585 8.55704 74.8479 8.33185C75.0374 8.09541 75.2547 7.89837 75.4998 7.74074C75.7449 7.57185 76.0068 7.44237 76.2854 7.3523C76.5639 7.26222 76.8536 7.21718 77.1545 7.21718C77.3105 7.21718 77.4832 7.24533 77.6726 7.30163V9.53096C77.5612 9.50844 77.4275 9.49156 77.2715 9.4803C77.1155 9.45778 76.9651 9.44652 76.8202 9.44652C76.3856 9.44652 76.0179 9.5197 75.7171 9.66607C75.4162 9.81244 75.1711 10.0151 74.9816 10.2741C74.8034 10.5218 74.6752 10.8145 74.5972 11.1523C74.5192 11.4901 74.4802 11.856 74.4802 12.2501V16.1852H72.1068V7.45363Z" fill="currentColor"/><mask id="hb_logo_mask" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="1" width="16" height="17"><path d="M4.19617e-05 1.40741H15.8347V17.4075H4.19617e-05V1.40741Z" fill="white"/></mask><g mask="url(#hb_logo_mask)"><path d="M7.89253 1.87019C5.84566 1.87019 4.16153 3.43791 3.95129 5.44964C1.95974 5.66163 0.408304 7.36418 0.408203 9.43272C0.408342 11.5012 1.95979 13.2032 3.95129 13.4152C4.16133 15.4272 5.84551 16.9953 7.89253 16.9953C9.93962 16.9952 11.6239 15.4271 11.8338 13.4152C13.825 13.2029 15.3768 11.501 15.3769 9.43272C15.3768 7.36444 13.8251 5.66197 11.8338 5.44964C11.6237 3.43796 9.93949 1.87028 7.89253 1.87019ZM7.89253 2.76473C9.45198 2.76482 10.7397 3.9367 10.9421 5.45615C9.68732 5.60635 8.61406 6.34964 8.00014 7.40018C8.32264 7.41351 8.62488 7.50484 8.88998 7.65538C9.35915 6.97597 10.0882 6.49357 10.9331 6.3598C10.8008 7.21378 10.3237 7.95071 9.65156 8.42492C9.80061 8.69292 9.891 8.99859 9.90413 9.32465C10.9438 8.70425 11.6789 7.61891 11.8274 6.35069C13.3314 6.55526 14.4916 7.85698 14.4916 9.43272C14.4915 11.0087 13.3311 12.3099 11.8267 12.5141C11.6779 11.2451 10.9424 10.1589 9.90155 9.53886C9.88097 9.86112 9.78372 10.1617 9.63025 10.4249C10.3135 10.8985 10.7991 11.6419 10.9331 12.5043C10.0735 12.3683 9.33414 11.8715 8.8661 11.1736C8.59942 11.3203 8.29592 11.4061 7.97309 11.4152C8.58187 12.4916 9.66779 13.2555 10.9421 13.408C10.7401 14.928 9.45231 16.1006 7.89253 16.1008C6.33272 16.1008 5.04513 14.928 4.84302 13.408C6.11769 13.2552 7.20471 12.491 7.81329 11.4139C7.49429 11.3973 7.19633 11.3031 6.93447 11.1521C6.46706 11.8615 5.72042 12.3667 4.85204 12.5043C4.98837 11.6271 5.48855 10.8736 6.19028 10.4015C6.04067 10.1367 5.94828 9.83486 5.93191 9.51219C4.86562 10.1271 4.10959 11.2257 3.95838 12.5141C2.45376 12.3102 1.29363 11.0089 1.29349 9.43272C1.29359 7.85671 2.45338 6.55494 3.95773 6.35069C4.10867 7.63878 4.86489 8.73678 5.93062 9.35199C5.93941 9.02539 6.02373 8.71812 6.16902 8.44838C5.4784 7.97531 4.98667 7.22851 4.85204 6.3598C5.70569 6.49516 6.44181 6.98611 6.91065 7.67685C7.17113 7.52184 7.46856 7.42351 7.78756 7.40278C7.17383 6.35055 6.0984 5.60653 4.84238 5.45615C5.04491 3.9367 6.33306 2.76473 7.89253 2.76473Z" fill="currentColor"/></g></svg>`

function ArrowUpRight() {
  return (
    <svg className="ico-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 11L11 5M11 10V5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const HDR_CSS = `
.hdrb { --hd-fg: #FAFAFA; --hd-dim: rgba(250,250,250,.8); --hd-cta-bg: #FAFAFA; --hd-cta-fg: #0C0A09; --hd-cta-hover: #E7E5E4;
  --hd-pill: rgba(250,250,250,.12); --hd-bar: rgba(245,245,242,.88); --hd-line: #DBDBD9;
  position: fixed; inset: 0 0 auto 0; z-index: 50; color: var(--hd-fg);
  transition: transform .45s cubic-bezier(.22,1,.36,1), opacity .3s ease, visibility 0s; }
/* ink text: light pages, and the main page once it scrolls onto light content */
.hdrb.m-light, .hdrb.m-overlay.is-scrolled { --hd-fg: #0C0A09; --hd-dim: rgba(12,10,9,.75); --hd-cta-bg: #0C0A09; --hd-cta-fg: #FAFAFA; --hd-cta-hover: #2A2725;
  --hd-pill: rgba(12,10,9,.06); }
/* dark page (GameCove): light text, dark bar */
.hdrb.m-dark { --hd-bar: rgba(17,17,20,.86); --hd-line: #2A2D31; }
.hdrb.is-away { transform: translateY(calc(-100% - 4px)); }
.hdrb.is-hidden { transform: translateY(calc(-100% - 4px)); opacity: 0; visibility: hidden; pointer-events: none;
  transition: transform .45s cubic-bezier(.22,1,.36,1), opacity .3s ease, visibility 0s .45s; }

.hdrb .hdrb-bar { position: relative; }
.hdrb .hdrb-bar::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: 0; transition: opacity .35s ease;
  background: var(--hd-bar); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); border-bottom: 1px solid var(--hd-line); }
.hdrb.is-scrolled .hdrb-bar::before { opacity: 1; }

.hdrb .hd { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 24px;
  width: min(1440px, calc(100vw - 64px)); height: 64px; margin: 0 auto; }
.hdrb .hd-logo { display: inline-flex; align-items: center; justify-self: start; color: var(--hd-fg); transition: color .35s ease; }
.hdrb .hd-logo svg { display: block; width: 78px; height: 19px; }
.hdrb .hd-logo:focus-visible { outline: 2px solid currentColor; outline-offset: 6px; }
.hdrb .hd-nav { display: flex; align-items: center; gap: 40px; }
.hdrb .hd-right { display: flex; align-items: center; justify-content: flex-end; gap: 24px; }
.hdrb .hd-link { display: inline-flex; align-items: center; gap: 4px; font-size: 16px; font-weight: 500; line-height: 24px; color: var(--hd-dim);
  text-decoration: none; white-space: nowrap; transition: color .2s ease; }
.hdrb .hd-link:hover, .hdrb .hd-link:focus-visible, .hdrb .hd-link[aria-current] { color: var(--hd-fg); }
.hdrb .hd-link .ico-arrow { display: block; }
.hdrb .hd-cta { display: inline-flex; align-items: center; height: 40px; padding: 8px 16px; background: var(--hd-cta-bg); color: var(--hd-cta-fg);
  font-size: 16px; font-weight: 500; line-height: 24px; text-decoration: none; white-space: nowrap; transition: background-color .2s ease, color .2s ease; }
.hdrb .hd-cta:hover { background: var(--hd-cta-hover); }
.hdrb .hd-cta:focus-visible { outline: 2px solid var(--hd-fg); outline-offset: 3px; }

/* Projects trigger: chevron turns into a dash on a light pill while open (rox.com) */
.hdrb .pj-menu { position: static; display: flex; align-items: center; }
.hdrb .pj-trigger { display: inline-flex; align-items: center; gap: 8px; padding: 4px 10px; margin: -4px -10px; background: transparent; border: 0; border-radius: 0;
  cursor: pointer; font-size: 16px; font-weight: 500; line-height: 24px; color: var(--hd-dim); opacity: 1; white-space: nowrap;
  transition: background-color .2s ease, color .2s ease; }
.hdrb .pj-trigger:hover, .hdrb .pj-trigger.on { color: var(--hd-fg); }
.hdrb .pj-trigger.on { background: var(--hd-pill); }
.hdrb .pj-trigger:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.hdrb .pj-trigger svg { display: block; width: 14px; height: 14px; }

/* Projects mega menu (rox.com "Platform"): dark glass the width of the header row */
.hdrb .mm-wrap { position: absolute; left: 0; right: 0; top: 100%; padding-top: 8px; z-index: 55;
  opacity: 0; visibility: hidden; transform: translateY(-6px); pointer-events: none;
  transition: opacity .18s ease, transform .25s cubic-bezier(.22,1,.36,1), visibility 0s .25s; }
.hdrb .mm-wrap.open { opacity: 1; visibility: visible; transform: none; pointer-events: auto;
  transition: opacity .22s ease, transform .35s cubic-bezier(.22,1,.36,1), visibility 0s; }
.hdrb .mm { display: grid; grid-template-columns: 320px 300px minmax(0, 1fr); grid-template-rows: minmax(360px, auto) auto; color: #FAFAFA; text-align: left;
  background: rgba(13,11,10,.55); -webkit-backdrop-filter: blur(80px) saturate(1.2); backdrop-filter: blur(80px) saturate(1.2);
  border: 1px solid rgba(250,250,250,.12); box-shadow: 0 24px 60px rgba(0,0,0,.25); }
/* over light or dark page content the glass is a little denser, so its white text keeps its contrast */
.hdrb.m-light .mm, .hdrb.m-dark .mm, .hdrb.is-scrolled .mm { background: rgba(13,11,10,.72); }
.hdrb .mm-k { font-size: 16px; line-height: 24px; color: rgba(250,250,250,.6); }
.hdrb .mm-card { position: relative; grid-row: 1 / span 2; display: flex; flex-direction: column; justify-content: space-between; padding: 32px;
  overflow: hidden; background: #0C0A09; color: #FAFAFA; text-decoration: none; }
.hdrb .mm-card .layer { position: absolute; inset: 0; transition: opacity .45s ease, transform .7s cubic-bezier(.22,1,.36,1); }
.hdrb .mm-card .layer video, .hdrb .mm-card .layer img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 0; }
.hdrb .mm-card::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(12,10,9,.72) 0%, rgba(12,10,9,.25) 42%, rgba(12,10,9,.2) 62%, rgba(12,10,9,.7) 100%); }
.hdrb .mm-card > .mm-t, .hdrb .mm-card > .mm-go { position: relative; z-index: 1; }
.hdrb .mm-t { animation: hdrb-in .45s cubic-bezier(.22,1,.36,1) both; }
.hdrb .mm-name { display: block; font-size: 32px; line-height: 38px; letter-spacing: -0.02em; }
.hdrb .mm-sub { display: block; margin-top: 8px; font-size: 16px; line-height: 24px; color: rgba(250,250,250,.75); }
.hdrb .mm-go { align-self: flex-start; display: inline-flex; align-items: center; height: 44px; padding: 10px 18px; background: #FAFAFA; color: #0C0A09;
  font-size: 16px; font-weight: 500; line-height: 24px; transition: background-color .2s ease; }
.hdrb .mm-card:hover .mm-go { background: #E7E5E4; }
@keyframes hdrb-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.hdrb .mm-list { padding: 32px 16px 24px; }
.hdrb .mm-list .mm-k { padding: 0 12px; margin-bottom: 12px; }
.hdrb .mm-list ul { list-style: none; margin: 0; padding: 0; }
.hdrb .mm-list a { display: block; padding: 10px 12px; font-size: 16px; font-weight: 500; line-height: 24px; color: rgba(250,250,250,.9); text-decoration: none;
  transition: background-color .2s ease, color .2s ease; }
.hdrb .mm-list a.on { background: rgba(236,236,234,.16); color: #FAFAFA; }
.hdrb .mm-list a:focus-visible { outline: 2px solid #FAFAFA; outline-offset: -2px; }
.hdrb .mm-feat { padding: 32px 32px 24px; background: rgba(250,250,250,.08); }
.hdrb .mm-caps { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 32px; margin: 12px 0 0; list-style: none; padding: 0; }
.hdrb .mm-caps li { display: flex; align-items: center; height: 44px; margin: 0; font-size: 16px; line-height: 24px; color: rgba(250,250,250,.42); transition: color .3s ease; }
.hdrb .mm-caps li::before { content: ""; flex: none; width: 0; height: 0; margin-right: 0; border-left: 6px solid currentColor; border-top: 4px solid transparent;
  border-bottom: 4px solid transparent; opacity: 0; transform: translateX(-4px); transition: opacity .3s ease, transform .35s cubic-bezier(.22,1,.36,1), margin-right .35s ease; }
.hdrb .mm-caps li.on { color: #FAFAFA; }
.hdrb .mm-caps li.on::before { opacity: 1; transform: none; margin-right: 10px; }
.hdrb .mm-foot { grid-column: 2 / span 2; display: flex; flex-direction: column; gap: 8px; padding: 24px 28px 28px; border-top: 1px solid rgba(250,250,250,.12); }
.hdrb .mm-row { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 20px; }
.hdrb .mm-row .mm-k { color: rgba(250,250,250,.45); min-width: 72px; }
.hdrb .mm-row a { display: inline-flex; align-items: center; gap: 4px; font-size: 16px; line-height: 24px; color: rgba(250,250,250,.9); text-decoration: none; transition: color .2s ease; }
.hdrb .mm-row a:hover { color: #FAFAFA; }
.hdrb .mm-row a:focus-visible { outline: 2px solid #FAFAFA; outline-offset: 2px; }

@media (max-width: 1200px) {
  .hdrb .mm { grid-template-columns: 260px 240px minmax(0, 1fr); }
  .hdrb .mm-caps { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 900px) {
  .hdrb .hd { width: calc(100vw - 32px); grid-template-columns: auto minmax(0, 1fr); }
  .hdrb .hd-nav, .hdrb .hd-right .hd-link { display: none; }
}
`

/* ---------- Projects mega menu ---------- */
// Skills come from what the site already says about each project (case-study pages and the earlier menu facts).
const CAPS = ['Planning', 'UX research', 'Usability testing', 'UI design', 'Mobile app', 'Data dashboard', 'AI features', 'Design system']
const MENU = [
  {
    name: 'Trust Bank', sub: 'Rewards UX revamp', href: '#/trust-bank',
    video: TB + 'hero-sfx-v2.mp4', poster: TB + 'hero-sfx-v2-poster.jpg', img: '',
    does: ['Planning', 'UX research', 'Usability testing', 'UI design', 'Mobile app'],
  },
  {
    name: 'GameCove', sub: 'AI analytics dashboard', href: '#/gamecove',
    video: GC + 'hero-ad.mp4', poster: GC + 'hero-ad-poster.jpg', img: '',
    does: ['Data dashboard', 'AI features', 'Design system'],
  },
  {
    name: 'UTrada', sub: 'Trading platform design system', href: '#/utrada',
    video: '', poster: '', img: IMG3 + 'utrada-screens.webp',
    does: ['UI design', 'Design system'],
  },
]
const CYCLE_MS = 2800

function ProjectsMenu() {
  const [open, setOpen] = useState(false)
  const [everOpen, setEverOpen] = useState(false) // the media load on the first open and stay
  const [hot, setHot] = useState(0)
  const [held, setHeld] = useState(false) // pointer on the project list: stop cycling
  const ref = useRef<HTMLDivElement>(null)
  const vids = useRef<(HTMLVideoElement | null)[]>([])
  const closeTimer = useRef(0)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const close = () => setOpen(false)
    addEventListener('keydown', onKey)
    addEventListener('pointerdown', onDown)
    addEventListener('hashchange', close)
    return () => {
      removeEventListener('keydown', onKey)
      removeEventListener('pointerdown', onDown)
      removeEventListener('hashchange', close)
    }
  }, [open])

  // rox.com: while open, the menu moves through the projects by itself
  useEffect(() => {
    if (!open || held || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => setHot(h => (h + 1) % MENU.length), CYCLE_MS)
    return () => clearInterval(t)
  }, [open, held])

  // only the shown project's video plays
  useEffect(() => {
    vids.current.forEach((v, i) => {
      if (!v) return
      if (open && i === hot) { v.muted = true; v.play().catch(() => {}) } else v.pause()
    })
  }, [open, hot, everOpen])

  const openNow = () => { window.clearTimeout(closeTimer.current); setEverOpen(true); setOpen(true) }
  const closeSoon = () => { window.clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => { setOpen(false); setHeld(false) }, 180) }
  const p = MENU[hot]
  const tab = open ? 0 : -1

  return (
    <div ref={ref} className="pj-menu" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button type="button" aria-haspopup="true" aria-expanded={open} onClick={() => (open ? setOpen(false) : openNow())} onFocus={openNow}
        className={'pj-trigger' + (open ? ' on' : '')}>
        Projects
        {open
          ? <svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          : <svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5.25L7 9.25L11 5.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </button>

      {/* hangs under the whole header row (the .hd grid), not under the trigger */}
      <div className={'mm-wrap' + (open ? ' open' : '')} aria-hidden={!open}>
        <div className="mm">
          <a className="mm-card" href={p.href} tabIndex={-1} aria-hidden="true" onClick={() => setOpen(false)}>
            {everOpen && MENU.map((m, i) => (
              <div key={m.name} className="layer" style={{ opacity: i === hot ? 1 : 0, transform: i === hot ? 'scale(1)' : 'scale(1.04)' }}>
                {m.video
                  ? <video ref={el => { vids.current[i] = el }} src={m.video} poster={m.poster} muted loop playsInline preload={i === 0 ? 'auto' : 'metadata'} />
                  : <img src={m.img} alt="" />}
              </div>
            ))}
            <span className="mm-t" key={p.name}>
              <span className="mm-name">{p.name}</span>
              <span className="mm-sub">{p.sub}</span>
            </span>
            <span className="mm-go">View project</span>
          </a>

          <div className="mm-list" onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)}>
            <div className="mm-k">Projects</div>
            <ul>
              {MENU.map((m, i) => (
                <li key={m.name}>
                  <a href={m.href} className={i === hot ? 'on' : undefined} tabIndex={tab}
                    onMouseEnter={() => setHot(i)} onFocus={() => { setHot(i); setHeld(true) }} onBlur={() => setHeld(false)}
                    onClick={() => setOpen(false)}>{m.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mm-feat">
            <div className="mm-k">What I did</div>
            <ul className="mm-caps">
              {CAPS.map(c => <li key={c} className={p.does.includes(c) ? 'on' : undefined}>{c}</li>)}
            </ul>
          </div>

          <div className="mm-foot">
            <div className="mm-row">
              <span className="mm-k">More:</span>
              <a href="#/about" tabIndex={tab} onClick={() => setOpen(false)}>About me</a>
              <a href={LINKS.linkedin} target="_blank" rel="noreferrer" tabIndex={tab}>LinkedIn <ArrowUpRight /></a>
              <a href={LINKS.resume} tabIndex={tab}>Resume <ArrowUpRight /></a>
            </div>
            <div className="mm-row">
              <span className="mm-k">Contact:</span>
              <a href={LINKS.email} tabIndex={tab}>Email <ArrowUpRight /></a>
              <a href={LINKS.cal} target="_blank" rel="noreferrer" tabIndex={tab}>Book a call <ArrowUpRight /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** the logo: on the main page it scrolls back to the top; on any other page it opens the main page */
const goHome = (e: React.MouseEvent) => {
  e.preventDefault()
  if (window.location.hash.startsWith('#/')) window.location.hash = ''
  else scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

export function SiteHeaderB({ mode = 'overlay', current, hidden = false, away = false }: {
  mode?: HeaderMode; current?: 'about'; hidden?: boolean; away?: boolean
}) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    let raf = 0
    const run = () => { raf = 0; setScrolled(scrollY > 40) }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true })
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on) }
  }, [])
  const cls = 'hdrb m-' + mode + (scrolled ? ' is-scrolled' : '') + (hidden ? ' is-hidden' : away ? ' is-away' : '')
  return (
    <header className={cls} aria-hidden={hidden || undefined}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap" />
      <style>{HDR_CSS}</style>
      <div className="hdrb-bar">
        <div className="hd">
          <a className="hd-logo" href="#" aria-label="Harbor, main page" onClick={goHome} dangerouslySetInnerHTML={{ __html: LOGO_SVG }} />
          <nav className="hd-nav" aria-label="Main">
            <ProjectsMenu />
            <a className="hd-link" href="#/about" aria-current={current === 'about' ? 'page' : undefined}>About me</a>
          </nav>
          <div className="hd-right">
            <a className="hd-link" href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight /></a>
            <a className="hd-cta" href={LINKS.resume} aria-label="Resume, request it by email">Resume</a>
          </div>
        </div>
      </div>
    </header>
  )
}
