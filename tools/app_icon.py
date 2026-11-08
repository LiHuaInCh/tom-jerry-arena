from PIL import Image, ImageDraw
src=Image.open(r'C:/Users/26370/.dsh/attachments/v1/objects/12/122b77a716042094cdd96a10a245ffbf0fa257da4dd3cbf4c1ec1aaf2db2e348').convert('RGBA')
w,h=src.size; s=min(w,h)
im=src.crop(((w-s)//2,(h-s)//2,(w+s)//2,(h+s)//2))
sizes={'mdpi':48,'hdpi':72,'xhdpi':96,'xxhdpi':144,'xxxhdpi':192}
for k,v in sizes.items():
    sq=im.resize((v,v),Image.LANCZOS); sq.save(f'android/app/src/main/res/mipmap-{k}/ic_launcher.png')
    mask=Image.new('L',(v*4,v*4),0); d=ImageDraw.Draw(mask); d.ellipse([0,0,v*4-1,v*4-1],fill=255)
    mask=mask.resize((v,v),Image.LANCZOS)
    rnd=sq.copy(); rnd.putalpha(mask); rnd.save(f'android/app/src/main/res/mipmap-{k}/ic_launcher_round.png')
im.resize((512,512),Image.LANCZOS).save('assets/brand/app-icon.png')
print('ok')
