import { motion, useTransform, type MotionValue } from "framer-motion";

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

const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const pts = (...points: Point[]) => points.map((p) => `${p.x},${p.y}`).join(" ");

function hueDistance(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

interface BandProps {
  hue: number;
  points: string;
  currentHue: MotionValue<number>;
  focus: MotionValue<number>;
}

function Band({ hue, points, currentHue, focus }: BandProps) {
  // No hero todas as faixas aparecem; com um projeto em foco, só a faixa da cor dele continua acesa.
  const opacity = useTransform([currentHue, focus], ([h, f]: number[]) => {
    const near = Math.exp(-((hueDistance(h, hue) / 38) ** 2));
    return (1 - f) * 0.9 + f * (0.08 + near * 0.92);
  });

  return <motion.polygon points={points} fill={`url(#band-${hue})`} style={{ opacity }} />;
}

interface PrismBeamProps {
  geometry: PrismGeometry;
  currentHue: MotionValue<number>;
  focus: MotionValue<number>;
  animateIn: boolean;
}

/** Triângulo de vidro atrás do nome: o feixe branco entra pela face esquerda e sai em espectro pela direita. */
export function PrismBeam({ geometry, currentHue, focus, animateIn }: PrismBeamProps) {
  const beamOpacity = useTransform(focus, [0, 1], [1, 0.35]);
  const prismOpacity = useTransform(focus, [0, 1], [1, 0.4]);

  const { width: W, height: H, cx, cy, isMobile } = geometry;
  const side = Math.min(isMobile ? W * 0.68 : W * 0.46, H * 0.62);
  const tall = (side * Math.sqrt(3)) / 2;
  const top = { x: cx, y: cy - (2 * tall) / 3 };
  const left = { x: cx - side / 2, y: cy + tall / 3 };
  const right = { x: cx + side / 2, y: cy + tall / 3 };

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
    return { hue, points: pts(a, b, exitBottom, exitTop) };
  });
  const exitTop = lerp(right, top, 0.5);
  const exitBottom = lerp(right, top, 0.5 - BANDS.length * bandStep);

  const triangle = `M${top.x} ${top.y} L${right.x} ${right.y} L${left.x} ${left.y} Z`;
  const fanX = exitBottom.x - 2;

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
        <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
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

      {/* Triângulo: desenha o contorno, depois acende o vidro */}
      <motion.g style={{ opacity: prismOpacity }}>
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
          stroke="#fff"
          strokeOpacity={0.45}
          strokeWidth={6}
          strokeLinejoin="round"
          filter="url(#soft-glow)"
          initial={animateIn ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.3, delay: INTRO.triangle, ease: [0.65, 0, 0.35, 1] }}
        />
        <motion.path
          d={triangle}
          fill="none"
          stroke="#fff"
          strokeOpacity={0.9}
          strokeWidth={1.5}
          strokeLinejoin="round"
          initial={animateIn ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.3, delay: INTRO.triangle, ease: [0.65, 0, 0.35, 1] }}
        />
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
          <Band key={band.hue} hue={band.hue} points={band.points} currentHue={currentHue} focus={focus} />
        ))}
      </g>
    </svg>
  );
}
