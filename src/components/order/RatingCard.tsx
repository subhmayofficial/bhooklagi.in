"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Bike, UtensilsCrossed, CheckCircle2 } from "lucide-react";

interface Props {
  orderNumber: string;
  onRated?: () => void;
}

function StarPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="touch-manipulation p-0.5 transition-transform active:scale-110 disabled:pointer-events-none"
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              star <= active
                ? "fill-amber-400 stroke-amber-400"
                : "fill-transparent stroke-gray-300"
            }`}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

function ratingLabel(v: number) {
  return ["", "Poor", "Fair", "Good", "Great", "Excellent!"][v] ?? "";
}

export function RatingCard({ orderNumber, onRated }: Props) {
  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!foodRating || !deliveryRating) {
      setError("Please rate both food and delivery.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderNumber}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodRating, deliveryRating, comment }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Could not save rating.");
      setDone(true);
      onRated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save rating.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {done ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 rounded-2xl border border-green-100 bg-green-50 px-6 py-8 text-center shadow-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
          >
            <CheckCircle2 className="h-12 w-12 text-green-500" strokeWidth={1.8} />
          </motion.div>
          <p className="text-[17px] font-extrabold text-green-800">Thanks for the feedback!</p>
          <p className="text-[13px] text-green-600">Your rating helps us serve you better.</p>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3">
            <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" strokeWidth={1.5} />
            <p className="text-[13px] font-extrabold text-gray-800">Rate your order</p>
          </div>

          <div className="space-y-5 px-4 py-4">
            {/* Food rating */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-brand-orange" strokeWidth={2} />
                <p className="text-[13px] font-bold text-gray-700">Food quality</p>
                {foodRating > 0 && (
                  <span className="ml-auto text-[11px] font-bold text-amber-500">{ratingLabel(foodRating)}</span>
                )}
              </div>
              <StarPicker value={foodRating} onChange={setFoodRating} disabled={submitting} />
            </div>

            {/* Delivery rating */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Bike className="h-4 w-4 text-brand-orange" strokeWidth={2} />
                <p className="text-[13px] font-bold text-gray-700">Delivery experience</p>
                {deliveryRating > 0 && (
                  <span className="ml-auto text-[11px] font-bold text-amber-500">{ratingLabel(deliveryRating)}</span>
                )}
              </div>
              <StarPicker value={deliveryRating} onChange={setDeliveryRating} disabled={submitting} />
            </div>

            {/* Comment */}
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={submitting}
                placeholder="Any feedback? (optional)"
                rows={2}
                maxLength={300}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] text-gray-800 placeholder:text-gray-400 focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/15 disabled:opacity-50 transition-all"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600">{error}</p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={submitting || !foodRating || !deliveryRating}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold py-3.5 text-[14px] font-extrabold text-white shadow-md shadow-brand-orange/20 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Submitting…
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 fill-white stroke-white" strokeWidth={1.5} />
                  Submit Rating
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
