# GitHub Pages migration checklist

1. Branch `migration/github-pages-appsscript` contains the Pages bridge and workflows.
2. GitHub Actions patches `Code.gs` to serve `?bridge=1` through `Bridge.html`.
3. GitHub Pages is generated from `Index.html`, `Styles.html`, `Logo.html`, and `Scripts.html`.
4. Existing Apps Script backend must be updated with this branch's `Code.gs`, `PagesBridge.gs`, and `Bridge.html`.
5. Set Apps Script Script Property `EK_PAGES_ORIGIN=https://farshoffs.github.io`.
6. Update the existing Apps Script Web App deployment.
7. Put its public `/exec` URL in `web/config.js`.
8. Push/redeploy Pages and smoke-test login, 30-day session, punch, absence, time review, admin and reports.
