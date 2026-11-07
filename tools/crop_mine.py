from PIL import Image, ImageDraw
im=Image.open(r'C:/Users/26370/.dsh/attachments/v1/objects/f9/f97e2e1d310e30483a05d8a9ae09134683a6b913487f17b32e9519e98e68ec03').convert('RGBA')
im.crop((160,130,340,250)).resize((540,360)).save('shots/mine_crop.png')
print(im.size)
