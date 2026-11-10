from PIL import Image
for f in ['assets/sprites/jerry.png','assets/sprites/tom.png','assets/portraits/jerry.png']:
    im=Image.open(f); print(f, im.size)
