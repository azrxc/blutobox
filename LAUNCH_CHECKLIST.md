# Bluto Box — Launch Checklist

Running notes on what's done and what's left, so nothing gets forgotten if this project is picked back up later.

## ✅ Built and working (tested end-to-end, including live production)

- **Live at https://blutobox-14ks.vercel.app/** — confirmed working end-to-end in production: register, login, upload (real browser test, not just server-to-server), file view/download, all verified 2026-08-01
- Auth: email/password signup, email verification, login, sessions (NextAuth). **Login now requires a verified email** — unverified accounts cannot log in (fixed 2026-08-01, was previously a gap where anyone could register with someone else's email and log in anyway)
- Database: Postgres on Neon, Prisma schema (User, File, ShareLink, Report, Subscription, BannedIp)
- File uploads: direct browser → Backblaze B2 (presigned URLs), single-part + multipart for large files
- File sharing: share links, inline preview (image/video/audio), download counter
- NSFW age-gate (self-declared, like pixeldrain)
- DMCA/abuse report pipeline: report button → admin dashboard (`/admin/reports`) → remove/dismiss
- Repeat-offender auto-ban: 3+ removed files from same IP or account → blocked from uploading
- Stripe Pro tier: Checkout, billing portal, pricing page ($4.99/mo) — **built in LIVE mode**
- Rate limiting: anonymous uploads capped at 10/hour per IP (Upstash)
- Terms of Service + Privacy Policy pages (template — see below), required checkbox at signup
- Pro perks: password-protected share links + custom link expiry (Free links are permanent/public)
- Pricing page: feature comparison table (Free vs Pro)
- Inactive-file cleanup: files with no downloads in 30 days are auto-deleted to control storage cost — **Pro-owned files are exempt**. Runs via Vercel Cron daily at 3am UTC (`vercel.json`), hitting `/api/cron/cleanup`, protected by `CRON_SECRET`
- B2 CORS rule fixed and live: allows `GET/PUT/POST/HEAD` from both `http://localhost:3000` and `https://blutobox-14ks.vercel.app` (set via the S3-compatible API directly — B2's web UI CORS presets only allow read methods, not uploads, which caused a real bug where uploads failed in the browser with CORS errors even though server-to-server tests passed)
- Vercel env vars added to production project (`blutobox-14ks`)
- Account page (`/account`): file history with per-file "auto-deletes in N days" countdown, live storage quota bar (5GB Free / 50GB Pro, enforced server-side on upload — not just cosmetic), delete-your-own-file, change password
- Storage quota (total per account, separate from per-file size limit): 5GB Free / 50GB Pro, enforced in the presign route; auto-cleanup now correctly decrements the quota counter too (was a bug — files deleted by the 30-day sweep weren't updating `storageUsedBytes`, now fixed)

## 🐛 Resolved issues (kept for history)

- **Vercel build failures**: fixed by adding `prisma generate` to the build command (Vercel caches `node_modules`, so a stale Prisma Client from before a schema change could cause type errors) and wrapping `/login`'s `useSearchParams()` in a Suspense boundary, and making the Stripe client lazy-initialized instead of created at module load
- **`blutobox.vercel.app` domain 404**: the original `blutobox` Vercel project had some broken internal link between its domain and deployments that never resolved despite valid-looking config. Fix was creating a fresh project (`blutobox-14ks`) from the same GitHub repo — bypassed the issue entirely. The old `blutobox` project (and an accidental duplicate `blutobox-p594`) should be deleted from Vercel if not already done
- **B2 uploads failing with CORS error in browser**: B2's simple "share with this origin" UI preset only allows `HEAD`/`GET` — no `PUT`. Fixed by setting the CORS rule directly via the S3-compatible API (`PutBucketCorsCommand`) instead of the web UI
- **Dev-server session confusion (2026-08-01)**: after a long dev session with many hot-reloads, `auth()` briefly stopped recognizing valid sessions in Server Components/Route Handlers even though NextAuth's own `/api/auth/session` endpoint still worked. A full dev-server restart + clearing `.next` fixed it. Not a code bug — likely Next.js dev-mode state getting stale after extended hot-reloading. If this recurs, restart the dev server first before assuming something's broken

## ⏳ Deferred until you buy blutobox.com

- **Cloudflare in front of B2**: right now uploads/downloads talk directly to B2. Once you have a domain, front the bucket with Cloudflare for free egress via the Bandwidth Alliance (this is what keeps bandwidth costs near-zero at scale)
- **Resend domain verification**: emails currently only deliver to your own Resend account email (sandbox mode restriction). Real users can't get verification emails until a custom domain is verified in Resend — this means **real strangers can't complete signup right now** since they can't verify their email (see the login-requires-verification fix above)
- **B2 CORS rule**: currently allows `localhost:3000` + `blutobox-14ks.vercel.app`. Needs your real domain added (and possibly the old vercel.app origin removed) once you have one
- **NEXTAUTH_URL**: currently `https://blutobox-14ks.vercel.app` in Vercel env vars, needs to become the real domain

## ⚠️ Still needs doing regardless of domain

- **Push local commits**: check GitHub Desktop for unpushed commits and push them — I can't push myself (blocked by permission settings), so this is on you each time
- **Test the full Stripe webhook flow with one real purchase** — Checkout session creation is verified working, but the webhook that actually upgrades a user to Pro after payment hasn't been tested end-to-end yet. Needs a webhook endpoint configured in Stripe (Developers → Webhooks → Add endpoint → point at `https://blutobox-14ks.vercel.app/api/stripe/webhook`, select `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`) and the resulting signing secret added as `STRIPE_WEBHOOK_SECRET` in Vercel
- **Rotate the Stripe live secret key** before calling this "production ready" — it ended up in this chat's history during setup. Stripe dashboard → API keys → roll key
- **Have a lawyer review the ToS/Privacy Policy** — current versions are templates with placeholder contact emails (`legal@blutobox.com`, `privacy@blutobox.com`) and a `[DATE]` placeholder. Fine for testing, not for real users
- **Register a DMCA agent** with the US Copyright Office (~$6) once you're operating publicly — strengthens your legal safe-harbor position
- **Decide on ads for the free tier** (discussed earlier: standard AdSense conflicts with NSFW content policy — if you want ads, look at adult-friendly networks like ExoClick/JuicyAds instead, or skip ads and rely on Pro subscriptions only)
- **Delete unused Vercel projects**: old `blutobox` and `blutobox-p594` if not already removed

## Accounts/credentials already set up (in `.env.local`, not committed to git — also added to Vercel prod env vars)

- Neon (Postgres)
- Backblaze B2 (storage)
- Stripe (**live mode** — be careful testing)
- Resend (sandbox mode only, see above)
- Upstash (rate limiting)
- `CRON_SECRET` (self-generated, protects the cleanup endpoint from unauthorized triggering)

## Where things live

- **Live site**: https://blutobox-14ks.vercel.app/
- Admin dashboard: `/admin/reports` (your account `azrele2@gmail.com` is set as ADMIN)
- Pricing page: `/pricing`
- This checklist: keep it updated as things change — it's meant to be the source of truth for "what's left"
