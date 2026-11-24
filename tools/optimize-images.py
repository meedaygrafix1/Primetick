"""Make lightweight copies of the site's images (run after adding a photo).

    python tools/optimize-images.py

Reads assets/watches/*.jpg and assets/cutouts/*.png, writes WebP copies to
assets/img/ and assets/og-image.jpg. Originals are left untouched."""
import json, os, sys
from PIL import Image, ImageOps

root = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src_w, src_c = os.path.join(root, "assets", "watches"), os.path.join(root, "assets", "cutouts")
out = os.path.join(root, "assets", "img")
os.makedirs(os.path.join(out, "watches"), exist_ok=True)
os.makedirs(os.path.join(out, "cutouts"), exist_ok=True)
report, dims = [], {}

def fit(im, long_edge=None, width=None, height=None):
    w, h = im.size
    s = 1.0
    if long_edge: s = min(1.0, long_edge / max(w, h))
    if width: s = min(1.0, width / w)
    if height: s = min(1.0, height / h)
    return im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1 else im

def save(im, path, **kw):
    im.save(path, **kw)
    return os.path.getsize(path)

# Catalogue photographs: 640w for the grid and the deck, 1280 long edge for the quick view.
for f in sorted(os.listdir(src_w)):
    if not f.lower().endswith(".jpg"): continue
    name = f[:-4]
    im = ImageOps.exif_transpose(Image.open(os.path.join(src_w, f))).convert("RGB")
    before = os.path.getsize(os.path.join(src_w, f))
    a = save(fit(im, width=640), os.path.join(out, "watches", f"{name}-640.webp"), quality=74, method=6)
    big = fit(im, long_edge=1280)
    b = save(big, os.path.join(out, "watches", f"{name}-1280.webp"), quality=76, method=6)
    report.append((f, before, a, b))

# Cutouts: transparent WebP, at most 960px tall (the hero shows them ~470px tall, x2 for sharp screens).
for f in sorted(os.listdir(src_c)):
    if not f.lower().endswith(".png"): continue
    name = f[:-4]
    im = Image.open(os.path.join(src_c, f)).convert("RGBA")
    bbox = im.getchannel("A").getbbox()          # trim empty transparent margins
    if bbox: im = im.crop(bbox)
    im = fit(im, height=960)
    before = os.path.getsize(os.path.join(src_c, f))
    a = save(im, os.path.join(out, "cutouts", f"{name}.webp"), quality=80, method=6, exact=False)
    dims[name] = im.size
    report.append((f, before, a, None))

# Share image: JPEG (WebP previews are not supported everywhere).
og = os.path.join(root, "assets", "og-image.png")
if os.path.exists(og):
    before = os.path.getsize(og)
    a = save(Image.open(og).convert("RGB"), os.path.join(root, "assets", "og-image.jpg"), quality=84, optimize=True, progressive=True)
    report.append(("og-image.png", before, a, None))

tot_b = sum(r[1] for r in report)
for f, b, a, c in report:
    print(f"{f:16} {b/1024:8.0f} KB -> {a/1024:6.0f} KB" + (f"  (+ {c/1024:.0f} KB large)" if c else ""))
print("cutout sizes:", json.dumps(dims))
