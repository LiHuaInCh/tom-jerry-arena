from PIL import Image
im=Image.open(r'C:/Users/26370/Downloads/tomjerry/shots/rig_parts.png')
im.crop((360,230,560,430)).resize((600,600),Image.LANCZOS).save(r'C:/Users/26370/Downloads/tomjerry/shots/rig_zoom.png')
print('ok')