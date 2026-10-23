import { motion, useScroll, useSpring } from "framer-motion";

/** Barra fina no topo, com as cores do espectro, que enche conforme a página rola. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="spectrum-bg pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left"
    />
  );
}
