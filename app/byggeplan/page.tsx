import {
  G,
  KONSTR,
  fundamenter,
  grunnflate,
  kategoriSum,
  lagMaterialliste,
  moneHoydeOverVegg,
  sperrLengde,
  statiskKontrollSperrer,
  takflateMedUtstikk,
  totalKr,
} from "@/lib/byggBeregninger";
import { tilbyggetRom } from "@/lib/bygg";

// Format helper
const fNum = (n: number, d = 2) =>
  n.toLocaleString("nb-NO", { minimumFractionDigits: d, maximumFractionDigits: d });
const fKr = (n: number) =>
  Math.round(n).toLocaleString("nb-NO") + " kr";

export default function ByggeplanPage() {
  const sk = statiskKontrollSperrer();
  const fund = fundamenter();
  const liste = lagMaterialliste();
  const sumPerKat = kategoriSum(liste);
  const total = totalKr(liste);

  const kategorier = Array.from(new Set(liste.map((p) => p.kategori)));

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold">Byggeplan — materialliste &amp; statisk kontroll</h1>
        <p className="mt-1 text-stone-600">
          Alle mål leses ut av <code className="rounded bg-stone-100 px-1.5 py-0.5 text-sm">lib/bygg.ts</code>{" "}
          (3D-modellen er fasit). <strong>Lav-budsjett, egeninnsats:</strong> bindingsverk 48×98
          C24 c/c 600, ventilert kryperom på støpte betongpilarer, selvbygde takstoler
          m/flat himling og kalt loft luftet via raft + gavl, snølast 450 kg/m².
          Netto mengder (åpninger trukket fra).
        </p>
      </header>

      {/* ---- Nøkkeltall ---- */}
      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-3 text-xl font-semibold">Hovedmål fra modellen</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          <DlItem k="Lengde × dybde" v={`${fNum(G.lengde, 2)} × ${fNum(G.dybde, 2)} m`} />
          <DlItem k="Vegghøyde" v={`${fNum(G.vegghoyde, 2)} m`} />
          <DlItem k="Grunnflate" v={`${fNum(grunnflate, 2)} m²`} />
          <DlItem k="Takform" v="Saltak, møne langs hyttevegg" />
          <DlItem k="Takvinkel" v={`${G.takvinkel}°`} />
          <DlItem k="Mønehøyde over veggtopp" v={`${fNum(moneHoydeOverVegg, 2)} m`} />
          <DlItem k="Sperr-lengde (raft → møne)" v={`${fNum(sperrLengde, 2)} m`} />
          <DlItem k="Takflate inkl. utstikk" v={`${fNum(takflateMedUtstikk, 2)} m²`} />
          <DlItem k="Innervegg-tykkelse" v={`${G.innerveggTykkelse * 1000} mm`} />
        </dl>
        <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          {tilbyggetRom.map((r) => (
            <div key={r.navn} className="rounded-md border border-stone-200 p-3">
              <div className="font-semibold text-stone-800">{r.navn}</div>
              <div className="text-stone-600">
                {fNum(r.bredde, 2)} × {fNum(r.dybde, 2)} m = {fNum(r.bredde * r.dybde, 2)} m² brutto
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Fundamenter ---- */}
      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-3 text-xl font-semibold">Fundamenter (betongpilarer)</h2>
        <p className="text-sm text-stone-700">{fund.begrunnelse}</p>
        <p className="mt-1 text-sm text-stone-600">
          Pilaravstand langs hver langside: {fNum(fund.pilarAvstand_m, 2)} m. Ventilert kryperom under svillen.
        </p>
        <div className="mt-3 overflow-hidden rounded-md border border-stone-200">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="px-3 py-2 text-left">Pilar</th>
                <th className="px-3 py-2 text-right">x [m]</th>
                <th className="px-3 py-2 text-right">z [m]</th>
              </tr>
            </thead>
            <tbody>
              {fund.pilarer.map((p) => (
                <tr key={p.navn} className="border-t border-stone-100">
                  <td className="px-3 py-1.5">{p.navn}</td>
                  <td className="px-3 py-1.5 text-right">{fNum(p.x, 2)}</td>
                  <td className="px-3 py-1.5 text-right">{fNum(p.z, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---- Statisk kontroll ---- */}
      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-3 text-xl font-semibold">Statisk kontroll — taksperrer</h2>
        <p className="text-sm text-stone-700">
          Snølast karakteristisk på bakken: <strong>4,5 kN/m²</strong> (450 kg/m², fjellhytte). Formfaktor for
          saltak 25° μ₁ = 0,8 → snølast på tak <strong>3,6 kN/m²</strong>. Egenvekt
          takkonstruksjon estimert til ~0,5 kN/m². Sperr c/c 600 mm, enkeltspenn raft → møne.
        </p>
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <DlItem k="Bjelkedimensjon" v={sk.bjelkeDim} />
          <DlItem k="Spennvidde (skrå)" v={`${fNum(sk.spennvidde_m, 2)} m`} />
          <DlItem k="Linjelast per sperr (skrå)" v={`${fNum(sk.belastning_kNm, 2)} kN/m`} />
          <DlItem k="Maks moment" v={`${fNum(sk.moment_kNm, 3)} kNm`} />
          <DlItem k="Motstandsmoment W" v={`${Math.round(sk.W_mm3).toLocaleString("nb-NO")} mm³`} />
          <DlItem
            k="Bøyespenning"
            v={`${fNum(sk.spenning_Nmm2, 2)} N/mm² (av tillatt ${fNum(sk.tillattSpenning_Nmm2, 1)})`}
          />
          <DlItem k="Utnyttelse" v={`${fNum(sk.utnyttelse_pst, 0)} %`} />
          <DlItem
            k="Nedbøyning"
            v={`${fNum(sk.nedboyning_mm, 2)} mm (av tillatt ${fNum(sk.tillattNedboyning_mm, 1)})`}
          />
        </dl>
        <p
          className={
            sk.konklusjon === "OK"
              ? "mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
              : "mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-900"
          }
        >
          <strong>{sk.konklusjon}.</strong> {sk.forklaring}
        </p>
      </section>

      {/* ---- Materialliste ---- */}
      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-3 text-xl font-semibold">Materialliste</h2>
        <p className="mb-4 text-sm text-stone-600">
          Mengder regnet fra modellens mål. Priser er omtrentlige norske byggevarepriser (2026) —
          ikke offisielle tilbud. Bruk listen som budsjett-estimat.
        </p>

        {kategorier.map((kat) => (
          <div key={kat} className="mb-6">
            <h3 className="mb-2 text-lg font-semibold text-stone-800">{kat}</h3>
            <div className="overflow-hidden rounded-md border border-stone-200">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-stone-600">
                  <tr>
                    <th className="px-3 py-2 text-left">Vare</th>
                    <th className="px-3 py-2 text-right">Mengde</th>
                    <th className="px-3 py-2 text-left">Enhet</th>
                    <th className="px-3 py-2 text-right">Pris/enhet</th>
                    <th className="px-3 py-2 text-right">Sum</th>
                  </tr>
                </thead>
                <tbody>
                  {liste
                    .filter((p) => p.kategori === kat)
                    .map((p) => (
                      <tr key={p.navn} className="border-t border-stone-100 align-top">
                        <td className="px-3 py-1.5">
                          <div>{p.navn}</div>
                          {p.notat && (
                            <div className="text-xs text-stone-500">{p.notat}</div>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums">
                          {fNum(p.mengde, 2)}
                        </td>
                        <td className="px-3 py-1.5">{p.enhet}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums">
                          {fKr(p.prisEnhet)}
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums font-medium">
                          {fKr(p.totalKr)}
                        </td>
                      </tr>
                    ))}
                  <tr className="border-t border-stone-200 bg-stone-50">
                    <td colSpan={4} className="px-3 py-2 text-right font-semibold">
                      Sum {kat}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">
                      {fKr(sumPerKat[kat])}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <div className="mt-6 rounded-md border-2 border-amber-300 bg-amber-50 p-4">
          <div className="flex items-baseline justify-between">
            <div className="text-lg font-semibold text-amber-900">
              Total estimert kostnad
            </div>
            <div className="text-2xl font-bold tabular-nums text-amber-900">{fKr(total)}</div>
          </div>
          <p className="mt-1 text-sm text-amber-800">
            Inkluderer alle materialer i listen ovenfor. Arbeid (snekker, grunnarbeid, rørlegger,
            elektriker) og prosjektering kommer i tillegg — typisk dobles totalkostnaden av arbeid
            på et lite tilbygg som dette.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <h2 className="mb-2 text-lg font-semibold">Forbehold</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Statisk kontroll er en forenklet egen-beregning (NS-EN 1995-1-1 enkel bjelkemetode).
            For søknadspliktig bygg må statikk verifiseres av kvalifisert prosjekterende.
          </li>
          <li>
            Snølast 450 kg/m² er antatt. Faktisk snølast bestemmes av kommunens snølastkart og
            terrengkategori — for Sjusjøen ligger karakteristisk snølast typisk
            på 4,5–5,5 kN/m². Sjekk kommunens snølastkart.
          </li>
          <li>
            Pilaravstand {fNum(fund.pilarAvstand_m, 2)} m forutsetter svill {KONSTR.gulvSvillDim}.
            Geoteknisk vurdering av grunnforhold må gjøres lokalt.
          </li>
          <li>
            Priser oppdateres ofte og varierer mellom leverandører. Hent ferske tilbud før innkjøp.
          </li>
          <li>
            Badstuovn-effekt er en tommelfingerregel. Følg leverandørens anvisning for konkret modell.
          </li>
          <li>
            Søknad/melding til kommunen, brannmurplate, pipegjennomføring og el-arbeid må gjøres
            i samråd med kvalifisert fagperson.
          </li>
        </ul>
      </section>
    </div>
  );
}

function DlItem({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-stone-100 pb-1.5">
      <dt className="text-stone-600">{k}</dt>
      <dd className="font-medium text-stone-800">{v}</dd>
    </div>
  );
}
