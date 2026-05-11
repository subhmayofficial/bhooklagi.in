"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Phone, Clock, Bike } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { type TestOrderSnapshot, loadTestOrder } from "@/lib/test-order";
import { formatInr } from "@/data/menu";

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<TestOrderSnapshot | null | undefined>(undefined);

  useEffect(() => {
    setOrder(loadTestOrder());
  }, []);

  if (order === undefined) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-lg px-4 pb-28 pt-28 text-center">
          <p className="text-[14px] text-gray-400">Loading…</p>
        </main>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-lg px-4 pb-28 pt-24 text-center">
          <p className="text-[18px] font-bold text-gray-800">No order found</p>
          <p className="mt-2 text-[14px] text-gray-500">
            Place an order from your cart — this page shows your last checkout.
          </p>
          <Link
            href="/menu"
            className="mt-8 inline-flex rounded-full bg-brand-orange px-8 py-3 text-[14px] font-bold text-white"
          >
            Browse menu
          </Link>
        </main>
      </>
    );
  }

  const placed = new Date(order.placedAtIso);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-20 md:pb-16 md:pt-24">

        {/* Success card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg"
        >
          {/* Green header */}
          <div className="flex flex-col items-center bg-gradient-to-br from-green-500 to-emerald-600 px-6 py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 280, damping: 20 }}
            >
              <CheckCircle2 className="h-16 w-16 text-white" strokeWidth={1.5} />
            </motion.div>
            <h1 className="mt-3 text-[22px] font-extrabold text-white">Order placed!</h1>
            <p className="mt-1 text-[13px] text-white/80">
              We&apos;ll start preparing your food right away
            </p>
          </div>

          {/* Order meta */}
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Order ID</p>
                <p className="mt-0.5 font-mono text-[14px] font-bold text-gray-900">{order.orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Placed at</p>
                <p className="mt-0.5 text-[13px] font-semibold text-gray-700">
                  {placed.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            </div>
          </div>

          {/* Estimated time */}
          <div className="flex items-center gap-3 border-b border-gray-100 bg-orange-50 px-5 py-3.5">
            <Clock className="h-4 w-4 text-brand-orange" />
            <div>
              <p className="text-[13px] font-bold text-gray-900">Estimated delivery: 30 – 45 mins</p>
              <p className="text-[11px] text-gray-500">Rider will call you on arrival</p>
            </div>
          </div>

          {/* Delivery address */}
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Delivering to</p>
                <p className="mt-0.5 text-[13px] font-semibold text-gray-900">{order.delivery.name}</p>
                <p className="text-[13px] text-gray-600">{order.delivery.address}</p>
                {order.delivery.landmark && (
                  <p className="text-[12px] text-gray-400">Near: {order.delivery.landmark}</p>
                )}
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-[13px] text-gray-600">+91 {order.delivery.phone}</p>
            </div>
          </div>

          {/* Payment method */}
          <div className="border-b border-gray-100 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Bike className="h-4 w-4 text-gray-400" />
              <p className="text-[13px] font-semibold text-gray-700">
                {order.paymentMode === "cod" ? "Cash on Delivery" : "Pay Online"}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="px-5 py-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Your items
            </p>
            <ul className="space-y-2.5">
              {order.lines.map((l) => (
                <li key={l.itemId} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="text-xl">{l.emoji}</span>
                    <span className="truncate text-[13px] font-medium text-gray-800">
                      {l.name}
                      <span className="ml-1 text-gray-400">×{l.qty}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-[13px] font-semibold text-gray-900">
                    {formatInr(l.unitPrice * l.qty)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bill summary */}
          <div className="space-y-2 border-t border-gray-100 bg-gray-50 px-5 py-4">
            <div className="flex justify-between text-[13px] text-gray-500">
              <span>Item total</span><span>{formatInr(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[13px] text-gray-500">
              <span>Delivery</span>
              <span className={order.deliveryFee === 0 ? "font-semibold text-green-600" : ""}>
                {order.deliveryFee === 0 ? "FREE" : formatInr(order.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-[13px] text-gray-500">
              <span>Taxes</span><span>{formatInr(order.gst)}</span>
            </div>
            <div className="flex justify-between pt-2 text-[16px] font-extrabold text-gray-900">
              <span>Total paid</span>
              <span className="text-brand-orange">{formatInr(order.grand)}</span>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/menu"
            className="flex items-center justify-center rounded-2xl border-2 border-gray-200 bg-white py-3.5 text-[14px] font-bold text-gray-700 transition-colors hover:border-brand-orange/30 hover:text-brand-orange"
          >
            Order more
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center rounded-2xl bg-ink py-3.5 text-[14px] font-bold text-brand-gold transition-opacity hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </main>
    </>
  );
}
