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
// Anonymous downloads already have a byte-based daily quota, but nothing stops a
// script from hitting the download endpoint many times with small/different files
// while staying under that byte total. This backstops that specifically - generous
// enough that no real shared network (office, family, mobile carrier NAT) should hit
// it from ordinary multi-link usage.
export const checkAnonDailyDownloadCountLimit = makeLimitChecker("anon-download-count", 50, "1 d");
// Logged-in accounts have no per-upload byte throttle like anon does, only a total
// storage cap - which doesn't stop someone mass-creating many small share links
// (spam) without ever touching that cap. These backstop that, generous enough that
// no real single person should ever hit them.
export const checkFreeDailyUploadCountLimit = makeLimitChecker("free-upload-count", 50, "1 d");
export const checkProDailyUploadCountLimit = makeLimitChecker("pro-upload-count", 200, "1 d");
export const checkLoginLimit = makeLimitChecker("login", 8, "15 m");
export const checkRegisterLimit = makeLimitChecker("register", 5, "1 h");
export const checkForgotPasswordLimit = makeLimitChecker("forgot-password", 5, "1 h");
export const checkReportLimit = makeLimitChecker("report", 5, "1 h");
export const checkUnlockLimit = makeLimitChecker("unlock", 10, "15 m");
export const checkShareEmailLimit = makeLimitChecker("share-email", 10, "1 h");
