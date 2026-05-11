"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { menuItems, formatInr } from "@/data/menu";
import { useCartStore } from "@/stores/cart-store";
import { AnimatePresence } from "framer-motion";

export function FeaturedSection() {
  const picks = menuItems.filter((m) => m.bestseller).slice(0, 8);

  return (
    <section className="bg-gray-50 px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-gray-900">
            Top picks for you 🔥
          </h2>
          <Link
            href="/menu"
            className="text-[13px] font-bold text-brand-orange hover:underline"
          >
            See all
          </Link>
        </div>

        <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:px-0">
          {picks.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
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
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Image */}
      <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-brand-cream via-white to-brand-cream-dark">
        <span className="select-none text-[3.5rem] drop-shadow-sm">{item.emoji}</span>
      </div>

      {/* Info */}
      <div className="p-3">
        {item.bestseller && (
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-orange">
            ★ Bestseller
          </p>
        )}
        <p className="text-[13px] font-semibold leading-snug text-gray-900 line-clamp-1">
          {item.name}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[13px] font-bold text-gray-900">{formatInr(item.price)}</p>

          <AnimatePresence mode="wait" initial={false}>
            {qty === 0 ? (
              <motion.button
                key="add"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
                type="button"
                onClick={() => addItem(item)}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition-colors"
              >
                <Plus className="h-4 w-4" strokeWidth={3} />
              </motion.button>
            ) : (
              <motion.div
                key="stepper"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
                className="flex items-center gap-1.5 rounded-full bg-brand-orange px-1.5 py-0.5"
              >
                <button type="button" onClick={() => decrement(item.id)} className="text-white">
                  <Minus className="h-3 w-3" strokeWidth={3} />
                </button>
                <span className="min-w-[0.9rem] text-center text-[12px] font-extrabold text-white">
                  {qty}
                </span>
                <button type="button" onClick={() => increment(item.id)} className="text-white">
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
