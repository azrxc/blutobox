import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let _anonUploadLimiter: Ratelimit | null = null;

function getAnonUploadLimiter(): Ratelimit {
  if (!_anonUploadLimiter) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error("Missing required env vars: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN");
    }
    _anonUploadLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "ratelimit:anon-upload",
    });
  }
  return _anonUploadLimiter;
}

export async function checkAnonUploadLimit(ip: string) {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    // Rate limiting not configured (e.g. local dev before Upstash is set up) - allow through.
    return { success: true };
  }
  const { success } = await getAnonUploadLimiter().limit(ip);
  return { success };
}

let _loginLimiter: Ratelimit | null = null;

function getLoginLimiter(): Ratelimit {
  if (!_loginLimiter) {
    _loginLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(8, "15 m"),
      prefix: "ratelimit:login",
    });
  }
  return _loginLimiter;
}

export async function checkLoginLimit(ip: string) {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return { success: true };
  }
  const { success } = await getLoginLimiter().limit(ip);
  return { success };
}

let _registerLimiter: Ratelimit | null = null;

function getRegisterLimiter(): Ratelimit {
  if (!_registerLimiter) {
    _registerLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "ratelimit:register",
    });
  }
  return _registerLimiter;
}

export async function checkRegisterLimit(ip: string) {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return { success: true };
  }
  const { success } = await getRegisterLimiter().limit(ip);
  return { success };
}
