"use client";

import { use, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2, MapPin, Phone, Clock, ChevronLeft,
  Bike, Package, PartyPopper, XCircle,
  ChefHat, Navigation2, ReceiptText, RotateCcw, UtensilsCrossed,
  Star, Smartphone, Sparkles, Flame, ShieldCheck, ArrowRight,
} from "lucide-react";
import { RatingCard } from "@/components/order/RatingCard";
import { formatInr } from "@/data/menu";
import { estimateDeliveryMinutes } from "@/lib/location";
import { ORDER_STATUS_META, computeDynamicEta, type OrderRecord, type OrderStatus } from "@/lib/orders";
import { useCartStore } from "@/stores/cart-store";

// Leaflet requires window — dynamic import prevents SSR crash
const DeliveryMap = dynamic(
  () => import("@/components/map/DeliveryMap").then((m) => ({ default: m.DeliveryMap })),
  { ssr: false, loading: () => <div className="h-[290px] animate-pulse rounded-[28px] bg-gray-100/80 shadow-inner" /> },
);

type OrderEvent = { status: string; note: string | null; created_at: string };

const TIMELINE: OrderStatus[] = ["placed", "preparing", "out_for_delivery", "delivered"];

const STEP_ICONS: Record<OrderStatus, React.ElementType> = {
  placed: Package,
  preparing: ChefHat,
  out_for_delivery: Bike,
  delivered: PartyPopper,
  cancelled: XCircle,
};

export default function OrderTrackingPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const router = useRouter();
  const { orderNumber } = use(params);
  const replaceLines = useCartStore((s) => s.replaceLines);
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
      <main className="flex min-h-dvh items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-cream/60 p-4 shadow-sm">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
              className="text-4xl"
            >
              🍔
            </motion.div>
          </div>
          <div>
            <p className="font-display text-[18px] tracking-wide text-gray-900">Tracking your feast…</p>
            <p className="mt-1 text-[13px] font-medium text-gray-500">Connecting with Bhook Lagi kitchen</p>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-white via-brand-cream to-[#ffded0] px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500 shadow-sm">
          <XCircle className="h-10 w-10" strokeWidth={2} />
        </div>
        <p className="mt-4 font-display text-[22px] tracking-wide text-gray-900">Order not found</p>
        <p className="mt-1.5 max-w-sm text-[14px] font-medium text-gray-600">{error || "We couldn't locate this order ID or it doesn't belong to your account."}</p>
        <Link
          href="/orders"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-orange px-8 py-3.5 text-[14px] font-extrabold text-white shadow-lg shadow-brand-orange/30 transition-transform active:scale-95"
        >
          View My Orders
          <ArrowRight className="h-4 w-4" />
        </Link>
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
  const dynamicEta = computeDynamicEta(order.status, order.createdAt, events, eta.max, now);
  const remainingMinutes = dynamicEta.remainingMinutes;
  const etaLabel = cancelled ? "Cancelled" : delivered ? "Delivered" : `${remainingMinutes} min`;
  const liveLine = delivered
    ? "Delivered safely. Enjoy every warm bite!"
    : cancelled
      ? "This order was cancelled."
      : order.status === "out_for_delivery"
        ? "Rider is zooming towards your exact delivery pin!"
        : order.status === "preparing"
          ? "Our chefs are tossing & grilling your food with care"
          : "Order confirmed! Sending straight to kitchen queue";

  function repeatOrder() {
    if (!order) return;
    replaceLines(order.items);
    router.push("/cart");
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-white via-[#fff8eb] to-[#ffded0] pb-16 text-gray-900 selection:bg-brand-orange selection:text-white">
      {/* ── Top Sticky Header (Clean White) ── */}
      <header className="sticky top-0 z-[700] border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-gray-200/80 bg-gray-50 text-gray-700 transition-colors hover:bg-gray-100 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-[16px] tracking-wide text-gray-950">Order {order.orderNumber}</span>
                {!cancelled && !delivered && (
                  <span className="flex items-center gap-1 rounded-full bg-brand-orange/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-orange">
                    <span className="h-1.5 w-1.5 animate-ping rounded-full bg-brand-orange" />
                    Live
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-gray-500">
                {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200/80 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-600 shadow-sm transition-all hover:border-brand-orange hover:text-brand-orange active:scale-95"
          >
            <Clock className="h-3.5 w-3.5 text-brand-orange" />
            Refresh
          </button>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <div className="mx-auto max-w-lg px-4 pt-5 space-y-5">

        {/* ── Live Map Card (Up side white background area) ── */}
        {!cancelled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="overflow-hidden rounded-[28px] border border-gray-200/80 bg-white p-1.5 shadow-md shadow-gray-200/50"
          >
            <div className="relative overflow-hidden rounded-[24px]">
              <DeliveryMap
                deliveryAddress={order.deliveryAddress}
                customerCoords={customerCoords}
                orderCreatedAt={order.createdAt}
                estimatedDeliveryMinutes={dynamicEta.totalAllottedMinutes}
                status={order.status as "placed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled"}
              />
              <div className="pointer-events-none absolute left-3 top-3 z-[400] flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 shadow-md backdrop-blur">
                <Flame className="h-4 w-4 animate-bounce text-brand-orange" />
                <span className="text-[11px] font-extrabold tracking-tight text-gray-900">
                  {order.status === "out_for_delivery" ? "Rider on the move 🚀" : "Fresh food on order 🔥"}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Status Hero Banner (Creative Foody Vibe) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-[32px] border border-white/40 bg-white shadow-xl shadow-brand-orange/10"
        >
          {/* Main Gradient Box */}
          <div className={`relative px-6 pb-6 pt-6 text-white overflow-hidden ${
            cancelled
              ? "bg-gradient-to-br from-red-600 via-rose-600 to-red-800"
              : delivered
                ? "bg-gradient-to-br from-emerald-600 via-green-600 to-teal-800"
                : "bg-gradient-to-br from-[#FF5E00] via-brand-orange to-[#F59E0B]"
          }`}>
            {/* Background Decorative Emojis */}
            <div className="pointer-events-none absolute -right-4 -top-6 text-8xl opacity-15 select-none transform rotate-12">
              {cancelled ? "😔" : delivered ? "🎉" : order.status === "preparing" ? "🍳" : "🍔"}
            </div>
            <div className="pointer-events-none absolute -bottom-8 left-1/3 text-7xl opacity-10 select-none transform -rotate-12">
              🍕
            </div>

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                  <Sparkles className="h-3 w-3" />
                  {delivered ? "Completed" : cancelled ? "Status" : "Estimated Arrival"}
                </div>
                <div className="mt-3 flex items-baseline gap-2.5">
                  <p className="font-display text-[44px] font-black leading-none tracking-tight drop-shadow-sm">{etaLabel}</p>
                  {!cancelled && !delivered && <span className="text-[14px] font-extrabold text-white/85">approx</span>}
                </div>
                <p className="mt-2 text-[13.5px] font-bold text-white/95 drop-shadow-sm flex items-center gap-2">
                  {liveLine}
                </p>
              </div>

              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-white/25 shadow-inner backdrop-blur-md border border-white/30"
              >
                <StatusIcon status={order.status} className="h-8 w-8 text-white drop-shadow" />
              </motion.div>
            </div>

            {/* Quick Stats Grid inside Hero Card */}
            {!cancelled && !delivered && (
              <div className="relative z-10 mt-5 grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl bg-white/20 px-3.5 py-2.5 backdrop-blur-md border border-white/20">
                  <ChefHat className="h-4 w-4 text-white" />
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/80">Kitchen</p>
                  <p className="text-[13px] font-black text-white truncate">{order.status === "placed" ? "Queued 📋" : "Cooking 👨‍🍳"}</p>
                </div>
                <div className="rounded-2xl bg-white/20 px-3.5 py-2.5 backdrop-blur-md border border-white/20">
                  <Bike className="h-4 w-4 text-white" />
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/80">Rider</p>
                  <p className="text-[13px] font-black text-white truncate">{order.status === "out_for_delivery" ? "On Way 🏍️" : "Assigned ⚡"}</p>
                </div>
                <div className="rounded-2xl bg-white/20 px-3.5 py-2.5 backdrop-blur-md border border-white/20">
                  <ShieldCheck className="h-4 w-4 text-white" />
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/80">Quality</p>
                  <p className="text-[13px] font-black text-white truncate">100% Hot 🔥</p>
                </div>
              </div>
            )}
          </div>

          {/* Stepped Progress Bar (Sleek Glassy Tracker) */}
          <div className="bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-display text-[16px] font-black tracking-wide text-gray-900">{meta.label}</p>
                <p className="mt-0.5 text-[12px] font-medium text-gray-500">{meta.customerLine}</p>
              </div>
              {!cancelled && !delivered && (
                <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-extrabold text-brand-orange border border-orange-200/60">
                  <Clock className="h-3 w-3 animate-spin text-brand-orange" style={{ animationDuration: "6s" }} />
                  In Progress
                </div>
              )}
            </div>

            {!cancelled && (
              <div className="mt-5">
                <div className="relative mb-3 flex justify-between">
                  {TIMELINE.map((s, i) => {
                    const Icon = STEP_ICONS[s];
                    const done = i <= currentIndex;
                    const active = i === currentIndex;
                    return (
                      <div key={s} className="relative z-10 flex flex-1 flex-col items-center gap-1">
                        <motion.div
                          animate={{ scale: active ? 1.15 : 1 }}
                          className={`flex h-8 w-8 items-center justify-center rounded-2xl transition-all shadow-sm ${
                            done
                              ? "bg-gradient-to-br from-brand-orange to-brand-gold text-white shadow-brand-orange/30"
                              : "bg-gray-100 text-gray-300"
                          }`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2.5} />
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100 p-0.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand-orange via-amber-500 to-brand-gold shadow-sm"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max((currentIndex / (TIMELINE.length - 1)) * 100, 8)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Order Updates Timeline (Down side Cream & Orange Zone) ── */}
        {!cancelled && (
          <div className="rounded-[28px] border border-orange-200/60 bg-white/80 p-5 shadow-lg shadow-orange-950/5 backdrop-blur-md">
            <p className="mb-4 flex items-center gap-2 text-[12px] font-black uppercase tracking-wider text-brand-orange">
              <Clock className="h-4 w-4" />
              Live Order Milestones
            </p>
            <ul className="space-y-4">
              {TIMELINE.map((status, i) => {
                const done = i <= currentIndex;
                const active = i === currentIndex;
                const sMeta = ORDER_STATUS_META[status];
                const Icon = STEP_ICONS[status];
                const at = eventTime(status);
                return (
                  <li key={status} className="relative flex items-start gap-3.5">
                    {/* Connector line */}
                    {i < TIMELINE.length - 1 && (
                      <div className={`absolute left-[15px] top-8 h-[calc(100%-12px)] w-0.5 rounded-full transition-colors ${
                        done && i < currentIndex ? "bg-brand-orange" : "bg-gray-200"
                      }`} />
                    )}
                    <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-all ${
                      done ? "bg-brand-orange text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      {done ? <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} /> : <Icon className="h-4 w-4" strokeWidth={2} />}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-[14px] leading-tight ${active ? "font-black text-gray-900" : done ? "font-bold text-gray-700" : "font-medium text-gray-400"}`}>
                          {sMeta.label}
                        </p>
                        {at && (
                          <span className="rounded-lg bg-orange-50 px-2 py-0.5 text-[10.5px] font-extrabold text-brand-orange">
                            {new Date(at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                      {active && <p className="mt-1 text-[12.5px] font-medium text-brand-orange">{sMeta.customerLine}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ── Delivery Details Card ── */}
        <div className="rounded-[28px] border border-orange-200/60 bg-white/80 p-5 shadow-lg shadow-orange-950/5 backdrop-blur-md">
          <p className="mb-3.5 flex items-center gap-2 text-[12px] font-black uppercase tracking-wider text-brand-orange">
            <MapPin className="h-4 w-4" />
            Delivery Address & Contact
          </p>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100/60 text-brand-orange">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14.5px] font-extrabold text-gray-900">{order.deliveryName}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-gray-600">{order.deliveryAddress}</p>
              {order.deliveryLandmark && (
                <p className="mt-1 inline-block rounded-lg bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600">
                  Landmark: {order.deliveryLandmark}
                </p>
              )}
              {order.deliveryLat !== null && order.deliveryLng !== null && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryLat},${order.deliveryLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1 rounded-xl bg-green-50 px-3 py-1.5 text-[11.5px] font-extrabold text-green-700 transition-colors hover:bg-green-100"
                >
                  <Navigation2 className="h-3 w-3" />
                  View Exact GPS Pin on Maps
                </a>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-orange-100/60 pt-3.5">
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-orange">Kitchen Contact</span>
              <span className="text-[13.5px] font-black text-gray-900">+91 9296834048</span>
            </div>
            <a
              href="tel:+919296834048"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold px-4 py-2 text-[12px] font-black text-white shadow-md shadow-brand-orange/25 transition-transform active:scale-95"
            >
              <Phone className="h-3.5 w-3.5" />
              Call Kitchen
            </a>
          </div>
        </div>

        {/* ── Restaurant Ticket: Order Summary ── */}
        <div className="relative overflow-hidden rounded-[28px] border border-orange-200/60 bg-white/90 shadow-lg shadow-orange-950/5 backdrop-blur-md">
          {/* Top Ticket Header */}
          <div className="flex items-center justify-between border-b border-dashed border-orange-200 px-5 py-4 bg-brand-cream/50">
            <p className="flex items-center gap-2 font-display text-[15px] tracking-wide text-gray-900">
              <ReceiptText className="h-4 w-4 text-brand-orange" />
              Your Food Ticket
            </p>
            <span className="rounded-full bg-brand-orange px-3 py-1 text-[11px] font-black text-white shadow-sm">
              {order.items.reduce((sum, item) => sum + item.qty, 0)} Items
            </span>
          </div>

          {/* Ticket Items List */}
          <ul className="divide-y divide-dashed divide-orange-100 px-5 py-2">
            {order.items.map((l) => (
              <li key={l.itemId} className="flex items-center justify-between gap-3 py-3.5">
                <span className="flex min-w-0 items-center gap-3">
                  <DietMark diet={l.diet} />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-extrabold text-gray-900">{l.name}</span>
                    <span className="mt-0.5 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-gray-500">
                      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-gray-700">Qty {l.qty}</span>
                      <span>× {formatInr(l.unitPrice)}</span>
                    </span>
                  </span>
                </span>
                <span className="shrink-0 font-display text-[15px] font-bold text-gray-950">
                  {formatInr(l.unitPrice * l.qty)}
                </span>
              </li>
            ))}
          </ul>

          {/* Ticket Bill Summary */}
          <div className="space-y-2.5 border-t border-dashed border-orange-200 bg-orange-50/40 px-5 py-4">
            <div className="flex justify-between text-[13px] font-semibold text-gray-600">
              <span>Item Total</span>
              <span>{formatInr(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-semibold text-gray-600">
              <span>Delivery Fee</span>
              <span className={order.deliveryFee === 0 ? "font-extrabold text-green-600" : "font-bold text-gray-900"}>
                {order.deliveryFee === 0 ? "FREE 🎉" : formatInr(order.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-[13px] font-semibold text-gray-600">
              <span>Taxes & GST</span>
              <span>{formatInr(order.gst)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-orange-200/60 pt-3">
              <div>
                <span className="block font-display text-[17px] font-black text-gray-950">Total Bill</span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-orange">
                  {order.paymentMode === "cod" ? "Cash on Delivery" : "Paid Online"}
                </span>
              </div>
              <span className="font-display text-[22px] font-black text-brand-orange">
                {formatInr(order.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Pay Online Banner — For COD orders in progress ── */}
        {order.paymentMode === "cod" && !delivered && !cancelled && (
          <div className="overflow-hidden rounded-[28px] border border-brand-orange/40 bg-gradient-to-br from-brand-orange via-[#ff7824] to-brand-gold p-5 text-white shadow-xl shadow-brand-orange/20">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md shadow-inner">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-display text-[17px] font-black tracking-wide">Prefer Online Payment?</p>
                <p className="mt-0.5 text-[13px] font-medium text-white/90">Avoid cash change issues — pay right now with any UPI app in 1 tap</p>
              </div>
            </div>
            <a
              href={`upi://pay?pa=${encodeURIComponent(process.env.NEXT_PUBLIC_UPI_ID ?? "bhooklagi@upi")}&pn=${encodeURIComponent("Bhook Lagi")}&am=${order.grandTotal}&tn=${encodeURIComponent(`Order ${order.orderNumber}`)}&cu=INR`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-[14.5px] font-black text-brand-orange shadow-lg transition-transform active:scale-95"
            >
              <Smartphone className="h-4 w-4" />
              Pay {formatInr(order.grandTotal)} via GPay / PhonePe / Paytm
            </a>
            <p className="mt-2 text-center text-[10.5px] font-extrabold text-white/80">
              Instantly opens your favorite UPI app · 100% Secure
            </p>
          </div>
        )}

        {/* ── Rating Section (Only when Delivered) ── */}
        {delivered && !order.ratedAt && (
          <div className="rounded-[28px] border border-orange-200 bg-white/95 p-2 shadow-lg shadow-orange-950/5">
            <RatingCard
              orderNumber={order.orderNumber}
              onRated={() => setOrder((o) => o ? { ...o, ratedAt: new Date().toISOString() } : o)}
            />
          </div>
        )}

        {delivered && order.ratedAt && (
          <div className="rounded-[28px] border border-orange-200/80 bg-white/90 p-5 shadow-lg shadow-orange-950/5 backdrop-blur-md">
            <p className="mb-3.5 flex items-center gap-2 font-display text-[15px] tracking-wide text-gray-900">
              <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
              Your Review & Rating
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="rounded-2xl bg-orange-50/60 px-4 py-2.5 border border-orange-100">
                <p className="text-[11px] font-black uppercase tracking-wider text-gray-500">Food Quality</p>
                <div className="mt-1 flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`h-5 w-5 ${s <= (order.foodRating ?? 0) ? "fill-amber-400 stroke-amber-400" : "fill-transparent stroke-gray-300"}`} strokeWidth={2} />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-orange-50/60 px-4 py-2.5 border border-orange-100">
                <p className="text-[11px] font-black uppercase tracking-wider text-gray-500">Delivery Speed</p>
                <div className="mt-1 flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`h-5 w-5 ${s <= (order.deliveryRating ?? 0) ? "fill-amber-400 stroke-amber-400" : "fill-transparent stroke-gray-300"}`} strokeWidth={2} />
                  ))}
                </div>
              </div>
            </div>
            {order.ratingComment && (
              <p className="mt-3.5 rounded-xl bg-gray-50 p-3 text-[13px] font-medium italic text-gray-600 border border-gray-100">
                &ldquo;{order.ratingComment}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="grid grid-cols-2 gap-3.5 pt-2">
          <button
            type="button"
            onClick={repeatOrder}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold py-4 text-[14.5px] font-black text-white shadow-lg shadow-brand-orange/25 transition-transform active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            Repeat Feast
          </button>
          <Link
            href="/menu"
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-orange-200/80 bg-white/90 py-4 text-[14.5px] font-black text-brand-orange shadow-md shadow-orange-950/5 transition-transform hover:bg-orange-50/50 active:scale-95"
          >
            <UtensilsCrossed className="h-4 w-4" />
            Explore Menu
          </Link>
        </div>

      </div>
    </main>
  );
}

function StatusIcon({ status, className }: { status: OrderStatus; className?: string }) {
  const Icon =
    status === "placed" ? Package :
    status === "preparing" ? ChefHat :
    status === "out_for_delivery" ? Bike :
    status === "delivered" ? PartyPopper :
    XCircle;
  return <Icon className={className} strokeWidth={2.5} />;
}

function DietMark({ diet }: { diet?: string }) {
  const tone =
    diet === "veg" ? "border-green-600 text-green-600 bg-green-50/50" :
    diet === "egg" ? "border-amber-500 text-amber-500 bg-amber-50/50" :
    diet === "non-veg" ? "border-red-600 text-red-600 bg-red-50/50" :
    "border-gray-300 text-gray-400 bg-gray-50";
  return (
    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  );
}
