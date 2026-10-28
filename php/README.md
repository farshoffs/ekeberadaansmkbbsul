# eKeberadaan — PHP/MySQL staging deployment

The existing Google Apps Script app in the repository root is preserved. The PHP app is at php/index.php and uses php/api.php. GitHub Pages cannot execute PHP.

## cPanel deployment — no Terminal / SSH required

The destination database already has the 21 tables and 20,202 Excel records. **Do not reimport the full workbook dump**, which drops and recreates those tables. Back up the database before starting.

1. **Import only the extra PHP schema.** Download php/schema.sql from this GitHub repository. Open cPanel > phpMyAdmin > ppdkmyna_ekeberadaansmkbbsul > Import, select schema.sql and submit. This adds web_auth, web_sessions, and web_setup_state.
2. **Upload the website.** On GitHub, open farshoffs/ekeberadaansmkbbsul > Code > Download ZIP. In cPanel > File Manager > public_html, create a folder such as ekeberadaan, upload ZIP and Extract. If an extra repository-main folder appears, move its contents into the ekeberadaan folder. Index.html and php/index.php must have their relative paths intact.
3. **Create the private server config.** In File Manager open php/ and copy config.local.example.php to config.local.php. Edit it: host='localhost' (usual when PHP and MySQL run on the same cPanel host), port 3306, the exact database/user names, your rotated database password, and a 64-character random hexadecimal setup_key. Generate a key via the button on /php/setup.php, copy it privately into config.local.php and paste the same key in the form. Do not commit config.local.php.
4. **Create the first administrator PIN without a Terminal.** Open https://YOUR-DOMAIN/ekeberadaan/php/setup.php. Enter setup_key, an existing ACTIVE account marked Pentadbir Sistem in pengguna, and a new six-digit PIN. Submit. Setup permanently locks itself in web_setup_state after success.
5. **Disable the installer.** Delete php/setup.php from the deployed server in cPanel File Manager. Also delete setup_key from config.local.php. After a fresh redeployment, remove the deployed setup.php again. Do not delete the lock record.
6. **Open PHP app.** Go to https://YOUR-DOMAIN/ekeberadaan/php/index.php (not root Index.html, and not GitHub Pages). Log in with your new administrator PIN.
7. **Enable staff access in the web app.** Admin > Pengguna > Reset PIN or bulk reset generates one-time temporary PINs for staff, shown to the authenticated admin only. Give each PIN directly to the intended person. On login, a staff member must change the temporary PIN before working. The topbar also contains Tukar PIN. Admin PIN resets revoke prior user sessions.
8. **Test before production.** Check historical records, an admin view, a staff login and one staging punch. Keep the existing Google Apps Script deployment live until the PHP version has been validated.

### Configuration security

Visit https://YOUR-DOMAIN/ekeberadaan/php/config.local.php. It should be forbidden or otherwise return absolutely no content. If it exposes PHP source, do not use the hosting deployment until PHP and .htaccess are fixed. HTTPS is required for the installer and for browser GPS location.

Do not place SQL dumps, personal records, or the database password in public GitHub. Rotate the MySQL password already shared in chat and update it only in the hosting config.

### Scope and limitations

This is a staging migration, not a 100% replica. Email reminders, automatic scheduled jobs, Drive profile images, PDF and Sheets exports, advanced WBF/attendance/IP policy and unexplained-absence automation are not fully migrated. Summary values can differ. Do not run both the PHP and Apps Script apps as concurrent punch recorders: their data stores would diverge.

The old Apps Script PIN hashes and session tokens do NOT authenticate against PHP. PHP stores new PIN hashes in web_auth and 30-day token hashes in web_sessions.

If you previously imported an older php/schema.sql without must_change_pin, run the following SQL in phpMyAdmin before importing the latest schema.sql:

    ALTER TABLE web_auth ADD COLUMN must_change_pin TINYINT(1) NOT NULL DEFAULT 0;

### Optional (not required)

If your hosting provider later offers Terminal, php php/cli_check_db.php tests the connection, and php php/cli_set_pin.php email@example.com provisions a PIN. The browser setup removes the need for either command.

GitHub CI syntax and frontend rendering checks do not prove a live cPanel connection. A real hosting test is still required.
