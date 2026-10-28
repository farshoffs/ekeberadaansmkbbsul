<?php
// COPY to config.local.php and fill the password ON THE HOST SERVER ONLY.
// Never commit config.local.php, passwords, user records, or full SQL data dumps.
return [
  'host' => 'localhost', // cPanel MySQL usually uses localhost; use the remote IP only when required
  'port' => 3306,
  'database' => 'ppdkmyna_ekeberadaansmkbbsul',
  'username' => 'ppdkmyna_ekeberadaansmkbbsul',
  'password' => 'REPLACE_ON_SERVER',
  // Generate 64 random hexadecimal characters; required only for browser setup.
  // Remove this line after the first administrator PIN is activated.
  'setup_key' => 'REPLACE_WITH_64_RANDOM_HEX_CHARACTERS',
];
