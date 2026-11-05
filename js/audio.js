/* 猫鼠大作战 — WebAudio 合成音效 */
(function () {
  const TJ = (window.TJ = window.TJ || {});
  let ctx = null, master = null, muted = false, noiseBuf = null;
  const last = {};

  try { muted = localStorage.getItem('tj_muted') === '1'; } catch (e) {}

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.55;
      master.connect(ctx.destination);
      const len = ctx.sampleRate * 1;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(type, f0, f1, dur, gain, delay) {
    const c = ensure(); if (!c || muted) return;
    const t = c.currentTime + (delay || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise(dur, gain, freq, q, delay) {
    const c = ensure(); if (!c || muted) return;
    const t = c.currentTime + (delay || 0);
    const s = c.createBufferSource();
    s.buffer = noiseBuf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q || 1;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + dur + 0.02);
  }

  const SFX = {
    shoot() { tone('square', 780, 430, 0.055, 0.05); },
    rocket() { tone('sawtooth', 300, 110, 0.18, 0.08); noise(0.12, 0.05, 900, 1); },
    slash() { noise(0.12, 0.09, 1800, 1.4); tone('triangle', 500, 240, 0.09, 0.05); },
    hit() { tone('square', 260, 190, 0.04, 0.045); },
    kill() { tone('triangle', 430, 170, 0.11, 0.09); },
    hurt() { tone('sawtooth', 250, 70, 0.22, 0.14); noise(0.1, 0.06, 500, 1); },
    explode() { noise(0.3, 0.16, 500, 0.7); tone('sine', 120, 45, 0.3, 0.14); },
    xp() { tone('sine', 900 + Math.random() * 200, 1200, 0.06, 0.035); },
    heal() { tone('sine', 520, 780, 0.16, 0.09); },
    coin() { tone('sine', 1320, 1320, 0.07, 0.05); tone('sine', 1760, 1760, 0.08, 0.04, 0.06); },
    levelup() { [523, 659, 784, 1046].forEach((f, i) => tone('triangle', f, f, 0.12, 0.09, i * 0.075)); },
    dash() { noise(0.16, 0.09, 1200, 1.2); },
    shield() { tone('sine', 700, 1100, 0.18, 0.09); },
    shieldup() { tone('sine', 600, 900, 0.1, 0.05); },
    eshoot() { tone('sawtooth', 380, 200, 0.09, 0.04); },
    charge() { tone('sawtooth', 130, 340, 0.28, 0.06); },
    pan() { tone('square', 230, 160, 0.12, 0.07); noise(0.12, 0.05, 2400, 2); },
    bark() { tone('sawtooth', 150, 80, 0.2, 0.12); },
    leap() { noise(0.25, 0.1, 300, 0.8); tone('sine', 90, 40, 0.25, 0.12); },
    boss() { tone('sawtooth', 70, 55, 1.0, 0.16); noise(0.6, 0.08, 200, 0.6); },
    bossdown() { [784, 659, 523, 392].forEach((f, i) => tone('triangle', f, f, 0.18, 0.1, i * 0.1)); },
    death() { tone('sawtooth', 320, 50, 0.8, 0.16); noise(0.5, 0.1, 300, 0.7); },
    wave() { tone('triangle', 660, 660, 0.1, 0.07); tone('triangle', 990, 990, 0.12, 0.07, 0.1); },
    click() { tone('sine', 620, 720, 0.05, 0.05); }
  };

  TJ.Audio = {
    unlock() { ensure(); },
    play(name) {
      if (muted) return;
      const fn = SFX[name];
      if (!fn) return;
      const now = performance.now();
      if (last[name] && now - last[name] < 35) return;
      last[name] = now;
      try { fn(); } catch (e) {}
    },
    toggle() {
      muted = !muted;
      try { localStorage.setItem('tj_muted', muted ? '1' : '0'); } catch (e) {}
      if (master) master.gain.value = muted ? 0 : 0.55;
      return muted;
    },
    isMuted() { return muted; }
  };
})();
