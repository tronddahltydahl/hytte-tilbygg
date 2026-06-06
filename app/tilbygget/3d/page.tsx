import Link from "next/link";
import Modell3D from "@/components/Modell3D";
import DesignTabs from "@/components/DesignTabs";
import { tilbyggetInnvendig } from "@/lib/bygg";

export default function TilbyggetTreDPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{tilbyggetInnvendig.navn}</h1>
          <p className="mt-1 text-stone-600">
            Taket er skjult som standard så du kan se ned i rommene. Klikk
            knappen i hjørnet for å vise det igjen. Dra for å rotere, rull
            for å zoome.
          </p>
          <Link
            href="/tilbygget/utsikt"
            className="mt-2 inline-block text-sm font-medium text-amber-800 hover:underline"
          >
            → Se utsikten fra øvre badstubenk
          </Link>
        </div>
        <DesignTabs base="/tilbygget" active="3d" />
      </div>
      <Modell3D
        design={tilbyggetInnvendig}
        initialVisTak={false}
        cameraConfig={{
          position: [3, 7, 6],
          target: [2.7, 0, 1.35],
        }}
      />
    </div>
  );
}
