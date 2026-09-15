/**
 * GitHub Pages <-> Apps Script RPC bridge for eKeberadaan.
 *
 * HtmlService runs inside Google's sandbox iframe. A parent page cannot reliably
 * postMessage into that inner sandbox through the script.google.com wrapper.
 * Therefore requests arrive as cross-origin POST form submissions and the
 * HtmlService response posts the result back to the top-level GitHub Pages page.
 */
function getPagesWebOrigin_() {
  var value = String(PropertiesService.getScriptProperties().getProperty('EK_PAGES_ORIGIN') || '').trim();
  return value || 'https://farshoffs.github.io';
}

function pagesBridgeSafeJson_(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function renderPagesBridge_(responsePayload) {
  var tpl = HtmlService.createTemplateFromFile('Bridge');
  tpl.allowedOrigin = getPagesWebOrigin_();
  tpl.responseJson = responsePayload ? pagesBridgeSafeJson_(responsePayload) : 'null';
  return tpl.evaluate()
    .setTitle('eKeberadaan Backend Bridge')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function pagesBridgeMethodAllowed_(method) {
  return [
    'adminBulkResetPasswords',
    'adminGetPunchCardMonth',
    'adminListTrustedDevices',
    'adminRepairAttendanceDuplicates',
    'adminResetPassword',
    'adminRevokeAllTrustedDevices',
    'adminRevokeTrustedDevice',
    'adminSaveAttendance',
    'adminSaveSettings',
    'adminSaveUser',
    'adminSyncProfilePhotos',
    'adminUnlockUser',
    'cancelMyAbsenceRequest',
    'checkDelimaAccount',
    'generateAbsencePresencePdf',
    'generateAttendancePresenceReportPdf',
    'generateAttendancePresenceReportSheet',
    'generatePublicAbsencePresencePdf',
    'generateReportSheet',
    'generateTimeReviewPdf',
    'getAbsenceData',
    'getAbsenceManagementData',
    'getAdminData',
    'getBootstrapData',
    'getLoginPageData',
    'getMyPunchCardMonth',
    'getProfilePhoto',
    'getPublicAbsencePresenceData',
    'getTimeReviewData',
    'loginWithPin',
    'logoutApp',
    'punch',
    'resumeSession',
    'resumeTrustedDevice',
    'reviewAbsenceRequest',
    'reviewTimeException',
    'setFirstPin',
    'submitAbsenceRequest'
  ].indexOf(method) !== -1;
}

function invokePagesBridgeMethod_(method, args) {
  switch (method) {
    case 'adminBulkResetPasswords': return adminBulkResetPasswords.apply(null, args);
    case 'adminGetPunchCardMonth': return adminGetPunchCardMonth.apply(null, args);
    case 'adminListTrustedDevices': return adminListTrustedDevices.apply(null, args);
    case 'adminRepairAttendanceDuplicates': return adminRepairAttendanceDuplicates.apply(null, args);
    case 'adminResetPassword': return adminResetPassword.apply(null, args);
    case 'adminRevokeAllTrustedDevices': return adminRevokeAllTrustedDevices.apply(null, args);
    case 'adminRevokeTrustedDevice': return adminRevokeTrustedDevice.apply(null, args);
    case 'adminSaveAttendance': return adminSaveAttendance.apply(null, args);
    case 'adminSaveSettings': return adminSaveSettings.apply(null, args);
    case 'adminSaveUser': return adminSaveUser.apply(null, args);
    case 'adminSyncProfilePhotos': return adminSyncProfilePhotos.apply(null, args);
    case 'adminUnlockUser': return adminUnlockUser.apply(null, args);
    case 'cancelMyAbsenceRequest': return cancelMyAbsenceRequest.apply(null, args);
    case 'checkDelimaAccount': return checkDelimaAccount.apply(null, args);
    case 'generateAbsencePresencePdf': return generateAbsencePresencePdf.apply(null, args);
    case 'generateAttendancePresenceReportPdf': return generateAttendancePresenceReportPdf.apply(null, args);
    case 'generateAttendancePresenceReportSheet': return generateAttendancePresenceReportSheet.apply(null, args);
    case 'generatePublicAbsencePresencePdf': return generatePublicAbsencePresencePdf.apply(null, args);
    case 'generateReportSheet': return generateReportSheet.apply(null, args);
    case 'generateTimeReviewPdf': return generateTimeReviewPdf.apply(null, args);
    case 'getAbsenceData': return getAbsenceData.apply(null, args);
    case 'getAbsenceManagementData': return getAbsenceManagementData.apply(null, args);
    case 'getAdminData': return getAdminData.apply(null, args);
    case 'getBootstrapData': return getBootstrapData.apply(null, args);
    case 'getLoginPageData': return getLoginPageData.apply(null, args);
    case 'getMyPunchCardMonth': return getMyPunchCardMonth.apply(null, args);
    case 'getProfilePhoto': return getProfilePhoto.apply(null, args);
    case 'getPublicAbsencePresenceData': return getPublicAbsencePresenceData.apply(null, args);
    case 'getTimeReviewData': return getTimeReviewData.apply(null, args);
    case 'loginWithPin': return loginWithPin.apply(null, args);
    case 'logoutApp': return logoutApp.apply(null, args);
    case 'punch': return punch.apply(null, args);
    case 'resumeSession': return resumeSession.apply(null, args);
    case 'resumeTrustedDevice': return resumeTrustedDevice.apply(null, args);
    case 'reviewAbsenceRequest': return reviewAbsenceRequest.apply(null, args);
    case 'reviewTimeException': return reviewTimeException.apply(null, args);
    case 'setFirstPin': return setFirstPin.apply(null, args);
    case 'submitAbsenceRequest': return submitAbsenceRequest.apply(null, args);
    default: throw new Error('Fungsi backend tidak dibenarkan.');
  }
}

/**
 * Cross-origin form POST RPC endpoint used by GitHub Pages.
 * Authentication remains inside each existing backend function via session/PIN.
 */
function doPost(e) {
  var id = '';
  var channel = '';
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    if (String(params.bridge || '') !== '1') {
      throw new Error('Permintaan bridge tidak sah.');
    }

    var raw = String(params.payload || '');
    if (!raw) throw new Error('Payload bridge kosong.');
    if (raw.length > 200000) throw new Error('Payload bridge terlalu besar.');

    var request = JSON.parse(raw);
    id = String(request.id || '');
    channel = String(request.channel || '');
    var method = String(request.method || '');
    var args = Array.isArray(request.args) ? request.args : [];
    var origin = String(request.origin || '');

    if (!id || !channel) throw new Error('ID bridge tidak sah.');
    if (origin !== getPagesWebOrigin_()) throw new Error('Origin bridge tidak dibenarkan.');

    var value;
    if (method === '__ping__') {
      value = { ready: true, timezone: EK.TIMEZONE };
    } else {
      if (!pagesBridgeMethodAllowed_(method)) throw new Error('Fungsi backend tidak dibenarkan.');
      value = invokePagesBridgeMethod_(method, args);
      if (value === undefined) value = null;
    }

    return renderPagesBridge_({
      type: 'EK_BRIDGE_RESULT',
      id: id,
      channel: channel,
      ok: true,
      value: value
    });
  } catch (err) {
    return renderPagesBridge_({
      type: 'EK_BRIDGE_RESULT',
      id: id,
      channel: channel,
      ok: false,
      error: (err && err.message) ? err.message : String(err || 'Ralat backend')
    });
  }
}
