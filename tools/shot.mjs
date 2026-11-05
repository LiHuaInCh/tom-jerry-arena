import { spawn } from 'node:child_process';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function waitForPort(port, timeout = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    try {
      const r = await fetch('http://127.0.0.1:' + port + '/json/version');
      if (r.ok) return true;
    } catch (e) {}
    await sleep(120);
  }
  return false;
}

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map(); this.events = []; this.logs = [];
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) {
        const p = this.pending.get(m.id); this.pending.delete(m.id);
        if (m.error) p.reject(new Error(JSON.stringify(m.error))); else p.resolve(m.result);
      } else {
        this.events.push(m);
        if (m.method === 'Runtime.consoleAPICalled') {
          this.logs.push('console.' + m.params.type + ': ' + m.params.args.map(a => a.value !== undefined ? a.value : a.description).join(' '));
        } else if (m.method === 'Runtime.exceptionThrown') {
          this.logs.push('EXCEPTION: ' + JSON.stringify(m.params.exceptionDetails.exception).slice(0, 400));
        } else if (m.method === 'Log.entryAdded') {
          this.logs.push('LOG ' + m.params.entry.level + ': ' + m.params.entry.text);
        }
      }
    };
  }
  send(method, params) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params: params || {} }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('timeout ' + method)); } }, 30000);
    });
  }
  async eval(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return r.result ? r.result.value : undefined;
  }
}

export async function capture(spec) {
  const width = spec.w || 1440, height = spec.h || 900;
  const port = 9400 + Math.floor(Math.random() * 400);
  const profile = path.join(os.tmpdir(), 'tj-edge-' + Date.now() + '-' + port);
  const args = [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--no-default-browser-check', '--disable-extensions', '--mute-audio',
    '--force-device-scale-factor=1',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + profile,
    '--window-size=' + width + ',' + height,
    'about:blank'
  ];
  const proc = spawn(EDGE, args, { stdio: 'ignore', windowsHide: true });
  try {
    if (!await waitForPort(port)) throw new Error('devtools port not ready');
    const list = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
    const page = list.find(t => t.type === 'page');
    if (!page) throw new Error('no page target');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    const cdp = new CDP(ws);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Log.enable');
    if (spec.mobile) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 2, mobile: true });
      await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    }
    await cdp.send('Page.navigate', { url: spec.url });
    await sleep(spec.wait || 2500);
    for (const a of (spec.actions || [])) {
      if (a.eval) await cdp.eval(a.eval);
      if (a.click) await cdp.eval('document.querySelector(' + JSON.stringify(a.click) + ').click()');
      if (a.sleep) await sleep(a.sleep);
    }
    const shotOpts = { format: 'png', fromSurface: true };
    if (spec.clip) shotOpts.clip = { x: 0, y: 0, width: spec.clip.w, height: spec.clip.h, scale: 1 };
    if (spec.clip) shotOpts.captureBeyondViewport = true;
    const shot = await cdp.send('Page.captureScreenshot', shotOpts);
    const out = path.resolve('shots/' + spec.name + '.png');
    await fs.mkdir(path.dirname(out), { recursive: true });
    await fs.writeFile(out, Buffer.from(shot.data, 'base64'));
    if (spec.probe) console.log('  probe:', JSON.stringify(await cdp.eval(spec.probe)));
    const summary = await cdp.eval('location.href + " | state=" + (window.__tjState||"?") + " | errs=" + (window.__tjErrs||0)');
    console.log(spec.name, 'ok', summary || '');
    if (cdp.logs.length) console.log('  logs:', cdp.logs.slice(0, 12).join(' || '));
    ws.close();
  } catch (e) {
    console.log(spec.name, 'FAIL', String(e).slice(0, 300));
  } finally {
    try { spawnSync('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (e) {}
    try { await fs.rm(profile, { recursive: true, force: true, maxRetries: 2 }); } catch (e) {}
  }
}

const specs = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
for (const s of specs) await capture(s);
