import type { Metadata } from "next";
import AppHomePage from "@/app/home/page";

export const metadata: Metadata = {
  title: {
    absolute: "Bhook Lagi Food Delivery in Deoghar | Order Burgers, Rolls & Maggi",
  },
  description:
    "Order fresh burgers, rolls, maggi, fries, sandwiches, drinks, and combo meals from Bhook Lagi in Deoghar with fast local delivery.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <AppHomePage />;
}
