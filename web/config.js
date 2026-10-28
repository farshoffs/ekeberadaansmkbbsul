window.EK_CONFIG = Object.freeze({
  APP_NAME: 'e-Keberadaan',
  SCHOOL_NAME: 'SMK Bandar Baru Sungai Lalang',
  TIMEZONE: 'Asia/Kuala_Lumpur',
  // GitHub Pages DEV backend. Public Apps Script /exec URL; not a secret.
  APPS_SCRIPT_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbyUv2F6Fl3drRR-TTTJkefu73TwbuQk5GVf36z87WLYIy40SSqZOfKBCeSIy7xje_wq/exec',
  BRIDGE_TIMEOUT_MS: 30000
});

// Bootstrap compatibility guard.
// Legacy eKeberadaan CSS historically used .modal{z-index:100}; Bootstrap's
// generated backdrop uses z-index:1050. Without this final cascade layer the
// backdrop sits above the dialog and blocks every input/click. Keep the modal
// stack aligned with Bootstrap's documented defaults regardless of legacy CSS.
(() => {
  const id = 'ek-bootstrap-compat';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    .modal{z-index:1055!important;pointer-events:none}
    .modal.show{display:block!important;pointer-events:auto}
    .modal .modal-dialog{position:relative;z-index:1;pointer-events:none}
    .modal .modal-content{position:relative;z-index:1;pointer-events:auto!important}
    .modal-backdrop{z-index:1050!important}
    body.modal-open .modal{pointer-events:auto!important}

    /* Punch-card exception emphasis: only the actual exceptional time is red. */
    .pc-time-exception{color:#b42318!important;font-weight:800!important}
    .pc-time-admin-edit{font-weight:900!important;text-decoration:underline dotted 1px;text-underline-offset:2px;color:#175cd3!important}
    .pc-time-exception.pc-time-admin-edit{color:#b42318!important;text-decoration-color:#175cd3!important}
    .pc-statement-status{font-weight:800;line-height:1.2}
    .pc-presence-note{display:block;margin-top:1px;font-size:7px;line-height:1.05;font-weight:700;white-space:normal;color:#475467}
    .pc-sign-tags{display:flex;flex-direction:column;align-items:center;gap:3px}

    /* Reusable approver job-title tag for all review screens and punch cards. */
    .reviewer-role-tag{display:inline-flex;align-items:center;max-width:100%;margin-top:4px;padding:2px 7px;border-radius:999px;background:rgba(7,83,185,.1);border:1px solid rgba(7,83,185,.22);color:#0753b9;font-size:11px;font-weight:800;line-height:1.25;white-space:normal;text-align:center}
    .review-by-role{display:flex;flex-wrap:wrap;align-items:center;gap:5px;margin-bottom:3px}
    .review-by-role .reviewer-role-tag{margin-top:0}
    .pc-sign .reviewer-role-tag{margin-top:0;padding:2px 5px;font-size:8px;line-height:1.15}
    @media print{
      .pc-time-exception{color:#b42318!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .pc-time-admin-edit{font-weight:900!important;text-decoration:underline dotted 1px;text-underline-offset:1px;color:#175cd3!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .pc-time-exception.pc-time-admin-edit{color:#b42318!important;text-decoration-color:#175cd3!important}
      .reviewer-role-tag{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    }
  `;
  document.head.appendChild(style);
})();

// Presentation refinement layer.
// This runs after the deferred legacy bundles have registered their functions,
// then replaces only the renderers/loaders needed for the review UX. Business
// rules remain server-side; this layer only adds precise per-session metadata,
// reviewer job-title tags and the requested punch-card presentation.
(() => {
  const reviewerCache = new Map();

  const uniqueEmails = values => [...new Set((values || [])
    .map(v => String(v || '').trim().toLowerCase())
    .filter(v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)))];

  const tagHtml = title => {
    const value = String(title || '').trim();
    return value ? `<span class="reviewer-role-tag">${esc(value)}</span>` : '';
  };

  async function fetchReviewerProfiles(rows) {
    const list = Array.isArray(rows) ? rows : [];
    const emails = uniqueEmails(list.map(r => r?.reviewedBy));
    const missing = emails.filter(email => !reviewerCache.has(email));
    if (missing.length) {
      try {
        const profiles = await runServer('getReviewerMeta', state.token, missing);
        (profiles || []).forEach(profile => {
          const email = String(profile?.email || '').trim().toLowerCase();
          if (email) reviewerCache.set(email, profile);
        });
        missing.forEach(email => {
          if (!reviewerCache.has(email)) reviewerCache.set(email, null);
        });
      } catch (_e) {
        // Frontend remains usable during a staggered Pages/backend deployment.
      }
    }
    list.forEach(r => {
      const email = String(r?.reviewedBy || '').trim().toLowerCase();
      const profile = reviewerCache.get(email);
      if (!profile) return;
      r.reviewerJobTitle = profile.jobTitle || '';
      r.reviewerCategory = profile.category || '';
      r.reviewerIsAdmin = !!profile.isAdmin;
    });
  }

  function reviewStatusForCard(reviews, hasException, legacyState) {
    const relevant = (reviews || []).filter(r => ['LEWAT','BALIK AWAL'].includes(String(r?.type || '').toUpperCase()));
    if (relevant.some(r => String(r.reviewStatus || '').toUpperCase() === 'DITOLAK')) return 'Ditolak';
    if (relevant.length && relevant.every(r => String(r.reviewStatus || '').toUpperCase() === 'DIAMBIL MAKLUM')) return 'Maklum';
    if (relevant.length) return 'Belum diambil maklum';

    // Existing getMyPunchCardMonth already supplies reviewState. Keep using it
    // as a safe rollout fallback until the new metadata RPC is deployed, and
    // strip historical reviewer names such as "Maklum - Pengetua" as requested.
    const legacy = String(legacyState || '').trim().toUpperCase();
    if (legacy.includes('DITOLAK')) return 'Ditolak';
    if (legacy.includes('BELUM') && legacy.includes('MAKLUM')) return 'Belum diambil maklum';
    if (legacy.includes('MAKLUM')) return 'Maklum';
    if (!hasException) return '';
    return 'Belum diambil maklum';
  }

  function reviewerTagsForCard(reviews) {
    const seen = new Set();
    const tags = [];
    (reviews || []).forEach(r => {
      const status = String(r?.reviewStatus || '').toUpperCase();
      if (status === 'BELUM DIAMBIL MAKLUM' || !status) return;
      let title = String(r?.reviewerJobTitle || '').trim();
      if (!title && r?.reviewerIsAdmin) title = 'Pentadbir Sistem';
      if (!title) title = String(r?.reviewerCategory || '').trim();
      if (!title || seen.has(title.toLowerCase())) return;
      seen.add(title.toLowerCase());
      tags.push(tagHtml(title));
    });
    return tags.length ? `<div class="pc-sign-tags">${tags.join('')}</div>` : '';
  }

  function patchedCardRowsHtml(d, half) {
    const start = half === 1 ? 1 : 16;
    const end = half === 1 ? Math.min(15, d.daysInMonth) : d.daysInMonth;
    const byDay = new Map((d.records || []).map(r => [Number(r.day), r]));
    const metaReviews = Array.isArray(d?._reviewMeta?.rows) ? d._reviewMeta.rows : [];
    const recordReviews = (d.records || []).flatMap(record =>
      (Array.isArray(record?.reviewItems) ? record.reviewItems : []).map(item => Object.assign({}, item, {
        date: item?.date || record.date || '',
        email: item?.email || d?.user?.email || ''
      }))
    );
    // Own cards normally use _reviewMeta. Admin/employee cards may already carry
    // reviewItems from adminGetPunchCardMonth, so never discard those tags.
    const allReviews = metaReviews.length ? metaReviews : recordReviews;
    let html = '';
    if (start > end) return '<tr><td colspan="7" class="pc-empty">Tiada tarikh untuk bahagian ini.</td></tr>';

    for (let day = start; day <= end; day++) {
      const r = byDay.get(day) || {};
      const status = String(r.status || '').trim().toUpperCase();
      const cls = status === 'TIDAK HADIR' ? 'pc-row-absent' : status === 'WEEKEND' ? 'pc-row-weekend' : status === 'HADIR' ? 'pc-row-hadir' : '';

      if (status === 'WEEKEND') {
        const label = String(r.reason || '').trim().toUpperCase() || 'CUTI';
        html += `<tr class="${cls}"><td class="pc-day">${day}</td><td colspan="6" class="pc-weekend-full"><span>${esc(label)}</span></td></tr>`;
        continue;
      }
      if (status === 'TIDAK HADIR') {
        const reason = String(r.reason || '').trim();
        const detail = reason && reason.toUpperCase() !== 'TIDAK HADIR' ? reason : 'TIADA PENJELASAN';
        html += `<tr class="${cls}"><td class="pc-day">${day}</td><td colspan="6" class="pc-absence-full"><span class="pc-absence-label">TIDAK HADIR</span><span class="pc-absence-reason">${esc(detail)}</span></td></tr>`;
        continue;
      }

      const dateReviews = allReviews.filter(x => String(x?.date || '') === String(r.date || ''));
      const flags = Array.isArray(r.statusFlags)
        ? r.statusFlags.map(x => String(x || '').toUpperCase())
        : [status.includes('LEWAT') ? 'LEWAT' : '', status.includes('BALIK AWAL') ? 'BALIK AWAL' : ''].filter(Boolean);
      const has = (type, session) => dateReviews.some(x => String(x?.type || '').toUpperCase() === type && Number(x?.session || 1) === session);

      // Once review metadata is available, these are exact per-session flags.
      // The legacy generic flag is only a temporary fallback during deployment.
      const hasExact = dateReviews.length > 0;
      const late1 = has('LEWAT', 1) || (!hasExact && flags.includes('LEWAT') && !!r.inTime);
      const early1 = has('BALIK AWAL', 1) || (!hasExact && flags.includes('BALIK AWAL') && !!r.outTime);
      const late2 = has('LEWAT', 2) || (!hasExact && flags.includes('LEWAT') && !r.inTime && !!r.inTime2);
      const early2 = has('BALIK AWAL', 2) || (!hasExact && flags.includes('BALIK AWAL') && !r.outTime && !!r.outTime2);
      const hasException = late1 || early1 || late2 || early2 || flags.includes('LEWAT') || flags.includes('BALIK AWAL');
      const reviewStatement = reviewStatusForCard(dateReviews, hasException, r.reviewState);
      const rawPresenceReason = String(r.reason || '').trim();
      const reasonMatch = rawPresenceReason.match(/(?:^|[·|])\s*KEBERADAAN:\s*([^·|]+)/i);
      const presenceType = String(r.presenceType || (reasonMatch ? reasonMatch[1] : '') || '').trim();
      const hasPresence = !!presenceType || rawPresenceReason.toUpperCase().includes('KEBERADAAN') || String(r.source || '').toUpperCase() === 'KEBERADAAN';
      const presenceStatement = hasPresence
        ? `${presenceType || 'Keberadaan'} — Maklum from Pengetua`
        : '';
      const signature = reviewerTagsForCard(dateReviews);
      const adminEdited = new Set((Array.isArray(r.adminEditedFields) ? r.adminEditedFields : []).map(x => String(x || '').toUpperCase()));
      if (!adminEdited.size && !r.adminEditMetadataKnown && String(r.source || '').toUpperCase() === 'ADMIN') {
        if (r.inTime) adminEdited.add('IN');
        if (r.outTime) adminEdited.add('OUT');
        if (r.inTime2) adminEdited.add('IN2');
        if (r.outTime2) adminEdited.add('OUT2');
      }
      const timeCell = (value, exceptional, field) => {
        const classes = [exceptional ? 'pc-time-exception' : '', adminEdited.has(field) ? 'pc-time-admin-edit' : ''].filter(Boolean).join(' ');
        return `<td class="${classes}">${esc(shortTime(value))}</td>`;
      };
      const statementHtml = `${reviewStatement ? `<span class="pc-statement-status">${esc(reviewStatement)}</span>` : ''}${presenceStatement ? `<span class="pc-presence-note">${esc(presenceStatement)}</span>` : ''}`;

      html += `<tr class="${cls}"><td class="pc-day">${day}</td>${timeCell(r.inTime, late1, 'IN')}${timeCell(r.outTime, early1, 'OUT')}${timeCell(r.inTime2, late2, 'IN2')}${timeCell(r.outTime2, early2, 'OUT2')}<td class="pc-statement">${statementHtml}</td><td class="pc-sign">${signature}</td></tr>`;
    }
    return html;
  }

  function patchedAbsenceManageFilters() {
    const data = state.absenceManagement?.requests || [];
    const q = norm(document.getElementById('absenceManageSearch')?.value);
    const st = document.getElementById('absenceManageStatus')?.value || '';
    const cat = document.getElementById('absenceManageCategory')?.value || '';
    const mode = document.getElementById('absenceManageMode')?.value || '';
    const list = sortRecords(data.filter(r => {
      const hay = norm([r.id,r.submittedAt,r.name,r.jobTitle,r.email,r.category,r.mode,r.type,r.startDate,r.endDate,r.startTime,r.endTime,r.note,r.status,r.reviewedBy,r.reviewerName,r.reviewerJobTitle,r.reviewedAt,r.comment].join(' '));
      return (!q || hay.includes(q)) && (!st || r.status === st) && (!cat || r.category === cat) && (!mode || r.mode === mode);
    }), getTableSort('absenceManage'));
    text('absenceManageCount', `${list.length} / ${data.length} rekod`);
    updateTableSortIndicators('absenceManage');
    const body = document.getElementById('absenceManageRows');
    if (!body) return;
    body.innerHTML = list.length ? list.map(r => {
      const reviewerRole = String(r.reviewerJobTitle || r.reviewerCategory || (r.reviewerIsAdmin ? 'Pentadbir Sistem' : 'Pengurusan')).trim() || 'Pengurusan';
      const reviewVerb = r.status === 'DILULUSKAN' ? 'Diluluskan' : r.status === 'DITOLAK' ? 'Ditolak' : 'Disemak';
      const reviewDone = `<div class="review-by-role"><b>${esc(reviewVerb)} oleh</b>${tagHtml(reviewerRole)}</div><small class="table-sub">Tarikh/Masa: ${esc(r.reviewedAt || '—')}</small><small class="table-sub">Catatan: ${esc(r.comment || '—')}</small>`;
      const reviewCell = r.status === 'MENUNGGU'
        ? `<div class="row-actions"><button class="action-link approve-link" onclick='openReviewAbsence(${JSON.stringify(r.id)},"DILULUSKAN")'>Lulus</button><button class="action-link warn-link" onclick='openReviewAbsence(${JSON.stringify(r.id)},"DITOLAK")'>Tolak</button></div>`
        : r.synthetic ? '<span class="muted">Tiada permohonan</span>' : reviewDone;
      return `<tr><td><b>${esc(r.name || '—')}</b><small class="table-sub">${esc(r.jobTitle || '—')} · ${esc(r.category || '—')}</small></td><td><b>${esc(r.mode === 'KEBERADAAN' ? 'Keberadaan' : 'Tidak Hadir')}</b></td><td><b>${esc(r.type)}</b></td><td>${esc(formatDateRange(r.startDate,r.endDate))}${r.mode === 'KEBERADAAN' ? `<small class="table-sub">${esc(r.startTime || '—')} – ${esc(r.endTime || '—')}</small>` : ''}<small class="table-sub">${r.synthetic ? 'Dikesan:' : 'Hantar:'} ${esc(r.submittedAt)}</small></td><td>${esc(r.note || '—')}</td><td><span class="request-status ${absenceStatusClass(r.status)}">${esc(r.status)}</span></td><td>${reviewCell}</td></tr>`;
    }).join('') : '<tr><td colspan="7" class="empty-cell">Tiada rekod sepadan.</td></tr>';
  }

  function patchedTimeReviewFilters() {
    const data = state.timeReview?.rows || [];
    const q = norm(document.getElementById('timeReviewSearch')?.value);
    const type = document.getElementById('timeReviewType')?.value || '';
    const st = document.getElementById('timeReviewStatus')?.value || '';
    const list = sortRecords(data.filter(r => {
      const hay = norm([r.name,r.jobTitle,r.email,r.category,r.date,r.type,r.session,r.recordTime,r.referenceTime,r.reviewStatus,r.reviewerName,r.reviewerJobTitle,r.comment].join(' '));
      return (!q || hay.includes(q)) && (!type || r.type === type) && (!st || r.reviewStatus === st);
    }), getTableSort('timeReview'));
    text('timeReviewCount', `${list.length} / ${data.length} rekod`);
    updateTableSortIndicators('timeReview');
    const body = document.getElementById('timeReviewRows');
    if (!body) return;
    body.innerHTML = list.length ? list.map(r => {
      const reviewed = r.reviewStatus !== 'BELUM DIAMBIL MAKLUM';
      const reviewerRole = String(r.reviewerJobTitle || r.reviewerCategory || (r.reviewerIsAdmin ? 'Pentadbir Sistem' : 'Pentadbir Sistem')).trim() || 'Pentadbir Sistem';
      const reviewVerb = r.reviewStatus === 'DIAMBIL MAKLUM' ? 'Diambil maklum' : r.reviewStatus === 'DITOLAK' ? 'Ditolak' : String(r.reviewStatus || 'Disemak');
      const reviewCell = reviewed
        ? `<div class="review-by-role"><b>${esc(reviewVerb)} oleh</b>${tagHtml(reviewerRole)}</div><small class="table-sub">Tarikh/Masa: ${esc(r.reviewedAt || '—')}</small><small class="table-sub">Catatan: ${esc(r.comment || '—')}</small>`
        : `<div class="row-actions"><button class="action-link approve-link" onclick='openTimeReview(${JSON.stringify(r.id)},"DIAMBIL MAKLUM")'>Diambil Maklum</button><button class="action-link warn-link" onclick='openTimeReview(${JSON.stringify(r.id)},"DITOLAK")'>Ditolak</button></div>`;
      return `<tr><td><b>${esc(r.name)}</b><small class="table-sub">${esc(r.jobTitle || '—')} · ${esc(r.email)}</small></td><td>${esc(r.date)}</td><td><span class="badge ${r.type === 'LEWAT' ? 'lewat' : 'awal'}">${esc(r.type)}</span></td><td>${esc(r.session)}</td><td><b>${esc(r.recordTime)}</b></td><td>${esc(r.referenceTime || '—')}</td><td><span class="request-status ${r.reviewStatus === 'DIAMBIL MAKLUM' ? 'approved' : r.reviewStatus === 'DITOLAK' ? 'rejected' : 'pending'}">${esc(r.reviewStatus)}</span></td><td>${reviewCell}</td></tr>`;
    }).join('') : '<tr><td colspan="8" class="empty-cell">Tiada rekod sepadan.</td></tr>';
  }

  document.addEventListener('DOMContentLoaded', () => {
    try {
      // Punch Card Saya: precise red times, review-only statement and approver
      // job-title tags in the TT KETUA column.
      if (typeof cardRowsHtml === 'function') cardRowsHtml = patchedCardRowsHtml;
      if (typeof loadMyCard === 'function') {
        const originalLoadMyCard = loadMyCard;
        loadMyCard = async function(force = false) {
          await originalLoadMyCard(force);
          const data = state.myCardData;
          if (!data?.month || !state.token) return;
          try {
            data._reviewMeta = await runServer('getMyPunchCardReviewMeta', state.token, data.month);
          } catch (_e) {
            data._reviewMeta = data._reviewMeta || {month:data.month, rows:[]};
          }
          renderMyPunchCard();
        };
      }

      // Kad Perakam Waktu Pegawai: the legacy admin loader renders the same
      // cardRowsHtml but never populated _reviewMeta, leaving TT KETUA blank.
      // Hydrate that metadata for the selected employee and re-render the card.
      if (typeof loadAdminCard === 'function') {
        const originalLoadAdminCard = loadAdminCard;
        loadAdminCard = async function(force = false) {
          await originalLoadAdminCard(force);
          const data = state.adminCardData;
          if (!data?.month || !state.token || !state.adminCardEmail) return;

          const targetEmail = String(data.user?.email || state.adminCardEmail || '').trim().toLowerCase();
          let rows = (data.records || []).flatMap(record =>
            (Array.isArray(record?.reviewItems) ? record.reviewItems : []).map(item => Object.assign({}, item, {
              date: item?.date || record.date || '',
              email: item?.email || targetEmail
            }))
          );

          // During staggered backend deployments older adminGetPunchCardMonth
          // responses may not yet contain reviewItems. Admins can already call
          // getTimeReviewData, so use it as the compatibility source.
          const decidedWithoutRole = rows.some(item => {
            const status = String(item?.reviewStatus || '').toUpperCase();
            return status && status !== 'BELUM DIAMBIL MAKLUM' && !String(item?.reviewerJobTitle || '').trim();
          });
          if (!rows.length || decidedWithoutRole) {
            try {
              const from = `${data.month}-01`;
              const to = `${data.month}-${String(data.daysInMonth || 31).padStart(2, '0')}`;
              const meta = await runServer('getTimeReviewData', state.token, from, to);
              const remoteRows = (meta?.rows || []).filter(item =>
                String(item?.email || '').trim().toLowerCase() === targetEmail
              );
              if (remoteRows.length) rows = remoteRows;
            } catch (_e) {
              // Embedded reviewItems remain the fallback when the remote metadata
              // request is unavailable.
            }
          }

          await fetchReviewerProfiles(rows);
          data._reviewMeta = {month: data.month, rows};
          renderAdminCard();
        };
      }

      // Review screens: resolve the reviewer job title internally, then
      // render only the role tag, decision time and comment (never reviewer name/email).
      if (typeof applyAbsenceManageFilters === 'function') applyAbsenceManageFilters = patchedAbsenceManageFilters;
      if (typeof loadAbsenceManagement === 'function') {
        const originalLoadAbsenceManagement = loadAbsenceManagement;
        loadAbsenceManagement = async function(force = false) {
          await originalLoadAbsenceManagement(force);
          await fetchReviewerProfiles(state.absenceManagement?.requests || []);
          patchedAbsenceManageFilters();
        };
      }

      if (typeof applyTimeReviewFilters === 'function') applyTimeReviewFilters = patchedTimeReviewFilters;
      if (typeof loadTimeReview === 'function') {
        const originalLoadTimeReview = loadTimeReview;
        loadTimeReview = async function(force = false) {
          await originalLoadTimeReview(force);
          await fetchReviewerProfiles(state.timeReview?.rows || []);
          patchedTimeReviewFilters();
        };
      }
    } catch (err) {
      console.error('[eKeberadaan review polish]', err);
    }
  }, {once:true});
})();

// Lightweight Punch Masuk location preview. No map dependency is loaded during
// normal app startup: CSS radar is immediate, Leaflet + map tiles are requested
// only after a successful GPS fix. Save-Data/2G stays animation-only.
(() => {
  const STYLE_ID = 'ek-punch-location-preview-style';
  let activeType = '';
  let map = null, userMarker = null, schoolMarker = null, radiusCircle = null, tileLayer = null;

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .ek-punch-location-preview{margin:10px 0 14px;border:1px solid #d0d5dd;border-radius:14px;background:#f8fafc;overflow:hidden;box-shadow:0 4px 14px rgba(16,24,40,.04)}
      .ek-punch-location-head{display:flex;align-items:center;gap:11px;padding:10px 12px;min-height:58px}
      .ek-punch-location-copy{min-width:0;flex:1}.ek-punch-location-copy b,.ek-punch-location-copy small{display:block}.ek-punch-location-copy b{font-size:12px}.ek-punch-location-copy small{margin-top:2px;color:#667085;font-size:10px;line-height:1.3}
      .ek-punch-radar{position:relative;width:36px;height:36px;flex:0 0 36px;border-radius:50%;background:rgba(7,83,185,.08);display:grid;place-items:center}
      .ek-punch-radar:before,.ek-punch-radar:after{content:'';position:absolute;inset:5px;border:1px solid rgba(7,83,185,.32);border-radius:50%;animation:ekPunchRadar 1.6s ease-out infinite}.ek-punch-radar:after{animation-delay:.8s}
      .ek-punch-radar-dot{width:9px;height:9px;border-radius:50%;background:#0753b9;box-shadow:0 0 0 4px rgba(7,83,185,.12);z-index:2}
      .ek-punch-location-preview.is-fixed .ek-punch-radar:before,.ek-punch-location-preview.is-fixed .ek-punch-radar:after{animation:none;opacity:.18}.ek-punch-location-preview.is-fixed .ek-punch-radar-dot{background:#00a65a;box-shadow:0 0 0 4px rgba(0,166,90,.12)}
      .ek-punch-location-map{height:156px;border-top:1px solid #e4e7ec;background:#eef2f6}.ek-punch-location-map.hidden{display:none!important}.ek-punch-location-map .leaflet-control-attribution{font-size:7px!important;line-height:1.1!important}
      @keyframes ekPunchRadar{0%{transform:scale(.45);opacity:.9}100%{transform:scale(1.45);opacity:0}}
      @media(max-width:520px){.ek-punch-location-map{height:138px}.ek-punch-location-head{padding:9px 10px}}
      @media(prefers-reduced-motion:reduce){.ek-punch-radar:before,.ek-punch-radar:after{animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function ensurePreview() {
    installStyle();
    let el = document.getElementById('punchLocationPreview');
    if (el) return el;
    const anchor = document.querySelector('#screen-home .location-box');
    if (!anchor) return null;
    el = document.createElement('div');
    el.id = 'punchLocationPreview';
    el.className = 'ek-punch-location-preview hidden';
    el.innerHTML = `<div class="ek-punch-location-head"><div class="ek-punch-radar"><span class="ek-punch-radar-dot"></span></div><div class="ek-punch-location-copy"><b id="punchLocationPreviewTitle">Mendapatkan lokasi…</b><small id="punchLocationPreviewText">GPS bermula pada sasaran ±80m dan dilonggarkan bertahap hingga ±140m.</small></div></div><div id="punchLocationMap" class="ek-punch-location-map hidden" aria-label="Peta lokasi rekod waktu"></div>`;
    anchor.insertAdjacentElement('afterend', el);
    return el;
  }

  function setPreview(title, detail, fixed = false) {
    const el = ensurePreview();
    if (!el) return;
    el.classList.remove('hidden');
    el.classList.toggle('is-fixed', !!fixed);
    const titleEl = document.getElementById('punchLocationPreviewTitle');
    const textEl = document.getElementById('punchLocationPreviewText');
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = detail;
  }

  function constrainedNetwork() {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
    const type = String(c.effectiveType || '').toLowerCase();
    return !!c.saveData || type === 'slow-2g' || type === '2g';
  }

  function beginPreview() {
    setPreview('Mendapatkan lokasi…', `GPS ${activeType === 'OUT' ? 'Rekod Keluar' : 'Rekod Masuk'} bermula pada sasaran ±80m dan dilonggarkan bertahap hingga ±140m.`, false);
    document.getElementById('punchLocationMap')?.classList.add('hidden');
  }

  function failPreview(message) {
    setPreview('Lokasi belum disahkan', String(message || 'GPS tidak dapat mendapatkan lokasi.'), false);
  }

  async function renderMap(pos) {
    const mapEl = document.getElementById('punchLocationMap');
    if (!mapEl || !pos?.coords || constrainedNetwork()) return;
    if (typeof ensureLeaflet !== 'function') return;
    try { await ensureLeaflet(); } catch (_e) { return; }
    if (typeof L === 'undefined') return;

    const lat = Number(pos.coords.latitude), lng = Number(pos.coords.longitude);
    const schoolLat = Number(state.boot?.settings?.schoolLat), schoolLng = Number(state.boot?.settings?.schoolLng);
    const radius = Math.max(1, Number(state.boot?.settings?.radiusM) || 200);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    mapEl.classList.remove('hidden');
    if (!map) {
      map = L.map(mapEl, {
        preferCanvas:true, zoomControl:false, scrollWheelZoom:false,
        doubleClickZoom:false, boxZoom:false, keyboard:false, dragging:false,
        tap:false, attributionControl:true
      }).setView([lat,lng], 17);
      tileLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom:19,
        attribution:'Tiles &copy; Esri, Maxar, Earthstar Geographics'
      }).addTo(map);
      userMarker = L.circleMarker([lat,lng], {radius:7,weight:3,fillOpacity:1}).addTo(map).bindTooltip('Lokasi anda');
      if (Number.isFinite(schoolLat) && Number.isFinite(schoolLng)) {
        schoolMarker = L.circleMarker([schoolLat,schoolLng], {radius:5,weight:2,fillOpacity:.7}).addTo(map).bindTooltip('Pusat sekolah');
        radiusCircle = L.circle([schoolLat,schoolLng], {radius,weight:1,fillOpacity:.06}).addTo(map);
      }
    } else {
      userMarker?.setLatLng([lat,lng]);
      if (Number.isFinite(schoolLat) && Number.isFinite(schoolLng)) {
        schoolMarker?.setLatLng([schoolLat,schoolLng]);
        radiusCircle?.setLatLng([schoolLat,schoolLng]).setRadius(radius);
      }
    }

    if (Number.isFinite(schoolLat) && Number.isFinite(schoolLng)) {
      const bounds = L.latLngBounds([[lat,lng],[schoolLat,schoolLng]]).pad(.35);
      map.fitBounds(bounds, {maxZoom:18, animate:true, duration:.35});
    } else map.setView([lat,lng], 17, {animate:true});
    setTimeout(() => map?.invalidateSize(false), 0);
  }

  function showFixedPosition(pos) {
    const accuracy = Math.round(Number(pos?.coords?.accuracy) || 0);
    let distance = NaN;
    try { distance = typeof punchGpsDistance === 'function' ? Math.round(punchGpsDistance(pos)) : NaN; } catch (_e) {}
    const radius = Math.max(1, Number(state.boot?.settings?.radiusM) || 200);
    const netNote = constrainedNetwork() ? ' · peta tidak dimuat untuk jimat data' : '';
    setPreview(
      `Lokasi ${activeType === 'OUT' ? 'Rekod Keluar' : 'Rekod Masuk'} dikunci`,
      `Ketepatan ±${accuracy}m${Number.isFinite(distance) ? ` · ${distance}m dari pusat / radius ${Math.round(radius)}m` : ''}${netNote}`,
      true
    );
    if (!constrainedNetwork()) renderMap(pos).catch(() => {});
  }

  document.addEventListener('DOMContentLoaded', () => {
    try {
      if (typeof startPunch !== 'function' || typeof bestPunchPosition !== 'function') return;
      const originalStartPunch = startPunch;
      const originalBestPunchPosition = bestPunchPosition;

      bestPunchPosition = async function() {
        try {
          const pos = await originalBestPunchPosition();
          if (activeType === 'IN' || activeType === 'OUT') showFixedPosition(pos);
          return pos;
        } catch (err) {
          if (activeType === 'IN' || activeType === 'OUT') failPreview(err?.message || err);
          throw err;
        }
      };

      const patchedStartPunch = async function(type) {
        activeType = String(type || '').toUpperCase();
        const test = String(state.boot?.settings?.systemMode || 'REAL').toUpperCase() === 'TEST';
        if ((activeType === 'IN' || activeType === 'OUT') && !test) beginPreview();
        try { return await originalStartPunch(type); }
        finally { activeType = ''; }
      };

      startPunch = patchedStartPunch;
      window.startPunch = patchedStartPunch;
    } catch (err) {
      console.error('[eKeberadaan punch location preview]', err);
    }
  }, {once:true});
})();
