#!/usr/bin/env python3
"""Make the two sizes the gallery needs from one photo.

Usage:  python3 tools/add_photo.py path/to/photo.jpg my-photo-id
Creates assets/img/gallery/my-photo-id.jpg (1600 px wide) and my-photo-id-sm.jpg (640 px wide),
then prints the line to paste into js/gallery-data.js.
Needs Pillow:  pip install pillow
"""
import sys, os
from PIL import Image, ImageOps

if len(sys.argv) != 3:
    sys.exit(__doc__)
src, pid = sys.argv[1], sys.argv[2]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "img", "gallery")
os.makedirs(out, exist_ok=True)
im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
for suffix, width, q in (("", 1600, 82), ("-sm", 640, 80)):
    w = min(width, im.width)
    r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    r.save(os.path.join(out, f"{pid}{suffix}.jpg"), "JPEG", quality=q, optimize=True, progressive=True)
print(f'Add to js/gallery-data.js:\n  {{ id: "{pid}", category: "Classroom", caption: "Your caption", alt: "Describe the photo" }},')
