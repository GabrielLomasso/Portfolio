import { motion, useTransform, type MotionValue } from "framer-motion";
import { PRISM_3D_FROM, prismShape, type PrismGeometry } from "./PrismBeam";

interface Pyramid3DProps {
  geometry: PrismGeometry;
  /** Progresso do encerramento do hero (0–1) */
  outro: MotionValue<number>;
}

/**
 * Pirâmide de base quadrada, rígida, com todas as arestas do tamanho do lado do triângulo
 * do hero (faces equiláteras) em todos os quadros. Entra vista de frente, na altura dos
 * olhos, com a aresta da frente da base no plano da tela: é a mesma figura em que o
 * triângulo 2D se transforma logo antes (ver pyramidFrontApex). Depois gira e sai pela esquerda.
 * Precisa estar dentro de um contêiner com perspectiva PYRAMID_PERSPECTIVE.
 */
export function Pyramid3D({ geometry, outro }: Pyramid3DProps) {
  const { side, left } = prismShape(geometry);
  const height = side / Math.SQRT2;
  // Altura inclinada de cada face (do vértice ao meio da aresta da base) e quanto ela deita para trás
  const slant = (side * Math.sqrt(3)) / 2;
  const lean = (Math.asin(side / 2 / slant) * 180) / Math.PI;

  const local = useTransform(outro, [PRISM_3D_FROM, 1], [0, 1]);
  const opacity = useTransform(outro, (o) => (o >= PRISM_3D_FROM ? 1 : 0));
  // De frente, as arestas de trás ficam quase sobre as da frente; elas aparecem quando o giro começa
  const backEdges = useTransform(local, [0, 0.1], [0, 1]);
  // Um pequeno recuo para a direita antes de disparar para a esquerda
  const x = useTransform(local, [0, 0.12, 1], [0, side * 0.12, -(left.x + side * 1.8)]);
  const rotateY = useTransform(local, [0, 1], [0, -340]);
  const rotateX = useTransform(local, [0, 0.15, 1], [0, 6, 22]);
  const rotateZ = useTransform(local, [0, 1], [0, -14]);

  const faceSvg = (
    <svg width={side} height={slant} viewBox={`0 0 ${side} ${slant}`} className="absolute inset-0 overflow-visible">
      <polygon
        points={`${side / 2},0 ${side},${slant} 0,${slant}`}
        fill="none"
        stroke="rgb(255 255 255 / 0.9)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px rgb(255 255 255 / 0.5))" }}
      />
    </svg>
  );

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute z-10"
      style={{
        left: left.x,
        top: left.y - height,
        width: side,
        height,
        opacity,
        x,
        // A aresta da frente da base no plano da tela (z = 0), como na vista frontal do triângulo
        z: -side / 2,
        rotateX,
        rotateY,
        rotateZ,
        transformStyle: "preserve-3d",
        // Gira em torno do centro da pirâmide (a 1/4 da altura, a partir da base)
        originX: 0.5,
        originY: 0.75,
      }}
    >
      {[0, 90, 180, 270].map((turn) => (
        <motion.div
          key={turn}
          className="absolute left-0"
          style={{
            width: side,
            height: slant,
            top: height - slant,
            opacity: turn === 0 ? 1 : backEdges,
            transformOrigin: "50% 100%",
            // Gira em volta do eixo vertical, vai até a aresta da base e deita até o vértice
            transform: `rotateY(${turn}deg) translateZ(${side / 2}px) rotateX(${lean}deg)`,
          }}
        >
          {faceSvg}
        </motion.div>
      ))}

      {/* Base quadrada, só com as arestas */}
      <motion.div
        className="absolute left-0 border border-white/60"
        style={{ width: side, height: side, top: height - side / 2, opacity: backEdges, transform: "rotateX(90deg)" }}
      />
    </motion.div>
  );
}
