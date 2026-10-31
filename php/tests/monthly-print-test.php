<?php
declare(strict_types=1);
function settings_raw():array{return ['SCHOOL_NAME'=>'Sekolah Ujian','WORKING_DAYS'=>'SUN,MON,TUE,WED,THU'];}
function date_key($d):string{return substr((string)$d,0,10);}
function rows(string $sql,array $args=[]):array {
    if(strpos($sql,'pengguna')!==false)return [
        ['nama'=>'Nama Satu','emel'=>'satu@example.com','jawatan'=>'Guru','kategori'=>'PPP'],
        ['nama'=>'Nama Dua','emel'=>'dua@example.com','jawatan'=>'Pembantu','kategori'=>'AKP']
    ];
    if(strpos($sql,'kehadiran')!==false)return [
        ['emel'=>'satu@example.com','tarikh'=>'2026-10-01','masuk'=>'07:50','balik'=>'15:40'],
        ['emel'=>'satu@example.com','tarikh'=>'2026-10-02','masuk'=>'07:20','balik'=>'16:30'],
    ];
    return [];
}
function all_absence_rows():array{return [
    ['id'=>'A','email'=>'dua@example.com','status'=>'DILULUSKAN','mode'=>'TIDAK_HADIR','startDate'=>'2026-10-01','endDate'=>'2026-10-02','type'=>'CUTI','note'=>'Bercuti'],
    ['id'=>'K','email'=>'dua@example.com','status'=>'DILULUSKAN','mode'=>'KEBERADAAN','startDate'=>'2026-10-01','endDate'=>'2026-10-03','type'=>'KURSUS','note'=>'', 'startTime'=>'08:00','endTime'=>'16:00']
];}
function public_holidays_safe(string $a,string $b):array{return [];}
function schedule(array $u,array $s):array{return ['s1In'=>'07:30','lateAfter'=>'07:30','s1Out'=>'16:30'];}
function attendance_public(?array $r,array $s):?array {
    if(!$r)return null;
    return ['inTime'=>$r['masuk'],'outTime'=>$r['balik'],'inTime2'=>'','outTime2'=>'','statusFlags'=>[]];
}
function today():string{return '2026-10-03';}
function now_myt():string{return '2026-10-03 10:00:00';}
require dirname(__DIR__).'/monthly_print.php';
$r=eke_monthly_print_report('2026-10-01','2026-10-03');
if(count($r['people'])!==2 || count($r['exceptions'])!==1)throw new RuntimeException('Exception aggregation incorrect');
if($r['people'][1]['summary']['presence']!==1)throw new RuntimeException('Multi-day presence counted more than once');
if($r['people'][1]['summary']['absent']!==1)throw new RuntimeException('Non-workday absence improperly counted');
$html=eke_print_html($r);
foreach(['Ringkasan Kehadiran','Laporan Lewat / Balik Awal','Laporan Perakam Waktu','Laporan Individu','Cetak / Simpan PDF'] as $label)
    if(strpos($html,$label)===false)throw new RuntimeException('Missing section: '.$label);
$escaped=htmlspecialchars('<script>alert(1)</script>',ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');
if(strpos($html,'<script>alert(1)</script>')!==false)throw new RuntimeException('Unsafe markup');
// Validate the requested compact print layout.
foreach(['<th>Hari Hadir</th>','<th>Lewat Min.</th>','<th>Balik Awal Min.</th>'] as $removed)
    if(str_contains($html,$removed))throw new RuntimeException('Obsolete summary column: '.$removed);
if(!str_contains($html,'class="clock"'))throw new RuntimeException('Clock fonts were not normalized');
if(str_contains($html,'<th class="col-time">Masuk 2</th>')||str_contains($html,'<th class="col-time">Keluar 2</th>'))
    throw new RuntimeException('Empty session 2 columns were not hidden');
// When an employee has session 2, show the matching column on both halves.
$r['people'][0]['days'][0]['in2']='11:04';
$withSession2=eke_print_html($r);
if(substr_count($withSession2,'<th class="col-time">Masuk 2</th>')!==2||
   str_contains($withSession2,'<th class="col-time">Keluar 2</th>'))
   throw new RuntimeException('Conditional session 2 columns incorrect');
// Repeat the same employee's exception on another date: only one name row.
$extra=$r['exceptions'][0];$extra['date']='2026-10-02';$r['exceptions'][]=$extra;
$grouped=eke_print_html($r);
if(!preg_match('/<table class="exceptions">(.+?)<\/table>/s',$grouped,$m))
    throw new RuntimeException('Grouped exception table not found');
if(substr_count($m[1],'Nama Satu')!==1 || !str_contains($m[1],'01.10.2026') || !str_contains($m[1],'02.10.2026'))
    throw new RuntimeException('Late/early grouping by employee failed');
echo "MYSQL_MONTHLY_PRINT_OK\n";
