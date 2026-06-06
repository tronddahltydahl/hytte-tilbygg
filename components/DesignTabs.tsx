import Link from "next/link";

type Base = "/" | "/v2" | "/tilbygget";

export default function DesignTabs({
  base,
  active,
}: {
  base: Base;
  active: "2d" | "3d";
}) {
  const href3d = base === "/" ? "/3d" : `${base}/3d`;
  const tabs = [
    { id: "2d" as const, label: "2D", href: base },
    { id: "3d" as const, label: "3D", href: href3d },
  ];
  return (
    <div className="inline-flex rounded-lg border border-stone-300 bg-stone-50 p-1">
      {tabs.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          className={
            t.id === active
              ? "rounded-md bg-white px-4 py-1.5 text-sm font-semibold text-stone-900 shadow-sm"
              : "rounded-md px-4 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900"
          }
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
