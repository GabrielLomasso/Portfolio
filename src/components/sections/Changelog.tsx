import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import changelog from "@/data/changelog.json";
import { SectionHeading } from "./SectionHeading";
import { SpotlightSection } from "./SpotlightSection";

interface Commit {
  hash: string;
  date: string;
  subject: string;
  tags: string[];
}

const COMMITS = changelog.commits as Commit[];
const INITIAL = 8;

const formatDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

/** O histórico real do Git deste site, num grafo vertical que se desenha com o scroll. */
export function Changelog() {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  // A linha começa com altura zero e não seria detectada na tela; quem dispara é a lista
  const listRef = useRef<HTMLOListElement>(null);
  const listInView = useInView(listRef, { once: true, margin: "-10% 0px" });
  const visible = expanded ? COMMITS : COMMITS.slice(0, INITIAL);
  const days = new Set(COMMITS.map((c) => c.date)).size;

  return (
    <SpotlightSection id="historico" hue={250} aria-labelledby="historico-title">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-28 sm:px-10 sm:py-40 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            id="historico-title"
            eyebrow="Histórico"
            title="Este site, commit a commit"
            intro="O histórico real do Git deste portfólio, gerado a partir do repositório. Mudanças pequenas e descritas, do jeito que eu trabalho nos projetos dos clientes."
          />
          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-6">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Commits</dt>
              <dd className="mt-2 font-heading text-4xl font-black text-fg">{COMMITS.length}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Dias de trabalho</dt>
              <dd className="mt-2 font-heading text-4xl font-black text-fg">{days}</dd>
            </div>
          </dl>
        </div>

        <div>
          <ol ref={listRef} className="relative">
            {/* Linha do grafo, que se desenha quando a lista entra na tela */}
            <motion.span
              aria-hidden
              className="absolute left-[7px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-[oklch(0.68_0.22_25)] via-[oklch(0.75_0.14_200)] to-[oklch(0.62_0.22_300)]"
              initial={reduce ? false : { scaleY: 0 }}
              animate={{ scaleY: reduce || listInView ? 1 : 0 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
            <AnimatePresence initial={false}>
              {visible.map((commit, i) => {
                const hue = 25 + (i / Math.max(1, COMMITS.length - 1)) * 275;
                return (
                  <motion.li
                    key={commit.hash}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-5% 0px" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.45, delay: Math.min(i, INITIAL) * 0.04 }}
                    className="relative grid grid-cols-[1rem_1fr] gap-4 pb-6"
                  >
                    <span
                      aria-hidden
                      className="relative z-10 mt-1.5 size-[15px] rounded-full border-2 bg-black"
                      style={{ borderColor: `oklch(0.75 0.17 ${hue})`, boxShadow: i === 0 ? `0 0 14px oklch(0.75 0.2 ${hue})` : undefined }}
                    />
                    <div>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
                        <span style={{ color: `oklch(0.78 0.15 ${hue})` }}>{commit.hash}</span>
                        <time dateTime={commit.date}>{formatDate(commit.date)}</time>
                        {i === 0 && <span className="rounded-full border border-white/15 px-2 py-0.5 text-[9px] uppercase tracking-wider text-fg/80">mais recente</span>}
                        {commit.tags.map((tag) => (
                          <span key={tag} className="spectrum-bg rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider text-black">
                            {tag}
                          </span>
                        ))}
                      </p>
                      <p className="mt-1 text-sm leading-snug text-fg/85 sm:text-base">{commit.subject}</p>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>

          {COMMITS.length > INITIAL && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="ml-8 rounded-full border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-fg/85 transition-colors hover:border-white/40"
            >
              {expanded ? "Mostrar menos" : `Mostrar os ${COMMITS.length} commits`}
            </button>
          )}
        </div>
      </div>
    </SpotlightSection>
  );
}
