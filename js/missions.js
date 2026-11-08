/* 猫鼠大作战 — 任务与区域（从 core.js 拆出） */
(function () {
  const TJ = (window.TJ = window.TJ || {});
  const rand = function (g, a, b) { return TJ.helpers.rand(g, a, b); };
  const addText = function (g, x, y, t, c, size) { TJ.helpers.addText(g, x, y, t, c, size); };

  const ZONES = [
    { id: 'kitchen', name: '厨房', x0: 0, y0: 0, x1: 0.5, y1: 0.5 },
    { id: 'living', name: '客厅', x0: 0.5, y0: 0, x1: 1, y1: 0.5 },
    { id: 'garden', name: '花园', x0: 0, y0: 0.5, x1: 0.5, y1: 1 },
    { id: 'cellar', name: '地窖', x0: 0.5, y0: 0.5, x1: 1, y1: 1 }
  ];
  function zoneOf(g, x, y) {
    const fx = x / g.W, fy = y / g.H;
    for (const z of ZONES) if (fx >= z.x0 && fx < z.x1 && fy >= z.y0 && fy < z.y1) return z.id;
    return 'kitchen';
  }
  const MISSION_DEFS = [
    { id: 'kill', text: '击倒 40 只猫', need: 40 },
    { id: 'wave', text: '撑到第 6 波', need: 6 },
    { id: 'zone', text: '区域任务', need: 15 },
    { id: 'carry', text: '把 3 块奶酪搬进鼠洞', need: 3 },
    { id: 'timed', text: '60 秒内击倒 15 只', need: 15 },
    { id: 'nohit', text: '连续 3 波不受伤', need: 3 },
    { id: 'escort', text: '护送小老鼠到鼠洞', need: 1 }
  ];
  function safeSpot(g, x, y, pad) {
    if (!g.obstacles) return true;
    for (const o of g.obstacles) {
      if (x > o.x - pad && x < o.x + o.w + pad && y > o.y - pad && y < o.y + o.h + pad) return false;
    }
    return true;
  }
  function bumpMission(g, kind, val, zone) {
    if (!g.missions) return;
    for (const m of g.missions) {
      if (m.id !== kind || m.done || !m.active) continue;
      if (kind === 'zone' && zone !== m.zoneId) continue;
      m.cur = kind === 'wave' ? Math.max(m.cur, val) : m.cur + val;
      if (m.cur >= m.need) {
        m.done = true; m.active = false;
        g.missionPicks = (g.missionPicks || 0) + 1;
        if (!g.missions[g.missionIdx + 1]) {
          const tpl = MISSION_DEFS[Math.floor(g.rng() * MISSION_DEFS.length)];
          const nm = { id: tpl.id, text: tpl.text, need: tpl.need, cur: 0, done: false, active: false };
          if (tpl.id === 'zone') { const z2 = ZONES[Math.floor(g.rng() * ZONES.length)]; nm.zoneId = z2.id; nm.text = '在' + z2.name + '击倒 15 只'; }
          g.missions.push(nm);
        }
        g.missionIdx++;
        g.missions[g.missionIdx].active = true;
        addText(g, g.player.x, g.player.y - 90, '新任务：' + g.missions[g.missionIdx].text, '#FFE08A', 20);
        if (g.missions[g.missionIdx].id === 'timed') g.missionTimer = 60;
        addText(g, g.player.x, g.player.y - 70, '任务完成！选择奖励', '#FFD34D', 22);
        if (g.missions.every(function (mm) { return mm.done; }) && !g.ultGiven) { g.ultGiven = true; g.missionPicks++; addText(g, g.player.x, g.player.y - 100, '全部完成：终极强化！', '#FFB44D', 26); }
        g.events.push({ type: 'mission', id: m.id });
        maybeStartStage(g);
      }
    }
  }
  function failMission(g, kind) {
    if (!g.missions) return;
    const m = g.missions[g.missionIdx];
    if (!m || m.id !== kind || m.done) return;
    m.done = true; m.active = false; m.failed = true;
    addText(g, g.player.x, g.player.y - 90, '任务失败：' + m.text, '#FF8A6A', 20);
    if (!g.missions[g.missionIdx + 1]) {
      const tpl = MISSION_DEFS[Math.floor(g.rng() * MISSION_DEFS.length)];
      const nm = { id: tpl.id, text: tpl.text, need: tpl.need, cur: 0, done: false, active: false };
      if (tpl.id === 'zone') { const z2 = ZONES[Math.floor(g.rng() * ZONES.length)]; nm.zoneId = z2.id; nm.text = '在' + z2.name + '击倒 15 只'; }
      g.missions.push(nm);
    }
    g.missionIdx++;
    g.missions[g.missionIdx].active = true;
    addText(g, g.player.x, g.player.y - 70, '新任务：' + g.missions[g.missionIdx].text, '#FFE08A', 18);
    if (g.missions[g.missionIdx].id === 'timed') g.missionTimer = 60;
  }
  function startStage(g, kind) {
    g.stage = {
      kind: kind, need: kind === 'good' ? 78 : 91, count: 0,
      x: g.W / 2, y: g.H / 2, still: 0, spawn: 0.6, t: 0
    };
    addText(g, g.W / 2, g.H / 2 - 80, kind === 'good' ? '干的真棒杰瑞！' : '愤怒杰瑞！', kind === 'good' ? '#FFD34D' : '#FF7A5C', 26);
  }

  function maybeStartStage(g) {
    if (g.stage) return;
    const done = (g.missions || []).filter(function (x) { return x.done; }).length;
    if (done < 2) return;
    if (g.rng() > 0.12) return;
    startStage(g, g.rng() < 0.5 ? 'good' : 'angry');
  }

  function tickStage(g, dt) {
    const s = g.stage;
    if (!s) return;
    const p = g.player;
    s.t += dt;
    if (p.moving) s.still = 0; else s.still += dt;
    if (s.still >= 10) { addText(g, p.x, p.y - 70, '任务失败：站桩太久', '#FF8A6A', 20); g.stage = null; return; }
    s.spawn -= dt;
    if (s.spawn <= 0) {
      s.spawn = s.kind === 'good' ? 0.6 : 0.5;
      const n = s.kind === 'good' ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const a = g.rng() * Math.PI * 2;
        const sx = p.x + Math.cos(a) * 320, sy = p.y + Math.sin(a) * 320;
        const vx = Math.cos(a + Math.PI) * 240, vy = Math.sin(a + Math.PI) * 240;
        g.projectiles.push({
          x: sx, y: sy, vx: vx, vy: vy, r: 10, dmg: 1, from: 'enemy', kind: 'orb',
          life: 3, hit: {}, stageHit: true,
          icon: s.kind === 'good' ? 'assets/enemies/carrot_cut.png' : 'assets/enemies/ice_cut.png'
        });
      }
    }
    for (const pr of g.projectiles) {
      if (!pr.stageHit || pr.dead) continue;
      if (Math.hypot(pr.x - p.x, pr.y - p.y) < pr.r + p.r) {
        pr.dead = true; s.count++;
        TJ.Combat.hurtPlayer(g, 1, p.x, p.y);
        addText(g, p.x, p.y - 40, (s.kind === 'good' ? '赞美 +1 ' : '降温 +1 ') + s.count + '/' + s.need, s.kind === 'good' ? '#FFD34D' : '#9CD8FF', 16);
      }
    }
    if (s.count >= s.need) {
      addText(g, p.x, p.y - 80, '任务完成！', '#FFD34D', 24);
      g.missionPicks = (g.missionPicks || 0) + 1;
      g.stage = null;
    }
  }

  TJ.Missions = {
    tick: function (g, dt) { tickStage(g, dt); },
    stage: function (g) { return g.stage || null; },
    start: function (g, kind) { startStage(g, kind); },
    zoneOf: zoneOf,
    bump: function (g, kind, val, zone) { bumpMission(g, kind, val, zone); },
    fail: function (g, kind) { failMission(g, kind); },
    recenter: function (g) {
      if (!g.decor || !g.decor.length) return;
      const dx = g.player.x - g.W / 2, dy = g.player.y - g.H / 2;
      for (const d of g.decor) {
        d.x = Math.max(120, Math.min(g.W - 120, d.x + dx));
        d.y = Math.max(120, Math.min(g.H - 120, d.y + dy));
      }
    },
    init: function (g) {
      const shuffled = MISSION_DEFS.slice().sort(function () { return g.rng() - 0.5; }).slice(0, 3);
      g.missions = shuffled.map(function (m) { return { id: m.id, text: m.text, need: m.need, cur: 0, done: false }; });
      g.missionIdx = 0;
      g.missionTimer = 0;
      g.missions.forEach(function (m, i) { m.active = i === 0; });
      g.holes = [
        { x: 60, y: g.H / 2 }, { x: g.W - 60, y: g.H / 2 },
        { x: g.W / 2, y: 60 }, { x: g.W / 2, y: g.H - 60 }
      ];
      g.cheeseT = 4;
      if (g.W > 3000) {
        g.decor = [];
        const sx0 = (g.player && g.player.x) || g.W / 2, sy0 = (g.player && g.player.y) || g.H / 2;
        const d0Pad = 70;
        for (let i = 0; i < 12; i++) {
          const a = g.rng() * Math.PI * 2, rr = 160 + g.rng() * 320;
          const dx0 = Math.max(140, Math.min(g.W - 140, sx0 + Math.cos(a) * rr));
          const dy0 = Math.max(140, Math.min(g.H - 140, sy0 + Math.sin(a) * rr));
          if (safeSpot(g, dx0, dy0, d0Pad)) g.decor.push({ x: dx0, y: dy0, k: i % 6, z: zoneOf(g, dx0, dy0), s: 120 + g.rng() * 50 });
        }
        for (let i = 0; i < 14; i++) {
          const rx = rand(g, 140, g.W - 140), ry = rand(g, 140, g.H - 140);
          if (safeSpot(g, rx, ry, 70)) g.decor.push({ x: rx, y: ry, k: Math.floor(g.rng() * 6), z: zoneOf(g, rx, ry), s: 110 + g.rng() * 50 });
        }
      }
      const z = ZONES[Math.floor(g.rng() * ZONES.length)];
      const zm = g.missions.find(function (m) { return m.id === 'zone'; });
      if (zm) { zm.zoneId = z.id; zm.text = '在' + z.name + '击倒 15 只'; }
      const tm = g.missions[0];
      if (tm && tm.id === 'timed') g.missionTimer = 60;
      g.missionRewardIdx = 0;
    }
  };
})();
