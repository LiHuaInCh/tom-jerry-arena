from PIL import Image, ImageDraw
import math
S=4; W=240*S
img=Image.new('RGBA',(W,W),(0,0,0,0)); d=ImageDraw.Draw(img)
c=W//2
# spikes
for i in range(8):
    a=i*math.pi/4
    x1=c+math.cos(a)*70*S; y1=c+math.sin(a)*70*S
    x2=c+math.cos(a)*108*S; y2=c+math.sin(a)*108*S
    d.line([(x1,y1),(x2,y2)],fill=(58,36,24,255),width=26*S)
    d.line([(x1,y1),(x2,y2)],fill=(150,160,175,255),width=16*S)
# body
d.ellipse([c-82*S,c-82*S,c+82*S,c+82*S],fill=(58,36,24,255))
d.ellipse([c-74*S,c-74*S,c+74*S,c+74*S],fill=(96,110,128,255))
d.ellipse([c-64*S,c-64*S,c+64*S,c+64*S],fill=(120,136,156,255))
# band
d.arc([c-70*S,c-70*S,c+70*S,c+70*S],20,340,fill=(228,161,27,255),width=14*S)
# highlight
d.ellipse([c-52*S,c-56*S,c-18*S,c-22*S],fill=(225,235,245,120))
# light
d.ellipse([c-14*S,c-14*S,c+14*S,c+14*S],fill=(58,36,24,255))
d.ellipse([c-10*S,c-10*S,c+10*S,c+10*S],fill=(255,90,70,255))
img=img.resize((240,240),Image.LANCZOS)
img.save('assets/weapon-icons/w_tuffy.png')
print('saved')
