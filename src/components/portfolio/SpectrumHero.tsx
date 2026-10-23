import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MotionStyle } from "framer-motion";
import type { Project } from "@/data/projects";
import { GlassText } from "@/components/ui/glass-text";
import {
  PerspectiveTunnel,
  tunnelWindows,
  useCameraParallax,
  useTunnelStage,
} from "@/components/ui/perspective-tunnel";
import { Pyramid3D } from "./Pyramid3D";
import { INTRO, PrismBeam, prismShape, PYRAMID_PERSPECTIVE, type PrismGeometry } from "./PrismBeam";
import { ProjectCard } from "./ProjectCard";
import { SpectrumRail } from "./SpectrumRail";

// Trecho inicial do scroll só com o nome; depois disso os cards entram no túnel.
const TUNNEL_FROM = 0.06;
// O túnel termina aqui; o resto do scroll é o encerramento (a luz apaga, a pirâmide sai girando).
const TUNNEL_TO = 0.8;
const OUTRO_FROM = 0.81;
const CARD_SPAN = 0.3;
// Momento (dentro da janela de cada card) em que ele é o projeto em foco.
const PEAK = 0.6;
// Quanto de rolagem cada projeto ocupa.
const VH_PER_PROJECT = 80;

const EASE = [0.22, 1, 0.36, 1] as const;

export function SpectrumHero({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const stage = useTunnelStage();
  const pointer = useCameraParallax(!reduce);

  // A abertura é uma sequência; sempre começa do topo, mesmo recarregando no meio da página.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // O triângulo é centralizado no nome, então mede o nome (muda com fonte carregando e resize).
  const [geometry, setGeometry] = useState<PrismGeometry | null>(null);
  useLayoutEffect(() => {
    const stageEl = stageRef.current;
    const nameEl = nameRef.current;
    if (!stageEl || !nameEl) return;
    const measure = () => {
      const s = stageEl.getBoundingClientRect();
      const n = nameEl.getBoundingClientRect();
      setGeometry({
        width: s.width,
        height: s.height,
        cx: n.left - s.left + n.width / 2,
        cy: n.top - s.top + n.height / 2,
        isMobile: s.width < 768,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stageEl);
    observer.observe(nameEl);
    return () => observer.disconnect();
  }, []);

  const windows = useMemo(() => tunnelWindows(projects.length, TUNNEL_FROM, TUNNEL_TO, CARD_SPAN), [projects.length]);
  const peaks = useMemo(() => windows.map((w) => w.start + (w.end - w.start) * PEAK), [windows]);
  const step = peaks.length > 1 ? peaks[1] - peaks[0] : CARD_SPAN;

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 32, restDelta: 0.0001 });

  // Cor: começa sem croma (vidro incolor) e percorre o matiz de cada projeto no pico dele.
  const hue = useTransform(progress, peaks, projects.map((p) => p.hue));
  // Sem a luz, a cor também vai embora: o vidro volta a ser incolor no encerramento.
  const chroma = useTransform(progress, [0, TUNNEL_FROM, peaks[0], OUTRO_FROM, OUTRO_FROM + 0.05], [0, 0.03, 0.19, 0.19, 0]);
  // Antes do encerramento o espectro inteiro volta a acender (como no hero), para a luz
  // poder se apagar cor por cor de um jeito visível.
  const focus = useTransform(progress, [TUNNEL_FROM * 0.5, peaks[0], OUTRO_FROM - 0.02, OUTRO_FROM], [0, 1, 1, 0]);
  const outro = useTransform(progress, [OUTRO_FROM, 1], [0, 1]);

  // Quanto mais rápido o scroll, mais o vidro separa a luz nas bordas.
  const velocity = useVelocity(scrollYProgress);
  const rawDispersion = useTransform(velocity, (v) => (reduce ? 1 : 1.4 + Math.min(Math.abs(v) * 35, 12)));
  const dispersion = useSpring(rawDispersion, { stiffness: 220, damping: 26 });

  const mx = useTransform(pointer.x, (x) => `${50 + x * 30}%`);
  const my = useTransform(pointer.y, (y) => `${50 + y * 40}%`);

  const nameScale = useTransform(progress, [0, 1], [1, 1.06]);
  const introOpacity = useTransform(progress, [0, TUNNEL_FROM * 0.8], [1, 0]);
  const glowOpacity = useTransform([focus, outro], ([f, o]: number[]) => f * 0.55 * Math.max(0, 1 - o * 3));
  const scanOpacity = useTransform([focus, outro], ([f, o]: number[]) => f * 0.7 * Math.max(0, 1 - o * 3));
  const chromeOpacity = useTransform(outro, [0, 0.4], [1, 0]);

  // O nome some junto com a luz, voltando para as sombras como na abertura
  const nameOpacity = useTransform(outro, [0.18, 0.5], [1, 0]);
  const nameBlur = useTransform(outro, [0.18, 0.5], [0, 14]);
  const nameBrightness = useTransform(outro, [0.18, 0.5], [1, 0]);
  const nameFilter = useMotionTemplate`blur(${nameBlur}px) brightness(${nameBrightness})`;

  const [active, setActive] = useState(-1);
  useMotionValueEvent(progress, "change", (p) => {
    let next = -1;
    if (p >= peaks[0] - step * 0.6 && p < OUTRO_FROM) {
      next = peaks.reduce((best, peak, i) => (Math.abs(p - peak) < Math.abs(p - peaks[best]) ? i : best), 0);
    }
    setActive((prev) => (prev === next ? prev : next));
  });

  const scrollToProject = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const scrollable = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: section.offsetTop + peaks[index] * scrollable, behavior: reduce ? "auto" : "smooth" });
  };

  const sectionHeight = `${100 + VH_PER_PROJECT / step}svh`;
  const current = active >= 0 ? projects[active] : null;
  const shape = geometry ? prismShape(geometry) : null;
  const animateIn = !reduce;

  return (
    <section ref={sectionRef} style={{ height: sectionHeight }} className="relative">
      <motion.div
        ref={stageRef}
        className="sticky top-0 flex h-svh w-full items-center justify-center overflow-hidden"
        style={{
          perspective: stage.isMobile ? "900px" : "1200px",
          "--h": hue,
          "--c": chroma,
        } as never}
      >
        {/* Luz ambiente na cor do projeto em foco */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: glowOpacity,
            background:
              "radial-gradient(60% 50% at 50% 50%, oklch(0.55 var(--c) var(--h) / 0.55), transparent 70%)",
          }}
        />
        <motion.div style={{ opacity: chromeOpacity }} className="pointer-events-none absolute inset-0">
          <motion.div
            aria-hidden
            initial={animateIn ? { opacity: 0 } : false}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 2, delay: INTRO.ui }}
            className="absolute inset-0 [background-image:radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_65%_60%_at_50%_50%,#000_30%,transparent_100%)]"
          />
        </motion.div>

        {geometry && (
          <PrismBeam geometry={geometry} currentHue={hue} focus={focus} animateIn={animateIn} pulse={active} outro={outro} />
        )}
        {/* Perspectiva própria, mais distante que a do túnel: menos distorção, a pirâmide não "incha" ao girar */}
        {geometry && (
          <div className="pointer-events-none absolute inset-0" style={{ perspective: `${PYRAMID_PERSPECTIVE}px` }}>
            <Pyramid3D geometry={geometry} outro={outro} />
          </div>
        )}

        <motion.div style={{ opacity: chromeOpacity }} className="pointer-events-none absolute inset-x-0 top-6 z-30 sm:top-8">
          <motion.p
            initial={animateIn ? { opacity: 0, y: -6 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: INTRO.ui, ease: EASE }}
            className="text-center font-mono text-[10px] uppercase tracking-[0.35em] text-muted sm:text-xs"
          >
            Portfólio · Belo Horizonte
          </motion.p>
        </motion.div>

        <PerspectiveTunnel
          className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto"
          items={projects}
          windows={windows}
          progress={progress}
          pointer={pointer}
          stage={stage}
          getKey={(p) => p.slug}
          renderItem={(p, i) => <ProjectCard project={p} active={i === active} />}
        />

        {/* Luz cibernética: scanlines no túnel e, a cada troca de projeto, flash + barra de varredura */}
        <motion.div
          aria-hidden
          className="scanlines pointer-events-none absolute inset-0 z-10"
          style={{ opacity: scanOpacity }}
        />
        {active >= 0 && !reduce && (
          <motion.div key={active} aria-hidden className="pointer-events-none absolute inset-0 z-10">
            <motion.div
              className="absolute inset-0"
              style={{ background: `radial-gradient(70% 55% at 50% 50%, oklch(0.7 0.2 ${projects[active].hue} / 0.35), transparent 75%)` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.2, 0.8, 0] }}
              transition={{ duration: 0.7, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-x-0 h-px"
              style={{
                background: `oklch(0.85 0.18 ${projects[active].hue})`,
                boxShadow: `0 0 18px 3px oklch(0.75 0.2 ${projects[active].hue} / 0.8)`,
              }}
              initial={{ top: "0%", opacity: 0 }}
              animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.75, ease: [0.4, 0, 0.6, 1] }}
            />
          </motion.div>
        )}

        {/* Nome + legenda: fica por cima do túnel, como uma lente */}
        <div className="pointer-events-none relative z-20 flex flex-col items-center px-4 text-center">
          {/* Surge das sombras: sai do preto, desfocado, e ganha luz devagar */}
          <motion.div
            ref={nameRef}
            style={{ scale: nameScale }}
            initial={animateIn ? { opacity: 0, filter: "blur(18px) brightness(0)" } : false}
            animate={{ opacity: 1, filter: "blur(0px) brightness(1)" }}
            transition={{ duration: 2, delay: INTRO.name, ease: [0.33, 0, 0.2, 1] }}
          >
            <GlassText
              lines={["GABRIEL", "FAJARDO"]}
              dispersion={dispersion}
              cyber={focus}
              pulse={active}
              className="font-display text-[clamp(2.5rem,min(9.5vw,13svh),9rem)] font-black leading-[0.88]"
              style={{ "--mx": mx, "--my": my, opacity: nameOpacity, filter: nameFilter } as MotionStyle}
            />
          </motion.div>

        </div>

        {/* Legenda encostada na base do triângulo, por dentro. A caixa tem altura zero na linha da
            base e o texto cresce para cima; a largura é o que cabe no triângulo um pouco acima da base. */}
        {shape && geometry && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 text-center [text-shadow:0_1px_14px_rgb(0_0_0/0.95),0_0_4px_rgb(0_0_0/0.8)]"
            style={{
              left: geometry.cx,
              top: shape.left.y - (geometry.isMobile ? 12 : 22),
              width: Math.min(448, shape.side * (1 - 130 / shape.tall)),
            }}
          >
            <motion.div style={{ opacity: introOpacity }} className="absolute inset-x-0 bottom-0">
              <motion.p
                initial={animateIn ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: INTRO.ui + 0.2, ease: EASE }}
                className="text-xs text-muted sm:text-sm"
              >
                Sites e sistemas web, do protótipo ao ar.
              </motion.p>
            </motion.div>

            <AnimatePresence mode="wait">
              {current && (
                <motion.div
                  key={current.slug}
                  initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="absolute inset-x-0 bottom-0"
                  aria-live="polite"
                >
                  <p
                    className="font-mono text-[9px] uppercase tracking-[0.3em] sm:text-[11px]"
                    style={{ color: `oklch(0.8 0.15 ${current.hue})` }}
                  >
                    {current.kind} · {current.name}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <motion.div style={{ opacity: introOpacity }} className="pointer-events-none absolute bottom-8 z-20">
          <motion.div
            initial={animateIn ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: INTRO.ui + 0.6 }}
            className="flex flex-col items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted"
          >
            <span>Role para ver os projetos</span>
            <motion.span
              className="block h-8 w-px origin-top bg-gradient-to-b from-white/70 to-transparent"
              animate={reduce ? undefined : { scaleY: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {active >= 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SpectrumRail projects={projects} active={active} onSelect={scrollToProject} />
            </motion.div>
          )}
        </AnimatePresence>

        <div aria-hidden className="grain pointer-events-none absolute inset-0 z-40 opacity-[0.06] mix-blend-overlay" />
      </motion.div>
    </section>
  );
}
