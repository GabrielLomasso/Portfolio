import { motion, useTransform, type MotionValue } from "framer-motion";
import { PRISM_3D_FROM, prismShape, type PrismGeometry } from "./PrismBeam";

interface Prism3DProps {
  geometry: PrismGeometry;
  /** Progresso do encerramento do hero (0–1) */
  outro: MotionValue<number>;
}

/**
 * Prisma triangular de verdade, montado com CSS 3D: duas faces triangulares e três
 * laterais retangulares em cima das arestas. Começa exatamente sobre o triângulo do SVG
 * (a face da frente fica em z = 0), gira e sai da tela pela esquerda.
 */
export function Prism3D({ geometry, outro }: Prism3DProps) {
  const { side, tall, top, left } = prismShape(geometry);
  const depth = side * 0.55;

  const local = useTransform(outro, [PRISM_3D_FROM, 1], [0, 1]);
  const opacity = useTransform(outro, (o) => (o >= PRISM_3D_FROM ? 1 : 0));
  // Um pequeno recuo para a direita antes de disparar para a esquerda
  const x = useTransform(local, [0, 0.12, 1], [0, side * 0.12, -(left.x + side * 1.8)]);
  const rotateY = useTransform(local, [0, 1], [0, -340]);
  const rotateX = useTransform(local, [0, 1], [0, 26]);
  const rotateZ = useTransform(local, [0, 1], [0, -16]);

  // Vértices no sistema do contêiner (caixa do triângulo)
  const T = { x: side / 2, y: 0 };
  const R = { x: side, y: tall };
  const L = { x: 0, y: tall };
  const edges = [
    { a: L, b: R, shade: 0.1 },
    { a: R, b: T, shade: 0.05 },
    { a: T, b: L, shade: 0.14 },
  ];

  const triangle = (
    <svg width={side} height={tall} viewBox={`0 0 ${side} ${tall}`} className="absolute inset-0 overflow-visible">
      <polygon
        points={`${T.x},${T.y} ${R.x},${R.y} ${L.x},${L.y}`}
        fill="rgb(255 255 255 / 0.04)"
        stroke="rgb(255 255 255 / 0.9)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px rgb(255 255 255 / 0.55))" }}
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
        // Gira em torno do centro do sólido: baricentro do triângulo, no meio da profundidade
        originX: 0.5,
        originY: 2 / 3,
        originZ: -depth / 2,
      }}
    >
      {/* Face da frente (z = 0) e de trás */}
      <div className="absolute inset-0" style={{ transform: "translateZ(0px)" }}>
        {triangle}
      </div>
      <div className="absolute inset-0" style={{ transform: `translateZ(${-depth}px)` }}>
        {triangle}
      </div>

      {/* Laterais: um retângulo em pé sobre cada aresta */}
      {edges.map(({ a, b, shade }, i) => {
        const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        return (
          <div
            key={i}
            className="absolute border border-white/60"
            style={{
              width: side,
              height: depth,
              left: mid.x - side / 2,
              top: mid.y - depth / 2,
              background: `linear-gradient(180deg, rgb(255 255 255 / ${shade}), rgb(255 255 255 / ${shade * 0.3}))`,
              boxShadow: "inset 0 0 18px rgb(255 255 255 / 0.12), 0 0 10px rgb(255 255 255 / 0.15)",
              transform: `translateZ(${-depth / 2}px) rotateZ(${angle}deg) rotateX(90deg)`,
            }}
          />
        );
      })}
    </motion.div>
  );
}
