# Deploy GitHub Pages frontend using existing cPanel MySQL

**Status:** The GitHub Pages static build is automated on pushes to main.
MySQL, authentication, and Google Workspace bridge continue running only on the
existing PHP hosting at https://ppdkmy.edu.my/ekeberadaansmkbbsul/api.php.

## Step 1: update two PHP API files on cPanel (no Terminal)

The browser at https://farshoffs.github.io must be permitted to call the
server at https://ppdkmy.edu.my. That requires HTTP CORS preflight support.

Download the small GitHub Pages CORS ZIP from the Build cPanel upload package
workflow's `ekeberadaansmkbbsul-pages-cors-hotfix` artifact.

In cPanel File Manager, extract its **contents** directly to
`public_html/ekeberadaansmkbbsul/`:

- `api.php` (root public gateway)
- `php/api.php` (existing MySQL API)

Back up those files first. **Do NOT change** `php/config.local.php`,
`php/_lib.php`, the database, Script Properties or users' PINs. The patch
permits only the exact GitHub Pages origin `https://farshoffs.github.io`,
handles OPTIONS, and requires the existing PHP session token for all protected
operations. The database password remains on the hosting server.

Testing CORS from Chrome's Console on the GitHub Pages origin (when published):

```js
fetch('https://ppdkmy.edu.my/ekeberadaansmkbbsul/api.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'omit',
  body: JSON.stringify({ fn:'getApiStatus', args:[] })
}).then(async r => console.log(r.status, await r.text())).catch(console.error);
```

Expected: HTTP 200 with `healthy:true`. If blocked, inspect the OPTIONS
request in DevTools Network; do not share tokens or database credentials.

## Step 2: enable GitHub Pages

Go to https://github.com/farshoffs/ekeberadaansmkbbsul/settings/pages

Set **Build and deployment -> Source -> GitHub Actions**. GitHub Actions
must have permission to deploy Pages (environment `github-pages`).

The workflow is `.github/workflows/pages.yml`, named
**Deploy eKeberadaan UI to GitHub Pages**. Go to the Actions tab, select
that workflow and use **Run workflow** with branch main after enabling Pages.
The build job generates a single static `index.html`, no PHP source or SQL.
The deploy job publishes it.

Expected public URL:
https://farshoffs.github.io/ekeberadaansmkbbsul/

Important: GitHub Pages does not execute PHP, connect to MySQL directly or
store database credentials. The static frontend communicates over HTTPS to
the existing PHP server. Login/PIN validation happens only on PHP/MySQL.

## Step 3: verify functionality

1. Load the GitHub Pages URL; press Ctrl+Shift+R.
2. Sign in using the **same existing DELIMa email and PIN**. A fresh login
   may be required because browser session storage is origin-specific; no
   reset or re-registration is required.
3. Confirm your punch card history and current attendance match the PHP-hosted
   version. Punches write to the same MySQL database.
4. Verify Google Workspace photos and export through the existing PHP bridge.
5. Keep the cPanel frontend available as a fallback until GitHub Pages
   login, GPS and reporting have been tested.

## Security / maintenance

- Never commit `php/config.local.php`, SQL dumps, PIN peppers, Workspace
  HMAC secrets, logs or staff records.
- CORS only whitelists a frontend origin; it is NOT authorization. Existing
  PHP access control and token validation are still mandatory.
- The static build adds noindex/nofollow. The GitHub repository itself remains
  public: don't commit private data in source or Actions logs.
- GitHub Pages and PHP hosting have different browser origins. Previously
  remembered sessions on ppdkmy.edu.my cannot be silently copied to
  farshoffs.github.io.
- The saved PHP version on cPanel will not update just because a GitHub
  repository commit changes. Only the static frontend auto-deploys to Pages.
- If changing the username, Pages domain or API domain, update both the
  endpoint in `pages.yml`/`php/index.php` and the exact allowlisted
  origin in both PHP API files, followed by a cPanel deployment.
