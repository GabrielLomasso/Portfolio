import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from "react";

/*
 * O triângulo como uma lâmpada fluorescente velha, das que piscam nos corredores dos vaults
 * de Fallout. Como uma de verdade falha:
 * - o arco fica instável: o tubo pisca em quedas irregulares, cada vez mais longas;
 * - as pontas escurecem primeiro (o material dos eletrodos se deposita no vidro perto
 *   delas), então a luz recua dos vértices para o meio de cada aresta;
 * - os filamentos das pontas ficam alaranjados enquanto tentam reacender o arco, e esfriam
 *   por último, depois que o tubo já apagou.
 * Para acender é o caminho inverso: os filamentos esquentam, o arranque falha algumas vezes
 * e só então o tubo pega e firma.
 */

type Track = [time: number, value: number][];

interface Sequence {
  duration: number;
  glow: Track;
  /** Tamanho das pontas escuras, como fração do lado */
  ends: Track;
  ember: Track;
}

const DIE: Sequence = {
  duration: 3.4,
  glow: [
    [0, 1], [0.08, 1], [0.1, 0.55], [0.12, 1], [0.2, 0.9], [0.24, 1], [0.27, 0.2], [0.29, 0.95],
    [0.36, 0.7], [0.4, 0.08], [0.43, 0.85], [0.47, 0.05], [0.55, 0.05], [0.57, 0.6], [0.6, 0.02],
    [0.7, 0.02], [0.72, 0.3], [0.75, 0], [0.86, 0], [0.88, 0.12], [0.92, 0], [1, 0],
  ],
  ends: [[0, 0], [0.15, 0.06], [0.4, 0.16], [0.7, 0.28], [1, 0.35]],
  ember: [[0, 0], [0.25, 0.15], [0.45, 0.5], [0.6, 0.8], [0.8, 0.9], [0.92, 0.55], [1, 0]],
};

const IGNITE: Sequence = {
  duration: 2.4,
  glow: [
    [0, 0], [0.18, 0], [0.2, 0.55], [0.22, 0], [0.34, 0], [0.36, 0.8], [0.39, 0.1], [0.42, 0],
    [0.5, 0], [0.52, 1], [0.55, 0.35], [0.58, 0.9], [0.62, 0.5], [0.66, 1], [0.72, 0.8], [0.78, 1], [1, 1],
  ],
  ends: [[0, 0.35], [0.36, 0.35], [0.52, 0.2], [0.7, 0.08], [1, 0]],
  ember: [[0, 0], [0.12, 0.7], [0.3, 0.9], [0.6, 0.6], [0.85, 0.15], [1, 0]],
};

/** Tempo total (s) de cada transição, para quem precisa esperar a lâmpada. */
export const LAMP_TIMING = { die: DIE.duration, ignite: IGNITE.duration };

function play(value: ReturnType<typeof useMotionValue<number>>, track: Track, duration: number) {
  return animate(value, track.map(([, v]) => v), { duration, times: track.map(([t]) => t), ease: "linear" });
}

interface Point {
  x: number;
  y: number;
}

interface LampProps {
  lit: boolean;
  top: Point;
  left: Point;
  right: Point;
  side: number;
  /** Sem as falhas: troca de estado na hora (movimento reduzido) */
  instant?: boolean;
  /** Chamado quando a lâmpada termina de acender ou de apagar */
  onSettled?: (lit: boolean) => void;
  /** O tubo: contorno e vidro do triângulo */
  children: ReactNode;
}

export function Lamp({ lit, top, left, right, side, instant = false, onSettled, children }: LampProps) {
  const id = useId().replace(/:/g, "");
  const glow = useMotionValue(lit ? 1 : 0);
  const ends = useMotionValue(0);
  const ember = useMotionValue(0);

  const settled = useRef(onSettled);
  useLayoutEffect(() => {
    settled.current = onSettled;
  });

  // Só anima quando o estado muda; na montagem a lâmpada já começa como está
  const previous = useRef(lit);
  useEffect(() => {
    if (previous.current === lit) return;
    previous.current = lit;
    const sequence = lit ? IGNITE : DIE;
    if (instant) {
      glow.set(lit ? 1 : 0);
      ends.set(0);
      ember.set(0);
      settled.current?.(lit);
      return;
    }
    const controls = [
      play(glow, sequence.glow, sequence.duration),
      play(ends, sequence.ends, sequence.duration),
      play(ember, sequence.ember, sequence.duration),
    ];
    const done = window.setTimeout(() => settled.current?.(lit), sequence.duration * 1000);
    return () => {
      controls.forEach((c) => c.stop());
      window.clearTimeout(done);
    };
  }, [lit, instant, glow, ends, ember]);

  // Pontas escuras: um traço preto centrado em cada vértice, do tamanho de `ends`
  const dash = useTransform(ends, (e) => `${e * side} ${side - e * side}`);
  const dashOffset = useTransform(ends, (e) => (e * side) / 2);

  const path = `M${top.x} ${top.y} L${right.x} ${right.y} L${left.x} ${left.y} Z`;
  const box = { x: left.x - side, y: top.y - side, width: side * 3, height: side * 3 };

  return (
    <>
      <defs>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={side * 0.03} />
        </filter>
        <mask id={`${id}-ends`} maskUnits="userSpaceOnUse" {...box}>
          <rect {...box} fill="#fff" />
          <motion.path
            d={path}
            fill="none"
            stroke="#000"
            strokeWidth={side * 0.09}
            filter={`url(#${id}-soft)`}
            style={{ strokeDasharray: dash, strokeDashoffset: dashOffset }}
          />
        </mask>
        <radialGradient id={`${id}-ember`}>
          <stop offset="0%" stopColor="oklch(0.85 0.16 65)" stopOpacity="0.95" />
          <stop offset="35%" stopColor="oklch(0.65 0.19 45)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.4 0.15 35)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.g style={{ opacity: glow }} mask={`url(#${id}-ends)`}>
        {children}
      </motion.g>
      <motion.g style={{ opacity: ember }}>
        {[top, left, right].map((v, i) => (
          <circle key={i} cx={v.x} cy={v.y} r={side * 0.07} fill={`url(#${id}-ember)`} />
        ))}
      </motion.g>
    </>
  );
}
