import { Download } from "lucide-react";
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
import { useEffect, useRef, useState } from "react";
import { Achievement, certificate } from "@shared/schema";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

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
  const mobilePdfContainerRef = useRef<HTMLDivElement | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobilePdfWidth, setMobilePdfWidth] = useState(360);
  const [mobilePdfPages, setMobilePdfPages] = useState(0);
  const [mobilePdfFailed, setMobilePdfFailed] = useState(false);

  const { data: stats } = useQuery<CodingStatsResponse>({
    queryKey: ["/api/coding-stats"],
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 10,
  });

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const updateMobileView = () => setIsMobileView(mobileQuery.matches);

    updateMobileView();

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", updateMobileView);
    } else {
      mobileQuery.addListener(updateMobileView);
    }

    return () => {
      if (typeof mobileQuery.removeEventListener === "function") {
        mobileQuery.removeEventListener("change", updateMobileView);
      } else {
        mobileQuery.removeListener(updateMobileView);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMobileView || !mobilePdfContainerRef.current) return;

    const updateWidth = () => {
      if (!mobilePdfContainerRef.current) return;
      const containerWidth = mobilePdfContainerRef.current.clientWidth;
      setMobilePdfWidth(Math.max(280, containerWidth - 16));
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(mobilePdfContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isMobileView]);

  const getSolvedLabel = (id: string) => {
    if (!stats) return "Problems Solved";
    if (id === "1") {
      return stats.leetcodeSolved != null
        ? `${stats.leetcodeSolved} Problems Solved`
        : "Problems Solved";
    }
    if (id === "2") {
      return stats.gfgSolved != null
        ? `${stats.gfgSolved} Problems Solved`
        : "Problems Solved";
    }
    return "Problems Solved";
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
          className="animate-slide-up rounded-xl overflow-hidden border border-border shadow-2xl"
          style={{ animationDelay: "150ms" }}
        >
          {isMobileView ? (
            <div ref={mobilePdfContainerRef} className="w-full p-2 bg-background">
              {!mobilePdfFailed ? (
                <Document
                  file={RESUME_PDF}
                  onLoadSuccess={({ numPages }) => {
                    setMobilePdfPages(numPages);
                    setMobilePdfFailed(false);
                  }}
                  onLoadError={() => setMobilePdfFailed(true)}
                  loading={
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      Loading mobile PDF preview...
                    </div>
                  }
                  error={
                    <div className="py-10 px-4 text-center text-sm text-muted-foreground">
                      Mobile preview could not be loaded on this browser.
                    </div>
                  }
                >
                  {Array.from({ length: mobilePdfPages }, (_, index) => (
                    <Page
                      key={index + 1}
                      pageNumber={index + 1}
                      width={mobilePdfWidth}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="mx-auto mb-3 border border-border rounded-md overflow-hidden"
                    />
                  ))}
                </Document>
              ) : (
                <div className="space-y-3">
                  <div className="py-3 px-4 text-center text-sm text-muted-foreground border border-border rounded-md">
                    Inline mobile preview is unavailable on this device/browser.
                  </div>
                  <iframe
                    src={RESUME_PDF}
                    title="Resume mobile fallback"
                    className="w-full rounded-md border border-border"
                    style={{ height: "70vh", minHeight: "420px" }}
                  />
                </div>
              )}

              <div className="pt-2">
                <Button asChild className="w-full" variant="secondary">
                  <a href={RESUME_PDF} target="_blank" rel="noopener noreferrer">
                    Open PDF
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              src={RESUME_PDF}
              title="Resume"
              className="w-full"
              style={{ height: "80vh", minHeight: "600px" }}
            />
          )}
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
                    <CardTitle className="flex justify-between">
                      <h3 className="text-base lg:text-lg  font-semibold">
                        {achievement.title} - {getSolvedLabel(achievement.id)}
                      </h3>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    {achievement.link && (
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="w-full"
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

    </div>
  );
}
