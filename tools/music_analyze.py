import subprocess, wave, numpy as np, os, json
FF=r'C:/Users/26370/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
SRC=r'C:/Users/26370/Downloads/Feeling_music_@小牛仔XNZ创作的原声_04f8bfe768a56e8ddad72.mp3'
TMP=r'C:/Users/26370/Downloads/tomjerry/shots/music.wav'
subprocess.run([FF,'-y','-i',SRC,'-ac','2','-ar','44100',TMP],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
w=wave.open(TMP,'rb'); n=w.getnframes(); sr=w.getframerate(); ch=w.getnchannels()
data=np.frombuffer(w.readframes(n),dtype=np.int16).astype(np.float32)/32768.0
if ch==2: data=data.reshape(-1,2).mean(axis=1)
hop=int(sr*0.25); m=len(data)//hop
rms=np.array([np.sqrt(np.mean(data[i*hop:(i+1)*hop]**2)) for i in range(m)])
dur=len(data)/sr
# best 32s window by mean energy
win=int(32/0.25); best=(0,0); bestv=-1
for i in range(0, m-win):
    v=rms[i:i+win].mean()
    if v>bestv: bestv=v; best=(i,i+win)
start=best[0]*0.25
print('duration',round(dur,1),'best start',start,'energy',round(float(bestv),4))
# onsets: local peaks
peaks=[]
for i in range(2,m-2):
    if rms[i]>rms[i-1] and rms[i]>=rms[i+1] and rms[i]>np.percentile(rms,70):
        peaks.append(round(i*0.25,2))
json.dump({'start':start,'dur':dur,'peaks':peaks[:40]},open('shots/music.json','w'))
print('peaks sample',peaks[:10])
