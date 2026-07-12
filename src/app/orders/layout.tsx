import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "My Orders & Live Tracking",
  description:
    "Track Bhook Lagi orders, view delivery status, repeat past orders, and pay securely online for Deoghar food delivery.",
  alternates: {
    canonical: "/orders",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return children;
}
