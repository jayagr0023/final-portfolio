import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
// import { ThemeToggle } from "@/components/ThemeToggle";
import { useLocation } from "wouter";

const navLinks = [
  { name: "Home", href: "/", isRoute: true },
  { name: "Projects", href: "/projects", isRoute: true },
  { name: "About", href: "/resume", isRoute: true },
  { name: "Skills", href: "#skills", isRoute: false },
  { name: "Contact", href: "#contact", isRoute: false },
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
        const sections = ["home", "skills", "contact"];
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

    if (!link.isRoute) {
      if (location !== "/") {
        window.location.href = "/" + link.href;
      } else {
        const element = document.querySelector(link.href);
        element?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const isActive = (link: (typeof navLinks)[0]) => {
    if (link.isRoute) {
      return location === link.href;
    }
    return location === "/" && activeSection === link.href.substring(1);
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
            href="/"
            className="text-xl lg:font-bold gradient-text"
            onClick={(e) => {
              e.preventDefault();
              if (location === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                window.location.href = "/";
              }
            }}
            data-testid="link-logo"
          >
            Agrawal Ji
          </a>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              link.isRoute ? (
                <a
                  key={link.name}
                  href={link.href}
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
              ) : (
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

            {location === "/resume" && (
              <div className="flex items-center gap-4 pl-2 border-l border-border">
                <a
                  href="#resume"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Resume
                </a>
                <a
                  href="#achievement"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Achievement
                </a>
              </div>
            )}
            {/* <ThemeToggle /> */}
          </div>

          <div className="flex items-center gap-2 md:hidden">
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
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border animate-slide-up">
          <div className="px-6 py-4 space-y-3">
            {navLinks.map((link) =>
              link.isRoute ? (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block text-base font-medium transition-colors py-2 ${
                    isActive(link)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`link-mobile-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </a>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick(link);
                  }}
                  className={`block text-base font-medium transition-colors py-2 ${
                    isActive(link)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`link-mobile-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </a>
              ),
            )}

            {location === "/resume" && (
              <>
                <a
                  href="#resume"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-medium transition-colors py-2 text-muted-foreground hover:text-foreground"
                >
                  Resume
                </a>
                <a
                  href="#achievement"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-medium transition-colors py-2 text-muted-foreground hover:text-foreground"
                >
                  Achievement
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
