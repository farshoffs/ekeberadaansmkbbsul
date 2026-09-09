(() => {
  const COMPONENTS=['Alert','Button','Carousel','Collapse','Dropdown','Modal','Offcanvas','Popover','ScrollSpy','Tab','Toast','Tooltip'];
  document.addEventListener('DOMContentLoaded',()=>{
    const ok=!!window.bootstrap&&COMPONENTS.every(name=>typeof window.bootstrap[name]==='function');
    document.documentElement.dataset.ekBootstrap=ok?'ready':'missing';
    if(ok){
      document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el=>bootstrap.Tooltip.getOrCreateInstance(el));
      document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el=>bootstrap.Popover.getOrCreateInstance(el));
      const sidebar=document.getElementById('sidebar'),toggle=document.querySelector('.hamburger');
      if(sidebar&&toggle){
        sidebar.addEventListener('show.bs.collapse',()=>toggle.setAttribute('aria-expanded','true'));
        sidebar.addEventListener('hide.bs.collapse',()=>toggle.setAttribute('aria-expanded','false'));
      }
    }
  },{once:true});
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}), {once:true});
  }
})();
