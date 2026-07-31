import { createHmac, timingSafeEqual } from "crypto";

function sign(slug: string): string {
  const secret = process.env.AUTH_SECRET as string;
  return createHmac("sha256", secret).update(slug).digest("hex");
}

export function unlockCookieName(slug: string) {
  return `unlock_${slug}`;
}

export function makeUnlockToken(slug: string): string {
  return sign(slug);
}

export function verifyUnlockToken(slug: string, token: string | undefined): boolean {
  if (!token) return false;
  const expected = sign(slug);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
