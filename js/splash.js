(function () {
  var sp = document.getElementById('splash');
  if (!sp) return;
  var native = document.documentElement.classList.contains('native');
  var pending = false;
  try { pending = localStorage.getItem('tj_pending') === '1'; } catch (e) {}
  if (!native || pending) { sp.remove(); return; }

  var v = document.getElementById('splashVid');
  var v2 = document.getElementById('splashVid2');
  var vb = document.getElementById('splashBg');
  var music = document.getElementById('splashMusic');
  var vids = [v, v2];
  var active = 0;
  var switching = false;
  var done = false;

  function startMusic() {
    if (!music) return;
    try { music.volume = 0.75; } catch (e) {}
    var p = music.play();
    if (p && p.catch) p.catch(function () {});
  }
  function fadeMusic() {
    if (!music) return;
    var vol = music.volume || 0.75;
    var iv = setInterval(function () {
      vol = Math.max(0, vol - 0.07);
      try { music.volume = vol; } catch (e) {}
      if (vol <= 0) {
        clearInterval(iv);
        try { music.pause(); } catch (e) {}
      }
    }, 70);
  }
  function finish() {
    if (done) return;
    done = true;
    fadeMusic();
    vids.forEach(function (x) { if (x) { try { x.pause(); } catch (e) {} } });
    if (vb) { try { vb.pause(); } catch (e) {} }
    sp.classList.add('gone');
    setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 700);
  }

  startMusic();
  sp.addEventListener('pointerdown', startMusic, { once: true });
  if (vb) { var pb = vb.play(); if (pb && pb.catch) pb.catch(function () {}); }

  function play(i) {
    var x = vids[i];
    if (!x) return;
    var p = x.play();
    if (p && p.catch) p.catch(function () {});
  }
  vids.forEach(function (x) {
    if (!x) return;
    x.addEventListener('playing', function () {
      x.classList.add('on');
      if (music) music.loop = true;
    });
    x.addEventListener('error', function () {
      if (!vids[active].classList.contains('on')) sp.classList.add('poster-mode');
    });
  });
  play(0);

  setInterval(function () {
    if (done || switching) return;
    var cur = vids[active], next = vids[1 - active];
    if (!cur || !next || !cur.duration) return;
    if (cur.currentTime < cur.duration - 0.55) return;
    switching = true;
    try { next.currentTime = 0; } catch (e) {}
    next.classList.add('on');
    cur.classList.remove('on');
    play(1 - active);
    var old = cur;
    setTimeout(function () { try { old.pause(); } catch (e) {} }, 480);
    active = 1 - active;
    setTimeout(function () { switching = false; }, 620);
  }, 110);

  setTimeout(function () { if (!vids[0].classList.contains('on') && !vids[1].classList.contains('on')) sp.classList.add('poster-mode'); }, 1400);

  var sk = document.getElementById('splashSkip');
  function placeSkip() {
    if (!sk || !v) return;
    var vw = v.videoWidth || 1636, vh = v.videoHeight || 576;
    var cw = sp.clientWidth, ch = sp.clientHeight;
    var sc = Math.min(cw / vw, ch / vh);
    var w = vw * sc, hh = vh * sc;
    var lx = (cw - w) / 2, ty = (ch - hh) / 2;
    sk.style.left = (lx + w * 0.405) + 'px';
    sk.style.top = (ty + hh * 0.835) + 'px';
    sk.style.width = (w * 0.23) + 'px';
    sk.style.height = (hh * 0.105) + 'px';
  }
  if (sk) sk.onclick = finish;
  var st = document.getElementById('splashStart');
  if (st) st.onclick = finish;
  if (v) v.addEventListener('loadedmetadata', placeSkip);
  window.addEventListener('resize', placeSkip);
  placeSkip();
})();
