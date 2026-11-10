from PIL import Image
from collections import deque
im=Image.open('assets/enemies/basketball.png').convert('RGBA'); w,h=im.size; px=im.load(); q=deque()
for x in range(w): q.append((x,0)); q.append((x,h-1))
for y in range(h): q.append((0,y)); q.append((w-1,y))
vis=[[False]*h for _ in range(w)]
def white(c): return c[0]>238 and c[1]>238 and c[2]>238
while q:
    x,y=q.popleft()
    if x<0 or y<0 or x>=w or y>=h or vis[x][y]: continue
    vis[x][y]=True; c=px[x,y]
    if not white(c): continue
    px[x,y]=(c[0],c[1],c[2],0); q.extend([(x+1,y),(x-1,y),(x,y+1),(x,y-1)])
bb=im.getbbox(); im=im.crop(bb); im.thumbnail((128,128),Image.LANCZOS); im.save('assets/enemies/basketball_cut.png'); print(im.size)
