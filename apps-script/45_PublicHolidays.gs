// ---------- Public holidays / school-wide calendar ----------
// One central calendar applies to every user. Public holidays are excluded from
// expected working days, absence finalization and reminders. A real punch on a
// public holiday always remains an attendance record and takes precedence in
// the digital punch card.
const EK_PUBLIC_HOLIDAY_SHEET_ = 'CUTI_UMUM';
const EK_PUBLIC_HOLIDAY_HEADERS_ = ['Tarikh','Nama','Jenis','Sumber','Aktif','DiciptaPada','DiciptaOleh'];
const EK_PUBLIC_HOLIDAY_CACHE_KEY_ = 'EK_PERF_PUBLIC_HOLIDAYS_V1';
const EK_PUBLIC_HOLIDAY_CACHE_TTL_SEC_ = 300;
// V2 forces one complete Kedah 2026 import after deployment even if an older
// holiday seed had already run. Once V2 is marked complete, administrator
// additions/deletions remain authoritative and setupSystem() will not restore
// a holiday that was deliberately removed.
const EK_PUBLIC_HOLIDAY_SEED_PROPERTY_ = 'EK_PUBLIC_HOLIDAY_SEED_KEDAH_2026_V2';
let EK_RUNTIME_PUBLIC_HOLIDAYS_ = null;

// Lengkap untuk sekolah di Negeri Kedah bagi tahun 2026:
// - jadual rasmi Hari Kelepasan Am Negeri Kedah 2026;
// - Cuti Peristiwa Thaipusam pada 1 Februari 2026; dan
// - Hari Kelepasan Am Tambahan Aidilfitri pada 23 Mac 2026.
const EK_KEDAH_PUBLIC_HOLIDAYS_2026_ = Object.freeze([
  ['2026-01-17','Israk dan Mikraj','NEGERI','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-02-01','Thaipusam — Cuti Peristiwa','PERISTIWA','Kerajaan Negeri Kedah — Cuti Peristiwa Thaipusam 2026'],
  ['2026-02-17','Tahun Baru Cina','PERSEKUTUAN','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-02-18','Tahun Baru Cina (Hari Kedua)','PERSEKUTUAN','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-02-19','Awal Ramadan','NEGERI','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-03-21','Hari Raya Aidilfitri','PERSEKUTUAN','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-03-22','Hari Raya Aidilfitri (Hari Kedua)','PERSEKUTUAN','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-03-23','Hari Kelepasan Am Tambahan Aidilfitri','TAMBAHAN','Kerajaan Negeri Kedah — Kelepasan Am Tambahan Aidilfitri 2026'],
  ['2026-05-01','Hari Pekerja','PERSEKUTUAN','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-05-27','Hari Raya Aidiladha','PERSEKUTUAN','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-05-28','Hari Raya Aidiladha (Hari Kedua)','NEGERI','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-05-31','Hari Wesak','PERSEKUTUAN','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-06-01','Hari Keputeraan Yang di-Pertuan Agong','PERSEKUTUAN','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-06-17','Awal Muharam (Maal Hijrah)','PERSEKUTUAN','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-06-21','Hari Keputeraan Sultan Kedah','NEGERI','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-08-25','Maulidur Rasul','PERSEKUTUAN','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-08-31','Hari Kebangsaan','PERSEKUTUAN','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-09-16','Hari Malaysia','PERSEKUTUAN','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-11-08','Hari Deepavali','PERSEKUTUAN','Jadual Hari Kelepasan Am Negeri Kedah 2026'],
  ['2026-12-25','Hari Krismas','PERSEKUTUAN','Jadual Hari Kelepasan Am Negeri Kedah 2026']
]);

function setupPublicHolidaySheet_(ss) {
  ss = ss || getSpreadsheet_();
  const sh = ss.getSheetByName(EK_PUBLIC_HOLIDAY_SHEET_) || ss.insertSheet(EK_PUBLIC_HOLIDAY_SHEET_);
  ensureHeaders_(sh, EK_PUBLIC_HOLIDAY_HEADERS_);
  styleHeader_(sh, EK_PUBLIC_HOLIDAY_HEADERS_.length);
  sh.setFrozenRows(1);
  sh.getRange('A:A').setNumberFormat('@');
  sh.getRange('E2:E').insertCheckboxes();
  sh.getRange('F:F').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.setColumnWidth(1,130); sh.setColumnWidth(2,330); sh.setColumnWidth(3,150);
  sh.setColumnWidth(4,420); sh.setColumnWidth(5,90); sh.setColumnWidth(6,180); sh.setColumnWidth(7,230);
  return sh;
}

function ensurePublicHolidaySheet_() {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(EK_PUBLIC_HOLIDAY_SHEET_) || setupPublicHolidaySheet_(ss);
  EK_RUNTIME_SHEETS_[EK_PUBLIC_HOLIDAY_SHEET_] = sh;
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty(EK_PUBLIC_HOLIDAY_SEED_PROPERTY_) !== 'TRUE') {
    seedKedahPublicHolidays2026_(sh);
    props.setProperty(EK_PUBLIC_HOLIDAY_SEED_PROPERTY_, 'TRUE');
  }
  return sh;
}

function seedKedahPublicHolidays2026_(sheet) {
  const sh = sheet || setupPublicHolidaySheet_(getSpreadsheet_());
  const existing = new Set();
  if (sh.getLastRow() >= 2) {
    sh.getRange(2,1,sh.getLastRow()-1,1).getDisplayValues().forEach(r => {
      const key = dateCellToKey_(r[0]);
      if (key) existing.add(key);
    });
  }
  const now = new Date();
  const rows = EK_KEDAH_PUBLIC_HOLIDAYS_2026_
    .filter(r => !existing.has(r[0]))
    .map(r => [r[0],r[1],r[2],r[3],true,now,'SISTEM']);
  if (rows.length) {
    sh.getRange(sh.getLastRow()+1,1,rows.length,EK_PUBLIC_HOLIDAY_HEADERS_.length).setValues(rows);
    sh.getRange(2,5,Math.max(1,sh.getLastRow()-1),1).insertCheckboxes();
  }
  invalidatePublicHolidayCache_();
  return rows.length;
}

function invalidatePublicHolidayCache_() {
  EK_RUNTIME_PUBLIC_HOLIDAYS_ = null;
  try { getScriptCache_().remove(EK_PUBLIC_HOLIDAY_CACHE_KEY_); } catch (e) {}
}

function readPublicHolidays_() {
  if (Array.isArray(EK_RUNTIME_PUBLIC_HOLIDAYS_)) return EK_RUNTIME_PUBLIC_HOLIDAYS_;
  const cached = cacheGetJson_(EK_PUBLIC_HOLIDAY_CACHE_KEY_);
  if (Array.isArray(cached)) {
    EK_RUNTIME_PUBLIC_HOLIDAYS_ = cached;
    return cached;
  }
  const sh = ensurePublicHolidaySheet_();
  if (sh.getLastRow() < 2) return (EK_RUNTIME_PUBLIC_HOLIDAYS_ = []);
  const values = sh.getRange(2,1,sh.getLastRow()-1,EK_PUBLIC_HOLIDAY_HEADERS_.length).getValues();
  const rows = values.map((v,i) => ({
    row:i+2,
    date:dateCellToKey_(v[0]),
    name:String(v[1]||'').trim(),
    type:String(v[2]||'MANUAL').trim().toUpperCase() || 'MANUAL',
    source:String(v[3]||'').trim(),
    active:toBool_(v[4]),
    createdAt:v[5]||'',
    createdBy:normalizeEmail_(v[6]) || String(v[6]||'').trim()
  })).filter(r => r.date && r.name);
  EK_RUNTIME_PUBLIC_HOLIDAYS_ = rows;
  cachePutJson_(EK_PUBLIC_HOLIDAY_CACHE_KEY_, rows, EK_PUBLIC_HOLIDAY_CACHE_TTL_SEC_);
  return rows;
}

function getPublicHolidayByDate_(dateKey) {
  dateKey = validateDateKey_(dateKey);
  return readPublicHolidays_().find(r => r.active && r.date === dateKey) || null;
}

function isPublicHolidayDate_(dateKey) {
  return !!getPublicHolidayByDate_(dateKey);
}

function getPublicHolidaysInRange_(fromDate, toDate) {
  fromDate = validateDateKey_(fromDate);
  toDate = validateDateKey_(toDate || fromDate);
  return readPublicHolidays_()
    .filter(r => r.active && r.date >= fromDate && r.date <= toDate)
    .sort((a,b) => a.date.localeCompare(b.date))
    .map(publicHoliday_);
}

function publicHoliday_(r) {
  return {date:r.date,name:r.name,type:r.type||'MANUAL',source:r.source||'',active:!!r.active};
}

function adminListPublicHolidays(token) {
  requireSessionAdmin_(token);
  return {holidays:readPublicHolidays_().filter(r=>r.active).sort((a,b)=>a.date.localeCompare(b.date)).map(publicHoliday_)};
}

function adminAddPublicHoliday(token, payload) {
  const admin = requireSessionAdmin_(token);
  payload = payload || {};
  const dateKey = validateDateKey_(payload.date);
  const name = String(payload.name || '').trim();
  if (!name) throw new Error('Nama cuti umum diperlukan.');
  const type = String(payload.type || 'MANUAL').trim().toUpperCase().slice(0,40) || 'MANUAL';
  const source = String(payload.source || 'Ditambah melalui Tetapan e-Keberadaan').trim().slice(0,300);
  const sh = ensurePublicHolidaySheet_();
  const existing = readPublicHolidays_().find(r => r.date === dateKey && r.active);
  const now = new Date();
  if (existing) {
    sh.getRange(existing.row,1,1,EK_PUBLIC_HOLIDAY_HEADERS_.length).setValues([[
      dateKey,name,type,source,true,existing.createdAt||now,admin.email
    ]]);
  } else {
    sh.appendRow([dateKey,name,type,source,true,now,admin.email]);
    sh.getRange(sh.getLastRow(),5).insertCheckboxes().setValue(true);
  }
  invalidatePublicHolidayCache_();
  audit_('TAMBAH_CUTI_UMUM',dateKey,`${name}; jenis=${type}`,admin.email);
  return {ok:true,holiday:publicHoliday_(getPublicHolidayByDate_(dateKey)),holidays:readPublicHolidays_().filter(r=>r.active).sort((a,b)=>a.date.localeCompare(b.date)).map(publicHoliday_)};
}

function adminDeletePublicHoliday(token, dateKey) {
  const admin = requireSessionAdmin_(token);
  dateKey = validateDateKey_(dateKey);
  const sh = ensurePublicHolidaySheet_();
  const matches = readPublicHolidays_().filter(r => r.date === dateKey).sort((a,b)=>b.row-a.row);
  if (!matches.length) throw new Error('Cuti umum tidak dijumpai.');
  const labels = matches.map(r=>r.name).filter(Boolean);
  matches.forEach(r => sh.deleteRow(r.row));
  invalidatePublicHolidayCache_();
  audit_('BUANG_CUTI_UMUM',dateKey,labels.join(' / '),admin.email);
  return {ok:true,date:dateKey,holidays:readPublicHolidays_().filter(r=>r.active).sort((a,b)=>a.date.localeCompare(b.date)).map(publicHoliday_)};
}
