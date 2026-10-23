import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/data/projects";
import { ABOUT } from "@/data/about";
import { PROJECT_DETAILS } from "@/data/project-details";
import { Lamp } from "./Lamp";
import { prismShape, type PrismGeometry } from "./PrismBeam";
import { ProjectCard } from "./ProjectCard";

export type ExploreMode = "about" | "projects";

const EASE = [0.65, 0, 0.35, 1] as const;
const MONO = "font-mono text-[10px] uppercase tracking-[0.3em] sm:text-[11px]";

interface Point {
  x: number;
  y: number;
}

const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const quad = (a: Point, b: Point, c: Point, d: Point) => `M${a.x} ${a.y} L${b.x} ${b.y} L${c.x} ${c.y} L${d.x} ${d.y} Z`;

/* ------------------------------------------------------------------ */
/* Botões que aparecem quando o triângulo apaga no fim do hero         */
/* ------------------------------------------------------------------ */

interface ChoiceButtonsProps {
  visible: boolean;
  onPick: (mode: ExploreMode) => void;
}

export function ChoiceButtons({ visible, onPick }: ChoiceButtonsProps) {
  const options: { mode: ExploreMode; label: string }[] = [
    { mode: "about", label: "Quem sou eu?" },
    { mode: "projects", label: "Meus projetos" },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="choice"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center"
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Escolha um lado</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted sm:text-base">
              Conheça quem está por trás do prisma ou veja o que já passou por ele.
            </p>
          </motion.div>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
            {options.map((option, i) => (
              <motion.button
                key={option.mode}
                type="button"
                onClick={() => onPick(option.mode)}
                // Acende como um terminal velho: falha uma vez antes de firmar
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0.1, 0.6, 0.2, 1] }}
                transition={{ duration: 0.45, delay: 0.1 + i * 0.12, times: [0, 0.15, 0.3, 0.5, 0.65, 1] }}
                className={`${MONO} w-56 border border-white/20 px-6 py-4 text-white/80 transition-[border-color,color,box-shadow] duration-300 hover:border-white/70 hover:text-white hover:shadow-[0_0_28px_rgb(255_255_255/0.18)]`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Tela cheia: o triângulo reacende e vai para um dos lados            */
/* ------------------------------------------------------------------ */

type Phase = "igniting" | "moving" | "shown" | "leaving";

interface ExploreOverlayProps {
  initialMode: ExploreMode;
  geometry: PrismGeometry;
  projects: Project[];
  onClose: () => void;
}

export function ExploreOverlay({ initialMode, geometry, projects, onClose }: ExploreOverlayProps) {
  const reduce = !!useReducedMotion();
  const [mode, setMode] = useState(initialMode);
  const [lit, setLit] = useState(false);
  const [phase, setPhase] = useState<Phase>("igniting");
  const [selected, setSelected] = useState<number | null>(null);
  // O raio branco e o arco-íris acendem na primeira vez e ficam ligados ao trocar de lado
  const [lightsOn, setLightsOn] = useState(false);
  const tx = useMotionValue(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const { width: W, height: H, cx, isMobile } = geometry;
  const shape = prismShape(geometry);
  const { side } = shape;

  // Quem sou eu: o centro do triângulo vai para a borda direita (metade fora da tela).
  // Meus projetos: vai para a borda esquerda.
  const targetX = useCallback(
    (m: ExploreMode) => (m === "about" ? W - cx + (isMobile ? side * 0.25 : 0) : -cx),
    [W, cx, isMobile, side],
  );

  const moveTo = useCallback(
    (m: ExploreMode) => {
      setPhase("moving");
      animate(tx, targetX(m), { duration: reduce ? 0 : 1.1, ease: EASE }).then(() => {
        setPhase("shown");
        setLightsOn(true);
      });
    },
    [tx, targetX, reduce],
  );

  // Abre com a lâmpada apagada (igual ao fim do hero) e manda acender
  useEffect(() => {
    const id = requestAnimationFrame(() => setLit(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Trava a rolagem da página enquanto a tela cheia está aberta
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    rootRef.current?.focus();
    return () => {
      html.style.overflow = previous;
    };
  }, []);

  const onLampSettled = (nowLit: boolean) => {
    if (nowLit && phase === "igniting") moveTo(mode);
    if (!nowLit) onClose();
  };

  const switchMode = (m: ExploreMode) => {
    if (phase !== "shown" || m === mode) return;
    setSelected(null);
    setMode(m);
    moveTo(m);
  };

  const close = () => {
    if (phase === "leaving") return;
    setSelected(null);
    setLightsOn(false);
    setPhase("leaving");
    // Volta para o meio e apaga de novo; ao apagar, a tela cheia fecha e os botões voltam
    animate(tx, 0, { duration: reduce ? 0 : 0.6, ease: EASE }).then(() => setLit(false));
  };

  const back = () => (selected !== null ? setSelected(null) : close());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const shown = phase === "shown";
  const other: ExploreMode = mode === "about" ? "projects" : "about";

  return createPortal(
    <div
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "about" ? "Quem sou eu" : "Meus projetos"}
      className="fixed inset-0 z-50 overflow-hidden bg-void outline-none"
    >
      <svg aria-hidden viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="x-prism-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.01" />
          </linearGradient>
          <filter id="x-soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/*
          O raio e o arco-íris andam junto com o triângulo. Os dois ficam sempre ligados: em
          "Quem sou eu" o arco-íris sai pela metade fora da tela, e em "Meus projetos" é o raio
          que entra por fora; ao trocar de lado, um aparece enquanto o outro sai.
          Cada um é desenhado na posição final da tela e deslocado para acompanhar `tx`.
        */}
        <motion.g style={{ x: tx }}>
          <g transform={`translate(${-targetX("projects")} 0)`}>
            <Spectrum
              geometry={geometry}
              projects={projects}
              visible={lightsOn}
              interactive={shown && mode === "projects"}
              selected={selected}
              onSelect={setSelected}
            />
          </g>
          <g transform={`translate(${-targetX("about")} 0)`}>
            <Beam geometry={geometry} visible={lightsOn} xShift={isMobile ? side * 0.25 : 0} />
          </g>
          <motion.g animate={{ opacity: selected !== null ? 0.12 : 1 }} transition={{ duration: 0.5 }}>
            <Lamp lit={lit} top={shape.top} left={shape.left} right={shape.right} side={side} instant={reduce} onSettled={onLampSettled}>
              <TriangleTube top={shape.top} left={shape.left} right={shape.right} />
            </Lamp>
          </motion.g>
        </motion.g>
      </svg>

      {/* Barra do topo */}
      <AnimatePresence>
        {shown && (
          <motion.div
            key="bar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7"
          >
            <button type="button" onClick={back} className={`${MONO} text-white/60 transition-colors hover:text-white`}>
              {selected !== null ? "Todas as cores" : "Voltar"}
            </button>
            <button type="button" onClick={() => switchMode(other)} className={`${MONO} text-white/60 transition-colors hover:text-white`}>
              {other === "about" ? "Quem sou eu?" : "Meus projetos"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{shown && mode === "about" && <AboutPanel key="about" />}</AnimatePresence>

      <AnimatePresence>
        {shown && mode === "projects" && selected === null && (
          <SpectrumLabels key="labels" geometry={geometry} projects={projects} onSelect={setSelected} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {shown && mode === "projects" && selected !== null && (
          <DetailView key={projects[selected].slug} projects={projects} index={selected} onSelect={setSelected} />
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/* Peças do SVG                                                        */
/* ------------------------------------------------------------------ */

function TriangleTube({ top, left, right }: { top: Point; left: Point; right: Point }) {
  const d = `M${top.x} ${top.y} L${right.x} ${right.y} L${left.x} ${left.y} Z`;
  return (
    <>
      <path d={d} fill="url(#x-prism-fill)" />
      <path d={d} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={7} strokeLinejoin="round" filter="url(#x-soft-glow)" />
      <path d={d} fill="none" stroke="#fff" strokeOpacity={0.95} strokeWidth={1.5} strokeLinejoin="round" />
    </>
  );
}

/** Quem sou eu: o feixe branco entra pela face esquerda e rasga o vidro até a borda da tela. */
interface BeamProps {
  geometry: PrismGeometry;
  visible: boolean;
  xShift: number;
}

/** O raio branco só vai até a face; dentro do vidro ele já é o leque de cores do arco-íris. */
function Beam({ geometry, visible, xShift }: BeamProps) {
  const { width: W, height: H } = geometry;
  const { top, left } = prismShape({ ...geometry, cx: W + xShift });
  const entry = lerp(left, top, 0.55);
  const start = { x: 0, y: entry.y + entry.x * 0.12 };

  return (
    <g>
      <defs>
        <linearGradient id="x-beam" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <clipPath id="x-beam-reveal">
          <motion.rect
            x={0}
            y={0}
            height={H}
            initial={{ width: 0 }}
            animate={{ width: visible ? entry.x : 0 }}
            transition={{ duration: visible ? 0.5 : 0.2, ease: [0.55, 0, 0.9, 0.6] }}
          />
        </clipPath>
      </defs>
      <g clipPath="url(#x-beam-reveal)">
        <line x1={start.x} y1={start.y} x2={entry.x} y2={entry.y} stroke="url(#x-beam)" strokeWidth={7} filter="url(#x-soft-glow)" opacity={0.5} />
        <line x1={start.x} y1={start.y} x2={entry.x} y2={entry.y} stroke="url(#x-beam)" strokeWidth={2} />
      </g>
    </g>
  );
}

/** Geometria do arco-íris dos projetos: cada cor sai de um trecho da face direita e abre até a borda. */
function spectrumBands(geometry: PrismGeometry, count: number) {
  const { width: W, height: H } = geometry;
  const { top, left, right } = prismShape({ ...geometry, cx: 0 });
  const span = 0.44 / count;
  const source = lerp(left, top, 0.55);
  return Array.from({ length: count }, (_, i) => {
    const a = lerp(right, top, 0.72 - i * span);
    const b = lerp(right, top, 0.72 - (i + 1) * span);
    const yTop = -H * 0.04 + (i * H * 1.08) / count;
    const yBottom = -H * 0.04 + ((i + 1) * H * 1.08) / count;
    return { a, b, source, yTop, yBottom, d: quad(a, { x: W, y: yTop }, { x: W, y: yBottom }, b) };
  });
}

interface SpectrumProps {
  geometry: PrismGeometry;
  projects: Project[];
  visible: boolean;
  /** Clicável só em "Meus projetos" */
  interactive: boolean;
  selected: number | null;
  onSelect: (index: number) => void;
}

/** Meus projetos: o arco-íris ocupa a tela; cada cor é um projeto e, ao escolher, cresce até cobrir tudo. */
function Spectrum({ geometry, projects, visible, interactive, selected, onSelect }: SpectrumProps) {
  const { width: W, height: H } = geometry;
  const [hovered, setHovered] = useState<number | null>(null);
  const bands = spectrumBands(geometry, projects.length);
  const full = quad({ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: 0, y: H });
  const fanX = Math.min(...bands.map((b) => Math.min(b.a.x, b.b.x))) - 2;

  const opacityOf = (i: number) => {
    if (selected !== null) return selected === i ? 0.3 : 0;
    if (interactive && hovered !== null) return hovered === i ? 1 : 0.4;
    return 0.85;
  };

  return (
    <g>
      <defs>
        {projects.map((p) => (
          <linearGradient key={p.slug} id={`x-band-${p.slug}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={`oklch(0.8 0.2 ${p.hue})`} stopOpacity="0.95" />
            <stop offset="100%" stopColor={`oklch(0.6 0.2 ${p.hue})`} stopOpacity="0.3" />
          </linearGradient>
        ))}
        <clipPath id="x-fan-reveal">
          <motion.rect
            y={0}
            height={H}
            initial={{ x: fanX, width: 0 }}
            animate={{ x: selected !== null ? 0 : fanX, width: visible ? W : 0 }}
            transition={{ duration: visible ? 1.2 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </clipPath>
      </defs>

      {/* Luz atravessando o vidro, da face escondida até cada trecho da face de saída */}
      <motion.g animate={{ opacity: visible && selected === null ? 1 : 0 }} transition={{ duration: 0.4 }}>
        {bands.map((band, i) => (
          <polygon
            key={projects[i].slug}
            points={`${band.source.x},${band.source.y} ${band.a.x},${band.a.y} ${band.b.x},${band.b.y}`}
            fill={`oklch(0.92 0.08 ${projects[i].hue} / 0.12)`}
          />
        ))}
      </motion.g>

      <g clipPath="url(#x-fan-reveal)">
        {bands.map((band, i) => (
          <motion.path
            key={projects[i].slug}
            fill={`url(#x-band-${projects[i].slug})`}
            initial={{ d: band.d }}
            animate={{ d: selected === i ? full : band.d, opacity: opacityOf(i) }}
            transition={{ d: { duration: 0.8, ease: EASE }, opacity: { duration: 0.4 } }}
            onPointerEnter={() => setHovered(i)}
            onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
            onClick={() => interactive && selected === null && onSelect(i)}
            className={interactive && selected === null ? "cursor-pointer" : undefined}
            style={{ pointerEvents: interactive && selected === null ? "auto" : "none" }}
          />
        ))}
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Conteúdo em HTML por cima do SVG                                    */
/* ------------------------------------------------------------------ */

function SpectrumLabels({ geometry, projects, onSelect }: { geometry: PrismGeometry; projects: Project[]; onSelect: (i: number) => void }) {
  const bands = spectrumBands(geometry, projects.length);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6, duration: 0.5 } }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
      <p className={`${MONO} pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 text-white/45 sm:top-8`}>Escolha uma cor</p>
      {projects.map((p, i) => {
        const band = bands[i];
        const y = Math.min(Math.max((band.yTop + band.yBottom) / 2, 100), geometry.height - 36);
        return (
          <button
            key={p.slug}
            type="button"
            onClick={() => onSelect(i)}
            className="absolute right-5 z-10 -translate-y-1/2 text-right sm:right-10"
            style={{ top: y }}
          >
            <span className={`${MONO} block text-white/70`}>{p.kind}</span>
            <span className="block text-lg font-semibold text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.6)] sm:text-2xl">{p.name}</span>
          </button>
        );
      })}
    </motion.div>
  );
}

function AboutPanel() {
  return (
    <motion.section
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.25 } }}
      className="absolute inset-y-0 left-0 z-10 flex w-full items-center overflow-y-auto px-6 py-24 sm:w-[52%] sm:pl-[7vw] sm:pr-10"
    >
      <div className="max-w-xl">
        <p className={`${MONO} text-white/45`}>Quem sou eu</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{ABOUT.name}</h2>
        <p className="mt-5 text-lg leading-relaxed text-white/85 sm:text-xl">{ABOUT.lead}</p>
        {ABOUT.body.map((paragraph) => (
          <p key={paragraph} className="mt-4 leading-relaxed text-muted">
            {paragraph}
          </p>
        ))}
        <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {ABOUT.facts.map((fact) => (
            <div key={fact.label} className="grid grid-cols-[7.5rem_1fr] gap-4 py-3 text-sm">
              <dt className={`${MONO} pt-0.5 text-white/40`}>{fact.label}</dt>
              <dd className="text-white/85">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex gap-5">
          {ABOUT.links.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className={`${MONO} text-white/70 underline-offset-4 hover:text-white hover:underline`}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function DetailView({ projects, index, onSelect }: { projects: Project[]; index: number; onSelect: (i: number) => void }) {
  const project = projects[index];
  const detail = PROJECT_DETAILS[project.slug];
  const accent = `oklch(0.86 0.14 ${project.hue})`;
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.55 } }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="absolute inset-0 z-10 overflow-y-auto"
    >
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-20 sm:px-10 sm:pt-24">
        <p className={`${MONO} text-white/55`}>
          {project.kind} · {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl" style={{ color: accent }}>
          {project.name}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">{project.description}</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="max-w-xl">
            <ProjectCard project={project} active />
          </div>
          {detail && (
            <div>
              <Section title="O que é">
                <p className="leading-relaxed text-white/80">{detail.about}</p>
              </Section>
              <Section title="Cliente">
                <p className="text-white/80">{detail.client}</p>
              </Section>
              <Section title="Situação">
                <p className="text-white/80">{detail.status}</p>
              </Section>
            </div>
          )}
        </div>

        {detail && (
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            <Section title="A dor do cliente" className="">
              <List items={detail.pains} accent={accent} />
            </Section>
            <Section title="Como resolvemos" className="">
              <List items={detail.solutions} accent={accent} />
            </Section>
          </div>
        )}

        {detail && (
          <Section title="Com o que foi feito" className="mt-12">
            <ul className="flex flex-wrap gap-2">
              {detail.stack.map((tech) => (
                <li key={tech} className="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] text-white/75">
                  {tech}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <nav className="mt-16 flex justify-between gap-6 border-t border-white/10 pt-6">
          <button type="button" onClick={() => onSelect((index - 1 + projects.length) % projects.length)} className="text-left">
            <span className={`${MONO} block text-white/40`}>Cor anterior</span>
            <span className="mt-1 block font-semibold" style={{ color: `oklch(0.82 0.14 ${prev.hue})` }}>
              {prev.name}
            </span>
          </button>
          <button type="button" onClick={() => onSelect((index + 1) % projects.length)} className="text-right">
            <span className={`${MONO} block text-white/40`}>Próxima cor</span>
            <span className="mt-1 block font-semibold" style={{ color: `oklch(0.82 0.14 ${next.hue})` }}>
              {next.name}
            </span>
          </button>
        </nav>
      </div>
    </motion.article>
  );
}

function Section({ title, className = "mt-8 first:mt-0", children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={className}>
      <h3 className={`${MONO} mb-3 text-white/45`}>{title}</h3>
      {children}
    </section>
  );
}

function List({ items, accent }: { items: string[]; accent: string }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="grid grid-cols-[0.75rem_1fr] gap-3 leading-relaxed text-white/80">
          <span aria-hidden className="mt-[0.6em] h-px w-3" style={{ background: accent }} />
          {item}
        </li>
      ))}
    </ul>
  );
}
