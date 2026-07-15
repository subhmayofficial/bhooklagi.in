"use client";

import { HomeCategoryShowcase } from "@/components/home/HomeCategoryShowcase";
import { OffersCarousel } from "@/components/home/OffersCarousel";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { CombosSection } from "@/components/home/CombosSection";
import { TrustSection } from "@/components/home/TrustSection";
import { PromoCta } from "@/components/home/PromoCta";

export function HomeSectionsClient() {
  return (
    <>
      <HomeCategoryShowcase />
      <OffersCarousel />
      <FeaturedSection />
      <CombosSection />
      <TrustSection />
      <PromoCta />
    </>
  );
}
