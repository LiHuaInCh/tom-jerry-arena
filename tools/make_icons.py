# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw
import os

BASE = 'android/app/src/main/res'
src = Image.open('assets/brand/icon.png').convert('RGBA')
w, h = src.size
side = min(w, h)
src = src.crop(((w - side) // 2, (h - side) // 2, (w + side) // 2, (h + side) // 2))

dens = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
cream = (250, 235, 203, 255)

for name, size in dens.items():
    d = os.path.join(BASE, 'mipmap-' + name)
    os.makedirs(d, exist_ok=True)
    # legacy rounded square
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    dr = ImageDraw.Draw(canvas)
    r = int(size * 0.22)
    dr.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=cream)
    inner = int(size * 0.86)
    im = src.resize((inner, inner), Image.LANCZOS)
    canvas.alpha_composite(im, ((size - inner) // 2, (size - inner) // 2))
    canvas.save(os.path.join(d, 'ic_launcher.png'))
    # round
    round_c = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    dr = ImageDraw.Draw(round_c)
    dr.ellipse([0, 0, size - 1, size - 1], fill=cream)
    round_c.alpha_composite(im, ((size - inner) // 2, (size - inner) // 2))
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    round_c.putalpha(mask)
    round_c.save(os.path.join(d, 'ic_launcher_round.png'))
    # adaptive foreground (safe zone ~66%)
    fg_size = int(size * 2.25)
    fg = Image.new('RGBA', (fg_size, fg_size), (0, 0, 0, 0))
    inner_fg = int(fg_size * 0.56)
    fg.alpha_composite(src.resize((inner_fg, inner_fg), Image.LANCZOS),
                       ((fg_size - inner_fg) // 2, (fg_size - inner_fg) // 2))
    fg.save(os.path.join(d, 'ic_launcher_foreground.png'))
print('icons generated')
