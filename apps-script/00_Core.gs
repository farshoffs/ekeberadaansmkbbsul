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
  CATEGORIES: ['Pengurusan', 'AKP', 'PPP'],
  ABSENCE_TYPES: ['CUTI REHAT KHAS', 'CUTI REHAT', 'CUTI SAKIT (AWAM)', 'CUTI SAKIT (SWASTA)', 'CUTI TANPA REKOD KELOMPOK', 'KURSUS', 'BENGKEL', 'TAKLIMAT', 'MESYUARAT', 'SEMINAR', 'LAIN-LAIN'],
  PRESENCE_TYPES: ['PROGRAM DALAMAN SEKOLAH - KEBERADAAN', 'URUSAN PERIBADI (MASUK LEWAT) - KEBERADAAN', 'MESYUARAT DALAM SEKOLAH - KEBERADAAN', 'LAIN-LAIN - KEBERADAAN'],
  USER_HEADERS: ['Aktif', 'Nama', 'Emel', 'Kategori', 'Pentadbir', 'WaktuLewat', 'MaksMasuk', 'WaktuBalik', 'Catatan', 'PasswordSalt', 'PasswordHash', 'WajibTukarPassword', 'VersiSesi', 'GagalLogin', 'DikunciSehingga', 'PasswordDikemaskiniPada', 'FotoProfilFileId', 'FotoProfilDikemaskiniPada', 'AuthType', 'Jawatan', 'Sesi1Masuk', 'Sesi1Keluar', 'Sesi2Masuk', 'Sesi2Keluar'],
  ATT_HEADERS: ['Tarikh', 'Emel', 'Nama', 'Kategori', 'Masuk', 'MasukLat', 'MasukLng', 'MasukJarakM', 'MasukAkurasiM', 'Balik', 'BalikLat', 'BalikLng', 'BalikJarakM', 'BalikAkurasiM', 'Status', 'Sumber', 'DisuntingOleh', 'SebabEdit', 'DikemaskiniPada', 'MasukIP', 'BalikIP', 'IPSemakan', 'Masuk2', 'Masuk2Lat', 'Masuk2Lng', 'Masuk2JarakM', 'Masuk2AkurasiM', 'Balik2', 'Balik2Lat', 'Balik2Lng', 'Balik2JarakM', 'Balik2AkurasiM', 'Masuk2IP', 'Balik2IP', 'StatusWaktu'],
  AUDIT_HEADERS: ['Masa', 'Pelaku', 'Tindakan', 'Sasaran', 'Butiran'],
  ABSENCE_HEADERS: ['ID', 'DihantarPada', 'Emel', 'Nama', 'Kategori', 'Jenis', 'TarikhMula', 'TarikhAkhir', 'Catatan', 'Status', 'DisemakOleh', 'DisemakPada', 'UlasanPengetua', 'DikemaskiniPada', 'Mod', 'MasaMula', 'MasaAkhir', 'Jawatan'],
  TIME_REVIEW_HEADERS: ['ID', 'DiciptaPada', 'Tarikh', 'Emel', 'Nama', 'Jawatan', 'Kategori', 'Jenis', 'Sesi', 'WaktuRekod', 'WaktuRujukan', 'StatusSemakan', 'DisemakOleh', 'NamaPelulus', 'DisemakPada', 'Ulasan'],
  LOGIN_HEADERS: ['Masa', 'Emel', 'Nama', 'Kategori', 'IP Awam', 'Peranti/Pelayar', 'Status', 'Butiran'],
  TRUSTED_DEVICE_HEADERS: ['DeviceID', 'Emel', 'NamaPeranti', 'Platform', 'Pelayar', 'IPTerakhir', 'DiciptaPada', 'DilihatTerakhir', 'TamatPada', 'Aktif', 'VersiSesi', 'TokenHash', 'SebabBatal'],
  DEFAULT_SETTINGS: {
    SCHOOL_NAME: 'SMK Bandar Baru Sungai Lalang',
    SCHOOL_LAT: '',
    SCHOOL_LNG: '',
    RADIUS_M: '200',
    MAX_GPS_ACCURACY_M: '120',
    DEFAULT_LATE_AFTER: '07:30',
    DEFAULT_MAX_PUNCH_IN: '10:00',
    DEFAULT_PUNCH_OUT_FROM: '14:00',
    DEFAULT_S1_IN: '07:30',
    DEFAULT_S1_OUT: '14:00',
    DEFAULT_S2_IN: '',
    DEFAULT_S2_OUT: '',
    ABSENT_AFTER: '10:00',
    PUNCH_REMINDER_ENABLED: 'TRUE',
    PUNCH_REMINDER_TIME: '09:00',
    WORKING_DAYS: 'SUN,MON,TUE,WED,THU',
    IP_TRACKING_ENABLED: 'TRUE',
    IP_PUNCH_POLICY: 'WARN',
    SYSTEM_MODE: 'REAL',
    SYSTEM_START_DATE: '2026-09-01',
    PROFILE_ROOT_FOLDER_ID: '1WaZTGUn1izkIdSsk_o0S_14UAx2QODMh'
  },
  SESSION: {
    NORMAL_HOURS: 12,
    REMEMBER_DAYS: 30,
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
  USERS_TTL_SEC: 10,
  SETTINGS_TTL_SEC: 30,
  TRUSTED_DEVICES_TTL_SEC: 15
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
function cacheGetJson_(key) {
  try {
    const raw = getScriptCache_().get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function cachePutJson_(key, value, ttlSec) {
  try {
    const raw = JSON.stringify(value);
    // Apps Script Cache items are limited in size. Skip caching oversized data.
    if (raw.length < 90000) getScriptCache_().put(key, raw, ttlSec);
  } catch (e) {}
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
      'Struktur sistem telah disediakan. Notifikasi emel juga diaktifkan jika setup dijalankan oleh pemilik sistem kea3123@moe.gov.my. Isi koordinat sekolah di TETAPAN dan senarai emel di PENGGUNA, kemudian deploy Web App sebagai akses awam dan Execute as Me. Login menggunakan PIN 6 digit dan sesi peranti 30 hari.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {}
  return 'OK';
}
