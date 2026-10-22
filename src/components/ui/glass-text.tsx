import { motion, useTransform, type MotionValue } from "framer-motion";
import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface GlassTextProps {
  lines: string[];
  /** Deslocamento (px) das bordas vermelha e azul. Quanto maior, mais o "prisma" separa a luz. */
  dispersion: MotionValue<number>;
  className?: string;
  style?: CSSProperties;
}

/**
 * Texto com aparência de vidro. As camadas são decorativas (aria-hidden);
 * o texto real fica num span só para leitores de tela.
 * Estilos das camadas em index.css (.glass-*).
 *
 * Bordas e bevel saem de filtros SVG aplicados ao glifo já rasterizado, e não de
 * -webkit-text-stroke, que desenha as sobreposições internas das fontes variáveis.
 */
export function GlassText({ lines, dispersion, className, style }: GlassTextProps) {
  const id = useId().replace(/:/g, "");
  const edge = `url(#${id}-edge)`;
  const bevel = `url(#${id}-bevel)`;
  const negative = useTransform(dispersion, (d) => -d);

  const content = lines.map((line) => (
    <span key={line} className="block">
      {line}
    </span>
  ));

  return (
    <h1 className={cn("glass-text", className)} style={style}>
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          {/* Anel de ~1px: o glifo menos ele mesmo erodido */}
          <filter id={`${id}-edge`}>
            <feMorphology in="SourceAlpha" operator="erode" radius="1.1" result="inner" />
            <feComposite in="SourceGraphic" in2="inner" operator="out" />
          </filter>
          {/* Luz especular sobre o alfa desfocado: realça as quinas viradas para a luz */}
          <filter id={`${id}-bevel`}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
            <feSpecularLighting in="blur" surfaceScale="6" specularConstant="1.3" specularExponent="60" lightingColor="#fff" result="spec">
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
      <span aria-hidden className="glass-layer glass-edge" style={{ filter: edge }}>{content}</span>
    </h1>
  );
}
