from PIL import Image
im=Image.open('assets/weapon-icons/w_tuffy.png').convert('RGBA')
bbox=im.getbbox(); im=im.crop(bbox)
w=230; h=int(im.height*w/im.width)
im=im.resize((w,h),Image.LANCZOS)
canvas=Image.new('RGBA',(240,240),(0,0,0,0))
canvas.alpha_composite(im,((240-w)//2,(240-h)//2))
canvas.save('assets/weapon-icons/w_tuffy.png')
print('ok',w,h)
