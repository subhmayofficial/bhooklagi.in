"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus, Plus, Trash2, Tag, ChevronRight, ShoppingBag,
  ArrowLeft, Clock, Shield, Bike, Sparkles, CheckCircle2,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useCartStore, cartTotals, type CartLine } from "@/stores/cart-store";
import { menuItems, formatInr } from "@/data/menu";
import { useState } from "react";

const VALID_PROMO = "BHOOK20";

export default function CartPage() {
  const router    = useRouter();
  const lines     = useCartStore((s) => s.lines);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const remove    = useCartStore((s) => s.remove);
  const { subtotal, qty } = cartTotals(lines);

  const deliveryFee    = subtotal >= 299 || subtotal === 0 ? 0 : 49;
  const gst            = Math.round(subtotal * 0.05);
  const [promoInput, setPromoInput]     = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError]     = useState("");
  const [showBillDetails, setShowBillDetails] = useState(true);
  const promoDiscount = promoApplied ? 80 : 0;
  const grand = Math.max(0, subtotal + deliveryFee + gst - promoDiscount);
  const freeDeliveryAt = 299;
  const progress = Math.min((subtotal / freeDeliveryAt) * 100, 100);

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
      setPromoError("Invalid promo code. Try BHOOK20");
      setPromoApplied(false);
    }
  }

  return (
    <>
      <SiteHeader />

      {/* ── Page hero bar ── */}
      <div className="fixed left-0 right-0 top-[56px] z-[700] border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-3xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-[15px] font-extrabold text-gray-900">
              Your Bag {qty > 0 && <span className="text-brand-orange">({qty})</span>}
            </h1>
            <p className="text-[10px] text-gray-400">Bhook Lagi · Deoghar</p>
          </div>
        </div>
      </div>

      <main className="min-h-screen bg-gray-50 pb-36 pt-[108px] md:pb-16">
        <div className="mx-auto max-w-3xl px-4">

          {/* ════════════════════ EMPTY STATE ════════════════════ */}
          <AnimatePresence>
            {lines.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center shadow-sm"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ShoppingBag className="h-16 w-16 text-gray-200" strokeWidth={1.2} />
                </motion.div>
                <p className="mt-5 text-[18px] font-extrabold text-gray-700">Your bag is empty</p>
                <p className="mt-1 text-[13px] text-gray-400">Add some delicious food to get started</p>
                <Link
                  href="/menu"
                  className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold px-8 py-3.5 text-[14px] font-extrabold text-white shadow-lg shadow-brand-orange/30 transition-all hover:shadow-xl active:scale-95"
                >
                  <ShoppingBag className="h-4 w-4" strokeWidth={2.5} />
                  Browse menu
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ════════════════════ CART CONTENT ════════════════════ */}
          {lines.length > 0 && (
            <div className="space-y-3">

              {/* ── Free delivery progress bar ── */}
              {subtotal < freeDeliveryAt && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bike className="h-4 w-4 text-amber-600" strokeWidth={2} />
                      <p className="text-[12px] font-bold text-amber-800">
                        Add <span className="text-amber-600">{formatInr(freeDeliveryAt - subtotal)}</span> more for free delivery
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-500">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-brand-orange"
                    />
                  </div>
                </motion.div>
              )}
              {subtotal >= freeDeliveryAt && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" strokeWidth={2} />
                  <p className="text-[13px] font-bold text-green-700">🎉 You&apos;ve unlocked free delivery!</p>
                </div>
              )}

              {/* ── Restaurant info strip ── */}
              <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange/10 text-[20px]">🍔</span>
                <div className="flex-1">
                  <p className="text-[13px] font-extrabold text-gray-900">Bhook Lagi</p>
                  <p className="text-[11px] text-gray-400">Street food · Deoghar, Jharkhand</p>
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-green-50 px-2.5 py-1">
                  <Clock className="h-3 w-3 text-green-600" strokeWidth={2} />
                  <span className="text-[11px] font-bold text-green-700">25–35 min</span>
                </div>
              </div>

              {/* ── Cart items card ── */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-50 px-4 py-3">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                    Items · {qty} added
                  </p>
                  <Link href="/menu" className="text-[11px] font-bold text-brand-orange hover:underline">
                    + Add more
                  </Link>
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

              {/* ── Promo code ── */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange/10">
                    <Tag className="h-4 w-4 text-brand-orange" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[13px] font-extrabold text-gray-900">Promo code</p>
                    <p className="text-[10px] text-gray-400">Try BHOOK20 for ₹80 off on orders above ₹299</p>
                  </div>
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
                    placeholder="Enter promo code"
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={!promoInput}
                    className="rounded-xl bg-brand-orange px-5 py-2.5 text-[13px] font-extrabold text-white disabled:opacity-40 hover:bg-brand-orange-dark transition-colors"
                  >
                    Apply
                  </button>
                </div>

                <AnimatePresence>
                  {promoApplied && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" strokeWidth={2.5} />
                      <p className="text-[12px] font-semibold text-green-600">BHOOK20 applied — ₹80 off!</p>
                    </motion.div>
                  )}
                  {promoError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 text-[12px] font-semibold text-red-500"
                    >
                      {promoError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Bill details card ── */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowBillDetails((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3.5"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-orange" strokeWidth={2} />
                    <span className="text-[13px] font-extrabold text-gray-900">Bill details</span>
                  </div>
                  {showBillDetails
                    ? <ChevronUp className="h-4 w-4 text-gray-400" strokeWidth={2.5} />
                    : <ChevronDown className="h-4 w-4 text-gray-400" strokeWidth={2.5} />
                  }
                </button>

                <AnimatePresence initial={false}>
                  {showBillDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2.5 border-t border-gray-50 px-4 pb-4 pt-3">
                        <BillRow label="Item total" value={formatInr(subtotal)} />
                        <BillRow
                          label="Delivery charge"
                          value={deliveryFee === 0 ? "FREE 🎉" : formatInr(deliveryFee)}
                          hint={deliveryFee > 0 ? "Free above ₹299" : undefined}
                          green={deliveryFee === 0}
                        />
                        <BillRow label="GST & charges" value={formatInr(gst)} hint="5% on food items" />
                        {promoApplied && (
                          <BillRow label="Promo discount (BHOOK20)" value={`-${formatInr(promoDiscount)}`} green />
                        )}
                        <div className="my-1 h-px bg-dashed bg-gray-100" />
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[15px] font-extrabold text-gray-900">To pay</span>
                          <span className="font-display text-[22px] leading-none tracking-wide text-brand-orange">
                            {formatInr(grand)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!showBillDetails && (
                  <div className="flex items-center justify-between border-t border-gray-50 px-4 py-3">
                    <span className="text-[13px] text-gray-500">Total</span>
                    <span className="font-display text-[18px] text-brand-orange">{formatInr(grand)}</span>
                  </div>
                )}
              </div>

              {/* ── Safety note ── */}
              <div className="flex items-center gap-2.5 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <Shield className="h-4 w-4 flex-shrink-0 text-green-600" strokeWidth={2} />
                <p className="text-[11px] leading-relaxed text-gray-500">
                  <span className="font-bold text-gray-700">100% safe & hygienic.</span>{" "}
                  Your food is freshly prepared after order placement. No pre-cooked batches.
                </p>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* ════════ STICKY CHECKOUT BAR ════════ */}
      <AnimatePresence>
        {lines.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[800] border-t border-white/20 bg-white/95 px-4 py-3 backdrop-blur-md md:bottom-0"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto max-w-3xl">
              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold px-5 py-4 shadow-[0_8px_28px_rgba(232,93,4,0.4)] transition-all active:scale-[0.99]"
              >
                {/* Shimmer sweep */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <div className="relative flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-[14px] font-extrabold text-white">
                    {qty}
                  </span>
                  <div className="text-left">
                    <p className="text-[14px] font-extrabold text-white">Proceed to checkout</p>
                    <p className="text-[11px] font-medium text-white/75">Razorpay · 100% secure</p>
                  </div>
                </div>

                <div className="relative flex items-center gap-1">
                  <span className="text-[15px] font-extrabold text-white">{formatInr(grand)}</span>
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ChevronRight className="h-5 w-5 text-white/80" strokeWidth={3} />
                  </motion.span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Cart row ─────────────────────────────────────────────────── */
function CartRow({
  line, onInc, onDec, onRemove,
}: { line: CartLine; onInc: () => void; onDec: () => void; onRemove: () => void }) {
  const menuItem = menuItems.find((m) => m.id === line.itemId);
  const dietColor = menuItem?.diet === "veg" ? "border-green-500 bg-green-50"
    : menuItem?.diet === "egg" ? "border-amber-500 bg-amber-50"
    : menuItem?.diet === "non-veg" ? "border-red-500 bg-red-50" : null;
  const dotColor = menuItem?.diet === "veg" ? "bg-green-500"
    : menuItem?.diet === "egg" ? "bg-amber-500"
    : menuItem?.diet === "non-veg" ? "bg-red-500" : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.22 }}
      className="flex items-center gap-3 border-b border-gray-50 px-4 py-4 last:border-0"
    >
      {/* Food image */}
      <div className="relative h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-xl bg-brand-cream shadow-sm">
        {line.image ? (
          <Image src={line.image} alt={line.name} fill sizes="60px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[28px]">{line.emoji}</div>
        )}
        {/* Diet indicator */}
        {dietColor && dotColor && (
          <span className={`absolute left-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-sm border-[1.5px] bg-white ${dietColor.split(" ")[0]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-gray-900">{line.name}</p>
        <p className="text-[11px] text-gray-400">{formatInr(line.unitPrice)} each</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1.5 rounded-xl bg-brand-orange px-2 py-1.5 shadow-sm shadow-brand-orange/20">
        <button
          type="button"
          aria-label="Decrease"
          onClick={onDec}
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30 active:scale-90"
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={3} />
        </button>
        <span className="min-w-[1.2rem] text-center text-[13px] font-extrabold text-white">{line.qty}</span>
        <button
          type="button"
          aria-label="Increase"
          onClick={onInc}
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30 active:scale-90"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={3} />
        </button>
      </div>

      {/* Line total + delete */}
      <div className="w-[52px] text-right">
        <p className="text-[13px] font-extrabold text-gray-900">{formatInr(line.unitPrice * line.qty)}</p>
        <button
          type="button"
          onClick={onRemove}
          className="mt-0.5 text-gray-300 transition-colors hover:text-red-500"
          aria-label="Remove"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

/* ── Bill row ─────────────────────────────────────────────────── */
function BillRow({ label, value, hint, green }: { label: string; value: string; hint?: string; green?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[12px] text-gray-600">{label}</p>
        {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
      </div>
      <p className={`text-[12px] font-semibold ${green ? "text-green-600" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}
