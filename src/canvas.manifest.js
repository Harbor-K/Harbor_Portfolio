export const manifest = {
  screens: {
    scr_iw6c8l: { name: "Intro", route: "/", position: {"x":160,"y":220} },
    scr_fz4gn2: { name: "01 Selected work", route: "/", state: {"section":"work"}, position: {"x":1560,"y":220} },
    scr_ct6ftr: { name: "CTA & footer", route: "/", state: {"section":"contact"}, position: {"x":2960,"y":220} },
    scr_abpage: { name: "About me", route: "/", state: {"page":"about"}, position: {"x":160,"y":1600} },
    scr_tbcase: { name: "Trust Bank case study", route: "/", state: {"page":"trust-bank"}, position: {"x":160,"y":2980} },
    scr_gccase: { name: "GameCove case study", route: "/", state: {"page":"gamecove"}, position: {"x":1560,"y":2980} },
  },
  sections: {
    sec_dbckwq: { name: "Main page", x: 0, y: 0, width: 4320, height: 1180 },
    sec_landng: { name: "Landing pages", x: 0, y: 1380, width: 1520, height: 1180 },
    sec_tbcase: { name: "Case studies", x: 0, y: 2760, width: 2920, height: 1180 },
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
    ] },
  ],
}
