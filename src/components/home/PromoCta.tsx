"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PromoCta() {
  return (
    <section className="bg-brand-orange px-4 py-10 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-white/70">
              Limited time
            </p>
            <h2 className="mt-2 text-[clamp(1.5rem,4vw,2.4rem)] font-extrabold leading-tight text-white">
              Get ₹80 off on your first order
            </h2>
            <p className="mt-2 text-[14px] text-white/75">
              Min order ₹299. Offer auto-applies at checkout.
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-[15px] font-extrabold text-brand-orange shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Order now
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
