# Migration parity

Implemented in the modern web build:

- DELIMa registered-email + 6-digit PIN login
- Legacy Apps Script salted HMAC PIN compatibility
- First-time / reset PIN setup
- 30-day trusted-device session, maximum two active devices
- Login lockout and login log
- GPS radius and accuracy validation
- Malaysia timezone (`Asia/Kuala_Lumpur`)
- Alternating IN/OUT flow, optional Session 2
- Lewat / Balik Awal flags and review records
- IP tracking with OFF / WARN / BLOCK policies
- Digital monthly punch card
- Tidak Hadir / Keberadaan request, cancellation, management approval
- Approved Tidak Hadir writes into KEHADIRAN
- Approved Keberadaan can acknowledge matching late-review records
- Public absence/presence list plus unexplained no-punch entries
- Admin daily attendance view and manual correction
- User/admin/category/job/schedule management
- PIN reset, account unlock, trusted-device management
- System settings management
- Attendance duplicate repair
- Period/daily reports, Google Sheet output and PDF output
- Existing Google Drive profile-photo IDs
- Optional email reminders/reports and cron endpoints
- Responsive desktop/mobile PWA shell

## Cut-over
1. Keep the Apps Script deployment live while testing the migration branch.
2. Create a Google Cloud service account and enable Google Sheets API (and Drive API for profile photos).
3. Share the existing spreadsheet with the service account as Editor.
4. Copy the existing Apps Script `EK_PASSWORD_PEPPER` value to the web deployment secret.
5. Set all required environment variables.
6. Run CI/build, deploy a staging URL, and test with real accounts in `SYSTEM_MODE=TEST` first.
7. Switch to `REAL`, validate school GPS coordinates/radius, then cut over the public URL.
