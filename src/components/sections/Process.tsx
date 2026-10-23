import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { PROCESS } from "@/data/site";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

type Stage = (typeof PROCESS)[number];

/** Ilustração de cada etapa; anima quando a etapa está em foco. */
function StageArt({ index, hue, active }: { index: number; hue: number; active: boolean }) {
  const stroke = `oklch(0.8 0.17 ${hue})`;
  const dim = `oklch(0.8 0.17 ${hue} / 0.25)`;
  const on = active ? "on" : "off";

  if (index === 0) {
    // Conversa: dois balões, um "digitando"
    return (
      <svg viewBox="0 0 160 90" className="h-full w-full" aria-hidden>
        <rect x="8" y="10" width="92" height="30" rx="10" fill="none" stroke={dim} strokeWidth="2" />
        <rect x="18" y="20" width="60" height="4" rx="2" fill={dim} />
        <rect x="18" y="28" width="40" height="4" rx="2" fill={dim} />
        <rect x="60" y="50" width="92" height="30" rx="10" fill="none" stroke={stroke} strokeWidth="2" />
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={92 + i * 14}
            cy={65}
            r={4}
            fill={stroke}
            animate={on === "on" ? { opacity: [0.2, 1, 0.2], y: [0, -3, 0] } : { opacity: 0.3, y: 0 }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </svg>
    );
  }
  if (index === 1) {
    // Protótipo: wireframe se desenhando
    const boxes = [
      [8, 8, 144, 14],
      [8, 30, 64, 52],
      [80, 30, 72, 22],
      [80, 60, 72, 22],
    ];
    return (
      <svg viewBox="0 0 160 90" className="h-full w-full" aria-hidden>
        {boxes.map(([x, y, w, h], i) => (
          <motion.rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={h}
            rx="4"
            fill="none"
            stroke={i === 1 ? stroke : dim}
            strokeWidth="2"
            initial={false}
            animate={{ pathLength: active ? 1 : 0.15 }}
            transition={{ duration: 0.9, delay: i * 0.15 }}
          />
        ))}
      </svg>
    );
  }
  if (index === 2) {
    // Construção: linhas de código aparecendo
    const lines = [52, 80, 38, 96, 64, 44];
    return (
      <svg viewBox="0 0 160 90" className="h-full w-full" aria-hidden>
        {lines.map((w, i) => (
          <motion.rect
            key={i}
            x={10 + (i % 3 === 1 ? 12 : 0)}
            y={8 + i * 13}
            height="6"
            rx="3"
            fill={i % 2 ? dim : stroke}
            initial={false}
            animate={{ width: active ? w : 8 }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
          />
        ))}
        <motion.rect
          x="10"
          y="84"
          width="8"
          height="3"
          fill={stroke}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </svg>
    );
  }
  if (index === 3) {
    // Teste: checklist marcando
    return (
      <svg viewBox="0 0 160 90" className="h-full w-full" aria-hidden>
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(10 ${10 + i * 26})`}>
            <rect width="18" height="18" rx="4" fill="none" stroke={dim} strokeWidth="2" />
            <motion.path
              d="M4 9 L8 13 L14 5"
              fill="none"
              stroke={stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={false}
              animate={{ pathLength: active ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.25 }}
            />
            <rect x="28" y="6" width={90 - i * 18} height="6" rx="3" fill={dim} />
          </g>
        ))}
      </svg>
    );
  }
  // No ar: sinal se espalhando
  return (
    <svg viewBox="0 0 160 90" className="h-full w-full" aria-hidden>
      <circle cx="80" cy="45" r="7" fill={stroke} />
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx="80"
          cy="45"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          initial={{ r: 8, opacity: 0.8 }}
          animate={active ? { r: [8, 44], opacity: [0.8, 0] } : { r: 8, opacity: 0.2 }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

function StageCard({ stage, index, active }: { stage: Stage; index: number; active: boolean }) {
  return (
    <article
      className={cn(
        "relative flex h-full w-[min(78vw,30rem)] shrink-0 flex-col rounded-2xl border bg-ink/80 p-6 backdrop-blur-sm transition-[border-color,box-shadow] duration-500 sm:p-8",
        !active && "border-line",
      )}
      style={
        active
          ? { borderColor: `oklch(0.75 0.17 ${stage.hue} / 0.7)`, boxShadow: `0 0 50px -12px oklch(0.7 0.2 ${stage.hue} / 0.55)` }
          : undefined
      }
    >
      <div className="flex items-start justify-between">
        {/* As etapas acontecem nessa ordem, por isso a numeração */}
        <span
          className="font-heading text-6xl font-black leading-none sm:text-7xl"
          style={{ WebkitTextStroke: `1.5px oklch(0.8 0.17 ${stage.hue} / ${active ? 1 : 0.35})`, color: "transparent" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Etapa</span>
      </div>
      <div className="my-6 h-24 sm:h-28">
        <StageArt index={index} hue={stage.hue} active={active} />
      </div>
      <h3 className="font-heading text-2xl font-black uppercase sm:text-3xl" style={{ color: `oklch(0.85 0.15 ${stage.hue})` }}>
        {stage.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-fg/75 sm:text-base">{stage.text}</p>
      <p className="mt-auto pt-6 font-mono text-[11px] uppercase tracking-wider text-muted">
        Entrega <span className="text-fg/85">· {stage.output}</span>
      </p>
    </article>
  );
}

/** As etapas de um projeto num scroll horizontal fixado, com um feixe de luz percorrendo as etapas. */
export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const distance = useMotionValue(0);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform([scrollYProgress, distance], ([p, d]: number[]) => -p * d);
  const photon = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useLayoutEffect(() => {
    const measure = () => {
      setIsMobile(window.innerWidth < 768);
      const track = trackRef.current;
      if (track) distance.set(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [distance, isMobile]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(PROCESS.length - 1, Math.max(0, Math.round(p * (PROCESS.length - 1))));
    setActive((prev) => (prev === next ? prev : next));
  });

  // No celular (ou com movimento reduzido) vira uma lista vertical comum
  if (isMobile || reduce) {
    return (
      <section id="processo" aria-labelledby="processo-title" className="relative scroll-mt-4 px-6 py-28">
        <SectionHeading id="processo-title" eyebrow="Processo" title="Como uma ideia vira sistema" />
        <div className="mt-12 flex flex-col gap-6">
          {PROCESS.map((stage, i) => (
            <motion.div
              key={stage.title}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              onViewportEnter={() => setActive(i)}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <StageCard stage={stage} index={i} active={active === i} />
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="processo"
      aria-labelledby="processo-title"
      className="relative scroll-mt-4"
      style={{ height: `${PROCESS.length * 70 + 60}svh` }}
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="px-10">
          <SectionHeading id="processo-title" eyebrow="Processo" title="Como uma ideia vira sistema" />
        </div>

        <div className="relative mt-10">
          {/* Feixe que atravessa as etapas; o ponto de luz mostra quanto do caminho já foi feito */}
          <div aria-hidden className="absolute inset-x-10 top-0 h-px bg-white/10">
            <motion.div style={{ width: photon }} className="spectrum-bg h-px" />
            <motion.span
              style={{ left: photon }}
              className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_16px_4px_rgb(255_255_255/0.7)]"
            />
          </div>

          <motion.div ref={trackRef} style={{ x }} className="flex h-[min(62svh,30rem)] gap-6 px-10 pt-8 will-change-transform">
            {PROCESS.map((stage, i) => (
              <StageCard key={stage.title} stage={stage} index={i} active={active === i} />
            ))}
            {/* Respiro no fim para o último cartão chegar ao centro */}
            <div aria-hidden className="w-[20vw] shrink-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
