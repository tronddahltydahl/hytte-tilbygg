import dynamic from "next/dynamic";

// Last 3D-komponenten på klientsiden (Three.js krever browser-API)
const Reisverk3D = dynamic(() => import("@/components/Reisverk3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[75vh] items-center justify-center rounded-xl border border-stone-300 bg-stone-50 text-stone-500">
      Laster 3D-modell…
    </div>
  ),
});

export default function ReisverkPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Reisverk 3D</h1>
        <p className="mt-1 text-stone-600">
          Bærekonstruksjonen alene — uten paneler, isolasjon eller taktekking.
          Drei (venstreklikk-dra), zoom (scroll) og pan (høyreklikk-dra) for
          å se reisverket fra alle vinkler.
        </p>
      </header>

      <Reisverk3D />

      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold text-stone-800">
          Dimensjoner i reisverket
        </h2>
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div className="rounded-md border border-stone-100 bg-stone-50 p-3">
            <h3 className="font-semibold text-stone-700">Gulv</h3>
            <ul className="mt-1 space-y-0.5 text-stone-600">
              <li><strong>Svill</strong> — 48×198 C24 (impregnert i bunn)</li>
              <li><strong>Gulvbjelker</strong> — 48×198 C24 c/c 600</li>
              <li>198 mm gir plass til 200 mm iso uten klem</li>
            </ul>
          </div>
          <div className="rounded-md border border-stone-100 bg-stone-50 p-3">
            <h3 className="font-semibold text-stone-700">Vegger</h3>
            <ul className="mt-1 space-y-0.5 text-stone-600">
              <li><strong>Stender</strong> — 48×98 C24 c/c 600</li>
              <li><strong>Topp- og bunnsvill</strong> — 48×98</li>
              <li>Bare 3 nye yttervegger — venstre gavl er hyttas vegg</li>
            </ul>
          </div>
          <div className="rounded-md border border-stone-100 bg-stone-50 p-3">
            <h3 className="font-semibold text-stone-700">Takstoler</h3>
            <ul className="mt-1 space-y-0.5 text-stone-600">
              <li><strong>Sperrer</strong> — 48×148 C24 (bærer snølast)</li>
              <li><strong>Bindebjelke = himlingsbjelke</strong> — 48×198 C24</li>
              <li><strong>Hanebjelke</strong> — 48×98 C24</li>
              <li>10 takstoler c/c 600 mm</li>
            </ul>
          </div>
          <div className="rounded-md border border-stone-100 bg-stone-50 p-3">
            <h3 className="font-semibold text-stone-700">Møne og fundament</h3>
            <ul className="mt-1 space-y-0.5 text-stone-600">
              <li><strong>Mønebjelke</strong> — 48×148 C24 (gjennomgående)</li>
              <li><strong>Betongpilarer</strong> — Ø250 mm, 8 stk</li>
              <li>Ventilert kryperom ca 40 cm høyt</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <h2 className="mb-2 text-lg font-semibold">Hva betyr fargene?</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Lys brun</strong> — konstruksjonsvirke C24 (stendere, svill, sperrer, mønebjelke)</li>
          <li><strong>Mørk brun</strong> — bindebjelker (bunnen av takstolene)</li>
          <li><strong>Grå sylindere</strong> — 8 betongpilarer i fundament</li>
          <li><strong>Mørk grå flate</strong> — hyttas eksisterende yttervegg (markering, ikke en del av tilbygget)</li>
        </ul>
      </section>
    </div>
  );
}
