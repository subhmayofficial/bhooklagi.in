"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Phone, Clock } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { formatInr } from "@/data/menu";
import { ORDER_STATUS_META, type OrderRecord, type OrderStatus } from "@/lib/orders";

type OrderEvent = { status: string; note: string | null; created_at: string };

// The forward path a normal order walks through (cancelled is shown separately).
const TIMELINE: OrderStatus[] = ["placed", "preparing", "out_for_delivery", "delivered"];

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  const [order, setOrder] = useState<OrderRecord | null | undefined>(undefined);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        if (res.status === 404) {
          if (active) setOrder(null);
          return;
        }
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Could not load order.");
        if (active) {
          setOrder(payload.order);
          setEvents(payload.events ?? []);
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Could not load order.");
      }
    }
    load();
    // Poll so the customer sees kitchen status updates without refreshing.
    const t = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [orderNumber]);

  if (order === undefined && !error) {
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
          <p className="text-[18px] font-bold text-gray-800">Order not found</p>
          <p className="mt-2 text-[14px] text-gray-500">{error || "This order doesn't exist or isn't yours."}</p>
          <Link
            href="/orders"
            className="mt-8 inline-flex rounded-full bg-brand-orange px-8 py-3 text-[14px] font-bold text-white"
          >
            My orders
          </Link>
        </main>
      </>
    );
  }

  const meta = ORDER_STATUS_META[order.status];
  const cancelled = order.status === "cancelled";
  const currentIndex = TIMELINE.indexOf(order.status);
  const placedAt = new Date(order.createdAt);
  const eventTime = (status: OrderStatus) =>
    events.find((e) => e.status === status)?.created_at;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-20 md:pb-16 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg"
        >
          {/* Header */}
          <div
            className={`flex flex-col items-center px-6 py-8 text-center ${
              cancelled
                ? "bg-gradient-to-br from-red-500 to-rose-600"
                : "bg-gradient-to-br from-green-500 to-emerald-600"
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 280, damping: 20 }}
            >
              <span className="text-5xl">{meta.emoji}</span>
            </motion.div>
            <h1 className="mt-3 text-[22px] font-extrabold text-white">{meta.label}</h1>
            <p className="mt-1 text-[13px] text-white/85">{meta.customerLine}</p>
          </div>

          {/* Order meta */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Order</p>
              <p className="mt-0.5 font-mono text-[14px] font-bold text-gray-900">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Placed</p>
              <p className="mt-0.5 text-[13px] font-semibold text-gray-700">
                {placedAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
          </div>

          {/* Status timeline */}
          {!cancelled && (
            <div className="border-b border-gray-100 px-5 py-5">
              <ul className="space-y-4">
                {TIMELINE.map((status, i) => {
                  const done = i <= currentIndex;
                  const active = i === currentIndex;
                  const sMeta = ORDER_STATUS_META[status];
                  const at = eventTime(status);
                  return (
                    <li key={status} className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] ${
                          done ? "bg-brand-orange text-white" : "bg-gray-100 text-gray-300"
                        }`}
                      >
                        {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                      </span>
                      <div className="flex flex-1 items-center justify-between">
                        <span
                          className={`text-[14px] ${
                            active ? "font-bold text-gray-900" : done ? "font-semibold text-gray-700" : "text-gray-400"
                          }`}
                        >
                          {sMeta.emoji} {sMeta.label}
                        </span>
                        {at && (
                          <span className="text-[11px] text-gray-400">
                            {new Date(at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Estimated time */}
          {!cancelled && order.status !== "delivered" && (
            <div className="flex items-center gap-3 border-b border-gray-100 bg-orange-50 px-5 py-3.5">
              <Clock className="h-4 w-4 text-brand-orange" />
              <p className="text-[13px] font-bold text-gray-900">Estimated delivery: 30 – 45 mins</p>
            </div>
          )}

          {/* Delivery */}
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Delivering to</p>
                <p className="mt-0.5 text-[13px] font-semibold text-gray-900">{order.deliveryName}</p>
                <p className="text-[13px] text-gray-600">{order.deliveryAddress}</p>
                {order.deliveryLandmark && (
                  <p className="text-[12px] text-gray-400">Near: {order.deliveryLandmark}</p>
                )}
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-[13px] text-gray-600">+91 {order.deliveryPhone.slice(-10)}</p>
            </div>
          </div>

          {/* Items */}
          <div className="px-5 py-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Your items</p>
            <ul className="space-y-2.5">
              {order.items.map((l) => (
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

          {/* Bill */}
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
              <span>Total ({order.paymentMode === "cod" ? "Cash on Delivery" : "Paid"})</span>
              <span className="text-brand-orange">{formatInr(order.grandTotal)}</span>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/orders"
            className="flex items-center justify-center rounded-2xl border-2 border-gray-200 bg-white py-3.5 text-[14px] font-bold text-gray-700 transition-colors hover:border-brand-orange/30 hover:text-brand-orange"
          >
            My orders
          </Link>
          <Link
            href="/menu"
            className="flex items-center justify-center rounded-2xl bg-ink py-3.5 text-[14px] font-bold text-brand-gold transition-opacity hover:opacity-90"
          >
            Order more
          </Link>
        </div>
      </main>
    </>
  );
}
