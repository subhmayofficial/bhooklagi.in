"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, ShoppingBag, Tag, Users, ChevronDown, ChevronUp,
  Check, X, AlertCircle, LayoutGrid, ToggleLeft, ToggleRight,
  ImageIcon, RefreshCw,
} from "lucide-react";
import { categories } from "@/data/menu";

type AdminMenuItem = {
  id: string;
  name: string;
  emoji: string;
  categoryId: string;
  defaultPrice: number;
  defaultImage: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  hasOverride: boolean;
  updatedAt: string | null;
};

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.id, c.label]),
);

export default function AdminMenuPage() {
  const router = useRouter();
  const [items, setItems] = useState<AdminMenuItem[] | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saveResult, setSaveResult] = useState<Record<string, "ok" | "err">>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { price: string; imageUrl: string }>>({});

  const load = useCallback(async () => {
    setError("");
    const res = await fetch("/api/admin/menu");
    if (res.status === 401) { router.replace("/admin/login"); return; }
    const payload = await res.json();
    if (!res.ok) { setError(payload?.error || "Could not load menu."); return; }
    setItems(payload.items);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  function initDraft(item: AdminMenuItem) {
    setDrafts((prev) => ({
      ...prev,
      [item.id]: {
        price: String(item.price),
        imageUrl: item.imageUrl ?? "",
      },
    }));
  }

  function toggleExpand(item: AdminMenuItem) {
    if (expanded === item.id) {
      setExpanded(null);
    } else {
      setExpanded(item.id);
      initDraft(item);
    }
  }

  async function save(item: AdminMenuItem) {
    const draft = drafts[item.id];
    if (!draft) return;
    const newPrice = parseInt(draft.price, 10);
    if (isNaN(newPrice) || newPrice <= 0) {
      setSaveResult((p) => ({ ...p, [item.id]: "err" }));
      setTimeout(() => setSaveResult((p) => { const n = { ...p }; delete n[item.id]; return n; }), 2000);
      return;
    }
    setSaving((p) => ({ ...p, [item.id]: true }));
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: newPrice,
          imageUrl: draft.imageUrl.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      setSaveResult((p) => ({ ...p, [item.id]: "ok" }));
      setItems((prev) => prev?.map((m) => m.id === item.id
        ? { ...m, price: newPrice, imageUrl: draft.imageUrl.trim() || null, hasOverride: true }
        : m) ?? prev);
      setTimeout(() => {
        setSaveResult((p) => { const n = { ...p }; delete n[item.id]; return n; });
        setExpanded(null);
      }, 1200);
    } catch {
      setSaveResult((p) => ({ ...p, [item.id]: "err" }));
      setTimeout(() => setSaveResult((p) => { const n = { ...p }; delete n[item.id]; return n; }), 2000);
    } finally {
      setSaving((p) => ({ ...p, [item.id]: false }));
    }
  }

  async function toggleAvailability(item: AdminMenuItem) {
    setSaving((p) => ({ ...p, [item.id]: true }));
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev?.map((m) => m.id === item.id
        ? { ...m, isAvailable: !item.isAvailable, hasOverride: true }
        : m) ?? prev);
    } catch {
      setError("Could not update item.");
    } finally {
      setSaving((p) => ({ ...p, [item.id]: false }));
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const grouped = items
    ? categories.reduce<Record<string, AdminMenuItem[]>>((acc, cat) => {
        acc[cat.id] = items.filter((m) => m.categoryId === cat.id);
        return acc;
      }, {})
    : null;

  const unavailableCount = items?.filter((m) => !m.isAvailable).length ?? 0;

  return (
    <div className="min-h-dvh bg-gray-950 text-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange text-base shadow-md shadow-brand-orange/40">🍔</span>
            <div>
              <p className="text-[13px] font-extrabold leading-none text-white">Bhook Lagi Admin</p>
              <p className="text-[10px] text-gray-500">Menu management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <Link href="/admin/orders" className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-gray-400 hover:text-white transition-colors">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Orders</span>
            </Link>
            <Link href="/admin/coupons" className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-gray-400 hover:text-white transition-colors">
              <Tag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Coupons</span>
            </Link>
            <Link href="/admin" className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-gray-400 hover:text-white transition-colors">
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Users</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-red-900/40 bg-red-950/40 px-3 py-2 text-[12px] font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        {/* Stats */}
        {items && (
          <div className="mb-5 grid grid-cols-3 gap-3">
            {[
              { label: "Total items", value: items.length, color: "text-white" },
              { label: "Out of stock", value: unavailableCount, color: unavailableCount > 0 ? "text-red-400" : "text-gray-400" },
              { label: "Overridden", value: items.filter((m) => m.hasOverride).length, color: "text-brand-orange" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/8 bg-white/5 py-4 text-center">
                <p className={`text-[22px] font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-[13px] text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {!items && !error && (
          <div className="flex items-center gap-3 text-[13px] text-gray-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-brand-orange" />
            Loading menu…
          </div>
        )}

        {/* Category sections */}
        {grouped && categories.map((cat) => {
          const catItems = grouped[cat.id] ?? [];
          if (catItems.length === 0) return null;
          return (
            <div key={cat.id} className="mb-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[20px]">{cat.emoji}</span>
                <h2 className="text-[16px] font-extrabold text-white">{cat.label}</h2>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-gray-400">{catItems.length} items</span>
              </div>
              <div className="space-y-2">
                {catItems.map((item) => (
                  <div key={item.id} className={`overflow-hidden rounded-2xl border transition-all ${
                    !item.isAvailable
                      ? "border-red-900/40 bg-red-950/20"
                      : expanded === item.id
                        ? "border-brand-orange/40 bg-white/5"
                        : "border-white/8 bg-white/5 hover:border-white/15"
                  }`}>
                    {/* Item row */}
                    <div className="flex items-center gap-3 p-3">
                      {/* Image */}
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-800">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill sizes="48px" className="object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[22px]">{item.emoji}</span>
                        )}
                        {!item.isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <span className="text-[8px] font-black text-red-400 uppercase">Out</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-[13px] font-bold text-white">{item.name}</p>
                          {item.hasOverride && (
                            <span className="rounded-full bg-brand-orange/20 px-1.5 py-0.5 text-[9px] font-bold text-brand-orange uppercase">Edited</span>
                          )}
                          {!item.isAvailable && (
                            <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400 uppercase">Sold out</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[13px] font-extrabold text-brand-orange">₹{item.price}</p>
                          {item.price !== item.defaultPrice && (
                            <p className="text-[11px] text-gray-500 line-through">₹{item.defaultPrice}</p>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        {/* Availability toggle */}
                        <button
                          type="button"
                          onClick={() => toggleAvailability(item)}
                          disabled={saving[item.id]}
                          title={item.isAvailable ? "Mark sold out" : "Mark available"}
                          className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] font-bold transition-colors hover:border-white/20 disabled:opacity-50"
                        >
                          {item.isAvailable
                            ? <ToggleRight className="h-4 w-4 text-green-400" strokeWidth={2} />
                            : <ToggleLeft className="h-4 w-4 text-gray-500" strokeWidth={2} />
                          }
                          <span className={item.isAvailable ? "text-green-400" : "text-gray-500"}>
                            {item.isAvailable ? "In stock" : "Out"}
                          </span>
                        </button>

                        {/* Edit toggle */}
                        <button
                          type="button"
                          onClick={() => toggleExpand(item)}
                          className={`flex items-center gap-1 rounded-xl border px-2 py-1.5 text-[11px] font-bold transition-colors ${
                            expanded === item.id
                              ? "border-brand-orange/40 bg-brand-orange/10 text-brand-orange"
                              : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
                          }`}
                        >
                          {expanded === item.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* Expanded edit form */}
                    <AnimatePresence initial={false}>
                      {expanded === item.id && drafts[item.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-white/8"
                        >
                          <div className="space-y-3 p-4">
                            {/* Price */}
                            <div>
                              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                                Price (₹)
                              </label>
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] text-gray-500">₹</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={drafts[item.id].price}
                                  onChange={(e) => setDrafts((p) => ({ ...p, [item.id]: { ...p[item.id], price: e.target.value } }))}
                                  className="w-28 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[14px] font-bold text-white focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                />
                                <span className="text-[11px] text-gray-500">Default: ₹{item.defaultPrice}</span>
                              </div>
                            </div>

                            {/* Image URL */}
                            <div>
                              <label className="mb-1 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                                <ImageIcon className="h-3 w-3" /> Image URL
                              </label>
                              <input
                                type="text"
                                value={drafts[item.id].imageUrl}
                                onChange={(e) => setDrafts((p) => ({ ...p, [item.id]: { ...p[item.id], imageUrl: e.target.value } }))}
                                placeholder="https://... or leave empty for default"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] text-white placeholder:text-gray-600 focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                              />
                            </div>

                            {/* Image preview */}
                            {drafts[item.id].imageUrl && (
                              <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10">
                                <Image
                                  src={drafts[item.id].imageUrl}
                                  alt="Preview"
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                  onError={() => {}}
                                />
                              </div>
                            )}

                            {/* Save / Cancel */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => save(item)}
                                disabled={saving[item.id]}
                                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-extrabold transition-all ${
                                  saveResult[item.id] === "ok"
                                    ? "bg-green-500 text-white"
                                    : saveResult[item.id] === "err"
                                      ? "bg-red-500 text-white"
                                      : "bg-brand-orange text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-dark"
                                } disabled:opacity-50`}
                              >
                                {saving[item.id] ? (
                                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : saveResult[item.id] === "ok" ? (
                                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                ) : saveResult[item.id] === "err" ? (
                                  <X className="h-3.5 w-3.5" strokeWidth={3} />
                                ) : null}
                                {saveResult[item.id] === "ok" ? "Saved!" : saveResult[item.id] === "err" ? "Failed" : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setExpanded(null)}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-bold text-gray-400 hover:text-white transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
