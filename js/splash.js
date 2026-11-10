(function () {
  var sp = document.getElementById('splash');
  if (!sp) return;
  var native = document.documentElement.classList.contains('native');
  if (!native) { sp.remove(); return; }
  var v = document.getElementById('splashVid');
  var vb = document.getElementById('splashBg');
  if (vb) { var pb = vb.play(); if (pb && pb.catch) pb.catch(function () {}); }
  var done = false;
  function finish() {
    if (done) return;
    done = true;
    if (v) v.pause();
    if (vb) vb.pause();
    sp.classList.add('gone');
    setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 700);
  }
  if (v) {
    v.addEventListener('ended', finish);
    v.addEventListener('error', finish);
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
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
