"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, Check, X, AlertCircle, ToggleLeft, ToggleRight,
  ImageIcon, RefreshCw, Plus, Trash2,
} from "lucide-react";
import { categories } from "@/data/menu";
import { useAdminStore } from "@/stores/admin-store";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

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
  isCustom: boolean;
  description?: string;
  diet?: string | null;
  spicy?: boolean;
  bestseller?: boolean;
};


const DIET_OPTIONS = [
  { value: "", label: "None" },
  { value: "veg", label: "Veg" },
  { value: "egg", label: "Egg" },
  { value: "non-veg", label: "Non-Veg" },
];

const EMPTY_FORM = {
  name: "", description: "", price: "", emoji: "🍽️",
  imageUrl: "", categoryId: "burgers", diet: "", spicy: false, bestseller: false,
};

export default function AdminMenuPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useAdminStore();
  const [items, setItems] = useState<AdminMenuItem[] | null>(null);
  const [customItems, setCustomItems] = useState<AdminMenuItem[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saveResult, setSaveResult] = useState<Record<string, "ok" | "err">>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { name: string; price: string; imageUrl: string }>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const res = await fetch("/api/admin/menu");
    if (res.status === 401) { router.replace("/admin/login"); return; }
    const payload = await res.json();
    if (!res.ok) { setError(payload?.error || "Could not load menu."); return; }
    setItems(payload.items);
    setCustomItems(payload.customItems ?? []);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  function initDraft(item: AdminMenuItem) {
    setDrafts((prev) => ({ ...prev, [item.id]: { name: item.name, price: String(item.price), imageUrl: item.imageUrl ?? "" } }));
  }

  function toggleExpand(item: AdminMenuItem) {
    if (expanded === item.id) { setExpanded(null); } else { setExpanded(item.id); initDraft(item); }
  }

  async function save(item: AdminMenuItem) {
    const draft = drafts?.[item.id];
    if (!draft) return;
    const newPrice = parseInt(draft.price, 10);
    if (isNaN(newPrice) || newPrice <= 0) { flash(item.id, "err"); return; }
    const newName = draft.name.trim();
    if (!newName) { flash(item.id, "err"); return; }
    setSaving((p) => ({ ...p, [item.id]: true }));
    try {
      const endpoint = item.isCustom
        ? `/api/admin/menu/custom/${item.id}`
        : `/api/admin/menu/${item.id}`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, price: newPrice, imageUrl: draft.imageUrl.trim() || null }),
      });
      if (!res.ok) throw new Error();
      flash(item.id, "ok");
      updateItem(item.id, { name: newName, price: newPrice, imageUrl: draft.imageUrl.trim() || null, hasOverride: true });
      setTimeout(() => setExpanded(null), 1200);
    } catch {
      flash(item.id, "err");
    } finally {
      setSaving((p) => ({ ...p, [item.id]: false }));
    }
  }

  async function toggleAvailability(item: AdminMenuItem) {
    setSaving((p) => ({ ...p, [item.id]: true }));
    try {
      const endpoint = item.isCustom
        ? `/api/admin/menu/custom/${item.id}`
        : `/api/admin/menu/${item.id}`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      if (!res.ok) throw new Error();
      updateItem(item.id, { isAvailable: !item.isAvailable, hasOverride: true });
    } catch {
      setError("Could not update item.");
    } finally {
      setSaving((p) => ({ ...p, [item.id]: false }));
    }
  }

  async function deleteCustomItem(item: AdminMenuItem) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setSaving((p) => ({ ...p, [item.id]: true }));
    try {
      const res = await fetch(`/api/admin/menu/custom/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCustomItems((prev) => prev.filter((m) => m.id !== item.id));
    } catch {
      setError("Could not delete item.");
    } finally {
      setSaving((p) => ({ ...p, [item.id]: false }));
    }
  }

  function updateItem(id: string, patch: Partial<AdminMenuItem>) {
    setItems((prev) => prev?.map((m) => m.id === id ? { ...m, ...patch } : m) ?? prev);
    setCustomItems((prev) => prev.map((m) => m.id === id ? { ...m, ...patch } : m));
  }

  function flash(id: string, result: "ok" | "err") {
    setSaveResult((p) => ({ ...p, [id]: result }));
    setTimeout(() => setSaveResult((p) => { const n = { ...p }; delete n[id]; return n; }), 2000);
  }

  async function handleAddItem() {
    setAddError("");
    const name = addForm.name.trim();
    const price = parseInt(addForm.price, 10);
    if (!name) { setAddError("Name is required."); return; }
    if (isNaN(price) || price <= 0) { setAddError("Enter a valid price."); return; }
    if (!addForm.categoryId) { setAddError("Select a category."); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/menu/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, description: addForm.description.trim(), price,
          emoji: addForm.emoji.trim() || "🍽️",
          imageUrl: addForm.imageUrl.trim() || null,
          categoryId: addForm.categoryId,
          diet: addForm.diet || null,
          spicy: addForm.spicy,
          bestseller: addForm.bestseller,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setAddError(payload?.error || "Could not create item.");
        return;
      }
      setAddForm(EMPTY_FORM);
      setShowAddForm(false);
      await load();
    } catch {
      setAddError("Could not create item.");
    } finally {
      setAdding(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const allItems = [...(items ?? []), ...customItems];
  const grouped = items
    ? categories.reduce<Record<string, AdminMenuItem[]>>((acc, cat) => {
        const hardcoded = items.filter((m) => m.categoryId === cat.id);
        const custom = customItems.filter((m) => m.categoryId === cat.id);
        acc[cat.id] = [...hardcoded, ...custom];
        return acc;
      }, {})
    : null;

  const unavailableCount = allItems.filter((m) => !m.isAvailable).length;

  return (
    <div className="dark">
    <div className="min-h-dvh bg-gray-950 text-white pb-20">

      <AdminPageHeader
        icon={<span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange text-base shadow-md shadow-brand-orange/40">🍔</span>}
        title="Bhook Lagi Admin"
        subtitle="Menu management"
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        maxWidth="max-w-5xl"
      >
        <button type="button" onClick={load} className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white">
          <RefreshCw className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </AdminPageHeader>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        {/* Stats */}
        {items && (
          <div className="mb-5 grid grid-cols-4 gap-3">
            {[
              { label: "Total items", value: allItems.length, color: "text-white" },
              { label: "Out of stock", value: unavailableCount, color: unavailableCount > 0 ? "text-red-400" : "text-gray-400" },
              { label: "Custom items", value: customItems.length, color: "text-blue-400" },
              { label: "Overridden", value: allItems.filter((m) => m.hasOverride).length, color: "text-brand-orange" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/8 bg-white/5 py-4 text-center">
                <p className={`text-[20px] font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add New Item Button */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => { setShowAddForm((v) => !v); setAddError(""); setAddForm(EMPTY_FORM); }}
            className="flex items-center gap-2 rounded-2xl border border-brand-orange/40 bg-brand-orange/10 px-4 py-3 text-[13px] font-extrabold text-brand-orange transition-all hover:bg-brand-orange/15"
          >
            <Plus className="h-4 w-4" strokeWidth={3} />
            {showAddForm ? "Cancel" : "Add New Item"}
          </button>

          {/* Add form */}
          <AnimatePresence initial={false}>
            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-2xl border border-brand-orange/20 bg-white/5 p-5 space-y-4">
                  <p className="text-[14px] font-extrabold text-white">New menu item</p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Name */}
                    <div className="sm:col-span-2">
                      <label className="field-label">Item name *</label>
                      <input
                        type="text"
                        value={addForm.name}
                        onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Double Cheese Burger"
                        className="admin-input"
                      />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label className="field-label">Description</label>
                      <textarea
                        rows={2}
                        value={addForm.description}
                        onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Short description shown on menu"
                        className="admin-input resize-none"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="field-label">Price (₹) *</label>
                      <input
                        type="number"
                        min={1}
                        value={addForm.price}
                        onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                        placeholder="199"
                        className="admin-input"
                      />
                    </div>

                    {/* Emoji */}
                    <div>
                      <label className="field-label">Emoji</label>
                      <input
                        type="text"
                        value={addForm.emoji}
                        onChange={(e) => setAddForm((f) => ({ ...f, emoji: e.target.value }))}
                        placeholder="🍔"
                        className="admin-input"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="field-label">Category *</label>
                      <select
                        value={addForm.categoryId}
                        onChange={(e) => setAddForm((f) => ({ ...f, categoryId: e.target.value }))}
                        className="admin-input"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Diet */}
                    <div>
                      <label className="field-label">Diet type</label>
                      <select
                        value={addForm.diet}
                        onChange={(e) => setAddForm((f) => ({ ...f, diet: e.target.value }))}
                        className="admin-input"
                      >
                        {DIET_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Image URL */}
                    <div className="sm:col-span-2">
                      <label className="field-label">Image URL (optional — add later from admin)</label>
                      <input
                        type="text"
                        value={addForm.imageUrl}
                        onChange={(e) => setAddForm((f) => ({ ...f, imageUrl: e.target.value }))}
                        placeholder="https://..."
                        className="admin-input"
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="flex items-center gap-4">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={addForm.spicy}
                          onChange={(e) => setAddForm((f) => ({ ...f, spicy: e.target.checked }))}
                          className="accent-brand-orange"
                        />
                        <span className="text-[12px] font-semibold text-gray-400">🌶️ Spicy</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={addForm.bestseller}
                          onChange={(e) => setAddForm((f) => ({ ...f, bestseller: e.target.checked }))}
                          className="accent-brand-orange"
                        />
                        <span className="text-[12px] font-semibold text-gray-400">⭐ Bestseller</span>
                      </label>
                    </div>
                  </div>

                  {addError && (
                    <p className="flex items-center gap-1.5 text-[12px] font-semibold text-red-400">
                      <AlertCircle className="h-3.5 w-3.5" /> {addError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={adding}
                    className="flex items-center gap-2 rounded-2xl bg-brand-orange px-5 py-2.5 text-[13px] font-extrabold text-white shadow-md shadow-brand-orange/30 disabled:opacity-50"
                  >
                    {adding ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Plus className="h-4 w-4" />}
                    {adding ? "Adding…" : "Add to menu"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-[13px] text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
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
                  <ItemRow
                    key={item.id}
                    item={item}
                    expanded={expanded === item.id}
                    draft={drafts[item.id]}
                    saving={saving[item.id] ?? false}
                    saveResult={saveResult[item.id]}
                    onToggleExpand={() => toggleExpand(item)}
                    onToggleAvail={() => toggleAvailability(item)}
                    onDraftChange={(patch) => setDrafts((p) => ({ ...p, [item.id]: { ...p[item.id], ...patch } }))}
                    onSave={() => save(item)}
                    onCancel={() => setExpanded(null)}
                    onDelete={item.isCustom ? () => deleteCustomItem(item) : undefined}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </main>

      {/* Inline styles for admin form fields */}
      <style jsx global>{`
        .field-label { display: block; margin-bottom: 4px; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: rgb(107 114 128); }
        .admin-input { width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); padding: 8px 12px; font-size: 13px; color: white; }
        .admin-input:focus { border-color: rgba(232,93,4,0.5); outline: none; box-shadow: 0 0 0 2px rgba(232,93,4,0.2); }
        .admin-input option { background: #111; color: white; }
      `}</style>
    </div>
    </div>
  );
}

function ItemRow({
  item, expanded, draft, saving, saveResult,
  onToggleExpand, onToggleAvail, onDraftChange, onSave, onCancel, onDelete,
}: {
  item: AdminMenuItem;
  expanded: boolean;
  draft?: { name: string; price: string; imageUrl: string };
  saving: boolean;
  saveResult?: "ok" | "err";
  onToggleExpand: () => void;
  onToggleAvail: () => void;
  onDraftChange: (patch: { name?: string; price?: string; imageUrl?: string }) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border transition-all ${
      !item.isAvailable ? "border-red-900/40 bg-red-950/20"
        : expanded ? "border-brand-orange/40 bg-white/5"
        : "border-white/8 bg-white/5 hover:border-white/15"
    }`}>
      <div className="flex items-center gap-3 p-3">
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

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-[13px] font-bold text-white">{item.name}</p>
            {item.isCustom && <span className="rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-400 uppercase">Custom</span>}
            {item.hasOverride && !item.isCustom && <span className="rounded-full bg-brand-orange/20 px-1.5 py-0.5 text-[9px] font-bold text-brand-orange uppercase">Edited</span>}
            {!item.isAvailable && <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400 uppercase">Sold out</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[13px] font-extrabold text-brand-orange">₹{item.price}</p>
            {item.price !== item.defaultPrice && (
              <p className="text-[11px] text-gray-500 line-through">₹{item.defaultPrice}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onToggleAvail} disabled={saving} title={item.isAvailable ? "Mark sold out" : "Mark available"} className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] font-bold transition-colors hover:border-white/20 disabled:opacity-50">
            {item.isAvailable ? <ToggleRight className="h-4 w-4 text-green-400" strokeWidth={2} /> : <ToggleLeft className="h-4 w-4 text-gray-500" strokeWidth={2} />}
            <span className={item.isAvailable ? "text-green-400" : "text-gray-500"}>{item.isAvailable ? "In stock" : "Out"}</span>
          </button>
          {onDelete && (
            <button type="button" onClick={onDelete} disabled={saving} title="Delete item" className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-900/40 bg-red-950/30 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button type="button" onClick={onToggleExpand} className={`flex items-center gap-1 rounded-xl border px-2 py-1.5 text-[11px] font-bold transition-colors ${expanded ? "border-brand-orange/40 bg-brand-orange/10 text-brand-orange" : "border-white/10 bg-white/5 text-gray-400 hover:text-white"}`}>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Edit
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && draft && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/8"
          >
            <div className="space-y-3 p-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-widest text-gray-500">Item Name</label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => onDraftChange({ name: e.target.value })}
                  placeholder="Item name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[13px] font-bold text-white placeholder:text-gray-600 focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-widest text-gray-500">Price (₹)</label>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] text-gray-500">₹</span>
                  <input type="number" min={1} value={draft.price} onChange={(e) => onDraftChange({ price: e.target.value })} className="w-28 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[14px] font-bold text-white focus:border-brand-orange/50 focus:outline-none" />
                  <span className="text-[11px] text-gray-500">Default: ₹{item.defaultPrice}</span>
                </div>
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                  <ImageIcon className="h-3 w-3" /> Image URL
                </label>
                <input type="text" value={draft.imageUrl} onChange={(e) => onDraftChange({ imageUrl: e.target.value })} placeholder="https://... or leave empty" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] text-white placeholder:text-gray-600 focus:border-brand-orange/50 focus:outline-none" />
              </div>
              {draft.imageUrl && (
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10">
                  <Image src={draft.imageUrl} alt="Preview" fill sizes="80px" className="object-cover" onError={() => {}} />
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <button type="button" onClick={onSave} disabled={saving} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-extrabold transition-all disabled:opacity-50 ${saveResult === "ok" ? "bg-green-500 text-white" : saveResult === "err" ? "bg-red-500 text-white" : "bg-brand-orange text-white shadow-md shadow-brand-orange/30"}`}>
                  {saving ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : saveResult === "ok" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : saveResult === "err" ? <X className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                  {saveResult === "ok" ? "Saved!" : saveResult === "err" ? "Failed" : "Save"}
                </button>
                <button type="button" onClick={onCancel} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
