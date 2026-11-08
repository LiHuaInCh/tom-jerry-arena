import fs from 'node:fs'; import vm from 'node:vm';
const ctx={window:{},console,Math,Set,Object,Array,Number,JSON,Date}; vm.createContext(ctx);
for (const f of ['js/data-chars.js','js/data-enemies.js','js/data.js','js/feedback.js','js/pickups.js','js/combat.js','js/systems.js','js/core.js','js/missions.js','js/skills.js']) vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const TJ=ctx.window.TJ;
function run(charId, sec){
  const g=TJ.createGame({charId,seed:7});
  TJ.Core.spawnEnemy(g,'kitten',1,g.player.x+120,g.player.y);
  TJ.Core.spawnEnemy(g,'kitten',1,g.player.x-100,g.player.y+60);
  for(let i=0;i<sec*60;i++) TJ.update(g,1/60,{moveX:0,moveY:0});
  return {char:charId, kills:g.kills, traps:(g.traps||[]).length, moved:(g.traps||[]).map(t=>t.chase?Math.round(t.chase.moved):-1), summons:(g.summons||[]).length};
}
console.log(JSON.stringify(run('tuffy',5)));
console.log(JSON.stringify(run('m09',5)));
console.log(JSON.stringify(run('m14',5)));
