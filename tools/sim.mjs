import fs from 'node:fs';
import vm from 'node:vm';

const context = { window: {}, console, Math, Set, Object, Array, Number, JSON, Date };
vm.createContext(context);
for (const f of ['js/data.js', 'js/core.js']) {
  vm.runInContext(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'), context, { filename: f });
}
const TJ = context.window.TJ;

function prng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

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
  const m = 260; let cx = 0, cy = 0;
  if (p.x < m) cx += 1; else if (p.x > g.W - m) cx -= 1;
  if (p.y < m) cy += 1; else if (p.y > g.H - m) cy -= 1;
  x += cx * 1.3; y += cy * 1.3;
  let near = 0;
  for (const e of g.enemies) if (Math.hypot(e.x - p.x, e.y - p.y) < 130) near++;
  dash = near >= 2 || g.rng() < 0.001;
  const len = Math.hypot(x, y) || 1;
  return { moveX: x / len, moveY: y / len, dash };
}

function run(seed, charId, seconds) {
  const g = TJ.createGame({ seed, charId });
  const dt = 1 / 60, steps = Math.round(seconds / dt);
  let upgrades = 0, bosses = 0, firstBoss = 0, maxEnemies = 0, dmgTaken = 0;
  let picked = 'balanced';
  for (let i = 0; i < steps; i++) {
    if (g.pendingLevels > 0) {
      const ch = TJ.getUpgradeChoices(g);
      if (ch.length) {
        // 偏好：先拿伤害/攻速/多重，再生存
        const pref = ['multishot','power','haste','pierce','crit','vitality','leech','shield','dodge','explosive','homing'];
        ch.sort((a,b)=>pref.indexOf(a.id)-pref.indexOf(b.id));
        TJ.applyUpgrade(g, ch[0].id); upgrades++;
      } else g.pendingLevels = 0;
    }
    TJ.update(g, dt, kite(g));
    for (const ev of g.events) { if (ev.type === 'boss') { bosses++; if (!firstBoss) firstBoss = g.t; } }
    g.events.length = 0;
    maxEnemies = Math.max(maxEnemies, g.enemies.length);
    if (g.over) break;
  }
  return { charId, t: +g.t.toFixed(1), wave: g.wave, level: g.level, kills: g.kills, score: g.score, over: g.over, upgrades, bosses, firstBoss: +firstBoss.toFixed(1), maxEnemies };
}

const out = [];
for (const ch of ['jerry','tuffy','swordsman','robin','detective']) out.push(run(2026 + ch.length, ch, 420));
const a = run(5,'jerry',60), b = run(5,'jerry',60);
console.log(JSON.stringify({ out, deterministic: JSON.stringify(a)===JSON.stringify(b) }, null, 2));
