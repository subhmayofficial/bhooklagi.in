import { SiteFooter } from "@/components/layout/SiteFooter";
import { AppHomeHero } from "@/components/home/AppHomeHero";
import { FoodMarquee } from "@/components/home/FoodMarquee";
import { LazyHomeSections } from "@/components/home/LazyHomeSections";

export default function AppHomePage() {
  return (
    <>
      <AppHomeHero />
      <FoodMarquee />
      <LazyHomeSections />
      <SiteFooter />
    </>
  );
}
