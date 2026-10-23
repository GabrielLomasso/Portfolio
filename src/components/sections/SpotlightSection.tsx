import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SpotlightSectionProps {
  id: string;
  /** Matiz da luz que segue o cursor */
  hue?: number;
  className?: string;
  children: ReactNode;
  "aria-labelledby"?: string;
}

/** Seção com uma luz suave que acompanha o cursor (variáveis --sx/--sy, estilo em .spotlight). */
export function SpotlightSection({ id, hue = 280, className, children, ...rest }: SpotlightSectionProps) {
  const ref = useRef<HTMLElement>(null);

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--sy", `${e.clientY - rect.top}px`);
  };

  return (
    <section
      ref={ref}
      id={id}
      onPointerMove={onPointerMove}
      className={cn("spotlight relative isolate scroll-mt-4", className)}
      style={{ "--spot-hue": hue } as CSSProperties}
      {...rest}
    >
      {children}
    </section>
  );
}
