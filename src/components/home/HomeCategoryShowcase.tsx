"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { MenuCategoryId } from "@/data/menu";

// Only categories we have real photos for — rest stay on /menu.
const featured: { id: MenuCategoryId; label: string; image: string; tag?: string }[] = [
  {
    id: "burgers",
    label: "Burgers",
    image: "https://b.zmtcdn.com/data/dish_photos/48b/a59d732bf2d0f51fb4895f46548e548b.png",
    tag: "🔥 Hot",
  },
  {
    id: "rolls",
    label: "Rolls",
    image: "https://b.zmtcdn.com/data/dish_photos/99a/7c1d6342603039279a6bcc5a6cd0b99a.jpeg",
    tag: "⭐ 4.8",
  },
  {
    id: "maggi",
    label: "Maggi",
    image: "https://b.zmtcdn.com/data/dish_photos/153/89ab6ec6d2f308395e4693f991c0f153.jpeg",
  },
  {
    id: "fries",
    label: "Fries",
    image: "https://b.zmtcdn.com/data/dish_photos/d9f/1ea36e028d1056244cea461d5f270d9f.png",
  },
  {
    id: "drinks",
    label: "Drinks",
    image: "https://b.zmtcdn.com/data/dish_photos/5dc/78d0f5c66690dde9ea27d8f83e3e05dc.jpg",
  },
  {
    id: "sandwiches",
    label: "Sandwiches",
    image: "https://b.zmtcdn.com/data/dish_photos/505/d869d610f6e0cc28b350c3d7859a7505.png",
    tag: "New",
  },
];

export function HomeCategoryShowcase() {
  return (
    <section className="bg-app-texture px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-[18px] font-bold text-gray-900">
          What&apos;s on your mind?
        </h2>

        <div className="grid grid-cols-3 gap-x-3 gap-y-6 md:grid-cols-6 md:gap-x-4">
          {featured.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <Link href={`/menu?cat=${c.id}`} className="group flex flex-col items-center gap-2">
                <div className="relative">
                  {c.tag && (
                    <span className="absolute -right-1 -top-1 z-10 rotate-6 whitespace-nowrap rounded-full bg-ink px-1.5 py-0.5 text-[9px] font-bold text-brand-gold shadow-sm">
                      {c.tag}
                    </span>
                  )}
                  <div className="h-[80px] w-[80px] overflow-hidden rounded-full bg-gray-100 ring-1 ring-black/[0.04] shadow-md transition-shadow group-hover:shadow-lg group-hover:ring-brand-orange/30 sm:h-[88px] sm:w-[88px] md:h-[96px] md:w-[96px]">
                    <div className="relative h-full w-full">
                      <Image
                        src={c.image}
                        alt={c.label}
                        fill
                        sizes="96px"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>
                </div>
                <span className="text-center text-[12px] font-semibold text-gray-700 group-hover:text-brand-orange">
                  {c.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
