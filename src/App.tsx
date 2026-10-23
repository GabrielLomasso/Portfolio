import { SpectrumHero } from "@/components/portfolio/SpectrumHero";
import { Lab } from "@/components/sections/Lab";
import { Manifesto } from "@/components/sections/Manifesto";
import { Process } from "@/components/sections/Process";
import { SkillSpectrum } from "@/components/sections/SkillSpectrum";
import { PROJECTS } from "@/data/projects";

const VISIBLE_PROJECTS = PROJECTS.filter((p) => !p.hidden);

export default function App() {
  return (
    <main>
      <SpectrumHero projects={VISIBLE_PROJECTS} />
      <Manifesto />
      <SkillSpectrum />
      <Process />
      <Lab />
      <footer className="flex flex-col items-center justify-between gap-2 border-t border-line px-6 py-10 font-mono text-[11px] uppercase tracking-[0.2em] text-muted sm:flex-row">
        <span>Gabriel Fajardo</span>
        <span>Belo Horizonte · {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
