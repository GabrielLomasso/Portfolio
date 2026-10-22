import { SpectrumHero } from "@/components/portfolio/SpectrumHero";
import { PROJECTS } from "@/data/projects";

export default function App() {
  return (
    <main>
      <SpectrumHero projects={PROJECTS} />
      <footer className="flex flex-col items-center justify-between gap-2 border-t border-line px-6 py-10 font-mono text-[11px] uppercase tracking-[0.2em] text-muted sm:flex-row">
        <span>Gabriel Fajardo</span>
        <span>Belo Horizonte · {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
