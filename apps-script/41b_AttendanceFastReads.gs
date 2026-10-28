// ---------- Attendance narrow-read helpers ----------
// Keep user-scoped punch-card reads proportional to the requested user, not to
// every staff member who has attendance in the same month.

function getAttendanceValuesForUserMonthFast_(email, monthKey) {
  monthKey = String(monthKey || '').trim();
  if (!/^\d{4}-\d{2}$/.test(monthKey)) throw new Error('Bulan tidak sah.');
  email = normalizeEmail_(email);
  if (!email) return [];

  const sh = getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
  const idx = getAttendanceRowIndex_();
  const rowNumbers = [];

  // A month has at most 31 date+email keys. This avoids reading all monthly
  // rows (for example ~3,000 rows for 100 staff) only to discard 99% of them.
  for (let day = 1; day <= 31; day++) {
    const dateKey = `${monthKey}-${String(day).padStart(2, '0')}`;
    const rows = (idx.byKey && idx.byKey[dateKey + '|' + email]) || [];
    if (rows.length) rowNumbers.push(...rows);
  }

  if (!rowNumbers.length) return [];
  return readAttendanceRowsByRowNumbers_(sh, rowNumbers)
    .filter(r => r.email === email && dateCellToKey_(r.values[0]).slice(0, 7) === monthKey)
    .map(r => r.values);
}
