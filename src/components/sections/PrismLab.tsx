import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { deviation, norm, refractiveIndex, sub, traceRay, WAVELENGTHS, type Vec } from "@/lib/optics";
import { SectionHeading } from "./SectionHeading";
import { SpotlightSection } from "./SpotlightSection";

const CAUCHY_A = 1.5;

interface Readout {
  incidence: number;
  red: number | null;
  violet: number | null;
  reflections: number;
  hit: boolean;
}

/** Triângulo equilátero centralizado no canvas. */
function prismFor(w: number, h: number): Vec[] {
  const side = Math.min(w * 0.36, h * 0.72);
  const tall = (side * Math.sqrt(3)) / 2;
  const cx = w * 0.5;
  const cy = h * 0.55;
  return [
    { x: cx, y: cy - (2 * tall) / 3 },
    { x: cx + side / 2, y: cy + tall / 3 },
    { x: cx - side / 2, y: cy + tall / 3 },
  ];
}

function inside(p: Vec, tri: Vec[]) {
  const s = (a: Vec, b: Vec, c: Vec) => (a.x - c.x) * (b.y - c.y) - (b.x - c.x) * (a.y - c.y);
  const d1 = s(p, tri[0], tri[1]);
  const d2 = s(p, tri[1], tri[2]);
  const d3 = s(p, tri[2], tri[0]);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}

/**
 * Prisma com física de verdade: cada comprimento de onda refrata com o próprio
 * índice (Cauchy) pela lei de Snell, e ângulos extremos geram reflexão interna total.
 */
export function PrismLab() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  // Posição da lanterna em fração do canvas, para sobreviver a resize
  const [source, setSource] = useState({ x: 0.12, y: 0.66 });
  const [dispersion, setDispersion] = useState(0.028);
  const [aim, setAim] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const [readout, setReadout] = useState<Readout>({ incidence: 0, red: null, violet: null, reflections: 0, hit: false });
  const dragging = useRef(false);
  const size = useRef({ w: 0, h: 0 });
  const lastReadout = useRef("");

  const draw = useCallback(
    (src: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const { w, h } = size.current;
      ctx.clearRect(0, 0, w, h);

      const tri = prismFor(w, h);
      // Mira no meio da face esquerda: vindo de baixo, o feixe entra perto do ângulo
      // de desvio mínimo e o espectro abre pela face direita, como na capa do disco
      const target = { x: (tri[0].x + tri[2].x) / 2, y: (tri[0].y + tri[2].y) / 2 };
      const p = { x: src.x * w, y: src.y * h };
      const base = norm(sub(target, p));
      const a = (aim * Math.PI) / 180;
      const dir = norm({ x: base.x * Math.cos(a) - base.y * Math.sin(a), y: base.x * Math.sin(a) + base.y * Math.cos(a) });

      // Grade de fundo
      ctx.strokeStyle = "rgb(255 255 255 / 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const paths = WAVELENGTHS.map((wl) => ({ wl, path: traceRay(p, dir, tri, refractiveIndex(wl.nm, CAUCHY_A, dispersion)) }));
      const entry = paths[0].path.entry;
      const far = 4000;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      // Feixe branco até o prisma (ou até a borda, se errar)
      const beamEnd = entry ?? { x: p.x + dir.x * far, y: p.y + dir.y * far };
      for (const [width, alpha] of [
        [10, 0.08],
        [4, 0.25],
        [1.6, 1],
      ]) {
        ctx.strokeStyle = `rgb(255 255 255 / ${alpha})`;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(beamEnd.x, beamEnd.y);
        ctx.stroke();
      }

      for (const { wl, path } of paths) {
        if (path.inside.length > 1) {
          ctx.strokeStyle = `oklch(0.8 0.15 ${wl.hue} / 0.35)`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          path.inside.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
          ctx.stroke();
        }
        if (path.exit) {
          const end = { x: path.exit.point.x + path.exit.dir.x * far, y: path.exit.point.y + path.exit.dir.y * far };
          for (const [width, alpha] of [
            [9, 0.1],
            [2.6, 0.95],
          ]) {
            ctx.strokeStyle = `oklch(0.75 0.2 ${wl.hue} / ${alpha})`;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(path.exit.point.x, path.exit.point.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // Prisma por cima, como vidro
      ctx.beginPath();
      ctx.moveTo(tri[0].x, tri[0].y);
      ctx.lineTo(tri[1].x, tri[1].y);
      ctx.lineTo(tri[2].x, tri[2].y);
      ctx.closePath();
      ctx.fillStyle = "rgb(255 255 255 / 0.035)";
      ctx.fill();
      ctx.shadowColor = "rgb(255 255 255 / 0.6)";
      ctx.shadowBlur = 12;
      ctx.strokeStyle = "rgb(255 255 255 / 0.85)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Lanterna
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "rgb(255 255 255 / 0.9)";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgb(255 255 255 / 0.35)";
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const redExit = paths[0].path.exit;
      const violetExit = paths[paths.length - 1].path.exit;
      const red = redExit ? deviation(dir, redExit.dir) : null;
      const violet = violetExit ? deviation(dir, violetExit.dir) : null;
      const next: Readout = {
        incidence: paths[0].path.incidence,
        red,
        violet,
        reflections: Math.max(...paths.map((x) => x.path.reflections)),
        hit: Boolean(entry),
      };
      // Só re-renderiza quando o valor exibido muda (o desenho roda a cada quadro)
      const key = [next.incidence, next.red ?? -1, next.violet ?? -1].map((v) => v.toFixed(1)).join("|") + next.reflections + next.hit;
      if (key !== lastReadout.current) {
        lastReadout.current = key;
        setReadout(next);
      }
    },
    [aim, dispersion],
  );

  // Tamanho do canvas acompanha o contêiner
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      size.current = { w, h };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(source);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [draw, source]);

  // Antes de alguém mexer, a lanterna sobe e desce devagar para mostrar o efeito
  useEffect(() => {
    if (interacted || reduce) return;
    const wrap = wrapRef.current;
    let raf = 0;
    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    });
    const loop = (t: number) => {
      draw({ x: 0.12, y: 0.66 + Math.sin(t / 1400) * 0.12 });
      if (visible) raf = requestAnimationFrame(loop);
    };
    if (wrap) io.observe(wrap);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [interacted, reduce, draw]);

  const moveTo = (clientX: number, clientY: number) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const next = { x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height };
    const tri = prismFor(rect.width, rect.height);
    if (inside({ x: next.x * rect.width, y: next.y * rect.height }, tri)) return;
    setInteracted(true);
    setSource({ x: Math.min(0.98, Math.max(0.02, next.x)), y: Math.min(0.98, Math.max(0.02, next.y)) });
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    moveTo(e.clientX, e.clientY);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = 0.02;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    setInteracted(true);
    setSource((s) => ({ x: Math.min(0.98, Math.max(0.02, s.x + move[0])), y: Math.min(0.98, Math.max(0.02, s.y + move[1])) }));
  };

  const spread = readout.red !== null && readout.violet !== null ? Math.abs(readout.violet - readout.red) : null;
  const fmt = (v: number | null) => (v === null ? "—" : `${v.toFixed(1)}°`);

  return (
    <SpotlightSection id="luz" hue={270} aria-labelledby="luz-title">
      <div className="mx-auto max-w-6xl px-6 py-28 sm:px-10 sm:py-40">
        <SectionHeading
          id="luz-title"
          eyebrow="Óptica"
          title="Brinque com a luz"
          intro="Um prisma com física de verdade: cada cor dobra com o próprio índice de refração. Arraste a lanterna, mude a mira e veja a luz se abrir, ou ficar presa dentro do vidro."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-[1fr_17rem]">
          <div
            ref={wrapRef}
            tabIndex={0}
            role="group"
            aria-label="Simulação do prisma. Use as setas para mover a lanterna."
            onPointerDown={onPointerDown}
            onPointerMove={(e) => dragging.current && moveTo(e.clientX, e.clientY)}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
            onKeyDown={onKeyDown}
            className="relative h-[24rem] cursor-crosshair touch-none overflow-hidden rounded-2xl border border-line bg-black outline-none focus-visible:border-white/40 sm:h-[30rem]"
          >
            <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />
            {!interacted && (
              <p className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                Arraste a lanterna
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white/[0.02] p-5">
            <label className="block">
              <span className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
                <span>Dispersão</span>
                <span>{(dispersion * 1000).toFixed(0)}</span>
              </span>
              <input
                type="range"
                min={4}
                max={45}
                value={Math.round(dispersion * 1000)}
                onChange={(e) => {
                  setInteracted(true);
                  setDispersion(Number(e.target.value) / 1000);
                }}
                className="spectrum-bg h-1.5 w-full cursor-pointer appearance-none rounded-full accent-white"
              />
            </label>
            <label className="block">
              <span className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
                <span>Mira</span>
                <span>{aim > 0 ? `+${aim}` : aim}°</span>
              </span>
              <input
                type="range"
                min={-35}
                max={35}
                value={aim}
                onChange={(e) => {
                  setInteracted(true);
                  setAim(Number(e.target.value));
                }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-white"
              />
            </label>

            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-4" aria-live="polite">
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-wider text-muted">Incidência</dt>
                <dd className="mt-1 font-heading text-xl font-black text-fg">{readout.hit ? fmt(readout.incidence) : "—"}</dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-wider text-muted">Abertura</dt>
                <dd className="mt-1 font-heading text-xl font-black text-fg">{fmt(spread)}</dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "oklch(0.75 0.2 25)" }}>
                  Desvio vermelho
                </dt>
                <dd className="mt-1 font-heading text-xl font-black text-fg">{fmt(readout.red)}</dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "oklch(0.72 0.2 300)" }}>
                  Desvio violeta
                </dt>
                <dd className="mt-1 font-heading text-xl font-black text-fg">{fmt(readout.violet)}</dd>
              </div>
            </dl>
            <p className="text-xs leading-relaxed text-muted">
              {!readout.hit
                ? "O feixe não acertou o prisma. Mude a mira."
                : readout.reflections > 0
                  ? `Reflexão interna total: a luz bateu ${readout.reflections}x por dentro antes de sair.`
                  : "Violeta desvia mais que vermelho: o índice do vidro é maior para ondas curtas."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSource({ x: 0.12, y: 0.66 });
                setAim(0);
                setDispersion(0.028);
                setInteracted(false);
              }}
              className="mt-auto rounded-lg border border-white/15 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-fg/85 hover:border-white/40"
            >
              Recomeçar
            </button>
          </div>
        </div>
      </div>
    </SpotlightSection>
  );
}
