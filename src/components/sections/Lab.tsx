import { AnimatePresence, motion, Reorder, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { oklchToHex } from "@/lib/color";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";
import { SpotlightSection } from "./SpotlightSection";

interface TileProps {
  name: string;
  tech: string;
  className?: string;
  children: ReactNode;
}

/** Moldura de cada experimento: nome do componente no topo e a técnica usada embaixo. */
function Tile({ name, tech, className, children }: TileProps) {
  return (
    <div className={cn("relative flex min-h-56 flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.02] p-5", className)}>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">{name}</p>
      <div className="relative flex flex-1 items-center justify-center py-4">{children}</div>
      <p className="font-mono text-[10px] text-muted/70">{tech}</p>
    </div>
  );
}

/* ---------- Refração: o botão se divide em RGB seguindo o cursor e solta raios no clique ---------- */

interface Burst {
  id: number;
  x: number;
  y: number;
}

function RefractionTile() {
  const ref = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [bursts, setBursts] = useState<Burst[]>([]);
  const reduce = useReducedMotion();

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    setOffset({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 14,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 8,
    });
  };

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (reduce) return;
    const rect = ref.current!.getBoundingClientRect();
    // Pelo teclado o clique não tem coordenada: os raios saem do centro
    const fromKeyboard = e.detail === 0;
    const burst = {
      id: Date.now(),
      x: fromKeyboard ? rect.width / 2 : e.clientX - rect.left,
      y: fromKeyboard ? rect.height / 2 : e.clientY - rect.top,
    };
    setBursts((b) => [...b, burst]);
    window.setTimeout(() => setBursts((b) => b.filter((item) => item.id !== burst.id)), 900);
  };

  const label = "Passe pelo prisma";
  const layer = "pointer-events-none absolute inset-0 flex items-center justify-center font-heading text-xl font-black uppercase sm:text-3xl";

  return (
    <Tile name="Refração" tech="pointer events · mix-blend-mode · framer-motion" className="md:col-span-4">
      <button
        ref={ref}
        type="button"
        onPointerMove={onMove}
        onPointerLeave={() => setOffset({ x: 0, y: 0 })}
        onClick={onClick}
        className="relative h-24 w-full max-w-xl overflow-hidden rounded-xl border border-white/15 bg-black sm:h-28"
      >
        <span className="sr-only">{label}</span>
        <span aria-hidden className={layer} style={{ color: "oklch(0.65 0.25 25)", transform: `translate(${-offset.x}px, ${-offset.y}px)`, mixBlendMode: "screen" }}>
          {label}
        </span>
        <span aria-hidden className={layer} style={{ color: "oklch(0.8 0.2 145)", mixBlendMode: "screen" }}>
          {label}
        </span>
        <span aria-hidden className={layer} style={{ color: "oklch(0.6 0.22 265)", transform: `translate(${offset.x}px, ${offset.y}px)`, mixBlendMode: "screen" }}>
          {label}
        </span>
        <AnimatePresence>
          {bursts.map((burst) => (
            <span key={burst.id} aria-hidden className="pointer-events-none absolute" style={{ left: burst.x, top: burst.y }}>
              {Array.from({ length: 12 }, (_, i) => (
                <motion.span
                  key={i}
                  className="absolute left-0 top-0 h-0.5 w-10 origin-left rounded-full"
                  style={{ rotate: i * 30, background: `oklch(0.78 0.2 ${i * 30})` }}
                  initial={{ scaleX: 0, opacity: 1, x: 0 }}
                  animate={{ scaleX: [0, 1, 0.2], opacity: [1, 1, 0], x: [0, 18, 40] }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              ))}
            </span>
          ))}
        </AnimatePresence>
      </button>
    </Tile>
  );
}

/* ---------- Matiz: um controle gera uma paleta OKLCH; clicar copia o hex ---------- */

function HueTile({ onCopy }: { onCopy: (hex: string) => void }) {
  const [hue, setHue] = useState(300);
  const steps = [0.92, 0.8, 0.68, 0.55, 0.4];

  return (
    <Tile name="Matiz" tech="input range · OKLCH → hex · Clipboard API" className="md:col-span-2 md:row-span-2">
      <div className="flex w-full flex-col gap-5">
        <div
          className="mx-auto size-28 rounded-full transition-[background,box-shadow] duration-300"
          style={{ background: `oklch(0.7 0.2 ${hue})`, boxShadow: `0 0 60px oklch(0.7 0.2 ${hue} / 0.6)` }}
        />
        <label className="block">
          <span className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
            <span>Matiz</span>
            <span>{hue}°</span>
          </span>
          <input
            type="range"
            min={0}
            max={360}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="spectrum-bg h-2 w-full cursor-pointer appearance-none rounded-full accent-white"
          />
        </label>
        <ul className="grid grid-cols-5 gap-1.5">
          {steps.map((l) => {
            const chroma = l > 0.85 || l < 0.45 ? 0.1 : 0.18;
            const hex = oklchToHex(l, chroma, hue);
            return (
              <li key={l}>
                <button
                  type="button"
                  onClick={() => onCopy(hex)}
                  className="group flex w-full flex-col items-center gap-1"
                  aria-label={`Copiar ${hex}`}
                >
                  <span className="block h-12 w-full rounded-md ring-white/40 transition group-hover:ring-2" style={{ background: hex }} />
                  <span className="font-mono text-[8px] text-muted sm:text-[9px]">{hex}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Tile>
  );
}

/* ---------- Arraste: lista reordenável ---------- */

const INITIAL_TASKS = ["Ajustar o checkout", "Revisar o banco", "Publicar a landing", "Responder o cliente", "Testar no celular"];

function ReorderTile() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  return (
    <Tile name="Arraste" tech="framer-motion · Reorder" className="md:col-span-2 md:row-span-2">
      <div className="w-full">
        <p className="mb-3 text-xs text-muted">Arraste para mudar a prioridade da semana.</p>
        <Reorder.Group axis="y" values={tasks} onReorder={setTasks} className="flex flex-col gap-2">
          {tasks.map((task, i) => (
            <Reorder.Item
              key={task}
              value={task}
              className="flex cursor-grab items-center gap-3 rounded-lg border border-white/10 bg-ink px-3 py-2.5 text-sm text-fg/85 active:cursor-grabbing"
              whileDrag={{ scale: 1.04, boxShadow: "0 12px 30px -10px oklch(0.7 0.2 300 / 0.6)" }}
            >
              <span className="font-mono text-[10px]" style={{ color: `oklch(0.78 0.17 ${25 + i * 65})` }}>
                {i + 1}
              </span>
              {task}
              <span aria-hidden className="ml-auto text-muted">⋮⋮</span>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    </Tile>
  );
}

/* ---------- Glitch: o texto digitado ganha o efeito ---------- */

function GlitchTile() {
  const [text, setText] = useState("Sistema no ar");

  return (
    <Tile name="Glitch" tech="CSS clip-path · pseudo-elementos" className="md:col-span-2">
      <div className="flex w-full flex-col items-center gap-4">
        <p className="lab-glitch font-heading text-2xl font-black uppercase sm:text-3xl" data-text={text || " "}>
          {text || " "}
        </p>
        <input
          value={text}
          maxLength={18}
          onChange={(e) => setText(e.target.value)}
          aria-label="Texto do glitch"
          className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-center font-mono text-xs text-fg outline-none focus:border-white/40"
        />
      </div>
    </Tile>
  );
}

/* ---------- Interruptor: acende a luz do tile ---------- */

function SwitchTile() {
  const [on, setOn] = useState(false);

  return (
    <Tile name="Interruptor" tech="role=switch · transição de cor" className="md:col-span-2">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: on ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ background: "radial-gradient(circle at 50% 20%, oklch(0.85 0.12 85 / 0.35), transparent 65%)" }}
      />
      <div className="flex flex-col items-center gap-4">
        <motion.span
          aria-hidden
          className="block size-10 rounded-full"
          animate={{
            background: on ? "oklch(0.92 0.12 90)" : "oklch(0.3 0 0)",
            boxShadow: on ? "0 0 40px 10px oklch(0.85 0.15 85 / 0.6)" : "0 0 0 0 transparent",
          }}
          transition={{ duration: 0.4 }}
        />
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Luz"
          onClick={() => setOn((v) => !v)}
          className={cn("relative h-8 w-14 rounded-full border transition-colors", on ? "border-[oklch(0.85_0.15_85)] bg-[oklch(0.85_0.15_85/0.25)]" : "border-white/20 bg-white/5")}
        >
          <motion.span
            className="absolute top-1 left-1 block size-6 rounded-full bg-white"
            animate={{ x: on ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{on ? "Aceso" : "Apagado"}</span>
      </div>
    </Tile>
  );
}

/* ---------- Odômetro: dígitos que rolam ---------- */

function Digit({ value }: { value: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        animate={{ y: `${-value}em` }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} className="block h-[1em] leading-none">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function OdometerTile() {
  const [count, setCount] = useState(1240);
  const digits = String(count).padStart(5, "0").split("").map(Number);

  return (
    <Tile name="Odômetro" tech="spring physics · transform" className="md:col-span-2">
      <div className="flex flex-col items-center gap-4">
        <p className="font-heading text-5xl font-black tabular-nums text-fg" aria-live="polite" aria-label={String(count)}>
          {digits.map((d, i) => (
            <Digit key={i} value={d} />
          ))}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setCount((c) => (c + 1) % 100000)} className="rounded-md border border-white/15 px-3 py-1.5 font-mono text-[11px] text-fg/85 hover:border-white/40">
            +1 commit
          </button>
          <button type="button" onClick={() => setCount(Math.floor(Math.random() * 99999))} className="rounded-md border border-white/15 px-3 py-1.5 font-mono text-[11px] text-fg/85 hover:border-white/40">
            Sortear
          </button>
        </div>
      </div>
    </Tile>
  );
}

/** Componentes vivos num bento: cada tile é um experimento para mexer. */
export function Lab() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setToast(`${hex} copiado`);
    } catch {
      setToast(`Não deu para copiar ${hex}`);
    }
  };

  return (
    <SpotlightSection id="laboratorio" hue={150} aria-labelledby="laboratorio-title">
      <div className="mx-auto max-w-6xl px-6 py-28 sm:px-10 sm:py-40">
        <SectionHeading
          id="laboratorio-title"
          eyebrow="Laboratório"
          title="Componentes para mexer"
          intro="Pequenos experimentos de interface, todos funcionando de verdade. É o tipo de detalhe que eu coloco nos sites que entrego."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-6">
          <RefractionTile />
          <HueTile onCopy={copy} />
          <ReorderTile />
          <GlitchTile />
          <SwitchTile />
          <OdometerTile />
        </div>
      </div>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
        <AnimatePresence>
          {toast && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="rounded-full border border-white/15 bg-ink px-4 py-2 font-mono text-xs text-fg shadow-xl"
            >
              {toast}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </SpotlightSection>
  );
}
