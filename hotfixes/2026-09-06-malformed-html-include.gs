// HOTFIX: Scripts.html is raw JavaScript and is included inside a <script> tag in Index.html.
// Using createHtmlOutputFromFile() tries to parse Scripts.html as standalone HTML
// and throws: Exception: Malformed HTML content: const state = ...
function include(filename) {
  return HtmlService.createTemplateFromFile(filename).getRawContent();
}
