<?php
declare(strict_types=1);
// Include dependencies inside the try block below, so any broken
// uploaded PHP library or config does not produce a raw HTML 500 page.
ini_set('display_errors', '0');
ini_set('log_errors', '1');
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false,'error'=>'POST sahaja']); exit; }
if (stripos((string)($_SERVER['CONTENT_TYPE']??''),'application/json')===false) {
    http_response_code(415); echo json_encode(['ok'=>false,'error'=>'JSON required']); exit;
}
$origin=$_SERVER['HTTP_ORIGIN']??'';
if ($origin && parse_url($origin,PHP_URL_HOST)!==($_SERVER['HTTP_HOST']??'')) {
    http_response_code(403); echo json_encode(['ok'=>false,'error'=>'Origin denied']); exit;
}
try {
    // Load only core MySQL code on login. Workspace may be unavailable,
    // so Drive/PDF integration must never interrupt authentication.
    require_once __DIR__.'/_lib.php';
    $input=json_decode((string)file_get_contents('php://input'),true,128,JSON_THROW_ON_ERROR);
    if (!is_array($input)||!is_string($input['fn']??null)||!is_array($input['args']??null)) throw new InvalidArgumentException('Request tidak sah.');
    $result=rpc($input['fn'],$input['args']);
    echo json_encode(['ok'=>true,'result'=>$result],JSON_INVALID_UTF8_SUBSTITUTE|JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    // Give actionable DB error categories without returning credentials, SQL or PII.
    $safe=$e instanceof PDOException ? database_public_error($e) : $e->getMessage();
    $reference = strtoupper(bin2hex(random_bytes(4)));
    $isBootstrap = $e instanceof ParseError || $e instanceof Error;
    if ($isBootstrap) {
        $safe = 'Ralat PHP pada hosting. Semak cPanel > Metrics > Errors atau error_log. Rujukan: ' . $reference;
    }
    http_response_code($isBootstrap ? 500 : ($e instanceof InvalidArgumentException?400:422));
    error_log('[eKeberadaan API '.$reference.'] '.get_class($e).' at '.$e->getFile().':'.$e->getLine().' - '.$e->getMessage());
    echo json_encode(['ok'=>false,'error'=>$safe],JSON_INVALID_UTF8_SUBSTITUTE|JSON_UNESCAPED_UNICODE);
}
function rpc(string $fn,array $a) {
    // Workspace functions are isolated to Workspace requests only.
    // They are never imported for DELIMa account lookup/login.
    if (in_array($fn,[
        'getProfilePhoto','adminSyncProfilePhotos',
        'generatePublicAbsencePresencePdf','generateAbsencePresencePdf',
        'generateTimeReviewPdf','generateAttendancePresenceReportPdf',
        'generateAttendancePresenceReportSheet','generateReportSheet'
    ],true)) require_once __DIR__.'/workspace_services.php';
    switch($fn) {
      case 'getApiStatus':
        // Does not require a MySQL connection or Workspace bridge.
        return ['healthy'=>true,'backend'=>'PHP','mysqlRequired'=>false];
      case 'syncClientTelemetry':
        // Optional browser telemetry must never block user interaction.
        require_user($a[0]??'',false,false);
        return ['ok'=>true];
      case 'setFirstPin':
        throw new RuntimeException('Akaun dipindahkan dari Google Sheets. Gunakan PIN lama atau minta reset PIN sementara daripada Pentadbir Sistem.');
      case 'getLoginPageData':
        $s=settings_raw();
        return ['schoolName'=>$s['SCHOOL_NAME']??'e-Keberadaan','mode'=>'delima-email-pin','pinLength'=>6,'sessionDays'=>30];
      case 'checkDelimaAccount':
        $u=user_by_email(email_key($a[0]??''));
        if (!$u) throw new RuntimeException('Akaun tidak didaftarkan atau tidak aktif.');
        $pu=public_user($u);
        return ['ok'=>true,'user'=>['name'=>$pu['name'],'email'=>$pu['email'],'category'=>$pu['category'],'jobTitle'=>$pu['jobTitle']],
          'pinReady'=>$pu['pinSet'],'directPinSetup'=>false,'changeTicket'=>'','setupPurpose'=>'',
          'message'=>$pu['pinSet']?'':'Rekod PIN tidak dijumpai. Hubungi Pentadbir Sistem.'];
      case 'loginWithPin':
        $email=email_key($a[0]??'');$pin=(string)($a[1]??'');
        if (!preg_match('/^\d{6}$/',$pin)) throw new RuntimeException('Masukkan PIN 6 digit.');
        $u=user_by_email($email);
        if (!$u) throw new RuntimeException('Emel atau PIN tidak tepat.');
        $auth=one('SELECT * FROM web_auth WHERE email=?',[$email]);
        if (!$auth) {
            // Transparent first-login migration of already imported PIN_V1 credentials.
            // This requires the original Apps Script pepper in private server config.
            legacy_pin_migrate($pin,$u);
            $auth=one('SELECT * FROM web_auth WHERE email=?',[$email]);
            if (!$auth) throw new RuntimeException('Gagal menyegerakkan PIN ke MySQL. Cuba lagi.');
            audit_event($email,'MIGRASI_PIN_GOOGLE_SHEETS',$email,'Hash PIN ditukar kepada format PHP selepas disahkan.');
        } else {
            // Once a PHP PIN exists, never fall back to the old Sheets hash:
            // admin reset / self-change must permanently invalidate the old PIN.
            if ($auth['locked_until'] && strtotime($auth['locked_until']) > time())
                throw new RuntimeException('Terlalu banyak percubaan. Cuba lagi selepas 15 minit.');
            if (!password_verify($pin,$auth['pin_hash'])) {
                execute_sql('UPDATE web_auth SET attempts=attempts+1,locked_until=IF(attempts>=4,DATE_ADD(NOW(),INTERVAL 15 MINUTE),NULL) WHERE email=?',[$email]);
                throw new RuntimeException('Emel atau PIN tidak tepat.');
            }
            execute_sql('UPDATE web_auth SET attempts=0,locked_until=NULL WHERE email=?',[$email]);
        }
        audit_event($email,'LOGIN_APLIKASI',$email,'PHP MySQL');
        return create_session($u);
      case 'resumeSession':
        $u=require_user($a[0]??'',false,false);return ['ok'=>true,'token'=>$a[0],'deviceToken'=>$a[0],'remember'=>true,'boot'=>bootstrap($u)];
      case 'resumeTrustedDevice':
        $u=require_user($a[0]??'',false,false);return ['ok'=>true,'token'=>$a[0],'deviceToken'=>$a[0],'remember'=>true,'boot'=>bootstrap($u)];
      case 'logoutApp':
        execute_sql('DELETE FROM web_sessions WHERE token_hash=?',[hash('sha256',(string)($a[0]??''))]);return ['ok'=>true];
      case 'getBootstrapData':
        return bootstrap(require_user($a[0]??''));
      case 'getProfilePhoto':
        return workspace_user_photo(require_user($a[0]??''),(string)($a[1]??''));
      case 'punch':
        return punch_mysql(require_user($a[0]??''),(string)($a[1]??''),$a[2]??null);
      case 'adminSyncProfilePhotos':
        return workspace_sync_photos(require_user($a[0]??'',true));
      case 'generatePublicAbsencePresencePdf':
      case 'generateAbsencePresencePdf':
      case 'generateTimeReviewPdf':
      case 'generateAttendancePresenceReportPdf':
      case 'generateAttendancePresenceReportSheet':
      case 'generateReportSheet':
        return workspace_report(require_user($a[0]??''),$fn,$a[1]??[]);
      case 'getMyPunchCardMonth':
        return punch_card(require_user($a[0]??''),(string)($a[1]??''));
      case 'adminGetPunchCardMonth':
        require_user($a[0]??'',true);
        $u=user_by_email(email_key($a[1]??''),false);
        if (!$u) throw new RuntimeException('Pengguna tidak dijumpai.');
        return punch_card($u,(string)($a[2]??''));
      case 'getAdminData':
        return admin_data(require_user($a[0]??'',true),(string)($a[1]??today()));
      case 'getAbsenceData':
        return absence_data(require_user($a[0]??''));
      case 'getPublicAbsencePresenceData':
        require_user($a[0]??'');return public_absences((string)($a[1]??today()),(string)($a[2]??today()));
      case 'getAbsenceManagementData':
        $u=require_user($a[0]??''); if (!$u['pentadbir'] && $u['kategori']!=='Pengurusan') throw new RuntimeException('Tiada kebenaran.');
        return management_absences($u,(string)($a[1]??today()),(string)($a[2]??today()));
      case 'submitAbsenceRequest':
        return submit_absence(require_user($a[0]??''),is_array($a[1]??null)?$a[1]:[]);
      case 'cancelMyAbsenceRequest':
        $u=require_user($a[0]??'');
        $n=execute_sql("UPDATE tidak_hadir SET status='DIBATALKAN',dikemaskinipada=? WHERE id=? AND emel=? AND status='MENUNGGU'",
          [excel_number(now_myt()),(string)($a[1]??''),$u['emel']]);
        if (!$n) throw new RuntimeException('Permohonan tidak dijumpai atau sudah diproses.');
        audit_event($u['emel'],'BATAL_TIDAK_HADIR',(string)($a[1]??''));return ['ok'=>true];
      case 'reviewAbsenceRequest':
        $u=require_user($a[0]??'');if (!$u['pentadbir'] && $u['kategori']!=='Pengurusan') throw new RuntimeException('Tiada kebenaran.');
        $id=(string)($a[1]??'');$d=(string)($a[2]??'');
        if (!in_array($d,['DILULUSKAN','DITOLAK'],true)) throw new InvalidArgumentException('Keputusan tidak sah.');
        $n=execute_sql("UPDATE tidak_hadir SET status=?,disemakoleh=?,disemakpada=?,ulasanpengetua=?,dikemaskinipada=? WHERE id=? AND status='MENUNGGU'",
            [$d,$u['emel'],excel_number(now_myt()),substr((string)($a[3]??''),0,125),excel_number(now_myt()),$id]);
        if (!$n) throw new RuntimeException('Permohonan tidak dijumpai atau sudah diproses.');
        audit_event($u['emel'],'SEMAK_TIDAK_HADIR',$id,$d);
        return ['ok'=>true,'status'=>$d];
      case 'getTimeReviewData':
        require_user($a[0]??'',true);return time_reviews((string)($a[1]??today()),(string)($a[2]??today()));
      case 'reviewTimeException':
        $u=require_user($a[0]??'',true);
        $d=(string)($a[2]??'');
        if (!in_array($d,['DIAMBIL MAKLUM','DITOLAK'],true)) throw new InvalidArgumentException('Keputusan tidak sah.');
        $n=execute_sql('UPDATE semakan_waktu SET statussemakan=?,disemakoleh=?,namapelulus=?,disemakpada=?,ulasan=? WHERE id=?',
          [$d,$u['emel'],$u['nama'],excel_number(now_myt()),substr((string)($a[3]??''),0,125),(string)($a[1]??'')]);
        if (!$n) throw new RuntimeException('Rekod semakan tidak dijumpai.');
        return ['ok'=>true,'status'=>$d,'reviewerName'=>$u['nama'],'reviewedAt'=>now_myt()];
      case 'adminSaveAttendance':
        return admin_save_attendance(require_user($a[0]??'',true),is_array($a[1]??null)?$a[1]:[]);
      case 'adminSaveUser':
        return admin_save_user(require_user($a[0]??'',true),is_array($a[1]??null)?$a[1]:[]);
      case 'adminSaveSettings':
        return admin_save_settings(require_user($a[0]??'',true),is_array($a[1]??null)?$a[1]:[]);
      case 'adminUnlockUser':
        require_user($a[0]??'',true);
        execute_sql('UPDATE web_auth SET attempts=0,locked_until=NULL WHERE email=?',[email_key($a[1]??'')]);return ['ok'=>true];
      case 'adminListTrustedDevices':
        require_user($a[0]??'',true);
        $email=email_key($a[1]??'');$u=user_by_email($email,false);
        if (!$u) throw new RuntimeException('Pengguna tidak dijumpai.');
        $devices=rows('SELECT token_hash,created_at,expires_at FROM web_sessions WHERE email=? AND expires_at>UTC_TIMESTAMP()',[$email]);
        return ['ok'=>true,'user'=>public_user($u),'devices'=>array_map(
            fn($r)=>['deviceId'=>$r['token_hash'],'createdAt'=>$r['created_at'],'lastSeen'=>$r['created_at'],
             'expiresAt'=>$r['expires_at'],'active'=>true,'deviceName'=>'PHP MySQL Session'], $devices)];
      case 'adminRevokeTrustedDevice':
        require_user($a[0]??'',true);
        execute_sql('DELETE FROM web_sessions WHERE token_hash=?',[(string)($a[1]??'')]);return ['ok'=>true];
      case 'adminRevokeAllTrustedDevices':
        require_user($a[0]??'',true);
        $n=execute_sql('DELETE FROM web_sessions WHERE email=?',[email_key($a[1]??'')]);return ['ok'=>true,'count'=>$n];
      case 'changePin':
        $token=(string)($a[0]??'');
        $u=require_user($token,false,false);
        $oldPin=(string)($a[1]??'');$newPin=(string)($a[2]??'');$confirm=(string)($a[3]??'');
        if (!preg_match('/^\d{6}$/',$oldPin) || !preg_match('/^\d{6}$/',$newPin) ||
            !hash_equals($newPin,$confirm) || hash_equals($oldPin,$newPin))
            throw new InvalidArgumentException('PIN baharu mesti 6 digit, sepadan dan berbeza daripada PIN lama.');
        $auth=one('SELECT pin_hash,locked_until FROM web_auth WHERE email=?',[$u['emel']]);
        if (!$auth || ($auth['locked_until'] && strtotime($auth['locked_until'])>time()))
            throw new RuntimeException('Akaun sedang dikunci atau belum diaktifkan.');
        if (!password_verify($oldPin,$auth['pin_hash'])) {
            execute_sql('UPDATE web_auth SET attempts=attempts+1,locked_until=IF(attempts>=4,DATE_ADD(NOW(), INTERVAL 15 MINUTE),NULL) WHERE email=?',[$u['emel']]);
            throw new RuntimeException('PIN lama tidak tepat.');
        }
        execute_sql('UPDATE web_auth SET pin_hash=?,must_change_pin=0,attempts=0,locked_until=NULL WHERE email=?',
            [password_hash($newPin,PASSWORD_DEFAULT),$u['emel']]);
        execute_sql('DELETE FROM web_sessions WHERE email=? AND token_hash<>?',
            [$u['emel'],hash('sha256',$token)]);
        audit_event($u['emel'],'TUKAR_PIN',$u['emel']);
        return ['ok'=>true,'message'=>'PIN berjaya ditukar. Sesi peranti lain telah dibatalkan.','boot'=>bootstrap($u)];
      case 'adminResetPassword':
        $admin=require_user($a[0]??'',true);
        return issue_temp_pin($admin,email_key($a[1]??''));
      case 'adminBulkResetPasswords':
        $admin=require_user($a[0]??'',true);
        $emails=is_array($a[1]??null)?$a[1]:[];
        if (!count($emails)||count($emails)>150)throw new InvalidArgumentException('Pilih 1 hingga 150 pengguna.');
        $results=[];
        foreach(array_unique(array_map('strtolower',$emails)) as $mail) {
            $email=email_key($mail);
            if ($email===$admin['emel']) continue;
            if (user_by_email($email,false)) $results[]=issue_temp_pin($admin,$email);
        }
        return ['ok'=>true,'results'=>$results];
      default:
        if (in_array($fn,['adminRepairAttendanceDuplicates'],true)) {
            require_user($a[0]??'',true);
            throw new RuntimeException('Fungsi eksport / penyelenggaraan ini belum dimigrasi kepada PHP.');
        }
        throw new RuntimeException('Fungsi API tidak disokong: '.$fn);
    }
}
function absence_types(): array {
    return ['CUTI REHAT KHAS','CUTI REHAT','CUTI SAKIT (AWAM)','CUTI SAKIT (SWASTA)',
     'CUTI TANPA REKOD KELOMPOK','KURSUS','BENGKEL','TAKLIMAT','MESYUARAT',
     'SEMINAR','AKTIVITI KOKURIKULUM','AKTIVITI SUKAN/PERMAINAN','LAIN-LAIN'];
}
function presence_types(): array {
    return ['PROGRAM DALAMAN SEKOLAH - KEBERADAAN','URUSAN PERIBADI (MASUK LEWAT) - KEBERADAAN',
      'MESYUARAT DALAM SEKOLAH - KEBERADAAN','BENGKEL/KURSUS/SEMINAR (PPD)',
      'BENGKEL/KURSUS/SEMINAR (JPN)','BENGKEL/KURSUS/SEMINAR (KPM)',
      'MESYUARAT/TAKLIMAT (PPD)','MESYUARAT/TAKLIMAT (JPN)','MESYUARAT/TAKLIMAT (KPM)','LAIN-LAIN - KEBERADAAN'];
}
function distance_m(float $a,float $b,float $c,float $d): float {
    $r=6371000;$p1=deg2rad($a);$p2=deg2rad($c);$dp=deg2rad($c-$a);$dl=deg2rad($d-$b);
    $x=sin($dp/2)**2+cos($p1)*cos($p2)*sin($dl/2)**2;
    return $r*2*atan2(sqrt($x),sqrt(1-$x));
}
function punch_mysql(array $u,string $type,$location): array {
    $type=strtoupper($type); if (!in_array($type,['IN','OUT'],true)) throw new InvalidArgumentException('Jenis rekod tidak sah.');
    $s=settings_raw();$sch=schedule($u,$s);$test=strtoupper((string)($s['SYSTEM_MODE']??'REAL'))==='TEST';
    $lat=null;$lng=null;$accuracy=null;$distance=0;
    if (!$test) {
        if (!isset($location['lat'],$location['lng'],$location['accuracy'])||empty($s['SCHOOL_LAT'])||empty($s['SCHOOL_LNG']))
            throw new RuntimeException('Lokasi sekolah / GPS belum ditetapkan.');
        $lat=(float)$location['lat'];$lng=(float)$location['lng'];$accuracy=(float)$location['accuracy'];
        if ($accuracy<0||$accuracy>(float)($s['MAX_GPS_ACCURACY_M']??120)) throw new RuntimeException('Ketepatan GPS tidak mencukupi.');
        if (abs($lat)>90||abs($lng)>180) throw new RuntimeException('Koordinat GPS tidak sah.');
        $distance=(int)round(distance_m($lat,$lng,(float)$s['SCHOOL_LAT'],(float)$s['SCHOOL_LNG']));
        if ($distance>(float)($s['RADIUS_M']??200)) throw new RuntimeException('Anda berada di luar radius sekolah.');
    }
    $email=(string)$u['emel'];$date=today();$ip=(string)($_SERVER['REMOTE_ADDR']??'');
    $lock='ek_punch_'.hash('sha256',$email.'|'.$date);
    $got=one('SELECT GET_LOCK(?,5) AS locked',[$lock]);
    if ((int)($got['locked']??0)!==1) throw new RuntimeException('Rekod sedang diproses. Cuba lagi.');
    try {
        db()->beginTransaction();
        $r=attendance_row($email,$date);
        $step=$r?attendance_public($r,$sch)['nextRecord']:['type'=>'IN','session'=>1,'complete'=>false];
        if ($step['complete']||$step['type']!==$type) throw new RuntimeException('Turutan masuk/keluar tidak sah. Muat semula rekod.');
        $n=(int)$step['session'];$now=now_myt();$excel=excel_number($now);
        if (!$r) {
            $sr=one('SELECT COALESCE(MAX(_source_row),1)+1 AS n FROM kehadiran');
            execute_sql("INSERT INTO kehadiran (_source_row,tarikh,emel,nama,kategori,masuk,masuklat,masuklng,masukjarakm,masukakurasim,masukip,status,sumber,dikemaskinipada) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
              [(int)$sr['n'],$date,$email,$u['nama'],$u['kategori'],$now,$lat,$lng,$distance,$accuracy,$ip,'HADIR','PHP_MYSQL',$excel]);
        } else {
            $col=$n===1?($type==='IN'?'masuk':'balik'):($type==='IN'?'masuk2':'balik2');
            $suffix=$n===1?($type==='IN'?'masuk':'balik'):($type==='IN'?'masuk2':'balik2');
            $value=$n===1?$now:$excel;
            execute_sql("UPDATE kehadiran SET $col=?,{$suffix}lat=?,{$suffix}lng=?,{$suffix}jarakm=?,{$suffix}akurasim=?,{$suffix}ip=?,dikemaskinipada=? WHERE _row_id=?",
              [$value,$lat,$lng,$distance,$accuracy,$ip,$excel,$r['_row_id']]);
        }
        $updated=attendance_row($email,$date);
        $flags=[];$in=time_text($updated['masuk']??'');$out=time_text($updated['balik']??'');
        if ($in && $in>($sch['s1In']??'07:30')) $flags[]='LEWAT';
        if ($out && $out<($sch['s1Out']??'16:30')) $flags[]='BALIK AWAL';
        $status=implode(' / ',$flags)?:'HADIR';
        execute_sql('UPDATE kehadiran SET status=?,statuswaktu=? WHERE _row_id=?',
          [$status,implode('|',$flags),$updated['_row_id']]);
        db()->commit();
        audit_event($email,'RAKAM_WAKTU',$date,$type.' sesi '.$n);
        return ['ok'=>true,'attendance'=>attendance_public(attendance_row($email,$date),$sch),
           'ip'=>$ip,'distanceM'=>$distance,'ipWarning'=>'','message'=>'Rekod waktu berjaya disimpan.'];
    } catch(Throwable $e) { if(db()->inTransaction())db()->rollBack(); throw $e; }
    finally { one('SELECT RELEASE_LOCK(?) AS released',[$lock]); }
}
/**
 * MySQL counterpart of refactor/performance-v2:
 * apps-script/20_UserApi.gs buildPunchCardMonthForUser_.
 * The original workbook's Sesi 1 DATETIME and Sesi 2 Excel serial columns
 * are normalized by time_text(). All calendar/read overlays remain read-only.
 */
function punch_card(array $u,string $month): array {
    if ($month==='') $month=substr(today(),0,7);
    if (!preg_match('/^(20\d\d|21\d\d)-(0[1-9]|1[0-2])$/',$month))
        throw new InvalidArgumentException('Bulan tidak sah.');
    $start=$month.'-01';
    $days=(int)(new DateTimeImmutable($start))->format('t');
    $end=$month.'-'.str_pad((string)$days,2,'0',STR_PAD_LEFT);
    $s=settings_raw();
    $systemStart=date_key($s['SYSTEM_START_DATE']??'2026-01-01');
    if (!$systemStart) $systemStart='2026-01-01';
    $sch=schedule($u,$s);
    $att=rows('SELECT * FROM kehadiran WHERE LOWER(emel)=? AND tarikh BETWEEN ? AND ? ORDER BY tarikh,_row_id',
        [strtolower((string)$u['emel']),$start,$end]);
    $byDay=[];
    foreach($att as $x) {
        $date=date_key($x['tarikh']??'');
        if ($date<$systemStart || $date<$start || $date>$end) continue;
        $day=(int)substr($date,8,2);
        $p=attendance_public($x,$sch);
        $in=$p['inTime'];$out=$p['outTime'];$in2=$p['inTime2'];$out2=$p['outTime2'];
        $flagText=strtoupper(trim((string)($x['statuswaktu']??'')));
        $storedStatus=strtoupper(trim((string)($x['status']??'')));
        $flags=[];
        foreach(['LEWAT','BALIK AWAL'] as $flag) {
            if ((strpos($flagText,$flag)!==false)||(strpos($storedStatus,$flag)!==false)) $flags[]=$flag;
        }
        $status=$storedStatus==='TIDAK HADIR'?'TIDAK HADIR':
            ($in? (count($flags)?implode(' / ',$flags):'HADIR'):$storedStatus);
        $source=strtoupper(trim((string)($x['sumber']??'')));
        $editRaw=trim((string)($x['extra_aj']??''));
        $edited=$editRaw?array_values(array_intersect(
            array_map('trim',explode(',',strtoupper($editRaw))),['IN','OUT','IN2','OUT2'])):[];
        if (!$editRaw&&$source==='ADMIN') {
            if ($in) $edited[]='IN';
            if ($out) $edited[]='OUT';
            if ($in2) $edited[]='IN2';
            if ($out2) $edited[]='OUT2';
        }
        $byDay[$day]=['day'=>$day,'date'=>$date,'status'=>$status,
            'inTime'=>$in,'outTime'=>$out,'inTime2'=>$in2,'outTime2'=>$out2,
            'statusFlags'=>$flags,'source'=>(string)($x['sumber']??''),
            'editedBy'=>(string)($x['disuntingoleh']??''),
            'reason'=>(string)($x['sebabedit']??''),
            'adminEditedFields'=>$edited,'adminEditMetadataKnown'=>$editRaw!=='',
            'reviewState'=>'','reviewItems'=>[]];
    }
    // Refactor/performance-v2 overlays public holidays and configured weekends,
    // but never hides actual staff punches.
    $weekdays=array_filter(array_map('trim',explode(',',strtoupper((string)($s['WORKING_DAYS']??'SUN,MON,TUE,WED,THU')))));
    $weekDays=array_fill_keys($weekdays,true);
    $holidayRows=rows('SELECT tarikh,nama,jenis,sumber FROM cuti_umum WHERE tarikh BETWEEN ? AND ? AND (aktif=1 OR aktif IS NULL)',
        [$start,$end]);
    $holidays=[];
    foreach($holidayRows as $h) $holidays[date_key($h['tarikh'])]=$h;
    $isRecorded=static fn($row)=>!empty($row['inTime'])||!empty($row['outTime'])||!empty($row['inTime2'])||!empty($row['outTime2']);
    $empty=static fn($day,$date)=>[
        'day'=>$day,'date'=>$date,'status'=>'','inTime'=>'','outTime'=>'',
        'inTime2'=>'','outTime2'=>'','statusFlags'=>[],'source'=>'','editedBy'=>'',
        'reason'=>'','adminEditedFields'=>[],'adminEditMetadataKnown'=>false,'reviewState'=>'','reviewItems'=>[]
    ];
    for($day=1;$day<=$days;$day++) {
        $date=$month.'-'.str_pad((string)$day,2,'0',STR_PAD_LEFT);
        if ($date<$systemStart) continue;
        $row=$byDay[$day]??$empty($day,$date);
        if ($isRecorded($row)) continue;
        $holiday=$holidays[$date]??null;
        if ($holiday) {
            $row['status']='PUBLIC_HOLIDAY';$row['source']='CUTI_UMUM';
            $row['reason']=(string)($holiday['nama']??'CUTI UMUM');
            $row['holiday']=['date'=>$date,'name'=>$row['reason'],'type'=>$holiday['jenis']??''];
            $row['editedBy']='SISTEM';$byDay[$day]=$row;continue;
        }
        $weekday=strtoupper(date('D',strtotime($date)));
        if (!isset($weekDays[$weekday])) {
            $row['status']='WEEKEND';$row['source']='WEEKEND';
            $row['reason']=$weekday==='FRI'?'JUMAAT':($weekday==='SAT'?'SABTU':'CUTI');
            $row['editedBy']='SISTEM';$byDay[$day]=$row;
        }
    }

    $abs=rows('SELECT * FROM tidak_hadir WHERE LOWER(emel)=? AND tarikhmula<=? AND tarikhakhir>=? ORDER BY _row_id DESC',
        [strtolower((string)$u['emel']),(int)excel_number($end),(int)excel_number($start)]);
    $absence=[];$presence=[];
    foreach($abs as $row) {
        $status=strtoupper(trim((string)($row['status']??'')));
        if (!in_array($status,['MENUNGGU','DILULUSKAN'],true))continue;
        $mode=strtoupper(trim((string)($row['mod']??'')))==='KEBERADAAN'?'KEBERADAAN':'TIDAK_HADIR';
        $from=date_key($row['tarikhmula']);$to=date_key($row['tarikhakhir']);
        if($from>$end||$to<$start)continue;
        $item=['from'=>$from,'to'=>$to,'type'=>(string)$row['jenis'],'status'=>$status,
           'reviewedBy'=>$row['disemakoleh']??'','note'=>$row['catatan']??'',
           'startTime'=>time_text($row['masamula']??''),'endTime'=>time_text($row['masaakhir']??'')];
        if($mode==='KEBERADAAN')$presence[]=$item;else $absence[]=$item;
    }
    $today=today();$now=time_text(now_myt());$absentAfter=time_text($s['ABSENT_AFTER']??'10:00');
    for($day=1;$day<=$days;$day++){
        $date=$month.'-'.str_pad((string)$day,2,'0',STR_PAD_LEFT);
        if($date<$systemStart||$date>$today)continue;
        $weekday=strtoupper(date('D',strtotime($date)));
        if(!isset($weekDays[$weekday]))continue;
        $row=$byDay[$day]??$empty($day,$date);
        if(in_array($row['status'],['PUBLIC_HOLIDAY','WEEKEND'],true))continue;
        $presenceReq=null;$absenceReq=null;
        foreach($presence as $x)if($x['from']<=$date&&$x['to']>=$date){$presenceReq=$x;break;}
        foreach($absence as $x)if($x['from']<=$date&&$x['to']>=$date){$absenceReq=$x;break;}
        if($presenceReq){
            // Latest branch enriches Kenyataan even when punched.
            $row['presenceType']=$presenceReq['type'];
            $row['reason']=$presenceReq['type'].' — Maklum from Pengetua';
        }
        if($isRecorded($row)||strtoupper((string)$row['status'])==='TIDAK HADIR') {
            $byDay[$day]=$row;continue;
        }
        if($presenceReq) {
            $row['status']='BELUM HADIR';$row['source']='KEBERADAAN';
            $row['editedBy']=$presenceReq['reviewedBy'];
            $byDay[$day]=$row;continue;
        }
        $due=$date<$today || ($date===$today&&($absentAfter===''||$now>=$absentAfter));
        if(!$absenceReq&&!$due)continue;
        $row['status']='TIDAK HADIR';
        $row['source']=$absenceReq?'TIDAK_HADIR':'AUTO_TIDAK_HADIR';
        $row['editedBy']=$absenceReq?($absenceReq['reviewedBy']?:'SISTEM'):'SISTEM';
        $row['reason']=$absenceReq?($absenceReq['type'].($absenceReq['status']==='MENUNGGU'?' — MENUNGGU KELULUSAN':'')):'TIADA PENJELASAN';
        $byDay[$day]=$row;
    }

    // Existing reviews are durable in semakan_waktu. Show accurate flags
    // and reviewers without rewriting source attendance records.
    $reviews=rows('SELECT * FROM semakan_waktu WHERE LOWER(emel)=? AND tarikh BETWEEN ? AND ? ORDER BY _row_id',
        [strtolower((string)$u['emel']),$start,$end]);
    $reviewByDate=[];
    foreach($reviews as $r) $reviewByDate[date_key($r['tarikh'])][]=$r;
    $reviewerCache=[];
    foreach($byDay as &$r){
        $reviewItems=[];
        foreach($reviewByDate[$r['date']]??[] as $rev) {
            $reviewer=strtolower((string)($rev['disemakoleh']??''));
            if(!array_key_exists($reviewer,$reviewerCache)) {
                $p=$reviewer!==''?user_by_email($reviewer,false):null;
                $reviewerCache[$reviewer]=$p?($p['jawatan']??''):'';
            }
            $reviewItems[]=[
                'type'=>strtoupper(trim((string)($rev['jenis']??''))),
                'session'=>(int)($rev['sesi']?:1),
                'reviewStatus'=>(string)($rev['statussemakan']??''),
                'reviewerJobTitle'=>$reviewerCache[$reviewer],
                'reviewedAt'=>date_key($rev['disemakpada']??''),
                'comment'=>(string)($rev['ulasan']??'')
            ];
        }
        $r['reviewItems']=$reviewItems;
        $statuses=array_filter(array_map(static fn($v)=>strtoupper(trim((string)$v['reviewStatus'])),$reviewItems));
        $r['reviewState']=$statuses?
            (in_array('DIAMBIL MAKLUM',$statuses,true)?'DIAMBIL MAKLUM':(in_array('DITOLAK',$statuses,true)?'DITOLAK':'BELUM DIAMBIL MAKLUM')):
            (count($r['statusFlags'])?'BELUM DIAMBIL MAKLUM':'');
    }
    unset($r);
    ksort($byDay,SORT_NUMERIC);
    return ['month'=>$month,'daysInMonth'=>$days,
      'cardNumber'=>str_pad((string)max(1,(int)($u['_source_row']??2)-1),3,'0',STR_PAD_LEFT),
      'schoolName'=>$s['SCHOOL_NAME']??'SMK Bandar Baru Sungai Lalang',
      'department'=>$s['SCHOOL_NAME']??'SMK Bandar Baru Sungai Lalang',
      'user'=>public_user($u),'records'=>array_values($byDay)];
}
function admin_data(array $admin,string $day): array {
    $day=valid_day($day);$us=rows('SELECT * FROM pengguna WHERE nama IS NOT NULL AND emel IS NOT NULL ORDER BY nama');
    $atts=rows('SELECT * FROM kehadiran WHERE tarikh=? ORDER BY _row_id',[$day]);
    $by=[];foreach($atts as $r)$by[strtolower((string)$r['emel'])]=$r;
    $requests=all_absence_rows();$report=[];$s=settings_raw();
    foreach($us as $u) {
        if (!(bool)$u['aktif']) continue;
        $p=attendance_public($by[strtolower((string)$u['emel'])]??null,schedule($u,$s));
        $absence=null;
        foreach($requests as $x) if ($x['email']===$u['emel'] && $x['startDate']<=$day&&$x['endDate']>=$day
           && $x['status']==='DILULUSKAN' && $x['mode']==='TIDAK_HADIR') {$absence=$x;break;}
        $status=$p['status']??($absence?'TIDAK HADIR':($day<today()?'TIDAK HADIR':'BELUM HADIR'));
        $report[]=['date'=>$day,'name'=>$u['nama'],'email'=>$u['emel'],'jobTitle'=>$u['jawatan']??'',
         'category'=>$u['kategori'],'status'=>$status,'inTime'=>$p['inTime']??'','outTime'=>$p['outTime']??'',
         'inTime2'=>$p['inTime2']??'','outTime2'=>$p['outTime2']??'','source'=>$p['source']??($absence?'TIDAK_HADIR':''),
         'reason'=>$absence['type']??'','editedBy'=>'','inIp'=>$p['inIp']??'','outIp'=>$p['outIp']??'',
         'inIp2'=>$p['inIp2']??'','outIp2'=>$p['outIp2']??'','ipCheck'=>$p['ipCheck']??''];
    }
    $sum=['total'=>count($report),'hadir'=>0,'lewat'=>0,'balikAwal'=>0,'tidakHadir'=>0,'belumHadir'=>0];
    foreach($report as $r) {
        $s=$r['status'];
        if ($s==='TIDAK HADIR')$sum['tidakHadir']++;
        elseif ($s==='BELUM HADIR')$sum['belumHadir']++;
        else {if ((strpos($s,'LEWAT')!==false))$sum['lewat']++;if ((strpos($s,'BALIK AWAL')!==false))$sum['balikAwal']++;
          if (!(strpos($s,'LEWAT')!==false)&&!(strpos($s,'BALIK AWAL')!==false))$sum['hadir']++;}
    }
    return ['date'=>$day,'admin'=>public_user($admin),'users'=>array_map('public_user',$us),
      'settings'=>public_settings(settings_raw()),'report'=>$report,'summary'=>$sum];
}
function all_absence_rows(): array {
    $list=rows('SELECT * FROM tidak_hadir ORDER BY _row_id DESC');
    return array_map(function($r){
        return ['id'=>$r['id'],'email'=>strtolower((string)$r['emel']),'name'=>$r['nama'],
        'category'=>$r['kategori'],'jobTitle'=>$r['jawatan']??'','type'=>$r['jenis'],
        'mode'=>$r['mod']?:'TIDAK_HADIR','startDate'=>date_key($r['tarikhmula']),
        'endDate'=>date_key($r['tarikhakhir']),'startTime'=>time_text($r['masamula']),
        'endTime'=>time_text($r['masaakhir']),'note'=>$r['catatan']??'',
        'status'=>$r['status'],'reviewedBy'=>$r['disemakoleh']??'','comment'=>$r['ulasanpengetua']??'',
        'submittedAt'=>$r['dihantarpada']?gmdate('Y-m-d H:i',((int)round(((float)$r['dihantarpada']-25569)*86400))):'',
        'reviewedAt'=>$r['disemakpada']?gmdate('Y-m-d H:i',((int)round(((float)$r['disemakpada']-25569)*86400))):''];
    },$list);
}
function absence_data(array $u): array {
    $own=array_values(array_filter(all_absence_rows(),fn($r)=>$r['email']===strtolower((string)$u['emel'])));
    $own=array_map(fn($r)=>array_intersect_key($r,array_flip(['id','type','mode','startDate','endDate','startTime','endTime','note','status','reviewedBy','reviewedAt','comment','submittedAt'])),$own);
    return ['types'=>absence_types(),'presenceTypes'=>presence_types(),'own'=>$own,
      'today'=>today(),'systemStartDate'=>settings_raw()['SYSTEM_START_DATE']??'2026-01-01'];
}
function public_absences(string $from,string $to): array {
    $from=valid_day($from);$to=valid_day($to);
    if ($from>$to || (strtotime($to)-strtotime($from))>366*86400) throw new InvalidArgumentException('Tempoh tidak sah.');
    $data=array_values(array_filter(all_absence_rows(),fn($r)=>$r['endDate']>=$from&&$r['startDate']<=$to&&in_array($r['status'],['MENUNGGU','DILULUSKAN'],true)));
    foreach($data as &$r){$r['startDate']=max($r['startDate'],$from);$r['endDate']=min($r['endDate'],$to);}unset($r);
    return ['fromDate'=>$from,'toDate'=>$to,'today'=>today(),'systemStartDate'=>settings_raw()['SYSTEM_START_DATE']??'2026-01-01','rows'=>$data];
}
function management_absences(array $u,string $from,string $to): array {
    $from=valid_day($from);$to=valid_day($to);if ($from>$to)throw new InvalidArgumentException('Tempoh tidak sah.');
    $data=array_values(array_filter(all_absence_rows(),fn($r)=>$r['endDate']>=$from&&$r['startDate']<=$to));
    return ['manager'=>public_user($u),'types'=>absence_types(),'presenceTypes'=>presence_types(),
      'fromDate'=>$from,'toDate'=>$to,'requests'=>$data];
}
function submit_absence(array $u,array $p): array {
    $start=valid_day((string)($p['startDate']??''));$end=valid_day((string)($p['endDate']??$start));
    if ($end<$start || strtotime($end)-strtotime($start)>366*86400) throw new InvalidArgumentException('Julat tarikh tidak sah.');
    $mode=(($p['mode']??'')==='KEBERADAAN')?'KEBERADAAN':'TIDAK_HADIR';
    $type=trim((string)($p['type']??''));
    if (!in_array($type,$mode==='KEBERADAAN'?presence_types():absence_types(),true)) throw new InvalidArgumentException('Jenis tidak sah.');
    $st=$mode==='KEBERADAAN'?valid_time($p['startTime']??''):'';
    $en=$mode==='KEBERADAAN'?valid_time($p['endTime']??''):'';
    if ($mode==='KEBERADAAN'&&(!$st||!$en||$st>=$en)) throw new InvalidArgumentException('Masa Keberadaan tidak sah.');
    $id='TH-'.strtoupper(bin2hex(random_bytes(8)));$now=excel_number(now_myt());
    $r=one('SELECT COALESCE(MAX(_source_row),1)+1 AS n FROM tidak_hadir');
    execute_sql('INSERT INTO tidak_hadir (_source_row,id,dihantarpada,emel,nama,kategori,jenis,tarikhmula,tarikhakhir,catatan,status,dikemaskinipada,mod,masamula,masaakhir,jawatan) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [(int)$r['n'],$id,$now,$u['emel'],$u['nama'],$u['kategori'],$type,(int)excel_number($start),(int)excel_number($end),
      substr((string)($p['note']??''),0,500),'MENUNGGU',$now,$mode,$st,$en,$u['jawatan']??'']);
    audit_event($u['emel'],'MOHON_TIDAK_HADIR',$id,$type);
    return ['ok'=>true,'id'=>$id,'message'=>'Permohonan berjaya dihantar.'];
}
function time_reviews(string $from,string $to): array {
    $from=valid_day($from);$to=valid_day($to);if ($from>$to)throw new InvalidArgumentException('Tempoh tidak sah.');
    $r=rows('SELECT * FROM semakan_waktu WHERE tarikh BETWEEN ? AND ? ORDER BY tarikh DESC',[$from,$to]);
    $data=array_map(fn($x)=>['id'=>$x['id'],'date'=>$x['tarikh'],'email'=>$x['emel'],'name'=>$x['nama'],
      'jobTitle'=>$x['jawatan']??'','category'=>$x['kategori'],'type'=>$x['jenis'],'session'=>$x['sesi'],
      'recordTime'=>time_text($x['wakturekod']),'referenceTime'=>time_text($x['wakturujukan']),
      'reviewStatus'=>$x['statussemakan']??'BELUM DIAMBIL MAKLUM','reviewerJobTitle'=>'',
      'reviewedAt'=>$x['disemakpada']?date_key($x['disemakpada']):'',
      'comment'=>$x['ulasan']??'','createdAt'=>$x['diciptapada']?date_key($x['diciptapada']):''],$r);
    return ['fromDate'=>$from,'toDate'=>$to,'rows'=>$data];
}
function admin_save_attendance(array $admin,array $p): array {
    $email=email_key($p['email']??'');$date=valid_day((string)($p['date']??''));
    $reason=trim((string)($p['reason']??''));if ($reason==='')throw new InvalidArgumentException('Sebab pembetulan wajib.');
    $u=user_by_email($email,false);if (!$u)throw new RuntimeException('Pengguna tidak dijumpai.');
    $in=valid_time($p['inTime']??'');$out=valid_time($p['outTime']??'');
    $in2=valid_time($p['inTime2']??'');$out2=valid_time($p['outTime2']??'');
    if (($out&&!$in)||($in2&&!$out)||($out2&&!$in2))throw new InvalidArgumentException('Turutan masa tidak sah.');
    $r=attendance_row($email,$date);
    if (!$r) {
        $n=one('SELECT COALESCE(MAX(_source_row),1)+1 AS n FROM kehadiran');
        execute_sql('INSERT INTO kehadiran (_source_row,tarikh,emel,nama,kategori,sumber) VALUES (?,?,?,?,?,?)',
         [(int)$n['n'],$date,$email,$u['nama'],$u['kategori'],'ADMIN_MANUAL']);
        $r=attendance_row($email,$date);
    }
    $d=$date.' ';$ts=excel_number(now_myt());
    execute_sql('UPDATE kehadiran SET masuk=?,balik=?,masuk2=?,balik2=?,status=?,sumber=?,disuntingoleh=?,sebabedit=?,dikemaskinipada=? WHERE _row_id=?',
      [$in?$d.$in.':00':null,$out?$d.$out.':00':null,$in2?excel_number($d.$in2.':00'):null,$out2?excel_number($d.$out2.':00'):null,
      $in?'HADIR':'BELUM HADIR','ADMIN_MANUAL',$admin['emel'],substr($reason,0,500),$ts,$r['_row_id']]);
    audit_event($admin['emel'],'SUNTING_KEHADIRAN',$email,$date.' '.$reason);
    return ['ok'=>true];
}
function admin_save_user(array $admin,array $p): array {
    $email=email_key($p['email']??'');$name=trim((string)($p['name']??''));if (!$name)throw new InvalidArgumentException('Nama diperlukan.');
    $category=(string)($p['category']??'AKP');if ($category==='Pentadbir')$category='Pengurusan';
    if (!in_array($category,['Pengurusan','PPP','AKP'],true)) throw new InvalidArgumentException('Kategori tidak sah.');
    $data=[$name,$category,!empty($p['active'])?1:0,!empty($p['isAdmin'])?1:0,substr((string)($p['jobTitle']??''),0,64),
      valid_time($p['s1In']??''),valid_time($p['s1Out']??''),valid_time($p['s2In']??''),valid_time($p['s2Out']??''),substr((string)($p['note']??''),0,64)];
    $u=user_by_email($email,false);
    if ($u) execute_sql('UPDATE pengguna SET nama=?,kategori=?,aktif=?,pentadbir=?,jawatan=?,sesi1masuk=?,sesi1keluar=?,sesi2masuk=?,sesi2keluar=?,catatan=? WHERE _row_id=?',
       [...$data,$u['_row_id']]);
    else {
        $r=one('SELECT COALESCE(MAX(_source_row),1)+1 AS n FROM pengguna');
        execute_sql('INSERT INTO pengguna (_source_row,nama,kategori,aktif,pentadbir,jawatan,sesi1masuk,sesi1keluar,sesi2masuk,sesi2keluar,catatan,emel) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
          [(int)$r['n'],...$data,$email]);
    }
    audit_event($admin['emel'],'SIMPAN_PENGGUNA',$email);
    return ['ok'=>true,'message'=>'Pengguna dikemaskini. PIN baharu mesti ditetapkan melalui CLI hosting.'];
}
function admin_save_settings(array $admin,array $p): array {
    $map=['schoolName'=>'SCHOOL_NAME','schoolLat'=>'SCHOOL_LAT','schoolLng'=>'SCHOOL_LNG',
     'radiusM'=>'RADIUS_M','maxGpsAccuracyM'=>'MAX_GPS_ACCURACY_M','defaultLateAfter'=>'DEFAULT_LATE_AFTER',
     'defaultMaxPunchIn'=>'DEFAULT_MAX_PUNCH_IN','defaultPunchOutFrom'=>'DEFAULT_PUNCH_OUT_FROM',
     'defaultS1In'=>'DEFAULT_S1_IN','defaultS1Out'=>'DEFAULT_S1_OUT','defaultS2In'=>'DEFAULT_S2_IN',
     'defaultS2Out'=>'DEFAULT_S2_OUT','allowOptionalSecondSession'=>'ALLOW_OPTIONAL_SECOND_SESSION',
     'thursdayWbfEnabled'=>'THURSDAY_WBF_ENABLED','thursdayWbfInFrom'=>'THURSDAY_WBF_IN_FROM',
     'thursdayWbfInTo'=>'THURSDAY_WBF_IN_TO','thursdayWbfOutFrom'=>'THURSDAY_WBF_OUT_FROM',
     'thursdayWbfOutTo'=>'THURSDAY_WBF_OUT_TO','thursdayWbfDurationMinutes'=>'THURSDAY_WBF_DURATION_MINUTES',
     'absentAfter'=>'ABSENT_AFTER','systemMode'=>'SYSTEM_MODE','systemStartDate'=>'SYSTEM_START_DATE',
     'workingDays'=>'WORKING_DAYS','ipTrackingEnabled'=>'IP_TRACKING_ENABLED','punchReminderEnabled'=>'PUNCH_REMINDER_ENABLED',
     'punchReminderTime'=>'PUNCH_REMINDER_TIME'];
    foreach($map as $field=>$key) {
        if (!array_key_exists($field,$p))continue;
        $v=is_bool($p[$field])?($p[$field]?'TRUE':'FALSE'):trim((string)$p[$field]);
        if (one('SELECT _row_id FROM tetapan WHERE kunci=? LIMIT 1',[$key])) {
           execute_sql('UPDATE tetapan SET nilai=? WHERE kunci=?',[$v,$key]);
        } else {
           $row=one('SELECT COALESCE(MAX(_source_row),1)+1 AS n FROM tetapan');
           execute_sql('INSERT INTO tetapan (_source_row,kunci,nilai,keterangan) VALUES (?,?,?,?)',
             [(int)$row['n'],$key,$v,'PHP MySQL']);
        }
    }
    audit_event($admin['emel'],'SIMPAN_TETAPAN','TETAPAN');
    return ['ok'=>true,'settings'=>public_settings(settings_raw())];
}


/**
 * Admin-only temporary PIN provisioning. Plaintext temporary PIN is only sent
 * in the immediate HTTPS response to the authenticated administrator.
 * No temp PIN is written to database or audit logs, and no email is sent.
 */
function issue_temp_pin(array $admin,string $email): array {
    $u=user_by_email($email,false);
    if (!$u || !(bool)$u['aktif']) throw new RuntimeException('Pengguna tidak aktif atau tidak ditemui.');
    $tempPin=(string)random_int(100000,999999);
    $hash=password_hash($tempPin,PASSWORD_DEFAULT);
    execute_sql('INSERT INTO web_auth (email,pin_hash,must_change_pin,attempts,locked_until) VALUES (?,?,1,0,NULL) ON DUPLICATE KEY UPDATE pin_hash=VALUES(pin_hash),must_change_pin=1,attempts=0,locked_until=NULL',
       [$email,$hash]);
    execute_sql('DELETE FROM web_sessions WHERE email=?',[$email]);
    audit_event($admin['emel'],'RESET_PIN_PHP',$email,'PIN sementara dijana; sesi lama dibatalkan');
    return ['ok'=>true,'name'=>$u['nama'],'email'=>$email,'temporaryPin'=>$tempPin,'emailSent'=>false,
      'message'=>'Serahkan PIN sementara secara peribadi. Pengguna wajib menukar PIN selepas log masuk.'];
}

/** Return only a whitelisted DB failure category, never an SQL statement. */
function database_public_error(PDOException $e): string {
    $driver=(int)($e->errorInfo[1]??0);
    switch ($driver) {
      case 1045:
      case 1044:
        return 'MySQL menolak sambungan: semak nama pengguna, kata laluan dan privileges dalam php/config.local.php.';
      case 2002:
      case 2003:
      case 2005:
        return 'Tidak dapat sambung ke MySQL. Jika PHP dan MySQL dalam cPanel yang sama, cuba host=localhost.';
      case 1049:
        return 'Nama database tidak dijumpai. Semak database dalam php/config.local.php.';
      case 1146:
        return 'Jadual MySQL tidak dijumpai. Import php/schema.sql ke database yang betul dalam phpMyAdmin.';
      case 1054:
        return 'Struktur jadual MySQL belum dikemas kini (missing column). Jalankan php/schema.sql versi terbaru melalui phpMyAdmin.';
      case 1142:
      case 1143:
        return 'Pengguna MySQL tiada kebenaran SELECT/INSERT/UPDATE untuk database ini. Semak MySQL Databases di cPanel.';
      default:
        return 'Ralat operasi MySQL. Semak php/schema.sql, database dan PHP error log. (Kod MySQL: '.($driver ?: 'unknown').')';
    }
}
