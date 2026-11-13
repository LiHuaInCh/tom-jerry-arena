from PIL import Image, ImageDraw, ImageFont
import os, shutil
W,H=900,600
font_path=r'C:\Windows\Fonts\msyhbd.ttc'
def card(title,sub,foot):
    im=Image.new('RGB',(W,H),(26,16,9))
    d=ImageDraw.Draw(im)
    for y in range(H):
        c=(26+int(18*y/H),16+int(10*y/H),9+int(4*y/H))
        d.line([(0,y),(W,y)],fill=c)
    f1=ImageFont.truetype(font_path,64)
    f2=ImageFont.truetype(font_path,24)
    f3=ImageFont.truetype(r'C:\Windows\Fonts\msyh.ttc',18)
    tw=d.textlength(title,font=f1)
    d.text(((W-tw)/2,190),title,font=f1,fill=(255,246,224))
    tw=d.textlength(sub,font=f2)
    d.text(((W-tw)/2,290),sub,font=f2,fill=(242,193,78))
    tw=d.textlength(foot,font=f3)
    d.text(((W-tw)/2,500),foot,font=f3,fill=(190,160,130))
    return im
os.makedirs('video_seq',exist_ok=True)
for f in os.listdir('video_seq'): os.remove(os.path.join('video_seq',f))
card('猫鼠大作战','57 角色 · 18 流派 · 36 进化','非商业同人作品').save('video_seq/f0000.png')
for i in range(1,20):
    shutil.copy('video_seq/f0000.png',f'video_seq/f{i:04d}.png')
for i in range(120):
    shutil.copy(f'video_frames/g{i:04d}.png',f'video_seq/f{20+i:04d}.png')
card('网页 / 安卓 均可游玩','生存 · 冒险 · 乱斗 · 训练场','Boss 掉圣遗物：强力，但有代价').save('video_seq/f0140.png')
for i in range(141,160):
    shutil.copy('video_seq/f0140.png',f'video_seq/f{i:04d}.png')
print('frames ready',len(os.listdir('video_seq')))
