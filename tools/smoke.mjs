import fs from 'node:fs';
import vm from 'node:vm';
const ctx = { window: {}, console, Math, Set, Object, Array, Number, JSON, Date };
vm.createContext(ctx);
for (const f of ['js/data-chars.js', 'js/data-enemies.js', 'js/data.js', 'js/feedback.js', 'js/pickups.js', 'js/combat.js', 'js/systems.js', 'js/core.js', 'js/missions.js', 'js/arena.js', 'js/skills.js']) {
  vm.runInContext(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'), ctx, { filename: f });
}
const TJ = ctx.window.TJ;
function ok(name, cond) { if (!cond) { console.error('FAIL', name); process.exitCode = 1; } else console.log('ok', name); }

const g = TJ.createGame({ charId: 'jerry', seed: 42 });
ok('survival created', !!g.player && g.missions.length === 3);
for (let i = 0; i < 600; i++) TJ.update(g, 1 / 60, { moveX: 1, moveY: 0.3, dash: false });
ok('survival 10s finite', isFinite(g.player.x) && isFinite(g.player.hp));
ok('cheese system', Array.isArray(g.holes) && g.holes.length === 4);
ok('fusion table', Object.keys(TJ.DATA.fusions).length === 10);

const a = TJ.createArenaGame({ charId: 'tom', seed: 7 });
ok('arena created', a.fighters.length === 6);
for (let i = 0; i < 600; i++) TJ.updateArena(a, 1 / 60, TJ.botInput(a, a.player));
ok('arena 10s finite', a.fighters.every(f => isFinite(f.x) && isFinite(f.hp)));
ok('arena lives', a.player.lives <= 4);
