import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { SkillsSection } from "@/components/SkillsSection";
import { ContactSection } from "@/components/ContactSection";

export default function Home() {
  return (
    <div className="relative">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ContactSection />
    </div>
  );
}
