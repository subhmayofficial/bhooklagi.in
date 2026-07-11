"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, ShoppingBag, Users, Tag, Plus, ToggleLeft, ToggleRight, Trash2,
  Percent, Banknote, AlertCircle,
} from "lucide-react";

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

  async function load() {
    const res = await fetch("/api/admin/coupons");
    if (res.status === 401) { router.replace("/admin/login"); return; }
    const payload = await res.json();
    if (!res.ok) { setError(payload?.error || "Could not load coupons."); return; }
    setCoupons(payload.coupons);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="min-h-dvh bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange text-base shadow-md shadow-brand-orange/40">🏷️</span>
            <div>
              <p className="text-[13px] font-extrabold leading-none text-white">Coupons</p>
              <p className="text-[10px] text-gray-500">Manage promo codes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/orders" className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-gray-400 hover:text-white transition-colors">
              <ShoppingBag className="h-3.5 w-3.5" /><span className="hidden sm:inline">Orders</span>
            </Link>
            <Link href="/admin" className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-gray-400 hover:text-white transition-colors">
              <Users className="h-3.5 w-3.5" /><span className="hidden sm:inline">Users</span>
            </Link>
            <button type="button" onClick={handleLogout} className="flex items-center gap-1.5 rounded-xl border border-red-900/40 bg-red-950/40 px-3 py-2 text-[12px] font-semibold text-red-400 hover:text-red-300 transition-colors">
              <LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 md:px-6">
        {/* Create button */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[13px] text-gray-400">
            {coupons ? `${coupons.length} coupon${coupons.length !== 1 ? "s" : ""}` : "Loading…"}
          </p>
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-2 rounded-2xl bg-brand-orange px-4 py-2.5 text-[13px] font-extrabold text-white shadow-md shadow-brand-orange/30 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Create coupon
          </button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showCreate && (
            <motion.form
              onSubmit={handleCreate}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="mb-4 text-[14px] font-extrabold text-white">New coupon</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Code *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. UPI5"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] font-mono text-white placeholder:text-gray-600 focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Discount type *</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["flat", "percent"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setDiscountType(t)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[12px] font-bold transition-colors ${
                          discountType === t
                            ? "border-brand-orange/50 bg-brand-orange/10 text-brand-orange"
                            : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        {t === "flat" ? <Banknote className="h-3.5 w-3.5" /> : <Percent className="h-3.5 w-3.5" />}
                        {t === "flat" ? "Flat ₹" : "Percent %"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {discountType === "flat" ? "Amount (₹) *" : "Percent (%) *"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={discountType === "percent" ? 100 : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "flat" ? "80" : "5"}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-white placeholder:text-gray-600 focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Min order (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    placeholder="0 = no minimum"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-white placeholder:text-gray-600 focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Payment required</label>
                  <select
                    value={paymentModeRequired}
                    onChange={(e) => setPaymentModeRequired(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-gray-900 px-3 py-2.5 text-[13px] text-white focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  >
                    <option value="">Any payment</option>
                    <option value="upi">UPI only</option>
                    <option value="cod">COD only</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Max uses</label>
                  <input
                    type="number"
                    min={1}
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Unlimited"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-white placeholder:text-gray-600 focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  />
                </div>
              </div>

              {createError && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-950/40 px-3 py-2 text-[12px] text-red-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {createError}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-white/10 px-4 py-2.5 text-[12px] font-bold text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-[13px] font-extrabold text-white shadow-md shadow-brand-orange/30 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {creating ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Plus className="h-4 w-4" strokeWidth={2.5} />}
                  Create
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-[13px] text-red-400">{error}</div>
        )}

        {!coupons && !error && (
          <div className="flex items-center gap-3 text-[13px] text-gray-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-brand-orange" />
            Loading coupons…
          </div>
        )}

        {coupons && coupons.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <Tag className="h-12 w-12 text-gray-700" strokeWidth={1.2} />
            <p className="mt-4 text-[14px] font-bold text-gray-500">No coupons yet</p>
            <p className="mt-1 text-[12px] text-gray-600">Click &quot;Create coupon&quot; to add your first promo code.</p>
          </div>
        )}

        {/* Coupon cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {(coupons ?? []).map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className={`overflow-hidden rounded-2xl border p-4 ${
                  c.is_active ? "border-white/10 bg-white/5" : "border-white/5 bg-white/[0.02] opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[16px] font-extrabold text-white">{c.code}</span>
                      {!c.is_active && (
                        <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-bold text-gray-500">Inactive</span>
                      )}
                    </div>
                    <p className="mt-1 text-[12px] text-gray-400">
                      <span className={`font-bold ${c.discount_type === "percent" ? "text-green-400" : "text-amber-400"}`}>
                        {formatDiscount(c)} off
                      </span>
                      {c.min_order > 0 && <span> · Min ₹{c.min_order}</span>}
                      {c.payment_mode_required && (
                        <span> · {c.payment_mode_required.toUpperCase()} only</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => toggleActive(c)}
                      title={c.is_active ? "Deactivate" : "Activate"}
                      className="text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
                    >
                      {c.is_active
                        ? <ToggleRight className="h-6 w-6 text-green-400" strokeWidth={1.5} />
                        : <ToggleLeft className="h-6 w-6" strokeWidth={1.5} />
                      }
                    </button>
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => handleDelete(c)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 hover:text-red-400 disabled:opacity-40 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-2.5 text-[11px] text-gray-600">
                  <span>
                    Used: <span className="font-bold text-gray-400">{c.used_count}</span>
                    {c.max_uses !== null && <span className="text-gray-600"> / {c.max_uses}</span>}
                  </span>
                  <span>{new Date(c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
