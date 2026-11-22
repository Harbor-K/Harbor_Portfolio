import React from 'react'

/**
 * UTrada · Test · Stakeholder check (Nov 22). Lives in its own file so new replies only touch this file.
 * Add a reply: set `replied: true` on the person and add an entry to REPLIES with the same `who` index.
 * The replies are the stakeholder's own words (quotes) and Harbor's summary of them (t / b). Names are not shown, only roles.
 * Photos: Figma's four stakeholder photos are illustrative stock photos. Next to real replies they would read as the real
 * people, so the cards show an icon instead. Set SHOW_PHOTOS to true to bring the photos back.
 */

const A9 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/utrada/v9/'
const SHOW_PHOTOS = false

const PEOPLE: { role: string; replied: boolean }[] = [
  { role: 'Business Operations · UTrada', replied: true },
  { role: 'Marketing · UTrada', replied: false },
  { role: 'Marketing · UTrada', replied: false },
  { role: 'Customer support · another broker', replied: false },
]

/* the questions as they were sent */
const ASKED = [
  'What did new clients ask about the most before the ID check or first deposit?',
  'Was it mostly licence stuff, which company holds their account, withdrawals, or something else?',
  'Where did people usually get stuck or drop off?',
  'I picked 3 moments where people hesitate. Do they feel right to you? Anything I missed?',
  'Would showing clients which UTrada company their account belongs to have helped? Anything unrealistic about it?',
]

type Finding = { k: string; t: string; b: string; q?: string }
const REPLIES: { who: number; findings: Finding[]; take: string[] }[] = [
  {
    who: 0,
    findings: [
      { k: 'Before the first deposit', t: 'Is my money safe?',
        b: 'IBs asked about the licences: strong regulation protects their clients’ money and helps them sell the broker. Individual clients asked about withdrawals: how long they take and when the money arrives.',
        q: 'Ultimately, both groups were mainly concerned about the safety of their funds.' },
      { k: 'Where they stop', t: 'The first deposit',
        b: 'One conversation is not enough. Account managers, demo accounts to test trading costs, promotions and a small first deposit to try a withdrawal all play a part.',
        q: 'Trust cannot be built through just one conversation or communication channel.' },
      { k: 'The 3 moments', t: 'They made sense, with one gap',
        b: 'Licences, trading costs and support all came up. What was missing: a page on payment methods and how deposits and withdrawals work.' },
      { k: 'Showing the company', t: 'Useful, if it is the real one',
        b: 'Some brokers advertise one licence and sign clients up under an offshore company. The page has to show the company the client actually signs with, and who can sign with it.',
        q: 'Clearly showing which legal entity holds a client’s account would help build trust and improve transparency.' },
    ],
    take: [
      'Withdrawals belong in the trust story: how long they take and when the money arrives.',
      'A fourth moment to explore: a payments page with methods and deposit and withdrawal times.',
      'The company screen shows the company the account is really opened with, and who is eligible.',
    ],
  },
]

const Person = () => (
  <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
    <path d="M61 38C61 45.18 55.18 51 48 51C40.82 51 35 45.18 35 38C35 30.82 40.82 25 48 25C55.18 25 61 30.82 61 38Z" stroke="currentColor" strokeWidth="3" />
    <path d="M24 74C26.5 61 36 55 48 55C60 55 69.5 61 72 74" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
)
const d = (n: number) => ({ '--d': n } as React.CSSProperties)

export function StakeholderCheck() {
  const n = PEOPLE.filter(p => p.replied).length
  return (
    <div className="u9-check uc mt96">
      <style>{UC_CSS}</style>
      <div className="sh" data-r><h4>Stakeholder check · Nov 2026</h4><span className="pill pu">{n} of {PEOPLE.length} replied</span></div>
      <ul className="who" data-r>
        {PEOPLE.map((p, i) => (
          <li key={i} style={d(i)} className={p.replied ? 'on' : undefined}>
            <span className="ph">{SHOW_PHOTOS ? <img src={A9 + `person-${i + 1}.webp`} alt="" width={48} height={48} loading="lazy" decoding="async" /> : <Person />}</span>
            <span className="tx"><span>{p.role}</span><span className="st">{p.replied ? 'Replied' : 'Waiting for reply'}</span></span>
          </li>
        ))}
      </ul>
      <div className="asked" data-r>
        <p className="k">What I asked</p>
        <ol>{ASKED.map((a, i) => <li key={i}><b>{i + 1}.</b>{a}</li>)}</ol>
      </div>
      {REPLIES.map(r => (
        <div key={r.who} className="uc-reply" data-r>
          <p className="k">What I heard · {PEOPLE[r.who].role}</p>
          <div className="uc-grid">
            {r.findings.map((f, i) => (
              <div key={f.k} className="uc-f" style={d(i)}>
                <p className="fk">{f.k}</p>
                <h5>{f.t}</h5>
                <p className="fb">{f.b}</p>
                {f.q && <blockquote>“{f.q}”</blockquote>}
              </div>
            ))}
          </div>
          <div className="uc-take">
            <p className="k">What I’m taking from it</p>
            <ul>{r.take.map(t => <li key={t}>{t}</li>)}</ul>
          </div>
        </div>
      ))}
    </div>
  )
}

const UC_CSS = `
.u9 .uc .who li { align-items: center; }
.u9 .uc .who .tx { display: flex; flex-direction: column; min-width: 0; font-size: 16px; line-height: 24px; color: var(--ink); }
.u9 .uc .who .st { color: var(--mute); }
.u9 .uc .who li.on { border-color: var(--pu); }
.u9 .uc .who li.on .st { color: var(--pu); font-weight: 500; }
.u9 .uc .who li:not(.on) .ph { background: #F2F2F5; color: var(--mute); }
.u9 .uc .asked ol { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; list-style: none; }
.u9 .uc .asked ol li { display: flex; gap: 8px; font-size: 18px; line-height: 32px; color: var(--ink); }
.u9 .uc .asked ol b { flex: none; width: 24px; font-weight: 500; color: var(--mute); }
.u9 .uc-reply { display: flex; flex-direction: column; gap: 24px; padding: 32px; background: #FFFFFF; border: 1px solid var(--line); }
.u9 .uc-reply > .k, .u9 .uc-take .k { color: var(--pu); letter-spacing: 0; }
.u9 .uc-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.u9 .uc-f { display: flex; flex-direction: column; gap: 8px; padding: 24px; border: 1px solid var(--line3);
  opacity: 0; transform: translateY(16px); transition: opacity .5s ease calc(var(--d, 0) * 90ms), transform .7s cubic-bezier(.22,1,.36,1) calc(var(--d, 0) * 90ms); }
.u9 .uc-reply.r-in .uc-f { opacity: 1; transform: none; }
.u9 .uc-f .fk { font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: .06em; color: var(--mute); }
.u9 .uc-f h5 { margin: 0; font-size: 24px; font-weight: 700; line-height: 32px; color: var(--ink2); }
.u9 .uc-f .fb { font-size: 18px; line-height: 30px; color: var(--ink); }
.u9 .uc-f blockquote { margin: 8px 0 0; padding: 4px 0 4px 16px; border-left: 2px solid var(--pu); font-size: 18px; font-style: italic; line-height: 30px; color: var(--ink2); }
.u9 .uc-take { display: flex; flex-direction: column; gap: 8px; padding: 24px 32px; background: #F0EBFC; }
.u9 .uc-take ul { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; list-style: none; }
.u9 .uc-take li { position: relative; padding-left: 20px; font-size: 18px; font-weight: 600; line-height: 32px; color: var(--ink); }
.u9 .uc-take li::before { content: ""; position: absolute; left: 0; top: 13px; width: 8px; height: 8px; background: var(--pu); }
@media (max-width: 1023px) { .u9 .uc-grid { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 700px) { .u9 .uc-reply { padding: 24px; } .u9 .uc-take { padding: 24px; } .u9 .uc-f { padding: 20px; } }
@media (prefers-reduced-motion: reduce) { .u9 .uc-f { opacity: 1 !important; transform: none !important; transition: none !important; } }
`
