import fs from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {}, console, Math, Set, Object, Array, Number, JSON, Date };
vm.createContext(ctx);
for (const f of ['js/data-chars.js', 'js/data-enemies.js', 'js/data.js', 'js/feedback.js', 'js/pickups.js', 'js/combat.js', 'js/systems.js', 'js/core.js', 'js/arena.js', 'js/skills.js']) {
  vm.runInContext(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'), ctx, { filename: f });
}
const TJ = ctx.window.TJ;
const D = TJ.DATA;

function runMatch(seed, charId) {
  const g = TJ.createArenaGame({ seed, charId });
  g.player.isBot = true;
  const dt = 1 / 60;
  const maxSteps = Math.round(200 / dt);
  for (let i = 0; i < maxSteps; i++) {
    if (g.player.pendingLevels > 0) {
      const ch = TJ.getArenaChoices(g, g.player);
      if (ch.length) {
        const up = ch.find(c => c.kind === 'weapon_up') || ch.find(c => c.kind === 'stat') || ch[0];
        TJ.applyArenaChoice(g, g.player, up.key);
      } else g.player.pendingLevels = 0;
    }
    TJ.updateArena(g, dt, TJ.botInput(g, g.player));
    g.events.length = 0;
    if (g.over) break;
  }
  const rank = g.ranking || [];
  const idx = rank.indexOf(g.player);
  return {
    win: g.winner === g.player ? 1 : 0,
    place: idx >= 0 ? idx + 1 : rank.length,
    kills: g.player.kills,
    deaths: g.player.deaths,
    level: g.player.level,
    time: g.elapsed
  };
}

const chars = D.characters;
const N = Number(process.argv[2] || 4);
const rows = [];
for (const c of chars) {
  let wins = 0, top3 = 0, kills = 0, deaths = 0, place = 0, time = 0, lv = 0;
  for (let i = 0; i < N; i++) {
    const r = runMatch(9000 + i * 17 + chars.indexOf(c) * 31, c.id);
    wins += r.win; top3 += r.place <= 3 ? 1 : 0;
    kills += r.kills; deaths += r.deaths; place += r.place; time += r.time; lv += r.level;
  }
  rows.push({
    id: c.id, name: c.name, faction: c.faction, talent: c.talent ? c.talent.name : '',
    n: N, win: +(wins / N).toFixed(2), top3: +(top3 / N).toFixed(2),
    kills: +(kills / N).toFixed(1), deaths: +(deaths / N).toFixed(1),
    place: +(place / N).toFixed(2), time: +(time / N).toFixed(0), level: +(lv / N).toFixed(1)
  });
}
rows.sort((a, b) => b.win - a.win || b.kills - a.kills);
const csv = ['id,name,faction,talent,matches,win,top3,kills,deaths,place,time,level']
  .concat(rows.map(r => [r.id, r.name, r.faction, r.talent, r.n, r.win, r.top3, r.kills, r.deaths, r.place, r.time, r.level].join(',')))
  .join('\n');
fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/balance-arena.csv', csv);
console.log('TOP10');
for (const r of rows.slice(0, 10)) console.log(r.name.padEnd(6), 'win', r.win, 'kills', r.kills, 'place', r.place, 'talent', r.talent);
console.log('BOTTOM10');
for (const r of rows.slice(-10)) console.log(r.name.padEnd(6), 'win', r.win, 'kills', r.kills, 'place', r.place, 'talent', r.talent);
const avg = rows.reduce((s, r) => s + r.win, 0) / rows.length;
console.log('AVG win', avg.toFixed(3), 'chars', rows.length);
