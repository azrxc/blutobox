// @ts-expect-error `.open-next/worker.js` is generated at build time, doesn't exist until then
import { default as handler } from "./.open-next/worker.js";

export default {
  fetch: handler.fetch,

  // Replaces Vercel's vercel.json cron config (0 3 * * * - daily at 3am UTC, set to
  // match in the Cloudflare dashboard's Cron Triggers UI or wrangler.jsonc). Calls the
  // same /api/cron/cleanup endpoint Vercel used to hit, reusing the existing tested
  // logic and auth instead of duplicating it here.
  async scheduled(
    _event: ScheduledController,
    env: { CRON_SECRET?: string },
    ctx: ExecutionContext
  ) {
    ctx.waitUntil(
      fetch("https://blutobox.com/api/cron/cleanup", {
        headers: { Authorization: `Bearer ${env.CRON_SECRET ?? ""}` },
      })
    );
  },
  // @ts-expect-error ExportedHandler type doesn't need to be imported explicitly here
} satisfies ExportedHandler<{ CRON_SECRET?: string }>;

// Re-export in case OpenNext's build relies on these being present (DO-based queue/tag
// cache) - harmless no-op if this project isn't using them.
// @ts-expect-error `.open-next/worker.js` is generated at build time
export { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";
