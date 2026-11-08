from PIL import Image
import os
parts = {
 'jerry': [(0.0,0.42,'head'),(0.30,0.80,'torso'),(0.60,1.0,'legs')],
 'swordsman': [(0.0,0.42,'head'),(0.30,0.80,'torso'),(0.60,1.0,'legs')],
 'tuffy': [(0.0,0.42,'head'),(0.30,0.80,'torso'),(0.60,1.0,'legs')],
}
for cid, ps in parts.items():
    src=f'assets/sprites/{cid}.png'
    if not os.path.exists(src): print('miss',src); continue
    im=Image.open(src).convert('RGBA'); w,h=im.size
    for y0,y1,name in ps:
        top=int(h*y0); bot=int(h*y1)
        crop=im.crop((0,top,w,bot))
        # feather internal edges
        alpha=crop.split()[3]
        px=alpha.load()
        fade=8
        for y in range(min(fade,crop.height)):
            f=y/fade
            for x in range(crop.width):
                a=px[x,y]; px[x,y]=(a[0],a[1],a[2],int(a[3]*f)) if isinstance(a,tuple) else int(a*f)
        for y in range(max(0,crop.height-fade),crop.height):
            f=(crop.height-1-y)/fade
            for x in range(crop.width):
                a=px[x,y]; px[x,y]=(a[0],a[1],a[2],int(a[3]*f)) if isinstance(a,tuple) else int(a*f)
        out=f'assets/sprites/{cid}_{name}.png'
        crop.save(out); print(out,crop.size)
