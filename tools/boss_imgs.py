from PIL import Image
import os
for k in ['qianchang','angryqc','chenjr']:
    p=f'assets/bosses/{k}.webp'
    im=Image.open(p); print(k, im.format, im.size)
    im.convert('RGBA').save(f'assets/bosses/{k}.png')
