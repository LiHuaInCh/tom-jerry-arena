from PIL import Image
src=Image.open(r'C:/Users/26370/.dsh/attachments/v1/objects/83/8302b167453f83af4d7887549fcdc855f2be8e5915e3df56fa89835202e23310').convert('RGBA')
px=src.load(); w,h=src.size
out=Image.new('RGBA',(w,h),(0,0,0,0)); op=out.load()
for y in range(h):
    for x in range(w):
        r,g,b,a=px[x,y]
        if a<12: continue
        if r>244 and g>244 and b>244: continue
        op[x,y]=(r,g,b,a)
bb=out.getbbox(); out=out.crop(bb)
im=out.resize((230,int(out.height*230/out.width)),Image.LANCZOS)
canvas=Image.new('RGBA',(240,240),(0,0,0,0))
canvas.alpha_composite(im,((240-im.width)//2,(240-im.height)//2))
canvas.save('assets/weapon-icons/w_tuffy_mine.png')
canvas.save('assets/weapon-icons/w_tuffy.png')
chk=Image.new('RGBA',(240,240),(20,20,20,255)); chk.alpha_composite(canvas); chk.save('shots/mine_alpha_check2.png')
print('corner alpha', canvas.getpixel((0,0))[3], 'bbox', bb)
