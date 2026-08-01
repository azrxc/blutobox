import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function makeLimitChecker(prefix: string, limit: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  let limiter: Ratelimit | null = null;

  return async function check(identifier: string) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      // Rate limiting not configured (e.g. local dev before Upstash is set up) - allow through.
      return { success: true };
    }
    if (!limiter) {
      limiter = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(limit, window),
        prefix: `ratelimit:${prefix}`,
      });
    }
    const { success } = await limiter.limit(identifier);
    return { success };
  };
}

export const checkAnonUploadLimit = makeLimitChecker("anon-upload", 10, "1 h");
export const checkLoginLimit = makeLimitChecker("login", 8, "15 m");
export const checkRegisterLimit = makeLimitChecker("register", 5, "1 h");
export const checkForgotPasswordLimit = makeLimitChecker("forgot-password", 5, "1 h");
export const checkReportLimit = makeLimitChecker("report", 5, "1 h");
