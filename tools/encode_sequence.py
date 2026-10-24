"""Encode a recorded session into the story's image sequences, stills and manifest.

    python tools/encode_sequence.py <scam|resume> <rawDir> <outDir>

Frames: desktop 1600x1000 WebP (q 72), phone 585x1266 WebP (q 70). Stills: crops of the desktop
recording for each moment (what the moment is about, at a readable size). The manifest records the
moment frame ranges, a view (focus rectangle) per moment for the desktop scrub, and the result the app
showed during the recording, so tests can hold the captions to it.
"""

import json
import sys
from pathlib import Path

from PIL import Image

app, raw, out = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3])
session = json.loads((raw / "session.json").read_text())
out.mkdir(parents=True, exist_ok=True)

SIZES = {"desktop": ((1600, 1000), 72), "phone": ((585, 1266), 70)}


def clamp_view(cx, cy, w, vw=1280, vh=800, aspect=1.6):
    w = min(w, vw)
    h = w / aspect
    x = min(max(cx - w / 2, 0), vw - w)
    y = min(max(cy - h / 2, 0), vh - h)
    return [round(x), round(y), round(w), round(h)]


def pad(r, p, vw=1280, vh=800):
    x, y, w, h = r
    x0, y0 = max(0, x - p), max(0, y - p)
    return [x0, y0, min(vw, x + w + p) - x0, min(vh, y + h + p) - y0]


manifest = {"app": app, "recordedAt": session["recordedAt"]}
for form, info in session["forms"].items():
    (size, quality) = SIZES[form]
    d = out / form
    d.mkdir(exist_ok=True)
    for i in range(info["frames"]):
        im = Image.open(raw / form / f"{i + 1:03d}.png").convert("RGB").resize(size, Image.LANCZOS)
        im.save(d / f"{i + 1:03d}.webp", "WEBP", quality=quality, method=6)
    entry = {"width": size[0], "height": size[1], "frames": info["frames"], "moments": info["moments"]}
    if form == "desktop":
        v = info["views"]
        verdict, result, compose = v["verdict"], v["result"], v["compose"]
        full = [0, 0, 1280, 800]
        # A gentle push in (1.33x) on what each moment is about; the rest of the screen stays in frame.
        focus2 = clamp_view(result[0] + result[2] / 2, result[1] + result[3] * 0.3, 960)
        if app == "scam":
            focus3 = full
            crops = [pad(compose, 16), pad([result[0], result[1], result[2], verdict[3] + 150], 16), pad(result, 16)]
        else:
            s = v["skills"]
            focus3 = clamp_view(s[0] + s[2] / 2, s[1] + s[3] / 2, 960)
            crops = [pad(compose, 16), pad([result[0], result[1], result[2], verdict[3] + 150], 16), pad(s, 20)]
        k = size[0] / 1280
        entry["views"] = [[round(c * k) for c in r] for r in (full, focus2, focus3)]
        # Stills from the 2x recording, at each moment's last frame.
        for m, (crop, (a, b)) in enumerate(zip(crops, info["moments"])):
            src = Image.open(raw / form / f"{b:03d}.png").convert("RGB")
            x, y, w, h = [c * info["scale"] for c in crop]
            still = src.crop((x, y, x + w, y + h))
            if still.width > 1200:
                still = still.resize((1200, round(still.height * 1200 / still.width)), Image.LANCZOS)
            still.save(out / f"still-{m + 1}.webp", "WEBP", quality=80, method=6)
            entry.setdefault("stills", []).append([still.width, still.height])
    manifest[form] = entry
    manifest.setdefault("result", info["result"])

(out / "manifest.json").write_text(json.dumps(manifest, indent=1))
total = sum(f.stat().st_size for f in out.rglob("*.webp"))
print(app, {f: manifest[f]["frames"] for f in ("desktop", "phone")}, f"{total / 1e6:.1f} MB")
