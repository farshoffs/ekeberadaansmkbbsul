// ---------- Semakan Lewat / Balik Awal (Pentadbir Sistem sahaja) ----------
function getTimeReviewSheet_() {
  let sh = getSpreadsheet_().getSheetByName(EK.SHEETS.TIME_REVIEW);
  if (!sh) { setupTimeReviewSheet_(getSpreadsheet_()); sh = getSpreadsheet_().getSheetByName(EK.SHEETS.TIME_REVIEW); }
  EK_RUNTIME_SHEETS_[EK.SHEETS.TIME_REVIEW] = sh;
  return sh;
}

const EK_TIME_REVIEW_CACHE_KEY_='EK_PERF_TIME_REVIEW_ROWS_V1';
const EK_TIME_REVIEW_CACHE_TTL_SEC_=60;
function readTimeReviewRows_(){
  if(Array.isArray(EK_RUNTIME_TIME_REVIEW_ROWS_))return EK_RUNTIME_TIME_REVIEW_ROWS_;
  const cached=cacheGetJson_(EK_TIME_REVIEW_CACHE_KEY_);
  if(Array.isArray(cached)){EK_RUNTIME_TIME_REVIEW_ROWS_=cached;return cached;}
  const sh=getTimeReviewSheet_();if(sh.getLastRow()<2)return(EK_RUNTIME_TIME_REVIEW_ROWS_=[]);
  EK_RUNTIME_TIME_REVIEW_ROWS_=sh.getRange(2,1,sh.getLastRow()-1,EK.TIME_REVIEW_HEADERS.length).getValues().map((v,i)=>({
    row:i+2,id:String(v[0]||''),createdAt:v[1]||'',date:dateCellToKey_(v[2]),email:normalizeEmail_(v[3]),name:String(v[4]||''),jobTitle:String(v[5]||''),category:String(v[6]||''),type:String(v[7]||''),session:Number(v[8]||1),recordTime:displayMalaysiaTime_(v[9]),referenceTime:displayMalaysiaTime_(v[10]),reviewStatus:String(v[11]||'BELUM DIAMBIL MAKLUM'),reviewedBy:String(v[12]||''),reviewerName:String(v[13]||''),reviewedAt:v[14]||'',comment:String(v[15]||'')
  })).filter(r=>r.id);cachePutJson_(EK_TIME_REVIEW_CACHE_KEY_,EK_RUNTIME_TIME_REVIEW_ROWS_,EK_TIME_REVIEW_CACHE_TTL_SEC_);return EK_RUNTIME_TIME_REVIEW_ROWS_;
}
function invalidateTimeReviewRows_(){EK_RUNTIME_TIME_REVIEW_ROWS_=null;try{getScriptCache_().remove(EK_TIME_REVIEW_CACHE_KEY_);}catch(e){}}

function getReviewerJobTitleFromEmail_(email) {
  const em=normalizeEmail_(email), u=em?getUserByEmail_(em,false):null;
  return u?String(u.jobTitle||(u.isAdmin?'Pentadbir Sistem':u.category||'')).trim():'';
}

function publicTimeReview_(r) {
  return {id:r.id,date:r.date,email:r.email,name:r.name,jobTitle:r.jobTitle||'',category:r.category,type:r.type,session:r.session,recordTime:r.recordTime,referenceTime:r.referenceTime,
    reviewStatus:r.reviewStatus||'BELUM DIAMBIL MAKLUM',reviewerJobTitle:getReviewerJobTitleFromEmail_(r.reviewedBy),reviewedAt:r.reviewedAt?formatDateTime_(r.reviewedAt):'',comment:r.comment||'',createdAt:r.createdAt?formatDateTime_(r.createdAt):''};
}

function timeReviewId_(user,date,type,session){
  return `SW-${String(date||todayKey_()).replace(/-/g,'')}-${fastStableKey_([user.email,date,type,session].join('|'))}`;
}

function createTimeReviewRecord_(data) {
  const user = data.user;
  const id = timeReviewId_(user,data.date,data.type,data.session);
  if(!data.assumeNew){
    const existing = readTimeReviewRows_().find(r=>r.id===id);
    if (existing) return Object.assign({}, existing, {isNew:false});
  }
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

const EK_TIME_REVIEW_NOTIFY_PROPERTY_PREFIX_ = 'EK_TIME_REVIEW_NOTIFY_V1_';

function queueTimeExceptionNotification_(review) {
  const id = String(review && review.id || '').trim();
  if (!id) return false;
  PropertiesService.getScriptProperties().setProperty(EK_TIME_REVIEW_NOTIFY_PROPERTY_PREFIX_ + id, '1');
  return true;
}

function flushTimeExceptionNotificationQueue_() {
  const props = PropertiesService.getScriptProperties();
  const all = props.getProperties();
  const keys = Object.keys(all)
    .filter(k => k.indexOf(EK_TIME_REVIEW_NOTIFY_PROPERTY_PREFIX_) === 0)
    .slice(0, 25);
  if (!keys.length) return {processed:0,sent:0,failed:0};

  const rowsById = {};
  readTimeReviewRows_().forEach(r => { if (r && r.id) rowsById[String(r.id)] = r; });
  let sent = 0, failed = 0;

  keys.forEach(key => {
    const id = key.slice(EK_TIME_REVIEW_NOTIFY_PROPERTY_PREFIX_.length);
    const review = rowsById[id];
    if (!review) {
      props.deleteProperty(key);
      return;
    }
    const result = notifyTimeException_(review);
    if (result && result.ok) {
      props.deleteProperty(key);
      sent++;
    } else {
      failed++;
    }
  });

  return {processed:keys.length,sent,failed};
}

function inferAttendanceFlags_(values,user,settings,dateKey) {
  const v=padAttendanceValues_(values);
  const stored=splitAttendanceFlags_(v[34]);
  const status=String(v[14]||'').toUpperCase();
  if(status==='TIDAK HADIR')return [];
  dateKey=dateCellToKey_(dateKey||v[0])||todayKey_();
  if(isPublicHolidayDate_(dateKey))return [];

  const fallback=stored.slice();
  if(!fallback.length){
    if(status.includes('LEWAT'))fallback.push('LEWAT');
    if(status.includes('BALIK AWAL'))fallback.push('BALIK AWAL');
  }
  if(!user||String(v[15]||'').toUpperCase()==='TEST')return fallback;

  settings=settings||getSettings_();
  const flags=[];
  const add=flag=>{if(flag&&!flags.includes(flag))flags.push(flag);};

  // LEWAT can only be recalculated when every recorded IN has a schedule
  // version that already existed at that exact punch timestamp. Otherwise the
  // stored historical status remains authoritative.
  const inChecks=[];
  if(v[4])inChecks.push({value:v[4],key:'s1In'});
  if(v[22])inChecks.push({value:v[22],key:'s2In'});
  let lateKnown=inChecks.length>0, isLate=false;
  inChecks.forEach(x=>{
    const ctx=getScheduleTimingContext_(user,settings,x.value);
    if(!ctx.known){lateKnown=false;return;}
    const ref=String(ctx.schedule[x.key]||'').trim();
    if(!ref){lateKnown=false;return;}
    const actual=timeToMinutes_(formatTime_(x.value)), expected=timeToMinutes_(ref);
    if(Number.isFinite(actual)&&Number.isFinite(expected)&&actual>expected)isLate=true;
  });
  if(lateKnown){if(isLate)add('LEWAT');}
  else if(fallback.includes('LEWAT'))add('LEWAT');

  // BALIK AWAL is based only on the final departure. A versioned snapshot also
  // freezes the WBF Thursday settings and eligibility that applied then.
  const usesSession2=!!v[22], finalOutValue=usesSession2?v[27]:v[9];
  if(finalOutValue){
    const ctx=getScheduleTimingContext_(user,settings,finalOutValue);
    if(ctx.known){
      const ref=getFinalOutReferenceFromTimingContext_(ctx,dateKey,v);
      const actual=timeToMinutes_(formatTime_(finalOutValue)), expected=timeToMinutes_(ref);
      if(ref&&Number.isFinite(actual)&&Number.isFinite(expected)&&actual<expected)add('BALIK AWAL');
    }else if(fallback.includes('BALIK AWAL'))add('BALIK AWAL');
  }else if(fallback.includes('BALIK AWAL'))add('BALIK AWAL');
  return flags;
}

function effectiveAttendanceStatus_(values,user,settings,dateKey) {
  const v=padAttendanceValues_(values);
  const storedStatus=String(v[14]||'');
  if(storedStatus.toUpperCase()==='TIDAK HADIR')return 'TIDAK HADIR';
  if(!v[4])return storedStatus;
  return attendanceStatusFromFlags_(inferAttendanceFlags_(v,user,settings,dateKey));
}

function ensureTimeReviewRowsForRange_(from,to) {
  const settings=getSettings_(),usersByEmail={};getAllUsers_().forEach(u=>usersByEmail[u.email]=u);
  const absenceRows=readAbsenceRows_();
  const existingRows=readTimeReviewRows_(),existingIds=new Set(existingRows.map(r=>r.id)),toAppend=[];
  getAttendanceValuesInDateRange_(from,to).forEach(raw=>{
    const v=padAttendanceValues_(raw),date=dateCellToKey_(v[0]),email=normalizeEmail_(v[1]),user=usersByEmail[email];
    if(!date||!user||String(v[14]||'').toUpperCase()==='TIDAK HADIR'||String(v[15]||'').toUpperCase()==='TEST')return;
    const effectiveFlags=inferAttendanceFlags_(v,user,settings,date);
    if(!effectiveFlags.length)return;

    const checks=[];
    if(effectiveFlags.includes('LEWAT')){
      if(v[4])checks.push({type:'LEWAT',session:1,value:v[4],key:'s1In',cmp:(a,b)=>a>b});
      if(v[22])checks.push({type:'LEWAT',session:2,value:v[22],key:'s2In',cmp:(a,b)=>a>b});
    }
    if(effectiveFlags.includes('BALIK AWAL')){
      const usesSession2=!!v[22], value=usesSession2?v[27]:v[9], session=usesSession2?2:1;
      if(value)checks.push({type:'BALIK AWAL',session,value,key:'FINAL_OUT',cmp:(a,b)=>a<b});
    }

    checks.forEach(x=>{
      const ctx=getScheduleTimingContext_(user,settings,x.value);
      // No timestamped historical version = do not invent a reference from the
      // user's current schedule. Existing legacy status is preserved instead.
      if(!ctx.known)return;
      const ref=x.key==='FINAL_OUT'?getFinalOutReferenceFromTimingContext_(ctx,date,v):String(ctx.schedule[x.key]||'').trim();
      if(!ref)return;
      const recordTime=formatTime_(x.value),mins=timeToMinutes_(recordTime),refMins=timeToMinutes_(ref);
      if(!Number.isFinite(mins)||!Number.isFinite(refMins)||!x.cmp(mins,refMins))return;
      const id=timeReviewId_(user,date,x.type,x.session);if(existingIds.has(id))return;
      existingIds.add(id);const now=new Date();
      let reviewStatus='BELUM DIAMBIL MAKLUM',reviewedBy='',reviewerName='',reviewedAt='',comment='';
      if(x.type==='LEWAT'){
        const approvedPresence=absenceRows.find(r=>r.email===email&&r.mode==='KEBERADAAN'&&r.status==='DILULUSKAN'&&r.startDate<=date&&r.endDate>=date&&r.endTime&&mins>=timeToMinutes_(r.endTime))||null;
        if(approvedPresence){
          reviewedBy=normalizeEmail_(approvedPresence.reviewedBy||'');reviewerName=getReviewerNameFromEmail_(reviewedBy);reviewedAt=approvedPresence.reviewedAt||now;reviewStatus='DIAMBIL MAKLUM';
          comment=`Diambil maklum melalui Keberadaan ${approvedPresence.id}: ${approvedPresence.type}${approvedPresence.note?` — ${approvedPresence.note}`:''}`;
        }
      }
      toAppend.push([id,now,date,user.email,user.name,user.jobTitle||'',user.category,x.type,x.session,recordTime,ref,reviewStatus,reviewedBy,reviewerName,reviewedAt,comment]);
    });
  });
  if(toAppend.length){
    const sh=getTimeReviewSheet_();sh.getRange(sh.getLastRow()+1,1,toAppend.length,EK.TIME_REVIEW_HEADERS.length).setValues(toAppend);invalidateTimeReviewRows_();
    audit_('MIGRASI_SEMAKAN_WAKTU',`${from}..${to}`,`${toAppend.length} rekod semakan diwujudkan menggunakan sejarah jadual bertimestamp`,'SISTEM');
  }
  return toAppend.length;
}

function cleanupSupersededSession1EarlyReviews_(from,to) {
  const session2Keys=new Set();
  getAttendanceValuesInDateRange_(from,to).forEach(raw=>{
    const v=padAttendanceValues_(raw);
    if(!v[22])return;
    const date=dateCellToKey_(v[0]),email=normalizeEmail_(v[1]);
    if(date&&email)session2Keys.add(`${date}|${email}`);
  });
  if(!session2Keys.size)return 0;
  const stale=readTimeReviewRows_().filter(r=>r.type==='BALIK AWAL'&&Number(r.session||1)===1&&r.date>=from&&r.date<=to&&session2Keys.has(`${r.date}|${r.email}`)).sort((a,b)=>b.row-a.row);
  if(!stale.length)return 0;
  const sh=getTimeReviewSheet_();
  stale.forEach(r=>sh.deleteRow(r.row));
  invalidateTimeReviewRows_();
  audit_('AUTO_BATAL_BALIK_AWAL_SESI_1',`${from}..${to}`,`${stale.length} semakan Sesi 1 dibuang kerana pengguna kembali untuk Sesi 2`,'SISTEM');
  return stale.length;
}

/**
 * Recalculate persisted Status / StatusWaktu from the actual punch sequence.
 *
 * This is deliberately separate from inferAttendanceFlags_(): reads already use
 * the effective status, while this routine repairs older physical sheet values
 * written by pre-fix deployments. Only columns O (Status) and AI (StatusWaktu)
 * are touched, so GPS/IP/timestamps are never rewritten.
 */
function cleanupUnconfirmedTimeReviews_(from,to) {
  const pending=readTimeReviewRows_().filter(r=>r.date>=from&&r.date<=to&&r.reviewStatus==='BELUM DIAMBIL MAKLUM');
  if(!pending.length)return 0;
  const usersByEmail={};getAllUsers_().forEach(u=>usersByEmail[u.email]=u);
  const settings=getSettings_(), stale=[];
  pending.forEach(r=>{
    const rec=findAttendanceRecord_(r.date,r.email), user=usersByEmail[r.email];
    if(!rec||!user)return;
    const flags=inferAttendanceFlags_(rec.values,user,settings,r.date);
    if(!flags.includes(String(r.type||'').toUpperCase()))stale.push(r);
  });
  if(!stale.length)return 0;
  const sh=getTimeReviewSheet_();stale.sort((a,b)=>b.row-a.row).forEach(r=>sh.deleteRow(r.row));invalidateTimeReviewRows_();
  audit_('AUTO_BATAL_SEMAKAN_WAKTU_TIDAK_SAH',`${from}..${to}`,`${stale.length} semakan belum diputuskan dibuang kerana tidak sepadan dengan status sejarah`,'SISTEM');
  return stale.length;
}

function repairAttendanceTimingStatuses_(options) {  options=options||{};
  const settings=getSettings_();
  let from=clampToSystemStart_(options.from||options.fromDate||getSystemStartDate_(settings),settings);
  let to=validateDateKey_(options.to||options.toDate||todayKey_());
  if(to<from)return {rowsChecked:0,rowsUpdated:0,reviewsRemoved:0,fromDate:from,toDate:to};

  const usersByEmail={};
  getAllUsers_().forEach(u=>usersByEmail[u.email]=u);
  const changes=[];
  let checked=0;

  dateKeysBetween_(from,to).forEach(date=>{
    getAttendanceByDate_(date).forEach(rec=>{
      const v=padAttendanceValues_(rec.values);
      const email=normalizeEmail_(v[1]);
      const user=usersByEmail[email];
      if(!user||!v[4]||String(v[14]||'').toUpperCase()==='TIDAK HADIR')return;
      checked++;
      const flags=inferAttendanceFlags_(v,user,settings,date);
      const nextFlags=joinAttendanceFlags_(flags);
      const nextStatus=attendanceStatusFromFlags_(flags);
      const oldFlags=joinAttendanceFlags_(splitAttendanceFlags_(v[34]));
      const oldStatus=String(v[14]||'').trim().toUpperCase();
      if(oldFlags!==nextFlags||oldStatus!==nextStatus.toUpperCase()){
        changes.push({row:rec.row,status:nextStatus,flags:nextFlags});
      }
    });
  });

  if(changes.length){
    const sh=getSheetOrThrow_(EK.SHEETS.ATTENDANCE);
    const byRow=new Map(changes.map(x=>[x.row,x]));
    groupContiguousRows_(changes.map(x=>x.row)).forEach(g=>{
      const statuses=[],flags=[];
      for(let row=g.start;row<=g.end;row++){
        const x=byRow.get(row);
        statuses.push([x.status]);
        flags.push([x.flags]);
      }
      sh.getRange(g.start,15,g.end-g.start+1,1).setValues(statuses);
      sh.getRange(g.start,35,g.end-g.start+1,1).setValues(flags);
    });
    SpreadsheetApp.flush();
  }

  const reviewsRemoved=cleanupSupersededSession1EarlyReviews_(from,to);
  const result={rowsChecked:checked,rowsUpdated:changes.length,reviewsRemoved,fromDate:from,toDate:to};
  if(options.audit!==false&&changes.length){
    audit_('BAIKI_STATUS_WAKTU',`${from}..${to}`,`Semak=${checked}; kemas kini=${changes.length}; semakan S1 dibuang=${reviewsRemoved}`,options.actor||'SISTEM');
  }
  return result;
}

function repairAttendanceTimingStatusesFromMenu() {
  const admin=requireGoogleAdmin_();
  const settings=getSettings_();
  const result=repairAttendanceTimingStatuses_({
    from:getSystemStartDate_(settings),
    to:todayKey_(),
    actor:admin.email,
    audit:true
  });
  try{
    SpreadsheetApp.getUi().alert(
      'Baiki status waktu',
      `${result.rowsUpdated} rekod dikemas kini daripada ${result.rowsChecked} rekod yang disemak. ${result.reviewsRemoved} semakan Balik Awal Sesi 1 lama dibuang.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }catch(e){}
  return result;
}

function getTimeReviewData(token,fromDate,toDate) {
  requireSessionAdmin_(token);
  ensureMalaysiaSpreadsheetTimeZone_();
  const today=todayKey_(),settings=getSettings_(),systemStartDate=getSystemStartDate_(settings);
  let from=validateDateKey_(fromDate||today);
  const to=validateDateKey_(toDate||today);
  if(to<from)throw new Error('Tarikh akhir tidak boleh sebelum tarikh mula.');
  if(to<systemStartDate)throw new Error(`Tiada data sistem sebelum ${systemStartDate}. Ubah SYSTEM_START_DATE di sheet TETAPAN jika perlu.`);
  from=clampToSystemStart_(from,settings);
  cleanupSupersededSession1EarlyReviews_(from,to);
  cleanupUnconfirmedTimeReviews_(from,to);
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
  return {ok:true,status:decision,reviewerJobTitle:admin.jobTitle||'Pentadbir Sistem',reviewedAt:formatDateTime_(now)};
}

function timeReviewStatementForCard_(reviews, flags) {
  flags=Array.isArray(flags)?flags:splitAttendanceFlags_(flags); if(!flags.length)return '';
  const relevant=(reviews||[]).filter(r=>flags.includes(String(r.type||'').toUpperCase()));
  const statement=r=>[r.reviewStatus||'',getReviewerJobTitleFromEmail_(r.reviewedBy)||'Pentadbir Sistem',r.comment||'',r.reviewedAt?formatDateTime_(r.reviewedAt):''].filter(Boolean).join(' · ');
  if(relevant.some(r=>r.reviewStatus==='DITOLAK')) return statement(relevant.find(r=>r.reviewStatus==='DITOLAK'));
  if(relevant.length&&relevant.every(r=>r.reviewStatus==='DIAMBIL MAKLUM')) return relevant.map(statement).join(' | ');
  return 'BELUM DIAMBIL MAKLUM';
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
    ['Tarikh','Nama','Jawatan','Jenis','Sesi','Rekod','Rujukan','Status Semakan','Jawatan Pelulus','Ulasan'],
    rows.map(r=>[r.date,r.name,r.jobTitle,r.type,r.session,r.recordTime,r.referenceTime,r.reviewStatus,r.reviewerJobTitle||'',r.comment||'']),
    `Semakan_Waktu_${data.fromDate}_${data.toDate}.pdf`);
}
