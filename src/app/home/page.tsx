import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AppHomeHero } from "@/components/home/AppHomeHero";
import { FoodMarquee } from "@/components/home/FoodMarquee";
import { HomeSeoContent } from "@/components/home/HomeSeoContent";
import { LazyHomeSections } from "@/components/home/LazyHomeSections";

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

export default function AppHomePage() {
  return (
    <>
      <AppHomeHero />
      <FoodMarquee />
      <HomeSeoContent />
      <LazyHomeSections />
      <SiteFooter />
    </>
  );
}
