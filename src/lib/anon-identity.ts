import { randomUUID } from "crypto";

// Shared anonymous-identity cookie for every AI feature that needs to recognize
// the same browser across visits (adventure, daily character, ...) without an
// account - one cookie per browser, not one per feature. The cookie's value IS
// the opaque lookup key (like a session ID), not HMAC-signed like link-lock.ts's
// unlock cookie, since there's no separate value it needs to verify against.
// Logged-in users never use this; they're always identified by their account.
// Named "adventure_anon_id" for historical reasons (this originated with the
// adventure feature) - kept as-is so existing anonymous players don't lose their
// identity/history when new features started sharing it.
export const ANON_IDENTITY_COOKIE = "adventure_anon_id";
export const ANON_IDENTITY_COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

export function newAnonToken(): string {
  return randomUUID();
}
