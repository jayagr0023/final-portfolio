// import { useState } from "react";
import {
  Card,
  CardContent,
  // CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";
import type { Project } from "@shared/schema";

const PROJECTS: Project[] = [
  {
    id: "1",
    title: "Portfolio",
    longDescription:
      "This very site — featuring smooth animations, dark-mode design, a contact form backed by MongoDB, and a fully responsive layout.",
    technologies: [
      "React",
      "TypeScript",
      "Express",
      "MongoDB",
      "Tailwind CSS",
      "Node.js",
    ],
    demoUrl: "https://c7vhh0gb-3000.inc1.devtunnels.ms/",
    githubUrl: "https://github.com/Techie-AgrawalJi/final-portfolio",
  },
  {
    id: "2",
    title: "VenueVista",
    longDescription:
      "A full-stack learning project built under mentorship, featuring venue listings with nearby hotel pricing, interactive maps, reviews & ratings, user authentication, and complete CRUD operations.",
    technologies: [
      "HTML",
      "Bootstrap CSS",
      "JavaScript",
      "Express",
      "MongoDB",
      "Node.js",
      "Cloudinary",
      "Mapbox",
    ],
    demoUrl: "https://venuevista-lz3d.onrender.com",
    githubUrl: "https://github.com/Techie-AgrawalJi/VenueVista",
  },
];

export default function Projects() {
  return (
    <div className="min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
            My Projects
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Explore my portfolio of web applications, tools, and creative
            projects
          </p>
          <p className="italic text-sm text-muted-foreground/60 bg-gradient-to-r from-primary/30 to-accent/30 bg-clip-text ">
            "Innovation distinguishes between a leader and a follower."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project, index) => (
            <Card
              key={project.id}
              className="hover-elevate overflow-visible flex flex-col animate-slide-up"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
              data-testid={`project-card-${project.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle
                    className="text-xl"
                    data-testid={`project-title-${project.id}`}
                  >
                    {project.title}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                {project.longDescription && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-5">
                    {project.longDescription}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="text-xs"
                      data-testid={`tech-badge-${tech.toLowerCase()}`}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="gap-2 flex-wrap">
                {project.demoUrl && (
                  <Button
                    size="sm"
                    variant="default"
                    asChild
                    className="overflow-visible"
                    data-testid={`button-demo-${project.id}`}
                  >
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Demo
                    </a>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="overflow-visible"
                    data-testid={`button-github-${project.id}`}
                  >
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      Code
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
