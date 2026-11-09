import numpy as np, wave, os
SR=44100
def env(n, a=0.005, d=0.2, curve=2.5):
    t=np.linspace(0,1,n)
    e=np.ones(n)
    na=max(1,int(a*SR)); nd=max(1,int(d*SR))
    e[:na]=np.linspace(0,1,na)
    if nd<n: e[-nd:]=np.linspace(1,0,nd)**curve
    return e
def lowpass(x, cutoff, sr=SR):
    a=np.exp(-2*np.pi*cutoff/sr); y=np.zeros_like(x); prev=0.0
    for i,v in enumerate(x):
        prev=a*prev+(1-a)*v; y[i]=prev
    return y
def highpass(x, cutoff, sr=SR):
    return x-lowpass(x, cutoff, sr)
def noise(n): return np.random.uniform(-1,1,n)
def sine(f, dur, sr=SR):
    n=int(dur*sr); t=np.arange(n)/sr
    return np.sin(2*np.pi*f*t)
def sweep(f0,f1,dur,sr=SR):
    n=int(dur*sr); t=np.arange(n)/sr
    f=f0*(f1/f0)**(t/dur); ph=2*np.pi*np.cumsum(f)/sr
    return np.sin(ph)
def save(name, x, peak=0.9):
    x=x/np.max(np.abs(x)+1e-9)*peak
    x=(x*32767).astype(np.int16)
    with wave.open(f'assets/audio/sfx_{name}.wav','wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())
    print(name, len(x)/SR)

# hit: tight click + body thump + noise tick
n=int(0.09*SR)
x=sweep(420,90,0.09)*1.0 + noise(n)*0.55 + sine(1600,0.09)*0.25
x*=env(n,0.001,0.07,3.2); x=lowpass(x,6500); save('hit',x*0.85)

# kill: punchy downward thump + debris
n=int(0.28*SR)
x=sweep(520,110,0.28)*1.1 + noise(n)*0.5*env(n,0.002,0.2,2.2) + sine(70,0.28)*0.5
x=lowpass(x,5200); x*=env(n,0.002,0.25,2.0); save('kill',x*0.9)

# hurt: low thud + growl
n=int(0.3*SR)
x=sweep(180,55,0.3)*1.2 + lowpass(noise(n),900)*0.5
x=np.tanh(x*1.6); x*=env(n,0.003,0.26,2.0); save('hurt',x*0.95)

# levelup: bell arpeggio
notes=[523.25,659.25,783.99,1046.5]
out=np.zeros(int(1.0*SR))
for i,f in enumerate(notes):
    b=sine(f,0.6)*np.exp(-np.arange(int(0.6*SR))/SR*6)
    b+=sine(f*2,0.6)*0.35*np.exp(-np.arange(int(0.6*SR))/SR*9)
    s=int(i*0.075*SR); out[s:s+len(b)]+=b
out*=env(len(out),0.002,0.5,1.6); out=lowpass(out,12000); save('levelup',out*0.8)

# boss: sub swell + rumble
n=int(1.6*SR)
x=sweep(48,36,1.6)*1.4 + lowpass(noise(n),260)*0.9
x*=env(n,0.15,1.1,1.5); x=np.tanh(x*1.2); save('boss',x*0.95)

# xp: bright ping
n=int(0.07*SR)
x=sine(1900,0.07)+sine(2850,0.07)*0.5
x*=env(n,0.001,0.06,3.0); save('xp',x*0.55)
