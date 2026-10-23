import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CONTACT } from "@/data/contact";
import { vividColor } from "@/lib/color";

// As cores do arco-íris do hero, do vermelho ao violeta
const HUES = [25, 55, 95, 145, 200, 255, 300];
const MONO = "font-mono text-[10px] uppercase tracking-[0.3em] sm:text-[11px]";

/*
 * O caminho inverso do prisma: as cores se juntam no centro e, somadas, viram luz branca.
 * Cada cor é uma mancha que corre para o meio (com mistura aditiva, a sobreposição clareia);
 * dali nasce um círculo branco com a borda em arco-íris que cresce até cobrir a tela.
 */
const GATHER = 0.45;
const FLOOD = 0.55;

type Phase = "opening" | "shown" | "closing";

export function ContactOverlay({ onClose }: { onClose: () => void }) {
  const reduce = !!useReducedMotion();
  const [phase, setPhase] = useState<Phase>("opening");
  const rootRef = useRef<HTMLDivElement>(null);
  const channels = CONTACT.channels.filter((c) => c.href);

  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    rootRef.current?.focus();
    const done = window.setTimeout(() => setPhase("shown"), reduce ? 0 : (GATHER + FLOOD) * 1000);
    return () => {
      html.style.overflow = previous;
      window.clearTimeout(done);
    };
  }, [reduce]);

  const close = () => {
    if (phase === "closing") return;
    setPhase("closing");
    window.setTimeout(onClose, reduce ? 0 : 650);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const closing = phase === "closing";
  const ring = HUES.map((h, i) => `${vividColor(h)} ${(i / HUES.length) * 100}%`).join(", ");

  return createPortal(
    <div
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={CONTACT.kicker}
      className="fixed inset-0 z-50 overflow-hidden bg-void outline-none"
    >
      {/* As cores correndo para o centro */}
      {!reduce && (
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {HUES.map((h, i) => (
            <motion.span
              key={h}
              className="absolute size-[18vmin] rounded-full blur-2xl mix-blend-screen"
              style={{ background: vividColor(h) }}
              initial={{ x: `${(i - 3) * 13}vw`, opacity: 0, scale: 1.2 }}
              animate={
                closing
                  ? { x: `${(i - 3) * 13}vw`, opacity: [0, 1, 0], scale: 1.2 }
                  : { x: "0vw", opacity: [0, 1, 1, 0], scale: 0.5 }
              }
              transition={
                closing
                  ? { duration: 0.35, delay: 0.3, ease: "easeOut" }
                  : { duration: GATHER + 0.15, ease: [0.55, 0, 0.9, 0.4], times: [0, 0.2, 0.75, 1] }
              }
            />
          ))}
        </div>
      )}

      {/* Luz branca nascendo das cores somadas, com a borda ainda em arco-íris */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.span
          className="absolute size-[200vmax] rounded-full"
          style={{ background: `radial-gradient(circle closest-side, #fff 0 80%, transparent 97%), conic-gradient(${ring}, ${vividColor(HUES[0])} 100%)` }}
          initial={{ scale: reduce ? 1 : 0 }}
          animate={{ scale: closing ? 0 : 1 }}
          transition={
            closing
              ? { duration: 0.5, ease: [0.65, 0, 0.35, 1] }
              : { duration: FLOOD, delay: GATHER - 0.08, ease: [0.7, 0, 0.84, 0] }
          }
        />
      </div>

      <AnimatePresence>
        {phase === "shown" && (
          <motion.div
            key="contact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="absolute inset-0 overflow-y-auto text-neutral-900"
          >
            <div className="absolute inset-x-0 top-0 flex justify-between px-5 pt-5 sm:px-8 sm:pt-7">
              <button type="button" onClick={close} className={`${MONO} text-neutral-500 transition-colors hover:text-neutral-900`}>
                Voltar
              </button>
              <span className={`${MONO} text-neutral-400`}>{CONTACT.base}</span>
            </div>

            <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-6 py-24">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.5 }}
                className={`${MONO} text-neutral-500`}
              >
                {CONTACT.kicker}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl"
              >
                {CONTACT.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600"
              >
                {CONTACT.lead}
              </motion.p>

              <ul className="mt-12 grid gap-3 sm:grid-cols-2">
                {channels.map((channel, i) => (
                  <motion.li
                    key={channel.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <a
                      href={channel.href}
                      target={channel.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="group flex items-center justify-between rounded-full border border-neutral-900 px-6 py-4 transition-colors hover:bg-neutral-900 hover:text-white"
                    >
                      <span className="font-semibold">{channel.label}</span>
                      <span className="truncate pl-4 text-sm text-neutral-500 transition-colors group-hover:text-white/70">
                        {channel.detail}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
