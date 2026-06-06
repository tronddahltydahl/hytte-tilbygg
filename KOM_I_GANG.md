# Kom i gang — Hyttetilbygg

Du har gjort dette før med butikken, så her er kortversjonen.

## 1. Åpne en terminal i prosjektmappen

```
cd C:\Users\TrondDahl\Claud-trond\hytte-tilbygg
```

## 2. Installer avhengighetene (engangsjobb)

```
npm install
```

Denne tar litt lengre tid enn butikken (1–2 minutter) fordi
3D-biblioteket three.js er større. Gule advarsler er normalt — se kun
etter røde feilmeldinger.

## 3. Start dev-serveren

```
npm run dev
```

Åpne http://localhost:3000 — du ser plantegningen (2D).
Klikk "3D-modell" i toppen for å se hytta og tilbygget i 3D. Dra med
musa for å rotere.

La denne terminalen stå åpen.

## 4. Start Claude Code i et nytt terminalvindu

Nytt vindu, naviger til samme mappe:

```
cd C:\Users\TrondDahl\Claud-trond\hytte-tilbygg
claude
```

## 5. Prøv en endring

Alle mål ligger i `lib/bygg.ts`. Be Claude Code om for eksempel:

> Gjør tilbygget 6 meter bredt i stedet for 4, og endre fargen til en
> lysere trefarge.

Hold øye med nettleseren — både 2D-tegningen og 3D-modellen oppdaterer
seg automatisk.

## Tilpass til din egen hytte

Det første du bør gjøre er å legge inn de faktiske målene på hytta di.
Be Claude Code: "Endre målene på den eksisterende hytta til X meter bred
og Y meter dyp" — eller åpne `lib/bygg.ts` og endre tallene selv.

## Husk

Dette verktøyet er for å leke med ideer og se former. Skal tilbygget
faktisk bygges, må mål, bæreevne og søknadsplikt sjekkes med kommunen
og en fagperson.
