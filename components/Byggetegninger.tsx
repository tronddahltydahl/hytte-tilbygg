// Byggetegninger som SVG + HTML-tabeller. Hver tegning er en
// SVG-komponent som returnerer JSX, ofte ledsaget av en lagtabell.
// Etiketter er flyttet UT av SVGen til en HTML-tabell ved siden av —
// gir bedre lesbar tekst og responsive layout.

import type React from "react";

// ----- Farger per material ---------------------------------------------
export const F = {
  tre: "#a08054",
  treMork: "#8b6f47",
  stender: "#c79e6b",
  iso: "#f3e9b0",
  dampsperre: "#3a5a8a",
  alu: "#bcc0c4",
  vindsperre: "#aabd8c",
  osb: "#d4b285",
  panel: "#9c7a4f",
  betong: "#a8aeb1",
  beslag: "#6b7077",
  bakke: "#7a6f4f",
  takpapp: "#3a3a3a",
  strek: "#1c1917",
  mal: "#b8932a",
  bg: "#fafaf7",
} as const;

// ----- Felles tekst-stiler ---------------------------------------------
const fS: React.CSSProperties = {
  fill: F.strek,
  fontFamily: "ui-sans-serif, system-ui",
  fontSize: "14px",
};
const fSBold: React.CSSProperties = { ...fS, fontWeight: 700 };
const fSStor: React.CSSProperties = { ...fS, fontWeight: 700, fontSize: "16px" };
const fSHvit: React.CSSProperties = { ...fS, fill: "#fff", fontWeight: 600 };
const fMal: React.CSSProperties = {
  ...fS,
  fill: F.mal,
  fontStyle: "italic",
  fontSize: "13px",
};

// ----- Mål-pil ---------------------------------------------------------
function MalPil({
  x1, y1, x2, y2, label, side = "auto",
}: {
  x1: number; y1: number; x2: number; y2: number; label: string; side?: "over" | "under" | "auto";
}) {
  const horisontal = Math.abs(x2 - x1) > Math.abs(y2 - y1);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const tekstY = side === "over" ? my - 8 : side === "under" ? my + 16 : horisontal ? my + 16 : my + 4;
  const tekstX = horisontal ? mx : mx + 8;
  const anchor = horisontal ? "middle" : "start";

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={F.mal} strokeWidth={1.2} />
      {/* Endepunkts-streker */}
      {horisontal ? (
        <>
          <line x1={x1} y1={y1 - 4} x2={x1} y2={y1 + 4} stroke={F.mal} strokeWidth={1.2} />
          <line x1={x2} y1={y2 - 4} x2={x2} y2={y2 + 4} stroke={F.mal} strokeWidth={1.2} />
        </>
      ) : (
        <>
          <line x1={x1 - 4} y1={y1} x2={x1 + 4} y2={y1} stroke={F.mal} strokeWidth={1.2} />
          <line x1={x2 - 4} y1={y2} x2={x2 + 4} y2={y2} stroke={F.mal} strokeWidth={1.2} />
        </>
      )}
      <text x={tekstX} y={tekstY} textAnchor={anchor} style={fMal}>{label}</text>
    </g>
  );
}

// ----- Layout-wrapper: tegning + sidefelt med tabell -------------------
function TegningMedTabell({
  tegning, lag, total, totalLabel,
}: {
  tegning: React.ReactNode;
  lag: { nr: number; farge: string; dim: string; navn: string }[];
  total?: string;
  totalLabel?: string;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,260px]">
      <div className="overflow-hidden rounded-md border border-stone-200 bg-white p-3">
        {tegning}
      </div>
      <div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-stone-600">
              <th className="py-1.5">#</th>
              <th>Farge</th>
              <th>Mål</th>
              <th>Material</th>
            </tr>
          </thead>
          <tbody>
            {lag.map((l) => (
              <tr key={l.nr} className="border-b border-stone-100 align-top">
                <td className="py-1.5 pr-1 font-semibold tabular-nums text-stone-700">{l.nr}</td>
                <td className="pr-2">
                  <span
                    className="inline-block h-4 w-6 rounded border border-stone-400 align-middle"
                    style={{ backgroundColor: l.farge }}
                  />
                </td>
                <td className="pr-2 tabular-nums text-stone-700">{l.dim}</td>
                <td className="text-stone-800">{l.navn}</td>
              </tr>
            ))}
          </tbody>
          {total && (
            <tfoot>
              <tr className="border-t border-stone-300 font-semibold">
                <td colSpan={2} className="pt-2 text-stone-700">{totalLabel ?? "Total"}</td>
                <td colSpan={2} className="pt-2 text-stone-800 tabular-nums">{total}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ===========================================================
// 1. FUNDAMENTPLAN — sett ovenfra
// ===========================================================
export function FundamentPlan() {
  const SKALA = 120;
  const MARG = 80;
  const lengde = 5.4 * SKALA;
  const dybde = 2.7 * SKALA;
  const pilarX = [0, 1.8, 3.6, 5.4];

  const w = lengde + 2 * MARG + 60;
  const h = dybde + 2 * MARG + 80;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto block w-full" preserveAspectRatio="xMidYMid meet">
      {/* Grunnriss */}
      <rect x={MARG} y={MARG} width={lengde} height={dybde} fill={F.bg} stroke={F.strek} strokeWidth={2} />

      {/* Innervegger */}
      <line x1={MARG + 2.2 * SKALA} y1={MARG} x2={MARG + 2.2 * SKALA} y2={MARG + dybde} stroke={F.strek} strokeWidth={1.5} strokeDasharray="6 4" />
      <line x1={MARG + 4.2 * SKALA} y1={MARG} x2={MARG + 4.2 * SKALA} y2={MARG + dybde} stroke={F.strek} strokeWidth={1.5} strokeDasharray="6 4" />

      {/* Romnavn */}
      <text x={MARG + 1.1 * SKALA} y={MARG + dybde / 2 + 5} textAnchor="middle" style={fSBold}>Relax</text>
      <text x={MARG + 3.2 * SKALA} y={MARG + dybde / 2 + 5} textAnchor="middle" style={fSBold}>Badstue</text>
      <text x={MARG + 4.8 * SKALA} y={MARG + dybde / 2 + 5} textAnchor="middle" style={fSBold}>Smørebod</text>

      {/* Pilarer */}
      {pilarX.map((x, i) => (
        <g key={`p${i}`}>
          <circle cx={MARG + x * SKALA} cy={MARG} r={13} fill={F.betong} stroke={F.strek} strokeWidth={2} />
          <text x={MARG + x * SKALA} y={MARG + 4} textAnchor="middle" style={{ ...fSBold, fontSize: "11px" }}>
            B{i + 1}
          </text>
          <circle cx={MARG + x * SKALA} cy={MARG + dybde} r={13} fill={F.betong} stroke={F.strek} strokeWidth={2} />
          <text x={MARG + x * SKALA} y={MARG + dybde + 4} textAnchor="middle" style={{ ...fSBold, fontSize: "11px" }}>
            F{i + 1}
          </text>
        </g>
      ))}

      {/* Mål langs x (over) */}
      {pilarX.slice(0, -1).map((x, i) => (
        <MalPil
          key={`mx${i}`}
          x1={MARG + x * SKALA}
          y1={MARG - 30}
          x2={MARG + pilarX[i + 1] * SKALA}
          y2={MARG - 30}
          label="1,80 m"
          side="over"
        />
      ))}

      {/* Totalmål x */}
      <MalPil
        x1={MARG}
        y1={MARG - 60}
        x2={MARG + lengde}
        y2={MARG - 60}
        label="5,40 m (langs hyttevegg)"
        side="over"
      />

      {/* Mål y */}
      <MalPil
        x1={MARG + lengde + 35}
        y1={MARG}
        x2={MARG + lengde + 35}
        y2={MARG + dybde}
        label="2,70 m"
      />

      {/* Hyttevegg-markering */}
      <line x1={MARG - 15} y1={MARG - 5} x2={MARG - 15} y2={MARG + dybde + 5} stroke={F.strek} strokeWidth={4} />
      <text x={MARG - 30} y={MARG + dybde / 2} textAnchor="end" style={fSBold} transform={`rotate(-90, ${MARG - 30}, ${MARG + dybde / 2})`}>
        Hytteveggen →
      </text>

      {/* Forklaring under */}
      <g transform={`translate(${MARG}, ${MARG + dybde + 50})`}>
        <circle cx={10} cy={10} r={10} fill={F.betong} stroke={F.strek} strokeWidth={2} />
        <text x={28} y={14} style={fS}>Betongpilar Ø250 — B-pilar bak (z=0), F-pilar front (z=2,70)</text>
      </g>
    </svg>
  );
}

// ===========================================================
// 2. PILAR-SNITT
// ===========================================================
export function PilarSnitt() {
  return (
    <svg viewBox="0 0 600 520" className="mx-auto block w-full" preserveAspectRatio="xMidYMid meet">
      <text x={300} y={28} textAnchor="middle" style={fSStor}>Pilar — vertikalt snitt</text>

      {/* Bakke-linje */}
      <line x1={20} y1={380} x2={580} y2={380} stroke={F.bakke} strokeWidth={3} />
      <pattern id="grunn" patternUnits="userSpaceOnUse" width={8} height={8}>
        <path d="M0,8 l8,-8" stroke={F.bakke} strokeWidth={0.8} />
      </pattern>
      <rect x={20} y={380} width={560} height={120} fill="url(#grunn)" />

      {/* Hull */}
      <rect x={235} y={150} width={130} height={230} fill="#ede4cd" stroke={F.strek} strokeWidth={1.2} strokeDasharray="4 3" />

      {/* Pukk */}
      <rect x={245} y={355} width={110} height={25} fill="#b8a973" stroke={F.strek} strokeWidth={1} />
      <text x={300} y={372} textAnchor="middle" style={fS}>pukk Ø8–32</text>

      {/* Betongpilar */}
      <rect x={245} y={170} width={110} height={185} fill={F.betong} stroke={F.strek} strokeWidth={2} />
      <text x={300} y={270} textAnchor="middle" style={fSHvit}>Betong B25</text>
      <text x={300} y={290} textAnchor="middle" style={fSHvit}>i pappsøyleform</text>

      {/* Bolt */}
      <line x1={300} y1={170} x2={300} y2={115} stroke={F.strek} strokeWidth={5} />
      <circle cx={300} cy={113} r={6} fill={F.strek} />

      {/* Fundamentbeslag */}
      <rect x={250} y={92} width={100} height={22} fill={F.beslag} stroke={F.strek} strokeWidth={1.5} />
      <rect x={270} y={68} width={60} height={28} fill={F.beslag} stroke={F.strek} strokeWidth={1.5} />

      {/* Svill 48×148 */}
      <rect x={180} y={26} width={240} height={42} fill={F.tre} stroke={F.strek} strokeWidth={2} />
      <text x={300} y={53} textAnchor="middle" style={fSHvit}>Svill 48×148 C24 (impregnert)</text>

      {/* Bakke-linje tekst */}
      <text x={30} y={395} style={fS}>bakke</text>

      {/* Mål */}
      <MalPil x1={245} y1={510} x2={355} y2={510} label="Ø250 mm" />
      <MalPil x1={170} y1={170} x2={170} y2={355} label="~1,2 m (telefri dybde)" />
      <MalPil x1={430} y1={170} x2={430} y2={380} label="~ 0,5 m i bakken" />
      <MalPil x1={430} y1={68} x2={430} y2={170} label="~0,4 m kryperom" />
    </svg>
  );
}

// ===========================================================
// 3. GULVSNITT — vertikal lagstabel
// ===========================================================
export function GulvSnitt() {
  // Hver "lag" har høyde i px (skalert), farge, og info
  const lag = [
    { nr: 1, farge: F.osb, dim: "22 mm", navn: "OSB 22 mm gulvplate", h: 22 },
    { nr: 2, farge: F.dampsperre, dim: "0,2 mm", navn: "Dampsperre (PE / alu i badstu)", h: 6 },
    { nr: 3, farge: F.iso, dim: "200 mm", navn: "Iso mineralull (mellom gulvbjelker)", h: 80 },
    { nr: 4, farge: F.vindsperre, dim: "—", navn: "Vindsperre / musnett under bjelker", h: 6 },
  ];

  const startY = 90;
  let y = startY;
  const totalH = lag.reduce((s, l) => s + l.h, 0);

  return (
    <TegningMedTabell
      total="ca. 220 mm + bjelke-høyde"
      totalLabel="Gulvtykkelse"
      lag={[
        ...lag.map(({ nr, farge, dim, navn }) => ({ nr, farge: farge as string, dim, navn })),
        { nr: 5, farge: F.tre as string, dim: "48×148", navn: "Gulvbjelke C24 c/c 600 (i samme nivå som iso)" },
        { nr: 6, farge: F.tre as string, dim: "48×148", navn: "Svill C24 (impregnert) på pilarer" },
      ]}
      tegning={
        <svg viewBox="0 0 520 350" className="mx-auto block w-full" preserveAspectRatio="xMidYMid meet">
          <text x={260} y={28} textAnchor="middle" style={fSStor}>
            Gulvkonstruksjon — vertikalt snitt
          </text>
          <text x={45} y={65} style={fSBold}>↑ INNE (rom)</text>
          <text x={45} y={320} style={fSBold}>↓ KRYPEROM</text>

          {/* Lagvis fra topp */}
          {lag.map((l) => {
            const r = <rect key={l.nr} x={130} y={y} width={290} height={l.h} fill={l.farge} stroke={F.strek} strokeWidth={1.5} />;
            const t = (
              <text key={`t${l.nr}`} x={275} y={y + l.h / 2 + 5} textAnchor="middle" style={l.h > 14 ? fSBold : { ...fS, fontSize: "10px" }}>
                {l.h > 14 ? `${l.nr}.  ${l.navn}` : `${l.nr}`}
              </text>
            );
            const mal = <MalPil key={`m${l.nr}`} x1={440} y1={y} x2={440} y2={y + l.h} label={l.dim} />;
            const result = [r, t, mal];
            y += l.h;
            return result;
          })}

          {/* Bjelke og svill (tegnes som tverrsnitt under iso-laget) */}
          {/* Bjelken er allerede tegnet som del av iso-rektangelet visuelt — for å vise det,
              tegn 3 bjelke-tverrsnitt INNE i iso-laget. */}
          <rect x={130} y={startY + lag[0].h + lag[1].h} width={25} height={lag[2].h} fill={F.tre} stroke={F.strek} strokeWidth={1} />
          <rect x={282} y={startY + lag[0].h + lag[1].h} width={25} height={lag[2].h} fill={F.tre} stroke={F.strek} strokeWidth={1} />
          <rect x={395} y={startY + lag[0].h + lag[1].h} width={25} height={lag[2].h} fill={F.tre} stroke={F.strek} strokeWidth={1} />
          <text x={143} y={startY + lag[0].h + lag[1].h + lag[2].h / 2 + 5} textAnchor="middle" style={{ ...fS, fontSize: "10px", fill: "#fff", fontWeight: 700 }}>
            5
          </text>

          {/* Svill */}
          <rect x={140} y={y + 4} width={70} height={20} fill={F.tre} stroke={F.strek} strokeWidth={1.5} />
          <rect x={340} y={y + 4} width={70} height={20} fill={F.tre} stroke={F.strek} strokeWidth={1.5} />
          <text x={175} y={y + 18} textAnchor="middle" style={{ ...fS, fontSize: "10px", fill: "#fff", fontWeight: 700 }}>6</text>
          <text x={375} y={y + 18} textAnchor="middle" style={{ ...fS, fontSize: "10px", fill: "#fff", fontWeight: 700 }}>6</text>

          {/* Pilar */}
          <rect x={150} y={y + 24} width={50} height={36} fill={F.betong} stroke={F.strek} strokeWidth={1.5} />
          <rect x={350} y={y + 24} width={50} height={36} fill={F.betong} stroke={F.strek} strokeWidth={1.5} />

          <text x={175} y={y + 50} textAnchor="middle" style={{ ...fSHvit, fontSize: "11px" }}>pilar</text>
          <text x={375} y={y + 50} textAnchor="middle" style={{ ...fSHvit, fontSize: "11px" }}>pilar</text>

          {/* Bjelke + iso totalhøyde mål */}
          {void totalH}
        </svg>
      }
    />
  );
}

// ===========================================================
// 4. YTTERVEGG-SNITT — horisontal lagsekvens
// ===========================================================
export function YtterveggSnitt() {
  // Tykkelser i mm, og hver representasjon "bredde" i px (skalert)
  const SKALA_TYKKELSE = 2.5; // 1 mm = 2.5 px

  const lag = [
    { nr: 1, farge: F.panel, mm: 23, navn: "Glattkantpanel gran (utvendig)" },
    { nr: 2, farge: "#fff", mm: 23, navn: "Klimaspalte (lekter 23×48 c/c 600)" },
    { nr: 3, farge: F.vindsperre, mm: 1, navn: "Vindsperre" },
    { nr: 4, farge: F.stender, mm: 98, navn: "Stender 48×98 C24 c/c 600" },
    { nr: 5, farge: F.iso, mm: 98, navn: "Iso mineralull 98 mm (mellom stender)", overlapp: 4 },
    { nr: 6, farge: F.dampsperre, mm: 1, navn: "Dampsperre (PE eller alu i badstu)" },
    { nr: 7, farge: F.tre, mm: 14, navn: "Innepanel (furu / osp i badstu)" },
  ];

  // Bygg opp x-koordinater. Lag 4 og 5 deler samme tykkelse-region — vi tegner stender som mørkere markering OPPÅ iso.
  let x = 80;
  const startX = x;
  const yTop = 60;
  const yBot = 230;
  const drawLag: (typeof lag[number] & { x: number; w: number })[] = [];
  for (const l of lag) {
    if (l.nr === 5) continue; // iso tegnes sammen med stender
    const w = Math.max(l.mm * SKALA_TYKKELSE, 4);
    drawLag.push({ ...l, x, w });
    x += w;
  }
  const totalEnd = x;

  return (
    <TegningMedTabell
      total="ca. 130 mm"
      totalLabel="Veggtykkelse"
      lag={lag
        .filter((l) => l.nr !== 5)
        .concat([lag.find((l) => l.nr === 5)!])
        .sort((a, b) => a.nr - b.nr)
        .map((l) => ({ nr: l.nr, farge: l.farge, dim: `${l.mm} mm`, navn: l.navn }))}
      tegning={
        <svg viewBox="0 0 760 400" className="mx-auto block w-full" preserveAspectRatio="xMidYMid meet">
          <text x={380} y={28} textAnchor="middle" style={fSStor}>
            Yttervegg — sett ovenfra (horisontalt snitt gjennom veggen)
          </text>
          <text x={380} y={50} textAnchor="middle" style={fMal}>
            Forestill deg at du ser ned på veggen ovenfra. Lagene står som vertikale stripes, fra utvendig (venstre) til innvendig (høyre).
          </text>

          {/* Orientering-skisse oppe til venstre */}
          <g transform="translate(20, 75)">
            <text x={50} y={-2} textAnchor="middle" style={{ ...fMal, fontSize: "11px" }}>Snittlinje (rom-plan)</text>
            <rect x={10} y={10} width={80} height={50} fill="#fff" stroke={F.strek} strokeWidth={1.5} />
            <text x={50} y={42} textAnchor="middle" style={{ ...fS, fontSize: "10px" }}>rommet</text>
            {/* Snitt-pil */}
            <line x1={5} y1={30} x2={95} y2={30} stroke={F.mal} strokeWidth={2.5} strokeDasharray="4 2" />
            <polygon points="93,26 99,30 93,34" fill={F.mal} />
            <text x={50} y={78} textAnchor="middle" style={{ ...fMal, fontSize: "10px" }}>Sett SLIK gjennom veggen</text>
          </g>

          {/* Store retningspiler */}
          <g>
            <text x={20} y={195} style={{ ...fSBold, fill: "#5a78a8", fontSize: "15px" }}>← UTE</text>
            <text x={20} y={215} style={{ ...fS, fontSize: "11px" }}>(regn, vind, kulde)</text>
          </g>
          <g>
            <text x={totalEnd + 18} y={195} style={{ ...fSBold, fill: "#a85a5a", fontSize: "15px" }}>INNE →</text>
            <text x={totalEnd + 18} y={215} style={{ ...fS, fontSize: "11px" }}>(varme, fukt)</text>
          </g>

          {/* Iso 98 mm bakgrunn (tegnes først) */}
          <rect
            x={drawLag.find((l) => l.nr === 4)!.x}
            y={yTop}
            width={drawLag.find((l) => l.nr === 4)!.w}
            height={yBot - yTop}
            fill={F.iso}
            stroke={F.strek}
            strokeWidth={1}
          />

          {/* Stender (vertikale rektangler) */}
          <rect
            x={drawLag.find((l) => l.nr === 4)!.x}
            y={yTop}
            width={drawLag.find((l) => l.nr === 4)!.w}
            height={20}
            fill={F.stender}
            stroke={F.strek}
            strokeWidth={1}
          />
          <rect
            x={drawLag.find((l) => l.nr === 4)!.x}
            y={yBot - 20}
            width={drawLag.find((l) => l.nr === 4)!.w}
            height={20}
            fill={F.stender}
            stroke={F.strek}
            strokeWidth={1}
          />
          <text
            x={drawLag.find((l) => l.nr === 4)!.x + drawLag.find((l) => l.nr === 4)!.w / 2}
            y={(yTop + yBot) / 2 + 5}
            textAnchor="middle"
            style={{ ...fSBold, fontSize: "13px" }}
          >
            iso 98 mm
          </text>
          <text
            x={drawLag.find((l) => l.nr === 4)!.x + 4}
            y={yTop + 13}
            style={{ ...fS, fontSize: "10px", fontWeight: 700 }}
          >
            stender
          </text>

          {/* Andre lag */}
          {drawLag.filter((l) => l.nr !== 4).map((l) => (
            <g key={l.nr}>
              <rect x={l.x} y={yTop} width={l.w} height={yBot - yTop} fill={l.farge} stroke={F.strek} strokeWidth={1} />
            </g>
          ))}

          {/* Etikettsirkler over hver lag */}
          {drawLag.map((l) => (
            <g key={`n${l.nr}`}>
              <circle cx={l.x + l.w / 2} cy={yTop - 18} r={12} fill="#fff" stroke={F.strek} strokeWidth={1.5} />
              <text x={l.x + l.w / 2} y={yTop - 14} textAnchor="middle" style={{ ...fSBold, fontSize: "12px" }}>
                {l.nr}
              </text>
            </g>
          ))}

          {/* Mål under */}
          {drawLag.map((l) => (
            <text key={`d${l.nr}`} x={l.x + l.w / 2} y={yBot + 25} textAnchor="middle" style={fMal}>
              {l.mm}
            </text>
          ))}

          {/* Totalmål */}
          <MalPil x1={startX} y1={yBot + 55} x2={totalEnd} y2={yBot + 55} label="ca. 130 mm" />
        </svg>
      }
    />
  );
}

// ===========================================================
// 5. TAKSTOL — front sett med hanebjelke for ekstra stivhet
// ===========================================================
export function TakstolTegning() {
  const SKALA = 130;
  const MARG_X = 80;
  const MARG_Y = 90;
  const bindeLengde = 2.7 * SKALA;
  const moneHoyde = (2.7 / 2) * Math.tan((25 * Math.PI) / 180) * SKALA;

  const yBunn = MARG_Y + moneHoyde + 70;
  const xVenstre = MARG_X;
  const xHoyre = xVenstre + bindeLengde;
  const xMone = (xVenstre + xHoyre) / 2;
  const yMone = yBunn - moneHoyde;

  // Hanebjelke plasseres ca 1/3 ned fra mønet — halvveis på sperrene gir bredt fotfeste
  const hanePos = 0.55; // 55% av veien opp fra bindebjelke til møne
  const xHaneV = xVenstre + (xMone - xVenstre) * (1 - hanePos);
  const yHane = yBunn - moneHoyde * hanePos;
  const xHaneH = xHoyre + (xMone - xHoyre) * (1 - hanePos);

  const w = bindeLengde + 2 * MARG_X + 130;
  const h = yBunn + 170;

  return (
    <TegningMedTabell
      lag={[
        { nr: 1, farge: F.tre, dim: "48×148 × 1,49 m", navn: "Sperr C24 (skrå, 25°) — 2 stk per takstol" },
        { nr: 2, farge: F.tre, dim: "48×148 × 2,70 m", navn: "Bindebjelke = himlingsbjelke (i vegglinje)" },
        { nr: 3, farge: F.tre, dim: "48×98 × ~1,50 m", navn: "Hanebjelke — kobler de to sperrene horisontalt (anbefalt)" },
        { nr: 4, farge: "#fff", dim: "knyteplate eller utbørede skruer", navn: "Møtepunkt møne — kapping og kobling" },
      ]}
      total="10 stk takstoler (c/c 600 mm langs 5,40 m lengde)"
      totalLabel="Mengde"
      tegning={
        <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto block w-full" preserveAspectRatio="xMidYMid meet">
          <text x={w / 2} y={28} textAnchor="middle" style={fSStor}>
            Takstol — sett fra gavlsiden (= på tvers av bygget)
          </text>
          <text x={w / 2} y={50} textAnchor="middle" style={fMal}>
            Saltak 25° • spennvidde 2,70 m • 21 % bjelke-utnyttelse (godt innenfor)
          </text>

          {/* Sperrer */}
          <line x1={xVenstre} y1={yBunn} x2={xMone} y2={yMone} stroke={F.tre} strokeWidth={18} strokeLinecap="round" />
          <line x1={xMone} y1={yMone} x2={xHoyre} y2={yBunn} stroke={F.tre} strokeWidth={18} strokeLinecap="round" />

          {/* Bindebjelke */}
          <line x1={xVenstre} y1={yBunn} x2={xHoyre} y2={yBunn} stroke={F.tre} strokeWidth={18} strokeLinecap="round" />

          {/* Hanebjelke */}
          <line x1={xHaneV} y1={yHane} x2={xHaneH} y2={yHane} stroke={F.treMork} strokeWidth={14} strokeLinecap="round" />

          {/* Knytteplate i mønet */}
          <circle cx={xMone} cy={yMone} r={20} fill="#fff" stroke={F.strek} strokeWidth={2} />
          <line x1={xMone - 11} y1={yMone - 11} x2={xMone + 11} y2={yMone + 11} stroke={F.strek} strokeWidth={1.5} />
          <line x1={xMone - 11} y1={yMone + 11} x2={xMone + 11} y2={yMone - 11} stroke={F.strek} strokeWidth={1.5} />

          {/* Etikett-nummer — plassert på sidene for å ikke overlappe */}
          <g>
            <circle cx={(xVenstre + xMone) / 2 - 38} cy={(yBunn + yMone) / 2 - 22} r={14} fill="#fff" stroke={F.strek} strokeWidth={1.5} />
            <text x={(xVenstre + xMone) / 2 - 38} y={(yBunn + yMone) / 2 - 17} textAnchor="middle" style={fSBold}>1</text>
            <line x1={(xVenstre + xMone) / 2 - 25} y1={(yBunn + yMone) / 2 - 14} x2={(xVenstre + xMone) / 2 - 6} y2={(yBunn + yMone) / 2 - 6} stroke={F.strek} strokeWidth={0.8} />
          </g>
          <g>
            <circle cx={xMone} cy={yBunn + 22} r={14} fill="#fff" stroke={F.strek} strokeWidth={1.5} />
            <text x={xMone} y={yBunn + 27} textAnchor="middle" style={fSBold}>2</text>
            <line x1={xMone} y1={yBunn + 8} x2={xMone} y2={yBunn - 6} stroke={F.strek} strokeWidth={0.8} />
          </g>
          <g>
            <circle cx={(xHaneV + xHaneH) / 2} cy={yHane - 22} r={14} fill="#fff" stroke={F.strek} strokeWidth={1.5} />
            <text x={(xHaneV + xHaneH) / 2} y={yHane - 17} textAnchor="middle" style={fSBold}>3</text>
            <line x1={(xHaneV + xHaneH) / 2} y1={yHane - 8} x2={(xHaneV + xHaneH) / 2} y2={yHane - 4} stroke={F.strek} strokeWidth={0.8} />
          </g>
          <g>
            <circle cx={xMone + 36} cy={yMone - 30} r={14} fill="#fff" stroke={F.strek} strokeWidth={1.5} />
            <text x={xMone + 36} y={yMone - 25} textAnchor="middle" style={fSBold}>4</text>
            <line x1={xMone + 24} y1={yMone - 18} x2={xMone + 13} y2={yMone - 8} stroke={F.strek} strokeWidth={0.8} />
          </g>

          {/* Vinkel ved venstre raft */}
          <path d={`M ${xVenstre + 36} ${yBunn} A 36 36 0 0 0 ${xVenstre + 36 * Math.cos(0.436)} ${yBunn - 36 * Math.sin(0.436)}`} fill="none" stroke={F.mal} strokeWidth={1.2} />
          <text x={xVenstre + 44} y={yBunn - 17} style={fMal}>25°</text>

          {/* Mål */}
          <MalPil x1={xVenstre} y1={yBunn + 70} x2={xHoyre} y2={yBunn + 70} label="2,70 m bindebjelke (vegg-til-vegg)" />
          <MalPil x1={xHoyre + 60} y1={yBunn} x2={xHoyre + 60} y2={yMone} label="0,63 m mønhøyde" />
          <MalPil x1={xHoyre + 60} y1={yBunn} x2={xHoyre + 60} y2={yHane} label="ca 0,35 m" />

          {/* Vegg-topp markering */}
          <text x={xVenstre - 30} y={yBunn + 6} textAnchor="end" style={fS}>← veggtopp</text>
          <text x={xHoyre + 6} y={yBunn + 6} style={fS}>veggtopp →</text>

          {/* Forklaring nederst */}
          <text x={w / 2} y={yBunn + 130} textAnchor="middle" style={{ ...fMal, fontSize: "12px" }}>
            Hanebjelken (3) er ikke statisk nødvendig for 2,70 m spennvidde, men gir
            stivhet og hindrer at sperrene presser veggene utover.
          </text>
        </svg>
      }
    />
  );
}

// ===========================================================
// 6. TAKSNITT — orientert som skrå tak sett fra siden
// ===========================================================
// Tegningen er et SKRÅ snitt langs takflaten. Du ser sperren i tverrsnitt
// (firkant nederst), og lagene over er stablet i normalretningen på taket.
// Selve taket heller 25°, men her er det tegnet horisontalt for å vise
// lagstrukturen tydelig.
export function TakSnitt() {
  return (
    <TegningMedTabell
      lag={[
        { nr: 1, farge: F.takpapp, dim: "≈ 3 mm", navn: "Takpapp shingel light (det vannet renner på)" },
        { nr: 2, farge: F.tre, dim: "23×48 c/c 600", navn: "Sløyfer (skaper 50 mm luftespalte under takpapp)" },
        { nr: 3, farge: F.vindsperre, dim: "≈ 1 mm", navn: "Undertaksduk (vannfast, lufttett)" },
        { nr: 4, farge: F.osb, dim: "15 mm", navn: "OSB taktro (festeplate for taktekking)" },
        { nr: 5, farge: F.tre, dim: "48×148 c/c 600", navn: "Sperrer C24 (under taktroen — tegnet som tverrsnitt)" },
      ]}
      total="≈ 75 mm tekking + 148 mm sperr"
      totalLabel="Total takhøyde"
      tegning={
        <svg viewBox="0 0 720 460" className="mx-auto block w-full" preserveAspectRatio="xMidYMid meet">
          <text x={360} y={28} textAnchor="middle" style={fSStor}>
            Tak — snitt på TVERS av sperrene
          </text>
          <text x={360} y={50} textAnchor="middle" style={fMal}>
            Sperrene løper inn i bildet (langs tilbyggets 5,40 m). Lagene oppå er stablet vertikalt fra utside (oppe) til kaldt loft (under).
          </text>

          {/* Orientering-skisse (liten husskisse oppe til venstre) */}
          <g transform="translate(20, 70)">
            <text x={50} y={-2} textAnchor="middle" style={{ ...fMal, fontSize: "11px" }}>Snittlinje</text>
            <polygon points="20,40 80,40 50,20" fill="#fff" stroke={F.strek} strokeWidth={1.5} />
            <line x1={20} y1={40} x2={80} y2={40} stroke={F.strek} strokeWidth={1.5} />
            {/* Snittpilen */}
            <line x1={50} y1={5} x2={50} y2={48} stroke={F.mal} strokeWidth={2} strokeDasharray="3 2" />
            <polygon points="46,46 54,46 50,55" fill={F.mal} />
            <text x={50} y={75} textAnchor="middle" style={{ ...fMal, fontSize: "10px" }}>se snitt nedenfor</text>
          </g>

          <text x={360} y={100} textAnchor="middle" style={fSBold}>↑ UTSIDE (regn, sol, vind)</text>

          {/* Takpapp (lag 1) */}
          <rect x={120} y={120} width={480} height={22} fill={F.takpapp} stroke={F.strek} strokeWidth={1.5} />
          <text x={360} y={136} textAnchor="middle" style={{ ...fSHvit, fontSize: "13px" }}>1. Takpapp shingel light</text>

          {/* Sløyfer / luftespalte (lag 2) */}
          <rect x={120} y={142} width={480} height={32} fill="#fff" stroke={F.strek} strokeWidth={1.5} />
          {[170, 270, 370, 470, 570].map((x) => (
            <rect key={x} x={x - 12} y={142} width={24} height={32} fill={F.tre} stroke={F.strek} strokeWidth={1} />
          ))}
          <text x={360} y={163} textAnchor="middle" style={fS}>2. Sløyfer 23×48 — 50 mm luftespalte</text>

          {/* Undertaksduk (lag 3) */}
          <rect x={120} y={174} width={480} height={10} fill={F.vindsperre} stroke={F.strek} strokeWidth={1} />
          <text x={360} y={183} textAnchor="middle" style={{ ...fS, fontSize: "12px", fontWeight: 700 }}>3. Undertaksduk</text>

          {/* OSB taktro (lag 4) */}
          <rect x={120} y={184} width={480} height={22} fill={F.osb} stroke={F.strek} strokeWidth={1.5} />
          <text x={360} y={200} textAnchor="middle" style={fSBold}>4. OSB 15 mm taktro</text>

          {/* Sperrer på tvers (lag 5) — vises som tverrsnitt-firkanter med pil INN */}
          <text x={360} y={232} textAnchor="middle" style={fSBold}>
            5. Sperrer (firkant-tverrsnitt — bjelken løper INN i bildet)
          </text>
          <rect x={150} y={246} width={36} height={80} fill={F.tre} stroke={F.strek} strokeWidth={2} />
          <rect x={342} y={246} width={36} height={80} fill={F.tre} stroke={F.strek} strokeWidth={2} />
          <rect x={534} y={246} width={36} height={80} fill={F.tre} stroke={F.strek} strokeWidth={2} />
          <text x={168} y={290} textAnchor="middle" style={{ ...fSHvit, fontSize: "11px" }}>48×148</text>
          <text x={360} y={290} textAnchor="middle" style={{ ...fSHvit, fontSize: "11px" }}>48×148</text>
          <text x={552} y={290} textAnchor="middle" style={{ ...fSHvit, fontSize: "11px" }}>48×148</text>

          {/* "INN i bildet"-pil-skisse */}
          <g transform="translate(622, 290)">
            <circle cx={0} cy={0} r={14} fill="#fff" stroke={F.mal} strokeWidth={1.5} />
            <circle cx={0} cy={0} r={4} fill={F.mal} />
            <text x={20} y={5} style={{ ...fMal, fontSize: "11px" }}>sperr-retning</text>
          </g>

          {/* "MELLOM SPERRENE: kaldt loft (luft)" */}
          <text x={264} y={290} textAnchor="middle" style={{ ...fS, fill: "#5a78a8", fontWeight: 700 }}>kaldt loft</text>
          <text x={456} y={290} textAnchor="middle" style={{ ...fS, fill: "#5a78a8", fontWeight: 700 }}>kaldt loft</text>

          {/* C/C mål mellom sperrer */}
          <MalPil x1={168} y1={345} x2={360} y2={345} label="c/c 600 mm" />

          {/* Etikettsirkler venstre side - litt utenfor selve laget */}
          {[
            { y: 131, n: 1 },
            { y: 158, n: 2 },
            { y: 179, n: 3 },
            { y: 195, n: 4 },
            { y: 286, n: 5 },
          ].map(({ y, n }) => (
            <g key={n}>
              <circle cx={95} cy={y} r={14} fill="#fff" stroke={F.strek} strokeWidth={1.5} />
              <text x={95} y={y + 5} textAnchor="middle" style={fSBold}>{n}</text>
            </g>
          ))}

          {/* Mål-piler til høyre */}
          <MalPil x1={650} y1={120} x2={650} y2={206} label="≈ 75 mm tekking" />
          <MalPil x1={650} y1={246} x2={650} y2={326} label="148 mm sperr" />

          {/* Bunntekst */}
          <text x={360} y={400} textAnchor="middle" style={fSBold}>
            ↓ Under sperrene: kaldt loft → bindebjelke + 200 mm iso → himling (se Gulvsnitt og Tverrsnitt)
          </text>
        </svg>
      }
    />
  );
}

// ===========================================================
// 7. TVERRSNITT — hele bygget sett fra gavlsiden
// ===========================================================
export function Tverrsnitt() {
  const SKALA = 90;
  const MARG = 80;
  const dybde = 2.7 * SKALA;
  const vegghoyde = 2.6 * SKALA;
  const moneHoyde = (2.7 / 2) * Math.tan((25 * Math.PI) / 180) * SKALA;

  const yBakke = MARG + moneHoyde + vegghoyde + 60 + 40;
  const yGulv = yBakke - 40;
  const yVeggtopp = yGulv - vegghoyde;
  const yMone = yVeggtopp - moneHoyde;

  const xVenstre = MARG;
  const xHoyre = xVenstre + dybde;
  const xMone = (xVenstre + xHoyre) / 2;
  const utstikk = 0.4 * SKALA;

  const w = dybde + 2 * MARG + 120;
  const h = yBakke + 100;

  return (
    <TegningMedTabell
      lag={[
        { nr: 1, farge: F.takpapp, dim: "—", navn: "Taktekking + OSB taktro + undertaksduk" },
        { nr: 2, farge: F.tre, dim: "48×148", navn: "Sperr — del av takstol (25°)" },
        { nr: 3, farge: F.iso, dim: "200 mm", navn: "Iso i himlingen (mellom bindebjelker)" },
        { nr: 4, farge: F.tre, dim: "48×148", navn: "Bindebjelke = himlingsbjelke (2,70 m)" },
        { nr: 5, farge: "#fff", dim: "—", navn: "Raftventil — lufter kaldt loft" },
        { nr: 6, farge: F.panel, dim: "130 mm", navn: "Yttervegg (se eget snitt)" },
        { nr: 7, farge: F.osb, dim: "—", navn: "Gulv (OSB + dampsperre + iso 200 + vindsperre)" },
        { nr: 8, farge: F.tre, dim: "48×148", navn: "Svill C24 — på fundamentbeslag" },
        { nr: 9, farge: F.betong, dim: "Ø250", navn: "Betongpilar (8 stk totalt)" },
      ]}
      tegning={
        <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto block w-full" preserveAspectRatio="xMidYMid meet">
          <text x={w / 2} y={28} textAnchor="middle" style={fSStor}>
            Komplett tverrsnitt
          </text>

          {/* Bakke */}
          <line x1={20} y1={yBakke} x2={w - 20} y2={yBakke} stroke={F.bakke} strokeWidth={3} />
          <pattern id="bakke2" patternUnits="userSpaceOnUse" width={8} height={8}>
            <path d="M0,8 l8,-8" stroke={F.bakke} strokeWidth={0.8} />
          </pattern>
          <rect x={20} y={yBakke} width={w - 40} height={50} fill="url(#bakke2)" />

          {/* Pilarer */}
          <rect x={xVenstre - 12} y={yBakke - 50} width={24} height={50} fill={F.betong} stroke={F.strek} strokeWidth={1.5} />
          <rect x={xHoyre - 12} y={yBakke - 50} width={24} height={50} fill={F.betong} stroke={F.strek} strokeWidth={1.5} />

          {/* Svill */}
          <rect x={xVenstre - 14} y={yGulv} width={28} height={14} fill={F.tre} stroke={F.strek} strokeWidth={1.5} />
          <rect x={xHoyre - 14} y={yGulv} width={28} height={14} fill={F.tre} stroke={F.strek} strokeWidth={1.5} />

          {/* Gulv (flat plate) */}
          <rect x={xVenstre} y={yGulv - 8} width={dybde} height={8} fill={F.osb} stroke={F.strek} strokeWidth={1} />

          {/* Vegger (vertikale) */}
          <rect x={xVenstre - 14} y={yVeggtopp} width={14} height={vegghoyde} fill={F.panel} stroke={F.strek} strokeWidth={1.5} />
          <rect x={xHoyre} y={yVeggtopp} width={14} height={vegghoyde} fill={F.panel} stroke={F.strek} strokeWidth={1.5} />

          {/* Bindebjelke + iso */}
          <rect x={xVenstre} y={yVeggtopp - 18} width={dybde} height={18} fill={F.iso} stroke={F.strek} strokeWidth={1} />
          <rect x={xVenstre} y={yVeggtopp} width={dybde} height={12} fill={F.tre} stroke={F.strek} strokeWidth={1} />

          {/* Sperrer (skrå) */}
          <line x1={xVenstre - utstikk - 4} y1={yVeggtopp + 6} x2={xMone} y2={yMone} stroke={F.tre} strokeWidth={12} strokeLinecap="round" />
          <line x1={xMone} y1={yMone} x2={xHoyre + utstikk + 4} y2={yVeggtopp + 6} stroke={F.tre} strokeWidth={12} strokeLinecap="round" />

          {/* Taktekking (skrå svart linje over sperrene) */}
          <line x1={xVenstre - utstikk - 8} y1={yVeggtopp + 1} x2={xMone} y2={yMone - 10} stroke={F.takpapp} strokeWidth={5} strokeLinecap="round" />
          <line x1={xMone} y1={yMone - 10} x2={xHoyre + utstikk + 8} y2={yVeggtopp + 1} stroke={F.takpapp} strokeWidth={5} strokeLinecap="round" />

          {/* Raftventil */}
          <rect x={xVenstre - 11} y={yVeggtopp + 16} width={9} height={11} fill="#fff" stroke={F.strek} strokeWidth={1} />
          <rect x={xHoyre + 2} y={yVeggtopp + 16} width={9} height={11} fill="#fff" stroke={F.strek} strokeWidth={1} />

          {/* Sone-tekster */}
          <text x={xMone} y={yMone + 28} textAnchor="middle" style={{ ...fSBold, fill: "#5a78a8", fontSize: "13px" }}>
            kaldt loft
          </text>
          <text x={xMone} y={(yVeggtopp + yGulv) / 2 + 8} textAnchor="middle" style={{ ...fSBold, fontSize: "15px" }}>
            ROM
          </text>
          <text x={xMone} y={yBakke - 20} textAnchor="middle" style={{ ...fSBold, fill: "#fff", fontSize: "12px" }}>
            kryperom
          </text>
          <text x={20} y={yBakke + 15} style={{ ...fS, fontSize: "11px" }}>bakke</text>

          {/* Mål */}
          <MalPil x1={xVenstre} y1={yBakke + 35} x2={xHoyre} y2={yBakke + 35} label="2,70 m dybde" />
          <MalPil x1={xVenstre - 50} y1={yGulv} x2={xVenstre - 50} y2={yVeggtopp} label="2,60 m vegg" />
          <MalPil x1={xHoyre + 40} y1={yVeggtopp} x2={xHoyre + 40} y2={yMone} label="0,63 m møne" />
          <MalPil x1={xVenstre - 50} y1={yGulv} x2={xVenstre - 50} y2={yBakke - 50} label="kryperom" />

          <text x={xMone - 22} y={yMone - 12} style={fMal}>25°</text>
        </svg>
      }
    />
  );
}
