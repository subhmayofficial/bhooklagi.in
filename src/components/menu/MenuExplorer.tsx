"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, ChevronRight, Search, X, SlidersHorizontal, Flame,
} from "lucide-react";
import {
  categories, menuItems, type MenuCategoryId, formatInr,
} from "@/data/menu";
import { useCartStore, cartTotals } from "@/stores/cart-store";
import { DishCard } from "@/components/menu/DishCard";
import { cn } from "@/lib/utils";

/* ── Category images for the sidebar / pill bar ─────────────────── */
const CAT_IMAGES: Partial<Record<MenuCategoryId, string>> = {
  burgers:    "https://b.zmtcdn.com/data/dish_photos/48b/a59d732bf2d0f51fb4895f46548e548b.png",
  rolls:      "https://b.zmtcdn.com/data/dish_photos/99a/7c1d6342603039279a6bcc5a6cd0b99a.jpeg",
  maggi:      "https://b.zmtcdn.com/data/dish_photos/153/89ab6ec6d2f308395e4693f991c0f153.jpeg",
  fries:      "https://b.zmtcdn.com/data/dish_photos/d9f/1ea36e028d1056244cea461d5f270d9f.png",
  sandwiches: "https://b.zmtcdn.com/data/dish_photos/505/d869d610f6e0cc28b350c3d7859a7505.png",
  drinks:     "https://b.zmtcdn.com/data/dish_photos/5dc/78d0f5c66690dde9ea27d8f83e3e05dc.jpg",
};

/* ── Diet filter options ─────────────────────────────────────────── */
type DietFilter = "all" | "veg" | "non-veg" | "egg";
const DIET_OPTIONS: { value: DietFilter; label: string; color: string }[] = [
  { value: "all",     label: "All",     color: "bg-gray-100 text-gray-700" },
  { value: "veg",     label: "🟢 Veg",  color: "bg-green-50 text-green-700 border border-green-200" },
  { value: "egg",     label: "🟡 Egg",  color: "bg-amber-50 text-amber-700 border border-amber-200" },
  { value: "non-veg", label: "🔴 Non-Veg", color: "bg-red-50 text-red-700 border border-red-200" },
];

export function MenuExplorer() {
  const router       = useRouter();
  const params       = useSearchParams();
  const catParam     = params.get("cat") as MenuCategoryId | null;
  const qParam       = params.get("q") ?? "";

  const validInitial =
    catParam && categories.some((c) => c.id === catParam) ? catParam : "all";

  const [active, setActive]       = useState<MenuCategoryId | "all">(validInitial);
  const [query, setQuery]         = useState(qParam);
  const [diet, setDiet]           = useState<DietFilter>("all");
  const [showFilter, setShowFilter] = useState(false);
  const [mounted, setMounted]     = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pillsRef    = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (catParam && categories.some((c) => c.id === catParam)) setActive(catParam);
  }, [catParam]);
  useEffect(() => setQuery(qParam), [qParam]);

  /* ── Filtered items ── */
  const filtered = useMemo(() => {
    let items = active === "all" ? menuItems : menuItems.filter((m) => m.categoryId === active);
    if (diet !== "all") items = items.filter((m) => m.diet === diet);
    const q = query.trim().toLowerCase();
    if (q) items = items.filter((m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    return items;
  }, [active, query, diet]);

  /* ── Grouped by category (for "All" view) ── */
  const grouped = useMemo(() => {
    if (active !== "all" && !query) return null;
    const map: Record<string, typeof menuItems> = {};
    for (const item of filtered) {
      if (!map[item.categoryId]) map[item.categoryId] = [];
      map[item.categoryId].push(item);
    }
    return map;
  }, [active, query, filtered]);

  /* ── Cart ── */
  const lines           = useCartStore((s) => s.lines);
  const { qty, subtotal } = cartTotals(lines);

  function clearSearch() {
    setQuery("");
    router.replace("/menu");
  }

  function selectCategory(id: MenuCategoryId | "all") {
    setActive(id);
    // scroll the pill into view
    const pill = pillsRef.current?.querySelector(`[data-cat="${id}"]`);
    pill?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    // scroll to section on "all" view
    if (id !== "all" && grouped) {
      setTimeout(() => {
        sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }

  const bestsellers = menuItems.filter((m) => m.bestseller).slice(0, 5);

  return (
    <div className="flex gap-0 md:gap-6">

      {/* ══════════════════════════════════════════
          DESKTOP SIDEBAR — Zomato-style
      ══════════════════════════════════════════ */}
      <aside className="hidden md:block w-[200px] flex-shrink-0">
        <div className="sticky top-[80px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-brand-orange to-brand-gold px-4 py-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/80">Categories</p>
          </div>
          <nav className="divide-y divide-gray-50">
            {/* All */}
            <button
              data-cat="all"
              type="button"
              onClick={() => selectCategory("all")}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                active === "all"
                  ? "bg-brand-orange/8 border-l-[3px] border-brand-orange"
                  : "hover:bg-gray-50 border-l-[3px] border-transparent"
              )}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-[18px] flex-shrink-0">🍽️</span>
              <div className="min-w-0">
                <p className={cn("text-[12px] font-bold leading-tight", active === "all" ? "text-brand-orange" : "text-gray-800")}>
                  All Items
                </p>
                <p className="text-[10px] text-gray-400">{menuItems.length} items</p>
              </div>
            </button>

            {categories.map((c) => {
              const count = menuItems.filter((m) => m.categoryId === c.id).length;
              const img   = CAT_IMAGES[c.id];
              return (
                <button
                  key={c.id}
                  data-cat={c.id}
                  type="button"
                  onClick={() => selectCategory(c.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                    active === c.id
                      ? "bg-brand-orange/8 border-l-[3px] border-brand-orange"
                      : "hover:bg-gray-50 border-l-[3px] border-transparent"
                  )}
                >
                  <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl bg-brand-cream">
                    {img
                      ? <Image src={img} alt={c.label} fill sizes="36px" className="object-cover" />
                      : <span className="flex h-full w-full items-center justify-center text-[18px]">{c.emoji}</span>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-[12px] font-bold leading-tight truncate", active === c.id ? "text-brand-orange" : "text-gray-800")}>
                      {c.label}
                    </p>
                    <p className="text-[10px] text-gray-400">{count} items</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <div className="min-w-0 flex-1">

        {/* ── Search + filter bar ── */}
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={2.5} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes…"
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-[13px] text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-shadow"
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Diet filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilter((v) => !v)}
            className={cn(
              "flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-all",
              showFilter
                ? "border-brand-orange bg-brand-orange text-white"
                : "border-gray-200 bg-white text-gray-500 hover:border-brand-orange/40"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Diet filter chips ── */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                <p className="w-full text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Filter by diet</p>
                {DIET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDiet(opt.value)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all",
                      diet === opt.value
                        ? "ring-2 ring-brand-orange ring-offset-1 " + opt.color
                        : opt.color + " opacity-70"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile horizontal category pills ── */}
        <div
          ref={pillsRef}
          className="hide-scrollbar sticky top-[56px] z-40 -mx-4 mb-4 flex gap-2 overflow-x-auto border-b border-gray-100 bg-white/95 px-4 py-2.5 backdrop-blur-md md:hidden"
        >
          {/* All pill */}
          <button
            data-cat="all"
            type="button"
            onClick={() => selectCategory("all")}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all",
              active === "all"
                ? "bg-brand-orange text-white shadow-sm shadow-brand-orange/30"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            🍽️ All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              data-cat={c.id}
              type="button"
              onClick={() => selectCategory(c.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all",
                active === c.id
                  ? "bg-brand-orange text-white shadow-sm shadow-brand-orange/30"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* ── Bestsellers quick-scroll strip (only on "All" with no search) ── */}
        {active === "all" && !query && (
          <div className="mb-5">
            <div className="mb-2.5 flex items-center gap-2">
              <Flame className="h-4 w-4 text-brand-orange" fill="#E85D04" />
              <h2 className="text-[14px] font-extrabold text-gray-800">Bestsellers</h2>
            </div>
            <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
              {bestsellers.map((item) => (
                <BestsellerPill key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* ── Items ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active + query + diet}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {filtered.length === 0 ? (
              <EmptyState query={query} />
            ) : grouped ? (
              /* Grouped by category view */
              Object.entries(grouped).map(([catId, items]) => {
                const cat = categories.find((c) => c.id === catId)!;
                return (
                  <div
                    key={catId}
                    ref={(el) => { sectionRefs.current[catId] = el; }}
                    className="mb-2"
                  >
                    <CategorySectionHeader cat={cat} count={items.length} />
                    <div className="rounded-2xl border border-gray-100 bg-white px-4 shadow-sm">
                      {items.map((item, i) => <DishCard key={item.id} item={item} index={i} />)}
                    </div>
                  </div>
                );
              })
            ) : (
              /* Single category view */
              <div className="rounded-2xl border border-gray-100 bg-white px-4 shadow-sm">
                {filtered.map((item, i) => <DishCard key={item.id} item={item} index={i} />)}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>

      {/* ══════════════════════════════════════════
          FLOATING CART BAR
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {mounted && qty > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed bottom-[72px] left-4 right-4 z-[600] md:bottom-6 md:left-1/2 md:right-auto md:w-[520px] md:-translate-x-1/2"
          >
            <Link
              href="/cart"
              className="group flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold px-5 py-3.5 shadow-[0_8px_32px_rgba(232,93,4,0.45)]"
            >
              {/* Shimmer sweep */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

              <div className="relative flex items-center gap-3">
                <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                  <ShoppingBag className="h-4 w-4 text-white" strokeWidth={2.5} />
                  {/* pulse ring */}
                  <span className="absolute -inset-1 animate-ping rounded-xl bg-white/20" />
                </span>
                <div>
                  <p className="text-[13px] font-extrabold text-white leading-tight">
                    {qty} item{qty > 1 ? "s" : ""} added
                  </p>
                  <p className="text-[11px] font-semibold text-white/80">{formatInr(subtotal)}</p>
                </div>
              </div>

              <span className="relative flex items-center gap-1 text-[13px] font-extrabold text-white">
                View bag
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={3} />
                </motion.span>
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Category section header ─────────────────────────────────────── */
function CategorySectionHeader({
  cat,
  count,
}: {
  cat: { id: MenuCategoryId; label: string; emoji: string; blurb: string };
  count: number;
}) {
  const img = CAT_IMAGES[cat.id];
  return (
    <div className="mb-3 flex items-center gap-3 pt-2">
      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl shadow-sm">
        {img
          ? <Image src={img} alt={cat.label} fill sizes="44px" className="object-cover" />
          : <div className="flex h-full w-full items-center justify-center bg-brand-cream text-[20px]">{cat.emoji}</div>
        }
      </div>
      <div>
        <h2 className="text-[16px] font-extrabold text-gray-900">{cat.label}</h2>
        <p className="text-[11px] text-gray-400">{cat.blurb} · {count} items</p>
      </div>
      <div className="ml-auto h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
  );
}

/* ── Bestseller pill ─────────────────────────────────────────────── */
function BestsellerPill({ item }: { item: typeof menuItems[number] }) {
  const addItem  = useCartStore((s) => s.addItem);
  const lines    = useCartStore((s) => s.lines);
  const cartLine = lines.find((l) => l.itemId === item.id);
  const qty      = cartLine?.qty ?? 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex w-[140px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
    >
      <div className="relative h-[90px] w-full overflow-hidden bg-brand-cream">
        {item.image
          ? <Image src={item.image} alt={item.name} fill sizes="140px" className="object-cover" />
          : <div className="flex h-full w-full items-center justify-center text-[2.5rem]">{item.emoji}</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className="absolute bottom-1.5 left-2 font-display text-[14px] leading-none text-white tracking-wide drop-shadow">
          {item.name.split(" ").slice(0, 2).join(" ")}
        </span>
      </div>
      <div className="flex items-center justify-between px-2.5 py-2">
        <span className="font-display text-[14px] leading-none text-brand-orange">{formatInr(item.price)}</span>
        <button
          type="button"
          onClick={() => addItem(item)}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-white transition-colors",
            qty > 0 ? "bg-green-500" : "bg-brand-orange"
          )}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={3} />
        </button>
      </div>
    </motion.div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────── */
function EmptyState({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center py-20 text-center"
    >
      <span className="text-[64px]">🍽️</span>
      <p className="mt-4 text-[16px] font-bold text-gray-700">
        {query ? `No results for "${query}"` : "Nothing here yet"}
      </p>
      <p className="mt-1 text-[13px] text-gray-400">
        {query ? "Try a different search term" : "Try another category"}
      </p>
    </motion.div>
  );
}

/* keep Plus locally imported for BestsellerPill */
function Plus({ className, strokeWidth }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
