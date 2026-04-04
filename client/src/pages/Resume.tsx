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
import { useEffect, useRef, useState } from "react";
import { certificate } from "@shared/schema";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const RESUME_PDF = "/Jay_Agrawal_CV.pdf";

type DsaPlatform = "leetcode" | "gfg";

type CodingStatsResponse = {
  leetcodeSolved: number | null;
  gfgSolved: number | null;
  updatedAt: string;
};

type DsaCard = {
  id: string;
  platform: DsaPlatform;
  profileLabel: string;
  description: string;
  link: string;
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function getApiUrl(path: string): string {
  return API_BASE ? `${API_BASE}${path}` : path;
}

const DSA: DsaCard[] = [
  {
    id: "1",
    platform: "leetcode",
    profileLabel: "LeetCode",
    description:
      "Demonstrated strong problem-solving skills by solving coding problems on LeetCode, covering a wide range of topics including arrays, linked lists, trees, graphs, dynamic programming, and more.",
    link: "https://leetcode.com/u/AgJi232427/",
  },
  {
    id: "2",
    platform: "gfg",
    profileLabel: "GFG",
    description:
      "Solved GeeksforGeeks problems also to strengthen core data structures and algorithms fundamentals, with focused practice across arrays, linked lists, trees, graphs, recursion, and dynamic programming.",
    link: "https://www.geeksforgeeks.org/profile/2802jayagji/?tab=activity",
  },
];

const DSA_FALLBACK_IMAGES: Record<DsaPlatform, string> = {
  leetcode: "LC.png",
  gfg: "GFG.png",
};

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
  {
    id: "3",
    title: "Gate 2026 ",
    provider: "IIT Guwahati",
    description:
      "Qualified for GATE 2026 with a score of 484, demonstrating strong understanding of computer science fundamentals and problem-solving skills. This achievement reflects dedication to mastering core concepts and readiness for advanced studies or competitive job opportunities in the tech industry.",
    link: null,
    img: "Gate.png",
    technologies: [
      "DBMS",
      "CN",
      "OS",
      "CD",
      "AFL",
      "Maths",
      "Data Structures",
      "Algorithms",
    ],
  },
];

export default function Resume() {
  const mobilePdfContainerRef = useRef<HTMLDivElement | null>(null);
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobilePdfWidth, setMobilePdfWidth] = useState(360);
  const [mobilePdfPages, setMobilePdfPages] = useState(0);
  const [mobilePdfFailed, setMobilePdfFailed] = useState(false);
  const [codingStats, setCodingStats] = useState<CodingStatsResponse>({
    leetcodeSolved: null,
    gfgSolved: null,
    updatedAt: "",
  });
  const [statsUnavailable, setStatsUnavailable] = useState(false);
  const [cacheBustSeed] = useState(() => Date.now().toString(36));
  const [imageRetries, setImageRetries] = useState<Record<DsaPlatform, number>>({
    leetcode: 0,
    gfg: 0,
  });
  const [imageFallbackActive, setImageFallbackActive] = useState<
    Record<DsaPlatform, boolean>
  >({
    leetcode: false,
    gfg: false,
  });

  useEffect(() => {
    let active = true;

    const fetchStats = async () => {
      try {
        const response = await fetch(getApiUrl("/api/coding-stats"), {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`stats endpoint failed: ${response.status}`);
        }

        const data = (await response.json()) as CodingStatsResponse;
        if (!active) return;

        setCodingStats({
          leetcodeSolved: data.leetcodeSolved,
          gfgSolved: data.gfgSolved,
          updatedAt: data.updatedAt,
        });
        setStatsUnavailable(false);
      } catch {
        if (!active) return;
        setStatsUnavailable(true);
      }
    };

    fetchStats();

    return () => {
      active = false;
    };
  }, []);

  const dsaCards = DSA.map((entry) => {
    const solvedCount =
      entry.platform === "leetcode"
        ? codingStats.leetcodeSolved
        : codingStats.gfgSolved;
    const imageSrc = imageFallbackActive[entry.platform]
      ? DSA_FALLBACK_IMAGES[entry.platform]
      : `${getApiUrl(`/api/profile-image/${entry.platform}`)}?v=${cacheBustSeed}-${imageRetries[entry.platform]}`;

    return {
      ...entry,
      title:
        solvedCount != null
          ? `${entry.profileLabel} - ${solvedCount} problems solved`
          : `${entry.profileLabel} - problems solved data unavailable`,
      imageSrc,
    };
  });

  const handleRetryImage = (platform: DsaPlatform) => {
    setImageFallbackActive((prev) => ({ ...prev, [platform]: false }));
    setImageRetries((prev) => ({ ...prev, [platform]: prev[platform] + 1 }));
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

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

  return (
    <div className="min-h-screen">
      <Navigation />
      <div
        className="resume_container max-w-5xl mx-auto px-4 pt-16 pb-16  lg:px-8"
        id="resume"
      >
        <div className="text-center mb-5 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-linear-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
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
            <div
              ref={mobilePdfContainerRef}
              className="w-full p-2 bg-background"
            >
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
                  <a
                    href={RESUME_PDF}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-linear-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
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
              {statsUnavailable ? (
                <p className="text-sm text-muted-foreground mt-2 text-center lg:text-left">
                  Live solved-count fetch failed right now, image cards still use live API with fallback.
                </p>
              ) : codingStats.updatedAt ? (
                <p className="text-sm text-muted-foreground mt-2 text-center lg:text-left">
                  Last synced: {new Date(codingStats.updatedAt).toLocaleString()}
                </p>
              ) : null}
            </div>
            <div className="content grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 mb-4">
              {dsaCards.map((achievement) => (
                <Card key={achievement.id} className="animate-slide-up">
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <h3 className="text-base lg:text-lg font-semibold">
                        {achievement.title}
                      </h3>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={achievement.imageSrc}
                      alt={`${achievement.title} profile`}
                      className="w-full h-60 object-cover rounded-md mb-3 cursor-zoom-in transition-transform duration-200 hover:scale-[1.01]"
                      loading="lazy"
                      onError={() => {
                        setImageFallbackActive((prev) => ({
                          ...prev,
                          [achievement.platform]: true,
                        }));
                      }}
                      onClick={() => {
                        setPreviewImage({
                          src: achievement.imageSrc,
                          title: `${achievement.title} Profile Preview`,
                        });
                      }}
                    />
                    {imageFallbackActive[achievement.platform] ? (
                      <p className="text-xs text-muted-foreground mb-3">
                        Live image provider was unavailable. Showing saved fallback image.
                      </p>
                    ) : null}
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex-wrap gap-2">
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
                    <Button
                      type="button"
                      size="lg"
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleRetryImage(achievement.platform)}
                    >
                      Retry Live Image
                    </Button>
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
            <div className="content grid justify-items-center lg:grid-cols-2 gap-6 mt-4">
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
                    <img
                      src={certificate.img}
                      alt="Certificate"
                      className="cursor-zoom-in transition-transform duration-200 hover:scale-[1.01]"
                      onClick={() => {
                        setPreviewImage({
                          src: certificate.img,
                          title: `${certificate.title} Profile Preview`,
                        });
                      }}
                    />
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
              className="absolute -top-12 right-0 text-white/90 cursor-pointer hover:text-white transition-colors text-sm border border-white/20 rounded-md px-3 py-1"
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
