<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
require __DIR__.'/_lib.php';
$email=email_key($argv[1]??'');
if (!user_by_email($email,false)) {fwrite(STDERR,"User not found.\n");exit(1);}
fwrite(STDOUT,"Enter a new six-digit PIN for ".$email.": ");
$pin=trim((string)fgets(STDIN));
if (!preg_match('/^\d{6}$/',$pin)) {fwrite(STDERR,"Exactly six digits required.\n");exit(1);}
$hash=password_hash($pin,PASSWORD_DEFAULT);
execute_sql('INSERT INTO web_auth (email,pin_hash,attempts,locked_until) VALUES (?,?,0,NULL) ON DUPLICATE KEY UPDATE pin_hash=VALUES(pin_hash),attempts=0,locked_until=NULL',[$email,$hash]);
execute_sql('DELETE FROM web_sessions WHERE email=?',[$email]);
echo "PIN provisioned and previous PHP sessions revoked.\n";
