from PIL import Image, ImageFilter, ImageEnhance
files=['goodjerry','angryjerry','escort','security','spikejr','cowhead']
for k in files:
    p=f'assets/enemies/{k}_cut.png'; im=Image.open(p).convert('RGBA'); w,h=im.size
    im=im.resize((w*2,h*2),Image.LANCZOS)
    im=ImageEnhance.Color(im).enhance(1.05); im=ImageEnhance.Contrast(im).enhance(1.03)
    im=im.filter(ImageFilter.UnsharpMask(radius=2,percent=110,threshold=2))
    im.save(f'assets/enemies/{k}_big.png'); print(k,im.size)
