import { motion, useTransform, type MotionValue } from "framer-motion";
import { PRISM_3D_FROM, PRISM_FADE, prismShape, type PrismGeometry } from "./PrismBeam";

interface Pyramid3DProps {
  geometry: PrismGeometry;
  /** Progresso do encerramento do hero (0–1) */
  outro: MotionValue<number>;
}

/**
 * Pirâmide de base quadrada, rígida, com as faces do mesmo tamanho do triângulo do hero
 * (equiláteras, lado igual ao do triângulo). Fica na altura dos olhos e só gira em volta
 * do eixo vertical enquanto sai pela esquerda; a base não aparece.
 * Precisa estar dentro de um contêiner com perspectiva PYRAMID_PERSPECTIVE.
 */
export function Pyramid3D({ geometry, outro }: Pyramid3DProps) {
  const { side, left } = prismShape(geometry);
  const height = side / Math.SQRT2;
  // Altura inclinada de cada face (do vértice ao meio da aresta da base) e quanto ela deita para trás
  const slant = (side * Math.sqrt(3)) / 2;
  const lean = (Math.asin(side / 2 / slant) * 180) / Math.PI;

  const local = useTransform(outro, [PRISM_3D_FROM, 1], [0, 1]);
  // Entra com um fade curto enquanto o triângulo plano sai
  const opacity = useTransform(outro, [PRISM_3D_FROM, PRISM_3D_FROM + PRISM_FADE], [0, 1]);
  const x = useTransform(local, [0, 1], [0, -(left.x + side * 1.8)]);
  const rotateY = useTransform(local, [0, 1], [0, -360]);

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
        // A aresta da frente da base no plano da tela (z = 0)
        z: -side / 2,
        rotateY,
        transformStyle: "preserve-3d",
        // Gira em volta do eixo vertical que passa pelo centro da base
        originX: 0.5,
      }}
    >
      {[0, 90, 180, 270].map((turn) => (
        <div
          key={turn}
          className="absolute left-0"
          style={{
            width: side,
            height: slant,
            top: height - slant,
            transformOrigin: "50% 100%",
            // Gira em volta do eixo vertical, vai até a aresta da base e deita até o vértice
            transform: `rotateY(${turn}deg) translateZ(${side / 2}px) rotateX(${lean}deg)`,
          }}
        >
          {faceSvg}
        </div>
      ))}
    </motion.div>
  );
}
