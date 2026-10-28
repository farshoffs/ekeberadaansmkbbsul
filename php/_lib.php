<?php
declare(strict_types=1);
date_default_timezone_set('Asia/Kuala_Lumpur');

function cfg(): array {
    $file = __DIR__ . '/config.local.php';
    if (!is_file($file)) throw new RuntimeException('Konfigurasi database belum dipasang. Sila buat php/config.local.php.');
    $config = require $file;
    if (!is_array($config)) throw new RuntimeException('Format konfigurasi tidak sah.');
    return $config;
}
function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $c = cfg();
    $dsn = 'mysql:host=' . ($c['host'] ?? 'localhost') . ';port=' . (int)($c['port'] ?? 3306) .
        ';dbname=' . ($c['database'] ?? '') . ';charset=utf8mb4';
    $pdo = new PDO($dsn, (string)($c['username'] ?? ''), (string)($c['password'] ?? ''), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $pdo->exec("SET time_zone = '+08:00'");
    return $pdo;
}
function rows(string $query, array $params = []): array {
    $s=db()->prepare($query); $s->execute($params); return $s->fetchAll();
}
function one(string $query, array $params = []): ?array {
    $s=db()->prepare($query); $s->execute($params); $v=$s->fetch(); return $v===false?null:$v;
}
function execute_sql(string $query, array $params=[]): int {
    $s=db()->prepare($query);$s->execute($params);return $s->rowCount();
}
function now_myt(): string { return date('Y-m-d H:i:s'); }
function today(): string { return date('Y-m-d'); }
function date_key($x): string {
    if ($x === null || $x === '') return '';
    if (is_numeric($x)) return gmdate('Y-m-d', (int)round(((float)$x-25569)*86400));
    return substr((string)$x,0,10);
}
function excel_number($x): float {
    return ($x instanceof DateTimeInterface ? (float)$x->getTimestamp() : strtotime((string)$x)) /86400+25569;
}
function time_text($x): string {
    if ($x === null || $x === '') return '';
    if (is_numeric($x)) return gmdate('H:i', (int)round((((float)$x-floor((float)$x))*86400))%86400);
    if (preg_match('/^\d\d:\d\d/',(string)$x)) return substr((string)$x,0,5);
    return '';
}
function valid_day(string $d): string {
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/',$d) || !checkdate((int)substr($d,5,2),(int)substr($d,8,2),(int)substr($d,0,4)))
        throw new InvalidArgumentException('Tarikh tidak sah.');
    return $d;
}
function valid_time($t): string {
    $t=trim((string)$t);
    if ($t!==''&&!preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/',$t)) throw new InvalidArgumentException('Format masa tidak sah.');
    return $t;
}
function email_key($v): string {
    $e=strtolower(trim((string)$v));
    if (!filter_var($e,FILTER_VALIDATE_EMAIL) || strlen($e)>64) throw new InvalidArgumentException('Alamat emel tidak sah.');
    return $e;
}
function user_by_email(string $e, bool $active=true): ?array {
    return one('SELECT * FROM pengguna WHERE LOWER(emel)=?'.($active?' AND aktif=1':'').' ORDER BY _row_id LIMIT 1',[$e]);
}
function public_user(array $u): array {
    $e=(string)$u['emel'];
    $auth=one('SELECT email,must_change_pin FROM web_auth WHERE email=?',[$e]);
    return ['active'=>(bool)$u['aktif'],'name'=>$u['nama'],'email'=>$e,'category'=>$u['kategori'],
       'jobTitle'=>$u['jawatan']??'','isAdmin'=>(bool)$u['pentadbir'],'canManageAbsence'=>(bool)$u['pentadbir']||($u['kategori']==='Pengurusan'),
       'lateAfter'=>$u['waktulewat']??'','maxPunchIn'=>$u['maksmasuk']??'',
       'punchOutFrom'=>$u['waktubalik']??'','s1In'=>$u['sesi1masuk']??'','s1Out'=>$u['sesi1keluar']??'',
       's2In'=>$u['sesi2masuk']??'','s2Out'=>$u['sesi2keluar']??'',
       'note'=>$u['catatan']??'','pinSet'=>(bool)$auth,'passwordSet'=>(bool)$auth,
       'mustChangePassword'=>!$auth || (bool)($auth['must_change_pin']??false),'isLocked'=>false,'lockedUntil'=>'',
       'hasProfilePhoto'=>false,'authType'=>$auth?'PHP_PIN_V1':'UNPROVISIONED','sessionVersion'=>1];
}
function settings_raw(): array {
    $defaults=['SCHOOL_NAME'=>'SMK Bandar Baru Sungai Lalang','SYSTEM_MODE'=>'REAL','RADIUS_M'=>'200',
     'MAX_GPS_ACCURACY_M'=>'120','DEFAULT_S1_IN'=>'07:30','DEFAULT_S1_OUT'=>'16:30','DEFAULT_MAX_PUNCH_IN'=>'10:00',
     'ALLOW_OPTIONAL_SECOND_SESSION'=>'TRUE','ABSENT_AFTER'=>'10:00','SYSTEM_START_DATE'=>'2026-01-01'];
    foreach (rows('SELECT kunci,nilai FROM tetapan') as $r) if ($r['kunci']) $defaults[$r['kunci']]=$r['nilai'];
    return $defaults;
}
function public_settings(array $s): array {
    $out=['schoolName'=>$s['SCHOOL_NAME']??'','schoolLat'=>$s['SCHOOL_LAT']??'','schoolLng'=>$s['SCHOOL_LNG']??'',
        'radiusM'=>(float)($s['RADIUS_M']??200),'maxGpsAccuracyM'=>(float)($s['MAX_GPS_ACCURACY_M']??120),
        'defaultS1In'=>$s['DEFAULT_S1_IN']??'07:30','defaultS1Out'=>$s['DEFAULT_S1_OUT']??'16:30',
        'defaultS2In'=>$s['DEFAULT_S2_IN']??'','defaultS2Out'=>$s['DEFAULT_S2_OUT']??'',
        'defaultLateAfter'=>$s['DEFAULT_LATE_AFTER']??($s['DEFAULT_S1_IN']??'07:30'),
        'defaultMaxPunchIn'=>$s['DEFAULT_MAX_PUNCH_IN']??'10:00',
        'defaultPunchOutFrom'=>$s['DEFAULT_PUNCH_OUT_FROM']??($s['DEFAULT_S1_OUT']??'16:30'),
        'allowOptionalSecondSession'=>$s['ALLOW_OPTIONAL_SECOND_SESSION']??'TRUE',
        'thursdayWbfEnabled'=>$s['THURSDAY_WBF_ENABLED']??'TRUE',
        'thursdayWbfInFrom'=>$s['THURSDAY_WBF_IN_FROM']??'07:30',
        'thursdayWbfInTo'=>$s['THURSDAY_WBF_IN_TO']??'09:00',
        'thursdayWbfOutFrom'=>$s['THURSDAY_WBF_OUT_FROM']??'15:00',
        'thursdayWbfOutTo'=>$s['THURSDAY_WBF_OUT_TO']??'16:30',
        'thursdayWbfDurationMinutes'=>(int)($s['THURSDAY_WBF_DURATION_MINUTES']??450),
        'absentAfter'=>$s['ABSENT_AFTER']??'10:00','workingDays'=>$s['WORKING_DAYS']??'SUN,MON,TUE,WED,THU',
        'systemMode'=>$s['SYSTEM_MODE']??'REAL','systemStartDate'=>$s['SYSTEM_START_DATE']??'2026-01-01',
        'ipTrackingEnabled'=>$s['IP_TRACKING_ENABLED']??'TRUE',
        'punchReminderEnabled'=>$s['PUNCH_REMINDER_ENABLED']??'FALSE',
        'punchReminderTime'=>$s['PUNCH_REMINDER_TIME']??'09:00'];
    return $out;
}
function schedule(array $u,array $s): array {
    $in=$u['sesi1masuk']?:($u['waktulewat']?:($s['DEFAULT_S1_IN']??'07:30'));
    $out=$u['sesi1keluar']?:($u['waktubalik']?:($s['DEFAULT_S1_OUT']??'16:30'));
    return ['s1In'=>$in,'s1Out'=>$out,'s2In'=>$u['sesi2masuk']?:($s['DEFAULT_S2_IN']??''),
      's2Out'=>$u['sesi2keluar']?:($s['DEFAULT_S2_OUT']??''),
      'maxPunchIn'=>$u['maksmasuk']?:($s['DEFAULT_MAX_PUNCH_IN']??'10:00'),
      'allowSecondSession'=>strtoupper((string)($s['ALLOW_OPTIONAL_SECOND_SESSION']??'TRUE'))!=='FALSE',
      'lateAfter'=>$in,'punchOutFrom'=>$out];
}
function attendance_row(string $email,string $date): ?array {
    return one('SELECT * FROM kehadiran WHERE emel=? AND tarikh=? ORDER BY _row_id DESC LIMIT 1',[$email,$date]);
}
function attendance_public(?array $r,array $schedule): ?array {
    if (!$r) return null;
    $t1=time_text($r['masuk']??'');$t2=time_text($r['balik']??'');
    $t3=time_text($r['masuk2']??'');$t4=time_text($r['balik2']??'');
    $second=$schedule['allowSecondSession']||$schedule['s2In']||$schedule['s2Out'];
    $next=!$t1?['type'=>'IN','session'=>1,'complete'=>false]:(!$t2?['type'=>'OUT','session'=>1,'complete'=>false]:
      (!$second?['type'=>'','session'=>1,'complete'=>true]:(!$t3?['type'=>'IN','session'=>2,'complete'=>false,'optional'=>true]:
      (!$t4?['type'=>'OUT','session'=>2,'complete'=>false]:['type'=>'','session'=>2,'complete'=>true]))));
    return ['date'=>$r['tarikh'],'inTime'=>$t1,'outTime'=>$t2,'inTime2'=>$t3,'outTime2'=>$t4,
       'status'=>$r['status']??'','statusFlags'=>array_values(array_filter(explode('|',(string)($r['statuswaktu']??'')))),
       'inDistanceM'=>$r['masukjarakm']??null,'outDistanceM'=>$r['balikjarakm']??null,
       'inDistanceM2'=>$r['masuk2jarakm']??null,'outDistanceM2'=>$r['balik2jarakm']??null,
       'inIp'=>$r['masukip']??'','outIp'=>$r['balikip']??'','inIp2'=>$r['masuk2ip']??'','outIp2'=>$r['balik2ip']??'',
       'ipCheck'=>$r['ipsemakan']??'','source'=>$r['sumber']??'','nextRecord'=>$next];
}
function bootstrap(array $u): array {
    $s=settings_raw();$p=public_settings($s);
    return ['today'=>today(),'now'=>now_myt(),'user'=>public_user($u),'settings'=>$p,
        'schedule'=>schedule($u,$s),
        'locationReady'=>(strtoupper((string)($s['SYSTEM_MODE']??'REAL'))==='TEST'||($p['schoolLat']!==''&&$p['schoolLng']!=='')),
        'attendance'=>attendance_public(attendance_row((string)$u['emel'],today()),schedule($u,$s))];
}
function require_user($token,bool $admin=false,bool $enforcePinChange=true): array {
    $hash=hash('sha256',(string)$token);
    $sess=one('SELECT email,expires_at FROM web_sessions WHERE token_hash=? AND expires_at>UTC_TIMESTAMP()',[$hash]);
    if (!$sess) throw new RuntimeException('Sesi tamat. Sila log masuk semula.');
    $u=user_by_email((string)$sess['email']);
    if (!$u) throw new RuntimeException('Akaun tidak aktif.');
    if ($admin && !(bool)$u['pentadbir']) throw new RuntimeException('Akses pentadbir tidak dibenarkan.');
    if ($enforcePinChange) {
        $auth=one('SELECT must_change_pin FROM web_auth WHERE email=?',[(string)$u['emel']]);
        if (!$auth || (bool)$auth['must_change_pin']) throw new RuntimeException('PIN sementara mesti ditukar dahulu. Tekan Tukar PIN.');
    }
    return $u;
}
function create_session(array $u): array {
    $token=bin2hex(random_bytes(32));
    execute_sql('INSERT INTO web_sessions (token_hash,email,expires_at,created_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 DAY),UTC_TIMESTAMP())',
        [hash('sha256',$token),$u['emel']]);
    return ['ok'=>true,'token'=>$token,'deviceToken'=>$token,'remember'=>true,'boot'=>bootstrap($u)];
}
function audit_event(string $actor,string $action,string $target,string $detail=''): void {
    try { $row=one('SELECT COALESCE(MAX(_source_row),1)+1 AS n FROM audit');
      execute_sql('INSERT INTO audit (_source_row,masa,pelaku,tindakan,sasaran,butiran) VALUES (?,?,?,?,?,?)',
        [(int)$row['n'],now_myt(),$actor,$action,$target,substr($detail,0,500)]); } catch(Throwable $ignored) {}
}
function must_admin(array $u): void {
    if (!(bool)$u['pentadbir']) throw new RuntimeException('Akses pentadbir tidak dibenarkan.');
}
