# Security notes

- Never place `EK_PASSWORD_PEPPER`, session secrets, OAuth credentials or private keys in GitHub Pages.
- `web/config.js` contains only the public Apps Script Web App `/exec` URL.
- Browser RPC requests are submitted to the Apps Script bridge; results return through the HtmlService sandbox using `postMessage`.
- `Bridges.gs` validates the expected GitHub Pages origin and exposes only its explicit UI method allowlist.
- Authentication/authorization is still enforced inside the called Apps Script functions. The bridge allowlist is an additional boundary, not a replacement for server authorization.
- PIN/session/trusted-device logic remains server-side in Apps Script and Google Sheets.
- Trusted-device cache is invalidated on security-sensitive mutations rather than being kept stale for performance.
- The GitHub repository may be public because no application secret is required by the static frontend. Apps Script Script Properties must remain private.
