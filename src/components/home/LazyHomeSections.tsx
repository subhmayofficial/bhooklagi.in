"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HomeCategoryShowcase = dynamic(() =>
  import("@/components/home/HomeCategoryShowcase").then((mod) => mod.HomeCategoryShowcase),
  { ssr: false },
);
const OffersCarousel = dynamic(() =>
  import("@/components/home/OffersCarousel").then((mod) => mod.OffersCarousel),
  { ssr: false },
);
const FeaturedSection = dynamic(() =>
  import("@/components/home/FeaturedSection").then((mod) => mod.FeaturedSection),
  { ssr: false },
);
const CombosSection = dynamic(() =>
  import("@/components/home/CombosSection").then((mod) => mod.CombosSection),
  { ssr: false },
);
const TrustSection = dynamic(() =>
  import("@/components/home/TrustSection").then((mod) => mod.TrustSection),
  { ssr: false },
);
const PromoCta = dynamic(() =>
  import("@/components/home/PromoCta").then((mod) => mod.PromoCta),
  { ssr: false },
);

export function LazyHomeSections() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) return null;

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
