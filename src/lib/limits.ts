export const ANON_MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // 200MB
export const FREE_MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024; // 2GB
export const PRO_MAX_UPLOAD_BYTES = 10 * 1024 * 1024 * 1024; // 10GB

export const FREE_TOTAL_STORAGE_BYTES = 5 * 1024 * 1024 * 1024; // 5GB
export const PRO_TOTAL_STORAGE_BYTES = 50 * 1024 * 1024 * 1024; // 50GB

export function totalStorageBytesFor(planTier: "FREE" | "PRO", bonusBytes: number | bigint = 0) {
  const base = planTier === "PRO" ? PRO_TOTAL_STORAGE_BYTES : FREE_TOTAL_STORAGE_BYTES;
  return base + Number(bonusBytes);
}

// Referral program: both sides get a storage bonus once the referred account verifies its email.
export const REFERRAL_BONUS_BYTES = 1 * 1024 * 1024 * 1024; // 1GB per successful referral
export const MAX_REFERRAL_BONUS_BYTES = 10 * 1024 * 1024 * 1024; // cap: 10 referrals worth

// Both sides also get +1 creator link slot per referral, permanent, no subscription or
// trial involved (deliberately not a temporary Pro grant - see the earlier reasoning
// about trial abuse and planTier being a single source of truth driven by Stripe).
// Capped at Pro's own limit, referrals let Free reach Pro's level here, not exceed it.
export const MAX_REFERRAL_CREATOR_LINK_BONUS = 4;

export const MULTIPART_THRESHOLD_BYTES = 50 * 1024 * 1024; // 50MB
export const MULTIPART_PART_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export function maxUploadBytesFor(planTier: "FREE" | "PRO" | null) {
  if (planTier === "PRO") return PRO_MAX_UPLOAD_BYTES;
  if (planTier === "FREE") return FREE_MAX_UPLOAD_BYTES;
  return ANON_MAX_UPLOAD_BYTES;
}

export const ANON_DAILY_DOWNLOAD_BYTES = 3 * 1024 * 1024 * 1024; // 3GB/day
export const FREE_DAILY_DOWNLOAD_BYTES = 5 * 1024 * 1024 * 1024; // 5GB/day
export const PRO_DAILY_DOWNLOAD_BYTES = 25 * 1024 * 1024 * 1024; // 25GB/day

export function dailyDownloadBytesFor(planTier: "FREE" | "PRO" | null) {
  if (planTier === "PRO") return PRO_DAILY_DOWNLOAD_BYTES;
  if (planTier === "FREE") return FREE_DAILY_DOWNLOAD_BYTES;
  return ANON_DAILY_DOWNLOAD_BYTES;
}

// Per-viewer daily count of AI summary requests (src/lib/summary-quota.ts) - a
// starting guess, easy to tune. Real per-call cost is a fraction of a cent, so
// this is about a sane usage cap and a visible feature, not cost protection.
export const ANON_DAILY_SUMMARY_LIMIT = 1;
export const FREE_DAILY_SUMMARY_LIMIT = 3;
export const PRO_DAILY_SUMMARY_LIMIT = 15;

export function dailySummaryLimitFor(planTier: "FREE" | "PRO" | null) {
  if (planTier === "PRO") return PRO_DAILY_SUMMARY_LIMIT;
  if (planTier === "FREE") return FREE_DAILY_SUMMARY_LIMIT;
  return ANON_DAILY_SUMMARY_LIMIT;
}

// Per-identity daily count of AI adventure turns (src/lib/adventure.ts) - a starting
// guess, easy to tune. A "turn" is one player action + one AI reply, whether it's
// starting a new adventure or continuing one - every turn costs, same "every click
// costs" rule as the AI summary quota above. Separate counter from AI summary's,
// same way upload/download are separate.
export const ANON_DAILY_ADVENTURE_TURNS = 8;
export const FREE_DAILY_ADVENTURE_TURNS = 25;
export const PRO_DAILY_ADVENTURE_TURNS = 100;

export function dailyAdventureTurnLimitFor(planTier: "FREE" | "PRO" | null) {
  if (planTier === "PRO") return PRO_DAILY_ADVENTURE_TURNS;
  if (planTier === "FREE") return FREE_DAILY_ADVENTURE_TURNS;
  return ANON_DAILY_ADVENTURE_TURNS;
}

// Total saved adventures per identity (not daily - a standing cap on how many
// history slots exist at once), so anonymous cookies/accounts can't accumulate
// unbounded rows for free. Starting new past the cap requires deleting one first.
export const ANON_MAX_SAVED_ADVENTURES = 2;
export const FREE_MAX_SAVED_ADVENTURES = 5;
export const PRO_MAX_SAVED_ADVENTURES = 15;

export function maxSavedAdventuresFor(planTier: "FREE" | "PRO" | null) {
  if (planTier === "PRO") return PRO_MAX_SAVED_ADVENTURES;
  if (planTier === "FREE") return FREE_MAX_SAVED_ADVENTURES;
  return ANON_MAX_SAVED_ADVENTURES;
}

// Saved-character collection cap (Daily Character feature). Generous relative to
// saved adventures since collecting a character costs nothing beyond one DB row -
// the real cost (one DeepSeek call/day) is shared site-wide, not per save.
export const ANON_MAX_SAVED_CHARACTERS = 5;
export const FREE_MAX_SAVED_CHARACTERS = 20;
export const PRO_MAX_SAVED_CHARACTERS = 100;

export function maxSavedCharactersFor(planTier: "FREE" | "PRO" | null) {
  if (planTier === "PRO") return PRO_MAX_SAVED_CHARACTERS;
  if (planTier === "FREE") return FREE_MAX_SAVED_CHARACTERS;
  return ANON_MAX_SAVED_CHARACTERS;
}

// Free accounts can only pick from these fixed expiry windows; Pro can set any custom duration.
export const FREE_ALLOWED_EXPIRY_HOURS = [24, 24 * 7];

export const FREE_MAX_CREATOR_LINKS = 1;
export const PRO_MAX_CREATOR_LINKS = 5;

export function maxCreatorLinksFor(planTier: "FREE" | "PRO", bonusCreatorLinks = 0) {
  if (planTier === "PRO") return PRO_MAX_CREATOR_LINKS;
  return Math.min(FREE_MAX_CREATOR_LINKS + bonusCreatorLinks, PRO_MAX_CREATOR_LINKS);
}

export const FREE_MAX_BOOKMARKS = 10;

export function maxBookmarksFor(planTier: "FREE" | "PRO") {
  return planTier === "PRO" ? Infinity : FREE_MAX_BOOKMARKS;
}

// B2's account-wide "Caps & Alerts" limits (set 2026-08-06). Not exposed via any API B2
// offers, only visible/editable in B2's own dashboard - if you change them there, update
// these two numbers to match, they're only used to render the admin usage graph.
export const B2_DAILY_STORAGE_CAP_BYTES = 1003 * 1024 * 1024 * 1024; // $0.23/day
export const B2_DAILY_DOWNLOAD_CAP_BYTES = 501 * 1024 * 1024 * 1024; // $5.00/day
