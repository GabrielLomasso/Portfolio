import { motion, useTransform, type MotionValue } from "framer-motion";

// Faixas do espectro que saem do nome, como no prisma do Dark Side of the Moon.
const BANDS = [25, 55, 95, 145, 200, 255, 300];

function hueDistance(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function Band({ hue, index, currentHue, focus }: { hue: number; index: number; currentHue: MotionValue<number>; focus: MotionValue<number> }) {
  // No hero todas as faixas aparecem; com um projeto em foco, só a faixa da cor dele continua acesa.
  const opacity = useTransform([currentHue, focus], ([h, f]: number[]) => {
    const near = Math.exp(-((hueDistance(h, hue) / 38) ** 2));
    return (1 - f) * 0.9 + f * (0.08 + near * 0.92);
  });
  const y = 53 + index * 3.4;

  return (
    <motion.polygon
      points={`50,49.7 50,50.3 100,${y + 3.4} 100,${y}`}
      fill={`url(#band-${hue})`}
      style={{ opacity }}
    />
  );
}

interface PrismBeamProps {
  currentHue: MotionValue<number>;
  focus: MotionValue<number>;
  animateIn: boolean;
}

/** Feixe branco entra pela esquerda, atravessa o nome e sai aberto em espectro à direita. */
export function PrismBeam({ currentHue, focus, animateIn }: PrismBeamProps) {
  const beamOpacity = useTransform(focus, [0, 1], [1, 0.35]);

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        {BANDS.map((hue) => (
          <linearGradient key={hue} id={`band-${hue}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={`oklch(0.78 0.2 ${hue})`} stopOpacity="0.9" />
            <stop offset="100%" stopColor={`oklch(0.6 0.2 ${hue})`} stopOpacity="0" />
          </linearGradient>
        ))}
        <linearGradient id="beam-in" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <filter id="beam-glow" x="-10%" y="-200%" width="120%" height="500%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
        <clipPath id="beam-reveal">
          <motion.rect
            x="0"
            y="0"
            height="100"
            initial={{ width: animateIn ? 0 : 50 }}
            animate={{ width: 50 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
          />
        </clipPath>
        <clipPath id="fan-reveal">
          <motion.rect
            x="50"
            y="0"
            height="100"
            initial={{ width: animateIn ? 0 : 50 }}
            animate={{ width: 50 }}
            transition={{ duration: 1.1, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </clipPath>
      </defs>

      <motion.g style={{ opacity: beamOpacity }} clipPath="url(#beam-reveal)">
        <line
          x1="0" y1="43" x2="50" y2="50"
          stroke="url(#beam-in)"
          strokeWidth="6"
          vectorEffect="non-scaling-stroke"
          filter="url(#beam-glow)"
          opacity={0.35}
        />
        <line
          x1="0" y1="43" x2="50" y2="50"
          stroke="url(#beam-in)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </motion.g>

      <g clipPath="url(#fan-reveal)">
        {BANDS.map((hue, i) => (
          <Band key={hue} hue={hue} index={i} currentHue={currentHue} focus={focus} />
        ))}
      </g>
    </svg>
  );
}
