"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock3, PackageCheck, Receipt, RotateCcw, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore, type CartLine } from "@/stores/cart-store";
import { OtpLoginForm } from "@/components/auth/OtpLoginForm";
import { formatInr } from "@/data/menu";
import { ORDER_STATUS_META, type OrderStatus } from "@/lib/orders";

type OrderSummary = {
  orderNumber: string;
  items: CartLine[];
  status: OrderStatus;
  paymentMode: string;
  grandTotal: number;
  createdAt: string;
};

export default function OrdersHistoryPage() {
  const router = useRouter();
  const authStatus = useAuthStore((s) => s.status);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const replaceLines = useCartStore((s) => s.replaceLines);
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/orders/mine")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .catch(() => setOrders([]));
  }, [authStatus]);

  function repeatOrder(order: OrderSummary) {
    replaceLines(order.items);
    router.push("/cart");
  }

  if (authStatus === "guest") {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col items-center justify-center px-4 pb-28 pt-20">
          <div className="mb-8 w-full">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-brand-orange shadow-lg shadow-brand-orange/30">
              <span className="text-[28px] font-black text-white">BL</span>
            </div>
          </div>
          <div className="w-full rounded-[28px] bg-white p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
            <OtpLoginForm />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 pb-28 pt-20 md:pb-16 md:pt-24">
        <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-gray-900 to-brand-orange p-5 text-white shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">Order history</p>
              <h1 className="mt-1 text-[24px] font-black tracking-tight">My orders</h1>
              <p className="mt-1 text-[12px] font-medium text-white/70">Track, view bill, and repeat your favourites quickly.</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Receipt className="h-6 w-6" />
            </span>
          </div>
        </div>

        {(authStatus === "loading" || orders === null) && (
          <p className="text-[14px] text-gray-400">Loading…</p>
        )}

        {orders && orders.length === 0 && (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" strokeWidth={1.6} />
            <p className="mt-4 text-[17px] font-extrabold text-gray-900">No orders yet</p>
            <p className="mt-1 text-[13px] text-gray-500">Your tasty order history will show up here.</p>
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
              const itemLine = o.items.map((i) => `${i.name} x${i.qty}`).join(", ");
              const itemCount = o.items.reduce((sum, item) => sum + item.qty, 0);
              return (
                <li key={o.orderNumber} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                  <Link href={`/orders/${o.orderNumber}`} className="block p-4 transition-colors hover:bg-orange-50/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${meta.pill}`}>
                            <PackageCheck className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-mono text-[13px] font-extrabold text-gray-950">{o.orderNumber}</p>
                            <p className="text-[11px] font-semibold text-gray-400">
                              {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 line-clamp-2 text-[13px] font-medium leading-relaxed text-gray-600">{itemLine}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[16px] font-black text-gray-950">{formatInr(o.grandTotal)}</p>
                        <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold ${meta.pill}`}>
                          {meta.label}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-2xl bg-gray-50 px-3 py-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        {itemCount} item{itemCount > 1 ? "s" : ""} · {o.paymentMode === "cod" ? "COD" : "Online"}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-extrabold text-brand-orange">
                        View details <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                  <div className="border-t border-gray-100 p-3">
                    <button
                      type="button"
                      onClick={() => repeatOrder(o)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold px-4 py-3 text-[13px] font-extrabold text-white shadow-md shadow-brand-orange/20 active:scale-[0.98]"
                    >
                      <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
                      Repeat order
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
