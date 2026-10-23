import { animate as animateValue, motion, useAnimate, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Lamp } from "./Lamp";

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

/**
 * Encerramento do hero (progresso 0–1 depois da última cor): a luz se apaga da esquerda
 * para a direita e, junto com ela, o nome some e o triângulo começa a falhar como uma
 * lâmpada velha. Quando o nome e a luz terminam de sair, ele ainda pisca LAMP_TAIL segundos
 * e só então apaga de vez.
 */
export const LAMP_START = 0.05;
/** Segundos que o triângulo continua piscando depois de o nome e o arco-íris sumirem */
const LAMP_TAIL = 0.7;
/** Estágio da lâmpada quando o nome e a luz terminam de sair; o resto acontece em LAMP_TAIL */
const LAMP_AT_LIGHT_OFF = 0.85;

/*
 * Ótica do apagar da luz. Quando a fonte desliga, a luz já emitida continua viajando:
 * o fim do feixe avança à velocidade da luz. No vidro a luz anda a c/n, e o índice n
 * cresce do vermelho para o violeta (dispersão normal; no vidro BK7, ~1,513 a 700 nm e
 * ~1,531 a 400 nm). Então o fim do feixe atravessa o prisma mais devagar, o vermelho
 * termina de sair primeiro e o violeta por último; fora do vidro, todas as cores voltam
 * à mesma velocidade. A diferença real (~1%) é exagerada aqui, como o próprio leque.
 */
/** A luz termina de sair da tela pouco antes de o triângulo apagar de vez. */
export const LIGHT_OFF_END = 0.42;
/** A borda do fim do feixe não é um corte seco: espalha um pouco (difração). */
const TAIL_SOFT = 70;
/** Índice de refração exagerado de cada faixa, do vermelho (1,5) ao violeta. */
const glassIndex = (band: number) => 1.5 + band * 0.15;

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

interface TailMaskProps {
  id: string;
  outro: MotionValue<number>;
  /** Posição (px) do ponto a partir do qual a luz ainda está acesa, em função do encerramento */
  position: (o: number) => number;
  W: number;
  H: number;
}

/**
 * Máscara do fim do feixe: tudo à esquerda da posição fica apagado, com uma transição
 * suave de TAIL_SOFT px. A posição avança com o encerramento, na velocidade da luz daquele meio.
 */
function TailMask({ id, outro, position, W, H }: TailMaskProps) {
  const positionRef = useRef(position);
  useLayoutEffect(() => {
    positionRef.current = position;
  });
  const x = useTransform(outro, (o) => positionRef.current(o));

  return (
    <mask id={id} maskUnits="userSpaceOnUse" x={-W} y={0} width={W * 3} height={H}>
      <motion.rect x={-TAIL_SOFT} y={0} width={W * 2 + TAIL_SOFT} height={H} fill="url(#tail-fade)" style={{ x }} />
    </mask>
  );
}

interface PrismBeamProps {
  geometry: PrismGeometry;
  currentHue: MotionValue<number>;
  focus: MotionValue<number>;
  animateIn: boolean;
  /** Projeto em foco (-1 no hero). Cada troca dispara o glitch do triângulo. */
  pulse: number;
  /** Progresso do encerramento do hero (0 até a última cor, 1 com a tela preta) */
  outro: MotionValue<number>;
  /** Chamado quando o triângulo apaga de vez (true) ou volta a acender ao rolar para cima (false) */
  onLampOff?: (off: boolean) => void;
}

/** Triângulo de vidro atrás do nome: o feixe branco entra pela face esquerda e sai em espectro pela direita. */
export function PrismBeam({ geometry, currentHue, focus, animateIn, pulse, outro, onLampOff }: PrismBeamProps) {
  const beamOpacity = useTransform(focus, [0, 1], [1, 0.35]);
  const prismOpacity = useTransform(focus, [0, 1], [1, 0.7]);

  // Quanto a lâmpada do triângulo já morreu: anda junto com a luz saindo da tela e, depois
  // que ela sai, termina de morrer no tempo, em LAMP_TAIL segundos.
  const scrollDecay = useTransform(outro, [LAMP_START, LIGHT_OFF_END], [0, LAMP_AT_LIGHT_OFF]);
  const tail = useMotionValue(0);
  const lampDecay = useTransform([scrollDecay, tail], ([s, t]: number[]) => s + t * (1 - LAMP_AT_LIGHT_OFF));
  const lightGone = useRef(false);
  const tailControls = useRef<ReturnType<typeof animateValue> | null>(null);
  useMotionValueEvent(outro, "change", (o) => {
    const gone = o >= LIGHT_OFF_END;
    if (gone === lightGone.current) return;
    lightGone.current = gone;
    tailControls.current?.stop();
    if (gone) {
      tailControls.current = animateValue(tail, 1, {
        duration: reduce ? 0 : LAMP_TAIL,
        ease: "linear",
        onComplete: () => onLampOff?.(true),
      });
    } else {
      tail.set(0);
      onLampOff?.(false);
    }
  });

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
  const { side, top, left, right } = prismShape(geometry);

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
    return { hue, a, b, points: pts(a, b, exitBottom, exitTop) };
  });
  const exitTop = lerp(right, top, 0.5);
  const exitBottom = lerp(right, top, 0.5 - BANDS.length * bandStep);

  const triangle = `M${top.x} ${top.y} L${right.x} ${right.y} L${left.x} ${left.y} Z`;
  // A revelação começa à esquerda de todas as faixas: a face é inclinada, e começar no ponto
  // mais à direita cortava o início das faixas numa linha vertical em vez de seguir a face.
  const fanX = Math.min(exitTop.x, exitBottom.x) - 2;

  // Velocidade da luz no ar (px por unidade de encerramento), calculada para o violeta, o
  // último a sair, terminar de passar pela borda da tela em LIGHT_OFF_END.
  const last = bands[bands.length - 1];
  const c = (entry.x + (last.a.x - entry.x) * glassIndex(bands.length - 1) + (W - last.a.x) + TAIL_SOFT) / LIGHT_OFF_END;
  // O fim do feixe chega à face de entrada neste momento
  const atEntry = entry.x / c;
  const tails = bands.map((band, j) => {
    const n = glassIndex(j);
    // Dentro do vidro o fim do feixe anda a c/n; ao chegar na face de saída, volta a c
    const leaves = atEntry + ((band.a.x - entry.x) * n) / c;
    return {
      // Continua além da face de saída para a borda suave terminar de passar pela cunha
      inside: (o: number) => entry.x + Math.max(0, o - atEntry) * (c / n),
      outside: (o: number) => band.a.x + Math.max(0, o - leaves) * c,
    };
  });

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
        {/* Encerramento: o fim do feixe viajando pelo ar, pelo vidro e de novo pelo ar */}
        <linearGradient id="tail-fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" />
          <stop offset={TAIL_SOFT / (W * 2 + TAIL_SOFT)} stopColor="#fff" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <TailMask id="tail-beam" outro={outro} position={(o) => o * c} W={W} H={H} />
        {tails.map((tail, j) => (
          <TailMask key={`in-${j}`} id={`tail-in-${j}`} outro={outro} position={tail.inside} W={W} H={H} />
        ))}
        {tails.map((tail, j) => (
          <TailMask key={`out-${j}`} id={`tail-out-${j}`} outro={outro} position={tail.outside} W={W} H={H} />
        ))}
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
        <Lamp decay={lampDecay} top={top} left={left} right={right} side={side} instant={!!reduce}>
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
        </Lamp>
      </motion.g>

      {/* Feixe branco até a face esquerda */}
      <g mask="url(#tail-beam)">
        <motion.g style={{ opacity: beamOpacity }} clipPath="url(#beam-reveal)">
          <line x1={beamStart.x} y1={beamStart.y} x2={entry.x} y2={entry.y} stroke="url(#beam-in)" strokeWidth={7} filter="url(#soft-glow)" opacity={0.5} />
          <line x1={beamStart.x} y1={beamStart.y} x2={entry.x} y2={entry.y} stroke="url(#beam-in)" strokeWidth={2} />
        </motion.g>
      </g>

      {/* Luz atravessando o vidro: um leque estreito por cor, que somado parece branco perto da entrada */}
      <motion.g style={{ opacity: beamOpacity }}>
        <motion.g initial={animateIn ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: INTRO.beam + 0.6 }}>
          {bands.map((band, j) => (
            <polygon
              key={band.hue}
              points={pts(entry, band.a, band.b)}
              fill={`oklch(0.92 0.08 ${band.hue} / 0.09)`}
              mask={`url(#tail-in-${j})`}
            />
          ))}
        </motion.g>
      </motion.g>

      {/* Espectro saindo pela face direita */}
      <g clipPath="url(#fan-reveal)">
        {bands.map((band, j) => (
          <g key={band.hue} mask={`url(#tail-out-${j})`}>
            <Band hue={band.hue} points={band.points} currentHue={currentHue} focus={focus} />
          </g>
        ))}
      </g>
    </svg>
  );
}
