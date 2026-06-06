# Hyttetilbygg — kontekst for Claude Code

Dette er et lite visualiseringsverktøy for å tegne et tilbygg på en hytte.
Brukeren (Trond) har litt erfaring med koding og lærer Next.js. Vær
pedagogisk: forklar kort hva du gjør og hvorfor, men ikke overforklar
grunnleggende ting.

Formålet er å VISUALISERE IDEER — ikke å lage offisielle
byggesøknadstegninger. Hvis Trond spør om noe som krever fagkompetanse
(bæreevne, snølast, brannkrav, søknadsplikt, avstand til nabogrense),
minn vennlig om at det må sjekkes med kommunen eller en fagperson.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Three Fiber (@react-three/fiber) + drei — for 3D
- three.js under panseret

## Kommandoer

- `npm run dev` — start dev-server (http://localhost:3000)
- `npm run build` — bygg for produksjon

## Filstruktur

```
app/
  layout.tsx      ← felles ramme (header, footer)
  page.tsx        ← forside: 2D plantegning (/)
  3d/page.tsx     ← 3D-modell (/3d)
  globals.css
components/
  Plan2D.tsx      ← SVG-plantegning, sett ovenfra
  Modell3D.tsx    ← 3D-scene (React Three Fiber) — har "use client"
lib/
  bygg.ts         ← ALLE mål og data for byggene
```

## Viktigste fil: lib/bygg.ts

All geometri styres herfra. Hver bygning er en `Boks` med mål i meter:
bredde (x), dybde (z), hoyde (y), posisjon (x, z) og farge. Både 2D- og
3D-visningen leser fra samme data — endrer du et tall her, oppdaterer
begge visningene seg.

Koordinatsystem: x = bredde (mot høyre), z = dybde (nedover i planen),
y = høyde (opp). Alt i meter. Posisjonen (x, z) er hjørnet til bygget.

## Kodestil

- Norsk i variabel- og funksjonsnavn der det er naturlig.
- Tailwind-klasser for styling.
- 3D-komponenter må ha `"use client"` øverst.
- Server-komponenter som default ellers.

## Gode "be Claude Code om dette"-oppgaver

1. Endre målene på tilbygget (gjøres i lib/bygg.ts).
2. Flytt tilbygget til en annen side av hytta.
3. Legg til et tredje bygg — f.eks. en terrasse eller et bod.
4. Legg til skråtak på byggene i 3D-modellen.
5. Legg til vinduer og en dør på tilbygget i 3D.
6. Vis samlet areal og volum på forsiden.
7. Lag et kontrollpanel med skyveknapper for å endre mål live.
8. Legg til møblering (seng, sofa, bord) i 2D-plantegningen.
9. Legg til en knapp for å eksportere tegningen som bilde.

Etter endringer: oppsummer kort hva du gjorde og hva Trond kan se etter
i nettleseren.

## Råd til Claude Code

- Hold 2D og 3D synkronisert — begge skal lese fra lib/bygg.ts.
- React Three Fiber: nye objekter er `<mesh>` med en geometri og et
  materiale. Hold scenen enkel og lesbar.
- Hvis du må installere en ny pakke, fortell Trond hvilken
  `npm install`-kommando han skal kjøre, i stedet for å kjøre den selv.
