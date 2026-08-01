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
- **Verification emails now send via Gmail SMTP (`aoinyx.dev@gmail.com`), not Resend.** This means real strangers CAN complete signup now — no domain purchase needed for this. Resend is still installed/configured but unused; can be removed later or kept as a backup. Free tier: 500 emails/day via Gmail, plenty for now
- Minimalist design pass across every page (OpenAI-inspired: warm off-white/charcoal palette, rounded-2xl cards, pill buttons, consistent header/nav) — see `globals.css` for the color tokens (`--background`, `--surface`, `--foreground`, `--muted`, `--border`, `--accent`)
- Copy-to-clipboard button on the upload-success screen and file view page
- **Daily download bandwidth quota** (separate from upload limits): anonymous 3GB/day, Free account 5GB/day, Pro 25GB/day, tracked per-IP (anon) or per-account (logged in) via Upstash Redis, enforced in the download route before generating the link. Prevents someone using the service as unlimited free bandwidth for mass-distributing large files (e.g. pirated games) — matches how Mega/pixeldrain throttle free-tier downloads
- **Stripe webhook — fully verified with a real live purchase (2026-08-01).** Completed an actual $4.99 checkout on production; confirmed in the database afterward that `checkout.session.completed` fired correctly, created a `Subscription` record (`status: active`), and flipped the account's `planTier` to `PRO`. This was the last untested piece of the payment system — the whole Pro-tier flow is now confirmed working end to end, not just theoretically wired up
- **In-app subscription management**: `/account` now shows a Pro renewal/cancellation card — "Renews in N days" with a **Cancel subscription** button (sets `cancel_at_period_end`, keeps Pro until the paid period ends, doesn't yank access immediately), or "Cancels on [date]" with a **Resume** button if already canceled. No more needing to leave the site to manage billing for this specific action (Stripe's hosted billing portal is still linked separately for payment method/invoices)
- **Session-refresh-after-upgrade fix**: previously, upgrading to Pro via Stripe checkout didn't update the UI until logging out and back in — this is inherent to JWT sessions (the token is stale until refreshed). Fixed by handling NextAuth's `trigger: "update"` in the `jwt` callback (re-fetches `planTier`/`role` from the DB) and calling `update()` client-side when the pricing page loads with `?success=1` after checkout
- Confirmation dialog added before canceling a subscription (was a silent one-click action — now shows the exact date you'd keep Pro until before confirming)
- **Concurrent multipart uploads (real performance fix, 2026-08-01)**: large file uploads (>50MB, chunked into 25MB parts) were uploading one part at a time, sequentially — for a 2GB file that's ~80 requests in series instead of parallel, massively underusing available bandwidth. Fixed to upload up to 5 parts concurrently. Verified via a 60MB test upload with concurrent parts: downloaded file's SHA-256 hash matched the original exactly, confirming no corruption from parallel chunk assembly
- **Fixed "failed to finalize upload" on large files**: the `/api/uploads/complete` and `/api/uploads/presign` routes never had an explicit Vercel function timeout set, so they were using the platform default (10s on Hobby) — for an 80+ part upload, that's not enough time. Added `export const maxDuration = 60` (Hobby's max) to both routes. Also improved the client-side error message to include the actual HTTP status code so future failures are easier to diagnose
- **Download speed throttling for Free/anonymous (2026-08-01)**: added a server-proxied, speed-capped download path (~8 MB/s) for Free/anonymous downloads via a new Edge Runtime route (`/api/stream`) — Pro downloads still redirect straight to B2 at full speed, unthrottled. Data integrity verified (SHA-256 hash match after a 20MB round-trip through the proxy). **The exact throttle rate could not be calibrated locally** — local Next.js dev server's Edge Runtime emulation has its own overhead (a 20MB file took ~30s locally even with throttling disabled entirely, proving the delay logic wasn't the bottleneck), so real production timing needs to be verified on the deployed Vercel Edge Function before trusting the 8 MB/s figure is accurate
- **Cancel an in-progress upload**: added a working Cancel button during upload (uses `AbortController` threaded through both single and concurrent-multipart upload paths). Cancelling a multipart upload also calls a new `/api/uploads/abort` route to abort the incomplete upload on B2 (verified server-side: after abort, attempting to complete that upload correctly fails), so cancelled uploads don't leave orphaned storage sitting on B2 indefinitely
- **Site logo added**: Cerberus-emerging-from-a-box mark, used in the header (with `dark:invert` since the source art is solid black on transparent) and as the favicon (`src/app/icon.png`, replacing the default Next.js favicon)
- **Logo polish (2026-08-01)**: favicon regenerated with a solid black rounded-square background + the logo inverted to white and enlarged (9% padding vs. the original 16%) for a clean, professional look on any tab bar (GitHub-style); header logo size increased 24px → 28px → 44px after user feedback that it was still too small. Verified live on production (`view-source` on the homepage confirms `width="44"` and the `/icon.png` link tag). Favicon was then revised again: the full logo (three dog heads + box) turned into an unreadable blob at real favicon size (16x16) because of its fine line detail, confirmed by rendering it down and inspecting pixel-for-pixel — first fix dropped the dogs and kept just the box, but that changed the recognizable brand mark, so it was redone once more with a tighter, squarer crop that keeps the three dog heads legible at both 16px and 32px
- **NSFW gate bypass fixed (2026-08-01)**: the age-gate only blocked the inline preview — the Download and Copy-link buttons were rendered unconditionally outside the gated component, so anyone could skip "I am 18+" entirely and download flagged content directly. Fixed by moving Download/Copy-link inside the same client-side gate as the preview (`src/app/f/[slug]/nsfw-gate.tsx`); the Report button stays outside the gate since reporting shouldn't require an age click-through
- **Malware hash check on upload (2026-08-01)**: client hashes the file with SHA-256 (Web Crypto, runs concurrently with the upload so it doesn't add wait time) and sends the hash to `/api/uploads/complete`, which checks it against VirusTotal's free hash-reputation API (`src/lib/virustotal.ts`). If 2+ AV engines already flag that exact hash as malicious, the upload is rejected and the B2 object is deleted/aborted before any File/ShareLink record is created. This only catches previously-seen malware (hash lookup, not a live scan of novel files) and fails open if `VIRUSTOTAL_API_KEY` isn't set or the API call fails — **you need to create a free VirusTotal account and add `VIRUSTOTAL_API_KEY` to both `.env.local` and Vercel prod env vars**, otherwise this check silently does nothing
- **Download progress bar (2026-08-01)**: replaced the plain `<a href>` download link with a JS-driven download (`src/app/f/[slug]/download-button.tsx`) that fetches the file via `fetch()`, reads it in chunks with a `ReadableStream` reader, and shows a live progress bar + percentage — matches the upload page's progress UI. This matters most for Free/anonymous downloads, which are throttled to ~8MB/s server-side, so a multi-hundred-MB file can take a while and previously gave no feedback that anything was happening. Once complete, the file is assembled into a Blob and saved via a programmatic link click, so the browser tab never navigates away. **Not yet verified in a real browser against production** — needs a real test to confirm the cross-origin fetch to B2's presigned URL (Pro's full-speed path) actually works given the existing CORS rule, since that path was reasoned through from the existing CORS config rather than tested live

## 🐛 Resolved issues (kept for history)

- **Vercel build failures**: fixed by adding `prisma generate` to the build command (Vercel caches `node_modules`, so a stale Prisma Client from before a schema change could cause type errors) and wrapping `/login`'s `useSearchParams()` in a Suspense boundary, and making the Stripe client lazy-initialized instead of created at module load
- **`blutobox.vercel.app` domain 404**: the original `blutobox` Vercel project had some broken internal link between its domain and deployments that never resolved despite valid-looking config. Fix was creating a fresh project (`blutobox-14ks`) from the same GitHub repo — bypassed the issue entirely. The old `blutobox` project (and an accidental duplicate `blutobox-p594`) should be deleted from Vercel if not already done
- **B2 uploads failing with CORS error in browser**: B2's simple "share with this origin" UI preset only allows `HEAD`/`GET` — no `PUT`. Fixed by setting the CORS rule directly via the S3-compatible API (`PutBucketCorsCommand`) instead of the web UI
- **Dev-server session confusion (2026-08-01)**: after a long dev session with many hot-reloads, `auth()` briefly stopped recognizing valid sessions in Server Components/Route Handlers even though NextAuth's own `/api/auth/session` endpoint still worked. A full dev-server restart + clearing `.next` fixed it. Not a code bug — likely Next.js dev-mode state getting stale after extended hot-reloading. If this recurs, restart the dev server first before assuming something's broken

## ⏳ Deferred until you buy blutobox.com

- **Cloudflare in front of B2**: right now uploads/downloads talk directly to B2. Once you have a domain, front the bucket with Cloudflare for free egress via the Bandwidth Alliance (this is what keeps bandwidth costs near-zero at scale)
- ~~Resend domain verification~~ — no longer needed for signups, switched to Gmail SMTP instead (free, works today). Could still set up Resend + domain later for a more "professional" sender if desired
- **B2 CORS rule**: currently allows `localhost:3000` + `blutobox-14ks.vercel.app`. Needs your real domain added (and possibly the old vercel.app origin removed) once you have one
- **NEXTAUTH_URL**: currently `https://blutobox-14ks.vercel.app` in Vercel env vars, needs to become the real domain

## ⚠️ Still needs doing regardless of domain

- **Push local commits AND redeploy on Vercel**: check GitHub Desktop for unpushed commits and push them, then redeploy — I can't push myself. (2026-08-01: the subscription-cancel webhook fields weren't live on a real Stripe event until this happened — good reminder that "committed" ≠ "live." As of the latest commit this has been confirmed redeployed and working.)
- **Rotate the Stripe live secret key AND the webhook signing secret** before calling this "production ready" — both ended up in this chat's history during setup. Stripe dashboard → API keys → roll key; Developers → Webhooks → your endpoint → roll signing secret (update `STRIPE_WEBHOOK_SECRET` in Vercel after)
- **Update the Stripe public business name** — checkout currently shows your real/personal name to customers by default; fix in Stripe Dashboard → Settings → Business → Public details (already done for this account, showing "Aoinyx" — just noting for anyone else setting this up)
- Consider refunding/canceling the test Pro subscription from the real purchase above if you don't want to keep paying for it (Stripe Dashboard → Customers → find the subscription → cancel, and refund the charge if desired)
- **Have a lawyer review the ToS/Privacy Policy** — current versions are templates with placeholder contact emails (`legal@blutobox.com`, `privacy@blutobox.com`) and a `[DATE]` placeholder. Fine for testing, not for real users
- **Register a DMCA agent** with the US Copyright Office (~$6) once you're operating publicly — strengthens your legal safe-harbor position
- **Decide on ads for the free tier** (discussed earlier: standard AdSense conflicts with NSFW content policy — if you want ads, look at adult-friendly networks like ExoClick/JuicyAds instead, or skip ads and rely on Pro subscriptions only)
- **Delete unused Vercel projects**: old `blutobox` and `blutobox-p594` if not already removed
- **Verify the Free/anonymous download throttle speed on production** — test a real download on `blutobox-14ks.vercel.app` and time it. Target is ~8 MB/s; adjust `THROTTLE_BYTES_PER_SEC` in `src/app/api/stream/route.ts` if the real Vercel Edge Function timing doesn't match (local dev testing wasn't representative — see note above)

## Accounts/credentials already set up (in `.env.local`, not committed to git — also added to Vercel prod env vars)

- Neon (Postgres)
- Backblaze B2 (storage)
- Stripe (**live mode** — be careful testing). `STRIPE_WEBHOOK_SECRET` now set and verified working
- Resend (installed but unused — sandbox mode only, see above)
- Gmail SMTP (`aoinyx.dev@gmail.com` + app password) — active email sender
- Upstash (rate limiting)
- `CRON_SECRET` (self-generated, protects the cleanup endpoint from unauthorized triggering)

## Where things live

- **Live site**: https://blutobox-14ks.vercel.app/
- Admin dashboard: `/admin/reports` (your account `azrele2@gmail.com` is set as ADMIN)
- Pricing page: `/pricing`
- This checklist: keep it updated as things change — it's meant to be the source of truth for "what's left"
