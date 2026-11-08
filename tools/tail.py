import cv2, numpy as np, json
from PIL import Image
p='assets/sprites/jerry.png'
im=cv2.imread(p, cv2.IMREAD_UNCHANGED); h,w=im.shape[:2]
alpha=im[:,:,3]
mask=(alpha>20).astype(np.uint8)
dist=cv2.distanceTransform(mask, cv2.DIST_L2, 5)
region=np.zeros_like(mask)
region[int(h*0.42):int(h*0.80), 0:int(w*0.46)]=1
thin=((dist<8)&(mask>0)&(region>0)).astype(np.uint8)
thin=cv2.morphologyEx(thin, cv2.MORPH_CLOSE, np.ones((3,3),np.uint8))
n,lab,stats,cent=cv2.connectedComponentsWithStats(thin,8)
best=0;bi=-1
for i in range(1,n):
    if stats[i,cv2.CC_STAT_AREA]>best: best=stats[i,cv2.CC_STAT_AREA]; bi=i
tail=(lab==bi).astype(np.uint8)*255
ys,xs=np.where(tail>0)
print('tail bbox', xs.min(),ys.min(),xs.max(),ys.max(),'area',best)
# body without tail
body_alpha=alpha.copy(); body_alpha[tail>0]=0
cv2.imwrite('assets/sprites/jerry_body.png', np.dstack([im[:,:,:3], body_alpha]))
crop=im[ys.min():ys.max()+1, xs.min():xs.max()+1].copy()
crop[:,:,3]=tail[ys.min():ys.max()+1, xs.min():xs.max()+1]
cv2.imwrite('assets/sprites/jerry_tail.png', crop)
json.dump({'x':int(xs.min()),'y':int(ys.min()),'w':int(xs.max()-xs.min()+1),'h':int(ys.max()-ys.min()+1),'iw':w,'ih':h}, open('assets/sprites/jerry_tail.json','w'))
print('done')
