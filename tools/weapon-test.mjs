import fs from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {}, console, Math, Set, Object, Array, Number, JSON, Date };
vm.createContext(ctx);
for (const f of ['js/data-chars.js','js/data-enemies.js','js/data.js','js/feedback.js','js/pickups.js','js/combat.js','js/systems.js','js/core.js','js/missions.js','js/skills.js']) {
  vm.runInContext(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'), ctx, { filename: f });
}
const TJ = ctx.window.TJ;
const D = TJ.DATA;

function kite(g) {
  const p = g.player;
  let best = null, bd = 1e9;
  for (const e of g.enemies) { const d = Math.hypot(e.x - p.x, e.y - p.y); if (d < bd) { bd = d; best = e; } }
  let x = 0, y = 0, dash = false;
  if (best) {
    if (bd < 300) { x = (p.x - best.x) / bd; y = (p.y - best.y) / bd; }
    else { const tx = (best.x - p.x) / bd, ty = (best.y - p.y) / bd; x = -ty * 0.8 + tx * 0.15; y = tx * 0.8 + ty * 0.15; }
  } else {
    let bx = 0, by = 0, pd = 1e9;
    for (const q of g.pickups) { const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < pd) { pd = d; bx = q.x; by = q.y; } }
    if (pd < 900) { x = (bx - p.x) / pd; y = (by - p.y) / pd; }
  }
  const m = 260, cx = p.x < m ? 1 : (p.x > g.W - m ? -1 : 0), cy = p.y < m ? 1 : (p.y > g.H - m ? -1 : 0);
  x += cx * 1.3; y += cy * 1.3;
  let near = 0;
  for (const e of g.enemies) if (Math.hypot(e.x - p.x, e.y - p.y) < 130) near++;
  dash = near >= 2 || g.rng() < 0.001;
  const len = Math.hypot(x, y) || 1;
  return { moveX: x / len, moveY: y / len, dash };
}

const PRIORITY = ['power', 'haste', 'multishot', 'pierce', 'vitality', 'crit', 'leech', 'shield'];

function run(seed, charId, maxSeconds) {
  const g = TJ.createGame({ seed, charId });
  const dt = 1 / 60, steps = Math.round(maxSeconds / dt);
  for (let i = 0; i < steps; i++) {
    if (g.pendingLevels > 0) {
      const ch = TJ.getUpgradeChoices(g);
      if (ch.length) {
        let pick = ch.find(c => c.id && c.id.indexOf('elem') === 0);
        if (!pick) for (const id of PRIORITY) { pick = ch.find(c => c.id === id); if (pick) break; }
        if (!pick) pick = ch[0];
        TJ.applyUpgrade(g, pick.id);
      } else g.pendingLevels = 0;
    }
    TJ.update(g, dt, kite(g));
    g.events.length = 0;
    if (g.over) break;
  }
  const wave = Math.floor(g.elapsed / 25) + 1;
  return { dead: !!g.over, wave: g.over ? wave : 0, time: g.elapsed, kills: g.kills, level: g.player.level };
}

const IDS = ['c01','m06','detective','m07','tuffy','c15','swordsman','m02','tom','jerry','butch','m11','c06','m18','c13','c03','m09','m14'];
const chars = D.characters.filter(function (c) { return IDS.indexOf(c.id) >= 0; });
const N = Number(process.argv[2] || 1);
const rows = [];
for (const c of chars) {
  let deaths = 0, waveSum = 0, timeSum = 0, kills = 0, lvl = 0, reach5 = 0, reach10 = 0, reach15 = 0;
  for (let i = 0; i < N; i++) {
    const r = run(7000 + i * 13 + chars.indexOf(c) * 7, c.id, 380);
    if (r.dead) { deaths++; waveSum += r.wave; }
    timeSum += r.time; kills += r.kills; lvl += r.level;
    if (r.dead ? r.wave >= 5 : true) reach5++;
    if (r.dead ? r.wave >= 10 : true) reach10++;
    if (r.dead ? r.wave >= 15 : true) reach15++;
  }
  rows.push({
    id: c.id, name: c.name, faction: c.faction, n: N,
    deathRate: +(deaths / N).toFixed(2),
    avgWave: +(waveSum / Math.max(1, deaths)).toFixed(1),
    reach5: +(reach5 / N).toFixed(2), reach10: +(reach10 / N).toFixed(2), reach15: +(reach15 / N).toFixed(2),
    avgTime: +(timeSum / N).toFixed(0), kills: +(kills / N).toFixed(0), level: +(lvl / N).toFixed(1)
  });
}
const csv = ['id,name,faction,matches,deathRate,avgDeathWave,reach5,reach10,reach15,avgTime,kills,level']
  .concat(rows.map(r => [r.id, r.name, r.faction, r.n, r.deathRate, r.avgWave, r.reach5, r.reach10, r.reach15, r.avgTime, r.kills, r.level].join(',')))
  .join('\n');
fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/balance-survival.csv', csv);
const agg = rows.reduce((a, r) => { a.death += r.deathRate; a.w5 += r.reach5; a.w10 += r.reach10; a.w15 += r.reach15; a.t += r.avgTime; return a; }, { death: 0, w5: 0, w10: 0, w15: 0, t: 0 });
const n = rows.length;
console.log('chars', n, 'avgDeathRate', (agg.death / n).toFixed(2), 'reach5', (agg.w5 / n).toFixed(2), 'reach10', (agg.w10 / n).toFixed(2), 'reach15', (agg.w15 / n).toFixed(2), 'avgTime', (agg.t / n).toFixed(0));
rows.sort((a, b) => b.reach10 - a.reach10 || b.kills - a.kills);
console.log('TOP10'); rows.slice(0, 10).forEach(r => console.log(r.name, 'reach10', r.reach10, 'wave', r.avgWave, 'kills', r.kills, 'lvl', r.level));
console.log('ALL'); rows.slice(0, 99).forEach(r => console.log(r.name, 'reach10', r.reach10, 'wave', r.avgWave, 'kills', r.kills, 'lvl', r.level));
