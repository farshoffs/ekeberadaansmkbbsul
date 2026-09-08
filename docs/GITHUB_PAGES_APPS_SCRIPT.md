# GitHub Pages + Apps Script deployment

Architecture:

- GitHub Pages hosts the static eKeberadaan UI.
- The existing Google Apps Script Web App remains the trusted backend.
- Google Sheets remains the database.
- PIN hashing, session secrets, trusted-device records, Drive access, punch validation and admin operations remain in Apps Script.
- The browser talks to Apps Script through a hidden iframe bridge using `postMessage`; only the UI methods whitelisted in `Bridge.html` are callable.

## One-time live backend step

After this branch is prepared, update the existing Apps Script project using `Code.gs`, `PagesBridge.gs`, and `Bridge.html` from this branch, then update the existing Web App deployment.

Set Script Property:

`EK_PAGES_ORIGIN=https://farshoffs.github.io`

Then put the public Apps Script `/exec` URL in `web/config.js` as `APPS_SCRIPT_WEB_APP_URL` and push. The URL is public configuration, not a secret.

For a temporary per-device test before committing the URL, open GitHub Pages once with:

`?backend=https://script.google.com/macros/s/.../exec`

The frontend only accepts an HTTPS `script.google.com/macros/s/.../exec` URL and stores it locally on that browser.
