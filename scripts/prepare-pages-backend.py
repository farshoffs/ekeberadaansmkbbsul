#!/usr/bin/env python3
from pathlib import Path
import re

path = Path('Code.gs')
text = path.read_text(encoding='utf-8')

if 'return renderPagesBridge_();' in text:
    print('Code.gs already contains the GitHub Pages bridge route.')
    raise SystemExit(0)

pattern = re.compile(r"function doGet\(e\)\s*\{.*?\n\}\nfunction include\(filename\)", re.S)
match = pattern.search(text)
if not match:
    raise SystemExit('Unable to locate doGet/include block in Code.gs')

replacement = """function doGet(e) {
  // GitHub Pages calls the existing Apps Script backend through a hidden iframe.
  // All authentication/PIN/session/Sheets/Drive work remains server-side here.
  if (e && e.parameter && String(e.parameter.bridge || '') === '1') {
    return renderPagesBridge_();
  }

  const tpl = HtmlService.createTemplateFromFile('Index');
  return tpl
    .evaluate()
    .setTitle('e-Keberadaan — Perakam Waktu Digital')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}
function include(filename)"""

text = text[:match.start()] + replacement + text[match.end():]
path.write_text(text, encoding='utf-8')
print('Patched Code.gs for GitHub Pages bridge.')
