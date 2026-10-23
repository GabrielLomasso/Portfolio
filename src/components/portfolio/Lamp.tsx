import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from "react";

/*
 * O triângulo como uma lâmpada fluorescente velha, das que piscam nos corredores dos vaults
 * de Fallout. Como uma de verdade falha:
 * - o arco fica instável: o tubo pisca em quedas irregulares, cada vez mais longas;
 * - as pontas escurecem primeiro (o material dos eletrodos se deposita no vidro perto
 *   delas), então a luz recua dos vértices para o meio de cada aresta.
 * Para acender é o caminho inverso: o arranque falha algumas vezes e só então o tubo pega e firma.
 */

type Track = [time: number, value: number][];

interface Sequence {
  duration: number;
  glow: Track;
  /** Tamanho das pontas escuras, como fração do lado */
  ends: Track;
}

/** Pontas escuras com a lâmpada morta */
const DEAD_ENDS = 0.35;

const DIE: Sequence = {
  duration: 2.2,
  glow: [
    [0, 1], [0.08, 1], [0.1, 0.55], [0.12, 1], [0.2, 0.9], [0.24, 1], [0.27, 0.2], [0.29, 0.95],
    [0.36, 0.7], [0.4, 0.08], [0.43, 0.85], [0.47, 0.05], [0.55, 0.05], [0.57, 0.6], [0.6, 0.02],
    [0.7, 0.02], [0.72, 0.3], [0.75, 0], [0.86, 0], [0.88, 0.12], [0.92, 0], [1, 0],
  ],
  ends: [[0, 0], [0.15, 0.06], [0.4, 0.16], [0.7, 0.28], [1, DEAD_ENDS]],
};

const IGNITE: Sequence = {
  duration: 2.4,
  glow: [
    [0, 0], [0.18, 0], [0.2, 0.55], [0.22, 0], [0.34, 0], [0.36, 0.8], [0.39, 0.1], [0.42, 0],
    [0.5, 0], [0.52, 1], [0.55, 0.35], [0.58, 0.9], [0.62, 0.5], [0.66, 1], [0.72, 0.8], [0.78, 1], [1, 1],
  ],
  ends: [[0, DEAD_ENDS], [0.36, DEAD_ENDS], [0.52, 0.2], [0.7, 0.08], [1, 0]],
};

function play(value: MotionValue<number>, track: Track, duration: number) {
  return animate(value, track.map(([, v]) => v), { duration, times: track.map(([t]) => t), ease: "linear" });
}

/**
 * Brilho de base conforme a lâmpada morre (0 = sã, 1 = morta). Na primeira parte ela quase
 * não perde brilho e só dá quedas; no fim fica apagada e só dá clarões cada vez mais fracos.
 */
const baseGlow = (e: number) => (e < 0.6 ? 1 - e * 0.5 : Math.max(0, 0.7 - (e - 0.6) * 1.75));

/**
 * Pisca de verdade, no tempo, com o estágio ditado por `decay`: parada no meio da rolagem,
 * a lâmpada continua falhando naquele estágio em vez de congelar num brilho.
 */
function useFlicker(decay: MotionValue<number> | undefined, glow: MotionValue<number>, ends: MotionValue<number>, steady: boolean) {
  useEffect(() => {
    if (!decay) return;
    let frame = 0;
    let last = performance.now();
    let eventEnd = 0;
    let eventLevel = 1;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const e = Math.min(1, Math.max(0, decay.get()));
      ends.set(e * DEAD_ENDS);
      const base = baseGlow(e);
      if (steady || e <= 0 || e >= 1) {
        glow.set(steady ? 1 - e : base);
      } else {
        // Falhas cada vez mais frequentes; antes do fim são quedas, depois são clarões
        if (now > eventEnd && Math.random() < (2 + e * 10) * dt) {
          eventEnd = now + (40 + Math.random() * 120) * (1 + e);
          eventLevel = e < 0.6 ? Math.random() * 0.3 : base + Math.random() * (1 - e) * 1.2;
        }
        glow.set(now < eventEnd ? eventLevel : base);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [decay, glow, ends, steady]);
}

interface Point {
  x: number;
  y: number;
}

interface LampProps {
  /** Acesa ou apagada; ao mudar, acende ou apaga com as falhas, no tempo */
  lit?: boolean;
  /** Em vez de `lit`: quanto a lâmpada já morreu (0 a 1), por exemplo ligado à rolagem */
  decay?: MotionValue<number>;
  top: Point;
  left: Point;
  right: Point;
  side: number;
  /** Sem as falhas: troca de estado na hora (movimento reduzido) */
  instant?: boolean;
  /** Chamado quando a lâmpada termina de acender ou de apagar (só com `lit`) */
  onSettled?: (lit: boolean) => void;
  /** O tubo: contorno e vidro do triângulo */
  children: ReactNode;
}

export function Lamp({ lit = true, decay, top, left, right, side, instant = false, onSettled, children }: LampProps) {
  const id = useId().replace(/:/g, "");
  const glow = useMotionValue(lit ? 1 : 0);
  const ends = useMotionValue(0);

  const settled = useRef(onSettled);
  useLayoutEffect(() => {
    settled.current = onSettled;
  });

  useFlicker(decay, glow, ends, instant);

  // Só anima quando o estado muda; na montagem a lâmpada já começa como está
  const previous = useRef(lit);
  useEffect(() => {
    if (decay || previous.current === lit) return;
    previous.current = lit;
    const sequence = lit ? IGNITE : DIE;
    if (instant) {
      glow.set(lit ? 1 : 0);
      ends.set(0);
      settled.current?.(lit);
      return;
    }
    const controls = [play(glow, sequence.glow, sequence.duration), play(ends, sequence.ends, sequence.duration)];
    const done = window.setTimeout(() => settled.current?.(lit), sequence.duration * 1000);
    return () => {
      controls.forEach((c) => c.stop());
      window.clearTimeout(done);
    };
  }, [lit, decay, instant, glow, ends]);

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
      </defs>
      <motion.g style={{ opacity: glow }} mask={`url(#${id}-ends)`}>
        {children}
      </motion.g>
    </>
  );
}
