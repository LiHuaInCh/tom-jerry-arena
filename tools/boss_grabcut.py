import cv2, numpy as np
from PIL import Image, ImageFilter
for k in ['qianchang','angryqc','chenjr']:
    p=f'assets/bosses/{k}.png'
    img=cv2.imread(p)
    h,w=img.shape[:2]
    mask=np.zeros((h,w),np.uint8)
    rect=(6,6,w-12,h-12)
    bg=np.zeros((1,65),np.float64); fg=np.zeros((1,65),np.float64)
    cv2.grabCut(img,mask,rect,bg,fg,6,cv2.GC_INIT_WITH_RECT)
    m=np.where((mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD),255,0).astype('uint8')
    m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
    alpha=Image.fromarray(m).filter(ImageFilter.GaussianBlur(1.5))
    im=Image.open(p).convert('RGBA'); im.putalpha(alpha)
    bb=im.getbbox(); im=im.crop(bb)
    w2=470; h2=int(im.height*w2/im.width)
    im=im.resize((w2,h2),Image.LANCZOS)
    canvas=Image.new('RGBA',(512,512),(0,0,0,0))
    canvas.alpha_composite(im,((512-w2)//2,(512-h2)//2))
    canvas.save(f'assets/bosses/{k}_cut.png')
    print(k,w2,h2)
