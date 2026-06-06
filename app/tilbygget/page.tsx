import Plan2D from "@/components/Plan2D";
import DesignTabs from "@/components/DesignTabs";
import { tilbyggetInnvendig } from "@/lib/bygg";

export default function TilbyggetPage() {
  const rom = tilbyggetInnvendig.rom ?? [];
  const totalAreal = rom
    .reduce((sum, r) => sum + r.bredde * r.dybde, 0)
    .toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{tilbyggetInnvendig.navn}</h1>
          <p className="mt-1 text-stone-600">
            {tilbyggetInnvendig.beskrivelse}. Totalt {totalAreal} m².
          </p>
        </div>
        <DesignTabs base="/tilbygget" active="2d" />
      </div>

      <Plan2D design={tilbyggetInnvendig} />

      <div className="grid gap-4 sm:grid-cols-3">
        {rom.map((r) => (
          <div
            key={r.navn}
            className="rounded-xl border border-stone-200 bg-white p-5"
          >
            <h2 className="font-semibold">{r.navn}</h2>
            <p className="mt-1 text-sm text-stone-600">
              {r.bredde} × {r.dybde} m — {(r.bredde * r.dybde).toFixed(2)} m²
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
