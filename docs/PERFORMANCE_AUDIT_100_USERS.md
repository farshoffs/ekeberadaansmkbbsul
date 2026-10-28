# Launch performance audit — 100 daily users

## Scope

Audit target: 100 active daily users with a morning punch burst, GitHub Pages frontend, Apps Script backend and Google Sheets persistence.

## Key findings

1. Static frontend size is bounded and content-hashed; growth over days is primarily backend data-access growth, not browser bundle growth.
2. The punch path currently holds one ScriptLock while reading daily attendance, absence data, writing attendance/audit and creating review rows. That serializes a burst.
3. A new attendance row invalidates the global attendance index, causing later requests to rebuild an A:B index over historical attendance. This cost grows with time.
4. TIDAK_HADIR and SEMAKAN_WAKTU were only memoized per execution, so concurrent executions repeatedly reread full sheets.
5. Session renewal can rewrite trusted-device metadata frequently and invalidate a cache shared by all users.
6. Session-secret and Pages-origin properties were reread on every RPC.
7. gh-pages orphan publication could preserve untracked node_modules after npm install, bloating the deployment branch.

## Phase 1 applied

- User/settings CacheService TTL: 300 seconds.
- Trusted-device read cache: 60 seconds; stable-device metadata touch capped to once per hour.
- Shared 60-second caches for absence and time-review rows with explicit invalidation on writes.
- Runtime/CacheService session-secret and Pages-origin caching.
- Time-review writer supports an assumeNew fast path for the serialized punch flow.
- gh-pages publication cleans untracked/ignored files before copying _site.

## Phase 2 target

- Maintain attendance index/day map incrementally on append instead of invalidating/rebuilding.
- Use a compact IP/hour cache instead of scanning every today's row per punch.
- Keep the ScriptLock only around the minimal attendance read/write critical section.
- Move audit/review/email work after the lock.
- Record lock wait/hold telemetry for launch verification.

## Launch verification

Before and after deploying the modular Apps Script backend, run `diagnosePerformanceBackend()` from the Apps Script editor and retain its output. Perform a controlled burst test before launch. Backend source changes are not live until the existing Apps Script Web App is published as a new version.


## Phase 2 implemented

- Attendance index V3 includes a `date|email` row map, so punch reads only the target user's row.
- First punch appends incrementally update the shared attendance index instead of invalidating and rebuilding it.
- IP duplicate checks use one hour-level CacheService registry; the first request seeds it and subsequent requests are O(1) lookups.
- The global ScriptLock now contains only row lookup, punch sequence/IP decision and the attendance write/cache update.
- Audit, time-review creation and notification email run after the lock is released.
- Successful punch responses include `performance.lockWaitMs`, `lockHeldMs` and `totalMs` for staged launch testing.

### Launch gate

Do not certify exact 100-at-once capacity from static analysis alone. Deploy the matching Apps Script version, then stage 20, 50 and 100 concurrent/near-concurrent punches and inspect lock timings, Apps Script execution errors and duplicate-row count.
