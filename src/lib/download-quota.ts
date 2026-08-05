import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

function todayKey(identifier: string) {
  const day = new Date().toISOString().slice(0, 10);
  return `dl-quota:${identifier}:${day}`;
}

function siteKey(day: string) {
  return `dl-quota:site:${day}`;
}

export async function checkDownloadQuota(identifier: string, fileBytes: number, limitBytes: number) {
  const redis = getRedis();
  if (!redis) return { allowed: true, usedBytes: 0 };

  const used = Number((await redis.get<number>(todayKey(identifier))) ?? 0);
  return { allowed: used + fileBytes <= limitBytes, usedBytes: used };
}

export async function consumeDownloadQuota(identifier: string, fileBytes: number) {
  const redis = getRedis();
  if (!redis) return;

  const key = todayKey(identifier);
  const newTotal = await redis.incrby(key, fileBytes);
  if (newTotal === fileBytes) {
    await redis.expire(key, 26 * 60 * 60); // ~1 day + buffer
  }

  // Site-wide total, kept long enough (48h) that the daily cron job can always read a
  // full day's number before it expires, regardless of what time that day's first
  // download happened. Powers the admin usage graph, doesn't gate anything.
  const today = new Date().toISOString().slice(0, 10);
  const sKey = siteKey(today);
  const siteTotal = await redis.incrby(sKey, fileBytes);
  if (siteTotal === fileBytes) {
    await redis.expire(sKey, 48 * 60 * 60);
  }
}

export async function getSiteDownloadBytes(day: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  return Number((await redis.get<number>(siteKey(day))) ?? 0);
}
