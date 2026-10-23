import { SpectrumHero } from "@/components/portfolio/SpectrumHero";
import { Contact } from "@/components/sections/Contact";
import { Lab } from "@/components/sections/Lab";
import { Manifesto } from "@/components/sections/Manifesto";
import { Process } from "@/components/sections/Process";
import { SkillSpectrum } from "@/components/sections/SkillSpectrum";
import { SystemPanel } from "@/components/sections/SystemPanel";
import { Tracklist } from "@/components/sections/Tracklist";
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
      <SystemPanel />
      <Tracklist />
      <Contact />
      <footer className="flex flex-col items-center justify-between gap-2 border-t border-line px-6 py-10 font-mono text-[11px] uppercase tracking-[0.2em] text-muted sm:flex-row">
        <span>Gabriel Fajardo</span>
        <span>Belo Horizonte · {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
