"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const designs = [
  {
    label: "Original",
    href: "/",
    matches: (p: string) => p === "/" || p === "/3d",
  },
  {
    label: "Tilbygg bakover",
    href: "/v2",
    matches: (p: string) => p.startsWith("/v2"),
  },
  {
    label: "Tilbygget innvendig",
    href: "/tilbygget",
    matches: (p: string) => p.startsWith("/tilbygget"),
  },
  {
    label: "Byggeplan",
    href: "/byggeplan",
    matches: (p: string) => p.startsWith("/byggeplan"),
  },
  {
    label: "Byggeoppskrift",
    href: "/oppskrift",
    matches: (p: string) => p.startsWith("/oppskrift"),
  },
  {
    label: "Byggetegninger",
    href: "/byggetegninger",
    matches: (p: string) => p.startsWith("/byggetegninger"),
  },
  {
    label: "Reisverk 3D",
    href: "/reisverk",
    matches: (p: string) => p.startsWith("/reisverk"),
  },
];

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  return (
    <header className="border-b border-stone-200 bg-white">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-xl font-bold text-stone-800">
          Hyttetilbygg
        </Link>
        <div className="flex flex-wrap gap-1">
          {designs.map((d) => {
            const active = d.matches(pathname);
            return (
              <Link
                key={d.href}
                href={d.href}
                className={
                  active
                    ? "rounded-md bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900"
                    : "rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }
              >
                {d.label}
              </Link>
            );
          })}
          <a
            href="/badstue-materialliste.xlsx"
            download
            className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          >
            Materialliste
          </a>
        </div>
      </nav>
    </header>
  );
}
