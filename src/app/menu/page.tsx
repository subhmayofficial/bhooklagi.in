import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MenuExplorer } from "@/components/menu/MenuExplorer";

function MenuFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="h-8 w-40 animate-pulse rounded-full bg-gray-200" />
      <div className="mt-4 space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-start gap-4 py-5">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-3 w-full animate-pulse rounded-lg bg-gray-100" />
            </div>
            <div className="h-[100px] w-[100px] animate-pulse rounded-2xl bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-36 pt-20 md:px-6 md:pb-24 md:pt-24">
        <div className="mb-4">
          <h1 className="text-[22px] font-bold text-gray-900">
            Menu
          </h1>
          <p className="mt-0.5 text-[13px] text-gray-500">
            Everything made fresh · Delivering in Deoghar
          </p>
        </div>
        <Suspense fallback={<MenuFallback />}>
          <MenuExplorer />
        </Suspense>
      </main>
    </>
  );
}
