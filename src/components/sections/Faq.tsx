import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, useState } from "react";
import { FAQ } from "@/data/site";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";
import { SpotlightSection } from "./SpotlightSection";

/**
 * Perguntas frequentes. Ao abrir uma pergunta, um feixe branco entra pela esquerda,
 * bate num pequeno prisma e a resposta aparece já "refratada" na cor daquela pergunta.
 */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();
  const baseId = useId();

  return (
    <SpotlightSection id="perguntas" hue={60} aria-labelledby="perguntas-title">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-28 sm:px-10 sm:py-40 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            id="perguntas-title"
            eyebrow="Perguntas frequentes"
            title="Antes de você perguntar"
            intro="O que quase todo mundo quer saber antes de começar um projeto. Se a sua dúvida não estiver aqui, o contato está logo abaixo."
          />
        </div>

        <ul className="flex flex-col border-t border-line">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            const hue = 25 + i * 55;
            const panelId = `${baseId}-painel-${i}`;
            const buttonId = `${baseId}-botao-${i}`;
            return (
              <li key={item.q} className="border-b border-line">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center gap-4 py-6 text-left"
                  >
                    {/* Mini prisma: acende e solta o espectro quando a pergunta abre */}
                    <svg viewBox="0 0 40 24" className="h-5 w-9 shrink-0" aria-hidden>
                      <motion.line
                        x1="0"
                        y1="14"
                        x2="15"
                        y2="12"
                        stroke="white"
                        strokeWidth="1.5"
                        initial={false}
                        animate={{ pathLength: isOpen ? 1 : 0.35, opacity: isOpen ? 1 : 0.4 }}
                        transition={{ duration: reduce ? 0 : 0.3 }}
                      />
                      <polygon
                        points="20,3 28,19 12,19"
                        fill="none"
                        stroke={isOpen ? "white" : "rgb(255 255 255 / 0.4)"}
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      {[25, 95, 150, 220, 300].map((h, k) => (
                        <motion.line
                          key={h}
                          x1="24"
                          y1={11 + k}
                          x2="40"
                          y2={8 + k * 3.2}
                          stroke={`oklch(0.78 0.2 ${h})`}
                          strokeWidth="1.3"
                          initial={false}
                          animate={{ pathLength: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
                          transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : 0.2 + k * 0.03 }}
                        />
                      ))}
                    </svg>
                    <span
                      className={cn("flex-1 font-heading text-lg font-black uppercase transition-colors sm:text-2xl", isOpen ? "" : "text-fg/70 group-hover:text-fg")}
                      style={isOpen ? { color: `oklch(0.85 0.15 ${hue})` } : undefined}
                    >
                      {item.q}
                    </span>
                    <motion.span
                      aria-hidden
                      className="font-mono text-xl text-muted"
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: reduce ? 0 : 0.25 }}
                    >
                      +
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p
                        className="mb-6 ml-13 border-l-2 pl-4 text-sm leading-relaxed text-fg/75 sm:text-base"
                        style={{ borderColor: `oklch(0.75 0.17 ${hue})` }}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </SpotlightSection>
  );
}
