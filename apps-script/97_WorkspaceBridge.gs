/**
 * eKeberadaan hybrid MySQL + Google Workspace bridge.
 *
 * Adds a narrow signed endpoint to the existing Apps Script deployment.
 * It never reads/writes PENGGUNA, KEHADIRAN, TETAPAN or other Google Sheets DB
 * tables: MySQL is the ONLY authoritative database for the PHP application.
 *
 * Install: in original Apps Script project's Script Properties create
 * EK_WORKSPACE_BRIDGE_SECRET = a NEW independent 64-hex-character random secret.
 * Add this file and install the one-line doPost hook in Bridges.gs. Deploy NEW
 * version of the existing /exec deployment (same published URL).
 */
function workspaceBridgePost_(e) {
  function json(value) {
    return ContentService.createTextOutput(JSON.stringify(value))
      .setMimeType(ContentService.MimeType.JSON);
  }
  try {
    const p=(e&&e.parameter)||{};
    if (String(p.workspace||'')!=='1') throw new Error('Workspace request not selected.');
    const payload=String(p.payload||'');
    const signature=String(p.signature||'');
    if(!payload||payload.length>175000||!/^[a-zA-Z0-9_-]{43}$/.test(signature))
      throw new Error('Workspace request invalid.');
    const secret=String(PropertiesService.getScriptProperties().getProperty('EK_WORKSPACE_BRIDGE_SECRET')||'').trim();
    if(!/^[0-9a-f]{64,128}$/i.test(secret))throw new Error('EK_WORKSPACE_BRIDGE_SECRET belum ditetapkan.');
    const bytes=Utilities.computeHmacSha256Signature(payload,secret,Utilities.Charset.UTF_8);
    const expected=Utilities.base64EncodeWebSafe(bytes).replace(/=+$/,'');
    let diff=expected.length^signature.length;
    for(let i=0;i<Math.max(expected.length,signature.length);i++)
      diff|=((expected.charCodeAt(i)||0)^(signature.charCodeAt(i)||0));
    if(diff!==0)throw new Error('Workspace signature rejected.');
    const req=JSON.parse(payload);
    if(req.v!==1||!Number.isInteger(req.issuedAt)||Math.abs(Math.floor(Date.now()/1000)-req.issuedAt)>180)
      throw new Error('Workspace request expired.');
    const nonce=String(req.nonce||'');
    if(!/^[a-f0-9]{32}$/.test(nonce))throw new Error('Workspace request nonce invalid.');
    const cache=CacheService.getScriptCache(),key='EK_WS_NONCE_'+nonce;
    if(cache.get(key))throw new Error('Workspace request already used.');
    cache.put(key,'1',240);
    const data=req.data||{};
    let result;
    switch(String(req.action||'')){
      case 'photo': result=workspacePhoto_(data);break;
      case 'syncPhotos':result=workspaceSyncPhotos_(data);break;
      case 'exportPdf':result=workspaceExportPdf_(data);break;
      case 'exportSheet':result=workspaceExportSheet_(data);break;
      default:throw new Error('Workspace operation not allowed.');
    }
    return json({ok:true,result:result});
  }catch(err){
    // Never echo the shared secret, signed payload, stack or file data.
    return json({ok:false,error:String(err&&err.message||'Workspace error').slice(0,180)});
  }
}

function workspacePhoto_(data) {
  const id=String(data.fileId||'').trim();
  if(!/^[A-Za-z0-9_-]{12,120}$/.test(id))throw new Error('Photo file ID invalid.');
  const file=DriveApp.getFileById(id);
  const mime=String(file.getMimeType()||'');
  if(!/^image\/(?:png|jpeg|webp|gif)$/.test(mime))throw new Error('Drive photo type unsupported.');
  if(file.getSize()>1200000)throw new Error('Drive photo exceeds 1.2 MB.');
  const encoded=Utilities.base64Encode(file.getBlob().getBytes());
  return {ok:true,dataUrl:'data:'+mime+';base64,'+encoded};
}

function workspaceSyncPhotos_(data){
  const rootId=String(data.rootFolderId||'').trim();
  if(!/^[A-Za-z0-9_-]{12,120}$/.test(rootId))throw new Error('Profile root folder missing.');
  const users=Array.isArray(data.users)?data.users:[];
  if(users.length>250)throw new Error('Too many users for one photo sync.');
  const root=DriveApp.getFolderById(rootId);
  const categories={Pengurusan:'01 - Pengurusan',Pentadbir:'01 - Pengurusan',
    PPP:'02 - Guru',AKP:'03 - Anggota Kumpulan Pelaksana',
    Praktikum:'04 - Praktikum',MySTEP:'05 - MySTEP'};
  const roots={};
  const uniqueNames=[...new Set(Object.values(categories))];
  uniqueNames.forEach(n=>{
    const it=root.getFoldersByName(n);
    if(it.hasNext()) roots[n]=it.next();
  });
  const normalize=n=>String(n||'').trim().toLowerCase().replace(/\s+/g,' ');
  const folders={};
  Object.entries(categories).forEach(([cat,n])=>{
    if(!roots[n])return;
    if(!folders[n]){
      const names={};const it=roots[n].getFolders();
      while(it.hasNext()){const f=it.next();names[normalize(f.getName())]=f;}
      folders[n]=names;
    }
  });
  let matched=0;
  const unmatched=[],updates=[];
  users.forEach(u=>{
    const email=String(u.email||'').toLowerCase(),name=String(u.name||'');
    const category=String(u.category||'');
    if(!email||!name||!categories[category])return;
    const f=folders[categories[category]]?.[normalize(name)];
    if(!f){unmatched.push(name+' ('+category+')');return;}
    const fs=f.getFiles();let hit=null;
    while(fs.hasNext()){
      const file=fs.next();
      if(String(file.getName()).toLowerCase()==='eoperasi.png'){hit=file;break;}
    }
    if(!hit){unmatched.push(name+' — eoperasi.png tiada');return;}
    updates.push({email:email,fileId:hit.getId()});matched++;
  });
  return {ok:true,matched:matched,unmatched:unmatched.slice(0,250),updates:updates};
}
function workspaceSanitizeName_(name){
  return String(name||'Laporan eKeberadaan').replace(/[<>:"/\\|?*\x00-\x1f]/g,' ').slice(0,90);
}
function workspaceTableData_(data){
  const headers=Array.isArray(data.headers)?data.headers:[];
  const rows=Array.isArray(data.rows)?data.rows:[];
  if(!headers.length||headers.length>20||rows.length>250)
    throw new Error('Workspace report exceeds 250 rows or 20 columns.');
  const clean=v=>String(v===null||v===undefined?'':v).slice(0,250);
  return {
    headers:headers.map(clean),
    rows:rows.map(row=>{
      if(!Array.isArray(row))return headers.map(()=>'');
      return headers.map((_,i)=>clean(row[i]));
    })
  };
}
function workspaceExportPdf_(data){
  const table=workspaceTableData_(data);
  const title=workspaceSanitizeName_(data.title);
  const doc=DocumentApp.create(title+' [sementara]');
  try{
    const body=doc.getBody();
    body.appendParagraph(title).setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph(String(data.subtitle||'').slice(0,250));
    const count=Math.min(table.rows.length,180); // PDF response must stay bounded.
    const cells=[table.headers].concat(table.rows.slice(0,count));
    if(cells.length) body.appendTable(cells);
    if(table.rows.length>count)
      body.appendParagraph('Nota: laporan melebihi '+count+' baris; gunakan eksport Google Sheets untuk data penuh.');
    doc.saveAndClose();
    const file=DriveApp.getFileById(doc.getId());
    const blob=file.getAs(MimeType.PDF);
    if(blob.getSize()>2500000) throw new Error('PDF melebihi 2.5 MB. Kecilkan julat tarikh.');
    return {ok:true,mimeType:'application/pdf',fileName:title+'.pdf',base64:Utilities.base64Encode(blob.getBytes())};
  }finally {
    try{DriveApp.getFileById(doc.getId()).setTrashed(true);}catch(e){}
  }
}
function workspaceExportSheet_(data){
  const table=workspaceTableData_(data);
  const title=workspaceSanitizeName_(data.title);
  const ss=SpreadsheetApp.create(title);
  const sh=ss.getSheets()[0];sh.setName('LAPORAN');
  // Escape formula-style user-supplied cells to avoid spreadsheet formula injection.
  const safe=value=>/^[=+\-@]/.test(value)?"'"+value:value;
  const values=[table.headers].concat(table.rows).map(r=>r.map(safe));
  sh.getRange(1,1,values.length,table.headers.length).setValues(values);
  sh.getRange(1,1,1,table.headers.length).setFontWeight('bold').setBackground('#dce8ff');
  sh.setFrozenRows(1);sh.autoResizeColumns(1,table.headers.length);
  return {ok:true,url:ss.getUrl(),sheetName:'LAPORAN',sheetNames:['LAPORAN']};
}
