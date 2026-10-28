# Hybrid eKeberadaan: MySQL + Google Workspace

**PENTING**: MySQL/phpMyAdmin kekal sebagai satu-satunya database untuk pengguna, PIN, kehadiran, cuti, status, dan laporan. Google Apps Script hanya membaca Google Drive atau menjana fail Google Docs / Sheets daripada data yang PHP telah ambil dari MySQL.

Source: kea3123-bit/ekeberadaansmkbbsul, branch refactor/performance-v2.
Apps Script deployment asal: https://script.google.com/macros/s/AKfycbyUv2F6Fl3drRR-TTTJkefu73TwbuQk5GVf36z87WLYIy40SSqZOfKBCeSIy7xje_wq/exec

## A. Edit Apps Script asal — WAJIB untuk fungsi Workspace

1. Buka projek Apps Script asal yang mengurus Google Drive sekolah, dan buka Editor.
2. Cipta fail Script baharu bernama 97_WorkspaceBridge. Salin keseluruhan kandungan fail GitHub apps-script/97_WorkspaceBridge.gs ke situ.
3. Dalam fail Bridges.gs sedia ada, cari function doPost(e) {, dan TAMBAH sebagai kod pertama di dalamnya:

    if (e && e.parameter && String(e.parameter.workspace || '') === '1') {
      return workspaceBridgePost_(e);
    }

Jangan cipta doPost kedua. Jangan gantikan seluruh Apps Script asal jika ia berbeza daripada branch ini. Jangan tukar sebarang trigger/login asal atau fungsi doGet.

4. Dalam Project Settings -> Script Properties, tambah EK_WORKSPACE_BRIDGE_SECRET dengan 64 aksara heksadesimal rawak. Nilai ini tidak sama dengan EK_PASSWORD_PEPPER, setup key atau password MySQL. Simpan nilainya secara rahsia.
5. Deploy -> Manage deployments -> Edit Web App deployment sedia ada -> Version: New version -> Deploy. Pilih Execute as pemilik yang boleh akses Drive. PHP memerlukan Web App diakses tanpa Google cookies (Who has access: Anyone), jika dibenarkan polisi organisasi. Kesemua Workspace requests masih mesti disahkan melalui HMAC signature, timestamp dan nonce. Jika organisasi tidak benarkan Anyone, jangan langgar polisi; perlu guna integrasi OAuth alternatif.

## B. cPanel PHP konfigurasi (tanpa Terminal)

Dalam File Manager, buka public_html/ekeberadaansmkbbsul/php/config.local.php.

Pastikan tetapan MySQL dan legacy_pin_pepper tidak berubah. Tambah dua kunci dalam PHP array:

    'workspace_gas_url' => 'https://script.google.com/macros/s/AKfycbyUv2F6Fl3drRR-TTTJkefu73TwbuQk5GVf36z87WLYIy40SSqZOfKBCeSIy7xje_wq/exec',
    'workspace_bridge_secret' => 'PASTE_THE_SAME_PRIVATE_64_HEX_VALUE',

Jangan kirim shared secret melalui ChatGPT, GitHub atau screenshot.

## C. Muat naik laman PHP

Gunakan ZIP yang dijana oleh GitHub Actions -> Build cPanel upload package, atau ZIP dari ChatGPT.
Upload dan extract kandungannya di public_html/ekeberadaansmkbbsul/ dan overwrite fail frontend/PHP yang berkaitan.
Pakej TIDAK mengandungi config.local.php (private), setup.php atau SQL dump. Buat sandaran terlebih dahulu.

Pembetulan:
- CSS selepas tag penutup style telah dipindahkan ke dalam tag style; teks CSS atas halaman hilang.
- PHP getProfilePhoto membaca ID gambar yang sedia ada dalam MySQL dan menerima gambar daripada Drive melalui Apps Script.
- Pentadbir Sync Gambar Profil mencari eoperasi.png di Drive dan menulis ID ke pengguna.fotoprofilfileid pada MySQL, BUKAN Google Sheets.
- Eksport PDF menggunakan Google Docs, eksport Spreadsheet menggunakan Google Sheets, dengan data laporan dibaca dahulu dari MySQL.
- Tiada pengaktifan semula atau reset PIN diperlukan.

## D. Ujian

1. Buka https://ppdkmy.edu.my/ekeberadaansmkbbsul/ lalu tekan Ctrl+Shift+R.
2. Pastikan tiada CSS raw di bahagian atas.
3. Masuk guna PIN lama seperti biasa.
4. Semak gambar profil. Bagi pengguna yang tiada ID gambar, admin boleh jalankan Sync Gambar Profil.
5. Cuba satu laporan PDF atau Google Sheet ujian.
6. Jika ralat Workspace belum dipasang, semak konfigurasi dan deployment Apps Script. Jika Workspace bukan JSON, semak akses Web App dan log cPanel.

## Had semasa

Sistem PHP memakai MySQL untuk sumber data, tetapi reka letak templat PDF kompleks dan trigger/email berkala yang asalnya membaca Google Sheets masih belum dimigrasi sepenuhnya. Jangan anggap emel peringatan Google lama memantau kehadiran MySQL. Sambungan Workspace baharu mesti diuji selepas deployment Apps Script sebelum digunakan secara produksi.

Fail kod sumber: apps-script/97_WorkspaceBridge.gs, apps-script/Bridges.gs, php/workspace_bridge.php, php/workspace_services.php.
