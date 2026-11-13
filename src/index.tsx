import "./index.css";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Home } from "./Home";
import { TrustBank } from "./TrustBank";
import { GameCove } from "./GameCove";
import { UTrada, EtoMarkets } from "./UTrada";
import { AboutPage } from "./Pages";
import { CursorTrail } from "./cursor";
import { Footer } from "./Footer";
import { useTabMeta } from "./tabMeta";
import { useScreenInit } from "./useScreenInit.js";

// Pages: the main page (Home.tsx); "#/about" the About page; "#/trust-bank", "#/gamecove", "#/utrada" and (v117)
// "#/eto-markets" the case studies.
// Every page has the same header (SiteHeaderB.tsx) and, since v79, the same footer — Harbor's Figma footer (Footer.tsx),
// rendered here under whichever page is open (the main page included).
// The line cursor (cursor.tsx) runs on every page — since v81 the main page too (Harbor, Nov 9). It is mounted once here
// and stays mounted across page changes, so it never doubles up or restarts.
// Browser tab (v83): Harbor-mark icon, a title per page, and "Still here?" while the tab is in the background (tabMeta.ts).
// Any other hash (#projects, #contact…) is a section of the main page. An old "#/projects" link lands on Selected work.
// Opening a page always jumps to its top instantly (not the site's smooth scroll), so a case study's full-screen intro
// starts from the top even when you arrive from the bottom of another page.
// Screens view (v119): the "Footer" screen ({ section: 'footer' }) opens the main page scrolled to the footer.
const fixOld = () => {
  if (window.location.hash === "#/projects") {
    history.replaceState(null, "", "#projects");
  }
  return window.location.hash;
};
const jumpTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });

function Root() {
  const screen = useScreenInit() as { page?: string; section?: string } | undefined;
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
  const isETO = is("#/eto-markets", "eto-markets");
  const isAB = is("#/about", "about");
  const page = isTB ? "tb" : isGC ? "gc" : isUT ? "ut" : isETO ? "eto" : isAB ? "ab" : "main";
  useTabMeta(page);

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

  // Screens view: the Footer screen
  useEffect(() => {
    if (screen?.section !== "footer") return;
    const t = window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>("footer.ft");
      if (el) window.scrollTo({ top: el.offsetTop, behavior: "instant" as ScrollBehavior });
    }, 400);
    return () => clearTimeout(t);
  }, [screen]);

  let view: React.ReactNode;
  if (page === "main") view = <Home key="main" />;
  else if (page === "tb") view = <TrustBank key="tb" />;
  else if (page === "gc") view = <GameCove key="gc" />;
  else if (page === "ut") view = <UTrada key="ut" />;
  else if (page === "eto") view = <EtoMarkets key="eto" />;
  else view = <AboutPage key="ab" />;

  return (
    <>
      <CursorTrail />
      {view}
      <Footer key={`footer-${page}`} />
    </>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<Root />);
}
