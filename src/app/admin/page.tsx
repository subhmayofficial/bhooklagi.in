"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Users, ShoppingBag, Phone, Wallet, TrendingUp, Calendar, Tag, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { formatInr } from "@/data/menu";

type AdminUser = {
  id: string;
  phone: string;
  name: string | null;
  walletBalance: number;
  createdAt: string;
  lastLoginAt: string;
  orderCount: number;
  totalSpent: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then(async (res) => {
        if (res.status === 401) { router.replace("/admin/login"); return; }
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Could not load users.");
        setUsers(payload.users);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load users."));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const filtered = users?.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.phone.includes(q) || (u.name ?? "").toLowerCase().includes(q);
  }) ?? [];

  const totalRevenue = users?.reduce((s, u) => s + u.totalSpent, 0) ?? 0;
  const totalOrders  = users?.reduce((s, u) => s + u.orderCount, 0) ?? 0;

  return (
    <div className="min-h-dvh bg-gray-950 text-white">

      {/* ── Top nav ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange text-base shadow-md shadow-brand-orange/40">🍔</span>
            <div>
              <p className="text-[13px] font-extrabold leading-none text-white">Bhook Lagi Admin</p>
              <p className="text-[10px] text-gray-500">User management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-gray-400 transition-colors hover:text-white"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Orders</span>
            </Link>
            <Link
              href="/admin/menu"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-gray-400 transition-colors hover:text-white"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Menu</span>
            </Link>
            <Link
              href="/admin/coupons"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-gray-400 transition-colors hover:text-white"
            >
              <Tag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Coupons</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-red-900/40 bg-red-950/40 px-3 py-2 text-[12px] font-semibold text-red-400 transition-colors hover:text-red-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        {/* Stats */}
        {users && (
          <div className="mb-5 grid grid-cols-3 gap-3">
            {[
              { icon: <Users className="h-5 w-5" />,      label: "Total users",   value: users.length,             color: "text-blue-400" },
              { icon: <ShoppingBag className="h-5 w-5" />, label: "Total orders",  value: totalOrders,              color: "text-brand-orange" },
              { icon: <TrendingUp className="h-5 w-5" />,  label: "Total revenue", value: formatInr(totalRevenue),  color: "text-green-400" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/8 bg-white/5 py-4 text-center">
                <span className={s.color}>{s.icon}</span>
                <p className="mt-1 text-[20px] font-extrabold text-white">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by phone or name…"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white placeholder:text-gray-600 focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-[13px] text-red-400">{error}</div>
        )}
        {!users && !error && (
          <div className="flex items-center gap-3 text-[13px] text-gray-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-brand-orange" />
            Loading users…
          </div>
        )}
        {users && filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <Users className="h-12 w-12 text-gray-700" strokeWidth={1.2} />
            <p className="mt-4 text-[14px] font-bold text-gray-500">No users found</p>
          </div>
        )}

        {/* User cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
              className="overflow-hidden rounded-2xl border border-white/8 bg-white/5 p-4 transition-colors hover:border-white/15"
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-brand-gold text-[15px] font-extrabold text-white shadow-md shadow-brand-orange/20">
                  {(u.name?.[0] ?? u.phone.slice(-2, -1)).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-white">{u.name || "—"}</p>
                  <a
                    href={`tel:+${u.phone}`}
                    className="flex items-center gap-1 text-[11px] font-semibold text-brand-orange"
                  >
                    <Phone className="h-3 w-3" strokeWidth={2.5} />
                    +{u.phone.slice(-10)}
                  </a>
                </div>
              </div>

              {/* Stats grid */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-black/20 px-2 py-2 text-center">
                  <p className="text-[14px] font-extrabold text-white">{u.orderCount}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-gray-500 flex items-center justify-center gap-0.5">
                    <ShoppingBag className="h-2.5 w-2.5" /> Orders
                  </p>
                </div>
                <div className="rounded-xl bg-black/20 px-2 py-2 text-center">
                  <p className="text-[12px] font-extrabold text-green-400">{formatInr(u.totalSpent)}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-gray-500 flex items-center justify-center gap-0.5">
                    <TrendingUp className="h-2.5 w-2.5" /> Spent
                  </p>
                </div>
                <div className="rounded-xl bg-black/20 px-2 py-2 text-center">
                  <p className="text-[12px] font-extrabold text-blue-400">{formatInr(u.walletBalance)}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-gray-500 flex items-center justify-center gap-0.5">
                    <Wallet className="h-2.5 w-2.5" /> Wallet
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-2.5">
                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                  <Calendar className="h-3 w-3" strokeWidth={2} />
                  Joined {formatDate(u.createdAt)}
                </div>
                <div className="text-[10px] text-gray-600">
                  Active {timeAgo(u.lastLoginAt)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
