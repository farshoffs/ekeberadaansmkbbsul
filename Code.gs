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
  // GitHub Pages calls the existing Apps Script backend through a hidden iframe.
  // All authentication/PIN/session/Sheets/Drive work remains server-side here.
  if (e && e.parameter && String(e.parameter.bridge || '') === '1') {
    return renderPagesBridge_();
  }

  const tpl = HtmlService.createTemplateFromFile('Index');
  return tpl
    .evaluate()
    .setTitle('e-Keberadaan — Perakam Waktu Digital')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}
function include(filename) {
  // Use raw template content so partial files may contain raw JavaScript/CSS/HTML.
  // createHtmlOutputFromFile() tries to parse the partial as standalone HTML and
  // throws "Malformed HTML content" when Scripts.html starts with JavaScript.
  return HtmlService.createTemplateFromFile(filename).getRawContent();
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

// ---------- DELIMa whitelist + PIN session ----------
// DELIMa email is used as the registered account identifier. Authentication is
// performed with the user's 6-digit PIN. PINs are stored only as salted HMAC
// hashes using a server-side pepper in Script Properties.

function getLoginPageData() {
  const settings = getSettings_();
  return {
    schoolName: settings.SCHOOL_NAME,
    mode: 'delima-email-pin',
    pinLength: EK.PASSWORD.PIN_LENGTH,
    sessionDays: EK.SESSION.REMEMBER_DAYS
  };
}


/**
 * Safe diagnostic for deployment/login recovery. It never exposes secrets.
 * Run manually from the Apps Script editor if login fails after moving code.
 */
function diagnoseLoginSecurity() {
  const props = PropertiesService.getScriptProperties();
  const pepperOk = !!props.getProperty(EK.PASSWORD.PEPPER_KEY);
  const sessionSecretOk = !!props.getProperty(EK.SESSION.SECRET_KEY);
  const users = getAllUsers_();
  const pinUsers = users.filter(u => String(u.authType || '').toUpperCase() === EK.PASSWORD.AUTH_TYPE && !!u.passwordHash && !!u.passwordSalt).length;
  const activeUsers = users.filter(u => u.active).length;
  const result = {
    activeUsers,
    pinUsers,
    passwordPepperConfigured: pepperOk,
    sessionSecretConfigured: sessionSecretOk,
    status: (!pepperOk && pinUsers) ? 'PIN_HASH_TANPA_PEPPER' : 'OK'
  };
  console.log(JSON.stringify(result));
  return result;
}

/**
 * Semak akaun DELIMa dalam whitelist PENGGUNA.
 * v12 menggunakan PIN 6 digit + trusted session 30 hari.
 *
 * Pengguna lama yang masih mempunyai hash password tetapi AuthType kosong
 * dianggap belum bermigrasi ke PIN. Mereka terus dibawa ke skrin cipta PIN
 * tanpa perlu mengingati kata laluan lama.
 */
function checkDelimaAccount(email, clientInfo) {
  email = normalizeEmail_(email);
  if (!email || !isValidEmail_(email)) throw new Error('Masukkan alamat emel DELIMa yang sah.');

  let user = getUserByEmail_(email, true);
  if (!user) throw new Error('Akaun DELIMa ini tidak didaftarkan atau tidak aktif dalam e-Keberadaan.');

  const isPinAccount = String(user.authType || '').toUpperCase() === EK.PASSWORD.AUTH_TYPE;

  // PIN hashes depend on the server-side pepper stored in Script Properties.
  // If source files are moved to a new Apps Script project without its Script
  // Properties, an existing PIN hash can never be verified. Detect that state
  // before a login attempt and safely send the user through PIN setup instead
  // of repeatedly reporting a wrong PIN / locking the account.
  const securityProps = PropertiesService.getScriptProperties();
  const pepperConfigured = !!securityProps.getProperty(EK.PASSWORD.PEPPER_KEY);
  const orphanedPinHash = isPinAccount && !!user.passwordHash && !!user.passwordSalt && !pepperConfigured;
  const needsDirectSetup = orphanedPinHash || !isPinAccount || !user.passwordHash || !user.passwordSalt || !!user.mustChangePassword;

  if (needsDirectSetup) {
    const everLoggedIn = hasUserEverLoggedIn_(user.email);
    const purpose = (orphanedPinHash || everLoggedIn) ? 'ADMIN_RESET' : 'FIRST_SETUP';

    // Akaun legacy/password lama dimigrasi ke PIN hanya apabila pengguna sampai
    // semula ke login. Existing remembered session tidak diganggu sebelum itu.
    user = preparePasswordSetupState_(user);

    const ci = normalizeClientInfo_(clientInfo);
    const changeTicket = createPasswordChangeTicket_(user, true, ci, purpose);
    recordLoginEventSafe_(
      user,
      ci,
      purpose === 'FIRST_SETUP' ? 'SETUP_PIN_PERTAMA' : 'SETUP_PIN_SELEPAS_RESET',
      'Akaun disahkan melalui whitelist DELIMa; pengguna diminta menetapkan PIN 6 digit'
    );
    audit_(
      purpose === 'FIRST_SETUP' ? 'MULA_SETUP_PIN_PERTAMA' : 'MULA_SETUP_PIN_RESET',
      user.email,
      `Setup PIN terus dimulakan; IP=${ci.ip || '-'}`,
      user.email
    );

    return {
      ok: true,
      user: {name:user.name,email:user.email,category:user.category,jobTitle:user.jobTitle||''},
      pinReady: false,
      directPinSetup: true,
      changeTicket,
      setupPurpose: purpose,
      message: purpose === 'FIRST_SETUP'
        ? 'Akaun ditemui. Cipta PIN 6 digit untuk mengaktifkan e-Keberadaan pada peranti ini.'
        : 'Akses akaun telah direset. Cipta PIN 6 digit baharu untuk meneruskan.'
    };
  }

  return {
    ok: true,
    user: {name:user.name,email:user.email,category:user.category,jobTitle:user.jobTitle||''},
    pinReady: true,
    directPinSetup: false,
    changeTicket: '',
    setupPurpose: '',
    message: ''
  };
}

function preparePasswordSetupState_(user) {
  if (!user) throw new Error('Pengguna tidak dijumpai.');
  const sh = getSheetOrThrow_(EK.SHEETS.USERS);
  const nextVersion = Math.max(1, Number(user.sessionVersion || 1)) + 1;

  sh.getRange(user.row, 10, 1, 7).setValues([[
    '', '', true, nextVersion, 0, '', new Date()
  ]]);
  sh.getRange(user.row, 12).insertCheckboxes().setValue(true);
  sh.getRange(user.row, 15, 1, 2).setNumberFormat('dd/MM/yyyy HH:mm:ss');
  // AuthType kosong bermaksud PIN perlu diwujudkan semula.
  sh.getRange(user.row, 19).setValue('');
  invalidateUsersCache_();
  revokeAllTrustedDevicesForUser_(user.email, 'RESET_PIN_ATAU_SETUP_SEMULA');

  return Object.assign({}, user, {
    passwordSalt:'', passwordHash:'', mustChangePassword:true,
    sessionVersion:nextVersion, failedLoginCount:0, lockedUntil:'',
    passwordUpdatedAt:new Date(), authType:''
  });
}

function normalizePin_(pin) {
  return String(pin == null ? '' : pin).trim();
}

function validateNewPin_(pin) {
  pin = normalizePin_(pin);
  if (!new RegExp('^\\d{' + EK.PASSWORD.PIN_LENGTH + '}$').test(pin)) {
    throw new Error(`PIN mestilah tepat ${EK.PASSWORD.PIN_LENGTH} digit nombor.`);
  }
  return pin;
}

function loginWithPin(email, pin, clientInfo, deviceCredential) {
  email = normalizeEmail_(email);
  pin = normalizePin_(pin);
  const ci = normalizeClientInfo_(clientInfo);
  const user = getUserByEmail_(email, true);

  if (!user) {
    recordLoginEventSafe_({email,name:'',category:''}, ci, 'GAGAL_AKAUN', 'Akaun tidak ditemui / tidak aktif');
    throw new Error('Emel atau PIN tidak tepat.');
  }

  try { assertNotLocked_(user); }
  catch (err) {
    recordLoginEventSafe_(user, ci, 'DIKUNCI', 'Percubaan login ketika akaun sedang dikunci');
    throw err;
  }

  const isPinAccount = String(user.authType || '').toUpperCase() === EK.PASSWORD.AUTH_TYPE;
  if (!isPinAccount || !user.passwordHash || !user.passwordSalt || user.mustChangePassword) {
    recordLoginEventSafe_(user, ci, 'PIN_BELUM_DISEDIAKAN', 'Pengguna perlu setup PIN');
    throw new Error('PIN akaun ini belum disediakan. Tekan “Gunakan akaun lain” dan teruskan semula menggunakan emel DELIMa.');
  }

  if (!new RegExp('^\\d{' + EK.PASSWORD.PIN_LENGTH + '}$').test(pin) || !verifyPassword_(pin, user)) {
    recordLoginEventSafe_(user, ci, 'GAGAL_PIN', 'PIN tidak tepat');
    registerFailedLogin_(user);
    throw new Error('Emel atau PIN tidak tepat.');
  }

  resetFailedLogin_(user);
  const trusted = registerOrRefreshTrustedDevice_(user, ci, deviceCredential);
  const token = createSessionToken_(user.email, true, user.sessionVersion, trusted.deviceId);
  recordLoginEventSafe_(user, ci, 'BERJAYA', `PIN e-Keberadaan; trusted device ${EK.SESSION.REMEMBER_DAYS} hari; DeviceID=${trusted.deviceId}`);
  audit_('LOGIN_APLIKASI', user.email, `PIN e-Keberadaan; trusted device ${EK.SESSION.REMEMBER_DAYS} hari; DeviceID=${trusted.deviceId}; IP=${ci.ip || '-'}`, user.email);
  return {ok:true,token,deviceToken:trusted.credential,remember:true,boot:buildBootstrap_(user)};
}


function setFirstPin(changeTicket, newPin, confirmPin, clientInfo, deviceCredential) {
  newPin = normalizePin_(newPin);
  confirmPin = normalizePin_(confirmPin);
  if (newPin !== confirmPin) throw new Error('Pengesahan PIN tidak sepadan.');
  validateNewPin_(newPin);

  const data = readPasswordChangeTicket_(changeTicket);
  const user = getUserByEmail_(data.e, true);
  if (!user) throw new Error('Akaun tidak lagi aktif. Hubungi pentadbir.');
  if (!user.mustChangePassword) throw new Error('Tetapan PIN ini telah digunakan atau tidak lagi sah. Mulakan semula dari halaman login.');
  if (Number(user.sessionVersion || 1) !== Number(data.v || 1)) throw new Error('Tetapan akaun telah berubah. Mulakan semula dari halaman login.');

  const purpose = String(data.purpose || 'FIRST_SETUP').toUpperCase();
  setUserPassword_(user, newPin, false);
  deletePasswordChangeTicket_(changeTicket);

  const fresh = getUserByEmail_(user.email, true);
  const ci = normalizeClientInfo_(clientInfo || {ip:data.ip,userAgent:data.ua,platform:data.pf,timezone:data.tz});
  const trusted = registerOrRefreshTrustedDevice_(fresh, ci, deviceCredential);
  const token = createSessionToken_(fresh.email, true, fresh.sessionVersion, trusted.deviceId);

  if (purpose === 'ADMIN_RESET') {
    audit_('TUKAR_PIN_SELEPAS_RESET', fresh.email, 'Pengguna menetapkan PIN 6 digit baharu selepas reset Pentadbir', fresh.email);
    recordLoginEventSafe_(fresh, ci, 'PIN_RESET_BERJAYA', `PIN baharu ditetapkan; sesi peranti ${EK.SESSION.REMEMBER_DAYS} hari`);
    notifyPasswordResetCompleted_(fresh, true);
  } else {
    audit_('TETAP_PIN_PERTAMA', fresh.email, 'Pengguna menetapkan PIN 6 digit sendiri pada log masuk pertama/migrasi', fresh.email);
    recordLoginEventSafe_(fresh, ci, 'LOGIN_PERTAMA_BERJAYA', `PIN ditetapkan; sesi peranti ${EK.SESSION.REMEMBER_DAYS} hari`);
    notifyFirstLoginCompleted_(fresh, true);
  }

  return {ok:true,token,deviceToken:trusted.credential,remember:true,boot:buildBootstrap_(fresh)};
}


function resumeSession(token, deviceCredential, clientInfo) {
  const session = verifySessionToken_(token);
  const user = requireSessionUser_(token);
  const ci = normalizeClientInfo_(clientInfo);

  // Migration + repair path: legacy 30-day tokens did not contain a DeviceID,
  // and a browser can also lose only the device credential while retaining the
  // signed session. A still-valid signed session may safely bootstrap a fresh
  // trusted-device record.
  let trusted;
  if (session.d && deviceCredential) {
    trusted = verifyTrustedDeviceCredential_(deviceCredential, user.email, session.d);
    touchTrustedDevice_(trusted, ci, true);
    trusted.credential = String(deviceCredential || '').trim();
  } else {
    trusted = registerOrRefreshTrustedDevice_(user, ci, deviceCredential);
    if (session.d && trusted.deviceId !== session.d) {
      revokeTrustedDeviceById_(session.d, user.email, 'DIGANTI_SEMASA_RESUME');
    }
  }

  const freshToken = Number(session.r || 0) === 1
    ? createSessionToken_(user.email, true, user.sessionVersion, trusted.deviceId)
    : token;
  return {ok:true, token:freshToken, deviceToken:trusted.credential, boot:buildBootstrap_(user)};
}

function resumeTrustedDevice(deviceCredential, clientInfo) {
  const ci = normalizeClientInfo_(clientInfo);
  const trusted = verifyTrustedDeviceCredential_(deviceCredential);
  const user = getUserByEmail_(trusted.email, true);
  if (!user) throw new Error('Akaun trusted device ini tidak lagi aktif. Sila log masuk semula.');
  if (Number(trusted.sessionVersion || 0) !== Math.max(1, Number(user.sessionVersion || 1))) {
    revokeTrustedDeviceById_(trusted.deviceId, user.email, 'VERSI_SESI_BERUBAH');
    throw new Error('Trusted device ini telah dibatalkan kerana PIN atau tetapan akaun berubah. Sila log masuk semula.');
  }
  touchTrustedDevice_(trusted, ci, true);
  const token = createSessionToken_(user.email, true, user.sessionVersion, trusted.deviceId);
  recordLoginEventSafe_(user, ci, 'RESUME_TRUSTED_DEVICE', `Sesi dipulihkan daripada trusted device; DeviceID=${trusted.deviceId}`);
  return {ok:true, token, deviceToken:String(deviceCredential || '').trim(), boot:buildBootstrap_(user)};
}

function logoutApp(token) {
  try {
    const session = verifySessionToken_(token);
    const user = requireSessionUser_(token);
    if (session.d) revokeTrustedDeviceById_(session.d, user.email, 'LOGOUT_PERANTI');
    audit_('LOGOUT_APLIKASI', user.email, `Keluar aplikasi${session.d ? '; DeviceID=' + session.d : ''}`, user.email);
  } catch (e) {}
  return {ok:true};
}

function buildBootstrap_(user) {
  const settings = getSettings_();
  const today = todayKey_();
  const rec = findAttendanceRecord_(today, user.email);
  const effective = getEffectiveSchedule_(user, settings);
  let locationReady = true;
  if (String(settings.SYSTEM_MODE || 'REAL').toUpperCase() !== 'TEST') {
    try { validateLocationSettings_(settings); } catch (e) { locationReady = false; }
  }

  return {
    today,
    now: formatDateTime_(new Date()),
    user: Object.assign(publicUser_(user), {canManageAbsence: isManagementUser_(user)}),
    schedule: effective,
    settings: publicSettings_(settings),
    locationReady,
    attendance: rec ? publicAttendance_(rec, effective) : null
  };
}

/**
 * Reset kelayakan login pengguna yang dipilih terus dari sheet PENGGUNA.
 * Cara guna: klik mana-mana sel pada baris pengguna -> eKeberadaan ->
 * "Reset pengguna dipilih (fresh)".
 *
 * Fungsi ini TIDAK memadam rekod kehadiran / tidak hadir / audit. Ia hanya:
 * - kosongkan PasswordSalt + PasswordHash
 * - tandakan WajibTukarPassword = TRUE
 * - naikkan VersiSesi (semua sesi lama terbatal)
 * - kosongkan counter lock/login gagal
 *
 * Pada login seterusnya, pengguna hanya masukkan emel DELIMa dan terus
 * dibawa ke skrin Cipta PIN Baharu.
 */
function resetSelectedUserFreshFromMenu() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getActiveSheet();
  if (!sh || sh.getName() !== EK.SHEETS.USERS) {
    ui.alert('Reset pengguna', `Buka sheet ${EK.SHEETS.USERS} dan klik mana-mana sel pada baris pengguna yang hendak direset.`, ui.ButtonSet.OK);
    return;
  }

  const row = sh.getActiveRange() ? sh.getActiveRange().getRow() : 0;
  if (row < 2) {
    ui.alert('Reset pengguna', 'Pilih baris pengguna, bukan baris tajuk.', ui.ButtonSet.OK);
    return;
  }

  const email = normalizeEmail_(sh.getRange(row, 3).getDisplayValue());
  const name = String(sh.getRange(row, 2).getDisplayValue() || '').trim();
  if (!email) {
    ui.alert('Reset pengguna', 'Baris yang dipilih tidak mempunyai emel.', ui.ButtonSet.OK);
    return;
  }

  const answer = ui.alert(
    'Reset pengguna (fresh)',
    `Reset akses login untuk ${name || email}\n${email}?\n\nPIN/hash akan dikosongkan dan semua sesi lama akan terbatal. Rekod waktu / kehadiran tidak dipadam.`,
    ui.ButtonSet.YES_NO
  );
  if (answer !== ui.Button.YES) return;

  const user = getUserByEmail_(email, false);
  if (!user) {
    ui.alert('Reset pengguna', 'Pengguna tidak dijumpai dalam PENGGUNA.', ui.ButtonSet.OK);
    return;
  }

  const resetUser = preparePasswordSetupState_(user);
  const actor = normalizeEmail_(Session.getEffectiveUser().getEmail()) || EK.EMAIL.OWNER_EMAIL || 'PENTADBIR_SHEET';
  audit_('RESET_PENGGUNA_FRESH', email, `PIN/hash/salt dikosongkan dari menu Google Sheet oleh ${actor}; semua sesi lama dibatalkan`, actor);

  let emailSent = false;
  if (hasUserEverLoggedIn_(email)) {
    try {
      sendPasswordResetPromptEmail_(resetUser, {email: actor, name: actor});
      emailSent = true;
      audit_('EMAIL_PIN_RESET', email, `Arahan reset fresh dihantar oleh ${actor}`, actor);
    } catch (err) {
      audit_('EMAIL_PIN_RESET_GAGAL', email, String(err && err.message ? err.message : err), actor);
    }
  }

  ui.alert(
    'Reset selesai',
    `${name || email}\n${email}\n\nAkaun kini dalam keadaan fresh. Pada login seterusnya, pengguna masukkan emel DELIMa dan terus tetapkan PIN 6 digit baharu.${emailSent ? '\n\nEmel arahan reset turut dihantar.' : ''}`,
    ui.ButtonSet.OK
  );
}

// ---------- PIN administration ----------

function adminResetPassword(token, email) {
  const admin = requireSessionAdmin_(token);
  email = normalizeEmail_(email);
  const user = getUserByEmail_(email, false);
  if (!user) throw new Error('Pengguna tidak dijumpai.');

  const resetUser = preparePasswordSetupState_(user);
  audit_('RESET_PASSWORD', email, `PIN dikosongkan oleh ${admin.email}; pengguna akan menetapkan PIN baharu sendiri; semua sesi lama dibatalkan`, admin.email);

  let emailSent = false;
  try {
    sendPasswordResetPromptEmail_(resetUser, admin);
    emailSent = true;
    audit_('EMAIL_PIN_RESET', email, `Arahan reset PIN dihantar selepas reset oleh ${admin.email}`, admin.email);
  } catch (err) {
    audit_('EMAIL_PIN_RESET_GAGAL', email, String(err && err.message ? err.message : err), admin.email);
  }

  return {
    ok: true,
    mustChangePassword: true,
    emailSent,
    email: resetUser.email,
    name: resetUser.name,
    message: emailSent
      ? 'PIN pengguna telah direset. Emel arahan telah dihantar; pengguna hanya perlu masukkan emel DELIMa dan cipta PIN 6 digit baharu.'
      : 'PIN pengguna telah direset. Emel arahan tidak dapat dihantar, tetapi pengguna masih boleh masukkan emel DELIMa dan cipta PIN 6 digit baharu.'
  };
}

function adminBulkResetPasswords(token, emails) {
  const admin = requireSessionAdmin_(token);
  const unique = [...new Set((emails || []).map(normalizeEmail_).filter(Boolean))];
  if (!unique.length) throw new Error('Pilih sekurang-kurangnya seorang pengguna.');
  if (unique.length > 150) throw new Error('Maksimum 150 pengguna bagi satu operasi bulk.');

  const results = [];
  const usersByEmail = {};
  getAllUsers_().forEach(u => usersByEmail[u.email] = u);

  unique.forEach(email => {
    const user = usersByEmail[email];
    if (!user) return;
    const resetUser = preparePasswordSetupState_(user);
    let emailSent = false;
    try {
      sendPasswordResetPromptEmail_(resetUser, admin);
      emailSent = true;
    } catch (err) {
      audit_('EMAIL_PIN_BULK_GAGAL', resetUser.email, String(err && err.message ? err.message : err), admin.email);
    }
    results.push({
      email: resetUser.email,
      name: resetUser.name,
      emailSent,
      message: emailSent ? 'Arahan reset dihantar' : 'Emel gagal dihantar'
    });
  });

  SpreadsheetApp.flush();
  audit_(
    'BULK_RESET_PIN',
    results.map(r => r.email).join(', '),
    `Oleh ${admin.email}; jumlah=${results.length}; emelBerjaya=${results.filter(r => r.emailSent).length}; model=SET_PIN_SENDIRI`,
    admin.email
  );
  return {ok: true, results};
}

function adminUnlockUser(token, email) {
  const admin = requireSessionAdmin_(token);
  email = normalizeEmail_(email);
  const user = getUserByEmail_(email, false);
  if (!user) throw new Error('Pengguna tidak dijumpai.');
  resetFailedLogin_(user);
  audit_('BUKA_KUNCI_LOGIN', email, `Sekatan login dibuka oleh ${admin.email}`, admin.email);
  notifyAccountUnlocked_(getUserByEmail_(email, false) || user, admin);
  return {ok:true};
}

function setMyAdminPasswordFromMenu() {
  const ui = SpreadsheetApp.getUi();
  const actor = normalizeEmail_(Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail());
  if (!actor) {
    ui.alert('Emel akaun Google semasa tidak dapat dibaca. Buka Google Sheet menggunakan akaun pemilik/pentadbir dan cuba lagi.');
    return;
  }
  const user = getUserByEmail_(actor, false);
  if (!user || !user.isAdmin) {
    ui.alert('Akaun ' + actor + ' belum ditanda sebagai Pentadbir ✓ dalam PENGGUNA.');
    return;
  }

  const resetUser = preparePasswordSetupState_(user);
  audit_('RESET_PIN_PENTADBIR_SHEET', actor, 'Akses PIN pentadbir disediakan melalui menu Google Sheet; semua sesi lama dibatalkan', actor);

  let emailSent = false;
  try {
    sendPasswordResetPromptEmail_(resetUser, {name:'Pentadbir Sistem', email:actor});
    emailSent = true;
  } catch (e) {}

  ui.alert(
    'Akses pentadbir disediakan',
    'Akaun: ' + actor + '\n\n' +
    'Tiada PIN sementara diperlukan. Buka e-Keberadaan, masukkan emel DELIMa ini dan tekan Teruskan. ' +
    'Anda akan terus diminta mencipta PIN 6 digit baharu.' +
    (emailSent ? '\n\nEmel arahan juga telah dihantar.' : ''),
    ui.ButtonSet.OK
  );
}

function setUserPassword_(user, password, mustChange) {
  const pin = validateNewPin_(password);
  const salt = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  const hash = hashPassword_(pin, salt);
  const nextVersion = Math.max(1, Number(user.sessionVersion || 1)) + 1;
  const sh = getSheetOrThrow_(EK.SHEETS.USERS);

  sh.getRange(user.row, 10, 1, 7).setValues([[
    salt, hash, !!mustChange, nextVersion, 0, '', new Date()
  ]]);
  sh.getRange(user.row, 12).insertCheckboxes().setValue(!!mustChange);
  sh.getRange(user.row, 15).setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.getRange(user.row, 16).setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.getRange(user.row, 19).setValue(EK.PASSWORD.AUTH_TYPE);
  invalidateUsersCache_();
  revokeAllTrustedDevicesForUser_(user.email, 'PIN_DIKEMASKINI');
  SpreadsheetApp.flush();
}

function verifyPassword_(password, user) {
  if (!user || !user.passwordHash || !user.passwordSalt) return false;
  const actual = hashPassword_(String(password || ''), user.passwordSalt);
  return constantTimeEquals_(actual, user.passwordHash);
}

function hashPassword_(password, salt) {
  const material = String(salt || '') + '\n' + String(password || '');
  const signature = Utilities.computeHmacSha256Signature(
    material,
    getPasswordPepper_(),
    Utilities.Charset.UTF_8
  );
  return Utilities.base64EncodeWebSafe(signature);
}

function getPasswordPepper_() {
  const props = PropertiesService.getScriptProperties();
  let pepper = props.getProperty(EK.PASSWORD.PEPPER_KEY);
  if (!pepper) {
    pepper = `${Utilities.getUuid()}-${Utilities.getUuid()}-${Utilities.getUuid()}-${Date.now()}`;
    props.setProperty(EK.PASSWORD.PEPPER_KEY, pepper);
  }
  return pepper;
}

function assertNotLocked_(user) {
  const until = user.lockedUntil instanceof Date
    ? user.lockedUntil
    : (user.lockedUntil ? new Date(user.lockedUntil) : null);
  if (until && !isNaN(until.getTime()) && until.getTime() > Date.now()) {
    const mins = Math.max(1, Math.ceil((until.getTime() - Date.now()) / 60000));
    throw new Error(`Terlalu banyak percubaan log masuk. Akaun dikunci sementara. Cuba lagi dalam kira-kira ${mins} minit.`);
  }
  if (until && !isNaN(until.getTime()) && until.getTime() <= Date.now()) {
    resetFailedLogin_(user);
  }
}

function registerFailedLogin_(user) {
  const sh = getSheetOrThrow_(EK.SHEETS.USERS);
  const count = Math.max(0, Number(user.failedLoginCount || 0)) + 1;
  if (count >= EK.PASSWORD.MAX_FAILED) {
    const until = new Date(Date.now() + EK.PASSWORD.LOCK_MINUTES * 60 * 1000);
    sh.getRange(user.row, 14, 1, 2).setValues([[0, until]]);
    sh.getRange(user.row, 15).setNumberFormat('dd/MM/yyyy HH:mm:ss');
    invalidateUsersCache_();
    audit_('LOGIN_DIKUNCI', user.email, `Melebihi ${EK.PASSWORD.MAX_FAILED} percubaan; dikunci ${EK.PASSWORD.LOCK_MINUTES} minit`, user.email);
    notifyAccountLocked_(user, until);
    return;
  }
  sh.getRange(user.row, 14).setValue(count);
  invalidateUsersCache_();
}

function resetFailedLogin_(user) {
  // Normal successful logins usually have nothing to reset. Avoid two Sheet
  // writes + a flush on every login when the counters are already clean.
  if (!Number(user.failedLoginCount || 0) && !user.lockedUntil) return;
  const sh = getSheetOrThrow_(EK.SHEETS.USERS);
  sh.getRange(user.row, 14, 1, 2).setValues([[0, '']]);
  invalidateUsersCache_();
}

function createPasswordChangeTicket_(user, remember, clientInfo, purpose) {
  cleanupPasswordChangeTickets_();
  const ticket = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  const ci = normalizeClientInfo_(clientInfo);
  const data = {
    e: user.email,
    r: remember ? 1 : 0,
    v: Math.max(1, Number(user.sessionVersion || 1)),
    purpose: String(purpose || 'TEMP_PASSWORD').toUpperCase(),
    ip: ci.ip || '',
    ua: ci.userAgent || '',
    pf: ci.platform || '',
    tz: ci.timezone || '',
    exp: Date.now() + EK.PASSWORD.CHANGE_TICKET_TTL_MS
  };
  PropertiesService.getScriptProperties().setProperty(EK.PASSWORD.CHANGE_TICKET_PREFIX + ticket, JSON.stringify(data));
  return ticket;
}

function readPasswordChangeTicket_(ticket) {
  ticket = String(ticket || '').trim();
  if (!/^[a-f0-9]{64}$/i.test(ticket)) throw new Error('Sesi menetapkan PIN tidak sah. Log masuk semula.');
  const raw = PropertiesService.getScriptProperties().getProperty(EK.PASSWORD.CHANGE_TICKET_PREFIX + ticket);
  if (!raw) throw new Error('Sesi menetapkan PIN telah tamat. Log masuk semula.');
  let data;
  try { data = JSON.parse(raw); } catch (e) { throw new Error('Sesi menetapkan PIN rosak. Log masuk semula.'); }
  if (!data || !data.e || !data.exp || Date.now() > Number(data.exp)) {
    deletePasswordChangeTicket_(ticket);
    throw new Error('Sesi menetapkan PIN telah tamat. Log masuk semula.');
  }
  return data;
}

function deletePasswordChangeTicket_(ticket) {
  PropertiesService.getScriptProperties().deleteProperty(EK.PASSWORD.CHANGE_TICKET_PREFIX + String(ticket || '').trim());
}

function cleanupPasswordChangeTickets_() {
  const props = PropertiesService.getScriptProperties();
  const all = props.getProperties();
  Object.keys(all).forEach(key => {
    if (!key.startsWith(EK.PASSWORD.CHANGE_TICKET_PREFIX)) return;
    try {
      const data = JSON.parse(all[key]);
      if (!data.exp || Date.now() > Number(data.exp)) props.deleteProperty(key);
    } catch (e) {
      props.deleteProperty(key);
    }
  });
}

function createSessionToken_(email, remember, sessionVersion, deviceId) {
  const now = Date.now();
  const ttl = remember
    ? EK.SESSION.REMEMBER_DAYS * 24 * 60 * 60 * 1000
    : EK.SESSION.NORMAL_HOURS * 60 * 60 * 1000;
  const payload = {
    e: normalizeEmail_(email),
    v: Math.max(1, Number(sessionVersion || 1)),
    iat: now,
    exp: now + ttl,
    r: remember ? 1 : 0,
    d: String(deviceId || '').trim(),
    n: Utilities.getUuid()
  };
  const body = Utilities.base64EncodeWebSafe(JSON.stringify(payload), Utilities.Charset.UTF_8);
  const sig = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(body, getSessionSecret_(), Utilities.Charset.UTF_8)
  );
  return `${body}.${sig}`;
}

function verifySessionToken_(token) {
  token = String(token || '').trim();
  const parts = token.split('.');
  if (parts.length !== 2) throw new Error('Sesi tidak sah. Sila log masuk semula.');
  const expected = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(parts[0], getSessionSecret_(), Utilities.Charset.UTF_8)
  );
  if (!constantTimeEquals_(parts[1], expected)) throw new Error('Sesi tidak sah. Sila log masuk semula.');

  let payload;
  try {
    payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString('UTF-8'));
  } catch (e) {
    throw new Error('Sesi rosak. Sila log masuk semula.');
  }
  if (!payload || !payload.e || !payload.exp || Date.now() > Number(payload.exp)) {
    throw new Error('Sesi telah tamat. Sila log masuk semula.');
  }
  return payload;
}

function requireSessionUser_(token) {
  const session = verifySessionToken_(token);
  const email = normalizeEmail_(session.e);
  const user = getUserByEmail_(email, true);
  if (!user) throw new Error('Akaun ini tidak lagi aktif dalam PENGGUNA. Hubungi pentadbir.');
  if (Number(session.v || 0) !== Math.max(1, Number(user.sessionVersion || 1))) {
    throw new Error('Sesi ini telah dibatalkan kerana tetapan akaun atau PIN berubah. Sila log masuk semula.');
  }
  if (user.mustChangePassword) {
    throw new Error('PIN akaun perlu ditetapkan sebelum menggunakan eKeberadaan.');
  }
  if (session.d) assertSessionDeviceActive_(session, user);
  return user;
}

function requireSessionAdmin_(token) {
  const user = requireSessionUser_(token);
  if (!user.isAdmin) throw new Error('Fungsi ini hanya untuk pentadbir yang ditanda ✓ dalam PENGGUNA.');
  return user;
}

function getSessionSecret_() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty(EK.SESSION.SECRET_KEY);
  if (!secret) {
    secret = `${Utilities.getUuid()}-${Utilities.getUuid()}-${Date.now()}`;
    props.setProperty(EK.SESSION.SECRET_KEY, secret);
  }
  return secret;
}

function constantTimeEquals_(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ---------- Trusted-device session (30-day rolling, max 2 devices) ----------

function trustedDeviceCredentialParts_(credential) {
  const raw = String(credential || '').trim();
  const m = raw.match(/^([0-9a-f-]{36})\.([0-9a-f]{64})$/i);
  if (!m) throw new Error('Trusted device tidak sah. Sila log masuk semula.');
  return {deviceId:m[1].toLowerCase(), secret:m[2].toLowerCase()};
}

function hashTrustedDeviceSecret_(deviceId, secret) {
  const material = String(deviceId || '') + '\n' + String(secret || '');
  return Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(material, getSessionSecret_(), Utilities.Charset.UTF_8)
  );
}

function trustedDeviceFromRow_(v, row) {
  return {
    row,
    deviceId:String(v[0] || '').trim().toLowerCase(),
    email:normalizeEmail_(v[1]),
    deviceName:String(v[2] || '').trim(),
    platform:String(v[3] || '').trim(),
    browser:String(v[4] || '').trim(),
    lastIp:String(v[5] || '').trim(),
    createdAt:v[6] || '',
    lastSeenAt:v[7] || '',
    expiresAt:v[8] || '',
    active:toBool_(v[9]),
    sessionVersion:Math.max(1, Number(v[10]) || 1),
    tokenHash:String(v[11] || '').trim(),
    revokeReason:String(v[12] || '').trim()
  };
}

function getTrustedDevices_(email, includeInactive) {
  let all = EK_RUNTIME_TRUSTED_DEVICES_;
  if (!Array.isArray(all)) {
    all = cacheGetJson_(EK_PERF.TRUSTED_DEVICES_CACHE_KEY);
    if (!Array.isArray(all)) {
      const sh = ensureTrustedDevicesSheet_();
      if (sh.getLastRow() < 2) all = [];
      else {
        const rows = sh.getRange(2, 1, sh.getLastRow() - 1, EK.TRUSTED_DEVICE_HEADERS.length).getValues();
        all = rows.map((v,i)=>trustedDeviceFromRow_(v,i+2)).filter(d=>d.deviceId&&d.email);
      }
      cachePutJson_(EK_PERF.TRUSTED_DEVICES_CACHE_KEY, all, EK_PERF.TRUSTED_DEVICES_TTL_SEC);
    }
    EK_RUNTIME_TRUSTED_DEVICES_ = all;
  }
  const target = normalizeEmail_(email);
  return all.filter(d => (!target || d.email === target) && (includeInactive || d.active));
}

function findTrustedDeviceById_(deviceId) {
  deviceId = String(deviceId || '').trim().toLowerCase();
  if (!deviceId) return null;
  return getTrustedDevices_('', true).find(d => d.deviceId === deviceId) || null;
}

function browserNameFromUa_(ua) {
  ua = String(ua || '');
  if (/Edg\//i.test(ua)) return 'Microsoft Edge';
  if (/OPR\//i.test(ua)) return 'Opera';
  if (/CriOS|Chrome\//i.test(ua)) return 'Chrome';
  if (/FxiOS|Firefox\//i.test(ua)) return 'Firefox';
  if (/Safari\//i.test(ua) && !/Chrome|CriOS|Chromium/i.test(ua)) return 'Safari';
  return 'Pelayar';
}

function platformNameFromClientInfo_(ci) {
  const ua = String(ci && ci.userAgent || '');
  const pf = String(ci && ci.platform || '');
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android';
  if (/Windows/i.test(ua) || /Win/i.test(pf)) return 'Windows';
  if (/Macintosh|Mac OS/i.test(ua) || /Mac/i.test(pf)) return 'Mac';
  if (/Linux/i.test(ua) || /Linux/i.test(pf)) return 'Linux';
  return pf || 'Peranti';
}

function deviceNameFromClientInfo_(ci) {
  return `${platformNameFromClientInfo_(ci)} · ${browserNameFromUa_(ci && ci.userAgent)}`;
}

function newTrustedDeviceSecret_() {
  return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '').toLowerCase();
}

function dateMillis_(v) {
  if (v instanceof Date && !isNaN(v.getTime())) return v.getTime();
  const d = v ? new Date(v) : null;
  return d && !isNaN(d.getTime()) ? d.getTime() : 0;
}

function verifyTrustedDeviceCredential_(credential, expectedEmail, expectedDeviceId) {
  const parts = trustedDeviceCredentialParts_(credential);
  if (expectedDeviceId && parts.deviceId !== String(expectedDeviceId || '').trim().toLowerCase()) {
    throw new Error('Trusted device tidak sepadan dengan sesi ini. Sila log masuk semula.');
  }
  const rec = findTrustedDeviceById_(parts.deviceId);
  if (!rec || !rec.active) throw new Error('Trusted device ini telah dibatalkan. Sila log masuk semula.');
  if (expectedEmail && rec.email !== normalizeEmail_(expectedEmail)) throw new Error('Trusted device tidak sepadan dengan akaun.');
  if (dateMillis_(rec.expiresAt) && Date.now() > dateMillis_(rec.expiresAt)) {
    revokeTrustedDeviceById_(rec.deviceId, rec.email, 'TAMAT_30_HARI');
    throw new Error('Trusted device telah tamat. Sila log masuk semula.');
  }
  const actual = hashTrustedDeviceSecret_(rec.deviceId, parts.secret);
  if (!constantTimeEquals_(actual, rec.tokenHash)) throw new Error('Trusted device tidak sah. Sila log masuk semula.');
  return rec;
}

function registerOrRefreshTrustedDevice_(user, clientInfo, existingCredential) {
  const ci = normalizeClientInfo_(clientInfo);
  let existing = null;
  if (existingCredential) {
    try {
      existing = verifyTrustedDeviceCredential_(existingCredential, user.email);
      if (Number(existing.sessionVersion || 0) !== Math.max(1, Number(user.sessionVersion || 1))) {
        revokeTrustedDeviceById_(existing.deviceId, user.email, 'VERSI_SESI_BERUBAH');
        existing = null;
      }
    } catch (e) { existing = null; }
  }
  if (existing) {
    touchTrustedDevice_(existing, ci, true);
    existing.credential = String(existingCredential || '').trim();
    return existing;
  }

  cleanupTrustedDevices_(user.email);
  const active = getTrustedDevices_(user.email, false)
    .filter(d => Number(d.sessionVersion || 0) === Math.max(1, Number(user.sessionVersion || 1)))
    .sort((a,b) => dateMillis_(a.lastSeenAt || a.createdAt) - dateMillis_(b.lastSeenAt || b.createdAt));
  while (active.length >= EK.SESSION.MAX_TRUSTED_DEVICES) {
    const old = active.shift();
    revokeTrustedDeviceById_(old.deviceId, user.email, 'DIGANTI_PERANTI_BAHARU');
    audit_('TRUSTED_DEVICE_DIGANTI', user.email, `Had ${EK.SESSION.MAX_TRUSTED_DEVICES} peranti; DeviceID lama=${old.deviceId}`, user.email);
  }

  const sh = ensureTrustedDevicesSheet_();
  const deviceId = Utilities.getUuid().toLowerCase();
  const secret = newTrustedDeviceSecret_();
  const credential = `${deviceId}.${secret}`;
  const now = new Date();
  const exp = new Date(Date.now() + EK.SESSION.REMEMBER_DAYS * 24 * 60 * 60 * 1000);
  sh.appendRow([
    deviceId, user.email, deviceNameFromClientInfo_(ci), platformNameFromClientInfo_(ci), browserNameFromUa_(ci.userAgent),
    ci.ip || '', now, now, exp, true, Math.max(1, Number(user.sessionVersion || 1)),
    hashTrustedDeviceSecret_(deviceId, secret), ''
  ]);
  const row = sh.getLastRow();
  sh.getRange(row, 7, 1, 3).setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.getRange(row, 10).insertCheckboxes().setValue(true);
  invalidateTrustedDevicesCache_();
  const created = trustedDeviceFromRow_(sh.getRange(row,1,1,EK.TRUSTED_DEVICE_HEADERS.length).getValues()[0], row);
  created.credential = credential;
  return created;
}

function touchTrustedDevice_(rec, clientInfo, extendExpiry) {
  const sh = ensureTrustedDevicesSheet_();
  const ci = normalizeClientInfo_(clientInfo);
  const now = new Date();
  const exp = extendExpiry ? new Date(Date.now() + EK.SESSION.REMEMBER_DAYS * 24 * 60 * 60 * 1000) : rec.expiresAt;
  sh.getRange(rec.row, 3, 1, 7).setValues([[
    deviceNameFromClientInfo_(ci), platformNameFromClientInfo_(ci), browserNameFromUa_(ci.userAgent), ci.ip || rec.lastIp || '',
    rec.createdAt || now, now, exp
  ]]);
  sh.getRange(rec.row, 7, 1, 3).setNumberFormat('dd/MM/yyyy HH:mm:ss');
  rec.deviceName = deviceNameFromClientInfo_(ci);
  rec.platform = platformNameFromClientInfo_(ci);
  rec.browser = browserNameFromUa_(ci.userAgent);
  rec.lastIp = ci.ip || rec.lastIp || '';
  rec.lastSeenAt = now;
  rec.expiresAt = exp;
  invalidateTrustedDevicesCache_();
  return rec;
}

function cleanupTrustedDevices_(email) {
  getTrustedDevices_(email, false).forEach(d => {
    if ((dateMillis_(d.expiresAt) && Date.now() > dateMillis_(d.expiresAt))) {
      revokeTrustedDeviceById_(d.deviceId, d.email, 'TAMAT_30_HARI');
    }
  });
}

function revokeTrustedDeviceById_(deviceId, expectedEmail, reason) {
  const rec = findTrustedDeviceById_(deviceId);
  if (!rec || (expectedEmail && rec.email !== normalizeEmail_(expectedEmail))) return false;
  if (!rec.active) return true;
  const sh = ensureTrustedDevicesSheet_();
  sh.getRange(rec.row, 10).insertCheckboxes().setValue(false);
  sh.getRange(rec.row, 13).setValue(String(reason || 'DIBATALKAN'));
  invalidateTrustedDevicesCache_();
  return true;
}

function revokeAllTrustedDevicesForUser_(email, reason) {
  const rows = getTrustedDevices_(email, false);
  if (!rows.length) return 0;
  const sh = ensureTrustedDevicesSheet_();
  rows.forEach(rec => {
    sh.getRange(rec.row, 10).insertCheckboxes().setValue(false);
    sh.getRange(rec.row, 13).setValue(String(reason || 'SEMUA_PERANTI_DIBATALKAN'));
  });
  invalidateTrustedDevicesCache_();
  return rows.length;
}

function assertSessionDeviceActive_(session, user) {
  const rec = findTrustedDeviceById_(session.d);
  if (!rec || !rec.active || rec.email !== user.email) throw new Error('Sesi peranti ini telah dibatalkan. Sila log masuk semula.');
  if (Number(rec.sessionVersion || 0) !== Math.max(1, Number(user.sessionVersion || 1))) throw new Error('Sesi peranti ini telah dibatalkan kerana PIN atau tetapan akaun berubah. Sila log masuk semula.');
  if (dateMillis_(rec.expiresAt) && Date.now() > dateMillis_(rec.expiresAt)) {
    revokeTrustedDeviceById_(rec.deviceId, rec.email, 'TAMAT_30_HARI');
    throw new Error('Sesi peranti telah tamat. Sila log masuk semula.');
  }
}

function publicTrustedDevice_(d) {
  return {
    deviceId:d.deviceId,
    deviceName:d.deviceName || 'Peranti',
    platform:d.platform || '',
    browser:d.browser || '',
    lastIp:d.lastIp || '',
    createdAt:d.createdAt ? formatDateTime_(d.createdAt) : '',
    lastSeenAt:d.lastSeenAt ? formatDateTime_(d.lastSeenAt) : '',
    expiresAt:d.expiresAt ? formatDateTime_(d.expiresAt) : '',
    active:!!d.active,
    revokeReason:d.revokeReason || ''
  };
}

function adminListTrustedDevices(token, email) {
  requireSessionAdmin_(token);
  email = normalizeEmail_(email);
  const user = getUserByEmail_(email, false);
  if (!user) throw new Error('Pengguna tidak ditemui.');
  cleanupTrustedDevices_(email);
  return {ok:true, user:publicUser_(user), devices:getTrustedDevices_(email, false).map(publicTrustedDevice_)};
}

function adminRevokeTrustedDevice(token, deviceId) {
  const admin = requireSessionAdmin_(token);
  const rec = findTrustedDeviceById_(deviceId);
  if (!rec) throw new Error('Peranti tidak ditemui.');
  revokeTrustedDeviceById_(deviceId, rec.email, 'DIBATALKAN_PENTADBIR');
  audit_('BATAL_TRUSTED_DEVICE', rec.email, `DeviceID=${deviceId}`, admin.email);
  return {ok:true};
}

function adminRevokeAllTrustedDevices(token, email) {
  const admin = requireSessionAdmin_(token);
  email = normalizeEmail_(email);
  const count = revokeAllTrustedDevicesForUser_(email, 'SEMUA_PERANTI_DIBATALKAN_PENTADBIR');
  audit_('BATAL_SEMUA_TRUSTED_DEVICE', email, `Jumlah=${count}`, admin.email);
  return {ok:true,count};
}

// ---------- User functions ----------

function getBootstrapData(token) {
  const user = requireSessionUser_(token);
  // Migrasi selamat untuk deployment sedia ada: trigger Keberadaan baharu
  // dipasang sekali pada login pertama selepas versi ini tanpa menggagalkan login
  // jika akaun pemilik belum memberi permission ScriptApp.
  try { ensurePresenceDeadlineTrigger_(); }
  catch (e) { audit_('TRIGGER_KEBERADAAN_AUTO_INSTALL_GAGAL', user.email, String(e && e.message ? e.message : e), 'SISTEM'); }
  return buildBootstrap_(user);
}

/**
 * Data Punch Card bulanan untuk pengguna yang sedang log masuk sahaja.
 * monthKey mesti dalam format YYYY-MM.
 */
function getMyPunchCardMonth(token, monthKey) {
  const user = requireSessionUser_(token);
  // Gunakan builder yang sama seperti paparan Pentadbir supaya rekod
  // TIDAK HADIR (termasuk TIADA PENJELASAN dan permohonan MENUNGGU/DILULUSKAN)
  // sentiasa muncul pada Punch Card Digital pengguna sendiri.
  return buildPunchCardMonthForUser_(user, monthKey);
}

function adminGetPunchCardMonth(token, email, monthKey) {
  requireSessionAdmin_(token);
  const user = getUserByEmail_(normalizeEmail_(email), false);
  if (!user) throw new Error('Pengguna tidak dijumpai.');
  return buildPunchCardMonthForUser_(user, monthKey);
}

function buildPunchCardMonthForUser_(user, monthKey) {
  monthKey = String(monthKey || todayKey_().slice(0, 7)).trim();
  if (!/^\d{4}-\d{2}$/.test(monthKey)) throw new Error('Bulan tidak sah.');
  const parts = monthKey.split('-').map(Number);
  const year = parts[0], month = parts[1];
  if (year < 2000 || year > 2100 || month < 1 || month > 12) throw new Error('Bulan tidak sah.');
  const daysInMonth = new Date(year, month, 0).getDate();
  let records = [];
  {
    const rows = getAttendanceValuesForUserMonth_(user.email, monthKey);
    records = rows
      .map(v => {
        const dateKey = dateCellToKey_(v[0]);
        v = padAttendanceValues_(v);
        return {
          day: Number(dateKey.slice(8, 10)), date: dateKey, status: String(v[14] || ''),
          inTime: v[4] ? formatTime_(v[4]) : '', outTime: v[9] ? formatTime_(v[9]) : '',
          inTime2: v[22] ? formatTime_(v[22]) : '', outTime2: v[27] ? formatTime_(v[27]) : '',
          statusFlags: inferAttendanceFlags_(v, user, getSettings_()),
          source: String(v[15] || ''), editedBy: String(v[16] || ''), reason: String(v[17] || '')
        };
      }).sort((a, b) => a.day - b.day);
  }
  const settings = getSettings_();
  const systemStartDate = getSystemStartDate_(settings);
  records = records.filter(r => r.date >= systemStartDate);

  // v10.10: Tandakan cuti hujung minggu Jumaat/Sabtu pada Punch Card Digital.
  // Jika pegawai benar-benar punch pada hari tersebut, rekod punch sebenar
  // sentiasa diberi keutamaan dan label JUMAAT/SABTU tidak dipaparkan.
  // Label hanya digunakan jika hari tersebut memang bukan hari bekerja dalam
  // WORKING_DAYS supaya konfigurasi Pentadbir tetap dihormati.
  const existingByDay = new Map(records.map(r => [Number(r.day), r]));
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${monthKey}-${String(day).padStart(2,'0')}`;
    if (dateKey < systemStartDate) continue;
    const weekendLabel = weekendLabelForDateKey_(dateKey, settings);
    if (!weekendLabel) continue;

    const existing = existingByDay.get(day);
    if (existing && (existing.inTime || existing.outTime)) continue;

    if (existing) {
      existing.status = 'WEEKEND';
      existing.source = 'WEEKEND';
      existing.editedBy = 'SISTEM';
      existing.reason = weekendLabel;
    } else {
      const added = {
        day, date: dateKey, status: 'WEEKEND', inTime: '', outTime: '',
        source: 'WEEKEND', editedBy: 'SISTEM', reason: weekendLabel
      };
      records.push(added);
      existingByDay.set(day, added);
    }
  }

  // Paparkan status hari tanpa Punch Masuk secara dinamik.
  // Keberadaan aktif mendapat pengecualian khas daripada ABSENT_AFTER:
  // kekal BELUM HADIR sehingga waktu akhir Keberadaan. Hanya proses alert
  // Pengurusan boleh menulis TIDAK HADIR bagi kes Keberadaan.
  const today = todayKey_();
  const nowMinutes = minutesNow_(new Date());
  const absentMinutes = timeToMinutes_(settings.ABSENT_AFTER);
  const absenceRowsForCard = readAbsenceRows_();
  const userAbsences = absenceRowsForCard.filter(r => r.email === user.email && r.mode !== 'KEBERADAAN' && ['MENUNGGU','DILULUSKAN'].includes(r.status));
  const userPresences = absenceRowsForCard.filter(r => r.email === user.email && r.mode === 'KEBERADAAN' && ['MENUNGGU','DILULUSKAN'].includes(r.status));
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${monthKey}-${String(day).padStart(2,'0')}`;
    if (dateKey < systemStartDate || dateKey > today) continue;
    if (!isWorkingDay_(dateKey, settings)) continue;

    const due = dateKey < today || (dateKey === today && nowMinutes >= absentMinutes);
    const req = userAbsences.find(r => r.startDate <= dateKey && r.endDate >= dateKey) || null;
    const presenceReq = userPresences.find(r => r.startDate <= dateKey && r.endDate >= dateKey) || null;
    const existing = existingByDay.get(day);

    // Jika rekod fizikal sudah menjadi TIDAK HADIR (contohnya selepas alert
    // Keberadaan berjaya dihantar), jangan timpa status tersebut.
    if (existing && String(existing.status || '').trim().toUpperCase() === 'TIDAK HADIR') {
      continue;
    }

    if (presenceReq) {
      // Keberadaan tidak terus ditukar kepada TIDAK HADIR pada ABSENT_AFTER.
      // Ia kekal sebagai Belum Hadir sehingga punch sebenar atau proses tamat
      // Keberadaan menghantar alert dan menulis rekod fizikal.
      const presenceReason = presenceRequestReason_(presenceReq, '');
      if (existing) {
        if (!existing.inTime && !existing.outTime) {
          existing.status = 'BELUM HADIR';
          existing.source = 'KEBERADAAN';
          existing.editedBy = presenceReq.reviewedBy || '';
          existing.reason = presenceReason;
        }
      } else {
        const added = {
          day, date: dateKey, status: 'BELUM HADIR', inTime: '', outTime: '',
          source: 'KEBERADAAN', editedBy: presenceReq.reviewedBy || '',
          reason: presenceReason
        };
        records.push(added);
        existingByDay.set(day, added);
      }
      continue;
    }

    // Permohonan Tidak Hadir aktif dipaparkan walaupun belum melepasi
    // ABSENT_AFTER. Tanpa permohonan, hanya tarikh yang telah due ditanda.
    if (!req && !due) continue;
    const absenceReason = req
      ? `${req.type}${req.status === 'MENUNGGU' ? ' — MENUNGGU KELULUSAN' : ''}`
      : 'TIADA PENJELASAN';

    if (existing) {
      if (!existing.inTime && !existing.outTime) {
        existing.status = 'TIDAK HADIR';
        existing.source = req ? 'TIDAK_HADIR' : 'AUTO_TIDAK_HADIR';
        existing.editedBy = req && req.reviewedBy ? req.reviewedBy : 'SISTEM';
        existing.reason = absenceReason;
      }
      continue;
    }

    const added = {
      day, date: dateKey, status: 'TIDAK HADIR', inTime: '', outTime: '',
      source: req ? 'TIDAK_HADIR' : 'AUTO_TIDAK_HADIR', editedBy: req && req.reviewedBy ? req.reviewedBy : 'SISTEM',
      reason: absenceReason
    };
    records.push(added);
    existingByDay.set(day, added);
  }

  const reviewRows = readTimeReviewRows_().filter(r => r.email === user.email && r.date >= systemStartDate && String(r.date || '').slice(0,7) === monthKey);
  records.forEach(r => {
    const dayReviews = reviewRows.filter(x => x.date === r.date);
    r.reviewState = timeReviewStatementForCard_(dayReviews, r.statusFlags || []);
  });
  records.sort((a,b) => a.day - b.day);
  return {
    month: monthKey, daysInMonth,
    cardNumber: String(Math.max(1, Number(user.row || 2) - 1)).padStart(3, '0'),
    schoolName: settings.SCHOOL_NAME, department: settings.SCHOOL_NAME,
    user: publicUser_(user), records
  };
}

function punch(token, type, location, clientInfo) {
  const user = requireSessionUser_(token);
  const settings = getSettings_();
  const isTestMode = String(settings.SYSTEM_MODE || 'REAL').toUpperCase() === 'TEST';
  if (!isTestMode) validateLocationSettings_(settings);

  type = String(type || '').toUpperCase();
  if (!['IN', 'OUT'].includes(type)) throw new Error('Jenis rekod waktu tidak sah.');

  const ci = normalizeClientInfo_(clientInfo);
  const ipTracking = String(settings.IP_TRACKING_ENABLED || 'TRUE').toUpperCase() !== 'FALSE';
  const recordIp = ipTracking ? ci.ip : '';
  const loc = isTestMode
    ? {lat: '', lng: '', accuracyM: '', distanceM: 0}
    : validateAndMeasureLocation_(location, settings);
  const now = new Date();
  const dateKey = todayKey_();
  const schedule = getEffectiveSchedule_(user, settings);
  const nowMinutes = minutesNow_(now);

  let result = null;
  let timeReviewRecord = null;
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const todayRows = getAttendanceByDate_(dateKey);
    let userMatches = todayRows.filter(r => r.email === user.email);
    const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
    let rec = userMatches.length > 1
      ? mergeAttendanceDuplicateGroup_(sh, userMatches)
      : (userMatches[0] || null);
    if (userMatches.length > 1) audit_('AUTO_GABUNG_DUPLIKAT', `${user.email} ${dateKey}`, `${userMatches.length} rekod digabungkan menjadi 1`);

    let values = rec ? padAttendanceValues_(rec.values) : Array(EK.ATT_HEADERS.length).fill('');
    if (rec && String(values[15] || '').toUpperCase() === 'TIDAK_HADIR' && !values[4]) {
      throw new Error('Anda mempunyai rekod Tidak Hadir yang telah diluluskan untuk hari ini. Hubungi pentadbir jika rekod itu perlu dibatalkan.');
    }

    const step = nextAttendanceStep_(values, schedule);
    if (step.complete) throw new Error('Semua rekod waktu hari ini sudah lengkap.');
    if (step.type !== type) {
      const expected = step.type === 'IN' ? 'Waktu Masuk' : 'Waktu Balik';
      throw new Error(`Turutan rekod waktu mesti berselang. Rekod seterusnya ialah ${expected}.`);
    }

    const ipCheck = evaluatePunchIp_(user, type, recordIp, now, settings, isTestMode, todayRows);
    const session = step.session;
    const refTime = type === 'IN'
      ? (session === 1 ? schedule.s1In : schedule.s2In)
      : (session === 1 ? schedule.s1Out : schedule.s2Out);
    let exceptionType = '';
    if (!isTestMode && refTime) {
      const refMinutes = timeToMinutes_(refTime);
      if (type === 'IN' && nowMinutes > refMinutes) exceptionType = 'LEWAT';
      if (type === 'OUT' && nowMinutes < refMinutes) exceptionType = 'BALIK AWAL';
    }

    const presenceRequest = type === 'IN'
      ? findRelevantPresenceForDate_(user.email, dateKey, readAbsenceRows_())
      : null;

    if (!rec) {
      values[0] = dateKey;
      values[1] = user.email;
      values[2] = user.name;
      values[3] = user.category;
    } else {
      values[2] = user.name;
      values[3] = user.category;
    }

    if (session === 1 && type === 'IN') {
      values[4] = now; values[5] = loc.lat; values[6] = loc.lng; values[7] = loc.distanceM; values[8] = loc.accuracyM; values[19] = recordIp || '';
    } else if (session === 1 && type === 'OUT') {
      values[9] = now; values[10] = loc.lat; values[11] = loc.lng; values[12] = loc.distanceM; values[13] = loc.accuracyM; values[20] = recordIp || '';
    } else if (session === 2 && type === 'IN') {
      values[22] = now; values[23] = loc.lat; values[24] = loc.lng; values[25] = loc.distanceM; values[26] = loc.accuracyM; values[32] = recordIp || '';
    } else if (session === 2 && type === 'OUT') {
      values[27] = now; values[28] = loc.lat; values[29] = loc.lng; values[30] = loc.distanceM; values[31] = loc.accuracyM; values[33] = recordIp || '';
    }

    const flags = splitAttendanceFlags_(values[34]);
    if (exceptionType && !flags.includes(exceptionType)) flags.push(exceptionType);
    values[34] = joinAttendanceFlags_(flags);
    values[14] = attendanceStatusFromFlags_(flags);
    values[15] = isTestMode ? 'TEST' : 'GPS';
    values[18] = now;
    values[21] = mergeIpCheckNote_(values[21], ipCheck.note);
    if (presenceRequest && type === 'IN') {
      values[17] = mergeAttendanceReason_(values[17], presenceRequestReason_(presenceRequest, 'CATATAN'));
    }

    if (!rec) {
      sh.appendRow(values);
      rec = {row: sh.getLastRow(), values, email:user.email};
    } else {
      sh.getRange(rec.row, 1, 1, EK.ATT_HEADERS.length).setValues([values]);
      rec.values = values;
    }

    const action = `REKOD_${type === 'IN' ? 'MASUK' : 'KELUAR'}_SESI_${session}`;
    audit_(action, user.email, `${exceptionType || 'TEPAT MASA'}; mod=${isTestMode ? 'TEST' : 'REAL'}; jarak ${loc.distanceM}m; IP=${recordIp || '-'}; ${ipCheck.note || 'IP tiada isu'}`, user.email);

    if (exceptionType) {
      timeReviewRecord = createTimeReviewRecord_({
        date: dateKey,
        user,
        type: exceptionType,
        session,
        recordTime: formatTime_(now),
        referenceTime: refTime
      });
      // Status tetap LEWAT. Jika Keberadaan bagi tarikh ini sudah diluluskan
      // dan punch berlaku selepas waktu akhir Keberadaan, catatan/kelulusan
      // tersebut dianggap memadai dan semakan LEWAT diambil maklum automatik.
      if (exceptionType === 'LEWAT' && presenceRequest && presenceRequest.status === 'DILULUSKAN') {
        timeReviewRecord = autoAcknowledgeTimeReviewFromPresence_(timeReviewRecord, presenceRequest);
      }
    }

    const label = type === 'IN' ? 'Masuk' : 'Balik';
    result = {
      ok: true,
      message: `Rekod waktu ${label} berjaya${exceptionType ? ` — status ${exceptionType}` : ''}.`,
      attendance: publicAttendance_({values}, schedule),
      distanceM: loc.distanceM,
      ip: recordIp || '',
      ipWarning: ipCheck.warning || '',
      timeException: timeReviewRecord ? publicTimeReview_(timeReviewRecord) : null
    };
  } finally {
    lock.releaseLock();
  }

  if (timeReviewRecord && timeReviewRecord.isNew !== false && !timeReviewRecord.autoAcknowledged) notifyTimeException_(timeReviewRecord);
  return result;
}

// ---------- Admin functions ----------

function getAdminData(token, dateStr) {
  const admin = requireSessionAdmin_(token);
  const dateKey = validateDateKey_(dateStr || todayKey_());
  const allUsers = getAllUsers_();
  const activeUsers = allUsers.filter(u => u.active);
  const settings = getSettings_();
  const report = buildDailyReport_(dateKey, activeUsers, settings);

  return {
    date: dateKey,
    admin: publicUser_(admin),
    users: allUsers.map(publicUser_),
    settings: publicSettings_(settings),
    report,
    summary: summarizeReport_(report)
  };
}

function adminSaveUser(token, payload) {
  const admin = requireSessionAdmin_(token);
  payload = payload || {};

  const email = normalizeEmail_(payload.email);
  const name = String(payload.name || '').trim();
  const rawCategory = String(payload.category || '').trim();
  const category = rawCategory === 'Pentadbir' ? 'Pengurusan' : rawCategory;
  const active = toBool_(payload.active);
  const isAdmin = toBool_(payload.isAdmin);
  const jobTitle = String(payload.jobTitle || '').trim();
  const s1In = normalizeOptionalTime_(payload.s1In);
  const s1Out = normalizeOptionalTime_(payload.s1Out);
  const s2In = normalizeOptionalTime_(payload.s2In);
  const s2Out = normalizeOptionalTime_(payload.s2Out);
  const note = String(payload.note || '').trim();

  if (!email || !isValidEmail_(email)) throw new Error('Emel tidak sah.');
  if (!name) throw new Error('Nama diperlukan.');
  if (!EK.CATEGORIES.includes(category)) throw new Error('Kategori tidak sah.');
  if (s2Out && !s2In) throw new Error('Tetapkan Sesi 2 Masuk sebelum Sesi 2 Keluar.');

  const sh = getSheetOrThrow_(EK.SHEETS.USERS);
  const existing = getUserByEmail_(email, false);
  const before = existing ? {
    email: existing.email, name: existing.name, category: existing.category,
    active: !!existing.active, isAdmin: !!existing.isAdmin
  } : null;

  if (existing) {
    // A:I intentionally retains the historical layout. F/H mirror Sesi 1 so
    // older deployments can still read sensible schedule values during rollout.
    sh.getRange(existing.row, 1, 1, 9).setValues([[
      active, name, email, category, isAdmin, s1In, '', s1Out, note
    ]]);
    sh.getRange(existing.row, 20, 1, 5).setValues([[jobTitle, s1In, s1Out, s2In, s2Out]]);
    sh.getRange(existing.row, 1).insertCheckboxes().setValue(active);
    sh.getRange(existing.row, 5).insertCheckboxes().setValue(isAdmin);
    if (existing.active !== active || existing.isAdmin !== isAdmin) {
      sh.getRange(existing.row, 13).setValue(Math.max(1, Number(existing.sessionVersion || 1)) + 1);
      revokeAllTrustedDevicesForUser_(email, 'AKAUN_ATAU_HAK_AKSES_BERUBAH');
    }
  } else {
    const rowValues = Array(EK.USER_HEADERS.length).fill('');
    rowValues[0] = active; rowValues[1] = name; rowValues[2] = email; rowValues[3] = category; rowValues[4] = isAdmin;
    rowValues[5] = s1In; rowValues[7] = s1Out; rowValues[8] = note;
    rowValues[11] = false; rowValues[12] = 1; rowValues[13] = 0;
    rowValues[19] = jobTitle; rowValues[20] = s1In; rowValues[21] = s1Out; rowValues[22] = s2In; rowValues[23] = s2Out;
    sh.appendRow(rowValues);
    const row = sh.getLastRow();
    sh.getRange(row, 1).insertCheckboxes().setValue(active);
    sh.getRange(row, 5).insertCheckboxes().setValue(isAdmin);
    sh.getRange(row, 12).insertCheckboxes().setValue(false);
  }

  invalidateUsersCache_();
  SpreadsheetApp.flush();
  const saved = getUserByEmail_(email, false);
  audit_('SIMPAN_PENGGUNA', email, `Oleh ${admin.email}; kategori=${category}; jawatan=${jobTitle || '-'}; admin=${isAdmin}`, admin.email);
  notifyUserAccountChange_(before, saved, admin);
  return {ok: true, user: publicUser_(saved)};
}

function adminSaveAttendance(token, payload) {
  const admin=requireSessionAdmin_(token); payload=payload||{};
  const email=normalizeEmail_(payload.email), dateKey=validateDateKey_(payload.date);
  assertSystemDate_(dateKey, getSettings_(), 'Tarikh rekod');
  const inTime=normalizeOptionalTime_(payload.inTime), outTime=normalizeOptionalTime_(payload.outTime), inTime2=normalizeOptionalTime_(payload.inTime2), outTime2=normalizeOptionalTime_(payload.outTime2);
  const reason=String(payload.reason||'').trim(); if(!reason)throw new Error('Sebab pembetulan wajib diisi untuk audit.');
  const user=getUserByEmail_(email,false); if(!user)throw new Error('Pengguna tidak dijumpai.');
  const presenceRequest=inTime?findRelevantPresenceForDate_(email,dateKey,readAbsenceRows_()):null;
  if(outTime&&!inTime)throw new Error('Keluar Sesi 1 memerlukan Masuk Sesi 1.');
  if(inTime2&&!outTime)throw new Error('Masuk Sesi 2 hanya boleh selepas Keluar Sesi 1.');
  if(outTime2&&!inTime2)throw new Error('Keluar Sesi 2 memerlukan Masuk Sesi 2.');
  const settings=getSettings_(), schedule=getEffectiveSchedule_(user,settings), flags=[];
  if(inTime&&schedule.s1In&&timeToMinutes_(inTime)>timeToMinutes_(schedule.s1In))flags.push('LEWAT');
  if(outTime&&schedule.s1Out&&timeToMinutes_(outTime)<timeToMinutes_(schedule.s1Out))flags.push('BALIK AWAL');
  if(inTime2&&schedule.s2In&&timeToMinutes_(inTime2)>timeToMinutes_(schedule.s2In))flags.push('LEWAT');
  if(outTime2&&schedule.s2Out&&timeToMinutes_(outTime2)<timeToMinutes_(schedule.s2Out))flags.push('BALIK AWAL');
  const status=inTime?attendanceStatusFromFlags_(flags):'TIDAK HADIR', sh=getSheetOrThrow_(EK.SHEETS.ATTENDANCE), rec=findAttendanceRecord_(dateKey,email), now=new Date();
  const v=rec?padAttendanceValues_(rec.values):Array(EK.ATT_HEADERS.length).fill('');
  v[0]=dateKey;v[1]=email;v[2]=user.name;v[3]=user.category;v[4]=inTime?dateAndTime_(dateKey,inTime):'';v[9]=outTime?dateAndTime_(dateKey,outTime):'';v[14]=status;v[15]='ADMIN';v[16]=admin.email;v[17]=presenceRequest?mergeAttendanceReason_(reason,presenceRequestReason_(presenceRequest,'CATATAN')):reason;v[18]=now;
  v[22]=inTime2?dateAndTime_(dateKey,inTime2):'';v[27]=outTime2?dateAndTime_(dateKey,outTime2):'';v[34]=joinAttendanceFlags_(flags);
  if(!rec)sh.appendRow(v);else sh.getRange(rec.row,1,1,EK.ATT_HEADERS.length).setValues([v]);
  const exceptionSpecs=[];
  if(inTime&&schedule.s1In&&timeToMinutes_(inTime)>timeToMinutes_(schedule.s1In))exceptionSpecs.push({type:'LEWAT',session:1,recordTime:inTime,referenceTime:schedule.s1In});
  if(outTime&&schedule.s1Out&&timeToMinutes_(outTime)<timeToMinutes_(schedule.s1Out))exceptionSpecs.push({type:'BALIK AWAL',session:1,recordTime:outTime,referenceTime:schedule.s1Out});
  if(inTime2&&schedule.s2In&&timeToMinutes_(inTime2)>timeToMinutes_(schedule.s2In))exceptionSpecs.push({type:'LEWAT',session:2,recordTime:inTime2,referenceTime:schedule.s2In});
  if(outTime2&&schedule.s2Out&&timeToMinutes_(outTime2)<timeToMinutes_(schedule.s2Out))exceptionSpecs.push({type:'BALIK AWAL',session:2,recordTime:outTime2,referenceTime:schedule.s2Out});
  exceptionSpecs.forEach(x=>{
    let rr=createTimeReviewRecord_({date:dateKey,user,type:x.type,session:x.session,recordTime:x.recordTime,referenceTime:x.referenceTime});
    if(x.type==='LEWAT'&&presenceRequest&&presenceRequest.status==='DILULUSKAN')rr=autoAcknowledgeTimeReviewFromPresence_(rr,presenceRequest,admin);
    if(rr.isNew!==false&&!rr.autoAcknowledged)notifyTimeException_(rr);
  });
  audit_('UBAH_KEHADIRAN',`${email} ${dateKey}`,`${reason}; S1=${inTime||'-'}-${outTime||'-'}; S2=${inTime2||'-'}-${outTime2||'-'}; status=${status}`,admin.email);
  return {ok:true,status};
}

function adminRepairAttendanceDuplicates(token) {
  const admin = requireSessionAdmin_(token);
  const result = repairAttendanceDuplicates_({audit: false});
  audit_(
    'BAIKI_DUPLIKAT_KEHADIRAN',
    EK.SHEETS.ATTENDANCE,
    `Oleh ${admin.email}; kumpulan=${result.groupsMerged}; baris dibuang=${result.rowsRemoved}`,
    admin.email
  );
  return Object.assign({ok: true}, result);
}

/** Boleh dijalankan dari menu Google Sheet oleh pentadbir aktif. */
function repairAttendanceDuplicatesFromMenu() {
  const admin = requireGoogleAdmin_();
  const result = repairAttendanceDuplicates_({audit: false});
  audit_(
    'BAIKI_DUPLIKAT_KEHADIRAN',
    EK.SHEETS.ATTENDANCE,
    `Menu Google Sheet oleh ${admin.email}; kumpulan=${result.groupsMerged}; baris dibuang=${result.rowsRemoved}`,
    admin.email
  );
  try {
    SpreadsheetApp.getUi().alert(
      'Baiki rekod duplikat',
      result.groupsMerged
        ? `${result.groupsMerged} kumpulan duplikat digabungkan dan ${result.rowsRemoved} baris lebihan dibuang.`
        : 'Tiada rekod duplikat dijumpai.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {}
  return result;
}

function adminSaveSettings(token, payload) {
  const admin = requireSessionAdmin_(token);
  payload = payload || {};
  const currentSettings = getSettings_();

  const next = {
    SCHOOL_NAME: String(payload.schoolName || '').trim(),
    SCHOOL_LAT: String(payload.schoolLat || '').trim(),
    SCHOOL_LNG: String(payload.schoolLng || '').trim(),
    RADIUS_M: String(Number(payload.radiusM || 200)),
    MAX_GPS_ACCURACY_M: String(Number(payload.maxGpsAccuracyM || 120)),
    // Legacy keys are mirrored from Sesi 1 for backwards compatibility.
    DEFAULT_LATE_AFTER: normalizeTime_(payload.defaultS1In || payload.defaultLateAfter),
    DEFAULT_MAX_PUNCH_IN: '23:59',
    DEFAULT_PUNCH_OUT_FROM: normalizeTime_(payload.defaultS1Out || payload.defaultPunchOutFrom),
    DEFAULT_S1_IN: normalizeTime_(payload.defaultS1In || payload.defaultLateAfter),
    DEFAULT_S1_OUT: normalizeTime_(payload.defaultS1Out || payload.defaultPunchOutFrom),
    DEFAULT_S2_IN: normalizeOptionalTime_(payload.defaultS2In),
    DEFAULT_S2_OUT: normalizeOptionalTime_(payload.defaultS2Out),
    ABSENT_AFTER: normalizeTime_(payload.absentAfter),
    PUNCH_REMINDER_ENABLED: String(payload.punchReminderEnabled || 'TRUE').toUpperCase() === 'FALSE' ? 'FALSE' : 'TRUE',
    PUNCH_REMINDER_TIME: normalizeTime_(payload.punchReminderTime || '09:00'),
    WORKING_DAYS: normalizeWorkingDays_(payload.workingDays || EK.DEFAULT_SETTINGS.WORKING_DAYS),
    IP_TRACKING_ENABLED: String(payload.ipTrackingEnabled || 'TRUE').toUpperCase() === 'FALSE' ? 'FALSE' : 'TRUE',
    IP_PUNCH_POLICY: normalizeIpPunchPolicy_(payload.ipPunchPolicy || 'WARN'),
    SYSTEM_MODE: String(payload.systemMode || 'REAL').toUpperCase() === 'TEST' ? 'TEST' : 'REAL',
    // Tarikh mula sistem disenggara terus pada sheet TETAPAN supaya mudah diubah
    // tanpa perlu menambah medan baharu pada UI Pentadbir.
    SYSTEM_START_DATE: normalizeSystemStartDate_(payload.systemStartDate || currentSettings.SYSTEM_START_DATE || EK.DEFAULT_SETTINGS.SYSTEM_START_DATE),
    PROFILE_ROOT_FOLDER_ID: String(payload.profileRootFolderId || '').trim()
  };

  if (!next.SCHOOL_NAME) throw new Error('Nama sekolah diperlukan.');
  if (next.SYSTEM_MODE === 'REAL') validateLatLng_(next.SCHOOL_LAT, next.SCHOOL_LNG);
  else if (next.SCHOOL_LAT || next.SCHOOL_LNG) validateLatLng_(next.SCHOOL_LAT, next.SCHOOL_LNG);
  if (!(Number(next.RADIUS_M) > 0 && Number(next.RADIUS_M) <= 5000)) throw new Error('Radius mesti antara 1 hingga 5000 meter.');
  if (!(Number(next.MAX_GPS_ACCURACY_M) > 0 && Number(next.MAX_GPS_ACCURACY_M) <= 2000)) throw new Error('Had ketepatan GPS tidak sah.');
  if (next.DEFAULT_S2_OUT && !next.DEFAULT_S2_IN) throw new Error('Tetapkan Sesi 2 Masuk sebelum Sesi 2 Keluar.');

  const sh = getSheetOrThrow_(EK.SHEETS.SETTINGS);
  const existingRows = sh.getLastRow() >= 2 ? sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues() : [];
  const rowIndex = {};
  existingRows.forEach((r, i) => { const key = String(r[0] || '').trim(); if (key) rowIndex[key] = i; });
  Object.keys(EK.DEFAULT_SETTINGS).forEach(key => {
    if (Object.prototype.hasOwnProperty.call(rowIndex, key)) existingRows[rowIndex[key]][1] = next[key];
    else { rowIndex[key] = existingRows.length; existingRows.push([key, next[key], '']); }
  });
  if (existingRows.length) sh.getRange(2, 1, existingRows.length, 3).setValues(existingRows);
  invalidateSettingsCache_();
  // Cuba pasang semula trigger jika masa/aktif reminder berubah. Kegagalan trigger
  // tidak membatalkan simpanan tetapan; pemilik boleh guna menu Aktifkan / baiki notifikasi emel.
  try { installEmailNotifications_({silent: true}); }
  catch (e) { audit_('TRIGGER_NOTIFIKASI_GAGAL', EK.SHEETS.SETTINGS, String(e && e.message ? e.message : e), admin.email); }
  audit_('SIMPAN_TETAPAN', EK.SHEETS.SETTINGS, `Oleh ${admin.email}; mode=${next.SYSTEM_MODE}; S1=${next.DEFAULT_S1_IN}-${next.DEFAULT_S1_OUT}; S2=${next.DEFAULT_S2_IN || '-'}-${next.DEFAULT_S2_OUT || '-'}; radius=${next.RADIUS_M}m; reminder=${next.PUNCH_REMINDER_ENABLED}@${next.PUNCH_REMINDER_TIME}; hari=${next.WORKING_DAYS}; IP=${next.IP_TRACKING_ENABLED}/${next.IP_PUNCH_POLICY}`, admin.email);
  return {ok: true, settings: publicSettings_(getSettings_())};
}

function generateReportSheet(token, dateStr) {
  requireSessionAdmin_(token);
  const dateKey = validateDateKey_(dateStr || todayKey_());
  assertSystemDate_(dateKey, getSettings_(), 'Tarikh laporan');
  const users = getAllUsers_().filter(u => u.active);
  const report = buildDailyReport_(dateKey, users, getSettings_());
  writeReportSheet_(dateKey, report);
  return {ok: true, sheetName: EK.SHEETS.REPORT, summary: summarizeReport_(report)};
}

/** Menu Google Sheet tidak menggunakan token browser; ia hanya boleh digunakan oleh admin aktif. */
function generateTodayReportFromMenu() {
  const admin = requireGoogleAdmin_();
  const dateKey = todayKey_();
  const users = getAllUsers_().filter(u => u.active);
  const report = buildDailyReport_(dateKey, users, getSettings_());
  writeReportSheet_(dateKey, report);
  audit_('JANA_LAPORAN_SHEET', dateKey, `Menu Google Sheet oleh ${admin.email}`, admin.email);
  try {
    SpreadsheetApp.getUi().alert(`Laporan ${dateKey} dijana di helaian ${EK.SHEETS.REPORT}.`);
  } catch (e) {}
}

function requireGoogleAdmin_() {
  const email = normalizeEmail_(Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail());
  const user = getUserByEmail_(email, true);
  if (!user || !user.isAdmin) throw new Error('Fungsi ini hanya untuk pentadbir aktif.');
  return user;
}

// ---------- Reporting ----------

function buildDailyReport_(dateKey, users, settings) {
  settings = settings || getSettings_();
  if (!isOnOrAfterSystemStart_(dateKey, settings)) return [];
  const records = getAttendanceByDate_(dateKey);
  const byEmail = {};
  records.forEach(r => byEmail[r.email] = r);
  const absenceRows = readAbsenceRows_();

  const today = todayKey_();
  const nowMins = minutesNow_(new Date());
  const absentMins = timeToMinutes_(settings.ABSENT_AFTER);

  return users.map(u => {
    const rec = byEmail[u.email];
    const v = rec ? padAttendanceValues_(rec.values) : null;
    const presenceRequest = (!v || !v[4]) ? findRelevantPresenceForDate_(u.email, dateKey, absenceRows) : null;
    let status;
    if (v && String(v[14] || '').toUpperCase() === 'TIDAK HADIR') {
      status = 'TIDAK HADIR';
    } else if (v && v[4]) {
      status = String(v[14] || attendanceStatusFromFlags_(v[34]));
    } else if (presenceRequest) {
      // Keberadaan aktif mengatasi ABSENT_AFTER. Status hanya bertukar
      // TIDAK HADIR selepas alert Pengurusan berjaya dan rekod fizikal ditulis.
      status = 'BELUM HADIR';
    } else if (isWorkingDay_(dateKey, settings) && (dateKey < today || (dateKey === today && nowMins >= absentMins))) {
      status = 'TIDAK HADIR';
    } else {
      status = 'BELUM HADIR';
    }

    const coveringRequest = (!v || !v[4]) ? findRelevantAbsenceForDate_(u.email, dateKey, absenceRows, 'TIDAK_HADIR') : null;
    return {
      date: dateKey,
      name: u.name,
      email: u.email,
      jobTitle: u.jobTitle || '',
      category: u.category,
      status,
      statusFlags: v ? splitAttendanceFlags_(v[34]) : [],
      inTime: v && v[4] ? formatTime_(v[4]) : '',
      outTime: v && v[9] ? formatTime_(v[9]) : '',
      inTime2: v && v[22] ? formatTime_(v[22]) : '',
      outTime2: v && v[27] ? formatTime_(v[27]) : '',
      inDistanceM: v && v[7] !== '' ? Number(v[7]) : null,
      outDistanceM: v && v[12] !== '' ? Number(v[12]) : null,
      inDistanceM2: v && v[25] !== '' ? Number(v[25]) : null,
      outDistanceM2: v && v[30] !== '' ? Number(v[30]) : null,
      inIp: v ? String(v[19] || '') : '',
      outIp: v ? String(v[20] || '') : '',
      inIp2: v ? String(v[32] || '') : '',
      outIp2: v ? String(v[33] || '') : '',
      ipCheck: v ? String(v[21] || '') : '',
      source: v ? String(v[15] || '') : (coveringRequest ? 'TIDAK_HADIR' : (presenceRequest ? 'KEBERADAAN' : '')),
      editedBy: v ? String(v[16] || '') : (presenceRequest ? String(presenceRequest.reviewedBy || '') : ''),
      reason: v ? String(v[17] || '') : (coveringRequest ? `${coveringRequest.type}${coveringRequest.status === 'MENUNGGU' ? ' — MENUNGGU KELULUSAN' : ''}` : (presenceRequest ? presenceRequestReason_(presenceRequest, '') : ''))
    };
  }).sort((a, b) => {
    const rank = st => st === 'TIDAK HADIR' ? 0 : st.includes('LEWAT') || st.includes('BALIK AWAL') ? 1 : st === 'BELUM HADIR' ? 2 : 3;
    return (rank(a.status) - rank(b.status)) || a.name.localeCompare(b.name);
  });
}

function summarizeReport_(report) {
  const s = {total: report.length, hadir: 0, lewat: 0, balikAwal: 0, tidakHadir: 0, belumHadir: 0};
  report.forEach(r => {
    const st = String(r.status || '');
    if (st === 'TIDAK HADIR') s.tidakHadir++;
    else if (st === 'BELUM HADIR') s.belumHadir++;
    else {
      if (st.includes('LEWAT')) s.lewat++;
      if (st.includes('BALIK AWAL')) s.balikAwal++;
      if (!st.includes('LEWAT') && !st.includes('BALIK AWAL')) s.hadir++;
    }
  });
  return s;
}

function normalizeAttendancePresenceRange_(payload) {
  payload = payload || {};
  const settings = getSettings_();
  let fromDate = validateDateKey_(payload.fromDate || todayKey_());
  const toDate = validateDateKey_(payload.toDate || fromDate);
  if (toDate < fromDate) throw new Error('Tarikh akhir tidak boleh sebelum tarikh mula.');
  const systemStartDate = getSystemStartDate_(settings);
  if (toDate < systemStartDate) throw new Error(`Tiada data sistem sebelum ${systemStartDate}. Ubah SYSTEM_START_DATE di sheet TETAPAN jika perlu.`);
  fromDate = clampToSystemStart_(fromDate, settings);
  if (daysBetweenKeys_(fromDate, toDate) > 366) throw new Error('Tempoh laporan maksimum ialah 367 hari.');
  return {fromDate, toDate, type:String(payload.type || 'RANGE').toUpperCase(), systemStartDate};
}

function buildAttendancePresencePeriodReport_(fromDate, toDate) {
  const users = getAllUsers_().filter(u => u.active);
  const settings = getSettings_();
  const attendanceValues = getAttendanceValuesInDateRange_(fromDate, toDate);
  const attendanceMap = {};
  const attendanceDates = {};
  attendanceValues.forEach(raw => {
    const v = padAttendanceValues_(raw);
    const dateKey = dateCellToKey_(v[0]);
    const email = normalizeEmail_(v[1]);
    if (!dateKey || !email) return;
    attendanceMap[`${dateKey}|${email}`] = v;
    attendanceDates[dateKey] = true;
  });

  const absenceRows = readAbsenceRows_();
  const presence = absenceRows.filter(r => r.mode === 'KEBERADAAN' && r.endDate >= fromDate && r.startDate <= toDate && r.status !== 'DIBATALKAN');
  const dates = dateKeysBetween_(fromDate, toDate);
  const today = todayKey_();
  const nowMins = minutesNow_(new Date());
  const absentMins = timeToMinutes_(settings.ABSENT_AFTER);
  const detail = [];
  const summaryByEmail = {};

  users.forEach(u => summaryByEmail[u.email] = {
    name:u.name, email:u.email, jobTitle:u.jobTitle || '', category:u.category,
    expectedDays:0, normal:0, late:0, early:0, absent:0, pending:0, presence:0
  });

  presence.forEach(r => {
    const s = summaryByEmail[r.email];
    if (s) s.presence++;
  });

  dates.forEach(dateKey => {
    const working = isWorkingDay_(dateKey, settings);
    users.forEach(u => {
      const v = attendanceMap[`${dateKey}|${u.email}`] || null;
      if (!working && !v) return;
      const s = summaryByEmail[u.email];
      if (working) s.expectedDays++;
      let status = '';
      const presenceRequest = (!v || !v[4]) ? findRelevantPresenceForDate_(u.email, dateKey, absenceRows) : null;
      if (v && String(v[14] || '').toUpperCase() === 'TIDAK HADIR') status = 'TIDAK HADIR';
      else if (v && v[4]) status = String(v[14] || attendanceStatusFromFlags_(v[34]));
      else if (presenceRequest) status = 'BELUM HADIR';
      else if (working && (dateKey < today || (dateKey === today && nowMins >= absentMins))) status = 'TIDAK HADIR';
      else status = 'BELUM HADIR';

      const coveringRequest = (!v || !v[4]) ? findRelevantAbsenceForDate_(u.email, dateKey, absenceRows, 'TIDAK_HADIR') : null;
      const st = String(status || '');
      if (working) {
        if (st === 'TIDAK HADIR') s.absent++;
        else if (st === 'BELUM HADIR') s.pending++;
        else {
          if (st.includes('LEWAT')) s.late++;
          if (st.includes('BALIK AWAL')) s.early++;
          if (!st.includes('LEWAT') && !st.includes('BALIK AWAL')) s.normal++;
        }
      }
      detail.push({
        date:dateKey, name:u.name, email:u.email, jobTitle:u.jobTitle || '', category:u.category, status,
        inTime:v && v[4] ? formatTime_(v[4]) : '', outTime:v && v[9] ? formatTime_(v[9]) : '',
        inTime2:v && v[22] ? formatTime_(v[22]) : '', outTime2:v && v[27] ? formatTime_(v[27]) : '',
        source:v ? String(v[15] || '') : (coveringRequest ? 'TIDAK_HADIR' : (presenceRequest ? 'KEBERADAAN' : '')),
        reason:v ? String(v[17] || '') : (coveringRequest ? `${coveringRequest.type}${coveringRequest.status === 'MENUNGGU' ? ' — MENUNGGU KELULUSAN' : ''}` : (presenceRequest ? presenceRequestReason_(presenceRequest, '') : ''))
      });
    });
  });

  const summary = users.map(u => summaryByEmail[u.email]);
  const presenceRows = presence.sort((a,b) => a.startDate.localeCompare(b.startDate) || a.name.localeCompare(b.name)).map(r => ({
    name:r.name, email:r.email, jobTitle:r.jobTitle || '', category:r.category, type:r.type,
    startDate:r.startDate < fromDate ? fromDate : r.startDate, endDate:r.endDate > toDate ? toDate : r.endDate, startTime:r.startTime, endTime:r.endTime,
    status:r.status, note:r.note || '', reviewedBy:r.reviewedBy || ''
  }));
  return {fromDate, toDate, workingDays:dates.filter(d => isWorkingDay_(d,settings)).length, summary, detail, presence:presenceRows};
}


function setPdfLandscape_(body) {
  // A4 landscape in points (297 mm × 210 mm at 72 pt/in).
  // Apply modest margins so wide report tables have more usable space.
  return body
    .setPageWidth(841.89)
    .setPageHeight(595.28)
    .setMarginTop(36)
    .setMarginBottom(36)
    .setMarginLeft(36)
    .setMarginRight(36);
}

function generateAttendancePresenceReportPdf(token, payload) {
  requireSessionAdmin_(token);
  const range = normalizeAttendancePresenceRange_(payload);
  const data = buildAttendancePresencePeriodReport_(range.fromDate, range.toDate);
  const periodLabel = data.fromDate === data.toDate ? data.fromDate : `${data.fromDate} hingga ${data.toDate}`;
  const fileName = `Laporan_Kehadiran_Keberadaan_${data.fromDate}_${data.toDate}.pdf`;
  const doc = DocumentApp.create(fileName.replace(/\.pdf$/i,''));
  const body = doc.getBody();
  setPdfLandscape_(body);
  body.appendParagraph('Laporan Kehadiran / Keberadaan').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(`Tempoh: ${periodLabel} · Hari bekerja dalam tempoh: ${data.workingDays}`);
  body.appendParagraph(`Dijana: ${formatDateTime_(new Date())}`);

  body.appendParagraph('Ringkasan Pegawai').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  const summaryHeaders = ['Nama','Jawatan / Kategori','Hari Kerja','Hadir','Lewat','Balik Awal','Tidak Hadir','Belum Hadir','Keberadaan'];
  const summaryRows = data.summary.map(r => [r.name,[r.jobTitle,r.category].filter(Boolean).join(' / '),r.expectedDays,r.normal,r.late,r.early,r.absent,r.pending,r.presence]);
  const summaryTable = body.appendTable([summaryHeaders].concat(summaryRows.map(r => r.map(v => String(v == null ? '' : v)))));
  if (summaryTable.getNumRows()) { const hr=summaryTable.getRow(0); for(let c=0;c<hr.getNumCells();c++) hr.getCell(c).editAsText().setBold(true); }

  const exceptions = data.detail.filter(r => r.status !== 'HADIR' || r.reason);
  body.appendParagraph('Butiran Kehadiran Yang Perlu Perhatian').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  if (exceptions.length) {
    const h=['Tarikh','Nama','Status','Masuk','Balik','Masuk 2','Balik 2','Sumber / Sebab'];
    const rows=exceptions.map(r=>[r.date,r.name,r.status,r.inTime||'—',r.outTime||'—',r.inTime2||'—',r.outTime2||'—',[r.source,r.reason].filter(Boolean).join(' — ')]);
    const t=body.appendTable([h].concat(rows.map(r=>r.map(v=>String(v==null?'':v))))); const hr=t.getRow(0);for(let c=0;c<hr.getNumCells();c++)hr.getCell(c).editAsText().setBold(true);
  } else body.appendParagraph('Tiada rekod lewat, balik awal, tidak hadir atau rekod lain yang memerlukan perhatian dalam tempoh ini.');

  body.appendParagraph('Rekod Keberadaan').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  if (data.presence.length) {
    const h=['Nama','Jenis','Tarikh','Masa','Status','Catatan'];
    const rows=data.presence.map(r=>[r.name,r.type,r.startDate===r.endDate?r.startDate:`${r.startDate} - ${r.endDate}`,`${r.startTime||'—'} - ${r.endTime||'—'}`,r.status,r.note||'']);
    const t=body.appendTable([h].concat(rows.map(r=>r.map(v=>String(v==null?'':v))))); const hr=t.getRow(0);for(let c=0;c<hr.getNumCells();c++)hr.getCell(c).editAsText().setBold(true);
  } else body.appendParagraph('Tiada rekod keberadaan dalam tempoh ini.');

  doc.saveAndClose();
  const f=DriveApp.getFileById(doc.getId());
  const blob=f.getAs(MimeType.PDF).setName(fileName);f.setTrashed(true);
  audit_('JANA_LAPORAN_KEHADIRAN_KEBERADAAN_PDF',periodLabel,`Ringkasan=${data.summary.length}; detail=${data.detail.length}; keberadaan=${data.presence.length}`);
  return {fileName,mimeType:'application/pdf',base64:Utilities.base64Encode(blob.getBytes())};
}

function generateAttendancePresenceReportSheet(token, payload) {
  requireSessionAdmin_(token);
  const range = normalizeAttendancePresenceRange_(payload);
  const data = buildAttendancePresencePeriodReport_(range.fromDate, range.toDate);
  const ss = getSpreadsheet_();
  const sheetName = 'LAPORAN KEHADIRAN';
  const sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sh.clear();
  sh.getRange(1,1).setValue('LAPORAN KEHADIRAN / KEBERADAAN').setFontWeight('bold').setFontSize(14);
  sh.getRange(2,1).setValue(`Tempoh: ${data.fromDate}${data.fromDate===data.toDate?'':` hingga ${data.toDate}`} · Hari bekerja: ${data.workingDays}`);
  sh.getRange(4,1).setValue('RINGKASAN PEGAWAI').setFontWeight('bold');
  const sumHeaders=['Nama','Emel','Jawatan','Kategori','Hari Kerja','Hadir','Lewat','Balik Awal','Tidak Hadir','Belum Hadir','Keberadaan'];
  sh.getRange(5,1,1,sumHeaders.length).setValues([sumHeaders]).setFontWeight('bold');
  if(data.summary.length) sh.getRange(6,1,data.summary.length,sumHeaders.length).setValues(data.summary.map(r=>[r.name,r.email,r.jobTitle,r.category,r.expectedDays,r.normal,r.late,r.early,r.absent,r.pending,r.presence]));

  let row=6+data.summary.length+2;
  sh.getRange(row,1).setValue('BUTIRAN KEHADIRAN').setFontWeight('bold');row++;
  const detailHeaders=['Tarikh','Nama','Emel','Jawatan','Kategori','Status','Masuk 1','Balik 1','Masuk 2','Balik 2','Sumber','Sebab'];
  sh.getRange(row,1,1,detailHeaders.length).setValues([detailHeaders]).setFontWeight('bold');row++;
  if(data.detail.length){sh.getRange(row,1,data.detail.length,detailHeaders.length).setValues(data.detail.map(r=>[r.date,r.name,r.email,r.jobTitle,r.category,r.status,r.inTime,r.outTime,r.inTime2,r.outTime2,r.source,r.reason]));row+=data.detail.length;}

  row+=2;sh.getRange(row,1).setValue('REKOD KEBERADAAN').setFontWeight('bold');row++;
  const pHeaders=['Nama','Emel','Jawatan','Kategori','Jenis','Tarikh Mula','Tarikh Akhir','Masa Mula','Masa Akhir','Status','Catatan','Disemak Oleh'];
  sh.getRange(row,1,1,pHeaders.length).setValues([pHeaders]).setFontWeight('bold');row++;
  if(data.presence.length) sh.getRange(row,1,data.presence.length,pHeaders.length).setValues(data.presence.map(r=>[r.name,r.email,r.jobTitle,r.category,r.type,r.startDate,r.endDate,r.startTime,r.endTime,r.status,r.note,r.reviewedBy]));
  sh.autoResizeColumns(1,12);sh.setFrozenRows(5);
  audit_('JANA_LAPORAN_KEHADIRAN_KEBERADAAN_SHEET',`${data.fromDate}-${data.toDate}`,`Detail=${data.detail.length}; keberadaan=${data.presence.length}`);
  return {ok:true,sheetName,fromDate:data.fromDate,toDate:data.toDate,summaryCount:data.summary.length,detailCount:data.detail.length,presenceCount:data.presence.length};
}

function writeReportSheet_(dateKey, report) {
  const sh = getSheetOrThrow_(EK.SHEETS.REPORT);
  sh.clearContents();
  const summary = summarizeReport_(report);
  const headers = ['Tarikh', 'Nama', 'Jawatan', 'Emel', 'Kategori', 'Status', 'Masuk 1', 'Keluar 1', 'Masuk 2', 'Keluar 2', 'IP Masuk 1', 'IP Keluar 1', 'IP Masuk 2', 'IP Keluar 2', 'Semakan IP', 'Sumber', 'Disunting Oleh', 'Sebab'];
  sh.getRange(1, 1).setValue(`LAPORAN KEBERADAAN — ${dateKey}`).setFontWeight('bold').setFontSize(14);
  sh.getRange(2, 1, 1, 6).setValues([['Jumlah', 'Hadir', 'Lewat', 'Balik Awal', 'Tidak Hadir', 'Belum Hadir']]);
  sh.getRange(3, 1, 1, 6).setValues([[summary.total, summary.hadir, summary.lewat, summary.balikAwal, summary.tidakHadir, summary.belumHadir]]);
  sh.getRange(5, 1, 1, headers.length).setValues([headers]);
  if (report.length) {
    sh.getRange(6, 1, report.length, headers.length).setValues(report.map(r => [
      r.date, r.name, r.jobTitle || '', r.email, r.category, r.status,
      r.inTime, r.outTime, r.inTime2, r.outTime2,
      r.inIp || '', r.outIp || '', r.inIp2 || '', r.outIp2 || '', r.ipCheck || '',
      r.source, r.editedBy, r.reason
    ]));
  }
  styleReportSheet_(sh, report.length);
}

// ---------- Users ----------

function getAllUsers_() {
  if (Array.isArray(EK_RUNTIME_USERS_)) return EK_RUNTIME_USERS_;
  const cached = cacheGetJson_(EK_PERF.USERS_CACHE_KEY);
  if (Array.isArray(cached)) { EK_RUNTIME_USERS_ = cached; return EK_RUNTIME_USERS_; }

  const sh = getSheetOrThrow_(EK.SHEETS.USERS);
  if (sh.getLastRow() < 2) { EK_RUNTIME_USERS_ = []; return EK_RUNTIME_USERS_; }
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, EK.USER_HEADERS.length).getValues();
  EK_RUNTIME_USERS_ = rows.map((v, i) => userFromRow_(v, i + 2)).filter(u => u.email);
  cachePutJson_(EK_PERF.USERS_CACHE_KEY, EK_RUNTIME_USERS_, EK_PERF.USERS_TTL_SEC);
  return EK_RUNTIME_USERS_;
}

function getUserByEmail_(email, activeOnly) {
  email = normalizeEmail_(email);
  if (!email) return null;
  return getAllUsers_().find(u => u.email === email && (!activeOnly || u.active)) || null;
}

function userFromRow_(v, row) {
  const sessionVersionRaw = Number(v[12]);
  const rawCategory = String(v[3] || '').trim() || 'PPP';
  const category = rawCategory === 'Pentadbir' ? 'Pengurusan' : rawCategory;
  return {
    row,
    active: toBool_(v[0]),
    name: String(v[1] || '').trim(),
    email: normalizeEmail_(v[2]),
    category,
    isAdmin: toBool_(v[4]),
    // Legacy schedule fields are kept as fallbacks so existing sheets migrate
    // without losing per-user settings. New schedules live in columns T:X.
    lateAfter: normalizeOptionalTime_(v[5]),
    maxPunchIn: normalizeOptionalTime_(v[6]),
    punchOutFrom: normalizeOptionalTime_(v[7]),
    note: String(v[8] || ''),
    passwordSalt: String(v[9] || ''),
    passwordHash: String(v[10] || ''),
    mustChangePassword: toBool_(v[11]),
    sessionVersion: Number.isFinite(sessionVersionRaw) && sessionVersionRaw > 0 ? sessionVersionRaw : 1,
    failedLoginCount: Math.max(0, Number(v[13]) || 0),
    lockedUntil: v[14] || '',
    passwordUpdatedAt: v[15] || '',
    profilePhotoFileId: String(v[16] || '').trim(),
    profilePhotoUpdatedAt: v[17] || '',
    authType: String(v[18] || '').trim().toUpperCase(),
    jobTitle: String(v[19] || '').trim(),
    s1In: normalizeOptionalTime_(v[20]),
    s1Out: normalizeOptionalTime_(v[21]),
    s2In: normalizeOptionalTime_(v[22]),
    s2Out: normalizeOptionalTime_(v[23])
  };
}

function publicUser_(u) {
  const lockedDate = u.lockedUntil instanceof Date ? u.lockedUntil : (u.lockedUntil ? new Date(u.lockedUntil) : null);
  const isLocked = !!(lockedDate && !isNaN(lockedDate.getTime()) && lockedDate.getTime() > Date.now());
  return {
    active: !!u.active,
    name: u.name,
    email: u.email,
    category: u.category,
    jobTitle: u.jobTitle || '',
    isAdmin: !!u.isAdmin,
    lateAfter: u.lateAfter || '',
    maxPunchIn: u.maxPunchIn || '',
    punchOutFrom: u.punchOutFrom || '',
    s1In: u.s1In || '',
    s1Out: u.s1Out || '',
    s2In: u.s2In || '',
    s2Out: u.s2Out || '',
    note: u.note || '',
    passwordSet: !!u.passwordHash,
    pinSet: String(u.authType || '').toUpperCase() === EK.PASSWORD.AUTH_TYPE && !!u.passwordHash,
    authType: String(u.authType || ''),
    mustChangePassword: !!u.mustChangePassword,
    sessionVersion: Math.max(1, Number(u.sessionVersion || 1)),
    isLocked: isLocked,
    lockedUntil: isLocked ? formatDateTime_(lockedDate) : '',
    hasProfilePhoto: !!u.profilePhotoFileId,
    canManageAbsence: isManagementUser_(u)
  };
}

function getEffectiveSchedule_(user, settings) {
  const s1In = user.s1In || user.lateAfter || settings.DEFAULT_S1_IN || settings.DEFAULT_LATE_AFTER;
  const s1Out = user.s1Out || user.punchOutFrom || settings.DEFAULT_S1_OUT || settings.DEFAULT_PUNCH_OUT_FROM;
  const s2In = user.s2In || settings.DEFAULT_S2_IN || '';
  const s2Out = user.s2Out || settings.DEFAULT_S2_OUT || '';
  return {
    s1In, s1Out, s2In, s2Out,
    // Compatibility keys for older client code / existing reports. There is no
    // longer a hard 'masuk ditutup' or 'balik dibenarkan mulai' restriction.
    lateAfter: s1In,
    maxPunchIn: '',
    punchOutFrom: s1Out
  };
}

// ---------- Attendance data ----------

function groupContiguousRows_(rows) {
  const sorted = [...new Set((rows || []).map(Number).filter(n => n >= 2))].sort((a,b) => a-b);
  const groups = [];
  sorted.forEach(r => {
    const last = groups[groups.length - 1];
    if (last && r === last.end + 1) last.end = r;
    else groups.push({start:r,end:r});
  });
  return groups;
}

function readAttendanceRowsByRowNumbers_(sh, rowNumbers) {
  const out = [];
  groupContiguousRows_(rowNumbers).forEach(g => {
    const vals = sh.getRange(g.start, 1, g.end - g.start + 1, EK.ATT_HEADERS.length).getValues();
    vals.forEach((v, i) => out.push({row:g.start + i, values:v, email:normalizeEmail_(v[1])}));
  });
  return out;
}

function getAttendanceValuesInDateRange_(fromKey, toKey) {
  const settings = getSettings_();
  fromKey = clampToSystemStart_(fromKey, settings);
  toKey = validateDateKey_(toKey);
  if (toKey < getSystemStartDate_(settings) || toKey < fromKey) return [];
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const dates = sh.getRange(2, 1, last - 1, 1).getValues();
  const rowNums = [];
  dates.forEach((r, i) => {
    const dk = dateCellToKey_(r[0]);
    if (dk && dk >= fromKey && dk <= toKey) rowNums.push(i + 2);
  });
  return readAttendanceRowsByRowNumbers_(sh, rowNums).map(r => r.values);
}

function getAttendanceValuesForUserMonth_(email, monthKey) {
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
  const last = sh.getLastRow();
  if (last < 2) return [];
  email = normalizeEmail_(email);

  // Read only Tarikh + Emel across the whole sheet, then fetch full 22-column
  // data only for contiguous blocks belonging to the requested month.
  const index = sh.getRange(2, 1, last - 1, 2).getValues();
  const monthRows = [];
  index.forEach((v, i) => {
    const dk = dateCellToKey_(v[0]);
    if (dk && dk.slice(0, 7) === monthKey) monthRows.push(i + 2);
  });
  return readAttendanceRowsByRowNumbers_(sh, monthRows)
    .filter(r => { const dk = dateCellToKey_(r.values[0]); return normalizeEmail_(r.values[1]) === email && dk >= getSystemStartDate_() && dk.slice(0,7) === monthKey; })
    .map(r => r.values);
}

function findAttendanceRecord_(dateKey, email) {
  email = normalizeEmail_(email);
  const matches = getAttendanceByDate_(dateKey).filter(r => r.email === email);
  if (!matches.length) return null;
  if (matches.length === 1) return matches[0];

  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
  const merged = mergeAttendanceDuplicateGroup_(sh, matches);
  audit_('AUTO_GABUNG_DUPLIKAT', `${email} ${dateKey}`, `${matches.length} rekod digabungkan menjadi 1`);
  return merged;
}

function getAttendanceByDate_(dateKey) {
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const dates = sh.getRange(2, 1, last - 1, 1).getValues();
  const rowNums = [];
  dates.forEach((r, i) => { if (dateCellToKey_(r[0]) === dateKey) rowNums.push(i + 2); });
  return readAttendanceRowsByRowNumbers_(sh, rowNums)
    .filter(r => dateCellToKey_(r.values[0]) === dateKey);
}

/**
 * Imbas helaian KEHADIRAN dan gabungkan baris yang mempunyai Tarikh + Emel yang sama.
 * options: {dateKey, email, monthKey, audit}
 */
function repairAttendanceDuplicates_(options) {
  options = options || {};
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
  if (sh.getLastRow() < 3) return {groupsMerged: 0, rowsRemoved: 0};

  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, EK.ATT_HEADERS.length).getValues();
  const groups = {};
  const emailFilter = normalizeEmail_(options.email || '');
  const dateFilter = String(options.dateKey || '').trim();
  const monthFilter = String(options.monthKey || '').trim();

  rows.forEach((v, i) => {
    const dateKey = dateCellToKey_(v[0]);
    const email = normalizeEmail_(v[1]);
    if (!dateKey || !email) return;
    if (emailFilter && email !== emailFilter) return;
    if (dateFilter && dateKey !== dateFilter) return;
    if (monthFilter && dateKey.slice(0, 7) !== monthFilter) return;

    const key = `${dateKey}|${email}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push({row: i + 2, values: v, email});
  });

  const duplicateGroups = Object.keys(groups)
    .map(k => groups[k])
    .filter(g => g.length > 1);

  if (!duplicateGroups.length) return {groupsMerged: 0, rowsRemoved: 0};

  const rowsToDelete = [];
  duplicateGroups.forEach(group => {
    group.sort((a, b) => a.row - b.row);
    const mergedValues = buildMergedAttendanceValues_(group);
    const targetRow = group[0].row;
    sh.getRange(targetRow, 1, 1, EK.ATT_HEADERS.length).setValues([mergedValues]);
    group.slice(1).forEach(item => rowsToDelete.push(item.row));
  });

  rowsToDelete.sort((a, b) => b - a).forEach(row => sh.deleteRow(row));
  SpreadsheetApp.flush();

  const result = {
    groupsMerged: duplicateGroups.length,
    rowsRemoved: rowsToDelete.length
  };
  if (options.audit !== false) {
    audit_('GABUNG_DUPLIKAT_KEHADIRAN', EK.SHEETS.ATTENDANCE, `Kumpulan=${result.groupsMerged}; baris dibuang=${result.rowsRemoved}`);
  }
  return result;
}

function mergeAttendanceDuplicateGroup_(sh, group) {
  group = group.slice().sort((a, b) => a.row - b.row);
  const targetRow = group[0].row;
  const mergedValues = buildMergedAttendanceValues_(group);
  sh.getRange(targetRow, 1, 1, EK.ATT_HEADERS.length).setValues([mergedValues]);

  group.slice(1)
    .map(x => x.row)
    .sort((a, b) => b - a)
    .forEach(row => sh.deleteRow(row));

  SpreadsheetApp.flush();
  return {
    row: targetRow,
    values: sh.getRange(targetRow, 1, 1, EK.ATT_HEADERS.length).getValues()[0],
    email: normalizeEmail_(mergedValues[1])
  };
}

/**
 * Polisi merge:
 * 1) Pembetulan ADMIN terkini diberi keutamaan.
 * 2) Jika semuanya GPS, masa MASUK paling awal dan BALIK paling akhir dikekalkan.
 * 3) Metadata lokasi ikut punch yang dipilih.
 */
function buildMergedAttendanceValues_(group) {
  const rows = group.map(x => x.values);
  const first = rows[0];
  const last = rows[rows.length - 1];
  const email = normalizeEmail_(rows.map(v => v[1]).find(Boolean) || '');
  const dateKey = dateCellToKey_(rows.map(v => v[0]).find(Boolean) || '');
  const user = email ? getUserByEmail_(email, false) : null;

  const adminRows = group.filter(x =>
    String(x.values[15] || '').toUpperCase() === 'ADMIN' ||
    String(x.values[16] || '').trim() ||
    String(x.values[17] || '').trim()
  );

  let merged;
  if (adminRows.length) {
    const authoritative = adminRows.slice().sort((a, b) => {
      const am = dateValueMs_(a.values[18]);
      const bm = dateValueMs_(b.values[18]);
      return (am - bm) || (a.row - b.row);
    }).pop();
    merged = authoritative.values.slice();
  } else {
    merged = last.slice();

    const inCandidates = group.filter(x => x.values[4]);
    if (inCandidates.length) {
      const chosenIn = inCandidates.slice().sort((a, b) =>
        (dateValueMs_(a.values[4]) - dateValueMs_(b.values[4])) || (a.row - b.row)
      )[0];
      for (let c = 4; c <= 8; c++) merged[c] = chosenIn.values[c];
      merged[14] = String(chosenIn.values[14] || merged[14] || 'HADIR');
    }

    const outCandidates = group.filter(x => x.values[9]);
    if (outCandidates.length) {
      const chosenOut = outCandidates.slice().sort((a, b) =>
        (dateValueMs_(b.values[9]) - dateValueMs_(a.values[9])) || (b.row - a.row)
      )[0];
      for (let c = 9; c <= 13; c++) merged[c] = chosenOut.values[c];
    }

    const in2Candidates = group.filter(x => x.values[22]);
    if (in2Candidates.length) {
      const chosenIn2 = in2Candidates.slice().sort((a,b) => (dateValueMs_(a.values[22]) - dateValueMs_(b.values[22])) || (a.row - b.row))[0];
      for (let c = 22; c <= 26; c++) merged[c] = chosenIn2.values[c];
    }
    const out2Candidates = group.filter(x => x.values[27]);
    if (out2Candidates.length) {
      const chosenOut2 = out2Candidates.slice().sort((a,b) => (dateValueMs_(b.values[27]) - dateValueMs_(a.values[27])) || (b.row - a.row))[0];
      for (let c = 27; c <= 31; c++) merged[c] = chosenOut2.values[c];
    }

    const latestSource = rows.slice().reverse().map(v => String(v[15] || '').trim()).find(Boolean);
    merged[15] = latestSource || 'GPS';
    merged[16] = rows.slice().reverse().map(v => String(v[16] || '').trim()).find(Boolean) || '';
    merged[17] = rows.slice().reverse().map(v => String(v[17] || '').trim()).find(Boolean) || '';
  }

  while (merged.length < EK.ATT_HEADERS.length) merged.push('');

  const inIpCandidate = group
    .filter(x => x.values[4] && String(x.values[19] || '').trim())
    .sort((a,b) => (dateValueMs_(a.values[4]) - dateValueMs_(b.values[4])) || (a.row - b.row))[0];
  const outIpCandidate = group
    .filter(x => x.values[9] && String(x.values[20] || '').trim())
    .sort((a,b) => (dateValueMs_(b.values[9]) - dateValueMs_(a.values[9])) || (b.row - a.row))[0];
  if (inIpCandidate) merged[19] = String(inIpCandidate.values[19] || '');
  if (outIpCandidate) merged[20] = String(outIpCandidate.values[20] || '');
  merged[21] = rows.slice().reverse().map(v => String(v[21] || '').trim()).find(Boolean) || String(merged[21] || '');
  const in2IpCandidate = group.filter(x => x.values[22] && String(x.values[32] || '').trim()).sort((a,b)=>(dateValueMs_(a.values[22])-dateValueMs_(b.values[22]))||(a.row-b.row))[0];
  const out2IpCandidate = group.filter(x => x.values[27] && String(x.values[33] || '').trim()).sort((a,b)=>(dateValueMs_(b.values[27])-dateValueMs_(a.values[27]))||(b.row-a.row))[0];
  if (in2IpCandidate) merged[32] = String(in2IpCandidate.values[32] || '');
  if (out2IpCandidate) merged[33] = String(out2IpCandidate.values[33] || '');
  const mergedFlags = []; rows.forEach(v => splitAttendanceFlags_(v[34]).forEach(f => { if (!mergedFlags.includes(f)) mergedFlags.push(f); }));
  merged[34] = joinAttendanceFlags_(mergedFlags);
  if (merged[4] && String(merged[14] || '').toUpperCase() !== 'TIDAK HADIR') merged[14] = attendanceStatusFromFlags_(mergedFlags);

  merged[0] = dateKey;
  merged[1] = email;
  merged[2] = user ? user.name : (rows.slice().reverse().map(v => String(v[2] || '').trim()).find(Boolean) || String(first[2] || ''));
  merged[3] = user ? user.category : (rows.slice().reverse().map(v => String(v[3] || '').trim()).find(Boolean) || String(first[3] || ''));

  const latestUpdated = group.slice().sort((a, b) =>
    (dateValueMs_(a.values[18]) - dateValueMs_(b.values[18])) || (a.row - b.row)
  ).pop();
  merged[18] = latestUpdated && latestUpdated.values[18] ? latestUpdated.values[18] : new Date();

  if (!merged[4] && !String(merged[14] || '').trim()) {
    const presenceReq = email && dateKey ? findRelevantPresenceForDate_(email, dateKey) : null;
    if (presenceReq) {
      merged[14] = 'BELUM HADIR';
      merged[15] = 'KEBERADAAN';
      merged[17] = mergeAttendanceReason_(merged[17], presenceRequestReason_(presenceReq, ''));
    } else {
      merged[14] = 'TIDAK HADIR';
    }
  }
  return merged;
}

function dateValueMs_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) return value.getTime();
  if (value === '' || value == null) return 0;
  const d = new Date(value);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function publicAttendance_(rec, schedule) {
  if (!rec) return null;
  const v = padAttendanceValues_(rec.values);
  return {
    date: dateCellToKey_(v[0]),
    inTime: v[4] ? formatTime_(v[4]) : '',
    outTime: v[9] ? formatTime_(v[9]) : '',
    inTime2: v[22] ? formatTime_(v[22]) : '',
    outTime2: v[27] ? formatTime_(v[27]) : '',
    status: String(v[14] || ''),
    statusFlags: splitAttendanceFlags_(v[34]),
    inDistanceM: v[7] === '' ? null : Number(v[7]),
    outDistanceM: v[12] === '' ? null : Number(v[12]),
    inDistanceM2: v[25] === '' ? null : Number(v[25]),
    outDistanceM2: v[30] === '' ? null : Number(v[30]),
    source: String(v[15] || ''),
    inIp: String(v[19] || ''),
    outIp: String(v[20] || ''),
    inIp2: String(v[32] || ''),
    outIp2: String(v[33] || ''),
    ipCheck: String(v[21] || ''),
    nextRecord: nextAttendanceStep_(v, schedule)
  };
}

function padAttendanceValues_(values) {
  const out = (values || []).slice();
  while (out.length < EK.ATT_HEADERS.length) out.push('');
  return out;
}

function nextAttendanceStep_(values, schedule) {
  const v = padAttendanceValues_(values);
  if (!v[4]) return {type:'IN', session:1, complete:false};
  if (!v[9]) return {type:'OUT', session:1, complete:false};
  // Sesi 2 hanya diwajibkan apabila sekurang-kurangnya satu waktu Sesi 2
  // ditetapkan. Ini membolehkan sekolah menggunakan sama ada 2 atau 4 rakaman
  // sehari tanpa mengubah struktur Kad Perakam Waktu.
  const hasSession2 = !!(schedule && (schedule.s2In || schedule.s2Out));
  if (!hasSession2) return {type:'', session:1, complete:true};
  if (!v[22]) return {type:'IN', session:2, complete:false};
  if (!v[27]) return {type:'OUT', session:2, complete:false};
  return {type:'', session:2, complete:true};
}

function splitAttendanceFlags_(value) {
  return [...new Set(String(value || '').toUpperCase().split(/[|,;/]+/).map(x => x.trim()).filter(Boolean))];
}
function joinAttendanceFlags_(flags) { return [...new Set((flags || []).filter(Boolean))].join('|'); }
function attendanceStatusFromFlags_(flags) {
  flags = Array.isArray(flags) ? flags : splitAttendanceFlags_(flags);
  const hasLate = flags.includes('LEWAT');
  const hasEarly = flags.includes('BALIK AWAL');
  if (hasLate && hasEarly) return 'LEWAT / BALIK AWAL';
  if (hasLate) return 'LEWAT';
  if (hasEarly) return 'BALIK AWAL';
  return 'HADIR';
}

// ---------- Client IP / login security ----------

function normalizeClientInfo_(info) {
  info = info && typeof info === 'object' ? info : {};
  const ip = normalizeIp_(info.ip);
  return {
    ip,
    userAgent: String(info.userAgent || '').trim().slice(0, 500),
    platform: String(info.platform || '').trim().slice(0, 120),
    timezone: String(info.timezone || '').trim().slice(0, 100),
    language: String(info.language || '').trim().slice(0, 60)
  };
}

function normalizeIp_(value) {
  const ip = String(value || '').trim();
  if (!ip || ip.length > 64) return '';
  if (/^[0-9a-fA-F:.]+$/.test(ip)) return ip.toLowerCase();
  return '';
}

function recordLoginEventSafe_(user, clientInfo, status, detail) {
  try {
    const ci = normalizeClientInfo_(clientInfo);
    const tracking = String(getSettings_().IP_TRACKING_ENABLED || 'TRUE').toUpperCase() !== 'FALSE';
    const sh = getSheetOrThrow_(EK.SHEETS.LOGIN_LOG);
    const device = [
      ci.platform ? `Platform=${ci.platform}` : '',
      ci.timezone ? `TZ=${ci.timezone}` : '',
      ci.language ? `Lang=${ci.language}` : '',
      ci.userAgent || ''
    ].filter(Boolean).join(' | ');
    sh.appendRow([
      new Date(),
      normalizeEmail_(user && user.email),
      String(user && user.name || ''),
      String(user && user.category || ''),
      tracking ? (ci.ip || '') : '',
      device,
      String(status || ''),
      String(detail || '')
    ]);
  } catch (e) {}
}

function hasUserEverLoggedIn_(email) {
  email = normalizeEmail_(email);
  if (!email) return false;

  // Sumber utama: LOG_LOGIN.
  try {
    const sh = getSheetOrThrow_(EK.SHEETS.LOGIN_LOG);
    if (sh.getLastRow() >= 2) {
      const rows = sh.getRange(2, 1, sh.getLastRow() - 1, EK.LOGIN_HEADERS.length).getValues();
      const success = new Set(['BERJAYA', 'LOGIN_PERTAMA_BERJAYA', 'PIN_RESET_BERJAYA', 'PASSWORD_RESET_BERJAYA']);
      if (rows.some(v => normalizeEmail_(v[1]) === email && success.has(String(v[6] || '').trim().toUpperCase()))) {
        return true;
      }
    }
  } catch (e) {}

  // Fallback untuk rekod lama sebelum LOG_LOGIN diperkenalkan.
  try {
    const sh = getSheetOrThrow_(EK.SHEETS.AUDIT);
    if (sh.getLastRow() >= 2) {
      const rows = sh.getRange(2, 1, sh.getLastRow() - 1, EK.AUDIT_HEADERS.length).getValues();
      const successActions = new Set([
        'LOGIN_APLIKASI',
        'TETAP_PIN_PERTAMA',
        'TUKAR_PIN_SELEPAS_RESET',
        'TUKAR_PASSWORD_PERTAMA',
        'TUKAR_PASSWORD_SELEPAS_RESET'
      ]);
      if (rows.some(v => successActions.has(String(v[2] || '').trim().toUpperCase()) && normalizeEmail_(v[3]) === email)) {
        return true;
      }
    }
  } catch (e) {}

  return false;
}

function normalizeIpPunchPolicy_(value) {
  const p = String(value || 'WARN').trim().toUpperCase();
  return ['OFF', 'WARN', 'BLOCK'].includes(p) ? p : 'WARN';
}

function hourBucket_(dateValue) {
  return Utilities.formatDate(new Date(dateValue), tz_(), 'yyyy-MM-dd HH');
}

function evaluatePunchIp_(user, type, ip, now, settings, isTestMode, preloadedTodayRows) {
  const tracking = String(settings.IP_TRACKING_ENABLED || 'TRUE').toUpperCase() !== 'FALSE';
  const policy = normalizeIpPunchPolicy_(settings.IP_PUNCH_POLICY || 'WARN');

  if (!tracking) return {note:'IP tracking tidak aktif', warning:''};
  if (!ip) {
    const note = 'IP awam tidak dapat dikesan';
    audit_('IP_PUNCH_TIDAK_DIKESAN', user.email, `${type}; ${hourBucket_(now)}`, user.email);
    return {note, warning: note};
  }
  if (policy === 'OFF' || isTestMode) {
    return {note: isTestMode ? `IP ${ip} direkodkan — semakan pertindihan diabaikan dalam MOD TEST` : `IP ${ip} direkodkan`, warning:''};
  }

  const bucket = hourBucket_(now);
  // Only today's rows can match the current hour bucket. Avoid scanning the
  // entire historical attendance table on every punch.
  const rows = Array.isArray(preloadedTodayRows)
    ? preloadedTodayRows.map(r => r.values || r)
    : getAttendanceByDate_(todayKey_()).map(r => r.values);
  if (!rows.length) return {note:`IP ${ip} — unik dalam jam ini`, warning:''};
  const conflicts = [];

  rows.forEach(v => {
    const otherEmail = normalizeEmail_(v[1]);
    if (!otherEmail || otherEmail === user.email) return;

    if (v[4] && normalizeIp_(v[19]) === ip && hourBucket_(v[4]) === bucket) {
      conflicts.push({email:otherEmail, name:String(v[2] || ''), kind:'MASUK', time:formatTime_(v[4])});
    }
    if (v[9] && normalizeIp_(v[20]) === ip && hourBucket_(v[9]) === bucket) {
      conflicts.push({email:otherEmail, name:String(v[2] || ''), kind:'BALIK', time:formatTime_(v[9])});
    }
    if (v[22] && normalizeIp_(v[32]) === ip && hourBucket_(v[22]) === bucket) {
      conflicts.push({email:otherEmail, name:String(v[2] || ''), kind:'MASUK 2', time:formatTime_(v[22])});
    }
    if (v[27] && normalizeIp_(v[33]) === ip && hourBucket_(v[27]) === bucket) {
      conflicts.push({email:otherEmail, name:String(v[2] || ''), kind:'KELUAR 2', time:formatTime_(v[27])});
    }
  });

  if (!conflicts.length) return {note:`IP ${ip} — unik dalam jam ini`, warning:''};

  const uniquePeople = [...new Set(conflicts.map(c => c.email))];
  const details = conflicts.slice(0, 5).map(c => `${c.name || c.email} (${c.kind} ${c.time})`).join(', ');
  const hour = bucket.slice(-2);
  const note = `IP SAMA: ${ip} digunakan ${uniquePeople.length} akaun lain dalam jam ${hour}:00–${hour}:59`;
  audit_('IP_PUNCH_BERTINDIH', user.email, `${note}; ${details}`, user.email);

  if (policy === 'BLOCK') {
    throw new Error('Rakaman waktu ditolak: IP awam yang sama telah digunakan oleh akaun lain dalam jam yang sama. Jika anda menggunakan Wi-Fi sekolah/shared network, minta Pentadbir Sistem tukar Polisi IP kepada AMARAN.');
  }

  return {note, warning:`${note}. Rekod waktu diterima kerana Polisi IP = AMARAN.`};
}

function mergeIpCheckNote_(existing, next) {
  const a = String(existing || '').trim();
  const b = String(next || '').trim();
  if (!a) return b;
  if (!b || a === b) return a;
  return `${a} | ${b}`.slice(0, 1000);
}

// ---------- Location ----------

function validateAndMeasureLocation_(location, settings) {
  if (!location) throw new Error('Lokasi tidak diterima. Sila benarkan akses lokasi pada pelayar.');
  const lat = Number(location.lat);
  const lng = Number(location.lng);
  const accuracy = Number(location.accuracy);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('Koordinat GPS tidak sah.');
  if (!Number.isFinite(accuracy) || accuracy < 0) throw new Error('Ketepatan GPS tidak sah.');

  const maxAccuracy = Number(settings.MAX_GPS_ACCURACY_M);
  if (accuracy > maxAccuracy) {
    throw new Error(`Isyarat GPS terlalu lemah (±${Math.round(accuracy)}m). Had sistem ialah ±${Math.round(maxAccuracy)}m. Cuba di kawasan terbuka dan tekan semula.`);
  }

  const schoolLat = Number(settings.SCHOOL_LAT);
  const schoolLng = Number(settings.SCHOOL_LNG);
  const distance = Math.round(haversineMeters_(lat, lng, schoolLat, schoolLng));
  const radius = Number(settings.RADIUS_M);
  if (distance > radius) {
    throw new Error(`Anda berada kira-kira ${distance}m dari lokasi yang ditetapkan. Rekod waktu hanya dibenarkan dalam radius ${radius}m.`);
  }
  return {lat, lng, accuracyM: Math.round(accuracy), distanceM: distance};
}

function haversineMeters_(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = toRad_(lat2 - lat1);
  const dLon = toRad_(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad_(lat1)) * Math.cos(toRad_(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad_(deg) { return deg * Math.PI / 180; }

function validateLocationSettings_(s) {
  validateLatLng_(s.SCHOOL_LAT, s.SCHOOL_LNG);
  if (!(Number(s.RADIUS_M) > 0)) throw new Error('RADIUS_M belum ditetapkan dengan betul.');
}

function validateLatLng_(lat, lng) {
  const a = Number(lat), b = Number(lng);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a < -90 || a > 90 || b < -180 || b > 180) {
    throw new Error('Koordinat sekolah belum lengkap / tidak sah. Isi SCHOOL_LAT dan SCHOOL_LNG di TETAPAN.');
  }
}

// ---------- System date boundary ----------

function normalizeSystemStartDate_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) return Utilities.formatDate(value, tz_(), 'yyyy-MM-dd');
  const raw = String(value == null ? '' : value).trim();
  if (!raw) return EK.DEFAULT_SETTINGS.SYSTEM_START_DATE;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return validateDateKey_(raw);
  const dmy = raw.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if (dmy) return validateDateKey_(`${dmy[3]}-${String(dmy[2]).padStart(2,'0')}-${String(dmy[1]).padStart(2,'0')}`);
  throw new Error('SYSTEM_START_DATE di sheet TETAPAN tidak sah. Gunakan format YYYY-MM-DD, contoh 2026-09-01.');
}

function getSystemStartDate_(settings) {
  settings = settings || getSettings_();
  return normalizeSystemStartDate_(settings.SYSTEM_START_DATE || EK.DEFAULT_SETTINGS.SYSTEM_START_DATE);
}

function isOnOrAfterSystemStart_(dateKey, settings) {
  dateKey = validateDateKey_(dateKey);
  return dateKey >= getSystemStartDate_(settings);
}

function clampToSystemStart_(dateKey, settings) {
  dateKey = validateDateKey_(dateKey);
  const start = getSystemStartDate_(settings);
  return dateKey < start ? start : dateKey;
}

function assertSystemDate_(dateKey, settings, label) {
  dateKey = validateDateKey_(dateKey);
  const start = getSystemStartDate_(settings);
  if (dateKey < start) throw new Error(`${label || 'Tarikh'} sebelum tarikh mula sistem (${start}) dan tidak diambil kira.`);
  return dateKey;
}

// ---------- Settings ----------

function getSettings_() {
  if (EK_RUNTIME_SETTINGS_) return EK_RUNTIME_SETTINGS_;
  const cached = cacheGetJson_(EK_PERF.SETTINGS_CACHE_KEY);
  if (cached && typeof cached === 'object') {
    EK_RUNTIME_SETTINGS_ = Object.assign({}, EK.DEFAULT_SETTINGS, cached);
    return EK_RUNTIME_SETTINGS_;
  }

  const sh = getSheetOrThrow_(EK.SHEETS.SETTINGS);
  const result = Object.assign({}, EK.DEFAULT_SETTINGS);
  let hasSystemStartDate = false;
  if (sh.getLastRow() >= 2) {
    const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getDisplayValues();
    rows.forEach(r => {
      const key = String(r[0] || '').trim();
      if (key) {
        result[key] = String(r[1] == null ? '' : r[1]).trim();
        if (key === 'SYSTEM_START_DATE') hasSystemStartDate = true;
      }
    });
  }
  // Self-heal untuk deployment sedia ada: tambah satu baris yang boleh terus
  // diedit di Google Sheet walaupun setupSystem() belum dijalankan semula.
  if (!hasSystemStartDate) {
    sh.appendRow(['SYSTEM_START_DATE', EK.DEFAULT_SETTINGS.SYSTEM_START_DATE, 'Tarikh mula rasmi e-Keberadaan. Semua tarikh sebelum ini diabaikan. Ubah dalam format YYYY-MM-DD jika mahu memasukkan sejarah lebih awal.']);
    const row = sh.getLastRow();
    sh.getRange(row, 2).setNumberFormat('@');
    sh.getRange(row, 1, 1, 3).setFontWeight('bold');
    result.SYSTEM_START_DATE = EK.DEFAULT_SETTINGS.SYSTEM_START_DATE;
  }
  result.SYSTEM_START_DATE = normalizeSystemStartDate_(result.SYSTEM_START_DATE);
  EK_RUNTIME_SETTINGS_ = result;
  cachePutJson_(EK_PERF.SETTINGS_CACHE_KEY, result, EK_PERF.SETTINGS_TTL_SEC);
  return EK_RUNTIME_SETTINGS_;
}

function publicSettings_(s) {
  return {
    schoolName: s.SCHOOL_NAME,
    schoolLat: s.SCHOOL_LAT,
    schoolLng: s.SCHOOL_LNG,
    radiusM: Number(s.RADIUS_M),
    maxGpsAccuracyM: Number(s.MAX_GPS_ACCURACY_M),
    defaultLateAfter: s.DEFAULT_LATE_AFTER,
    defaultMaxPunchIn: s.DEFAULT_MAX_PUNCH_IN,
    defaultPunchOutFrom: s.DEFAULT_PUNCH_OUT_FROM,
    defaultS1In: s.DEFAULT_S1_IN || s.DEFAULT_LATE_AFTER,
    defaultS1Out: s.DEFAULT_S1_OUT || s.DEFAULT_PUNCH_OUT_FROM,
    defaultS2In: s.DEFAULT_S2_IN || '',
    defaultS2Out: s.DEFAULT_S2_OUT || '',
    absentAfter: s.ABSENT_AFTER,
    punchReminderEnabled: String(s.PUNCH_REMINDER_ENABLED || 'TRUE').toUpperCase() !== 'FALSE' ? 'TRUE' : 'FALSE',
    punchReminderTime: s.PUNCH_REMINDER_TIME || '09:00',
    workingDays: s.WORKING_DAYS || EK.DEFAULT_SETTINGS.WORKING_DAYS,
    ipTrackingEnabled: String(s.IP_TRACKING_ENABLED || 'TRUE').toUpperCase() !== 'FALSE' ? 'TRUE' : 'FALSE',
    ipPunchPolicy: normalizeIpPunchPolicy_(s.IP_PUNCH_POLICY || 'WARN'),
    systemMode: String(s.SYSTEM_MODE || 'REAL').toUpperCase(),
    systemStartDate: getSystemStartDate_(s),
    profileRootFolderId: s.PROFILE_ROOT_FOLDER_ID || ''
  };
}

function findSettingRow_(sh, key) {
  if (sh.getLastRow() < 2) return null;
  const keys = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getDisplayValues().flat();
  const i = keys.findIndex(k => String(k).trim() === key);
  return i < 0 ? null : i + 2;
}

// ---------- Setup / sheet styling ----------

function setupUsersSheet_(ss) {
  const sh = ss.getSheetByName(EK.SHEETS.USERS) || ss.insertSheet(EK.SHEETS.USERS);
  ensureHeaders_(sh, EK.USER_HEADERS);
  sh.setFrozenRows(1);
  sh.getRange('A2:A').insertCheckboxes();
  sh.getRange('E2:E').insertCheckboxes();
  sh.getRange('L2:L').insertCheckboxes();
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(EK.CATEGORIES, true).setAllowInvalid(false).build();
  sh.getRange('D2:D').setDataValidation(rule);
  sh.getRange('F2:H').setNumberFormat('@');
  sh.getRange('U2:X').setNumberFormat('@');
  sh.getRange('M2:N').setNumberFormat('0');
  sh.getRange('O2:P').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.getRange('R2:R').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  styleHeader_(sh, EK.USER_HEADERS.length);
  sh.setColumnWidths(1, EK.USER_HEADERS.length, 120);
  sh.setColumnWidth(2, 220);
  sh.setColumnWidth(3, 240);
  sh.setColumnWidth(9, 260);
  sh.setColumnWidth(20, 220);
  sh.setColumnWidths(21, 4, 130);
  try { sh.hideColumns(10, 2); sh.hideColumns(19, 1); } catch (e) {}

  if (sh.getLastRow() >= 2) {
    const rows = sh.getRange(2, 1, sh.getLastRow() - 1, EK.USER_HEADERS.length).getValues();
    rows.forEach((v, i) => {
      const row = i + 2;
      if (String(v[3] || '').trim() === 'Pentadbir') sh.getRange(row, 4).setValue('Pengurusan');
      if (!Number(v[12]) || Number(v[12]) < 1) sh.getRange(row, 13).setValue(1);
      if (v[13] === '' || v[13] == null) sh.getRange(row, 14).setValue(0);
      // Migrate legacy Sesi 1 values only when the new columns are empty.
      if (!String(v[20] || '').trim() && String(v[5] || '').trim()) sh.getRange(row, 21).setValue(v[5]);
      if (!String(v[21] || '').trim() && String(v[7] || '').trim()) sh.getRange(row, 22).setValue(v[7]);
    });
  }
}

function setupSettingsSheet_(ss) {
  const sh = ss.getSheetByName(EK.SHEETS.SETTINGS) || ss.insertSheet(EK.SHEETS.SETTINGS);
  ensureHeaders_(sh, ['Kunci', 'Nilai', 'Keterangan']);
  const descriptions = {
    SCHOOL_NAME: 'Nama yang dipaparkan dalam aplikasi',
    SCHOOL_LAT: 'Latitude pusat kawasan rekod waktu (contoh 5.646123)',
    SCHOOL_LNG: 'Longitude pusat kawasan rekod waktu (contoh 100.489123)',
    RADIUS_M: 'Radius dibenarkan dalam meter',
    MAX_GPS_ACCURACY_M: 'Tolak bacaan GPS yang lebih lemah daripada nilai ini',
    DEFAULT_LATE_AFTER: 'Legacy: digunakan sebagai fallback Sesi 1 Masuk',
    DEFAULT_MAX_PUNCH_IN: 'Legacy sahaja; rekod masuk tidak lagi ditutup mengikut masa',
    DEFAULT_PUNCH_OUT_FROM: 'Legacy: digunakan sebagai fallback Sesi 1 Keluar',
    DEFAULT_S1_IN: 'Waktu rujukan Sesi 1 Masuk; selepas ini status LEWAT',
    DEFAULT_S1_OUT: 'Waktu rujukan Sesi 1 Keluar; sebelum ini status BALIK AWAL',
    DEFAULT_S2_IN: 'Waktu rujukan Sesi 2 Masuk (opsyenal)',
    DEFAULT_S2_OUT: 'Waktu rujukan Sesi 2 Keluar (opsyenal)',
    ABSENT_AFTER: 'Tanpa rekod waktu masuk selepas waktu ini dikira TIDAK HADIR (HH:mm)',
    PUNCH_REMINDER_ENABLED: 'TRUE = emel peringatan Rekod Waktu Masuk dihantar setiap hari bekerja jika belum merekod waktu',
    PUNCH_REMINDER_TIME: 'Waktu emel peringatan Rekod Waktu Masuk (HH:mm). Trigger Apps Script berjalan sekitar jam ini.',
    WORKING_DAYS: 'Hari bekerja: SUN,MON,TUE,WED,THU,FRI,SAT. Default Kedah: SUN,MON,TUE,WED,THU',
    IP_TRACKING_ENABLED: 'TRUE = rekod IP awam ketika login dan rakam waktu',
    IP_PUNCH_POLICY: 'WARN = rekod/amaran jika IP sama digunakan akaun lain dalam jam sama; BLOCK = tolak rekod waktu; OFF = tiada semakan pertindihan',
    SYSTEM_MODE: 'REAL = masa/lokasi sebenar; TEST = abaikan semakan lokasi dan status waktu',
    SYSTEM_START_DATE: 'Tarikh mula rasmi e-Keberadaan. Semua tarikh sebelum ini diabaikan oleh laporan, Punch Card dan pengiraan Tidak Hadir. Ubah nilai ini jika mahu memasukkan sejarah lebih awal (format YYYY-MM-DD).',
    PROFILE_ROOT_FOLDER_ID: 'Folder induk Google Drive yang mengandungi 01 - Pengurusan, 02 - Guru dan 03 - Anggota Kumpulan Pelaksana'
  };
  Object.keys(EK.DEFAULT_SETTINGS).forEach(key => {
    if (!findSettingRow_(sh, key)) sh.appendRow([key, EK.DEFAULT_SETTINGS[key], descriptions[key] || '']);
  });
  styleHeader_(sh, 3);
  sh.setFrozenRows(1);
  sh.setColumnWidth(1, 240); sh.setColumnWidth(2, 200); sh.setColumnWidth(3, 520);
  const startRow = findSettingRow_(sh, 'SYSTEM_START_DATE');
  if (startRow) {
    sh.getRange(startRow, 2).setNumberFormat('@');
    sh.getRange(startRow, 1, 1, 3).setFontWeight('bold');
  }
}

function setupAttendanceSheet_(ss) {
  const sh = ss.getSheetByName(EK.SHEETS.ATTENDANCE) || ss.insertSheet(EK.SHEETS.ATTENDANCE);
  ensureHeaders_(sh, EK.ATT_HEADERS);
  styleHeader_(sh, EK.ATT_HEADERS.length);
  sh.setFrozenRows(1);
  sh.getRange('A:A').setNumberFormat('yyyy-MM-dd');
  ['E:E','J:J','S:S','W:W','AB:AB'].forEach(r => sh.getRange(r).setNumberFormat('dd/MM/yyyy HH:mm:ss'));
  sh.setColumnWidth(2, 230); sh.setColumnWidth(3, 220); sh.setColumnWidth(18, 300);
  sh.setColumnWidth(20, 170); sh.setColumnWidth(21, 170); sh.setColumnWidth(22, 360);
  sh.setColumnWidth(35, 180);
}

function setupAuditSheet_(ss) {
  const sh = ss.getSheetByName(EK.SHEETS.AUDIT) || ss.insertSheet(EK.SHEETS.AUDIT);
  ensureHeaders_(sh, EK.AUDIT_HEADERS);
  styleHeader_(sh, EK.AUDIT_HEADERS.length);
  sh.setFrozenRows(1);
  sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.setColumnWidth(2, 230); sh.setColumnWidth(5, 500);
}

function setupReportSheet_(ss) {
  const sh = ss.getSheetByName(EK.SHEETS.REPORT) || ss.insertSheet(EK.SHEETS.REPORT);
  sh.setFrozenRows(5);
}

function setupAbsenceSheet_(ss) {
  const sh = ss.getSheetByName(EK.SHEETS.ABSENCE) || ss.insertSheet(EK.SHEETS.ABSENCE);
  ensureHeaders_(sh, EK.ABSENCE_HEADERS);
  styleHeader_(sh, EK.ABSENCE_HEADERS.length);
  sh.setFrozenRows(1);
  sh.getRange('B:B').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.getRange('G:H').setNumberFormat('yyyy-MM-dd');
  sh.getRange('L:L').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.getRange('N:N').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.getRange('P:Q').setNumberFormat('@');
  sh.setColumnWidth(1, 160); sh.setColumnWidth(3, 220); sh.setColumnWidth(4, 220);
  sh.setColumnWidth(6, 280); sh.setColumnWidth(9, 320); sh.setColumnWidth(13, 320);
  sh.setColumnWidth(15, 140); sh.setColumnWidths(16, 2, 120); sh.setColumnWidth(18, 220);
  // Legacy rows are all Tidak Hadir until explicitly marked otherwise.
  if (sh.getLastRow() >= 2) {
    const modes = sh.getRange(2,15,sh.getLastRow()-1,1).getValues();
    let changed = false;
    modes.forEach(r => { if (!String(r[0] || '').trim()) { r[0] = 'TIDAK_HADIR'; changed = true; } });
    if (changed) sh.getRange(2,15,modes.length,1).setValues(modes);
  }
}

function setupTimeReviewSheet_(ss) {
  const sh = ss.getSheetByName(EK.SHEETS.TIME_REVIEW) || ss.insertSheet(EK.SHEETS.TIME_REVIEW);
  ensureHeaders_(sh, EK.TIME_REVIEW_HEADERS);
  styleHeader_(sh, EK.TIME_REVIEW_HEADERS.length);
  sh.setFrozenRows(1);
  sh.getRange('B:B').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.getRange('C:C').setNumberFormat('yyyy-MM-dd');
  // WaktuRekod / WaktuRujukan sentiasa dipaparkan sebagai waktu Malaysia, bukan Date-string zon lain.
  sh.getRange('J:K').setNumberFormat('HH:mm');
  sh.getRange('O:O').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.setColumnWidth(1,180); sh.setColumnWidth(4,230); sh.setColumnWidth(5,220);
  sh.setColumnWidth(6,210); sh.setColumnWidth(8,150); sh.setColumnWidth(12,190); sh.setColumnWidth(16,320);
}

function setupLoginLogSheet_(ss) {
  const sh = ss.getSheetByName(EK.SHEETS.LOGIN_LOG) || ss.insertSheet(EK.SHEETS.LOGIN_LOG);
  ensureHeaders_(sh, EK.LOGIN_HEADERS);
  styleHeader_(sh, EK.LOGIN_HEADERS.length);
  sh.setFrozenRows(1);
  sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.setColumnWidth(1, 180);
  sh.setColumnWidth(2, 230);
  sh.setColumnWidth(3, 220);
  sh.setColumnWidth(4, 120);
  sh.setColumnWidth(5, 180);
  sh.setColumnWidth(6, 420);
  sh.setColumnWidth(7, 190);
  sh.setColumnWidth(8, 360);
}

function setupTrustedDevicesSheet_(ss) {
  const sh = ss.getSheetByName(EK.SHEETS.TRUSTED_DEVICES) || ss.insertSheet(EK.SHEETS.TRUSTED_DEVICES);
  ensureHeaders_(sh, EK.TRUSTED_DEVICE_HEADERS);
  styleHeader_(sh, EK.TRUSTED_DEVICE_HEADERS.length);
  sh.setFrozenRows(1);
  sh.getRange('G:I').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.getRange('J2:J').insertCheckboxes();
  sh.getRange('K:K').setNumberFormat('0');
  sh.setColumnWidth(1, 250);
  sh.setColumnWidth(2, 230);
  sh.setColumnWidth(3, 220);
  sh.setColumnWidth(4, 160);
  sh.setColumnWidth(5, 220);
  sh.setColumnWidth(6, 170);
  sh.setColumnWidths(7, 3, 180);
  sh.setColumnWidth(13, 260);
  try { sh.hideColumns(12, 1); } catch (e) {}
}

function ensureTrustedDevicesSheet_() {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(EK.SHEETS.TRUSTED_DEVICES);
  if (!sh) {
    setupTrustedDevicesSheet_(ss);
    sh = ss.getSheetByName(EK.SHEETS.TRUSTED_DEVICES);
  }
  EK_RUNTIME_SHEETS_[EK.SHEETS.TRUSTED_DEVICES] = sh;
  return sh;
}

function ensureHeaders_(sh, headers) {
  if (sh.getLastRow() === 0) sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  else {
    const existing = sh.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
    headers.forEach((h, i) => { if (!existing[i]) sh.getRange(1, i + 1).setValue(h); });
  }
}

function styleHeader_(sh, cols) {
  sh.getRange(1, 1, 1, cols).setBackground('#0B57D0').setFontColor('#FFFFFF').setFontWeight('bold').setHorizontalAlignment('center');
}

function styleReportSheet_(sh, count) {
  sh.getRange(2, 1, 1, 6).setBackground('#DCE8FF').setFontWeight('bold');
  sh.getRange(5, 1, 1, 18).setBackground('#0B57D0').setFontColor('#FFFFFF').setFontWeight('bold');
  if (count) {
    const statusRange = sh.getRange(6, 6, count, 1);
    const rules = [
      SpreadsheetApp.newConditionalFormatRule().whenTextContains('LEWAT').setBackground('#FFF3CD').setRanges([statusRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('TIDAK HADIR').setBackground('#F8D7DA').setRanges([statusRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextContains('BALIK AWAL').setBackground('#FFE9CC').setRanges([statusRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('HADIR').setBackground('#D1E7DD').setRanges([statusRange]).build()
    ];
    sh.setConditionalFormatRules(rules);
  }
  sh.autoResizeColumns(1, 18);
  sh.setColumnWidth(2, 220); sh.setColumnWidth(3, 230); sh.setColumnWidth(10, 170); sh.setColumnWidth(11, 170); sh.setColumnWidth(12, 360); sh.setColumnWidth(15, 300);
}


// ---------- Email notifications ----------

/**
 * Jalankan MANUAL dari Apps Script editor menggunakan akaun pemilik sistem.
 * Fungsi ini memaksa Apps Script meminta scope MailApp secara eksplisit.
 * Jika pernah tersalah tolak granular consent, revoke access dahulu di Google Account,
 * kemudian jalankan fungsi ini semula.
 */
function authorizeEmailPermissionOwner() {
  const MAIL_SCOPE = 'https://www.googleapis.com/auth/script.send_mail';

  // Memaksa prompt kebenaran khusus untuk scope emel apabila dijalankan dari IDE.
  ScriptApp.requireScopes(ScriptApp.AuthMode.FULL, [MAIL_SCOPE]);

  const authInfo = ScriptApp.getAuthorizationInfo(
    ScriptApp.AuthMode.FULL,
    [MAIL_SCOPE]
  );
  const authorized = authInfo.getAuthorizedScopes() || [];
  if (!authorized.includes(MAIL_SCOPE)) {
    throw new Error(
      'Scope penghantaran emel masih belum diberikan. ' +
      'Buka Google Account → Security → Connections to third-party apps & services, ' +
      'padam akses untuk projek e-Keberadaan, kemudian run authorizeEmailPermissionOwner() semula dan benarkan semua permission.'
    );
  }

  MailApp.sendEmail({
    to: EK.EMAIL.OWNER_EMAIL,
    subject: 'e-Keberadaan — Pengesahan Akses Emel',
    body:
      'Akses MailApp untuk e-Keberadaan telah berjaya diberikan.\n\n' +
      'Akaun pelaksana: ' + (getMailExecutionEmail_() || '(tidak dipaparkan)') + '\n' +
      'Masa: ' + formatDateTime_(new Date()),
    name: EK.EMAIL.SENDER_NAME,
    replyTo: EK.EMAIL.OWNER_EMAIL
  });

  try {
    SpreadsheetApp.getUi().alert(
      'Akses emel berjaya',
      'Scope script.send_mail telah dibenarkan dan emel pengesahan dihantar ke ' + EK.EMAIL.OWNER_EMAIL + '.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {}

  return {
    ok: true,
    scope: MAIL_SCOPE,
    authorizedScopes: authorized,
    effectiveEmail: getMailExecutionEmail_()
  };
}

function getEmailAuthorizationDiagnostic() {
  const MAIL_SCOPE = 'https://www.googleapis.com/auth/script.send_mail';
  const info = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL, [MAIL_SCOPE]);
  return {
    status: String(info.getAuthorizationStatus()),
    authorizedScopes: info.getAuthorizedScopes() || [],
    authorizationUrl: info.getAuthorizationUrl() || '',
    activeEmail: normalizeEmail_(Session.getActiveUser().getEmail()),
    effectiveEmail: normalizeEmail_(Session.getEffectiveUser().getEmail()),
    configuredOwner: normalizeEmail_(EK.EMAIL.OWNER_EMAIL)
  };
}

function emailNotificationsEnabled_() {
  const value = PropertiesService.getScriptProperties().getProperty(EK.EMAIL.ENABLED_PROPERTY);
  return String(value == null ? 'TRUE' : value).toUpperCase() !== 'FALSE';
}

function assertEmailNotificationsEnabled_() {
  if (!emailNotificationsEnabled_()) throw new Error('Notifikasi emel e-Keberadaan sedang dinyahaktifkan.');
}

function getMailExecutionEmail_() {
  return normalizeEmail_(
    (Session.getEffectiveUser && Session.getEffectiveUser().getEmail()) ||
    (Session.getActiveUser && Session.getActiveUser().getEmail()) ||
    ''
  );
}

function assertMailRunsAsSystemOwner_() {
  // Jangan hard-block berdasarkan Session.getEffectiveUser()/getActiveUser().
  // Untuk akaun Google Workspace, alamat yang dipulangkan boleh menjadi primary
  // address atau alias yang berbeza daripada alamat sistem kea3123@moe.gov.my.
  // Pengirim sebenar MailApp tetap ditentukan oleh akaun yang meng-authorize
  // script / mencipta trigger / deploy Web App.
  return {
    effectiveEmail: getMailExecutionEmail_(),
    configuredOwner: normalizeEmail_(EK.EMAIL.OWNER_EMAIL)
  };
}

function assertMailQuotaAvailable_(required) {
  // v10.2: jangan panggil MailApp.getRemainingDailyQuota() dalam aliran login.
  // Panggilan quota itu sendiri memerlukan scope script.send_mail dan sebelum ini
  // menyebabkan semakan akaun pengguna gagal sebelum sendEmail sempat dijalankan.
  // MailApp.sendEmail() di bawah akan menjadi sumber kebenaran sebenar; jika kuota
  // atau authorization bermasalah, Google akan pulangkan exception yang tepat.
  return true;
}

function sendSystemEmail_(to, subject, htmlBody, textBody) {
  assertEmailNotificationsEnabled_();
  assertMailRunsAsSystemOwner_();
  const recipients = Array.isArray(to) ? to : String(to || '').split(',');
  const clean = [...new Set(recipients.map(normalizeEmail_).filter(isValidEmail_))];
  if (!clean.length) throw new Error('Tiada penerima emel yang sah.');
  assertMailQuotaAvailable_(clean.length);

  try {
    MailApp.sendEmail({
      to: clean.join(','),
      subject: String(subject || 'e-Keberadaan'),
      body: String(textBody || stripHtml_(htmlBody || '')),
      htmlBody: String(htmlBody || ''),
      name: EK.EMAIL.SENDER_NAME,
      replyTo: EK.EMAIL.OWNER_EMAIL
    });
  } catch (err) {
    const message = String(err && err.message ? err.message : err);
    if (message.includes('script.send_mail') || message.includes('MailApp')) {
      throw new Error(
        'MailApp belum diberi kebenaran pada deployment/trigger ini. ' +
        'Buka Apps Script menggunakan akaun pemilik, run sendNotificationTestFromMenu() sekali dan benarkan akses emel, ' +
        'kemudian Deploy → Manage deployments → Edit → New version → Deploy. ' +
        'Jika Web App mempunyai pilihan Execute as, pilih Me.'
      );
    }
    throw err;
  }
  return clean;
}

function safeSendSystemEmail_(to, subject, htmlBody, textBody, auditTarget) {
  try {
    const recipients = sendSystemEmail_(to, subject, htmlBody, textBody);
    audit_('EMAIL_NOTIFIKASI', auditTarget || subject, `${subject}; kepada=${recipients.join(', ')}`, EK.EMAIL.OWNER_EMAIL);
    return {ok: true, recipients};
  } catch (err) {
    audit_('EMAIL_NOTIFIKASI_GAGAL', auditTarget || subject, String(err && err.message ? err.message : err), EK.EMAIL.OWNER_EMAIL);
    return {ok: false, error: String(err && err.message ? err.message : err)};
  }
}

function sendPasswordResetPromptEmail_(user, admin) {
  if (!user || !isValidEmail_(user.email)) throw new Error('Emel pengguna tidak sah.');
  const webUrl = getWebAppUrl_();
  const actor = (admin && (admin.name || admin.email)) || 'Pentadbir Sistem';
  const subject = 'Reset PIN e-Keberadaan';
  const html = emailFrame_(
    'PIN telah direset',
    `<p>Assalamualaikum / Salam sejahtera <b>${escapeHtml_(user.name || user.email)}</b>,</p>
     <p>Pentadbir Sistem telah menetapkan semula akses PIN akaun e-Keberadaan anda.</p>
     ${detailTable_([
       ['Akaun', user.email],
       ['Tindakan oleh', actor],
       ['Masa', formatDateTime_(new Date())]
     ])}
     <p><b>Tiada PIN sementara diperlukan.</b></p>
     <p>Buka e-Keberadaan, masukkan emel DELIMa anda dan tekan <b>Teruskan</b>. Sistem akan terus membawa anda ke skrin untuk menetapkan PIN 6 digit baharu.</p>
     ${webUrl ? `<p style="margin:24px 0"><a href="${escapeHtml_(webUrl)}" style="display:inline-block;background:#0B57D0;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Buka e-Keberadaan</a></p>` : ''}
     <p style="color:#667085;font-size:13px">Jika anda tidak menjangka reset ini, hubungi Pentadbir Sistem.</p>`
  );
  const text = [
    'PIN e-Keberadaan anda telah direset.',
    `Akaun: ${user.email}`,
    `Tindakan oleh: ${actor}`,
    `Masa: ${formatDateTime_(new Date())}`,
    '',
    'Tiada PIN sementara diperlukan.',
    'Buka e-Keberadaan, masukkan emel DELIMa dan tekan Teruskan. Anda akan terus diminta menetapkan PIN 6 digit baharu.',
    webUrl ? `Buka: ${webUrl}` : '',
    '',
    'Jika anda tidak menjangka reset ini, hubungi Pentadbir Sistem.'
  ].filter(Boolean).join('\n');
  sendSystemEmail_([user.email], subject, html, text);
  return true;
}

function getNotificationAdminEmails_() {
  const emails = getAllUsers_()
    .filter(u => u.active && isManagementUser_(u) && isValidEmail_(u.email))
    .map(u => u.email);
  const owner = getUserByEmail_(EK.EMAIL.OWNER_EMAIL, true);
  if (owner && isManagementUser_(owner)) emails.push(owner.email);
  const unique = [...new Set(emails.map(normalizeEmail_).filter(Boolean))];
  return unique.length ? unique : [EK.EMAIL.OWNER_EMAIL];
}

function ensurePresenceDeadlineTrigger_(force) {
  const handler = 'checkExpiredPresenceWithoutPunchTrigger';
  const props = PropertiesService.getScriptProperties();
  if (!force && props.getProperty(EK.EMAIL.PRESENCE_TRIGGER_READY_PROPERTY) === 'TRUE') {
    return null;
  }
  const existing = ScriptApp.getProjectTriggers().find(t => t.getHandlerFunction() === handler) || null;
  if (existing && !force) {
    props.setProperty(EK.EMAIL.PRESENCE_TRIGGER_READY_PROPERTY, 'TRUE');
    return existing;
  }
  if (existing && force) ScriptApp.deleteTrigger(existing);
  const trigger = ScriptApp.newTrigger(handler).timeBased().everyMinutes(5).create();
  props.setProperty(EK.EMAIL.PRESENCE_TRIGGER_READY_PROPERTY, 'TRUE');
  return trigger;
}

function installEmailNotifications_(options) {
  options = options || {};
  PropertiesService.getScriptProperties().setProperty(EK.EMAIL.ENABLED_PROPERTY, 'TRUE');

  const effective = getMailExecutionEmail_();
  // Tidak lagi menyekat berdasarkan alamat Session kerana Workspace alias /
  // primary email boleh berbeza. Trigger akan berjalan sebagai akaun yang
  // menciptanya dan authorization MailApp disahkan melalui ujian emel.

  const reportHandler = 'sendYesterdayAttendanceReportTrigger';
  const reminderHandler = 'sendPunchReminderTrigger';
  const presenceHandler = 'checkExpiredPresenceWithoutPunchTrigger';
  ScriptApp.getProjectTriggers()
    .filter(t => [reportHandler, reminderHandler, presenceHandler].includes(t.getHandlerFunction()))
    .forEach(t => ScriptApp.deleteTrigger(t));

  const reportTrigger = ScriptApp.newTrigger(reportHandler)
    .timeBased()
    .atHour(EK.EMAIL.DAILY_REPORT_HOUR)
    .everyDays(1)
    .create();

  const settings = getSettings_();
  const reminderTotalMins = timeToMinutes_(settings.PUNCH_REMINDER_TIME || '09:00');
  const reminderHour = Math.max(0, Math.min(23, Math.floor(reminderTotalMins / 60)));
  const reminderMinute = Math.max(0, Math.min(59, reminderTotalMins % 60));
  let reminderTrigger = null;
  if (String(settings.PUNCH_REMINDER_ENABLED || 'TRUE').toUpperCase() !== 'FALSE') {
    reminderTrigger = ScriptApp.newTrigger(reminderHandler)
      .timeBased()
      .atHour(reminderHour)
      .nearMinute(reminderMinute)
      .everyDays(1)
      .create();
  }

  // Semak waktu akhir Keberadaan dengan kekerapan 5 minit. Trigger Apps Script
  // tidak menjamin saat tepat, jadi alert lazimnya dihantar dalam beberapa minit
  // selepas MasaAkhir yang direkodkan.
  const presenceTrigger = ensurePresenceDeadlineTrigger_(true);

  audit_('AKTIF_NOTIFIKASI_EMEL', `${reportHandler},${reminderHandler},${presenceHandler}`, `Laporan semalam ~${String(EK.EMAIL.DAILY_REPORT_HOUR).padStart(2,'0')}:00; peringatan rekod waktu=${settings.PUNCH_REMINDER_ENABLED}@${settings.PUNCH_REMINDER_TIME}; semakan tamat Keberadaan=5 minit; owner=${EK.EMAIL.OWNER_EMAIL}`, effective || EK.EMAIL.OWNER_EMAIL);
  return {
    ok: true,
    triggerId: reportTrigger.getUniqueId(),
    reminderTriggerId: reminderTrigger ? reminderTrigger.getUniqueId() : '',
    presenceTriggerId: presenceTrigger.getUniqueId(),
    hour: EK.EMAIL.DAILY_REPORT_HOUR,
    reminderTime: settings.PUNCH_REMINDER_TIME,
    reminderEnabled: String(settings.PUNCH_REMINDER_ENABLED || 'TRUE').toUpperCase() !== 'FALSE'
  };
}

function installEmailNotificationsFromMenu() {
  const ui = SpreadsheetApp.getUi();
  try {
    const result = installEmailNotifications_({silent: false});
    ui.alert(
      'Notifikasi emel aktif',
      `Penghantaran menggunakan akaun pemilik ${EK.EMAIL.OWNER_EMAIL}.\n\n` +
      `Laporan kehadiran hari semalam akan dihantar kepada Pentadbir setiap hari sekitar ${String(result.hour).padStart(2,'0')}:00 (Asia/Kuala_Lumpur).\n\n` +
      (result.reminderEnabled ? `Peringatan Rekod Waktu Masuk juga aktif sekitar ${result.reminderTime} pada hari bekerja.\n\n` : 'Peringatan Rekod Waktu Masuk sedang dinyahaktifkan dalam Tetapan.\n\n') +
      'Semakan tamat Keberadaan tanpa Punch Masuk berjalan setiap 5 minit dan akan memaklumkan Pengurusan sebelum status TIDAK HADIR ditulis.\n\n' +
      'Notifikasi permohonan Tidak Hadir dan aliran reset/tetapan PIN juga telah diaktifkan.',
      ui.ButtonSet.OK
    );
  } catch (err) {
    ui.alert('Notifikasi emel', String(err && err.message ? err.message : err), ui.ButtonSet.OK);
  }
}

function sendNotificationTestFromMenu() {
  const ui = SpreadsheetApp.getUi();
  try {
    assertMailRunsAsSystemOwner_();
    const actor = normalizeEmail_(Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || EK.EMAIL.OWNER_EMAIL);
    const html = emailFrame_(
      'Ujian notifikasi emel',
      `<p>Notifikasi e-Keberadaan berjaya dihantar.</p>
       <p><b>Pengirim sistem:</b> ${escapeHtml_(EK.EMAIL.OWNER_EMAIL)}</p>
       <p><b>Masa:</b> ${escapeHtml_(formatDateTime_(new Date()))}</p>`
    );
    sendSystemEmail_([actor || EK.EMAIL.OWNER_EMAIL], 'Ujian Notifikasi e-Keberadaan', html, 'Notifikasi e-Keberadaan berjaya dihantar.');
    ui.alert('Berjaya', `Emel ujian telah dihantar ke ${actor || EK.EMAIL.OWNER_EMAIL}.`, ui.ButtonSet.OK);
  } catch (err) {
    ui.alert('Emel ujian gagal', String(err && err.message ? err.message : err), ui.ButtonSet.OK);
  }
}

function sendPunchReminderTrigger() {
  return sendPunchReminder_(false);
}

function sendPunchReminderFromMenu() {
  const ui = SpreadsheetApp.getUi();
  try {
    requireGoogleAdmin_();
    const confirm = ui.alert('Hantar peringatan sekarang?', 'Ini akan menghantar emel kepada semua pengguna aktif yang belum merekod waktu masuk dan tiada permohonan Tidak Hadir aktif untuk hari ini. Teruskan?', ui.ButtonSet.YES_NO);
    if (confirm !== ui.Button.YES) return;
    const result = sendPunchReminder_(true);
    const msg = result.skipped
      ? `Tiada peringatan dihantar: ${result.reason || 'dilangkau'}.`
      : `Peringatan dihantar kepada ${result.sent.length} pengguna. Gagal: ${result.failed.length}.`;
    ui.alert('Peringatan Rekod Waktu Masuk', msg, ui.ButtonSet.OK);
  } catch (err) {
    ui.alert('Peringatan rekod waktu gagal', String(err && err.message ? err.message : err), ui.ButtonSet.OK);
  }
}

function sendPunchReminder_(force) {
  assertEmailNotificationsEnabled_();
  const settings = getSettings_();
  if (String(settings.PUNCH_REMINDER_ENABLED || 'TRUE').toUpperCase() === 'FALSE' && !force) {
    return {ok:true,skipped:true,reason:'Peringatan Rekod Waktu Masuk dinyahaktifkan',sent:[],failed:[]};
  }
  if (String(settings.SYSTEM_MODE || 'REAL').toUpperCase() === 'TEST' && !force) {
    return {ok:true,skipped:true,reason:'MOD TEST — emel peringatan automatik tidak dihantar',sent:[],failed:[]};
  }
  const dateKey = todayKey_();
  if (!isWorkingDay_(dateKey, settings) && !force) {
    return {ok:true,skipped:true,reason:'Hari ini bukan hari bekerja yang ditetapkan',sent:[],failed:[]};
  }
  const records = getAttendanceByDate_(dateKey);
  const byEmail = {};
  records.forEach(r => byEmail[r.email] = r);
  const requests = readAbsenceRows_();
  const users = getAllUsers_().filter(u =>
    u.active &&
    isValidEmail_(u.email) &&
    hasUserEverLoggedIn_(u.email)
  );
  const propKey = EK.EMAIL.PUNCH_REMINDER_SENT_PREFIX + dateKey;
  const props = PropertiesService.getScriptProperties();
  let sentBefore = [];
  try { sentBefore = JSON.parse(props.getProperty(propKey) || '[]'); } catch (e) { sentBefore = []; }
  const sentSet = new Set(sentBefore.map(normalizeEmail_));
  const sent = [], failed = [], skippedUsers = [];
  const presenceReminderCheckTime = force ? formatTime_(new Date()) : (settings.PUNCH_REMINDER_TIME || '09:00');

  users.forEach(u => {
    const rec = byEmail[u.email];
    if (rec && (rec.values[4] || String(rec.values[14] || '').toUpperCase() === 'TIDAK HADIR')) return;
    if (findRelevantAbsenceForDate_(u.email, dateKey, requests, 'TIDAK_HADIR')) return;
    const presenceAtReminder = findPresenceBlockAt_(u.email, dateKey, presenceReminderCheckTime, requests);
    if (presenceAtReminder) {
      skippedUsers.push({email:u.email,reason:`Keberadaan aktif ${presenceAtReminder.startTime}-${presenceAtReminder.endTime}`});
      return;
    }
    if (!force && sentSet.has(u.email)) return;
    const result = sendPunchReminderEmail_(u, dateKey, settings);
    if (result.ok) {
      sent.push(u.email); sentSet.add(u.email);
    } else failed.push({email:u.email,error:result.error || 'Gagal menghantar'});
  });

  props.setProperty(propKey, JSON.stringify([...sentSet]));
  cleanupPunchReminderProperties_(dateKey);
  audit_('EMAIL_PERINGATAN_PUNCH', dateKey, `Dihantar=${sent.length}; gagal=${failed.length}; waktu=${settings.PUNCH_REMINDER_TIME}`, EK.EMAIL.OWNER_EMAIL);
  return {ok:true,skipped:false,date:dateKey,sent,failed,skippedUsers};
}

function sendPunchReminderEmail_(user, dateKey, settings) {
  const webUrl = getWebAppUrl_();
  const schedule = getEffectiveSchedule_(user, settings);
  const subject = `Peringatan Rekod Waktu Masuk e-Keberadaan — ${formatDateMalay_(dateKey)}`;
  const html = emailFrame_(
    'Peringatan Rekod Waktu Masuk',
    `<p>Assalamualaikum / Salam sejahtera <b>${escapeHtml_(user.name || user.email)}</b>,</p>
     <p>Sistem masih belum mengesan <b>rekod waktu masuk</b> anda untuk hari ini, <b>${escapeHtml_(formatDateMalay_(dateKey))}</b>.</p>
     ${detailTable_([
       ['Akaun', user.email],
       ['Waktu peringatan', settings.PUNCH_REMINDER_TIME || '09:00'],
       ['Waktu rujukan masuk (Sesi 1)', schedule.s1In || settings.DEFAULT_S1_IN]
     ])}
     <p>Jika anda sedang bertugas, sila buka e-Keberadaan dan rakam waktu masuk. Jika anda tidak hadir dan belum membuat permohonan, gunakan menu <b>Tidak Hadir</b>.</p>
     ${webUrl ? `<p style="margin:24px 0"><a href="${escapeHtml_(webUrl)}" style="display:inline-block;background:#0B57D0;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Buka e-Keberadaan</a></p>` : ''}
     <p style="color:#667085;font-size:12px">Peringatan ini dihantar sekali bagi setiap hari bekerja apabila tiada rekod waktu masuk dikesan. Jika keadaan sama berlaku pada hari bekerja berikutnya, peringatan baharu akan dihantar.</p>`
  );
  const text = [
    `Peringatan Rekod Waktu Masuk — ${formatDateMalay_(dateKey)}`,
    `Nama: ${user.name || user.email}`,
    `Akaun: ${user.email}`,
    `Waktu peringatan: ${settings.PUNCH_REMINDER_TIME || '09:00'}`,
    `Waktu rujukan masuk (Sesi 1): ${schedule.s1In || settings.DEFAULT_S1_IN}`,
    '',
    'Sistem belum mengesan rekod waktu masuk anda. Jika bertugas, sila rakam waktu masuk. Jika tidak hadir, gunakan menu Tidak Hadir / Keberadaan.',
    webUrl ? `Buka: ${webUrl}` : ''
  ].filter(Boolean).join('\n');
  return safeSendSystemEmail_([user.email], subject, html, text, `${dateKey}:${user.email}`);
}

function cleanupPunchReminderProperties_(keepDateKey) {
  const props = PropertiesService.getScriptProperties();
  const all = props.getProperties();
  Object.keys(all).forEach(k => {
    if (!k.startsWith(EK.EMAIL.PUNCH_REMINDER_SENT_PREFIX)) return;
    const dateKey = k.slice(EK.EMAIL.PUNCH_REMINDER_SENT_PREFIX.length);
    if (dateKey && dateKey < addDaysKey_(keepDateKey, -14)) props.deleteProperty(k);
  });
}

function sendYesterdayAttendanceReportTrigger() {
  return sendYesterdayAttendanceReport_(false);
}

function sendYesterdayAttendanceReportFromMenu() {
  const ui = SpreadsheetApp.getUi();
  try {
    requireGoogleAdmin_();
    assertMailRunsAsSystemOwner_();
    const result = sendYesterdayAttendanceReport_(true);
    ui.alert(
      'Laporan emel',
      result.skipped
        ? `Tiada emel dihantar: ${result.reason || 'sudah dihantar'}.`
        : `Laporan ${result.date} telah dihantar kepada ${result.recipients.length} penerima.`,
      ui.ButtonSet.OK
    );
  } catch (err) {
    ui.alert('Laporan emel gagal', String(err && err.message ? err.message : err), ui.ButtonSet.OK);
  }
}

function sendYesterdayAttendanceReport_(force) {
  assertEmailNotificationsEnabled_();
  assertMailRunsAsSystemOwner_();

  const dateKey = addDaysKey_(todayKey_(), -1);
  const props = PropertiesService.getScriptProperties();
  const lastSent = props.getProperty(EK.EMAIL.DAILY_REPORT_PROPERTY) || '';
  if (!force && lastSent === dateKey) return {ok: true, skipped: true, reason: 'Laporan tarikh ini telah dihantar.', date: dateKey};

  const settings = getSettings_();
  if (!force && !isWorkingDay_(dateKey, settings)) return {ok:true,skipped:true,reason:'Semalam bukan hari bekerja yang ditetapkan.',date:dateKey};
  finalizeMissingAttendanceForDate_(dateKey, settings);
  const users = getAllUsers_().filter(u => u.active);
  const report = buildDailyReport_(dateKey, users, settings);
  const summary = summarizeReport_(report);
  const recipients = getNotificationAdminEmails_();
  const email = buildDailyAttendanceEmail_(dateKey, report, summary);
  sendSystemEmail_(recipients, email.subject, email.html, email.text);

  props.setProperty(EK.EMAIL.DAILY_REPORT_PROPERTY, dateKey);
  audit_('EMAIL_LAPORAN_HARIAN', dateKey, `Kepada=${recipients.join(', ')}; hadir=${summary.hadir}; lewat=${summary.lewat}; tidakHadir=${summary.tidakHadir}`, EK.EMAIL.OWNER_EMAIL);
  return {ok: true, skipped: false, date: dateKey, recipients, summary};
}

function buildDailyAttendanceEmail_(dateKey, report, summary) {
  const displayDate = formatDateMalay_(dateKey);
  const webUrl = getWebAppUrl_();
  const rows = report.map(r => {
    const statusColor = r.status === 'HADIR' ? '#067647'
      : String(r.status||'').includes('LEWAT') ? '#B54708'
      : String(r.status||'').includes('BALIK AWAL') ? '#9A4D00'
      : r.status === 'TIDAK HADIR' ? '#B42318' : '#475467';
    return `<tr>
      <td style="padding:9px;border-bottom:1px solid #eaecf0">${escapeHtml_(r.name)}</td>
      <td style="padding:9px;border-bottom:1px solid #eaecf0">${escapeHtml_(r.category)}</td>
      <td style="padding:9px;border-bottom:1px solid #eaecf0;font-weight:700;color:${statusColor}">${escapeHtml_(r.status)}</td>
      <td style="padding:9px;border-bottom:1px solid #eaecf0">${escapeHtml_(r.inTime || '—')}</td>
      <td style="padding:9px;border-bottom:1px solid #eaecf0">${escapeHtml_(r.outTime || '—')}</td>
      <td style="padding:9px;border-bottom:1px solid #eaecf0">${escapeHtml_(r.reason || r.source || '—')}</td>
    </tr>`;
  }).join('');

  const button = webUrl
    ? `<p style="margin:24px 0"><a href="${escapeHtml_(webUrl)}" style="display:inline-block;background:#0B57D0;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Buka e-Keberadaan</a></p>`
    : '';

  const html = emailFrame_(
    `Laporan Kehadiran — ${displayDate}`,
    `<p>Berikut ialah laporan kehadiran bagi <b>${escapeHtml_(displayDate)}</b>.</p>
     <div style="display:flex;gap:8px;flex-wrap:wrap;margin:18px 0">
       ${summaryChip_('Jumlah', summary.total, '#344054')}
       ${summaryChip_('Hadir', summary.hadir, '#067647')}
       ${summaryChip_('Lewat', summary.lewat, '#B54708')}
       ${summaryChip_('Balik Awal', summary.balikAwal || 0, '#9A4D00')}
       ${summaryChip_('Tidak Hadir', summary.tidakHadir, '#B42318')}
       ${summaryChip_('Belum Hadir', summary.belumHadir, '#475467')}
     </div>
     <div style="overflow-x:auto">
       <table style="width:100%;border-collapse:collapse;font-size:13px">
         <thead><tr style="background:#0B57D0;color:#fff">
           <th style="padding:9px;text-align:left">Nama</th>
           <th style="padding:9px;text-align:left">Kategori</th>
           <th style="padding:9px;text-align:left">Status</th>
           <th style="padding:9px;text-align:left">Masuk</th>
           <th style="padding:9px;text-align:left">Balik</th>
           <th style="padding:9px;text-align:left">Catatan / Sumber</th>
         </tr></thead>
         <tbody>${rows}</tbody>
       </table>
     </div>
     ${button}
     <p style="color:#667085;font-size:12px">Laporan ini dijana secara automatik oleh e-Keberadaan pada ${escapeHtml_(formatDateTime_(new Date()))}.</p>`
  );

  const textRows = report.map(r =>
    `${r.name} | ${r.category} | ${r.status} | Masuk ${r.inTime || '-'} | Balik ${r.outTime || '-'} | ${r.reason || r.source || '-'}`
  ).join('\n');
  const text = [
    `Laporan Kehadiran — ${displayDate}`,
    `Jumlah: ${summary.total} | Hadir: ${summary.hadir} | Lewat: ${summary.lewat} | Balik Awal: ${summary.balikAwal || 0} | Tidak Hadir: ${summary.tidakHadir} | Belum Hadir: ${summary.belumHadir}`,
    '',
    textRows,
    '',
    webUrl ? `e-Keberadaan: ${webUrl}` : ''
  ].filter(Boolean).join('\n');

  return {subject: `Laporan Kehadiran Harian — ${displayDate}`, html, text};
}

function summaryChip_(label, value, color) {
  return `<span style="display:inline-block;border:1px solid #eaecf0;border-radius:10px;padding:8px 11px;background:#fff">
    <span style="color:#667085">${escapeHtml_(label)}</span>
    <b style="margin-left:6px;color:${color}">${Number(value || 0)}</b>
  </span>`;
}

function notifyAbsenceSubmitted_(request) {
  const recipients=getNotificationAdminEmails_(), webUrl=getWebAppUrl_();
  const label=request.mode==='KEBERADAAN'?'Keberadaan':'Tidak Hadir';
  const timeLine=request.mode==='KEBERADAAN'?`${request.startTime||'—'} hingga ${request.endTime||'—'}`:'—';
  const subject=`Permohonan ${label} — ${request.name}`;
  const html=emailFrame_(`Permohonan ${label} baharu`, `<p>Satu permohonan baharu telah dihantar untuk semakan.</p>${detailTable_([
    ['Pemohon',request.name],['Jawatan',request.jobTitle||'—'],['Emel',request.email],['Kategori',request.category],['Mod',label],['Jenis',request.type],['Tarikh',request.startDate===request.endDate?request.startDate:`${request.startDate} hingga ${request.endDate}`],['Masa',timeLine],['Catatan',request.note||'—'],['ID',request.id]
  ])}${webUrl?`<p style="margin:24px 0"><a href="${escapeHtml_(webUrl)}" style="display:inline-block;background:#0B57D0;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Buka e-Keberadaan</a></p>`:''}`);
  const text=[`Permohonan ${label} baharu`,`Pemohon: ${request.name}`,`Jawatan: ${request.jobTitle||'-'}`,`Jenis: ${request.type}`,`Tarikh: ${request.startDate} hingga ${request.endDate}`,request.mode==='KEBERADAAN'?`Masa: ${timeLine}`:'',`ID: ${request.id}`].filter(Boolean).join('\n');
  const adminNotice=safeSendSystemEmail_(recipients,subject,html,text,request.id);
  const userSubject=`Permohonan ${label} diterima — ${request.id}`;
  const userHtml=emailFrame_('Permohonan diterima',`<p>Assalamualaikum / Salam sejahtera <b>${escapeHtml_(request.name)}</b>,</p><p>Permohonan ${escapeHtml_(label)} anda telah diterima dan kini berstatus <b style="color:#B54708">MENUNGGU</b>.</p>${detailTable_([['Jenis',request.type],['Tarikh',request.startDate===request.endDate?request.startDate:`${request.startDate} hingga ${request.endDate}`],['Masa',timeLine],['ID',request.id]])}`);
  const userText=[`Permohonan ${label} diterima.`,`Status: MENUNGGU`,`Jenis: ${request.type}`,`Tarikh: ${request.startDate} hingga ${request.endDate}`,request.mode==='KEBERADAAN'?`Masa: ${timeLine}`:'',`ID: ${request.id}`].filter(Boolean).join('\n');
  const applicantNotice=hasUserEverLoggedIn_(request.email)?safeSendSystemEmail_([request.email],userSubject,userHtml,userText,request.id):{ok:true,skipped:true};
  return {ok:!!adminNotice.ok,adminOk:!!adminNotice.ok,applicantOk:!!applicantNotice.ok&&!applicantNotice.skipped,adminError:adminNotice.error||'',applicantError:applicantNotice.error||''};
}

function notifyAbsenceReviewed_(request, decision, manager, comment) {
  const webUrl=getWebAppUrl_(),approved=decision==='DILULUSKAN',label=request.mode==='KEBERADAAN'?'Keberadaan':'Tidak Hadir';
  const subject=`Permohonan ${label} ${approved?'Diluluskan':'Ditolak'} — ${request.id}`;
  const html=emailFrame_(approved?'Permohonan Diluluskan':'Permohonan Ditolak',`<p>Assalamualaikum / Salam sejahtera <b>${escapeHtml_(request.name)}</b>,</p><p>Permohonan ${escapeHtml_(label)} anda telah <b style="color:${approved?'#067647':'#B42318'}">${escapeHtml_(decision)}</b>.</p>${detailTable_([['Jenis',request.type],['Tarikh',request.startDate===request.endDate?request.startDate:`${request.startDate} hingga ${request.endDate}`],['Masa',request.mode==='KEBERADAAN'?`${request.startTime||'—'} hingga ${request.endTime||'—'}`:'—'],['Disemak oleh',manager.name||manager.email],['Ulasan',comment||'—'],['ID',request.id]])}${webUrl?`<p style="margin:24px 0"><a href="${escapeHtml_(webUrl)}" style="display:inline-block;background:#0B57D0;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Buka e-Keberadaan</a></p>`:''}`);
  const text=[`Permohonan ${label}: ${decision}`,`Jenis: ${request.type}`,`Tarikh: ${request.startDate} hingga ${request.endDate}`,request.mode==='KEBERADAAN'?`Masa: ${request.startTime} hingga ${request.endTime}`:'',`Disemak oleh: ${manager.name||manager.email}`,`Ulasan: ${comment||'-'}`,`ID: ${request.id}`].filter(Boolean).join('\n');
  if(!hasUserEverLoggedIn_(request.email)){audit_('EMAIL_PERMOHONAN_DILANGKAU',request.id,'Pengguna belum pernah log masuk',EK.EMAIL.OWNER_EMAIL);return {ok:true,skipped:true};}
  return safeSendSystemEmail_([request.email],subject,html,text,request.id);
}

function notifyAbsenceCancelled_(request, user) {
  const recipients=getNotificationAdminEmails_(),label=request.mode==='KEBERADAAN'?'Keberadaan':'Tidak Hadir';
  const subject=`Permohonan ${label} dibatalkan — ${request.name}`;
  const html=emailFrame_('Permohonan Dibatalkan',`<p><b>${escapeHtml_(request.name)}</b> telah membatalkan permohonan ${escapeHtml_(label)}.</p>${detailTable_([['Jenis',request.type],['Tarikh',request.startDate===request.endDate?request.startDate:`${request.startDate} hingga ${request.endDate}`],['ID',request.id]])}`);
  const adminNotice=safeSendSystemEmail_(recipients,subject,html,`${request.name} membatalkan ${request.id}.`,request.id);
  const applicantNotice=hasUserEverLoggedIn_(request.email)?safeSendSystemEmail_([request.email],`Pembatalan permohonan berjaya — ${request.id}`,emailFrame_('Pembatalan berjaya',`<p>Permohonan ${escapeHtml_(label)} anda telah dibatalkan.</p>${detailTable_([['Jenis',request.type],['Status','DIBATALKAN'],['ID',request.id]])}`),`Permohonan ${request.id} telah dibatalkan.`,request.id):{ok:true,skipped:true};
  return {ok:!!adminNotice.ok,adminOk:!!adminNotice.ok,applicantOk:!!applicantNotice.ok};
}

function notifyFirstLoginCompleted_(user, remember) {
  if (!user || !isValidEmail_(user.email)) return {ok:false, skipped:true};
  const webUrl = getWebAppUrl_();
  const subject = 'Akaun e-Keberadaan berjaya diaktifkan';
  const html = emailFrame_(
    'Log masuk pertama berjaya',
    `<p>Assalamualaikum / Salam sejahtera <b>${escapeHtml_(user.name || user.email)}</b>,</p>
     <p>Log masuk pertama anda telah berjaya dan PIN 6 digit e-Keberadaan telah berjaya ditetapkan.</p>
     ${detailTable_([
       ['Akaun', user.email],
       ['Masa', formatDateTime_(new Date())],
       ['Sesi', `Peranti dipercayai — sehingga ${EK.SESSION.REMEMBER_DAYS} hari`]
     ])}
     <p><b>PIN anda tidak pernah dipaparkan dalam emel ini.</b></p>
     <p style="color:#667085">Jika anda tidak melakukan perubahan ini, hubungi Pentadbir Sistem dengan segera untuk reset PIN.</p>
     ${webUrl ? `<p style="margin:24px 0"><a href="${escapeHtml_(webUrl)}" style="display:inline-block;background:#0B57D0;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Buka e-Keberadaan</a></p>` : ''}`
  );
  const text = [
    'Log masuk pertama e-Keberadaan berjaya.',
    `Akaun: ${user.email}`,
    `Masa: ${formatDateTime_(new Date())}`,
    `Sesi: Peranti dipercayai — sehingga ${EK.SESSION.REMEMBER_DAYS} hari`,
    '',
    'PIN 6 digit anda telah berjaya ditetapkan. PIN tidak dipaparkan dalam emel ini.',
    'Jika anda tidak melakukan perubahan ini, hubungi Pentadbir Sistem dengan segera.'
  ].join('\n');
  return safeSendSystemEmail_([user.email], subject, html, text, user.email);
}


function notifyPasswordResetCompleted_(user, remember) {
  if (!user || !isValidEmail_(user.email)) return {ok:false, skipped:true};
  const webUrl = getWebAppUrl_();
  const subject = 'PIN e-Keberadaan berjaya ditukar';
  const html = emailFrame_(
    'PIN baharu berjaya ditetapkan',
    `<p>Assalamualaikum / Salam sejahtera <b>${escapeHtml_(user.name || user.email)}</b>,</p>
     <p>PIN baharu untuk akaun e-Keberadaan anda telah berjaya ditetapkan selepas proses reset.</p>
     ${detailTable_([
       ['Akaun', user.email],
       ['Masa', formatDateTime_(new Date())],
       ['Sesi', `Peranti dipercayai — sehingga ${EK.SESSION.REMEMBER_DAYS} hari`]
     ])}
     <p><b>PIN anda tidak pernah dipaparkan dalam emel ini.</b></p>
     <p style="color:#667085">Jika anda tidak melakukan perubahan ini, hubungi Pentadbir Sistem dengan segera.</p>
     ${webUrl ? `<p style="margin:24px 0"><a href="${escapeHtml_(webUrl)}" style="display:inline-block;background:#0B57D0;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Buka e-Keberadaan</a></p>` : ''}`
  );
  const text = [
    'PIN baharu e-Keberadaan berjaya ditetapkan selepas reset.',
    `Akaun: ${user.email}`,
    `Masa: ${formatDateTime_(new Date())}`,
    `Sesi: Peranti dipercayai — sehingga ${EK.SESSION.REMEMBER_DAYS} hari`,
    '',
    'PIN anda tidak pernah dipaparkan dalam emel ini.',
    'Jika anda tidak melakukan perubahan ini, hubungi Pentadbir Sistem dengan segera.'
  ].join('\n');
  return safeSendSystemEmail_([user.email], subject, html, text, user.email);
}

function notifyAccountLocked_(user, until) {
  if (!user || !isValidEmail_(user.email)) return {ok:false, skipped:true};
  const subject = 'Amaran keselamatan — akaun e-Keberadaan dikunci sementara';
  const unlockAt = until instanceof Date ? formatDateTime_(until) : String(until || '');
  const html = emailFrame_(
    'Akaun dikunci sementara',
    `<p>Assalamualaikum / Salam sejahtera <b>${escapeHtml_(user.name || user.email)}</b>,</p>
     <p>Akaun e-Keberadaan anda telah dikunci sementara selepas terlalu banyak percubaan PIN yang tidak berjaya.</p>
     ${detailTable_([
       ['Akaun', user.email],
       ['Masa kejadian', formatDateTime_(new Date())],
       ['Boleh cuba semula', unlockAt || `selepas ${EK.PASSWORD.LOCK_MINUTES} minit`]
     ])}
     <p style="color:#667085">Jika percubaan ini bukan daripada anda, maklumkan kepada Pentadbir Sistem. Jangan balas dengan PIN anda.</p>`
  );
  const text = [
    'Akaun e-Keberadaan anda telah dikunci sementara.',
    `Akaun: ${user.email}`,
    `Masa: ${formatDateTime_(new Date())}`,
    `Boleh cuba semula: ${unlockAt || `selepas ${EK.PASSWORD.LOCK_MINUTES} minit`}`,
    '',
    'Jika percubaan ini bukan daripada anda, maklumkan kepada Pentadbir Sistem.'
  ].join('\n');
  return safeSendSystemEmail_([user.email], subject, html, text, user.email);
}

function notifyAccountUnlocked_(user, admin) {
  if (!user || !isValidEmail_(user.email)) return {ok:false, skipped:true};
  const subject = 'Akaun e-Keberadaan telah dibuka semula';
  const html = emailFrame_(
    'Sekatan log masuk dibuka',
    `<p>Assalamualaikum / Salam sejahtera <b>${escapeHtml_(user.name || user.email)}</b>,</p>
     <p>Sekatan log masuk sementara pada akaun e-Keberadaan anda telah dibuka oleh Pentadbir Sistem.</p>
     ${detailTable_([
       ['Akaun', user.email],
       ['Dibuka pada', formatDateTime_(new Date())],
       ['Tindakan oleh', (admin && (admin.name || admin.email)) || 'Pentadbir Sistem']
     ])}
     <p>Anda boleh cuba log masuk semula. Jika anda tidak mengenali aktiviti terdahulu, pertimbangkan untuk meminta reset PIN.</p>`
  );
  const text = [
    'Sekatan log masuk e-Keberadaan anda telah dibuka.',
    `Akaun: ${user.email}`,
    `Masa: ${formatDateTime_(new Date())}`,
    `Tindakan oleh: ${(admin && (admin.name || admin.email)) || 'Pentadbir Sistem'}`
  ].join('\n');
  return safeSendSystemEmail_([user.email], subject, html, text, user.email);
}

function notifyUserAccountChange_(before, after, admin) {
  if (!after || !isValidEmail_(after.email)) return {ok:false, skipped:true};
  const actor = (admin && (admin.name || admin.email)) || 'Pentadbir Sistem';
  const webUrl = getWebAppUrl_();

  // Pengguna baharu yang aktif: maklumkan kewujudan akaun.
  // Pada login pertama, pengguna terus mencipta PIN 6 digit sendiri.
  if (!before) {
    if (!after.active) return {ok:true, skipped:true};
    const subject = 'Akaun e-Keberadaan anda telah didaftarkan';
    const html = emailFrame_(
      'Akaun telah didaftarkan',
      `<p>Assalamualaikum / Salam sejahtera <b>${escapeHtml_(after.name || after.email)}</b>,</p>
       <p>Akaun anda telah didaftarkan dalam e-Keberadaan SMK Bandar Baru Sungai Lalang.</p>
       ${detailTable_([
         ['Akaun', after.email],
         ['Kategori', after.category || '—'],
         ['Didaftarkan oleh', actor]
       ])}
       <p>Untuk kali pertama, buka e-Keberadaan dan gunakan <b>Teruskan</b>. Sistem akan terus membawa anda ke skrin untuk menetapkan PIN 6 digit baharu sendiri.</p>
       ${webUrl ? `<p style="margin:24px 0"><a href="${escapeHtml_(webUrl)}" style="display:inline-block;background:#0B57D0;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Buka e-Keberadaan</a></p>` : ''}`
    );
    const text = [
      'Akaun e-Keberadaan anda telah didaftarkan.',
      `Akaun: ${after.email}`,
      `Kategori: ${after.category || '-'}`,
      `Didaftarkan oleh: ${actor}`,
      '',
      'Buka e-Keberadaan dan tekan Teruskan untuk memulakan log masuk pertama dan mencipta PIN 6 digit.'
    ].join('\n');
    return safeSendSystemEmail_([after.email], subject, html, text, after.email);
  }

  const activeChanged = !!before.active !== !!after.active;
  const adminChanged = !!before.isAdmin !== !!after.isAdmin;
  const categoryChanged = String(before.category || '') !== String(after.category || '');
  if (!activeChanged && !adminChanged && !categoryChanged) return {ok:true, skipped:true};

  const changes = [];
  if (activeChanged) changes.push(['Status akaun', after.active ? 'AKTIF' : 'DINYAHAKTIFKAN']);
  if (categoryChanged) changes.push(['Kategori / peranan', `${before.category || '—'} → ${after.category || '—'}`]);
  if (adminChanged) changes.push(['Akses Pentadbir Sistem', after.isAdmin ? 'DIBERIKAN' : 'DITARIK BALIK']);
  changes.push(['Dikemaskini oleh', actor]);
  changes.push(['Masa', formatDateTime_(new Date())]);

  const subject = activeChanged && !after.active
    ? 'Akses e-Keberadaan anda telah dinyahaktifkan'
    : 'Perubahan akses akaun e-Keberadaan';
  const html = emailFrame_(
    'Perubahan akses akaun',
    `<p>Assalamualaikum / Salam sejahtera <b>${escapeHtml_(after.name || after.email)}</b>,</p>
     <p>Terdapat perubahan pada akses akaun e-Keberadaan anda.</p>
     ${detailTable_(changes)}
     <p style="color:#667085">Jika anda tidak menjangkakan perubahan ini, hubungi Pentadbir Sistem.</p>`
  );
  const text = ['Terdapat perubahan pada akses akaun e-Keberadaan anda.']
    .concat(changes.map(r => `${r[0]}: ${r[1]}`))
    .concat(['', 'Jika anda tidak menjangkakan perubahan ini, hubungi Pentadbir Sistem.'])
    .join('\n');
  return safeSendSystemEmail_([after.email], subject, html, text, after.email);
}

function emailFrame_(title, contentHtml) {
  return `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#101828">
    <div style="max-width:760px;margin:0 auto;padding:24px 14px">
      <div style="background:#0753B9;border-radius:16px 16px 0 0;padding:18px 22px;color:#fff">
        <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">e-Keberadaan</div>
        <div style="font-size:20px;font-weight:800;margin-top:4px">${escapeHtml_(title)}</div>
      </div>
      <div style="background:#fff;border:1px solid #e4e7ec;border-top:0;border-radius:0 0 16px 16px;padding:22px">
        ${contentHtml}
        <hr style="border:0;border-top:1px solid #eaecf0;margin:24px 0">
        <p style="margin:0;color:#667085;font-size:12px">SMK Bandar Baru Sungai Lalang · e-Keberadaan<br>Emel sistem: ${escapeHtml_(EK.EMAIL.OWNER_EMAIL)}</p>
      </div>
    </div>
  </body></html>`;
}

function detailTable_(rows) {
  return `<table style="width:100%;border-collapse:collapse;margin:16px 0">` +
    rows.map(pair => `<tr><td style="width:150px;padding:8px;border-bottom:1px solid #eaecf0;color:#667085">${escapeHtml_(pair[0])}</td><td style="padding:8px;border-bottom:1px solid #eaecf0;font-weight:600">${escapeHtml_(pair[1] == null ? '' : String(pair[1]))}</td></tr>`).join('') +
    `</table>`;
}

function escapeHtml_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml_(html) {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function getWebAppUrl_() {
  try { return ScriptApp.getService().getUrl() || ''; } catch (e) { return ''; }
}

function formatDateMalay_(dateKey) {
  dateKey = dateCellToKey_(dateKey);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey || '')) return String(dateKey || '');
  const parts = dateKey.split('-').map(Number);
  const months = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
  return `${parts[2]} ${months[parts[1]-1]} ${parts[0]}`;
}



// ---------- Semakan Lewat / Balik Awal (Pentadbir Sistem sahaja) ----------
function getTimeReviewSheet_() {
  let sh = getSpreadsheet_().getSheetByName(EK.SHEETS.TIME_REVIEW);
  if (!sh) { setupTimeReviewSheet_(getSpreadsheet_()); sh = getSpreadsheet_().getSheetByName(EK.SHEETS.TIME_REVIEW); }
  EK_RUNTIME_SHEETS_[EK.SHEETS.TIME_REVIEW] = sh;
  return sh;
}

function readTimeReviewRows_() {
  const sh = getTimeReviewSheet_();
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2,1,sh.getLastRow()-1,EK.TIME_REVIEW_HEADERS.length).getValues().map((v,i)=>({
    row:i+2,id:String(v[0]||''),createdAt:v[1]||'',date:dateCellToKey_(v[2]),email:normalizeEmail_(v[3]),name:String(v[4]||''),jobTitle:String(v[5]||''),category:String(v[6]||''),
    type:String(v[7]||''),session:Number(v[8]||1),recordTime:displayMalaysiaTime_(v[9]),referenceTime:displayMalaysiaTime_(v[10]),reviewStatus:String(v[11]||'BELUM DIAMBIL MAKLUM'),
    reviewedBy:String(v[12]||''),reviewerName:String(v[13]||''),reviewedAt:v[14]||'',comment:String(v[15]||'')
  })).filter(r=>r.id);
}

function publicTimeReview_(r) {
  return {id:r.id,date:r.date,email:r.email,name:r.name,jobTitle:r.jobTitle||'',category:r.category,type:r.type,session:r.session,recordTime:r.recordTime,referenceTime:r.referenceTime,
    reviewStatus:r.reviewStatus||'BELUM DIAMBIL MAKLUM',reviewedBy:r.reviewedBy||'',reviewerName:r.reviewerName||'',reviewedAt:r.reviewedAt?formatDateTime_(r.reviewedAt):'',comment:r.comment||'',createdAt:r.createdAt?formatDateTime_(r.createdAt):''};
}

function timeReviewId_(user,date,type,session){
  return `SW-${String(date||todayKey_()).replace(/-/g,'')}-${fastStableKey_([user.email,date,type,session].join('|'))}`;
}

function createTimeReviewRecord_(data) {
  const user = data.user;
  const id = timeReviewId_(user,data.date,data.type,data.session);
  const existing = readTimeReviewRows_().find(r=>r.id===id);
  if (existing) return Object.assign({}, existing, {isNew:false});
  const now = new Date();
  const row = [id,now,data.date,user.email,user.name,user.jobTitle||'',user.category,data.type,Number(data.session||1),data.recordTime||'',data.referenceTime||'','BELUM DIAMBIL MAKLUM','','','', ''];
  const sh = getTimeReviewSheet_(); sh.appendRow(row);
  return {row:sh.getLastRow(),id,createdAt:now,date:data.date,email:user.email,name:user.name,jobTitle:user.jobTitle||'',category:user.category,type:data.type,session:Number(data.session||1),recordTime:data.recordTime||'',referenceTime:data.referenceTime||'',reviewStatus:'BELUM DIAMBIL MAKLUM',reviewedBy:'',reviewerName:'',reviewedAt:'',comment:'',isNew:true};
}

function getSystemAdminEmails_() {
  const emails = getAllUsers_().filter(u=>u.active && u.isAdmin && isValidEmail_(u.email)).map(u=>u.email);
  const owner = getUserByEmail_(EK.EMAIL.OWNER_EMAIL, true);
  if (owner && owner.isAdmin) emails.push(owner.email);
  const unique=[...new Set(emails.map(normalizeEmail_).filter(Boolean))];
  return unique.length?unique:[EK.EMAIL.OWNER_EMAIL];
}

function notifyTimeException_(r) {
  const recipients = getSystemAdminEmails_();
  const subject = `${r.type} — ${r.name} (${r.date})`;
  const html = emailFrame_('Makluman rekod waktu', `<p>Rekod waktu memerlukan perhatian Pentadbir Sistem.</p>${detailTable_([
    ['Nama',r.name],['Jawatan',r.jobTitle||'—'],['Emel',r.email],['Jenis',r.type],['Sesi',String(r.session)],['Tarikh',r.date],['Waktu direkod',r.recordTime],['Waktu rujukan',r.referenceTime||'—'],['Status','BELUM DIAMBIL MAKLUM']
  ])}`);
  const text = [`Makluman ${r.type}`,`Nama: ${r.name}`,`Jawatan: ${r.jobTitle||'-'}`,`Tarikh: ${r.date}`,`Sesi: ${r.session}`,`Waktu: ${r.recordTime}`,`Rujukan: ${r.referenceTime||'-'}`].join('\n');
  return safeSendSystemEmail_(recipients,subject,html,text,r.id);
}

function inferAttendanceFlags_(values, user, settings) {
  const v = padAttendanceValues_(values);
  const flags = splitAttendanceFlags_(v[34]);
  const status = String(v[14] || '').toUpperCase();
  // New records already persist precise flags. Legacy LEWAT records can be
  // reconstructed from their recorded times and the user's effective schedule.
  if (flags.length) return flags;
  if (status.includes('LEWAT')) flags.push('LEWAT');
  if (status.includes('BALIK AWAL')) flags.push('BALIK AWAL');
  if (!user || status === 'TIDAK HADIR' || String(v[15] || '').toUpperCase() === 'TEST') return flags;
  settings = settings || getSettings_();
  const schedule = getEffectiveSchedule_(user, settings);
  const pairs = [
    {type:'LEWAT', value:v[4], ref:schedule.s1In, cmp:(a,b)=>a>b},
    {type:'BALIK AWAL', value:v[9], ref:schedule.s1Out, cmp:(a,b)=>a<b},
    {type:'LEWAT', value:v[22], ref:schedule.s2In, cmp:(a,b)=>a>b},
    {type:'BALIK AWAL', value:v[27], ref:schedule.s2Out, cmp:(a,b)=>a<b}
  ];
  pairs.forEach(x=>{
    if (!x.value || !x.ref) return;
    const mins=timeToMinutes_(formatTime_(x.value)), ref=timeToMinutes_(x.ref);
    if (Number.isFinite(mins) && Number.isFinite(ref) && x.cmp(mins,ref) && !flags.includes(x.type)) flags.push(x.type);
  });
  return flags;
}

function ensureTimeReviewRowsForRange_(from, to) {
  const settings=getSettings_(), usersByEmail={}; getAllUsers_().forEach(u=>usersByEmail[u.email]=u);
  const absenceRows=readAbsenceRows_();
  const existingRows=readTimeReviewRows_(), existingIds=new Set(existingRows.map(r=>r.id)), toAppend=[];
  getAttendanceValuesInDateRange_(from,to).forEach(raw=>{
    const v=padAttendanceValues_(raw), date=dateCellToKey_(v[0]), email=normalizeEmail_(v[1]), user=usersByEmail[email];
    if(!date||!user||String(v[14]||'').toUpperCase()==='TIDAK HADIR'||String(v[15]||'').toUpperCase()==='TEST')return;
    const schedule=getEffectiveSchedule_(user,settings);
    const checks=[
      {type:'LEWAT',session:1,value:v[4],ref:schedule.s1In,cmp:(a,b)=>a>b},
      {type:'BALIK AWAL',session:1,value:v[9],ref:schedule.s1Out,cmp:(a,b)=>a<b},
      {type:'LEWAT',session:2,value:v[22],ref:schedule.s2In,cmp:(a,b)=>a>b},
      {type:'BALIK AWAL',session:2,value:v[27],ref:schedule.s2Out,cmp:(a,b)=>a<b}
    ];
    checks.forEach(x=>{
      if(!x.value||!x.ref)return;
      const recordTime=formatTime_(x.value), mins=timeToMinutes_(recordTime), refMins=timeToMinutes_(x.ref);
      if(!Number.isFinite(mins)||!Number.isFinite(refMins)||!x.cmp(mins,refMins))return;
      const id=timeReviewId_(user,date,x.type,x.session); if(existingIds.has(id))return;
      existingIds.add(id); const now=new Date();

      let reviewStatus='BELUM DIAMBIL MAKLUM', reviewedBy='', reviewerName='', reviewedAt='', comment='';
      if(x.type==='LEWAT'){
        const approvedPresence=absenceRows.find(r=>
          r.email===email && r.mode==='KEBERADAAN' && r.status==='DILULUSKAN' &&
          r.startDate<=date && r.endDate>=date && r.endTime &&
          mins>=timeToMinutes_(r.endTime)
        )||null;
        if(approvedPresence){
          reviewedBy=normalizeEmail_(approvedPresence.reviewedBy||'');
          reviewerName=getReviewerNameFromEmail_(reviewedBy);
          reviewedAt=approvedPresence.reviewedAt||now;
          reviewStatus='DIAMBIL MAKLUM';
          comment=`Diambil maklum melalui Keberadaan ${approvedPresence.id}: ${approvedPresence.type}${approvedPresence.note?` — ${approvedPresence.note}`:''}`;
        }
      }
      toAppend.push([id,now,date,user.email,user.name,user.jobTitle||'',user.category,x.type,x.session,recordTime,x.ref,reviewStatus,reviewedBy,reviewerName,reviewedAt,comment]);
    });
  });
  if(toAppend.length){const sh=getTimeReviewSheet_();sh.getRange(sh.getLastRow()+1,1,toAppend.length,EK.TIME_REVIEW_HEADERS.length).setValues(toAppend);audit_('MIGRASI_SEMAKAN_WAKTU',`${from}..${to}`,`${toAppend.length} rekod semakan lama diwujudkan`,'SISTEM');}
  return toAppend.length;
}


function getTimeReviewData(token, fromDate, toDate) {
  requireSessionAdmin_(token);
  // Membuka Semakan Waktu juga membetulkan timezone Spreadsheet kepada MYT jika fail lama menggunakan locale/zona lain.
  ensureMalaysiaSpreadsheetTimeZone_();
  const today=todayKey_(), settings=getSettings_(), systemStartDate=getSystemStartDate_(settings);
  let from=validateDateKey_(fromDate||today);
  const to=validateDateKey_(toDate||today);
  if(to<from) throw new Error('Tarikh akhir tidak boleh sebelum tarikh mula.');
  if(to<systemStartDate) throw new Error(`Tiada data sistem sebelum ${systemStartDate}. Ubah SYSTEM_START_DATE di sheet TETAPAN jika perlu.`);
  from=clampToSystemStart_(from,settings);
  ensureTimeReviewRowsForRange_(from,to);
  const rows=readTimeReviewRows_().filter(r=>r.date>=from&&r.date<=to).map(publicTimeReview_).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));
  return {fromDate:from,toDate:to,rows};
}

function reviewTimeException(token,id,decision,comment) {
  const admin=requireSessionAdmin_(token);
  const rec=readTimeReviewRows_().find(r=>r.id===String(id||''));
  if(!rec) throw new Error('Rekod semakan waktu tidak dijumpai.');
  decision=String(decision||'').toUpperCase();
  if(!['DIAMBIL MAKLUM','DITOLAK'].includes(decision)) throw new Error('Keputusan tidak sah.');
  const now=new Date(); const sh=getTimeReviewSheet_();
  sh.getRange(rec.row,12,1,5).setValues([[decision,admin.email,admin.name,now,String(comment||'').trim()]]);
  audit_('SEMAK_WAKTU',rec.id,`${decision}; ${rec.type}; ${rec.date}; sesi=${rec.session}`,admin.email);
  return {ok:true,status:decision,reviewerName:admin.name,reviewedAt:formatDateTime_(now)};
}

function timeReviewStatementForCard_(reviews, flags) {
  flags=Array.isArray(flags)?flags:splitAttendanceFlags_(flags);
  if(!flags.length) return '';
  const relevant=(reviews||[]).filter(r=>flags.includes(String(r.type||'').toUpperCase()));
  if(relevant.some(r=>r.reviewStatus==='DITOLAK')) {
    const x=relevant.find(r=>r.reviewStatus==='DITOLAK'); return `DITOLAK - ${x.reviewerName||'PENTADBIR SISTEM'}`;
  }
  if(relevant.length && relevant.every(r=>r.reviewStatus==='DIAMBIL MAKLUM')) return 'Maklum - Pengetua';
  return 'Belum diambil Maklum';
}

function generatePdfReport_(title, headers, rows, fileName) {
  const doc=DocumentApp.create(fileName.replace(/\.pdf$/i,'')); const body=doc.getBody();
  setPdfLandscape_(body);
  body.appendParagraph(title).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(`Dijana: ${formatDateTime_(new Date())}`);
  const table=body.appendTable([headers].concat(rows.map(r=>r.map(v=>String(v==null?'':v)))));
  if(table.getNumRows()){const hr=table.getRow(0);for(let c=0;c<hr.getNumCells();c++)hr.getCell(c).editAsText().setBold(true);}
  doc.saveAndClose(); const f=DriveApp.getFileById(doc.getId()); const blob=f.getAs(MimeType.PDF).setName(fileName); f.setTrashed(true);
  return {fileName,mimeType:'application/pdf',base64:Utilities.base64Encode(blob.getBytes())};
}

function generateTimeReviewPdf(token, filters) {
  requireSessionAdmin_(token); filters=filters||{};
  const data=getTimeReviewData(token,filters.fromDate,filters.toDate);
  let rows=data.rows;
  if(filters.type) rows=rows.filter(r=>r.type===filters.type);
  if(filters.status) rows=rows.filter(r=>r.reviewStatus===filters.status);
  return generatePdfReport_(`Laporan Semakan Lewat / Balik Awal ${data.fromDate} hingga ${data.toDate}`,
    ['Tarikh','Nama','Jawatan','Jenis','Sesi','Rekod','Rujukan','Status Semakan','Pelulus','Ulasan'],
    rows.map(r=>[r.date,r.name,r.jobTitle,r.type,r.session,r.recordTime,r.referenceTime,r.reviewStatus,r.reviewerName||'',r.comment||'']),
    `Semakan_Waktu_${data.fromDate}_${data.toDate}.pdf`);
}


// ---------- Tidak Hadir / Permohonan kepada Pengetua ----------

function isManagementUser_(user) {
  return !!(user && (user.isAdmin || ['Pengurusan','Pentadbir'].includes(String(user.category || ''))));
}

function requireManagementUser_(token) {
  const user = requireSessionUser_(token);
  if (!isManagementUser_(user)) throw new Error('Fungsi ini hanya untuk Pengurusan atau Pentadbir Sistem.');
  return user;
}

function getAbsenceData(token) {
  const user = requireSessionUser_(token);
  const all = readAbsenceRows_();
  const today = todayKey_();
  const settings = getSettings_(), systemStartDate = getSystemStartDate_(settings);
  const ownFrom = clampToSystemStart_(addDaysKey_(today, -90), settings);
  const context = {settings:getSettings_(),users:getAllUsers_(),requests:all,attendanceValues:getAttendanceValuesInDateRange_(ownFrom,today)};
  const ownRequests = all.filter(r => r.email === user.email && r.endDate >= systemStartDate).sort((a,b) => b.submittedMs - a.submittedMs).map(r => {
    const x = publicAbsenceOwn_(r);
    if (x.startDate < systemStartDate) x.startDate = systemStartDate;
    return x;
  });
  const ownUnexplained = buildUnexplainedAbsenceEntries_(ownFrom, today, user.email, context).map(publicUnexplainedAbsenceOwn_);
  const own = ownRequests.concat(ownUnexplained).sort((a,b) => String(b.startDate||'').localeCompare(String(a.startDate||'')) || String(b.submittedAt||'').localeCompare(String(a.submittedAt||'')));

  return {types:EK.ABSENCE_TYPES.slice(),presenceTypes:EK.PRESENCE_TYPES.slice(),own,today,systemStartDate};
}

function getPublicAbsencePresenceData(token, fromDate, toDate) {
  requireSessionUser_(token); // Semua pengguna aktif yang telah log masuk boleh melihat senarai ini.
  const today = todayKey_(), settings = getSettings_(), systemStartDate = getSystemStartDate_(settings);
  let from = validateDateKey_(fromDate || today);
  const to = validateDateKey_(toDate || today);
  if (to < from) throw new Error('Tarikh akhir tidak boleh sebelum tarikh mula.');
  if (to < systemStartDate) throw new Error(`Tiada data sistem sebelum ${systemStartDate}. Ubah SYSTEM_START_DATE di sheet TETAPAN jika perlu.`);
  from = clampToSystemStart_(from, settings);
  if (daysBetweenKeys_(from, to) > 366) throw new Error('Tempoh senarai maksimum ialah 366 hari bagi satu carian.');

  const rawRequests = readAbsenceRows_();
  const attTo = to > today ? today : to;
  const context = {
    settings,
    users:getAllUsers_(),
    requests:rawRequests,
    attendanceValues:from <= attTo ? getAttendanceValuesInDateRange_(from, attTo) : []
  };

  const requested = rawRequests
    .filter(r => ['MENUNGGU','DILULUSKAN'].includes(r.status) && r.endDate >= from && r.startDate <= to)
    .map(r => publicAbsenceListItem_(r, from, to));
  const unexplained = buildUnexplainedAbsenceEntries_(from, to, '', context).map(r => publicAbsenceListItem_(r, from, to));
  const rows = requested.concat(unexplained).sort((a,b) =>
    String(a.startDate||'').localeCompare(String(b.startDate||'')) || String(a.name||'').localeCompare(String(b.name||''))
  );
  return {fromDate:from,toDate:to,today,systemStartDate,rows};
}

function publicAbsenceListItem_(r, fromDate, toDate) {
  let startDate = r.startDate || '';
  let endDate = r.endDate || startDate;
  if (fromDate && startDate < fromDate) startDate = fromDate;
  if (toDate && endDate > toDate) endDate = toDate;
  return {
    id:String(r.id||''),
    name:String(r.name||''),
    jobTitle:String(r.jobTitle||''),
    category:String(r.category||''),
    mode:String(r.mode||'TIDAK_HADIR') === 'KEBERADAAN' ? 'KEBERADAAN' : 'TIDAK_HADIR',
    type:String(r.type||'TIDAK HADIR'),
    startDate,
    endDate,
    startTime:normalizeOptionalTime_(r.startTime),
    endTime:normalizeOptionalTime_(r.endTime),
    status:String(r.status||'MENUNGGU')
  };
}

function filterPublicAbsencePresenceRows_(rows, filters) {
  filters = filters || {};
  const mode = String(filters.mode||'').trim().toUpperCase();
  const status = String(filters.status||'').trim().toUpperCase();
  const category = String(filters.category||'').trim();
  const search = String(filters.search||'').trim().toLowerCase();
  return (rows||[]).filter(r => {
    if (mode && r.mode !== mode) return false;
    if (status && String(r.status||'').toUpperCase() !== status) return false;
    if (category && r.category !== category) return false;
    if (search) {
      const hay = [r.name,r.jobTitle,r.category,r.mode,r.type,r.startDate,r.endDate,r.startTime,r.endTime,r.status].join(' ').toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

function generatePublicAbsencePresencePdf(token, filters) {
  requireSessionUser_(token);
  filters = filters || {};
  const data = getPublicAbsencePresenceData(token, filters.fromDate, filters.toDate);
  const rows = filterPublicAbsencePresenceRows_(data.rows, filters);
  const title = `Senarai Tidak Hadir / Keberadaan ${data.fromDate} hingga ${data.toDate}`;
  const result = generatePdfReport_(title,
    ['Nama','Jawatan','Kategori','Mod','Jenis','Tarikh / Tempoh','Masa','Status'],
    rows.map(r => [
      r.name,
      r.jobTitle||'',
      r.category||'',
      r.mode==='KEBERADAAN'?'Keberadaan':'Tidak Hadir',
      r.type||'',
      r.startDate===r.endDate?r.startDate:`${r.startDate} - ${r.endDate}`,
      r.mode==='KEBERADAAN'?`${r.startTime||'—'} - ${r.endTime||'—'}`:'—',
      r.status||''
    ]),
    `Senarai_Tidak_Hadir_Keberadaan_${data.fromDate}_${data.toDate}.pdf`);
  audit_('JANA_PDF_SENARAI_TIDAK_HADIR_KEBERADAAN', `${data.fromDate}_${data.toDate}`, `rekod=${rows.length}`);
  return result;
}

function submitAbsenceRequest(token, payload) {
  const user = requireSessionUser_(token); payload = payload || {};
  const mode = String(payload.mode || 'TIDAK_HADIR').toUpperCase() === 'KEBERADAAN' ? 'KEBERADAAN' : 'TIDAK_HADIR';
  const type = String(payload.type || '').trim().toUpperCase();
  const startDate = validateDateKey_(payload.startDate);
  const endDate = validateDateKey_(payload.endDate || payload.startDate);
  const systemStartDate = getSystemStartDate_();
  if (startDate < systemStartDate) throw new Error(`Permohonan sebelum tarikh mula sistem (${systemStartDate}) tidak diambil kira. Ubah SYSTEM_START_DATE di sheet TETAPAN jika perlu.`);
  const startTime = mode === 'KEBERADAAN' ? normalizeTime_(payload.startTime) : '';
  const endTime = mode === 'KEBERADAAN' ? normalizeTime_(payload.endTime) : '';
  const note = String(payload.note || '').trim();
  const validTypes = mode === 'KEBERADAAN' ? EK.PRESENCE_TYPES : EK.ABSENCE_TYPES;
  if (!validTypes.includes(type)) throw new Error(`Jenis ${mode === 'KEBERADAAN' ? 'keberadaan' : 'tidak hadir'} tidak sah.`);
  if (endDate < startDate) throw new Error('Tarikh akhir tidak boleh sebelum tarikh mula.');
  if (daysBetweenKeys_(startDate, endDate) > 60) throw new Error('Permohonan maksimum 60 hari bagi satu rekod.');
  if (mode === 'KEBERADAAN' && timeToMinutes_(endTime) <= timeToMinutes_(startTime)) throw new Error('Masa akhir Keberadaan mesti selepas masa mula.');

  const duplicate = readAbsenceRows_().find(r => {
    if (r.email !== user.email || ['DITOLAK','DIBATALKAN'].includes(r.status) || !dateRangesOverlap_(startDate,endDate,r.startDate,r.endDate)) return false;
    // Tidak Hadir blocks the whole day. Keberadaan may have more than one
    // separate window on the same day as long as the time windows do not overlap.
    if (mode !== 'KEBERADAAN' || r.mode !== 'KEBERADAAN') return true;
    return timeRangesOverlap_(startTime,endTime,r.startTime,r.endTime);
  });
  if (duplicate) throw new Error(`Terdapat rekod sedia ada yang bertindih (${duplicate.startDate} hingga ${duplicate.endDate}${duplicate.mode==='KEBERADAAN'?` · ${duplicate.startTime}-${duplicate.endTime}`:''}).`);

  const prefix = mode === 'KEBERADAAN' ? 'KB' : 'TH';
  const id = `${prefix}-${todayKey_().replace(/-/g,'')}-${Utilities.getUuid().slice(0,8).toUpperCase()}`;
  const now = new Date();
  getSheetOrThrow_(EK.SHEETS.ABSENCE).appendRow([
    id,now,user.email,user.name,user.category,type,startDate,endDate,note,'MENUNGGU','','','',now,mode,startTime,endTime,user.jobTitle||''
  ]);
  audit_('MOHON_TIDAK_HADIR_KEBERADAAN',id,`${mode}; ${type}; ${startDate} hingga ${endDate}; ${startTime||'-'}-${endTime||'-'}`,user.email);
  const request={id,email:user.email,name:user.name,jobTitle:user.jobTitle||'',category:user.category,type,mode,startDate,endDate,startTime,endTime,note};
  const emailNotice=notifyAbsenceSubmitted_(request);
  return {ok:true,id,emailNotified:!!emailNotice.ok,message:`Permohonan ${mode === 'KEBERADAAN' ? 'Keberadaan' : 'Tidak Hadir'} telah dihantar untuk semakan.${emailNotice.ok?' Pentadbir telah dimaklumkan melalui emel.':' Rekod disimpan walaupun notifikasi emel gagal.'}`};
}

function cancelMyAbsenceRequest(token, requestId) {
  const user = requireSessionUser_(token);
  const rec = findAbsenceById_(requestId);
  if (!rec || rec.email !== user.email) throw new Error('Permohonan tidak dijumpai.');
  if (rec.status !== 'MENUNGGU') throw new Error('Hanya permohonan yang masih MENUNGGU boleh dibatalkan sendiri.');
  const sh = getSheetOrThrow_(EK.SHEETS.ABSENCE);
  sh.getRange(rec.row, 10).setValue('DIBATALKAN');
  sh.getRange(rec.row, 14).setValue(new Date());
  audit_('BATAL_TIDAK_HADIR_KEBERADAAN', rec.id, 'Dibatalkan oleh pemohon', user.email);
  notifyAbsenceCancelled_(rec, user);
  return {ok:true};
}

function getAbsenceManagementData(token, fromDate, toDate) {
  const manager = requireManagementUser_(token);
  const today = todayKey_(), settings = getSettings_(), systemStartDate = getSystemStartDate_(settings);
  let from = validateDateKey_(fromDate || today);
  const to = validateDateKey_(toDate || today);
  if (to < from) throw new Error('Tarikh akhir tidak boleh sebelum tarikh mula.');
  if (to < systemStartDate) throw new Error(`Tiada data sistem sebelum ${systemStartDate}. Ubah SYSTEM_START_DATE di sheet TETAPAN jika perlu.`);
  from = clampToSystemStart_(from, settings);
  const rawRequests = readAbsenceRows_();
  const attTo=to>today?today:to; const context={settings,users:getAllUsers_(),requests:rawRequests,attendanceValues:from<=attTo?getAttendanceValuesInDateRange_(from,attTo):[]};
  const requests = rawRequests.filter(r=>r.endDate>=from&&r.startDate<=to).map(r=>{
    const x=publicAbsenceManagement_(r);
    if(x.startDate<from)x.startDate=from;
    if(x.endDate>to)x.endDate=to;
    return x;
  });
  const unexplained = buildUnexplainedAbsenceEntries_(from,to,'',context).map(publicUnexplainedAbsenceManagement_);
  return {manager:publicUser_(manager),types:EK.ABSENCE_TYPES.slice(),presenceTypes:EK.PRESENCE_TYPES.slice(),fromDate:from,toDate:to,
    requests:requests.concat(unexplained).sort((a,b)=>String(b.startDate||'').localeCompare(String(a.startDate||''))||String(b.submittedAt||'').localeCompare(String(a.submittedAt||'')))};
}

function reviewAbsenceRequest(token, requestId, decision, comment) {
  const manager=requireManagementUser_(token); const rec=findAbsenceById_(requestId);
  if(!rec) throw new Error('Permohonan tidak dijumpai.');
  decision=String(decision||'').toUpperCase(); if(!['DILULUSKAN','DITOLAK'].includes(decision)) throw new Error('Keputusan tidak sah.');
  if(rec.status!=='MENUNGGU') throw new Error('Permohonan ini telah diproses.'); comment=String(comment||'').trim();
  const sh=getSheetOrThrow_(EK.SHEETS.ABSENCE), now=new Date(); sh.getRange(rec.row,10,1,5).setValues([[decision,manager.email,now,comment,now]]);
  let conflicts=[]; let autoAcknowledgedLate=0;
  if(decision==='DILULUSKAN' && rec.mode!=='KEBERADAAN') {
    conflicts=applyApprovedAbsenceToAttendance_(rec,manager);
  } else if (decision==='DILULUSKAN' && rec.mode==='KEBERADAAN') {
    // Kelulusan Keberadaan juga memadai sebagai "Diambil Maklum" bagi
    // rekod LEWAT yang berlaku selepas waktu akhir Keberadaan.
    autoAcknowledgedLate=acknowledgeLateReviewsForApprovedPresence_(rec,manager);
  }
  audit_('SEMAK_TIDAK_HADIR_KEBERADAAN',rec.id,`${decision}; ${rec.mode}; ${rec.type}; ${rec.startDate}-${rec.endDate}; konflik=${conflicts.length}; semakanLewatAuto=${autoAcknowledgedLate}`,manager.email);
  const emailNotice=notifyAbsenceReviewed_(rec,decision,manager,comment);
  return {ok:true,status:decision,conflicts,autoAcknowledgedLate,emailNotified:!!emailNotice.ok&&!emailNotice.skipped};
}

function applyApprovedAbsenceToAttendance_(rec, manager) {
  if (rec.mode === 'KEBERADAAN') return [];
  const user=getUserByEmail_(rec.email,false); if(!user) return [];
  const settings=getSettings_(), systemStartDate=getSystemStartDate_(settings);
  if (rec.endDate < systemStartDate) return [];
  const effectiveStart = rec.startDate < systemStartDate ? systemStartDate : rec.startDate;
  const sh=getSheetOrThrow_(EK.SHEETS.ATTENDANCE), conflicts=[];
  dateKeysBetween_(effectiveStart,rec.endDate).forEach(dateKey=>{
    const existing=findAttendanceRecord_(dateKey,user.email), now=new Date(), reason=rec.type+(rec.note?` — ${rec.note}`:'');
    if(existing&&existing.values[4]){conflicts.push(dateKey);return;}
    if(!existing){ const v=Array(EK.ATT_HEADERS.length).fill(''); v[0]=dateKey;v[1]=user.email;v[2]=user.name;v[3]=user.category;v[14]='TIDAK HADIR';v[15]='TIDAK_HADIR';v[16]=manager.email;v[17]=reason;v[18]=now; sh.appendRow(v); }
    else { const v=padAttendanceValues_(existing.values);v[0]=dateKey;v[2]=user.name;v[3]=user.category;v[14]='TIDAK HADIR';v[15]='TIDAK_HADIR';v[16]=manager.email;v[17]=reason;v[18]=now;sh.getRange(existing.row,1,1,EK.ATT_HEADERS.length).setValues([v]); }
  });
  SpreadsheetApp.flush(); return conflicts;
}

function readAbsenceRows_() {
  const sh=getSheetOrThrow_(EK.SHEETS.ABSENCE); if(sh.getLastRow()<2)return [];
  const vals=sh.getRange(2,1,sh.getLastRow()-1,EK.ABSENCE_HEADERS.length).getValues();
  return vals.map((v,i)=>({row:i+2,id:String(v[0]||''),submittedAt:v[1]||'',submittedMs:dateValueMs_(v[1]),email:normalizeEmail_(v[2]),name:String(v[3]||''),category:String(v[4]||''),type:String(v[5]||''),startDate:dateCellToKey_(v[6]),endDate:dateCellToKey_(v[7]),note:String(v[8]||''),status:String(v[9]||'MENUNGGU'),reviewedBy:String(v[10]||''),reviewedAt:v[11]||'',comment:String(v[12]||''),updatedAt:v[13]||'',mode:String(v[14]||'TIDAK_HADIR').toUpperCase()==='KEBERADAAN'?'KEBERADAAN':'TIDAK_HADIR',startTime:normalizeOptionalTime_(v[15]),endTime:normalizeOptionalTime_(v[16]),jobTitle:String(v[17]||'')})).filter(r=>r.id);
}
function findAbsenceById_(id){return readAbsenceRows_().find(r=>r.id===String(id||'').trim())||null;}
function publicAbsenceOwn_(r){return {id:r.id,type:r.type,mode:r.mode,startDate:r.startDate,endDate:r.endDate,startTime:r.startTime,endTime:r.endTime,note:r.note,status:r.status,reviewedBy:r.reviewedBy,reviewedAt:r.reviewedAt?formatDateTime_(r.reviewedAt):'',comment:r.comment,submittedAt:r.submittedAt?formatDateTime_(r.submittedAt):''};}
function publicAbsenceManagement_(r){return {id:r.id,submittedAt:r.submittedAt?formatDateTime_(r.submittedAt):'',email:r.email,name:r.name,jobTitle:r.jobTitle||'',category:r.category,type:r.type,mode:r.mode,startDate:r.startDate,endDate:r.endDate,startTime:r.startTime,endTime:r.endTime,note:r.note,status:r.status,reviewedBy:r.reviewedBy,reviewedAt:r.reviewedAt?formatDateTime_(r.reviewedAt):'',comment:r.comment};}
function dateRangesOverlap_(a1,a2,b1,b2){return a1<=b2&&b1<=a2;}
function daysBetweenKeys_(a,b){return Math.round((new Date(b+'T00:00:00').getTime()-new Date(a+'T00:00:00').getTime())/86400000);}
function addDaysKey_(key,n){const d=new Date(key+'T00:00:00');d.setDate(d.getDate()+n);return Utilities.formatDate(d,tz_(),'yyyy-MM-dd');}
function dateKeysBetween_(a,b){const out=[];let cur=a;while(cur<=b&&out.length<366){out.push(cur);cur=addDaysKey_(cur,1);}return out;}

function generateAbsencePresencePdf(token, filters){
  requireManagementUser_(token);filters=filters||{};const data=getAbsenceManagementData(token,filters.fromDate,filters.toDate);let rows=data.requests;
  if(filters.mode)rows=rows.filter(r=>r.mode===filters.mode);if(filters.status)rows=rows.filter(r=>r.status===filters.status);if(filters.category)rows=rows.filter(r=>r.category===filters.category);
  return generatePdfReport_(`Semakan Tidak Hadir / Keberadaan ${data.fromDate} hingga ${data.toDate}`,
    ['Nama','Jawatan','Kategori','Mod','Jenis','Tarikh','Masa','Status','Disemak Oleh','Ulasan'],
    rows.map(r=>[r.name,r.jobTitle||'',r.category,r.mode==='KEBERADAAN'?'Keberadaan':'Tidak Hadir',r.type,r.startDate===r.endDate?r.startDate:`${r.startDate} - ${r.endDate}`,r.mode==='KEBERADAAN'?`${r.startTime} - ${r.endTime}`:'—',r.status,r.reviewedBy||'',r.comment||'']),
    `Semakan_Tidak_Hadir_Keberadaan_${data.fromDate}_${data.toDate}.pdf`);
}

function normalizeWorkingDays_(value) {
  const allowed = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const raw = String(value || '').toUpperCase().split(/[\s,;|]+/).map(x => x.trim()).filter(Boolean);
  const days = [...new Set(raw.filter(x => allowed.includes(x)))];
  if (!days.length) throw new Error('Hari bekerja tidak sah. Gunakan kod SUN,MON,TUE,WED,THU,FRI,SAT.');
  return allowed.filter(x => days.includes(x)).join(',');
}

function weekendLabelForDateKey_(dateKey, settings) {
  settings = settings || getSettings_();
  const d = new Date(String(dateKey) + 'T12:00:00');
  const day = d.getDay(); // 5=Jumaat, 6=Sabtu
  if (day !== 5 && day !== 6) return '';
  if (isWorkingDay_(dateKey, settings)) return '';
  return day === 5 ? 'JUMAAT' : 'SABTU';
}

function isWorkingDay_(dateKey, settings) {
  settings = settings || getSettings_();
  if (!isOnOrAfterSystemStart_(dateKey, settings)) return false;
  const codes = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const day = new Date(String(dateKey) + 'T12:00:00').getDay();
  const configured = String(settings.WORKING_DAYS || EK.DEFAULT_SETTINGS.WORKING_DAYS).toUpperCase().split(',').map(x => x.trim()).filter(Boolean);
  return configured.includes(codes[day]);
}

function findRelevantAbsenceForDate_(email, dateKey, rows, mode) {
  email = normalizeEmail_(email);
  const source = rows || readAbsenceRows_();
  const wanted = mode || '';
  return source.find(r => r.email === email && (!wanted || r.mode === wanted) && ['MENUNGGU','DILULUSKAN'].includes(r.status) && r.startDate <= dateKey && r.endDate >= dateKey) || null;
}

function findRelevantPresenceForDate_(email, dateKey, rows) {
  email = normalizeEmail_(email);
  const source = rows || readAbsenceRows_();
  return source.find(r =>
    r.email === email &&
    r.mode === 'KEBERADAAN' &&
    ['MENUNGGU','DILULUSKAN'].includes(r.status) &&
    r.startDate <= dateKey &&
    r.endDate >= dateKey
  ) || null;
}

function getPresenceRequestsForDate_(email, dateKey, rows) {
  email = normalizeEmail_(email);
  const source = rows || readAbsenceRows_();
  return source.filter(r =>
    r.email === email &&
    r.mode === 'KEBERADAAN' &&
    ['MENUNGGU','DILULUSKAN'].includes(r.status) &&
    r.startDate <= dateKey &&
    r.endDate >= dateKey &&
    r.startTime &&
    r.endTime
  ).sort((a,b) =>
    timeToMinutes_(a.startTime) - timeToMinutes_(b.startTime) ||
    timeToMinutes_(a.endTime) - timeToMinutes_(b.endTime)
  );
}

/**
 * Tarikh yang mempunyai Keberadaan menggunakan waktu tamat Keberadaan sebagai
 * deadline khas untuk punch pertama. ABSENT_AFTER biasa tidak digunakan.
 * Jika ada blok yang bersambung tepat pada waktu hujung/mula, ia dianggap satu
 * blok berterusan dan deadline ialah hujung blok tersebut.
 */
function getPresenceNoPunchDeadline_(email, dateKey, rows) {
  const list = getPresenceRequestsForDate_(email, dateKey, rows);
  if (!list.length) return null;

  const groups = [];
  list.forEach(r => {
    const start = timeToMinutes_(r.startTime);
    const end = timeToMinutes_(r.endTime);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return;
    const last = groups[groups.length - 1];
    if (last && start <= last.endMinutes) {
      last.endMinutes = Math.max(last.endMinutes, end);
      last.requests.push(r);
    } else {
      groups.push({startMinutes:start, endMinutes:end, requests:[r]});
    }
  });
  if (!groups.length) return null;

  const g = groups[0];
  return {
    endMinutes: g.endMinutes,
    endTime: `${String(Math.floor(g.endMinutes/60)).padStart(2,'0')}:${String(g.endMinutes%60).padStart(2,'0')}`,
    requests: g.requests,
    primary: g.requests[0]
  };
}

function presenceRequestReason_(request, prefix) {
  if (!request) return '';
  const parts = [];
  if (prefix) parts.push(prefix);
  parts.push(`KEBERADAAN: ${request.type || 'Keberadaan'}`);
  if (request.startTime || request.endTime) parts.push(`${request.startTime || '—'}-${request.endTime || '—'}`);
  if (request.note) parts.push(request.note);
  if (request.status === 'MENUNGGU') parts.push('MENUNGGU KELULUSAN');
  return parts.join(' — ');
}

function mergeAttendanceReason_(current, extra) {
  current = String(current || '').trim();
  extra = String(extra || '').trim();
  if (!extra) return current;
  if (!current) return extra;
  if (current.toUpperCase().includes(extra.toUpperCase())) return current;
  return `${current} | ${extra}`;
}

function getReviewerNameFromEmail_(email) {
  const em = normalizeEmail_(email);
  const u = em ? getUserByEmail_(em, false) : null;
  return u ? (u.name || u.email) : (email || 'Pengetua');
}

function autoAcknowledgeTimeReviewFromPresence_(review, presence, actor) {
  if (!review || !presence || review.type !== 'LEWAT' || presence.status !== 'DILULUSKAN') return review;
  if (review.reviewStatus && review.reviewStatus !== 'BELUM DIAMBIL MAKLUM') return review;
  const recordMins = timeToMinutes_(review.recordTime || '');
  const endMins = timeToMinutes_(presence.endTime || '');
  // Keberadaan hanya mengesahkan kelewatan yang berlaku selepas waktu
  // pegawai sepatutnya kembali daripada tempoh Keberadaan.
  if (!Number.isFinite(recordMins) || !Number.isFinite(endMins) || recordMins < endMins) return review;

  const reviewerEmail = normalizeEmail_((actor && actor.email) || presence.reviewedBy || '');
  const reviewerName = (actor && actor.name) || getReviewerNameFromEmail_(reviewerEmail);
  const now = new Date();
  const comment = `Diambil maklum melalui Keberadaan ${presence.id}: ${presence.type}${presence.note ? ` — ${presence.note}` : ''}`;
  const sh = getTimeReviewSheet_();
  sh.getRange(review.row, 12, 1, 5).setValues([['DIAMBIL MAKLUM', reviewerEmail, reviewerName, now, comment]]);
  audit_('SEMAK_WAKTU_AUTO_KEBERADAAN', review.id, `${presence.id}; ${presence.type}; ${review.recordTime} selepas ${presence.endTime}`, reviewerEmail || 'SISTEM');
  return Object.assign({}, review, {
    reviewStatus:'DIAMBIL MAKLUM',
    reviewedBy:reviewerEmail,
    reviewerName,
    reviewedAt:now,
    comment,
    autoAcknowledged:true
  });
}

function acknowledgeLateReviewsForApprovedPresence_(presence, actor) {
  if (!presence || presence.mode !== 'KEBERADAAN') return 0;
  const approved = Object.assign({}, presence, {
    status:'DILULUSKAN',
    reviewedBy:(actor && actor.email) || presence.reviewedBy || ''
  });
  let count = 0;
  readTimeReviewRows_().forEach(r => {
    if (
      r.email !== approved.email ||
      r.type !== 'LEWAT' ||
      r.reviewStatus !== 'BELUM DIAMBIL MAKLUM' ||
      r.date < approved.startDate ||
      r.date > approved.endDate
    ) return;
    const updated = autoAcknowledgeTimeReviewFromPresence_(r, approved, actor);
    if (updated && updated.autoAcknowledged) count++;
  });
  return count;
}

function timeRangesOverlap_(aStart,aEnd,bStart,bEnd){
  if(!aStart||!aEnd||!bStart||!bEnd)return true;
  return timeToMinutes_(aStart)<timeToMinutes_(bEnd) && timeToMinutes_(bStart)<timeToMinutes_(aEnd);
}

function findPresenceBlockAt_(email,dateKey,timeValue,rows){
  email=normalizeEmail_(email); dateKey=validateDateKey_(dateKey); const t=normalizeTime_(timeValue);
  const mins=timeToMinutes_(t), source=rows||readAbsenceRows_();
  return source.find(r=>r.email===email&&r.mode==='KEBERADAAN'&&['MENUNGGU','DILULUSKAN'].includes(r.status)&&r.startDate<=dateKey&&r.endDate>=dateKey&&r.startTime&&r.endTime&&mins>=timeToMinutes_(r.startTime)&&mins<timeToMinutes_(r.endTime))||null;
}

// API ready for any current/future relief-class (guru ganti) workflow.
// A Keberadaan window means the staff member has declared that they are not
// available / not present during that exact period, so they must not receive
// a replacement-class assignment inside the window.
function checkUserAvailabilityForClass(token,email,dateKey,timeValue){
  requireManagementUser_(token); const user=getUserByEmail_(email,true); if(!user)throw new Error('Pengguna tidak dijumpai / tidak aktif.');
  const block=findPresenceBlockAt_(user.email,dateKey,timeValue);
  return {available:!block,email:user.email,name:user.name,jobTitle:user.jobTitle||'',date:validateDateKey_(dateKey),time:normalizeTime_(timeValue),block:block?publicAbsenceManagement_(block):null};
}

/**
 * Menjana senarai ketidakhadiran yang tiada permohonan/penjelasan.
 * Tidak menulis ke Google Sheet; sesuai untuk paparan dinamik.
 */
function fastStableKey_(value) {
  // Lightweight deterministic FNV-1a style hash for synthetic UI IDs.
  let h = 2166136261 >>> 0;
  const str = String(value || '');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(36).toUpperCase();
}

function buildUnexplainedAbsenceEntries_(fromKey, toKey, emailFilter, context) {
  context = context || {};
  const settings = context.settings || getSettings_();
  const systemStartDate = getSystemStartDate_(settings);
  fromKey = clampToSystemStart_(fromKey, settings);
  toKey = validateDateKey_(toKey);
  if (toKey < systemStartDate) return [];
  const today = todayKey_();
  const nowMins = minutesNow_(new Date());
  const absentMins = timeToMinutes_(settings.ABSENT_AFTER);
  const maxTo = toKey > today ? today : toKey;
  if (fromKey > maxTo) return [];
  const users = (context.users || getAllUsers_()).filter(u => u.active && (!emailFilter || u.email === normalizeEmail_(emailFilter)));
  if (!users.length) return [];
  const requests = context.requests || readAbsenceRows_();
  const requestsByEmail = {};
  const presenceByEmail = {};
  requests.forEach(r => {
    if (!['MENUNGGU','DILULUSKAN'].includes(r.status)) return;
    if (r.mode === 'KEBERADAAN') {
      (presenceByEmail[r.email] || (presenceByEmail[r.email] = [])).push(r);
      return;
    }
    (requestsByEmail[r.email] || (requestsByEmail[r.email] = [])).push(r);
  });
  const attendanceMap = {};
  const attendanceValues = context.attendanceValues || getAttendanceValuesInDateRange_(fromKey, maxTo);
  attendanceValues.forEach(v => {
    const dk = dateCellToKey_(v[0]);
    const em = normalizeEmail_(v[1]);
    if (dk >= fromKey && dk <= maxTo && em) attendanceMap[`${dk}|${em}`] = v;
  });

  const userKeys = {};
  users.forEach(u => userKeys[u.email] = fastStableKey_(u.email).slice(0,8));
  const out = [];
  dateKeysBetween_(fromKey, maxTo).forEach(dateKey => {
    if (!isWorkingDay_(dateKey, settings)) return;
    const due = dateKey < today || (dateKey === today && nowMins >= absentMins);
    if (!due) return;
    users.forEach(u => {
      const req = (requestsByEmail[u.email] || []).find(r => r.startDate <= dateKey && r.endDate >= dateKey) || null;
      if (req) return;
      const presenceReq = (presenceByEmail[u.email] || []).find(r => r.startDate <= dateKey && r.endDate >= dateKey) || null;
      // Keberadaan aktif bukan "TIDAK MOHON". Selagi alert tamat Keberadaan
      // belum berjaya difinalkan, pengguna kekal Belum Hadir dan tidak muncul
      // dalam senarai Tiada Penjelasan.
      if (presenceReq) return;
      const v = attendanceMap[`${dateKey}|${u.email}`];
      if (v && v[4]) return;
      if (v && String(v[14] || '').toUpperCase() === 'TIDAK HADIR' && String(v[17] || '').trim() && String(v[17] || '').toUpperCase() !== 'TIADA PENJELASAN') return;
      out.push({
        id: `NM-${dateKey.replace(/-/g,'')}-${userKeys[u.email]}`,
        submittedAt: dateKey,
        email: u.email,
        name: u.name,
        category: u.category,
        jobTitle: u.jobTitle || '',
        mode: 'TIDAK_HADIR',
        type: 'TIADA PENJELASAN',
        startDate: dateKey,
        endDate: dateKey,
        note: 'Tiada permohonan / penjelasan direkodkan.',
        status: 'TIDAK MOHON',
        reviewedBy: '', reviewedAt: '', comment: '', synthetic: true
      });
    });
  });
  return out;
}

function publicUnexplainedAbsenceOwn_(r) {
  return {id:r.id,type:'TIADA PENJELASAN',mode:'TIDAK_HADIR',startDate:r.startDate,endDate:r.endDate,startTime:'',endTime:'',note:r.note,status:'TIDAK MOHON',reviewedBy:'',reviewedAt:'',comment:'Tiada penjelasan',submittedAt:r.startDate,synthetic:true};
}

function publicUnexplainedAbsenceManagement_(r) {
  return {id:r.id,submittedAt:r.startDate,email:r.email,name:r.name,jobTitle:r.jobTitle||'',category:r.category,mode:'TIDAK_HADIR',type:'TIADA PENJELASAN',startDate:r.startDate,endDate:r.endDate,note:r.note,status:'TIDAK MOHON',reviewedBy:'',reviewedAt:'',comment:'',synthetic:true};
}

/**
 * Hantar amaran khusus kepada Pengurusan apabila waktu akhir Keberadaan telah
 * berlalu tetapi pengguna masih belum mempunyai Punch Masuk.
 */
function notifyPresenceNoPunchManagement_(user, dateKey, deadlineInfo) {
  const recipients = getNotificationAdminEmails_();
  const request = deadlineInfo && deadlineInfo.primary ? deadlineInfo.primary : null;
  const webUrl = getWebAppUrl_();
  const subject = `PERHATIAN: Tamat Keberadaan tanpa Punch Masuk — ${user.name} (${dateKey})`;
  const requestLines = (deadlineInfo && deadlineInfo.requests ? deadlineInfo.requests : [])
    .map(r => [
      escapeHtml_(r.id || ''),
      escapeHtml_(r.type || ''),
      `${escapeHtml_(r.startTime || '—')}-${escapeHtml_(r.endTime || '—')}`,
      r.note ? escapeHtml_(r.note) : ''
    ].filter(Boolean).join(' · '))
    .join('<br>');
  const html = emailFrame_(
    'Tamat Keberadaan — Punch Masuk belum direkod',
    `<p>Waktu akhir Keberadaan telah berlalu tetapi sistem masih belum mengesan <b>Punch Masuk</b> bagi pegawai berikut.</p>
     ${detailTable_([
       ['Nama', user.name || user.email],
       ['Jawatan', user.jobTitle || '—'],
       ['Emel', user.email],
       ['Kategori', user.category || '—'],
       ['Tarikh', dateKey],
       ['Waktu akhir Keberadaan', deadlineInfo ? deadlineInfo.endTime : '—'],
       ['Status permohonan', request ? request.status : '—']
     ])}
     ${requestLines ? `<p><b>Catatan Keberadaan:</b><br>${requestLines}</p>` : ''}
     <p><b>Tindakan sistem:</b> selepas emel ini berjaya dihantar, rekod akan ditandakan <b>TIDAK HADIR</b>. Jika pegawai kemudian Punch Masuk pada hari yang sama, rekod akan kembali mengikut punch sebenar dan status <b>LEWAT</b> akan kekal jika berkenaan.</p>
     ${webUrl ? `<p style="margin:24px 0"><a href="${escapeHtml_(webUrl)}" style="display:inline-block;background:#0B57D0;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Buka e-Keberadaan</a></p>` : ''}`
  );
  const text = [
    'Tamat Keberadaan — Punch Masuk belum direkod',
    `Nama: ${user.name || user.email}`,
    `Emel: ${user.email}`,
    `Tarikh: ${dateKey}`,
    `Waktu akhir Keberadaan: ${deadlineInfo ? deadlineInfo.endTime : '-'}`,
    request ? `Keberadaan: ${request.type} (${request.startTime || '-'}-${request.endTime || '-'})` : '',
    request && request.note ? `Catatan: ${request.note}` : '',
    '',
    'Selepas amaran ini berjaya dihantar, sistem menandakan TIDAK HADIR. Punch Masuk yang dibuat kemudian pada hari sama akan menggantikan status automatik dan status LEWAT tetap dikekalkan jika berkenaan.',
    webUrl ? `Buka: ${webUrl}` : ''
  ].filter(Boolean).join('\n');
  return safeSendSystemEmail_(recipients, subject, html, text, `KEBERADAAN_NO_PUNCH:${dateKey}:${user.email}`);
}

/**
 * Proses deadline khas Keberadaan. Fungsi ini ialah satu-satunya laluan yang
 * boleh menukar pengguna Keberadaan tanpa punch kepada TIDAK HADIR:
 * 1) tunggu waktu akhir Keberadaan;
 * 2) hantar emel Pengurusan;
 * 3) hanya selepas emel berjaya, tulis TIDAK HADIR.
 */
function finalizeExpiredPresenceWithoutPunchForDate_(dateKey, settings, options) {
  options = options || {};
  settings = settings || getSettings_();
  dateKey = validateDateKey_(dateKey);
  if (!isWorkingDay_(dateKey, settings)) return {ok:true,skipped:true,reason:'Bukan hari bekerja',alerted:0,finalized:0,failed:[]};

  const today = todayKey_();
  if (dateKey > today) return {ok:true,skipped:true,reason:'Tarikh masa hadapan',alerted:0,finalized:0,failed:[]};
  const now = new Date();
  const nowMins = dateKey < today ? 24 * 60 : minutesNow_(now);
  const requests = readAbsenceRows_();
  const users = getAllUsers_().filter(u => u.active);
  const failed = [];
  let alerted = 0, finalized = 0, skippedPunch = 0;

  users.forEach(user => {
    const deadline = getPresenceNoPunchDeadline_(user.email, dateKey, requests);
    if (!deadline || nowMins < deadline.endMinutes) return;

    let rec = findAttendanceRecord_(dateKey, user.email);
    if (rec && rec.values[4]) { skippedPunch++; return; }
    if (rec && String(rec.values[14] || '').toUpperCase() === 'TIDAK HADIR') return;

    // Amaran mesti berjaya dahulu. Jika gagal, status kekal Belum Hadir dan
    // trigger seterusnya akan cuba semula.
    const mail = notifyPresenceNoPunchManagement_(user, dateKey, deadline);
    if (!mail.ok) {
      failed.push({email:user.email,error:mail.error || 'Gagal menghantar emel'});
      audit_('KEBERADAAN_TAMAT_ALERT_GAGAL', `${dateKey}|${user.email}`, mail.error || 'Gagal menghantar emel', 'SISTEM');
      return;
    }
    alerted++;

    // Re-check selepas emel kerana pengguna mungkin punch ketika emel sedang
    // dihantar. Jika sudah punch, jangan tulis TIDAK HADIR.
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      rec = findAttendanceRecord_(dateKey, user.email);
      if (rec && rec.values[4]) {
        skippedPunch++;
        audit_('KEBERADAAN_ALERT_TANPA_FINAL', `${dateKey}|${user.email}`, 'Emel telah dihantar tetapi pengguna Punch Masuk sebelum status difinalkan.', 'SISTEM');
        return;
      }
      if (rec && String(rec.values[14] || '').toUpperCase() === 'TIDAK HADIR') return;

      const primary = deadline.primary;
      const reason = presenceRequestReason_(primary, 'TAMAT KEBERADAAN TANPA PUNCH MASUK') +
        ` — Pengurusan dimaklumkan ${formatDateTime_(new Date())}`;
      const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
      const v = rec ? padAttendanceValues_(rec.values) : Array(EK.ATT_HEADERS.length).fill('');
      v[0] = dateKey;
      v[1] = user.email;
      v[2] = user.name;
      v[3] = user.category;
      v[14] = 'TIDAK HADIR';
      v[15] = 'AUTO_KEBERADAAN_TIDAK_HADIR';
      v[16] = 'SISTEM';
      v[17] = mergeAttendanceReason_(v[17], reason);
      v[18] = new Date();
      if (rec) sh.getRange(rec.row,1,1,EK.ATT_HEADERS.length).setValues([v]);
      else sh.appendRow(v);
      finalized++;
      audit_('FINAL_KEBERADAAN_TANPA_PUNCH', `${dateKey}|${user.email}`, `${primary ? primary.id : ''}; deadline=${deadline.endTime}; emel=${(mail.recipients || []).join(',')}`, 'SISTEM');
    } finally {
      lock.releaseLock();
    }
  });

  if (finalized) SpreadsheetApp.flush();
  return {ok:true,skipped:false,date:dateKey,alerted,finalized,skippedPunch,failed};
}

function checkExpiredPresenceWithoutPunchTrigger() {
  try {
    const settings = getSettings_();
    if (String(settings.SYSTEM_MODE || 'REAL').toUpperCase() === 'TEST') {
      return {ok:true,skipped:true,reason:'MOD TEST'};
    }
    return finalizeExpiredPresenceWithoutPunchForDate_(todayKey_(), settings);
  } catch (err) {
    audit_('TRIGGER_KEBERADAAN_TAMAT_GAGAL', todayKey_(), String(err && err.message ? err.message : err), 'SISTEM');
    return {ok:false,error:String(err && err.message ? err.message : err)};
  }
}

/**
 * Finalkan tarikh lalu ke KEHADIRAN supaya laporan/punch card mempunyai rekod fizikal.
 * Pengguna dengan Keberadaan aktif TIDAK menggunakan ABSENT_AFTER. Mereka hanya
 * difinalkan selepas waktu akhir Keberadaan dan selepas emel Pengurusan berjaya.
 */
function finalizeMissingAttendanceForDate_(dateKey, settings) {
  settings = settings || getSettings_();
  if (!isWorkingDay_(dateKey, settings)) return {ok:true, skipped:true, reason:'Bukan hari bekerja', created:0};
  const today = todayKey_();
  if (dateKey >= today) return {ok:true, skipped:true, reason:'Hanya tarikh lalu boleh difinalkan', created:0};

  // Cuba finalkan kes Keberadaan dahulu. Jika emel gagal, mereka kekal
  // Belum Hadir dan tidak akan jatuh ke laluan AUTO_TIDAK_HADIR biasa.
  const presenceResult = finalizeExpiredPresenceWithoutPunchForDate_(dateKey, settings, {pastDate:true});
  const users = getAllUsers_().filter(u => u.active);
  const requests = readAbsenceRows_();
  const existing = getAttendanceByDate_(dateKey);
  const byEmail = {};
  existing.forEach(r => byEmail[r.email] = r);
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
  const now = new Date();
  const rowsToCreate = [];
  users.forEach(u => {
    const rec = byEmail[u.email];
    if (rec && (rec.values[4] || String(rec.values[14] || '').toUpperCase() === 'TIDAK HADIR')) return;
    if (findRelevantAbsenceForDate_(u.email, dateKey, requests, 'TIDAK_HADIR')) return;
    // Apa-apa Keberadaan aktif untuk tarikh ini dikecualikan daripada
    // AUTO_TIDAK_HADIR biasa, walaupun alert emel gagal.
    if (findRelevantPresenceForDate_(u.email, dateKey, requests)) return;
    const v=Array(EK.ATT_HEADERS.length).fill('');
    v[0]=dateKey;v[1]=u.email;v[2]=u.name;v[3]=u.category;v[14]='TIDAK HADIR';
    v[15]='AUTO_TIDAK_HADIR';v[16]='SISTEM';v[17]='TIADA PENJELASAN';v[18]=now;
    rowsToCreate.push(v);
  });
  const created = rowsToCreate.length;
  if (created) {
    sh.getRange(sh.getLastRow() + 1, 1, created, EK.ATT_HEADERS.length).setValues(rowsToCreate);
    SpreadsheetApp.flush();
    audit_('FINAL_TIDAK_HADIR_AUTO', dateKey, `${created} rekod tanpa waktu masuk ditanda TIADA PENJELASAN`, 'SISTEM');
  }
  return {ok:true,created,presence:presenceResult};
}


// ---------- Profile photos from Google Drive ----------

function getProfilePhoto(token, email) {
  const viewer = requireSessionUser_(token);
  const targetEmail = normalizeEmail_(email || viewer.email);
  if (targetEmail !== viewer.email && !isManagementUser_(viewer)) throw new Error('Akses gambar profil tidak dibenarkan.');
  const target = getUserByEmail_(targetEmail, false);
  if (!target || !target.profilePhotoFileId) return {ok:true,dataUrl:''};
  try {
    const file = DriveApp.getFileById(target.profilePhotoFileId);
    const blob = file.getBlob();
    const mime = blob.getContentType() || 'image/png';
    const dataUrl = `data:${mime};base64,${Utilities.base64Encode(blob.getBytes())}`;
    return {ok:true,dataUrl};
  } catch (e) {
    return {ok:true,dataUrl:'',error:'Gambar profil tidak dapat dibaca. Jalankan sync semula.'};
  }
}

function adminSyncProfilePhotos(token) {
  const admin = requireSessionAdmin_(token);
  const result = syncProfilePhotosFromDrive_();
  audit_('SYNC_GAMBAR_PROFIL', EK.SHEETS.USERS, `Padan=${result.matched}; tiada=${result.unmatched.length}`, admin.email);
  return Object.assign({ok:true}, result);
}

function syncProfilePhotosFromMenu() {
  const admin = requireGoogleAdmin_();
  const result = syncProfilePhotosFromDrive_();
  audit_('SYNC_GAMBAR_PROFIL', EK.SHEETS.USERS, `Menu Sheet; padan=${result.matched}; tiada=${result.unmatched.length}`, admin.email);
  SpreadsheetApp.getUi().alert('Sync gambar profil', `Berjaya dipadankan: ${result.matched}\nTidak dijumpai: ${result.unmatched.length}${result.unmatched.length ? '\n\n' + result.unmatched.slice(0,15).join('\n') : ''}`, SpreadsheetApp.getUi().ButtonSet.OK);
}

function syncProfilePhotosFromDrive_() {
  const settings = getSettings_();
  const rootId = String(settings.PROFILE_ROOT_FOLDER_ID || '').trim();
  if (!rootId) throw new Error('PROFILE_ROOT_FOLDER_ID belum ditetapkan.');
  const root = DriveApp.getFolderById(rootId);
  const categoryNames = {Pengurusan:'01 - Pengurusan', Pentadbir:'01 - Pengurusan', PPP:'02 - Guru', AKP:'03 - Anggota Kumpulan Pelaksana'};
  const categoryFolders = {};
  Object.keys(categoryNames).forEach(cat => {
    const it = root.getFoldersByName(categoryNames[cat]);
    if (it.hasNext()) categoryFolders[cat] = it.next();
  });
  const users = getAllUsers_();
  const sh = getSheetOrThrow_(EK.SHEETS.USERS);
  const photoRows = sh.getLastRow() >= 2 ? sh.getRange(2, 17, sh.getLastRow() - 1, 2).getValues() : [];
  let matched = 0;
  const unmatched = [];
  const folderMaps = {};

  Object.keys(categoryFolders).forEach(cat => {
    const map = {};
    const it = categoryFolders[cat].getFolders();
    while (it.hasNext()) { const f = it.next(); map[normalizeNameKey_(f.getName())] = f; }
    folderMaps[cat] = map;
  });

  users.forEach(u => {
    const map = folderMaps[u.category];
    const folder = map && map[normalizeNameKey_(u.name)];
    if (!folder) { unmatched.push(`${u.name} (${u.category})`); return; }
    let found = null;
    const files = folder.getFiles();
    while (files.hasNext()) {
      const f = files.next();
      if (String(f.getName() || '').toLowerCase() === 'eoperasi.png') { found = f; break; }
    }
    if (!found) { unmatched.push(`${u.name} — eoperasi.png tiada`); return; }
    const idx = u.row - 2;
    if (idx >= 0 && idx < photoRows.length) photoRows[idx] = [found.getId(), new Date()];
    matched++;
  });
  if (matched && photoRows.length) {
    sh.getRange(2, 17, photoRows.length, 2).setValues(photoRows);
    sh.getRange(2, 18, photoRows.length, 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
  }
  invalidateUsersCache_();
  SpreadsheetApp.flush();
  return {matched, unmatched, rootFolderId:rootId};
}

function normalizeNameKey_(name) { return String(name || '').trim().toLowerCase().replace(/\s+/g,' '); }

// ---------- Utilities ----------

function getSpreadsheet_() {
  if (!EK_RUNTIME_SS_) EK_RUNTIME_SS_ = SpreadsheetApp.getActive();
  return EK_RUNTIME_SS_;
}

function ensureMalaysiaSpreadsheetTimeZone_() {
  try {
    const ss = getSpreadsheet_();
    if (ss.getSpreadsheetTimeZone() !== EK.TIMEZONE) ss.setSpreadsheetTimeZone(EK.TIMEZONE);
  } catch (e) {}
}

function getSheetOrThrow_(name) {
  if (EK_RUNTIME_SHEETS_[name]) return EK_RUNTIME_SHEETS_[name];
  const sh = getSpreadsheet_().getSheetByName(name);
  if (!sh) throw new Error(`Helaian ${name} belum wujud. Jalankan setupSystem() dahulu.`);
  EK_RUNTIME_SHEETS_[name] = sh;
  return sh;
}

function audit_(action, target, details, actorEmail) {
  try {
    const sh = getSheetOrThrow_(EK.SHEETS.AUDIT);
    const actor = normalizeEmail_(actorEmail) || normalizeEmail_(Session.getActiveUser().getEmail()) || 'SYSTEM';
    sh.appendRow([new Date(), actor, action, target || '', details || '']);
  } catch (e) {}
}

function dateCellToKey_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, tz_(), 'yyyy-MM-dd');
  }
  const s = String(value == null ? '' : value).trim();
  if (!s) return '';
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${String(dmy[2]).padStart(2, '0')}-${String(dmy[1]).padStart(2, '0')}`;
  return s;
}

function normalizeEmail_(v) { return String(v || '').trim().toLowerCase(); }
function isValidEmail_(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function toBool_(v) { return v === true || String(v).toLowerCase() === 'true' || String(v) === '1' || String(v).toLowerCase() === 'ya'; }
function tz_() {
  // Jangan bergantung pada zon waktu project/browser; seluruh sistem rasmi menggunakan Malaysia Time.
  if (!EK_RUNTIME_TZ_) EK_RUNTIME_TZ_ = EK.TIMEZONE;
  return EK_RUNTIME_TZ_;
}
function todayKey_() { return Utilities.formatDate(new Date(), tz_(), 'yyyy-MM-dd'); }
function formatDateTime_(d) { return Utilities.formatDate(new Date(d), tz_(), 'dd/MM/yyyy HH:mm:ss'); }
function formatTime_(d) { return Utilities.formatDate(new Date(d), tz_(), 'HH:mm:ss'); }
function displayMalaysiaTime_(v) {
  if (v === '' || v == null) return '';
  if (v instanceof Date && !isNaN(v.getTime())) return Utilities.formatDate(v, tz_(), 'HH:mm');
  const s = String(v).trim();
  if (!s) return '';
  const exact = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (exact) return `${String(Number(exact[1])).padStart(2,'0')}:${exact[2]}`;
  // Legacy Sheets may return a full Date string containing a timezone label from another locale.
  // Convert it to MYT where possible; otherwise extract only HH:mm and never expose that label to UI/PDF.
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) return Utilities.formatDate(parsed, tz_(), 'HH:mm');
  const embedded = s.match(/(?:^|\s)(\d{1,2}):(\d{2})(?::\d{2})?(?:\s|$|GMT)/i);
  return embedded ? `${String(Number(embedded[1])).padStart(2,'0')}:${embedded[2]}` : s.replace(/\s*GMT[^)]*(?:\([^)]*\))?/ig,'').trim();
}
function minutesNow_(d) { const p = Utilities.formatDate(d, tz_(), 'HH:mm').split(':'); return Number(p[0]) * 60 + Number(p[1]); }

function timeToMinutes_(v) {
  const t = normalizeTime_(v);
  const p = t.split(':').map(Number);
  return p[0] * 60 + p[1];
}

function normalizeTime_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, tz_(), 'HH:mm');
  const s = String(v || '').trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!m) throw new Error(`Format waktu tidak sah: ${s || '(kosong)'}. Guna HH:mm.`);
  const h = Number(m[1]), min = Number(m[2]);
  if (h > 23 || min > 59) throw new Error(`Waktu tidak sah: ${s}`);
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function normalizeOptionalTime_(v) {
  if (v === '' || v == null) return '';
  return normalizeTime_(v);
}

function validateDateKey_(v) {
  const s = String(v || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error('Tarikh mesti dalam format YYYY-MM-DD.');
  const d = new Date(`${s}T00:00:00`);
  if (isNaN(d.getTime())) throw new Error('Tarikh tidak sah.');
  return s;
}

function dateAndTime_(dateKey, time) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [hh, mm] = normalizeTime_(time).split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}
