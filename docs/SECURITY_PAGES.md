# Security notes for GitHub Pages migration

- Never place `EK_PASSWORD_PEPPER`, session secrets, Google credentials, or private keys in GitHub Pages.
- `web/config.js` may contain the public Apps Script `/exec` URL only.
- `Bridge.html` only accepts messages from `EK_PAGES_ORIGIN` and only exposes the explicit allowlist of UI methods.
- Existing PIN/session/trusted-device logic remains in Apps Script and Google Sheets.
