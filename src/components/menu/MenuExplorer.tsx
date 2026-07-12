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
  categories, menuItems, type MenuCategoryId, type DietTag, formatInr,
} from "@/data/menu";
import { useCartStore, cartTotals } from "@/stores/cart-store";
import { DishCard } from "@/components/menu/DishCard";
import { ItemDetailSheet } from "@/components/menu/ItemDetailSheet";
import { cn } from "@/lib/utils";

/* ── Category images for the sidebar / pill bar ─────────────────── */
const CAT_IMAGES: Partial<Record<MenuCategoryId, string>> = {
  meals:      "https://b.zmtcdn.com/data/dish_photos/198/fe86ada522be0b3f0ab1aa6eefc24198.jpeg",
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

type MenuOverride = { price?: number; imageUrl?: string; isAvailable: boolean };

type CustomItem = {
  id: string; name: string; description: string; price: number; emoji: string;
  imageUrl: string | null; categoryId: string; diet?: string; spicy?: boolean; bestseller?: boolean; isAvailable: boolean;
};

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
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, MenuOverride>>({});
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pillsRef    = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (catParam && categories.some((c) => c.id === catParam)) setActive(catParam);
  }, [catParam]);
  useEffect(() => setQuery(qParam), [qParam]);
  useEffect(() => {
    fetch("/api/menu-overrides")
      .then((r) => r.json())
      .then((d) => {
        setOverrides(d.overrides ?? {});
        setCustomItems(d.customItems ?? []);
      })
      .catch(() => {});
  }, []);

  /* ── Merge hardcoded + custom items ── */
  const allItems = useMemo<typeof menuItems>(() => {
    const custom: typeof menuItems = customItems.map((ci) => ({
      id: ci.id, name: ci.name, description: ci.description,
      price: ci.price, emoji: ci.emoji,
      image: ci.imageUrl ?? undefined,
      categoryId: ci.categoryId as MenuCategoryId,
      diet: ci.diet as DietTag | undefined,
      spicy: ci.spicy ?? false,
      bestseller: ci.bestseller ?? false,
    }));
    return [...menuItems, ...custom];
  }, [customItems]);

  /* ── Filtered items ── */
  const filtered = useMemo(() => {
    let items = active === "all" ? allItems : allItems.filter((m) => m.categoryId === active);
    if (diet !== "all") items = items.filter((m) => m.diet === diet);
    const q = query.trim().toLowerCase();
    if (q) items = items.filter((m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    return items;
  }, [active, query, diet, allItems]);

  /* ── Grouped by category (for "All" view) ── */
  const grouped = useMemo(() => {
    if (active !== "all" && !query) return null;
    const map: Record<string, typeof allItems> = {};
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

  const bestsellers = allItems.filter((m) => m.bestseller).slice(0, 6);

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
                <p className="text-[10px] text-gray-400">{allItems.length} items</p>
              </div>
            </button>

            {categories.map((c) => {
              const count = allItems.filter((m) => m.categoryId === c.id).length;
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
          className="hide-scrollbar sticky top-[56px] z-40 -mx-4 mb-4 flex gap-1.5 overflow-x-auto border-b border-gray-100 bg-white/95 px-4 py-2 backdrop-blur-md md:hidden"
        >
          {/* All card */}
          <button
            data-cat="all"
            type="button"
            onClick={() => selectCategory("all")}
            className={cn(
              "flex shrink-0 flex-col items-center gap-1 rounded-2xl p-2 min-w-[58px] transition-all",
              active === "all" ? "bg-brand-orange/10" : "hover:bg-gray-50"
            )}
          >
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-[22px]", active === "all" ? "bg-brand-orange/20" : "bg-gray-100")}>🍽️</span>
            <span className={cn("text-[10px] font-bold leading-tight", active === "all" ? "text-brand-orange" : "text-gray-600")}>All</span>
            {active === "all" && <span className="h-1 w-4 rounded-full bg-brand-orange" />}
          </button>
          {categories.map((c) => {
            const img = CAT_IMAGES[c.id];
            return (
              <button
                key={c.id}
                data-cat={c.id}
                type="button"
                onClick={() => selectCategory(c.id)}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-1 rounded-2xl p-2 min-w-[58px] transition-all",
                  active === c.id ? "bg-brand-orange/10" : "hover:bg-gray-50"
                )}
              >
                <div className={cn("relative h-10 w-10 overflow-hidden rounded-xl", active === c.id ? "ring-2 ring-brand-orange" : "")}>
                  {img
                    ? <Image src={img} alt={c.label} fill sizes="40px" className="object-cover" />
                    : <span className="flex h-full w-full items-center justify-center bg-gray-100 text-[22px]">{c.emoji}</span>
                  }
                </div>
                <span className={cn("text-[10px] font-bold leading-tight text-center", active === c.id ? "text-brand-orange" : "text-gray-600")}>
                  {c.label}
                </span>
                {active === c.id && <span className="h-1 w-4 rounded-full bg-brand-orange" />}
              </button>
            );
          })}
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
                      {items.map((item, i) => <DishCardWithOverride key={item.id} item={item} index={i} override={overrides[item.id]} onOpen={() => setOpenItemId(item.id)} />)}
                    </div>
                  </div>
                );
              })
            ) : (
              /* Single category view */
              <div className="rounded-2xl border border-gray-100 bg-white px-4 shadow-sm">
                {filtered.map((item, i) => <DishCardWithOverride key={item.id} item={item} index={i} override={overrides[item.id]} onOpen={() => setOpenItemId(item.id)} />)}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>

      <ItemDetailSheet 
        itemId={openItemId} 
        onClose={() => setOpenItemId(null)} 
      />

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
                  <p className="price-text text-[11px] font-semibold text-white/80">{formatInr(subtotal)}</p>
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

/* ── Dish card wrapper with override support ──────────────────────── */
function DishCardWithOverride({
  item, index, override, onOpen,
}: {
  item: typeof menuItems[number];
  index: number;
  override?: MenuOverride;
  onOpen: () => void;
}) {
  const isAvailable = override?.isAvailable !== false;
  const resolvedItem = override
    ? { ...item, price: override.price ?? item.price, image: override.imageUrl ?? item.image }
    : item;
  return (
    <div className="relative">
      <DishCard item={resolvedItem} index={index} onOpen={isAvailable ? onOpen : undefined} />
      {!isAvailable && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-end pr-4">
          <span className="rounded-full bg-gray-800/90 px-3 py-1 text-[11px] font-extrabold text-white shadow">
            Sold out
          </span>
        </div>
      )}
      {!isAvailable && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-white/60" />
      )}
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
function formatBestsellerName(name: string): string {
  return name.replace(/^Bhook Lagi\s+/i, "");
}

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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <span className="absolute bottom-1.5 left-2 right-2 font-display text-[13px] leading-tight text-white tracking-wide drop-shadow line-clamp-2">
          {formatBestsellerName(item.name)}
        </span>
      </div>
      <div className="flex items-center justify-between px-2.5 py-2">
        <span className="price-text text-[14px] font-black leading-none text-brand-orange">{formatInr(item.price)}</span>
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
