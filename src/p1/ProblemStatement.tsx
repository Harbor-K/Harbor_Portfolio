import React, { useEffect, useRef, useState } from 'react';

/**
 * Trust Bank · Problem statement band (Figma 9eRSsfAhsJk0OmvJdrxZ6E · 2397:423 "Problem statement · motion v2", Nov 24).
 * Sky band #C8ECFF, PROBLEM STATEMENT (17) over two bold 50px lines. "rewards system" and "loyalty" sit in white 70%
 * chips (radius 16, padding 6/18/6/10, gap 12) with a 48px icon tile: an orange LP coin and a purple heart.
 * Sizes are in em of the 50px statement so the band scales down on narrow screens (clamp 28–50px) and wraps.
 * Motion = the Figma timeline, played once when the band scrolls into view (the Figma loops it every 4.5 s):
 * words rise in one by one, the chips pop and their icons spin in, "fails to earn" turns Trust blue, then "fails"
 * drops and tilts, and stays there. Reduced motion: that last state, no movement.
 * Type follows the rest of the case study (Helvetica Neue) rather than the Figma's Inter.
 * No full stops after the chips (Harbor, Nov 24).
 */

const INK = '#000d10';
const BLUE = '#009ddc';
const HELV = '"Helvetica Neue", Helvetica, Arial, sans-serif';

type Word = { w: string; t: number; blue?: boolean; drop?: boolean };
type Chip = { chip: 'lp' | 'heart'; label: string; t: number };
type Bit = Word | Chip;

// start times (s) from the Figma motion
const LINE_1: Bit[] = [
  { w: 'Users', t: 0.2 }, { w: 'are', t: 0.26 }, { w: 'not', t: 0.32 }, { w: 'aware', t: 0.38 }, { w: 'of', t: 0.44 }, { w: 'the', t: 0.5 },
  { chip: 'lp', label: 'rewards system', t: 0.56 },
];
const LINE_2: Bit[] = [
  { w: 'So', t: 0.96 }, { w: 'the', t: 1.02 }, { w: 'business', t: 1.08 },
  { w: 'fails', t: 1.14, blue: true, drop: true }, { w: 'to', t: 1.2, blue: true }, { w: 'earn', t: 1.26, blue: true },
  { chip: 'heart', label: 'loyalty', t: 1.32 },
];

const at = (t: number) => ({ '--t': `${t}s` } as React.CSSProperties);

function Icon({ kind }: { kind: 'lp' | 'heart' }) {
  if (kind === 'lp') {
    return (
      <span className="ic lp">
        <svg className="coin" viewBox="0 0 40 40" width="40" height="40">
          <circle cx="20" cy="20" r="18.75" fill="#EF7D00" stroke="#FFFFFF" strokeWidth="2.5" />
          <text x="20" y="20.5" textAnchor="middle" dominantBaseline="central" fill="#FFFFFF"
            style={{ font: `800 17px ${HELV}`, letterSpacing: '-0.34px' }}>LP</text>
        </svg>
      </span>
    );
  }
  return (
    <span className="ic heart">
      <svg className="hrt" viewBox="0 0 29 28" width="29" height="28">
        <path d="M14.5 26.5C14.5 26.5 0.5 18 0.5 8.5C0.5 4 4 0.5 8 0.5C11 0.5 13.3 2.3 14.5 4.7C15.7 2.3 18 0.5 21 0.5C25 0.5 28.5 4 28.5 8.5C28.5 18 14.5 26.5 14.5 26.5Z" fill="#8F6FD0" stroke="#000000" />
      </svg>
    </span>
  );
}

function Line({ bits }: { bits: Bit[] }) {
  return (
    <span className="ln">
      {bits.map((b, i) => 'w' in b ? (
        <span key={i} className={'w' + (b.blue ? ' blue' : '')} style={at(b.t)}>
          {b.drop ? <span className="fall">{b.w}</span> : b.w}
        </span>
      ) : (
        <span key={i} className="cs">
          <span className="chip" style={at(b.t)}>
            <span className="icw" style={at(b.t + 0.1)}><Icon kind={b.chip} /></span>
            <span>{b.label}</span>
          </span>
        </span>
      ))}
    </span>
  );
}

export function ProblemStatement() {
  const ref = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { setGo(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="tb-ps-band">
      <style>{PS_CSS}</style>
      <div className={'tb-ps' + (go ? ' go' : '')} ref={ref}>
        <p className="eb">PROBLEM STATEMENT</p>
        <p className="st">
          <span className="sr-only">Users are not aware of the rewards system. So the business fails to earn loyalty.</span>
          <span aria-hidden="true" className="lines">
            <Line bits={LINE_1} />
            <Line bits={LINE_2} />
          </span>
        </p>
      </div>
    </div>
  );
}

const PS_CSS = `
.tb-ps-band { background: #C8ECFF; }
.tb-ps { max-width: 1440px; margin: 0 auto; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 24px;
  padding: 48px 24px 47px; font-family: ${HELV}; color: ${INK}; text-align: center; }
.tb-ps .eb { margin: 0; font-size: 17px; line-height: 21px; opacity: 0; }
.tb-ps .st { margin: 0; font-size: clamp(28px, 3.5vw, 50px); font-weight: 700; letter-spacing: -0.01em; }
.tb-ps .lines { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.tb-ps .ln { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; column-gap: .28em; row-gap: 8px; }
.tb-ps .w { display: inline-block; line-height: 1.22; opacity: 0; transform: translateY(24px); }
.tb-ps .fall { display: inline-block; }
.tb-ps .cs { display: inline-flex; align-items: center; gap: .08em; }
.tb-ps .chip { display: inline-flex; align-items: center; gap: .24em; padding: .12em .36em .12em .2em; border-radius: .32em;
  background: rgba(255,255,255,.7); line-height: 1.22; white-space: nowrap; opacity: 0; transform: scale(.7); }
.tb-ps .icw { display: inline-flex; transform: rotate(18deg) scale(.4); }
.tb-ps .ic { display: inline-flex; align-items: center; justify-content: center; width: .96em; height: .96em; border-radius: .24em; }
.tb-ps .ic.lp { background: #FFD9A6; }
.tb-ps .ic.heart { background: #EFE6FB; }
.tb-ps .coin { width: .8em; height: .8em; overflow: visible; filter: drop-shadow(0 .04em .08em rgba(153,77,0,.35)); }
.tb-ps .hrt { width: .58em; height: .56em; }

/* the Figma timeline, once */
.tb-ps.go .eb { animation: ps-op .3s ease-out forwards; }
.tb-ps.go .w { animation: ps-op .3s ease-out var(--t) forwards, ps-rise .45s ease-out var(--t) forwards; }
.tb-ps.go .w.blue { animation: ps-op .3s ease-out var(--t) forwards, ps-rise .45s ease-out var(--t) forwards, ps-blue .35s ease-out 1.92s forwards; }
.tb-ps.go .chip { animation: ps-op .15s ease-out var(--t) forwards, ps-pop .5s cubic-bezier(.45,1.45,.8,1) var(--t) forwards; }
.tb-ps.go .icw { animation: ps-spin .6s var(--t) forwards; }
.tb-ps.go .fall { animation: ps-fall .6s 2.42s forwards; }
@keyframes ps-op { to { opacity: 1; } }
@keyframes ps-rise { to { transform: translateY(0); } }
@keyframes ps-pop { to { transform: scale(1); } }
@keyframes ps-blue { to { color: ${BLUE}; } }
@keyframes ps-spin {
  0% { transform: rotate(18deg) scale(.4); animation-timing-function: cubic-bezier(.45,1.45,.8,1); }
  55% { transform: rotate(-6deg) scale(1); animation-timing-function: ease-in-out; }
  100% { transform: rotate(0) scale(1); } }
/* "fails": drops 26px with a 14° tilt, bounces to 17px / 7°, settles at 22px / 10° */
@keyframes ps-fall {
  0% { transform: translateY(0) rotate(0); animation-timing-function: ease-in; }
  50% { transform: translateY(26px) rotate(14deg); animation-timing-function: ease-out; }
  75% { transform: translateY(17px) rotate(7deg); animation-timing-function: ease-in-out; }
  100% { transform: translateY(22px) rotate(10deg); } }

@media (prefers-reduced-motion: reduce) {
  .tb-ps .eb, .tb-ps .w, .tb-ps .chip, .tb-ps .icw { opacity: 1 !important; transform: none !important; animation: none !important; }
  .tb-ps .w.blue { color: ${BLUE}; }
  .tb-ps .fall { animation: none !important; transform: translateY(22px) rotate(10deg); }
}
`;
