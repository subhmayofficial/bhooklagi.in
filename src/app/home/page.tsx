import { SiteFooter } from "@/components/layout/SiteFooter";
import { AppHomeHero } from "@/components/home/AppHomeHero";
import { FoodMarquee } from "@/components/home/FoodMarquee";
import { HomeCategoryShowcase } from "@/components/home/HomeCategoryShowcase";
import { OffersRail } from "@/components/home/OffersRail";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { CombosSection } from "@/components/home/CombosSection";
import { TrustSection } from "@/components/home/TrustSection";
import { PromoCta } from "@/components/home/PromoCta";

export default function AppHomePage() {
  return (
    <>
      <AppHomeHero />
      <FoodMarquee />
      <HomeCategoryShowcase />
      <OffersRail />
      <FeaturedSection />
      <CombosSection />
      <TrustSection />
      <PromoCta />
      <SiteFooter />
    </>
  );
}
