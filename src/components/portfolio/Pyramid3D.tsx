import { motion, useTransform, type MotionValue } from "framer-motion";
import { PRISM_3D_FROM, prismShape, type PrismGeometry } from "./PrismBeam";

interface Pyramid3DProps {
  geometry: PrismGeometry;
  /** Progresso do encerramento do hero (0–1) */
  outro: MotionValue<number>;
}

/**
 * Pirâmide de base quadrada montada com CSS 3D: quatro faces triangulares inclinadas
 * até o vértice e a base. De frente ela é o mesmo triângulo do hero; nasce achatada
 * (profundidade zero, idêntica ao SVG), ganha volume enquanto gira e sai pela esquerda.
 */
export function Pyramid3D({ geometry, outro }: Pyramid3DProps) {
  const { side, tall, top, left } = prismShape(geometry);
  // Altura inclinada de cada face (do vértice ao meio da aresta da base) e quanto ela deita para trás
  const slant = Math.hypot(tall, side / 2);
  const lean = (Math.asin(side / 2 / slant) * 180) / Math.PI;

  const local = useTransform(outro, [PRISM_3D_FROM, 1], [0, 1]);
  const opacity = useTransform(outro, (o) => (o >= PRISM_3D_FROM ? 1 : 0));
  const depth = useTransform(local, [0, 0.22], [0.001, 1]);
  // Um pequeno recuo para a direita antes de disparar para a esquerda
  const x = useTransform(local, [0, 0.12, 1], [0, side * 0.12, -(left.x + side * 1.8)]);
  const rotateY = useTransform(local, [0, 1], [0, -340]);
  const rotateX = useTransform(local, [0, 1], [0, 22]);
  const rotateZ = useTransform(local, [0, 1], [0, -16]);

  const faces = [
    { turn: 0, shade: 0.07 },
    { turn: 90, shade: 0.12 },
    { turn: 180, shade: 0.05 },
    { turn: 270, shade: 0.1 },
  ];

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
        // Gira em torno do centro da pirâmide (a 1/4 da altura, a partir da base)
        originX: 0.5,
        originY: 0.75,
      }}
    >
      {/* A profundidade fica num contêiner interno para escalar no espaço do objeto, antes dos giros */}
      <motion.div className="absolute inset-0" style={{ scaleZ: depth, transformStyle: "preserve-3d", originX: 0.5, originY: 1 }}>
        {faces.map(({ turn, shade }) => (
          <div
            key={turn}
            className="absolute left-0"
            style={{
              width: side,
              height: slant,
              top: tall - slant,
              transformOrigin: "50% 100%",
              // Gira em volta do eixo vertical, vai até a aresta da base e deita até o vértice
              transform: `rotateY(${turn}deg) translateZ(${side / 2}px) rotateX(${lean}deg)`,
            }}
          >
            <svg width={side} height={slant} viewBox={`0 0 ${side} ${slant}`} className="absolute inset-0 overflow-visible">
              <polygon
                points={`${side / 2},0 ${side},${slant} 0,${slant}`}
                fill={`rgb(255 255 255 / ${shade})`}
                stroke="rgb(255 255 255 / 0.9)"
                strokeWidth={1.5}
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 0 6px rgb(255 255 255 / 0.5))" }}
              />
            </svg>
          </div>
        ))}

        {/* Base quadrada */}
        <div
          className="absolute left-0 border border-white/60"
          style={{
            width: side,
            height: side,
            top: tall - side / 2,
            background: "rgb(255 255 255 / 0.04)",
            transform: "rotateX(90deg)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
