(()=>{
  'use strict';
  const cfg=window.EK_CONFIG||{};
  const timeoutMs=Math.max(5000,Number(cfg.BRIDGE_TIMEOUT_MS)||30000);
  let seq=0,ready=false,probeStarted=false;
  const pending=new Map();

  function randomToken(bytes=16){
    try{
      const a=new Uint8Array(bytes);
      crypto.getRandomValues(a);
      return Array.from(a,b=>b.toString(16).padStart(2,'0')).join('');
    }catch(_e){
      return Math.random().toString(36).slice(2)+Date.now().toString(36);
    }
  }
  const channel='ekch_'+randomToken(18);

  function isValidBackend(url){
    try{
      const u=new URL(url);
      if(u.protocol!=='https:' || u.hostname!=='script.google.com') return false;
      const standard=/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
      const workspace=/^\/a\/macros\/[A-Za-z0-9.-]+\/s\/[A-Za-z0-9_-]+\/exec$/;
      return standard.test(u.pathname) || workspace.test(u.pathname);
    }catch(_e){ return false; }
  }

  function isTrustedResultOrigin(origin){
    if(origin==='null') return true; // HtmlService sandbox may have an opaque origin.
    try{
      const u=new URL(origin);
      return u.protocol==='https:' && (
        u.hostname==='script.google.com' ||
        u.hostname==='script.googleusercontent.com' ||
        u.hostname.endsWith('.googleusercontent.com')
      );
    }catch(_e){ return false; }
  }

  const queryBackend=new URLSearchParams(location.search).get('backend')||'';
  if(queryBackend && isValidBackend(queryBackend)){
    try{ localStorage.setItem('EK_APPS_SCRIPT_WEB_APP_URL',queryBackend); }catch(_e){}
  }
  let storedBackend='';
  try{ storedBackend=localStorage.getItem('EK_APPS_SCRIPT_WEB_APP_URL')||''; }catch(_e){}
  const configuredBackend=String(cfg.APPS_SCRIPT_WEB_APP_URL||'').trim();
  const backend=[configuredBackend,queryBackend,storedBackend].find(isValidBackend)||'';

  function status(text,kind){
    let el=document.getElementById('ekBridgeStatus');
    if(!el){
      el=document.createElement('div');
      el.id='ekBridgeStatus';
      el.setAttribute('role','status');
      document.body.appendChild(el);
    }
    el.className='ek-bridge-status '+(kind||'');
    el.textContent=text;
    if(kind==='ok')setTimeout(()=>el.classList.add('hidden'),1600);
  }

  function cleanupRequest(p){
    if(!p)return;
    clearTimeout(p.timer);
    try{ if(p.form&&p.form.parentNode)p.form.remove(); }catch(_e){}
    try{ if(p.frame&&p.frame.parentNode)p.frame.remove(); }catch(_e){}
  }

  function invoke(method,args,success,failure){
    if(!backend){
      const err=new Error('URL backend Apps Script belum dikonfigurasi.');
      failure(err);
      return;
    }

    const id='ek_'+Date.now().toString(36)+'_'+(++seq).toString(36)+'_'+randomToken(5);
    const frame=document.createElement('iframe');
    const frameName='ek_rpc_'+id.replace(/[^A-Za-z0-9_]/g,'_');
    frame.name=frameName;
    frame.id=frameName;
    frame.title='eKeberadaan backend RPC';
    frame.style.cssText='position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-20px;top:-20px';
    frame.referrerPolicy='no-referrer';
    document.body.appendChild(frame);

    const form=document.createElement('form');
    form.method='POST';
    form.action=backend+(backend.includes('?')?'&':'?')+'bridge=1';
    form.target=frameName;
    form.style.display='none';

    const input=document.createElement('input');
    input.type='hidden';
    input.name='payload';
    input.value=JSON.stringify({
      id,
      channel,
      method,
      args:Array.isArray(args)?args:[],
      origin:location.origin
    });
    form.appendChild(input);
    document.body.appendChild(form);

    const timer=setTimeout(()=>{
      const p=pending.get(id);
      if(!p)return;
      pending.delete(id);
      cleanupRequest(p);
      failure(new Error('Backend tidak memberi respons. Semak deployment Apps Script atau sambungan internet.'));
    },timeoutMs);

    pending.set(id,{success,failure,timer,frame,form});
    try{
      form.submit();
      // The browser no longer needs the form after navigation has started.
      setTimeout(()=>{ try{ if(form.parentNode)form.remove(); }catch(_e){} },0);
    }catch(err){
      const p=pending.get(id);
      pending.delete(id);
      cleanupRequest(p);
      failure(err instanceof Error?err:new Error(String(err)));
    }
  }

  window.addEventListener('message',(event)=>{
    const data=event.data||{};
    if(!isTrustedResultOrigin(event.origin))return;
    if(data.type!=='EK_BRIDGE_RESULT')return;
    if(data.channel!==channel)return;
    const id=String(data.id||'');
    const p=pending.get(id);
    if(!p)return;
    pending.delete(id);
    cleanupRequest(p);
    if(data.ok){
      try{ p.success(data.value); }catch(e){ console.error(e); }
    }else{
      const err=new Error(data.error||'Ralat backend Apps Script.');
      try{ p.failure(err); }catch(e){ console.error(e); }
    }
  });

  function probeBackend(){
    if(probeStarted||!document.body)return;
    probeStarted=true;
    if(!backend){ status('Backend Apps Script belum ditetapkan.','error'); return; }
    status('Menyambung backend…','');
    invoke('__ping__',[],()=>{
      ready=true;
      status('Backend tersambung','ok');
    },err=>{
      ready=false;
      probeStarted=false;
      console.error('eKeberadaan bridge probe:',err);
      status('Backend tidak dapat disambungkan.','error');
    });
  }

  function runner(success,failure){
    const target={
      withSuccessHandler(fn){ return runner(typeof fn==='function'?fn:()=>{},failure); },
      withFailureHandler(fn){ return runner(success,typeof fn==='function'?fn:()=>{}); },
      withUserObject(){ return this; }
    };
    return new Proxy(target,{
      get(obj,prop){
        if(prop in obj)return obj[prop];
        if(typeof prop!=='string')return undefined;
        return (...args)=>invoke(prop,args,success,failure);
      }
    });
  }

  window.google=window.google||{};
  window.google.script=window.google.script||{};
  Object.defineProperty(window.google.script,'run',{
    configurable:true,
    get(){ return runner(()=>{},(e)=>console.error(e)); }
  });

  window.EKBridge={
    backend,
    probe:probeBackend,
    ensureFrame:probeBackend,
    isReady:()=>ready,
    clearBackend(){ try{ localStorage.removeItem('EK_APPS_SCRIPT_WEB_APP_URL'); }catch(_e){} }
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',probeBackend,{once:true});
  else probeBackend();
})();
