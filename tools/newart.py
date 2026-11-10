from PIL import Image, ImageFilter
from collections import deque
def cut(src,dst,size,outline=False):
    im=Image.open(src).convert('RGBA'); w,h=im.size; px=im.load(); q=deque()
    for x in range(w): q.append((x,0)); q.append((x,h-1))
    for y in range(h): q.append((0,y)); q.append((w-1,y))
    vis=[[False]*h for _ in range(w)]
    def white(c): return c[0]>235 and c[1]>235 and c[2]>235
    while q:
        x,y=q.popleft()
        if x<0 or y<0 or x>=w or y>=h or vis[x][y]: continue
        vis[x][y]=True; c=px[x,y]
        if not white(c): continue
        px[x,y]=(c[0],c[1],c[2],0); q.extend([(x+1,y),(x-1,y),(x,y+1),(x,y-1)])
    bb=im.getbbox(); im=im.crop(bb)
    im.thumbnail((size,size),Image.LANCZOS)
    if outline:
        a=im.split()[3]; grow=a.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(0.6))
        o=Image.new('RGBA',im.size,(58,36,24,240)); o.putalpha(grow)
        im=Image.alpha_composite(o,im)
    im.save(dst); print(dst, im.size)
cut('assets/enemies/giant.png','assets/enemies/giant_big.png',700,True)
cut('assets/enemies/cheese.png','assets/enemies/cheese_cut.png',128,False)
