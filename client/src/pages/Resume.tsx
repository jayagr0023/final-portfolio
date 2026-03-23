import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";

const RESUME_PDF = "/Jay_Agrawal_CV.pdf";

export default function Resume() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container max-w-5xl mx-auto px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="text-center mb-10 animate-slide-up">
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
              Download PDF
            </a>
          </Button>
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

        <div className="text-center mt-6 text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: "200ms" }}>
          <FileText className="inline h-4 w-4 mr-1 align-middle" />
          If the PDF does not display, use the{" "}
          <a
            href={RESUME_PDF}
            download
            className="underline text-primary hover:text-primary/80 transition-colors"
          >
            download link
          </a>{" "}
          above.
        </div>
      </div>
    </div>
  );
}
