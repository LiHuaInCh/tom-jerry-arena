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

  const { sfx, addText, burst, resolveObstacles, inObstacle } = TJ.Feedback;
  const updatePickups = TJ.Pickups.update;
  const { damageEnemy, killEnemy, healPlayer, explodeAt, hurtPlayer, nearestEnemy } = TJ.Combat;
  const RARITY_W = { common: 62, rare: 30, epic: 8 };
  const ELEM_TAG = TJ.Systems.ELEM_TAG;
  const FUSE_TXT = TJ.Systems.FUSE_TXT;
  const { fire, updatePlayer, updateEnemies, updateProjectiles, updateEffects, director, spawnEnemy } = TJ.Systems;
  const addXp = TJ.Pickups.addXp;

  function baseStats() {
    return {
      damage: 1, fireRate: 1.3, speed: 1, maxHp: 0, crit: 0.08, critMul: 1.8,
      pierce: 0, multishot: 0, bounce: 0, homing: 0, explode: 0, lifesteal: 0, regen: 0,
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
      level: 1, xp: 0, xpNeed: 6, pendingLevels: 0,
      kills: 0, score: 0, wave: 0, spawnTimer: 1.0, boss: null, shake: 0, revived: false,
      events: [], cam: { x: D.W / 2, y: D.H / 2 }, seed: opts.seed
    };
    TJ.Missions.init(g);
    g.player = makePlayer(g, opts.charId);
    if (g.W > 3000) { g.player.x = Math.round(g.W * 0.28); g.player.y = Math.round(g.H * 0.30); }
    g.cam.x = g.player.x; g.cam.y = g.player.y;
    return g;
  };

  function makePlayer(g, charId) {
    const c = D.characters.find(x => x.id === charId) || D.characters[0];
    return {
      char: c, charId: c.id, skill: c.skill, weapon: c.weapon, elemSlots: [null, null], x: D.W / 2, y: D.H / 2, vx: 0, vy: 0,
      r: c.radius, hp: c.hp, maxHp: c.hp, speed: c.speed,
      facing: -Math.PI / 2, aim: -Math.PI / 2,
      fireCd: 0.12, dashCd: 0, dashT: 0, dashX: 1, dashY: 0, dashHits: null, skillCd: 0, hasteT: 0,
      invuln: 1.2, hitFlash: 0, walk: 0, moving: false,
      shield: 0, shieldCd: 0, hurtT: 99, level: 1, alive: true, target: null
    };
  }

  /* ---------------- 事件 / 特效 ---------------- */
  function fuseName(a, b) {
    const fu = (TJ.DATA.fusions || {})[[a, b].sort().join('+')];
    if (!fu) return null;
    const key = [a, b].sort().join('+');
    return fu.name + '（' + (FUSE_TXT[key] || '') + '）';
  }

  function elemChoices(g, slot) {
    const names = { fire: '火', ice: '冰', thunder: '雷', light: '光', dark: '暗' };
    const all = Object.keys(names);
    const two = [];
    while (two.length < 2 && all.length) two.push(all.splice(Math.floor(g.rng() * all.length), 1)[0]);
    return two.map(function (e) {
      const lines = ['定位：' + ELEM_TAG[e]];
      if (slot === 1 && g.player.elemSlots[0]) {
        const other = g.player.elemSlots[0];
        const line = fuseName(e, other);
        lines.push(line ? ('与' + names[other] + '融合：' + line) : ('与' + names[other] + '暂无异元素融合'));
      } else {
        const list = [];
        Object.keys(names).forEach(function (o) {
          const line = fuseName(e, o);
          if (line && list.indexOf(line) < 0) list.push(line);
        });
        lines.push('可融合：' + list.join(' · '));
      }
      return { id: 'elem' + slot + '_' + e, name: '元素 · ' + names[e], desc: lines.join('\n'), icon: names[e], rarity: 'epic', stack: slot === 0 ? '第 1 槽' : '第 2 槽' };
    });
  }

  const EVO = {
    rapid: [['过热','射速 +40%，持续命中叠伤', function(s){ s.fireRate*=1.4; }], ['跳弹','弹丸 +1 次弹跳并附带爆炸', function(s){ s.bounce+=1; s.explode+=1; }]],
    spread: [['聚束','弹丸 -1、散布 -50%、伤害 +50%', function(s){ s.multishot=Math.max(0,s.multishot-1); s.damage*=1.5; }], ['弹幕墙','弹丸 +2、散布 +12°', function(s){ s.multishot+=2; }]],
    lob: [['延时引信','落地爆炸 +70%', function(s){ s.explode+=1; s.damage*=1.2; }], ['连环跳','弹跳 +2、每次弹跳伤害 +15%', function(s){ s.bounce+=2; s.damage*=1.15; }]],
    homing: [['猎杀锁定','追踪 +2、优先残血', function(s){ s.homing+=2; }], ['子母弹','命中分裂 2 发小弹', function(s){ s.multishot+=1; }]],
    pierce: [['破甲贯穿','穿透 +2 且不衰减', function(s){ s.pierce+=2; }], ['回旋','弹丸到终点返回', function(s){ s.bounce+=1; s.pierce+=1; }]],
    heavy: [['贯穿弹头','伤害 +35%、击退翻倍', function(s){ s.damage*=1.35; }], ['震荡弹头','爆炸并眩晕 0.35s，伤害 -25%', function(s){ s.explode+=2; s.damage*=0.75; s.stunChance=0.4; }]],
    blade: [['疾风','命中冷却 -32%', function(s){ s.fireRate*=1.3; }], ['刃环扩张','半径 +22、刀刃 +1', function(s){ s.orbitRBonus=(s.orbitRBonus||0)+22; s.orbitBonus=(s.orbitBonus||0)+1; }]],
    polearm: [['离心重击','刀刃伤害 +40%', function(s){ s.orbitDmgMul=(s.orbitDmgMul||1)*1.4; }], ['密刃','刀刃 +2、冷却 -20%', function(s){ s.orbitBonus=(s.orbitBonus||0)+2; s.fireRate*=1.2; }]],
    maul: [['震荡冲击','爆炸 +68% 并眩晕', function(s){ s.explode+=2; }], ['蓄力','每第 2 击 ×2.4，冷却 +25%', function(s){ s.orbitDmgMul=(s.orbitDmgMul||1)*1.6; }]],
    guard: [['铁壁','减伤 +13%', function(s){ s.armor+=0.13; }], ['反刺','刀刃 +2、伤害 +50%、减伤 -7%', function(s){ s.orbitBonus=(s.orbitBonus||0)+2; s.orbitDmgMul=(s.orbitDmgMul||1)*1.5; }]],
    burn: [['炽焰','灼烧伤害 +40%', function(s){ s.damage*=1.4; }], ['蔓延','光环半径 +32、死亡引爆', function(s){ s.orbitRBonus=(s.orbitRBonus||0)+32; }]],
    aegis: [['圣盾','减伤 +12%、回血翻倍', function(s){ s.armor+=0.12; s.regen=(s.regen||0)+0.006; }], ['惩戒','灼烧 ×2.5、减伤降至 10%', function(s){ s.damage*=2.5; }]],
    arc: [['衰减抑制','连锁衰减降低', function(s){ s.damage*=1.25; }], ['多重电弧','跳跃 +2', function(s){ s.multishot+=2; }]],
    tether: [['高压','电弧伤害 +35%、减速 35%', function(s){ s.damage*=1.35; }], ['分流','同时 2 个目标', function(s){ s.multishot+=1; }]],
    lance: [['聚焦','光束变宽、伤害 +30%', function(s){ s.damage*=1.3; }], ['延音','持续光柱，总伤 -15%', function(s){ s.damage*=1.15; s.pierce+=1; }]],
    mine: [['连环引爆','爆炸 +40%', function(s){ s.explode+=1; }], ['雷场速布','冷却 -45%、上限 +1，伤害 -20%', function(s){ s.damage*=1.2; }]],
    spike: [['淬毒尖刺','持续伤害 7/s、减速 28%', function(s){ s.dotDps=7; s.slowOnHit=0.28; }], ['弹簧地刺','触发冷却减半', function(s){ s.fireRate*=1.4; }]],
    summon: [['精锐化','召唤物伤害 +40%', function(s){ s.damage*=1.4; }], ['群体召唤','召唤上限 +1', function(s){ s.multishot+=1; }]]
  };
  function evoChoices(g) {
    const sub = (D.weapons[g.player.char.weapon] || {}).sub || 'rapid';
    const arr = EVO[sub] || EVO.rapid;
    return arr.map(function (it, i) { return { id: 'evo_' + sub + '_' + i, name: it[0], desc: it[1], icon: it[0].slice(0,1), rarity: 'epic', kind: 'evo_main', apply: it[2] }; });
  }
  function subEvoChoices() {
    return [
      { id: 'evo_sub_dmg', name: '副武器 · 重击', desc: '副武器伤害 +50%', icon: '副', rarity: 'epic', kind: 'evo_sub', apply: function (s) { s.subDmgMul = (s.subDmgMul || 1) * 1.5; } },
      { id: 'evo_sub_cd', name: '副武器 · 连发', desc: '副武器冷却 -30%', icon: '连', rarity: 'epic', kind: 'evo_sub', apply: function (s) { s.subCdMul = (s.subCdMul || 1) * 0.7; } }
    ];
  }
  TJ.getUpgradeChoices = function (g) {
    const p = g.player;
    if (p.level >= 7 && !p.elemSlots[0]) return elemChoices(g, 0);
    if (p.level >= 14 && p.elemSlots[0] && !p.elemSlots[1]) return elemChoices(g, 1);
    if (p.level % 4 === 0) {
      const pool = evoChoices(g).slice();
      if (p.subWeapon) pool.push.apply(pool, subEvoChoices());
      else pool.push({ id: 'evo_generic_dmg', name: '武器专精', desc: '武器伤害 +25%', icon: '专', rarity: 'epic', kind: 'evo_main' });
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(g.rng() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
      return pool.slice(0, 3);
    }
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
          const KC = { ranged:'远程', orbit:'环绕', aura:'光环', chain:'连锁', beam:'光束', deploy:'布置', summon:'召唤', tether:'连锁' };
          return { id: 'sub_' + k, name: '副武器 · ' + w.name, desc: (KC[w.kind] || '') + (w.label ? ' · ' + w.label : '') + ' — 自动攻击，独立冷却', icon: '副', rarity: 'epic' };
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
    if (p.subWeapon && p.level >= 9 && (counts.sub_swap || 0) < 1) {
      pool.push({ id: 'sub_swap', name: '更换副武器', desc: '随机换一把副武器（限一次）', icon: '换', rarity: 'epic', max: 1 });
    }
    if (p.subWeapon) {
      const subs = [
        { id: 'sup_dmg', name: '副武器 · 重击', desc: '副武器伤害 +30%', icon: '副', rarity: 'rare', max: 5 },
        { id: 'sup_cd', name: '副武器 · 连发', desc: '副武器冷却 -20%', icon: '副', rarity: 'rare', max: 4 }
      ];
      for (const u of subs) if ((counts[u.id] || 0) < u.max) pool.push(u);
    }
    const luck = 1 + g.stats.luck;
    while (out.length < 3 && pool.length) {
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
    if (id.indexOf('evo_') === 0) {
      const pool = (id.indexOf('evo_sub') === 0) ? subEvoChoices() : evoChoices(g);
      const card = pool.filter(function (x) { return x.id === id; })[0];
      if (!card) return null;
      if (card.apply) card.apply(g.stats, g);
      if (g.pendingLevels > 0) g.pendingLevels--;
      g.events.push({ type: 'upgrade', id: id });
      return { name: card.name };
    }
    if (id === 'sub_swap') {
      const p = g.player;
      const pool = Object.keys(D.weapons).filter(function (k) {
        return k !== p.subWeapon && k !== p.char.weapon && (D.weapons[k].kind === 'ranged' || D.weapons[k].kind === 'orbit');
      });
      if (pool.length) p.subWeapon = pool[Math.floor(g.rng() * pool.length)];
      p.subCd = 0.5;
      g.upgradeCounts[id] = 1;
      if (g.pendingLevels > 0) g.pendingLevels--;
      g.events.push({ type: 'upgrade', id: id });
      return { name: '更换副武器' };
    }
    if (id.indexOf('sup_') === 0) {
      g.upgradeCounts[id] = (g.upgradeCounts[id] || 0) + 1;
      if (id === 'sup_dmg') g.stats.subDmgMul = (g.stats.subDmgMul || 1) * 1.3;
      else if (id === 'sup_cd') g.stats.subCdMul = (g.stats.subCdMul || 1) * 0.8;
      if (g.pendingLevels > 0) g.pendingLevels--;
      g.events.push({ type: 'upgrade', id: id });
      return { name: '副武器强化' };
    }
    if (id.indexOf('elem') === 0) {
      const m = id.match(/^elem(\d)_(\w+)$/);
      if (m) {
        g.player.elemSlots[Number(m[1])] = m[2];
        if (g.pendingLevels > 0) g.pendingLevels--;
        g.events.push({ type: 'upgrade', id: id });
        return { name: '元素', desc: '' };
      }
    }
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
    const dampKeys = ['pierce', 'bounce', 'explode', 'multishot', 'homing'];
    const snap = {};
    for (const k of dampKeys) snap[k] = g.stats[k];
    def.apply(g.stats, g);
    if ((g.upgradeCounts[id] || 0) > 1) {
      for (const k of dampKeys) {
        const add = g.stats[k] - snap[k];
        if (add > 0) g.stats[k] = snap[k] + add * 0.7;
      }
    }
    g.stats.damage = Math.min(g.stats.damage, 8);
    g.stats.fireRate = Math.min(g.stats.fireRate, 3);
    g.stats.pierce = Math.min(g.stats.pierce, 5);
    g.stats.bounce = Math.min(g.stats.bounce, 4);
    g.stats.multishot = Math.min(g.stats.multishot, 4);
    g.stats.explode = Math.min(g.stats.explode, 3);
    g.stats.homing = Math.min(g.stats.homing, 3);
    g.stats.regen = Math.min(g.stats.regen || 0, 0.02);
    g.stats.lifesteal = Math.min(g.stats.lifesteal, 0.02);
    p.maxHp = p.char.hp + g.stats.maxHp;
    if (p.maxHp > before) p.hp += p.maxHp - before;
    p.shield = Math.max(p.shield, 0);
    if (g.stats.shieldMax > 0 && p.shield === 0 && p.shieldCd <= 0) p.shield = 1;
    if (g.pendingLevels > 0) g.pendingLevels--;
    g.events.push({ type: 'upgrade', id });
    return def;
  };

  // 供乱斗模式 / 未来联机复用的底层工具
  TJ.Core = { spawnEnemy: spawnEnemy, fire: fire };
  TJ.helpers = { baseStats, resolveObstacles, burst, addText, sfx, clamp, rand };
  TJ.helpers.hurtEnemy = function (g, f, e, d) { damageEnemy(g, e, d, false); };
})();
