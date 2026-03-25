import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Achievement, certificate } from "@shared/schema";

const RESUME_PDF = "/Jay_Agrawal_CV.pdf";

const DSA: Achievement[] = [
  {
    id: "1",
    title: "LeetCode",
    description:
      "Demonstrated strong problem-solving skills by solving coding problems on LeetCode, covering a wide range of topics including arrays, linked lists, trees, graphs, dynamic programming, and more.",
    link: "https://leetcode.com/u/AgJi232427/",
    img: "1leetcode.png",
  },
  {
    id: "2",
    title: "GFG",
    description:
      "Solved GeeksforGeeks problems also to strengthen core data structures and algorithms fundamentals, with focused practice across arrays, linked lists, trees, graphs, recursion, and dynamic programming.",
    link: "https://www.geeksforgeeks.org/profile/2802jayagji/?tab=activity",
    img: "2gfg.png",
  },
];

const CERTIFICATES: certificate[] = [
  {
    id: "1",
    title: "Responsive Web Design",
    provider: "freeCodeCamp",
    description:
      "Earned the Responsive Web Design certification, validating expertise in designing and building responsive websites that adapt seamlessly to various screen sizes and devices, utilizing HTML, CSS, and modern design principles.",
    link: null,
    img: "FCC.png",
    technologies: ["HTML", "CSS", "Flexbox", "Grid", "Media Queries"],
  },
  {
    id: "2",
    title: "Web Development ",
    provider: "Apna College",
    description:
      "Completed the Web Development certification from Apna College, demonstrating proficiency in front-end and back-end web development technologies, including HTML, CSS, JavaScript, and popular frameworks, showcasing the ability to build dynamic and interactive web applications.",
    link: null,
    img: "ACC.png",
    technologies: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "Tailwind CSS",
      "React",
      "Node.js",
      "ejs",
      "MongoDB",
      "Express.js",
      "MySQL",
      "Git/GitHub",
      "Bootstrap",
      "Material UI",
    ],
  },
];

type CodingStatsResponse = {
  leetcodeSolved: number | null;
  gfgSolved: number | null;
  updatedAt: string;
};

export default function Resume() {
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const [imageVersion] = useState(() => `${Date.now()}`);

  const { data: stats } = useQuery<CodingStatsResponse>({
    queryKey: ["/api/coding-stats"],
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 10,
  });

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const getSolvedLabel = (id: string) => {
    if (!stats) return "Loading...";
    if (id === "1") {
      return stats.leetcodeSolved != null
        ? `${stats.leetcodeSolved} Problems Solved (updated)`
        : "Problems Solved";
    }
    if (id === "2") {
      return stats.gfgSolved != null
        ? `${stats.gfgSolved} Problems Solved(updated)`
        : "Problems Solved";
    }
    return "Problems Solved";
  };

  const leetcodeImageSrc = `/api/profile-image/leetcode?v=${imageVersion}`;
  const gfgImageSrc = `/api/profile-image/gfg?v=${imageVersion}`;

  const getAchievementImageSrc = (achievement: Achievement) => {
    if (achievement.id === "1") {
      return leetcodeImageSrc;
    }
    if (achievement.id === "2") {
      return gfgImageSrc;
    }
    return null;
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <div
        className="resume_container max-w-5xl mx-auto px-4 pt-16 pb-16  lg:px-8"
        id="resume"
      >
        <div className="text-center mb-5 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
            Resume
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            View my resume below or download a copy for your records.
          </p>
          <Button
            asChild
            size="lg"
            className="animate-slide-up"
            style={{ animationDelay: "100ms" }}
          >
            <a href={RESUME_PDF} download>
              <Download className="h-5 w-5 mr-2" />
              Download Resume
            </a>
          </Button>
        </div>
        <div
          className="text-center mb-6 text-sm text-muted-foreground animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          <FileText className="inline h-4 w-4 mr-1 align-middle" />
          If the PDF does not display, use this{" "}
          <a
            href={RESUME_PDF}
            download
            className="underline text-primary hover:text-primary/80 transition-colors"
          >
            download link
          </a>{" "}
        </div>

        <div
          className="animate-slide-up rounded-xl overflow-hidden border border-border shadow-2xl"
          style={{ animationDelay: "150ms" }}
        >
          <iframe
            src={RESUME_PDF}
            title="Resume"
            className="w-full"
            style={{ height: "80vh", minHeight: "600px" }}
          />
        </div>
      </div>
      <div
        className="animate-slide-up rounded-xl overflow-hidden border border-border shadow-2xl mb-4"
        style={{ animationDelay: "150ms" }}
      ></div>
      <div
        className="Achievement_Container max-w-5xl mx-auto px-4 pb-16 sm:px-6 lg:px-8"
        id="achievement"
      >
        <div className="text-center mb-5 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
            Achievements
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Certifications and accomplishments earned along my tech journey.
          </p>
        </div>
        <div className="subSection">
          <div className="DSA">
            <div className="heading">
              <h1 className="text-2xl lg:text-3xl text-center lg:text-left text-fuchsia-600">
                DSA &amp; Problem Solving
              </h1>
            </div>
            <div className="content grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 mb-4">
              {DSA.map((achievement) => (
                <Card key={achievement.id} className="animate-slide-up">
                  <CardHeader>
                    <CardTitle>
                      <h3 className="text-lg font-semibold">
                        {achievement.title} - {getSolvedLabel(achievement.id)}
                      </h3>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getAchievementImageSrc(achievement) ? (
                      <img
                        src={getAchievementImageSrc(achievement) ?? undefined}
                        alt={`${achievement.title} profile `}
                        className="w-full h-60 object-cover rounded-md mb-3 cursor-zoom-in transition-transform duration-200 hover:scale-[1.01]"
                        loading="lazy"
                        onClick={() => {
                          const src = getAchievementImageSrc(achievement);
                          if (!src) return;
                          setPreviewImage({
                            src,
                            title: `${achievement.title} Live Profile Preview`,
                          });
                        }}
                      />
                    ) : (
                      <div className="w-full h-60 rounded-md mb-3 border border-border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
                        Live profile image not available.
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    {achievement.link && (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="mt-2"
                      >
                        <a
                          href={achievement.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Profile
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
          <div className="Certificates ">
            <div className="heading mt-10">
              <h1 className="text-3xl text-center lg:text-left text-fuchsia-600">
                Certificates
              </h1>
            </div>
            <div className="content grid grid-cols-1 gap-6 mt-4">
              {CERTIFICATES.map((certificate) => (
                <Card key={certificate.id} className="animate-slide-up">
                  <CardHeader>
                    <CardTitle className="flex justify-between text-xl">
                      <h3 className="inline text-lg font-semibold">
                        {certificate.title}
                      </h3>
                      {certificate.provider && (
                        <Badge className="text-base lg:text-xl">
                          {certificate.provider}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img src={certificate.img} alt="Certificate" />
                  </CardContent>
                  <CardFooter className="flex-wrap gap-2 text-lg">
                    {certificate.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="">
                        {tech}
                      </Badge>
                    ))}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div
          className="text-center mt-6 text-base lg:text-2xl text-foreground animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          **Every great developer was once a beginner. I'm on my way.**
        </div>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm px-4 py-8 flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview dialog"
        >
          <div
            className="relative max-w-6xl w-full flex flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white/90 hover:text-white transition-colors text-sm border border-white/20 rounded-md px-3 py-1"
            >
              Close
            </button>

            <img
              src={previewImage.src}
              alt={previewImage.title}
              className="w-full max-h-[82vh] object-contain rounded-lg shadow-2xl profile-preview-float"
            />

            <p className="text-white/80 text-sm mt-3 text-center">
              {previewImage.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
