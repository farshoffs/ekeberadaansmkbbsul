// ---------- One-time legacy schedule repair helpers ----------
// This module repairs the known Farhan transition that happened before
// effective-dated schedule history was available:
//   01-12 Sep 2026 : Sesi 1 Masuk = 08:30
//   13 Sep 2026 -> : Sesi 1 Masuk = 07:30
//
// It is deliberately explicit and idempotent. Run
// repairFarhanScheduleHistorySep2026() once from the Apps Script editor after
// deploying this version. It only rewrites Status/StatusWaktu and stale time
// reviews; punch timestamps, GPS and IP data are never changed.

function assertScheduleHistoryRuntimeForLegacyRepair_() {
  const missing = [];
  if (typeof makeScheduleSnapshot_ !== 'function') missing.push('makeScheduleSnapshot_');
  if (typeof getScheduleHistoryForUser_ !== 'function') missing.push('getScheduleHistoryForUser_');
  if (typeof scheduleSnapshotSignature_ !== 'function') missing.push('scheduleSnapshotSignature_');
  if (typeof scheduleHistoryRow_ !== 'function') missing.push('scheduleHistoryRow_');
  if (typeof appendScheduleHistoryRows_ !== 'function') missing.push('appendScheduleHistoryRows_');
  if (typeof getScheduleTimingContext_ !== 'function') missing.push('getScheduleTimingContext_');
  if (missing.length) {
    throw new Error(
      'Modul Sejarah Jadual belum lengkap dalam project Apps Script ini. ' +
      'Sync fail berikut daripada branch refactor/performance-v2: ' +
      '20_UserApi.gs, 21_AdminApi.gs, 43_ScheduleHistory.gs, 44_LegacyScheduleRepair.gs dan 60_TimeReview.gs. ' +
      'Helper yang belum ditemui: ' + missing.join(', ')
    );
  }
  return true;
}

function verifyScheduleHistoryFeatureInstallation() {
  assertScheduleHistoryRuntimeForLegacyRepair_();
  return {
    ok: true,
    message: 'Modul Sejarah Jadual lengkap dan repair Farhan boleh dijalankan.',
    requiredFiles: [
      '20_UserApi.gs',
      '21_AdminApi.gs',
      '43_ScheduleHistory.gs',
      '44_LegacyScheduleRepair.gs',
      '60_TimeReview.gs'
    ]
  };
}

function cleanupInvalidTimeReviewsForUserHistory_(email, fromDate, toDate) {
  email = normalizeEmail_(email);
  fromDate = validateDateKey_(fromDate);
  toDate = validateDateKey_(toDate);
  if (!email || toDate < fromDate) return 0;

  const user = getUserByEmail_(email, false);
  if (!user) return 0;
  const settings = getSettings_();
  const stale = [];

  readTimeReviewRows_()
    .filter(r => r.email === email && r.date >= fromDate && r.date <= toDate)
    .forEach(r => {
      const rec = findAttendanceRecord_(r.date, email);
      if (!rec) return;
      const flags = inferAttendanceFlags_(rec.values, user, settings, r.date);
      if (!flags.includes(String(r.type || '').toUpperCase())) stale.push(r);
    });

  if (!stale.length) return 0;
  const sh = getTimeReviewSheet_();
  stale.sort((a, b) => b.row - a.row).forEach(r => sh.deleteRow(r.row));
  invalidateTimeReviewRows_();
  audit_(
    'BAIKI_SEMAKAN_WAKTU_SEJARAH',
    `${email} ${fromDate}..${toDate}`,
    `${stale.length} rekod semakan yang tidak lagi sah dibuang selepas sejarah jadual dibetulkan`,
    'SISTEM'
  );
  return stale.length;
}

function repairLegacyScheduleHistoryForUser_(email, oldS1In, changeDate, actor) {
  assertScheduleHistoryRuntimeForLegacyRepair_();
  email = normalizeEmail_(email);
  oldS1In = normalizeTime_(oldS1In);
  changeDate = validateDateKey_(changeDate);
  actor = normalizeEmail_(actor) || 'SISTEM';

  const user = getUserByEmail_(email, false);
  if (!user) throw new Error('Pengguna untuk pembetulan sejarah jadual tidak dijumpai.');

  const settings = getSettings_();
  const current = makeScheduleSnapshot_(user, settings);
  const currentS1In = String((current.schedule || {}).s1In || '');
  if (!currentS1In) throw new Error('Waktu Sesi 1 semasa pengguna tidak tersedia.');

  const fromDate = getSystemStartDate_(settings);
  const changeMs = new Date(`${changeDate}T00:00:00+08:00`).getTime();
  if (!Number.isFinite(changeMs)) throw new Error('Tarikh perubahan jadual tidak sah.');
  const previousDate = Utilities.formatDate(new Date(changeMs - 86400000), EK.TIMEZONE, 'yyyy-MM-dd');
  if (previousDate < fromDate) throw new Error('Tarikh perubahan lebih awal daripada SYSTEM_START_DATE.');

  const before = JSON.parse(JSON.stringify(current));
  before.schedule.s1In = oldS1In;

  const oldAt = new Date(`${fromDate}T00:00:00+08:00`);
  const newAt = new Date(changeMs);
  const history = getScheduleHistoryForUser_(email);
  const oldSig = scheduleSnapshotSignature_(before);
  const newSig = scheduleSnapshotSignature_(current);
  const rows = [];

  const hasOldBoundary = history.some(r =>
    Math.abs(Number(r.effectiveMs || 0) - oldAt.getTime()) < 1000 &&
    scheduleSnapshotSignature_(r.snapshot) === oldSig
  );
  const hasNewBoundary = history.some(r =>
    Math.abs(Number(r.effectiveMs || 0) - newAt.getTime()) < 1000 &&
    scheduleSnapshotSignature_(r.snapshot) === newSig
  );

  if (!hasOldBoundary) {
    rows.push(scheduleHistoryRow_(email, before, oldAt, actor, `MIGRASI_LEGASI_${oldS1In.replace(':', '')}`));
  }
  if (!hasNewBoundary) {
    rows.push(scheduleHistoryRow_(email, current, newAt, actor, `MIGRASI_LEGASI_${currentS1In.replace(':', '')}`));
  }
  if (rows.length) appendScheduleHistoryRows_(rows);

  const repaired = repairAttendanceTimingStatuses_({
    from: fromDate,
    to: previousDate,
    actor,
    audit: true
  });

  const reviewsRemoved = cleanupInvalidTimeReviewsForUserHistory_(email, fromDate, previousDate);
  const reviewsCreated = ensureTimeReviewRowsForRange_(fromDate, previousDate);

  const result = {
    ok: true,
    email,
    fromDate,
    previousScheduleS1In: oldS1In,
    changeDate,
    currentScheduleS1In: currentS1In,
    historyRowsAdded: rows.length,
    attendanceRowsChecked: Number(repaired.rowsChecked || 0),
    attendanceRowsUpdated: Number(repaired.rowsUpdated || 0),
    reviewsRemoved,
    reviewsCreated
  };

  audit_(
    'MIGRASI_JADUAL_LEGASI',
    email,
    `S1 ${oldS1In} hingga ${previousDate}; S1 ${currentS1In} mulai ${changeDate}; ` +
      `status dikemas kini=${result.attendanceRowsUpdated}; semakan dibuang=${reviewsRemoved}; semakan diwujudkan=${reviewsCreated}`,
    actor
  );
  console.log(JSON.stringify(result));
  return result;
}

function repairFarhanScheduleHistorySep2026() {
  assertScheduleHistoryRuntimeForLegacyRepair_();
  const admin = requireGoogleAdmin_();
  let user = getUserByEmail_(normalizeEmail_(EK.EMAIL.OWNER_EMAIL), false);
  if (!user || String(user.name || '').trim().toUpperCase() !== 'MUHAMMAD FARHAN BIN SHOFFI') {
    user = getAllUsers_().find(u => String(u.name || '').trim().toUpperCase() === 'MUHAMMAD FARHAN BIN SHOFFI') || user;
  }
  if (!user) throw new Error('Akaun Muhammad Farhan bin Shoffi tidak dijumpai.');

  const current = getEffectiveSchedule_(user, getSettings_());
  if (String(current.s1In || '') !== '07:30') {
    throw new Error(`Pembetulan ini menjangka WaktuLewat/Sesi 1 Masuk semasa 07:30, tetapi nilai semasa ialah ${current.s1In || '(kosong)'}.`);
  }

  return repairLegacyScheduleHistoryForUser_(user.email, '08:30', '2026-09-13', admin.email);
}
