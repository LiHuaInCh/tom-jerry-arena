import fs from 'node:fs'; import vm from 'node:vm';
const ctx={window:{},console,Math,Set,Object,Array,Number,JSON,Date}; vm.createContext(ctx);
for (const f of ['js/data-chars.js','js/data-enemies.js','js/data.js','js/feedback.js','js/pickups.js','js/combat.js','js/systems.js','js/core.js','js/missions.js','js/skills.js']) vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const TJ=ctx.window.TJ; const g=TJ.createGame({charId:'jerry',seed:5});
g.projectiles.push({x:g.player.x+30,y:g.player.y,vx:0,vy:0,r:6,life:2,dmg:10,from:'enemy',kind:'bolt',hit:{}});
g.projectiles.push({x:g.player.x+400,y:g.player.y,vx:0,vy:0,r:6,life:0.02,dmg:10,from:'enemy',kind:'bolt',hit:{}});
TJ.update(g,1/60,{moveX:0,moveY:0});
console.log('bullets',g.projectiles.filter(p=>p.from==='enemy'&&!p.dead).length,'dead',g.projectiles.filter(p=>p.dead).length);
