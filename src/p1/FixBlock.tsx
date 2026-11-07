import React, { useEffect, useRef, useState } from 'react';

// Copied from Portfolio_1 (components/case/FixBlock.tsx). Same tokens and body text style as p1/TrustBankBody.tsx
const INK = '#000d10';
const HELV = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const RING = '#2e8cbf';

function Body({ children, className = '', color = INK }: { children: React.ReactNode; className?: string; color?: string }) {
  return (
    <p className={`text-[17px] md:text-[18px] leading-[29px] ${className}`} style={{ fontFamily: HELV, color }}>
      {children}
    </p>
  );
}

/**
 * "What changed" close-ups on the To-be phone (Harbor's Figma frames "To-be · changed part").
 * Boxes are fractions of the whole phone export (bezel included, 281 x 576 in Figma).
 * Keyed by the To-be image file name, so TrustBankBody.tsx needs no extra props.
 */
type Spot = { x: number; y: number; w: number; h: number; scale: number; radius: string };
const SPOTS: Record<string, Spot[]> = {
  // Fix 1: the Linkpoints journey card (rewards on the bar + next reward)
  'fix1-tobe': [{ x: 0.0857, y: 0.2826, w: 0.825, h: 0.2944, scale: 1.4, radius: '6%' }],
  // Fix 3 + 4: only the three See All buttons
  'fix34-tobe': [
    { x: 0.697, y: 0.2693, w: 0.1704, h: 0.0475, scale: 2.2, radius: '999px' },
    { x: 0.7313, y: 0.5058, w: 0.1704, h: 0.0475, scale: 2.2, radius: '999px' },
    { x: 0.7313, y: 0.6863, w: 0.1704, h: 0.0475, scale: 2.2, radius: '999px' },
  ],
};
const spotsFor = (src: string) => {
  const key = Object.keys(SPOTS).find((k) => src.includes(k));
  return key ? SPOTS[key] : [];
};

/**
 * One fix, with the Corgi interaction: the phone panel stays pinned on the left while the text on the
 * right scrolls past it in two steps. When the second step reaches the middle of the screen, the phone
 * card flips over in 3D (As-is on the front, To-be on the back) and the panel colour changes with it;
 * scrolling back up flips it back. The As-is / To-be pill follows.
 * After the flip, the To-be screen shows plain for a moment, then the rest of the screen dims and only the
 * changed part pops out bigger (blue ring + shadow), like Harbor's Figma "To-be · changed part" frames.
 * Small screens: no pinning, both phones side by side under the text.
 */
export function FixBlock({
  kicker,
  title,
  body,
  stat,
  statLabel,
  statNote,
  before,
  after,
  alt,
}: {
  kicker: string;
  title: React.ReactNode;
  body: string;
  stat: string;
  statLabel: string;
  statNote: string;
  before: string;
  after: string;
  alt: string;
}) {
  const step2 = useRef<HTMLDivElement>(null);
  const [toBe, setToBe] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = step2.current;
      if (!el) return;
      // flip once the second text step's top passes the middle of the screen
      setToBe(el.getBoundingClientRect().top < window.innerHeight * 0.55);
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

  // To-be: flip (0.9s), hold the plain screen, then pop the changed part. Back to As-is: drop it at once.
  useEffect(() => {
    if (!toBe) {
      setZoom(false);
      return;
    }
    const t = window.setTimeout(() => setZoom(true), reduce ? 0 : 1500);
    return () => window.clearTimeout(t);
  }, [toBe, reduce]);

  const PANEL = 'clamp(520px, 76vh, 680px)';
  const flipT = reduce ? 'none' : 'transform 0.9s cubic-bezier(0.65, 0, 0.35, 1)';
  const spots = spotsFor(after);

  const textTop = (
    <div>
      <p className="text-[17px] leading-[1.4]" style={{ color: INK }}>
        {kicker}
      </p>
      <p className="mt-[6px] text-[23px] leading-[1.2] font-bold text-[#333]">{title}</p>
      <Body className="mt-6" color="#333">
        {body}
      </Body>
    </div>
  );
  const textBottom = (
    <div>
      <p className="text-[52px] leading-[1.1] font-bold text-[#333]">{stat}</p>
      <p className="mt-[16px] text-[18px] leading-[29px] text-[#333]">{statLabel}</p>
      <p className="mt-1 text-[17px] leading-[24px] text-[#8e8e95]">{statNote}</p>
    </div>
  );
  const pill = (
    <div className="inline-flex rounded-full bg-white/80 p-1 text-[16px] font-medium backdrop-blur" aria-hidden="true">
      {['As-is', 'To-be'].map((l, i) => {
        const on = (i === 1) === toBe;
        return (
          <span
            key={l}
            className="rounded-full px-4 py-[6px] transition-colors duration-500"
            style={{ background: on ? INK : 'transparent', color: on ? '#fff' : '#8e8e95' }}
          >
            {l}
          </span>
        );
      })}
    </div>
  );
  const face = (src: string, label: string, back: boolean) => (
    <img
      src={src}
      alt={`${alt} — ${label}`}
      className="absolute inset-0 h-full w-full object-contain"
      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: back ? 'rotateY(180deg)' : undefined }}
      loading="lazy"
      decoding="async"
    />
  );

  // dim + close-ups, on the To-be side of the card (screen area of the phone export: 14px inset in 281 x 576)
  const closeUps = spots.length > 0 && (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      style={{ transform: 'rotateY(180deg) translateZ(2px)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
    >
      <div
        className="absolute"
        style={{
          left: '4.98%',
          top: '2.43%',
          width: '89.68%',
          height: '94.97%',
          borderRadius: '13% / 6%',
          background: 'rgba(0,0,0,0.38)',
          opacity: zoom ? 1 : 0,
          transition: reduce ? 'none' : 'opacity 0.5s ease',
        }}
      />
      {spots.map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${s.x * 100}%`,
            top: `${s.y * 100}%`,
            width: `${s.w * 100}%`,
            height: `${s.h * 100}%`,
            borderRadius: s.radius,
            backgroundImage: `url(${after})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${100 / s.w}% ${100 / s.h}%`,
            backgroundPosition: `${(s.x / (1 - s.w)) * 100}% ${(s.y / (1 - s.h)) * 100}%`,
            boxShadow: `0 0 0 ${(3 / s.scale).toFixed(2)}px ${RING}, 0 ${(14 / s.scale).toFixed(1)}px ${(32 / s.scale).toFixed(1)}px rgba(0,0,0,0.28)`,
            opacity: zoom ? 1 : 0,
            transform: `scale(${zoom ? s.scale : 1})`,
            transition: reduce
              ? 'none'
              : `opacity 0.35s ease ${0.2 + i * 0.15}s, transform 0.7s cubic-bezier(0.34, 1.4, 0.64, 1) ${0.2 + i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );

  return (
    <div style={{ fontFamily: HELV }}>
      {/* md and up: pinned flip panel on the left, text scrolling past on the right */}
      <div className="hidden md:grid md:mt-[40px] max-w-[1255px] grid-cols-[minmax(0,640px)_minmax(0,1fr)] gap-10 lg:gap-[100px]">
        <div className="relative">
          <div className="sticky" style={{ top: `calc(50vh - ${PANEL} / 2)` }}>
            <div
              className="relative flex items-end justify-center overflow-hidden rounded-[20px] pb-[30px] transition-colors duration-700"
              style={{ height: PANEL, background: toBe ? '#e3f3fa' : '#f2f2f4', perspective: '1600px' }}
            >
              <div className="absolute left-5 top-5 z-10">{pill}</div>
              <div
                className="relative h-[calc(100%-120px)]"
                style={{ aspectRatio: '600 / 1230', transformStyle: 'preserve-3d', transform: `rotateY(${toBe ? 180 : 0}deg)`, transition: flipT }}
              >
                {face(before, 'as-is', false)}
                {face(after, 'to-be', true)}
                {closeUps}
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex flex-col justify-center" style={{ minHeight: '100vh' }}>
            {textTop}
          </div>
          <div ref={step2} className="flex flex-col justify-center" style={{ minHeight: '100vh' }}>
            {textBottom}
          </div>
        </div>
      </div>

      {/* small screens: text, then both phones */}
      <div className="md:hidden">
        {textTop}
        <div className="mt-8 grid grid-cols-2 gap-4">
          {[
            ['As-is', before],
            ['To-be', after],
          ].map(([l, src]) => (
            <figure key={l} className="rounded-[16px] bg-[#f2f2f4] px-3 pt-4">
              <figcaption className="text-center text-[16px] font-medium text-[#333]">{l}</figcaption>
              <img src={src} alt={`${alt} — ${l.toLowerCase()}`} className="mt-3 w-full" loading="lazy" decoding="async" />
            </figure>
          ))}
        </div>
        <div className="mt-8">{textBottom}</div>
      </div>
    </div>
  );
}
