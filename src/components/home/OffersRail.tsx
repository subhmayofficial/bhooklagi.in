"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { offers } from "@/data/offers";
import { cn } from "@/lib/utils";

const cardStyles: Record<string, string> = {
  orange: "bg-gradient-to-br from-brand-orange to-brand-gold text-white",
  gold:   "bg-gradient-to-br from-brand-gold to-amber-400 text-ink",
  dark:   "bg-gradient-to-br from-gray-900 to-gray-800 text-white",
};

export function OffersRail({ dense }: { dense?: boolean }) {
  return (
    <section className={cn("bg-app-texture px-4", dense ? "" : "py-8 md:py-10")}>
      <div className="mx-auto max-w-6xl">
        {!dense && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-gray-900">
              Deals &amp; offers
            </h2>
            <Link
              href="/offers"
              className="flex items-center gap-1 text-[13px] font-bold text-brand-orange hover:underline"
            >
              <Tag className="h-3.5 w-3.5" />
              All offers
            </Link>
          </div>
        )}

        <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-4 md:px-0">
          {offers.map((o, i) => (
            <motion.article
              key={o.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "relative min-w-[240px] flex-shrink-0 overflow-hidden rounded-2xl p-4 shadow-md ring-1 ring-black/[0.05] md:min-w-0",
                cardStyles[o.accent] ?? cardStyles.orange,
              )}
            >
              <span className="pointer-events-none absolute -bottom-3 -right-2 text-[64px] leading-none opacity-15">
                {o.icon}
              </span>
              <span className="relative inline-block rounded-full bg-black/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]">
                {o.badge}
              </span>
              <h3 className="relative mt-3 text-[18px] font-extrabold leading-tight">
                {o.title}
              </h3>
              <p className="relative mt-1 text-[12px] font-medium opacity-85">{o.subtitle}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
