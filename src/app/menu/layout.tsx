import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Menu - Order Burgers, Rolls, Maggi & Chinese in Deoghar",
  description:
    "Explore the Bhook Lagi menu in Deoghar: burgers, rolls, maggi, fries, sandwiches, Chinese snacks, combos, and drinks with fast local delivery.",
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    url: "/menu",
    title: "Bhook Lagi? Menu | Food Delivery in Deoghar",
    description: "Order burgers, rolls, maggi, fries, Chinese snacks, combos, and drinks online in Deoghar.",
  },
};

export default function MenuLayout({ children }: { children: ReactNode }) {
  return children;
}
