const EK_EXTERNAL_OFFICIAL_TYPES = Object.freeze([
  'BENGKEL/KURSUS/SEMINAR (PPD)',
  'BENGKEL/KURSUS/SEMINAR (JPN)',
  'BENGKEL/KURSUS/SEMINAR (KPM)',
  'MESYUARAT/TAKLIMAT (PPD)',
  'MESYUARAT/TAKLIMAT (JPN)',
  'MESYUARAT/TAKLIMAT (KPM)'
]);

const EK = Object.freeze({
  TIMEZONE: 'Asia/Kuala_Lumpur', // Malaysia Time (MYT), GMT+8
  SHEETS: {
    USERS: 'PENGGUNA',
    SETTINGS: 'TETAPAN',
    ATTENDANCE: 'KEHADIRAN',
    AUDIT: 'AUDIT',
    REPORT: 'LAPORAN_HARIAN',
    ABSENCE: 'TIDAK_HADIR',
    TIME_REVIEW: 'SEMAKAN_WAKTU',
    LOGIN_LOG: 'LOG_LOGIN',
    TRUSTED_DEVICES: 'SESI_PERANTI'
  },
  CATEGORIES: ['Pengurusan', 'AKP', 'PPP', 'Praktikum', 'MySTEP'],
  ABSENCE_TYPES: [
    'CUTI REHAT KHAS','CUTI REHAT','CUTI SAKIT (AWAM)','CUTI SAKIT (SWASTA)',
    'CUTI TANPA REKOD KELOMPOK','CUTI KUARANTIN',
    'CUTI BERSALIN','CUTI BARAH','CUTI HAJI','CUTI MENJAGA ANAK',
    'CUTI TANPA GAJI','CUTI BELAJAR (BERGAJI PENUH)','CUTI BELAJAR (SEPARUH GAJI)',
    ...EK_EXTERNAL_OFFICIAL_TYPES,
    'AKTIVITI KOKURIKULUM','AKTIVITI SUKAN/PERMAINAN','URUSAN PEPERIKSAAN','LAIN-LAIN'
  ],
  PRESENCE_TYPES: [
    'PROGRAM DALAMAN SEKOLAH','URUSAN PERIBADI (MASUK LEWAT)','URUSAN PERIBADI (BALIK AWAL)',
    ...EK_EXTERNAL_OFFICIAL_TYPES,
    'AKTIVITI KOKURIKULUM','AKTIVITI SUKAN/PERMAINAN',
    'URUSAN PEPERIKSAAN','LAIN-LAIN - KEBERADAAN'
  ],
  MATERNITY_LEAVE_MAX_DAYS: 90,
  USER_HEADERS: ['Aktif', 'Nama', 'Emel', 'Kategori', 'Pentadbir', 'WaktuLewat', 'MaksMasuk', 'WaktuBalik', 'Catatan', 'PasswordSalt', 'PasswordHash', 'WajibTukarPassword', 'VersiSesi', 'GagalLogin', 'DikunciSehingga', 'PasswordDikemaskiniPada', 'FotoProfilFileId', 'FotoProfilDikemaskiniPada', 'AuthType', 'Jawatan', 'Sesi1Masuk', 'Sesi1Keluar', 'Sesi2Masuk', 'Sesi2Keluar'],
  ATT_HEADERS: ['Tarikh', 'Emel', 'Nama', 'Kategori', 'Masuk', 'MasukLat', 'MasukLng', 'MasukJarakM', 'MasukAkurasiM', 'Balik', 'BalikLat', 'BalikLng', 'BalikJarakM', 'BalikAkurasiM', 'Status', 'Sumber', 'DisuntingOleh', 'SebabEdit', 'DikemaskiniPada', 'MasukIP', 'BalikIP', 'IPSemakan', 'Masuk2', 'Masuk2Lat', 'Masuk2Lng', 'Masuk2JarakM', 'Masuk2AkurasiM', 'Balik2', 'Balik2Lat', 'Balik2Lng', 'Balik2JarakM', 'Balik2AkurasiM', 'Masuk2IP', 'Balik2IP', 'StatusWaktu', 'MedanDisuntingPentadbir'],
  AUDIT_HEADERS: ['Masa', 'Pelaku', 'Tindakan', 'Sasaran', 'Butiran'],
  ABSENCE_HEADERS: ['ID', 'DihantarPada', 'Emel', 'Nama', 'Kategori', 'Jenis', 'TarikhMula', 'TarikhAkhir', 'Catatan', 'Status', 'DisemakOleh', 'DisemakPada', 'UlasanPengetua', 'DikemaskiniPada', 'Mod', 'MasaMula', 'MasaAkhir', 'Jawatan'],
  TIME_REVIEW_HEADERS: ['ID', 'DiciptaPada', 'Tarikh', 'Emel', 'Nama', 'Jawatan', 'Kategori', 'Jenis', 'Sesi', 'WaktuRekod', 'WaktuRujukan', 'StatusSemakan', 'DisemakOleh', 'NamaPelulus', 'DisemakPada', 'Ulasan'],
  // Kolum IP legacy dikekalkan pada Sheet supaya indeks sejarah tidak berganjak; code baharu tidak mengesan atau menulis IP.
  LOGIN_HEADERS: ['Masa', 'Emel', 'Nama', 'Kategori', 'IP Awam (Legacy)', 'Peranti/Pelayar', 'Status', 'Butiran'],
  TRUSTED_DEVICE_HEADERS: ['DeviceID', 'Emel', 'NamaPeranti', 'Platform', 'Pelayar', 'IPTerakhir', 'DiciptaPada', 'DilihatTerakhir', 'TamatPada', 'Aktif', 'VersiSesi', 'TokenHash', 'SebabBatal', 'ClientInstanceID', 'JenisPeranti', 'ModelPeranti', 'Skrin', 'Viewport', 'PixelRatio', 'TouchPoints', 'CPU', 'RAMGB', 'Rangkaian', 'IPv4Awam', 'IPv6Awam', 'UserAgent', 'ZonMasa', 'Bahasa'],
  DEFAULT_SETTINGS: {
    SCHOOL_NAME: 'SMK Bandar Baru Sungai Lalang',
    SCHOOL_LAT: '',
    SCHOOL_LNG: '',
    RADIUS_M: '200',
    MAX_GPS_ACCURACY_M: '140',
    DEFAULT_LATE_AFTER: '07:30',
    DEFAULT_MAX_PUNCH_IN: '10:00',
    DEFAULT_PUNCH_OUT_FROM: '14:00',
    DEFAULT_S1_IN: '07:30',
    DEFAULT_S1_OUT: '14:00',
    DEFAULT_S2_IN: '',
    DEFAULT_S2_OUT: '',
    ALLOW_OPTIONAL_SECOND_SESSION: 'TRUE',
    THURSDAY_WBF_ENABLED: 'TRUE',
    THURSDAY_WBF_IN_FROM: '07:30',
    THURSDAY_WBF_IN_TO: '09:00',
    THURSDAY_WBF_OUT_FROM: '15:00',
    THURSDAY_WBF_OUT_TO: '16:30',
    THURSDAY_WBF_DURATION_MINUTES: '450',
    ABSENT_AFTER: '10:00',
    PUNCH_REMINDER_ENABLED: 'TRUE',
    PUNCH_REMINDER_TIME: '09:00',
    WORKING_DAYS: 'SUN,MON,TUE,WED,THU',
    SYSTEM_MODE: 'REAL',
    SYSTEM_START_DATE: '2026-09-01',
    PROFILE_ROOT_FOLDER_ID: '1WaZTGUn1izkIdSsk_o0S_14UAx2QODMh'
  },
  SESSION: {
    // Signed access token lifetime. Trusted-device renewal remains separate.
    NORMAL_HOURS: 12,
    // Rolling trusted-device lifetime.
    REMEMBER_DAYS: 7,
    MAX_TRUSTED_DEVICES: 2,
    SECRET_KEY: 'EK_SESSION_SECRET'
  },
  PASSWORD: {
    PEPPER_KEY: 'EK_PASSWORD_PEPPER',
    CHANGE_TICKET_PREFIX: 'EK_PWCHANGE_',
    CHANGE_TICKET_TTL_MS: 10 * 60 * 1000,
    MAX_FAILED: 5,
    LOCK_MINUTES: 15,
    MIN_LENGTH: 6,
    MAX_LENGTH: 6,
    PIN_LENGTH: 6,
    AUTH_TYPE: 'PIN_V1'
  },
  EMAIL: {
    OWNER_EMAIL: 'kea3123@moe.gov.my',
    SENDER_NAME: 'e-Keberadaan SMK Bandar Baru Sungai Lalang',
    DAILY_REPORT_HOUR: 7,
    DAILY_REPORT_PROPERTY: 'EK_LAST_DAILY_REPORT_DATE',
    PUNCH_REMINDER_SENT_PREFIX: 'EK_PUNCH_REMINDER_SENT_',
    PRESENCE_NO_PUNCH_ALERT_PREFIX: 'EK_PRESENCE_NO_PUNCH_ALERT_',
    PRESENCE_TRIGGER_READY_PROPERTY: 'EK_PRESENCE_DEADLINE_TRIGGER_READY_V1',
    ENABLED_PROPERTY: 'EK_EMAIL_NOTIFICATIONS_ENABLED'
  }
});

// ---------- Performance cache / fast-path helpers ----------
// Short-lived caches dramatically reduce repeated Spreadsheet service calls
// across google.script.run executions. All write paths invalidate the relevant
// cache so password/session/security changes take effect immediately.
const EK_PERF = Object.freeze({
  USERS_CACHE_KEY: 'EK_PERF_USERS_V1',
  SETTINGS_CACHE_KEY: 'EK_PERF_SETTINGS_V2',
  TRUSTED_DEVICES_CACHE_KEY: 'EK_PERF_TRUSTED_DEVICES_V1',
  USERS_TTL_SEC: 300,
  SETTINGS_TTL_SEC: 300,
  TRUSTED_DEVICES_TTL_SEC: 60
});

// CacheService limits each individual value. Large JSON structures (especially
// the attendance date/email index) used to silently stop being cached once they
// crossed ~90k characters, forcing full-sheet rebuilds on later executions.
// Store larger payloads as versioned shards and publish the tiny manifest last,
// so readers either see a complete cache generation or safely fall back to the
// source Sheet. Old shards expire naturally with the same short TTL.
const EK_CACHE_JSON_ = Object.freeze({
  INLINE_MAX_CHARS: 50000,
  SHARD_CHARS: 50000,
  MAX_SHARDS: 16,
  MANIFEST_PREFIX: '__EK_JSON_SHARDS_V1__|'
});

// Per-execution runtime cache. This avoids repeatedly resolving the active
// Spreadsheet, sheet handles and script timezone during one server call.
let EK_RUNTIME_SS_ = null;
const EK_RUNTIME_SHEETS_ = Object.create(null);
let EK_RUNTIME_TZ_ = '';
let EK_RUNTIME_USERS_ = null;
let EK_RUNTIME_SETTINGS_ = null;
let EK_RUNTIME_TRUSTED_DEVICES_ = null;
let EK_RUNTIME_ABSENCE_ROWS_ = null;
let EK_RUNTIME_TIME_REVIEW_ROWS_ = null;

function getScriptCache_() { return CacheService.getScriptCache(); }
function cacheJsonShardKey_(key, version, index) {
  return `${key}:S:${version}:${index}`;
}
function cacheGetJson_(key) {
  try {
    const cache = getScriptCache_();
    const raw = cache.get(key);
    if (!raw) return null;
    if (!raw.startsWith(EK_CACHE_JSON_.MANIFEST_PREFIX)) return JSON.parse(raw);

    const meta = raw.slice(EK_CACHE_JSON_.MANIFEST_PREFIX.length).split('|');
    const version = String(meta[0] || '');
    const count = Number(meta[1] || 0);
    if (!version || !Number.isInteger(count) || count < 1 || count > EK_CACHE_JSON_.MAX_SHARDS) return null;

    const keys = [];
    for (let i = 0; i < count; i++) keys.push(cacheJsonShardKey_(key, version, i));
    const found = cache.getAll(keys);
    const chunks = [];
    for (let i = 0; i < keys.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(found, keys[i])) return null;
      chunks.push(found[keys[i]]);
    }
    return JSON.parse(chunks.join(''));
  } catch (e) { return null; }
}
function cachePutJson_(key, value, ttlSec) {
  try {
    const cache = getScriptCache_();
    const raw = JSON.stringify(value);
    const ttl = Math.max(1, Number(ttlSec) || 60);
    if (raw.length <= EK_CACHE_JSON_.INLINE_MAX_CHARS) {
      cache.put(key, raw, ttl);
      return true;
    }

    const count = Math.ceil(raw.length / EK_CACHE_JSON_.SHARD_CHARS);
    if (count > EK_CACHE_JSON_.MAX_SHARDS) return false;
    const version = Utilities.getUuid().replace(/-/g, '').slice(0, 12);
    const shards = {};
    for (let i = 0; i < count; i++) {
      shards[cacheJsonShardKey_(key, version, i)] = raw.slice(
        i * EK_CACHE_JSON_.SHARD_CHARS,
        (i + 1) * EK_CACHE_JSON_.SHARD_CHARS
      );
    }
    cache.putAll(shards, ttl);
    cache.put(key, `${EK_CACHE_JSON_.MANIFEST_PREFIX}${version}|${count}`, ttl);
    return true;
  } catch (e) { return false; }
}
function invalidateUsersCache_() { EK_RUNTIME_USERS_ = null; try { getScriptCache_().remove(EK_PERF.USERS_CACHE_KEY); } catch (e) {} }
function invalidateSettingsCache_() { EK_RUNTIME_SETTINGS_ = null; try { getScriptCache_().remove(EK_PERF.SETTINGS_CACHE_KEY); } catch (e) {} }
function invalidateTrustedDevicesCache_() { EK_RUNTIME_TRUSTED_DEVICES_ = null; try { getScriptCache_().remove(EK_PERF.TRUSTED_DEVICES_CACHE_KEY); } catch (e) {} }

function doGet(e) {
  if (e && e.parameter && String(e.parameter.bridge || '') === '1') return renderPagesBridge_();
  const url = 'https://farshoffs.github.io/ekeberadaansmkbbsul/';
  return HtmlService.createHtmlOutput(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>e-Keberadaan</title><p>Membuka e-Keberadaan…</p>' +
    '<script>location.replace(' + JSON.stringify(url) + ');<\/script>' +
    '<p><a href="' + url + '">Buka e-Keberadaan</a></p>'
  ).setTitle('e-Keberadaan').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('eKeberadaan')
    .addItem('Sediakan / baiki helaian sistem', 'setupSystem')
    .addSeparator()
    .addItem('Reset / Sediakan PIN Pentadbir Saya', 'setMyAdminPasswordFromMenu')
    .addItem('Reset pengguna dipilih (fresh)', 'resetSelectedUserFreshFromMenu')
    .addItem('Sync gambar profil dari Drive', 'syncProfilePhotosFromMenu')
    .addSeparator()
    .addItem('Benarkan akses emel pemilik', 'authorizeEmailPermissionOwner')
    .addItem('Aktifkan / baiki notifikasi emel', 'installEmailNotificationsFromMenu')
    .addItem('Hantar emel ujian kepada saya', 'sendNotificationTestFromMenu')
    .addItem('Hantar peringatan rekod waktu sekarang', 'sendPunchReminderFromMenu')
    .addItem('Hantar laporan semalam sekarang', 'sendYesterdayAttendanceReportFromMenu')
    .addSeparator()
    .addItem('Baiki rekod duplikat', 'repairAttendanceDuplicatesFromMenu')
    .addItem('Baiki status waktu tersimpan', 'repairAttendanceTimingStatusesFromMenu')
    .addItem('Jana laporan hari ini', 'generateTodayReportFromMenu')
    .addToUi();
}

/**
 * Jalankan sekali dari Apps Script editor yang bound kepada Google Sheet.
 * Ia tidak memadam data sedia ada; hanya mewujudkan struktur yang belum ada.
 */
function setupSystem() {
  const ss = SpreadsheetApp.getActive();
  // eKeberadaan menggunakan satu zon waktu rasmi sahaja: Malaysia Time (MYT), GMT+8.
  try { if (ss.getSpreadsheetTimeZone() !== EK.TIMEZONE) ss.setSpreadsheetTimeZone(EK.TIMEZONE); } catch (e) {}
  setupUsersSheet_(ss);
  setupSettingsSheet_(ss);
  setupAttendanceSheet_(ss);
  setupAuditSheet_(ss);
  setupReportSheet_(ss);
  setupAbsenceSheet_(ss);
  setupTimeReviewSheet_(ss);
  setupLoginLogSheet_(ss);
  setupTrustedDevicesSheet_(ss);
  // Cuti rasmi 2026 hanya diseed pada generasi pertama. Selepas itu apa-apa
  // tambah/buang oleh Pentadbir Sistem kekal authoritative walaupun setupSystem
  // dijalankan semula untuk membaiki helaian lain.
  setupPublicHolidaySheet_(ss);
  ensurePublicHolidaySheet_();
  getSessionSecret_();
  getPasswordPepper_();
  PropertiesService.getScriptProperties().setProperty(EK.EMAIL.ENABLED_PROPERTY, 'TRUE');
  installEmailNotifications_({silent: true});

  // Bersihkan rekod punch duplikat lama secara selamat.
  repairAttendanceDuplicates_({audit: false});

  const activeEmail = normalizeEmail_(Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail());
  if (activeEmail) {
    const users = ss.getSheetByName(EK.SHEETS.USERS);
    const existing = getUserByEmail_(activeEmail, false);
    if (!existing) {
      users.appendRow([true, 'Pentadbir Utama', activeEmail, 'Pengurusan', true, '', '', '', 'Dicipta oleh setupSystem']);
      users.getRange(users.getLastRow(), 1).insertCheckboxes().setValue(true);
      users.getRange(users.getLastRow(), 5).insertCheckboxes().setValue(true);
    }
  }

  SpreadsheetApp.flush();
  invalidateUsersCache_();
  invalidateSettingsCache_();
  try {
    SpreadsheetApp.getUi().alert(
      'eKeberadaan siap',
      'Struktur sistem telah disediakan. Notifikasi emel juga diaktifkan jika setup dijalankan oleh pemilik sistem kea3123@moe.gov.my. Isi koordinat sekolah di TETAPAN dan senarai emel di PENGGUNA, kemudian deploy Web App sebagai akses awam dan Execute as Me. Login menggunakan PIN 6 digit dan sesi peranti 7 hari.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {}
  return 'OK';
}