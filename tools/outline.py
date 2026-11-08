from PIL import Image, ImageFilter
import glob, os
files = glob.glob('assets/enemies/*_cut.png') + glob.glob('assets/bosses/*_cut.png')
skip = ('cake_cut','carrot_cut','ice_cut','rocket_cut')
for p in files:
    if any(s in p for s in skip): continue
    im = Image.open(p).convert('RGBA')
    a = im.split()[3]
    grow = a.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(0.6))
    outline = Image.new('RGBA', im.size, (58,36,24,240))
    outline.putalpha(grow)
    out = Image.alpha_composite(outline, im)
    out.save(p)
    print(p, im.size)
