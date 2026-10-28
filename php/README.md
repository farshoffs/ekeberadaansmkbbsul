# eKeberadaan — PHP / MySQL migration (staging)

This folder is a **server-side MySQL adapter** for the existing eKeberadaan user interface. The original Apps Script application in the repo root is preserved. The PHP site starts at **/php/index.php** (NOT Index.html). It renders the existing HTML/CSS/JS but replaces google.script.run with same-origin POST requests to php/api.php.

## Required steps on cPanel

1. In phpMyAdmin, select the **existing, correctly named database**.
2. Import the private **eKeberadaan_SMKBBSL_mysql.sql** export from the original workbook. It contains personnel records and authentication/session history. **DO NOT upload that SQL dump to public GitHub.** Importing it again DROPS and recreates the named tables: make a backup first.
3. In the same database, import **php/schema.sql**, which adds web_auth and web_sessions.
4. Deploy the entire repository as a directory on the hosting server (example: public_html/ekeberadaan). PHP 8.1+ and PDO MySQL are required. Open the URL **https://YOUR-DOMAIN/ekeberadaan/php/index.php**.
5. On the server, copy php/config.local.example.php to **php/config.local.php**. Enter actual database credentials there. The file is ignored by Git and denied by Apache rules. Hosting MySQL normally uses host=localhost; **165.99.198.5:3306 could not be reached externally during preparation**, so check cPanel's actual MySQL host. Keep the password only on the host, not the repo, messages, or screenshots.
6. In cPanel Terminal, run **php php/cli_set_pin.php registered@example.com** to set a NEW PHP PIN for an administrator. The script reads the PIN from STDIN and revokes that account's PHP sessions. Repeat for other staff under an authorized PIN distribution policy. Old Google Apps Script PIN hashes require a private Apps Script pepper and **cannot be reused directly**; the imported legacy password/session rows are not accepted for PHP sign-in.
7. Log in at /php/index.php using the email + the new PHP PIN. Test a non-production record first; confirm it appears in phpMyAdmin.

## Current functionality

- MySQL PDO connection, 30-day hashed bearer sessions, existing-user lookup, server-side PHP PIN authentication and lockout.
- Dashboard, current attendance, GPS/radius validation, sequential session 1/2 punch in/out; new punches write to MySQL.
- Punch-card month reads, daily admin summaries, user management, settings, absence requests and reviews, time review and device session revocation.
- SQL-based audit writes; historical workbook data remains in its imported tables.

## Limitations before going live

**This is not a 1:1 replacement for the original Apps Script. Do not switch your production school deployment over without testing.** The following are NOT yet ported: emails and scheduled notifications; Google Drive profile photos; Google Docs/PDF generation, export sheet generation; advanced WBF rules, IP policy, unexplained-absence auto-generation and advanced time-review creation; duplicate-repair tooling. Record and absence status calculations are simplified compared with the Apps Script source.

For now, absence approval updates the request record, not every derived attendance row. The old and new systems must **not both accept live punches** or they will diverge.

## Security

- No MySQL password or live user data belongs in GitHub.
- The source workbook includes historical hashed credentials and old sessions. Only the new web_auth/web_sessions tables are active in the PHP app.
- All SQL parameters are bound via PDO; users are authenticated before private operations; administrator functions check role server-side.
- HTTPS is required for GPS browser permissions and token safety.
- The database credential shared in chat should be rotated in cPanel before production deployment.
- php/config.local.php is excluded from Git. If using nginx instead of Apache, add the equivalent deny rule; test direct access is blocked.
- If a database dump needs to be reimported later, back up any NEW PHP attendance first. The original SQL export drops/recreates the imported tables.

## Quick checks

1. Run: php -l php/_lib.php && php -l php/api.php && php -l php/index.php && php -l php/cli_set_pin.php
2. Visit /php/index.php over HTTPS and check the browser Network tab for POST to php/api.php.
3. Login only after php/schema.sql and a PHP PIN are created.
4. Verify read-only history from punch cards and admin screens.
5. Record one test punch in a staging database; compare fields in MySQL.

This repository DOES NOT by itself configure or upload anything to the live cPanel database; PHP must be deployed on that server, with a server-side config, and the private data imported separately.
