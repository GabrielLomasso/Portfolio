import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { PROJECTS } from "@/data/projects";
import { CONTACT, LOG_LINES, METRICS, PROCESS, SKILL_BANDS } from "@/data/site";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";
import { SpotlightSection } from "./SpotlightSection";

const GREEN = "oklch(0.8 0.18 150)";
const CYAN = "oklch(0.78 0.13 200)";

/* ---------- Métricas com contagem ---------- */

function useCountUp(target: number, run: boolean, duration = 1400) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? target : 0);

  useEffect(() => {
    if (!run || reduce) {
      if (reduce) setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(target * (1 - (1 - p) ** 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, duration, reduce]);

  return value;
}

function Sparkline({ seed, hue }: { seed: number; hue: number }) {
  // Série fixa por métrica, só para dar textura ao tile
  const points = Array.from({ length: 16 }, (_, i) => 14 - (Math.sin(i * 0.9 + seed) * 5 + Math.sin(i * 0.35 + seed * 2) * 4) - i * 0.4);
  const d = points.map((y, i) => `${i === 0 ? "M" : "L"}${(i / 15) * 100} ${y}`).join(" ");
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="mt-3 h-7 w-full" aria-hidden>
      <path d={`${d} L100 28 L0 28 Z`} fill={`oklch(0.75 0.15 ${hue} / 0.15)`} />
      <path d={d} fill="none" stroke={`oklch(0.8 0.15 ${hue})`} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function MetricTile({ metric, index, run }: { metric: (typeof METRICS)[number]; index: number; run: boolean }) {
  const value = useCountUp(metric.value, run);
  const decimals = metric.decimals ?? 0;
  const hue = [150, 200, 95, 300][index % 4];

  return (
    <div className="rounded-2xl border border-line bg-white/[0.02] p-5 lg:col-span-3">
      <p className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {metric.label}
        <span className="size-1.5 rounded-full" style={{ background: `oklch(0.8 0.17 ${hue})`, boxShadow: `0 0 8px oklch(0.8 0.17 ${hue})` }} />
      </p>
      <p className="mt-3 font-heading text-4xl font-black tabular-nums text-fg">
        {value.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        <span className="text-2xl text-muted">{metric.suffix}</span>
      </p>
      <Sparkline seed={index * 1.7} hue={hue} />
    </div>
  );
}

/* ---------- Tráfego ao vivo ---------- */

const CHART_POINTS = 40;

function LiveChart({ live }: { live: boolean }) {
  const reduce = useReducedMotion();
  const [series, setSeries] = useState(() =>
    Array.from({ length: CHART_POINTS }, (_, i) => 40 + Math.sin(i / 4) * 12 + Math.sin(i / 1.7) * 6),
  );

  useEffect(() => {
    if (!live || reduce) return;
    const id = window.setInterval(() => {
      setSeries((s) => {
        const last = s[s.length - 1];
        const next = Math.min(90, Math.max(12, last + (Math.random() - 0.5) * 16));
        return [...s.slice(1), next];
      });
    }, 900);
    return () => window.clearInterval(id);
  }, [live, reduce]);

  const toPath = (close: boolean) => {
    const line = series.map((v, i) => `${i === 0 ? "M" : "L"}${(i / (CHART_POINTS - 1)) * 100} ${100 - v}`).join(" ");
    return close ? `${line} L100 100 L0 100 Z` : line;
  };
  const current = Math.round(series[series.length - 1] * 3.2);

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-white/[0.02] p-5 sm:col-span-2 lg:col-span-8">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Requisições por minuto</p>
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: GREEN }}>
          <span className="size-1.5 animate-pulse rounded-full" style={{ background: GREEN }} />
          Ao vivo
        </p>
      </div>
      <p className="mt-2 font-heading text-3xl font-black tabular-nums text-fg" aria-live="off">
        {current}
        <span className="ml-2 font-mono text-xs font-normal text-muted">req/min</span>
      </p>
      <div className="relative mt-4 h-44 flex-1">
        {/* Grade de fundo */}
        <div aria-hidden className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-px w-full bg-white/5" />
          ))}
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-label="Gráfico de requisições por minuto, atualizado ao vivo" role="img">
          <defs>
            <linearGradient id="live-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.78 0.15 170)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="oklch(0.78 0.15 170)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={toPath(true)} fill="url(#live-fill)" />
          <path d={toPath(false)} fill="none" stroke={GREEN} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        </svg>
        <span
          aria-hidden
          className="absolute right-0 size-2.5 translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ top: `${100 - series[series.length - 1]}%`, background: GREEN, boxShadow: `0 0 12px 3px ${GREEN}` }}
        />
      </div>
    </div>
  );
}

/* ---------- Log rolando ---------- */

interface LogEntry {
  id: number;
  time: string;
  text: string;
  level: "ok" | "info";
}

const timeNow = () => new Date().toLocaleTimeString("pt-BR", { hour12: false });

function LogStream({ live }: { live: boolean }) {
  const reduce = useReducedMotion();
  const counter = useRef(0);
  const [entries, setEntries] = useState<LogEntry[]>(() =>
    LOG_LINES.slice(0, 4).map((text, i) => ({ id: i, time: timeNow(), text, level: i % 3 ? "ok" : "info" })),
  );

  useEffect(() => {
    if (!live || reduce) return;
    counter.current = 4;
    const id = window.setInterval(() => {
      const n = counter.current++;
      setEntries((list) =>
        [...list, { id: n, time: timeNow(), text: LOG_LINES[n % LOG_LINES.length], level: (n % 3 ? "ok" : "info") as LogEntry["level"] }].slice(-7),
      );
    }, 1600);
    return () => window.clearInterval(id);
  }, [live, reduce]);

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-black/60 p-5 sm:col-span-2 lg:col-span-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Log</p>
      <ul className="mt-3 flex flex-1 flex-col justify-end gap-1.5 overflow-hidden font-mono text-[11px] leading-snug">
        {entries.map((entry) => (
          <motion.li key={entry.id} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
            <span className="shrink-0 text-muted/70">{entry.time}</span>
            <span className="shrink-0" style={{ color: entry.level === "ok" ? GREEN : CYAN }}>
              [{entry.level}]
            </span>
            <span className="text-fg/80">{entry.text}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Terminal interativo ---------- */

interface Line {
  kind: "in" | "out" | "accent";
  text: string;
}

const PROMPT = "visitante@fajardo:~$";

const PRISM_ART = [
  "        /\\",
  "       /  \\",
  "  ----/----\\====",
  "     /      \\ ≡≡≡",
  "    /________\\",
];

function runCommand(raw: string): Line[] | "clear" {
  const [cmd, ...args] = raw.trim().split(/\s+/);
  const visible = PROJECTS.filter((p) => !p.hidden);
  switch ((cmd ?? "").toLowerCase()) {
    case "":
      return [];
    case "ajuda":
    case "help":
      return [
        { kind: "out", text: "comandos: sobre, projetos, stack, processo, contato, data, eco <texto>, limpar" },
        { kind: "out", text: "tem mais um escondido, inspirado num disco de 1973." },
      ];
    case "sobre":
      return [{ kind: "out", text: "Gabriel Fajardo, Belo Horizonte. Sites e sistemas web, do protótipo ao ar." }];
    case "projetos":
      return visible.map((p) => ({ kind: "out" as const, text: `· ${p.name.padEnd(18)} ${p.kind}` }));
    case "stack":
      return SKILL_BANDS.map((b) => ({ kind: "out" as const, text: `· ${b.label.padEnd(16)} ${b.tools.slice(0, 3).join(", ")}` }));
    case "processo":
      return PROCESS.map((s, i) => ({ kind: "out" as const, text: `${i + 1}. ${s.title} → ${s.output}` }));
    case "contato":
      return [
        { kind: "out", text: `e-mail:   ${CONTACT.email}` },
        { kind: "out", text: `whatsapp: wa.me/${CONTACT.whatsapp}` },
      ];
    case "data":
      return [{ kind: "out", text: new Date().toLocaleString("pt-BR", { timeZone: CONTACT.timeZone }) }];
    case "eco":
    case "echo":
      return [{ kind: "out", text: args.join(" ") }];
    case "limpar":
    case "clear":
      return "clear";
    case "sudo":
      return args.join(" ").toLowerCase().startsWith("contratar")
        ? [{ kind: "accent", text: "permissão concedida. role até o contato e me chame." }]
        : [{ kind: "out", text: "sudo: tente 'sudo contratar'" }];
    case "pinkfloyd":
    case "prisma":
      return [...PRISM_ART.map((text) => ({ kind: "accent" as const, text })), { kind: "out", text: "the dark side of the code." }];
    default:
      return [{ kind: "out", text: `comando não encontrado: ${cmd}. digite 'ajuda'.` }];
  }
}

function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: "fajardo-os 1.0 · digite 'ajuda' para ver os comandos" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const result = runCommand(input);
    if (result === "clear") setLines([]);
    else setLines((l) => [...l, { kind: "in", text: input }, ...result]);
    if (input.trim()) setHistory((h) => [...h, input]);
    setCursor(-1);
    setInput("");
  };

  // Setas para cima/baixo percorrem o histórico, como num terminal de verdade
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const next = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setInput(history[next]);
    } else if (e.key === "ArrowDown" && cursor >= 0) {
      e.preventDefault();
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(-1);
        setInput("");
      } else {
        setCursor(next);
        setInput(history[next]);
      }
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-black sm:col-span-2 lg:col-span-12" onClick={() => inputRef.current?.focus()}>
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[oklch(0.65_0.2_25)]" />
        <span className="size-2.5 rounded-full bg-[oklch(0.82_0.16_85)]" />
        <span className="size-2.5 rounded-full bg-[oklch(0.75_0.17_150)]" />
        <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Terminal</span>
        <span className="ml-auto hidden font-mono text-[10px] text-muted sm:inline">tente: projetos · stack · sudo contratar</span>
      </div>
      <div ref={scrollRef} className="h-64 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed sm:text-[13px]" role="log" aria-live="polite">
        {lines.map((line, i) => (
          <p key={i} className={cn("whitespace-pre-wrap", line.kind === "in" ? "text-fg" : line.kind === "accent" ? "" : "text-fg/65")} style={line.kind === "accent" ? { color: GREEN } : undefined}>
            {line.kind === "in" && <span style={{ color: CYAN }}>{PROMPT} </span>}
            {line.text}
          </p>
        ))}
        <form onSubmit={submit} className="flex items-center gap-2">
          <label htmlFor="terminal-input" style={{ color: CYAN }}>
            {PROMPT}
          </label>
          <input
            id="terminal-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-fg caret-[oklch(0.8_0.18_150)] outline-none"
          />
        </form>
      </div>
    </div>
  );
}

/** Painel no estilo de monitoramento de um sistema em produção, com um terminal que aceita comandos. */
export function SystemPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });

  return (
    <SpotlightSection id="painel" hue={160} aria-labelledby="painel-title">
      <div className="mx-auto max-w-6xl px-6 py-28 sm:px-10 sm:py-40">
        <SectionHeading
          id="painel-title"
          eyebrow="Em produção"
          title="Painel do sistema"
          intro="No estilo dos painéis que eu monto para os clientes: números do mês, tráfego ao vivo e o log do que está acontecendo. E um terminal, para quem gosta de digitar."
        />

        <div ref={ref} className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {METRICS.map((metric, i) => (
            <MetricTile key={metric.label} metric={metric} index={i} run={inView} />
          ))}
          <LiveChart live={inView} />
          <LogStream live={inView} />
          <Terminal />
        </div>
      </div>
    </SpotlightSection>
  );
}
