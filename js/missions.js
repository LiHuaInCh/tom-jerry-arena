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
      }
    }
  }
  TJ.Missions = {
    zoneOf: zoneOf,
    bump: function (g, kind, val, zone) { bumpMission(g, kind, val, zone); },
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
        for (let i = 0; i < 26; i++) g.decor.push({ x: rand(g, 140, g.W - 140), y: rand(g, 140, g.H - 140), k: Math.floor(g.rng() * 3), s: 16 + g.rng() * 22 });
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
