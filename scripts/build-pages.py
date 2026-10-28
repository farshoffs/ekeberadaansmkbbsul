#!/usr/bin/env python3
from __future__ import annotations

import base64
import hashlib
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_site"
ASSETS = OUT / "assets"
VENDOR = OUT / "vendor" / "bootstrap"
TITLE = "e-Keberadaan — Perakam Waktu Digital"
BOOTSTRAP_VERSION = "5.3.3"


def read(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


def digest(data: bytes | str, n: int = 12) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()[:n]


def write_text_hashed(prefix: str, suffix: str, text: str) -> str:
    name = f"{prefix}.{digest(text)}.{suffix}"
    (ASSETS / name).write_text(text, encoding="utf-8")
    return f"./assets/{name}"


def copy_bootstrap() -> tuple[str, str]:
    """Copy the complete compiled Bootstrap distribution into the static site.

    Bootstrap is installed from the exact version pinned in package.json during
    CI. The browser never talks to a CDN: GitHub Pages serves both files itself.
    bootstrap.bundle.min.js includes Popper and every Bootstrap JS component.
    """
    pkg = ROOT / "node_modules" / "bootstrap"
    css_src = pkg / "dist" / "css" / "bootstrap.min.css"
    js_src = pkg / "dist" / "js" / "bootstrap.bundle.min.js"
    license_src = pkg / "LICENSE"
    if not css_src.exists() or not js_src.exists():
        raise SystemExit(
            f"Bootstrap {BOOTSTRAP_VERSION} belum dipasang. Jalankan `npm install` sebelum build."
        )

    VENDOR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(css_src, VENDOR / "bootstrap.min.css")
    shutil.copy2(js_src, VENDOR / "bootstrap.bundle.min.js")
    if license_src.exists():
        shutil.copy2(license_src, VENDOR / "LICENSE")
    return (
        "./vendor/bootstrap/bootstrap.min.css",
        "./vendor/bootstrap/bootstrap.bundle.min.js",
    )


def extract_logo() -> str:
    raw = read("Logo.html")
    m = re.search(r'src=["\']data:image/([^;"\']+);base64,([^"\']+)["\']', raw, flags=re.I | re.S)
    if not m:
        raise SystemExit("Logo.html tidak mengandungi data:image base64 yang dijangka")
    mime = m.group(1).lower()
    ext = {"png": "png", "jpeg": "jpg", "jpg": "jpg", "webp": "webp", "svg+xml": "svg"}.get(mime)
    if not ext:
        raise SystemExit(f"Format logo tidak disokong: {mime}")
    data = base64.b64decode(re.sub(r"\s+", "", m.group(2)))
    name = f"logo.{digest(data)}.{ext}"
    (ASSETS / name).write_bytes(data)
    return f"./assets/{name}"


def clean_css() -> str:
    css = read("Styles.html").strip()
    css = re.sub(r"^\s*<style[^>]*>", "", css, count=1, flags=re.I)
    css = re.sub(r"</style>\s*$", "", css, count=1, flags=re.I)
    return css.strip() + "\n"


def replace_once(src: str, old: str, new: str, label: str) -> str:
    if old not in src:
        raise SystemExit(f"Patch frontend tidak menemui blok: {label}")
    return src.replace(old, new, 1)


def bootstrapify_javascript(src: str) -> str:
    """Use real Bootstrap components while preserving the legacy API surface."""
    old_busy = (
        "  function setButtonBusy(btn,busy,label){if(!btn)return;if(busy){if(!btn.dataset.originalHtml)"
        "btn.dataset.originalHtml=btn.innerHTML;btn.disabled=true;if(label)btn.innerHTML=esc(label);}else{"
        "btn.disabled=false;if(btn.dataset.originalHtml){btn.innerHTML=btn.dataset.originalHtml;delete "
        "btn.dataset.originalHtml;}}}"
    )
    new_busy = """  function setButtonBusy(btn,busy,label){
    if(!btn)return;
    if(busy){
      if(!btn.dataset.originalHtml)btn.dataset.originalHtml=btn.innerHTML;
      btn.disabled=true;
      btn.setAttribute('aria-busy','true');
      const busyLabel=esc(label||'Memproses…');
      btn.innerHTML=`<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span><span>${busyLabel}</span>`;
    }else{
      btn.disabled=false;
      btn.removeAttribute('aria-busy');
      if(btn.dataset.originalHtml){btn.innerHTML=btn.dataset.originalHtml;delete btn.dataset.originalHtml;}
    }
  }"""
    src = replace_once(src, old_busy, new_busy, "setButtonBusy Bootstrap spinner")

    old_toggle = "  function toggleMobileMenu(){document.getElementById('sidebar').classList.toggle('open');document.getElementById('sidebarBackdrop').classList.toggle('hidden');}"
    new_toggle = """  function toggleMobileMenu(){
    const el=document.getElementById('sidebar');
    if(!el)return;
    if(window.innerWidth>=768){el.classList.add('show');return;}
    if(window.bootstrap?.Collapse){bootstrap.Collapse.getOrCreateInstance(el,{toggle:false}).toggle();}
    else{el.classList.toggle('show');}
  }"""
    src = replace_once(src, old_toggle, new_toggle, "Bootstrap Collapse toggle")

    old_close = "  function closeMobileMenu(){document.getElementById('sidebar').classList.remove('open');document.getElementById('sidebarBackdrop').classList.add('hidden');}"
    new_close = """  function closeMobileMenu(){
    const el=document.getElementById('sidebar');
    if(!el||window.innerWidth>=768)return;
    if(window.bootstrap?.Collapse){bootstrap.Collapse.getOrCreateInstance(el,{toggle:false}).hide();}
    else{el.classList.remove('show');}
  }"""
    src = replace_once(src, old_close, new_close, "Bootstrap Collapse close")

    old_show_modal = "  function showModal(html){document.getElementById('modalContent').innerHTML=html;document.getElementById('modal').classList.remove('hidden');}"
    new_show_modal = """  function showModal(html){
    document.getElementById('modalContent').innerHTML=html;
    const el=document.getElementById('modal');
    if(window.bootstrap?.Modal){bootstrap.Modal.getOrCreateInstance(el,{backdrop:true,keyboard:true,focus:true}).show();}
    else{el.classList.add('show');el.style.display='block';}
  }"""
    src = replace_once(src, old_show_modal, new_show_modal, "Bootstrap Modal show")

    old_close_modal = "  function closeModal(){document.getElementById('modal').classList.add('hidden');}"
    new_close_modal = """  function closeModal(){
    const el=document.getElementById('modal');
    if(window.bootstrap?.Modal){bootstrap.Modal.getOrCreateInstance(el).hide();}
    else{el.classList.remove('show');el.style.display='none';}
  }"""
    src = replace_once(src, old_close_modal, new_close_modal, "Bootstrap Modal close")

    old_toast = "  function toast(msg,ms=3000){const t=document.getElementById('toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(t._to);t._to=setTimeout(()=>t.classList.add('hidden'),ms);}"
    new_toast = """  function toast(msg,ms=3000){
    const t=document.getElementById('toast'),body=document.getElementById('toastBody');
    if(!t)return;
    if(body)body.textContent=msg;else t.textContent=msg;
    if(window.bootstrap?.Toast){
      const current=bootstrap.Toast.getInstance(t);if(current)current.dispose();
      new bootstrap.Toast(t,{animation:true,autohide:true,delay:ms}).show();
    }else{
      t.classList.add('show');clearTimeout(t._to);t._to=setTimeout(()=>t.classList.remove('show'),ms);
    }
  }"""
    src = replace_once(src, old_toast, new_toast, "Bootstrap Toast")
    return src


def split_javascript() -> dict[str, str]:
    src = read("Scripts.html").replace("\r\n", "\n")
    src = bootstrapify_javascript(src)

    # The legacy file exports every inline-handler function at the very end.
    # That export must execute AFTER all feature bundles, otherwise core.js can
    # reference admin/absence functions before those scripts have been parsed.
    export_tail = ""
    export_match = re.search(
        r"(?ms)^\s*// Explicit global exports for Apps Script HtmlService / inline HTML handlers\..*\Z",
        src,
    )
    if export_match:
        export_tail = src[export_match.start():].strip() + "\n"
        export_tail = export_tail.replace(
            "window.__EK_SCRIPTS_LOADED__ = true;",
            "window.__EK_SCRIPTS_LOADED__ = true;\n  document.documentElement.dataset.ekRuntime = 'ready';",
            1,
        )
        src = src[:export_match.start()].rstrip() + "\n"
    else:
        raise SystemExit("Blok global exports Scripts.html tidak ditemui")

    marker = re.compile(r"(?m)^\s*// ---------- (.*?) ----------\s*$")
    matches = list(marker.finditer(src))
    sections: list[tuple[str, str]] = []
    if matches:
        sections.append(("Prelude", src[: matches[0].start()]))
        for i, m in enumerate(matches):
            end = matches[i + 1].start() if i + 1 < len(matches) else len(src)
            sections.append((m.group(1).strip(), src[m.start() : end]))
    else:
        sections.append(("Prelude", src))

    groups = {"core": [], "attendance": [], "absence": [], "admin": []}
    for title, body in sections:
        low = title.lower()
        if any(k in low for k in ["punch on home", "own kad", "kad perakam waktu"]):
            bucket = "attendance"
        elif any(k in low for k in ["tidak hadir", "keberadaan", "semakan lewat", "balik awal"]):
            bucket = "absence"
        elif any(k in low for k in ["admin", "users", "settings", "visual map", "report"]):
            bucket = "admin"
        else:
            bucket = "core"
        groups[bucket].append(body.rstrip() + "\n")

    # Classic scripts share the same global scope. Preserve stable feature
    # order, then run the exports bundle last once every function exists.
    out = {k: "\n".join(v).strip() + "\n" for k, v in groups.items() if v}
    out["exports"] = export_tail
    return out


def bootstrapify_html(html: str) -> str:
    # Use Bootstrap nav-pills semantics while retaining the compact eKeberadaan
    # visual theme. Sidebar remains a normal panel; Collapse only controls its
    # inline mobile expansion and never turns it into an offcanvas overlay.
    html = html.replace('<aside id="sidebar" class="sidebar">', '<aside id="sidebar" class="sidebar collapse">', 1)
    html = html.replace('<nav class="menu">', '<nav class="menu nav nav-pills flex-column" aria-label="Navigasi utama">', 1)
    html = re.sub(
        r'class="menu-item([^\"]*)"',
        lambda m: f'class="menu-item nav-link{m.group(1)}"',
        html,
    )
    html = html.replace(
        '<button class="hamburger" onclick="toggleMobileMenu()">☰</button>',
        '<button class="hamburger" type="button" onclick="toggleMobileMenu()" aria-controls="sidebar" aria-expanded="false" aria-label="Buka menu navigasi">☰</button>',
        1,
    )

    old_modal = '<div id="modal" class="modal hidden" onclick="if(event.target===this) closeModal()"><div class="modal-card"><button class="modal-close" onclick="closeModal()">×</button><div id="modalContent"></div></div></div>'
    new_modal = (
        '<div id="modal" class="modal fade" tabindex="-1" aria-hidden="true">'
        '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">'
        '<div class="modal-content ek-modal-content"><div class="modal-body">'
        '<button type="button" class="btn-close ek-modal-close" aria-label="Tutup" onclick="closeModal()"></button>'
        '<div id="modalContent"></div></div></div></div></div>'
    )
    html = html.replace(old_modal, new_modal, 1)

    old_toast = '<div id="toast" class="toast hidden"></div>'
    new_toast = (
        '<div id="toast" class="toast align-items-center text-bg-dark border-0" role="status" aria-live="polite" aria-atomic="true">'
        '<div class="d-flex"><div id="toastBody" class="toast-body"></div>'
        '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Tutup"></button>'
        '</div></div>'
    )
    html = html.replace(old_toast, new_toast, 1)
    return html


def build() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    ASSETS.mkdir(parents=True)

    bootstrap_css_url, bootstrap_js_url = copy_bootstrap()
    html = bootstrapify_html(read("Index.html").replace("\r\n", "\n"))
    css_url = write_text_hashed("app", "css", clean_css())
    mobile_css_url = write_text_hashed("mobile", "css", read("web/mobile-bootstrap.css").strip() + "\n")
    logo_url = extract_logo()

    js_urls: list[str] = []
    for name, body in split_javascript().items():
        js_urls.append(write_text_hashed(name, "js", body))

    config_url = write_text_hashed("config", "js", read("web/config.js"))
    shim_url = write_text_hashed("gas-shim", "js", read("web/gas-shim.js"))

    style_tags = (
        f'<link rel="stylesheet" href="{bootstrap_css_url}">\n'
        f'  <link rel="stylesheet" href="{css_url}">\n'
        f'  <link rel="stylesheet" href="{mobile_css_url}">'
    )
    html = html.replace("<?!= include('Styles'); ?>", style_tags)
    html = html.replace(
        "<?!= include('Logo'); ?>",
        f'<img class="school-logo" alt="Logo sekolah" src="{logo_url}" decoding="async">',
    )
    html = html.replace('<main class="content">', '<main class="content container-fluid">', 1)

    # Full Bootstrap bundle must execute first. defer preserves document order,
    # so app code can safely call bootstrap.Modal/Toast/Collapse/etc.
    scripts = [bootstrap_js_url, config_url, shim_url, *js_urls]
    script_tags = "\n  ".join(f'<script src="{u}" defer></script>' for u in scripts)
    inline_scripts = re.compile(
        r"\s*<script>\s*window\.__EK_SCRIPTS_LOADED__\s*=\s*false;.*?<\?!=\s*include\('Scripts'\);\s*\?>.*?</script>",
        flags=re.I | re.S,
    )
    html, count = inline_scripts.subn("\n  " + script_tags, html, count=1)
    if count != 1:
        raise SystemExit("Blok Scripts.html dalam Index.html tidak ditemui")

    if not re.search(r'<meta\s+name=["\']viewport["\']', html, flags=re.I):
        html = html.replace(
            '<base target="_top">',
            '<base target="_top">\n  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
            1,
        )

    if re.search(r"<title>.*?</title>", html, flags=re.I | re.S):
        html = re.sub(r"<title>.*?</title>", f"<title>{TITLE}</title>", html, count=1, flags=re.I | re.S)
    else:
        html = html.replace('<base target="_top">', f'<base target="_top">\n  <title>{TITLE}</title>', 1)

    perf_head = (
        '\n  <meta name="theme-color" content="#0753b9">'
        '\n  <meta name="description" content="e-Keberadaan — Perakam Waktu Digital">'
        '\n  <link rel="preconnect" href="https://script.google.com">'
        '\n  <link rel="dns-prefetch" href="//script.google.com">'
        '\n  <link rel="dns-prefetch" href="//script.googleusercontent.com">'
        '\n  <link rel="manifest" href="./manifest.webmanifest">\n'
    )
    html = html.replace("</head>", perf_head + "</head>", 1)

    runtime_bootstrap = """(() => {
  const COMPONENTS=['Alert','Button','Carousel','Collapse','Dropdown','Modal','Offcanvas','Popover','ScrollSpy','Tab','Toast','Tooltip'];
  document.addEventListener('DOMContentLoaded',()=>{
    const ok=!!window.bootstrap&&COMPONENTS.every(name=>typeof window.bootstrap[name]==='function');
    document.documentElement.dataset.ekBootstrap=ok?'ready':'missing';
    if(ok){
      document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el=>bootstrap.Tooltip.getOrCreateInstance(el));
      document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el=>bootstrap.Popover.getOrCreateInstance(el));
      const sidebar=document.getElementById('sidebar'),toggle=document.querySelector('.hamburger');
      if(sidebar&&toggle){
        sidebar.addEventListener('show.bs.collapse',()=>toggle.setAttribute('aria-expanded','true'));
        sidebar.addEventListener('hide.bs.collapse',()=>toggle.setAttribute('aria-expanded','false'));
      }
    }
  },{once:true});
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}), {once:true});
  }
})();
"""
    runtime_url = write_text_hashed("runtime", "js", runtime_bootstrap)
    html = html.replace("</body>", f'  <script src="{runtime_url}" defer></script>\n</body>', 1)

    (OUT / "index.html").write_text(html, encoding="utf-8")
    (OUT / ".nojekyll").write_text("", encoding="utf-8")

    logo_path = logo_url.removeprefix("./")
    manifest = {
        "name": "e-Keberadaan — Perakam Waktu Digital",
        "short_name": "e-Keberadaan",
        "start_url": "./",
        "scope": "./",
        "display": "standalone",
        "background_color": "#f4f7fc",
        "theme_color": "#0753b9",
        "icons": [{"src": logo_path, "sizes": "any", "type": "image/png"}],
    }
    (OUT / "manifest.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    static_assets = [
        "./", "./index.html", "./manifest.webmanifest", logo_url,
        bootstrap_css_url, bootstrap_js_url,
        css_url, mobile_css_url, config_url, shim_url, runtime_url, *js_urls,
    ]
    sw = f"""const CACHE='eke-static-{digest('|'.join(static_assets))}';
const ASSETS={json.dumps(static_assets, separators=(',', ':'))};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('eke-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==self.location.origin)return;
  if(r.mode==='navigate'){{e.respondWith(fetch(r).then(res=>{{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res;}}).catch(()=>caches.match('./index.html')));return;}}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r)));
}});
"""
    (OUT / "sw.js").write_text(sw, encoding="utf-8")

    size = (OUT / "index.html").stat().st_size
    if size > 100_000:
        raise SystemExit(f"index.html masih terlalu besar: {size} bytes")
    built = (OUT / "index.html").read_text(encoding="utf-8")
    if "data:image" in built or "<?!=" in built or "include('Scripts')" in built:
        raise SystemExit("Static output masih mengandungi template/data URI lama")
    if "cdn.jsdelivr.net" in built:
        raise SystemExit("Bootstrap CDN masih terdapat dalam output; Bootstrap mesti self-hosted")
    if f"<title>{TITLE}</title>" not in built:
        raise SystemExit("Title hilang daripada static output")
    if "assets/exports." not in built:
        raise SystemExit("Global exports bundle tiada daripada static output")
    if (
        'name="viewport"' not in built
        or "vendor/bootstrap/bootstrap.min.css" not in built
        or "vendor/bootstrap/bootstrap.bundle.min.js" not in built
        or "assets/mobile." not in built
    ):
        raise SystemExit("Responsive/full Bootstrap layer hilang daripada static output")

    print(f"index.html: {size} bytes")
    print(f"Bootstrap: {BOOTSTRAP_VERSION} self-hosted")
    for p in sorted(ASSETS.iterdir()):
        print(f"{p.relative_to(OUT)}: {p.stat().st_size} bytes")
    for p in sorted(VENDOR.iterdir()):
        print(f"{p.relative_to(OUT)}: {p.stat().st_size} bytes")


if __name__ == "__main__":
    build()
