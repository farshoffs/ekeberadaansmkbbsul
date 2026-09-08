(()=>{
  'use strict';
  const cfg=window.EK_CONFIG||{};
  const timeoutMs=Math.max(5000,Number(cfg.BRIDGE_TIMEOUT_MS)||30000);
  let frame=null,ready=false,seq=0;
  const pending=new Map();
  const queue=[];

  function isValidBackend(url){
    try{
      const u=new URL(url);
      if(u.protocol!=='https:' || u.hostname!=='script.google.com') return false;
      const standard=/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
      const workspace=/^\/a\/macros\/[A-Za-z0-9.-]+\/s\/[A-Za-z0-9_-]+\/exec$/;
      return standard.test(u.pathname) || workspace.test(u.pathname);
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

  function ensureFrame(){
    if(frame)return frame;
    if(!backend){
      status('Backend Apps Script belum ditetapkan.','error');
      return null;
    }
    frame=document.createElement('iframe');
    frame.id='ekAppsScriptBridge';
    frame.title='eKeberadaan backend bridge';
    frame.style.cssText='position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-10px;top:-10px';
    frame.referrerPolicy='strict-origin-when-cross-origin';
    frame.src=backend+(backend.includes('?')?'&':'?')+'bridge=1';
    frame.onload=()=>{ try{ frame.contentWindow.postMessage({type:'EK_BRIDGE_HELLO'},'*'); }catch(_e){} };
    document.body.appendChild(frame);
    status('Menyambung backend…','');
    return frame;
  }

  function send(req){
    const f=ensureFrame();
    if(!f)return false;
    if(!ready){ queue.push(req); return true; }
    f.contentWindow.postMessage(req,'*');
    return true;
  }

  window.addEventListener('message',(event)=>{
    const data=event.data||{};
    if(!frame||event.source!==frame.contentWindow)return;
    if(data.type==='EK_BRIDGE_READY'){
      ready=true;
      status('Backend tersambung','ok');
      while(queue.length)frame.contentWindow.postMessage(queue.shift(),'*');
      return;
    }
    if(data.type!=='EK_BRIDGE_RESULT')return;
    const p=pending.get(data.id);
    if(!p)return;
    pending.delete(data.id);
    clearTimeout(p.timer);
    if(data.ok){
      try{ p.success(data.value); }catch(e){ console.error(e); }
    }else{
      const err=new Error(data.error||'Ralat backend Apps Script.');
      try{ p.failure(err); }catch(e){ console.error(e); }
    }
  });

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
        return (...args)=>{
          const id='ek_'+Date.now().toString(36)+'_'+(++seq).toString(36);
          const timer=setTimeout(()=>{
            if(!pending.has(id))return;
            pending.delete(id);
            failure(new Error('Backend tidak memberi respons. Semak internet atau deployment Apps Script.'));
          },timeoutMs);
          pending.set(id,{success,failure,timer});
          if(!send({type:'EK_BRIDGE_CALL',id,method:prop,args})){
            clearTimeout(timer);
            pending.delete(id);
            failure(new Error('URL backend Apps Script belum dikonfigurasi.'));
          }
        };
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
    ensureFrame,
    isReady:()=>ready,
    clearBackend(){ try{ localStorage.removeItem('EK_APPS_SCRIPT_WEB_APP_URL'); }catch(_e){} }
  };
  document.addEventListener('DOMContentLoaded',ensureFrame,{once:true});
})();
