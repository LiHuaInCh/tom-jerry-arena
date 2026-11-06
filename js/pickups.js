/* 猫鼠大作战 — 拾取与经验（从 core.js 拆出） */
(function () {
  const TJ = (window.TJ = window.TJ || {});
  const D = TJ.DATA;
  const sfx = function (g, n) { TJ.Feedback.sfx(g, n); };
  const addText = function (g, x, y, t, c, s) { TJ.Feedback.addText(g, x, y, t, c, s); };
  const rand = function (g, a, b) { return TJ.helpers.rand(g, a, b); };
  const clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };

  function updatePickups(g, dt) {
    const p = g.player;
    for (const pk of g.pickups) {
      if (pk.dead) continue;
      pk.life -= dt;
      if (pk.life <= 0) { pk.dead = true; continue; }
      const dx = p.x - pk.x, dy = p.y - pk.y;
      const d = Math.hypot(dx, dy) || 1;
      if (pk.pull || d < g.stats.magnet) {
        pk.pull = true;
        const sp = 260 + (g.stats.magnet - d) * 2;
        pk.x += (dx / d) * sp * dt;
        pk.y += (dy / d) * sp * dt;
      } else {
        pk.x += pk.vx * dt; pk.y += pk.vy * dt;
        pk.vx *= Math.pow(0.02, dt); pk.vy *= Math.pow(0.02, dt);
        pk.x = clamp(pk.x, 24, g.W - 24); pk.y = clamp(pk.y, 24, g.H - 24);
      }
      if (d < p.r + pk.r + 6) {
        pk.dead = true;
        if (pk.kind === 'xp') { addXp(g, pk.value); sfx(g, 'xp'); TJ.Missions.bump(g, 'collect', 1); }
      else if (pk.kind === 'cheese') { p.carry = true; sfx(g, 'coin'); addText(g, p.x, p.y - 40, '搬起奶酪', '#FFD34D', 18); }
        else if (pk.kind === 'magnet') {
          let n = 0;
          for (const q of g.pickups) {
            if (q.dead || q.kind !== 'xp') continue;
            q.dead = true; n++;
            addXp(g, q.value);
          }
          addText(g, p.x, p.y - 34, '经验全收 ' + n, '#7FD1FF', 20);
          sfx(g, 'coin');
        }
        else if (pk.kind === 'heart') {
          p.hp = Math.min(p.maxHp, p.hp + pk.value); addText(g, p.x, p.y - 30, '+' + pk.value, '#7CE08A', 20); sfx(g, 'heal');
        } else {
          g.score += pk.value; addText(g, p.x, p.y - 30, '+' + pk.value, '#FFD34D', 20); sfx(g, 'coin');
        }
      }
    }
    g.pickups = g.pickups.filter(x => !x.dead);
  }

  function addXp(g, v) {
    g.xp += v * (g.stats.xpMul || 1);
    while (g.xp >= g.xpNeed) {
      g.xp -= g.xpNeed;
      g.level++; g.player.level = g.level;
      g.pendingLevels++;
      g.xpNeed = Math.round(g.xpNeed * 1.18 + 3);
      g.player.hp = Math.min(g.player.maxHp, g.player.hp + 12);
      sfx(g, 'levelup');
      g.effects.push({ kind: 'ring', x: g.player.x, y: g.player.y, r: 10, maxR: 150, life: 0.5, max: 0.5, color: '#FFD34D' });
    }
  }


  TJ.Pickups = { update: updatePickups, addXp: addXp };
})();
