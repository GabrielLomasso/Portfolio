import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useState, type FormEvent } from "react";
import { CONTACT } from "@/data/site";
import { cn } from "@/lib/utils";
import { SpotlightSection } from "./SpotlightSection";

const KINDS = ["Site", "Sistema", "Landing page", "PWA", "Outro"];

const formatTime = (timeZone: string) =>
  new Date().toLocaleTimeString("pt-BR", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit" });

function useClock(timeZone: string) {
  const [time, setTime] = useState(() => formatTime(timeZone));
  useEffect(() => {
    const id = window.setInterval(() => setTime(formatTime(timeZone)), 1000);
    return () => window.clearInterval(id);
  }, [timeZone]);
  return time;
}

/** Botão que copia o e-mail e mostra a confirmação no próprio lugar. */
function CopyEmail() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${CONTACT.email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="group flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4 text-left transition-colors hover:border-white/30"
    >
      <span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-muted">E-mail</span>
        <span className="mt-1 block break-all text-base text-fg sm:text-lg">{CONTACT.email}</span>
      </span>
      <span aria-live="polite" className="shrink-0 font-mono text-[11px] uppercase tracking-wider">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "ok" : "copy"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={copied ? "text-[oklch(0.8_0.18_150)]" : "text-muted group-hover:text-fg"}
          >
            {copied ? "Copiado" : "Copiar"}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}

interface Errors {
  name?: string;
  message?: string;
}

/** Formulário que valida e monta a mensagem para o WhatsApp; nada é enviado para outro lugar. */
function ProjectForm() {
  const id = useId();
  const reduce = useReducedMotion();
  const [name, setName] = useState("");
  const [kind, setKind] = useState(KINDS[0]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const validate = (): Errors => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Escreva seu nome para eu saber com quem falo.";
    if (message.trim().length < 20) next.message = "Conte um pouco mais: pelo menos 20 caracteres sobre o projeto.";
    return next;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    const text = `Olá, Gabriel! Sou ${name.trim()} e tenho um projeto de ${kind.toLowerCase()}.\n\n${message.trim()}`;
    window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    setSent(true);
  };

  const field = "w-full rounded-lg border bg-black/60 px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-muted/60 focus:border-white/40";

  return (
    <form onSubmit={submit} noValidate className="prism-border rounded-2xl bg-ink p-6 sm:p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Me conta do projeto</p>

      <div className="mt-6 flex flex-col gap-5">
        <div>
          <label htmlFor={`${id}-name`} className="mb-2 block text-sm text-fg/85">
            Seu nome
          </label>
          <input
            id={`${id}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            placeholder="Como posso te chamar?"
            className={cn(field, errors.name ? "border-[oklch(0.65_0.22_25)]" : "border-white/10")}
          />
          {errors.name && (
            <p id={`${id}-name-error`} className="mt-1.5 text-xs text-[oklch(0.75_0.17_25)]">
              {errors.name}
            </p>
          )}
        </div>

        <fieldset>
          <legend className="mb-2 block text-sm text-fg/85">O que você precisa</legend>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k, i) => (
              <label
                key={k}
                className={cn(
                  "cursor-pointer rounded-full border px-3.5 py-1.5 font-mono text-[11px] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-white",
                  kind === k ? "text-black" : "border-white/15 text-fg/75 hover:border-white/35",
                )}
                style={kind === k ? { background: `oklch(0.8 0.15 ${25 + i * 68})`, borderColor: "transparent" } : undefined}
              >
                <input type="radio" name={`${id}-kind`} value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
                {k}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor={`${id}-message`} className="mb-2 flex justify-between text-sm text-fg/85">
            Sobre o projeto
            <span className="font-mono text-[10px] text-muted">{message.trim().length}/20+</span>
          </label>
          <textarea
            id={`${id}-message`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? `${id}-message-error` : undefined}
            placeholder="O que é, pra quem é e pra quando você precisa."
            className={cn(field, "resize-none", errors.message ? "border-[oklch(0.65_0.22_25)]" : "border-white/10")}
          />
          {errors.message && (
            <p id={`${id}-message-error`} className="mt-1.5 text-xs text-[oklch(0.75_0.17_25)]">
              {errors.message}
            </p>
          )}
        </div>

        <motion.button
          type="submit"
          whileTap={reduce ? undefined : { scale: 0.98 }}
          className="group relative overflow-hidden rounded-xl bg-fg px-6 py-4 font-mono text-xs uppercase tracking-[0.25em] text-black"
        >
          {/* Faixa de espectro que atravessa o botão no hover */}
          <span aria-hidden className="spectrum-bg absolute inset-y-0 -left-full w-full opacity-80 transition-transform duration-700 ease-out group-hover:translate-x-[200%]" />
          <span className="relative">{sent ? "Abri o WhatsApp para você" : "Enviar pelo WhatsApp"}</span>
        </motion.button>
        <p className="text-center text-[11px] text-muted">A mensagem abre pronta no WhatsApp. Nada é guardado neste site.</p>
      </div>
    </form>
  );
}

/** Contato: chamada grande, e-mail que copia, relógio de BH e o formulário. */
export function Contact() {
  const time = useClock(CONTACT.timeZone);
  const reduce = useReducedMotion();

  return (
    <SpotlightSection id="contato" hue={300} aria-labelledby="contato-title" className="overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-28 sm:px-10 sm:py-40">
        <p className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.35em] text-muted sm:text-xs">
          <span aria-hidden className="spectrum-bg inline-block h-px w-8" />
          Contato
        </p>
        <motion.h2
          id="contato-title"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl font-heading text-[clamp(2.4rem,7vw,6rem)] font-black uppercase leading-[0.92] tracking-tight text-fg"
        >
          Tem um projeto? Vamos passar ele pelo <span className="spectrum-text">prisma</span>.
        </motion.h2>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div className="flex flex-col gap-4">
            <CopyEmail />
            <a
              href={`https://wa.me/${CONTACT.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4 transition-colors hover:border-[oklch(0.75_0.17_150/0.6)]"
            >
              <span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-muted">WhatsApp</span>
                <span className="mt-1 block text-base text-fg sm:text-lg">Conversar agora</span>
              </span>
              <span aria-hidden className="text-xl text-muted">↗</span>
            </a>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Agora em {CONTACT.city}</p>
                <p className="mt-2 font-heading text-3xl font-black tabular-nums text-fg">{time}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Disponibilidade</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-fg/85">
                  <span className="size-2 animate-pulse rounded-full bg-[oklch(0.8_0.18_150)]" />
                  {CONTACT.responseTime}
                </p>
              </div>
            </div>

            <ul className="mt-4 flex gap-6">
              {CONTACT.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative font-mono text-xs uppercase tracking-[0.25em] text-fg/80 hover:text-fg"
                  >
                    {link.label}
                    <span aria-hidden className="spectrum-bg absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <ProjectForm />
        </div>
      </div>
    </SpotlightSection>
  );
}
