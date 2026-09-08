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
TITLE = "e-Keberadaan — Perakam Waktu Digital"
BOOTSTRAP_GRID_CSS = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-grid.min.css"


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


def split_javascript() -> dict[str, str]:
    src = read("Scripts.html").replace("\r\n", "\n")

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


def build() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    ASSETS.mkdir(parents=True)

    html = read("Index.html").replace("\r\n", "\n")
    css_url = write_text_hashed("app", "css", clean_css())
    mobile_css_url = write_text_hashed("mobile", "css", read("web/mobile-bootstrap.css").strip() + "\n")
    logo_url = extract_logo()

    js_urls: list[str] = []
    for name, body in split_javascript().items():
        js_urls.append(write_text_hashed(name, "js", body))

    config_url = write_text_hashed("config", "js", read("web/config.js"))
    shim_url = write_text_hashed("gas-shim", "js", read("web/gas-shim.js"))

    style_tags = (
        '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>\n'
        f'  <link rel="stylesheet" href="{BOOTSTRAP_GRID_CSS}">\n'
        f'  <link rel="stylesheet" href="{css_url}">\n'
        f'  <link rel="stylesheet" href="{mobile_css_url}">'
    )
    html = html.replace("<?!= include('Styles'); ?>", style_tags)
    html = html.replace(
        "<?!= include('Logo'); ?>",
        f'<img class="school-logo" alt="Logo sekolah" src="{logo_url}" decoding="async">',
    )
    # Bootstrap container utility complements the existing content max-width.
    html = html.replace('<main class="content">', '<main class="content container-fluid">', 1)

    scripts = [config_url, shim_url, *js_urls]
    script_tags = "\n  ".join(f'<script src="{u}" defer></script>' for u in scripts)
    inline_scripts = re.compile(
        r"\s*<script>\s*window\.__EK_SCRIPTS_LOADED__\s*=\s*false;.*?<\?!=\s*include\('Scripts'\);\s*\?>.*?</script>",
        flags=re.I | re.S,
    )
    html, count = inline_scripts.subn("\n  " + script_tags, html, count=1)
    if count != 1:
        raise SystemExit("Blok Scripts.html dalam Index.html tidak ditemui")

    # The static GitHub Pages build must provide its own viewport meta. The old
    # Apps Script deployment previously added this server-side via HtmlService.
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

    sw_bootstrap = """(() => {
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}), {once:true});
  }
})();
"""
    bootstrap_url = write_text_hashed("bootstrap", "js", sw_bootstrap)
    html = html.replace("</body>", f'  <script src="{bootstrap_url}" defer></script>\n</body>', 1)

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

    static_assets = ["./", "./index.html", "./manifest.webmanifest", logo_url, css_url, mobile_css_url, config_url, shim_url, bootstrap_url, *js_urls]
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
    if f"<title>{TITLE}</title>" not in built:
        raise SystemExit("Title hilang daripada static output")
    if "assets/exports." not in built:
        raise SystemExit("Global exports bundle tiada daripada static output")
    if 'name="viewport"' not in built or "bootstrap-grid.min.css" not in built or "assets/mobile." not in built:
        raise SystemExit("Responsive Bootstrap/viewport layer hilang daripada static output")

    print(f"index.html: {size} bytes")
    for p in sorted(ASSETS.iterdir()):
        print(f"{p.relative_to(OUT)}: {p.stat().st_size} bytes")


if __name__ == "__main__":
    build()
