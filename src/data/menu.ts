export type MenuCategoryId =
  | "burgers"
  | "rolls"
  | "maggi"
  | "fries"
  | "sandwiches"
  | "drinks"
  | "meals";

export type DietTag = "veg" | "egg" | "non-veg";

export type AddonOption = {
  id: string;
  name: string;
  price: number;
};

export type AddonGroup = {
  id: string;
  title: string;
  type: "single" | "multiple";
  options: AddOption[];
};

// Backward compatibility alias
export type AddOption = AddonOption;

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  image?: string;
  categoryId: MenuCategoryId;
  diet?: DietTag;
  spicy?: boolean;
  bestseller?: boolean;
  addons?: string[];
};

export const ADDON_GROUPS: Record<string, AddonGroup> = {
  burger_custom: {
    id: "burger_custom",
    title: "Customize Burger",
    type: "multiple",
    options: [
      { id: "cheese", name: "Extra Cheese Slice", price: 20 },
      { id: "veg_patty", name: "Extra Veg Patty", price: 25 },
      { id: "chicken_patty", name: "Extra Chicken Patty", price: 45 },
    ]
  },
  roll_custom: {
    id: "roll_custom",
    title: "Customize Roll",
    type: "multiple",
    options: [
      { id: "cheese", name: "Add Extra Cheese", price: 20 },
      { id: "egg", name: "Add Double Egg", price: 15 },
      { id: "chicken", name: "Add Extra Chicken", price: 40 },
    ]
  },
  maggi_custom: {
    id: "maggi_custom",
    title: "Customize Maggi",
    type: "multiple",
    options: [
      { id: "cheese", name: "Add Extra Cheese", price: 20 },
      { id: "veggies", name: "Add Extra Veggies", price: 15 },
      { id: "double", name: "Double Maggi portion", price: 30 },
    ]
  },
  sandwich_custom: {
    id: "sandwich_custom",
    title: "Customize Sandwich",
    type: "multiple",
    options: [
      { id: "cheese", name: "Extra Cheese Slice", price: 20 },
      { id: "paneer", name: "Add Grated Paneer", price: 30 },
    ]
  }
};

export function getItemAddons(item: MenuItem): AddonGroup[] {
  const groups: AddonGroup[] = [];
  if (item.categoryId === "burgers") {
    groups.push(ADDON_GROUPS.burger_custom);
  } else if (item.categoryId === "rolls") {
    groups.push(ADDON_GROUPS.roll_custom);
  } else if (item.categoryId === "maggi") {
    groups.push(ADDON_GROUPS.maggi_custom);
  } else if (item.categoryId === "sandwiches") {
    groups.push(ADDON_GROUPS.sandwich_custom);
  }
  return groups;
}

export const categories: {
  id: MenuCategoryId;
  label: string;
  emoji: string;
  blurb: string;
}[] = [
  { id: "burgers",    label: "Burgers",     emoji: "🍔", blurb: "Juicy stacks & sauces" },
  { id: "rolls",      label: "Rolls",       emoji: "🌯", blurb: "Street-style wraps" },
  { id: "maggi",      label: "Maggi",       emoji: "🍜", blurb: "Masala moods" },
  { id: "fries",      label: "Fries",       emoji: "🍟", blurb: "Crispy sides" },
  { id: "sandwiches", label: "Sandwiches",  emoji: "🥪", blurb: "Grilled & loaded" },
  { id: "drinks",     label: "Beverages",   emoji: "🧃", blurb: "Chill sips" },
  { id: "meals",      label: "Combo Meals", emoji: "🍱", blurb: "Complete meals, great value" },
];

export const menuItems: MenuItem[] = [
  // ── COMBO MEALS ──────────────────────────────────────────────────────────
  {
    id: "bl-everyday-meal",
    name: "Bhook Lagi Everyday Meal",
    description: "Aloo Tikki Burger + Classic Fries — crispy tikki patty in a soft bun served with hot golden fries. A filling everyday meal for quick hunger at an unbeatable price.",
    price: 119,
    emoji: "🍔",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/c30957e8cf6066f08d2df8e2d7d1a7f6-e8bdf2f6.jpg",
    categoryId: "meals",
    diet: "veg",
    bestseller: false,
  },
  {
    id: "bl-chicken-meal",
    name: "Bhook Lagi Chicken Meal",
    description: "Classic Chicken Burger + Classic Fries + Masala Cold Beverage — our most satisfying chicken combo. A complete meal for when you're seriously hungry.",
    price: 209,
    emoji: "🍗",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/fe86ada522be0b3f0ab1aa6eefc24198-2693c300.jpg",
    categoryId: "meals",
    diet: "non-veg",
    bestseller: true,
  },
  {
    id: "bl-roll-meal",
    name: "Bhook Lagi Roll Meal",
    description: "Special Egg Chicken Roll + Classic Fries + Masala Cold Beverage — juicy egg chicken roll paired with crispy fries and a refreshing cold drink. A complete desi-style meal.",
    price: 219,
    emoji: "🌯",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/faca25391e096bad5b4c90dbeed92735-3a6b5bcd.jpg",
    categoryId: "meals",
    diet: "non-veg",
    bestseller: false,
  },
  {
    id: "bl-special-meal",
    name: "Bhook Lagi Special Meal",
    description: "Chicken Cheese Burger + Peri Peri Fries + Cold Coffee — our best premium combo for the full experience. Cheesy burger, spicy fries, and a rich cold coffee in one meal.",
    price: 289,
    emoji: "⭐",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/fbf1b3293a79314f77e1cc6dd2420350-decea73f.jpg",
    categoryId: "meals",
    diet: "non-veg",
    bestseller: true,
  },
  {
    id: "bl-family-meal",
    name: "Bhook Lagi Family Meal",
    description: "2 Classic Chicken Burgers + 2 Classic Fries + 2 Masala Cold Beverages — a value-packed meal for two. Perfect for sharing with friends or family without breaking the bank.",
    price: 399,
    emoji: "👨‍👩‍👧",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/03189e4435a611e8d8e5749a66518d36-a13ba9df.jpg",
    categoryId: "meals",
    diet: "non-veg",
    bestseller: false,
  },
  {
    id: "bl-party-meal",
    name: "Bhook Lagi Party Meal",
    description: "Go big with your crew — 2 Chicken Cheese Rolls, 2 Chicken Cheese Burgers, 2 Peri Peri Fries, 2 Masala Cold Drinks. For when the whole gang is hungry.",
    price: 699,
    emoji: "🎉",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/fbf1b3293a79314f77e1cc6dd2420350-decea73f.jpg",
    categoryId: "meals",
    diet: "non-veg",
    bestseller: false,
  },

  // ── BURGERS ──────────────────────────────────────────────────────────────
  {
    id: "bl-aloo-tikki-burger",
    name: "Aloo Tikki Burger",
    description: "Crispy aloo tikki layered inside a soft burger bun with fresh veggies, creamy mayo, and tangy sauces. Simple, filling, and budget-friendly.",
    price: 69,
    emoji: "🍔",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/a59d732bf2d0f51fb4895f46548e548b-4be36c0f.png",
    categoryId: "burgers",
    diet: "veg",
  },
  {
    id: "bl-crispy-veg-burger",
    name: "Crispy Veg Burger",
    description: "A crunchy veg patty served in a soft burger bun with fresh lettuce, onion, creamy mayo, and signature sauces. Crispy outside, soft inside, full of street-style flavor.",
    price: 79,
    emoji: "🍔",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/357c5f36e85b6d02babe221b37d3d1e2-ea39732c.png",
    categoryId: "burgers",
    diet: "veg",
  },
  {
    id: "bl-cheese-aloo-tikki-burger",
    name: "Cheese Aloo Tikki Burger",
    description: "Classic aloo tikki burger made extra tasty with a slice of creamy cheese, fresh veggies, mayo, and flavorful sauces inside a soft toasted bun.",
    price: 89,
    emoji: "🍔",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/462cd0f1ff649c4e6387ad4c3bf69e0c-fb420311.png",
    categoryId: "burgers",
    diet: "veg",
  },
  {
    id: "bl-egg-burger",
    name: "Egg Burger",
    description: "A delicious egg burger made with a fresh egg layer, soft bun, crunchy veggies, creamy mayo, and flavorful sauces. A perfect quick bite for egg lovers.",
    price: 69,
    emoji: "🍔",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/f4f8c1678ccab3923e89d0a378d5369a-1efbb7c2.png",
    categoryId: "burgers",
    diet: "egg",
  },
  {
    id: "bl-classic-chicken-burger",
    name: "Classic Chicken Burger",
    description: "A loaded burger with chicken filling, creamy mayo, fresh veggies, and bold sauces packed inside a soft bun. Made for chicken lovers with peak satisfaction.",
    price: 119,
    emoji: "🍔",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/6655b6a86c1af80b2e00bdb99403c4b2-5c1d2937.jpg",
    categoryId: "burgers",
    diet: "non-veg",
  },
  {
    id: "bl-chicken-cheese-burger",
    name: "Chicken Cheese Burger",
    description: "A crispy chicken patty topped with creamy cheese, fresh veggies, mayo, and signature sauces inside a soft toasted bun. Cheesy, juicy, and satisfying.",
    price: 139,
    emoji: "🍔",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/931282e1c4000e1d7a7a32eef4af3a6b-0fea7b08.jpg",
    categoryId: "burgers",
    diet: "non-veg",
    bestseller: true,
  },
  {
    id: "bl-double-chicken-burger",
    name: "Double Chicken Burger",
    description: "A loaded burger with double chicken filling, creamy mayo, fresh veggies, and bold sauces packed inside a soft bun. Made for heavy hunger and serious chicken lovers.",
    price: 159,
    emoji: "🍔",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/594503e7dd884c93b3cd0442c064c305-fb99208e.jpg",
    categoryId: "burgers",
    diet: "non-veg",
    spicy: true,
  },

  // ── SANDWICHES ────────────────────────────────────────────────────────────
  {
    id: "bl-veg-grilled-sandwich",
    name: "Veg Grilled Sandwich",
    description: "Fresh vegetables layered with creamy mayo and flavorful sauce, grilled between soft bread slices for a warm, tasty, and satisfying bite.",
    price: 79,
    emoji: "🥪",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/0c1c274c99ddffec345f3cfcc4211a1f-254d643d.png",
    categoryId: "sandwiches",
    diet: "veg",
    bestseller: true,
  },
  {
    id: "bl-cheese-corn-sandwich",
    name: "Cheese Corn Sandwich",
    description: "Sweet corn mixed with creamy cheese and mayo, grilled between soft bread slices for a rich, cheesy, and comforting snack.",
    price: 99,
    emoji: "🥪",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/d869d610f6e0cc28b350c3d7859a7505-96fe0acc.png",
    categoryId: "sandwiches",
    diet: "veg",
  },
  {
    id: "bl-chicken-grilled-sandwich",
    name: "Chicken Grilled Sandwich",
    description: "Juicy chicken filling with fresh veggies, creamy mayo, and signature sauce, grilled between soft bread slices for a warm and filling snack.",
    price: 139,
    emoji: "🥪",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/6bea1899b2ebd16cf673bdb7920085e2-e0424561.png",
    categoryId: "sandwiches",
    diet: "non-veg",
  },

  // ── ROLLS ─────────────────────────────────────────────────────────────────
  {
    id: "bl-egg-roll",
    name: "Egg Roll",
    description: "Fresh egg layered inside a soft paratha with crunchy onion, creamy mayo, and chatpata sauces. A quick, filling roll for everyday cravings.",
    price: 69,
    emoji: "🌯",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/b618e9dfbe6bd71d3aba36e5c9441566-362c3c90.png",
    categoryId: "rolls",
    diet: "egg",
  },
  {
    id: "bl-double-egg-roll",
    name: "Double Egg Roll",
    description: "A soft roll filled with two freshly cooked eggs, seasoned and wrapped for a satisfying and filling meal.",
    price: 79,
    emoji: "🌯",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/b618e9dfbe6bd71d3aba36e5c9441566-362c3c90.png",
    categoryId: "rolls",
    diet: "egg",
  },
  {
    id: "bl-paneer-roll",
    name: "Paneer Roll",
    description: "Soft paneer pieces wrapped in a fresh paratha with onion, mayo, and spicy tangy sauces. A tasty veg roll packed with desi-style flavor.",
    price: 99,
    emoji: "🌯",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/b85b09433e563a553dcda55ba2d48809-ef273f6a.png",
    categoryId: "rolls",
    diet: "veg",
  },
  {
    id: "bl-special-egg-chicken-roll",
    name: "Special Egg Chicken Roll",
    description: "Tasty chicken filling wrapped in a soft egg paratha with crunchy onion, creamy mayonnaise, and spicy sauces. A satisfying roll for chicken lovers.",
    price: 139,
    emoji: "🌯",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/7c1d6342603039279a6bcc5a6cd0b99a-d2e4bfb1.jpg",
    categoryId: "rolls",
    diet: "non-veg",
    spicy: true,
  },
  {
    id: "bl-chicken-cheese-roll",
    name: "Chicken Cheese Roll",
    description: "Juicy chicken filling with creamy cheese, onion, mayo, and bold sauces wrapped in a soft paratha. Cheesy, spicy, and filling.",
    price: 159,
    emoji: "🌯",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/fd296b8026a41191149d94f4b121b747-60328aed.jpg",
    categoryId: "rolls",
    diet: "non-veg",
    bestseller: true,
    spicy: true,
  },

  // ── SNACKS / FRIES ────────────────────────────────────────────────────────
  {
    id: "bl-classic-fries",
    name: "Classic Fries",
    description: "Crispy golden fries, lightly salted and served hot. A simple, crunchy snack perfect for any craving.",
    price: 59,
    emoji: "🍟",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/1ea36e028d1056244cea461d5f270d9f-1e70e579.png",
    categoryId: "fries",
    diet: "veg",
  },
  {
    id: "bl-chilli-potato-fries",
    name: "Chilli Potato Fries",
    description: "Crispy fries tossed in a spicy chilli-style sauce with a bold and tangy flavor. A perfect snack for spicy cravings.",
    price: 69,
    emoji: "🍟",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/2d2b0c15f0697d42c9978b877b5e3ed3-917e4135.png",
    categoryId: "fries",
    diet: "veg",
    spicy: true,
    bestseller: true,
  },
  {
    id: "bl-peri-peri-fries",
    name: "Peri Peri Fries",
    description: "Crispy golden fries tossed with spicy peri peri seasoning for a bold, chatpata flavor. Perfect for spice lovers.",
    price: 79,
    emoji: "🍟",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/180b856e70dffa432ebcfd47c3961056-76151efb.png",
    categoryId: "fries",
    diet: "veg",
    spicy: true,
  },

  // ── MAGGI ─────────────────────────────────────────────────────────────────
  {
    id: "bl-masala-maggi",
    name: "Masala Maggi",
    description: "Classic masala Maggi cooked with flavorful spices for that comforting, chatpata taste. A quick and satisfying choice for light hunger cravings.",
    price: 59,
    emoji: "🍜",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/89ab6ec6d2f308395e4693f991c0f153-bff50cd3.jpg",
    categoryId: "maggi",
    diet: "veg",
  },
  {
    id: "bl-veg-maggi",
    name: "Veg Maggi",
    description: "Classic Maggi tossed with fresh vegetables and masala spices for a tasty, colorful, and filling snack. Perfect for a quick veg craving.",
    price: 69,
    emoji: "🍜",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/dd6dfddb56e4b0c5b877244f14bc7859-d2afd655.jpg",
    categoryId: "maggi",
    diet: "veg",
  },
  {
    id: "bl-cheese-maggi",
    name: "Cheese Maggi",
    description: "Hot masala Maggi loaded with creamy cheese for a rich, cheesy, and comforting bite. Perfect when you want something simple but extra tasty.",
    price: 99,
    emoji: "🍜",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/39f106a7502b840df964e0b40c9271f2-8e86c6db.png",
    categoryId: "maggi",
    diet: "veg",
    bestseller: true,
  },

  // ── BEVERAGES ─────────────────────────────────────────────────────────────
  {
    id: "bl-masala-cold-beverage",
    name: "Masala Cold Beverage",
    description: "Refreshing 250ml fizzy drink with tangy Indian masala, perfectly chilled for a bold and refreshing taste.",
    price: 49,
    emoji: "🧃",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/e76de02fbf511849f09214eabbb25dac-60567a8a.jpg",
    categoryId: "drinks",
    diet: "veg",
  },
  {
    id: "bl-fresh-lime-soda",
    name: "Mixed Fresh Lime Soda",
    description: "Freshly pressed lime juice with a balanced sweet and salty twist, charged with sparkling soda to beat the heat. [250 ml]",
    price: 59,
    emoji: "🍋",
    image: "https://bhooklagi.b-cdn.net/bunny-image-seed/78d0f5c66690dde9ea27d8f83e3e05dc-e33d471a.jpg",
    categoryId: "drinks",
    diet: "veg",
    bestseller: true,
  },
];

export function getItemsByCategory(categoryId: MenuCategoryId) {
  return menuItems.filter((m) => m.categoryId === categoryId);
}

export function formatInr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export const startingPrices: {
  categoryId: MenuCategoryId;
  emoji: string;
  label: string;
  from: number;
}[] = [
  { categoryId: "meals",      emoji: "🍱", label: "Combo Meals", from: 129 },
  { categoryId: "burgers",    emoji: "🍔", label: "Burgers",    from: 69 },
  { categoryId: "rolls",      emoji: "🌯", label: "Rolls",      from: 69 },
  { categoryId: "maggi",      emoji: "🍜", label: "Maggi",      from: 59 },
  { categoryId: "fries",      emoji: "🍟", label: "Snacks",     from: 59 },
  { categoryId: "sandwiches", emoji: "🥪", label: "Sandwiches", from: 79 },
  { categoryId: "drinks",     emoji: "🧃", label: "Beverages",  from: 49 },
];
