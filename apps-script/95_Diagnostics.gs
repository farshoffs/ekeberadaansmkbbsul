// ---------- Read-only runtime diagnostics ----------
// Run manually from the Apps Script editor after a deployment.
// This function is intentionally NOT exposed through the GitHub Pages bridge.
// Launch-performance Phase 4 + client telemetry source marker: 2026-09-11.
// Schedule-history CI marker: 2026-09-13.
// Cache-growth audit marker: 2026-09-15.
function diagnosePerformanceBackend() {
  const started = Date.now();
  const marks = {};
  const measure = (name, fn) => {
    const t = Date.now();
    const value = fn();
    marks[name] = Date.now() - t;
    return value;
  };
  const jsonChars = value => {
    try { return JSON.stringify(value).length; } catch (e) { return -1; }
  };
  const estimatedCacheParts = chars => {
    if (chars < 0) return -1;
    if (chars <= EK_CACHE_JSON_.INLINE_MAX_CHARS) return 1;
    return Math.ceil(chars / EK_CACHE_JSON_.SHARD_CHARS);
  };

  const settings = measure('settingsMs', () => getSettings_());
  const users = measure('usersMs', () => getAllUsers_());
  const attendanceIndex = measure('attendanceIndexMs', () => getAttendanceRowIndex_());
  const todayRows = measure('attendanceTodayMs', () => getAttendanceByDate_(todayKey_()));
  const absenceRows = measure('absenceRowsMs', () => readAbsenceRows_());
  const timeReviewRows = measure('timeReviewRowsMs', () => readTimeReviewRows_());
  const scheduleHistory = measure('scheduleHistoryMs', () => getAllScheduleHistory_());
  const trustedDevices = measure('trustedDevicesMs', () => getTrustedDevices_('', true));

  measure('settingsWarmMs', () => getSettings_());
  measure('usersWarmMs', () => getAllUsers_());
  measure('attendanceIndexWarmMs', () => getAttendanceRowIndex_());
  measure('attendanceTodayWarmMs', () => getAttendanceByDate_(todayKey_()));
  measure('absenceRowsWarmMs', () => readAbsenceRows_());
  measure('timeReviewRowsWarmMs', () => readTimeReviewRows_());
  measure('scheduleHistoryWarmMs', () => getAllScheduleHistory_());
  measure('trustedDevicesWarmMs', () => getTrustedDevices_('', true));

  const payloadChars = {
    users: jsonChars(users),
    attendanceIndex: jsonChars(attendanceIndex),
    absenceRows: jsonChars(absenceRows),
    timeReviewRows: jsonChars(timeReviewRows),
    scheduleHistory: jsonChars(scheduleHistory),
    trustedDevices: jsonChars(trustedDevices)
  };
  const estimatedCachePartsByPayload = {};
  Object.keys(payloadChars).forEach(key => {
    estimatedCachePartsByPayload[key] = estimatedCacheParts(payloadChars[key]);
  });

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
      timeReviewRows: timeReviewRows.length,
      scheduleHistoryRows: scheduleHistory.length,
      trustedDeviceRows: trustedDevices.length
    },
    cacheHealth: {
      strategy: 'versioned JSON shards; manifest published after all shards',
      inlineMaxChars: EK_CACHE_JSON_.INLINE_MAX_CHARS,
      shardChars: EK_CACHE_JSON_.SHARD_CHARS,
      maxShards: EK_CACHE_JSON_.MAX_SHARDS,
      maxCacheableCharsApprox: EK_CACHE_JSON_.SHARD_CHARS * EK_CACHE_JSON_.MAX_SHARDS,
      payloadChars,
      estimatedCacheParts: estimatedCachePartsByPayload,
      attendanceWithinConfiguredShardCap: estimatedCachePartsByPayload.attendanceIndex <= EK_CACHE_JSON_.MAX_SHARDS
    },
    launchReadiness: {
      targetDailyUsers: 100,
      attendanceIndex: 'date+email direct lookup / daily batched row slots / sharded cross-execution cache',
      punchLock: 'daily batched row slots + direct per-user row writes; global lock only for one-time slot allocation',
      punchRead: 'reuses row returned by daily slot allocator; avoids a second Sheet row read on normal punch path',
      clientTelemetry: 'trusted-device background device metadata sync',
      note: 'Burst harness remains the launch gate; cacheHealth now shows when Sheet growth approaches the configured cache-shard cap.'
    },
    timingsMs: marks,
    totalMs: Date.now() - started
  };

  console.log(JSON.stringify(result));
  return result;
}
