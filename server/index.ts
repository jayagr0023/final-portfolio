import { createServer } from "http";
import { createApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";
import { connectMongo } from "./db";

(async () => {
  const app = createApp();
  const server = createServer(app);

  await connectMongo();

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT || 3000;
  server.listen({
    port,
    host: "127.0.0.1",
  }, () => {
    log(`serving on port ${port}`);
    log(`live on http://localhost:${port}`);
  });
})();
