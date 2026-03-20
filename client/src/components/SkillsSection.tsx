import { Card } from "@/components/ui/card";
import { Code2, Palette, Database, Smartphone, Globe, Zap } from "lucide-react";

const skills = [
  {
    icon: Code2,
    title: "Frontend Development",
    color: "from-blue-500 to-cyan-500",
    items: ["React", "TypeScript", "Next.js", "Vue.js", "HTML5", "CSS3"],
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    color: "from-purple-500 to-pink-500",
    items: ["Figma", "Adobe XD", "Prototyping", "Wireframing", "Design Systems", "User Research"],
  },
  {
    icon: Database,
    title: "Backend Development",
    color: "from-green-500 to-emerald-500",
    items: ["Node.js", "Express", "PostgreSQL", "MongoDB", "REST APIs", "GraphQL"],
  },
  {
    icon: Smartphone,
    title: "Mobile Development",
    color: "from-orange-500 to-yellow-500",
    items: ["React Native", "iOS", "Android", "Expo", "Mobile UI", "App Store"],
  },
  {
    icon: Globe,
    title: "Web Technologies",
    color: "from-red-500 to-rose-500",
    items: ["Tailwind CSS", "shadcn/ui", "Webpack", "Vite", "PWA", "WebSockets"],
  },
  {
    icon: Zap,
    title: "Tools & Workflow",
    color: "from-indigo-500 to-violet-500",
    items: ["Git", "Docker", "CI/CD", "AWS", "Vercel", "Agile/Scrum"],
  },
];

export function SkillsSection() {
  return (
    <section id="skills" className="py-24 relative" data-testid="section-skills">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text" data-testid="heading-skills">
            My Skills
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            A snapshot of the technologies and tools I work with to bring ideas to life.
          </p>
          <blockquote className="text-lg italic text-muted-foreground/80 max-w-xl mx-auto" data-testid="quote-skills">
            "The only way to do great work is to love what you do."
            <footer className="text-sm font-normal mt-1 not-italic">— Steve Jobs</footer>
          </blockquote>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <Card
                key={skill.title}
                className="p-6 hover-elevate overflow-visible animate-slide-up"
                style={{ animationDelay: `${index * 80}ms` }}
                data-testid={`card-skill-${skill.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${skill.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-3">{skill.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {skill.items.map((item) => (
                    <span
                      key={item}
                      className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                      data-testid={`badge-skill-${item.toLowerCase()}`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
