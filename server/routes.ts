import type { Express } from "express";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";

async function fetchLeetCodeSolved(username: string): Promise<number | null> {
  const body = {
    query:
      "query userProfile($username: String!) { matchedUser(username: $username) { submitStatsGlobal { acSubmissionNum { difficulty count submissions } } } }",
    variables: { username },
  };

  const response = await fetch("https://leetcode.com/graphql/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const rows: Array<{ difficulty: string; count: number }> | undefined =
    data?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;

  if (!rows || !Array.isArray(rows)) {
    return null;
  }

  const allRow = rows.find((item) => item?.difficulty === "All");
  return typeof allRow?.count === "number" ? allRow.count : null;
}

async function fetchGfgSolved(profileHandle: string): Promise<number | null> {
  const urls = [
    `https://www.geeksforgeeks.org/profile/${profileHandle}?tab=activity`,
    `https://www.geeksforgeeks.org/profile/${profileHandle}`,
  ];

  const extractSolved = (html: string): number | null => {
    const patterns = [
      /"total_problems_solved"\s*:\s*"?(\d+)"?/i,
      /total_problems_solved\\"\s*:\s*"?(\d+)"?/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (!match) continue;
      const solved = Number(match[1]);
      if (Number.isFinite(solved)) return solved;
    }

    return null;
  };

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const solved = extractSolved(html);
      if (solved != null) return solved;
    } catch {
      // Try next URL variant.
    }
  }

  return null;
}

async function fetchLeetCodeProfileImage(username: string): Promise<string | null> {
  const body = {
    query:
      "query userPublicProfile($username: String!) { matchedUser(username: $username) { profile { userAvatar } } }",
    variables: { username },
  };

  const response = await fetch("https://leetcode.com/graphql/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const avatar = data?.data?.matchedUser?.profile?.userAvatar;
  return typeof avatar === "string" && avatar.length > 0 ? avatar : null;
}

async function fetchGfgProfileImage(profileHandle: string): Promise<string | null> {
  const response = await fetch(`https://www.geeksforgeeks.org/profile/${profileHandle}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) return null;

  const html = await response.text();
  const patterns = [
    /"profile_image_url"\s*:\s*"([^"]+)"/i,
    /profile_image_url\\"\s*:\s*\\"([^\\]+)\\"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match) continue;
    const decoded = match[1].replace(/\\u002F/g, "/");
    if (decoded.startsWith("http")) return decoded;
  }

  return null;
}

function getProfilePageUrl(platform: "leetcode" | "gfg"): string {
  if (platform === "leetcode") {
    return "https://leetcode.com/u/AgJi232427/";
  }
  return "https://www.geeksforgeeks.org/profile/2802jayagji/?tab=activity";
}

function getScreenshotCandidates(platform: "leetcode" | "gfg", cacheBust?: string): string[] {
  const bust = cacheBust ? encodeURIComponent(cacheBust) : `${Date.now()}`;

  if (platform === "leetcode") {
    return [
      `https://leetcard.jacoblin.cool/AgJi232427?theme=dark&font=ABeeZee&ext=heatmap&cb=${bust}`,
      `https://image.thum.io/get/width/1200/noanimate/https://leetcode.com/u/AgJi232427/?cb=${bust}`,
      `https://s.wordpress.com/mshots/v1/${encodeURIComponent(`https://leetcode.com/u/AgJi232427/?cb=${bust}`)}?w=1200`,
      `https://s.wordpress.com/mshots/v1/${encodeURIComponent(`https://leetcode.com/u/AgJi232427/?cb=${bust}`)}?w=800`,
    ];
  }

  const targetUrl = getProfilePageUrl(platform);
  const targetWithBust = `${targetUrl}${targetUrl.includes("?") ? "&" : "?"}cb=${bust}`;
  const encodedTarget = encodeURIComponent(targetWithBust);

  return [
    `https://image.thum.io/get/width/1200/noanimate/${targetWithBust}`,
    `https://s.wordpress.com/mshots/v1/${encodedTarget}?w=1200`,
    `https://s.wordpress.com/mshots/v1/${encodedTarget}?w=800`,
  ];
}

function createGfgHeatmapSvg(solved: number | null): string {
  const safeSolved = typeof solved === "number" && Number.isFinite(solved) ? solved : 0;
  const cols = 18;
  const rows = 6;
  const total = cols * rows;
  const seed = safeSolved || 37;
  const levels = ["#1d3a2b", "#1f6f43", "#24a35a", "#6fdc91"];

  const cells: string[] = [];
  for (let i = 0; i < total; i++) {
    const x = 30 + (i % cols) * 24;
    const y = 110 + Math.floor(i / cols) * 24;
    const v = (seed * (i + 11) + i * 13) % 100;
    const color = v > 75 ? levels[3] : v > 50 ? levels[2] : v > 25 ? levels[1] : levels[0];
    cells.push(`<rect x="${x}" y="${y}" width="16" height="16" rx="3" fill="${color}"/>`);
  }

  return `
<svg width="500" height="320" viewBox="0 0 500 320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1f14"/>
      <stop offset="100%" stop-color="#102a1e"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="500" height="320" rx="18" fill="url(#bg)"/>
  <text x="30" y="48" fill="#d7ffe7" font-size="24" font-family="Poppins, Arial, sans-serif" font-weight="700">GFG Profile Overview</text>
  <text x="30" y="78" fill="#9bd4b1" font-size="16" font-family="Poppins, Arial, sans-serif">Heatmap-style fallback card</text>
  <text x="470" y="48" text-anchor="end" fill="#ffffff" font-size="32" font-family="Poppins, Arial, sans-serif" font-weight="700">${safeSolved}</text>
  <text x="470" y="70" text-anchor="end" fill="#9bd4b1" font-size="14" font-family="Poppins, Arial, sans-serif">Problems Solved</text>
  ${cells.join("")}
</svg>`;
}

export function registerRoutes(app: Express): void {
  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/contacts", async (_req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact) {
        res.status(404).json({ error: "Contact not found" });
        return;
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/coding-stats", async (_req, res) => {
    try {
      const [leetcodeSolved, gfgSolved] = await Promise.all([
        fetchLeetCodeSolved("AgJi232427"),
        fetchGfgSolved("2802jayagji"),
      ]);

      res.json({
        leetcodeSolved,
        gfgSolved,
        updatedAt: new Date().toISOString(),
      });
    } catch (_error) {
      res.status(200).json({
        leetcodeSolved: null,
        gfgSolved: null,
        updatedAt: new Date().toISOString(),
      });
    }
  });

  app.get("/api/profile-images", async (_req, res) => {
    try {
      const [leetcodeImageUrl, gfgImageUrl] = await Promise.all([
        fetchLeetCodeProfileImage("AgJi232427"),
        fetchGfgProfileImage("2802jayagji"),
      ]);

      res.json({
        leetcodeImageUrl,
        gfgImageUrl,
        updatedAt: new Date().toISOString(),
      });
    } catch (_error) {
      res.status(200).json({
        leetcodeImageUrl: null,
        gfgImageUrl: null,
        updatedAt: new Date().toISOString(),
      });
    }
  });

  app.get("/api/profile-image/:platform", async (req, res) => {
    const { platform } = req.params;
    const cacheBust = typeof req.query.v === "string" ? req.query.v : undefined;

    if (platform !== "leetcode" && platform !== "gfg") {
      res.status(400).json({ error: "Invalid platform" });
      return;
    }

    try {
      const candidates = getScreenshotCandidates(platform, cacheBust);

      for (const imageUrl of candidates) {
        const imageResponse = await fetch(imageUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Accept: "image/*,*/*;q=0.8",
          },
        });

        if (!imageResponse.ok) {
          continue;
        }

        const contentType = imageResponse.headers.get("content-type") || "";
        if (!contentType.toLowerCase().startsWith("image/")) {
          continue;
        }

        const rawBuffer = Buffer.from(await imageResponse.arrayBuffer());
        let buffer = rawBuffer;

        // Some SVG card providers ship with an initial opacity:0 style that stays hidden in <img>.
        if (contentType.toLowerCase().includes("image/svg+xml")) {
          const svg = rawBuffer
            .toString("utf-8")
            .replace("svg{opacity:0}", "svg{opacity:1}");
          buffer = Buffer.from(svg, "utf-8");
        }

        if (buffer.length === 0) {
          continue;
        }

        res.setHeader("Content-Type", contentType);
        // URLs are versioned with ?v=... from the client, so per-version caching is safe.
        res.setHeader("Cache-Control", "public, max-age=86400, immutable");
        res.send(buffer);
        return;
      }

      if (platform === "gfg") {
        const solved = await fetchGfgSolved("2802jayagji");
        const svg = createGfgHeatmapSvg(solved);
        res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=86400, immutable");
        res.send(svg);
        return;
      }

      res.status(502).json({ error: "All screenshot providers failed" });
    } catch {
      res.status(500).json({ error: "Failed to proxy profile image" });
    }
  });

}
