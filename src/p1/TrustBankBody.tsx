import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AffinityScroll } from './AffinityScroll';
import { TestTop } from './TestTop';
import { FixBlock } from './FixBlock';

/**
 * Trust Bank case-study BODY (hero → reflection), copied from Portfolio_1 (components/case/TrustBankCase.tsx):
 * same copy, colours (ink #000d10, Trust blue #009ddc, sky #ebf7fc, reflection navy #002742) and type
 * (Helvetica Neue, bold headings). Portfolio_1's own header (× · Next) and next-project panel are NOT included —
 * TrustBank.tsx wraps this body with this site's header, next case study card and footer.
 * Also included from Portfolio_1: the soft per-block scroll reveal (CaseReveal) and the hover magnifier on the
 * thematic-analysis board and DVF map (ImageLightbox).
 * Each section carries data-chapter so this site's header can show the current chapter.
 */

const A = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/trust-bank/';
const L = 'https://raw.githubusercontent.com/Harbor-K/landing_page/main/trust-bank/assets/';
const PROTOTYPE_URL =
  'https://www.figma.com/proto/8cWe2vvqXJcQ3vWBtNqxFe/%F0%9F%94%B5-Trust-Bank_Design?node-id=627-8762&p=f&viewport=-335%2C-955%2C0.14&t=OAe3UV92aMoOUQHu-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=627%3A8762&show-proto-sidebar=1&page-id=200%3A3608';
const IMG = {
  logo: A + 'logo.svg',
  heroVideo: A + 'hero-sfx-v2.mp4',
  heroPoster: A + 'hero-sfx-v2-poster.jpg',
  journeyVideo: A + 'journey-motion.mp4',
  journeyPoster: A + 'journey-motion-poster.jpg',
  processVideo: A + 'process-motion.mp4',
  processPoster: A + 'process-motion-poster.jpg',
  article: A + 'article.png',
  interview: A + 'interview.png',
  table: A + 'table.png',
  thematic: A + 'thematic.png',
  definePhoto: A + 'define-photo.jpg',
  hmwIcon1: A + 'hmw-icon-1.svg',
  hmwIcon2: A + 'hmw-icon-2.svg',
  hmwIcon3: A + 'hmw-icon-3.svg',
  dvf: A + 'dvf.png',
  sketch1a: A + 'sketch-1a.png',
  sketch1b: A + 'sketch-1b.png',
  sketch2a: A + 'sketch-2a.png?v=2',
  sketch2b: A + 'sketch-2b.png?v=2',
  sketch3a: A + 'sketch-3a.png?v=2',
  sketch3b: A + 'sketch-3b.png?v=2',
  workshop1: A + 'workshop-1.jpg',
  workshop2: A + 'workshop-2.jpg?v=2',
  deliver1: A + 'deliver-1.mp4',
  deliver1Poster: A + 'deliver-1-poster.jpg',
  deliver2: L + 'deliver-2-rewards.mp4',
  deliver2Poster: L + 'deliver-2-rewards-poster.jpg',
  deliver3: A + 'deliver-3.mp4',
  deliver3Poster: A + 'deliver-3-poster.jpg',
  fix1Before: L + 'fix1-asis.webp',
  fix1After: L + 'fix1-tobe.webp',
  fix34Before: L + 'fix34-asis.webp',
  fix34After: L + 'fix34-tobe.webp',
  reflection: A + 'takeaway.jpg',
};

const INK = '#000d10';
const BLUE = '#009ddc';
const SKY = '#ebf7fc';
const ASH = '#8e8e95';
const HELV = '"Helvetica Neue", Helvetica, Arial, sans-serif';

/* ---------- small building blocks ---------- */

function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`relative mx-auto w-full max-w-[1440px] px-6 min-[1488px]:px-0 ${className}`}>{children}</div>;
}

function Eyebrow({ label, light = false }: { label: string; light?: boolean }) {
  const c = light ? '#ffffff' : ASH;
  return (
    <div className="flex items-center gap-[10px]" style={{ fontFamily: HELV }}>
      <span className="block w-4 h-4" style={{ backgroundColor: c }} />
      <span className="text-[17px] leading-[1.4]" style={{ color: c }}>
        {label}
      </span>
    </div>
  );
}

function H2({ children, color = INK, className = '' }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <h2 className={`text-[30px] md:text-[37px] leading-[1.1] tracking-[-0.01em] font-bold ${className}`} style={{ fontFamily: HELV, color }}>
      {children}
    </h2>
  );
}

function Body({ children, className = '', color = INK }: { children: React.ReactNode; className?: string; color?: string }) {
  return (
    <p className={`text-[17px] md:text-[18px] leading-[29px] ${className}`} style={{ fontFamily: HELV, color }}>
      {children}
    </p>
  );
}

function Img({ src, alt, className = '', style, zoom = false }: { src: string; alt: string; className?: string; style?: React.CSSProperties; zoom?: boolean }) {
  return <img src={src} alt={alt} loading="lazy" data-zoom={zoom ? 'true' : undefined} className={`block w-full h-auto ${className}`} style={style} />;
}

/** silent looping motion piece (converted from Harbor's GIFs) */
function Motion({ src, poster, ratio, label, className = '', bg }: { src: string; poster: string; ratio: string; label: string; className?: string; bg: string }) {
  return (
    <div className={`overflow-hidden ${className}`} style={{ aspectRatio: ratio, background: bg }}>
      <video className="block w-full h-full object-cover" src={src} poster={poster} autoPlay muted loop playsInline preload="auto" aria-label={label} />
    </div>
  );
}

const fmt = (t: number) => {
  if (!isFinite(t)) return '0:00';
  const m = Math.floor(t / 60);
  const sec = Math.floor(t % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

/**
 * Hero motion with its sound effects. Always starts muted; the speaker button turns sound on at 50%.
 * Controls (play/pause, progress bar, volume) show for the first 3 seconds, then hide; hovering the video brings them back.
 */
function SoundMotion({ src, poster, ratio, label, className = '', bg }: { src: string; poster: string; ratio: string; label: string; className?: string; bg: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [intro, setIntro] = useState(true);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const show = intro || hover || focus;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.volume = 0.5;
    v.muted = true;
    v.play().catch(() => {});
    const t = window.setTimeout(() => setIntro(false), 3000);
    return () => window.clearTimeout(t);
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
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: ratio, background: bg }}
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
      >
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={time}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Video progress"
          className="tb-range block w-full"
          style={{ ['--fill' as string]: `${pct}%` } as React.CSSProperties}
        />
        <div className="mt-3 flex items-center gap-4 text-white">
          <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15">
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
            <button type="button" onClick={toggleMute} aria-label={muted ? 'Turn sound on' : 'Mute'} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15">
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
              className="tb-range w-[100px]"
              style={{ ['--fill' as string]: `${shownVolume * 100}%` } as React.CSSProperties}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Board exports carry their drop shadow, so they are a little wider than the 1440 column. */
function ShadowedImg({ src, alt, natural, column = 1440, zoom = false }: { src: string; alt: string; natural: number; column?: number; zoom?: boolean }) {
  const over = (natural - column) / column;
  return (
    <div style={{ marginLeft: `${(-over / 2) * 100}%`, marginRight: `${(-over / 2) * 100}%` }}>
      <Img src={src} alt={alt} zoom={zoom} />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1" style={{ fontFamily: HELV }}>
      <p className="text-[44px] md:text-[52px] leading-[63px] tracking-[0.01em]" style={{ color: BLUE }}>
        {value}
      </p>
      <p className="text-[16px] leading-[1.43] text-[#767676]">{label}</p>
    </div>
  );
}

/* ---------- sections ---------- */

function HeroSection() {
  return (
    <section className="bg-white pt-28 md:pt-[120px] pb-20" data-chapter="Trust Bank">
      <Container>
        <img src={IMG.logo} alt="trust" className="h-[29px] w-auto" />
        <h1
          className="mt-10 md:mt-[38px] text-[40px] md:text-[63px] leading-none tracking-[-0.02em] font-bold max-w-[720px]"
          style={{ fontFamily: HELV, color: INK }}
        >
          Turning hidden rewards
          <br />
          into everyday loyalty
        </h1>
        <Body className="mt-8 md:mt-[31px] max-w-[760px]">
          Helping people find and use their rewards in a digital bank
          <br />
          Trust Bank (Singapore) · UX case study
        </Body>

        <SoundMotion
          src={IMG.heroVideo}
          poster={IMG.heroPoster}
          ratio="2 / 1"
          bg="#049ddc"
          className="mt-10 md:mt-[30px] rounded-[20px]"
          label="Trust Bank rewards: linking FairPrice in one tap and watching every payment fill the Linkpoints bar"
        />

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
      </Container>
    </section>
  );
}

function OverviewRow({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-[370px_1fr] gap-4 md:gap-0 ${className}`}>
      <p className="text-[23px] leading-[1.2] tracking-[-0.01em] font-bold" style={{ fontFamily: HELV, color: INK }}>
        {label}
      </p>
      <div>{children}</div>
    </div>
  );
}

function OverviewSection() {
  return (
    <section className="bg-white py-[120px]" data-chapter="Overview">
      <Container>
        <Eyebrow label="OVERVIEW" />
        <OverviewRow label="The problem" className="mt-4">
          <Body className="max-w-[944px]">
            Trust Bank works with FairPrice, a supermarket chain. Over 1 million people joined Trust Bank, 70% through a friend’s invite bonus, but only 17%
            made it their main bank. So we interviewed users to find out why. Of the problems we found, we focused on rewards: FairPrice rewards are Trust
            Bank’s biggest strength, but users weren’t using them.
          </Body>
        </OverviewRow>

        <OverviewRow label="Solution" className="mt-[60px]">
          <Body className="max-w-[928px]">
            If users can find their rewards and know how to use them, they have a reason to come back. That builds loyalty. So we set two goals. Easy to find:
            show each user the rewards that fit them. Easy to use: show the rules and the next step.
          </Body>
        </OverviewRow>

        <OverviewRow label="Impact" className="mt-[60px]">
          <div className="grid grid-cols-1 sm:grid-cols-[355px_356px_1fr]">
            <div className="py-2 sm:pl-7">
              <Stat value="23/30" label="tasks done without help" />
            </div>
            <div className="py-2 sm:pl-7 sm:border-l border-[rgba(0,13,16,0.12)]">
              <Stat value="85" label="ease-of-use score (A+)" />
            </div>
            <div className="py-2 sm:pl-7 sm:border-l border-[rgba(0,13,16,0.12)]">
              <Stat value="6/6" label="said they’d keep using it" />
            </div>
          </div>
        </OverviewRow>
      </Container>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="py-[120px]" style={{ backgroundColor: SKY }} data-chapter="Process">
      <Container>
        <Eyebrow label="PROCESS" />
        <H2 className="mt-4">From problem to solution</H2>
        <Motion
          src={IMG.processVideo}
          poster={IMG.processPoster}
          ratio="1440 / 824"
          bg="#ecf7fd"
          className="mt-[30px] rounded-[20px]"
          label="Double diamond: Discover, Define, Develop, Deliver with the methods used in each step"
        />
      </Container>
    </section>
  );
}

function TwoCol({ left, right, className = '', align = 'start' }: { left: React.ReactNode; right: React.ReactNode; className?: string; align?: 'start' | 'center' }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 ${align === 'center' ? 'md:items-center' : 'items-start'} ${className}`}>
      <div className="min-w-0">{left}</div>
      <div className="min-w-0">{right}</div>
    </div>
  );
}

function DiscoverSection() {
  return (
    <section className="bg-white pt-[120px] pb-[120px]" data-chapter="Discover">
      <Container>
        <TwoCol
          left={
            <>
              <Eyebrow label="DISCOVER" />
              <H2 className="mt-4">
                What reports said
                <br />
                Only 17% use it as their main bank
              </H2>
              <Body className="mt-4">
                Reports showed how few users make it their main bank, but not why.
                <br />
                So we wanted to know, why don’t users make Trust Bank their main bank?
              </Body>
            </>
          }
          right={
            <div className="md:pt-[40px]">
              <Img src={IMG.article} alt="News article: only 17% of Trust Bank users use it as their main bank" className="rounded-[20px]" />
              <p className="mt-[10px] text-center text-[16px] text-[#8e8e95]" style={{ fontFamily: HELV }}>
                Source: The Asian Banker (May 2026)
              </p>
            </div>
          }
        />

        <TwoCol
          className="mt-[160px]"
          left={
            <>
              <H2>
                What users said
                <br />
                Rewards got them in, but not back
              </H2>
              <Body className="mt-4">
                We interviewed 3 users. Some reasons were out of our hands. For example, their salary went to another bank. But one problem was about Trust
                Bank’s biggest strength: rewards. All 3 joined for an invite bonus or promo. But the rewards didn’t bring them back.
              </Body>
              <Img src={IMG.table} alt="Interviewees: 3 participants, their main bank and how they used rewards" className="mt-[30px]" />
            </>
          }
          right={
            <div className="md:pt-[240px] md:pl-[10px]">
              <Img src={IMG.interview} alt="Interview session recording, 1 of 3" className="rounded-[20px]" />
            </div>
          }
        />

        <div className="mt-[120px]">
          <Img src={IMG.thematic} alt="Thematic analysis of 3 interviews: 5 themes, 19 codes and quotes" className="rounded-[20px]" zoom />
          <p className="mt-5 text-center text-[16px] leading-[1.4] text-[#8e8e95]" style={{ fontFamily: HELV }}>
            Thematic analysis · 3 interviews
          </p>
        </div>

        <TwoCol
          className="mt-[70px]"
          left={
            <H2>
              What the data said
              <br />
              Points earned, but not used
            </H2>
          }
          right={
            <div>
              <Body>
                Our 3 users barely used Trust Bank’s rewards. So we went back to the data. How many points do Trust Bank users actually earn?
              </Body>
              <Body className="mt-[20px]">
                Trust Bank already gives out over 9 billion points, but the users we spoke to didn’t see them as a reason to come back. Its biggest strength was
                going to waste. Was our guess right? We went back to our interview notes to check.
              </Body>
            </div>
          }
        />
      </Container>
    </section>
  );
}

const HMW = [
  { n: 'HMW 1', q: 'Show the right reward just before users buy?', bg: '#ffe07a', icon: IMG.hmwIcon1 },
  { n: 'HMW 2', q: 'Show the rewards users want at a glance?', bg: '#d4b0f8', icon: IMG.hmwIcon2 },
  { n: 'HMW 3', q: 'Make collecting points feel worth it?', bg: '#a8e3b4', icon: IMG.hmwIcon3 },
];

/** reveal once when scrolled into view (the "pop, pop, pop" sticky / card entrances) */
function useShownOnce<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, shown] as const;
}

/** Figma "HMW · sticky cluster": 3 stickies 300×300, 40 apart; on scroll they pop in one, two, three */
function HmwStickies() {
  const [ref, shown] = useShownOnce<HTMLDivElement>(0.35);
  const tilt = [-3, 2, -2];
  return (
    <div ref={ref} className="flex flex-wrap gap-[40px] xl:justify-end" style={{ fontFamily: HELV, color: INK }}>
      {HMW.map((h, i) => (
        <div
          key={h.n}
          className="relative w-[300px] h-[300px] shrink-0"
          style={{
            background: h.bg,
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            opacity: shown ? 1 : 0,
            transform: shown ? 'scale(1) rotate(0deg)' : `scale(0.6) rotate(${tilt[i]}deg) translateY(30px)`,
            transition: `opacity 0.4s ease ${i * 0.5}s, transform 0.8s cubic-bezier(0.34, 1.8, 0.64, 1) ${i * 0.5}s`,
          }}
        >
          <p className="absolute left-[22px] top-[22px] text-[16px] leading-[20px] font-bold text-[rgba(0,13,16,0.5)]">{h.n}</p>
          <p className="absolute left-[22px] right-[22px] top-[50px] text-[24px] leading-[31px] font-medium">{h.q}</p>
          <p className="absolute left-[22px] bottom-[22px] text-[16px] leading-[20px] text-[rgba(0,13,16,0.5)]">Harbor Kim</p>
          <img src={h.icon} alt="" aria-hidden className="absolute right-[22px] bottom-[20px] w-[110px] h-[110px]" />
        </div>
      ))}
    </div>
  );
}

function DefineSection() {
  return (
    <section style={{ backgroundColor: SKY }} data-chapter="Define">
      <Container className="pt-[120px] pb-[80px]">
        <div className="grid grid-cols-1 md:grid-cols-[700px_1fr] gap-10 items-start">
          <div>
            <Eyebrow label="DEFINE" />
            <H2 className="mt-4">
              3 patterns:
              <br />
              Unseen, Elsewhere, Not worth it
            </H2>
            <Body className="mt-4 max-w-[700px]">
              To check our guess, we went back to our interview notes. We wrote each thing users said on a note. Then we grouped similar notes. 3 patterns came up
              more than once.
            </Body>
          </div>
          <img
            src={IMG.definePhoto}
            alt="Harbor and her teammate grouping interview notes on a glass board"
            loading="lazy"
            className="block w-full max-w-[613px] md:ml-auto rounded-[20px] aspect-[613/358] object-cover"
          />
        </div>

        <div className="mt-[100px]">
          <AffinityScroll />
        </div>
      </Container>

      {/* problem statement band */}
      <div className="bg-[#cdeefc] py-[20px]">
        <Container>
          <div className="px-6 py-12 md:py-[50px] text-center" style={{ fontFamily: HELV, color: INK }}>
            <p className="text-[16px] md:text-[17px] leading-[1.4]">PROBLEM STATEMENT</p>
            <p className="mt-[20px] text-[28px] md:text-[50px] leading-[1.25] font-bold tracking-[-0.01em]">
              Users are not aware of the rewards system.
              <br />
              So the business <span style={{ color: BLUE }}>fails to earn loyalty</span>.
            </p>
          </div>
        </Container>
      </div>

      <Container className="pt-[120px] pb-[120px]">
        <H2>
          Two personas, one journey
          <br />
          Both get stuck at first use
        </H2>
        <Body className="mt-4 max-w-[700px]">
          Who has this problem, and when do rewards get lost? We made 2 personas from our interviews. A persona is an example user built from real interview
          answers. Mei is a student. Daniel is an engineer.
        </Body>
        <div className="mt-[70px]">
          <div className="min-[1488px]:mx-[-2.22%] rounded-[20px] overflow-hidden">
            <Motion
              src={IMG.journeyVideo}
              poster={IMG.journeyPoster}
              ratio="1504 / 634"
              bg={SKY}
              label="Journey map for Mei and Daniel across 5 stages: both drop at first use, the breaking point"
            />
          </div>
        </div>
        <p className="mt-[20px] text-[16px] md:text-[17px] leading-[1.4] text-center text-[#8e8e95]" style={{ fontFamily: HELV }}>
          Quotes are paraphrased from our interviews, not word for word.
        </p>

        <div className="mt-[80px] grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-10 xl:gap-0 items-center">
          <div>
            <H2>HOW MIGHT WE</H2>
            <Body className="mt-[30px]">
              Both personas get stuck at first use.
              <br />
              That is when rewards feel scattered and unclear.
              <br />
              We turned this into 3 questions for our ideas:
            </Body>
          </div>
          <HmwStickies />
        </div>
      </Container>
    </section>
  );
}

const IDEAS = [
  {
    t: 'Coupons that find you',
    pain: 'Benefits don’t fit daily spending',
    d: 'An alert near the store. Tapping the card applies the coupon.',
    sk: [IMG.sketch1a, IMG.sketch1b],
  },
  { t: 'One rewards hub', pain: 'Rewards are scattered and unclear', d: 'Every reward on one page, in clear sections.', sk: [IMG.sketch2a, IMG.sketch2b] },
  {
    t: 'Points you can see grow',
    pain: 'Linkpoints don’t feel worth collecting',
    d: 'A bar to the next reward, a one-tap FairPrice link, and a widget.',
    sk: [IMG.sketch3a, IMG.sketch3b],
  },
];

/** 3 idea cards (Figma "Visual · idea card"): they pop in one after another when scrolled into view */
function IdeaCards() {
  const [ref, shown] = useShownOnce<HTMLDivElement>(0.25);
  return (
    <div ref={ref} className="mt-[100px] grid grid-cols-1 md:grid-cols-3 gap-[30px]" style={{ fontFamily: HELV, color: INK }}>
      {IDEAS.map((c, i) => (
        <article
          key={c.t}
          className="flex flex-col rounded-[20px] border border-[#d6ebf5] bg-white overflow-hidden"
          style={{
            opacity: shown ? 1 : 0,
            transform: shown ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.94)',
            transition: `opacity 0.8s ease ${i * 0.35}s, transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.35}s`,
          }}
        >
          <header className="flex items-center gap-[16px] px-[30px] pt-[30px]">
            <span
              className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full text-[20px] font-bold text-white"
              style={{ background: BLUE }}
              aria-hidden
            >
              {i + 1}
            </span>
            <h3 className="text-[24px] leading-[30px] font-bold tracking-[-0.01em]">
              <span className="sr-only">Idea {i + 1}: </span>
              {c.t}
            </h3>
          </header>

          <div className="mx-[30px] mt-[20px] flex justify-center gap-[20px] rounded-[20px] px-[20px] py-[20px]" style={{ background: SKY }}>
            {c.sk.map((src, k) => (
              <img
                key={src}
                src={src}
                alt={`Hand sketch ${k + 1} for idea ${i + 1}`}
                loading="lazy"
                className="block h-[300px] w-auto max-w-[calc(50%-10px)] object-contain rounded-[20px]"
              />
            ))}
          </div>

          <dl className="flex flex-1 flex-col px-[30px] pt-[30px] pb-[30px]">
            <dt className="text-[16px] leading-[20px] font-medium uppercase tracking-[0.06em] text-[#8e8e95]">Pain point</dt>
            <dd className="mt-[10px] text-[20px] leading-[28px] font-bold">{c.pain}</dd>
            <div className="my-[20px] h-px w-full bg-[rgba(0,13,16,0.1)]" />
            <dt className="text-[16px] leading-[20px] font-medium uppercase tracking-[0.06em]" style={{ color: BLUE }}>
              Our idea
            </dt>
            <dd className="mt-[10px] text-[18px] leading-[28px] text-[#333]">{c.d}</dd>
          </dl>
        </article>
      ))}
    </div>
  );
}

function DevelopSection() {
  return (
    <section className="bg-white pt-[120px] pb-[120px]" data-chapter="Develop">
      <Container>
        <Eyebrow label="DEVELOP" />
        <H2 className="mt-4">
          3 ideas, each from a pain point
          <br />
          we found
        </H2>
        <Body className="mt-4 max-w-[700px]">
          Our 3 questions gave us 26 ideas. We mapped each one by how important it was and whether we had evidence for it. 6 passed, and we checked them
          against DVF: Do users want it? Does it help the bank? Can we build it?
        </Body>
        <div className="mt-[30px]">
          <ShadowedImg src={IMG.dvf} natural={1504} alt="DVF assumption map: 25 ideas sorted by importance and evidence, 6 passed" zoom />
          <p className="mt-5 text-center text-[16px] leading-[1.4] text-[#8e8e95]" style={{ fontFamily: HELV }}>
            DVF assumption map · 26 ideas, 6 passed
          </p>
        </div>

        <Body className="mt-[100px] max-w-[760px]">
          Then we sketched 1 idea for each pain point. 2 came from the 6 passed ideas. We added a third for question 3, about points. Finding 3 had already
          shown users needed{' '}it.
        </Body>

        <IdeaCards />
        <p className="mt-[20px] text-center text-[16px] leading-[1.4] text-[#8e8e95]" style={{ fontFamily: HELV }}>
          Our hand sketches. Ideas 1–3 answer questions 1–3 above.
        </p>

        <div className="mt-[60px] grid grid-cols-1 md:grid-cols-2 gap-[40px]">
          <img src={IMG.workshop1} alt="Harbor sketching idea screens with her teammate" loading="lazy" className="block w-full aspect-[700/472] object-cover rounded-[20px]" />
          <img src={IMG.workshop2} alt="The team reviewing paper sketches together" loading="lazy" className="block w-full aspect-[700/472] object-cover rounded-[20px]" />
        </div>
      </Container>
    </section>
  );
}

const FEATURES = [
  {
    t: 'Coupons that find you',
    d: 'Near a store, the right coupon pops up. One tap adds it to your card. Then it’s used automatically when you pay.',
    v: IMG.deliver1,
    poster: IMG.deliver1Poster,
    label: 'Lock-screen coupon alert, one tap adds the Kopitiam coupon to the Trust card',
    caption: 'Alert near a store',
  },
  {
    t: 'One rewards hub',
    d: 'Points, quests, coupons and stamps sit on one page. Trust+, the premium level, sat at the bottom in this version — testing moved it to the top.',
    v: IMG.deliver2,
    poster: IMG.deliver2Poster,
    label: 'Adding the LinkPoints widget, then the Rewards page with points, quests, coupons, stamps and Trust+ on one screen',
    caption: 'Rewards hub',
  },
  {
    t: 'Points you can see grow',
    d: 'A bar shows how far you are from the next level. You can link FairPrice in one tap. A widget shows your points without opening the app.',
    v: IMG.deliver3,
    poster: IMG.deliver3Poster,
    label: 'Linking FairPrice in one tap and earning 50 points',
    caption: 'Points bar',
  },
];

/** Progress drawn along a card's rounded border: a blue line runs clockwise around the card as its video plays (0 → 1). */
function ProgressBorder({ progress }: { progress: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const card = ref.current?.parentElement;
    if (!card) return;
    const measure = () => setSize({ w: card.offsetWidth, h: card.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(card);
    return () => ro.disconnect();
  }, []);
  const R = 19;
  const w = Math.max(0, size.w - 2);
  const h = Math.max(0, size.h - 2);
  const perimeter = 2 * (w + h) - 8 * R + 2 * Math.PI * R;
  return (
    <svg ref={ref} aria-hidden className="pointer-events-none absolute" style={{ top: -1, left: -1, width: size.w, height: size.h, overflow: 'visible' }}>
      {size.w > 0 && (
        <rect
          x={1}
          y={1}
          width={w}
          height={h}
          rx={R}
          ry={R}
          fill="none"
          stroke={BLUE}
          strokeWidth={2}
          strokeDasharray={perimeter}
          strokeDashoffset={perimeter * (1 - Math.min(1, Math.max(0, progress)))}
          style={{ transition: 'stroke-dashoffset 0.3s linear' }}
        />
      )}
    </svg>
  );
}

/**
 * Deliver: 3 feature cards on the left, the phone plays that feature's screen recording on the right.
 * The block is pinned while you scroll through it; scrolling moves 1 → 2 → 3. When a video ends the next starts (3 → 1 loops).
 */
function DeliverShowcase() {
  const outer = useRef<HTMLDivElement>(null);
  const vids = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [prog, setProg] = useState(0);
  const lastStep = useRef(0);

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = outer.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const travel = el.offsetHeight - window.innerHeight;
      if (travel <= 0 || r.top > 0 || r.bottom < window.innerHeight) return;
      const step = Math.min(2, Math.floor((-r.top / travel) * 3));
      if (step !== lastStep.current) {
        lastStep.current = step;
        setActive(step);
      }
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    window.addEventListener('scroll', on, { passive: true });
    return () => {
      window.removeEventListener('scroll', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    vids.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
    setProg(0);
  }, [active]);

  return (
    <div ref={outer} className="relative mt-[60px] lg:h-[280vh]">
      <div
        className="lg:sticky lg:top-[max(20px,calc(50vh-400px))] grid grid-cols-1 lg:grid-cols-[minmax(0,620px)_360px] lg:justify-center gap-[60px] xl:gap-[180px] items-center"
        style={{ fontFamily: HELV }}
      >
        <div className="flex flex-col gap-[20px]">
          {FEATURES.map((f, i) => {
            const on = i === active;
            return (
              <button
                key={f.t}
                type="button"
                onClick={() => setActive(i)}
                className="relative text-left rounded-[20px] bg-white px-[30px] py-[20px] transition-all duration-500"
                style={{ border: `1px solid ${on ? '#cfe9f5' : 'rgba(0,13,16,0.08)'}`, boxShadow: on ? '0 10px 30px rgba(0,157,220,0.12)' : 'none' }}
                aria-pressed={on}
              >
                {on && <ProgressBorder progress={prog} />}
                <p className="text-[16px] leading-[20px] font-medium" style={{ color: on ? BLUE : '#8e8e95' }}>
                  0{i + 1}
                </p>
                <p className="mt-[10px] text-[22px] leading-[28px] font-bold transition-colors duration-500" style={{ color: on ? INK : '#8e8e95' }}>
                  {f.t}
                </p>
                <p className="mt-[10px] text-[16px] leading-[26px] transition-colors duration-500" style={{ color: on ? '#333' : '#a6a6ad' }}>
                  {f.d}
                </p>
              </button>
            );
          })}
        </div>

        <figure className="mx-auto w-full max-w-[360px]">
          <div className="rounded-[60px] bg-black p-[12px] shadow-[0_30px_60px_rgba(0,13,16,0.25)]">
            <div className="relative overflow-hidden rounded-[48px] bg-white" style={{ aspectRatio: '394 / 852' }}>
              {FEATURES.map((f, i) => (
                <video
                  key={f.v}
                  ref={(el) => {
                    vids.current[i] = el;
                  }}
                  src={f.v}
                  poster={f.poster}
                  muted
                  playsInline
                  preload={i === 0 ? 'auto' : 'metadata'}
                  aria-label={f.label}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                  style={{ opacity: i === active ? 1 : 0 }}
                  onTimeUpdate={(e) => {
                    if (i === active && e.currentTarget.duration) setProg(e.currentTarget.currentTime / e.currentTarget.duration);
                  }}
                  onEnded={() => {
                    if (i === active) setActive((active + 1) % FEATURES.length);
                  }}
                />
              ))}
            </div>
          </div>
          <figcaption className="mt-[20px] text-center text-[16px] leading-[1.4] text-[#8e8e95]">{FEATURES[active].caption}</figcaption>
        </figure>
      </div>
    </div>
  );
}

function DeliverSection() {
  return (
    <section className="pt-[120px] pb-[120px]" style={{ backgroundColor: SKY }} data-chapter="Deliver">
      <Container>
        <Eyebrow label="DELIVER" />
        <H2 className="mt-4">
          The design we tested:
          <br />
          3 features, 7 key screens
        </H2>
        <Body className="mt-4 max-w-[700px]">
          Each feature solves one pain point. Features 1 and 2 make rewards easy to find. Feature 3 makes them easy to use. [{' '}
          <a
            href={PROTOTYPE_URL}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-[#000d10]/30 underline-offset-[3px] transition-colors duration-150 hover:decoration-[#000d10]"
          >
            Try the clickable prototype
          </a>{' '}
          ]
        </Body>
        <DeliverShowcase />
      </Container>
    </section>
  );
}

function TestSection() {
  return (
    <section className="bg-white pt-[120px] pb-[120px]" data-chapter="Test">
      <Container>
        <Eyebrow label="TEST" />
        <H2 className="mt-4">
          Usability testing:
          <br />
          finding points was the hardest part
        </H2>
        <TestTop />

        <div className="mt-[120px]">
          <H2 color="#333">What we changed after testing</H2>
          <Body className="mt-5 max-w-[700px]" color="#333">
            6 users showed us 16 issues, and we made 7 fixes. The 2 below fixed the hardest tasks; the other 5 were smaller copy and layout changes. We haven’t
            re-tested yet.
          </Body>

          <div className="mt-[60px] md:mt-0">
            <FixBlock
              kicker="Fix 1 · Points journey"
              title={
                <>
                  Users saw their points,
                  <br />
                  but not what they were for
                </>
              }
              body="The points bar now shows each reward on the way. Now 300 points has a clear goal."
              stat="2/6"
              statLabel="checked their points without help"
              statNote="2 users asked what 300 points were for."
              before={IMG.fix1Before}
              after={IMG.fix1After}
              alt="Fix 1, LinkPoints screen"
            />
          </div>
          <div className="mt-[100px] md:mt-[40px]">
            <FixBlock
              kicker="Fix 3 + 4 · Rewards hub"
              title={
                <>
                  Rewards were there,
                  <br />
                  but hard to spot
                </>
              }
              body="Coupons and stamps got their own sections with See All. Trust+ moved to the top."
              stat="3/6"
              statLabel="needed a hint to find a reward"
              statNote="IT users rated ease of use 73. General users rated it 91."
              before={IMG.fix34Before}
              after={IMG.fix34After}
              alt="Fix 3 + 4, Rewards screen"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

function ReflectionSection() {
  return (
    <section className="bg-[#002742] pt-[120px] pb-[120px]" style={{ fontFamily: HELV }} data-chapter="Reflection">
      <Container>
        <Eyebrow label="REFLECTION" light />
        <div className="mt-4 flex flex-col md:flex-row gap-12 md:gap-[120px] items-start">
          <div className="flex-1 min-w-0">
            <h2 className="text-[30px] md:text-[37px] leading-[1.1] tracking-[-0.01em] font-bold text-white">Takeaways</h2>
            <div className="mt-[30px] flex flex-col gap-4 text-[17px] md:text-[18px] leading-[29px] text-white/80">
              <p>I learned to measure what users notice, not what the system records. 9 billion points meant little to users who never saw them.</p>
              <p>
                I also learned to pick a problem design can change. “Make Trust Bank their main bank” was too big, but “make rewards easy to find” was
                something we could test.
              </p>
              <p>Last, rewards cost the bank money, because unused points are money it owes. They only pay off if they keep users coming back.</p>
            </div>
          </div>
          <div className="w-full md:w-[460px] shrink-0">
            <Img src={IMG.reflection} alt="Harbor presenting the Trust Bank design to her team" className="rounded-[20px]" />
          </div>
        </div>

        <div className="mt-[80px]">
          <p className="pb-4 text-[16px] leading-[20px] font-medium tracking-[0.04em] text-white/50">Next Steps</p>
          <div className="flex gap-6 py-3">
            <span className="w-10 shrink-0 text-[20px] md:text-[22px] leading-[30px] font-medium text-white/45">01</span>
            <p className="text-[20px] md:text-[22px] leading-[30px] font-medium text-white">
              Apply the 3 remaining fixes from the test, then re-test the points journey with new users.
            </p>
          </div>
          <div className="flex gap-6 py-3">
            <span className="w-10 shrink-0 text-[20px] md:text-[22px] leading-[30px] font-medium text-white/45">02</span>
            <div>
              <p className="text-[20px] md:text-[22px] leading-[30px] font-medium text-white">
                After that, pilot the FairPrice link and measure two numbers that show whether rewards bring people back:
              </p>
              <p className="mt-2 text-[18px] leading-[26px] font-medium whitespace-pre-wrap" style={{ color: BLUE }}>
                {'FairPrice link rate  ·  30-day retention'}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Portfolio_1 scroll reveal (CaseReveal) ---------- */

/** each block inside a section's 1440 column fades up a little as it enters the screen, with a short stagger */
function useCaseReveal(rootRef: React.RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const columns = Array.from(root.querySelectorAll<HTMLElement>('.max-w-\\[1440px\\]'));
    const items: HTMLElement[] = [];
    columns.forEach((col) => {
      Array.from(col.children).forEach((child, i) => {
        const el = child as HTMLElement;
        el.classList.add('reveal');
        el.style.setProperty('--reveal-delay', `${Math.min(i, 4) * 120}ms`);
        items.push(el);
      });
    });
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const vh = window.innerHeight;
    items.forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add('is-in');
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    );
    items.filter((el) => !el.classList.contains('is-in')).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

/* ---------- Portfolio_1 hover magnifier (ImageLightbox): only images marked data-zoom="true" ---------- */

function useHoverMagnifier(rootRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    type Z = { s: number; ts: number; ox: number; oy: number; tox: number; toy: number; radius: number };
    const HOVER_SCALE = 1.8;
    const zooms = new Map<HTMLImageElement, Z>();
    let active: HTMLImageElement | null = null;
    let raf = 0;
    const localPoint = (img: HTMLImageElement, z: Z | undefined, cx: number, cy: number) => {
      const rect = img.getBoundingClientRect();
      const s = z?.s ?? 1;
      const ox = z?.ox ?? 0;
      const oy = z?.oy ?? 0;
      const baseLeft = rect.left - ox * (1 - s);
      const baseTop = rect.top - oy * (1 - s);
      return { x: Math.max(0, Math.min(img.offsetWidth, cx - baseLeft)), y: Math.max(0, Math.min(img.offsetHeight, cy - baseTop)) };
    };
    const release = () => {
      if (active) {
        const z = zooms.get(active);
        if (z) z.ts = 1;
      }
      active = null;
    };
    const onMove = (e: PointerEvent) => {
      const img = (e.target as HTMLElement)?.closest?.('img') as HTMLImageElement | null;
      if (img && root.contains(img) && img.dataset.zoom === 'true') {
        if (active !== img) {
          release();
          active = img;
        }
        let z = zooms.get(img);
        const p = localPoint(img, z, e.clientX, e.clientY);
        if (!z) {
          const r = parseFloat(getComputedStyle(img).borderTopLeftRadius) || 0;
          z = { s: 1, ts: HOVER_SCALE, ox: p.x, oy: p.y, tox: p.x, toy: p.y, radius: r };
          zooms.set(img, z);
          img.style.transition = 'none';
          img.style.willChange = 'transform, clip-path';
        }
        z.ts = HOVER_SCALE;
        z.tox = p.x;
        z.toy = p.y;
      } else release();
    };
    const clear = (img: HTMLImageElement) => {
      img.style.transform = '';
      img.style.transformOrigin = '';
      img.style.clipPath = '';
      img.style.transition = '';
      img.style.willChange = '';
    };
    const tick = () => {
      zooms.forEach((z, img) => {
        z.s += (z.ts - z.s) * 0.14;
        z.ox += (z.tox - z.ox) * 0.2;
        z.oy += (z.toy - z.oy) * 0.2;
        if (z.ts === 1 && z.s < 1.002) {
          clear(img);
          zooms.delete(img);
          return;
        }
        const w = img.offsetWidth;
        const h = img.offsetHeight;
        const k = 1 - 1 / z.s;
        const r = z.radius / z.s;
        img.style.transformOrigin = `${z.ox}px ${z.oy}px`;
        img.style.transform = `scale(${z.s})`;
        img.style.clipPath = `inset(${z.oy * k}px ${(w - z.ox) * k}px ${(h - z.oy) * k}px ${z.ox * k}px round ${r}px)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', release);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', release);
      zooms.forEach((_, img) => clear(img));
      zooms.clear();
    };
  }, [rootRef]);
}

/* Portfolio_1 index.css pieces this body needs, scoped to .p1tb */
const P1_CSS = `
.p1tb { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #000d10; background: #ffffff; -webkit-font-smoothing: antialiased; }
.p1tb ::selection { background: #3b5bd9; color: #ffffff; }
.p1tb .reveal { opacity: 0; transform: translate3d(0, 28px, 0); transition: opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1), transform 1.2s cubic-bezier(0.22, 1, 0.36, 1); transition-delay: var(--reveal-delay, 0ms); will-change: opacity, transform; }
.p1tb .reveal.is-in { opacity: 1; transform: none; }
.p1tb .reveal img { transform: scale(1.015); transition: transform 1.6s cubic-bezier(0.22, 1, 0.36, 1); transition-delay: var(--reveal-delay, 0ms); }
.p1tb .reveal.is-in img { transform: none; }
.p1tb .tb-range { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 9999px; cursor: pointer;
  background: linear-gradient(90deg, #ffffff var(--fill, 0%), rgba(255,255,255,0.35) var(--fill, 0%)); }
.p1tb .tb-range::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 9999px; background: #ffffff; border: 0; }
.p1tb .tb-range::-moz-range-thumb { width: 12px; height: 12px; border-radius: 9999px; background: #ffffff; border: 0; }
.p1tb .tb-range::-moz-range-track { background: transparent; }
@media (prefers-reduced-motion: reduce) {
  .p1tb .reveal, .p1tb .reveal img { opacity: 1 !important; transform: none !important; transition: none !important; }
}
`;

/** the whole Trust Bank body from Portfolio_1 (hero → reflection). Wrap it with the site's header, next card and footer. */
export function TrustBankBody() {
  const root = useRef<HTMLDivElement>(null);
  useCaseReveal(root);
  useHoverMagnifier(root);
  return (
    <div ref={root} className="p1tb relative w-full">
      <style>{P1_CSS}</style>
      <HeroSection />
      <OverviewSection />
      <ProcessSection />
      <DiscoverSection />
      <DefineSection />
      <DevelopSection />
      <DeliverSection />
      <TestSection />
      <ReflectionSection />
    </div>
  );
}
