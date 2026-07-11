"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Zap, Flame, Star } from "lucide-react";
import { menuItems, formatInr, type MenuItem } from "@/data/menu";
import { useCartStore } from "@/stores/cart-store";

interface ItemDetailSheetProps {
  itemId: string | null;
  onClose: () => void;
}

export function ItemDetailSheet({ itemId, onClose }: ItemDetailSheetProps) {
  const item = itemId ? menuItems.find((m) => m.id === itemId) ?? null : null;

  const addItem   = useCartStore((s) => s.addItem);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const lines     = useCartStore((s) => s.lines);
  const cartLine  = item ? lines.find((l) => l.itemId === item.id) : null;
  const qty       = cartLine?.qty ?? 0;

  /* lock body scroll while open */
  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [item]);

  /* close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const dietColors: Record<string, { border: string; dot: string; bg: string; label: string }> = {
    veg:       { border: "border-green-500", dot: "bg-green-500", bg: "bg-green-50",  label: "Pure Veg" },
    egg:       { border: "border-amber-500", dot: "bg-amber-500", bg: "bg-amber-50",  label: "Egg" },
    "non-veg": { border: "border-red-500",   dot: "bg-red-500",   bg: "bg-red-50",    label: "Non-Veg" },
  };

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-[900] bg-black/50 backdrop-blur-[2px]"
          />

          {/* ── Bottom Sheet ── */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.9 }}
            className="fixed bottom-0 left-0 right-0 z-[910] mx-auto max-w-lg overflow-hidden rounded-t-[28px] bg-white shadow-[0_-8px_48px_rgba(0,0,0,0.22)]"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 z-10"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>

            {/* ── Full image ── */}
            <div className="relative h-[230px] w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              {item.image ? (
                <>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                  />
                  {/* gradient overlay bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[80px]">
                  {item.emoji}
                </div>
              )}

              {/* Badges on image */}
              <div className="absolute bottom-3 left-4 flex gap-2">
                {item.bestseller && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-extrabold uppercase text-white shadow">
                    <Zap className="h-2.5 w-2.5" fill="currentColor" /> Bestseller
                  </span>
                )}
                {item.spicy && (
                  <span className="flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-extrabold uppercase text-white shadow">
                    <Flame className="h-2.5 w-2.5" fill="currentColor" /> Spicy
                  </span>
                )}
              </div>
            </div>

            {/* ── Content ── */}
            <div className="px-5 py-4">
              {/* Diet + name row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {item.diet && (
                    <div className={`mb-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${dietColors[item.diet].bg}`}>
                      <span className={`h-[14px] w-[14px] flex items-center justify-center rounded-sm border-2 ${dietColors[item.diet].border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${dietColors[item.diet].dot}`} />
                      </span>
                      <span className={`${item.diet === "veg" ? "text-green-700" : item.diet === "egg" ? "text-amber-700" : "text-red-700"}`}>
                        {dietColors[item.diet].label}
                      </span>
                    </div>
                  )}
                  <h2 className="text-[20px] font-extrabold leading-tight text-gray-900">
                    {item.name}
                  </h2>
                </div>

                {/* Rating pill */}
                <div className="flex flex-shrink-0 items-center gap-1 rounded-xl bg-green-50 px-2.5 py-1.5 border border-green-100">
                  <Star className="h-3 w-3 fill-green-600 text-green-600" />
                  <span className="text-[12px] font-extrabold text-green-700">4.8</span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
                {item.description}
              </p>

              {/* Divider */}
              <div className="my-4 h-px bg-gray-100" />

              {/* ── Price + Add to cart ── */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Price</p>
                  <p className="price-text text-[28px] font-black leading-none text-gray-900">
                    {formatInr(item.price)}
                  </p>
                </div>

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
                      className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold px-7 py-3.5 text-[15px] font-extrabold text-white shadow-lg shadow-brand-orange/30 transition-all active:scale-95"
                    >
                      <Plus className="h-4 w-4" strokeWidth={3} />
                      Add to bag
                    </motion.button>
                  ) : (
                    <motion.div
                      key="stepper"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold px-4 py-3 shadow-lg shadow-brand-orange/30"
                    >
                      <button
                        type="button"
                        onClick={() => decrement(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white transition-colors hover:bg-white/30 active:scale-90"
                      >
                        <Minus className="h-4 w-4" strokeWidth={3} />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-[18px] font-extrabold text-white">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => increment(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white transition-colors hover:bg-white/30 active:scale-90"
                      >
                        <Plus className="h-4 w-4" strokeWidth={3} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Customisation note */}
              <p className="mt-3 text-center text-[11px] text-gray-400">
                🌿 Made fresh · No pre-cooked batches · Deoghar delivery
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
