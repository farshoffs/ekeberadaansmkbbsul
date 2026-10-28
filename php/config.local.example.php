<?php
// COPY to config.local.php and fill the password ON THE HOST SERVER ONLY.
// Never commit config.local.php, passwords, user records, or full SQL data dumps.
return [
  'host' => 'localhost', // cPanel MySQL usually uses localhost; use the remote IP only when required
  'port' => 3306,
  'database' => 'ppdkmyna_ekeberadaansmkbbsul',
  'username' => 'ppdkmyna_ekeberadaansmkbbsul',
  'password' => 'REPLACE_ON_SERVER',
  // REQUIRED to reuse existing Google Sheets PIN_V1 values without reset.
  // Get the ORIGINAL value of EK_PASSWORD_PEPPER from the source Apps Script
  // project > Project Settings > Script Properties. Paste it only on the host.
  'legacy_pin_pepper' => 'PASTE_ORIGINAL_EK_PASSWORD_PEPPER_HERE',
  // Workspace features (Google Drive photos, PDF/Google Docs, Google Sheets):
  // URL is PUBLIC, bridge secret MUST be private and DIFFERENT from PIN pepper.
  // Deploy updated apps-script/Bridges.gs + 97_WorkspaceBridge.gs FIRST.
  'workspace_gas_url' => 'https://script.google.com/macros/s/AKfycbyUv2F6Fl3drRR-TTTJkefu73TwbuQk5GVf36z87WLYIy40SSqZOfKBCeSIy7xje_wq/exec',
  'workspace_bridge_secret' => 'PASTE_NEW_RANDOM_64_HEX_SHARED_WITH_APPS_SCRIPT',

  // Generate 64 random hexadecimal characters; required only for browser setup.
  // Remove this line after the first administrator PIN is activated.
  'setup_key' => 'REPLACE_WITH_64_RANDOM_HEX_CHARACTERS',
];
