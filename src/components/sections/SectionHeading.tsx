import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  className?: string;
  align?: "left" | "center";
}

/** Cabeçalho das seções novas: rótulo em mono, título em Tektur com as letras surgindo da luz. */
export function SectionHeading({ id, eyebrow, title, intro, className, align = "left" }: SectionHeadingProps) {
  const reduce = useReducedMotion();
  const words = title.split(" ");

  return (
    <header className={cn("relative z-10 max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <p className="mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.35em] text-muted sm:text-xs">
        <span aria-hidden className="spectrum-bg inline-block h-px w-8" />
        {eyebrow}
      </p>
      <h2
        id={id}
        aria-label={title}
        className="font-heading text-[clamp(2rem,6vw,4.5rem)] font-black uppercase leading-[0.95] tracking-tight text-fg"
      >
        {words.map((word, w) => (
          // Espaço de texto real entre as palavras para a linha poder quebrar
          <span key={w} aria-hidden>
            {w > 0 && " "}
            <span className="inline-block whitespace-nowrap">
              {[...word].map((char, c) => (
                <motion.span
                  key={c}
                  className="inline-block"
                  initial={reduce ? false : { opacity: 0, y: "0.4em", filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.6, delay: (w * 4 + c) * 0.025, ease: [0.22, 1, 0.36, 1] }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </span>
        ))}
      </h2>
      {intro && (
        <p className={cn("mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base", align === "center" && "mx-auto")}>
          {intro}
        </p>
      )}
    </header>
  );
}
