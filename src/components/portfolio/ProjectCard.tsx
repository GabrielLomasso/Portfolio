import type { CSSProperties } from "react";
import type { PreviewVariant, Project } from "@/data/projects";
import { cn } from "@/lib/utils";

// Tons derivados do matiz do projeto (--ph). Mantém os mocks coerentes com a cor que o nome assume.
const tint = (l: number, c: number, a = 1) => `oklch(${l} ${c} var(--ph) / ${a})`;

function Bar({ w, className, style }: { w: string; className?: string; style?: CSSProperties }) {
  return <div className={cn("h-1.5 rounded-full bg-white/15", className)} style={{ width: w, ...style }} />;
}

function MockApp() {
  return (
    <div className="flex h-full items-center justify-center gap-[6%] px-[10%]">
      <div className="h-[88%] aspect-[9/17] rounded-[14%/7%] border border-white/15 bg-black/60 p-[5%]">
        <div className="mb-[10%] h-[18%] rounded-md" style={{ background: tint(0.62, 0.17) }} />
        {[0.8, 0.6, 0.7, 0.5].map((w, i) => (
          <div key={i} className="mb-[8%] flex items-center gap-1">
            <div className="size-2 shrink-0 rounded-full" style={{ background: tint(0.75, 0.14, 0.8) }} />
            <Bar w={`${w * 100}%`} className="h-1" />
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Bar w="70%" className="h-2.5 bg-white/30" />
        <Bar w="90%" />
        <Bar w="55%" />
        <div className="mt-2 h-4 w-16 rounded-full" style={{ background: tint(0.7, 0.17) }} />
      </div>
    </div>
  );
}

function MockLanding() {
  return (
    <div className="flex h-full flex-col p-[6%]">
      <div className="flex items-center justify-between">
        <div className="h-2 w-10 rounded-full bg-white/40" />
        <div className="flex gap-1.5">
          <Bar w="18px" /> <Bar w="18px" /> <Bar w="18px" />
        </div>
      </div>
      <div className="mt-[8%] grid flex-1 grid-cols-[1.1fr_1fr] gap-[6%]">
        <div className="flex flex-col justify-center gap-2">
          <Bar w="95%" className="h-3 bg-white/40" />
          <Bar w="70%" className="h-3 bg-white/40" />
          <Bar w="85%" className="mt-1" />
          <div className="mt-2 h-4 w-20 rounded-full" style={{ background: tint(0.7, 0.17) }} />
        </div>
        <div
          className="rounded-lg"
          style={{ background: `linear-gradient(150deg, ${tint(0.66, 0.16)}, ${tint(0.3, 0.1)})` }}
        />
      </div>
    </div>
  );
}

function MockDashboard() {
  return (
    <div className="grid h-full grid-cols-[18%_1fr] gap-[4%] p-[5%]">
      <div className="flex flex-col gap-2 rounded-md bg-white/5 p-2">
        <div className="mb-1 size-3 rounded" style={{ background: tint(0.7, 0.17) }} />
        <Bar w="90%" /> <Bar w="70%" /> <Bar w="80%" />
      </div>
      <div className="flex flex-col gap-[6%]">
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-md bg-white/5 p-1.5">
              <Bar w="50%" className="h-1" />
              <div className="mt-1.5 h-2 w-3/4 rounded-full" style={{ background: tint(0.78, 0.14, i === 0 ? 1 : 0.5) }} />
            </div>
          ))}
        </div>
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="flex-1 rounded-md bg-white/5">
          <path d="M0 32 L14 26 L28 29 L42 18 L56 21 L70 10 L84 14 L100 4 L100 40 L0 40Z" style={{ fill: tint(0.7, 0.16, 0.25) }} />
          <path d="M0 32 L14 26 L28 29 L42 18 L56 21 L70 10 L84 14 L100 4" fill="none" strokeWidth="1.2" vectorEffect="non-scaling-stroke" style={{ stroke: tint(0.8, 0.16) }} />
        </svg>
      </div>
    </div>
  );
}

function MockCatalog() {
  return (
    <div className="flex h-full flex-col gap-[5%] p-[5%]">
      <div className="flex items-center gap-2">
        <div className="h-4 flex-1 rounded-full bg-white/10" />
        <div className="h-4 w-10 rounded-full" style={{ background: tint(0.7, 0.17) }} />
      </div>
      <div className="grid flex-1 grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-md bg-white/5">
            <div className="flex-1" style={{ background: tint(0.35 + (i % 3) * 0.08, 0.09) }} />
            <div className="p-1">
              <Bar w="70%" className="h-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockTable() {
  return (
    <div className="flex h-full flex-col p-[5%]">
      <div className="mb-[5%] flex items-center justify-between">
        <Bar w="30%" className="h-2.5 bg-white/30" />
        <div className="h-4 w-14 rounded-md" style={{ background: tint(0.7, 0.17) }} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden rounded-md border border-white/10">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("flex flex-1 items-center gap-3 px-2", i === 0 ? "bg-white/8" : "border-t border-white/5")}>
            <Bar w="28%" className="h-1" />
            <Bar w="18%" className="h-1" />
            <div className="ml-auto h-2 w-8 rounded-full" style={{ background: tint(0.75, 0.15, i % 2 ? 0.45 : 0.9) }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MockGrid() {
  return (
    <div className="flex h-full flex-col gap-[5%] p-[5%]">
      <div className="flex gap-1.5">
        <div className="h-3 w-12 rounded-full" style={{ background: tint(0.7, 0.17) }} />
        <div className="h-3 w-12 rounded-full bg-white/10" />
        <div className="h-3 w-12 rounded-full bg-white/10" />
      </div>
      <div className="grid flex-1 grid-cols-4 gap-1.5">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="rounded-md border border-white/10 p-1"
            style={{ background: [1, 4, 6, 9, 10].includes(i) ? tint(0.5, 0.14, 0.7) : "rgb(255 255 255 / 0.04)" }}
          >
            <Bar w="60%" className="h-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

const MOCKS: Record<PreviewVariant, () => React.JSX.Element> = {
  app: MockApp,
  landing: MockLanding,
  dashboard: MockDashboard,
  catalog: MockCatalog,
  table: MockTable,
  grid: MockGrid,
};

export function ProjectCard({ project, active = false }: { project: Project; active?: boolean }) {
  const Mock = MOCKS[project.preview];

  return (
    <article
      className="group relative rounded-xl bg-ink shadow-2xl shadow-black ring-1 ring-white/10 transition-[box-shadow,transform] duration-500 hover:scale-[1.03]"
      style={{ "--ph": project.hue } as CSSProperties}
    >
      {/* Moldura de neon do projeto em foco; montar o elemento reinicia o acendimento */}
      {active && (
        <div
          aria-hidden
          className="neon-on pointer-events-none absolute -inset-px z-10 rounded-xl"
          style={{
            boxShadow: `0 0 0 1px ${tint(0.82, 0.17)}, 0 0 22px 2px ${tint(0.7, 0.2, 0.55)}, inset 0 0 18px ${tint(0.7, 0.2, 0.25)}`,
          }}
        />
      )}
      <div className="flex h-6 items-center gap-1.5 border-b border-white/5 px-2.5">
        <span className="size-1.5 rounded-full bg-white/20" />
        <span className="size-1.5 rounded-full bg-white/20" />
        <span className="size-1.5 rounded-full bg-white/20" />
        <span className="ml-2 truncate font-mono text-[9px] text-white/40">{project.slug}</span>
      </div>
      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{ background: `radial-gradient(120% 90% at 80% 0%, ${tint(0.3, 0.08)}, #0a0a0e 70%)` }}
      >
        {project.image ? (
          <img src={project.image} alt={`Tela do ${project.name}`} draggable={false} className="size-full object-cover object-top" />
        ) : (
          <Mock />
        )}
      </div>
      <div className="flex items-center justify-between gap-2 rounded-b-xl px-3 py-2">
        <span className="truncate text-xs font-medium text-fg">{project.name}</span>
        <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider" style={{ color: tint(0.8, 0.14) }}>
          {project.kind}
        </span>
      </div>
    </article>
  );
}
