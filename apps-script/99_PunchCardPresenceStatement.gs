// Punch Card Digital: show the selected Keberadaan type in Kenyataan.
// This wraps the existing monthly card builder without changing punch logic.

const buildPunchCardMonthForUserBase_ = buildPunchCardMonthForUser_;
buildPunchCardMonthForUser_ = function(user, monthKey) {
  const data = buildPunchCardMonthForUserBase_(user, monthKey);
  if (!data || !Array.isArray(data.records) || !user || !user.email) return data;

  const presenceRows = readAbsenceRows_().filter(r =>
    r.email === user.email &&
    r.mode === 'KEBERADAAN' &&
    ['MENUNGGU', 'DILULUSKAN'].includes(String(r.status || '').toUpperCase())
  );

  data.records.forEach(r => {
    const dateKey = String(r.date || '');
    if (!dateKey) return;
    const presence = presenceRows.find(p => p.startDate <= dateKey && p.endDate >= dateKey);
    if (!presence) return;

    // Keep actual attendance status/times untouched. Enrich both own/admin cards
    // with the exact Keberadaan type selected by the user.
    const presenceType = String(presence.type || '').trim() || 'Keberadaan';
    r.presenceType = presenceType;
    r.reason = `${presenceType} — Maklum from Pengetua`;
  });

  return data;
};
