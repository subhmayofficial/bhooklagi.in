/* Next.js automatically renders this file while menu/page.tsx is loading */
export default function MenuLoading() {
  return (
    <>
      {/* Hero banner skeleton */}
      <div className="bg-gradient-to-br from-brand-orange/80 via-[#d45200]/80 to-brand-gold/80 pt-[56px]">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6 md:py-7">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="h-3 w-20 animate-pulse rounded-full bg-white/30" />
              <div className="h-9 w-44 animate-pulse rounded-xl bg-white/30" />
              <div className="h-3 w-56 animate-pulse rounded-full bg-white/20" />
            </div>
            <div className="h-16 w-20 animate-pulse rounded-2xl bg-white/20" />
          </div>
          <div className="mt-4 flex gap-2">
            {[72, 88, 96].map((w) => (
              <div key={w} className="h-8 animate-pulse rounded-full bg-white/20" style={{ width: w }} />
            ))}
          </div>
        </div>
        <svg viewBox="0 0 1440 28" className="block w-full" preserveAspectRatio="none" style={{ height: 28 }}>
          <path d="M0,28 C360,0 1080,0 1440,28 L1440,28 L0,28 Z" fill="#f9fafb" />
        </svg>
      </div>

      {/* Content skeleton */}
      <div className="min-h-screen bg-gray-50 pb-36 md:pb-24">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
          <div className="flex gap-6">

            {/* Sidebar skeleton — desktop only */}
            <div className="hidden md:block w-[200px] flex-shrink-0">
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="h-10 animate-pulse bg-gradient-to-r from-gray-200 to-gray-100" />
                <div className="divide-y divide-gray-50 p-1">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-3">
                      <div className="h-9 w-9 flex-shrink-0 animate-pulse rounded-xl bg-gray-100" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
                        <div className="h-2 w-1/2 animate-pulse rounded bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content skeleton */}
            <div className="flex-1 space-y-4">
              {/* Search bar */}
              <div className="h-11 w-full animate-pulse rounded-2xl bg-white shadow-sm border border-gray-100" />

              {/* Mobile pills */}
              <div className="flex gap-2 md:hidden overflow-hidden">
                {[60, 72, 56, 80, 68, 76].map((w, i) => (
                  <div key={i} className="h-8 flex-shrink-0 animate-pulse rounded-full bg-gray-100" style={{ width: w }} />
                ))}
              </div>

              {/* Bestseller strip label */}
              <div className="h-4 w-28 animate-pulse rounded-full bg-gray-200" />
              <div className="flex gap-3 overflow-hidden -mx-4 px-4 md:mx-0 md:px-0">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-[120px] w-[140px] flex-shrink-0 animate-pulse rounded-2xl bg-white border border-gray-100 shadow-sm" />
                ))}
              </div>

              {/* Section header */}
              <div className="flex items-center gap-3 pt-2">
                <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-100" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
                </div>
              </div>

              {/* Dish card skeletons */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white px-4 shadow-sm">
                {[...Array(6)].map((_, i) => (
                  <DishCardSkeleton key={i} last={i === 5} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DishCardSkeleton({ last }: { last?: boolean }) {
  return (
    <div className={`flex items-start gap-4 py-5 ${last ? "" : "border-b border-gray-100"}`}>
      {/* Left */}
      <div className="flex-1 space-y-2.5 pt-1">
        {/* Diet dot */}
        <div className="h-[18px] w-[18px] animate-pulse rounded-sm bg-gray-100" />
        {/* Badge */}
        <div className="h-5 w-20 animate-pulse rounded-full bg-amber-50" />
        {/* Name */}
        <div className="h-4 w-3/5 animate-pulse rounded-lg bg-gray-200" />
        {/* Description */}
        <div className="space-y-1.5">
          <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-gray-100" />
        </div>
        {/* Price */}
        <div className="h-5 w-16 animate-pulse rounded-lg bg-gray-200" />
      </div>
      {/* Right: image */}
      <div className="relative flex-shrink-0">
        <div className="h-[110px] w-[110px] animate-pulse rounded-2xl bg-gray-100" />
        {/* ADD button skeleton */}
        <div className="absolute -bottom-3.5 left-1/2 h-7 w-16 -translate-x-1/2 animate-pulse rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}
