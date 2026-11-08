from PIL import Image, ImageDraw, ImageFont
import subprocess, os, glob
W,H=1920,1080
B=r'C:/Users/26370/Downloads/tomjerry'
FF=r'C:/Users/26370/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
FB=r'C:/Windows/Fonts/msyhbd.ttc'; FR=r'C:/Windows/Fonts/msyh.ttc'
def f(s,b=True): return ImageFont.truetype(FB if b else FR,s)
def cover(im):
    w,h=im.size; s=max(W/w,H/h); im=im.resize((int(w*s+.5),int(h*s+.5)),Image.LANCZOS)
    x=(im.width-W)//2; y=(im.height-H)//2; return im.crop((x,y,x+W,y+H))
def grad(w,h,col=(0,0,0,225)):
    g=Image.new('RGBA',(1,h))
    for y in range(h): g.putpixel((0,y),(col[0],col[1],col[2],int(col[3]*y/(h-1))))
    return g.resize((w,h))
def cap_png(text,sub,out):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    im.alpha_composite(grad(W,430),(0,H-430))
    d.text((96,H-236),text,font=f(62),fill=(255,246,224,255),stroke_width=2,stroke_fill=(58,36,24,230))
    d.text((100,H-150),sub,font=f(34,False),fill=(228,161,27,255))
    im.save(out)
def title_card(out):
    bg=cover(Image.open(B+'/assets/brand/hero-wide.jpg').convert('RGB')).convert('RGBA')
    bg.alpha_composite(Image.new('RGBA',(W,H),(30,18,10,120)))
    d=ImageDraw.Draw(bg)
    for txt,y,sz,col in [('猫鼠大作战',300,150,(255,246,224,255)),('TOM & JERRY · ARROW CHASE',520,38,(228,161,27,255)),('1.3.8 · 实机宣传',650,54,(255,255,255,240))]:
        w=d.textlength(txt,font=f(sz)); d.text(((W-w)/2,y),txt,font=f(sz),fill=col,stroke_width=4 if sz>60 else 0,stroke_fill=(58,36,24,255))
    bg.convert('RGB').save(out)
def outro_card(out):
    im=Image.new('RGBA',(W,H),(26,15,9,255)); d=ImageDraw.Draw(im)
    d.text((120,240),'来体验服试试',font=f(86),fill=(255,246,224,255))
    d.text((120,380),'网页版 · 免安装 · 手机电脑都能玩',font=f(40,False),fill=(228,161,27,255))
    d.text((120,530),'https://lihuainch.github.io/tom-jerry-arena/',font=f(40,False),fill=(255,255,255,235))
    d.text((120,690),'非商业同人作品 · 素材来源猫和老鼠教学网站 wiki',font=f(26,False),fill=(200,180,150,200))
    ic=Image.open(B+'/assets/brand/app-icon.png').convert('RGBA'); ic.thumbnail((430,430),Image.LANCZOS)
    im.alpha_composite(ic,(W-560,H//2-215)); im.convert('RGB').save(out)
def run(args): subprocess.run(args,check=True)

os.makedirs(B+'/shots/build',exist_ok=True)
title_card(B+'/shots/build/title.png'); outro_card(B+'/shots/build/outro.png')
caps=[('57 名角色，各有专属武器','自动瞄准，专注走位'),
      ('Boss 巨人僵尸登场','砸地冲击 + 三连萝卜弹幕'),
      ('特殊随机任务','被 78 个萝卜命中，站桩 10 秒失败'),
      ('元素融合 + 进化三选一','每 4 级一次质变'),
      ('无尽波次，越打越强','第 15 波起每波 3 只精英')]
for i,(a,b) in enumerate(caps,1): cap_png(a,b,B+f'/shots/build/cap{i}.png')

segs=[]
# title 4s
run([FF,'-y','-loop','1','-i',B+'/shots/build/title.png','-t','4','-vf','scale=1920:1080,fps=30','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p',B+'/shots/build/s0.mp4'])
segs.append(B+'/shots/build/s0.mp4')
clips=['c1_fight','c2_boss','c3_stage','c4_evolved','c5_horde']
for i,c in enumerate(clips,1):
    out=B+f'/shots/build/s{i}.mp4'
    run([FF,'-y','-framerate','50','-i',B+f'/shots/clips/{c}/%05d.jpg','-i',B+f'/shots/build/cap{i}.png',
         '-filter_complex','[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30[v];[v][1:v]overlay=0:0','-t','6','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-an',out])
    segs.append(out)
# codex still 3.5s
codex=B+'/shots/promo_codex.png'
cap_png('57 把武器 · 18 个子类','每个角色独立武器与进化路线',B+'/shots/build/cap6.png')
run([FF,'-y','-loop','1','-i',codex,'-i',B+'/shots/build/cap6.png','-filter_complex','[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30[v];[v][1:v]overlay=0:0','-t','3.5','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p',B+'/shots/build/s6.mp4'])
segs.append(B+'/shots/build/s6.mp4')
# outro 5s
run([FF,'-y','-loop','1','-i',B+'/shots/build/outro.png','-t','5','-vf','scale=1920:1080,fps=30','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p',B+'/shots/build/s7.mp4'])
segs.append(B+'/shots/build/s7.mp4')
with open(B+'/shots/build/list.txt','w',encoding='utf-8') as fh:
    for s in segs: fh.write("file '"+s.replace('\\','/')+"'\n")
run([FF,'-y','-f','concat','-safe','0','-i',B+'/shots/build/list.txt','-i',B+'/assets/audio/bgm.mp3','-c:v','copy','-c:a','aac','-b:a','160k','-af','afade=t=out:st=42:d=3','-shortest',B+'/dist/promo-1.3.8-long.mp4'])
print('ok')
