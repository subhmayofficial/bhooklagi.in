"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Flame, Sparkles } from "lucide-react";

const FLOATERS = ["🍔", "🌯", "🍟", "🧃", "🍜", "🥪"];

export function PromoCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-orange via-[#d45200] to-brand-gold px-4 py-10 md:px-6 md:py-16">
      {/* Background texture dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Radial glow centre */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,200,50,0.6), transparent 70%)" }}
      />

      {/* Floating food emojis */}
      {FLOATERS.map((emoji, i) => (
        <motion.span
          key={i}
          aria-hidden
          animate={{ y: [0, -14, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
          className="pointer-events-none absolute select-none text-[28px] opacity-20"
          style={{
            left: `${8 + i * 16}%`,
            top: i % 2 === 0 ? "10%" : "70%",
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Diagonal stripe overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 28px)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          {/* Left: copy */}
          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2"
            >
              <Flame className="h-4 w-4 text-white" fill="white" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/80">
                Limited time offer
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.07 }}
              className="mt-2 font-display text-[clamp(1.9rem,7vw,4rem)] leading-none tracking-wide text-white"
            >
              GET ₹80 OFF
              <br />
              <span className="text-ink/80">YOUR FIRST ORDER</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.14 }}
              className="mt-3 text-[13px] font-medium text-white/75"
            >
              Min order ₹299. Offer auto-applies at checkout. No code needed.
            </motion.p>

            {/* Trust mini pills */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-4 flex flex-wrap gap-2"
            >
              {["⚡ 35 min delivery", "🌿 Fresh food", "💳 Easy UPI"].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-black/20 px-3 py-1 text-[10px] font-bold text-white/90 backdrop-blur-sm"
                >
                  {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: CTA card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="flex w-full flex-col items-center gap-4 md:w-auto"
          >
            {/* Glowing CTA button */}
            <Link
              href="/menu"
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-ink px-8 py-4 text-[15px] font-extrabold text-white shadow-2xl transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] active:scale-[0.97] md:w-auto"
            >
              {/* Shimmer sweep */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Sparkles className="h-4 w-4 text-brand-gold" fill="currentColor" />
              Order now — ₹80 off
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={3} />
            </Link>

            <p className="text-center text-[10px] font-semibold text-white/50">
              No account needed · Instant checkout
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
