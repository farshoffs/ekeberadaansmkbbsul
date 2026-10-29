<?php
declare(strict_types=1);

/**
 * Database-free regression test for the admin_data() report path.
 * Extract only that function from api.php, which otherwise dispatches HTTP
 * requests on include. Stubs deliberately return two active staff members,
 * reproducing the settings/status variable shadowing seen on live cPanel.
 */
$source = (string)file_get_contents(dirname(__DIR__).'/api.php');
$start = strpos($source, 'function admin_data(');
$end = $start === false ? false : strpos($source, '\nfunction all_absence_rows(', $start);
if ($start === false || $end === false) {
    throw new RuntimeException('admin_data() function boundaries were not found.');
}
eval(substr($source, $start, $end - $start));

function valid_day(string $day): string { return $day; }
function today(): string { return '2026-10-29'; }
function rows(string $query, array $params=[]): array {
    if (strpos($query,'FROM pengguna') !== false) {
        return [
            ['nama'=>'A','emel'=>'a@example.test','aktif'=>1,'kategori'=>'PPP','jawatan'=>'Guru'],
            ['nama'=>'B','emel'=>'b@example.test','aktif'=>1,'kategori'=>'AKP','jawatan'=>'Pembantu']
        ];
    }
    if (strpos($query,'FROM kehadiran') !== false) return [];
    throw new RuntimeException('Unexpected query in report test');
}
function all_absence_rows(): array { return []; }
function settings_raw(): array {
    return ['SCHOOL_NAME'=>'Sekolah Ujian','PROFILE_ROOT_FOLDER_ID'=>'test-drive-folder'];
}
function schedule(array $user, array $settings): array {
    if (($settings['SCHOOL_NAME']??null)!=='Sekolah Ujian') {
        throw new RuntimeException('Settings array changed while building admin report');
    }
    return ['email'=>$user['emel']];
}
function attendance_public($attendance, array $schedule): array {
    return ['status'=>$schedule['email']==='a@example.test'?'LEWAT / BALIK AWAL':'HADIR'];
}
function public_user(array $user): array { return ['email'=>$user['emel']]; }
function public_settings(array $settings): array {
    return ['schoolName'=>$settings['SCHOOL_NAME']??''];
}

$result=admin_data(['nama'=>'Admin','emel'=>'admin@example.test'],'2026-10-29');
if (($result['settings']['schoolName']??null)!=='Sekolah Ujian') {
    throw new RuntimeException('Admin settings lost during attendance summary');
}
if (($result['settings']['profileRootFolderId']??null)!=='test-drive-folder') {
    throw new RuntimeException('Drive root folder setting was lost in admin report');
}
$expected=['total'=>2,'hadir'=>1,'lewat'=>1,'balikAwal'=>1,'tidakHadir'=>0,'belumHadir'=>0];
if (($result['summary']??null)!==$expected) {
    throw new RuntimeException('Admin attendance summary mismatch: '.json_encode($result['summary']??null));
}
echo "Admin report settings and attendance status isolation: PASS\n";
