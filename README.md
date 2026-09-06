# eKeberadaan SMKBBSUL

Baseline awal: **Global Login Fix**.

PENTING:
1. Replace `Index.html` DAN `Scripts.html` bersama-sama.
2. `Scripts.html` versi ini TIDAK mempunyai tag `<script>` / `</script>`.
3. `Index.html` akan membungkus `include('Scripts')` dalam tag `<script>`.
4. Jangan tambah tag `<script>` ke `Scripts.html`.
5. `Code.gs` dan `Styles.html` perlu kekal sepadan dengan versi yang sama.
6. Deploy sebagai **NEW VERSION** dan buka URL `/exec`.

Ujian console selepas deploy:

```js
typeof checkDelimaAccount
// "function"

window.__EK_SCRIPTS_LOADED__
// true
```

Repo ini ialah source of truth untuk perubahan eKeberadaan selepas 6 September 2026.
