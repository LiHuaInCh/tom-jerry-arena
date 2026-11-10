(function () {
  var sp = document.getElementById('splash');
  if (!sp) return;
  var v = document.getElementById('splashVid');
  var done = false;
  function finish() {
    if (done) return;
    done = true;
    sp.classList.add('gone');
    setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 700);
  }
  if (location.search.indexOf('play=1') >= 0) { sp.remove(); return; }
  if (v) {
    v.addEventListener('ended', finish);
    v.addEventListener('error', finish);
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  var sk = document.getElementById('splashSkip');
  if (sk) sk.onclick = finish;
  setTimeout(finish, 9500);
})();
