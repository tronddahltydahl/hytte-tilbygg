import {
  FundamentPlan,
  GulvSnitt,
  PilarSnitt,
  TakSnitt,
  TakstolTegning,
  Tverrsnitt,
  YtterveggSnitt,
} from "@/components/Byggetegninger";

type Tegning = {
  nr: number;
  tittel: string;
  beskrivelse: string;
  Komp: () => React.JSX.Element;
};

const TEGNINGER: Tegning[] = [
  {
    nr: 1,
    tittel: "Fundamentplan",
    beskrivelse:
      "Sett ovenfra: 8 betongpilarer plassert med 1,80 m mellomrom langs begge langsider. Innerveggene Relax/Badstue og Badstue/Smørebod er markert med stiplet linje. Bruk dette som mal når du setter ut snorinnstillingen på terrenget.",
    Komp: FundamentPlan,
  },
  {
    nr: 2,
    tittel: "Pilar-snitt",
    beskrivelse:
      "Vertikalt snitt gjennom én pilar: papp-søyleform Ø250 fylt med B25-betong, M16 innstøpningsbolt, justerbart fundamentbeslag og svill 48×148 på toppen. Telefri dybde på Sjusjøen ca. 1,2 m.",
    Komp: PilarSnitt,
  },
  {
    nr: 3,
    tittel: "Gulvkonstruksjon — snitt",
    beskrivelse:
      "Lagene fra bunn til topp: pilar → fundamentbeslag → svill → gulvbjelker 48×148 c/c 600 → vindsperre under → iso 200 mm mellom bjelker → dampsperre (PE / alu i badstuen) → OSB 22 mm gulvplate.",
    Komp: GulvSnitt,
  },
  {
    nr: 4,
    tittel: "Yttervegg — horisontalt snitt",
    beskrivelse:
      "Veggens lag sett ovenfra. Ferdig veggtykkelse ca. 130 mm: glattkantpanel 23 + lekter 23 + vindsperre + stender 48×98 med iso 98 + dampsperre + innepanel 14. Aluminiumsfolie erstatter PE-folie i badstuens vegger.",
    Komp: YtterveggSnitt,
  },
  {
    nr: 5,
    tittel: "Takstol — selvbygget",
    beskrivelse:
      "10 stk takstoler bygges på bakken og løftes opp. Hver består av 2 sperrer 48×148 (1,49 m skrå, 25° vinkel mot horisontalplanet) + bindebjelke 48×148 (2,70 m). Knytteplate eller bolt i mønet.",
    Komp: TakstolTegning,
  },
  {
    nr: 6,
    tittel: "Tak — snitt gjennom takflaten",
    beskrivelse:
      "Tekkingen oppå sperrene: OSB 15 mm taktro → undertaksduk → sløyfer 23×48 (50 mm luftespalte) → takpapp shingel light. Mellomrommet mellom sperrene er kaldt loft — ingen isolasjon her, isolasjonen ligger i himlingen.",
    Komp: TakSnitt,
  },
  {
    nr: 7,
    tittel: "Komplett tverrsnitt",
    beskrivelse:
      "Hele bygget sett fra gavlsiden: kryperom med pilarer, gulvkonstruksjon, vegger, himling med 200 mm iso, kaldt loft luftet via raft, og saltak 25°. Bruk denne som referanse for å forstå hvordan alle delene henger sammen.",
    Komp: Tverrsnitt,
  },
];

export default function ByggetegningerPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Byggetegninger</h1>
        <p className="mt-1 text-stone-600">
          Konstruksjonstegninger til bruk under bygging. Lag-for-lag-snitt
          gjennom gulv, vegger, tak og takstoler. Mål er hentet fra
          3D-modellen og konstruksjonsdetaljene fra lav-budsjett-spec'en.
        </p>
      </header>

      {/* Viktig konteks: tilbygg INN i eksisterende hytte */}
      <section className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
        <h2 className="text-lg font-semibold text-amber-900">
          Husk: tilbygget festes INN i den eksisterende hytta
        </h2>
        <p className="mt-2 text-sm text-amber-900">
          Tilbygget bygges som en utvidelse mot hyttas høyre kortvegg
          (x = 13 m i modellens koordinatsystem). Konkret betyr det:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
          <li>
            <strong>Eget fundament</strong> (8 pilarer) — uavhengig av
            hyttas. Tilbygget kan «sette seg» uten å påvirke hytta.
          </li>
          <li>
            <strong>Bare 3 nye yttervegger</strong>: bak, front og høyre
            gavl. <strong>Venstre gavl er hyttas eksisterende
            yttervegg</strong> — ingen ny konstruksjon der.
          </li>
          <li>
            <strong>Relax-rommet «låner» hyttas yttervegg</strong>:
            overligger/lister på hyttas ytterpanel fjernes på dette
            arealet, og innepanel furu festes direkte utenpå hyttas
            eksisterende ytterpanel. Da blir det sømløs trefinish
            innvendig i Relax — og du sparer en hel yttervegg-konstruksjon.
          </li>
          <li>
            <strong>Eget tak</strong> med eget møne, parallelt med hyttas.
            Tett mellom takene med beslag (avslutningsbeslag mot
            hyttas kortvegg).
          </li>
          <li>
            <strong>Avstivning</strong>: tilbyggets bærevirke (sperrer,
            takstoler) festes inn i hyttas eksisterende stenderverk
            der det møter. Bruk vinkler/braketter, ikke spiker rett inn
            i hyttas panel.
          </li>
        </ul>
        <p className="mt-2 text-sm text-amber-900">
          Tegningene under viser tilbyggets nye konstruksjon. Hyttas
          eksisterende vegg er markert som «hyttevegg» i fundamentplanen,
          og er ikke vist i de andre snittene — der er det bare tilbyggets
          tre nye vegger.
        </p>
      </section>

      {/* Innholdsliste */}
      <nav
        aria-label="Innhold"
        className="rounded-xl border border-stone-200 bg-stone-50 p-5"
      >
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Tegninger
        </h2>
        <ol className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
          {TEGNINGER.map((t) => (
            <li key={t.nr}>
              <a
                href={`#tegning-${t.nr}`}
                className="block rounded-md px-2 py-1 hover:bg-white"
              >
                <span className="font-semibold text-stone-700">
                  {t.nr}.
                </span>{" "}
                <span className="text-stone-800">{t.tittel}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Tegninger */}
      {TEGNINGER.map(({ nr, tittel, beskrivelse, Komp }) => (
        <section
          key={nr}
          id={`tegning-${nr}`}
          className="scroll-mt-20 rounded-xl border border-stone-200 bg-white p-6"
        >
          <div className="mb-3 flex items-baseline gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-base font-semibold text-amber-900">
              {nr}
            </span>
            <h2 className="text-2xl font-bold text-stone-800">{tittel}</h2>
          </div>
          <p className="mb-4 text-sm text-stone-700">{beskrivelse}</p>
          <div className="overflow-hidden rounded-md border border-stone-200 bg-stone-50 p-3">
            <Komp />
          </div>
        </section>
      ))}

      {/* Bruksanvisning */}
      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="mb-3 text-xl font-semibold text-stone-800">
          Hvordan bruke tegningene
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-stone-700">
          <li>
            <strong>Fundamentplan (1)</strong> brukes når du setter ut
            snorinnstillingen og graver pilarhullene. Sjekk diagonalmål
            6,04 m for å verifisere at grunnrisset er rett-vinklet.
          </li>
          <li>
            <strong>Pilar-snitt (2)</strong> viser hvordan hver pilar
            bygges opp. Lik for alle 8 pilarene.
          </li>
          <li>
            <strong>Gulvsnittet (3)</strong> viser rekkefølgen på lagene
            i gulvkonstruksjonen — start nedenfra og jobb deg oppover.
          </li>
          <li>
            <strong>Yttervegg-snittet (4)</strong> følges når du reiser
            stenderverket, og igjen når du skal kle på utsiden og
            innsiden. Husk aluminiumsfolie i alle flater som vender mot
            badstuen.
          </li>
          <li>
            <strong>Takstol-tegningen (5)</strong> er malen for å lage
            takstolene på bakken. Lag én og test, så kopierer du den
            9 ganger.
          </li>
          <li>
            <strong>Tak-snittet (6)</strong> viser sekvensen for
            taktekkingen: OSB → duk → sløyfer → papp.
          </li>
          <li>
            <strong>Tverrsnittet (7)</strong> er hovedreferansen — bruk
            den til å sjekke at alt henger sammen på riktig sted i høyden.
          </li>
        </ol>
      </section>

      {/* Forbehold */}
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <h2 className="mb-2 text-lg font-semibold">Forbehold</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Tegningene er <strong>pedagogiske byggetegninger</strong>, ikke
            offisielle byggesøknadstegninger. For søknad må de tegnes opp
            i CAD/BIM-verktøy etter kommunens krav.
          </li>
          <li>
            Skalaen er ikke konsekvent mellom tegningene — bruk
            målangivelsene på selve tegningen, ikke en linjal.
          </li>
          <li>
            For brannmurplate, pipegjennomføring og elektrisk installasjon:
            følg leverandørenes FDV-dokumentasjon og kommunens
            brannvernforskrifter.
          </li>
        </ul>
      </section>
    </div>
  );
}
