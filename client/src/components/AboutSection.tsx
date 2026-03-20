import { Card } from "@/components/ui/card";
import { Briefcase, Rocket, Code2, Star } from "lucide-react";

const experiences = [
  {
    icon: Briefcase,
    title: "Software Engineer",
    company: "Facebook",
    period: "2022 – Present",
    description:
      "Building scalable frontend features and design systems used by millions of users worldwide. Working with React, TypeScript, and GraphQL.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Rocket,
    title: "Frontend Developer",
    company: "Microsoft",
    period: "2020 – 2022",
    description:
      "Developed internal tools and customer-facing dashboards. Led the migration from legacy jQuery to modern React architecture.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Code2,
    title: "UI/UX Designer",
    company: "Google",
    period: "2018 – 2020",
    description:
      "Designed user interfaces for core Google products. Conducted user research, created wireframes, and built interactive prototypes.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Star,
    title: "Junior Developer",
    company: "Amazon",
    period: "2016 – 2018",
    description:
      "Started my career building e-commerce features. Gained experience in full-stack development using Node.js and React.",
    color: "from-orange-500 to-yellow-500",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-24 relative" data-testid="section-about">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text" data-testid="heading-about">
            About Me
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6" data-testid="text-about-bio">
            I'm a Software Engineer and UI/UX Designer passionate about creating beautiful,
            functional digital experiences. With over 8 years of experience, I've worked with
            top tech companies to build products that make a difference.
          </p>
          <blockquote
            className="text-lg italic text-muted-foreground/80 max-w-xl mx-auto"
            data-testid="quote-about"
          >
            "Simplicity is the ultimate sophistication."
            <footer className="text-sm font-normal mt-1 not-italic">— Leonardo da Vinci</footer>
          </blockquote>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {experiences.map((exp, index) => {
            const Icon = exp.icon;
            return (
              <Card
                key={exp.company}
                className="p-6 hover-elevate overflow-visible animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
                data-testid={`card-experience-${exp.company.toLowerCase()}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${exp.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-foreground" data-testid={`text-role-${exp.company.toLowerCase()}`}>
                          {exp.title}
                        </h3>
                        <p className="text-primary text-sm font-medium" data-testid={`text-company-${exp.company.toLowerCase()}`}>
                          {exp.company}
                        </p>
                      </div>
                      <span className="text-muted-foreground text-xs shrink-0">{exp.period}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed" data-testid={`text-desc-${exp.company.toLowerCase()}`}>
                      {exp.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
