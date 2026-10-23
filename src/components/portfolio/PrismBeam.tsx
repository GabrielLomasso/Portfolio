import { motion, useAnimate, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useEffect } from "react";

// Faixas do espectro que saem do prisma, como na capa do Dark Side of the Moon (vermelho em cima).
const BANDS = [25, 55, 95, 145, 200, 255, 300];

/** Linha do tempo da abertura (segundos desde o carregamento). */
export const INTRO = {
  name: 1,
  triangle: 2.7,
  beam: 3.9,
  fan: 4.55,
  ui: 5.6,
} as const;

export interface PrismGeometry {
  /** Tamanho do palco em px */
  width: number;
  height: number;
  /** Centro do nome, onde fica o centro do triângulo */
  cx: number;
  cy: number;
  isMobile: boolean;
}

interface Point {
  x: number;
  y: number;
}

/** Vértices do triângulo. O nome fica no meio da altura (não no baricentro, que fica a 2/3 e deixa o nome baixo). */
export function prismShape({ width: W, height: H, cx, cy, isMobile }: PrismGeometry) {
  const side = Math.min(isMobile ? W * 0.86 : W * 0.56, (H * 0.8) / (Math.sqrt(3) / 2));
  const tall = (side * Math.sqrt(3)) / 2;
  return {
    side,
    tall,
    top: { x: cx, y: cy - tall / 2 },
    left: { x: cx - side / 2, y: cy + tall / 2 },
    right: { x: cx + side / 2, y: cy + tall / 2 },
  };
}

const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const pts = (...points: Point[]) => points.map((p) => `${p.x},${p.y}`).join(" ");

function hueDistance(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

interface BandProps {
  hue: number;
  points: string;
  /** Linha central da faixa, que vira o "núcleo" do neon */
  core: { x1: number; y1: number; x2: number; y2: number };
  currentHue: MotionValue<number>;
  focus: MotionValue<number>;
}

function Band({ hue, points, core, currentHue, focus }: BandProps) {
  // No hero todas as faixas aparecem; com um projeto em foco, só a faixa da cor dele continua acesa.
  const opacity = useTransform([currentHue, focus], ([h, f]: number[]) => {
    const near = Math.exp(-((hueDistance(h, hue) / 38) ** 2));
    return (1 - f) * 0.9 + f * (0.08 + near * 0.92);
  });

  // Neon como o feixe branco: brilho desfocado por fora, a faixa e um núcleo fino e claro no meio
  return (
    <motion.g style={{ opacity }}>
      <polygon points={points} fill={`url(#band-${hue})`} filter="url(#band-glow)" opacity={0.8} />
      <polygon points={points} fill={`url(#band-${hue})`} />
      <line {...core} stroke={`url(#band-core-${hue})`} strokeWidth={1.4} strokeLinecap="round" />
    </motion.g>
  );
}

interface PrismBeamProps {
  geometry: PrismGeometry;
  currentHue: MotionValue<number>;
  focus: MotionValue<number>;
  animateIn: boolean;
  /** Projeto em foco (-1 no hero). Cada troca dispara o glitch do triângulo. */
  pulse: number;
}

/** Triângulo de vidro atrás do nome: o feixe branco entra pela face esquerda e sai em espectro pela direita. */
export function PrismBeam({ geometry, currentHue, focus, animateIn, pulse }: PrismBeamProps) {
  const beamOpacity = useTransform(focus, [0, 1], [1, 0.35]);
  const prismOpacity = useTransform(focus, [0, 1], [1, 0.7]);
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate<SVGGElement>();

  // Glitch na troca de projeto: o triângulo perde o sinal e aparecem fantasmas vermelho/ciano deslocados.
  useEffect(() => {
    if (pulse < 0 || reduce || !scope.current) return;
    animate(scope.current, { opacity: [1, 0.15, 1, 0.45, 0.1, 1, 0.75, 1], x: [0, -6, 5, 0, 7, -3, 0, 0] }, { duration: 0.65, ease: "linear" });
    scope.current.querySelectorAll<SVGPathElement>(".prism-ghost").forEach((ghost, i) => {
      const dir = i === 0 ? -1 : 1;
      animate(ghost, { opacity: [0, 0.9, 0.1, 0.8, 0], x: [0, dir * 9, dir * 3, dir * 12, 0] }, { duration: 0.5, delay: 0.04 * i, ease: "linear" });
    });
  }, [pulse, reduce, animate, scope]);

  const { width: W, height: H } = geometry;
  const { top, left, right } = prismShape(geometry);

  const entry = lerp(left, top, 0.55);
  const beamStart = { x: 0, y: entry.y + entry.x * 0.16 };

  // Cada faixa nasce num trecho curto da face direita e abre até a borda da tela.
  const bandStep = 0.009;
  const bandSpread = 0.075;
  const bands = BANDS.map((hue, j) => {
    const a = lerp(right, top, 0.5 - j * bandStep);
    const b = lerp(right, top, 0.5 - (j + 1) * bandStep);
    const exitTop = { x: W, y: a.y + (W - a.x) * (0.1 + j * bandSpread) };
    const exitBottom = { x: W, y: b.y + (W - b.x) * (0.1 + (j + 1) * bandSpread) };
    const core = { x1: (a.x + b.x) / 2, y1: (a.y + b.y) / 2, x2: W, y2: (exitTop.y + exitBottom.y) / 2 };
    return { hue, points: pts(a, b, exitBottom, exitTop), core };
  });
  const exitTop = lerp(right, top, 0.5);
  const exitBottom = lerp(right, top, 0.5 - BANDS.length * bandStep);

  const triangle = `M${top.x} ${top.y} L${right.x} ${right.y} L${left.x} ${left.y} Z`;
  // A revelação começa à esquerda de todas as faixas: a face é inclinada, e começar no ponto
  // mais à direita cortava o início das faixas numa linha vertical em vez de seguir a face.
  const fanX = Math.min(exitTop.x, exitBottom.x) - 2;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        {BANDS.map((hue) => (
          <linearGradient key={hue} id={`band-${hue}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={`oklch(0.8 0.2 ${hue})`} stopOpacity="0.95" />
            <stop offset="100%" stopColor={`oklch(0.6 0.2 ${hue})`} stopOpacity="0.15" />
          </linearGradient>
        ))}
        <linearGradient id="beam-in" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="prism-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.01" />
        </linearGradient>
        {BANDS.map((hue) => (
          <linearGradient key={hue} id={`band-core-${hue}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={`oklch(0.97 0.08 ${hue})`} stopOpacity="1" />
            <stop offset="60%" stopColor={`oklch(0.92 0.12 ${hue})`} stopOpacity="0.55" />
            <stop offset="100%" stopColor={`oklch(0.9 0.12 ${hue})`} stopOpacity="0" />
          </linearGradient>
        ))}
        <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="band-glow" x="-10%" y="-60%" width="120%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <clipPath id="beam-reveal">
          <motion.rect
            x="0"
            y="0"
            height={H}
            initial={{ width: animateIn ? 0 : entry.x }}
            animate={{ width: entry.x }}
            transition={{ duration: 0.65, delay: INTRO.beam, ease: [0.55, 0, 0.9, 0.6] }}
          />
        </clipPath>
        <clipPath id="fan-reveal">
          <motion.rect
            x={fanX}
            y="0"
            height={H}
            initial={{ width: animateIn ? 0 : W - fanX }}
            animate={{ width: W - fanX }}
            transition={{ duration: 1.2, delay: INTRO.fan, ease: [0.22, 1, 0.36, 1] }}
          />
        </clipPath>
      </defs>

      {/* Triângulo: desenha o contorno, depois acende o vidro. Nos projetos vira neon na cor do projeto. */}
      <motion.g style={{ opacity: prismOpacity }}>
        <g ref={scope}>
          <g className={pulse >= 0 ? "prism-hum" : undefined}>
            <motion.path
              d={triangle}
              fill="url(#prism-fill)"
              initial={animateIn ? { fillOpacity: 0 } : false}
              animate={{ fillOpacity: 1 }}
              transition={{ duration: 1, delay: INTRO.triangle + 0.8 }}
            />
            <motion.path
              d={triangle}
              fill="none"
              style={{ stroke: "oklch(0.85 var(--c, 0) var(--h, 0))" }}
              strokeOpacity={0.55}
              strokeWidth={7}
              strokeLinejoin="round"
              filter="url(#soft-glow)"
              initial={animateIn ? { pathLength: 0 } : false}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.3, delay: INTRO.triangle, ease: [0.65, 0, 0.35, 1] }}
            />
            <motion.path
              d={triangle}
              fill="none"
              style={{ stroke: "oklch(0.95 calc(var(--c, 0) * 0.6) var(--h, 0))" }}
              strokeOpacity={0.95}
              strokeWidth={1.5}
              strokeLinejoin="round"
              initial={animateIn ? { pathLength: 0 } : false}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.3, delay: INTRO.triangle, ease: [0.65, 0, 0.35, 1] }}
            />
          </g>
          <path className="prism-ghost" d={triangle} fill="none" stroke="oklch(0.66 0.25 25)" strokeWidth={1.5} strokeLinejoin="round" opacity={0} />
          <path className="prism-ghost" d={triangle} fill="none" stroke="oklch(0.78 0.16 210)" strokeWidth={1.5} strokeLinejoin="round" opacity={0} />
        </g>
      </motion.g>

      {/* Feixe branco até a face esquerda */}
      <motion.g style={{ opacity: beamOpacity }} clipPath="url(#beam-reveal)">
        <line x1={beamStart.x} y1={beamStart.y} x2={entry.x} y2={entry.y} stroke="url(#beam-in)" strokeWidth={7} filter="url(#soft-glow)" opacity={0.5} />
        <line x1={beamStart.x} y1={beamStart.y} x2={entry.x} y2={entry.y} stroke="url(#beam-in)" strokeWidth={2} />
      </motion.g>

      {/* Luz atravessando o vidro */}
      <motion.polygon
        points={pts(lerp(left, top, 0.545), lerp(left, top, 0.555), exitTop, exitBottom)}
        fill="#fff"
        style={{ opacity: beamOpacity }}
        initial={animateIn ? { fillOpacity: 0 } : false}
        animate={{ fillOpacity: 0.22 }}
        transition={{ duration: 0.35, delay: INTRO.beam + 0.6 }}
      />

      {/* Espectro saindo pela face direita */}
      <g clipPath="url(#fan-reveal)">
        {bands.map((band) => (
          <Band key={band.hue} hue={band.hue} points={band.points} core={band.core} currentHue={currentHue} focus={focus} />
        ))}
      </g>
    </svg>
  );
}
