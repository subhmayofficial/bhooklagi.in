export function TrustSection() {
  const items = [
    { icon: "🌿", title: "Freshly made",     desc: "Cooked fresh after every order" },
    { icon: "🧼", title: "Hygienic kitchen", desc: "Clean, safe, certified workspace" },
    { icon: "💰", title: "Pocket friendly",  desc: "Student-friendly prices" },
    { icon: "⚡", title: "Fast delivery",    desc: "Hot food, quick routes" },
    { icon: "❤️", title: "Made with love",   desc: "Passion in every bite" },
  ];

  return (
    <section className="bg-app-texture px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-[18px] font-bold text-gray-900">Why Bhook Lagi?</h2>
        <div className="flex flex-wrap gap-3">
          {items.map((t) => (
            <div
              key={t.title}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 shadow-sm"
            >
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="text-[13px] font-bold text-gray-900">{t.title}</p>
                <p className="text-[11px] text-gray-500">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
