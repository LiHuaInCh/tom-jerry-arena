/* 猫鼠大作战 — 乱斗模式：仿真人对战（为联机预留的斗士模型） */
(function () {
  const TJ = (window.TJ = window.TJ || {});
  const D = TJ.DATA;
  const H = TJ.helpers;
  TJ.helpers.hurtFighter = function (g, f, t, d) { damageFighter(g, t, d, f, false); };
  const TAU = Math.PI * 2;
  const rand = H.rand;

  const SPAWNS = [
    [600, 600], [1200, 600], [900, 380],
    [900, 1020], [430, 860], [1360, 790]
  ];
  const SPAWN_SCALE = D.W / 1800;
  SPAWNS.forEach(function (s) { s[0] = Math.round(s[0] * SPAWN_SCALE); s[1] = Math.round(s[1] * SPAWN_SCALE); });
  const BOT_NAMES = ['奶酪猎人', '屋顶飞贼', '厨房老六', '弹簧尾巴', '夜行侠'];
  const COLORS = ['#E4572E', '#4B7DA8', '#4E7F52', '#B06BE0', '#F2A03D', '#2F8F83'];
  const TIME_LIMIT = 180;
  const KILLS_TO_WIN = 10;
  const LIVES = 4;
  const RESPAWN_TIME = 2.9;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(g, arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(g.rng() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function makeFighter(g, id, char, name, isBot, spawnIdx) {
    const sp = SPAWNS[spawnIdx % SPAWNS.length];
    const baseHp = Math.round(char.hp * 1.15);
    const f = {
      id, name, isBot, char, skill: char.skill, elemSlots: [char.element, null],
      weapon: char.weapon, weaponLv: 1, weaponLevels: {},
      stats: H.baseStats(), upgradeCounts: {},
      level: 1, xp: 0, xpNeed: 5, pendingLevels: 0,
      x: sp[0] + rand(g, -20, 20), y: sp[1] + rand(g, -20, 20),
      r: char.radius, baseHp: baseHp, hp: baseHp, maxHp: baseHp,
      facing: -Math.PI / 2, aim: -Math.PI / 2,
      fireCd: rand(g, 0.05, 0.3), dashCd: 0, dashT: 0, skillCd: 0, hasteT: 0,
      dashX: 1, dashY: 0, dashHits: null,
      invuln: 1.6, hitFlash: 0, walk: rand(g, 0, 6), moving: false,
      shield: 0, shieldCd: 0,
      alive: true, lives: LIVES, kills: 0, deaths: 0,
      respawnT: 0, eliminated: false,
      color: COLORS[id % COLORS.length], target: null,
      persona: ['aggr', 'collect', 'trap'][id % 3]
    };
    f.weaponLevels[f.weapon] = 1;
    const tal = char.talent;
    if (tal) {
      if (tal.damage) f.stats.damage *= tal.damage;
      if (tal.fireRate) f.stats.fireRate *= tal.fireRate;
      if (tal.speed) f.stats.speed *= tal.speed;
      if (tal.crit) f.stats.crit += tal.crit;
      if (tal.critMul) f.stats.critMul += tal.critMul;
      if (tal.magnet) f.stats.magnet += tal.magnet;
      if (tal.hp) { f.maxHp = Math.round(f.maxHp * (1 + tal.hp)); f.hp = f.maxHp; f.baseHp = f.maxHp; }
    }
    return f;
  }

  TJ.createArenaGame = function (opts) {
    opts = opts || {};
    const g = {
      mode: 'arena',
      rng: mulberry32(opts.seed == null ? (Date.now() & 0x7fffffff) : opts.seed),
      W: D.W, H: D.H, t: 0, elapsed: 0, over: false, matchOver: false,
      fighters: [], projectiles: [], pickups: [], traps: [], trapTimer: 8, xpSpawnT: 6, particles: [], texts: [], effects: [],
      obstacles: D.obstacles.map(function (o) { return Object.assign({}, o); }).concat([
      { kind: 'table', type: 'rect', x: Math.round(760 * SPAWN_SCALE), y: Math.round(430 * SPAWN_SCALE), w: Math.round(240 * SPAWN_SCALE), h: Math.round(120 * SPAWN_SCALE) },
      { kind: 'chair', type: 'rect', x: Math.round(400 * SPAWN_SCALE), y: Math.round(760 * SPAWN_SCALE), w: Math.round(100 * SPAWN_SCALE), h: Math.round(100 * SPAWN_SCALE) },
      { kind: 'bookshelf', type: 'rect', x: Math.round(1420 * SPAWN_SCALE), y: Math.round(700 * SPAWN_SCALE), w: Math.round(90 * SPAWN_SCALE), h: Math.round(260 * SPAWN_SCALE) },
      { kind: 'table', type: 'rect', x: Math.round(980 * SPAWN_SCALE), y: Math.round(980 * SPAWN_SCALE), w: Math.round(260 * SPAWN_SCALE), h: Math.round(110 * SPAWN_SCALE) },
      { kind: 'chair', type: 'rect', x: Math.round(160 * SPAWN_SCALE), y: Math.round(260 * SPAWN_SCALE), w: Math.round(110 * SPAWN_SCALE), h: Math.round(110 * SPAWN_SCALE) },
      { kind: 'table', type: 'rect', x: Math.round(1180 * SPAWN_SCALE), y: Math.round(380 * SPAWN_SCALE), w: Math.round(180 * SPAWN_SCALE), h: Math.round(90 * SPAWN_SCALE) },
      { kind: 'chair', type: 'rect', x: Math.round(700 * SPAWN_SCALE), y: Math.round(1080 * SPAWN_SCALE), w: Math.round(100 * SPAWN_SCALE), h: Math.round(100 * SPAWN_SCALE) }
    ]),
      cam: { x: D.W / 2, y: D.H / 2 }, shake: 0,
      events: [], timeLimit: TIME_LIMIT, killsToWin: KILLS_TO_WIN,
      endReason: '', ranking: [], winner: null
    };

    const chars = D.characters.slice();
    const playerChar = chars.find(c => c.id === opts.charId) || chars[0];
    const f0 = makeFighter(g, 0, playerChar, playerChar.name, false, 0);
    g.fighters.push(f0);
    g.player = f0;
    g.stats = f0.stats;

    const others = shuffle(g, chars.filter(c => c.id !== playerChar.id).slice());
    for (let i = 0; i < 5; i++) {
      const ch = others[i % others.length];
      g.fighters.push(makeFighter(g, i + 1, ch, BOT_NAMES[i], true, i + 1));
    }

    g.cam.x = f0.x; g.cam.y = f0.y;
    return g;
  };

  /* ---------------- 伤害 / 死亡 ---------------- */
  function elemOf(f) { return f && f.char && f.char.element; }

  function damageFighter(g, v, dmg, attacker, crit) {
    if (!v.alive || v.invuln > 0) return;
    const slots = attacker && attacker.elemSlots ? attacker.elemSlots.filter(Boolean) : [];
    const e2 = slots[0] || elemOf(attacker);
    if (e2 && attacker !== v && v.element && (v.elemT || 0) > 0 && !(v.reactCd > 0)) {
      const pair = [v.element, e2].sort().join('+');
      const fu = (TJ.DATA.fusions || {})[pair];
      if (fu) {
        v.reactCd = 2.5;
        H.addText(g, v.x, v.y - v.r - 26, fu.name, '#FFE08A', 20);
        if (fu.kind === 'burst') dmg *= 1.6;
        else if (fu.kind === 'freeze') v.freezeT = Math.max(v.freezeT || 0, 0.8);
        else if (fu.kind === 'crit') { if (g.rng() < 0.3) dmg *= 2; }
        else if (fu.kind === 'chain' || fu.kind === 'aoe') {
          const rad = fu.kind === 'aoe' ? 170 : 150;
          for (const n of g.fighters) {
            if (n === v || !n.alive || n.invuln > 0) continue;
            if (Math.hypot(n.x - v.x, n.y - v.y) > rad) continue;
            n.hp -= fu.kind === 'aoe' ? 18 : 12;
            n.hitFlash = 0.12;
            if (n.hp <= 0) killFighter(g, n, attacker);
          }
        }
        else if (fu.kind === 'leech' || fu.kind === 'heal') {
          if (attacker && attacker.alive) attacker.hp = Math.min(attacker.maxHp, attacker.hp + attacker.maxHp * (fu.kind === 'leech' ? 0.12 : 0.02));
        }
        else if (fu.kind === 'splash') {
          for (const n of g.fighters) {
            if (n === v || !n.alive) continue;
            if (Math.hypot(n.x - v.x, n.y - v.y) > 90) continue;
            n.hp -= dmg * 0.3;
            if (n.hp <= 0) killFighter(g, n, attacker);
          }
        }
        else if (fu.kind === 'debuff') { v.slowT = Math.max(v.slowT || 0, 2.5); dmg *= 1.1; }
        else if (fu.kind === 'dot') { v.vulnT = 3; }
        H.burst(g, v.x, v.y, '#FFE08A', 10, 200, 4);
        H.sfx(g, 'explode');
        g.effects.push({ kind: 'tex', src: 'assets/fx/kenney/magic_03.png', x: v.x, y: v.y, life: 0.4, max: 0.4, s0: 20, s1: 70, alpha: 0.9, rot: rand(g, 0, 6.28), spin: 2 });
        if (TJ.fx) { TJ.fx.flash(g, '#FFE08A'); TJ.fx.shake(g, 5); }
      }
      if (slots.length > 1) dmg *= 1.1;
    }
    if (e2) { v.element = e2; v.elemT = 3; }
    if (attacker && attacker.slowHit) v.slowT = Math.max(v.slowT || 0, 1.5);
    if (v.vulnT > 0) dmg *= 1.1;
    if (v.shield > 0) {
      v.shield--; v.shieldCd = 9; v.hitFlash = 0.1;
      g.effects.push({ kind: 'ring', x: v.x, y: v.y, r: 12, maxR: 70, life: 0.3, max: 0.3, color: '#7FD1FF' });
      H.sfx(g, 'shield');
      return;
    }
    if (attacker && attacker !== v) { attacker.dmgDealt = (attacker.dmgDealt || 0) + dmg; attacker.hits = (attacker.hits || 0) + 1; }
    v.dmgTaken = (v.dmgTaken || 0) + dmg;
    v.hp -= dmg;
    v.invuln = Math.max(v.invuln, 0.12);
    v.hitFlash = 0.16;
    H.addText(g, v.x + rand(g, -8, 8), v.y - v.r - 8, Math.round(dmg), crit ? '#FFD34D' : '#FFFFFF', crit ? 22 : 16);
    H.burst(g, v.x, v.y, crit ? '#FFD34D' : '#FFB4A2', crit ? 7 : 3, 140, 3);
    if (attacker && attacker !== v) {
      if (v.hp <= 0) killFighter(g, v, attacker);
      else H.sfx(g, 'hit');
    } else if (v.hp <= 0) killFighter(g, v, null);
  }

  function killFighter(g, v, killer) {
    if (!v.alive) return;
    v.alive = false;
    v.deaths++;
    v.lives--;
    v.hp = 0;
    v.respawnT = RESPAWN_TIME;
    g.hitStop = 0.05;
    if (killer && killer.char && killer.char.talent && killer.char.talent.healKill) {
      killer.hp = Math.min(killer.maxHp, killer.hp + killer.maxHp * killer.char.talent.healKill);
    }
    H.burst(g, v.x, v.y, v.char.fur, 20, 300, 5);
    g.effects.push({ kind: 'spark', x: v.x, y: v.y, life: 0.35, max: 0.35, color: v.color || v.char.fur, n: 12, r1: 46, width: 3, rot: rand(g, 0, 6.28) });
    if (TJ.fx) TJ.fx.flash(g, v.color || '#FFF6E0');
    g.effects.push({ kind: 'tex', src: 'assets/fx/kenney/flame_03.png', x: v.x, y: v.y, life: 0.32, max: 0.32, s0: 14, s1: 46, rot: rand(g, 0, 6.28), spin: 1.4 });
    g.effects.push({ kind: 'tex', src: 'assets/fx/kenney/smoke_01.png', x: v.x, y: v.y, life: 0.5, max: 0.5, s0: 18, s1: 60, alpha: 0.55 });
    g.effects.push({ kind: 'ring', x: v.x, y: v.y, r: 8, maxR: 90, life: 0.4, max: 0.4, color: v.color });

    if (killer && killer !== v) {
      killer.kills++;
      addXp(g, killer, 12);
      if (killer === g.player) H.sfx(g, 'kill');
    }

    // 掉落经验球与回血
    for (let i = 0; i < 5; i++) {
      g.pickups.push({
        kind: 'xp', x: v.x + rand(g, -16, 16), y: v.y + rand(g, -16, 16),
        vx: rand(g, -90, 90), vy: rand(g, -90, 90), r: 7, value: 4, life: 22, pull: false
      });
    }
    if (g.rng() < 0.35) {
      g.pickups.push({ kind: 'heart', x: v.x, y: v.y, vx: 0, vy: 0, r: 11, value: 25, life: 22, pull: false });
    if (g.rng() < 0.15) {
      const pool = ['item_shield', 'item_invis', 'item_farsight', 'item_growth', 'item_random'];
      g.pickups.push({ kind: pool[Math.floor(g.rng() * pool.length)], x: v.x, y: v.y, vx: 0, vy: 0, r: 13, value: 0, life: 22, pull: false });
    }
    }

    g.events.push({ type: 'kill', killer: killer ? killer.name : '', victim: v.name, color: killer ? killer.color : '#fff' });

    if (v.lives <= 0) {
      v.eliminated = true;
      g.events.push({ type: 'eliminated', name: v.name });
      if (v === g.player) endMatch(g, '你被淘汰了');
    }
    if (killer && killer.kills >= g.killsToWin) endMatch(g, killer.name + ' 达成 ' + g.killsToWin + ' 杀');
  }

  function endMatch(g, reason) {
    if (g.matchOver) return;
    g.matchOver = true;
    g.over = true;
    g.endReason = reason;
    // 淘汰者排在存活者之后，再比击杀
    g.ranking = g.fighters.slice().sort(function (a, b) {
      const ea = a.eliminated ? 1 : 0, eb = b.eliminated ? 1 : 0;
      if (ea !== eb) return ea - eb;
      if (b.kills !== a.kills) return b.kills - a.kills;
      if (a.deaths !== b.deaths) return a.deaths - b.deaths;
      return b.level - a.level;
    });
    g.winner = g.ranking[0];
    H.sfx(g, 'bossdown');
    g.shake = 10;
  }

  /* ---------------- 经验 / 升级 ---------------- */
  function addXp(g, f, v) {
    f.xp += v;
    while (f.xp >= f.xpNeed) {
      f.xp -= f.xpNeed;
      f.level++;
      f.pendingLevels++;
      f.xpNeed = Math.round(f.xpNeed * 1.24 + 3);
      f.hp = Math.min(f.maxHp, f.hp + 8);
      H.sfx(g, 'levelup');
      g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 10, maxR: 90, life: 0.45, max: 0.45, color: f.color });
    }
  }

  TJ.getArenaChoices = function (g, f) {
    if (f.weaponLv === 4 && !f.evolved) {
      const KIND_EVO = { orbit: '大铁锤', ranged: '咸鱼' };
      const wk = TJ.DATA.weapons[f.weapon].kind;
      const table = (TJ.DATA.evolutions || {})[TJ.DATA.weapons[f.weapon].name] || (TJ.DATA.evolutions || {})[KIND_EVO[wk]];
      if (table) {
        return table.map(function (e, i) {
          return { key: 'evo:' + i, kind: 'evo', icon: '进', iconImg: TJ.DATA.weapons[f.weapon].iconImg, name: '进化 · ' + e.name, desc: e.desc, rarity: 'epic', stack: '5 / 5' };
        });
      }
      return [
        { key: 'evo:power', kind: 'evo', icon: '攻', name: '进化 · 强攻', desc: '武器伤害 +30%，进入终极形态', rarity: 'epic', stack: '5 / 5' },
        { key: 'evo:haste', kind: 'evo', icon: '速', name: '进化 · 疾速', desc: '武器冷却 -22%，进入终极形态', rarity: 'epic', stack: '5 / 5' }
      ];
    }
    if ((f.level === 3 || f.level === 6) && !f.subWeapon) {
      const others = shuffle(g, Object.keys(TJ.DATA.weapons).filter(function (k) { return k !== f.weapon; }));
      const cards = others.slice(0, 2).map(function (k) {
        const w = TJ.DATA.weapons[k];
        return { key: 'sub:' + k, kind: 'sub', icon: '副', iconImg: w.iconImg, name: '副武器 · ' + w.name, desc: '自动攻击，独立冷却', rarity: 'epic', stack: '' };
      });
      if (cards.length === 2) return cards;
    }
    const out = [];
    const w = D.weapons[f.weapon];
    if (f.weaponLv < 5) {
      out.push({
        key: 'up:' + f.weapon, kind: 'weapon_up', weapon: f.weapon, icon: w.icon,
        name: w.name + ' · 进化',
        desc: '伤害 +15% · 冷却 -4%' + (f.weaponLv + 1 === 3 ? ' · 解锁武器特性' : '') + (f.weaponLv + 1 === 5 ? ' · 终极形态' : ''),
        rarity: f.weaponLv >= 3 ? 'epic' : 'rare',
        stack: f.weaponLv + ' / 5'
      });
    }
    const others = shuffle(g, Object.keys(D.weapons).filter(k => k !== f.weapon));
    for (const k of others.slice(0, 2)) {
      const ww = D.weapons[k];
      out.push({
        key: 'sw:' + k, kind: 'switch', weapon: k, icon: ww.icon,
        name: '换 · ' + ww.name, desc: '切换武器，保留该武器已有的进化等级',
        rarity: 'common', stack: '已解锁 ' + (f.weaponLevels[k] || 1) + ' 级'
      });
    }
    const wk = TJ.DATA.weapons[f.weapon].kind;
    const ORBIT_ONLY = { orbitN: 1, orbitR: 1 };
    const RANGED_ONLY = { multishot: 1, pierce: 1, bounce: 1, velocity: 1, explode: 1, homing: 1, crit: 1, critdmg: 1 };
    const pool = shuffle(g, D.upgrades.filter(u => u.id !== 'infuse1' && u.id !== 'infuse2' && (f.upgradeCounts[u.id] || 0) < u.max
      && !(ORBIT_ONLY[u.id] && wk !== 'orbit')
      && !(RANGED_ONLY[u.id] && wk !== 'ranged')));
    for (const u of pool.slice(0, 3)) {
      out.push({
        key: 'st:' + u.id, kind: 'stat', icon: u.icon, name: u.name, desc: u.desc,
        rarity: u.rarity, stack: (f.upgradeCounts[u.id] || 0) + ' / ' + u.max,
        up: u
      });
    }
    // 固定结构：进化（或换武器）+ 换武器 + 属性，保证玩家能明确选择路线
    const picks = [];
    const evo = out.find(c => c.kind === 'weapon_up');
    const switches = out.filter(c => c.kind === 'switch');
    const stats = out.filter(c => c.kind === 'stat');
    if (evo) picks.push(evo);
    if (switches.length) picks.push(switches[Math.floor(g.rng() * switches.length)]);
    else if (!evo && switches.length === 0) {
      // 武器满级且没有可换武器时，补属性
    }
    if (stats.length) picks.push(stats[Math.floor(g.rng() * stats.length)]);
    const rest = out.filter(c => picks.indexOf(c) < 0);
    while (picks.length < 3 && rest.length) {
      picks.push(rest.splice(Math.floor(g.rng() * rest.length), 1)[0]);
    }
    return shuffle(g, picks);
  };

  TJ.debugHit = function (g, a, b, d) { damageFighter(g, b, d, a, false); };

  TJ.useItem = function (g, f) {
    if (!f || !f.item) return false;
    const k = f.item;
    f.item = null;
    const t = function (x, y, s, c) { H.addText(g, x, y, s, c, 18); };
    if (k === 'shield') { f.invuln = Math.max(f.invuln, 3); f.shieldT = 3; t(f.x, f.y - 36, '护盾', '#7FD1FF'); }
    else if (k === 'invis') { f.invisT = 3; t(f.x, f.y - 36, '隐身', '#B9A7FF'); }
    else if (k === 'farsight') { f.farsightT = 6; t(f.x, f.y - 36, '远视', '#FFE08A'); }
    else if (k === 'growth') { f.growthT = 8; t(f.x, f.y - 36, '变大', '#FF9A3C'); }
    else {
      const pool = ['shield', 'invis', 'farsight', 'growth'];
      const pick = pool[Math.floor(g.rng() * pool.length)];
      f.item = pick;
      return TJ.useItem(g, f);
    }
    H.sfx(g, 'coin');
    g.events.push({ type: 'useitem', item: k });
    return true;
  };

  TJ.applyArenaChoice = function (g, f, key) {
    if (key.indexOf('up:') === 0) {
      f.weaponLv = Math.min(5, f.weaponLv + 1);
      f.weaponLevels[f.weapon] = f.weaponLv;
    } else if (key.indexOf('sw:') === 0) {
      const id = key.slice(3);
      if (!D.weapons[id]) return;
      f.weapon = id;
      f.weaponLv = f.weaponLevels[id] || 1;
      f.weaponLevels[id] = f.weaponLv;
    } else if (key.indexOf('evo:') === 0) {
      const code = key.slice(4);
      const KIND_EVO2 = { orbit: '大铁锤', ranged: '咸鱼' };
      const wk2 = TJ.DATA.weapons[f.weapon].kind;
      const table = (TJ.DATA.evolutions || {})[TJ.DATA.weapons[f.weapon].name] || (TJ.DATA.evolutions || {})[KIND_EVO2[wk2]];
      if (table && table[Number(code)]) {
        const e = table[Number(code)].effect || {};
        f.evoDmg = e.dmg || 1;
        f.evoCd = e.cd || 1;
        f.evoSplash = e.splash || 0;
        f.evoPierce = e.pierce || 0;
        f.evoBounce = e.bounce || 0;
        if (e.turret) f.turret = 1;
        if (e.heavy) f.heavy = 1;
        if (e.slowHit) f.slowHit = 1;
        if (e.beamSplit) f.beamSplit = 1;
        if (e.chainPlus) f.chainPlus = e.chainPlus;
        if (e.chainDecay) f.chainDecay = e.chainDecay;
        if (e.orbitMul) f.orbitMul = e.orbitMul;
        if (e.hitCdAdd) f.orbitCdAdd = e.hitCdAdd;
        if (e.orbitN) f.orbitBonus = (f.orbitBonus || 0) + e.orbitN;
        if (e.orbitR) f.orbitRBonus = (f.orbitRBonus || 0) + e.orbitR;
        f.evolved = 'evo' + code;
      } else {
        f.evolved = code;
        if (code === 'power') f.evoDmg = 1.3;
        else f.evoCd = 0.78;
      }
      f.weaponLv = 5;
      f.weaponLevels[f.weapon] = 5;
    } else if (key.indexOf('sub:') === 0) {
      const id = key.slice(4);
      if (TJ.DATA.weapons[id]) { f.subWeapon = id; f.subCd = 0.6; }
    } else if (key.indexOf('st:') === 0) {
      const id = key.slice(3);
      const u = D.upgrades.find(x => x.id === id);
      if (!u) return;
      f.upgradeCounts[id] = (f.upgradeCounts[id] || 0) + 1;
      const before = f.maxHp;
      u.apply(f.stats, g);
      f.maxHp = f.baseHp + f.stats.maxHp;
      if (f.maxHp > before) f.hp += f.maxHp - before;
      if (f.stats.shieldMax > 0 && f.shield === 0 && f.shieldCd <= 0) f.shield = 1;
    }
    if (f.pendingLevels > 0) f.pendingLevels--;
    g.events.push({ type: 'upgrade' });
  };

  function botLevelUp(g, f) {
    while (f.pendingLevels > 0) {
      const choices = TJ.getArenaChoices(g, f);
      if (!choices.length) { f.pendingLevels = 0; break; }
      let pick = choices[0];
      const up = choices.find(c => c.kind === 'weapon_up');
      const stat = choices.find(c => c.kind === 'stat' && (c.key === 'st:power' || c.key === 'st:haste' || c.key === 'st:vitality'));
      if (up && f.weaponLv < 3 && g.rng() < 0.6) pick = up;
      else if (stat && g.rng() < 0.5) pick = stat;
      else pick = choices[Math.floor(g.rng() * choices.length)];
      TJ.applyArenaChoice(g, f, pick.key);
    }
  }

  /* ---------------- 开火 ---------------- */
  function fireAt(g, f, target) {
    if (TJ.DATA.weapons[f.weapon].kind === 'orbit') return;
    const w = D.weapons[f.weapon];
    const s = f.stats;
    const lv = f.weaponLv;
    let ang = Math.atan2(target.y - f.y, target.x - f.x);
    if (f.isBot) ang += rand(g, -0.085, 0.085);
    f.aim = ang;
    f.facing = ang;

    let heavyMul = 1;
    if (f.heavy) { f.hitCount = (f.hitCount || 0) + 1; if (f.hitCount % 3 === 0) heavyMul = 2.2; }
    const dmgMul = (1 + 0.15 * (lv - 1)) * 1.2 * (f.isBot ? 0.65 : 1) * (f.evoDmg || 1) * (f.growthT > 0 ? 1.25 : 1) * (f.farsightT > 0 ? 1.15 : 1) * heavyMul;

    if (w.kind === 'melee') {
      const range = w.range + s.range * 0.25 + (lv >= 3 ? 24 : 0) + (lv >= 5 ? 18 : 0) + (f.farsightT > 0 ? 60 : 0);
      const arc = w.arc;
      for (const e of g.fighters) {
        if (e === f || !e.alive) continue;
        const d = Math.hypot(e.x - f.x, e.y - f.y);
        if (d > range + e.r) continue;
        let da = Math.atan2(e.y - f.y, e.x - f.x) - ang;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        if (Math.abs(da) > arc / 2) continue;
        const crit = g.rng() < s.crit;
        damageFighter(g, e, w.dmg * s.damage * dmgMul * (crit ? s.critMul : 1), f, crit);
      }
      for (const pr of g.projectiles) {
        if (pr.ownerId === f.id) continue;
        const d = Math.hypot(pr.x - f.x, pr.y - f.y);
        let da = Math.atan2(pr.y - f.y, pr.x - f.x) - ang;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        if (d < range && Math.abs(da) < arc / 2) pr.dead = true;
      }
      g.effects.push({ kind: 'slash', x: f.x, y: f.y, ang, range, arc, life: 0.22, max: 0.22 });
      H.sfx(g, 'slash');
      f.fireCd = w.cd * (1 - 0.04 * (lv - 1)) / s.fireRate;
      return;
    }

    if (w.kind === 'beam') {
      const len = w.range + s.range;
      const half = (w.width || 24) / 2;
      const dx = Math.cos(ang), dy = Math.sin(ang);
      for (const e of g.fighters) {
        if (e === f || !e.alive) continue;
        const ex = e.x - f.x, ey = e.y - f.y;
        const t = ex * dx + ey * dy;
        if (t < 0 || t > len) continue;
        if (Math.hypot(ex - dx * t, ey - dy * t) <= half + e.r) damageFighter(g, e, w.dmg * s.damage * dmgMul, f, false);
      }
      if (f.beamSplit) {
        for (const off of [-Math.PI / 4, Math.PI / 4]) {
          const a2 = ang + off, dx2 = Math.cos(a2), dy2 = Math.sin(a2);
          const len2 = len * 0.6;
          for (const e of g.fighters) {
            if (e === f || !e.alive) continue;
            const ex = e.x - f.x, ey = e.y - f.y;
            const t = ex * dx2 + ey * dy2;
            if (t < 0 || t > len2) continue;
            if (Math.hypot(ex - dx2 * t, ey - dy2 * t) <= half + e.r) damageFighter(g, e, w.dmg * s.damage * dmgMul * 0.6, f, false);
          }
          g.effects.push({ kind: 'beam', x: f.x, y: f.y, ang: a2, len: len2, life: 0.18, max: 0.18, color: w.color });
        }
      }
      g.effects.push({ kind: 'beam', x: f.x, y: f.y, ang: ang, len: len, life: 0.18, max: 0.18, color: w.color });
      H.sfx(g, 'shoot');
      f.fireCd = w.cd / s.fireRate;
      return;
    }
    if (w.kind === 'chain') {
      let cur = target, dmg = w.dmg * s.damage * dmgMul;
      const hit = {}, pts = [{ x: f.x, y: f.y }];
      const jumpsN = (w.jumps || 3) + (f.chainPlus || 0);
      for (let i = 0; i < jumpsN && cur; i++) {
        hit[cur.id] = 1;
        pts.push({ x: cur.x, y: cur.y });
        damageFighter(g, cur, dmg, f, false);
        dmg *= (f.chainDecay || 0.82);
        let nxt = null, nd = 300;
        for (const e of g.fighters) {
          if (e === f || !e.alive || hit[e.id]) continue;
          const d = Math.hypot(e.x - cur.x, e.y - cur.y);
          if (d < nd) { nd = d; nxt = e; }
        }
        cur = nxt;
      }
      g.effects.push({ kind: 'chain', pts: pts, life: 0.24, max: 0.24, color: w.color });
      H.sfx(g, 'shoot');
      f.fireCd = w.cd / s.fireRate;
      return;
    }

    let count = 1 + s.multishot;
    if (lv >= 5 && (w.proj === 'plate' || w.proj === 'rocket')) count++;
    const spread = 0.10;
    for (let i = 0; i < count; i++) {
      const a = ang + (i - (count - 1) / 2) * spread + rand(g, -0.02, 0.02);
      const crit = g.rng() < s.crit;
      let pierce = s.pierce + (w.pierce || 0);
      let bounce = Math.max(s.bounce, w.bounce || 0);
      let splash = w.splash || 0;
      if (w.proj === 'arrow' && lv >= 3) pierce++;
      if (w.proj === 'fork' && lv >= 3) pierce++;
      if (w.proj === 'plate' && lv >= 3) bounce++;
      if (w.proj === 'rocket' && lv >= 3) splash += 30;
      splash += f.evoSplash || 0;
      pierce += f.evoPierce || 0;
      bounce += f.evoBounce || 0;
      let speed = w.speed * s.projSpeed * (w.proj === 'arrow' && lv >= 5 ? 1.2 : 1) * (f.turret ? 0.7 : 1);
      f.shots = (f.shots || 0) + 1;
      g.projectiles.push({
        x: f.x + Math.cos(a) * (f.r + 8), y: f.y + Math.sin(a) * (f.r + 8),
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
        r: w.proj === 'rocket' ? 9 : 7,
        dmg: w.dmg * s.damage * dmgMul * (crit ? s.critMul : 1),
        crit, pierce, bounce,
        homing: s.homing || (w.homing || 0), splash,
        kind: w.proj, from: 'player', ownerId: f.id, tint: f.color,
        life: 1.5 + s.range / 1200 + (f.farsightT > 0 ? 0.35 : 0), hit: {},
        explodeOnDeath: !!splash,
        ang: a
      });
    }
    H.sfx(g, w.proj === 'rocket' ? 'rocket' : 'shoot');
    f.fireCd = w.cd * (1 - 0.04 * (lv - 1)) / s.fireRate;
  }

  function explode(g, x, y, radius, dmg, owner) {
    g.effects.push({ kind: 'ring', x, y, r: 10, maxR: radius, life: 0.3, max: 0.3, color: '#FFB347' });
    H.burst(g, x, y, '#FF9A3C', 14, 300, 5);
    g.shake = Math.max(g.shake, 5);
    for (const e of g.fighters) {
      if (!e.alive || e === owner) continue;
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < radius + e.r) damageFighter(g, e, dmg * (1 - 0.4 * d / (radius + e.r)), owner, false);
    }
    H.sfx(g, 'explode');
  }

  /* ---------------- 更新 ---------------- */
  function nearestFighter(g, f, maxDist) {
    let best = null, bd = maxDist * maxDist;
    for (const e of g.fighters) {
      if (e === f || !e.alive || e.invisT > 0) continue;
      const d = (e.x - f.x) ** 2 + (e.y - f.y) ** 2;
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  TJ.botInput = botInput;

  function updateFighter(g, f, dt, inp) {
    f.invuln = Math.max(0, f.invuln - dt);
    f.hitFlash = Math.max(0, f.hitFlash - dt);
    f.fireCd -= dt;
    f.dashCd = Math.max(0, f.dashCd - dt);

    if (f.stats.shieldMax > 0 && f.shield < f.stats.shieldMax && f.shieldCd > 0) {
      f.shieldCd -= dt;
      if (f.shieldCd <= 0) f.shield = Math.min(f.stats.shieldMax, f.shield + 1);
    }

    let mx = inp.moveX || 0, my = inp.moveY || 0;
    if ((f.rootT || 0) > 0 || (f.freezeT || 0) > 0 || (f.stunT || 0) > 0) { mx = 0; my = 0; }
    const ml = Math.hypot(mx, my);
    if (ml > 1) { mx /= ml; my /= ml; }
    f.moving = ml > 0.05;

    f.skillCd = Math.max(0, f.skillCd - dt);
    f.hasteT = Math.max(0, f.hasteT - dt);
    f.invisT = Math.max(0, (f.invisT || 0) - dt);
    f.farsightT = Math.max(0, (f.farsightT || 0) - dt);
    f.growthT = Math.max(0, (f.growthT || 0) - dt);
    f.shieldT = Math.max(0, (f.shieldT || 0) - dt);
    f.vulnT = Math.max(0, (f.vulnT || 0) - dt);
    if (f.char.talent && f.char.talent.regen && f.alive) f.hp = Math.min(f.maxHp, f.hp + f.maxHp * f.char.talent.regen * dt);
    f.stillT = (inp.moveX || inp.moveY) ? 0 : (f.stillT || 0) + dt;
    f.elemT = Math.max(0, (f.elemT || 0) - dt);
    f.reactCd = Math.max(0, (f.reactCd || 0) - dt);
    f.rootT = Math.max(0, (f.rootT || 0) - dt);
    f.freezeT = Math.max(0, (f.freezeT || 0) - dt);
    f.stunT = Math.max(0, (f.stunT || 0) - dt);
    const noMove = f.rootT > 0 || f.freezeT > 0 || f.stunT > 0;
    const noFire = f.freezeT > 0 || f.stunT > 0;
    const ow = TJ.DATA.weapons[f.weapon];
    if (ow.kind === 'orbit') {
      f.orbitA = (f.orbitA || 0) + dt * 3.4;
      f.orbitBonus = f.stats.orbitBonus || 0; f.orbitRBonus = f.stats.orbitRBonus || 0;
      const on = (ow.orbitN || 2) + (f.orbitBonus || 0);
      const orad = ((ow.orbitR || 78) + 8 + (f.orbitRBonus || 0)) * (f.orbitMul || 1);
      for (const e of g.fighters) {
        if (e === f || !e.alive) continue;
        e.orbitCd = Math.max(0, (e.orbitCd || 0) - dt);
        if (e.orbitCd > 0) continue;
        for (let i = 0; i < on; i++) {
          const a = f.orbitA + i * Math.PI * 2 / on;
          const ox = f.x + Math.cos(a) * orad;
          const oy = f.y + Math.sin(a) * orad;
          if (Math.hypot(e.x - ox, e.y - oy) < e.r + 16) {
            damageFighter(g, e, ow.dmg * 1.2 * f.stats.damage * (f.stats.orbitDmgMul || 1), f, false);
            f.hp = Math.min(f.maxHp, f.hp + f.maxHp * 0.008);
            if (g.rng() < 0.4) H.sfx(g, 'hit');
            e.orbitCd = ((ow.hitCd || 0.45) + (f.orbitCdAdd || 0)) / (f.stats.fireRate || 1);
            g.effects.push({ kind: 'ring', x: ox, y: oy, r: 6, maxR: 24, life: 0.18, max: 0.18, color: '#FFE08A' });
            break;
          }
        }
      }
    }
    f.stealthT = Math.max(0, (f.stealthT || 0) - dt);
    f.slowT = Math.max(0, (f.slowT || 0) - dt);
    if (inp.dash && f.skillCd <= 0 && f.skill) {
      if (TJ.skills.use(g, f, true)) f.skillCd = f.skill.cd * (f.stats.skillCdMul || 1);
    }

    if (f.dashT > 0) {
      f.dashT -= dt;
      f.x += f.dashX * 880 * dt;
      f.y += f.dashY * 880 * dt;
      if (f.stats.dashDamage > 0) {
        for (const e of g.fighters) {
          if (e === f || !e.alive || f.dashHits[e.id]) continue;
          if (Math.hypot(e.x - f.x, e.y - f.y) < e.r + f.r + 6) {
            f.dashHits[e.id] = 1;
            damageFighter(g, e, f.stats.dashDamage, f, false);
          }
        }
      }
    } else {
      const hs = (f.hasteT > 0 ? (f.hasteMul || 1.5) : 1) * (f.slowT > 0 ? 0.5 : 1) * (f.stealthT > 0 ? 1.25 : 1);
      f.x += mx * f.char.speed * f.stats.speed * hs * dt;
      f.y += my * f.char.speed * f.stats.speed * hs * dt;
    }

    H.resolveObstacles(g, f, f.r);
    if (f.isBot) {
      for (const tr of g.traps) {
        const dd = Math.hypot(f.x - tr.x, f.y - tr.y);
        if (dd < 80 && dd > 1) {
          f.x += (f.x - tr.x) / dd * 90 * dt;
          f.y += (f.y - tr.y) / dd * 90 * dt;
        }
      }
      H.resolveObstacles(g, f, f.r);
    }
    if (f.moving) f.walk += dt * 11 * f.stats.speed;

    const target = nearestFighter(g, f, D.weapons[f.weapon].range + f.stats.range + (f.farsightT > 0 ? 160 : 0));
    f.target = target;
    if (target) {
      const a = Math.atan2(target.y - f.y, target.x - f.x);
      f.aim = a;
      if (!f.moving) f.facing = a;
      if (f.subWeapon) {
      const sw = TJ.DATA.weapons[f.subWeapon];
      f.subCd = Math.max(0, (f.subCd || 0) - dt);
      const st2 = nearestFighter(g, f, (sw.range || 700) + f.stats.range);
      if (sw.kind === 'orbit') {
        f.subOrbitA = (f.subOrbitA || 0) + dt * 3.8;
        const sr = (sw.orbitR || 78) - 26;
        for (const e of g.fighters) {
          if (e === f || !e.alive || (e.subOrbitCd || 0) > g.t) continue;
          const ox = f.x + Math.cos(f.subOrbitA) * sr;
          const oy = f.y + Math.sin(f.subOrbitA) * sr;
          if (Math.hypot(e.x - ox, e.y - oy) < e.r + 14) {
            damageFighter(g, e, sw.dmg * f.stats.damage * 0.6, f, false);
            e.subOrbitCd = g.t + 0.4;
          }
        }
      } else if (st2 && f.subCd <= 0) {
        const oldW = f.weapon, oldLv = f.weaponLv, oldCd = f.fireCd;
        f.weapon = f.subWeapon; f.weaponLv = 1; f.fireCd = 0;
        fireAt(g, f, st2);
        f.weapon = oldW; f.weaponLv = oldLv; f.fireCd = oldCd;
        f.subCd = (sw.cd || 1) * 1.2;
      }
    }
    if (f.isBot && f.item && (f.hp < f.maxHp * 0.6 || g.rng() < 0.004)) TJ.useItem(g, f);
    if (!((f.freezeT || 0) > 0 || (f.stunT || 0) > 0) && f.fireCd <= 0) {
      fireAt(g, f, target);
      if (f.evoCd) f.fireCd *= f.evoCd;
      if (f.turret && f.stillT > 0.8) f.fireCd *= 0.5;
      if (f.heavy) f.fireCd *= 1.15;
    }
    } else if (f.moving) {
      f.aim = Math.atan2(my, mx);
    }
    if (f.moving) f.facing = f.aim;
  }

  function botInput(g, f) {
    // 供无头模拟复用
    const target = nearestFighter(g, f, 2000);
    let x = 0, y = 0, dash = false;
    if (target) {
      const dx = target.x - f.x, dy = target.y - f.y;
      const d = Math.max(0.001, Math.hypot(dx, dy));
      const ux = dx / d, uy = dy / d;
      const wk = TJ.DATA.weapons[f.weapon] ? TJ.DATA.weapons[f.weapon].kind : 'ranged';
      let ideal = (wk === 'orbit' || wk === 'melee') ? 70 : (wk === 'beam' ? 260 : 330);
      if (f.persona === 'aggr') ideal -= 45;
      else if (f.persona === 'collect') ideal += 45;
      else ideal += 15;
      if (ideal < 55) ideal = 55;
      if (d < ideal - 60) { x = -ux; y = -uy; }
      else if (d > ideal + 90) { x = ux; y = uy; }
      else { x = -uy * 0.9 + ux * 0.2; y = ux * 0.9 + uy * 0.2; }
      const dashChance = f.persona === 'aggr' ? 0.12 : 0.04;
      if (f.hp < f.maxHp * 0.3 && f.dashCd <= 0 && d < 260 && g.rng() < dashChance) dash = true;
    } else {
      let bx = 0, by = 0, bd = 1e9;
      for (const q of g.pickups) {
        const d = Math.hypot(q.x - f.x, q.y - f.y);
        if (d < bd) { bd = d; bx = q.x; by = q.y; }
      }
      if (bd < 700) { x = (bx - f.x) / bd; y = (by - f.y) / bd; }
      else { x = Math.cos(g.t * 0.5 + f.id); y = Math.sin(g.t * 0.5 + f.id); }
    }
    const m = 220;
    if (f.x < m) x += 1.2; else if (f.x > g.W - m) x -= 1.2;
    if (f.y < m) y += 1.2; else if (f.y > g.H - m) y -= 1.2;
    const len = Math.hypot(x, y) || 1;
    return { moveX: x / len, moveY: y / len, dash };
  }

  function respawn(g, f) {
    let best = SPAWNS[0], bd = -1;
    for (const s of SPAWNS) {
      let d = 1e9;
      for (const o of g.fighters) {
        if (o === f || !o.alive) continue;
        d = Math.min(d, Math.hypot(o.x - s[0], o.y - s[1]));
      }
      if (d > bd) { bd = d; best = s; }
    }
    f.x = best[0] + rand(g, -24, 24);
    f.y = best[1] + rand(g, -24, 24);
    H.resolveObstacles(g, f, f.r);
    f.hp = f.maxHp;
    f.alive = true;
    f.invuln = 2.4;
    f.shield = f.stats.shieldMax > 0 ? 1 : 0;
    f.fireCd = 0.4;
    f.dashT = 0;
    g.effects.push({ kind: 'ring', x: f.x, y: f.y, r: 10, maxR: 70, life: 0.35, max: 0.35, color: f.color });
  }

  function updateProjectiles(g, dt) {
    for (const pr of g.projectiles) {
      if (pr.dead) continue;
      pr.life -= dt;
      if (pr.life <= 0) {
        pr.dead = true;
        if (pr.explodeOnDeath) explode(g, pr.x, pr.y, pr.splash || 80, pr.dmg * 0.8, g.fighters.find(f => f.id === pr.ownerId));
        continue;
      }

      if (pr.homing) {
        const owner = g.fighters.find(f => f.id === pr.ownerId);
        const t = owner ? nearestFighter(g, { x: pr.x, y: pr.y }, 480) : null;
        if (t) {
          const want = Math.atan2(t.y - pr.y, t.x - pr.x);
          const cur = Math.atan2(pr.vy, pr.vx);
          let da = Math.atan2(Math.sin(want - cur), Math.cos(want - cur));
          const na = cur + H.clamp(da, -5 * dt, 5 * dt);
          const sp = Math.hypot(pr.vx, pr.vy);
          pr.vx = Math.cos(na) * sp; pr.vy = Math.sin(na) * sp;
        }
      }

      let hitWall = false, nx = 0, ny = 0;
      for (const o of g.obstacles) {
        if (o.type === 'rect') {
          const cx = H.clamp(pr.x, o.x, o.x + o.w), cy = H.clamp(pr.y, o.y, o.y + o.h);
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
        if (pr.bounce > 0) {
          pr.bounce--;
          const dot = pr.vx * nx + pr.vy * ny;
          pr.vx -= 2 * dot * nx; pr.vy -= 2 * dot * ny;
          pr.x += nx * 4; pr.y += ny * 4;
        } else {
          pr.dead = true;
          if (pr.explodeOnDeath) explode(g, pr.x, pr.y, pr.splash || 80, pr.dmg * 0.8, g.fighters.find(f => f.id === pr.ownerId));
          continue;
        }
      }

      pr.x += pr.vx * dt; pr.y += pr.vy * dt;
      if (pr.x < -120 || pr.x > g.W + 120 || pr.y < -120 || pr.y > g.H + 120) { pr.dead = true; continue; }

      for (const e of g.fighters) {
        if (!e.alive || e.id === pr.ownerId || pr.hit[e.id]) continue;
        if (Math.hypot(e.x - pr.x, e.y - pr.y) < e.r + pr.r) {
          pr.hit[e.id] = 1;
          const owner = g.fighters.find(f => f.id === pr.ownerId) || null;
          damageFighter(g, e, pr.dmg, owner, pr.crit);
          if (pr.explodeOnDeath) explode(g, pr.x, pr.y, pr.splash || 80, pr.dmg * 0.8, owner);
          if (pr.bounce > 0) {
            pr.bounce--;
            const t = nearestFighter(g, { x: pr.x, y: pr.y }, 340);
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
    }
    g.projectiles = g.projectiles.filter(x => !x.dead);
  }

  function updateTraps(g, dt) {
    const free = function (x, y) {
      for (const o of g.obstacles) {
        if (o.type === 'rect' && x > o.x - 22 && x < o.x + o.w + 22 && y > o.y - 22 && y < o.y + o.h + 22) return false;
      }
      return true;
    };
    g.trapTimer = (g.trapTimer == null ? 8 : g.trapTimer) - dt;
    if (g.trapTimer <= 0) {
      g.trapTimer = 12;
      if (g.traps.length < 3) {
        for (let k = 0; k < 12; k++) {
          const x = rand(g, 90, g.W - 90), y = rand(g, 90, g.H - 90);
          if (!free(x, y)) continue;
          const kind = ['clamp', 'ice', 'bottle'][Math.floor(g.rng() * 3)];
          g.traps.push({ kind: kind, x: x, y: y, r: 16, life: 30, arm: 0.8 });
          break;
        }
      }
    }
    for (const tr of g.traps) {
      tr.life -= dt;
      tr.arm -= dt;
      if (tr.life <= 0) { tr.dead = true; continue; }
      if (tr.arm > 0) continue;
      for (const f of g.fighters) {
        if (!f.alive) continue;
        if (Math.hypot(f.x - tr.x, f.y - tr.y) < f.r + tr.r) {
          if (tr.kind === 'clamp') { f.rootT = 2; H.addText(g, f.x, f.y - 36, '夹住!', '#FFB4A2', 18); }
          else if (tr.kind === 'ice') { f.freezeT = 1; H.addText(g, f.x, f.y - 36, '冰冻!', '#9FE7FF', 18); }
          else { f.stunT = 1.5; H.addText(g, f.x, f.y - 36, '眩晕!', '#D9B3FF', 18); }
          tr.dead = true;
          H.sfx(g, 'hit');
          break;
        }
      }
    }
    g.traps = g.traps.filter(x => !x.dead);

    g.xpSpawnT = (g.xpSpawnT == null ? 6 : g.xpSpawnT) - dt;
    if (g.xpSpawnT <= 0) {
      g.xpSpawnT = 8;
      for (let i = 0; i < 2; i++) {
        const x = rand(g, 70, g.W - 70), y = rand(g, 70, g.H - 70);
        if (!free(x, y)) continue;
        g.pickups.push({ kind: 'xp', x: x, y: y, vx: 0, vy: 0, r: 7, value: 2, life: 26, pull: false });
      }
    }
  }

  function updatePickups(g, dt) {
    for (const pk of g.pickups) {
      if (pk.dead) continue;
      pk.life -= dt;
      if (pk.life <= 0) { pk.dead = true; continue; }

      let best = null, bd = 1e9;
      for (const f of g.fighters) {
        if (!f.alive) continue;
        const d = Math.hypot(f.x - pk.x, f.y - pk.y);
        if (d < bd) { bd = d; best = f; }
      }
      if (best && (pk.pull || bd < best.stats.magnet)) {
        pk.pull = true;
        const dx = best.x - pk.x, dy = best.y - pk.y;
        const d = Math.hypot(dx, dy) || 1;
        const sp = 280 + (best.stats.magnet - bd) * 2;
        pk.x += (dx / d) * sp * dt;
        pk.y += (dy / d) * sp * dt;
      } else {
        pk.x += pk.vx * dt; pk.y += pk.vy * dt;
        pk.vx *= Math.pow(0.02, dt); pk.vy *= Math.pow(0.02, dt);
        pk.x = H.clamp(pk.x, 24, g.W - 24); pk.y = H.clamp(pk.y, 24, g.H - 24);
      }

      for (const f of g.fighters) {
        if (!f.alive) continue;
        if (Math.hypot(f.x - pk.x, f.y - pk.y) < f.r + pk.r + 6) {
          if (pk.kind.indexOf('item_') === 0 && f.item) continue;
          pk.dead = true;
          if (pk.kind === 'xp') { addXp(g, f, pk.value); if (f === g.player) H.sfx(g, 'xp'); }
          else if (pk.kind.indexOf('item_') === 0) {
            f.item = pk.kind.slice(5);
            H.addText(g, f.x, f.y - 34, '获得道具', '#FFD34D', 16);
            if (f === g.player) H.sfx(g, 'coin');
          }
          else {
            f.hp = Math.min(f.maxHp, f.hp + pk.value);
            H.addText(g, f.x, f.y - 30, '+' + pk.value, '#7CE08A', 18);
            if (f === g.player) H.sfx(g, 'heal');
          }
          break;
        }
      }
    }
    g.pickups = g.pickups.filter(x => !x.dead);
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

  TJ.updateArena = function (g, dt, input) {
    if (g.over) return;
    dt = Math.min(dt, 0.05);
    g.t += dt;
    g.elapsed += dt;
    const p = g.player;

    for (const f of g.fighters) {
      if (f.eliminated) continue;
      if (!f.alive) {
        f.respawnT -= dt;
        if (f.respawnT <= 0) respawn(g, f);
        continue;
      }
      updateFighter(g, f, dt, f.isBot ? botInput(g, f) : (input || {}));
      if (f.isBot && f.pendingLevels > 0) botLevelUp(g, f);
    }

    updateProjectiles(g, dt);
    updatePickups(g, dt);
    updateTraps(g, dt);
    updateEffects(g, dt);

    if (!g.matchOver) {
      if (g.elapsed >= g.timeLimit) endMatch(g, '时间到');
      else if (p.eliminated) endMatch(g, '你被淘汰了');
    }

    g.stats = p.stats;
    g.level = p.level;
    g.xp = p.xp;
    g.xpNeed = p.xpNeed;
    g.pendingLevels = p.pendingLevels;
    g.kills = p.kills;
    g.score = p.kills;

    const tx = p.alive ? p.x : g.cam.x;
    const ty = p.alive ? p.y : g.cam.y;
    g.cam.x += (tx - g.cam.x) * Math.min(1, dt * 6);
    g.cam.y += (ty - g.cam.y) * Math.min(1, dt * 6);
  };
})();
