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
            className="relative lg:bottom-10 mt-15 lg:mt-0 flex items-center justify-center"
            data-testid="hero-illustration"
          >
            <div className="photo relative flex items-center justify-center pt-12 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-full">
              {/* NEW COMPONENT: A wrapper dedicated solely to the sticky grouping */}
              <div className="sticky-image-and-bubble-group relative flex flex-col items-center justify-center">
                {/* 1. The Speech Bubble (Anchored Relative to the New Group) */}
                <div
                  className="hello absolute z-20 animate-pop-up-from-back"
                  data-testid="text-greeting"
                  // CUSTOM STYLING: Precise positioning above the center.
                  style={{
                    bottom: "100%", // Always start at the top edge of the image
                    marginBottom: "15px", // Add exact vertical clearance (tail room)
                    transform: "translateX(-50%)", // Keeps it centered horizontally
                  }}
                >
                  <div className="relative whitespace-nowrap rounded-2xl border border-primary/30 bg-card/90 px-4 py-2 text-lg font-medium text-foreground shadow-xl backdrop-blur-sm">
                    Hello! I Am{" "}
                    <span className="gradient-text">Jay Agrawal</span>
                    <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-primary/30 bg-card/90" />
                  </div>
                </div>

                {/* 2. The Image (Anchored Relative to the New Group) */}
                <div className="myimage mb-5 lg:mb-0 relative z-10 w-full max-w-md aspect-square flex items-center justify-center">
                  {/* Glow Effects */}
                  <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse-slow" />

                  {/* The Outer Circular Frame (Fixed Width) */}
                  <div className="relative w-64 h-64 bg-linear-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl">
                    {/* Inner Frame */}
                    <div className="w-56 h-56 bg-background rounded-full flex items-center justify-center border-4 border-primary/30">
                      {/* The Image Itself */}
                      <img
                        src="jay.png"
                        alt="jay"
                        className="rounded-full object-cover size-52"
                      />
                    </div>
                  </div>
                </div>
              </div>{" "}
              {/* End of Sticky Group Wrapper */}
            </div>
          </div>
          <div className="space-y-8 lg:col-start-2 lg:col-span-3 animate-slide-up">
            <div className="space-y-4  lg:mr-3">
              <h1
                className="text-base inline md:text-lg lg:text-xl leading-tight"
                data-testid="text-hero-title"
              >
                Motivated{" "}
                <span className="gradient-text font-bold">
                  Full Stack / MERN Developer
                </span>{" "}
                and coding enthusiast with strong foundations in Data Structures
                & Algorithms{" "}
                <span className="gradient-text font-bold"> (DSA) </span> and
                problem solving. Experienced in building scalable,responsive web
                applications using MongoDB, Express.js, React.js, Node.js, and
                modern frontend technologies. Passionate about writing clean,
                efficient code, solving complex problems, and continuously
                improving technical skills to build real-world software
                solutions
              </h1>
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
