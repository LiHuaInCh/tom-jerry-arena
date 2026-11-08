from PIL import Image, ImageDraw, ImageFont, ImageFilter
import subprocess, math, os

W,H=1920,1080
FPS=30
BASE=r'C:/Users/26370/Downloads/tomjerry'
SH=BASE+'/shots'
FF=r'C:/Users/26370/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
FONT=r'C:/Windows/Fonts/msyhbd.ttc'
FONT2=r'C:/Windows/Fonts/msyh.ttc'

def font(sz, bold=True):
    return ImageFont.truetype(FONT if bold else FONT2, sz)

def cover(im):
    w,h=im.size; s=max(W/w,H/h)
    im=im.resize((int(w*s+0.5),int(h*s+0.5)),Image.LANCZOS)
    x=(im.width-W)//2; y=(im.height-H)//2
    return im.crop((x,y,x+W,y+H))

def gradient(w,h,top=(0,0,0,0),bottom=(0,0,0,210)):
    g=Image.new('RGBA',(1,h))
    for y in range(h):
        t=y/(h-1); a=tuple(int(top[i]+(bottom[i]-top[i])*t) for i in range(4))
        g.putpixel((0,y),a)
    return g.resize((w,h))

def caption_slide(src, big, small):
    base=cover(Image.open(src).convert('RGB')).convert('RGBA')
    ov=Image.new('RGBA',(W,H),(0,0,0,0))
    grad=gradient(W,420,(0,0,0,0),(0,0,0,235))
    ov.alpha_composite(grad,(0,H-420))
    d=ImageDraw.Draw(ov)
    d.text((90,H-250), big, font=font(64), fill=(255,246,224,255), stroke_width=2, stroke_fill=(58,36,24,220))
    d.text((94,H-160), small, font=font(34,False), fill=(228,161,27,255))
    base.alpha_composite(ov)
    return base

# intro
hero=cover(Image.open(BASE+'/assets/brand/hero-wide.jpg').convert('RGB')).filter(ImageFilter.GaussianBlur(2)).convert('RGBA')
dark=Image.new('RGBA',(W,H),(30,18,10,110)); hero.alpha_composite(dark)
d=ImageDraw.Draw(hero)
t1='猫鼠大作战'
f1=font(150)
tw=d.textlength(t1,font=f1)
d.text(((W-tw)/2,300), t1, font=f1, fill=(255,246,224,255), stroke_width=6, stroke_fill=(58,36,24,255))
sub='TOM & JERRY · ARROW CHASE'
f2=font(40,False); tw2=d.textlength(sub,font=f2)
d.text(((W-tw2)/2,530), sub, font=f2, fill=(228,161,27,255))
v='1.3.8 版本宣传'
f3=font(54); tw3=d.textlength(v,font=f3)
d.text(((W-tw3)/2,650), v, font=f3, fill=(255,255,255,235))
tip='57 名角色 · 18 种武器流派 · 6 只 Boss'
f4=font(34,False); tw4=d.textlength(tip,font=f4)
d.text(((W-tw4)/2,760), tip, font=f4, fill=(230,215,190,220))
intro=hero

# outro
outro=Image.new('RGBA',(W,H),(26,15,9,255))
d=ImageDraw.Draw(outro)
d.text((120,220),'来体验服试试',font=font(86),fill=(255,246,224,255))
d.text((120,360),'网页版 · 免安装 · 手机电脑都能玩',font=font(42,False),fill=(228,161,27,255))
d.text((120,500),'https://lihuainch.github.io/tom-jerry-arena/',font=font(40,False),fill=(255,255,255,235))
d.text((120,640),'非商业同人作品 · 素材来源猫和老鼠教学网站 wiki',font=font(26,False),fill=(200,180,150,200))
d.text((120,760),'版本 1.3.8',font=font(36),fill=(228,161,27,255))
icon=Image.open(BASE+'/assets/brand/app-icon.png').convert('RGBA')
icon.thumbnail((430,430),Image.LANCZOS)
outro.alpha_composite(icon,(W-560,H//2-215))

slides=[
 (intro,'', '' ,4.0),
 (caption_slide(SH+'/promo_title.png','57 名角色，各有专属武器','每个角色独立配色与武器图标'),3.6),
 (caption_slide(SH+'/promo_boss2.png','新 Boss：巨人僵尸','砸地、萝卜弹幕、超高血量'),3.6),
 (caption_slide(SH+'/promo_stage.png','随机特殊任务','被 78 个萝卜命中，站桩 10 秒即失败'),3.6),
 (caption_slide(SH+'/promo_codex.png','57 把武器图鉴','18 个子类 · 每 4 级进化三选一'),3.6),
 (caption_slide(SH+'/promo_over.png','一局一个流派','结算查看完整数据'),3.4),
 (outro,'','',3.6)
]

XF=0.45
total=sum(s[-1] for s in slides)
n=int(total*FPS)
p=subprocess.Popen([FF,'-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
 '-i',BASE+'/assets/audio/bgm.mp3','-t',f'{total:.2f}','-c:v','libx264','-preset','medium','-crf','20',
 '-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-af',f'afade=t=out:st={total-1:.2f}:d=1','-shortest',BASE+'/dist/promo-1.3.8.mp4'],stdin=subprocess.PIPE)
# build timeline with crossfade by alpha blend
idx=0
for si,s in enumerate(slides):
    img=s[0]; dur=s[-1]
    frames=int(dur*FPS)
    for f in range(frames):
        t=f/max(1,frames-1)
        zoom=1.0+0.06*t
        w=int(W/zoom); h=int(H/zoom)
        x=(W-w)//2; y=(H-h)//2
        fr=img.crop((x,y,x+w,y+h)).resize((W,H),Image.BILINEAR)
        # crossfade with next slide at end
        arr=fr.convert('RGB')
        p.stdin.write(arr.tobytes())
        idx+=1
p.stdin.close(); p.wait()
print('done', total, idx, p.returncode)
