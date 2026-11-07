import React, { useEffect, useRef, useState } from 'react';

/**
 * Copied from Portfolio_1 (components/case/TestTop.tsx).
 * Test section, top part — from Figma "Section / Test · web version (top)" (node 1156:423).
 * Body text, the three blue key numbers, then the usability-test recording (looping, muted) beside the task sheet.
 * The blue numbers count up as you scroll. Reduced motion = final numbers.
 * Privacy: the recording keeps Harbor's masks (name, cookie bar, participant blur, "Researcher" label).
 */

const L = 'https://raw.githubusercontent.com/Harbor-K/landing_page/main/trust-bank/assets/';
const UT_VIDEO = L + 'ut-session.mp4';
const UT_POSTER = L + 'ut-video-poster.jpg';
const UT_SHEET = L + 'ut-sheet.png';
// all usability-test results (Google Sheets, view-only link)
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1G1L7nXgh53dFV-mELPEmyCd28lPneIIXBH229eu950Q/edit?usp=sharing';

const INK = '#000d10';
const BLUE = '#009ddc';
const HELV = '"Helvetica Neue", Helvetica, Arial, sans-serif';

/** 0 → 1 as the element scrolls from the bottom of the screen up to its middle */
function useCountProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setP(1);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top;
      const t = Math.min(1, Math.max(0, (vh - top) / (vh * 0.5)));
      setP(1 - (1 - t) * (1 - t)); // ease out
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return [ref, p] as const;
}

// positions of the masks on the 929 × 457 recording frame (Figma), as percentages
const pct = (x: number, y: number, w: number, h: number) => ({
  left: `${(x / 929) * 100}%`,
  top: `${(y / 457) * 100}%`,
  width: `${(w / 929) * 100}%`,
  height: `${(h / 457) * 100}%`,
});

export function TestTop() {
  const [statsRef, p] = useCountProgress<HTMLDivElement>();
  const vidRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    vidRef.current?.play().catch(() => {});
  }, []);

  const stat = (target: number, suffix: string) => (
    <p className="text-[52px] leading-[1.1] font-bold tabular-nums" style={{ color: BLUE }}>
      {Math.round(target * p)}
      {suffix}
    </p>
  );

  return (
    <div style={{ fontFamily: HELV }}>
      <p className="mt-4 max-w-[700px] text-[17px] md:text-[18px] leading-[29px]" style={{ color: INK }}>
        Our assumption If Linkpoints are easier to reach, users will use Trust Bank more often. Validated in testing Easier access worked: 77% of tasks were
        done without help, and every user said they’d keep using it. [{' '}
        <a
          href={SHEET_URL}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-[#000d10]/30 underline-offset-[3px] transition-colors duration-150 hover:decoration-[#000d10]"
        >
          one shared sheet
        </a>{' '}
        ]
      </p>

      {/* key numbers: count up on scroll */}
      <div ref={statsRef} className="mt-[30px] grid grid-cols-1 sm:grid-cols-3 gap-8 px-[30px]">
        <div>
          {stat(77, '%')}
          <p className="mt-5 text-[17px] font-bold" style={{ color: INK }}>
            tasks done without help
          </p>
        </div>
        <div>
          {stat(85, '')}
          <p className="mt-5 text-[17px] font-bold" style={{ color: INK }}>
            ease-of-use score (SUS)
          </p>
          <p className="text-[17px] text-[#767676]">Out of 100 · A+ grade</p>
          <div className="relative mt-5 h-[6px] max-w-[380px] rounded-[3px] bg-[#e6eef1]">
            <div className="absolute inset-y-0 left-0 rounded-[3px]" style={{ width: `${85 * p}%`, backgroundColor: BLUE }} />
            <div className="absolute -top-[5px] h-4 w-[2px]" style={{ left: '68%', backgroundColor: INK }} />
          </div>
          <div className="relative mt-2 h-5 max-w-[380px] text-[16px] leading-5 text-[#767676]">
            <span className="absolute left-0">0</span>
            <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: '68%' }}>
              68 = average
            </span>
            <span className="absolute right-0">100</span>
          </div>
        </div>
        <div>
          {stat(100, '%')}
          <p className="mt-5 text-[17px] font-bold" style={{ color: INK }}>
            said they’d keep using it
          </p>
        </div>
      </div>

      {/* recording (looping) + task sheet */}
      <div className="mt-[30px] grid max-w-[1328px] grid-cols-1 lg:grid-cols-[929fr_369fr] gap-[30px] items-start">
        <div className="relative overflow-hidden rounded-[20px] bg-[#111]" style={{ aspectRatio: '929 / 457' }}>
          {UT_VIDEO ? (
            <video
              ref={vidRef}
              className="absolute inset-0 h-full w-full object-cover"
              src={UT_VIDEO}
              poster={UT_POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label="Remote usability test session on the prototype (participant masked)"
            />
          ) : (
            <img
              className="absolute inset-0 h-full w-full object-cover"
              src={UT_POSTER}
              alt="Remote usability test session on the prototype (participant masked)"
              loading="lazy"
            />
          )}
          {/* privacy masks */}
          <div className="absolute rounded-[4px] bg-[#0f0f0f]" style={pct(63, 5, 86, 22)} aria-hidden />
          <div className="absolute rounded-[11px] bg-[#1f1f1f]" style={pct(764, 6, 116, 26)} aria-hidden />
          <div className="absolute rounded-[10px] bg-[#1a1a1a]" style={pct(0, 411, 639, 43)} aria-hidden />
          <div
            className="absolute rounded-[8px] bg-[rgba(153,153,153,0.15)] backdrop-blur-[30px]"
            style={pct(639, 264, 142, 183)}
            aria-hidden
          />
          <span className="absolute text-[16px] leading-[25px] text-white" style={{ left: `${(647 / 929) * 100}%`, top: `${(232 / 457) * 100}%` }}>
            Researcher
          </span>
        </div>
        <img
          src={UT_SHEET}
          alt="Task success by participant: T2 LinkPoints only 2 of 6 without help, T5 Rewards page 3 of 6; overall 23/30 = 77%"
          loading="lazy"
          className="block w-full max-w-[369px]"
        />
      </div>
    </div>
  );
}
