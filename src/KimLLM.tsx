import React, { useEffect, useRef, useState } from 'react'

// Kim LLM — shared by every page (main, About, Trust Bank, GameCove, UTrada).
// - KimButton: the header button, a square outlined button with a still four-point sparkle in front (Harbor's icon
//   reference: a solid star with curved, pinched sides). No rounded corners, no icon animation. Uses the header's text colour.
// - VoiceAssistant: the Kim LLM panel that the button opens, under the header at the top right; square corners.
//   Scripted answers about Harbor (no AI backend); speech recognition where the browser has it, spoken replies.
//   The button and the panel talk through window events: 'kimllm:toggle' (button → panel), 'kimllm:state' (panel → button).
//   Closes on Esc, a click outside, or the close button.
// Each page renders <KimButton /> in its header and <VoiceAssistant /> once; the panel brings its own CSS (KIM_CSS).

export function Sparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0.5Q13.7 10.3 23.5 12Q13.7 13.7 12 23.5Q10.3 13.7 0.5 12Q10.3 10.3 12 0.5Z" />
    </svg>
  )
}

const KIM_CSS = `
/* header button: square outline, still sparkle in front */
.hb .kim-btn { display: inline-flex; align-items: center; gap: 8px; margin: 0; padding: 9px 15px; border: 1px solid currentColor; border-radius: 0;
  background: transparent; color: inherit; font-size: 16px; font-weight: 500; line-height: 1.2; white-space: nowrap; cursor: pointer; transition: background-color .25s; }
.hb .kim-btn:hover, .hb .kim-btn[aria-expanded="true"] { background: rgba(128,128,128,.14); }
.hb .kim-btn:focus-visible { outline: 2px solid #2563EB; outline-offset: 3px; }
.hb .kim-btn svg { display: block; width: 16px; height: 16px; flex: none; }

/* aurora orb — ChatGPT-voice-style */
@property --rot { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.hb .orb { position: relative; border-radius: 50%; overflow: hidden; isolation: isolate;
  background: radial-gradient(circle at 50% 120%, #1D4ED8 0%, #3B82F6 35%, #93C5FD 65%, #E0F2FE 100%); }
.hb .orb::before, .hb .orb::after { content: ""; position: absolute; inset: -25%; border-radius: 50%; filter: blur(14px); }
.hb .orb::before { background: conic-gradient(from var(--rot), #E0F2FE, #60A5FA, #FFFFFF, #38BDF8, #BFDBFE, #2563EB, #E0F2FE); opacity: .85; animation: orb-spin 7s linear infinite; mix-blend-mode: soft-light; }
.hb .orb::after { background: radial-gradient(circle at 35% 30%, rgba(255,255,255,.95), rgba(255,255,255,0) 45%), radial-gradient(circle at 70% 75%, rgba(147,197,253,.9), rgba(147,197,253,0) 50%);
  animation: orb-drift 5s ease-in-out infinite alternate; }
@keyframes orb-spin { to { --rot: 360deg; } }
@keyframes orb-drift { 0% { transform: translate(-6%, -4%) scale(1); } 100% { transform: translate(6%, 5%) scale(1.12); } }
.hb .orb.live { animation: orb-pulse 1.1s ease-in-out infinite; }
.hb .orb.talk { animation: orb-talk .5s ease-in-out infinite alternate; }
@keyframes orb-pulse { 50% { transform: scale(1.06); } }
@keyframes orb-talk { 0% { transform: scale(.97); } 100% { transform: scale(1.08); } }

/* panel: under the header, top right; square corners */
.hb .voice-pop { position: fixed; right: 24px; top: 84px; z-index: 60; width: 360px; padding: 28px 24px 24px; background: #fff; color: #0F0F0F; border: 1px solid #DBDBD9;
  border-radius: 0; box-shadow: 0 24px 60px rgba(0,0,0,.18); transform-origin: top right; text-align: center;
  transform: translateY(-8px) scale(.97); opacity: 0; pointer-events: none; transition: transform .35s cubic-bezier(.2,.7,.2,1), opacity .25s; }
.hb .voice-pop.open { transform: none; opacity: 1; pointer-events: auto; }
.hb .voice-pop .ttl { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 16px; font-weight: 500; letter-spacing: .02em; color: #595959; margin-bottom: 18px; }
.hb .voice-pop .ttl svg { width: 16px; height: 16px; }
.hb .voice-pop .big { width: 150px; height: 150px; margin: 0 auto; }
.hb .voice-status { margin-top: 18px; font-size: 16px; color: #595959; }
.hb .voice-q { margin-top: 10px; font-size: 16px; font-weight: 500; min-height: 22px; }
.hb .voice-a { margin-top: 8px; font-size: 16px; line-height: 1.5; color: #333; min-height: 48px; }
.hb .voice-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 18px; }
.hb .voice-chips button { padding: 8px 14px; border: 1px solid #DBDBD9; border-radius: 0; background: #fff; font-size: 16px; cursor: pointer; color: #0F0F0F; }
.hb .voice-chips button:hover { background: #F5F5F2; }
.hb .voice-ctrl { display: flex; justify-content: center; gap: 12px; margin-top: 20px; }
.hb .voice-ctrl button { width: 52px; height: 52px; border-radius: 50%; border: 0; cursor: pointer; display: grid; place-items: center; }
.hb .voice-ctrl .mic { background: #0F0F0F; color: #fff; }
.hb .voice-ctrl .mic.on { background: #2563EB; }
.hb .voice-ctrl .end { background: #F5F5F2; color: #0F0F0F; }
.hb .voice-ctrl svg { width: 22px; height: 22px; display: block; }

@media (max-width: 900px) {
  .hb .voice-pop { left: 16px; right: 16px; top: 76px; width: auto; }
}
`

const CHIPS = ['Who is Harbor?', 'Show me projects', 'Trust Bank', 'How to contact']
const ANSWERS: { k: RegExp; a: string }[] = [
  { k: /trust|bank|reward/i, a: 'Trust Bank Singapore was an eight-week project. Harbor led planning, UI design and usability tests, and the redesign scored 85 on ease of use.' },
  { k: /game|cove|dashboard/i, a: 'GameCove is an AI game-analytics dashboard Harbor designed as a team project.' },
  { k: /utrada|trading/i, a: 'At UTrada, Harbor worked on product design for a trading platform from 2024 to 2026.' },
  { k: /project|work|portfolio|case/i, a: 'Three featured projects: Trust Bank Singapore, GameCove and UTrada. Scroll to Selected work to see each one.' },
  { k: /contact|email|call|hire|book|reach/i, a: 'You can book a 30-minute call, or email harborkim0328@gmail.com.' },
  { k: /who|about|harbor|background|yourself/i, a: 'Harbor is a product designer with over three years in fintech and e-learning. She started in Fine Art, and now designs end to end, from research to UI.' },
]
const FALLBACK = 'I can tell you about Harbor, her projects, or how to get in touch.'
const answerFor = (q: string) => (ANSWERS.find(x => x.k.test(q))?.a ?? FALLBACK)

export function useVoice() {
  const [mode, setMode] = useState<'idle' | 'listening' | 'speaking'>('idle')
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const rec = useRef<any>(null)
  const SR = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null
  const canListen = !!SR

  const speak = (text: string) => {
    setA(text)
    const synth = window.speechSynthesis
    if (!synth) { setMode('idle'); return }
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'; u.rate = 1.02
    u.onstart = () => setMode('speaking')
    u.onend = () => setMode('idle')
    u.onerror = () => setMode('idle')
    synth.speak(u)
  }
  const ask = (text: string) => { rec.current?.abort?.(); setQ(text); speak(answerFor(text)) }
  const stop = () => { rec.current?.abort?.(); window.speechSynthesis?.cancel(); setMode('idle') }
  const listen = () => {
    if (!SR) return
    if (mode === 'listening') { rec.current?.stop(); return }
    window.speechSynthesis?.cancel()
    const r = new SR()
    r.lang = 'en-US'; r.interimResults = true; r.maxAlternatives = 1
    let finalText = ''
    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((x: any) => x[0].transcript).join('')
      setQ(t)
      if (e.results[e.results.length - 1].isFinal) finalText = t
    }
    r.onerror = (e: any) => { setMode('idle'); if (e.error === 'not-allowed') setA('Microphone access is blocked here. Pick a question below instead.') }
    r.onend = () => { if (finalText) speak(answerFor(finalText)); else setMode(m => (m === 'listening' ? 'idle' : m)) }
    rec.current = r
    setA('')
    setMode('listening')
    try { r.start() } catch { setMode('idle') }
  }
  useEffect(() => () => { rec.current?.abort?.(); window.speechSynthesis?.cancel() }, [])
  return { mode, q, a, canListen, ask, stop, listen }
}

/** header button that opens / closes the Kim LLM panel */
export function KimButton({ tabIndex }: { tabIndex?: number }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const on = (e: Event) => setOpen(!!(e as CustomEvent).detail)
    addEventListener('kimllm:state', on)
    return () => removeEventListener('kimllm:state', on)
  }, [])
  return (
    <button type="button" className="kim-btn" tabIndex={tabIndex} aria-expanded={open} aria-label={open ? 'Close Kim LLM' : 'Open Kim LLM, ask about Harbor'}
      onClick={() => dispatchEvent(new CustomEvent('kimllm:toggle'))}>
      <Sparkle />Kim LLM
    </button>
  )
}

/** the Kim LLM panel (render once per page, inside the page's .hb root) */
export function VoiceAssistant() {
  const [chat, setChat] = useState(false)
  const voice = useVoice()
  const pop = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const t = () => setChat(v => !v)
    addEventListener('kimllm:toggle', t)
    return () => removeEventListener('kimllm:toggle', t)
  }, [])
  useEffect(() => {
    dispatchEvent(new CustomEvent('kimllm:state', { detail: chat }))
    if (!chat) { voice.stop(); return }
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setChat(false) }
    const d = (e: PointerEvent) => {
      const el = e.target as Element
      if (pop.current?.contains(el) || el.closest?.('.kim-btn')) return
      setChat(false)
    }
    addEventListener('keydown', k); addEventListener('pointerdown', d)
    return () => { removeEventListener('keydown', k); removeEventListener('pointerdown', d) }
  }, [chat])
  return (
    <>
      <style>{KIM_CSS}</style>
      <div ref={pop} className={'voice-pop' + (chat ? ' open' : '')} role="dialog" aria-label="Kim LLM: ask about Harbor" aria-hidden={!chat}>
        <div className="ttl"><Sparkle />Kim LLM</div>
        <div className={'orb big' + (voice.mode === 'listening' ? ' live' : voice.mode === 'speaking' ? ' talk' : '')} aria-hidden="true" />
        <div className="voice-status" aria-live="polite">
          {voice.mode === 'listening' ? 'Listening…' : voice.mode === 'speaking' ? 'Speaking…' : voice.canListen ? 'Tap the mic and ask about Harbor' : 'Pick a question'}
        </div>
        <div className="voice-q">{voice.q}</div>
        <div className="voice-a">{voice.a}</div>
        <div className="voice-chips">
          {CHIPS.map(c => <button key={c} tabIndex={chat ? 0 : -1} onClick={() => voice.ask(c)}>{c}</button>)}
        </div>
        <div className="voice-ctrl">
          {voice.canListen && (
            <button className={'mic' + (voice.mode === 'listening' ? ' on' : '')} tabIndex={chat ? 0 : -1} aria-label={voice.mode === 'listening' ? 'Stop listening' : 'Start talking'} onClick={voice.listen}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" width="22" height="22"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
            </button>
          )}
          <button className="end" tabIndex={chat ? 0 : -1} aria-label="Close" onClick={() => setChat(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2" strokeLinecap="round" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      </div>
    </>
  )
}
