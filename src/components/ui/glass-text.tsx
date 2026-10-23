import { motion, useAnimate, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useId, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface GlassTextProps {
  lines: string[];
  /** Deslocamento (px) das bordas vermelha e azul. Quanto maior, mais o "prisma" separa a luz. */
  dispersion: MotionValue<number>;
  /** Intensidade (0–1) das camadas cibernéticas: scanlines e neon tremulando. */
  cyber?: MotionValue<number>;
  /** Cada valor novo (>= 0) dispara um glitch com varredura de luz. */
  pulse?: number;
  className?: string;
  style?: CSSProperties;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Faixa horizontal aleatória do texto, para o recorte do glitch. */
function randomSlice() {
  const top = rand(0, 80);
  const height = rand(6, 22);
  return `inset(${top}% 0% ${Math.max(0, 100 - top - height)}% 0%)`;
}

/**
 * Texto com aparência de vidro. As camadas são decorativas (aria-hidden);
 * o texto real fica num span só para leitores de tela.
 * Estilos das camadas em index.css (.glass-*).
 *
 * Bordas e bevel saem de filtros SVG aplicados ao glifo já rasterizado, e não de
 * -webkit-text-stroke, que desenha as sobreposições internas das fontes variáveis.
 */
export function GlassText({ lines, dispersion, cyber, pulse, className, style }: GlassTextProps) {
  const id = useId().replace(/:/g, "");
  const edge = `url(#${id}-edge)`;
  const bevel = `url(#${id}-bevel)`;
  const negative = useTransform(dispersion, (d) => -d);
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLHeadingElement>();

  useEffect(() => {
    if (pulse === undefined || pulse < 0 || reduce || !scope.current) return;

    // Tremulação do conjunto, como um holograma perdendo sinal por um instante
    animate(
      scope.current,
      { opacity: [1, 0.3, 1, 0.6, 0.15, 1, 0.8, 1], x: [0, -4, 3, 0, 5, -2, 0, 0] },
      { duration: 0.6, ease: "linear" },
    );
    animate(".glass-sweep", { backgroundPosition: ["130% 0%", "-30% 0%"] }, { duration: 0.8, delay: 0.1, ease: [0.4, 0, 0.2, 1] });

    scope.current.querySelectorAll<HTMLElement>(".glass-slice").forEach((slice, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      animate(
        slice,
        {
          opacity: [0, 0.9, 0, 0.8, 0.5, 0],
          x: [0, dir * rand(8, 18), -dir * rand(4, 10), dir * rand(6, 14), 0, 0],
          clipPath: [randomSlice(), randomSlice(), randomSlice(), randomSlice(), randomSlice(), randomSlice()],
        },
        { duration: 0.5, delay: i * 0.05, ease: "linear" },
      );
    });
  }, [pulse, reduce, animate, scope]);

  const content = lines.map((line) => (
    <span key={line} className="block">
      {line}
    </span>
  ));

  return (
    <h1 ref={scope} className={cn("glass-text", className)} style={style} data-cyber={pulse !== undefined && pulse >= 0 ? "on" : "off"}>
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          {/* Anel de ~1px: o glifo menos ele mesmo erodido */}
          <filter id={`${id}-edge`}>
            <feMorphology in="SourceAlpha" operator="erode" radius="1.1" result="inner" />
            <feComposite in="SourceGraphic" in2="inner" operator="out" />
          </filter>
          {/* Luz especular sobre o alfa desfocado: realça as quinas viradas para a luz */}
          <filter id={`${id}-bevel`}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
            <feSpecularLighting in="blur" surfaceScale="3" specularConstant="1.4" specularExponent="45" lightingColor="#fff" result="spec">
              <feDistantLight azimuth="235" elevation="38" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceAlpha" operator="in" />
          </filter>
        </defs>
      </svg>

      <span className="sr-only">{lines.join(" ")}</span>
      <span aria-hidden className="glass-layer glass-glow">{content}</span>
      <motion.span
        aria-hidden
        className="glass-layer glass-disperse"
        style={{ x: negative, filter: edge, color: "oklch(0.66 0.25 25 / 0.95)" }}
      >
        {content}
      </motion.span>
      <motion.span
        aria-hidden
        className="glass-layer glass-disperse"
        style={{ x: dispersion, filter: edge, color: "oklch(0.72 0.2 235 / 0.95)" }}
      >
        {content}
      </motion.span>
      <span aria-hidden className="glass-layer glass-body">{content}</span>
      <span aria-hidden className="glass-layer glass-bevel" style={{ filter: bevel }}>{content}</span>
      <span aria-hidden className="glass-layer glass-sheen">{content}</span>
      {cyber && (
        <motion.span aria-hidden className="glass-layer glass-scan" style={{ opacity: cyber }}>
          {content}
        </motion.span>
      )}
      <span aria-hidden className="glass-layer glass-edge" style={{ filter: edge }}>{content}</span>
      <span aria-hidden className="glass-layer glass-sweep">{content}</span>
      <span aria-hidden className="glass-layer glass-slice">{content}</span>
      <span aria-hidden className="glass-layer glass-slice">{content}</span>
    </h1>
  );
}
