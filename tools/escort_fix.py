from PIL import Image, ImageFilter
im=Image.open('assets/enemies/escort.png').convert('RGBA')
w,h=im.size
im=im.resize((w*2,h*2),Image.LANCZOS)
a=im.split()[3]
grow=a.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(0.6))
outline=Image.new('RGBA',im.size,(58,36,24,240)); outline.putalpha(grow)
Image.alpha_composite(outline,im).save('assets/enemies/escort_big.png')
print('ok', im.size)
