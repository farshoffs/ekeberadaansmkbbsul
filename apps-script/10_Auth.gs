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
 * v12 menggunakan PIN 6 digit + trusted session 7 hari.
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
      'Setup PIN terus dimulakan',
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
  audit_('LOGIN_APLIKASI', user.email, `PIN e-Keberadaan; trusted device ${EK.SESSION.REMEMBER_DAYS} hari; DeviceID=${trusted.deviceId}`, user.email);
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
  const ci = normalizeClientInfo_(clientInfo || {userAgent:data.ua,platform:data.pf,timezone:data.tz});
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

  let trusted;
  if (session.d) {
    // A DeviceID-bearing access token may only be renewed when the caller also
    // proves possession of the trusted-device secret. A stolen access token
    // cannot bootstrap itself into a new 7-day trusted device.
    if (!deviceCredential) {
      throw new Error('Sesi peranti memerlukan trusted device. Sila log masuk semula.');
    }
    trusted = verifyTrustedDeviceCredential_(deviceCredential, user.email, session.d);
    touchTrustedDevice_(trusted, ci, true);
    trusted.credential = String(deviceCredential || '').trim();
  } else {
    // Legacy migration only: old signed tokens without DeviceID may create or
    // refresh a trusted-device record once while the legacy token is valid.
    trusted = registerOrRefreshTrustedDevice_(user, ci, deviceCredential);
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
  const displaySchedule = Object.assign({}, effective);
  if (rec) displaySchedule.s1Out = getPunchReferenceTime_('OUT',1,effective,user,settings,today,rec.values) || effective.s1Out;
  let locationReady = true;
  if (String(settings.SYSTEM_MODE || 'REAL').toUpperCase() !== 'TEST') {
    try { validateLocationSettings_(settings); } catch (e) { locationReady = false; }
  }

  return {
    today,
    now: formatDateTime_(new Date()),
    user: Object.assign(publicUser_(user), {canManageAbsence: isManagementUser_(user)}),
    schedule: displaySchedule,
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
  // Access tokens stay short-lived even when the device is remembered.
  // "remember" only grants silent renewal through the separate trusted-device
  // credential, whose rolling lifetime is controlled by REMEMBER_DAYS.
  const ttl = Math.max(1, Number(EK.SESSION.NORMAL_HOURS || 12)) * 60 * 60 * 1000;
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

const EK_SESSION_SECRET_CACHE_KEY_='EK_PERF_SESSION_SECRET_V1';
let EK_RUNTIME_SESSION_SECRET_='';
function getSessionSecret_() {
  if(EK_RUNTIME_SESSION_SECRET_)return EK_RUNTIME_SESSION_SECRET_;
  try{const cached=getScriptCache_().get(EK_SESSION_SECRET_CACHE_KEY_);if(cached){EK_RUNTIME_SESSION_SECRET_=cached;return cached;}}catch(e){}
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty(EK.SESSION.SECRET_KEY);
  if (!secret) {
    secret = `${Utilities.getUuid()}-${Utilities.getUuid()}-${Date.now()}`;
    props.setProperty(EK.SESSION.SECRET_KEY, secret);
  }
  EK_RUNTIME_SESSION_SECRET_=secret;
  try{getScriptCache_().put(EK_SESSION_SECRET_CACHE_KEY_,secret,21600);}catch(e){}
  return secret;
}

function constantTimeEquals_(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ---------- Client device / login security ----------

function normalizeClientInfo_(info) {
  info = info && typeof info === 'object' ? info : {};
  const num = (value, min, max) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= min && n <= max ? n : '';
  };
  return {
    clientInstanceId:String(info.clientInstanceId || '').trim().slice(0, 120),
    userAgent: String(info.userAgent || '').trim().slice(0, 500),
    platform: String(info.platform || '').trim().slice(0, 120),
    vendor: String(info.vendor || '').trim().slice(0, 120),
    timezone: String(info.timezone || '').trim().slice(0, 100),
    browserTimezone: String(info.browserTimezone || '').trim().slice(0, 100),
    language: String(info.language || '').trim().slice(0, 60),
    deviceType:String(info.deviceType || '').trim().slice(0, 80),
    deviceModel:String(info.deviceModel || '').trim().slice(0, 160),
    architecture:String(info.architecture || '').trim().slice(0, 80),
    platformVersion:String(info.platformVersion || '').trim().slice(0, 100),
    browserBrands:String(info.browserBrands || '').trim().slice(0, 300),
    screen:String(info.screen || '').trim().slice(0, 60),
    viewport:String(info.viewport || '').trim().slice(0, 60),
    pixelRatio:num(info.pixelRatio,0.1,20),
    touchPoints:num(info.touchPoints,0,100),
    hardwareConcurrency:num(info.hardwareConcurrency,0,256),
    deviceMemoryGb:num(info.deviceMemoryGb,0,1024),
    colorDepth:num(info.colorDepth,0,128),
    displayMode:String(info.displayMode || '').trim().slice(0, 60),
    networkType:String(info.networkType || '').trim().slice(0, 60),
    networkDownlinkMbps:num(info.networkDownlinkMbps,0,100000),
    networkRttMs:num(info.networkRttMs,0,600000),
    saveData:!!info.saveData
  };
}

function recordLoginEventSafe_(user, clientInfo, status, detail) {
  try {
    const ci = normalizeClientInfo_(clientInfo);
    const sh = getSheetOrThrow_(EK.SHEETS.LOGIN_LOG);
    const network = [
      ci.networkType || '',
      ci.networkDownlinkMbps !== '' ? `${ci.networkDownlinkMbps}Mbps` : '',
      ci.networkRttMs !== '' ? `RTT ${ci.networkRttMs}ms` : '',
      ci.saveData ? 'SaveData' : ''
    ].filter(Boolean).join(' ');
    const device = [
      ci.deviceType ? `Type=${ci.deviceType}` : '',
      ci.deviceModel ? `Model=${ci.deviceModel}` : '',
      ci.platform ? `Platform=${ci.platform}` : '',
      ci.screen ? `Screen=${ci.screen}` : '',
      ci.viewport ? `Viewport=${ci.viewport}` : '',
      ci.touchPoints !== '' ? `Touch=${ci.touchPoints}` : '',
      ci.hardwareConcurrency !== '' ? `CPU=${ci.hardwareConcurrency}` : '',
      ci.deviceMemoryGb !== '' ? `RAM=${ci.deviceMemoryGb}GB` : '',
      network ? `Network=${network}` : '',
      ci.clientInstanceId ? `Client=${ci.clientInstanceId}` : '',
      ci.timezone ? `TZ=${ci.timezone}` : '',
      ci.language ? `Lang=${ci.language}` : '',
      ci.userAgent || ''
    ].filter(Boolean).join(' | ');
    sh.appendRow([
      new Date(),
      normalizeEmail_(user && user.email),
      String(user && user.name || ''),
      String(user && user.category || ''),
      '',
      device,
      String(status || ''),
      String(detail || '')
    ]);
  } catch (e) {}
}

const EK_LOGIN_HISTORY_CACHE_KEY_ = 'EK_PERF_LOGIN_HISTORY_V2';
let EK_RUNTIME_LOGIN_HISTORY_ = null;
function getSuccessfulLoginEmails_(){
  const ls=getSheetOrThrow_(EK.SHEETS.LOGIN_LOG), as=getSheetOrThrow_(EK.SHEETS.AUDIT);
  const ll=ls.getLastRow(), al=as.getLastRow();
  if(EK_RUNTIME_LOGIN_HISTORY_&&EK_RUNTIME_LOGIN_HISTORY_.ll===ll&&EK_RUNTIME_LOGIN_HISTORY_.al===al)return new Set(EK_RUNTIME_LOGIN_HISTORY_.emails);
  const cached=cacheGetJson_(EK_LOGIN_HISTORY_CACHE_KEY_);
  if(cached&&cached.ll===ll&&cached.al===al&&Array.isArray(cached.emails)){EK_RUNTIME_LOGIN_HISTORY_=cached;return new Set(cached.emails);}
  const emails=new Set(), ok=new Set(['BERJAYA','LOGIN_PERTAMA_BERJAYA','PIN_RESET_BERJAYA','PASSWORD_RESET_BERJAYA']);
  if(ll>=2)ls.getRange(2,2,ll-1,6).getValues().forEach(v=>{const e=normalizeEmail_(v[0]);if(e&&ok.has(String(v[5]||'').trim().toUpperCase()))emails.add(e);});
  const legacy=new Set(['LOGIN_APLIKASI','TETAP_PIN_PERTAMA','TUKAR_PIN_SELEPAS_RESET','TUKAR_PASSWORD_PERTAMA','TUKAR_PASSWORD_SELEPAS_RESET']);
  if(al>=2)as.getRange(2,3,al-1,2).getValues().forEach(v=>{const e=normalizeEmail_(v[1]);if(e&&legacy.has(String(v[0]||'').trim().toUpperCase()))emails.add(e);});
  const val={ll,al,emails:[...emails]};EK_RUNTIME_LOGIN_HISTORY_=val;cachePutJson_(EK_LOGIN_HISTORY_CACHE_KEY_,val,60);return emails;
}
function hasUserEverLoggedIn_(email){email=normalizeEmail_(email);return !!email&&getSuccessfulLoginEmails_().has(email);}
