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
  invalidateAbsenceRows_();
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
  invalidateAbsenceRows_();
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
  const sh=getSheetOrThrow_(EK.SHEETS.ABSENCE), now=new Date(); sh.getRange(rec.row,10,1,5).setValues([[decision,manager.email,now,comment,now]]);invalidateAbsenceRows_();
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
  if(Array.isArray(EK_RUNTIME_ABSENCE_ROWS_))return EK_RUNTIME_ABSENCE_ROWS_;
  const sh=getSheetOrThrow_(EK.SHEETS.ABSENCE); if(sh.getLastRow()<2)return(EK_RUNTIME_ABSENCE_ROWS_=[]);
  const vals=sh.getRange(2,1,sh.getLastRow()-1,EK.ABSENCE_HEADERS.length).getValues();
  EK_RUNTIME_ABSENCE_ROWS_=vals.map((v,i)=>({row:i+2,id:String(v[0]||''),submittedAt:v[1]||'',submittedMs:dateValueMs_(v[1]),email:normalizeEmail_(v[2]),name:String(v[3]||''),category:String(v[4]||''),type:String(v[5]||''),startDate:dateCellToKey_(v[6]),endDate:dateCellToKey_(v[7]),note:String(v[8]||''),status:String(v[9]||'MENUNGGU'),reviewedBy:String(v[10]||''),reviewedAt:v[11]||'',comment:String(v[12]||''),updatedAt:v[13]||'',mode:String(v[14]||'TIDAK_HADIR').toUpperCase()==='KEBERADAAN'?'KEBERADAAN':'TIDAK_HADIR',startTime:normalizeOptionalTime_(v[15]),endTime:normalizeOptionalTime_(v[16]),jobTitle:String(v[17]||'')})).filter(r=>r.id);
  return EK_RUNTIME_ABSENCE_ROWS_;
}
function invalidateAbsenceRows_(){EK_RUNTIME_ABSENCE_ROWS_=null;}
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
