import Plan2D from "@/components/Plan2D";
import DesignTabs from "@/components/DesignTabs";
import { design2 } from "@/lib/bygg";

export default function V2HomePage() {
  const [hytte, tilbygg] = design2.alleBygg;
  const arealHytte = hytte.bredde * hytte.dybde;
  const arealTilbygg = tilbygg.bredde * tilbygg.dybde;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{design2.navn}</h1>
          <p className="mt-1 text-stone-600">{design2.beskrivelse}.</p>
        </div>
        <DesignTabs base="/v2" active="2d" />
      </div>

      <Plan2D design={design2} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold">{hytte.navn}</h2>
          <p className="mt-1 text-sm text-stone-600">
            {hytte.bredde} × {hytte.dybde} m — {arealHytte} m² grunnflate
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold">{tilbygg.navn}</h2>
          <p className="mt-1 text-sm text-stone-600">
            {tilbygg.bredde} × {tilbygg.dybde} m — {arealTilbygg} m² grunnflate
          </p>
        </div>
      </div>
    </div>
  );
}
