<?php
/**
 * Server-to-server Google Apps Script bridge. MySQL remains authoritative.
 * Never use the original Google Sheets login/session/attendance backend for
 * authenticated PHP users.
 */
declare(strict_types=1);

function workspace_rpc(string $action, array $data=[]): array {
    $allowed=['photo','syncPhotos','exportPdf','exportSheet'];
    if (!in_array($action,$allowed,true)) throw new InvalidArgumentException('Workspace action not allowed');
    $config=cfg();
    $secret=(string)($config['workspace_bridge_secret']??'');
    $url=(string)($config['workspace_gas_url']??'');
    if (!preg_match('/^[0-9a-f]{64,128}$/i',$secret) ||
      !preg_match('~^https://script\.google\.com/macros/s/[A-Za-z0-9_-]+/exec$~',$url)) {
        throw new RuntimeException('Jambatan Google Workspace belum dipasang. Tetapkan workspace_gas_url dan workspace_bridge_secret dalam php/config.local.php. Kemudian deploy kod Apps Script Workspace yang terbaru.');
    }
    if (!function_exists('curl_init')) throw new RuntimeException('PHP cURL extension diperlukan untuk Google Workspace.');
    $request=json_encode([
        'v'=>1,'action'=>$action,'issuedAt'=>time(),
        'nonce'=>bin2hex(random_bytes(16)),'data'=>$data
    ],JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE|JSON_THROW_ON_ERROR);
    if (strlen($request)>175000) throw new RuntimeException('Data laporan melebihi had Google Workspace bridge.');
    $signature=rtrim(strtr(base64_encode(hash_hmac('sha256',$request,$secret,true)),'+/','-_'),'=');
    $post=http_build_query(['workspace'=>'1','payload'=>$request,'signature'=>$signature],'','&',PHP_QUERY_RFC3986);
    $ch=curl_init($url);
    curl_setopt_array($ch,[
        CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>$post,
        CURLOPT_HTTPHEADER=>['Content-Type: application/x-www-form-urlencoded; charset=utf-8','Accept: application/json'],
        CURLOPT_RETURNTRANSFER=>true,CURLOPT_FOLLOWLOCATION=>true,CURLOPT_MAXREDIRS=>3,
        CURLOPT_CONNECTTIMEOUT=>10,CURLOPT_TIMEOUT=>50,
        CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2,
        CURLOPT_USERAGENT=>'eKeberadaan WorkspaceBridge/1',
    ]);
    if (defined('CURLOPT_REDIR_PROTOCOLS_STR'))curl_setopt($ch,CURLOPT_REDIR_PROTOCOLS_STR,'https');
    elseif (defined('CURLOPT_REDIR_PROTOCOLS'))curl_setopt($ch,CURLOPT_REDIR_PROTOCOLS,CURLPROTO_HTTPS);
    $response=curl_exec($ch);
    $status=(int)curl_getinfo($ch,CURLINFO_RESPONSE_CODE);
    $effective=(string)curl_getinfo($ch,CURLINFO_EFFECTIVE_URL);
    $err=curl_error($ch);
    curl_close($ch);
    $host=parse_url($effective,PHP_URL_HOST);
    if (!$host || !in_array($host,['script.google.com','script.googleusercontent.com'],true)) {
        throw new RuntimeException('Google Workspace response redirect tidak dibenarkan.');
    }
    if($response===false || $status<200 || $status>=300) {
        error_log('Workspace bridge HTTP '.$status.' transport: '.substr($err,0,150));
        throw new RuntimeException('Google Workspace tidak dapat dihubungi (HTTP '.$status.'). Pastikan Apps Script sudah deploy versi Workspace bridge.');
    }
    if(strlen($response)>5*1024*1024) throw new RuntimeException('Respons Google Workspace terlalu besar.');
    $result=json_decode($response,true);
    if(!is_array($result)||!array_key_exists('ok',$result)) {
        throw new RuntimeException('Respons Google Workspace bukan JSON. Pastikan akses Web App ditetapkan kepada Anyone dan versi bridge sudah dideploy.');
    }
    if(!$result['ok'])throw new RuntimeException('Google Workspace: '.substr((string)($result['error']??'Permintaan gagal'),0,250));
    if(!is_array($result['result']??null)) throw new RuntimeException('Data Google Workspace tidak sah.');
    return $result['result'];
}
