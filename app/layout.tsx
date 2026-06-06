import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Hyttetilbygg",
  description: "Visualiser et tilbygg på hytta i 2D og 3D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb">
      <body>
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
        <footer className="mt-16 border-t border-stone-200 py-6 text-center text-sm text-stone-500">
          Visualiseringsverktøy — laget med Claude Code
        </footer>
      </body>
    </html>
  );
}
