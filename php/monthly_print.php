<?php
declare(strict_types=1);
/** Standalone, MySQL-only four-part attendance report with print-to-PDF layout. */
function eke_monthly_print_report(string $from,string $to):array {
    if($from>$to || strtotime($to)-strtotime($from)>30*86400)
        throw new InvalidArgumentException('Laporan menyokong maksimum 31 hari.');
    $s=settings_raw();
    $staff=rows('SELECT * FROM pengguna WHERE aktif=1 AND emel IS NOT NULL ORDER BY nama');
    $raw=rows('SELECT * FROM kehadiran WHERE tarikh BETWEEN ? AND ? ORDER BY _row_id',[$from,$to]);
    $punches=[];
    foreach($raw as $p) $punches[strtolower(trim((string)($p['emel']??''))).'|'.date_key($p['tarikh']??'')]=$p;
    $absByEmail=[];
    foreach(all_absence_rows() as $a) {
        if($a['endDate']<$from||$a['startDate']>$to||!in_array($a['status'],['MENUNGGU','DILULUSKAN'],true))continue;
        $absByEmail[strtolower(trim((string)$a['email']))][]=$a;
    }
    $workweek=array_filter(array_map('trim',explode(',',strtoupper((string)($s['WORKING_DAYS']??'SUN,MON,TUE,WED,THU')))));
    $holidays=[];
    foreach(public_holidays_safe($from,$to) as $h) $holidays[date_key($h['tarikh']??'')]=(string)($h['nama']??'Cuti Umum');
    $dates=[];$workDays=0;
    for($timestamp=strtotime($from);$timestamp<=strtotime($to);$timestamp+=86400) {
        $d=date('Y-m-d',$timestamp);
        $working=in_array(strtoupper(date('D',$timestamp)),$workweek,true) && !isset($holidays[$d]);
        $dates[]=['date'=>$d,'dow'=>date('D',$timestamp),'working'=>$working,'holiday'=>$holidays[$d]??''];
        if($working)$workDays++;
    }
    $people=[];$exceptions=[];
    foreach($staff as $u){
        $email=strtolower(trim((string)($u['emel']??'')));
        if(!$email)continue;
        $schedule=schedule($u,$s);
        $sum=['number'=>count($people)+1,'name'=>(string)$u['nama'],'job'=>(string)($u['jawatan']??''),
            'category'=>(string)($u['kategori']??''),'workDays'=>$workDays,'present'=>0,
            'late'=>0,'lateMinutes'=>0,'early'=>0,'earlyMinutes'=>0,'absent'=>0,'presence'=>0];
        $absenceRecords=$absByEmail[$email]??[];
        $uniquePresence=[];
        foreach($absenceRecords as $a)
            if(($a['mode']??'')==='KEBERADAAN' && $a['status']==='DILULUSKAN')
                $uniquePresence[(string)($a['id']??count($uniquePresence))]=true;
        $sum['presence']=count($uniquePresence);
        $days=[];
        foreach($dates as $day){
            $date=$day['date'];
            $r=attendance_public($punches[$email.'|'.$date]??null,$schedule)??[];
            $in=(string)($r['inTime']??'');$out=(string)($r['outTime']??'');
            $in2=(string)($r['inTime2']??'');$out2=(string)($r['outTime2']??'');
            $hasPunch=$in!==''||$out!==''||$in2!==''||$out2!=='';
            $absence=null;$pending=null;$presence=[];
            foreach($absenceRecords as $a){
                if($a['startDate']>$date||$a['endDate']<$date)continue;
                if(($a['mode']??'')==='KEBERADAAN'){$presence[]=$a;continue;}
                if(($a['mode']??'')==='TIDAK_HADIR'){
                    if($a['status']==='DILULUSKAN' && !$absence)$absence=$a;
                    elseif($a['status']==='MENUNGGU' && !$pending)$pending=$a;
                }
            }
            $status='BELUM HADIR';$tone='';$note='';$late=0;$early=0;
            if(!$day['working'] && !$hasPunch && !$absence){
                $status=$day['holiday']?'CUTI UMUM':'HUJUNG MINGGU';
                $note=$day['holiday']?:$status;$tone='weekend';
            }elseif($hasPunch){
                $status='HADIR';$sum['present']++;
                $flags=array_map('strtoupper',$r['statusFlags']??[]);
                $isLate=in_array('LEWAT',$flags,true);$isEarly=in_array('BALIK AWAL',$flags,true);
                if(!$flags){
                    $isLate=$in!==''&&substr($in,0,5)>substr((string)($schedule['lateAfter']??'07:30'),0,5);
                    $isEarly=$out!==''&&substr($out,0,5)<substr((string)($schedule['s1Out']??'16:30'),0,5);
                }
                if($isLate && $in!==''){
                    $late=eke_monthly_minutes((string)($schedule['lateAfter']??'07:30'),$in);
                    $sum['late']++;$sum['lateMinutes']+=$late;
                }
                if($isEarly && $out!==''){
                    $early=eke_monthly_minutes($out,(string)($schedule['s1Out']??'16:30'));
                    $sum['early']++;$sum['earlyMinutes']+=$early;
                }
                if($isLate||$isEarly){
                    $status=$isLate&&$isEarly?'LEWAT / BALIK AWAL':($isLate?'LEWAT':'BALIK AWAL');
                    $tone='alert';
                    $exceptions[]=['date'=>$date,'name'=>$sum['name'],'job'=>$sum['job'],
                        'category'=>$sum['category'],'in'=>$in,'out'=>$out,'in2'=>$in2,'out2'=>$out2,
                        'late'=>$late,'early'=>$early,'total'=>$late+$early];
                }elseif($in!==''&&$out===''&&$out2===''){$tone='missing';$note='Tiada waktu balik';}
            }elseif($absence){
                $status='TIDAK HADIR';$tone='absence';
                if($day['working'])$sum['absent']++;
                $note=trim((string)($absence['type']??'').' — '.(string)($absence['note']??''),' —');
            }elseif($date>today()){$status='BELUM DIREKOD';$tone='future';}
            elseif($pending){$note=(string)$pending['type'].' — MENUNGGU KELULUSAN';}
            foreach($presence as $a){
                $part=trim('KEBERADAAN: '.(string)($a['type']??'').' '.(string)($a['startTime']??'').'–'.(string)($a['endTime']??'').' — '.(string)($a['note']??''),' —');
                $note.=($note?' | ':'').$part;
            }
            $note=function_exists('mb_substr')?mb_substr($note,0,280,'UTF-8'):substr($note,0,280);
            $days[]=['date'=>$date,'dow'=>$day['dow'],'status'=>$status,'tone'=>$tone,
                'in'=>$in,'out'=>$out,'in2'=>$in2,'out2'=>$out2,'note'=>$note];
        }
        $people[]=['summary'=>$sum,'days'=>$days];
    }
    usort($exceptions,static fn($a,$b)=>strcmp($a['date'],$b['date'])?:strcmp($a['name'],$b['name']));
    foreach($exceptions as $i=>&$e)$e['number']=$i+1;
    unset($e);
    return ['school'=>(string)($s['SCHOOL_NAME']??'SMK Bandar Baru Sungai Lalang'),
        'from'=>$from,'to'=>$to,'generated'=>now_myt(),'people'=>$people,'exceptions'=>$exceptions];
}
function eke_monthly_minutes(string $a,string $b):int {
    $a=explode(':',$a);$b=explode(':',$b);
    return count($a)>1&&count($b)>1?max(0,(int)$b[0]*60+(int)$b[1]-(int)$a[0]*60-(int)$a[1]):0;
}
function eke_monthly_day(string $day):string {
    return ['Sun'=>'Ahd','Mon'=>'Isn','Tue'=>'Sel','Wed'=>'Rab','Thu'=>'Kha','Fri'=>'Jum','Sat'=>'Sab'][$day]??$day;
}
function eke_print_html(array $r):string {
    $esc=static fn($v):string=>htmlspecialchars((string)$v,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');
    $html='<!doctype html><html lang="ms"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Laporan eKeberadaan</title><style>';
    $html.='@page{size:A4 landscape;margin:10mm}*{box-sizing:border-box}body{background:#f0f4f7;color:#162b34;font:10px/1.3 Arial,sans-serif;margin:0}main{max-width:1200px;margin:12px auto;padding:16px;background:#fff}.toolbar{background:#123c57;color:white;padding:12px;display:flex;justify-content:space-between}.toolbar button{padding:10px 16px;background:white;color:#123c57;border:0;border-radius:6px;font-weight:bold;cursor:pointer}.page{break-before:page;page-break-before:always}.page.first{break-before:auto;page-break-before:auto}h1{background:#d5f5f0;text-align:center;padding:7px;font-size:15px;border-bottom:2px solid #64a99f;margin:0 0 7px}.sub{font-size:10px;margin:5px 0 9px}table{border-collapse:collapse;width:100%;table-layout:fixed}th,td{border:1px solid #75aea6;vertical-align:top;padding:3px;overflow-wrap:anywhere}th{background:#dceff9}tbody tr:nth-child(even){background:#f6fbfa}.summary th,.summary td{font-size:8px}.summary th:nth-child(1){width:3%}.summary th:nth-child(2){width:17%}.summary th:nth-child(3){width:17%}.center{text-align:center}.cal{break-inside:avoid;margin-bottom:7mm}.cal-title{background:#e5f8f3;border:1px solid #75aea6;padding:4px;font-weight:bold}.calendar th,.calendar td{padding:2px 0;text-align:center;font-size:6.7px;vertical-align:middle;height:33px;word-break:normal}.calendar th{height:22px}.calendar small{display:block;font-size:6px}.alert{background:#ffc6bc!important}.absence{background:#ffd3a0!important}.missing{background:#fff2b0!important}.weekend{background:#ffe9ce!important}.future{background:#f1f4f6!important;color:#77838b}.person-head{background:#e5f8f3;padding:9px;border-bottom:2px solid #75aea6;margin-bottom:10px;font-size:13px;font-weight:bold}.cols{display:flex;gap:10px}.cols>div{width:50%}.person td,.person th{font-size:7.5px;padding:3px}.person th:nth-child(1){width:9%}.person th:nth-child(2){width:7%}.person th:nth-child(n+3):nth-child(-n+6){width:10%}.person th:nth-child(7){width:17%}.stats{font-weight:bold;margin-top:10px;border-top:1px solid #75aea6;padding:7px}.signatures{display:flex;justify-content:space-between;padding:20px 40px}.signatures span{width:35%;border-top:1px solid #777;padding-top:4px}.key{font-size:8px;margin-top:5px}@media print{body{background:white}main{max-width:none;padding:0;margin:0}.toolbar{display:none}thead{display:table-header-group}tr{break-inside:avoid;page-break-inside:avoid}}@media screen and (max-width:800px){main{min-width:1000px}.toolbar{min-width:1000px}}';
    $html.='</style></head><body><div class="toolbar"><b>Laporan eKeberadaan — Sila pilih Save as PDF dalam dialog cetakan</b><button onclick="window.print()">Cetak / Simpan PDF</button></div><main>';
    $period=$esc($r['from']).' hingga '.$esc($r['to']);$school=$esc($r['school']);
    $html.='<section class="page first"><h1>'.$school.' — Ringkasan Kehadiran</h1><div class="sub">Tempoh: '.$period.' · Dijana: '.$esc($r['generated']).' (MYT)</div><table class="summary"><thead><tr><th>Bil.</th><th>Nama</th><th>Jawatan / Kategori</th><th>Hari Kerja</th><th>Hari Hadir</th><th>Lewat Bil.</th><th>Lewat Min.</th><th>Balik Awal Bil.</th><th>Balik Awal Min.</th><th>Tidak Hadir</th><th>Keberadaan</th></tr></thead><tbody>';
    foreach($r['people'] as $p){
        $s=$p['summary'];
        $html.='<tr><td class="center">'.$s['number'].'</td><td>'.$esc($s['name']).'</td><td>'.$esc(trim($s['job'].' / '.$s['category'],' /')).'</td>';
        foreach(['workDays','present','late','lateMinutes','early','earlyMinutes','absent','presence'] as $k)
            $html.='<td class="center">'.(int)$s[$k].'</td>';
        $html.='</tr>';
    }
    $html.='</tbody></table></section><section class="page"><h1>'.$school.' — Laporan Lewat / Balik Awal</h1><div class="sub">Tempoh: '.$period.'</div><table class="summary"><thead><tr><th>Bil.</th><th>Nama</th><th>Jawatan / Kategori</th><th>Tarikh</th><th>S1 Masuk</th><th>S1 Keluar</th><th>S2 Masuk</th><th>S2 Keluar</th><th>Lewat Min.</th><th>Balik Awal Min.</th><th>Jumlah Min.</th></tr></thead><tbody>';
    foreach($r['exceptions'] as $e) {
        $html.='<tr><td>'.$e['number'].'</td><td>'.$esc($e['name']).'</td><td>'.$esc(trim($e['job'].' / '.$e['category'],' /')).'</td>';
        foreach(['date','in','out','in2','out2','late','early','total'] as $k)
            $html.='<td>'.$esc($e[$k]).'</td>';
        $html.='</tr>';
    }
    if(!$r['exceptions'])$html.='<tr><td colspan="11">Tiada rekod lewat atau balik awal.</td></tr>';
    $html.='</tbody></table></section>';
    $short=['HADIR'=>'H','LEWAT'=>'L','BALIK AWAL'=>'BA','LEWAT / BALIK AWAL'=>'L/BA','TIDAK HADIR'=>'TH','BELUM HADIR'=>'BH','BELUM DIREKOD'=>'—','HUJUNG MINGGU'=>'HM','CUTI UMUM'=>'CU'];
    foreach(array_chunk($r['people'],3) as $group) {
        $html.='<section class="page"><h1>Laporan Perakam Waktu</h1><div class="sub center">'.$school.' · '.$period.'</div>';
        foreach($group as $p) {
            $s=$p['summary'];
            $html.='<div class="cal"><div class="cal-title">Bil: '.$s['number'].' · Nama: '.$esc($s['name']).' · Jawatan: '.$esc($s['job']).' · Kategori: '.$esc($s['category']).'</div><table class="calendar"><thead><tr>';
            foreach($p['days'] as $d)$html.='<th>'.substr($d['date'],8,2).'/'.substr($d['date'],5,2).'<small>'.eke_monthly_day($d['dow']).'</small></th>';
            $html.='</tr></thead><tbody><tr>';
            foreach($p['days'] as $d){
                $html.='<td class="'.$esc($d['tone']).'">'.$esc(substr($d['in'],0,5)?:'—').'<small>'.$esc(substr($d['out'],0,5)).'</small><b>'.$esc($short[$d['status']]??$d['status']).'</b>'.($d['in2']?'<small>'.$esc(substr($d['in2'],0,5)).'</small>':'').($d['out2']?'<small>'.$esc(substr($d['out2'],0,5)).'</small>':'').'</td>';
            }
            $html.='</tr></tbody></table></div>';
        }
        $html.='<div class="key">H = Hadir · L = Lewat · BA = Balik Awal · TH = Tidak Hadir · BH = Belum Hadir · HM = Hujung Minggu · CU = Cuti Umum. Catatan penuh di Laporan Individu.</div></section>';
    }
    foreach($r['people'] as $p){
        $s=$p['summary'];
        $html.='<section class="page"><h1>Laporan Individu</h1><div class="person-head">'.$s['number'].'. '.$esc($s['name']).'<div style="font-size:10px;font-weight:normal">'.$esc(trim($s['job'].' / '.$s['category'],' /')).' · '.$period.'</div></div><div class="cols">';
        $cut=(int)ceil(count($p['days'])/2);
        foreach([array_slice($p['days'],0,$cut),array_slice($p['days'],$cut)] as $half){
            $html.='<div><table class="person"><thead><tr><th>Tarikh</th><th>Hari</th><th>Masuk</th><th>Keluar</th><th>Masuk 2</th><th>Keluar 2</th><th>Status</th><th>Catatan</th></tr></thead><tbody>';
            foreach($half as $d){
                $html.='<tr class="'.$esc($d['tone']).'"><td>'.substr($d['date'],8,2).'/'.substr($d['date'],5,2).'</td><td>'.eke_monthly_day($d['dow']).'</td>';
                foreach(['in','out','in2','out2'] as $key)$html.='<td>'.$esc($d[$key]).'</td>';
                $html.='<td>'.$esc($d['status']).'</td><td>'.$esc($d['note']).'</td></tr>';
            }
            $html.='</tbody></table></div>';
        }
        $html.='</div><div class="stats">Hari bekerja: '.$s['workDays'].' · Hadir: '.$s['present'].' · Tidak hadir: '.$s['absent'].' · Lewat: '.$s['late'].' ('.$s['lateMinutes'].' min) · Balik awal: '.$s['early'].' ('.$s['earlyMinutes'].' min) · Keberadaan: '.$s['presence'].'</div><div class="key">Merah: Lewat/Balik Awal · Kuning: Tiada waktu balik · Jingga: Cuti/Tidak hadir/Hujung minggu. Waktu MYT (Asia/Kuala_Lumpur).</div><div class="signatures"><span>Disahkan oleh:</span><span>Diluluskan oleh:</span></div></section>';
    }
    return $html.'</main></body></html>';
}
