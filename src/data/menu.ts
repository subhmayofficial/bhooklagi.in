export type MenuCategoryId =
  | "burgers"
  | "rolls"
  | "maggi"
  | "chinese"
  | "pasta"
  | "fries"
  | "sandwiches"
  | "drinks";

export type DietTag = "veg" | "egg" | "non-veg";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  categoryId: MenuCategoryId;
  diet?: DietTag;
  spicy?: boolean;
  bestseller?: boolean;
};

export const categories: {
  id: MenuCategoryId;
  label: string;
  emoji: string;
  blurb: string;
}[] = [
  { id: "burgers",    label: "Burgers",     emoji: "🍔", blurb: "Juicy stacks & sauces" },
  { id: "rolls",      label: "Rolls",       emoji: "🌯", blurb: "Street-style wraps" },
  { id: "maggi",      label: "Maggi",       emoji: "🍜", blurb: "Masala moods" },
  { id: "chinese",    label: "Chinese",     emoji: "🥡", blurb: "Indo-Chinese hits" },
  { id: "pasta",      label: "Pasta",       emoji: "🍝", blurb: "Cheesy comfort" },
  { id: "fries",      label: "Fries",       emoji: "🍟", blurb: "Crispy sides" },
  { id: "sandwiches", label: "Sandwiches",  emoji: "🥪", blurb: "Grilled & loaded" },
  { id: "drinks",     label: "Drinks",      emoji: "🧃", blurb: "Chill sips" },
];

export const menuItems: MenuItem[] = [
  // ── BURGERS ──────────────────────────────────────────────────────────────
  {
    id: "bl-classic-burger",
    name: "Classic Blaze Burger",
    description: "Double patty, secret sauce, caramelised onions, crispy lettuce.",
    price: 149,
    emoji: "🍔",
    categoryId: "burgers",
    diet: "non-veg",
    bestseller: true,
    spicy: true,
  },
  {
    id: "bl-paneer-burger",
    name: "Paneer Tikka Burger",
    description: "Grilled paneer tikka, mint chutney, crunchy onions.",
    price: 129,
    emoji: "🍔",
    categoryId: "burgers",
    diet: "veg",
    bestseller: true,
  },
  {
    id: "bl-veg-crunch-burger",
    name: "Veg Crunch Burger",
    description: "Crispy veg patty, tangy sauce, fresh lettuce.",
    price: 99,
    emoji: "🍔",
    categoryId: "burgers",
    diet: "veg",
  },
  {
    id: "bl-double-trouble",
    name: "Double Trouble Burger",
    description: "Two patties, double cheese, extra sauce — for the hungry.",
    price: 199,
    emoji: "🍔",
    categoryId: "burgers",
    diet: "non-veg",
    spicy: true,
  },
  {
    id: "bl-aloo-burger",
    name: "Aloo Tikki Burger",
    description: "Spiced potato patty, green chutney, pickled onions.",
    price: 79,
    emoji: "🍔",
    categoryId: "burgers",
    diet: "veg",
  },

  // ── ROLLS ─────────────────────────────────────────────────────────────────
  {
    id: "bl-crunch-roll",
    name: "Crunch Kolkata Roll",
    description: "Egg wrap, crispy chicken, tangy mustard — street classic.",
    price: 119,
    emoji: "🌯",
    categoryId: "rolls",
    diet: "egg",
    bestseller: true,
  },
  {
    id: "bl-paneer-roll",
    name: "Paneer Tikka Roll",
    description: "Grilled paneer, peppers, onions, special sauce.",
    price: 109,
    emoji: "🌯",
    categoryId: "rolls",
    diet: "veg",
    bestseller: true,
  },
  {
    id: "bl-chicken-roll",
    name: "Chicken Masala Roll",
    description: "Spiced chicken, caramelised onions, green chutney.",
    price: 129,
    emoji: "🌯",
    categoryId: "rolls",
    diet: "non-veg",
    spicy: true,
  },
  {
    id: "bl-veg-mayo-roll",
    name: "Veg Mayo Roll",
    description: "Crispy veggies, creamy mayo, tangy masala.",
    price: 89,
    emoji: "🌯",
    categoryId: "rolls",
    diet: "veg",
  },
  {
    id: "bl-egg-roll",
    name: "Double Egg Roll",
    description: "Two eggs, onion, chilli, house masala.",
    price: 99,
    emoji: "🌯",
    categoryId: "rolls",
    diet: "egg",
  },

  // ── MAGGI ─────────────────────────────────────────────────────────────────
  {
    id: "bl-maggi-cheese",
    name: "Cheese Burst Maggi",
    description: "Maggi loaded with melted cheese & chilli flakes.",
    price: 89,
    emoji: "🍜",
    categoryId: "maggi",
    diet: "veg",
    spicy: true,
    bestseller: true,
  },
  {
    id: "bl-masala-maggi",
    name: "Classic Masala Maggi",
    description: "Simple, perfect, always hits — the OG.",
    price: 59,
    emoji: "🍜",
    categoryId: "maggi",
    diet: "veg",
  },
  {
    id: "bl-veggie-maggi",
    name: "Loaded Veggie Maggi",
    description: "Seasonal veggies, butter, dash of lime.",
    price: 79,
    emoji: "🍜",
    categoryId: "maggi",
    diet: "veg",
  },
  {
    id: "bl-egg-maggi",
    name: "Egg Maggi",
    description: "Maggi with scrambled egg topping, extra masala.",
    price: 89,
    emoji: "🍜",
    categoryId: "maggi",
    diet: "egg",
  },

  // ── CHINESE ──────────────────────────────────────────────────────────────
  {
    id: "bl-hakka-noodles",
    name: "Veg Hakka Noodles",
    description: "Wok-tossed noodles, crunchy veggies, smoky finish.",
    price: 129,
    emoji: "🥡",
    categoryId: "chinese",
    diet: "veg",
    bestseller: true,
  },
  {
    id: "bl-fried-rice",
    name: "Veg Fried Rice",
    description: "Wok-tossed rice, seasonal veggies, soy goodness.",
    price: 129,
    emoji: "🥡",
    categoryId: "chinese",
    diet: "veg",
  },
  {
    id: "bl-manchurian",
    name: "Manchurian (Dry)",
    description: "Crispy veg balls tossed in spicy manchurian sauce.",
    price: 149,
    emoji: "🥡",
    categoryId: "chinese",
    diet: "veg",
    spicy: true,
  },
  {
    id: "bl-chilli-paneer",
    name: "Chilli Paneer",
    description: "Crispy paneer, bell peppers, Chinese spices.",
    price: 169,
    emoji: "🥡",
    categoryId: "chinese",
    diet: "veg",
    spicy: true,
  },
  {
    id: "bl-chicken-noodles",
    name: "Chicken Hakka Noodles",
    description: "Spicy wok noodles with juicy chicken strips.",
    price: 159,
    emoji: "🥡",
    categoryId: "chinese",
    diet: "non-veg",
    spicy: true,
  },

  // ── PASTA ─────────────────────────────────────────────────────────────────
  {
    id: "bl-pasta-alfredo",
    name: "Alfredo Pasta",
    description: "Creamy white sauce, herbs, parmesan kiss.",
    price: 159,
    emoji: "🍝",
    categoryId: "pasta",
    diet: "veg",
    bestseller: true,
  },
  {
    id: "bl-arrabbiata",
    name: "Arrabbiata Pasta",
    description: "Spicy tomato sauce, garlic, red chilli flakes.",
    price: 149,
    emoji: "🍝",
    categoryId: "pasta",
    diet: "veg",
    spicy: true,
  },
  {
    id: "bl-pesto-pasta",
    name: "Pesto Pasta",
    description: "Basil pesto, cherry tomatoes, olive oil.",
    price: 169,
    emoji: "🍝",
    categoryId: "pasta",
    diet: "veg",
  },

  // ── FRIES ─────────────────────────────────────────────────────────────────
  {
    id: "bl-peri-fries",
    name: "Peri Peri Fries",
    description: "Shoestring fries, peri spice, lime zest.",
    price: 99,
    emoji: "🍟",
    categoryId: "fries",
    diet: "veg",
    spicy: true,
    bestseller: true,
  },
  {
    id: "bl-classic-fries",
    name: "Classic Salted Fries",
    description: "Golden, crispy, perfectly salted.",
    price: 69,
    emoji: "🍟",
    categoryId: "fries",
    diet: "veg",
  },
  {
    id: "bl-cheese-fries",
    name: "Loaded Cheese Fries",
    description: "Fries drowning in creamy cheese sauce.",
    price: 119,
    emoji: "🍟",
    categoryId: "fries",
    diet: "veg",
  },
  {
    id: "bl-masala-fries",
    name: "Desi Masala Fries",
    description: "Chaat masala, amchur, coriander — desi twist.",
    price: 89,
    emoji: "🍟",
    categoryId: "fries",
    diet: "veg",
    spicy: true,
  },

  // ── SANDWICHES ────────────────────────────────────────────────────────────
  {
    id: "bl-grill-sandwich",
    name: "Grilled Cheese Supreme",
    description: "Triple cheese, jalapeños, toasted to perfection.",
    price: 109,
    emoji: "🥪",
    categoryId: "sandwiches",
    diet: "veg",
    bestseller: true,
  },
  {
    id: "bl-veggie-club",
    name: "Veggie Club Sandwich",
    description: "Layered veggies, cheese, tomato, mayo.",
    price: 99,
    emoji: "🥪",
    categoryId: "sandwiches",
    diet: "veg",
  },
  {
    id: "bl-bombay-sandwich",
    name: "Bombay Masala Sandwich",
    description: "Classic Bombay-style with green chutney & potato.",
    price: 89,
    emoji: "🥪",
    categoryId: "sandwiches",
    diet: "veg",
  },
  {
    id: "bl-chicken-club",
    name: "Chicken Club Sandwich",
    description: "Grilled chicken, bacon-style strip, lettuce.",
    price: 139,
    emoji: "🥪",
    categoryId: "sandwiches",
    diet: "non-veg",
  },

  // ── DRINKS ────────────────────────────────────────────────────────────────
  {
    id: "bl-mocktail",
    name: "Passion Fruit Cooler",
    description: "Chilled, tangy, perfect with spice.",
    price: 79,
    emoji: "🧃",
    categoryId: "drinks",
    diet: "veg",
  },
  {
    id: "bl-cold-coffee",
    name: "Cold Coffee",
    description: "Thick, creamy, perfectly sweet — always hits.",
    price: 89,
    emoji: "☕",
    categoryId: "drinks",
    diet: "veg",
    bestseller: true,
  },
  {
    id: "bl-mango-shake",
    name: "Mango Shake",
    description: "Fresh mango bliss in a glass.",
    price: 99,
    emoji: "🥭",
    categoryId: "drinks",
    diet: "veg",
  },
  {
    id: "bl-chaas",
    name: "Masala Chaas",
    description: "Chilled spiced buttermilk — summer special.",
    price: 49,
    emoji: "🥛",
    categoryId: "drinks",
    diet: "veg",
  },
  {
    id: "bl-lemonade",
    name: "Nimbu Soda",
    description: "Freshly squeezed lime, soda, black salt.",
    price: 59,
    emoji: "🍋",
    categoryId: "drinks",
    diet: "veg",
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
  { categoryId: "burgers",    emoji: "🍔", label: "Burgers",    from: 79 },
  { categoryId: "rolls",      emoji: "🌯", label: "Rolls",      from: 89 },
  { categoryId: "maggi",      emoji: "🍜", label: "Maggi",      from: 59 },
  { categoryId: "chinese",    emoji: "🥡", label: "Chinese",    from: 129 },
  { categoryId: "pasta",      emoji: "🍝", label: "Pasta",      from: 149 },
  { categoryId: "fries",      emoji: "🍟", label: "Fries",      from: 69 },
  { categoryId: "sandwiches", emoji: "🥪", label: "Sandwiches", from: 89 },
  { categoryId: "drinks",     emoji: "🧃", label: "Drinks",     from: 49 },
];
