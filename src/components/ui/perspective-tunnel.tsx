// Adaptado do "perspective-tunnel-hero" do 21st.dev: em vez de capturar a roda do
// mouse dentro de um container de 100vh, o túnel recebe um MotionValue de progresso
// (normalmente o scroll da página), então rolagem, teclado e touch funcionam nativos.
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

export interface TunnelStage {
  width: number;
  height: number;
  isMobile: boolean;
}

export interface TunnelWindow {
  start: number;
  end: number;
}

export interface TunnelPointer {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };

export function useTunnelStage(): TunnelStage {
  const [stage, setStage] = useState<TunnelStage>({ width: 1440, height: 900, isMobile: false });

  useEffect(() => {
    const update = () =>
      setStage({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
      });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return stage;
}

/** Ponteiro normalizado em [-1, 1], suavizado por mola. */
export function useCameraParallax(enabled: boolean): TunnelPointer {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);

  return { x, y };
}

/** Distribui os cards ao longo de [from, to], cada um ocupando `span` do progresso. */
export function tunnelWindows(count: number, from = 0, to = 1, span = 0.3): TunnelWindow[] {
  const step = count > 1 ? (to - from - span) / (count - 1) : 0;
  return Array.from({ length: count }, (_, i) => ({
    start: from + i * step,
    end: from + i * step + span,
  }));
}

interface TunnelCardProps {
  index: number;
  count: number;
  window: TunnelWindow;
  progress: MotionValue<number>;
  pointer: TunnelPointer;
  stage: TunnelStage;
  width: number;
  children: ReactNode;
}

function TunnelCard({ index, count, window: win, progress, pointer, stage, width, children }: TunnelCardProps) {
  // Ângulo áureo espalha os cards em espiral ao redor do centro, sem repetir posição.
  const angle = index * 137.5 * (Math.PI / 180) + 0.6;
  const radiusX = 0.3 + (index % 3) * 0.06;
  const radiusY = 0.24 + (index % 2) * 0.08;
  const rotationZ = (index % 2 === 0 ? 1 : -1) * (2 + (index % 4) * 1.5);

  const local = useTransform(progress, [win.start, win.end], [0, 1]);
  const z = useTransform(local, [0, 1], stage.isMobile ? [-1200, 350] : [-1800, 520]);
  const opacity = useTransform(local, [0, 0.16, 0.8, 0.96], [0, 1, 1, 0]);

  const baseX = Math.cos(angle) * stage.width * radiusX;
  const baseY = Math.sin(angle) * stage.height * radiusY;
  const pan = stage.isMobile ? 20 : 45;

  const transform = useTransform([z, pointer.x, pointer.y], ([currZ, px, py]: number[]) => {
    const x = baseX - px * pan;
    const y = baseY - py * pan;
    return `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${currZ}px) rotateZ(${rotationZ}deg)`;
  });

  return (
    <motion.div
      style={{ width, transform, opacity, zIndex: count - index }}
      className="absolute left-1/2 top-1/2 select-none will-change-transform"
    >
      {children}
    </motion.div>
  );
}

interface PerspectiveTunnelProps<T> {
  items: T[];
  windows: TunnelWindow[];
  progress: MotionValue<number>;
  pointer: TunnelPointer;
  stage: TunnelStage;
  getKey: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
}

/** Plano 3D onde os cards viajam do fundo em direção à câmera. O pai precisa ter `perspective`. */
export function PerspectiveTunnel<T>({
  items,
  windows,
  progress,
  pointer,
  stage,
  getKey,
  renderItem,
  className,
}: PerspectiveTunnelProps<T>) {
  const width = stage.isMobile
    ? Math.max(150, Math.min(210, stage.width * 0.44))
    : Math.max(230, Math.min(330, stage.width * 0.2));

  return (
    <div className={className} style={{ transformStyle: "preserve-3d" }}>
      {items.map((item, i) => (
        <TunnelCard
          key={getKey(item)}
          index={i}
          count={items.length}
          window={windows[i]}
          progress={progress}
          pointer={pointer}
          stage={stage}
          width={width}
        >
          {renderItem(item, i)}
        </TunnelCard>
      ))}
    </div>
  );
}
