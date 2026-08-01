export const ANON_MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // 200MB
export const FREE_MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024; // 2GB
export const PRO_MAX_UPLOAD_BYTES = 10 * 1024 * 1024 * 1024; // 10GB

export const FREE_TOTAL_STORAGE_BYTES = 5 * 1024 * 1024 * 1024; // 5GB
export const PRO_TOTAL_STORAGE_BYTES = 50 * 1024 * 1024 * 1024; // 50GB

export function totalStorageBytesFor(planTier: "FREE" | "PRO") {
  return planTier === "PRO" ? PRO_TOTAL_STORAGE_BYTES : FREE_TOTAL_STORAGE_BYTES;
}

export const MULTIPART_THRESHOLD_BYTES = 50 * 1024 * 1024; // 50MB
export const MULTIPART_PART_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export function maxUploadBytesFor(planTier: "FREE" | "PRO" | null) {
  if (planTier === "PRO") return PRO_MAX_UPLOAD_BYTES;
  if (planTier === "FREE") return FREE_MAX_UPLOAD_BYTES;
  return ANON_MAX_UPLOAD_BYTES;
}
