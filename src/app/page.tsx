import { SiteHeader } from "@/components/layout/SiteHeader";
import { HeroSection } from "@/components/home/HeroSection";
import { FoodMarquee } from "@/components/home/FoodMarquee";
import { OffersRail } from "@/components/home/OffersRail";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { PriceBands } from "@/components/home/PriceBands";
import { TrustSection } from "@/components/home/TrustSection";
import { PromoCta } from "@/components/home/PromoCta";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <HeroSection />
      <FoodMarquee />
      <OffersRail />
      <CategoriesSection />
      <FeaturedSection />
      <PriceBands />
      <TrustSection />
      <PromoCta />
      <SiteFooter />
    </>
  );
}
