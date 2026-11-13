/* 局外成长 v2：等级 / 熟练度 / 徽章 / 符文 */
(function () {
  const TJ = (window.TJ = window.TJ || {});
  const KEY = 'tj_meta_v2', OLD = 'tj_meta_v1';
  const def = { v: 2, xp: 0, level: 1, wins: 0, covWins: 0, chars: {}, badges: {}, runes: {} };
  let m = null;
  try { m = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (!m) {
    let o = null;
    try { o = JSON.parse(localStorage.getItem(OLD)); } catch (e) {}
    m = o ? { xp: o.xp || 0, level: o.level || 1, wins: o.wins || 0, covWins: o.covWins || 0, chars: o.chars || {}, badges: o.badges || {}, runes: {} } : JSON.parse(JSON.stringify(def));
    try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {}
  }
  if (!m.v) m.v = 1;
  if (m.v > 2) { m = JSON.parse(JSON.stringify(def)); }
  m.v = 2;
  if (!m.chars) m.chars = {};
  if (!m.badges) m.badges = {};
  if (!m.runes) m.runes = {};
  Object.keys(m.runes).forEach(function (k) { if (m.runes[k] > 30) m.runes[k] = 30; });
  const RUNE_MAX = 30;
  const RUNES = {
    sharp: { name: '锐利', desc: '伤害 +1.2%/级（最高 30 级）' },
    swift: { name: '疾行', desc: '移速 +1%/级（最高 30 级）' },
    learn: { name: '求知', desc: '经验 +2%/级（最高 30 级）' },
    tough: { name: '坚韧', desc: '生命 +1.5%/级（最高 30 级）' },
    armor: { name: '护甲', desc: '护甲 +0.4%/级，移速 -0.15%/级（最高 30 级）' },
    luck: { name: '幸运', desc: '史诗升级卡权重 +2%/级（最高 30 级）' },
    crit: { name: '锐眼', desc: '暴击率 +0.7%/级（最高 30 级）' },
    critdmg: { name: '致命', desc: '暴击伤害 +1.5%/级（最高 30 级）' },
    haste: { name: '急速', desc: '攻击速度 +0.8%/级（最高 30 级）' },
    skill: { name: '秘法', desc: '技能冷却 -0.6%/级（最高 30 级）' },
    magnet: { name: '磁力', desc: '拾取范围 +4/级（最高 30 级）' },
    pen: { name: '破甲', desc: '无视护甲 +0.8%/级（最高 30 级）' }
  };
  function save() { try { m.v = 2; localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {} }
  function levelFor(xp) { let lv = 1, need = 100, left = Math.max(0, xp); while (left >= need) { left -= need; lv++; need = 100 + (lv - 1) * 60; } return { level: lv, into: left, need: need }; }
  function totalPoints() { return Math.floor(levelFor(m.xp).level / 2); }
  function spentPoints() { let s = 0; for (const k in m.runes) s += m.runes[k] || 0; return s; }
  TJ.meta = {
    get level() { return m.level; },
    get data() { return m; },
    RUNES: RUNES,
    RUNE_MAX: RUNE_MAX,
    addUse(id) { return; },
    addRun(o) {
      const gain = Math.max(0, Math.round((o.score || 0) / 10) + (o.kills || 0) * 2);
      m.xp += gain; m.level = levelFor(m.xp).level;
      if (o.win) m.wins++;
      if (o.cov) m.covWins++;
      save(); return gain;
    },
    charLv(id) { return 1; },
    award(id) { if (!m.badges[id]) { m.badges[id] = 1; save(); return true; } return false; },
    levelInfo() { return levelFor(m.xp); },
    points() { return { total: totalPoints(), spent: spentPoints() }; },
    runeLv(id) { return m.runes[id] || 0; },
    spend(id) { if (spentPoints() >= totalPoints() || (m.runes[id] || 0) >= RUNE_MAX) return false; m.runes[id] = (m.runes[id] || 0) + 1; save(); return true; },
    refund(id) { if ((m.runes[id] || 0) <= 0) return false; m.runes[id]--; save(); return true; },
    resetRunes() { m.runes = {}; save(); },
    bonuses() { const r = function (k) { return Math.min(RUNE_MAX, m.runes[k] || 0); }; return { dmg: 0.012 * r('sharp'), speed: 0.01 * r('swift') - 0.0015 * r('armor'), xp: 0.02 * r('learn'), hp: 0.015 * r('tough'), armor: 0.004 * r('armor'), luck: 0.02 * r('luck'), crit: 0.007 * r('crit'), critMul: 0.015 * r('critdmg'), fireRate: 0.008 * r('haste'), skillCd: 0.006 * r('skill'), magnet: 4 * r('magnet'), pen: 0.008 * r('pen') }; }
  };
})();
