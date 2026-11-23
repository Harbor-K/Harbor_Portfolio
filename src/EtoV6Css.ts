/* Styles for EtoV6.tsx (ETO Markets case study), split out Nov 23 so each file stays small enough to edit quickly. */

export const E6_CSS = `
.e6 .mt56 { margin-top: 56px; }
.e6 .e6-fit { position: relative; width: 100%; overflow: hidden; }
.e6 .e6-fit-in { position: absolute; left: 0; top: 0; transform-origin: 0 0; }

/* hero */
.e6 .e6-logo { display: block; width: 188px; height: auto; }
.e6 .e6-meta .mk { font-size: 16px; line-height: 24px; color: #777777; }
.e6 .e6-meta p { color: #333333; }

/* context: the CRM between clients and IBs */
.e6 .e6-crm { width: min(1600px, calc(100vw - 32px)); margin: 0 auto; }
.e6 .e6-crm-c { background: transparent; background-image: none; }
.e6 .e6-crm-stage { display: grid; grid-template-columns: minmax(0, 420fr) 760px minmax(0, 420fr); height: 600px; }
.e6 .e6-crm-side { position: relative; height: 600px; overflow: hidden; }
.e6 .e6-crm-side svg { position: absolute; inset: 0; width: 100%; height: 600px; overflow: visible; }
.e6 .e6-crm-side .fl { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1) var(--d, 0s); }
.e6 .e6-crm.in .e6-crm-side .fl { stroke-dashoffset: 0; }
.e6 .e6-crm-side .dot { position: absolute; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; background: #ED1C24; opacity: 0; transition: opacity .4s ease var(--d, 0s); }
.e6 .e6-crm-side.ib .dot { background: #7C3AED; }
.e6 .e6-crm.in .e6-crm-side .dot { opacity: 1; }
.e6 .e6-crm-side .lab { position: absolute; top: 270px; transform: translate(-50%, -50%); padding: 8px; background: var(--soft); font-size: 40px; font-weight: 500; line-height: 1.15; letter-spacing: .04em; color: #ED1C24; text-align: center; white-space: nowrap; }
.e6 .e6-crm-side.ib .lab { font-size: 32px; color: #7C3AED; }
.e6 .e6-crm-side .portal { position: absolute; top: 568px; transform: translateX(-50%); font-size: 16px; line-height: 21px; color: #ED1C24; white-space: nowrap; }
.e6 .e6-crm-side.ib .portal { color: #7C3AED; }
.e6 .e6-crm-mid { position: relative; padding-top: 67px; }
.e6 .e6-crm-keys { position: absolute; top: 36px; left: 0; right: 0; display: grid; grid-template-columns: repeat(3, 200px); justify-content: center; column-gap: 56px; font-size: 16px; line-height: 21px; letter-spacing: .04em; text-align: center; }
.e6 .e6-crm-keys .client { color: #ED1C24; } .e6 .e6-crm-keys .shared { color: #2A2A2E; } .e6 .e6-crm-keys .ib { color: #7C3AED; }
.e6 .e6-crm-heads { display: none; }
.e6 .e6-crm-box { display: grid; grid-template-columns: repeat(3, 200px); justify-content: center; gap: 32px 56px; padding: 23px; background: #FFFFFF; box-shadow: inset 0 0 0 1px #8E8590; }
.e6 .e6-obj { position: relative; background: #FFFFFF; box-shadow: inset 0 0 0 1px var(--oc); --oc: #2A2A2E; }
.e6 .e6-obj.client { --oc: #ED1C24; } .e6 .e6-obj.ib { --oc: #7C3AED; }
.e6 .e6-obj .h { display: flex; align-items: center; justify-content: center; height: 32px; border-bottom: 1px solid var(--oc); font-size: 16px; font-weight: 500; color: var(--oc); }
.e6 .e6-obj.client .h { background: rgba(237,28,36,.08); } .e6 .e6-obj.ib .h { background: rgba(124,58,237,.08); }
.e6 .e6-obj ul li { display: flex; align-items: center; gap: 8px; height: 28px; padding-left: 10px; border-bottom: 1px solid rgba(42,42,46,.25); font-size: 16px; color: #2A2A2E; white-space: nowrap; }
.e6 .e6-obj.shared ul li:last-child { border-bottom: 0; }
.e6 .e6-obj ul li i { flex: none; width: 8px; height: 8px; border-radius: 2px; background: rgba(42,42,46,.6); }
.e6 .e6-obj.client ul li i { background: rgba(237,28,36,.8); } .e6 .e6-obj.ib ul li i { background: rgba(124,58,237,.8); }
.e6 .e6-obj.client::after, .e6 .e6-obj.shared::after, .e6 .e6-core::after { content: ""; position: absolute; left: 100%; top: 59px; width: 56px; height: 1px; background: rgba(42,42,46,.45); }
.e6 .e6-core { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: 118px; background: #2A2A2E; color: #FFFFFF; }
.e6 .e6-core .lg { width: 112px; height: auto; }
.e6 .e6-core span { font-size: 16px; color: #BDBDBD; }
@media (max-width: 1279px) {
  .e6 .e6-crm { width: auto; margin: 0 auto; max-width: min(1440px, calc(100vw - 64px)); }
  .e6 .e6-crm-stage { display: block; height: auto; padding: 32px 24px; }
  .e6 .e6-crm-side { display: none; }
  .e6 .e6-crm-mid { padding: 0; max-width: 760px; margin: 0 auto; }
  .e6 .e6-crm-heads { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 24px; font-size: 24px; font-weight: 500; line-height: 32px; letter-spacing: .04em; }
  .e6 .e6-crm-heads span { display: block; font-size: 16px; font-weight: 400; line-height: 24px; letter-spacing: 0; }
  .e6 .e6-crm-heads .client { color: #ED1C24; } .e6 .e6-crm-heads .ib { color: #7C3AED; text-align: right; }
  .e6 .e6-crm-keys { position: static; margin-bottom: 8px; }
}
@media (max-width: 860px) {
  .e6 .e6-crm-keys { display: none; }
  .e6 .e6-crm-heads { flex-direction: column; font-size: 20px; line-height: 28px; }
  .e6 .e6-crm-heads .ib { text-align: left; }
  .e6 .e6-crm-box { grid-template-columns: minmax(0, 1fr); padding: 16px; gap: 16px; }
  .e6 .e6-obj::after, .e6 .e6-core::after { display: none; }
  .e6 .e6-crm-box > li:nth-child(1) { order: 1; } .e6 .e6-crm-box > li:nth-child(4) { order: 2; } .e6 .e6-crm-box > li:nth-child(7) { order: 3; }
  .e6 .e6-crm-box > li:nth-child(2) { order: 4; } .e6 .e6-crm-box > li:nth-child(5) { order: 5; } .e6 .e6-crm-box > li:nth-child(8) { order: 6; }
  .e6 .e6-crm-box > li:nth-child(3) { order: 7; } .e6 .e6-crm-box > li:nth-child(6) { order: 8; } .e6 .e6-crm-box > li:nth-child(9) { order: 9; }
}

/* discover: the benchmark spreadsheet (Figma 880 × 632) */
.e6 .e6-bench { display: grid; grid-template-columns: minmax(0, 496px) 880px; justify-content: space-between; align-items: center; gap: 48px; }
@media (max-width: 1351px) { .e6 .e6-bench { grid-template-columns: minmax(0, 1fr); } .e6 .e6-bench > div:last-child { max-width: 880px; } }
.e6 .e6-sheet-c { background: #FFFFFF; background-image: none; }
.e6 .e6-scalew { position: relative; overflow: hidden; }
.e6 .e6-sheet-wrap { overflow: hidden; }
.e6 .e6-sheet { width: 880px; background: #FFFFFF; color: #1F1F1F; font-size: 16px; line-height: 20px; --g: #E1E1E1; --xl: #217346; }
.e6 .e6-sheet .fx { display: flex; align-items: center; height: 32px; padding: 0 8px; border-bottom: 1px solid #D4D4D4; }
.e6 .e6-sheet .fx .nb { display: flex; align-items: center; width: 72px; height: 22px; padding: 0 7px; box-shadow: inset 0 0 0 1px #C8C8C8; }
.e6 .e6-sheet .fx i { margin-left: 16px; font-style: italic; color: #7A7A7A; }
.e6 .e6-sheet .fx .sep { width: 1px; height: 20px; margin: 0 11px 0 8px; background: #D4D4D4; }
.e6 .e6-sheet table { width: 880px; border-collapse: collapse; table-layout: fixed; }
.e6 .e6-sheet th, .e6 .e6-sheet td { height: 32px; padding: 0 8px; border: 1px solid var(--g); border-top: 0; border-left: 0; font-weight: 400; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.e6 .e6-sheet tr.ch th { height: 24px; background: #F3F3F3; color: #5F5F5F; text-align: center; border-bottom-color: #C8C8C8; }
.e6 .e6-sheet tr.ch th:nth-child(1) { width: 40px; } .e6 .e6-sheet tr.ch th:nth-child(2) { width: 248px; }
.e6 .e6-sheet tr.ch th:nth-child(3), .e6 .e6-sheet tr.ch th:nth-child(4), .e6 .e6-sheet tr.ch th:nth-child(5), .e6 .e6-sheet tr.ch th:nth-child(6) { width: 104px; }
.e6 .e6-sheet tr.ch th:nth-child(7) { width: 176px; border-right: 0; }
.e6 .e6-sheet tr.ch th.on { background: #D3E3D9; color: var(--xl); font-weight: 700; box-shadow: inset 0 -2px 0 var(--xl); }
.e6 .e6-sheet th.rh { width: 40px; padding: 0; background: #F3F3F3; color: #5F5F5F; text-align: center; }
.e6 .e6-sheet th.rh.on { background: #D3E3D9; color: var(--xl); font-weight: 700; box-shadow: inset -2px 0 0 var(--xl); }
.e6 .e6-sheet td.title { font-size: 18px; font-weight: 700; }
.e6 .e6-sheet td.legend { font-style: italic; color: #7A7A7A; }
.e6 .e6-sheet tr.hdr th, .e6 .e6-sheet tr.hdr td { background: #F2F2F2; border-bottom-color: #7F7F7F; }
.e6 .e6-sheet tr.hdr th.rh { background: #F3F3F3; border-bottom-color: var(--g); }
.e6 .e6-sheet th.a { font-weight: 400; }
.e6 .e6-sheet tr.hdr th.a, .e6 .e6-sheet tr.tot th.a, .e6 .e6-sheet th.hl { font-weight: 700; }
.e6 .e6-sheet th.logo { padding: 0; text-align: center; }
.e6 .e6-sheet th.logo button { display: flex; align-items: center; justify-content: center; width: 100%; height: 31px; border: 0; background: transparent; cursor: pointer; }
.e6 .e6-sheet th.logo img { display: block; mix-blend-mode: multiply; max-width: 88px; object-fit: contain; }
.e6 .e6-sheet td.m { text-align: center; font-weight: 700; }
.e6 .e6-sheet td.cy { background: #E2EFDA; color: #375623; } .e6 .e6-sheet td.cs { background: #FFF2CC; color: #7F6000; } .e6 .e6-sheet td.cn { background: #FCE4D6; color: #C00000; }
.e6 .e6-sheet td.note { color: #595959; }
.e6 .e6-sheet tr.tot th:not(.rh), .e6 .e6-sheet tr.tot td { border-top: 1px solid #1F1F1F; }
.e6 .e6-sheet tr.tot td.n { position: relative; padding: 0; text-align: center; }
.e6 .e6-sheet tr.tot td.n button { width: 100%; height: 31px; border: 0; background: transparent; font-weight: 700; cursor: pointer; color: #1F1F1F; }
.e6 .e6-sheet tr.tot td.n.sel { box-shadow: inset 0 0 0 2px var(--xl); }
.e6 .e6-sheet tr.tot td.n.sel::after { content: ""; position: absolute; right: -3px; bottom: -3px; width: 7px; height: 7px; background: var(--xl); box-shadow: 0 0 0 1px #FFFFFF; z-index: 1; }
.e6 .e6-sheet button:focus-visible { outline: 2px solid var(--xl); outline-offset: -2px; }
.e6 .e6-sheet th.hl { background: #FFFF00; }
.e6 .e6-sheet td.tk { overflow: visible; }
.e6 .e6-sheet .tabs { display: flex; align-items: center; height: 32px; background: #F3F3F3; border-top: 1px solid #D4D4D4; color: #5F5F5F; }
.e6 .e6-sheet .tabs .arr { width: 56px; padding-left: 12px; color: #808080; }
.e6 .e6-sheet .tabs .tab { width: 120px; height: 32px; display: flex; align-items: center; justify-content: center; }
.e6 .e6-sheet .tabs .tab.on { background: #FFFFFF; color: var(--xl); font-weight: 700; box-shadow: inset 0 -3px 0 var(--xl); }
.e6 .e6-sheet .tabs .tab:not(.on) { width: 96px; }
.e6 .e6-sheet .tabs .plus { margin-left: 8px; font-size: 18px; }

/* discover: research photos on the dark board (1440 × 960; photos on the top 1440 × 850) */
.e6 .e6-res-c { background: #232326; background-image: none; box-shadow: none; }
.e6 .e6-res { position: relative; aspect-ratio: 1440 / 960; }
.e6 .e6-res-board { position: absolute; left: 0; right: 0; top: 0; aspect-ratio: 1440 / 850; }
.e6 .e6-res .ph { position: absolute; margin: 0; overflow: hidden; background: #2E2E31; box-shadow: 0 8px 24px rgba(0,0,0,.35); cursor: grab; user-select: none; -webkit-user-select: none;
  opacity: 0; transform: translateY(16px); transition: opacity .6s ease, transform .8s cubic-bezier(.22,1,.36,1), box-shadow .2s ease; }
.e6 .e6-res.in .ph { opacity: 1; transform: none; }
.e6 .e6-res .ph.drag { cursor: grabbing; transform: scale(1.03); box-shadow: 0 24px 48px rgba(0,0,0,.5); transition: transform .2s ease, box-shadow .2s ease; }
.e6 .e6-res .ph:focus-visible { outline: 2px solid #FFFFFF; outline-offset: 2px; }
.e6 .e6-res .ph img { display: block; width: 100%; height: 100%; object-fit: cover; pointer-events: none; -webkit-user-drag: none; }
.e6 .e6-res .chip { position: absolute; z-index: 2; padding: 4px 8px; background: #ED1C24; color: #FFFFFF; font-size: 16px; font-weight: 500; line-height: 21px; }
@media (min-width: 1024px) { .e6 .e6-res .ph { touch-action: none; } }
.e6 .e6-res-caps { position: absolute; left: 2.78%; right: 2.78%; top: 90%; display: grid; grid-template-columns: repeat(4, minmax(0, 300px)); column-gap: 44px; }
.e6 .e6-res-caps li { display: flex; flex-direction: column; gap: 4px; font-size: 16px; line-height: 21px; }
.e6 .e6-res-caps b { font-weight: 500; color: #FF6B70; white-space: pre; }
.e6 .e6-res-caps span { color: rgba(255,255,255,.8); }
@media (max-width: 1180px) {
  .e6 .e6-res { aspect-ratio: auto; }
  .e6 .e6-res-board { position: relative; }
  .e6 .e6-res-caps { position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; padding: 24px; }
}
@media (max-width: 600px) { .e6 .e6-res-caps { grid-template-columns: minmax(0, 1fr); } .e6 .e6-res .chip { padding: 2px 6px; } }

/* define: three rules, one question */
.e6 .e6-def-head { max-width: 496px; }
.e6 .e6-def { padding: 40px; background-image: none; }
.e6 .e6-def-k { font-size: 16px; font-weight: 700; line-height: 19px; color: var(--red); white-space: pre; }
.e6 .e6-def-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: auto auto auto; column-gap: 32px; margin-top: 29px; }
.e6 .e6-def-grid .pins { display: flex; flex-direction: column; gap: 8px; align-self: start; min-height: 64px; margin-bottom: 30px; }
.e6 .e6-def-grid .pins, .e6 .e6-def-grid .pins > div { font-size: 18px; line-height: 27px; color: #6E6A6B; }
.e6 .e6-def-grid .pins:not(.two), .e6 .e6-def-grid .pins > div { display: flex; flex-direction: row; align-items: center; gap: 8px; }
.e6 .e6-def-grid .pins.two { gap: 8px; }
.e6 .e6-pill { flex: none; display: inline-flex; align-items: center; height: 27px; padding: 0 8px; border: 0; border-radius: 999px; background: var(--red); color: #FFFFFF; font-size: 18px; font-weight: 600; line-height: 1; cursor: pointer; transition: box-shadow .2s ease; }
.e6 button.e6-pill:hover { box-shadow: 0 0 0 4px rgba(227,30,36,.18); }
.e6 button.e6-pill:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.e6 .e6-pill.new { background: #E6E1E1; color: #7E7A7B; cursor: default; }
.e6 .e6-rule { display: grid; grid-row: 2 / span 2; grid-template-rows: subgrid; row-gap: 0; background: #FFFFFF; box-shadow: inset 0 0 0 1px var(--red);
  opacity: 0; transform: translateY(16px); transition: opacity .5s ease var(--d, 0s), transform .7s cubic-bezier(.22,1,.36,1) var(--d, 0s); }
[data-r].in .e6-rule { opacity: 1; transform: none; }
.e6 .e6-rule h3 { padding: 20px 28px; background: #FDE8E9; box-shadow: inset 0 -1px 0 var(--red); font-size: 26px; font-weight: 700; line-height: 1.2; }
.e6 .e6-rule .b { display: flex; flex-direction: column; gap: 24px; padding: 28px 28px 32px; }
.e6 .e6-rule p { font-size: 20px; font-weight: 500; line-height: 30px; color: #616166; }
.e6 .e6-wire { position: relative; aspect-ratio: 376 / 208; overflow: hidden; background: #FBF7F7; border-radius: 6px; }
.e6 .e6-wire > * { position: absolute; }
.e6 .e6-wire i { display: block; border-radius: 4px; }
.e6 .e6-wire .side { background: #EFE7E7; } .e6 .e6-wire .nav { background: #D9CFCF; }
.e6 .e6-wire .hot { background: #FFFFFF; box-shadow: inset 0 0 0 2px var(--red); }
.e6 .e6-wire .pink { background: #F3C4C6; } .e6 .e6-wire .row { background: #EDE6E6; }
.e6 .e6-wire .div { background: #E2D8D8; } .e6 .e6-wire .act { background: var(--red); } .e6 .e6-wire .cta { background: var(--red); }
.e6 .e6-wire .card { background: #FFFFFF; box-shadow: inset 0 0 0 1px #E2D8D8; }
.e6 .e6-wire .fmt { box-shadow: none; outline: 1.5px dashed var(--red); outline-offset: -1.5px; }
.e6 .e6-wire .t { font-size: 16px; line-height: 21px; font-weight: 500; white-space: nowrap; }
.e6 .e6-wire .t.red { color: var(--red); } .e6 .e6-wire .t.mute { color: #9A9094; } .e6 .e6-wire .t.grey { color: #616166; font-weight: 400; }
.e6 .e6-wire .t.num { color: var(--ink); font-variant-numeric: tabular-nums; }
.e6 .e6-def-flow { position: relative; height: 96px; }
.e6 .e6-def-flow svg { display: block; width: 100%; height: 96px; overflow: visible; }
.e6 .e6-def-flow .n { position: absolute; z-index: 1; bottom: -4px; width: 8px; height: 8px; margin-left: -4px; border-radius: 50%; background: var(--red); }
.e6 .e6-def-flow path { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1s cubic-bezier(.22,1,.36,1) .5s; }
[data-r].in .e6-def-flow path { stroke-dashoffset: 0; }
.e6 .e6-def-core { position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; width: fit-content; max-width: 100%; margin: 0 auto; padding: 24px 40px; background: #2A2A2E; text-align: center; }
.e6 .e6-def-core .k { font-size: 18px; font-weight: 500; letter-spacing: .06em; color: #FF8A8E; }
.e6 .e6-def-core b { font-size: 32px; font-weight: 700; line-height: 1.2; color: #FFFFFF; }
@media (max-width: 1023px) {
  .e6 .e6-def { padding: 24px 16px; }
  .e6 .e6-def-grid { grid-template-columns: minmax(0, 1fr); grid-template-rows: none; row-gap: 16px; }
  .e6 .e6-rule { grid-row: auto; grid-template-rows: auto auto; }
  .e6 .e6-def-grid .pins { min-height: 0; margin-bottom: 0; }
  .e6 .e6-def-grid .pins:nth-child(3) { margin-bottom: 16px; }
  .e6 .e6-def-flow { display: none; }
  .e6 .e6-def-core { width: auto; margin-top: 24px; padding: 24px; }
  .e6 .e6-def-core b { font-size: 24px; }
  .e6 .e6-rule h3 { font-size: 24px; }
}

/* IB dashboard: the stack of 22 pages */
.e6 .e6-stack { background: #EDECE9; background-image: none; overflow: hidden; }
.e6 .e6-stack-3d { position: absolute; inset: 0; perspective: 1800px; }
.e6 .e6-strip { position: absolute; left: 0; top: 0; transform-style: preserve-3d; will-change: transform; }
.e6 .e6-pcw { position: absolute; width: 320px; height: 470px; transform: rotateY(38deg) rotateZ(-8deg); transform-style: preserve-3d; }
.e6 .e6-pc { position: relative; width: 320px; height: 470px; padding: 28px 24px 24px; background: #FFFFFF; border-radius: 14px; box-shadow: -6px 10px 28px rgba(0,0,0,.10); color: #111111; }
.e6 .e6-pc .obj { position: relative; width: 272px; height: 168px; }
.e6 .e6-pc .scr { position: absolute; left: 20px; top: 19px; width: 232px; height: 131px; border-radius: 6px; background-color: #F1F1F3; background-repeat: no-repeat; box-shadow: 0 8px 16px rgba(0,0,0,.18); }
.e6 .e6-pc h3 { margin-top: 24px; font-size: 26px; font-weight: 400; line-height: 1.2; }
.e6 .e6-pc .s { margin-top: 20px; font-size: 16px; font-weight: 500; letter-spacing: .06em; color: #8A8A8A; }
.e6 .e6-pc p { margin-top: 8px; max-width: 228px; font-size: 16px; line-height: 24px; color: #555555; }
.e6 .e6-pc .pg { position: absolute; left: 24px; bottom: 24px; font-size: 16px; font-weight: 500; letter-spacing: .06em; color: #B0B0B0; }
.e6 .e6-stack-row { display: none; }
@media (max-width: 899px) {
  .e6 .e6-stack-wide { display: none; }
  .e6 .e6-stack-row { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 8px 2px 24px; margin: 0 -2px; }
  .e6 .e6-stack-row > div { flex: none; scroll-snap-align: start; }
  .e6 .e6-stack-row .e6-pc { width: 280px; height: 440px; box-shadow: 0 0 0 1px #E5E3DF; }
  .e6 .e6-stack-row .e6-pc .obj { width: 232px; height: 150px; }
  .e6 .e6-stack-row .e6-pc .scr { left: 0; top: 10px; }
}

/* IB dashboard: the portal menu, before → after (1440 × 593) */
.e6 .e6-ia-pin.on { height: 260vh; }
.e6 .e6-ia-pin.on .e6-ia { position: sticky; top: max(72px, calc(50vh - 380px)); }
/* Nov 23: the 2022 menu on top, the redesign under it (no overlap), so both read in full while the steps play */
.e6 .e6-ia-c { width: 1440px; display: flex; flex-direction: column; gap: 16px; padding: 40px; box-sizing: border-box; background-image: none; }
.e6 .e6-ia .lab { font-size: 16px; font-weight: 700; line-height: 24px; letter-spacing: .04em; }
.e6 .e6-ia .lab.before { color: var(--ash); }
.e6 .e6-ia .lab.after { margin-top: 24px; color: var(--ink); opacity: .25; transition: opacity .5s ease; }
.e6 .e6-ia:not(.s0) .lab.after { opacity: 1; }
.e6 .e6-ia .menu { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 16px; padding: 24px; background: #FFFFFF; box-shadow: inset 0 0 0 1px #E2D3D4; border-radius: 8px; }
.e6 .e6-ia .menu.after { min-height: 340px; box-sizing: border-box; box-shadow: inset 0 0 0 1px #E2D3D4, 0 8px 32px rgba(102,38,38,.08); opacity: .25; transform: translateY(16px); transition: opacity .6s ease, transform .9s cubic-bezier(.22,1,.36,1); }
.e6 .e6-ia:not(.s0) .menu.after { opacity: 1; transform: none; }
.e6 .e6-ia .col { position: relative; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.e6 .e6-ia .mh { position: relative; font-size: 18px; font-weight: 700; line-height: 28px; color: var(--ink); }
.e6 .e6-ia .before .mh { color: var(--grey); }
.e6 .e6-ia .dv { display: block; height: 1px; background: var(--rline); }
.e6 .e6-ia ul { display: flex; flex-direction: column; gap: 8px; }
.e6 .e6-ia li { font-size: 16px; font-weight: 500; line-height: 24px; color: var(--grey); }
.e6 .e6-ia .before li { color: var(--ash); }
.e6 .e6-ia .after .col { transform: translateX(var(--x)); transition: transform 1s cubic-bezier(.22,1,.36,1); }
.e6 .e6-ia.s2 .after .col, .e6 .e6-ia.s3 .after .col, .e6 .e6-ia.s4 .after .col { transform: none; }
.e6 .e6-ia .after li { opacity: 0; transition: opacity .5s ease var(--d, 0s); }
.e6 .e6-ia.s3 .after li, .e6 .e6-ia.s4 .after li { opacity: 1; }
.e6 .e6-ia .tg { display: flex; }
.e6 .e5-tag { display: inline-flex; align-items: center; height: 24px; padding: 0 8px; border-radius: 4px; font-size: 16px; font-weight: 700; line-height: 24px; white-space: nowrap; vertical-align: middle; }
.e6 .e5-tag.t-new { background: var(--red); color: #FFFFFF; }
.e6 .e5-tag.t-split, .e6 .e5-tag.t-moved, .e6 .e5-tag.t-renamed { background: #FFFFFF; color: var(--grey); box-shadow: inset 0 0 0 1px var(--ash); }
.e6 .e6-ia .after .e5-tag { transform: scale(.6); opacity: 0; transition: transform .5s cubic-bezier(.45,1.45,.8,1) var(--d, 0s), opacity .25s ease var(--d, 0s); }
.e6 .e6-ia.s3 .after .e5-tag, .e6 .e6-ia.s4 .after .e5-tag { transform: none; opacity: 1; }
.e6 .e6-ia .mh .old { position: absolute; left: 0; top: 0; background: #FFFFFF; color: var(--ink); white-space: nowrap; transition: opacity .5s ease; }
.e6 .e6-ia.s3 .mh .old, .e6 .e6-ia.s4 .mh .old { opacity: 0; }
.e6 .e6-ia .legend { display: flex; flex-wrap: wrap; gap: 8px 24px; margin-top: 8px; opacity: 0; transition: opacity .6s ease; }
.e6 .e6-ia.s4 .legend { opacity: 1; }
.e6 .e6-ia .legend > span { display: inline-flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; line-height: 24px; color: var(--grey); }
@media (prefers-reduced-motion: reduce) {
  .e6 .e6-crm-side .fl, .e6 .e6-def-flow path { stroke-dashoffset: 0 !important; transition: none !important; }
  .e6 .e6-crm-side .dot, .e6 .e6-res .ph, .e6 .e6-rule { opacity: 1 !important; transform: none !important; transition: none !important; }
}
`

export const E5_CSS = `
.e5 { --ink: #000D10; --red: #E31E24; --soft: #FDF2F2; --canvas: #FFF9F8; --cline: #EAD3D4; --rline: #EFE3E4; --grey: #616166; --ash: #8E8E95;
  --line: #E2E2E4; --chip: #F5F5F6; --green: #2BA36B; --blue: #3A7BE0; --purple: #8E5BD0; --night: #141213;
  background: #FFFFFF; color: var(--ink); }
.e5 .e5-w { display: block; width: min(1440px, calc(100vw - 64px)); margin: 0 auto; }
.e5 h1, .e5 h2, .e5 h3, .e5 p, .e5 figure, .e5 ol, .e5 ul, .e5 blockquote { margin: 0; padding: 0; }
.e5 ol, .e5 ul { list-style: none; }
.e5 .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.e5 .mt24 { margin-top: 24px; } .e5 .mt32 { margin-top: 32px; } .e5 .mt48 { margin-top: 48px; } .e5 .mt64 { margin-top: 64px; } .e5 .mt120 { margin-top: 120px; }
.e5 .w960 { max-width: 960px; }
.e5 .e5-img { display: block; width: 100%; height: auto; }
.e5 img, .e5 video, .e5 figure { border-radius: 0; }

/* reveal */
.e5 [data-r] { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .9s cubic-bezier(.22,1,.36,1); }
.e5 [data-r].in { opacity: 1; transform: none; }

/* type */
.e5 .e5-label { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; line-height: 24px; color: var(--ash); }
.e5 .e5-label i { width: 16px; height: 16px; background: var(--ash); }
.e5 .e5-label.light { color: rgba(255,255,255,.72); } .e5 .e5-label.light i { background: rgba(255,255,255,.72); }
.e5 .e5-h2 { font-size: 40px; font-weight: 700; line-height: 48px; color: var(--ink); }
.e5 .e5-rt { flex: none; width: 368px; font-size: 24px; font-weight: 700; line-height: 32px; color: var(--ink); }
.e5 .e5-body { font-size: 18px; line-height: 28px; color: var(--ink); }
.e5 .e5-cap { margin-top: 16px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .k { font-size: 16px; line-height: 24px; font-weight: 500; color: var(--ink); }

/* canvas (Figma's dotted frames with corner handles) */
.e5 .e5-canvas { position: relative; background-color: var(--canvas); box-shadow: inset 0 0 0 1px var(--cline);
  background-image: radial-gradient(circle, #E9D6D7 1.2px, transparent 1.4px); background-size: 40px 40px; background-position: 20px 20px; }
.e5 .e5-canvas > .hd { position: absolute; z-index: 2; width: 8px; height: 8px; background: #FFFFFF; box-shadow: inset 0 0 0 1px #C9B4B5; }
.e5 .e5-canvas > .hd.tl { left: -4px; top: -4px; } .e5 .e5-canvas > .hd.tr { right: -4px; top: -4px; }
.e5 .e5-canvas > .hd.bl { left: -4px; bottom: -4px; } .e5 .e5-canvas > .hd.br { right: -4px; bottom: -4px; }
.e5 .e5-canvas-k { font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .02em; }
.e5 .e5-canvas-k.red { color: var(--red); } .e5 .e5-canvas-k.purple { color: var(--purple); } .e5 .e5-canvas-k.ink { color: var(--ink); }

/* hero */
.e5 .e5-hero { padding: 120px 0; }
/* Nov 20 (Harbor): same title weight and spacing as Trust Bank (Roboto Regular 64/72, -0.02em) */
.e5 .e5-h1 { margin-top: 32px; max-width: 960px; font-size: 64px; font-weight: 400; line-height: 72px; letter-spacing: -0.02em; }
.e5 .e5-sub { margin-top: 24px; max-width: 960px; font-size: 18px; line-height: 28px; }
.e5 .e5-slot { position: relative; margin-top: 32px; aspect-ratio: 16 / 9; }
.e5 .e5-box { position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 40; overflow: hidden; background: #0B0B0D; border-radius: 0; }
.e5 .e5-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin-top: 64px; }
.e5 .e5-meta p { margin-top: 8px; font-size: 18px; line-height: 28px; }

/* sections */
.e5 .e5-sec { padding: 120px 0; }
.e5 .e5-soft { background: var(--soft); }
.e5 .e5-stack64 { display: flex; flex-direction: column; gap: 64px; }
.e5 .e5-row { display: flex; align-items: flex-start; }
.e5 .e5-row > .e5-body, .e5 .e5-row > .e5-impact { flex: 1; min-width: 0; max-width: 960px; }

/* overview impact */
.e5 .e5-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
/* Nov 20 (Harbor): no grey divider lines; numbers line up with the note below */
.e5 .e5-stats > div { padding: 8px 24px 8px 0; }
.e5 .e5-stats .n { display: block; font-size: 48px; font-weight: 700; line-height: 56px; color: var(--red); white-space: nowrap; font-variant-numeric: tabular-nums; }
.e5 .e5-stats p { margin-top: 8px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-note { margin-top: 16px; font-size: 16px; line-height: 24px; color: var(--grey); }

/* discover: old portal + pins */
.e5 .e5-oldc { background-image: none; }
.e5 .e5-old { position: relative; }
.e5 .e5-ring { position: absolute; width: 1.95%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; pointer-events: none; }
.e5 .e5-ring::before, .e5 .e5-ring::after { content: ""; position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--red); opacity: 0; }
.e5 .e5-old.pins-on .e5-ring::before { animation: e5-ping 2.4s cubic-bezier(.22,1,.36,1) var(--d, 0s) 2; }
.e5 .e5-ring.hot::before, .e5 .e5-ring.hot::after { animation: e5-ping 1.2s cubic-bezier(.22,1,.36,1) 0s 3 !important; }
.e5 .e5-ring.hot::after { animation-delay: .4s !important; }
@keyframes e5-ping { 0% { opacity: .9; transform: scale(1); } 100% { opacity: 0; transform: scale(2.6); } }

/* before → after (Nov 19): pinned; the rail moves one screen per scroll step */
.e5 .e5-slider { position: relative; --gap: 40px; --sw: min(1200px, calc(100vw - 64px)); }
.e5 .e5-slider.pinned { --sw: min(1200px, calc(100vw - 64px), calc((100vh - 280px) * 1.875)); }
.e5 .e5-sl-pin { display: flex; flex-direction: column; justify-content: center; }
.e5 .e5-slider.pinned .e5-sl-pin { position: sticky; top: 0; height: 100vh; padding-top: 72px; box-sizing: border-box; }
.e5 .e5-track { overflow: hidden; }
.e5 .e5-rail { display: flex; gap: var(--gap); padding-left: calc((100% - var(--sw)) / 2); transition: transform .9s cubic-bezier(.22,1,.36,1); will-change: transform; }
.e5 .e5-slide { flex: none; width: var(--sw); opacity: .35; transition: opacity .5s ease; }
.e5 .e5-slide.on { opacity: 1; }
/* v6 (Nov 20, Figma 2087:1492): each card is a dark panel; sizes follow the 1200 px frame (--u = 1 Figma px), type stays
   at the site's 16px minimum. Small cards: the two crops side by side, the notes as a list under them. */
.e5 .e5-slide .e5-card { container: bap / inline-size; overflow: hidden; }
.e5 .bap { --u: calc(100cqw / 1200); position: relative; aspect-ratio: 1200 / 640; background: #111113; color: #D4D4D8;
  display: flex; align-items: center; transform: scale(.98); transition: transform .6s cubic-bezier(.22,1,.36,1); }
.e5 .e5-slide.on .bap { transform: none; }
.e5 .bap-row { display: flex; align-items: flex-start; gap: calc(32 * var(--u)); padding: 24px 0 24px calc(56 * var(--u)); }
.e5 .bap-col { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; width: calc(300 * var(--u)); }
.e5 .bap-tag { display: inline-flex; align-items: center; height: 32px; padding: 0 10px; border: 1px solid rgba(255,255,255,.12); border-radius: 6px;
  background: rgba(255,255,255,.06); color: #A1A1AA; font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; white-space: nowrap; }
.e5 .bap-after { position: relative; width: 100%; }
.e5 .bap-cw { position: relative; width: 100%; overflow: hidden; background: #FFFFFF; }
.e5 .bap-cw img { display: block; width: 100%; height: auto; pointer-events: none; }
.e5 .bap-cw.before::after { content: ""; position: absolute; inset: 0; background: rgba(17,17,19,.28); }
.e5 .bap-notes { list-style: none; margin: 0; padding: 0; }
.e5 .bap-notes li { position: absolute; left: calc(100% + 10 * var(--u)); display: flex; align-items: center; transform: translateY(-50%);
  width: calc(464 * var(--u)); }
.e5 .bap-notes .dot { flex: none; position: relative; z-index: 1; width: 9px; height: 9px; margin: 0 -4.5px; border-radius: 50%; background: var(--red); box-shadow: 0 0 0 2px rgba(227,30,36,.32); }
.e5 .bap-notes .ld { flex: none; width: calc(46 * var(--u)); height: 1px; background: rgba(138,138,147,.9); }
.e5 .bap-notes span { padding-left: calc(16 * var(--u)); font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; text-transform: uppercase; color: #D4D4D8; }
@container bap (max-width: 760px) {
  .e5 .bap { --u: 1px; aspect-ratio: auto; display: block; padding: 20px; }
  .e5 .bap-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 12px; row-gap: 12px; padding: 0; }
  .e5 .bap-col, .e5 .bap-after { display: contents; }
  .e5 .bap-col:first-child .bap-tag { grid-area: 1 / 1; justify-self: start; }
  .e5 .bap-col:first-child .bap-cw { grid-area: 2 / 1; }
  .e5 .bap-col:last-child .bap-tag { grid-area: 1 / 2; justify-self: start; }
  .e5 .bap-col:last-child .bap-cw { grid-area: 2 / 2; }
  .e5 .bap-cw { height: auto !important; max-height: 420px; }
  .e5 .bap-notes { grid-area: 3 / 1 / 4 / 3; margin-top: 8px; }
  .e5 .bap-notes li { position: static; transform: none; width: auto; align-items: flex-start; gap: 12px; margin-top: 12px; }
  .e5 .bap-notes .dot { margin: 7px 0 0; }
  .e5 .bap-notes .ld { display: none; }
  .e5 .bap-notes span { padding: 0; }
}

.e5 .e5-slide .cap { margin-top: 24px; padding-right: 200px; }
.e5 .e5-slide .cap h3 { font-size: 20px; font-weight: 700; line-height: 28px; }
.e5 .e5-slide .cap p { margin-top: 4px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-sl-foot { display: flex; align-items: center; justify-content: flex-end; gap: 24px; width: var(--sw); margin: -52px auto 0; }
.e5 .e5-sl-foot .count { font-size: 16px; line-height: 24px; color: var(--grey); font-variant-numeric: tabular-nums; }
.e5 .e5-sl-foot .count b { color: var(--ink); font-weight: 700; }
.e5 .e5-sl-foot .ticks { display: flex; gap: 8px; }
.e5 .e5-sl-foot .ticks i { display: block; width: 24px; height: 2px; background: var(--cline); transition: background-color .4s ease; }
.e5 .e5-sl-foot .ticks i.on { background: var(--ink); }
/* small or short screens: the four screens one under another */
.e5 .e5-slider:not(.pinned) .e5-rail { flex-direction: column; gap: 56px; width: var(--sw); margin: 0 auto; padding-left: 0; transition: none; }
.e5 .e5-slider:not(.pinned) .e5-slide { opacity: 1; }
.e5 .e5-slider:not(.pinned) .e5-slide .bap { transform: none; }
.e5 .e5-slider:not(.pinned) .e5-slide .cap { padding-right: 0; }

/* prototype */
.e5 .e7-proto { display: grid; grid-template-columns: minmax(0, 1120px) 280px; justify-content: space-between; gap: 40px; align-items: start; }
.e5 .e7-proto figure { margin: 0; display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.e5 .e7-proto .k { font-size: 16px; font-weight: 700; line-height: 24px; color: #8E8E95; }
.e5 .e7-browser { overflow: hidden; background: #FFFFFF; border: 1px solid #E4D6D7; border-radius: 12px; }
.e5 .e7-browser .bar { position: relative; display: flex; align-items: center; justify-content: space-between; height: 40px; padding: 0 16px; background: #F4EFEF; }
.e5 .e7-browser .dots { display: flex; gap: 8px; }
.e5 .e7-browser .dots i { width: 12px; height: 12px; border-radius: 50%; background: #FF5F57; }
.e5 .e7-browser .dots i:nth-child(2) { background: #FEBC2E; } .e5 .e7-browser .dots i:nth-child(3) { background: #28C840; }
.e5 .e7-browser .url { position: absolute; left: 50%; top: 6px; transform: translateX(-50%); max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 2px 12px; background: #FFFFFF; border-radius: 6px; font-size: 16px; line-height: 24px; color: #6E6A6B; }
.e5 .e7-browser .bar a { font-size: 16px; font-weight: 700; line-height: 24px; color: #E31E24; text-decoration: none; white-space: nowrap; }
.e5 .e7-browser .bar a:focus-visible, .e5 .e7-proto .try:focus-visible { outline: 2px solid var(--red); outline-offset: 3px; }
.e5 .e7-proto .pv { position: relative; display: flex; align-items: center; justify-content: center; background: #F7F3F3; }
.e5 .e7-browser .pv { aspect-ratio: 16 / 9; }
.e5 .e7-proto .pv img, .e5 .e7-proto .pv iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; object-fit: cover; object-position: top; }
.e5 .e7-proto .try { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 8px; padding: 16px 32px; border: 0; border-radius: 999px; background: rgba(30, 30, 32, .88); color: #FFFFFF; font: inherit; font-size: 20px; font-weight: 700; line-height: 24px; cursor: pointer; }
.e5 .e7-phone { box-sizing: border-box; width: 280px; aspect-ratio: 280 / 582; padding: 10px; background: #1E1E20; border-radius: 47px; }
.e5 .e7-phone .pv { height: 100%; align-items: flex-end; padding-bottom: 24%; overflow: hidden; border-radius: 36px; background: #0E0E0E; }
.e5 .e7-phone .try { padding: 12px 20px; font-size: 16px; }
@media (max-width: 1023px) {
  .e5 .e7-proto { grid-template-columns: minmax(0, 1fr); justify-items: center; }
  .e5 .e7-proto .desk { width: 100%; }
  .e5 .e7-browser .url { display: none; }
}

/* results */
.e5 .e5-results { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.e5 .e5-rcard { padding: 32px; background: #FFFFFF; box-shadow: inset 0 0 0 1px var(--cline); }
.e5 .e5-rcard .k { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; line-height: 24px; color: var(--ash); letter-spacing: .04em; }
.e5 .e5-rcard .k .ic { flex: none; }
.e5 .e5-rcard .big { display: block; margin-top: 16px; font-size: 56px; font-weight: 700; line-height: 64px; color: var(--ink); white-space: nowrap; font-variant-numeric: tabular-nums; }
.e5 .e5-rcard .d { margin-top: 16px; min-height: 48px; font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-rcard .rings, .e5 .e5-rcard .flags { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--rline); }
.e5 .e5-rcard .rings { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.e5 .e5-rcard .rings .col { display: flex; flex-direction: column; gap: 12px; }
.e5 .e5-rcard .lab { display: flex; gap: 8px; font-size: 16px; font-weight: 700; line-height: 24px; color: var(--ash); }
.e5 .e5-rcard .after .lab { color: var(--ink); }
.e5 .e5-rcard .rings .arr { flex: none; margin-top: 36px; }
.e5 .e5-rcard .ring { position: relative; display: block; width: 136px; height: 136px; box-shadow: none; outline: 0; } /* Tailwind's .ring draws a blue frame; cancel it */
.e5 .e5-rcard .ring svg { display: block; }
.e5 .e5-rcard .ring .arc { stroke: #C8C8CC; stroke-dashoffset: var(--c); transition: stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1) .2s; }
.e5 .e5-rcard .ring.now .arc { stroke: var(--red); transition-delay: .6s; }
.e5 [data-r].in .e5-rcard .ring .arc { stroke-dashoffset: var(--off); }
.e5 .e5-rcard .ring b { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; line-height: 38px; color: var(--ash); font-variant-numeric: tabular-nums; }
.e5 .e5-rcard .ring.now b { color: var(--ink); }
.e5 .e5-rcard .flags { display: flex; flex-direction: column; gap: 16px; }
.e5 .e5-rcard .flags .row { display: flex; flex-direction: column; gap: 8px; }
.e5 .e5-rcard .fl { display: flex; flex-wrap: wrap; gap: 8px; }
.e5 .e5-rcard .fl img { display: block; width: 36px; height: 36px; }
.e5 .e5-rcard .fl.dim img { opacity: .35; }
.e5 .e5-rcard .after .fl img { opacity: 0; transform: scale(.6); transition: opacity .3s ease var(--d, 0s), transform .4s cubic-bezier(.34,1.56,.64,1) var(--d, 0s); }
.e5 [data-r].in .e5-rcard .after .fl img { opacity: 1; transform: none; }
.e5 .e5-quote { display: grid; grid-template-columns: 48px minmax(0, 1fr) 48px; gap: 48px; }
.e5 .e5-quote .q { font-size: 64px; font-weight: 700; line-height: 64px; color: var(--red); }
.e5 .e5-quote .c { text-align: right; }
.e5 .e5-quote p { font-size: 24px; font-weight: 500; line-height: 36px; }
.e5 .e5-quote footer { margin-top: 24px; font-size: 16px; line-height: 24px; color: var(--grey); }

/* takeaways: the office photo behind */
.e5 .e5-take { position: relative; overflow: hidden; min-height: clamp(720px, 46vw, 880px); padding: 120px 0 288px; background: #1A1A1A; color: #FFFFFF; }
.e5 .e5-take .bg { position: absolute; z-index: 0; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 70%; transform: scale(1.12); will-change: transform; }
.e5 .e5-take .e5-w { position: relative; z-index: 2; }
.e5 .e5-take .t { margin-top: 24px; max-width: 1000px; font-size: 56px; font-weight: 700; line-height: 64px; color: #FFFFFF; }
.e5 .e5-take .d { margin-top: 48px; max-width: 960px; font-size: 20px; line-height: 32px; color: rgba(255,255,255,.82); }

/* next case study */
.e5 .e5-next { background: #F5F5F2; }
.e5 .e5-next .next-card { display: flex; flex-direction: column; gap: 16px; padding: 140px 0; color: var(--ink); text-decoration: none; }
.e5 .e5-next .eyebrow { font-size: 16px; line-height: 24px; color: var(--grey); }
.e5 .e5-next .next-name { font-size: clamp(48px, 5vw, 96px); font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; transition: transform .3s ease-out; }
.e5 .e5-next .next-card:hover .next-name { transform: translateX(8px); }
.e5 .e5-next .go { display: inline-block; transition: transform .3s ease-out; }
.e5 .e5-next .next-card:hover .go { transform: translateX(8px); }

@media (max-width: 1280px) {
  .e5 .e5-rt { width: 280px; }
}
@media (max-width: 1023px) {
  .e5 .e5-row { flex-direction: column; gap: 16px; }
  .e5 .e5-rt { width: auto; }
  .e5 .e5-stills { grid-template-columns: minmax(0, 1fr); max-width: 464px; }
  .e5 .e5-results { grid-template-columns: minmax(0, 1fr); }
  .e5 .e5-quote { grid-template-columns: 32px minmax(0, 1fr); gap: 24px; }
  .e5 .e5-quote .c { display: none; }
}
@media (max-width: 700px) {
  .e5 .e5-w { width: calc(100vw - 40px); }
  .e5 .e5-slider { --sw: calc(100vw - 40px); }
  .e5 .e5-hero { padding: 104px 0 88px; }
  .e5 .e5-h1 { font-size: 40px; line-height: 48px; }
  .e5 .e5-sec { padding: 88px 0; }
  .e5 .e5-h2 { font-size: 32px; line-height: 40px; }
  .e5 .mt120 { margin-top: 88px; }
  .e5 .e5-meta, .e5 .e5-stats { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .e5 .e5-stats .n { font-size: 40px; line-height: 48px; }
  .e5 .e5-rcard .big { font-size: 48px; line-height: 56px; }
  .e5 .e5-take { padding: 88px 0 240px; }
  .e5 .e5-take::before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, rgba(10,8,9,.72) 0%, rgba(10,8,9,.55) 65%, rgba(10,8,9,0) 100%); }
  .e5 .e5-take .t { font-size: 36px; line-height: 44px; }
  .e5 .e5-take .d { margin-top: 32px; font-size: 18px; line-height: 28px; }
  .e5 .e5-quote p { font-size: 20px; line-height: 32px; }
}
@media (prefers-reduced-motion: reduce) {
  .e5 [data-r] { opacity: 1 !important; transform: none !important; transition: none !important; }
  .e5 .e5-rcard .ring .arc { stroke-dashoffset: var(--off) !important; transition: none !important; }
  .e5 .e5-rcard .after .fl img { opacity: 1 !important; transform: none !important; transition: none !important; }
  .e5 .e5-ring::before, .e5 .e5-ring::after { animation: none !important; }
  .e5 .e5-take .bg { transform: none !important; }
  .e5 .e5-rail { transition: none; }
}
`
