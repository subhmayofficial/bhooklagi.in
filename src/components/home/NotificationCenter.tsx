"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell, Package, CheckCircle2, Clock, Truck, X, Tag, ChevronRight, Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { formatInr } from "@/data/menu";

type OrderNotif = {
  kind: "order";
  orderNumber: string;
  status: string;
  total: number;
  itemPreview: string;
  createdAt: string;
};

type PromoNotif = {
  kind: "promo";
  id: string;
  title: string;
  body: string;
  emoji: string;
};

type Notif = OrderNotif | PromoNotif;

const STATUS_META: Record<string, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  placed:           { label: "Order placed",      bg: "bg-blue-50",   text: "text-blue-600",   Icon: Package },
  preparing:        { label: "Being prepared",    bg: "bg-amber-50",  text: "text-amber-600",  Icon: Clock },
  out_for_delivery: { label: "Out for delivery",  bg: "bg-orange-50", text: "text-orange-600", Icon: Truck },
  delivered:        { label: "Delivered ✓",       bg: "bg-green-50",  text: "text-green-700",  Icon: CheckCircle2 },
  cancelled:        { label: "Cancelled",         bg: "bg-red-50",    text: "text-red-600",    Icon: X },
};

const STATIC_PROMOS: PromoNotif[] = [
  {
    kind: "promo", id: "p1",
    title: "🔥 ₹80 off your first order!",
    body: "Fresh off the kitchen, straight to your door.",
    emoji: "🎉",
  },
  {
    kind: "promo", id: "p2",
    title: "New: Combo Meals are live!",
    body: "Complete meals starting at just ₹119.",
    emoji: "🍱",
  },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getLastSeen(): number {
  try { return parseInt(localStorage.getItem("bl_notifs_seen") ?? "0", 10); } catch { return 0; }
}
function markSeen(): void {
  try { localStorage.setItem("bl_notifs_seen", Date.now().toString()); } catch {}
}

export function NotificationCenter() {
  const router       = useRouter();
  const status       = useAuthStore((s) => s.status);
  const openLogin    = useAuthStore((s) => s.openLoginModal);

  const [open, setOpen]           = useState(false);
  const [orderNotifs, setOrderNotifs] = useState<OrderNotif[]>([]);
  const [unread, setUnread]       = useState(0);
  const containerRef              = useRef<HTMLDivElement>(null);

  // Fetch recent orders for notifications
  useEffect(() => {
    if (status !== "authenticated") { setOrderNotifs([]); setUnread(0); return; }
    fetch("/api/orders/mine")
      .then((r) => r.json())
      .then((d) => {
        const orders = (d.orders ?? []).slice(0, 4);
        const notifs: OrderNotif[] = orders.map((o: {
          orderNumber: string; status: string; grandTotal: number; createdAt: string;
          items: { name: string; qty: number }[];
        }) => ({
          kind: "order" as const,
          orderNumber: o.orderNumber,
          status: o.status,
          total: o.grandTotal,
          itemPreview: o.items.slice(0, 2).map((i) => `${i.name} ×${i.qty}`).join(", ") +
            (o.items.length > 2 ? ` +${o.items.length - 2}` : ""),
          createdAt: o.createdAt,
        }));
        setOrderNotifs(notifs);
        // Count orders newer than last seen
        const lastSeen = getLastSeen();
        const freshCount = notifs.filter((n) => new Date(n.createdAt).getTime() > lastSeen).length;
        setUnread(freshCount + (lastSeen === 0 ? STATIC_PROMOS.length : 0));
      })
      .catch(() => {});
  }, [status]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function toggle() {
    if (status !== "authenticated") { openLogin(); return; }
    if (!open) {
      setOpen(true);
      markSeen();
      setUnread(0);
    } else {
      setOpen(false);
    }
  }

  const allNotifs: Notif[] = [...orderNotifs, ...STATIC_PROMOS];

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white shadow-lg shadow-black/10 ring-1 ring-white/25 backdrop-blur-sm transition-transform active:scale-95"
      >
        <Bell className="h-5 w-5" strokeWidth={2.5} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white shadow-sm">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
          <div
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-[320px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-brand-orange" strokeWidth={2.5} />
                <span className="text-[14px] font-extrabold text-gray-900">Notifications</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[400px] overflow-y-auto">
              {allNotifs.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Sparkles className="h-8 w-8 text-gray-300" />
                  <p className="text-[13px] font-semibold text-gray-400">No notifications yet</p>
                  <p className="text-[11px] text-gray-300">Place your first order to get started</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {orderNotifs.length > 0 && (
                    <li className="px-4 pb-1 pt-2.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Orders</span>
                    </li>
                  )}
                  {orderNotifs.map((n) => {
                    const meta = STATUS_META[n.status] ?? STATUS_META["placed"];
                    const Icon = meta.Icon;
                    return (
                      <li key={n.orderNumber}>
                        <button
                          type="button"
                          onClick={() => { router.push(`/orders/${n.orderNumber}`); setOpen(false); }}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                        >
                          <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.bg}`}>
                            <Icon className={`h-4 w-4 ${meta.text}`} strokeWidth={2} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-1">
                              <span className={`text-[11px] font-extrabold uppercase tracking-wide ${meta.text}`}>{meta.label}</span>
                              <span className="text-[10px] text-gray-400">{timeAgo(n.createdAt)}</span>
                            </span>
                            <span className="mt-0.5 block truncate text-[12px] font-medium text-gray-700">
                              {n.itemPreview}
                            </span>
                            <span className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
                              <span>#{n.orderNumber}</span>
                              <span>·</span>
                              <span className="font-semibold text-gray-600">{formatInr(n.total)}</span>
                            </span>
                          </span>
                          <ChevronRight className="mt-2 h-3.5 w-3.5 shrink-0 text-gray-300" />
                        </button>
                      </li>
                    );
                  })}

                  {/* Promos */}
                  <li className="px-4 pb-1 pt-2.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Offers & Updates</span>
                  </li>
                  {STATIC_PROMOS.map((n) => (
                    <li key={n.id}>
                      <div className="flex items-start gap-3 px-4 py-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[18px]">
                          {n.emoji}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <Tag className="h-3 w-3 text-brand-orange" strokeWidth={2.5} />
                            <span className="text-[12px] font-extrabold text-gray-900">{n.title}</span>
                          </span>
                          <span className="mt-0.5 block text-[11px] text-gray-500">{n.body}</span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {orderNotifs.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => { router.push("/orders"); setOpen(false); }}
                  className="text-[12px] font-bold text-brand-orange hover:underline"
                >
                  View all orders →
                </button>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
