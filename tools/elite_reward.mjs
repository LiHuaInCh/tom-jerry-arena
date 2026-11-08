import fs from 'node:fs'; import vm from 'node:vm';
const ctx={window:{},console,Math,Set,Object,Array,Number,JSON,Date}; vm.createContext(ctx);
for (const f of ['js/data-chars.js','js/data-enemies.js','js/data.js','js/feedback.js','js/pickups.js','js/combat.js','js/systems.js','js/core.js','js/missions.js','js/skills.js']) vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const TJ=ctx.window.TJ; const g=TJ.createGame({charId:'jerry',seed:5});
const e=TJ.Core.spawnEnemy(g,'tom',6,g.player.x+80,g.player.y); e.boss=false; e.elite=true; e.maxHp=e.hp=100;
const before=g.stats.lifesteal||0;
TJ.Combat.killEnemy(g,e);
console.log('bossRef',g.boss===e,'life',before,'->',g.stats.lifesteal,'orbs',g.pickups.length);
