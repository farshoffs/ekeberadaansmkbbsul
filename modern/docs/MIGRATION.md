# eKeberadaan — Apps Script → Next.js PWA

## Architecture

- **Frontend:** Next.js 16 / React 19, responsive PWA for desktop + mobile.
- **Backend:** Next.js Route Handlers (`/api/*`), all privileged operations run server-side.
- **Database:** existing Google Spreadsheet via Google Sheets API. Sheet names and column order remain compatible with the Apps Script deployment.
- **Authentication:** DELIMa email + existing 6-digit PIN hash compatibility. Sessions move to secure first-party HttpOnly cookies with 30-day trusted devices.
- **Timezone:** all attendance business logic uses `Asia/Kuala_Lumpur`.

## Milestone 1 implemented

- Existing `PENGGUNA` login + 6-digit PIN verification.
- First-time PIN setup.
- 30-day session using HttpOnly cookie.
- Maximum two trusted devices using existing `SESI_PERANTI` sheet.
- GPS punch in/out with 1 or 2 sessions per day.
- Late / early detection and `SEMAKAN_WAKTU` creation.
- Monthly punch card data.
- Tidak Hadir / Keberadaan submission + own-record list.
- Installable PWA shell and mobile-first interface.

## Environment setup

1. Create a Google Cloud service account and enable **Google Sheets API**.
2. Share the eKeberadaan Google Sheet with the service-account email as **Editor**.
3. Set the variables in `.env.local` based on `.env.example`.
4. Copy the current Apps Script Script Property `EK_PASSWORD_PEPPER` to `EK_PASSWORD_PEPPER`. This allows existing PIN hashes in `PENGGUNA` to continue working without resetting all users.
5. Use a strong new `EK_WEB_SESSION_SECRET` (32+ random bytes).
6. Deploy to Vercel or another Node.js hosting platform.

## Next migration milestones

- Full Pentadbir Sistem: users, schedules, PIN reset, trusted-device management, settings.
- Daily and period reporting + PDF generation.
- Semakan Tidak Hadir / Keberadaan approval workflow.
- Semakan Lewat / Balik Awal approval workflow.
- IP duplicate warning/block parity.
- Profile photo sync/read via Google Drive API.
- Scheduled email notifications moved from Apps Script triggers to Vercel Cron / scheduled worker.
- Final parity test, then retire Apps Script web UI while keeping the same Google Sheet database.
