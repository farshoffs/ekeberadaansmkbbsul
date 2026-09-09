// ---------- Punch on Home ----------
  async function startPunch(type){
    const test=String(state.boot?.settings?.systemMode||'REAL')==='TEST';
    setPunchBusy(true); gps('busy',test?'MOD TEST — merakam waktu dan IP…':'Mendapatkan lokasi GPS dan IP awam…');
    try{
      const ipPromise=getClientNetworkInfo(false); let loc=null;
      if(!test){const pos=await currentPosition();loc={lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy};gps('ok',`GPS ±${Math.round(loc.accuracy)}m · menyemak radius dan IP…`);}
      const clientInfo=await ipPromise, res=await runServer('punch',state.token,type,loc,clientInfo);
      if(res&&res.attendance){state.boot.attendance=res.attendance;renderBoot();}else await refreshBoot();
      const ipText=res.ip?` · IP ${res.ip}`:' · IP tidak dikesan';
      gps('ok',test?`Rekod MOD TEST diterima${ipText}.`:`Rekod waktu diterima · jarak ${res.distanceM}m${ipText}.`);
      toast(res.ipWarning||res.message,res.ipWarning?6000:4500); state.myCardLoaded=false; state.myCardData=null;
      if(res.timeException) state.timeReview=null;
    }catch(e){gps('',e.message);handleServerError(e,false);}finally{setPunchBusy(false);}
  }

  function currentPosition(){return new Promise((resolve,reject)=>{if(!navigator.geolocation)return reject(new Error('Pelayar ini tidak menyokong geolocation.'));navigator.geolocation.getCurrentPosition(resolve,err=>{const msg={1:'Akses lokasi ditolak. Benarkan Location untuk laman ini.',2:'Lokasi tidak dapat dikesan.',3:'Masa mendapatkan lokasi tamat.'}[err.code]||err.message;reject(new Error(msg));},{enableHighAccuracy:true,timeout:18000,maximumAge:0});});}
  function gps(cls,msg){const d=document.getElementById('gpsDot');if(d)d.className='gps-dot '+cls;text('locationText',msg);}
  function setPunchBusy(b){const step=state.boot?.attendance?.nextRecord||{type:'IN',session:1,complete:false},i=document.getElementById('btnIn'),o=document.getElementById('btnOut');if(i)i.disabled=b||step.complete||step.type!=='IN';if(o)o.disabled=b||step.complete||step.type!=='OUT';}


  // ---------- Own Kad Perakam Waktu ----------
  async function loadMyCard(force=false){
    const monthInput=document.getElementById('myCardMonth');if(!monthInput.value)monthInput.value=(state.boot?.today||'').slice(0,7);const monthKey=monthInput.value;
    if(!force&&state.myCardLoaded&&state.myCardData?.month===monthKey){renderMyPunchCard();return;}
    const loading=document.getElementById('pcLoading');loading.classList.remove('hidden');
    try{state.myCardData=await runServer('getMyPunchCardMonth',state.token,monthKey);state.myCardLoaded=true;renderMyPunchCard();}
    catch(e){document.getElementById('myCardRows').innerHTML=`<tr><td colspan="7" class="pc-error">${esc(e.message)}</td></tr>`;handleServerError(e,false);}
    finally{loading.classList.add('hidden');}
  }

  function renderMyPunchCard(){const d=state.myCardData;if(!d)return;text('pcCardNumber',d.cardNumber||'1');text('pcName',d.user?.name||'—');text('pcDepartment',d.department||d.schoolName||'—');text('pcMonthLabel',formatMonthMalay(d.month));document.getElementById('myCardRows').innerHTML=cardRowsHtml(d,state.myCardHalf);document.getElementById('cardHalf1Btn').classList.toggle('active',state.myCardHalf===1);document.getElementById('cardHalf2Btn').classList.toggle('active',state.myCardHalf===2);}
  function setMyCardHalf(half){state.myCardHalf=half===2?2:1;renderMyPunchCard();}
  function printMyPunchCard(){window.print();}

  function cardRowsHtml(d,half){
    const start=half===1?1:16,end=half===1?Math.min(15,d.daysInMonth):d.daysInMonth,byDay=new Map((d.records||[]).map(r=>[Number(r.day),r]));let html='';
    if(start>end)return '<tr><td colspan="7" class="pc-empty">Tiada tarikh untuk bahagian ini.</td></tr>';
    for(let day=start;day<=end;day++){
      const r=byDay.get(day)||{},status=String(r.status||'').trim().toUpperCase();
      const cls=status==='TIDAK HADIR'?'pc-row-absent':status==='WEEKEND'?'pc-row-weekend':(status.includes('LEWAT')||status.includes('BALIK AWAL'))?'pc-row-lewat':status==='HADIR'?'pc-row-hadir':'';
      if(status==='WEEKEND'){
        const label=String(r.reason||'').trim().toUpperCase()||'CUTI';
        html+=`<tr class="${cls}"><td class="pc-day">${day}</td><td colspan="6" class="pc-weekend-full"><span>${esc(label)}</span></td></tr>`;continue;
      }
      if(status==='TIDAK HADIR'){
        const reason=String(r.reason||'').trim(),detail=reason&&reason.toUpperCase()!=='TIDAK HADIR'?reason:'TIADA PENJELASAN';
        html+=`<tr class="${cls}"><td class="pc-day">${day}</td><td colspan="6" class="pc-absence-full"><span class="pc-absence-label">TIDAK HADIR</span><span class="pc-absence-reason">${esc(detail)}</span></td></tr>`;continue;
      }
      html+=`<tr class="${cls}"><td class="pc-day">${day}</td><td>${esc(shortTime(r.inTime))}</td><td>${esc(shortTime(r.outTime))}</td><td>${esc(shortTime(r.inTime2))}</td><td>${esc(shortTime(r.outTime2))}</td><td class="pc-statement">${esc(cardStatement(r))}</td><td class="pc-sign"></td></tr>`;
    }
    return html;
  }
  function shortTime(v){return v?String(v).slice(0,5):'';}
  function cardStatement(r){
    if(!r)return '';
    const status=String(r.status||''), parts=[];
    if(status.includes('LEWAT'))parts.push('LEWAT');
    if(status.includes('BALIK AWAL'))parts.push('BALIK AWAL');
    if(parts.length){
      parts.push(r.reviewState||'BELUM DIAMBIL MAKLUM');
      // Untuk pengguna Keberadaan yang punch lewat, kekalkan catatan
      // Keberadaan pada Kad Perakam sebagai konteks yang telah dimaklumkan.
      if(r.reason&&String(r.reason).toUpperCase().includes('KEBERADAAN'))parts.push(r.reason);
    } else if(r.reason)parts.push(r.reason);
    return parts.join(' · ');
  }
  function formatMonthMalay(monthKey){if(!/^\d{4}-\d{2}$/.test(monthKey||''))return monthKey||'—';const[y,m]=monthKey.split('-').map(Number);const months=['JANUARI','FEBRUARI','MAC','APRIL','MEI','JUN','JULAI','OGOS','SEPTEMBER','OKTOBER','NOVEMBER','DISEMBER'];return `${months[m-1]} ${y}`;}
