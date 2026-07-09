"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronRight, Search, X } from "lucide-react";
import { categories, menuItems, type MenuCategoryId, formatInr } from "@/data/menu";
import { useCartStore, cartTotals } from "@/stores/cart-store";
import { DishCard } from "@/components/menu/DishCard";
import { cn } from "@/lib/utils";

export function MenuExplorer() {
  const router = useRouter();
  const params = useSearchParams();
  const catParam = params.get("cat") as MenuCategoryId | null;
  const qParam = params.get("q") ?? "";
  const validInitial =
    catParam && categories.some((c) => c.id === catParam) ? catParam : "all";

  const [active, setActive] = useState<MenuCategoryId | "all">(validInitial);
  const [query, setQuery] = useState(qParam);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (catParam && categories.some((c) => c.id === catParam)) {
      setActive(catParam);
    }
  }, [catParam]);
  useEffect(() => setQuery(qParam), [qParam]);

  const filtered = useMemo(() => {
    const byCategory = active === "all" ? menuItems : menuItems.filter((m) => m.categoryId === active);
    const q = query.trim().toLowerCase();
    if (!q) return byCategory;
    return byCategory.filter(
      (m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q),
    );
  }, [active, query]);

  function clearSearch() {
    setQuery("");
    router.replace("/menu");
  }

  const lines    = useCartStore((s) => s.lines);
  const { qty, subtotal } = cartTotals(lines);

  return (
    <>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for dishes..."
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-10 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-700"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Sticky category filter bar */}
      <div className="hide-scrollbar sticky top-[56px] z-[40] -mx-4 flex gap-2 overflow-x-auto border-b border-gray-200 bg-white px-4 py-2.5 md:mx-0 md:px-0">
        <FilterChip
          label="All"
          selected={active === "all"}
          onClick={() => setActive("all")}
        />
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            emoji={c.emoji}
            label={c.label}
            selected={active === c.id}
            onClick={() => setActive(c.id)}
          />
        ))}
      </div>

      {/* Category label */}
      {active !== "all" && (
        <div className="mt-6 mb-1">
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-400">
            {categories.find((c) => c.id === active)?.label}
          </h2>
        </div>
      )}

      {/* Item list */}
      <div className="mt-2 rounded-2xl border border-gray-100 bg-white px-4 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {filtered.length === 0 ? (
              <p className="py-16 text-center text-sm text-gray-400">
                {query ? `No dishes match "${query}".` : "Nothing here yet — try another category."}
              </p>
            ) : (
              filtered.map((item) => <DishCard key={item.id} item={item} />)
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating view-cart bar */}
      <AnimatePresence>
        {mounted && qty > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed bottom-[72px] left-4 right-4 z-[600] md:bottom-6 md:left-1/2 md:right-auto md:w-[480px] md:-translate-x-1/2"
          >
            <Link
              href="/cart"
              className="flex items-center justify-between rounded-2xl bg-brand-orange px-5 py-3.5 shadow-[0_8px_28px_rgba(232,93,4,0.45)]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white">
                  <ShoppingBag className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span className="text-[13px] font-bold text-white">
                  {qty} item{qty > 1 ? "s" : ""} · {formatInr(subtotal)}
                </span>
              </div>
              <span className="flex items-center gap-1 text-[13px] font-bold text-white/90">
                View bag <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterChip({
  label,
  emoji,
  selected,
  onClick,
}: {
  label: string;
  emoji?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all",
        selected
          ? "bg-brand-orange text-white shadow-sm"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200",
      )}
    >
      {emoji && <span className="text-sm">{emoji}</span>}
      {label}
    </button>
  );
}
