from PIL import Image, ImageFilter
from collections import deque
def cut(src,dst,size,outline=True):
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
    bb=im.getbbox(); im=im.crop(bb); im.thumbnail((size,size),Image.LANCZOS)
    if outline:
        a=im.split()[3]; grow=a.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(0.5))
        o=Image.new('RGBA',im.size,(58,36,24,240)); o.putalpha(grow)
        im=Image.alpha_composite(o,im)
    im.save(dst); print(dst, im.size)
A='C:/Users/26370/.dsh/attachments/v1/objects/'
cut(A+'bf/bf78cc4d4ef355b0c236e78c52cb2d197c09e347b8919def268d5314c7892d2b','assets/enemies/bunny_big.png',256)
cut(A+'3b/3b1177ed7b036d5e316bc13025869a79bb9c8ff49a703d63ef0984b64d21dc11','assets/enemies/milk_big.png',256)
cut(A+'a5/a57747f005e30f751e3b99651df0c632004143c2a4f9b54f9d6c1bb7eeee1415','assets/enemies/angel_big.png',256)
cut(A+'13/1351018f70cbe22bcdd77b52b621ccdfea38e86b5e29a9d9ec0c6f30643e0ebc','assets/enemies/car_big.png',256)
cut(A+'76/76959f082c39ca1f44d405e3907c57561f1ab0d908987bcdb2ba29af70ee2fdd','assets/enemies/guard_big.png',256)
cut(A+'58/581806b50cf4e6c4daedf23d6846f066d4c5e98240040d97c5a22c94b16239dd','assets/enemies/pirate_big.png',256)
