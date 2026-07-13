"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Calendar,
  Clock3,
  CreditCard,
  IndianRupee,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Star,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAdminStore } from "@/stores/admin-store";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatInr } from "@/data/menu";
import { ORDER_STATUS_META, ORDER_STATUSES, type OrderStatus } from "@/lib/orders";

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

type DashboardStats = {
  range: { from: string; to: string };
  sales: {
    revenue: number;
    orders: number;
    deliveredRevenue: number;
    deliveredOrders: number;
    cancelledOrders: number;
    paidOrders: number;
    guestOrders: number;
    averageOrderValue: number;
    conversionDeliveredPct: number;
    cancellationPct: number;
  };
  users: {
    total: number;
    registeredToday: number;
    activeToday: number;
    registeredInRange: number;
    activeInRange: number;
    repeatCustomersInRange: number;
  };
  statusCounts: Record<OrderStatus, number>;
  paymentModeCounts: Record<string, { orders: number; revenue: number }>;
  dailySales: { date: string; orders: number; revenue: number }[];
  topItems: { name: string; qty: number; revenue: number }[];
  ratings: { food: number | null; delivery: number | null };
  recentOrders: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentMode: string;
    deliveryName: string;
    grandTotal: number;
    createdAt: string;
  }[];
};

const RANGE_PRESETS = [
  { label: "Today", days: 0 },
  { label: "7D", days: 6 },
  { label: "30D", days: 29 },
  { label: "90D", days: 89 },
];

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function presetRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days);
  return { from: localDateKey(from), to: localDateKey(to) };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function shortDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function paymentLabel(value: string) {
  if (value === "cod") return "COD";
  if (value === "online") return "Online";
  if (value === "wallet") return "Wallet";
  return value.toUpperCase();
}

function StatCard({
  icon,
  label,
  value,
  detail,
  tone = "text-brand-orange",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  detail?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.055] p-4 shadow-sm shadow-black/10">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 ${tone}`}>{icon}</div>
        {detail && <p className="text-right text-[11px] font-bold text-gray-500">{detail}</p>}
      </div>
      <p className="mt-4 text-[24px] font-black leading-none text-white">{value}</p>
      <p className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-gray-500">{label}</p>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-black text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[11px] font-medium text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useAdminStore();
  const initialRange = useMemo(() => presetRange(6), []);
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ from, to });
      const [statsRes, usersRes] = await Promise.all([
        fetch(`/api/admin/stats?${query.toString()}`),
        fetch("/api/admin/users"),
      ]);

      if (statsRes.status === 401 || usersRes.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const [statsPayload, usersPayload] = await Promise.all([statsRes.json(), usersRes.json()]);
      if (!statsRes.ok) throw new Error(statsPayload?.error || "Could not load dashboard stats.");
      if (!usersRes.ok) throw new Error(usersPayload?.error || "Could not load users.");

      setStats(statsPayload.stats);
      setUsers(usersPayload.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }, [from, router, to]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const filteredUsers = users?.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.phone.includes(q) || (u.name ?? "").toLowerCase().includes(q);
  }) ?? [];

  const maxDailyRevenue = Math.max(1, ...(stats?.dailySales.map((day) => day.revenue) ?? [1]));
  const paymentEntries = Object.entries(stats?.paymentModeCounts ?? {}).sort((a, b) => b[1].revenue - a[1].revenue);

  return (
    <div className="dark">
      <div className="min-h-dvh bg-gray-950 pb-24 text-white">
        <AdminPageHeader
          icon={<span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange text-base shadow-md shadow-brand-orange/40">🍔</span>}
          title="Bhook Lagi Admin"
          subtitle="Sales, users and live business stats"
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
        >
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            title="Refresh dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-colors hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} strokeWidth={2.5} />
          </button>
        </AdminPageHeader>

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="mb-5 rounded-2xl border border-white/8 bg-white/[0.055] p-3">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex flex-wrap gap-2">
                {RANGE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const range = presetRange(preset.days);
                      setFrom(range.from);
                      setTo(range.to);
                    }}
                    className="rounded-xl border border-white/10 px-4 py-2 text-[12px] font-extrabold text-gray-300 transition-colors hover:border-brand-orange/50 hover:text-white"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full bg-transparent text-[12px] font-bold text-white outline-none [color-scheme:dark]"
                  />
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full bg-transparent text-[12px] font-bold text-white outline-none [color-scheme:dark]"
                  />
                </label>
              </div>
            </div>
          </div>

          {error && <div className="mb-5 rounded-2xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-[13px] text-red-300">{error}</div>}

          {!stats && loading && (
            <div className="flex items-center gap-3 py-10 text-[13px] text-gray-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-brand-orange" />
              Loading dashboard...
            </div>
          )}

          {stats && (
            <div className="space-y-7">
              <section>
                <SectionTitle title="Sales Statistics" subtitle={`${shortDate(stats.range.from)} to ${shortDate(stats.range.to)}`} />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard icon={<IndianRupee className="h-5 w-5" />} label="Total sales" value={formatInr(stats.sales.revenue)} detail={`${stats.sales.orders} orders`} />
                  <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Delivered sales" value={formatInr(stats.sales.deliveredRevenue)} detail={`${stats.sales.conversionDeliveredPct}% delivered`} tone="text-green-400" />
                  <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="Average order" value={formatInr(stats.sales.averageOrderValue)} detail={`${stats.sales.paidOrders} paid`} tone="text-blue-400" />
                  <StatCard icon={<Activity className="h-5 w-5" />} label="Cancelled" value={stats.sales.cancelledOrders} detail={`${stats.sales.cancellationPct}% of orders`} tone="text-red-400" />
                </div>
              </section>

              <section>
                <SectionTitle title="Users" subtitle="Today and selected date range separated" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <StatCard icon={<Users className="h-5 w-5" />} label="Total registered" value={stats.users.total} tone="text-blue-400" />
                  <StatCard icon={<UserPlus className="h-5 w-5" />} label="Registered today" value={stats.users.registeredToday} tone="text-green-400" />
                  <StatCard icon={<UserCheck className="h-5 w-5" />} label="Active today" value={stats.users.activeToday} tone="text-brand-orange" />
                  <StatCard icon={<UserPlus className="h-5 w-5" />} label="Registered in range" value={stats.users.registeredInRange} tone="text-cyan-300" />
                  <StatCard icon={<Activity className="h-5 w-5" />} label="Active in range" value={stats.users.activeInRange} detail={`${stats.users.repeatCustomersInRange} buyers`} tone="text-violet-300" />
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-white/8 bg-white/[0.055] p-4">
                  <SectionTitle title="Daily Sales" />
                  <div className="space-y-3">
                    {stats.dailySales.map((day) => (
                      <div key={day.date} className="grid grid-cols-[74px_1fr_84px] items-center gap-3">
                        <p className="text-[11px] font-bold text-gray-400">{shortDate(day.date)}</p>
                        <div className="h-9 overflow-hidden rounded-xl bg-black/25">
                          <div
                            className="flex h-full min-w-2 items-center justify-end rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold px-2 text-[10px] font-black text-white"
                            style={{ width: `${Math.max(4, (day.revenue / maxDailyRevenue) * 100)}%` }}
                          >
                            {day.orders ? day.orders : ""}
                          </div>
                        </div>
                        <p className="text-right text-[12px] font-black text-white">{formatInr(day.revenue)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.055] p-4">
                  <SectionTitle title="Order Status" />
                  <div className="space-y-2">
                    {ORDER_STATUSES.map((status) => (
                      <div key={status} className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2.5">
                        <span className="text-[12px] font-bold text-gray-300">{ORDER_STATUS_META[status].label}</span>
                        <span className="text-[14px] font-black text-white">{stats.statusCounts[status]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.055] p-4">
                  <SectionTitle title="Payment Mix" />
                  <div className="space-y-2">
                    {paymentEntries.length === 0 && <p className="py-6 text-center text-[12px] text-gray-500">No payments in range</p>}
                    {paymentEntries.map(([mode, data]) => (
                      <div key={mode} className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2.5">
                        <span className="flex items-center gap-2 text-[12px] font-bold text-gray-300"><CreditCard className="h-4 w-4 text-gray-500" />{paymentLabel(mode)}</span>
                        <span className="text-right text-[12px] font-black text-white">{data.orders} · {formatInr(data.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.055] p-4">
                  <SectionTitle title="Top Items" />
                  <div className="space-y-2">
                    {stats.topItems.length === 0 && <p className="py-6 text-center text-[12px] text-gray-500">No item sales in range</p>}
                    {stats.topItems.map((item) => (
                      <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl bg-black/20 px-3 py-2.5">
                        <span className="min-w-0 truncate text-[12px] font-bold text-gray-300">{item.name}</span>
                        <span className="shrink-0 text-[12px] font-black text-white">{item.qty} sold</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.055] p-4">
                  <SectionTitle title="More Data" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-black/20 p-3">
                      <Clock3 className="h-4 w-4 text-gray-500" />
                      <p className="mt-3 text-[18px] font-black text-white">{stats.sales.guestOrders}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Guest orders</p>
                    </div>
                    <div className="rounded-xl bg-black/20 p-3">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <p className="mt-3 text-[18px] font-black text-white">{stats.ratings.food ?? "--"}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Food rating</p>
                    </div>
                    <div className="rounded-xl bg-black/20 p-3">
                      <Star className="h-4 w-4 text-orange-300" />
                      <p className="mt-3 text-[18px] font-black text-white">{stats.ratings.delivery ?? "--"}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Delivery rating</p>
                    </div>
                    <div className="rounded-xl bg-black/20 p-3">
                      <Wallet className="h-4 w-4 text-blue-400" />
                      <p className="mt-3 text-[18px] font-black text-white">{stats.sales.paidOrders}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Paid orders</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-white/8 bg-white/[0.055] p-4">
                  <SectionTitle title="Recent Orders" />
                  <div className="space-y-2">
                    {stats.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between gap-3 rounded-xl bg-black/20 px-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-[12px] font-black text-white">{order.orderNumber}</p>
                          <p className="mt-0.5 truncate text-[11px] text-gray-500">{order.deliveryName} · {ORDER_STATUS_META[order.status]?.label ?? order.status}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] font-black text-white">{formatInr(order.grandTotal)}</p>
                          <p className="text-[10px] font-bold text-gray-500">{timeAgo(order.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.055] p-4">
                  <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <SectionTitle title="Users" subtitle={`${filteredUsers.length} shown`} />
                    <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                      <Search className="h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search phone or name"
                        className="w-full bg-transparent text-[12px] font-semibold text-white outline-none placeholder:text-gray-600 sm:w-56"
                      />
                    </label>
                  </div>

                  {!users && !error && (
                    <div className="flex items-center gap-3 text-[13px] text-gray-500">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-brand-orange" />
                      Loading users...
                    </div>
                  )}

                  <div className="grid max-h-[520px] gap-2 overflow-y-auto pr-1">
                    {filteredUsers.slice(0, 60).map((u, i) => (
                      <motion.div
                        key={u.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.01, duration: 0.18 }}
                        className="grid gap-3 rounded-xl bg-black/20 p-3 sm:grid-cols-[1fr_auto] sm:items-center"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-black text-white">{u.name || "No name"}</p>
                          <a href={`tel:+${u.phone}`} className="mt-1 flex items-center gap-1 text-[11px] font-bold text-brand-orange">
                            <Phone className="h-3 w-3" strokeWidth={2.5} />
                            +{u.phone.slice(-10)}
                          </a>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center sm:w-64">
                          <div>
                            <p className="text-[13px] font-black text-white">{u.orderCount}</p>
                            <p className="text-[9px] font-bold uppercase text-gray-500">Orders</p>
                          </div>
                          <div>
                            <p className="text-[13px] font-black text-green-400">{formatInr(u.totalSpent)}</p>
                            <p className="text-[9px] font-bold uppercase text-gray-500">Spent</p>
                          </div>
                          <div>
                            <p className="text-[13px] font-black text-blue-400">{timeAgo(u.lastLoginAt)}</p>
                            <p className="text-[9px] font-bold uppercase text-gray-500">Active</p>
                          </div>
                        </div>
                        <p className="text-[10px] font-medium text-gray-600 sm:col-span-2">Joined {formatDate(u.createdAt)}</p>
                      </motion.div>
                    ))}
                    {filteredUsers.length === 0 && users && <p className="py-10 text-center text-[12px] font-bold text-gray-500">No users found</p>}
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
