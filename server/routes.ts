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

type SourceStatus = "live" | "fallback";

type CodingStatsPayload = {
  leetcodeSolved: number;
  gfgSolved: number;
  source: {
    leetcode: SourceStatus;
    gfg: SourceStatus;
  };
  updatedAt: string;
};

const LEETCODE_USERNAME = "AgJi232427";
const GFG_HANDLE = "2802jayagji";

// Used only when a live fetch has never succeeded since the server started.
const LAST_KNOWN_CODING_STATS = {
  leetcodeSolved: 312,
  gfgSolved: 70,
};

// Realistic browser headers. Bare "Mozilla/5.0" is often blocked from cloud IPs.
const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

// In-memory state. Note: on serverless platforms this may reset between invocations.
const CODING_STATS_TTL_MS = 10 * 60 * 1000;
let codingStatsCache: { data: CodingStatsPayload; at: number } | null = null;
const lastGoodStats = { ...LAST_KNOWN_CODING_STATS };

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 6000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchLeetCodeStats(
  username: string,
  timeoutMs = 7000,
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
      headers: {
        ...BROWSER_HEADERS,
        "Content-Type": "application/json",
        Accept: "application/json",
        Referer: `https://leetcode.com/u/${username}/`,
        Origin: "https://leetcode.com",
      },
      body: JSON.stringify(body),
    },
    timeoutMs,
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(
      "[leetcode] request failed:",
      response.status,
      text.slice(0, 200).replace(/\s+/g, " "),
    );
    return null;
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    console.error("[leetcode] response was not valid JSON (possible bot challenge page)");
    return null;
  }

  const rows: Array<{ difficulty: string; count: number }> | undefined =
    data?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;

  if (!rows || !Array.isArray(rows)) {
    console.error("[leetcode] unexpected response shape:", JSON.stringify(data).slice(0, 200));
    return null;
  }

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

async function fetchGfgSolvedFromApi(
  profileHandle: string,
  timeoutMs = 7000,
): Promise<number | null> {
  const response = await fetchWithTimeout(
    `https://authapi.geeksforgeeks.org/api-get/user-profile-info/?handle=${encodeURIComponent(
      profileHandle,
    )}&article_count=false&redirect=true`,
    {
      headers: {
        ...BROWSER_HEADERS,
        Accept: "application/json",
      },
    },
    timeoutMs,
  );

  if (!response.ok) {
    console.error("[gfg api] request failed:", response.status);
    return null;
  }

  let json: any;
  try {
    json = await response.json();
  } catch {
    console.error("[gfg api] response was not valid JSON");
    return null;
  }

  const solved = Number(json?.info?.total_problems_solved);
  if (!Number.isFinite(solved)) {
    console.error("[gfg api] unexpected response shape:", JSON.stringify(json).slice(0, 200));
    return null;
  }

  return solved;
}

async function fetchGfgSolved(
  profileHandle: string,
  timeoutMs = 7000,
): Promise<number | null> {
  // 1) Preferred: JSON endpoint (more reliable than scraping HTML).
  try {
    const fromApi = await fetchGfgSolvedFromApi(profileHandle, timeoutMs);
    if (fromApi != null) return fromApi;
  } catch (error) {
    console.error("[gfg api] error:", error instanceof Error ? error.message : error);
  }

  // 2) Fallback: scrape the profile page HTML.
  const urls = [
    `https://www.geeksforgeeks.org/profile/${profileHandle}?tab=activity`,
    `https://www.geeksforgeeks.org/profile/${profileHandle}`,
  ];

  const extractSolved = (html: string): number | null => {
    const patterns = [
      /"total_problems_solved"\s*:\s*"?(\d+)"?/i,
      /total_problems_solved\\"\s*:\s*"?(\d+)"?/i,
      /"(?:totalProblemsSolved|problemsSolved|problemSolved|solvedProblems)"\s*:\s*"?(\d+)"?/i,
      /(?:totalProblemsSolved|problemsSolved|problemSolved|solvedProblems)\\?"\s*:\s*\\?"(\d+)/i,
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
            ...BROWSER_HEADERS,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        },
        timeoutMs,
      );

      if (!response.ok) {
        console.error("[gfg html] request failed:", response.status, url);
        continue;
      }

      const html = await response.text();
      const solved = extractSolved(html);
      if (solved != null) return solved;

      console.error("[gfg html] solved count not found in page:", url);
    } catch (error) {
      console.error(
        "[gfg html] error:",
        error instanceof Error ? error.message : error,
        url,
      );
      // Try next URL variant.
    }
  }

  return null;
}

async function getCodingStats(): Promise<CodingStatsPayload> {
  if (codingStatsCache && Date.now() - codingStatsCache.at < CODING_STATS_TTL_MS) {
    return codingStatsCache.data;
  }

  const [leetcodeResult, gfgResult] = await Promise.allSettled([
    fetchLeetCodeStats(LEETCODE_USERNAME),
    fetchGfgSolved(GFG_HANDLE),
  ]);

  if (leetcodeResult.status === "rejected") {
    console.error("[leetcode] error:", leetcodeResult.reason);
  }
  if (gfgResult.status === "rejected") {
    console.error("[gfg] error:", gfgResult.reason);
  }

  const leetcodeLive =
    leetcodeResult.status === "fulfilled" ? (leetcodeResult.value?.all ?? null) : null;
  const gfgLive = gfgResult.status === "fulfilled" ? gfgResult.value : null;

  // Remember the last successful value so a temporary block doesn't reset to stale hardcoded numbers.
  if (leetcodeLive != null) lastGoodStats.leetcodeSolved = leetcodeLive;
  if (gfgLive != null) lastGoodStats.gfgSolved = gfgLive;

  const data: CodingStatsPayload = {
    leetcodeSolved: lastGoodStats.leetcodeSolved,
    gfgSolved: lastGoodStats.gfgSolved,
    source: {
      leetcode: leetcodeLive != null ? "live" : "fallback",
      gfg: gfgLive != null ? "live" : "fallback",
    },
    updatedAt: new Date().toISOString(),
  };

  // Only cache when both are live, so failures are retried on the next request.
  if (leetcodeLive != null && gfgLive != null) {
    codingStatsCache = { data, at: Date.now() };
  }

  return data;
}

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
      headers: {
        ...BROWSER_HEADERS,
        "Content-Type": "application/json",
        Accept: "application/json",
        Referer: `https://leetcode.com/u/${username}/`,
        Origin: "https://leetcode.com",
      },
      body: JSON.stringify(body),
    },
    7000,
  );

  if (!response.ok) {
    console.error("[leetcode avatar] request failed:", response.status);
    return null;
  }

  const data = await response.json();
  const avatar = data?.data?.matchedUser?.profile?.userAvatar;
  return typeof avatar === "string" && avatar.length > 0 ? avatar : null;
}

async function fetchGfgProfileImage(profileHandle: string): Promise<string | null> {
  const response = await fetchWithTimeout(
    `https://www.geeksforgeeks.org/profile/${profileHandle}`,
    {
      headers: {
        ...BROWSER_HEADERS,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    },
    7000,
  );

  if (!response.ok) {
    console.error("[gfg avatar] request failed:", response.status);
    return null;
  }

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
    return `https://leetcode.com/u/${LEETCODE_USERNAME}/`;
  }
  return `https://www.geeksforgeeks.org/profile/${GFG_HANDLE}?tab=activity`;
}

function getScreenshotCandidates(platform: "leetcode" | "gfg", cacheBust?: string): string[] {
  const bust = cacheBust ? encodeURIComponent(cacheBust) : `${Date.now()}`;

  if (platform === "leetcode") {
    return [
      `https://leetcard.jacoblin.cool/${LEETCODE_USERNAME}?theme=dark&font=ABeeZee&ext=heatmap&cb=${bust}`,
      `https://image.thum.io/get/width/1200/noanimate/https://leetcode.com/u/${LEETCODE_USERNAME}/?cb=${bust}`,
      `https://s.wordpress.com/mshots/v1/${encodeURIComponent(`https://leetcode.com/u/${LEETCODE_USERNAME}/?cb=${bust}`)}?w=1200`,
      `https://s.wordpress.com/mshots/v1/${encodeURIComponent(`https://leetcode.com/u/${LEETCODE_USERNAME}/?cb=${bust}`)}?w=800`,
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

async function fetchImageCandidate(url: string, timeoutMs = 4500): Promise<ProxiedImage> {
  const imageResponse = await fetchWithTimeout(
    url,
    {
      headers: {
        ...BROWSER_HEADERS,
        Accept: "image/*,*/*;q=0.8",
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
  // Treat it as a miss so we can continue to a real image or fallback card.
  if (lowerUrl.includes("s.wordpress.com/mshots") && lowerContentType.includes("image/gif")) {
    const asciiPreview = rawBuffer.toString("latin1");
    if (asciiPreview.includes("Generating Preview") || rawBuffer.length < 15000) {
      throw new Error("Preview placeholder image");
    }
  }

  let buffer = rawBuffer;

  // Some SVG card providers ship with an initial opacity:0 style that stays hidden in <img>.
  if (contentType.toLowerCase().includes("image/svg+xml")) {
    const svg = rawBuffer
      .toString("utf-8")
      .replace("svg{opacity:0}", "svg{opacity:1}");
    buffer = Buffer.from(svg, "utf-8");
  }

  if (buffer.length === 0) {
    throw new Error("Empty image buffer");
  }

  return {
    contentType,
    buffer,
  };
}

async function fetchFirstValidImage(candidates: string[]): Promise<ProxiedImage | null> {
  if (candidates.length === 0) return null;

  try {
    return await Promise.any(
      candidates.map((candidateUrl) => fetchImageCandidate(candidateUrl)),
    );
  } catch {
    return null;
  }
}

function createLeetCodeFallbackSvg(stats: LeetCodeStats | null): string {
  const safeSolved = stats?.all ?? 0;
  const easy = stats?.easy ?? 0;
  const medium = stats?.medium ?? 0;
  const hard = stats?.hard ?? 0;
  const targetSolved = 3500;
  const progress = Math.max(0, Math.min(100, Math.round((safeSolved / targetSolved) * 100)));
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
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

    try {
      const data = await getCodingStats();
      res.json(data);
    } catch (error) {
      console.error("[coding-stats] unexpected error:", error);
      res.status(200).json({
        ...lastGoodStats,
        source: { leetcode: "fallback", gfg: "fallback" },
        updatedAt: new Date().toISOString(),
      });
    }
  });

  app.get("/api/profile-images", async (_req, res) => {
    try {
      const [leetcodeImageUrl, gfgImageUrl] = await Promise.all([
        fetchLeetCodeProfileImage(LEETCODE_USERNAME),
        fetchGfgProfileImage(GFG_HANDLE),
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
      const screenshotCandidates = getScreenshotCandidates(platform, cacheBust);
      const candidates = screenshotCandidates;

      const bestImage = await fetchFirstValidImage(candidates);
      if (bestImage) {
        res.setHeader("Content-Type", bestImage.contentType);
        // Keep cache short to avoid stale provider placeholders on serverless edge caches.
        res.setHeader(
          "Cache-Control",
          "public, max-age=120, s-maxage=120, stale-while-revalidate=300",
        );
        res.send(bestImage.buffer);
        return;
      }

      const [leetcodeStatsResult, gfgSolvedResult] = await Promise.allSettled([
        fetchLeetCodeStats(LEETCODE_USERNAME, 2500),
        fetchGfgSolved(GFG_HANDLE, 2500),
      ]);

      const leetcodeStats =
        leetcodeStatsResult.status === "fulfilled" ? leetcodeStatsResult.value : null;
      const gfgSolved = gfgSolvedResult.status === "fulfilled" ? gfgSolvedResult.value : null;
      void gfgSolved;

      if (platform === "gfg") {
        // Do not serve synthetic heatmap cards for GFG. Let the client show retry/error UI.
        res.status(502).json({ error: "Unable to render GFG profile image from providers" });
        return;
      }

      if (platform === "leetcode") {
        const svg = createLeetCodeFallbackSvg(leetcodeStats);
        res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
        res.setHeader(
          "Cache-Control",
          "public, max-age=120, s-maxage=120, stale-while-revalidate=300",
        );
        res.send(svg);
        return;
      }

      res.status(502).json({ error: "All screenshot providers failed" });
    } catch {
      res.status(500).json({ error: "Failed to proxy profile image" });
    }
  });
}