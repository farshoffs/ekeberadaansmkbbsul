# e-Keberadaan Web

Modern web/PWA migration of the original Google Apps Script e-Keberadaan application.

## Stack
- Next.js 16 + React 19 + TypeScript
- Google Sheets as the source-of-truth database
- Google Drive for existing profile-photo file IDs
- HttpOnly JWT session + trusted-device records stored in `SESI_PERANTI`
- PWA for installable mobile web use
- Optional Resend email relay + Vercel Cron

## Existing Google Sheets kept unchanged
`PENGGUNA`, `TETAPAN`, `KEHADIRAN`, `AUDIT`, `LAPORAN_HARIAN`, `TIDAK_HADIR`, `SEMAKAN_WAKTU`, `LOG_LOGIN`, `SESI_PERANTI`.

## Required environment variables
Copy `.env.example` to `.env.local` and set:
- `GOOGLE_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `EK_PASSWORD_PEPPER` **must match the Apps Script `EK_PASSWORD_PEPPER` value** so existing PIN hashes continue to work.
- `EK_WEB_SESSION_SECRET`
- `EK_TRUSTED_DEVICE_SECRET` (optional; falls back to web session secret)

Share the Google Sheet with the service-account email as **Editor**. For profile photos, share the relevant Drive folder/files with the same service account.

## Optional notifications
Set `RESEND_API_KEY`, `MAIL_FROM`, and `CRON_SECRET`. `vercel.json` defines punch-reminder, daily-report, and presence-expiry cron endpoints.

## Local
```bash
npm install
npm run typecheck
npm run build
npm run dev
```

## Deploy
Vercel is the simplest deployment target because the project uses server-side routes, HttpOnly cookies, and scheduled cron endpoints. Set the environment variables in the deployment platform before going live.


## Production Google Sheet

Spreadsheet ID: `18XP3epj-kKTgjeeUdYxIrseyh4y_fJHoY0ygNXrtFZA`

The service account configured in deployment must be granted **Editor** access to this spreadsheet.
