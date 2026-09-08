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

function getWebAppUrl_(){return 'https://farshoffs.github.io/ekeberadaansmkbbsul/';}

function formatDateMalay_(dateKey) {
  dateKey = dateCellToKey_(dateKey);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey || '')) return String(dateKey || '');
  const parts = dateKey.split('-').map(Number);
  const months = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
  return `${parts[2]} ${months[parts[1]-1]} ${parts[0]}`;
}
