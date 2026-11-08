/* 局外成长 v2：等级 / 熟练度 / 徽章 / 符文 */
(function () {
  const TJ = (window.TJ = window.TJ || {});
  const KEY = 'tj_meta_v2', OLD = 'tj_meta_v1';
  const def = { xp: 0, level: 1, wins: 0, covWins: 0, chars: {}, badges: {}, runes: {} };
  let m = null;
  try { m = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (!m) {
    let o = null;
    try { o = JSON.parse(localStorage.getItem(OLD)); } catch (e) {}
    m = o ? { xp: o.xp || 0, level: o.level || 1, wins: o.wins || 0, covWins: o.covWins || 0, chars: o.chars || {}, badges: o.badges || {}, runes: {} } : JSON.parse(JSON.stringify(def));
    try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {}
  }
  if (!m.chars) m.chars = {};
  if (!m.badges) m.badges = {};
  if (!m.runes) m.runes = {};
  const RUNES = {
    sharp: { name: '锐利', desc: '伤害 +2%/级' },
    swift: { name: '疾行', desc: '移速 +1.5%/级' },
    learn: { name: '求知', desc: '经验 +3%/级' },
    tough: { name: '坚韧', desc: '生命 +2%/级' },
    armor: { name: '护甲', desc: '护甲 +0.5%/级，移速 -0.25%/级' }
  };
  function save() { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {} }
  function levelFor(xp) { let lv = 1, need = 100, left = xp; while (left >= need && lv < 60) { left -= need; lv++; need = 100 + (lv - 1) * 60; } return { level: Math.min(60, lv), into: left, need: need }; }
  function totalPoints() { return Math.min(30, Math.floor(levelFor(m.xp).level / 2)); }
  function spentPoints() { let s = 0; for (const k in m.runes) s += m.runes[k] || 0; return s; }
  TJ.meta = {
    get level() { return m.level; },
    get data() { return m; },
    RUNES: RUNES,
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
    spend(id) { if (spentPoints() >= totalPoints() || (m.runes[id] || 0) >= 50) return false; m.runes[id] = (m.runes[id] || 0) + 1; save(); return true; },
    refund(id) { if ((m.runes[id] || 0) <= 0) return false; m.runes[id]--; save(); return true; },
    resetRunes() { m.runes = {}; save(); },
    bonuses() { return { dmg: 0.02 * (m.runes.sharp || 0), speed: 0.015 * (m.runes.swift || 0) - 0.0025 * (m.runes.armor || 0), xp: 0.03 * (m.runes.learn || 0), hp: 0.02 * (m.runes.tough || 0), armor: 0.005 * (m.runes.armor || 0) }; }
  };
})();
