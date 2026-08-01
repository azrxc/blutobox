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
}
