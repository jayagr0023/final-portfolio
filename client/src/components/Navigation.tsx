import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
// import { ThemeToggle } from "@/components/ThemeToggle";
import { useLocation } from "wouter";

const navLinks = [
  { name: "Home", href: "#home", mobileName: "Home", mobileHref: "/" },
  {
    name: "Projects",
    href: "#projects",
    mobileName: "Projects",
    mobileHref: "/projects",
  },
  { name: "Resume", href: "#resume", mobileName: "About", mobileHref: "/resume" },
  {
    name: "Achievements",
    href: "#achievement",
    mobileName: "About",
    mobileHref: "/resume",
    desktopOnly: true,
  },
  { name: "Skills", href: "#skills", mobileName: "Skills", mobileHref: "#skills" },
  { name: "Contact", href: "#contact", mobileName: "Contact", mobileHref: "#contact" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      if (location === "/") {
        const sections = [
          "home",
          "projects",
          "resume",
          "achievement",
          "skills",
          "contact",
        ];
        const current = sections.find((section) => {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            return rect.top <= 100 && rect.bottom >= 100;
          }
          return false;
        });
        if (current) {
          setActiveSection(current);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  const handleClick = (link: (typeof navLinks)[0]) => {
    setIsMobileMenuOpen(false);

    const element = document.querySelector(link.href);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const isActive = (link: (typeof navLinks)[0]) => {
    if (location !== "/" && link.mobileHref.startsWith("/")) {
      return location === link.mobileHref;
    }
    return activeSection === link.href.substring(1);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
      data-testid="nav-header"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <a
            href="#home"
            className="text-xl lg:font-bold gradient-text"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("home")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            data-testid="link-logo"
          >
            Jay Agrawal
          </a>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick(link);
                  }}
                  className={`text-sm font-medium transition-all duration-300 relative group ${
                    isActive(link)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`link-${link.name.toLowerCase()}`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 ${
                      isActive(link) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </a>
              ),
            )}

            {/* <ThemeToggle /> */}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {/* <ThemeToggle /> */}
            <Button
              size="icon"
              variant="ghost"
              className="overflow-visible"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-menu-toggle"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-md border-b border-border animate-slide-up">
          <div className="px-6 py-4 space-y-3">
            {navLinks.filter((link) => !link.desktopOnly).map((link) => (
                <a
                  key={link.name}
                  href={link.mobileHref}
                  onClick={(e) => {
                    if (!link.mobileHref.startsWith("/")) {
                      e.preventDefault();
                      handleClick(link);
                    } else {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`block text-base font-medium transition-colors py-2 ${
                    isActive(link)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`link-mobile-${link.name.toLowerCase()}`}
                >
                  {link.mobileName}
                </a>
              ),
            )}

          </div>
        </div>
      )}
    </nav>
  );
}
