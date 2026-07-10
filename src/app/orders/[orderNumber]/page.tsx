"use client";

import { use, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2, MapPin, Phone, Clock, ChevronLeft,
  Bike, Package, UtilityPole, PartyPopper, XCircle,
  ChefHat, Navigation2, ReceiptText,
} from "lucide-react";
import { formatInr } from "@/data/menu";
import { estimateDeliveryMinutes } from "@/lib/location";
import { ORDER_STATUS_META, type OrderRecord, type OrderStatus } from "@/lib/orders";

// Leaflet requires window — dynamic import prevents SSR crash
const DeliveryMap = dynamic(
  () => import("@/components/map/DeliveryMap").then((m) => ({ default: m.DeliveryMap })),
  { ssr: false, loading: () => <div className="h-[290px] animate-pulse rounded-2xl bg-gray-100" /> },
);

type OrderEvent = { status: string; note: string | null; created_at: string };

const TIMELINE: OrderStatus[] = ["placed", "preparing", "out_for_delivery", "delivered"];

const STEP_ICONS: Record<OrderStatus, React.ElementType> = {
  placed: Package,
  preparing: UtilityPole,
  out_for_delivery: Bike,
  delivered: PartyPopper,
  cancelled: XCircle,
};


export default function OrderTrackingPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);
  const [order, setOrder] = useState<OrderRecord | null | undefined>(undefined);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        if (res.status === 404) { if (active) setOrder(null); return; }
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Could not load order.");
        if (active) { setOrder(payload.order); setEvents(payload.events ?? []); }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Could not load order.");
      }
    }
    load();
    const t = setInterval(load, 15000);
    return () => { active = false; clearInterval(t); };
  }, [orderNumber]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  if (order === undefined && !error) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Clock className="h-8 w-8 text-brand-orange" strokeWidth={2} />
          </motion.div>
          <p className="text-[14px] text-gray-500">Loading your order…</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
        <p className="text-[18px] font-bold text-gray-800">Order not found</p>
        <p className="mt-2 text-[14px] text-gray-500">{error || "This order doesn't exist or isn't yours."}</p>
        <Link href="/orders" className="mt-8 inline-flex rounded-full bg-brand-orange px-8 py-3 text-[14px] font-bold text-white">My orders</Link>
      </main>
    );
  }

  const meta = ORDER_STATUS_META[order.status];
  const cancelled = order.status === "cancelled";
  const delivered = order.status === "delivered";
  const currentIndex = TIMELINE.indexOf(order.status as OrderStatus);
  const eventTime = (status: OrderStatus) => events.find((e) => e.status === status)?.created_at;
  const customerCoords =
    order.deliveryLat !== null && order.deliveryLng !== null
      ? { lat: order.deliveryLat, lng: order.deliveryLng }
      : null;
  const eta = estimateDeliveryMinutes(customerCoords);
  const elapsedMinutes = Math.max(0, (now - new Date(order.createdAt).getTime()) / 60000);
  const remainingMinutes = delivered ? 0 : Math.max(1, Math.ceil(eta.max - elapsedMinutes));
  const etaLabel = cancelled ? "Cancelled" : delivered ? "Delivered" : `${remainingMinutes} min`;
  const liveLine = delivered
    ? "Delivered. Enjoy your meal!"
    : cancelled
      ? "This order was cancelled."
      : order.status === "out_for_delivery"
        ? "Rider is heading to your exact pin"
        : order.status === "preparing"
          ? "Kitchen is preparing your food"
          : "Order received by kitchen";

  return (
    <main className="min-h-dvh bg-[#f7f7f7]">
      {/* Sticky header */}
      <div className="sticky top-0 z-[700] border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
          <Link href="/orders" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          </Link>
          <div className="flex-1">
            <p className="text-[15px] font-extrabold text-gray-900">Order {order.orderNumber}</p>
            <p className="text-[11px] font-medium text-gray-500">
              {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-5 space-y-4">

        {/* Status hero card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.08)]"
        >
          <div className={`px-5 pb-5 pt-4 text-white ${cancelled ? "bg-gradient-to-br from-red-500 to-rose-600" : delivered ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-[#ef4f19] via-brand-orange to-brand-gold"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/75">
                  {delivered || cancelled ? "Order status" : "Arriving in"}
                </p>
                <div className="mt-1 flex items-end gap-2">
                  <p className="text-[38px] font-black leading-none tracking-tight">{etaLabel}</p>
                  {!cancelled && !delivered && <span className="pb-1 text-[13px] font-bold text-white/80">approx</span>}
                </div>
                <p className="mt-2 text-[13px] font-semibold text-white/90">{liveLine}</p>
              </div>
              <motion.div
                initial={{ scale: 0.75, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/20 text-4xl shadow-inner"
              >
                {meta.emoji}
              </motion.div>
            </div>

            {!cancelled && !delivered && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-white/16 px-3 py-2 backdrop-blur">
                  <ChefHat className="h-4 w-4" />
                  <p className="mt-1 text-[10px] font-bold text-white/75">Kitchen</p>
                  <p className="text-[12px] font-extrabold">{order.status === "placed" ? "Queued" : "Active"}</p>
                </div>
                <div className="rounded-2xl bg-white/16 px-3 py-2 backdrop-blur">
                  <Bike className="h-4 w-4" />
                  <p className="mt-1 text-[10px] font-bold text-white/75">Rider</p>
                  <p className="text-[12px] font-extrabold">{order.status === "out_for_delivery" ? "On way" : "Soon"}</p>
                </div>
                <div className="rounded-2xl bg-white/16 px-3 py-2 backdrop-blur">
                  <Navigation2 className="h-4 w-4" />
                  <p className="mt-1 text-[10px] font-bold text-white/75">Pin</p>
                  <p className="text-[12px] font-extrabold">{customerCoords ? "Locked" : "Address"}</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[15px] font-extrabold text-gray-900">{meta.label}</p>
                <p className="mt-0.5 text-[12px] font-medium text-gray-500">{meta.customerLine}</p>
              </div>
              {!cancelled && !delivered && (
                <div className="shrink-0 rounded-full bg-green-50 px-3 py-1.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-green-700">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    Live
                  </span>
                </div>
              )}
            </div>

            {!cancelled && (
              <div className="mt-4">
                <div className="mb-2 flex justify-between">
                  {TIMELINE.map((s, i) => {
                    const Icon = STEP_ICONS[s];
                    const done = i <= currentIndex;
                    return (
                      <div key={s} className="flex flex-1 flex-col items-center gap-1">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${done ? "bg-brand-orange text-white shadow-md" : "bg-gray-100 text-gray-300"}`}>
                          <Icon className="h-4 w-4" strokeWidth={2.5} />
                        </div>
                        {i < TIMELINE.length - 1 && (
                          <div className="absolute" style={{ display: "none" }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="relative h-2 rounded-full bg-gray-100">
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max((currentIndex / (TIMELINE.length - 1)) * 100, 5)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Map — kitchen→customer line, fills as status progresses */}
        {!cancelled && (
          <DeliveryMap
            deliveryAddress={order.deliveryAddress}
            customerCoords={customerCoords}
            orderCreatedAt={order.createdAt}
            estimatedDeliveryMinutes={eta.max}
            status={order.status as "placed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled"}
          />
        )}

        {/* Timeline */}
        {!cancelled && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="mb-4 text-[12px] font-bold uppercase tracking-wider text-gray-500">Order updates</p>
            <ul className="space-y-0">
              {TIMELINE.map((status, i) => {
                const done = i <= currentIndex;
                const active = i === currentIndex;
                const sMeta = ORDER_STATUS_META[status];
                const Icon = STEP_ICONS[status];
                const at = eventTime(status);
                return (
                  <li key={status} className="relative flex gap-3">
                    {/* Connector line */}
                    {i < TIMELINE.length - 1 && (
                      <div className={`absolute left-[13px] top-7 h-[calc(100%-4px)] w-0.5 ${done && i < currentIndex ? "bg-brand-orange" : "bg-gray-100"}`} />
                    )}
                    <div className={`relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${done ? "bg-brand-orange text-white" : "bg-gray-100 text-gray-300"}`}>
                      {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" strokeWidth={2} />}
                    </div>
                    <div className={`pb-5 flex-1 ${i === TIMELINE.length - 1 ? "pb-0" : ""}`}>
                      <div className="flex items-start justify-between">
                        <p className={`text-[14px] ${active ? "font-extrabold text-gray-900" : done ? "font-semibold text-gray-700" : "text-gray-400"}`}>
                          {sMeta.emoji} {sMeta.label}
                        </p>
                        {at && <span className="text-[11px] text-gray-400">{new Date(at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
                      </div>
                      {active && <p className="mt-0.5 text-[12px] text-brand-orange">{sMeta.customerLine}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Delivery info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-gray-500">
            <ReceiptText className="h-3.5 w-3.5" />
            Delivery details
          </p>
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
            <div>
              <p className="text-[14px] font-bold text-gray-900">{order.deliveryName}</p>
              <p className="text-[13px] text-gray-600">{order.deliveryAddress}</p>
              {order.deliveryLandmark && <p className="text-[12px] text-gray-400">Near: {order.deliveryLandmark}</p>}
              {order.deliveryLat !== null && order.deliveryLng !== null && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryLat},${order.deliveryLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex text-[12px] font-bold text-green-600"
                >
                  Exact delivery pin
                </a>
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-gray-400" />
            <a href={`tel:+91${order.deliveryPhone.slice(-10)}`} className="text-[13px] text-gray-600">+91 {order.deliveryPhone.slice(-10)}</a>
          </div>
        </div>

        {/* Items + bill */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-gray-500">Your items</p>
          <ul className="space-y-2.5">
            {order.items.map((l) => (
              <li key={l.itemId} className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="text-xl">{l.emoji}</span>
                  <span className="truncate text-[13px] font-medium text-gray-800">{l.name} <span className="text-gray-400">×{l.qty}</span></span>
                </span>
                <span className="shrink-0 text-[13px] font-semibold text-gray-900">{formatInr(l.unitPrice * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
            <div className="flex justify-between text-[13px] text-gray-500"><span>Item total</span><span>{formatInr(order.subtotal)}</span></div>
            <div className="flex justify-between text-[13px] text-gray-500">
              <span>Delivery</span>
              <span className={order.deliveryFee === 0 ? "font-semibold text-green-600" : ""}>{order.deliveryFee === 0 ? "FREE" : formatInr(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-[13px] text-gray-500"><span>Taxes</span><span>{formatInr(order.gst)}</span></div>
            <div className="flex justify-between pt-2 text-[15px] font-extrabold text-gray-900">
              <span>{order.paymentMode === "cod" ? "Cash on Delivery" : "Paid"}</span>
              <span className="text-brand-orange">{formatInr(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pb-6">
          <Link href="/orders" className="flex items-center justify-center rounded-2xl border-2 border-gray-200 bg-white py-3.5 text-[14px] font-bold text-gray-700 transition-colors hover:border-brand-orange/30 hover:text-brand-orange">
            My orders
          </Link>
          <Link href="/menu" className="flex items-center justify-center rounded-2xl bg-ink py-3.5 text-[14px] font-bold text-brand-gold transition-opacity hover:opacity-90">
            Order more
          </Link>
        </div>
      </div>
    </main>
  );
}
