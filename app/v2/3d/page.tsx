import Modell3D from "@/components/Modell3D";
import DesignTabs from "@/components/DesignTabs";
import { design2 } from "@/lib/bygg";

export default function V2TreDPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{design2.navn}</h1>
          <p className="mt-1 text-stone-600">
            Dra for å rotere, rull for å zoome, høyreklikk-dra for å flytte.
          </p>
        </div>
        <DesignTabs base="/v2" active="3d" />
      </div>
      <Modell3D design={design2} />
    </div>
  );
}
