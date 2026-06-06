# Tilbygget — innvendig (2D + 3D) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Tilbygget"-section in the menu with a 2D interior plan and a 3D model showing the three rooms (Relax, Badstue, Smørebod) inside the addition. Also remove the obsolete single inner wall and update the addition's facade (smørebod door, repositioned windows).

**Architecture:** All geometry remains driven from `lib/bygg.ts`. We introduce a `Rom` type for labeling rooms in 2D, a new `Design` (`tilbyggetInnvendig`) that contains just the addition with two interior walls, and a tak-toggle in `Modell3D` so the user can hide the roof. No new render components — interior walls reuse the existing `Levegg` type.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, React Three Fiber. No test framework in this project — verification is done by running `npm run dev` and inspecting the browser.

**Spec:** `docs/superpowers/specs/2026-05-24-tilbygget-interior-design.md`

---

## File Map

- Modify `lib/bygg.ts` — remove `innerveggBadstue`, update `tilbygg.apninger`, add `Rom` type + `Design.rom`, add `tilbyggInteriør`, two interior walls, `tilbyggetInnvendig` design.
- Modify `components/Plan2D.tsx` — render room labels when `design.rom` is set; suppress the building's name/dimensions label in that case.
- Modify `components/Modell3D.tsx` — accept `initialVisTak?: boolean` prop; render a toggle button; gate `Tak`/`Vindskie`/`Toppbord`/`Takrenne` on the state.
- Modify `app/layout.tsx` — add "Tilbygget:" nav section with 2D + 3D links.
- Create `app/tilbygget/page.tsx` — 2D interior page.
- Create `app/tilbygget/3d/page.tsx` — 3D interior page.

---

## Task 1: Update `tilbygg.apninger` (windows + smørebod door)

**Files:**
- Modify: `lib/bygg.ts` (the `apninger` array on `tilbygg`, lines ~209-221)

- [ ] **Step 1: Replace the `apninger` array on `tilbygg`**

Replace the existing `apninger: [...]` block on `tilbygg` with:

```ts
  apninger: [
    // Glass-terrassedør på fronten inn til Relax, plassert nær hovedhytta (x=13).
    // Samme størrelse som hyttas terrassedør, bunn på tilbygg-terrassens nivå.
    { type: "glassdor", vegg: "front", avstand: 0.3, bredde: 0.8, hoyde: 2.0, bunn: 0.12 },
    // Liggende vindu i badstuen — 120 × 60 cm, sentrert i badstuens 2,0 m bredde
    // (Relax er 2,2 m → senter av badstue ligger 3,2 m inn → vindu fra 2,6 til 3,8).
    // Topp på y=2.30, samme som hyttas vindustopp.
    { type: "vindu", vegg: "front", avstand: 2.6, bredde: 1.2, hoyde: 0.6, bunn: 1.70 },
    // Ytterdør til smøreboden, sentrert i smørebodens 1,2 m (avstand 4,2–5,4).
    // Oker-gul som hytteinngangen.
    { type: "dor", vegg: "front", avstand: 4.45, bredde: 0.7, hoyde: 2.05, bunn: 0.12, farge: "#c89a3a" },
    // Liggende vindu i Relax (bak), 120 × 60 cm, flyttet inn slik at det ligger
    // pent innenfor Relax-rommet (0 – 2,2). Topp på y=2.30 for symmetri med
    // badstuevinduet.
    { type: "vindu", vegg: "bak", avstand: 0.5, bredde: 1.2, hoyde: 0.6, bunn: 1.70 },
  ],
```

- [ ] **Step 2: Verify in browser**

Run `npm run dev` if not already running. Open `http://localhost:3000/` and `http://localhost:3000/3d`. Expect:
- Smørebod-døra synlig på fronten av tilbygget, oker-gul, til høyre.
- Badstuevinduet i midten av fronten, høyt under taket.
- Bakvinduet (Relax) sitter nå et stykke fra hovedhytta og høyere oppe.

Also check `/v2` and `/v2/3d` — same fasade-endringer skal vises der.

---

## Task 2: Remove `innerveggBadstue` and its usage

**Files:**
- Modify: `lib/bygg.ts` (delete the function, remove from `design1.levegger` and `design2.levegger`)

- [ ] **Step 1: Delete the `innerveggBadstue` function**

Find and remove this entire block (around lines 354-372):

```ts
// Innervegg som deler tilbygget i to: 60 % inngangsdel (med ytterdøra) og
// 40 % badstue. Veggen står ved x = tilbygg-venstre + 60 % av bredden,
// og strekker seg over hele dybden. Glassdør i midten av veggen.
function innerveggBadstue(t: Boks): Levegg {
  const veggX = t.x + t.bredde * 0.6;
  return {
    navn: "Innervegg badstue",
    fra: { x: veggX, z: t.z },
    til: { x: veggX, z: t.z + t.dybde },
    hoyde: t.hoyde,
    tykkelse: 0.08,
    farge: "#c7a874",
    dor: {
      type: "glassdor",
      bredde: 0.7,
      hoyde: 2.0,
      bunn: 0.12,
      senterAvstand: t.dybde / 2,
    },
  };
}
```

- [ ] **Step 2: Update `design1.levegger`**

In `design1`, change:

```ts
  levegger: [...levegger, innerveggBadstue(tilbygg)],
```

to:

```ts
  levegger,
```

- [ ] **Step 3: Update `design2.levegger`**

In `design2`, change:

```ts
  levegger: [...levegger, innerveggBadstue(tilbyggBakover)],
```

to:

```ts
  levegger,
```

- [ ] **Step 4: Verify in browser**

Reload `/` and `/3d`. Expect: ingen vegg gjennom midten av tilbygget i 2D eller 3D — tilbygget er ett rom igjen.

---

## Task 3: Add `Rom` type and `rom` field on `Design`

**Files:**
- Modify: `lib/bygg.ts` (add a new type and a field)

- [ ] **Step 1: Add the `Rom` type**

Add this type definition just **before** the `Design` type (around line 376, just before `// ----- Design-pakker -----`):

```ts
// Et rom inni et bygg — kun brukt for å vise romnavn og areal i 2D.
// Koordinater er i samme system som byggene (meter, hjørnet).
export type Rom = {
  navn: string;
  x: number;
  z: number;
  bredde: number;
  dybde: number;
};
```

- [ ] **Step 2: Add `rom?: Rom[]` to the `Design` type**

Find the `Design` type (around line 377) and add the optional `rom` field:

```ts
export type Design = {
  navn: string;
  beskrivelse: string;
  alleBygg: Boks[];
  terrasser: Terrasse[];
  levegger: Levegg[];
  gjerder: Gjerde[];
  trapper: Trapp[];
  rom?: Rom[];
};
```

- [ ] **Step 3: Verify TypeScript compiles**

Run `npx tsc --noEmit` from the project root. Expected: ingen feil. (Existing designs uten `rom` skal fortsatt være gyldige siden feltet er valgfritt.)

---

## Task 4: Add `tilbyggInteriør`, interior walls, and `tilbyggetInnvendig`

**Files:**
- Modify: `lib/bygg.ts` (append at the end of the file, after `alleDesigner`)

- [ ] **Step 1: Append the new data**

Add this block at the very end of `lib/bygg.ts` (after `export const alleDesigner ...`):

```ts
// ----- Innvendig visning av tilbygget -----
// En kopi av tilbygget flyttet til (0, 0) slik at 2D-tegningen zoomer naturlig
// inn på selve tilbygget (Plan2D regner SVG-størrelse fra max-koordinater).
const tilbyggInterior: Boks = { ...tilbygg, x: 0, z: 0 };

// Innervegger mellom rommene. Relax er 2,2 m bred, badstue 2,0 m, smørebod 1,2 m.
// Veggene er 12 cm tykke (panel), 2,6 m høye (samme som tilbygget).
const PANEL_FARGE = "#c7a874";
const INNERVEGG_TYKKELSE = 0.12;

const innerveggRelaxBadstue: Levegg = {
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
    senterAvstand: 1.35, // midt på veggen (dybde 2,7 m)
  },
};

const innerveggBadstueSmorebod: Levegg = {
  navn: "Innervegg Badstue/Smørebod",
  fra: { x: 4.2, z: 0 },
  til: { x: 4.2, z: 2.7 },
  hoyde: tilbygg.hoyde,
  tykkelse: INNERVEGG_TYKKELSE,
  farge: PANEL_FARGE,
};

const tilbyggetRom: Rom[] = [
  { navn: "Relax", x: 0, z: 0, bredde: 2.2, dybde: 2.7 },
  { navn: "Badstue", x: 2.2, z: 0, bredde: 2.0, dybde: 2.7 },
  { navn: "Smørebod", x: 4.2, z: 0, bredde: 1.2, dybde: 2.7 },
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
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run `npx tsc --noEmit`. Expected: ingen feil.

---

## Task 5: Render room labels in `Plan2D`

**Files:**
- Modify: `components/Plan2D.tsx`

- [ ] **Step 1: Update the import to include `Rom` (aliased)**

Change the import block at the top of `components/Plan2D.tsx`. Note the alias `Rom as RomType` — `Plan2D` already has a local function called `Rom`, so we need to rename the type to avoid a clash:

```ts
import {
  veggInfo,
  type Boks,
  type Design,
  type Gjerde as GjerdeType,
  type Levegg,
  type Rom as RomType,
  type Terrasse as TerrasseType,
  type Trapp as TrappType,
} from "@/lib/bygg";
```

- [ ] **Step 2: Replace the entire `Rom` function with a version that accepts `skjulLabel`**

Replace the existing `function Rom({ boks }: { boks: Boks })` (and its body) with the full version below. The only logical changes are: (1) the new `skjulLabel` prop, and (2) the two text labels are wrapped in `{!skjulLabel && (...)}`:

```tsx
function Rom({ boks, skjulLabel }: { boks: Boks; skjulLabel?: boolean }) {
  const x = meter(boks.x);
  const y = meter(boks.z);
  const w = boks.bredde * SKALA;
  const h = boks.dybde * SKALA;

  // Bygg uten innhugg = enkel rektangel. Med innhugg lager vi L-formet
  // polygon og en liten sirkel for stolpen.
  const innhugg = boks.innhugg;
  let form: ReactNode;
  if (innhugg) {
    const ib = innhugg.bredde * SKALA;
    const id = innhugg.dybde * SKALA;
    const venstre = innhugg.hjorne === "front-venstre";
    const punkterArr = venstre
      ? [
          [x, y],
          [x + w, y],
          [x + w, y + h],
          [x + ib, y + h],
          [x + ib, y + h - id],
          [x, y + h - id],
        ]
      : [
          [x, y],
          [x + w, y],
          [x + w, y + h - id],
          [x + w - ib, y + h - id],
          [x + w - ib, y + h],
          [x, y + h],
        ];
    const punkter = punkterArr.map((p) => p.join(",")).join(" ");
    form = (
      <polygon
        points={punkter}
        fill={boks.farge}
        fillOpacity={0.55}
        stroke="#44403c"
        strokeWidth={2.5}
      />
    );
  } else {
    form = (
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={boks.farge}
        fillOpacity={0.55}
        stroke="#44403c"
        strokeWidth={2.5}
      />
    );
  }

  return (
    <g>
      {form}
      {!skjulLabel && (
        <>
          <text
            x={x + w / 2}
            y={y + h / 2 - 4}
            textAnchor="middle"
            fontSize={14}
            fontWeight={600}
            fill="#292524"
          >
            {boks.navn}
          </text>
          <text
            x={x + w / 2}
            y={y + h / 2 + 16}
            textAnchor="middle"
            fontSize={13}
            fill="#57534e"
          >
            {boks.bredde} m × {boks.dybde} m
          </text>
        </>
      )}
      {innhugg && (
        <circle
          cx={innhugg.hjorne === "front-venstre" ? x : x + w}
          cy={y + h}
          r={5}
          fill="#3a2e1f"
        />
      )}
    </g>
  );
}
```

- [ ] **Step 3: Add a `RomLabel`-komponent**

Add this new component **inside** `Plan2D.tsx`, right before `export default function Plan2D`:

```tsx
function RomLabel({ rom }: { rom: RomType }) {
  const cx = meter(rom.x + rom.bredde / 2);
  const cy = meter(rom.z + rom.dybde / 2);
  const areal = (rom.bredde * rom.dybde).toFixed(2);
  return (
    <g>
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize={15}
        fontWeight={700}
        fill="#1c1917"
      >
        {rom.navn}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize={13} fill="#57534e">
        {areal} m²
      </text>
    </g>
  );
}
```

- [ ] **Step 4: Render rom-labels og pass `skjulLabel` til byggene**

In the main `Plan2D` component, change the destructuring and how byggene rendres. Replace:

```tsx
  const { alleBygg, terrasser, levegger, gjerder, trapper } = design;
```

with:

```tsx
  const { alleBygg, terrasser, levegger, gjerder, trapper, rom } = design;
  const harRom = !!rom?.length;
```

Then change the `<Rom>` mapping to:

```tsx
      {/* Byggene */}
      {alleBygg.map((b) => (
        <Rom key={b.navn} boks={b} skjulLabel={harRom} />
      ))}
```

And add (at the very end of the SVG, just before `</svg>`):

```tsx
      {/* Rom-labels (kun for design der `rom` er definert) */}
      {rom?.map((r) => (
        <RomLabel key={r.navn} rom={r} />
      ))}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run `npx tsc --noEmit`. Expected: ingen feil.

- [ ] **Step 6: Verify in browser**

Reload `/`. Expected: ser fortsatt ut som før, med «Nytt tilbygg» og dimensjoner midt i tilbygget. (Vi tester rom-labels i Task 8.)

---

## Task 6: Add tak-toggle to `Modell3D`

**Files:**
- Modify: `components/Modell3D.tsx`

- [ ] **Step 1: Add `useState` to the existing React import**

Change the React import at the top:

```ts
import { useMemo, useState } from "react";
```

- [ ] **Step 2: Update the default export signature and add state**

Replace the signature of `export default function Modell3D` and the start of its body:

```tsx
export default function Modell3D({
  design,
  initialVisTak = true,
}: {
  design: Design;
  initialVisTak?: boolean;
}) {
  const { alleBygg, terrasser, levegger, gjerder, trapper } = design;
  const [visTak, setVisTak] = useState(initialVisTak);
  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-xl border border-stone-300">
      <button
        type="button"
        onClick={() => setVisTak((v) => !v)}
        className="absolute left-3 top-3 z-10 rounded-md border border-stone-300 bg-white/90 px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm hover:bg-white"
      >
        {visTak ? "Skjul tak" : "Vis tak"}
      </button>
      <Canvas camera={{ position: [18, 14, 20], fov: 45 }}>
```

Notes:
- The wrapping `<div>` gets `relative` so the absolutely-positioned button has the right anchor.
- The button uses `z-10` to ensure it sits above the canvas.

- [ ] **Step 3: Gate the roof components on `visTak`**

Replace these four blocks inside the `<Canvas>`:

```tsx
        {/* Tak (kun for bygg som har tak definert) */}
        {alleBygg.map((b) => (
          <Tak key={`tak-${b.navn}`} boks={b} />
        ))}

        {/* Vindskie og toppbord */}
        {alleBygg.map((b) => (
          <Vindskie key={`vsk-${b.navn}`} boks={b} />
        ))}
        {alleBygg.map((b) => (
          <Toppbord key={`top-${b.navn}`} boks={b} />
        ))}

        {/* Takrenner langs raften (langsidene) */}
        {alleBygg.map((b) => (
          <Takrenne key={`tkr-${b.navn}`} boks={b} />
        ))}
```

with:

```tsx
        {visTak && (
          <>
            {/* Tak (kun for bygg som har tak definert) */}
            {alleBygg.map((b) => (
              <Tak key={`tak-${b.navn}`} boks={b} />
            ))}

            {/* Vindskie og toppbord */}
            {alleBygg.map((b) => (
              <Vindskie key={`vsk-${b.navn}`} boks={b} />
            ))}
            {alleBygg.map((b) => (
              <Toppbord key={`top-${b.navn}`} boks={b} />
            ))}

            {/* Takrenner langs raften (langsidene) */}
            {alleBygg.map((b) => (
              <Takrenne key={`tkr-${b.navn}`} boks={b} />
            ))}
          </>
        )}
```

- [ ] **Step 4: Verify in browser**

Reload `/3d`. Expected: en «Skjul tak»-knapp øverst til venstre i 3D-vinduet. Klikk: tak, vindskier, toppbord og takrenner forsvinner. Klikk igjen: de kommer tilbake.

---

## Task 7: Create the 2D and 3D pages for tilbygget

**Files:**
- Create: `app/tilbygget/page.tsx`
- Create: `app/tilbygget/3d/page.tsx`

- [ ] **Step 1: Create `app/tilbygget/page.tsx`**

```tsx
import Link from "next/link";
import Plan2D from "@/components/Plan2D";
import { tilbyggetInnvendig } from "@/lib/bygg";

export default function TilbyggetPage() {
  const rom = tilbyggetInnvendig.rom ?? [];
  const totalAreal = rom
    .reduce((sum, r) => sum + r.bredde * r.dybde, 0)
    .toFixed(2);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{tilbyggetInnvendig.navn}</h1>
        <p className="mt-2 text-stone-600">{tilbyggetInnvendig.beskrivelse}.</p>
      </div>

      <Plan2D design={tilbyggetInnvendig} />

      <div className="grid gap-4 sm:grid-cols-3">
        {rom.map((r) => (
          <div
            key={r.navn}
            className="rounded-xl border border-stone-200 bg-white p-5"
          >
            <h2 className="font-semibold">{r.navn}</h2>
            <p className="mt-1 text-sm text-stone-600">
              {r.bredde} × {r.dybde} m — {(r.bredde * r.dybde).toFixed(2)} m²
            </p>
          </div>
        ))}
      </div>

      <p className="text-stone-600">
        Totalt grunnflate: {totalAreal} m². Vil du se det i 3D?{" "}
        <Link
          href="/tilbygget/3d"
          className="font-medium text-amber-700 underline"
        >
          Åpne 3D-modellen
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/tilbygget/3d/page.tsx`**

```tsx
import Modell3D from "@/components/Modell3D";
import { tilbyggetInnvendig } from "@/lib/bygg";

export default function TilbyggetTreDPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{tilbyggetInnvendig.navn} — 3D</h1>
        <p className="mt-2 text-stone-600">
          Taket er skjult som standard så du kan se ned i rommene. Klikk
          knappen i hjørnet for å vise det igjen. Dra for å rotere, rull for å
          zoome.
        </p>
      </div>
      <Modell3D design={tilbyggetInnvendig} initialVisTak={false} />
    </div>
  );
}
```

- [ ] **Step 3: Verify the routes load (without menu link yet)**

Visit `http://localhost:3000/tilbygget` directly. Expected: 2D-tegning som zoomer på tilbygget, tre rom navngitt og dimensjonert, tre kort under tegningen.

Visit `http://localhost:3000/tilbygget/3d`. Expected: 3D-modell av tilbygget uten tak, med synlige innervegger og en glassdør mellom Relax og Badstue. «Vis tak»-knapp synlig øverst til venstre.

---

## Task 8: Add menu links

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add the new nav section**

In `app/layout.tsx`, find the `<div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">` block. Add a new section after the «Tilbygg bakover»-lenkene, inside the same div:

```tsx
              <span className="font-semibold text-stone-500">Tilbygget:</span>
              <Link href="/tilbygget" className="text-stone-700 hover:text-amber-700">
                2D
              </Link>
              <Link href="/tilbygget/3d" className="text-stone-700 hover:text-amber-700">
                3D
              </Link>
```

- [ ] **Step 2: Verify in browser**

Reload any page. Expected: ny «Tilbygget:» seksjon i toppmenyen, med 2D- og 3D-lenker som funker.

---

## Task 9: End-to-end sanity check

- [ ] **Step 1: Klikk gjennom alle visningene**

Med `npm run dev` kjørende, gå gjennom hver side:

- `/` — Original 2D: tilbygget skal ha smørebod-dør på fronten, badstuevindu i midten, og bakvindu i Relax-området. INGEN vertikal vegg gjennom midten av tilbygget.
- `/3d` — Original 3D: samme fasade-detaljer i 3D. Tak-knappen virker.
- `/v2` og `/v2/3d` — samme endringer i den bakover-skjøvne varianten.
- `/tilbygget` — interiør 2D: tre rom (Relax, Badstue, Smørebod) navngitt og dimensjonert. Ingen «Nytt tilbygg»-tekst midt i bygget.
- `/tilbygget/3d` — interiør 3D: ingen tak (default), innervegger synlige, glassdør mellom Relax og Badstue. Smørebod-døra synlig fra siden. «Vis tak»-knappen funker.

- [ ] **Step 2: Sjekk TypeScript en siste gang**

Run: `npx tsc --noEmit`

Expected: ingen feil.

- [ ] **Step 3: Sjekk produksjonsbygg**

Run: `npm run build`

Expected: bygg fullføres uten feil. Alle ruter (inkludert `/tilbygget` og `/tilbygget/3d`) listes i output.

---

## Done

Når alle stegene over fungerer, er featuren ferdig. Det er ingen automatiske tester i prosjektet — visuell verifisering i nettleseren er den autoritative testen.
