import Image from "next/image";
import HeroSection from "./_components/heroSection";
import PowerdByAI from "./_components/powerdByAI";
import Effortless from "./_components/effortless";

export default function Home() {
  return (
    <main className="flex flex-col gap-4 md:gap-8 xl:gap-12">
      <HeroSection />
      <PowerdByAI />
      <Effortless />
    </main>
  );
}
