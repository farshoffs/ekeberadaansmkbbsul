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
  if(!rec){sh.appendRow(v);invalidateAttendanceIndex_();}else sh.getRange(rec.row,1,1,EK.ATT_HEADERS.length).setValues([v]);
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
