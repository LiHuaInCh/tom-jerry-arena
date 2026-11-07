import fs from 'node:fs'; import vm from 'node:vm';
const ctx = { window:{}, console, Math, Set, Object, Array, Number, JSON, Date };
vm.createContext(ctx);
for (const f of ['js/data-chars.js','js/data-enemies.js','js/data.js','js/feedback.js','js/pickups.js','js/combat.js','js/systems.js','js/core.js','js/missions.js','js/arena.js','js/skills.js']) {
  vm.runInContext(fs.readFileSync(f,'utf8'), ctx, { filename: f });
}
const TJ = ctx.window.TJ;
function run(charId, seed, frames) {
  const g = TJ.createGame({ charId, seed });
  for (let i = 0; i < frames; i++) {
    if (g.pendingLevels > 0) { const ch = TJ.getUpgradeChoices(g); if (ch.length) TJ.applyUpgrade(g, ch[0].id); else g.pendingLevels = 0; }
    try { TJ.update(g, 1/60, { moveX: Math.sin(i/40), moveY: Math.cos(i/53), dash: i%300===0 }); }
    catch (e) { console.log('THROW', charId, 'frame', i, 'wave', g.wave, e && e.stack ? e.stack.split('\n').slice(0,4).join(' | ') : e); return; }
    g.events.length = 0;
    if (g.over) { console.log('dead', charId, 'frame', i, 'wave', g.wave); return; }
  }
  console.log('ok', charId, 'frames', frames, 'wave', g.wave, 'kills', g.kills);
}
run('jerry', 1, 22000);
run('tom', 2, 22000);
