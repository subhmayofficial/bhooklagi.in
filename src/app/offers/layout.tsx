import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Offers & Food Deals in Deoghar",
  description:
    "Find Bhook Lagi offers, combo deals, and food delivery discounts for burgers, rolls, maggi, Chinese snacks, and more in Deoghar.",
  alternates: {
    canonical: "/offers",
  },
  openGraph: {
    url: "/offers",
    title: "Bhook Lagi? Offers | Food Deals in Deoghar",
    description: "Browse current Bhook Lagi food offers and combo deals for Deoghar delivery.",
  },
};

export default function OffersLayout({ children }: { children: ReactNode }) {
  return children;
}
