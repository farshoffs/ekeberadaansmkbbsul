// ---------- Semakan Lewat / Balik Awal (Pentadbir Sistem sahaja) ----------
function getTimeReviewSheet_() {
  let sh = getSpreadsheet_().getSheetByName(EK.SHEETS.TIME_REVIEW);
  if (!sh) { setupTimeReviewSheet_(getSpreadsheet_()); sh = getSpreadsheet_().getSheetByName(EK.SHEETS.TIME_REVIEW); }
  EK_RUNTIME_SHEETS_[EK.SHEETS.TIME_REVIEW] = sh;
  return sh;
}

function readTimeReviewRows_(){
  if(Array.isArray(EK_RUNTIME_TIME_REVIEW_ROWS_))return EK_RUNTIME_TIME_REVIEW_ROWS_;
  const sh=getTimeReviewSheet_();if(sh.getLastRow()<2)return(EK_RUNTIME_TIME_REVIEW_ROWS_=[]);
  EK_RUNTIME_TIME_REVIEW_ROWS_=sh.getRange(2,1,sh.getLastRow()-1,EK.TIME_REVIEW_HEADERS.length).getValues().map((v,i)=>({
    row:i+2,id:String(v[0]||''),createdAt:v[1]||'',date:dateCellToKey_(v[2]),email:normalizeEmail_(v[3]),name:String(v[4]||''),jobTitle:String(v[5]||''),category:String(v[6]||''),type:String(v[7]||''),session:Number(v[8]||1),recordTime:displayMalaysiaTime_(v[9]),referenceTime:displayMalaysiaTime_(v[10]),reviewStatus:String(v[11]||'BELUM DIAMBIL MAKLUM'),reviewedBy:String(v[12]||''),reviewerName:String(v[13]||''),reviewedAt:v[14]||'',comment:String(v[15]||'')
  })).filter(r=>r.id);return EK_RUNTIME_TIME_REVIEW_ROWS_;
}
function invalidateTimeReviewRows_(){EK_RUNTIME_TIME_REVIEW_ROWS_=null;}

function publicTimeReview_(r) {
  return {id:r.id,date:r.date,email:r.email,name:r.name,jobTitle:r.jobTitle||'',category:r.category,type:r.type,session:r.session,recordTime:r.recordTime,referenceTime:r.referenceTime,
    reviewStatus:r.reviewStatus||'BELUM DIAMBIL MAKLUM',reviewedBy:r.reviewedBy||'',reviewerName:r.reviewerName||'',reviewedAt:r.reviewedAt?formatDateTime_(r.reviewedAt):'',comment:r.comment||'',createdAt:r.createdAt?formatDateTime_(r.createdAt):''};
}

function timeReviewId_(user,date,type,session){
  return `SW-${String(date||todayKey_()).replace(/-/g,'')}-${fastStableKey_([user.email,date,type,session].join('|'))}`;
}

function createTimeReviewRecord_(data) {
  const user = data.user;
  const id = timeReviewId_(user,data.date,data.type,data.session);
  const existing = readTimeReviewRows_().find(r=>r.id===id);
  if (existing) return Object.assign({}, existing, {isNew:false});
  const now = new Date();
  const row = [id,now,data.date,user.email,user.name,user.jobTitle||'',user.category,data.type,Number(data.session||1),data.recordTime||'',data.referenceTime||'','BELUM DIAMBIL MAKLUM','','','', ''];
  const sh = getTimeReviewSheet_(); sh.appendRow(row); invalidateTimeReviewRows_();
  return {row:sh.getLastRow(),id,createdAt:now,date:data.date,email:user.email,name:user.name,jobTitle:user.jobTitle||'',category:user.category,type:data.type,session:Number(data.session||1),recordTime:data.recordTime||'',referenceTime:data.referenceTime||'',reviewStatus:'BELUM DIAMBIL MAKLUM',reviewedBy:'',reviewerName:'',reviewedAt:'',comment:'',isNew:true};
}

function getSystemAdminEmails_() {
  const emails = getAllUsers_().filter(u=>u.active && u.isAdmin && isValidEmail_(u.email)).map(u=>u.email);
  const owner = getUserByEmail_(EK.EMAIL.OWNER_EMAIL, true);
  if (owner && owner.isAdmin) emails.push(owner.email);
  const unique=[...new Set(emails.map(normalizeEmail_).filter(Boolean))];
  return unique.length?unique:[EK.EMAIL.OWNER_EMAIL];
}

function notifyTimeException_(r) {
  const recipients = getSystemAdminEmails_();
  const subject = `${r.type} — ${r.name} (${r.date})`;
  const html = emailFrame_('Makluman rekod waktu', `<p>Rekod waktu memerlukan perhatian Pentadbir Sistem.</p>${detailTable_([
    ['Nama',r.name],['Jawatan',r.jobTitle||'—'],['Emel',r.email],['Jenis',r.type],['Sesi',String(r.session)],['Tarikh',r.date],['Waktu direkod',r.recordTime],['Waktu rujukan',r.referenceTime||'—'],['Status','BELUM DIAMBIL MAKLUM']
  ])}`);
  const text = [`Makluman ${r.type}`,`Nama: ${r.name}`,`Jawatan: ${r.jobTitle||'-'}`,`Tarikh: ${r.date}`,`Sesi: ${r.session}`,`Waktu: ${r.recordTime}`,`Rujukan: ${r.referenceTime||'-'}`].join('\n');
  return safeSendSystemEmail_(recipients,subject,html,text,r.id);
}

function inferAttendanceFlags_(values, user, settings) {
  const v = padAttendanceValues_(values);
  const flags = splitAttendanceFlags_(v[34]);
  const status = String(v[14] || '').toUpperCase();
  if (flags.length) return flags;
  if (status.includes('LEWAT')) flags.push('LEWAT');
  if (status.includes('BALIK AWAL')) flags.push('BALIK AWAL');
  if (!user || status === 'TIDAK HADIR' || String(v[15] || '').toUpperCase() === 'TEST') return flags;
  settings = settings || getSettings_();
  const schedule = getEffectiveSchedule_(user, settings);
  const pairs = [
    {type:'LEWAT', value:v[4], ref:schedule.s1In, cmp:(a,b)=>a>b},
    {type:'BALIK AWAL', value:v[9], ref:schedule.s1Out, cmp:(a,b)=>a<b},
    {type:'LEWAT', value:v[22], ref:schedule.s2In, cmp:(a,b)=>a>b},
    {type:'BALIK AWAL', value:v[27], ref:schedule.s2Out, cmp:(a,b)=>a<b}
  ];
  pairs.forEach(x=>{
    if (!x.value || !x.ref) return;
    const mins=timeToMinutes_(formatTime_(x.value)), ref=timeToMinutes_(x.ref);
    if (Number.isFinite(mins) && Number.isFinite(ref) && x.cmp(mins,ref) && !flags.includes(x.type)) flags.push(x.type);
  });
  return flags;
}

function ensureTimeReviewRowsForRange_(from, to) {
  const settings=getSettings_(), usersByEmail={}; getAllUsers_().forEach(u=>usersByEmail[u.email]=u);
  const absenceRows=readAbsenceRows_();
  const existingRows=readTimeReviewRows_(), existingIds=new Set(existingRows.map(r=>r.id)), toAppend=[];
  getAttendanceValuesInDateRange_(from,to).forEach(raw=>{
    const v=padAttendanceValues_(raw), date=dateCellToKey_(v[0]), email=normalizeEmail_(v[1]), user=usersByEmail[email];
    if(!date||!user||String(v[14]||'').toUpperCase()==='TIDAK HADIR'||String(v[15]||'').toUpperCase()==='TEST')return;
    const schedule=getEffectiveSchedule_(user,settings);
    const checks=[
      {type:'LEWAT',session:1,value:v[4],ref:schedule.s1In,cmp:(a,b)=>a>b},
      {type:'BALIK AWAL',session:1,value:v[9],ref:schedule.s1Out,cmp:(a,b)=>a<b},
      {type:'LEWAT',session:2,value:v[22],ref:schedule.s2In,cmp:(a,b)=>a>b},
      {type:'BALIK AWAL',session:2,value:v[27],ref:schedule.s2Out,cmp:(a,b)=>a<b}
    ];
    checks.forEach(x=>{
      if(!x.value||!x.ref)return;
      const recordTime=formatTime_(x.value), mins=timeToMinutes_(recordTime), refMins=timeToMinutes_(x.ref);
      if(!Number.isFinite(mins)||!Number.isFinite(refMins)||!x.cmp(mins,refMins))return;
      const id=timeReviewId_(user,date,x.type,x.session); if(existingIds.has(id))return;
      existingIds.add(id); const now=new Date();

      let reviewStatus='BELUM DIAMBIL MAKLUM', reviewedBy='', reviewerName='', reviewedAt='', comment='';
      if(x.type==='LEWAT'){
        const approvedPresence=absenceRows.find(r=>
          r.email===email && r.mode==='KEBERADAAN' && r.status==='DILULUSKAN' &&
          r.startDate<=date && r.endDate>=date && r.endTime &&
          mins>=timeToMinutes_(r.endTime)
        )||null;
        if(approvedPresence){
          reviewedBy=normalizeEmail_(approvedPresence.reviewedBy||'');
          reviewerName=getReviewerNameFromEmail_(reviewedBy);
          reviewedAt=approvedPresence.reviewedAt||now;
          reviewStatus='DIAMBIL MAKLUM';
          comment=`Diambil maklum melalui Keberadaan ${approvedPresence.id}: ${approvedPresence.type}${approvedPresence.note?` — ${approvedPresence.note}`:''}`;
        }
      }
      toAppend.push([id,now,date,user.email,user.name,user.jobTitle||'',user.category,x.type,x.session,recordTime,x.ref,reviewStatus,reviewedBy,reviewerName,reviewedAt,comment]);
    });
  });
  if(toAppend.length){
    const sh=getTimeReviewSheet_();
    sh.getRange(sh.getLastRow()+1,1,toAppend.length,EK.TIME_REVIEW_HEADERS.length).setValues(toAppend);
    invalidateTimeReviewRows_();
    audit_('MIGRASI_SEMAKAN_WAKTU',`${from}..${to}`,`${toAppend.length} rekod semakan lama diwujudkan`,'SISTEM');
  }
  return toAppend.length;
}

function getTimeReviewData(token, fromDate, toDate) {
  requireSessionAdmin_(token);
  ensureMalaysiaSpreadsheetTimeZone_();
  const today=todayKey_(), settings=getSettings_(), systemStartDate=getSystemStartDate_(settings);
  let from=validateDateKey_(fromDate||today);
  const to=validateDateKey_(toDate||today);
  if(to<from) throw new Error('Tarikh akhir tidak boleh sebelum tarikh mula.');
  if(to<systemStartDate) throw new Error(`Tiada data sistem sebelum ${systemStartDate}. Ubah SYSTEM_START_DATE di sheet TETAPAN jika perlu.`);
  from=clampToSystemStart_(from,settings);
  ensureTimeReviewRowsForRange_(from,to);
  const rows=readTimeReviewRows_().filter(r=>r.date>=from&&r.date<=to).map(publicTimeReview_).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));
  return {fromDate:from,toDate:to,rows};
}

function reviewTimeException(token,id,decision,comment) {
  const admin=requireSessionAdmin_(token);
  const rec=readTimeReviewRows_().find(r=>r.id===String(id||''));
  if(!rec) throw new Error('Rekod semakan waktu tidak dijumpai.');
  decision=String(decision||'').toUpperCase();
  if(!['DIAMBIL MAKLUM','DITOLAK'].includes(decision)) throw new Error('Keputusan tidak sah.');
  const now=new Date(); const sh=getTimeReviewSheet_();
  sh.getRange(rec.row,12,1,5).setValues([[decision,admin.email,admin.name,now,String(comment||'').trim()]]);
  invalidateTimeReviewRows_();
  audit_('SEMAK_WAKTU',rec.id,`${decision}; ${rec.type}; ${rec.date}; sesi=${rec.session}`,admin.email);
  return {ok:true,status:decision,reviewerName:admin.name,reviewedAt:formatDateTime_(now)};
}

function timeReviewStatementForCard_(reviews, flags) {
  flags=Array.isArray(flags)?flags:splitAttendanceFlags_(flags);
  if(!flags.length) return '';
  const relevant=(reviews||[]).filter(r=>flags.includes(String(r.type||'').toUpperCase()));
  if(relevant.some(r=>r.reviewStatus==='DITOLAK')) {
    const x=relevant.find(r=>r.reviewStatus==='DITOLAK'); return `DITOLAK - ${x.reviewerName||'PENTADBIR SISTEM'}`;
  }
  if(relevant.length && relevant.every(r=>r.reviewStatus==='DIAMBIL MAKLUM')) return 'Maklum - Pengetua';
  return 'Belum diambil Maklum';
}

function generatePdfReport_(title, headers, rows, fileName) {
  const doc=DocumentApp.create(fileName.replace(/\.pdf$/i,'')); const body=doc.getBody();
  setPdfLandscape_(body);
  body.appendParagraph(title).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(`Dijana: ${formatDateTime_(new Date())}`);
  const table=body.appendTable([headers].concat(rows.map(r=>r.map(v=>String(v==null?'':v)))));
  if(table.getNumRows()){const hr=table.getRow(0);for(let c=0;c<hr.getNumCells();c++)hr.getCell(c).editAsText().setBold(true);}
  doc.saveAndClose(); const f=DriveApp.getFileById(doc.getId()); const blob=f.getAs(MimeType.PDF).setName(fileName); f.setTrashed(true);
  return {fileName,mimeType:'application/pdf',base64:Utilities.base64Encode(blob.getBytes())};
}

function generateTimeReviewPdf(token, filters) {
  requireSessionAdmin_(token); filters=filters||{};
  const data=getTimeReviewData(token,filters.fromDate,filters.toDate);
  let rows=data.rows;
  if(filters.type) rows=rows.filter(r=>r.type===filters.type);
  if(filters.status) rows=rows.filter(r=>r.reviewStatus===filters.status);
  return generatePdfReport_(`Laporan Semakan Lewat / Balik Awal ${data.fromDate} hingga ${data.toDate}`,
    ['Tarikh','Nama','Jawatan','Jenis','Sesi','Rekod','Rujukan','Status Semakan','Pelulus','Ulasan'],
    rows.map(r=>[r.date,r.name,r.jobTitle,r.type,r.session,r.recordTime,r.referenceTime,r.reviewStatus,r.reviewerName||'',r.comment||'']),
    `Semakan_Waktu_${data.fromDate}_${data.toDate}.pdf`);
}
