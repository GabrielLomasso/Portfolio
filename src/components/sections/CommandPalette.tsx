import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { CONTACT } from "@/data/site";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

const goTo = (id: string) => () => {
  if (id === "topo") window.scrollTo({ top: 0, behavior: "smooth" });
  else document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

/** Paleta de comandos (Ctrl+K ou ⌘K) para pular entre seções e fazer ações rápidas. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(
    () => [
      { id: "topo", label: "Voltar ao início", hint: "Seção", run: goTo("topo") },
      { id: "manifesto", label: "Manifesto", hint: "Seção", run: goTo("manifesto") },
      { id: "habilidades", label: "Espectro de habilidades", hint: "Seção", run: goTo("habilidades") },
      { id: "processo", label: "Processo", hint: "Seção", run: goTo("processo") },
      { id: "rascunho", label: "Do rascunho ao ar", hint: "Seção", run: goTo("rascunho") },
      { id: "laboratorio", label: "Laboratório", hint: "Seção", run: goTo("laboratorio") },
      { id: "painel", label: "Painel do sistema", hint: "Seção", run: goTo("painel") },
      { id: "trajetoria", label: "Lado A, lado B", hint: "Seção", run: goTo("trajetoria") },
      { id: "historico", label: "Este site, commit a commit", hint: "Seção", run: goTo("historico") },
      { id: "perguntas", label: "Perguntas frequentes", hint: "Seção", run: goTo("perguntas") },
      { id: "contato", label: "Contato", hint: "Seção", run: goTo("contato") },
      {
        id: "copiar-email",
        label: "Copiar e-mail",
        hint: "Ação",
        run: () => {
          navigator.clipboard
            .writeText(CONTACT.email)
            .then(() => setFeedback("E-mail copiado"))
            .catch(() => setFeedback("Não deu para copiar"));
        },
      },
      { id: "whatsapp", label: "Abrir o WhatsApp", hint: "Ação", run: () => window.open(`https://wa.me/${CONTACT.whatsapp}`, "_blank", "noopener") },
    ],
    [],
  );

  // Seções que ainda não existem na página saem da lista
  const available = commands.filter((c) => c.hint !== "Seção" || c.id === "topo" || document.getElementById(c.id));
  const filtered = available.filter((c) => c.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!feedback) return;
    const id = window.setTimeout(() => setFeedback(null), 1800);
    return () => window.clearTimeout(id);
  }, [feedback]);

  const execute = (command: Command | undefined) => {
    if (!command) return;
    setOpen(false);
    command.run();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      execute(filtered[index]);
    }
  };

  return (
    <>
      {/* Só aparece depois da abertura do hero, que começa com a tela toda preta */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 6.4 }}
        className="fixed bottom-5 left-5 z-50 hidden items-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted backdrop-blur transition-colors hover:border-white/30 hover:text-fg md:flex"
        aria-label="Abrir a paleta de comandos"
      >
        <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-[9px]">Ctrl</kbd>
        <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-[9px]">K</kbd>
        Navegar
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 px-4 pt-[18vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Paleta de comandos"
              className="prism-border w-full max-w-lg overflow-hidden rounded-2xl bg-ink shadow-2xl"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Para onde você quer ir?"
                aria-label="Buscar seção ou ação"
                aria-controls="paleta-lista"
                aria-activedescendant={filtered[index] ? `cmd-${filtered[index].id}` : undefined}
                className="w-full border-b border-line bg-transparent px-5 py-4 text-sm text-fg outline-none placeholder:text-muted"
              />
              <ul id="paleta-lista" role="listbox" className="max-h-80 overflow-y-auto p-2">
                {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">Nada com esse nome. Tente "contato".</li>}
                {filtered.map((command, i) => (
                  <li
                    key={command.id}
                    id={`cmd-${command.id}`}
                    role="option"
                    aria-selected={i === index}
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => execute(command)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm",
                      i === index ? "bg-white/[0.06] text-fg" : "text-fg/70",
                    )}
                  >
                    {command.label}
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{command.hint}</span>
                  </li>
                ))}
              </ul>
              <p className="flex gap-4 border-t border-line px-5 py-2.5 font-mono text-[10px] text-muted">
                <span>↑↓ escolher</span>
                <span>Enter abrir</span>
                <span>Esc fechar</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center">
        <AnimatePresence>
          {feedback && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="rounded-full border border-white/15 bg-ink px-4 py-2 font-mono text-xs text-fg shadow-xl"
            >
              {feedback}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
