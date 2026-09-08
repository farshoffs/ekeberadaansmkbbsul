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
