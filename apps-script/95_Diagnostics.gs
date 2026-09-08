// ---------- Read-only runtime diagnostics ----------
// Run manually from the Apps Script editor after a deployment.
// This function is intentionally NOT exposed through the GitHub Pages bridge.
function diagnosePerformanceBackend() {
  const started = Date.now();
  const marks = {};
  const measure = (name, fn) => {
    const t = Date.now();
    const value = fn();
    marks[name] = Date.now() - t;
    return value;
  };

  const settings = measure('settingsMs', () => getSettings_());
  const users = measure('usersMs', () => getAllUsers_());
  const attendanceIndex = measure('attendanceIndexMs', () => getAttendanceRowIndex_());
  const todayRows = measure('attendanceTodayMs', () => getAttendanceByDate_(todayKey_()));
  const absenceRows = measure('absenceRowsMs', () => readAbsenceRows_());
  const timeReviewRows = measure('timeReviewRowsMs', () => readTimeReviewRows_());

  // Repeat the hot paths in the same execution. These should be near-zero or
  // materially faster because runtime/cache/index data has already been loaded.
  measure('settingsWarmMs', () => getSettings_());
  measure('usersWarmMs', () => getAllUsers_());
  measure('attendanceIndexWarmMs', () => getAttendanceRowIndex_());
  measure('attendanceTodayWarmMs', () => getAttendanceByDate_(todayKey_()));
  measure('absenceRowsWarmMs', () => readAbsenceRows_());
  measure('timeReviewRowsWarmMs', () => readTimeReviewRows_());

  const result = {
    ok: true,
    timezone: EK.TIMEZONE,
    spreadsheetTimezone: getSpreadsheet_().getSpreadsheetTimeZone(),
    today: todayKey_(),
    systemMode: settings.SYSTEM_MODE,
    counts: {
      users: users.length,
      attendanceRows: Math.max(0, Number(attendanceIndex.lastRow || 1) - 1),
      attendanceToday: todayRows.length,
      absenceRows: absenceRows.length,
      timeReviewRows: timeReviewRows.length
    },
    timingsMs: marks,
    totalMs: Date.now() - started
  };

  console.log(JSON.stringify(result));
  return result;
}
