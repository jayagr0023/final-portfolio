import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { SkillsSection } from "@/components/SkillsSection";
import { ContactSection } from "@/components/ContactSection";

export default function Home() {
  return (
    <div className="relative">
      <Navigation />
      <HeroSection />
      <SkillsSection />
      <ContactSection />
    </div>
  );
}
