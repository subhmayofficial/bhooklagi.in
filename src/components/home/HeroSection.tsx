"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white px-4 pb-16 pt-24 md:pt-28">
      {/* Subtle orange tint at top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-gradient-to-b from-brand-orange/[0.06] to-transparent"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col items-start gap-10 md:flex-row md:items-center md:gap-16">
          {/* Left content */}
          <div className="flex-1">
            {/* Location pill */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-orange/20 bg-brand-orange/5 px-4 py-1.5"
            >
              <MapPin className="h-3.5 w-3.5 text-brand-orange" strokeWidth={2.5} />
              <span className="text-[13px] font-semibold text-brand-orange">
                Delivering in Deoghar, Jharkhand
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              <h1 className="font-display text-[clamp(3rem,10vw,5.5rem)] leading-[0.9] tracking-[0.01em] text-ink">
                BHOOK
                <br />
                <span className="text-gradient-brand">LAGI?</span>
              </h1>
              <p className="mt-3 font-display text-[clamp(1rem,3vw,1.5rem)] tracking-[0.18em] text-gray-400">
                HUM HAI NA!
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="mt-5 max-w-md text-[15px] leading-relaxed text-gray-500"
            >
              Burgers, rolls, maggi, Chinese, pasta & more — freshly made and delivered fast across Deoghar.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.26 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-orange px-7 py-3.5 text-[15px] font-bold text-white shadow-[0_6px_24px_rgba(232,93,4,0.4)] transition-all hover:bg-brand-orange-dark hover:shadow-[0_8px_32px_rgba(232,93,4,0.5)] active:scale-[0.98]"
              >
                Order now
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
              <Link
                href="/offers"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-7 py-3.5 text-[15px] font-bold text-gray-700 transition-all hover:border-brand-orange/30 hover:text-brand-orange active:scale-[0.98]"
              >
                View offers
              </Link>
            </motion.div>

            {/* Trust pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="mt-8 flex flex-wrap gap-2"
            >
              {[
                { icon: "🌿", label: "Freshly made" },
                { icon: "⚡", label: "Fast delivery" },
                { icon: "💰", label: "Pocket friendly" },
                { icon: "🧼", label: "Hygienic kitchen" },
              ].map((t) => (
                <span
                  key={t.label}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-gray-600 shadow-sm"
                >
                  {t.icon} {t.label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: food showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="flex w-full justify-center md:w-auto md:flex-shrink-0"
          >
            <div className="relative h-[260px] w-[260px] md:h-[320px] md:w-[320px]">
              {/* Circular gradient bg */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-orange/10 via-brand-gold/10 to-transparent" />

              {/* Center emoji */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[7rem] drop-shadow-md md:text-[8.5rem]">🍔</span>
              </div>

              {/* Orbiting food items */}
              {[
                { emoji: "🌯", angle: 0,   delay: 0 },
                { emoji: "🍟", angle: 72,  delay: 0.1 },
                { emoji: "🍜", angle: 144, delay: 0.2 },
                { emoji: "🍝", angle: 216, delay: 0.3 },
                { emoji: "🧃", angle: 288, delay: 0.4 },
              ].map(({ emoji, angle, delay }) => {
                const rad = (angle * Math.PI) / 180;
                const r = 115;
                const x = Math.cos(rad) * r;
                const y = Math.sin(rad) * r;
                return (
                  <motion.span
                    key={emoji}
                    className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-md"
                    style={{
                      left: `calc(50% + ${x}px - 24px)`,
                      top:  `calc(50% + ${y}px - 24px)`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + delay, type: "spring", stiffness: 260 }}
                  >
                    {emoji}
                  </motion.span>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
