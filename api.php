<?php
declare(strict_types=1);

/*
 * Public API gateway. Prevent a broken PHP include from returning an HTML
 * fatal-error page to the frontend. The private full error goes to cPanel's
 * PHP error log, and the user receives an opaque support reference instead.
 */
ini_set('display_errors', '0');
ini_set('log_errors', '1');
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

// The GitHub Pages frontend makes cross-origin JSON requests to this PHP API.
// Whitelist only the deployed Pages origin and the existing cPanel origin.
$ekOrigin = rtrim((string)($_SERVER['HTTP_ORIGIN'] ?? ''), '/');
if ($ekOrigin !== '') {
    $requestHost = strtolower((string)parse_url($ekOrigin, PHP_URL_HOST));
    $serverHost = strtolower((string)parse_url('https://'.($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST));
    $isHostingOrigin = $requestHost !== '' && $requestHost === $serverHost
        && in_array(parse_url($ekOrigin, PHP_URL_SCHEME), array('https', 'http'), true);
    $isPagesOrigin = in_array($ekOrigin, array(
        'https://farshoffs.github.io',
        'https://kea3123-bit.github.io'
    ), true);
    if (!$isHostingOrigin && !$isPagesOrigin) {
        http_response_code(403);
        echo json_encode(array('ok'=>false,'error'=>'Origin not authorized'));
        exit;
    }
    header('Access-Control-Allow-Origin: '.$ekOrigin);
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Max-Age: 600');
    header('Vary: Origin', false);
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code($ekOrigin !== '' ? 204 : 400);
    exit;
}
/*
 * This diagnostic is deliberately handled BEFORE loading php/api.php,
 * _lib.php or database credentials. It must work even if an uploaded
 * dependency is missing or a newer PHP construct cannot be parsed.
 * Remove the diagnostic route once the hosting installation is fixed.
 */
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET' && ($_GET['health'] ?? '') === '1') {
    http_response_code(200);
    echo json_encode([
        'ok'=>true,
        'stage'=>'root-gateway',
        'php8Plus'=>PHP_VERSION_ID>=80000,
        'pdoMysql'=>extension_loaded('pdo_mysql'),
        'phpApiReadable'=>is_readable(__DIR__.'/php/api.php'),
        'libraryReadable'=>is_readable(__DIR__.'/php/_lib.php'),
        'configFilePresent'=>is_file(__DIR__.'/php/config.local.php')
    ]);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' &&
    stripos((string)($_SERVER['CONTENT_TYPE'] ?? ''),'application/json') !== false) {
    $raw = file_get_contents('php://input');
    if (is_string($raw) && strlen($raw) <= 512) {
        $req = json_decode($raw,true);
        if (is_array($req) && ($req['fn'] ?? null) === 'getApiStatus' &&
            ($req['args'] ?? null) === []) {
            http_response_code(200);
            echo json_encode([
                'ok'=>true,
                'result'=>['healthy'=>true,'backend'=>'PHP root gateway'],
                'diagnostic'=>[
                    'php8Plus'=>PHP_VERSION_ID>=80000,
                    'pdoMysql'=>extension_loaded('pdo_mysql'),
                    'phpApiReadable'=>is_readable(__DIR__.'/php/api.php'),
                    'libraryReadable'=>is_readable(__DIR__.'/php/_lib.php'),
                    'configFilePresent'=>is_file(__DIR__.'/php/config.local.php')
                ]
            ]);
            exit;
        }
    }
}
ob_start();

try {
    require __DIR__ . '/php/api.php';
    $body = ob_get_clean();
    echo $body;
} catch (Throwable $e) {
    while (ob_get_level() > 0) { ob_end_clean(); }
    $reference = strtoupper(bin2hex(random_bytes(4)));
    error_log('[eKeberadaan boot ' . $reference . '] ' . get_class($e) . ' at '
        . $e->getFile() . ':' . $e->getLine() . ' - ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'ok' => false,
        'error' => 'PHP gagal dimulakan pada hosting. Semak cPanel > Metrics > Errors atau error_log dalam File Manager. Rujukan: ' . $reference,
    ], JSON_UNESCAPED_UNICODE);
}
