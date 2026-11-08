import cv2, numpy as np
from PIL import Image, ImageFilter
for k in ['kunkun','cthulhu','giant']:
    p=f'assets/enemies/{k}.png'
    img=cv2.imread(p); h,w=img.shape[:2]
    mask=np.zeros((h,w),np.uint8)
    bg=np.zeros((1,65),np.float64); fg=np.zeros((1,65),np.float64)
    cv2.grabCut(img,mask,(4,4,w-8,h-8),bg,fg,7,cv2.GC_INIT_WITH_RECT)
    m=np.where((mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD),255,0).astype('uint8')
    m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    alpha=Image.fromarray(m).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    im=Image.open(p).convert('RGBA'); im.putalpha(alpha)
    bb=im.getbbox(); im=im.crop(bb); im.thumbnail((512,512),Image.LANCZOS)
    im.save(f'assets/enemies/{k}_cut.png'); print(k, im.size)
