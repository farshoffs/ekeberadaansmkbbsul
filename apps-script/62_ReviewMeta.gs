// ---------- Reviewer / approval presentation metadata ----------
// Centralized read-only helpers used by the GitHub Pages UI.  Approval records
// continue to store the reviewer email as the durable key; the current display
// name / job title is resolved from PENGGUNA so old records also benefit when a
// title was not stored at approval time.

function reviewerProfileMap_() {
  const map = {};
  getAllUsers_().forEach(user => {
    const email = normalizeEmail_(user.email);
    if (!email) return;
    map[email] = {
      email,
      name: String(user.name || ''),
      jobTitle: String(user.jobTitle || ''),
      category: String(user.category || ''),
      isAdmin: !!user.isAdmin,
      active: !!user.active
    };
  });
  return map;
}

function reviewerPublicProfile_(email, profileMap) {
  email = normalizeEmail_(email);
  if (!email) return null;
  const profile = (profileMap || reviewerProfileMap_())[email] || null;
  if (!profile) {
    return {email, name:'', jobTitle:'', category:'', isAdmin:false};
  }
  // Reviewer metadata is only exposed for users who can legitimately appear as
  // an approval authority in this app: Pentadbir Sistem / Pengurusan.
  const canReview = profile.isAdmin || ['Pengurusan','Pentadbir'].includes(String(profile.category || ''));
  if (!canReview) return {email, name:'', jobTitle:'', category:'', isAdmin:false};
  return {
    email,
    name: profile.name,
    jobTitle: profile.jobTitle,
    category: profile.category,
    isAdmin: profile.isAdmin
  };
}

/**
 * Resolve reviewer display metadata for approval screens.
 * Any authenticated user may call this, but only management/admin profiles are
 * returned and the list is capped to avoid broad directory enumeration.
 */
function getReviewerMeta(token, emails) {
  requireSessionUser_(token);
  const requested = Array.isArray(emails) ? emails : [];
  const seen = {};
  const normalized = requested
    .map(normalizeEmail_)
    .filter(email => {
      if (!email || seen[email]) return false;
      seen[email] = true;
      return true;
    })
    .slice(0, 50);
  const profiles = reviewerProfileMap_();
  return normalized.map(email => reviewerPublicProfile_(email, profiles)).filter(Boolean);
}

/**
 * Precise per-session time-review metadata for the signed-in user's own punch
 * card.  This lets the UI colour only the actual LEWAT / BALIK AWAL time cell
 * and show the job-title tag of the person who reviewed that exception.
 */
function getMyPunchCardReviewMeta(token, monthKey) {
  const user = requireSessionUser_(token);
  monthKey = String(monthKey || todayKey_().slice(0, 7)).trim();
  if (!/^\d{4}-\d{2}$/.test(monthKey)) throw new Error('Bulan tidak sah.');

  const settings = getSettings_();
  const systemStartDate = getSystemStartDate_(settings);
  const parts = monthKey.split('-').map(Number);
  const monthEnd = `${monthKey}-${String(new Date(parts[0], parts[1], 0).getDate()).padStart(2, '0')}`;
  const today = todayKey_();
  const ensureFrom = `${monthKey}-01` < systemStartDate ? systemStartDate : `${monthKey}-01`;
  const ensureTo = monthEnd > today ? today : monthEnd;

  // Reconstruct historical review rows from attendance when needed so the
  // per-session red marker stays accurate for older punch-card months too.
  if (ensureFrom <= ensureTo) ensureTimeReviewRowsForRange_(ensureFrom, ensureTo);

  const profiles = reviewerProfileMap_();
  const rows = readTimeReviewRows_()
    .filter(r => r.email === user.email && r.date >= systemStartDate && String(r.date || '').slice(0, 7) === monthKey)
    .map(r => {
      const reviewer = reviewerPublicProfile_(r.reviewedBy, profiles);
      return {
        id: String(r.id || ''),
        date: String(r.date || ''),
        type: String(r.type || ''),
        session: Number(r.session || 1),
        reviewStatus: String(r.reviewStatus || 'BELUM DIAMBIL MAKLUM'),
        reviewedBy: String(r.reviewedBy || ''),
        reviewerName: String(r.reviewerName || (reviewer && reviewer.name) || ''),
        reviewerJobTitle: String((reviewer && reviewer.jobTitle) || ''),
        reviewerCategory: String((reviewer && reviewer.category) || ''),
        reviewerIsAdmin: !!(reviewer && reviewer.isAdmin),
        reviewedAt: r.reviewedAt ? formatDateTime_(r.reviewedAt) : '',
        comment: String(r.comment || '')
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.session - b.session || a.type.localeCompare(b.type));

  return {month: monthKey, rows};
}
