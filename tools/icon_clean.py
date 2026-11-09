from PIL import Image, ImageFilter
import glob, numpy as np, os
n=0
for p in glob.glob('assets/weapon-icons/*.png'):
    try:
        im=Image.open(p).convert('RGBA')
    except Exception as e:
        print('skip',p,e); continue
    a=np.array(im.split()[3]).astype(np.float32)
    # kill faint outer glow, keep solid body
    a=np.clip((a-60)/195.0,0,1)*255
    im.putalpha(Image.fromarray(a.astype('uint8')))
    bb=im.getbbox(); 
    if bb: im=im.crop(bb)
    im.thumbnail((240,240),Image.LANCZOS)
    im.save(p)
    n+=1
print('processed',n)
