import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MenuExplorer } from "@/components/menu/MenuExplorer";
import { Clock, Bike, ShieldCheck } from "lucide-react";

/* ── Skeleton ───────────────────────────────────────────────── */
function MenuFallback() {
  return (
    <div className="flex gap-6">
      {/* sidebar skeleton */}
      <div className="hidden md:block w-[200px] flex-shrink-0">
        <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm space-y-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-2 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* cards skeleton */}
      <div className="flex-1 space-y-4">
        <div className="h-11 w-full animate-pulse rounded-2xl bg-gray-100" />
        <div className="rounded-2xl border border-gray-100 bg-white px-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 border-b border-gray-100 py-5 last:border-0">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/5 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-3 w-4/5 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-3 w-2/5 animate-pulse rounded-lg bg-gray-100" />
              </div>
              <div className="h-[110px] w-[110px] animate-pulse rounded-2xl bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <>
      <SiteHeader />

      {/* ── Hero banner — Swiggy/Zomato style ── */}
      <div className="bg-gradient-to-br from-brand-orange via-[#d45200] to-brand-gold pt-[56px]">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6 md:py-7">
          {/* Top row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
                </span>
                <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">Open now</span>
              </div>
              <h1 className="mt-1 font-display text-[clamp(1.8rem,5vw,2.8rem)] leading-none tracking-wide text-white">
                BHOOK LAGI
              </h1>
              <p className="mt-1 text-[12px] font-medium text-white/70">
                Street food · Deoghar, Jharkhand · 25–35 min delivery
              </p>
            </div>

            {/* Rating badge */}
            <div className="flex-shrink-0 rounded-2xl bg-white/15 px-4 py-2.5 text-center backdrop-blur-sm border border-white/20">
              <p className="font-display text-[24px] leading-none text-white">4.8</p>
              <p className="mt-0.5 text-[10px] font-bold text-white/70">★ Rating</p>
            </div>
          </div>

          {/* Info pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { Icon: Clock,       text: "25–35 min" },
              { Icon: Bike,        text: "Free delivery" },
              { Icon: ShieldCheck, text: "Hygienic kitchen" },
            ].map(({ Icon, text }) => (
              <span
                key={text}
                className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <svg viewBox="0 0 1440 28" className="block w-full" preserveAspectRatio="none" style={{ height: 28 }}>
          <path d="M0,28 C360,0 1080,0 1440,28 L1440,28 L0,28 Z" fill="#f9fafb" />
        </svg>
      </div>

      {/* ── Main content ── */}
      <main className="min-h-screen bg-gray-50 pb-36 md:pb-24">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
          <Suspense fallback={<MenuFallback />}>
            <MenuExplorer />
          </Suspense>
        </div>
      </main>
    </>
  );
}
