"""Write the vehicle counter's tracker log for the frames the story shows.

    python tools/track_log.py <tracks.json> public/sequences/traffic/manifest.json public/sequences/traffic/log.json

<tracks.json> is the run's output from the app's track.py. For each source frame in the manifest's
sequence, this keeps the tracks the counter had confirmed at that frame, one line each:
frame, class, track ID and box (x1 y1 x2 y2 in source pixels). The page draws these lines, very faint,
behind the vehicle counter's stage and the hand-off before it.
"""

import json
import sys

tracks_path, manifest_path, out_path = sys.argv[1:4]
tracks = json.load(open(tracks_path))
manifest = json.load(open(manifest_path))

lines = []
for src in manifest["sourceFrames"]:
    for t in tracks["frames"][src]["tracks"]:
        x1, y1, x2, y2 = t["box"]
        lines.append({"frame": src, "cls": t["cls"], "id": t["id"], "box": [x1, y1, x2, y2]})

out = {
    "source": manifest["source"]["title"],
    "model": tracks["model"],
    "tracker": tracks["tracker"],
    "lines": lines,
}
with open(out_path, "w") as f:
    json.dump(out, f, separators=(",", ":"))
print(f"{len(lines)} lines from {len(manifest['sourceFrames'])} frames")
