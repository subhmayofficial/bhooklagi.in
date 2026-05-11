"use client";

import { motion } from "framer-motion";

const items = [
  "🍔 Burgers",
  "🌯 Rolls",
  "🍜 Maggi",
  "🥡 Chinese",
  "🍝 Pasta",
  "🍟 Fries",
  "🥪 Sandwiches",
  "🧃 Drinks",
  "⚡ Fast delivery",
  "💰 Pocket friendly",
];

export function FoodMarquee() {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-gray-200 bg-gray-50 py-3">
      <motion.div
        className="flex w-max gap-6"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((text, i) => (
          <span
            key={`${text}-${i}`}
            className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 whitespace-nowrap"
          >
            <span>{text}</span>
            <span className="text-brand-orange">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
