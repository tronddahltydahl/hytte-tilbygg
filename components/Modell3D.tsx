"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import {
  veggInfo,
  type Apning,
  type Boks,
  type Design,
  type Gjerde as GjerdeType,
  type Levegg,
  type Mobel,
  type Terrasse as TerrasseType,
  type Trapp as TrappType,
} from "@/lib/bygg";

// Bygger en 2D-shape av en vegg med rektangulære hull der vinduene/dørene er.
// Brukes til å klippe ekte hull i innevisningens vegger, så man kan se ut.
function lagVeggGeometri(
  bredde: number,
  hoyde: number,
  apninger: Apning[],
): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(bredde, 0);
  shape.lineTo(bredde, hoyde);
  shape.lineTo(0, hoyde);
  shape.lineTo(0, 0);

  apninger.forEach((a) => {
    // Motsatt vikleretning av ytre shape (CW vs CCW) så trianguleringen
    // forstår at dette er et hull.
    const hull = new THREE.Path();
    hull.moveTo(a.avstand, a.bunn);
    hull.lineTo(a.avstand, a.bunn + a.hoyde);
    hull.lineTo(a.avstand + a.bredde, a.bunn + a.hoyde);
    hull.lineTo(a.avstand + a.bredde, a.bunn);
    hull.lineTo(a.avstand, a.bunn);
    shape.holes.push(hull);
  });

  return new THREE.ShapeGeometry(shape);
}

// Én bygning. Uten innhugg blir det en enkel boks; med innhugg lager vi
// en L-formet grunnflate og ekstruderer den oppover til veggtoppen.
function Bygning({ boks, skjulTopp }: { boks: Boks; skjulTopp?: boolean }) {
  const { geometri, posisjon } = useMemo(() => {
    if (!boks.innhugg) {
      // Three.js plasserer bokser fra midten, så vi regner om fra hjørne.
      return {
        geometri: new THREE.BoxGeometry(boks.bredde, boks.hoyde, boks.dybde),
        posisjon: [
          boks.x + boks.bredde / 2,
          boks.hoyde / 2,
          boks.z + boks.dybde / 2,
        ] as [number, number, number],
      };
    }

    // L-form: tegn omrisset i 2D (a, b), ekstruder i shape-z, og roter slik
    // at ekstruderingen peker oppover i verden. shape-y er negativ slik at
    // den blir positiv world-z etter rotasjonen rotateX(-π/2).
    const ib = boks.innhugg.bredde;
    const id = boks.innhugg.dybde;
    const b = boks.bredde;
    const d = boks.dybde;
    const venstre = boks.innhugg.hjorne === "front-venstre";

    const shape = new THREE.Shape();
    if (venstre) {
      // Innhugg ved (0, d): kutt bort lav-x / høy-z-hjørnet
      shape.moveTo(0, 0);
      shape.lineTo(0, -(d - id));
      shape.lineTo(ib, -(d - id));
      shape.lineTo(ib, -d);
      shape.lineTo(b, -d);
      shape.lineTo(b, 0);
    } else {
      // Innhugg ved (b, d): kutt bort høy-x / høy-z-hjørnet
      shape.moveTo(0, 0);
      shape.lineTo(0, -d);
      shape.lineTo(b - ib, -d);
      shape.lineTo(b - ib, -(d - id));
      shape.lineTo(b, -(d - id));
      shape.lineTo(b, 0);
    }

    const g = new THREE.ExtrudeGeometry(shape, {
      depth: boks.hoyde,
      bevelEnabled: false,
    });
    g.rotateX(-Math.PI / 2);

    return {
      geometri: g,
      posisjon: [boks.x, 0, boks.z] as [number, number, number],
    };
  }, [boks]);

  // Åpen-topp-rendering: når taket er skjult og bygget ikke har innhugg,
  // tegner vi de fire veggene + gulvet. Hver vegg er en 2D-shape med
  // rektangulære hull der vinduene/dørene er — slik at man faktisk kan se
  // ut. To meshes per vegg (FrontSide + BackSide) gir ulik farge på ute og
  // inne. gulvFarge overstyrer for gulvet.
  if (skjulTopp && !boks.innhugg) {
    const { x, z, bredde, dybde, hoyde, farge } = boks;
    const gulvFarge = boks.gulvFarge ?? farge;
    const inneFarge = boks.inneFarge ?? farge;
    const apninger = boks.apninger ?? [];

    // En vegg = to mesh i samme posisjon: FrontSide og BackSide med hver
    // sin farge. innerErFront sier hvilken side som vender mot rommet.
    const vegg = (
      key: string,
      pos: [number, number, number],
      rot: [number, number, number],
      veggBredde: number,
      apningerPaaVegg: Apning[],
      innerErFront: boolean,
    ) => {
      const geo = lagVeggGeometri(veggBredde, hoyde, apningerPaaVegg);
      const innerSide = innerErFront ? THREE.FrontSide : THREE.BackSide;
      const outerSide = innerErFront ? THREE.BackSide : THREE.FrontSide;
      return (
        <group key={key} position={pos} rotation={rot}>
          <mesh geometry={geo}>
            <meshStandardMaterial color={inneFarge} side={innerSide} />
          </mesh>
          <mesh geometry={geo}>
            <meshStandardMaterial color={farge} side={outerSide} />
          </mesh>
        </group>
      );
    };

    return (
      <>
        {/* Gulv */}
        <mesh
          position={[x + bredde / 2, 0.01, z + dybde / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[bredde, dybde]} />
          <meshStandardMaterial color={gulvFarge} side={THREE.DoubleSide} />
        </mesh>
        {/* Bak-vegg (z = z): normal +z = inn i rommet → FrontSide = inne */}
        {vegg(
          "bak",
          [x, 0, z],
          [0, 0, 0],
          bredde,
          apninger.filter((a) => a.vegg === "bak"),
          true,
        )}
        {/* Front-vegg (z = z+dybde): normal +z = ut av rommet → FrontSide = ute */}
        {vegg(
          "front",
          [x, 0, z + dybde],
          [0, 0, 0],
          bredde,
          apninger.filter((a) => a.vegg === "front"),
          false,
        )}
        {/* Venstre vegg (x = x): rotert -π/2, normal -x = ut av rommet → FrontSide = ute */}
        {vegg(
          "venstre",
          [x, 0, z],
          [0, -Math.PI / 2, 0],
          dybde,
          apninger.filter((a) => a.vegg === "venstre"),
          false,
        )}
        {/* Høyre vegg (x = x+bredde): rotert -π/2, normal -x = inn i rommet → FrontSide = inne */}
        {vegg(
          "hoyre",
          [x + bredde, 0, z],
          [0, -Math.PI / 2, 0],
          dybde,
          apninger.filter((a) => a.vegg === "hoyre"),
          true,
        )}
      </>
    );
  }

  return (
    <mesh position={posisjon} geometry={geometri}>
      <meshStandardMaterial color={boks.farge} />
    </mesh>
  );
}

// Stolpe som holder oppe taket der hytteveggen er klipt vekk
// (det "manglende" hjørnet av rektangelet).
function Stolpe({ boks }: { boks: Boks }) {
  if (!boks.innhugg) return null;
  const venstre = boks.innhugg.hjorne === "front-venstre";
  const stolpeX = venstre ? boks.x : boks.x + boks.bredde;
  const stolpeZ = boks.z + boks.dybde;
  const stolpeRadius = 0.075; // 7,5 cm radius = 15 cm tykk stolpe
  return (
    <mesh position={[stolpeX, boks.hoyde / 2, stolpeZ]}>
      <cylinderGeometry
        args={[stolpeRadius, stolpeRadius, boks.hoyde, 12]}
      />
      <meshStandardMaterial color="#3a2e1f" />
    </mesh>
  );
}

// Levegg — et fritt-stående veggsegment, tegnes som en tynn boks. Hvis
// leveggen har et vindu, tegnes det som en plate rett utenpå veggen.
function LeveggKomp({ levegg }: { levegg: Levegg }) {
  const dx = levegg.til.x - levegg.fra.x;
  const dz = levegg.til.z - levegg.fra.z;
  const lengde = Math.sqrt(dx * dx + dz * dz);
  // Roter slik at boksens lokale +z (depth-aksen) peker langs leveggen.
  const vinkel = Math.atan2(dx, dz);
  // Utadpekende normal (90° CCW av lengderetningen i xz)
  const normX = -dz / lengde;
  const normZ = dx / lengde;
  // Skyv boksens senter halv tykkelse innover, slik at fra/til-linjen blir
  // ytterveggens flate (i flukt med hyttas frontvegg). Da stikker ikke
  // boksen ut forbi takflaten ved gavlen.
  const senterX =
    (levegg.fra.x + levegg.til.x) / 2 - (levegg.tykkelse / 2) * normX;
  const senterZ =
    (levegg.fra.z + levegg.til.z) / 2 - (levegg.tykkelse / 2) * normZ;

  const v = levegg.vindu;
  return (
    <>
      <mesh
        position={[senterX, levegg.hoyde / 2, senterZ]}
        rotation={[0, vinkel, 0]}
      >
        <boxGeometry args={[levegg.tykkelse, levegg.hoyde, lengde]} />
        <meshStandardMaterial color={levegg.farge} />
      </mesh>
      {v && (() => {
        // Vinduet sitter litt utenfor leveggens ytterflate (fra/til-linjen).
        const wx =
          levegg.fra.x + (dx / lengde) * v.senterAvstand + normX * 0.02;
        const wz =
          levegg.fra.z + (dz / lengde) * v.senterAvstand + normZ * 0.02;
        const wy = v.bunn + v.hoyde / 2;
        const rb = 0.04;
        const innerB = Math.max(0, v.bredde - 2 * rb);
        const innerH = Math.max(0, v.hoyde - 2 * rb);
        const sprosseY = 1.75; // samme som de små vinduene på hytta
        const harSprosse = sprosseY > v.bunn + 0.08 && sprosseY < v.bunn + v.hoyde - 0.08;
        return (
          <group
            position={[wx, wy, wz]}
            rotation={[0, Math.atan2(normX, normZ), 0]}
          >
            <mesh>
              <planeGeometry args={[v.bredde, v.hoyde]} />
              <meshStandardMaterial color="#f5f5f0" side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0, 0.005]}>
              <planeGeometry args={[innerB, innerH]} />
              <meshStandardMaterial
                color="#bdd7e4"
                side={THREE.DoubleSide}
                metalness={0.3}
                roughness={0.2}
              />
            </mesh>
            {harSprosse && (
              <mesh position={[0, sprosseY - wy, 0.01]}>
                <planeGeometry args={[v.bredde, 0.03]} />
                <meshStandardMaterial color="#f5f5f0" side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        );
      })()}

      {levegg.dor && (() => {
        // Dør (typisk glassdør) på leveggen. Synlig fra begge sider — vi
        // tegner én plate på hver side av veggen.
        const d = levegg.dor;
        const isGlass = d.type === "glassdor";
        const dorFarge = isGlass ? "#bdd7e4" : "#a37049";
        const rb = 0.04;
        const innerB = Math.max(0, d.bredde - 2 * rb);
        const innerH = Math.max(0, d.hoyde - 2 * rb);
        const baseX = levegg.fra.x + (dx / lengde) * d.senterAvstand;
        const baseZ = levegg.fra.z + (dz / lengde) * d.senterAvstand;
        const wy = d.bunn + d.hoyde / 2;
        return (
          <>
            {[1, -1].map((sign) => {
              const offset = sign === 1 ? 0.02 : levegg.tykkelse + 0.02;
              const wx = baseX + sign * normX * offset;
              const wz = baseZ + sign * normZ * offset;
              const ang =
                sign === 1
                  ? Math.atan2(normX, normZ)
                  : Math.atan2(-normX, -normZ);
              return (
                <group
                  key={sign}
                  position={[wx, wy, wz]}
                  rotation={[0, ang, 0]}
                >
                  <mesh>
                    <planeGeometry args={[d.bredde, d.hoyde]} />
                    <meshStandardMaterial
                      color="#f5f5f0"
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                  <mesh position={[0, 0, 0.005]}>
                    <planeGeometry args={[innerB, innerH]} />
                    <meshStandardMaterial
                      color={dorFarge}
                      side={THREE.DoubleSide}
                      metalness={isGlass ? 0.3 : 0}
                      roughness={isGlass ? 0.2 : 0.7}
                    />
                  </mesh>
                </group>
              );
            })}
          </>
        );
      })()}
    </>
  );
}

// Vinduer og dører som flate plater rett utenpå veggen. Liten offset langs
// normalen forhindrer z-fighting mot selve veggflaten.
function Apninger({ boks }: { boks: Boks }) {
  if (!boks.apninger) return null;
  const offset = 0.02;
  return (
    <>
      {boks.apninger.map((a, i) => {
        const info = veggInfo(boks, a.vegg);
        if (!info) return null;
        const senterAvstand = a.avstand + a.bredde / 2;
        const wx =
          info.anker[0] +
          info.retning[0] * senterAvstand +
          info.normal[0] * offset;
        const wz =
          info.anker[1] +
          info.retning[1] * senterAvstand +
          info.normal[1] * offset;
        const wy = a.bunn + a.hoyde / 2;
        const vinkel = Math.atan2(info.normal[0], info.normal[1]);
        const glass = a.type === "vindu" || a.type === "glassdor";
        const farge = a.farge ?? (glass ? "#bdd7e4" : "#a37049");
        const rammeBredde = 0.04;

        // Sprosser: én hvit horisontal stripe midt på vinduet for små,
        // to for store vinduer og dører (øvre i samme høyde som de små).
        // Apning kan slå av sprosser med sprosser: false (f.eks. fast boddør).
        const STD_TOP_Y = 1.75;
        const apTop = a.bunn + a.hoyde;
        const erStor = a.hoyde >= 1.5 || a.type === "dor" || a.type === "glassdor";
        let sprosseYs =
          a.sprosser === false
            ? []
            : erStor
              ? [STD_TOP_Y, (STD_TOP_Y + a.bunn) / 2]
              : [STD_TOP_Y];
        sprosseYs = sprosseYs.filter((y) => y > a.bunn + 0.08 && y < apTop - 0.08);

        const sprosseMesher = sprosseYs.map((my, j) => (
          <mesh key={`sp${j}`} position={[0, my - wy, 0.01]}>
            <planeGeometry args={[a.bredde, 0.03]} />
            <meshStandardMaterial color="#f5f5f0" side={THREE.DoubleSide} />
          </mesh>
        ));

        // Alle åpninger får hvit karm rundt en farget innfelling
        // (glass eller dørblad). Glass er litt gjennomsiktig så man kan se
        // gjennom (krever at veggen har et hull samme sted).
        const innerB = Math.max(0, a.bredde - 2 * rammeBredde);
        const innerH = Math.max(0, a.hoyde - 2 * rammeBredde);
        return (
          <group key={i} position={[wx, wy, wz]} rotation={[0, vinkel, 0]}>
            {/* Hvit karm — full størrelse */}
            <mesh>
              <planeGeometry args={[a.bredde, a.hoyde]} />
              <meshStandardMaterial color="#f5f5f0" side={THREE.DoubleSide} />
            </mesh>
            {/* Glass eller dørblad — litt mindre, litt foran karmen */}
            <mesh position={[0, 0, 0.005]}>
              <planeGeometry args={[innerB, innerH]} />
              <meshStandardMaterial
                color={farge}
                side={THREE.DoubleSide}
                metalness={glass ? 0.3 : 0}
                roughness={glass ? 0.2 : 0.7}
                transparent={glass}
                opacity={glass ? 0.35 : 1}
              />
            </mesh>
            {sprosseMesher}
          </group>
        );
      })}
    </>
  );
}

// Terrasse — ett eller flere flate "slabs" som ligger på bakken.
// Hvert område blir en tynn boks fra y=0 til toppHoyde.
function Terrasse({ terrasse }: { terrasse: TerrasseType }) {
  return (
    <>
      {terrasse.omrader.map((omr, i) => (
        <mesh
          key={i}
          position={[
            omr.x + omr.bredde / 2,
            terrasse.toppHoyde / 2,
            omr.z + omr.dybde / 2,
          ]}
        >
          <boxGeometry args={[omr.bredde, terrasse.toppHoyde, omr.dybde]} />
          <meshStandardMaterial color={terrasse.farge} />
        </mesh>
      ))}
    </>
  );
}

// Saltak (gable roof) som et trekantprisme. Seks hjørner: fire på veggtoppen
// og to på mønet. Indeksene knytter dem sammen til to skråflater og to gavler.
function Tak({ boks }: { boks: Boks }) {
  const geometri = useMemo(() => {
    if (!boks.tak) return null;

    const vinkelRad = (boks.tak.vinkel * Math.PI) / 180;
    const langs = boks.tak.retning === "langs";
    // Halve avstanden taket faller ned over (motsatt akse av mønet)
    const halvTverr = (langs ? boks.dybde : boks.bredde) / 2;
    const moneHoyde = halvTverr * Math.tan(vinkelRad);

    const b = boks.bredde;
    const d = boks.dybde;
    const h = moneHoyde;
    const u = boks.tak.utstikk ?? 0; // takutstikk på raft (langside)
    const uGavl = 0; // gavlene flukter med veggen (ingen utstikk)
    // Eaven (raftkanten) ligger under veggtoppen siden taket fortsetter ned
    // i samme vinkel forbi veggen.
    const ed = u * Math.tan(vinkelRad);

    // Hjørner i lokale koordinater (origo = bygningens hjørne på veggtopp).
    // v0..v3 = takfot-hjørner; v4, v5 = endene av mønet. For langs gjelder
    // u i z-retning og uGavl i x-retning; motsatt for tvers.
    const posisjoner = langs
      ? [
          -uGavl, -ed, -u,            // v0
          b + uGavl, -ed, -u,         // v1
          b + uGavl, -ed, d + u,      // v2
          -uGavl, -ed, d + u,         // v3
          -uGavl, h, d / 2,           // v4 møne-venstre
          b + uGavl, h, d / 2,        // v5 møne-høyre
        ]
      : [
          -u, -ed, -uGavl,            // v0
          b + u, -ed, -uGavl,         // v1
          b + u, -ed, d + uGavl,      // v2
          -u, -ed, d + uGavl,         // v3
          b / 2, h, -uGavl,           // v4 møne-front
          b / 2, h, d + uGavl,        // v5 møne-bak
        ];

    // Trekanter — rekkefølgen på hjørnene avgjør hvilken vei normalen peker.
    // CCW sett fra utsiden = normal utover (three.js culler bort baksider).
    const indekser = langs
      ? [
          0, 4, 5,  0, 5, 1,   // skråflate foran (-z, peker fram og opp)
          3, 2, 5,  3, 5, 4,   // skråflate bak (+z, peker bak og opp)
          0, 3, 4,             // gavl venstre (-x)
          1, 5, 2,             // gavl høyre (+x)
        ]
      : [
          0, 3, 5,  0, 5, 4,   // skråflate venstre (-x)
          1, 4, 5,  1, 5, 2,   // skråflate høyre (+x)
          0, 4, 1,             // gavl foran (-z)
          3, 2, 5,             // gavl bak (+z)
        ];

    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(posisjoner, 3),
    );
    g.setIndex(indekser);
    g.computeVertexNormals();
    return g;
  }, [boks]);

  if (!geometri) return null;

  return (
    <mesh position={[boks.x, boks.hoyde, boks.z]} geometry={geometri}>
      <meshStandardMaterial color="#5a4634" flatShading />
    </mesh>
  );
}

// Vindskie — pyntebord langs gavlens skråkant. Fire bord per saltak:
// hver gavl (venstre/høyre) har én på frontsiden og én på baksiden.
function Vindskie({ boks }: { boks: Boks }) {
  if (!boks.tak) return null;
  // Foreløpig kun støtte for langs-orientering (mønet langs x).
  if (boks.tak.retning !== "langs") return null;

  const v = (boks.tak.vinkel * Math.PI) / 180;
  const u = boks.tak.utstikk ?? 0;
  const ed = u * Math.tan(v);
  const h = (boks.dybde / 2) * Math.tan(v);
  const L = (boks.dybde / 2 + u) / Math.cos(v); // lengde langs skråflaten
  const W = 0.2; // bredde på vindskie-bordet (synlig kant)
  const T = 0.025; // tykkelse
  const eps = 0.005;

  // Midt på selve skråkanten (verdens koordinater)
  const midY = boks.hoyde + (h - ed) / 2;
  const midZ_front = boks.z + (-u + boks.dybde / 2) / 2;
  const midZ_bak = boks.z + (boks.dybde + u + boks.dybde / 2) / 2;

  // Boksen er sentrert om sin egen midte, men vi vil at OVERKANTEN av
  // bordet skal ligge på skråkanten. Derfor flytter vi senteret W/2 vinkelrett
  // ned/inn under skråkanten (inn i gavltrekanten).
  const dy = -(W / 2) * Math.cos(v); // ned
  const dzFront = +(W / 2) * Math.sin(v); // bakover for frontskråningen
  const dzBak = -(W / 2) * Math.sin(v); // forover for bakskråningen

  const venstreX = boks.x - T / 2 - eps;
  const hoyreX = boks.x + boks.bredde + T / 2 + eps;

  const farge = "#2b2826"; // dempet sort, samme som veggene

  return (
    <>
      {/* Venstre gavl, frontskråning */}
      <mesh
        position={[venstreX, midY + dy, midZ_front + dzFront]}
        rotation={[-v, 0, 0]}
      >
        <boxGeometry args={[T, W, L]} />
        <meshStandardMaterial color={farge} />
      </mesh>
      {/* Venstre gavl, bakskråning — rotasjon π+v, ikke π−v */}
      <mesh
        position={[venstreX, midY + dy, midZ_bak + dzBak]}
        rotation={[Math.PI + v, 0, 0]}
      >
        <boxGeometry args={[T, W, L]} />
        <meshStandardMaterial color={farge} />
      </mesh>
      {/* Høyre gavl, frontskråning */}
      <mesh
        position={[hoyreX, midY + dy, midZ_front + dzFront]}
        rotation={[-v, 0, 0]}
      >
        <boxGeometry args={[T, W, L]} />
        <meshStandardMaterial color={farge} />
      </mesh>
      {/* Høyre gavl, bakskråning */}
      <mesh
        position={[hoyreX, midY + dy, midZ_bak + dzBak]}
        rotation={[Math.PI + v, 0, 0]}
      >
        <boxGeometry args={[T, W, L]} />
        <meshStandardMaterial color={farge} />
      </mesh>
    </>
  );
}

// Toppbord — flate brett som ligger oppe på vindskiene. Ett per vindskie,
// så fire totalt per saltak. Dekker overkanten av vindskien.
function Toppbord({ boks }: { boks: Boks }) {
  if (!boks.tak) return null;
  if (boks.tak.retning !== "langs") return null;

  const v = (boks.tak.vinkel * Math.PI) / 180;
  const u = boks.tak.utstikk ?? 0;
  const ed = u * Math.tan(v);
  const h = (boks.dybde / 2) * Math.tan(v);
  const L = (boks.dybde / 2 + u) / Math.cos(v);
  const T = 0.025; // tykkelse over skråkanten
  const W = 0.08; // bredde tvers over vindskien

  const midY = boks.hoyde + (h - ed) / 2;
  const midZ_front = boks.z + (-u + boks.dybde / 2) / 2;
  const midZ_bak = boks.z + (boks.dybde + u + boks.dybde / 2) / 2;

  // Senter litt over skråkanten (langs slope-normalen)
  const dy = (T / 2) * Math.cos(v);
  const dzFront = -(T / 2) * Math.sin(v);
  const dzBak = +(T / 2) * Math.sin(v);

  // Bordet dekker fra gavlveggen og utover (dekker vindskien)
  const venstreX = boks.x - W / 2;
  const hoyreX = boks.x + boks.bredde + W / 2;

  const farge = "#e8dcc4";

  return (
    <>
      <mesh
        position={[venstreX, midY + dy, midZ_front + dzFront]}
        rotation={[-v, 0, 0]}
      >
        <boxGeometry args={[W, T, L]} />
        <meshStandardMaterial color={farge} />
      </mesh>
      <mesh
        position={[venstreX, midY + dy, midZ_bak + dzBak]}
        rotation={[Math.PI + v, 0, 0]}
      >
        <boxGeometry args={[W, T, L]} />
        <meshStandardMaterial color={farge} />
      </mesh>
      <mesh
        position={[hoyreX, midY + dy, midZ_front + dzFront]}
        rotation={[-v, 0, 0]}
      >
        <boxGeometry args={[W, T, L]} />
        <meshStandardMaterial color={farge} />
      </mesh>
      <mesh
        position={[hoyreX, midY + dy, midZ_bak + dzBak]}
        rotation={[Math.PI + v, 0, 0]}
      >
        <boxGeometry args={[W, T, L]} />
        <meshStandardMaterial color={farge} />
      </mesh>
    </>
  );
}

// Takrenne — tynn boks hengt under raftkanten på begge langsidene.
function Takrenne({ boks }: { boks: Boks }) {
  if (!boks.tak) return null;
  if (boks.tak.retning !== "langs") return null;

  const v = (boks.tak.vinkel * Math.PI) / 180;
  const u = boks.tak.utstikk ?? 0;
  const ed = u * Math.tan(v);
  const H = 0.06; // diameter / høyde på renna
  const farge = "#7a7a7a"; // metall-grå

  // Y under raften (renna henger litt under raftkanten)
  const y = boks.hoyde - ed - H / 2 - 0.01;
  const lengde = boks.bredde; // langs hele veggen

  return (
    <>
      {/* Forside (z = z + dybde + u) */}
      <mesh
        position={[
          boks.x + boks.bredde / 2,
          y,
          boks.z + boks.dybde + u,
        ]}
      >
        <boxGeometry args={[lengde, H, H]} />
        <meshStandardMaterial color={farge} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Bakside (z = z - u) */}
      <mesh
        position={[boks.x + boks.bredde / 2, y, boks.z - u]}
      >
        <boxGeometry args={[lengde, H, H]} />
        <meshStandardMaterial color={farge} metalness={0.5} roughness={0.4} />
      </mesh>
    </>
  );
}

// Trapp — flere flate trinn som tynne bokser.
function TrappKomp({ trapp }: { trapp: TrappType }) {
  return (
    <>
      {trapp.trinn.map((t, i) => (
        <mesh
          key={i}
          position={[
            t.x + t.bredde / 2,
            t.hoyde / 2,
            t.z + t.dybde / 2,
          ]}
        >
          <boxGeometry args={[t.bredde, t.hoyde, t.dybde]} />
          <meshStandardMaterial color={trapp.farge} />
        </mesh>
      ))}
    </>
  );
}

// Møbel — en enkel boks (eller sylinder) på gulvet (eller hevet ved bunn>0).
// Brukes til benker, ovner, piper osv. i innevisningen.
function MobelKomp({ mobel }: { mobel: Mobel }) {
  const bunn = mobel.bunn ?? 0;
  const pos: [number, number, number] = [
    mobel.x + mobel.bredde / 2,
    bunn + mobel.hoyde / 2,
    mobel.z + mobel.dybde / 2,
  ];
  const material = (
    <meshStandardMaterial
      color={mobel.farge}
      metalness={mobel.metall ? 0.7 : 0}
      roughness={mobel.metall ? 0.25 : 0.7}
    />
  );
  if (mobel.form === "sylinder") {
    const radius = Math.min(mobel.bredde, mobel.dybde) / 2;
    return (
      <mesh position={pos}>
        <cylinderGeometry args={[radius, radius, mobel.hoyde, 24]} />
        {material}
      </mesh>
    );
  }
  return (
    <mesh position={pos}>
      <boxGeometry args={[mobel.bredde, mobel.hoyde, mobel.dybde]} />
      {material}
    </mesh>
  );
}

// Gjerde — vertikal vegg på terrassen, typisk 80 cm høyt rekkverk.
function GjerdeKomp({ gjerde }: { gjerde: GjerdeType }) {
  const dx = gjerde.til.x - gjerde.fra.x;
  const dz = gjerde.til.z - gjerde.fra.z;
  const lengde = Math.sqrt(dx * dx + dz * dz);
  const senterX = (gjerde.fra.x + gjerde.til.x) / 2;
  const senterZ = (gjerde.fra.z + gjerde.til.z) / 2;
  const vinkel = Math.atan2(dx, dz);

  return (
    <mesh
      position={[senterX, gjerde.bunn + gjerde.hoyde / 2, senterZ]}
      rotation={[0, vinkel, 0]}
    >
      <boxGeometry args={[gjerde.tykkelse, gjerde.hoyde, lengde]} />
      <meshStandardMaterial color={gjerde.farge} />
    </mesh>
  );
}

// Bygger en flat fjell-kontur (ShapeGeometry i xy-planet) fra en liste
// toppunkter [x, y]. Bunnen trekkes godt under horisonten (y = -4) så
// rekka "står på" bakken uansett kameravinkel.
function ridgeGeometri(topper: Array<[number, number]>) {
  const shape = new THREE.Shape();
  const xVenstre = topper[0][0];
  const xHoyre = topper[topper.length - 1][0];
  shape.moveTo(xVenstre, -4);
  for (const [tx, ty] of topper) shape.lineTo(tx, ty);
  shape.lineTo(xHoyre, -4);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

// Deterministisk jagget ås-profil (ingen Math.random → stabil mellom renders).
// Summen av tre sinuser med ulik frekvens gir en naturlig ujevn fjellrekke.
// Brukes til de bakre, anonyme rekkene; den fremste er håndtegnet under.
function jaggetProfil(
  amplitude: number,
  basis: number,
  frekvens: number,
  faser: [number, number, number],
): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let x = -150; x <= 150; x += 4) {
    const v =
      0.55 * Math.sin(x * frekvens + faser[0]) +
      0.3 * Math.sin(x * frekvens * 2.3 + faser[1]) +
      0.18 * Math.sin(x * frekvens * 5.1 + faser[2]);
    pts.push([x, Math.max(0, basis + amplitude * v)]);
  }
  return pts;
}

// Fjellkjede-horisont — tre fjellrekker bak hverandre som "Jotunheimen ca.
// 20 mil unna" sett gjennom badstuevinduet. Hytta står på ca 850 moh, og
// toppene ligger 2300–2469 moh, så reell vinkel over horisonten er liten
// (~0,5°). Vi overdriver litt så silhuetten blir synlig.
//
// Lengst bort = lysest (atmosfærisk dis, nær himmelfargen #dbe2e8), nærmest
// = mørkest. De ligger på ulik z, så three.js' dybde-test lar de nære
// rekkene dekke de fjerne der de overlapper — det gir dybde i horisonten.
function Fjellsilhuett() {
  // Fremste rekke: håndtegnet Jotunheim-profil med navngitte topper.
  const fremste = useMemo(
    () =>
      ridgeGeometri([
        [-135, 0.2],
        [-122, 0.4],
        [-110, 0.6],
        [-98, 0.4],
        [-86, 0.9],
        [-75, 1.2],
        [-65, 0.8],
        [-56, 1.5],
        [-48, 1.1],
        [-40, 1.8],
        [-32, 1.4],
        [-25, 2.1],
        [-18, 1.7],
        [-12, 2.4], // Galdhøpiggen (2469 moh) — høyeste topp
        [-7, 2.0],
        [-2, 1.6],
        [3, 1.9],
        [9, 2.3], // Glittertind (2452 moh) — ofte snødekt
        [15, 1.8],
        [22, 2.0], // Store Skagastølstind (2405 moh) — taggete profil
        [29, 1.5],
        [36, 1.8],
        [44, 1.3],
        [52, 1.6],
        [62, 1.0],
        [72, 1.2],
        [85, 0.7],
        [98, 0.5],
        [112, 0.4],
        [125, 0.2],
        [140, 0.1],
        [150, 0],
      ]),
    [],
  );
  // Bakre rekker: høy basis så toppene titter opp i dalene mellom de fremste.
  const midtre = useMemo(
    () => ridgeGeometri(jaggetProfil(1.1, 1.0, 0.05, [0.4, 2.1, 1.2])),
    [],
  );
  const bakerste = useMemo(
    () => ridgeGeometri(jaggetProfil(0.8, 0.8, 0.07, [1.9, 0.3, 2.6])),
    [],
  );

  // meshBasicMaterial = ikke påvirket av lys, gir flat silhuett-utseende.
  return (
    <group position={[2.7, 0, 0]}>
      {/* Bakerst (z=96) — lysest, nesten oppløst i disen */}
      <mesh position={[0, 0, 96]} geometry={bakerste}>
        <meshBasicMaterial color="#c2ccd7" side={THREE.DoubleSide} />
      </mesh>
      {/* Midtre (z=88) */}
      <mesh position={[0, 0, 88]} geometry={midtre}>
        <meshBasicMaterial color="#a3b0c0" side={THREE.DoubleSide} />
      </mesh>
      {/* Fremst (z=80) — mørkest, tydeligste profil */}
      <mesh position={[0, 0, 80]} geometry={fremste}>
        <meshBasicMaterial color="#7e8da0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

type CameraConfig = {
  position?: [number, number, number];
  target?: [number, number, number];
  fov?: number;
};

// Når OrbitControls er av (låst kamera), må vi selv si til kameraet hvor
// det skal se. Three.js-kameraet peker default i -z; uten denne setter
// blir target ignorert og du ender med å stirre på bakveggen.
function CameraAimer({ target }: { target: [number, number, number] }) {
  const { camera } = useThree();
  const [tx, ty, tz] = target;
  useEffect(() => {
    camera.lookAt(new THREE.Vector3(tx, ty, tz));
    camera.updateProjectionMatrix();
  }, [camera, tx, ty, tz]);
  return null;
}

export default function Modell3D({
  design,
  initialVisTak = true,
  cameraConfig,
  visFjell = false,
  visKontroller = true,
  visTakKnapp = true,
}: {
  design: Design;
  initialVisTak?: boolean;
  cameraConfig?: CameraConfig;
  visFjell?: boolean;
  visKontroller?: boolean;
  visTakKnapp?: boolean;
}) {
  const { alleBygg, terrasser, levegger, gjerder, trapper, mobler } = design;
  const [visTak, setVisTak] = useState(initialVisTak);
  const camPosition = cameraConfig?.position ?? [18, 14, 20];
  const camFov = cameraConfig?.fov ?? 45;
  const orbitTarget = cameraConfig?.target ?? [5.5, 1.5, 3];
  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-xl border border-stone-300">
      {visTakKnapp && (
        <button
          type="button"
          onClick={() => setVisTak((v) => !v)}
          className="absolute left-3 top-3 z-10 rounded-md border border-stone-300 bg-white/90 px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm hover:bg-white"
        >
          {visTak ? "Skjul tak" : "Vis tak"}
        </button>
      )}
      <Canvas camera={{ position: camPosition, fov: camFov }}>
        <color attach="background" args={["#dbe2e8"]} />

        {/* Lys */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[12, 18, 10]} intensity={1.1} />
        <directionalLight position={[-10, 8, -6]} intensity={0.4} />

        {/* Terrasser — tegnes før byggene så veggene står oppå */}
        {terrasser.map((t) => (
          <Terrasse key={`terr-${t.navn}`} terrasse={t} />
        ))}

        {/* Byggene */}
        {alleBygg.map((b) => (
          <Bygning key={b.navn} boks={b} skjulTopp={!visTak} />
        ))}

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

        {/* Gjerder rundt terrassen */}
        {gjerder.map((g) => (
          <GjerdeKomp key={`gjerd-${g.navn}`} gjerde={g} />
        ))}

        {/* Trapper */}
        {trapper.map((t) => (
          <TrappKomp key={`trapp-${t.navn}`} trapp={t} />
        ))}

        {/* Stolper i innhugg (kun der innhugg er definert) */}
        {alleBygg.map((b) => (
          <Stolpe key={`stolpe-${b.navn}`} boks={b} />
        ))}

        {/* Levegger */}
        {levegger.map((l) => (
          <LeveggKomp key={`lev-${l.navn}`} levegg={l} />
        ))}

        {/* Vinduer og dører */}
        {alleBygg.map((b) => (
          <Apninger key={`apn-${b.navn}`} boks={b} />
        ))}

        {/* Møbler (kun for design der `mobler` er definert) */}
        {mobler?.map((m) => (
          <MobelKomp key={`mob-${m.navn}`} mobel={m} />
        ))}

        {/* Bakke */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial color="#9aa884" />
        </mesh>
        <Grid
          args={[80, 80]}
          cellSize={1}
          cellThickness={0.6}
          cellColor="#7e8a6a"
          sectionSize={5}
          sectionThickness={1.2}
          sectionColor="#5f6a4f"
          position={[0, 0.02, 0]}
        />

        {/* Fjellsilhuett i bakgrunnen (kun når visFjell) */}
        {visFjell && <Fjellsilhuett />}

        {/* Mus: dra = roter, rull = zoom, høyreklikk-dra = flytt */}
        {visKontroller && <OrbitControls target={orbitTarget} />}
        {/* Låst kamera: sett kamerasiktet eksplisitt mot target */}
        {!visKontroller && cameraConfig?.target && (
          <CameraAimer target={cameraConfig.target} />
        )}
      </Canvas>
    </div>
  );
}
