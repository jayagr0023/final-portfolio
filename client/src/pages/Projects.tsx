import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";
import type { Project } from "@shared/schema";
import { Navigation } from "@/components/Navigation";

const MAJOR: Project[] = [
  {
    id: "1",
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
    demoUrl: "https://venue-vista-rosy.vercel.app/",
    githubUrl: "https://github.com/Techie-AgrawalJi/VenueVista",
  },
  {
    id: "2",
    title: "StayBite",
    longDescription:
      "NestEase is a full stack web platform for students and working professionals to find PG accommodations and meal services when relocating to a new city. Built with React, TypeScript, Node.js, Express, and MongoDB, it features three roles — user, provider, and superadmin — with JWT authentication. Users can browse, filter, and book verified listings. Providers manage their listings and incoming requests. Payments are processed via Razorpay. The platform includes location-based nearby suggestions between PGs and meal services, GSAP animations, and a fully responsive design.",
    technologies: [
      "HTML",
      "Tailwind CSS",
      "TypeScript",
      "React",
      "Express",
      "MongoDB",
      "Node.js",
      "Cloudinary",
      "JWT Authentication",
      "GSAP Animations",
    ],
    demoUrl: null,
    githubUrl: "https://github.com/Techie-AgrawalJi/MinorProject",
  },
  {
    id: "3",
    title: "Talkie",
    longDescription:
      "Talkie is a real-time chat application built with React, TypeScript, Node.js, Express, and MongoDB. It features JWT authentication for secure user access, allowing users to create accounts and log in. The app supports one-on-one and group chats, with messages stored in MongoDB for persistence. Real-time communication is enabled through WebSockets, providing instant message delivery. The interface is designed with Tailwind CSS for a responsive and user-friendly experience.",
    technologies: [
      "HTML",
      "Tailwind CSS",
      "TypeScript",
      "React",
      "Express",
      "MongoDB",
      "Node.js",
      "JWT Authentication",
      "GSAP Animations",
    ],
    demoUrl: null,
    githubUrl: null,
  },
];

const MINOR: Project[] = [
  {
    id: "1",
    title: "Role Playing Game",
    longDescription:
      "This is fully functional built using vanilla JavaScript, HTML, and CSS. It features a player character that interact with enemy characters. The game includes basic mechanics such as health points, attack damage.",
    technologies: ["HTML", "JavaScript", "CSS"],
    demoUrl: "https://techie-agrawalji.github.io/RPG/",
    githubUrl: "https://github.com/Techie-AgrawalJi/RPG",
    imageUrl: "RPG.png",
  },
  {
    id: "2",
    title: "Calorie Counter",
    longDescription:
      " A lightweight calorie tracking app built with vanilla JavaScript, HTML & CSS. Log meals, set portions, and monitor your daily intake — all in a clean, distraction-free interface. ",
    technologies: ["HTML", "JavaScript", "CSS"],
    demoUrl: "https://techie-agrawalji.github.io/CalorieCounter/",
    githubUrl: "https://github.com/Techie-AgrawalJi/CalorieCounter",
    imageUrl: "CC.png",
  },
  {
    id: "3",
    title: "Basic Portfolio",
    longDescription:
      "Different from the first one, this simple project reflects my understanding of DOM manipulation, event handling, and responsive design using only HTML, CSS, and JavaScript DOM for changing page information. It features a clean layout with sections for about me, projects, and contact information linked to my GitHub and LinkedIn profiles.",
    technologies: ["HTML", "CSS", "JavaScript"],
    demoUrl: "https://techie-agrawalji.github.io/MY_Portfolio/",
    githubUrl: "https://github.com/Techie-AgrawalJi/MY_Portfolio",
    imageUrl: "Portfolio.png",
  },
  {
    id: "4",
    title: "Rock Paper Scissors Game",
    longDescription:
      "A simple Rock-Paper-Scissors game built with vanilla JavaScript, HTML, and CSS. The game allows users to play against the computer, which randomly selects its move. The interface is designed to be intuitive and responsive, providing immediate feedback on the outcome of each round. Players can keep track of their wins, losses, and ties as they play.",
    technologies: ["HTML", "CSS", "JavaScript"],
    demoUrl: "https://techie-agrawalji.github.io/RPS_Game/",
    githubUrl: "https://github.com/Techie-AgrawalJi/RPS_Game",
    imageUrl: "RPS.png",
  },
];

export default function Projects() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="major max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
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
        <div className="first ">
          <div className="heading mb-4 text-center sm:text-left ">
            <h2 className=" text-2xl sm:text-xl lg:text-3xl font-normal mb-4 inline">
              {" "}
              <span className="bg-gradient-to-r from-primary/30 to-accent/30">
                {" "}
                Major
              </span>{" "}
              Projects
            </h2>
            <span className="text-center sm:text-left text-1xl">
              {" "}
              &nbsp; developed with learning
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MAJOR.map((project, index) => (
              <Card
                key={project.id}
                className={
                  project.demoUrl != null
                    ? " hover-elevate overflow-visible flex flex-col animate-slide-up"
                    : "pointer-events-none opacity-70"
                }
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
                      {project.demoUrl == null ? (
                        <Badge variant="outline" className="ml-2">
                          In Progress
                        </Badge>
                      ) : null}
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
        <div className="minor mt-6">
          <div className="heading  mb-4 text-center sm:text-left">
            <h2 className=" text-center sm:text-left text-2xl sm:text-xl lg:text-3xl font-normal lg:inline">
              {" "}
              <span className="bg-gradient-to-r from-primary/30 to-accent/30">
                {" "}
                Minor
              </span>{" "}
              Projects
            </h2>
            <span className=" text-1xl"> &nbsp; developed while learning</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MINOR.map((project, index) => {
              const bgImage = project.imageUrl ? project.imageUrl : null;

              return (
                <Card
                  key={project.id}
                  className="relative isolate hover-elevate overflow-hidden flex flex-col animate-slide-up"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                  data-testid={`project-card-${project.id}`}
                >
                  {bgImage && (
                    <>
                      <div
                        className="absolute inset-0 -z-3 bg-cover bg-center opacity-15 pointer-events-none"
                        style={{ backgroundImage: `url(${bgImage})` }}
                        aria-hidden="true"
                      />
                      <div
                        className="absolute inset-0 -z-5 from-background/70 via-background/80 to-background/90 pointer-events-none"
                        aria-hidden="true"
                      />
                    </>
                  )}

                  <CardHeader className="relative z-10">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle
                        className="text-xl"
                        data-testid={`project-title-${project.id}`}
                      >
                        {project.title}
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10 flex-1">
                    {project.longDescription && (
                      <p className="text-sm text-foreground mb-4 line-clamp-5">
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

                  <CardFooter className="relative z-10 gap-2 flex-wrap">
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
