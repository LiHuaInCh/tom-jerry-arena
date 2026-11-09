from PIL import Image, ImageDraw, ImageFont
W,H=1920,1080
FONT='C:/Windows/Fonts/msyhbd.ttc'; FONT2='C:/Windows/Fonts/msyh.ttc'
def f(s,b=True): return ImageFont.truetype(FONT if b else FONT2,s)
bg=Image.new('RGB',(W,H),(255,248,231))
d=ImageDraw.Draw(bg)
# header band
d.rectangle([0,0,W,150],fill=(58,36,24))
d.text((80,34),'猫鼠大作战 · Boss & 精英图鉴',font=f(56),fill=(255,233,184))
d.text((84,108),'BOSSES & ELITES · v1.3.9',font=f(24,False),fill=(228,161,27))
items=[
 ('坤坤杰瑞','BOSS · 3 波','assets/enemies/kunkun_big.png'),
 ('绷带杰瑞','BOSS · 6 波','assets/enemies/cthulhu_big.png'),
 ('巨人僵尸','BOSS · 9 波','assets/enemies/giant_big.png'),
 ('浅唱','BOSS · 12 波','assets/bosses/qianchang_big.png'),
 ('不甘心的浅唱','BOSS · 15 波','assets/bosses/angryqc_big.png'),
 ('陈佳嵘','BOSS · 18 波','assets/bosses/chenjr_big.png'),
 ('斯派克','精英 · 5 波解锁','assets/enemies/spike_big.png'),
 ('保安','精英 · 1 波解锁','assets/enemies/security_big.png'),
 ('斯派克儿子','精英 · 1 波解锁','assets/enemies/spikejr_big.png'),
 ('牛头怪','精英 · 3 波解锁','assets/enemies/cowhead_big.png'),
]
cols=5; cw=W//cols; ch=(H-150)//2
for i,(name,tag,path) in enumerate(items):
    cx=(i%cols)*cw; cy=150+(i//cols)*ch
    d.rectangle([cx+16,cy+16,cx+cw-16,cy+ch-16],outline=(58,36,24),width=3,fill=(255,253,246))
    im=Image.open(path).convert('RGBA')
    im.thumbnail((cw-110,ch-170),Image.LANCZOS)
    bg.paste(im,(cx+(cw-im.width)//2, cy+55),im)
    d.text((cx+cw//2,cy+ch-66),name,font=f(30),fill=(58,36,24),anchor='mm')
    d.text((cx+cw//2,cy+ch-30),tag,font=f(19,False),fill=(180,118,15),anchor='mm')
bg.save('docs/boss-elite-poster.png')
print('poster ok')
