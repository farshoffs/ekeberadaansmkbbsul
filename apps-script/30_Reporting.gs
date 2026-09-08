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
