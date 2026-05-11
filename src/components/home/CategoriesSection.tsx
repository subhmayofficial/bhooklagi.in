"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { categories } from "@/data/menu";

export function CategoriesSection() {
  return (
    <section className="bg-white px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-[18px] font-bold text-gray-900">
          What&apos;s on your mind?
        </h2>

        <div className="hide-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-8 md:px-0">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
            >
              <Link
                href={`/menu?cat=${c.id}`}
                className="group flex w-[80px] flex-shrink-0 flex-col items-center gap-2 md:w-auto"
              >
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-brand-orange/[0.07] transition-all group-hover:bg-brand-orange/[0.14] group-hover:shadow-md md:h-[80px] md:w-[80px]">
                  <span className="text-[2.2rem] transition-transform group-hover:scale-110 md:text-[2.5rem]">
                    {c.emoji}
                  </span>
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
