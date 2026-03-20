import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const professions = [
  "Software Engineer",
  "UI/UX Designer",
  "Creative Developer",
  "Problem Solver",
];

export function HeroSection() {
  const [currentProfession, setCurrentProfession] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const profession = professions[currentProfession];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < profession.length) {
            setDisplayText(profession.substring(0, displayText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.substring(0, displayText.length - 1));
          } else {
            setIsDeleting(false);
            setCurrentProfession((prev) => (prev + 1) % professions.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentProfession]);

  const handleScroll = () => {
    const element = document.querySelector("#about");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="min-h-screen relative flex items-center justify-center overflow-hidden pt-16"
      data-testid="section-home"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <p className="text-primary text-lg font-medium" data-testid="text-greeting">
                Hello! I Am <span className="text-accent">Ibrahim Memon</span>
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight" data-testid="text-hero-title">
                A Designer who
              </h1>
              <div className="flex items-center gap-4">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold" data-testid="text-hook">
                  Judges a book
                </h2>
              </div>
              <div className="flex items-baseline gap-3">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">by its</h2>
                <span className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text" data-testid="text-cover">
                  Cover
                </span>
                <span className="text-accent text-5xl">.</span>
              </div>
              <p className="text-muted-foreground text-sm italic mt-2" data-testid="text-subtitle">
                Because the cover does not impress you, what else can?
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl md:text-3xl font-semibold" data-testid="text-profession-label">
                I'm a <span className="gradient-text">{displayText}</span>
                <span className="animate-pulse">|</span>
              </h3>
              <p className="text-muted-foreground text-base" data-testid="text-current-role">
                Currently, I'm a Software Engineer at <span className="text-primary font-medium">Facebook</span>.
              </p>
            </div>

            <div className="pt-4">
              <blockquote className="text-xl md:text-2xl italic font-light text-muted-foreground border-l-4 border-primary pl-6" data-testid="quote-hero">
                "Design is not just what it looks like and feels like. Design is how it works."
                <footer className="text-sm font-normal text-muted-foreground/80 mt-2 not-italic">
                  — Steve Jobs
                </footer>
              </blockquote>
            </div>

            <div className="flex gap-4 pt-4">
              <Button size="lg" onClick={handleScroll} data-testid="button-learn-more">
                Learn More
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const element = document.querySelector("#contact");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                data-testid="button-get-in-touch"
              >
                Get in Touch
              </Button>
            </div>
          </div>

          <div className="relative flex items-center justify-center" data-testid="hero-illustration">
            <div className="absolute inset-0 glow-purple animate-float" />
            <div className="relative z-10 w-full max-w-md aspect-square flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse-slow" />
              <div className="relative w-64 h-64 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl">
                <div className="w-56 h-56 bg-background rounded-full flex items-center justify-center border-4 border-primary/30">
                  <svg className="w-32 h-32 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleScroll}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce p-2 rounded-full"
        data-testid="button-scroll-down"
      >
        <ArrowDown className="w-6 h-6 text-primary" />
      </button>
    </section>
  );
}
