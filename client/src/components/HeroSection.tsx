import { useEffect, useState } from "react";

const professions = [
  "Full Stack Developer",
  "MERN Developer",
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
      isDeleting ? 50 : 100,
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentProfession]);

  return (
    <section
      id="home"
      className="min-h-screen relative flex items-center justify-center overflow-hidden pt-16"
      data-testid="section-home"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="max-w-8xl mx-auto px-6 bottom-10 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-3 lg:gap-15 items-center">
          <div
            className="relative  lg:bottom-10 flex items-center justify-center"
            data-testid="hero-illustration"
          >
            <div className="relative col-start-1  z-10 w-full max-w-md aspect-square flex items-center justify-center">
              <div className="absolute  inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse-slow" />
              <div className="relative w-64 h-64 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl">
                <div className=" w-56 h-56 bg-background rounded-full flex items-center justify-center border-4 border-primary/30">
                  <img
                    src="jay.png"
                    alt="jay"
                    className="rounded-full object-cover size-52"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-8 lg:col-start-2 lg:col-span-3 animate-slide-up">
            <div className="space-y-4  lg:mr-3">
              <p
                className="text-primary text-lg font-medium"
                data-testid="text-greeting"
              >
                Hello! I Am <span className="text-accent">Jay Agrawal</span>
              </p>
              <h1
                className="text-4xl inline md:text-5xl lg:text-6xl font-bold leading-tight"
                data-testid="text-hero-title"
              >
                A Developer who &nbsp;
              </h1>
              <h2
                className="text-4xl inline md:text-5xl lg:text-6xl  font-bold"
                data-testid="text-hook"
              >
                judges a book &nbsp;
              </h2>
              {/* </div> */}
              {/* <div className="flex items-baseline gap-3"> */}
              <h2 className="text-3xl inline md:text-4xl lg:text-5xl font-bold">
                by its &nbsp;
              </h2>
              <span
                className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text"
                data-testid="text-cover"
              >
                 cover
              </span>
              <span className="text-accent text-4xl">.</span>
              {/* </div> */}
              <p
                className="text-muted-foreground text-sm lg:text-base italic mt-2"
                data-testid="text-subtitle"
              >
                Because the cover does not impress you, what else can?
              </p>
            </div>

            <div className="space-y-3">
              <h3
                className="text-2xl md:text-3xl font-semibold"
                data-testid="text-profession-label"
              >
                I'm a <span className="gradient-text">{displayText}</span>
                <span className="animate-pulse">|</span>
              </h3>
              <p
                className="text-muted-foreground text-base"
                data-testid="text-current-role"
              >
                Currently, I'm a Student at{" "}
                <span className="text-primary font-medium">IIIT SONEPAT</span>.
              </p>
            </div>

            <div className="pt-4">
              <blockquote
                className="text-xl md:text-2xl italic font-light text-muted-foreground border-l-4 border-primary pl-6"
                data-testid="quote-hero"
              >
                "Design is not just what it looks like and feels like. Design is
                how it works."
                <footer className="text-sm font-normal text-muted-foreground/80 mt-2 not-italic">
                  — Steve Jobs
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
