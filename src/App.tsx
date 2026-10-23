import { SpectrumHero } from "@/components/portfolio/SpectrumHero";
import { PROJECTS } from "@/data/projects";

const VISIBLE_PROJECTS = PROJECTS.filter((p) => !p.hidden);

export default function App() {
  return (
    <main>
      <SpectrumHero projects={VISIBLE_PROJECTS} />
    </main>
  );
}
