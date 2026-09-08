#!/usr/bin/env python3
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "Code.gs"
OUT = ROOT / "apps-script"
PAGES_URL = "https://farshoffs.github.io/ekeberadaansmkbbsul/"


def replace_between(src: str, start: str, end: str, replacement: str) -> str:
    a = src.find(start)
    if a < 0:
        raise SystemExit(f"Start marker not found: {start}")
    b = src.find(end, a + len(start))
    if b < 0:
        raise SystemExit(f"End marker not found after {start}: {end}")
    return src[:a] + replacement.rstrip() + "\n\n" + src[b:]


def patch_backend(src: str) -> str:
    # Apps Script is now an API/backend only. Direct visits go to GitHub Pages;
    # ?bridge=1 remains available for diagnostics/compatibility.
    src = replace_between(
        src,
        "function doGet(e) {",
        "function onOpen() {",
        f'''function doGet(e) {{
  if (e && e.parameter && String(e.parameter.bridge || '') === '1') {{
    return renderPagesBridge_();
  }}
  const url = '{PAGES_URL}';
  return HtmlService.createHtmlOutput(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>e-Keberadaan</title><p>Membuka e-Keberadaan…</p>' +
    '<script>location.replace(' + JSON.stringify(url) + ');<\\/script>' +
    '<p><a href="' + url + '">Buka e-Keberadaan</a></p>'
  ).setTitle('e-Keberadaan').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}}
''',
    )

    # Replace repeated full-sheet attendance scans with a short-lived row index.
    attendance_helpers = r'''// ---------- Attendance performance index ----------
const EK_ATT_INDEX_CACHE_KEY_ = 'EK_PERF_ATT_INDEX_V2';
const EK_ATT_INDEX_TTL_SEC_ = 30;
let EK_RUNTIME_ATT_INDEX_ = null;

function getAttendanceRowIndex_() {
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
  const lastRow = sh.getLastRow();
  if (EK_RUNTIME_ATT_INDEX_ && EK_RUNTIME_ATT_INDEX_.lastRow === lastRow) return EK_RUNTIME_ATT_INDEX_;

  const cached = cacheGetJson_(EK_ATT_INDEX_CACHE_KEY_);
  if (cached && cached.lastRow === lastRow && cached.byDate && cached.byMonth) {
    EK_RUNTIME_ATT_INDEX_ = cached;
    return cached;
  }

  const byDate = Object.create(null), byMonth = Object.create(null);
  if (lastRow >= 2) {
    // Only the two index columns are read once. Full 35-column rows are fetched
    // afterwards only for the dates/month requested by the current RPC.
    const index = sh.getRange(2, 1, lastRow - 1, 2).getValues();
    index.forEach((v, i) => {
      const dateKey = dateCellToKey_(v[0]);
      if (!dateKey) return;
      const row = i + 2;
      (byDate[dateKey] || (byDate[dateKey] = [])).push(row);
      const monthKey = dateKey.slice(0, 7);
      (byMonth[monthKey] || (byMonth[monthKey] = [])).push(row);
    });
  }
  const built = {lastRow, byDate, byMonth};
  EK_RUNTIME_ATT_INDEX_ = built;
  cachePutJson_(EK_ATT_INDEX_CACHE_KEY_, built, EK_ATT_INDEX_TTL_SEC_);
  return built;
}

function invalidateAttendanceIndex_() {
  EK_RUNTIME_ATT_INDEX_ = null;
  try { getScriptCache_().remove(EK_ATT_INDEX_CACHE_KEY_); } catch (e) {}
}

'''
    src = src.replace("// ---------- Attendance data ----------\n", "// ---------- Attendance data ----------\n\n" + attendance_helpers, 1)

    src = replace_between(
        src,
        "function getAttendanceValuesInDateRange_(fromKey, toKey) {",
        "function getAttendanceValuesForUserMonth_(email, monthKey) {",
        r'''function getAttendanceValuesInDateRange_(fromKey, toKey) {
  const settings = getSettings_();
  fromKey = clampToSystemStart_(fromKey, settings);
  toKey = validateDateKey_(toKey);
  if (toKey < getSystemStartDate_(settings) || toKey < fromKey) return [];
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
  const idx = getAttendanceRowIndex_();
  const rowNums = [];
  Object.keys(idx.byDate).forEach(dateKey => {
    if (dateKey >= fromKey && dateKey <= toKey) rowNums.push(...idx.byDate[dateKey]);
  });
  return readAttendanceRowsByRowNumbers_(sh, rowNums).map(r => r.values);
}''',
    )
    src = replace_between(
        src,
        "function getAttendanceValuesForUserMonth_(email, monthKey) {",
        "function findAttendanceRecord_(dateKey, email) {",
        r'''function getAttendanceValuesForUserMonth_(email, monthKey) {
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
  email = normalizeEmail_(email);
  const idx = getAttendanceRowIndex_();
  const rows = idx.byMonth[monthKey] || [];
  return readAttendanceRowsByRowNumbers_(sh, rows)
    .filter(r => normalizeEmail_(r.values[1]) === email && dateCellToKey_(r.values[0]).slice(0, 7) === monthKey)
    .map(r => r.values);
}''',
    )
    src = replace_between(
        src,
        "function getAttendanceByDate_(dateKey) {",
        "/**\n * Imbas helaian KEHADIRAN",
        r'''function getAttendanceByDate_(dateKey) {
  dateKey = validateDateKey_(dateKey);
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
  const idx = getAttendanceRowIndex_();
  return readAttendanceRowsByRowNumbers_(sh, idx.byDate[dateKey] || [])
    .filter(r => dateCellToKey_(r.values[0]) === dateKey);
}

''',
    )

    # Any operation that changes row count must invalidate the cached row index.
    src = src.replace(
        "rowsToDelete.sort((a, b) => b - a).forEach(row => sh.deleteRow(row));\n  SpreadsheetApp.flush();",
        "rowsToDelete.sort((a, b) => b - a).forEach(row => sh.deleteRow(row));\n  invalidateAttendanceIndex_();\n  SpreadsheetApp.flush();",
    )
    src = src.replace(
        ".forEach(row => sh.deleteRow(row));\n\n  SpreadsheetApp.flush();\n  return {\n    row: targetRow,",
        ".forEach(row => sh.deleteRow(row));\n  invalidateAttendanceIndex_();\n\n  SpreadsheetApp.flush();\n  return {\n    row: targetRow,",
    )
    src = src.replace(
        "sh.appendRow(values);\n      rec = {row: sh.getLastRow(), values, email:user.email};",
        "sh.appendRow(values);\n      invalidateAttendanceIndex_();\n      rec = {row: sh.getLastRow(), values, email:user.email};",
    )
    src = src.replace(
        "if(!rec)sh.appendRow(v);else sh.getRange(rec.row,1,1,EK.ATT_HEADERS.length).setValues([v]);",
        "if(!rec){sh.appendRow(v);invalidateAttendanceIndex_();}else sh.getRange(rec.row,1,1,EK.ATT_HEADERS.length).setValues([v]);",
    )
    src = src.replace(
        "v[18]=now; sh.appendRow(v); }",
        "v[18]=now; sh.appendRow(v); invalidateAttendanceIndex_(); }",
    )

    # Login-history membership is needed in several notification paths. Build it
    # once instead of scanning LOG_LOGIN/AUDIT once per user.
    src = replace_between(
        src,
        "function hasUserEverLoggedIn_(email) {",
        "function normalizeIpPunchPolicy_(value) {",
        r'''const EK_LOGIN_HISTORY_CACHE_KEY_ = 'EK_PERF_LOGIN_HISTORY_V2';
let EK_RUNTIME_LOGIN_HISTORY_ = null;

function getSuccessfulLoginEmails_() {
  const loginSh = getSheetOrThrow_(EK.SHEETS.LOGIN_LOG);
  const auditSh = getSheetOrThrow_(EK.SHEETS.AUDIT);
  const loginLast = loginSh.getLastRow(), auditLast = auditSh.getLastRow();
  if (EK_RUNTIME_LOGIN_HISTORY_ && EK_RUNTIME_LOGIN_HISTORY_.loginLast === loginLast && EK_RUNTIME_LOGIN_HISTORY_.auditLast === auditLast) {
    return new Set(EK_RUNTIME_LOGIN_HISTORY_.emails);
  }
  const cached = cacheGetJson_(EK_LOGIN_HISTORY_CACHE_KEY_);
  if (cached && cached.loginLast === loginLast && cached.auditLast === auditLast && Array.isArray(cached.emails)) {
    EK_RUNTIME_LOGIN_HISTORY_ = cached;
    return new Set(cached.emails);
  }

  const emails = new Set();
  const success = new Set(['BERJAYA','LOGIN_PERTAMA_BERJAYA','PIN_RESET_BERJAYA','PASSWORD_RESET_BERJAYA']);
  if (loginLast >= 2) {
    // Read only Emel..Status (6 columns), not the entire sheet repeatedly.
    loginSh.getRange(2, 2, loginLast - 1, 6).getValues().forEach(v => {
      const email = normalizeEmail_(v[0]);
      const status = String(v[5] || '').trim().toUpperCase();
      if (email && success.has(status)) emails.add(email);
    });
  }
  const legacyActions = new Set(['LOGIN_APLIKASI','TETAP_PIN_PERTAMA','TUKAR_PIN_SELEPAS_RESET','TUKAR_PASSWORD_PERTAMA','TUKAR_PASSWORD_SELEPAS_RESET']);
  if (auditLast >= 2) {
    auditSh.getRange(2, 3, auditLast - 1, 2).getValues().forEach(v => {
      if (!legacyActions.has(String(v[0] || '').trim().toUpperCase())) return;
      const email = normalizeEmail_(v[1]);
      if (email) emails.add(email);
    });
  }
  const value = {loginLast, auditLast, emails:[...emails]};
  EK_RUNTIME_LOGIN_HISTORY_ = value;
  cachePutJson_(EK_LOGIN_HISTORY_CACHE_KEY_, value, 60);
  return emails;
}

function hasUserEverLoggedIn_(email) {
  email = normalizeEmail_(email);
  return !!email && getSuccessfulLoginEmails_().has(email);
}

''',
    )

    # Per-execution memoization for request/review tables avoids repeated reads
    # inside punch cards, management lists and approval flows.
    src = src.replace("let EK_RUNTIME_TRUSTED_DEVICES_ = null;", "let EK_RUNTIME_TRUSTED_DEVICES_ = null;\nlet EK_RUNTIME_ABSENCE_ROWS_ = null;\nlet EK_RUNTIME_TIME_REVIEW_ROWS_ = null;")
    src = replace_between(
        src,
        "function readTimeReviewRows_() {",
        "function publicTimeReview_(r) {",
        r'''function readTimeReviewRows_() {
  if (Array.isArray(EK_RUNTIME_TIME_REVIEW_ROWS_)) return EK_RUNTIME_TIME_REVIEW_ROWS_;
  const sh = getTimeReviewSheet_();
  if (sh.getLastRow() < 2) return (EK_RUNTIME_TIME_REVIEW_ROWS_ = []);
  EK_RUNTIME_TIME_REVIEW_ROWS_ = sh.getRange(2,1,sh.getLastRow()-1,EK.TIME_REVIEW_HEADERS.length).getValues().map((v,i)=>({
    row:i+2,id:String(v[0]||''),createdAt:v[1]||'',date:dateCellToKey_(v[2]),email:normalizeEmail_(v[3]),name:String(v[4]||''),jobTitle:String(v[5]||''),category:String(v[6]||''),
    type:String(v[7]||''),session:Number(v[8]||1),recordTime:displayMalaysiaTime_(v[9]),referenceTime:displayMalaysiaTime_(v[10]),reviewStatus:String(v[11]||'BELUM DIAMBIL MAKLUM'),
    reviewedBy:String(v[12]||''),reviewerName:String(v[13]||''),reviewedAt:v[14]||'',comment:String(v[15]||'')
  })).filter(r=>r.id);
  return EK_RUNTIME_TIME_REVIEW_ROWS_;
}

function invalidateTimeReviewRows_(){ EK_RUNTIME_TIME_REVIEW_ROWS_ = null; }

''',
    )
    src = src.replace("const sh = getTimeReviewSheet_(); sh.appendRow(row);", "const sh = getTimeReviewSheet_(); sh.appendRow(row); invalidateTimeReviewRows_();")
    src = src.replace("function readAbsenceRows_() {\n  const sh=getSheetOrThrow_(EK.SHEETS.ABSENCE); if(sh.getLastRow()<2)return [];\n  const vals=sh.getRange(2,1,sh.getLastRow()-1,EK.ABSENCE_HEADERS.length).getValues();\n  return vals.map", "function readAbsenceRows_() {\n  if(Array.isArray(EK_RUNTIME_ABSENCE_ROWS_)) return EK_RUNTIME_ABSENCE_ROWS_;\n  const sh=getSheetOrThrow_(EK.SHEETS.ABSENCE); if(sh.getLastRow()<2)return (EK_RUNTIME_ABSENCE_ROWS_=[]);\n  const vals=sh.getRange(2,1,sh.getLastRow()-1,EK.ABSENCE_HEADERS.length).getValues();\n  EK_RUNTIME_ABSENCE_ROWS_=vals.map")
    src = src.replace("jobTitle:String(v[17]||'')})).filter(r=>r.id);\n}\nfunction findAbsenceById_", "jobTitle:String(v[17]||'')})).filter(r=>r.id);\n  return EK_RUNTIME_ABSENCE_ROWS_;\n}\nfunction invalidateAbsenceRows_(){EK_RUNTIME_ABSENCE_ROWS_=null;}\nfunction findAbsenceById_")
    src = src.replace("getSheetOrThrow_(EK.SHEETS.ABSENCE).appendRow([", "getSheetOrThrow_(EK.SHEETS.ABSENCE).appendRow([", 1)
    src = src.replace("user.jobTitle||''\n  ]);\n  audit_('MOHON_TIDAK_HADIR_KEBERADAAN'", "user.jobTitle||''\n  ]);\n  invalidateAbsenceRows_();\n  audit_('MOHON_TIDAK_HADIR_KEBERADAAN'", 1)
    src = src.replace("sh.getRange(rec.row, 14).setValue(new Date());\n  audit_('BATAL_TIDAK_HADIR_KEBERADAAN'", "sh.getRange(rec.row, 14).setValue(new Date());\n  invalidateAbsenceRows_();\n  audit_('BATAL_TIDAK_HADIR_KEBERADAAN'", 1)
    src = src.replace("const sh=getSheetOrThrow_(EK.SHEETS.ABSENCE), now=new Date(); sh.getRange(rec.row,10,1,5).setValues([[decision,manager.email,now,comment,now]]);", "const sh=getSheetOrThrow_(EK.SHEETS.ABSENCE), now=new Date(); sh.getRange(rec.row,10,1,5).setValues([[decision,manager.email,now,comment,now]]); invalidateAbsenceRows_();")

    # Email links should point to the real web UI, not the Apps Script backend.
    src = replace_between(
        src,
        "function getWebAppUrl_() {",
        "function formatDateMalay_(dateKey) {",
        f"function getWebAppUrl_() {{ return '{PAGES_URL}'; }}\n\n",
    )

    return src


def module_name(title: str) -> str:
    t = title.lower()
    if "trusted-device" in t: return "11_Sessions.gs"
    if "delima whitelist" in t or "pin administration" in t or "client ip / login security" in t: return "10_Auth.gs"
    if "user functions" in t: return "20_UserApi.gs"
    if "admin functions" in t: return "21_AdminApi.gs"
    if "reporting" in t: return "30_Reporting.gs"
    if t == "users": return "40_UsersData.gs"
    if "attendance data" in t: return "41_AttendanceData.gs"
    if "system date boundary" in t or t == "settings" or t == "location": return "42_Settings.gs"
    if "email notifications" in t: return "50_Notifications.gs"
    if "semakan lewat" in t: return "60_TimeReview.gs"
    if "tidak hadir" in t: return "61_Absence.gs"
    if "profile photos" in t: return "70_Profile.gs"
    if t == "utilities": return "80_Utilities.gs"
    if "setup / sheet styling" in t: return "90_Setup.gs"
    return "00_Core.gs"


def split_modules(src: str) -> dict[str, str]:
    marker = re.compile(r"(?m)^// ---------- (.*?) ----------\s*$")
    matches = list(marker.finditer(src))
    buckets: dict[str, list[str]] = {}
    prelude_end = matches[0].start() if matches else len(src)
    buckets.setdefault("00_Core.gs", []).append(src[:prelude_end].rstrip())
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(src)
        block = src[m.start():end].rstrip()
        buckets.setdefault(module_name(m.group(1).strip()), []).append(block)
    return {name: "\n\n".join(parts).strip() + "\n" for name, parts in buckets.items() if any(p.strip() for p in parts)}


def build() -> None:
    src = patch_backend(SRC.read_text(encoding="utf-8").replace("\r\n", "\n"))
    modules = split_modules(src)
    if OUT.exists(): shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    for name, text in sorted(modules.items()):
        (OUT / name).write_text(text, encoding="utf-8")
    shutil.copy2(ROOT / "Bridges.gs", OUT / "Bridges.gs")
    shutil.copy2(ROOT / "Bridge.html", OUT / "Bridge.html")
    shutil.copy2(ROOT / "appsscript.json", OUT / "appsscript.json")

    joined = "\n".join(modules.values())
    required = [
        "function checkDelimaAccount(", "function loginWithPin(", "function resumeSession(",
        "function punch(", "function getAdminData(", "function getAttendanceByDate_(",
        "function getAttendanceRowIndex_(", "function getSuccessfulLoginEmails_(",
        "function readAbsenceRows_(", "function readTimeReviewRows_("
    ]
    missing = [x for x in required if x not in joined]
    if missing: raise SystemExit("Missing generated functions: " + ", ".join(missing))
    if "createTemplateFromFile('Index')" in joined:
        raise SystemExit("Generated backend still depends on legacy Index.html")
    print(f"Generated {len(modules)} Apps Script modules in {OUT}")
    for p in sorted(OUT.iterdir()): print(f"{p.name}: {p.stat().st_size} bytes")


if __name__ == "__main__":
    build()
