"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut, ShoppingBag, Users, Tag, LayoutGrid, Sun, Moon,
  Save, AlertCircle, CheckCircle2, Settings, Truck, Receipt, Percent
} from "lucide-react";
import { useAdminStore } from "@/stores/admin-store";

type StoreSettings = {
  delivery_charge: number;
  free_delivery_threshold: number;
  tax_percent: number;
  upi_discount_enabled: boolean;
  upi_discount_percent: number;
};

export default function AdminSettingsPage() {
  const { theme, toggleTheme } = useAdminStore();
  const router = useRouter();
  
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [freeThreshold, setFreeThreshold] = useState("");
  const [taxPercent, setTaxPercent] = useState("");
  const [upiEnabled, setUpiEnabled] = useState(false);
  const [upiPercent, setUpiPercent] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.status === 401) { router.replace("/admin/login"); return; }
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Could not load settings.");
      
      const s = payload.settings;
      setSettings(s);
      setDeliveryCharge(s.delivery_charge.toString());
      setFreeThreshold(s.free_delivery_threshold.toString());
      setTaxPercent(s.tax_percent.toString());
      setUpiEnabled(s.upi_discount_enabled);
      setUpiPercent(s.upi_discount_percent.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery_charge: parseInt(deliveryCharge) || 0,
          free_delivery_threshold: parseInt(freeThreshold) || 0,
          tax_percent: parseInt(taxPercent) || 0,
          upi_discount_enabled: upiEnabled,
          upi_discount_percent: parseInt(upiPercent) || 0,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Could not save settings.");
      
      setSettings(payload.settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-dvh bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-white pb-20">
        
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-gray-950/95">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-800 text-base shadow-md shadow-gray-900/40 text-white dark:bg-white/10">⚙️</span>
              <div>
                <p className="text-[13px] font-extrabold leading-none text-gray-900 dark:text-white">Settings</p>
                <p className="text-[10px] text-gray-500">Global store configuration</p>
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={2.5} /> : <Moon className="h-4 w-4" strokeWidth={2.5} />}
              </button>
              <Link href="/admin/orders" className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-semibold text-gray-600 hover:text-gray-900 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white">
                <ShoppingBag className="h-3.5 w-3.5" /><span className="hidden sm:inline">Orders</span>
              </Link>
              <Link href="/admin/menu" className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-semibold text-gray-600 hover:text-gray-900 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white">
                <LayoutGrid className="h-3.5 w-3.5" /><span className="hidden sm:inline">Menu</span>
              </Link>
              <Link href="/admin/coupons" className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-semibold text-gray-600 hover:text-gray-900 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white">
                <Tag className="h-3.5 w-3.5" /><span className="hidden sm:inline">Offers</span>
              </Link>
              <Link href="/admin/banners" className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-semibold text-gray-600 hover:text-gray-900 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-gray-600 text-[8px] text-white">B</span><span className="hidden sm:inline">Banners</span>
              </Link>
              <button type="button" onClick={handleLogout} className="flex shrink-0 items-center gap-1.5 rounded-xl border border-red-900/40 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600 hover:text-red-500 transition-colors dark:bg-red-950/40 dark:text-red-400 dark:hover:text-red-300">
                <LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-8 md:px-6">
          <div className="mb-6">
            <h1 className="text-[20px] font-black text-gray-900 dark:text-white">Store Configurations</h1>
            <p className="mt-1 text-[13px] font-medium text-gray-500">Update pricing rules, tax parameters, and delivery options here.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-[14px] text-gray-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800 dark:border-white/10 dark:border-t-white" />
              <span className="ml-3">Loading settings…</span>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-white/5 dark:bg-gray-950/30">
                  <h2 className="flex items-center gap-2 text-[14px] font-extrabold text-gray-900 dark:text-white">
                    <Receipt className="h-4 w-4 text-brand-orange" />
                    Checkout Settings
                  </h2>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Delivery Charge */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-extrabold text-gray-700 dark:text-gray-300">Standard Delivery Charge (₹)</label>
                    <p className="mb-3 text-[11px] text-gray-500">Fee applied if order is below the free delivery threshold.</p>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Truck className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        min={0}
                        required
                        value={deliveryCharge}
                        onChange={(e) => setDeliveryCharge(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-[14px] font-bold text-gray-900 focus:border-brand-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40 transition-all"
                      />
                    </div>
                  </div>

                  {/* Free Delivery Threshold */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-extrabold text-gray-700 dark:text-gray-300">Free Delivery Threshold (₹)</label>
                    <p className="mb-3 text-[11px] text-gray-500">Minimum subtotal required to get free delivery (set 0 for always free).</p>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <span className="text-[14px] font-extrabold text-gray-400">₹</span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        required
                        value={freeThreshold}
                        onChange={(e) => setFreeThreshold(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-[14px] font-bold text-gray-900 focus:border-brand-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40 transition-all"
                      />
                    </div>
                  </div>

                  <div className="h-px w-full bg-gray-100 dark:bg-white/10" />

                  {/* Tax */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-extrabold text-gray-700 dark:text-gray-300">Tax Percentage (GST %)</label>
                    <p className="mb-3 text-[11px] text-gray-500">Calculated dynamically based on subtotal during checkout.</p>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Percent className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        required
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-[14px] font-bold text-gray-900 focus:border-brand-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-white/5 dark:bg-gray-950/30">
                  <h2 className="flex items-center gap-2 text-[14px] font-extrabold text-gray-900 dark:text-white">
                    <Tag className="h-4 w-4 text-brand-orange" />
                    Dedicated UPI Offers
                  </h2>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Enable UPI Discount */}
                  <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 dark:border-white/5 dark:bg-black/20">
                    <div>
                      <p className="text-[14px] font-extrabold text-gray-900 dark:text-white">Enable UPI Discount</p>
                      <p className="text-[11px] text-gray-500">Allow users to get an extra discount for paying with UPI (stacks with coupons).</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={upiEnabled}
                        onChange={(e) => setUpiEnabled(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700 dark:after:border-gray-600"></div>
                    </label>
                  </div>

                  {/* UPI Discount Percentage */}
                  <div className={`transition-all ${upiEnabled ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
                    <label className="mb-1.5 block text-[13px] font-extrabold text-gray-700 dark:text-gray-300">UPI Discount Percentage (%)</label>
                    <p className="mb-3 text-[11px] text-gray-500">The percentage discount applied to the subtotal when user selects UPI.</p>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Percent className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        required={upiEnabled}
                        value={upiPercent}
                        onChange={(e) => setUpiPercent(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-[14px] font-bold text-gray-900 focus:border-brand-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-xl border border-green-900/40 bg-green-50 px-4 py-3 text-[13px] text-green-600 dark:bg-green-950/40 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Settings saved successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-4 text-[14px] font-extrabold text-white shadow-lg shadow-gray-900/20 disabled:opacity-50 active:scale-95 transition-all dark:bg-white dark:text-gray-900 dark:shadow-white/10 hover:bg-gray-800 dark:hover:bg-gray-100"
              >
                {saving ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black" />
                ) : (
                  <Save className="h-5 w-5" strokeWidth={2.5} />
                )}
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </form>
          )}

        </main>
      </div>
    </div>
  );
}
