// ---------- Users ----------

function getAllUsers_() {
  if (Array.isArray(EK_RUNTIME_USERS_)) return EK_RUNTIME_USERS_;
  const cached = cacheGetJson_(EK_PERF.USERS_CACHE_KEY);
  if (Array.isArray(cached)) { EK_RUNTIME_USERS_ = cached; return EK_RUNTIME_USERS_; }

  const sh = getSheetOrThrow_(EK.SHEETS.USERS);
  if (sh.getLastRow() < 2) { EK_RUNTIME_USERS_ = []; return EK_RUNTIME_USERS_; }
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, EK.USER_HEADERS.length).getValues();
  EK_RUNTIME_USERS_ = rows.map((v, i) => userFromRow_(v, i + 2)).filter(u => u.email);
  cachePutJson_(EK_PERF.USERS_CACHE_KEY, EK_RUNTIME_USERS_, EK_PERF.USERS_TTL_SEC);
  return EK_RUNTIME_USERS_;
}

function getUserByEmail_(email, activeOnly) {
  email = normalizeEmail_(email);
  if (!email) return null;
  return getAllUsers_().find(u => u.email === email && (!activeOnly || u.active)) || null;
}

function userFromRow_(v, row) {
  const sessionVersionRaw = Number(v[12]);
  const rawCategory = String(v[3] || '').trim() || 'PPP';
  const category = rawCategory === 'Pentadbir' ? 'Pengurusan' : rawCategory;
  return {
    row,
    active: toBool_(v[0]),
    name: String(v[1] || '').trim(),
    email: normalizeEmail_(v[2]),
    category,
    isAdmin: toBool_(v[4]),
    // Legacy schedule fields are kept as fallbacks so existing sheets migrate
    // without losing per-user settings. New schedules live in columns T:X.
    lateAfter: normalizeOptionalTime_(v[5]),
    maxPunchIn: normalizeOptionalTime_(v[6]),
    punchOutFrom: normalizeOptionalTime_(v[7]),
    note: String(v[8] || ''),
    passwordSalt: String(v[9] || ''),
    passwordHash: String(v[10] || ''),
    mustChangePassword: toBool_(v[11]),
    sessionVersion: Number.isFinite(sessionVersionRaw) && sessionVersionRaw > 0 ? sessionVersionRaw : 1,
    failedLoginCount: Math.max(0, Number(v[13]) || 0),
    lockedUntil: v[14] || '',
    passwordUpdatedAt: v[15] || '',
    profilePhotoFileId: String(v[16] || '').trim(),
    profilePhotoUpdatedAt: v[17] || '',
    authType: String(v[18] || '').trim().toUpperCase(),
    jobTitle: String(v[19] || '').trim(),
    s1In: normalizeOptionalTime_(v[20]),
    s1Out: normalizeOptionalTime_(v[21]),
    s2In: normalizeOptionalTime_(v[22]),
    s2Out: normalizeOptionalTime_(v[23])
  };
}

function publicUser_(u) {
  const lockedDate = u.lockedUntil instanceof Date ? u.lockedUntil : (u.lockedUntil ? new Date(u.lockedUntil) : null);
  const isLocked = !!(lockedDate && !isNaN(lockedDate.getTime()) && lockedDate.getTime() > Date.now());
  return {
    active: !!u.active,
    name: u.name,
    email: u.email,
    category: u.category,
    jobTitle: u.jobTitle || '',
    isAdmin: !!u.isAdmin,
    lateAfter: u.lateAfter || '',
    maxPunchIn: u.maxPunchIn || '',
    punchOutFrom: u.punchOutFrom || '',
    s1In: u.s1In || '',
    s1Out: u.s1Out || '',
    s2In: u.s2In || '',
    s2Out: u.s2Out || '',
    note: u.note || '',
    passwordSet: !!u.passwordHash,
    pinSet: String(u.authType || '').toUpperCase() === EK.PASSWORD.AUTH_TYPE && !!u.passwordHash,
    authType: String(u.authType || ''),
    mustChangePassword: !!u.mustChangePassword,
    sessionVersion: Math.max(1, Number(u.sessionVersion || 1)),
    isLocked: isLocked,
    lockedUntil: isLocked ? formatDateTime_(lockedDate) : '',
    hasProfilePhoto: !!u.profilePhotoFileId,
    profilePhotoVersion: u.profilePhotoUpdatedAt instanceof Date && !isNaN(u.profilePhotoUpdatedAt.getTime())
      ? u.profilePhotoUpdatedAt.getTime()
      : String(u.profilePhotoUpdatedAt || ''),
    canManageAbsence: isManagementUser_(u)
  };
}

function getEffectiveSchedule_(user, settings) {
  const s1In = user.s1In || user.lateAfter || settings.DEFAULT_S1_IN || settings.DEFAULT_LATE_AFTER;
  const s1Out = user.s1Out || user.punchOutFrom || settings.DEFAULT_S1_OUT || settings.DEFAULT_PUNCH_OUT_FROM;
  const s2In = user.s2In || settings.DEFAULT_S2_IN || '';
  const s2Out = user.s2Out || settings.DEFAULT_S2_OUT || '';
  const maxPunchIn = user.maxPunchIn || settings.DEFAULT_MAX_PUNCH_IN || '10:00';
  const allowSecondSession = String(settings.ALLOW_OPTIONAL_SECOND_SESSION || 'TRUE').toUpperCase() !== 'FALSE';
  return {s1In,s1Out,s2In,s2Out,maxPunchIn,allowSecondSession,lateAfter:s1In,punchOutFrom:s1Out};
}

function minutesToTime_(minutes) {
  minutes=Math.max(0,Math.min(1439,Math.round(Number(minutes)||0)));
  return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
}
function isThursdayWbfUser_(user) {
  return !!user && (String(user.category||'').trim().toUpperCase()==='AKP' || /\bPENGETUA\b/i.test(String(user.jobTitle||'')));
}
function getThursdayWbfOutReference_(user,settings,dateKey,values) {
  if(!isThursdayWbfUser_(user) || String(settings.THURSDAY_WBF_ENABLED||'TRUE').toUpperCase()==='FALSE') return '';
  if(new Date(`${dateKey}T12:00:00+08:00`).getDay()!==4) return '';
  const v=padAttendanceValues_(values||[]); if(!v[4]) return '';
  const inM=timeToMinutes_(formatTime_(v[4]));
  const inFrom=timeToMinutes_(settings.THURSDAY_WBF_IN_FROM||'07:30'), inTo=timeToMinutes_(settings.THURSDAY_WBF_IN_TO||'09:00');
  const outFrom=timeToMinutes_(settings.THURSDAY_WBF_OUT_FROM||'15:00'), outTo=timeToMinutes_(settings.THURSDAY_WBF_OUT_TO||'16:30');
  if(![inM,inFrom,inTo,outFrom,outTo].every(Number.isFinite)||inM>inTo||inFrom>inTo||outFrom>outTo) return '';

  // Staf AKP/Pengetua yang hadir sebelum julat mula WBF tetap dianggap
  // bermula pada THURSDAY_WBF_IN_FROM. Ini mengelakkan ketibaan awal seperti
  // 07:16/07:18 terjatuh semula kepada waktu balik biasa dan ditanda BALIK AWAL.
  const effectiveIn=Math.max(inM,inFrom);
  const expected=effectiveIn+Math.max(1,Number(settings.THURSDAY_WBF_DURATION_MINUTES||450));
  if(!Number.isFinite(expected)) return '';
  return minutesToTime_(Math.min(outTo,Math.max(outFrom,expected)));
}
function hasSecondAttendanceSession_(schedule) {
  // TRUE means the user MAY continue with Sesi 2; it does not mean Sesi 2 is
  // compulsory on every day. Blank s2In/s2Out therefore remains valid for an
  // optional break/return workflow.
  return !!(schedule && (schedule.allowSecondSession || schedule.s2In || schedule.s2Out));
}

function getFinalOutReference_(schedule,user,settings,dateKey,values) {
  const wbf=getThursdayWbfOutReference_(user,settings,dateKey,values);
  if(wbf)return wbf;
  // A configured S2 out is authoritative. For an optional/unconfigured S2,
  // the employee still owes the normal S1 end time, so a later S2 departure is
  // compared against s1Out rather than inventing a second-session reference.
  return String((schedule&&(schedule.s2Out||schedule.s1Out))||'').trim();
}

function isProvisionalSession1Out_(dateKey,values,schedule,user,settings) {
  const v=padAttendanceValues_(values);
  if(!hasSecondAttendanceSession_(schedule)||v[22])return false;
  const key=dateCellToKey_(dateKey||v[0])||todayKey_();
  const today=todayKey_();
  if(key<today)return false;
  if(key>today)return true;
  const ref=getFinalOutReference_(schedule,user,settings,key,v);
  if(!ref)return true;
  return minutesNow_(new Date())<timeToMinutes_(ref);
}

function getPunchReferenceTime_(type,session,schedule,user,settings,dateKey,values) {
  if(type==='IN')return Number(session)===1?schedule.s1In:schedule.s2In;
  if(type==='OUT')return getFinalOutReference_(schedule,user,settings,dateKey,values);
  return '';
}
