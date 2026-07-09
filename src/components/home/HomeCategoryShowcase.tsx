"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { MenuCategoryId } from "@/data/menu";

// Only categories we have real photos for — rest stay on /menu.
const featured: { id: MenuCategoryId; label: string; image: string }[] = [
  {
    id: "burgers",
    label: "Burgers",
    image: "https://b.zmtcdn.com/data/dish_photos/48b/a59d732bf2d0f51fb4895f46548e548b.png",
  },
  {
    id: "rolls",
    label: "Rolls",
    image: "https://b.zmtcdn.com/data/dish_photos/99a/7c1d6342603039279a6bcc5a6cd0b99a.jpeg",
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
  },
];

export function HomeCategoryShowcase() {
  return (
    <section className="bg-white px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-[18px] font-bold text-gray-900">
          What&apos;s on your mind?
        </h2>

        <div className="hide-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-6 md:px-0">
          {featured.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <Link
                href={`/menu?cat=${c.id}`}
                className="group flex w-[92px] flex-shrink-0 flex-col items-center gap-2 md:w-auto"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.25,
                  }}
                  className="relative h-[88px] w-[88px] overflow-hidden rounded-full ring-1 ring-black/[0.04] shadow-md transition-all group-hover:shadow-lg group-hover:ring-brand-orange/30 md:h-[96px] md:w-[96px]"
                >
                  <Image
                    src={c.image}
                    alt={c.label}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </motion.div>
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
