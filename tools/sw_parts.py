import cv2, numpy as np, json
from PIL import Image
src='assets/sprites/swordsman.png'
im=cv2.imread(src, cv2.IMREAD_UNCHANGED); h,w=im.shape[:2]
bgr=im[:,:,:3]; alpha=im[:,:,3]
line=np.zeros((h,w),np.uint8)
cv2.line(line,(176,6),(199,246),255,18)
gray=(bgr.max(axis=2)-bgr.min(axis=2) < 30) & (bgr.max(axis=2)>50)
mask=((line>0)&gray).astype(np.uint8)*255
hand=np.zeros((h,w),np.uint8)
cv2.circle(hand,(202,253),26,255,-1)
mask=np.maximum(mask, hand)
mask=(mask & (alpha>10).astype(np.uint8)*255)
mask_d=cv2.dilate(mask,np.ones((9,9),np.uint8))
known=((mask_d==0)&(alpha>10)).astype(np.float32)
img=bgr.astype(np.float32).copy()
img[mask_d>0]=0
for _ in range(260):
    num=cv2.blur(img*known[...,None],(3,3))
    den=cv2.blur(known,(3,3))
    fill=num/np.maximum(den,1e-4)[...,None]
    hole=(mask_d>0)&(den>0.001)
    img[hole]=fill[hole]
    known=np.clip(known+hole.astype(np.float32),0,1)
body=np.clip(img,0,255).astype(np.uint8)
body_alpha=alpha.copy()
cv2.imwrite('assets/sprites/swordsman_bodyfull.png', np.dstack([body,body_alpha]))
arm=im.copy(); arm[:,:,3]=mask
ys,xs=np.where(mask>0); x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max()
cv2.imwrite('assets/sprites/swordsman_arm.png', arm[y0:y1+1,x0:x1+1])
json.dump({'ax':int(x0),'ay':int(y0),'aw':int(x1-x0+1),'ah':int(y1-y0+1),'iw':w,'ih':h,'px':202,'py':253}, open('assets/sprites/swordsman_arm.json','w'))
b=Image.fromarray(cv2.cvtColor(body,cv2.COLOR_BGR2RGB)).convert('RGBA'); b.putalpha(Image.fromarray(body_alpha))
for y0f,y1f,name in [(0.0,0.44,'head'),(0.30,0.82,'torso'),(0.62,1.0,'legs')]:
    b.crop((0,int(h*y0f),w,int(h*y1f))).save(f'assets/sprites/swordsman_p_{name}.png')
print('mask',(mask>0).sum(),'bbox',x0,y0,x1,y1)
