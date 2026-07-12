const items = [
  { text: "Burgers",    emoji: "🍔" },
  { text: "Rolls",      emoji: "🌯" },
  { text: "Maggi",      emoji: "🍜" },
  { text: "Chinese",    emoji: "🥡" },
  { text: "Pasta",      emoji: "🍝" },
  { text: "Fries",      emoji: "🍟" },
  { text: "Sandwiches", emoji: "🥪" },
  { text: "Drinks",     emoji: "🧃" },
  { text: "Fast delivery", emoji: "⚡" },
  { text: "Pocket friendly", emoji: "💰" },
];

export function FoodMarquee() {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-brand-orange/20 bg-gradient-to-r from-brand-orange/5 via-brand-gold/5 to-brand-orange/5 py-2.5">
      {/* Fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#fdf6ec] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#fdf6ec] to-transparent" />

      <div className="food-marquee-track flex w-max gap-0">
        {doubled.map((item, i) => (
          <span
            key={`${item.text}-${i}`}
            className="flex items-center gap-1.5 whitespace-nowrap px-4 text-[12px] font-semibold text-gray-500"
          >
            <span className="text-[14px]">{item.emoji}</span>
            <span>{item.text}</span>
            <span className="ml-2 text-brand-orange/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
