<?php
/**
 * Browser-only, one-time first-administrator provisioning.
 *
 * Prerequisites: php/config.local.php with a 64-hex-character setup_key,
 * existing imported pengguna table, and php/schema.sql already imported.
 * The installation is locked permanently in web_setup_state after success.
 * No shared secrets are committed to GitHub.
 */
declare(strict_types=1);
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, private');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');

$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (int)($_SERVER['SERVER_PORT'] ?? 0) === 443;
if (!$https) {
    http_response_code(403);
    exit('HTTPS required. Open this page using https://.');
}

ini_set('session.use_strict_mode', '1');
session_name('ek_mysql_setup');
session_set_cookie_params(['httponly'=>true,'secure'=>true,'samesite'=>'Strict','path'=>dirname($_SERVER['SCRIPT_NAME'] ?? '/php/setup.php') ?: '/']);
session_start();
if (!isset($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));

require_once __DIR__ . '/_lib.php';

function e(string $s): string { return htmlspecialchars($s, ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8'); }
$installed = false; $dbReady = false; $errors = []; $message = '';
$configReady = false;
try {
    $c = cfg();
    $key = $c['setup_key'] ?? '';
    $configReady = is_string($key) && (bool)preg_match('/^[a-f0-9]{64}$/i', $key);
    $pdo = db();
    $dbReady = true;
    $state = one('SELECT installed FROM web_setup_state WHERE id=1');
    if (!$state) {
        $dbReady = false;
        $errors[] = 'The schema.sql setup tables are missing. Import php/schema.sql into the existing database using phpMyAdmin.';
    } else {
        $installed = (bool)$state['installed'];
    }
} catch (Throwable $error) {
    $errors[] = 'MySQL is not ready. Verify php/config.local.php, the MySQL host/user/password, and import php/schema.sql from phpMyAdmin.';
    error_log('eKeberadaan setup readiness: '.get_class($error).' '.$error->getMessage());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$installed) {
    try {
        if (!$dbReady) throw new RuntimeException('Import php/schema.sql and configure MySQL first.');
        if (!$configReady) throw new RuntimeException('Configure setup_key as 64 random hexadecimal characters in php/config.local.php first.');
        if (!hash_equals((string)$_SESSION['csrf'], (string)($_POST['csrf']??''))) throw new RuntimeException('Invalid setup form. Reload and retry.');
        if (!hash_equals($c['setup_key'], trim((string)($_POST['setup_key']??'')))) throw new RuntimeException('Setup key does not match the server configuration.');
        $email = email_key($_POST['admin_email']??'');
        $pin = trim((string)($_POST['pin']??''));
        $pin2 = trim((string)($_POST['pin_confirm']??''));
        if (!preg_match('/^\d{6}$/', $pin) || !hash_equals($pin,$pin2)) throw new RuntimeException('Enter matching six-digit PIN values.');
        $admin = user_by_email($email, true);
        if (!$admin || !(bool)$admin['pentadbir']) throw new RuntimeException('Choose an existing active Pentadbir Sistem account from pengguna.');
        $hash = password_hash($pin, PASSWORD_DEFAULT);
        db()->beginTransaction();
        $lock = one('SELECT installed FROM web_setup_state WHERE id=1 FOR UPDATE');
        if (!$lock || (bool)$lock['installed']) throw new RuntimeException('Browser setup is already complete.');
        $already = one('SELECT COUNT(*) AS n FROM web_auth wa INNER JOIN pengguna p ON LOWER(p.emel)=LOWER(wa.email) WHERE p.pentadbir=1 AND p.aktif=1');
        if ((int)($already['n']??0)>0) throw new RuntimeException('An administrator is already provisioned. The installer cannot overwrite their PIN.');
        execute_sql('INSERT INTO web_auth (email,pin_hash,attempts,locked_until) VALUES (?,?,0,NULL)',[$email,$hash]);
        execute_sql('UPDATE web_setup_state SET installed=1,installed_at=NOW(),installed_by=? WHERE id=1',[$email]);
        db()->commit();
        $installed = true;
        $message = 'Administrator PIN activated. Browser setup is now permanently locked.';
        unset($_SESSION['csrf']);
        session_regenerate_id(true);
    } catch (Throwable $ex) {
        if ($dbReady && db()->inTransaction()) db()->rollBack();
        $errors[] = $ex instanceof PDOException ? 'Database write failed. Check the database privileges and server log.' : $ex->getMessage();
        error_log('eKeberadaan setup operation: '.get_class($ex).' '.$ex->getMessage());
    }
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>eKeberadaan • One-time MySQL Setup</title>
<style>
:root{font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#15243b;background:#eff5fc}
*{box-sizing:border-box}body{margin:0;padding:25px}main{max-width:620px;margin:35px auto;padding:26px 30px;background:white;border:1px solid #dbe4f0;border-radius:18px;box-shadow:0 15px 40px #14203a18}
h1{margin:0 0 12px;font-size:25px}p{line-height:1.6}label{display:block;margin:15px 0 6px;font-weight:650}
input{display:block;width:100%;font-size:16px;padding:12px;border:1px solid #b8c7d8;border-radius:9px}
button,.link{display:inline-block;padding:12px 16px;background:#0b53ae;border:0;border-radius:9px;color:white;font-weight:700;text-decoration:none;cursor:pointer}
.notice{padding:13px;border-radius:10px;background:#eef5ff;margin:13px 0}.error{background:#fff0f0}.ok{background:#edf9f2}
small{color:#586678;line-height:1.5}code{word-break:break-word}
.help{display:flex;gap:8px;margin:10px 0;flex-wrap:wrap}.help input{flex:1}
</style>
</head>
<body>
<main>
<h1>eKeberadaan • Browser Setup</h1>
<p>This secure installer activates the <strong>first PHP/MySQL administrator</strong>, without requiring cPanel Terminal.</p>
<?php foreach($errors as $err): ?><div class="notice error"><?=e($err)?></div><?php endforeach; ?>
<?php if ($installed): ?>
<div class="notice ok"><?=e($message ?: 'Setup already completed. The one-time installer is locked.')?></div>
<p><strong>Next:</strong> remove <code>setup_key</code> from <code>config.local.php</code> in File Manager, and delete <code>setup.php</code> from your hosting folder if you can.</p>
<a class="link" href="index.php">Open eKeberadaan</a>
<?php elseif ($dbReady): ?>
<div class="notice"><?= $configReady?'Database configured; setup key found.':'Set a 64-character hexadecimal setup_key in your private php/config.local.php using cPanel File Manager.' ?></div>
<form method="post" autocomplete="off">
<input type="hidden" name="csrf" value="<?=e($_SESSION['csrf'])?>">
<label for="setup_key">One-time setup key (same as config.local.php)</label>
<input id="setup_key" name="setup_key" autocomplete="off" spellcheck="false" required minlength="64" maxlength="64">
<label for="admin_email">Registered administrator email</label>
<input id="admin_email" type="email" name="admin_email" required autocomplete="username" placeholder="admin@moe-dl.edu.my">
<small>Must already exist in the pengguna table, be active, and have Pentadbir Sistem permission.</small>
<label for="pin">New six-digit admin PIN</label>
<input id="pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" required autocomplete="new-password">
<label for="pin_confirm">Confirm admin PIN</label>
<input id="pin_confirm" name="pin_confirm" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" required autocomplete="new-password">
<p><button type="submit">Activate first administrator and lock setup</button></p>
</form>
<?php endif; ?>
<hr>
<p><strong>Need a setup key?</strong> Generate a cryptographically random value in this browser. Copy it into <code>php/config.local.php</code> as <code>setup_key</code> and enter the same key in the form above. Do not paste it into chat or GitHub.</p>
<div class="help">
<button type="button" id="generate">Generate setup key</button>
<button type="button" id="copy" disabled>Copy key</button>
</div>
<input id="generated" readonly aria-label="Generated 64-character setup key" autocomplete="off">
<small>The generated value stays in your browser. Only you can put it in the private server config.</small>
</main>
<script>
const generated=document.getElementById('generated');
document.getElementById('generate').addEventListener('click',()=>{
  if(!globalThis.crypto?.getRandomValues){alert('A secure browser is required.');return;}
  const b=crypto.getRandomValues(new Uint8Array(32));
  generated.value=Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
  document.getElementById('copy').disabled=false;
});
document.getElementById('copy').addEventListener('click',()=>{
  generated.select();navigator.clipboard?.writeText(generated.value).catch(()=>{});
});
</script>
</body></html>
