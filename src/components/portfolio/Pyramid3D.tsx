import { motion, useTransform, type MotionValue } from "framer-motion";
import { PRISM_3D_FROM, PRISM_FADE, prismShape, type PrismGeometry } from "./PrismBeam";
import type { PyramidConfig } from "./pyramid-config";

interface Pyramid3DProps {
  geometry: PrismGeometry;
  /** Progresso do encerramento do hero (0–1) */
  outro: MotionValue<number>;
  config: PyramidConfig;
}

/**
 * Pirâmide de base quadrada que assume o lugar do triângulo do hero. Com altura 1, de frente
 * ela tem o mesmo contorno do triângulo: a base é a mesma aresta e o vértice fica no mesmo
 * ponto. Depois só gira em volta do eixo vertical e sai pela esquerda; a base não aparece.
 * Os valores ficam em pyramid-config.ts.
 */
export function Pyramid3D({ geometry, outro, config }: Pyramid3DProps) {
  const { side, tall, left } = prismShape(geometry);
  const height = tall * config.altura;
  // Altura de cada face (do vértice ao meio da aresta da base) e quanto ela deita para trás
  const slant = Math.hypot(height, side / 2);
  const lean = (Math.atan2(side / 2, height) * 180) / Math.PI;

  // O giro só começa depois da troca: até lá a pirâmide está de frente, idêntica ao triângulo
  const local = useTransform(outro, [PRISM_3D_FROM + PRISM_FADE, 1], [0, 1]);
  const opacity = useTransform(outro, [PRISM_3D_FROM, PRISM_3D_FROM + PRISM_FADE], [0, 1]);
  const rotateY = useTransform(local, [0, 1], [0, config.giro]);
  const x = useTransform(local, [0, config.paradaNoLugar, 1], [0, 0, -(left.x + side / 2 + side * config.saida)]);

  const outline = `${side / 2},0 ${side},${slant} 0,${slant}`;
  const faceSvg = (
    <svg width={side} height={slant} viewBox={`0 0 ${side} ${slant}`} className="absolute inset-0 overflow-visible">
      {/* Mesmo traço do triângulo: halo largo e suave por baixo, linha fina por cima */}
      <polygon
        points={outline}
        fill="none"
        stroke="rgb(255 255 255 / 0.55)"
        strokeWidth={7}
        strokeLinejoin="round"
        style={{ filter: "blur(3px)" }}
      />
      <polygon points={outline} fill="none" stroke="rgb(255 255 255 / 0.95)" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );

  return (
    <div
      className="pointer-events-none absolute inset-0"
      // Sem perspectiva a projeção é paralela: a base fica sempre na mesma linha
      style={{ perspective: config.perspectiva > 0 ? `${config.perspectiva}px` : "none" }}
    >
      <motion.div
        aria-hidden
        className="absolute z-10"
        style={{
          left: left.x,
          top: left.y - height,
          width: side,
          height,
          opacity,
          x,
          // A aresta da frente da base fica no plano da tela, onde estava a base do triângulo
          z: -side / 2,
          rotateY,
          transformStyle: "preserve-3d",
          // Gira em volta do eixo vertical que passa pelo vértice e pelo centro da base
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
              // Vai até a aresta da base e deita para trás até o vértice
              transform: `rotateY(${turn}deg) translateZ(${side / 2}px) rotateX(${lean}deg)`,
            }}
          >
            {faceSvg}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
