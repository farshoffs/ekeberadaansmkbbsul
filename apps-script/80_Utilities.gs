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
