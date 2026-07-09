"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Receipt } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useAuthStore } from "@/stores/auth-store";
import { formatInr } from "@/data/menu";
import { ORDER_STATUS_META, type OrderStatus } from "@/lib/orders";

type OrderSummary = {
  orderNumber: string;
  items: { name: string; qty: number; emoji: string }[];
  status: OrderStatus;
  paymentMode: string;
  grandTotal: number;
  createdAt: string;
};

export default function OrdersHistoryPage() {
  const authStatus = useAuthStore((s) => s.status);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/orders/mine")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .catch(() => setOrders([]));
  }, [authStatus]);

  if (authStatus === "guest") {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-lg px-4 pb-28 pt-28 text-center">
          <h1 className="text-[19px] font-bold text-gray-900">Log in to see your orders</h1>
          <button
            type="button"
            onClick={openLoginModal}
            className="mt-6 inline-flex rounded-full bg-brand-orange px-8 py-3 text-[14px] font-bold text-white"
          >
            Log in with OTP
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 pb-28 pt-20 md:pb-16 md:pt-24">
        <div className="mb-6 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-brand-orange" />
          <h1 className="text-[20px] font-bold text-gray-900">My orders</h1>
        </div>

        {(authStatus === "loading" || orders === null) && (
          <p className="text-[14px] text-gray-400">Loading…</p>
        )}

        {orders && orders.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <p className="text-[15px] font-semibold text-gray-700">No orders yet</p>
            <Link
              href="/menu"
              className="mt-5 inline-flex rounded-full bg-brand-orange px-8 py-3 text-[14px] font-bold text-white"
            >
              Browse menu
            </Link>
          </div>
        )}

        {orders && orders.length > 0 && (
          <ul className="space-y-3">
            {orders.map((o) => {
              const meta = ORDER_STATUS_META[o.status];
              const itemLine = o.items.map((i) => `${i.name} ×${i.qty}`).join(", ");
              return (
                <li key={o.orderNumber}>
                  <Link
                    href={`/orders/${o.orderNumber}`}
                    className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-bold text-gray-900">{o.orderNumber}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.pill}`}>
                          {meta.emoji} {meta.label}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[13px] text-gray-500">{itemLine}</p>
                      <p className="mt-1 text-[11px] text-gray-400">
                        {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-extrabold text-gray-900">{formatInr(o.grandTotal)}</p>
                      <p className="text-[11px] text-gray-400">{o.paymentMode === "cod" ? "COD" : "Paid"}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
