# GitHub Pages migration checklist

1. Branch `migration/github-pages-appsscript` contains the Pages bridge and workflows.
2. `Code.gs` serves `?bridge=1` through `Bridge.html`.
3. GitHub Pages is generated from `Index.html`, `Styles.html`, `Logo.html`, and `Scripts.html`.
4. Existing Apps Script backend must be updated with the bridge patch: add `PagesBridge.gs`, add `Bridge.html`, and add the `?bridge=1` route at the top of `doGet(e)` in `Code.gs`.
5. `PagesBridge.gs` defaults to the allowed origin `https://farshoffs.github.io`; `EK_PAGES_ORIGIN` is optional and only needed to override it.
6. Apps Script manifest must use `timeZone: Asia/Kuala_Lumpur`.
7. Update the existing Apps Script Web App deployment as a new version and keep access available to the intended public users.
8. Put its public `/exec` URL in `web/config.js`.
9. Push/redeploy Pages and smoke-test login, 30-day session, punch, absence, time review, admin and reports.
