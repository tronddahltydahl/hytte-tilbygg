import Link from "next/link";
import Modell3D from "@/components/Modell3D";
import { tilbyggetInnvendig } from "@/lib/bygg";

// Simulert utsikt fra øvre badstubenk gjennom badstuevinduet mot Jotunheimen.
//
// Geometri (alt i meter):
//   - Øvre benk: top y = 0.85 (z = 0 → 0.5, x = 2.2 → 4.20)
//   - Badstuevindu (front-vegg, z = 2.7): liggende 170×80, bunn 1.32, topp
//     2.12, x = 2.35 → 4.05 (midtstilt i badstuen, senter x = 3.2)
//   - Sittende øyenhøyde ~75 cm over benk → y ≈ 1.60 m
//   - Vi sitter litt tilbake på benken (z ≈ 0.30) og sentrert i vinduet
//     (x = 3.2)

const EYE_HEIGHT = 1.6;
const EYE_X = 3.2;
const EYE_Z = 0.3;

export default function UtsiktPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Utsikt fra øvre badstubenk</h1>
          <p className="mt-1 text-stone-600">
            Sittende på øvre benk ({EYE_HEIGHT.toFixed(2)} m øyenhøyde) — hytta
            ligger ca. 850 moh, og blikket retter seg mot Jotunheim-silhuetten
            ca. 20 mil (200 km) unna. Galdhøpiggen til venstre, Glittertind
            til høyre i synsfeltet.
          </p>
        </div>
        <Link
          href="/tilbygget/3d"
          className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          ← Tilbake til 3D
        </Link>
      </div>

      <Modell3D
        design={tilbyggetInnvendig}
        initialVisTak={false}
        visFjell
        visKontroller={false}
        visTakKnapp={false}
        cameraConfig={{
          position: [EYE_X, EYE_HEIGHT, EYE_Z],
          // Look horisontalt rett fram mot horisonten (z langt borte)
          target: [EYE_X, EYE_HEIGHT, 50],
          fov: 60,
        }}
      />

      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
        <p className="font-semibold text-stone-800">
          Vi finner riktig høyde sammen
        </p>
        <p className="mt-1">
          Si fra om øyenhøyden ({EYE_HEIGHT.toFixed(2)} m) virker for høy
          eller lav, eller om kameraet skal stå lenger bak/fram på benken.
          Vinduet går fra y = 0.32 til 2.12 m, så øyet ligger godt innenfor
          vindusåpningen.
        </p>
      </div>
    </div>
  );
}
