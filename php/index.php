<?php
declare(strict_types=1);
$root = dirname(__DIR__);
$index = file_get_contents($root.'/Index.html');
if ($index === false) { http_response_code(500); exit('Index.html missing'); }
$styles = file_get_contents($root.'/Styles.html');
$logo = file_get_contents($root.'/Logo.html');
$scripts = file_get_contents($root.'/Scripts.html');
if ($styles === false || $logo === false || $scripts === false) { http_response_code(500); exit('App assets missing'); }
$old = "function runServer(fn, ...args){\n    return new Promise((resolve,reject)=>{\n      google.script.run\n        .withSuccessHandler(resolve)\n        .withFailureHandler(err=>reject(new Error(err && err.message ? err.message : String(err))))[fn](...args);\n    });\n  }";
$new = <<<'JS'
function runServer(fn, ...args){
    return fetch('api.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      credentials:'same-origin',
      cache:'no-store',
      body:JSON.stringify({fn,args})
    }).then(async response=>{
      const obj=await response.json().catch(()=>({ok:false,error:'Server response was not JSON'}));
      if(!response.ok || !obj.ok) throw new Error(obj.error||'Request failed');
      return obj.result;
    });
  }
JS;
if (strpos($scripts,$old) === false) { http_response_code(500); exit('Scripts version mismatch: RPC adapter not installed'); }
$scripts = str_replace($old,$new,$scripts);
$index = str_replace("<?!= include('Styles'); ?>",$styles,$index);
$index = str_replace("<?!= include('Logo'); ?>",$logo,$index);
$index = str_replace("<?!= include('Scripts'); ?>",$scripts,$index);
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
echo $index;
