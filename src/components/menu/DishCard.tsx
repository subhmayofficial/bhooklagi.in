"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import type { MenuItem } from "@/data/menu";
import { formatInr } from "@/data/menu";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

const dietMeta: Record<
  NonNullable<MenuItem["diet"]>,
  { borderColor: string; dotColor: string }
> = {
  veg:     { borderColor: "border-green-600", dotColor: "bg-green-600" },
  egg:     { borderColor: "border-amber-500", dotColor: "bg-amber-500" },
  "non-veg": { borderColor: "border-red-600",  dotColor: "bg-red-600"  },
};

export function DishCard({ item }: { item: MenuItem }) {
  const addItem   = useCartStore((s) => s.addItem);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const lines     = useCartStore((s) => s.lines);

  const cartLine = lines.find((l) => l.itemId === item.id);
  const qty = cartLine?.qty ?? 0;

  const diet = item.diet ? dietMeta[item.diet] : null;

  return (
    <article className="flex items-start gap-4 border-b border-gray-100 py-5 last:border-0">
      {/* Left: content */}
      <div className="min-w-0 flex-1">
        {/* Diet indicator */}
        {diet && (
          <span
            className={cn(
              "mb-2 inline-flex h-4 w-4 items-center justify-center rounded-sm border-2",
              diet.borderColor,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", diet.dotColor)} />
          </span>
        )}

        <h3 className="text-[15px] font-semibold leading-snug text-gray-900">
          {item.name}
        </h3>

        {item.bestseller && (
          <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-orange">
            ★ Bestseller
          </p>
        )}

        {item.spicy && !item.bestseller && (
          <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-red-500">
            🌶 Spicy
          </p>
        )}

        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-gray-500">
          {item.description}
        </p>

        <p className="mt-2 text-[15px] font-bold text-gray-900">
          {formatInr(item.price)}
        </p>
      </div>

      {/* Right: image + add/qty */}
      <div className="relative flex-shrink-0">
        {/* Emoji image box */}
        <div className="flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-cream via-white to-brand-cream-dark">
          <span className="select-none text-5xl drop-shadow-sm">{item.emoji}</span>
        </div>

        {/* ADD / Stepper — overlaps bottom edge of image */}
        <AnimatePresence mode="wait" initial={false}>
          {qty === 0 ? (
            <motion.button
              key="add"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              type="button"
              onClick={() => addItem(item)}
              className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-xl border-2 border-brand-orange bg-white px-4 py-1 text-[13px] font-extrabold text-brand-orange shadow-sm transition-colors hover:bg-brand-orange hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={3} />
              ADD
            </motion.button>
          ) : (
            <motion.div
              key="stepper"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-brand-orange px-2.5 py-1 shadow-md"
            >
              <button
                type="button"
                aria-label="Decrease"
                onClick={() => decrement(item.id)}
                className="flex h-5 w-5 items-center justify-center rounded-md text-white transition-opacity hover:opacity-75"
              >
                <Minus className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
              <span className="min-w-[1.1rem] text-center text-[13px] font-extrabold text-white">
                {qty}
              </span>
              <button
                type="button"
                aria-label="Increase"
                onClick={() => increment(item.id)}
                className="flex h-5 w-5 items-center justify-center rounded-md text-white transition-opacity hover:opacity-75"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}
