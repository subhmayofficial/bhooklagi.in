"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Login failed.");
      router.push("/admin");
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "Login failed.");
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="mb-5 flex items-center gap-2">
          <Lock className="h-4 w-4 text-brand-orange" />
          <h1 className="text-[17px] font-bold text-gray-900">Admin login</h1>
        </div>

        <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-gray-500">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-gray-900 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
        />

        {error && <p className="mt-2 text-[12px] text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-4 flex w-full items-center justify-center rounded-2xl bg-brand-orange px-5 py-3 text-[14px] font-extrabold text-white transition-all hover:bg-brand-orange-dark disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </main>
  );
}
