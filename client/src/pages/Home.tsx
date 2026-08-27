import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { SkillsSection } from "@/components/SkillsSection";
import { ContactSection } from "@/components/ContactSection";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import Projects from "./Projects";
import Resume from "./Resume";

export default function Home() {
  const handleHomeButtonNavigate = () => {
    sessionStorage.setItem("homeScrollY", String(window.scrollY));
    sessionStorage.setItem("restoreHomeScroll", "1");
  };

  return (
    <div className="relative lg:flex lg:flex-col">
      <Navigation />
      <div className="lg:order-1">
        <HeroSection />
      </div>

      <div className="lg:order-4">
        <SkillsSection />
      </div>

      <div id="projects" className="hidden lg:order-2 lg:block">
        <Projects showNavigation={false} />
      </div>

      <div className="lg:hidden w-full px-10 py-2 bg-background/50 text-center animate-pulse">
        <Link href="/projects">
          <Button
            className="w-full text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50 active:scale-95"
            variant="default"
            data-testid="mobile-nav-projects"
            onClick={handleHomeButtonNavigate}
          >
            <ExternalLink className="h-4 w-4 mr-2 animate-bounce" />
            View Projects
          </Button>
        </Link>
      </div>

      <div className="hidden lg:order-3 lg:block">
        <Resume showNavigation={false} />
      </div>

      <div
        className="lg:hidden w-full px-10 py-2 bg-background/50 text-center animate-pulse"
        style={{ animationDelay: "0.3s" }}
      >
        <Link href="/resume">
          <Button
            className="w-full text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50 active:scale-95"
            variant="default"
            data-testid="mobile-nav-resume"
            onClick={handleHomeButtonNavigate}
          >
            <ExternalLink
              className="h-4 w-4 mr-2 animate-bounce"
              style={{ animationDelay: "0.3s" }}
            />
            View Resume
          </Button>
        </Link>
      </div>

      <div className="lg:order-5">
        <ContactSection />
      </div>
    </div>
  );
}
