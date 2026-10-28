# Deploy eKeberadaan in public_html/ekeberadaansmkbbsul

The PHP/MySQL app is a **staging migration**, not yet the complete Apps Script equivalent. Deploy the entire site inside **one folder** named **ekeberadaansmkbbsul**. The default URL is the folder URL; users do not need to type /php/.

## Exact cPanel layout

```text
public_html/
└── ekeberadaansmkbbsul/
    ├── .htaccess                     ← opens index.php by default
    ├── index.php                     ← public app entry
    ├── api.php                       ← public API entry
    ├── setup.php                     ← one-time browser installer; delete after use
    ├── Index.html                    ← existing Apps Script UI template
    ├── Styles.html
    ├── Scripts.html
    ├── Logo.html
    └── php/
        ├── index.php                 ← actual PHP app renderer
        ├── api.php                   ← database-backed API handlers
        ├── _lib.php                  ← PDO connection & helpers
        ├── setup.php                 ← installer implementation; delete after use
        ├── schema.sql                ← import once via phpMyAdmin
        ├── pin-ui.js
        ├── .htaccess                 ← blocks access to private config
        ├── config.local.example.php  ← copy to config.local.php on host
        └── config.local.php          ← create on host only; NEVER upload to GitHub
```

Other repository files (Code.gs, README.md, workflows, etc.) are from the original Apps Script project; they are not needed by the PHP runtime. You can leave them inside the deployment folder, but do **not** put anything outside `public_html/ekeberadaansmkbbsul/`.

The server's `public_html` folder itself does not change.

## Steps — NO Terminal or SSH

1. In GitHub `farshoffs/ekeberadaansmkbbsul`, click **Code → Download ZIP**.
2. Open **cPanel → File Manager → public_html**, create/open `ekeberadaansmkbbsul`. Upload the ZIP, then **Extract**. GitHub ZIP extracts into `ekeberadaansmkbbsul-main`: **move the contents** of that extracted folder into `public_html/ekeberadaansmkbbsul/`, not the extracted folder itself. Ensure `public_html/ekeberadaansmkbbsul/index.php` exists. In File Manager, enable **Show Hidden Files** if you need to see `.htaccess`.
3. In **phpMyAdmin**, open the existing database `ppdkmyna_ekeberadaansmkbbsul`. The 21 Excel-derived tables are already present: **do not reimport the original large Excel SQL**, which would drop/recreate tables. First back up the database. Import **only** `php/schema.sql` to add `web_auth`, `web_sessions`, and `web_setup_state`.
4. In **File Manager**, go to `public_html/ekeberadaansmkbbsul/php/`. Keep your existing private `config.local.php` (or copy `config.local.example.php` to it if it does not exist). Confirm the database connection; MySQL is usually `localhost` for a local cPanel database. **To preserve ALL existing Google Sheets PINs, add `legacy_pin_pepper` with the exact ORIGINAL `EK_PASSWORD_PEPPER` Script Property value from the source Google Apps Script project.** This value is NOT stored in Google Sheets and cannot be recovered from the 78 imported hashes. Keep it only on the host.
5. Get the original pepper from the **original Apps Script project** used to authenticate staff: Google Sheet → **Extensions → Apps Script** (or open the associated script project), then **Project Settings (gear icon) → Script Properties → EK_PASSWORD_PEPPER**. Copy its entire value into a new line in `php/config.local.php`: `'legacy_pin_pepper' => 'PASTE_THE_ORIGINAL_VALUE_HERE',`. Do **not** post the value in chat, send a screenshot, or commit it to GitHub. If the original project belongs to another account, its authorized owner must configure the server privately.
6. Open `https://YOUR-DOMAIN/ekeberadaansmkbbsul/`. Every existing imported `PIN_V1` user can use their **same existing email and 6-digit PIN**. On each user's first successful PHP login, the backend checks the Sheets HMAC hash and transparently saves a fresh PHP password hash in `web_auth`. Subsequent logins use PHP directly, without needing the pepper for that user. Users **do not re-register, activate accounts or change PINs**.
7. If staff genuinely forget a PIN, an administrator can still issue a temporary PIN via Pengguna → Reset PIN or bulk reset. This exception requires a PIN change, but normal users with existing PINs do not. The top bar includes **Tukar PIN**.
8. **Do NOT run the setup.php wizard merely to reactivate users**. It is only an optional first-admin recovery flow if no usable Google Sheets PIN and pepper are available. Once successfully used, delete BOTH `ekeberadaansmkbbsul/setup.php` and `ekeberadaansmkbbsul/php/setup.php` from hosting and remove `setup_key` from the config. The `web_setup_state` lock remains in MySQL.

## URL reference

| Purpose | URL (replace YOUR-DOMAIN) |
|---|---|
| App homepage | `https://YOUR-DOMAIN/ekeberadaansmkbbsul/` |
| First-time setup | `https://YOUR-DOMAIN/ekeberadaansmkbbsul/setup.php` |
| API | `https://YOUR-DOMAIN/ekeberadaansmkbbsul/api.php` |
| Private DB config | `public_html/ekeberadaansmkbbsul/php/config.local.php` (filesystem path only) |

Do not use `/php/index.php` as the public login link. It is still a supporting renderer within the same folder.

## Security and deployment verification

- HTTPS is required for setup and for GPS browser permissions.
- Check `https://YOUR-DOMAIN/ekeberadaansmkbbsul/php/config.local.php` **does not reveal the PHP source**; Apache should reject direct access. If PHP source is exposed or `.htaccess` isn't enforced, fix hosting permissions before proceeding.
- Rotate the database password previously shared, and keep it only in the private server config. Never upload a SQL dump or personnel data to the public repository.
- GitHub Actions verifies PHP syntax, client JavaScript syntax, and that the root index.php renders the PHP interface; actual database connectivity must be verified on your hosting.
- **Existing deployments:** Import the latest `php/schema.sql` through phpMyAdmin again. It checks and adds `must_change_pin` only when missing; existing PIN hashes and data stay intact. If login still returns HTTP 422, the updated error message identifies whether it is a MySQL connection, permissions, missing table or schema problem. In Chrome DevTools → Network → `api.php` → Response, inspect the `error` value (do not share secrets).
- The imported Google Sheets `passwordsalt`, `passwordhash` and `authtype=PIN_V1` are supported for first-login migration, **only when the original Script Property `EK_PASSWORD_PEPPER` is configured privately**. The password hash is then stored in `web_auth` using PHP's password_hash. Do not use a new/generated pepper: it must be the value from the exact Apps Script project that originally created the hashes. Old Apps Script **session tokens and remembered devices** cannot transfer into PHP, so users must sign in once with their same PIN.
- **Staging limitations:** automated emails and background jobs, Drive photos, Google Docs/PDF and Sheets exports, advanced WBF/IP rules and unexplained-absence/time-review derivations are not fully ported. Do not run both implementations as live punch recorders; they write to different stores.

No Terminal is needed for these steps.
