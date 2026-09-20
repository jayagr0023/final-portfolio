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

const LAST_KNOWN_CODING_STATS = {
  leetcodeSolved: 312,
  gfgSolved: 86,
};

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 7000,
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

async function fetchLeetCodeSolved(): Promise<number | null> {
  const response = await fetchWithTimeout("https://leetcode.com/graphql/", {
    method: "POST",
    headers: {
      ...BROWSER_HEADERS,
      "Content-Type": "application/json",
      Accept: "application/json",
      Referer: "https://leetcode.com/u/AgJi232427/",
      Origin: "https://leetcode.com",
    },
    body: JSON.stringify({
      query:
        "query userProfile($username: String!) { matchedUser(username: $username) { submitStatsGlobal { acSubmissionNum { difficulty count } } } }",
      variables: { username: "AgJi232427" },
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const row = data?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum?.find(
    (item: { difficulty?: string }) => item?.difficulty === "All",
  );

  return typeof row?.count === "number" ? row.count : null;
}

async function fetchGfgSolved(): Promise<number | null> {
  const response = await fetchWithTimeout(
    "https://authapi.geeksforgeeks.org/api-get/user-profile-info/?handle=2802jayagji&article_count=false&redirect=true",
    {
      headers: {
        ...BROWSER_HEADERS,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) return null;
  const data = await response.json();
  const solved = Number(data?.info?.total_problems_solved);
  return Number.isFinite(solved) ? solved : null;
}

export default async function handler(
  _request: unknown,
  response: {
    setHeader(name: string, value: string): void;
    status(code: number): { json(value: unknown): void };
    json(value: unknown): void;
  },
) {
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  const [leetcodeResult, gfgResult] = await Promise.allSettled([
    fetchLeetCodeSolved(),
    fetchGfgSolved(),
  ]);

  const leetcodeLive =
    leetcodeResult.status === "fulfilled" ? leetcodeResult.value : null;
  const gfgLive = gfgResult.status === "fulfilled" ? gfgResult.value : null;

  response.json({
    leetcodeSolved: leetcodeLive ?? LAST_KNOWN_CODING_STATS.leetcodeSolved,
    gfgSolved: gfgLive ?? LAST_KNOWN_CODING_STATS.gfgSolved,
    source: {
      leetcode: leetcodeLive != null ? "live" : "fallback",
      gfg: gfgLive != null ? "live" : "fallback",
    },
    updatedAt: new Date().toISOString(),
  } satisfies CodingStatsPayload);
}
