/* PHP/MySQL-only PIN management overrides. Not loaded by Google Apps Script. */
function openChangePin(required=false){
  const hint=required
    ? '<p style="color:#8d3a00;font-weight:700">Anda sedang menggunakan PIN sementara. Tukar PIN sebelum menggunakan fungsi lain.</p>'
    : '<p class="muted">Tukar PIN 6 digit anda. Sesi di peranti lain akan dibatalkan.</p>';
  showModal('<h3>Tukar PIN e-Keberadaan</h3>'+hint+
    '<form onsubmit="submitChangePin(event)" autocomplete="off">'+
    '<label>PIN semasa<input type="password" name="oldPin" required pattern="[0-9]{6}" minlength="6" maxlength="6" inputmode="numeric" autocomplete="current-password"></label>'+
    '<label>PIN baharu<input type="password" name="newPin" required pattern="[0-9]{6}" minlength="6" maxlength="6" inputmode="numeric" autocomplete="new-password"></label>'+
    '<label>Sahkan PIN baharu<input type="password" name="confirmPin" required pattern="[0-9]{6}" minlength="6" maxlength="6" inputmode="numeric" autocomplete="new-password"></label>'+
    '<p><button class="btn primary" type="submit">Simpan PIN baharu</button></p></form>');
}
async function submitChangePin(ev){
  ev.preventDefault();
  const fd=new FormData(ev.target);
  const oldPin=String(fd.get('oldPin')||''), pin=String(fd.get('newPin')||''), confirmPin=String(fd.get('confirmPin')||'');
  if(!/^\d{6}$/.test(oldPin)||!/^\d{6}$/.test(pin)||pin!==confirmPin||pin===oldPin){
    return toast('PIN baharu mesti 6 digit, sama dengan pengesahan dan berbeza daripada PIN semasa.');
  }
  const btn=ev.target.querySelector('button[type="submit"]');
  if(btn)btn.disabled=true;
  try{
    const r=await runServer('changePin',state.token,oldPin,pin,confirmPin);
    state.boot=r.boot;renderBoot();closeModal();toast('PIN berjaya ditukar. Sesi lain telah dibatalkan.');
  }catch(e){handleServerError(e,false)}
  finally{if(btn)btn.disabled=false}
}
async function resetUserPassword(email,name){
  if(!confirm('Jana PIN sementara baharu untuk '+name+'? Semua sesi lama akan dibatalkan. PIN sementara wajib ditukar pada login.'))return;
  try{const r=await runServer('adminResetPassword',state.token,email);showPasswordResetModal(r);await refreshAdmin();}
  catch(e){handleServerError(e)}
}
function showPasswordResetModal(r){
  showModal('<div class="temp-password-result"><div class="first-login-badge">PIN SEMENTARA</div>'+
    '<h3>'+esc(r.name||'Pengguna')+'</h3><p class="muted">'+esc(r.email||'')+'</p>'+
    '<p>Salin PIN ini sekarang dan serahkan kepada pengguna secara peribadi. Ia hanya ditunjukkan sekali.</p>'+
    '<label>PIN sementara<input id="tempPinValue" value="'+attr(r.temporaryPin||'')+'" readonly autocomplete="off"></label>'+
    '<p><button type="button" class="btn primary" onclick="navigator.clipboard.writeText(document.getElementById(\'tempPinValue\').value).then(()=>toast(\'PIN disalin\')).catch(()=>toast(\'Salin PIN secara manual\'))">Salin PIN</button></p>'+
    '<p>Pengguna mesti log masuk dengan PIN sementara dan menetapkan PIN peribadi baharu.</p>'+
    '<p><button class="btn" type="button" onclick="closeModal()">Selesai</button></p></div>');
}
async function bulkGeneratePasswords(){
  const emails=[...state.selectedUserEmails];
  if(!emails.length)return toast('Pilih pengguna dahulu.');
  if(!confirm('Jana PIN sementara untuk '+emails.length+' pengguna? Semua sesi lama akan dibatalkan. Anda perlu menyerahkan setiap PIN secara peribadi.'))return;
  try{
    const r=await runServer('adminBulkResetPasswords',state.token,emails);
    showBulkPasswordsModal(r.results||[]);
    state.selectedUserEmails.clear();await refreshAdmin();
  }catch(e){handleServerError(e)}
}
function showBulkPasswordsModal(rows){
  const textRows=rows.map(r=>String(r.name||'')+'\t'+String(r.email||'')+'\t'+String(r.temporaryPin||'')).join('\n');
  window.__ekTemporaryPins=textRows;
  showModal('<div class="bulk-password-result"><div class="first-login-badge">PIN SEMENTARA</div>'+
    '<h3>'+rows.length+' pengguna</h3><p>Setiap PIN hanya dipaparkan sekali. Simpan sementara secara selamat, kemudian serahkan secara peribadi.</p>'+
    '<div class="table-wrap compact-table"><table><thead><tr><th>Nama</th><th>Emel</th><th>PIN sementara</th></tr></thead><tbody>'+
    rows.map(r=>'<tr><td>'+esc(r.name||'')+'</td><td>'+esc(r.email||'')+'</td><td><b>'+esc(r.temporaryPin||'')+'</b></td></tr>').join('')+
    '</tbody></table></div><p><button type="button" class="btn primary" onclick="navigator.clipboard.writeText(window.__ekTemporaryPins).then(()=>toast(\'PIN disalin\')).catch(()=>toast(\'Salin PIN secara manual\'))">Salin senarai</button></p>'+
    '<p><button class="btn" type="button" onclick="window.__ekTemporaryPins=\'\';closeModal()">Selesai</button></p></div>');
}
