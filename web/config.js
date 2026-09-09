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
    .pc-statement-status{font-weight:800;line-height:1.2}
    .pc-sign-tags{display:flex;flex-direction:column;align-items:center;gap:3px}

    /* Reusable approver job-title tag for all review screens and punch cards. */
    .reviewer-role-tag{display:inline-flex;align-items:center;max-width:100%;margin-top:4px;padding:2px 7px;border-radius:999px;background:rgba(7,83,185,.1);border:1px solid rgba(7,83,185,.22);color:#0753b9;font-size:11px;font-weight:800;line-height:1.25;white-space:normal;text-align:center}
    .pc-sign .reviewer-role-tag{margin-top:0;padding:2px 5px;font-size:8px;line-height:1.15}
    @media print{
      .pc-time-exception{color:#b42318!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
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
      if (!r.reviewerName) r.reviewerName = profile.name || '';
      r.reviewerJobTitle = profile.jobTitle || '';
      r.reviewerCategory = profile.category || '';
      r.reviewerIsAdmin = !!profile.isAdmin;
    });
  }

  function reviewStatusForCard(reviews, hasException) {
    const relevant = (reviews || []).filter(r => ['LEWAT','BALIK AWAL'].includes(String(r?.type || '').toUpperCase()));
    if (!hasException && !relevant.length) return '';
    if (relevant.some(r => String(r.reviewStatus || '').toUpperCase() === 'DITOLAK')) return 'Ditolak';
    if (relevant.length && relevant.every(r => String(r.reviewStatus || '').toUpperCase() === 'DIAMBIL MAKLUM')) return 'Maklum';
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
    const allReviews = d?._reviewMeta?.rows || [];
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
      const statement = reviewStatusForCard(dateReviews, hasException);
      const signature = reviewerTagsForCard(dateReviews);
      const timeCell = (value, exceptional) => `<td class="${exceptional ? 'pc-time-exception' : ''}">${esc(shortTime(value))}</td>`;

      html += `<tr class="${cls}"><td class="pc-day">${day}</td>${timeCell(r.inTime, late1)}${timeCell(r.outTime, early1)}${timeCell(r.inTime2, late2)}${timeCell(r.outTime2, early2)}<td class="pc-statement"><span class="pc-statement-status">${esc(statement)}</span></td><td class="pc-sign">${signature}</td></tr>`;
    }
    return html;
  }

  function patchedAbsenceManageFilters() {
    const data = state.absenceManagement?.requests || [];
    const q = norm(document.getElementById('absenceManageSearch')?.value);
    const st = document.getElementById('absenceManageStatus')?.value || '';
    const cat = document.getElementById('absenceManageCategory')?.value || '';
    const mode = document.getElementById('absenceManageMode')?.value || '';
    const list = data.filter(r => {
      const hay = norm([r.id,r.submittedAt,r.name,r.jobTitle,r.email,r.category,r.mode,r.type,r.startDate,r.endDate,r.startTime,r.endTime,r.note,r.status,r.reviewedBy,r.reviewerName,r.reviewerJobTitle,r.reviewedAt,r.comment].join(' '));
      return (!q || hay.includes(q)) && (!st || r.status === st) && (!cat || r.category === cat) && (!mode || r.mode === mode);
    });
    text('absenceManageCount', `${list.length} / ${data.length} rekod`);
    const body = document.getElementById('absenceManageRows');
    if (!body) return;
    body.innerHTML = list.length ? list.map(r => {
      const reviewerName = r.reviewerName || r.reviewedBy || '—';
      const reviewerEmail = r.reviewerName && r.reviewedBy ? `<small class="table-sub">${esc(r.reviewedBy)}</small>` : '';
      const reviewDone = `<b>${esc(reviewerName)}</b>${tagHtml(r.reviewerJobTitle)}${reviewerEmail}<small class="table-sub">${esc(r.reviewedAt || '')}</small><small class="table-sub">${esc(r.comment || '')}</small>`;
      const reviewCell = r.status === 'MENUNGGU'
        ? `<div class="row-actions"><button class="action-link approve-link" onclick='openReviewAbsence(${JSON.stringify(r.id)},"DILULUSKAN")'>Lulus</button><button class="action-link warn-link" onclick='openReviewAbsence(${JSON.stringify(r.id)},"DITOLAK")'>Tolak</button></div>`
        : r.synthetic ? '<span class="muted">Tiada permohonan</span>' : reviewDone;
      return `<tr><td><b>${esc(r.name)}</b><small class="table-sub">${esc(r.jobTitle || '—')} · ${esc(r.email)} · ${esc(r.category)}</small></td><td><b>${esc(r.mode === 'KEBERADAAN' ? 'Keberadaan' : 'Tidak Hadir')}</b></td><td><b>${esc(r.type)}</b></td><td>${esc(formatDateRange(r.startDate,r.endDate))}${r.mode === 'KEBERADAAN' ? `<small class="table-sub">${esc(r.startTime || '—')} – ${esc(r.endTime || '—')}</small>` : ''}<small class="table-sub">${r.synthetic ? 'Dikesan:' : 'Hantar:'} ${esc(r.submittedAt)}</small></td><td>${esc(r.note || '—')}</td><td><span class="request-status ${absenceStatusClass(r.status)}">${esc(r.status)}</span></td><td>${reviewCell}</td></tr>`;
    }).join('') : '<tr><td colspan="7" class="empty-cell">Tiada rekod sepadan.</td></tr>';
  }

  function patchedTimeReviewFilters() {
    const data = state.timeReview?.rows || [];
    const q = norm(document.getElementById('timeReviewSearch')?.value);
    const type = document.getElementById('timeReviewType')?.value || '';
    const st = document.getElementById('timeReviewStatus')?.value || '';
    const list = data.filter(r => {
      const hay = norm([r.name,r.jobTitle,r.email,r.category,r.date,r.type,r.session,r.recordTime,r.referenceTime,r.reviewStatus,r.reviewerName,r.reviewerJobTitle,r.comment].join(' '));
      return (!q || hay.includes(q)) && (!type || r.type === type) && (!st || r.reviewStatus === st);
    });
    text('timeReviewCount', `${list.length} / ${data.length} rekod`);
    const body = document.getElementById('timeReviewRows');
    if (!body) return;
    body.innerHTML = list.length ? list.map(r => {
      const reviewed = r.reviewStatus !== 'BELUM DIAMBIL MAKLUM';
      const reviewCell = reviewed
        ? `<b>${esc(r.reviewStatus)} oleh ${esc(r.reviewerName || r.reviewedBy || '—')}</b>${tagHtml(r.reviewerJobTitle)}${r.reviewerName && r.reviewedBy ? `<small class="table-sub">${esc(r.reviewedBy)}</small>` : ''}<small class="table-sub">${esc(r.reviewedAt || '')}</small><small class="table-sub">${esc(r.comment || '')}</small>`
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

      // Review screens: enrich reviewer email with current name/job title, then
      // render a compact role tag below the approver.
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
