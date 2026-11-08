/* 猫鼠大作战 — 生存系统（刷怪 / 更新 / 弹道，从 core.js 拆出） */
(function () {
  const TJ = (window.TJ = window.TJ || {});
  const D = TJ.DATA;
  const TAU = Math.PI * 2;
  const sfx = function (g, n) { TJ.Feedback.sfx(g, n); };
  const addText = function (g, x, y, t, c, s) { TJ.Feedback.addText(g, x, y, t, c, s); };
  const burst = function (g, x, y, c, n, spd, s) { TJ.Feedback.burst(g, x, y, c, n, spd, s); };
  const resolveObstacles = function () { return TJ.Feedback.resolveObstacles.apply(null, arguments); };
  const inObstacle = function () { return TJ.Feedback.inObstacle.apply(null, arguments); };
  const rand = function (g, a, b) { return TJ.helpers.rand(g, a, b); };
  const clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  const damageEnemy = function () { return TJ.Combat.damageEnemy.apply(null, arguments); };
  const killEnemy = function () { return TJ.Combat.killEnemy.apply(null, arguments); };
  const hurtPlayer = function () { return TJ.Combat.hurtPlayer.apply(null, arguments); };
  const nearestEnemy = function () { return TJ.Combat.nearestEnemy.apply(null, arguments); };
  const healPlayer = function () { return TJ.Combat.healPlayer.apply(null, arguments); };
  const explodeAt = function () { return TJ.Combat.explodeAt.apply(null, arguments); };
  const addXp = function () { return TJ.Pickups.addXp.apply(null, arguments); };
  const updatePickups = function () { return TJ.Pickups.update.apply(null, arguments); };
  const zoneOf = function () { return TJ.Missions.zoneOf.apply(null, arguments); };
  function pick(g, arr) { return arr[Math.floor(g.rng() * arr.length)]; }

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
    const late = wave > 10 ? Math.pow(1.015, wave - 10) : 1;
    const dyn = Math.max(0.85, Math.min(2.0, Math.sqrt((g.dps || 80) / 100)));
    let scale = (def.boss ? (1 + Math.max(0, wave - 1) * 0.07) : (1 + Math.max(0, wave - 1) * 0.12)) * late * dyn;
    if (!def.boss && wave >= 8 && rand(g, 0, 1) < 0.05) scale *= 1.35;
    const e = {
      id: ++g._eid || (g._eid = 1), kind, def, x, y, vx: 0, vy: 0, r: def.radius,
      hp: Math.round(def.hp * scale), maxHp: Math.round(def.hp * scale),
      speed: def.speed * (1 + Math.min(0.45, wave * 0.016)) * (wave >= 6 && wave <= 9 ? 1.08 : 1), dmg: def.dmg * Math.min(2.2, 1.85 + Math.max(0, wave - 5) * 0.04) * (1 + wave * 0.032),
      flash: 0, hitCd: 0, spawnT: 0.35, dead: false, kx: 0, ky: 0,
      armor: Math.min(0.55, (def.armor || 0) + wave * (def.boss ? 0.0035 : 0.0015)),
      state: 'idle', stateT: 0, atkCd: rand(g, 0.6, 1.6) * (wave <= 3 ? 1.2 : 1), charge: null,
      pending: null, summoned: 0, walk: rand(g, 0, TAU), boss: !!def.boss, recoil: 0
    };
    e.element = { kitten: 'light', spitter: 'ice', bruiser: 'fire', dasher: 'thunder', tom: 'dark', spike: 'light', hunter: 'dark' }[kind] || null;
    g.enemies.push(e);
    if (def.boss && !g._eliteSpawn) {
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
    p.noHealT = Math.max(0, (p.noHealT || 0) - dt);
    if (p.carry && g.holes) {
      for (const h of g.holes) {
        if (Math.hypot(p.x - h.x, p.y - h.y) < 46) {
          p.carry = false;
          g.score += 60;
          g.cheeseDelivered = (g.cheeseDelivered || 0) + 1;
          TJ.Missions.bump(g, 'carry', 1);
          addText(g, p.x, p.y - 50, '奶酪入库！', '#9CE8A8', 20);
          sfx(g, 'coin');
          break;
        }
      }
    }
    if (p.char.talent && p.char.talent.regen) healPlayer(g, p.maxHp * p.char.talent.regen * dt);
    if (g.stats.regen > 0) healPlayer(g, p.maxHp * g.stats.regen * dt);
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
    const aw = D.weapons[p.char.weapon];
    if (aw && aw.kind === 'aura') {
    p.auraT = (p.auraT || 0) - dt;
    if (p.auraT <= 0) {
      p.auraT = 0.45;
      const rad = (aw.orbitR || 88) + (st.orbitRBonus || 0);
      for (const e2 of g.enemies) {
        if (e2.dead) continue;
        if (Math.hypot(e2.x - p.x, e2.y - p.y) < rad + e2.r) damageEnemy(g, e2, aw.dmg * st.damage * (st.orbitDmgMul || 1) * 0.9, false);
      }
      g.effects.push({ kind: 'ring', x: p.x, y: p.y, r: rad, maxR: rad, life: 0.2, max: 0.2, color: aw.color || '#FFE08A' });
    }
    }
    if (ow.kind === 'deploy') {
      g.traps = g.traps || [];
      p.depCd = (p.depCd || 0) - dt;
      if (p.depCd <= 0) {
        p.depCd = ow.cd || 1.2;
        const tgt = nearestEnemy(g, p.x, p.y, 900);
        let dx = tgt ? tgt.x - p.x : Math.cos(p.facing || 0) * 200;
        let dy = tgt ? tgt.y - p.y : Math.sin(p.facing || 0) * 200;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len; dy /= len;
        if (g.traps.length >= (ow.maxActive || 4)) g.traps.shift();
        g.traps.push({ x: p.x + dx * 200, y: p.y + dy * 200, r: ow.triggerR || 46, arm: ow.armTime || 1, life: ow.duration || 12, dmg: (ow.dmg || 10) * st.damage * 2.2, boomR: ow.boomR || 90, icon: ow.iconImg, chase: ow.sub === 'mine' ? { spd: 92, moved: 0, max: 150, range: 320 } : null });
      }
      for (let i = g.traps.length - 1; i >= 0; i--) {
        const tr = g.traps[i];
        tr.arm -= dt; tr.life -= dt;
        if (tr.chase && tr.arm <= 0 && tr.chase.moved < tr.chase.max) {
          const ct = nearestEnemy(g, tr.x, tr.y, tr.chase.range);
          if (ct) {
            const cd2 = Math.hypot(ct.x - tr.x, ct.y - tr.y) || 1;
            const step = Math.min(tr.chase.spd * dt, tr.chase.max - tr.chase.moved, cd2);
            tr.x += (ct.x - tr.x) / cd2 * step; tr.y += (ct.y - tr.y) / cd2 * step;
            tr.chase.moved += step;
          }
        }
        let boom = tr.life <= 0;
        if (tr.arm <= 0) {
          for (const e2 of g.enemies) {
            if (!e2.dead && Math.hypot(e2.x - tr.x, e2.y - tr.y) < tr.r + e2.r) { boom = true; break; }
          }
        }
        if (boom) {
          for (const e2 of g.enemies) {
            if (!e2.dead && Math.hypot(e2.x - tr.x, e2.y - tr.y) < tr.boomR + e2.r) damageEnemy(g, e2, tr.dmg, false);
          }
          g.effects.push({ kind: 'ring', x: tr.x, y: tr.y, r: 8, maxR: tr.boomR, life: 0.25, max: 0.25, color: ow.color || '#FFB44D' });
          g.traps.splice(i, 1);
        }
      }
    }
    if (ow.kind === 'summon') {
      g.summons = g.summons || [];
      p.sumCd = (p.sumCd || 0) - dt;
      if (g.summons.length === 0 && p.sumCd <= 0) {
        p.sumCd = ow.cd || 12;
        g.summons.push({ x: p.x + 34, y: p.y, life: ow.duration || 8, atkCd: 0, dmg: (ow.dmg || 14) * st.damage, r: 15, spd: 150, icon: ow.iconImg, stationary: !!ow.stationary, range: ow.range || 0, size: ow.stationary ? 56 : 76, range: 96 });
        g.effects.push({ kind: 'ring', x: p.x + 34, y: p.y, r: 4, maxR: 60, life: 0.3, max: 0.3, color: '#FFD36A' });
      }
      for (let i = g.summons.length - 1; i >= 0; i--) {
        const su = g.summons[i];
        su.life -= dt;
        if (su.life <= 0) { g.summons.splice(i, 1); continue; }
        const tg = nearestEnemy(g, su.x, su.y, su.range || 96);
        if (tg) {
          const dd = Math.hypot(tg.x - su.x, tg.y - su.y) || 1;
          if (!su.stationary && dd > 42) { su.x += (tg.x - su.x) / dd * su.spd * dt; su.y += (tg.y - su.y) / dd * su.spd * dt; }
          else {
            su.atkCd -= dt;
            if (su.atkCd <= 0) { su.atkCd = 0.8; damageEnemy(g, tg, su.dmg, false); if (su.stationary) g.effects.push({ kind: 'beam', x: su.x, y: su.y, ang: Math.atan2(tg.y - su.y, tg.x - su.x), len: Math.hypot(tg.x - su.x, tg.y - su.y), life: 0.12, max: 0.12, color: '#9FE7FF' }); else g.effects.push({ kind: 'ring', x: tg.x, y: tg.y, r: 4, maxR: 22, life: 0.16, max: 0.16, color: '#FFD36A' }); }
          }
        } else {
          const pd = Math.hypot(p.x - su.x, p.y - su.y) || 1;
          if (!su.stationary && pd > 90) { su.x += (p.x - su.x) / pd * 120 * dt; su.y += (p.y - su.y) / pd * 120 * dt; }
        }
      }
    }
    if (ow.kind === 'tether') {
      p.tetT = (p.tetT || 0) - dt;
      if (p.tetT <= 0) {
        p.tetT = 0.35;
        const tt = nearestEnemy(g, p.x, p.y, 280);
        if (tt) {
          damageEnemy(g, tt, (ow.dmg || 10) * st.damage * 0.55, false);
          g.effects.push({ kind: 'ring', x: tt.x, y: tt.y, r: 6, maxR: 30, life: 0.16, max: 0.16, color: '#9CD8FF' });
        }
      }
    }
    if (ow.kind === 'orbit') {
      p.orbitA = (p.orbitA || 0) + dt * 3.4;
    p.orbitBonus = st.orbitBonus || 0; p.orbitRBonus = st.orbitRBonus || 0;
      const on = (ow.orbitN || 2) + (p.orbitBonus || 0);
      const orad = (ow.orbitR || 78) + 8 + (p.orbitRBonus || 0);
      for (const e of g.enemies) {
        if (e.dead) continue;
        e.orbitCd = Math.max(0, (e.orbitCd || 0) - dt);
        if (e.orbitCd > 0) continue;
        for (let i = 0; i < on; i++) {
          const a = p.orbitA + i * Math.PI * 2 / on;
          const ox = p.x + Math.cos(a) * orad;
          const oy = p.y + Math.sin(a) * orad;
          if (Math.hypot(e.x - ox, e.y - oy) < e.r + 16) {
            damageEnemy(g, e, ow.dmg * 1.2 * st.damage * (st.orbitDmgMul || 1), false);
            healPlayer(g, p.maxHp * 0.008);
            if (g.rng() < 0.4) sfx(g, 'hit');
            e.orbitCd = (ow.hitCd || 0.45) / (st.fireRate || 1);
            g.effects.push({ kind: 'ring', x: ox, y: oy, r: 6, maxR: 24, life: 0.18, max: 0.18, color: ow.color || '#FFE08A' });
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
            r: 8, dmg: sw.dmg * st.damage * 0.55 * (st.subDmgMul || 1), from: 'player', kind: sw.proj || 'orb',
            life: 2, hit: {}, color: sw.color || '#BFE9FF',
            splash: sw.splash || 0, explodeOnDeath: !!sw.splash, pierce: sw.pierce || 0, _sub: sw.sub, _icon: sw.iconImg
          });
          p.subCd = (sw.cd || 1) * 0.7 * (st.subCdMul || 1);
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
            damageEnemy(g, e, sw.dmg * st.damage * 0.9 * (st.subDmgMul || 1), false);
            e.subOrbitCd = g.t + 0.3;
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
      if (e.freezeT > 0) { e.freezeT -= dt; continue; }
      if (e.kind === 'spike' && !e.sons && e.hp < e.maxHp * 0.5) {
        e.sons = 1;
        for (let si = 0; si < 2; si++) {
          const son = spawnEnemy(g, 'spikejr', Math.max(1, g.wave - 3), e.x + (si ? 30 : -30), e.y + 20);
          if (son) { son.elite = true; son.hp = son.maxHp = Math.round(son.maxHp * 0.8); }
        }
        addText(g, e.x, e.y - 60, '儿子们，上！', '#FFD34D', 20);
      }
      if (e.stunT > 0) { e.stunT -= dt; continue; }
      if (e.slowT > 0) { e.slowT -= dt; if (e.slowT <= 0) e.slowMul = 1; }
      if (e.dotT > 0) {
        e.dotT -= dt; e.dotTick = (e.dotTick || 0) + dt;
        if (e.dotTick >= 0.5) {
          e.dotTick -= 0.5; e.hp -= e.dotDps * 0.5;
          if (e.hp <= 0) { killEnemy(g, e); continue; }
        }
      }

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
          e.x += ux * dir * ((e.boss ? e.speed : e.def.speed) * (e.slowMul || 1)) * dt;
          e.y += uy * dir * ((e.boss ? e.speed : e.def.speed) * (e.slowMul || 1)) * dt;
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
        case 'bomber': {
          if (d < 170) {
            e.fuseT = (e.fuseT == null ? 2 : e.fuseT) - dt;
            if (e.fuseT <= 0) { e.exploded = true; explodeAt(g, e.x, e.y, 150, 40 + g.wave * 4, e); e.dead = true; continue; }
          } else if (e.fuseT != null) e.fuseT = 2;
          e.x += ux * ((e.boss ? e.speed : e.def.speed) * (e.slowMul || 1)) * dt; e.y += uy * ((e.boss ? e.speed : e.def.speed) * (e.slowMul || 1)) * dt;
          break;
        }
        case 'hunter': {
          e.atkCd -= dt;
          if (d < 900 && e.atkCd <= 0) {
            e.atkCd = 2.4;
            const ha = Math.atan2(dy, dx);
            g.projectiles.push({
              x: e.x, y: e.y, vx: Math.cos(ha) * 520, vy: Math.sin(ha) * 520,
              r: 9, dmg: e.dmg * 0.9, from: 'enemy', kind: 'fishbone',
              pierce: true, life: 3, hit: {}, color: '#C9A0FF'
            });
            sfx(g, 'eshoot');
          }
          const keep = 260;
          if (d > keep) { e.x += ux * ((e.boss ? e.speed : e.def.speed) * (e.slowMul || 1)) * dt; e.y += uy * ((e.boss ? e.speed : e.def.speed) * (e.slowMul || 1)) * dt; }
          else { e.x -= ux * ((e.boss ? e.speed : e.def.speed) * (e.slowMul || 1)) * 0.4 * dt; e.y -= uy * ((e.boss ? e.speed : e.def.speed) * (e.slowMul || 1)) * 0.4 * dt; }
          break;
        }
        case 'dasher': {
          e.atkCd -= dt;
          if (e.atkCd <= 0 && d < 460) {
            e.pending = { kind: 'wind', t: 0.5, ang: Math.atan2(dy, dx) };
            e.atkCd = 2.2;
          } else {
            e.x += ux * ((e.boss ? e.speed : e.def.speed) * (e.slowMul || 1)) * 0.55 * dt;
            e.y += uy * ((e.boss ? e.speed : e.def.speed) * (e.slowMul || 1)) * 0.55 * dt;
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
            e.x += ux * ((e.boss ? e.speed : e.def.speed) * (e.slowMul || 1)) * dt;
            e.y += uy * ((e.boss ? e.speed : e.def.speed) * (e.slowMul || 1)) * dt;
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
    if (e.kind === 'qianchang') {
      const qf = e.hp / e.maxHp;
      if (!e.summoned && qf < 0.66) { e.summoned = 1; summonAdds(g, e, 2); addText(g, e.x, e.y - 70, '音符随从！', '#FFD34D', 20); }
      if (e.summoned === 1 && qf < 0.33) { e.summoned = 2; summonAdds(g, e, 3); }
      e.noteCd = (e.noteCd == null ? 4 : e.noteCd) - dt;
      if (e.noteCd <= 0) {
        e.noteCd = 4.2;
        const an = Math.atan2(p.y - e.y, p.x - e.x);
        for (let i = -1; i <= 1; i++) {
          const aa = an + i * 0.22;
          g.projectiles.push({ x: e.x, y: e.y, vx: Math.cos(aa) * 260, vy: Math.sin(aa) * 260, r: 8, dmg: e.dmg * 0.6, from: 'enemy', kind: 'orb', life: 2.2, hit: {}, color: '#FFD34D' });
        }
      }
      if (e.atkCd <= 0) {
        e.atkCd = 3.4;
        g.projectiles.push({ x: e.x, y: e.y, vx: 0, vy: 0, r: 24, grow: 380, maxR: 300, dmg: e.dmg * 0.9, from: 'enemy', kind: 'ring', life: 1.1, hit: {} });
        addText(g, e.x, e.y - 60, '人才能量！', '#FFD34D', 20);
        g.shake = Math.max(g.shake || 0, 8);
      }
      if (d > 120) { e.x += ux * e.speed * dt; e.y += uy * e.speed * dt; }
      return;
    }
    if (e.kind === 'angryqc') {
      if (!e.enraged && e.hp / e.maxHp < 0.5) { e.enraged = true; e.speed *= 1.35; addText(g, e.x, e.y - 70, '彻底不甘心！', '#FF4B3A', 22); }
      e.burnCd = (e.burnCd == null ? 2 : e.burnCd) - dt;
      if (e.burnCd <= 0) { e.burnCd = 2.4; g.projectiles.push({ x: e.x, y: e.y, vx: 0, vy: 0, r: 18, grow: 120, maxR: 96, dmg: e.dmg * 0.45, from: 'enemy', kind: 'ring', life: 1.0, hit: {} }); }
      if (e.atkCd <= 0 && d > 90) { e.atkCd = 3.0; e.charge = { dx: ux, dy: uy, t: 0.55 }; addText(g, e.x, e.y - 60, '不甘心！', '#FF7A5C', 20); }
      if (d > 220) { e.x += ux * e.speed * dt; e.y += uy * e.speed * dt; }
      return;
    }
    if (e.kind === 'chenjr') {
      e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.004 * dt);
      e.sproutCd = (e.sproutCd == null ? 3 : e.sproutCd) - dt;
      if (e.sproutCd <= 0) {
        e.sproutCd = 5.5;
        for (let i = 0; i < 3; i++) {
          const aa = g.rng() * Math.PI * 2, rr = 70 + g.rng() * 90;
          g.projectiles.push({ x: e.x + Math.cos(aa) * rr, y: e.y + Math.sin(aa) * rr, vx: 0, vy: 0, r: 14, grow: 0, maxR: 40, dmg: e.dmg * 0.4, from: 'enemy', kind: 'ring', life: 3.0, hit: {}, color: '#8FBF6A' });
        }
      }
      if (e.atkCd <= 0) {
        e.atkCd = 3.6;
        if (d < 300) { p.rootT = Math.max(p.rootT || 0, 1.1); addText(g, p.x, p.y - 50, '根须缠绕！', '#8FBF6A', 18); }
        g.projectiles.push({ x: e.x, y: e.y, vx: 0, vy: 0, r: 20, grow: 300, maxR: 220, dmg: e.dmg * 0.8, from: 'enemy', kind: 'ring', life: 0.9, hit: {} });
        g.shake = Math.max(g.shake || 0, 6);
      }
      if (d > 150) { e.x += ux * e.speed * dt; e.y += uy * e.speed * dt; }
      return;
    }
    if (e.kind === 'bigboss') {
      e.qkT = (e.qkT == null ? 4 : e.qkT) - dt;
      if (e.qkT <= 0) {
        e.qkT = 6;
        g.effects.push({ kind: 'ring', x: e.x, y: e.y, r: 30, maxR: 300, life: 0.5, max: 0.5, color: '#FF9A5C' });
        addText(g, e.x, e.y - 90, '地震！', '#FF7A5C', 26);
        if (d < 300) hurtPlayer(g, e.dmg * 0.9, e.x, e.y);
        g.shake = Math.max(g.shake || 0, 12);
        sfx(g, 'boss');
      }
      e.chT = (e.chT == null ? 5 : e.chT) - dt;
      if (e.chT <= 0 && d > 140) {
        e.chT = 5;
        e.kx = ux * 560; e.ky = uy * 560;
        addText(g, e.x, e.y - 70, '冲撞！', '#FFB44D', 24);
        sfx(g, 'charge');
      }
    }

    if (e.kind === 'kunkun') {
      e.dashCd = (e.dashCd == null ? 3 : e.dashCd) - dt;
      if (e.dashCd <= 0 && d > 90) { e.dashCd = 3.2; e.charge = { dx: ux, dy: uy, t: 0.5 }; addText(g, e.x, e.y - 60, '坤坤冲刺！', '#FFD34D', 20); }
      e.featCd = (e.featCd == null ? 4 : e.featCd) - dt;
      if (e.featCd <= 0) {
        e.featCd = 4.5;
        for (let i = 0; i < 6; i++) {
          const aa = i / 6 * Math.PI * 2;
          g.projectiles.push({ x: e.x, y: e.y, vx: Math.cos(aa) * 220, vy: Math.sin(aa) * 220, r: 7, dmg: e.dmg * 0.5, from: 'enemy', kind: 'orb', life: 2.0, hit: {}, color: '#FFD34D' });
        }
      }
      if (d > 200) { e.x += ux * e.speed * dt; e.y += uy * e.speed * dt; }
      return;
    }
    if (e.kind === 'cthulhu') {
      e.tentCd = (e.tentCd == null ? 3.5 : e.tentCd) - dt;
      if (e.tentCd <= 0) { e.tentCd = 3.6; g.projectiles.push({ x: e.x, y: e.y, vx: 0, vy: 0, r: 22, grow: 300, maxR: 240, dmg: e.dmg * 0.8, from: 'enemy', kind: 'ring', life: 1.0, hit: {} }); addText(g, e.x, e.y - 60, '触手拍击！', '#9CD8FF', 20); }
      e.mindCd = (e.mindCd == null ? 9 : e.mindCd) - dt;
      if (e.mindCd <= 0) { e.mindCd = 9; p.reverseT = 1.4; addText(g, p.x, p.y - 50, '精神污染！', '#B9A7FF', 20); }
      if (!e.summoned && e.hp / e.maxHp < 0.66) { e.summoned = 1; summonAdds(g, e, 2); }
      if (d > 220) { e.x += ux * e.speed * dt; e.y += uy * e.speed * dt; }
      return;
    }
    if (e.kind === 'giant') {
      e.smashCd = (e.smashCd == null ? 4 : e.smashCd) - dt;
      if (e.smashCd <= 0) { e.smashCd = 4.2; g.projectiles.push({ x: e.x, y: e.y, vx: 0, vy: 0, r: 26, grow: 340, maxR: 220, dmg: e.dmg * 1.1, from: 'enemy', kind: 'ring', life: 0.9, hit: {} }); addText(g, e.x, e.y - 80, '砸地！', '#FF9A5C', 22); g.shake = Math.max(g.shake || 0, 10); }
      e.carCd = (e.carCd == null ? 5 : e.carCd) - dt;
      if (e.carCd <= 0) {
        e.carCd = 5.5;
        const an = Math.atan2(p.y - e.y, p.x - e.x);
        for (let i = -1; i <= 1; i++) {
          const aa = an + i * 0.2;
          g.projectiles.push({ x: e.x, y: e.y, vx: Math.cos(aa) * 240, vy: Math.sin(aa) * 240, r: 10, dmg: e.dmg * 0.6, from: 'enemy', kind: 'orb', life: 2.4, hit: {}, color: '#FF8A3D' });
        }
      }
      if (d > 140) { e.x += ux * e.speed * 0.8 * dt; e.y += uy * e.speed * 0.8 * dt; }
      return;
    }
    if (e.kind === 'tom') {
      const frac = e.hp / e.maxHp;
      if (e.summoned === 0 && frac < 0.66) { e.summoned = 1; summonAdds(g, e, 1); }
      if (e.summoned === 1 && frac < 0.33) { e.summoned = 2; summonAdds(g, e, 2); }
      if (e.atkCd <= 0 && d < 720) {
        e.atkCd = rand(g, 2.8, 3.6);
        if (g.rng() < 0.55) e.pending = { kind: 'panwind', t: 0.55 };
        else e.pending = { kind: 'leapwind', t: 1.0, x: p.x, y: p.y };
      } else if (d > 150) {
        e.x += ux * e.speed * 0.9 * dt; e.y += uy * e.speed * 0.9 * dt;
      }
      if (d < e.r + p.r && e.hitCd <= 0) { hurtPlayer(g, e.dmg, e.x, e.y, e.kind === 'hunter'); e.hitCd = 1.1; }
    } else {
      const frac = e.hp / e.maxHp;
      if (e.summoned === 0 && frac < 0.5) { e.summoned = 1; summonAdds(g, e, 2); }
      if (e.atkCd <= 0) {
        e.atkCd = rand(g, 2.4, 3.2);
        const r = g.rng();
        if (r < 0.45 && d < 640) e.pending = { kind: 'chargewind', t: 0.55, ang: Math.atan2(p.y - e.y, p.x - e.x) };
        else e.pending = { kind: 'bark', t: 0.5 };
      } else if (d > 120) {
        e.x += ux * e.speed * 0.9 * dt; e.y += uy * e.speed * 0.9 * dt;
      }
      if (d < e.r + p.r && e.hitCd <= 0) { hurtPlayer(g, e.dmg, e.x, e.y, e.kind === 'hunter'); e.hitCd = 1.1; }
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
      if (pr.from === 'player' && !pr._sub) { const w0 = D.weapons[p.char.weapon] || {}; pr._sub = w0.sub; pr._icon = w0.iconImg; }
      if (pr.from === 'enemy' && !pr.scaled) {
        pr.scaled = true;
        const k = (0.5 + Math.min(0.35, (g.wave || 1) * 0.025)) * rand(g, 0.88, 1.12);
        pr.vx *= k;
        pr.vy *= k;
      }
      pr.life -= dt;
      if (pr.life <= 0) { pr.dead = true; if (pr.explodeOnDeath && pr.from === 'player') explode(g, pr.x, pr.y, pr.splash || 80, pr.dmg * 0.8); continue; }
      // melee cancel: orbit weapons destroy incoming bullets near the player
      if (pr.from === 'enemy' && pr.kind !== 'ring') {
        const mw = D.weapons[p.char.weapon];
        if (mw && mw.kind === 'orbit') {
          const mr = (mw.orbitR || 78) + 10 + (p.orbitRBonus || 0);
          if (Math.hypot(pr.x - p.x, pr.y - p.y) < mr + 22) {
            pr.dead = true;
            g.effects.push({ kind: 'ring', x: pr.x, y: pr.y, r: 3, maxR: 26, life: 0.16, max: 0.16, color: '#FFE08A' });
            if (g.rng() < 0.3) sfx(g, 'hit');
            continue;
          }
        }
      }

      if (pr.kind === 'ring') {
        pr.r += (pr.grow || 500) * dt;
        if (pr.r > (pr.maxR || 260)) pr.dead = true;
        if (pr.from === 'enemy' && !pr.hit.p && Math.hypot(p.x - pr.x, p.y - pr.y) < pr.r + p.r) {
          pr.hit.p = 1; hurtPlayer(g, pr.dmg, pr.x, pr.y, pr.pierce);
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
    const instant = (g.dmgDealt || 0) / Math.max(1, g.elapsed);
    g.dps = (g.dps == null ? instant : g.dps * 0.99 + instant * 0.01);
    if (g.missionTimer > 0) {
      g.missionTimer -= dt;
      if (g.missionTimer <= 0) {
        const tm = g.missions[g.missionIdx];
        if (tm && tm.id === 'timed' && !tm.done) {
          tm.active = false;
          addText(g, g.player.x, g.player.y - 60, '任务超时', '#FF7A5C', 22);
          if (g.missions[g.missionIdx + 1]) { g.missionIdx++; g.missions[g.missionIdx].active = true; if (g.missions[g.missionIdx].id === 'timed') g.missionTimer = 60; }
        }
      }
    }
    g.pressure = Math.max(0, (g.pressure || 0) - dt * 0.5);
    g.pressure = Math.min(100, g.pressure);
    const wave = Math.floor(g.elapsed / 25) + 1;
    if (wave !== g.wave) {
      g.wave = wave;
    TJ.Missions.bump(g, 'wave', wave);
    const nh = g.missions && g.missions[g.missionIdx];
    if (nh && nh.id === 'nohit' && !nh.done) {
      if (!g.hitTaken) TJ.Missions.bump(g, 'nohit', 1); else nh.cur = 0;
      g.hitTaken = false;
    }
      g.events.push({ type: 'wave', wave });
      const BOSS_SCHED = { 3: ['kunkun'], 6: ['cthulhu'], 9: ['giant'], 12: ['qianchang'], 15: ['angryqc'], 18: ['chenjr'] };
      const NEW_BOSS = ['qianchang', 'angryqc', 'chenjr'];
      
      const BOSS_NAME = { kunkun: '坤坤杰瑞', cthulhu: '克苏鲁杰瑞', giant: '巨人僵尸', tom: '汤姆', spike: '史派克', bigboss: '鼠王', qianchang: '浅唱', angryqc: '不甘心的浅唱', chenjr: '陈佳嵘' };
      let bossList = BOSS_SCHED[wave] || (wave >= 21 ? NEW_BOSS.slice() : null);
      if (bossList) {
        bossList.forEach(function (kind, bi) {
          const ang = (bi / bossList.length) * Math.PI * 2;
          const bx = clamp(g.W / 2 + Math.cos(ang) * (bossList.length > 1 ? 220 : 0), 160, g.W - 160);
          const by = clamp(g.H / 2 + Math.sin(ang) * (bossList.length > 1 ? 220 : 0), 160, g.H - 160);
          const bb = spawnEnemy(g, kind, wave, bx, by);
          if (bb) { bb.boss = true; g.boss = g.boss || bb; addText(g, bx, by - 80, (BOSS_NAME[kind] || 'BOSS') + ' 降临！', '#FF7A5C', 28); }
        });
        g.shake = 16;
      }
      const ELITE_UNLOCK = [['spikejr',1],['security',1],['cowhead',3],['spike',5],['tom',8],['bigboss',11],['kunkun',12],['cthulhu',13],['giant',14]];
      const avail = ELITE_UNLOCK.filter(function (x) { return wave >= x[1]; });
      const ecount = wave >= 15 ? 3 : (wave >= 4 ? 2 : 1);
      for (let ei = 0; ei < ecount; ei++) {
        const pickE = avail[Math.floor(g.rng() * avail.length)][0];
        const ea2 = g.rng() * Math.PI * 2;
        const ex2 = clamp(g.player.x + Math.cos(ea2) * (300 + g.rng() * 220), 120, g.W - 120);
        const ey2 = clamp(g.player.y + Math.sin(ea2) * (300 + g.rng() * 220), 120, g.H - 120);
        g._eliteSpawn = true;
        const el = spawnEnemy(g, pickE, Math.max(1, wave - 2), ex2, ey2);
        g._eliteSpawn = false;
        if (el) {
          el.elite = true; el.boss = false;
          el.maxHp = Math.round(el.maxHp * (wave <= 3 ? 0.3 : (ei > 0 ? 0.38 : 0.5)));
          el.hp = el.maxHp;
          el.armor = Math.min(0.45, (el.armor || 0) + 0.02);
          el.mod = ['shield', 'swift', 'split'][Math.floor(g.rng() * 3)];
        }
      }
      }
    g.spawnTimer -= dt * (g.boss ? 0.55 : 1);
    for (const e of g.enemies) {
      if (!e.dead && Math.hypot(e.x - g.player.x, e.y - g.player.y) > 1400) e.dead = true;
    }
    if (g.spawnTimer <= 0 && g.enemies.filter(e => !e.dead).length < 130) {
      const waveNow = Math.max(1, g.wave);
      const pMul = g.pressure > 75 ? 0.7 : (g.pressure > 40 ? 0.85 : 1);
      const base = Math.max(0.28, 1.35 - waveNow * 0.10);
      g.spawnTimer = Math.max(0.28, Math.min(1.4, base * ((g.cov && g.cov.spawn) || 1) * pMul * (waveNow >= 3 && waveNow <= 5 ? 0.92 : 1)));
      let n = waveNow <= 2 ? 1 : (1 + (g.rng() < Math.min(0.9, 0.25 + waveNow * 0.07) ? 1 : 0));
      if (waveNow >= 8 && g.rng() < 0.45) n += 1;
      const pool = ['kitten', 'kitten', 'kitten'];
      if (waveNow >= 2) pool.push('spitter');
      if (waveNow >= 3) pool.push('bruiser');
      if (waveNow >= 4) pool.push('dasher');
      if (waveNow >= 6) pool.push('bruiser', 'dasher');
      if (waveNow >= 10) pool.push('hunter');
      if (waveNow >= 5) pool.push('bomber');
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

    g.cheeseT -= dt;
    if (g.cheeseT <= 0) {
      g.cheeseT = 7;
      if (g.pickups.filter(function (q) { return q.kind === 'cheese'; }).length < 4) {
        let cx = 0, cy = 0, okc = false;
        for (let k = 0; k < 12 && !okc; k++) {
          cx = rand(g, 120, g.W - 120); cy = rand(g, 120, g.H - 120);
          okc = !inObstacle(g, cx, cy, 14);
        }
        if (okc) g.pickups.push({ kind: 'cheese', x: cx, y: cy, vx: 0, vy: 0, r: 10, life: 999, pull: false });
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
        const inKitchen = TJ.Missions.zoneOf(g, g.player.x, g.player.y) === 'kitchen';
        g.pickups.push({ kind: 'xp', x: x, y: y, vx: 0, vy: 0, r: 7, value: inKitchen ? 3 : 2, life: 26, pull: false });
      }
    }

    // 风筝惩罚：第 10 波后长时间远离战斗会被围猎
    if (g.wave >= 10 && g.enemies.length) {
      let nd = Infinity;
      for (const e of g.enemies) {
        if (e.dead) continue;
        const dd = Math.hypot(e.x - g.player.x, e.y - g.player.y);
        if (dd < nd) nd = dd;
      }
      if (nd > 280) g.kiteT = (g.kiteT || 0) + dt;
      else g.kiteT = Math.max(0, (g.kiteT || 0) - dt * 2);
      if (g.kiteT > 2.5) {
        if (!g.kiteWarned) { g.kiteWarned = 1; addText(g, g.player.x, g.player.y - 60, '围猎！', '#FF7A5C', 26); }
        g.kiteShot = (g.kiteShot || 0) - dt;
        if (g.kiteShot <= 0) {
          g.kiteShot = 0.9;
          const side = Math.floor(g.rng() * 4);
          let sx = 60, sy = 60;
          if (side === 0) { sx = rand(g, 60, g.W - 60); sy = 50; }
          else if (side === 1) { sx = g.W - 50; sy = rand(g, 60, g.H - 60); }
          else if (side === 2) { sx = rand(g, 60, g.W - 60); sy = g.H - 50; }
          else { sx = 50; sy = rand(g, 60, g.H - 60); }
          const aa = Math.atan2(g.player.y - sy, g.player.x - sx);
          for (const off of [-0.18, 0, 0.18]) {
            g.projectiles.push({
              x: sx, y: sy, vx: Math.cos(aa + off) * 420, vy: Math.sin(aa + off) * 420,
              r: 8, dmg: 18 + g.wave * 1.0, from: 'enemy', kind: 'fishbone',
              life: 4, hit: {}, color: '#FFB4A2'
            });
          }
        }
      } else if (g.kiteT <= 0) { g.kiteWarned = 0; }
    }

    const em = g.missions && g.missions[g.missionIdx];
    if (em && em.id === 'escort' && !em.done) {
      if (!g.escort) g.escort = { x: g.player.x + 70, y: g.player.y, r: 12, hole: g.holes[0] };
      const esc = g.escort;
      let hd = g.holes[0];
      for (const h of g.holes) if (Math.hypot(h.x - esc.x, h.y - esc.y) < Math.hypot(hd.x - esc.x, hd.y - esc.y)) hd = h;
      esc.hole = hd;
      const d = Math.hypot(hd.x - esc.x, hd.y - esc.y);
      const near = Math.hypot(g.player.x - esc.x, g.player.y - esc.y) < 320;
      if (d <= 34) { TJ.Missions.bump(g, 'escort', 1); g.escort = null; }
      else if (near) { esc.x += (hd.x - esc.x) / d * 80 * dt; esc.y += (hd.y - esc.y) / d * 80 * dt; }
    }

    // 后期围城：无论远近，持续从边缘压制
    if (g.wave >= 10) {
      g.siegeT = (g.siegeT == null ? 6 : g.siegeT) - dt;
      if (g.siegeT <= 0) {
        g.siegeT = 6;
        const side = Math.floor(g.rng() * 4);
        let sx = 60, sy = 60;
        if (side === 0) { sx = rand(g, 60, g.W - 60); sy = 50; }
        else if (side === 1) { sx = g.W - 50; sy = rand(g, 60, g.H - 60); }
        else if (side === 2) { sx = rand(g, 60, g.W - 60); sy = g.H - 50; }
        else { sx = 50; sy = rand(g, 60, g.H - 60); }
        const aa = Math.atan2(g.player.y - sy, g.player.x - sx);
        for (const off of [-0.22, 0, 0.22]) {
          g.projectiles.push({
            x: sx, y: sy, vx: Math.cos(aa + off) * 380, vy: Math.sin(aa + off) * 380,
            r: 9, dmg: 15 + g.wave * 1.2, from: 'enemy', kind: 'fishbone',
            life: 5, hit: {}, color: '#FF7A5C'
          });
        }
      }
    }
  }

  /* ---------------- 主更新 ---------------- */
  TJ.update = function (g, dt, input) {
    if (TJ.Missions && TJ.Missions.tick) TJ.Missions.tick(g, dt);
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
  TJ.RARITY = { common: '普通', rare: '稀有', epic: '史诗' };

  const ELEM_TAG = { fire: '爆发 · 暴击', ice: '控制 · 冻结', thunder: '连锁 · 范围', light: '回复 · 净化', dark: '易伤 · 削弱' };
  const FUSE_TXT = {
    'fire+fire': '30% 概率双倍伤害',
    'ice+ice': '冻结 0.8 秒',
    'thunder+thunder': '150 范围连锁 12',
    'light+light': '回复 2% 生命',
    'dark+dark': '易伤 3 秒（+10% 受伤）',
    'fire+ice': '本次伤害 ×1.6',
    'ice+thunder': '170 范围追加 18',
    'dark+light': '回复 12% 生命',
    'fire+thunder': '90 范围溅射 30%',
    'dark+ice': '减速 2.5 秒，伤害 ×1.1',
    'fire+light': '回复 10% 生命',
    'dark+fire': '30% 概率双倍伤害',
    'ice+light': '冻结 0.8 秒',
    'light+thunder': '150 范围连锁 14',
    'dark+thunder': '持续伤害 3 秒'
  };

  TJ.Core = TJ.Core || {};
  TJ.Core.spawnEnemy = spawnEnemy;
  TJ.Systems = { ELEM_TAG: ELEM_TAG, FUSE_TXT: FUSE_TXT, fire: fire, updatePlayer: updatePlayer, updateEnemies: updateEnemies, updateProjectiles: updateProjectiles, updateEffects: updateEffects, director: director, spawnEnemy: spawnEnemy, explode: explode };
})();
