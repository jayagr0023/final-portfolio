import type { Express } from "express";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";

type LeetCodeStats = {
  all: number | null;
  easy: number | null;
  medium: number | null;
  hard: number | null;
};

type ProxiedImage = {
  contentType: string;
  buffer: Buffer;
};

type ImageAttempt = {
  source: string;
  url: string;
  ok: boolean;
  error?: string;
};

type CachedProfileImage = {
  contentType: string;
  buffer: string; // base64 string for KV serialization
  source: string;
  updatedAt: string;
};

// ─── Environment detection ────────────────────────────────────────────────────
const IS_VERCEL = !!process.env.VERCEL;

// ─── Vercel KV cache (falls back to in-memory when KV is unavailable) ────────
// Install with: npm i @vercel/kv
// Add REDIS_URL + KV_REST_API_URL + KV_REST_API_TOKEN to your Vercel env vars.
let kv: {
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown, opts?: { ex?: number }) => Promise<unknown>;
} | null = null;

try {
  // Dynamic import so the app still works without the package installed locally.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  kv = require("@vercel/kv");
} catch {
  // @vercel/kv not installed — use in-memory fallback below.
}

// In-memory fallback (only reliable locally; resets on every cold start on Vercel).
const memoryCache = new Map<"leetcode" | "gfg", CachedProfileImage>();

async function getCachedImage(
  platform: "leetcode" | "gfg",
): Promise<{ contentType: string; buffer: Buffer; source: string } | null> {
  if (kv) {
    try {
      const raw = await kv.get<CachedProfileImage>(`img:${platform}`);
      if (!raw) return null;
      return {
        contentType: raw.contentType,
        buffer: Buffer.from(raw.buffer, "base64"),
        source: raw.source,
      };
    } catch {
      // KV unavailable at runtime — fall through to memory cache.
    }
  }
  const mem = memoryCache.get(platform);
  if (!mem) return null;
  return {
    contentType: mem.contentType,
    buffer: Buffer.from(mem.buffer, "base64"),
    source: mem.source,
  };
}

async function setCachedImage(
  platform: "leetcode" | "gfg",
  image: ProxiedImage,
  source: string,
): Promise<void> {
  const payload: CachedProfileImage = {
    contentType: image.contentType,
    buffer: image.buffer.toString("base64"),
    source,
    updatedAt: new Date().toISOString(),
  };

  if (kv) {
    try {
      await kv.set(`img:${platform}`, payload, { ex: 300 }); // 5-min TTL
      return;
    } catch {
      // KV write failed — store in memory as fallback.
    }
  }
  memoryCache.set(platform, payload);
}

// ─── Timeout helper ───────────────────────────────────────────────────────────
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  // Reduced from 6-7 s to stay within Vercel's 10 s hard limit on Hobby plans.
  timeoutMs = IS_VERCEL ? 3000 : 6000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

// ─── LeetCode stats ───────────────────────────────────────────────────────────
async function fetchLeetCodeStats(
  username: string,
  timeoutMs = IS_VERCEL ? 3500 : 7000,
): Promise<LeetCodeStats | null> {
  const body = {
    query:
      "query userProfile($username: String!) { matchedUser(username: $username) { submitStatsGlobal { acSubmissionNum { difficulty count submissions } } } }",
    variables: { username },
  };

  const response = await fetchWithTimeout(
    "https://leetcode.com/graphql/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    timeoutMs,
  );

  if (!response.ok) return null;

  const data = await response.json();
  const rows: Array<{ difficulty: string; count: number }> | undefined =
    data?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;

  if (!rows || !Array.isArray(rows)) return null;

  const getCount = (difficulty: string) => {
    const row = rows.find((item) => item?.difficulty === difficulty);
    return typeof row?.count === "number" ? row.count : null;
  };

  return {
    all: getCount("All"),
    easy: getCount("Easy"),
    medium: getCount("Medium"),
    hard: getCount("Hard"),
  };
}

async function fetchLeetCodeSolved(
  username: string,
  timeoutMs = IS_VERCEL ? 3500 : 7000,
): Promise<number | null> {
  const stats = await fetchLeetCodeStats(username, timeoutMs);
  return stats?.all ?? null;
}

// ─── GFG stats ────────────────────────────────────────────────────────────────
async function fetchGfgSolved(
  profileHandle: string,
  timeoutMs = IS_VERCEL ? 3000 : 7000,
): Promise<number | null> {
  // Try the unofficial GFG auth API first — more reliable than HTML scraping.
  try {
    const apiRes = await fetchWithTimeout(
      `https://authapi.geeksforgeeks.org/api-get/?handler=userInfo&param=${profileHandle}`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
      timeoutMs,
    );
    if (apiRes.ok) {
      const json = await apiRes.json();
      const solved =
        json?.total_problems_solved ??
        json?.data?.total_problems_solved ??
        null;
      if (typeof solved === "number" && Number.isFinite(solved)) return solved;
      // Some responses return it as a string.
      const parsed = Number(solved);
      if (Number.isFinite(parsed)) return parsed;
    }
  } catch {
    // Fall through to HTML scraping.
  }

  // HTML scraping fallback (works locally; may be blocked on Vercel).
  if (IS_VERCEL) return null; // Skip slow scrape on serverless.

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
      const response = await fetchWithTimeout(
        url,
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        },
        timeoutMs,
      );
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

// ─── Profile image fetchers ───────────────────────────────────────────────────
async function fetchLeetCodeProfileImage(username: string): Promise<string | null> {
  const body = {
    query:
      "query userPublicProfile($username: String!) { matchedUser(username: $username) { profile { userAvatar } } }",
    variables: { username },
  };

  const response = await fetchWithTimeout(
    "https://leetcode.com/graphql/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    IS_VERCEL ? 3500 : 7000,
  );

  if (!response.ok) return null;

  const data = await response.json();
  const avatar = data?.data?.matchedUser?.profile?.userAvatar;
  return typeof avatar === "string" && avatar.length > 0 ? avatar : null;
}

async function fetchGfgProfileImage(profileHandle: string): Promise<string | null> {
  // Prefer the unofficial GFG API — avoids fragile HTML scraping.
  try {
    const apiRes = await fetchWithTimeout(
      `https://authapi.geeksforgeeks.org/api-get/?handler=userInfo&param=${profileHandle}`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
      IS_VERCEL ? 3000 : 6000,
    );
    if (apiRes.ok) {
      const json = await apiRes.json();
      const url: unknown =
        json?.profile_image_url ?? json?.data?.profile_image_url ?? null;
      if (typeof url === "string" && url.startsWith("http")) return url;
    }
  } catch {
    // Fall through to HTML scraping.
  }

  // HTML scraping fallback — skip on Vercel to avoid timeouts.
  if (IS_VERCEL) return null;

  const response = await fetchWithTimeout(
    `https://www.geeksforgeeks.org/profile/${profileHandle}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    },
    6000,
  );

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

// ─── Screenshot providers (skipped on Vercel — shared IPs get rate-limited) ──
function getProfilePageUrl(platform: "leetcode" | "gfg"): string {
  if (platform === "leetcode") return "https://leetcode.com/u/AgJi232427/";
  return "https://www.geeksforgeeks.org/profile/2802jayagji/?tab=activity";
}

function getScreenshotCandidates(
  platform: "leetcode" | "gfg",
  cacheBust?: string,
): string[] {
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

async function fetchImageCandidate(
  url: string,
  timeoutMs = IS_VERCEL ? 2500 : 4500,
): Promise<ProxiedImage> {
  const imageResponse = await fetchWithTimeout(
    url,
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "image/*,*/*;q=0.8",
        Referer: "https://www.geeksforgeeks.org/",
      },
    },
    timeoutMs,
  );

  if (!imageResponse.ok) {
    throw new Error(`Candidate request failed: ${imageResponse.status}`);
  }

  const contentType = imageResponse.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error("Candidate is not an image response");
  }

  const rawBuffer = Buffer.from(await imageResponse.arrayBuffer());
  const lowerUrl = url.toLowerCase();
  const lowerContentType = contentType.toLowerCase();

  // WordPress mShots sometimes returns a temporary "Generating Preview" GIF.
  if (
    lowerUrl.includes("s.wordpress.com/mshots") &&
    lowerContentType.includes("image/gif")
  ) {
    const asciiPreview = rawBuffer.toString("latin1");
    if (
      asciiPreview.includes("Generating Preview") ||
      rawBuffer.length < 15000
    ) {
      throw new Error("Preview placeholder image");
    }
  }

  let buffer = rawBuffer;

  if (contentType.toLowerCase().includes("image/svg+xml")) {
    const svg = rawBuffer
      .toString("utf-8")
      .replace("svg{opacity:0}", "svg{opacity:1}");
    buffer = Buffer.from(svg, "utf-8");
  }

  if (buffer.length === 0) throw new Error("Empty image buffer");

  return { contentType, buffer };
}

async function fetchDirectProfileImage(
  platform: "leetcode" | "gfg",
  attempts: ImageAttempt[],
): Promise<ProxiedImage | null> {
  if (platform === "gfg") {
    const profileImageUrl = await fetchGfgProfileImage("2802jayagji");
    if (profileImageUrl) {
      try {
        const image = await fetchImageCandidate(profileImageUrl, IS_VERCEL ? 3000 : 6000);
        attempts.push({ source: "direct-profile-image", url: profileImageUrl, ok: true });
        return image;
      } catch (error) {
        attempts.push({
          source: "direct-profile-image",
          url: profileImageUrl,
          ok: false,
          error: error instanceof Error ? error.message : "unknown error",
        });
        return null;
      }
    }
    attempts.push({
      source: "direct-profile-image",
      url: "https://www.geeksforgeeks.org/profile/2802jayagji",
      ok: false,
      error: "profile image URL extraction failed",
    });
  }

  if (platform === "leetcode") {
    const profileImageUrl = await fetchLeetCodeProfileImage("AgJi232427");
    if (profileImageUrl) {
      try {
        const image = await fetchImageCandidate(profileImageUrl, IS_VERCEL ? 3000 : 6000);
        attempts.push({ source: "direct-profile-image", url: profileImageUrl, ok: true });
        return image;
      } catch (error) {
        attempts.push({
          source: "direct-profile-image",
          url: profileImageUrl,
          ok: false,
          error: error instanceof Error ? error.message : "unknown error",
        });
        return null;
      }
    }
    attempts.push({
      source: "direct-profile-image",
      url: "https://leetcode.com/u/AgJi232427/",
      ok: false,
      error: "profile image URL extraction failed",
    });
  }

  return null;
}

async function fetchFirstValidImage(
  candidates: string[],
  attempts: ImageAttempt[],
): Promise<ProxiedImage | null> {
  for (const candidateUrl of candidates) {
    try {
      const image = await fetchImageCandidate(candidateUrl);
      attempts.push({ source: "screenshot-provider", url: candidateUrl, ok: true });
      return image;
    } catch (error) {
      attempts.push({
        source: "screenshot-provider",
        url: candidateUrl,
        ok: false,
        error: error instanceof Error ? error.message : "unknown error",
      });
    }
  }
  return null;
}

// ─── Fallback SVG ─────────────────────────────────────────────────────────────
function createLeetCodeFallbackSvg(stats: LeetCodeStats | null): string {
  const safeSolved = stats?.all ?? 0;
  const easy = stats?.easy ?? 0;
  const medium = stats?.medium ?? 0;
  const hard = stats?.hard ?? 0;
  const targetSolved = 3500;
  const progress = Math.max(
    0,
    Math.min(100, Math.round((safeSolved / targetSolved) * 100)),
  );
  const progressWidth = Math.round((progress / 100) * 438);

  return `
<svg width="500" height="320" viewBox="0 0 500 320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="lcBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1b1d2a"/>
      <stop offset="100%" stop-color="#111318"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="500" height="320" rx="18" fill="url(#lcBg)"/>
  <text x="30" y="48" fill="#f3f5ff" font-size="24" font-family="Poppins, Arial, sans-serif" font-weight="700">LeetCode Profile Overview</text>
  <text x="30" y="78" fill="#b9bfd3" font-size="16" font-family="Poppins, Arial, sans-serif">Solved, difficulty split and progress fallback card</text>
  <rect x="30" y="90" width="438" height="10" rx="5" fill="#2a2d3d"/>
  <rect x="30" y="90" width="${progressWidth}" height="10" rx="5" fill="#ffa116"/>
  <text x="470" y="98" text-anchor="end" fill="#c9cfdf" font-size="12" font-family="Poppins, Arial, sans-serif">${progress}% target progress</text>
  <circle cx="90" cy="180" r="42" fill="#ffa116" opacity="0.95"/>
  <path d="M72 180l22-22 10 10-12 12 12 12-10 10-22-22z" fill="#1a1a1a"/>
  <text x="470" y="168" text-anchor="end" fill="#ffffff" font-size="42" font-family="Poppins, Arial, sans-serif" font-weight="700">${safeSolved}</text>
  <text x="470" y="192" text-anchor="end" fill="#b9bfd3" font-size="14" font-family="Poppins, Arial, sans-serif">Problems Solved (${targetSolved} target)</text>
  <rect x="190" y="220" width="86" height="34" rx="8" fill="#1f3a2a"/>
  <rect x="285" y="220" width="86" height="34" rx="8" fill="#3a341f"/>
  <rect x="380" y="220" width="86" height="34" rx="8" fill="#3a2020"/>
  <text x="233" y="234" text-anchor="middle" fill="#8fe6b5" font-size="11" font-family="Poppins, Arial, sans-serif">EASY</text>
  <text x="328" y="234" text-anchor="middle" fill="#f3d98f" font-size="11" font-family="Poppins, Arial, sans-serif">MED</text>
  <text x="423" y="234" text-anchor="middle" fill="#f0a4a4" font-size="11" font-family="Poppins, Arial, sans-serif">HARD</text>
  <text x="233" y="248" text-anchor="middle" fill="#ffffff" font-size="15" font-family="Poppins, Arial, sans-serif" font-weight="700">${easy}</text>
  <text x="328" y="248" text-anchor="middle" fill="#ffffff" font-size="15" font-family="Poppins, Arial, sans-serif" font-weight="700">${medium}</text>
  <text x="423" y="248" text-anchor="middle" fill="#ffffff" font-size="15" font-family="Poppins, Arial, sans-serif" font-weight="700">${hard}</text>
</svg>`;
}

// ─── Routes ───────────────────────────────────────────────────────────────────
export function registerRoutes(app: Express): void {
  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/contacts", async (_req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch {
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
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/coding-stats", async (_req, res) => {
    try {
      const [leetcodeResult, gfgResult] = await Promise.allSettled([
        fetchLeetCodeStats("AgJi232427"),
        fetchGfgSolved("2802jayagji"),
      ]);

      const leetcodeSolved =
        leetcodeResult.status === "fulfilled"
          ? (leetcodeResult.value?.all ?? null)
          : null;
      const gfgSolved =
        gfgResult.status === "fulfilled" ? gfgResult.value : null;

      res.json({
        leetcodeSolved,
        gfgSolved,
        updatedAt: new Date().toISOString(),
      });
    } catch {
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
    } catch {
      res.status(200).json({
        leetcodeImageUrl: null,
        gfgImageUrl: null,
        updatedAt: new Date().toISOString(),
      });
    }
  });

  app.get("/api/profile-image/:platform", async (req, res) => {
    const { platform } = req.params;
    const cacheBust =
      typeof req.query.v === "string" ? req.query.v : undefined;
    const debug = req.query.debug === "1" || req.query.debug === "true";

    if (platform !== "leetcode" && platform !== "gfg") {
      res.status(400).json({ error: "Invalid platform" });
      return;
    }

    const attempts: ImageAttempt[] = [];

    try {
      // 1. Try direct profile image (GraphQL for LeetCode, GFG API for GFG).
      const directImage = await fetchDirectProfileImage(platform, attempts);
      if (directImage) {
        await setCachedImage(platform, directImage, "direct-profile-image");
        if (debug) {
          const cached = await getCachedImage(platform);
          res.json({ platform, strategy: "direct-profile-image", attempts, cachedAt: cached ? new Date().toISOString() : null });
          return;
        }
        res.setHeader("Content-Type", directImage.contentType);
        res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=600");
        res.setHeader("X-Profile-Image-Source", "direct-profile-image");
        res.send(directImage.buffer);
        return;
      }

      // 2. Screenshot providers — SKIPPED on Vercel (shared IPs get rate-limited
      //    by thum.io and wordpress mshots, causing near-certain timeouts).
      if (!IS_VERCEL) {
        const screenshotCandidates = getScreenshotCandidates(platform, cacheBust);
        const bestImage = await fetchFirstValidImage(screenshotCandidates, attempts);
        if (bestImage) {
          await setCachedImage(platform, bestImage, "screenshot-provider");
          if (debug) {
            res.json({ platform, strategy: "screenshot-provider", attempts, cachedAt: new Date().toISOString() });
            return;
          }
          res.setHeader("Content-Type", bestImage.contentType);
          res.setHeader("Cache-Control", "public, max-age=120, s-maxage=120, stale-while-revalidate=300");
          res.setHeader("X-Profile-Image-Source", "screenshot-provider");
          res.send(bestImage.buffer);
          return;
        }
      } else {
        attempts.push({
          source: "screenshot-provider",
          url: "skipped",
          ok: false,
          error: "Skipped on Vercel to avoid shared-IP rate limiting and timeout risk",
        });
      }

      // 3. Serve from persistent cache (Vercel KV or in-memory fallback).
      const cached = await getCachedImage(platform);
      if (cached) {
        if (debug) {
          res.json({ platform, strategy: "cached-last-success", attempts, cachedSource: cached.source });
          return;
        }
        res.setHeader("Content-Type", cached.contentType);
        res.setHeader("Cache-Control", "public, max-age=120, s-maxage=120, stale-while-revalidate=300");
        res.setHeader("X-Profile-Image-Source", "cached-last-success");
        res.send(cached.buffer);
        return;
      }

      // 4. Platform-specific last-resort fallbacks.
      if (platform === "gfg") {
        if (debug) {
          res.status(502).json({ platform, strategy: "static-fallback-redirect", attempts, redirectTo: "/GFG.png" });
          return;
        }
        res.redirect(307, "/GFG.png");
        return;
      }

      if (platform === "leetcode") {
        // Fetch stats with a tight timeout so we don't blow the remaining budget.
        const statsResult = await Promise.race([
          fetchLeetCodeStats("AgJi232427", IS_VERCEL ? 2000 : 2500),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), IS_VERCEL ? 2000 : 2500)),
        ]);

        const svg = createLeetCodeFallbackSvg(
          statsResult instanceof Object && "all" in (statsResult as object)
            ? (statsResult as LeetCodeStats)
            : null,
        );

        if (debug) {
          res.json({ platform, strategy: "fallback-svg", attempts });
          return;
        }

        // Cache the generated SVG so subsequent requests skip generation.
        await setCachedImage(
          platform,
          { contentType: "image/svg+xml; charset=utf-8", buffer: Buffer.from(svg, "utf-8") },
          "fallback-svg",
        );

        res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=120, s-maxage=120, stale-while-revalidate=300");
        res.setHeader("X-Profile-Image-Source", "fallback-svg");
        res.send(svg);
        return;
      }

      if (debug) {
        res.status(502).json({ platform, strategy: "all-failed", attempts });
        return;
      }

      res.setHeader("Cache-Control", "no-store");
      res.status(502).json({ error: "All image sources failed" });
    } catch (error) {
      if (debug) {
        res.status(500).json({
          platform,
          strategy: "exception",
          attempts,
          error: error instanceof Error ? error.message : "unknown error",
        });
        return;
      }
      res.setHeader("Cache-Control", "no-store");
      res.status(500).json({ error: "Failed to proxy profile image" });
    }
  });
}