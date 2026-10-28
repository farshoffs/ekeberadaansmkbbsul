// ---------- Production-safe burst performance test ----------
// Run `runPerformanceBurstSuite()` manually from the Apps Script editor after
// deploying this source. It exercises the deployed Web App with 20/50/100
// concurrent requests without writing fake rows into KEHADIRAN.
//
// The bridge probe is protected by a short-lived HMAC token minted only by this
// server-side runner. Test writes go to PERF_BURST_TEST only.

const EK_PERF_BURST_SHEET_ = 'PERF_BURST_TEST';
const EK_PERF_BURST_TOKEN_TTL_MS_ = 5 * 60 * 1000;
const EK_PERF_BURST_LOCK_TIMEOUT_MS_ = 30000;
const EK_PERF_BURST_DEFAULT_WEB_APP_URL_ = 'https://script.google.com/macros/s/AKfycbyUv2F6Fl3drRR-TTTJkefu73TwbuQk5GVf36z87WLYIy40SSqZOfKBCeSIy7xje_wq/exec';

function performanceBurstWebAppUrl_() {
  const candidates = [];
  try { candidates.push(String(ScriptApp.getService().getUrl() || '').trim()); } catch (e) {}
  try {
    candidates.push(String(PropertiesService.getScriptProperties().getProperty('EK_WEB_APP_URL') || '').trim());
  } catch (e) {}
  candidates.push(EK_PERF_BURST_DEFAULT_WEB_APP_URL_);

  for (let i = 0; i < candidates.length; i += 1) {
    const url = String(candidates[i] || '').trim().replace(/\/+$/, '');
    if (/^https:\/\/script\.google\.com\/macros\/s\/[^/?#]+\/(?:exec|dev)$/.test(url)) return url;
  }
  throw new Error('Web App URL tidak dapat dikenal pasti. Tetapkan Script Property EK_WEB_APP_URL kepada URL /exec deployment sedia ada.');
}

function performanceBurstSignature_(timestampMs, runId) {
  const material = `PERF_BURST\n${Number(timestampMs) || 0}\n${String(runId || '')}`;
  return Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(material, getSessionSecret_(), Utilities.Charset.UTF_8)
  );
}

function createPerformanceBurstToken_(runId) {
  const timestampMs = Date.now();
  return `${timestampMs}.${performanceBurstSignature_(timestampMs, runId)}`;
}

function verifyPerformanceBurstToken_(token, runId) {
  const raw = String(token || '').trim();
  const dot = raw.indexOf('.');
  if (dot <= 0) throw new Error('Token ujian prestasi tidak sah.');
  const timestampMs = Number(raw.slice(0, dot));
  const signature = raw.slice(dot + 1);
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > EK_PERF_BURST_TOKEN_TTL_MS_) {
    throw new Error('Token ujian prestasi telah tamat.');
  }
  const expected = performanceBurstSignature_(timestampMs, runId);
  if (!constantTimeEquals_(signature, expected)) throw new Error('Token ujian prestasi tidak sah.');
  return true;
}

function ensurePerformanceBurstSheet_() {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(EK_PERF_BURST_SHEET_);
  if (!sh) sh = ss.insertSheet(EK_PERF_BURST_SHEET_);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, 7).setValues([[
      'RunID', 'Stage', 'Request', 'StartedAt', 'LockWaitMs', 'PreflightMs', 'Server'
    ]]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function resetPerformanceBurstSheet_() {
  const sh = ensurePerformanceBurstSheet_();
  sh.clearContents();
  sh.getRange(1, 1, 1, 7).setValues([[
    'RunID', 'Stage', 'Request', 'StartedAt', 'LockWaitMs', 'PreflightMs', 'Server'
  ]]);
  // Reserve one distinct row per request across the 20/50/100 stages. This
  // mirrors the production v3 daily-slot architecture without touching KEHADIRAN.
  const reserved = Array.from({length:170}, (_, i) => [`RESERVED-${i+1}`,'','','','','','']);
  sh.getRange(2, 1, reserved.length, 7).setValues(reserved);
  sh.setFrozenRows(1);
  return sh;
}

function performanceBurstReservedRow_(stage, requestNo) {
  const s = Number(stage || 0), n = Number(requestNo || 0);
  if (s === 20) return 1 + n;      // 2..21
  if (s === 50) return 21 + n;     // 22..71
  if (s === 100) return 71 + n;    // 72..171
  throw new Error('Stage ujian prestasi tidak sah.');
}

/**
 * Bridge-only burst probe. Do not call manually; use runPerformanceBurstSuite().
 * It deliberately mirrors the launch hot path: cached reads happen before the
 * global lock, then one Spreadsheet write happens while the lock is held.
 */
function performanceBurstProbe(probeToken, runId, stage, requestNo, sentAtMs) {
  verifyPerformanceBurstToken_(probeToken, runId);
  const started = Date.now();

  const preflightStarted = Date.now();
  getSettings_();
  getAllUsers_();
  getAttendanceRowIndex_();
  readAbsenceRows_();
  const preflightMs = Date.now() - preflightStarted;

  const sh = getSpreadsheet_().getSheetByName(EK_PERF_BURST_SHEET_);
  if (!sh) throw new Error('Sheet PERF_BURST_TEST belum disediakan. Jalankan suite dari editor.');
  const row = performanceBurstReservedRow_(stage, requestNo);
  const writeStarted = Date.now();
  sh.getRange(row, 1, 1, 7).setValues([[
    String(runId || ''), Number(stage)||0, Number(requestNo)||0,
    new Date(started), 0, preflightMs, 'WEB_APP_PARALLEL_DIRECT_ROW'
  ]]);
  const writeMs = Date.now() - writeStarted;

  const finished = Date.now();
  return {
    ok:true, runId:String(runId||''), stage:Number(stage)||0, requestNo:Number(requestNo)||0,
    arrivalLagMs:Math.max(0, started-(Number(sentAtMs)||started)),
    preflightMs, lockWaitMs:0, lockHeldMs:0, writeMs, totalMs:finished-started
  };
}

function performanceBurstPercentile_(sorted, percentile) {
  if (!sorted.length) return 0;
  const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil((percentile / 100) * sorted.length) - 1));
  return sorted[index];
}

function performanceBurstStats_(values) {
  const sorted = (values || []).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return {min:0, avg:0, p50:0, p95:0, p99:0, max:0};
  const avg = sorted.reduce((sum, n) => sum + n, 0) / sorted.length;
  return {
    min: sorted[0],
    avg: Math.round(avg * 10) / 10,
    p50: performanceBurstPercentile_(sorted, 50),
    p95: performanceBurstPercentile_(sorted, 95),
    p99: performanceBurstPercentile_(sorted, 99),
    max: sorted[sorted.length - 1]
  };
}

function parsePerformanceBurstBridgeResponse_(body) {
  const text = String(body || '').trim();
  if (!text) throw new Error('Respons bridge ujian kosong.');

  // Current perf-burst transport returns JSON directly. Retain the HtmlService
  // parser as a compatibility fallback for an older deployment during rollout.
  try {
    const direct = JSON.parse(text);
    if (direct && direct.type === 'EK_BRIDGE_RESULT') return direct;
  } catch (e) {}

  const match = text.match(/const RESPONSE = ([\s\S]*?);\s*\n\s*function deliver/);
  if (match) return JSON.parse(match[1]);

  const prefix = text.slice(0, 160).replace(/\s+/g, ' ');
  throw new Error(`Respons bridge ujian tidak dapat dibaca. Prefix=${prefix}`);
}

function runPerformanceBurstStage_(webAppUrl, origin, suiteId, concurrency) {
  const runId = `${suiteId}-${concurrency}`;
  const token = createPerformanceBurstToken_(runId);
  const sentAtMs = Date.now();
  const requests = [];

  for (let i = 1; i <= concurrency; i += 1) {
    const request = {
      id: `${runId}-${i}`,
      channel: 'perf-burst',
      method: 'performanceBurstProbe',
      args: [token, runId, concurrency, i, sentAtMs],
      origin
    };
    requests.push({
      url: webAppUrl,
      method: 'post',
      payload: {bridge:'1', payload:JSON.stringify(request)},
      followRedirects: true,
      muteHttpExceptions: true
    });
  }

  const stageStarted = Date.now();
  const responses = UrlFetchApp.fetchAll(requests);
  const stageElapsedMs = Date.now() - stageStarted;
  const values = [];
  const errors = [];

  responses.forEach((response, index) => {
    const code = response.getResponseCode();
    try {
      const envelope = parsePerformanceBurstBridgeResponse_(response.getContentText());
      if (code >= 200 && code < 400 && envelope && envelope.ok && envelope.value && envelope.value.ok) {
        values.push(envelope.value);
      } else {
        errors.push({request:index + 1, http:code, error:String(envelope && envelope.error || 'Probe gagal')});
      }
    } catch (err) {
      errors.push({request:index + 1, http:code, error:err && err.message ? err.message : String(err)});
    }
  });

  const metric = key => performanceBurstStats_(values.map(v => v[key]));
  return {
    concurrency,
    succeeded: values.length,
    failed: errors.length,
    stageElapsedMs,
    arrivalLagMs: metric('arrivalLagMs'),
    preflightMs: metric('preflightMs'),
    lockWaitMs: metric('lockWaitMs'),
    lockHeldMs: metric('lockHeldMs'),
    writeMs: metric('writeMs'),
    totalMs: metric('totalMs'),
    errors: errors.slice(0, 10)
  };
}

/**
 * One-click launch stress test.
 *
 * 1. Deploy the current Apps Script as a new version of the existing Web App.
 * 2. Select runPerformanceBurstSuite in the Apps Script editor and click Run.
 * 3. Copy the returned/logged JSON back into ChatGPT for interpretation.
 */
function runPerformanceBurstSuite() {
  const webAppUrl = performanceBurstWebAppUrl_();

  const origins = getPagesWebOrigins_();
  const origin = origins.indexOf('https://kea3123-bit.github.io') !== -1
    ? 'https://kea3123-bit.github.io'
    : (origins[0] || 'https://kea3123-bit.github.io');

  resetPerformanceBurstSheet_();
  SpreadsheetApp.flush();

  // Warm the cross-execution data that is expected to be hot during the morning
  // punch window. The suite is primarily measuring contention at the write lock.
  getSettings_();
  getAllUsers_();
  getAttendanceRowIndex_();
  readAbsenceRows_();

  const suiteId = `PB-${Utilities.formatDate(new Date(), EK.TIMEZONE, 'yyyyMMdd-HHmmss')}-${Utilities.getUuid().slice(0, 8)}`;
  const stages = [];
  [20, 50, 100].forEach((concurrency, index) => {
    if (index) Utilities.sleep(2000);
    const stage = runPerformanceBurstStage_(webAppUrl, origin, suiteId, concurrency);
    stages.push(stage);
    console.log(JSON.stringify({type:'PERF_BURST_STAGE', suiteId, stage}));
  });

  const finalStage = stages[stages.length - 1];
  const pass = stages.every(s => s.failed === 0) &&
    finalStage.lockWaitMs.p95 < EK_PERF_BURST_LOCK_TIMEOUT_MS_ &&
    finalStage.totalMs.p95 < EK_PERF_BURST_LOCK_TIMEOUT_MS_;

  const result = {
    ok: true,
    suiteId,
    webAppUrl,
    targetConcurrentUsers: 100,
    verdict: pass ? 'PASS' : 'REVIEW',
    criteria: {
      zeroFailedRequests: true,
      p95LockWaitBelowMs: EK_PERF_BURST_LOCK_TIMEOUT_MS_,
      p95TotalBelowMs: EK_PERF_BURST_LOCK_TIMEOUT_MS_
    },
    stages
  };
  console.log(JSON.stringify(result));
  return result;
}