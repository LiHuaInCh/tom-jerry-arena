from PIL import Image, ImageFilter, ImageDraw
import glob, os
# simple white-bg removal for character stickers
def cut(src, dst, size=160):
    im=Image.open(src).convert('RGBA')
    w,h=im.size
    # remove near-white from borders via flood fill
    from collections import deque
    px=im.load(); q=deque()
    for x in range(w): q.append((x,0)); q.append((x,h-1))
    for y in range(h): q.append((0,y)); q.append((w-1,y))
    vis=[[False]*h for _ in range(w)]
    def white(c): return c[0]>238 and c[1]>238 and c[2]>238
    while q:
        x,y=q.popleft()
        if x<0 or y<0 or x>=w or y>=h or vis[x][y]: continue
        vis[x][y]=True
        c=px[x,y]
        if not white(c): continue
        px[x,y]=(c[0],c[1],c[2],0)
        q.extend([(x+1,y),(x-1,y),(x,y+1),(x,y-1)])
    bb=im.getbbox(); im=im.crop(bb)
    im.thumbnail((size,size),Image.LANCZOS)
    im.save(dst)
for name in ['angry','smug','rabbit','good','creepy','catstand']:
    p=f'assets/emotes/src_{name}.img'
    if os.path.exists(p):
        try: cut(p, f'assets/emotes/{name}.png'); print(name,'ok')
        except Exception as e: print(name,'fail',e)
# face: center square with rounded border kept
p='assets/emotes/src_face.img'
im=Image.open(p).convert('RGBA'); w,h=im.size; s=min(w,h)
im=im.crop(((w-s)//2,(h-s)//2,(w-s)//2+s,(h-s)//2+s)).resize((160,160),Image.LANCZOS)
im.save('assets/emotes/face.png'); print('face ok')
