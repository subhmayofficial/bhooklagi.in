const SEO_CATEGORIES = [
  "Burgers",
  "Rolls",
  "Maggi",
  "Fries",
  "Sandwiches",
  "Drinks",
  "Combo meals",
];

export function HomeSeoContent() {
  return (
    <section className="bg-[#fdf6ec] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div>
            <h2 className="text-[22px] font-black leading-tight text-gray-950 md:text-[28px]">
              Order Food Online in Deoghar from Bhook Lagi
            </h2>
            <p className="mt-3 max-w-3xl text-[14px] font-medium leading-6 text-gray-600 md:text-[15px]">
              Bhook Lagi is a Deoghar cloud kitchen serving fresh fast food for local delivery. Choose from loaded burgers,
              street-style rolls, cheesy maggi, crispy fries, grilled sandwiches, refreshing drinks, and value combo meals.
            </p>
          </div>

          <div className="rounded-lg border border-orange-100 bg-white p-4 shadow-sm shadow-orange-950/5">
            <h2 className="text-[16px] font-black text-gray-950">Popular Food Categories in Deoghar</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-[13px] font-bold text-gray-600">
              {SEO_CATEGORIES.map((category) => (
                <li key={category} className="rounded-xl bg-orange-50 px-3 py-2 text-brand-orange">
                  {category}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
