export const manifest = {
  screens: {
    scr_iw6c8l: { name: "Intro", route: "/", position: {"x":160,"y":-316.35}, width: 1920, height: 1080 },
    scr_fz4gn2: { name: "01 Selected work", route: "/", state: {"section":"work"}, position: {"x":2200,"y":-316.35}, width: 1920, height: 1080 },
    scr_ct6ftr: { name: "Footer", route: "/", state: {"section":"footer"}, position: {"x":4240,"y":-316.35}, width: 1920, height: 1080 },
    scr_abpage: { name: "About me", route: "/", state: {"page":"about"}, position: {"x":168.92,"y":1792.64}, width: 1920, height: 1080 },
    scr_tbcase: { name: "Trust Bank case study", route: "/", state: {"page":"trust-bank"}, position: {"x":165.88,"y":4036.74}, width: 1920, height: 1080 },
    scr_gccase: { name: "GameCove case study", route: "/", state: {"page":"gamecove"}, position: {"x":2205.88,"y":4036.74}, width: 1920, height: 1080 },
    scr_utcase: { name: "UTrada case study", route: "/", state: {"page":"utrada"}, position: {"x":4245.88,"y":4036.74}, width: 1920, height: 1080 },
    scr_etocase: { name: "ETO Markets case study", route: "/", state: {"page":"eto-markets"}, position: {"x":6285.88,"y":4036.74}, width: 1920, height: 1080 },
  },
  sections: {
    sec_dbckwq: { name: "Main page", x: 0, y: -536.35, width: 6320, height: 1460 },
    sec_landng: { name: "Landing pages", x: 8.92, y: 1572.64, width: 2240, height: 1460 },
    sec_tbcase: { name: "Case studies", x: 5.88, y: 3816.74, width: 8360, height: 1460 },
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
