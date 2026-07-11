"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Flame, Star, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { menuItems } from "@/data/menu";

const MEAL_IDS = [
  "bl-everyday-meal",
  "bl-chicken-meal",
  "bl-roll-meal",
  "bl-special-meal",
  "bl-family-meal",
  "bl-party-meal",
];

const COMBO_META: Record<string, {
  tag: string;
  tagline: string;
  items: string[];
  originalPrice: number;
  accent: string;
  badgeColor: string;
  glow: string;
}> = {
  "bl-everyday-meal": {
    tag: "EVERYDAY MEAL",
    tagline: "Quick hunger, unbeatable price",
    items: ["Aloo Tikki Burger", "Classic Fries"],
    originalPrice: 128,  // 69+59
    accent: "from-[#1a0a00] via-[#3d1505] to-[#1a0a00]",
    badgeColor: "bg-green-500",
    glow: "rgba(34,197,94,0.35)",
  },
  "bl-chicken-meal": {
    tag: "BEST SELLER",
    tagline: "The one everyone keeps ordering",
    items: ["Classic Chicken Burger", "Classic Fries", "Masala Cold Beverage"],
    originalPrice: 227,  // 119+59+49
    accent: "from-[#1a0500] via-[#4d1200] to-[#1a0500]",
    badgeColor: "bg-brand-orange",
    glow: "rgba(232,93,4,0.5)",
  },
  "bl-roll-meal": {
    tag: "ROLL MEAL",
    tagline: "Desi-style, complete combo",
    items: ["Special Egg Chicken Roll", "Classic Fries", "Masala Cold Beverage"],
    originalPrice: 247,  // 139+59+49
    accent: "from-[#0a0a1a] via-[#15153d] to-[#0a0a1a]",
    badgeColor: "bg-blue-500",
    glow: "rgba(99,102,241,0.4)",
  },
  "bl-special-meal": {
    tag: "SPECIAL MEAL",
    tagline: "The full premium experience",
    items: ["Chicken Cheese Burger", "Peri Peri Fries", "Cold Coffee"],
    originalPrice: 327,  // 139+79+109 (cold coffee est)
    accent: "from-[#1a0a00] via-[#3d2005] to-[#1a0a00]",
    badgeColor: "bg-yellow-500",
    glow: "rgba(250,163,7,0.45)",
  },
  "bl-family-meal": {
    tag: "FAMILY MEAL",
    tagline: "Feed two, spend less",
    items: ["2× Classic Chicken Burger", "2× Classic Fries", "2× Masala Cold Beverage"],
    originalPrice: 454,  // (119+59+49)×2
    accent: "from-[#0a1200] via-[#1a2e00] to-[#0a1200]",
    badgeColor: "bg-emerald-500",
    glow: "rgba(16,185,129,0.4)",
  },
  "bl-party-meal": {
    tag: "PARTY MEAL",
    tagline: "Go big with your crew",
    items: ["2× Chicken Cheese Roll", "2× Chicken Cheese Burger", "2× Peri Peri Fries", "2× Masala Cold Beverage"],
    originalPrice: 852,
    accent: "from-[#1a001a] via-[#3d0530] to-[#1a001a]",
    badgeColor: "bg-red-500",
    glow: "rgba(239,68,68,0.4)",
  },
};

export function CombosSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const meals = MEAL_IDS.map((id) => menuItems.find((m) => m.id === id)).filter(Boolean) as typeof menuItems;

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
            <div className="pointer-events-none absolute -left-2 -top-3 select-none" aria-hidden>
              <svg width="110" height="52" viewBox="0 0 110 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 26 Q18 6 28 18 Q38 30 20 38 Q4 46 8 26Z" fill="#FAA307" opacity="0.18" />
                <path d="M72 14 Q90 2 98 16 Q106 30 88 34 Q70 38 72 14Z" fill="#E85D04" opacity="0.14" />
                <circle cx="6" cy="8" r="2" fill="#FAA307" opacity="0.35" />
                <circle cx="14" cy="4" r="1.5" fill="#E85D04" opacity="0.3" />
                <circle cx="22" cy="7" r="1" fill="#FAA307" opacity="0.25" />
                <circle cx="96" cy="10" r="2" fill="#FAA307" opacity="0.35" />
                <circle cx="104" cy="6" r="1.5" fill="#E85D04" opacity="0.3" />
                <path d="M42 6l1.5 4.5H48L44.5 13l1.5 4.5L42 15l-4 2.5L39.5 13 36 10.5h4.5z" fill="#FAA307" opacity="0.5" />
                <path d="M66 30l1 3H70l-2.5 1.8 1 3L66 36l-2.5 1.8 1-3L62 33h3z" fill="#E85D04" opacity="0.4" />
              </svg>
            </div>

            <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-gold px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm">
              <Flame className="h-3 w-3" />
              Bhook Lagi Meals
            </span>

            <h2
              className="mt-3 font-display text-[28px] leading-none tracking-wide text-gray-900 md:text-[32px]"
              style={{ lineHeight: 1 }}
            >
              GET YOUR
              <br />
              <span className="text-gradient-brand text-[32px] md:text-[38px]">COMBO MEAL</span>
            </h2>

            <div className="mt-1.5 flex items-center gap-1">
              <div className="h-[3px] w-10 rounded-full bg-brand-orange" />
              <div className="h-[3px] w-4 rounded-full bg-brand-gold" />
              <div className="h-[3px] w-2 rounded-full bg-brand-gold/40" />
            </div>
          </div>

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
          {meals.map((meal, i) => (
            <ComboCard key={meal.id} meal={meal} index={i} />
          ))}
        </div>

        {/* Scroll hint dots */}
        <div className="mt-4 flex justify-center gap-1.5 md:hidden">
          {meals.map((m, i) => (
            <div
              key={m.id}
              className={`h-1.5 rounded-full transition-all ${i === 0 ? "w-5 bg-brand-orange" : "w-1.5 bg-gray-300"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ComboCard({ meal, index }: { meal: typeof menuItems[number]; index: number }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const meta = COMBO_META[meal.id];
  if (!meta) return null;
  const saves = meta.originalPrice - meal.price;

  function handleOrder() {
    addItem(meal);
    router.push("/cart");
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
      className="relative w-[82vw] max-w-[300px] flex-shrink-0 md:w-[320px] md:max-w-none"
    >
      <div
        className="relative overflow-hidden rounded-3xl shadow-xl"
        style={{ boxShadow: `0 8px 32px ${meta.glow}, 0 2px 8px rgba(0,0,0,0.18)` }}
      >
        {/* Background — image or emoji fallback */}
        {meal.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={meal.image}
            alt={meal.name}
            className="h-[230px] w-full object-cover md:h-[280px]"
            loading="lazy"
          />
        ) : (
          <div
            className={`h-[230px] w-full bg-gradient-to-br ${meta.accent} md:h-[280px] flex items-center justify-center`}
          >
            <span className="text-[80px] opacity-60 select-none">{meal.emoji}</span>
          </div>
        )}

        {/* Dark gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${meta.accent} opacity-70`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        {/* Decorative */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-20 blur-2xl" style={{ background: meta.glow }} />
          <svg className="absolute left-0 top-0 h-full w-full opacity-[0.07]" viewBox="0 0 320 280" preserveAspectRatio="xMidYMid slice">
            {Array.from({ length: 8 }).map((_, k) => (
              <line key={k} x1={k * 55 - 40} y1="0" x2={k * 55 + 60} y2="280" stroke="white" strokeWidth="1" />
            ))}
          </svg>
          {[{ cx: 20, cy: 20, r: 1.5 }, { cx: 280, cy: 40, r: 1 }, { cx: 260, cy: 180, r: 1.5 }, { cx: 50, cy: 220, r: 1 }].map((s, k) => (
            <motion.div
              key={k}
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2.5 + k * 0.5, repeat: Infinity, ease: "easeInOut", delay: k * 0.6 }}
              className="absolute"
              style={{ left: s.cx, top: s.cy }}
            >
              <Star className="text-brand-gold" style={{ width: s.r * 8, height: s.r * 8 }} fill="currentColor" />
            </motion.div>
          ))}
        </div>

        {/* Save badge — only when savings are meaningful */}
        {saves >= 15 && (
          <div className="absolute right-0 top-4">
            <div
              className={`${meta.badgeColor} relative flex flex-col items-center px-3 pb-2 pt-1.5 text-white shadow-lg`}
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)" }}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">SAVE</span>
              <span className="font-display text-[22px] leading-none tracking-wider">₹{saves}</span>
            </div>
          </div>
        )}

        {/* Tag pill */}
        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.15em] text-white backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            {meta.tag}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="font-display text-[28px] leading-tight text-white drop-shadow-lg" style={{ letterSpacing: "0.04em", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
            {meal.name.replace("Bhook Lagi ", "")}
          </h3>

          <p className="mt-1 text-[11px] font-medium uppercase tracking-widest text-white/70">{meta.tagline}</p>

          <ul className="mt-2 space-y-0.5">
            {meta.items.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-[12px] font-medium text-white/90">
                <span className="h-1 w-1 flex-shrink-0 rounded-full bg-brand-gold" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <span className="font-display text-[28px] leading-none text-white" style={{ letterSpacing: "0.03em" }}>
                ₹{meal.price}
              </span>
              <span className="ml-1.5 text-[12px] text-white/50 line-through">₹{meta.originalPrice}</span>
            </div>

            <motion.button
              type="button"
              onClick={handleOrder}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-gold px-4 py-2 text-[12px] font-extrabold text-white shadow-lg"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Order Now
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
