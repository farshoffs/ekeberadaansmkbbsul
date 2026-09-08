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
    canManageAbsence: isManagementUser_(u)
  };
}

function getEffectiveSchedule_(user, settings) {
  const s1In = user.s1In || user.lateAfter || settings.DEFAULT_S1_IN || settings.DEFAULT_LATE_AFTER;
  const s1Out = user.s1Out || user.punchOutFrom || settings.DEFAULT_S1_OUT || settings.DEFAULT_PUNCH_OUT_FROM;
  const s2In = user.s2In || settings.DEFAULT_S2_IN || '';
  const s2Out = user.s2Out || settings.DEFAULT_S2_OUT || '';
  return {
    s1In, s1Out, s2In, s2Out,
    // Compatibility keys for older client code / existing reports. There is no
    // longer a hard 'masuk ditutup' or 'balik dibenarkan mulai' restriction.
    lateAfter: s1In,
    maxPunchIn: '',
    punchOutFrom: s1Out
  };
}
