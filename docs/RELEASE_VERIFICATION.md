# Release verification — 13 November 2026

This release updates the practice UI, profile/avatar fallback, clap baseline, Codeforces caching, profile/submission handling, and the API's validation and administrative authentication.

## Automated checks

- Frontend ESLint: passed without warnings.
- Frontend TypeScript and production build: passed.
- Frontend regression tests: 8 passed.
- Backend TypeScript build and HTTP regression tests: 8 passed.
- Frontend HTTP smoke tests against the production build: 4 passed.
- Full npm advisory scans: zero known vulnerabilities in both repositories at verification time.
- Git whitespace checks: passed.

The HTTP smoke suite checks public routes, redirects and sitemap, API method/parameter/prototype validation, duplicate parameter rejection and report-origin validation. Backend tests cover no-database availability, concurrent problem refresh coalescing, admin authentication before DB access, malformed JSON, numeric limits and literal regex search.

## Local timing sample

Twenty requests per endpoint, concurrency five, after warm-up on the developer machine. These measurements are local and are not an internet-scale load test or a production latency guarantee.

| Endpoint | P50 | P95 | Errors |
| --- | ---: | ---: | ---: |
| http://localhost:3000/ | 11 ms | 14 ms | 0 / 20 |
| http://localhost:3000/api/health | 9 ms | 10 ms | 0 / 20 |
| http://localhost:3000/api/codeforces/problemset.problems | 156 ms | 234 ms | 0 / 20 |
| http://localhost:4000/api/health | 5 ms | 10 ms | 0 / 20 |
| http://localhost:4000/api/problems | 68 ms | 122 ms | 0 / 20 |

The public Codeforces catalogs have shared CDN cache headers plus bounded instance caches. Duplicate requests coalesce, equivalent catalog query variants share entries, and upstream calls are spaced. User-specific responses are private and are not put into the shared CDN cache.

Removed the unused global icon-font package and replaced its three icons. Production CSS is approximately 156 KB uncompressed, down from approximately 220 KB before this release pass; icon font assets are no longer needed.

## Clap starting total

The requested baseline is 157,452. Redis seeds/raises the shared total atomically and does not reset a total already above the baseline. Without Redis, the button displays that baseline plus device-local additional claps, labeled LOCAL. Browser checks verified the button remains visible and local claps survive a reload.

## Browser verification

Desktop and mobile light/dark layouts, profile loading, image-host failure with initials fallback, search empty state, pagination boundaries, topics, contest categories, stats, clap visibility and local persistence were checked during this release work.

## Operational limits

MongoDB integration, SMTP delivery and internet-scale load are not established by mocked/local tests. Do not treat the checks as a zero-bug guarantee. Production readiness should include checking the actual deployed endpoints and connected service state.

Upstream quota spacing and report throttling are per process. Multiple server replicas need shared quota coordination and a distributed abuse limiter. Administrative contest sync can exceed short serverless execution windows; run it with sufficient worker time. The browser's core practice flows do not depend on that sync.

Both repositories use Node.js 22.x. No secrets are included in this release; the tracked frontend production environment file contains only the public API base URL.
