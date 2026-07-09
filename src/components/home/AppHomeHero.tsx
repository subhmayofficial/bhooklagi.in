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
  Mic,
  X,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore, cartTotals } from "@/stores/cart-store";
import { menuItems, formatInr } from "@/data/menu";

type LastOrder = {
  orderNumber: string;
  items: { itemId: string; name: string; qty: number; emoji: string }[];
  createdAt: string;
};

type LastOrderStatus = "idle" | "loading" | "empty" | "ready";

const SEARCH_SUGGESTIONS = ["burgers", "maggi", "rolls", "fries", "cheese maggi", "chicken burger", "paneer roll"];

const QUICK_CATS = [
  { label: "Burgers",    emoji: "🍔", q: "burgers" },
  { label: "Rolls",      emoji: "🌯", q: "rolls" },
  { label: "Maggi",      emoji: "🍜", q: "maggi" },
  { label: "Fries",      emoji: "🍟", q: "fries" },
  { label: "Sandwiches", emoji: "🥪", q: "sandwiches" },
  { label: "Beverages",  emoji: "🧃", q: "beverages" },
];

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
  const [lastOrderStatus, setLastOrderStatus] = useState<LastOrderStatus>("idle");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (status !== "authenticated") {
      setLastOrderStatus("idle");
      return;
    }
    // Reserve the reorder slot immediately (skeleton) so it never pops in and
    // shifts the layout once the real order data arrives.
    setLastOrderStatus("loading");
    fetch("/api/orders/mine")
      .then((r) => r.json())
      .then((d) => {
        const o = d.orders?.[0] ?? null;
        setLastOrder(o);
        setLastOrderStatus(o ? "ready" : "empty");
      })
      .catch(() => setLastOrderStatus("empty"));
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

        {/* ── Enhanced Search ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="mt-4 space-y-2.5"
        >
          {/* Search input row */}
          <form onSubmit={handleSearch} className="relative">
            {/* Glass container */}
            <div className="relative flex items-center overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-2 ring-white/60 transition-shadow focus-within:shadow-[0_8px_40px_rgba(0,0,0,0.28)] focus-within:ring-brand-orange/30">
              {/* Search icon */}
              <div className="flex h-full items-center pl-4 pr-2">
                <Search className="h-[18px] w-[18px] text-gray-400" strokeWidth={2.5} />
              </div>

              {/* Input */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent py-4 pr-2 text-[14px] font-medium text-gray-900 placeholder-transparent focus:outline-none"
              />

              {/* Animated placeholder (when empty) */}
              {!query && (
                <div className="pointer-events-none absolute left-[52px] top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-[14px] text-gray-400">
                  <span className="font-normal">Search for</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={suggestionIndex}
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -8, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="font-semibold text-gray-600"
                    >
                      &ldquo;{SEARCH_SUGGESTIONS[suggestionIndex]}&rdquo;
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}

              {/* Clear button (when typing) */}
              <AnimatePresence>
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.15 }}
                    type="button"
                    onClick={() => setQuery("")}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Mic icon */}
              <div className="pr-1">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                  <Mic className="h-4 w-4" strokeWidth={2} />
                </span>
              </div>

              {/* Search CTA */}
              <button
                type="submit"
                className="m-1.5 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold px-4 py-2.5 text-[13px] font-extrabold text-white shadow-md shadow-brand-orange/30 transition-all active:scale-95 hover:shadow-lg"
              >
                <Search className="h-3.5 w-3.5" strokeWidth={3} />
                Search
              </button>
            </div>
          </form>

          {/* Quick category pills */}
          <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
            {QUICK_CATS.map((cat, i) => (
              <motion.button
                key={cat.q}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
                type="button"
                onClick={() => router.push(`/menu?cat=${cat.q}`)}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95"
              >
                <span className="text-[13px]">{cat.emoji}</span>
                {cat.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Reorder card — skeleton reserves the space, then crossfades to real
            content, so there's no sudden height jump once data arrives. */}
        <AnimatePresence initial={false}>
          {(lastOrderStatus === "loading" || lastOrderStatus === "ready") && (
            <motion.div
              key="reorder-slot"
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-4"
            >
              {lastOrderStatus === "loading" || !lastOrder ? (
                <div className="flex w-full animate-pulse items-center gap-3 rounded-2xl bg-white/70 p-3.5 shadow-lg">
                  <span className="h-9 w-9 shrink-0 rounded-xl bg-gray-200" />
                  <span className="min-w-0 flex-1 space-y-1.5">
                    <span className="block h-3 w-2/5 rounded bg-gray-200" />
                    <span className="block h-2.5 w-4/5 rounded bg-gray-100" />
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={reorder}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-lg transition-transform active:scale-[0.99]"
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
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
