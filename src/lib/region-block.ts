// US states with age-verification laws that apply to ANY amount of adult content,
// with no minimum content-percentage threshold (unlike most other states' laws).
// A self-declared 18+ click-through gate doesn't satisfy these. Block access to
// sensitive-flagged content for visitors from these states until real ID verification
// is in place. Cloudflare's edge computes these from the visitor's real IP server-side
// and sets the headers itself, so they can't be spoofed by a visitor.
//
// cf-region-code requires the "Add visitor location headers" Managed Transform to be
// turned on in the Cloudflare dashboard (Rules > Settings > Managed Transforms) - it's
// not sent by default, unlike cf-ipcountry. If that's ever off, region will be empty
// and this fails safe (returns false, no block) rather than silently misreading a
// header that isn't there.
//
// UNVERIFIED IN PRODUCTION: Cloudflare's docs confirm the header name but not the exact
// code format (plain "OH" vs ISO 3166-2 style "US-OH"). Normalized below to handle
// either. After deploying, log the raw header value for a real US request once to
// confirm which format it actually is, then this normalization can be simplified.
const ZERO_THRESHOLD_STATES = new Set(["OH", "SD", "WY"]);

function normalizeRegionCode(raw: string): string {
  const upper = raw.toUpperCase();
  return upper.startsWith("US-") ? upper.slice(3) : upper;
}

export function isAgeVerificationRestrictedRegion(headers: Headers): boolean {
  const country = headers.get("cf-ipcountry");
  const rawRegion = headers.get("cf-region-code");
  if (country !== "US" || !rawRegion) return false;
  return ZERO_THRESHOLD_STATES.has(normalizeRegionCode(rawRegion));
}
