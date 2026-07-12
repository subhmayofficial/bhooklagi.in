import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cart & Checkout",
  description:
    "Review your Bhook Lagi cart, apply food offers, choose COD or online payment, and place your Deoghar food delivery order.",
  alternates: {
    canonical: "/cart",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartLayout({ children }: { children: ReactNode }) {
  return children;
}
