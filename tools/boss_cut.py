from PIL import Image, ImageFilter
from collections import deque
import math

def cutout(src, dst):
    im = Image.open(src).convert('RGBA')
    w,h = im.size
    px = im.load()
    # collect background colors from border
    samples=[]
    for x in range(0,w,8):
        samples.append(px[x,0]); samples.append(px[x,h-1])
    for y in range(0,h,8):
        samples.append(px[0,y]); samples.append(px[w-1,y])
    def near(c, s):
        return (c[0]-s[0])**2 + (c[1]-s[1])**2 + (c[2]-s[2])**2 < 2600
    visited=[[False]*h for _ in range(w)]
    q=deque()
    for x in range(w):
        for y in (0,h-1):
            q.append((x,y))
    for y in range(h):
        for x in (0,w-1):
            q.append((x,y))
    while q:
        x,y=q.popleft()
        if x<0 or y<0 or x>=w or y>=h or visited[x][y]: continue
        visited[x][y]=True
        c=px[x,y]
        if not any(near(c,s) for s in samples):
            continue
        px[x,y]=(c[0],c[1],c[2],0)
        q.extend([(x+1,y),(x-1,y),(x,y+1),(x,y-1)])
    # feather alpha
    alpha=im.split()[3].filter(ImageFilter.GaussianBlur(1.0))
    im.putalpha(alpha)
    bb=im.getbbox(); im=im.crop(bb)
    w2=470; h2=int(im.height*w2/im.width)
    im=im.resize((w2,h2),Image.LANCZOS)
    canvas=Image.new('RGBA',(512,512),(0,0,0,0))
    canvas.alpha_composite(im,((512-w2)//2,(512-h2)//2))
    canvas.save(dst)
    print(dst,w2,h2)

for k in ['qianchang','angryqc','chenjr']:
    cutout(f'assets/bosses/{k}.png', f'assets/bosses/{k}_cut.png')
