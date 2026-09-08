import { Redis } from "@upstash/redis";

// Global (not per-identity) daily tallies for the Daily Character guess game, so
// everyone who's played today can see "X% got it right" - the social/shared-result
// hook, same idea as Wordle showing how your guess compares to everyone else's.
// No-ops to zero counts if Redis isn't configured, same graceful-degrade pattern
// as src/lib/daily-quota.ts.

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

function keysFor(date: string) {
  return { total: `character-guess-stats:${date}:total`, correct: `character-guess-stats:${date}:correct` };
}

export async function recordGuess(date: string, correct: boolean) {
  const redis = getRedis();
  if (!redis) return;

  const { total, correct: correctKey } = keysFor(date);
  const newTotal = await redis.incr(total);
  if (newTotal === 1) await redis.expire(total, 48 * 60 * 60);
  if (correct) {
    const newCorrect = await redis.incr(correctKey);
    if (newCorrect === 1) await redis.expire(correctKey, 48 * 60 * 60);
  }
}

export async function getGuessStats(date: string): Promise<{ total: number; correct: number }> {
  const redis = getRedis();
  if (!redis) return { total: 0, correct: 0 };

  const { total, correct } = keysFor(date);
  const [totalCount, correctCount] = await Promise.all([
    redis.get<number>(total),
    redis.get<number>(correct),
  ]);
  return { total: totalCount ?? 0, correct: correctCount ?? 0 };
}
