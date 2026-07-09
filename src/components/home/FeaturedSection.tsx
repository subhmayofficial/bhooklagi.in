"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Flame, ArrowRight, Zap } from "lucide-react";
import { menuItems, formatInr } from "@/data/menu";
import { useCartStore } from "@/stores/cart-store";

export function FeaturedSection() {
  const picks = menuItems.filter((m) => m.bestseller).slice(0, 8);

  return (
    <section className="relative overflow-hidden bg-gray-950 px-4 py-8 md:px-6 md:py-14">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-64 w-64 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #E85D04, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #FAA307, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-orange/20">
                <Flame className="h-3.5 w-3.5 text-brand-orange" />
              </span>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-orange">
                Bestsellers
              </p>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.06 }}
              className="mt-1 font-display text-[clamp(1.5rem,5vw,2.4rem)] leading-none tracking-wide text-white"
            >
              TOP PICKS
              <br />
              <span className="text-gradient-brand">FOR YOU</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/menu"
              className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold text-white/80 transition-all hover:border-brand-orange/40 hover:bg-brand-orange/10 hover:text-brand-orange"
            >
              See all
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" strokeWidth={3} />
            </Link>
          </motion.div>
        </div>

        {/* Cards scroll */}
        <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:px-0">
          {picks.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
              className="w-[160px] flex-shrink-0 md:w-auto"
            >
              <FeaturedCard itemId={item.id} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({ itemId }: { itemId: string }) {
  const item = menuItems.find((m) => m.id === itemId)!;
  const addItem   = useCartStore((s) => s.addItem);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const lines     = useCartStore((s) => s.lines);
  const cartLine  = lines.find((l) => l.itemId === item.id);
  const qty = cartLine?.qty ?? 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/8 bg-gray-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/30 hover:shadow-[0_8px_32px_rgba(232,93,4,0.25)]">
      {/* Bestseller flash */}
      {item.bestseller && (
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-center gap-1 bg-gradient-to-r from-brand-orange to-brand-gold py-0.5">
          <Zap className="h-2.5 w-2.5 text-white" fill="currentColor" />
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-white">Bestseller</span>
        </div>
      )}

      {/* Food image or emoji fallback */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800">
        {item.image ? (
          <>
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 160px, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Gradient overlay at bottom for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 via-transparent to-brand-gold/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center select-none text-[3.5rem] drop-shadow-lg"
            >
              {item.emoji}
            </motion.span>
          </>
        )}

        {/* Diet indicator dot */}
        {item.diet && (
          <span
            className={`absolute left-2 top-2 z-20 h-4 w-4 rounded-sm border-2 flex items-center justify-center ${
              item.diet === "veg"
                ? "border-green-500 bg-white"
                : item.diet === "egg"
                ? "border-amber-500 bg-white"
                : "border-red-500 bg-white"
            } ${item.bestseller ? "top-7" : "top-2"}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                item.diet === "veg" ? "bg-green-500" : item.diet === "egg" ? "bg-amber-500" : "bg-red-500"
              }`}
            />
          </span>
        )}

        {/* Spicy badge */}
        {item.spicy && (
          <span className="absolute bottom-2 right-2 z-10 rounded-full bg-red-500/90 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm">
            🌶 Spicy
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[13px] font-semibold leading-snug text-white line-clamp-1">
          {item.name}
        </p>
        <p className="mt-0.5 text-[10px] leading-tight text-gray-500 line-clamp-2">
          {item.description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <p className="font-display text-[18px] leading-none tracking-wide text-brand-gold">
            {formatInr(item.price)}
          </p>

          <AnimatePresence mode="wait" initial={false}>
            {qty === 0 ? (
              <motion.button
                key="add"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                type="button"
                onClick={() => addItem(item)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-orange text-white shadow-md shadow-brand-orange/30 transition-transform active:scale-90 hover:bg-brand-orange-light"
              >
                <Plus className="h-4 w-4" strokeWidth={3} />
              </motion.button>
            ) : (
              <motion.div
                key="stepper"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1 rounded-full bg-brand-orange px-1.5 py-0.5 shadow-md shadow-brand-orange/30"
              >
                <button type="button" onClick={() => decrement(item.id)} className="text-white active:scale-90">
                  <Minus className="h-3 w-3" strokeWidth={3} />
                </button>
                <span className="min-w-[1rem] text-center text-[12px] font-extrabold text-white">
                  {qty}
                </span>
                <button type="button" onClick={() => increment(item.id)} className="text-white active:scale-90">
                  <Plus className="h-3 w-3" strokeWidth={3} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
