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
  const RES_NAME = { ranged: '箭雨', orbit: '刃暴', aura: '灼域', beam: '光矛', chain: '链爆', deploy: '雷区', summon: '援护', tether: '引力锁链' };
  const SIGNATURES = [
    { id: 'frost', name: '霜缚', color: '#9FE7FF', desc: '共鸣额外减速 2 秒' },
    { id: 'flame', name: '烈焰', color: '#FF9A5C', desc: '共鸣伤害 +25%' },
    { id: 'quake', name: '震荡', color: '#FFD34D', desc: '共鸣额外击退' },
    { id: 'drain', name: '汲取', color: '#7BE495', desc: '共鸣回复 6% 生命' },
    { id: 'aegis', name: '圣盾', color: '#FFE08A', desc: '共鸣获得 0.9 秒无敌' },
    { id: 'wind', name: '疾风', color: '#9FE7FF', desc: '共鸣获得 1.8 秒加速' },
    { id: 'thunder', name: '雷殛', color: '#C9A7FF', desc: '共鸣追加 0.45 秒眩晕' },
    { id: 'domain', name: '扩域', color: '#FFB4A2', desc: '共鸣追加一圈余波' }
  ];
  function signatureFor(id) {
    var h = 0;
    for (var i = 0; i < String(id || '').length; i++) h = (h * 31 + String(id).charCodeAt(i)) % 9973;
    return SIGNATURES[h % SIGNATURES.length];
  }
  const RES_COLOR = { ranged: '#FFE08A', orbit: '#BFE9FF', aura: '#FFB44D', beam: '#FFF2A8', chain: '#C9A7FF', deploy: '#FF9A5C', summon: '#9FE7FF', tether: '#9CD8FF' };

  function weaponResonance(g, f, sk, ang) {
    const wid = (f.weapon || (f.char && f.char.weapon));
    const w = TJ.DATA.weapons[wid];
    if (!w) return null;
    const kind = w.kind;
    const sig = signatureFor(f.char && f.char.id);
    const dmg = (sk.dmg || 40) * 0.6 * (sig.id === 'flame' ? 1.25 : 1);
    g.effects.push({ kind: 'flash', color: RES_COLOR[kind] || '#FFF6E0', life: 0.16, max: 0.16 });
    const RB = TJ.helpers;
    RB.burst(g, f.x, f.y, RES_COLOR[kind] || '#FFE08A', 10, 200, 3);
    const list = targets(g, f);
    let hitCount = 0;
    if (kind === 'ranged') {
      const n = 7, range = 520;
      for (let i = 0; i < n; i++) {
        const a = ang + (i - (n - 1) / 2) * 0.16;
        const dx = Math.cos(a), dy = Math.sin(a);
        for (const t of list) {
          const ex = t.x - f.x, ey = t.y - f.y;
          const tp = ex * dx + ey * dy;
          if (tp < 0 || tp > range) continue;
          if (Math.hypot(ex - dx * tp, ey - dy * tp) <= 20 + t.r) { hurt(g, f, t, dmg * 0.7); hitCount++; break; }
        }
        g.effects.push({ kind: 'beam', x: f.x, y: f.y, ang: a, len: 460, life: 0.2, max: 0.2, color: '#FFE08A' });
        g.effects.push({ kind: 'spark', x: f.x + Math.cos(a) * 30, y: f.y + Math.sin(a) * 30, n: 5, r0: 4, r1: 26, color: '#FFE08A', life: 0.18, max: 0.18, rot: a });
      }
    } else if (kind === 'beam') {
      for (let i = -1; i <= 1; i++) {
        const a = ang + i * 0.24;
        const dx = Math.cos(a), dy = Math.sin(a);
        for (const t of list) {
          const ex = t.x - f.x, ey = t.y - f.y;
          const tp = ex * dx + ey * dy;
          if (tp < 0 || tp > 560) continue;
          if (Math.hypot(ex - dx * tp, ey - dy * tp) <= 34 + t.r) { hurt(g, f, t, dmg); hitCount++; }
        }
        g.effects.push({ kind: 'beam', x: f.x, y: f.y, ang: a, len: 600, life: 0.24, max: 0.24, color: '#FFF2A8' });
        g.effects.push({ kind: 'spark', x: f.x + Math.cos(a) * 60, y: f.y + Math.sin(a) * 60, n: 8, r0: 6, r1: 42, color: '#FFF2A8', life: 0.22, max: 0.22, rot: a });
      }
    } else if (kind === 'chain') {
      let cur = null, best = 1e9;
      for (const t of list) { const dd = Math.hypot(t.x - f.x, t.y - f.y); if (dd < best && dd < 420) { best = dd; cur = t; } }
      const pts = [{ x: f.x, y: f.y }];
      for (let i = 0; i < 5 && cur; i++) {
        pts.push({ x: cur.x, y: cur.y }); hurt(g, f, cur, dmg * (1 - i * 0.1)); hitCount++;
        const prev = cur; cur = null; best = 1e9;
        for (const t of list) { if (t === prev) continue; const dd = Math.hypot(t.x - prev.x, t.y - prev.y); if (dd < best && dd < 280) { best = dd; cur = t; } }
      }
      if (pts.length > 1) {
        g.effects.push({ kind: 'chain', pts: pts, life: 0.3, max: 0.3, color: '#C9A7FF' });
        for (var pi = 1; pi < pts.length; pi++) g.effects.push({ kind: 'spark', x: pts[pi].x, y: pts[pi].y, n: 7, r0: 4, r1: 30, color: '#C9A7FF', life: 0.2, max: 0.2 });
      }
    } else if (kind === 'orbit') {
      for (const t of list) {
        if (Math.hypot(t.x - f.x, t.y - f.y) <= 190 + t.r) { hurt(g, f, t, dmg * 1.1); const a = Math.atan2(t.y - f.y, t.x - f.x); t.kx = (t.kx || 0) + Math.cos(a) * 220; t.ky = (t.ky || 0) + Math.sin(a) * 220; hitCount++; }
      }
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 20, maxR: 210, life: 0.34, max: 0.34, color: '#BFE9FF' });
      for (var si = 0; si < 4; si++) g.effects.push({ kind: 'slash', x: f.x, y: f.y, ang: si * Math.PI / 2 + (Date.now() % 628) / 100, range: 165, arc: 1.2, life: 0.24, max: 0.24 });
      g.effects.push({ kind: 'spark', x: f.x, y: f.y, n: 12, r0: 10, r1: 120, color: '#BFE9FF', life: 0.24, max: 0.24 });
    } else if (kind === 'aura') {
      for (const t of list) {
        if (Math.hypot(t.x - f.x, t.y - f.y) <= 220 + t.r) { hurt(g, f, t, dmg * 0.9); t.slowT = Math.max(t.slowT || 0, 1.6); hitCount++; }
      }
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 30, maxR: 240, life: 0.4, max: 0.4, color: '#FFB44D' });
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 20, maxR: 160, life: 0.3, max: 0.3, color: '#FF9A5C' });
      g.effects.push({ kind: 'tex', src: 'assets/fx/kenney/flame_03.png', x: f.x, y: f.y, life: 0.4, max: 0.4, s0: 40, s1: 190, alpha: 0.6 });
      g.effects.push({ kind: 'spark', x: f.x, y: f.y, n: 14, r0: 12, r1: 150, color: '#FFB44D', life: 0.3, max: 0.3 });
    } else if (kind === 'deploy') {
      let placed = 0;
      for (const t of list) {
        if (placed >= 3) break;
        g.effects.push({ kind: 'ring', x: t.x, y: t.y, r: 10, maxR: 110, life: 0.32, max: 0.32, color: '#FF9A5C' });
        g.effects.push({ kind: 'tex', src: 'assets/fx/kenney/flame_03.png', x: t.x, y: t.y, life: 0.32, max: 0.32, s0: 20, s1: 110, alpha: 0.8 });
        g.effects.push({ kind: 'spark', x: t.x, y: t.y, n: 9, r0: 6, r1: 60, color: '#FFD34D', life: 0.24, max: 0.24 });
        for (const o of list) if (Math.hypot(o.x - t.x, o.y - t.y) <= 96 + o.r) hurt(g, f, o, dmg * 0.8);
        placed++; hitCount++;
      }
    } else if (kind === 'summon') {
      let n2 = 0;
      for (const t of list) {
        if (n2 >= 2) break;
        hurt(g, f, t, dmg * 1.2); n2++; hitCount++;
        g.effects.push({ kind: 'ring', x: t.x, y: t.y, r: 5, maxR: 40, life: 0.2, max: 0.2, color: '#9FE7FF' });
        g.effects.push({ kind: 'tex', src: 'assets/fx/kenney/magic_03.png', x: t.x, y: t.y, life: 0.3, max: 0.3, s0: 16, s1: 70, alpha: 0.7 });
      }
      f.hp = Math.min(f.maxHp, f.hp + f.maxHp * 0.06);
    } else if (kind === 'tether') {
      for (const t of list) {
        const dd = Math.hypot(t.x - f.x, t.y - f.y);
        if (dd <= 300) {
          const a = Math.atan2(f.y - t.y, f.x - t.x);
          t.x += Math.cos(a) * 80; t.y += Math.sin(a) * 80;
          hurt(g, f, t, dmg * 0.8); hitCount++;
        }
      }
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 30, maxR: 320, life: 0.36, max: 0.36, color: '#9CD8FF' });
      g.effects.push({ kind: 'chain', pts: [{ x: f.x, y: f.y }, { x: f.x + Math.cos(ang) * 120, y: f.y + Math.sin(ang) * 120 }], life: 0.24, max: 0.24, color: '#9CD8FF' });
      g.effects.push({ kind: 'spark', x: f.x, y: f.y, n: 12, r0: 14, r1: 150, color: '#9CD8FF', life: 0.26, max: 0.26 });
    }
    var sigColor = sig ? sig.color : '#FFE08A';
    for (const t of list) {
      if (Math.hypot(t.x - f.x, t.y - f.y) > 240 + t.r) continue;
      if (sig.id === 'frost') t.slowT = Math.max(t.slowT || 0, 2);
      else if (sig.id === 'quake') { var qa = Math.atan2(t.y - f.y, t.x - f.x); t.kx = (t.kx || 0) + Math.cos(qa) * 260; t.ky = (t.ky || 0) + Math.sin(qa) * 260; }
      else if (sig.id === 'thunder') { if (t.stunT != null) t.stunT = Math.max(t.stunT, 0.45); }
      else if (sig.id === 'drain' && t.dead) f.hp = Math.min(f.maxHp, f.hp + f.maxHp * 0.02);
    }
    if (sig.id === 'drain') f.hp = Math.min(f.maxHp, f.hp + f.maxHp * 0.06);
    if (sig.id === 'aegis') f.invuln = Math.max(f.invuln || 0, 0.9);
    if (sig.id === 'wind') { f.hasteT = Math.max(f.hasteT || 0, 1.8); f.hasteMul = Math.max(f.hasteMul || 1, 1.25); }
    if (sig.id === 'domain') {
      for (const t of list) if (Math.hypot(t.x - f.x, t.y - f.y) <= 260 + t.r) hurt(g, f, t, dmg * 0.45);
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 20, maxR: 260, life: 0.35, max: 0.35, color: sigColor });
      g.effects.push({ kind: 'spark', x: f.x, y: f.y, n: 16, r0: 20, r1: 180, color: sigColor, life: 0.3, max: 0.3 });
    }
    g.effects.push({ kind: 'spark', x: f.x, y: f.y, n: 8, r0: 8, r1: 60, color: sigColor, life: 0.22, max: 0.22 });
    TJ.helpers.addText(g, f.x, f.y - 74, '签名·' + sig.name, sigColor, 15);
    if (hitCount > 0) {
      g.shake = Math.max(g.shake || 0, 4);
      TJ.helpers.addText(g, f.x, f.y - 54, '共鸣·' + (RES_NAME[kind] || '爆发'), RES_COLOR[kind] || '#FFE08A', 16);
    }
    return kind;
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
      for (const t of targets(g, f)) {
        if (Math.hypot(t.x - f.x, t.y - f.y) <= 72 + t.r) { hurt(g, f, t, 18 + (sk.dmg || 0) * 0.4); const a2 = Math.atan2(t.y - f.y, t.x - f.x); t.kx = (t.kx || 0) + Math.cos(a2) * 140; t.ky = (t.ky || 0) + Math.sin(a2) * 140; }
      }
    } else if (sk.kind === 'shield') {
      f.invuln = Math.max(f.invuln, sk.dur || 1.8);
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 10, maxR: f.r * 2.6, life: 0.4, max: 0.4, color: '#FFD34D' });
      for (const t of targets(g, f)) {
        const dd = Math.hypot(t.x - f.x, t.y - f.y);
        if (dd <= f.r * 4.2 + t.r) { const a2 = Math.atan2(t.y - f.y, t.x - f.x); t.kx = (t.kx || 0) + Math.cos(a2) * 260; t.ky = (t.ky || 0) + Math.sin(a2) * 260; }
      }
    } else if (sk.kind === 'heal') {
      f.hp = Math.min(f.maxHp, f.hp + f.maxHp * (sk.pct || 0.35));
      f.slowT = 0; f.freezeT = 0;
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
          if (t.stunT != null) t.stunT = Math.max(t.stunT, 0.5);
        }
      }
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 12, maxR: rad, life: 0.35, max: 0.35, color: '#FFB4A2' });
    }
    weaponResonance(g, f, sk, ang);
    R.sfx(g, 'dash');
    g.shake = Math.max(g.shake || 0, 5);
    return true;
  }
  TJ.skills = { use: use, RES_NAME: RES_NAME, signature: signatureFor };
})();
