import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Closing CTA — Harbor's Figma "Closing CTA" (44기 김지현 4차 PF, node 474:217), built to the frame exactly (880px tall at
// 1920 wide: rows 168 / 552 / 160):
// - #0F0F0F band with a soft shadow onto the footer. Three rows on a line grid: a 1440 outer column and a 1104 inner column,
//   1px rgba(255,255,255,.1) lines, and 3px corner dots 8px in from the corners — row 1 a 168px spacer, row 2 the content
//   (40px top and bottom, 24px gap), row 3 a 160px spacer.
// - Content: the 640×408 "Kim LLM" chat card, then "See my work" (ghost) and "Book a call" (white), 232×40, 16px apart.
// - Chat card: 48px header (brain icon + "Kim LLM" | "Answers from her portfolio"), 248px messages (24px padding, 16px gap)
//   with the greeting (Harbor-mark avatar, "Let’s connect the dots together." in Newsreader 30/40, the line under it),
//   the sample question "Walk me through the Trust Bank project." and the typing dots, 56px of suggestion chips (40px
//   tall), and the 56px input row with the 40px white send button.
// Lines are drawn inside each box (inset box-shadows), the way Figma draws inside strokes, so no line adds to a size.
// Fonts as in Figma: Geist Medium (card title, buttons), SF Pro (body — the system font on Apple devices, Helvetica Neue
// elsewhere), Newsreader (greeting). Every text 16px or larger. All icons are Figma's own SVGs, exported from the file.
//
// It works (Harbor, Nov 9):
// - At rest it looks exactly like the frame. When the card scrolls into view, the typing dots finish and Kim LLM answers the
//   sample Trust Bank question.
// - Type a question and press Enter or the send button, or tap a chip: your message appears, the dots pulse, then the answer.
//   Several questions in a row are each answered in turn. Answers are scripted from what is on this site (no AI service).
//   The message area keeps the frame's height and scrolls, so the card never changes size.
// - Hover: chips, buttons and send lighten; the card and buttons rise in on scroll. Reduced motion: no pulsing or rising.

const CAL = 'https://cal.com/harbor-kim-wqsmkt/30min'
const SAMPLE_Q = 'Walk me through the Trust Bank project.'
const CHIPS = ['Your design process', 'Fintech experience', 'Open to new roles?']

// Scripted answers — only facts already on this site (case studies, About page, menu facts).
const ANSWERS: { k: RegExp; a: string }[] = [
  { k: /trust|bank|reward/i, a: 'Trust Bank Singapore was an eight-week project (June – August 2026) about turning hidden rewards into everyday loyalty. Harbor led planning, UI design and usability tests, and the redesign scored 85 on ease of use.' },
  { k: /process|approach|method|how (do|does) (you|she) work/i, a: 'She owns the work end to end, from finding the problem to shipping the fix: discover, define, develop, deliver, then test with real people. On Trust Bank that meant research and affinity mapping before the UI, and usability tests after it.' },
  { k: /fintech|finance|banking|trading|crypto|wallet/i, a: 'Harbor has 3+ years in fintech and e-learning: trading platforms, digital banking, crypto wallets and data dashboards — including UTrada’s trading platform (2024 – 2026) and ETO Markets in Sydney (2022 – 2023).' },
  { k: /open|role|available|availability|hire|hiring|job|work with/i, a: 'Yes — Harbor is open to product design roles. A 30-minute call is the quickest way to start: use “Book a call” below, or email harborkim0328@gmail.com.' },
  { k: /game|cove|dashboard/i, a: 'GameCove is an AI game-analytics dashboard Harbor designed as a team project: Overview, AI mapping, Retention and an AI agent.' },
  { k: /utrada/i, a: 'At UTrada, Harbor worked on product design for a trading platform from 2024 to 2026, including its design system.' },
  { k: /skill|tool|figma|strength/i, a: 'Figma, design systems, prototyping, multilingual design in up to 11 languages, and AI design tools.' },
  { k: /contact|email|call|book|reach/i, a: 'Book a 30-minute call with “Book a call” below, or email harborkim0328@gmail.com.' },
  { k: /who|about|harbor|background|yourself|career|experience|art/i, a: 'Harbor is a product designer with 3+ years in fintech and e-learning. She started in Fine Art, drawing what she saw, and now designs end to end, from research to UI.' },
]
const FALLBACK = 'I can tell you about Harbor’s projects, process, or availability. Try one of the suggestions below.'
const answerFor = (q: string) => (ANSWERS.find(x => x.k.test(q))?.a ?? FALLBACK)

const ICON_BRAIN = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g clip-path="url(#cxb_clip)"><path d="M7.99997 3.33353C8.00075 3.06688 7.94821 2.80277 7.84543 2.55673C7.74265 2.31069 7.59171 2.08768 7.40148 1.90083C7.21125 1.71397 6.98558 1.56704 6.73774 1.46868C6.4899 1.37032 6.22489 1.32251 5.9583 1.32807C5.69171 1.33363 5.42892 1.39244 5.18539 1.50104C4.94187 1.60964 4.72251 1.76585 4.54024 1.96047C4.35796 2.15508 4.21644 2.38419 4.124 2.6343C4.03156 2.88441 3.99007 3.15048 4.00197 3.41686C3.6101 3.51762 3.2463 3.70623 2.93812 3.9684C2.62994 4.23058 2.38546 4.55945 2.2232 4.9301C2.06093 5.30075 1.98514 5.70346 2.00156 6.10774C2.01798 6.51202 2.12618 6.90726 2.31797 7.26353C1.98076 7.53748 1.71559 7.88968 1.54553 8.28949C1.37547 8.68929 1.30567 9.12459 1.34221 9.55752C1.37875 9.99045 1.52051 10.4079 1.75517 10.7735C1.98983 11.1392 2.31028 11.442 2.68863 11.6555C2.64191 12.017 2.66979 12.3843 2.77056 12.7345C2.87132 13.0848 3.04283 13.4108 3.27449 13.6922C3.50615 13.9736 3.79304 14.2045 4.11745 14.3707C4.44185 14.5369 4.79689 14.6348 5.16062 14.6584C5.52435 14.682 5.88906 14.6308 6.23223 14.5079C6.57539 14.3851 6.88972 14.1931 7.15581 13.944C7.42189 13.6949 7.63409 13.3939 7.77928 13.0596C7.92447 12.7252 7.99958 12.3647 7.99997 12.0002V3.33353Z" stroke="#FAFAFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.00001 3.33353C7.99922 3.06688 8.05177 2.80277 8.15455 2.55673C8.25733 2.31069 8.40827 2.08768 8.5985 1.90083C8.78872 1.71397 9.01439 1.56704 9.26224 1.46868C9.51008 1.37032 9.77509 1.32251 10.0417 1.32807C10.3083 1.33363 10.5711 1.39244 10.8146 1.50104C11.0581 1.60964 11.2775 1.76585 11.4597 1.96047C11.642 2.15508 11.7835 2.38419 11.876 2.6343C11.9684 2.88441 12.0099 3.15048 11.998 3.41686C12.3899 3.51762 12.7537 3.70623 13.0619 3.9684C13.37 4.23058 13.6145 4.55945 13.7768 4.9301C13.939 5.30075 14.0148 5.70346 13.9984 6.10774C13.982 6.51202 13.8738 6.90726 13.682 7.26353C14.0192 7.53748 14.2844 7.88968 14.4545 8.28949C14.6245 8.68929 14.6943 9.12459 14.6578 9.55752C14.6212 9.99045 14.4795 10.4079 14.2448 10.7735C14.0101 11.1392 13.6897 11.442 13.3113 11.6555C13.3581 12.017 13.3302 12.3843 13.2294 12.7345C13.1287 13.0848 12.9571 13.4108 12.7255 13.6922C12.4938 13.9736 12.2069 14.2045 11.8825 14.3707C11.5581 14.5369 11.2031 14.6348 10.8394 14.6584C10.4756 14.682 10.1109 14.6308 9.76775 14.5079C9.42459 14.3851 9.11025 14.1931 8.84417 13.944C8.57808 13.6949 8.36589 13.3939 8.2207 13.0596C8.07551 12.7252 8.0004 12.3647 8.00001 12.0002V3.33353Z" stroke="#FAFAFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 8.66667C9.4403 8.46977 8.95155 8.11133 8.59555 7.63667C8.23956 7.16201 8.0323 6.59245 8 6C7.9677 6.59245 7.76045 7.16201 7.40445 7.63667C7.04845 8.11133 6.5597 8.46977 6 8.66667" stroke="#FAFAFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.7327 4.33317C11.894 4.05356 11.9853 3.73905 11.9987 3.4165" stroke="#FAFAFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.00195 3.4165C4.01514 3.73899 4.10617 4.0535 4.26729 4.33317" stroke="#FAFAFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.31799 7.264C2.43995 7.16467 2.57046 7.07633 2.70799 7" stroke="#FAFAFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.292 7C13.4295 7.07633 13.56 7.16467 13.682 7.264" stroke="#FAFAFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.00005 11.9998C3.54061 12 3.0889 11.8815 2.68872 11.6558" stroke="#FAFAFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.3113 11.6558C12.9112 11.8815 12.4594 12 12 11.9998" stroke="#FAFAFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="cxb_clip"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>`

// Harbor mark (avatar icon) — one mask id per instance so several avatars can share the page
const harborMark = (id: string) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><mask id="${id}" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16"><path d="M0 0H15.1703V15.1703H0V0Z" fill="#FAFAFA"/></mask><g mask="url(#${id})"><path d="M7.56142 0.438965C5.60043 0.438965 3.98697 1.92538 3.78554 3.83279C1.87755 4.03379 0.39121 5.64805 0.391113 7.60932C0.391247 9.57054 1.8776 11.1843 3.78554 11.3852C3.98677 13.2929 5.60029 14.7797 7.56142 14.7797C9.52261 14.7796 11.1362 13.2929 11.3374 11.3852C13.245 11.184 14.7317 9.57034 14.7318 7.60932C14.7317 5.6483 13.245 4.03411 11.3374 3.83279C11.1361 1.92544 9.5225 0.439047 7.56142 0.438965ZM7.56142 1.28711C9.05543 1.2872 10.2891 2.39831 10.483 3.83896C9.28091 3.98137 8.25267 4.68612 7.66451 5.68218C7.97348 5.69482 8.26304 5.78142 8.51701 5.92415C8.9665 5.27998 9.66496 4.82258 10.4744 4.69575C10.3477 5.50545 9.89062 6.20417 9.24665 6.65378C9.38944 6.90788 9.47603 7.1977 9.48861 7.50686C10.4847 6.91863 11.1889 5.88958 11.3312 4.68711C12.7721 4.88107 13.8836 6.11529 13.8836 7.60932C13.8835 9.10354 12.7718 10.3373 11.3305 10.5309C11.1879 9.32774 10.4833 8.29786 9.48614 7.70995C9.46642 8.01551 9.37326 8.30052 9.22623 8.55008C9.88082 8.99906 10.346 9.70391 10.4744 10.5217C9.65087 10.3926 8.94254 9.92166 8.49413 9.25992C8.23865 9.39898 7.94788 9.4804 7.63859 9.489C8.22182 10.5096 9.2622 11.2339 10.483 11.3784C10.2895 12.8197 9.05575 13.9315 7.56142 13.9316C6.06705 13.9316 4.83348 12.8196 4.63986 11.3784C5.86104 11.2336 6.90245 10.509 7.4855 9.48773C7.17988 9.47199 6.89443 9.38274 6.64355 9.23957C6.19575 9.91213 5.48044 10.3911 4.6485 10.5217C4.7791 9.68994 5.2583 8.97547 5.93059 8.52783C5.78725 8.27675 5.69874 7.9906 5.68306 7.68467C4.6615 8.26772 3.93719 9.30935 3.79233 10.5309C2.35085 10.3376 1.23939 9.10379 1.23925 7.60932C1.23935 6.11504 2.35047 4.88078 3.79171 4.68711C3.93632 5.9084 4.66081 6.94947 5.68182 7.53278C5.69025 7.22311 5.77103 6.93177 5.91022 6.67603C5.24858 6.2275 4.77748 5.51941 4.6485 4.69575C5.46633 4.82409 6.17156 5.28959 6.62073 5.9445C6.87028 5.79753 7.15523 5.70431 7.46085 5.68465C6.87287 4.68698 5.84257 3.98154 4.63924 3.83896C4.83328 2.39831 6.06738 1.28711 7.56142 1.28711Z" fill="#FAFAFA"/></g></svg>`

const ICON_ARROW_UP = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 13V3M12.5 7.5L8 3L3.5 7.5" stroke="#0F0F0F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro", "Helvetica Neue", Helvetica, Arial, sans-serif'
const GEIST = '"Geist", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif'
const SERIF = '"Newsreader", Georgia, "Times New Roman", serif'
const LINE = 'rgba(255,255,255,.1)'
// inside lines (like Figma's inside strokes): they never add to a box's size
const IN_T = `inset 0 1px 0 ${LINE}`
const IN_B = `inset 0 -1px 0 ${LINE}`
const IN_L = `inset 1px 0 0 ${LINE}`
const IN_R = `inset -1px 0 0 ${LINE}`

const CX_CSS = `
.hb .cx { position: relative; z-index: 1; display: flex; flex-direction: column; background: #0F0F0F; color: #FAFAFA;
  box-shadow: 0 14px 12px -5px rgba(0,0,0,.4); font-family: ${SF}; }
.hb .cx *, .hb .cx *::before, .hb .cx *::after { box-sizing: border-box; }

/* the line grid: full-width rows, a 1440 outer column and a 1104 inner column */
.hb .cx-row { display: flex; justify-content: center; width: 100%; }
.hb .cx-r1 { height: 168px; box-shadow: ${IN_T}; }
.hb .cx-r2 { box-shadow: ${IN_T}, ${IN_B}; }
.hb .cx-r3 { height: 160px; }
.hb .cx-outer { position: relative; display: flex; justify-content: center; width: min(1440px, 100%); box-shadow: ${IN_L}, ${IN_R}; }
.hb .cx-inner { position: relative; width: 76.6667%; box-shadow: ${IN_L}, ${IN_R}; }
.hb .cx-r2 .cx-inner { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; padding: 40px 0;
  box-shadow: ${IN_L}, ${IN_R}, ${IN_B}; }
.hb .cx-dot { position: absolute; width: 3px; height: 3px; background: ${LINE}; }
.hb .cx-dot.bl { left: 8px; bottom: 8px; } .hb .cx-dot.br { right: 8px; bottom: 8px; }

/* rise-in on scroll */
.hb .cx-rise { opacity: 0; transform: translateY(16px); transition: opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1); }
.hb .cx-rise.in { opacity: 1; transform: none; }
.hb .cx-rise.d1 { transition-delay: .12s; }

/* chat card: 640 × 408 */
.hb .cx-chat { display: flex; flex-direction: column; width: min(640px, calc(100% - 32px)); background: rgba(255,255,255,.02);
  box-shadow: inset 0 0 0 1px ${LINE}; overflow: hidden; text-align: left; transition: box-shadow .2s ease, opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1); }
.hb .cx-chat:focus-within { box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
.hb .cx-head { display: flex; align-items: center; justify-content: space-between; height: 48px; padding: 0 16px; box-shadow: ${IN_B}; }
.hb .cx-title { display: flex; align-items: center; gap: 8px; }
.hb .cx-title svg { display: block; width: 16px; height: 16px; }
.hb .cx-title b { font-family: ${GEIST}; font-weight: 500; font-size: 16px; line-height: 16px; color: #FAFAFA; white-space: nowrap; }
.hb .cx-src { font-family: ${SF}; font-size: 16px; line-height: 24px; color: #8C8C8C; white-space: nowrap; }

.hb .cx-msgs { display: flex; flex-direction: column; gap: 16px; padding: 24px; overflow-y: auto; scrollbar-width: none; overscroll-behavior: contain; }
.hb .cx-msgs::-webkit-scrollbar { display: none; }
.hb .cx-ai { display: flex; align-items: flex-start; gap: 16px; width: 100%; flex: none; }
.hb .cx-ai.typing { align-items: center; width: auto; }
.hb .cx-av { flex: none; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: rgba(255,255,255,.06); box-shadow: inset 0 0 0 1px ${LINE}; }
.hb .cx-av svg { display: block; width: 16px; height: 16px; }
.hb .cx-bub { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.hb .cx-greet { margin: 0; font-family: ${SERIF}; font-weight: 400; font-size: 30px; line-height: 40px; letter-spacing: -0.6px; color: #FAFAFA; }
.hb .cx-text { margin: 0; font-family: ${SF}; font-size: 16px; line-height: 24px; color: rgba(250,250,250,.7); }
.hb .cx-me { display: flex; justify-content: flex-end; width: 100%; flex: none; }
.hb .cx-me span { max-width: 85%; padding: 8px 16px; background: rgba(255,255,255,.08); font-family: ${SF}; font-size: 16px; line-height: 24px; color: #FAFAFA; }
.hb .cx-new { animation: cx-in .4s cubic-bezier(.22,1,.36,1) both; }
@keyframes cx-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

/* typing dots (Figma: 3 × 8px, 8px apart, at 40/60/80%) — they pulse while Kim LLM is answering */
.hb .cx-dots { display: block; width: 40px; height: 8px; }
.hb .cx-dots circle { animation: cx-dot 1.2s ease-in-out infinite; }
.hb .cx-dots circle:nth-child(1) { fill-opacity: .4; animation-delay: 0s; }
.hb .cx-dots circle:nth-child(2) { fill-opacity: .6; animation-delay: .2s; }
.hb .cx-dots circle:nth-child(3) { fill-opacity: .8; animation-delay: .4s; }
@keyframes cx-dot { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }

/* suggestions: 40px chips in a 56px row */
.hb .cx-sugg { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 24px 16px; }
.hb .cx-chip { height: 40px; padding: 8px 16px; margin: 0; background: transparent; border: 0; border-radius: 0; box-shadow: inset 0 0 0 1px rgba(250,250,250,.15); cursor: pointer;
  font-family: ${SF}; font-size: 16px; line-height: 24px; color: rgba(250,250,250,.8); white-space: nowrap; transition: background-color .2s ease, box-shadow .2s ease, color .2s ease; }
.hb .cx-chip:hover { background: rgba(255,255,255,.06); box-shadow: inset 0 0 0 1px rgba(250,250,250,.3); color: #FAFAFA; }
.hb .cx-chip:focus-visible { outline: 2px solid #FAFAFA; outline-offset: 2px; }

/* input row */
.hb .cx-input { display: flex; align-items: center; gap: 16px; height: 56px; padding: 0 8px 0 24px; margin: 0; box-shadow: ${IN_T}; }
.hb .cx-input input { flex: 1 1 0; min-width: 0; height: 100%; padding: 0; margin: 0; background: transparent; border: 0; outline: 0; border-radius: 0;
  font-family: ${SF}; font-size: 16px; line-height: 24px; color: #FAFAFA; }
.hb .cx-input input::placeholder { color: #8C8C8C; opacity: 1; }
.hb .cx-send { flex: none; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; padding: 0; background: #FAFAFA; border: 0; border-radius: 0;
  cursor: pointer; transition: background-color .2s ease; }
.hb .cx-send:hover { background: #E5E5E5; }
.hb .cx-send:focus-visible { outline: 2px solid #FAFAFA; outline-offset: 2px; }
.hb .cx-send svg { display: block; width: 16px; height: 16px; transition: transform .25s cubic-bezier(.22,1,.36,1); }
.hb .cx-send:hover svg { transform: translateY(-2px); }

/* buttons: 232 × 40 */
.hb .cx-btns { display: flex; gap: 16px; }
.hb .cx-btn { display: flex; align-items: center; justify-content: center; width: 232px; height: 40px; padding: 12px 24px; text-decoration: none;
  font-family: ${GEIST}; font-weight: 500; font-size: 16px; line-height: 16px; white-space: nowrap; text-align: center;
  transition: background-color .2s ease, box-shadow .2s ease, color .2s ease; }
.hb .cx-btn.ghost { background: rgba(255,255,255,.04); box-shadow: inset 0 0 0 1px rgba(250,250,250,.15); color: rgba(250,250,250,.8); }
.hb .cx-btn.ghost:hover { background: rgba(255,255,255,.08); box-shadow: inset 0 0 0 1px rgba(250,250,250,.3); color: #FAFAFA; }
.hb .cx-btn.solid { background: #FAFAFA; color: #0F0F0F; }
.hb .cx-btn.solid:hover { background: #E5E5E5; }
.hb .cx-btn:focus-visible { outline: 2px solid #FAFAFA; outline-offset: 3px; }

@media (max-width: 900px) {
  .hb .cx-inner { width: calc(100% - 32px); }
  .hb .cx-r1 { height: 96px; } .hb .cx-r3 { height: 96px; }
  .hb .cx-src { display: none; }
  .hb .cx-greet { font-size: 26px; line-height: 34px; }
  .hb .cx-btns { flex-direction: column; width: min(640px, calc(100% - 32px)); }
  .hb .cx-btn { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .hb .cx-dots circle { animation: none; }
  .hb .cx-rise { opacity: 1; transform: none; transition: none; }
  .hb .cx-new { animation: none; }
}
`

type Msg = { id: number; who: 'ai' | 'me'; text: string; greet?: boolean }

function Avatar({ id }: { id: string }) {
  return <span className="cx-av" aria-hidden="true" dangerouslySetInnerHTML={{ __html: harborMark(id) }} />
}

function Dots() {
  return (
    <svg className="cx-dots" width="40" height="8" viewBox="0 0 40 8" fill="none" aria-hidden="true">
      <circle cx="4" cy="4" r="4" fill="#FAFAFA" />
      <circle cx="20" cy="4" r="4" fill="#FAFAFA" />
      <circle cx="36" cy="4" r="4" fill="#FAFAFA" />
    </svg>
  )
}

export function ClosingCTAB() {
  // at rest = the Figma frame: greeting, the sample question, and the typing dots
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 0, who: 'ai', greet: true, text: 'I answer from Harbor’s portfolio and case studies. Ask about her projects, process, or availability.' },
    { id: 1, who: 'me', text: SAMPLE_Q },
  ])
  const [typing, setTyping] = useState(true)
  const [text, setText] = useState('')
  const sec = useRef<HTMLElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const timers = useRef<number[]>([])
  const pending = useRef(0)
  const nextId = useRef(2)
  const started = useRef(false)

  // each question gets its own answer, in order; the dots show while any answer is still coming
  const reply = (q: string, delay: number) => {
    pending.current++
    setTyping(true)
    timers.current.push(window.setTimeout(() => {
      setMsgs(m => [...m, { id: nextId.current++, who: 'ai', text: answerFor(q) }])
      pending.current--
      if (pending.current === 0) setTyping(false)
    }, delay + pending.current * 250))
  }

  const ask = (q: string) => {
    const t = q.trim()
    if (!t) { input.current?.focus(); return }
    if (!started.current) { started.current = true; setTyping(false) } // the sample answer is dropped once someone asks their own question
    setMsgs(m => [...m, { id: nextId.current++, who: 'me', text: t }])
    setText('')
    reply(t, 900 + Math.min(900, t.length * 12))
  }

  // keep the message area at the frame's height (measured once fonts are in), so the card never changes size
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const lock = () => {
      if (innerWidth > 700) { el.style.maxHeight = ''; el.style.height = ''; el.style.height = el.offsetHeight + 'px' }
      else { el.style.height = ''; el.style.maxHeight = '360px' }
    }
    lock()
    ;(document as any).fonts?.ready?.then(lock)
  }, [])

  // follow the conversation
  useEffect(() => {
    const el = box.current
    if (!el || msgs.length <= 2) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : 'smooth' }))
  }, [msgs, typing])

  // rise-in on scroll; the first time the card is in view, Kim LLM answers the sample question
  useEffect(() => {
    const s = sec.current
    if (!s) return
    const els = Array.from(s.querySelectorAll<HTMLElement>('.cx-rise'))
    const startSample = () => {
      if (started.current) return
      started.current = true
      setTyping(false)
      reply(SAMPLE_Q, 1600)
    }
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); startSample(); return }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return
      e.target.classList.add('in')
      io.unobserve(e.target)
      if ((e.target as HTMLElement).classList.contains('cx-chat')) startSample()
    }), { threshold: 0.35 })
    els.forEach(e => io.observe(e))
    return () => { io.disconnect(); timers.current.forEach(t => window.clearTimeout(t)) }
  }, [])

  return (
    <section className="cx" id="contact" aria-label="Contact" ref={sec}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@500&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap" />
      <style>{CX_CSS}</style>

      {/* row 1 · spacer */}
      <div className="cx-row cx-r1">
        <div className="cx-outer">
          <div className="cx-inner"><i className="cx-dot bl" /><i className="cx-dot br" /></div>
        </div>
      </div>

      {/* row 2 · content */}
      <div className="cx-row cx-r2">
        <div className="cx-outer">
          <div className="cx-inner">
            <div className="cx-chat cx-rise" role="region" aria-label="Kim LLM chat">
              <div className="cx-head">
                <div className="cx-title"><span dangerouslySetInnerHTML={{ __html: ICON_BRAIN }} /><b>Kim LLM</b></div>
                <span className="cx-src">Answers from her portfolio</span>
              </div>

              <div className="cx-msgs" ref={box} aria-live="polite">
                {msgs.map(m => m.who === 'me' ? (
                  <div className={'cx-me' + (m.id > 1 ? ' cx-new' : '')} key={m.id}><span>{m.text}</span></div>
                ) : (
                  <div className={'cx-ai' + (m.id > 1 ? ' cx-new' : '')} key={m.id}>
                    <Avatar id={'cxm' + m.id} />
                    <div className="cx-bub">
                      {m.greet && <p className="cx-greet">Let’s connect the dots together.</p>}
                      <p className="cx-text">{m.text}</p>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="cx-ai typing" aria-label="Kim LLM is typing">
                    <Avatar id="cxtyping" />
                    <Dots />
                  </div>
                )}
              </div>

              <div className="cx-sugg">
                {CHIPS.map(c => <button key={c} type="button" className="cx-chip" onClick={() => ask(c)}>{c}</button>)}
              </div>

              <form className="cx-input" onSubmit={e => { e.preventDefault(); ask(text) }}>
                <input ref={input} value={text} onChange={e => setText(e.target.value)} placeholder="Ask about projects, process, or availability…"
                  aria-label="Ask Kim LLM about Harbor" autoComplete="off" />
                <button type="submit" className="cx-send" aria-label="Send" dangerouslySetInnerHTML={{ __html: ICON_ARROW_UP }} />
              </form>
            </div>

            <div className="cx-btns cx-rise d1">
              <a className="cx-btn ghost" href="#projects">See my work</a>
              <a className="cx-btn solid" href={CAL} target="_blank" rel="noreferrer">Book a call</a>
            </div>

            <i className="cx-dot bl" /><i className="cx-dot br" />
          </div>
        </div>
      </div>

      {/* row 3 · spacer */}
      <div className="cx-row cx-r3">
        <div className="cx-outer">
          <div className="cx-inner" />
          <i className="cx-dot bl" /><i className="cx-dot br" />
        </div>
      </div>
    </section>
  )
}
