# GitHub Pages frontend + cPanel PHP/MySQL (gh-pages branch)

**Punca asal:** GitHub Pages masih memaparkan deployment lama bertarikh 10 September 2026 yang memanggil Google Apps Script dan Google Sheets. Kod PHP/MySQL dalam `main` bukan fail yang dihidangkan kepada pelawat GitHub Pages.

**Pembetulan:** Workflow `.github/workflows/pages.yml` kini menghasilkan HTML statik daripada `php/index.php`, menyambungkan semua RPC kepada `https://ppdkmy.edu.my/ekeberadaansmkbbsul/api.php`, kemudian menulisnya terus ke **branch `gh-pages` pada folder root**. Branch tersebut juga mengandungi `sw.js` yang menghentikan service worker Google Sheets lama.

## Tetapan GitHub Pages (sekali sahaja)

1. Buka https://github.com/farshoffs/ekeberadaansmkbbsul/settings/pages
2. Dalam **Build and deployment > Source**, pilih **Deploy from a branch** (BUKAN GitHub Actions).
3. Dalam **Branch**, pilih **gh-pages**, folder **/ (root)**, kemudian klik **Save**.
4. Selepas deploy branch siap, buka https://farshoffs.github.io/ekeberadaansmkbbsul/ dan buat Ctrl+Shift+R. Jika masih kelihatan versi lama, buang data laman/service worker bagi origin farshoffs.github.io/ekeberadaansmkbbsul melalui Chrome DevTools > Application > Service Workers dan Storage.

**Nota:** Build Github Actions lama `Deploy eKeberadaan UI to GitHub Pages` berjaya pada peringkat HTML tetapi gagal pada job deploy. Workflow terkini `Publish eKeberadaan MySQL UI to gh-pages` menggunakan branch deploy sebagai kaedah yang boleh diuji dan diautomasi.

## cPanel (kekalkan database asal)

- Folder hosting kekal `public_html/ekeberadaansmkbbsul/`.
- Kekalkan `php/config.local.php`: nama database, MySQL password, PIN pepper dan Workspace bridge secret TIDAK ditempatkan di GitHub.
- GitHub Pages hanya frontend HTML/JS/CSS. MySQL dibaca/ditulis melalui API PHP pada `https://ppdkmy.edu.my/ekeberadaansmkbbsul/api.php`.
- Jika belum dipasang, pasang patch CORS dua fail `api.php` dan `php/api.php` di cPanel (daripada workflow **Build cPanel upload package**, artifact `ekeberadaansmkbbsul-pages-cors-hotfix`). Origin tepat `https://farshoffs.github.io` dibenarkan; operasi sensitif masih memerlukan token login yang sah.
- Jangan import SQL semula atau reset PIN. Google Workspace (Drive, PDF, Google Sheets eksport) masih digunakan melalui PHP bridge, manakala database aplikasi sentiasa MySQL.

## Cara mengesahkan (Chrome DevTools)

Buka GitHub Pages > F12 > Network > tekan Teruskan atau login. Pastikan panggilan XHR/Fetch menghala ke:

`https://ppdkmy.edu.my/ekeberadaansmkbbsul/api.php`

**BUKAN** `https://script.google.com/macros/...`.

Boleh juga semak tanpa login dari Console:

```js
fetch('https://ppdkmy.edu.my/ekeberadaansmkbbsul/api.php', {
  method:'POST',
  credentials:'omit',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({fn:'getApiStatus',args:[]})
}).then(async r=>console.log(r.status,await r.text())).catch(console.error);
```

Respons yang diharapkan: HTTP 200 dan `healthy:true`. Jika CORS gagal, kemas kini patch PHP pada cPanel. Ini tidak mendedahkan data peribadi atau kunci database.

## Latar keselamatan

- PIN dan data MySQL hanya di pelayan PHP.
- SessionStorage di GitHub Pages berbeza daripada domain cPanel; login semula sekali menggunakan PIN lama mungkin diperlukan.
- Workflow membina index HTML dari kod GitHub `main`, menerbitkan `gh-pages`. Branch `gh-pages` mengandungi aset lama yang tidak digunakan, tetapi index baharu tidak memanggil `gas-shim`.
- Service worker lama `eke-static-*` ditamatkan dan cachenya dipadam. PWA lama mungkin perlu dipadamkan secara manual pada telefon jika dipasang sebagai aplikasi.
- Jangan upload dump SQL, `php/config.local.php`, PIN pepper, Workspace bridge secret atau fail logs ke GitHub.
