// ---------- Effective-dated attendance schedule history ----------
// Every schedule version has a real Malaysia-time effective timestamp. This
// prevents a change made today from reclassifying punches that happened before
// the change. Historical rows without a captured version remain immutable and
// keep their persisted Status/StatusWaktu rather than being guessed from today's
// settings.
const EK_SCHEDULE_HISTORY_ = Object.freeze({
  SHEET: 'SEJARAH_JADUAL',
  HEADERS: [
    'ID','Emel','BerkuatKuasaPada','Sesi1Masuk','Sesi1Keluar','Sesi2Masuk','Sesi2Keluar','MaksMasuk',
    'BenarSesi2','LayakWBFKhamis','WBFEnabled','WBFMasukMula','WBFMasukAkhir','WBFKeluarMula','WBFKeluarAkhir',
    'WBFMinit','DirekodPada','DirekodOleh','Sumber','SnapshotJSON'
  ],
  CACHE_KEY: 'EK_PERF_SCHEDULE_HISTORY_V1',
  CACHE_TTL_SEC: 300
});
let EK_RUNTIME_SCHEDULE_HISTORY_ = null;

function setupScheduleHistorySheet_(ss) {
  const sh = ss.getSheetByName(EK_SCHEDULE_HISTORY_.SHEET) || ss.insertSheet(EK_SCHEDULE_HISTORY_.SHEET);
  ensureHeaders_(sh, EK_SCHEDULE_HISTORY_.HEADERS);
  styleHeader_(sh, EK_SCHEDULE_HISTORY_.HEADERS.length);
  sh.setFrozenRows(1);
  sh.getRange('C:C').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.getRange('D:H').setNumberFormat('@');
  sh.getRange('Q:Q').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.setColumnWidth(1,250); sh.setColumnWidth(2,230); sh.setColumnWidth(3,190);
  sh.setColumnWidths(4,5,125); sh.setColumnWidths(9,8,125);
  sh.setColumnWidth(17,190); sh.setColumnWidth(18,230); sh.setColumnWidth(19,180); sh.setColumnWidth(20,420);
  return sh;
}

function getScheduleHistorySheet_() {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(EK_SCHEDULE_HISTORY_.SHEET);
  if (!sh) sh = setupScheduleHistorySheet_(ss);
  return sh;
}

function invalidateScheduleHistoryCache_() {
  EK_RUNTIME_SCHEDULE_HISTORY_ = null;
  try { getScriptCache_().remove(EK_SCHEDULE_HISTORY_.CACHE_KEY); } catch (e) {}
}

function makeScheduleSnapshot_(user, settings) {
  settings = settings || getSettings_();
  const schedule = getEffectiveSchedule_(user, settings);
  return {
    schedule: {
      s1In: schedule.s1In || '', s1Out: schedule.s1Out || '',
      s2In: schedule.s2In || '', s2Out: schedule.s2Out || '',
      maxPunchIn: schedule.maxPunchIn || '',
      allowSecondSession: !!schedule.allowSecondSession
    },
    wbfEligible: isThursdayWbfUser_(user),
    timingSettings: {
      THURSDAY_WBF_ENABLED: String(settings.THURSDAY_WBF_ENABLED || 'TRUE').toUpperCase() === 'FALSE' ? 'FALSE' : 'TRUE',
      THURSDAY_WBF_IN_FROM: String(settings.THURSDAY_WBF_IN_FROM || '07:30'),
      THURSDAY_WBF_IN_TO: String(settings.THURSDAY_WBF_IN_TO || '09:00'),
      THURSDAY_WBF_OUT_FROM: String(settings.THURSDAY_WBF_OUT_FROM || '15:00'),
      THURSDAY_WBF_OUT_TO: String(settings.THURSDAY_WBF_OUT_TO || '16:30'),
      THURSDAY_WBF_DURATION_MINUTES: String(settings.THURSDAY_WBF_DURATION_MINUTES || '450')
    }
  };
}

function scheduleSnapshotSignature_(snapshot) {
  snapshot = snapshot || {};
  const s = snapshot.schedule || {};
  const t = snapshot.timingSettings || {};
  return JSON.stringify([
    s.s1In||'',s.s1Out||'',s.s2In||'',s.s2Out||'',s.maxPunchIn||'',!!s.allowSecondSession,
    !!snapshot.wbfEligible,
    String(t.THURSDAY_WBF_ENABLED||''),String(t.THURSDAY_WBF_IN_FROM||''),String(t.THURSDAY_WBF_IN_TO||''),
    String(t.THURSDAY_WBF_OUT_FROM||''),String(t.THURSDAY_WBF_OUT_TO||''),String(t.THURSDAY_WBF_DURATION_MINUTES||'')
  ]);
}

function scheduleHistorySnapshotFromRow_(v) {
  try {
    const raw = String(v[19] || '').trim();
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.schedule) return parsed;
    }
  } catch (e) {}
  return {
    schedule: {
      s1In: normalizeOptionalTime_(v[3]), s1Out: normalizeOptionalTime_(v[4]),
      s2In: normalizeOptionalTime_(v[5]), s2Out: normalizeOptionalTime_(v[6]),
      maxPunchIn: normalizeOptionalTime_(v[7]), allowSecondSession: toBool_(v[8])
    },
    wbfEligible: toBool_(v[9]),
    timingSettings: {
      THURSDAY_WBF_ENABLED: String(v[10] || 'TRUE'),
      THURSDAY_WBF_IN_FROM: String(v[11] || '07:30'),
      THURSDAY_WBF_IN_TO: String(v[12] || '09:00'),
      THURSDAY_WBF_OUT_FROM: String(v[13] || '15:00'),
      THURSDAY_WBF_OUT_TO: String(v[14] || '16:30'),
      THURSDAY_WBF_DURATION_MINUTES: String(v[15] || '450')
    }
  };
}

function scheduleHistoryRecordFromRow_(v, row) {
  return {
    row, id:String(v[0]||''), email:normalizeEmail_(v[1]), effectiveAt:v[2]||'',
    effectiveMs:dateValueMs_(v[2]), recordedAt:v[16]||'', recordedBy:normalizeEmail_(v[17]),
    source:String(v[18]||''), snapshot:scheduleHistorySnapshotFromRow_(v)
  };
}

function getAllScheduleHistory_() {
  if (Array.isArray(EK_RUNTIME_SCHEDULE_HISTORY_)) return EK_RUNTIME_SCHEDULE_HISTORY_;
  const cached = cacheGetJson_(EK_SCHEDULE_HISTORY_.CACHE_KEY);
  if (Array.isArray(cached)) { EK_RUNTIME_SCHEDULE_HISTORY_ = cached; return cached; }
  const sh = getScheduleHistorySheet_();
  if (sh.getLastRow() < 2) return (EK_RUNTIME_SCHEDULE_HISTORY_ = []);
  const rows = sh.getRange(2,1,sh.getLastRow()-1,EK_SCHEDULE_HISTORY_.HEADERS.length).getValues();
  EK_RUNTIME_SCHEDULE_HISTORY_ = rows.map((v,i)=>scheduleHistoryRecordFromRow_(v,i+2))
    .filter(r=>r.email&&r.effectiveMs)
    .sort((a,b)=>a.effectiveMs-b.effectiveMs||a.row-b.row);
  cachePutJson_(EK_SCHEDULE_HISTORY_.CACHE_KEY, EK_RUNTIME_SCHEDULE_HISTORY_, EK_SCHEDULE_HISTORY_.CACHE_TTL_SEC);
  return EK_RUNTIME_SCHEDULE_HISTORY_;
}

function getScheduleHistoryForUser_(email) {
  email = normalizeEmail_(email);
  return email ? getAllScheduleHistory_().filter(r=>r.email===email) : [];
}

function scheduleHistoryRow_(email, snapshot, effectiveAt, actor, source) {
  const s = snapshot.schedule || {}, t = snapshot.timingSettings || {};
  return [
    `SJ-${Utilities.getUuid()}`, normalizeEmail_(email), effectiveAt,
    s.s1In||'',s.s1Out||'',s.s2In||'',s.s2Out||'',s.maxPunchIn||'',!!s.allowSecondSession,!!snapshot.wbfEligible,
    String(t.THURSDAY_WBF_ENABLED||'TRUE'),String(t.THURSDAY_WBF_IN_FROM||'07:30'),String(t.THURSDAY_WBF_IN_TO||'09:00'),
    String(t.THURSDAY_WBF_OUT_FROM||'15:00'),String(t.THURSDAY_WBF_OUT_TO||'16:30'),String(t.THURSDAY_WBF_DURATION_MINUTES||'450'),
    new Date(), normalizeEmail_(actor), String(source||'SISTEM'), JSON.stringify(snapshot)
  ];
}

function appendScheduleHistoryRows_(rows) {
  if (!rows || !rows.length) return 0;
  const sh = getScheduleHistorySheet_();
  const start = sh.getLastRow()+1;
  sh.getRange(start,1,rows.length,EK_SCHEDULE_HISTORY_.HEADERS.length).setValues(rows);
  sh.getRange(start,3,rows.length,1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.getRange(start,17,rows.length,1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
  invalidateScheduleHistoryCache_();
  return rows.length;
}

function ensureScheduleHistoryBaseline_(user, settings, effectiveAt, source) {
  if (!user || !user.email) return false;
  if (getScheduleHistoryForUser_(user.email).length) return false;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(3000)) return false;
  try {
    invalidateScheduleHistoryCache_();
    if (getScheduleHistoryForUser_(user.email).length) return false;
    const at = effectiveAt instanceof Date ? effectiveAt : new Date(effectiveAt || Date.now());
    appendScheduleHistoryRows_([scheduleHistoryRow_(user.email,makeScheduleSnapshot_(user,settings),at,user.email,source||'BASELINE')]);
    return true;
  } finally { lock.releaseLock(); }
}

function recordScheduleTransition_(email, beforeSnapshot, afterSnapshot, effectiveAt, actor, source) {
  if (!beforeSnapshot || !afterSnapshot || scheduleSnapshotSignature_(beforeSnapshot)===scheduleSnapshotSignature_(afterSnapshot)) return false;
  const lock=LockService.getScriptLock(); lock.waitLock(5000);
  try {
    invalidateScheduleHistoryCache_();
    const at=effectiveAt instanceof Date?effectiveAt:new Date(effectiveAt||Date.now());
    const history=getScheduleHistoryForUser_(email);
    const latest=history.length?history[history.length-1]:null;
    const rows=[];
    if(!latest||scheduleSnapshotSignature_(latest.snapshot)!==scheduleSnapshotSignature_(beforeSnapshot)){
      // Conservative bridge only: never backdate an uncaptured schedule across
      // old attendance. Existing old Status/StatusWaktu stays authoritative.
      rows.push(scheduleHistoryRow_(email,beforeSnapshot,new Date(at.getTime()-1),actor,`${source||'PERUBAHAN'}_SEBELUM`));
    }
    rows.push(scheduleHistoryRow_(email,afterSnapshot,at,actor,source||'PERUBAHAN'));
    appendScheduleHistoryRows_(rows);
    return true;
  } finally { lock.releaseLock(); }
}

function recordScheduleSettingsTransitions_(entries, afterSettings, effectiveAt, actor, source) {
  const changed=(entries||[]).map(x=>({
    user:x.user,before:x.before,after:makeScheduleSnapshot_(x.user,afterSettings)
  })).filter(x=>scheduleSnapshotSignature_(x.before)!==scheduleSnapshotSignature_(x.after));
  if(!changed.length)return 0;
  const lock=LockService.getScriptLock(); lock.waitLock(10000);
  try{
    invalidateScheduleHistoryCache_();
    const all=getAllScheduleHistory_(), byEmail={};
    all.forEach(r=>(byEmail[r.email]||(byEmail[r.email]=[])).push(r));
    const at=effectiveAt instanceof Date?effectiveAt:new Date(effectiveAt||Date.now()), rows=[];
    changed.forEach(x=>{
      const email=normalizeEmail_(x.user.email), history=byEmail[email]||[], latest=history.length?history[history.length-1]:null;
      if(!latest||scheduleSnapshotSignature_(latest.snapshot)!==scheduleSnapshotSignature_(x.before)){
        rows.push(scheduleHistoryRow_(email,x.before,new Date(at.getTime()-1),actor,`${source||'TETAPAN'}_SEBELUM`));
      }
      rows.push(scheduleHistoryRow_(email,x.after,at,actor,source||'TETAPAN'));
    });
    appendScheduleHistoryRows_(rows);
    return changed.length;
  }finally{lock.releaseLock();}
}

function getScheduleTimingContext_(user, settings, moment) {
  if(!user||!moment)return {known:false,schedule:null,snapshot:null};
  const ms=dateValueMs_(moment); if(!ms)return {known:false,schedule:null,snapshot:null};
  const versions=getScheduleHistoryForUser_(user.email).filter(r=>Number(r.effectiveMs||0)<=ms);
  if(!versions.length)return {known:false,schedule:null,snapshot:null};
  const snapshot=versions[versions.length-1].snapshot||{};
  const s=snapshot.schedule||{};
  return {known:true,snapshot,version:versions[versions.length-1],schedule:{
    s1In:s.s1In||'',s1Out:s.s1Out||'',s2In:s.s2In||'',s2Out:s.s2Out||'',maxPunchIn:s.maxPunchIn||'',
    allowSecondSession:!!s.allowSecondSession,lateAfter:s.s1In||'',punchOutFrom:s.s1Out||''
  }};
}

function getThursdayWbfOutReferenceFromTimingContext_(ctx,dateKey,values) {
  if(!ctx||!ctx.known||!ctx.snapshot||!ctx.snapshot.wbfEligible)return '';
  const settings=ctx.snapshot.timingSettings||{};
  if(String(settings.THURSDAY_WBF_ENABLED||'TRUE').toUpperCase()==='FALSE')return '';
  if(new Date(`${dateKey}T12:00:00+08:00`).getDay()!==4)return '';
  const v=padAttendanceValues_(values||[]); if(!v[4])return '';
  const inM=timeToMinutes_(formatTime_(v[4]));
  const inFrom=timeToMinutes_(settings.THURSDAY_WBF_IN_FROM||'07:30'), inTo=timeToMinutes_(settings.THURSDAY_WBF_IN_TO||'09:00');
  const outFrom=timeToMinutes_(settings.THURSDAY_WBF_OUT_FROM||'15:00'), outTo=timeToMinutes_(settings.THURSDAY_WBF_OUT_TO||'16:30');
  if(![inM,inFrom,inTo,outFrom,outTo].every(Number.isFinite)||inM>inTo||inFrom>inTo||outFrom>outTo)return '';

  // Gunakan kaedah yang sama seperti punch masa nyata: ketibaan sebelum mula
  // WBF dikira dari waktu mula WBF, bukan dianggap tidak layak lalu fallback ke
  // jadual biasa. Ini juga membetulkan paparan sejarah/Kad Perakam secara dinamik.
  const effectiveIn=Math.max(inM,inFrom);
  const expected=effectiveIn+Math.max(1,Number(settings.THURSDAY_WBF_DURATION_MINUTES||450));
  if(!Number.isFinite(expected))return '';
  return minutesToTime_(Math.min(outTo,Math.max(outFrom,expected)));
}

function getFinalOutReferenceFromTimingContext_(ctx,dateKey,values) {
  if(!ctx||!ctx.known)return '';
  const wbf=getThursdayWbfOutReferenceFromTimingContext_(ctx,dateKey,values);
  if(wbf)return wbf;
  return String((ctx.schedule&&(ctx.schedule.s2Out||ctx.schedule.s1Out))||'').trim();
}

function scheduleHistoryActor_() {
  try{return normalizeEmail_(Session.getActiveUser().getEmail()||Session.getEffectiveUser().getEmail())||'SHEET_EDIT';}
  catch(e){return 'SHEET_EDIT';}
}

function handleUserScheduleHistoryEdit_(e) {
  const range=e.range, row=range.getRow(), col=range.getColumn();
  if(row<2||range.getNumRows()!==1||range.getNumColumns()!==1)return;
  const watched=[4,6,7,8,20,21,22,23,24]; if(!watched.includes(col))return;
  const sh=range.getSheet(), current=sh.getRange(row,1,1,EK.USER_HEADERS.length).getValues()[0], before=current.slice();
  const oldValue=e.oldValue==null?'':e.oldValue;
  before[col-1]=oldValue;
  const mirrors={6:21,21:6,8:22,22:8}, mirrorCol=mirrors[col]||0;
  if(mirrorCol){
    const newValue=range.getValue();
    sh.getRange(row,mirrorCol).setValue(newValue);
    current[mirrorCol-1]=newValue;
    before[mirrorCol-1]=oldValue;
  }
  const beforeUser=userFromRow_(before,row), afterUser=userFromRow_(current,row), settings=getSettings_();
  invalidateUsersCache_();
  recordScheduleTransition_(afterUser.email,makeScheduleSnapshot_(beforeUser,settings),makeScheduleSnapshot_(afterUser,settings),new Date(),scheduleHistoryActor_(),'SHEET_EDIT_PENGGUNA');
}

function handleSettingsScheduleHistoryEdit_(e) {
  const range=e.range;
  if(range.getRow()<2||range.getColumn()!==2||range.getNumRows()!==1||range.getNumColumns()!==1)return;
  const key=String(range.getSheet().getRange(range.getRow(),1).getDisplayValue()||'').trim();
  const watched=new Set(['DEFAULT_LATE_AFTER','DEFAULT_MAX_PUNCH_IN','DEFAULT_PUNCH_OUT_FROM','DEFAULT_S1_IN','DEFAULT_S1_OUT','DEFAULT_S2_IN','DEFAULT_S2_OUT','ALLOW_OPTIONAL_SECOND_SESSION','THURSDAY_WBF_ENABLED','THURSDAY_WBF_IN_FROM','THURSDAY_WBF_IN_TO','THURSDAY_WBF_OUT_FROM','THURSDAY_WBF_OUT_TO','THURSDAY_WBF_DURATION_MINUTES']);
  if(!watched.has(key))return;
  invalidateSettingsCache_();
  const after=getSettings_(), before=Object.assign({},after);
  before[key]=e.oldValue==null?'':String(e.oldValue);
  const entries=getAllUsers_().map(user=>({user,before:makeScheduleSnapshot_(user,before)}));
  recordScheduleSettingsTransitions_(entries,after,new Date(),scheduleHistoryActor_(),'SHEET_EDIT_TETAPAN');
}

function onEdit(e) {
  try{
    if(!e||!e.range)return;
    const name=e.range.getSheet().getName();
    if(name===EK.SHEETS.USERS)handleUserScheduleHistoryEdit_(e);
    else if(name===EK.SHEETS.SETTINGS)handleSettingsScheduleHistoryEdit_(e);
  }catch(err){
    try{audit_('SEJARAH_JADUAL_GAGAL',e&&e.range?e.range.getSheet().getName():'ON_EDIT',String(err&&err.message?err.message:err),'SHEET_EDIT');}catch(_e){}
  }
}
