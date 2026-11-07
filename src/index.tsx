import "./index.css";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { TrustBank } from "./TrustBank";
import { GameCove } from "./GameCove";
import { UTrada } from "./UTrada";
import { AboutPage } from "./Pages";
import { CursorTrail } from "./cursor";
import { useScreenInit } from "./useScreenInit.js";

// Hash routes: "#/about" is the About page, "#/trust-bank", "#/gamecove" and "#/utrada" open the case studies;
// any other hash (#projects, #contact…) is a section of the main page.
// The separate Projects page was removed (the header's Projects dropdown replaces it): an old "#/projects" link
// lands on the Selected work section of the main page.
// The line cursor (cursor.tsx) runs on every page.
// Opening a page always jumps to its top instantly (not the site's smooth scroll), so a case study's full-screen intro
// starts from the top even when you arrive from the bottom of another page.
const fixOld = () => {
  if (window.location.hash === "#/projects") {
    history.replaceState(null, "", "#projects");
  }
  return window.location.hash;
};
const jumpTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });

function Root() {
  const screen = useScreenInit() as { page?: string } | undefined;
  const [hash, setHash] = useState(fixOld);
  useEffect(() => {
    const on = () => setHash(fixOld());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const is = (route: string, page: string) => hash.startsWith(route) || (!hash.startsWith("#/") && screen?.page === page);
  const isTB = is("#/trust-bank", "trust-bank");
  const isGC = is("#/gamecove", "gamecove");
  const isUT = is("#/utrada", "utrada");
  const isAB = is("#/about", "about");
  const page = isTB ? "tb" : isGC ? "gc" : isUT ? "ut" : isAB ? "ab" : "main";

  useEffect(() => {
    if (page !== "main") { jumpTop(); return; }
    // coming back to a section of the main page: jump to that section (top for #top / no hash)
    const id = window.location.hash.slice(1);
    if (!id || id.startsWith("/") || id === "top") { jumpTop(); return; }
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) window.scrollTo({ top: el.offsetTop - 64, behavior: "instant" as ScrollBehavior });
    });
    return () => cancelAnimationFrame(raf);
  }, [page, hash]);

  let view: React.ReactNode;
  if (page === "tb") view = <TrustBank key="tb" />;
  else if (page === "gc") view = <GameCove key="gc" />;
  else if (page === "ut") view = <UTrada key="ut" />;
  else if (page === "ab") view = <AboutPage key="ab" />;
  else view = <App key="main" />;

  return (
    <>
      <CursorTrail />
      {view}
    </>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<Root />);
}
