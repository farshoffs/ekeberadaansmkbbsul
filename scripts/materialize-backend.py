#!/usr/bin/env python3
from __future__ import annotations

import re, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'apps-script'
WEB = 'https://farshoffs.github.io/ekeberadaansmkbbsul/'


def between(src, start, end, replacement):
    a = src.find(start)
    b = src.find(end, a + 1) if a >= 0 else -1
    if a < 0 or b < 0:
        raise SystemExit(f'patch marker missing: {start!r} -> {end!r}')
    return src[:a] + replacement.rstrip() + '\n\n' + src[b:]


def patch(src: str) -> str:
    src = src.replace('\r\n', '\n')

    src = between(src, 'function doGet(e) {', 'function onOpen() {', f'''function doGet(e) {{
  if (e && e.parameter && String(e.parameter.bridge || '') === '1') return renderPagesBridge_();
  const url = '{WEB}';
  return HtmlService.createHtmlOutput(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>e-Keberadaan</title><p>Membuka e-Keberadaan…</p>' +
    '<script>location.replace(' + JSON.stringify(url) + ');<\\/script>' +
    '<p><a href="' + url + '">Buka e-Keberadaan</a></p>'
  ).setTitle('e-Keberadaan').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}}
''')

    helper = r'''// Attendance row index: one cheap 2-column scan per cache generation,
// followed by narrow full-row reads only for the requested date/month.
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
    sh.getRange(2, 1, lastRow - 1, 2).getValues().forEach((v, i) => {
      const dateKey = dateCellToKey_(v[0]);
      if (!dateKey) return;
      const row = i + 2, monthKey = dateKey.slice(0, 7);
      (byDate[dateKey] || (byDate[dateKey] = [])).push(row);
      (byMonth[monthKey] || (byMonth[monthKey] = [])).push(row);
    });
  }
  const out = {lastRow, byDate, byMonth};
  EK_RUNTIME_ATT_INDEX_ = out;
  cachePutJson_(EK_ATT_INDEX_CACHE_KEY_, out, EK_ATT_INDEX_TTL_SEC_);
  return out;
}
function invalidateAttendanceIndex_(){
  EK_RUNTIME_ATT_INDEX_ = null;
  try { getScriptCache_().remove(EK_ATT_INDEX_CACHE_KEY_); } catch(e) {}
}
'''
    src = src.replace('// ---------- Attendance data ----------\n', '// ---------- Attendance data ----------\n\n' + helper + '\n', 1)

    src = between(src,
        'function getAttendanceValuesInDateRange_(fromKey, toKey) {',
        'function getAttendanceValuesForUserMonth_(email, monthKey) {',
        r'''function getAttendanceValuesInDateRange_(fromKey, toKey) {
  const settings = getSettings_();
  fromKey = clampToSystemStart_(fromKey, settings);
  toKey = validateDateKey_(toKey);
  if (toKey < getSystemStartDate_(settings) || toKey < fromKey) return [];
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE), idx = getAttendanceRowIndex_(), rows = [];
  Object.keys(idx.byDate).forEach(k => { if (k >= fromKey && k <= toKey) rows.push(...idx.byDate[k]); });
  return readAttendanceRowsByRowNumbers_(sh, rows).map(r => r.values);
}''')

    src = between(src,
        'function getAttendanceValuesForUserMonth_(email, monthKey) {',
        'function findAttendanceRecord_(dateKey, email) {',
        r'''function getAttendanceValuesForUserMonth_(email, monthKey) {
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE), idx = getAttendanceRowIndex_();
  email = normalizeEmail_(email);
  return readAttendanceRowsByRowNumbers_(sh, idx.byMonth[monthKey] || [])
    .filter(r => normalizeEmail_(r.values[1]) === email && dateCellToKey_(r.values[0]).slice(0,7) === monthKey)
    .map(r => r.values);
}''')

    src = between(src,
        'function getAttendanceByDate_(dateKey) {',
        '/**\n * Imbas helaian KEHADIRAN',
        r'''function getAttendanceByDate_(dateKey) {
  dateKey = validateDateKey_(dateKey);
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE), idx = getAttendanceRowIndex_();
  return readAttendanceRowsByRowNumbers_(sh, idx.byDate[dateKey] || [])
    .filter(r => dateCellToKey_(r.values[0]) === dateKey);
}

''')

    # Cache login-history membership once per execution/cache generation.
    src = between(src,
        'function hasUserEverLoggedIn_(email) {',
        'function normalizeIpPunchPolicy_(value) {',
        r'''const EK_LOGIN_HISTORY_CACHE_KEY_ = 'EK_PERF_LOGIN_HISTORY_V2';
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

''')

    # Cache request/review sheet parsing during one backend RPC.
    src = src.replace('let EK_RUNTIME_TRUSTED_DEVICES_ = null;', 'let EK_RUNTIME_TRUSTED_DEVICES_ = null;\nlet EK_RUNTIME_ABSENCE_ROWS_ = null;\nlet EK_RUNTIME_TIME_REVIEW_ROWS_ = null;', 1)
    src = between(src,
        'function readTimeReviewRows_() {',
        'function publicTimeReview_(r) {',
        r'''function readTimeReviewRows_(){
  if(Array.isArray(EK_RUNTIME_TIME_REVIEW_ROWS_))return EK_RUNTIME_TIME_REVIEW_ROWS_;
  const sh=getTimeReviewSheet_();if(sh.getLastRow()<2)return(EK_RUNTIME_TIME_REVIEW_ROWS_=[]);
  EK_RUNTIME_TIME_REVIEW_ROWS_=sh.getRange(2,1,sh.getLastRow()-1,EK.TIME_REVIEW_HEADERS.length).getValues().map((v,i)=>({
    row:i+2,id:String(v[0]||''),createdAt:v[1]||'',date:dateCellToKey_(v[2]),email:normalizeEmail_(v[3]),name:String(v[4]||''),jobTitle:String(v[5]||''),category:String(v[6]||''),type:String(v[7]||''),session:Number(v[8]||1),recordTime:displayMalaysiaTime_(v[9]),referenceTime:displayMalaysiaTime_(v[10]),reviewStatus:String(v[11]||'BELUM DIAMBIL MAKLUM'),reviewedBy:String(v[12]||''),reviewerName:String(v[13]||''),reviewedAt:v[14]||'',comment:String(v[15]||'')
  })).filter(r=>r.id);return EK_RUNTIME_TIME_REVIEW_ROWS_;
}
function invalidateTimeReviewRows_(){EK_RUNTIME_TIME_REVIEW_ROWS_=null;}

''')
    src = src.replace('const sh = getTimeReviewSheet_(); sh.appendRow(row);', 'const sh = getTimeReviewSheet_(); sh.appendRow(row); invalidateTimeReviewRows_();')

    old = "function readAbsenceRows_() {\n  const sh=getSheetOrThrow_(EK.SHEETS.ABSENCE); if(sh.getLastRow()<2)return [];\n  const vals=sh.getRange(2,1,sh.getLastRow()-1,EK.ABSENCE_HEADERS.length).getValues();\n  return vals.map"
    new = "function readAbsenceRows_() {\n  if(Array.isArray(EK_RUNTIME_ABSENCE_ROWS_))return EK_RUNTIME_ABSENCE_ROWS_;\n  const sh=getSheetOrThrow_(EK.SHEETS.ABSENCE); if(sh.getLastRow()<2)return(EK_RUNTIME_ABSENCE_ROWS_=[]);\n  const vals=sh.getRange(2,1,sh.getLastRow()-1,EK.ABSENCE_HEADERS.length).getValues();\n  EK_RUNTIME_ABSENCE_ROWS_=vals.map"
    if old not in src: raise SystemExit('absence reader marker missing')
    src = src.replace(old, new, 1)
    src = src.replace("jobTitle:String(v[17]||'')})).filter(r=>r.id);\n}\nfunction findAbsenceById_", "jobTitle:String(v[17]||'')})).filter(r=>r.id);\n  return EK_RUNTIME_ABSENCE_ROWS_;\n}\nfunction invalidateAbsenceRows_(){EK_RUNTIME_ABSENCE_ROWS_=null;}\nfunction findAbsenceById_", 1)
    src = src.replace("user.jobTitle||''\n  ]);\n  audit_('MOHON_TIDAK_HADIR_KEBERADAAN'", "user.jobTitle||''\n  ]);\n  invalidateAbsenceRows_();\n  audit_('MOHON_TIDAK_HADIR_KEBERADAAN'", 1)
    src = src.replace("sh.getRange(rec.row, 14).setValue(new Date());\n  audit_('BATAL_TIDAK_HADIR_KEBERADAAN'", "sh.getRange(rec.row, 14).setValue(new Date());\n  invalidateAbsenceRows_();\n  audit_('BATAL_TIDAK_HADIR_KEBERADAAN'", 1)
    src = src.replace("sh.getRange(rec.row,10,1,5).setValues([[decision,manager.email,now,comment,now]]);", "sh.getRange(rec.row,10,1,5).setValues([[decision,manager.email,now,comment,now]]);invalidateAbsenceRows_();", 1)

    # Row-count-changing attendance operations invalidate the cached row map.
    src = src.replace("rowsToDelete.sort((a, b) => b - a).forEach(row => sh.deleteRow(row));\n  SpreadsheetApp.flush();", "rowsToDelete.sort((a, b) => b - a).forEach(row => sh.deleteRow(row));\n  invalidateAttendanceIndex_();\n  SpreadsheetApp.flush();", 1)
    src = src.replace("sh.appendRow(values);\n      rec = {row: sh.getLastRow(), values, email:user.email};", "sh.appendRow(values);\n      invalidateAttendanceIndex_();\n      rec = {row: sh.getLastRow(), values, email:user.email};", 1)
    src = src.replace("if(!rec)sh.appendRow(v);else sh.getRange(rec.row,1,1,EK.ATT_HEADERS.length).setValues([v]);", "if(!rec){sh.appendRow(v);invalidateAttendanceIndex_();}else sh.getRange(rec.row,1,1,EK.ATT_HEADERS.length).setValues([v]);", 1)

    src = between(src, 'function getWebAppUrl_() {', 'function formatDateMalay_(dateKey) {', f"function getWebAppUrl_(){{return '{WEB}';}}\n\n")
    return src


def target(title: str) -> str:
    t=title.lower()
    if 'delima whitelist' in t or 'pin administration' in t or 'client ip / login security' in t:return '10_Auth.gs'
    if 'trusted-device' in t:return '11_Sessions.gs'
    if 'user functions' in t:return '20_UserApi.gs'
    if 'admin functions' in t:return '21_AdminApi.gs'
    if 'reporting' in t:return '30_Reporting.gs'
    if t=='users':return '40_UsersData.gs'
    if 'attendance data' in t:return '41_AttendanceData.gs'
    if t in {'location','system date boundary','settings'}:return '42_Settings.gs'
    if 'email notifications' in t:return '50_Notifications.gs'
    if 'semakan lewat' in t:return '60_TimeReview.gs'
    if 'tidak hadir' in t:return '61_Absence.gs'
    if 'profile photos' in t:return '70_Profile.gs'
    if t=='utilities':return '80_Utilities.gs'
    if 'setup / sheet styling' in t:return '90_Setup.gs'
    return '00_Core.gs'


def split(src: str):
    mark=re.compile(r'(?m)^// ---------- (.*?) ----------\s*$')
    ms=list(mark.finditer(src)); out={}
    first=ms[0].start() if ms else len(src)
    out.setdefault('00_Core.gs',[]).append(src[:first].rstrip())
    for i,m in enumerate(ms):
        end=ms[i+1].start() if i+1<len(ms) else len(src)
        out.setdefault(target(m.group(1).strip()),[]).append(src[m.start():end].rstrip())
    return {k:'\n\n'.join(v).strip()+'\n' for k,v in out.items() if any(x.strip() for x in v)}


def main():
    src=patch((ROOT/'Code.gs').read_text(encoding='utf-8'))
    mods=split(src)
    if OUT.exists():shutil.rmtree(OUT)
    OUT.mkdir()
    for name,text in sorted(mods.items()):(OUT/name).write_text(text,encoding='utf-8')
    for name in ['Bridges.gs','Bridge.html','appsscript.json']:shutil.copy2(ROOT/name,OUT/name)
    joined='\n'.join(mods.values())
    required=['function checkDelimaAccount(','function loginWithPin(','function resumeSession(','function punch(','function getAdminData(','function getAttendanceRowIndex_(','function getSuccessfulLoginEmails_(','function invalidateAbsenceRows_(']
    missing=[x for x in required if x not in joined]
    if missing:raise SystemExit('generated backend missing: '+', '.join(missing))
    if "createTemplateFromFile('Index')" in joined:raise SystemExit('backend still depends on legacy UI')
    print('Generated',len(mods),'modules')
    for p in sorted(OUT.iterdir()):print(p.name,p.stat().st_size)

if __name__=='__main__':main()
