/* 猫鼠大作战 — 输入：键盘 + 触屏摇杆 */
(function () {
  const TJ = (window.TJ = window.TJ || {});

  TJ.Input = function () {
    const keys = new Set();
    let enabled = false;
    let dashQueued = false;
    let touchId = null, ox = 0, oy = 0, dx = 0, dy = 0, active = false;
    const RADIUS = 52;

    const joy = document.getElementById('joy');
    const knob = document.getElementById('joyKnob');

    function setJoyVisible(v) { if (joy) joy.classList.toggle('on', v); }

    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      keys.add(e.code);
      if (e.code === 'Space' && !e.repeat) { dashQueued = true; if (window.TJ.useSkillNow) window.TJ.useSkillNow(); }
    }, { passive: false });
    window.addEventListener('keyup', (e) => keys.delete(e.code));
    window.addEventListener('blur', () => keys.clear());

    function begin(x, y, id) {
      touchId = id; active = true;
      ox = x; oy = y; dx = 0; dy = 0;
      if (joy) {
        joy.style.left = x + 'px';
        joy.style.top = y + 'px';
      }
      setJoyVisible(true);
      moveKnob(0, 0);
    }

    function moveKnob(x, y) {
      if (knob) knob.style.transform = 'translate(-50%,-50%) translate(' + x + 'px,' + y + 'px)';
    }

    function move(x, y) {
      let vx = x - ox, vy = y - oy;
      const d = Math.hypot(vx, vy);
      if (d > RADIUS) { vx = vx / d * RADIUS; vy = vy / d * RADIUS; }
      dx = vx / RADIUS; dy = vy / RADIUS;
      moveKnob(vx, vy);
    }

    function end() {
      touchId = null; active = false; dx = 0; dy = 0;
      setJoyVisible(false);
      moveKnob(0, 0);
    }

    window.addEventListener('pointerdown', (e) => {
      if (!enabled || e.pointerType === 'mouse') return;
      if (e.clientX < window.innerWidth * 0.55 && touchId === null) {
        begin(e.clientX, e.clientY, e.pointerId);
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('pointermove', (e) => {
      if (e.pointerId !== touchId) return;
      move(e.clientX, e.clientY);
      e.preventDefault();
    }, { passive: false });

    window.addEventListener('pointerup', (e) => { if (e.pointerId === touchId) end(); });
    window.addEventListener('pointercancel', (e) => { if (e.pointerId === touchId) end(); });

    const dashBtn = document.getElementById('dashBtn');
    if (dashBtn) {
      dashBtn.addEventListener('pointerdown', (e) => {
        if (!enabled) return;
        e.preventDefault(); e.stopPropagation();
        dashQueued = true;
        if (window.TJ.useSkillNow) window.TJ.useSkillNow();
        dashBtn.classList.add('pressed');
      });
      dashBtn.addEventListener('pointerup', () => dashBtn.classList.remove('pressed'));
      dashBtn.addEventListener('pointercancel', () => dashBtn.classList.remove('pressed'));
    }

    return {
      setEnabled(v) { enabled = v; if (!v) end(); },
      sample() {
        let x = 0, y = 0;
        if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
        if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
        if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
        if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
        if (active) { x = dx; y = dy; }
        const d = Math.hypot(x, y);
        if (d > 1) { x /= d; y /= d; }
        const dash = dashQueued;
        dashQueued = false;
        return { moveX: x, moveY: y, dash };
      }
    };
  };
})();
