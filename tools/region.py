from PIL import Image
src=Image.open(r'C:/Users/26370/.dsh/attachments/v1/objects/f9/f97e2e1d310e30483a05d8a9ae09134683a6b913487f17b32e9519e98e68ec03').convert('RGBA')
src.crop((100,110,380,270)).resize((840,480)).save('shots/mine_region.png')
