(function () {
  var sp = document.getElementById('splash');
  if (!sp) return;
  var native = document.documentElement.classList.contains('native');
  var pending = false;
  try { pending = localStorage.getItem('tj_pending') === '1'; } catch (e) {}
  if (!native || pending) { sp.remove(); return; }

  var v = document.getElementById('splashVid');
  var vb = document.getElementById('splashBg');
  var music = document.getElementById('splashMusic');
  var done = false;
  var fallbackT = null;

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
    if (fallbackT) clearTimeout(fallbackT);
    fadeMusic();
    if (v) { try { v.pause(); } catch (e) {} }
    if (vb) { try { vb.pause(); } catch (e) {} }
    sp.classList.add('gone');
    setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 700);
  }

  startMusic();
  sp.addEventListener('pointerdown', startMusic, { once: true });

  if (vb) { var pb = vb.play(); if (pb && pb.catch) pb.catch(function () {}); }
  if (v) {
    v.addEventListener('playing', function () {
      if (fallbackT) { clearTimeout(fallbackT); fallbackT = null; }
      v.classList.add('playing');
    });
    v.addEventListener('ended', finish);
    v.addEventListener('error', function () { setTimeout(finish, 900); });
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
    // 若 WebView 拒绝视频自动播放，用静态海报停留 4.2 秒后进入游戏
    fallbackT = setTimeout(finish, 4200);
  }

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
  if (v) v.addEventListener('loadedmetadata', placeSkip);
  window.addEventListener('resize', placeSkip);
  placeSkip();
  setTimeout(finish, 9500);
})();
