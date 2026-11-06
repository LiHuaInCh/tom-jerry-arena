/* 猫鼠大作战 — 核心逻辑（纯 JS，无 DOM，可在 Node 中跑测试） */
(function () {
  const TJ = (window.TJ = window.TJ || {});
  const D = TJ.DATA;
  const TAU = Math.PI * 2;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rand = (g, a, b) => a + g.rng() * (b - a);
  const pick = (g, arr) => arr[Math.floor(g.rng() * arr.length)];

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function baseStats() {
    return {
      damage: 1, fireRate: 1.3, speed: 1, maxHp: 0, crit: 0.08, critMul: 1.8,
      pierce: 0, multishot: 0, bounce: 0, homing: 0, explode: 0, lifesteal: 0,
      magnet: 78, armor: 0, dashCd: 2.0, dashDamage: 0, skillCdMul: 1, projSpeed: 1, range: 0,
      shieldMax: 0, luck: 0
    };
  }

  /* ---------------- 创建对局 ---------------- */
  TJ.createGame = function (opts) {
    opts = opts || {};
    const g = {
      rng: mulberry32(opts.seed == null ? (Date.now() & 0x7fffffff) : opts.seed),
      W: D.W, H: D.H, t: 0, elapsed: 0, over: false,
      player: null, enemies: [], projectiles: [], pickups: [], particles: [],
      texts: [], effects: [], obstacles: D.obstacles.map(o => Object.assign({}, o)),
      stats: baseStats(), upgradeCounts: {},
      level: 1, xp: 0, xpNeed: 5, pendingLevels: 0,
      kills: 0, score: 0, wave: 0, spawnTimer: 1.0, boss: null, shake: 0, revived: false,
      events: [], cam: { x: D.W / 2, y: D.H / 2 }, seed: opts.seed
    };
    g.player = makePlayer(g, opts.charId);
    g.cam.x = g.player.x; g.cam.y = g.player.y;
    return g;
  };

  function makePlayer(g, charId) {
    const c = D.characters.find(x => x.id === charId) || D.characters[0];
    return {
      char: c, charId: c.id, skill: c.skill, weapon: c.weapon, x: D.W / 2, y: D.H / 2, vx: 0, vy: 0,
      r: c.radius, hp: c.hp, maxHp: c.hp, speed: c.speed,
      facing: -Math.PI / 2, aim: -Math.PI / 2,
      fireCd: 0.12, dashCd: 0, dashT: 0, dashX: 1, dashY: 0, dashHits: null, skillCd: 0, hasteT: 0,
      invuln: 1.2, hitFlash: 0, walk: 0, moving: false,
      shield: 0, shieldCd: 0, hurtT: 99, level: 1, alive: true, target: null
    };
  }

  /* ---------------- 事件 / 特效 ---------------- */
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
  function damageEnemy(g, e, dmg, crit) {
    if (e.dead) return;
    if (e.armor) dmg *= (1 - e.armor);
    e.hp -= dmg;
    e.flash = 0.09;
    addText(g, e.x + rand(g, -8, 8), e.y - e.r - 6, Math.round(dmg), crit ? '#FFD34D' : '#FFFFFF', crit ? 24 : 17);
    burst(g, e.x, e.y, crit ? '#FFD34D' : '#FFB4A2', crit ? 8 : 4, 150, 3);
    if (g.stats.lifesteal > 0) {
      g.player.hp = Math.min(g.player.maxHp, g.player.hp + dmg * g.stats.lifesteal);
    }
    if (e.boss && e.hp > 0) {
      e.phase = e.phase || 1;
      if (e.phase === 1 && e.hp <= e.maxHp * 0.66) {
        e.phase = 2; e.speed *= 1.15; e.dmg *= 1.1;
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
    e.dead = true;
    if (e.elite && e.mod === 'split') {
      for (let i = 0; i < 2; i++) {
        const c = spawnEnemy(g, 'kitten', Math.max(1, g.wave - 1));
        if (c) { c.x = e.x + (i ? 20 : -20); c.y = e.y; c.hp = c.maxHp = Math.round(c.maxHp * 0.6); }
      }
    }
    g.kills++;
    g.score += Math.round((e.def.score + Math.floor(g.wave * 2)) * ((g.cov && g.cov.score) || 1));
    burst(g, e.x, e.y, e.def.fur, 14, 260, 5);
    g.effects.push({ kind: 'ring', x: e.x, y: e.y, r: 8, maxR: e.r * 2.4, life: 0.28, max: 0.28, color: '#FFFFFF' });
    const orbCount = e.def.boss ? 22 : (e.def.xp >= 6 ? 3 : 1);
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
    if (e.def.boss) {
      g.shake = 18; g.boss = null; sfx(g, 'bossdown');
      g.player.hp = Math.min(g.player.maxHp, g.player.hp + 30);
      g.effects.push({ kind: 'ring', x: e.x, y: e.y, r: 10, maxR: 320, life: 0.6, max: 0.6, color: '#FFD34D' });
      addText(g, e.x, e.y - 60, 'BOSS 击破！', '#FFD34D', 30);
    } else {
      sfx(g, 'kill');
    }
  }

  function hurtPlayer(g, dmg, sx, sy) {
    const p = g.player;
    if (p.invuln > 0 || g.over) return;
    if (p.shield > 0) {
      p.shield--; p.shieldCd = 9; p.invuln = 0.6;
      g.effects.push({ kind: 'ring', x: p.x, y: p.y, r: 12, maxR: 80, life: 0.35, max: 0.35, color: '#7FD1FF' });
      sfx(g, 'shield'); g.shake = 5;
      return;
    }
    p.hp -= dmg * (1 - g.stats.armor);
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

  function fire(g, target) {
    if (D.weapons[g.player.char.weapon].kind === 'orbit') return;
    const p = g.player, w = D.weapons[p.char.weapon], st = g.stats;
    const ang = Math.atan2(target.y - p.y, target.x - p.x);
    p.aim = ang; p.facing = ang;

    if (w.kind === 'melee') {
      const range = w.range + st.range * 0.25;
      const arc = w.arc;
      for (const e of g.enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d > range + e.r) continue;
        let da = Math.atan2(e.y - p.y, e.x - p.x) - ang;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        if (Math.abs(da) > arc / 2) continue;
        const crit = g.rng() < st.crit;
        damageEnemy(g, e, w.dmg * st.damage * (crit ? st.critMul : 1), crit);
        e.kx = Math.cos(ang) * 90; e.ky = Math.sin(ang) * 90;
      }
      for (const pr of g.projectiles) {
        if (pr.from !== 'enemy') continue;
        const d = Math.hypot(pr.x - p.x, pr.y - p.y);
        let da = Math.atan2(pr.y - p.y, pr.x - p.x) - ang;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        if (d < range && Math.abs(da) < arc / 2) pr.dead = true;
      }
      g.effects.push({ kind: 'slash', x: p.x, y: p.y, ang, range, arc, life: 0.22, max: 0.22 });
      sfx(g, 'slash');
      return;
    }

    if (w.kind === 'beam') {
      const len = w.range + st.range;
      const half = (w.width || 24) / 2;
      const dx = Math.cos(ang), dy = Math.sin(ang);
      for (const e of g.enemies) {
        if (e.dead) continue;
        const ex = e.x - p.x, ey = e.y - p.y;
        const t = ex * dx + ey * dy;
        if (t < 0 || t > len) continue;
        if (Math.hypot(ex - dx * t, ey - dy * t) <= half + e.r) damageEnemy(g, e, w.dmg * st.damage, false);
      }
      g.effects.push({ kind: 'beam', x: p.x, y: p.y, ang: ang, len: len, life: 0.18, max: 0.18, color: w.color });
      sfx(g, 'shoot');
      p.fireCd = w.cd / st.fireRate;
      return;
    }
    if (w.kind === 'chain') {
      let cur = target, dmg = w.dmg * st.damage;
      const hit = {}, pts = [{ x: p.x, y: p.y }];
      for (let i = 0; i < (w.jumps || 3) && cur; i++) {
        hit[cur.id] = 1;
        pts.push({ x: cur.x, y: cur.y });
        damageEnemy(g, cur, dmg, false);
        dmg *= 0.82;
        let nxt = null, nd = 300;
        for (const e of g.enemies) {
          if (e.dead || hit[e.id]) continue;
          const d = Math.hypot(e.x - cur.x, e.y - cur.y);
          if (d < nd) { nd = d; nxt = e; }
        }
        cur = nxt;
      }
      g.effects.push({ kind: 'chain', pts: pts, life: 0.24, max: 0.24, color: w.color });
      sfx(g, 'shoot');
      p.fireCd = w.cd / st.fireRate;
      return;
    }

    const count = 1 + st.multishot;
    const spread = 0.10;
    for (let i = 0; i < count; i++) {
      const off = (i - (count - 1) / 2) * spread + rand(g, -0.02, 0.02);
      const a = ang + off;
      const crit = g.rng() < st.crit;
      const speed = w.speed * st.projSpeed;
      g.projectiles.push({
        x: p.x + Math.cos(a) * (p.r + 8), y: p.y + Math.sin(a) * (p.r + 8),
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
        r: w.proj === 'rocket' ? 9 : 7, dmg: w.dmg * st.damage * (crit ? st.critMul : 1),
        crit, pierce: st.pierce, bounce: Math.max(st.bounce, w.bounce || 0),
        homing: st.homing || (w.homing || 0), explode: st.explode || w.splash ? (st.explode ? 1 : 0) : 0,
        splash: w.splash ? w.splash : 0, kind: w.proj, from: 'player',
        life: 1.5 + st.range / 1200, hit: {}, color: w.color, ang: a,
        explodeOnDeath: !!w.splash || !!st.explode
      });
    }
    sfx(g, w.proj === 'rocket' ? 'rocket' : 'shoot');
  }

  function explode(g, x, y, radius, dmg) {
    g.effects.push({ kind: 'ring', x, y, r: 10, maxR: radius, life: 0.32, max: 0.32, color: '#FFB347' });
    burst(g, x, y, '#FF9A3C', 18, 320, 5);
    g.shake = Math.max(g.shake, 6);
    for (const e of g.enemies) {
      if (e.dead) continue;
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < radius + e.r) damageEnemy(g, e, dmg * (1 - 0.4 * d / (radius + e.r)), false);
    }
    sfx(g, 'explode');
  }

  /* ---------------- 生成敌人 ---------------- */
  function spawnEnemy(g, kind, wave, px, py) {
    const def = D.enemies[kind];
    let x = 0, y = 0, ok = false;
    if (px != null) {
      x = clamp(px, 60, g.W - 60);
      y = clamp(py, 60, g.H - 60);
      ok = !inObstacle(g, x, y, def.radius + 10);
    }
    for (let i = 0; i < 24 && !ok; i++) {
      const a = rand(g, 0, TAU), d = rand(g, 560, 820);
      x = clamp(g.player.x + Math.cos(a) * d, 60, g.W - 60);
      y = clamp(g.player.y + Math.sin(a) * d, 60, g.H - 60);
      const dd = Math.hypot(x - g.player.x, y - g.player.y);
      ok = dd > 380 && !inObstacle(g, x, y, def.radius + 10);
    }
    if (!ok) return;
    const scale = def.boss ? (1 + Math.max(0, wave - 1) * 0.10) : (1 + Math.max(0, wave - 1) * 0.24);
    const e = {
      id: ++g._eid || (g._eid = 1), kind, def, x, y, vx: 0, vy: 0, r: def.radius,
      hp: Math.round(def.hp * scale), maxHp: Math.round(def.hp * scale),
      speed: def.speed * (1 + Math.min(0.45, wave * 0.016)), dmg: def.dmg * (1 + wave * 0.045),
      flash: 0, hitCd: 0, spawnT: 0.35, dead: false, kx: 0, ky: 0,
      state: 'idle', stateT: 0, atkCd: rand(g, 0.6, 1.6), charge: null,
      pending: null, summoned: 0, walk: rand(g, 0, TAU), boss: !!def.boss, recoil: 0
    };
    if (!def.boss && wave >= 2 && g.rng() < Math.min(0.30, 0.08 + wave * 0.012) * ((g.cov && g.cov.elite) || 1)) {
      e.elite = true;
      e.mod = ['shield', 'swift', 'split'][Math.floor(g.rng() * 3)];
      e.hp = Math.round(e.hp * (e.mod === 'shield' ? 2.0 : 1.5));
      e.maxHp = e.hp;
      e.dmg *= 1.15;
      if (e.mod === 'swift') e.speed *= 1.45;
      if (e.mod === 'shield') e.armor = 0.35;
    }
    g.enemies.push(e);
    if (def.boss) {
      g.boss = e; sfx(g, 'boss'); g.shake = 14;
      addText(g, e.x, e.y - 70, def.name + ' 出现了！', '#FF7A5C', 28);
      g.events.push({ type: 'boss', e });
    }
    return e;
  }

  function spawnBossAt(g, kind, wave) {
    return spawnEnemy(g, kind, wave);
  }

  /* ---------------- 更新 ---------------- */
  function updatePlayer(g, dt, input) {
    const p = g.player, st = g.stats;
    if (!p.talentApplied && p.char.talent) {
      p.talentApplied = true;
      const t = p.char.talent;
      if (t.stat === 'maxHp') { p.maxHp += t.value; p.hp += t.value; }
      else if (t.stat === 'magnet') st.magnet += t.value;
      else st[t.stat] = (st[t.stat] || 0) + t.value;
    }
    p.invuln = Math.max(0, p.invuln - dt);
    p.hitFlash = Math.max(0, p.hitFlash - dt);
    p.hurtT += dt;
    p.fireCd -= dt;
    p.dashCd = Math.max(0, p.dashCd - dt);

    if (st.shieldMax > 0 && p.shield < st.shieldMax && p.shieldCd > 0) {
      p.shieldCd -= dt;
      if (p.shieldCd <= 0) { p.shield = Math.min(st.shieldMax, p.shield + 1); sfx(g, 'shieldup'); }
    }

    let mx = input.moveX || 0, my = input.moveY || 0;
    const ml = Math.hypot(mx, my);
    if (ml > 1) { mx /= ml; my /= ml; }
    p.moving = ml > 0.05;

    p.skillCd = Math.max(0, p.skillCd - dt);
    p.hasteT = Math.max(0, p.hasteT - dt);
    p.stealthT = Math.max(0, (p.stealthT || 0) - dt);
    p.slowT = Math.max(0, (p.slowT || 0) - dt);
    if (input.dash && p.skillCd <= 0 && p.skill) {
      if (TJ.skills.use(g, p, false)) p.skillCd = p.skill.cd * (st.skillCdMul || 1);
    }

    if (false) {
      if (ml > 0.1) { p.dashX = mx; p.dashY = my; } else { p.dashX = Math.cos(p.facing); p.dashY = Math.sin(p.facing); }
      p.dashT = 0.17; p.dashCd = st.dashCd; p.invuln = Math.max(p.invuln, 0.28);
      p.dashHits = {};
      g.effects.push({ kind: 'ring', x: p.x, y: p.y, r: 8, maxR: 46, life: 0.25, max: 0.25, color: '#BFE9FF' });
      sfx(g, 'dash');
    }

    if (p.dashT > 0) {
      p.dashT -= dt;
      p.x += p.dashX * 880 * dt;
      p.y += p.dashY * 880 * dt;
      if (st.dashDamage > 0) {
        for (const e of g.enemies) {
          if (e.dead || p.dashHits[e.id]) continue;
          if (Math.hypot(e.x - p.x, e.y - p.y) < e.r + p.r + 6) {
            p.dashHits[e.id] = 1;
            damageEnemy(g, e, st.dashDamage, false);
            e.kx = p.dashX * 220; e.ky = p.dashY * 220;
          }
        }
      }
    } else {
      const hs = (p.hasteT > 0 ? (p.hasteMul || 1.5) : 1) * (p.slowT > 0 ? 0.5 : 1) * (p.stealthT > 0 ? 1.25 : 1);
      p.x += mx * p.speed * st.speed * hs * dt;
      p.y += my * p.speed * st.speed * hs * dt;
    }

    resolveObstacles(g, p, p.r);
    if (p.moving) p.walk += dt * 11 * st.speed;

    const ow = D.weapons[p.char.weapon];
    if (ow.kind === 'orbit') {
      p.orbitA = (p.orbitA || 0) + dt * 3.4;
      p.orbitBonus = st.orbitBonus || 0; p.orbitRBonus = st.orbitRBonus || 0;
      const on = (ow.orbitN || 2) + (p.orbitBonus || 0);
      const orad = (ow.orbitR || 78) + (p.orbitRBonus || 0);
      for (const e of g.enemies) {
        if (e.dead) continue;
        e.orbitCd = Math.max(0, (e.orbitCd || 0) - dt);
        if (e.orbitCd > 0) continue;
        for (let i = 0; i < on; i++) {
          const a = p.orbitA + i * Math.PI * 2 / on;
          const ox = p.x + Math.cos(a) * orad;
          const oy = p.y + Math.sin(a) * orad;
          if (Math.hypot(e.x - ox, e.y - oy) < e.r + 16) {
            damageEnemy(g, e, ow.dmg * st.damage * (st.orbitDmgMul || 1), false);
            if (g.rng() < 0.4) sfx(g, 'hit');
            e.orbitCd = (ow.hitCd || 0.45) / (st.fireRate || 1);
            g.effects.push({ kind: 'ring', x: ox, y: oy, r: 6, maxR: 24, life: 0.18, max: 0.18, color: '#FFE08A' });
            break;
          }
        }
      }
    }
    if (p.subWeapon) {
      const sw = D.weapons[p.subWeapon];
      p.subCd = Math.max(0, (p.subCd || 0) - dt);
      const subTarget = nearestEnemy(g, p.x, p.y, (sw.range || 800) + st.range);
      if (subTarget && p.subCd <= 0) {
        const sa = Math.atan2(subTarget.y - p.y, subTarget.x - p.x);
        if (sw.kind === 'orbit') {
          p.subOrbitA = (p.subOrbitA || 0) + dt;
        } else {
          g.projectiles.push({
            x: p.x, y: p.y, vx: Math.cos(sa) * (sw.speed || 500), vy: Math.sin(sa) * (sw.speed || 500),
            r: 7, dmg: sw.dmg * st.damage * 0.8, from: 'player', kind: sw.proj || 'orb',
            life: 2, hit: {}, color: sw.color || '#BFE9FF',
            splash: sw.splash || 0, explodeOnDeath: !!sw.splash, pierce: sw.pierce || 0
          });
          p.subCd = (sw.cd || 1) * 1.2;
          sfx(g, 'shoot');
        }
      }
    }
    if (p.subWeapon) {
      const sw = D.weapons[p.subWeapon];
      if (sw.kind === 'orbit') {
        p.subOrbitA = (p.subOrbitA || 0) + dt * 3.8;
        const sr = (sw.orbitR || 78) - 26;
        for (const e of g.enemies) {
          if (e.dead || (e.subOrbitCd || 0) > g.t) continue;
          const ox = p.x + Math.cos(p.subOrbitA) * sr;
          const oy = p.y + Math.sin(p.subOrbitA) * sr;
          if (Math.hypot(e.x - ox, e.y - oy) < e.r + 14) {
            damageEnemy(g, e, sw.dmg * st.damage * 0.6, false);
            e.subOrbitCd = g.t + 0.4;
            g.effects.push({ kind: 'ring', x: ox, y: oy, r: 5, maxR: 20, life: 0.16, max: 0.16, color: '#9FE7FF' });
          }
        }
      }
    }
    const target = nearestEnemy(g, p.x, p.y, D.weapons[p.char.weapon].range + st.range);
    p.target = target;
    if (target) {
      const a = Math.atan2(target.y - p.y, target.x - p.x);
      p.aim = a;
      if (!p.moving || p.dashT > 0) p.facing = a;
      if (p.fireCd <= 0) { fire(g, target); p.fireCd = D.weapons[p.char.weapon].cd / st.fireRate; }
    } else if (p.moving) {
      p.aim = Math.atan2(my, mx);
      p.facing = p.aim;
    }
    if (p.moving) p.facing = p.aim;
  }

  function moveEnemy(g, e, dt, dx, dy) {
    e.x += dx; e.y += dy;
    resolveObstacles(g, e, e.r);
  }

  function updateEnemies(g, dt) {
    const p = g.player;
    for (const e of g.enemies) {
      if (e.dead) continue;
      e.flash = Math.max(0, e.flash - dt);
      e.spawnT = Math.max(0, e.spawnT - dt);
      e.hitCd -= dt;
      e.recoil = Math.max(0, (e.recoil || 0) - dt);
      e.walk += dt * 8;
      if (e.kx || e.ky) {
        e.x += e.kx * dt; e.y += e.ky * dt;
        e.kx *= Math.pow(0.0025, dt); e.ky *= Math.pow(0.0025, dt);
        if (Math.abs(e.kx) < 1 && Math.abs(e.ky) < 1) { e.kx = 0; e.ky = 0; }
      }

      const dx = p.x - e.x, dy = p.y - e.y;
      const d = Math.max(0.001, Math.hypot(dx, dy));
      const ux = dx / d, uy = dy / d;

      if (e.spawnT > 0.2) continue;

      if (e.pending) {
        e.pending.t -= dt;
        if (e.pending.t <= 0) resolvePending(g, e);
        continue;
      }

      if (e.charge) {
        e.charge.t -= dt;
        e.x += e.charge.dx * 760 * dt;
        e.y += e.charge.dy * 760 * dt;
        resolveObstacles(g, e, e.r);
        if (Math.hypot(p.x - e.x, p.y - e.y) < e.r + p.r + 2 && e.hitCd <= 0) {
          hurtPlayer(g, e.dmg, e.x, e.y); e.hitCd = 1.2;
        }
        if (e.charge.t <= 0) {
          e.charge = null; e.state = 'idle'; e.atkCd = 1.9;
          g.effects.push({ kind: 'ring', x: e.x, y: e.y, r: 10, maxR: 90, life: 0.3, max: 0.3, color: '#FFB4A2' });
        }
        continue;
      }

      switch (e.kind) {
        case 'spitter': {
          const want = 300;
          const dir = d > want + 40 ? 1 : (d < want - 40 ? -1 : 0);
          e.x += ux * dir * e.def.speed * dt;
          e.y += uy * dir * e.def.speed * dt;
          e.x += -uy * 40 * dt; e.y += ux * 40 * dt;
          e.atkCd -= dt;
          if (e.atkCd <= 0 && d < 700) {
            e.atkCd = 1.6;
            const a = Math.atan2(dy, dx);
            for (const off of [-0.18, 0, 0.18]) {
              g.projectiles.push({
                x: e.x + Math.cos(a) * e.r, y: e.y + Math.sin(a) * e.r,
                vx: Math.cos(a + off) * 320, vy: Math.sin(a + off) * 320, r: 7,
                dmg: e.dmg * 0.75, from: 'enemy', kind: 'fishbone', life: 3, hit: {}, color: '#EDE2F7'
              });
            }
            sfx(g, 'eshoot');
          }
          break;
        }
        case 'dasher': {
          e.atkCd -= dt;
          if (e.atkCd <= 0 && d < 460) {
            e.pending = { kind: 'wind', t: 0.5, ang: Math.atan2(dy, dx) };
            e.atkCd = 2.2;
          } else {
            e.x += ux * e.def.speed * 0.55 * dt;
            e.y += uy * e.def.speed * 0.55 * dt;
          }
          break;
        }
        case 'tom':
        case 'spike': {
          updateBoss(g, e, dt, d, ux, uy);
          break;
        }
        default: {
          if (e.recoil > 0) {
            e.x -= ux * 150 * dt; e.y -= uy * 150 * dt;
          } else {
            e.x += ux * e.def.speed * dt;
            e.y += uy * e.def.speed * dt;
          }
          if (d < e.r + p.r + 2 && e.hitCd <= 0) {
            hurtPlayer(g, e.dmg, e.x, e.y);
            e.hitCd = 1.3;
            e.recoil = 0.5;
            e.kx = -ux * 300; e.ky = -uy * 300;
          }
        }
      }
      resolveObstacles(g, e, e.r);
    }

    // 敌人间分离，避免叠在一起
    const arr = g.enemies;
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      if (a.dead) continue;
      for (let j = i + 1; j < arr.length; j++) {
        const b = arr[j];
        if (b.dead) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const min = a.r + b.r;
        const d2 = dx * dx + dy * dy;
        if (d2 < min * min && d2 > 0.001) {
          const d = Math.sqrt(d2), push = (min - d) * 0.5;
          const nx = dx / d, ny = dy / d;
          if (!a.boss) { a.x -= nx * push; a.y -= ny * push; }
          if (!b.boss) { b.x += nx * push; b.y += ny * push; }
        }
      }
    }
  }

  function resolvePending(g, e) {
    const p = g.player;
    const pend = e.pending;
    e.pending = null;
    if (!pend) return;
    if (pend.kind === 'wind') {
      e.charge = { t: 0.42, dx: Math.cos(pend.ang), dy: Math.sin(pend.ang) };
      e.state = 'charge';
      sfx(g, 'charge');
    } else if (pend.kind === 'panwind') {
      const base = Math.atan2(p.y - e.y, p.x - e.x);
      for (let i = -1; i <= 1; i++) {
        const a = base + i * 0.28;
        g.projectiles.push({
          x: e.x + Math.cos(a) * e.r, y: e.y + Math.sin(a) * e.r,
          vx: Math.cos(a) * 430, vy: Math.sin(a) * 430, r: 13,
          dmg: e.dmg * 0.55, from: 'enemy', kind: 'pan', life: 2.4, hit: {}, color: '#5A5A5A'
        });
      }
      sfx(g, 'pan');
    } else if (pend.kind === 'leapwind') {
      const R = 135;
      g.effects.push({ kind: 'target', x: pend.x, y: pend.y, r: R, life: 0.35, max: 0.35, color: '#FF7A5C' });
      addText(g, pend.x, pend.y - 30, '！', '#FF7A5C', 30);
      if (Math.hypot(p.x - pend.x, p.y - pend.y) < R + p.r) hurtPlayer(g, e.dmg * 1.0, pend.x, pend.y);
      g.shake = 14;
      g.effects.push({ kind: 'ring', x: pend.x, y: pend.y, r: 12, maxR: R * 1.5, life: 0.4, max: 0.4, color: '#FFB4A2' });
      burst(g, pend.x, pend.y, '#E8D5B7', 16, 260, 5);
      sfx(g, 'leap');
    } else if (pend.kind === 'bark') {
      g.projectiles.push({
        x: e.x, y: e.y, vx: 0, vy: 0, r: 18, dmg: e.dmg * 0.8, from: 'enemy',
        kind: 'ring', life: 0.55, hit: {}, color: '#FFC9A3', grow: 620, maxR: 280
      });
      sfx(g, 'bark');
      g.shake = 10;
    } else if (pend.kind === 'chargewind') {
      e.charge = { t: 0.5, dx: Math.cos(pend.ang), dy: Math.sin(pend.ang) };
      sfx(g, 'charge');
    }
  }

  function updateBoss(g, e, dt, d, ux, uy) {
    const p = g.player;
    e.atkCd -= dt;

    if (e.kind === 'tom') {
      const frac = e.hp / e.maxHp;
      if (e.summoned === 0 && frac < 0.66) { e.summoned = 1; summonAdds(g, e, 1); }
      if (e.summoned === 1 && frac < 0.33) { e.summoned = 2; summonAdds(g, e, 2); }
      if (e.atkCd <= 0 && d < 720) {
        e.atkCd = rand(g, 2.8, 3.6);
        if (g.rng() < 0.55) e.pending = { kind: 'panwind', t: 0.55 };
        else e.pending = { kind: 'leapwind', t: 1.0, x: p.x, y: p.y };
      } else if (d > 150) {
        e.x += ux * 100 * dt; e.y += uy * 100 * dt;
      }
      if (d < e.r + p.r && e.hitCd <= 0) { hurtPlayer(g, e.dmg, e.x, e.y); e.hitCd = 1.1; }
    } else {
      const frac = e.hp / e.maxHp;
      if (e.summoned === 0 && frac < 0.5) { e.summoned = 1; summonAdds(g, e, 2); }
      if (e.atkCd <= 0) {
        e.atkCd = rand(g, 2.4, 3.2);
        const r = g.rng();
        if (r < 0.45 && d < 640) e.pending = { kind: 'chargewind', t: 0.55, ang: Math.atan2(p.y - e.y, p.x - e.x) };
        else e.pending = { kind: 'bark', t: 0.5 };
      } else if (d > 120) {
        e.x += ux * 88 * dt; e.y += uy * 88 * dt;
      }
      if (d < e.r + p.r && e.hitCd <= 0) { hurtPlayer(g, e.dmg, e.x, e.y); e.hitCd = 1.1; }
    }
  }

  function summonAdds(g, e, n) {
    addText(g, e.x, e.y - e.r - 20, '召唤手下！', '#FFB4A2', 22);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const x = clamp(e.x + Math.cos(a) * 90, 40, g.W - 40);
      const y = clamp(e.y + Math.sin(a) * 90, 40, g.H - 40);
      const def = D.enemies.kitten;
      const scale = 1 + Math.max(0, g.wave - 1) * 0.24;
      g.enemies.push({
        id: (g._eid = (g._eid || 1) + 1), kind: 'kitten', def, x, y, vx: 0, vy: 0, r: def.radius,
        hp: Math.round(def.hp * scale), maxHp: Math.round(def.hp * scale),
        speed: def.speed, dmg: def.dmg, flash: 0, hitCd: 0, spawnT: 0.3, dead: false,
        kx: 0, ky: 0, state: 'idle', stateT: 0, atkCd: 1, charge: null, pending: null,
        summoned: 0, walk: 0, boss: false, recoil: 0
      });
    }
  }

  function updateProjectiles(g, dt) {
    const p = g.player;
    for (const pr of g.projectiles) {
      if (pr.dead) continue;
      if (pr.from === 'enemy' && !pr.scaled) {
        pr.scaled = true;
        const k = (0.5 + Math.min(0.35, (g.wave || 1) * 0.025)) * rand(g, 0.88, 1.12);
        pr.vx *= k;
        pr.vy *= k;
      }
      pr.life -= dt;
      if (pr.life <= 0) { pr.dead = true; if (pr.explodeOnDeath && pr.from === 'player') explode(g, pr.x, pr.y, pr.splash || 80, pr.dmg * 0.8); continue; }

      if (pr.kind === 'ring') {
        pr.r += (pr.grow || 500) * dt;
        if (pr.r > (pr.maxR || 260)) pr.dead = true;
        if (pr.from === 'enemy' && !pr.hit.p && Math.hypot(p.x - pr.x, p.y - pr.y) < pr.r + p.r) {
          pr.hit.p = 1; hurtPlayer(g, pr.dmg, pr.x, pr.y);
        }
        continue;
      }

      if (pr.homing && pr.from === 'player') {
        const t = nearestEnemy(g, pr.x, pr.y, 520);
        if (t) {
          const want = Math.atan2(t.y - pr.y, t.x - pr.x);
          const cur = Math.atan2(pr.vy, pr.vx);
          let da = Math.atan2(Math.sin(want - cur), Math.cos(want - cur));
          const na = cur + clamp(da, -5 * dt, 5 * dt);
          const sp = Math.hypot(pr.vx, pr.vy);
          pr.vx = Math.cos(na) * sp; pr.vy = Math.sin(na) * sp;
        }
      }

      // 障碍物
      let hitWall = false, nx = 0, ny = 0;
      for (const o of g.obstacles) {
        if (o.type === 'rect') {
          const cx = clamp(pr.x, o.x, o.x + o.w), cy = clamp(pr.y, o.y, o.y + o.h);
          const dx = pr.x - cx, dy = pr.y - cy;
          if (dx * dx + dy * dy < pr.r * pr.r) {
            hitWall = true;
            if (dx || dy) { const d = Math.hypot(dx, dy); nx = dx / d; ny = dy / d; }
            else { nx = -Math.sign(pr.vx); ny = -Math.sign(pr.vy); }
            break;
          }
        } else if (Math.hypot(pr.x - o.x, pr.y - o.y) < pr.r + o.r) {
          hitWall = true;
          const d = Math.hypot(pr.x - o.x, pr.y - o.y) || 1;
          nx = (pr.x - o.x) / d; ny = (pr.y - o.y) / d;
          break;
        }
      }
      if (hitWall) {
        if (pr.bounce > 0 && pr.from === 'player') {
          pr.bounce--;
          const dot = pr.vx * nx + pr.vy * ny;
          pr.vx -= 2 * dot * nx; pr.vy -= 2 * dot * ny;
          pr.x += nx * 4; pr.y += ny * 4;
        } else {
          pr.dead = true;
          if (pr.explodeOnDeath) explode(g, pr.x, pr.y, pr.splash || 80, pr.dmg * 0.8);
          continue;
        }
      }

      pr.x += pr.vx * dt; pr.y += pr.vy * dt;
      if (pr.x < -120 || pr.x > g.W + 120 || pr.y < -120 || pr.y > g.H + 120) { pr.dead = true; continue; }

      if (pr.from === 'player') {
        for (const e of g.enemies) {
          if (e.dead || pr.hit[e.id]) continue;
          if (Math.hypot(e.x - pr.x, e.y - pr.y) < e.r + pr.r) {
            pr.hit[e.id] = 1;
            damageEnemy(g, e, pr.dmg, pr.crit);
            const kb = pr.kind === 'rocket' ? 160 : 60;
            const a = Math.atan2(pr.vy, pr.vx);
            e.kx = Math.cos(a) * kb; e.ky = Math.sin(a) * kb;
            if (pr.explodeOnDeath) explode(g, pr.x, pr.y, pr.splash || 80, pr.dmg * 0.8);
            if (pr.bounce > 0) {
              pr.bounce--;
              const t = nearestEnemy(g, pr.x, pr.y, 340);
              if (t && !pr.hit[t.id]) {
                const a2 = Math.atan2(t.y - pr.y, t.x - pr.x);
                const sp = Math.hypot(pr.vx, pr.vy);
                pr.vx = Math.cos(a2) * sp; pr.vy = Math.sin(a2) * sp;
              }
            } else if (pr.pierce > 0) {
              pr.pierce--;
            } else {
              pr.dead = true;
            }
            break;
          }
        }
      } else {
        if (Math.hypot(p.x - pr.x, p.y - pr.y) < p.r + pr.r) {
          pr.dead = true;
          hurtPlayer(g, pr.dmg, pr.x, pr.y);
        }
      }
    }
    g.projectiles = g.projectiles.filter(x => !x.dead);
  }

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
        if (pk.kind === 'xp') { addXp(g, pk.value); sfx(g, 'xp'); }
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

  function updateEffects(g, dt) {
    g.shake = Math.max(0, g.shake - dt * 34);
    for (const t of g.texts) { t.life -= dt; t.y += t.vy * dt; t.vy *= Math.pow(0.1, dt); }
    g.texts = g.texts.filter(t => t.life > 0);
    for (const e of g.effects) e.life -= dt;
    g.effects = g.effects.filter(e => e.life > 0);
    for (const p of g.particles) {
      p.life -= dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= Math.pow(0.08, dt); p.vy *= Math.pow(0.08, dt);
    }
    g.particles = g.particles.filter(p => p.life > 0);
  }

  function director(g, dt) {
    g.elapsed += dt;
    const wave = Math.floor(g.elapsed / 25) + 1;
    if (wave !== g.wave) {
      g.wave = wave;
      g.events.push({ type: 'wave', wave });
      if (wave % 4 === 0) {
        const kind = (wave / 4) % 2 === 1 ? 'tom' : 'spike';
        spawnBossAt(g, kind, wave);
      }
    }
    g.spawnTimer -= dt * (g.boss ? 0.55 : 1);
    if (g.spawnTimer <= 0 && g.enemies.filter(e => !e.dead).length < 110) {
      const waveNow = Math.max(1, g.wave);
      g.spawnTimer = Math.max(0.28, 1.35 - waveNow * 0.10) * ((g.cov && g.cov.spawn) || 1);
      let n = waveNow <= 2 ? 1 : (1 + (g.rng() < Math.min(0.9, 0.25 + waveNow * 0.07) ? 1 : 0));
      if (waveNow >= 8 && g.rng() < 0.45) n += 1;
      const pool = ['kitten', 'kitten', 'kitten'];
      if (waveNow >= 2) pool.push('spitter');
      if (waveNow >= 3) pool.push('bruiser');
      if (waveNow >= 4) pool.push('dasher');
      if (waveNow >= 6) pool.push('bruiser', 'dasher');
      const fa = rand(g, 0, TAU);
      const fx = clamp(g.player.x + Math.cos(fa) * 700, 100, g.W - 100);
      const fy = clamp(g.player.y + Math.sin(fa) * 700, 100, g.H - 100);
      const perp = fa + Math.PI / 2;
      for (let i = 0; i < n; i++) {
        const off = (i - (n - 1) / 2) * 64;
        const kind = pick(g, pool);
        spawnEnemy(g, kind, waveNow, fx + Math.cos(perp) * off, fy + Math.sin(perp) * off);
      }
    }

    g.orbTimer = (g.orbTimer == null ? 6 : g.orbTimer) - dt;
    if (g.orbTimer <= 0) {
      g.orbTimer = 4;
      for (let i = 0; i < 3; i++) {
        let x = 0, y = 0, ok = false;
        for (let k = 0; k < 12 && !ok; k++) {
          x = rand(g, 70, g.W - 70);
          y = rand(g, 70, g.H - 70);
          ok = !inObstacle(g, x, y, 10);
        }
        if (!ok) continue;
        g.pickups.push({ kind: 'xp', x: x, y: y, vx: 0, vy: 0, r: 7, value: 2, life: 26, pull: false });
      }
    }
  }

  /* ---------------- 主更新 ---------------- */
  TJ.update = function (g, dt, input) {
    if (g.over) return;
    dt = Math.min(dt, 0.05);
    g.t += dt;
    updatePlayer(g, dt, input || {});
    updateEnemies(g, dt);
    updateProjectiles(g, dt);
    updatePickups(g, dt);
    updateEffects(g, dt);
    director(g, dt);
    g.enemies = g.enemies.filter(e => !e.dead);

    const p = g.player;
    g.cam.x += (p.x - g.cam.x) * Math.min(1, dt * 6);
    g.cam.y += (p.y - g.cam.y) * Math.min(1, dt * 6);
  };

  TJ.debugHurt = function (g, dmg) {
    if (!g) return;
    g.player.invuln = 0;
    hurtPlayer(g, dmg || 9999, g.player.x + 10, g.player.y);
  };

  TJ.updateVisuals = function (g, dt) {
    if (!g) return;
    dt = Math.min(dt, 0.05);
    updateEffects(g, dt);
    g.cam.x += (g.player.x - g.cam.x) * Math.min(1, dt * 6);
    g.cam.y += (g.player.y - g.cam.y) * Math.min(1, dt * 6);
  };

  /* ---------------- 升级 ---------------- */
  const RARITY_W = { common: 62, rare: 30, epic: 8 };
  TJ.RARITY = { common: '普通', rare: '稀有', epic: '史诗' };

  TJ.getUpgradeChoices = function (g) {
    const p = g.player;
    if ((p.level === 3 || p.level === 6) && !p.subWeapon) {
      const wids = Object.keys(D.weapons).filter(function (k) {
        return k !== p.char.weapon && (D.weapons[k].kind === 'ranged' || D.weapons[k].kind === 'orbit');
      });
      if (wids.length >= 2) {
        const picks = [];
        while (picks.length < 2 && wids.length) {
          picks.push(wids.splice(Math.floor(g.rng() * wids.length), 1)[0]);
        }
        return picks.map(function (k) {
          const w = D.weapons[k];
          return { id: 'sub_' + k, name: '副武器 · ' + w.name, desc: '自动攻击，独立冷却', icon: '副', rarity: 'epic' };
        });
      }
    }
    const counts = g.upgradeCounts;
    const wk = D.weapons[g.player.char.weapon].kind;
    const ORBIT_ONLY = { orbitN: 1, orbitR: 1 };
    const RANGED_ONLY = { multishot: 1, pierce: 1, bounce: 1, velocity: 1, explode: 1, homing: 1, crit: 1, critdmg: 1 };
    const pool = D.upgrades.filter(u => (counts[u.id] || 0) < u.max
      && !(ORBIT_ONLY[u.id] && wk !== 'orbit')
      && !(RANGED_ONLY[u.id] && wk !== 'ranged'));
    const out = [];
    const luck = 1 + g.stats.luck;
    for (let k = 0; k < 3 && pool.length; k++) {
      let total = 0;
      const ws = pool.map(u => {
        const w = RARITY_W[u.rarity] * (u.rarity === 'epic' ? luck : 1);
        total += w; return w;
      });
      let r = g.rng() * total, idx = 0;
      for (let i = 0; i < pool.length; i++) { r -= ws[i]; if (r <= 0) { idx = i; break; } }
      out.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return out;
  };

  TJ.applyUpgrade = function (g, id) {
    if (id.indexOf('sub_') === 0) {
      const w = D.weapons[id.slice(4)];
      if (!w) return null;
      g.player.subWeapon = id.slice(4);
      g.player.subCd = 0.6;
      if (g.pendingLevels > 0) g.pendingLevels--;
      g.events.push({ type: 'upgrade', id: id });
      return { name: '副武器 · ' + w.name, desc: '自动攻击', icon: '副', rarity: 'epic' };
    }
    const def = D.upgrades.find(u => u.id === id);
    if (!def) return null;
    g.upgradeCounts[id] = (g.upgradeCounts[id] || 0) + 1;
    const p = g.player;
    const before = p.maxHp;
    def.apply(g.stats, g);
    p.maxHp = p.char.hp + g.stats.maxHp;
    if (p.maxHp > before) p.hp += p.maxHp - before;
    p.shield = Math.max(p.shield, 0);
    if (g.stats.shieldMax > 0 && p.shield === 0 && p.shieldCd <= 0) p.shield = 1;
    if (g.pendingLevels > 0) g.pendingLevels--;
    g.events.push({ type: 'upgrade', id });
    return def;
  };

  // 供乱斗模式 / 未来联机复用的底层工具
  TJ.helpers = { baseStats, resolveObstacles, burst, addText, sfx, clamp, rand };
  TJ.helpers.hurtEnemy = function (g, f, e, d) { damageEnemy(g, e, d, false); };
})();
