from PIL import Image, ImageFilter
from collections import deque
import os

def cut(src,dst,maxside=512):
    im=Image.open(src).convert('RGBA'); w,h=im.size; px=im.load()
    # border colors
    cols=[]
    for x in range(0,w,6):
        cols += [px[x,0], px[x,h-1]]
    for y in range(0,h,6):
        cols += [px[0,y], px[w-1,y]]
    def near(c,s):
        return (c[0]-s[0])**2+(c[1]-s[1])**2+(c[2]-s[2])**2 < 2200
    vis=[[False]*h for _ in range(w)]
    q=deque()
    for x in range(w):
        q.append((x,0)); q.append((x,h-1))
    for y in range(h):
        q.append((0,y)); q.append((w-1,y))
    while q:
        x,y=q.popleft()
        if x<0 or y<0 or x>=w or y>=h or vis[x][y]: continue
        vis[x][y]=True
        c=px[x,y]
        if not any(near(c,s) for s in cols): continue
        px[x,y]=(c[0],c[1],c[2],0)
        q.extend([(x+1,y),(x-1,y),(x,y+1),(x,y-1)])
    a=im.split()[3].filter(ImageFilter.GaussianBlur(1.0)); im.putalpha(a)
    bb=im.getbbox(); im=im.crop(bb)
    if max(im.size)>maxside:
        im.thumbnail((maxside,maxside),Image.LANCZOS)
    im.save(dst)

for k in ['kunkun','cthulhu','giant','security','spike','spikejr','cowhead','goodjerry','angryjerry','escort','carrot','ice','rocket','cake']:
    try:
        cut(f'assets/enemies/{k}.png', f'assets/enemies/{k}_cut.png', 512 if k in ('kunkun','cthulhu','giant') else 256)
        print('ok',k)
    except Exception as e:
        print('fail',k,e)
