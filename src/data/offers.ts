export type OfferCard = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  accent: "orange" | "gold" | "dark";
  href?: string;
};

export const offers: OfferCard[] = [
  {
    id: "first-order",
    title: "Flat ₹80 off",
    subtitle: "First order on the app — min ₹299",
    badge: "NEW USER",
    accent: "orange",
  },
  {
    id: "evening",
    title: "Evening Mood",
    subtitle: "Free salted fries after 7 PM — min ₹199",
    badge: "7PM — 11PM",
    accent: "gold",
  },
  {
    id: "combo",
    title: "Combo Rush",
    subtitle: "Burger + drink @ ₹199 — limited slots",
    badge: "COMBO",
    accent: "dark",
  },
  {
    id: "upi",
    title: "UPI cashback",
    subtitle: "Extra ₹20 off with selected UPI apps",
    badge: "PAYMENTS",
    accent: "orange",
  },
];
