import type { ReactNode } from "react";
import {
  veggInfo,
  type Boks,
  type Design,
  type Gjerde as GjerdeType,
  type Levegg,
  type Mobel,
  type Rom as RomType,
  type Terrasse as TerrasseType,
  type Trapp as TrappType,
} from "@/lib/bygg";

// Tegner en plantegning (sett ovenfra) som SVG.
// SKALA bestemmer hvor mange piksler én meter blir.

const SKALA = 38; // piksler per meter
const MARG = 56; // luft rundt tegningen

function meter(m: number) {
  return MARG + m * SKALA;
}

function Rom({ boks, skjulLabel }: { boks: Boks; skjulLabel?: boolean }) {
  const x = meter(boks.x);
  const y = meter(boks.z);
  const w = boks.bredde * SKALA;
  const h = boks.dybde * SKALA;
  // 2D-plan sett ovenfra = gulvet. Bruk gulvFarge når den finnes.
  const fyll = boks.gulvFarge ?? boks.farge;

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
        fill={fyll}
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
        fill={fyll}
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

// Vinduer og dører som små rektangler oppå veggstreken.
// Hver åpning = en hvit karm-rektangel (tykkere) + en farget innfelling
// (glass eller dørblad) inni.
function ApningerPlan({ boks }: { boks: Boks }) {
  if (!boks.apninger) return null;
  const innerT = 4; // px på tvers av veggen — glass/dørblad
  const ytreT = 10; // px på tvers — hvit karm
  const karmEkstra = 3; // px ekstra i lengderetningen så karmen stikker forbi
  return (
    <g>
      {boks.apninger.map((a, i) => {
        const info = veggInfo(boks, a.vegg);
        if (!info) return null;
        const startX = info.anker[0] + info.retning[0] * a.avstand;
        const startZ = info.anker[1] + info.retning[1] * a.avstand;
        const horisontal = info.retning[0] !== 0;
        const glass = a.type === "vindu" || a.type === "glassdor";
        const fyll = a.farge ?? (glass ? "#cfe2eb" : "#b88b5b");
        const lengde = a.bredde * SKALA;
        if (horisontal) {
          return (
            <g key={i}>
              {/* Hvit karm */}
              <rect
                x={meter(startX) - karmEkstra}
                y={meter(startZ) - ytreT / 2}
                width={lengde + 2 * karmEkstra}
                height={ytreT}
                fill="#f5f5f0"
                stroke="#44403c"
                strokeWidth={0.5}
              />
              {/* Glass / dørblad */}
              <rect
                x={meter(startX)}
                y={meter(startZ) - innerT / 2}
                width={lengde}
                height={innerT}
                fill={fyll}
              />
            </g>
          );
        }
        return (
          <g key={i}>
            {/* Hvit karm */}
            <rect
              x={meter(startX) - ytreT / 2}
              y={meter(startZ) - karmEkstra}
              width={ytreT}
              height={lengde + 2 * karmEkstra}
              fill="#f5f5f0"
              stroke="#44403c"
              strokeWidth={0.5}
            />
            {/* Glass / dørblad */}
            <rect
              x={meter(startX) - innerT / 2}
              y={meter(startZ)}
              width={innerT}
              height={lengde}
              fill={fyll}
            />
          </g>
        );
      })}
    </g>
  );
}

// Et møbel sett ovenfra — rektangel for boks, sirkel for sylinder.
// Liten label hvis det er plass.
function MobelTegning({ mobel }: { mobel: Mobel }) {
  const x = meter(mobel.x);
  const y = meter(mobel.z);
  const w = mobel.bredde * SKALA;
  const h = mobel.dybde * SKALA;
  const visLabel = w >= 28 && h >= 14;
  const erSylinder = mobel.form === "sylinder";
  return (
    <g>
      {erSylinder ? (
        <circle
          cx={x + w / 2}
          cy={y + h / 2}
          r={Math.min(w, h) / 2}
          fill={mobel.farge}
          fillOpacity={0.7}
          stroke="#3a2e1f"
          strokeWidth={0.8}
        />
      ) : (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill={mobel.farge}
          fillOpacity={0.7}
          stroke="#3a2e1f"
          strokeWidth={0.8}
        />
      )}
      {visLabel && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 3}
          textAnchor="middle"
          fontSize={8}
          fill="#1c1917"
        >
          {mobel.navn}
        </text>
      )}
    </g>
  );
}

function LeveggTegning({ levegg }: { levegg: Levegg }) {
  const dx = levegg.til.x - levegg.fra.x;
  const dz = levegg.til.z - levegg.fra.z;
  const lengde = Math.sqrt(dx * dx + dz * dz);
  // SVG: én linje fra fra-punktet til til-punktet med passende tykkelse.
  const x1 = meter(levegg.fra.x);
  const y1 = meter(levegg.fra.z);
  const x2 = meter(levegg.til.x);
  const y2 = meter(levegg.til.z);
  const horisontal = dx !== 0 && dz === 0;

  // Felles helper for å tegne en åpning (vindu eller dør) som lite rektangel
  // sentrert på leveggens linje.
  const tegnApning = (
    bredde: number,
    senterAvstand: number,
    fyll: string,
    kant: string,
    key: string,
  ) => {
    const cx = levegg.fra.x + (dx / lengde) * senterAvstand;
    const cz = levegg.fra.z + (dz / lengde) * senterAvstand;
    const halvB = (bredde / 2) * SKALA;
    if (horisontal) {
      return (
        <rect
          key={key}
          x={meter(cx) - halvB}
          y={meter(cz) - 3}
          width={bredde * SKALA}
          height={6}
          fill={fyll}
          stroke={kant}
          strokeWidth={1}
        />
      );
    }
    return (
      <rect
        key={key}
        x={meter(cx) - 3}
        y={meter(cz) - halvB}
        width={6}
        height={bredde * SKALA}
        fill={fyll}
        stroke={kant}
        strokeWidth={1}
      />
    );
  };

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#44403c"
        strokeWidth={4}
        strokeLinecap="butt"
      />
      {levegg.vindu &&
        tegnApning(
          levegg.vindu.bredde,
          levegg.vindu.senterAvstand,
          "#cfe2eb",
          "#3a5a6a",
          "vindu",
        )}
      {levegg.dor &&
        tegnApning(
          levegg.dor.bredde,
          levegg.dor.senterAvstand,
          levegg.dor.type === "glassdor" ? "#cfe2eb" : "#b88b5b",
          levegg.dor.type === "glassdor" ? "#3a5a6a" : "#5a3a1a",
          "dor",
        )}
    </g>
  );
}

function TrappTegning({ trapp }: { trapp: TrappType }) {
  return (
    <g>
      {trapp.trinn.map((t, i) => (
        <rect
          key={i}
          x={meter(t.x)}
          y={meter(t.z)}
          width={t.bredde * SKALA}
          height={t.dybde * SKALA}
          fill={trapp.farge}
          fillOpacity={0.55}
          stroke="#5a4a30"
          strokeWidth={1}
        />
      ))}
    </g>
  );
}

function GjerdeTegning({ gjerde }: { gjerde: GjerdeType }) {
  return (
    <line
      x1={meter(gjerde.fra.x)}
      y1={meter(gjerde.fra.z)}
      x2={meter(gjerde.til.x)}
      y2={meter(gjerde.til.z)}
      stroke={gjerde.farge}
      strokeWidth={3}
      strokeLinecap="round"
    />
  );
}

function TerrasseTegning({ terrasse }: { terrasse: TerrasseType }) {
  return (
    <g>
      {terrasse.omrader.map((omr, i) => (
        <rect
          key={i}
          x={meter(omr.x)}
          y={meter(omr.z)}
          width={omr.bredde * SKALA}
          height={omr.dybde * SKALA}
          fill={terrasse.farge}
          fillOpacity={0.32}
          stroke="#8b7355"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
      ))}
    </g>
  );
}

function RomLabel({ rom }: { rom: RomType }) {
  const cx = meter(rom.x + rom.bredde / 2);
  const cy = meter(rom.z + rom.dybde / 2);
  const areal = (rom.bredde * rom.dybde).toFixed(2);
  const arealTekst = `${areal} m²`;

  // Skaler fonten til rommets bredde og tekstens lengde, så labelen holder
  // seg innenfor veggene. ~0,6 × fontstørrelse er omtrentlig bredde per tegn.
  // Tak (12/11) hindrer kjempefont i brede rom; gulv (7) holder den lesbar.
  const tilgjengelig = rom.bredde * SKALA - 8; // px innvendig, minus litt luft
  const passerFont = (tekst: string, maks: number) =>
    Math.max(7, Math.min(maks, Math.floor(tilgjengelig / (tekst.length * 0.6))));
  const navnFont = passerFont(rom.navn, 10);
  const arealFont = passerFont(arealTekst, 8.5);
  return (
    <g>
      <text
        x={cx}
        y={cy - 3}
        textAnchor="middle"
        fontSize={navnFont}
        fontWeight={700}
        fill="#1c1917"
      >
        {rom.navn}
      </text>
      <text
        x={cx}
        y={cy + navnFont + 2}
        textAnchor="middle"
        fontSize={arealFont}
        fill="#57534e"
      >
        {arealTekst}
      </text>
    </g>
  );
}

export default function Plan2D({ design }: { design: Design }) {
  const { alleBygg, terrasser, levegger, gjerder, trapper, rom, mobler } =
    design;
  const harRom = !!rom?.length;
  const maxX = Math.ceil(
    Math.max(
      ...alleBygg.map((b) => b.x + b.bredde),
      ...terrasser.flatMap((t) =>
        t.omrader.map((o) => o.x + o.bredde),
      ),
    ),
  );
  const maxZ = Math.ceil(
    Math.max(
      ...alleBygg.map((b) => b.z + b.dybde),
      ...terrasser.flatMap((t) =>
        t.omrader.map((o) => o.z + o.dybde),
      ),
    ),
  );

  const bredde = maxX * SKALA + MARG * 2;
  const hoyde = maxZ * SKALA + MARG * 2;

  // Rutenett-linjer, én per meter.
  const vLinjer = Array.from({ length: maxX + 1 }, (_, i) => i);
  const hLinjer = Array.from({ length: maxZ + 1 }, (_, i) => i);

  return (
    <svg
      viewBox={`0 0 ${bredde} ${hoyde}`}
      className="w-full rounded-xl border border-stone-300 bg-white"
    >
      {/* Rutenett */}
      {vLinjer.map((i) => (
        <line
          key={`v${i}`}
          x1={meter(i)}
          y1={MARG}
          x2={meter(i)}
          y2={MARG + maxZ * SKALA}
          stroke="#e7e5e4"
          strokeWidth={1}
        />
      ))}
      {hLinjer.map((i) => (
        <line
          key={`h${i}`}
          x1={MARG}
          y1={meter(i)}
          x2={MARG + maxX * SKALA}
          y2={meter(i)}
          stroke="#e7e5e4"
          strokeWidth={1}
        />
      ))}

      {/* Målestokk: 1 meter */}
      <line
        x1={MARG}
        y1={hoyde - 26}
        x2={MARG + SKALA}
        y2={hoyde - 26}
        stroke="#78716c"
        strokeWidth={3}
      />
      <text x={MARG + SKALA + 8} y={hoyde - 21} fontSize={12} fill="#78716c">
        1 meter
      </text>

      {/* Terrasser — tegnes før byggene så byggene står oppå */}
      {terrasser.map((t) => (
        <TerrasseTegning key={t.navn} terrasse={t} />
      ))}

      {/* Byggene */}
      {alleBygg.map((b) => (
        <Rom key={b.navn} boks={b} skjulLabel={harRom} />
      ))}

      {/* Vinduer og dører oppå veggene */}
      {alleBygg.map((b) => (
        <ApningerPlan key={`apn-${b.navn}`} boks={b} />
      ))}

      {/* Levegger */}
      {levegger.map((l) => (
        <LeveggTegning key={`lev-${l.navn}`} levegg={l} />
      ))}

      {/* Trapper */}
      {trapper.map((t) => (
        <TrappTegning key={`trapp-${t.navn}`} trapp={t} />
      ))}

      {/* Gjerder rundt terrassen */}
      {gjerder.map((g) => (
        <GjerdeTegning key={`gjerd-${g.navn}`} gjerde={g} />
      ))}

      {/* Møbler (kun for design der `mobler` er definert) */}
      {mobler?.map((m) => (
        <MobelTegning key={`mob-${m.navn}`} mobel={m} />
      ))}

      {/* Rom-labels (kun for design der `rom` er definert) */}
      {rom?.map((r) => (
        <RomLabel key={r.navn} rom={r} />
      ))}
    </svg>
  );
}
