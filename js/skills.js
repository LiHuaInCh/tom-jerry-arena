/* 角色专属技能 */
(function () {
  const TJ = (window.TJ = window.TJ || {});
  function targets(g, f) {
    if (g.fighters) return g.fighters.filter(function (x) { return x !== f && x.alive; });
    return g.enemies.filter(function (e) { return !e.dead; });
  }
  function hurt(g, f, t, d) {
    if (g.fighters) TJ.helpers.hurtFighter(g, f, t, d);
    else TJ.helpers.hurtEnemy(g, f, t, d);
  }
  function use(g, f) {
    const sk = f.skill || (f.char && f.char.skill);
    if (!sk || (f.skillCd || 0) > 0) return false;
    const R = TJ.helpers;
    const ang = f.aim || f.facing || 0;
    if (sk.kind === 'blink') {
      const d = sk.dist || 170;
      f.x += Math.cos(ang) * d;
      f.y += Math.sin(ang) * d;
      f.x = Math.max(30, Math.min(g.W - 30, f.x));
      f.y = Math.max(30, Math.min(g.H - 30, f.y));
      R.resolveObstacles(g, f, f.r);
      f.invuln = Math.max(f.invuln, 0.4);
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 10, maxR: 44, life: 0.25, max: 0.25, color: '#9FE7FF' });
    } else if (sk.kind === 'shield') {
      f.invuln = Math.max(f.invuln, sk.dur || 1.8);
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 10, maxR: f.r * 2.6, life: 0.4, max: 0.4, color: '#FFD34D' });
    } else if (sk.kind === 'heal') {
      f.hp = Math.min(f.maxHp, f.hp + f.maxHp * (sk.pct || 0.35));
      R.addText(g, f.x, f.y - 36, '+' + Math.round(f.maxHp * (sk.pct || 0.35)), '#7BE495', 18);
    } else if (sk.kind === 'haste') {
      f.hasteT = sk.dur || 3.2;
      f.hasteMul = sk.mul || 1.5;
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 8, maxR: f.r * 2.4, life: 0.3, max: 0.3, color: '#9FE7FF' });
    } else if (sk.kind === 'stealth') {
      f.stealthT = sk.dur || 2.6;
      f.invuln = Math.max(f.invuln, 0.5);
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 10, maxR: f.r * 2.6, life: 0.4, max: 0.4, color: '#B9A7FF' });
      R.addText(g, f.x, f.y - 36, '隐身', '#B9A7FF', 16);
    } else if (sk.kind === 'invuln') {
      f.invuln = Math.max(f.invuln, sk.dur || 2.4);
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 12, maxR: f.r * 2.8, life: 0.45, max: 0.45, color: '#FFD34D' });
      R.addText(g, f.x, f.y - 36, '无敌', '#FFD34D', 16);
    } else if (sk.kind === 'slow') {
      const rad = sk.radius || 180;
      for (const t of targets(g, f)) {
        if (Math.hypot(t.x - f.x, t.y - f.y) <= rad + t.r) t.slowT = sk.dur || 2.5;
      }
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 12, maxR: rad, life: 0.35, max: 0.35, color: '#9FE7FF' });
    } else if (sk.kind === 'beam') {
      const len = sk.len || 560, half = (sk.width || 30) / 2;
      const dx = Math.cos(ang), dy = Math.sin(ang);
      for (const t of targets(g, f)) {
        const ex = t.x - f.x, ey = t.y - f.y;
        const tp = ex * dx + ey * dy;
        if (tp < 0 || tp > len) continue;
        if (Math.hypot(ex - dx * tp, ey - dy * tp) <= half + t.r) hurt(g, f, t, sk.dmg || 45);
      }
      g.effects.push({ kind: 'beam', x: f.x, y: f.y, ang: ang, len: len, life: 0.22, max: 0.22, color: '#FFE08A' });
    } else {
      const rad = sk.radius || 155;
      for (const t of targets(g, f)) {
        if (Math.hypot(t.x - f.x, t.y - f.y) <= rad + t.r) {
          hurt(g, f, t, sk.dmg || 40);
          const a = Math.atan2(t.y - f.y, t.x - f.x);
          t.kx = (t.kx || 0) + Math.cos(a) * 180;
          t.ky = (t.ky || 0) + Math.sin(a) * 180;
        }
      }
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 12, maxR: rad, life: 0.35, max: 0.35, color: '#FFB4A2' });
    }
    R.sfx(g, 'dash');
    g.shake = Math.max(g.shake || 0, 5);
    return true;
  }
  TJ.skills = { use: use };
})();
