import React from 'react';

/**
 * The round "Scroll" button that used to sit at the bottom of the full-screen hero was removed at Harbor's request.
 * The scroll cue is now the mouse cursor itself: a bracketed [SCROLL] label (see cursor.tsx, `scrollLabel`).
 * These stubs stay so TrustHero.tsx keeps compiling unchanged; they render and do nothing.
 */

export function ScrollHint(_: { hintRef: React.RefObject<HTMLButtonElement> }) {
  return null;
}

export function setHint(_el: HTMLElement | null, _p: number) {}
