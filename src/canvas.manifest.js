// Screens view (v119, Harbor): every screen is a 1920×1080 desktop frame (Harbor's Figma frames are 1920 wide),
// 120px apart, sections 160px in and 200px apart. Main page: Intro, Selected work, Footer. Landing pages: About me.
// Case studies: Trust Bank, GameCove, UTrada, ETO Markets.
export const manifest = {
  screens: {
    scr_iw6c8l: { name: "Intro", route: "/", width: 1920, height: 1080, position: {"x":160,"y":220} },
    scr_fz4gn2: { name: "01 Selected work", route: "/", state: {"section":"work"}, width: 1920, height: 1080, position: {"x":2200,"y":220} },
    scr_ct6ftr: { name: "Footer", route: "/", state: {"section":"footer"}, width: 1920, height: 1080, position: {"x":4240,"y":220} },
    scr_abpage: { name: "About me", route: "/", state: {"page":"about"}, width: 1920, height: 1080, position: {"x":160,"y":1880} },
    scr_tbcase: { name: "Trust Bank case study", route: "/", state: {"page":"trust-bank"}, width: 1920, height: 1080, position: {"x":160,"y":3540} },
    scr_gccase: { name: "GameCove case study", route: "/", state: {"page":"gamecove"}, width: 1920, height: 1080, position: {"x":2200,"y":3540} },
    scr_utcase: { name: "UTrada case study", route: "/", state: {"page":"utrada"}, width: 1920, height: 1080, position: {"x":4240,"y":3540} },
    scr_etocase: { name: "ETO Markets case study", route: "/", state: {"page":"eto-markets"}, width: 1920, height: 1080, position: {"x":6280,"y":3540} },
  },
  sections: {
    sec_dbckwq: { name: "Main page", x: 0, y: 0, width: 6320, height: 1460 },
    sec_landng: { name: "Landing pages", x: 0, y: 1660, width: 2240, height: 1460 },
    sec_tbcase: { name: "Case studies", x: 0, y: 3320, width: 8360, height: 1460 },
  },
  layers: [
    { kind: "section", id: "sec_dbckwq", children: [
      { kind: "screen", id: "scr_iw6c8l" },
      { kind: "screen", id: "scr_fz4gn2" },
      { kind: "screen", id: "scr_ct6ftr" },
    ] },
    { kind: "section", id: "sec_landng", children: [
      { kind: "screen", id: "scr_abpage" },
    ] },
    { kind: "section", id: "sec_tbcase", children: [
      { kind: "screen", id: "scr_tbcase" },
      { kind: "screen", id: "scr_gccase" },
      { kind: "screen", id: "scr_utcase" },
      { kind: "screen", id: "scr_etocase" },
    ] },
  ],
}
