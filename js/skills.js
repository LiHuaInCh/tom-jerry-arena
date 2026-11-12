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
  const CHAR_SIG = {
    detective: { name: '暗影狙击', desc: '隐身 1.2 秒，下一次命中 2.2 倍', run: function (c) { c.stealth(1.2); c.empower(2.2, 1); } },
    jerry: { name: '鼓舞士气', desc: '治疗 34%，接下来 3 次命中 +40%', run: function (c) { c.heal(0.34); c.empower(1.4, 3); } },
    m01: { name: '魔镜折射', desc: '光束 + 镜面爆炸', run: function (c) { c.line(620, 30, 70); c.bomb(90, 45, 2); } },
    m02: { name: '魔音灌耳', desc: '加速并震退周围敌人', run: function (c) { c.haste(3, 1.5); c.aoe(200, 45, { knock: 260 }); } },
    m03: { name: '分身齐射', desc: '治疗并五向齐射', run: function (c) { c.heal(0.28); c.line(500, 24, 38, 5, 0.18); } },
    m04: { name: '勇气剑阵', desc: '落地剑阵，减速并护体', run: function (c) { c.aoe(170, 55, { slow: 1.5 }); c.shield(0.8); } },
    m05: { name: '御风剑舞', desc: '加速并造成范围剑伤', run: function (c) { c.haste(3, 1.5); c.aoe(190, 58, { knock: 120 }); } },
    m06: { name: '王冠威压', desc: '护盾并眩晕周围', run: function (c) { c.shield(2.2); c.aoe(210, 40, { stun: 0.5 }); } },
    m07: { name: '圣光洗礼', desc: '治疗并连锁 4 个目标', run: function (c) { c.heal(0.3); c.chain(4, 46); } },
    m08: { name: '天使壁垒', desc: '护盾并清除周围弹幕', run: function (c) { c.shield(2); c.clear(240); } },
    m09: { name: '尼宝援护', desc: '闪现后范围伤害并回血', run: function (c) { c.aoe(150, 50); c.heal(0.12); } },
    m10: { name: '弹幕狂欢', desc: '治疗并七向弹幕', run: function (c) { c.heal(0.2); c.line(460, 26, 30, 7, 0.15); } },
    m11: { name: '恶魔凝视', desc: '范围减速并直线穿刺', run: function (c) { c.aoe(200, 25, { slow: 2.5 }); c.line(560, 30, 50); } },
    m12: { name: '暗影灼烧', desc: '隐身并留下灼烧区域', run: function (c) { c.stealth(1.2); c.aoe(220, 40, { slow: 2 }); } },
    m13: { name: '爆破工事', desc: '布置三处雷区', run: function (c) { c.bomb(100, 55, 3, { slow: 1 }); } },
    m14: { name: '朝圣牵引', desc: '拉扯敌人并造成伤害', run: function (c) { c.pull(300, 110, 40); } },
    m15: { name: '电流加速', desc: '加速并连锁 5 个目标', run: function (c) { c.haste(3, 1.4); c.chain(5, 38); } },
    m16: { name: '梦境泡泡', desc: '护盾并大范围减速', run: function (c) { c.shield(1.8); c.aoe(240, 20, { slow: 2.4 }); } },
    m17: { name: '牛仔套索', desc: '拉近最近目标并眩晕', run: function (c) { c.pull(320, 140, 30, { stun: 0.8 }); c.heal(0.15); } },
    m18: { name: '骑士标枪', desc: '护盾并双矛贯穿', run: function (c) { c.shield(1.6); c.line(600, 34, 55, 2, 0.12); } },
    m19: { name: '颜料陷阱', desc: '大范围减速并伤害', run: function (c) { c.aoe(230, 35, { slow: 2.6 }); } },
    m20: { name: '重炮轰击', desc: '直线重炮并击退', run: function (c) { c.line(640, 52, 95, 1, 0, { knock: 300 }); } },
    m21: { name: '弹跳惊喜', desc: '三处弹跳爆炸', run: function (c) { c.bomb(95, 48, 3); } },
    m22: { name: '舰炮齐射', desc: '闪现并六向齐射', run: function (c) { c.stealth(0.3); c.line(520, 26, 34, 6, 0.16); } },
    m23: { name: '反制装甲', desc: '护盾并反击周围', run: function (c) { c.shield(2); c.aoe(190, 50, { knock: 240 }); } },
    m24: { name: '尖刺花园', desc: '治疗并布下减速尖刺', run: function (c) { c.heal(0.2); c.aoe(210, 42, { slow: 2.2 }); } },
    m25: { name: '舞台谢幕', desc: '加速并眩晕全场近敌', run: function (c) { c.haste(2.5, 1.4); c.aoe(230, 30, { stun: 0.6 }); } },
    m26: { name: '爱心箭雨', desc: '治疗并四向爱心箭', run: function (c) { c.heal(0.25); c.line(480, 24, 32, 4, 0.2); } },
    m27: { name: '霜月斩', desc: '范围冰斩并减速', run: function (c) { c.aoe(200, 60, { slow: 2.5 }); } },
    m28: { name: '音符风暴', desc: '加速并震退音波', run: function (c) { c.haste(3, 1.35); c.aoe(240, 34, { knock: 220 }); } },
    m29: { name: '山崩', desc: '闪现砸地并眩晕', run: function (c) { c.aoe(220, 70, { stun: 0.7, knock: 260 }); } },
    m30: { name: '兔群出动', desc: '护盾并三处爆炸回血', run: function (c) { c.shield(1.6); c.bomb(100, 45, 3); c.heal(0.1); } },
    m31: { name: '羊角震地', desc: '治疗并震退周围', run: function (c) { c.heal(0.2); c.aoe(210, 45, { knock: 300 }); } },
    robin: { name: '降落箭雨', desc: '落地后八向箭雨', run: function (c) { c.line(500, 22, 28, 8, 0.14); } },
    swordsman: { name: '格挡反击', desc: '护盾并反击范围', run: function (c) { c.shield(2); c.aoe(190, 55); } },
    tuffy: { name: '连环雷', desc: '布置四处雷区', run: function (c) { c.bomb(90, 52, 4, { slow: 0.8 }); } },
    butch: { name: '重弹突袭', desc: '闪现并双重重弹', run: function (c) { c.stealth(0.3); c.line(620, 46, 80, 2, 0.15, { knock: 250 }); } },
    c01: { name: '皇家炮击', desc: '加速并六向炮击', run: function (c) { c.haste(2.5, 1.4); c.line(540, 28, 40, 6, 0.15); } },
    c02: { name: '放大镜灼烧', desc: '护盾并聚焦光束', run: function (c) { c.shield(1.8); c.line(640, 40, 75); } },
    c03: { name: '胡萝卜雨', desc: '治疗并四处爆炸', run: function (c) { c.heal(0.2); c.bomb(95, 44, 4); } },
    c04: { name: '追求者冲锋', desc: '直线冲锋并击退', run: function (c) { c.line(600, 44, 70, 1, 0, { knock: 300 }); c.haste(2, 1.3); } },
    c05: { name: '香水迷雾', desc: '大范围减速并回血', run: function (c) { c.aoe(260, 22, { slow: 3 }); c.heal(0.12); } },
    c06: { name: '鞭索束缚', desc: '拉近并眩晕目标', run: function (c) { c.pull(320, 130, 30, { stun: 0.9 }); } },
    c07: { name: '万有引力', desc: '闪现并拉拽全场', run: function (c) { c.stealth(0.3); c.pull(360, 120, 35, { slow: 1.5 }); } },
    c08: { name: '花枪旋风', desc: '加速并范围旋击', run: function (c) { c.haste(2.5, 1.4); c.aoe(210, 55, { knock: 140 }); } },
    c09: { name: '白日梦爆破', desc: '护盾并三处爆炸', run: function (c) { c.shield(1.8); c.bomb(110, 50, 3); } },
    c10: { name: '列车撞击', desc: '直线冲撞并击退', run: function (c) { c.line(660, 50, 85, 1, 0, { knock: 320 }); } },
    c11: { name: '捕虫网', desc: '减速并拉近目标', run: function (c) { c.aoe(190, 20, { slow: 2.5 }); c.pull(260, 90, 30); } },
    c12: { name: '爪刀连斩', desc: '加速并三段斩击', run: function (c) { c.haste(2.5, 1.45); c.line(300, 36, 40, 3, 0.35); } },
    c13: { name: '仙人掌弹幕', desc: '七向尖刺弹幕', run: function (c) { c.line(480, 24, 30, 7, 0.14); } },
    c14: { name: '胡椒粉', desc: '闪现并大范围减速', run: function (c) { c.stealth(0.3); c.aoe(240, 30, { slow: 2.5 }); } },
    c15: { name: '瑜伽弹跳', desc: '加速并三处弹跳', run: function (c) { c.haste(2.5, 1.3); c.bomb(100, 46, 3); } },
    c16: { name: '追风双翼', desc: '护盾、加速并四向射击', run: function (c) { c.shield(1.4); c.haste(2, 1.3); c.line(480, 22, 26, 4, 0.2); } },
    knightcat: { name: '旋刃剑舞', desc: '治疗并范围旋刃', run: function (c) { c.heal(0.18); c.aoe(200, 58, { knock: 120 }); } },
    lightning: { name: '咸鱼突刺', desc: '闪现突刺并贯穿', run: function (c) { c.stealth(0.3); c.line(620, 34, 85); } },
    tom: { name: '平底锅拍击', desc: '闪现拍击并眩晕', run: function (c) { c.aoe(180, 75, { stun: 0.8, knock: 280 }); } },
    toots: { name: '汽水喷泉', desc: '范围爆发并回血', run: function (c) { c.aoe(220, 45); c.heal(0.2); } }
  };
  function signatureFor(id) { var s = CHAR_SIG[id]; return s ? { id: id, name: s.name, desc: s.desc, color: '#FFD34D' } : null; }
  const RES_COLOR = { ranged: '#FFE08A', orbit: '#BFE9FF', aura: '#FFB44D', beam: '#FFF2A8', chain: '#C9A7FF', deploy: '#FF9A5C', summon: '#9FE7FF', tether: '#9CD8FF' };

  function weaponResonance(g, f, sk, ang) {
    const wid = (f.weapon || (f.char && f.char.weapon));
    const w = TJ.DATA.weapons[wid];
    if (!w) return null;
    const kind = w.kind;
    const dmg = (sk.dmg || 40) * 0.6;
    if (TJ.vfxLevel >= 2) g.effects.push({ kind: 'flash', color: RES_COLOR[kind] || '#FFF6E0', life: 0.16, max: 0.16 });
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
    applyCharSignature(g, f, sk, ang);
    var __wsk = TJ.DATA.weapons[(f.char && f.char.weapon) || f.weapon];
    if (__wsk && __wsk.kind === 'summon' && g.summons && !g.fighters) {
      var __n = (f.char && f.char.id === 'toots') ? 3 : 2;
      for (var __i = 0; __i < __n; __i++) {
        g.summons.push({ x: f.x + 24 + __i * 22, y: f.y + 10, life: 8, atkCd: 0, r: 15, spd: 240, icon: __wsk.iconImg, stationary: !!__wsk.stationary, range: 120, size: __wsk.stationary ? 56 : 76, w: __wsk, temp: true });
      }
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 20, maxR: 120, life: 0.4, max: 0.4, color: '#9FE7FF' });
      TJ.helpers.addText(g, f.x, f.y - 60, '召唤援军！', '#9FE7FF', 18);
    }
    R.sfx(g, 'dash');
    g.shake = Math.max(g.shake || 0, 5);
    return true;
  }
  function applyCharSignature(g, f, sk, ang) {
    const meta = CHAR_SIG[f.char && f.char.id];
    if (!meta) return;
    const R = TJ.helpers;
    const list = targets(g, f);
    function hit(t, dmg) { hurt(g, f, t, dmg); }
    function eachIn(r, fn) {
      for (const t of list) if (Math.hypot(t.x - f.x, t.y - f.y) <= r + t.r) fn(t);
    }
    function status(t, opt) {
      if (!opt) return;
      if (opt.slow) t.slowT = Math.max(t.slowT || 0, opt.slow);
      if (opt.stun && t.stunT != null) t.stunT = Math.max(t.stunT, opt.stun);
      if (opt.knock) { const a = Math.atan2(t.y - f.y, t.x - f.x); t.kx = (t.kx || 0) + Math.cos(a) * opt.knock; t.ky = (t.ky || 0) + Math.sin(a) * opt.knock; }
    }
    const C = {
      heal: function (pct) { f.hp = Math.min(f.maxHp, f.hp + f.maxHp * pct); },
      shield: function (sec) { f.invuln = Math.max(f.invuln || 0, sec); },
      haste: function (sec, mul) { f.hasteT = Math.max(f.hasteT || 0, sec); f.hasteMul = Math.max(f.hasteMul || 1, mul || 1.3); },
      stealth: function (sec) { f.stealthT = Math.max(f.stealthT || 0, sec); f.invuln = Math.max(f.invuln || 0, 0.3); },
      empower: function (mul, n) { f.nextHitMul = Math.max(f.nextHitMul || 1, mul); f.nextHitCharges = Math.max(f.nextHitCharges || 0, n || 1); },
      clear: function (r) {
        if (!g.projectiles) return;
        for (const pr of g.projectiles) {
          if (pr.from === f) continue;
          if (Math.hypot(pr.x - f.x, pr.y - f.y) <= r) pr.dead = true;
        }
        g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 20, maxR: r, life: 0.3, max: 0.3, color: '#BFE9FF' });
      },
      aoe: function (r, dmg, opt) {
        eachIn(r, function (t) { hit(t, dmg); status(t, opt); });
        g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 20, maxR: r, life: 0.32, max: 0.32, color: '#FFD34D' });
        R.burst(g, f.x, f.y, '#FFD34D', 10, 180, 3);
      },
      line: function (len, width, dmg, n, spread, opt) {
        n = n || 1; spread = spread || 0;
        for (let i = 0; i < n; i++) {
          const a = ang + (i - (n - 1) / 2) * spread;
          const dx = Math.cos(a), dy = Math.sin(a);
          for (const t of list) {
            const ex = t.x - f.x, ey = t.y - f.y;
            const tp = ex * dx + ey * dy;
            if (tp < 0 || tp > len) continue;
            if (Math.hypot(ex - dx * tp, ey - dy * tp) <= width / 2 + t.r) { hit(t, dmg); status(t, opt); }
          }
          g.effects.push({ kind: 'beam', x: f.x, y: f.y, ang: a, len: len, life: 0.22, max: 0.22, color: '#FFE08A' });
          g.effects.push({ kind: 'spark', x: f.x + Math.cos(a) * 20, y: f.y + Math.sin(a) * 20, n: 6, r0: 6, r1: 36, color: '#FFE08A', life: 0.2, max: 0.2, rot: a });
        }
      },
      chain: function (n, dmg) {
        let cur = null, bd = 1e9;
        for (const t of list) { const d = Math.hypot(t.x - f.x, t.y - f.y); if (d < bd && d < 420) { bd = d; cur = t; } }
        const pts = [{ x: f.x, y: f.y }];
        for (let i = 0; i < n && cur; i++) {
          pts.push({ x: cur.x, y: cur.y }); hit(cur, dmg * (1 - i * 0.08));
          const prev = cur; cur = null; bd = 1e9;
          for (const t of list) { if (t === prev) continue; const d = Math.hypot(t.x - prev.x, t.y - prev.y); if (d < bd && d < 280) { bd = d; cur = t; } }
        }
        if (pts.length > 1) g.effects.push({ kind: 'chain', pts: pts, life: 0.28, max: 0.28, color: '#C9A7FF' });
      },
      pull: function (r, dist, dmg, opt) {
        eachIn(r, function (t) {
          const a = Math.atan2(f.y - t.y, f.x - t.x);
          t.x += Math.cos(a) * dist; t.y += Math.sin(a) * dist;
          hit(t, dmg); status(t, opt);
          g.effects.push({ kind: 'chain', pts: [{ x: f.x, y: f.y }, { x: t.x, y: t.y }], life: 0.2, max: 0.2, color: '#9CD8FF' });
        });
        g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 20, maxR: r, life: 0.32, max: 0.32, color: '#9CD8FF' });
      },
      bomb: function (r, dmg, n, opt) {
        const sorted = list.slice().sort(function (a, b) { return Math.hypot(a.x - f.x, a.y - f.y) - Math.hypot(b.x - f.x, b.y - f.y); }).slice(0, n || 1);
        for (const t of sorted) {
          for (const o of list) if (Math.hypot(o.x - t.x, o.y - t.y) <= r + o.r) { hit(o, dmg); status(o, opt); }
          g.effects.push({ kind: 'ring', x: t.x, y: t.y, r: 10, maxR: r, life: 0.3, max: 0.3, color: '#FF9A5C' });
          g.effects.push({ kind: 'tex', src: 'assets/fx/kenney/flame_03.png', x: t.x, y: t.y, life: 0.3, max: 0.3, s0: 20, s1: 100, alpha: 0.8 });
          g.effects.push({ kind: 'spark', x: t.x, y: t.y, n: 8, r0: 6, r1: 56, color: '#FFD34D', life: 0.24, max: 0.24 });
        }
      }
    };
    meta.run(C);
    g.shake = Math.max(g.shake || 0, 7);
    g.effects.push({ kind: 'spark', x: f.x, y: f.y, n: 12, r0: 10, r1: 90, color: '#FFE08A', life: 0.26, max: 0.26 });
    TJ.helpers.addText(g, f.x, f.y - 76, '签名·' + meta.name, '#FFD34D', 16);
  }

  TJ.skills = { use: use, RES_NAME: RES_NAME, signature: signatureFor };
})();
