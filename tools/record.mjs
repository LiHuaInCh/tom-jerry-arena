import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const EDGE='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=9555, width=900, height=600;
const profile=path.join(os.tmpdir(),'tj-rec-'+Date.now());
const proc=spawn(EDGE,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run','--no-default-browser-check','--disable-extensions','--mute-audio','--force-device-scale-factor=1','--remote-debugging-port='+port,'--user-data-dir='+profile,'--window-size='+width+','+height,'about:blank'],{stdio:'ignore',windowsHide:true});
async function waitPort(){for(let i=0;i<100;i++){try{const r=await fetch('http://127.0.0.1:'+port+'/json/version');if(r.ok)return true;}catch(e){}await sleep(120);}return false;}
try{
  if(!await waitPort()) throw new Error('port');
  const list=await (await fetch('http://127.0.0.1:'+port+'/json/list')).json();
  const page=list.find(t=>t.type==='page');
  const ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
  let id=0; const pend=new Map();
  ws.onmessage=e=>{const m=JSON.parse(e.data); if(m.id&&pend.has(m.id)){const p=pend.get(m.id);pend.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}};
  const send=(method,params)=>{const i=++id;ws.send(JSON.stringify({id:i,method,params:params||{}}));return new Promise((res,rej)=>{pend.set(i,{resolve:res,reject:rej});setTimeout(()=>{if(pend.has(i)){pend.delete(i);rej(new Error('timeout '+method));}},30000);});};
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate',{url:'http://127.0.0.1:8126/?play=1&char=c08&god=1&auto=1&ff=1'});
  await sleep(3600);
  await send('Runtime.evaluate',{expression:"localStorage.setItem('tj_tut','1');localStorage.removeItem('tj_errlog');var eb=document.getElementById('errBadge');if(eb)eb.remove();var b=document.getElementById('tutGo');if(b)b.click();"});
  await sleep(2800);
  const dir=path.resolve('video_frames'); await fs.rm(dir,{recursive:true,force:true}); await fs.mkdir(dir,{recursive:true});
  for(let i=0;i<120;i++){
    const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true});
    await fs.writeFile(path.join(dir,'g'+String(i).padStart(4,'0')+'.png'),Buffer.from(shot.data,'base64'));
    await sleep(65);
  }
  ws.close();
  console.log('captured 120 frames');
}finally{try{proc.kill();}catch(e){}; try{await fs.rm(profile,{recursive:true,force:true,maxRetries:1});}catch(e){}}
