# eKeberadaan Production Deployment

## Build status
The Next.js migration in `modern/` passes the repository CI typecheck and production build.

## Database
Production Google Sheet ID:
`18XP3epj-kKTgjeeUdYxIrseyh4y_fJHoY0ygNXrtFZA`

## Required production environment variables
- `GOOGLE_SHEET_ID=18XP3epj-kKTgjeeUdYxIrseyh4y_fJHoY0ygNXrtFZA`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `EK_PASSWORD_PEPPER` — must match the existing Apps Script property for existing PIN compatibility
- `EK_WEB_SESSION_SECRET`
- `EK_TRUSTED_DEVICE_SECRET`
- `CRON_SECRET`
- optional: `RESEND_API_KEY`, `MAIL_FROM`

## Google access
Share the production spreadsheet with the service-account email as Editor. Share the profile-photo Drive folder with the same service account if profile photos are required.

## Runtime
- Timezone: `Asia/Kuala_Lumpur`
- Google Sheets remains the production database.
- PWA/web application is deployable on Vercel.

## Current deployment blocker
The connected Vercel integration can create a deployment, but its OAuth token is not currently authorized for the `farhan-shoffis-projects` scope. Re-authorize the Vercel connection for that scope, then redeploy `modern/` using the production environment variables above.
