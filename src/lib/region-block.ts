// US states with age-verification laws that apply to ANY amount of adult content,
// with no minimum content-percentage threshold (unlike most other states' laws).
// A self-declared 18+ click-through gate doesn't satisfy these. Block access to
// NSFW-flagged content for visitors from these states until real ID verification
// is in place. Vercel's edge network sets x-vercel-ip-* headers automatically and
// strips/overwrites any client-supplied values, so these can't be spoofed by a visitor.
const ZERO_THRESHOLD_STATES = new Set(["OH", "SD", "WY"]);

export function isAgeVerificationRestrictedRegion(headers: Headers): boolean {
  const country = headers.get("x-vercel-ip-country");
  const region = headers.get("x-vercel-ip-country-region");
  if (country !== "US" || !region) return false;
  return ZERO_THRESHOLD_STATES.has(region);
}
