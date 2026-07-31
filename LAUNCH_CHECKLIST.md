# Bluto Box — Launch Checklist

Running notes on what's done and what's left, so nothing gets forgotten if this project is picked back up later.

## ✅ Built and working (tested end-to-end locally)

- Auth: email/password signup, email verification, login, sessions (NextAuth)
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
- Inactive-file cleanup: files with no downloads in 30 days are auto-deleted to control storage cost — **Pro-owned files are exempt**. Runs via Vercel Cron daily at 3am UTC (`vercel.json`), hitting `/api/cron/cleanup`, protected by `CRON_SECRET`. Note: Vercel Cron only fires on deployed environments, not locally — the sweep logic itself is tested and confirmed working, but the actual daily schedule can only be verified once deployed

## ⏳ Deferred until you buy blutobox.com

- **Cloudflare in front of B2**: right now uploads/downloads talk directly to B2. Once you have a domain, front the bucket with Cloudflare for free egress via the Bandwidth Alliance (this is what keeps bandwidth costs near-zero at scale)
- **Resend domain verification**: emails currently only deliver to your own Resend account email (sandbox mode restriction). Real users can't get verification emails until a custom domain is verified in Resend
- **B2 CORS rule**: currently allows only `http://localhost:3000` as an origin. Needs your production URL added once you have one
- **NEXTAUTH_URL**: currently `http://localhost:3000`, needs to become the real domain in production env vars

## ⚠️ Still needs doing regardless of domain

- **Push local commits**: check GitHub Desktop for unpushed commits and push them — I can't push myself (blocked by permission settings), so this is on you each time
- **Add all env vars to Vercel project settings** (Vercel → Project → Settings → Environment Variables). Nothing will work in production until these are added — see `.env.example` for the full list
- **Test the full Stripe webhook flow with one real purchase** — Checkout session creation is verified working, but the webhook that actually upgrades a user to Pro after payment hasn't been tested end-to-end yet. Needs a webhook endpoint configured in Stripe (Developers → Webhooks → Add endpoint → point at `https://yourdomain.com/api/stripe/webhook`, select `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`) and the resulting signing secret added as `STRIPE_WEBHOOK_SECRET`
- **Rotate the Stripe live secret key** before calling this "production ready" — it ended up in this chat's history during setup. Stripe dashboard → API keys → roll key
- **Have a lawyer review the ToS/Privacy Policy** — current versions are templates with placeholder contact emails (`legal@blutobox.com`, `privacy@blutobox.com`) and a `[DATE]` placeholder. Fine for testing, not for real users
- **Register a DMCA agent** with the US Copyright Office (~$6) once you're operating publicly — strengthens your legal safe-harbor position
- **Decide on ads for the free tier** (discussed earlier: standard AdSense conflicts with NSFW content policy — if you want ads, look at adult-friendly networks like ExoClick/JuicyAds instead, or skip ads and rely on Pro subscriptions only)

## Accounts/credentials already set up (in `.env.local`, not committed to git)

- Neon (Postgres)
- Backblaze B2 (storage)
- Stripe (**live mode** — be careful testing)
- Resend (sandbox mode only, see above)
- Upstash (rate limiting)
- `CRON_SECRET` (self-generated, protects the cleanup endpoint from unauthorized triggering)

## Where things live

- Admin dashboard: `/admin/reports` (your account `azrele2@gmail.com` is set as ADMIN)
- Pricing page: `/pricing`
- This checklist: keep it updated as things change — it's meant to be the source of truth for "what's left"
