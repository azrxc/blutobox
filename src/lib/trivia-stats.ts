import { Redis } from "@upstash/redis";

// Global (not per-identity) daily tallies for Daily Trivia, so everyone who's played
// today can see the average score - same shared-result hook as character-stats.ts's
// guess-game stats. No-ops to zero counts if Redis isn't configured.

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

function keysFor(date: string) {
  return { players: `trivia-stats:${date}:players`, scoreSum: `trivia-stats:${date}:score-sum` };
}

export async function recordTriviaScore(date: string, score: number) {
  const redis = getRedis();
  if (!redis) return;

  const { players, scoreSum } = keysFor(date);
  const newPlayers = await redis.incr(players);
  if (newPlayers === 1) await redis.expire(players, 48 * 60 * 60);
  await redis.incrby(scoreSum, score);
  if (newPlayers === 1) await redis.expire(scoreSum, 48 * 60 * 60);
}

export async function getTriviaStats(date: string): Promise<{ players: number; averageScore: number }> {
  const redis = getRedis();
  if (!redis) return { players: 0, averageScore: 0 };

  const { players, scoreSum } = keysFor(date);
  const [playerCount, sum] = await Promise.all([redis.get<number>(players), redis.get<number>(scoreSum)]);
  const count = playerCount ?? 0;
  return { players: count, averageScore: count > 0 ? (sum ?? 0) / count : 0 };
}
