// ---------- Profile photos from Google Drive ----------

function getProfilePhoto(token, email) {
  const viewer = requireSessionUser_(token);
  const targetEmail = normalizeEmail_(email || viewer.email);
  if (targetEmail !== viewer.email && !isManagementUser_(viewer)) throw new Error('Akses gambar profil tidak dibenarkan.');
  const target = getUserByEmail_(targetEmail, false);
  if (!target || !target.profilePhotoFileId) return {ok:true,dataUrl:''};
  try {
    const file = DriveApp.getFileById(target.profilePhotoFileId);
    const blob = file.getBlob();
    const mime = blob.getContentType() || 'image/png';
    const dataUrl = `data:${mime};base64,${Utilities.base64Encode(blob.getBytes())}`;
    return {ok:true,dataUrl};
  } catch (e) {
    return {ok:true,dataUrl:'',error:'Gambar profil tidak dapat dibaca. Jalankan sync semula.'};
  }
}

function adminSyncProfilePhotos(token) {
  const admin = requireSessionAdmin_(token);
  const result = syncProfilePhotosFromDrive_();
  audit_('SYNC_GAMBAR_PROFIL', EK.SHEETS.USERS, `Padan=${result.matched}; tiada=${result.unmatched.length}`, admin.email);
  return Object.assign({ok:true}, result);
}

function syncProfilePhotosFromMenu() {
  const admin = requireGoogleAdmin_();
  const result = syncProfilePhotosFromDrive_();
  audit_('SYNC_GAMBAR_PROFIL', EK.SHEETS.USERS, `Menu Sheet; padan=${result.matched}; tiada=${result.unmatched.length}`, admin.email);
  SpreadsheetApp.getUi().alert('Sync gambar profil', `Berjaya dipadankan: ${result.matched}\nTidak dijumpai: ${result.unmatched.length}${result.unmatched.length ? '\n\n' + result.unmatched.slice(0,15).join('\n') : ''}`, SpreadsheetApp.getUi().ButtonSet.OK);
}

function syncProfilePhotosFromDrive_() {
  const settings = getSettings_();
  const rootId = String(settings.PROFILE_ROOT_FOLDER_ID || '').trim();
  if (!rootId) throw new Error('PROFILE_ROOT_FOLDER_ID belum ditetapkan.');
  const root = DriveApp.getFolderById(rootId);
  const categoryNames = {Pengurusan:'01 - Pengurusan', Pentadbir:'01 - Pengurusan', PPP:'02 - Guru', AKP:'03 - Anggota Kumpulan Pelaksana'};
  const categoryFolders = {};
  Object.keys(categoryNames).forEach(cat => {
    const it = root.getFoldersByName(categoryNames[cat]);
    if (it.hasNext()) categoryFolders[cat] = it.next();
  });
  const users = getAllUsers_();
  const sh = getSheetOrThrow_(EK.SHEETS.USERS);
  const photoRows = sh.getLastRow() >= 2 ? sh.getRange(2, 17, sh.getLastRow() - 1, 2).getValues() : [];
  let matched = 0;
  const unmatched = [];
  const folderMaps = {};

  Object.keys(categoryFolders).forEach(cat => {
    const map = {};
    const it = categoryFolders[cat].getFolders();
    while (it.hasNext()) { const f = it.next(); map[normalizeNameKey_(f.getName())] = f; }
    folderMaps[cat] = map;
  });

  users.forEach(u => {
    const map = folderMaps[u.category];
    const folder = map && map[normalizeNameKey_(u.name)];
    if (!folder) { unmatched.push(`${u.name} (${u.category})`); return; }
    let found = null;
    const files = folder.getFiles();
    while (files.hasNext()) {
      const f = files.next();
      if (String(f.getName() || '').toLowerCase() === 'eoperasi.png') { found = f; break; }
    }
    if (!found) { unmatched.push(`${u.name} — eoperasi.png tiada`); return; }
    const idx = u.row - 2;
    if (idx >= 0 && idx < photoRows.length) photoRows[idx] = [found.getId(), new Date()];
    matched++;
  });
  if (matched && photoRows.length) {
    sh.getRange(2, 17, photoRows.length, 2).setValues(photoRows);
    sh.getRange(2, 18, photoRows.length, 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
  }
  invalidateUsersCache_();
  SpreadsheetApp.flush();
  return {matched, unmatched, rootFolderId:rootId};
}

function normalizeNameKey_(name) { return String(name || '').trim().toLowerCase().replace(/\s+/g,' '); }
