/* 猫鼠大作战 — 反馈与工具函数（从 core.js 拆出） */
(function () {
  const TJ = (window.TJ = window.TJ || {});
  const D = TJ.DATA;
  const TAU = Math.PI * 2;
  const rand = function (g, a, b) { return TJ.helpers.rand(g, a, b); };
  const clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };

  function sfx(g, name) { g.events.push({ type: 'sfx', name }); }

  function addText(g, x, y, text, color, size) {
    if (g.texts.length > 90) return;
    g.texts.push({ x, y, text, color: color || '#fff', size: size || 17, life: 0.75, max: 0.75, vy: -46 });
  }

  function burst(g, x, y, color, n, spd, size) {
    if (g.particles.length > 700) return;
    for (let i = 0; i < n; i++) {
      const a = rand(g, 0, TAU), s = rand(g, spd * 0.25, spd);
      g.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: rand(g, 0.18, 0.45), max: 0.45, color,
        size: rand(g, (size || 3) * 0.6, (size || 3) * 1.5), grav: 0
      });
    }
  }

  /* ---------------- 碰撞 ---------------- */
  function resolveObstacles(g, ent, r) {
    for (const o of g.obstacles) {
      if (o.type === 'rect') {
        const cx = clamp(ent.x, o.x, o.x + o.w);
        const cy = clamp(ent.y, o.y, o.y + o.h);
        let dx = ent.x - cx, dy = ent.y - cy;
        let d2 = dx * dx + dy * dy;
        if (d2 < r * r) {
          if (d2 > 0.0001) {
            const d = Math.sqrt(d2);
            ent.x = cx + (dx / d) * r;
            ent.y = cy + (dy / d) * r;
          } else {
            const left = ent.x - o.x, right = o.x + o.w - ent.x;
            const top = ent.y - o.y, bottom = o.y + o.h - ent.y;
            const m = Math.min(left, right, top, bottom);
            if (m === left) ent.x = o.x - r;
            else if (m === right) ent.x = o.x + o.w + r;
            else if (m === top) ent.y = o.y - r;
            else ent.y = o.y + o.h + r;
          }
        }
      } else {
        const dx = ent.x - o.x, dy = ent.y - o.y;
        const d = Math.hypot(dx, dy), min = r + o.r;
        if (d < min && d > 0.0001) {
          ent.x = o.x + (dx / d) * min;
          ent.y = o.y + (dy / d) * min;
        }
      }
    }
    ent.x = clamp(ent.x, r + 18, g.W - r - 18);
    ent.y = clamp(ent.y, r + 18, g.H - r - 18);
  }

  function inObstacle(g, x, y, r) {
    for (const o of g.obstacles) {
      if (o.type === 'rect') {
        const cx = clamp(x, o.x, o.x + o.w), cy = clamp(y, o.y, o.y + o.h);
        if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true;
      } else if ((x - o.x) ** 2 + (y - o.y) ** 2 < (r + o.r) ** 2) return true;
    }
    return false;
  }

  /* ---------------- 伤害 ---------------- */


  TJ.Feedback = { sfx, addText, burst, resolveObstacles, inObstacle };
})();
