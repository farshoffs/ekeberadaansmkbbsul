# Performance strategy

## Frontend

The original Apps Script page embedded CSS, JavaScript and repeated base64 logo data into one response. The GitHub Pages build now emits a small HTML shell and cacheable content-hashed assets.

CI budgets:

- HTML < 100 KB
- JavaScript < 180 KB
- CSS < 100 KB
- whole generated site < 400 KB

Current measured build is roughly 39 KB HTML and ~260 KB total static content. GitHub-hosted HTML TTFB observed by the live smoke workflow has been around 0.03–0.06 seconds from a GitHub Actions runner.

The frontend no longer sends a dedicated `__ping__` RPC before loading real data. The first real Apps Script RPC doubles as the connection check.

## Google Sheets access

### Fast common paths

`PENGGUNA`
- full table is parsed at most once per execution;
- short CacheService cache avoids repeated reads across nearby executions.

`TETAPAN`
- cached similarly to users.

`KEHADIRAN`
- a compact index reads only date/email columns when rebuilding;
- daily lookups read only row groups for that date;
- monthly card lookups read only row groups for the requested month and user;
- range reports collect indexed row numbers instead of scanning every historical attendance row for each request.

Login history
- successful login emails are represented as a Set built from `LOG_LOGIN`/legacy `AUDIT` once, rather than scanning those sheets once per user.

Trusted devices
- short cache is used for reads;
- security-sensitive changes invalidate it instead of accepting a potentially stale authorization state;
- repeated session resume/page refresh within five minutes does not rewrite the same unchanged device/IP row;
- device/IP changes still persist immediately, and the next normal touch continues the rolling 30-day expiry.

`TIDAK_HADIR` / `SEMAKAN_WAKTU`
- memoized inside a single Apps Script execution;
- write operations explicitly invalidate the runtime copy to keep approval/review responses current.

### Concurrency correctness

The punch write path uses Apps Script `LockService` and releases the script lock in `finally`. This prevents simultaneous double-tap/retry requests from racing to create separate attendance rows. New-row writes invalidate the attendance index before future lookups.

### Intentionally broader operations

Duplicate repair, administrative bulk maintenance, schema/setup and some report generation may scan larger ranges. These are explicit maintenance/admin operations and are not used on the critical login/punch first-paint path.

## Validation

`95_Diagnostics.gs` contains `diagnosePerformanceBackend()`. Run it manually from the Apps Script editor after installing the modular backend. It reports counts and per-stage timings without changing attendance data.

GitHub CI additionally performs:

- generated JS syntax validation;
- concatenated Apps Script syntax validation;
- headless-Chrome runtime load;
- static performance budgets;
- canonical backend performance/correctness contract checks;
- live Pages / Apps Script bridge RPC smoke tests.

Optimization rule for future changes: reducing files is not itself a performance goal. Prefer fewer network/RPC round trips, indexed/batched Sheet reads, explicit cache invalidation and small cacheable browser assets.
