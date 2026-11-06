# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw

S = 1024
cream = (250, 235, 203, 255)
gold = (232, 178, 58, 255)
icon = Image.new('RGBA', (S, S), cream)
dr = ImageDraw.Draw(icon)
ring_r = 470
dr.ellipse([S//2-ring_r, S//2-ring_r, S//2+ring_r, S//2+ring_r], outline=gold, width=26)

face = Image.open('assets/portraits/jerry.png').convert('RGBA')
d = 690
inner = face.resize((d, d), Image.LANCZOS)
mask = Image.new('L', (d, d), 0)
ImageDraw.Draw(mask).ellipse([0, 0, d, d], fill=255)
icon.paste(inner, (S//2 - d//2, S//2 - d//2), mask)
icon.resize((512, 512), Image.LANCZOS).save('assets/brand/icon.png')
print('ok')
