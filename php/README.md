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
4. In **File Manager**, go to `public_html/ekeberadaansmkbbsul/php/`. Copy `config.local.example.php` to `config.local.php` and edit the copy. MySQL is usually `localhost` on the same cPanel account. Use the actual database name/username and your **rotated database password**. Add a random 64-character hexadecimal `setup_key`. You can generate one with the button at the installer page, then paste it into the config and into the form. **Never commit config.local.php or share the password/setup key.**
5. Visit `https://YOUR-DOMAIN/ekeberadaansmkbbsul/setup.php`. Supply the setup key, an **existing active administrator's email** that is marked Pentadbir Sistem in the `pengguna` table, and a 6-digit PIN. Setup writes a new admin PIN hash and locks itself permanently in `web_setup_state`.
6. After success, in **File Manager**, delete BOTH `ekeberadaansmkbbsul/setup.php` and `ekeberadaansmkbbsul/php/setup.php` from the server; remove `setup_key` from `php/config.local.php`. This is particularly important after uploading a newer ZIP: do not leave the installer available.
7. Open **`https://YOUR-DOMAIN/ekeberadaansmkbbsul/`**. It automatically renders the application using `index.php`. The app sends requests to `https://YOUR-DOMAIN/ekeberadaansmkbbsul/api.php` and the PHP backend reads MySQL via `php/config.local.php`.
8. An administrator can issue staff temporary PINs in the app using Pengguna → Reset PIN or bulk reset. The temporary PIN is shown only once to the admin; give it privately to the staff member. The staff member changes it at their first login. The top bar also has **Tukar PIN**.

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
- If you imported an **older** `schema.sql` that lacks the `must_change_pin` column, run the following query in phpMyAdmin **once** before importing the current `schema.sql`: `ALTER TABLE web_auth ADD COLUMN must_change_pin TINYINT(1) NOT NULL DEFAULT 0;`
- Old Apps Script PIN hashes and session tokens aren't valid in PHP. Users need new PHP PINs.
- **Staging limitations:** automated emails and background jobs, Drive photos, Google Docs/PDF and Sheets exports, advanced WBF/IP rules and unexplained-absence/time-review derivations are not fully ported. Do not run both implementations as live punch recorders; they write to different stores.

No Terminal is needed for these steps.
