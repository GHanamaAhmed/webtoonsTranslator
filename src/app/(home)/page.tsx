import HeroSection from "./_components/heroSection";
import PowerdByAI from "./_components/powerdByAI";
import Effortless from "./_components/effortless";
import Pricing from "./_components/pricing";
import FAQ from "./_components/faq";
import { Suspense } from "react";
import Complex from "./_components/complex";

export default function Home() {
  return (
    <main className="flex flex-col gap-4 md:gap-8 xl:gap-12">
      <HeroSection />
      <PowerdByAI />
      <Complex />
      <Suspense fallback={<></>}>
        <Pricing />
      </Suspense>
      <FAQ />
    </main>
  );
}
