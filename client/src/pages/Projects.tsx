import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Code2 } from "lucide-react";
import type { Project } from "@shared/schema";

export default function Projects() {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: selectedTech ? ["/api/projects", selectedTech] : ["/api/projects"],
    queryFn: selectedTech 
      ? async () => {
          const res = await fetch(`/api/projects?technology=${selectedTech}`);
          if (!res.ok) throw new Error("Failed to fetch projects");
          return res.json();
        }
      : undefined,
  });

  const allTechnologies = Array.from(
    new Set(projects.flatMap(p => p.technologies))
  ).sort();

  return (
    <div className="min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
            My Projects
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Explore my portfolio of web applications, tools, and creative projects
          </p>
          <p className="italic text-sm text-muted-foreground/80 bg-gradient-to-r from-primary/30 to-accent/30 bg-clip-text text-transparent">
            "Innovation distinguishes between a leader and a follower."
          </p>
        </div>

        {allTechnologies.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2 justify-center animate-slide-up" style={{ animationDelay: "100ms" }}>
            <Button
              size="sm"
              variant={selectedTech === null ? "default" : "outline"}
              onClick={() => setSelectedTech(null)}
              data-testid="filter-all"
            >
              All
            </Button>
            {allTechnologies.map((tech) => (
              <Button
                key={tech}
                size="sm"
                variant={selectedTech === tech ? "default" : "outline"}
                onClick={() => setSelectedTech(tech)}
                data-testid={`filter-${tech.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {tech}
              </Button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <Code2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              {selectedTech ? `No projects found with ${selectedTech}` : "No projects yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <Card 
                key={project.id}
                className="hover-elevate overflow-visible flex flex-col animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
                data-testid={`project-card-${project.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl" data-testid={`project-title-${project.id}`}>
                      {project.title}
                    </CardTitle>
                    {project.featured && (
                      <Badge variant="default" className="shrink-0">Featured</Badge>
                    )}
                  </div>
                  <CardDescription data-testid={`project-description-${project.id}`}>
                    {project.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  {project.longDescription && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
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
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
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
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        Code
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
