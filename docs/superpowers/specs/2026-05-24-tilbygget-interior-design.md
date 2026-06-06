# Tilbygget — innvendig visning (2D + 3D)

**Dato:** 2026-05-24
**Formål:** Vise interiørplanen for det planlagte tilbygget (3 rom) som et eget «sideprosjekt» i menyen, både i 2D og 3D.

## Bakgrunn

Tilbygget er 5,4 × 2,7 m (= 14,58 m², under grensen på 15 m²). Skissen Trond tegnet viser fire rom, men vi reduserer til tre etter Tronds avklaring:

- **Relax** (nærmest hytta) — 2,2 m bred × 2,7 m dyp = **5,94 m²**
- **Badstue** (midten) — 2,0 m bred × 2,7 m dyp = **5,40 m²**
- **Smørebod** (ytterst) — 1,2 m bred × 2,7 m dyp = **3,24 m²**

Dette designet endrer også eksteriøret minimalt (smørebod-dør på fronten, vinduer flyttet), og rydder vekk den foreldede `innerveggBadstue` fra forrige iterasjon.

## Endringer i `lib/bygg.ts`

### Fjernes
- `innerveggBadstue`-funksjonen og dens bruk i `design1.levegger` og `design2.levegger`. Erstattes ikke der — `design1` og `design2` viser tilbygget som ett rom igjen.

### Nye/endrede åpninger på `tilbygg`
| Åpning | Vegg | Avstand | Bredde | Høyde | Bunn | Topp | Kommentar |
|---|---|---|---|---|---|---|---|
| Glassdør Relax | front | 0.3 | 0.8 | 2.0 | 0.12 | 2.12 | Uendret — samme dimensjoner som hyttas terrassedør |
| Vindu badstue (liggende) | front | 2.6 | 1.2 | 0.6 | 1.70 | 2.30 | Sentrert i badstuens 2,0 m bredde, topp matcher hyttas vindustopp |
| Ytterdør smørebod | front | 4.45 | 0.7 | 2.05 | 0.12 | 2.17 | Sentrert i smørebodens 1,2 m, oker-gul (`#c89a3a`) som hytteinngangen |
| Vindu Relax (liggende) | bak | 0.5 | 1.2 | 0.6 | 1.70 | 2.30 | Flyttet inn fra avstand 1.0 så den ligger pent i Relax, hevet til topp 2.30 for symmetri med badstuevinduet |

### Nytt `Design`: `tilbyggetInnvendig`

```ts
const tilbyggInteriør: Boks = { ...tilbygg, x: 0, z: 0 };
```

Tilbygget flyttes til origo for at 2D-tegningen skal zoome inn naturlig (Plan2D regner svg-størrelse fra `maxX`/`maxZ`).

**Innervegger** (`Levegg`):
- **Innervegg Relax/Badstue**: ved x = 2.2, fra z = 0 til z = 2.7, høyde = 2.6 m, tykkelse = 0.12 m, farge `#c7a874` (lyst trepanel). Har **glassdør** midt på (senterAvstand 1.35), bredde 0.7, høyde 2.0, bunn 0.12.
- **Innervegg Badstue/Smørebod**: ved x = 4.2, fra z = 0 til z = 2.7, samme høyde/tykkelse/farge. **Ingen dør** (smørebod nås kun fra terrassen).

**Komplett struktur:**
```ts
export const tilbyggetInnvendig: Design = {
  navn: "Tilbygget — innvendig",
  beskrivelse: "Romfordeling: Relax (5,94 m²), badstue (5,40 m²) og smørebod (3,24 m²)",
  alleBygg: [tilbyggInteriør],
  terrasser: [],
  levegger: [innerveggRelaxBadstue, innerveggBadstueSmoreboda],
  gjerder: [],
  trapper: [],
};
```

### Ny `Rom`-type og romliste

For å vise romnavn + areal i 2D legges en ny valgfri felt på `Design`:

```ts
export type Rom = {
  navn: string;
  x: number; z: number;     // hjørne av rommet (interiør, dvs. innenfor veggene)
  bredde: number; dybde: number;
};

export type Design = {
  // … eksisterende felt …
  rom?: Rom[];
};
```

`tilbyggetInnvendig.rom`:
- `Relax` ved (0, 0), 2,2 × 2,7
- `Badstue` ved (2,2, 0), 2,0 × 2,7
- `Smørebod` ved (4,2, 0), 1,2 × 2,7

(Romgrensene flukter med innerveggene — vi forenkler ved å ikke trekke fra veggtykkelse. Arealene er bruttotall.)

## Endringer i `components/Plan2D.tsx`

- Etter at byggene er tegnet, render `design.rom` (hvis definert) som tekst-labels: romnavn (fet) + areal (m²) midt i hvert rom.
- Når `design.rom` er definert, undertrykk **både** `boks.navn`-labelet og dimensjonsteksten («5,4 m × 2,7 m») som ellers tegnes midt i bygget. Selve bygget-rektangelet (omrisset) tegnes som før.

## Endringer i `components/Modell3D.tsx`

Legg til en intern toggle for taket:

```tsx
const [visTak, setVisTak] = useState(initialVisTak ?? true);
```

- Ny prop: `initialVisTak?: boolean` (default `true`)
- Knapp i overlay over canvas (øverst til venstre): «Skjul tak» / «Vis tak»
- Når `visTak === false`, hopp over `Tak`, `Vindskie`, `Toppbord`, `Takrenne` for alle bygg

For interiør-siden settes `initialVisTak={false}` så man ser ned i rommene fra start.

## Nye sider

### `app/tilbygget/page.tsx` (2D)
```tsx
import Plan2D from "@/components/Plan2D";
import { tilbyggetInnvendig } from "@/lib/bygg";

export default function TilbyggetPage() {
  return (
    <div className="space-y-8">
      <h1>Tilbygget — innvendig</h1>
      <p>Romfordeling: Relax, badstue og smørebod (totalt 14,58 m²).</p>
      <Plan2D design={tilbyggetInnvendig} />
      {/* Tre kort med romnavn + areal */}
    </div>
  );
}
```

### `app/tilbygget/3d/page.tsx` (3D)
```tsx
"use client";  // hvis nødvendig — Modell3D er allerede client
import Modell3D from "@/components/Modell3D";
import { tilbyggetInnvendig } from "@/lib/bygg";

export default function TilbyggetTreDPage() {
  return (
    <div>
      <h1>Tilbygget — innvendig 3D</h1>
      <Modell3D design={tilbyggetInnvendig} initialVisTak={false} />
    </div>
  );
}
```

## Menyendring i `app/layout.tsx`

Legg til en ny seksjon i nav etter «Tilbygg bakover»:

```tsx
<span className="font-semibold text-stone-500">Tilbygget:</span>
<Link href="/tilbygget">2D</Link>
<Link href="/tilbygget/3d">3D</Link>
```

## Hva vi ikke gjør (YAGNI)

- Ingen møblering (badstuovn, benker, ski-stativ).
- Ingen dørsving-streker i 2D — kun selve dørrektangelet.
- Ingen separat 2D-komponent — gjenbruker `Plan2D` med utvidet datamodell.
- Smøreboden får ikke vindu. Trond har ikke spesifisert et og det er en kald bod.

## Implementeringsrekkefølge (skisse)

1. Datamodell-endringer i `lib/bygg.ts` (fjern `innerveggBadstue`, endre tilbygg-åpninger, definer `Rom`-type, definer `tilbyggetInnvendig`).
2. `Plan2D`: render rom-labels.
3. `Modell3D`: legg til tak-toggle og `initialVisTak`-prop.
4. Nye sider og menylenker.
5. Manuell sjekk i nettleseren: `/`, `/3d`, `/v2`, `/v2/3d`, `/tilbygget`, `/tilbygget/3d`. Bekreft at smørebod-døra og det flyttede bakvinduet ser greit ut på de eksisterende designene.
