import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SKILL_BANDS } from "@/data/site";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";
import { SpotlightSection } from "./SpotlightSection";

const BAR_STEP = 12; // px entre o início de uma barra e da próxima
const AUTO_CYCLE_MS = 3200;

/**
 * Habilidades como um analisador de espectro de áudio: cada faixa de frequência é
 * uma área. As barras pulsam sozinhas, sobem perto do cursor e a faixa ativa acende.
 */
export function SkillSpectrum() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const [sound, setSound] = useState(false);
  const audio = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null);

  // Estado do desenho fica em refs para o loop não depender de re-render
  const pointerX = useRef<number | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const drawRef = useRef<((time: number) => void) | null>(null);

  // Sem interação, a faixa ativa vai passando sozinha
  useEffect(() => {
    if (interacted || reduce) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % SKILL_BANDS.length), AUTO_CYCLE_MS);
    return () => window.clearInterval(id);
  }, [interacted, reduce]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let peaks: number[] = [];
    let raf = 0;
    let visible = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      peaks = new Array(Math.ceil(width / BAR_STEP)).fill(0);
    };

    const draw = (time: number) => {
      const t = time / 1000;
      const count = peaks.length;
      const barW = BAR_STEP - 4;
      const floor = height * 0.72; // linha de base; abaixo dela vai o reflexo
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < count; i++) {
        const x = i * BAR_STEP + 2;
        const u = i / Math.max(1, count - 1);
        const bandIndex = Math.min(SKILL_BANDS.length - 1, Math.floor(u * SKILL_BANDS.length));
        const band = SKILL_BANDS[bandIndex];
        const isActive = bandIndex === activeRef.current;

        // Pulso "musical": soma de senos com fases diferentes por barra
        const pulse = reduce
          ? 0.85
          : 0.55 + 0.25 * Math.sin(t * 2.1 + i * 0.45) + 0.2 * Math.sin(t * 3.7 + i * 1.3 + bandIndex);
        let level = band.level * pulse;

        // O cursor funciona como uma frequência tocando mais alto naquele ponto
        if (pointerX.current !== null) {
          const d = (x - pointerX.current) / 90;
          level += 0.35 * Math.exp(-d * d);
        }
        level = Math.min(1, level * (isActive ? 1 : 0.62));

        const barH = Math.max(4, level * floor * 0.95);
        const hue = 25 + u * 275;
        const light = isActive ? 0.78 : 0.5;
        const chroma = isActive ? 0.19 : 0.1;

        ctx.fillStyle = `oklch(${light} ${chroma} ${hue})`;
        ctx.shadowColor = isActive ? `oklch(0.75 0.2 ${hue} / 0.8)` : "transparent";
        ctx.shadowBlur = isActive ? 14 : 0;
        ctx.fillRect(x, floor - barH, barW, barH);

        // Pico que cai devagar, como nos analisadores de som
        peaks[i] = Math.max(barH, peaks[i] - (reduce ? 0 : 0.9));
        ctx.shadowBlur = 0;
        ctx.fillStyle = `oklch(0.92 ${chroma} ${hue} / ${isActive ? 0.9 : 0.4})`;
        ctx.fillRect(x, floor - peaks[i] - 6, barW, 2);

        // Reflexo apagado abaixo da linha de base
        ctx.fillStyle = `oklch(${light} ${chroma} ${hue} / 0.12)`;
        ctx.fillRect(x, floor + 4, barW, barH * 0.35);
      }
    };

    const loop = (time: number) => {
      draw(time);
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    };

    // Só anima enquanto a seção aparece na tela
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    });

    drawRef.current = draw;
    resize();
    draw(0);
    io.observe(wrap);
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [reduce]);

  // Com movimento reduzido o loop não roda; redesenha quando a faixa ativa muda
  useEffect(() => {
    if (reduce) drawRef.current?.(0);
  }, [active, reduce]);

  // Som opcional: o analisador vira um teremim (grave à esquerda, agudo à direita).
  // O AudioContext só nasce no clique do botão, como os navegadores exigem.
  const toggleSound = () => {
    if (audio.current) {
      audio.current.ctx.close();
      audio.current = null;
      setSound(false);
      return;
    }
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    filter.type = "lowpass";
    filter.frequency.value = 1400;
    gain.gain.value = 0;
    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start();
    audio.current = { ctx, osc, gain };
    setSound(true);
  };

  useEffect(() => () => void audio.current?.ctx.close(), []);

  const silence = () => {
    pointerX.current = null;
    const a = audio.current;
    if (a) a.gain.gain.setTargetAtTime(0, a.ctx.currentTime, 0.08);
  };

  const selectFromPointer = (clientX: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = clientX - rect.left;
    pointerX.current = x;
    const a = audio.current;
    if (a) {
      const frequency = 110 * 2 ** ((x / rect.width) * 4);
      a.osc.frequency.setTargetAtTime(frequency, a.ctx.currentTime, 0.03);
      a.gain.gain.setTargetAtTime(0.05, a.ctx.currentTime, 0.05);
    }
    const index = Math.min(SKILL_BANDS.length - 1, Math.max(0, Math.floor((x / rect.width) * SKILL_BANDS.length)));
    setInteracted(true);
    setActive(index);
  };

  const band = SKILL_BANDS[active];

  return (
    <SpotlightSection id="habilidades" hue={band.hue} aria-labelledby="habilidades-title" className="overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-28 sm:px-10 sm:py-40">
        <SectionHeading
          id="habilidades-title"
          eyebrow="Habilidades"
          title="Espectro de habilidades"
          intro="Cada faixa do analisador é uma área do que eu faço. Passe o mouse (ou toque) nas barras para ouvir uma de cada vez; com o som ligado, o analisador vira um instrumento."
        />

        <div className="mt-14 rounded-2xl border border-line bg-white/[0.015] p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
            <span className="flex items-center gap-2">
              <span className="size-1.5 animate-pulse rounded-full" style={{ background: `oklch(0.8 0.2 ${band.hue})` }} />
              Analisador
            </span>
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={sound}
              className="flex items-center gap-2 rounded-full border border-white/10 px-2.5 py-1 tracking-[0.2em] transition-colors hover:border-white/30 hover:text-fg"
            >
              <span aria-hidden className="flex h-2.5 items-end gap-px">
                {[0.4, 1, 0.65].map((h, i) => (
                  <span key={i} className="w-px bg-current" style={{ height: sound ? `${h * 100}%` : "30%" }} />
                ))}
              </span>
              {sound ? "Som ligado" : "Ligar som"}
            </button>
          </div>

          <div
            ref={wrapRef}
            className="relative h-56 w-full cursor-crosshair touch-none sm:h-72"
            onPointerMove={(e) => selectFromPointer(e.clientX)}
            onPointerDown={(e) => selectFromPointer(e.clientX)}
            onPointerLeave={silence}
            onPointerUp={(e) => e.pointerType !== "mouse" && silence()}
            aria-hidden
          >
            <canvas ref={canvasRef} className="absolute inset-0" />
          </div>

          {/* Rótulos das faixas, alinhados embaixo de cada uma; também servem de controle pelo teclado */}
          <div role="tablist" aria-label="Áreas de habilidade" className="mt-3 grid grid-cols-3 gap-y-2 sm:grid-cols-6">
            {SKILL_BANDS.map((b, i) => (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-controls="habilidades-painel"
                onClick={() => {
                  setInteracted(true);
                  setActive(i);
                }}
                className={cn(
                  "border-t-2 px-1 pt-2 text-left font-mono text-[10px] uppercase tracking-wider transition-colors sm:text-[11px]",
                  i === active ? "text-fg" : "border-transparent text-muted hover:text-fg/80",
                )}
                style={{ borderColor: i === active ? `oklch(0.78 0.19 ${b.hue})` : undefined }}
              >
                {/* Amostra da cor da faixa: no celular os rótulos quebram em duas linhas e saem de baixo das barras */}
                <span aria-hidden className="mr-1.5 inline-block size-1.5 rounded-full align-middle" style={{ background: `oklch(0.75 0.17 ${b.hue})` }} />
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div id="habilidades-painel" role="tabpanel" aria-live="polite" className="relative mt-8 min-h-40">
          <AnimatePresence mode="wait">
            <motion.div
              key={band.id}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-6 sm:grid-cols-[1fr_1.3fr] sm:gap-12"
            >
              <div>
                <p className="font-heading text-3xl font-black uppercase sm:text-4xl" style={{ color: `oklch(0.82 0.17 ${band.hue})` }}>
                  {band.label}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-fg/75 sm:text-base">{band.summary}</p>
              </div>
              <ul className="flex flex-wrap content-start gap-2">
                {band.tools.map((tool, i) => (
                  <motion.li
                    key={tool}
                    initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i }}
                    className="rounded-full border px-3 py-1.5 font-mono text-[11px] text-fg/85"
                    style={{ borderColor: `oklch(0.7 0.15 ${band.hue} / 0.45)`, background: `oklch(0.7 0.15 ${band.hue} / 0.07)` }}
                  >
                    {tool}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SpotlightSection>
  );
}
