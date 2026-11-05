import fs from 'node:fs';
import vm from 'node:vm';

const context = { window: {}, console, Math, Set, Object, Array, Number, JSON, Date };
vm.createContext(context);
for (const f of ['js/data.js', 'js/core.js', 'js/arena.js']) {
  vm.runInContext(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'), context, { filename: f });
}
const TJ = context.window.TJ;

function input(g) {
  const p = g.player;
  let best = null, bd = 1e9;
  for (const e of g.fighters) {
    if (e === p || !e.alive) continue;
    const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (d < bd) { bd = d; best = e; }
  }
  let x = 0, y = 0, dash = false;
  if (best) {
    const ux = (best.x - p.x) / bd, uy = (best.y - p.y) / bd;
    if (bd < 240) { x = -ux; y = -uy; }
    else if (bd > 520) { x = ux; y = uy; }
    else { x = -uy * 0.9 + ux * 0.2; y = ux * 0.9 + uy * 0.2; }
    if (p.hp < p.maxHp * 0.35 && bd < 250) dash = true;
  } else {
    let pk = null, pd = 1e9;
    for (const q of g.pickups) { const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < pd) { pd = d; pk = q; } }
    if (pk) { x = (pk.x - p.x) / pd; y = (pk.y - p.y) / pd; }
  }
  return { moveX: x, moveY: y, dash };
}

function run(seed, charId) {
  const g = TJ.createArenaGame({ seed, charId });
  const dt = 1 / 60, steps = Math.round(200 / dt);
  let levels = 0, switches = 0, evolutions = 0, bad = 0, maxProj = 0, killEvents = 0;
  for (let i = 0; i < steps; i++) {
    if (g.player.pendingLevels > 0) {
      const ch = TJ.getArenaChoices(g, g.player);
      if (ch.length) {
        const pick = ch[Math.floor(Math.random() * ch.length)];
        if (pick.kind === 'switch') switches++;
        if (pick.kind === 'weapon_up') evolutions++;
        levels++;
        TJ.applyArenaChoice(g, g.player, pick.key);
      } else g.player.pendingLevels = 0;
    }
    TJ.updateArena(g, dt, input(g));
    for (const ev of g.events) if (ev.type === 'kill') killEvents++;
    g.events.length = 0;
    maxProj = Math.max(maxProj, g.projectiles.length);
    if (i % 60 === 0) {
      for (const f of g.fighters) {
        if (!isFinite(f.x) || !isFinite(f.y) || !isFinite(f.hp)) { bad++; console.log('NAN', f.name); }
        if (f.hp < 0) { bad++; console.log('NEG', f.name, f.hp, f.maxHp, f.alive); }
        if (f.hp > f.maxHp + 1e-6) { bad++; console.log('OVER', f.name, f.hp, f.maxHp); }
        if (f.lives < 0 || f.lives > 4) { bad++; console.log('LIVES', f.name, f.lives); }
      }
    }
    if (g.over) break;
  }
  return {
    seed, charId, t: +g.elapsed.toFixed(1), over: g.over, matchOver: g.matchOver,
    reason: g.endReason, winner: g.winner && g.winner.name,
    ranking: g.ranking.map(f => f.name + ':' + f.kills + '/' + f.deaths + '/Lv' + f.level + '/' + f.weapon + f.weaponLv),
    player: { kills: g.player.kills, deaths: g.player.deaths, level: g.player.level, weapon: g.player.weapon, wlv: g.player.weaponLv, lives: g.player.lives },
    levels, swaps: switches, evolutions, killEvents, maxProj, bad
  };
}

const out = ['jerry', 'tuffy', 'robin', 'detective', 'swordsman'].map((c, i) => run(1000 + i, c));
const a = run(7, 'jerry'), b = run(7, 'jerry');
console.log(JSON.stringify({ out, deterministic: JSON.stringify(a) === JSON.stringify(b) }, null, 2));
