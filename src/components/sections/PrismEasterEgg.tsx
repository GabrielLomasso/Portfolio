import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const SECRET = "prisma";

/** Digitar "prisma" em qualquer lugar (fora de campos de texto) faz o espectro varrer a tela. */
export function PrismEasterEgg() {
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const buffer = useRef("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest("input, textarea, [contenteditable=true]") || e.key.length !== 1) return;
      buffer.current = (buffer.current + e.key.toLowerCase()).slice(-SECRET.length);
      if (buffer.current === SECRET) {
        buffer.current = "";
        setRun((n) => n + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!run) return;
    const id = window.setTimeout(() => setRun(0), 2600);
    return () => window.clearTimeout(id);
  }, [run]);

  return (
    <AnimatePresence>
      {run > 0 && (
        <motion.div key={run} className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-live="polite">
          {!reduce && (
            <motion.div
              aria-hidden
              className="spectrum-bg absolute inset-y-[-20%] w-[45vw] mix-blend-screen blur-2xl"
              style={{ rotate: 12 }}
              initial={{ x: "-60vw", opacity: 0.9 }}
              animate={{ x: "130vw", opacity: [0.9, 0.9, 0] }}
              transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
            />
          )}
          <motion.p
            className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-ink px-4 py-2 font-mono text-xs text-fg shadow-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Modo prisma: você achou o easter egg
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
