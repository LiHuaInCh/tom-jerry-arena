import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const EDGE='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function waitPort(p){for(let i=0;i<150;i++){try{const r=await fetch('http://127.0.0.1:'+p+'/json/version');if(r.ok)return true;}catch(e){}await sleep(120);}return false;}
const port=9900+Math.floor(Math.random()*60);
const profile=path.join(os.tmpdir(),'tj-rec-'+Date.now());
const proc=spawn(EDGE,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run','--no-default-browser-check','--disable-extensions','--mute-audio','--force-device-scale-factor=1','--remote-debugging-port='+port,'--user-data-dir='+profile,'--window-size=1280,720','about:blank'],{stdio:'ignore',windowsHide:true});
await waitPort(port);
const list=await (await fetch('http://127.0.0.1:'+port+'/json/list')).json();
const page=list.find(t=>t.type==='page');
const ws=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){const p=pend.get(m.id);pend.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Page.screencastFrame'){onFrame(m.params);}};
const send=(method,params)=>new Promise((resolve,reject)=>{const i=++id;pend.set(i,{resolve,reject});ws.send(JSON.stringify({id:i,method,params:params||{}}));});
const ev=async expr=>{const r=await send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});return r.result?r.result.value:undefined;};
await send('Page.enable');await send('Runtime.enable');
const specs=JSON.parse(await fs.readFile('tools/clips.json','utf8'));
let cur=null,frames=0,t0=0,recording=false;
async function onFrame(p){
  if(!cur||!recording) return;
  frames++;
  const file=path.join('shots/clips',cur.name,String(frames).padStart(5,'0')+'.jpg');
  await fs.writeFile(file,Buffer.from(p.data,'base64'));
  try{await send('Page.screencastFrameAck',{sessionId:p.sessionId});}catch(e){}
  if(Date.now()-t0>cur.duration){cur.end=true;}
}
for(const spec of specs){
  cur=spec;frames=0;
  await fs.rm('shots/clips/'+spec.name,{recursive:true,force:true});
  await fs.mkdir('shots/clips/'+spec.name,{recursive:true});
  await send('Page.navigate',{url:spec.url});
  await sleep(spec.wait||2500);
  for(const a of (spec.actions||[])){ if(a.eval) await ev(a.eval); if(a.sleep) await sleep(a.sleep); }
  t0=Date.now(); recording=true;
  await send('Page.startScreencast',{format:'jpeg',quality:82,maxWidth:1280,maxHeight:720,everyNthFrame:1});
  while(!cur.end) await sleep(200);
  await send('Page.stopScreencast'); recording=false; await sleep(350);
  console.log(spec.name,frames,'frames',((Date.now()-t0)/1000).toFixed(1)+'s');
  cur=null;
}
ws.close();proc.kill();
