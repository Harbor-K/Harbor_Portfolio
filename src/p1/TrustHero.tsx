import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Trust Bank hero with a full-screen intro (Harbor's request, this site only).
 * The page opens with the hero video filling the whole screen (the site header is hidden meanwhile, TrustBank.tsx).
 * After 2.5 seconds (HOLD_MS) it moves on its own — no scrolling needed — quickly back into its place under the
 * headline (2:1, 20px corners) over ANIM_MS, easing in and out so the move starts and lands softly.
 * Scrolling, swiping or pressing a key during the hold starts the move straight away. The page can't scroll until the
 * video has settled, so nothing slides underneath it.
 * During the intro the video's controls (progress bar, play/pause, time, sound) stay hidden; afterwards they show only
 * when the pointer is over the video (or a control has keyboard focus). The normal line cursor is used (index.tsx).
 * When the intro ends it sends a 'caseintro' window event (detail: false) so the header can appear.
 * How: the video box is absolutely positioned inside its 2:1 slot; each frame its left/top/width/height are blended
 * between the full screen and the slot. object-fit: cover keeps the video undistorted at every size.
 * Reduced motion: no intro, the video simply sits in its place.
 * Copy, colours and the sound controls are the same as Portfolio_1's Trust Bank hero.
 */

const A = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/trust-bank/';
const HERO = {
  logo: A + 'logo.svg',
  video: A + 'hero-sfx-v2.mp4',
  poster: A + 'hero-sfx-v2-poster.jpg',
};
const INK = '#000d10';
const HELV = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const RADIUS = 20;
const HOLD_MS = 2500;
const ANIM_MS = 1000;

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
// quart in-out: quick through the middle, soft at both ends
const ease = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);

const fmt = (t: number) => {
  if (!isFinite(t)) return '0:00';
  const m = Math.floor(t / 60);
  const sec = Math.floor(t % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

/**
 * Hero motion with its sound effects (fills its box). Always starts muted; the speaker button turns sound on at 50%.
 * Controls (play/pause, progress bar, time, volume) are hidden while `quiet` (the full-screen intro); after that they
 * show only on hover or keyboard focus.
 */
function SoundMotion({ src, poster, label, quiet }: { src: string; poster: string; label: string; quiet: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const show = !quiet && (hover || focus);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.volume = 0.5;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  const togglePlay = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };
  const toggleMute = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted && v.volume === 0) v.volume = 0.5;
    setMuted(v.muted);
    setVolume(v.volume);
  };
  const changeVolume = (val: number) => {
    const v = ref.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(v.muted);
  };
  const seek = (val: number) => {
    const v = ref.current;
    if (!v || !duration) return;
    v.currentTime = val;
    setTime(val);
  };

  const shownVolume = muted ? 0 : volume;
  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setFocus(true)}
      onBlurCapture={() => setFocus(false)}
    >
      <video
        ref={ref}
        className="block w-full h-full object-cover cursor-pointer"
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="auto"
        aria-label={label}
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      <div
        className={`absolute inset-x-0 bottom-0 px-5 pb-4 pt-12 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%)', fontFamily: HELV }}
        aria-hidden={quiet || undefined}
      >
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={time}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Video progress"
          tabIndex={quiet ? -1 : undefined}
          className="tb-range block w-full"
          style={{ ['--fill' as string]: `${pct}%` } as React.CSSProperties}
        />
        <div className="mt-3 flex items-center gap-4 text-white">
          <button type="button" onClick={togglePlay} tabIndex={quiet ? -1 : undefined} aria-label={playing ? 'Pause' : 'Play'} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15">
            {playing ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" />
              </svg>
            )}
          </button>
          <span className="text-[16px] tabular-nums">
            {fmt(time)} / {fmt(duration)}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={toggleMute} tabIndex={quiet ? -1 : undefined} aria-label={muted ? 'Turn sound on' : 'Mute'} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" />
                {shownVolume === 0 ? (
                  <>
                    <line x1="22" y1="9" x2="16" y2="15" />
                    <line x1="16" y1="9" x2="22" y2="15" />
                  </>
                ) : (
                  <>
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    {shownVolume > 0.5 && <path d="M19 5a10 10 0 0 1 0 14" />}
                  </>
                )}
              </svg>
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={shownVolume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              aria-label="Volume"
              tabIndex={quiet ? -1 : undefined}
              className="tb-range w-[100px]"
              style={{ ['--fill' as string]: `${shownVolume * 100}%` } as React.CSSProperties}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const slot = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [intro] = useState(() => !reducedMotion());
  const [running, setRunning] = useState(intro); // true until the video has settled in its place

  // set before the first paint, so the page opens on the full-screen video
  useLayoutEffect(() => {
    if (!intro) return;
    const s = slot.current;
    const b = box.current;
    if (!s || !b) return;
    const root = document.documentElement;
    const keep = { overflow: root.style.overflow, gutter: root.style.getPropertyValue('scrollbar-gutter') };
    root.style.overflow = 'hidden'; // no scrolling until the video has settled
    root.style.setProperty('scrollbar-gutter', 'stable');
    window.scrollTo(0, 0);

    let animStart = performance.now() + HOLD_MS;
    let raf = 0;
    let finished = false;
    const apply = (e: number) => {
      const vh = window.innerHeight;
      const vw = document.documentElement.clientWidth;
      const r = s.getBoundingClientRect(); // the video's own place
      b.style.left = `${(-r.left * (1 - e)).toFixed(2)}px`;
      b.style.top = `${(-r.top * (1 - e)).toFixed(2)}px`;
      b.style.width = `${(vw + (r.width - vw) * e).toFixed(2)}px`;
      b.style.height = `${(vh + (r.height - vh) * e).toFixed(2)}px`;
      b.style.borderRadius = `${(RADIUS * e).toFixed(2)}px`;
    };
    const skip = () => {
      const now = performance.now();
      if (now < animStart) animStart = now;
    };
    const unlock = () => {
      root.style.overflow = keep.overflow;
      if (keep.gutter) root.style.setProperty('scrollbar-gutter', keep.gutter);
      else root.style.removeProperty('scrollbar-gutter');
      removeEventListener('wheel', skip);
      removeEventListener('touchmove', skip);
      removeEventListener('keydown', skip);
    };
    const finish = () => {
      finished = true;
      Object.assign(b.style, { left: '0px', top: '0px', width: '100%', height: '100%', borderRadius: `${RADIUS}px` });
      unlock();
      setRunning(false);
      window.dispatchEvent(new CustomEvent('caseintro', { detail: false }));
    };
    const frame = (now: number) => {
      const p = clamp((now - animStart) / ANIM_MS);
      apply(ease(p));
      if (p >= 1) finish();
      else raf = requestAnimationFrame(frame);
    };
    apply(0);
    raf = requestAnimationFrame(frame);
    addEventListener('wheel', skip, { passive: true });
    addEventListener('touchmove', skip, { passive: true });
    addEventListener('keydown', skip);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (!finished) unlock();
    };
  }, [intro]);

  return (
    <div className="relative" data-chapter="Trust Bank">
      <section className="bg-white pt-28 md:pt-[120px] pb-20">
        <div className="relative mx-auto w-full max-w-[1440px] px-6 min-[1488px]:px-0">
          <img src={HERO.logo} alt="trust" className="h-[29px] w-auto" />
          <h1
            className="mt-10 md:mt-[38px] text-[40px] md:text-[63px] leading-none tracking-[-0.02em] font-bold max-w-[720px]"
            style={{ fontFamily: HELV, color: INK }}
          >
            Turning hidden rewards
            <br />
            into everyday loyalty
          </h1>
          <p className="mt-8 md:mt-[31px] max-w-[760px] text-[17px] md:text-[18px] leading-[29px]" style={{ fontFamily: HELV, color: INK }}>
            Helping people find and use their rewards in a digital bank
            <br />
            Trust Bank (Singapore) · UX case study
          </p>

          {/* the video's own place (2:1); the box inside starts full-screen and moves into it on its own */}
          <div ref={slot} data-no-reveal className="relative mt-10 md:mt-[30px]" style={{ aspectRatio: '2 / 1' }}>
            <div
              ref={box}
              className="absolute overflow-hidden"
              style={{ left: 0, top: 0, width: '100%', height: '100%', borderRadius: RADIUS, background: '#049ddc', zIndex: 40 }}
            >
              <SoundMotion
                src={HERO.video}
                poster={HERO.poster}
                quiet={running}
                label="Trust Bank rewards: linking FairPrice in one tap and watching every payment fill the Linkpoints bar"
              />
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8" style={{ fontFamily: HELV, color: INK }}>
            <div>
              <p className="text-[17px] leading-[1.4]">TIMELINE</p>
              <p className="mt-2 text-[18px] leading-[29px]">8 weeks June – August 2026</p>
            </div>
            <div>
              <p className="text-[17px] leading-[1.4]">TEAM &amp; ROLE</p>
              <p className="mt-2 text-[18px] leading-[29px]">
                2 designers
                <br />
                I led: Planning, UI Design, Usability test
                <br />
                Together: Research synthesis ideation, Testing
              </p>
            </div>
            <div>
              <p className="text-[17px] leading-[1.4]">INDUSTRY</p>
              <p className="mt-2 text-[18px] leading-[29px]">Fintech, Digital banking, Mobile app</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
