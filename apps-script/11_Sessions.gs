// ---------- Trusted-device session (30-day rolling, max 2 devices) ----------
const EK_TRUSTED_TOUCH_MIN_INTERVAL_MS_ = 5 * 60 * 1000;

function trustedDeviceCredentialParts_(credential) {
  const raw = String(credential || '').trim();
  const m = raw.match(/^([0-9a-f-]{36})\.([0-9a-f]{64})$/i);
  if (!m) throw new Error('Trusted device tidak sah. Sila log masuk semula.');
  return {deviceId:m[1].toLowerCase(), secret:m[2].toLowerCase()};
}

function hashTrustedDeviceSecret_(deviceId, secret) {
  const material = String(deviceId || '') + '\n' + String(secret || '');
  return Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(material, getSessionSecret_(), Utilities.Charset.UTF_8)
  );
}

function trustedDeviceFromRow_(v, row) {
  return {
    row,
    deviceId:String(v[0] || '').trim().toLowerCase(),
    email:normalizeEmail_(v[1]),
    deviceName:String(v[2] || '').trim(),
    platform:String(v[3] || '').trim(),
    browser:String(v[4] || '').trim(),
    lastIp:String(v[5] || '').trim(),
    createdAt:v[6] || '',
    lastSeenAt:v[7] || '',
    expiresAt:v[8] || '',
    active:toBool_(v[9]),
    sessionVersion:Math.max(1, Number(v[10]) || 1),
    tokenHash:String(v[11] || '').trim(),
    revokeReason:String(v[12] || '').trim()
  };
}

function getTrustedDevices_(email, includeInactive) {
  let all = EK_RUNTIME_TRUSTED_DEVICES_;
  if (!Array.isArray(all)) {
    all = cacheGetJson_(EK_PERF.TRUSTED_DEVICES_CACHE_KEY);
    if (!Array.isArray(all)) {
      const sh = ensureTrustedDevicesSheet_();
      if (sh.getLastRow() < 2) all = [];
      else {
        const rows = sh.getRange(2, 1, sh.getLastRow() - 1, EK.TRUSTED_DEVICE_HEADERS.length).getValues();
        all = rows.map((v,i)=>trustedDeviceFromRow_(v,i+2)).filter(d=>d.deviceId&&d.email);
      }
      cachePutJson_(EK_PERF.TRUSTED_DEVICES_CACHE_KEY, all, EK_PERF.TRUSTED_DEVICES_TTL_SEC);
    }
    EK_RUNTIME_TRUSTED_DEVICES_ = all;
  }
  const target = normalizeEmail_(email);
  return all.filter(d => (!target || d.email === target) && (includeInactive || d.active));
}

function findTrustedDeviceById_(deviceId) {
  deviceId = String(deviceId || '').trim().toLowerCase();
  if (!deviceId) return null;
  return getTrustedDevices_('', true).find(d => d.deviceId === deviceId) || null;
}

function browserNameFromUa_(ua) {
  ua = String(ua || '');
  if (/Edg\//i.test(ua)) return 'Microsoft Edge';
  if (/OPR\//i.test(ua)) return 'Opera';
  if (/CriOS|Chrome\//i.test(ua)) return 'Chrome';
  if (/FxiOS|Firefox\//i.test(ua)) return 'Firefox';
  if (/Safari\//i.test(ua) && !/Chrome|CriOS|Chromium/i.test(ua)) return 'Safari';
  return 'Pelayar';
}

function platformNameFromClientInfo_(ci) {
  const ua = String(ci && ci.userAgent || '');
  const pf = String(ci && ci.platform || '');
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android';
  if (/Windows/i.test(ua) || /Win/i.test(pf)) return 'Windows';
  if (/Macintosh|Mac OS/i.test(ua) || /Mac/i.test(pf)) return 'Mac';
  if (/Linux/i.test(ua) || /Linux/i.test(pf)) return 'Linux';
  return pf || 'Peranti';
}

function deviceNameFromClientInfo_(ci) {
  return `${platformNameFromClientInfo_(ci)} · ${browserNameFromUa_(ci && ci.userAgent)}`;
}

function newTrustedDeviceSecret_() {
  return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '').toLowerCase();
}

function dateMillis_(v) {
  if (v instanceof Date && !isNaN(v.getTime())) return v.getTime();
  const d = v ? new Date(v) : null;
  return d && !isNaN(d.getTime()) ? d.getTime() : 0;
}

function verifyTrustedDeviceCredential_(credential, expectedEmail, expectedDeviceId) {
  const parts = trustedDeviceCredentialParts_(credential);
  if (expectedDeviceId && parts.deviceId !== String(expectedDeviceId || '').trim().toLowerCase()) {
    throw new Error('Trusted device tidak sepadan dengan sesi ini. Sila log masuk semula.');
  }
  const rec = findTrustedDeviceById_(parts.deviceId);
  if (!rec || !rec.active) throw new Error('Trusted device ini telah dibatalkan. Sila log masuk semula.');
  if (expectedEmail && rec.email !== normalizeEmail_(expectedEmail)) throw new Error('Trusted device tidak sepadan dengan akaun.');
  if (dateMillis_(rec.expiresAt) && Date.now() > dateMillis_(rec.expiresAt)) {
    revokeTrustedDeviceById_(rec.deviceId, rec.email, 'TAMAT_30_HARI');
    throw new Error('Trusted device telah tamat. Sila log masuk semula.');
  }
  const actual = hashTrustedDeviceSecret_(rec.deviceId, parts.secret);
  if (!constantTimeEquals_(actual, rec.tokenHash)) throw new Error('Trusted device tidak sah. Sila log masuk semula.');
  return rec;
}

function registerOrRefreshTrustedDevice_(user, clientInfo, existingCredential) {
  const ci = normalizeClientInfo_(clientInfo);
  let existing = null;
  if (existingCredential) {
    try {
      existing = verifyTrustedDeviceCredential_(existingCredential, user.email);
      if (Number(existing.sessionVersion || 0) !== Math.max(1, Number(user.sessionVersion || 1))) {
        revokeTrustedDeviceById_(existing.deviceId, user.email, 'VERSI_SESI_BERUBAH');
        existing = null;
      }
    } catch (e) { existing = null; }
  }
  if (existing) {
    touchTrustedDevice_(existing, ci, true);
    existing.credential = String(existingCredential || '').trim();
    return existing;
  }

  cleanupTrustedDevices_(user.email);
  const active = getTrustedDevices_(user.email, false)
    .filter(d => Number(d.sessionVersion || 0) === Math.max(1, Number(user.sessionVersion || 1)))
    .sort((a,b) => dateMillis_(a.lastSeenAt || a.createdAt) - dateMillis_(b.lastSeenAt || b.createdAt));
  while (active.length >= EK.SESSION.MAX_TRUSTED_DEVICES) {
    const old = active.shift();
    revokeTrustedDeviceById_(old.deviceId, user.email, 'DIGANTI_PERANTI_BAHARU');
    audit_('TRUSTED_DEVICE_DIGANTI', user.email, `Had ${EK.SESSION.MAX_TRUSTED_DEVICES} peranti; DeviceID lama=${old.deviceId}`, user.email);
  }

  const sh = ensureTrustedDevicesSheet_();
  const deviceId = Utilities.getUuid().toLowerCase();
  const secret = newTrustedDeviceSecret_();
  const credential = `${deviceId}.${secret}`;
  const now = new Date();
  const exp = new Date(Date.now() + EK.SESSION.REMEMBER_DAYS * 24 * 60 * 60 * 1000);
  sh.appendRow([
    deviceId, user.email, deviceNameFromClientInfo_(ci), platformNameFromClientInfo_(ci), browserNameFromUa_(ci.userAgent),
    ci.ip || '', now, now, exp, true, Math.max(1, Number(user.sessionVersion || 1)),
    hashTrustedDeviceSecret_(deviceId, secret), ''
  ]);
  const row = sh.getLastRow();
  sh.getRange(row, 7, 1, 3).setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.getRange(row, 10).insertCheckboxes().setValue(true);
  invalidateTrustedDevicesCache_();
  const created = trustedDeviceFromRow_(sh.getRange(row,1,1,EK.TRUSTED_DEVICE_HEADERS.length).getValues()[0], row);
  created.credential = credential;
  return created;
}

function touchTrustedDevice_(rec, clientInfo, extendExpiry) {
  const ci = normalizeClientInfo_(clientInfo);
  const now = new Date();
  const nextPlatform = platformNameFromClientInfo_(ci);
  const nextBrowser = browserNameFromUa_(ci.userAgent);
  const nextName = `${nextPlatform} · ${nextBrowser}`;
  const nextIp = ci.ip || rec.lastIp || '';
  const lastSeenMs = dateMillis_(rec.lastSeenAt);
  const recent = lastSeenMs > 0 && (now.getTime() - lastSeenMs) < EK_TRUSTED_TOUCH_MIN_INTERVAL_MS_;
  const sameFingerprint = nextName === String(rec.deviceName || '') &&
    nextPlatform === String(rec.platform || '') &&
    nextBrowser === String(rec.browser || '') &&
    nextIp === String(rec.lastIp || '');

  // A refresh a few seconds after the previous page load should not create
  // another Google Sheets write. IP/device changes still persist immediately.
  if (extendExpiry && recent && sameFingerprint) return rec;

  const sh = ensureTrustedDevicesSheet_();
  const exp = extendExpiry ? new Date(Date.now() + EK.SESSION.REMEMBER_DAYS * 24 * 60 * 60 * 1000) : rec.expiresAt;
  sh.getRange(rec.row, 3, 1, 7).setValues([[
    nextName, nextPlatform, nextBrowser, nextIp,
    rec.createdAt || now, now, exp
  ]]);
  rec.deviceName = nextName;
  rec.platform = nextPlatform;
  rec.browser = nextBrowser;
  rec.lastIp = nextIp;
  rec.lastSeenAt = now;
  rec.expiresAt = exp;
  invalidateTrustedDevicesCache_();
  return rec;
}

function cleanupTrustedDevices_(email) {
  getTrustedDevices_(email, false).forEach(d => {
    if ((dateMillis_(d.expiresAt) && Date.now() > dateMillis_(d.expiresAt))) {
      revokeTrustedDeviceById_(d.deviceId, d.email, 'TAMAT_30_HARI');
    }
  });
}

function revokeTrustedDeviceById_(deviceId, expectedEmail, reason) {
  const rec = findTrustedDeviceById_(deviceId);
  if (!rec || (expectedEmail && rec.email !== normalizeEmail_(expectedEmail))) return false;
  if (!rec.active) return true;
  const sh = ensureTrustedDevicesSheet_();
  sh.getRange(rec.row, 10).insertCheckboxes().setValue(false);
  sh.getRange(rec.row, 13).setValue(String(reason || 'DIBATALKAN'));
  invalidateTrustedDevicesCache_();
  return true;
}

function revokeAllTrustedDevicesForUser_(email, reason) {
  const rows = getTrustedDevices_(email, false);
  if (!rows.length) return 0;
  const sh = ensureTrustedDevicesSheet_();
  rows.forEach(rec => {
    sh.getRange(rec.row, 10).insertCheckboxes().setValue(false);
    sh.getRange(rec.row, 13).setValue(String(reason || 'SEMUA_PERANTI_DIBATALKAN'));
  });
  invalidateTrustedDevicesCache_();
  return rows.length;
}

function assertSessionDeviceActive_(session, user) {
  const rec = findTrustedDeviceById_(session.d);
  if (!rec || !rec.active || rec.email !== user.email) throw new Error('Sesi peranti ini telah dibatalkan. Sila log masuk semula.');
  if (Number(rec.sessionVersion || 0) !== Math.max(1, Number(user.sessionVersion || 1))) throw new Error('Sesi peranti ini telah dibatalkan kerana PIN atau tetapan akaun berubah. Sila log masuk semula.');
  if (dateMillis_(rec.expiresAt) && Date.now() > dateMillis_(rec.expiresAt)) {
    revokeTrustedDeviceById_(rec.deviceId, rec.email, 'TAMAT_30_HARI');
    throw new Error('Sesi peranti telah tamat. Sila log masuk semula.');
  }
}

function publicTrustedDevice_(d) {
  return {
    deviceId:d.deviceId,
    deviceName:d.deviceName || 'Peranti',
    platform:d.platform || '',
    browser:d.browser || '',
    lastIp:d.lastIp || '',
    createdAt:d.createdAt ? formatDateTime_(d.createdAt) : '',
    lastSeenAt:d.lastSeenAt ? formatDateTime_(d.lastSeenAt) : '',
    expiresAt:d.expiresAt ? formatDateTime_(d.expiresAt) : '',
    active:!!d.active,
    revokeReason:d.revokeReason || ''
  };
}

function adminListTrustedDevices(token, email) {
  requireSessionAdmin_(token);
  email = normalizeEmail_(email);
  const user = getUserByEmail_(email, false);
  if (!user) throw new Error('Pengguna tidak ditemui.');
  cleanupTrustedDevices_(email);
  return {ok:true, user:publicUser_(user), devices:getTrustedDevices_(email, false).map(publicTrustedDevice_)};
}

function adminRevokeTrustedDevice(token, deviceId) {
  const admin = requireSessionAdmin_(token);
  const rec = findTrustedDeviceById_(deviceId);
  if (!rec) throw new Error('Peranti tidak ditemui.');
  revokeTrustedDeviceById_(deviceId, rec.email, 'DIBATALKAN_PENTADBIR');
  audit_('BATAL_TRUSTED_DEVICE', rec.email, `DeviceID=${deviceId}`, admin.email);
  return {ok:true};
}

function adminRevokeAllTrustedDevices(token, email) {
  const admin = requireSessionAdmin_(token);
  email = normalizeEmail_(email);
  const count = revokeAllTrustedDevicesForUser_(email, 'SEMUA_PERANTI_DIBATALKAN_PENTADBIR');
  audit_('BATAL_SEMUA_TRUSTED_DEVICE', email, `Jumlah=${count}`, admin.email);
  return {ok:true,count};
}
