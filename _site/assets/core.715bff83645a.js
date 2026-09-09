const state = {
    token:'', deviceToken:'', boot:null, admin:null, currentScreen:'home',
    myCardLoaded:false, myCardHalf:1, myCardData:null,
    adminCardEmail:'', adminCardData:null, adminCardHalf:1,
    selectedAccount:null, changeTicket:'', setupPurpose:'',
    selectedUserEmails:new Set(), filteredUsers:[], filteredReport:[],
    absence:null, absencePublic:null, absenceManagement:null, timeReview:null,
    lastSessionCheck:0, sessionCheckBusy:false,
    locationMap:null, locationMarker:null, locationCircle:null,
    photoCache:new Map(), networkInfo:null, networkPromise:null, leafletPromise:null
  };

  document.addEventListener('DOMContentLoaded', initApp);

  function runServer(fn, ...args){
    return new Promise((resolve,reject)=>{
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(err=>reject(new Error(err && err.message ? err.message : String(err))))[fn](...args);
    });
  }


  // ---------- Client info / public IP ----------
  function baseClientInfo(ip=''){
    return {
      ip:String(ip||'').trim(),
      userAgent:navigator.userAgent||'',
      platform:(navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||'',
      timezone:'Asia/Kuala_Lumpur', // Malaysia Time (MYT), GMT+8 — standard sistem
      language:navigator.language||'',
      _at:Date.now()
    };
  }

  // Login must not wait for a third-party IP service. Return device metadata
  // immediately and warm the IP cache in the background. Punch still awaits
  // getClientNetworkInfo(), so IP WARN/BLOCK policy remains intact.
  function getClientInfoFast(){
    const cached=state.networkInfo;
    if(cached&&Date.now()-(cached._at||0)<15*60*1000)return cached;
    getClientNetworkInfo(false).catch(()=>{});
    return baseClientInfo('');
  }

  async function getClientNetworkInfo(force=false){
    const cached=state.networkInfo;
    if(!force&&cached&&Date.now()-(cached._at||0)<15*60*1000)return cached;
    if(!force&&state.networkPromise)return state.networkPromise;

    const task=(async()=>{
      let ip='';
      try{
        const ctrl=new AbortController();
        const timer=setTimeout(()=>ctrl.abort(),1800);
        try{
          const r=await fetch('https://api64.ipify.org?format=json',{cache:'no-store',signal:ctrl.signal});
          if(r.ok){const j=await r.json();ip=String(j?.ip||'').trim();}
        }finally{clearTimeout(timer);}
      }catch(e){
        try{ip=await getPublicIpJsonp();}catch(_e){ip='';}
      }
      const info=baseClientInfo(ip);
      state.networkInfo=info;
      return info;
    })();

    if(!force)state.networkPromise=task;
    try{return await task;}
    finally{if(state.networkPromise===task)state.networkPromise=null;}
  }

  function getPublicIpJsonp(){
    return new Promise((resolve,reject)=>{
      const cb='ekIpCb_'+Math.random().toString(36).slice(2);
      const script=document.createElement('script');
      const timer=setTimeout(()=>cleanup(new Error('IP timeout')),1500);
      function cleanup(err,value){clearTimeout(timer);try{delete window[cb];}catch(e){}script.remove();err?reject(err):resolve(value||'');}
      window[cb]=data=>cleanup(null,String(data&&data.ip||'').trim());
      script.onerror=()=>cleanup(new Error('IP lookup gagal'));
      script.src='https://api.ipify.org?format=jsonp&callback='+encodeURIComponent(cb);
      document.head.appendChild(script);
    });
  }


  // ---------- Login (v12: DELIMa email + 6-digit PIN + 30-day trusted device) ----------
  async function initApp(){
    try{
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')renewSessionIfNeeded(false).catch(()=>{});});
      window.addEventListener('pageshow',()=>renewSessionIfNeeded(false).catch(()=>{}));
      window.addEventListener('focus',()=>renewSessionIfNeeded(false).catch(()=>{}));
      if(await tryResumeStoredSession()) return;
      await showLogin();
    }catch(e){
      try{await showLogin();}catch(_e){}
      showLoginError(e.message);
    }
  }

  function applySessionResult(res){
    if(!res?.token||!res?.boot)throw new Error('Sesi tidak lengkap. Sila log masuk semula.');
    state.token=res.token; state.deviceToken=res.deviceToken||loadStoredDevice()||''; state.boot=res.boot;
    saveSession(state.token,state.deviceToken); state.lastSessionCheck=Date.now();
    rememberLastAccount(res.boot?.user);
  }

  async function tryResumeStoredSession(){
    const saved=loadStoredSession(),device=loadStoredDevice();
    if(saved){
      try{
        const res=await runServer('resumeSession',saved,device,getClientInfoFast());
        applySessionResult(res); enterApp(); return true;
      }catch(e){
        if(isAuthSessionError(e)){clearStoredSessionToken();state.token='';}
      }
    }
    // Secondary recovery path: if the short-lived iframe/session storage was
    // recycled but the separate trusted-device credential survived, the server
    // issues a fresh signed session without asking for the PIN again.
    if(device){
      try{
        const res=await runServer('resumeTrustedDevice',device,getClientInfoFast());
        applySessionResult(res); enterApp(); return true;
      }catch(e){
        if(isAuthSessionError(e)){clearTrustedDevice();state.deviceToken='';}
      }
    }
    return false;
  }

  async function renewSessionIfNeeded(force=false){
    if(!state.token||state.sessionCheckBusy)return false;
    const age=Date.now()-(state.lastSessionCheck||0);
    if(!force&&age<15*60*1000)return false;
    state.sessionCheckBusy=true;
    try{
      const res=await runServer('resumeSession',state.token,loadStoredDevice(),getClientInfoFast());
      applySessionResult(res);
      return true;
    }catch(e){
      // Network/server failures must not destroy a valid local credential. Only
      // explicit authentication/session failures clear the signed session.
      if(isAuthSessionError(e)){clearStoredSessionToken();state.token='';}
      return false;
    }finally{state.sessionCheckBusy=false;}
  }

  function safeLocalGet(key){try{return localStorage.getItem(key)||'';}catch(e){return '';}}
  function safeLocalSet(key,value){try{localStorage.setItem(key,String(value??''));return true;}catch(e){return false;}}
  function safeLocalRemove(key){try{localStorage.removeItem(key);}catch(e){}}

  function isAuthSessionError(err){
    const msg=String(err?.message||err||'');
    return /Sesi tidak sah|Sesi rosak|Sesi telah tamat|Sesi peranti|Trusted device|log masuk semula|tidak lagi aktif|dibatalkan kerana|PIN akaun perlu/i.test(msg);
  }

  function readLastAccount(){
    try{
      const obj=JSON.parse(safeLocalGet('ek_last_account')||'null');
      if(obj&&obj.email) return obj;
    }catch(e){}
    const email=safeLocalGet('ek_last_email');
    return email?{email,name:email,category:''}:null;
  }

  function rememberLastAccount(user){
    if(!user||!user.email)return;
    const data={
      email:String(user.email||'').toLowerCase(),
      name:String(user.name||user.email||''),
      category:String(user.category||''),
      at:Date.now()
    };
    safeLocalSet('ek_last_account',JSON.stringify(data));
    safeLocalSet('ek_last_email',data.email);
  }

  function accountCardHtml(user,subtext){
    return `<div class="account-avatar delima-avatar">${esc((user?.name||'D').charAt(0).toUpperCase())}</div>`+
      `<div><b>${esc(user?.name||'Pengguna')}</b><small>${esc(user?.email||'')}</small><span>${esc(user?.category||'')}${user?.category?' · ':''}${esc(subtext||'Akaun DELIMa berdaftar')}</span></div>`;
  }

  async function showLogin(){
    document.getElementById('appShell').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    hideLoginError(); resetLoginFlow(true);
    getClientNetworkInfo(false).catch(()=>{});
    const cachedSchool=safeLocalGet('ek_school_name');
    if(cachedSchool)text('loginSchoolName',cachedSchool);
    runServer('getLoginPageData').then(d=>{
      const school=d?.schoolName||'e-Keberadaan';
      text('loginSchoolName',school);
      safeLocalSet('ek_school_name',school);
    }).catch(()=>{});
    const last=readLastAccount();
    if(last){
      document.getElementById('returnAccountCard').innerHTML=accountCardHtml(last,'Peranti pernah digunakan');
      showLoginStep('return');
    }else{
      showLoginStep('email');
      setTimeout(()=>document.getElementById('delimaEmail')?.focus(),80);
    }
  }

  function showLoginStep(step){
    const map={return:'loginStepReturn',email:'loginStepEmail',pin:'loginStepPin',setpin:'loginStepSetPin'};
    Object.values(map).forEach(id=>document.getElementById(id)?.classList.add('hidden'));
    document.getElementById(map[step]||map.email)?.classList.remove('hidden');
  }

  function resetLoginFlow(keepEmail){
    state.selectedAccount=null; state.changeTicket=''; state.setupPurpose='';
    ['loginPin','newPin','confirmPin'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
    if(!keepEmail){const e=document.getElementById('delimaEmail');if(e)e.value='';}
  }

  function sanitizePinInput(el){
    if(!el)return;
    el.value=String(el.value||'').replace(/\D/g,'').slice(0,6);
  }

  async function continueLastAccount(){
    const last=readLastAccount();
    if(!last?.email){useDifferentAccount();return;}
    const btn=document.getElementById('continueLastAccountBtn');
    hideLoginError(); setButtonBusy(btn,true,'Menyemak akaun…');
    try{
      await resolveDelimaAccount(last.email);
    }catch(e){
      showLoginError(e.message);
      if(String(e.message||'').toLowerCase().includes('tidak aktif')||String(e.message||'').toLowerCase().includes('tidak didaftarkan')){
        safeLocalRemove('ek_last_account');
      }
    }finally{setButtonBusy(btn,false,'');}
  }

  async function checkDelimaAccount(){
    const email=(document.getElementById('delimaEmail')?.value||'').trim().toLowerCase();
    hideLoginError();
    const btn=document.getElementById('checkDelimaBtn'); setButtonBusy(btn,true,'Menyemak…');
    try{await resolveDelimaAccount(email);}catch(e){showLoginError(e.message);}finally{setButtonBusy(btn,false,'');}
  }

  async function resolveDelimaAccount(email){
    const clientInfo=getClientInfoFast();
    const res=await runServer('checkDelimaAccount',email,clientInfo);
    state.selectedAccount=res.user; state.setupPurpose=res.setupPurpose||'';
    rememberLastAccount(res.user);
    const html=accountCardHtml(res.user,'Akaun DELIMa berdaftar');

    if(res.directPinSetup){
      state.changeTicket=res.changeTicket||'';
      document.getElementById('setupAccountSummary').innerHTML=html;
      text('pinSetupBadge',res.setupPurpose==='ADMIN_RESET'?'RESET PIN':'KALI PERTAMA');
      text('pinSetupTitle',res.setupPurpose==='ADMIN_RESET'?'Cipta PIN baharu':'Cipta PIN anda');
      text('pinSetupCopy',res.setupPurpose==='ADMIN_RESET'
        ? 'Pentadbir telah mereset akses anda. Cipta PIN 6 digit baharu untuk meneruskan.'
        : 'Cipta PIN 6 digit. Selepas berjaya, peranti ini akan kekal log masuk sehingga 30 hari.');
      showLoginStep('setpin');
      setTimeout(()=>document.getElementById('newPin')?.focus(),80);
      return;
    }

    document.getElementById('delimaAccountCard').innerHTML=html;
    showLoginStep('pin');
    setTimeout(()=>document.getElementById('loginPin')?.focus(),80);
  }

  function useDifferentAccount(){
    hideLoginError(); resetLoginFlow(false); showLoginStep('email');
    setTimeout(()=>document.getElementById('delimaEmail')?.focus(),50);
  }

  async function submitPinLogin(){
    if(!state.selectedAccount) return showLoginError('Pilih akaun DELIMa dahulu.');
    const pin=String(document.getElementById('loginPin')?.value||'').replace(/\D/g,'');
    if(pin.length!==6) return showLoginError('Masukkan PIN 6 digit.');
    hideLoginError();
    const btn=document.getElementById('pinLoginBtn'); setButtonBusy(btn,true,'Menyemak PIN…');
    try{
      const clientInfo=getClientInfoFast();
      const res=await runServer('loginWithPin',state.selectedAccount.email,pin,clientInfo,loadStoredDevice());
      applySessionResult(res); rememberLastAccount(res.boot?.user||state.selectedAccount);
      enterApp();
    }catch(e){
      showLoginError(e.message);
      const p=document.getElementById('loginPin'); if(p){p.value='';p.focus();}
    }finally{setButtonBusy(btn,false,'');}
  }


  async function submitFirstPin(){
    if(!state.changeTicket) return showLoginError('Sesi menetapkan PIN telah tamat. Mulakan semula dari halaman login.');
    const p1=String(document.getElementById('newPin')?.value||'').replace(/\D/g,''),
          p2=String(document.getElementById('confirmPin')?.value||'').replace(/\D/g,'');
    if(p1.length!==6||p2.length!==6) return showLoginError('PIN mesti tepat 6 digit.');
    if(p1!==p2) return showLoginError('Pengesahan PIN tidak sepadan.');
    hideLoginError();
    const btn=document.getElementById('setPinBtn'); setButtonBusy(btn,true,'Menyimpan PIN…');
    try{
      const clientInfo=getClientInfoFast();
      const res=await runServer('setFirstPin',state.changeTicket,p1,p2,clientInfo,loadStoredDevice());
      state.changeTicket=''; state.setupPurpose=''; applySessionResult(res);
      rememberLastAccount(res.boot?.user||state.selectedAccount);
      toast('PIN berjaya ditetapkan. Peranti ini diingati selama 30 hari.',4200);
      enterApp();
    }catch(e){showLoginError(e.message);}
    finally{setButtonBusy(btn,false,'');}
  }

  function togglePassword(inputId,button){const input=document.getElementById(inputId);if(!input)return;const show=input.type==='password';input.type=show?'text':'password';if(button)button.textContent=show?'🙈':'👁';input.focus();}
  function setButtonBusy(btn,busy,label){
    if(!btn)return;
    if(busy){
      if(!btn.dataset.originalHtml)btn.dataset.originalHtml=btn.innerHTML;
      btn.disabled=true;
      btn.setAttribute('aria-busy','true');
      const busyLabel=esc(label||'Memproses…');
      btn.innerHTML=`<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span><span>${busyLabel}</span>`;
    }else{
      btn.disabled=false;
      btn.removeAttribute('aria-busy');
      if(btn.dataset.originalHtml){btn.innerHTML=btn.dataset.originalHtml;delete btn.dataset.originalHtml;}
    }
  }

  async function logout(){
    try{if(state.token)await runServer('logoutApp',state.token);}catch(e){}
    clearStoredSession();
    Object.assign(state,{token:'',deviceToken:'',boot:null,admin:null,myCardLoaded:false,myCardData:null,adminCardData:null,absence:null,absencePublic:null,absenceManagement:null});
    state.selectedUserEmails.clear(); state.photoCache.clear(); closeMobileMenu(); await showLogin(); toast('Anda telah keluar dari peranti ini.');
  }

  function writeCookie(name,value,maxAge,partitioned=false){
    try{
      const extra=partitioned?'; Partitioned':'';
      document.cookie=`${name}=${encodeURIComponent(value||'')}; Max-Age=${Math.max(0,Number(maxAge)||0)}; Path=/; Secure; SameSite=None${extra}`;
    }catch(e){}
  }
  function deleteCookie(name){writeCookie(name,'',0,false);writeCookie(name,'',0,true);}
  function saveSession(token,deviceToken){
    if(token){
      safeLocalSet('ek_session',token);
      try{sessionStorage.setItem('ek_session',token);}catch(e){}
      writeCookie('ek_session',token,30*24*60*60,false);
      writeCookie('ek_session_p',token,30*24*60*60,true);
    }
    if(deviceToken)saveTrustedDevice(deviceToken);
  }
  function saveTrustedDevice(deviceToken){
    if(!deviceToken)return;
    state.deviceToken=deviceToken;
    safeLocalSet('ek_device',deviceToken);
    writeCookie('ek_device',deviceToken,30*24*60*60,false);
    writeCookie('ek_device_p',deviceToken,30*24*60*60,true);
  }
  function loadStoredSession(){
    try{return safeLocalGet('ek_session')||sessionStorage.getItem('ek_session')||readCookie('ek_session')||readCookie('ek_session_p')||'';}catch(e){return safeLocalGet('ek_session')||readCookie('ek_session')||readCookie('ek_session_p')||'';}
  }
  function loadStoredDevice(){
    return safeLocalGet('ek_device')||readCookie('ek_device')||readCookie('ek_device_p')||'';
  }
  function currentTrustedDeviceId(){return String(loadStoredDevice()||'').split('.')[0]||'';}
  function clearStoredSessionToken(){
    try{sessionStorage.removeItem('ek_session');}catch(e){} safeLocalRemove('ek_session');
    deleteCookie('ek_session');deleteCookie('ek_session_p');
  }
  function clearTrustedDevice(){
    safeLocalRemove('ek_device');
    deleteCookie('ek_device');deleteCookie('ek_device_p');
  }
  function clearStoredSession(){clearStoredSessionToken();clearTrustedDevice();}
  function readCookie(name){const prefix=name+'=';const item=document.cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(prefix));return item?decodeURIComponent(item.slice(prefix.length)):'';}


  // ---------- App shell / profile ----------
  function enterApp(){
    rememberLastAccount(state.boot?.user);
    document.getElementById('loginPage').classList.add('hidden'); document.getElementById('appShell').classList.remove('hidden');
    renderBoot(); navigate('home');
    // Keep first paint responsive; Drive photo loading and IP refresh happen
    // after the dashboard is already usable.
    setTimeout(()=>loadOwnProfilePhoto(),180);
    setTimeout(()=>getClientNetworkInfo(false).catch(()=>{}),0);
  }

  function renderBoot(){
    const b=state.boot, a=b.attendance||{}, test=String(b.settings.systemMode||'REAL')==='TEST', step=a.nextRecord||{type:'IN',session:1,complete:false};
    if(b?.settings?.schoolName)safeLocalSet('ek_school_name',b.settings.schoolName);
    text('sideSchoolName',b.settings.schoolName||'e-Keberadaan'); text('sideUserName',b.user.name);
    text('sideUserRole',[b.user.jobTitle,b.user.category,b.user.isAdmin?'Pentadbir Sistem':''].filter(Boolean).join(' · '));
    const initial=(b.user.name||'U').charAt(0).toUpperCase(); text('userInitial',initial); text('welcomeInitial',initial);
    text('topRole',b.user.category); text('topDate',b.today); text('welcomeName',b.user.name); text('welcomeSub',[b.user.email,b.user.jobTitle,b.user.category].filter(Boolean).join(' · '));
    const hasSecondSession=!!(b.schedule.s2In&&b.schedule.s2Out);
    const visibleSession=step.complete?(hasSecondSession?2:1):(Number(step.session)||1);
    const activeInRef=visibleSession===2?b.schedule.s2In:b.schedule.s1In, activeOutRef=visibleSession===2?b.schedule.s2Out:b.schedule.s1Out;
    const activeInTime=visibleSession===2?a.inTime2:a.inTime, activeOutTime=visibleSession===2?a.outTime2:a.outTime;
    text('activeInRef',activeInRef||'—'); text('activeOutRef',activeOutRef||'—'); text('radiusM',test?'DIABAIKAN':`${b.settings.radiusM} m`);
    text('activeInTime',activeInTime||'—'); text('activeOutTime',activeOutTime||'—');
    setBadge('statusBadge',a.status||'BELUM REKOD'); setBadge('homeStatusBadge',a.status||'BELUM REKOD');
    const btnIn=document.getElementById('btnIn'),btnOut=document.getElementById('btnOut');
    if(btnIn){btnIn.disabled=step.complete||step.type!=='IN';btnIn.textContent=step.complete?'Rekod Waktu Lengkap':'Rakam Waktu Masuk';}
    if(btnOut){btnOut.disabled=step.complete||step.type!=='OUT';btnOut.textContent=step.complete?'Rekod Waktu Lengkap':'Rakam Waktu Balik';}
    document.getElementById('adminMenu').classList.toggle('hidden',!b.user.isAdmin); document.getElementById('adminQuick').classList.toggle('hidden',!b.user.isAdmin);
    document.getElementById('timeReviewMenu')?.classList.toggle('hidden',!b.user.isAdmin);
    document.getElementById('absenceManageMenu').classList.toggle('hidden',!b.user.canManageAbsence);
    document.getElementById('testModeBanner').classList.toggle('hidden',!test);
    text('punchInstruction',test?'Mod TEST aktif — rekod waktu boleh dibuat tanpa semakan lokasi/status waktu.':'');
    text('punchRuleNote',test?'MOD TEST: masa sebenar direkodkan tetapi status waktu dan radius tidak digunakan.':'Lokasi masih perlu berada dalam radius; Lewat/Balik Awal akan dimaklumkan kepada Pentadbir Sistem.');
    text('locationTitle',test?'Lokasi':'Lokasi semasa');
    if(test) gps('ok','MOD TEST — GPS tidak diperlukan.');
    else if(!b.locationReady) gps('','Koordinat sekolah belum lengkap. Pentadbir Sistem perlu mengisi TETAPAN sebelum rekod waktu boleh digunakan.');
    else gps('','Lokasi akan diperiksa semasa anda merakam waktu.');
    applySystemDateLimits();
  }

  async function refreshBoot(){try{state.boot=await runServer('getBootstrapData',state.token);renderBoot();await loadOwnProfilePhoto(true);}catch(e){handleServerError(e);}}

  async function loadOwnProfilePhoto(force=false){
    const u=state.boot?.user; if(!u)return;
    const ids=['sideProfilePhoto','welcomeProfilePhoto'];
    if(!u.hasProfilePhoto){ids.forEach(id=>document.getElementById(id)?.classList.add('hidden'));return;}
    let data=state.photoCache.get(u.email);
    if(!data||force){
      try{const r=await runServer('getProfilePhoto',state.token,u.email);data=r.dataUrl||'';if(data)state.photoCache.set(u.email,data);}catch(e){data='';}
    }
    ids.forEach(id=>{const img=document.getElementById(id);if(!img)return;if(data){img.src=data;img.classList.remove('hidden');}else img.classList.add('hidden');});
  }

  function navigate(name,btn){
    if(['admin','admincard','timereview'].includes(name)&&!state.boot?.user?.isAdmin)return toast('Akses Pentadbir Sistem diperlukan.');
    if(name==='absencemanage'&&!state.boot?.user?.canManageAbsence)return toast('Akses Pengurusan diperlukan.');
    const screen=document.getElementById('screen-'+name); if(!screen)return;
    document.querySelectorAll('.screen').forEach(x=>x.classList.add('hidden')); screen.classList.remove('hidden');
    const activeMenu=name==='admincard'?'admin':name;
    document.querySelectorAll('.menu-item').forEach(x=>x.classList.toggle('active',x.dataset.screen===activeMenu));
    state.currentScreen=name;
    const titles={home:'Utama',mycard:'Kad Perakam Waktu Saya',absence:'Tidak Hadir / Keberadaan',absencepublic:'Senarai Tidak Hadir / Keberadaan',absencemanage:'Semakan Tidak Hadir / Keberadaan',timereview:'Semakan Lewat / Balik Awal',admin:'Pentadbir Sistem',admincard:'Kad Perakam Waktu Pegawai'};
    text('pageTitle',titles[name]||'e-Keberadaan'); closeMobileMenu();
    if(name==='mycard')loadMyCard();
    if(name==='absence')loadAbsenceData();
    if(name==='absencepublic')loadAbsencePublic();
    if(name==='absencemanage')loadAbsenceManagement();
    if(name==='timereview')loadTimeReview();
    if(name==='admin'){document.getElementById('reportDate').value=document.getElementById('reportDate').value||state.boot.today;initAttendanceReportBuilder();refreshAdmin();}
  }


  // ---------- Utilities ----------
  function downloadPdfResult(r){if(!r?.base64)throw new Error('Fail PDF tidak diterima.');const bytes=Uint8Array.from(atob(r.base64),c=>c.charCodeAt(0)),blob=new Blob([bytes],{type:r.mimeType||'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=r.fileName||'laporan.pdf';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}

  function toggleMobileMenu(){
    const el=document.getElementById('sidebar');
    if(!el)return;
    if(window.innerWidth>=768){el.classList.add('show');return;}
    if(window.bootstrap?.Collapse){bootstrap.Collapse.getOrCreateInstance(el,{toggle:false}).toggle();}
    else{el.classList.toggle('show');}
  }
  function closeMobileMenu(){
    const el=document.getElementById('sidebar');
    if(!el||window.innerWidth>=768)return;
    if(window.bootstrap?.Collapse){bootstrap.Collapse.getOrCreateInstance(el,{toggle:false}).hide();}
    else{el.classList.remove('show');}
  }
  function showModal(html){
    document.getElementById('modalContent').innerHTML=html;
    const el=document.getElementById('modal');
    if(window.bootstrap?.Modal){bootstrap.Modal.getOrCreateInstance(el,{backdrop:true,keyboard:true,focus:true}).show();}
    else{el.classList.add('show');el.style.display='block';}
  }
  function closeModal(){
    const el=document.getElementById('modal');
    if(window.bootstrap?.Modal){bootstrap.Modal.getOrCreateInstance(el).hide();}
    else{el.classList.remove('show');el.style.display='none';}
  }
  function setBadge(id,status){const b=document.getElementById(id);if(!b)return;b.textContent=status;b.className='badge '+badgeClass(status);}
  function badgeClass(s){s=String(s||'');return s==='HADIR'?'hadir':s==='TIDAK HADIR'?'absent':s.includes('BALIK AWAL')?'awal':s.includes('LEWAT')?'lewat':'neutral';}
  function text(id,v){const e=document.getElementById(id);if(e)e.textContent=v;}
  function toast(msg,ms=3000){
    const t=document.getElementById('toast'),body=document.getElementById('toastBody');
    if(!t)return;
    if(body)body.textContent=msg;else t.textContent=msg;
    if(window.bootstrap?.Toast){
      const current=bootstrap.Toast.getInstance(t);if(current)current.dispose();
      new bootstrap.Toast(t,{animation:true,autohide:true,delay:ms}).show();
    }else{
      t.classList.add('show');clearTimeout(t._to);t._to=setTimeout(()=>t.classList.remove('show'),ms);
    }
  }
  function showLoginError(msg){const e=document.getElementById('loginError');e.textContent=msg;e.classList.remove('hidden');}
  function hideLoginError(){document.getElementById('loginError').classList.add('hidden');}
  function handleServerError(e,showToast=true){const msg=e?.message||String(e);if(/Sesi|log masuk semula|tidak lagi aktif|dibatalkan kerana tetapan akaun|perlu ditukar sebelum menggunakan|trusted device/i.test(msg)){clearStoredSessionToken();state.token='';if(/trusted device.*dibatalkan|sesi peranti.*dibatalkan|PIN atau tetapan akaun berubah|tidak lagi aktif/i.test(msg)){clearTrustedDevice();state.deviceToken='';}showLogin().catch(()=>{});}if(showToast)toast(msg,4500);}
  function norm(s){return String(s??'').toLowerCase().replace(/\s+/g,' ').trim();}
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function attr(s){return esc(s).replace(/`/g,'&#096;');}
