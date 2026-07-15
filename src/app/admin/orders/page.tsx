"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw, ShoppingBag, MapPinned, Navigation,
  Bell, BellOff, Clock, Phone, ChevronRight, CheckCircle2, XCircle,
  Bike, UtensilsCrossed, AlertCircle
} from "lucide-react";
import { useAdminStore } from "@/stores/admin-store";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { formatInr } from "@/data/menu";
import { KITCHEN_COORDS_QUERY } from "@/lib/location";
import { ORDER_STATUS_META, NEXT_STATUS, type OrderStatus } from "@/lib/orders";

type AdminOrder = {
  id: string;
  orderNumber: string;
  items: { 
    itemId: string; 
    name: string; 
    qty: number; 
    emoji: string; 
    unitPrice: number; 
    selectedAddons?: { id: string; name: string; price: number }[];
  }[];
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
  foodRating: number | null;
  deliveryRating: number | null;
  ratingComment: string | null;
  ratedAt: string | null;
  specialInstructions: string | null;
};

const ORDER_BOARD_COLUMNS: {
  label: string;
  caption: string;
  value: OrderStatus;
  icon: React.ReactNode;
  accent: string;
}[] = [
  { label: "Ready",            caption: "New orders",        value: "placed",           icon: <Bell className="h-4 w-4" />,            accent: "text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-300 dark:bg-blue-500/10 dark:border-blue-500/20" },
  { label: "Preparing",        caption: "Kitchen active",    value: "preparing",        icon: <UtensilsCrossed className="h-4 w-4" />, accent: "text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/20" },
  { label: "Out for delivery", caption: "Rider on route",    value: "out_for_delivery", icon: <Bike className="h-4 w-4" />,            accent: "text-brand-orange bg-orange-50 border-orange-100 dark:bg-orange-500/10 dark:border-orange-500/20" },
  { label: "Cancelled",        caption: "Rejected orders",   value: "cancelled",        icon: <XCircle className="h-4 w-4" />,         accent: "text-red-600 bg-red-50 border-red-100 dark:text-red-300 dark:bg-red-500/10 dark:border-red-500/20" },
];

type RingtoneId = "kitchen" | "dhol" | "arcade" | "siren";

const RINGTONE_OPTIONS: { id: RingtoneId; label: string }[] = [
  { id: "kitchen", label: "Kitchen Bell" },
  { id: "dhol", label: "Desi Dhol" },
  { id: "arcade", label: "Arcade" },
  { id: "siren", label: "Siren" },
];

function googlePinUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
function googleRouteUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&origin=${KITCHEN_COORDS_QUERY}&destination=${lat},${lng}&travelmode=driving`;
}

/* ─────────────────────────────────────────────────────────────────
   RINGTONE — selectable alarm patterns for new orders.
   Returns the scheduled end time so caller knows when it finishes.
───────────────────────────────────────────────────────────────── */
function playRingOnce(ctx: AudioContext, ringtone: RingtoneId): number {
  const patterns: Record<RingtoneId, { notes: [number, number][]; wave: OscillatorType; gain: number; gap: number; shine?: boolean }> = {
    kitchen: {
      notes: [[988, 0.12], [1318, 0.12], [1760, 0.18], [988, 0.12], [1318, 0.12], [1760, 0.26]],
      wave: "square",
      gain: 0.32,
      gap: 0.045,
      shine: true,
    },
    dhol: {
      notes: [[165, 0.09], [165, 0.09], [220, 0.12], [165, 0.09], [247, 0.12], [220, 0.18], [165, 0.09], [220, 0.18]],
      wave: "sawtooth",
      gain: 0.42,
      gap: 0.035,
    },
    arcade: {
      notes: [[784, 0.09], [1046, 0.09], [1318, 0.09], [1568, 0.13], [1318, 0.09], [1568, 0.09], [2093, 0.2]],
      wave: "square",
      gain: 0.28,
      gap: 0.035,
      shine: true,
    },
    siren: {
      notes: [[660, 0.22], [1046, 0.22], [660, 0.22], [1046, 0.28]],
      wave: "sawtooth",
      gain: 0.36,
      gap: 0.02,
    },
  };
  const pattern = patterns[ringtone];
  let t = ctx.currentTime + 0.05;
  pattern.notes.forEach(([freq, dur]) => {
    const main = ctx.createOscillator();
    const gain = ctx.createGain();

    main.type = pattern.wave;
    main.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(pattern.gain, t + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    main.connect(gain);
    gain.connect(ctx.destination);

    let shine: OscillatorNode | null = null;
    if (pattern.shine) {
      shine = ctx.createOscillator();
      shine.type = "triangle";
      shine.frequency.setValueAtTime(freq * 2, t);
      shine.connect(gain);
      shine.start(t);
      shine.stop(t + dur);
    }

    main.start(t);
    main.stop(t + dur);
    t += dur + pattern.gap;
  });
  return t + 0.05;
}

/* ══════════════════════════════════════════════════════════════════
   NEW ORDER POPUP — shown over the admin panel (like Zomato/Swiggy)
══════════════════════════════════════════════════════════════════ */
function NewOrderPopup({
  order,
  onAccept,
  onDismiss,
}: {
  order: AdminOrder;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.85, y: -40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: -20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-gray-900 shadow-[0_32px_80px_rgba(0,0,0,0.7)] ring-1 ring-brand-orange/40"
      >
        {/* Pulsing top bar */}
        <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-brand-orange to-brand-gold py-4 px-4 overflow-hidden">
          {/* shimmer sweep */}
          <motion.span
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <AlertCircle className="h-5 w-5 text-white" fill="white" strokeWidth={0} />
          </motion.span>
          <p className="relative text-[15px] font-extrabold uppercase tracking-[0.15em] text-white">
            🔔 New Order Received!
          </p>
        </div>

        <div className="p-5">
          {/* Order number + time */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-[18px] font-extrabold text-white">{order.orderNumber}</p>
              <p className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                <Clock className="h-3 w-3" strokeWidth={2} />
                {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-[26px] leading-none text-brand-orange">{formatInr(order.grandTotal)}</p>
              <p className="mt-0.5 rounded-full bg-white/10 px-2 py-0.5 text-center text-[10px] font-bold text-gray-300">
                {order.paymentMode === "cod" ? "💵 Cash on Delivery" : order.paymentMode}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="mb-4 rounded-2xl bg-black/30 p-3">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-gray-500">Order items</p>
            <div className="space-y-1.5">
              {order.items.map((item) => (
                <div key={item.itemId} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-gray-200">
                    <span>{item.emoji}</span>
                    <span className="flex flex-col">
                      <span>{item.name}</span>
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <span className="text-[10px] text-brand-orange font-normal leading-tight">
                          +{item.selectedAddons.map(a => a.name).join(", ")}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-extrabold text-white">
                    ×{item.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer */}
          <div className="mb-5 rounded-2xl bg-black/30 p-3">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-gray-500">Deliver to</p>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[13px] font-bold text-gray-200">{order.deliveryName}</p>
              <a
                href={`tel:+${order.deliveryPhone}`}
                className="flex items-center gap-1 rounded-full bg-brand-orange/20 px-2 py-0.5 text-[10px] font-bold text-brand-orange"
              >
                <Phone className="h-3 w-3" strokeWidth={2.5} />
                Call
              </a>
            </div>
            <p className="text-[12px] leading-relaxed text-gray-400">
              {order.deliveryAddress}
              {order.deliveryLandmark ? ` · Near: ${order.deliveryLandmark}` : ""}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onDismiss}
              className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl border border-red-900/40 bg-red-950/40 text-[13px] font-bold text-red-400 transition-colors hover:bg-red-900/60 hover:text-red-300"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="group relative flex h-12 flex-[2] items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold text-[14px] font-extrabold text-white shadow-lg shadow-brand-orange/40 transition-all active:scale-95"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
              Accept Order
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function AdminOrdersPage() {
  const { theme, toggleTheme } = useAdminStore();
  const router  = useRouter();
  const [orders, setOrders]       = useState<AdminOrder[] | null>(null);
  const [error, setError]         = useState("");
  const [busyId, setBusyId]       = useState<string | null>(null);
  const [soundOn, setSoundOn]     = useState(true);
  const [ringtone, setRingtone]   = useState<RingtoneId>("kitchen");
  const [newCount, setNewCount]   = useState(0);

  // Queue of new orders waiting for popup (Zomato-style: one at a time)
  const [pendingOrders, setPendingOrders] = useState<AdminOrder[]>([]);

  const alertedOrderIds  = useRef<Set<string>>(new Set());
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const ringLoopRef   = useRef<ReturnType<typeof setTimeout> | null>(null); // loop timer
  const ringtoneRef = useRef<RingtoneId>("kitchen");
  const titleAlertRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const titleAlertCountRef = useRef(0);
  const originalTitleRef = useRef<string | null>(null);
  const originalFaviconHrefRef = useRef<string | null>(null);

  /* ── Audio context ── */
  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    }
    return audioCtxRef.current;
  }

  /* ── Start looping ringtone ── */
  function startRing(force = false) {
    if (!soundOn && !force) return;
    if (ringLoopRef.current) return;
    function loop() {
      try {
        const ctx     = getAudioCtx();
        const endTime = playRingOnce(ctx, ringtoneRef.current);
        const msLeft  = Math.max(0, (endTime - ctx.currentTime) * 1000);
        ringLoopRef.current = setTimeout(loop, msLeft + 260);
      } catch { /* AudioContext not ready */ }
    }
    loop();
  }

  /* ── Stop looping ringtone ── */
  function stopRing() {
    if (ringLoopRef.current) {
      clearTimeout(ringLoopRef.current);
      ringLoopRef.current = null;
    }
  }

  function getFaviconLink() {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    return link;
  }

  function setAlertFavicon(count: number) {
    const link = getFaviconLink();
    if (originalFaviconHrefRef.current === null) {
      originalFaviconHrefRef.current = link.href || "";
    }

    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#e85d04";
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 34px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(count > 9 ? "9+" : String(count), 32, 34);
    link.href = canvas.toDataURL("image/png");
  }

  function startTabAlert(count: number) {
    titleAlertCountRef.current = count;
    if (originalTitleRef.current === null) {
      originalTitleRef.current = document.title;
    }
    setAlertFavicon(count);
    if (titleAlertRef.current) return;

    let flip = false;
    titleAlertRef.current = setInterval(() => {
      flip = !flip;
      document.title = flip
        ? `(${titleAlertCountRef.current}) NEW ORDER!`
        : originalTitleRef.current ?? "Bhook Lagi Admin";
    }, 850);
  }

  function stopTabAlert() {
    if (titleAlertRef.current) {
      clearInterval(titleAlertRef.current);
      titleAlertRef.current = null;
    }
    if (originalTitleRef.current !== null) {
      document.title = originalTitleRef.current;
    }
    const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (link && originalFaviconHrefRef.current !== null) {
      link.href = originalFaviconHrefRef.current;
    }
  }

  function testAlert() {
    try {
      getAudioCtx().resume();
    } catch { /* AudioContext not ready */ }
    stopRing();
    startRing(true);
    startTabAlert(1);
    window.setTimeout(() => {
      stopRing();
      if (pendingOrders.length === 0) {
        stopTabAlert();
      }
    }, 6500);
  }

  function changeRingtone(value: string) {
    if (!RINGTONE_OPTIONS.some((option) => option.id === value)) return;
    const next = value as RingtoneId;
    ringtoneRef.current = next;
    setRingtone(next);
    window.localStorage.setItem("admin-ringtone", next);
    if (ringLoopRef.current) {
      stopRing();
      window.setTimeout(startRing, 40);
    }
  }

  /* ── Show next pending order popup ── */
  const currentPopupOrder = pendingOrders[0] ?? null;

  /* ── Stop ring when no more pending orders ── */
  useEffect(() => {
    if (pendingOrders.length === 0) {
      stopRing();
      stopTabAlert();
    } else {
      startTabAlert(pendingOrders.length);
    }
  }, [pendingOrders.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Start ring when new popup appears ── */
  useEffect(() => {
    if (currentPopupOrder && soundOn) {
      stopRing();
      startRing();
    }
  }, [currentPopupOrder?.id, soundOn]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Unlock AudioContext on first click ── */
  useEffect(() => {
    const unlock = () => {
      try { getAudioCtx().resume(); } catch { /* ignore */ }
    };
    const savedRingtone = window.localStorage.getItem("admin-ringtone");
    if (savedRingtone && RINGTONE_OPTIONS.some((option) => option.id === savedRingtone)) {
      const next = savedRingtone as RingtoneId;
      ringtoneRef.current = next;
      setRingtone(next);
    }
    window.addEventListener("click", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      stopRing();
      stopTabAlert();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  /* ── Reject order from popup ── */
  async function rejectFromPopup(order: AdminOrder) {
    stopRing();
    setPendingOrders((prev) => prev.slice(1));
    await updateStatus(order.id, "cancelled");
  }

  /* ── Accept order from popup ── */
  async function acceptFromPopup(order: AdminOrder) {
    stopRing();
    setPendingOrders((prev) => prev.slice(1));
    await updateStatus(order.id, "preparing");
  }

  // Filter change no longer resets the alerted set, preventing double-alerts

  /* ── Load / poll orders ── */
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.status === 401) { router.replace("/admin/login"); return; }
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Could not load orders.");
      const incoming: AdminOrder[] = payload.orders;

      /* Detect genuinely new placed orders */
      const fresh = incoming.filter((o) => o.status === "placed" && !alertedOrderIds.current.has(o.id));
      if (fresh.length > 0) {
        setNewCount((c) => c + fresh.length);
        
        // Add to popup queue
        setPendingOrders((prev) => {
          const arr = [...prev];
          fresh.forEach(f => {
            if (!arr.find(x => x.id === f.id)) arr.push(f);
            alertedOrderIds.current.add(f.id); // Mark as alerted immediately
          });
          return arr;
        });
      }
      
      // Keep track of all incoming orders so we don't alert them if they change status/poll again
      incoming.forEach((o) => alertedOrderIds.current.add(o.id));
      setOrders(incoming.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load orders.");
    }
  }, [router]);

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  /* ── Update order status ── */
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
  const activeOrders = displayed.filter((order) => ORDER_BOARD_COLUMNS.some((column) => column.value === order.status));
  const deliveredCount = displayed.filter((order) => order.status === "delivered").length;

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-dvh bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-white">

      {/* ════════ NEW ORDER POPUP ════════ */}
      <AnimatePresence>
        {currentPopupOrder && (
          <NewOrderPopup
            key={currentPopupOrder.id}
            order={currentPopupOrder}
            onAccept={() => acceptFromPopup(currentPopupOrder)}
            onDismiss={() => rejectFromPopup(currentPopupOrder)}
          />
        )}
      </AnimatePresence>

      {/* ── Sticky top nav ── */}
      <AdminPageHeader
        icon={<span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange text-base shadow-md shadow-brand-orange/40">🍔</span>}
        title="Bhook Lagi Admin"
        subtitle="Order management"
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      >
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
              {newCount} new!
            </motion.button>
          )}
        </AnimatePresence>
        {/* Ringtone controls */}
        <label className="hidden h-9 items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 text-gray-500 dark:border-white/10 dark:bg-white/5 sm:flex">
          <Bell className="h-4 w-4 text-brand-orange" strokeWidth={2.5} />
          <select
            value={ringtone}
            onChange={(e) => changeRingtone(e.target.value)}
            title="Choose ringtone"
            className="bg-transparent text-[12px] font-extrabold text-gray-700 outline-none dark:text-gray-200"
          >
            {RINGTONE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id} className="bg-gray-950 text-white">
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <select
          value={ringtone}
          onChange={(e) => changeRingtone(e.target.value)}
          title="Choose ringtone"
          className="h-9 rounded-xl border border-gray-200 bg-white px-2 text-[11px] font-extrabold text-gray-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-200 sm:hidden"
        >
          {RINGTONE_OPTIONS.map((option) => (
            <option key={option.id} value={option.id} className="bg-gray-950 text-white">
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={testAlert}
          title="Test ringtone"
          className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-3 text-[12px] font-extrabold text-brand-orange transition-colors hover:bg-brand-orange hover:text-white"
        >
          <Bell className="h-4 w-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Test</span>
        </button>
        <button
          type="button"
          onClick={() => { if (soundOn) stopRing(); setSoundOn((v) => !v); }}
          title={soundOn ? "Mute ringtone" : "Unmute ringtone"}
          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
            soundOn
              ? "border-brand-orange/30 bg-brand-orange/10 text-brand-orange"
              : "border-gray-200 bg-white text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-gray-500"
          }`}
        >
          {soundOn ? <Bell className="h-4 w-4" strokeWidth={2.5} /> : <BellOff className="h-4 w-4" strokeWidth={2.5} />}
        </button>
        {/* Refresh */}
        <button
          type="button"
          onClick={load}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </AdminPageHeader>

      <main className="mx-auto max-w-[1500px] px-4 py-6 md:px-6">
        {orders && (
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {ORDER_BOARD_COLUMNS.map((column) => {
              const count = orders.filter((order) => order.status === column.value).length;
              return (
                <div
                  key={column.value}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-200/70 dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${column.accent}`}>
                      {column.icon}
                    </div>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:bg-white/10 dark:text-gray-400">
                      {column.caption}
                    </span>
                  </div>
                  <p className="mt-4 text-[28px] font-black leading-none text-gray-950 dark:text-white">{count}</p>
                  <p className="mt-2 text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{column.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {orders && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm shadow-gray-200/60 dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/20">
            <div>
              <p className="text-[14px] font-black text-gray-950 dark:text-white">Live order board</p>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                {activeOrders.length} active/cancelled orders shown · {deliveredCount} delivered kept out of this board
              </p>
            </div>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2 text-[12px] font-black text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={2.5} />
              Refresh
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}
        {!orders && !error && (
          <div className="flex items-center gap-3 text-[13px] text-gray-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-brand-orange" />
            Loading orders…
          </div>
        )}
        {orders && activeOrders.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-700" strokeWidth={1.2} />
            <p className="mt-4 text-[14px] font-bold text-gray-500">No orders here</p>
          </div>
        )}

        {orders && activeOrders.length > 0 && (
          <div className="grid gap-4 xl:grid-cols-4">
            {ORDER_BOARD_COLUMNS.map((column) => {
              const columnOrders = displayed.filter((order) => order.status === column.value);
              return (
                <section
                  key={column.value}
                  className="min-h-[360px] rounded-2xl border border-gray-200 bg-gray-100/70 p-3 dark:border-white/10 dark:bg-white/[0.035]"
                >
                  <div className="mb-3 flex items-center justify-between gap-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${column.accent}`}>{column.icon}</span>
                      <div>
                        <h2 className="text-[13px] font-black text-gray-950 dark:text-white">{column.label}</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500">{column.caption}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-gray-700 shadow-sm dark:bg-white/10 dark:text-white">
                      {columnOrders.length}
                    </span>
                  </div>

                  {columnOrders.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/70 text-center dark:border-white/10 dark:bg-black/10">
                      <ShoppingBag className="h-8 w-8 text-gray-300 dark:text-gray-700" strokeWidth={1.5} />
                      <p className="mt-2 text-[12px] font-black text-gray-400 dark:text-gray-600">No orders</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence initial={false}>
                        {columnOrders.map((o) => {
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
                              className={`overflow-hidden rounded-2xl border bg-white shadow-sm shadow-gray-200/70 dark:bg-gray-950/80 dark:shadow-black/30 ${
                                o.status === "placed"
                                  ? "border-brand-orange/35 ring-1 ring-brand-orange/10 dark:bg-gradient-to-br dark:from-brand-orange/10 dark:to-gray-950"
                                  : "border-gray-200 dark:border-white/10"
                              }`}
                            >
                              <div className="p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate font-mono text-[12px] font-black text-gray-950 dark:text-white">{o.orderNumber}</p>
                                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${meta.pill}`}>
                                        {meta.emoji} {meta.label}
                                      </span>
                                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-white/10 dark:text-gray-300">
                                        {o.paymentMode === "cod" ? "Cash" : o.paymentMode}
                                      </span>
                                      {isNew && (
                                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-black text-green-700 dark:bg-green-500/20 dark:text-green-300">
                                          NEW
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="shrink-0 text-right">
                                    <p className="font-display text-[19px] leading-none text-brand-orange">{formatInr(o.grandTotal)}</p>
                                    <p className="mt-1 flex items-center justify-end gap-1 text-[10px] font-semibold text-gray-500 dark:text-gray-500">
                                      <Clock className="h-3 w-3" strokeWidth={2} />
                                      {new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {o.items.map((item) => (
                                    <span key={item.itemId} className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-2.5 py-1.5 text-[11px] font-bold text-gray-700 dark:bg-white/10 dark:text-gray-200">
                                      {item.emoji}
                                      <span className="min-w-0 truncate">{item.name}</span>
                                      <span className="rounded-full bg-white px-1.5 text-[10px] font-black text-gray-800 dark:bg-white/15 dark:text-white">x{item.qty}</span>
                                    </span>
                                  ))}
                                </div>

                                {o.specialInstructions && (
                                  <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] dark:border-amber-500/30 dark:bg-amber-500/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-300">Instructions</p>
                                    <p className="mt-0.5 text-amber-800 dark:text-amber-100">{o.specialInstructions}</p>
                                  </div>
                                )}

                                <div className="mt-3 rounded-xl bg-gray-50 px-3 py-2.5 text-[12px] dark:bg-black/25">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-black text-gray-900 dark:text-gray-100">{o.deliveryName}</span>
                                    <a href={`tel:+${o.deliveryPhone}`} className="flex items-center gap-1 rounded-full bg-brand-orange/10 px-2 py-0.5 text-[11px] font-black text-brand-orange">
                                      <Phone className="h-3 w-3" strokeWidth={2.5} />+{o.deliveryPhone.slice(-10)}
                                    </a>
                                  </div>
                                  <p className="mt-1 line-clamp-2 text-gray-600 dark:text-gray-400">
                                    {o.deliveryAddress}{o.deliveryLandmark ? ` · Near: ${o.deliveryLandmark}` : ""}
                                  </p>
                                  {o.deliveryLat !== null && o.deliveryLng !== null ? (
                                    <div className="mt-2 flex flex-wrap gap-2 border-t border-gray-200 pt-2 dark:border-white/10">
                                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-black text-green-700 dark:bg-green-500/15 dark:text-green-300">
                                        <MapPinned className="h-3.5 w-3.5" />
                                        GPS{typeof o.deliveryAccuracyM === "number" ? ` ~${Math.round(o.deliveryAccuracyM)}m` : ""}
                                      </span>
                                      <a href={googlePinUrl(o.deliveryLat, o.deliveryLng)} target="_blank" rel="noreferrer"
                                        className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-gray-700 ring-1 ring-gray-200 transition-colors hover:text-gray-950 dark:bg-white/10 dark:text-white dark:ring-transparent dark:hover:bg-white/15">
                                        <MapPinned className="h-3.5 w-3.5" /> Pin
                                      </a>
                                      <a href={googleRouteUrl(o.deliveryLat, o.deliveryLng)} target="_blank" rel="noreferrer"
                                        className="inline-flex items-center gap-1 rounded-full bg-brand-orange/10 px-2.5 py-1 text-[11px] font-black text-brand-orange transition-colors hover:bg-brand-orange/20">
                                        <Navigation className="h-3.5 w-3.5" /> Route
                                      </a>
                                    </div>
                                  ) : (
                                    <div className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                                      GPS pin not captured
                                    </div>
                                  )}
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  {next && (
                                    <button
                                      type="button"
                                      disabled={busyId === o.id}
                                      onClick={() => updateStatus(o.id, next)}
                                      className="flex items-center gap-1.5 rounded-xl bg-brand-orange px-3 py-2 text-[11px] font-black text-white shadow-md shadow-brand-orange/25 transition-all hover:bg-brand-orange-dark active:scale-95 disabled:opacity-50"
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
                                      className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-black text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/40"
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
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
    </div>
  );
}
