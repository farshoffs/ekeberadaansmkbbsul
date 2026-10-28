<?php
declare(strict_types=1);
if (PHP_SAPI!=='cli') { http_response_code(403); exit; }
require __DIR__.'/_lib.php';
try {
    $db=db();
    $name=(string)$db->query('SELECT DATABASE()')->fetchColumn();
    $tables=['pengguna','kehadiran','tidak_hadir','tetapan','audit','web_auth','web_sessions'];
    foreach ($tables as $t) {
        $stmt=$db->prepare('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name=?');
        $stmt->execute([$t]);
        echo ($stmt->fetchColumn()?'OK  ':'MISS')."  ".$t."\n";
    }
    echo "Database connection: OK\n";
} catch(Throwable $e) {
    fwrite(STDERR,"Database connection failed. Check config.local.php, MySQL user privileges, imported data, and schema.sql.\n");
    exit(1);
}
