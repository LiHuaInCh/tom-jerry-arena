/* 猫鼠大作战 — 启动、界面与主循环 */
(function () {
  const TJ = window.TJ;
  const D = TJ.DATA;
  const $ = function (id) { return document.getElementById(id); };
  const params = new URLSearchParams(location.search);

  const canvas = $('game');
  const renderer = TJ.Renderer(canvas);
  const input = TJ.Input();

  let g = null;

  TJ.useSkillNow = function () {
    if (!g || !g.player || g.over || !g.player.alive || g.player.skillCd > 0 || !g.player.skill) return;
    if (TJ.skills.use(g, g.player, false)) {
      g.player.skillCd = g.player.skill.cd * (g.stats.skillCdMul || 1);
    }
  };
  let state = 'title';
  let selected = params.get('char') || 'jerry';
  const covenants = new Set();
  let faction = (D.characters.find(function (c) { return c.id === selected; }) || D.characters[0]).faction || 'mouse';
  let mode = params.get('mode') === 'arena' ? 'arena' : 'survival';
  function portraitSrc(id) { return 'assets/portraits/' + id + '.png'; }
  let best = 0;
  try { best = parseInt(localStorage.getItem('tj_best') || '0', 10) || 0; } catch (e) {}
  let auto = params.get('auto') === '1';
  let arenaBest = 0;
  try { arenaBest = parseInt(localStorage.getItem('tj_arena_best') || '0', 10) || 0; } catch (e) {}
  const god = params.get('god') === '1';
  let last = performance.now(), acc = 0;
  let overTimer = 0, overShown = false;
  let toastT = null;
  let lastShield = -1;

  /* ---------- 布局 ---------- */
  function resize() {
    renderer.resize(window.innerWidth, window.innerHeight, Math.min(2, window.devicePixelRatio || 1));
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---------- 角色选择 ---------- */
  function buildChars() {
    const grid = $('charGrid');
    grid.innerHTML = '';
    const PRIORITY = { jerry: 1, tuffy: 2, swordsman: 3, robin: 4, detective: 5, tom: 1, butch: 2, knightcat: 3, toots: 4, lightning: 5 };
    D.characters.filter(function (c) { return (c.faction || 'mouse') === faction; })
      .sort(function (a, b) {
        const pa = PRIORITY[a.id] || 99, pb = PRIORITY[b.id] || 99;
        if (pa !== pb) return pa - pb;
        return a.name.localeCompare(b.name, 'zh');
      })
      .forEach(function (c) {
      const card = document.createElement('div');
      card.className = 'char-card' + (c.id === selected ? ' sel' : '');
      card.dataset.id = c.id;

      const cv = document.createElement('img');
      cv.className = 'portrait';
      cv.src = portraitSrc(c.id);
      cv.alt = c.name;
      cv.draggable = false;
      card.appendChild(cv);

      const body = document.createElement('div');
      body.className = 'c-body';

      const nm = document.createElement('div');
      nm.className = 'c-name'; nm.textContent = c.name;
      body.appendChild(nm);
      const clv = TJ.meta ? TJ.meta.charLv(c.id) : 1;
      if (clv > 1) {
        const lvEl = document.createElement('span');
        lvEl.className = 'c-lv';
        lvEl.textContent = 'Lv.' + clv;
        card.appendChild(lvEl);
      }

      const tt = document.createElement('div');
      tt.className = 'c-title'; tt.textContent = c.title;
      body.appendChild(tt);

      const pk = document.createElement('div');
      pk.className = 'c-perk'; pk.textContent = c.perk;
      body.appendChild(pk);

      const wp = document.createElement('div');
      wp.className = 'c-weapon'; wp.textContent = D.weapons[c.weapon].name;
      body.appendChild(wp);

      card.appendChild(body);

      const tick = document.createElement('div');
      tick.className = 'pick'; tick.textContent = '✓';
      card.appendChild(tick);

      const en = D.elementNames && D.elementNames[c.element];
      if (en) {
        const eb = document.createElement('div');
        eb.className = 'c-elem el-' + c.element;
        eb.textContent = en;
        eb.title = en + '属性';
        card.appendChild(eb);
      }

      const info = document.createElement('button');
      info.className = 'c-info';
      info.type = 'button';
      info.textContent = '详情';
      info.addEventListener('click', function (ev) { ev.stopPropagation(); openChar(c); });
      card.appendChild(info);

      card.addEventListener('click', function () { selectChar(c.id); });
      grid.appendChild(card);
    });
  }

  const SKILL_LABEL = { blink: '位移', shield: '护盾', invuln: '无敌', heal: '治疗', haste: '加速', slow: '减速', stealth: '隐身', beam: '光束', nova: '范围爆发' };

  function openChar(c) {
    const w = D.weapons[c.weapon];
    const sk = c.skill;
    $('cmPortrait').src = portraitSrc(c.id);
    $('cmName').textContent = c.name;
    $('cmSub').textContent = c.title + ' · ' + (c.faction === 'cat' ? '猫阵营' : '鼠阵营');
    const tags = $('cmTags');
    tags.innerHTML = '';
    [(D.elementNames && D.elementNames[c.element] ? D.elementNames[c.element] + '属性' : ''), c.perk, (w.kind === 'melee' ? '近战' : '远程'), SKILL_LABEL[sk.kind] || '技能'].filter(Boolean).forEach(function (t) {
      const s = document.createElement('span'); s.textContent = t; tags.appendChild(s);
    });
    $('cmDesc').textContent = c.desc;
    $('cmTalent').textContent = c.talent ? '天赋：' + c.talent.name + ' — ' + c.talent.desc : '';
    $('cmHp').textContent = c.hp;
    $('cmSp').textContent = c.speed;
    $('cmR').textContent = c.radius;
    $('cmHpBar').style.width = Math.min(100, c.hp / 200 * 100) + '%';
    $('cmSpBar').style.width = Math.min(100, c.speed / 290 * 100) + '%';
    $('cmRBar').style.width = Math.min(100, c.radius / 26 * 100) + '%';

    $('cmWIcon').src = w.iconImg || '';
    $('cmWName').textContent = w.name;
    const wd = w.kind === 'melee'
      ? '近战 · 伤害 ' + w.dmg + ' · 冷却 ' + w.cd + 's'
      : '远程 · 伤害 ' + w.dmg + ' · 冷却 ' + w.cd + 's';
    $('cmWInfo').textContent = wd;

    $('cmSIcon').src = sk.iconImg || '';
    $('cmSName').textContent = sk.name;
    let sd = (SKILL_LABEL[sk.kind] || '技能') + ' · 冷却 ' + sk.cd + 's';
    if (sk.dmg) sd += ' · 伤害 ' + sk.dmg;
    if (sk.dur) sd += ' · 持续 ' + sk.dur + 's';
    if (sk.pct) sd += ' · 回复 ' + Math.round(sk.pct * 100) + '%';
    if (sk.radius) sd += ' · 半径 ' + sk.radius;
    if (sk.dist) sd += ' · 距离 ' + sk.dist;
    if (sk.mul) sd += ' · 倍率 ' + sk.mul;
    $('cmSInfo').textContent = sd;

    $('charModal').classList.add('on');
  }

  function closeChar() { $('charModal').classList.remove('on'); }

  $('cmClose').addEventListener('click', closeChar);
  $('charModal').addEventListener('click', function (e) { if (e.target === $('charModal')) closeChar(); });
  document.addEventListener('keydown', function (e) { if (e.code === 'Escape') closeChar(); });
  document.addEventListener('keydown', function (e) { if (e.code === 'KeyE' && g && g.player && TJ.useItem) TJ.useItem(g, g.player); });

  function selectChar(id) {
    selected = id;
    const cards = document.querySelectorAll('.char-card');
    for (let i = 0; i < cards.length; i++) {
      cards[i].classList.toggle('sel', cards[i].dataset.id === id);
    }
    TJ.Audio.play('click');
  }

  /* ---------- 开局 ---------- */
  function startRun() {
    TJ.Audio.unlock();
    g = mode === 'arena' ? TJ.createArenaGame({ charId: selected }) : TJ.createGame({ charId: selected });
    g.cov = { spawn: 1, elite: 1, noHeal: 0, score: 1, list: [] };
    if (mode !== 'arena') {
      if (covenants.has('horde')) { g.cov.spawn = 0.8; g.cov.score *= 1.2; g.cov.list.push('怪潮'); }
      if (covenants.has('elite')) { g.cov.elite = 2; g.cov.score *= 1.2; g.cov.list.push('精英'); }
      if (covenants.has('noheal')) { g.cov.noHeal = 1; g.cov.score *= 1.3; g.cov.list.push('禁疗'); }
    }
    if (TJ.meta) {
      const plv = TJ.meta.charLv(selected) || 1;
      g.player.stats ? (g.player.stats.damage *= 1 + 0.005 * (plv - 1)) : (g.stats.damage *= 1 + 0.005 * (plv - 1));
    }
    if (TJ.meta) {
      const rb = TJ.meta.bonuses();
      const st = g.player.stats || g.stats;
      st.damage *= 1 + rb.dmg;
      st.speed *= 1 + rb.speed;
      if (g.stats) g.stats.xpMul = (g.stats.xpMul || 1) * (1 + rb.xp);
      g.player.maxHp = Math.round(g.player.maxHp * (1 + rb.hp));
      g.player.hp = g.player.maxHp;
    }
    if (mode !== 'arena' && TJ.meta) {
      const lv = TJ.meta.level || 1;
      g.stats.damage *= 1 + 0.01 * (lv - 1);
      g.stats.speed *= 1 + 0.005 * (lv - 1);
      g.stats.xpMul = (g.stats.xpMul || 1) * (1 + 0.01 * (lv - 1));
    }
    g.mode = g.mode || 'survival';
    window.__tjG = g;
    if (god) {
      g.player.maxHp = 1e9;
      g.player.hp = 1e9;
    }
    state = 'playing';
    overShown = false; overTimer = 0; acc = 0; last = performance.now();
    $('title').classList.add('hidden');
    $('over').classList.add('hidden');
    $('pause').classList.add('hidden');
    $('levelup').classList.add('hidden');
    $('hud').classList.remove('hidden');
    $('hud').classList.toggle('arena', g.mode === 'arena');
    $('board').classList.toggle('hidden', g.mode !== 'arena');
    $('feed').innerHTML = '';
    $('respawn').classList.add('hidden');
    input.setEnabled(true);
    if (TJ.meta) { TJ.meta.addUse(selected); refreshProfile(); }
    $('pName').textContent = g.player.char.name;
    $('avatar').src = portraitSrc(g.player.char.id);
  const sk = g.player.skill;
  const sbtn = $('dashBtn');
  if (sk) {
    sbtn.style.backgroundImage = "url('" + sk.iconImg + "')";
    sbtn.title = sk.name + ' · ' + sk.cd + ' 秒';
    const lab = sbtn.querySelector('span');
    if (lab) lab.textContent = sk.name.slice(0, 4);
  }
    lastShield = -1;
    renderBuffs();
    updateHud();

    const ff = parseFloat(params.get('ff') || '0');
    if (ff > 0) fastForward(ff);
    maybeLevelUp();
  }

  function fastForward(sec) {
    const steps = Math.min(60 * 600, Math.round(sec * 60));
    for (let i = 0; i < steps; i++) {
      if (g.over) break;
      if (g.mode === 'arena') TJ.updateArena(g, 1 / 60, arenaAI(g));
      else TJ.update(g, 1 / 60, aiInput(g));
      g.events.length = 0;
      while (pendingCount() > 0) { if (!autoPickOne()) break; }
    }
    renderBuffs();
    if (g.over) { state = 'over'; input.setEnabled(false); overTimer = 0; }
  }

  /* ---------- 升级 ---------- */
  function pendingCount() {
    if (!g) return 0;
    return g.mode === 'arena' ? g.player.pendingLevels : g.pendingLevels;
  }

  function clearPending() {
    if (!g) return;
    if (g.mode === 'arena') g.player.pendingLevels = 0;
    else g.pendingLevels = 0;
  }

  function autoPickOne() {
    if (!g) return false;
    if (g.mode === 'arena') {
      const ch = TJ.getArenaChoices(g, g.player);
      if (!ch.length) { g.player.pendingLevels = 0; return false; }
      TJ.applyArenaChoice(g, g.player, ch[Math.floor(Math.random() * ch.length)].key);
      return true;
    }
    const ch = TJ.getUpgradeChoices(g);
    if (!ch.length) { g.pendingLevels = 0; return false; }
    TJ.applyUpgrade(g, ch[Math.floor(Math.random() * ch.length)].id);
    return true;
  }

  function maybeLevelUp() {
    if (!g || pendingCount() <= 0) return;
    if (auto) {
      while (pendingCount() > 0) { if (!autoPickOne()) break; }
      renderBuffs();
      return;
    }
    showLevelUp();
  }

  function showLevelUp() {
    if (!g) return;
    const choices = g.mode === 'arena' ? TJ.getArenaChoices(g, g.player) : TJ.getUpgradeChoices(g);
    if (!choices.length) { clearPending(); return; }
    state = 'levelup';
    input.setEnabled(false);
    $('luLeft').textContent = pendingCount();
    const wrap = $('cards');
    wrap.innerHTML = '';
    choices.forEach(function (u, i) {
      const el = document.createElement('button');
      el.className = 'up-card r-' + u.rarity + (u.kind ? ' k-' + u.kind : '');
      el.style.animationDelay = (i * 55) + 'ms';

      const ic = document.createElement('span');
      ic.className = 'up-icon';
      const iconSrc = u.weapon ? ('assets/weapon-icons/' + u.weapon + '.png')
        : (u.key && u.key.indexOf('sub:') === 0 ? ('assets/weapon-icons/' + u.key.slice(4) + '.png')
        : (u.iconImg || ''));
      if (iconSrc) {
        const im = document.createElement('img');
        im.className = 'up-icon-img';
        im.src = iconSrc;
        im.alt = '';
        ic.appendChild(im);
      } else {
        ic.textContent = u.icon;
      }
      el.appendChild(ic);

      const rar = document.createElement('span');
      rar.className = 'up-rarity';
      rar.textContent = u.kind === 'weapon_up' ? '武器进化' : u.kind === 'switch' ? '切换武器' : TJ.RARITY[u.rarity] + ' · 强化';
      el.appendChild(rar);

      const nm = document.createElement('span');
      nm.className = 'up-name'; nm.textContent = u.name;
      el.appendChild(nm);

      const ds = document.createElement('span');
      ds.className = 'up-desc'; ds.textContent = u.desc;
      el.appendChild(ds);

      const st = document.createElement('span');
      st.className = 'up-stack';
      st.textContent = u.stack ? u.stack : '已拥有 ' + ((g.upgradeCounts || {})[u.id] || 0) + ' / ' + u.max;
      el.appendChild(st);

      el.addEventListener('click', function () { choose(u.key || u.id); });
      wrap.appendChild(el);
    });
    $('levelup').classList.remove('hidden');
    if (g && g.effects) g.effects.push({ kind: 'tex', src: 'assets/fx/kenney/star_04.png', x: g.player.x, y: g.player.y - 10, life: 0.6, max: 0.6, s0: 20, s1: 90, alpha: 0.9, spin: 1 });
  }

  function choose(key) {
    if (g.mode === 'arena') TJ.applyArenaChoice(g, g.player, key);
    else TJ.applyUpgrade(g, key);
    TJ.Audio.play('click');
    $('levelup').classList.add('hidden');
    state = 'playing';
    input.setEnabled(true);
    last = performance.now(); acc = 0;
    renderBuffs();
    updateHud();
    if (key === 'infuse1' || key === 'infuse2') setTimeout(function () { showElementPicker(key === 'infuse1' ? 0 : 1); }, 220);
    if (pendingCount() > 0) setTimeout(showLevelUp, 200);
  }

  /* ---------- HUD ---------- */
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function renderBuffs() {
    if (!g) return;
    const wrap = $('buffs');
    wrap.innerHTML = '';

    if (g.mode === 'arena') {
      const w = D.weapons[g.player.weapon];
      const el = document.createElement('div');
      el.className = 'buff weapon';
      el.title = w.name + ' Lv.' + g.player.weaponLv;
      el.textContent = w.icon;
      const n = document.createElement('i');
      n.textContent = g.player.weaponLv;
      el.appendChild(n);
      wrap.appendChild(el);
    }

    const counts = g.mode === 'arena' ? g.player.upgradeCounts : g.upgradeCounts;
    Object.keys(counts).forEach(function (id) {
      const u = D.upgrades.find(function (x) { return x.id === id; });
      if (!u) return;
      const el = document.createElement('div');
      el.className = 'buff';
      el.title = u.name;
      el.textContent = u.icon;
      const n = document.createElement('i');
      n.textContent = counts[id];
      el.appendChild(n);
      wrap.appendChild(el);
    });
  }

  function updateHud() {
    if (!g) return;
    const p = g.player;
    const arena = g.mode === 'arena';

    const pct = Math.max(0, Math.min(1, p.hp / p.maxHp)) * 100;
    $('hpFill').style.width = pct + '%';
    $('hpFill').classList.toggle('low', pct < 30);
    $('hpText').textContent = Math.ceil(Math.max(0, p.hp)) + '/' + Math.round(p.maxHp);
    $('xpFill').style.width = Math.min(100, (g.xp / g.xpNeed) * 100) + '%';
    $('lvlBadge').textContent = g.level;

    const cd = Math.min(1, p.skillCd / Math.max(0.01, (p.skill ? p.skill.cd * (g.stats.skillCdMul || 1) : 1)));
    $('dashBtn').style.setProperty('--cd', cd.toFixed(3));
    let ib = document.getElementById('itemBtn');
    if (!ib) {
      ib = document.createElement('button');
      ib.id = 'itemBtn';
      ib.type = 'button';
      ib.className = 'item-btn';
      ib.title = '使用道具（E）';
      document.body.appendChild(ib);
      ib.addEventListener('click', function () { if (g && g.player) TJ.useItem(g, g.player); });
    }
    if (g && g.player && g.player.item) {
      const glyph = { shield: '盾', invis: '隐', farsight: '视', growth: '大' }[g.player.item] || '?';
      const iconSrc = (TJ.DATA.itemIcons || {})[g.player.item];
      ib.textContent = iconSrc ? '' : glyph;
      ib.style.backgroundImage = iconSrc ? "url('" + iconSrc + "')" : '';
      ib.style.backgroundSize = '72%';
      ib.style.backgroundPosition = 'center';
      ib.style.backgroundRepeat = 'no-repeat';
      ib.style.display = 'flex';
    } else {
      ib.style.display = 'none';
    }

    if (p.shield !== lastShield) {
      lastShield = p.shield;
      const sp = $('shieldPips');
      sp.innerHTML = '';
      for (let i = 0; i < p.shield; i++) sp.appendChild(document.createElement('i'));
    }

    if (arena) {
      $('waveLabel').textContent = '乱斗';
      $('timer').textContent = fmt(Math.max(0, g.timeLimit - g.elapsed));
      $('kills').textContent = p.kills;
      $('score').textContent = Math.max(0, p.lives) + ' 命';
      updateBoard();

      const rp = $('respawn');
      if (!p.alive && !g.matchOver && p.lives > 0) {
        rp.classList.remove('hidden');
        $('respawnNum').textContent = Math.max(0, Math.ceil(p.respawnT));
      } else {
        rp.classList.add('hidden');
      }
      $('bossBar').classList.add('hidden');
      return;
    }

    $('respawn').classList.add('hidden');
    $('waveLabel').textContent = '第 ' + Math.max(1, g.wave) + ' 波';
    $('timer').textContent = fmt(g.elapsed);
    $('kills').textContent = g.kills;
    $('score').textContent = g.score;

    if (g.boss && !g.boss.dead) {
      $('bossBar').classList.remove('hidden');
      $('bossName').textContent = g.boss.def.name;
      $('bossFill').style.width = Math.max(0, (g.boss.hp / g.boss.maxHp) * 100) + '%';
    } else {
      $('bossBar').classList.add('hidden');
    }
  }

  function toast(text) {
    const el = $('toast');
    el.textContent = text;
    el.classList.add('show');
    if (toastT) clearTimeout(toastT);
    toastT = setTimeout(function () { el.classList.remove('show'); }, 1500);
  }

  function drainEvents() {
    if (!g) return;
    for (let i = 0; i < g.events.length; i++) {
      const ev = g.events[i];
      if (ev.type === 'sfx') TJ.Audio.play(ev.name);
      else if (ev.type === 'wave') toast('第 ' + ev.wave + ' 波');
      else if (ev.type === 'boss') toast(ev.e.name + ' 出现了！');
      else if (ev.type === 'revive') toast('杰瑞从不认输！');
      else if (ev.type === 'kill') addFeed(ev.killer, ev.victim, ev.color);
      else if (ev.type === 'eliminated') toast(ev.name + ' 被淘汰');
    }
    g.events.length = 0;
  }

  /* ---------- 暂停 / 结算 ---------- */
  function pauseGame() {
    if (state !== 'playing' || !g) return;
    state = 'paused';
    input.setEnabled(false);
    var mins = Math.floor(g.elapsed / 60), secs = Math.floor(g.elapsed % 60);
    var tstr = mins + ':' + (secs < 10 ? '0' : '') + secs;
    if (g.mode === 'arena') {
      $('pauseStats').textContent = '乱斗 · ' + tstr + ' · ' + g.player.kills + ' 杀 · 等级 ' + g.player.level + ' · 剩余 ' + Math.max(0, (g.timeLimit - g.elapsed) | 0) + ' 秒';
    } else {
      $('pauseStats').textContent = '无尽 · ' + tstr + ' · 第 ' + g.wave + ' 波 · 击倒 ' + g.kills + ' · 分数 ' + g.score + ' · 等级 ' + g.player.level + ' · 伤害 ' + Math.round(g.stats.damage * 100) + '% · 移速 ' + Math.round(g.stats.speed * 100) + '%';
    }
    $('pause').classList.remove('hidden');
  }

  function resumeGame() {
    if (state !== 'paused') return;
    state = 'playing';
    input.setEnabled(true);
    $('pause').classList.add('hidden');
    last = performance.now(); acc = 0;
  }

  const BADGES = [
    ['first', '初阵', function (m) { return Object.keys(m.chars || {}).length > 0; }],
    ['lv5', 'Lv5', function (m) { return m.level >= 5; }],
    ['collector', '十人', function (m) { return Object.keys(m.chars || {}).length >= 10; }],
    ['covenant', '盟约', function (m) { return (m.covWins || 0) > 0; }]
  ];

  function showElementPicker(slot) {
    let ov = document.getElementById('elemPick');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'elemPick';
      ov.className = 'elem-pick';
      document.body.appendChild(ov);
    }
    const NAMES = { fire: '火', ice: '冰', thunder: '雷', light: '光', dark: '暗' };
    ov.innerHTML = '<div class="ep-box"><div class="ep-title">选择注入元素</div><div class="ep-list">' +
      Object.keys(NAMES).map(function (k) { return '<button class="ep-btn" data-el="' + k + '">' + NAMES[k] + '</button>'; }).join('') +
      '</div></div>';
    ov.classList.add('on');
    ov.querySelectorAll('.ep-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        if (g && g.player && g.player.elemSlots) g.player.elemSlots[slot] = b.dataset.el;
        ov.classList.remove('on');
      });
    });
  }

  function renderRunes(ov) {
    const p = TJ.meta.points();
    const R = TJ.meta.RUNES;
    ov.innerHTML = '<div class="rm-box"><div class="rm-head">符文 <span>可用 ' + (p.total - p.spent) + ' / 已用 ' + p.spent + '</span><button class="rm-close">×</button></div>' +
      Object.keys(R).map(function (k) {
        return '<div class="rm-row"><div class="rm-info"><b>' + R[k].name + '</b><span>' + R[k].desc + '</span></div>' +
          '<div class="rm-ctl"><button data-r="' + k + '" data-d="-1">−</button><em>' + TJ.meta.runeLv(k) + '</em><button data-r="' + k + '" data-d="1">＋</button></div></div>';
      }).join('') +
      '<div class="rm-foot"><button id="rmReset">免费重置</button></div></div>';
    const ob = ov.querySelector('#rmOrigin');
    if (ob) ob.onclick = function () {
      const list = ['fire', 'ice', 'thunder', 'light', 'dark'];
      const i = list.indexOf(TJ.meta.originElement());
      TJ.meta.setOriginElement(list[(i + 1) % list.length]);
      renderRunes(ov);
    };
    ov.querySelector('.rm-close').onclick = function () { ov.classList.remove('on'); };
    ov.querySelectorAll('.rm-ctl button').forEach(function (b) {
      b.onclick = function () {
        if (b.dataset.d === '1') TJ.meta.spend(b.dataset.r); else TJ.meta.refund(b.dataset.r);
        renderRunes(ov);
      };
    });
    ov.querySelector('#rmReset').onclick = function () { TJ.meta.resetRunes(); renderRunes(ov); };
  }

  function openRunes() {
    let ov = document.getElementById('runeModal');
    if (!ov) { ov = document.createElement('div'); ov.id = 'runeModal'; ov.className = 'rune-modal'; document.body.appendChild(ov); }
    renderRunes(ov);
    ov.classList.add('on');
  }

  function refreshProfile() {
    if (!TJ.meta) return;
    let el = document.getElementById('profile');
    if (!el) {
      el = document.createElement('div');
      el.id = 'profile';
      el.className = 'profile';
      const host = document.querySelector('.title-inner') || document.body;
      host.appendChild(el);
    }
    const m = TJ.meta.data;
    BADGES.forEach(function (b) { if (b[2](m)) TJ.meta.award(b[0]); });
    const lv = TJ.meta.levelInfo();
    const promo = lv.level - 1;
    el.innerHTML = '<span>账号 Lv.' + lv.level + '</span><span>经验 ' + lv.into + '/' + lv.need + '</span>' +
      (promo > 0 ? '<span>晋升 +' + promo + '% 伤害</span>' : '') +
      BADGES.filter(function (b) { return m.badges[b[0]]; }).map(function (b) { return '<span class="pb" title="' + b[1] + '">' + b[1].slice(0, 1) + '</span>'; }).join('') +
      '<button class="rune-btn" id="runeBtn">符文</button>';
    const rb = document.getElementById('runeBtn');
    if (rb) rb.onclick = openRunes;
  }

  function showOver() {
    if (g && !g.__metaDone && TJ.meta) {
      g.__metaDone = true;
      TJ.meta.addRun({ id: g.player.char.id, score: g.score || 0, kills: g.kills || 0, win: mode === 'arena' ? g.winner === g.player : false, cov: !!(g.cov && g.cov.list.length) });
      refreshProfile();
    }
    if (!g) return;
    overShown = true;
    if (g.mode === 'arena') {
      const list = (g.ranking && g.ranking.length) ? g.ranking : g.fighters.slice().sort(function (a, b) { return b.kills - a.kills; });
      const rank = list.map(function (f, i) {
        return '<div class="rank-row' + (f === g.player ? ' me' : '') + '"><span>' + (i + 1) + '</span><i style="background:' + f.color + '"></i><b>' + escapeHtml(f.name) + '</b><em>' + f.kills + ' 杀</em></div>';
      }).join('');
      if (g.player.kills > arenaBest) {
        arenaBest = g.player.kills;
        try { localStorage.setItem('tj_arena_best', String(arenaBest)); } catch (e) {}
      }
      $('bestScore').textContent = arenaBest;
      $('overTitle').textContent = g.winner === g.player ? '乱斗冠军！' : '本局第 ' + (list.indexOf(g.player) + 1) + ' 名';
      $('overStats').innerHTML = '<div class="rank-list">' + rank + '</div>' +
        '<div class="stat wide"><span>结束原因</span><b>' + escapeHtml(g.endReason || '时间到') + '</b></div>';
      $('over').classList.remove('hidden');
      state = 'over';
      return;
    }
    if (g.score > best) {
      best = g.score;
      try { localStorage.setItem('tj_best', String(best)); } catch (e) {}
    }
    $('bestScore').textContent = best;
    $('overStats').innerHTML =
      '<div class="stat wide"><span>本局得分</span><b>' + g.score + '</b></div>' +
      '<div class="stat"><span>坚持时间</span><b>' + fmt(g.elapsed) + '</b></div>' +
      '<div class="stat"><span>到达波次</span><b>' + g.wave + '</b></div>' +
      '<div class="stat"><span>击倒猫咪</span><b>' + g.kills + '</b></div>' +
      '<div class="stat"><span>角色等级</span><b>' + g.level + '</b></div>';
    $('over').classList.remove('hidden');
    state = 'over';
  }

  function endRun() {
    if (!g || state === 'over') { goHome(); return; }
    $('pause').classList.add('hidden');
    g.over = true;
    state = 'playing';
    input.setEnabled(false);
  }

  function goHome() {
    state = 'title';
    input.setEnabled(false);
    $('hud').classList.add('hidden');
    $('levelup').classList.add('hidden');
    $('pause').classList.add('hidden');
    $('over').classList.add('hidden');
    $('title').classList.remove('hidden');
    g = null;
  }

  /* ---------- 演示 AI ---------- */
  function aiInput(g) {
    const p = g.player;
    let ex = 0, ey = 0, ed = 1e9;
    for (let i = 0; i < g.enemies.length; i++) {
      const e = g.enemies[i];
      if (e.dead) continue;
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < ed) { ed = d; ex = e.x; ey = e.y; }
    }
    let x = 0, y = 0;
    if (ed < 340) {
      x = (p.x - ex) / ed; y = (p.y - ey) / ed;
    } else if (ed < 600) {
      const tx = (ex - p.x) / ed, ty = (ey - p.y) / ed;
      x = -ty * 0.9 + tx * 0.2; y = tx * 0.9 + ty * 0.2;
    } else {
      let bx = 0, by = 0, bd = 1e9;
      for (let i = 0; i < g.pickups.length; i++) {
        const q = g.pickups[i];
        const d = Math.hypot(q.x - p.x, q.y - p.y);
        if (d < bd) { bd = d; bx = q.x; by = q.y; }
      }
      if (bd < 900) { x = (bx - p.x) / bd; y = (by - p.y) / bd; }
      else { x = Math.cos(g.t * 0.6); y = Math.sin(g.t * 0.6); }
    }
    const m = 240;
    let cx = 0, cy = 0;
    if (p.x < m) cx += 1; else if (p.x > D.W - m) cx -= 1;
    if (p.y < m) cy += 1; else if (p.y > D.H - m) cy -= 1;
    if (cx || cy) { x = x * 0.45 + cx * 0.9; y = y * 0.45 + cy * 0.9; }
    const len = Math.hypot(x, y) || 1;
    return { moveX: x / len, moveY: y / len, dash: false };
  }

  /* ---------- 乱斗辅助 ---------- */
  let boardT = 0;
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function updateBoard() {
    if (!g || g.mode !== 'arena') return;
    const now = performance.now();
    if (now - boardT < 250) return;
    boardT = now;
    const list = g.fighters.slice().sort(function (a, b) {
      if (b.kills !== a.kills) return b.kills - a.kills;
      return a.deaths - b.deaths;
    });
    const el = $('board');
    el.innerHTML = '';
    list.forEach(function (f) {
      const row = document.createElement('div');
      row.className = 'b-row' + (f === g.player ? ' me' : '');
      const dot = document.createElement('i');
      dot.style.background = f.color;
      const nm = document.createElement('b');
      nm.textContent = f.name;
      const wp = document.createElement('s');
      wp.textContent = D.weapons[f.weapon].icon;
      wp.title = D.weapons[f.weapon].name + ' Lv.' + f.weaponLv;
      const k = document.createElement('em');
      k.textContent = f.kills;
      const lv = document.createElement('u');
      lv.textContent = '×' + Math.max(0, f.lives);
      row.appendChild(dot); row.appendChild(nm); row.appendChild(wp); row.appendChild(k); row.appendChild(lv);
      el.appendChild(row);
    });
  }

  function addFeed(killer, victim, color) {
    const el = $('feed');
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = killer
      ? '<b style="color:' + (color || '#fff') + '">' + escapeHtml(killer) + '</b> 击倒 <b>' + escapeHtml(victim) + '</b>'
      : '<b>' + escapeHtml(victim) + '</b> 出局';
    el.appendChild(item);
    while (el.children.length > 4) el.removeChild(el.firstChild);
    setTimeout(function () { item.classList.add('out'); setTimeout(function () { item.remove(); }, 450); }, 3200);
  }

  function arenaAI(g) {
    const p = g.player;
    if (!p.alive) return { moveX: 0, moveY: 0, dash: false };
    let target = null, bd = 1e9;
    for (const f of g.fighters) {
      if (f === p || !f.alive) continue;
      const d = Math.hypot(f.x - p.x, f.y - p.y);
      if (d < bd) { bd = d; target = f; }
    }
    let x = 0, y = 0, dash = false;
    if (target) {
      const ux = (target.x - p.x) / bd, uy = (target.y - p.y) / bd;
      const ideal = D.weapons[p.weapon].kind === 'melee' ? 100 : 320;
      if (bd < ideal - 70) { x = -ux; y = -uy; }
      else if (bd > ideal + 100) { x = ux; y = uy; }
      else { x = -uy * 0.9 + ux * 0.2; y = ux * 0.9 + uy * 0.2; }
      if (p.hp < p.maxHp * 0.3 && bd < 260) dash = true;
    } else {
      let pk = null, pd = 1e9;
      for (const q of g.pickups) {
        const d = Math.hypot(q.x - p.x, q.y - p.y);
        if (d < pd) { pd = d; pk = q; }
      }
      if (pk) { x = (pk.x - p.x) / pd; y = (pk.y - p.y) / pd; }
    }
    const m = 240;
    if (p.x < m) x += 1; else if (p.x > D.W - m) x -= 1;
    if (p.y < m) y += 1; else if (p.y > D.H - m) y -= 1;
    const len = Math.hypot(x, y) || 1;
    return { moveX: x / len, moveY: y / len, dash: dash };
  }

  /* ---------- 主循环 ---------- */
  window.addEventListener('error', function () { window.__tjErrs = (window.__tjErrs || 0) + 1; });

  function frame(now) {
    window.__tjState = state;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (state === 'playing' && g) {
      if (!g.over) {
        acc += dt;
        let guard = 0;
        while (acc >= 1 / 60 && guard < 5) {
          acc -= 1 / 60; guard++;
          if (g.mode === 'arena') TJ.updateArena(g, 1 / 60, auto ? arenaAI(g) : input.sample());
          else TJ.update(g, 1 / 60, auto ? aiInput(g) : input.sample());
          drainEvents();
          if (pendingCount() > 0) { acc = 0; break; }
        }
        if (pendingCount() > 0) maybeLevelUp();
      }
      if (g.over) {
        state = 'over';
        input.setEnabled(false);
        overTimer = 0;
      }
    } else if (state === 'over' && g) {
      overTimer += dt;
      TJ.updateVisuals(g, dt);
      if (overTimer > 1.0 && !overShown) showOver();
    }

    if (g) renderer.draw(g, now / 1000);
    if (state === 'playing' || state === 'levelup' || state === 'paused' || state === 'over') updateHud();
    requestAnimationFrame(frame);
  }

  /* ---------- 绑定 ---------- */
  function refreshModeUI() {
    document.querySelectorAll('.mode-tab').forEach(function (b) {
      b.classList.toggle('sel', b.dataset.mode === mode);
    });
    const tips = document.getElementById('tips');
    if (tips) {
      tips.innerHTML = mode === 'arena'
        ? '<span><b>武器进化</b>或换一把武器</span><span><b>6 人混战</b>三条命</span><span><b>击杀最多</b>者获胜</span>'
        : '<span><b>自动瞄准</b>专注走位</span><span><b>升级三选一</b>组合流派</span><span><b>无尽波次</b>挑战最高分</span>';
    }
    $('bestLabel').textContent = mode === 'arena' ? '最多击杀' : '最佳成绩';
    $('bestScore').textContent = mode === 'arena' ? arenaBest : best;
  }
  document.querySelectorAll('.mode-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      mode = btn.dataset.mode;
      refreshModeUI();
      TJ.Audio.play('click');
    });
  });
  document.querySelectorAll('.faction-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      faction = btn.dataset.faction;
      const pool = D.characters.filter(function (c) { return (c.faction || 'mouse') === faction; });
      if (pool.length && !pool.some(function (c) { return c.id === selected; })) selected = pool[0].id;
      document.querySelectorAll('.faction-tab').forEach(function (b) { b.classList.toggle('sel', b === btn); });
      buildChars();
      refreshFactionUI();
      TJ.Audio.play('click');
    });
  });
  function refreshFactionUI() {
    document.querySelectorAll('.faction-tab').forEach(function (b) {
      const f = b.dataset.faction;
      const n = D.characters.filter(function (c) { return (c.faction || 'mouse') === f; }).length;
      b.textContent = (f === 'mouse' ? '鼠阵营 ' : '猫阵营 ') + n;
      b.classList.toggle('sel', f === faction);
    });
  }
  document.querySelectorAll('.cov').forEach(function (b) {
    b.addEventListener('click', function () {
      const k = b.dataset.cov;
      if (covenants.has(k)) { covenants.delete(k); b.classList.remove('on'); }
      else { covenants.add(k); b.classList.add('on'); }
      TJ.Audio.play('click');
    });
  });
  refreshModeUI();
  refreshFactionUI();

  $('startBtn').addEventListener('click', startRun);
  $('retryBtn').addEventListener('click', startRun);
  $('homeBtn').addEventListener('click', goHome);
  $('quitBtn').addEventListener('click', endRun);
  $('resumeBtn').addEventListener('click', resumeGame);
  $('pauseBtn').addEventListener('click', pauseGame);
  $('muteBtn').addEventListener('click', function () {
    TJ.Audio.toggle();
    updateMute();
  });

  function updateMute() {
    $('muteBtn').textContent = '音效：' + (TJ.Audio.isMuted() ? '关' : '开');
  }

  window.addEventListener('keydown', function (e) {
    if (e.code === 'KeyP' || e.code === 'Escape') {
      if (state === 'playing') pauseGame();
      else if (state === 'paused') resumeGame();
    }
    if (e.code === 'KeyM') { TJ.Audio.toggle(); updateMute(); }
    if (e.code === 'Enter' && state === 'title') startRun();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && state === 'playing') pauseGame();
  });

  /* ---------- 启动 ---------- */
  buildChars();
  updateMute();
  refreshModeUI();
  requestAnimationFrame(frame);

  if (params.get('play') === '1') startRun();
})();
