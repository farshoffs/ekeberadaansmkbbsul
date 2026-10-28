# eKeberadaan architecture

## Runtime path

```text
Browser
  -> GitHub Pages (static UI, HTTPS)
  -> Apps Script Web App RPC bridge
  -> Apps Script domain modules
  -> Google Sheets / Google Drive / Mail
```

GitHub Pages is the only user-facing website. Google Apps Script remains the trusted server runtime; Google Sheets remains the database.

## Frontend

The editable UI remains `Index.html`, `Styles.html`, `Scripts.html` and `Logo.html`. `scripts/build-pages.py` compiles these into a static site with:

- small HTML shell;
- external content-hashed CSS/JS/logo;
- modular client bundles (`core`, `attendance`, `absence`, `admin`, `exports`);
- service-worker cache and web manifest;
- Apps Script RPC shim from `web/gas-shim.js`.

GitHub Actions validates JavaScript, runs a real headless-Chrome runtime check, enforces performance budgets and publishes `_site` to `gh-pages`.

## Backend

`apps-script/` is the canonical backend. It is split by domain instead of a monolithic `Code.gs`.

The Pages RPC bridge accepts only the explicit method allowlist in `Bridges.gs`; the public `/exec` URL is configuration, not a secret. PIN pepper/session secrets stay in Apps Script Script Properties.

## Database performance

The backend avoids repeated whole-sheet scans on common paths:

- users/settings: runtime memoization + short CacheService cache;
- trusted-device list: short cache, invalidated on security-sensitive mutations;
- attendance: compact date/month row index, then reads only relevant row groups;
- login history: one cached Set instead of N repeated LOG_LOGIN/AUDIT scans;
- absence/time-review: per-execution memoization with explicit invalidation after writes.

Manual maintenance/report operations may still intentionally scan broader ranges because they are not latency-critical user actions.

## Deployment boundary

Frontend changes deploy automatically from GitHub. Backend changes are copied manually from `apps-script/` into the existing Apps Script project and published as a New Version of the existing Web App deployment, preserving the current `/exec` URL and Script Properties.

Timezone is `Asia/Kuala_Lumpur`.
