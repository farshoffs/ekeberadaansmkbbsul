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
