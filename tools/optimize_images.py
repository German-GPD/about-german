from __future__ import annotations
import hashlib
import html
import io
import re
import unicodedata
from pathlib import Path
from urllib.parse import quote
import requests
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "index.html"
ASSET_DIR = ROOT / "assets"
ASSET_DIR.mkdir(exist_ok=True)
source = HTML_PATH.read_text(encoding="utf-8")
session = requests.Session()
session.headers.update({"User-Agent": "GPD-Site-Image-Optimizer/1.0 (+https://github.com/German-GPD/about-german)"})

def safe_name(alt: str, url: str) -> str:
    text = unicodedata.normalize("NFKD", alt).encode("ascii", "ignore").decode().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", text).strip("-")[:42] or "image"
    digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:8]
    return f"{slug}-{digest}.webp"

def download(url: str) -> bytes:
    candidates = [url]
    if "wsrv.nl" not in url:
        candidates.append("https://wsrv.nl/?url=" + quote(url, safe="") + "&output=webp&w=1400&q=82")
    last_error = None
    for candidate in candidates:
        try:
            response = session.get(candidate, timeout=(12, 45))
            response.raise_for_status()
            payload = response.content
            if not payload:
                raise ValueError("empty response")
            with Image.open(io.BytesIO(payload)) as probe:
                probe.verify()
            return payload
        except Exception as exc:
            last_error = exc
    raise RuntimeError(f"Unable to download image {url}: {last_error}")

errors = []
converted = 0
pattern = re.compile(r"""(<img\b[^>]*?\bsrc=["'])([^"']+)(["'][^>]*>)""", re.IGNORECASE)

def replace_image(match: re.Match[str]) -> str:
    global converted
    prefix, raw_url, suffix = match.groups()
    url = html.unescape(raw_url)
    if not url.startswith(("http://", "https://")):
        return match.group(0)
    alt_match = re.search(r"""\balt=["']([^"']*)["']""", suffix, re.IGNORECASE)
    alt = html.unescape(alt_match.group(1)) if alt_match else "image"
    filename = safe_name(alt, url)
    destination = ASSET_DIR / filename
    try:
        if not destination.exists():
            payload = download(url)
            with Image.open(io.BytesIO(payload)) as image:
                image = ImageOps.exif_transpose(image)
                if image.width > 1600 or image.height > 1600:
                    image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
                if image.mode not in ("RGB", "RGBA"):
                    image = image.convert("RGBA" if "transparency" in image.info else "RGB")
                image.save(destination, "WEBP", quality=82, method=6)
        converted += 1
        return prefix + "assets/" + filename + suffix
    except Exception as exc:
        errors.append(str(exc))
        return match.group(0)

updated = pattern.sub(replace_image, source)
if errors:
    raise SystemExit("\n".join(errors))
HTML_PATH.write_text(updated, encoding="utf-8")
print(f"Optimized {converted} image references into assets/*.webp")
