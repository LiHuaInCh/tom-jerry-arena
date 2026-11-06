import fs from 'node:fs'; import vm from 'node:vm';
const c = { window: {} }; vm.createContext(c);
vm.runInContext(fs.readFileSync('js/data.js','utf8'), c);
const D = c.window.TJ.DATA;
const rows = D.characters.map(ch => {
  const w = D.weapons[ch.weapon] || {};
  const s = ch.skill || {};
  const t = ch.talent || {};
  return {
    id: ch.id, name: ch.name, faction: ch.faction === 'mouse' ? '鼠' : '猫',
    title: ch.title || '', perk: ch.perk || '', desc: ch.desc || '',
    hp: ch.hp, speed: ch.speed,
    wname: w.name || '', wkind: w.kind || '', wdmg: w.dmg || 0, wcd: w.cd || 0, wrange: w.range || w.orbitR || 0,
    sname: s.name || '', skind: s.kind || '', scd: s.cd || 0,
    tname: t.name || '', tdesc: t.desc || ''
  };
});
fs.writeFileSync('docs/chars.json', JSON.stringify({ chars: rows, fusions: D.fusions }, null, 1));
