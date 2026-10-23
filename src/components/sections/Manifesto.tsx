import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useMemo, useRef } from "react";
import { FACTS, MANIFESTO } from "@/data/site";
import { SpotlightSection } from "./SpotlightSection";

// Cores que as palavras-chave assumem, na ordem do espectro
const HIGHLIGHT_HUES = [25, 60, 95, 150, 195, 255, 300, 340];

interface Token {
  text: string;
  hue: number | null;
}

function parse(text: string): Token[] {
  let highlight = 0;
  return text.split(" ").map((raw) => {
    const match = raw.match(/^\*(.+?)\*(.*)$/);
    if (!match) return { text: raw, hue: null };
    const hue = HIGHLIGHT_HUES[highlight++ % HIGHLIGHT_HUES.length];
    return { text: match[1] + match[2], hue };
  });
}

interface WordProps {
  token: Token;
  progress: MotionValue<number>;
  range: [number, number];
}

function Word({ token, progress, range }: WordProps) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const color = useTransform(progress, range, ["oklch(0.6 0 0)", token.hue === null ? "oklch(0.95 0 0)" : `oklch(0.8 0.18 ${token.hue})`]);
  const blur = useTransform(progress, range, ["blur(3px)", "blur(0px)"]);

  return (
    <motion.span style={{ opacity, color, filter: blur }} className="inline-block">
      {token.text}
    </motion.span>
  );
}

/** Texto que acende palavra por palavra conforme o scroll; palavras-chave pegam uma cor do espectro. */
export function Manifesto() {
  const textRef = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const tokens = useMemo(() => parse(MANIFESTO), []);
  const { scrollYProgress } = useScroll({ target: textRef, offset: ["start 0.85", "end 0.4"] });

  return (
    <SpotlightSection id="manifesto" hue={40} aria-labelledby="manifesto-title" className="overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6 py-32 sm:px-10 sm:py-48">
        {/* Feixe que desce pela lateral junto com a leitura */}
        <motion.span
          aria-hidden
          style={{ scaleY: reduce ? 1 : scrollYProgress }}
          className="absolute left-6 top-32 bottom-32 w-px origin-top bg-gradient-to-b from-white/70 via-[oklch(0.75_0.15_200)] to-[oklch(0.62_0.22_300)] sm:left-10"
        />

        <div className="pl-6 sm:pl-12">
          <h2 id="manifesto-title" className="mb-10 flex items-center gap-3 font-mono text-[10px] font-normal uppercase tracking-[0.35em] text-muted sm:text-xs">
            <span aria-hidden className="spectrum-bg inline-block h-px w-8" />
            Manifesto
          </h2>

          <p
            ref={textRef}
            className="font-heading text-[clamp(1.6rem,3.6vw,3.25rem)] font-medium leading-[1.18] tracking-tight"
          >
            {reduce ? (
              <span className="text-fg">{tokens.map((t) => t.text).join(" ")}</span>
            ) : (
              tokens.map((token, i) => (
                // Espaço de texto real entre as palavras para a linha quebrar normalmente
                <span key={i}>
                  {i > 0 && " "}
                  <Word token={token} progress={scrollYProgress} range={[i / tokens.length, (i + 1) / tokens.length]} />
                </span>
              ))
            )}
          </p>

          <dl className="mt-20 grid gap-8 border-t border-line pt-10 sm:grid-cols-3">
            {FACTS.map((fact, i) => (
              <motion.div
                key={fact.label}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <dt className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">{fact.label}</dt>
                <dd className="mt-2 text-base text-fg sm:text-lg">{fact.value}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </SpotlightSection>
  );
}
