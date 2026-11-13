/* 猫鼠大作战 — 圣遗物 */
(function () {
  var TJ = (window.TJ = window.TJ || {});
  var RELICS = [
    { id: 'r_berserk', name: '狂战徽记', pos: '伤害 +40%', neg: '最大生命 -15%', color: '#E4572E',
      apply: function (s, g) { s.damage *= 1.4; g.player.maxHp = Math.round(g.player.maxHp * 0.85); g.player.hp = Math.min(g.player.hp, g.player.maxHp); } },
    { id: 'r_wind', name: '疾风羽', pos: '攻速 +30%', neg: '射程 -12%', color: '#7FD1FF',
      apply: function (s) { s.fireRate *= 1.3; s.range = (s.range || 0) - 60; } },
    { id: 'r_heart', name: '巨人心脏', pos: '最大生命 +45%', neg: '移速 -10%', color: '#7CE08A',
      apply: function (s, g) { var __old = g.player.maxHp; g.player.maxHp = Math.round(__old * 1.45); g.player.hp = Math.min(g.player.maxHp, g.player.hp + (g.player.maxHp - __old)); s.speed *= 0.9; } },
    { id: 'r_glass', name: '玻璃大炮', pos: '伤害 +55%', neg: '护甲 -20%', color: '#C9A7FF',
      apply: function (s) { s.damage *= 1.55; s.armor = (s.armor || 0) - 0.2; } },
    { id: 'r_vamp', name: '吸血鬼牙', pos: '吸血 +1.8%', neg: '每秒回复 -0.5%', color: '#B33B4A',
      apply: function (s) { s.lifesteal = (s.lifesteal || 0) + 0.018; s.regen = Math.max(0, (s.regen || 0) - 0.005); } },
    { id: 'r_barrage', name: '弹幕核心', pos: '弹丸 +1', neg: '伤害 -12%', color: '#FFD34D',
      apply: function (s) { s.multishot = (s.multishot || 0) + 1; s.damage *= 0.88; } },
    { id: 'r_hourglass', name: '时之沙', pos: '技能冷却 -30%', neg: '攻速 -15%', color: '#9CD8FF',
      apply: function (s) { s.skillCdMul = (s.skillCdMul || 1) * 0.7; s.fireRate *= 0.85; } },
    { id: 'r_aegis', name: '不破圣盾', pos: '护甲 +15%', neg: '移速 -12%', color: '#F2C14E',
      apply: function (s) { s.armor = (s.armor || 0) + 0.15; s.speed *= 0.88; } },
    { id: 'r_hunter', name: '猎手之眼', pos: '暴击 +15%', neg: '最大生命 -12%', color: '#FF9A5C',
      apply: function (s, g) { s.crit += 0.15; g.player.maxHp = Math.max(20, Math.round(g.player.maxHp * 0.88)); g.player.hp = Math.min(g.player.hp, g.player.maxHp); } },
    { id: 'r_greed', name: '贪婪金币', pos: '幸运 +40%', neg: '伤害 -10%', color: '#E4A11B',
      apply: function (s) { s.luck = (s.luck || 0) + 0.4; s.damage *= 0.9; } },
    { id: 'r_bell', name: '召唤铃', pos: '召唤上限 +2', neg: '召唤伤害 -15%', color: '#9FE7FF',
      apply: function (s) { s.summonCount = Math.min(10, (s.summonCount || 4) + 2); s.summonDmgMul = (s.summonDmgMul || 1) * 0.85; } },
    { id: 'r_prism', name: '元素棱镜', pos: '伤害 +25%', neg: '技能冷却 +15%', color: '#B06BE0',
      apply: function (s) { s.damage *= 1.25; s.skillCdMul = (s.skillCdMul || 1) * 1.15; } }
  ];
  function owned(g) { return g.relics || (g.relics = []); }
  function apply(g, r) {
    var st = g.stats, sb = st.subBase, before = {};
    for (var k in st) if (typeof st[k] === 'number') before[k] = st[k];
    r.apply(st, g);
    if (sb) for (var k2 in st) if (typeof st[k2] === 'number' && st[k2] !== before[k2]) sb[k2] = (typeof sb[k2] === 'number' ? sb[k2] : 0) + (st[k2] - before[k2]);
    owned(g).push(r.id);
  }
  function offer(g) {
    if (!g || g.relicPause) return;
    var have = owned(g);
    var pool = RELICS.filter(function (r) { return have.indexOf(r.id) < 0; });
    if (!pool.length) { g.player.hp = Math.min(g.player.maxHp, g.player.hp + 40); TJ.Feedback.addText(g, g.player.x, g.player.y - 50, '圣遗物已集齐 +40 生命', '#FFD34D', 20); return; }
    for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(g.rng() * (i + 1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    var picks = pool.slice(0, 3);
    g.relicPause = true;
    var ov = document.createElement('div');
    ov.className = 'guide-modal on relic-overlay';
    ov.innerHTML = '<div class="guide-box relic-box"><div class="guide-head">圣遗物 · 三选一<button class="guide-close">×</button></div><div class="guide-body"><div class="relic-grid">' +
      picks.map(function (r, idx) {
        return '<button class="relic-card" data-i="' + idx + '" style="--rc:' + r.color + '"><b>' + r.name + '</b><span class="relic-pos">' + r.pos + '</span><span class="relic-neg">' + r.neg + '</span></button>';
      }).join('') + '</div><p class="relic-tip">Boss 掉落 · 收益高，但会带负面效果</p></div></div>';
    document.body.appendChild(ov);
    function close() { g.relicPause = false; if (ov.parentNode) ov.remove(); }
    ov.querySelector('.guide-close').onclick = close;
    ov.querySelectorAll('.relic-card').forEach(function (b) {
      b.onclick = function () {
        var r = picks[Number(b.dataset.i)];
        apply(g, r);
        TJ.Feedback.addText(g, g.player.x, g.player.y - 50, '获得 ' + r.name, r.color, 22);
        if (TJ.Feedback && TJ.Feedback.sfx) TJ.Feedback.sfx(g, 'levelup');
        close();
      };
    });
  }
  TJ.Relics = { list: RELICS, offer: offer, apply: apply, owned: owned };
})();
