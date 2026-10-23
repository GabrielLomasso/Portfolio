import { motion, useTransform, type MotionValue } from "framer-motion";
import { PRISM_3D_FROM, prismShape, type PrismGeometry } from "./PrismBeam";

interface Pyramid3DProps {
  geometry: PrismGeometry;
  /** Progresso do encerramento do hero (0–1) */
  outro: MotionValue<number>;
}

// Ângulo entre duas faces de um tetraedro regular: arccos(1/3) ≈ 70,53°
const FOLD = (Math.acos(1 / 3) * 180) / Math.PI;

/**
 * Pirâmide de base triangular regular (tetraedro), em CSS 3D: as quatro faces são o
 * mesmo triângulo equilátero do hero. A face da frente coincide com o triângulo do SVG
 * e as outras três dobram para trás a partir das arestas dele, até se encontrarem no
 * vértice de trás. Vista de frente ela é exatamente o triângulo; depois gira e sai pela esquerda.
 */
export function Pyramid3D({ geometry, outro }: Pyramid3DProps) {
  const { side, tall, top, left } = prismShape(geometry);
  // Altura do tetraedro: distância do vértice de trás até o plano da face da frente
  const height = side * Math.sqrt(2 / 3);

  const local = useTransform(outro, [PRISM_3D_FROM, 1], [0, 1]);
  const opacity = useTransform(outro, (o) => (o >= PRISM_3D_FROM ? 1 : 0));
  // Nasce achatada (igual ao triângulo) e ganha volume nos primeiros instantes do giro
  const depth = useTransform(local, [0, 0.22], [0.001, 1]);
  const backFaces = useTransform(local, [0, 0.18], [0, 1]);
  // Um pequeno recuo para a direita antes de disparar para a esquerda
  const x = useTransform(local, [0, 0.12, 1], [0, side * 0.12, -(left.x + side * 1.8)]);
  const rotateY = useTransform(local, [0, 1], [0, -340]);
  const rotateX = useTransform(local, [0, 1], [0, 22]);
  const rotateZ = useTransform(local, [0, 1], [0, -16]);

  const face = (
    <svg width={side} height={tall} viewBox={`0 0 ${side} ${tall}`} className="absolute inset-0 overflow-visible">
      <polygon
        points={`${side / 2},0 ${side},${tall} 0,${tall}`}
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
        top: top.y,
        width: side,
        height: tall,
        opacity,
        x,
        rotateX,
        rotateY,
        rotateZ,
        transformStyle: "preserve-3d",
        // Gira em torno do centro do tetraedro: baricentro da face, 1/4 da altura para trás
        originX: 0.5,
        originY: 2 / 3,
        originZ: -height / 4,
      }}
    >
      {/* A profundidade fica num contêiner interno para escalar no espaço do objeto, antes dos giros */}
      <motion.div className="absolute inset-0" style={{ scaleZ: depth, transformStyle: "preserve-3d" }}>
        {/* Face da frente: o próprio triângulo do hero */}
        <div className="absolute inset-0">{face}</div>

        {/* Três faces de trás: cada uma é a face da frente girada 120° em volta do baricentro
            e dobrada para trás pela aresta de baixo, até o vértice de trás */}
        {[0, 120, 240].map((turn) => (
          <div
            key={turn}
            className="absolute inset-0"
            style={{ transformOrigin: "50% 66.667%", transform: `rotateZ(${turn}deg)`, transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ opacity: backFaces, transformOrigin: "50% 100%", transform: `rotateX(${FOLD}deg)` }}
            >
              {face}
            </motion.div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
