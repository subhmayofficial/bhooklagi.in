"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, Send, CheckCircle2, AlertCircle, Users, User, Smartphone,
  ChevronLeft, X, Search,
} from "lucide-react";
import { useAdminStore } from "@/stores/admin-store";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

type PushSubscriber = {
  id: string;
  endpoint: string;
  customerId: string | null;
  name: string | null;
  phone: string | null;
  createdAt: string;
};

type KitchenSub = {
  id: string;
  phone: string;
  name: string | null;
  created_at: string;
};

type AdminPushUser = {
  id: string;
  name: string | null;
  phone: string;
  createdAt: string;
  deviceCount: number;
  latestSubscriptionAt: string | null;
};

type TargetType = "all" | "user";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminSubscribersPage() {
  const { theme, toggleTheme } = useAdminStore();
  const router = useRouter();

  const [pushSubs, setPushSubs] = useState<PushSubscriber[]>([]);
  const [pushUsers, setPushUsers] = useState<AdminPushUser[]>([]);
  const [kitchenSubs, setKitchenSubs] = useState<KitchenSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [setupWarning, setSetupWarning] = useState("");

  // Compose form
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [targetUser, setTargetUser] = useState<AdminPushUser | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Per-row send
  const [sendingRow, setSendingRow] = useState<string | null>(null);
  const [rowResult, setRowResult] = useState<Record<string, { ok: boolean; msg: string }>>({});

  // WhatsApp template
  const [waTemplate, setWaTemplate] = useState(
    "🍕 Hello! The kitchen is OPEN at Bhook Lagi! Order your favourite food now at bhooklagi.in 🛵💨"
  );

  async function load() {
    try {
      const res = await fetch("/api/admin/subscribers");
      if (res.status === 401) { router.replace("/admin/login"); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load.");
      setPushSubs(data.subscribers ?? []);
      setPushUsers(data.users ?? []);
      setKitchenSubs(data.kitchenSubs ?? []);
      setSetupWarning(data.setupWarning ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading subscribers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function sendPush(
    type: TargetType,
    customerId: string | null,
    title: string,
    body: string,
    onDone: (ok: boolean, msg: string) => void
  ) {
    const res = await fetch("/api/admin/send-push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, targetType: type, customerId }),
    });
    const data = await res.json();
    if (res.ok) onDone(true, data.message ?? "Sent!");
    else onDone(false, data.error ?? "Failed to send.");
  }

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) return;
    setSending(true);
    setResult(null);
    await sendPush(
      targetType,
      targetType === "user" ? (targetUser?.id ?? null) : null,
      pushTitle, pushBody,
      (ok, msg) => setResult({ ok, msg })
    );
    setSending(false);
    if (targetType === "all") { setPushTitle(""); setPushBody(""); }
  }

  async function handleRowSend(sub: PushSubscriber) {
    setSendingRow(sub.id);
    setRowResult((prev) => { const n = { ...prev }; delete n[sub.id]; return n; });
    const title = pushTitle.trim() || "Bhook Lagi? 🍔";
    const body = pushBody.trim() || "Check out what's fresh on the menu today!";
    const res = await fetch("/api/admin/send-push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, targetType: "subscription", subscriptionId: sub.id }),
    });
    const data = await res.json();
    const ok = res.ok;
    const msg = ok ? (data.message ?? "Sent!") : (data.error ?? "Failed to send.");
    setRowResult((prev) => ({ ...prev, [sub.id]: { ok, msg } }));
    setSendingRow(null);
  }

  const filteredUsers = pushUsers.filter((user) => {
    const q = userSearch.toLowerCase();
    return (
      (user.name ?? "").toLowerCase().includes(q) ||
      user.phone.includes(q) ||
      user.id.toLowerCase().includes(q)
    );
  });

  const identifiedCount = pushSubs.filter((s) => s.customerId).length;
  const anonymousCount = pushSubs.length - identifiedCount;
  const pushEnabledUsers = pushUsers.filter((user) => user.deviceCount > 0).length;

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-dvh bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white pb-20 transition-colors">

        {/* Header */}
        <AdminPageHeader
          icon={<span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-800 text-base text-white shadow-md dark:bg-white/10">🔔</span>}
          title="Push Alerts"
          subtitle="Manage subscribers & send notifications"
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
          maxWidth="max-w-4xl"
        />

        <main className="mx-auto max-w-2xl px-4 py-6 md:px-6 space-y-5">

          {/* Back + title */}
          <div className="flex items-center gap-2">
            <Link href="/admin/settings" className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5">
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-[18px] font-black text-gray-900 dark:text-white">Notifications</h1>
              <p className="text-[12px] text-gray-500">Send push alerts to your subscribers</p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-[13px] text-red-600 dark:bg-red-950/20 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {setupWarning && !error && (
            <div className="rounded-xl bg-amber-50 p-4 text-[13px] text-amber-700 dark:bg-amber-950/20 dark:text-amber-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {setupWarning}
            </div>
          )}

          {/* Stats */}
          {!loading && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total", value: pushSubs.length, Icon: Smartphone, color: "text-brand-orange" },
                { label: "Users Push On", value: pushEnabledUsers, Icon: User, color: "text-blue-500" },
                { label: "Anonymous", value: anonymousCount, Icon: Users, color: "text-gray-400" },
              ].map(({ label, value, Icon, color }) => (
                <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-gray-900">
                  <Icon className={`mx-auto h-5 w-5 ${color} mb-1`} strokeWidth={2} />
                  <p className="text-[22px] font-black text-gray-900 dark:text-white">{value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Compose Notification ── */}
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h2 className="mb-4 flex items-center gap-2 text-[15px] font-black text-gray-900 dark:text-white">
              <Send className="h-4 w-4 text-brand-orange" strokeWidth={2.5} />
              Send Notification
            </h2>

            {/* Target selector */}
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => { setTargetType("all"); setTargetUser(null); }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-[13px] font-bold transition-colors ${
                  targetType === "all"
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange dark:bg-brand-orange/15"
                    : "border-gray-200 text-gray-500 hover:border-gray-300 dark:border-white/10 dark:text-gray-400"
                }`}
              >
                <Users className="h-4 w-4" />
                All Subscribers
                {pushSubs.length > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${targetType === "all" ? "bg-brand-orange text-white" : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"}`}>
                    {pushSubs.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setTargetType("user")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-[13px] font-bold transition-colors ${
                  targetType === "user"
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange dark:bg-brand-orange/15"
                    : "border-gray-200 text-gray-500 hover:border-gray-300 dark:border-white/10 dark:text-gray-400"
                }`}
              >
                <User className="h-4 w-4" />
                Specific User
              </button>
            </div>

            {/* User picker (when specific) */}
            {targetType === "user" && (
              <div className="mb-4">
                {targetUser ? (
                  <div className="flex items-center gap-3 rounded-xl border border-brand-orange/40 bg-orange-50 px-3 py-2.5 dark:bg-brand-orange/10">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange/20 text-brand-orange">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-gray-900 dark:text-white">
                        {targetUser.name ?? "Unnamed User"}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        +91 {targetUser.phone.slice(-10)} · {targetUser.deviceCount} device{targetUser.deviceCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button type="button" onClick={() => setTargetUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-gray-950">
                      <Search className="h-4 w-4 shrink-0 text-gray-400" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => { setUserSearch(e.target.value); setShowUserPicker(true); }}
                        onFocus={() => setShowUserPicker(true)}
                        placeholder="Search by name or phone…"
                        className="flex-1 bg-transparent text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white"
                      />
                    </div>
                    {showUserPicker && filteredUsers.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-gray-900">
                        {filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => { setTargetUser(user); setShowUserPicker(false); setUserSearch(""); }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
                              <User className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-semibold text-gray-900 dark:text-white">
                                {user.name ?? <span className="italic text-gray-400">Unnamed user</span>}
                              </p>
                              <p className="text-[11px] text-gray-400">+91 {user.phone.slice(-10)}</p>
                              <p className="text-[10px] text-gray-300 dark:text-gray-600">
                                {user.deviceCount > 0 ? `${user.deviceCount} subscribed device${user.deviceCount !== 1 ? "s" : ""}` : "No push device yet"}
                              </p>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${user.deviceCount > 0 ? "bg-green-50 text-green-600 dark:bg-green-900/30" : "bg-gray-100 text-gray-400 dark:bg-white/10"}`}>
                              {user.deviceCount > 0 ? "PUSH ON" : "NO DEVICE"}
                              </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {showUserPicker && filteredUsers.length === 0 && (
                      <p className="mt-2 text-[12px] text-gray-400">No users found.</p>
                    )}
                  </div>
                )}
                <p className="mt-2 text-[11px] text-gray-400">
                  Tip: users with “PUSH ON” will receive the notification. Users without a subscribed device will show a no-device message.
                </p>
              </div>
            )}

            {/* Title & body */}
            <form onSubmit={handleBroadcast} className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  placeholder="e.g. 🍕 Fresh Paneer Rolls are live!"
                  maxLength={60}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[13px] text-gray-900 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange dark:border-white/10 dark:bg-gray-950 dark:text-white"
                />
                <p className="mt-0.5 text-right text-[10px] text-gray-300">{pushTitle.length}/60</p>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                  Message Body
                </label>
                <textarea
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  placeholder="e.g. Try our brand new combo at just ₹119. Order in 2 taps!"
                  maxLength={120}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[13px] text-gray-900 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange dark:border-white/10 dark:bg-gray-950 dark:text-white"
                />
                <p className="mt-0.5 text-right text-[10px] text-gray-300">{pushBody.length}/120</p>
              </div>

              {/* Notification preview */}
              {(pushTitle || pushBody) && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-white/5 dark:bg-gray-950/50">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Preview</p>
                  <div className="flex items-start gap-2 rounded-xl bg-white px-3 py-2.5 shadow-sm dark:bg-gray-900">
                    <span className="mt-0.5 text-[18px]">🍔</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold text-gray-900 dark:text-white leading-snug">
                        {pushTitle || "Notification Title"}
                      </p>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                        {pushBody || "Notification body text…"}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-300 shrink-0 mt-0.5">now</span>
                  </div>
                </div>
              )}

              {result && (
                <div className={`flex items-center gap-2 rounded-xl p-3 text-[12px] ${result.ok ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"}`}>
                  {result.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                  {result.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={sending || !pushTitle.trim() || !pushBody.trim() || (targetType === "user" && !targetUser)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange py-3 text-[13px] font-extrabold text-white shadow-md shadow-brand-orange/25 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50"
              >
                {sending
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : <Send className="h-4 w-4" />
                }
                {targetType === "all"
                  ? `Broadcast to All (${pushSubs.length})`
                  : `Send to ${targetUser?.name ?? "Selected User"}`
                }
              </button>
            </form>
          </div>

          {/* ── Push Subscribers List ── */}
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
            <div className="border-b border-gray-100 px-5 py-3.5 dark:border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                  Push Subscribers · {pushSubs.length}
                </span>
                <Bell className="h-4 w-4 text-gray-300" />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-[13px] text-gray-400 gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
                Loading…
              </div>
            ) : pushSubs.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <Smartphone className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-[13px] font-semibold text-gray-400">No push subscribers yet</p>
                <p className="text-[11px] text-gray-300 mt-0.5">Users who allow notifications will appear here</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-white/5">
                {pushSubs.map((sub) => {
                  const rr = rowResult[sub.id];
                  return (
                    <li key={sub.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
                        {sub.customerId
                          ? <User className="h-4 w-4 text-blue-500" />
                          : <Smartphone className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[13px] font-bold text-gray-900 dark:text-white">
                            {sub.name ?? <span className="font-normal italic text-gray-400">Anonymous</span>}
                          </p>
                          {sub.customerId && (
                            <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-500 dark:bg-blue-900/30">
                              ACCOUNT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {sub.phone ? `+91 ${sub.phone}` : "No phone"} · {timeAgo(sub.createdAt)}
                        </p>
                        {rr && (
                          <p className={`text-[10px] font-medium ${rr.ok ? "text-green-500" : "text-red-500"}`}>
                            {rr.msg}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        title="Send notification to this subscriber"
                        onClick={() => handleRowSend(sub)}
                        disabled={sendingRow === sub.id || !pushTitle.trim() || !pushBody.trim()}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange transition-all hover:bg-brand-orange hover:text-white active:scale-90 disabled:opacity-40"
                      >
                        {sendingRow === sub.id
                          ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-orange/30 border-t-brand-orange" />
                          : <Send className="h-3.5 w-3.5" />
                        }
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ── Kitchen / WhatsApp Subscribers ── */}
          {kitchenSubs.length > 0 && (
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
              <div className="border-b border-gray-100 px-5 py-3.5 dark:border-white/5">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                  WhatsApp Subscribers (Kitchen Open alerts) · {kitchenSubs.length}
                </span>
              </div>
              <div className="px-5 py-3">
                <label className="mb-1 block text-[11px] font-bold text-gray-400">WhatsApp Message Template</label>
                <input
                  type="text"
                  value={waTemplate}
                  onChange={(e) => setWaTemplate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] text-gray-900 focus:border-brand-orange focus:outline-none dark:border-white/10 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <ul className="divide-y divide-gray-50 dark:divide-white/5">
                {kitchenSubs.map((sub) => (
                  <li key={sub.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-[13px] font-bold text-gray-900 dark:text-white">{sub.name ?? "Anonymous"}</p>
                      <a
                        href={`https://wa.me/91${sub.phone}?text=${encodeURIComponent(waTemplate)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] font-semibold text-brand-orange hover:underline"
                      >
                        📞 +91 {sub.phone}
                      </a>
                    </div>
                    <span className="text-[11px] text-gray-400">{timeAgo(sub.created_at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
