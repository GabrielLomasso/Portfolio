import { lazy, Suspense } from "react";
import { SpectrumHero } from "@/components/portfolio/SpectrumHero";
import { CommandPalette } from "@/components/sections/CommandPalette";
import { PrismEasterEgg } from "@/components/sections/PrismEasterEgg";
import { ScrollProgress } from "@/components/sections/ScrollProgress";
import { PROJECTS } from "@/data/projects";

const VISIBLE_PROJECTS = PROJECTS.filter((p) => !p.hidden);

// Seções abaixo do hero num pedaço separado: a abertura carrega primeiro
const NewSections = lazy(() => import("@/components/sections/NewSections"));

export default function App() {
  return (
    <main>
      <ScrollProgress />
      <CommandPalette />
      <PrismEasterEgg />
      <SpectrumHero projects={VISIBLE_PROJECTS} />
      <Suspense fallback={<div className="min-h-svh" aria-hidden />}>
        <NewSections />
      </Suspense>
      <footer className="flex flex-col items-center justify-between gap-2 border-t border-line px-6 py-10 font-mono text-[11px] uppercase tracking-[0.2em] text-muted sm:flex-row">
        <span>Gabriel Fajardo</span>
        <span>Belo Horizonte · {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
