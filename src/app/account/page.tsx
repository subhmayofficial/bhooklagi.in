"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, MapPin, Trash2, Receipt, LogOut, User } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useAuthStore } from "@/stores/auth-store";
import { OtpLoginForm } from "@/components/auth/OtpLoginForm";
import { formatInr } from "@/data/menu";

type Account = { name: string | null; phone: string; walletBalance: number };
type Address = {
  id: string;
  label: string | null;
  address: string;
  landmark: string | null;
  isDefault: boolean;
};

export default function AccountPage() {
  const authStatus = useAuthStore((s) => s.status);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const logout = useAuthStore((s) => s.logout);

  const [account, setAccount] = useState<Account | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/account").then((r) => r.json()).then((d) => setAccount(d.account ?? null));
    fetch("/api/addresses").then((r) => r.json()).then((d) => setAddresses(d.addresses ?? []));
  }, [authStatus]);

  async function deleteAddress(id: string) {
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (res.ok) setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  if (authStatus === "guest") {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col items-center justify-center px-4 pb-28 pt-20">
          <div className="mb-8 w-full">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-brand-orange shadow-lg shadow-brand-orange/30">
              <span className="text-[28px] font-black text-white">BL</span>
            </div>
          </div>
          <div className="w-full rounded-[28px] bg-white p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
            <OtpLoginForm />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 pb-28 pt-20 md:pb-16 md:pt-24">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-brand-orange" />
            <h1 className="text-[20px] font-bold text-gray-900">My account</h1>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-[12px] font-semibold text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>

        {/* Profile + wallet */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Profile</p>
            <p className="mt-2 text-[15px] font-bold text-gray-900">{account?.name || "—"}</p>
            <p className="text-[13px] text-gray-500">+{account?.phone ?? ""}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-brand-orange to-brand-gold p-5 shadow-sm">
            <div className="flex items-center gap-1.5 text-white/90">
              <Wallet className="h-4 w-4" />
              <p className="text-[11px] font-bold uppercase tracking-wide">Wallet balance</p>
            </div>
            <p className="mt-2 text-[24px] font-extrabold text-white">
              {formatInr(account?.walletBalance ?? 0)}
            </p>
          </div>
        </div>

        {/* My orders link */}
        <Link
          href="/orders"
          className="mt-3 flex items-center gap-2.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md"
        >
          <Receipt className="h-4 w-4 text-brand-orange" />
          <span className="text-[14px] font-semibold text-gray-800">My orders</span>
        </Link>

        {/* Saved addresses */}
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-orange" />
            <h2 className="text-[15px] font-bold text-gray-900">Saved addresses</h2>
          </div>
          {addresses.length === 0 ? (
            <p className="rounded-2xl border border-gray-100 bg-white p-5 text-[13px] text-gray-400 shadow-sm">
              No saved addresses yet. They&apos;ll appear here after your first order.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {addresses.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="min-w-0">
                    {a.label && (
                      <p className="text-[12px] font-bold text-gray-900">{a.label}</p>
                    )}
                    <p className="text-[13px] text-gray-600">{a.address}</p>
                    {a.landmark && <p className="text-[12px] text-gray-400">Near: {a.landmark}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteAddress(a.id)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500"
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
