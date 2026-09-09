window.EK_CONFIG = Object.freeze({
  APP_NAME: 'e-Keberadaan',
  SCHOOL_NAME: 'SMK Bandar Baru Sungai Lalang',
  TIMEZONE: 'Asia/Kuala_Lumpur',
  // GitHub Pages DEV backend. Public Apps Script /exec URL; not a secret.
  APPS_SCRIPT_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbyUv2F6Fl3drRR-TTTJkefu73TwbuQk5GVf36z87WLYIy40SSqZOfKBCeSIy7xje_wq/exec',
  BRIDGE_TIMEOUT_MS: 30000
});

// Bootstrap compatibility guard.
// Legacy eKeberadaan CSS historically used .modal{z-index:100}; Bootstrap's
// generated backdrop uses z-index:1050. Without this final cascade layer the
// backdrop sits above the dialog and blocks every input/click. Keep the modal
// stack aligned with Bootstrap's documented defaults regardless of legacy CSS.
(() => {
  const id = 'ek-bootstrap-compat';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    .modal{z-index:1055!important;pointer-events:none}
    .modal.show{display:block!important;pointer-events:auto}
    .modal .modal-dialog{position:relative;z-index:1;pointer-events:none}
    .modal .modal-content{position:relative;z-index:1;pointer-events:auto!important}
    .modal-backdrop{z-index:1050!important}
    body.modal-open .modal{pointer-events:auto!important}
  `;
  document.head.appendChild(style);
})();
