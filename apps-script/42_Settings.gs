// ---------- Location ----------

function validateAndMeasureLocation_(location, settings) {
  if (!location) throw new Error('Lokasi tidak diterima. Sila benarkan akses lokasi pada pelayar.');
  const lat = Number(location.lat);
  const lng = Number(location.lng);
  const accuracy = Number(location.accuracy);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('Koordinat GPS tidak sah.');
  if (!Number.isFinite(accuracy) || accuracy < 0) throw new Error('Ketepatan GPS tidak sah.');

  const maxAccuracy = Number(settings.MAX_GPS_ACCURACY_M);
  if (accuracy > maxAccuracy) {
    throw new Error(`Isyarat GPS terlalu lemah (±${Math.round(accuracy)}m). Had sistem ialah ±${Math.round(maxAccuracy)}m. Cuba di kawasan terbuka dan tekan semula.`);
  }

  const schoolLat = Number(settings.SCHOOL_LAT);
  const schoolLng = Number(settings.SCHOOL_LNG);
  const distance = Math.round(haversineMeters_(lat, lng, schoolLat, schoolLng));
  const radius = Number(settings.RADIUS_M);
  if (distance > radius) {
    throw new Error(`Anda berada kira-kira ${distance}m dari lokasi yang ditetapkan. Rekod waktu hanya dibenarkan dalam radius ${radius}m.`);
  }
  return {lat, lng, accuracyM: Math.round(accuracy), distanceM: distance};
}

function haversineMeters_(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = toRad_(lat2 - lat1);
  const dLon = toRad_(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad_(lat1)) * Math.cos(toRad_(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad_(deg) { return deg * Math.PI / 180; }

function validateLocationSettings_(s) {
  validateLatLng_(s.SCHOOL_LAT, s.SCHOOL_LNG);
  if (!(Number(s.RADIUS_M) > 0)) throw new Error('RADIUS_M belum ditetapkan dengan betul.');
}

function validateLatLng_(lat, lng) {
  const a = Number(lat), b = Number(lng);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a < -90 || a > 90 || b < -180 || b > 180) {
    throw new Error('Koordinat sekolah belum lengkap / tidak sah. Isi SCHOOL_LAT dan SCHOOL_LNG di TETAPAN.');
  }
}

// ---------- System date boundary ----------

function normalizeSystemStartDate_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) return Utilities.formatDate(value, tz_(), 'yyyy-MM-dd');
  const raw = String(value == null ? '' : value).trim();
  if (!raw) return EK.DEFAULT_SETTINGS.SYSTEM_START_DATE;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return validateDateKey_(raw);
  const dmy = raw.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if (dmy) return validateDateKey_(`${dmy[3]}-${String(dmy[2]).padStart(2,'0')}-${String(dmy[1]).padStart(2,'0')}`);
  throw new Error('SYSTEM_START_DATE di sheet TETAPAN tidak sah. Gunakan format YYYY-MM-DD, contoh 2026-09-01.');
}

function getSystemStartDate_(settings) {
  settings = settings || getSettings_();
  return normalizeSystemStartDate_(settings.SYSTEM_START_DATE || EK.DEFAULT_SETTINGS.SYSTEM_START_DATE);
}

function isOnOrAfterSystemStart_(dateKey, settings) {
  dateKey = validateDateKey_(dateKey);
  return dateKey >= getSystemStartDate_(settings);
}

function clampToSystemStart_(dateKey, settings) {
  dateKey = validateDateKey_(dateKey);
  const start = getSystemStartDate_(settings);
  return dateKey < start ? start : dateKey;
}

function assertSystemDate_(dateKey, settings, label) {
  dateKey = validateDateKey_(dateKey);
  const start = getSystemStartDate_(settings);
  if (dateKey < start) throw new Error(`${label || 'Tarikh'} sebelum tarikh mula sistem (${start}) dan tidak diambil kira.`);
  return dateKey;
}

// ---------- Settings ----------

function getSettings_() {
  if (EK_RUNTIME_SETTINGS_) return EK_RUNTIME_SETTINGS_;
  const cached = cacheGetJson_(EK_PERF.SETTINGS_CACHE_KEY);
  if (cached && typeof cached === 'object') {
    EK_RUNTIME_SETTINGS_ = Object.assign({}, EK.DEFAULT_SETTINGS, cached);
    return EK_RUNTIME_SETTINGS_;
  }

  const sh = getSheetOrThrow_(EK.SHEETS.SETTINGS);
  const result = Object.assign({}, EK.DEFAULT_SETTINGS);
  let hasSystemStartDate = false;
  if (sh.getLastRow() >= 2) {
    const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getDisplayValues();
    rows.forEach(r => {
      const key = String(r[0] || '').trim();
      if (key) {
        result[key] = String(r[1] == null ? '' : r[1]).trim();
        if (key === 'SYSTEM_START_DATE') hasSystemStartDate = true;
      }
    });
  }
  // Self-heal untuk deployment sedia ada: tambah satu baris yang boleh terus
  // diedit di Google Sheet walaupun setupSystem() belum dijalankan semula.
  if (!hasSystemStartDate) {
    sh.appendRow(['SYSTEM_START_DATE', EK.DEFAULT_SETTINGS.SYSTEM_START_DATE, 'Tarikh mula rasmi e-Keberadaan. Semua tarikh sebelum ini diabaikan. Ubah dalam format YYYY-MM-DD jika mahu memasukkan sejarah lebih awal.']);
    const row = sh.getLastRow();
    sh.getRange(row, 2).setNumberFormat('@');
    sh.getRange(row, 1, 1, 3).setFontWeight('bold');
    result.SYSTEM_START_DATE = EK.DEFAULT_SETTINGS.SYSTEM_START_DATE;
  }
  result.SYSTEM_START_DATE = normalizeSystemStartDate_(result.SYSTEM_START_DATE);
  EK_RUNTIME_SETTINGS_ = result;
  cachePutJson_(EK_PERF.SETTINGS_CACHE_KEY, result, EK_PERF.SETTINGS_TTL_SEC);
  return EK_RUNTIME_SETTINGS_;
}

function publicSettings_(s) {
  return {
    schoolName: s.SCHOOL_NAME,
    schoolLat: s.SCHOOL_LAT,
    schoolLng: s.SCHOOL_LNG,
    radiusM: Number(s.RADIUS_M),
    maxGpsAccuracyM: Number(s.MAX_GPS_ACCURACY_M),
    defaultLateAfter: s.DEFAULT_LATE_AFTER,
    defaultMaxPunchIn: s.DEFAULT_MAX_PUNCH_IN,
    defaultPunchOutFrom: s.DEFAULT_PUNCH_OUT_FROM,
    defaultS1In: s.DEFAULT_S1_IN || s.DEFAULT_LATE_AFTER,
    defaultS1Out: s.DEFAULT_S1_OUT || s.DEFAULT_PUNCH_OUT_FROM,
    defaultS2In: s.DEFAULT_S2_IN || '',
    defaultS2Out: s.DEFAULT_S2_OUT || '',
    absentAfter: s.ABSENT_AFTER,
    punchReminderEnabled: String(s.PUNCH_REMINDER_ENABLED || 'TRUE').toUpperCase() !== 'FALSE' ? 'TRUE' : 'FALSE',
    punchReminderTime: s.PUNCH_REMINDER_TIME || '09:00',
    workingDays: s.WORKING_DAYS || EK.DEFAULT_SETTINGS.WORKING_DAYS,
    ipTrackingEnabled: String(s.IP_TRACKING_ENABLED || 'TRUE').toUpperCase() !== 'FALSE' ? 'TRUE' : 'FALSE',
    ipPunchPolicy: normalizeIpPunchPolicy_(s.IP_PUNCH_POLICY || 'WARN'),
    systemMode: String(s.SYSTEM_MODE || 'REAL').toUpperCase(),
    systemStartDate: getSystemStartDate_(s),
    profileRootFolderId: s.PROFILE_ROOT_FOLDER_ID || ''
  };
}

function findSettingRow_(sh, key) {
  if (sh.getLastRow() < 2) return null;
  const keys = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getDisplayValues().flat();
  const i = keys.findIndex(k => String(k).trim() === key);
  return i < 0 ? null : i + 2;
}
