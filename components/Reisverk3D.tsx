"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { tilbygg, innerveggRelaxBadstue, innerveggBadstueSmorebod } from "@/lib/bygg";

// Reisverk-3D — viser kun det bærende treverket i tilbygget.
// Ingen panel, ingen iso, ingen taktekking — bare bjelker og stendere
// i sine virkelige dimensjoner. Hyttas vegg vises som en grå plate på
// venstre gavl for å vise hvor tilbygget kobler seg på.
//
// Alle dimensjoner er i mm i kommentarer, men brukes i meter i three.js.

// ---- Konfig ----
const STENDER = { b: 0.048, t: 0.148 }; // 48×148
const SVILL = { b: 0.048, t: 0.198 };   // 48×198 gulvsvill og gulvbjelker
const BINDE = { b: 0.048, t: 0.198 };   // 48×198 bindebjelke = himlingsbjelke
const SPERR = { b: 0.048, t: 0.148 };   // 48×148 sperrer
const HANE = { b: 0.048, t: 0.098 };    // 48×98 hanebjelke
const MONE = { b: 0.048, t: 0.148 };    // 48×148 mønebjelke
const PILAR_R = 0.125;                  // Ø250 mm
const CC = 0.6;                         // 600 mm c/c

const FARGE = {
  tre: "#a8855a",
  treMork: "#8b6f47",
  hane: "#956d3d",
  pilar: "#9ea3a6",
  hyttevegg: "#4a3e35",
};

// Pilarens høyde over bakken og gulvnivå
const PILAR_H = 0.4;          // kryperom-høyde
const yPilarTop = PILAR_H;     // top på pilaren
const yGulvOver = yPilarTop + SVILL.t; // over svill/bjelke (gulvnivået)
const VEGGHOYDE = 2.6;
const yVeggtopp = yGulvOver + VEGGHOYDE;
const TAKVINKEL = (25 * Math.PI) / 180;
const moneHoyde = (tilbygg.dybde / 2) * Math.tan(TAKVINKEL);
const yMone = yVeggtopp + moneHoyde;
const RAFT = 0.4; // takutstikk i meter — gir lufting inn under raften

// Stenderposisjoner langs en vegg: c/c 600 mm + alltid en stender helt ved
// hver ende, slik at karm-stenderne ikke havner utenfor veggen.
function stenderXer(lengde: number): number[] {
  const eps = 0.01;
  const ps: number[] = [];
  for (let i = 0; i * CC < lengde - eps; i++) ps.push(i * CC);
  if (ps.length === 0 || ps[ps.length - 1] < lengde - eps) ps.push(lengde);
  return ps;
}

// ---- Hjelpekomponenter ----------------------------------------------

// Boks: posisjon = senter (x,y,z), dimensjoner i meter (bx, by, bz)
function Boks({
  pos, dim, farge, rot,
}: {
  pos: [number, number, number];
  dim: [number, number, number];
  farge: string;
  rot?: [number, number, number];
}) {
  return (
    <mesh position={pos} rotation={rot}>
      <boxGeometry args={dim} />
      <meshStandardMaterial color={farge} roughness={0.85} />
    </mesh>
  );
}

// Bjelke fra (x1, z1) til (x2, z2) i samme y. Dim = [b, t].
// "horisontal" — i x/z-planet.
function HorisontalBjelke({
  fra, til, y, dim, farge = FARGE.tre,
}: {
  fra: [number, number]; til: [number, number]; y: number;
  dim: { b: number; t: number };
  farge?: string;
}) {
  const dx = til[0] - fra[0];
  const dz = til[1] - fra[1];
  const lengde = Math.sqrt(dx * dx + dz * dz);
  const senterX = (fra[0] + til[0]) / 2;
  const senterZ = (fra[1] + til[1]) / 2;
  const rotY = Math.atan2(dx, dz);
  // Default boxGeometry: bredde langs x, høyde langs y, dybde langs z.
  // Vi vil at bjelken har lengde langs z (etter rotasjon), tykkelse langs y.
  return (
    <Boks
      pos={[senterX, y + dim.t / 2, senterZ]}
      dim={[dim.b, dim.t, lengde]}
      farge={farge}
      rot={[0, rotY, 0]}
    />
  );
}

// Vertikal stender: en boks med høyde langs y. dim = {b: bredde langs x, t: tykkelse langs z}.
function Stender({
  x, z, hoyde, dim = STENDER, farge = FARGE.tre, yBunn = yGulvOver,
}: {
  x: number; z: number; hoyde: number;
  dim?: { b: number; t: number };
  farge?: string;
  yBunn?: number;
}) {
  return (
    <Boks
      pos={[x, yBunn + hoyde / 2, z]}
      dim={[dim.b, hoyde, dim.t]}
      farge={farge}
    />
  );
}

// Pilar: en sylinder
function Pilar({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, PILAR_H / 2, z]}>
      <cylinderGeometry args={[PILAR_R, PILAR_R, PILAR_H, 16]} />
      <meshStandardMaterial color={FARGE.pilar} roughness={0.9} />
    </mesh>
  );
}

// Skrå bjelke for sperrer i takstol. Takstolen står i YZ-planet ved en
// fast x = xTakstol. Sperren går fra (z1, y1) til (z2, y2) i dette planet.
// Box-default: bredde-x, høyde-y, dybde-z → dybden settes til lengden av
// sperren, og rotasjon rundt x-aksen tilter den fra horisontal til riktig
// helning.
function SperrBjelke({
  z1, y1, z2, y2, xTakstol, dim = SPERR, farge = FARGE.tre,
}: {
  z1: number; y1: number; z2: number; y2: number; xTakstol: number;
  dim?: { b: number; t: number };
  farge?: string;
}) {
  const dz = z2 - z1;
  const dy = y2 - y1;
  const lengde = Math.sqrt(dz * dz + dy * dy);
  const senterZ = (z1 + z2) / 2;
  const senterY = (y1 + y2) / 2;
  return (
    <Boks
      pos={[xTakstol, senterY, senterZ]}
      dim={[dim.b, dim.t, lengde]}
      farge={farge}
      rot={[-Math.atan2(dy, dz), 0, 0]}
    />
  );
}

// ---- Komposisjoner --------------------------------------------------

function Pilarer() {
  const xs = [0, 1.8, 3.6, 5.4];
  return (
    <>
      {xs.map((x, i) => (
        <Pilar key={`pb-${i}`} x={x} z={0} />
      ))}
      {xs.map((x, i) => (
        <Pilar key={`pf-${i}`} x={x} z={tilbygg.dybde} />
      ))}
    </>
  );
}

function Gulvkonstruksjon() {
  return (
    <>
      {/* Svill langs bak og front */}
      <HorisontalBjelke fra={[0, 0]} til={[tilbygg.bredde, 0]} y={yPilarTop} dim={SVILL} />
      <HorisontalBjelke fra={[0, tilbygg.dybde]} til={[tilbygg.bredde, tilbygg.dybde]} y={yPilarTop} dim={SVILL} />

      {/* Gulvbjelker c/c 600 mm langs z, dim 48×198 */}
      {Array.from({ length: Math.round(tilbygg.bredde / CC) + 1 }, (_, i) => i * CC).map((x, i) => (
        <HorisontalBjelke
          key={`gb-${i}`}
          fra={[x, 0]}
          til={[x, tilbygg.dybde]}
          y={yPilarTop}
          dim={SVILL}
        />
      ))}
    </>
  );
}

// Stender-rad langs en x-akse-strekning (bakvegg eller frontvegg)
function StenderRad({ z, fraX, tilX, apninger = [] }: {
  z: number; fraX: number; tilX: number;
  apninger?: { fra: number; til: number; bunn: number; topp: number }[];
}) {
  // Bunn- og toppsvill langs x
  return (
    <>
      <HorisontalBjelke fra={[fraX, z]} til={[tilX, z]} y={yGulvOver} dim={STENDER} />
      <HorisontalBjelke fra={[fraX, z]} til={[tilX, z]} y={yVeggtopp - STENDER.t} dim={STENDER} />

      {/* Stendere c/c */}
      {Array.from(
        { length: Math.round((tilX - fraX) / CC) + 1 },
        (_, i) => fraX + i * CC,
      ).map((x, i) => {
        // Sjekk om denne stenderen kolliderer med en åpning — hopp over
        const iApning = apninger.some((a) => x > a.fra + 0.05 && x < a.til - 0.05);
        if (iApning) return null;
        return (
          <Stender key={`s-${z}-${i}`} x={x} z={z} hoyde={VEGGHOYDE - STENDER.t * 2} yBunn={yGulvOver + STENDER.t} />
        );
      })}

      {/* Karm-stendere rundt åpninger */}
      {apninger.map((a, i) => (
        <group key={`apn-${i}`}>
          {/* Stender på hver side av åpningen */}
          <Stender x={a.fra} z={z} hoyde={VEGGHOYDE - STENDER.t * 2} yBunn={yGulvOver + STENDER.t} />
          <Stender x={a.til} z={z} hoyde={VEGGHOYDE - STENDER.t * 2} yBunn={yGulvOver + STENDER.t} />
          {/* Overligger over åpningen */}
          <HorisontalBjelke fra={[a.fra, z]} til={[a.til, z]} y={yGulvOver + a.topp} dim={STENDER} />
          {/* Under-svill ved bunnen av åpningen hvis bunn > 0 */}
          {a.bunn > 0 && (
            <HorisontalBjelke fra={[a.fra, z]} til={[a.til, z]} y={yGulvOver + a.bunn} dim={STENDER} />
          )}
        </group>
      ))}
    </>
  );
}

function GavlStendere({ x }: { x: number }) {
  // Gavl-veggen på høyre side (x = tilbygg.bredde). Stendere langs z.
  return (
    <>
      {/* Bunn- og topp-svill langs z */}
      <HorisontalBjelke fra={[x, 0]} til={[x, tilbygg.dybde]} y={yGulvOver} dim={STENDER} />
      <HorisontalBjelke fra={[x, 0]} til={[x, tilbygg.dybde]} y={yVeggtopp - STENDER.t} dim={STENDER} />

      {/* Stendere langs z, c/c 600 + alltid en helt ved hver ende */}
      {stenderXer(tilbygg.dybde).map((z, i) => (
        <Stender
          key={`gs-${i}`}
          x={x}
          z={z}
          hoyde={VEGGHOYDE - STENDER.t * 2}
          yBunn={yGulvOver + STENDER.t}
        />
      ))}

      {/* Gavl-trekanten oppe — kort stender opp i mønet */}
      <Stender
        x={x}
        z={tilbygg.dybde / 2}
        hoyde={moneHoyde}
        yBunn={yVeggtopp}
      />
    </>
  );
}

// Hyttas vegg vises som en grå flate på venstre side
function Hyttevegg() {
  return (
    <mesh position={[0, yGulvOver + VEGGHOYDE / 2, tilbygg.dybde / 2]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[tilbygg.dybde, VEGGHOYDE + moneHoyde]} />
      <meshStandardMaterial color={FARGE.hyttevegg} side={2} />
    </mesh>
  );
}

function Innervegg({ x, harDor }: { x: number; harDor: boolean }) {
  // Innervegg fra z=0 til z=tilbygg.dybde, ved gitt x. Stendere langs z.
  const dorBredde = 0.7;
  const dorHoyde = 2.0;
  const dorSenterZ = harDor ? 1.75 : 0;
  const dorFra = dorSenterZ - dorBredde / 2;
  const dorTil = dorSenterZ + dorBredde / 2;

  return (
    <>
      {/* Bunn- og topp-svill */}
      <HorisontalBjelke fra={[x, 0]} til={[x, tilbygg.dybde]} y={yGulvOver} dim={STENDER} />
      <HorisontalBjelke fra={[x, 0]} til={[x, tilbygg.dybde]} y={yVeggtopp - STENDER.t} dim={STENDER} />

      {/* Stendere c/c 600 + alltid en helt ved hver ende */}
      {stenderXer(tilbygg.dybde).map((z, i) => {
        if (harDor && z > dorFra + 0.05 && z < dorTil - 0.05) return null;
        return (
          <Stender
            key={`iv-${x}-${i}`}
            x={x}
            z={z}
            hoyde={VEGGHOYDE - STENDER.t * 2}
            yBunn={yGulvOver + STENDER.t}
          />
        );
      })}

      {harDor && (
        <>
          <Stender x={x} z={dorFra} hoyde={VEGGHOYDE - STENDER.t * 2} yBunn={yGulvOver + STENDER.t} />
          <Stender x={x} z={dorTil} hoyde={VEGGHOYDE - STENDER.t * 2} yBunn={yGulvOver + STENDER.t} />
          {/* Dør-overligger */}
          <HorisontalBjelke fra={[x, dorFra]} til={[x, dorTil]} y={yGulvOver + dorHoyde} dim={STENDER} />
        </>
      )}
    </>
  );
}

// Én takstol ved gitt x-posisjon
function Takstol({ x }: { x: number }) {
  // Bindebjelke 48×198 langs z fra 0 til dybde
  // Sperrer 48×148 fra (0, yVeggtopp) til (dybde/2, yMone) og videre til (dybde, yVeggtopp)
  // Hanebjelke 48×98 horisontalt mellom sperrene ca 55% opp

  // Sperren ligger i xy-snittet ved z=x (i takstol-koordinater), men vi tegner den i 3D
  // ved fast x og varierende z + y.

  const venstreZ = 0;
  const hoyreZ = tilbygg.dybde;
  const moneZ = tilbygg.dybde / 2;

  // Sperrene går RAFT m forbi veggen — endepunktet ligger lavere enn
  // veggtopp siden taket fortsetter ned i samme vinkel.
  const raftDrop = RAFT * Math.tan(TAKVINKEL);
  const sperrVenstreZ = venstreZ - RAFT;
  const sperrHoyreZ = hoyreZ + RAFT;
  const ySperrEnde = yVeggtopp - raftDrop;

  // Hanebjelken plasseres 55% opp langs sperren (samme andel av både
  // z- og y-strekket — derfor hanePos begge steder, ikke 1-hanePos).
  const hanePos = 0.55;
  const haneVZ = venstreZ + (moneZ - venstreZ) * hanePos;
  const haneHZ = hoyreZ + (moneZ - hoyreZ) * hanePos;
  const haneY = yVeggtopp + moneHoyde * hanePos;

  return (
    <>
      {/* Bindebjelke 48×198 — den horisontale undergurten i takstolen.
          Toppen flukter med veggtoppen så den ikke stikker opp gjennom takflaten. */}
      <HorisontalBjelke
        fra={[x, venstreZ]}
        til={[x, hoyreZ]}
        y={yVeggtopp - BINDE.t}
        dim={BINDE}
        farge={FARGE.treMork}
      />

      {/* Sperrer i yz-plan ved fast x. Strekker seg 40 cm forbi veggen
          på hver side (raft) — luftingen kommer inn under raften. */}
      <SperrBjelke
        z1={sperrVenstreZ}
        y1={ySperrEnde}
        z2={moneZ}
        y2={yMone}
        xTakstol={x}
      />
      <SperrBjelke
        z1={moneZ}
        y1={yMone}
        z2={sperrHoyreZ}
        y2={ySperrEnde}
        xTakstol={x}
      />

      {/* Hanebjelke 48×98 horisontalt mellom sperrene — sentrert vertikalt
          på sperrens midtlinje så den ikke stikker opp over taket. */}
      <HorisontalBjelke
        fra={[x, haneVZ]}
        til={[x, haneHZ]}
        y={haneY - HANE.t / 2}
        dim={HANE}
        farge={FARGE.hane}
      />
    </>
  );
}

function Takstoler() {
  const antall = Math.round(tilbygg.bredde / CC) + 1;
  return (
    <>
      {Array.from({ length: antall }, (_, i) => i * CC).map((x, i) => (
        <Takstol key={`ts-${i}`} x={x} />
      ))}
    </>
  );
}

function Monebjelke() {
  return (
    <HorisontalBjelke
      fra={[-0.4, tilbygg.dybde / 2]}
      til={[tilbygg.bredde + 0.4, tilbygg.dybde / 2]}
      y={yMone - MONE.t}
      dim={MONE}
      farge={FARGE.treMork}
    />
  );
}

// ---- Hoved-komponent ------------------------------------------------
export default function Reisverk3D() {
  // Front-vegg-åpninger (fra modellen)
  const frontApninger = (tilbygg.apninger ?? [])
    .filter((a) => a.vegg === "front")
    .map((a) => ({
      fra: a.avstand,
      til: a.avstand + a.bredde,
      bunn: a.bunn,
      topp: a.bunn + a.hoyde,
    }));

  void innerveggRelaxBadstue;
  void innerveggBadstueSmorebod;

  return (
    <div className="relative h-[75vh] w-full overflow-hidden rounded-xl border border-stone-300 bg-sky-50">
      <Canvas camera={{ position: [10, 7, 9], fov: 45 }}>
        <color attach="background" args={["#e8eef0"]} />

        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 14, 8]} intensity={1.1} />
        <directionalLight position={[-8, 6, -4]} intensity={0.4} />

        {/* Bakke */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.7, 0, 1.35]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#9aa884" />
        </mesh>
        <Grid args={[20, 20]} cellSize={1} cellColor="#7e8a6a" sectionColor="#5f6a4f" sectionSize={5} position={[2.7, 0.01, 1.35]} />

        {/* Hyttas vegg (markering) */}
        <Hyttevegg />

        {/* Reisverket */}
        <Pilarer />
        <Gulvkonstruksjon />

        {/* Bakvegg z=0 — ingen åpninger */}
        <StenderRad z={0} fraX={0} tilX={tilbygg.bredde} />

        {/* Frontvegg z=2.7 — med åpninger */}
        <StenderRad z={tilbygg.dybde} fraX={0} tilX={tilbygg.bredde} apninger={frontApninger} />

        {/* Høyre gavl (x = bredde) — ingen venstre gavl, det er hyttas vegg */}
        <GavlStendere x={tilbygg.bredde} />

        {/* Innervegger */}
        <Innervegg x={2.2} harDor />
        <Innervegg x={4.2} harDor={false} />

        {/* Takstoler */}
        <Takstoler />
        <Monebjelke />

        <OrbitControls target={[tilbygg.bredde / 2, 1.5, tilbygg.dybde / 2]} />
      </Canvas>
    </div>
  );
}
