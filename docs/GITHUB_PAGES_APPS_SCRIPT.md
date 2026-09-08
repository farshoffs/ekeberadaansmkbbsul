# GitHub Pages + Apps Script deployment

Architecture:

- GitHub Pages hosts the static eKeberadaan UI.
- The existing Google Apps Script Web App remains the trusted backend.
- Google Sheets remains the database.
- PIN hashing, session secrets, trusted-device records, Drive access, punch validation and admin operations remain in Apps Script.
- The browser talks to Apps Script through a hidden iframe bridge using `postMessage`; only the UI methods whitelisted in `Bridge.html` are callable.

## One-time live backend step

Update the existing Apps Script project with the bridge patch from branch `migration/github-pages-appsscript`:

1. Add `PagesBridge.gs`.
2. Add HTML file `Bridge` using `Bridge.html`.
3. At the top of the existing `doGet(e)` in `Code.gs`, route `?bridge=1` to `renderPagesBridge_()`; the branch already contains the exact patched version.
4. Ensure the manifest is named `appsscript.json` and uses `timeZone: Asia/Kuala_Lumpur`.
5. Deploy a NEW VERSION of the existing Web App.

`PagesBridge.gs` already defaults to `https://farshoffs.github.io` as the only allowed frontend origin. `EK_PAGES_ORIGIN` is optional and only needed if the Pages origin changes later.

Then put the public Apps Script `/exec` URL in `web/config.js` as `APPS_SCRIPT_WEB_APP_URL` and push. The URL is public configuration, not a secret.

For a temporary per-device test before committing the URL, open GitHub Pages once with:

`?backend=https://script.google.com/macros/s/.../exec`

The frontend only accepts an HTTPS `script.google.com/macros/s/.../exec` URL and stores it locally on that browser.
