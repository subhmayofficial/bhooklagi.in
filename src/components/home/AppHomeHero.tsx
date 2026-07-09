"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  MapPin,
  ChevronDown,
  RotateCcw,
  ChevronRight,
  Wallet,
  User,
  ShoppingBag,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore, cartTotals } from "@/stores/cart-store";
import { menuItems, formatInr } from "@/data/menu";

type LastOrder = {
  orderNumber: string;
  items: { itemId: string; name: string; qty: number; emoji: string }[];
  createdAt: string;
};

const SEARCH_SUGGESTIONS = ["burgers", "maggi", "rolls", "cold coffee", "fries"];

// Decorative background accents — purely visual, don't affect layout flow.
const FLOATERS: { emoji: string; className: string; delay: number; duration: number }[] = [
  { emoji: "🍔", className: "left-[6%] top-[14%] text-2xl", delay: 0,   duration: 3.4 },
  { emoji: "🍟", className: "right-[10%] top-[10%] text-xl", delay: 0.4, duration: 3.0 },
  { emoji: "🌯", className: "right-[18%] bottom-[8%] text-xl", delay: 0.8, duration: 3.8 },
  { emoji: "🧃", className: "left-[16%] bottom-[12%] text-xl", delay: 1.2, duration: 3.2 },
];

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
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const addItem = useCartStore((s) => s.addItem);
  const lines = useCartStore((s) => s.lines);
  const { qty } = cartTotals(lines);

  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/orders/mine")
      .then((r) => r.json())
      .then((d) => setLastOrder(d.orders?.[0] ?? null))
      .catch(() => {});
    fetch("/api/account")
      .then((r) => r.json())
      .then((d) => setWalletBalance(d.account?.walletBalance ?? null))
      .catch(() => {});
  }, [status]);

  useEffect(() => {
    const t = setInterval(
      () => setSuggestionIndex((i) => (i + 1) % SEARCH_SUGGESTIONS.length),
      2200,
    );
    return () => clearInterval(t);
  }, []);

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

  function handleProfileTap() {
    if (status === "authenticated") router.push("/account");
    else openLoginModal();
  }

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-brand-orange via-brand-orange-dark to-brand-gold px-4 pb-7"
      style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
    >
      {/* Floating food accents */}
      {FLOATERS.map((f, i) => (
        <motion.span
          key={i}
          aria-hidden
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: f.duration, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
          className={`pointer-events-none absolute select-none opacity-[0.15] drop-shadow ${f.className}`}
        >
          {f.emoji}
        </motion.span>
      ))}

      <div className="relative mx-auto max-w-6xl">
        {/* App-style top row: location + quick icons (no website nav bar) */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            type="button"
            className="flex min-w-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            <span className="truncate">Deoghar, Jharkhand</span>
            <ChevronDown className="h-3 w-3 shrink-0 opacity-80" strokeWidth={2.5} />
          </button>

          <div className="flex shrink-0 items-center gap-2">
            {mounted && status === "authenticated" && (
              <button
                type="button"
                onClick={() => router.push("/account")}
                className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm"
              >
                <Wallet className="h-3.5 w-3.5" strokeWidth={2.5} />
                {formatInr(walletBalance ?? 0)}
              </button>
            )}
            <button
              type="button"
              onClick={handleProfileTap}
              aria-label="Account"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
            >
              <User className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => router.push("/cart")}
              aria-label="Cart"
              className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={2.5} />
              {mounted && qty > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-bold text-brand-gold">
                  {qty > 9 ? "9+" : qty}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Compact delivery + promo badges — visual, not a giant headline */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-center gap-2"
        >
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-bold text-white backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            25–35 min
          </span>
          <span className="rotate-[-2deg] rounded-full bg-ink px-3 py-1.5 text-[11px] font-extrabold text-brand-gold shadow-sm">
            🔥 Flat ₹80 OFF
          </span>
        </motion.div>
        <p className="mt-2 text-[13px] font-medium text-white/85">
          {greeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""} — bhook lagi? 👋
        </p>

        {/* Search */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="relative mt-4"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border-0 bg-white py-3.5 pl-11 pr-4 text-[14px] text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/60"
          />
          {!query && (
            <div className="pointer-events-none absolute left-11 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[14px] text-gray-400">
              <span>Search for</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={suggestionIndex}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-semibold text-gray-500"
                >
                  &ldquo;{SEARCH_SUGGESTIONS[suggestionIndex]}&rdquo;
                </motion.span>
              </AnimatePresence>
            </div>
          )}
          <span className="pointer-events-none absolute -right-1.5 -top-2.5 rotate-6 rounded-full bg-ink px-2 py-0.5 text-[9px] font-extrabold text-brand-gold shadow-sm">
            ⭐ 4.6 rated
          </span>
        </motion.form>

        {/* Reorder card */}
        {lastOrder && (
          <motion.button
            type="button"
            onClick={reorder}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-lg transition-transform active:scale-[0.99]"
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
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              className="shrink-0 text-gray-300"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.span>
          </motion.button>
        )}
      </div>
    </section>
  );
}
