/**
 * GitHub Pages bridge for eKeberadaan.
 * Keeps Google Sheets, PIN/session secrets and all privileged work in Apps Script.
 */
function getPagesWebOrigin_() {
  var value = String(PropertiesService.getScriptProperties().getProperty('EK_PAGES_ORIGIN') || '').trim();
  return value || 'https://farshoffs.github.io';
}

function renderPagesBridge_() {
  var tpl = HtmlService.createTemplateFromFile('Bridge');
  tpl.allowedOrigin = getPagesWebOrigin_();
  return tpl.evaluate()
    .setTitle('eKeberadaan Backend Bridge')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
