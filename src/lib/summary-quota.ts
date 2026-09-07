import { Redis } from "@upstash/redis";

// Per-viewer daily count of AI file summary requests (src/lib/ai-summary.ts) -
// whoever clicks "Generate AI summary" spends their own quota, whether it's a
// fresh DeepSeek call or just re-serving an already-cached summary for that file.
// Mirrors src/lib/download-quota.ts's manual check/consume split (rather than
// @upstash/ratelimit's sliding window, which has no genuine read-only peek) so the
// UI can show a live "X/Y today" count without that check itself burning quota.

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

function todayKey(identifier: string) {
  const day = new Date().toISOString().slice(0, 10);
  return `ai-summary-quota:${identifier}:${day}`;
}

export async function checkSummaryQuota(identifier: string, limit: number) {
  const redis = getRedis();
  if (!redis) return { allowed: true, used: 0 };

  const used = Number((await redis.get<number>(todayKey(identifier))) ?? 0);
  return { allowed: used < limit, used };
}

export async function consumeSummaryQuota(identifier: string) {
  const redis = getRedis();
  if (!redis) return;

  const key = todayKey(identifier);
  const newTotal = await redis.incr(key);
  if (newTotal === 1) {
    await redis.expire(key, 26 * 60 * 60); // ~1 day + buffer
  }
}
