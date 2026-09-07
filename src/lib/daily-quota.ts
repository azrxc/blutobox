import { Redis } from "@upstash/redis";

// Generic per-identifier daily counter, used by every "AI feature with a daily cap
// per viewer" (AI summary, adventure, ...). Each feature gets its own `prefix` so
// their counters never collide - separate quotas per tool, same way upload/download
// are separate. Manual check/consume split (rather than @upstash/ratelimit's sliding
// window, which has no genuine read-only peek) so a UI can show a live "X/Y today"
// count without that check itself burning quota.

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

function todayKey(prefix: string, identifier: string) {
  const day = new Date().toISOString().slice(0, 10);
  return `${prefix}-quota:${identifier}:${day}`;
}

export async function checkDailyQuota(prefix: string, identifier: string, limit: number) {
  const redis = getRedis();
  if (!redis) return { allowed: true, used: 0 };

  const used = Number((await redis.get<number>(todayKey(prefix, identifier))) ?? 0);
  return { allowed: used < limit, used };
}

export async function consumeDailyQuota(prefix: string, identifier: string) {
  const redis = getRedis();
  if (!redis) return;

  const key = todayKey(prefix, identifier);
  const newTotal = await redis.incr(key);
  if (newTotal === 1) {
    await redis.expire(key, 26 * 60 * 60); // ~1 day + buffer
  }
}
