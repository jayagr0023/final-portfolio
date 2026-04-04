import { Switch, Route, useLocation } from "wouter";
import { useLayoutEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import Resume from "@/pages/Resume";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  useLayoutEffect(() => {
    const restoreHomeScroll = sessionStorage.getItem("restoreHomeScroll") === "1";
    const savedHomeScroll = Number(sessionStorage.getItem("homeScrollY") ?? "0");
    const hash = window.location.hash;

    if (location === "/") {
      if (hash) {
        // Let hash-based navigation from other routes land on the target section.
        requestAnimationFrame(() => {
          const target = document.querySelector(hash);
          target?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        return;
      }

      if (restoreHomeScroll) {
        window.scrollTo(0, Number.isFinite(savedHomeScroll) ? savedHomeScroll : 0);
        sessionStorage.removeItem("restoreHomeScroll");
        return;
      }

      window.scrollTo(0, 0);
      return;
    }

    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects" component={Projects} />
      <Route path="/resume" component={Resume} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
