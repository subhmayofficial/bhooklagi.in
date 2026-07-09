"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, RefreshCw, Users, ShoppingBag } from "lucide-react";
import { formatInr } from "@/data/menu";
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
  grandTotal: number;
  createdAt: string;
};

const FILTERS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Placed", value: "placed" },
  { label: "Preparing", value: "preparing" },
  { label: "Out", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const url = filter === "all" ? "/api/admin/orders" : `/api/admin/orders?status=${filter}`;
      const res = await fetch(url);
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Could not load orders.");
      setOrders(payload.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load orders.");
    }
  }, [filter, router]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000); // poll for new orders
    return () => clearInterval(t);
  }, [load]);

  async function updateStatus(id: string, status: OrderStatus) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setOrders((prev) => (prev ? prev.map((o) => (o.id === id ? { ...o, status } : o)) : prev));
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

  return (
    <main className="min-h-dvh bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-orange" />
            <h1 className="text-[20px] font-bold text-gray-900">
              Orders {orders ? `(${orders.length})` : ""}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-gray-600 hover:text-gray-900"
            >
              <Users className="h-3.5 w-3.5" />
              Users
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors ${
                filter === f.value ? "bg-brand-orange text-white" : "bg-white text-gray-500 hover:text-gray-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <p className="mb-3 text-[13px] text-red-500">{error}</p>}
        {!orders && !error && <p className="text-[13px] text-gray-400">Loading…</p>}
        {orders && orders.length === 0 && <p className="text-[13px] text-gray-400">No orders here.</p>}

        <div className="space-y-3">
          {orders?.map((o) => {
            const meta = ORDER_STATUS_META[o.status];
            const next = NEXT_STATUS[o.status];
            return (
              <div key={o.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] font-bold text-gray-900">{o.orderNumber}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.pill}`}>
                        {meta.emoji} {meta.label}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                        {o.paymentMode === "cod" ? "COD" : o.paymentMode}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <p className="text-[16px] font-extrabold text-gray-900">{formatInr(o.grandTotal)}</p>
                </div>

                {/* Items */}
                <p className="mt-2 text-[13px] text-gray-600">
                  {o.items.map((i) => `${i.emoji} ${i.name} ×${i.qty}`).join("  ·  ")}
                </p>

                {/* Delivery */}
                <div className="mt-2 rounded-xl bg-gray-50 px-3 py-2 text-[12px] text-gray-600">
                  <span className="font-semibold text-gray-800">{o.deliveryName}</span>
                  {" · "}
                  <a href={`tel:+${o.deliveryPhone}`} className="text-brand-orange">
                    +{o.deliveryPhone.slice(-10)}
                  </a>
                  <br />
                  {o.deliveryAddress}
                  {o.deliveryLandmark ? ` (Near: ${o.deliveryLandmark})` : ""}
                </div>

                {/* Actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {next && (
                    <button
                      type="button"
                      disabled={busyId === o.id}
                      onClick={() => updateStatus(o.id, next)}
                      className="rounded-xl bg-brand-orange px-4 py-2 text-[12px] font-bold text-white hover:bg-brand-orange-dark disabled:opacity-60"
                    >
                      Mark {ORDER_STATUS_META[next].label} →
                    </button>
                  )}
                  {o.status !== "cancelled" && o.status !== "delivered" && (
                    <button
                      type="button"
                      disabled={busyId === o.id}
                      onClick={() => updateStatus(o.id, "cancelled")}
                      className="rounded-xl border border-red-200 px-4 py-2 text-[12px] font-bold text-red-500 hover:bg-red-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
