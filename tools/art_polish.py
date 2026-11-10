from PIL import Image, ImageFilter
def outline(im,px=3,color=(58,36,24,240)):
    a=im.split()[3]; g=a.filter(ImageFilter.MaxFilter(px*2+1)).filter(ImageFilter.GaussianBlur(0.5))
    o=Image.new('RGBA',im.size,color); o.putalpha(g)
    return Image.alpha_composite(o,im)
# bunny: add breathing padding then outline
im=Image.open('assets/enemies/bunny_big.png').convert('RGBA')
pad=Image.new('RGBA',(im.width+10,im.height+10),(0,0,0,0)); pad.alpha_composite(im,(5,5))
pad.thumbnail((256,256),Image.LANCZOS); pad.save('assets/enemies/bunny_big.png')
# cheese and basketball subtle outline
for f in ['cheese_cut','basketball_cut']:
    im=Image.open('assets/enemies/%s.png'%f).convert('RGBA')
    canvas=Image.new('RGBA',(im.width+8,im.height+8),(0,0,0,0)); canvas.alpha_composite(im,(4,4))
    canvas=outline(canvas,2); canvas.save('assets/enemies/%s.png'%f)
    print(f, canvas.size)
