/* 猫鼠大作战 — 战斗结算（从 core.js 拆出） */
(function () {
  const TJ = (window.TJ = window.TJ || {});
  const D = TJ.DATA;
  const sfx = function (g, n) { TJ.Feedback.sfx(g, n); };
  const addText = function (g, x, y, t, c, s) { TJ.Feedback.addText(g, x, y, t, c, s); };
  const burst = function (g, x, y, c, n, spd, s) { TJ.Feedback.burst(g, x, y, c, n, spd, s); };
  const rand = function (g, a, b) { return TJ.helpers.rand(g, a, b); };
  const clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  const spawnEnemy = function () { return TJ.Core.spawnEnemy.apply(null, arguments); };
  const resolveObstacles = function () { return TJ.Feedback.resolveObstacles.apply(null, arguments); };

  function damageEnemy(g, e, dmg, crit) {
    if (e.dead) return;
    const __arm = Math.max(0, (e.armor || 0) - (g.stats.pen || 0));
    if (__arm) dmg *= (1 - __arm);
    if (g.stats.stunChance && !e.boss && g.rng() < g.stats.stunChance) e.stunT = 0.35;
    if (g.stats.slowOnHit && !e.boss) { e.slowT = 1.2; e.slowMul = 1 - g.stats.slowOnHit; }
    if (g.stats.dotDps && !e.boss) { e.dotT = 2.4; e.dotDps = g.stats.dotDps; e.dotTick = e.dotTick || 0; }
    const pslots = g.player && g.player.elemSlots ? g.player.elemSlots.filter(Boolean) : [];
    const pel = pslots[0];
    if (pel && e.element && g.t >= (e.reactAt || 0)) {
      const fu = (TJ.DATA.fusions || {})[[e.element, pel].sort().join('+')];
      if (fu) {
        e.reactAt = g.t + 2.5;
        addText(g, e.x, e.y - e.r - 26, fu.name, '#FFE08A', 18);
        if (fu.kind === 'burst') dmg *= 1.6;
        else if (fu.kind === 'crit' && g.rng() < 0.3) dmg *= 2;
        else if (fu.kind === 'debuff' || fu.kind === 'dot') dmg *= 1.1;
        else if (fu.kind === 'freeze') e.freezeT = Math.max(e.freezeT || 0, 0.8);
        else if (fu.kind === 'chain' || fu.kind === 'aoe') {
          const rad = fu.kind === 'aoe' ? 170 : 150;
          for (const n of g.enemies) {
            if (n === e || n.dead) continue;
            if (Math.hypot(n.x - e.x, n.y - e.y) > rad) continue;
            n.hp -= fu.kind === 'aoe' ? 18 : 12;
            if (n.hp <= 0) killEnemy(g, n);
          }
        }
        else if (fu.kind === 'heal' || fu.kind === 'leech') {
          const pct = fu.kind === 'leech' ? 0.12 : 0.02;
          healPlayer(g, g.player.maxHp * pct);
        }
        else if (fu.kind === 'splash') {
          for (const n of g.enemies) {
            if (n === e || n.dead) continue;
            if (Math.hypot(n.x - e.x, n.y - e.y) > 90) continue;
            n.hp -= dmg * 0.3;
            if (n.hp <= 0) killEnemy(g, n);
          }
        }
        if (pslots.length > 1) dmg *= 1.1;
      }
    }
    if (g.stats.lifesteal > 0) healPlayer(g, dmg * g.stats.lifesteal);
    g.pressure = Math.min(100, (g.pressure || 0) + dmg * 0.004);
    g.dmgDealt = (g.dmgDealt || 0) + dmg;
    e.hp -= dmg;
    e.flash = 0.09;
    addText(g, e.x + rand(g, -8, 8), e.y - e.r - 6, Math.round(dmg), crit ? '#FFD34D' : (pslots[0] ? ({ fire: '#FF7A3C', ice: '#7FD1FF', thunder: '#C9A7FF', light: '#FFE08A', dark: '#B98CFF' }[pslots[0]] || '#FFFFFF') : '#FFFFFF'), crit ? 24 : 17);
    burst(g, e.x, e.y, crit ? '#FFD34D' : '#FFB4A2', crit ? 8 : 4, 150, 3);
    if (e.boss && e.hp > 0) {
      e.phase = e.phase || 1;
      if (e.phase === 1 && e.hp <= e.maxHp * 0.66) {
        e.phase = 2; e.speed *= 1.15; e.dmg *= 1.1;
        if (e.kind === 'bigboss') { for (let si = 0; si < 4; si++) { const a2 = si / 4 * Math.PI * 2; spawnEnemy(g, 'kitten', g.wave, e.x + Math.cos(a2) * 90, e.y + Math.sin(a2) * 90); } addText(g, e.x, e.y - 100, '鼠王召唤！', '#FFB44D', 24); }
        g.effects.push({ kind: 'ring', x: e.x, y: e.y, r: 20, maxR: 180, life: 0.5, max: 0.5, color: '#FFB4A2' });
        addText(g, e.x, e.y - 80, '第二阶段！', '#FFB4A2', 30);
        sfx(g, 'boss');
      } else if (e.phase === 2 && e.hp <= e.maxHp * 0.33) {
        e.phase = 3; e.speed *= 1.2; e.dmg *= 1.15;
        g.effects.push({ kind: 'ring', x: e.x, y: e.y, r: 24, maxR: 260, life: 0.6, max: 0.6, color: '#FF7A5C' });
        addText(g, e.x, e.y - 80, '狂暴阶段！', '#FF7A5C', 32);
        g.shake = 16;
        sfx(g, 'boss');
      }
    }
    if (e.hp <= 0) killEnemy(g, e);
    else sfx(g, 'hit');
  }

  function killEnemy(g, e) {
    if (e.dead) return;
    e.dead = true; /* __emote */
    if (g.boss === e) g.boss = null;
    if (g.player && (e.elite || e.boss)) { g.emotes = g.emotes || []; g.emotes.push({ x: g.player.x, y: g.player.y - g.player.r * 1.6, img: 'assets/emotes/' + (g.rng() < 0.5 ? 'smug' : (g.rng() < 0.5 ? 'face' : 'catstand')), life: 0.9, max: 0.9 }); }
    if (e.def && e.def.sprite) g.effects.push({ kind: 'ghost', sprite: e.def.sprite, x: e.x, y: e.y, r: e.r, life: 0.32, max: 0.32 });
    if (e.elite && e.mod === 'split') {
      for (let i = 0; i < 2; i++) {
        const c = spawnEnemy(g, 'kitten', Math.max(1, g.wave - 1));
        if (c) { c.x = e.x + (i ? 20 : -20); c.y = e.y; c.hp = c.maxHp = Math.round(c.maxHp * 0.6); }
      }
    }
    g.kills++;
    TJ.Missions.bump(g, 'timed', 1);
    if (e.kind === 'bomber' && !e.exploded) { e.exploded = true; explodeAt(g, e.x, e.y, 150, 40 + g.wave * 4, e); }
    TJ.Missions.bump(g, 'kill', 1);
    TJ.Missions.bump(g, 'zone', 1, TJ.Missions.zoneOf(g, e.x, e.y));
    if (e.elite) TJ.Missions.bump(g, 'elite', 1);
    g.score += Math.round((e.def.score + Math.floor(g.wave * 2)) * ((g.cov && g.cov.score) || 1));
    if (e.def.boss || e.elite) g.hitStop = 0.1;
    const tk = g.player.char.talent;
    if (tk && tk.healKill) healPlayer(g, Math.min(g.player.maxHp * 0.03, 4 + g.wave * 0.5));
    burst(g, e.x, e.y, e.def.fur, 14, 260, 5);
    g.effects.push({ kind: 'spark', x: e.x, y: e.y, life: 0.3, max: 0.3, color: e.def.fur, n: 10, r1: 40, width: 3, rot: rand(g, 0, 6.28) });
    g.effects.push({ kind: 'tex', src: 'assets/fx/kenney/flame_03.png', x: e.x, y: e.y, life: 0.32, max: 0.32, s0: 14, s1: 44, rot: rand(g, 0, 6.28), spin: 1.4 });
    g.effects.push({ kind: 'tex', src: 'assets/fx/kenney/smoke_01.png', x: e.x, y: e.y, life: 0.5, max: 0.5, s0: 18, s1: 58, alpha: 0.55, rot: rand(g, 0, 6.28) });
    if (e.boss) g.effects.push({ kind: 'tex', src: 'assets/fx/kenney/circle_05.png', x: e.x, y: e.y, life: 0.7, max: 0.7, s0: 40, s1: 220, alpha: 0.8 });
    g.effects.push({ kind: 'ring', x: e.x, y: e.y, r: 8, maxR: e.r * 2.4, life: 0.28, max: 0.28, color: '#FFFFFF' });
    const orbCount = e.boss ? 22 : (e.def.xp >= 6 ? 3 : 1);
    for (let i = 0; i < orbCount; i++) {
      g.pickups.push({
        kind: 'xp', x: e.x + rand(g, -14, 14), y: e.y + rand(g, -14, 14),
        vx: rand(g, -120, 120), vy: rand(g, -120, 120), r: 7,
        value: Math.max(1, Math.round(e.def.xp / orbCount)), life: 30, pull: false
      });
    }
    if (g.rng() < 0.04) g.pickups.push({ kind: 'magnet', x: e.x, y: e.y, vx: 0, vy: 0, r: 13, value: 0, life: 24, pull: false });
    if (g.rng() < 0.04 && !(g.cov && g.cov.noHeal)) g.pickups.push({ kind: 'heart', x: e.x, y: e.y, vx: 0, vy: 0, r: 11, value: 22, life: 22, pull: false });
    if (g.rng() < 0.055) g.pickups.push({ kind: 'cheese', x: e.x + 12, y: e.y, vx: 0, vy: 0, r: 12, value: 60, life: 22, pull: false });
    if (e.boss) {
      g.shake = 18; if (g.boss === e) g.boss = null; sfx(g, 'bossdown');
      g.player.hp = Math.min(g.player.maxHp, g.player.hp + 30);
      g.effects.push({ kind: 'ring', x: e.x, y: e.y, r: 10, maxR: 320, life: 0.6, max: 0.6, color: '#FFD34D' });
      addText(g, e.x, e.y - 60, 'BOSS 击破！', '#FFD34D', 30);
      if ((g.stats.lifesteal || 0) < 0.02) { g.stats.lifesteal += 0.004; addText(g, g.player.x, g.player.y - 80, '特殊强化：吸血 0.4%', '#FF9AA2', 22); }
    } else {
      sfx(g, 'kill');
    }
  }

  function healPlayer(g, amt) {
    const p = g.player;
    if (!p || p.hp <= 0) return;
    p.hp = Math.min(p.maxHp, p.hp + amt * ((p.noHealT || 0) > 0 ? 0.35 : 1));
  }

  function explodeAt(g, x, y, radius, dmg, chainFrom) {
    for (const n of g.enemies) {
      if (n.dead || n === chainFrom) continue;
      const d = Math.hypot(n.x - x, n.y - y);
      if (d > radius) continue;
      n.hp -= dmg * (1 - 0.5 * d / radius);
      if (n.hp <= 0) killEnemy(g, n);
    }
    const p = g.player;
    const pd = Math.hypot(p.x - x, p.y - y);
    if (pd < radius) hurtPlayer(g, dmg * (1 - 0.55 * pd / radius), x, y);
    g.effects.push({ kind: 'ring', x: x, y: y, r: 12, maxR: radius, life: 0.35, max: 0.35, color: '#FF9A5C' });
    g.effects.push({ kind: 'tex', src: 'assets/fx/kenney/flame_03.png', x: x, y: y, life: 0.3, max: 0.3, s0: 20, s1: 80 });
    g.shake = Math.max(g.shake || 0, 8);
    sfx(g, 'explode');
  }

  function hurtPlayer(g, dmg, sx, sy, pierce) {
    const p = g.player;
    if ((!pierce && p.invuln > 0) || g.over) return;
    if (pierce) p.noHealT = Math.max(p.noHealT || 0, 3);
    if (!pierce && p.shield > 0) {
      p.shield--; p.shieldCd = 9; p.invuln = 0.6;
      g.effects.push({ kind: 'ring', x: p.x, y: p.y, r: 12, maxR: 80, life: 0.35, max: 0.35, color: '#7FD1FF' });
      sfx(g, 'shield'); g.shake = 5;
      return;
    }
    g.hitTaken = true;
    if (g.wave <= 5) dmg *= 0.85;
    if (g.wave >= 10) p.noHealT = Math.max(p.noHealT || 0, 2);
    if (g.wave >= 14) { p.shield = 0; p.shieldCd = Math.max(p.shieldCd, 6); }
    p.hp -= dmg * (1 - g.stats.armor);
    if (g.missions && TJ.Missions.fail) TJ.Missions.fail(g, 'nohit');
    p.invuln = 0.65; p.hitFlash = 0.3; p.hurtT = 0; g.shake = Math.max(g.shake, 8);
    sfx(g, 'hurt');
    if (sx != null) {
      const a = Math.atan2(p.y - sy, p.x - sx);
      p.x += Math.cos(a) * 14; p.y += Math.sin(a) * 14;
      resolveObstacles(g, p, p.r);
    }
    if (p.hp <= 0) {
      if (!g.revived) {
        g.revived = true;
        p.hp = Math.round(p.maxHp * 0.5);
        p.invuln = 2.2;
        g.shake = 18;
        g.effects.push({ kind: 'ring', x: p.x, y: p.y, r: 10, maxR: 260, life: 0.7, max: 0.7, color: '#FFD34D' });
        for (const e of g.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < 220) { e.kx = (e.x - p.x) / (d || 1) * 420; e.ky = (e.y - p.y) / (d || 1) * 420; }
        }
        addText(g, p.x, p.y - 56, '第二次机会！', '#FFD34D', 27);
        sfx(g, 'levelup');
        g.events.push({ type: 'revive' });
        return;
      }
      p.hp = 0; g.over = true; g.shake = 20;
      burst(g, p.x, p.y, p.char.fur, 30, 320, 6);
      sfx(g, 'death');
    }
  }

  /* ---------------- 玩家攻击 ---------------- */
  function nearestEnemy(g, x, y, maxDist) {
    let best = null, bd = maxDist * maxDist;
    for (const e of g.enemies) {
      if (e.dead) continue;
      const d = (e.x - x) ** 2 + (e.y - y) ** 2;
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }


  TJ.Combat = { damageEnemy: damageEnemy, killEnemy: killEnemy, healPlayer: healPlayer, explodeAt: explodeAt, hurtPlayer: hurtPlayer, nearestEnemy: nearestEnemy };
})();
