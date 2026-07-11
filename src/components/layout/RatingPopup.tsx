"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, UtensilsCrossed, Bike } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const DISMISSED_KEY = "bl_rating_dismissed";

function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function addDismissed(orderNumber: string) {
  try {
    const s = getDismissed();
    s.add(orderNumber);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...s]));
  } catch { /* noop */ }
}

function MiniStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="touch-manipulation p-0.5 transition-transform active:scale-110"
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              s <= active ? "fill-amber-400 stroke-amber-400" : "fill-transparent stroke-gray-300"
            }`}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

export function RatingPopup() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);

  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Don't show on the order detail page (it already has the inline card)
  const isOrderPage = pathname.startsWith("/orders/");
  const isCartPage = pathname.startsWith("/cart") || pathname.startsWith("/checkout");

  const findUnrated = useCallback(async () => {
    if (!user || isOrderPage || isCartPage) return;
    try {
      const res = await fetch("/api/orders/mine");
      const payload = await res.json();
      const orders: { orderNumber: string; status: string; ratedAt: string | null }[] = payload.orders ?? [];
      const dismissed = getDismissed();
      const target = orders.find(
        (o) => o.status === "delivered" && !o.ratedAt && !dismissed.has(o.orderNumber),
      );
      if (target) setOrderNumber(target.orderNumber);
    } catch { /* noop */ }
  }, [user, isOrderPage, isCartPage]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const t = setTimeout(findUnrated, 1800);
    return () => clearTimeout(t);
  }, [status, findUnrated]);

  function dismiss() {
    if (orderNumber) addDismissed(orderNumber);
    setOrderNumber(null);
  }

  async function submit() {
    if (!foodRating || !deliveryRating || !orderNumber) return;
    setSubmitting(true);
    try {
      await fetch(`/api/orders/${orderNumber}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodRating, deliveryRating }),
      });
      setDone(true);
      setTimeout(() => setOrderNumber(null), 2000);
    } catch { /* noop */ } finally {
      setSubmitting(false);
    }
  }

  const visible = !!orderNumber && !isOrderPage && !isCartPage;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-[72px] left-0 right-0 z-[900] flex justify-center px-3 md:bottom-6"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-[24px] bg-white shadow-[0_12px_48px_rgba(15,23,42,0.18)] ring-1 ring-black/5">
            {/* Top bar */}
            <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" strokeWidth={1.5} />
                <p className="text-[13px] font-extrabold text-gray-800">
                  {done ? "Thanks for rating! 🎉" : "Rate your last order"}
                </p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>

            {!done && (
              <div className="px-4 py-3 space-y-3">
                {/* Food */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <UtensilsCrossed className="h-4 w-4 text-brand-orange" strokeWidth={2} />
                    <span className="text-[12px] font-bold text-gray-700">Food</span>
                  </div>
                  <MiniStars value={foodRating} onChange={setFoodRating} />
                </div>

                {/* Delivery */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <Bike className="h-4 w-4 text-brand-orange" strokeWidth={2} />
                    <span className="text-[12px] font-bold text-gray-700">Delivery</span>
                  </div>
                  <MiniStars value={deliveryRating} onChange={setDeliveryRating} />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={dismiss}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-[12px] font-bold text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Later
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!foodRating || !deliveryRating || submitting}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold py-2 text-[13px] font-extrabold text-white shadow-sm shadow-brand-orange/20 disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    {submitting ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Star className="h-3.5 w-3.5 fill-white stroke-white" strokeWidth={1.5} />
                    )}
                    Submit rating
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
