from PIL import Image
for k in ['qianchang','angryqc','chenjr']:
    im=Image.open(f'assets/bosses/{k}_cut.png'); print(k, im.size, im.mode, im.getpixel((0,0)))
