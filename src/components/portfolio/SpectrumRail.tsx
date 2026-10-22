import type { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

interface SpectrumRailProps {
  projects: Project[];
  active: number;
  onSelect: (index: number) => void;
}

/** Trilho lateral: um traço por projeto, na cor dele. Mostra onde você está e leva direto a um projeto. */
export function SpectrumRail({ projects, active, onSelect }: SpectrumRailProps) {
  return (
    <nav aria-label="Projetos" className="absolute right-3 top-1/2 z-30 -translate-y-1/2 sm:right-6">
      <ul className="flex flex-col items-end gap-2.5">
        {projects.map((project, i) => {
          const isActive = i === active;
          return (
            <li key={project.slug}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={isActive ? "true" : undefined}
                className="group flex items-center gap-3 py-0.5"
              >
                <span
                  className={cn(
                    "hidden font-mono text-[10px] uppercase tracking-wider text-fg/0 transition-colors duration-300 group-hover:text-fg/80 group-focus-visible:text-fg/80 md:inline",
                    isActive && "text-fg/80",
                  )}
                >
                  {project.name}
                </span>
                <span
                  className={cn(
                    "block h-0.5 rounded-full transition-all duration-500",
                    isActive ? "w-8 opacity-100" : "w-3 opacity-40 group-hover:w-5 group-hover:opacity-80",
                  )}
                  style={{ background: `oklch(0.75 0.18 ${project.hue})` }}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
