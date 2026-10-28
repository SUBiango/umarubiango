"""
Build assets/images/og-image.jpg — the 1200x630 link-preview card for every
non-note page.

Facebook and X render only the title in a preview, so any wording that has to
survive into one lives inside this image (see CLAUDE.md). The card is built
from the site's own materials: paper grain, the about-page polaroid, the
thesis in Fraunces with its highlighter.

Pillow cannot read .woff2, so this needs TTF copies of the site fonts:

    pip install 'fonttools[woff]'
    python -c "from fontTools.ttLib import TTFont; \\
      f=TTFont('assets/fonts/fraunces-latin-700-soft-wonk.woff2'); \\
      f.flavor=None; f.save('/tmp/fraunces.ttf')"

then point the FRAUNCES_TTF / CAVEAT_TTF / SPACE_MONO_TTF env vars at them.
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import pathlib

W, H = 1200, 630
PAPER=(227,216,197); SHEET=(251,247,239); RUST=(138,59,30)
INK=(31,26,21); MUTED=(85,75,64); PEN=(44,58,92); HILITE=(184,140,62)
ROOT = pathlib.Path(__file__).resolve().parent.parent
GRAIN = Image.open(ROOT / 'assets/paper-grain.png').convert('RGBA')
PHOTO = Image.open(ROOT / 'assets/images/umaru.webp').convert('RGB')
F  = lambda s: ImageFont.truetype(os.environ.get('FRAUNCES_TTF', '/tmp/fraunces.ttf'), s)
M  = lambda s: ImageFont.truetype(os.environ.get('SPACE_MONO_TTF', '/tmp/SpaceMono-Bold.ttf'), s)
C  = lambda s: ImageFont.truetype(os.environ.get('CAVEAT_TTF', '/tmp/caveat.ttf'), s)

def paper(w=W, h=H):
    img = Image.new('RGB', (w, h), PAPER)
    for y in range(0, h, 256):
        for x in range(0, w, 256):
            img.paste(GRAIN, (x, y), GRAIN)
    return img

def burn(img):
    """The page's inset burned edge, approximated with a blurred frame."""
    mask = Image.new('L', img.size, 0)
    d = ImageDraw.Draw(mask)
    d.rectangle([0, 0, img.width, img.height], fill=88)
    d.rectangle([54, 54, img.width - 54, img.height - 54], fill=0)
    mask = mask.filter(ImageFilter.GaussianBlur(42))
    img.paste(Image.new('RGB', img.size, (92, 52, 20)), (0, 0), mask)
    return img

def polaroid(size=300):
    """The about-page polaroid, tilted, with its caption."""
    pad, cap = 17, 68
    w = size; h = size + cap - pad
    card = Image.new('RGBA', (w, h), SHEET + (255,))
    ph = size - pad * 2
    card.paste(PHOTO.resize((ph, ph), Image.LANCZOS), (pad, pad))
    d = ImageDraw.Draw(card)
    d.rectangle([0, 0, w - 1, h - 1], outline=(207, 194, 170), width=1)
    f = C(34)
    t = 'me & the boss'
    d.text(((w - d.textlength(t, font=f)) / 2, h - cap + 14), t, font=f, fill=PEN)
    tape = Image.new('RGBA', (110, 30), (206, 186, 146, 235))
    card.alpha_composite(tape.rotate(3, expand=True, resample=Image.BICUBIC), (85, 0))
    return card.rotate(-4, expand=True, resample=Image.BICUBIC)

def runs(img, d, lines, font, x, y, lh, fill=INK):
    """Draw [(text, highlighted)] segments, highlighter band behind."""
    for segs in lines:
        cx = x
        for text, hi in segs:
            w = d.textlength(text, font=font)
            if hi:
                asc, _ = font.getmetrics()
                box = (int(cx), int(y + asc * 0.32), int(cx + w), int(y + asc * 0.98))
                band = img.crop(box)
                band = Image.blend(band, Image.new('RGB', band.size, HILITE), 0.38)
                img.paste(band, box[:2])
            cx += w
        cx = x
        for text, hi in segs:
            d.text((cx, y), text, font=font, fill=fill)
            cx += d.textlength(text, font=font)
        y += lh
    return y

THESIS = [[('Systems designed', False)],
          [('where ', False), ('constraints', True)],
          [('are real.', True)]]

# ---- The card ----
card = burn(paper()); d = ImageDraw.Draw(card)
p = polaroid(312)
px, py = 74, (H - p.height) // 2
shadow = Image.new('RGBA', card.size, (0, 0, 0, 0))
shadow.paste(Image.new('RGBA', p.size, (43, 36, 29, 70)), (px + 4, py + 12), p)
card.paste(Image.alpha_composite(card.convert('RGBA'),
           shadow.filter(ImageFilter.GaussianBlur(14))).convert('RGB'), (0, 0))
card.paste(p, (px, py), p)

x = 452
d.text((x, 96), 'FIELD NOTEBOOK · VOL. 1', font=M(20), fill=MUTED)
end = runs(card, d, THESIS, F(74), x, 150, 94)
d.text((x, end + 34), 'umarubiango.com', font=M(24), fill=RUST)

out = pathlib.Path(__file__).resolve().parent.parent / 'assets/images/og-image.jpg'
card.save(out, quality=76, optimize=True, progressive=True)
print(out, out.stat().st_size, 'bytes')
