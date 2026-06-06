// Datamodell for byggene. Både 2D-plantegningen og 3D-modellen leser
// herfra, så endrer du et tall her, oppdaterer begge visningene seg.
//
// Koordinatsystem (alt i meter):
//   x = bredde  (mot øst / til høyre)
//   z = dybde   (mot sør / nedover i plantegningen)
//   y = høyde   (oppover)
// Posisjonen (x, z) er hjørnet til bygget.

export type Boks = {
  navn: string;
  bredde: number; // meter langs x
  dybde: number; // meter langs z
  hoyde: number; // meter langs y (veggtopp)
  x: number; // posisjon, hjørne
  z: number; // posisjon, hjørne
  farge: string;
  inneFarge?: string; // egen farge for innvendig side av veggene
  gulvFarge?: string; // egen farge for gulvet i innevisning (åpen topp)
  tak?: {
    vinkel: number; // grader fra horisontal
    retning: "langs" | "tvers"; // "langs" = møne langs x (bredden)
    utstikk?: number; // takutstikk / raft i meter (samme på alle sider)
  };
  innhugg?: {
    // Et 2D-rektangel som er klipt vekk fra grunnflaten — typisk et åpent,
    // overbygget inngangsparti.
    bredde: number;
    dybde: number;
    hjorne: "front-venstre" | "front-hoyre";
  };
  apninger?: Apning[];
};

// Et vindu eller en dør på en vegg. avstand er meter fra anker-enden av
// veggen, bunn er høyden fra gulvet til underkanten (dører ≈ 0).
export type Apning = {
  type: "vindu" | "dor" | "glassdor";
  vegg:
    | "front"
    | "bak"
    | "venstre"
    | "hoyre"
    | "innhugg-bak"
    | "innhugg-side";
  avstand: number;
  bredde: number;
  hoyde: number;
  bunn: number;
  farge?: string; // overstyrer standardfargen for typen
  sprosser?: boolean; // default true; sett false for fast/enkel dør uten kryss
};

// Geometri-info for én vegg — brukes både i 2D og 3D for å plassere
// vinduer/dører. anker = startpunkt i xz, retning = enhetsvektor langs
// veggen, normal = utadpekende enhetsvektor.
export type VeggInfo = {
  anker: [number, number];
  retning: [number, number];
  normal: [number, number];
  lengde: number;
};

export function veggInfo(boks: Boks, vegg: Apning["vegg"]): VeggInfo | null {
  const { x, z, bredde: b, dybde: d, innhugg } = boks;
  const venstre = innhugg?.hjorne === "front-venstre";
  const hoyre = innhugg?.hjorne === "front-hoyre";

  switch (vegg) {
    case "bak":
      return { anker: [x, z], retning: [1, 0], normal: [0, -1], lengde: b };
    case "front":
      if (hoyre && innhugg) {
        return {
          anker: [x, z + d],
          retning: [1, 0],
          normal: [0, 1],
          lengde: b - innhugg.bredde,
        };
      }
      if (venstre && innhugg) {
        return {
          anker: [x + innhugg.bredde, z + d],
          retning: [1, 0],
          normal: [0, 1],
          lengde: b - innhugg.bredde,
        };
      }
      return { anker: [x, z + d], retning: [1, 0], normal: [0, 1], lengde: b };
    case "venstre":
      if (venstre && innhugg) {
        return {
          anker: [x, z],
          retning: [0, 1],
          normal: [-1, 0],
          lengde: d - innhugg.dybde,
        };
      }
      return { anker: [x, z], retning: [0, 1], normal: [-1, 0], lengde: d };
    case "hoyre":
      if (hoyre && innhugg) {
        return {
          anker: [x + b, z],
          retning: [0, 1],
          normal: [1, 0],
          lengde: d - innhugg.dybde,
        };
      }
      return {
        anker: [x + b, z],
        retning: [0, 1],
        normal: [1, 0],
        lengde: d,
      };
    case "innhugg-bak":
      if (!innhugg) return null;
      return {
        anker: hoyre
          ? [x + b - innhugg.bredde, z + d - innhugg.dybde]
          : [x, z + d - innhugg.dybde],
        retning: [1, 0],
        normal: [0, 1],
        lengde: innhugg.bredde,
      };
    case "innhugg-side":
      if (!innhugg) return null;
      return {
        anker: hoyre
          ? [x + b - innhugg.bredde, z + d - innhugg.dybde]
          : [x + innhugg.bredde, z + d - innhugg.dybde],
        retning: [0, 1],
        normal: hoyre ? [-1, 0] : [1, 0],
        lengde: innhugg.dybde,
      };
  }
}

// En levegg er et veggsegment som går fra ett punkt til et annet. Brukes
// både til fritt-stående leveger (utenfor bygg) og innervegger (mellom rom).
// Kan ha et valgfritt vindu og/eller en dør.
export type Levegg = {
  navn: string;
  fra: { x: number; z: number };
  til: { x: number; z: number };
  hoyde: number;
  tykkelse: number;
  farge: string;
  vindu?: {
    bredde: number;
    hoyde: number;
    bunn: number;
    senterAvstand: number; // m fra fra-enden langs leveggen
  };
  dor?: {
    type: "dor" | "glassdor";
    bredde: number;
    hoyde: number;
    bunn: number;
    senterAvstand: number;
  };
};

// En terrasse er ett eller flere rektangler ved bakken, alle på samme
// høyde. Et "trappetrinn" mellom terrasser kommer av at de har ulik toppHoyde.
export type Terrasse = {
  navn: string;
  omrader: Array<{ x: number; z: number; bredde: number; dybde: number }>;
  toppHoyde: number; // y-koord for terrassegulvets overflate (= hvor du står)
  farge: string;
};

// Eksisterende hytte. Endre tallene så de matcher din egen hytte.
export const hytte: Boks = {
  navn: "Eksisterende hytte",
  bredde: 13,
  dybde: 6,
  // Veggtopp på y=2.74 → underkant raft ≈ 2.55 → 2.25 m fra terrassegulvet (0.3).
  hoyde: 2.74,
  x: 0,
  z: 0,
  farge: "#2b2826", // dempet sort — som på fotoet
  tak: { vinkel: 25, retning: "langs", utstikk: 0.4 },
  innhugg: { bredde: 2, dybde: 2, hjorne: "front-hoyre" },
  apninger: [
    // Alle vinduer har overkant på y = 2.30. Front-veggen er 11 m
    // (13 m hytte minus 2 m innhugg) — avstand måles fra venstre hjørne.
    // Glass-terrassedør helt til venstre — går ned til terrassegulvet (bunn 0.3)
    // med samme overkant som vinduene (top 2.30 → hoyde 2.00).
    { type: "glassdor", vegg: "front", avstand: 0.6, bredde: 0.8, hoyde: 2.0, bunn: 0.3 },
    // Stort stuevindu, delt i to like halvdeler — går litt lengre ned
    // mot terrassegulvet (bunn 0.70).
    { type: "vindu", vegg: "front", avstand: 1.8, bredde: 2.5, hoyde: 1.6, bunn: 0.7 },
    { type: "vindu", vegg: "front", avstand: 4.6, bredde: 2.5, hoyde: 1.6, bunn: 0.7 },
    // Smalere vindu mot inngangspartiet
    { type: "vindu", vegg: "front", avstand: 8.4, bredde: 1.2, hoyde: 1.1, bunn: 1.2 },
    // Inngangsdør på den indre bakveggen av innhugget — bunn på terrassenivå
    // så den ikke stikker under gulvet i 3D-visningen. Oker-gul farge.
    { type: "dor", vegg: "innhugg-bak", avstand: 0.55, bredde: 0.9, hoyde: 2.05, bunn: 0.3, farge: "#c89a3a" },
    // 80×80 vindu på høyre gavelvegg, rett rundt hjørnet (z=4) fra den gule
    // inngangsdøra. Sitter på den frie delen av gavlen, utenfor tilbygget
    // (som slutter ved z=2.7). avstand måles fra bakkanten (z=0).
    // Bunn 1.5 gir overkant 2.30 — samme som de andre vinduene på hytta.
    { type: "vindu", vegg: "hoyre", avstand: 3.0, bredde: 0.8, hoyde: 0.8, bunn: 1.5 },
  ],
};

// Det nye tilbygget. Lek med målene og se 2D- og 3D-visningen endre seg.
export const tilbygg: Boks = {
  navn: "Nytt tilbygg",
  bredde: 5.4,
  dybde: 2.7,
  hoyde: 2.6, // 20 cm lavere enn før
  x: 13, // vegg-i-vegg på høyre side av hytta
  z: 0, // bakkanten flukter med hyttas bakkant (oppe på tegningen)
  farge: "#2b2826", // samme dempete sort som hovedhytta
  tak: { vinkel: 25, retning: "langs", utstikk: 0.4 },
  apninger: [
    // Glass-terrassedør på fronten inn til Relax, plassert på høyre side av
    // rommet (mot innerveggen ved x=2.2). Samme størrelse som hyttas
    // terrassedør, bunn på tilbygg-terrassens nivå.
    { type: "glassdor", vegg: "front", avstand: 1.1, bredde: 0.8, hoyde: 2.0, bunn: 0.12 },
    // Liggende vindu i badstuen — 160 × 80 cm, midtstilt i badstu-rommet
    // (x=2.2–4.2 → vindu x=2.4–4.0), 20 cm til hver vegg-linje.
    // Topp på y=2.12 (flukter med terrassedøra), bunn 1.32 → høyde 0.8.
    { type: "vindu", vegg: "front", avstand: 2.4, bredde: 1.6, hoyde: 0.8, bunn: 1.32 },
    // Ytterdør til smøreboden, sentrert i smørebodens 1,2 m (avstand 4,2–5,4).
    // Fast boddør i tre, dempet sort som veggen — uten sprosser/kryss.
    { type: "dor", vegg: "front", avstand: 4.45, bredde: 0.7, hoyde: 2.05, bunn: 0.12, farge: "#2b2826", sprosser: false },
  ],
};

// Alle bygg samlet — legg gjerne til flere (bod ...).
export const alleBygg: Boks[] = [hytte, tilbygg];

// Terrasser. Hytteterrassen dekker hele fronten + innhugget (samme nivå).
// Tilbygg-terrassen ligger ett trinn (18 cm) lavere.
export const terrasser: Terrasse[] = [
  {
    navn: "Hytte-terrasse",
    omrader: [
      { x: 0, z: 6, bredde: 13, dybde: 1.7 }, // hele fronten av hytta
      { x: 11, z: 4, bredde: 2, dybde: 2 }, // gulvet inne i innhugget
    ],
    toppHoyde: 0.3,
    farge: "#8b6f47",
  },
  {
    navn: "Tilbygg-terrasse",
    // 2,5 m ut fra hyttas kortvegg (x=12 → 14,5), og helt fram til samme
    // ytterkant som hytteterrassen (z=8) → 5,3 m dyp.
    // I tillegg en 1 m dyp utstikker langs tilbyggets front fra x=16
    // til tilbyggets høyre kant (x=18.4), så man kommer fram til
    // smørebod-døra (x=17.45–18.15).
    omrader: [
      { x: 13, z: 2.7, bredde: 3.0, dybde: 5.0 },
      { x: 16, z: 2.7, bredde: 2.4, dybde: 1.0 },
    ],
    toppHoyde: 0.12, // 18 cm lavere enn hytteterrassen — ett trappetrinn
    farge: "#8b6f47", // samme farge som hytte-terrasse
  },
];

// Gjerde — vertikal vegg-segment på terrassen, typisk 80 cm høyt.
export type Gjerde = {
  navn: string;
  fra: { x: number; z: number };
  til: { x: number; z: number };
  hoyde: number;
  bunn: number; // y-koord for nederkant (= terrassens toppHoyde)
  tykkelse: number;
  farge: string;
};

export const gjerder: Gjerde[] = [
  // Rundt hytte-terrassen — front og venstre kortside
  {
    navn: "Hytte-terrasse front",
    fra: { x: 0, z: 7.7 },
    til: { x: 13, z: 7.7 },
    hoyde: 0.8,
    bunn: 0.3,
    tykkelse: 0.03,
    farge: "#a08054",
  },
  {
    navn: "Hytte-terrasse venstre",
    fra: { x: 0, z: 6 },
    til: { x: 0, z: 7.7 },
    hoyde: 0.8,
    bunn: 0.3,
    tykkelse: 0.03,
    farge: "#a08054",
  },
  // Rundt tilbygg-terrassen — front og høyre kortside
  {
    navn: "Tilbygg-terrasse front",
    fra: { x: 13, z: 7.7 },
    til: { x: 16, z: 7.7 },
    hoyde: 0.8,
    bunn: 0.12,
    tykkelse: 0.03,
    farge: "#a08054",
  },
  // Høyre gjerde delt i to — trapp-åpning z=3.95–5.45 (1 m nærmere tilbygget).
  // Back-segmentet starter ved utstikkerens front (z=3.7) — overgangen
  // fra hovedterrasse til utstikker (z=2.7–3.7) er åpen.
  {
    navn: "Tilbygg-terrasse høyre back",
    fra: { x: 16, z: 3.7 },
    til: { x: 16, z: 3.95 },
    hoyde: 0.8,
    bunn: 0.12,
    tykkelse: 0.03,
    farge: "#a08054",
  },
  {
    navn: "Tilbygg-terrasse høyre front",
    fra: { x: 16, z: 5.45 },
    til: { x: 16, z: 7.7 },
    hoyde: 0.8,
    bunn: 0.12,
    tykkelse: 0.03,
    farge: "#a08054",
  },
  // Gjerder rundt utstikkeren — front (mot terrenget) og høyre kortside.
  {
    navn: "Utstikker front",
    fra: { x: 16, z: 3.7 },
    til: { x: 18.4, z: 3.7 },
    hoyde: 0.8,
    bunn: 0.12,
    tykkelse: 0.03,
    farge: "#a08054",
  },
  {
    navn: "Utstikker høyre",
    fra: { x: 18.4, z: 2.7 },
    til: { x: 18.4, z: 3.7 },
    hoyde: 0.8,
    bunn: 0.12,
    tykkelse: 0.03,
    farge: "#a08054",
  },
];

// Trapp ned fra terrasse til bakken. Hvert trinn er en boks.
export type Trapp = {
  navn: string;
  trinn: Array<{
    x: number;
    z: number;
    bredde: number;
    dybde: number;
    hoyde: number;
  }>;
  farge: string;
};

export const trapper: Trapp[] = [
  {
    navn: "Trapp ned fra tilbygg-terrasse",
    // Går utover i +x retning fra terrassekanten ved x=16, 1 m nærmere
    // tilbygget enn før (sentrum z=4.7, ca 3 m fra ytterkanten på z=7.7).
    // Bredt 1,5 m i z-retning.
    trinn: [
      { x: 16, z: 3.95, bredde: 0.3, dybde: 1.5, hoyde: 0.08 },
      { x: 16.3, z: 3.95, bredde: 0.3, dybde: 1.5, hoyde: 0.04 },
    ],
    farge: "#8b6f47",
  },
];

// Levegger — fritt-stående veggsegmenter. Brukes f.eks. for å skjerme
// inngangspartiet fra siden.
export const levegger: Levegg[] = [
  {
    navn: "Levegg ved inngang",
    fra: { x: 11, z: 6 }, // der hyttas frontvegg slutter (innhugget starter)
    til: { x: 12, z: 6 }, // 1 m ut langs fronten mot stolpen ved (13, 6)
    hoyde: 2.74, // samme som hytta — går fra terrassen til veggtoppen
    tykkelse: 0.12,
    farge: "#2b2826", // dempet sort, som hytta
    vindu: { bredde: 0.8, hoyde: 1.1, bunn: 1.2, senterAvstand: 0.5 },
  },
];

// Et rom inni et bygg — kun brukt for å vise romnavn og areal i 2D.
// Koordinater er i samme system som byggene (meter, hjørnet).
export type Rom = {
  navn: string;
  x: number;
  z: number;
  bredde: number;
  dybde: number;
  // Flytter 2D-etiketten opp/ned (meter langs z) når den ellers kolliderer
  // med møbler i rommet. Negativ = opp, positiv = ned.
  etikettDz?: number;
};

// Et innendørs møbel — en enkel boks (eller sylinder) med posisjon,
// dimensjoner og farge. Brukes til benker, ovner, pipe osv. i innevisningen.
// bunn = y-koord for nederkanten (default 0 = på gulvet).
// form = "sylinder" gir en sylinder med diameter = min(bredde, dybde);
// default er en rektangulær boks.
export type Mobel = {
  navn: string;
  x: number;
  z: number;
  bredde: number; // langs x
  dybde: number; // langs z
  hoyde: number; // langs y
  bunn?: number;
  farge: string;
  form?: "boks" | "sylinder";
  metall?: boolean; // gir blank/metallisk overflate i 3D
  // Flytter 2D-etiketten opp/ned (meter langs z) når to møbler ligger oppå
  // hverandre og navnene ellers kolliderer. Negativ = opp, positiv = ned.
  etikettDz?: number;
};

// ----- Design-pakker -----
// Lar oss vise flere varianter av samme grunntegning. Hver design er en
// komplett pakke av bygg, terrasser, levegger, gjerder og trapper.
export type Design = {
  navn: string;
  beskrivelse: string;
  alleBygg: Boks[];
  terrasser: Terrasse[];
  levegger: Levegg[];
  gjerder: Gjerde[];
  trapper: Trapp[];
  rom?: Rom[];
  mobler?: Mobel[];
};

// Pipe på hovedhytta — firkantet, sort. Sentrert midt mellom de to store
// stuevinduene (sentre på x=3,05 og x=5,85 → x=4,45) og 4 m inn fra
// fronten (z=6 − 4 = 2). Stikker over mønet (4,14 m) så den er synlig
// fra utsiden.
const HYTTE_PIPE_BREDDE = 0.4;
const HYTTE_PIPE_X = 4.45;
const HYTTE_PIPE_Z = 2;

export const hyttePipe: Mobel = {
  navn: "Pipe",
  x: HYTTE_PIPE_X - HYTTE_PIPE_BREDDE / 2,
  z: HYTTE_PIPE_Z - HYTTE_PIPE_BREDDE / 2,
  bredde: HYTTE_PIPE_BREDDE,
  dybde: HYTTE_PIPE_BREDDE,
  hoyde: 4.8, // topp på y=4,8 → ca 0,66 m over mønet
  bunn: 0,
  farge: "#1a1a1a",
};

// Design 1: original — det vi har bygget opp så langt.
export const design1: Design = {
  navn: "Original",
  beskrivelse: "Tilbygget vegg-i-vegg med hyttas bakkant",
  alleBygg,
  terrasser,
  levegger,
  gjerder,
  trapper,
  mobler: [hyttePipe],
};

// Design 2: tilbygget skjøvet 1,6 m bakover, så terrassen foran blir
// 1,6 m dypere. Trappens posisjon er den samme (2 m fra ytterkant).
const TILBYGG_SHIFT = 1.6; // meter bakover
const tilbyggBakover: Boks = { ...tilbygg, z: tilbygg.z - TILBYGG_SHIFT };
const tilbyggFrontZBakover = tilbyggBakover.z + tilbyggBakover.dybde; // = 1.1

// Utstikkeren for å nå smørebod-døra følger med — fronten flytter seg
// fra z=2.7 til z=1.1, og utstikkeren legges 1 m ut foran tilbyggets front
// (z=1.1 → 2.1) i samme x-rekkevidde (16 → 18.4).
const UTSTIKKER_DYBDE = 1.0;
const utstikkerFrontZBakover = tilbyggFrontZBakover + UTSTIKKER_DYBDE; // 2.1

const tilbyggTerrasseStorre: Terrasse = {
  navn: "Tilbygg-terrasse (større)",
  omrader: [
    {
      x: 13,
      z: tilbyggFrontZBakover, // 1.1
      bredde: 3.0,
      dybde: 7.7 - tilbyggFrontZBakover, // 6.6
    },
    {
      x: 16,
      z: tilbyggFrontZBakover, // 1.1
      bredde: 2.4,
      dybde: UTSTIKKER_DYBDE, // til z=2.1
    },
  ],
  toppHoyde: 0.12,
  farge: "#8b6f47",
};

// Gjerder må flyttes i takt med tilbygget. "Tilbygg-terrasse høyre back"
// går fra utstikkerens front (z=2.1) til trapp-åpningen (z=3.95).
// Utstikker-gjerdene flyttes til de nye z-koordinatene.
const gjerderBakover: Gjerde[] = gjerder.map((g) => {
  if (g.navn === "Tilbygg-terrasse høyre back") {
    return { ...g, fra: { x: g.fra.x, z: utstikkerFrontZBakover } };
  }
  if (g.navn === "Utstikker front") {
    return {
      ...g,
      fra: { x: g.fra.x, z: utstikkerFrontZBakover },
      til: { x: g.til.x, z: utstikkerFrontZBakover },
    };
  }
  if (g.navn === "Utstikker høyre") {
    return {
      ...g,
      fra: { x: g.fra.x, z: tilbyggFrontZBakover },
      til: { x: g.til.x, z: utstikkerFrontZBakover },
    };
  }
  return g;
});

export const design2: Design = {
  navn: "Tilbygg 1,6 m bakover",
  beskrivelse:
    "Tilbygget skjøvet 1,6 m bakover så terrassen foran blir 1,6 m dypere",
  alleBygg: [hytte, tilbyggBakover],
  terrasser: [terrasser[0], tilbyggTerrasseStorre],
  levegger,
  gjerder: gjerderBakover,
  trapper, // samme posisjon som design 1
  mobler: [hyttePipe],
};

export const alleDesigner: Design[] = [design1, design2];

// ----- Innvendig visning av tilbygget -----
// En kopi av tilbygget med lyse vegger og grått gulv. Plassert i (0,0) slik
// at 2D-tegningen zoomer naturlig inn på selve tilbygget.
const PANEL_FARGE = "#e8dcc4"; // lyst kremfarget panel
const GULV_FARGE = "#9a9a9a"; // medium grått gulv
const INNERVEGG_TYKKELSE = 0.12;

const tilbyggInterior: Boks = {
  ...tilbygg,
  x: 0,
  z: 0,
  // farge = utvendig (dempet sort som hytta), inneFarge = innvendig (lyst panel)
  inneFarge: PANEL_FARGE,
  gulvFarge: GULV_FARGE,
};

// Innervegger mellom rommene. Relax er 2,2 m bred, badstue 2,0 m, smørebod 1,2 m.
// Veggene er 12 cm tykke (panel), 2,6 m høye (samme som tilbygget).
// Badstudøra er flyttet mot front-veggen (mot terrassen): senterAvstand 2.25
// gir 10 cm fra fronten (2.7 - 0.10 - 0.7/2 = 2.25).
export const innerveggRelaxBadstue: Levegg = {
  navn: "Innervegg Relax/Badstue",
  fra: { x: 2.2, z: 0 },
  til: { x: 2.2, z: 2.7 },
  hoyde: tilbygg.hoyde,
  tykkelse: INNERVEGG_TYKKELSE,
  farge: PANEL_FARGE,
  dor: {
    type: "glassdor",
    bredde: 0.7,
    hoyde: 2.0,
    bunn: 0.12,
    // Døra flyttet 60 cm innover fra front-veggen (mot badstubenkene i z=0).
    // Nærmeste kant av døra ligger på z=2.10 (= 2.7 − 0.6).
    senterAvstand: 1.75,
  },
};

export const innerveggBadstueSmorebod: Levegg = {
  navn: "Innervegg Badstue/Smørebod",
  fra: { x: 4.2, z: 0 },
  til: { x: 4.2, z: 2.7 },
  hoyde: tilbygg.hoyde,
  tykkelse: INNERVEGG_TYKKELSE,
  farge: PANEL_FARGE,
};

export const tilbyggetRom: Rom[] = [
  { navn: "Relax", x: 0, z: 0, bredde: 2.2, dybde: 2.7 },
  // Etiketten skyves ned så den ikke kolliderer med badstubenkene (z 0–1,2).
  { navn: "Badstue", x: 2.2, z: 0, bredde: 2.0, dybde: 2.7, etikettDz: 0.4 },
  { navn: "Smørebod", x: 4.2, z: 0, bredde: 1.2, dybde: 2.7 },
];

// Møbler i innevisningen. x/z tar høyde for innerveggenes tykkelse (12 cm) så
// benker og ovn ikke stikker gjennom veggene i 3D.
// Badstue innvendig: x 2.32–4.20, z 0–2.7.
// Smørebod innvendig: x 4.32–5.40, z 0–2.7.
// Relax innvendig: x 0–2.20, z 0–2.7.
// Badstuovnen står 15 cm fra innerveggen mot smørebod (x=4.2) og 35 cm
// fra front-veggen/vinduet (z=2.7) — varme-/brannavstand til glasset.
const OVN_X = 4.2 - 0.5 - 0.15; // 3.55
const OVN_Z = 2.7 - 0.5 - 0.35; // 1.85
const OVN_HOYDE = 0.9;
// Pipas senter = ovnens senter; diameter ≈ 15 cm; topp ≈ 1 m over taket.
const PIPE_DIAMETER = 0.15;
const PIPE_BUNN = OVN_HOYDE;
const PIPE_HOYDE = 3.0; // når godt opp gjennom taket (mønet ligger på ≈ 3.23)
const PIPE_SENTER_X = OVN_X + 0.25;
const PIPE_SENTER_Z = OVN_Z + 0.25;

export const tilbyggetMobler: Mobel[] = [
  // Badstubenker — vegg-til-vegg over hele badstu-rommets bredde (2.0 m),
  // klassisk L-profil: nedre benk 120 cm dyp (kan ligges på), øvre benk
  // 60 cm dyp og sitter oppå bakre halvdel av nedre benk.
  {
    navn: "Badstubenk nedre",
    x: 2.2,
    z: 0,
    bredde: 2.0,
    dybde: 1.2,
    hoyde: 0.45,
    farge: "#d4ba8a",
    etikettDz: 0.35, // skyv ned i den nedre halvdelen, vekk fra øvre benk
  },
  {
    navn: "Badstubenk øvre",
    x: 2.2,
    z: 0,
    bredde: 2.0,
    dybde: 0.6,
    hoyde: 0.4, // topp på y=0.85 (45 cm benkesokkel + 40 cm)
    bunn: 0.45,
    farge: "#d4ba8a",
  },
  // Vedfyrt badstuovn — sort støpejern, 50×50×90 cm, 15 cm fra både
  // innerveggen mot smørebod og front-veggen (brannavstand).
  {
    navn: "Badstuovn (vedfyrt)",
    x: OVN_X,
    z: OVN_Z,
    bredde: 0.5,
    dybde: 0.5,
    hoyde: OVN_HOYDE,
    farge: "#1a1a1a",
  },
  // Stålpipe rett opp fra ovnen, gjennom taket. Sylinder, ca. 15 cm
  // diameter, ender ca. 1 m over mønet.
  {
    navn: "Stålpipe",
    x: PIPE_SENTER_X - PIPE_DIAMETER / 2,
    z: PIPE_SENTER_Z - PIPE_DIAMETER / 2,
    bredde: PIPE_DIAMETER,
    dybde: PIPE_DIAMETER,
    hoyde: PIPE_HOYDE,
    bunn: PIPE_BUNN,
    farge: "#b8b8b8",
    form: "sylinder",
    metall: true,
  },
  // Relax-benk langs bakveggen (z=0), full bredde av rommet.
  {
    navn: "Relax-benk",
    x: 0,
    z: 0,
    bredde: 2.2,
    dybde: 0.6,
    hoyde: 0.4,
    farge: "#8b6f47",
  },
  // Smørebenk 40×120 helt inntil innerveggen mot badstuen (x=4.2),
  // sentrert i smørebodens dybde.
  {
    navn: "Smørebenk",
    x: 4.2,
    z: 0.75,
    bredde: 0.4,
    dybde: 1.2,
    hoyde: 0.9,
    farge: "#6b5a3f",
  },
];

export const tilbyggetInnvendig: Design = {
  navn: "Tilbygget — innvendig",
  beskrivelse:
    "Romfordeling: Relax (5,94 m²), badstue (5,40 m²) og smørebod (3,24 m²)",
  alleBygg: [tilbyggInterior],
  terrasser: [],
  levegger: [innerveggRelaxBadstue, innerveggBadstueSmorebod],
  gjerder: [],
  trapper: [],
  rom: tilbyggetRom,
  mobler: tilbyggetMobler,
};
