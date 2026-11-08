from PIL import Image, ImageFilter, ImageEnhance
import os
files = {
 'assets/enemies/kunkun_cut.png':'assets/enemies/kunkun_big.png',
 'assets/enemies/cthulhu_cut.png':'assets/enemies/cthulhu_big.png',
 'assets/enemies/giant_cut.png':'assets/enemies/giant_big.png',
 'assets/enemies/spike_cut.png':'assets/enemies/spike_big.png',
 'assets/bosses/qianchang_cut.png':'assets/bosses/qianchang_big.png',
 'assets/bosses/angryqc_cut.png':'assets/bosses/angryqc_big.png',
 'assets/bosses/chenjr_cut.png':'assets/bosses/chenjr_big.png',
}
for src,dst in files.items():
    if not os.path.exists(src): print('miss',src); continue
    im=Image.open(src).convert('RGBA')
    w,h=im.size
    im=im.resize((w*2,h*2),Image.LANCZOS)
    im=ImageEnhance.Color(im).enhance(1.06)
    im=ImageEnhance.Contrast(im).enhance(1.04)
    im=im.filter(ImageFilter.UnsharpMask(radius=2.2,percent=120,threshold=2))
    im.save(dst)
    print(dst, im.size)
