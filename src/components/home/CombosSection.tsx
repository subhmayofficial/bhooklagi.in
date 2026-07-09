"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Flame, Star } from "lucide-react";

const combos = [
  {
    id: "super-saver",
    tag: "SUPER SAVER",
    name: "Super Saver\nCombo",
    tagline: "Perfect for one hungry soul",
    items: ["1 Burger / Roll", "1 Side", "1 Beverage"],
    price: 149,
    originalPrice: 199,
    saves: 50,
    image: "https://b.zmtcdn.com/data/dish_photos/f9a/afec2f9a774ebf52d1c661b8edf92f9a.jpeg",
    accent: "from-[#1a0a00] via-[#3d1505] to-[#1a0a00]",
    badgeColor: "bg-green-500",
    glow: "rgba(232,93,4,0.45)",
  },
  {
    id: "super-value",
    tag: "SUPER VALUE",
    name: "Super Value\nCombo",
    tagline: "More food, more savings",
    items: ["2 Burgers / Rolls", "1 Side", "2 Beverages"],
    price: 249,
    originalPrice: 329,
    saves: 80,
    image: "https://b.zmtcdn.com/data/dish_photos/9ab/16e0517bb56de5ea26be4bf9f3e1a9ab.jpeg",
    accent: "from-[#0a0a1a] via-[#15153d] to-[#0a0a1a]",
    badgeColor: "bg-orange-500",
    glow: "rgba(250,163,7,0.45)",
  },
  {
    id: "mega-meal",
    tag: "MEGA MEAL",
    name: "Mega Meal\nCombo",
    tagline: "Feed the whole squad",
    items: ["4 Burgers / Rolls", "2 Sides", "4 Beverages"],
    price: 449,
    originalPrice: 599,
    saves: 150,
    image: "https://b.zmtcdn.com/data/dish_photos/eda/836b4ae933a560171bcb340cf5dc2eda.jpeg",
    accent: "from-[#0a1200] via-[#1a2e00] to-[#0a1200]",
    badgeColor: "bg-red-500",
    glow: "rgba(255,122,26,0.45)",
  },
];

export function CombosSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  }

  return (
    <section className="bg-app-texture px-4 py-6 md:px-6 md:py-12 overflow-hidden">
      <div className="mx-auto max-w-6xl">

        {/* ── Section Header ── */}
        <div className="relative mb-6 flex items-center justify-between">
          <div className="relative">
            {/* Decorative art behind heading */}
            <div className="pointer-events-none absolute -left-2 -top-3 select-none" aria-hidden>
              {/* Stars */}
              <svg width="110" height="52" viewBox="0 0 110 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left swirl */}
                <path d="M8 26 Q18 6 28 18 Q38 30 20 38 Q4 46 8 26Z" fill="#FAA307" opacity="0.18" />
                {/* Right swirl */}
                <path d="M72 14 Q90 2 98 16 Q106 30 88 34 Q70 38 72 14Z" fill="#E85D04" opacity="0.14" />
                {/* dotted arcs */}
                <circle cx="6" cy="8" r="2" fill="#FAA307" opacity="0.35" />
                <circle cx="14" cy="4" r="1.5" fill="#E85D04" opacity="0.3" />
                <circle cx="22" cy="7" r="1" fill="#FAA307" opacity="0.25" />
                <circle cx="96" cy="10" r="2" fill="#FAA307" opacity="0.35" />
                <circle cx="104" cy="6" r="1.5" fill="#E85D04" opacity="0.3" />
                {/* stars */}
                <path d="M42 6l1.5 4.5H48L44.5 13l1.5 4.5L42 15l-4 2.5L39.5 13 36 10.5h4.5z" fill="#FAA307" opacity="0.5" />
                <path d="M66 30l1 3H70l-2.5 1.8 1 3L66 36l-2.5 1.8 1-3L62 33h3z" fill="#E85D04" opacity="0.4" />
              </svg>
            </div>

            {/* Combo badge pill */}
            <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-gold px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm">
              <Flame className="h-3 w-3" />
              Bhook Lagi Combos
            </span>

            {/* Big heading using Bebas Neue display font */}
            <h2
              className="mt-3 font-display text-[28px] leading-none tracking-wide text-gray-900 md:text-[32px]"
              style={{ lineHeight: 1 }}
            >
              BUILD YOUR
              <br />
              <span className="text-gradient-brand text-[32px] md:text-[38px]">COMBO</span>
            </h2>

            {/* decorative underline */}
            <div className="mt-1.5 flex items-center gap-1">
              <div className="h-[3px] w-10 rounded-full bg-brand-orange" />
              <div className="h-[3px] w-4 rounded-full bg-brand-gold" />
              <div className="h-[3px] w-2 rounded-full bg-brand-gold/40" />
            </div>
          </div>

          {/* Nav arrows — desktop only */}
          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => scroll("left")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:border-brand-orange/40 hover:shadow-md"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:border-brand-orange/40 hover:shadow-md"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* ── Combo Cards ── */}
        <div
          ref={scrollRef}
          className="hide-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0"
        >
          {combos.map((combo, i) => (
            <ComboCard key={combo.id} combo={combo} index={i} />
          ))}
        </div>

        {/* Mobile scroll hint dots */}
        <div className="mt-4 flex justify-center gap-1.5 md:hidden">
          {combos.map((c, i) => (
            <div
              key={c.id}
              className={`h-1.5 rounded-full transition-all ${
                i === 0
                  ? "w-5 bg-brand-orange"
                  : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ComboCard({
  combo,
  index,
}: {
  combo: (typeof combos)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.1, duration: 0.45, ease: "easeOut" }}
      className="relative w-[82vw] max-w-[300px] flex-shrink-0 md:w-[340px] md:max-w-none"
    >
      <Link href="/menu" className="group block">
        {/* Card shell */}
        <div
          className="relative overflow-hidden rounded-3xl shadow-xl"
          style={{
            boxShadow: `0 8px 32px ${combo.glow}, 0 2px 8px rgba(0,0,0,0.18)`,
          }}
        >
          {/* ── Background image ── */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={combo.image}
            alt={combo.name}
            className="h-[230px] w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-[300px]"
            loading="lazy"
          />

          {/* ── Dark gradient overlay ── */}
          <div
            className={`absolute inset-0 bg-gradient-to-t ${combo.accent} opacity-75`}
          />
          {/* Extra bottom darkness for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* ── Decorative art elements (behind text) ── */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            {/* Large circle blur accent */}
            <div
              className="absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-20 blur-2xl"
              style={{ background: combo.glow }}
            />
            {/* Thin diagonal lines — art deco feel */}
            <svg
              className="absolute left-0 top-0 h-full w-full opacity-[0.07]"
              viewBox="0 0 340 300"
              preserveAspectRatio="xMidYMid slice"
            >
              {Array.from({ length: 8 }).map((_, k) => (
                <line
                  key={k}
                  x1={k * 55 - 40}
                  y1="0"
                  x2={k * 55 + 60}
                  y2="300"
                  stroke="white"
                  strokeWidth="1"
                />
              ))}
            </svg>
            {/* Star sparkles */}
            {[
              { cx: 20, cy: 20, r: 1.5 },
              { cx: 300, cy: 40, r: 1 },
              { cx: 260, cy: 200, r: 1.5 },
              { cx: 50, cy: 240, r: 1 },
            ].map((s, k) => (
              <motion.div
                key={k}
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2.5 + k * 0.5, repeat: Infinity, ease: "easeInOut", delay: k * 0.6 }}
                className="absolute"
                style={{ left: s.cx, top: s.cy }}
              >
                <Star
                  className="text-brand-gold"
                  style={{ width: s.r * 8, height: s.r * 8 }}
                  fill="currentColor"
                />
              </motion.div>
            ))}
          </div>

          {/* ── Save badge (top right) ── */}
          <div className="absolute right-0 top-4">
            <div
              className={`${combo.badgeColor} relative flex flex-col items-center px-3 pb-2 pt-1.5 text-white shadow-lg`}
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)",
              }}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">SAVE</span>
              <span className="font-display text-[22px] leading-none tracking-wider">
                ₹{combo.saves}
              </span>
            </div>
          </div>

          {/* ── Tag pill (top left) ── */}
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.15em] text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              {combo.tag}
            </span>
          </div>

          {/* ── Text content at bottom ── */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            {/* Combo name — Bebas Neue */}
            <h3
              className="font-display text-[36px] leading-none text-white drop-shadow-lg"
              style={{ letterSpacing: "0.04em", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
            >
              {combo.name.split("\n").map((line, li) => (
                <span key={li} className="block">
                  {li === 1 ? (
                    <span className="text-brand-gold">{line}</span>
                  ) : (
                    line
                  )}
                </span>
              ))}
            </h3>

            {/* Tagline */}
            <p className="mt-1 text-[11px] font-medium uppercase tracking-widest text-white/70">
              {combo.tagline}
            </p>

            {/* Items included */}
            <ul className="mt-2 space-y-0.5">
              {combo.items.map((item) => (
                <li key={item} className="flex items-center gap-1.5 text-[12px] font-medium text-white/90">
                  <span className="h-1 w-1 rounded-full bg-brand-gold flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Price row */}
            <div className="mt-3 flex items-end justify-between">
              <div>
                <span className="font-display text-[28px] leading-none text-white" style={{ letterSpacing: "0.03em" }}>
                  ₹{combo.price}
                </span>
                <span className="ml-1.5 text-[12px] text-white/50 line-through">
                  ₹{combo.originalPrice}
                </span>
              </div>

              {/* CTA button */}
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-gold px-4 py-2 text-[12px] font-extrabold text-white shadow-lg"
              >
                Order Now
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
