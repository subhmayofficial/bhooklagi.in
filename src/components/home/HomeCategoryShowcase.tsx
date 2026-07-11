"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import type { MenuCategoryId } from "@/data/menu";
import { ArrowRight } from "lucide-react";

const featured: {
  id: MenuCategoryId;
  label: string;
  blurb: string;
  image: string;
  tag?: string;
  tagColor?: string;
}[] = [
  {
    id: "burgers",
    label: "Burgers",
    blurb: "Juicy stacks",
    image: "https://b.zmtcdn.com/data/dish_photos/48b/a59d732bf2d0f51fb4895f46548e548b.png",
    tag: "🔥 Trending",
    tagColor: "bg-red-500",
  },
  {
    id: "rolls",
    label: "Rolls",
    blurb: "Street wraps",
    image: "https://b.zmtcdn.com/data/dish_photos/99a/7c1d6342603039279a6bcc5a6cd0b99a.jpeg",
    tag: "⭐ 4.8",
    tagColor: "bg-amber-500",
  },
  {
    id: "maggi",
    label: "Maggi",
    blurb: "Masala moods",
    image: "https://b.zmtcdn.com/data/dish_photos/153/89ab6ec6d2f308395e4693f991c0f153.jpeg",
  },
  {
    id: "fries",
    label: "Fries",
    blurb: "Crispy sides",
    image: "https://b.zmtcdn.com/data/dish_photos/d9f/1ea36e028d1056244cea461d5f270d9f.png",
  },
  {
    id: "drinks",
    label: "Drinks",
    blurb: "Chill sips",
    image: "https://b.zmtcdn.com/data/dish_photos/5dc/78d0f5c66690dde9ea27d8f83e3e05dc.jpg",
  },
  {
    id: "sandwiches",
    label: "Sandwiches",
    blurb: "Grilled & loaded",
    image: "https://b.zmtcdn.com/data/dish_photos/505/d869d610f6e0cc28b350c3d7859a7505.png",
    tag: "✨ New",
    tagColor: "bg-violet-500",
  },
  {
    id: "meals",
    label: "Combos",
    blurb: "Complete meals",
    image: "https://b.zmtcdn.com/data/dish_photos/350/fbf1b3293a79314f77e1cc6dd2420350.jpeg",
    tag: "🍱 Value",
    tagColor: "bg-green-600",
  },
];

/* ── Single category circle with its own skeleton state ─── */
function CategoryCircle({ c, index }: { c: (typeof featured)[number]; index: number }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" }}
    >
      <Link href={`/menu?cat=${c.id}`} className="group flex flex-col items-center gap-2">
        {/* Circle image with skeleton + glow */}
        <div className="relative">
          {c.tag && (
            <span
              className={`absolute -right-2 -top-1 z-10 rotate-6 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[8px] font-extrabold text-white shadow-md ${c.tagColor ?? "bg-ink"}`}
            >
              {c.tag}
            </span>
          )}

          {/* Hover glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-orange/40 to-brand-gold/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

          {/* Image container */}
          <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full ring-2 ring-white shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:ring-brand-orange/40 sm:h-[84px] sm:w-[84px] md:h-[96px] md:w-[96px]">
            {/* Skeleton shimmer — shown until image loads */}
            {!loaded && (
              <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
            )}

            <Image
              src={c.image}
              alt={c.label}
              fill
              sizes="96px"
              className={`object-cover transition-all duration-500 group-hover:scale-110 ${loaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setLoaded(true)}
            />

            {/* Shimmer on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </div>

        {/* Label */}
        <div className="text-center">
          <p className="text-[12px] font-bold text-gray-800 transition-colors group-hover:text-brand-orange">
            {c.label}
          </p>
          <p className="text-[10px] text-gray-400">{c.blurb}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export function HomeCategoryShowcase() {
  return (
    <section className="bg-app-texture px-4 pb-6 pt-4 md:px-6 md:pb-12 md:pt-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-orange">
              Browse by category
            </p>
            <h2 className="mt-0.5 text-[18px] font-extrabold leading-tight text-gray-900 md:text-[22px]">
              What&apos;s on your{" "}
              <span className="text-gradient-brand">mind?</span>
            </h2>
          </div>
          <Link
            href="/menu"
            className="group flex items-center gap-1 text-[12px] font-bold text-brand-orange hover:underline"
          >
            Full menu
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={3} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-x-2 gap-y-4 md:grid-cols-7 md:gap-x-4">
          {featured.map((c, i) => (
            <CategoryCircle key={c.id} c={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
