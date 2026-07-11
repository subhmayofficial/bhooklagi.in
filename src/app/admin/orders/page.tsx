"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut, RefreshCw, Users, ShoppingBag, MapPinned, Navigation,
  Bell, BellOff, Clock, Phone, ChevronRight, CheckCircle2, XCircle,
  Bike, UtensilsCrossed, PackageCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatInr } from "@/data/menu";
import { KITCHEN_COORDS_QUERY } from "@/lib/location";
import { ORDER_STATUS_META, NEXT_STATUS, type OrderStatus } from "@/lib/orders";

type AdminOrder = {
  id: string;
  orderNumber: string;
  items: { itemId: string; name: string; qty: number; emoji: string; unitPrice: number }[];
  status: OrderStatus;
  paymentMode: string;
  paymentStatus: string;
  deliveryName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryLandmark: string | null;
  deliveryLat: number | null;
  deliveryLng: number | null;
  deliveryAccuracyM: number | null;
  deliveryLocationSource: string | null;
  deliveryLocationCapturedAt: string | null;
  grandTotal: number;
  createdAt: string;
};

const FILTERS: { label: string; value: OrderStatus | "all"; icon: React.ReactNode }[] = [
  { label: "All",       value: "all",              icon: <ShoppingBag className="h-3.5 w-3.5" /> },
  { label: "Placed",    value: "placed",            icon: <Bell className="h-3.5 w-3.5" /> },
  { label: "Preparing", value: "preparing",         icon: <UtensilsCrossed className="h-3.5 w-3.5" /> },
  { label: "Out",       value: "out_for_delivery",  icon: <Bike className="h-3.5 w-3.5" /> },
  { label: "Delivered", value: "delivered",         icon: <PackageCheck className="h-3.5 w-3.5" /> },
  { label: "Cancelled", value: "cancelled",         icon: <XCircle className="h-3.5 w-3.5" /> },
];

function googlePinUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
function googleRouteUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&origin=${KITCHEN_COORDS_QUERY}&destination=${lat},${lng}&travelmode=driving`;
}

/* ── Web Audio ringtone — no file needed ─────────────────── */
function playOrderRing(ctx: AudioContext) {
  const notes = [880, 1108, 1318, 1108, 880, 0, 1318, 1568];
  let t = ctx.currentTime;
  notes.forEach((freq) => {
    if (freq === 0) { t += 0.08; return; }
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.start(t);
    osc.stop(t + 0.22);
    t += 0.18;
  });
}

export default function AdminOrdersPage() {
  const router  = useRouter();
  const [orders, setOrders]   = useState<AdminOrder[] | null>(null);
  const [filter, setFilter]   = useState<OrderStatus | "all">("all");
  const [error, setError]     = useState("");
  const [busyId, setBusyId]   = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [newCount, setNewCount] = useState(0);  // blinking badge count
  const prevOrderIds   = useRef<Set<string>>(new Set());
  const audioCtxRef    = useRef<AudioContext | null>(null);

  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }

  const load = useCallback(async () => {
    try {
      const url = filter === "all" ? "/api/admin/orders" : `/api/admin/orders?status=${filter}`;
      const res = await fetch(url);
      if (res.status === 401) { router.replace("/admin/login"); return; }
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Could not load orders.");
      const incoming: AdminOrder[] = payload.orders;

      /* Detect new orders */
      if (prevOrderIds.current.size > 0) {
        const fresh = incoming.filter((o) => !prevOrderIds.current.has(o.id));
        if (fresh.length > 0) {
          setNewCount((c) => c + fresh.length);
          if (soundOn) {
            try { playOrderRing(getAudioCtx()); } catch { /* permission not granted yet */ }
          }
        }
      }
      prevOrderIds.current = new Set(incoming.map((o) => o.id));
      setOrders(incoming);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load orders.");
    }
  }, [filter, router, soundOn]);

  useEffect(() => {
    load();
    const t = setInterval(load, 12000);
    return () => clearInterval(t);
  }, [load]);

  /* Unlock audio context on first user interaction */
  useEffect(() => {
    const unlock = () => {
      try { getAudioCtx().resume(); } catch { /* ignore */ }
    };
    window.addEventListener("click", unlock, { once: true });
    return () => window.removeEventListener("click", unlock);
  }, []);

  async function updateStatus(id: string, status: OrderStatus) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setOrders((prev) => prev ? prev.map((o) => o.id === id ? { ...o, status } : o) : prev);
    } catch {
      setError("Could not update order.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const displayed = orders ?? [];

  return (
    <div className="min-h-dvh bg-gray-950 text-white">

      {/* ── Top nav bar ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange text-base shadow-md shadow-brand-orange/40">🍔</span>
            <div>
              <p className="text-[13px] font-extrabold leading-none text-white">Bhook Lagi Admin</p>
              <p className="text-[10px] text-gray-500">Order management</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* New orders badge */}
            <AnimatePresence>
              {newCount > 0 && (
                <motion.button
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  type="button"
                  onClick={() => setNewCount(0)}
                  className="flex items-center gap-1.5 rounded-full bg-brand-orange px-3 py-1.5 text-[12px] font-extrabold text-white shadow-md shadow-brand-orange/40"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  {newCount} new order{newCount > 1 ? "s" : ""}!
                </motion.button>
              )}
            </AnimatePresence>

            {/* Sound toggle */}
            <button
              type="button"
              onClick={() => setSoundOn((v) => !v)}
              title={soundOn ? "Mute order ringtone" : "Unmute order ringtone"}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                soundOn
                  ? "border-brand-orange/30 bg-brand-orange/10 text-brand-orange"
                  : "border-white/10 bg-white/5 text-gray-500"
              }`}
            >
              {soundOn ? <Bell className="h-4 w-4" strokeWidth={2.5} /> : <BellOff className="h-4 w-4" strokeWidth={2.5} />}
            </button>

            <button
              type="button"
              onClick={load}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-colors hover:text-white"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={2.5} />
            </button>

            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-gray-400 transition-colors hover:text-white"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Users</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-red-900/40 bg-red-950/40 px-3 py-2 text-[12px] font-semibold text-red-400 transition-colors hover:text-red-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        {/* Stats strip */}
        {orders && (
          <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {FILTERS.filter((f) => f.value !== "all").map((f) => {
              const count = orders.filter((o) => o.status === f.value).length;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-2xl border py-3 text-center transition-all ${
                    filter === f.value
                      ? "border-brand-orange/40 bg-brand-orange/10 text-brand-orange"
                      : "border-white/8 bg-white/5 text-gray-400 hover:border-white/15 hover:text-white"
                  }`}
                >
                  {f.icon}
                  <span className="text-[18px] font-extrabold">{count}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest">{f.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Filter pills */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => { setFilter(f.value); setNewCount(0); }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold transition-all ${
                filter === f.value
                  ? "bg-brand-orange text-white shadow-md shadow-brand-orange/30"
                  : "bg-white/8 text-gray-400 hover:bg-white/12 hover:text-white"
              }`}
            >
              {f.icon}
              {f.label}
              {f.value !== "all" && orders && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${filter === f.value ? "bg-white/20 text-white" : "bg-white/10 text-gray-400"}`}>
                  {orders.filter((o) => o.status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-[13px] text-red-400">{error}</div>
        )}
        {!orders && !error && (
          <div className="flex items-center gap-3 text-[13px] text-gray-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-brand-orange" />
            Loading orders…
          </div>
        )}
        {orders && displayed.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-700" strokeWidth={1.2} />
            <p className="mt-4 text-[14px] font-bold text-gray-500">No orders here</p>
          </div>
        )}

        {/* Order cards */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {displayed.map((o) => {
              const meta = ORDER_STATUS_META[o.status];
              const next = NEXT_STATUS[o.status];
              const isNew = Date.now() - new Date(o.createdAt).getTime() < 3 * 60 * 1000;
              return (
                <motion.div
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className={`overflow-hidden rounded-2xl border ${
                    o.status === "placed"
                      ? "border-brand-orange/30 bg-gradient-to-br from-brand-orange/5 to-transparent"
                      : "border-white/8 bg-white/5"
                  }`}
                >
                  <div className="p-4">
                    {/* Header row */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[13px] font-extrabold text-white">{o.orderNumber}</span>
                        <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.pill}`}>
                          {meta.emoji} {meta.label}
                        </span>
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-gray-400">
                          {o.paymentMode === "cod" ? "💵 COD" : o.paymentMode}
                        </span>
                        {isNew && (
                          <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2.5 py-0.5 text-[11px] font-bold text-green-400">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                            </span>
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-display text-[20px] leading-none text-brand-orange">{formatInr(o.grandTotal)}</p>
                        <p className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-gray-500">
                          <Clock className="h-3 w-3" strokeWidth={2} />
                          {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {o.items.map((item) => (
                        <span
                          key={item.itemId}
                          className="flex items-center gap-1 rounded-xl bg-white/8 px-2.5 py-1 text-[12px] font-semibold text-gray-300"
                        >
                          {item.emoji} {item.name}
                          <span className="rounded-full bg-white/15 px-1.5 text-[10px] font-extrabold text-white">×{item.qty}</span>
                        </span>
                      ))}
                    </div>

                    {/* Delivery */}
                    <div className="mt-3 rounded-xl bg-black/20 px-3 py-2.5 text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-200">{o.deliveryName}</span>
                        <a
                          href={`tel:+${o.deliveryPhone}`}
                          className="flex items-center gap-1 rounded-full bg-brand-orange/20 px-2 py-0.5 text-[11px] font-bold text-brand-orange"
                        >
                          <Phone className="h-3 w-3" strokeWidth={2.5} />
                          +{o.deliveryPhone.slice(-10)}
                        </a>
                      </div>
                      <p className="mt-1 text-gray-400">
                        {o.deliveryAddress}
                        {o.deliveryLandmark ? ` · Near: ${o.deliveryLandmark}` : ""}
                      </p>

                      {o.deliveryLat !== null && o.deliveryLng !== null ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-white/8 pt-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-1 text-[11px] font-bold text-green-400">
                            <MapPinned className="h-3.5 w-3.5" />
                            GPS pin{typeof o.deliveryAccuracyM === "number" ? ` ~${Math.round(o.deliveryAccuracyM)}m` : ""}
                          </span>
                          <a
                            href={googlePinUrl(o.deliveryLat, o.deliveryLng)}
                            target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/15 transition-colors"
                          >
                            <MapPinned className="h-3.5 w-3.5" /> Open pin
                          </a>
                          <a
                            href={googleRouteUrl(o.deliveryLat, o.deliveryLng)}
                            target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-brand-orange/20 px-2.5 py-1 text-[11px] font-bold text-brand-orange hover:bg-brand-orange/30 transition-colors"
                          >
                            <Navigation className="h-3.5 w-3.5" /> Route
                          </a>
                          <span className="text-[10px] text-gray-600">{o.deliveryLat.toFixed(5)}, {o.deliveryLng.toFixed(5)}</span>
                        </div>
                      ) : (
                        <div className="mt-2 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-400">
                          ⚠ GPS pin not captured for this order
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {next && (
                        <button
                          type="button"
                          disabled={busyId === o.id}
                          onClick={() => updateStatus(o.id, next)}
                          className="flex items-center gap-1.5 rounded-xl bg-brand-orange px-4 py-2 text-[12px] font-extrabold text-white shadow-md shadow-brand-orange/30 transition-all hover:bg-brand-orange-dark disabled:opacity-50 active:scale-95"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                          Mark {ORDER_STATUS_META[next].label}
                          <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} />
                        </button>
                      )}
                      {o.status !== "cancelled" && o.status !== "delivered" && (
                        <button
                          type="button"
                          disabled={busyId === o.id}
                          onClick={() => updateStatus(o.id, "cancelled")}
                          className="flex items-center gap-1.5 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-2 text-[12px] font-bold text-red-400 transition-colors hover:bg-red-900/40 disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
