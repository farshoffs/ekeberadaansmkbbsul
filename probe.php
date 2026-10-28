<?php
// TEMPORARY troubleshooting probe. Delete from hosting after diagnosis.
// No application imports and no credentials: can isolate Apache/PHP failure.
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');
http_response_code(200);
echo json_encode(array(
    'ok'=>true,
    'stage'=>'standalone-php',
    'php8Plus'=>(defined('PHP_VERSION_ID') && PHP_VERSION_ID>=80000),
    'pdoMysql'=>extension_loaded('pdo_mysql'),
    'curl'=>extension_loaded('curl')
));
