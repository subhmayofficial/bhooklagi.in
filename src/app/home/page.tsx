import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AppHomeHero } from "@/components/home/AppHomeHero";
import { HomeCategoryShowcase } from "@/components/home/HomeCategoryShowcase";
import { OffersRail } from "@/components/home/OffersRail";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { PriceBands } from "@/components/home/PriceBands";
import { TrustSection } from "@/components/home/TrustSection";
import { PromoCta } from "@/components/home/PromoCta";

export default function AppHomePage() {
  return (
    <>
      <SiteHeader />
      <AppHomeHero />
      <HomeCategoryShowcase />
      <OffersRail />
      <FeaturedSection />
      <PriceBands />
      <TrustSection />
      <PromoCta />
      <SiteFooter />
    </>
  );
}
