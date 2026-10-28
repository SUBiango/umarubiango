"""Render the UB stamp from the site header as favicon assets."""
import os
from PIL import Image, ImageDraw, ImageFont
import pathlib

PAPER = (227, 216, 197, 255)   # --paper
RUST  = (138, 59, 30, 255)     # --rust
FONT  = os.environ.get('SPACE_MONO_TTF', '/tmp/SpaceMono-Bold.ttf')
OUT   = pathlib.Path(__file__).resolve().parent.parent / 'assets/images/favicon'

SS = 1024                       # supersample canvas, downsampled per target
RING_R = 0.455                  # outer radius as a fraction of the canvas
RING_W = 0.075                  # stroke width, ditto
CAP_H  = 0.34                   # target cap height of "UB"
TILT   = -8                     # degrees, same as .brand-stamp


def stamp(size=SS, bg=PAPER):
    img = Image.new('RGBA', (size, size), bg)
    d = ImageDraw.Draw(img)

    r, w = RING_R * size, RING_W * size
    c = size / 2
    d.ellipse([c - r, c - r, c + r, c + r], outline=RUST, width=int(round(w)))

    # Size the type by measured cap height, not by nominal point size.
    target = CAP_H * size
    px = int(target * 1.6)
    for _ in range(40):
        f = ImageFont.truetype(FONT, px)
        box = f.getbbox('UB')
        h = box[3] - box[1]
        if abs(h - target) <= 1:
            break
        px = max(1, int(round(px * target / h)))
    f = ImageFont.truetype(FONT, px)

    # Draw on its own layer so the tilt doesn't chew the ring.
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    box = f.getbbox('UB')
    ld.text((c - (box[0] + box[2]) / 2, c - (box[1] + box[3]) / 2), 'UB', font=f, fill=RUST)
    layer = layer.rotate(TILT, resample=Image.BICUBIC, center=(c, c))

    img.alpha_composite(layer)
    return img


def save(img, name, size):
    img.resize((size, size), Image.LANCZOS).save(OUT / name)
    print('  %-34s %dx%d' % (name, size, size))


master = stamp()
OUT.mkdir(parents=True, exist_ok=True)
save(master, 'favicon-96x96.png', 96)
save(master, 'apple-touch-icon.png', 180)
save(master, 'web-app-manifest-192x192.png', 192)
save(master, 'web-app-manifest-512x512.png', 512)

# .ico carries its own small sizes, each downsampled from the master.
master.resize((256, 256), Image.LANCZOS).save(
    OUT / 'favicon.ico', format='ICO',
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print('  %-34s multi-size' % 'favicon.ico')

# A contact sheet to eyeball the small sizes.
sheet = Image.new('RGBA', (560, 140), (250, 250, 250, 255))
x = 20
for s in (16, 24, 32, 48, 64, 96, 128):
    sheet.alpha_composite(master.resize((s, s), Image.LANCZOS), (x, 20 + (128 - s) // 2))
    x += s + 20
sheet.save('/tmp/favicon-sheet.png')
print('  contact sheet -> /tmp/favicon-sheet.png')
