import type { HomePageData } from "../model/types";
import { FeaturesSection } from "./sections/FeaturesSection";
import { HeroSection } from "./sections/HeroSection";
import { HomeFooter } from "./sections/HomeFooter";
import { IconicPressingsSection } from "./sections/IconicPressingsSection";
import { RecentSpinsSection } from "./sections/RecentSpinsSection";

export function HomePageView({ assets, albums, activities, features }: HomePageData) {
  return (
    <div className="min-h-screen bg-[#131313] text-white font-sans">
      <HeroSection heroSrc={assets.hero} />
      <FeaturesSection features={features} />
      <IconicPressingsSection albums={albums} starSrc={assets.star} />
      <RecentSpinsSection activities={activities} assets={assets} />
      <HomeFooter />
    </div>
  );
}
