"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Zap, Flame } from "lucide-react";
import type { MenuItem } from "@/data/menu";
import { formatInr, getItemAddons } from "@/data/menu";
import { useCartStore } from "@/stores/cart-store";
import { useSettingsStore } from "@/stores/settings-store";
import { cn } from "@/lib/utils";

const dietMeta: Record<
  NonNullable<MenuItem["diet"]>,
  { borderColor: string; dotColor: string }
> = {
  veg:       { borderColor: "border-green-600", dotColor: "bg-green-600" },
  egg:       { borderColor: "border-amber-500", dotColor: "bg-amber-500" },
  "non-veg": { borderColor: "border-red-600",   dotColor: "bg-red-600"   },
};

export function DishCard({
  item,
  index = 0,
  onOpen,
}: {
  item: MenuItem;
  index?: number;
  onOpen?: () => void;
}) {
  const addItem   = useCartStore((s) => s.addItem);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const lines     = useCartStore((s) => s.lines);

  const cartLine = lines.find((l) => l.itemId === item.id);
  const qty      = cartLine?.qty ?? 0;
  const diet     = item.diet ? dietMeta[item.diet] : null;

  const addons   = getItemAddons(item);
  const hasAddons = addons.length > 0;

  // Check if kitchen is closed
  const settings = useSettingsStore((s) => s.settings);
  const isClosed = settings && !settings.kitchen_open;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: "easeOut" }}
      className="group relative flex items-start gap-4 border-b border-gray-100 py-5 last:border-0"
    >
      {/* ── Clickable area → opens detail sheet ── */}
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 items-start gap-4 text-left"
        aria-label={`View details for ${item.name}`}
      >
        {/* Left: info */}
        <div className="min-w-0 flex-1">
          {diet && (
            <span
              className={cn(
                "mb-1.5 inline-flex h-[18px] w-[18px] items-center justify-center rounded-sm border-2",
                diet.borderColor,
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", diet.dotColor)} />
            </span>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {item.bestseller && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-600 border border-amber-200">
                <Zap className="h-2.5 w-2.5" fill="currentColor" />
                Bestseller
              </span>
            )}
            {item.spicy && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-red-500 border border-red-200">
                <Flame className="h-2.5 w-2.5" fill="currentColor" />
                Spicy
              </span>
            )}
          </div>

          <h3 className="text-[15px] font-bold leading-snug text-gray-900 group-hover:text-brand-orange transition-colors">
            {item.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-gray-400">
            {item.description}
          </p>
          <p className="price-text mt-2.5 text-[18px] font-black leading-none text-gray-900">
            {formatInr(item.price)}
          </p>
        </div>

        {/* Right: image */}
        <div className="relative h-[110px] w-[110px] flex-shrink-0 overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/[0.05]">
          {item.image ? (
            <>
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="110px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-cream via-white to-brand-cream-dark">
              <span className="select-none text-5xl drop-shadow-sm">{item.emoji}</span>
            </div>
          )}
        </div>
      </button>

      {/* ── ADD / Stepper — outside clickable area, bottom-right ── */}
      <div className="absolute bottom-5 right-0 flex flex-col items-center gap-1.5">
        <AnimatePresence mode="wait" initial={false}>
          {isClosed ? (
            <motion.button
              key="closed"
              disabled
              className="flex items-center gap-1 whitespace-nowrap rounded-xl border border-gray-200 bg-gray-100 px-4 py-1.5 text-[12px] font-extrabold text-gray-400 cursor-not-allowed shadow-none"
            >
              CLOSED
            </motion.button>
          ) : hasAddons ? (
            <motion.button
              key="add-custom"
              type="button"
              onClick={onOpen}
              className="flex items-center gap-1 whitespace-nowrap rounded-xl border-2 border-brand-orange bg-white px-4 py-1.5 text-[12px] font-extrabold text-brand-orange shadow-md shadow-brand-orange/20 transition-all hover:bg-brand-orange hover:text-white active:scale-95"
            >
              <Plus className="h-3 w-3" strokeWidth={3} />
              ADD
            </motion.button>
          ) : qty === 0 ? (
            <motion.button
              key="add"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              type="button"
              onClick={() => addItem(item)}
              className="flex items-center gap-1 whitespace-nowrap rounded-xl border-2 border-brand-orange bg-white px-4 py-1.5 text-[12px] font-extrabold text-brand-orange shadow-md shadow-brand-orange/20 transition-all hover:bg-brand-orange hover:text-white active:scale-95"
            >
              <Plus className="h-3 w-3" strokeWidth={3} />
              ADD
            </motion.button>
          ) : (
            <motion.div
              key="stepper"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 rounded-xl bg-brand-orange px-3 py-1.5 shadow-md shadow-brand-orange/30"
            >
              <button
                type="button"
                aria-label="Decrease"
                onClick={() => decrement(item.id)}
                className="flex h-5 w-5 items-center justify-center rounded-lg text-white active:scale-90"
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
                className="flex h-5 w-5 items-center justify-center rounded-lg text-white active:scale-90"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {hasAddons && (
          <span className="text-[9px] font-bold text-gray-400 tracking-wider leading-none">
            customisable
          </span>
        )}
      </div>
    </motion.article>
  );
}
