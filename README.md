> **cPanel deployment (PHP/MySQL staging):** Extract the project files directly into `public_html/ekeberadaansmkbbsul/`, then open `https://YOUR-DOMAIN/ekeberadaansmkbbsul/`. First-time setup uses `/ekeberadaansmkbbsul/setup.php`. No Terminal required. See [cPanel instructions](php/README.md).
> The original Google Apps Script application remains separate. GitHub Pages cannot run the PHP backend. Never commit database passwords or SQL dumps.

# eKeberadaan SMKBBSUL

Baseline awal: **Global Login Fix**.

## Struktur include semasa

1. `Scripts.html` mengandungi JavaScript mentah dan **TIDAK** mempunyai tag `<script>` / `</script>`.
2. `Index.html` membungkus `<?!= include('Scripts'); ?>` dalam tag `<script>`.
3. Oleh sebab partial `Scripts.html` bukan HTML standalone, `include()` dalam `Code.gs` **mesti** menggunakan raw template content:

```javascript
function include(filename) {
  return HtmlService.createTemplateFromFile(filename).getRawContent();
}
```

Jangan gunakan `HtmlService.createHtmlOutputFromFile(filename).getContent()` untuk struktur ini kerana Apps Script akan cuba parse `Scripts.html` sebagai HTML dan menghasilkan `Exception: Malformed HTML content: const state = ...`.

## Deploy

Selepas perubahan, deploy sebagai **NEW VERSION** dan buka URL `/exec`.

Ujian console selepas deploy:

```js
typeof checkDelimaAccount
// "function"

window.__EK_SCRIPTS_LOADED__
// true
```

Repo ini ialah source of truth untuk perubahan eKeberadaan selepas 6 September 2026.
