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
// The line cursor (cursor.tsx) runs on every page. The [SCROLL] cursor on the case-study intros was removed at Harbor's
// request: their full-screen videos now move into place on their own.
const fixOld = () => {
  if (window.location.hash === "#/projects") {
    history.replaceState(null, "", "#projects");
  }
  return window.location.hash;
};

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
    if (page !== "main") {
      window.scrollTo(0, 0);
      // Trust Bank's "Next case study" card points at the other portfolio's GameCove; keep it on this site
      if (page === "tb") {
        const raf = requestAnimationFrame(() => {
          document.querySelectorAll<HTMLAnchorElement>('a[href$="magicpatterns.app/#/gamecove"]').forEach(a => a.setAttribute("href", "#/gamecove"));
        });
        return () => cancelAnimationFrame(raf);
      }
      return;
    }
    // coming back to a section of the main page: jump to that section (top for #top / no hash)
    const id = window.location.hash.slice(1);
    if (!id || id.startsWith("/") || id === "top") { window.scrollTo(0, 0); return; }
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
