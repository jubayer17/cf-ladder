# CF Ladder client

A Codeforces practice desk: rating ladders, topic and contest archives, submission tracking, solving streaks and statistics. The interface uses paper and ink colors, squared controls and colorful neo-brutalist panels, with light and dark themes.

## Run

Use Node.js 22.18+ and npm. Run `npm ci`, then `npm run dev`. Open http://localhost:3000. For production, run `npm run build` followed by `npm start`.

Core features use the same-origin `/api/codeforces/[method]` route and do not need MongoDB or a separate Express deployment. The route validates methods and parameters, limits upstream request concurrency, deduplicates identical requests, spaces upstream calls and maintains a bounded in-memory cache with stale fallback. These controls apply per running instance; a larger deployment should coordinate quotas and caching through a shared store.

## Configuration

Copy `.env.example` to `.env.local` only if enabling optional services. Upstash credentials enable applause; Gmail credentials enable bug reporting. Without credentials, the clap button remains visible and saves additional claps on this device. The starting total is 157,452; the shared Redis counter is atomically raised to that baseline without resetting totals already above it. Bug reporting returns a service-unavailable response until SMTP is configured. Never expose server credentials through `NEXT_PUBLIC_*` variables.

Reports accept text up to 5000 characters and up to three PNG/JPEG/WebP/GIF/text attachments totaling 5 MB. Requests are bounded at 6 MB and throttled once a minute per reported client IP per process. Production ingress should supply trusted client IP headers; distributed abuse prevention requires a shared limiter.

## Checks

- `npm run lint`
- `npm test` — streak boundaries, local dates, submission verdict updates, optional storage and API failures
- `npm run build`
- `npm run test:smoke` — HTTP smoke checks against a running build (`TEST_BASE_URL` can point to production)
- `npm audit`

The minimatch override updates the TypeScript ESLint parser's transitive dependency to the patched major. Keep lint in verification when updating it.

Profile requests commit only after successful loading and discard superseded responses. Statistics share those submissions instead of making independent profile downloads. Problem cache entries expire after one hour; browser storage failures are nonfatal. Activity counts each problem on its first accepted submission using the browser's local calendar date.

The adjacent Express service remains available for persisted contest administration. Its admin secret belongs only in server-side tooling, never in this frontend.
