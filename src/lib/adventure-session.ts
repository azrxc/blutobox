import { randomUUID } from "crypto";

// Anonymous players are identified by a long-lived random cookie instead of an
// HMAC-signed token like src/lib/link-lock.ts's unlock cookie - the cookie's value
// IS the opaque lookup key (like a session ID), there's no separate value it needs
// to verify against, so signing would add nothing. Logged-in users never use this;
// they're always identified by their account (Adventure.ownerId).
export const ADVENTURE_ANON_COOKIE = "adventure_anon_id";
export const ADVENTURE_ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

export function newAnonToken(): string {
  return randomUUID();
}
