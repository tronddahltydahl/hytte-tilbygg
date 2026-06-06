import { OPPSKRIFT, totalEstimertTid } from "@/lib/byggOppskrift";

export default function OppskriftPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Byggeoppskrift fra A til Å</h1>
        <p className="mt-1 text-stone-600">
          Trinn-for-trinn oppskrift fra fundament til ferdig badstu. Skreddersydd for
          dette tilbyggets mål (5,40 × 2,70 m), lavbudsjett-spec'en og egeninnsats.
        </p>
        <p className="mt-2 text-sm text-stone-500">
          <strong>Estimert total byggetid:</strong> {totalEstimertTid}.
        </p>
      </header>

      {/* Innholdsliste */}
      <nav
        aria-label="Innhold"
        className="rounded-xl border border-stone-200 bg-stone-50 p-5"
      >
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Faser
        </h2>
        <ol className="space-y-1.5 text-sm">
          {OPPSKRIFT.map((fase) => (
            <li key={fase.nr}>
              <a
                href={`#fase-${fase.nr}`}
                className="flex items-baseline justify-between gap-3 rounded-md px-2 py-1 hover:bg-white"
              >
                <span>
                  <span className="font-semibold text-stone-700">
                    Fase {fase.nr}.
                  </span>{" "}
                  <span className="text-stone-800">{fase.tittel}</span>
                </span>
                <span className="text-xs text-stone-500">{fase.estVarighet}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Faser */}
      {OPPSKRIFT.map((fase) => (
        <section
          key={fase.nr}
          id={`fase-${fase.nr}`}
          className="scroll-mt-20 rounded-xl border border-stone-200 bg-white p-6"
        >
          <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-stone-100 pb-3">
            <h2 className="text-2xl font-bold text-stone-800">
              <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-base text-amber-900">
                {fase.nr}
              </span>
              {fase.tittel}
            </h2>
            <span className="shrink-0 rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">
              {fase.estVarighet}
            </span>
          </div>

          <p className="mb-5 text-stone-700">{fase.ingress}</p>

          <ol className="space-y-4">
            {fase.trinn.map((t) => (
              <li
                key={t.nr}
                className="rounded-lg border border-stone-100 bg-stone-50/50 p-4"
              >
                <div className="flex items-baseline gap-3">
                  <span className="shrink-0 rounded-full bg-stone-200 px-2 py-0.5 text-xs font-semibold tabular-nums text-stone-700">
                    {fase.nr}.{t.nr}
                  </span>
                  <h3 className="text-lg font-semibold text-stone-800">
                    {t.tittel}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-stone-700">{t.beskrivelse}</p>
                {t.tips && (
                  <p className="mt-2 rounded-md bg-emerald-50 px-3 py-1.5 text-sm text-emerald-900">
                    <strong>Tips:</strong> {t.tips}
                  </p>
                )}
                {t.advarsel && (
                  <p className="mt-2 rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-900">
                    <strong>OBS:</strong> {t.advarsel}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}

      {/* Forbehold */}
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <h2 className="mb-2 text-lg font-semibold">Forbehold</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Oppskriften er et utgangspunkt — tilpass etter terreng, været og hva du
            faktisk klarer på egen hånd. Få hjelp av en med byggeerfaring til
            kritiske faser (takstoler, pipa).
          </li>
          <li>
            <strong>Søknadsplikt</strong>: før første spadetak, kontakt kommunen.
            Tilbygg over 15 m² (ofte) eller med varmeproduserende ildsted krever
            søknad — og en ferdigattest fra kommunen før det kan tas i bruk.
          </li>
          <li>
            <strong>Brannvern</strong>: vedovn, pipe, brannmurplate og minimum-avstand
            til brennbart materiale MÅ følge ovns- og pipe-leverandørens FDV.
            En feiermester / brannvernsjef i kommunen kan veilede.
          </li>
          <li>
            <strong>Statisk dimensjonering</strong> for snølast 450 kg/m² er en
            forenklet kontroll (se Byggeplan-siden). Ved søknadspliktig tiltak bør
            statikk verifiseres av kvalifisert prosjekterende.
          </li>
          <li>
            Materialliste og priser oppdateres ikke automatisk — sjekk dagens
            priser hos leverandør før innkjøp.
          </li>
        </ul>
      </section>
    </div>
  );
}
