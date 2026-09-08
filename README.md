# eKeberadaan SMKBBSUL

Production architecture:

`GitHub Pages -> Google Apps Script -> Google Sheets / Drive`

Live web: https://farshoffs.github.io/ekeberadaansmkbbsul/

## Source of truth

- `Index.html`, `Styles.html`, `Scripts.html`, `Logo.html` — editable UI source used by the static build.
- `web/` — GitHub Pages bridge/config source.
- `scripts/build-pages.py` — generates the optimized static site with hashed assets, cacheable JS/CSS/logo and service worker.
- `apps-script/` — canonical modular Apps Script backend. The old monolithic `Code.gs` is no longer part of this architecture.
- `docs/` — architecture, performance and security notes.

## Backend modules

The Apps Script backend is split by responsibility instead of one large `Code.gs`:

- `00_Core.gs` — constants, Spreadsheet/runtime/cache primitives and `doGet`.
- `10_Auth.gs` — PIN/login/session token authentication.
- `11_Sessions.gs` — 30-day trusted devices.
- `20_UserApi.gs` / `21_AdminApi.gs` — user/admin API operations.
- `30_Reporting.gs` — reports/PDF/Sheets reporting.
- `40_UsersData.gs` — cached user data.
- `41_AttendanceData.gs` — indexed attendance access.
- `42_Settings.gs` — cached settings.
- `50_Notifications.gs` — email/reminder/trigger workflows.
- `60_TimeReview.gs` — late/early review.
- `61_Absence.gs` — Tidak Hadir / Keberadaan.
- `70_Profile.gs` — profile photo/Drive access.
- `80_Utilities.gs` — shared helpers.
- `90_Setup.gs` — schema/setup helpers.
- `95_Diagnostics.gs` — read-only editor diagnostic.
- `Bridges.gs` + `Bridge.html` — GitHub Pages RPC bridge.

## Performance design

- Initial HTML is about 39 KB instead of the previous ~600 KB inline page.
- CSS, JS and logo are separate content-hashed assets and can be cached by the browser/service worker.
- No redundant Apps Script ping is performed before the first real RPC.
- `PENGGUNA` and `TETAPAN` use short server caches plus per-execution memoization.
- `KEHADIRAN` uses a compact row/date/month index, so common daily/monthly queries do not scan the entire attendance table.
- login-history lookups are built once as a cached Set instead of repeatedly scanning `LOG_LOGIN`/`AUDIT` per user.
- `TIDAK_HADIR` and `SEMAKAN_WAKTU` are memoized within an Apps Script execution while approval updates are kept immediately consistent.

## Deployment

Frontend deployment is automatic through GitHub Actions to `gh-pages`.

Apps Script deployment is intentionally manual. Follow `apps-script/DEPLOY_MANUAL.md`. No `clasp`, service-account credential or GitHub Actions OAuth secret is required.

Timezone: `Asia/Kuala_Lumpur`.
