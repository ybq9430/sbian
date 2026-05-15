const hits = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_WINDOW_MS = 60_000; // 1 minute
const DEFAULT_MAX_HITS = 60; // 60 requests per minute

export function rateLimit(
  key: string,
  maxHits: number = DEFAULT_MAX_HITS,
  windowMs: number = DEFAULT_WINDOW_MS
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxHits - 1, resetAt: now + windowMs };
  }

  entry.count++;
  if (entry.count > maxHits) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: maxHits - entry.count, resetAt: entry.resetAt };
}

export function rateLimitReq(
  req: Request,
  maxHits?: number,
  windowMs?: number
): ReturnType<typeof rateLimit> {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const path = new URL(req.url).pathname;
  return rateLimit(`${ip}:${path}`, maxHits, windowMs);
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of hits) {
    if (now > entry.resetAt) hits.delete(key);
  }
}, 300_000);
