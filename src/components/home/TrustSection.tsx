"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

/* ─── Trust items ─────────────────────────────────────────────── */
const TRUST_ITEMS = [
  {
    icon: "🌿",
    title: "Freshly Made",
    desc: "Cooked fresh right after your order — no pre-cooked batches, ever.",
    stat: "100%",
    statLabel: "fresh every time",
    accent: "#16a34a",          // green-600
    lightBg: "#f0fdf4",         // green-50
    border: "#bbf7d0",          // green-200
    statBg: "#dcfce7",          // green-100
  },
  {
    icon: "🧼",
    title: "Hygienic Kitchen",
    desc: "Clean, certified workspace. We take hygiene as seriously as flavour.",
    stat: "5★",
    statLabel: "kitchen rating",
    accent: "#0284c7",          // sky-600
    lightBg: "#f0f9ff",
    border: "#bae6fd",
    statBg: "#e0f2fe",
  },
  {
    icon: "💰",
    title: "Pocket Friendly",
    desc: "Student-built, student-priced. Big flavours, tiny bills.",
    stat: "₹49",
    statLabel: "starts at",
    accent: "#d97706",          // amber-600
    lightBg: "#fffbeb",
    border: "#fde68a",
    statBg: "#fef3c7",
  },
  {
    icon: "⚡",
    title: "Fast Delivery",
    desc: "Hot food at your door in under 35 minutes — or we hustle harder.",
    stat: "35",
    statLabel: "min avg delivery",
    accent: "#ea580c",          // orange-600
    lightBg: "#fff7ed",
    border: "#fed7aa",
    statBg: "#ffedd5",
  },
  {
    icon: "❤️",
    title: "Made with Love",
    desc: "Every bite carries the passion of a founder who loves good food.",
    stat: "1K+",
    statLabel: "happy customers",
    accent: "#e11d48",          // rose-600
    lightBg: "#fff1f2",
    border: "#fecdd3",
    statBg: "#ffe4e6",
  },
];

/* ─── Animated counter ────────────────────────────────────────── */
function AnimatedStat({ value }: { value: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) { setDisplay(value); return; }
    const prefix = value.match(/^[^0-9]*/)?.[0] ?? "";
    const suffix = value.match(/[^0-9]*$/)?.[0] ?? "";
    let start = 0;
    const step = 16;
    const steps = 1000 / step;
    const inc = num / steps;
    const timer = setInterval(() => {
      start += inc;
      if (start >= num) { setDisplay(value); clearInterval(timer); return; }
      setDisplay(`${prefix}${Math.floor(start)}${suffix}`);
    }, step);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}

/* ─── Single card — horizontal layout on mobile, vertical on lg ─ */
function TrustCard({ item, index }: { item: (typeof TRUST_ITEMS)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="group relative"
    >
      {/* subtle hover ring */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `0 0 0 2px ${item.accent}40, 0 6px 20px ${item.accent}20` }}
      />

      <div
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border p-4 transition-shadow group-hover:shadow-md"
        style={{ background: item.lightBg, borderColor: item.border }}
      >
        {/* Big emoji watermark */}
        <span
          className="pointer-events-none absolute -right-2 -top-1 select-none text-[60px] leading-none opacity-[0.08]"
          aria-hidden
        >
          {item.icon}
        </span>

        {/* Top: icon + title (horizontal on mobile) */}
        <div className="flex items-center gap-3 lg:block">
          <span
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-[22px] shadow-sm lg:mb-3 lg:h-12 lg:w-12 lg:text-[26px]"
            style={{ background: item.statBg, border: `1.5px solid ${item.border}` }}
          >
            {item.icon}
          </span>
          <h3 className="text-[14px] font-extrabold text-gray-900 lg:text-[15px]">{item.title}</h3>
        </div>

        {/* Desc */}
        <p className="mt-2 flex-1 text-[11px] leading-relaxed text-gray-500 lg:text-[12px]">{item.desc}</p>

        {/* Stat strip */}
        <div
          className="mt-3 flex items-baseline gap-1.5 rounded-xl px-3 py-2"
          style={{ background: item.statBg }}
        >
          <span
            className="font-display text-[22px] leading-none tracking-wide lg:text-[26px]"
            style={{ color: item.accent }}
          >
            <AnimatedStat value={item.stat} />
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider lg:text-[10px]" style={{ color: item.accent + "99" }}>
            {item.statLabel}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Section ─────────────────────────────────────────────────── */
export function TrustSection() {
  return (
    <section className="relative overflow-hidden bg-app-texture px-4 py-10 md:px-6 md:py-14">
      {/* Soft orange bloom top-left */}
      <div
        className="pointer-events-none absolute -left-20 -top-10 h-56 w-56 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, #FAA307 0%, transparent 70%)" }}
      />
      {/* Soft green bloom bottom-right */}
      <div
        className="pointer-events-none absolute -bottom-10 -right-20 h-48 w-48 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #86efac 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-6xl">

        {/* ── Header ── */}
        <div className="mb-8 text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-orange"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-orange" />
            </span>
            Why Bhook Lagi
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.07 }}
            className="mt-3 font-display text-[clamp(1.8rem,6vw,3rem)] leading-none tracking-wide text-gray-900"
          >
            WE DON&apos;T JUST
            <br />
            <span className="text-gradient-brand">DELIVER FOOD.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="mx-auto mt-2.5 max-w-xs text-[12px] leading-relaxed text-gray-500 md:max-w-sm md:text-[13px]"
          >
            Freshness, speed &amp; honest value —{" "}
            <span className="font-semibold text-gray-700">crafted for Deoghar&apos;s hungriest souls.</span>
          </motion.p>
        </div>

        {/* ── Cards — 2 col on mobile, 5 col on lg ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {TRUST_ITEMS.map((item, i) => (
            <div key={item.title} className={i === 4 ? "col-span-2 sm:col-span-1" : ""}>
              <TrustCard item={item} index={i} />
            </div>
          ))}
        </div>

        {/* ── Features highlight bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-8 overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm"
        >
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 sm:grid-cols-4 sm:divide-y-0">
            {[
              { label: "Real-Time Tracking", value: "Live updates",   icon: "📍" },
              { label: "Easy UPI Payments",  value: "Secure & fast",  icon: "💳" },
              { label: "Express Delivery",   value: "Hot & fresh",   icon: "🛵" },
              { label: "Hygienic Kitchen",   value: "Zero contact",   icon: "🧼" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5 px-4 py-4 text-center">
                <span className="text-[18px]">{s.icon}</span>
                <span className="font-display text-[16px] leading-none tracking-wide text-brand-orange">
                  {s.value}
                </span>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
