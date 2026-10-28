// ---------- Attendance data ----------

// Attendance row index: one cheap 2-column scan per cache generation,
// followed by narrow full-row reads only for the requested date/month.
const EK_ATT_INDEX_CACHE_KEY_ = 'EK_PERF_ATT_INDEX_V3';
const EK_ATT_INDEX_TTL_SEC_ = 120;
let EK_RUNTIME_ATT_INDEX_ = null;

function getAttendanceRowIndex_() {
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
  const lastRow = sh.getLastRow();
  if (EK_RUNTIME_ATT_INDEX_ && EK_RUNTIME_ATT_INDEX_.lastRow === lastRow) return EK_RUNTIME_ATT_INDEX_;
  const cached = cacheGetJson_(EK_ATT_INDEX_CACHE_KEY_);
  if (cached && cached.lastRow === lastRow && cached.byDate && cached.byMonth && cached.byKey) {
    EK_RUNTIME_ATT_INDEX_ = cached;
    return cached;
  }
  const byDate = Object.create(null), byMonth = Object.create(null), byKey = Object.create(null);
  if (lastRow >= 2) {
    sh.getRange(2, 1, lastRow - 1, 2).getValues().forEach((v, i) => {
      const dateKey = dateCellToKey_(v[0]);
      if (!dateKey) return;
      const row = i + 2, monthKey = dateKey.slice(0, 7), email = normalizeEmail_(v[1]);
      (byDate[dateKey] || (byDate[dateKey] = [])).push(row);
      (byMonth[monthKey] || (byMonth[monthKey] = [])).push(row);
      if (email) (byKey[dateKey + '|' + email] || (byKey[dateKey + '|' + email] = [])).push(row);
    });
  }
  const out = {lastRow, byDate, byMonth, byKey};
  EK_RUNTIME_ATT_INDEX_ = out;
  cachePutJson_(EK_ATT_INDEX_CACHE_KEY_, out, EK_ATT_INDEX_TTL_SEC_);
  return out;
}
function invalidateAttendanceIndex_(){
  EK_RUNTIME_ATT_INDEX_ = null;
  try { getScriptCache_().remove(EK_ATT_INDEX_CACHE_KEY_); } catch(e) {}
}

function registerAttendanceRow_(dateKey, email, row) {
  dateKey = validateDateKey_(dateKey);
  email = normalizeEmail_(email);
  row = Number(row || 0);
  if (!email || row < 2) { invalidateAttendanceIndex_(); return; }

  // The normal punch path has already loaded the old index before append.
  // Reuse that in-memory object instead of observing the new lastRow and
  // rebuilding the entire historical A:B index.
  let idx = EK_RUNTIME_ATT_INDEX_;
  if (!idx || !idx.byDate || !idx.byMonth || !idx.byKey || Number(idx.lastRow || 0) !== row - 1) {
    const cached = cacheGetJson_(EK_ATT_INDEX_CACHE_KEY_);
    if (cached && cached.byDate && cached.byMonth && cached.byKey && Number(cached.lastRow || 0) === row - 1) idx = cached;
  }
  if (!idx || !idx.byDate || !idx.byMonth || !idx.byKey || Number(idx.lastRow || 0) !== row - 1) {
    // Unusual/manual sheet mutation: correctness first. The next lookup will
    // rebuild once from source data rather than risking a stale row map.
    invalidateAttendanceIndex_();
    return;
  }

  const monthKey = dateKey.slice(0, 7);
  const key = dateKey + '|' + email;
  const pushUnique = (map, k) => {
    const list = map[k] || (map[k] = []);
    if (!list.includes(row)) list.push(row);
  };
  pushUnique(idx.byDate, dateKey);
  pushUnique(idx.byMonth, monthKey);
  pushUnique(idx.byKey, key);
  idx.lastRow = row;
  EK_RUNTIME_ATT_INDEX_ = idx;
  cachePutJson_(EK_ATT_INDEX_CACHE_KEY_, idx, EK_ATT_INDEX_TTL_SEC_);
}


// ---------- Launch burst v3: daily row slots + keyed punch locks ----------
// Google Apps Script exposes only one ScriptLock for the whole deployment. A
// full attendance write under that lock serializes 100 different staff. We use
// the ScriptLock only as a very short gate for named CacheService leases. Each
// staff member then writes to their own pre-allocated KEHADIRAN row.
const EK_ATT_KEY_LOCK_PREFIX_ = 'EK_ATT_KLOCK_V1:';
const EK_ATT_SLOT_READY_PREFIX_ = 'EK_ATT_SLOTS_V1:';
const EK_ATT_KEY_LOCK_LEASE_SEC_ = 30;

function attendanceKeyLockCacheKey_(scope, key) {
  const safeScope = String(scope || 'ATT').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 24);
  const safeKey = String(key || '').replace(/[^A-Za-z0-9@._|:-]/g, '_').slice(0, 180);
  return `${EK_ATT_KEY_LOCK_PREFIX_}${safeScope}:${safeKey}`;
}

function acquireAttendanceKeyLock_(scope, key, timeoutMs) {
  const started = Date.now();
  const deadline = started + Math.max(500, Number(timeoutMs || 5000));
  const cache = getScriptCache_();
  const cacheKey = attendanceKeyLockCacheKey_(scope, key);
  const token = Utilities.getUuid();

  while (Date.now() < deadline) {
    const gate = LockService.getScriptLock();
    if (gate.tryLock(250)) {
      try {
        if (!cache.get(cacheKey)) {
          cache.put(cacheKey, token, EK_ATT_KEY_LOCK_LEASE_SEC_);
          return {cacheKey, token, waitMs:Date.now() - started};
        }
      } finally {
        gate.releaseLock();
      }
    }
    Utilities.sleep(20 + Math.floor(Math.random() * 25));
  }
  throw new Error('Sistem sedang memproses rekod waktu anda. Sila cuba semula sebentar lagi.');
}

function releaseAttendanceKeyLock_(lease) {
  if (!lease || !lease.cacheKey || !lease.token) return;
  const gate = LockService.getScriptLock();
  if (!gate.tryLock(1000)) return; // lease expires automatically after 30s
  try {
    const cache = getScriptCache_();
    if (cache.get(lease.cacheKey) === lease.token) cache.remove(lease.cacheKey);
  } finally {
    gate.releaseLock();
  }
}

function registerAttendanceRowsBatch_(idx, dateKey, users, startRow, previousLastRow) {
  if (!idx || !idx.byDate || !idx.byMonth || !idx.byKey || Number(idx.lastRow || 0) !== Number(previousLastRow || 0)) {
    invalidateAttendanceIndex_();
    return false;
  }
  const monthKey = dateKey.slice(0, 7);
  const pushUnique = (map, k, row) => {
    const list = map[k] || (map[k] = []);
    if (!list.includes(row)) list.push(row);
  };
  users.forEach((user, i) => {
    const row = startRow + i;
    const email = normalizeEmail_(user.email);
    pushUnique(idx.byDate, dateKey, row);
    pushUnique(idx.byMonth, monthKey, row);
    pushUnique(idx.byKey, dateKey + '|' + email, row);
  });
  idx.lastRow = previousLastRow + users.length;
  EK_RUNTIME_ATT_INDEX_ = idx;
  cachePutJson_(EK_ATT_INDEX_CACHE_KEY_, idx, EK_ATT_INDEX_TTL_SEC_);
  return true;
}

/**
 * Ensure today's active users already own a physical row in KEHADIRAN.
 * The first missing user creates all missing active-user rows in ONE batch.
 * Other simultaneous requests observe the ready cache and never queue through
 * one Spreadsheet write per staff member.
 */
function ensureAttendanceSlotForUser_(dateKey, user) {
  dateKey = validateDateKey_(dateKey);
  let rec = findAttendanceRecord_(dateKey, user.email);
  if (rec) return {record:rec, createdSlots:0, createdForUser:false, slotWaitMs:0};

  const started = Date.now();
  const cache = getScriptCache_();
  const readyKey = EK_ATT_SLOT_READY_PREFIX_ + dateKey;
  const deadline = started + 8000;

  while (Date.now() < deadline) {
    // Once the first request has created the batch, waiting executions can
    // refresh their per-execution index and leave without acquiring ScriptLock.
    if (cache.get(readyKey)) {
      EK_RUNTIME_ATT_INDEX_ = null;
      rec = findAttendanceRecord_(dateKey, user.email);
      if (rec) return {record:rec, createdSlots:0, createdForUser:false, slotWaitMs:Date.now()-started};
      // A user may have been activated after today's batch was created.
      cache.remove(readyKey);
    }

    const gate = LockService.getScriptLock();
    if (gate.tryLock(300)) {
      try {
        // Recheck from source/cache after acquiring the one-time slot gate.
        EK_RUNTIME_ATT_INDEX_ = null;
        rec = findAttendanceRecord_(dateKey, user.email);
        if (rec) {
          cache.put(readyKey, '1', 21600);
          return {record:rec, createdSlots:0, createdForUser:false, slotWaitMs:Date.now()-started};
        }

        // Correctness first for the once-per-day allocation: rebuild the small
        // A:B index once, then extend it incrementally for the whole batch.
        invalidateAttendanceIndex_();
        const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
        const idx = getAttendanceRowIndex_();
        const activeUsers = getAllUsers_().filter(u => u.active);
        if (!activeUsers.some(u => normalizeEmail_(u.email) === normalizeEmail_(user.email))) activeUsers.push(user);
        const missing = activeUsers.filter(u => !((idx.byKey[dateKey + '|' + normalizeEmail_(u.email)] || []).length));

        if (missing.length) {
          const previousLastRow = sh.getLastRow();
          const startRow = previousLastRow + 1;
          const rows = missing.map(u => {
            const v = Array(EK.ATT_HEADERS.length).fill('');
            v[0] = dateKey;
            v[1] = normalizeEmail_(u.email);
            v[2] = u.name || '';
            v[3] = u.category || '';
            return v;
          });
          sh.getRange(startRow, 1, rows.length, EK.ATT_HEADERS.length).setValues(rows);
          registerAttendanceRowsBatch_(idx, dateKey, missing, startRow, previousLastRow);
        }

        cache.put(readyKey, '1', 21600);
        EK_RUNTIME_ATT_INDEX_ = null;
        rec = findAttendanceRecord_(dateKey, user.email);
        if (!rec) throw new Error('Slot rekod waktu tidak dapat disediakan. Cuba semula.');
        return {
          record:rec,
          createdSlots:missing.length,
          createdForUser:missing.some(u => normalizeEmail_(u.email) === normalizeEmail_(user.email)),
          slotWaitMs:Date.now()-started
        };
      } finally {
        gate.releaseLock();
      }
    }
    Utilities.sleep(25 + Math.floor(Math.random() * 25));
  }
  throw new Error('Penyediaan rekod waktu mengambil masa terlalu lama. Sila cuba semula.');
}


function groupContiguousRows_(rows) {
  const sorted = [...new Set((rows || []).map(Number).filter(n => n >= 2))].sort((a,b) => a-b);
  const groups = [];
  sorted.forEach(r => {
    const last = groups[groups.length - 1];
    if (last && r === last.end + 1) last.end = r;
    else groups.push({start:r,end:r});
  });
  return groups;
}

function readAttendanceRowsByRowNumbers_(sh, rowNumbers) {
  const out = [];
  groupContiguousRows_(rowNumbers).forEach(g => {
    const vals = sh.getRange(g.start, 1, g.end - g.start + 1, EK.ATT_HEADERS.length).getValues();
    vals.forEach((v, i) => out.push({row:g.start + i, values:v, email:normalizeEmail_(v[1])}));
  });
  return out;
}

function getAttendanceValuesInDateRange_(fromKey, toKey) {
  const settings = getSettings_();
  fromKey = clampToSystemStart_(fromKey, settings);
  toKey = validateDateKey_(toKey);
  if (toKey < getSystemStartDate_(settings) || toKey < fromKey) return [];
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE), idx = getAttendanceRowIndex_(), rows = [];
  Object.keys(idx.byDate).forEach(k => { if (k >= fromKey && k <= toKey) rows.push(...idx.byDate[k]); });
  return readAttendanceRowsByRowNumbers_(sh, rows).map(r => r.values);
}

function getAttendanceValuesForUserMonth_(email, monthKey) {
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE), idx = getAttendanceRowIndex_();
  email = normalizeEmail_(email);
  return readAttendanceRowsByRowNumbers_(sh, idx.byMonth[monthKey] || [])
    .filter(r => normalizeEmail_(r.values[1]) === email && dateCellToKey_(r.values[0]).slice(0,7) === monthKey)
    .map(r => r.values);
}

function findAttendanceRecord_(dateKey, email) {
  dateKey = validateDateKey_(dateKey);
  email = normalizeEmail_(email);
  if (!email) return null;
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
  const idx = getAttendanceRowIndex_();
  const rowNumbers = (idx.byKey && idx.byKey[dateKey + '|' + email]) || [];
  if (!rowNumbers.length) return null;
  const matches = readAttendanceRowsByRowNumbers_(sh, rowNumbers)
    .filter(r => r.email === email && dateCellToKey_(r.values[0]) === dateKey);
  if (!matches.length) return null;
  if (matches.length === 1) return matches[0];

  const merged = mergeAttendanceDuplicateGroup_(sh, matches);
  audit_('AUTO_GABUNG_DUPLIKAT', `${email} ${dateKey}`, `${matches.length} rekod digabungkan menjadi 1`);
  return merged;
}

function getAttendanceByDate_(dateKey) {
  dateKey = validateDateKey_(dateKey);
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE), idx = getAttendanceRowIndex_();
  return readAttendanceRowsByRowNumbers_(sh, idx.byDate[dateKey] || [])
    .filter(r => dateCellToKey_(r.values[0]) === dateKey);
}

/**
 * Imbas helaian KEHADIRAN dan gabungkan baris yang mempunyai Tarikh + Emel yang sama.
 * options: {dateKey, email, monthKey, audit}
 */
function repairAttendanceDuplicates_(options) {
  options = options || {};
  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
  if (sh.getLastRow() < 3) return {groupsMerged: 0, rowsRemoved: 0};

  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, EK.ATT_HEADERS.length).getValues();
  const groups = {};
  const emailFilter = normalizeEmail_(options.email || '');
  const dateFilter = String(options.dateKey || '').trim();
  const monthFilter = String(options.monthKey || '').trim();

  rows.forEach((v, i) => {
    const dateKey = dateCellToKey_(v[0]);
    const email = normalizeEmail_(v[1]);
    if (!dateKey || !email) return;
    if (emailFilter && email !== emailFilter) return;
    if (dateFilter && dateKey !== dateFilter) return;
    if (monthFilter && dateKey.slice(0, 7) !== monthFilter) return;

    const key = `${dateKey}|${email}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push({row: i + 2, values: v, email});
  });

  const duplicateGroups = Object.keys(groups)
    .map(k => groups[k])
    .filter(g => g.length > 1);

  if (!duplicateGroups.length) return {groupsMerged: 0, rowsRemoved: 0};

  const rowsToDelete = [];
  duplicateGroups.forEach(group => {
    group.sort((a, b) => a.row - b.row);
    const mergedValues = buildMergedAttendanceValues_(group);
    const targetRow = group[0].row;
    sh.getRange(targetRow, 1, 1, EK.ATT_HEADERS.length).setValues([mergedValues]);
    group.slice(1).forEach(item => rowsToDelete.push(item.row));
  });

  rowsToDelete.sort((a, b) => b - a).forEach(row => sh.deleteRow(row));
  invalidateAttendanceIndex_();
  SpreadsheetApp.flush();

  const result = {
    groupsMerged: duplicateGroups.length,
    rowsRemoved: rowsToDelete.length
  };
  if (options.audit !== false) {
    audit_('GABUNG_DUPLIKAT_KEHADIRAN', EK.SHEETS.ATTENDANCE, `Kumpulan=${result.groupsMerged}; baris dibuang=${result.rowsRemoved}`);
  }
  return result;
}

function mergeAttendanceDuplicateGroup_(sh, group) {
  group = group.slice().sort((a, b) => a.row - b.row);
  const targetRow = group[0].row;
  const mergedValues = buildMergedAttendanceValues_(group);
  sh.getRange(targetRow, 1, 1, EK.ATT_HEADERS.length).setValues([mergedValues]);

  group.slice(1)
    .map(x => x.row)
    .sort((a, b) => b - a)
    .forEach(row => sh.deleteRow(row));

  invalidateAttendanceIndex_();
  SpreadsheetApp.flush();
  return {
    row: targetRow,
    values: sh.getRange(targetRow, 1, 1, EK.ATT_HEADERS.length).getValues()[0],
    email: normalizeEmail_(mergedValues[1])
  };
}

/**
 * Polisi merge:
 * 1) Pembetulan ADMIN terkini diberi keutamaan.
 * 2) Jika semuanya GPS, masa MASUK paling awal dan BALIK paling akhir dikekalkan.
 * 3) Metadata lokasi ikut punch yang dipilih.
 */
function buildMergedAttendanceValues_(group) {
  const rows = group.map(x => x.values);
  const first = rows[0];
  const last = rows[rows.length - 1];
  const email = normalizeEmail_(rows.map(v => v[1]).find(Boolean) || '');
  const dateKey = dateCellToKey_(rows.map(v => v[0]).find(Boolean) || '');
  const user = email ? getUserByEmail_(email, false) : null;

  const adminRows = group.filter(x =>
    String(x.values[15] || '').toUpperCase() === 'ADMIN' ||
    String(x.values[16] || '').trim() ||
    String(x.values[17] || '').trim()
  );

  let merged;
  if (adminRows.length) {
    const authoritative = adminRows.slice().sort((a, b) => {
      const am = dateValueMs_(a.values[18]);
      const bm = dateValueMs_(b.values[18]);
      return (am - bm) || (a.row - b.row);
    }).pop();
    merged = authoritative.values.slice();
  } else {
    merged = last.slice();

    const inCandidates = group.filter(x => x.values[4]);
    if (inCandidates.length) {
      const chosenIn = inCandidates.slice().sort((a, b) =>
        (dateValueMs_(a.values[4]) - dateValueMs_(b.values[4])) || (a.row - b.row)
      )[0];
      for (let c = 4; c <= 8; c++) merged[c] = chosenIn.values[c];
      merged[14] = String(chosenIn.values[14] || merged[14] || 'HADIR');
    }

    const outCandidates = group.filter(x => x.values[9]);
    if (outCandidates.length) {
      const chosenOut = outCandidates.slice().sort((a, b) =>
        (dateValueMs_(b.values[9]) - dateValueMs_(a.values[9])) || (b.row - a.row)
      )[0];
      for (let c = 9; c <= 13; c++) merged[c] = chosenOut.values[c];
    }

    const in2Candidates = group.filter(x => x.values[22]);
    if (in2Candidates.length) {
      const chosenIn2 = in2Candidates.slice().sort((a,b) => (dateValueMs_(a.values[22]) - dateValueMs_(b.values[22])) || (a.row - b.row))[0];
      for (let c = 22; c <= 26; c++) merged[c] = chosenIn2.values[c];
    }
    const out2Candidates = group.filter(x => x.values[27]);
    if (out2Candidates.length) {
      const chosenOut2 = out2Candidates.slice().sort((a,b) => (dateValueMs_(b.values[27]) - dateValueMs_(a.values[27])) || (b.row - a.row))[0];
      for (let c = 27; c <= 31; c++) merged[c] = chosenOut2.values[c];
    }

    const latestSource = rows.slice().reverse().map(v => String(v[15] || '').trim()).find(Boolean);
    merged[15] = latestSource || 'GPS';
    merged[16] = rows.slice().reverse().map(v => String(v[16] || '').trim()).find(Boolean) || '';
    merged[17] = rows.slice().reverse().map(v => String(v[17] || '').trim()).find(Boolean) || '';
  }

  while (merged.length < EK.ATT_HEADERS.length) merged.push('');

  // Legacy network-identity slots are intentionally left blank for sheet-index compatibility.
  const adminEditedFields = new Set();
  const hasAdminEditMetadata = rows.some(v => !!String(v[35] || '').trim());
  rows.forEach(v => String(v[35] || '').split(',').forEach(x => {
    x = String(x || '').trim().toUpperCase();
    if (['IN','OUT','IN2','OUT2'].includes(x)) adminEditedFields.add(x);
  }));
  merged[35] = adminEditedFields.size ? Array.from(adminEditedFields).join(',') : (hasAdminEditMetadata ? 'NONE' : '');
  const mergedFlags = []; rows.forEach(v => splitAttendanceFlags_(v[34]).forEach(f => { if (!mergedFlags.includes(f)) mergedFlags.push(f); }));
  merged[34] = joinAttendanceFlags_(mergedFlags);
  if (merged[4] && String(merged[14] || '').toUpperCase() !== 'TIDAK HADIR') merged[14] = attendanceStatusFromFlags_(mergedFlags);

  merged[0] = dateKey;
  merged[1] = email;
  merged[2] = user ? user.name : (rows.slice().reverse().map(v => String(v[2] || '').trim()).find(Boolean) || String(first[2] || ''));
  merged[3] = user ? user.category : (rows.slice().reverse().map(v => String(v[3] || '').trim()).find(Boolean) || String(first[3] || ''));

  // Recompute timing flags from the merged punch sequence instead of keeping
  // the union of historical flags (which may contain an obsolete S1 early-out).
  if (user && merged[4] && String(merged[14] || '').toUpperCase() !== 'TIDAK HADIR') {
    const effectiveFlags = inferAttendanceFlags_(merged,user,getSettings_(),dateKey);
    merged[34] = joinAttendanceFlags_(effectiveFlags);
    merged[14] = attendanceStatusFromFlags_(effectiveFlags);
  }

  const latestUpdated = group.slice().sort((a, b) =>
    (dateValueMs_(a.values[18]) - dateValueMs_(b.values[18])) || (a.row - b.row)
  ).pop();
  merged[18] = latestUpdated && latestUpdated.values[18] ? latestUpdated.values[18] : new Date();

  if (!merged[4] && !String(merged[14] || '').trim()) {
    const presenceReq = email && dateKey ? findRelevantPresenceForDate_(email, dateKey) : null;
    if (presenceReq) {
      merged[14] = 'BELUM HADIR';
      merged[15] = 'KEBERADAAN';
      merged[17] = mergeAttendanceReason_(merged[17], presenceRequestReason_(presenceReq, ''));
    } else {
      merged[14] = 'TIDAK HADIR';
    }
  }
  return merged;
}

function dateValueMs_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) return value.getTime();
  if (value === '' || value == null) return 0;
  const d = new Date(value);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function publicAttendance_(rec,schedule) {
  if(!rec)return null;
  const v=padAttendanceValues_(rec.values);
  const dateKey=dateCellToKey_(v[0]);
  const user=getUserByEmail_(normalizeEmail_(v[1]),false);
  const settings=getSettings_();
  const effectiveFlags=inferAttendanceFlags_(v,user,settings,dateKey);
  const effectiveStatus=String(v[14]||'').toUpperCase()==='TIDAK HADIR'
    ? 'TIDAK HADIR'
    : (v[4]?attendanceStatusFromFlags_(effectiveFlags):String(v[14]||''));
  return {
    date:dateKey,
    inTime:v[4]?formatTime_(v[4]):'',
    outTime:v[9]?formatTime_(v[9]):'',
    inTime2:v[22]?formatTime_(v[22]):'',
    outTime2:v[27]?formatTime_(v[27]):'',
    status:effectiveStatus,
    statusFlags:effectiveFlags,
    inDistanceM:v[7]===''?null:Number(v[7]),
    outDistanceM:v[12]===''?null:Number(v[12]),
    inDistanceM2:v[25]===''?null:Number(v[25]),
    outDistanceM2:v[30]===''?null:Number(v[30]),
    source:String(v[15]||''),
    nextRecord:nextAttendanceStep_(v,schedule)
  };
}

function padAttendanceValues_(values) {
  const out = (values || []).slice();
  while (out.length < EK.ATT_HEADERS.length) out.push('');
  return out;
}

function nextAttendanceStep_(values, schedule) {
  const v = padAttendanceValues_(values);
  if (!v[4]) return {type:'IN', session:1, complete:false};
  if (!v[9]) return {type:'OUT', session:1, complete:false};
  // Sesi 2 boleh menjadi sambungan OPTIONAL walaupun waktu Sesi 2 tidak
  // dikonfigurasi. Ini penting untuk pegawai yang pada sesetengah hari keluar
  // rehat dan masuk semula, tetapi pada hari lain hanya menggunakan Sesi 1.
  // Jika Sesi 2 tidak digunakan, pengguna tidak perlu membuat apa-apa lagi.
  const hasSession2 = !!(schedule && (schedule.allowSecondSession || schedule.s2In || schedule.s2Out));
  if (!hasSession2) return {type:'', session:1, complete:true};
  if (!v[22]) return {type:'IN', session:2, complete:false};
  if (!v[27]) return {type:'OUT', session:2, complete:false};
  return {type:'', session:2, complete:true};
}

function splitAttendanceFlags_(value) {
  return [...new Set(String(value || '').toUpperCase().split(/[|,;/]+/).map(x => x.trim()).filter(Boolean))];
}
function joinAttendanceFlags_(flags) { return [...new Set((flags || []).filter(Boolean))].join('|'); }
function attendanceStatusFromFlags_(flags) {
  flags = Array.isArray(flags) ? flags : splitAttendanceFlags_(flags);
  const hasLate = flags.includes('LEWAT');
  const hasEarly = flags.includes('BALIK AWAL');
  if (hasLate && hasEarly) return 'LEWAT / BALIK AWAL';
  if (hasLate) return 'LEWAT';
  if (hasEarly) return 'BALIK AWAL';
  return 'HADIR';
}
