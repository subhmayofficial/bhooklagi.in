"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, Tag, ChevronRight, ShoppingBag } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useCartStore, cartTotals, type CartLine } from "@/stores/cart-store";
import { formatInr } from "@/data/menu";
import { useState } from "react";

const VALID_PROMO = "BHOOK20";

export default function CartPage() {
  const router = useRouter();
  const lines     = useCartStore((s) => s.lines);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const remove    = useCartStore((s) => s.remove);
  const { subtotal, qty } = cartTotals(lines);

  const deliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 49;
  const gst         = Math.round(subtotal * 0.05);

  const [promoInput, setPromoInput]   = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError]   = useState("");
  const promoDiscount = promoApplied ? 80 : 0;
  const grand = Math.max(0, subtotal + deliveryFee + gst - promoDiscount);

  function applyPromo() {
    if (promoInput.trim().toUpperCase() === VALID_PROMO) {
      if (subtotal < 299) {
        setPromoError("Minimum order ₹299 required for this code.");
        setPromoApplied(false);
      } else {
        setPromoApplied(true);
        setPromoError("");
      }
    } else {
      setPromoError("Invalid promo code.");
      setPromoApplied(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-20 md:pb-16 md:pt-24">

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-gray-900">
            Your bag
          </h1>
          <p className="mt-0.5 text-[13px] text-gray-500">
            {qty === 0
              ? "Your bag is empty."
              : `${qty} item${qty > 1 ? "s" : ""} added`}
          </p>
        </div>

        {/* Empty state */}
        {lines.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center rounded-3xl border border-dashed border-gray-200 bg-white py-16 text-center"
          >
            <ShoppingBag className="h-12 w-12 text-gray-300" strokeWidth={1.5} />
            <p className="mt-4 text-[15px] font-bold text-gray-700">Nothing in your bag yet</p>
            <p className="mt-1 text-[13px] text-gray-400">Add some delicious food to get started</p>
            <Link
              href="/menu"
              className="mt-6 inline-flex rounded-full bg-brand-orange px-8 py-3 text-[14px] font-bold text-white shadow-md hover:bg-brand-orange-dark transition-colors"
            >
              Browse menu
            </Link>
          </motion.div>
        )}

        {lines.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            {/* Left: items + promo */}
            <div className="space-y-4">
              {/* Cart items */}
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h2 className="text-[13px] font-bold uppercase tracking-wide text-gray-400">
                    Items ({qty})
                  </h2>
                </div>
                <AnimatePresence initial={false}>
                  {lines.map((line) => (
                    <CartRow
                      key={line.itemId}
                      line={line}
                      onInc={() => increment(line.itemId)}
                      onDec={() => decrement(line.itemId)}
                      onRemove={() => remove(line.itemId)}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Promo code */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-brand-orange" />
                  <h2 className="text-[14px] font-bold text-gray-900">Apply promo code</h2>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value.toUpperCase());
                      setPromoError("");
                      if (promoApplied) setPromoApplied(false);
                    }}
                    placeholder="Enter code (try BHOOK20)"
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={!promoInput}
                    className="rounded-xl bg-brand-orange px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-40 hover:bg-brand-orange-dark transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="mt-2 text-[12px] font-semibold text-green-600">
                    ✓ Promo applied — ₹80 off!
                  </p>
                )}
                {promoError && (
                  <p className="mt-2 text-[12px] font-semibold text-red-500">{promoError}</p>
                )}
              </div>

              {/* Delivery info note */}
              {deliveryFee === 0 && subtotal > 0 && (
                <div className="flex items-center gap-2 rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
                  <span className="text-lg">🎉</span>
                  <p className="text-[13px] font-semibold text-green-700">
                    You&apos;ve unlocked free delivery!
                  </p>
                </div>
              )}
              {deliveryFee > 0 && (
                <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <span className="text-base">🛵</span>
                  <p className="text-[13px] text-gray-600">
                    Add <span className="font-bold text-gray-900">{formatInr(299 - subtotal)}</span> more for free delivery
                  </p>
                </div>
              )}
            </div>

            {/* Right: bill summary */}
            <div className="h-fit space-y-4 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-[13px] font-bold uppercase tracking-wide text-gray-400">
                  Bill details
                </h2>
                <div className="space-y-3">
                  <BillRow label="Item total" value={formatInr(subtotal)} />
                  <BillRow
                    label="Delivery charge"
                    value={deliveryFee === 0 ? "FREE" : formatInr(deliveryFee)}
                    valueClass={deliveryFee === 0 ? "text-green-600 font-bold" : undefined}
                    hint={deliveryFee > 0 ? "Free above ₹299" : undefined}
                  />
                  <BillRow label="Taxes & charges" value={formatInr(gst)} />
                  {promoApplied && (
                    <BillRow
                      label="Promo discount"
                      value={`-${formatInr(promoDiscount)}`}
                      valueClass="text-green-600 font-bold"
                    />
                  )}
                </div>
                <div className="my-4 h-px bg-gray-100" />
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-extrabold text-gray-900">To pay</span>
                  <span className="text-[18px] font-extrabold text-brand-orange">
                    {formatInr(grand)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="flex w-full items-center justify-between rounded-2xl bg-brand-orange px-5 py-4 shadow-[0_8px_24px_rgba(232,93,4,0.35)] transition-all hover:bg-brand-orange-dark active:scale-[0.99]"
              >
                <span className="text-[15px] font-extrabold text-white">Proceed to checkout</span>
                <ChevronRight className="h-5 w-5 text-white" strokeWidth={2.5} />
              </button>

              <p className="text-center text-[11px] text-gray-400">
                Secure checkout · Razorpay payment coming soon
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function CartRow({
  line,
  onInc,
  onDec,
  onRemove,
}: {
  line: CartLine;
  onInc: () => void;
  onDec: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 16 }}
      className="flex items-center gap-4 border-b border-gray-50 px-4 py-4 last:border-0"
    >
      <span className="text-3xl">{line.emoji}</span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-gray-900">{line.name}</p>
        <p className="text-[12px] text-gray-400">{formatInr(line.unitPrice)} each</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-2 py-1.5">
        <button
          type="button"
          aria-label="Decrease"
          onClick={onDec}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
        <span className="min-w-[1.2rem] text-center text-[13px] font-bold text-gray-900">
          {line.qty}
        </span>
        <button
          type="button"
          aria-label="Increase"
          onClick={onInc}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>

      <div className="text-right">
        <p className="text-[14px] font-bold text-gray-900">
          {formatInr(line.unitPrice * line.qty)}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="mt-0.5 text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Remove"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function BillRow({
  label,
  value,
  hint,
  valueClass,
}: {
  label: string;
  value: string;
  hint?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[13px] text-gray-600">{label}</p>
        {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
      </div>
      <p className={`text-[13px] font-semibold text-gray-900 ${valueClass ?? ""}`}>{value}</p>
    </div>
  );
}
