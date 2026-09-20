// Self-contained Vercel serverless function for GET /api/coding-stats.
// It intentionally imports nothing from the project (no aliases, no Express, no DB),
// so it cannot fail at startup because of path-alias or module-resolution problems.

const LEETCODE_USERNAME = "AgJi232427";
const GFG_HANDLE = "2802jayagji";

// Shown only when a live fetch fails.
const FALLBACK = {
  leetcodeSolved: 312,
  gfgSolved: 70,
};

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchLeetCodeSolved(username: string): Promise<number | null> {
  try {
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
        body: JSON.stringify({
          query:
            "query userProfile($username: String!) { matchedUser(username: $username) { submitStatsGlobal { acSubmissionNum { difficulty count submissions } } } }",
          variables: { username },
        }),
      },
      6000,
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("[leetcode] failed:", response.status, text.slice(0, 200).replace(/\s+/g, " "));
      return null;
    }

    const data: any = await response.json();
    const rows = data?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
    if (!Array.isArray(rows)) {
      console.error("[leetcode] unexpected response:", JSON.stringify(data).slice(0, 200));
      return null;
    }

    const all = rows.find((r: any) => r?.difficulty === "All");
    return typeof all?.count === "number" ? all.count : null;
  } catch (error) {
    console.error("[leetcode] error:", error instanceof Error ? error.message : error);
    return null;
  }
}

async function fetchGfgFromApi(handle: string): Promise<number | null> {
  try {
    const response = await fetchWithTimeout(
      `https://authapi.geeksforgeeks.org/api-get/user-profile-info/?handle=${encodeURIComponent(
        handle,
      )}&article_count=false&redirect=true`,
      { headers: { ...BROWSER_HEADERS, Accept: "application/json" } },
      6000,
    );

    if (!response.ok) {
      console.error("[gfg api] failed:", response.status);
      return null;
    }

    const json: any = await response.json();
    const solved = Number(json?.info?.total_problems_solved);
    if (!Number.isFinite(solved)) {
      console.error("[gfg api] unexpected response:", JSON.stringify(json).slice(0, 200));
      return null;
    }
    return solved;
  } catch (error) {
    console.error("[gfg api] error:", error instanceof Error ? error.message : error);
    return null;
  }
}

async function fetchGfgFromHtml(handle: string): Promise<number | null> {
  try {
    const response = await fetchWithTimeout(
      `https://www.geeksforgeeks.org/profile/${handle}?tab=activity`,
      {
        headers: {
          ...BROWSER_HEADERS,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      },
      6000,
    );

    if (!response.ok) {
      console.error("[gfg html] failed:", response.status);
      return null;
    }

    const html = await response.text();
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

    console.error("[gfg html] solved count not found in page");
    return null;
  } catch (error) {
    console.error("[gfg html] error:", error instanceof Error ? error.message : error);
    return null;
  }
}

async function fetchGfgSolved(handle: string): Promise<number | null> {
  // Run both in parallel to stay inside the function time limit; prefer the JSON API.
  const [fromApi, fromHtml] = await Promise.all([
    fetchGfgFromApi(handle),
    fetchGfgFromHtml(handle),
  ]);
  return fromApi ?? fromHtml;
}

export default async function handler(_req: any, res: any) {
  try {
    const [leetcodeLive, gfgLive] = await Promise.all([
      fetchLeetCodeSolved(LEETCODE_USERNAME),
      fetchGfgSolved(GFG_HANDLE),
    ]);

    const bothLive = leetcodeLive != null && gfgLive != null;

    // Cache at Vercel's CDN only when both values are live, so failures get retried.
    res.setHeader(
      "Cache-Control",
      bothLive ? "public, s-maxage=600, stale-while-revalidate=3600" : "no-store",
    );

    res.status(200).json({
      leetcodeSolved: leetcodeLive ?? FALLBACK.leetcodeSolved,
      gfgSolved: gfgLive ?? FALLBACK.gfgSolved,
      source: {
        leetcode: leetcodeLive != null ? "live" : "fallback",
        gfg: gfgLive != null ? "live" : "fallback",
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[coding-stats] unexpected error:", error);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      ...FALLBACK,
      source: { leetcode: "fallback", gfg: "fallback" },
      updatedAt: new Date().toISOString(),
    });
  }
}