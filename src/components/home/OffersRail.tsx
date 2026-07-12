"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Tag, Zap, Clock, Sparkles } from "lucide-react";
import { offers } from "@/data/offers";
import { cn } from "@/lib/utils";

const CARD_THEMES: Record<
  string,
  {
    bg: string;
    badgeBg: string;
    text: string;
    subtextColor: string;
    iconBg: string;
    Icon: React.ElementType;
    glow: string;
  }
> = {
  orange: {
    bg: "bg-gradient-to-br from-brand-orange via-[#f06c1a] to-brand-gold",
    badgeBg: "bg-black/20",
    text: "text-white",
    subtextColor: "text-white/80",
    iconBg: "bg-white/15",
    Icon: Zap,
    glow: "rgba(232,93,4,0.5)",
  },
  gold: {
    bg: "bg-gradient-to-br from-amber-400 via-brand-gold to-yellow-500",
    badgeBg: "bg-black/15",
    text: "text-ink",
    subtextColor: "text-ink/70",
    iconBg: "bg-black/10",
    Icon: Clock,
    glow: "rgba(250,163,7,0.5)",
  },
  dark: {
    bg: "bg-gradient-to-br from-gray-900 via-gray-800 to-zinc-900",
    badgeBg: "bg-white/10",
    text: "text-white",
    subtextColor: "text-white/70",
    iconBg: "bg-white/10",
    Icon: Sparkles,
    glow: "rgba(100,100,120,0.4)",
  },
};

export function OffersRail({ dense }: { dense?: boolean }) {
  return (
    <section className={cn("bg-app-texture px-4", dense ? "" : "py-6 md:py-10")}>
      <div className="mx-auto max-w-6xl">
        {!dense && (
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-orange">
                Hot right now
              </p>
              <h2 className="mt-0.5 text-[18px] font-extrabold leading-tight text-gray-900 md:text-[22px]">
                Deals &amp;{" "}
                <span className="text-gradient-brand">Offers</span>
              </h2>
            </div>
            <Link
              href="/offers"
              className="group flex items-center gap-1 rounded-full border border-brand-orange/30 bg-brand-orange/5 px-3 py-1.5 text-[11px] font-bold text-brand-orange transition-colors hover:bg-brand-orange/10"
            >
              <Tag className="h-3 w-3" />
              All offers
            </Link>
          </div>
        )}

        <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:px-0">
          {offers.map((o, i) => {
            const theme = CARD_THEMES[o.accent] ?? CARD_THEMES.orange;
            const { Icon } = theme;
            return (
              <motion.article
                key={o.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={cn(
                  "group relative min-w-[200px] flex-shrink-0 overflow-hidden rounded-2xl p-4 md:min-w-0",
                  theme.bg
                )}
                style={{ boxShadow: `0 6px 24px ${theme.glow}, 0 1px 4px rgba(0,0,0,0.12)` }}
              >
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                <div className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-black/10 blur-xl" />

                {/* Large emoji watermark */}
                <span
                  className="pointer-events-none absolute -bottom-2 -right-1 select-none text-[72px] leading-none opacity-[0.18] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                  aria-hidden
                >
                  {o.icon}
                </span>

                {/* Top row: badge + icon */}
                <div className="relative flex items-start justify-between">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em]",
                      theme.badgeBg,
                      theme.text
                    )}
                  >
                    {o.badge}
                  </span>
                  <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", theme.iconBg)}>
                    <Icon className={cn("h-3.5 w-3.5", theme.text)} strokeWidth={2.5} />
                  </span>
                </div>

                {/* Title */}
                <h3
                  className={cn(
                    "relative mt-3 font-display text-[26px] leading-none tracking-wide",
                    theme.text
                  )}
                >
                  {o.title}
                </h3>

                {/* Subtitle */}
                <p className={cn("relative mt-1.5 text-[11px] font-medium leading-snug", theme.subtextColor)}>
                  {o.subtitle}
                </p>

                {/* Bottom CTA line */}
                <div className={cn("relative mt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider", theme.text, "opacity-70")}>
                  <span>Grab deal</span>
                  <span>→</span>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
