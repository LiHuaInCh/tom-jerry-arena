from PIL import Image
files=['giant_big','bunny_big','milk_big','angel_big','car_big','guard_big','pirate_big','cheese_cut','basketball_cut']
for f in files:
    im=Image.open('assets/enemies/%s.png'%f).convert('RGBA'); a=im.split()[3]
    px=im.load(); w,h=im.size
    corners=[px[0,0][3],px[w-1,0][3],px[0,h-1][3],px[w-1,h-1][3]]
    dark=sum(1 for x in range(w) for y in range(h) if px[x,y][3]>200 and px[x,y][0]<80 and px[x,y][1]<60)
    print(f, im.size, 'corners',corners, 'darkpx',dark, 'alpha_edges', sum(1 for x in range(w) if a.getpixel((x,0))>0))
