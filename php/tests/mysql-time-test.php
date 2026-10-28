<?php
declare(strict_types=1);
require dirname(__DIR__).'/_lib.php';
$cases = [
    ['2026-10-07 06:47:01.320000','06:47'],
    ['2026-10-07 08:11:25.144000','08:11'],
    ['2026-10-07T18:25:00','18:25'],
    ['08:59:17','08:59'],
    [46302.37437238426,'08:59'],
    [46302.76795763889,'18:26'],
    ['0.375','09:00'],
    [null,''],
    ['', '']
];
foreach($cases as [$input,$expected]){
    $actual=time_text($input);
    if($actual!==$expected)throw new RuntimeException('Time parsing mismatch. Expected '.$expected.' got '.$actual);
}
if (date_key(46272)!=='2026-09-07')
    throw new RuntimeException('Excel serial date parsing failed');
if (date_key('2026-10-07')!=='2026-10-07')
    throw new RuntimeException('MySQL DATE parsing failed');
echo "MySQL DATETIME + Excel time compatibility: PASS\n";
