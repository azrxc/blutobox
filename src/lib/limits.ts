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

// Free accounts can only pick from these fixed expiry windows; Pro can set any custom duration.
export const FREE_ALLOWED_EXPIRY_HOURS = [24, 24 * 7];

export const FREE_MAX_CREATOR_LINKS = 1;
export const PRO_MAX_CREATOR_LINKS = 5;

export function maxCreatorLinksFor(planTier: "FREE" | "PRO") {
  return planTier === "PRO" ? PRO_MAX_CREATOR_LINKS : FREE_MAX_CREATOR_LINKS;
}

// B2's account-wide "Caps & Alerts" limits (set 2026-08-06). Not exposed via any API B2
// offers, only visible/editable in B2's own dashboard - if you change them there, update
// these two numbers to match, they're only used to render the admin usage graph.
export const B2_DAILY_STORAGE_CAP_BYTES = 1003 * 1024 * 1024 * 1024; // $0.23/day
export const B2_DAILY_DOWNLOAD_CAP_BYTES = 501 * 1024 * 1024 * 1024; // $5.00/day
