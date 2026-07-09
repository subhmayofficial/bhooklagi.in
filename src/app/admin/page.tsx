"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Users } from "lucide-react";
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
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
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

  return (
    <main className="min-h-dvh bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-orange" />
            <h1 className="text-[20px] font-bold text-gray-900">
              Users {users ? `(${users.length})` : ""}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}

        {!users && !error && <p className="text-[13px] text-gray-400">Loading…</p>}

        {users && users.length === 0 && (
          <p className="text-[13px] text-gray-400">No users yet.</p>
        )}

        {users && users.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Wallet</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Total spent</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Last login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 font-semibold text-gray-900">+{u.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{u.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{formatInr(u.walletBalance)}</td>
                    <td className="px-4 py-3 text-gray-600">{u.orderCount}</td>
                    <td className="px-4 py-3 text-gray-600">{formatInr(u.totalSpent)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(u.lastLoginAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
