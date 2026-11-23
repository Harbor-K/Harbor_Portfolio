import React from 'react'

/**
 * UTrada · Test (Figma 2331:547 "Section / Test · Webflow style (no photo, no arrows)", Nov 23).
 * Lives in its own file so new replies only touch this file.
 *
 * StakeholderCheck renders the whole Test section body: the "WHAT I HEARD" label and head, one dark quote card
 * (UTrada logo and the replier's avatar + role on the left, quote and what it confirmed on the right), then NextTest.
 * UC_CSS hides the page's own label, head and older Fogg plan block in the Test section, so UTradaV9.tsx did not need
 * to change (clean those out of UTradaV9.tsx when it is next rewritten).
 * NextTest: the planned test with first-time traders, as Today vs Redesign for the same three tasks.
 * Type and spacing are Figma's (Inter in Figma → Roboto on the site), on the 8px grid; square corners.
 */

const A9 = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/utrada/v9/'

const REPLY = {
  role: 'Business Operations',
  org: 'UTrada',
  avatar: A9 + 'avatar-bizops.jpg', // Figma 2331:615 (112px, shown at 56)
  quote: 'Trust cannot be built through just one conversation or communication channel.',
  finding: 'It confirmed the first deposit as the biggest drop-off. The moments I picked held up, with one gap: how payments and withdrawals work.',
}

const TASKS = [
  { k: 'Task 1 · Licence', today: 'Licence shown for only one of the two companies.', redo: 'Regulator and licence number in one plain sentence.' },
  { k: 'Task 2 · Company', today: 'Not clear which company your account is with.', redo: 'The company you sign with, named before sign-up.' },
  { k: 'Task 3 · Help', today: 'Hard to find help before adding money.', redo: 'Help from every page, even offline.' },
]

/** UTrada wordmark, white (Figma 2330:11200) */
const Logo = () => (
  <svg className="uc-logo" width="160" height="38" viewBox="0 0 160 38" fill="#FFFFFF" role="img" aria-label="UTrada">
    <path d="M67.2983 23.5841C66.526 27.4425 67.4527 30.9923 69.7694 33.6161C71.9317 36.2398 75.1751 37.7832 78.8819 37.7832C81.9709 37.7832 85.0598 36.7028 87.8399 34.8508C88.6122 36.7028 90.3111 37.7832 92.3189 37.7832H92.7823L95.2534 23.8928C95.8712 20.0343 95.099 16.4845 92.7823 13.8608C90.62 11.237 87.3766 9.69366 83.6698 9.69366C75.9474 9.69366 68.5338 16.0215 67.2983 23.5841ZM74.8662 29.2946C73.6306 27.7512 73.1673 25.8992 73.6306 23.8928C74.4029 19.5713 78.4186 16.0215 82.7431 16.0215C84.7509 16.0215 86.4499 16.7932 87.531 18.1823C88.7666 19.7256 89.2299 21.5777 88.921 23.5841C88.1488 27.9056 84.1331 31.4553 79.8086 31.4553C77.8007 31.4553 76.1018 30.6836 74.8662 29.2946Z" />
    <path d="M131.859 23.5841C131.087 27.4425 132.013 30.9923 134.176 33.6161C136.492 36.2398 139.736 37.7832 143.442 37.7832C146.377 37.7832 149.62 36.7028 152.246 34.8508C153.018 36.7028 154.717 37.7832 156.879 37.7832H157.343L159.814 23.8928C160.432 20.0343 159.505 16.4845 157.343 13.8608C155.181 11.237 151.937 9.69366 148.076 9.69366C140.508 9.69366 133.094 16.0215 131.859 23.5841ZM139.427 29.2946C138.191 27.7512 137.728 25.8992 138.191 23.8928C138.809 19.5713 142.979 16.0215 147.304 16.0215C149.157 16.0215 151.01 16.7932 152.092 18.1823C153.327 19.7256 153.79 21.5777 153.482 23.5841C152.709 27.9056 148.539 31.4553 144.369 31.4553C142.361 31.4553 140.662 30.6836 139.427 29.2946Z" />
    <path d="M31.7745 3.42727e-05C28.6855 3.42727e-05 25.5966 2.46944 25.1332 5.55619L21.8898 23.6137C21.1175 27.9352 17.1019 31.3306 12.7773 31.3306C10.7695 31.3306 9.07057 30.5589 7.83498 29.1699C6.59939 27.7808 6.13605 25.9288 6.59939 23.7681L9.68836 5.86487C9.99726 4.16716 9.68836 2.77811 8.76167 1.69775C7.83498 0.463047 6.44495 3.42727e-05 4.90046 3.42727e-05H4.43712L0.267008 23.6137C-0.505234 27.4722 0.421456 31.0219 2.73818 33.6457C4.90046 36.2694 8.14388 37.6585 11.8506 37.6585C19.5731 37.6585 26.8321 31.4849 28.2222 23.7681L32.3923 3.42727e-05H31.7745Z" />
    <path d="M131.085 3.42727e-05C127.842 3.42727e-05 124.907 2.46944 124.289 5.55619L123.208 12.0384C121.2 10.495 118.729 9.72332 115.949 9.72332C108.227 9.72332 100.813 16.0512 99.5776 23.6137C98.8053 27.4722 99.732 31.0219 101.894 33.6457C104.211 36.2694 107.454 37.6585 111.161 37.6585C114.25 37.6585 117.339 36.7324 120.119 34.8804C120.737 36.5781 122.59 37.6585 124.598 37.6585H125.062L131.703 3.42727e-05H131.085ZM107.146 29.1699C105.91 27.7808 105.447 25.9288 105.91 23.7681C106.528 19.6009 110.698 16.0512 115.022 16.0512C117.03 16.0512 118.729 16.8229 119.81 18.2119C121.046 19.7553 121.509 21.6073 121.2 23.6137C120.428 27.9352 116.258 31.3306 112.088 31.3306C110.08 31.3306 108.381 30.5589 107.146 29.1699Z" />
    <path d="M35.0186 3.42727e-05L33.9375 6.32788H43.8222L38.2621 37.6585H44.5944L50.1546 6.32788H60.0393L61.2749 3.42727e-05H35.0186Z" />
    <path d="M71.1579 5.24576C63.4355 5.24576 56.1764 11.4193 54.7864 19.1362L51.543 37.6567H57.8754L61.1188 19.2905C61.891 14.969 65.9067 11.5736 70.2312 11.5736H70.6946L71.7757 5.24576H71.1579Z" />
  </svg>
)

export function StakeholderCheck() {
  const r = REPLY
  return (
    <>
      <style>{UC_CSS}</style>
      <div className="u9-label uc-label"><i aria-hidden="true" />WHAT I HEARD</div>
      <div className="u9-head uc-head g24 mt96" data-r>
        <h3 className="u9-h2">Checked with people who hear traders every day</h3>
        <p className="u9-body w760">I asked four stakeholders who work closely with new traders every day: three of my UTrada colleagues and a support agent at another broker.</p>
      </div>
      <figure className="uc-card mt96" data-r>
        <div className="uc-src">
          <Logo />
          <figcaption className="uc-who">
            <img src={r.avatar} alt="" width={56} height={56} loading="lazy" decoding="async" />
            <span><b>{r.role}</b><span>{r.org}</span></span>
          </figcaption>
        </div>
        <div className="uc-q">
          <blockquote>“{r.quote}”</blockquote>
          <p>{r.finding}</p>
        </div>
      </figure>
      <NextTest />
    </>
  )
}

export function NextTest() {
  return (
    <div className="uc-next mt96">
      <div className="u9-head g24" data-r>
        <h3 className="u9-h2">Next: test with first-time traders</h3>
        <p className="u9-body w760">My guess: people will still feel nervous before their first deposit. But if the facts are easy to check, they’ll go ahead anyway.</p>
      </div>
      <div className="cmp" data-r>
        {(['today', 'redo'] as const).map(side => (
          <div key={side} className={'side ' + side}>
            <div className="hd">
              <p className="lab"><i aria-hidden="true" />{side === 'today' ? 'Today' : 'Redesign'}</p>
              <h5>{side === 'today' ? 'Hard to check' : 'Easy to check'}</h5>
            </div>
            <ul>
              {TASKS.map(t => (
                <li key={t.k}>
                  <span className="mk" aria-hidden="true">{side === 'today' ? '×' : '✓'}</span>
                  <span className="tx"><span className="k">{t.k}</span><span className="v">{side === 'today' ? t.today : t.redo}</span></span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

const UC_CSS = `
/* the page's own label, head and older Fogg plan block in UTradaV9's Test section are replaced by this file */
.u9 section[data-chapter="Test"] > .u9-w > .u9-label:not(.uc-label),
.u9 section[data-chapter="Test"] > .u9-w > .u9-head:not(.uc-head),
.u9 section[data-chapter="Test"] .u9-check { display: none; }

/* quote card (2331:555): dark, 80 padding, source 400 | 80 | quote */
.u9 .uc-card { display: flex; gap: 80px; min-height: 480px; box-sizing: border-box; margin-left: 0; margin-right: 0; margin-bottom: 0; padding: 80px; background: #13121A; color: #FFFFFF; }
.u9 .uc-src { flex: none; width: 400px; display: flex; flex-direction: column; justify-content: space-between; gap: 48px; }
.u9 .uc-logo { display: block; width: 160px; height: auto; }
.u9 .uc-who { display: flex; align-items: center; gap: 16px; }
.u9 .uc-who img { flex: none; display: block; width: 56px; height: 56px; object-fit: cover; }
.u9 .uc-who span { display: flex; flex-direction: column; }
.u9 .uc-who b { font-size: 18px; font-weight: 600; line-height: 28px; }
.u9 .uc-who span span { font-size: 16px; line-height: 24px; color: rgba(255, 255, 255, .6); }
.u9 .uc-q { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 32px; }
.u9 .uc-q blockquote { margin: 0; font-size: 40px; font-weight: 400; line-height: 52px; letter-spacing: -1px; color: #FFFFFF; }
.u9 .uc-q p { font-size: 20px; line-height: 32px; color: rgba(255, 255, 255, .64); }

/* next test (2331:560): Today vs Redesign */
.u9 .uc-next { display: flex; flex-direction: column; gap: 32px; }
.u9 .uc-next .cmp { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; }
.u9 .uc-next .side { display: flex; flex-direction: column; gap: 32px; padding: 40px; }
.u9 .uc-next .today { background: #EDEDF0; }
.u9 .uc-next .redo { background: #F0EBFC; }
.u9 .uc-next .hd { display: flex; flex-direction: column; gap: 8px; }
.u9 .uc-next .lab { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; line-height: 24px; color: var(--mute); }
.u9 .uc-next .lab i { flex: none; width: 10px; height: 10px; background: var(--mute); }
.u9 .uc-next .redo .lab { color: var(--pu); } .u9 .uc-next .redo .lab i { background: var(--pu); }
.u9 .uc-next h5 { margin: 0; font-size: 32px; font-weight: 700; line-height: 40px; color: var(--mute); }
.u9 .uc-next .redo h5 { color: var(--ink); }
.u9 .uc-next ul { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; list-style: none; }
.u9 .uc-next li { display: flex; gap: 16px; padding: 24px; background: #FFFFFF; }
.u9 .uc-next .mk { flex: none; width: 16px; font-size: 18px; font-weight: 700; line-height: 28px; color: #DE3345; }
.u9 .uc-next .redo .mk { color: var(--pu); }
.u9 .uc-next .tx { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.u9 .uc-next .k { font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: 0; color: var(--mute); }
.u9 .uc-next .v { font-size: 18px; line-height: 28px; color: var(--mute); }
.u9 .uc-next .redo .v { color: var(--ink); }

@media (max-width: 1279px) {
  .u9 .uc-card { gap: 64px; padding: 64px; }
  .u9 .uc-src { width: 280px; }
  .u9 .uc-q blockquote { font-size: 36px; line-height: 48px; }
}
@media (max-width: 1023px) {
  .u9 .uc-card { flex-direction: column; gap: 48px; min-height: 0; padding: 48px; }
  .u9 .uc-src { width: auto; gap: 32px; }
  .u9 .uc-next .cmp { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 600px) {
  .u9 .uc-card { padding: 24px; gap: 32px; }
  .u9 .uc-logo { width: 120px; }
  .u9 .uc-q blockquote { font-size: 28px; line-height: 36px; letter-spacing: -0.5px; }
  .u9 .uc-q p { font-size: 18px; line-height: 28px; }
  .u9 .uc-next .side { padding: 24px; }
  .u9 .uc-next h5 { font-size: 24px; line-height: 32px; }
}
`
