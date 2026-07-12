"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag, Plus, ToggleLeft, ToggleRight, Trash2,
  AlertCircle, Image as ImageIcon, X
} from "lucide-react";
import { useAdminStore } from "@/stores/admin-store";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  coupon_code: string | null;
  theme_color: string;
  is_active: boolean;
  created_at: string;
};

const THEMES = [
  { id: "orange", name: "Spicy Orange", classes: "from-orange-500 to-rose-500" },
  { id: "blue", name: "Ocean Blue", classes: "from-blue-500 to-cyan-500" },
  { id: "purple", name: "Royal Purple", classes: "from-purple-500 to-indigo-500" },
  { id: "green", name: "Fresh Green", classes: "from-emerald-500 to-teal-500" },
  { id: "dark", name: "Midnight", classes: "from-gray-800 to-gray-900" }
];

export default function AdminBannersPage() {
  const { theme, toggleTheme } = useAdminStore();
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [themeColor, setThemeColor] = useState("orange");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/banners");
    if (res.status === 401) { router.replace("/admin/login"); return; }
    const payload = await res.json();
    if (!res.ok) { setError(payload?.error || "Could not load banners."); return; }
    setBanners(payload.banners);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function toggleActive(b: Banner) {
    setBusyId(b.id);
    await fetch("/api/admin/banners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: b.id, is_active: !b.is_active }),
    });
    setBanners((prev) => prev ? prev.map((x) => x.id === b.id ? { ...x, is_active: !b.is_active } : x) : prev);
    setBusyId(null);
  }

  async function handleDelete(b: Banner) {
    if (!confirm(`Delete banner "${b.title}"?`)) return;
    setBusyId(b.id);
    await fetch(`/api/admin/banners?id=${b.id}`, { method: "DELETE" });
    setBanners((prev) => prev ? prev.filter((x) => x.id !== b.id) : prev);
    setBusyId(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle: subtitle || null,
          coupon_code: couponCode.trim().toUpperCase() || null,
          theme_color: themeColor,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Could not create banner.");
      setBanners((prev) => prev ? [payload.banner, ...prev] : [payload.banner]);
      setTitle(""); setSubtitle(""); setCouponCode(""); setThemeColor("orange");
      setShowCreate(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create banner.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
    <div className="min-h-dvh bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-white pb-20">
      
      {/* ── Create Modal ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm dark:bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-white/10"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                <h2 className="text-[16px] font-black text-gray-900 dark:text-white">Create Banner</h2>
                <button onClick={() => setShowCreate(false)} className="rounded-full bg-gray-200/50 p-1.5 text-gray-500 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-400 dark:hover:bg-white/20 transition-colors">
                  <X className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="p-5 space-y-4">
                <div>
                  <label className="mb-1 block text-[12px] font-extrabold text-gray-700 dark:text-gray-300">Banner Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Free Delivery Weekend!"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] font-bold text-gray-900 focus:border-brand-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-extrabold text-gray-700 dark:text-gray-300">Subtitle (Optional)</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Valid on all orders above ₹200"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] font-medium text-gray-900 focus:border-brand-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-extrabold text-gray-700 dark:text-gray-300">Attach Coupon Code (Optional)</label>
                  <p className="mb-2 text-[10px] text-gray-500">Tapping the banner will apply this coupon code.</p>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME50"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] font-bold uppercase text-gray-900 focus:border-brand-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-extrabold text-gray-700 dark:text-gray-300">Theme Color</label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setThemeColor(t.id)}
                        className={`h-8 w-full rounded-lg bg-gradient-to-r ${t.classes} ${themeColor === t.id ? "ring-2 ring-gray-900 ring-offset-2 dark:ring-white dark:ring-offset-gray-900" : ""}`}
                        title={t.name}
                      />
                    ))}
                  </div>
                </div>

                {createError && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-[12px] font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" /> {createError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={creating}
                  className="mt-4 flex w-full items-center justify-center rounded-xl bg-gray-900 py-3.5 text-[14px] font-extrabold text-white transition-all active:scale-95 disabled:opacity-50 dark:bg-white dark:text-gray-900"
                >
                  {creating ? "Saving..." : "Create Banner"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <AdminPageHeader
        icon={<span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange text-white shadow-md shadow-brand-orange/20"><ImageIcon className="h-4 w-4" strokeWidth={2.5}/></span>}
        title="Banners"
        subtitle="Home page offers"
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        maxWidth="max-w-5xl"
      />

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-black text-gray-900 dark:text-white">Home Page Banners</h1>
            <p className="mt-1 text-[13px] font-medium text-gray-500">Create beautiful offers to showcase on the home screen.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-[13px] font-extrabold text-white shadow-md shadow-gray-900/20 active:scale-95 transition-all dark:bg-white dark:text-gray-900 dark:shadow-white/10"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} /> Create Banner
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {!banners ? (
          <div className="flex items-center justify-center py-20 text-[14px] text-gray-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800 dark:border-white/10 dark:border-t-white" />
            <span className="ml-3">Loading banners…</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center dark:border-white/10 dark:bg-gray-900">
            <ImageIcon className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-700" />
            <p className="text-[14px] font-bold text-gray-900 dark:text-white">No banners created yet</p>
            <p className="mt-1 text-[12px] text-gray-500">Create one to show offers on the home page.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {banners.map((b) => {
              const theme = THEMES.find(t => t.id === b.theme_color) || THEMES[0];
              const isBusy = busyId === b.id;
              
              return (
                <div key={b.id} className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-gray-900">
                  <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl bg-gradient-to-r ${theme.classes}`} />
                  
                  <div className="relative z-10">
                    <div className="mb-4 flex items-center justify-between">
                      <span className={`inline-block h-3 w-10 rounded-full bg-gradient-to-r ${theme.classes}`} />
                      <button
                        onClick={() => toggleActive(b)}
                        disabled={isBusy}
                        className={`transition-colors ${b.is_active ? "text-green-500 hover:text-green-600" : "text-gray-300 hover:text-gray-400 dark:text-gray-600 dark:hover:text-gray-500"}`}
                      >
                        {b.is_active ? <ToggleRight className="h-7 w-7" strokeWidth={1.5} /> : <ToggleLeft className="h-7 w-7" strokeWidth={1.5} />}
                      </button>
                    </div>

                    <h3 className="text-[18px] font-black leading-tight text-gray-900 dark:text-white">{b.title}</h3>
                    {b.subtitle && <p className="mt-1.5 text-[13px] font-medium leading-snug text-gray-500 dark:text-gray-400">{b.subtitle}</p>}
                    
                    {b.coupon_code && (
                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 dark:border-white/5 dark:bg-white/5">
                        <Tag className="h-3 w-3 text-brand-orange" />
                        <span className="text-[11px] font-black tracking-widest text-gray-900 dark:text-white">{b.coupon_code}</span>
                      </div>
                    )}
                  </div>

                  <div className="relative z-10 mt-6 flex items-center justify-end border-t border-gray-50 pt-4 dark:border-white/5">
                    <button
                      onClick={() => handleDelete(b)}
                      disabled={isBusy}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors dark:bg-white/5 dark:text-gray-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
    </div>
  );
}
