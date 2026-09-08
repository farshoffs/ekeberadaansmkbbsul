# GitHub Pages runtime source

This directory contains the static-runtime pieces used by the production GitHub Pages build.

- `config.js` contains the public Apps Script Web App `/exec` URL.
- `gas-shim.js` provides the browser-side Apps Script RPC compatibility layer.
- `scripts/build-pages.py` combines these with the editable root UI sources and emits the optimized `_site` build.

Never place PIN pepper, session secrets, OAuth tokens, private keys or other server credentials in this directory. GitHub Pages is public static content.
