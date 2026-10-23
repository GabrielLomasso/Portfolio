import { motion, useTransform, type MotionValue } from "framer-motion";
import { PRISM_3D_FROM, prismShape, type PrismGeometry } from "./PrismBeam";

interface Pyramid3DProps {
  geometry: PrismGeometry;
  /** Progresso do encerramento do hero (0–1) */
  outro: MotionValue<number>;
}

interface FaceProps {
  turn: number;
  side: number;
  tall: number;
  /** Altura do vértice acima da base, animada */
  apex: MotionValue<number>;
}

/**
 * Uma face triangular: desenhada com a altura inclinada máxima e ajustada por escala,
 * deitando para trás até o vértice. Conforme o vértice desce, a face encolhe e deita mais.
 */
function Face({ turn, side, tall, apex }: FaceProps) {
  // Altura inclinada desenhada (com o vértice na altura do triângulo do hero)
  const drawn = Math.hypot(tall, side / 2);
  const transform = useTransform(apex, (a) => {
    const slant = Math.hypot(a, side / 2);
    const lean = (Math.asin(side / 2 / slant) * 180) / Math.PI;
    return `rotateY(${turn}deg) translateZ(${side / 2}px) rotateX(${lean}deg) scaleY(${slant / drawn})`;
  });

  return (
    <motion.div className="absolute left-0" style={{ width: side, height: drawn, top: tall - drawn, transformOrigin: "50% 100%", transform }}>
      <svg width={side} height={drawn} viewBox={`0 0 ${side} ${drawn}`} className="absolute inset-0 overflow-visible">
        <polygon
          points={`${side / 2},0 ${side},${drawn} 0,${drawn}`}
          fill="none"
          stroke="rgb(255 255 255 / 0.9)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ filter: "drop-shadow(0 0 6px rgb(255 255 255 / 0.5))" }}
        />
      </svg>
    </motion.div>
  );
}

/**
 * Pirâmide de base quadrada em CSS 3D com todas as arestas do tamanho do lado do triângulo
 * do hero (faces equiláteras). Ela nasce achatada e com o vértice na altura do triângulo,
 * idêntica ao SVG; enquanto ganha volume, o vértice desce até a altura de uma pirâmide de
 * arestas iguais (lado ÷ √2). Depois gira e sai pela esquerda.
 */
export function Pyramid3D({ geometry, outro }: Pyramid3DProps) {
  const { side, tall, top, left } = prismShape(geometry);

  const local = useTransform(outro, [PRISM_3D_FROM, 1], [0, 1]);
  const opacity = useTransform(outro, (o) => (o >= PRISM_3D_FROM ? 1 : 0));
  const depth = useTransform(local, [0, 0.22], [0.001, 1]);
  const apex = useTransform(local, [0, 0.22], [tall, side / Math.SQRT2]);
  // Um pequeno recuo para a direita antes de disparar para a esquerda
  const x = useTransform(local, [0, 0.12, 1], [0, side * 0.12, -(left.x + side * 1.8)]);
  const rotateY = useTransform(local, [0, 1], [0, -340]);
  const rotateX = useTransform(local, [0, 1], [0, 22]);
  const rotateZ = useTransform(local, [0, 1], [0, -16]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute z-10"
      style={{
        left: left.x,
        top: top.y,
        width: side,
        height: tall,
        opacity,
        x,
        rotateX,
        rotateY,
        rotateZ,
        transformStyle: "preserve-3d",
        // Gira em torno de um ponto central da pirâmide, perto da base
        originX: 0.5,
        originY: 0.8,
      }}
    >
      {/* A profundidade fica num contêiner interno para escalar no espaço do objeto, antes dos giros */}
      <motion.div className="absolute inset-0" style={{ scaleZ: depth, transformStyle: "preserve-3d", originY: 1 }}>
        {[0, 90, 180, 270].map((turn) => (
          <Face key={turn} turn={turn} side={side} tall={tall} apex={apex} />
        ))}

        {/* Base quadrada, só com as arestas */}
        <div
          className="absolute left-0 border border-white/60"
          style={{ width: side, height: side, top: tall - side / 2, transform: "rotateX(90deg)" }}
        />
      </motion.div>
    </motion.div>
  );
}
