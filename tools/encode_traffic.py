"""Encode the vehicle counter's annotated frames into the story's sequence, stills and manifest.

    python tools/encode_traffic.py <framesDir> <tracks.json> <outDir> [--every 3] [--count 120]

<framesDir> holds the annotated frames written by the app's render.py (--frames-dir, every frame or
every Nth, named by source frame index). The sequence takes every Nth source frame from the start;
the running totals for each come from the same run's tracks.json, so the numbers on the page are the
ones the counter reached at that frame.
"""

import argparse
import json
from pathlib import Path

from PIL import Image

a = argparse.ArgumentParser()
a.add_argument("frames")
a.add_argument("tracks")
a.add_argument("out")
a.add_argument("--every", type=int, default=3)
a.add_argument("--count", type=int, default=120)
args = a.parse_args()

frames_dir, out = Path(args.frames), Path(args.out)
data = json.loads(Path(args.tracks).read_text())
(out / "desktop").mkdir(parents=True, exist_ok=True)

indices = [i * args.every for i in range(args.count) if i * args.every < len(data["frames"])]
n = len(indices)
third = n // 3
moments = [[0, third], [third, 2 * third], [2 * third, n]]
counts = []
for k, src in enumerate(indices):
    im = Image.open(frames_dir / f"{src:05d}.png").convert("RGB")
    im.resize((1280, 720), Image.LANCZOS).save(out / "desktop" / f"{k + 1:03d}.webp", "WEBP", quality=58, method=6)
    counts.append(data["frames"][src]["counts"])
    for m, (s, e) in enumerate(moments):
        if k == e - 1:
            im.resize((1600, 900), Image.LANCZOS).save(out / f"still-{m + 1}.webp", "WEBP", quality=80, method=6)

manifest = {
    "app": "traffic",
    "source": {"title": "Intersection Pie-IX-Sherbrooke", "author": "Thomas1313", "licence": "CC BY-SA 4.0",
               "url": "https://commons.wikimedia.org/wiki/File:Intersection_Pie-IX-Sherbrooke.webm"},
    "fps": data["fps"] / args.every,
    "sourceFrames": indices,
    "desktop": {"width": 1280, "height": 720, "frames": n, "moments": moments, "counts": counts, "stills": [[1600, 900]] * 3},
    "result": {"final": counts[-1], "model": data["model"], "tracker": data["tracker"], "counting": data["counting"]},
}
(out / "manifest.json").write_text(json.dumps(manifest, indent=1))
size = sum(f.stat().st_size for f in out.rglob("*.webp"))
print(f"{n} frames, final counts {counts[-1]}, {size / 1e6:.1f} MB")
