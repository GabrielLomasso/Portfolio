import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { SIDE_A, SIDE_B, type Track } from "@/data/site";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";
import { SpotlightSection } from "./SpotlightSection";

interface Selected {
  side: "A" | "B";
  index: number;
}

const SIDES: { side: "A" | "B"; label: string; tracks: Track[]; hue: number }[] = [
  { side: "A", label: "Lado A · Formação", tracks: SIDE_A, hue: 200 },
  { side: "B", label: "Lado B · Trabalho", tracks: SIDE_B, hue: 330 },
];

/** Vinil com sulcos, rótulo com o prisma e um braço que pousa quando uma faixa toca. */
function Record({ track, code, hue, playing }: { track: Track; code: string; hue: number; playing: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // O disco gira com o scroll (e mais um pouco sozinho enquanto toca)
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 540]);

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-[26rem]">
      <motion.div
        style={{ rotate: reduce ? 0 : rotate }}
        className="absolute inset-0 rounded-full shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)]"
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={playing && !reduce ? { rotate: 360 } : { rotate: 0 }}
          transition={playing ? { duration: 6, repeat: Infinity, ease: "linear" } : { duration: 0.6 }}
          style={{
            background:
              "repeating-radial-gradient(circle at 50% 50%, #0b0b0e 0px, #0b0b0e 2px, #16161b 3px, #0b0b0e 4px), radial-gradient(circle, #111 0%, #050505 70%)",
          }}
        >
          {/* Brilho que atravessa os sulcos */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{ background: "conic-gradient(from 30deg, transparent 0deg, rgb(255 255 255 / 0.08) 25deg, transparent 60deg, transparent 180deg, rgb(255 255 255 / 0.06) 210deg, transparent 245deg)" }}
          />
          {/* Rótulo com o prisma */}
          <div className="absolute inset-[34%] flex items-center justify-center rounded-full bg-black ring-1 ring-white/10">
            <svg viewBox="0 0 100 100" className="h-3/5 w-3/5" aria-hidden>
              <line x1="0" y1="56" x2="38" y2="50" stroke="white" strokeWidth="2" />
              <polygon points="50,22 76,70 24,70" fill="none" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
              {[25, 60, 100, 150, 220, 290].map((h, i) => (
                <line key={h} x1="62" y1={48 + i * 2} x2="100" y2={52 + i * 6} stroke={`oklch(0.75 0.2 ${h})`} strokeWidth="2.4" />
              ))}
            </svg>
          </div>
          <span aria-hidden className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#222]" />
        </motion.div>
      </motion.div>

      {/* Braço da agulha: pousa no disco quando há uma faixa tocando */}
      <motion.svg
        viewBox="0 0 120 220"
        className="absolute -right-4 -top-6 h-[62%] origin-[85%_10%] sm:-right-8"
        animate={{ rotate: playing ? 24 : 4 }}
        transition={{ type: "spring", stiffness: 70, damping: 14 }}
        aria-hidden
      >
        <circle cx="102" cy="22" r="16" fill="#1b1b20" stroke="#3a3a42" strokeWidth="2" />
        <circle cx="102" cy="22" r="6" fill="#55555f" />
        <path d="M102 22 L96 150 L70 196" fill="none" stroke="#c9c9d1" strokeWidth="5" strokeLinecap="round" />
        <rect x="56" y="188" width="26" height="16" rx="3" transform="rotate(-30 69 196)" fill="#2a2a30" stroke={`oklch(0.75 0.18 ${hue})`} strokeWidth="2" />
      </motion.svg>

      {/* Etiqueta "tocando agora" */}
      <div className="absolute -bottom-2 left-1/2 w-max -translate-x-1/2 rounded-full border border-white/10 bg-ink px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        <AnimatePresence mode="wait">
          <motion.span key={code + track.title} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2">
            <span className="flex h-3 items-end gap-0.5" aria-hidden>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-0.5 rounded-full"
                  style={{ background: `oklch(0.78 0.18 ${hue})` }}
                  animate={playing && !reduce ? { height: ["30%", "100%", "50%", "80%", "30%"] } : { height: "40%" }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </span>
            Tocando {code} · <span className="text-fg">{track.title}</span>
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Trajetória como a contracapa de um disco: lado A (formação) e lado B (trabalho). */
export function Tracklist() {
  const [selected, setSelected] = useState<Selected>({ side: "A", index: 0 });
  const [playing, setPlaying] = useState(false);

  const current = SIDES.find((s) => s.side === selected.side)!;
  const track = current.tracks[selected.index];
  const code = `${selected.side}${selected.index + 1}`;

  const select = (side: "A" | "B", index: number) => {
    setSelected({ side, index });
    setPlaying(true);
  };

  return (
    <SpotlightSection id="trajetoria" hue={current.hue} aria-labelledby="trajetoria-title" className="overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-28 sm:px-10 sm:py-40">
        <SectionHeading
          id="trajetoria-title"
          eyebrow="Trajetória"
          title="Lado A, lado B"
          intro="Minha trajetória em forma de disco. Escolha uma faixa para o braço pousar e a agulha tocar."
        />

        <div className="mt-16 grid items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
          <Record track={track} code={code} hue={current.hue} playing={playing} />

          <div className="flex flex-col gap-10">
            {SIDES.map(({ side, label, tracks, hue }) => (
              <div key={side}>
                <p className="mb-3 border-b border-line pb-3 font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: `oklch(0.8 0.15 ${hue})` }}>
                  {label}
                </p>
                <ol className="flex flex-col">
                  {tracks.map((t, i) => {
                    const isActive = selected.side === side && selected.index === i;
                    return (
                      <li key={t.title}>
                        <button
                          type="button"
                          onClick={() => select(side, i)}
                          onMouseEnter={() => select(side, i)}
                          aria-pressed={isActive}
                          className={cn(
                            "group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                            isActive ? "bg-white/[0.04]" : "hover:bg-white/[0.02]",
                          )}
                        >
                          {/* Numeração de faixa de vinil: lado + posição */}
                          <span className="font-mono text-xs" style={{ color: isActive ? `oklch(0.8 0.17 ${hue})` : undefined }}>
                            {side}
                            {i + 1}
                          </span>
                          <span>
                            <span className={cn("font-heading text-lg font-black uppercase sm:text-xl", isActive ? "text-fg" : "text-fg/60")}>{t.title}</span>
                            <AnimatePresence initial={false}>
                              {isActive && (
                                <motion.span
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="block overflow-hidden"
                                >
                                  <span className="block pt-1.5 text-sm leading-relaxed text-fg/70">{t.note}</span>
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </span>
                          <span className="font-mono text-[11px] text-muted">{t.period}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SpotlightSection>
  );
}
