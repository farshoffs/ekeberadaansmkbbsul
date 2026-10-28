# Performance re-audit — 15 September 2026

Branch: `refactor/performance-v2`

## Executive summary

The app is already substantially modularized. The backend no longer lives in one multi-thousand-line `Code.gs`; `apps-script/` is split by domain. The frontend source still uses the large editable `Scripts.html`, `Styles.html` and `Index.html`, but the GitHub Pages build already emits content-hashed external assets and splits JavaScript into `core`, `attendance`, `absence`, `admin` and `exports` bundles.

Therefore, reducing source-file line count by itself will not materially accelerate the app. The current build loads all generated JavaScript bundles on every visit, so merely moving the same code into more source files changes maintainability, not first-load bytes or parse work. The larger performance wins are fewer Apps Script RPC round trips, fewer Spreadsheet service reads/writes, scalable indexes/caches, and keeping contention off the punch path.

The validated build at this audit produced 46,444 bytes HTML, 219,496 bytes JavaScript including Bootstrap, 304,835 bytes CSS including Bootstrap, and 654,255 bytes total static output before transport compression. The application-specific optional `absence` and `admin` bundles are about 53 KB combined, so lazy loading them is useful but still secondary to avoiding Google Sheets service work.

## Current architecture audited

- Browser: GitHub Pages static frontend.
- RPC: hidden form/iframe Apps Script bridge, with no separate startup `__ping__` request.
- Backend: modular Google Apps Script files under `apps-script/`.
- Database: Google Sheets, with runtime memoization and CacheService on common paths.
- Attendance: date/month/date+email row index, daily batched row-slot allocation, direct per-user row writes.
- Concurrency: no global lock for normal WARN/OFF punch policy; global lock remains only for daily slot allocation and strict IP BLOCK ordering.

## Findings

### P0 — oversized JSON cache cliff

The shared `cachePutJson_()` helper previously cached only JSON shorter than 90,000 characters. Once an attendance index, trusted-device collection, schedule history, absence collection or time-review collection exceeded that threshold, caching silently stopped. The next Apps Script execution would then rebuild the structure from Google Sheets again.

This is especially important for `KEHADIRAN`: the V3 index keeps date, month and date+email maps. Its serialized size grows with attendance history, so a fixed single-cache-item threshold eventually turns a fast cache hit into repeated historical A:B scans.

### Applied fix

Large JSON caches now use versioned CacheService shards. All shards are written first and a small manifest is published last. Readers either receive a complete generation or safely fall back to the Sheet if a shard is unavailable. Small payloads still use one normal cache entry.

This change automatically protects users, settings, trusted devices, attendance index, schedule history, absence and time-review caches without changing their public behavior.

### P0 — redundant Sheet read on every punch

`ensureAttendanceSlotForUser_()` already returns the current user's resolved attendance record. `punch()` then called `findAttendanceRecord_()` again, causing another index lookup and another full attendance-row read before the write.

### Applied fix

The punch path now reuses `slot.record`, with `findAttendanceRecord_()` retained only as a defensive fallback. Normal punch therefore removes one Spreadsheet row read per request.

### P0 — monthly punch card read amplified by total staff count

The previous `getAttendanceValuesForUserMonth_()` path took the month index, read every full attendance row for that month, and only then filtered to the requested email. For roughly 100 staff, a normal 30-day punch-card request could read about 3,000 attendance rows (roughly 105,000 cells at 35 columns) when the user only needs about 30 rows.

### Applied fix

`getAttendanceValuesForUserMonthFast_()` now performs at most 31 date+email index lookups and reads only the row numbers belonging to that user. `buildPunchCardMonthForUser_()` uses the narrow path for both the employee and admin punch-card views. The Sheet read now scales with days in the month, not with staff count × days.

### P1 — frontend is split but not lazy-loaded

The build generates multiple cacheable JavaScript assets, but all of them are emitted as deferred scripts in `index.html`. Admin, absence and reporting code is therefore downloaded and parsed even for a normal user who only opens Home and punches.

This is not the highest-priority bottleneck because the static site is already small compared with Apps Script/Sheets network latency, but it is the next useful frontend optimization. A future build can keep `core` + `attendance` eager and load `absence` / `admin` only when the relevant screen is opened. The global inline-handler export mechanism needs to be adapted at the same time so optional functions are registered after their bundle loads.

### P1 — global attendance index still grows with history

Sharding prevents the immediate 90k cache cliff, but the global V3 index still grows approximately with total historical attendance rows. If `diagnosePerformanceBackend()` reports that `cacheHealth.attendanceWithinConfiguredShardCap` is false, the next backend step should be a month/day-sharded attendance index rather than simply increasing cache capacity indefinitely.

### P2 — trusted-device and schedule-history collections are whole-table caches

Both collections are currently read/cached as whole arrays and filtered in memory. This is acceptable at current scale and is now protected by cache sharding, but per-user cache keys should replace whole-table caches if their row counts become large.

## Diagnostics added

`diagnosePerformanceBackend()` now reports:

- cold and warm timings for settings, users, attendance index, today's attendance, absence, time review, schedule history and trusted devices;
- row counts;
- serialized cache payload sizes;
- estimated cache-part count for each payload;
- whether the attendance index remains inside the configured shard cap.

Run it from the Apps Script editor after publishing the matching backend version. It is intentionally not exposed through the public Pages bridge.

## Verification performed in repository CI

The branch CI passed backend/frontend syntax validation, modular static build, desktop/mobile headless-Chrome runtime smoke, Bootstrap contracts, async-loading regression contracts, static performance budgets and canonical backend contracts after the cache and punch-path changes.

## Recommended launch verification

After copying the updated `apps-script/` files into the existing Apps Script project and publishing a new Web App version, run `diagnosePerformanceBackend()` twice and retain both outputs. Then use the existing burst harness at 20, 50 and 100 concurrent/near-concurrent users. Compare total punch time, slot wait, Sheet write time, Apps Script errors and duplicate attendance rows. Also compare `getMyPunchCardMonth` timing before/after deployment because it now uses a user-scoped monthly Sheet read.

## Priority order from here

1. Deploy and measure the sharded-cache, punch-read and narrow monthly-card changes.
2. If attendance cache approaches its shard cap, convert the global attendance index to month/day shards.
3. Lazy-load `absence` and `admin` browser bundles so line/module splitting produces a real first-load improvement.
4. If trusted-device or schedule-history tables grow materially, move them to per-user cache keys.
5. Keep maintenance/report scans off the login and punch critical paths.

The optimization target remains service work avoided per user action, not source-code line count.
