"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, MapPin, Clock, RotateCcw, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { menuItems } from "@/data/menu";

type LastOrder = {
  orderNumber: string;
  items: { itemId: string; name: string; qty: number; emoji: string }[];
  createdAt: string;
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function AppHomeHero() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const addItem = useCartStore((s) => s.addItem);

  const [query, setQuery] = useState("");
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/orders/mine")
      .then((r) => r.json())
      .then((d) => setLastOrder(d.orders?.[0] ?? null))
      .catch(() => {});
  }, [status]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/menu?q=${encodeURIComponent(q)}` : "/menu");
  }

  function reorder() {
    if (!lastOrder) return;
    for (const line of lastOrder.items) {
      const item = menuItems.find((m) => m.id === line.itemId);
      if (item) addItem(item, line.qty);
    }
    router.push("/cart");
  }

  return (
    <section className="relative overflow-hidden bg-white px-4 pb-6 pt-24 md:px-6 md:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[220px] bg-gradient-to-b from-brand-orange/[0.06] to-transparent"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Location + ETA */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-brand-orange/20 bg-brand-orange/5 px-3.5 py-1.5 text-[12px] font-semibold text-brand-orange">
            <MapPin className="h-3.5 w-3.5" strokeWidth={2.5} />
            Deoghar, Jharkhand
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-[12px] font-semibold text-gray-600">
            <Clock className="h-3.5 w-3.5" strokeWidth={2.5} />
            Delivery in 25–35 min
          </span>
        </div>

        {/* Greeting */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-[22px] font-bold text-gray-900 md:text-[26px]"
        >
          {greeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
        </motion.h1>
        <p className="mt-1 text-[14px] text-gray-500">Bhook lagi? Let&apos;s find something tasty.</p>

        {/* Search */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="relative mt-5"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for burgers, rolls, maggi…"
            className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-[14px] text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          />
        </motion.form>

        {/* Reorder card */}
        {lastOrder && (
          <motion.button
            type="button"
            onClick={reorder}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3.5 text-left transition-colors hover:border-brand-orange/30 hover:bg-brand-orange/[0.04]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
              <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-gray-900">Reorder your last meal</span>
              <span className="block truncate text-[12px] text-gray-500">
                {lastOrder.items.map((i) => `${i.emoji} ${i.name}`).join(", ")}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
          </motion.button>
        )}
      </div>
    </section>
  );
}
