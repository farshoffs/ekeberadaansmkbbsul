// ---------- Admin data / report ----------
  async function refreshAdmin(){
    if(!state.boot?.user?.isAdmin)return;
    try{const date=document.getElementById('reportDate').value||state.boot.today;state.admin=await runServer('getAdminData',state.token,date);renderAdmin();}
    catch(e){handleServerError(e);}
  }

  function renderAdmin(){
    const a=state.admin;if(!a)return;document.getElementById('reportDate').value=a.date;
    document.getElementById('summaryCards').innerHTML=[['Jumlah',a.summary.total],['Hadir',a.summary.hadir],['Lewat',a.summary.lewat],['Balik Awal',a.summary.balikAwal||0],['Tidak hadir',a.summary.tidakHadir],['Belum hadir',a.summary.belumHadir]].map(x=>`<div class="summary-card"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');
    fillSettings(a.settings);applyReportFilters();applyUserFilters();
  }

  function applyReportFilters(){
    const data=state.admin?.report||[],q=norm(document.getElementById('reportSearch')?.value),cat=document.getElementById('reportCategoryFilter')?.value||'',st=document.getElementById('reportStatusFilter')?.value||'',src=document.getElementById('reportSourceFilter')?.value||'';
    // Search intentionally excludes inTime/outTime as requested.
    const list=data.filter(r=>{
      const hay=norm([r.date,r.name,r.jobTitle,r.email,r.category,r.status,r.inDistanceM,r.outDistanceM,r.inDistanceM2,r.outDistanceM2,r.source,r.editedBy,r.reason,r.inIp,r.outIp,r.inIp2,r.outIp2,r.ipCheck].join(' '));
      return(!q||hay.includes(q))&&(!cat||r.category===cat)&&(!st||String(r.status||'').includes(st))&&(!src||r.source===src);
    });
    state.filteredReport=list;text('reportFilterCount',`${list.length} / ${data.length} rekod`);renderReportRows(list);
  }

  function renderReportRows(list){
    const body=document.getElementById('reportRows');if(!body)return;
    body.innerHTML=list.length?list.map(r=>`<tr><td><button class="person-link" onclick='openAdminPunchCard(${JSON.stringify(r.email)},${JSON.stringify(r.name)})'>${esc(r.name)}</button><div class="muted">${esc(r.email)}</div></td><td><b>${esc(r.jobTitle||'—')}</b><small class="table-sub">${esc(r.category)}</small></td><td><span class="badge ${badgeClass(r.status)}">${esc(r.status)}</span></td><td>${esc(r.inTime||'—')}</td><td>${esc(r.outTime||'—')}</td><td>${esc(r.inTime2||'—')}</td><td>${esc(r.outTime2||'—')}</td><td><b>${esc(r.source||'—')}</b><small class="table-sub">${esc(r.reason||'')}</small></td><td><b>${esc(r.inIp||'—')}</b><small class="table-sub">K1: ${esc(r.outIp||'—')} · M2: ${esc(r.inIp2||'—')} · K2: ${esc(r.outIp2||'—')}</small><small class="table-sub ip-check-note">${esc(r.ipCheck||'')}</small></td><td><button class="action-link" onclick='openAttendanceModal(${JSON.stringify(r.email)},${JSON.stringify(r.name)},${JSON.stringify(r.inTime||'')},${JSON.stringify(r.outTime||'')},${JSON.stringify(r.inTime2||'')},${JSON.stringify(r.outTime2||'')})'>Ubah</button></td></tr>`).join(''):'<tr><td colspan="10" class="empty-cell">Tiada rekod sepadan.</td></tr>';
  }

  function switchTab(name,btn){
    document.querySelectorAll('.tab-body').forEach(x=>x.classList.add('hidden'));document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.getElementById('tab-'+name).classList.remove('hidden');btn.classList.add('active');
    if(name==='settings')setTimeout(()=>{initLocationPicker().then(()=>state.locationMap?.invalidateSize()).catch(()=>{});},80);
  }

  function openAttendanceModal(email,name,inTime,outTime,inTime2,outTime2){const date=document.getElementById('reportDate').value;showModal(`<h3>Ubah rekod waktu</h3><p><b>${esc(name)}</b><br><span class="muted">${esc(email)} · ${esc(date)}</span></p><form onsubmit="saveAttendance(event)"><input type="hidden" name="email" value="${attr(email)}"><input type="hidden" name="date" value="${attr(date)}"><div class="modal-grid"><label>Sesi 1 · Masuk<input type="time" name="inTime" value="${attr((inTime||'').slice(0,5))}"></label><label>Sesi 1 · Keluar<input type="time" name="outTime" value="${attr((outTime||'').slice(0,5))}"></label><label>Sesi 2 · Masuk<input type="time" name="inTime2" value="${attr((inTime2||'').slice(0,5))}"></label><label>Sesi 2 · Keluar<input type="time" name="outTime2" value="${attr((outTime2||'').slice(0,5))}"></label></div><label>Sebab pembetulan<textarea name="reason" rows="3" required placeholder="Contoh: terlupa rakam waktu / arahan rasmi"></textarea></label><p><button class="btn primary" type="submit">Simpan pembetulan</button></p></form>`);}
  async function saveAttendance(ev){ev.preventDefault();const p=Object.fromEntries(new FormData(ev.target).entries());try{await runServer('adminSaveAttendance',state.token,p);closeModal();toast('Rekod dikemas kini.');await refreshAdmin();}catch(e){handleServerError(e);}}


  // ---------- Admin digital card ----------
  function openAdminPunchCard(email,name){state.adminCardEmail=email;state.adminCardData=null;state.adminCardHalf=1;text('adminCardTitle',name||email);text('adminCardEmail',email);const reportMonth=(document.getElementById('reportDate')?.value||state.boot.today).slice(0,7);document.getElementById('adminCardMonth').value=reportMonth;navigate('admincard');loadAdminCard(true);}
  async function loadAdminCard(force=false){if(!state.adminCardEmail)return;const month=document.getElementById('adminCardMonth').value||state.boot.today.slice(0,7);if(!force&&state.adminCardData?.month===month){renderAdminCard();return;}const loading=document.getElementById('apcLoading');loading.classList.remove('hidden');try{state.adminCardData=await runServer('adminGetPunchCardMonth',state.token,state.adminCardEmail,month);renderAdminCard();}catch(e){handleServerError(e);}finally{loading.classList.add('hidden');}}
  function renderAdminCard(){const d=state.adminCardData;if(!d)return;text('adminCardTitle',d.user?.name||state.adminCardEmail);text('adminCardEmail',d.user?.email||state.adminCardEmail);text('apcCardNumber',d.cardNumber||'1');text('apcName',d.user?.name||'—');text('apcDepartment',d.department||d.schoolName||'—');text('apcMonthLabel',formatMonthMalay(d.month));document.getElementById('adminCardRows').innerHTML=cardRowsHtml(d,state.adminCardHalf);document.getElementById('adminCardHalf1Btn').classList.toggle('active',state.adminCardHalf===1);document.getElementById('adminCardHalf2Btn').classList.toggle('active',state.adminCardHalf===2);}
  function setAdminCardHalf(half){state.adminCardHalf=half===2?2:1;renderAdminCard();}


  // ---------- Users / dynamic filter / bulk password ----------
  function userPinState(u){return u.isLocked?'locked':u.mustChangePassword?'temp':!u.pinSet?'unset':'ready';}
  function applyUserFilters(){
    const data=state.admin?.users||[],q=norm(document.getElementById('userSearch')?.value),cat=document.getElementById('userCategoryFilter')?.value||'',active=document.getElementById('userActiveFilter')?.value||'',adm=document.getElementById('userAdminFilter')?.value||'',pw=document.getElementById('userPasswordFilter')?.value||'';
    const list=data.filter(u=>{
      const ps=userPinState(u),hay=norm([u.active?'aktif':'tidak aktif',u.name,u.jobTitle,u.email,u.category,u.isAdmin?'pentadbir sistem':'bukan admin',ps,u.s1In,u.s1Out,u.s2In,u.s2Out,u.note,u.lockedUntil,u.hasProfilePhoto?'gambar profil':'tiada gambar'].join(' '));
      return(!q||hay.includes(q))&&(!cat||u.category===cat)&&(!active||(active==='active'?u.active:!u.active))&&(!adm||(adm==='yes'?u.isAdmin:!u.isAdmin))&&(!pw||ps===pw);
    });
    state.filteredUsers=list;text('userFilterCount',`${list.length} / ${data.length} pengguna`);renderUserRows(list);updateBulkSelectionUI();
  }

  function renderUserRows(list){
    const body=document.getElementById('userRows');if(!body)return;
    body.innerHTML=list.length?list.map(u=>{
      const ps=userPinState(u),pwStatus=ps==='locked'?`<span class="auth-status locked">Dikunci</span><small class="auth-sub">${esc(u.lockedUntil||'')}</small>`:ps==='unset'?`<span class="auth-status unset">Belum ada PIN</span>`:ps==='temp'?`<span class="auth-status temp">Perlu tetapkan PIN</span><small class="auth-sub">Akan terus ke skrin cipta PIN</small>`:`<span class="auth-status ready">Sedia</span>`;
      const unlock=u.isLocked?`<button class="action-link warn-link" onclick='unlockUser(${JSON.stringify(u.email)})'>Buka kunci</button>`:'';
      const schedule=`S1 ${u.s1In||'Default'}–${u.s1Out||'Default'} · S2 ${u.s2In||'—'}–${u.s2Out||'—'}`;
      return `<tr><td class="select-col"><input class="user-select" type="checkbox" ${state.selectedUserEmails.has(u.email)?'checked':''} onchange='toggleUserSelection(${JSON.stringify(u.email)},this.checked)'></td><td>${u.active?'✓':'—'}</td><td><b>${esc(u.name)}</b><small class="table-sub">${esc(u.jobTitle||'Jawatan belum ditetapkan')} · ${u.hasProfilePhoto?'📷 Gambar dipaut':'Tiada gambar'}</small></td><td>${esc(u.email)}</td><td>${esc(u.category)}</td><td>${u.isAdmin?'✓':'—'}</td><td>${pwStatus}</td><td><b>${esc(schedule)}</b><small class="table-sub">${esc(u.note||'')}</small></td><td class="row-actions"><button class="action-link" onclick='openUserModal(${JSON.stringify(u.email)})'>Edit</button><button class="action-link" onclick='openTrustedDevices(${JSON.stringify(u.email)},${JSON.stringify(u.name)})'>Peranti</button><button class="action-link" onclick='resetUserPassword(${JSON.stringify(u.email)},${JSON.stringify(u.name)})'>Reset PIN</button>${unlock}</td></tr>`;
    }).join(''):'<tr><td colspan="9" class="empty-cell">Tiada pengguna sepadan.</td></tr>';
  }

  function toggleUserSelection(email,checked){if(checked)state.selectedUserEmails.add(email);else state.selectedUserEmails.delete(email);updateBulkSelectionUI();}
  function toggleSelectAllUsers(checked){state.filteredUsers.forEach(u=>checked?state.selectedUserEmails.add(u.email):state.selectedUserEmails.delete(u.email));renderUserRows(state.filteredUsers);updateBulkSelectionUI();}
  function updateBulkSelectionUI(){text('bulkSelectionCount',`${state.selectedUserEmails.size} dipilih`);const all=document.getElementById('selectAllUsers');if(all){const visible=state.filteredUsers||[];all.checked=visible.length>0&&visible.every(u=>state.selectedUserEmails.has(u.email));all.indeterminate=visible.some(u=>state.selectedUserEmails.has(u.email))&&!all.checked;}}

  async function bulkGeneratePasswords(){
    const emails=[...state.selectedUserEmails];if(!emails.length)return toast('Pilih pengguna dahulu.');
    if(!confirm(`Reset PIN untuk ${emails.length} pengguna?\n\nSemua sesi lama akan dibatalkan. Pengguna akan menerima emel arahan dan mencipta PIN 6 digit baharu sendiri.`))return;
    try{const r=await runServer('adminBulkResetPasswords',state.token,emails);showBulkPasswordsModal(r.results||[]);state.selectedUserEmails.clear();await refreshAdmin();}
    catch(e){handleServerError(e);}
  }

  function showBulkPasswordsModal(rows){
    showModal(`<div class="bulk-password-result"><div class="first-login-badge">RESET PIN PUKAL</div><h3>${rows.length} pengguna</h3><p>Tiada PIN sementara dijana. Pengguna hanya perlu buka e-Keberadaan, masukkan emel DELIMa dan cipta PIN 6 digit baharu sendiri.</p><div class="table-wrap compact-table"><table><thead><tr><th>Nama</th><th>Emel</th><th>Notifikasi emel</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.email)}</td><td>${r.emailSent?'✓ Dihantar':'⚠ Gagal dihantar'}</td></tr>`).join('')}</tbody></table></div><p><button class="btn primary" onclick="closeModal()">Selesai</button></p></div>`);
  }

  function openUserModal(email){
    const u=email?state.admin.users.find(x=>x.email===email):{active:true,name:'',email:'',category:'PPP',jobTitle:'',isAdmin:false,s1In:'',s1Out:'',s2In:'',s2Out:'',note:'',hasProfilePhoto:false};
    showModal(`<h3>${email?'Edit':'Tambah'} pengguna</h3><form onsubmit="saveUser(event)"><div class="modal-grid"><label>Nama<input name="name" required value="${attr(u.name)}"></label><label>Jawatan<input name="jobTitle" value="${attr(u.jobTitle||'')}" placeholder="Contoh: Guru Matematik / Penolong Kanan"></label><label>Emel DELIMa<input name="email" type="email" required value="${attr(u.email)}" ${email?'readonly':''} placeholder="nama@moe-dl.edu.my"></label><label>Kategori<select name="category">${['Pengurusan','AKP','PPP'].map(c=>`<option ${u.category===c?'selected':''}>${c}</option>`).join('')}</select></label><label class="check-line"><input type="checkbox" name="active" ${u.active?'checked':''}> Akaun aktif</label><label class="check-line"><input type="checkbox" name="isAdmin" ${u.isAdmin?'checked':''}> Pentadbir Sistem ✓</label><label>Gambar profil<input value="${u.hasProfilePhoto?'Dipaut dari Google Drive':'Belum dipaut'}" readonly></label><label>Sesi 1 · Masuk<input name="s1In" type="time" value="${attr(u.s1In||'')}"></label><label>Sesi 1 · Keluar<input name="s1Out" type="time" value="${attr(u.s1Out||'')}"></label><label>Sesi 2 · Masuk<input name="s2In" type="time" value="${attr(u.s2In||'')}"></label><label>Sesi 2 · Keluar<input name="s2Out" type="time" value="${attr(u.s2Out||'')}"></label><label>Catatan<input name="note" value="${attr(u.note)}"></label></div><p class="tiny">Kategori Pengurusan diberi akses Semakan Tidak Hadir / Keberadaan. Tanda Pentadbir Sistem memberi akses penuh termasuk Semakan Lewat / Balik Awal.</p><p><button class="btn primary" type="submit">Simpan pengguna</button></p></form>`);
  }
  async function saveUser(ev){ev.preventDefault();const fd=new FormData(ev.target),p=Object.fromEntries(fd.entries());p.active=fd.has('active');p.isAdmin=fd.has('isAdmin');try{const res=await runServer('adminSaveUser',state.token,p);closeModal();toast(res.user?.pinSet?'Pengguna disimpan.':'Pengguna disimpan. Pengguna boleh cipta PIN sendiri pada login pertama.',4200);await refreshAdmin();}catch(e){handleServerError(e);}}

  async function resetUserPassword(email,name){if(!confirm(`Reset PIN untuk ${name}?\n\nSemua sesi lama akan dibatalkan. Tiada PIN sementara. Selepas masukkan emel DELIMa, pengguna akan terus diminta mencipta PIN 6 digit baharu.`))return;try{const r=await runServer('adminResetPassword',state.token,email);showPasswordResetModal(r);await refreshAdmin();}catch(e){handleServerError(e);}}
  function showPasswordResetModal(r){showModal(`<div class="temp-password-result"><div class="first-login-badge">RESET PIN</div><h3>${esc(r.name||'Pengguna')}</h3><p class="muted">${esc(r.email||'')}</p><p>${esc(r.message||'PIN telah direset. Pengguna boleh mencipta PIN 6 digit baharu sendiri.')}</p><div class="login-success-notice">${r.emailSent?'✓ Emel arahan telah dihantar kepada pengguna.':'⚠ Emel arahan tidak dapat dihantar. Maklumkan pengguna supaya buka e-Keberadaan, masukkan emel DELIMa dan cipta PIN baharu.'}</div><p><button class="btn primary" type="button" onclick="closeModal()">Selesai</button></p></div>`);}
  async function unlockUser(email){if(!confirm('Buka sekatan PIN/login untuk akaun ini?'))return;try{await runServer('adminUnlockUser',state.token,email);toast('Sekatan login dibuka.');await refreshAdmin();}catch(e){handleServerError(e);}}

  async function openTrustedDevices(email,name){
    try{
      const r=await runServer('adminListTrustedDevices',state.token,email),devices=r.devices||[];
      const rows=devices.length?devices.map(d=>`<tr><td><b>${esc(d.deviceName||'Peranti')}</b><small class="table-sub">${esc(d.platform||'')} · ${esc(d.browser||'')}</small></td><td>${esc(d.lastSeenAt||'—')}<small class="table-sub">IP: ${esc(d.lastIp||'—')}</small></td><td>${esc(d.expiresAt||'—')}</td><td><button class="action-link warn-link" onclick='revokeTrustedDevice(${JSON.stringify(d.deviceId)},${JSON.stringify(email)},${JSON.stringify(name||email)})'>Logout peranti</button></td></tr>`).join(''):'<tr><td colspan="4" class="empty-cell">Tiada trusted device aktif.</td></tr>';
      showModal(`<h3>Trusted Device</h3><p><b>${esc(name||r.user?.name||email)}</b><br><span class="muted">${esc(email)} · maksimum 2 peranti · rolling 30 hari</span></p><div class="table-wrap compact-table"><table><thead><tr><th>Peranti</th><th>Terakhir digunakan</th><th>Tamat jika tidak digunakan</th><th>Tindakan</th></tr></thead><tbody>${rows}</tbody></table></div><p class="tiny">Setiap resume yang berjaya memperbaharui tempoh trusted device kepada 30 hari. Logout peranti hanya membatalkan peranti tersebut.</p><p><button class="btn ghost" onclick='revokeAllTrustedDevices(${JSON.stringify(email)},${JSON.stringify(name||email)})' ${devices.length?'':'disabled'}>Logout semua peranti</button> <button class="btn primary" onclick="closeModal()">Selesai</button></p>`);
    }catch(e){handleServerError(e);}
  }
  async function revokeTrustedDevice(deviceId,email,name){
    if(!confirm(`Logout trusted device ini untuk ${name}?`))return;
    try{
      await runServer('adminRevokeTrustedDevice',state.token,deviceId);
      if(deviceId===currentTrustedDeviceId()){clearStoredSession();state.token='';state.deviceToken='';closeModal();await showLogin();return toast('Peranti semasa telah dilog keluar.');}
      toast('Peranti telah dilog keluar.');await openTrustedDevices(email,name);
    }catch(e){handleServerError(e);}
  }
  async function revokeAllTrustedDevices(email,name){
    if(!confirm(`Logout SEMUA trusted device untuk ${name}?\n\nPengguna perlu login PIN semula pada setiap peranti.`))return;
    try{
      const r=await runServer('adminRevokeAllTrustedDevices',state.token,email);
      if(String(state.boot?.user?.email||'').toLowerCase()===String(email||'').toLowerCase()){clearStoredSession();state.token='';state.deviceToken='';closeModal();await showLogin();return toast(`${r.count||0} peranti dibatalkan. Anda juga telah dilog keluar.`);}
      toast(`${r.count||0} peranti dibatalkan.`);await openTrustedDevices(email,name);
    }catch(e){handleServerError(e);}
  }


  // ---------- Settings / visual map ----------
  function fillSettings(s){const f=document.getElementById('settingsForm');if(!f)return;Object.keys(s).forEach(k=>{if(f.elements[k])f.elements[k].value=s[k]??'';});updateModeSettingHint();if(state.locationMap)setTimeout(syncMapFromInputs,30);}
  async function saveSettings(ev){ev.preventDefault();const p=Object.fromEntries(new FormData(ev.target).entries());try{const r=await runServer('adminSaveSettings',state.token,p);state.admin.settings=r.settings;state.boot.settings=r.settings;renderBoot();fillSettings(r.settings);toast('Tetapan disimpan.');}catch(e){handleServerError(e);}}
  function updateModeSettingHint(){const mode=document.getElementById('systemModeSelect')?.value||'REAL';const hint=document.getElementById('modeSettingHint');if(hint){hint.textContent=mode==='TEST'?'MOD TEST: rekod waktu boleh dibuat tanpa semakan lokasi dan status waktu. Gunakan hanya untuk ujian sistem.':'MOD SEBENAR: lokasi/radius dikuatkuasakan; masa tidak menyekat rekod tetapi menentukan status LEWAT / BALIK AWAL.';hint.className='setting-hint '+(mode==='TEST'?'test-hint':'real-hint');}}

  function ensureLeaflet(){
    if(typeof L!=='undefined')return Promise.resolve();
    if(state.leafletPromise)return state.leafletPromise;
    state.leafletPromise=new Promise((resolve,reject)=>{
      if(!document.querySelector('link[data-ek-leaflet]')){
        const link=document.createElement('link');
        link.rel='stylesheet';link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';link.dataset.ekLeaflet='1';
        document.head.appendChild(link);
      }
      const existing=document.querySelector('script[data-ek-leaflet]');
      if(existing){existing.addEventListener('load',()=>resolve(),{once:true});existing.addEventListener('error',()=>reject(new Error('Peta gagal dimuatkan.')),{once:true});return;}
      const script=document.createElement('script');
      script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';script.async=true;script.dataset.ekLeaflet='1';
      script.onload=()=>resolve();script.onerror=()=>reject(new Error('Peta gagal dimuatkan.'));document.head.appendChild(script);
    });
    return state.leafletPromise;
  }

  async function initLocationPicker(){
    if(state.locationMap){syncMapFromInputs();return;}
    const el=document.getElementById('locationPickerMap');if(!el)return;
    try{await ensureLeaflet();}catch(e){toast(e.message||'Peta gagal dimuatkan.',4500);return;}
    if(state.locationMap||typeof L==='undefined')return;
    let lat=parseFloat(document.getElementById('settingLat')?.value),lng=parseFloat(document.getElementById('settingLng')?.value);if(!Number.isFinite(lat)||!Number.isFinite(lng)){lat=5.65;lng=100.49;}
    state.locationMap=L.map(el,{zoomControl:true}).setView([lat,lng],16);
    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'}).addTo(state.locationMap);
    state.locationMarker=L.marker([lat,lng],{draggable:true}).addTo(state.locationMap);
    const radius=Math.max(1,parseFloat(document.getElementById('settingRadius')?.value)||200);state.locationCircle=L.circle([lat,lng],{radius}).addTo(state.locationMap);
    state.locationMap.on('click',e=>setSettingCoords(e.latlng.lat,e.latlng.lng,true));state.locationMarker.on('dragend',e=>{const p=e.target.getLatLng();setSettingCoords(p.lat,p.lng,false);});
    syncMapReadout(lat,lng,radius);
  }
  function setSettingCoords(lat,lng,recenter){document.getElementById('settingLat').value=Number(lat).toFixed(7);document.getElementById('settingLng').value=Number(lng).toFixed(7);syncMapFromInputs(recenter);}
  function syncMapFromInputs(recenter=false){if(!state.locationMap)return;const lat=parseFloat(document.getElementById('settingLat')?.value),lng=parseFloat(document.getElementById('settingLng')?.value),radius=Math.max(1,parseFloat(document.getElementById('settingRadius')?.value)||200);if(!Number.isFinite(lat)||!Number.isFinite(lng))return;const ll=[lat,lng];state.locationMarker?.setLatLng(ll);state.locationCircle?.setLatLng(ll).setRadius(radius);if(recenter)state.locationMap.setView(ll,Math.max(state.locationMap.getZoom(),16));syncMapReadout(lat,lng,radius);}
  function syncMapRadius(){if(!state.locationMap)return;const radius=Math.max(1,parseFloat(document.getElementById('settingRadius')?.value)||200);state.locationCircle?.setRadius(radius);const ll=state.locationMarker?.getLatLng();if(ll)syncMapReadout(ll.lat,ll.lng,radius);}
  function syncMapReadout(lat,lng,radius){text('mapCoordReadout',`${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`);text('mapRadiusReadout',`${Math.round(radius)} m`);}
  async function useCurrentLocationForSetting(){try{const pos=await currentPosition();setSettingCoords(pos.coords.latitude,pos.coords.longitude,true);toast(`Lokasi peranti digunakan (±${Math.round(pos.coords.accuracy)}m).`);}catch(e){toast(e.message,4500);}}

  async function syncProfilePhotos(){if(!confirm('Sync gambar profil berdasarkan struktur folder Google Drive yang ditetapkan?'))return;try{const r=await runServer('adminSyncProfilePhotos',state.token);state.photoCache.clear();toast(`Gambar profil: ${r.matched} dipadankan, ${r.unmatched.length} tidak dijumpai.`,5000);await refreshAdmin();await refreshBoot();if(r.unmatched.length)showModal(`<h3>Hasil Sync Gambar Profil</h3><p><b>${r.matched}</b> berjaya dipadankan.</p><p><b>${r.unmatched.length}</b> tidak dijumpai:</p><div class="sync-unmatched">${r.unmatched.slice(0,50).map(x=>`<div>${esc(x)}</div>`).join('')}</div><p><button class="btn primary" onclick="closeModal()">Selesai</button></p>`);}catch(e){handleServerError(e);}}

  function localDateKey(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
  function getSystemStartDateClient(){return state.boot?.settings?.systemStartDate||'2026-09-01';}
  function applySystemDateLimits(){
    const start=getSystemStartDateClient(),startMonth=start.slice(0,7);
    ['absenceStartDate','absenceEndDate','absencePublicFrom','absencePublicTo','absenceManageFrom','absenceManageTo','timeReviewFrom','timeReviewTo','attendanceReportDate','attendanceReportFrom','attendanceReportTo','reportDate'].forEach(id=>{const el=document.getElementById(id);if(!el)return;el.min=start;if(el.value&&el.value<start)el.value=start;});
    ['myCardMonth','attendanceReportMonth','adminCardMonth'].forEach(id=>{const el=document.getElementById(id);if(!el)return;el.min=startMonth;if(el.value&&el.value<startMonth)el.value=startMonth;});
  }
  function initAttendanceReportBuilder(){
    const today=state.boot?.today||localDateKey(new Date());
    const date=document.getElementById('attendanceReportDate'),month=document.getElementById('attendanceReportMonth'),from=document.getElementById('attendanceReportFrom'),to=document.getElementById('attendanceReportTo');
    if(date&&!date.value)date.value=today;if(month&&!month.value)month.value=today.slice(0,7);if(from&&!from.value)from.value=today;if(to&&!to.value)to.value=today;updateAttendanceReportPeriod();
  }
  function updateAttendanceReportPeriod(){
    const type=document.getElementById('attendanceReportType')?.value||'DAILY',dateWrap=document.getElementById('attendanceReportDateWrap'),monthWrap=document.getElementById('attendanceReportMonthWrap'),fromWrap=document.getElementById('attendanceReportFromWrap'),toWrap=document.getElementById('attendanceReportToWrap');
    dateWrap?.classList.toggle('hidden',type==='MONTHLY'||type==='RANGE');monthWrap?.classList.toggle('hidden',type!=='MONTHLY');fromWrap?.classList.toggle('hidden',type!=='RANGE');toWrap?.classList.toggle('hidden',type!=='RANGE');
    try{const p=getAttendanceReportPeriod();text('attendanceReportRangeText',p.fromDate===p.toDate?p.fromDate:`${p.fromDate} hingga ${p.toDate}`);}catch(e){text('attendanceReportRangeText','Lengkapkan pilihan tarikh');}
  }
  function getAttendanceReportPeriod(){
    const type=document.getElementById('attendanceReportType')?.value||'DAILY';let fromDate='',toDate='';
    if(type==='DAILY'){fromDate=toDate=document.getElementById('attendanceReportDate')?.value||'';}
    else if(type==='WEEKLY'){const key=document.getElementById('attendanceReportDate')?.value||'';if(!key)throw new Error('Pilih tarikh rujukan.');const [y,m,d]=key.split('-').map(Number),dt=new Date(y,m-1,d),start=new Date(y,m-1,d-dt.getDay()),end=new Date(start);end.setDate(start.getDate()+6);fromDate=localDateKey(start);toDate=localDateKey(end);}
    else if(type==='MONTHLY'){const month=document.getElementById('attendanceReportMonth')?.value||'';if(!/^\d{4}-\d{2}$/.test(month))throw new Error('Pilih bulan laporan.');const [y,m]=month.split('-').map(Number);fromDate=`${month}-01`;toDate=localDateKey(new Date(y,m,0));}
    else{fromDate=document.getElementById('attendanceReportFrom')?.value||'';toDate=document.getElementById('attendanceReportTo')?.value||'';}
    if(!fromDate||!toDate)throw new Error('Lengkapkan tempoh laporan.');if(toDate<fromDate)throw new Error('Tarikh akhir tidak boleh sebelum tarikh mula.');const systemStart=getSystemStartDateClient();if(toDate<systemStart)throw new Error(`Tiada data sistem sebelum ${systemStart}.`);if(fromDate<systemStart)fromDate=systemStart;return {type,fromDate,toDate};
  }
  async function generateAttendancePresenceReportPdfClient(){try{const p=getAttendanceReportPeriod();const r=await runServer('generateAttendancePresenceReportPdf',state.token,p);downloadPdfResult(r);toast(`Laporan ${p.fromDate===p.toDate?p.fromDate:`${p.fromDate} hingga ${p.toDate}`} dijana.`);}catch(e){handleServerError(e);}}
  async function generateAttendancePresenceReportSheetClient(){try{const p=getAttendanceReportPeriod();const r=await runServer('generateAttendancePresenceReportSheet',state.token,p);toast(`Laporan dijana di helaian ${r.sheetName}.`,4500);}catch(e){handleServerError(e);}}

  async function repairDuplicateAttendance(){if(!confirm('Sistem akan menggabungkan rekod KEHADIRAN yang mempunyai tarikh dan emel yang sama. Teruskan?'))return;try{const r=await runServer('adminRepairAttendanceDuplicates',state.token);toast(r.groupsMerged?`${r.groupsMerged} kumpulan duplikat digabungkan; ${r.rowsRemoved} baris dibuang.`:'Tiada rekod duplikat dijumpai.',4500);await refreshAdmin();}catch(e){handleServerError(e);}}
  async function generateReportSheet(){try{const r=await runServer('generateReportSheet',state.token,document.getElementById('reportDate').value);toast(`Laporan dijana di ${r.sheetName}.`);}catch(e){handleServerError(e);}}
