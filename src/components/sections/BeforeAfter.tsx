import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { SectionHeading } from "./SectionHeading";
import { SpotlightSection } from "./SpotlightSection";

const LINE = "rgb(140 200 255 / 0.55)";
const NOTE = "oklch(0.8 0.12 220)";

/** Bloco do wireframe, posicionado em % sobre a mesma proporção do print. */
function Block({ x, y, w, h, solid = false, round = false }: { x: number; y: number; w: number; h: number; solid?: boolean; round?: boolean }) {
  return (
    <span
      className="absolute border"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        height: `${h}%`,
        borderColor: LINE,
        borderRadius: round ? "9999px" : 3,
        background: solid ? "rgb(140 200 255 / 0.12)" : "transparent",
      }}
    />
  );
}

/** Anotação em mono, como as notas que eu deixo no wireframe para o cliente. */
function Note({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <span className="absolute hidden font-mono text-[9px] uppercase tracking-wider sm:block sm:text-[10px]" style={{ left: `${x}%`, top: `${y}%`, color: NOTE }}>
      {children}
    </span>
  );
}

/** Wireframe do primeiro dia do site do Thaylor, na mesma grade do print final. */
function Wireframe() {
  return (
    <div
      className="absolute inset-0 bg-[#06111c]"
      style={{
        backgroundImage:
          "linear-gradient(rgb(140 200 255 / 0.07) 1px, transparent 1px), linear-gradient(90deg, rgb(140 200 255 / 0.07) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Menu */}
      <Block x={6.4} y={2.6} w={8.4} h={3.4} solid />
      {[39.7, 45.2, 51.4, 55.6].map((x) => (
        <Block key={x} x={x} y={3.4} w={4.4} h={1.6} />
      ))}
      <Block x={85.2} y={1.8} w={7.4} h={4} solid />
      <Note x={85.2} y={7.2}>CTA fixo</Note>

      {/* Título e texto */}
      <Block x={6.4} y={24.6} w={21} h={1.4} />
      <Block x={6.4} y={29} w={62.6} h={12.8} />
      <Block x={6.4} y={42.4} w={51.6} h={12.8} />
      <Note x={70.5} y={33}>H1 em 2 linhas</Note>
      <Note x={60} y={47}>palavra-chave em vermelho</Note>
      <Block x={6.4} y={60} w={40.6} h={2} />
      <Block x={6.4} y={63.6} w={39.6} h={2} />

      {/* Botões */}
      <Block x={6.4} y={71} w={24.4} h={5.9} solid />
      <Block x={31.9} y={71} w={17.5} h={5.9} />
      <Note x={6.4} y={78.4}>conversão principal</Note>

      {/* Prova social */}
      {[6.4, 25.5, 44.6].map((x) => (
        <Block key={x} x={x} y={86.2} w={12.4} h={1.6} />
      ))}
      <Note x={6.4} y={89.6}>prova social</Note>

      {/* WhatsApp flutuante */}
      <Block x={93.4} y={91.6} w={4.1} h={6.3} round solid />
      <Note x={82} y={93.4}>whatsapp</Note>

      {/* Área da foto */}
      <span className="absolute border border-dashed" style={{ left: "62%", top: "12%", width: "34%", height: "76%", borderColor: "rgb(140 200 255 / 0.25)" }} />
      <Note x={72} y={50}>foto de treino</Note>
    </div>
  );
}

/** Comparador arrastável: wireframe à esquerda, site no ar à direita. */
export function BeforeAfter() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-25% 0px" });
  const split = useMotionValue(50);
  const clip = useTransform(split, (v) => `inset(0 ${100 - v}% 0 0)`);
  const left = useTransform(split, (v) => `${v}%`);
  const [value, setValue] = useState(50);
  const dragging = useRef(false);

  useMotionValueEvent(split, "change", (v) => setValue(Math.round(v)));

  // Ao aparecer, a divisória mostra sozinha que dá para arrastar
  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(split, [50, 22, 78, 50], { duration: 2.4, ease: "easeInOut", delay: 0.3 });
    return () => controls.stop();
  }, [inView, reduce, split]);

  const setFromPointer = (clientX: number) => {
    const rect = ref.current!.getBoundingClientRect();
    split.set(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromPointer(e.clientX);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") split.set(Math.max(0, split.get() - step));
    else if (e.key === "ArrowRight") split.set(Math.min(100, split.get() + step));
    else if (e.key === "Home") split.set(0);
    else if (e.key === "End") split.set(100);
    else return;
    e.preventDefault();
  };

  return (
    <SpotlightSection id="rascunho" hue={210} aria-labelledby="rascunho-title">
      <div className="mx-auto max-w-6xl px-6 py-28 sm:px-10 sm:py-40">
        <SectionHeading
          id="rascunho-title"
          eyebrow="Antes e depois"
          title="Do rascunho ao ar"
          intro="Arraste a divisória. À esquerda, o wireframe do primeiro dia do site do Thaylor; à direita, o mesmo site no ar."
        />

        <div className="mt-14">
          <div className="mb-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
            <span style={{ color: NOTE }}>Rascunho · dia 1</span>
            <span>No ar</span>
          </div>

          <div
            ref={ref}
            className="relative aspect-[1392/911] w-full cursor-ew-resize touch-none select-none overflow-hidden rounded-2xl border border-line"
            onPointerDown={onPointerDown}
            onPointerMove={(e) => dragging.current && setFromPointer(e.clientX)}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
          >
            <img src="/projects/thaylor.webp" alt="Site do Thaylor Personal no ar" draggable={false} className="absolute inset-0 size-full object-cover" />
            <motion.div style={{ clipPath: clip }} className="absolute inset-0" aria-hidden>
              <Wireframe />
            </motion.div>

            {/* Divisória com a alça; é ela que recebe o foco do teclado */}
            <motion.div
              style={{ left }}
              role="slider"
              tabIndex={0}
              aria-label="Divisória entre rascunho e site no ar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={value}
              aria-valuetext={`${value}% rascunho`}
              onKeyDown={onKeyDown}
              className="absolute inset-y-0 w-0 outline-none [&:focus-visible>span]:ring-2 [&:focus-visible>span]:ring-white"
            >
              <span aria-hidden className="spectrum-bg absolute inset-y-0 -left-px w-0.5" />
              <span
                aria-hidden
                className="absolute top-1/2 left-0 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/80 font-mono text-xs text-fg backdrop-blur"
              >
                ⟷
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </SpotlightSection>
  );
}
