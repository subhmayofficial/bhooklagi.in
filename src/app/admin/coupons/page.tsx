"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, ShoppingBag, Users, Tag, Plus, ToggleLeft, ToggleRight, Trash2,
  Percent, Banknote, AlertCircle, LayoutGrid, Sun, Moon, X, Check, Gift
} from "lucide-react";
import { useAdminStore } from "@/stores/admin-store";

type Freebie = {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  min_order: number;
  is_active: boolean;
  created_at: string;
};

type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "flat";
  discount_value: number;
  min_order: number;
  payment_mode_required: string | null;
  is_active: boolean;
  max_uses: number | null;
  used_count: number;
  created_at: string;
};

function formatDiscount(c: Coupon) {
  return c.discount_type === "percent" ? `${c.discount_value}%` : `₹${c.discount_value}`;
}

export default function AdminCouponsPage() {
  const { theme, toggleTheme } = useAdminStore();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "flat">("flat");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [paymentModeRequired, setPaymentModeRequired] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // ── Freebies state ──
  const [freebies, setFreebies] = useState<Freebie[] | null>(null);
  const [showCreateFreebie, setShowCreateFreebie] = useState(false);
  const [fbName, setFbName] = useState("");
  const [fbDescription, setFbDescription] = useState("");
  const [fbEmoji, setFbEmoji] = useState("🎁");
  const [fbMinOrder, setFbMinOrder] = useState("");
  const [fbCreating, setFbCreating] = useState(false);
  const [fbCreateError, setFbCreateError] = useState("");
  const [fbBusyId, setFbBusyId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/coupons");
    if (res.status === 401) { router.replace("/admin/login"); return; }
    const payload = await res.json();
    if (!res.ok) { setError(payload?.error || "Could not load coupons."); return; }
    setCoupons(payload.coupons);
  }

  async function loadFreebies() {
    const res = await fetch("/api/admin/freebies");
    if (!res.ok) return;
    const payload = await res.json();
    setFreebies(payload.freebies ?? []);
  }

  useEffect(() => { load(); loadFreebies(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleFreebie(f: Freebie) {
    setFbBusyId(f.id);
    await fetch(`/api/admin/freebies/${f.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !f.is_active }),
    });
    setFreebies((prev) => prev ? prev.map((x) => x.id === f.id ? { ...x, is_active: !f.is_active } : x) : prev);
    setFbBusyId(null);
  }

  async function deleteFreebie(f: Freebie) {
    if (!confirm(`Delete freebie "${f.name}"? This cannot be undone.`)) return;
    setFbBusyId(f.id);
    await fetch(`/api/admin/freebies/${f.id}`, { method: "DELETE" });
    setFreebies((prev) => prev ? prev.filter((x) => x.id !== f.id) : prev);
    setFbBusyId(null);
  }

  async function handleCreateFreebie(e: React.FormEvent) {
    e.preventDefault();
    setFbCreateError("");
    setFbCreating(true);
    try {
      const res = await fetch("/api/admin/freebies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fbName.trim(),
          description: fbDescription.trim() || null,
          emoji: fbEmoji.trim() || "🎁",
          minOrder: fbMinOrder ? parseInt(fbMinOrder, 10) : 0,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Could not create freebie.");
      setFreebies((prev) => prev ? [payload.freebie, ...prev] : [payload.freebie]);
      setFbName(""); setFbDescription(""); setFbEmoji("🎁"); setFbMinOrder("");
      setShowCreateFreebie(false);
    } catch (err) {
      setFbCreateError(err instanceof Error ? err.message : "Could not create freebie.");
    } finally {
      setFbCreating(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function toggleActive(c: Coupon) {
    setBusyId(c.id);
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.is_active }),
    });
    setCoupons((prev) => prev ? prev.map((x) => x.id === c.id ? { ...x, is_active: !c.is_active } : x) : prev);
    setBusyId(null);
  }

  async function handleDelete(c: Coupon) {
    if (!confirm(`Delete coupon ${c.code}? This cannot be undone.`)) return;
    setBusyId(c.id);
    await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
    setCoupons((prev) => prev ? prev.filter((x) => x.id !== c.id) : prev);
    setBusyId(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: parseInt(discountValue, 10),
          minOrder: minOrder ? parseInt(minOrder, 10) : 0,
          paymentModeRequired: paymentModeRequired || null,
          maxUses: maxUses ? parseInt(maxUses, 10) : null,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Could not create coupon.");
      setCoupons((prev) => prev ? [payload.coupon, ...prev] : [payload.coupon]);
      setCode(""); setDiscountValue(""); setMinOrder(""); setPaymentModeRequired(""); setMaxUses("");
      setShowCreate(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create coupon.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
    <div className="min-h-dvh bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-white">
      
      {/* ── Advanced Create Coupon Modal ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/10"
            >
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4 dark:border-white/10 dark:bg-gray-950/50">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange/20 text-brand-orange">
                    <Tag className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-[16px] font-extrabold text-gray-900 dark:text-white">Create New Offer</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-900 transition-colors dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6">
                <div className="space-y-6">
                  {/* Section: Basic Details */}
                  <div>
                    <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-brand-orange">Offer Details</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-[12px] font-bold text-gray-600 dark:text-gray-400">Coupon Code</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="e.g. DIWALI50"
                            required
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] font-mono font-bold text-gray-900 placeholder:text-gray-400 focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-black/20 dark:text-white"
                          />
                          {code.length > 2 && <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 h-5 w-5" strokeWidth={3} />}
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[12px] font-bold text-gray-600 dark:text-gray-400">Discount Type</label>
                        <div className="flex gap-2">
                          {(["flat", "percent"] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setDiscountType(t)}
                              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[12px] font-bold transition-all ${
                                discountType === t
                                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange shadow-[0_0_12px_rgba(232,93,4,0.15)]"
                                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:bg-black/20 dark:text-gray-400 dark:hover:bg-white/5"
                              }`}
                            >
                              {t === "flat" ? <Banknote className="h-3.5 w-3.5" /> : <Percent className="h-3.5 w-3.5" />}
                              {t === "flat" ? "Flat ₹" : "Percent %"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[12px] font-bold text-gray-600 dark:text-gray-400">
                          {discountType === "flat" ? "Discount Amount (₹)" : "Discount Percent (%)"}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={discountType === "percent" ? 100 : undefined}
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          placeholder={discountType === "flat" ? "100" : "15"}
                          required
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-black/20 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-gray-100 dark:bg-white/10" />

                  {/* Section: Restrictions */}
                  <div>
                    <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-brand-orange">Usage Rules</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-[12px] font-bold text-gray-600 dark:text-gray-400">Min Order Value (₹)</label>
                        <input
                          type="number"
                          min={0}
                          value={minOrder}
                          onChange={(e) => setMinOrder(e.target.value)}
                          placeholder="0 = no minimum"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-black/20 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[12px] font-bold text-gray-600 dark:text-gray-400">Max Total Uses</label>
                        <input
                          type="number"
                          min={1}
                          value={maxUses}
                          onChange={(e) => setMaxUses(e.target.value)}
                          placeholder="Leave blank for unlimited"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-black/20 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-[12px] font-bold text-gray-600 dark:text-gray-400">Payment Restriction</label>
                        <select
                          value={paymentModeRequired}
                          onChange={(e) => setPaymentModeRequired(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-900 focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                        >
                          <option value="">No restriction (Any payment)</option>
                          <option value="upi">Online Only (UPI/Card)</option>
                          <option value="cod">Cash on Delivery Only</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {createError && (
                  <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {createError}
                  </div>
                )}

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[14px] font-bold text-gray-600 hover:bg-gray-50 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold px-4 py-3.5 text-[14px] font-extrabold text-white shadow-lg shadow-brand-orange/30 disabled:opacity-50 active:scale-95 transition-all"
                  >
                    {creating ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Plus className="h-5 w-5" strokeWidth={2.5} />}
                    Create Offer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-gray-950/95">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange text-base shadow-md shadow-brand-orange/40">🏷️</span>
            <div>
              <p className="text-[13px] font-extrabold leading-none text-gray-900 dark:text-white">Coupons</p>
              <p className="text-[10px] text-gray-500">Manage promo codes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/settings" className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-semibold text-gray-600 hover:text-gray-900 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white">
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={2.5} /> : <Moon className="h-4 w-4" strokeWidth={2.5} />}
            </button>
            <Link href="/admin/orders" className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-semibold text-gray-600 hover:text-gray-900 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white">
              <ShoppingBag className="h-3.5 w-3.5" /><span className="hidden sm:inline">Orders</span>
            </Link>
            <Link href="/admin/menu" className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-semibold text-gray-600 hover:text-gray-900 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white">
              <LayoutGrid className="h-3.5 w-3.5" /><span className="hidden sm:inline">Menu</span>
            </Link>
            <Link href="/admin" className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-semibold text-gray-600 hover:text-gray-900 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white">
              <Users className="h-3.5 w-3.5" /><span className="hidden sm:inline">Users</span>
            </Link>
            <button type="button" onClick={handleLogout} className="flex items-center gap-1.5 rounded-xl border border-red-900/40 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600 hover:text-red-500 transition-colors dark:bg-red-950/40 dark:text-red-400 dark:hover:text-red-300">
              <LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[14px] font-semibold text-gray-600 dark:text-gray-400">
            {coupons ? `${coupons.length} coupon${coupons.length !== 1 ? "s" : ""} available` : "Loading…"}
          </p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-2xl bg-brand-orange px-5 py-2.5 text-[14px] font-extrabold text-white shadow-md shadow-brand-orange/30 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Create Offer
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-900/40 bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:bg-red-950/40 dark:text-red-400">{error}</div>
        )}

        {!coupons && !error && (
          <div className="flex items-center justify-center gap-3 py-20 text-[14px] text-gray-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-brand-orange dark:border-white/10" />
            Loading coupons…
          </div>
        )}

        {coupons && coupons.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-100 dark:bg-white/5">
              <Tag className="h-8 w-8 text-gray-400 dark:text-gray-600" strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-[16px] font-bold text-gray-900 dark:text-gray-300">No coupons yet</p>
            <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-500">Create your first offer to boost sales!</p>
          </div>
        )}

        {/* Coupon cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {(coupons ?? []).map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`overflow-hidden rounded-2xl border p-5 shadow-sm ${
                  c.is_active 
                    ? "border-gray-200 bg-white dark:border-white/10 dark:bg-white/5" 
                    : "border-gray-100 bg-gray-50 opacity-60 dark:border-white/5 dark:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-[16px] font-extrabold text-gray-900 dark:bg-black/40 dark:text-white">{c.code}</span>
                      {!c.is_active && (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">Paused</span>
                      )}
                    </div>
                    <p className="mt-2 text-[13px] text-gray-600 dark:text-gray-400">
                      <span className={`font-extrabold ${c.discount_type === "percent" ? "text-green-600 dark:text-green-400" : "text-brand-orange"}`}>
                        {formatDiscount(c)} OFF
                      </span>
                      {c.min_order > 0 && <span> · Min ₹{c.min_order}</span>}
                    </p>
                    {c.payment_mode_required && (
                      <p className="mt-1 text-[11px] font-semibold text-gray-500">
                        * {c.payment_mode_required === "upi" ? "Online payments" : "Cash on delivery"} only
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 bg-gray-50 p-1 rounded-xl border border-gray-100 dark:bg-black/20 dark:border-white/5">
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => toggleActive(c)}
                      title={c.is_active ? "Deactivate" : "Activate"}
                      className="p-1.5 text-gray-400 hover:text-gray-900 disabled:opacity-40 transition-colors dark:hover:text-white"
                    >
                      {c.is_active
                        ? <ToggleRight className="h-5 w-5 text-green-500" strokeWidth={2} />
                        : <ToggleLeft className="h-5 w-5" strokeWidth={2} />
                      }
                    </button>
                    <div className="w-px h-4 bg-gray-200 dark:bg-white/10" />
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => handleDelete(c)}
                      className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[12px] text-gray-500 dark:border-white/10 dark:text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange/10 text-[10px] font-bold text-brand-orange">
                      {c.used_count}
                    </span>
                    Used {c.max_uses !== null ? `/ ${c.max_uses}` : ""}
                  </span>
                  <span>Created {new Date(c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {/* ══════════ FREEBIES SECTION ══════════ */}
        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-500" strokeWidth={2.5} />
              <h2 className="text-[18px] font-extrabold text-gray-900 dark:text-white">Freebies</h2>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-extrabold text-green-700 dark:bg-green-950/50 dark:text-green-400">
                Auto-applied at cart
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateFreebie(true)}
              className="flex items-center gap-2 rounded-2xl bg-green-600 px-5 py-2.5 text-[14px] font-extrabold text-white shadow-md shadow-green-600/30 transition-all active:scale-95 hover:bg-green-700"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Add Freebie
            </button>
          </div>

          <p className="mb-5 text-[13px] text-gray-500 dark:text-gray-400">
            When a customer&rsquo;s cart subtotal meets the threshold, this free item is shown automatically at checkout. It&rsquo;s recorded in the order notes.
          </p>

          {/* Create Freebie Modal */}
          <AnimatePresence>
            {showCreateFreebie && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
              >
                <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
                  className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/10"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4 dark:border-white/10 dark:bg-gray-950/50">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/50">
                        <Gift className="h-4 w-4" strokeWidth={2.5} />
                      </div>
                      <h2 className="text-[16px] font-extrabold text-gray-900 dark:text-white">Add Freebie</h2>
                    </div>
                    <button type="button" onClick={() => setShowCreateFreebie(false)}
                      className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-900 transition-colors dark:hover:bg-white/10 dark:hover:text-white">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateFreebie} className="p-6 space-y-4">
                    <div className="flex gap-3">
                      <div className="w-20">
                        <label className="mb-1.5 block text-[12px] font-bold text-gray-600 dark:text-gray-400">Emoji</label>
                        <input type="text" value={fbEmoji} onChange={(e) => setFbEmoji(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-center text-[20px] focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-white/10 dark:bg-black/20 dark:text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1.5 block text-[12px] font-bold text-gray-600 dark:text-gray-400">Free Item Name *</label>
                        <input type="text" value={fbName} onChange={(e) => setFbName(e.target.value)}
                          placeholder="e.g. Classic Fries" required
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] font-bold text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-white/10 dark:bg-black/20 dark:text-white" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[12px] font-bold text-gray-600 dark:text-gray-400">Description (optional)</label>
                      <input type="text" value={fbDescription} onChange={(e) => setFbDescription(e.target.value)}
                        placeholder="e.g. Hot & crispy fries on us!"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-white/10 dark:bg-black/20 dark:text-white" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[12px] font-bold text-gray-600 dark:text-gray-400">Min Order Threshold (₹) *</label>
                      <p className="mb-2 text-[11px] text-gray-500">Customer cart subtotal must be at or above this to unlock the freebie.</p>
                      <input type="number" min={0} value={fbMinOrder} onChange={(e) => setFbMinOrder(e.target.value)}
                        placeholder="e.g. 299" required
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] font-bold text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-white/10 dark:bg-black/20 dark:text-white" />
                    </div>

                    {fbCreateError && (
                      <div className="flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:bg-red-950/40 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />{fbCreateError}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setShowCreateFreebie(false)}
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] font-bold text-gray-600 hover:bg-gray-50 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                        Cancel
                      </button>
                      <button type="submit" disabled={fbCreating}
                        className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-green-600/30 disabled:opacity-50 active:scale-95 transition-all hover:bg-green-700">
                        {fbCreating ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Gift className="h-5 w-5" strokeWidth={2.5} />}
                        Add Freebie
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Freebies list */}
          {freebies && freebies.length === 0 && (
            <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-gray-200 py-12 text-center dark:border-white/10">
              <Gift className="h-10 w-10 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
              <p className="mt-3 text-[15px] font-bold text-gray-700 dark:text-gray-300">No freebies yet</p>
              <p className="mt-1 text-[12px] text-gray-500">Add one to delight customers who hit your order threshold!</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence initial={false}>
              {(freebies ?? []).map((f) => (
                <motion.div key={f.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
                  className={`overflow-hidden rounded-2xl border p-5 shadow-sm ${
                    f.is_active
                      ? "border-green-200 bg-green-50/50 dark:border-green-900/40 dark:bg-green-950/10"
                      : "border-gray-100 bg-gray-50 opacity-60 dark:border-white/5 dark:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm dark:bg-black/20">{f.emoji}</span>
                      <div>
                        <p className="text-[15px] font-extrabold text-gray-900 dark:text-white">{f.name}</p>
                        {f.description && <p className="mt-0.5 text-[12px] text-gray-500 dark:text-gray-400">{f.description}</p>}
                        <p className="mt-1.5 text-[12px] font-bold text-green-700 dark:text-green-400">
                          🎯 Unlocks at ₹{f.min_order}+
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-xl border border-gray-100 bg-white p-1 dark:border-white/5 dark:bg-black/20">
                      <button type="button" disabled={fbBusyId === f.id} onClick={() => toggleFreebie(f)}
                        className="p-1.5 text-gray-400 hover:text-gray-900 disabled:opacity-40 transition-colors dark:hover:text-white">
                        {f.is_active
                          ? <ToggleRight className="h-5 w-5 text-green-500" strokeWidth={2} />
                          : <ToggleLeft className="h-5 w-5" strokeWidth={2} />}
                      </button>
                      <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
                      <button type="button" disabled={fbBusyId === f.id} onClick={() => deleteFreebie(f)}
                        className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors dark:hover:text-red-400">
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </main>
    </div>
    </div>
  );
}
