"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/**
 * `useScroll` + motion styles can differ between server HTML and the client.
 * Render the animated bar only after mount so hydration matches.
 */
export function ScrollProgress() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="pointer-events-none fixed left-0 top-0 z-[1000] h-[3px] w-full bg-transparent"
        aria-hidden
      />
    );
  }

  return <ScrollProgressBar />;
}

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed left-0 top-0 z-[1000] h-[3px] w-full origin-left bg-gradient-to-r from-brand-orange via-brand-gold to-brand-orange-light"
      style={{ scaleX }}
    />
  );
}
