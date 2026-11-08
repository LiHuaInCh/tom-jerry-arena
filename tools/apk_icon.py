import zipfile, hashlib
z=zipfile.ZipFile('dist/tomjerry-1.3.0.apk')
names=[n for n in z.namelist() if 'ic_launcher' in n]
print('\n'.join(names[:12]))
for n in names:
    if n.endswith('mipmap-xxxhdpi-v4/ic_launcher.png') or n.endswith('mipmap-xxxhdpi/ic_launcher.png'):
        print('hash', hashlib.md5(z.read(n)).hexdigest())
