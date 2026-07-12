import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Account, Wallet & Saved Addresses",
  description:
    "Manage your Bhook Lagi account, wallet, saved delivery addresses, and food ordering profile for Deoghar delivery.",
  alternates: {
    canonical: "/account",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children;
}
