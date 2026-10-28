<?php
/**
 * Unit-test a public synthetic example; no real user PINs, salts or pepper.
 * Run locally or in GitHub Actions: php php/tests/legacy-pin-test.php
 */
declare(strict_types=1);
require dirname(__DIR__).'/_lib.php';

$pepper='test-only-legacy-pepper-very-private';
$salt=str_repeat('0123456789abcdef',4);
$expected='iMGaT4Ld3jxI5WfRtKtmNAZEU-dntBhbSdj64GzipZU=';
$computed=legacy_pin_hash('123456',$salt,$pepper);
if (!hash_equals($expected,$computed)) throw new RuntimeException('Legacy HMAC-SHA256 base64url test failed');
$legacy=['authtype'=>'PIN_V1','passwordsalt'=>$salt,'passwordhash'=>$expected];
if (!legacy_pin_matches('123456',$legacy,$pepper)) throw new RuntimeException('Correct synthetic PIN was rejected');
if (legacy_pin_matches('123457',$legacy,$pepper)) throw new RuntimeException('Wrong PIN was accepted');
if (legacy_pin_matches('123456',$legacy,'wrong pepper')) throw new RuntimeException('Wrong pepper was accepted');
if (legacy_pin_matches('123456',$legacy,'') || legacy_pin_matches('123456',['authtype'=>'','passwordsalt'=>$salt,'passwordhash'=>$expected],$pepper)) {
    throw new RuntimeException('Unprovisioned or non-PIN account was accepted');
}
echo "Legacy Apps Script PIN_V1 verification: PASS\n";
