"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { startingPrices, formatInr } from "@/data/menu";

export function PriceBands() {
  return (
    <section className="bg-gray-50 px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-[18px] font-bold text-gray-900">
          Flavour that fits your budget
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {startingPrices.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/menu?cat=${p.categoryId}`}
                className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-brand-orange/30 hover:shadow-md text-center"
              >
                <span className="text-3xl">{p.emoji}</span>
                <p className="mt-2 text-[12px] font-bold text-gray-800">{p.label}</p>
                <p className="mt-0.5 text-[10px] text-gray-400 uppercase tracking-wide">from</p>
                <p className="text-[14px] font-extrabold text-brand-orange">{formatInr(p.from)}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
