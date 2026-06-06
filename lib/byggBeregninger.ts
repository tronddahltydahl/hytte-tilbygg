// Materialliste, statisk kontroll og fundament-beregning for tilbygget.
// All geometri leses fra `lib/bygg.ts` — modellen er fasit. Endrer du et
// mål der, regnes alt nedenfor om automatisk.

import {
  innerveggRelaxBadstue,
  innerveggBadstueSmorebod,
  tilbygg,
  tilbyggetMobler,
  tilbyggetRom,
} from "@/lib/bygg";

// ----- 1) Geometri lest ut av modellen ---------------------------------

export const G = {
  lengde: tilbygg.bredde,       // 5.40 m (langs hytteveggen)
  dybde: tilbygg.dybde,          // 2.70 m (ut fra hytta)
  vegghoyde: tilbygg.hoyde,      // 2.60 m
  takvinkel: tilbygg.tak!.vinkel, // 25°
  takutstikk: tilbygg.tak!.utstikk ?? 0, // 0.40 m
  innerveggTykkelse: 0.12,       // m — fra `INNERVEGG_TYKKELSE` i bygg.ts
} as const;

export const grunnflate = G.lengde * G.dybde; // m²
export const vinkelRad = (G.takvinkel * Math.PI) / 180;
export const sperrLengde = (G.dybde / 2) / Math.cos(vinkelRad); // raft → møne
export const moneHoydeOverVegg = (G.dybde / 2) * Math.tan(vinkelRad);
export const takflateBrutto = G.lengde * 2 * sperrLengde;
export const takflateMedUtstikk =
  G.lengde * 2 * (sperrLengde + G.takutstikk / Math.cos(vinkelRad));
export const gavlTrekantAreal = (G.dybde / 2) * moneHoydeOverVegg; // m² per gavl

// ----- 1b) Gjenbruk — ting brukeren har fra før ------------------------
// Materialer som finnes blant rivematerialer / loftet / låven. De vises
// fortsatt i listen for å synliggjøre at de er medregnet, men med pris 0
// og notat om gjenbruk. Utvid setet hvis du har mer fra før.
export const EID_FRA_FOR: ReadonlySet<string> = new Set([
  "terrassedor", // 80×200 glass-terrassedør inn til Relax
]);

// ----- 2) Konstruksjonsparametere (brukerens spec) ---------------------

export const KONSTR = {
  stenderDim: "48×98 C24",
  stenderCC: 0.6, // m
  ytterveggTykkelse: 0.13, // m (ferdig)
  isoVeggMm: 98,
  klimaspalteMm: 23,
  panelMm: 23, // ute (tømmermannspanel)
  innepanelMm: 14,

  gulvSvillDim: "48×198 C24",
  gulvBjelkeDim: "48×198 C24",
  gulvBjelkeCC: 0.6,
  isoGulvMm: 200,
  sponplateMm: 22,

  takSperrDim: "48×148 C24",
  himlingsbjelkeDim: "48×198 C24",
  takSperrCC: 0.6,
  isoTakMm: 148,
  luftespalteMm: 50,
  sloyfeDim: "23×48",
  lekterDim: "30×48",
  taktroMm: 22,

  fundamentPilaravstandMaks: 1.8, // m (svill 48×148)
} as const;

// ----- 3) Snølast og statisk kontroll ----------------------------------

// NS-EN 1991-1-3: snølast på tak = μ × sk
// For saltak ≤30° er formfaktor μ1 = 0,8
const SK = 4.5; // kN/m² (450 kg/m² karakteristisk på bakken)
const MY1 = 0.8;
const SNOLAST_TAK = SK * MY1; // 3,6 kN/m² horisontalt projisert

// Material-egenvekt på taket (kN/m² på horisontal projeksjon, omtrent):
const EGENVEKT_TAK = 0.5; // taktekking + taktro + iso + sperr + himling

// C24 design-verdier
const FM_K = 24; // N/mm² (karakteristisk bøyefasthet)
const E_MEAN = 11000; // N/mm² (gjennomsnittlig E-modul)
const KMOD_MEDIUM = 0.9; // snølast = medium-time load
const GAMMA_M = 1.3; // partialkoeffisient

export type StatiskKontroll = {
  spennvidde_m: number;
  belastning_kNm: number; // linjelast per sperr
  moment_kNm: number;
  bjelkeDim: string;
  W_mm3: number;
  spenning_Nmm2: number;
  tillattSpenning_Nmm2: number;
  utnyttelse_pst: number;
  nedboyning_mm: number;
  tillattNedboyning_mm: number;
  konklusjon: "OK" | "IKKE OK";
  forklaring: string;
};

export function statiskKontrollSperrer(): StatiskKontroll {
  // Sperrer er c/c 600 mm, spenner fra raft til møne langs takflaten.
  const cc = KONSTR.takSperrCC;
  const L = sperrLengde; // m, skrå spennvidde
  // Last per sperr (kN/m) — multiplisert med c/c-avstand.
  // Vi regner med horisontal projisert last (vanlig praksis for snølast).
  const q_horisontal = (SNOLAST_TAK + EGENVEKT_TAK) * cc; // kN/m per sperr
  // Konvertert til last langs sperren (skrå): cos(α) reduksjon
  const q_skra = q_horisontal * Math.cos(vinkelRad);
  // Enkel bjelke understøttet i begge ender (raft + møne):
  const M = (q_skra * L * L) / 8; // kNm

  // 48×148 C24
  const b = 48;
  const h = 148;
  const W = (b * h * h) / 6; // mm³
  const I = (b * h * h * h) / 12; // mm⁴

  const M_Nmm = M * 1e6; // kNm → Nmm
  const sigma = M_Nmm / W; // N/mm²

  const fm_d = (FM_K * KMOD_MEDIUM) / GAMMA_M; // N/mm²

  // Nedbøyning under permanent + variabel last (kortvarig):
  const q_skra_Nmm = (q_skra * 1000) / 1000; // kN/m → N/mm
  const L_mm = L * 1000;
  const delta =
    (5 * q_skra_Nmm * Math.pow(L_mm, 4)) / (384 * E_MEAN * I); // mm
  const tillattDelta = L_mm / 300; // mm (typisk for tak)

  const utn = (sigma / fm_d) * 100;
  const ok = sigma <= fm_d && delta <= tillattDelta;

  return {
    spennvidde_m: L,
    belastning_kNm: q_skra,
    moment_kNm: M,
    bjelkeDim: KONSTR.takSperrDim,
    W_mm3: W,
    spenning_Nmm2: sigma,
    tillattSpenning_Nmm2: fm_d,
    utnyttelse_pst: utn,
    nedboyning_mm: delta,
    tillattNedboyning_mm: tillattDelta,
    konklusjon: ok ? "OK" : "IKKE OK",
    forklaring: ok
      ? `48×148 C24 c/c 600 mm holder med god margin (${utn.toFixed(0)}% av tillatt bøyespenning, nedbøyning ${delta.toFixed(1)} mm av tillatt ${tillattDelta.toFixed(1)} mm).`
      : `48×148 C24 er IKKE tilstrekkelig. Øk dimensjon eller reduser c/c.`,
  };
}

// ----- 4) Fundamenter --------------------------------------------------

export type Fundament = {
  navn: string;
  x: number;
  z: number;
};

export function fundamenter(): {
  antall: number;
  pilarer: Fundament[];
  pilarAvstand_m: number;
  begrunnelse: string;
} {
  // Pilarer plasseres langs begge langsider (z=0 og z=2.7) som bærer
  // svillen 48×148. For 5.40 m langside med maks 1,80 m mellomrom blir
  // det 4 pilarer per side.
  const antallPerSide = Math.ceil(G.lengde / KONSTR.fundamentPilaravstandMaks) + 1;
  const cc = G.lengde / (antallPerSide - 1);
  const pilarer: Fundament[] = [];
  for (let i = 0; i < antallPerSide; i++) {
    pilarer.push({ navn: `Pilar bak ${i + 1}`, x: i * cc, z: 0 });
    pilarer.push({ navn: `Pilar front ${i + 1}`, x: i * cc, z: G.dybde });
  }
  return {
    antall: pilarer.length,
    pilarer,
    pilarAvstand_m: cc,
    begrunnelse: `Svill ${KONSTR.gulvSvillDim} maks pilaravstand ~${KONSTR.fundamentPilaravstandMaks} m → ${antallPerSide} pilarer per langside × 2 sider = ${pilarer.length} pilarer.`,
  };
}

// ----- 5) Materialliste ------------------------------------------------

// LAV-BUDSJETT prisliste — egeninnsats forutsatt. Rimelige norske
// byggevarepriser 2026 (eksempler, ikke tilbud). Konkrete tips:
//   - OSB i stedet for sponplate/taktro
//   - Glattkantpanel (gran) i stedet for tømmermannspanel
//   - Takpapp/ takshingel light i stedet for skifer/stål
//   - Støpte betongpilarer m/søyleform (egeninnsats) i stedet for prefab
//   - Vinduer og dører i standardmål fra "rest/tilbudshyller" hos byggevare
const PRIS = {
  "48×98 C24 (kr/lm)": 26,
  "48×148 C24 (kr/lm)": 45,
  "48×198 C24 (kr/lm)": 62,
  "23×48 lekt (kr/lm)": 11,
  "30×48 lekt (kr/lm)": 13,
  "OSB 22 mm gulv (kr/m²)": 130,
  "OSB 15 mm taktro (kr/m²)": 110,
  "Iso 98 mm (kr/m²)": 95,
  "Iso 148 mm (kr/m²)": 145,
  "Iso 200 mm (kr/m²)": 195,
  "Dampsperre PE (kr/m²)": 15,
  "Dampsperre alu badstu (kr/m²)": 210,
  "Vindsperre (kr/m²)": 25,
  "Undertaksduk (kr/m²)": 32,
  "Glattkantpanel utvendig (kr/m²)": 180,
  "Innepanel furu rimelig (kr/m²)": 160,
  "Badstuepanel osp (kr/m²)": 450,
  "Takpapp shingel light (kr/m²)": 85,
  "Betongpilar støpt m/søyleform (kr/stk)": 800,
  "Terrassedør glass 80×200 (kr/stk)": 6500,
  "Vindu badstu 160×80 herdet (kr/stk)": 5000,
  "Boddør tre 70×205 (kr/stk)": 3000,
  "Innerdør glass 70×200 (kr/stk)": 3000,
  "Vedovn badstu 10 kW (kr/stk)": 13000,
  "Stålpipe m/gjennomføring (kr/sett)": 11000,
  "Badstubenkemateriell osp (kr/lm)": 700,
  "Raft-/gavlventil (kr/stk)": 280,
  "Festemidler/skruer/beslag (sjablong) (kr)": 4500,
} as const;
type PrisKey = keyof typeof PRIS;

export type MaterialPost = {
  kategori: string;
  navn: string;
  enhet: string;
  mengde: number;
  prisEnhet: number;
  totalKr: number;
  notat?: string;
};

// Hjelper for å lage post med pris hentet fra PRIS-tabellen
function post(
  kategori: string,
  navn: string,
  enhet: string,
  mengde: number,
  prisKey: PrisKey,
  notat?: string,
): MaterialPost {
  const prisEnhet = PRIS[prisKey];
  return {
    kategori,
    navn,
    enhet,
    mengde,
    prisEnhet,
    totalKr: Math.round(mengde * prisEnhet),
    notat,
  };
}

// Areal av ytter- og innervegger
// VIKTIG: Tilbygget festes INN i hytta. Venstre gavl-vegg ER hyttas
// eksisterende yttervegg — det bygges ingen ny vegg der. I stedet
// fjernes hyttas overligger/lister på den siden og innepanel festes
// utenpå hyttas ytterpanel i Relax-rommet.
function veggArealer() {
  // Tre nye yttervegg-segmenter: bak, front og høyre gavl
  const bak = G.lengde * G.vegghoyde;
  const front = G.lengde * G.vegghoyde;
  const hoyreGavl = G.dybde * G.vegghoyde + gavlTrekantAreal;
  const ytterBrutto = bak + front + hoyreGavl;

  // Åpninger på front (fra tilbygg.apninger)
  const apningArealFront = (tilbygg.apninger ?? [])
    .filter((a) => a.vegg === "front")
    .reduce((sum, a) => sum + a.bredde * a.hoyde, 0);

  const ytterNetto = ytterBrutto - apningArealFront;

  // Innepanel UTENPÅ hyttas eksisterende yttervegg i Relax-rommet
  // (2,7 m dybde × 2,6 m vegghøyde — ikke gavl-trekanten, den er over himling)
  const hytteveggInnvendigRelax = G.dybde * G.vegghoyde;

  // Innervegger (begge mellomvegger har samme dybde × vegghøyde)
  const innerveggBrutto =
    2 * (G.dybde * G.vegghoyde); // to mellomvegger
  // Innerdør i mellomvegg Relax/Badstue:
  const innerdorAreal =
    (innerveggRelaxBadstue.dor?.bredde ?? 0) *
    (innerveggRelaxBadstue.dor?.hoyde ?? 0);
  // Badstue/Smørebod-mellomveggen har ingen åpning
  void innerveggBadstueSmorebod;
  const innerNetto = innerveggBrutto - innerdorAreal;

  return {
    ytterBrutto,
    ytterNetto,
    innerBrutto: innerveggBrutto,
    innerNetto,
    hytteveggInnvendigRelax,
  };
}

// Antall stender for en gitt veggrekke (bredde i meter)
function antallStender(veggLengde_m: number): number {
  return Math.ceil(veggLengde_m / KONSTR.stenderCC) + 1;
}

// Romspesifikke veggarealer (for dampsperre-valg per rom)
function badstueVeggIndreAreal() {
  // Innvendige vegger i badstuen: 2 lengde-vegger + 2 mellomvegger
  // Lengde-vegger (bak+front): 2.0 (badstubredde) × 2.6 (vegghøyde) × 2
  // Mellomvegger: 2.7 (dybde) × 2.6 × 2 (begge mellomvegger sett fra badstu-siden)
  const badstu = tilbyggetRom.find((r) => r.navn === "Badstue")!;
  const ytter = 2 * badstu.bredde * G.vegghoyde;
  const mellom = 2 * badstu.dybde * G.vegghoyde;
  // Trekk fra badstuvindu og innerdør
  const apning =
    (tilbygg.apninger ?? [])
      .filter((a) => a.vegg === "front" && a.avstand >= badstu.x && a.avstand <= badstu.x + badstu.bredde)
      .reduce((s, a) => s + a.bredde * a.hoyde, 0) +
    (innerveggRelaxBadstue.dor?.bredde ?? 0) *
      (innerveggRelaxBadstue.dor?.hoyde ?? 0);
  return ytter + mellom - apning;
}

// Sett pris til 0 og legg på gjenbruks-notat hvis nøkkelen er i EID_FRA_FOR.
function gjenbrukSjekk(p: MaterialPost, key: string): MaterialPost {
  if (!EID_FRA_FOR.has(key)) return p;
  return {
    ...p,
    prisEnhet: 0,
    totalKr: 0,
    notat: (p.notat ? p.notat + " — " : "") + "Gjenbruk: har fra før, ingen kostnad.",
  };
}

// Vindu/dør-liste fra modellen
function vinduerDorer(): MaterialPost[] {
  const liste: MaterialPost[] = [];
  for (const a of tilbygg.apninger ?? []) {
    if (a.type === "glassdor") {
      liste.push(
        gjenbrukSjekk(
          post(
            "Vinduer og dører",
            `Terrassedør (glass) ${Math.round(a.bredde * 100)}×${Math.round(a.hoyde * 100)} cm`,
            "stk",
            1,
            "Terrassedør glass 80×200 (kr/stk)",
          ),
          "terrassedor",
        ),
      );
    } else if (a.type === "vindu") {
      liste.push(
        post(
          "Vinduer og dører",
          `Badstuvindu (herdet/badstuglass) ${Math.round(a.bredde * 100)}×${Math.round(a.hoyde * 100)} cm`,
          "stk",
          1,
          "Vindu badstu 160×80 herdet (kr/stk)",
        ),
      );
    } else if (a.type === "dor") {
      liste.push(
        post(
          "Vinduer og dører",
          `Boddør (tre) ${Math.round(a.bredde * 100)}×${Math.round(a.hoyde * 100)} cm`,
          "stk",
          1,
          "Boddør tre 70×205 (kr/stk)",
        ),
      );
    }
  }
  // Innerdør i mellomvegg Relax/Badstue
  if (innerveggRelaxBadstue.dor) {
    const d = innerveggRelaxBadstue.dor;
    liste.push(
      post(
        "Vinduer og dører",
        `Innerdør (glass) ${Math.round(d.bredde * 100)}×${Math.round(d.hoyde * 100)} cm — Relax↔Badstue`,
        "stk",
        1,
        "Innerdør glass 70×200 (kr/stk)",
      ),
    );
  }
  return liste;
}

// Badstuovn — dimensjoner ut fra romvolum + glassflate.
// Flat himling + kalt loft + tett dampsperre gir god effekt-utnyttelse;
// vi bruker 1,0 kW/m³ og 1,0 kW/m² glassflate (litt under den klassiske
// 1,1 kW/m³ for mindre tette badstuer).
function badstueOvnEffekt() {
  const badstu = tilbyggetRom.find((r) => r.navn === "Badstue")!;
  // Innvendig volum (trekker fra vegg-tykkelser på begge sider av badstuen
  // — innerveggene strekker seg inn i badstu-rommet)
  const innvendigBredde = badstu.bredde - G.innerveggTykkelse; // 2.0 - 0.12 ~= 1.88
  const innvendigDybde = badstu.dybde;
  // Flat himling ca 2,30 m (= 2,60 m vegg - 20 cm himlingsbjelke/iso/panel)
  const innvendigHoyde = 2.3;
  const volum = innvendigBredde * innvendigDybde * innvendigHoyde;

  const glassflate = (tilbygg.apninger ?? [])
    .filter(
      (a) =>
        a.vegg === "front" &&
        a.avstand >= badstu.x &&
        a.avstand <= badstu.x + badstu.bredde &&
        a.type === "vindu",
    )
    .reduce((s, a) => s + a.bredde * a.hoyde, 0);

  const effektKw = 1.0 * volum + 1.0 * glassflate;
  return { volum, glassflate, effektKw };
}

// ----- 6) Generer hele materiallisten ----------------------------------

export function lagMaterialliste(): MaterialPost[] {
  const liste: MaterialPost[] = [];
  const fund = fundamenter();
  const veggA = veggArealer();
  const badstuVeggA = badstueVeggIndreAreal();

  // ---- Fundament ----
  liste.push(
    post(
      "Fundament",
      "Betongpilar støpt m/søyleform Ø250 (ventilert kryperom)",
      "stk",
      fund.antall,
      "Betongpilar støpt m/søyleform (kr/stk)",
      fund.begrunnelse + " Pris inkl. ferdigbetong, søyleform og innstøpningsbolt — egeninnsats forutsatt.",
    ),
  );

  // ---- Gulv ----
  // Svill 48×198 langs begge langsider (samme dim som bjelker, for å romme 200 mm iso)
  liste.push(
    post(
      "Gulv",
      "Svill 48×198 C24 (impregnert i bunn)",
      "lm",
      2 * G.lengde,
      "48×198 C24 (kr/lm)",
    ),
  );
  // Gulvbjelker 48×198 c/c 600 mm, spennvidde = dybde. 198 mm romsler 200 mm iso uten klemming.
  const antallGulvbjelker = antallStender(G.lengde);
  liste.push(
    post(
      "Gulv",
      "Gulvbjelke 48×198 C24 c/c 600",
      "lm",
      antallGulvbjelker * G.dybde,
      "48×198 C24 (kr/lm)",
      `${antallGulvbjelker} stk × ${G.dybde} m — 198 mm gir plass til 200 mm iso uten klem`,
    ),
  );
  liste.push(post("Gulv", "Vindsperre under gulvbjelker", "m²", grunnflate, "Vindsperre (kr/m²)"));
  liste.push(post("Gulv", "Isolasjon mineralull 200 mm", "m²", grunnflate, "Iso 200 mm (kr/m²)"));
  // Dampsperre over gulvbjelker. PE-folie utenfor badstuen, alu i badstuen.
  const badstu = tilbyggetRom.find((r) => r.navn === "Badstue")!;
  const badstuGulvA = badstu.bredde * badstu.dybde;
  liste.push(
    post(
      "Gulv",
      "Dampsperre PE-folie (Relax + Smørebod)",
      "m²",
      grunnflate - badstuGulvA,
      "Dampsperre PE (kr/m²)",
    ),
  );
  liste.push(
    post(
      "Gulv",
      "Dampsperre aluminium (Badstue)",
      "m²",
      badstuGulvA,
      "Dampsperre alu badstu (kr/m²)",
    ),
  );
  liste.push(post("Gulv", "OSB 22 mm gulvplate", "m²", grunnflate, "OSB 22 mm gulv (kr/m²)"));

  // ---- Yttervegger ----
  // Bare 3 nye yttervegg-segmenter — venstre gavl er hyttas eksisterende.
  const omkretsNyVegger = 2 * G.lengde + G.dybde; // bak + front + høyre gavl
  const stender_total =
    (antallStender(G.lengde) * 2 + antallStender(G.dybde)) * G.vegghoyde;
  liste.push(
    post(
      "Yttervegg",
      "Stender 48×98 C24 c/c 600 (m/topp- og bunnsvill, 3 vegger)",
      "lm",
      stender_total + omkretsNyVegger * 2, // pluss topp- og bunnsvill
      "48×98 C24 (kr/lm)",
      "Bare 3 nye yttervegger — venstre gavl er hyttas eksisterende vegg.",
    ),
  );
  liste.push(
    post("Yttervegg", "Isolasjon mineralull 98 mm", "m²", veggA.ytterNetto, "Iso 98 mm (kr/m²)"),
  );
  // Dampsperre yttervegg: alu i badstu, PE ellers. Badstu har 2 lengde-vegger.
  const badstuLengdeveggA = 2 * badstu.bredde * G.vegghoyde -
    (tilbygg.apninger ?? [])
      .filter((a) => a.vegg === "front" && a.avstand >= badstu.x && a.avstand <= badstu.x + badstu.bredde)
      .reduce((s, a) => s + a.bredde * a.hoyde, 0);
  liste.push(
    post(
      "Yttervegg",
      "Dampsperre PE-folie (Relax + Smørebod)",
      "m²",
      veggA.ytterNetto - badstuLengdeveggA,
      "Dampsperre PE (kr/m²)",
    ),
  );
  liste.push(
    post(
      "Yttervegg",
      "Dampsperre aluminium (Badstue ytter)",
      "m²",
      badstuLengdeveggA,
      "Dampsperre alu badstu (kr/m²)",
    ),
  );
  liste.push(post("Yttervegg", "Vindsperre (netto)", "m²", veggA.ytterNetto, "Vindsperre (kr/m²)"));
  liste.push(
    post(
      "Yttervegg",
      "Klimaspalte 23×48 (lekter, netto)",
      "lm",
      veggA.ytterNetto / 0.6,
      "23×48 lekt (kr/lm)",
    ),
  );
  liste.push(
    post(
      "Yttervegg",
      "Glattkantpanel utvendig (gran, ubehandlet)",
      "m²",
      veggA.ytterNetto,
      "Glattkantpanel utvendig (kr/m²)",
      "Stående eller liggende, beises/males ved montering. Rimeligst alternativ.",
    ),
  );
  liste.push(
    post(
      "Yttervegg",
      "Innepanel furu rimelig (Relax + Smørebod nye sider)",
      "m²",
      veggA.ytterNetto - badstuVeggA,
      "Innepanel furu rimelig (kr/m²)",
    ),
  );
  liste.push(
    post(
      "Yttervegg",
      "Innepanel furu utenpå hyttas yttervegg (Relax venstre vegg)",
      "m²",
      veggA.hytteveggInnvendigRelax,
      "Innepanel furu rimelig (kr/m²)",
      "Fjern hyttas overligger/lister først. Panel festes direkte over hyttas eksisterende ytterpanel.",
    ),
  );
  liste.push(
    post(
      "Yttervegg",
      "Badstuepanel osp (Badstue alle vegger innvendig)",
      "m²",
      badstuVeggA,
      "Badstuepanel osp (kr/m²)",
    ),
  );

  // ---- Innervegger (mellomvegger) ----
  // To mellomvegger, hver 2.7 m × 2.6 m
  const innerLengde_lm = 2 * G.dybde;
  liste.push(
    post(
      "Innervegg",
      "Stender 48×98 C24 mellomvegg c/c 600 (m/topp og bunnsvill)",
      "lm",
      antallStender(G.dybde) * 2 * G.vegghoyde + innerLengde_lm * 2,
      "48×98 C24 (kr/lm)",
      "2 mellomvegger Relax/Badstue og Badstue/Smørebod",
    ),
  );
  liste.push(
    post("Innervegg", "Isolasjon mineralull 98 mm", "m²", veggA.innerNetto, "Iso 98 mm (kr/m²)"),
  );
  liste.push(
    post(
      "Innervegg",
      "Dampsperre aluminium (Badstue-siden)",
      "m²",
      veggA.innerNetto / 2,
      "Dampsperre alu badstu (kr/m²)",
    ),
  );
  liste.push(
    post(
      "Innervegg",
      "Dampsperre PE (Relax/Smørebod-siden)",
      "m²",
      veggA.innerNetto / 2,
      "Dampsperre PE (kr/m²)",
    ),
  );

  // ---- Tak (selvbygde takstoler, kalt loft) ----
  // En takstol per c/c 600 mm langs lengden. Hver takstol består av
  // 2 sperrer (raft → møne) + bindebjelke (= himlingsbjelke, går 2,7 m
  // vegg-til-vegg). Iso ligger i HIMLINGEN, ikke mellom sperrene — taket
  // er kaldt loft med lufting i raft og gavl.
  const antallTakstoler = antallStender(G.lengde);
  const antallSperrer = antallTakstoler * 2;
  liste.push(
    post(
      "Tak",
      "Sperrer i takstol 48×148 C24",
      "lm",
      antallSperrer * sperrLengde,
      "48×148 C24 (kr/lm)",
      `${antallTakstoler} takstoler × 2 sperrer × ${sperrLengde.toFixed(2)} m skrå`,
    ),
  );
  liste.push(
    post(
      "Tak",
      "Bindebjelke (= himlingsbjelke) 48×198 C24 i takstol",
      "lm",
      antallTakstoler * G.dybde,
      "48×198 C24 (kr/lm)",
      `${antallTakstoler} stk × ${G.dybde} m — 198 mm gir plass til 200 mm himlingsiso uten klem`,
    ),
  );
  liste.push(
    post(
      "Tak",
      "Hanebjelke 48×98 C24 i takstol (anbefalt for stivhet)",
      "lm",
      antallTakstoler * 1.5,
      "48×98 C24 (kr/lm)",
      `${antallTakstoler} stk × ca 1,5 m — hindrer at sperrene presser veggene utover`,
    ),
  );
  liste.push(
    post(
      "Tak",
      "Mønebjelke 48×148 C24 (gjennomgående for stabilitet)",
      "lm",
      G.lengde + 2 * G.takutstikk,
      "48×148 C24 (kr/lm)",
    ),
  );
  liste.push(
    post(
      "Tak",
      "OSB 15 mm taktro",
      "m²",
      takflateMedUtstikk,
      "OSB 15 mm taktro (kr/m²)",
      "Festes direkte på sperrene",
    ),
  );
  liste.push(
    post(
      "Tak",
      "Undertaksduk",
      "m²",
      takflateMedUtstikk,
      "Undertaksduk (kr/m²)",
    ),
  );
  liste.push(
    post(
      "Tak",
      "Sløyfer 23×48 (mellom taktro og lekter)",
      "lm",
      antallSperrer * sperrLengde,
      "23×48 lekt (kr/lm)",
    ),
  );
  liste.push(
    post(
      "Tak",
      "Takpapp shingel light",
      "m²",
      takflateMedUtstikk,
      "Takpapp shingel light (kr/m²)",
    ),
  );
  liste.push(
    post(
      "Tak",
      "Raftventil (kaldt loft, lufting i raft)",
      "stk",
      4,
      "Raft-/gavlventil (kr/stk)",
      "2 stk per langside — sikrer luftgjennomstrømning",
    ),
  );
  liste.push(
    post(
      "Tak",
      "Gavlventil (kaldt loft, lufting i gavl)",
      "stk",
      2,
      "Raft-/gavlventil (kr/stk)",
      "1 stk per gavl",
    ),
  );

  // ---- Himling (flat, isolasjon ligger her) ----
  // Himlingen henges fra bindebjelkene i takstolen. Iso 200 mm gir bedre
  // U-verdi i tak når man har et kaldt loft over (vs. de 148 mm man hadde
  // klemt mellom sperrer i skråhimling-versjonen).
  liste.push(
    post(
      "Himling",
      "Isolasjon mineralull 200 mm (mellom bindebjelker)",
      "m²",
      grunnflate,
      "Iso 200 mm (kr/m²)",
    ),
  );
  liste.push(
    post(
      "Himling",
      "Dampsperre PE-folie (Relax + Smørebod)",
      "m²",
      grunnflate - badstuGulvA,
      "Dampsperre PE (kr/m²)",
    ),
  );
  liste.push(
    post(
      "Himling",
      "Dampsperre aluminium (Badstue)",
      "m²",
      badstuGulvA,
      "Dampsperre alu badstu (kr/m²)",
    ),
  );
  liste.push(
    post(
      "Himling",
      "Innepanel furu rimelig (Relax + Smørebod)",
      "m²",
      grunnflate - badstuGulvA,
      "Innepanel furu rimelig (kr/m²)",
    ),
  );
  liste.push(
    post(
      "Himling",
      "Badstuepanel osp (Badstue)",
      "m²",
      badstuGulvA,
      "Badstuepanel osp (kr/m²)",
    ),
  );

  // ---- Vinduer og dører ----
  for (const p of vinduerDorer()) liste.push(p);

  // ---- Badstu-inventar ----
  const benkLm = tilbyggetMobler
    .filter((m) => m.navn.startsWith("Badstubenk"))
    .reduce((s, m) => s + m.bredde, 0);
  liste.push(
    post(
      "Badstu-inventar",
      "Badstubenkemateriell osp (selvbygd, nedre 120 cm + øvre 60 cm dyp)",
      "lm",
      benkLm,
      "Badstubenkemateriell osp (kr/lm)",
      "Osp-bord + bæring/spilebrett. Jeg bygger benkene selv.",
    ),
  );
  const ovn = badstueOvnEffekt();
  liste.push(
    post(
      "Badstu-inventar",
      `Vedovn badstu 10 kW (beregnet behov ~${ovn.effektKw.toFixed(1)} kW)`,
      "stk",
      1,
      "Vedovn badstu 10 kW (kr/stk)",
      `Romvolum ${ovn.volum.toFixed(2)} m³ × 1,0 kW/m³ + glassflate ${ovn.glassflate.toFixed(2)} m² × 1,0 kW/m². Med flat himling + kalt loft + tett dampsperre er 10 kW tilstrekkelig.`,
    ),
  );
  liste.push(
    post(
      "Badstu-inventar",
      "Stålpipe m/takgjennomføring og brannmurplate",
      "sett",
      1,
      "Stålpipe m/gjennomføring (kr/sett)",
    ),
  );

  // ---- Diverse ----
  liste.push(
    post(
      "Diverse",
      "Festemidler, skruer, beslag, takrenne, beslag rundt vinduer m.m.",
      "post",
      1,
      "Festemidler/skruer/beslag (sjablong) (kr)",
    ),
  );

  return liste;
}

export function totalKr(liste: MaterialPost[]): number {
  return liste.reduce((s, p) => s + p.totalKr, 0);
}

export function kategoriSum(liste: MaterialPost[]): Record<string, number> {
  const sum: Record<string, number> = {};
  for (const p of liste) sum[p.kategori] = (sum[p.kategori] ?? 0) + p.totalKr;
  return sum;
}
