# Study workspace preview

## Scope
New study workspace with eight AI text modes, word counts, editable/copyable/downloadable output, local assignment planner, and links to existing file tools. No package, schema, upload, payment, or file-summary changes. Former game pages redirect to /study and game APIs are retired with HTTP 410; saved records and implementation history are preserved. Character reminder dispatch is removed from cleanup, but file cleanup remains.

## Before merging
- Run npm ci, npm run lint, and npm run build using a separate preview environment and test database. Consult the Next.js bundled docs as required by AGENTS.md.
- Test mobile/desktop, light/dark mode, login and verified users, free/Pro/pass limits, unavailable AI/Redis, 429 responses, output copy and downloads, planner persistence and export.
- Verify original upload, downloads, file summaries, billing, auth and cleanup still function. Test redirect and HTTP 410 behavior.
- Verify DeepSeek/OpenRouter processing disclosures and privacy notice; configure provider-side spending ceilings. Preview caps: 5 Free / 30 Pro requests per account per day, 60/network and 300 globally; 4,000 input characters and 2,400 output tokens. Attempts may count even on failure. Caps are not a monetary guarantee.
- Do not connect a preview to production database, storage or billing if avoidable. Do not deploy the branch as production until checks pass.
- Planner is local to the current browser, not account-synced. AI drafts are not persisted by this tool. Native app, sync, PDF import, interactive flashcards and reminders are future work.
- Rollback: revert the study commit, or redeploy the prior production revision. No database migrations or record deletions are required.

## International readiness
English interface, original-language mode and 17 explicit output languages; auto text direction for source/results. Test quality with native speakers, including Arabic right-to-left and non-space-delimited languages. Word counts are approximate for scripts without spaces. Full interface localization is future work.

## Creator preview
Test PNG/JPEG/WebP imports, color-key removal, crop presets, output sizes, slider adjustments, PNG transparency and JPEG white background, watermark and export on older phones. Image edits stay client-side; no new dependencies or service costs. Color-key is not AI segmentation. Test social text copy, calculator currencies and navigation. Full AI background removal, object removal, collage, and native app remain future work.

## PWA preview
Check manifest and 192/512 icons, Android Chrome install, iOS Safari Add to Home Screen, installed navigation, login persistence, offline fallback, and update/rollback. The service worker only caches the static offline notice; no personal data or API responses. Full offline tools, push reminders, native stores, and cloud notes are not implemented. PWA icons use a newly drawn box mark consistent with the design, not the original logo asset. The manifest is online-first; preview deployments may require authentication.
